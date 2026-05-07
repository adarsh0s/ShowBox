import { handleProxy } from './proxy.js';
import { handleStream, buildManifest } from './addon.js';
import { handleValidateCookie, handleFebboxFlow } from './febbox.js';
import { CONFIG_HTML } from './ui.js';

function decodeConfig(b64) {
    let s = b64.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return JSON.parse(atob(s));
}

function handlePreflight(request) {
    const origin = request.headers.get("origin") || "*";
    return new Response(null, {
        status: 204,
        headers: {
            "access-control-allow-origin": origin,
            "access-control-allow-methods": "GET, HEAD, POST, OPTIONS",
            "access-control-allow-headers": request.headers.get("access-control-request-headers") || "Range, Content-Type",
            "access-control-max-age": "86400",
            ...(request.headers.get("origin") ? { "access-control-allow-credentials": "true" } : {})
        }
    });
}

function jsonResponse(data, status = 200, cacheAge = 0) {
    const headers = {
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*"
    };
    if (cacheAge > 0) {
        // Cache valid responses
        headers["cache-control"] = `public, max-age=${cacheAge}, s-maxage=${cacheAge}, stale-while-revalidate=${cacheAge * 2}`;
    } else {
        // Force Stremio & Cloudflare to NOT cache empty/error responses
        headers["cache-control"] = "no-cache, no-store, must-revalidate";
    }
    return new Response(JSON.stringify(data), { status, headers });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const proxyBase = url.origin;
        const tmdbApiKey = env.TMDB_API_KEY || "439c478a771f35c05022f9feabcca01c";

        if (request.method === "OPTIONS") return handlePreflight(request);

        // API Endpoints
        if (path === "/proxy") return handleProxy(request, env);
        if (path === "/api/validate-cookie" && request.method === "POST") return handleValidateCookie(request);
        if (path === "/api/febbox-flow" && request.method === "POST") return handleFebboxFlow(request);

        // Config UI
        if (path === "/" || path === "/configure") {
            return new Response(CONFIG_HTML, { headers: { "content-type": "text/html;charset=UTF-8" } });
        }

        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        
        if (request.method === "GET" && path.endsWith(".json")) {
            const cachedResp = await cache.match(cacheKey);
            if (cachedResp) return cachedResp; 
        }

        let response;

        const processStreamResponse = async (type, id, config) => {
            try {
                let decodedId = decodeURIComponent(id);
                const data = await handleStream(request, type, decodedId, config, proxyBase, tmdbApiKey);
                
                // CRITICAL FIX: Do NOT cache if streams are completely empty, or if it's a dummy error stream.
                if (!data.streams || data.streams.length === 0 || (data.streams[0].name && data.streams[0].name.includes("⚠️"))) {
                    return jsonResponse(data, 200, 0); 
                }
                
                // Only cache successful, populated stream responses for 2 hours.
                return jsonResponse(data, 200, 7200);
            } catch (e) {
                return jsonResponse({ streams: [{ name: "⚠️ ShowBox Error", title: `Internal Error: ${e.message}`, url: "http://dummy-error.com/video.mp4" }] }, 200, 0);
            }
        };

        // Addon Routes (No Config)
        if (path === "/manifest.json") {
            response = jsonResponse(buildManifest({}), 200, 86400); // Manifests can be safely cached for 24h
        } else {
            const streamMatchNoConfig = path.match(/^\/stream\/(movie|series)\/(.+)\.json$/);
            if (streamMatchNoConfig) {
                response = await processStreamResponse(streamMatchNoConfig[1], streamMatchNoConfig[2], {});
            }
        }

        // Addon Routes (With Config)
        if (!response) {
            const configMatch = path.match(/^\/([^/]+)\/(configure|manifest\.json|stream\/(movie|series)\/(.+)\.json)$/);
            if (configMatch) {
                const [, b64, sub, type, id] = configMatch;
                let config = {};
                try { config = decodeConfig(b64); } catch (e) { console.error("Config decode failed:", e); }

                if (sub === "configure") {
                    return new Response(CONFIG_HTML, { headers: { "content-type": "text/html;charset=UTF-8" } });
                }
                if (sub === "manifest.json") {
                    response = jsonResponse(buildManifest(config), 200, 86400); 
                } else {
                    response = await processStreamResponse(type, id, config);
                }
            }
        }

        if (!response) return new Response("Not found", { status: 404 });

        // Store the response in Cloudflare Edge Cache ONLY IF it has a valid max-age
        // (Our updated processStreamResponse ensures empty arrays do NOT get a max-age header)
        if (response.status === 200 && response.headers.get("cache-control").includes("max-age")) {
            ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }

        return response;
    }
};

export async function handleProxy(request, env) {
    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
                "Access-Control-Max-Age": "86400"
            }
        });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get("url");
    if (!target) return new Response("Missing target URL", { status: 400 });

    const upstreamHeaders = new Headers();
    if (request.headers.has("range")) upstreamHeaders.set("range", request.headers.get("range"));
    if (request.headers.has("if-range")) upstreamHeaders.set("if-range", request.headers.get("if-range"));

    // Spoof a standard PC browser
    upstreamHeaders.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
    upstreamHeaders.set("accept-encoding", "identity"); // Prevents CDN chunking

    const response = await fetch(target, {
        method: request.method,
        headers: upstreamHeaders,
        redirect: "follow" // Let Cloudflare handle redirects safely
    });

    const clientHeaders = new Headers(response.headers);
    clientHeaders.set("access-control-allow-origin", "*");
    clientHeaders.set("access-control-expose-headers", "Content-Length, Content-Range, Accept-Ranges, Content-Type");

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const isM3U8 = target.includes(".m3u8") || contentType.includes("mpegurl") || contentType.includes("apple.mpegurl");

    // --- INFUSE HLS PLAYLIST HANDLING ---
    if (isM3U8) {
        // Force Apple's strict MIME type to trigger the HLS engine, regardless of the .mkv URL extension
        clientHeaders.set("content-type", "application/vnd.apple.mpegurl");
        clientHeaders.delete("content-disposition");
        
        // CRITICAL: Delete Content-Length for M3U8. 
        // Our rewriting changes the file size. Mismatched Content-Length causes Infuse to timeout/fail.
        clientHeaders.delete("content-length");

        if (request.method === "GET") {
            let text = await response.text();

            // M3U8 Rewriter: Append clean extensions so Infuse routes the internal chunks correctly
            text = text.replace(/URI="(.*?)"/g, (match, p1) => {
                let absoluteUrl = p1;
                if (!p1.startsWith('http')) {
                    try { absoluteUrl = new URL(p1, target).toString(); } catch (e) { return match; }
                }
                const ext = absoluteUrl.includes('.m3u8') ? '.m3u8' : (absoluteUrl.includes('.ts') ? '.ts' : '');
                return `URI="${url.origin}/proxy/hls${ext}?url=${encodeURIComponent(absoluteUrl)}"`;
            });

            const rewrittenLines = text.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return line; 
                
                let absoluteUrl = trimmed;
                if (!trimmed.startsWith('http')) {
                    try { absoluteUrl = new URL(trimmed, target).toString(); } catch (e) { return line; }
                }
                const ext = absoluteUrl.includes('.m3u8') ? '.m3u8' : (absoluteUrl.includes('.ts') ? '.ts' : '');
                return `${url.origin}/proxy/hls${ext}?url=${encodeURIComponent(absoluteUrl)}`;
            });

            return new Response(rewrittenLines.join('\n'), {
                status: response.status,
                statusText: response.statusText,
                headers: clientHeaders
            });
        } else {
            // For HEAD requests, return clean headers with NO body (prevents Infuse from crashing)
            return new Response(null, {
                status: response.status,
                statusText: response.statusText,
                headers: clientHeaders
            });
        }
    }

    // --- NORMAL VIDEO FILES OR .TS CHUNKS ---
    if (!clientHeaders.has("accept-ranges")) clientHeaders.set("accept-ranges", "bytes");
    
    // Ensure .ts chunks are recognized by Infuse
    if (!clientHeaders.has("content-type")) {
        if (target.includes('.ts')) clientHeaders.set("content-type", "video/mp2t");
        else clientHeaders.set("content-type", "video/mp4");
    }

    // Only apply download attachments to actual files (like the ORG quality streams)
    if (!isM3U8 && !target.includes('.ts')) {
        const filename = encodeURIComponent(url.pathname.split('/').pop() || "video.mp4");
        clientHeaders.set("content-disposition", `inline; filename="${filename}"`);
    } else {
        clientHeaders.delete("content-disposition");
    }

    const body = request.method === "HEAD" ? null : response.body;

    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: clientHeaders
    });
                    }

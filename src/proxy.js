const HOP_BY_HOP_REQUEST = new Set([
    "host", "connection", "keep-alive", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade",
    "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor",
    "x-forwarded-for", "x-forwarded-proto", "x-real-ip",
]);
  
const HOP_BY_HOP_RESPONSE = new Set([
    "connection", "keep-alive", "proxy-authenticate", "proxy-connection",
    "te", "trailers", "transfer-encoding", "upgrade", "alt-svc",
]);

export async function handleProxy(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const rawTarget = url.searchParams.get("url");
    if (!rawTarget) return new Response('Missing "url"', { status: 400 });

    let targetUrl;
    try { targetUrl = new URL(rawTarget); } catch { return new Response("Invalid URL", { status: 400 }); }
    if (!["http:", "https:"].includes(targetUrl.protocol)) return new Response("Invalid protocol", { status: 400 });

    // Extract filename for download managers
    const filename = url.pathname.split('/').pop() || "video.mp4";

    // Keep original headers (like If-Range) so IDM and Infuse can chunk the file,
    // but filter out Cloudflare hop-by-hop headers.
    const upstreamHeaders = new Headers(request.headers);
    for (const name of HOP_BY_HOP_REQUEST) {
        upstreamHeaders.delete(name);
    }
    
    // Bypass CDN Anti-Piracy by pretending to be a real browser
    upstreamHeaders.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
    
    // Stop CDN from zipping the video stream, which ruins chunking
    upstreamHeaders.set("accept-encoding", "identity");

    let response;
    let redirectCount = 0;
    let currentTarget = targetUrl;

    while (redirectCount < 5) {
        upstreamHeaders.set("referer", `${currentTarget.origin}/`);
        upstreamHeaders.set("origin", currentTarget.origin);

        response = await fetch(currentTarget.toString(), {
            method: request.method,
            headers: upstreamHeaders,
            redirect: "manual",
        });

        if ([301, 302, 303, 307, 308].includes(response.status)) {
            const location = response.headers.get("location");
            if (location) {
                // CRITICAL FIX: Cancel the redirect body! 
                // Failing to do this causes a socket leak, crashing the download at ~75 KB.
                if (response.body) {
                    await response.body.cancel().catch(() => {});
                }
                currentTarget = new URL(location, currentTarget);
                redirectCount++;
                continue;
            }
        }
        break;
    }

    const clientHeaders = new Headers(response.headers);
    for (const name of HOP_BY_HOP_RESPONSE) {
        clientHeaders.delete(name);
    }
    
    // Fix missing Apple/Infuse headers
    if (!clientHeaders.has("accept-ranges")) clientHeaders.set("accept-ranges", "bytes");
    if (!clientHeaders.has("content-type")) clientHeaders.set("content-type", "video/mp4");
    
    // Use "inline" instead of "attachment" to give Download Managers the filename 
    // without forcing Web Players and Infuse to abort the video stream.
    clientHeaders.set("content-disposition", `inline; filename="${decodeURIComponent(filename)}"`);
    
    const origin = request.headers.get("origin");
    clientHeaders.set("access-control-allow-origin", origin ? origin : "*");
    if (origin) clientHeaders.set("access-control-allow-credentials", "true");
    
    // Ensure vital headers are exposed to the browser/player
    clientHeaders.set("access-control-expose-headers", "Content-Length, Content-Range, Content-Type, Accept-Ranges, ETag, Last-Modified");

    // HEAD requests cannot contain a body, otherwise the protocol breaks
    const body = request.method === "HEAD" ? null : response.body;

    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: clientHeaders,
    });
}

export async function handleProxy(request, env) {
    if (request.method !== "OPTIONS" && request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405 });
    }

    // Handle preflight requests for web browsers
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "Range, Content-Type, Accept-Encoding",
                "Access-Control-Max-Age": "86400"
            }
        });
    }

    const url = new URL(request.url);
    const rawTarget = url.searchParams.get("url");
    if (!rawTarget) return new Response('Missing "url"', { status: 400 });

    let currentTarget;
    try { currentTarget = new URL(rawTarget); } catch { return new Response("Invalid URL", { status: 400 }); }
    
    // Build clean upstream headers
    const upstreamHeaders = new Headers();
    
    // Only pass the strict headers needed for chunking/seeking
    if (request.headers.has("range")) upstreamHeaders.set("range", request.headers.get("range"));
    if (request.headers.has("if-range")) upstreamHeaders.set("if-range", request.headers.get("if-range"));
    
    // Spoof a standard web browser (bypasses Infuse block)
    upstreamHeaders.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
    upstreamHeaders.set("accept", "*/*");
    upstreamHeaders.set("accept-encoding", "identity"); // Force uncompressed stream to keep Content-Length

    let response;
    let redirectCount = 0;

    // Follow redirects manually to preserve the Range header across domains
    while (redirectCount < 5) {
        response = await fetch(currentTarget.toString(), {
            method: request.method,
            headers: upstreamHeaders,
            redirect: "manual",
        });

        if ([301, 302, 303, 307, 308].includes(response.status)) {
            const location = response.headers.get("location");
            if (location) {
                // CRITICAL FIX: Consume the redirect body to free the Cloudflare socket instantly.
                // This prevents the proxy from crashing at 75 KB during downloads.
                await response.text().catch(() => {}); 
                
                currentTarget = new URL(location, currentTarget);
                redirectCount++;
                continue;
            }
        }
        break;
    }

    // Build the final headers to send back to the user's player
    const clientHeaders = new Headers();
    
    // Map safe video response headers back
    const safeHeaders = ["content-length", "content-range", "content-type", "accept-ranges"];
    for (const header of safeHeaders) {
        if (response.headers.has(header)) {
            clientHeaders.set(header, response.headers.get(header));
        }
    }

    // Apple AVPlayer & Infuse strictly require these headers to exist
    if (!clientHeaders.has("accept-ranges")) clientHeaders.set("accept-ranges", "bytes");
    if (!clientHeaders.has("content-type")) clientHeaders.set("content-type", "video/mp4");

    // Enable proper downloading in IDM/Browsers
    const filename = url.pathname.split('/').pop() || "video.mp4";
    clientHeaders.set("content-disposition", `inline; filename="${decodeURIComponent(filename)}"`);

    // Enable CORS for Stremio Web
    clientHeaders.set("access-control-allow-origin", "*");
    clientHeaders.set("access-control-expose-headers", "Content-Length, Content-Range, Content-Type, Accept-Ranges");

    // Prevent body in HEAD requests (Infuse probes use HEAD; attaching a body breaks the connection)
    const body = request.method === "HEAD" ? null : response.body;

    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: clientHeaders,
    });
}

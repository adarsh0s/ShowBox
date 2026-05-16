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

    const upstreamHeaders = new Headers();
    for (const [name, value] of request.headers.entries()) {
        if (!HOP_BY_HOP_REQUEST.has(name.toLowerCase())) upstreamHeaders.set(name, value);
    }
    
    // CRITICAL FIX 1: Prevent compression so Content-Length is preserved.
    // Without Content-Length, the video player cannot demux or seek.
    upstreamHeaders.delete("accept-encoding");

    let response;
    let redirectCount = 0;
    let currentTarget = targetUrl;

    // CRITICAL FIX 2: Manually follow redirects. 
    // Standard fetch() with redirect: "follow" drops the "Range" header on cross-origin redirects.
    // This loops through the redirects manually while keeping the original Headers.
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
                currentTarget = new URL(location, currentTarget);
                redirectCount++;
                continue;
            }
        }
        break;
    }

    const clientHeaders = new Headers();
    for (const [name, value] of response.headers.entries()) {
        if (!HOP_BY_HOP_RESPONSE.has(name.toLowerCase())) clientHeaders.set(name, value);
    }
    
    const origin = request.headers.get("origin");
    if (origin) {
        clientHeaders.set("access-control-allow-origin", origin);
        clientHeaders.set("access-control-allow-credentials", "true");
    } else {
        clientHeaders.set("access-control-allow-origin", "*");
    }
    clientHeaders.set("access-control-expose-headers", "Content-Length, Content-Range, Content-Type, Accept-Ranges");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: clientHeaders,
    });
}

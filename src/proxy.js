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

    // 2. Build Upstream Headers
    const upstreamHeaders = new Headers();
    if (request.headers.has("range")) upstreamHeaders.set("range", request.headers.get("range"));
    if (request.headers.has("if-range")) upstreamHeaders.set("if-range", request.headers.get("if-range"));

    // Spoof browser to bypass CDN blocks
    upstreamHeaders.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
    upstreamHeaders.set("accept-encoding", "identity");

    // 3. Fetch from CDN
    const response = await fetch(target, {
        method: request.method,
        headers: upstreamHeaders,
        redirect: "follow"
    });

    const clientHeaders = new Headers(response.headers);
    clientHeaders.set("access-control-allow-origin", "*");
    clientHeaders.set("access-control-expose-headers", "Content-Length, Content-Range, Accept-Ranges, Content-Type");

    // 4. HLS M3U8 Rewriter
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const isM3U8 = target.includes(".m3u8") || contentType.includes("mpegurl");

    if (isM3U8 && request.method === "GET") {
        let text = await response.text();
        const proxyBase = `${url.origin}${url.pathname}?url=`;

        // Rewrite internal Key URIs
        text = text.replace(/URI="(.*?)"/g, (match, p1) => {
            let absoluteUrl = p1;
            if (!p1.startsWith('http')) {
                try { absoluteUrl = new URL(p1, target).toString(); } catch (e) { return match; }
            }
            return `URI="${proxyBase}${encodeURIComponent(absoluteUrl)}"`;
        });

        // Rewrite chunk URLs
        const rewrittenLines = text.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return line; 
            
            let absoluteUrl = trimmed;
            if (!trimmed.startsWith('http')) {
                try { absoluteUrl = new URL(trimmed, target).toString(); } catch (e) { return line; }
            }
            return `${proxyBase}${encodeURIComponent(absoluteUrl)}`;
        });

        const rewrittenM3u8 = rewrittenLines.join('\n');
        
        clientHeaders.set("content-length", rewrittenM3u8.length.toString());
        clientHeaders.set("content-type", "application/vnd.apple.mpegurl");
        clientHeaders.delete("content-disposition"); // DO NOT force download for m3u8 playlists
        
        return new Response(rewrittenM3u8, {
            status: response.status,
            statusText: response.statusText,
            headers: clientHeaders
        });
    }

    // 5. Normal Video Chunk Handling
    if (!clientHeaders.has("accept-ranges")) clientHeaders.set("accept-ranges", "bytes");
    
    if (!clientHeaders.has("content-type")) {
        if (target.includes('.ts')) clientHeaders.set("content-type", "video/mp2t");
        else clientHeaders.set("content-type", "video/mp4");
    }

    // Only apply download disposition to actual files, not M3U8/TS chunks
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

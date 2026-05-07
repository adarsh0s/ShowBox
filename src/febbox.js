import ShowboxAPI from './ShowboxAPI.js';
import FebboxAPI from './FebBoxApi.js';

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function convertImdbToTmdb(imdbId, expectedType, apiKey) {
    if (!imdbId || !imdbId.startsWith("tt")) return null;
    try {
        const resp = await fetch(`${TMDB_BASE_URL}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`);
        if (!resp.ok) return null;
        const data = await resp.json();
        const results = expectedType === "tv" ? (data.tv_results || data.movie_results) : (data.movie_results || data.tv_results);
        if (results && results.length) {
            const r = results[0];
            return {
                tmdbId: String(r.id),
                tmdbType: r.name ? "tv" : "movie",
                title: r.title || r.name || r.original_title || r.original_name || "",
                year: (r.release_date || r.first_air_date || "").slice(0, 4)
            };
        }
    } catch {}
    return null;
}

export async function getStreamsFromTmdbId(tmdbType, tmdbId, seasonNum, episodeNum, regionPreference, cookieStr, tmdbApiKey) {
    const showboxAPI = new ShowboxAPI();
    const febboxAPI = new FebboxAPI();
    
    if (cookieStr) febboxAPI._setAuthCookie(cookieStr.replace('ui=', '').trim());

    try {
        // 1. Fetch TMDB Metadata
        const tmdbUrl = tmdbType === 'tv' 
            ? `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${tmdbApiKey}`
            : `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${tmdbApiKey}`;
        
        const tmdbRes = await fetch(tmdbUrl);
        if (!tmdbRes.ok) return { versions: [] };
        const tmdbData = await tmdbRes.json();
        
        const title = tmdbType === 'tv' ? tmdbData.name : tmdbData.title;
        const releaseYear = tmdbType === 'tv' 
            ? (tmdbData.first_air_date ? tmdbData.first_air_date.split('-')[0] : null)
            : (tmdbData.release_date ? tmdbData.release_date.split('-')[0] : null);

        // 2. Search Showbox
        const showboxResults = await showboxAPI.search(title, tmdbType === 'tv' ? 'tv' : 'movie');
        if (!showboxResults || showboxResults.length === 0) return { versions: [] };

        let showboxItem = showboxResults.find(item => item.title.toLowerCase() === title.toLowerCase() && item.year == releaseYear);
        if (!showboxItem) showboxItem = showboxResults.find(item => item.title.toLowerCase() === title.toLowerCase()) || showboxResults[0];

        // 3. Get FebBox ID
        const febBoxId = await showboxAPI.getFebBoxId(showboxItem.id, showboxItem.box_type);
        if (!febBoxId) return { versions: [] };

        // 4. File List Navigation
        let targetFid = null;
        let fileName = title; // Default fallback

        if (tmdbType === 'movie') {
            const files = await febboxAPI.getFileList(febBoxId, 0);
            if (!files || files.length === 0) return { versions: [] };
            
            const videoFile = files.find(f => f.is_dir === 0) || files[0];
            targetFid = videoFile.fid;
            fileName = videoFile.file_name; // Capture actual filename
        } else {
            const showFiles = await febboxAPI.getFileList(febBoxId, 0);
            const sPad = String(seasonNum).padStart(2, '0');
            const ePad = String(episodeNum).padStart(2, '0');
            
            let seasonFolder = showFiles.find(f => f.is_dir === 1 && (f.file_name.toLowerCase().includes(`season ${seasonNum}`) || f.file_name.toLowerCase().includes(`season ${sPad}`)));
            let seasonFiles = seasonFolder ? await febboxAPI.getFileList(febBoxId, seasonFolder.fid) : showFiles;

            let episodeFile = seasonFiles.find(f => f.is_dir === 0 && (
                f.file_name.toLowerCase().includes(`s${sPad}e${ePad}`) || 
                f.file_name.toLowerCase().includes(`e${ePad}`) ||
                f.file_name.toLowerCase().includes(`episode ${episodeNum}`)
            ));
            
            if (!episodeFile) return { versions: [] };
            targetFid = episodeFile.fid;
            fileName = episodeFile.file_name; // Capture actual filename
        }

        // 5. Extract Stream Links
        const links = await febboxAPI.getLinks(febBoxId, targetFid);
        
        if (links && links.length > 0) {
            return {
                versions: [{
                    name: fileName, // Use the filename (e.g. Breaking.Bad.S01E01.1080p.mkv)
                    links: links 
                }]
            };
        }
        
        return { versions: [] };
    } catch (e) {
        console.error("Febbox Stream Error:", e);
        return { versions: [] };
    }
}

export async function getBestCookie(cookies) {
    if (!cookies || cookies.length === 0) return { cookie: null };
    if (cookies.length === 1) return { cookie: cookies[0], remaining: undefined };

    const checks = await Promise.all(cookies.map(async (cookie) => {
        try {
            const reqCookie = cookie.startsWith("ui=") ? cookie : `ui=${cookie}`;
            const resp = await fetch("https://www.febbox.com/console/user_cards", {
                headers: { "User-Agent": "Mozilla/5.0", Cookie: reqCookie }
            });
            const data = await resp.json();
            const flow = data?.data?.flow;
            if (flow && typeof flow.traffic_limit_mb === 'number' && typeof flow.traffic_usage_mb === 'number') {
                return { cookie: reqCookie, remaining: flow.traffic_limit_mb - flow.traffic_usage_mb, ok: true };
            }
            return { cookie: reqCookie, remaining: undefined, ok: true }; 
        } catch {
            return { cookie, remaining: undefined, ok: false };
        }
    }));

    const valid = checks.filter(c => c.ok && c.remaining !== undefined);
    if (valid.length === 0) return { cookie: cookies[0], remaining: undefined };

    valid.sort((a, b) => b.remaining - a.remaining);
    return valid[0];
}

export async function handleValidateCookie(request) {
    try {
        const { cookie } = await request.json();
        const reqCookie = cookie.startsWith("ui=") ? cookie : `ui=${cookie}`;
        const resp = await fetch("https://www.febbox.com/console/user_cards", { headers: { "User-Agent": "Mozilla/5.0", Cookie: reqCookie }});
        const data = await resp.json();
        return new Response(JSON.stringify({ isValid: !!data?.data?.flow }));
    } catch { return new Response(JSON.stringify({ isValid: false })); }
}

export async function handleFebboxFlow(request) {
    try {
        const { cookie } = await request.json();
        const reqCookie = cookie.startsWith("ui=") ? cookie : `ui=${cookie}`;
        const resp = await fetch("https://www.febbox.com/console/user_cards", { headers: { "User-Agent": "Mozilla/5.0", Cookie: reqCookie }});
        const data = await resp.json();
        return new Response(JSON.stringify({ ok: !!data?.data?.flow, flow: data?.data?.flow }));
    } catch { return new Response(JSON.stringify({ ok: false })); }
}

import { convertImdbToTmdb, getStreamsFromTmdbId, getBestCookie } from './febbox.js';

const MANIFEST = {
    id: "org.showbox.addon",
    version: "3.4.0",
    name: "ShowBox",
    description: "ShowBox — Unofficial Stremio addon for FebBox streams.",
    logo: "https://raw.githubusercontent.com/adarsh0s/Showbox/refs/heads/main/src/icon.png",
    resources: ["stream"],
    types: ["movie", "series"],
    catalogs: [],
    behaviorHints: { configurable: true, configurationRequired: true },
};

const REGIONS = {
    Auto: "🌍", USA7: "🇺🇸", USA6: "🇺🇸", USA5: "🇺🇸", UK3: "🇬🇧",
    CA1: "🇨🇦", FR1: "🇫🇷", DE2: "🇩🇪", HK1: "🇭🇰", IN1: "🇮🇳", AU1: "🇦🇺", SZ: "🇨🇳"
};

export function buildManifest(config) {
    const m = JSON.parse(JSON.stringify(MANIFEST));
    if (config?.showboxRegion) m.name = `ShowBox (${config.showboxRegion})`;
    if (config && Object.keys(config).length > 0) m.behaviorHints = { configurable: true, configurationRequired: false };
    return m;
}

export async function handleStream(request, type, id, config, proxyBase, tmdbApiKey) {
    if (config.enableShowbox === false) return { streams: [] };

    const cookies = config.showboxCookies || [];
    if (cookies.length === 0) {
        return { streams: [{ name: "⚠️ Setup Required", title: "No FebBox token configured.\nPlease configure the addon.", url: "http://dummy-error.com/video.mp4" }] };
    }

    const activeCookieData = await getBestCookie(cookies);
    if (activeCookieData.remaining !== undefined && activeCookieData.remaining <= 0) {
        return { streams: [{ name: "⚠️ Quota Exceeded", title: "All configured FebBox accounts have reached their limits.", url: "http://dummy-error.com/video.mp4" }] };
    }

    const imdbParts = id.split(":");
    const season = imdbParts[1] ? parseInt(imdbParts[1]) : null;
    const episode = imdbParts[2] ? parseInt(imdbParts[2]) : null;
    let tmdbType = type === "series" ? "tv" : "movie";
    
    let meta = await convertImdbToTmdb(imdbParts[0], tmdbType, tmdbApiKey) || { tmdbId: id, tmdbType, title: "", year: "" };

    let region = config.showboxRegion || "Auto";
    let displayRegion = region;
    
    if (region === "Auto") {
        const country = (request.cf?.country || "US").toUpperCase();
        const map = { US:"USA7", CA:"CA1", GB:"UK3", FR:"FR1", DE:"DE2", IN:"IN1", HK:"HK1", AU:"AU1", CN:"SZ" };
        region = map[country] || "USA7";
    }

    const data = await getStreamsFromTmdbId(meta.tmdbType, meta, season, episode, region, activeCookieData.cookie, tmdbApiKey);
    if (!data?.versions) return { streams: [] };

    let streams = [];
    data.versions.forEach(v => {
        (v.links || []).forEach(l => {
            if (!l.url) return;
            
            let qStr = String(l.quality || l.name || v.name || "").toLowerCase();
            let isOrg = qStr.includes("org") || qStr.includes("original");
            
            let res = "Unknown";
            if (qStr.includes("2160") || qStr.includes("4k")) res = "4K";
            else if (qStr.includes("1080")) res = "1080p";
            else if (qStr.includes("720")) res = "720p";
            else if (qStr.includes("360")) res = "360p";
            else if (isOrg) res = "ORG";

            let qLabel = res;
            if (isOrg && res !== "ORG" && res !== "Unknown") qLabel = `${res} ORG`;

            if (config.sbExcludeDV && v.name.includes("DV")) return;
            if (config.sbExcludeHDR && v.name.includes("HDR")) return;
            
            if (config.sbMinQuality && config.sbMinQuality !== "all") {
                const qMap = { "ORG": 0, "480p": 480, "720p": 720, "1080p": 1080, "4K": 2160 };
                const reqQ = qMap[config.sbMinQuality] || 0;
                const thisQ = qMap[res] || 0;
                if (thisQ < reqQ) return;
            }

            let finalUrl = l.url;
            if (config.useProxy === true) {
                const base = (config.customProxyUrl || proxyBase).replace(/\/$/, "");
                const safeName = encodeURIComponent(v.name || "video.mp4");
                finalUrl = `${base}/proxy/${safeName}?url=${encodeURIComponent(l.url)}`;
            }

            streams.push({
                name: `💎 ShowBox ${REGIONS[displayRegion] || ""}\n${config.showboxHasQuota ? "⚡ " : ""}${qLabel}`,
                title: `${meta.title} ${meta.year ? `(${meta.year})` : ""}\n${v.name}\n💾 ${l.size || v.size || "Unknown"}`,
                url: finalUrl,
                behaviorHints: { notWebReady: true },
                _res: res,
                _isOrg: isOrg,
                _sizeGB: parseSizeGB(l.size || v.size || "")
            });
        });
    });

    streams.sort((a, b) => {
        const getRank = (res, isOrg) => {
            let r = 0;
            if (res === "4K") r = 80;
            else if (res === "1080p") r = 60;
            else if (res === "720p") r = 40;
            else if (res === "360p") r = 20;
            else if (res === "ORG") r = 90;
            if (isOrg) r += 5; 
            return r;
        };
        const rankA = getRank(a._res, a._isOrg);
        const rankB = getRank(b._res, b._isOrg);
        if (rankB !== rankA) return rankB - rankA;
        return b._sizeGB - a._sizeGB;
    });

    streams = streams.map(s => { delete s._res; delete s._isOrg; delete s._sizeGB; return s; });

    return { streams };
}

function parseSizeGB(sizeStr) {
    if (!sizeStr) return 0;
    const s = sizeStr.toLowerCase();
    const m = s.match(/([\d.]+)\s*(gb|mb|kb|b)/i);
    if (m) {
        const v = parseFloat(m[1]);
        const u = m[2];
        if (u === "gb") return v;
        if (u === "mb") return v / 1024;
        if (u === "kb") return v / (1024 * 1024);
    }
    return 0;
}

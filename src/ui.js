export const CONFIG_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ShowBox Config</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-page: #fafafa;
            --bg-surface: #ffffff;
            --bg-input: #f4f4f5;
            --text-main: #09090b;
            --text-muted: #71717a;
            --accent: #2563eb;
            --constsuccess: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --border: #e4e4e7;
            --radius-lg: 16px;
            --radius-sm: 8px;
            --shadow: 0 4px 24px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.02);
            --transition: all 0.2s ease;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }

        body {
            font-family: 'Inter', sans-serif; background-color: var(--bg-page); color: var(--text-main);
            line-height: 1.5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
        }

        .container { width: 100%; max-width: 600px; }

        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .logo { font-weight: 600; font-size: 1.25rem; display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 18px; height: 18px; background: var(--text-main); border-radius: 4px; }

        .app-window { background: var(--bg-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); padding: 32px; }

        .section { padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid var(--border); }
        .section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

        .form-group { margin-bottom: 16px; }
        .form-group:last-child { margin-bottom: 0; }
        
        .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        label { font-size: 0.875rem; font-weight: 500; color: var(--text-main); }
        .tag-beta { font-size: 0.65rem; background: #dbeafe; color: var(--accent); padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; margin-left: 8px; }

        .flex-row { display: flex; gap: 12px; }
        
        input[type="text"], select {
            width: 100%; background: var(--bg-input); border: 1px solid transparent; padding: 10px 14px;
            border-radius: var(--radius-sm); font-family: inherit; font-size: 0.9rem; color: var(--text-main);
            outline: none; transition: var(--transition);
        }
        input:focus, select:focus { background: var(--bg-surface); border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

        .btn {
            display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px;
            border-radius: var(--radius-sm); font-weight: 500; font-size: 0.875rem; cursor: pointer;
            transition: var(--transition); border: none; white-space: nowrap;
        }
        .btn-primary { background: var(--text-main); color: white; }
        .btn-primary:hover { background: #27272a; }
        .btn-secondary { background: var(--bg-input); color: var(--text-main); }
        .btn-secondary:hover { background: #e4e4e7; }
        .btn-text { background: transparent; color: var(--accent); padding: 0; font-size: 0.8rem; text-decoration: none; }
        .btn-text:hover { text-decoration: underline; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-large { width: 100%; font-size: 1rem; padding: 14px; font-weight: 600; text-decoration: none; text-align: center;}

        .input-wrap { position: relative; flex: 1; display: flex; align-items: center; }
        .status-indicator { position: absolute; left: 12px; width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: var(--transition); }
        .status-valid { background: var(--success); box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
        .status-invalid { background: var(--danger); box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
        .status-override { background: var(--warning); box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
        .status-pending { background: var(--accent); animation: pulse 1s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .quota-bar-wrap { margin-top: 12px; padding: 10px 12px; background: var(--bg-input); border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--text-muted); display: none; }
        .quota-bar-wrap.visible { display: flex; flex-direction: column; gap: 8px; }
        .quota-bar-track { width: 100%; height: 4px; background: #d4d4d8; border-radius: 10px; overflow: hidden; }
        .quota-bar-fill { height: 100%; background: var(--text-main); transition: width 0.4s; }
        .quota-bar-fill.low { background: var(--warning); }
        .quota-bar-fill.empty { background: var(--danger); }

        .cookie-card { background: var(--bg-input); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
        .cookie-info { display: flex; flex-direction: column; gap: 2px; }
        .cookie-title { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.85rem; }
        .cookie-hash { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); }
        .btn-sm-danger { background: transparent; color: var(--danger); border: none; font-size: 0.8rem; cursor: pointer; }

        .toggle { position: relative; display: inline-block; width: 36px; height: 20px; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #d4d4d8; transition: .3s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        input:checked + .slider { background-color: var(--accent); }
        input:checked + .slider:before { transform: translateX(16px); }

        .expandable { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, opacity 0.2s ease; opacity: 0; }
        .expandable.open { max-height: 300px; opacity: 1; margin-top: 12px; }

        .manifest-box { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 16px; word-break: break-all; cursor: pointer; }
        .manifest-box:hover { color: var(--text-main); }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: var(--transition); z-index: 50; padding: 20px; }
        .modal-overlay.active { opacity: 1; pointer-events: all; }
        .modal { background: var(--bg-surface); width: 100%; max-width: 500px; border-radius: 12px; box-shadow: var(--shadow); transform: translateY(20px); transition: var(--transition); }
        .modal-overlay.active .modal { transform: translateY(0); }
        .modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-weight: 500; font-size: 1rem; }
        .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; }
        .modal-body { padding: 20px; font-size: 0.875rem; color: var(--text-muted); }
        pre { background: #18181b; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #a78bfa; margin: 12px 0; }

        .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: #18181b; color: white; padding: 10px 20px; border-radius: 30px; font-weight: 500; font-size: 0.85rem; opacity: 0; pointer-events: none; transition: var(--transition); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); z-index: 100; }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

        @media (max-width: 600px) {
            .app-window { padding: 20px; }
            .flex-row { flex-direction: column; }
            .btn { width: 100%; }
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <div class="logo"><div class="logo-icon"></div>ShowBox</div>
            <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;" onclick="copyManifest()">Copy URL</button>
        </div>

        <div class="app-window">
            
            <div class="section">
                <div class="form-group">
                    <label class="label-row">Main Cookie (ui=)</label>
                    <div class="flex-row" style="margin-bottom: 12px;">
                        <div class="input-wrap">
                            <div class="status-indicator" id="mainCookieStatus"></div>
                            <input type="text" id="manualCookie" placeholder="Paste token" style="padding-left: 28px;" oninput="resetCookieState()">
                        </div>
                        <button class="btn btn-secondary" onclick="validateMainCookie()">Check</button>
                    </div>
                    <div class="flex-row">
                        <button class="btn btn-secondary" id="setCookieBtn" disabled onclick="setMainCookie()">Apply</button>
                        <button class="btn btn-secondary" id="overrideCookieBtn" onclick="overrideMainCookie()">Force Apply</button>
                    </div>
                    
                    <div class="quota-bar-wrap" id="mainCookieQuota">
                        <div id="quotaLabel" style="font-family: 'JetBrains Mono', monospace;">⚡ Loading...</div>
                        <div class="quota-bar-track"><div class="quota-bar-fill" id="quotaFill" style="width:0%"></div></div>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label class="label-row">
                        <span>Load Balancer <span class="tag-beta">Beta</span></span>
                    </label>
                    <div class="flex-row" style="margin-bottom: 12px;">
                        <input type="text" id="multiCookieInput" placeholder="Fallback token">
                        <button class="btn btn-secondary" onclick="addMultiCookie()">Add</button>
                    </div>
                    <div class="flex-row">
                        <button class="btn btn-secondary" style="flex:1;" onclick="validateAllCookies()">Validate</button>
                        <button class="btn btn-secondary" style="flex:1;" onclick="applyMultiCookies()">Apply List</button>
                    </div>
                    <div id="multiCookieList"></div>
                </div>
            </div>

            <div class="section">
                <div class="form-group">
                    <div class="label-row">
                        <label>Stream Proxy</label>
                        <label class="toggle">
                            <input type="checkbox" id="useProxy" class="auto-update" onchange="toggleProxyOptions()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    
                    <div id="proxyOptions" class="expandable">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px;">Routing</label>
                            <select id="proxyType" class="auto-update" onchange="toggleCustomProxy()">
                                <option value="builtin">Default Worker</option>
                                <option value="custom">Custom Worker</option>
                            </select>
                        </div>
                        <div class="form-group expandable" id="customProxyWrap">
                            <div class="label-row" style="margin-bottom: 8px;">
                                <label>URL</label>
                                <a href="#" class="btn-text" onclick="openGuide()">Proxy Setup Guide</a>
                            </div>
                            <input type="text" id="customProxyUrl" class="auto-update" placeholder="https://...">
                        </div>
                    </div>
                </div>

                <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px;">Region</label>
                        <select id="sbRegion" class="auto-update">
                            <option value="Auto">Auto</option>
                            <option value="USA7">USA7</option>
                            <option value="USA6">USA6</option>
                            <option value="USA5">USA5</option>
                            <option value="UK3">UK3</option>
                            <option value="CA1">CA1</option>
                            <option value="FR1">FR1</option>
                            <option value="DE2">DE2</option>
                            <option value="HK1">HK1</option>
                            <option value="IN1">IN1</option>
                            <option value="AU1">AU1</option>
                            <option value="SZ">SZ</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px;">Quality</label>
                        <select id="sbMinQuality" class="auto-update">
                            <option value="all">Any</option>
                            <option value="1080p">1080p+</option>
                            <option value="4K">4K Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <a href="#" id="installBtn" class="btn btn-primary btn-large">Install Addon</a>
            <div class="manifest-box" id="manifestUrl" onclick="copyManifest()">Waiting for configuration...</div>
        </div>
    </div>

    <div class="toast" id="toast">Message</div>

    <div class="modal-overlay" id="guideModal" onclick="closeGuide(event)">
        <div class="modal">
            <div class="modal-header">
                Custom Proxy
                <button class="modal-close" onclick="closeGuide()">&times;</button>
            </div>
            <div class="modal-body">
                <ol style="margin-left: 16px; margin-bottom: 12px;">
                    <li>Create a Worker on Cloudflare.</li>
                    <li>Deploy the code below.</li>
                    <li>Paste the Worker URL.</li>
                </ol>
                <pre><code>export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }});
    const url = new URL(request.url).searchParams.get("url");
    if (!url) return new Response("Add ?url=", { status: 400 });
    const req = new Request(url, request);
    req.headers.set("origin", new URL(url).origin);
    req.headers.set("referer", new URL(url).origin + "/");
    const res = await fetch(req);
    const newRes = new Response(res.body, res);
    newRes.headers.set("Access-Control-Allow-Origin", "*");
    return newRes;
  }
}</code></pre>
            </div>
        </div>
    </div>

    <script>
        let mainCookieFlow = null;
        let nsMultiCookies = [];

        function shortHash(str) {
            let h = 5381; for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); h |= 0; }
            return (h >>> 0).toString(16).padStart(8, '0');
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.innerText = msg; t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }

        function toggleProxyOptions() {
            const wrap = document.getElementById('proxyOptions');
            document.getElementById('useProxy').checked ? wrap.classList.add('open') : wrap.classList.remove('open');
            generateManifest();
        }

        function toggleCustomProxy() {
            const wrap = document.getElementById('customProxyWrap');
            document.getElementById('proxyType').value === 'custom' ? wrap.classList.add('open') : wrap.classList.remove('open');
            generateManifest();
        }

        function openGuide() { document.getElementById('guideModal').classList.add('active'); }
        function closeGuide(e) { if (!e || e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) document.getElementById('guideModal').classList.remove('active'); }

        function formatMB(val) {
            if (typeof val !== 'number' || isNaN(val)) return 'N/A';
            const safe = Math.max(0, val);
            if (safe >= 1024) return (safe / 1024).toFixed(2) + ' GB';
            return safe.toFixed(2) + ' MB';
        }

        function resetCookieState() {
            document.getElementById('mainCookieStatus').className = 'status-indicator';
            document.getElementById('setCookieBtn').disabled = true;
            mainCookieFlow = null;
            document.getElementById('mainCookieQuota').classList.remove('visible');
        }

        async function validateSingleCookie(cookieVal) {
            try {
                let resp = await fetch('/api/febbox-flow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookie: cookieVal }) });
                let res = await resp.json();
                if (res && res.ok && res.flow) return { valid: true, flow: res.flow };
                resp = await fetch('/api/validate-cookie', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookie: cookieVal }) });
                res = await resp.json();
                if (res && res.isValid) return { valid: true, flow: null };
                return { valid: false };
            } catch(e) { return { valid: false }; }
        }

        async function validateMainCookie() {
            const val = document.getElementById('manualCookie').value.trim();
            if (!val) return showToast("Enter a token.");
            const indicator = document.getElementById('mainCookieStatus');
            indicator.className = 'status-indicator status-pending';
            document.getElementById('setCookieBtn').disabled = true;
            mainCookieFlow = null;
            document.getElementById('mainCookieQuota').classList.remove('visible');
            const result = await validateSingleCookie(val);
            if (result.valid) {
                indicator.className = 'status-indicator status-valid';
                document.getElementById('setCookieBtn').disabled = false;
                if (result.flow) { mainCookieFlow = result.flow; showQuota(result.flow); }
                showToast("Validated.");
            } else {
                indicator.className = 'status-indicator status-invalid';
                showToast("Invalid Token.");
            }
        }

        function showQuota(flow) {
            if (!flow || typeof flow.traffic_limit_mb !== 'number' || typeof flow.traffic_usage_mb !== 'number') return;
            const limit = flow.traffic_limit_mb;
            const remaining = Math.max(0, limit - flow.traffic_usage_mb);
            const wrap  = document.getElementById('mainCookieQuota');
            const label = document.getElementById('quotaLabel');
            const fill  = document.getElementById('quotaFill');
            if (limit <= 0) {
                label.textContent = `⚡ ${formatMB(remaining)} (No Limit)`;
                fill.style.width = '100%'; fill.className = 'quota-bar-fill';
            } else {
                const pct = Math.round((remaining / limit) * 100);
                label.textContent = `⚡ ${formatMB(remaining)} / ${formatMB(limit)}`;
                fill.style.width = pct + '%';
                fill.className = 'quota-bar-fill' + (pct <= 10 ? ' empty' : pct <= 30 ? ' low' : '');
            }
            wrap.classList.add('visible');
        }

        function setMainCookie() { generateManifest(); showToast("Applied."); }

        function overrideMainCookie() {
            if (!document.getElementById('manualCookie').value.trim()) return showToast("Enter a token.");
            document.getElementById('mainCookieStatus').className = 'status-indicator status-override';
            document.getElementById('setCookieBtn').disabled = false;
            generateManifest(); showToast("Forced.");
        }

        function addMultiCookie() {
            const val = document.getElementById('multiCookieInput').value.trim();
            if(!val) return;
            if(!nsMultiCookies.some(c => c.value === val)) {
                nsMultiCookies.push({ value: val, isValid: null, flow: null });
                document.getElementById('multiCookieInput').value = '';
                renderMultiCookies();
            }
        }

        function removeCookie(index) { nsMultiCookies.splice(index, 1); renderMultiCookies(); generateManifest(); }

        async function validateAllCookies() {
            if(nsMultiCookies.length === 0) return;
            showToast("Validating...");
            for(let i=0; i<nsMultiCookies.length; i++) {
                const res = await validateSingleCookie(nsMultiCookies[i].value);
                nsMultiCookies[i].isValid = res.valid;
                if(res.flow) nsMultiCookies[i].flow = res.flow;
                renderMultiCookies();
            }
        }

        function applyMultiCookies() { if(nsMultiCookies.length > 0) { generateManifest(); showToast("Applied."); } }

        function renderMultiCookies() {
            const list = document.getElementById('multiCookieList');
            list.innerHTML = '';
            nsMultiCookies.forEach((item, idx) => {
                const idShort = shortHash(item.value);
                const flow = item.flow || {};
                const remaining = (typeof flow.traffic_limit_mb === 'number' && typeof flow.traffic_usage_mb === 'number') ? (flow.traffic_limit_mb - flow.traffic_usage_mb) : null;
                let statusColor = 'var(--border)';
                if (item.isValid === true) statusColor = 'var(--success)';
                if (item.isValid === false) statusColor = 'var(--danger)';
                list.innerHTML += `
                    <div class="cookie-card">
                        <div class="cookie-info">
                            <div class="cookie-title">
                                <div style="width:6px; height:6px; border-radius:50%; background:${statusColor};"></div>
                                Token ${idx+1} <span class="cookie-hash">#${idShort}</span>
                            </div>
                            <div class="cookie-hash" style="margin-top:2px;">${remaining !== null ? `⚡ ${formatMB(remaining)}` : 'Unknown'}</div>
                        </div>
                        <button class="btn-sm-danger" onclick="removeCookie(${idx})">Remove</button>
                    </div>
                `;
            });
        }

        function generateManifest() {
            const cookie = document.getElementById('manualCookie').value.trim();
            const mainCookieStatus = document.getElementById('mainCookieStatus').className;
            let cookiesArr = [];
            let showboxHasQuota = false;

            if (cookie && (mainCookieStatus.includes('valid') || mainCookieStatus.includes('override'))) {
                cookiesArr.push(cookie);
                if (mainCookieFlow && typeof mainCookieFlow.traffic_limit_mb === 'number' && typeof mainCookieFlow.traffic_usage_mb === 'number') {
                    if ((mainCookieFlow.traffic_limit_mb - mainCookieFlow.traffic_usage_mb) > 0) showboxHasQuota = true;
                } else showboxHasQuota = true; 
            }

            nsMultiCookies.forEach(c => {
                cookiesArr.push(c.value);
                if (c.flow && typeof c.flow.traffic_limit_mb === 'number' && typeof c.flow.traffic_usage_mb === 'number') {
                    if ((c.flow.traffic_limit_mb - c.flow.traffic_usage_mb) > 0) showboxHasQuota = true;
                } else if (c.isValid) showboxHasQuota = true;
            });

            const config = {
                enableShowbox: true,
                showboxCookies: cookiesArr,
                showboxRegion: document.getElementById('sbRegion').value,
                sbMinQuality: document.getElementById('sbMinQuality').value,
                useProxy: document.getElementById('useProxy').checked,
                customProxyUrl: document.getElementById('proxyType').value === 'custom' ? document.getElementById('customProxyUrl').value.trim() : "",
                showboxHasQuota
            };

            const b64 = btoa(JSON.stringify(config)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            let manifest = window.location.origin + '/' + b64 + '/manifest.json';
            
            if (cookiesArr.length === 0 && config.showboxRegion === 'Auto' && config.sbMinQuality === 'all' && !config.useProxy) {
                manifest = window.location.origin + '/manifest.json';
            }

            document.getElementById('manifestUrl').innerText = manifest;
            document.getElementById('installBtn').href = manifest.replace(/^https?:\/\//, 'stremio://');
        }

        function copyManifest() {
            navigator.clipboard.writeText(document.getElementById('manifestUrl').innerText);
            showToast("Copied");
        }

        document.querySelectorAll('.auto-update').forEach(el => el.addEventListener('input', generateManifest));
        generateManifest();
    </script>
</body>
</html>`;
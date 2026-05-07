export const CONFIG_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShowBox Addon Setup</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #09090b; --surface: #18181b; --card: #27272a;
            --text: #fafafa; --muted: #a1a1aa; --border: #3f3f46;
            --primary: #8b5cf6; --primary-hover: #7c3aed;
            --success: #10b981; --danger: #ef4444; --yellow: #eab308;
            --radius: 12px; --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text);
            line-height: 1.5; padding: 40px 20px; display: flex; justify-content: center;
        }
        .container { width: 100%; max-width: 560px; }
        h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; background: linear-gradient(to right, #fff, #a1a1aa); -webkit-background-clip: text; color: transparent; }
        p { color: var(--muted); font-size: 0.95rem; margin-bottom: 32px; }
        
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; }
        .card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        
        .label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-group { margin-bottom: 20px; }
        
        input, select {
            width: 100%; padding: 12px 16px; background: var(--card); border: 1px solid var(--border);
            color: var(--text); border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.95rem;
            outline: none; transition: var(--transition);
        }
        input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
        
        .btn {
            display: inline-flex; align-items: center; justify-content: center; width: 100%;
            padding: 12px 16px; border-radius: 8px; font-weight: 600; font-size: 0.95rem;
            cursor: pointer; transition: var(--transition); border: none; color: white; gap: 8px;
        }
        .btn-primary { background: var(--primary); }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-success { background: var(--success); }
        .btn-success:hover { background: #059669; }
        .btn-warning { background: rgba(234, 179, 8, 0.15); color: var(--yellow); border: 1px solid rgba(234, 179, 8, 0.3); }
        .btn-warning:hover { background: rgba(234, 179, 8, 0.25); }
        .btn-secondary { background: var(--card); border: 1px solid var(--border); color: var(--text); }
        .btn-secondary:hover { background: #3f3f46; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .flex-row { display: flex; gap: 12px; }
        .flex-row > * { flex: 1; }

        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--card); transition: .4s; border-radius: 34px; border: 1px solid var(--border); }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--muted); transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary); border-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); background-color: white; }

        .expandable { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0, 1, 0, 1); opacity: 0; }
        .expandable.open { max-height: 1000px; opacity: 1; transition: max-height 0.4s ease-in-out, opacity 0.4s ease; margin-top: 16px; }

        .manifest-box { background: rgba(139, 92, 246, 0.1); border: 1px dashed var(--primary); padding: 16px; border-radius: 8px; word-break: break-all; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--primary); margin-bottom: 24px; text-align: center; }

        .input-wrap { position: relative; display: flex; align-items: center; }
        .status-indicator { position: absolute; left: 14px; width: 10px; height: 10px; border-radius: 50%; background: var(--border); flex-shrink: 0; transition: var(--transition); }
        .status-valid { background: var(--success); box-shadow: 0 0 8px var(--success); }
        .status-invalid { background: var(--danger); box-shadow: 0 0 8px var(--danger); }
        .status-override { background: var(--yellow); box-shadow: 0 0 8px var(--yellow); }
        .status-pending { background: var(--primary); box-shadow: 0 0 8px var(--primary); animation: pulse 1s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .quota-bar-wrap { margin-top: 16px; padding: 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; font-size: 0.85rem; color: var(--muted); display: none; }
        .quota-bar-wrap.visible { display: flex; align-items: center; gap: 14px; }
        .quota-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 10px; overflow: hidden; }
        .quota-bar-fill { height: 100%; border-radius: 10px; background: var(--primary); transition: width 0.4s; }
        .quota-bar-fill.low { background: var(--yellow); }
        .quota-bar-fill.empty { background: var(--danger); }

        .cookie-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        .cookie-info { display: flex; flex-direction: column; gap: 4px; }
        .cookie-title { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; }
        .cookie-hash { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--muted); }
        .cookie-quota { font-size: 0.8rem; color: var(--muted); }
        .btn-sm-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: var(--transition); }
        .btn-sm-danger:hover { background: rgba(239, 68, 68, 0.2); }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: var(--transition); z-index: 50; padding: 20px; }
        .modal-overlay.active { opacity: 1; pointer-events: all; }
        .modal { background: var(--surface); width: 100%; max-width: 600px; border-radius: var(--radius); border: 1px solid var(--border); transform: scale(0.95); transition: var(--transition); max-height: 90vh; overflow-y: auto; }
        .modal-overlay.active .modal { transform: scale(1); }
        .modal-header { padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 1.1rem; position: sticky; top: 0; background: var(--surface); }
        .modal-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1.5rem; }
        .modal-body { padding: 20px; font-size: 0.95rem; color: #d4d4d8; }
        .modal-body ol { margin-left: 20px; margin-bottom: 20px; }
        .modal-body li { margin-bottom: 8px; }
        pre { background: var(--bg); padding: 16px; border-radius: 8px; border: 1px solid var(--border); overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #a78bfa; margin: 16px 0; }
        
        .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: white; color: black; padding: 12px 24px; border-radius: 30px; font-weight: 600; font-size: 0.9rem; opacity: 0; pointer-events: none; transition: var(--transition); box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 100; }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    </style>
</head>
<body>

<div class="container">
    <h1>ShowBox Addon</h1>
    <p>Configure your FebBox token and proxy settings to generate your Stremio manifest.</p>

    <div class="card">
        <div class="card-title">1. FebBox Authentication</div>
        
        <div class="form-group" style="margin-bottom: 0;">
            <span class="label">Main FebBox Cookie (ui=…)</span>
            <div class="flex-row" style="margin-bottom: 12px; align-items: center;">
                <div class="input-wrap" style="flex: 2;">
                    <div class="status-indicator" id="mainCookieStatus"></div>
                    <input type="text" id="manualCookie" placeholder="Paste your ui= cookie here" style="padding-left: 36px;" oninput="resetCookieState()">
                </div>
                <button class="btn btn-secondary" style="flex: 1;" onclick="validateMainCookie()">Check Token</button>
            </div>
            
            <div class="flex-row">
                <button class="btn btn-success" id="setCookieBtn" disabled onclick="setMainCookie()">Set Cookie</button>
                <button class="btn btn-warning" id="overrideCookieBtn" onclick="overrideMainCookie()">Override & Set</button>
            </div>

            <div class="quota-bar-wrap" id="mainCookieQuota">
                <span id="quotaLabel" style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; white-space: nowrap;">⚡ Loading...</span>
                <div class="quota-bar-track">
                    <div class="quota-bar-fill" id="quotaFill" style="width:0%"></div>
                </div>
            </div>
        </div>

        <hr style="border: none; border-top: 1px dashed var(--border); margin: 24px 0;">

        <div class="form-group" style="margin-bottom: 0;">
            <span class="label" style="display: flex; align-items: center;">
                Multi-Cookie Load Balancer 
                <span style="color: var(--primary); font-size: 0.65rem; background: rgba(139,92,246,0.1); padding: 2px 6px; border-radius: 4px; margin-left: 8px;">BETA</span>
            </span>
            <p style="font-size: 0.85rem; margin-bottom: 12px; color: var(--muted);">Add fallback tokens. The addon will dynamically route streams through the account with the most available quota.</p>
            
            <div class="flex-row" style="margin-bottom: 12px;">
                <input type="text" id="multiCookieInput" placeholder="Paste another ui= cookie here" style="flex: 2;">
                <button class="btn btn-secondary" style="flex: 1;" onclick="addMultiCookie()">Add Token</button>
            </div>
            
            <div class="flex-row" style="margin-bottom: 16px;">
                <button class="btn btn-secondary" onclick="validateAllCookies()">Validate All Tokens</button>
                <button class="btn btn-success" onclick="applyMultiCookies()">Apply to Config</button>
            </div>

            <div id="multiCookieList" style="display: flex; flex-direction: column; gap: 8px;"></div>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            2. Stream Proxy (Bypass CORS)
            <label class="switch">
                <input type="checkbox" id="useProxy" class="auto-update" onchange="toggleProxyOptions()">
                <span class="slider"></span>
            </label>
        </div>
        
        <p style="font-size: 0.8rem; color: var(--yellow); margin-bottom: 12px; line-height: 1.4;">
            ⚠️ <b>Notice:</b> Proxying massive video chunks consumes Cloudflare Worker limits instantly. Keep this <b>disabled</b> to preserve server limits if streams load fine without it!
        </p>

        <div id="proxyOptions" class="expandable">
            <div class="form-group">
                <span class="label">Proxy Type</span>
                <select id="proxyType" class="auto-update" onchange="toggleCustomProxy()">
                    <option value="builtin">Built-in Worker Proxy</option>
                    <option value="custom">Custom Hosted Proxy</option>
                </select>
            </div>
            <div class="form-group expandable" id="customProxyWrap">
                <span class="label">Custom Proxy URL</span>
                <input type="text" id="customProxyUrl" class="auto-update" placeholder="https://my-proxy.workers.dev">
                <button class="btn btn-secondary" style="margin-top: 12px; font-size: 0.85rem;" onclick="openGuide()">📖 How to host your own proxy for free</button>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-title">3. Preferences</div>
        <div class="flex-row form-group">
            <div>
                <span class="label">Server Region</span>
                <select id="sbRegion" class="auto-update">
                    <option value="Auto">Auto (Nearest) - Default</option>
                    <option value="USA7">US East (USA7)</option>
                    <option value="USA6">US West (USA6)</option>
                    <option value="USA5">US Middle (USA5)</option>
                    <option value="UK3">United Kingdom (UK3)</option>
                    <option value="CA1">Canada (CA1)</option>
                    <option value="FR1">France (FR1)</option>
                    <option value="DE2">Germany (DE2)</option>
                    <option value="HK1">Hong Kong (HK1)</option>
                    <option value="IN1">India (IN1)</option>
                    <option value="AU1">Australia (AU1)</option>
                    <option value="SZ">China (SZ)</option>
                </select>
            </div>
            <div>
                <span class="label">Min Quality</span>
                <select id="sbMinQuality" class="auto-update">
                    <option value="all">All</option>
                    <option value="1080p">1080p & Up</option>
                    <option value="4K">4K Only</option>
                </select>
            </div>
        </div>
    </div>

    <div class="manifest-box" id="manifestUrl">Waiting for configuration...</div>
    <a href="#" id="installBtn" class="btn btn-primary">Install to Stremio</a>
    <button class="btn btn-secondary" style="margin-top: 12px;" onclick="copyManifest()">Copy Manifest URL</button>
</div>

<div class="toast" id="toast">Message</div>

<div class="modal-overlay" id="guideModal" onclick="closeGuide(event)">
    <div class="modal">
        <div class="modal-header">
            Host Your Own Proxy (Cloudflare)
            <button class="modal-close" onclick="closeGuide()">&times;</button>
        </div>
        <div class="modal-body">
            <p>If the built-in proxy is slow or hits limits, you can deploy your own dedicated proxy worker for free.</p>
            <ol>
                <li>Sign in to <a href="https://dash.cloudflare.com" target="_blank" style="color: var(--primary);">Cloudflare Dashboard</a>.</li>
                <li>Go to <b>Workers & Pages</b> on the left sidebar.</li>
                <li>Click <b>Create application</b> → <b>Create Worker</b>.</li>
                <li>Name it (e.g. <i>my-showbox-proxy</i>) and click <b>Deploy</b>.</li>
                <li>Click <b>Edit code</b>, replace everything with the code below, and click <b>Deploy</b>.</li>
            </ol>
            <pre><code>export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }});
    }
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
            <p>6. Copy your Worker's URL and paste it into the <b>Custom Proxy URL</b> field.</p>
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
            let resp = await fetch('/api/febbox-flow', { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ cookie: cookieVal }) 
            });
            let res = await resp.json();
            if (res && res.ok && res.flow) return { valid: true, flow: res.flow };
            
            resp = await fetch('/api/validate-cookie', { 
                method: 'POST', headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ cookie: cookieVal }) 
            });
            res = await resp.json();
            if (res && res.isValid) return { valid: true, flow: null };
            
            return { valid: false };
        } catch(e) { return { valid: false }; }
    }

    async function validateMainCookie() {
        const val = document.getElementById('manualCookie').value.trim();
        if (!val) return showToast("Enter a main token first.");
        
        const indicator = document.getElementById('mainCookieStatus');
        indicator.className = 'status-indicator status-pending';
        document.getElementById('setCookieBtn').disabled = true;
        mainCookieFlow = null;
        document.getElementById('mainCookieQuota').classList.remove('visible');
        
        const result = await validateSingleCookie(val);
        if (result.valid) {
            indicator.className = 'status-indicator status-valid';
            document.getElementById('setCookieBtn').disabled = false;
            if (result.flow) {
                mainCookieFlow = result.flow;
                showQuota(result.flow);
            }
            showToast("Cookie Validated! Click 'Set Cookie' to apply.");
        } else {
            indicator.className = 'status-indicator status-invalid';
            showToast("Invalid Cookie! Check your token.");
        }
    }

    function showQuota(flow) {
        if (!flow || typeof flow.traffic_limit_mb !== 'number' || typeof flow.traffic_usage_mb !== 'number') return;
        const limit = flow.traffic_limit_mb;
        const used  = flow.traffic_usage_mb;
        const remaining = Math.max(0, limit - used);

        const wrap  = document.getElementById('mainCookieQuota');
        const label = document.getElementById('quotaLabel');
        const fill  = document.getElementById('quotaFill');

        if (limit <= 0) {
            label.textContent = \`⚡ \${formatMB(remaining)} remaining (No Limit)\`;
            fill.style.width = '100%';
            fill.className = 'quota-bar-fill';
        } else {
            const pct = Math.round((remaining / limit) * 100);
            label.textContent = \`⚡ \${formatMB(remaining)} left of \${formatMB(limit)}\`;
            fill.style.width = pct + '%';
            fill.className = 'quota-bar-fill' + (pct <= 10 ? ' empty' : pct <= 30 ? ' low' : '');
        }
        wrap.classList.add('visible');
    }

    function setMainCookie() {
        generateManifest();
        showToast("Main Cookie Set & Config Updated!");
    }

    function overrideMainCookie() {
        const val = document.getElementById('manualCookie').value.trim();
        if (!val) return showToast("Enter a main token first.");
        
        document.getElementById('mainCookieStatus').className = 'status-indicator status-override';
        document.getElementById('setCookieBtn').disabled = false;
        
        generateManifest();
        showToast("Cookie applied manually (Bypassed Validation).");
    }

    function addMultiCookie() {
        const val = document.getElementById('multiCookieInput').value.trim();
        if(!val) return showToast("Paste a fallback token first.");
        if(!nsMultiCookies.some(c => c.value === val)) {
            nsMultiCookies.push({ value: val, isValid: null, flow: null });
            document.getElementById('multiCookieInput').value = '';
            renderMultiCookies();
        } else { showToast("Token already added."); }
    }

    function removeCookie(index) {
        nsMultiCookies.splice(index, 1);
        renderMultiCookies();
        generateManifest();
    }

    async function validateAllCookies() {
        if(nsMultiCookies.length === 0) return showToast("No fallback tokens to validate.");
        showToast("Validating fallback tokens...");
        for(let i=0; i<nsMultiCookies.length; i++) {
            const res = await validateSingleCookie(nsMultiCookies[i].value);
            nsMultiCookies[i].isValid = res.valid;
            if(res.flow) nsMultiCookies[i].flow = res.flow;
            renderMultiCookies();
        }
        showToast("Validation complete.");
    }

    function applyMultiCookies() {
        if(nsMultiCookies.length === 0) return showToast("No fallback tokens to apply.");
        generateManifest();
        showToast("Multi-Tokens Applied & Config Updated!");
    }

    function renderMultiCookies() {
        const list = document.getElementById('multiCookieList');
        list.innerHTML = '';
        nsMultiCookies.forEach((item, idx) => {
            const idShort = shortHash(item.value);
            const flow = item.flow || {};
            const remaining = (typeof flow.traffic_limit_mb === 'number' && typeof flow.traffic_usage_mb === 'number') ? (flow.traffic_limit_mb - flow.traffic_usage_mb) : null;
            let statusClass = 'status-indicator';
            if (item.isValid === true) statusClass = 'status-indicator status-valid';
            if (item.isValid === false) statusClass = 'status-indicator status-invalid';

            list.innerHTML += \`
                <div class="cookie-card">
                    <div class="cookie-info">
                        <div class="cookie-title">
                            <div class="\${statusClass}" style="position: static; margin-right: 6px;"></div>
                            Token \${idx+1} <span class="cookie-hash">#\${idShort}</span>
                        </div>
                        <div class="cookie-quota">\${remaining !== null ? \`⚡ \${formatMB(remaining)} left\` : 'Quota Unknown'}</div>
                    </div>
                    <button class="btn-sm-danger" onclick="removeCookie(\${idx})">Remove</button>
                </div>
            \`;
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
            } else {
                showboxHasQuota = true; 
            }
        }

        nsMultiCookies.forEach(c => {
            cookiesArr.push(c.value);
            if (c.flow && typeof c.flow.traffic_limit_mb === 'number' && typeof c.flow.traffic_usage_mb === 'number') {
                if ((c.flow.traffic_limit_mb - c.flow.traffic_usage_mb) > 0) showboxHasQuota = true;
            } else {
                if (c.isValid) showboxHasQuota = true;
            }
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

        const b64 = btoa(JSON.stringify(config)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
        let manifest = window.location.origin + '/' + b64 + '/manifest.json';
        
        if (cookiesArr.length === 0 && config.showboxRegion === 'Auto' && config.sbMinQuality === 'all' && !config.useProxy) {
            manifest = window.location.origin + '/manifest.json';
        }

        document.getElementById('manifestUrl').innerText = manifest;
        document.getElementById('installBtn').href = manifest.replace(/^https?:\\/\\//, 'stremio://');
    }

    function copyManifest() {
        navigator.clipboard.writeText(document.getElementById('manifestUrl').innerText);
        showToast("Copied to clipboard!");
    }

    document.querySelectorAll('.auto-update').forEach(el => el.addEventListener('input', generateManifest));
    generateManifest();
</script>
</body>
</html>`;

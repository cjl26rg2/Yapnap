// Yapnap: an unofficial desktop app for Yapin' (www.yapper.website). A window around the site with plugins,
// settings and contributor badges added. It is not made by, or affiliated with, Yapin' or the Yapper team.
const { app, BrowserWindow, Menu, Tray, nativeImage, shell, session, desktopCapturer, ipcMain, Notification, dialog } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const GAMES = require('./games');
const updater = require('./updater');
const auth = require('./auth');

const APP_NAME = 'Yapnap';
const APP_VERSION = require('./package.json').version;
const SITE = 'https://www.yapper.website';
const ALLOWED = new Set(['www.yapper.website', 'yapper.website', 'rt.yapper.website', 'lk.yapper.website']);
// Put your own art at build/icon.png (512 px) and build/icon.ico. Until then the app has no custom icon.
const ICON_FILE = path.join(__dirname, 'build', 'icon.png');
const ICON = fs.existsSync(ICON_FILE) ? ICON_FILE : undefined;
const SRC = path.join(__dirname, 'src');
const PLUGIN_DIR = path.join(SRC, 'plugins');
const SETTINGS_PAGE = path.join(__dirname, 'settings', 'index.html');
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// The owner's account ID. Yapnap shows this account as the owner everywhere, even offline.
const OWNER_ID = '879e9081-5614-436d-971a-09481669a35f';
// The shared role list and the role checks live on the website. The app reads them and asks it to change them.
// YAPNAP_ROLES_URL points the app at a local test server (see the testing notes). Normally this is the site.
const ROLES_URL = process.env.YAPNAP_ROLES_URL || 'https://yapnap.pages.dev';
const ROLES_EVERY = 10 * 60 * 1000;
const APP_DEFAULTS = { trayOnClose: true, notifications: true, flashOnMention: true, safeMode: false, zoom: 100, myId: '', roleKey: '', customCss: '' };
const CUSTOM_CSS_MAX = 20000;
// Custom CSS may not load files, import other sheets, run script, or use angle brackets or backslashes.
const BAD_CSS = /url\s*\(|@import|expression\s*\(|javascript:|behavior|-moz-binding|[<>\\]/i;
const DEFAULT_TIERS = {
  owner: { label: 'Owner', color: '#e9b530' },
  'co-owner': { label: 'Co-owner', color: '#ff8c42' },
  manager: { label: 'Manager', color: '#84cc16' },
  admin: { label: 'Admin', color: '#d94a3f' },
  mod: { label: 'Mod', color: '#26a88a' },
  contributor: { label: 'Contributor', color: '#3b6fdb' },
  advertiser: { label: 'Advertiser', color: '#b57bff' },
  partner: { label: 'Partner', color: '#3ec5d9' },
  sponsor: { label: 'Sponsor', color: '#9be564' },
  supporter: { label: 'Supporter', color: '#ff7eb3' },
  translator: { label: 'Translator', color: '#f5e663' },
  artist: { label: 'Artist', color: '#d46bff' },
  designer: { label: 'Designer', color: '#66d1ff' },
  developer: { label: 'Developer', color: '#c0c6d1' },
  tester: { label: 'Tester', color: '#8a94a6' },
  helper: { label: 'Helper', color: '#7bdcb5' },
  veteran: { label: 'Veteran', color: '#c9a227' },
  friend: { label: 'Friend', color: '#d7dbe4' },
};

// Its own name, so its data folder and single-instance lock are separate from the official Yapper app.
app.setName(APP_NAME);

// One copy of the app at a time.
if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;
let tray = null;
let settingsWin = null;
let quitting = false;

// ---------- settings and badges ----------

let prefs = { plugins: {}, app: { ...APP_DEFAULTS } };
let badges = { tiers: {}, users: {} };
// What the website says this app's role key may do: 'owner', 'admin', or null when no key is saved or accepted.
let roleLevel = null;
let grantable = [];
let pageBundle = '';

const prefsFile = () => path.join(app.getPath('userData'), 'yapnap-settings.json');
const rolesCacheFile = () => path.join(app.getPath('userData'), 'roles-cache.json');

/** Keeps only well-formed saved settings. The page checks each value again against its plugin's rules. */
function cleanPrefs(raw) {
  const out = { plugins: {}, app: cleanApp(raw && raw.app) };
  if (!raw || typeof raw !== 'object' || !raw.plugins || typeof raw.plugins !== 'object') return out;
  for (const [id, v] of Object.entries(raw.plugins).slice(0, 500)) {
    if (!ID.test(id) || !v || typeof v !== 'object') continue;
    const entry = {};
    if (typeof v.on === 'boolean') entry.on = v.on;
    if (v.s && typeof v.s === 'object') {
      entry.s = {};
      for (const [k, val] of Object.entries(v.s).slice(0, 20)) {
        if (validSettingValue(k, val)) entry.s[k] = val;
      }
    }
    out.plugins[id] = entry;
  }
  return out;
}

/** Keeps only well-formed global settings. Anything else falls back to the default. */
function cleanApp(raw) {
  const out = { ...APP_DEFAULTS };
  if (!raw || typeof raw !== 'object') return out;
  for (const k of ['trayOnClose', 'notifications', 'flashOnMention', 'safeMode']) if (typeof raw[k] === 'boolean') out[k] = raw[k];
  if (typeof raw.zoom === 'number' && isFinite(raw.zoom)) out.zoom = Math.min(150, Math.max(75, Math.round(raw.zoom)));
  if (typeof raw.myId === 'string' && (raw.myId === '' || /^[A-Za-z0-9-]{8,64}$/.test(raw.myId))) out.myId = raw.myId;
  if (typeof raw.roleKey === 'string' && raw.roleKey.length <= 200) out.roleKey = raw.roleKey.trim();
  if (typeof raw.customCss === 'string' && raw.customCss.length <= CUSTOM_CSS_MAX && !BAD_CSS.test(raw.customCss)) out.customCss = raw.customCss;
  return out;
}

function validSettingValue(key, value) {
  if (!/^[a-z]{1,20}$/.test(key)) return false;
  return typeof value === 'number' || typeof value === 'boolean' || (typeof value === 'string' && value.length <= 16);
}

function loadPrefs() {
  try { prefs = cleanPrefs(JSON.parse(fs.readFileSync(prefsFile(), 'utf8'))); } catch { prefs = { plugins: {}, app: { ...APP_DEFAULTS } }; }
}

function savePrefs() {
  try {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    const tmp = `${prefsFile()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(prefs, null, 2));
    fs.renameSync(tmp, prefsFile());
  } catch (e) { console.error('Could not save settings:', e.message); }
}

/** Keeps only tiers with a valid colour, and users whose tier exists. Names are never used to match badges. */
function cleanBadges(raw) {
  const tiers = {};
  const users = {};
  for (const [key, t] of Object.entries(raw?.tiers || {}).slice(0, 20)) {
    if (!ID.test(key) || !t || typeof t.label !== 'string' || typeof t.color !== 'string') continue;
    if (!/^#[0-9a-f]{6}$/i.test(t.color)) continue;
    tiers[key] = { label: t.label.slice(0, 20), color: t.color };
  }
  for (const [key, t] of Object.entries(DEFAULT_TIERS)) if (!tiers[key]) tiers[key] = t;
  for (const [id, u] of Object.entries(raw?.users || {}).slice(0, 5000)) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || !u || !Object.prototype.hasOwnProperty.call(tiers, u.tier)) continue;
    users[id] = { tier: u.tier, note: typeof u.note === 'string' ? u.note.slice(0, 80) : '' };
  }
  users[OWNER_ID] = { tier: 'owner', note: 'Owner' };
  return { tiers, users };
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

/** The role list: the copy from the last check with the website, else the one shipped with the app. */
function loadBadges() {
  const bundled = readJson(path.join(SRC, 'badges.json')) || {};
  const cached = readJson(rolesCacheFile());
  return cleanBadges({ tiers: bundled.tiers, users: cached && cached.users ? cached.users : bundled.users });
}

/** Asks the website what the saved role key may do. A network failure keeps the last answer. */
async function refreshMe() {
  const key = prefs.app.roleKey;
  if (!key) { roleLevel = null; grantable = []; return; }
  try {
    const res = await fetch(`${ROLES_URL}/api/roles/me`, { headers: { authorization: `Bearer ${key}` } });
    if (res.status === 401) { roleLevel = null; grantable = []; return; }
    const data = res.ok ? await res.json() : null;
    if (!data || typeof data.role !== 'string') return;
    roleLevel = data.role;
    grantable = Array.isArray(data.grantable) ? data.grantable.filter((t) => typeof t === 'string').slice(0, 30) : [];
  } catch (e) { console.error('Could not check the role key:', e.message); }
}

/** Gets the shared role list. Keeps the last good copy when offline. */
async function refreshRoles() {
  try {
    const res = await fetch(`${ROLES_URL}/api/roles`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || typeof data.users !== 'object' || data.users === null) throw new Error('unexpected list');
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(rolesCacheFile(), JSON.stringify({ users: data.users, updated: data.updated || null }));
    badges = loadBadges();
    for (const w of BrowserWindow.getAllWindows()) applyToPage(w.webContents);
  } catch (e) { console.error('Could not update roles:', e.message); }
  await refreshMe();
}

/** Registry, every plugin file, then the runtime, as one script for the page. */
function readPageBundle() {
  const files = fs.readdirSync(PLUGIN_DIR).filter((f) => f.endsWith('.js')).sort();
  return [
    path.join(SRC, 'registry.js'),
    ...files.map((f) => path.join(PLUGIN_DIR, f)),
    path.join(SRC, 'art.js'),
    path.join(SRC, 'panel.js'),
    path.join(SRC, 'settings-nav.js'),
    path.join(SRC, 'runtime.js'),
  ]
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n;\n');
}

/** Runs the page bundle and applies the current settings. Safe to call again: the page keeps one runtime. */
/** What the About page shows about this build. */
function appInfo() {
  return {
    version: APP_VERSION,
    built: fs.statSync(__filename).mtime.toISOString(),
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
    platform: process.platform,
    os: os.release(),
    packaged: app.isPackaged,
  };
}

/** Sends the current page state to every Yapnap window, for example when the update bar changes. */
function pushUpdateState() {
  for (const w of BrowserWindow.getAllWindows()) applyToPage(w.webContents);
}

function applyToPage(wc) {
  if (!wc || wc.isDestroyed() || !pageBundle || !ALLOWED.has(hostOf(wc.getURL()))) return;
  const state = JSON.stringify({ plugins: prefs.plugins, badges, safe: prefs.app.safeMode === true, custom: prefs.app.customCss || '', update: updater.updateStatus() });
  wc.executeJavaScript(`${pageBundle}\n;window.__yapnap && window.__yapnap.apply(${state});`, true).catch(() => undefined);
}

/** Applies the chat zoom from the global settings. */
function applyZoom() {
  if (win && !win.isDestroyed()) win.webContents.setZoomFactor(prefs.app.zoom / 100);
}

function persist() {
  savePrefs();
  applyToPage(win?.webContents);
}

// ---------- the chat window ----------

let loadTimer = null;
let lastUrl = SITE;
let errorPage = false;
let everShown = false;
const LOAD_TIMEOUT = 20_000;
const startHidden = process.argv.includes('--hidden');

function hostOf(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

function esc(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function errorHtml(title, detail, retryUrl) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${APP_NAME}</title><style>
:root{color-scheme:dark}
html,body{margin:0;height:100%;background:#0f1013;color:#eceef3;font:15px/1.55 system-ui,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
body{display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;text-align:center}
.card{width:min(400px,100%);padding:34px 30px 28px;border:1px solid #262830;border-radius:12px;background:#15161b}
.mark{display:grid;place-items:center;width:46px;height:46px;margin:0 auto 18px;border-radius:50%;border:1px solid #e5737c;color:#e5737c;background:rgba(229,115,124,.1)}
.mark svg{width:20px;height:20px}
h1{font-size:19px;font-weight:650;letter-spacing:-.015em;margin:0 0 8px}
p{margin:0 0 22px;color:#a6abb7;font-size:14px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 18px;border-radius:8px;background:#ef9448;border:1px solid #ef9448;color:#140d06;font-weight:600;text-decoration:none}
.btn:hover{background:#f5a867;border-color:#f5a867}
.btn:focus-visible{outline:2px solid #ef9448;outline-offset:3px}
.alt{display:block;margin-top:16px;color:#7d828e;font-size:13px}.alt a{color:#ef9448}
code{display:block;margin-top:20px;padding-top:14px;border-top:1px solid #262830;color:#7d828e;font:12px/1.5 ui-monospace,Consolas,monospace;word-break:break-word}
</style></head><body><div class="card">
<div class="mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></div>
<h1>${esc(title)}</h1>
<p>Check your internet connection. A VPN, proxy or antivirus can also block Yapin'.</p>
<a class="btn" id="retry" href="${esc(retryUrl)}">Retry</a>
<span class="alt">Still stuck? <a href="${esc(SITE)}" target="_blank">Open Yapin' in your browser</a></span>
${detail ? `<code>${esc(detail)}</code>` : ''}
</div><script>
var go=function(){location.href=document.getElementById('retry').href};
addEventListener('online',go);setTimeout(go,60000);
</script></body></html>`;
}

function showLoadError(title, detail) {
  if (!win || win.isDestroyed()) return;
  clearTimeout(loadTimer);
  loadTimer = null;
  errorPage = true;
  const retry = lastUrl && ALLOWED.has(hostOf(lastUrl)) ? lastUrl : SITE;
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml(title, detail, retry))}`).catch(() => undefined);
  if (win.isVisible() || (!startHidden && !everShown)) show();
}

/** Every load of the site goes through here, so a failed one always ends on the error screen. */
function loadSite(url) {
  if (!win) return;
  lastUrl = url;
  win.loadURL(url).catch(() => undefined);
}

function show() {
  if (!win) {
    if (!app.isReady()) return;
    quitting = false;
    createWindow();
    win?.once('ready-to-show', () => { win?.show(); win?.focus(); });
    return;
  }
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 480,
    minHeight: 360,
    backgroundColor: '#17181b',
    icon: ICON,
    title: APP_NAME,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });
  win.once('ready-to-show', () => { if (!startHidden) win.show(); });
  win.on('show', () => { everShown = true; });

  const wc = win.webContents;
  // A fresh load of the site starts the 20 s clock. It stops once the page has its HTML.
  wc.on('did-start-navigation', (d) => {
    if (!d.isMainFrame || d.isSameDocument || d.url.startsWith('data:')) return;
    lastUrl = d.url;
    errorPage = false;
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => showLoadError('Yapin\' is taking too long to load', 'Timed out after 20 s'), LOAD_TIMEOUT);
  });
  wc.on('dom-ready', () => {
    if (errorPage) return;
    clearTimeout(loadTimer);
    loadTimer = null;
    applyToPage(wc);
    applyZoom();
    if (!startHidden && !everShown) win.show();
  });
  wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3 || String(url).startsWith('data:')) return;
    showLoadError('Can\'t reach Yapin\'', `${desc || 'Load failed'} (${code})`);
  });
  wc.on('render-process-gone', (_e, d) => {
    if (d.reason === 'clean-exit') return;
    showLoadError('Yapin\' stopped working', `Page ${d.reason}${d.exitCode ? ` (${d.exitCode})` : ''}`);
  });
  let hangTimer = null;
  win.on('unresponsive', () => {
    clearTimeout(hangTimer);
    hangTimer = setTimeout(() => showLoadError('Yapin\' stopped responding', 'Page unresponsive'), 15_000);
  });
  win.on('responsive', () => { clearTimeout(hangTimer); hangTimer = null; });

  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') {
      e.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    } else if (input.key === 'Escape' && win.isFullScreen()) {
      win.webContents.executeJavaScript('!!document.fullscreenElement && (document.exitFullscreen().catch(() => {}), true)', true)
        .then((wasHtml) => { if (wasHtml && win.isFullScreen()) win.setFullScreen(false); })
        .catch(() => undefined);
    }
  });
  loadSite(SITE);

  // Links to other sites open in the normal browser; the site itself stays in the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (errorPage) { if (/^https:\/\//.test(url)) void shell.openExternal(url); return { action: 'deny' }; }
    try {
      if (ALLOWED.has(new URL(url).hostname)) { loadSite(url); return { action: 'deny' }; }
    } catch { /* not a URL */ }
    void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    try { if (!ALLOWED.has(new URL(url).hostname)) { e.preventDefault(); void shell.openExternal(url); } } catch { e.preventDefault(); }
  });

  // Closing the window keeps the app in the tray, so calls keep running. Quit from the tray.
  win.on('close', (e) => {
    if (quitting) return;
    if (!prefs.app.trayOnClose) { quitting = true; app.quit(); return; }
    e.preventDefault();
    win.hide();
  });
  win.on('closed', () => { win = null; });
}

// ---------- the settings window ----------

/** Only the fallback settings window and the Yapin' site may use the settings API. */
function fromTrusted(e) {
  const fromWindow = !!settingsWin && !settingsWin.isDestroyed() && e.sender === settingsWin.webContents;
  return fromWindow || ALLOWED.has(hostOf(e.senderFrame?.url ?? ''));
}

/** Opens Yapin's own settings with the Yapnap panel in them. Falls back to a separate window if that fails. */
async function openSettings() {
  const wc = win?.webContents;
  if (wc && !wc.isDestroyed() && ALLOWED.has(hostOf(wc.getURL()))) {
    show();
    const ok = await wc.executeJavaScript('window.__yapnapUI ? window.__yapnapUI.open() : false', true).catch(() => false);
    if (ok) return;
  }
  openStandalone();
}

function openStandalone() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    if (settingsWin.isMinimized()) settingsWin.restore();
    settingsWin.show();
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 720,
    minHeight: 480,
    title: `${APP_NAME} settings`,
    backgroundColor: '#17181b',
    icon: ICON,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  settingsWin.once('ready-to-show', () => { settingsWin?.show(); settingsWin?.focus(); });
  settingsWin.on('closed', () => { settingsWin = null; });
  // If the page cannot load, still show the window so it is never invisible.
  settingsWin.loadFile(SETTINGS_PAGE).catch((err) => {
    console.error('Settings failed to load:', err.message);
    settingsWin?.show();
  });
}

// The menu gives Settings a real Ctrl+, shortcut that works whatever has focus in the chat.
// The menu bar stays hidden; the accelerators still work.
function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: APP_NAME,
      submenu: [
        { label: 'Settings', accelerator: 'Ctrl+,', click: openSettings },
        { label: 'Check for updates', click: updater.checkFromMenu },
        { label: 'Reload chat', accelerator: 'Ctrl+R', click: () => win?.webContents.reload() },
        { type: 'separator' },
        { label: `Quit ${APP_NAME}`, accelerator: 'Ctrl+Q', click: () => { quitting = true; app.quit(); } },
      ],
    },
  ]));
}

// ---------- tray ----------

function createTray() {
  const img = ICON ? nativeImage.createFromPath(ICON).resize({ width: 16, height: 16 }) : nativeImage.createEmpty();
  tray = new Tray(img);
  tray.setToolTip(APP_NAME);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: `Open ${APP_NAME}`, click: show },
    { label: 'Settings', click: openSettings },
    { type: 'separator' },
    { label: `Quit ${APP_NAME}`, click: () => { quitting = true; app.quit(); } },
  ]));
  tray.on('click', show);
  tray.on('double-click', show);
}

// ---------- screen sharing ----------

const SOURCE_ID = /^(screen|window):[\w:-]{1,64}$/;
const PICK_TTL = 30_000;
let pendingPick = null;

/** Only the Yapin' site itself may list or pick screens. */
function fromSite(e) {
  return ALLOWED.has(hostOf(e.senderFrame?.url ?? ''));
}
function takePick(req) {
  const p = pendingPick;
  pendingPick = null;
  if (!p || Date.now() - p.at > PICK_TTL) return null;
  if (req?.frame && !ALLOWED.has(hostOf(req.frame.url))) return null;
  return p.id;
}
/** "window:1234:0" -> "window:1234", so our own window matches whatever suffix the capturer uses. */
function windowKey(id) {
  return String(id).split(':').slice(0, 2).join(':');
}
function ownWindowKey() {
  try { return win && typeof win.getMediaSourceId === 'function' ? windowKey(win.getMediaSourceId()) : ''; } catch { return ''; }
}

app.on('second-instance', () => show());

app.whenReady().then(() => {
  // The site can tell it is running in this app; the mod's own name is added to the user agent.
  app.userAgentFallback = `${app.userAgentFallback} ${APP_NAME}/${APP_VERSION}`;
  if (process.platform === 'win32') app.setAppUserModelId('dev.yapnap.desktop');

  loadPrefs();
  badges = loadBadges();
  try { pageBundle = readPageBundle(); } catch (e) { console.error('Could not read plugins:', e.message); }

  const ses = session.defaultSession;
  // Mic, camera and notifications: yes for the site, no for anything else.
  ses.setPermissionRequestHandler((wc, permission, cb, details) => {
    let host = '';
    try { host = new URL(details.requestingUrl || wc.getURL()).hostname; } catch { /* ignore */ }
    cb(ALLOWED.has(host) && ['media', 'notifications', 'display-capture', 'clipboard-read', 'clipboard-sanitized-write', 'fullscreen'].includes(permission));
  });
  ses.setPermissionCheckHandler((wc, permission, origin) => {
    try { return ALLOWED.has(new URL(origin).hostname); } catch { return false; }
  });
  // Screen sharing: the site shows its own picker, sends the pick, then calls getDisplayMedia, which lands here.
  ses.setDisplayMediaRequestHandler(async (req, cb) => {
    try {
      const picked = takePick(req);
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 0, height: 0 } });
      const chosen = picked && sources.find((s) => s.id === picked);
      if (chosen) {
        const loopback = chosen.id.startsWith('screen:') && process.platform === 'win32';
        return cb(loopback ? { video: chosen, audio: 'loopback' } : { video: chosen });
      }
      const screen = sources.find((s) => s.id.startsWith('screen')) ?? sources[0];
      if (!screen) return cb({});
      cb({ video: screen, audio: 'loopback' });
    } catch { cb({}); }
  }, { useSystemPicker: false });

  // The app opens only after a Yapnap sign-in. Until then the sign-in window is the only thing shown.
  void auth.ensureSignedIn().then((ok) => {
    if (!ok) { quitting = true; app.quit(); return; }
    createWindow();
    createTray();
    buildMenu();
    // First launch: open settings once, so the plugins are easy to find.
    if (!fs.existsSync(prefsFile())) setTimeout(() => openSettings(), 4000);
  });

  ipcMain.on('yapper:badge', (_e, count) => {
    if (process.platform === 'darwin') app.dock?.setBadge(count > 0 ? String(count) : '');
    else if (win) win.setOverlayIcon(null, '');
    if (win && count > 0 && !win.isFocused() && prefs.app.flashOnMention) win.flashFrame(true);
  });
  ipcMain.on('yapper:notify', (_e, n) => {
    if (!Notification.isSupported() || !prefs.app.notifications || (win && win.isFocused())) return;
    const note = new Notification({ title: String(n?.title ?? APP_NAME).slice(0, 80), body: String(n?.body ?? '').slice(0, 180), icon: ICON, silent: true });
    note.on('click', () => { show(); if (n?.url) loadSite(`${SITE}${n.url}`); });
    note.show();
  });
  ipcMain.handle('yapper:screen-sources', async (e) => {
    if (!fromSite(e)) return [];
    const own = ownWindowKey();
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 320, height: 180 }, fetchWindowIcon: true });
    return sources
      .filter((s) => !(own && s.id.startsWith('window:') && windowKey(s.id) === own))
      .map((s) => ({
        id: s.id,
        name: String(s.name || '').slice(0, 120),
        kind: s.id.startsWith('screen:') ? 'screen' : 'window',
        thumb: s.thumbnail && !s.thumbnail.isEmpty() ? `data:image/jpeg;base64,${s.thumbnail.toJPEG(70).toString('base64')}` : null,
        icon: s.appIcon && !s.appIcon.isEmpty() ? s.appIcon.resize({ width: 32, height: 32 }).toDataURL() : null,
      }));
  });
  ipcMain.handle('yapper:screen-pick', (e, id) => {
    if (!fromSite(e) || typeof id !== 'string' || !SOURCE_ID.test(id)) { pendingPick = null; return false; }
    pendingPick = { id, at: Date.now() };
    return true;
  });

  // Settings window.
  ipcMain.handle('mod:state', (e) => {
    if (!fromTrusted(e)) return null;
    // The role key itself never goes to the page. The page only learns whether one is saved.
    const { roleKey, ...appSettings } = prefs.app;
    return {
      version: APP_VERSION,
      badges,
      plugins: prefs.plugins,
      app: { ...appSettings, hasRoleKey: Boolean(roleKey) },
      roleLevel,
      grantable,
      info: appInfo(),
      account: auth.account(),
    };
  });
  ipcMain.handle('mod:set-plugin', (e, id, on) => {
    if (!fromTrusted(e) || typeof id !== 'string' || !ID.test(id) || typeof on !== 'boolean') return false;
    if (Object.keys(prefs.plugins).length >= 500 && !prefs.plugins[id]) return false;
    prefs.plugins[id] = { ...prefs.plugins[id], on };
    persist();
    return true;
  });
  ipcMain.handle('mod:set-setting', (e, id, key, value) => {
    if (!fromTrusted(e) || typeof id !== 'string' || !ID.test(id) || !validSettingValue(key, value)) return false;
    const cur = prefs.plugins[id] || {};
    prefs.plugins[id] = { ...cur, s: { ...cur.s, [key]: value } };
    persist();
    return true;
  });
  ipcMain.handle('mod:reset', (e) => {
    if (!fromTrusted(e)) return false;
    prefs = { plugins: {}, app: prefs.app };
    persist();
    return true;
  });
  ipcMain.handle('mod:set-app', async (e, key, value) => {
    if (!fromTrusted(e) || typeof key !== 'string') return false;
    if (key === 'zoom') {
      if (typeof value !== 'number' || !isFinite(value)) return false;
      prefs.app.zoom = Math.min(150, Math.max(75, Math.round(value)));
      applyZoom();
    } else if (key === 'myId') {
      if (typeof value !== 'string' || (value !== '' && !/^[A-Za-z0-9-]{8,64}$/.test(value))) return false;
      prefs.app.myId = value;
    } else if (key === 'customCss') {
      if (typeof value !== 'string' || value.length > CUSTOM_CSS_MAX || BAD_CSS.test(value)) return false;
      prefs.app.customCss = value;
    } else if (key === 'roleKey') {
      if (typeof value !== 'string' || value.length > 200) return false;
      prefs.app.roleKey = value.trim();
      persist();
      await refreshMe();
      return true;
    } else if (['trayOnClose', 'notifications', 'flashOnMention', 'safeMode'].includes(key)) {
      if (typeof value !== 'boolean') return false;
      prefs.app[key] = value;
    } else {
      return false;
    }
    persist();
    return true;
  });
  // The website checks who may give what. The app only sends the request with the saved role key.
  ipcMain.handle('mod:grant', async (e, userId, tier) => {
    if (!fromTrusted(e)) return { ok: false, reason: 'Not allowed here.' };
    if (typeof userId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(userId)) return { ok: false, reason: 'That does not look like a user ID.' };
    if (tier !== null && typeof tier !== 'string') return { ok: false, reason: 'Unknown role.' };
    const key = prefs.app.roleKey;
    if (!key) return { ok: false, reason: 'Paste your role key in the Roles section first.' };
    let res;
    try {
      res = await fetch(`${ROLES_URL}/api/roles/grant`, {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ userId, tier }),
      });
    } catch { return { ok: false, reason: 'Could not reach the role server. Check your connection.' }; }
    let data = null;
    try { data = await res.json(); } catch { /* the answer was not JSON */ }
    if (!data || typeof data.ok !== 'boolean') return { ok: false, reason: 'The role server gave an unexpected answer.' };
    if (!data.ok) return { ok: false, reason: String(data.reason || 'Could not change that role.').slice(0, 200) };
    await refreshRoles();
    return { ok: true };
  });
  // Settings in a file. The role key is never written to the file, and never read from it.
  ipcMain.handle('mod:export-settings', async (e) => {
    if (!fromTrusted(e)) return { ok: false, reason: 'Not allowed here.' };
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Yapnap settings',
      defaultPath: 'yapnap-settings.json',
      filters: [{ name: 'Yapnap settings', extensions: ['json'] }],
    });
    if (canceled || !filePath) return { ok: false, reason: 'Cancelled.' };
    const { roleKey, ...app } = prefs.app;
    fs.writeFileSync(filePath, JSON.stringify({ format: 'yapnap-settings', version: 1, plugins: prefs.plugins, app }, null, 2));
    return { ok: true, path: filePath };
  });
  ipcMain.handle('mod:import-settings', async (e) => {
    if (!fromTrusted(e)) return { ok: false, reason: 'Not allowed here.' };
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Load Yapnap settings',
      properties: ['openFile'],
      filters: [{ name: 'Yapnap settings', extensions: ['json'] }],
    });
    if (canceled || !filePaths[0]) return { ok: false, reason: 'Cancelled.' };
    let raw;
    try { raw = JSON.parse(fs.readFileSync(filePaths[0], 'utf8')); } catch { return { ok: false, reason: 'That file is not valid JSON.' }; }
    if (!raw || raw.format !== 'yapnap-settings') return { ok: false, reason: 'That is not a Yapnap settings file.' };
    const cleaned = cleanPrefs({ plugins: raw.plugins, app: raw.app });
    cleaned.app.roleKey = prefs.app.roleKey; // this computer keeps its own role key
    prefs = cleaned;
    persist();
    await refreshMe();
    return { ok: true };
  });

  // Signing out ends this session and starts the app again, which asks for a sign-in.
  ipcMain.handle('mod:sign-out', (e) => {
    if (!fromTrusted(e)) return false;
    auth.signOut();
    quitting = true;
    app.relaunch();
    app.quit();
    return true;
  });

  ipcMain.handle('mod:open-data', (e) => {
    if (!fromTrusted(e)) return false;
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    void shell.openPath(app.getPath('userData'));
    return true;
  });

  // The site's own "Restart to update" bar is never offered. Yapnap updates itself from its GitHub releases instead.
  // The update bar's button. Only the Yapnap page itself may use it.
  ipcMain.handle('yapper:update-install', (e) => (fromSite(e) ? updater.installUpdate() : false));

  updater.start(pushUpdateState);

  // The shared role list: read now, then every 10 minutes, so role changes reach everyone without an update.
  void refreshRoles();
  setInterval(() => { void refreshRoles(); }, ROLES_EVERY);
});

// "Playing X": every 20 s look at the running programs for a known game (games.js) and tell the page.
// Only the game's name leaves this machine, and only while it runs.
let lastGame = null;
function listProcesses() {
  return new Promise((resolve) => {
    const done = (err, out) => resolve(err ? [] : String(out).split(/\r?\n/));
    if (process.platform === 'win32') execFile('tasklist', ['/FO', 'CSV', '/NH'], { windowsHide: true, maxBuffer: 8e6 }, done);
    else execFile('ps', ['-axo', 'comm='], { maxBuffer: 8e6 }, done);
  }).then((lines) => {
    const names = new Set();
    for (const line of lines) {
      const raw = process.platform === 'win32' ? (/^"([^"]+)"/.exec(line) || [])[1] : line.trim().split('/').pop();
      if (raw) names.add(raw.toLowerCase());
    }
    return names;
  });
}
const HELPER = /launch|install|update|crash|helper|service|setup|bootstrap|widget|provider|uninst|webview|handler|tray|agent|server|report/;
function matchGame(proc, key) {
  const base = proc.replace(/\.exe$/, '');
  if (key.endsWith('.exe')) return base === key.slice(0, -4);
  if (process.platform === 'linux' && proc.length === 15 && key.startsWith(proc)) return true;
  return base.startsWith(key) && !HELPER.test(base.slice(key.length));
}
function withWindow(procs) {
  if (process.platform !== 'win32' || !procs.length) return Promise.resolve(null);
  const list = procs.map((p) => `'${p.replace(/\.exe$/, '').replace(/'/g, "''")}'`).join(',');
  const cmd = `Get-Process -Name ${list} -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object { $_.ProcessName }; exit 0`;
  return new Promise((resolve) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', cmd], { windowsHide: true, timeout: 15_000 }, (err, out) => {
      if (err) return resolve(null);
      resolve(new Set(String(out).split(/\r?\n/).map((l) => l.trim().toLowerCase()).filter(Boolean)));
    });
  });
}
let polling = false;
async function pollGames() {
  if (polling) return;
  polling = true;
  try {
    const procs = [...(await listProcesses())];
    const hits = [];
    for (const [key, name] of GAMES) for (const p of procs) if (matchGame(p, key)) hits.push([p, name]);
    let found = null;
    if (hits.length) {
      const shown = await withWindow([...new Set(hits.map(([p]) => p))]);
      const hit = shown ? hits.find(([p]) => shown.has(p.replace(/\.exe$/, ''))) : hits[0];
      found = hit ? hit[1] : null;
    }
    if (found !== lastGame) { lastGame = found; win?.webContents.send('yapper:activity', found); }
  } finally {
    polling = false;
  }
}
ipcMain.on('yapper:activity:ask', (e) => e.sender.send('yapper:activity', lastGame));
setInterval(() => { pollGames().catch(() => undefined); }, 20_000);
setTimeout(() => { pollGames().catch(() => undefined); }, 3000);

app.on('before-quit', () => { quitting = true; });
// Quitting must really end the app, even if something holds it up.
app.on('will-quit', () => { setTimeout(() => app.exit(0), 8_000).unref?.(); });
app.on('window-all-closed', () => { /* stays in the tray */ });
app.on('activate', () => { if (win) show(); else createWindow(); });

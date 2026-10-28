// The small bridges the pages get: window.yapperDesktop (the site's desktop features) and window.yapnap (the mod's
// settings API, used by the settings panel). Nothing else from Node reaches the page.
const { contextBridge, ipcRenderer } = require('electron');

// Only the mod's own settings. Main checks the sender before it acts on any of these calls.
// The calls that change something important (roles, the role key, files, theme files, sign-out) also need a click first.
// A script on the page cannot make a click, so a script that gets into the page cannot use them on its own.
const clicked = () => Boolean(navigator.userActivation && navigator.userActivation.isActive);
const withClick = (fail, call) => (...args) => (clicked() ? call(...args) : Promise.resolve(fail));
const NEEDS_CLICK = { ok: false, reason: 'Click the button again to do that.' };

contextBridge.exposeInMainWorld('yapnap', {
  version: '1.1.0',
  state: () => ipcRenderer.invoke('mod:state'),
  setPlugin: (id, on) => ipcRenderer.invoke('mod:set-plugin', String(id), on === true),
  setSetting: (id, key, value) => ipcRenderer.invoke('mod:set-setting', String(id), String(key), value),
  setPlugins: (changes) => ipcRenderer.invoke('mod:set-plugins', changes),
  resetPlugin: (id) => ipcRenderer.invoke('mod:reset-plugin', String(id)),
  reset: withClick(false, () => ipcRenderer.invoke('mod:reset')),
  openDataFolder: withClick(false, () => ipcRenderer.invoke('mod:open-data')),
  signOut: withClick(false, () => ipcRenderer.invoke('mod:sign-out')),
  importTheme: withClick(NEEDS_CLICK, () => ipcRenderer.invoke('mod:import-theme')),
  removeTheme: withClick(false, () => ipcRenderer.invoke('mod:remove-theme')),
  // The marketplace. Installing a mod needs a click, like the other changes that matter.
  marketIndex: (refresh) => ipcRenderer.invoke('mod:market-index', refresh === true),
  marketInstall: withClick(NEEDS_CLICK, (id) => ipcRenderer.invoke('mod:market-install', String(id))),
  marketRemove: withClick(false, (id) => ipcRenderer.invoke('mod:market-remove', String(id))),
  security: () => ipcRenderer.invoke('mod:security'),
  // Only changing the role key needs a click. The other settings change without one.
  setApp: (key, value) => (String(key) === 'roleKey' && !clicked() ? Promise.resolve(false) : ipcRenderer.invoke('mod:set-app', String(key), value)),
  grant: withClick(NEEDS_CLICK, (userId, tier) => ipcRenderer.invoke('mod:grant', String(userId), tier === null ? null : String(tier))),
  exportSettings: withClick(NEEDS_CLICK, () => ipcRenderer.invoke('mod:export-settings')),
  importSettings: withClick(NEEDS_CLICK, () => ipcRenderer.invoke('mod:import-settings')),
});

contextBridge.exposeInMainWorld('yapperDesktop', {
  version: '1.1.0',
  platform: process.platform,
  /** Unread count for the taskbar/dock. */
  setBadge: (count) => ipcRenderer.send('yapper:badge', Number(count) || 0),
  /** A native notification; `url` is the in-app path to open on click. */
  notify: (n) => ipcRenderer.send('yapper:notify', { title: n?.title, body: n?.body, url: n?.url }),
  /** The game the app sees running, or null. Called whenever it changes. */
  onActivity: (cb) => { ipcRenderer.on('yapper:activity', (_e, name) => cb(name ?? null)); ipcRenderer.send('yapper:activity:ask'); },
  /** The app has its own screen picker (screenSources + pickScreenSource). */
  screenPicker: !(process.platform === 'linux' && process.env.XDG_SESSION_TYPE === 'wayland'),
  /** Screens and app windows to share: [{ id, name, kind: 'screen' | 'window', thumb, icon }]. */
  screenSources: () => ipcRenderer.invoke('yapper:screen-sources'),
  /** Remember what to share; the next getDisplayMedia (within 30 s) uses it instead of the whole screen. */
  pickScreenSource: (id) => ipcRenderer.invoke('yapper:screen-pick', String(id ?? '')),
  /** The site's own update bar is never used: Yapnap updates itself from its GitHub releases (updater.js). */
  onUpdateReady: () => undefined,
  installUpdate: () => ipcRenderer.invoke('yapper:update-install'),
});

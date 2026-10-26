// The small bridges the pages get: window.yapperDesktop (the site's desktop features) and window.yapnap (the mod's
// settings API, used by the settings panel). Nothing else from Node reaches the page.
const { contextBridge, ipcRenderer } = require('electron');

// Only the mod's own settings. Main checks the sender before it acts on any of these calls.
contextBridge.exposeInMainWorld('yapnap', {
  version: '0.3.0',
  state: () => ipcRenderer.invoke('mod:state'),
  setPlugin: (id, on) => ipcRenderer.invoke('mod:set-plugin', String(id), on === true),
  setSetting: (id, key, value) => ipcRenderer.invoke('mod:set-setting', String(id), String(key), value),
  reset: () => ipcRenderer.invoke('mod:reset'),
  openDataFolder: () => ipcRenderer.invoke('mod:open-data'),
  setApp: (key, value) => ipcRenderer.invoke('mod:set-app', String(key), value),
  grant: (userId, tier) => ipcRenderer.invoke('mod:grant', String(userId), tier === null ? null : String(tier)),
  exportSettings: () => ipcRenderer.invoke('mod:export-settings'),
  importSettings: () => ipcRenderer.invoke('mod:import-settings'),
});

contextBridge.exposeInMainWorld('yapperDesktop', {
  version: '0.3.0',
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

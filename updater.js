// Yapnap's own updates. It checks the GitHub releases page for a newer version and downloads it in the background.
// The installed Windows app and the AppImage then ask to restart, or install when you quit. The portable exe cannot
// replace itself, so for it this only tells you that a new version is out.
const fs = require('node:fs');
const path = require('node:path');
const { app, dialog, Notification, shell } = require('electron');
const { autoUpdater } = require('electron-updater');

const RELEASES_URL = 'https://github.com/cjl26rg2/Yapnap/releases/latest';
const FIRST_CHECK_MS = 15_000;
const EVERY_MS = 4 * 60 * 60 * 1000;

const portable = process.platform === 'win32' && Boolean(process.env.PORTABLE_EXECUTABLE_FILE);
let manualCheck = false;

/** Writes to updater.log in the data folder, so a failed update can be looked at. */
function log(...parts) {
  const text = parts.map((p) => (p instanceof Error ? p.message : String(p))).join(' ');
  try {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.appendFileSync(path.join(app.getPath('userData'), 'updater.log'), `${new Date().toISOString()} ${text}\n`);
  } catch { /* the log is only for support; it never stops the app */ }
}

function check() {
  return autoUpdater.checkForUpdates().catch((err) => log('check failed:', err));
}

/** A new version was found in the portable build: say so, and let the user get it from the releases page. */
function announcePortable(version) {
  if (manualCheck) {
    manualCheck = false;
    void dialog.showMessageBox({
      type: 'info',
      buttons: ['Open releases page', 'Later'],
      defaultId: 0,
      cancelId: 1,
      message: `Yapnap ${version} is out.`,
      detail: 'The portable version cannot update itself. Download the new one from the releases page.',
    }).then(({ response }) => { if (response === 0) void shell.openExternal(RELEASES_URL); });
    return;
  }
  if (!Notification.isSupported()) return;
  const note = new Notification({ title: 'Yapnap update', body: `Version ${version} is out. Click to download it.`, silent: true });
  note.on('click', () => void shell.openExternal(RELEASES_URL));
  note.show();
}

/** Starts the checks. Only the installed app checks, so a development run (npm start) never reaches GitHub. */
function start() {
  if (!app.isPackaged) return;
  autoUpdater.logger = { info: log, warn: log, error: log, debug: () => undefined };
  autoUpdater.autoDownload = !portable;
  autoUpdater.autoInstallOnAppQuit = !portable;

  autoUpdater.on('update-available', (info) => {
    log('update available:', info.version, portable ? '(portable: not downloaded)' : '');
    if (portable) announcePortable(info.version);
  });

  autoUpdater.on('update-not-available', () => {
    log('up to date:', app.getVersion());
    if (manualCheck) {
      manualCheck = false;
      void dialog.showMessageBox({ type: 'info', message: `Yapnap ${app.getVersion()} is the latest version.` });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log('update downloaded:', info.version);
    manualCheck = false;
    if (portable) return;
    void dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      message: `Yapnap ${info.version} is ready.`,
      detail: 'Restart to finish updating. If you choose Later, it installs the next time you quit.',
    }).then(({ response }) => { if (response === 0) autoUpdater.quitAndInstall(); });
  });

  autoUpdater.on('error', (err) => {
    log('updater error:', err);
    if (manualCheck) {
      manualCheck = false;
      void dialog.showMessageBox({ type: 'error', message: 'Could not check for updates.', detail: String(err?.message ?? err).slice(0, 300) });
    }
  });

  setTimeout(check, FIRST_CHECK_MS);
  setInterval(check, EVERY_MS);
}

/** From the app menu: check now, and say what happened even when the answer is "nothing new". */
function checkFromMenu() {
  if (!app.isPackaged) {
    void dialog.showMessageBox({ type: 'info', message: 'Updates are only checked in the installed app.' });
    return;
  }
  manualCheck = true;
  void check();
}

module.exports = { start, checkFromMenu };

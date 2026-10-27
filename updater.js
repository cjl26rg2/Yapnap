// Yapnap's own updates. It checks the GitHub releases page for a newer version and downloads it in the background.
// The installed Windows app and the AppImage then ask to restart, or install when you quit. The portable exe cannot
// replace itself, so for it this only tells you that a new version is out.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { app, dialog, Notification, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const { readZipFile, isNewer } = require('./zipfile');

const LATEST_API = 'https://api.github.com/repos/cjl26rg2/Yapnap/releases/latest';

const RELEASES_URL = 'https://github.com/cjl26rg2/Yapnap/releases/latest';
const FIRST_CHECK_MS = 15_000;
const EVERY_MS = 4 * 60 * 60 * 1000;

const portable = process.platform === 'win32' && Boolean(process.env.PORTABLE_EXECUTABLE_FILE);
let manualCheck = false;

// What the update bar in the app shows: the newest version known, and whether it is ready to start.
const status = { version: null, ready: false };
let restartPath = null; // the AppImage that was replaced from a release zip, when there is one
let onChange = () => undefined;

function setStatus(next) {
  Object.assign(status, next);
  onChange();
}

/** The update bar's data. Null means nothing to show. */
function updateStatus() {
  return status.version ? { version: status.version, ready: status.ready, url: RELEASES_URL } : null;
}

/** Starts the new AppImage and quits this one. */
function restartInto(file) {
  spawn(file, [], { detached: true, stdio: 'ignore' }).unref();
  app.exit(0);
  return true;
}

/** The update bar's button: restart into a ready update, or open the releases page. */
function installUpdate() {
  if (status.ready && restartPath) return restartInto(restartPath);
  if (status.ready && !portable) {
    autoUpdater.quitAndInstall();
    return true;
  }
  void shell.openExternal(RELEASES_URL);
  return true;
}

/** Writes to updater.log in the data folder, so a failed update can be looked at. */
function log(...parts) {
  const text = parts.map((p) => (p instanceof Error ? p.message : String(p))).join(' ');
  try {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.appendFileSync(path.join(app.getPath('userData'), 'updater.log'), `${new Date().toISOString()} ${text}\n`);
  } catch { /* the log is only for support; it never stops the app */ }
}

function check() {
  // The portable exe cannot be installed by the updater, so it takes its update from the release zip instead.
  if (portableExe()) {
    return updateFromZip().catch((e) => {
      log('zip check failed:', e);
      if (manualCheck) {
        manualCheck = false;
        void dialog.showMessageBox({ type: 'error', message: 'Could not update from the release.', detail: String(e && e.message || e).slice(0, 300) });
      }
    });
  }
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

/** The portable exe this copy runs from, or null. Set by the portable Windows build only. */
function portableExe() {
  return process.platform === 'win32' && process.env.PORTABLE_EXECUTABLE_FILE ? process.env.PORTABLE_EXECUTABLE_FILE : null;
}

/** Which release zip this copy updates from: the AppImage zip on Linux, the portable zip on Windows. */
function zipKind() {
  if (appImagePath()) return { asset: /AppImage.*\.zip$/i, entry: /\.AppImage$/i, magic: '7f454c46', target: appImagePath() };
  if (portableExe()) return { asset: /portable.*\.zip$/i, entry: /\.exe$/i, magic: '4d5a', target: portableExe() };
  return null;
}

/** The AppImage this app runs from, or null. Only the Linux AppImage build has one. */
function appImagePath() {
  return process.platform === 'linux' && process.env.APPIMAGE ? process.env.APPIMAGE : null;
}

/** Updates the AppImage from the release zip, for a release that has no update file. GitHub's checksum for the zip
 *  must match, or nothing changes. The new file takes the old file's place, so shortcuts to it keep working. */
async function updateFromZipOnce() {
  // Installed copies have no target to replace, so they only learn that a version is out.
  const kind = zipKind() || { asset: /portable.*\.zip$/i, target: null };
  const res = await fetch(LATEST_API, { headers: { accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  const release = await res.json();
  const version = String(release.tag_name || '').replace(/^v/i, '');
  if (!isNewer(version, app.getVersion())) {
    log('zip check: up to date', app.getVersion());
    setStatus({ version: null, ready: false });
    if (manualCheck) {
      manualCheck = false;
      void dialog.showMessageBox({ type: 'info', message: `Yapnap ${app.getVersion()} is the latest version.` });
    }
    return;
  }
  manualCheck = false;
  const asset = (release.assets || []).find((a) => kind.asset.test(a.name));
  if (!asset) throw new Error('the newest release has no update zip');
  if (!kind.target) {
    setStatus({ version, ready: false });
    if (Notification.isSupported()) {
      const note = new Notification({ title: 'Yapnap update', body: `Version ${version} is out. Click to download it.`, silent: true });
      note.on('click', () => void shell.openExternal(RELEASES_URL));
      note.show();
    }
    return;
  }
  const sum = /^sha256:([0-9a-f]{64})$/i.exec(asset.digest || '');
  if (!sum) {
    log('zip check: no checksum for', asset.name, '; not installing it automatically');
    setStatus({ version, ready: false });
    if (Notification.isSupported()) {
      const note = new Notification({ title: 'Yapnap update', body: `Version ${version} is out. Click to download it.`, silent: true });
      note.on('click', () => void shell.openExternal(RELEASES_URL));
      note.show();
    }
    return;
  }

  const download = await fetch(asset.browser_download_url);
  if (!download.ok) throw new Error(`download answered ${download.status}`);
  const zip = Buffer.from(await download.arrayBuffer());
  if (crypto.createHash('sha256').update(zip).digest('hex') !== sum[1]) throw new Error("the zip does not match GitHub's checksum");
  const data = readZipFile(zip, (name) => kind.entry.test(name));
  if (data.subarray(0, kind.magic.length / 2).toString('hex') !== kind.magic) throw new Error('the file in the zip is not the right program');

  const next = `${kind.target}.update`;
  fs.writeFileSync(next, data, { mode: 0o755 });
  // A running exe can be renamed on Windows but not overwritten, so the old one is moved aside first.
  if (portableExe()) fs.renameSync(kind.target, `${kind.target}.old`);
  try {
    fs.renameSync(next, kind.target);
  } catch (err) {
    // Put the working copy back, so a failed update never leaves the app missing.
    if (portableExe()) fs.renameSync(`${kind.target}.old`, kind.target);
    throw err;
  }
  log('zip check: replaced with', version);
  restartPath = kind.target;
  setStatus({ version, ready: true });

  const { response } = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Restart now', 'Later'],
    defaultId: 0,
    cancelId: 1,
    message: `Yapnap ${version} is ready.`,
    detail: 'Restart to finish updating. If you choose Later, the new version starts the next time you open Yapnap.',
  });
  if (response === 0) restartInto(kind.target);
}

// A manual check and the timed check can overlap. Only one may replace the file at a time.
let zipCheck = null;
function updateFromZip() {
  if (!zipCheck) zipCheck = updateFromZipOnce().finally(() => { zipCheck = null; });
  return zipCheck;
}

/** Starts the checks. Only the installed app checks, so a development run (npm start) never reaches GitHub. */
function start(changed) {
  onChange = changed || onChange;
  // Clears the exe moved aside by the last portable update, once the old copy has closed.
  if (portableExe()) {
    try { fs.rmSync(`${portableExe()}.old`, { force: true }); } catch { /* still in use; tried again next start */ }
  }
  if (!app.isPackaged) return;
  autoUpdater.logger = { info: log, warn: log, error: log, debug: () => undefined };
  autoUpdater.autoDownload = !portable;
  autoUpdater.autoInstallOnAppQuit = !portable;

  autoUpdater.on('update-available', (info) => {
    log('update available:', info.version, portable ? '(portable: not downloaded)' : '');
    setStatus({ version: info.version, ready: false });
    if (portable) announcePortable(info.version);
  });

  autoUpdater.on('update-not-available', () => {
    log('up to date:', app.getVersion());
    setStatus({ version: null, ready: false });
    if (manualCheck) {
      manualCheck = false;
      void dialog.showMessageBox({ type: 'info', message: `Yapnap ${app.getVersion()} is the latest version.` });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    log('update downloaded:', info.version);
    setStatus({ version: info.version, ready: true });
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
    // The release has no update file for the AppImage, so try its zip instead.
    if (/latest(-linux)?\.yml/.test(String(err && err.message))) {
      updateFromZip().catch((e) => {
        log('zip check failed:', e);
        if (manualCheck) {
          manualCheck = false;
          void dialog.showMessageBox({ type: 'error', message: 'Could not update from the release.', detail: String(e && e.message || e).slice(0, 300) });
        }
      });
      return;
    }
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

module.exports = { start, checkFromMenu, installUpdate, updateStatus };

// Sign-in for the desktop app. Yapnap opens only after it has a Yapnap session. The session comes from the website's
// /login?app=1 flow, which uses Yapper's OAuth: the person approves in a small window, and the website hands the
// session back. The app keeps the token (encrypted with the OS keychain when it is available) and asks the website
// to check it each time the app starts.
const { BrowserWindow, app, dialog, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');

const SITE = 'https://yapnap.pages.dev';
const SIGN_IN = `${SITE}/login?app=1`;
const DONE_PREFIX = `${SITE}/done#`;

let current = null; // { name } once a session has been checked

function log(message) {
  console.log(`[sign-in] ${message}`);
}

function sessionFile() {
  return path.join(app.getPath('userData'), 'session.json');
}

// The token is stored encrypted when the OS keychain is available. Without a keychain it is stored as it is, in the
// person's own Windows or Linux account folder.
async function saveToken(token) {
  const encrypted = await safeStorage.isAsyncEncryptionAvailable();
  const data = encrypted
    ? { v: 1, enc: true, data: (await safeStorage.encryptStringAsync(token)).toString('base64') }
    : { v: 1, enc: false, data: token };
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(sessionFile(), JSON.stringify(data), { mode: 0o600 });
}

async function loadToken() {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(sessionFile(), 'utf8'));
  } catch {
    return null;
  }
  if (!raw || typeof raw.data !== 'string') return null;
  if (!raw.enc) return raw.data;
  if (!(await safeStorage.isAsyncEncryptionAvailable())) return null;
  const { result, shouldReEncrypt } = await safeStorage.decryptStringAsync(Buffer.from(raw.data, 'base64'));
  if (shouldReEncrypt) await saveToken(result);
  return result;
}

function clearToken() {
  try { fs.rmSync(sessionFile(), { force: true }); } catch { /* nothing was saved */ }
}

// Asks the website who the token belongs to. 'signed-out' means it refused the token. 'offline' means it could not be asked.
async function checkToken(token) {
  let res;
  try {
    res = await fetch(`${SITE}/api/session`, { headers: { authorization: `Bearer ${token}` } });
  } catch (err) {
    log(`could not reach ${SITE}/api/session: ${err.message}`);
    return { state: 'offline' };
  }
  if (res.status === 401) return { state: 'signed-out' };
  if (!res.ok) {
    log(`the session check answered ${res.status}`);
    return { state: 'offline' };
  }
  const body = await res.json().catch(() => null);
  if (!body || typeof body.name !== 'string') return { state: 'offline' };
  return { state: 'ok', name: body.name };
}

// Yapper's sign-in in a small window of its own. The website ends the sign-in on /done, with the session in the URL
// fragment. Browsers never send a fragment to a server, so the window reads it here. Resolves to the token, or to null
// when the window is closed first.
function signIn() {
  return new Promise((resolve) => {
    const win = new BrowserWindow({
      width: 460,
      height: 660,
      title: `Sign in to ${app.getName()}`,
      autoHideMenuBar: true,
      backgroundColor: '#15161b',
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    let finished = false;
    let handled = false;
    const finish = (token) => {
      if (finished) return;
      finished = true;
      resolve(token);
      if (!win.isDestroyed()) win.close();
    };
    // Looks at one address. Only the start of the address is logged, never the token.
    const takeToken = (url, from) => {
      if (finished || handled || !url) return;
      if (!url.startsWith(DONE_PREFIX)) {
        log(`${from}: ${url.split(/[?#]/)[0]}`);
        return;
      }
      log(`${from}: reached the end of sign-in`);
      const match = /[#&]t=([^&]+)/.exec(url);
      if (!match) {
        log('the end of sign-in carried no session');
        return;
      }
      handled = true;
      const token = decodeURIComponent(match[1]);
      saveToken(token)
        .then(() => log('session received and saved'))
        .catch((err) => log(`session received but could not be saved: ${err.message}`))
        .finally(() => finish(token));
    };
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    // Yapper's login may pass through other pages. Only secure pages load here; anything else stays out.
    win.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('https://')) { event.preventDefault(); return; }
      if (url.startsWith(DONE_PREFIX)) event.preventDefault();
      takeToken(url, 'navigate');
    });
    win.webContents.on('did-redirect-navigation', (_event, url) => { takeToken(url, 'redirect'); });
    win.webContents.on('did-navigate', (_event, url) => { takeToken(url, 'page'); });
    // The address of the page as it finished loading, in case an earlier event missed the fragment.
    win.webContents.on('did-finish-load', () => { takeToken(win.webContents.getURL(), 'loaded'); });
    win.webContents.on('did-fail-load', (_event, code, description, url) => {
      log(`a page failed to load (${code} ${description}): ${String(url).split(/[?#]/)[0]}`);
    });
    win.webContents.on('render-process-gone', (_event, details) => {
      log(`the sign-in page stopped: ${details.reason}`);
    });
    win.on('closed', () => {
      if (!finished) log('the sign-in window was closed before the end of sign-in');
      finish(null);
    });
    win.once('ready-to-show', () => win.show());
    log('opening the sign-in window');
    win.loadURL(SIGN_IN).catch((err) => {
      log(`the sign-in window could not load: ${err.message}`);
      finish(null);
    });
  });
}

// Opens the app only once a Yapnap session is checked. Resolves to true when the app may open, false when the
// person quits instead.
async function ensureSignedIn() {
  for (;;) {
    const saved = await loadToken();
    if (saved) {
      const result = await checkToken(saved);
      if (result.state === 'ok') {
        log(`signed in as ${result.name}`);
        current = { name: result.name };
        return true;
      }
      if (result.state === 'offline') {
        const choice = await dialog.showMessageBox({
          type: 'warning',
          title: app.getName(),
          message: "Yapnap can't reach its server to check your sign-in.",
          detail: 'Check your internet connection, then try again.',
          buttons: ['Try again', 'Quit'],
          defaultId: 0,
          cancelId: 1,
        });
        if (choice.response === 0) continue;
        return false;
      }
      // The website refused it: the session expired or was signed out, so the person signs in again.
      log('the saved session was refused, signing in again');
      clearToken();
    }
    const token = await signIn();
    if (!token) {
      log('no session, the app stays closed');
      return false;
    }
    const checked = await checkToken(token);
    if (checked.state === 'ok') {
      log(`signed in as ${checked.name}`);
      current = { name: checked.name };
      return true;
    }
    log(`the new session was not accepted (${checked.state})`);
    clearToken();
  }
}

function signOut() {
  clearToken();
  current = null;
}

function account() {
  return current;
}

module.exports = { ensureSignedIn, signOut, account };

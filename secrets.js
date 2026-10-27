// Secrets the app keeps on this computer, such as the role key. They are encrypted with the system keychain when it is
// available, the same as the sign-in token (auth.js). Without a keychain they are stored as they are, in the person's
// own account folder, which only that account can read.
const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');

function fileFor(name) {
  return path.join(app.getPath('userData'), name);
}

/** Saves a secret, or removes it when the value is empty. */
async function saveSecret(name, value) {
  if (!value) {
    fs.rmSync(fileFor(name), { force: true });
    return;
  }
  const encrypted = await safeStorage.isAsyncEncryptionAvailable();
  const data = encrypted
    ? { v: 1, enc: true, data: (await safeStorage.encryptStringAsync(value)).toString('base64') }
    : { v: 1, enc: false, data: value };
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(fileFor(name), JSON.stringify(data), { mode: 0o600 });
}

/** Returns the saved secret, or '' when there is none or it cannot be opened on this computer. */
async function loadSecret(name) {
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(fileFor(name), 'utf8'));
  } catch {
    return '';
  }
  if (!raw || typeof raw.data !== 'string') return '';
  if (!raw.enc) return raw.data;
  try {
    if (!(await safeStorage.isAsyncEncryptionAvailable())) return '';
    const { result, shouldReEncrypt } = await safeStorage.decryptStringAsync(Buffer.from(raw.data, 'base64'));
    if (shouldReEncrypt) await saveSecret(name, result);
    return result;
  } catch {
    return '';
  }
}

module.exports = { saveSecret, loadSecret };

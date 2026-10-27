// Themes in Yapnap: a theme file from the Yapnap website (the Copy theme file button on the Themes page), with an
// optional PNG or GIF picture. The colours are checked here. The picture is fetched only from the Yapnap website, and
// it must really be a PNG or GIF of the kind the theme says, so a theme file cannot load anything else.
const crypto = require('crypto');
const fs = require('fs');

const SITE_PICTURES = 'https://yapnap.pages.dev/api/image/';
const MAX_FILE = 64 * 1024;
const MAX_PICTURE = 2 * 1024 * 1024;
const MAX_STORED_PICTURE = 3 * 1024 * 1024; // the picture as a data address, which is a little larger than the file
const COLOURS = ['bg', 'side', 'elev', 'text', 'accent'];
const HEX = /^#[0-9a-f]{6}$/i;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

// What kind of picture the bytes are, from their first bytes. Returns 'png', 'gif', or null for anything else.
function pictureKind(bytes) {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  const head = Buffer.from(bytes.subarray(0, 6)).toString('latin1');
  if (head === 'GIF87a' || head === 'GIF89a') return 'gif';
  return null;
}

// Checks the shape of a theme file. Returns the theme, or throws with a plain reason for the person.
function parseThemeFile(text) {
  if (text.length > MAX_FILE) throw new Error('That file is too large to be a theme.');
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not a theme file. It is not valid JSON.');
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('That file is not a theme file.');
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 40) : '';
  if (!name) throw new Error('The theme needs a name.');
  if (!raw.colors || typeof raw.colors !== 'object') throw new Error('The theme has no colours.');
  const colors = {};
  for (const key of COLOURS) {
    const value = raw.colors[key];
    if (typeof value !== 'string' || !HEX.test(value)) throw new Error(`The theme colour "${key}" is not a #rrggbb colour.`);
    colors[key] = value.toLowerCase();
  }
  const kind = raw.kind === 'png' || raw.kind === 'gif' ? raw.kind : 'colour';
  const theme = { name, kind, colors, size: 'cover', opacity: 1, sha256: null, src: null };
  if (kind !== 'colour') {
    const bg = raw.background && typeof raw.background === 'object' ? raw.background : {};
    theme.size = bg.size === 'tile' ? 'tile' : 'cover';
    theme.opacity = typeof bg.opacity === 'number' && bg.opacity >= 0 && bg.opacity <= 1 ? bg.opacity : 0.3;
    theme.sha256 = typeof bg.sha256 === 'string' && /^[0-9a-f]{64}$/.test(bg.sha256) ? bg.sha256 : null;
    const src = typeof bg.src === 'string' ? bg.src : '';
    if (src.startsWith('/api/image/')) theme.src = `https://yapnap.pages.dev${src}`;
    else if (src.startsWith(SITE_PICTURES)) theme.src = src;
    else throw new Error('The theme picture must come from the Yapnap website.');
  }
  return theme;
}

// Checks a theme that is already stored in the settings. Returns the cleaned theme, or null when it is not usable.
function cleanTheme(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.name !== 'string' || !raw.name) return null;
  const colors = {};
  for (const key of COLOURS) {
    const value = raw.colors && raw.colors[key];
    if (typeof value !== 'string' || !HEX.test(value)) return null;
    colors[key] = value.toLowerCase();
  }
  if (!['png', 'gif', 'colour'].includes(raw.kind)) return null;
  let image = null;
  if (raw.kind !== 'colour') {
    // The picture is written into the page's CSS. Only base64 may follow the prefix: a quote or brace would break out of
    // the url() and let a theme add any CSS, which the custom CSS rules forbid.
    const prefix = `data:image/${raw.kind};base64,`;
    if (typeof raw.image !== 'string' || !raw.image.startsWith(prefix) || raw.image.length > MAX_STORED_PICTURE) return null;
    if (!BASE64.test(raw.image.slice(prefix.length))) return null;
    image = raw.image;
  }
  return {
    name: raw.name.slice(0, 40),
    kind: raw.kind,
    colors,
    size: raw.size === 'tile' ? 'tile' : 'cover',
    opacity: typeof raw.opacity === 'number' && raw.opacity >= 0 && raw.opacity <= 1 ? raw.opacity : 0.3,
    image,
  };
}

// What the settings window may see of a theme: everything except the picture itself.
function themeInfo(theme) {
  return { name: theme.name, kind: theme.kind, colors: theme.colors, size: theme.size, opacity: theme.opacity, hasPicture: Boolean(theme.image) };
}

// Reads a theme file, fetches its picture with fetchPicture, and returns the theme ready to store.
async function loadThemeFile(filePath, fetchPicture) {
  if (fs.statSync(filePath).size > MAX_FILE) throw new Error('That file is too large to be a theme.');
  const parsed = parseThemeFile(fs.readFileSync(filePath, 'utf8'));
  if (parsed.kind === 'colour') return { name: parsed.name, kind: 'colour', colors: parsed.colors, size: 'cover', opacity: 1, image: null };
  const res = await fetchPicture(parsed.src, { redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`The theme picture could not be downloaded (${res.status}).`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length > MAX_PICTURE) throw new Error('The theme picture is over 2 MB.');
  if (pictureKind(bytes) !== parsed.kind) throw new Error(`The theme picture is not a real ${parsed.kind.toUpperCase()}.`);
  if (parsed.sha256 && crypto.createHash('sha256').update(bytes).digest('hex') !== parsed.sha256) {
    throw new Error('The theme picture does not match its theme file. Copy the theme from the website again.');
  }
  return {
    name: parsed.name,
    kind: parsed.kind,
    colors: parsed.colors,
    size: parsed.size,
    opacity: parsed.opacity,
    image: `data:image/${parsed.kind};base64,${bytes.toString('base64')}`,
  };
}

module.exports = { parseThemeFile, cleanTheme, themeInfo, loadThemeFile, pictureKind };

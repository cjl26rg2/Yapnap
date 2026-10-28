// The marketplace in the app. A mod is data only (see market-rules.js), so installing one changes how Yapper looks and
// nothing else. The list comes from the Yapnap website and is kept as a cache. The copy that ships with the app is the
// fallback, so the marketplace still works offline. Every mod is checked against the rules, and against the fingerprint
// in the list, before it is kept.
const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');
const R = require('./market-rules');
const BUNDLED = require('./src/market/bundled.json');

const SITE = 'https://yapnap.pages.dev';
const INDEX_URL = `${SITE}/market/index.json`;
const MAX_INDEX = 2 * 1024 * 1024;
const MAX_MOD = 64 * 1024;
const HEX64 = /^[0-9a-f]{64}$/;

let lastIndex = null; // { source: 'web' | 'cache' | 'bundled', mods: [...lines] }

function cacheFile() {
  return path.join(app.getPath('userData'), 'market-index.json');
}

/** One line of the list, if it is well formed. Anything else is dropped. */
function cleanLine(m) {
  if (!m || typeof m !== 'object') return null;
  const good = typeof m.id === 'string' && R.ID.test(m.id) && m.id.length <= 60
    && typeof m.name === 'string' && m.name.length >= 1 && m.name.length <= 40
    && typeof m.desc === 'string' && m.desc.length >= 1 && m.desc.length <= 160
    && R.CATEGORIES.includes(m.category)
    && Number.isInteger(m.version) && m.version >= 1
    && typeof m.author === 'string' && m.author.length >= 1 && m.author.length <= 40
    && typeof m.sha256 === 'string' && HEX64.test(m.sha256);
  if (!good) return null;
  return { id: m.id, name: m.name, desc: m.desc, category: m.category, version: m.version, author: m.author, sha256: m.sha256 };
}

/** The whole list, with duplicates and malformed lines removed. Returns null when the shape is wrong. */
function cleanIndex(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.mods)) return null;
  const seen = new Set();
  const out = [];
  for (const m of raw.mods) {
    const line = cleanLine(m);
    if (!line || seen.has(line.id)) continue;
    seen.add(line.id);
    out.push(line);
    if (out.length >= R.MAX_MODS) break;
  }
  return out;
}

/** The copy that ships with the app, with each mod checked against its fingerprint. */
function bundledMods() {
  const out = [];
  for (const entry of BUNDLED.mods || []) {
    const { sha256, ...fields } = entry;
    const res = R.validateMod(fields, null);
    if (res.ok && R.fingerprint(res.mod) === sha256) {
      out.push({ id: res.mod.id, name: res.mod.name, desc: res.mod.desc, category: res.mod.category, version: res.mod.version, author: res.mod.author, sha256 });
    }
  }
  return out;
}

/** A fetch that only talks to the Yapnap website, follows no redirects, and stops after a fixed time and size. */
async function fetchJson(url, max) {
  const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`the marketplace answered ${res.status}`);
  const text = await res.text();
  if (text.length > max) throw new Error('the marketplace sent more data than expected');
  return JSON.parse(text);
}

/** Gets the list: from the website when it can, else the last copy, else the copy that ships with the app. */
async function loadIndex() {
  try {
    const mods = cleanIndex(await fetchJson(INDEX_URL, MAX_INDEX));
    if (!mods) throw new Error('the list is not in the right shape');
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(cacheFile(), JSON.stringify({ mods }));
    lastIndex = { source: 'web', mods };
  } catch (err) {
    console.error('Marketplace list unavailable:', err.message);
    let cached = null;
    try { cached = cleanIndex(JSON.parse(fs.readFileSync(cacheFile(), 'utf8'))); } catch { /* no cache yet */ }
    lastIndex = cached && cached.length ? { source: 'cache', mods: cached } : { source: 'bundled', mods: bundledMods() };
  }
  return lastIndex;
}

/** The list in use now, loading it first if needed. */
async function index() {
  return lastIndex || loadIndex();
}

/**
 * One mod, ready to keep. It comes from the website, or from the copy that ships with the app when the list is the
 * bundled one. Either way it must pass the rules and match the fingerprint in the list.
 */
async function fetchMod(id, list) {
  const line = list.mods.find((m) => m.id === id);
  if (!line) throw new Error('that mod is not in the marketplace');
  let raw;
  if (list.source === 'bundled') {
    const found = (BUNDLED.mods || []).find((m) => m.id === id);
    if (found) { const { sha256, ...fields } = found; raw = fields; }
  } else {
    raw = await fetchJson(`${SITE}/market/mods/${id}.json`, MAX_MOD);
  }
  const res = R.validateMod(raw, null);
  if (!res.ok) throw new Error('the mod did not pass the checks: ' + res.problems[0]);
  if (R.fingerprint(res.mod) !== line.sha256) throw new Error('the mod does not match the marketplace list');
  return res.mod;
}

/** A mod from the copy that ships with the app, if it is one of the ones that moved there. No network. */
function bundledMod(id) {
  const found = (BUNDLED.mods || []).find((m) => m.id === id);
  if (!found) return null;
  const { sha256, ...fields } = found;
  const res = R.validateMod(fields, null);
  return res.ok && R.fingerprint(res.mod) === sha256 ? res.mod : null;
}

/** Keeps only installed mods that pass the rules. Used when settings are read from disk or from a file. */
function cleanInstalled(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [id, mod] of Object.entries(raw).slice(0, R.MAX_MODS)) {
    if (!R.ID.test(id)) continue;
    const res = R.validateMod(mod, null);
    if (res.ok && res.mod.id === id) out[id] = res.mod;
  }
  return out;
}

module.exports = { loadIndex, index, fetchMod, bundledMod, cleanInstalled, cleanIndex };

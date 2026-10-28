// Builds the marketplace from market/mods/*.json. Run with: npm run market:build
//
// It writes three things:
//   src/market/bundled.json   every mod, with its fingerprint. The app ships this, so the marketplace works offline and
//                             existing plugins keep working after the split.
//   site/market/index.json    the list the app and the website show: one line per mod, with its fingerprint.
//   site/market/mods/<id>.json  one file per mod, for the app to download and check against the index.
// Every mod is checked with market-rules.js first. If one fails, nothing is written.
const fs = require('node:fs');
const path = require('node:path');
const R = require('../market-rules');

const ROOT = path.join(__dirname, '..');
const MODS_DIR = path.join(ROOT, 'market', 'mods');
const BUNDLED = path.join(ROOT, 'src', 'market', 'bundled.json');
const SITE_MARKET = path.join(ROOT, 'site', 'market');

function siteClasses() {
  return new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'site-classes.json'), 'utf8')).classes);
}

/** Reads and checks every mod. Returns { mods, problems }, with mods sorted by id and each carrying its fingerprint. */
function loadMods(dir = MODS_DIR, classes = siteClasses()) {
  const problems = [];
  const mods = [];
  const seen = new Set();
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  for (const f of files) {
    let raw;
    try { raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { problems.push(`${f} is not JSON: ${e.message}`); continue; }
    const res = R.validateMod(raw, classes);
    if (!res.ok) { for (const p of res.problems) problems.push(`${f}: ${p}`); continue; }
    if (f !== res.mod.id + '.json') problems.push(`${f} should be named ${res.mod.id}.json`);
    if (seen.has(res.mod.id)) problems.push(`${f}: the id "${res.mod.id}" is used twice`);
    seen.add(res.mod.id);
    mods.push({ ...res.mod, sha256: R.fingerprint(res.mod) });
  }
  mods.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (mods.length > R.MAX_MODS) problems.push(`more than ${R.MAX_MODS} mods`);
  return { mods, problems };
}

/** The bundled copy the app ships with. */
function bundledText(mods) {
  return JSON.stringify({ version: 1, mods }, null, 2) + '\n';
}

/** The list the app and the website read. */
function indexText(mods) {
  const list = mods.map(({ id, name, desc, category, version, author, sha256 }) => ({ id, name, desc, category, version, author, sha256 }));
  return JSON.stringify({ version: 1, count: list.length, mods: list }, null, 2) + '\n';
}

/** One mod as the website serves it: the fields the rules check, without the fingerprint. */
function modText(mod) {
  const { sha256, ...fields } = mod;
  return JSON.stringify(fields, null, 2) + '\n';
}

module.exports = { loadMods, bundledText, indexText, modText, siteClasses };

if (require.main === module) {
  const { mods, problems } = loadMods();
  if (problems.length) {
    console.log(`${problems.length} problem(s). Nothing was written:`);
    for (const p of problems) console.log('  - ' + p);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(BUNDLED), { recursive: true });
  fs.writeFileSync(BUNDLED, bundledText(mods));
  fs.mkdirSync(path.join(SITE_MARKET, 'mods'), { recursive: true });
  fs.writeFileSync(path.join(SITE_MARKET, 'index.json'), indexText(mods));
  for (const mod of mods) fs.writeFileSync(path.join(SITE_MARKET, 'mods', mod.id + '.json'), modText(mod));
  console.log(`Marketplace built: ${mods.length} mods`);
}

// Marketplace mods: the rules every mod must pass. The app, the plugin check and the website build all use this file,
// so a mod that is refused on the website is refused in the app too.
//
// A mod is data only: a name, a description, a category and a block of CSS. It cannot run code, load a file, call the
// network or read the page. Installing one changes how Yapper looks and nothing else.
const crypto = require('node:crypto');

const CATEGORIES = ['Messages', 'Composer', 'Sidebar', 'Members', 'Voice', 'Look', 'Access', 'Behaviour'];
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_CSS = 4000;
const MAX_MODS = 2000;
// Anything that could load a file or run script is refused. Child selectors (>) are fine, and so are @media, @supports
// and @keyframes. The CSS is always set as text, so angle brackets cannot add markup and are allowed.
const BAD_CSS = /url\s*\(|image-set\s*\(|\bimage\s*\(|\bsrc\s*\(|@(?!(?:media|supports|keyframes)\b)|expression\s*\(|javascript:|(?<![-\w])behavior\s*:|-moz-binding|\\/i;

const MOD_KEYS = ['id', 'name', 'desc', 'category', 'version', 'author', 'css'];

/** Checks one mod. Returns { ok, problems, mod } where mod is the cleaned copy that the app stores. */
function validateMod(raw, siteClasses) {
  const problems = [];
  const fail = (msg) => problems.push(msg);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, problems: ['not an object'], mod: null };
  for (const key of Object.keys(raw)) if (!MOD_KEYS.includes(key)) fail(`unknown field "${key}"`);

  const id = typeof raw.id === 'string' ? raw.id : '';
  if (!ID.test(id) || id.length > 60) fail('id must be lowercase words joined by dashes');
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name || name.length > 40) fail('name must be 1 to 40 characters');
  const desc = typeof raw.desc === 'string' ? raw.desc.trim() : '';
  if (!desc || desc.length > 160) fail('description must be 1 to 160 characters');
  else if (!/[.!?)]$/.test(desc)) fail('description should end with punctuation');
  if (!CATEGORIES.includes(raw.category)) fail(`category must be one of ${CATEGORIES.join(', ')}`);
  const author = typeof raw.author === 'string' ? raw.author.trim() : '';
  if (!author || author.length > 40) fail('author must be 1 to 40 characters');
  if (!Number.isInteger(raw.version) || raw.version < 1 || raw.version > 9999) fail('version must be a whole number from 1');

  const css = typeof raw.css === 'string' ? raw.css.trim() : '';
  if (!css) fail('css is empty');
  else if (css.length > MAX_CSS) fail(`css is longer than ${MAX_CSS} characters`);
  else {
    const bad = css.match(BAD_CSS);
    if (bad) fail(`css uses something a mod may not use: "${bad[0]}"`);
    const open = (css.match(/\{/g) || []).length;
    const close = (css.match(/\}/g) || []).length;
    if (open !== close || open === 0) fail('css braces do not match');
    if (siteClasses) {
      for (const m of css.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
        if (!siteClasses.has(m[1])) { fail(`class "${m[1]}" is not in Yapper's CSS`); break; }
      }
    }
  }

  if (problems.length) return { ok: false, problems, mod: null };
  return { ok: true, problems, mod: { id, name, desc, category: raw.category, version: raw.version, author, css } };
}

/** A fixed text form of a mod, so the same mod always gives the same fingerprint. */
function canonical(mod) {
  return JSON.stringify({ id: mod.id, name: mod.name, desc: mod.desc, category: mod.category, version: mod.version, author: mod.author, css: mod.css });
}

function fingerprint(mod) {
  return crypto.createHash('sha256').update(canonical(mod)).digest('hex');
}

module.exports = { CATEGORIES, ID, BAD_CSS, MAX_CSS, MAX_MODS, validateMod, canonical, fingerprint };

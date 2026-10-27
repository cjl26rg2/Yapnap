// Checks the plugin set without starting Electron. Run with: npm run check
// - exactly 200 plugins, every id unique, every setting well-formed
// - every class a plugin's CSS uses exists in the chat site's own CSS (check/site-classes.json)
// - no plugin reaches the network, browser storage, eval or raw HTML
// - settings/index.html loads exactly the plugin files that exist
// - every script parses, and badges.json is well-formed
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PLUGIN_DIR = path.join(SRC, 'plugins');
const EXPECTED = 200; // toggleable plugins; the core badge module is not listed
const ALLOW_CLICK = new Set(['behaviour.js']); // alt-server-jump presses a server icon for the user

const problems = [];
const fail = (msg) => problems.push(msg);

const pluginFiles = fs.readdirSync(PLUGIN_DIR).filter((f) => f.endsWith('.js')).sort();
const sources = Object.fromEntries(pluginFiles.map((f) => [f, fs.readFileSync(path.join(PLUGIN_DIR, f), 'utf8')]));

// Load the registry and every plugin file the same way the page does, in a sandbox.
const sandbox = { window: {}, console };
vm.createContext(sandbox);
const load = (file, src) => vm.runInContext(src, sandbox, { filename: file });
load('registry.js', fs.readFileSync(path.join(SRC, 'registry.js'), 'utf8'));
for (const f of pluginFiles) load(f, sources[f]);
const Y = sandbox.window.YAPNAP;

// 1. Count and uniqueness. The registry replaces a duplicate id silently, so count the Y.add( calls as well.
const plugins = Y.list();
const addCalls = pluginFiles.reduce((n, f) => n + (sources[f].match(/Y\.add\(\{/g) || []).length, 0);
if (plugins.length !== EXPECTED) fail(`expected ${EXPECTED} plugins, found ${plugins.length}`);
if (addCalls !== Y.all().length) fail(`${addCalls} Y.add calls but ${plugins.length} unique ids: a duplicate id exists`);

// 2. Shape of each plugin and its settings.
const siteClasses = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'site-classes.json'), 'utf8')).classes);
const jsPlugins = [];
const cssClassesUsed = new Map(); // class -> plugin ids
for (const p of plugins) {
  if (p.name.length > 40) fail(`${p.id}: name is longer than 40 characters`);
  if (!/[.!?)]$/.test(p.desc)) fail(`${p.id}: description should end with punctuation`);
  if (p.start) jsPlugins.push(p.id);
  if (p.def !== undefined && typeof p.def !== 'boolean') fail(`${p.id}: def must be true or false`);
  if (!p.css && !p.start) fail(`${p.id}: has neither css nor start`);

  for (const s of p.settings || []) {
    if (!/^[a-z]{1,20}$/.test(s.key)) fail(`${p.id}: setting key "${s.key}" must be lowercase letters`);
    if (s.type === 'range') {
      if (!(s.min < s.max) || s.def < s.min || s.def > s.max) fail(`${p.id}: range "${s.key}" has a bad min/max/def`);
      if (!(s.step > 0)) fail(`${p.id}: range "${s.key}" needs a positive step`);
    } else if (s.type === 'color') {
      if (!/^#[0-9a-f]{6}$/i.test(s.def)) fail(`${p.id}: colour "${s.key}" default is not #rrggbb`);
    } else {
      fail(`${p.id}: setting type "${s.type}" is not supported by the settings window`);
    }
  }

  // Render the CSS at the default and at each range extreme, so a bad value shows up here.
  if (p.css) {
    const variants = [Y.defaults(p)];
    for (const s of p.settings || []) {
      if (s.type === 'range') variants.push({ ...Y.defaults(p), [s.key]: s.min }, { ...Y.defaults(p), [s.key]: s.max });
    }
    for (const v of variants) {
      let css;
      try { css = typeof p.css === 'function' ? p.css(v) : p.css; } catch (e) { fail(`${p.id}: css threw ${e.message}`); continue; }
      for (const m of css.matchAll(/\.([A-Za-z][\w-]*)/g)) {
        const cls = m[1];
        if (cls.startsWith('ym-') || siteClasses.has(cls)) continue;
        if (!cssClassesUsed.has(cls)) cssClassesUsed.set(cls, new Set());
        cssClassesUsed.get(cls).add(p.id);
      }
    }
  }
}
for (const [cls, ids] of cssClassesUsed) {
  fail(`class ".${cls}" is not on the chat site, so ${[...ids].join(', ')} would do nothing`);
}

// 3. Plugin code stays on the page: no network, no storage, no eval, no raw HTML.
const FORBIDDEN = [
  [/\bfetch\s*\(/, 'fetch'],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
  [/WebSocket/, 'WebSocket'],
  [/sendBeacon/, 'sendBeacon'],
  [/document\.cookie/, 'document.cookie'],
  [/localStorage|sessionStorage|indexedDB/, 'browser storage'],
  [/\beval\s*\(|new\s+Function\b/, 'eval'],
  [/innerHTML|outerHTML|insertAdjacentHTML/, 'raw HTML'],
  [/\bimport\s*\(|importScripts|\brequire\s*\(/, 'dynamic loading'],
];
for (const f of pluginFiles) {
  for (const [re, what] of FORBIDDEN) if (re.test(sources[f])) fail(`${f} uses ${what}`);
  if (!ALLOW_CLICK.has(f) && /\.click\(/.test(sources[f])) fail(`${f} presses a button with .click()`);
}

// 4. The settings window loads every plugin file, and nothing it does not have.
const settingsHtml = fs.readFileSync(path.join(ROOT, 'settings', 'index.html'), 'utf8');
const listed = [...settingsHtml.matchAll(/src="\.\.\/src\/plugins\/([\w.-]+\.js)"/g)].map((m) => m[1]).sort();
const missing = pluginFiles.filter((f) => !listed.includes(f));
const extra = listed.filter((f) => !pluginFiles.includes(f));
if (missing.length) fail(`settings/index.html does not load: ${missing.join(', ')}`);
if (extra.length) fail(`settings/index.html loads files that do not exist: ${extra.join(', ')}`);
if (!settingsHtml.includes('src="../src/registry.js"')) fail('settings/index.html does not load registry.js');

// 5. Every script parses.
const parseOnly = (file, src) => { try { new vm.Script(src, { filename: file }); } catch (e) { fail(`${file} does not parse: ${e.message}`); } };
parseOnly('registry.js', fs.readFileSync(path.join(SRC, 'registry.js'), 'utf8'));
parseOnly('art.js', fs.readFileSync(path.join(SRC, 'art.js'), 'utf8'));
parseOnly('panel.js', fs.readFileSync(path.join(SRC, 'panel.js'), 'utf8'));
parseOnly('settings-nav.js', fs.readFileSync(path.join(SRC, 'settings-nav.js'), 'utf8'));
parseOnly('runtime.js', fs.readFileSync(path.join(SRC, 'runtime.js'), 'utf8'));
for (const f of pluginFiles) parseOnly(f, sources[f]);
parseOnly('settings/app.js', fs.readFileSync(path.join(ROOT, 'settings', 'app.js'), 'utf8'));
for (const f of ['main.js', 'preload.js', 'games.js']) {
  parseOnly(f, fs.readFileSync(path.join(ROOT, f), 'utf8'));
}

// 6. badges.json is well-formed and every user's tier exists.
let badges = null;
try { badges = JSON.parse(fs.readFileSync(path.join(SRC, 'badges.json'), 'utf8')); } catch (e) { fail(`badges.json: ${e.message}`); }
if (badges) {
  for (const [key, t] of Object.entries(badges.tiers || {})) {
    if (!/^#[0-9a-f]{6}$/i.test(t.color || '')) fail(`badges.json tier "${key}" has a bad colour`);
  }
  for (const [id, u] of Object.entries(badges.users || {})) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) fail(`badges.json user id "${id}" is not a plain id`);
    if (!badges.tiers || !badges.tiers[u.tier]) fail(`badges.json user "${id}" has an unknown tier`);
  }
}

// Summary.
const cssCount = plugins.filter((p) => p.css).length;
console.log(`Plugins: ${plugins.length} (${cssCount} with CSS, ${jsPlugins.length} with JavaScript)`);
console.log(`Categories: ${Y.categories.map((c) => `${c} ${plugins.filter((p) => p.category === c).length}`).join(', ')}`);
console.log(`Chat-site classes checked against ${siteClasses.size} names from the site's CSS`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('All checks passed.');

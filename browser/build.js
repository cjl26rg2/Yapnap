// Builds the browser version of Yapnap. Run from the project folder with: node browser/build.js
// It writes browser/dist/yapnap-chrome (Chrome, Edge, Brave) and browser/dist/yapnap-firefox (Firefox 128 or newer).
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(__dirname, 'dist');
const SITES = [
  'https://www.yapper.website/*',
  'https://yapper.website/*',
  'https://rt.yapper.website/*',
  'https://lk.yapper.website/*',
];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

// The same files, in the same order, as readPageBundle() in main.js, with page.js added at the end.
function pageBundle() {
  const plugins = fs.readdirSync(path.join(SRC, 'plugins')).filter((f) => f.endsWith('.js')).sort();
  return [
    path.join(SRC, 'registry.js'),
    ...plugins.map((f) => path.join(SRC, 'plugins', f)),
    path.join(SRC, 'art.js'),
    path.join(SRC, 'panel.js'),
    path.join(SRC, 'settings-nav.js'),
    path.join(SRC, 'runtime.js'),
    path.join(__dirname, 'page.js'),
  ].map(read).join('\n;\n');
}

function manifest(target) {
  const out = {
    manifest_version: 3,
    name: 'Yapnap',
    version: '1.1.1',
    description: "Unofficial plugins, settings and contributor badges for Yapin'.",
    icons: { 512: 'icon.png' },
    permissions: ['storage'],
    // The shared role list and the role checks are on the website.
    host_permissions: ['https://yapnap.pages.dev/*'],
    content_scripts: [
      { matches: SITES, js: ['bridge.js'], run_at: 'document_idle' },
      { matches: SITES, js: ['yapnap.js'], world: 'MAIN', run_at: 'document_idle' },
    ],
  };
  if (target === 'firefox') {
    out.browser_specific_settings = { gecko: { id: 'yapnap@yapnap.pages.dev', strict_min_version: '128.0' } };
  }
  return out;
}

function build(target) {
  const out = path.join(DIST, target === 'firefox' ? 'yapnap-firefox' : 'yapnap-chrome');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const badges = read(path.join(SRC, 'badges.json')).trim();
  const bridge = read(path.join(__dirname, 'bridge.js'))
    .replace('__BADGES__', () => badges)
    .replace("'__BUILT__'", () => `'${new Date().toISOString()}'`);
  if (bridge.includes('__BADGES__') || bridge.includes('__BUILT__')) throw new Error('bridge.js placeholder was not filled in');

  fs.writeFileSync(path.join(out, 'bridge.js'), bridge);
  fs.writeFileSync(path.join(out, 'yapnap.js'), pageBundle());
  fs.writeFileSync(path.join(out, 'manifest.json'), `${JSON.stringify(manifest(target), null, 2)}\n`);
  fs.copyFileSync(path.join(ROOT, 'build', 'icon.png'), path.join(out, 'icon.png'));
  return out;
}

for (const target of ['chrome', 'firefox']) {
  const out = build(target);
  console.log(`built ${path.relative(ROOT, out)}`);
}

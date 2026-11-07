// Writes the category icons from src/art.js into site/assets/cat/ as PNG files, so the website shows the same icons as
// the app. Run with: node tools/export-category-icons.js
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'site', 'assets', 'cat');

const source = fs.readFileSync(path.join(ROOT, 'src', 'art.js'), 'utf8');
const found = [...source.matchAll(/"(cat-[a-z]+)":"data:image\/png;base64,([A-Za-z0-9+/=]+)"/g)];
if (!found.length) throw new Error('no category icons found in src/art.js');

fs.mkdirSync(OUT, { recursive: true });
for (const [, name, data] of found) {
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(data, 'base64'));
}
console.log(`wrote ${found.length} category icons to site/assets/cat/`);

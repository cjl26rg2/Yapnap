// For each person in the saved role list, reports whether their picture is on the page and whether a rank icon is
// beside it. Needs the app running with --remote-debugging-port=9333. Account IDs are shortened in the output.
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.YAPNAP_DEBUG_PORT || 9333);
const WS = globalThis.WebSocket;
const cachePath = path.join(process.env.APPDATA || '', 'Yapnap', 'roles-cache.json');
const users = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')).users || {} : {};
const ids = Object.keys(users);

const expression = `(() => {
  const ids = ${JSON.stringify(ids)};
  return JSON.stringify(ids.map((id) => {
    const pics = [...document.querySelectorAll('img')].filter((img) => (img.getAttribute('src') || '').includes(id) && !img.closest('.msg') && !img.closest('[class*="rail"]'));
    const rows = pics.map((img) => {
      const box = img.getBoundingClientRect();
      let scope = img.closest('button, li') || img.parentElement;
      if (box.width >= 64) { for (let up = img.parentElement, i = 0; up && i < 7; up = up.parentElement, i++) { if (up.querySelector('.badge-row')) { scope = up; break; } } }
      const icon = scope && scope.querySelector('.ym-badge-icon');
      return { size: Math.round(box.width) + 'x' + Math.round(box.height), inRow: Boolean(img.closest('button, li')), iconNearby: Boolean(icon) };
    });
    return { id: id.slice(0, 8), tier: ${'""'} , pictures: rows.length, details: rows.slice(0, 3) };
  }));
})()`;

(async () => {
  let page;
  try {
    const pages = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    page = pages.find((p) => p.type === 'page' && /yapper\.website/.test(p.url));
  } catch { console.error(`No app on port ${PORT}. Start Yapnap with --remote-debugging-port=${PORT} first.`); process.exit(1); }
  if (!page) { console.error('Yapnap is open, but no Yapper page was found.'); process.exit(1); }
  const tiers = Object.fromEntries(ids.map((id) => [id.slice(0, 8), users[id].tier]));
  const ws = new WS(page.webSocketDebuggerUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.id !== 1) return;
    const result = JSON.parse(data.result.result.value).map((r) => ({ ...r, tier: tiers[r.id] }));
    console.log(JSON.stringify(result, null, 2));
    ws.close();
  };
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
})();

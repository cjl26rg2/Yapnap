// Looks at a running Yapnap and reports how avatars and rank badges are drawn. It prints no account IDs (they are
// masked), so the output is safe to paste. Start Yapnap with a debug port first, logged in:
//   Yapnap.exe --remote-debugging-port=9333
// Then run: node tests/diag-avatars.js
const PORT = Number(process.env.YAPNAP_DEBUG_PORT || 9333);
const WS = globalThis.WebSocket;

const EXPRESSION = `(() => {
  const ID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const ID_ALL = new RegExp(ID.source, 'g');
  const mask = (s) => String(s || '').replace(ID_ALL, '<id>').slice(0, 140);
  const describe = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { tag: el.tagName, cls: String(el.className || '').slice(0, 120), position: cs.position, overflow: cs.overflow, radius: cs.borderRadius };
  };
  const pictures = [...document.querySelectorAll('img')].filter((img) => !img.closest('.msg') && !img.closest('.ym-avatar-badge') && !img.closest('[class*="rail"]') && !/\\/icons\\//.test(img.getAttribute('src') || ''));
  const withId = pictures.filter((img) => ID.test(img.getAttribute('src') || ''));
  const rightPanel = pictures.filter((img) => img.getBoundingClientRect().left > window.innerWidth * 0.75);
  const chain = (el) => { const out = []; for (let p = el, i = 0; p && i < 5; p = p.parentElement, i++) out.push((p.tagName + (p.className && typeof p.className === 'string' ? '.' + p.className.trim().split(/\\s+/).slice(0, 3).join('.') : '')).slice(0, 80)); return out; };
  const out = {
    yapnapLoaded: typeof window.__yapnap === 'object',
    pictureCount: pictures.length,
    pictureWithIdCount: withId.length,
    overlaysOnPage: document.querySelectorAll('.ym-avatar-badge').length,
    messageBadges: document.querySelectorAll('.ym-badge').length,
    samplePictures: withId.slice(0, 6).map((img) => ({
      src: mask(img.getAttribute('src')),
      size: img.width + 'x' + img.height,
      cls: String(img.className || '').slice(0, 100),
      parent: describe(img.parentElement),
      grandparent: describe(img.parentElement && img.parentElement.parentElement),
      overlayInParent: Boolean(img.parentElement && img.parentElement.querySelector(':scope > .ym-avatar-badge')),
    })),
    rightPanelPictures: rightPanel.length,
    sampleRightPanel: rightPanel.slice(0, 6).map((img) => ({
      src: mask(img.getAttribute('src')),
      size: img.width + 'x' + img.height,
      hasIdInSrc: ID.test(img.getAttribute('src') || ''),
      overlay: Boolean(img.parentElement && img.parentElement.querySelector(':scope > .ym-avatar-badge')),
      chain: chain(img),
    })),
    ownerMatched: pictures.filter((img) => (img.getAttribute('src') || '').includes('879e9081-5614-436d-971a-09481669a35f')).map((img) => ({ size: img.width + 'x' + img.height, src: mask(img.getAttribute('src')), chain: chain(img) })).slice(0, 8),
    profileCards: document.querySelectorAll('.profile-card').length,
    badgeRows: document.querySelectorAll('.badge-row').length,
    iconChipsOnPage: document.querySelectorAll('.ym-badge-icon').length,
    pickRows: [...document.querySelectorAll('button.pick-row')].slice(0, 2).map((b) => ({ kids: [...b.children].map((c) => ({ tag: c.tagName, cls: String(c.className || '').slice(0, 80), text: c.textContent.trim().slice(0, 24), hasIcon: c.querySelector('.ym-badge-icon') !== null })) })),
    memberRowsFound: document.querySelectorAll('[class*="member"]').length,
    sampleMemberRows: [...document.querySelectorAll('[class*="member"]')].filter((el) => el.querySelector('img')).slice(0, 3).map((el) => ({
      cls: String(el.className || '').slice(0, 120),
      hasPicture: Boolean(el.querySelector('img')),
      pictureHasId: Boolean(el.querySelector('img') && ID.test(el.querySelector('img').getAttribute('src') || '')),
    })),
  };
  return JSON.stringify(out, null, 2);
})()`;

(async () => {
  let page;
  try {
    const pages = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    page = pages.find((p) => p.type === 'page' && /yapper\.website/.test(p.url));
  } catch {
    console.error(`No app on port ${PORT}. Start Yapnap with --remote-debugging-port=${PORT} first.`);
    process.exit(1);
  }
  if (!page) {
    console.error('Yapnap is open, but no Yapper page was found. Open the chat and try again.');
    process.exit(1);
  }
  const ws = new WS(page.webSocketDebuggerUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.id !== 1) return;
    const value = data.result && data.result.result ? data.result.result.value : data;
    console.log(value);
    ws.close();
  };
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: EXPRESSION, returnByValue: true } }));
})().catch((err) => {
  console.error('Could not read the app:', err.message);
  process.exit(1);
});

// Live test: runs every toggleable plugin inside the running Yapnap app and checks it behaves.
// For each plugin it turns the plugin on and checks that its CSS is applied, turns it off and checks the CSS is
// removed, and watches for errors thrown on the page while it does. It puts every plugin back the way it was.
//
// Start Yapnap with a debug port first:  Yapnap.exe --remote-debugging-port=9333
// Then run:  npm run test:live   (or node tests/live-plugins.js)
const WS = globalThis.WebSocket;
const PORT = Number(process.env.YAPNAP_DEBUG_PORT || 9333);
const WAIT = 220;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findPage() {
  for (let i = 0; i < 30; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = targets.find((t) => t.type === 'page' && t.url.startsWith('https://www.yapper.website'));
      if (page) return page;
    } catch { /* app not up yet */ }
    await sleep(500);
  }
  throw new Error(`No Yapnap page on port ${PORT}. Start Yapnap with --remote-debugging-port=${PORT}.`);
}

async function connect(url) {
  const ws = new WS(url);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.method === 'Runtime.exceptionThrown') {
      const e = d.params.exceptionDetails;
      errors.push((e.exception && e.exception.description) || e.text || 'unknown error');
    }
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  };
  const send = (method, params = {}) => new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  await send('Runtime.enable');
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return { error: r.result.exceptionDetails.text || 'evaluation failed' };
    return { value: r.result && r.result.result ? r.result.result.value : undefined };
  };
  return { evaluate, errors, close: () => ws.close() };
}

(async () => {
  const page = await findPage();
  const app = await connect(page.webSocketDebuggerUrl);

  // The plugin list and each plugin's saved state, read through the same API the settings use.
  const listing = await app.evaluate(`(async () => {
    const state = await window.yapnap.state();
    return JSON.stringify({
      plugins: window.YAPNAP.list().map((p) => ({ id: p.id, name: p.name, def: !!p.def, hasCss: !!p.css, hasStart: !!p.start })),
      saved: state.plugins
    });
  })()`);
  if (listing.error) throw new Error(listing.error);
  const { plugins, saved } = JSON.parse(listing.value);
  console.log(`Testing ${plugins.length} plugins in the running app.\n`);

  const failures = [];
  let passed = 0;
  for (const p of plugins) {
    app.errors.length = 0;
    const wasOn = saved[p.id] && typeof saved[p.id].on === 'boolean' ? saved[p.id].on : p.def;
    const cssCheck = `(() => {
      const p = window.YAPNAP.get(${JSON.stringify(p.id)});
      const css = typeof p.css === 'function' ? p.css(window.YAPNAP.defaults(p)) : p.css;
      const style = document.getElementById('yapnap-style');
      return { css: css || '', applied: !!style && !!css && style.textContent.indexOf(css) !== -1 };
    })()`;

    const problems = [];
    await app.evaluate(`window.yapnap.setPlugin(${JSON.stringify(p.id)}, true)`);
    await sleep(WAIT);
    const on = await app.evaluate(cssCheck);
    if (on.error) problems.push('check failed: ' + on.error);
    else if (on.value.css && !on.value.applied) problems.push('CSS did not reach the page when turned on');

    await app.evaluate(`window.yapnap.setPlugin(${JSON.stringify(p.id)}, false)`);
    await sleep(WAIT);
    const off = await app.evaluate(cssCheck);
    if (!off.error && off.value.css && off.value.applied) problems.push('CSS was still on the page after turning off');

    if (app.errors.length) problems.push('error on the page: ' + app.errors[0]);

    // Put the plugin back the way it was.
    await app.evaluate(`window.yapnap.setPlugin(${JSON.stringify(p.id)}, ${wasOn ? 'true' : 'false'})`);

    if (problems.length) {
      failures.push({ id: p.id, problems });
      console.log(`FAIL  ${p.id}: ${problems.join('; ')}`);
    } else {
      passed++;
    }
  }

  console.log(`\n${passed} of ${plugins.length} plugins passed.`);
  if (failures.length) {
    console.log(`${failures.length} failed. Each line above says what went wrong.`);
  }
  app.close();
  process.exit(failures.length ? 1 : 0);
})().catch((e) => {
  console.error('ERROR', e.message);
  process.exit(2);
});

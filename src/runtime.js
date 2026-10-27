// Page runtime. It runs inside the chat page after the registry and the plugin files. It applies the saved
// state: one <style> element holds the CSS of every enabled plugin, and JavaScript plugins start and stop.
// Turning a plugin off or changing a setting takes effect at once, without a reload.
(function () {
  'use strict';
  if (window.__yapnap) return;

  var STYLE_ID = 'yapnap-style';
  var running = new Map(); // plugin id -> { key, stop }

  function log() {
    try { console.info.apply(console, ['[Yapnap]'].concat([].slice.call(arguments))); } catch (e) { /* no console */ }
  }

  function styleEl() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    return el;
  }

  // The update notice: a small card in the bottom-right corner while a newer version is known. It is not a plugin, so it
  // cannot be turned off, but it can be dismissed for this session. It never covers the top of Yapin's page.
  var BAR_ID = 'yapnap-update-bar';
  var BAR_CSS = '#yapnap-update-bar{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:12px;' +
    'padding:8px 8px 8px 14px;border-radius:10px;background:var(--bg-elev,#2b2c33);color:var(--text,#ececf1);' +
    'border:1px solid var(--border,#ffffff12);box-shadow:0 12px 30px rgba(0,0,0,.35);font:500 13px/1.4 system-ui,sans-serif;' +
    'animation:yapnap-bar-in .22s cubic-bezier(.22,.8,.24,1) both}' +
    '#yapnap-update-bar button{height:28px;border:0;border-radius:7px;padding:0 12px;background:#ef9448;color:#140d06;font:600 13px system-ui,sans-serif;cursor:pointer;transition:background .15s}' +
    '#yapnap-update-bar button:hover{background:#f5a867}' +
    '#yapnap-update-bar .yapnap-bar-x{width:26px;padding:0;background:none;color:var(--text-muted,#9c9daa);font-size:18px;line-height:1}' +
    '#yapnap-update-bar .yapnap-bar-x:hover{background:var(--bg-hover,#2f3038);color:var(--text,#ececf1)}' +
    '@keyframes yapnap-bar-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){#yapnap-update-bar{animation:none}}';

  function renderUpdateBar(update) {
    var bar = document.getElementById(BAR_ID);
    if (!update || !update.version || window.__yapnapDismissed === update.version) {
      if (bar) bar.remove();
      return;
    }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = BAR_ID;
      bar.setAttribute('role', 'status');
      (document.body || document.documentElement).appendChild(bar);
    }
    bar.textContent = '';
    var text = document.createElement('span');
    text.textContent = update.ready ? 'Yapnap ' + update.version + ' is ready.' : 'Yapnap ' + update.version + ' is out.';
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = update.ready ? 'Restart to update' : 'Get it';
    button.addEventListener('click', function () {
      if (window.yapperDesktop && window.yapperDesktop.installUpdate) window.yapperDesktop.installUpdate();
    });
    bar.appendChild(text);
    bar.appendChild(button);
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'yapnap-bar-x';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', function () {
      window.__yapnapDismissed = update.version;
      bar.remove();
    });
    bar.appendChild(close);
  }

  function stopPlugin(id) {
    var r = running.get(id);
    if (!r) return;
    running.delete(id);
    try { if (r.stop) r.stop(); } catch (e) { log('stop failed:', id, e); }
  }

  function apply(state) {
    state = state || {};
    // Safe mode turns off every plugin. Yapnap's own core features (such as badges) keep running.
    var saved = state.plugins || {};
    var css = [];
    var active = new Set();

    var safe = !!state.safe;
    window.YAPNAP.all().forEach(function (p) {
      var mine = saved[p.id] || {};
      var on = p.core ? true : (!safe && (typeof mine.on === 'boolean' ? mine.on : !!p.def));
      if (!on) { stopPlugin(p.id); window.YAPNAP.clearFail(p.id); return; }

      active.add(p.id);
      window.YAPNAP.clearFail(p.id);
      var s = window.YAPNAP.clean(p, mine.s);

      if (p.css) {
        try { css.push(typeof p.css === 'function' ? p.css(s) : p.css); } catch (e) {
          log('css failed:', p.id, e);
          window.YAPNAP.fail(p.id, 'Its style could not be built.');
        }
      }

      if (p.start) {
        var key = JSON.stringify([s, state.badges || null]);
        var cur = running.get(p.id);
        if (cur && cur.key === key) return;
        stopPlugin(p.id);
        try {
          var stop = p.start({ settings: s, badges: state.badges || {}, log: log });
          running.set(p.id, { key: key, stop: typeof stop === 'function' ? stop : null });
        } catch (e) {
          log('start failed:', p.id, e);
          window.YAPNAP.fail(p.id, 'It could not start on this page.');
        }
      }
    });

    // Anything still running that is no longer enabled (or no longer registered) is stopped.
    Array.from(running.keys()).forEach(function (id) { if (!active.has(id)) stopPlugin(id); });

    css.push(BAR_CSS);
    renderUpdateBar(state.update);

    // The person's own CSS comes last, so it wins. Safe mode leaves it out, like every plugin.
    if (!safe && typeof state.custom === 'string' && state.custom) css.push(state.custom);

    styleEl().textContent = css.join('\n');
    return { active: active.size, css: css.length };
  }

  window.__yapnap = { apply: apply, version: '1.0.0' };
})();

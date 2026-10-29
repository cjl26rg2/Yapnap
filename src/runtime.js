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

  // An installed theme: its colours for the panels and text, and its picture behind the chat. The picture shows through
  // the panels: its opacity is how much of it shows, so the panels are that much see-through. The selectors are the
  // strong ones the palettes use, so they win.
  function rgbOf(hex) {
    var n = parseInt(hex.slice(1), 16);
    return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
  }
  function brightness(hex) {
    var n = parseInt(hex.slice(1), 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }
  function themeCss(t) {
    var c = t.colors;
    var picture = !!t.image;
    var panel = picture ? Math.max(0.15, 1 - t.opacity) : 1;
    var alpha = function (hex, a) { return 'rgba(' + rgbOf(hex) + ',' + a + ')'; };
    var lift = function (hex, pct) { return 'color-mix(in srgb,' + hex + ' ' + pct + '%,#ffffff)'; };
    var sel = ':root:root:root:root,.app.app.app.app';
    var vars = {
      '--bg-main': alpha(c.bg, panel), '--bg-side': alpha(c.side, panel), '--bg-side-solid': alpha(c.side, panel), '--bg-rail': alpha(c.side, panel),
      '--bg-elev': alpha(c.elev, panel), '--bg-float': c.elev, '--bg-floating': c.elev,
      '--bg-hover': lift(c.elev, 92), '--bg-active': lift(c.elev, 86), '--bg-input': c.side,
      '--border': alpha(c.text, 0.14), '--text': c.text, '--text-muted': alpha(c.text, 0.72), '--text-faint': alpha(c.text, 0.5),
      '--nl-side': alpha(c.side, panel), '--nl-rail': alpha(c.side, panel), '--nl-panel': alpha(c.bg, panel), '--nl-elev': alpha(c.elev, panel),
      '--nl-hover': lift(c.elev, 92), '--nl-active': lift(c.elev, 86), '--nl-input': c.side, '--nl-float': c.elev,
      '--nl-line': alpha(c.text, 0.14),
      '--accent': c.accent, '--accent-hover': lift(c.accent, 88), '--accent-soft': alpha(c.accent, 0.14),
      '--on-accent': brightness(c.accent) > 0.6 ? '#101114' : '#ffffff'
    };
    var decls = Object.keys(vars).map(function (k) { return k + ':' + vars[k] + '!important'; });
    var css = sel + '{' + decls.join(';') + '}';
    // Yapper paints the body with its own rules, so the body is made clear: the page's colour or picture shows through.
    css += ':root:root:root:root body{background:transparent!important}';
    if (picture) {
      var tile = t.size === 'tile';
      css += ':root:root:root:root{background-color:' + c.bg + '!important;background-image:url("' + t.image + '")!important;' +
        'background-size:' + (tile ? 'auto' : 'cover') + '!important;background-repeat:' + (tile ? 'repeat' : 'no-repeat') + '!important;background-position:center!important}';
    } else {
      css += ':root:root:root:root{background-color:' + c.bg + '!important;background-image:none!important}';
    }
    return css;
  }

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

  // Marketplace mods are plugins on this page while they are installed. A mod that uses the id of a built-in plugin is
  // refused, so a mod can never replace one of ours.
  var marketIds = [];
  function syncMarket(mods) {
    marketIds.forEach(function (id) { window.YAPNAP.remove(id); });
    marketIds = [];
    mods.forEach(function (m) {
      if (!m || typeof m.id !== 'string') return;
      if (window.YAPNAP.get(m.id)) { log('mod skipped, that id is taken:', m.id); return; }
      try {
        window.YAPNAP.add({ id: m.id, name: m.name, desc: m.desc, category: m.category, market: true, css: m.css });
        marketIds.push(m.id);
      } catch (e) { log('mod skipped:', m.id, e); }
    });
  }

  function apply(state) {
    state = state || {};
    // Safe mode turns off every plugin. Yapnap's own core features (such as badges) keep running.
    var saved = state.plugins || {};
    var css = [];
    var active = new Set();

    var safe = !!state.safe;
    syncMarket(state.market || []);
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
    // An installed theme comes after the plugins, so it wins over them. The person's own CSS still comes last.
    if (!safe && state.theme && state.theme.colors) {
      try { css.push(themeCss(state.theme)); } catch (e) { log('theme failed:', e); }
    }
    if (!safe && typeof state.custom === 'string' && state.custom) css.push(state.custom);

    styleEl().textContent = css.join('\n');
    return { active: active.size, css: css.length };
  }

  window.__yapnap = { apply: apply, version: '1.1.2' };
})();

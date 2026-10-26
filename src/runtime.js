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
      if (!on) { stopPlugin(p.id); return; }

      active.add(p.id);
      var s = window.YAPNAP.clean(p, mine.s);

      if (p.css) {
        try { css.push(typeof p.css === 'function' ? p.css(s) : p.css); } catch (e) { log('css failed:', p.id, e); }
      }

      if (p.start) {
        var key = JSON.stringify([s, state.badges || null]);
        var cur = running.get(p.id);
        if (cur && cur.key === key) return;
        stopPlugin(p.id);
        try {
          var stop = p.start({ settings: s, badges: state.badges || {}, log: log });
          running.set(p.id, { key: key, stop: typeof stop === 'function' ? stop : null });
        } catch (e) { log('start failed:', p.id, e); }
      }
    });

    // Anything still running that is no longer enabled (or no longer registered) is stopped.
    Array.from(running.keys()).forEach(function (id) { if (!active.has(id)) stopPlugin(id); });

    // The person's own CSS comes last, so it wins. Safe mode leaves it out, like every plugin.
    if (!safe && typeof state.custom === 'string' && state.custom) css.push(state.custom);

    styleEl().textContent = css.join('\n');
    return { active: active.size, css: css.length };
  }

  window.__yapnap = { apply: apply, version: '0.2.0' };
})();

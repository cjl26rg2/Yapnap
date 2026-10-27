// Plugin registry. Loaded before every file in src/plugins, in the chat page and in the settings window.
// A plugin is a plain object; see src/runtime.js for how it is applied.
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  if (root.YAPNAP) return;

  var plugins = new Map();
  var failures = new Map();
  var CATEGORIES = ['Messages', 'Composer', 'Sidebar', 'Members', 'Voice', 'Look', 'Access', 'Behaviour'];
  var ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  root.YAPNAP = {
    categories: CATEGORIES,
    add: function (p) {
      if (!p || typeof p.id !== 'string' || !ID.test(p.id)) throw new Error('Bad plugin id: ' + (p && p.id));
      if (!p.core && CATEGORIES.indexOf(p.category) === -1) throw new Error('Bad category on ' + p.id);
      if (!p.name || !p.desc) throw new Error('Missing name or desc on ' + p.id);
      plugins.set(p.id, p);
    },
    list: function () { return Array.from(plugins.values()).filter(function (p) { return !p.core; }); },
    all: function () { return Array.from(plugins.values()); },
    get: function (id) { return plugins.get(id) || null; },
    // A plugin that threw while it was applied. The settings panel shows it, so it never looks like it is working.
    fail: function (id, reason) { failures.set(id, String(reason || 'It could not start.').slice(0, 160)); },
    clearFail: function (id) { failures.delete(id); },
    failure: function (id) { return failures.get(id) || null; },
    defaults: function (p) {
      var out = {};
      (p.settings || []).forEach(function (s) { out[s.key] = s.def; });
      return out;
    },
    // Settings values are checked against their declared type before a plugin sees them.
    clean: function (p, raw) {
      var out = this.defaults(p);
      (p.settings || []).forEach(function (s) {
        var v = raw && Object.prototype.hasOwnProperty.call(raw, s.key) ? raw[s.key] : undefined;
        if (v === undefined) return;
        if (s.type === 'range') {
          var n = Number(v);
          if (isFinite(n)) out[s.key] = Math.min(s.max, Math.max(s.min, n));
        } else if (s.type === 'color') {
          if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) out[s.key] = v.toLowerCase();
        }
      });
      return out;
    }
  };
})();

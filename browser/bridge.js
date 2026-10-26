// Yapnap for browsers, part 1 of 2. It runs in the extension's own world, where chrome.storage is available.
// page.js, the second part, runs inside Yapper and talks to this file with window messages. The rules here follow
// main.js in the desktop app: the same settings and accepted values. The shared role list and the role checks come
// from the website, the same as in the desktop app.
(function () {
  'use strict';

  var api = typeof browser !== 'undefined' ? browser : chrome;
  var VERSION = '0.3.0';
  var BUILT = '__BUILT__';
  var BUNDLED_BADGES = __BADGES__;
  var KEY = 'yapnap';
  var ROLES_URL = 'https://yapnap.pages.dev';
  var ROLES_EVERY = 10 * 60 * 1000;

  var OWNER_ID = '879e9081-5614-436d-971a-09481669a35f';
  var DEFAULT_TIERS = {
    owner: { label: 'Owner', color: '#e9b530' },
    'co-owner': { label: 'Co-owner', color: '#ff8c42' },
    admin: { label: 'Admin', color: '#d94a3f' },
    mod: { label: 'Mod', color: '#26a88a' },
    contributor: { label: 'Contributor', color: '#3b6fdb' },
    advertiser: { label: 'Advertiser', color: '#b57bff' },
    partner: { label: 'Partner', color: '#3ec5d9' },
    sponsor: { label: 'Sponsor', color: '#9be564' },
    supporter: { label: 'Supporter', color: '#ff7eb3' },
    translator: { label: 'Translator', color: '#f5e663' },
    artist: { label: 'Artist', color: '#d46bff' },
    designer: { label: 'Designer', color: '#66d1ff' },
    developer: { label: 'Developer', color: '#c0c6d1' },
    tester: { label: 'Tester', color: '#8a94a6' },
    helper: { label: 'Helper', color: '#7bdcb5' },
    veteran: { label: 'Veteran', color: '#c9a227' },
    friend: { label: 'Friend', color: '#d7dbe4' },
  };
  var APP_DEFAULTS = { trayOnClose: true, notifications: true, flashOnMention: true, safeMode: false, zoom: 100, myId: '', roleKey: '', customCss: '' };
  var APP_BOOLEANS = ['trayOnClose', 'notifications', 'flashOnMention', 'safeMode'];
  var CUSTOM_CSS_MAX = 20000;
  var BAD_CSS = /url\s*\(|@import|expression\s*\(|javascript:|behavior|-moz-binding|[<>\\]/i;
  var ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function cleanApp(raw) {
    var out = Object.assign({}, APP_DEFAULTS);
    if (!raw || typeof raw !== 'object') return out;
    APP_BOOLEANS.forEach(function (k) { if (typeof raw[k] === 'boolean') out[k] = raw[k]; });
    if (typeof raw.zoom === 'number' && isFinite(raw.zoom)) out.zoom = Math.min(150, Math.max(75, Math.round(raw.zoom)));
    if (typeof raw.myId === 'string' && (raw.myId === '' || /^[A-Za-z0-9-]{8,64}$/.test(raw.myId))) out.myId = raw.myId;
    if (typeof raw.roleKey === 'string' && raw.roleKey.length <= 200) out.roleKey = raw.roleKey.trim();
    if (typeof raw.customCss === 'string' && raw.customCss.length <= CUSTOM_CSS_MAX && !BAD_CSS.test(raw.customCss)) out.customCss = raw.customCss;
    return out;
  }

  function validSettingValue(key, value) {
    if (typeof key !== 'string' || !/^[a-z]{1,20}$/.test(key)) return false;
    return typeof value === 'number' || typeof value === 'boolean' || (typeof value === 'string' && value.length <= 16);
  }

  function cleanPrefs(raw) {
    var out = { plugins: {}, app: cleanApp(raw && raw.app) };
    if (!raw || typeof raw !== 'object' || !raw.plugins || typeof raw.plugins !== 'object') return out;
    Object.keys(raw.plugins).slice(0, 500).forEach(function (id) {
      var v = raw.plugins[id];
      if (!ID.test(id) || !v || typeof v !== 'object') return;
      var entry = {};
      if (typeof v.on === 'boolean') entry.on = v.on;
      if (v.s && typeof v.s === 'object') {
        entry.s = {};
        Object.keys(v.s).slice(0, 20).forEach(function (k) { if (validSettingValue(k, v.s[k])) entry.s[k] = v.s[k]; });
      }
      out.plugins[id] = entry;
    });
    return out;
  }

  function cleanBadges(raw) {
    var tiers = {};
    var users = {};
    Object.keys((raw && raw.tiers) || {}).slice(0, 20).forEach(function (key) {
      var t = raw.tiers[key];
      if (!ID.test(key) || !t || typeof t.label !== 'string' || typeof t.color !== 'string') return;
      if (!/^#[0-9a-f]{6}$/i.test(t.color)) return;
      tiers[key] = { label: t.label.slice(0, 20), color: t.color };
    });
    Object.keys(DEFAULT_TIERS).forEach(function (key) { if (!tiers[key]) tiers[key] = DEFAULT_TIERS[key]; });
    Object.keys((raw && raw.users) || {}).slice(0, 5000).forEach(function (id) {
      var u = raw.users[id];
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || !u || !Object.prototype.hasOwnProperty.call(tiers, u.tier)) return;
      users[id] = { tier: u.tier, note: typeof u.note === 'string' ? u.note.slice(0, 80) : '' };
    });
    users[OWNER_ID] = { tier: 'owner', note: 'Owner' };
    return { tiers: tiers, users: users };
  }

  // What this role key may do, as the website last said. Kept in memory; a network failure keeps the last answer.
  var roleLevel = null;
  var grantable = [];

  // Stored data: the settings, and the last copy of the shared role list. The bundled list is the fallback.
  function load() {
    return api.storage.local.get([KEY, 'rolesCache']).then(function (got) {
      var saved = got[KEY] || {};
      return { prefs: cleanPrefs(saved.prefs), cache: got.rolesCache || null };
    });
  }

  function saveSettings(d) {
    var stored = {};
    stored[KEY] = { prefs: d.prefs };
    return api.storage.local.set(stored);
  }

  function badgesOf(cache) {
    return cleanBadges({
      tiers: BUNDLED_BADGES.tiers,
      users: cache && cache.users ? cache.users : BUNDLED_BADGES.users,
    });
  }

  // One change at a time, so two quick clicks cannot overwrite each other.
  var queue = Promise.resolve();
  function serial(task) {
    var run = queue.then(task);
    queue = run.catch(function () {});
    return run;
  }

  function edit(change) {
    return serial(function () {
      return load().then(function (d) {
        var result = change(d);
        return saveSettings(d).then(function () { return result; });
      });
    });
  }

  // Tells the page that something it shows has changed, so it reads the state again.
  function notify() {
    window.postMessage({ source: 'yapnap-bridge', event: 'changed' }, '*');
  }

  function refreshMe() {
    return load().then(function (d) {
      var key = d.prefs.app.roleKey;
      if (!key) { roleLevel = null; grantable = []; return; }
      return fetch(ROLES_URL + '/api/roles/me', { headers: { authorization: 'Bearer ' + key } }).then(function (res) {
        if (res.status === 401) { roleLevel = null; grantable = []; return; }
        if (!res.ok) return;
        return res.json().then(function (data) {
          if (!data || typeof data.role !== 'string') return;
          roleLevel = data.role;
          grantable = Array.isArray(data.grantable)
            ? data.grantable.filter(function (t) { return typeof t === 'string'; }).slice(0, 30)
            : [];
        });
      });
    }).catch(function () { /* offline: keep the last answer */ });
  }

  // Gets the shared role list. A failed check keeps the last good copy.
  function refreshRoles() {
    return fetch(ROLES_URL + '/api/roles')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || typeof data.users !== 'object' || data.users === null) throw new Error('unexpected list');
        return api.storage.local.set({ rolesCache: { users: data.users, updated: data.updated || null } });
      })
      .catch(function () { /* keep the last good list */ })
      .then(refreshMe)
      .then(notify);
  }

  // Gives or removes a role on the website. The website checks who may do it.
  function grantOnServer(userId, tier) {
    return load().then(function (d) {
      var key = d.prefs.app.roleKey;
      if (!key) return { ok: false, reason: 'Paste your role key in the Roles section first.' };
      return fetch(ROLES_URL + '/api/roles/grant', {
        method: 'POST',
        headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
        body: JSON.stringify({ userId: userId, tier: tier }),
      }).then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (!data || typeof data.ok !== 'boolean') return { ok: false, reason: 'The role server gave an unexpected answer.' };
          if (!data.ok) return { ok: false, reason: String(data.reason || 'Could not change that role.').slice(0, 200) };
          return refreshRoles().then(function () { return { ok: true }; });
        });
      });
    }).catch(function () {
      return { ok: false, reason: 'Could not reach the role server. Check your connection.' };
    });
  }

  function snapshot(d) {
    var app = Object.assign({}, d.prefs.app);
    var hasRoleKey = Boolean(app.roleKey);
    delete app.roleKey;
    app.hasRoleKey = hasRoleKey;
    return {
      version: VERSION,
      badges: badgesOf(d.cache),
      plugins: d.prefs.plugins,
      app: app,
      roleLevel: roleLevel,
      grantable: grantable,
      info: { browser: true, packaged: true, built: BUILT, platform: navigator.platform || 'Unknown' },
    };
  }

  var ops = {
    state: function () {
      return serial(function () { return load().then(snapshot); });
    },
    setPlugin: function (id, on) {
      return edit(function (d) {
        if (typeof id !== 'string' || !ID.test(id) || typeof on !== 'boolean') return false;
        if (Object.keys(d.prefs.plugins).length >= 500 && !d.prefs.plugins[id]) return false;
        d.prefs.plugins[id] = Object.assign({}, d.prefs.plugins[id], { on: on });
        return true;
      });
    },
    setSetting: function (id, key, value) {
      return edit(function (d) {
        if (typeof id !== 'string' || !ID.test(id) || !validSettingValue(key, value)) return false;
        var cur = d.prefs.plugins[id] || {};
        var s = Object.assign({}, cur.s);
        s[key] = value;
        d.prefs.plugins[id] = Object.assign({}, cur, { s: s });
        return true;
      });
    },
    reset: function () {
      return edit(function (d) {
        d.prefs = { plugins: {}, app: d.prefs.app };
        return true;
      });
    },
    setApp: function (key, value) {
      return edit(function (d) {
        var app = d.prefs.app;
        if (typeof key !== 'string') return false;
        if (key === 'zoom') {
          if (typeof value !== 'number' || !isFinite(value)) return false;
          app.zoom = Math.min(150, Math.max(75, Math.round(value)));
        } else if (key === 'myId') {
          if (typeof value !== 'string' || (value !== '' && !/^[A-Za-z0-9-]{8,64}$/.test(value))) return false;
          app.myId = value;
        } else if (key === 'customCss') {
          if (typeof value !== 'string' || value.length > CUSTOM_CSS_MAX || BAD_CSS.test(value)) return false;
          app.customCss = value;
        } else if (key === 'roleKey') {
          if (typeof value !== 'string' || value.length > 200) return false;
          app.roleKey = value.trim();
        } else if (APP_BOOLEANS.indexOf(key) !== -1) {
          if (typeof value !== 'boolean') return false;
          app[key] = value;
        } else {
          return false;
        }
        return true;
      }).then(function (result) {
        // A new key changes what the website says this install may do, so ask again before the page reads it.
        return key === 'roleKey' ? refreshMe().then(function () { notify(); return result; }) : result;
      });
    },
    grant: function (userId, tier) {
      if (typeof userId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(userId)) return Promise.resolve({ ok: false, reason: 'That does not look like a user ID.' });
      if (tier !== null && typeof tier !== 'string') return Promise.resolve({ ok: false, reason: 'Unknown role.' });
      return grantOnServer(userId, tier);
    },
    // A browser has no data folder for the extension to open.
    openDataFolder: function () {
      return Promise.resolve(false);
    },
  };

  // Requests come from page.js as window messages. Only messages from this same window are read.
  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (event.source !== window || !msg || msg.source !== 'yapnap-page' || typeof msg.id !== 'number') return;
    var args = Array.isArray(msg.args) ? msg.args : [];
    var op = Object.prototype.hasOwnProperty.call(ops, msg.method) ? ops[msg.method] : null;
    function reply(ok, payload) {
      window.postMessage({
        source: 'yapnap-bridge',
        id: msg.id,
        ok: ok,
        result: ok ? payload : undefined,
        error: ok ? undefined : String(payload),
      }, '*');
    }
    if (!op) { reply(false, 'Unknown request'); return; }
    Promise.resolve()
      .then(function () { return op.apply(null, args); })
      .then(function (result) { reply(true, result); }, function (err) { reply(false, (err && err.message) || 'Failed'); });
  });

  // The shared role list: read now, then every 10 minutes.
  refreshRoles();
  setInterval(refreshRoles, ROLES_EVERY);
})();

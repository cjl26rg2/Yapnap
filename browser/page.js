// Yapnap for browsers, part 2 of 2. It runs in Yapper's own page, the same place the desktop app runs the plugins.
// It gives the settings panel the same window.yapnap API as the desktop app, and applies the saved settings.
// The saved settings are read and written by bridge.js, which has access to the extension's storage.
(function () {
  'use strict';

  var pending = {};
  var seq = 0;

  function call(method, args) {
    return new Promise(function (resolve, reject) {
      seq += 1;
      pending[seq] = { resolve: resolve, reject: reject };
      window.postMessage({ source: 'yapnap-page', id: seq, method: method, args: args }, '*');
    });
  }

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (event.source !== window || !msg || msg.source !== 'yapnap-bridge') return;
    if (msg.event === 'changed') { refresh(); return; }
    var waiting = pending[msg.id];
    if (!waiting) return;
    delete pending[msg.id];
    if (msg.ok) waiting.resolve(msg.result);
    else waiting.reject(new Error(msg.error || 'Yapnap settings could not be read'));
  });

  function applyState(state) {
    if (window.__yapnap) {
      window.__yapnap.apply({
        plugins: state.plugins,
        badges: state.badges,
        safe: state.app.safeMode === true,
        custom: state.app.customCss || '',
      });
    }
    // Chat zoom: the browser's own zoom cannot be set from a page, so the page is scaled instead.
    var zoom = Number(state.app.zoom) || 100;
    if (document.documentElement) document.documentElement.style.zoom = zoom === 100 ? '' : String(zoom / 100);
  }

  function refresh() {
    return call('state', []).then(applyState);
  }

  // Changes apply straight away: each one saves, then the page reads the saved state back and applies it.
  function mutate(method, args) {
    return call(method, args).then(function (result) {
      refresh();
      return result;
    });
  }

  window.yapnap = {
    version: '0.1.0',
    state: function () { return call('state', []); },
    setPlugin: function (id, on) { return mutate('setPlugin', [String(id), on === true]); },
    setSetting: function (id, key, value) { return mutate('setSetting', [String(id), String(key), value]); },
    reset: function () { return mutate('reset', []); },
    openDataFolder: function () { return call('openDataFolder', []); },
    setApp: function (key, value) { return mutate('setApp', [String(key), value]); },
    grant: function (userId, tier) { return mutate('grant', [String(userId), tier === null ? null : String(tier)]); },
  };

  // The bridge may not be listening yet when the page loads, so ask again every 300 ms for up to 30 seconds.
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (tries > 100) { clearInterval(timer); return; }
    call('state', []).then(function (state) {
      clearInterval(timer);
      applyState(state);
    }, function () { /* the bridge answers with an error only for a bad request */ });
  }, 300);
})();

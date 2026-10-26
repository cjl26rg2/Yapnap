// The Yapnap settings panel: About, Settings, Plugins and Themes. It is used in two places: inside Yapin's own
// settings (settings-nav.js) and in the fallback window (settings/index.html). It needs window.YAPNAP (the registry),
// window.YAPNAP_ART (the images) and a bridge with state(), setPlugin(), setSetting(), setApp(), grant(), reset(),
// openDataFolder() and version. Colours come from the site's own variables, so it matches Yapin's settings.
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  if (root.YAPNAP_PANEL) return;

  var STYLE_ID = 'ym-panel-style';
  var CSS = [
    '.ym-panel{font-family:Inter,"Segoe UI",system-ui,sans-serif;font-size:14px;line-height:1.5;color:var(--text,#ececf1);max-width:980px;margin:0 auto}',
    '.ym-panel *{box-sizing:border-box}',
    '.ym-panel button,.ym-panel input,.ym-panel select{font-family:inherit}',
    '.ym-page h2{margin:0 0 4px;font-size:20px;font-weight:700;color:var(--text,#ececf1)}',
    '.ym-sub{margin:0 0 18px;font-size:13px;color:var(--text-muted,#9c9daa)}',
    '.ym-label{margin:22px 0 8px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted,#9c9daa)}',
    '.ym-card{background:var(--bg-elev,#2b2c33);border:1px solid var(--border,#ffffff12);border-radius:10px;padding:4px 16px}',
    '.ym-hero{display:flex;gap:14px;align-items:center;background:var(--bg-elev,#2b2c33);border:1px solid var(--border,#ffffff12);border-radius:10px;padding:16px}',
    '.ym-hero img{width:44px;height:44px;flex:none}',
    '.ym-hero h3{margin:0;font-size:18px;font-weight:700}',
    '.ym-hero p{margin:3px 0 0;font-size:13px;color:var(--text-muted,#9c9daa)}',
    '.ym-chip{display:inline-block;margin-left:8px;padding:1px 7px;border-radius:6px;font-size:11px;font-weight:600;color:var(--text-muted,#9c9daa);background:var(--bg-hover,#2f3038);vertical-align:2px}',
    '.ym-btnrow{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px}',
    '.ym-btn{height:34px;padding:0 13px;border-radius:8px;border:1px solid var(--border,#ffffff12);background:var(--bg-elev,#2b2c33);color:var(--text,#ececf1);font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;cursor:pointer}',
    '.ym-btn:hover{background:var(--bg-hover,#2f3038)}',
    '.ym-btn.primary{background:var(--accent,#ff6b4a);border-color:var(--accent,#ff6b4a);color:#fff}',
    '.ym-btn.primary:hover{background:var(--accent-hover,#ff5a35)}',
    '.ym-btn.on{border-color:var(--accent,#ff6b4a);color:var(--accent,#ff6b4a)}',
    '.ym-btn.warn{color:var(--danger,#f2555a)}',
    '.ym-btn img{width:15px;height:15px;flex:none}',
    '.ym-btn:disabled{opacity:.45;cursor:default}',
    '.ym-status{display:flex;align-items:center;gap:7px;min-height:20px;margin:0 0 10px;font-size:12.5px;color:var(--text-muted,#9c9daa)}',
    '.ym-status.bad{color:var(--danger,#f2555a)}',
    '.ym-status img{width:15px;height:15px}',
    '.ym-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:16px}',
    '.ym-box{background:var(--bg-elev,#2b2c33);border:1px solid var(--border,#ffffff12);border-radius:10px;padding:14px}',
    '.ym-box h4{margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted,#9c9daa)}',
    '.ym-kv{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:13px}',
    '.ym-kv span:nth-child(odd){color:var(--text-muted,#9c9daa)}',
    '.ym-kv span:nth-child(even){font-weight:600;word-break:break-all}',
    '.ym-box ul{margin:0;padding-left:16px;font-size:13px;color:var(--text,#ececf1)}',
    '.ym-box li{margin:0 0 6px}',
    '.ym-set{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 0;border-bottom:1px solid var(--border,#ffffff12)}',
    '.ym-set:last-child{border-bottom:0}',
    '.ym-set-name{font-size:14px;font-weight:600;display:flex;align-items:center;gap:9px}',
    '.ym-set-name img{flex:none;opacity:.9}',
    '.ym-set-desc{font-size:13px;color:var(--text-muted,#9c9daa);margin-top:2px}',
    '.ym-set-ctl{display:flex;align-items:center;gap:10px;flex:none}',
    '.ym-slider{width:180px;accent-color:var(--accent,#ff6b4a)}',
    '.ym-val{min-width:48px;text-align:center;font-size:12px;font-weight:700;padding:3px 8px;border-radius:7px;background:var(--bg-hover,#2f3038);font-variant-numeric:tabular-nums}',
    '.ym-text-in{width:250px;height:34px;padding:0 11px;border-radius:8px;border:1px solid var(--border,#ffffff12);background:var(--bg-input,#2d2e36);color:var(--text,#ececf1);font-size:13px;font-family:ui-monospace,Consolas,monospace}',
    '.ym-text-in:focus{outline:none;border-color:var(--accent,#ff6b4a)}',
    '.ym-switch{appearance:none;-webkit-appearance:none;position:relative;flex:none;width:42px;height:24px;margin:0;border-radius:12px;background:var(--bg-active,#383944);cursor:pointer;transition:background .15s}',
    '.ym-switch::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.35);transition:transform .15s}',
    '.ym-switch:checked{background:var(--success,#3fcf82)}',
    '.ym-switch:checked::after{transform:translateX(18px)}',
    '.ym-body{display:grid;grid-template-columns:190px minmax(0,1fr);gap:20px;align-items:start}',
    '.ym-cats{position:sticky;top:0;display:flex;flex-direction:column;gap:2px}',
    '.ym-cat{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 10px;border:0;border-radius:7px;background:none;color:var(--text-muted,#9c9daa);font-size:14px;font-weight:500;text-align:left;cursor:pointer}',
    '.ym-cat:hover{background:var(--bg-hover,#2f3038);color:var(--text,#ececf1)}',
    '.ym-cat[aria-current="true"]{background:var(--bg-active,#383944);color:var(--text,#ececf1)}',
    '.ym-cat .ym-n{font-size:12px;font-weight:600;color:var(--text-faint,#9294a1);font-variant-numeric:tabular-nums}',
    '.ym-tools{display:flex;gap:10px;align-items:center}',
    '.ym-search{flex:1;min-width:0;display:flex;align-items:center;gap:9px;height:36px;padding:0 12px;border-radius:8px;background:var(--bg-input,#2d2e36);border:1px solid var(--border,#ffffff12)}',
    '.ym-search:focus-within{border-color:var(--accent,#ff6b4a)}',
    '.ym-search img{width:15px;height:15px;opacity:.7}',
    '.ym-search input{flex:1;min-width:0;border:0;outline:0;background:none;color:var(--text,#ececf1);font-size:14px}',
    '.ym-search input::placeholder{color:var(--text-faint,#9294a1)}',
    '.ym-count{font-size:12.5px;color:var(--text-muted,#9c9daa);white-space:nowrap;font-variant-numeric:tabular-nums}',
    '.ym-list{margin-top:12px;background:var(--bg-elev,#2b2c33);border:1px solid var(--border,#ffffff12);border-radius:10px;padding:0 16px}',
    '.ym-row{display:flex;align-items:flex-start;gap:18px;padding:13px 0;border-bottom:1px solid var(--border,#ffffff12)}',
    '.ym-row:last-child{border-bottom:0}',
    '.ym-text{flex:1;min-width:0}',
    '.ym-name{font-size:14px;font-weight:600}',
    '.ym-desc{margin-top:2px;font-size:13px;color:var(--text-muted,#9c9daa)}',
    '.ym-next{padding:10px 0;border-bottom:1px solid var(--border,#ffffff12);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-faint,#9294a1)}',
    '.ym-note{margin:12px 0 0;font-size:12.5px;color:var(--text-faint,#9294a1)}',
    '.ym-opts{display:grid;gap:9px;margin-top:10px;padding:10px 12px;border-radius:8px;background:var(--bg-main,#222329)}',
    '.ym-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;color:var(--text-muted,#9c9daa)}',
    '.ym-opt .ym-slide{display:flex;align-items:center;gap:10px}',
    '.ym-opt input[type=range]{width:200px;accent-color:var(--accent,#ff6b4a)}',
    '.ym-opt input[type=color]{width:44px;height:26px;padding:0;border:0;border-radius:6px;background:none;cursor:pointer}',
    '.ym-themes{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}',
    '.ym-theme{display:flex;flex-direction:column;gap:9px;padding:10px;border-radius:10px;border:1px solid var(--border,#ffffff12);background:var(--bg-elev,#2b2c33);color:var(--text,#ececf1);text-align:left;cursor:pointer}',
    '.ym-theme:hover{border-color:rgba(255,255,255,.18)}',
    '.ym-theme[aria-checked="true"]{border-color:var(--accent,#ff6b4a)}',
    '.ym-theme-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;font-weight:600}',
    '.ym-theme-top img{width:14px;height:14px;opacity:0}',
    '.ym-theme[aria-checked="true"] .ym-theme-top img{opacity:1}',
    '.ym-sw{display:flex;height:34px;border-radius:6px;overflow:hidden;border:1px solid var(--border,#ffffff12)}',
    '.ym-sw i{flex:1}',
    '.ym-panel :focus-visible{outline:2px solid var(--accent,#ff6b4a);outline-offset:2px}',
    '.ym-empty{padding:30px 0;text-align:center;color:var(--text-muted,#9c9daa)}',
    '.ym-foot{margin-top:24px;padding-top:14px;border-top:1px solid var(--border,#ffffff12);font-size:12px;color:var(--text-faint,#9294a1)}',
    '@media (max-width:760px){.ym-body{grid-template-columns:1fr}.ym-cats{position:static;flex-direction:row;overflow-x:auto}.ym-cat{white-space:nowrap}.ym-grid3{grid-template-columns:1fr}.ym-text-in{width:100%}}',
    '@media (prefers-reduced-motion:reduce){.ym-switch,.ym-switch::after{transition:none}}'
  ].join('\n');

  var PAGES = ['about', 'settings', 'plugins', 'themes'];
  var PAGE_TITLE = { about: 'About', settings: 'Settings', plugins: 'Plugins', themes: 'Themes' };
  var CATEGORY_NOTE = {
    Messages: 'How messages are spaced, framed and labelled.',
    Composer: 'The box you type in, and its helpers.',
    Sidebar: 'The server list, channels and the dots around them.',
    Members: 'The member list, profile cards and menus.',
    Voice: 'Calls, call tiles and screen share.',
    Look: 'Colours, themes, corners and motion.',
    Access: 'Easier reading, clearer focus and bigger targets.',
    Behaviour: 'Small things the app does on its own. None of them send anything.',
    Badges: 'Contributor badges, shown only inside Yapnap.'
  };
  // The theme plugins, and the swatch colours shown on each card (background, sidebar, panel, text).
  var THEMES = [
    { id: 'theme-amoled', name: 'AMOLED black', sw: ['#000000', '#000000', '#0b0b0c', '#e9eaee'] },
    { id: 'theme-graphite', name: 'Graphite', sw: ['#1b1c20', '#17181c', '#23252b', '#e4e6eb'] },
    { id: 'theme-sepia-night', name: 'Sepia night', sw: ['#1f1b16', '#1a1713', '#2a251e', '#ece3d3'] },
    { id: 'theme-frost-light', name: 'Frost light', sw: ['#f4f6f9', '#eaedf2', '#ffffff', '#161922'] },
    { id: 'theme-forest', name: 'Forest', sw: ['#161c18', '#121813', '#1f2822', '#e2ebe4'] }
  ];
  var PUBLISH_URL = 'https://yapnap.pages.dev/publish/';
  var TIER_ORDER = ['owner', 'co-owner', 'admin', 'mod', 'contributor', 'advertiser', 'partner', 'sponsor', 'supporter', 'translator', 'artist', 'designer', 'developer', 'tester', 'helper', 'veteran', 'friend'];
  var TIER_LABEL = { owner: 'Owner', 'co-owner': 'Co-owner', admin: 'Admin', mod: 'Mod', contributor: 'Contributor', advertiser: 'Advertiser', partner: 'Partner', sponsor: 'Sponsor', supporter: 'Supporter', translator: 'Translator', artist: 'Artist', designer: 'Designer', developer: 'Developer', tester: 'Tester', helper: 'Helper', veteran: 'Veteran', friend: 'Friend' };
  var OWNER_ID = '879e9081-5614-436d-971a-09481669a35f';
  var BAD_CSS = /url\s*\(|@import|expression\s*\(|javascript:|behavior|-moz-binding|[<>\\]/i;
  var CHANGES = [
    'Settings live inside Yapin’s own settings now.',
    'Roles are shared: owner, co-owner, admins, mods and contributors.',
    'Custom CSS, and Yapnap shows its own name.',
    'Updates install themselves, or tell you when one is out.',
    'Themes, a safe mode, and a debug copy for reports.'
  ];

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function art(name, size) {
    var img = document.createElement('img');
    img.alt = '';
    img.width = size;
    img.height = size;
    img.src = root.YAPNAP_ART ? root.YAPNAP_ART.src(name) : '';
    return img;
  }

  function logErr(err) { console.error('Yapnap panel:', err); }

  function mount(host, bridge) {
    injectStyle();
    var Y = root.YAPNAP;
    var state = { plugins: {}, badges: { tiers: {}, users: {} }, app: {}, info: {} };
    var page = 'about';
    var query = '';
    var cat = 'All';
    var view = el('div', 'ym-page');
    var root2 = el('div', 'ym-panel');
    root2.appendChild(view);
    host.appendChild(root2);

    // ----- plugin state -----
    function savedOf(p) { return state.plugins[p.id] || {}; }
    function isOn(p) {
      var s = savedOf(p);
      return typeof s.on === 'boolean' ? s.on : !!p.def;
    }
    function valueOf(p, s) {
      var vals = savedOf(p).s || {};
      return Object.prototype.hasOwnProperty.call(vals, s.key) ? vals[s.key] : s.def;
    }
    function byId(id) { return Y.get(id); }
    function setOn(p, on) {
      state.plugins[p.id] = Object.assign({}, savedOf(p), { on: on });
      return Promise.resolve(bridge.setPlugin(p.id, on)).catch(logErr);
    }
    function setValue(p, s, v) {
      var cur = savedOf(p);
      var vals = Object.assign({}, cur.s);
      vals[s.key] = v;
      state.plugins[p.id] = Object.assign({}, cur, { s: vals });
      // Changing a value of a plugin that is off turns it on, so the change is visible straight away.
      if (!isOn(p)) setOn(p, true);
      return Promise.resolve(bridge.setSetting(p.id, s.key, v)).catch(logErr);
    }
    function inCategory(c) { return Y.list().filter(function (p) { return p.category === c; }); }
    function matches(p) {
      if (!query) return true;
      return (p.name + ' ' + p.desc + ' ' + p.category).toLowerCase().indexOf(query.toLowerCase()) !== -1;
    }
    function activeTheme() {
      var on = THEMES.filter(function (t) { var p = byId(t.id); return p && isOn(p); });
      return on.length ? on[0].id : 'default';
    }
    function themeCount() { return THEMES.filter(function (t) { var p = byId(t.id); return p && isOn(p); }).length; }

    // ----- shared bits -----
    function button(label, cls, icon) {
      var b = el('button', 'ym-btn' + (cls ? ' ' + cls : ''));
      b.type = 'button';
      if (icon) b.appendChild(art(icon, 15));
      b.appendChild(document.createTextNode(label));
      return b;
    }
    function status(ok, text) {
      var s = el('p', ok ? 'ym-status' : 'ym-status bad');
      s.appendChild(art(ok ? 'ui-saved' : 'ui-warning', 15));
      s.appendChild(document.createTextNode(text));
      return s;
    }
    function fresh(title, sub) {
      view.textContent = '';
      view.appendChild(el('h2', null, title));
      if (sub) view.appendChild(el('p', 'ym-sub', sub));
    }

    // ----- About -----
    function renderAbout() {
      fresh('About', null);
      var info = state.info || {};
      var ver = state.version || (bridge && bridge.version) || '';
      var hero = el('div', 'ym-hero');
      hero.appendChild(art('yapnap-logo', 44));
      var words = el('div');
      var h = el('h3', null, 'Yapnap');
      h.appendChild(el('span', 'ym-chip', 'v' + ver));
      words.appendChild(h);
      words.appendChild(el('p', null, "Plugins, settings and contributor badges for Yapin'. Unofficial."));
      words.appendChild(el('p', null, 'Author: Yapnap contributors'));
      hero.appendChild(words);
      view.appendChild(hero);

      var row = el('div', 'ym-btnrow');
      var copy = button('Copy debug info', 'primary', 'ui-check');
      var copyNote = null;
      copy.addEventListener('click', function () {
        var text = debugText();
        Promise.resolve(navigator.clipboard && navigator.clipboard.writeText(text)).then(function () {
          if (copyNote) copyNote.replaceWith(status(true, 'Copied. Paste it into a bug report.'));
        }).catch(logErr);
        copyNote = copyNote || el('p');
        if (!copyNote.parentNode) row.parentNode.insertBefore(copyNote, row.nextSibling);
      });
      row.appendChild(copy);
      if (!(state.info && state.info.browser)) {
        var folder = button('Data folder', '', 'ui-folder');
        folder.addEventListener('click', function () { Promise.resolve(bridge.openDataFolder()).catch(logErr); });
        row.appendChild(folder);
      }
      var safe = button(state.app.safeMode ? 'Safe mode is on' : 'Safe mode', state.app.safeMode ? 'on warn' : '', 'ui-warning');
      safe.addEventListener('click', function () {
        var next = !state.app.safeMode;
        state.app.safeMode = next;
        Promise.resolve(bridge.setApp('safeMode', next)).then(renderAbout).catch(logErr);
      });
      row.appendChild(safe);
      var reset = button('Reset plugins', '', 'ui-reset');
      var armed = false;
      var timer = null;
      reset.addEventListener('click', function () {
        if (!armed) {
          armed = true;
          reset.lastChild.textContent = 'Click again to reset';
          reset.classList.add('warn');
          timer = setTimeout(function () { armed = false; reset.lastChild.textContent = 'Reset plugins'; reset.classList.remove('warn'); }, 3000);
          return;
        }
        clearTimeout(timer);
        state.plugins = {};
        Promise.resolve(bridge.reset()).then(refresh).catch(logErr);
      });
      row.appendChild(reset);
      view.appendChild(row);
      if (state.app.safeMode) view.appendChild(el('p', 'ym-sub', 'Safe mode runs Yapnap with every plugin off. Your settings are kept.'));

      var grid = el('div', 'ym-grid3');
      grid.appendChild(box('Build', [
        ['Built', info.built ? new Date(info.built).toLocaleString() : 'Unknown'],
        ['Version', ver],
        ['Plugin API', '1'],
        ['Plugins', String(Y.list().length)]
      ]));
      grid.appendChild(box('Environment', info.browser ? [
        ['Running in', 'Browser extension'],
        ['System', info.platform || 'Unknown']
      ] : [
        ['Running in', info.packaged ? 'Desktop app' : 'Development'],
        ['Electron', info.electron || 'n/a'],
        ['Chromium', info.chrome || 'n/a'],
        ['Node', info.node || 'n/a'],
        ['System', (info.platform || '') + ' ' + (info.os || '')]
      ]));
      var ul = el('ul');
      CHANGES.forEach(function (c) { ul.appendChild(el('li', null, c)); });
      var news = el('div', 'ym-box');
      news.appendChild(el('h4', null, "What's new"));
      news.appendChild(ul);
      grid.appendChild(news);
      view.appendChild(grid);
    }
    function box(title, pairs) {
      var b = el('div', 'ym-box');
      b.appendChild(el('h4', null, title));
      var kv = el('div', 'ym-kv');
      pairs.forEach(function (p) { kv.appendChild(el('span', null, p[0])); kv.appendChild(el('span', null, p[1])); });
      b.appendChild(kv);
      return b;
    }
    function debugText() {
      var info = state.info || {};
      var on = Y.list().filter(isOn).map(function (p) { return p.id; });
      return JSON.stringify({
        yapnap: state.version || '', built: info.built || '', electron: info.electron || '', chrome: info.chrome || '',
        node: info.node || '', platform: info.platform || '', os: info.os || '', packaged: !!info.packaged,
        safeMode: !!state.app.safeMode, pluginsOn: on.length, pluginsTotal: Y.list().length, theme: activeTheme(), enabled: on
      }, null, 2);
    }

    // ----- Settings -----
    function setRow(name, desc, control, icon) {
      var row = el('div', 'ym-set');
      var text = el('div');
      var nameLine = el('div', 'ym-set-name');
      if (icon) nameLine.appendChild(art(icon, 16));
      nameLine.appendChild(document.createTextNode(name));
      text.appendChild(nameLine);
      text.appendChild(el('div', 'ym-set-desc', desc));
      var ctl = el('div', 'ym-set-ctl');
      ctl.appendChild(control);
      row.appendChild(text);
      row.appendChild(ctl);
      return row;
    }
    function appToggle(key) {
      var sw = el('input', 'ym-switch');
      sw.type = 'checkbox';
      sw.checked = state.app[key] !== false;
      sw.setAttribute('role', 'switch');
      sw.setAttribute('aria-label', key);
      sw.addEventListener('change', function () {
        state.app[key] = sw.checked;
        Promise.resolve(bridge.setApp(key, sw.checked)).catch(logErr);
      });
      return sw;
    }
    function renderSettings() {
      fresh('Settings', 'Changes apply straight away.');
      view.appendChild(el('div', 'ym-label', 'General'));
      var card = el('div', 'ym-card');
      if (!(state.info && state.info.browser)) {
        card.appendChild(setRow('Keep running in the tray when closed', 'Closing the window hides Yapnap. Calls and mentions keep working.', appToggle('trayOnClose'), 'ui-tray'));
        card.appendChild(setRow('Desktop notifications', 'Show a system notification for new messages while the window is in the background.', appToggle('notifications'), 'ui-bell'));
        card.appendChild(setRow('Flash the taskbar on mentions', 'The taskbar button flashes when someone mentions you.', appToggle('flashOnMention'), 'ui-flash'));
      }
      var zWrap = el('span', 'ym-set-ctl');
      var zOut = el('output', 'ym-val', (state.app.zoom || 100) + '%');
      var zoom = el('input', 'ym-slider');
      zoom.type = 'range';
      zoom.min = '75';
      zoom.max = '150';
      zoom.step = '5';
      zoom.value = String(state.app.zoom || 100);
      zoom.setAttribute('aria-label', 'Chat zoom');
      zoom.addEventListener('input', function () { zOut.textContent = zoom.value + '%'; });
      zoom.addEventListener('change', function () {
        state.app.zoom = Number(zoom.value);
        Promise.resolve(bridge.setApp('zoom', Number(zoom.value))).catch(logErr);
      });
      zWrap.appendChild(zoom);
      zWrap.appendChild(zOut);
      card.appendChild(setRow('Chat zoom', '100% is the normal size.', zWrap, 'ui-zoom'));
      if (!(state.info && state.info.browser)) {
        var fileOut = el('p', 'ym-note');
        var fileRow = el('span', 'ym-set-ctl');
        var saveFile = button('Save to a file', '', 'ui-folder');
        saveFile.addEventListener('click', function () {
          Promise.resolve(bridge.exportSettings()).then(function (res) {
            fileOut.textContent = res && res.ok ? 'Saved to ' + res.path + '.' : (res && res.reason) || 'Could not save.';
          }).catch(logErr);
        });
        var loadFile = button('Load from a file', '', 'ui-folder');
        loadFile.addEventListener('click', function () {
          Promise.resolve(bridge.importSettings()).then(function (res) {
            if (res && res.ok) return refresh();
            fileOut.textContent = (res && res.reason) || 'Could not load.';
            return null;
          }).catch(logErr);
        });
        fileRow.appendChild(saveFile);
        fileRow.appendChild(loadFile);
        card.appendChild(setRow('Settings file', 'Save your plugins and settings to a file, or load them from one. Your role key is never put in the file.', fileRow, 'ui-folder'));
        card.appendChild(fileOut);
      }
      var detected = !!state.app.myId;
      card.appendChild(setRow('Your account', detected ? 'Found automatically from your profile.' : 'Waiting for your profile to load. It is found automatically.', el('span', 'ym-val', detected ? 'Detected' : 'Waiting'), 'ui-id'));
      view.appendChild(card);

      view.appendChild(el('div', 'ym-label', 'Roles'));
      view.appendChild(rolesBlock());
      view.appendChild(el('div', 'ym-label', 'Custom CSS'));
      view.appendChild(customCssBlock());
    }

    // The role the website gives this app's role key: 'owner', 'admin', or null.
    function myRole() {
      return state.roleLevel || null;
    }
    // What this role key may give, as the website says. The website makes the rules, so the list always agrees with it.
    function grantable() {
      return state.grantable || [];
    }
    // Your own CSS, added after every plugin so it wins. The same rules as the desktop app check it before it saves.
    function customCssBlock() {
      var box5 = el('div', 'ym-card');
      box5.appendChild(el('p', 'ym-note', 'Your own CSS, added after every plugin so it wins. Links to files, @import, script URLs, angle brackets and backslashes are not allowed.'));
      var area = el('textarea', 'ym-text-in');
      area.value = state.app.customCss || '';
      area.rows = 10;
      area.spellcheck = false;
      area.placeholder = '.messages-inner { max-width: 900px; }';
      area.setAttribute('aria-label', 'Custom CSS');
      area.style.width = '100%';
      area.style.fontFamily = 'ui-monospace, Menlo, Consolas, monospace';
      box5.appendChild(area);
      var row5 = el('div', 'ym-set-ctl');
      row5.style.padding = '10px 0';
      var slot5 = el('div');
      var save = button('Save CSS', 'primary', 'ui-plus');
      save.addEventListener('click', function () {
        slot5.textContent = '';
        var text = area.value;
        if (text.length > 20000) { slot5.appendChild(status(false, 'That is too long. The limit is 20,000 characters.')); return; }
        if (BAD_CSS.test(text)) { slot5.appendChild(status(false, 'That CSS uses something Yapnap does not allow: links to files, @import, script URLs, angle brackets or backslashes.')); return; }
        Promise.resolve(bridge.setApp('customCss', text)).then(function (ok) {
          if (ok === false) { slot5.appendChild(status(false, 'Could not save that CSS.')); return null; }
          slot5.appendChild(status(true, 'Saved. It applies straight away.'));
          return refresh();
        }).catch(logErr);
      });
      var clear = button('Clear', 'warn', 'ui-user-remove');
      clear.addEventListener('click', function () {
        area.value = '';
        Promise.resolve(bridge.setApp('customCss', '')).then(refresh).catch(logErr);
      });
      row5.appendChild(save);
      row5.appendChild(clear);
      box5.appendChild(row5);
      box5.appendChild(slot5);
      return box5;
    }

    function rolesBlock() {
      var box2 = el('div', 'ym-card');
      var actor = myRole();
      var can = grantable();
      var seen = root.__yapnapSeen || {};
      var users = state.badges.users || {};
      var who = !actor ? 'Roles are shared with everyone. Paste your role key below to give or remove them.'
        : actor === 'owner' ? 'You are the owner. Choose a person to give them a role.'
        : actor === 'co-owner' ? 'You are a co-owner. You can give admin, mod, contributor and the cosmetic roles.'
        : actor === 'admin' ? 'You are an admin. You can give mod, contributor and the cosmetic roles.'
        : 'Only the owner and admins can change roles.';
      box2.appendChild(el('p', 'ym-note', who));

      // The role key: the owner's key is the owner's ADMIN_TOKEN, and an admin's key comes from the owner. It is
      // saved only on this computer, and the page never shows it again.
      var keyStatus = !state.app.hasRoleKey ? 'No role key saved yet.'
        : actor ? 'Your role key is accepted.'
        : 'This role key was not accepted. Check it, or ask the owner for a new one.';
      box2.appendChild(el('p', 'ym-set-desc', keyStatus));
      var keyIn = el('input', 'ym-text-in');
      keyIn.type = 'password';
      keyIn.placeholder = 'Paste your role key';
      keyIn.setAttribute('aria-label', 'Role key');
      keyIn.style.width = '240px';
      var keySave = button('Save key', 'primary', 'ui-plus');
      keySave.addEventListener('click', function () {
        Promise.resolve(bridge.setApp('roleKey', keyIn.value.trim())).then(function () {
          keyIn.value = '';
          return refresh();
        }).catch(logErr);
      });
      var keyBox = el('div', 'ym-set-ctl');
      keyBox.style.flexWrap = 'wrap';
      keyBox.style.padding = '8px 0 12px';
      keyBox.appendChild(keyIn);
      keyBox.appendChild(keySave);
      if (state.app.hasRoleKey) {
        var keyClear = button('Remove key', 'warn', 'ui-user-remove');
        keyClear.addEventListener('click', function () {
          Promise.resolve(bridge.setApp('roleKey', '')).then(refresh).catch(logErr);
        });
        keyBox.appendChild(keyClear);
      }
      box2.appendChild(keyBox);

      // How many people hold each role. Nobody sees account IDs here.
      var tally = {};
      Object.keys(users).forEach(function (id) { tally[users[id].tier] = (tally[users[id].tier] || 0) + 1; });
      var counts = el('div', 'ym-set-ctl');
      counts.style.flexWrap = 'wrap';
      counts.style.padding = '10px 0 4px';
      TIER_ORDER.forEach(function (t) {
        if (!tally[t]) return;
        counts.appendChild(el('span', 'ym-val', (TIER_LABEL[t] || t) + ' ' + tally[t]));
      });
      if (!counts.childNodes.length) counts.appendChild(el('span', 'ym-set-desc', 'No roles given yet.'));
      box2.appendChild(counts);

      var slot = el('div');
      if (can.length) {
        var form = el('div', 'ym-set-ctl');
        form.style.flexWrap = 'wrap';
        form.style.padding = '12px 0';
        var person = el('select', 'ym-text-in');
        person.style.width = '240px';
        person.setAttribute('aria-label', 'Person');
        var blank = el('option', null, 'Choose a person');
        blank.value = '';
        person.appendChild(blank);
        Object.keys(seen).filter(function (id) { return id !== root.__yapnapMe; })
          .sort(function (a, b) { return String(seen[a]).localeCompare(String(seen[b])); })
          .forEach(function (id) {
            var o = el('option', null, seen[id]);
            o.value = id;
            person.appendChild(o);
          });
        var roleSel = el('select', 'ym-text-in');
        roleSel.style.width = '170px';
        roleSel.setAttribute('aria-label', 'Role');
        var none = el('option', null, 'Remove role');
        none.value = '';
        roleSel.appendChild(none);
        can.forEach(function (t) { var o = el('option', null, TIER_LABEL[t]); o.value = t; roleSel.appendChild(o); });
        var apply = button('Apply', 'primary', 'ui-plus');
        apply.addEventListener('click', function () {
          var id = person.value;
          slot.textContent = '';
          if (!id) { slot.appendChild(status(false, 'Choose a person first.')); return; }
          var tier = roleSel.value || null;
          Promise.resolve(bridge.grant(id, tier)).then(function (res) {
            slot.textContent = '';
            if (res && res.ok) {
              slot.appendChild(status(true, (tier ? TIER_LABEL[tier] + ' given to ' : 'Role removed from ') + seen[id] + '.'));
              return refresh();
            }
            slot.appendChild(status(false, (res && res.reason) || 'Could not change that role.'));
            return null;
          }).catch(logErr);
        });
        form.appendChild(person);
        form.appendChild(roleSel);
        form.appendChild(apply);
        box2.appendChild(form);
        box2.appendChild(slot);
      }

      // Managers see who holds each role, by name, with a remove button where they are allowed.
      if (can.length) {
        Object.keys(users).sort(function (a, b) { return TIER_ORDER.indexOf(users[a].tier) - TIER_ORDER.indexOf(users[b].tier); })
          .forEach(function (id) {
            var tier = users[id].tier;
            var row = el('div', 'ym-set');
            var left = el('div', 'ym-set-name');
            left.appendChild(art('badge-' + tier, 22));
            left.appendChild(document.createTextNode(seen[id] || 'Unknown account'));
            row.appendChild(left);
            var right = el('div', 'ym-set-ctl');
            right.appendChild(el('span', 'ym-set-desc', TIER_LABEL[tier] || tier));
            if (id !== OWNER_ID && can.indexOf(tier) !== -1) {
              var rm = button('Remove', 'warn', 'ui-user-remove');
              rm.addEventListener('click', function () {
                Promise.resolve(bridge.grant(id, null)).then(function (res) {
                  if (res && res.ok) return refresh();
                  slot.textContent = '';
                  slot.appendChild(status(false, (res && res.reason) || 'Could not remove that role.'));
                  return null;
                }).catch(logErr);
              });
              right.appendChild(rm);
            }
            row.appendChild(right);
            box2.appendChild(row);
          });
      }
      return box2;
    }

    // ----- Plugins -----
    function optionsOf(p) {
      var box3 = el('div', 'ym-opts');
      p.settings.forEach(function (s) {
        var v = valueOf(p, s);
        var line = el('label', 'ym-opt');
        line.appendChild(el('span', null, s.label));
        if (s.type === 'range') {
          var wrap = el('span', 'ym-slide');
          var out = el('output', 'ym-val', String(v));
          var slider = el('input');
          slider.type = 'range';
          slider.min = String(s.min);
          slider.max = String(s.max);
          slider.step = String(s.step);
          slider.value = String(v);
          slider.setAttribute('aria-label', s.label);
          slider.addEventListener('input', function () { out.textContent = slider.value; });
          slider.addEventListener('change', function () { setValue(p, s, Number(slider.value)); });
          wrap.appendChild(slider);
          wrap.appendChild(out);
          line.appendChild(wrap);
        } else if (s.type === 'color') {
          var picker = el('input');
          picker.type = 'color';
          picker.value = String(v);
          picker.setAttribute('aria-label', s.label);
          picker.addEventListener('change', function () { setValue(p, s, picker.value); });
          line.appendChild(picker);
        }
        box3.appendChild(line);
      });
      return box3;
    }
    function rowFor(p) {
      var r = el('div', 'ym-row');
      r.setAttribute('data-id', p.id);
      var text = el('div', 'ym-text');
      text.appendChild(el('div', 'ym-name', p.name));
      text.appendChild(el('div', 'ym-desc', p.desc));
      var on = isOn(p);
      if (on && p.settings && p.settings.length) text.appendChild(optionsOf(p));
      var sw = el('input', 'ym-switch');
      sw.type = 'checkbox';
      sw.checked = on;
      sw.setAttribute('role', 'switch');
      sw.setAttribute('aria-label', p.name);
      sw.addEventListener('change', function () {
        setOn(p, sw.checked);
        var next = rowFor(p);
        r.replaceWith(next);
        next.querySelector('.ym-switch').focus();
        counts();
      });
      r.appendChild(text);
      r.appendChild(sw);
      return r;
    }
    function renderPlugins() {
      fresh('Plugins', null);
      var body = el('div', 'ym-body');
      var cats = el('nav', 'ym-cats');
      cats.setAttribute('aria-label', 'Categories');
      var main = el('div');
      var tools = el('div', 'ym-tools');
      var sBox = el('label', 'ym-search');
      sBox.appendChild(art('ui-search', 15));
      var search = el('input');
      search.type = 'search';
      search.placeholder = 'Search plugins';
      search.value = query;
      search.setAttribute('aria-label', 'Search plugins');
      sBox.appendChild(search);
      var count = el('span', 'ym-count');
      tools.appendChild(sBox);
      tools.appendChild(count);
      var list = el('div', 'ym-list');
      main.appendChild(tools);
      main.appendChild(list);
      body.appendChild(cats);
      body.appendChild(main);
      view.appendChild(body);

      function drawCats() {
        cats.textContent = '';
        ['All'].concat(Y.categories).forEach(function (c) {
          var all = c === 'All' ? Y.list() : inCategory(c);
          var on = all.filter(isOn).length;
          var b = el('button', 'ym-cat');
          b.type = 'button';
          b.setAttribute('aria-current', String(c === cat));
          b.appendChild(el('span', null, c === 'All' ? 'All plugins' : c));
          b.appendChild(el('span', 'ym-n', on + '/' + all.length));
          b.addEventListener('click', function () { cat = c; drawCats(); jump(c); });
          cats.appendChild(b);
        });
      }
      function drawList() {
        list.textContent = '';
        var shown = Y.categories.filter(function (c) { return inCategory(c).filter(matches).length > 0; });
        if (!shown.length) { list.appendChild(el('p', 'ym-empty', 'No plugins match.')); return; }
        shown.forEach(function (c, i) {
          var sec = el('section');
          sec.setAttribute('data-cat', c);
          if (c === 'Badges') sec.appendChild(el('p', 'ym-note', Object.keys(state.badges.users || {}).length + ' people listed. Roles are on the Settings page.'));
          inCategory(c).filter(matches).forEach(function (p) { sec.appendChild(rowFor(p)); });
          if (i < shown.length - 1) sec.appendChild(el('div', 'ym-next', 'Next: ' + shown[i + 1]));
          list.appendChild(sec);
        });
      }
      function jump(c) {
        var target = c === 'All' ? list : list.querySelector('section[data-cat="' + c + '"]');
        if (target && target.scrollIntoView) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      function counts() {
        var all = Y.list();
        count.textContent = all.filter(isOn).length + ' of ' + all.length + ' on';
        drawCats();
      }
      search.addEventListener('input', function () {
        query = search.value.trim();
        drawList();
        counts();
      });
      counts();
      drawList();
    }

    // ----- Themes -----
    function renderThemes() {
      fresh('Themes', 'Pick one. Choosing a theme turns the others off.');
      var grid = el('div', 'ym-themes');
      var chosen = activeTheme();
      function pick(id) {
        THEMES.forEach(function (t) {
          var p = byId(t.id);
          if (p) setOn(p, t.id === id);
        });
        if (id === 'default') {
          chosen = 'default';
        } else {
          chosen = id;
        }
        renderThemes();
      }
      var all = [{ id: 'default', name: 'Yapin default', sw: ['#222329', '#1b1c21', '#2b2c33', '#ececf1'] }].concat(THEMES);
      all.forEach(function (t) {
        var b = el('button', 'ym-theme');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(t.id === chosen));
        var top = el('span', 'ym-theme-top');
        top.appendChild(el('span', null, t.name));
        top.appendChild(art('ui-check', 14));
        b.appendChild(top);
        var sw = el('span', 'ym-sw');
        t.sw.forEach(function (c) { var s = el('i'); s.style.background = c; sw.appendChild(s); });
        b.appendChild(sw);
        b.addEventListener('click', function () { pick(t.id); });
        grid.appendChild(b);
      });
      view.appendChild(grid);

      view.appendChild(el('div', 'ym-label', 'Adjust'));
      var card = el('div', 'ym-card');
      var acc = byId('accent-colour');
      if (acc) {
        var accSettings = acc.settings[0];
        var pickerWrap = el('span', 'ym-set-ctl');
        var picker = el('input');
        picker.type = 'color';
        picker.value = String(valueOf(acc, accSettings));
        picker.setAttribute('aria-label', 'Accent colour');
        picker.addEventListener('change', function () { setValue(acc, accSettings, picker.value); });
        pickerWrap.appendChild(picker);
        card.appendChild(setRow('Accent colour', 'Buttons, links and selections.', pickerWrap, null));
      }
      var rad = byId('corner-radius');
      if (rad) {
        var rs = rad.settings[0];
        var rWrap = el('span', 'ym-set-ctl');
        var rOut = el('output', 'ym-val', valueOf(rad, rs) + 'px');
        var rIn = el('input', 'ym-slider');
        rIn.type = 'range';
        rIn.min = String(rs.min);
        rIn.max = String(rs.max);
        rIn.step = String(rs.step);
        rIn.value = String(valueOf(rad, rs));
        rIn.setAttribute('aria-label', 'Corner radius');
        rIn.addEventListener('input', function () { rOut.textContent = rIn.value + 'px'; });
        rIn.addEventListener('change', function () { setValue(rad, rs, Number(rIn.value)); });
        rWrap.appendChild(rIn);
        rWrap.appendChild(rOut);
        card.appendChild(setRow('Corner radius', 'How round panels and inputs are.', rWrap, null));
      }
      var sc = byId('ui-scale');
      if (sc) {
        var ss = sc.settings[0];
        var sWrap = el('span', 'ym-set-ctl');
        var sOut = el('output', 'ym-val', valueOf(sc, ss) + '%');
        var sIn = el('input', 'ym-slider');
        sIn.type = 'range';
        sIn.min = String(ss.min);
        sIn.max = String(ss.max);
        sIn.step = String(ss.step);
        sIn.value = String(valueOf(sc, ss));
        sIn.setAttribute('aria-label', 'Interface scale');
        sIn.addEventListener('input', function () { sOut.textContent = sIn.value + '%'; });
        sIn.addEventListener('change', function () { setValue(sc, ss, Number(sIn.value)); });
        sWrap.appendChild(sIn);
        sWrap.appendChild(sOut);
        card.appendChild(setRow('Interface scale', 'Makes the whole interface smaller or bigger.', sWrap, null));
      }
      view.appendChild(card);
      view.appendChild(shareCard());
    }

    // Publishes the colours of the current look on the website. The form opens in the browser with the colours
    // already filled in; the name, licence and anything else are added there.
    function shareCard() {
      var box4 = el('div', 'ym-card');
      box4.appendChild(el('p', 'ym-note', 'Made a look you like? Publish its colours for everyone to use. You add the name and licence on the website.'));
      var publish = button('Publish my look', 'primary', 'ui-plus');
      publish.addEventListener('click', function () {
        var active = activeTheme();
        var chosen = THEMES.filter(function (t) { return t.id === active; })[0];
        var base = chosen ? chosen.sw : ['#222329', '#1b1c21', '#2b2c33', '#ececf1'];
        var acc = byId('accent-colour');
        var accent = acc ? valueOf(acc, acc.settings[0]) : '#ff6b4a';
        var theme = { name: 'My Yapnap look', description: 'Made in Yapnap.', kind: 'colour',
          colors: { bg: base[0], side: base[1], elev: base[2], text: base[3], accent: accent } };
        var bytes = new TextEncoder().encode(JSON.stringify(theme));
        var binary = '';
        bytes.forEach(function (b) { binary += String.fromCharCode(b); });
        var b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        window.open(PUBLISH_URL + '#data=' + b64, '_blank', 'noopener');
      });
      box4.appendChild(publish);
      return box4;
    }

    // ----- routing and refresh -----
    function show(name) {
      if (PAGES.indexOf(name) === -1) name = 'about';
      page = name;
      if (page === 'about') renderAbout();
      else if (page === 'settings') renderSettings();
      else if (page === 'plugins') renderPlugins();
      else renderThemes();
      return page;
    }
    function refresh(rerender) {
      return Promise.resolve(bridge.state()).then(function (s) {
        if (s) state = Object.assign(state, s);
        if (rerender !== false) show(page);
      });
    }

    show(page);
    refresh(true).catch(logErr);

    return {
      show: show,
      pages: PAGES.slice(),
      titles: PAGE_TITLE,
      destroy: function () { root2.remove(); }
    };
  }

  root.YAPNAP_PANEL = { mount: mount, pages: ['about', 'settings', 'plugins', 'themes'], titles: { about: 'About', settings: 'Settings', plugins: 'Plugins', themes: 'Themes' } };
})();

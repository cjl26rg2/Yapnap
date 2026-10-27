// The Yapnap settings panel: About, Settings, Plugins and Themes. It is used in two places: inside Yapin's own
// settings (settings-nav.js) and in the fallback window (settings/index.html). It needs window.YAPNAP (the registry),
// window.YAPNAP_ART (the images) and a bridge with state(), setPlugin(), setSetting(), setApp(), grant(), reset(),
// openDataFolder(), exportSettings(), importSettings() and version.
//
// Surfaces and text come from the host page's variables where it has them, so the panel sits in Yapin's settings
// without a seam. Yapnap's own accent is used for what Yapnap controls: switches, primary actions and focus.
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  if (root.YAPNAP_PANEL) return;

  var STYLE_ID = 'ym-panel-style';
  var CSS = `
.ym-panel{--ym-accent:#ef9448;--ym-accent-hover:#f5a867;--ym-accent-soft:rgba(239,148,72,.14);--ym-ink:#140d06;--ym-ease:cubic-bezier(.22,.8,.24,1);--ym-fast:150ms;--ym-base:220ms;
  font:14px/1.55 Inter,"Segoe UI Variable","Segoe UI",system-ui,sans-serif;color:var(--text,#ececf1);max-width:860px;margin:0 auto;padding:4px 4px 48px}
.ym-panel *{box-sizing:border-box}
.ym-panel button,.ym-panel input,.ym-panel select,.ym-panel textarea{font:inherit;color:inherit}
.ym-panel :focus-visible{outline:2px solid var(--ym-accent);outline-offset:2px;border-radius:6px}
.ym-enter{animation:ym-enter var(--ym-base) var(--ym-ease) both}
@keyframes ym-enter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* Page header: one title, one line of context, and the page's actions on the right */
.ym-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--border,#ffffff12)}
.ym-head h2{margin:0;font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-.02em}
.ym-head p{margin:6px 0 0;font-size:13.5px;color:var(--text-muted,#9c9daa)}
.ym-head-actions{display:flex;gap:8px;flex:none;flex-wrap:wrap;justify-content:flex-end}

/* Sections: flat, with a hairline above. Rows inside them are separated by hairlines, not boxed. */
.ym-section{padding:26px 0 6px}
.ym-section + .ym-section{border-top:1px solid var(--border,#ffffff12)}
.ym-section-title{margin:0 0 4px;font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--text-muted,#9c9daa)}
.ym-section-note{margin:0 0 12px;font-size:13px;color:var(--text-muted,#9c9daa);max-width:620px}
.ym-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 0;border-bottom:1px solid var(--border,#ffffff12)}
.ym-row:last-child{border-bottom:0}
.ym-row-text{min-width:0;flex:1}
.ym-row-name{font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ym-row-name img{width:16px;height:16px;flex:none;opacity:.9}
.ym-row-desc{margin-top:3px;font-size:13px;color:var(--text-muted,#9c9daa);max-width:600px}
.ym-row-ctl{display:flex;align-items:center;gap:12px;flex:none;flex-wrap:wrap;justify-content:flex-end}
.ym-value{min-width:50px;text-align:center;font-size:12px;font-weight:700;padding:3px 8px;border-radius:7px;background:var(--bg-hover,#2f3038);font-variant-numeric:tabular-nums}
.ym-chip{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:600;color:var(--text-muted,#9c9daa);background:var(--bg-hover,#2f3038);white-space:nowrap}
.ym-chip.accent{color:var(--ym-accent);background:var(--ym-accent-soft)}

/* Buttons: one primary per page. Pressing shrinks slightly; busy and disabled states are explicit. */
.ym-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:34px;padding:0 14px;border-radius:8px;border:1px solid var(--border,#ffffff12);background:var(--bg-elev,#2b2c33);color:var(--text,#ececf1);font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer;transition:background var(--ym-fast) var(--ym-ease),border-color var(--ym-fast) var(--ym-ease),color var(--ym-fast) var(--ym-ease),transform var(--ym-fast) var(--ym-ease)}
.ym-btn img{width:15px;height:15px;flex:none;opacity:.9}
.ym-btn:hover{background:var(--bg-hover,#2f3038);border-color:rgba(255,255,255,.16)}
.ym-btn:active:not(:disabled){transform:scale(.98)}
.ym-btn.primary{background:var(--ym-accent);border-color:var(--ym-accent);color:var(--ym-ink)}
.ym-btn.primary img{opacity:.85}
.ym-btn.primary:hover{background:var(--ym-accent-hover);border-color:var(--ym-accent-hover)}
.ym-btn.danger{color:var(--danger,#f2555a)}
.ym-btn.danger:hover{background:rgba(242,85,90,.1);border-color:rgba(242,85,90,.4)}
.ym-btn.solid.danger{background:var(--danger,#f2555a);border-color:var(--danger,#f2555a);color:#fff}
.ym-btn.solid.danger:hover{filter:brightness(1.08);background:var(--danger,#f2555a)}
.ym-btn.ghost{background:transparent;border-color:transparent}
.ym-btn.ghost:hover{background:var(--bg-hover,#2f3038)}
.ym-btn:disabled{opacity:.5;cursor:default}
.ym-btn[aria-busy="true"]{cursor:progress}
.ym-spin{display:inline-block;width:13px;height:13px;flex:none;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:ym-spin .8s linear infinite}
@keyframes ym-spin{to{transform:rotate(360deg)}}

/* Inputs */
.ym-input{height:34px;min-width:0;padding:0 11px;border-radius:8px;border:1px solid var(--border,#ffffff12);background:var(--bg-input,#2d2e36);color:var(--text,#ececf1);font-size:13px;transition:border-color var(--ym-fast) var(--ym-ease),box-shadow var(--ym-fast) var(--ym-ease)}
.ym-input:hover{border-color:rgba(255,255,255,.18)}
.ym-input:focus{outline:none;border-color:var(--ym-accent);box-shadow:0 0 0 3px var(--ym-accent-soft)}
.ym-input::placeholder{color:var(--text-faint,#9294a1)}
select.ym-input{padding-right:28px}
textarea.ym-input{height:auto;padding:10px 12px;font-family:ui-monospace,Consolas,Menlo,monospace;font-size:12.5px;line-height:1.55;resize:vertical;width:100%}
.ym-search{display:flex;align-items:center;gap:9px;flex:1;min-width:0;height:36px;padding:0 12px;border-radius:8px;background:var(--bg-input,#2d2e36);border:1px solid var(--border,#ffffff12);transition:border-color var(--ym-fast) var(--ym-ease),box-shadow var(--ym-fast) var(--ym-ease)}
.ym-search:focus-within{border-color:var(--ym-accent);box-shadow:0 0 0 3px var(--ym-accent-soft)}
.ym-search img{width:15px;height:15px;opacity:.7;flex:none}
.ym-search input{flex:1;min-width:0;border:0;outline:0;background:none;font-size:13.5px}
.ym-search input::placeholder{color:var(--text-faint,#9294a1)}
.ym-switch{appearance:none;-webkit-appearance:none;position:relative;flex:none;width:38px;height:22px;margin:0;border-radius:11px;background:var(--bg-active,#383944);cursor:pointer;transition:background var(--ym-fast) var(--ym-ease)}
.ym-switch::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform var(--ym-fast) var(--ym-ease)}
.ym-switch:checked{background:var(--ym-accent)}
.ym-switch:checked::after{transform:translateX(16px)}
.ym-switch:disabled{opacity:.5;cursor:default}
.ym-switch:hover:not(:disabled){filter:brightness(1.08)}
.ym-slider{width:184px;accent-color:var(--ym-accent)}
.ym-panel input[type="color"]{width:46px;height:28px;padding:3px;border:1px solid var(--border,#ffffff12);border-radius:7px;background:var(--bg-input,#2d2e36);cursor:pointer}
.ym-panel input[type="color"]:hover{border-color:rgba(255,255,255,.2)}
.ym-panel input[type="color"]:focus-visible{outline:2px solid var(--ym-accent);outline-offset:2px}
.ym-state{font-size:12.5px;font-weight:600;min-width:28px;text-align:right;color:var(--text-faint,#9294a1);transition:color var(--ym-fast) var(--ym-ease)}
.ym-state.on{color:var(--ym-accent)}
.ym-state.bad{color:var(--danger,#f2555a)}

/* Messages */
.ym-status{display:flex;align-items:center;gap:8px;margin:10px 0 0;min-height:18px;font-size:13px;color:var(--text-muted,#9c9daa)}
.ym-status img{width:14px;height:14px;flex:none}
.ym-status.good{color:var(--success,#3fcf82)}
.ym-status.bad{color:var(--danger,#f2555a)}
.ym-notice{display:flex;align-items:flex-start;gap:10px;margin:0 0 18px;padding:12px 14px;border-radius:9px;background:var(--bg-elev,#2b2c33);border:1px solid var(--border,#ffffff12);border-left:2px solid var(--ym-accent);font-size:13px}
.ym-notice img{width:15px;height:15px;margin-top:2px;flex:none}
.ym-empty{padding:40px 0;text-align:center;color:var(--text-muted,#9c9daa)}

/* Facts: a two-column key and value list, used for the build and the environment */
.ym-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 40px}
.ym-facts{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 24px;margin:0;font-size:13.5px}
.ym-facts dt{color:var(--text-muted,#9c9daa)}
.ym-facts dd{margin:0;font-weight:600;word-break:break-word}
.ym-plain{margin:0;padding:0;list-style:none;display:grid;gap:10px;font-size:13.5px}
.ym-plain li{position:relative;padding-left:16px}
.ym-plain li::before{content:"";position:absolute;left:0;top:.62em;width:5px;height:5px;border-radius:50%;background:var(--ym-accent)}

/* About header */
.ym-identity{display:flex;align-items:center;gap:16px;padding:22px 0 4px}
.ym-identity img{width:46px;height:46px;flex:none}
.ym-identity-name{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:700;letter-spacing:-.01em}
.ym-identity-note{margin:4px 0 0;font-size:13px;color:var(--text-muted,#9c9daa)}

/* Plugins: a category rail beside the list. The rail sticks; each group is a labelled section. */
.ym-plugins{display:grid;grid-template-columns:196px minmax(0,1fr);gap:32px;align-items:start;margin-top:22px}
.ym-rail{position:sticky;top:0;display:flex;flex-direction:column;gap:2px}
.ym-cat{display:flex;align-items:center;gap:10px;padding:7px 9px;border:0;border-radius:8px;background:none;color:var(--text-muted,#9c9daa);font-size:13.5px;font-weight:500;text-align:left;cursor:pointer;transition:background var(--ym-fast) var(--ym-ease),color var(--ym-fast) var(--ym-ease)}
.ym-cat img{width:16px;height:16px;flex:none;opacity:.75;transition:opacity var(--ym-fast) var(--ym-ease)}
.ym-cat .ym-cat-name{flex:1;min-width:0}
.ym-cat .ym-count{font-size:12px;font-weight:600;color:var(--text-faint,#9294a1);font-variant-numeric:tabular-nums}
.ym-cat:hover{background:var(--bg-hover,#2f3038);color:var(--text,#ececf1)}
.ym-cat:hover img{opacity:1}
.ym-cat[aria-current="true"]{background:var(--bg-active,#383944);color:var(--text,#ececf1)}
.ym-cat[aria-current="true"] img{opacity:1}
.ym-group{margin-bottom:30px}
.ym-group:last-child{margin-bottom:0}
.ym-group-head{display:flex;align-items:center;gap:10px;padding-bottom:8px;margin-bottom:2px;border-bottom:1px solid var(--border,#ffffff12);font-size:13.5px;font-weight:650}
.ym-group-head img{width:18px;height:18px}
.ym-group-head .ym-count{margin-left:auto;font-size:12px;font-weight:600;color:var(--text-faint,#9294a1);font-variant-numeric:tabular-nums}
.ym-search-row{display:flex;align-items:center;gap:10px}
.ym-seg{display:flex;gap:4px;flex:none}
.ym-seg button{height:30px;padding:0 11px;border:1px solid var(--border,#ffffff12);border-radius:8px;background:none;color:var(--text-muted,#9c9daa);font-size:12.5px;font-weight:600;cursor:pointer;transition:background var(--ym-fast) var(--ym-ease),color var(--ym-fast) var(--ym-ease)}
.ym-seg button:hover{background:var(--bg-hover,#2f3038);color:var(--text,#ececf1)}
.ym-seg button[aria-pressed="true"]{background:var(--bg-active,#383944);color:var(--text,#ececf1);border-color:transparent}
.ym-seg button:focus-visible{outline:2px solid var(--ym-accent);outline-offset:2px}
.ym-btn.small{height:28px;padding:0 10px;font-size:12.5px}
.ym-plugin-ctl [hidden]{display:none!important}
.ym-plugin{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 24px;align-items:center;padding:14px 0;border-bottom:1px solid var(--border,#ffffff12)}
.ym-plugin:last-child{border-bottom:0}
.ym-plugin.is-failed{}
.ym-plugin-ctl{display:flex;align-items:center;gap:12px}
.ym-fail{margin-top:4px;font-size:12.5px;color:var(--danger,#f2555a)}
.ym-collapse{display:grid;grid-template-rows:0fr;grid-column:1 / -1;transition:grid-template-rows var(--ym-base) var(--ym-ease)}
.ym-collapse.is-open{grid-template-rows:1fr}
.ym-collapse > div{min-height:0;overflow:hidden}
.ym-opts{display:grid;gap:12px;padding:10px 0 4px 14px;margin-left:2px;border-left:2px solid var(--border,#ffffff12)}
.ym-opt{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:13px;color:var(--text-muted,#9c9daa)}

/* Themes: a radio group of tiles. Each tile shows a small window in its colours, so the choice is visible. */
.ym-themes{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:12px;margin-top:6px}
.ym-theme{display:grid;gap:10px;padding:10px;border-radius:10px;border:1px solid var(--border,#ffffff12);background:var(--bg-elev,#2b2c33);color:var(--text,#ececf1);text-align:left;cursor:pointer;transition:border-color var(--ym-fast) var(--ym-ease),background var(--ym-fast) var(--ym-ease),transform var(--ym-fast) var(--ym-ease)}
.ym-theme:hover{border-color:rgba(255,255,255,.2)}
.ym-theme:active{transform:scale(.985)}
.ym-theme[aria-checked="true"]{border-color:var(--ym-accent)}
.ym-theme-top{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:600}
.ym-theme-top img{width:14px;height:14px;opacity:0;transition:opacity var(--ym-fast) var(--ym-ease)}
.ym-theme[aria-checked="true"] .ym-theme-top img{opacity:1}
.ym-mini{display:grid;grid-template-columns:26% minmax(0,1fr);height:74px;border-radius:7px;overflow:hidden;border:1px solid var(--border,#ffffff12)}
.ym-mini-main{display:grid;align-content:center;gap:7px;padding:0 11px}
.ym-mini-main i{display:block;height:6px;border-radius:3px}
.ym-mini-main .ym-mini-bubble{height:16px;border-radius:6px}

/* Dialogs and toasts */
.ym-dialog{border:1px solid var(--border,#ffffff12);border-radius:14px;background:var(--bg-elev,#2b2c33);color:var(--text,#ececf1);padding:24px;width:min(420px,calc(100vw - 48px));box-shadow:0 24px 60px rgba(0,0,0,.45)}
.ym-dialog[open]{animation:ym-dialog var(--ym-base) var(--ym-ease) both}
.ym-dialog::backdrop{background:rgba(8,9,11,.55);animation:ym-fade var(--ym-base) var(--ym-ease) both}
@keyframes ym-dialog{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:none}}
@keyframes ym-fade{from{opacity:0}to{opacity:1}}
.ym-dialog h3{margin:0 0 8px;font-size:16px;font-weight:700}
.ym-dialog p{margin:0 0 20px;font-size:13.5px;color:var(--text-muted,#9c9daa)}
.ym-dialog-actions{display:flex;justify-content:flex-end;gap:8px}
.ym-toasts{position:fixed;left:20px;bottom:20px;display:grid;gap:8px;z-index:30;pointer-events:none;max-width:calc(100vw - 40px)}
.ym-toast{display:flex;align-items:center;gap:10px;min-width:220px;max-width:380px;padding:11px 14px;border-radius:10px;background:var(--bg-elev,#2b2c33);border:1px solid var(--border,#ffffff12);box-shadow:0 12px 32px rgba(0,0,0,.35);font-size:13px;pointer-events:auto;animation:ym-enter var(--ym-base) var(--ym-ease) both}
.ym-toast img{width:15px;height:15px;flex:none}
.ym-toast.bad{border-color:rgba(242,85,90,.4)}
.ym-toast.bad img{opacity:.9}
.ym-toast.is-out{opacity:0;transform:translateY(4px);transition:opacity var(--ym-fast) var(--ym-ease),transform var(--ym-fast) var(--ym-ease)}

/* Roles: a small list of who holds what. Nobody sees account IDs here. */
.ym-roles-line{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
.ym-member{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid var(--border,#ffffff12);font-size:13.5px}
.ym-member:last-child{border-bottom:0}
.ym-member-name{display:flex;align-items:center;gap:9px;min-width:0;font-weight:600}
.ym-member-name img{width:20px;height:20px;flex:none}
.ym-member-tier{color:var(--text-muted,#9c9daa);font-size:12.5px}

.ym-ctl-wrap{flex-wrap:wrap}
.ym-custom{display:grid;gap:12px}
.ym-actions{display:flex;flex-wrap:wrap;gap:8px}

/* Motion for people who asked for less of it */
@media (prefers-reduced-motion: reduce){
  .ym-panel *,.ym-panel *::before,.ym-panel *::after,.ym-dialog,.ym-dialog::backdrop{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important}
  .ym-spin{animation:none;border-right-color:currentColor}
}

/* Narrow windows: the rail becomes a row above the list, and the page header stacks */
@media (max-width:760px){
  .ym-plugins{grid-template-columns:1fr;gap:14px}
  .ym-rail{position:static;flex-direction:row;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
  .ym-cat{white-space:nowrap}
  .ym-head{flex-direction:column;align-items:flex-start}
  .ym-head-actions{justify-content:flex-start}
  .ym-columns{grid-template-columns:1fr;gap:20px}
  .ym-themes{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
  .ym-slider{width:140px}
}
`;

  var PAGES = ['about', 'settings', 'plugins', 'themes'];
  var PAGE_TITLE = { about: 'About', settings: 'Settings', plugins: 'Plugins', themes: 'Themes' };
  var PAGE_LEAD = {
    about: 'What Yapnap is running, and what changed.',
    settings: 'Changes apply straight away.',
    plugins: 'Switch on the plugins you want. Each one changes one part of Yapin. A plugin with settings shows them when it is on.',
    themes: 'Choosing a theme turns the others off.'
  };
  // The category icons come from the art pack: cat-messages, cat-composer and so on.
  var THEMES = [
    { id: 'theme-amoled', name: 'AMOLED black', sw: ['#000000', '#000000', '#0b0b0c', '#e9eaee'] },
    { id: 'theme-graphite', name: 'Graphite', sw: ['#1b1c20', '#17181c', '#23252b', '#e4e6eb'] },
    { id: 'theme-sepia-night', name: 'Sepia night', sw: ['#1f1b16', '#1a1713', '#2a251e', '#ece3d3'] },
    { id: 'theme-frost-light', name: 'Frost light', sw: ['#f4f6f9', '#eaedf2', '#ffffff', '#161922'] },
    { id: 'theme-forest', name: 'Forest', sw: ['#161c18', '#121813', '#1f2822', '#e2ebe4'] }
  ];
  var DEFAULT_THEME = { id: 'default', name: 'Yapin default', sw: ['#222329', '#1b1c21', '#2b2c33', '#ececf1'] };
  var PUBLISH_URL = 'https://yapnap.pages.dev/publish/';
  var TIER_ORDER = ['owner', 'co-owner', 'developer', 'manager', 'admin', 'mod', 'contributor', 'advertiser', 'partner', 'sponsor', 'supporter', 'translator', 'artist', 'designer', 'tester', 'helper', 'veteran', 'friend'];
  var TIER_LABEL = { owner: 'Owner', 'co-owner': 'Co-owner', admin: 'Admin', manager: 'Manager', mod: 'Mod', contributor: 'Contributor', advertiser: 'Advertiser', partner: 'Partner', sponsor: 'Sponsor', supporter: 'Supporter', translator: 'Translator', artist: 'Artist', designer: 'Designer', developer: 'Developer', tester: 'Tester', helper: 'Helper', veteran: 'Veteran', friend: 'Friend' };
  var OWNER_ID = '879e9081-5614-436d-971a-09481669a35f';
  var BAD_CSS = /url\s*\(|image-set\s*\(|\bimage\s*\(|\bsrc\s*\(|@import|expression\s*\(|javascript:|behavior|-moz-binding|\\/i;
  var CHANGES = [
    'Yapper’s own names stay as they are, including Yapin’ Plus.',
    '31 more plugins, 231 in all.',
    'Settings live inside Yapin’s own settings now.',
    'Roles are shared: owner, co-owner, admins, mods and contributors.',
    'Custom CSS, and a settings file.',
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
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function art(name, size) {
    var img = document.createElement('img');
    img.alt = '';
    img.width = size;
    img.height = size;
    img.decoding = 'async';
    img.src = root.YAPNAP_ART ? root.YAPNAP_ART.src(name) : '';
    return img;
  }

  function logErr(err) { console.error('Yapnap panel:', err); }

  // A bridge call that may fail. The panel treats any failure as "no" and says so, instead of throwing.
  function call(promise) {
    return Promise.resolve(promise).catch(function (err) { logErr(err); return false; });
  }

  function mount(host, bridge) {
    injectStyle();
    var Y = root.YAPNAP;
    var state = { plugins: {}, badges: { tiers: {}, users: {} }, app: {}, info: {} };
    var page = 'about';
    var query = '';
    var status = 'all'; // the plugin filter: all, on, off or changed
    var cat = 'All';
    function isBrowser() { return !!(state.info && state.info.browser); }

    var root2 = el('div', 'ym-panel');
    var view = el('div', 'ym-page');
    root2.appendChild(view);
    host.appendChild(root2);
    var toastBox = null;
    var toasts = {};

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
    function inCategory(c) { return Y.list().filter(function (p) { return p.category === c; }); }
    // Changed means not at its default: switched the other way, or with its own settings saved.
    function changed(p) {
      return isOn(p) !== !!p.def || Object.keys(savedOf(p).s || {}).length > 0;
    }
    function matches(p) {
      if (status === 'on' && !isOn(p)) return false;
      if (status === 'off' && isOn(p)) return false;
      if (status === 'changed' && !changed(p)) return false;
      if (!query) return true;
      return (p.name + ' ' + p.desc + ' ' + p.category).toLowerCase().indexOf(query.toLowerCase()) !== -1;
    }
    function activeTheme() {
      var on = THEMES.filter(function (t) { var p = byId(t.id); return p && isOn(p); });
      return on.length ? on[0].id : 'default';
    }
    // The theme installed from a file, if there is one. Its colours are the ones in the file.
    function installedTheme() {
      var t = state.app.theme;
      if (!t || !t.colors) return null;
      var c = t.colors;
      return { id: 'installed', name: t.name, sw: [c.bg, c.side, c.elev, c.text] };
    }

    // Each change is applied in the page, and saved. If the save fails, the change is taken back and the person is told.
    function setOn(p, on) {
      var before = savedOf(p);
      state.plugins[p.id] = Object.assign({}, before, { on: on });
      return call(bridge.setPlugin(p.id, on)).then(function (ok) {
        if (ok === false) {
          state.plugins[p.id] = before;
          toast('plugin-save', 'Could not save that change.', 'bad');
          return false;
        }
        return true;
      });
    }
    function setValue(p, s, v) {
      var cur = savedOf(p);
      var vals = Object.assign({}, cur.s);
      vals[s.key] = v;
      state.plugins[p.id] = Object.assign({}, cur, { s: vals });
      return call(bridge.setSetting(p.id, s.key, v)).then(function (ok) {
        if (ok === false) {
          state.plugins[p.id] = cur;
          toast('setting-save', 'Could not save that setting.', 'bad');
          return false;
        }
        // Changing a setting of a plugin that is off turns it on, so the change is visible straight away.
        if (!isOn(p)) return setOn(p, true);
        return true;
      });
    }
    function setApp(key, value) {
      return call(bridge.setApp(key, value)).then(function (ok) {
        if (ok === false) toast('app-save', 'Could not save that setting.', 'bad');
        return ok !== false;
      });
    }
    // Several plugins switched in one save, so the page is updated once. Resolves to how many changed, or -1 on failure.
    function setMany(list, on) {
      var todo = list.filter(function (p) { return isOn(p) !== on; });
      if (!todo.length) return Promise.resolve(0);
      if (typeof bridge.setPlugins !== 'function') {
        return Promise.all(todo.map(function (p) { return setOn(p, on); })).then(function (results) {
          return results.indexOf(false) === -1 ? todo.length : -1;
        });
      }
      var before = {};
      var changes = {};
      todo.forEach(function (p) {
        before[p.id] = savedOf(p);
        changes[p.id] = on;
        state.plugins[p.id] = Object.assign({}, savedOf(p), { on: on });
      });
      return call(bridge.setPlugins(changes)).then(function (ok) {
        if (ok === false) {
          Object.keys(before).forEach(function (id) { state.plugins[id] = before[id]; });
          toast('plugin-save', 'Could not save those changes.', 'bad');
          return -1;
        }
        return todo.length;
      });
    }
    // Back to the default: the plugin's own switch and settings are removed.
    function resetOne(p) {
      call(bridge.resetPlugin(p.id)).then(function (ok) {
        if (ok === false) return toast('plugin-reset', 'Could not reset ' + p.name + '.', 'bad');
        delete state.plugins[p.id];
        toast('plugin-reset', p.name + ' is back to its default.', 'ok');
        return refresh();
      });
    }

    // ----- shared pieces -----
    function button(label, variant, icon) {
      var b = el('button', 'ym-btn' + (variant ? ' ' + variant : ''));
      b.type = 'button';
      if (icon) b.appendChild(art(icon, 15));
      b.appendChild(document.createTextNode(label));
      return b;
    }
    // While an action is waiting on the app, the button shows a spinner and cannot be pressed twice.
    function setBusy(btn, on) {
      if (on) {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        if (!btn.querySelector('.ym-spin')) {
          var spin = el('span', 'ym-spin');
          spin.setAttribute('aria-hidden', 'true');
          btn.insertBefore(spin, btn.firstChild);
        }
      } else {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        var old = btn.querySelector('.ym-spin');
        if (old) old.remove();
      }
    }
    function status(ok, text) {
      var s = el('p', 'ym-status' + (ok ? ' good' : ' bad'));
      s.setAttribute('role', 'status');
      s.appendChild(art(ok ? 'ui-saved' : 'ui-warning', 14));
      s.appendChild(document.createTextNode(text));
      return s;
    }
    function chip(text, tone) {
      return el('span', 'ym-chip' + (tone ? ' ' + tone : ''), text);
    }
    function sectionTitle(title, note) {
      var wrap = el('section', 'ym-section');
      wrap.appendChild(el('h3', 'ym-section-title', title));
      if (note) wrap.appendChild(el('p', 'ym-section-note', note));
      return wrap;
    }
    function row(name, desc, control, icon) {
      var r = el('div', 'ym-row');
      var text = el('div', 'ym-row-text');
      var nameLine = el('div', 'ym-row-name');
      if (icon) nameLine.appendChild(art(icon, 16));
      nameLine.appendChild(document.createTextNode(name));
      text.appendChild(nameLine);
      if (desc) text.appendChild(el('div', 'ym-row-desc', desc));
      var ctl = el('div', 'ym-row-ctl');
      ctl.appendChild(control);
      r.appendChild(text);
      r.appendChild(ctl);
      return r;
    }
    function switchEl(label, checked, onChange) {
      var sw = el('input', 'ym-switch');
      sw.type = 'checkbox';
      sw.checked = checked;
      sw.setAttribute('role', 'switch');
      sw.setAttribute('aria-label', label);
      sw.addEventListener('change', function () { onChange(sw); });
      return sw;
    }
    function pageHead(title, actions) {
      var head = el('header', 'ym-head');
      var words = el('div');
      words.appendChild(el('h2', null, title));
      words.appendChild(el('p', null, PAGE_LEAD[page] || ''));
      head.appendChild(words);
      var acts = el('div', 'ym-head-actions');
      (actions || []).forEach(function (a) { acts.appendChild(a); });
      if (acts.childNodes.length) head.appendChild(acts);
      return head;
    }
    function startPage() {
      view.classList.remove('ym-enter');
      void view.offsetWidth; // restart the entrance once per page change
      view.classList.add('ym-enter');
    }

    // Toasts for outcomes that are not visible where they happened. The same message never stacks: it updates.
    function toast(key, text, tone) {
      if (!toastBox) {
        toastBox = el('div', 'ym-toasts');
        toastBox.setAttribute('role', 'status');
        toastBox.setAttribute('aria-live', 'polite');
        root2.appendChild(toastBox);
      }
      var item = toasts[key];
      if (!item) {
        item = el('div', 'ym-toast');
        item.appendChild(art(tone === 'bad' ? 'ui-warning' : 'ui-saved', 15));
        item.appendChild(el('span', null, text));
        item.key = key;
        toastBox.appendChild(item);
        toasts[key] = item;
      } else {
        item.lastChild.textContent = text;
      }
      item.className = 'ym-toast' + (tone === 'bad' ? ' bad' : '');
      clearTimeout(item.timer);
      item.timer = setTimeout(function () { dismiss(key); }, tone === 'bad' ? 4800 : 2600);
      while (toastBox.children.length > 3) dismiss(toastBox.firstElementChild.key);
    }
    function dismiss(key) {
      var item = toasts[key];
      if (!item) return;
      delete toasts[key];
      item.classList.add('is-out');
      setTimeout(function () { item.remove(); }, 200);
    }

    // A dialog for anything that cannot be undone. Cancel has the focus, so Enter does not destroy anything.
    function confirmDialog(opts) {
      return new Promise(function (resolve) {
        var dlg = el('dialog', 'ym-dialog');
        dlg.setAttribute('aria-label', opts.title);
        dlg.appendChild(el('h3', null, opts.title));
        dlg.appendChild(el('p', null, opts.body));
        var actions = el('div', 'ym-dialog-actions');
        var cancel = button('Cancel', 'ghost');
        var ok = button(opts.confirm, opts.danger ? 'danger solid' : 'primary');
        cancel.addEventListener('click', function () { dlg.close('no'); });
        ok.addEventListener('click', function () { dlg.close('yes'); });
        actions.appendChild(cancel);
        actions.appendChild(ok);
        dlg.appendChild(actions);
        dlg.addEventListener('close', function () {
          var yes = dlg.returnValue === 'yes';
          dlg.remove();
          resolve(yes);
        });
        root2.appendChild(dlg);
        dlg.showModal();
        cancel.focus();
      });
    }

    // ----- About -----
    function renderAbout() {
      var info = state.info || {};
      var ver = state.version || (bridge && bridge.version) || '';
      var actions = [];
      var copy = button('Copy debug info', 'primary', 'ui-check');
      copy.addEventListener('click', function () {
        var done = function () { toast('debug', 'Debug info copied. Paste it into a bug report.', 'ok'); };
        var failed = function () { toast('debug', 'Could not copy. Select the text in the debug box instead.', 'bad'); };
        if (!navigator.clipboard) return failed();
        navigator.clipboard.writeText(debugText()).then(done, failed);
      });
      actions.push(copy);
      if (!isBrowser()) {
        var folder = button('Open data folder', '', 'ui-folder');
        folder.addEventListener('click', function () { call(bridge.openDataFolder()); });
        actions.push(folder);
      }
      view.appendChild(pageHead('About', actions));

      var id = el('div', 'ym-identity');
      id.appendChild(art('yapnap-logo', 46));
      var words = el('div');
      var name = el('div', 'ym-identity-name');
      name.appendChild(document.createTextNode('Yapnap'));
      name.appendChild(chip('v' + ver, 'accent'));
      words.appendChild(name);
      words.appendChild(el('p', 'ym-identity-note', "An unofficial app for Yapin'. Made by fans, not by Yapin' or the Yapper team."));
      id.appendChild(words);
      view.appendChild(id);

      var sec = el('section', 'ym-section');
      var cols = el('div', 'ym-columns');
      var build = el('div');
      build.appendChild(el('h3', 'ym-section-title', 'Build'));
      build.appendChild(facts([
        ['Built', info.built ? new Date(info.built).toLocaleString() : 'Unknown'],
        ['Version', ver],
        ['Plugin API', '1'],
        ['Plugins', Y.list().filter(isOn).length + ' on of ' + Y.list().length]
      ]));
      var env = el('div');
      env.appendChild(el('h3', 'ym-section-title', 'Environment'));
      env.appendChild(facts(isBrowser() ? [
        ['Running in', 'Browser extension'],
        ['System', info.platform || 'Unknown']
      ] : [
        ['Running in', info.packaged ? 'Desktop app' : 'Development'],
        ['Electron', info.electron || 'n/a'],
        ['Chromium', info.chrome || 'n/a'],
        ['Node', info.node || 'n/a'],
        ['System', ((info.platform || '') + ' ' + (info.os || '')).trim() || 'Unknown']
      ]));
      cols.appendChild(build);
      cols.appendChild(env);
      sec.appendChild(cols);
      view.appendChild(sec);

      var news = sectionTitle('Recent changes');
      var list = el('ul', 'ym-plain');
      CHANGES.forEach(function (c) { list.appendChild(el('li', null, c)); });
      news.appendChild(list);
      view.appendChild(news);
      startPage();
    }
    function facts(pairs) {
      var dl = el('dl', 'ym-facts');
      pairs.forEach(function (p) {
        dl.appendChild(el('dt', null, p[0]));
        dl.appendChild(el('dd', null, p[1]));
      });
      return dl;
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
    function renderSettings() {
      view.appendChild(pageHead('Settings', []));
      if (state.app.safeMode) {
        var note = el('div', 'ym-notice');
        note.appendChild(art('ui-warning', 15));
        note.appendChild(el('span', null, 'Safe mode is on. Every plugin is off until you turn it off here. Your settings are kept.'));
        view.appendChild(note);
      }

      var general = sectionTitle('General');
      if (!isBrowser()) {
        general.appendChild(row('Keep running in the tray when closed', 'Closing the window hides Yapnap. Calls and mentions keep working.', appSwitch('trayOnClose'), 'ui-tray'));
        general.appendChild(row('Desktop notifications', 'A system notification for new messages while the window is in the background.', appSwitch('notifications'), 'ui-bell'));
        general.appendChild(row('Flash the taskbar on mentions', 'The taskbar button flashes when someone mentions you.', appSwitch('flashOnMention'), 'ui-flash'));
      }
      general.appendChild(row('Safe mode', 'Turns every plugin off, without losing your settings. Use it when something looks wrong.', appSwitch('safeMode'), 'ui-warning'));
      general.appendChild(row('Chat zoom', '100% is the normal size.', zoomControl(), 'ui-zoom'));
      view.appendChild(general);

      if (!isBrowser()) {
        var file = sectionTitle('Settings file', 'Save your plugins and settings to a file, or load them from one. Your role key is never put in the file.');
        var fileOut = el('div');
        var fileRow = el('div', 'ym-actions');
        var saveFile = button('Save to a file', '', 'ui-folder');
        saveFile.addEventListener('click', function () {
          setBusy(saveFile, true);
          call(bridge.exportSettings()).then(function (res) {
            setBusy(saveFile, false);
            fileOut.textContent = '';
            if (res && res.ok) toast('file', 'Settings saved to a file.', 'ok');
            else if (res && res.reason && res.reason !== 'Cancelled.') fileOut.appendChild(status(false, res.reason));
          });
        });
        var loadFile = button('Load from a file', '', 'ui-folder');
        loadFile.addEventListener('click', function () {
          setBusy(loadFile, true);
          call(bridge.importSettings()).then(function (res) {
            setBusy(loadFile, false);
            fileOut.textContent = '';
            if (res && res.ok) { toast('file', 'Settings loaded.', 'ok'); return refresh(); }
            if (res && res.reason && res.reason !== 'Cancelled.') fileOut.appendChild(status(false, res.reason));
            return null;
          });
        });
        fileRow.appendChild(saveFile);
        fileRow.appendChild(loadFile);
        file.appendChild(fileRow);
        file.appendChild(fileOut);
        view.appendChild(file);
      }

      if (!isBrowser()) {
        var account = sectionTitle('Your account', 'You sign in to Yapnap with your Yapper account. Signing out closes Yapnap, and it asks you to sign in when it opens again.');
        var who = state.account && state.account.name ? state.account.name : 'Not signed in';
        var signOutBtn = button('Sign out', 'danger', 'ui-user-remove');
        signOutBtn.addEventListener('click', function () {
          confirmDialog({ title: 'Sign out of Yapnap?', body: 'Yapnap closes. It asks you to sign in again the next time it opens.', confirm: 'Sign out', danger: true }).then(function (yes) {
            if (!yes) return;
            call(bridge.signOut());
          });
        });
        account.appendChild(row(who, state.app.myId ? 'Your account is found automatically from your profile.' : 'Your profile loads when Yapper is open.', signOutBtn));
        view.appendChild(account);
      }

      var roles = sectionTitle('Roles', 'Roles are shared with everyone who runs Yapnap. Only the owner and admins can give them.');
      roles.appendChild(rolesBlock());
      view.appendChild(roles);

      var css = sectionTitle('Custom CSS', 'Your own CSS, added after every plugin so it wins. Colours may need !important to beat the new layout. Links to files, @import, script URLs and backslashes are not allowed.');
      css.appendChild(customCssBlock());
      view.appendChild(css);
      startPage();
    }
    function appSwitch(key) {
      return switchEl(key, state.app[key] !== false, function (sw) {
        var want = sw.checked;
        state.app[key] = want;
        setApp(key, want).then(function (ok) { if (!ok) { sw.checked = !want; state.app[key] = !want; } });
      });
    }
    function zoomControl() {
      var wrap = el('span', 'ym-row-ctl');
      var out = el('output', 'ym-value', (state.app.zoom || 100) + '%');
      var slider = el('input', 'ym-slider');
      slider.type = 'range';
      slider.min = '75';
      slider.max = '150';
      slider.step = '5';
      slider.value = String(state.app.zoom || 100);
      slider.setAttribute('aria-label', 'Chat zoom');
      slider.addEventListener('input', function () { out.textContent = slider.value + '%'; });
      slider.addEventListener('change', function () {
        var before = state.app.zoom;
        state.app.zoom = Number(slider.value);
        setApp('zoom', Number(slider.value)).then(function (ok) {
          if (!ok) { state.app.zoom = before; slider.value = String(before || 100); out.textContent = (before || 100) + '%'; }
        });
      });
      wrap.appendChild(slider);
      wrap.appendChild(out);
      return wrap;
    }

    // Your own CSS. The same rules the app checks before it saves, so the message is the same whichever way it fails.
    function customCssBlock() {
      var box = el('div', 'ym-custom');
      var area = el('textarea', 'ym-input');
      area.value = state.app.customCss || '';
      area.rows = 9;
      area.spellcheck = false;
      area.placeholder = '.messages-inner { max-width: 900px; }';
      area.setAttribute('aria-label', 'Custom CSS');
      box.appendChild(area);
      var slot = el('div');
      var actions = el('div', 'ym-actions');
      var save = button('Save CSS', 'primary', 'ui-plus');
      var clear = button('Clear', 'danger', 'ui-trash');
      save.addEventListener('click', function () {
        slot.textContent = '';
        var text = area.value;
        if (text.length > 20000) { slot.appendChild(status(false, 'That is too long. The limit is 20,000 characters.')); return; }
        if (BAD_CSS.test(text)) { slot.appendChild(status(false, 'That CSS uses something Yapnap does not allow: links to files, @import, script URLs or backslashes.')); return; }
        setBusy(save, true);
        call(bridge.setApp('customCss', text)).then(function (ok) {
          setBusy(save, false);
          if (ok === false) { slot.appendChild(status(false, 'Could not save that CSS.')); return null; }
          toast('css', 'Custom CSS saved. It applies straight away.', 'ok');
          return refresh();
        });
      });
      clear.addEventListener('click', function () {
        if (!area.value && !state.app.customCss) return;
        confirmDialog({ title: 'Clear your custom CSS?', body: 'The text in the box is removed. Plugins are not changed.', confirm: 'Clear CSS', danger: true }).then(function (yes) {
          if (!yes) return;
          area.value = '';
          call(bridge.setApp('customCss', '')).then(function (ok) {
            if (ok === false) return toast('css', 'Could not clear the CSS.', 'bad');
            toast('css', 'Custom CSS cleared.', 'ok');
            return refresh();
          });
        });
      });
      actions.appendChild(save);
      actions.appendChild(clear);
      box.appendChild(actions);
      box.appendChild(slot);
      return box;
    }

    // The role the website gives this app's role key: 'owner', 'admin', or null.
    function myRole() { return state.roleLevel || null; }
    // What this role key may give, as the website says. The website makes the rules, so the list always agrees with it.
    function grantable() { return state.grantable || []; }

    function rolesBlock() {
      var box = el('div', 'ym-roles');
      var actor = myRole();
      var can = grantable();
      var seen = root.__yapnapSeen || {};
      var users = state.badges.users || {};

      var keyText = !state.app.hasRoleKey ? 'No role key saved yet.'
        : actor ? 'Your role key is accepted.'
        : 'This role key was not accepted. Check it, or ask the owner for a new one.';
      var keyLine = el('p', 'ym-status' + (state.app.hasRoleKey && !actor ? ' bad' : (actor ? ' good' : '')), keyText);
      box.appendChild(keyLine);

      // The key is saved on this computer only, and the page never shows it again.
      var keyRow = el('div', 'ym-actions');
      keyRow.style.alignItems = 'center';
      var keyIn = el('input', 'ym-input');
      keyIn.type = 'password';
      keyIn.placeholder = 'Paste your role key';
      keyIn.setAttribute('aria-label', 'Role key');
      keyIn.autocomplete = 'off';
      keyIn.style.width = '260px';
      var keySave = button('Save key', 'primary', 'ui-plus');
      keySave.addEventListener('click', function () {
        if (!keyIn.value.trim()) { keyLine.textContent = 'Paste your role key first.'; keyLine.className = 'ym-status bad'; return; }
        setBusy(keySave, true);
        call(bridge.setApp('roleKey', keyIn.value.trim())).then(function (ok) {
          setBusy(keySave, false);
          keyIn.value = '';
          if (ok === false) return toast('key', 'Could not save that role key.', 'bad');
          toast('key', 'Role key saved.', 'ok');
          return refresh();
        });
      });
      keyRow.appendChild(keyIn);
      keyRow.appendChild(keySave);
      if (state.app.hasRoleKey) {
        var keyClear = button('Remove key', 'danger', 'ui-user-remove');
        keyClear.addEventListener('click', function () {
          confirmDialog({ title: 'Remove your role key?', body: 'This computer stops giving and removing roles until you paste a key again.', confirm: 'Remove key', danger: true }).then(function (yes) {
            if (!yes) return;
            call(bridge.setApp('roleKey', '')).then(function () { toast('key', 'Role key removed.', 'ok'); return refresh(); });
          });
        });
        keyRow.appendChild(keyClear);
      }
      box.appendChild(keyRow);

      // How many people hold each role.
      var tally = {};
      Object.keys(users).forEach(function (id) { tally[users[id].tier] = (tally[users[id].tier] || 0) + 1; });
      if (Object.keys(users).length) box.appendChild(el('p', 'ym-row-desc', 'Given so far'));
      var counts = el('div', 'ym-roles-line');
      TIER_ORDER.forEach(function (t) {
        if (tally[t]) counts.appendChild(chip((TIER_LABEL[t] || t) + ' ' + tally[t]));
      });
      if (!counts.childNodes.length) counts.appendChild(el('span', 'ym-row-desc', 'No roles given yet.'));
      box.appendChild(counts);

      var slot = el('div');
      if (can.length) {
        var form = el('div', 'ym-actions');
        form.style.marginTop = '14px';
        var person = el('select', 'ym-input');
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
        var roleSel = el('select', 'ym-input');
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
          setBusy(apply, true);
          call(bridge.grant(id, tier)).then(function (res) {
            setBusy(apply, false);
            if (res && res.ok) {
              toast('grant', (tier ? TIER_LABEL[tier] + ' given to ' : 'Role removed from ') + seen[id] + '.', 'ok');
              return refresh();
            }
            slot.appendChild(status(false, (res && res.reason) || 'Could not change that role.'));
            return null;
          });
        });
        form.appendChild(person);
        form.appendChild(roleSel);
        form.appendChild(apply);
        box.appendChild(form);
        box.appendChild(slot);
      }

      // Those who can give roles see the people who hold them, by name, with a remove button where allowed.
      if (can.length) {
        var list = el('div');
        list.style.marginTop = '10px';
        Object.keys(users).sort(function (a, b) { return TIER_ORDER.indexOf(users[a].tier) - TIER_ORDER.indexOf(users[b].tier); })
          .forEach(function (id) {
            var tier = users[id].tier;
            var line = el('div', 'ym-member');
            var left = el('div', 'ym-member-name');
            left.appendChild(art('badge-' + tier, 20));
            left.appendChild(document.createTextNode(seen[id] || 'Unknown account'));
            line.appendChild(left);
            var right = el('div', 'ym-row-ctl');
            right.appendChild(el('span', 'ym-member-tier', TIER_LABEL[tier] || tier));
            if (id !== OWNER_ID && can.indexOf(tier) !== -1) {
              var rm = button('Remove', 'danger', 'ui-user-remove');
              rm.addEventListener('click', function () {
                confirmDialog({ title: 'Remove this role?', body: (seen[id] || 'This person') + ' stops being ' + (TIER_LABEL[tier] || tier) + '. They can be given it again later.', confirm: 'Remove role', danger: true }).then(function (yes) {
                  if (!yes) return;
                  setBusy(rm, true);
                  call(bridge.grant(id, null)).then(function (res) {
                    if (res && res.ok) { toast('grant', 'Role removed from ' + (seen[id] || 'that person') + '.', 'ok'); return refresh(); }
                    setBusy(rm, false);
                    toast('grant', (res && res.reason) || 'Could not remove that role.', 'bad');
                    return null;
                  });
                });
              });
              right.appendChild(rm);
            }
            line.appendChild(right);
            list.appendChild(line);
          });
        box.appendChild(list);
      }
      return box;
    }

    // ----- Plugins -----
    function optionsOf(p) {
      var opts = el('div', 'ym-opts');
      p.settings.forEach(function (s) {
        var v = valueOf(p, s);
        var line = el('div', 'ym-opt');
        line.appendChild(el('span', null, s.label));
        if (s.type === 'range') {
          var wrap = el('span', 'ym-row-ctl');
          var out = el('output', 'ym-value', String(v));
          var slider = el('input', 'ym-slider');
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
        opts.appendChild(line);
      });
      return opts;
    }
    // One plugin: its name, what it does, its state, and its switch. Options open under it when it is on.
    function pluginRow(p) {
      var r = el('div', 'ym-plugin');
      r.setAttribute('data-id', p.id);
      var text = el('div', 'ym-row-text');
      text.appendChild(el('div', 'ym-row-name', p.name));
      text.appendChild(el('div', 'ym-row-desc', p.desc));
      var failLine = el('div', 'ym-fail');
      failLine.hidden = true;
      text.appendChild(failLine);
      var ctl = el('div', 'ym-plugin-ctl');
      var state2 = el('span', 'ym-state');
      var sw = switchEl(p.name, false, function () {
        var want = sw.checked;
        sw.disabled = true;
        setOn(p, want).then(function (ok) {
          sw.disabled = false;
          if (!ok) sw.checked = !want;
          paint(r, p);
          counts();
        });
      });
      var undo = button('Reset', 'ghost small', 'ui-reset');
      undo.setAttribute('aria-label', 'Reset ' + p.name + ' to its default');
      undo.addEventListener('click', function () { resetOne(p); });
      ctl.appendChild(state2);
      ctl.appendChild(undo);
      ctl.appendChild(sw);
      r.appendChild(text);
      r.appendChild(ctl);
      if (p.settings && p.settings.length) {
        var collapse = el('div', 'ym-collapse');
        var inner = el('div');
        inner.appendChild(optionsOf(p));
        collapse.appendChild(inner);
        r.appendChild(collapse);
        r._collapse = collapse;
      }
      r._state = state2;
      r._undo = undo;
      r._sw = sw;
      r._fail = failLine;
      paint(r, p);
      return r;
    }
    // Shows what is really the case: off, on, or on but failed to start on this page.
    function paint(r, p) {
      var on = isOn(p);
      var fail = on ? Y.failure(p.id) : null;
      r._sw.checked = on;
      r._undo.hidden = !changed(p) || typeof bridge.resetPlugin !== 'function';
      r.classList.toggle('is-failed', !!fail);
      r._state.textContent = fail ? 'Failed' : (on ? 'On' : 'Off');
      r._state.className = 'ym-state' + (fail ? ' bad' : (on ? ' on' : ''));
      r._fail.hidden = !fail;
      r._fail.textContent = fail ? fail : '';
      if (r._collapse) {
        r._collapse.classList.toggle('is-open', on);
        r._collapse.firstElementChild.inert = !on;
      }
    }
    function renderPlugins() {
      var all = Y.list();
      var reset = button('Reset plugins', 'danger ghost', 'ui-reset');
      reset.addEventListener('click', function () {
        confirmDialog({ title: 'Reset every plugin?', body: 'Each plugin goes back to its default. Your general settings and your role key are kept.', confirm: 'Reset plugins', danger: true }).then(function (yes) {
          if (!yes) return;
          setBusy(reset, true);
          call(bridge.reset()).then(function (ok) {
            setBusy(reset, false);
            if (ok === false) return toast('reset', 'Could not reset the plugins.', 'bad');
            state.plugins = {};
            toast('reset', 'Plugins are back to their defaults.', 'ok');
            return refresh();
          });
        });
      });
      view.appendChild(pageHead('Plugins', [reset]));
      if (state.app.safeMode) {
        var note = el('div', 'ym-notice');
        note.appendChild(art('ui-warning', 15));
        note.appendChild(el('span', null, 'Safe mode is on, so no plugin runs right now. The switches show what will run when it is off.'));
        view.appendChild(note);
      }
      // A plugin that is on but could not start on this page. It is named here, with a way to switch it off.
      var failing = all.filter(function (p) { return isOn(p) && Y.failure(p.id); });
      if (failing.length) {
        var broken = el('div', 'ym-notice');
        broken.appendChild(art('ui-warning', 15));
        var names = failing.map(function (p) { return p.name; }).join(', ');
        broken.appendChild(el('span', null, (failing.length === 1 ? '1 plugin is on but did not start here: ' : failing.length + ' plugins are on but did not start here: ') + names + '.'));
        var stopBroken = button('Turn them off', 'ghost small', 'ui-reset');
        stopBroken.addEventListener('click', function () {
          setBusy(stopBroken, true);
          setMany(failing, false).then(function (n) {
            setBusy(stopBroken, false);
            if (n > 0) toast('failed-off', 'Turned off ' + n + (n === 1 ? ' plugin.' : ' plugins.'), 'ok');
            return refresh();
          });
        });
        broken.appendChild(stopBroken);
        view.appendChild(broken);
      }

      var tools = el('div', 'ym-search-row');
      var box = el('label', 'ym-search');
      box.appendChild(art('ui-search', 15));
      var search = el('input');
      search.type = 'search';
      search.placeholder = 'Search ' + all.length + ' plugins';
      search.value = query;
      search.setAttribute('aria-label', 'Search plugins');
      box.appendChild(search);
      tools.appendChild(box);
      var FILTERS = [['all', 'All'], ['on', 'On'], ['off', 'Off'], ['changed', 'Changed']];
      var seg = el('div', 'ym-seg');
      seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', 'Show plugins');
      FILTERS.forEach(function (f) {
        var b = el('button', null, f[1]);
        b.type = 'button';
        b.setAttribute('data-filter', f[0]);
        b.addEventListener('click', function () {
          status = f[0];
          paintSeg();
          drawGroups();
        });
        seg.appendChild(b);
      });
      function paintSeg() {
        seg.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === status));
        });
      }
      paintSeg();
      tools.appendChild(seg);
      var total = el('span', 'ym-row-desc');
      tools.appendChild(total);
      view.appendChild(tools);

      var body = el('div', 'ym-plugins');
      var rail = el('nav', 'ym-rail');
      rail.setAttribute('aria-label', 'Categories');
      var groups = el('div');
      body.appendChild(rail);
      body.appendChild(groups);
      view.appendChild(body);

      function drawRail() {
        rail.textContent = '';
        ['All'].concat(Y.categories).forEach(function (c) {
          var inCat = c === 'All' ? all : inCategory(c);
          var on = inCat.filter(isOn).length;
          var b = el('button', 'ym-cat');
          b.type = 'button';
          b.setAttribute('aria-current', String(c === cat));
          if (c !== 'All') b.appendChild(art('cat-' + c.toLowerCase(), 16));
          b.appendChild(el('span', 'ym-cat-name', c === 'All' ? 'All plugins' : c));
          b.appendChild(el('span', 'ym-count', on + '/' + inCat.length));
          b.addEventListener('click', function () {
            cat = c;
            drawRail();
            jump(c);
          });
          rail.appendChild(b);
        });
      }
      function drawGroups() {
        groups.textContent = '';
        var shown = Y.categories.filter(function (c) { return inCategory(c).filter(matches).length > 0; });
        if (!shown.length) {
          var empty = el('div', 'ym-empty');
          empty.appendChild(el('p', null, 'No plugin matches' + (query ? ' "' + query + '"' : '') + (status !== 'all' ? ' with this filter' : '') + '.'));
          var showAll = button('Show all plugins', 'ghost', null);
          showAll.addEventListener('click', function () {
            query = '';
            status = 'all';
            search.value = '';
            paintSeg();
            drawGroups();
          });
          empty.appendChild(showAll);
          groups.appendChild(empty);
          return;
        }
        shown.forEach(function (c) {
          var sec = el('section', 'ym-group');
          sec.setAttribute('data-cat', c);
          var inCat = inCategory(c);
          var head = el('div', 'ym-group-head');
          head.appendChild(art('cat-' + c.toLowerCase(), 18));
          head.appendChild(el('span', null, c));
          head.appendChild(el('span', 'ym-count', inCat.filter(isOn).length + ' of ' + inCat.length + ' on'));
          // All on / All off act on the plugins this group shows, so a search or filter limits them too.
          var shownHere = inCat.filter(matches);
          var onAll = button('All on', 'ghost small', null);
          var offAll = button('All off', 'ghost small', null);
          onAll.addEventListener('click', function () { bulkIn(shownHere, true, c); });
          offAll.addEventListener('click', function () { bulkIn(shownHere, false, c); });
          head.appendChild(onAll);
          head.appendChild(offAll);
          sec.appendChild(head);
          shownHere.forEach(function (p) { sec.appendChild(pluginRow(p)); });
          groups.appendChild(sec);
        });
      }
      function bulkIn(list, on, c) {
        setMany(list, on).then(function (n) {
          if (n < 0) return null;
          if (n === 0) toast('bulk', 'Every plugin in ' + c + ' is already ' + (on ? 'on' : 'off') + '.', 'ok');
          else toast('bulk', (on ? 'Turned on ' : 'Turned off ') + n + (n === 1 ? ' plugin' : ' plugins') + ' in ' + c + '.', 'ok');
          counts();
          drawGroups();
          return null;
        });
      }
      function jump(c) {
        var target = c === 'All' ? groups : groups.querySelector('section[data-cat="' + c + '"]');
        if (!target) return;
        var smooth = !(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
        target.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
      }
      function counts() {
        total.textContent = all.filter(isOn).length + ' of ' + all.length + ' on';
        drawRail();
      }
      var timer = null;
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          query = search.value.trim();
          drawGroups();
        }, 90);
      });
      counts();
      drawGroups();
      startPage();
    }

    // ----- Themes -----
    function renderThemes() {
      var installed = installedTheme();
      var all = [DEFAULT_THEME].concat(installed ? [installed] : [], THEMES);
      view.appendChild(pageHead('Themes', []));

      var grid = el('div', 'ym-themes');
      grid.setAttribute('role', 'radiogroup');
      grid.setAttribute('aria-label', 'Themes');
      var tiles = {};
      var chosen = installed && state.app.themeOn ? 'installed' : activeTheme();

      function paintTiles() {
        all.forEach(function (t) {
          var b = tiles[t.id];
          var on = t.id === chosen;
          b.setAttribute('aria-checked', String(on));
          b.tabIndex = on ? 0 : -1;
        });
      }
      function choose(id, focus) {
        var before = chosen;
        chosen = id;
        paintTiles();
        if (focus) tiles[id].focus();
        var jobs = THEMES.map(function (t) {
          var p = byId(t.id);
          return p ? setOn(p, t.id === id) : Promise.resolve(true);
        });
        // The installed theme and a built-in one are never on together, so choosing one turns the other off.
        jobs.push(setApp('themeOn', id === 'installed'));
        Promise.all(jobs).then(function (results) {
          if (results.indexOf(false) !== -1) {
            chosen = before;
            paintTiles();
            return null;
          }
          var name = all.filter(function (t) { return t.id === id; })[0].name;
          toast('theme', 'Theme: ' + name, 'ok');
          return null;
        });
      }

      all.forEach(function (t) {
        var b = el('button', 'ym-theme');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        var top = el('span', 'ym-theme-top');
        top.appendChild(el('span', null, t.name));
        top.appendChild(art('ui-check', 14));
        b.appendChild(top);
        var mini = el('span', 'ym-mini');
        mini.setAttribute('aria-hidden', 'true');
        var side = el('i');
        side.style.background = t.sw[1];
        var main = el('span', 'ym-mini-main');
        main.style.background = t.sw[0];
        var lineA = el('i');
        lineA.style.background = t.sw[3];
        lineA.style.width = '70%';
        var bubble = el('i', 'ym-mini-bubble');
        bubble.style.background = t.sw[2];
        bubble.style.width = '62%';
        var lineB = el('i');
        lineB.style.background = t.sw[3];
        lineB.style.width = '42%';
        lineB.style.opacity = '0.5';
        main.appendChild(lineA);
        main.appendChild(bubble);
        main.appendChild(lineB);
        mini.appendChild(side);
        mini.appendChild(main);
        b.appendChild(mini);
        b.addEventListener('click', function () { if (chosen !== t.id) choose(t.id, false); });
        b.addEventListener('keydown', function (e) {
          var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
          if (!keys[e.key]) return;
          e.preventDefault();
          var i = all.indexOf(t);
          var next = all[(i + keys[e.key] + all.length) % all.length];
          choose(next.id, true);
        });
        tiles[t.id] = b;
        grid.appendChild(b);
      });
      paintTiles();
      view.appendChild(grid);

      var install = sectionTitle('Install a theme', 'Get a theme from the Themes page on the Yapnap website: press Copy theme file, save the text as a .json file, then install that file here. A picture theme brings its picture with it.');
      var installActions = el('div', 'ym-actions');
      var add = button('Install a theme file', 'primary', 'ui-plus');
      add.addEventListener('click', function () {
        setBusy(add, true);
        call(bridge.importTheme()).then(function (res) {
          setBusy(add, false);
          if (!res || res.ok !== true) {
            if (res && res.reason && res.reason !== 'Cancelled.') toast('theme-install', res.reason, 'bad');
            return null;
          }
          toast('theme-install', 'Theme installed: ' + res.name, 'ok');
          return refresh();
        });
      });
      installActions.appendChild(add);
      if (installed) {
        var remove = button('Remove theme', 'danger', 'ui-trash');
        remove.addEventListener('click', function () {
          confirmDialog({ title: 'Remove ' + installed.name + '?', body: 'The installed theme is removed. Your built-in themes and plugins are not changed.', confirm: 'Remove theme', danger: true }).then(function (yes) {
            if (!yes) return null;
            setBusy(remove, true);
            return call(bridge.removeTheme()).then(function (ok) {
              setBusy(remove, false);
              if (ok === false) { toast('theme-install', 'Could not remove that theme.', 'bad'); return null; }
              toast('theme-install', 'Theme removed.', 'ok');
              return refresh();
            });
          });
        });
        installActions.appendChild(remove);
      }
      install.appendChild(installActions);
      if (!isBrowser()) view.appendChild(install);

      var adjust = sectionTitle('Adjust');
      var acc = byId('accent-colour');
      if (acc) {
        var accSettings = acc.settings[0];
        var picker = el('input');
        picker.type = 'color';
        picker.value = String(valueOf(acc, accSettings));
        picker.setAttribute('aria-label', 'Accent colour');
        picker.addEventListener('change', function () { setValue(acc, accSettings, picker.value); });
        adjust.appendChild(row('Accent colour', 'Buttons, links and selections in the chat.', picker, null));
      }
      function slider(pluginId, label, desc, unit) {
        var p = byId(pluginId);
        if (!p) return;
        var s = p.settings[0];
        var wrap = el('span', 'ym-row-ctl');
        var out = el('output', 'ym-value', valueOf(p, s) + unit);
        var input = el('input', 'ym-slider');
        input.type = 'range';
        input.min = String(s.min);
        input.max = String(s.max);
        input.step = String(s.step);
        input.value = String(valueOf(p, s));
        input.setAttribute('aria-label', label);
        input.addEventListener('input', function () { out.textContent = input.value + unit; });
        input.addEventListener('change', function () { setValue(p, s, Number(input.value)); });
        wrap.appendChild(input);
        wrap.appendChild(out);
        adjust.appendChild(row(label, desc, wrap, null));
      }
      slider('corner-radius', 'Corner radius', 'How round panels and inputs are.', 'px');
      slider('ui-scale', 'Interface scale', 'Makes the whole interface smaller or bigger.', '%');
      view.appendChild(adjust);

      var share = sectionTitle('Share a look', 'Made a look you like? Publish its colours for everyone to use. You add the name and licence on the website.');
      var publish = button('Publish my look', 'primary', 'ui-plus');
      publish.addEventListener('click', function () {
        var chosenTheme = all.filter(function (t) { return t.id === chosen; })[0];
        var base = chosenTheme ? chosenTheme.sw : DEFAULT_THEME.sw;
        var accP = byId('accent-colour');
        var accent = accP ? valueOf(accP, accP.settings[0]) : '#ff6b4a';
        var theme = { name: 'My Yapnap look', description: 'Made in Yapnap.', kind: 'colour',
          colors: { bg: base[0], side: base[1], elev: base[2], text: base[3], accent: accent } };
        var bytes = new TextEncoder().encode(JSON.stringify(theme));
        var binary = '';
        bytes.forEach(function (b) { binary += String.fromCharCode(b); });
        var b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        window.open(PUBLISH_URL + '#data=' + b64, '_blank', 'noopener');
      });
      share.appendChild(publish);
      view.appendChild(share);
      startPage();
    }

    // ----- routing and refresh -----
    function show(name) {
      if (PAGES.indexOf(name) === -1) name = 'about';
      page = name;
      view.textContent = '';
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
      }).catch(logErr);
    }

    show(page);
    refresh(true);

    return {
      show: show,
      pages: PAGES.slice(),
      titles: PAGE_TITLE,
      destroy: function () { root2.remove(); }
    };
  }

  root.YAPNAP_PANEL = {
    mount: mount,
    pages: ['about', 'settings', 'plugins', 'themes'],
    titles: { about: 'About', settings: 'Settings', plugins: 'Plugins', themes: 'Themes' }
  };
})();

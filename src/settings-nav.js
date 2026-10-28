// Yapnap inside Yapin's own settings. It adds a "Yapnap" group to the settings navigation (.settings-nav) with
// About, Settings, Plugins and Themes. Picking one shows that Yapnap page in place of the settings content (.settings-main).
// Picking any Yapin entry puts Yapin's settings back exactly as they were.
(function () {
  'use strict';
  var root = typeof window !== 'undefined' ? window : globalThis;
  if (root.__yapnapUI) return;

  var ENTRY = 'data-yapnap-entry';
  var GROUP = 'data-yapnap-group';
  var HIDDEN = 'data-yapnap-hidden';
  var PANEL = 'data-yapnap-panel';
  var PAGES = ['about', 'settings', 'plugins', 'themes', 'market', 'security'];
  var TITLES = { about: 'About', settings: 'Settings', plugins: 'Plugins', themes: 'Themes', market: 'Marketplace', security: 'Security' };

  // The few rules the Yapnap entries need on top of Yapin's own classes: a logo in the group label, an accent bar on the
  // active entry (the same accent the panel uses for its controls), and a focus ring. Nothing else on Yapin's page changes.
  var NAV_STYLE_ID = 'ym-nav-style';
  var NAV_CSS = '.ym-nav-label{display:flex;align-items:center;gap:7px}' +
    '[' + ENTRY + ']{position:relative}' +
    '[' + ENTRY + '].active{box-shadow:inset 3px 0 0 #ef9448}' +
    '[' + ENTRY + ']:focus-visible{outline:2px solid #ef9448;outline-offset:-2px}';
  function injectNavStyle() {
    if (document.getElementById(NAV_STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = NAV_STYLE_ID;
    s.textContent = NAV_CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var active = false;
  var page = 'about';
  var hiddenNodes = [];
  var host = null;
  var handle = null;
  var mainObserver = null;
  var scheduled = false;

  // Only a visible settings nav counts, and its content area is the one beside it.
  function navOf() {
    return Array.prototype.find.call(document.querySelectorAll('.settings-nav'), function (n) { return n.getClientRects().length > 0; }) || null;
  }
  function mainOf() {
    var nav = navOf();
    return nav && nav.parentElement ? nav.parentElement.querySelector('.settings-main') : null;
  }

  function ensureEntries() {
    var nav = navOf();
    if (!nav) {
      hidePanel();
      return;
    }
    injectNavStyle();
    if (nav.querySelector('[' + GROUP + ']')) return;
    var base = nav.querySelector('button');
    var existingLabel = nav.querySelector('.settings-nav-label');
    var label = document.createElement('div');
    label.className = (existingLabel ? existingLabel.className : 'settings-nav-label') + ' ym-nav-label';
    label.setAttribute(GROUP, '1');
    if (root.YAPNAP_ART) {
      var logo = document.createElement('img');
      logo.alt = '';
      logo.width = 14;
      logo.height = 14;
      logo.src = root.YAPNAP_ART.src('yapnap-logo');
      label.appendChild(logo);
    }
    label.appendChild(document.createTextNode('Yapnap'));
    nav.appendChild(label);
    PAGES.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute(ENTRY, p);
      // Same classes as Yapin's own entries, so they look like they belong there.
      if (base && base.className) btn.className = base.className.replace(/\bactive\b/g, '').trim();
      btn.textContent = TITLES[p];
      nav.appendChild(btn);
    });
    if (active) markActive();
  }

  function markActive() {
    var nav = navOf();
    if (!nav) return;
    Array.prototype.forEach.call(nav.querySelectorAll('button.active'), function (b) {
      if (!b.hasAttribute(ENTRY)) b.classList.remove('active');
    });
    Array.prototype.forEach.call(nav.querySelectorAll('[' + ENTRY + ']'), function (b) {
      b.classList.toggle('active', active && b.getAttribute(ENTRY) === page);
    });
  }

  function showPanel(name) {
    var main = mainOf();
    if (!main || !root.YAPNAP_PANEL || !root.yapnap) return false;
    page = PAGES.indexOf(name) !== -1 ? name : 'about';
    if (!active) {
      hiddenNodes = Array.prototype.filter.call(main.children, function (c) { return c.style.display !== 'none'; });
      hiddenNodes.forEach(function (c) {
        c.setAttribute(HIDDEN, '1');
        c.style.display = 'none';
      });
      host = document.createElement('div');
      host.setAttribute(PANEL, '1');
      main.appendChild(host);
      handle = root.YAPNAP_PANEL.mount(host, root.yapnap);
      active = true;
      // Anything that appears in Yapin's settings area while a Yapnap page is open stays hidden.
      mainObserver = new MutationObserver(function (records) {
        records.forEach(function (r) {
          Array.prototype.forEach.call(r.addedNodes, function (n) {
            if (n.nodeType === 1 && !n.hasAttribute(PANEL)) {
              n.setAttribute(HIDDEN, '1');
              n.style.display = 'none';
              hiddenNodes.push(n);
            }
          });
        });
      });
      mainObserver.observe(main, { childList: true });
    }
    handle.show(page);
    markActive();
    return true;
  }

  function hidePanel() {
    if (!active) return;
    active = false;
    if (mainObserver) { mainObserver.disconnect(); mainObserver = null; }
    if (handle) { handle.destroy(); handle = null; }
    if (host) { host.remove(); host = null; }
    hiddenNodes.forEach(function (c) {
      c.style.display = '';
      c.removeAttribute(HIDDEN);
    });
    hiddenNodes = [];
    markActive();
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var mine = t.closest('[' + ENTRY + ']');
    if (mine) {
      // Our entries handle the click themselves, so the settings page never sees it.
      e.preventDefault();
      e.stopPropagation();
      showPanel(mine.getAttribute(ENTRY));
      return;
    }
    if (active && t.closest('.settings-nav')) hidePanel();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () {
      scheduled = false;
      ensureEntries();
    }, 16);
  }

  /** Finds the settings button in the user area, preferring "User Settings" over a server's settings. */
  function findSettingsButton() {
    var cands = Array.prototype.slice.call(document.querySelectorAll('button[aria-label], button[title], [role="button"][aria-label]'))
      .filter(function (c) { return !c.closest('.settings-nav'); });
    function label(c) { return c.getAttribute('aria-label') || c.getAttribute('title') || ''; }
    return cands.find(function (c) { return /^(user )?settings$/i.test(label(c).trim()); }) ||
      cands.find(function (c) { return /settings/i.test(label(c)); }) || null;
  }

  /** Opens Yapin's settings if needed, then shows the Yapnap page. Resolves to true when it is on screen. */
  function open(name) {
    return new Promise(function (resolve) {
      if (navOf()) {
        ensureEntries();
        resolve(showPanel(name || 'about'));
        return;
      }
      var btn = findSettingsButton();
      if (!btn) { resolve(false); return; }
      btn.click();
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        if (navOf()) {
          clearInterval(timer);
          ensureEntries();
          resolve(showPanel(name || 'about'));
        } else if (tries > 40) {
          clearInterval(timer);
          resolve(false);
        }
      }, 100);
    });
  }

  root.__yapnapUI = { open: open };

  document.addEventListener('click', onClick, true);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  ensureEntries();
})();

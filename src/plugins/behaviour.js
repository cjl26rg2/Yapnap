// Behaviour: small things that happen in the page. Each plugin has start() and returns a stop().
// None of them send anything, press buttons for you, or read message contents beyond what is on screen.
(function (Y) {
  'use strict';

  var PREFIX = /^\(\d+\)\s/;

  Y.add({
    id: 'unread-title',
    def: true,
    name: 'Unread count in title',
    desc: 'The window title shows how many channels have unread messages.',
    category: 'Behaviour',
    start: function () {
      function update() {
        var clean = document.title.replace(PREFIX, '');
        var n = document.querySelectorAll('.unread').length;
        var want = n ? '(' + n + ') ' + clean : clean;
        if (document.title !== want) document.title = want;
      }
      update();
      var timer = setInterval(update, 3000);
      return function stop() {
        clearInterval(timer);
        document.title = document.title.replace(PREFIX, '');
      };
    }
  });

  Y.add({
    id: 'copy-code-on-double-click',
    def: true,
    name: 'Double-click to copy code',
    desc: 'Double-click a code block in a message to copy it to the clipboard.',
    category: 'Behaviour',
    start: function () {
      function onDouble(e) {
        var pre = e.target && e.target.closest ? e.target.closest('.msg-text pre') : null;
        if (!pre || !navigator.clipboard) return;
        navigator.clipboard.writeText(pre.innerText).catch(function () { /* clipboard refused */ });
      }
      document.addEventListener('dblclick', onDouble, true);
      return function stop() { document.removeEventListener('dblclick', onDouble, true); };
    }
  });

  Y.add({
    id: 'type-to-focus',
    name: 'Type to focus composer',
    desc: 'Start typing anywhere in the app and the message box takes the keys.',
    category: 'Behaviour',
    start: function () {
      function onKey(e) {
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
        var t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (document.querySelector('.modal')) return;
        var box = document.querySelector('.composer .input');
        if (box && typeof box.focus === 'function') box.focus();
      }
      document.addEventListener('keydown', onKey, true);
      return function stop() { document.removeEventListener('keydown', onKey, true); };
    }
  });

  Y.add({
    id: 'alt-server-jump',
    def: true,
    name: 'Alt + number to switch server',
    desc: 'Alt+1 to Alt+9 open the first to ninth server in the list.',
    category: 'Behaviour',
    start: function () {
      function onKey(e) {
        if (!e.altKey || e.ctrlKey || e.metaKey) return;
        var m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code || '');
        if (!m) return;
        var item = document.querySelectorAll('.rail-item')[Number(m[1]) - 1];
        if (!item) return;
        e.preventDefault();
        item.click();
      }
      document.addEventListener('keydown', onKey, true);
      return function stop() { document.removeEventListener('keydown', onKey, true); };
    }
  });

  Y.add({
    id: 'end-key-latest',
    def: true,
    name: 'End key jumps to latest',
    desc: 'Press End outside the composer to jump to the newest message.',
    category: 'Behaviour',
    start: function () {
      function onKey(e) {
        if (e.key !== 'End' || e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        var all = document.querySelectorAll('.msg');
        var last = all[all.length - 1];
        if (!last) return;
        e.preventDefault();
        last.scrollIntoView({ block: 'end' });
      }
      document.addEventListener('keydown', onKey, true);
      return function stop() { document.removeEventListener('keydown', onKey, true); };
    }
  });

  Y.add({
    id: 'mention-chime',
    name: 'Mention chime',
    desc: 'A short tone when someone mentions you and the window is in the background.',
    category: 'Behaviour',
    settings: [{ key: 'volume', label: 'Volume', type: 'range', min: 0, max: 100, step: 5, def: 35 }],
    start: function (ctx) {
      var level = Math.max(0, Math.min(100, ctx.settings.volume)) / 100 * 0.3;
      var audio = null;
      var seen = new WeakSet();
      var last = 0;

      function chime() {
        if (level <= 0 || Date.now() - last < 2000) return;
        last = Date.now();
        try {
          var Ctor = window.AudioContext || window.webkitAudioContext;
          if (!Ctor) return;
          audio = audio || new Ctor();
          var now = audio.currentTime;
          var osc = audio.createOscillator();
          var gain = audio.createGain();
          osc.type = 'sine';
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(level, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
          osc.connect(gain);
          gain.connect(audio.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        } catch (e) { ctx.log('chime failed', e); }
      }

      var observer = new MutationObserver(function (records) {
        if (document.hasFocus()) return;
        records.forEach(function (r) {
          r.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            var hits = node.matches && node.matches('.mention') ? [node] : Array.from(node.querySelectorAll('.mention'));
            hits.forEach(function (el) {
              if (seen.has(el)) return;
              seen.add(el);
              chime();
            });
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });

      return function stop() {
        observer.disconnect();
        if (audio) audio.close().catch(function () { /* already closed */ });
        audio = null;
      };
    }
  });
})(window.YAPNAP);

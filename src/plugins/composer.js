// Composer: the box you type in.
(function (Y) {
  'use strict';

  Y.add({
    id: 'hide-send-button',
    name: 'Hide send button',
    desc: 'Hides the send button. Enter still sends.',
    category: 'Composer',
    css: '.send-btn{display:none!important}'
  });

  Y.add({
    id: 'composer-text-size',
    name: 'Composer text size',
    desc: 'Font size of what you type.',
    category: 'Composer',
    settings: [{ key: 'px', label: 'Size', type: 'range', min: 12, max: 20, step: 1, def: 15 }],
    css: function (s) { return '.composer .input{font-size:' + s.px + 'px!important}'; }
  });

  Y.add({
    id: 'composer-focus-glow',
    name: 'Composer focus glow',
    desc: 'A soft ring around the composer while you type in it.',
    category: 'Composer',
    css: '.composer:focus-within{box-shadow:0 0 0 2px var(--accent-soft)}'
  });

  Y.add({
    id: 'composer-monospace',
    name: 'Monospace composer',
    desc: 'Type in a fixed-width font. Handy for code and commands.',
    category: 'Composer',
    css: '.composer .input{font-family:ui-monospace,Menlo,Consolas,monospace!important}'
  });

  Y.add({
    id: 'composer-square-corners',
    name: 'Square composer',
    desc: 'The input box gets square corners.',
    category: 'Composer',
    css: '.composer .input{border-radius:4px!important}'
  });

  Y.add({
    id: 'composer-borderless',
    name: 'Borderless composer',
    desc: 'Removes the outline around the composer.',
    category: 'Composer',
    css: '.composer{border-color:transparent!important}'
  });

  Y.add({
    id: 'hide-mention-suggestions',
    name: 'Hide mention suggestions',
    desc: 'Stops the name list from popping up when you type @.',
    category: 'Composer',
    css: '.mention-menu{display:none!important}'
  });

  Y.add({
    id: 'narrow-emoji-picker',
    name: 'Narrow emoji picker',
    desc: 'A slimmer emoji picker that takes less of the screen.',
    category: 'Composer',
    css: '.emoji-picker{width:280px!important;max-width:90vw!important}'
  });

  Y.add({
    id: 'tight-composer',
    name: 'Tight composer padding',
    desc: 'Less padding inside the composer bar. The typing line and the last message keep their own space above it.',
    category: 'Composer',
    css: '.composer{padding-top:4px!important;padding-bottom:4px!important}' +
      '.typing-line{padding-top:8px!important;padding-bottom:6px!important}' +
      '.messages-inner{padding-bottom:16px!important}'
  });
})(window.YAPNAP);

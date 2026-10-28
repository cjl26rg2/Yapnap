// Composer: the box you type in.
(function (Y) {
  'use strict';


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
    id: 'composer-borderless',
    name: 'Borderless composer',
    desc: 'Removes the outline around the composer.',
    category: 'Composer',
    css: '.composer{border-color:transparent!important}'
  });



})(window.YAPNAP);

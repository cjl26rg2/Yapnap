// Messages: spacing, layout, and what shows on each message.
(function (Y) {
  'use strict';

  Y.add({
    id: 'compact-messages',
    name: 'Compact messages',
    desc: 'Less space above and below each message.',
    category: 'Messages',
    css: '.msg{padding-top:2px!important;padding-bottom:2px!important}'
  });



  Y.add({
    id: 'bubble-messages',
    name: 'Bubble messages',
    desc: 'Each message body sits on a rounded card.',
    category: 'Messages',
    css: '.msg-body{background:var(--bg-elev);border-radius:12px;padding:6px 10px}'
  });




  Y.add({
    id: 'hide-reactions',
    name: 'Hide reactions',
    desc: 'Hides the emoji reactions under messages.',
    category: 'Messages',
    css: '.reactions{display:none!important}'
  });







  Y.add({
    id: 'message-text-size',
    name: 'Message text size',
    desc: 'Font size of message text, in pixels.',
    category: 'Messages',
    settings: [{ key: 'px', label: 'Size', type: 'range', min: 12, max: 22, step: 1, def: 16 }],
    css: function (s) { return '.msg-text{font-size:' + s.px + 'px!important}'; }
  });

  Y.add({
    id: 'readable-line-length',
    name: 'Readable line length',
    desc: 'Caps the width of message text so long lines are easier to follow.',
    category: 'Messages',
    css: '.msg-text{max-width:72ch}'
  });


  Y.add({
    id: 'wrap-code-blocks',
    name: 'Wrap code blocks',
    desc: 'Long code lines wrap instead of scrolling sideways.',
    category: 'Messages',
    css: '.msg-text pre{white-space:pre-wrap!important;word-break:break-word}'
  });





})(window.YAPNAP);

// Voice and screen share: call tiles, the call view and its controls.
(function (Y) {
  'use strict';



  Y.add({
    id: 'voice-tile-radius',
    name: 'Call tile corners',
    desc: 'Corner radius of each tile in a call, in pixels.',
    category: 'Voice',
    settings: [{ key: 'px', label: 'Radius', type: 'range', min: 0, max: 24, step: 1, def: 12 }],
    css: function (s) { return '.voice-tile{border-radius:' + s.px + 'px!important}'; }
  });

  Y.add({
    id: 'hide-voice-chat',
    name: 'Hide call chat',
    desc: 'Hides the text chat panel that sits beside a call.',
    category: 'Voice',
    css: '.voice-chat-panel{display:none!important}'
  });



  Y.add({
    id: 'large-call-buttons',
    name: 'Large call buttons',
    desc: 'Mute, camera and hang-up buttons are bigger targets.',
    category: 'Voice',
    css: '.voice-view .btn{min-width:48px!important;min-height:48px!important}'
  });

})(window.YAPNAP);

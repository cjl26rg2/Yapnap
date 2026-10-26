// Voice and screen share: call tiles, the call view and its controls.
(function (Y) {
  'use strict';

  Y.add({
    id: 'hide-voice-tile-borders',
    name: 'Borderless call tiles',
    desc: 'Removes the outline around each person in a call.',
    category: 'Voice',
    css: '.voice-tile{border:0!important}'
  });

  Y.add({
    id: 'tight-voice-grid',
    name: 'Tight call grid',
    desc: 'Smaller gap between the tiles in a call.',
    category: 'Voice',
    css: '.voice-view{gap:4px!important}'
  });

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
    id: 'hide-stream-border',
    name: 'Borderless screen share',
    desc: 'Removes the frame around a shared screen.',
    category: 'Voice',
    css: '.ss-stage{border:0!important}'
  });

  Y.add({
    id: 'black-call-background',
    name: 'Black call background',
    desc: 'The call view is pure black, which suits OLED screens.',
    category: 'Voice',
    css: '.voice-view{background:#000!important}'
  });

  Y.add({
    id: 'large-call-buttons',
    name: 'Large call buttons',
    desc: 'Mute, camera and hang-up buttons are bigger targets.',
    category: 'Voice',
    css: '.voice-view .btn{min-width:48px!important;min-height:48px!important}'
  });

  Y.add({
    id: 'edge-to-edge-calls',
    name: 'Edge-to-edge calls',
    desc: 'The call grid runs right to the edges of its panel.',
    category: 'Voice',
    css: '.voice-view{padding:0!important}'
  });
})(window.YAPNAP);

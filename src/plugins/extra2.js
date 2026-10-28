// Extra plugins, part two: tidy-ups for messages, the sidebar, the composer, the member list, voice and the settings
// window. Each one is a CSS rule, and each one is off until it is turned on.
(function (Y) {
  'use strict';

  // Messages
  Y.add({ id: 'hide-day-dividers', name: 'Hide day dividers', desc: 'Hides the date line between days of messages.', category: 'Messages', css: '.day-divider{display:none!important}' });

  // Sidebar

  // Composer

  // Members

  // Voice
  Y.add({ id: 'hide-voice-bar-info', name: 'Hide voice bar details', desc: 'Hides the channel and people details in the voice bar.', category: 'Voice', css: '.voice-bar-info{display:none!important}' });
  Y.add({ id: 'compact-voice-clips', name: 'Compact voice clips', desc: 'Voice messages take up less room.', category: 'Voice', css: '.voice-clip-row{padding:4px 6px!important}' });

  // Look
})(window.YAPNAP);

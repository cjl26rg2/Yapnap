// Extra plugins: small looks and tidy-ups for the top bar, messages, reactions, replies, the sidebar, the composer,
// the member list and voice. Each one is a CSS rule.
(function (Y) {
  'use strict';

  // Look
  Y.add({ id: 'hide-top-brand', name: 'Hide the top brand', desc: 'Hides the name and logo at the top of the chat.', category: 'Look', css: '.topbar-brand{display:none!important}' });

  // Messages
  Y.add({ id: 'hide-typing-dots', name: 'Hide typing dots', desc: 'Hides the three dots that move while someone types.', category: 'Messages', css: '.typing-dots{display:none!important}' });
  Y.add({ id: 'hide-message-times', name: 'Hide message times', desc: 'Hides the time next to each message.', category: 'Messages', css: '.msg-time{display:none!important}' });

  // Sidebar

  // Composer
  Y.add({ id: 'hide-composer-tools', name: 'Hide composer tools', desc: 'Hides the row of tools under the composer.', category: 'Composer', css: '.composer-tools{display:none!important}' });

  // Members
  Y.add({ id: 'compact-member-rows', name: 'Compact member rows', desc: 'Less space between people in the member list.', category: 'Members', css: '.member-row{padding:4px 8px!important}' });

  // Voice
})(window.YAPNAP);

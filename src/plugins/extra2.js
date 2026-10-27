// Extra plugins, part two: tidy-ups for messages, the sidebar, the composer, the member list, voice and the settings
// window. Each one is a CSS rule, and each one is off until it is turned on.
(function (Y) {
  'use strict';

  // Messages
  Y.add({ id: 'hide-translations', name: 'Hide translations', desc: 'Hides the translated text shown under a message.', category: 'Messages', css: '.msg-translation{display:none!important}' });
  Y.add({ id: 'round-message-images', name: 'Rounder message pictures', desc: 'Rounded corners on pictures sent in messages.', category: 'Messages', css: '.msg-image{border-radius:10px!important;overflow:hidden}' });
  Y.add({ id: 'round-message-videos', name: 'Rounder message videos', desc: 'Rounded corners on videos sent in messages.', category: 'Messages', css: '.msg-video{border-radius:10px!important;overflow:hidden}' });
  Y.add({ id: 'tight-image-albums', name: 'Tight picture groups', desc: 'Less space between the pictures in a group.', category: 'Messages', css: '.msg-album{gap:2px!important}' });
  Y.add({ id: 'clear-failed-messages', name: 'Clear failed messages', desc: 'Messages that did not send are a clearer red.', category: 'Messages', css: '.msg-failed{color:#ff6b6b!important}' });
  Y.add({ id: 'hide-day-dividers', name: 'Hide day dividers', desc: 'Hides the date line between days of messages.', category: 'Messages', css: '.day-divider{display:none!important}' });
  Y.add({ id: 'hide-chat-start', name: 'Hide the chat start', desc: 'Hides the intro at the top of a channel with no older messages.', category: 'Messages', css: '.chat-start{display:none!important}' });
  Y.add({ id: 'hide-edit-hint', name: 'Hide the edit hint', desc: 'Hides the hint under a message while you edit it.', category: 'Messages', css: '.msg-editor-hint{display:none!important}' });
  Y.add({ id: 'hide-embed-images', name: 'Hide embed pictures', desc: 'Hides the picture inside a link preview or embed.', category: 'Messages', css: '.embed-image{display:none!important}' });
  Y.add({ id: 'hide-reply-text', name: 'Hide reply text', desc: 'Hides the message text inside a reply preview.', category: 'Messages', css: '.reply-text{display:none!important}' });
  Y.add({ id: 'hide-quick-reacts', name: 'Hide quick reactions', desc: 'Hides the row of quick reactions that shows over a message.', category: 'Messages', css: '.quick-react{display:none!important}' });
  Y.add({ id: 'accent-quote-bars', name: 'Accent quote bars', desc: 'Quotes in messages get the accent colour on their side bar.', category: 'Messages', css: '.md-quote{border-left-color:var(--accent)!important}' });
  Y.add({ id: 'hide-new-messages-button', name: 'Hide the new messages button', desc: 'Hides the button that jumps to new messages.', category: 'Messages', css: '.new-below-wrap{display:none!important}' });

  // Sidebar
  Y.add({ id: 'hide-people-strip', name: 'Hide the people strip', desc: 'Hides the row of faces at the top of the sidebar.', category: 'Sidebar', css: '.nl-people-strip{display:none!important}' });
  Y.add({ id: 'hide-active-now', name: 'Hide active now', desc: 'Hides the Active now card in the sidebar.', category: 'Sidebar', css: '.nl-active-now{display:none!important}' });
  Y.add({ id: 'hide-rail-separators', name: 'Hide server list lines', desc: 'Hides the lines between groups in the server list.', category: 'Sidebar', css: '.rail-sep{display:none!important}' });
  Y.add({ id: 'rounded-channel-rows', name: 'Rounded channel rows', desc: 'Channels in the sidebar have rounded highlights.', category: 'Sidebar', css: '.channel-row{border-radius:8px!important}' });
  Y.add({ id: 'hide-server-tags', name: 'Hide server tags', desc: 'Hides the short tag shown next to a server name.', category: 'Sidebar', css: '.server-tag{display:none!important}' });

  // Composer
  Y.add({ id: 'hide-char-count', name: 'Hide the character count', desc: 'Hides the count of characters under the composer.', category: 'Composer', css: '.char-count{display:none!important}' });
  Y.add({ id: 'hide-format-bar', name: 'Hide the format bar', desc: 'Hides the bar of bold, italic and other formatting buttons.', category: 'Composer', css: '.fmt-bar{display:none!important}' });
  Y.add({ id: 'compact-file-cards', name: 'Compact file cards', desc: 'Files you attach take up less room.', category: 'Composer', css: '.file-card{padding:6px 8px!important}' });

  // Members
  Y.add({ id: 'hide-popout-banners', name: 'Hide popout banners', desc: 'Hides the banner at the top of a profile popout.', category: 'Members', css: '.mini-banner{display:none!important}' });
  Y.add({ id: 'hide-popout-bios', name: 'Hide popout bios', desc: 'Hides the bio in a profile popout.', category: 'Members', css: '.mini-bio{display:none!important}' });
  Y.add({ id: 'hide-popout-join-date', name: 'Hide popout join date', desc: 'Hides the date someone joined in a profile popout.', category: 'Members', css: '.mini-since{display:none!important}' });
  Y.add({ id: 'hide-popout-mutuals', name: 'Hide popout mutuals', desc: 'Hides the mutual friends list in a profile popout.', category: 'Members', css: '.mini-mutuals{display:none!important}' });
  Y.add({ id: 'hide-profile-join-date', name: 'Hide profile join date', desc: 'Hides the date someone joined on a full profile card.', category: 'Members', css: '.pc2-since{display:none!important}' });

  // Voice
  Y.add({ id: 'hide-voice-tile-names', name: 'Hide voice tile names', desc: 'Hides the name on each person in a voice call.', category: 'Voice', css: '.voice-tile-name{display:none!important}' });
  Y.add({ id: 'hide-voice-tile-menus', name: 'Hide voice tile menus', desc: 'Hides the menu button on each person in a voice call.', category: 'Voice', css: '.voice-tile-menu{display:none!important}' });
  Y.add({ id: 'hide-voice-bar-info', name: 'Hide voice bar details', desc: 'Hides the channel and people details in the voice bar.', category: 'Voice', css: '.voice-bar-info{display:none!important}' });
  Y.add({ id: 'compact-voice-clips', name: 'Compact voice clips', desc: 'Voice messages take up less room.', category: 'Voice', css: '.voice-clip-row{padding:4px 6px!important}' });
  Y.add({ id: 'hide-voice-rec-hint', name: 'Hide the recording hint', desc: 'Hides the hint shown while you record a voice message.', category: 'Voice', css: '.voice-rec-hint{display:none!important}' });

  // Look
  Y.add({ id: 'hide-settings-group-labels', name: 'Hide settings group labels', desc: 'Hides the small headings between groups in the settings list.', category: 'Look', css: '.settings-nav-label{display:none!important}' });
  Y.add({ id: 'hide-search-help', name: 'Hide search help', desc: 'Hides the help text in the search box.', category: 'Look', css: '.search-help{display:none!important}' });
  Y.add({ id: 'hide-search-shortcut', name: 'Hide the search shortcut', desc: 'Hides the keyboard hint in the search box.', category: 'Look', css: '.tb-kbd{display:none!important}' });
  Y.add({ id: 'hide-badge-overflow', name: 'Hide the badge count', desc: 'Hides the +N count after a row of badges.', category: 'Look', css: '.badge-more{display:none!important}' });
  Y.add({ id: 'compact-toasts', name: 'Compact pop-up messages', desc: 'Smaller pop-up messages in the corner of the window.', category: 'Look', css: '.toast{padding:6px 10px!important;font-size:12px!important}' });
  Y.add({ id: 'round-icon-buttons', name: 'Round icon buttons', desc: 'Icon buttons are perfect circles.', category: 'Look', css: '.round-btn{border-radius:50%!important}' });
})(window.YAPNAP);

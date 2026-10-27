// More plugins for 1.0.2: small looks and tidy-ups for embeds, links, polls, the composer, the sidebar, profile cards,
// voice and dialogs. Each one is a CSS rule, and every one is off until it is switched on.
(function (Y) {
  'use strict';

  // Messages
  Y.add({ id: 'hide-embed-footers', name: 'Hide embed footers', desc: 'Hides the small footer line under a link embed.', category: 'Messages', css: '.embed-footer{display:none!important}' });
  Y.add({ id: 'hide-embed-thumbs', name: 'Hide embed thumbnails', desc: 'Hides the small picture beside a link embed.', category: 'Messages', css: '.embed-thumb{display:none!important}' });
  Y.add({ id: 'compact-embeds', name: 'Compact embeds', desc: 'Less space inside link embeds.', category: 'Messages', css: '.embed{padding:6px 10px!important}' });
  Y.add({ id: 'muted-embed-text', name: 'Muted embed text', desc: 'Embed descriptions are a little fainter.', category: 'Messages', css: '.embed-desc{opacity:.75!important}' });
  Y.add({ id: 'hide-embed-fields', name: 'Hide embed fields', desc: 'Hides the extra fields under an embed.', category: 'Messages', css: '.embed-fields{display:none!important}' });
  Y.add({ id: 'hide-message-videos', name: 'Hide message videos', desc: 'Hides videos sent in messages.', category: 'Messages', css: '.msg-video-box{display:none!important}' });
  Y.add({ id: 'hide-link-chips', name: 'Hide link chips', desc: 'Hides the small website chips under a message.', category: 'Messages', css: '.link-chip{display:none!important}' });
  Y.add({ id: 'hide-link-hosts', name: 'Hide link hosts', desc: 'Hides the website name on a link chip.', category: 'Messages', css: '.link-chip-host{display:none!important}' });
  Y.add({ id: 'compact-quotes', name: 'Compact quotes', desc: 'Less space inside a quoted line.', category: 'Messages', css: '.md-quote{padding:2px 8px!important}' });
  Y.add({ id: 'code-small-text', name: 'Smaller code text', desc: 'Code in messages uses a smaller font.', category: 'Messages', css: '.md-code{font-size:12px!important}' });
  Y.add({ id: 'hide-poll-counts', name: 'Hide poll counts', desc: 'Hides the number of votes on a poll.', category: 'Messages', css: '.poll-opt-count{display:none!important}' });
  Y.add({ id: 'compact-polls', name: 'Compact polls', desc: 'Tighter poll options.', category: 'Messages', css: '.poll-opt{padding:4px 8px!important}' });
  Y.add({ id: 'bold-mention-all', name: 'Bold @everyone', desc: 'The everyone mention is bold.', category: 'Messages', css: '.mention-all{font-weight:800!important}' });
  Y.add({ id: 'hide-attach-thumbs', name: 'Hide attachment thumbnails', desc: 'Hides the small picture on a file attachment.', category: 'Messages', css: '.attach-thumb{display:none!important}' });
  Y.add({ id: 'hide-mention-role-dots', name: 'Hide mention role dots', desc: 'Hides the coloured dots by roles in mention suggestions.', category: 'Messages', css: '.mention-role-dot{display:none!important}' });

  // Composer
  Y.add({ id: 'hide-gif-footer', name: 'Hide the GIF footer', desc: 'Hides the line under the GIF picker.', category: 'Composer', css: '.gif-picker-foot{display:none!important}' });
  Y.add({ id: 'compact-emoji-cells', name: 'Compact emoji grid', desc: 'Smaller emoji cells in the picker.', category: 'Composer', css: '.emoji-cell{padding:2px!important}' });
  Y.add({ id: 'hide-composer-emoji-button', name: 'Hide composer emoji button', desc: 'Hides the emoji button beside the text box.', category: 'Composer', css: '.eb-button-emoji{display:none!important}' });

  // Sidebar
  Y.add({ id: 'hide-rail-labels', name: 'Hide server labels', desc: 'Hides the names under the server icons.', category: 'Sidebar', css: '.rail-label-text{display:none!important}' });
  Y.add({ id: 'hide-tab-badges', name: 'Hide tab counts', desc: 'Hides the number badges on the tabs.', category: 'Sidebar', css: '.nl-tab-badge{display:none!important}' });
  Y.add({ id: 'hide-rail-pills', name: 'Hide rail pills', desc: 'Hides the small status pills on the server rail.', category: 'Sidebar', css: '.rail-pill{display:none!important}' });
  Y.add({ id: 'slim-rail-folders', name: 'Slimmer folders', desc: 'Less padding on server folders.', category: 'Sidebar', css: '.rail-folder{padding:2px!important}' });

  // Members
  Y.add({ id: 'hide-role-chips', name: 'Hide role chips', desc: 'Hides the role labels under a profile name.', category: 'Members', css: '.role-chips{display:none!important}' });
  Y.add({ id: 'hide-profile-actions', name: 'Hide profile card actions', desc: 'Hides the buttons at the bottom of a profile card.', category: 'Members', css: '.profile-card-actions{display:none!important}' });
  Y.add({ id: 'smaller-profile-avatar', name: 'Smaller profile picture', desc: 'The picture on a profile card is a little smaller.', category: 'Members', css: '.profile-card-avatar{transform:scale(.8)!important}' });
  Y.add({ id: 'avatar-outline', name: 'Avatar outline', desc: 'A thin outline around avatars.', category: 'Members', css: '.avatar{outline:1px solid rgba(255,255,255,.12)!important;outline-offset:1px}' });

  // Voice
  Y.add({ id: 'hide-call-banner', name: 'Hide the call banner', desc: 'Hides the banner at the top of a call.', category: 'Voice', css: '.call-banner{display:none!important}' });
  Y.add({ id: 'hide-dm-call-people', name: 'Hide DM call people', desc: 'Hides the people list in a direct message call.', category: 'Voice', css: '.dm-call-people{display:none!important}' });
  Y.add({ id: 'compact-incoming-call', name: 'Compact incoming call', desc: 'A tighter card for an incoming call.', category: 'Voice', css: '.incoming-call{padding:6px!important}' });

  // Look
  Y.add({ id: 'tight-modal-body', name: 'Tighter dialogs', desc: 'Less space inside dialogs.', category: 'Look', css: '.modal-body{padding:12px 16px!important}' });
  Y.add({ id: 'compact-modal-foot', name: 'Compact dialog footer', desc: 'A slimmer footer on dialogs.', category: 'Look', css: '.modal-foot{padding:8px 14px!important}' });
})(window.YAPNAP);

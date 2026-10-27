// Extra plugins: small looks and tidy-ups for the top bar, messages, reactions, replies, the sidebar, the composer,
// the member list and voice. Each one is a CSS rule.
(function (Y) {
  'use strict';

  // Look
  Y.add({ id: 'hide-top-brand', name: 'Hide the top brand', desc: 'Hides the name and logo at the top of the chat.', category: 'Look', css: '.topbar-brand{display:none!important}' });
  Y.add({ id: 'compact-topbar', name: 'Compact top bar', desc: 'A shorter top bar.', category: 'Look', css: '.topbar{min-height:40px!important}' });
  Y.add({ id: 'flat-scrolled-header', name: 'Flat header when scrolled', desc: 'No shadow under the top bar when you scroll.', category: 'Look', css: '.scrolled{box-shadow:none!important}' });

  // Messages
  Y.add({ id: 'hide-pinned-bar', name: 'Hide the pinned bar', desc: 'Hides the pinned messages bar.', category: 'Messages', css: '.pinned{display:none!important}' });
  Y.add({ id: 'hide-typing-dots', name: 'Hide typing dots', desc: 'Hides the three dots that move while someone types.', category: 'Messages', css: '.typing-dots{display:none!important}' });
  Y.add({ id: 'hide-chat-loading', name: 'Hide chat loading', desc: 'Hides the loading message while a chat opens.', category: 'Messages', css: '.chat-loading{display:none!important}' });
  Y.add({ id: 'hide-reaction-count', name: 'Hide reaction counts', desc: 'Hides the number next to each reaction.', category: 'Messages', css: '.reaction-count{display:none!important}' });
  Y.add({ id: 'hide-reaction-tips', name: 'Hide reaction tips', desc: 'Hides the names that pop up over a reaction.', category: 'Messages', css: '.reaction-tip{display:none!important}' });
  Y.add({ id: 'hide-reply-spine', name: 'Hide the reply line', desc: 'Hides the line that joins a reply to its message.', category: 'Messages', css: '.reply-spine{display:none!important}' });
  Y.add({ id: 'hide-reply-author', name: 'Hide reply names', desc: 'Hides the name at the top of a reply preview.', category: 'Messages', css: '.reply-author{display:none!important}' });
  Y.add({ id: 'hide-message-times', name: 'Hide message times', desc: 'Hides the time next to each message.', category: 'Messages', css: '.msg-time{display:none!important}' });
  Y.add({ id: 'hide-ping-badge', name: 'Hide the ping badge', desc: 'Hides the ping indicator in the chat.', category: 'Messages', css: '.ping{display:none!important}' });
  Y.add({ id: 'bigger-reaction-emoji', name: 'Bigger reactions', desc: 'Larger emoji on reactions.', category: 'Messages', css: '.reaction-emoji{font-size:19px!important}' });
  Y.add({ id: 'muted-reply-text', name: 'Muted reply text', desc: 'Reply previews are a little fainter.', category: 'Messages', css: '.reply-text{opacity:.7!important}' });
  Y.add({ id: 'small-message-times', name: 'Small message times', desc: 'Smaller, fainter times.', category: 'Messages', css: '.msg-time{font-size:11px!important;opacity:.7!important}' });
  Y.add({ id: 'wider-reaction-gap', name: 'Wider reaction gap', desc: 'More space between reactions.', category: 'Messages', css: '.reaction-wrap{gap:8px!important}' });
  Y.add({ id: 'wide-chat', name: 'Wide chat', desc: 'The chat uses the whole width of the window.', category: 'Messages', css: '.chat-wrap{max-width:none!important}' });
  Y.add({ id: 'centred-typing-line', name: 'Centred typing line', desc: 'The "is typing" line sits in the middle.', category: 'Messages', css: '.typing-line{text-align:center!important}' });
  Y.add({ id: 'no-pinned-border', name: 'No pinned border', desc: 'Removes the border around the pinned bar.', category: 'Messages', css: '.pinned{border:0!important}' });
  Y.add({ id: 'compact-pinned', name: 'Compact pinned bar', desc: 'A slimmer pinned bar.', category: 'Messages', css: '.pinned{padding:4px 10px!important}' });
  Y.add({ id: 'thick-reply-bar', name: 'Thick reply bar', desc: 'A thicker line at the side of a reply.', category: 'Messages', css: '.reply-bar{border-left-width:4px!important}' });
  Y.add({ id: 'compact-reply-bar', name: 'Compact reply bar', desc: 'A tighter reply bar.', category: 'Messages', css: '.reply-bar{padding:4px 8px!important}' });
  Y.add({ id: 'spaced-messages-bottom', name: 'Space above the composer', desc: 'More room between the last message and the composer.', category: 'Messages', css: '.messages-inner{padding-bottom:24px!important}' });
  Y.add({ id: 'thin-message-scroll', name: 'Thin message scrollbar', desc: 'A slimmer scrollbar in the chat.', category: 'Messages', css: '.messages{scrollbar-width:thin!important}' });

  // Sidebar
  Y.add({ id: 'hide-online-count', name: 'Hide the online count', desc: 'Hides the number of people online.', category: 'Sidebar', css: '.online{display:none!important}' });
  Y.add({ id: 'compact-user-bar', name: 'Compact user bar', desc: 'A tighter bar with your name at the bottom.', category: 'Sidebar', css: '.user-bar{padding:4px 8px!important}' });
  Y.add({ id: 'transparent-user-bar', name: 'Clear user bar', desc: 'The bar with your name has no background.', category: 'Sidebar', css: '.user-bar{background:transparent!important}' });
  Y.add({ id: 'thin-sidebar-scroll', name: 'Thin sidebar scrollbar', desc: 'A slimmer scrollbar in the sidebar.', category: 'Sidebar', css: '.sidebar-scroll{scrollbar-width:thin!important}' });

  // Composer
  Y.add({ id: 'hide-gift-button', name: 'Hide the gift button', desc: 'Hides the gift button next to the composer.', category: 'Composer', css: '.plus-gift-btn{display:none!important}' });
  Y.add({ id: 'hide-composer-tools', name: 'Hide composer tools', desc: 'Hides the row of tools under the composer.', category: 'Composer', css: '.composer-tools{display:none!important}' });
  Y.add({ id: 'hide-gif-ad', name: 'Hide GIF ads', desc: 'Hides the ad in the GIF picker.', category: 'Composer', css: '.gif-ad{display:none!important}' });
  Y.add({ id: 'red-composer-errors', name: 'Clear composer errors', desc: 'Errors under the composer are a clearer red.', category: 'Composer', css: '.composer-err{color:#ff6b6b!important}' });
  Y.add({ id: 'round-gif-picker', name: 'Round GIF picker', desc: 'Rounded corners on the GIF picker.', category: 'Composer', css: '.gif-picker{border-radius:14px!important;overflow:hidden}' });
  Y.add({ id: 'round-gif-tiles', name: 'Round GIF tiles', desc: 'Rounded corners on each GIF.', category: 'Composer', css: '.gif-tile{border-radius:10px!important;overflow:hidden}' });

  // Members
  Y.add({ id: 'hide-badge-tips', name: 'Hide badge tips', desc: 'Hides the small tip that appears over a badge.', category: 'Members', css: '.badge-tip{display:none!important}' });
  Y.add({ id: 'hide-members-phone', name: 'Hide the phone icon', desc: 'Hides the phone icon in the member list header.', category: 'Members', css: '.members-head-phone{display:none!important}' });
  Y.add({ id: 'bigger-badges', name: 'Bigger badges', desc: 'Badge icons are a little larger.', category: 'Members', css: '.badge img{width:18px!important;height:18px!important}' });
  Y.add({ id: 'thin-members-scroll', name: 'Thin member scrollbar', desc: 'A slimmer scrollbar in the member list.', category: 'Members', css: '.members-panel{scrollbar-width:thin!important}' });
  Y.add({ id: 'compact-member-rows', name: 'Compact member rows', desc: 'Less space between people in the member list.', category: 'Members', css: '.member-row{padding:4px 8px!important}' });

  // Voice
  Y.add({ id: 'hide-voice-button', name: 'Hide the voice button', desc: 'Hides the voice chat button.', category: 'Voice', css: '.voice-chat-btn{display:none!important}' });
  Y.add({ id: 'hide-voice-dot', name: 'Hide the voice dot', desc: 'Hides the dot that shows you are in voice.', category: 'Voice', css: '.voice-chat-dot{display:none!important}' });
  Y.add({ id: 'hide-voice-header', name: 'Hide the voice header', desc: 'Hides the header of the voice panel.', category: 'Voice', css: '.voice-chat-head{display:none!important}' });
  Y.add({ id: 'compact-voice-head', name: 'Compact voice header', desc: 'A tighter voice panel header.', category: 'Voice', css: '.voice-chat-head{padding:6px 10px!important}' });
  Y.add({ id: 'thin-voice-scroll', name: 'Thin voice scrollbar', desc: 'A slimmer scrollbar in the voice panel.', category: 'Voice', css: '.voice-chat-panel{scrollbar-width:thin!important}' });
})(window.YAPNAP);

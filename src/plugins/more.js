// More plugins: flatter surfaces, calmer text and tighter details. Every selector here is a class name found in the
// chat site's own CSS (check/site-classes.json), and the check script fails if one of them goes missing.
(function (Y) {
  'use strict';

  Y.add({
    id: 'text-shadow-off',
    name: 'No text shadows',
    desc: 'Removes the soft shadow behind text. Crisper on bright screens.',
    category: 'Look',
    css: '*{text-shadow:none!important}'
  });

  Y.add({
    id: 'crisp-text',
    name: 'Crisp text',
    desc: 'Smooths the edges of letters, which reads better at small sizes.',
    category: 'Look',
    css: 'body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}'
  });

  Y.add({
    id: 'rounded-modals',
    name: 'Rounded windows',
    desc: 'Pop-up windows and settings get softer corners.',
    category: 'Look',
    css: '.modal{border-radius:14px!important}'
  });

  Y.add({
    id: 'flat-top-bar',
    name: 'Flat top bar',
    desc: 'The bar across the top loses its shadow and gets a thin divider instead.',
    category: 'Look',
    css: '.top-bar{box-shadow:none!important;border-bottom:1px solid var(--border)!important}'
  });

  Y.add({
    id: 'tabular-numbers',
    name: 'Even numbers',
    desc: 'Numbers line up in columns, so counts and times are easier to compare.',
    category: 'Access',
    css: 'body{font-variant-numeric:tabular-nums}'
  });

  Y.add({
    id: 'subtle-icon-buttons',
    name: 'Quiet icon buttons',
    desc: 'Small icon buttons are faint until you point at them.',
    category: 'Access',
    css: '.icon-btn{opacity:.72;transition:opacity .12s}.icon-btn:hover{opacity:1}'
  });

  Y.add({
    id: 'compact-reactions',
    name: 'Tighter reactions',
    desc: 'Less space between the emoji reactions under a message.',
    category: 'Messages',
    css: '.reactions{gap:4px!important}'
  });

  Y.add({
    id: 'square-reactions',
    name: 'Square reactions',
    desc: 'Reaction chips get square corners.',
    category: 'Messages',
    css: '.reaction{border-radius:4px!important}'
  });

  Y.add({
    id: 'mention-highlight-soft',
    name: 'Warm mention tint',
    desc: 'Messages that mention you get a faint warm background.',
    category: 'Messages',
    css: '.mention{background:rgba(255,107,74,.08)!important}'
  });

  Y.add({
    id: 'muted-message-times',
    name: 'Muted message times',
    desc: 'Times next to messages are dimmer, so the text stands out.',
    category: 'Messages',
    css: '.msg-time{opacity:.6}'
  });

  Y.add({
    id: 'italic-edited-label',
    name: 'Italic edited label',
    desc: 'The "edited" tag on a changed message is italic.',
    category: 'Messages',
    css: '.msg-edited{font-style:italic}'
  });

  Y.add({
    id: 'slim-typing-line',
    name: 'Slim typing line',
    desc: 'The "is typing" line above the composer is smaller.',
    category: 'Messages',
    css: '.typing-line{padding:0!important;font-size:12px!important}'
  });

  Y.add({
    id: 'roomy-composer-input',
    name: 'Roomier composer',
    desc: 'More space inside the text box you type in.',
    category: 'Composer',
    css: '.composer .input{padding:10px 14px!important}'
  });

  Y.add({
    id: 'round-send-button',
    name: 'Round send button',
    desc: 'The send button is a circle.',
    category: 'Composer',
    css: '.send-btn{border-radius:50%!important}'
  });

  Y.add({
    id: 'composer-no-shadow',
    name: 'Flat composer',
    desc: 'Removes the shadow under the composer.',
    category: 'Composer',
    css: '.composer{box-shadow:none!important}'
  });

  Y.add({
    id: 'dim-read-channels',
    name: 'Dim read channels',
    desc: 'Channels with nothing new are a little fainter. The one you are in stays bright.',
    category: 'Sidebar',
    css: '.channel-row:not(.unread){opacity:.82}.channel-row.active{opacity:1!important}'
  });

  Y.add({
    id: 'hide-section-labels',
    name: 'Hide section labels',
    desc: 'Removes the small headings above channel groups.',
    category: 'Sidebar',
    css: '.section-label{display:none!important}'
  });

  Y.add({
    id: 'flat-server-banner',
    name: 'Square server banner',
    desc: 'The banner across the top of a server has square corners.',
    category: 'Sidebar',
    css: '.server-banner{border-radius:0!important}'
  });

  Y.add({
    id: 'square-member-avatars',
    name: 'Square member avatars',
    desc: 'Pictures in the member list get rounded square corners.',
    category: 'Members',
    css: '.members-panel .avatar{border-radius:6px!important}'
  });

  Y.add({
    id: 'compact-context-menus',
    name: 'Compact right-click menus',
    desc: 'Right-click menus have less padding.',
    category: 'Members',
    css: '.ctx-menu{padding:4px!important}'
  });
})(window.YAPNAP);

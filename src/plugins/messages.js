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
    id: 'message-dividers',
    name: 'Message dividers',
    desc: 'A thin line between messages.',
    category: 'Messages',
    css: '.msg + .msg{border-top:1px solid var(--border)}'
  });

  Y.add({
    id: 'striped-messages',
    name: 'Striped messages',
    desc: 'Every other message gets a slightly lighter background.',
    category: 'Messages',
    css: '.msg:nth-child(even){background:rgba(255,255,255,.025)}'
  });

  Y.add({
    id: 'bubble-messages',
    name: 'Bubble messages',
    desc: 'Each message body sits on a rounded card.',
    category: 'Messages',
    css: '.msg-body{background:var(--bg-elev);border-radius:12px;padding:6px 10px}'
  });

  Y.add({
    id: 'message-hover-highlight',
    name: 'Hover highlight',
    desc: 'Light background on the message under the pointer.',
    category: 'Messages',
    css: '.msg:hover{background:rgba(255,255,255,.035)}'
  });

  Y.add({
    id: 'hide-message-toolbar',
    name: 'Hide message toolbar',
    desc: 'Hides the reply, react and more buttons that appear on hover.',
    category: 'Messages',
    css: '.msg-actions{display:none!important}'
  });

  Y.add({
    id: 'hide-edited-label',
    name: 'Hide edited label',
    desc: 'Removes the "edited" tag from changed messages.',
    category: 'Messages',
    css: '.msg-edited{display:none!important}'
  });

  Y.add({
    id: 'hide-reactions',
    name: 'Hide reactions',
    desc: 'Hides the emoji reactions under messages.',
    category: 'Messages',
    css: '.reactions{display:none!important}'
  });

  Y.add({
    id: 'hide-typing-line',
    name: 'Hide typing line',
    desc: 'Hides the "someone is typing" line above the composer.',
    category: 'Messages',
    css: '.typing-line{display:none!important}'
  });

  Y.add({
    id: 'hide-hover-times',
    name: 'Hide hover times',
    desc: 'Hides the small time that appears beside a message on hover.',
    category: 'Messages',
    css: '.msg-hover-time{display:none!important}'
  });

  Y.add({
    id: 'always-show-times',
    name: 'Always show times',
    desc: 'Keeps the time next to every message, not only on hover.',
    category: 'Messages',
    css: '.msg-time{opacity:1!important;visibility:visible!important}'
  });

  Y.add({
    id: 'hide-link-images',
    name: 'Hide link previews',
    desc: 'Hides the picture previews that links bring with them.',
    category: 'Messages',
    css: '.msg-linkimgs{display:none!important}'
  });

  Y.add({
    id: 'hide-message-authors',
    name: 'Hide message names',
    desc: 'Hides the name above each message. Good for a clean read-only feed.',
    category: 'Messages',
    css: '.msg-author{display:none!important}'
  });

  Y.add({
    id: 'monospace-messages',
    name: 'Monospace messages',
    desc: 'Message text in a fixed-width font.',
    category: 'Messages',
    css: '.msg-text{font-family:ui-monospace,Menlo,Consolas,monospace!important}'
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
    id: 'full-width-messages',
    name: 'Full-width messages',
    desc: 'Lets message bodies use the whole chat width.',
    category: 'Messages',
    css: '.msg-body{max-width:none!important}'
  });

  Y.add({
    id: 'wrap-code-blocks',
    name: 'Wrap code blocks',
    desc: 'Long code lines wrap instead of scrolling sideways.',
    category: 'Messages',
    css: '.msg-text pre{white-space:pre-wrap!important;word-break:break-word}'
  });

  Y.add({
    id: 'stronger-mentions',
    name: 'Stronger mentions',
    desc: 'Messages that mention you get a clear accent bar.',
    category: 'Messages',
    css: '.mention{box-shadow:inset 3px 0 0 var(--accent)}'
  });

  Y.add({
    id: 'dim-reply-previews',
    name: 'Dim reply previews',
    desc: 'Quoted replies are shown faded so the new message stands out.',
    category: 'Messages',
    css: '.reply-text{opacity:.6}'
  });

  Y.add({
    id: 'big-emoji',
    name: 'Bigger emoji in messages',
    desc: 'Emoji inside message text are drawn larger.',
    category: 'Messages',
    css: '.msg-text .emoji{font-size:1.5em}'
  });

  Y.add({
    id: 'square-message-avatars',
    name: 'Square message avatars',
    desc: 'Avatars next to messages get square corners.',
    category: 'Messages',
    css: '.msg .avatar{border-radius:4px!important}'
  });

  Y.add({
    id: 'hide-message-avatars',
    name: 'Hide message avatars',
    desc: 'Removes the picture beside each message, for a dense IRC-style feed.',
    category: 'Messages',
    css: '.msg .avatar{display:none!important}'
  });
})(window.YAPNAP);

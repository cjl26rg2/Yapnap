// Access: easier reading, clearer focus, and larger targets.
(function (Y) {
  'use strict';

  Y.add({
    id: 'roomier-text',
    name: 'Roomier message text',
    desc: 'More line spacing and a little letter spacing in messages.',
    category: 'Access',
    css: '.msg-text{line-height:1.7;letter-spacing:.01em}'
  });

  Y.add({
    id: 'large-click-targets',
    name: 'Larger icon buttons',
    desc: 'Small icon buttons get a bigger clickable area.',
    category: 'Access',
    css: '.icon-btn{min-width:36px!important;min-height:36px!important}'
  });

  Y.add({
    id: 'high-contrast-selection',
    name: 'High contrast selection',
    desc: 'Selected text uses the accent colour, so it is easy to see.',
    category: 'Access',
    css: '::selection{background:var(--accent)!important;color:var(--on-accent)!important}'
  });

  Y.add({
    id: 'bold-names',
    name: 'Bold names',
    desc: 'Names above messages are heavier.',
    category: 'Access',
    css: '.msg-author{font-weight:800!important}'
  });

  Y.add({
    id: 'visible-focus',
    name: 'Visible focus ring',
    desc: 'A clear outline on whatever has keyboard focus.',
    category: 'Access',
    css: ':focus-visible{outline:2px solid var(--accent)!important;outline-offset:2px}'
  });

  Y.add({
    id: 'underline-links',
    name: 'Underlined links',
    desc: 'Links in messages are underlined, so they are never mistaken for text.',
    category: 'Access',
    css: '.msg-text a{text-decoration:underline!important}'
  });

  Y.add({
    id: 'clear-placeholders',
    name: 'Clear placeholder text',
    desc: 'The grey hint text in the composer is easier to read.',
    category: 'Access',
    css: '.composer .input::placeholder{opacity:.85}'
  });

  Y.add({
    id: 'wide-scrollbars',
    name: 'Wide scrollbars',
    desc: 'Scrollbars are wide enough to grab with a mouse or touchpad.',
    category: 'Access',
    css: '::-webkit-scrollbar{width:12px;height:12px}'
  });
})(window.YAPNAP);

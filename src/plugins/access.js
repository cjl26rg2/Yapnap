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
    id: 'bold-names',
    name: 'Bold names',
    desc: 'Names above messages are heavier.',
    category: 'Access',
    css: '.msg-author{font-weight:800!important}'
  });


  Y.add({
    id: 'underline-links',
    name: 'Underlined links',
    desc: 'Links in messages are underlined, so they are never mistaken for text.',
    category: 'Access',
    css: '.msg-text a{text-decoration:underline!important}'
  });


})(window.YAPNAP);

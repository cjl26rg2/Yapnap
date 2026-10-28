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
    id: 'round-send-button',
    name: 'Round send button',
    desc: 'The send button is a circle.',
    category: 'Composer',
    css: '.send-btn{border-radius:50%!important}'
  });


  Y.add({
    id: 'dim-read-channels',
    name: 'Dim read channels',
    desc: 'Channels with nothing new are a little fainter. The one you are in stays bright.',
    category: 'Sidebar',
    css: '.channel-row:not(.unread){opacity:.82}.channel-row.active{opacity:1!important}'
  });




})(window.YAPNAP);

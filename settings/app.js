// The fallback settings window: the Yapnap pages, in a window of their own, with the same four entries.
(function () {
  'use strict';
  var side = document.getElementById('side');
  var host = document.getElementById('root');
  var handle = window.YAPNAP_PANEL.mount(host, window.yapnap);
  window.YAPNAP_PANEL.pages.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = window.YAPNAP_PANEL.titles[p];
    b.setAttribute('data-page', p);
    b.addEventListener('click', function () {
      handle.show(p);
      Array.prototype.forEach.call(side.querySelectorAll('button'), function (x) { x.setAttribute('aria-current', String(x === b)); });
    });
    side.appendChild(b);
  });
  side.firstChild.setAttribute('aria-current', 'true');
})();

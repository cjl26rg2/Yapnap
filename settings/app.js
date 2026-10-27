// The fallback settings window: the Yapnap pages, in a window of their own, with the same four entries.
(function () {
  'use strict';
  var side = document.getElementById('side');
  var host = document.getElementById('root');
  // The brand mark comes from the same art as the rest of Yapnap. It is decoration, so it has no alt text.
  var brand = side.querySelector('.side-brand');
  if (brand && window.YAPNAP_ART) {
    var logo = document.createElement('img');
    logo.alt = '';
    logo.width = 24;
    logo.height = 24;
    logo.src = window.YAPNAP_ART.src('yapnap-logo');
    brand.insertBefore(logo, brand.firstChild);
  }
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
  side.querySelector('button').setAttribute('aria-current', 'true');
})();

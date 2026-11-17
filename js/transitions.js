(function () {
  'use strict';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CURTAIN_COVER_MS = 480;
  function isInternalLink(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target === '_blank') return false;
    if (anchor.hostname !== location.hostname) return false;
    if (anchor.href === location.href) return false;
    var ext = anchor.pathname.split('.').pop().toLowerCase();
    if (['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'zip'].indexOf(ext) !== -1) return false;
    if (anchor.pathname === location.pathname && anchor.hash) return false;
    return true;
  }
  if (prefersReducedMotion) return;
  var curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.id = 'page-curtain';
  document.body.appendChild(curtain);
  function playCurtainIn() {
    curtain.classList.remove('is-lifting', 'is-dropping');
    curtain.classList.add('is-covering');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        curtain.classList.add('is-lifting');
        document.body.classList.add('page-enter');
        setTimeout(function () {
          curtain.classList.remove('is-covering', 'is-lifting');
        }, 850);
      });
    });
  }
  playCurtainIn();
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a');
    if (!anchor || !isInternalLink(anchor)) return;
    e.preventDefault();
    var targetUrl = anchor.href;
    if (curtain.classList.contains('is-dropping')) return;
    curtain.classList.remove('is-lifting', 'is-covering');
    curtain.classList.add('is-dropping');
    setTimeout(function () {
      window.location.href = targetUrl;
    }, CURTAIN_COVER_MS);
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('page-enter');
      playCurtainIn();
    }
  });
})();

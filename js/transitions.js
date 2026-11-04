// ============================================================
// Transitions entre les pages : un rideau plein écran qui vient
// couvrir la page (survol éditorial) plutôt qu'un glissement brut.
//  - au chargement : le rideau se soulève, la page se dévoile
//  - au clic sur un lien interne : le rideau descend, puis on navigue
//  - l'élément rideau est créé ici, aucun HTML n'a besoin de le déclarer
// ============================================================
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CURTAIN_COVER_MS = 480; // durée de la descente avant navigation

  // Pages internes du portfolio (même origine, pas de hash seul, pas de PDF)
  function isInternalLink(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target === '_blank') return false;
    if (anchor.hostname !== location.hostname) return false;
    if (anchor.href === location.href) return false;
    // Ignorer les liens vers des fichiers non-HTML (PDF, images…)
    var ext = anchor.pathname.split('.').pop().toLowerCase();
    if (['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'zip'].indexOf(ext) !== -1) return false;
    // Ignorer les liens purement ancres sur la même page
    if (anchor.pathname === location.pathname && anchor.hash) return false;
    return true;
  }

  if (prefersReducedMotion) return; // navigation classique, sans animation

  // ---------- Création du rideau ----------
  var curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.id = 'page-curtain';
  document.body.appendChild(curtain);

  // ---------- Entrée : le rideau couvre puis se soulève ----------
  function playCurtainIn() {
    curtain.classList.remove('is-lifting', 'is-dropping');
    curtain.classList.add('is-covering');

    // Deux frames pour s'assurer que l'état "couvert" est dessiné
    // avant de lancer la transition de soulèvement
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

  // ---------- Sortie : le rideau descend puis on navigue ----------
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a');
    if (!anchor || !isInternalLink(anchor)) return;

    e.preventDefault();
    var targetUrl = anchor.href;

    // Ne pas empiler des descentes si l'utilisateur reclique
    if (curtain.classList.contains('is-dropping')) return;

    curtain.classList.remove('is-lifting', 'is-covering');
    curtain.classList.add('is-dropping');

    setTimeout(function () {
      window.location.href = targetUrl;
    }, CURTAIN_COVER_MS);
  });

  // ---------- Retour arrière du navigateur (cache bfcache) ----------
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('page-enter');
      playCurtainIn();
    }
  });
})();

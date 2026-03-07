// Transitions en glissement horizontal entre les pages du portfolio
(function () {
  'use strict';

  var TRANSITION_DURATION = 400; // ms — doit correspondre aux animations CSS

  // Ordre des pages dans le menu de navigation
  var PAGE_ORDER = [
    'index.html',
    'diplomes.html',
    'formation.html',
    'stages.html',
    'cv.html',
    'veilletechno.html',
    'presentationperso.html',
    'contact.html'
  ];

  // Récupérer l'index d'une page dans le menu
  function getPageIndex(pathname) {
    var filename = pathname.split('/').pop().toLowerCase() || 'index.html';
    for (var i = 0; i < PAGE_ORDER.length; i++) {
      if (filename === PAGE_ORDER[i]) return i;
    }
    return -1;
  }

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

  // Au chargement, appliquer l'animation d'entrée selon la direction stockée
  var direction = sessionStorage.getItem('slideDirection');
  if (direction === 'left') {
    document.body.classList.add('page-enter-left');
  } else if (direction === 'right') {
    document.body.classList.add('page-enter-right');
  }
  // Nettoyer après utilisation
  sessionStorage.removeItem('slideDirection');

  // Intercepter les clics sur les liens internes
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;
    if (!isInternalLink(anchor)) return;

    e.preventDefault();
    var targetUrl = anchor.href;

    // Déterminer la direction du glissement
    var currentIndex = getPageIndex(location.pathname);
    var targetIndex = getPageIndex(anchor.pathname);

    if (targetIndex !== -1 && currentIndex !== -1 && targetIndex > currentIndex) {
      // Navigation vers la droite → la page sort vers la gauche
      document.body.classList.add('page-exit-left');
      sessionStorage.setItem('slideDirection', 'right');
    } else if (targetIndex !== -1 && currentIndex !== -1 && targetIndex < currentIndex) {
      // Navigation vers la gauche → la page sort vers la droite
      document.body.classList.add('page-exit-right');
      sessionStorage.setItem('slideDirection', 'left');
    } else {
      // Fallback : glissement par défaut vers la gauche
      document.body.classList.add('page-exit-left');
      sessionStorage.setItem('slideDirection', 'right');
    }

    // Naviguer une fois l'animation terminée
    setTimeout(function () {
      window.location.href = targetUrl;
    }, TRANSITION_DURATION);
  });

  // Gérer le retour arrière du navigateur (bouton précédent)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      // Page restaurée depuis le cache (retour arrière) : relancer l'entrée
      document.body.classList.remove('page-exit-left');
      document.body.classList.remove('page-exit-right');
      document.body.classList.remove('page-exit');
    }
  });
})();

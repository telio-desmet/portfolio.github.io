// Gestion des cartes d'articles et de la modal
// Ajoute ouverture/fermeture, insertion du contenu (logo, titre, résumé) et lien vers l'article

document.addEventListener('DOMContentLoaded', function () {
  const cards = Array.from(document.querySelectorAll('.card'));
  const modal = document.getElementById('article-modal');
  const modalOverlay = modal && modal.querySelector('.modal-overlay');
  const modalContent = modal && modal.querySelector('.modal-content');
  const modalClose = modal && modal.querySelector('.modal-close');
  const modalLogo = modal && modal.querySelector('.modal-logo');
  const modalTitle = modal && modal.querySelector('.modal-title');
  const modalSummary = modal && modal.querySelector('.modal-summary');
  const btnOpen = modal && modal.querySelector('.btn-open');

  // éléments du document à masquer aux lecteurs d'écran quand la modal est ouverte
  const hideableSelectors = ['main', 'header', 'nav', 'footer'];
  const hideable = Array.from(document.querySelectorAll(hideableSelectors.join(',')));

  let lastFocused = null;
  let resizeHandler = null;

  if (!modal) return; // aucun modal trouvé

  function setAriaHiddenOnPage(hidden) {
    hideable.forEach(el => {
      if (hidden) el.setAttribute('aria-hidden', 'true');
      else el.removeAttribute('aria-hidden');
    });
  }

  function trapFocus(e) {
    if (modal.getAttribute('aria-hidden') === 'true') return;
    const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) { // shift + tab
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else { // tab
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  function updateFullscreenClass() {
    // basculer la modal en plein écran pour petits écrans
    if (!modal) return;
    if (window.innerWidth <= 520) modal.classList.add('fullscreen');
    else modal.classList.remove('fullscreen');
  }

  function openModal(card) {
    const url = card.dataset.url || '#';
    const source = card.dataset.source || '';
    const dataSummary = card.dataset.summary || '';
    // prefer visible card summary if present
    const visibleSummaryNode = card.querySelector('.card-summary');
    const summary = (visibleSummaryNode && visibleSummaryNode.textContent.trim()) || dataSummary || '';
    const titleEl = card.querySelector('.card-title');
    const title = titleEl ? titleEl.textContent.trim() : source || 'Article';
    const logoNode = card.querySelector('.card-logo');
    const logoText = logoNode ? (logoNode.textContent || source.slice(0, 2).toUpperCase()) : source.slice(0, 2).toUpperCase();

    // remplir la modal
    if (modalLogo) modalLogo.textContent = logoText;
    if (modalTitle) modalTitle.textContent = title;
    if (modalSummary) modalSummary.textContent = summary;
    if (btnOpen) btnOpen.href = url;

    // affichage
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';

    // accessibilité: masquer le reste et focus
    setAriaHiddenOnPage(true);
    lastFocused = document.activeElement;
    if (modalClose) modalClose.focus();

    // NE PAS bloquer le scroll - permettre le défilement dans la modal
    // document.body.style.overflow = 'hidden';

    // écoute clavier pour trap focus
    document.addEventListener('keydown', trapFocus);

    // gérer plein écran selon la taille et quand on redimensionne
    updateFullscreenClass();
    resizeHandler = () => updateFullscreenClass();
    window.addEventListener('resize', resizeHandler);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    // restaurer le scroll (plus nécessaire car on ne le bloque plus)
    // document.body.style.overflow = '';
    // restaurer visibilité pour lecteurs d'écran
    setAriaHiddenOnPage(false);
    // remettre le focus sur l'élément précédemment actif
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    // retirer écoute clavier trap
    document.removeEventListener('keydown', trapFocus);

    // retirer resize handler
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }

    // retirer la classe fullscreen
    modal.classList.remove('fullscreen');
  }

  // ouvrir la modal au clic ou au clavier (Enter / Space)
  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openModal(card);
      }
    });
  });

  // fermer via le bouton fermer
  if (modalClose) modalClose.addEventListener('click', closeModal);

  // fermer en cliquant sur l'overlay
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  // gestion clavier: Echap pour fermer
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  // empêcher la propagation du clic sur le contenu pour ne pas fermer
  if (modalContent) modalContent.addEventListener('click', (ev) => ev.stopPropagation());

});

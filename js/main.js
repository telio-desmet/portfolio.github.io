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
  const hideableSelectors = ['main', 'header', 'nav', 'footer'];
  const hideable = Array.from(document.querySelectorAll(hideableSelectors.join(',')));
  let lastFocused = null;
  let resizeHandler = null;
  if (!modal) return;
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
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }
  function updateFullscreenClass() {
    if (!modal) return;
    if (window.innerWidth <= 520) modal.classList.add('fullscreen');
    else modal.classList.remove('fullscreen');
  }
  function openModal(card) {
    const url = card.dataset.url || '#';
    const source = card.dataset.source || '';
    const dataSummary = card.dataset.summary || '';
    const visibleSummaryNode = card.querySelector('.card-summary');
    const summary = (visibleSummaryNode && visibleSummaryNode.textContent.trim()) || dataSummary || '';
    const titleEl = card.querySelector('.card-title');
    const title = titleEl ? titleEl.textContent.trim() : source || 'Article';
    const logoNode = card.querySelector('.card-logo');
    const logoText = logoNode ? (logoNode.textContent || source.slice(0, 2).toUpperCase()) : source.slice(0, 2).toUpperCase();
    if (modalLogo) modalLogo.textContent = logoText;
    if (modalTitle) modalTitle.textContent = title;
    if (modalSummary) modalSummary.textContent = summary;
    if (btnOpen) {
      if (url === '#') btnOpen.style.display = 'none';
      else {
        btnOpen.style.display = '';
        btnOpen.href = url;
      }
    }
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    setAriaHiddenOnPage(true);
    lastFocused = document.activeElement;
    if (modalClose) modalClose.focus();
    document.addEventListener('keydown', trapFocus);
    updateFullscreenClass();
    resizeHandler = () => updateFullscreenClass();
    window.addEventListener('resize', resizeHandler);
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    setAriaHiddenOnPage(false);
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    document.removeEventListener('keydown', trapFocus);
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    modal.classList.remove('fullscreen');
  }
  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openModal(card);
      }
    });
  });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
  if (modalContent) modalContent.addEventListener('click', (ev) => ev.stopPropagation());
});

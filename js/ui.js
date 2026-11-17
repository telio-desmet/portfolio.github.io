(function () {
  'use strict';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var THEMES = { dark: 'dark', light: 'light' };
  var STORAGE_KEY = 'pf-theme';
  function applyTheme(theme) {
    document.documentElement.classList.toggle('light-mode', theme === THEMES.light);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {  }
  }
  function currentTheme() {
    return document.documentElement.classList.contains('light-mode') ? THEMES.light : THEMES.dark;
  }
  var themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === THEMES.light ? THEMES.dark : THEMES.light);
    });
  }
  var nav = document.querySelector('nav.site-nav');
  if (nav) {
    var navToggle = nav.querySelector('.nav-toggle');
    function closeNav() {
      nav.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
    if (navToggle) {
      navToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeNav);
      });
      document.addEventListener('click', function (e) {
        if (nav.classList.contains('open') && !nav.contains(e.target)) closeNav();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
      });
    }
  }
  var progressBar = document.querySelector('.scroll-progress');
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    progressBar.style.width = (ratio * 100).toFixed(2) + '%';
  }
  function updateNavScrolled() {
    if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 12);
  }
  var toTopButtons = document.querySelectorAll('.to-top');
  function updateToTop() {
    if (!toTopButtons.length) return;
    var show = (window.scrollY || 0) > 480;
    toTopButtons.forEach(function (btn) {
      btn.classList.toggle('visible', show);
    });
  }
  toTopButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
  window.addEventListener('scroll', function () {
    updateProgress();
    updateNavScrolled();
    updateToTop();
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
  updateNavScrolled();
  updateToTop();
  var revealTargets = document.querySelectorAll('main > section, main > .content-row > section, .card, .project-card, .stage-card');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('visible');
          setTimeout(function () { el.classList.remove('reveal'); }, 1050);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el, index) {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', Math.min(index % 8, 7) * 70 + 'ms');
      observer.observe(el);
    });
  }
  var typedEl = document.querySelector('[data-typewriter]');
  if (typedEl && !prefersReducedMotion) {
    var fullText = typedEl.textContent.trim();
    typedEl.setAttribute('aria-label', fullText);
    typedEl.textContent = '';
    typedEl.setAttribute('data-typing', '');
    var pos = 0;
    var TYPE_DELAY = 55;
    (function type() {
      if (pos < fullText.length) {
        typedEl.textContent += fullText.charAt(pos++);
        setTimeout(type, TYPE_DELAY + Math.random() * 45);
      } else {
        typedEl.removeAttribute('data-typing');
        typedEl.setAttribute('data-typing-done', '');
      }
    })();
  }
  var rotators = document.querySelectorAll('[data-rotator]');
  rotators.forEach(function (rotator) {
    var words = rotator.querySelectorAll('span');
    if (words.length < 1) return;
    if (words.length === 1 || prefersReducedMotion) {
      words[0].classList.add('current');
      return;
    }
    var current = 0;
    words[0].classList.add('current');
    setInterval(function () {
      words[current].classList.remove('current');
      current = (current + 1) % words.length;
      words[current].classList.add('current');
    }, 3200);
  });
  var spotlightTargets = document.querySelectorAll(
    '.card, .project-card, .stage-card'
  );
  if (!prefersReducedMotion) {
    spotlightTargets.forEach(function (el) {
      el.classList.add('spotlight');
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        el.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }
  if (canHover && !prefersReducedMotion) {
    var magneticButtons = document.querySelectorAll('.theme-toggle, .to-top');
    var MAGNET = 5;
    magneticButtons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        var dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        btn.style.transform = 'translate(' + (dx * MAGNET).toFixed(1) + 'px, ' + (dy * MAGNET).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }
  var CHIP_DOC_LINKS = {
    'css': 'https://developer.mozilla.org/fr/docs/Web/CSS',
    'dart': 'https://dart.dev/guides',
    'flask': 'https://flask.palletsprojects.com/',
    'gradle': 'https://docs.gradle.org/current/userguide/userguide.html',
    'html/css/js': 'https://developer.mozilla.org/fr/docs/Web',
    'html5': 'https://developer.mozilla.org/fr/docs/Web/HTML',
    'huggingface': 'https://huggingface.co/docs',
    'java': 'https://dev.java/learn/',
    'javascript': 'https://developer.mozilla.org/fr/docs/Web/JavaScript',
    'langchain': 'https://python.langchain.com/docs/introduction/',
    'ollama': 'https://ollama.com/',
    'php': 'https://www.php.net/manual/fr/',
    'python': 'https://docs.python.org/fr/3/',
    'symfony': 'https://symfony.com/doc/current/index.html',
    'twig': 'https://twig.symfony.com/doc/',
    'android studio': 'https://developer.android.com/studio/intro',
    'flutter': 'https://docs.flutter.dev/'
  };
  document.querySelectorAll('.chip').forEach(function (chip) {
    var label = (chip.textContent || '').toLowerCase().trim();
    var url = CHIP_DOC_LINKS[label];
    if (!url || chip.tagName === 'A') return;
    var link = document.createElement('a');
    link.className = chip.className;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = 'Documentation de ' + chip.textContent.trim();
    link.textContent = chip.textContent;
    link.addEventListener('click', function (e) {
      e.stopPropagation();
    });
    chip.replaceWith(link);
  });
  var identifyNav = document.querySelector('nav.site-nav');
  if (identifyNav && !identifyNav.querySelector('.nav-brand')) {
    var brand = document.createElement('a');
    brand.className = 'nav-brand';
    brand.href = 'index.html';
    brand.setAttribute('aria-label', "Retour à la page d'accueil — Télio Desmet");
    brand.innerHTML =
      '<span class="nav-brand-mark" aria-hidden="true">TD</span>' +
      '<span class="nav-brand-text">' +
      '  <span class="nav-brand-name">Télio Desmet</span>' +
      '  <span class="nav-brand-role">Bachelor 3 — Dév. web</span>' +
      '</span>';
    identifyNav.insertBefore(brand, identifyNav.firstChild);
  }
})();

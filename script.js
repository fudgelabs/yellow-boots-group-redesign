(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll-reveal: fade/rise sections in as they enter view ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
      io.observe(el);
    });
  }

  /* ---- anchor nav: land smoothly under the sticky header ----
     Native scroll (not a hijacked wheel/rAF loop) on purpose: a
     full scroll-hijack like Lenis feels premium but breaks trackpad
     momentum and can fight accessibility/automation tools — the
     inspiration site itself stalls under scripted scrolling for the
     same reason. Anchor jumps still get an eased scroll; everything
     else stays native. */
  const header = document.querySelector('.site-header');
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const targetEl = document.getElementById(id) || document.getElementById('top');
      if (!targetEl) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 12;
      const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
})();

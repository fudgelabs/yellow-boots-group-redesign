(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll-reveal: fade/rise sections in as they enter view ----
     Two tiers: [data-reveal-line] for the hero's masked line-by-line
     type reveal (tight stagger, own timing scale), [data-reveal] for
     everything else (looser stagger, reset per section so unrelated
     sections don't inherit each other's delay). */
  const lineEls = document.querySelectorAll('[data-reveal-line]');
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    lineEls.forEach((el) => el.classList.add('is-visible'));
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
    lineEls.forEach((el, i) => {
      el.style.transitionDelay = `${150 + i * 110}ms`;
      io.observe(el);
    });

    let sectionIndex = 0;
    let lastSection = null;
    revealEls.forEach((el) => {
      const section = el.closest('section');
      if (section !== lastSection) {
        sectionIndex = 0;
        lastSection = section;
      }
      el.style.transitionDelay = `${Math.min(sectionIndex, 6) * 80}ms`;
      sectionIndex += 1;
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

  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---- passive scroll parallax ----
     Reads scrollY to drift the hero contour line and background grid
     at a different rate than content. Read-only — never calls
     preventDefault, so it can't fight native/trackpad scroll the way
     the earlier wheel-hijack did. */
  if (!reduceMotion) {
    const contour = document.querySelector('.contour-line');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (contour) contour.style.transform = `translateY(${y * 0.12}px)`;
        document.body.style.backgroundPosition = `center ${-(y * 0.35)}px`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- service card hover-tilt ---- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.service-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--tiltX', `${(-py * 6).toFixed(2)}deg`);
        card.style.setProperty('--tiltY', `${(px * 6).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tiltX', '0deg');
        card.style.setProperty('--tiltY', '0deg');
      });
    });
  }
})();

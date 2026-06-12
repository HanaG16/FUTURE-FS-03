/* ============================================================
   ASCEND TOUR & CAR RENTAL — main.js
   ============================================================ */

/* ── 1. INTRO LOADER ───────────────────────────────────── */
(function () {
  var intro = document.getElementById('intro');
  if (!intro) { document.body.style.overflow = ''; return; }

  // Lock scroll while intro plays
  document.body.style.overflow = 'hidden';

  var t1, t2, fallback;

  function splitOpen() {
    intro.classList.add('splitting');
  }

  function removeIntro() {
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(fallback);
    intro.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Timeline: 3s logo display → curtains split → 1.15s later fully gone
  t1       = setTimeout(splitOpen,   3000);
  t2       = setTimeout(removeIntro, 4200);
  fallback = setTimeout(removeIntro, 5500); // hard safety net

  // Click anywhere to skip
  intro.addEventListener('click', function () {
    splitOpen();
    setTimeout(removeIntro, 1150);
  });
})();


/* ── 2. THEME TOGGLE ───────────────────────────────────── */
(function () {
  const html   = document.documentElement;
  const btn    = document.getElementById('themeToggle');
  const icon   = document.getElementById('themeIcon');
  const saved  = localStorage.getItem('ascend-theme') || 'light';

  html.setAttribute('data-theme', saved);
  setIcon(saved);

  if (!btn) return;
  btn.addEventListener('click', function () {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ascend-theme', next);
    setIcon(next);
  });

  function setIcon(t) {
    if (!icon) return;
    icon.className = t === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
})();


/* ── 3. NAVBAR SCROLL SHADOW ───────────────────────────── */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();


/* ── 4. HAMBURGER MENU ─────────────────────────────────── */
(function () {
  const burger = document.getElementById('hamburger');
  const links  = document.getElementById('navLinks');
  if (!burger || !links) return;

  burger.addEventListener('click', function () {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });

  links.querySelectorAll('.nav-link').forEach(function (l) {
    l.addEventListener('click', function () {
      links.classList.remove('open');
      burger.classList.remove('open');
    });
  });

  document.addEventListener('click', function (e) {
    const nav = document.getElementById('navbar');
    if (nav && !nav.contains(e.target)) {
      links.classList.remove('open');
      burger.classList.remove('open');
    }
  });
})();


/* ── 5. ACTIVE NAV LINK ON SCROLL ──────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(function (link) {
          const href = link.getAttribute('href') || '';
          link.classList.toggle('active', href === '#' + id || href.endsWith('#' + id));
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(function (s) { obs.observe(s); });
})();


/* ── 6. SCROLL REVEAL ──────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  els.forEach(function (el) { obs.observe(el); });
})();


/* ── 7. BACK TO TOP ────────────────────────────────────── */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── 8. CONTACT FORM — handled by forms.js ─────────────── */


/* ── 9. SMOOTH SCROLL ──────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    var navH = (document.getElementById('navbar') || {}).offsetHeight || 70;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
  });
});
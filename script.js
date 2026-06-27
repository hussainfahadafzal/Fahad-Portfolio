/* ── Scroll progress bar ── */
(function () {
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100).toFixed(2) + '%';
  }, { passive: true });
})();

/* ── Smooth scroll ── */
(function () {
  const NAV_H = 72;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scrollTo(target, duration) {
    const start = window.scrollY;
    const end   = target.getBoundingClientRect().top + window.scrollY - NAV_H;
    const dist  = end - start;
    if (Math.abs(dist) < 1) return;
    let t0 = null;

    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      window.scrollTo(0, start + dist * easeInOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const dist = Math.abs(el.getBoundingClientRect().top);
      const dur  = Math.min(Math.max(dist * 0.5, 400), 900);
      scrollTo(el, dur);
    });
  });
})();

/* ── Mobile nav toggle ── */
(function () {
  const toggle = document.getElementById('navToggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  function close() {
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── Dark / Light Mode (dark = default, body.light = light) ── */
(function () {
  const btn  = document.getElementById('themeBtn');
  const body = document.body;
  if (localStorage.getItem('theme') === 'light') body.classList.add('light');
  btn.addEventListener('click', () => {
    body.classList.toggle('light');
    localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark');
  });
})();

/* ── Nav: stuck on scroll ── */
(function () {
  const nav = document.getElementById('nav');
  const fn  = () => nav.classList.toggle('stuck', window.scrollY > 20);
  window.addEventListener('scroll', fn, { passive: true });
  fn();
})();

/* ── Active nav link ── */
(function () {
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function setActive() {
    let cur = sections[0];
    sections.forEach(s => { if (window.scrollY + 120 >= s.offsetTop) cur = s; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur.id));
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

/* ── Cursor glow ── */
(function () {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  let raf = null;
  window.addEventListener('mousemove', e => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      glow.style.left    = e.clientX + 'px';
      glow.style.top     = e.clientY + 'px';
      glow.style.opacity = '1';
    });
  }, { passive: true });
})();

/* ── Hero entrance — element-level stagger ── */
(function () {
  const photoCard = document.querySelector('.photo-card');
  const rightEls  = [
    '.avail-badge', '.hero-heading', '.hero-sub',
    '.hero-actions', '.skill-tags', '.hero-terminal'
  ].map(s => document.querySelector(s)).filter(Boolean);

  if (photoCard) {
    photoCard.style.opacity   = '0';
    photoCard.style.transform = 'translateX(-28px)';
  }

  rightEls.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = `opacity 0.75s ease ${0.2 + i * 0.1}s,
                            transform 0.75s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.1}s`;
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (photoCard) {
      photoCard.style.transition = 'opacity 0.9s ease 0.1s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s';
      photoCard.style.opacity   = '1';
      photoCard.style.transform = 'translateX(0)';
    }
    rightEls.forEach(el => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  }));
})();

/* ── Stats counter ── */
(function () {
  const stats = document.querySelectorAll('.hs-n');

  function countUp(el) {
    const raw     = el.textContent.trim();
    const suffix  = raw.replace(/[\d.]/g, '');
    const target  = parseFloat(raw);
    const isFloat = raw.includes('.');
    const dec     = isFloat ? (raw.split('.')[1] || '').length : 0;
    const dur     = 1300;
    const t0      = performance.now();

    function step(now) {
      const p    = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val  = ease * target;
      el.textContent = (isFloat ? val.toFixed(dec) : Math.floor(val)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }

  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    setTimeout(() => stats.forEach(countUp), 700);
    obs.disconnect();
  }, { threshold: 0.8 });
  obs.observe(heroStats);
})();

/* ── Section headings reveal ── */
(function () {
  const heads = document.querySelectorAll('.sec-head');

  heads.forEach(head => {
    const tag   = head.querySelector('.sec-tag');
    const title = head.querySelector('.sec-title');
    if (tag) {
      tag.style.opacity   = '0';
      tag.style.transform = 'translateY(10px)';
      tag.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }
    if (title) {
      title.style.opacity   = '0';
      title.style.transform = 'translateY(20px)';
      title.style.transition = 'opacity 0.65s ease 0.13s, transform 0.65s cubic-bezier(0.16,1,0.3,1) 0.13s';
    }
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const tag   = entry.target.querySelector('.sec-tag');
      const title = entry.target.querySelector('.sec-title');
      if (tag)   { tag.style.opacity = '1'; tag.style.transform = 'translateY(0)'; }
      if (title) { title.style.opacity = '1'; title.style.transform = 'translateY(0)'; }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  heads.forEach(el => obs.observe(el));
})();

/* ── About text paragraph stagger ── */
(function () {
  const aboutText = document.querySelector('.about-text');
  if (!aboutText) return;
  const items = [...aboutText.querySelectorAll('p'), aboutText.querySelector('.about-links')].filter(Boolean);

  items.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  });

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    items.forEach((el, i) => setTimeout(() => {
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    }, i * 110));
    obs.disconnect();
  }, { threshold: 0.15 });
  obs.observe(aboutText);
})();

/* ── About info cards slide-in ── */
(function () {
  const cards = document.querySelectorAll('.abt-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const d = parseInt(entry.target.dataset.delay || 0, 10);
      setTimeout(() => entry.target.classList.add('show'), d * 100);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  cards.forEach(el => obs.observe(el));
})();

/* ── Timeline reveal ── */
(function () {
  const items = document.querySelectorAll('.tl-item');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = parseInt(entry.target.dataset.i || 0, 10);
      setTimeout(() => entry.target.classList.add('show'), idx * 80);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => obs.observe(el));
})();

/* ── Project items reveal ── */
(function () {
  const items = document.querySelectorAll('.proj-item');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = parseInt(entry.target.dataset.pi || 0, 10);
      setTimeout(() => entry.target.classList.add('show'), idx * 60);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  items.forEach(el => obs.observe(el));
})();

/* ── Code skills rows reveal ── */
(function () {
  const rows = document.querySelectorAll('.csk-row');
  const container = document.getElementById('codeSkills');
  if (!container) return;

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    rows.forEach((row, i) => {
      const d = parseInt(row.dataset.d || i, 10);
      setTimeout(() => row.classList.add('show'), d * 85);
    });
    obs.disconnect();
  }, { threshold: 0.2 });
  obs.observe(container);
})();

/* ── Contact box reveal ── */
(function () {
  const box = document.querySelector('.contact-box');
  if (!box) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { box.classList.add('show'); obs.disconnect(); }
  }, { threshold: 0.15 });
  obs.observe(box);
})();

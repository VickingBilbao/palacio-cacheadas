/* ========================================================================
   PALÁCIO DAS CACHEADAS — APRESENTAÇÃO (deck claro)
   Progresso + nav de capítulos + reveals + navegação por teclado
   ===================================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const progressEl = document.querySelector('[data-progress]');
  const dots = [...document.querySelectorAll('[data-dot]')];
  const chapters = [...document.querySelectorAll('.chapter')];
  let ticking = false;

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const activeChapter = () => {
    const mid = window.scrollY + window.innerHeight * 0.5;
    let idx = 0;
    chapters.forEach((c, i) => { if (c.offsetTop <= mid) idx = i; });
    return idx;
  };

  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? clamp(window.scrollY / h, 0, 1) : 0;
    if (progressEl) progressEl.style.transform = `scaleX(${p})`;
    const a = activeChapter();
    dots.forEach((d, i) => d.classList.toggle('active', i === a));
    ticking = false;
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('load', update);
  update();

  /* nav: clique nos dots */
  dots.forEach(d => d.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(d.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* navegação por teclado (modo apresentação) */
  const go = i => {
    i = clamp(i, 0, chapters.length - 1);
    chapters[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  addEventListener('keydown', e => {
    if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) { e.preventDefault(); go(activeChapter() + 1); }
    else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(activeChapter() - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(chapters.length - 1); }
  });

  /* reveals */
  if (!reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.16 });
    document.querySelectorAll('[data-rise]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-rise]').forEach(el => el.classList.add('in'));
  }

  /* contadores (cap Os números) */
  const fmtN = (v, dec, sep) => { let s = dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toString(); if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return s; };
  const animateCount = el => {
    const target = parseFloat(el.dataset.count) || 0, dec = parseInt(el.dataset.decimals || '0', 10), sep = el.dataset.sep === '1';
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', dur = 1400; let t0 = null;
    const tick = now => { if (t0 === null) t0 = now; const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = pre + fmtN(target * e, dec, sep) + suf; if (p < 1) requestAnimationFrame(tick); else el.textContent = pre + fmtN(target, dec, sep) + suf; };
    requestAnimationFrame(tick);
  };
  if (!reduce) {
    const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } }), { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
  }

  /* peças ao vivo: escala o iframe desktop (1200px) pra caber na moldura */
  const fitDevices = () => {
    document.querySelectorAll('[data-device]').forEach(scr => {
      const inner = scr.querySelector('[data-device-inner]');
      if (inner) inner.style.transform = `scale(${scr.clientWidth / 1200})`;
    });
  };
  addEventListener('resize', fitDevices, { passive: true });
  addEventListener('load', fitDevices);
  fitDevices();
})();

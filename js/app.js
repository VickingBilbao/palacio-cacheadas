/* ========================================================================
   PALÁCIO DAS CACHEADAS — cacho-mola scrub + interações
   O scroll da página inteira controla o stretch da mola (frame 0→59)
   ===================================================================== */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* header + abertura: logo grande encolhe e ancora no header conforme rola */
  const header = document.querySelector('[data-header]');
  const brand = document.querySelector('[data-brandmark]');
  const headerLogo = document.querySelector('.hdr .logo');
  const hasIntro = !!(brand && headerLogo) && !reduced;

  if (hasIntro) {
    document.body.classList.add('has-intro');
    const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const dock = () => {
      const introH = window.innerHeight || 1;          // transição = 1 viewport de scroll
      const p = Math.min(Math.max(window.scrollY / introH, 0), 1);
      const e = easeInOut(p);
      const t = headerLogo.getBoundingClientRect();     // destino: lugar do logo no header
      const baseW = brand.offsetWidth || 1;
      const scale = 1 + (t.width / baseW - 1) * e;
      const tx = (t.left + t.width / 2 - window.innerWidth / 2) * e;
      const ty = (t.top + t.height / 2 - window.innerHeight / 2) * e;
      brand.style.transform = `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${scale})`;
      header.style.setProperty('--navop', e.toFixed(3));
      header.classList.toggle('scrolled', p > 0.9);
      brand.classList.toggle('docked', p > 0.98);
    };
    let tick = false;
    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(() => { dock(); tick = false; }); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', dock, { passive: true });
    addEventListener('load', dock);
    dock();
  } else {
    const setHdr = () => header && header.classList.toggle('scrolled', window.scrollY > 30);
    addEventListener('scroll', setHdr, { passive: true }); setHdr();
  }

  /* reveals */
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-rise]').forEach(el => io.observe(el));
  document.querySelectorAll('.hero [data-rise]').forEach((el, i) => setTimeout(() => el.classList.add('in'), 120 + i * 90));

  /* ---- cacho-mola: scrub frame-a-frame pelo scroll da página ---- */
  const canvas = document.querySelector('[data-curl-canvas]');
  if (canvas && !reduced) {
    const FRAMES = 60;
    const ctx = canvas.getContext('2d');
    const imgs = []; let loaded = 0, ready = false, cur = -1, sized = false;
    const pad = n => String(n).padStart(3, '0');
    const draw = idx => {
      const im = imgs[idx];
      if (!im || !im.complete || !im.naturalWidth || idx === cur) return;
      cur = idx; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
    };
    for (let i = 1; i <= FRAMES; i++) {
      const im = new Image();
      im.onload = () => {
        loaded++;
        // backing store = resolução real do frame (1920×1080), não os 300×150 default → nitidez no scrub
        if (!sized && im.naturalWidth) { canvas.width = im.naturalWidth; canvas.height = im.naturalHeight; sized = true; cur = -1; }
        if (loaded >= Math.min(14, FRAMES) && !ready) { ready = true; canvas.classList.add('ready'); }
        update();
      };
      im.src = `assets/spring/f_${pad(i)}.jpg`;
      imgs.push(im);
    }
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      draw(Math.min(FRAMES - 1, Math.round(p * (FRAMES - 1))));
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    addEventListener('resize', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    addEventListener('load', update);
    update();
  }
})();

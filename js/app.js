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
      const introDx = window.innerWidth <= 900 ? -window.innerWidth * 0.12 * (1 - e) : 0; // mobile: logo levemente à esquerda no intro, some ao ancorar
      const tx = (t.left + t.width / 2 - window.innerWidth / 2) * e + introDx;
      const ty = (t.top + t.height / 2 - window.innerHeight / 2) * e;
      brand.style.transform = `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${scale})`;
      header.style.setProperty('--navop', e.toFixed(3));
      document.documentElement.style.setProperty('--introp', e.toFixed(3)); // mobile: cacho desliza/some no scroll
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

  /* ---- cacho-mola: scrub do cacho escuro definido (sway) ---- */
  const CURLSETS = ['curl-dark'];
  const cset = CURLSETS[Math.floor(Math.random() * CURLSETS.length)];
  const curlFb = document.querySelector('[data-curl-fallback]');
  if (curlFb) curlFb.src = `assets/${cset}/f_001.jpg`;
  const canvas = document.querySelector('[data-curl-canvas]');
  if (canvas && !reduced && window.innerWidth > 900) { // mobile: sem scrub pesado — cacho estático (fallback) + recede CSS = fluido
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
      im.src = `assets/${cset}/f_${pad(i)}.jpg`;
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

  /* ---- Head Spa: vídeo scrubbado pelo scroll da seção ---- */
  const spa = document.querySelector('[data-spa-canvas]');
  if (spa && !reduced) {
    const SF = 48;
    const sctx = spa.getContext('2d');
    const sim = []; let ssized = false, scur = -1;
    const spad = n => String(n).padStart(3, '0');
    const photo = spa.closest('.headspa__photo');
    const sdraw = idx => {
      const im = sim[idx];
      if (!im || !im.complete || !im.naturalWidth || idx === scur) return;
      scur = idx; sctx.clearRect(0, 0, spa.width, spa.height); sctx.drawImage(im, 0, 0, spa.width, spa.height);
    };
    let stick = false;
    const supdate = () => {
      const r = photo.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
      const p = raw * raw;   // ease-in: segura a cena-herói (arco+cobre) na chegada, só avança ao rolar
      sdraw(Math.min(SF - 1, Math.round(p * (SF - 1))));
      stick = false;
    };
    for (let i = 1; i <= SF; i++) {
      const im = new Image();
      im.onload = () => {
        if (!ssized && im.naturalWidth) { spa.width = im.naturalWidth; spa.height = im.naturalHeight; ssized = true; scur = -1; }
        supdate();
      };
      im.src = `assets/headspa-frames/h_${spad(i)}.jpg?v=2`;
      sim.push(im);
    }
    addEventListener('scroll', () => { if (!stick) { requestAnimationFrame(supdate); stick = true; } }, { passive: true });
    addEventListener('resize', () => { if (!stick) { requestAnimationFrame(supdate); stick = true; } }, { passive: true });
    addEventListener('load', supdate);
    supdate();
  }
})();

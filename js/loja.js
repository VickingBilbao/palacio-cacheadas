/* ========================================================================
   PALÁCIO DAS CACHEADAS — LOJA
   Linha exclusiva + catálogo + carrinho + diferenciais:
   modal de produto · avaliações · de/por · Pix/parcelado · frete · reviews · toast
   ===================================================================== */
(() => {
  const WHATSAPP = '5513974081198';
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ====================================================================
     DADOS ILUSTRATIVOS — marcados como EXEMPLO. Trocar pelos reais aqui.
     (avaliações, ofertas de/por e condições de pagamento/frete)
     ==================================================================== */
  const ILUS = {
    on: true,
    pixOff: 0.10,                  // desconto no Pix (−10%)
    parcelas: 6,                   // parcelamento (até 6x)
    frete: 19.90, freteGratis: 199, // frete fixo / grátis acima de
    bestSeller: 'cur-lola-cr',     // produto "mais vendido"
    // ofertas de/por (id → % de desconto sobre o "de"):
    ofertas: { 'cur-ane-ma': 0.15, 'cur-lola-ma': 0.20, 'cur-widi-cr': 0.12, 'pdc3': 0.15, 'kit1': 0.18, 'kit3': 0.22 }
  };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const ratingOf = p => 4.4 + (hash(p.id) % 6) / 10;            // 4,4–4,9
  const revsOf = p => 28 + hash(p.id + '#') % 272;             // 28–299
  const oldOf = p => { const d = ILUS.ofertas[p.id]; return d ? +(p.price / (1 - d)).toFixed(2) : 0; };
  const offOf = p => { const o = oldOf(p); return o ? Math.round((1 - p.price / o) * 100) : 0; };
  const pixOf = p => +(p.price * (1 - ILUS.pixOff)).toFixed(2);
  const parcelaOf = p => +(p.price / ILUS.parcelas).toFixed(2);

  /* ---------- normalização ---------- */
  function category(t) {
    t = (t || '').toLowerCase();
    if (/kit|kitão/.test(t)) return 'Kits';
    if (/máscara|mascara|óleo|oleo|shampoo|condicionador|tratamento/.test(t)) return 'Tratamento';
    if (/ativador|modelador|mousse|gelatina|creme/.test(t)) return 'Finalizadores';
    return 'Outros';
  }
  const norm = p => {
    const m = /·\s*([^·]+)$/.exec(p.title || '');
    return {
      ...p,
      img: 'assets/loja/' + String(p.img).split('/').pop(),
      brand: p.brand || (m ? m[1].trim() : ''),
      name: p.name || (p.title || '').replace(/\s*·\s*[^·]+$/, '').trim(),
      cat: p.cat || (p.kind === 'pacote' ? 'Pacotes' : category(p.title))
    };
  };
  const EXCL = (window.LINHA || []).map(p => norm({ ...p, exclusive: true, brand: 'Palácio das Cacheadas' }));
  const OTHER = (window.PRODUCTS || []).map(norm);
  const ALL = [...EXCL, ...OTHER];
  const find = id => ALL.find(p => p.id === id);

  /* ---------- estrelas (avaliação ilustrativa) ---------- */
  const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8z"/></svg>';
  const stars = p => `<div class="stars" title="Avaliação ilustrativa (exemplo)"><span class="stars__ic">${STAR.repeat(5)}</span><span class="stars__n">${ratingOf(p).toFixed(1).replace('.', ',')}<i>(${revsOf(p)})</i></span></div>`;

  /* ---------- bloco de preço (de/por + Pix + parcelado) ---------- */
  const priceBlock = p => {
    const old = oldOf(p), off = offOf(p);
    return `<div class="price">${old ? `<span class="price__old">${brl(old)}</span>` : ''}<span class="price__now">${brl(p.price)}</span>${off ? `<span class="price__off">-${off}%</span>` : ''}</div>
      <div class="price__pix">${brl(pixOf(p))} no Pix · ${ILUS.parcelas}x de ${brl(parcelaOf(p))}</div>`;
  };

  /* ---------- card ---------- */
  const badge = p => {
    if (p.exclusive) return '<span class="card__badge">Exclusivo</span>';
    if (p.id === ILUS.bestSeller) return '<span class="card__badge card__badge--best">★ Mais vendido</span>';
    const off = offOf(p);
    if (off) return `<span class="card__badge card__badge--off">-${off}%</span>`;
    if (p.badge) return `<span class="card__badge card__badge--clean">${esc(p.badge)}</span>`;
    return '';
  };
  const card = p => `
    <li class="card${p.exclusive ? ' card--excl' : ''}">
      <div class="card__media" data-open="${p.id}">
        ${badge(p)}
        <img src="${p.img}" alt="${esc(p.name)}" loading="lazy" />
        <span class="card__quick">Ver detalhes</span>
      </div>
      <div class="card__body">
        ${p.exclusive ? `<span class="card__brand">${p.kind === 'pacote' ? 'Pacote' : 'Linha Palácio'}</span>` : (p.brand ? `<span class="card__brand">${esc(p.brand)}</span>` : '')}
        <h3 class="card__title" data-open="${p.id}">${esc(p.name)}</h3>
        ${stars(p)}
        <div class="card__spacer"></div>
        ${priceBlock(p)}
        <button class="card__add" data-add="${p.id}">Adicionar</button>
      </div>
    </li>`;

  /* ---------- seção linha exclusiva ---------- */
  const gridLinha = document.querySelector('[data-grid-linha]');
  if (gridLinha) gridLinha.innerHTML = EXCL.map(card).join('');

  /* ---------- cards de categoria (curadoria) ---------- */
  const CAT_DESC = {
    'Shampoo': 'Limpeza que respeita o cacho', 'Condicionador': 'Maciez e desembaraço',
    'Máscara': 'Hidratação & nutrição profunda', 'Creme de pentear': 'Definição sem frizz',
    'Finalizador': 'Cacho marcado, sem peso'
  };
  const CATORDER = ['Shampoo', 'Condicionador', 'Máscara', 'Creme de pentear', 'Finalizador'];
  const present = new Set(OTHER.map(p => p.cat).filter(Boolean));
  const cats = ['Todos', ...CATORDER.filter(c => present.has(c)), ...[...present].filter(c => !CATORDER.includes(c))];
  let activeCat = 'Todos';

  const catCardsEl = document.querySelector('[data-catcards]');
  if (catCardsEl) {
    catCardsEl.innerHTML = CATORDER.filter(c => present.has(c)).map((c, i) => `
      <button class="catcard" data-cat="${c}">
        <span class="catcard__idx">0${i + 1}</span>
        <span class="catcard__name">${c}</span>
        <span class="catcard__sub">${CAT_DESC[c] || ''}</span>
      </button>`).join('');
    catCardsEl.addEventListener('click', e => {
      const b = e.target.closest('.catcard'); if (!b) return;
      setCat(b.dataset.cat);
      document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---------- filtros (chips) + grade ---------- */
  const grid = document.querySelector('[data-grid]');
  const filtersEl = document.querySelector('[data-filters]');
  const emptyEl = document.querySelector('[data-empty]');
  if (filtersEl) {
    filtersEl.innerHTML = cats.map(c => `<button class="chip${c === 'Todos' ? ' is-active' : ''}" data-cat="${c}">${c}</button>`).join('');
    filtersEl.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setCat(b.dataset.cat); });
  }
  function setCat(c) {
    activeCat = c;
    filtersEl?.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('is-active', ch.dataset.cat === c));
    catCardsEl?.querySelectorAll('.catcard').forEach(cc => cc.classList.toggle('is-active', cc.dataset.cat === c));
    renderGrid();
  }
  function renderGrid() {
    if (!grid) return;
    const list = activeCat === 'Todos' ? OTHER : OTHER.filter(p => p.cat === activeCat);
    if (emptyEl) emptyEl.hidden = list.length > 0;
    grid.innerHTML = list.map(card).join('');
  }

  /* ---------- reviews ilustrativas ---------- */
  const REVIEWS = [
    { n: 'Aline R.', c: 'Cacho 3B', t: 'O ativador virou vício — meu cacho nunca ficou tão definido e leve.' },
    { n: 'Juliana M.', c: 'Crespo 4A', t: 'Comprei o kit completo e salvou meus fios. Atendimento impecável.' },
    { n: 'Carla S.', c: 'Ondulado 2C', t: 'A máscara deixa o cacho macio o dia todo. Recomendo de olhos fechados.' }
  ];
  const reviewsEl = document.querySelector('[data-reviews-grid]');
  if (reviewsEl) reviewsEl.innerHTML = REVIEWS.map(r => `
    <figure class="review">
      <div class="stars"><span class="stars__ic">${STAR.repeat(5)}</span></div>
      <blockquote>“${esc(r.t)}”</blockquote>
      <figcaption><b>${esc(r.n)}</b><span>${esc(r.c)} · compra verificada</span></figcaption>
    </figure>`).join('');

  /* ---------- modal de produto (quick-view) ---------- */
  const modal = document.querySelector('[data-pmodal]');
  const modalCard = document.querySelector('[data-pmodal-card]');
  const openProduct = id => {
    const p = find(id); if (!p || !modal) return;
    const off = offOf(p), old = oldOf(p);
    modalCard.innerHTML = `
      <button class="pmodal__x" data-pmodal-close aria-label="Fechar">✕</button>
      <div class="pmodal__media">${badge(p)}<img src="${p.img}" alt="${esc(p.name)}" /></div>
      <div class="pmodal__info">
        ${p.exclusive ? `<span class="card__brand">${p.kind === 'pacote' ? 'Pacote · Linha Palácio' : 'Linha Palácio'}</span>` : (p.brand ? `<span class="card__brand">${esc(p.brand)}</span>` : '')}
        <h3 class="pmodal__title">${esc(p.name)}</h3>
        ${stars(p)}
        ${priceBlock(p)}
        ${p.desc ? `<p class="pmodal__desc">${esc(p.desc)}</p>` : ''}
        <button class="btn btn--solid pmodal__add" data-add="${p.id}" data-from-modal>Adicionar à sacola</button>
        <p class="pmodal__ship">${ILUS.frete ? `Frete ${brl(ILUS.frete)} · grátis acima de ${brl(ILUS.freteGratis)}` : ''}</p>
      </div>`;
    modal.hidden = false; modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('show'));
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { modal.hidden = true; }, 300);
    if (!cartEl.classList.contains('open')) document.body.style.overflow = '';
  };
  modal?.addEventListener('click', e => { if (e.target.closest('[data-pmodal-close]') || e.target === modal) closeModal(); });
  document.addEventListener('click', e => { const t = e.target.closest('[data-open]'); if (t && !e.target.closest('[data-add]')) openProduct(t.dataset.open); });

  /* ---------- toast ---------- */
  const toastsEl = document.querySelector('[data-toasts]');
  function toast(msg) {
    if (!toastsEl) return;
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = msg;
    toastsEl.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 320); }, 2300);
  }

  /* ---------- carrinho ---------- */
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('pdc_cart') || '{}'); } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem('pdc_cart', JSON.stringify(cart)); } catch (e) {} };
  const count = () => Object.entries(cart).reduce((a, [id, q]) => a + (find(id) ? q : 0), 0);
  const subtotal = () => Object.entries(cart).reduce((s, [id, q]) => s + (find(id)?.price || 0) * q, 0);
  const freteVal = sub => (sub > 0 && sub < ILUS.freteGratis) ? ILUS.frete : 0;

  const cartEl = document.querySelector('[data-cart]');
  const backdrop = document.querySelector('[data-cart-backdrop]');
  const itemsEl = document.querySelector('[data-cart-items]');
  const emptyCart = document.querySelector('[data-cart-empty]');
  const footEl = document.querySelector('[data-cart-foot]');
  const subEl = document.querySelector('[data-cart-sub]');
  const freteEl = document.querySelector('[data-cart-frete]');
  const totalEl = document.querySelector('[data-cart-total]');
  const shipEl = document.querySelector('[data-cart-ship]');
  const countEl = document.querySelector('[data-cart-count]');
  const checkoutEl = document.querySelector('[data-cart-checkout]');

  const openCart = () => { backdrop.hidden = false; requestAnimationFrame(() => { backdrop.classList.add('show'); cartEl.classList.add('open'); }); cartEl.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeCart = () => { backdrop.classList.remove('show'); cartEl.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; setTimeout(() => { backdrop.hidden = true; }, 450); };
  document.querySelector('[data-cart-open]').addEventListener('click', openCart);
  document.querySelector('[data-cart-close]').addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeModal(); } });

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    const id = b.dataset.add, p = find(id);
    cart[id] = (cart[id] || 0) + 1; save(); updateCart();
    if (b.dataset.fromModal === undefined) { b.textContent = 'Adicionado ✓'; b.classList.add('added'); setTimeout(() => { b.textContent = 'Adicionar'; b.classList.remove('added'); }, 1100); }
    else closeModal();
    toast(`<b>${esc(p?.name || 'Produto')}</b> adicionado à sacola 💛`);
  });

  function updateCart() {
    countEl.textContent = count();
    const ids = Object.keys(cart).filter(id => cart[id] > 0 && find(id));
    emptyCart.hidden = ids.length > 0;
    footEl.hidden = ids.length === 0;
    itemsEl.innerHTML = ids.map(id => {
      const p = find(id), q = cart[id];
      return `<li class="citem" data-id="${id}">
        <div class="citem__media"><img src="${p.img}" alt="" /></div>
        <div>
          <p class="citem__t">${esc(p.name)}</p>
          <p class="citem__p">${brl(p.price)}</p>
          <div class="citem__qty">
            <button data-dec="${id}" aria-label="Diminuir">−</button><span>${q}</span><button data-inc="${id}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button class="citem__rm" data-rm="${id}">remover</button>
      </li>`;
    }).join('');
    const sub = subtotal(), frete = freteVal(sub), grand = sub + frete;
    if (subEl) subEl.textContent = brl(sub);
    if (freteEl) freteEl.textContent = sub === 0 ? '—' : (frete === 0 ? 'Grátis' : brl(frete));
    if (totalEl) totalEl.textContent = brl(grand);
    if (shipEl) {
      if (sub > 0 && sub < ILUS.freteGratis) {
        const falta = ILUS.freteGratis - sub, pct = Math.min(100, sub / ILUS.freteGratis * 100);
        shipEl.hidden = false;
        shipEl.innerHTML = `<p>Faltam <b>${brl(falta)}</b> pra <b>frete grátis</b></p><span class="ship__bar"><i style="width:${pct}%"></i></span>`;
      } else if (sub >= ILUS.freteGratis) {
        shipEl.hidden = false;
        shipEl.innerHTML = `<p class="ship__win">🎉 Você ganhou <b>frete grátis</b>!</p>`;
      } else shipEl.hidden = true;
    }
    checkoutEl.href = waLink();
  }

  itemsEl.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
    if (inc) { cart[inc.dataset.inc]++; }
    else if (dec) { const id = dec.dataset.dec; cart[id] = Math.max(0, cart[id] - 1); if (!cart[id]) delete cart[id]; }
    else if (rm) { delete cart[rm.dataset.rm]; }
    else return;
    save(); updateCart();
  });

  function waLink() {
    const lines = Object.keys(cart).filter(id => cart[id] > 0 && find(id)).map(id => {
      const p = find(id); return `• ${cart[id]}x ${p.name} — ${brl(p.price * cart[id])}`;
    });
    const sub = subtotal(), frete = freteVal(sub), grand = sub + frete;
    const fr = sub === 0 ? '' : (frete === 0 ? '\nFrete: grátis' : `\nFrete: ${brl(frete)}`);
    const msg = `Olá, Palácio! Quero finalizar meu pedido 💛\n\n${lines.join('\n')}\n\nSubtotal: ${brl(sub)}${fr}\nTotal: ${brl(grand)}\n\nPodemos combinar o pagamento (Pix)?`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }

  /* ---------- reveals ---------- */
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll('[data-rise]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-rise]').forEach(el => el.classList.add('in'));
  }

  /* ---------- init ---------- */
  renderGrid();
  updateCart();
})();

/* ---------- Linha reel: vídeo dos produtos scrubbado pelo scroll (na íntegra) ---------- */
(() => {
  const canvas = document.querySelector('[data-reel-canvas]');
  if (!canvas || matchMedia('(prefers-reduced-motion:reduce)').matches) return; // reduced-motion: fica só o poster
  const RF = 72, HOLD = 0.16, ctx = canvas.getContext('2d'), track = canvas.closest('.linha-reel-track');
  const dir = matchMedia('(max-width:900px)').matches ? 'linha-reel-v' : 'linha-reel'; // mobile: vídeo 9:16 nativo; desktop: 16:9
  const fb = document.querySelector('[data-reel-fallback]'); if (fb) fb.src = `assets/loja/${dir}/r_001.jpg?v=1`;
  const imgs = []; let sized = false, cur = -1, ticking = false;
  const pad = n => String(n).padStart(3, '0');
  const draw = idx => {
    const im = imgs[idx];
    if (!im || !im.complete || !im.naturalWidth || idx === cur) return;
    cur = idx; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  };
  const update = () => {
    if (track) {
      const r = track.getBoundingClientRect(), vh = window.innerHeight || 1;
      const total = r.height - vh;                                  // fase grudada (sticky)
      const prog = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 0;
      const play = Math.min(prog / (1 - HOLD), 1);                  // toca o vídeo nos primeiros (1-HOLD); últimos HOLD seguram o último frame
      draw(Math.min(RF - 1, Math.round(play * (RF - 1))));
    }
    ticking = false;
  };
  for (let i = 1; i <= RF; i++) {
    const im = new Image();
    im.onload = () => {
      if (!sized && im.naturalWidth) { canvas.width = im.naturalWidth; canvas.height = im.naturalHeight; sized = true; cur = -1; } // backing nativo 1280×720 = nitidez
      update();
    };
    im.src = `assets/loja/${dir}/r_${pad(i)}.jpg?v=1`;
    imgs.push(im);
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('load', update);
  update();
})();

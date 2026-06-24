/* ========================================================================
   PALÁCIO DAS CACHEADAS — LOJA
   Linha exclusiva (marca própria) em destaque + demais produtos + carrinho
   ===================================================================== */
(() => {
  const WHATSAPP = '5513974081198';
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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

  /* ---------- card ---------- */
  const card = p => `
    <li class="card${p.exclusive ? ' card--excl' : ''}">
      <div class="card__media">
        ${p.exclusive ? '<span class="card__badge">Exclusivo</span>' : ''}
        <img src="${p.img}" alt="${esc(p.name)}" loading="lazy" />
      </div>
      <div class="card__body">
        ${p.exclusive
          ? `<span class="card__brand">${p.kind === 'pacote' ? 'Pacote' : 'Linha Palácio'}</span>`
          : (p.brand ? `<span class="card__brand">${esc(p.brand)}</span>` : '')}
        <h3 class="card__title">${esc(p.name)}</h3>
        <div class="card__spacer"></div>
        <div class="card__row">
          <span class="card__price">${brl(p.price)}<small>à vista</small></span>
          <button class="card__add" data-add="${p.id}">Adicionar</button>
        </div>
      </div>
    </li>`;

  /* ---------- seção linha exclusiva ---------- */
  const gridLinha = document.querySelector('[data-grid-linha]');
  if (gridLinha) gridLinha.innerHTML = EXCL.map(card).join('');

  /* ---------- demais produtos + filtros ---------- */
  const grid = document.querySelector('[data-grid]');
  const filtersEl = document.querySelector('[data-filters]');
  const emptyEl = document.querySelector('[data-empty]');
  let activeCat = 'Todos';
  const cats = ['Todos', ...['Kits', 'Finalizadores', 'Tratamento', 'Outros'].filter(c => OTHER.some(p => p.cat === c))];
  filtersEl.innerHTML = cats.map(c => `<button class="chip${c === 'Todos' ? ' is-active' : ''}" data-cat="${c}">${c}</button>`).join('');
  filtersEl.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    activeCat = b.dataset.cat;
    filtersEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === b));
    renderGrid();
  });
  function renderGrid() {
    const list = activeCat === 'Todos' ? OTHER : OTHER.filter(p => p.cat === activeCat);
    emptyEl.hidden = list.length > 0;
    grid.innerHTML = list.map(card).join('');
  }

  /* ---------- carrinho ---------- */
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('pdc_cart') || '{}'); } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem('pdc_cart', JSON.stringify(cart)); } catch (e) {} };
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(cart).reduce((s, [id, q]) => s + (find(id)?.price || 0) * q, 0);

  const cartEl = document.querySelector('[data-cart]');
  const backdrop = document.querySelector('[data-cart-backdrop]');
  const itemsEl = document.querySelector('[data-cart-items]');
  const emptyCart = document.querySelector('[data-cart-empty]');
  const footEl = document.querySelector('[data-cart-foot]');
  const totalEl = document.querySelector('[data-cart-total]');
  const countEl = document.querySelector('[data-cart-count]');
  const checkoutEl = document.querySelector('[data-cart-checkout]');

  const openCart = () => { backdrop.hidden = false; requestAnimationFrame(() => { backdrop.classList.add('show'); cartEl.classList.add('open'); }); cartEl.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeCart = () => { backdrop.classList.remove('show'); cartEl.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; setTimeout(() => { backdrop.hidden = true; }, 450); };
  document.querySelector('[data-cart-open]').addEventListener('click', openCart);
  document.querySelector('[data-cart-close]').addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]'); if (!b) return;
    const id = b.dataset.add;
    cart[id] = (cart[id] || 0) + 1; save(); updateCart();
    b.textContent = 'Adicionado ✓'; b.classList.add('added');
    setTimeout(() => { b.textContent = 'Adicionar'; b.classList.remove('added'); }, 1100);
    openCart();
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
            <button data-dec="${id}" aria-label="Diminuir">−</button>
            <span>${q}</span>
            <button data-inc="${id}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button class="citem__rm" data-rm="${id}">remover</button>
      </li>`;
    }).join('');
    totalEl.textContent = brl(total());
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
    const msg = `Olá, Palácio! Quero finalizar meu pedido 💛\n\n${lines.join('\n')}\n\nTotal: ${brl(total())}\n\nPodemos combinar o pagamento (Pix)?`;
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
  const RF = 72, ctx = canvas.getContext('2d'), stage = canvas.closest('.linha-reel');
  const imgs = []; let sized = false, cur = -1, ticking = false;
  const pad = n => String(n).padStart(3, '0');
  const draw = idx => {
    const im = imgs[idx];
    if (!im || !im.complete || !im.naturalWidth || idx === cur) return;
    cur = idx; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  };
  const update = () => {
    if (stage) {
      const r = stage.getBoundingClientRect(), vh = window.innerHeight || 1;
      const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1); // entra embaixo (0) → sai em cima (1) = vídeo inteiro
      draw(Math.min(RF - 1, Math.round(p * (RF - 1))));
    }
    ticking = false;
  };
  for (let i = 1; i <= RF; i++) {
    const im = new Image();
    im.onload = () => {
      if (!sized && im.naturalWidth) { canvas.width = im.naturalWidth; canvas.height = im.naturalHeight; sized = true; cur = -1; } // backing nativo 1280×720 = nitidez
      update();
    };
    im.src = `assets/loja/linha-reel/r_${pad(i)}.jpg?v=1`;
    imgs.push(im);
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('load', update);
  update();
})();

/* ==========================================================================
   SENAVENTAS · Generador de la tienda (HTML autónomo)
   El mismo documento sirve para la vista previa (iframe) y para el sitio publicado.
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const U = SV.util;
  const esc = U.esc;

  SV.themeOf = (session) => SV.THEMES.find((t) => t.id === session.store.themeId) || SV.THEMES[0];

  SV.themeVars = (session) => {
    const t = SV.themeOf(session);
    const v = Object.assign({}, t.vars);
    if (session.store.brandColor) {
      v.primary = session.store.brandColor;
      v.primary2 = session.store.brandColor;
    }
    return v;
  };

  const cssVars = (v) => `:root{--primary:${v.primary};--primary2:${v.primary2};--on-primary:${v.onPrimary};--accent:${v.accent};--on-accent:${v.onAccent};--bg:${v.bg};--alt:${v.alt};--alt2:${v.alt2};--card:${v.card};--text:${v.text};--muted:${v.muted};--radius:${v.radius};--font-head:${v.fontHead};--font-body:${v.fontBody};--dark:${v.dark};--on-dark:${v.onDark}}`;

  const img = (src, name, cls = '') => `<img class="${cls}" src="${esc(src || U.placeholder(name))}" alt="${esc(name)}" data-ph="${esc(name)}" loading="lazy">`;

  /* Datos públicos que viajan dentro del sitio (sin costos ni llaves privadas). */
  SV.publicData = (session, mode) => {
    const s = session.store;
    return {
      mode,
      sessionId: session.id,
      storeKey: 'sv-store-' + U.slug(s.subdomain || s.name),
      theme: SV.themeOf(session).id,
      layout: SV.themeOf(session).layout,
      store: {
        name: s.name, slogan: s.slogan, currency: s.currency, whatsapp: s.whatsapp, email: s.email, city: s.city,
        freeShippingThreshold: Number(s.freeShippingThreshold) || 0, shippingFlat: Number(s.shippingFlat) || 0,
        promo: s.promo
      },
      plugins: session.plugins,
      categories: session.categories,
      coupons: session.plugins.coupons ? session.coupons.filter((c) => c.active).map((c) => ({ code: c.code, type: c.type, value: c.value })) : [],
      products: session.products.filter((p) => p.status === 'publicado').map((p) => ({
        id: p.id, sku: p.sku, name: p.name, category: p.category, price: Number(p.price) || 0, compareAt: Number(p.compareAt) || 0,
        stock: Number(p.stock) || 0, image: p.image || '', description: p.description, badge: p.badge, origin: p.origin,
        rating: Number(p.rating) || 0, reviews: Number(p.reviews) || 0, moq: Math.max(1, Number(p.moq) || 1)
      })),
      zones: SV.SHIPPING_ZONES,
      departamentos: SV.DEPARTAMENTOS
    };
  };

  /* ---------- Bloques estáticos ---------- */
  const heroBlock = (session, theme) => {
    const s = session.store;
    const kind = theme.layout.hero;
    const trustStats = (s.trust || []).slice(0, 3).map((t) => `<div><b>${esc(t.title.split('(')[0].trim())}</b><span>${esc((t.text || '').split('.')[0].slice(0, 42))}</span></div>`).join('');
    const title = `${esc(s.heroTitle)} <em>${esc(s.heroHighlight)}</em>`;
    const ctas = `<div class="hero-ctas"><a class="btn btn-primary" href="#catalogo">${esc(s.ctaPrimary || 'Explorar catálogo')} <span class="ms">arrow_forward</span></a><button class="btn btn-soft" data-act="open-cart"><span class="ms">shopping_bag</span> ${esc(s.ctaSecondary || 'Ver carrito')}</button></div>`;
    if (kind === 'overlay') {
      return `<section class="hero hero-overlay"><div class="bgimg" style="background-image:url('${esc(s.heroImage || '')}')"></div><div class="inner"><span class="pill"><span class="ms">auto_awesome</span> ${esc(s.heroBadge)}</span><h1>${title}</h1><p class="lead">${esc(s.heroText)}</p>${ctas}<div class="hero-stats">${trustStats}</div></div></section>`;
    }
    if (kind === 'editorial') {
      return `<section class="hero hero-editorial"><div class="wrap"><div class="frame">${img(s.heroImage, s.name)}<div class="caption"><span class="eyebrow">${esc(s.heroBadge)}</span><h1 style="margin:10px 0">${title}</h1><p class="lead">${esc(s.heroText)}</p>${ctas}</div></div></div></section>`;
    }
    if (kind === 'compact') {
      const pubs = session.products.filter((p) => p.status === 'publicado');
      const minOrder = pubs.length ? Math.min(...pubs.map((p) => (Number(p.price) || 0) * Math.max(1, Number(p.moq) || 1))) : 0;
      return `<section class="hero hero-compact"><div class="wrap"><div><span class="pill"><span class="ms">business_center</span> ${esc(s.heroBadge)}</span><h1 style="margin:12px 0">${title}</h1><p class="lead">${esc(s.heroText)}</p><div class="hero-ctas"><a class="btn btn-primary" href="#catalogo">${esc(s.ctaPrimary)} <span class="ms">table_view</span></a><button class="btn btn-ghost" data-act="quote"><span class="ms">request_quote</span> ${esc(s.ctaSecondary)}</button></div></div><div class="kpi-box"><div><b>${pubs.length}</b><span>Referencias activas</span></div><div><b>${esc(U.money(minOrder, s.currency))}</b><span>Pedido mínimo desde</span></div><div><b>${esc(s.heroCardTitle)}</b><span>${esc(s.heroCardText)}</span></div><div><b>${esc(U.money(s.freeShippingThreshold, s.currency))}</b><span>Flete gratis desde</span></div></div></div></section>`;
    }
    return `<section class="hero hero-split"><div class="wrap"><div><span class="pill"><span class="ms">verified</span> ${esc(s.heroBadge)}</span><h1>${title}</h1><p class="lead">${esc(s.heroText)}</p>${ctas}<div class="hero-stats">${trustStats}</div></div><div class="hero-media"><div class="img">${img(s.heroImage, s.name)}</div><div class="float-card"><div class="ico"><span class="ms">auto_awesome</span></div><div><b>${esc(s.heroCardTitle)}</b><small>${esc(s.heroCardText)}</small></div></div></div></div></section>`;
  };

  const promoBlock = (session) => {
    const pr = session.store.promo || {};
    if (!pr.enabled) return '';
    const cur = session.store.currency;
    const priced = Number(pr.price) > 0;
    return `<div class="wrap"><div class="promo"><div class="l"><div class="ico"><span class="ms">auto_fix_high</span></div><div><span class="chip on" style="padding:3px 10px;font-size:11px">${esc(pr.badge)}</span><h3>${esc(pr.title)}</h3><p class="muted" style="margin:0;font-size:13.5px">${esc(pr.text)}</p></div></div>${priced ? `<div class="r"><div style="text-align:right">${Number(pr.compareAt) > 0 ? `<div class="price-old">${esc(U.money(pr.compareAt, cur))}</div>` : ''}<div class="price" style="color:var(--primary)">${esc(U.money(pr.price, cur))}</div></div><button class="btn btn-primary" data-act="add-bundle"><span class="ms">add_shopping_cart</span> Comprar kit</button></div>` : ''}</div></div>`;
  };

  const catalogBlock = (session, theme) => {
    const cats = session.categories.map((c) => `<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    const table = theme.layout.catalog === 'table';
    return `<section class="block" id="catalogo"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">${table ? 'Lista de precios por lote' : 'Productos en inventario'}</span><h2>${table ? 'Tabla de pedido rápido' : 'Nuestra selección de temporada'}</h2></div><div class="filters"><button class="chip on" data-cat="">Todos</button>${cats}<select id="sort" aria-label="Ordenar"><option value="featured">Destacados</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre A-Z</option></select></div></div><div id="catalog"></div>${table ? '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px"><button class="btn btn-soft" data-act="quote"><span class="ms">request_quote</span> Ver cotización</button><button class="btn btn-primary" data-act="add-all"><span class="ms">playlist_add</span> Agregar cantidades al pedido</button></div>' : ''}</div></section>`;
  };

  const trustBlock = (session) => {
    const s = session.store;
    const items = (s.trust || []).map((t) => `<div class="trust-card"><div class="ico"><span class="ms">${esc(t.icon)}</span></div><h4>${esc(t.title)}</h4><p>${esc(t.text)}</p></div>`).join('');
    return `<section class="block trust" id="valores"><div class="wrap"><div class="center"><span class="eyebrow">Compromiso de marca</span><h2>${esc(s.trustTitle)}</h2><p class="muted">${esc(s.trustText)}</p></div><div class="trust-grid">${items}</div></div></section>`;
  };

  const aboutBlock = (session) => {
    const s = session.store;
    const pubs = session.products.filter((p) => p.status === 'publicado');
    const avg = pubs.length ? pubs.reduce((a, p) => a + (Number(p.rating) || 0), 0) / pubs.length : 0;
    return `<section class="block about" id="nosotros"><div class="wrap"><div><span class="eyebrow">Identidad del emprendimiento</span><h2>${esc(s.aboutTitle)}</h2><p class="muted" style="font-size:15.5px">${esc(s.aboutText)}</p><p style="display:flex;gap:18px;flex-wrap:wrap;font-weight:600;font-size:13.5px"><span><span class="ms" style="color:var(--primary)">verified</span> Proyecto formativo</span><span><span class="ms" style="color:var(--primary)">database</span> Inventario sincronizado</span></p></div><div class="metrics"><h4>Resumen de la tienda</h4><div class="row"><div><b>${pubs.length}</b><span>Productos publicados</span></div><div><b>${session.categories.length}</b><span>Categorías</span></div><div><b>${avg.toFixed(1)} / 5</b><span>Calificación promedio</span></div><div><b>Simulado</b><span>Pago seguro SENA</span></div></div></div></div></section>`;
  };

  const footerBlock = (session) => {
    const s = session.store; const o = session.owner;
    const cats = session.categories.slice(0, 5).map((c) => `<a href="#catalogo" data-cat-link="${esc(c)}">${esc(c)}</a>`).join('');
    const credits = s.sections.credits ? `<div><h5>Créditos académicos</h5><div class="credits"><div><b>${esc(o.role)}:</b> ${esc(o.name)}</div><div><b>Programa:</b> ${esc(o.programa)}</div><div><b>Ficha:</b> ${esc(o.ficha)} • ${esc(o.regional)}</div><div><b>Centro:</b> ${esc(o.centro)}</div>${o.instructor ? `<div><b>Instructor(a):</b> ${esc(o.instructor)}</div>` : ''}</div></div>` : `<div><h5>Medios de pago simulados</h5><div class="pay-chips"><span>Nequi</span><span>Daviplata</span><span>PSE</span><span>Tarjeta</span></div></div>`;
    return `<footer class="ftr"><div class="wrap"><div class="ftr-grid"><div><div class="brand" style="margin-bottom:12px"><div class="brand-ico"><span class="ms">${esc(s.icon || 'storefront')}</span></div><span class="brand-name">${esc(s.name)}</span></div><p class="muted">${esc(s.slogan)}</p><div class="pay-chips"><span>Nequi</span><span>Daviplata</span><span>PSE</span><span>Tarjeta</span></div></div><div><h5>Tienda virtual</h5>${cats}</div><div><h5>Atención</h5><p class="muted"><span class="ms">call</span> +${esc(s.whatsapp)}</p><p class="muted"><span class="ms">mail</span> ${esc(s.email)}</p><p class="muted"><span class="ms">location_on</span> ${esc(s.city)}</p><a href="#" data-act="my-orders">Mis pedidos</a></div>${credits}</div><div class="ftr-bottom muted"><span>© ${new Date().getFullYear()} ${esc(s.name)} · Construido con SENAVENTAS</span><span>Sitio con fines exclusivamente educativos. No procesa dinero real.</span></div></div></footer>`;
  };

  const seoHead = (session) => {
    const s = session.store; const seo = s.seo || {};
    if (!session.plugins.seo) return `<meta name="description" content="${esc(s.slogan)}">`;
    const url = 'https://' + (s.subdomain || 'tienda') + '.senaventas.edu.co/';
    const ld = {
      '@context': 'https://schema.org', '@type': 'Store', name: s.name, description: seo.description || s.slogan, url,
      makesOffer: session.products.filter((p) => p.status === 'publicado').slice(0, 30).map((p) => ({ '@type': 'Offer', price: p.price, priceCurrency: s.currency, itemOffered: { '@type': 'Product', name: p.name, sku: p.sku } }))
    };
    return `<meta name="description" content="${esc(seo.description || s.slogan)}"><meta name="keywords" content="${esc(seo.keywords || '')}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(seo.title || s.name)}"><meta property="og:description" content="${esc(seo.description || s.slogan)}"><meta property="og:image" content="${esc(/^https?:/.test(s.heroImage || '') ? s.heroImage : '')}"><meta property="og:url" content="${esc(url)}"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${esc(url)}"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
  };

  /* ---------- Documento completo ---------- */
  SV.renderStore = (session, opts = {}) => {
    const mode = opts.mode || 'preview';
    const theme = SV.themeOf(session);
    const s = session.store;
    const sec = s.sections || {};
    const vars = SV.themeVars(session);
    const data = SV.publicData(session, mode);
    const navCats = session.categories.slice(0, 5).map((c) => `<a href="#catalogo" data-cat-link="${esc(c)}">${esc(c)}</a>`).join('');
    const body = [
      sec.announcement && s.announcement ? `<div class="announce"><span class="ms">campaign</span> ${esc(s.announcement)}</div>` : '',
      `<header class="hdr"><div class="wrap"><a class="brand" href="#top"><div class="brand-ico"><span class="ms">${esc(s.icon || 'storefront')}</span></div><div style="min-width:0"><span class="brand-name">${esc(s.name)}</span><span class="brand-tag">${esc(s.slogan)}</span></div></a><nav class="nav">${navCats}</nav><div class="hdr-actions"><label class="search"><span class="ms">search</span><input id="q" type="search" placeholder="Buscar productos..." aria-label="Buscar productos"></label>${session.plugins.wishlist ? '<button class="icon-btn" data-act="show-favs" title="Favoritos"><span class="ms">favorite</span><span class="fav-count" id="fav-count" hidden>0</span></button>' : ''}<button class="cart-btn" data-act="open-cart"><span class="ms">shopping_bag</span><span class="lbl">Carrito</span><span class="count" id="cart-count">0</span></button></div></div></header>`,
      '<main id="top">',
      sec.hero ? heroBlock(session, theme) : '',
      sec.promo ? promoBlock(session) : '',
      sec.catalog !== false ? catalogBlock(session, theme) : '',
      sec.trust ? trustBlock(session) : '',
      sec.about ? aboutBlock(session) : '',
      '</main>',
      footerBlock(session),
      session.plugins.whatsapp && s.whatsapp ? `<a class="wa-float" id="wa-float" href="https://wa.me/${esc(String(s.whatsapp).replace(/\D/g, ''))}?text=${encodeURIComponent('Hola ' + s.name + ', quiero información de sus productos.')}" target="_blank" rel="noopener" title="Escríbenos por WhatsApp"><span class="ms">chat</span></a>` : '',
      `<div class="sandbox"><span class="ms">school</span> <span><b>Tienda educativa SENAVENTAS</b> · Transacciones simuladas. No ingreses datos reales de pago.</span></div>`,
      '<div class="scrim" id="scrim"></div>',
      '<aside class="drawer" id="drawer" aria-label="Carrito de compra"></aside>',
      '<div class="modal" id="modal" role="dialog" aria-modal="true"><div class="box" id="modal-box"></div></div>',
      '<div class="toast" id="toast"></div>'
    ].join('\n');

    const json = JSON.stringify(data).replace(/</g, '\\u003c');
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc((s.seo && s.seo.title) || s.name)}</title>
${seoHead(session)}
<meta name="generator" content="SENAVENTAS · Creador de tiendas educativas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block" rel="stylesheet" media="print" onload="this.media='all'">
<style>${cssVars(vars)}${SV.STORE_CSS}</style>
</head>
<body class="t-${esc(theme.id)}">
${body}
<script id="sv-data" type="application/json">${json}</script>
<script>(${storeRuntime.toString()})();</script>
</body>
</html>`;
  };

  /* ======================================================================
     Código que corre DENTRO de la tienda (carrito, filtros, checkout).
     Se serializa con toString(): no puede usar variables externas.
     ====================================================================== */
  function storeRuntime() {
    var D = JSON.parse(document.getElementById('sv-data').textContent);
    var CUR = D.store.currency || 'COP';
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var esc = function (v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); };
    var money = function (n) {
      var v = Number(n) || 0;
      if (CUR === 'USD') return 'US$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (CUR === 'EUR') return '€' + v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return '$' + Math.round(v).toLocaleString('es-CO');
    };
    var ph = function (name) {
      var l = esc(String(name || '?').trim().charAt(0).toUpperCase() || '?');
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#e5eeff"/><text x="50%" y="54%" font-family="Arial" font-size="150" font-weight="700" fill="#005f2e" text-anchor="middle" dominant-baseline="middle">' + l + '</text></svg>');
    };
    var imgTag = function (p, cls) { return '<img class="' + (cls || '') + '" src="' + esc(p.image || ph(p.name)) + '" alt="' + esc(p.name) + '" data-ph="' + esc(p.name) + '" loading="lazy">'; };
    (function () {
      var root = document.documentElement, tries = 0;
      if (!document.fonts) { root.classList.add('icons-ok'); return; }
      var ready = function () { return Array.prototype.some.call(document.fonts, function (f) { return /Material Symbols/.test(f.family) && f.status === 'loaded'; }); };
      var tick = function () { if (ready()) { root.classList.add('icons-ok'); return; } if (++tries < 60) setTimeout(tick, 250); };
      tick();
    })();
    document.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG' && t.getAttribute('data-ph') !== null && !t.__ph) { t.__ph = true; t.src = ph(t.getAttribute('data-ph')); }
    }, true);

    var store = null;
    try { store = window.localStorage; store.setItem('__t', '1'); store.removeItem('__t'); } catch (e) { store = null; }
    var KEY = D.storeKey;
    var load = function (k, def) { if (!store) return def; try { var v = JSON.parse(store.getItem(KEY + ':' + k)); return v == null ? def : v; } catch (e) { return def; } };
    var save = function (k, v) { if (!store) return; try { store.setItem(KEY + ':' + k, JSON.stringify(v)); } catch (e) { /* cuota llena */ } };
    var inPreview = D.mode === 'preview' && window.parent !== window;

    var S = { cart: D.mode === 'export' ? load('cart', []) : [], favs: load('favs', []), coupon: null, cat: '', sort: 'featured', q: '', showFavs: false, draftQty: {} };
    var byId = function (id) { for (var i = 0; i < D.products.length; i++) if (D.products[i].id === id) return D.products[i]; return null; };

    var track = function (event, payload) {
      if (inPreview) window.parent.postMessage({ source: 'senaventas-store', type: 'track', event: event, payload: payload || {} }, '*');
    };
    var toast = function (msg, icon) {
      var t = $('#toast');
      t.innerHTML = '<span class="ms">' + (icon || 'check_circle') + '</span> ' + esc(msg);
      t.classList.add('on');
      clearTimeout(t.__h);
      t.__h = setTimeout(function () { t.classList.remove('on'); }, 2400);
    };

    /* ---------- Cálculos ---------- */
    var lineUnit = function (l) { if (l.kind === 'bundle') return Number(D.store.promo.price) || 0; var p = byId(l.id); return p ? p.price : 0; };
    var reservedOf = function (id) {
      var n = 0;
      S.cart.forEach(function (l) {
        if (l.kind === 'bundle') { if ((D.store.promo.productIds || []).indexOf(id) >= 0) n += l.qty; }
        else if (l.id === id) n += l.qty;
      });
      return n;
    };
    var zoneFor = function (dep) {
      var z = D.zones;
      if (z.local.deps.indexOf(dep) >= 0) return z.local;
      if (z.remota.deps.indexOf(dep) >= 0) return z.remota;
      if (z.principal.deps.indexOf(dep) >= 0) return z.principal;
      return z.nacional;
    };
    var totals = function (dep) {
      var subtotal = 0, items = 0;
      S.cart.forEach(function (l) { subtotal += lineUnit(l) * l.qty; items += l.qty; });
      var discount = 0;
      if (S.coupon) discount = S.coupon.type === 'percent' ? Math.round(subtotal * S.coupon.value / 100) : Math.min(subtotal, S.coupon.value);
      var base = subtotal - discount;
      var thr = D.store.freeShippingThreshold;
      var shipping = 0, zoneLabel = 'Tarifa fija';
      if (items > 0) {
        if (D.plugins.shipping) { var z = zoneFor(dep || D.store.city || 'Bogotá D.C.'); shipping = z.price; zoneLabel = z.label + ' · ' + z.days; }
        else shipping = D.store.shippingFlat;
        if (thr > 0 && base >= thr) { shipping = 0; zoneLabel = 'Envío gratis'; }
      }
      return { subtotal: subtotal, discount: discount, shipping: shipping, total: base + shipping, items: items, zoneLabel: zoneLabel, missing: thr > 0 ? Math.max(0, thr - base) : 0, pct: thr > 0 ? Math.min(100, Math.round(base / thr * 100)) : 100 };
    };

    /* ---------- Carrito ---------- */
    var addToCart = function (id, qty, silent) {
      var p = byId(id); if (!p) return false;
      qty = Math.max(1, qty || 1);
      var line = null;
      S.cart.forEach(function (l) { if (l.kind !== 'bundle' && l.id === id) line = l; });
      var current = line ? line.qty : 0;
      if (current === 0 && qty < p.moq) qty = p.moq;
      if (reservedOf(id) + qty > p.stock) { toast('Stock insuficiente: quedan ' + Math.max(0, p.stock - reservedOf(id)) + ' unidades', 'inventory'); return false; }
      if (line) line.qty += qty; else S.cart.push({ id: id, qty: qty });
      persist();
      track('add_to_cart', { id: id, sku: p.sku, qty: qty, value: p.price * qty });
      if (!silent) { toast(p.name + ' agregado al carrito', 'add_shopping_cart'); openCart(); }
      return true;
    };
    var addBundle = function () {
      var ids = D.store.promo.productIds || [];
      for (var i = 0; i < ids.length; i++) {
        var p = byId(ids[i]);
        if (!p) { toast('El kit incluye un producto no publicado. Publícalo desde el panel.', 'error'); return; }
        if (reservedOf(ids[i]) + 1 > p.stock) { toast('Sin stock para armar el kit (' + p.name + ')', 'inventory'); return; }
      }
      var line = null;
      S.cart.forEach(function (l) { if (l.kind === 'bundle') line = l; });
      if (line) line.qty += 1; else S.cart.push({ kind: 'bundle', id: 'bundle', qty: 1 });
      persist();
      track('add_to_cart', { id: 'bundle', qty: 1, value: D.store.promo.price });
      toast('Kit agregado al carrito', 'redeem');
      openCart();
    };
    var setQty = function (idx, delta) {
      var l = S.cart[idx]; if (!l) return;
      if (delta > 0) {
        if (l.kind === 'bundle') { var ok = (D.store.promo.productIds || []).every(function (id) { var p = byId(id); return p && reservedOf(id) + 1 <= p.stock; }); if (!ok) { toast('No hay más stock para el kit', 'inventory'); return; } }
        else { var p = byId(l.id); if (reservedOf(l.id) + 1 > p.stock) { toast('Llegaste al stock disponible', 'inventory'); return; } }
      }
      var min = l.kind === 'bundle' ? 1 : byId(l.id).moq;
      l.qty += delta;
      if (l.qty < min) S.cart.splice(idx, 1);
      persist(); renderCart();
    };
    var persist = function () {
      if (D.mode === 'export') save('cart', S.cart);
      var t = totals();
      $('#cart-count').textContent = t.items;
      renderCatalog();
    };

    /* ---------- Catálogo ---------- */
    var stars = function (p) {
      if (!D.plugins.reviews) return '';
      var s = '', r = p.rating || 0;
      for (var i = 1; i <= 5; i++) s += '<span class="ms fill">' + (r >= i ? 'star' : (r >= i - 0.5 ? 'star_half' : 'star_outline')) + '</span>';
      return '<div class="stars">' + s + '<small>(' + (p.reviews || 0) + ')</small></div>';
    };
    var visible = function () {
      var list = D.products.filter(function (p) {
        if (S.cat && p.category !== S.cat) return false;
        if (S.showFavs && S.favs.indexOf(p.id) < 0) return false;
        if (S.q) { var q = S.q.toLowerCase(); if ((p.name + ' ' + p.sku + ' ' + p.category + ' ' + (p.origin || '')).toLowerCase().indexOf(q) < 0) return false; }
        return true;
      });
      if (S.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (S.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (S.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      return list;
    };
    var renderCatalog = function () {
      var box = $('#catalog'); if (!box) return;
      var list = visible();
      if (!list.length) { box.innerHTML = '<div class="empty"><span class="ms" style="font-size:40px">search_off</span><p>No hay productos para este filtro' + (S.showFavs ? ' en tus favoritos' : '') + '.</p></div>'; return; }
      if (D.layout.catalog === 'table') {
        box.innerHTML = '<div class="table-wrap"><table class="qtable"><thead><tr><th>Producto</th><th>Categoría</th><th style="text-align:right">Precio por lote</th><th>MOQ</th><th>Disponible</th><th>Cantidad</th><th style="text-align:right">Subtotal</th><th></th></tr></thead><tbody>' + list.map(function (p) {
          var avail = p.stock - reservedOf(p.id);
          var q = S.draftQty[p.id] != null ? S.draftQty[p.id] : 0;
          return '<tr><td><div class="prod">' + imgTag(p) + '<div><b data-open="' + p.id + '" style="cursor:pointer">' + esc(p.name) + '</b><div class="mono">SKU ' + esc(p.sku) + ' · ' + esc(p.origin || '') + '</div></div></div></td><td data-l="Categoría">' + esc(p.category) + '</td><td data-l="Precio por lote" style="text-align:right;font-weight:700">' + money(p.price) + '</td><td data-l="MOQ">' + p.moq + '</td><td data-l="Disponible">' + (avail > 0 ? avail + ' uds' : '<span class="soldout">Agotado</span>') + '</td><td data-l="Cantidad"><input type="number" min="0" step="1" max="' + Math.max(0, avail) + '" value="' + q + '" data-draft="' + p.id + '" aria-label="Cantidad de ' + esc(p.name) + '"' + (avail <= 0 ? ' disabled' : '') + '></td><td data-l="Subtotal" style="text-align:right" data-sub="' + p.id + '">' + money(q * p.price) + '</td><td class="q-add"><button class="add-btn" data-add="' + p.id + '" title="Agregar MOQ"' + (avail <= 0 ? ' disabled' : '') + '><span class="ms">add_shopping_cart</span></button></td></tr>';
        }).join('') + '</tbody></table></div>';
        return;
      }
      var wide = D.theme === 'aura' || D.theme === 'boutique';
      box.innerHTML = '<div class="grid">' + list.map(function (p) {
        var avail = p.stock - reservedOf(p.id);
        var inCart = reservedOf(p.id) > 0;
        var fav = S.favs.indexOf(p.id) >= 0;
        var btn = avail <= 0
          ? '<span class="soldout">Agotado</span>'
          : (wide ? '' : '<button class="add-btn' + (inCart ? ' in' : '') + '" data-add="' + p.id + '" title="Añadir al carrito"><span class="ms">' + (inCart ? 'check' : 'add_shopping_cart') + '</span></button>');
        return '<article class="card"><div class="media" data-open="' + p.id + '">' + imgTag(p) + (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') + (D.plugins.wishlist ? '<button class="fav' + (fav ? ' on' : '') + '" data-fav="' + p.id + '" title="Favorito"><span class="ms' + (fav ? ' fill' : '') + '">favorite</span></button>' : '') + (avail > 0 && avail <= 5 ? '<span class="stock-tag">Quedan ' + avail + '</span>' : '') + '</div><div class="body"><span class="origin">' + esc(p.origin || p.category) + '</span><h3 data-open="' + p.id + '">' + esc(p.name) + '</h3>' + stars(p) + '<p class="desc">' + esc(p.description || '') + '</p><div class="foot"><div>' + (p.compareAt > p.price ? '<div class="price-old">' + money(p.compareAt) + '</div>' : '') + '<div class="price">' + money(p.price) + ' <small>' + CUR + '</small></div></div>' + btn + '</div>' + (wide && avail > 0 ? '<button class="add-wide" data-add="' + p.id + '"><span class="ms">shopping_bag</span> ' + (inCart ? 'Agregar otra' : 'Añadir al carrito') + '</button>' : '') + '</div></article>';
      }).join('') + '</div>';
    };

    /* ---------- Panel del carrito ---------- */
    var focusParent = function () { if (inPreview) window.parent.postMessage({ source: 'senaventas-store', type: 'focus' }, '*'); };
    var openCart = function () { renderCart(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); focusParent(); };
    var closeAll = function () { $('#drawer').classList.remove('on'); $('#modal').classList.remove('on'); $('#scrim').classList.remove('on'); };
    var renderCart = function () {
      var t = totals();
      var lines = S.cart.map(function (l, i) {
        if (l.kind === 'bundle') {
          return '<div class="line"><div style="width:64px;height:64px;border-radius:10px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:var(--primary)"><span class="ms" style="font-size:30px">redeem</span></div><div class="info"><b>' + esc(D.store.promo.title) + '</b><small>Kit promocional</small><div style="display:flex;justify-content:space-between;align-items:center"><div class="qty"><button data-q="' + i + '" data-d="-1">−</button><span>' + l.qty + '</span><button data-q="' + i + '" data-d="1">+</button></div><b>' + money(lineUnit(l) * l.qty) + '</b></div></div></div>';
        }
        var p = byId(l.id); if (!p) return '';
        return '<div class="line">' + imgTag(p) + '<div class="info"><b>' + esc(p.name) + '</b><small>' + esc(p.sku) + (p.moq > 1 ? ' · MOQ ' + p.moq : '') + '</small><div style="display:flex;justify-content:space-between;align-items:center"><div class="qty"><button data-q="' + i + '" data-d="-1" aria-label="Restar">−</button><span>' + l.qty + '</span><button data-q="' + i + '" data-d="1" aria-label="Sumar">+</button></div><b>' + money(p.price * l.qty) + '</b></div></div></div>';
      }).join('');
      var bar = (D.plugins.freeShippingBar && D.store.freeShippingThreshold > 0 && t.items > 0) ? '<div class="ship-bar"><div style="display:flex;justify-content:space-between;font-weight:600"><span><span class="ms">local_shipping</span> ' + (t.missing > 0 ? 'Te faltan <b>' + money(t.missing) + '</b> para envío gratis' : '¡Tienes envío gratis!') + '</span><span>' + t.pct + '%</span></div><div class="track"><i style="width:' + t.pct + '%"></i></div></div>' : '';
      var coupon = D.plugins.coupons ? '<div class="coupon"><input id="coupon" placeholder="Cupón didáctico" value="' + esc(S.coupon ? S.coupon.code : '') + '" aria-label="Cupón"><button class="btn btn-soft" data-act="apply-coupon" style="padding:9px 14px">' + (S.coupon ? 'Quitar' : 'Aplicar') + '</button></div>' : '';
      $('#drawer').innerHTML = '<div class="drawer-h"><h3><span class="ms" style="color:var(--primary)">shopping_bag</span> Tu carrito <span class="chip on" style="padding:2px 9px">' + t.items + '</span></h3><button class="icon-btn" data-act="close" aria-label="Cerrar"><span class="ms">close</span></button></div>' + bar +
        '<div class="drawer-b">' + (lines || '<div class="empty"><span class="ms" style="font-size:40px">remove_shopping_cart</span><p>Tu carrito está vacío.</p><a class="btn btn-primary" href="#catalogo" data-act="close">Ir al catálogo</a></div>') + (t.items ? coupon : '') + '</div>' +
        (t.items ? '<div class="drawer-f"><div class="sum"><span>Subtotal</span><b>' + money(t.subtotal) + '</b></div>' + (t.discount ? '<div class="sum"><span>Descuento ' + esc(S.coupon.code) + '</span><b style="color:var(--primary)">−' + money(t.discount) + '</b></div>' : '') + '<div class="sum"><span>Envío estimado (' + esc(t.zoneLabel) + ')</span><b>' + (t.shipping ? money(t.shipping) : 'Gratis') + '</b></div><div class="sum total"><span>Total estimado</span><b>' + money(t.total) + '</b></div><button class="btn btn-primary btn-block" data-act="checkout"><span class="ms">lock</span> Proceder al pago simulado</button><div class="note"><span class="ms">verified_user</span> Pasarela de prueba SENAVENTAS · Sin cobros reales</div></div>' : '');
    };

    /* ---------- Modales ---------- */
    var modal = function (html, wide) {
      var b = $('#modal-box');
      b.className = 'box' + (wide ? ' wide' : '');
      b.innerHTML = '<button class="x no-print" data-act="close" aria-label="Cerrar"><span class="ms">close</span></button>' + html;
      $('#modal').classList.add('on'); $('#scrim').classList.add('on');
      $('#drawer').classList.remove('on');
      focusParent();
    };
    var openProduct = function (id) {
      var p = byId(id); if (!p) return;
      track('view_item', { id: p.id, sku: p.sku, value: p.price });
      var avail = p.stock - reservedOf(p.id);
      modal('<div class="pd"><div class="img">' + imgTag(p) + '</div><div><span class="eyebrow">' + esc(p.origin || p.category) + '</span><h2>' + esc(p.name) + '</h2>' + stars(p) + '<p class="muted">' + esc(p.description || '') + '</p><div style="display:flex;align-items:baseline;gap:10px;margin:14px 0">' + (p.compareAt > p.price ? '<span class="price-old">' + money(p.compareAt) + '</span>' : '') + '<span class="price" style="font-size:26px">' + money(p.price) + '</span><small class="muted">' + CUR + '</small></div><div class="hint" style="display:grid;gap:4px"><span><b>SKU:</b> ' + esc(p.sku) + '</span><span><b>Categoría:</b> ' + esc(p.category) + '</span><span><b>Disponibles:</b> ' + Math.max(0, avail) + ' unidades</span>' + (p.moq > 1 ? '<span><b>Pedido mínimo:</b> ' + p.moq + ' unidades</span>' : '') + '</div>' + (avail > 0 ? '<div style="display:flex;gap:10px;align-items:center"><div class="field" style="margin:0;width:100px"><input type="number" id="pd-qty" min="' + p.moq + '" max="' + avail + '" value="' + p.moq + '" aria-label="Cantidad"></div><button class="btn btn-primary" style="flex:1" data-act="pd-add" data-id="' + p.id + '"><span class="ms">add_shopping_cart</span> Añadir al carrito</button></div>' : '<p class="soldout">Producto agotado</p>') + '</div></div>', true);
    };

    var checkoutData = { customer: {}, method: 'nequi' };
    var openCheckout = function () {
      if (!S.cart.length) return;
      var t = totals(checkoutData.customer.dep);
      track('begin_checkout', { value: t.total, items: t.items });
      var c = checkoutData.customer;
      var deps = D.departamentos.map(function (d) { return '<option' + ((c.dep || D.store.city) === d ? ' selected' : '') + '>' + esc(d) + '</option>'; }).join('');
      modal('<div class="steps"><i class="on"></i><i></i><i></i></div><h2 style="font-size:22px;margin-bottom:4px">Datos de envío</h2><p class="muted" style="margin-top:0;font-size:13px">Usa datos ficticios. Esta tienda es un entorno de aprendizaje.</p><form id="f-ship"><div class="field"><label>Nombre completo</label><input name="name" required value="' + esc(c.name || '') + '" placeholder="Ej: Laura Gómez"></div><div class="row2"><div class="field"><label>Correo</label><input name="email" type="email" required value="' + esc(c.email || '') + '" placeholder="laura@correo.co"></div><div class="field"><label>Celular</label><input name="phone" required pattern="3[0-9]{9}" value="' + esc(c.phone || '') + '" placeholder="3001234567"></div></div><div class="row2"><div class="field"><label>Departamento</label><select name="dep" id="dep">' + deps + '</select></div><div class="field"><label>Ciudad / Municipio</label><input name="city" required value="' + esc(c.city || '') + '" placeholder="Ej: Medellín"></div></div><div class="field"><label>Dirección</label><input name="address" required value="' + esc(c.address || '') + '" placeholder="Calle 10 # 20-30"></div><div class="hint" id="ship-est"></div><div class="err" id="err"></div><button class="btn btn-primary btn-block" type="submit">Continuar al pago <span class="ms">arrow_forward</span></button></form>');
      var upd = function () { var tt = totals($('#dep').value); $('#ship-est').innerHTML = '<b>Envío:</b> ' + (tt.shipping ? money(tt.shipping) : 'Gratis') + ' · ' + esc(tt.zoneLabel) + '<br><b>Total a pagar:</b> ' + money(tt.total); };
      $('#dep').addEventListener('change', upd); upd();
      $('#f-ship').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target;
        if (!f.checkValidity()) { $('#err').textContent = 'Revisa los campos: el celular debe tener 10 dígitos e iniciar en 3.'; return; }
        checkoutData.customer = { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), dep: f.dep.value, city: f.city.value.trim(), address: f.address.value.trim() };
        openPayment();
      });
    };

    var METHODS = D.plugins.payments
      ? [['nequi', 'Nequi', 'phone_iphone'], ['daviplata', 'Daviplata', 'account_balance_wallet'], ['pse', 'PSE', 'account_balance'], ['card', 'Tarjeta', 'credit_card'], ['cod', 'Contraentrega', 'local_shipping']]
      : [['cod', 'Contraentrega', 'local_shipping'], ['transfer', 'Transferencia', 'sync_alt']];
    var openPayment = function () {
      if (!METHODS.some(function (m) { return m[0] === checkoutData.method; })) checkoutData.method = METHODS[0][0];
      var t = totals(checkoutData.customer.dep);
      var m = checkoutData.method;
      var detail = '';
      if (m === 'card') detail = '<div class="hint">Tarjetas de prueba: <code>4242 4242 4242 4242</code> aprueba · <code>4000 0000 0000 0002</code> rechaza por fondos insuficientes. Cualquier fecha futura y CVV de 3 dígitos.</div><div class="field"><label>Número de tarjeta</label><input id="card" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="off"></div><div class="row2"><div class="field"><label>Vence (MM/AA)</label><input id="exp" placeholder="12/28" autocomplete="off"></div><div class="field"><label>CVV</label><input id="cvv" placeholder="123" autocomplete="off"></div></div>';
      else if (m === 'nequi' || m === 'daviplata') detail = '<div class="hint">Recibirás una notificación simulada en la app ' + (m === 'nequi' ? 'Nequi' : 'Daviplata') + '. Usa cualquier celular de 10 dígitos que inicie en 3.</div><div class="field"><label>Celular asociado</label><input id="wallet" value="' + esc(checkoutData.customer.phone || '') + '" placeholder="3001234567"></div>';
      else if (m === 'pse') detail = '<div class="hint">Serás redirigido a un banco simulado. Selecciona cualquier entidad.</div><div class="field"><label>Banco</label><select id="bank"><option>Bancolombia</option><option>Banco de Bogotá</option><option>Davivienda</option><option>BBVA Colombia</option><option>Banco Agrario</option></select></div>';
      else detail = '<div class="hint">El pedido queda registrado como <b>pendiente de pago</b>. Practica la conciliación desde el panel de pedidos.</div>';
      modal('<div class="steps"><i class="on"></i><i class="on"></i><i></i></div><h2 style="font-size:22px;margin-bottom:12px">Método de pago simulado</h2><div class="pay-opts">' + METHODS.map(function (x) { return '<button type="button" class="pay-opt' + (x[0] === m ? ' on' : '') + '" data-method="' + x[0] + '"><span class="ms">' + x[2] + '</span>' + x[1] + '</button>'; }).join('') + '</div>' + detail + '<div class="receipt"><div><span>Subtotal</span><b>' + money(t.subtotal) + '</b></div>' + (t.discount ? '<div><span>Descuento</span><b>−' + money(t.discount) + '</b></div>' : '') + '<div><span>Envío</span><b>' + (t.shipping ? money(t.shipping) : 'Gratis') + '</b></div><div style="font-size:15px"><span><b>Total</b></span><b style="color:var(--primary)">' + money(t.total) + '</b></div></div><div class="err" id="err"></div><div style="display:flex;gap:10px"><button class="btn btn-soft" data-act="checkout">Atrás</button><button class="btn btn-primary" style="flex:1" data-act="pay"><span class="ms">lock</span> Pagar ' + money(t.total) + ' (simulado)</button></div>');
    };

    var luhn = function (n) { var s = 0, alt = false; for (var i = n.length - 1; i >= 0; i--) { var d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return n.length >= 13 && s % 10 === 0; };
    var pay = function () {
      var m = checkoutData.method, err = $('#err'), fail = null;
      if (m === 'card') {
        var n = ($('#card').value || '').replace(/\D/g, '');
        var exp = ($('#exp').value || '').trim();
        var cvv = ($('#cvv').value || '').trim();
        if (!luhn(n)) { err.textContent = 'Número de tarjeta inválido (no supera la validación Luhn).'; return; }
        var mm = exp.match(/^(\d{2})\/(\d{2})$/);
        if (!mm || +mm[1] < 1 || +mm[1] > 12 || new Date(2000 + +mm[2], +mm[1], 0) < new Date()) { err.textContent = 'Fecha de vencimiento inválida o vencida.'; return; }
        if (!/^\d{3,4}$/.test(cvv)) { err.textContent = 'CVV inválido.'; return; }
        if (n === '4000000000000002') fail = 'Transacción rechazada: fondos insuficientes (simulado).';
        checkoutData.ref = '•••• ' + n.slice(-4);
      } else if (m === 'nequi' || m === 'daviplata') {
        var w = ($('#wallet').value || '').trim();
        if (!/^3\d{9}$/.test(w)) { err.textContent = 'Ingresa un celular de 10 dígitos que inicie en 3.'; return; }
        checkoutData.ref = w.slice(0, 3) + '•••' + w.slice(-2);
      } else if (m === 'pse') { checkoutData.ref = $('#bank').value; }
      else checkoutData.ref = '';
      var steps = { card: 'Validando con la red de tarjetas de prueba...', nequi: 'Esperando aprobación en la app Nequi (simulada)...', daviplata: 'Esperando aprobación en Daviplata (simulada)...', pse: 'Redirigiendo a ' + esc(checkoutData.ref) + ' (banco simulado)...', cod: 'Registrando pedido contraentrega...', transfer: 'Registrando pedido por transferencia...' };
      modal('<div class="steps"><i class="on"></i><i class="on"></i><i class="on"></i></div><div class="result"><div class="spinner"></div><h3>Procesando</h3><p class="muted">' + steps[m] + '</p></div>');
      setTimeout(function () { fail ? finishFail(fail) : createOrder(); }, m === 'pse' ? 2200 : 1500);
    };
    var finishFail = function (msg) {
      modal('<div class="result bad"><div class="big"><span class="ms">block</span></div><h2 style="font-size:22px">Pago rechazado</h2><p class="muted">' + esc(msg) + '</p><p class="muted" style="font-size:13px">Lección: el comercio debe mostrar un mensaje claro y permitir reintentar con otro medio.</p><button class="btn btn-primary" data-act="retry-pay">Intentar con otro medio</button></div>');
    };

    var pendingOrder = null;
    var createOrder = function () {
      var t = totals(checkoutData.customer.dep);
      var names = { nequi: 'Nequi', daviplata: 'Daviplata', pse: 'PSE', card: 'Tarjeta', cod: 'Contraentrega', transfer: 'Transferencia' };
      var paid = ['nequi', 'daviplata', 'pse', 'card'].indexOf(checkoutData.method) >= 0;
      var items = [];
      S.cart.forEach(function (l) {
        if (l.kind === 'bundle') {
          (D.store.promo.productIds || []).forEach(function (id) { var p = byId(id); if (p) items.push({ id: p.id, sku: p.sku, name: p.name + ' (kit)', price: 0, qty: l.qty, bundle: true }); });
          items.push({ id: 'bundle', sku: 'KIT', name: D.store.promo.title, price: Number(D.store.promo.price) || 0, qty: l.qty, bundleHeader: true });
        } else { var p = byId(l.id); items.push({ id: p.id, sku: p.sku, name: p.name, price: p.price, qty: l.qty }); }
      });
      var order = {
        id: 'SV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10),
        date: Date.now(), items: items, subtotal: t.subtotal, discount: t.discount, coupon: S.coupon ? S.coupon.code : '',
        shipping: t.shipping, shippingZone: t.zoneLabel, total: t.total, customer: checkoutData.customer,
        payment: { method: names[checkoutData.method], ref: checkoutData.ref || '', status: paid ? 'aprobado' : 'pendiente' },
        status: paid ? 'pagado' : 'pendiente', channel: D.mode === 'export' ? 'sitio publicado' : 'vista previa'
      };
      pendingOrder = order;
      if (inPreview) {
        window.parent.postMessage({ source: 'senaventas-store', type: 'order', order: order }, '*');
        setTimeout(function () { if (pendingOrder && pendingOrder.id === order.id) finishOrder({ ok: true }); }, 2500);
      } else finishOrder({ ok: true });
    };
    var finishOrder = function (ack) {
      var order = pendingOrder; if (!order) return;
      pendingOrder = null;
      /* El panel devuelve el stock oficial; sin panel (sitio publicado) se descuenta aquí. */
      if (ack.stock) D.products.forEach(function (p) { if (ack.stock[p.id] != null) p.stock = ack.stock[p.id]; });
      if (!ack.ok) { renderCatalog(); finishFail(ack.message || 'El inventario cambió. Revisa tu carrito.'); return; }
      if (!ack.stock) order.items.forEach(function (it) { var p = byId(it.id); if (p && !it.bundleHeader) p.stock = Math.max(0, p.stock - it.qty); });
      if (D.mode === 'export') {
        var list = load('orders', []); list.unshift(order); save('orders', list.slice(0, 50));
        var stockMap = {}; D.products.forEach(function (p) { stockMap[p.id] = p.stock; }); save('stock', stockMap);
      }
      track('purchase', { id: order.id, value: order.total, items: order.items.length });
      S.cart = []; S.coupon = null; persist();
      var wa = '';
      if (D.plugins.whatsapp && D.store.whatsapp) {
        var txt = 'Hola ' + D.store.name + ', confirmo mi pedido ' + order.id + ':\n' + order.items.filter(function (i) { return !i.bundle; }).map(function (i) { return '• ' + i.qty + ' x ' + i.name; }).join('\n') + '\nTotal: ' + money(order.total) + ' (' + order.payment.method + ')\nEnvío a: ' + order.customer.city + ', ' + order.customer.dep;
        wa = '<a class="btn btn-soft" style="flex:1" target="_blank" rel="noopener" href="https://wa.me/' + String(D.store.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(txt) + '"><span class="ms">chat</span> Confirmar por WhatsApp</a>';
      }
      modal('<div class="result"><div class="big"><span class="ms">check_circle</span></div><span class="chip on">Simulación exitosa</span><h2 style="font-size:22px;margin:10px 0 4px">¡Pedido ' + (order.status === 'pagado' ? 'confirmado' : 'registrado') + '!</h2><p class="muted" style="margin:0">Experimentaste el flujo de compra de un cliente real. No se realizó ningún cobro.</p><div class="receipt"><div><span>Número de pedido</span><b style="font-family:monospace">' + esc(order.id) + '</b></div><div><span>Método</span><b>' + esc(order.payment.method) + (order.payment.ref ? ' · ' + esc(order.payment.ref) : '') + '</b></div><div><span>Estado del pago</span><b>' + esc(order.payment.status) + '</b></div><div><span>Envío</span><b>' + (order.shipping ? money(order.shipping) : 'Gratis') + '</b></div><div><span>Total</span><b style="color:var(--primary)">' + money(order.total) + '</b></div></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary" style="flex:1" data-act="close">Seguir comprando</button>' + wa + '</div></div>');
    };

    var showQuote = function () {
      var rows = [], total = 0;
      D.products.forEach(function (p) {
        var q = S.draftQty[p.id] || 0;
        S.cart.forEach(function (l) { if (l.id === p.id && l.kind !== 'bundle') q += l.qty; });
        if (q > 0) { rows.push('<tr><td>' + esc(p.sku) + '</td><td>' + esc(p.name) + '</td><td style="text-align:right">' + q + '</td><td style="text-align:right">' + money(p.price) + '</td><td style="text-align:right">' + money(p.price * q) + '</td></tr>'); total += p.price * q; }
      });
      var html = '<div id="quote-print"><span class="eyebrow">Cotización simulada</span><h2 style="font-size:22px;margin:6px 0">' + esc(D.store.name) + '</h2><p class="muted" style="margin:0 0 12px;font-size:13px">Fecha: ' + new Date().toLocaleDateString('es-CO') + ' · Vigencia 15 días · Precios en ' + CUR + '</p>' + (rows.length ? '<div class="table-wrap"><table class="qtable"><thead><tr><th>SKU</th><th>Producto</th><th style="text-align:right">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div><p style="text-align:right;font-size:18px;font-weight:800">Total: ' + money(total) + '</p>' : '<div class="empty">Escribe cantidades en la tabla de pedido para armar tu cotización.</div>') + '<p class="muted" style="font-size:11.5px">Documento educativo generado por SENAVENTAS. No constituye oferta comercial.</p></div>' + (rows.length ? '<button class="btn btn-primary no-print" data-act="print"><span class="ms">print</span> Imprimir / Guardar PDF</button>' : '');
      modal(html, true);
    };

    var showOrders = function () {
      var list = D.mode === 'export' ? load('orders', []) : [];
      modal('<h2 style="font-size:22px;margin-bottom:10px">Mis pedidos</h2>' + (D.mode !== 'export' ? '<div class="hint">En la vista previa, los pedidos se registran en el panel del creador (sección Pedidos).</div>' : '') + (list.length ? list.map(function (o) { return '<div class="receipt"><div><b style="font-family:monospace">' + esc(o.id) + '</b><span>' + new Date(o.date).toLocaleString('es-CO') + '</span></div><div><span>' + o.items.filter(function (i) { return !i.bundle; }).length + ' líneas · ' + esc(o.payment.method) + '</span><b>' + money(o.total) + '</b></div></div>'; }).join('') : '<div class="empty">Aún no tienes pedidos en este navegador.</div>'));
    };

    /* ---------- Eventos ---------- */
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act],[data-add],[data-open],[data-fav],[data-q],[data-cat],[data-cat-link],[data-method]');
      if (!el) { if (e.target.id === 'scrim' || e.target.id === 'modal') closeAll(); return; }
      if (el.hasAttribute('data-add')) {
        e.preventDefault();
        var id = el.getAttribute('data-add');
        if (D.layout.catalog === 'table') { var dq = S.draftQty[id]; var p0 = byId(id); if (addToCart(id, dq && dq > 0 ? Math.max(dq, p0.moq) : p0.moq)) { S.draftQty[id] = 0; renderCatalog(); } }
        else addToCart(id, 1);
        return;
      }
      if (el.hasAttribute('data-open')) { openProduct(el.getAttribute('data-open')); return; }
      if (el.hasAttribute('data-fav')) {
        e.stopPropagation();
        var fid = el.getAttribute('data-fav'); var i = S.favs.indexOf(fid);
        if (i >= 0) S.favs.splice(i, 1); else { S.favs.push(fid); track('add_to_wishlist', { id: fid }); }
        save('favs', S.favs); updFavs(); renderCatalog(); return;
      }
      if (el.hasAttribute('data-q')) { setQty(+el.getAttribute('data-q'), +el.getAttribute('data-d')); return; }
      if (el.hasAttribute('data-method')) { checkoutData.method = el.getAttribute('data-method'); openPayment(); return; }
      if (el.hasAttribute('data-cat') || el.hasAttribute('data-cat-link')) {
        S.cat = el.getAttribute('data-cat') != null ? el.getAttribute('data-cat') : el.getAttribute('data-cat-link');
        S.showFavs = false;
        $$('[data-cat]').forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-cat') === S.cat); });
        renderCatalog();
        if (el.hasAttribute('data-cat-link')) { var cat = $('#catalogo'); if (cat) { e.preventDefault(); cat.scrollIntoView({ behavior: 'smooth' }); } }
        return;
      }
      var act = el.getAttribute('data-act');
      if (act === 'open-cart') { e.preventDefault(); openCart(); }
      else if (act === 'close') { closeAll(); }
      else if (act === 'checkout') openCheckout();
      else if (act === 'pay') pay();
      else if (act === 'retry-pay') openPayment();
      else if (act === 'add-bundle') addBundle();
      else if (act === 'quote') showQuote();
      else if (act === 'print') window.print();
      else if (act === 'my-orders') { e.preventDefault(); showOrders(); }
      else if (act === 'show-favs') { S.showFavs = !S.showFavs; S.cat = ''; renderCatalog(); var c2 = $('#catalogo'); if (c2) c2.scrollIntoView({ behavior: 'smooth' }); toast(S.showFavs ? 'Mostrando tus favoritos' : 'Mostrando todo el catálogo', 'favorite'); }
      else if (act === 'pd-add') { var q = Math.max(1, parseInt($('#pd-qty').value, 10) || 1); if (addToCart(el.getAttribute('data-id'), q, true)) { closeAll(); openCart(); } }
      else if (act === 'add-all') {
        var n = 0;
        Object.keys(S.draftQty).forEach(function (id) { var q2 = S.draftQty[id]; if (q2 > 0) { var p = byId(id); if (addToCart(id, Math.max(q2, p.moq), true)) { n++; S.draftQty[id] = 0; } } });
        if (n) { renderCatalog(); openCart(); } else toast('Escribe cantidades en la tabla primero', 'edit');
      } else if (act === 'apply-coupon') {
        if (S.coupon) { S.coupon = null; renderCart(); return; }
        var code = ($('#coupon').value || '').trim().toUpperCase();
        var found = null; D.coupons.forEach(function (c) { if (c.code.toUpperCase() === code) found = c; });
        if (found) { S.coupon = found; toast('Cupón ' + found.code + ' aplicado', 'confirmation_number'); } else toast('Cupón no válido', 'error');
        renderCart();
      }
    });
    document.addEventListener('input', function (e) {
      if (e.target.id === 'q') { S.q = e.target.value; renderCatalog(); }
      if (e.target.hasAttribute && e.target.hasAttribute('data-draft')) {
        var id = e.target.getAttribute('data-draft'); var p = byId(id);
        var v = Math.max(0, parseInt(e.target.value, 10) || 0);
        S.draftQty[id] = v;
        var cell = document.querySelector('[data-sub="' + id + '"]'); if (cell) cell.textContent = money(v * p.price);
      }
    });
    document.addEventListener('change', function (e) { if (e.target.id === 'sort') { S.sort = e.target.value; renderCatalog(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    window.addEventListener('message', function (e) {
      var m = e.data || {};
      if (m.source !== 'senaventas-app') return;
      if (m.type === 'order-ack' && pendingOrder && m.orderId === pendingOrder.id) {
        finishOrder({ ok: m.ok, message: m.message, stock: m.stock });
      }
      if (m.type === 'open-cart') openCart();
    });
    var updFavs = function () { var fc = $('#fav-count'); if (fc) { fc.textContent = S.favs.length; fc.hidden = !S.favs.length; } };

    /* Stock guardado en el navegador para el sitio publicado */
    if (D.mode === 'export') { var st = load('stock', null); if (st) D.products.forEach(function (p) { if (st[p.id] != null && st[p.id] < p.stock) p.stock = st[p.id]; }); }
    S.cart = S.cart.filter(function (l) { return l.kind === 'bundle' || byId(l.id); });
    updFavs(); persist();
    track('page_view', { products: D.products.length });

    /* API de consulta para practicar desde la consola del navegador */
    window.tiendaAPI = {
      productos: function () { return JSON.parse(JSON.stringify(D.products)); },
      producto: function (sku) { return D.products.filter(function (p) { return p.sku === sku; })[0] || null; },
      carrito: function () { return JSON.parse(JSON.stringify(S.cart)); },
      totales: function () { return totals(); },
      pedidos: function () { return load('orders', []); },
      ayuda: 'tiendaAPI.productos(), tiendaAPI.producto("SKU"), tiendaAPI.carrito(), tiendaAPI.totales(), tiendaAPI.pedidos()'
    };
  }
})(window.SV);

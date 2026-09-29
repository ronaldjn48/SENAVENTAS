/* ==========================================================================
   SENAVENTAS · Aplicación del creador de tiendas
   ========================================================================== */
(function (SV) {
  const U = SV.util;
  const esc = U.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const ic = (n, c = '') => `<span class="ms ${c}">${n}</span>`;

  const App = SV.app = {
    s: null,
    route: 'inicio',
    sessions: [],
    installPrompt: null,
    ui: {
      cfgTab: 'temas', apiTab: 'apps', device: 'desktop',
      prodQ: '', prodCat: '', prodStatus: '', prodPage: 1, prodPer: 10, sel: new Set(),
      orderStatus: '', draft: null, savedAt: 0, dirty: false, saveError: false,
      liveEvents: [], unseen: 0,
      con: { method: 'GET', path: '/api/v1/products', body: '', token: '', lang: 'curl', resp: null, busy: false, req: null },
      busy: {}
    }
  };

  const ROUTES = [
    { id: 'inicio', label: 'Inicio & Sesiones', icon: 'home' },
    { id: 'configuracion', label: 'Configuración & Temas', icon: 'tune' },
    { id: 'productos', label: 'Productos & Inventario', icon: 'inventory_2', count: (s) => s.products.length },
    { id: 'pedidos', label: 'Pedidos', icon: 'receipt_long', count: (s) => s.orders.length },
    { id: 'tienda', label: 'Mi Tienda en Vivo', icon: 'storefront' },
    { id: 'api', label: 'Integraciones & API', icon: 'hub', count: (s) => Object.values(s.integrations).filter((i) => i.connected).length || '' },
    { id: 'publicar', label: 'Publicar Tienda', icon: 'rocket_launch' }
  ];

  const money = (n) => U.money(n, App.s ? App.s.store.currency : 'COP');

  /* ======================================================================
     Estado, guardado y utilidades de interfaz
     ====================================================================== */
  const saveNow = async () => {
    if (!App.s) return;
    try {
      await SV.storage.put(App.s);
      SV.storage.setLast(App.s.id);
      App.ui.savedAt = Date.now();
      App.ui.dirty = false;
      App.ui.saveError = false;
    } catch (e) {
      App.ui.saveError = true;
      toast('No se pudo guardar: ' + (e && e.message ? e.message : 'almacenamiento lleno'), 'err', 'error');
    }
    renderSaveStatus();
  };
  const saveSoon = U.debounce(saveNow, 450);

  App.commit = (msg, opts = {}) => {
    const s = App.s;
    s.updatedAt = Date.now();
    if (msg) {
      s.activity.unshift({ at: Date.now(), text: msg });
      s.activity = s.activity.slice(0, 120);
      App.ui.unseen++;
    }
    App.ui.dirty = true;
    renderSaveStatus();
    saveSoon();
    renderChrome();
    if (opts.render) render();
    else refreshPartials();
  };

  const emit = (event, data) => {
    const n = SV.webhooks.dispatch(App.s, event, data, () => { App.commit(null); if (App.route === 'api' && App.ui.apiTab === 'webhooks') render(); });
    if (n) App.s.activity.unshift({ at: Date.now(), text: 'Webhook ' + event + ' enviado a ' + n + ' destino(s)' });
  };

  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = (obj, path, val) => {
    const ks = path.split('.');
    let o = obj;
    ks.slice(0, -1).forEach((k) => { if (o[k] == null) o[k] = {}; o = o[k]; });
    o[ks[ks.length - 1]] = val;
  };

  const toast = App.toast = (msg, type = 'ok', icon) => {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = ic(icon || (type === 'err' ? 'error' : 'check_circle')) + '<span>' + esc(msg) + '</span>';
    $('#toasts').appendChild(t);
    setTimeout(() => { t.style.transition = '.3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 3200);
  };

  /* Capas: modales y paneles laterales apilables */
  const layers = [];
  const openLayer = (html, kind, onClose) => {
    const root = document.createElement('div');
    root.className = 'layer';
    root.innerHTML = `<div class="${kind === 'drawer' ? 'drawer-scrim' : 'modal-scrim'}" data-a="close-overlay"></div>` + html;
    $('#overlay-root').appendChild(root);
    layers.push({ root, onClose });
    const first = root.querySelector('input:not([type=hidden]):not([type=checkbox]),select,textarea');
    if (first && kind === 'modal') setTimeout(() => first.focus(), 60);
    return root;
  };
  App.closeOverlay = (all) => {
    do {
      const l = layers.pop();
      if (!l) break;
      l.root.remove();
      if (l.onClose) l.onClose();
    } while (all);
  };
  App.modal = ({ title, sub, body, foot, wide, onClose }) => openLayer(
    `<div class="modal"><div class="modal-box ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-h"><div><h2>${title}</h2>${sub ? `<p class="muted small">${sub}</p>` : ''}</div><button class="icon-btn" data-a="close-overlay" aria-label="Cerrar">${ic('close')}</button></div><div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ''}</div></div>`, 'modal', onClose);
  App.drawer = ({ title, sub, icon, body, foot, top, onClose }) => openLayer(
    `<aside class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="drawer-h"><div class="row"><div class="avatar" style="border-radius:8px;background:var(--primary-c)">${ic(icon || 'edit')}</div><div><h2>${title}</h2>${sub ? `<small class="muted">${sub}</small>` : ''}</div></div><button class="icon-btn" data-a="close-overlay" aria-label="Cerrar">${ic('close')}</button></div>${top || ''}<div class="drawer-b">${body}</div>${foot ? `<div class="drawer-f">${foot}</div>` : ''}</aside>`, 'drawer', onClose);
  App.confirm = (title, text, { ok = 'Confirmar', danger = false } = {}) => new Promise((resolve) => {
    let done = false;
    const root = App.modal({
      title, body: `<p>${text}</p>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-role="ok">${esc(ok)}</button>`,
      onClose: () => { if (!done) resolve(false); }
    });
    root.querySelector('[data-role=ok]').addEventListener('click', () => { done = true; App.closeOverlay(); resolve(true); });
  });

  /* ======================================================================
     Progreso pedagógico y checklist de publicación
     ====================================================================== */
  const steps = (s) => {
    const pubs = s.products.filter((p) => p.status === 'publicado');
    return [
      { title: 'Identidad de marca', desc: 'Nombre, lema y ficha del aprendiz', done: s.store.name.trim().length > 2 && s.store.slogan.trim().length > 5 && s.owner.name.trim() && s.owner.name !== 'Aprendiz SENA', route: 'configuracion', tab: 'identidad' },
      { title: 'Tema visual', desc: 'Elige y personaliza una plantilla', done: !!s.progress.themeChosen, route: 'configuracion', tab: 'temas' },
      { title: 'Catálogo virtual', desc: '3 o más productos publicados con foto y costo', done: pubs.filter((p) => p.image && Number(p.cost) > 0).length >= 3, route: 'productos' },
      { title: 'Prueba de compra', desc: 'Pedido simulado desde la tienda', done: s.orders.length > 0, route: 'tienda' },
      { title: 'Publicación', desc: 'Lanza la tienda y descarga el sitio', done: !!s.published, route: 'publicar' }
    ];
  };

  const seoScore = (s) => {
    const seo = s.store.seo || {};
    const checks = [
      [!!s.plugins.seo, 'Plugin SEO activo'],
      [(seo.title || '').length >= 20 && (seo.title || '').length <= 60, 'Título entre 20 y 60 caracteres (' + (seo.title || '').length + ')'],
      [(seo.description || '').length >= 70 && (seo.description || '').length <= 160, 'Descripción entre 70 y 160 caracteres (' + (seo.description || '').length + ')'],
      [(seo.keywords || '').split(',').filter((k) => k.trim()).length >= 3, 'Al menos 3 palabras clave'],
      [s.products.filter((p) => p.status === 'publicado').every((p) => (p.description || '').length >= 30), 'Descripciones de producto de 30+ caracteres'],
      [s.products.filter((p) => p.status === 'publicado').every((p) => p.image), 'Todas las fichas con imagen (OpenGraph)']
    ];
    return { checks, score: Math.round(checks.filter((c) => c[0]).length / checks.length * 100) };
  };

  const checklist = (s) => {
    const pubs = s.products.filter((p) => p.status === 'publicado');
    const integ = Object.values(s.integrations).filter((i) => i.connected).length;
    const lowMargin = pubs.filter((p) => U.margin(p.price, p.cost) < 20);
    return [
      { req: true, ok: s.store.name.trim().length > 2 && s.store.slogan.trim().length > 5, t: 'Nombre y lema de la tienda', d: 'Identidad clara en el encabezado.', route: 'configuracion', tab: 'identidad' },
      { req: true, ok: !!s.progress.themeChosen, t: 'Tema visual elegido', d: 'Activa o personaliza una plantilla.', route: 'configuracion', tab: 'temas' },
      { req: true, ok: pubs.length >= 3, t: 'Mínimo 3 productos publicados', d: pubs.length + ' publicados actualmente.', route: 'productos' },
      { req: true, ok: pubs.length > 0 && pubs.every((p) => p.image), t: 'Todos los productos publicados tienen foto', d: pubs.filter((p) => !p.image).length + ' sin imagen.', route: 'productos' },
      { req: false, ok: !!s.plugins.payments, t: 'Pasarela de pagos simulada activa', d: s.plugins.payments ? 'Nequi, Daviplata, PSE y tarjeta de prueba.' : 'Solo contraentrega y transferencia.', route: 'configuracion', tab: 'plugins' },
      { req: true, ok: !!s.plugins.shipping || Number(s.store.shippingFlat) > 0, t: 'Política de envío definida', d: s.plugins.shipping ? 'Tarifas por zona activas.' : 'Tarifa fija: ' + money(s.store.shippingFlat), route: 'configuracion', tab: 'identidad' },
      { req: true, ok: s.orders.length > 0, t: 'Prueba de compra realizada', d: s.orders.length + ' pedido(s) simulados.', route: 'tienda' },
      { req: false, ok: pubs.length > 0 && pubs.every((p) => (p.description || '').length >= 20), t: 'Descripciones completas', d: 'Mínimo 20 caracteres por producto.', route: 'productos' },
      { req: false, ok: lowMargin.length === 0 && pubs.every((p) => Number(p.cost) > 0), t: 'Costos cargados y margen bruto de 20% o más', d: lowMargin.length ? lowMargin.length + ' con margen bajo.' : 'Márgenes saludables.', route: 'productos' },
      { req: false, ok: seoScore(s).score >= 80, t: 'SEO de la tienda (80% o más)', d: 'Puntaje actual: ' + seoScore(s).score + '%.', route: 'configuracion', tab: 'contenido' },
      { req: false, ok: /^\d{10,13}$/.test(String(s.store.whatsapp).replace(/\D/g, '')) && /@/.test(s.store.email), t: 'Canales de contacto', d: 'WhatsApp y correo válidos.', route: 'configuracion', tab: 'identidad' },
      { req: false, ok: integ > 0, t: 'Integración con un aplicativo externo', d: integ + ' conectada(s).', route: 'api', tab: 'apps' },
      { req: false, ok: s.apiKeys.length > 0 || s.webhooks.length > 0, t: 'Llave de API o webhook configurado', d: 'Práctica de conexión entre sistemas.', route: 'api', tab: 'keys' }
    ];
  };
  const scoreOf = (list) => {
    const total = list.reduce((a, c) => a + (c.req ? 10 : 5), 0);
    const got = list.reduce((a, c) => a + (c.ok ? (c.req ? 10 : 5) : 0), 0);
    return Math.round(got / total * 100);
  };

  /* ======================================================================
     Marco de la aplicación
     ====================================================================== */
  const renderChrome = () => {
    const s = App.s; if (!s) return;
    const st = steps(s);
    const done = st.filter((x) => x.done).length;
    const next = st.find((x) => !x.done);
    $('#progress').innerHTML = `<div class="prog-h"><span>Taller E-Commerce</span><span>${done * 20}%</span></div><div class="bar"><i style="width:${done * 20}%"></i></div><small>${next ? 'Paso ' + (st.indexOf(next) + 1) + ' de 5: ' + esc(next.title) : '¡Ruta completada! Tienda publicada'}</small>`;
    $('#nav').innerHTML = ROUTES.map((r) => {
      const c = r.count ? r.count(s) : '';
      return `<a href="#/${r.id}" class="${App.route === r.id ? 'on' : ''}" data-a="go" data-route="${r.id}">${ic(r.icon)}<span>${r.label}</span>${c !== '' && c !== 0 ? `<span class="n">${c}</span>` : ''}</a>`;
    }).join('');
    const bn = [['inicio', 'home', 'Inicio'], ['productos', 'inventory_2', 'Productos'], ['tienda', 'storefront', 'Tienda'], ['pedidos', 'receipt_long', 'Pedidos']];
    $('#bnav').innerHTML = bn.map(([id, i, l]) => `<a href="#/${id}" class="${App.route === id ? 'on' : ''}" data-a="go" data-route="${id}">${ic(i)}<span>${l}</span>${id === 'pedidos' && s.orders.length ? `<b>${s.orders.length}</b>` : ''}</a>`).join('') + `<button data-a="open-side" class="${['configuracion', 'api', 'publicar'].includes(App.route) ? 'on' : ''}">${ic('menu')}<span>Más</span></button>`;
    const initials = s.owner.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    $('#user-card').innerHTML = `<div class="avatar">${esc(initials || 'A')}</div><div class="grow"><b>${esc(s.owner.name)}</b><small>${esc(s.owner.role)} • Ficha ${esc(s.owner.ficha)}</small></div>${ic('edit', 'sm muted')}`;
    $('#notif-dot').classList.toggle('hide', !App.ui.unseen);
    renderSaveStatus();
  };

  const renderSaveStatus = () => {
    const s = App.s; if (!s) return;
    const st = App.ui.saveError ? `<span class="err-t">${ic('error', 'sm')} Error al guardar</span>` : App.ui.dirty ? `${ic('sync', 'sm')} Guardando...` : `${ic('cloud_done', 'sm ok-t')} Guardado ${App.ui.savedAt ? U.timeAgo(App.ui.savedAt) : ''}`;
    $('#ses-name').innerHTML = `<b title="${esc(s.name)}">${esc(s.name)}</b><small>${st}</small>`;
  };
  setInterval(renderSaveStatus, 20000);

  const render = () => {
    const s = App.s; if (!s) return;
    const view = VIEWS[App.route] || VIEWS.inicio;
    $('#view').innerHTML = view(s);
    renderChrome();
    if (AFTER[App.route]) AFTER[App.route](s);
  };
  App.render = render;

  const go = (route, tab) => {
    if (!VIEWS[route]) route = 'inicio';
    App.route = route;
    if (tab) { if (route === 'configuracion') App.ui.cfgTab = tab; if (route === 'api') App.ui.apiTab = tab; }
    if (location.hash !== '#/' + route) history.replaceState(null, '', '#/' + route);
    document.body.classList.remove('side-open');
    render();
    window.scrollTo(0, 0);
  };
  App.go = go;

  /* Partes de la vista que se actualizan sin redibujar todo (evita perder el foco). */
  const PARTIALS = {};
  const refreshPartials = () => {
    $$('[data-partial]').forEach((el) => {
      const fn = PARTIALS[el.getAttribute('data-partial')];
      if (fn) el.innerHTML = fn(App.s);
    });
  };

  /* ---------- Helpers de formulario ---------- */
  const bindInput = (path, { type = 'text', ph = '', attrs = '', cls = 'input' } = {}) =>
    `<input class="${cls}" type="${type}" data-bind="${path}" ${type === 'number' ? 'data-type="number" min="0" step="any"' : ''} value="${esc(getPath(App.s, path) == null ? '' : getPath(App.s, path))}" placeholder="${esc(ph)}" ${attrs}>`;
  const bindArea = (path, ph = '', rows = 3) => `<textarea class="textarea" rows="${rows}" data-bind="${path}" placeholder="${esc(ph)}">${esc(getPath(App.s, path) || '')}</textarea>`;
  const field = (label, control, hint, req) => `<div class="field"><label>${label}${req ? ' <span class="req">*</span>' : ''}</label>${control}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
  const sw = (on, action, attrs = '') => `<button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${on}" data-a="${action}" ${attrs}></button>`;
  const opts = (list, cur) => list.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
  const imgSrc = (p) => esc(p.image || U.placeholder(p.name));
  const statusChip = (st) => ({ pagado: '<span class="chip green"><i class="d"></i>Pagado</span>', pendiente: '<span class="chip amber"><i class="d"></i>Pendiente</span>', despachado: '<span class="chip blue"><i class="d"></i>Despachado</span>', entregado: '<span class="chip solid"><i class="d"></i>Entregado</span>', cancelado: '<span class="chip red"><i class="d"></i>Cancelado</span>' }[st] || `<span class="chip">${esc(st)}</span>`);

  /* ======================================================================
     VISTAS
     ====================================================================== */
  const VIEWS = {};
  const AFTER = {};

  /* ---------------- Inicio & Sesiones ---------------- */
  VIEWS.inicio = (s) => {
    const st = steps(s);
    const next = st.find((x) => !x.done);
    const stats = SV.commerce.stats(s);
    const theme = SV.themeOf(s);
    const first = s.owner.name.split(' ')[0];
    const sessions = App.sessions;
    const canPortable = /^https?:/.test(location.protocol);
    return `
    <div class="hero-card mb">
      <span class="chip" style="background:rgba(255,255,255,.16);color:#fff">${ic('school', 'sm')} Estudio de tiendas educativas</span>
      <h1>Hola, ${esc(first)}. Construye, prueba y lanza tu tienda virtual.</h1>
      <p>Simulador tipo WooCommerce y Shopify para formación en comercio electrónico. Configura el tema, carga productos, prueba compras con pasarela simulada, conecta aplicativos por API y publica el sitio. Nada de lo que hagas mueve dinero real.</p>
      <div class="row mt">
        ${next ? `<button class="btn btn-white btn-lg" data-a="go" data-route="${next.route}" data-tab="${next.tab || ''}">${ic('arrow_forward')} Continuar: ${esc(next.title)}</button>` : `<button class="btn btn-white btn-lg" data-a="go" data-route="publicar">${ic('rocket_launch')} Ver mi tienda publicada</button>`}
        <button class="btn btn-glass" data-a="new-session">${ic('add')} Nueva tienda</button>
        <button class="btn btn-glass" data-a="import-session">${ic('upload_file')} Importar sesión</button>
      </div>
    </div>
    <div class="grid g-side">
      <div class="card">
        <div class="card-h"><h3>Ruta de aprendizaje · 5 pasos</h3><span class="chip green">${st.filter((x) => x.done).length} de 5 completos</span></div>
        <div class="stack" style="gap:8px">
          ${st.map((x, i) => `<div class="step-card ${x.done ? 'done' : ''}" data-a="go" data-route="${x.route}" data-tab="${x.tab || ''}"><div class="n">${x.done ? ic('check', 'sm') : i + 1}</div><div class="grow"><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></div>${ic('chevron_right', 'muted')}</div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>Tienda actual</h3><span class="chip">${ic('palette', 'sm')} ${esc(theme.name)}</span></div>
        <div class="row" style="gap:12px;margin-bottom:14px"><div class="avatar" style="width:46px;height:46px;border-radius:12px;background:${esc(SV.themeVars(s).primary)}">${ic(s.store.icon || 'storefront')}</div><div class="grow"><b>${esc(s.store.name)}</b><div class="small muted mono">${esc(s.store.subdomain)}.senaventas.edu.co</div></div></div>
        <div class="grid g2" style="gap:10px">
          <div class="card flat" style="padding:12px"><div class="tiny muted">Productos</div><b style="font-size:20px">${s.products.length}</b></div>
          <div class="card flat" style="padding:12px"><div class="tiny muted">Pedidos</div><b style="font-size:20px">${stats.orders}</b></div>
          <div class="card flat" style="padding:12px"><div class="tiny muted">Ventas simuladas</div><b style="font-size:17px">${money(stats.revenue)}</b></div>
          <div class="card flat" style="padding:12px"><div class="tiny muted">Integraciones</div><b style="font-size:20px">${Object.values(s.integrations).filter((i) => i.connected).length}</b></div>
        </div>
        <div class="row mt"><button class="btn btn-primary grow" data-a="go" data-route="tienda">${ic('visibility')} Ver tienda</button><button class="btn btn-soft" data-a="export-session" data-id="${s.id}" title="Descargar respaldo">${ic('download')}</button></div>
      </div>
    </div>

    <div class="card mt">
      <div class="card-h"><div><h3>Mis sesiones guardadas</h3><p class="small muted">Se guardan automáticamente en este navegador. Exporta un respaldo .json para llevarlas a otro equipo.</p></div><div class="row"><button class="btn btn-soft btn-sm" data-a="import-session">${ic('upload_file', 'sm')} Importar</button><button class="btn btn-primary btn-sm" data-a="new-session">${ic('add', 'sm')} Nueva tienda</button></div></div>
      <div class="grid g3">
        ${sessions.map((x0) => {
          const x = x0.id === s.id ? Object.assign({}, x0, { name: s.name, products: s.products.length, orders: s.orders.length, themeId: s.store.themeId, updatedAt: s.updatedAt, published: s.published, icon: s.store.icon, owner: s.owner }) : x0;
          const th = SV.THEMES.find((t) => t.id === x.themeId) || SV.THEMES[0];
          const cur = x.id === s.id;
          return `<div class="ses-card ${cur ? 'current' : ''}">
            <div class="ses-top" style="background:linear-gradient(120deg,${th.vars.primary},${th.vars.primary2})"><div class="ico">${ic(x.icon || 'storefront')}</div>${cur ? '<span class="chip" style="background:rgba(255,255,255,.2);color:#fff">Abierta</span>' : ''}${x.published ? '<span class="chip" style="background:rgba(255,255,255,.2);color:#fff">' + ic('public', 'sm') + ' Publicada</span>' : ''}</div>
            <div class="ses-body"><h3>${esc(x.name)}</h3><span class="small muted">${esc(x.owner ? x.owner.name : '')} · ${esc(th.name)}</span><span class="tiny muted">${x.products} productos · ${x.orders} pedidos · editada ${esc(U.timeAgo(x.updatedAt))}</span></div>
            <div class="ses-foot">${cur ? `<button class="btn btn-sm btn-ghost grow" data-a="rename-session">${ic('edit', 'sm')} Renombrar</button>` : `<button class="btn btn-sm btn-primary grow" data-a="open-session" data-id="${x.id}">${ic('folder_open', 'sm')} Abrir</button>`}
              <button class="icon-btn" title="Duplicar" data-a="dup-session" data-id="${x.id}">${ic('content_copy')}</button>
              <button class="icon-btn" title="Exportar respaldo .json" data-a="export-session" data-id="${x.id}">${ic('download')}</button>
              <button class="icon-btn danger" title="Eliminar" data-a="del-session" data-id="${x.id}">${ic('delete')}</button></div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="grid g2 mt">
      <div class="card">
        <div class="card-h"><h3>${ic('install_desktop')} Usar en el escritorio</h3></div>
        <div class="stack small">
          <p>SENAVENTAS es una aplicación web instalable (PWA). Funciona desde el navegador y también como programa de escritorio, incluso sin conexión.</p>
          ${App.installPrompt ? `<button class="btn btn-primary" data-a="install">${ic('install_desktop')} Instalar SENAVENTAS en este equipo</button>` : `<ol class="steps-list"><li>Abre SENAVENTAS en Chrome o Edge desde su dirección web.</li><li>Pulsa el ícono ${ic('install_desktop', 'sm')} de la barra de direcciones o el menú ⋮ → "Instalar SENAVENTAS".</li><li>Se crea un acceso directo en el escritorio y en el menú de inicio.</li></ol>`}
          <div class="tip" style="padding:12px"><div class="ico" style="width:34px;height:34px">${ic('description', 'sm')}</div><p class="small"><b>Versión portable:</b> un único archivo HTML que se abre con doble clic, sin instalar nada. Ideal para compartir por el LMS o una memoria USB.</p></div>
          <button class="btn btn-soft" data-a="portable" ${canPortable ? '' : 'disabled title="Disponible cuando abres la app desde un servidor web"'}>${ic('download')} Descargar versión portable (.html)</button>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${ic('groups')} Replicar con el grupo</h3></div>
        <div class="stack small">
          <p>Convierte tu tienda en una <b>plantilla de clase</b>: se exporta sin pedidos, llaves, registros ni publicación. Cada aprendiz la importa y parte del mismo punto.</p>
          <div class="row"><button class="btn btn-primary" data-a="export-template">${ic('content_copy')} Exportar como plantilla</button><button class="btn btn-soft" data-a="import-session">${ic('upload_file')} Importar plantilla</button></div>
          <div class="tip" style="padding:12px"><div class="ico" style="width:34px;height:34px">${ic('lightbulb', 'sm')}</div><p class="small"><b>Tip del instructor:</b> pide a cada aprendiz que entregue su archivo <span class="kbd">.senaventas.json</span> como evidencia de producto. Al importarlo ves la tienda, el catálogo, los pedidos y el puntaje del checklist.</p></div>
        </div>
      </div>
    </div>`;
  };

  /* ---------------- Configuración & Temas ---------------- */
  const schematic = (t) => {
    const v = t.vars;
    const card = (w) => `<div style="flex:1;height:38px;background:#fff;border-radius:5px;padding:4px;display:flex;flex-direction:column;gap:4px"><i style="height:14px;background:${v.alt2}"></i><i class="sk-bar" style="width:${w}%;height:4px;background:${v.muted}55"></i></div>`;
    if (t.schematic === 'mayorista') return `<div class="schem" style="background:${v.alt}"><div class="sk-row" style="background:${v.alt2};border-radius:4px;padding:4px 6px"><i class="sk-bar" style="width:40px;background:${v.muted}66"></i><i class="sk-bar" style="width:24px;background:${v.primary}"></i></div>${[70, 85, 55, 75].map((w) => `<div class="sk-row" style="background:#fff;border-radius:5px;padding:6px 8px"><div class="row" style="gap:6px"><i style="width:12px;height:12px;background:${v.alt2}"></i><i class="sk-bar" style="width:${w}px;background:${v.text}55"></i></div><i class="sk-bar" style="width:34px;height:8px;background:${v.primary2}99"></i></div>`).join('')}</div>`;
    if (t.schematic === 'aura') return `<div class="schem" style="background:${v.bg}"><div class="sk-row"><div class="row" style="gap:5px">${ic('diamond', 'sm')}<i class="sk-bar" style="width:60px;background:${v.text}88"></i></div><i style="width:28px;height:10px;border-radius:99px;background:${v.primary}"></i></div><div class="sk-box" style="height:80px;background:${v.dark};display:flex;flex-direction:column;justify-content:center;padding:10px;gap:6px"><i class="sk-bar" style="width:40%;height:4px;background:${v.accent}"></i><i class="sk-bar" style="width:70%;height:9px;background:#faf8f5cc"></i><i class="sk-bar" style="width:30%;height:9px;background:${v.accent}"></i></div><div class="row" style="gap:6px;flex-wrap:nowrap">${card(60)}${card(40)}${card(70)}</div></div>`;
    if (t.schematic === 'boutique') return `<div class="schem" style="background:${v.alt}"><div class="sk-row"><i class="sk-bar" style="width:60px;background:${v.text}66"></i><div class="row" style="gap:4px"><i style="width:10px;height:10px;border-radius:99px;background:${v.primary}"></i><i style="width:10px;height:10px;border-radius:99px;background:${v.alt2}"></i></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1"><div class="sk-box" style="background:${v.alt2};display:flex;flex-direction:column;justify-content:center;padding:8px;gap:5px"><i class="sk-bar" style="width:70%;height:9px;background:${v.text}77"></i><i class="sk-bar" style="width:90%;background:${v.text}33"></i><i class="sk-bar" style="width:40%;height:9px;background:${v.primary}"></i></div><div class="sk-box" style="background:#fff;display:flex;align-items:center;justify-content:center;color:${v.muted}66">${ic('image', 'xl')}</div></div><i class="sk-bar" style="background:${v.alt2}"></i></div>`;
    if (t.schematic === 'botanica') return `<div class="schem" style="background:${v.alt2}"><div class="sk-row"><div class="row" style="gap:5px;color:${v.primary}">${ic('spa', 'sm')}<i class="sk-bar" style="width:50px;background:${v.text}66"></i></div><span class="chip green" style="font-size:10px;padding:1px 8px">Clean</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1"><div class="sk-box" style="background:#fff;display:flex;flex-direction:column;justify-content:center;padding:8px;gap:5px"><i class="sk-bar" style="width:50%;height:4px;background:${v.primary2}99"></i><i class="sk-bar" style="width:80%;height:8px;background:${v.text}77"></i><i class="sk-bar" style="width:40%;height:4px;background:${v.muted}55"></i></div><div class="sk-box" style="background:${v.alt};display:flex;align-items:center;justify-content:center"><div style="width:34px;height:34px;border-radius:99px;background:${v.accent};color:${v.primary};display:flex;align-items:center;justify-content:center">${ic('sanitizer', 'sm')}</div></div></div><i class="sk-bar" style="background:${v.alt}"></i></div>`;
    return `<div class="schem" style="background:${v.alt}"><div class="sk-row" style="background:#fff;border-radius:4px;padding:4px 6px"><i class="sk-bar" style="width:46px;background:${v.primary}"></i><div class="row" style="gap:4px"><i class="sk-bar" style="width:20px;background:${v.alt2}"></i><i class="sk-bar" style="width:20px;background:${v.alt2}"></i></div></div><div class="sk-box" style="height:78px;background:${v.alt2};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px"><i class="sk-bar" style="width:40%;height:8px;background:${v.text}44"></i><i class="sk-bar" style="width:60%;height:4px;background:${v.text}22"></i><i class="sk-bar" style="width:22%;height:10px;background:${v.primary}"></i></div><div class="row" style="gap:6px;flex-wrap:nowrap">${card(50)}${card(70)}${card(40)}</div></div>`;
  };

  const cfgTabs = [['temas', 'palette', 'Selector de Plantillas', () => SV.THEMES.length], ['plugins', 'extension', 'Plugins Didácticos', (s) => Object.values(s.plugins).filter(Boolean).length], ['identidad', 'badge', 'Identidad y Ajustes'], ['contenido', 'web', 'Contenido & SEO'], ['catalogo', 'category', 'Categorías & Cupones']];

  VIEWS.configuracion = (s) => {
    const tab = App.ui.cfgTab;
    return `
    <div class="page-head">
      <div><span class="eyebrow">${ic('school', 'sm')} Módulo didáctico • Configuración del e-commerce</span><h1>Ajustes de la Tienda Académica</h1><p class="lead">Personaliza tu tienda online, instala complementos y elige el tema visual adecuado para tu modelo de negocio.</p></div>
      <div class="tip" style="max-width:440px"><div class="ico">${ic('lightbulb')}</div><div><h4>Tip del instructor SENA</h4><p class="small">La velocidad de carga y la simplicidad visual aumentan la tasa de conversión. Menos fricción significa más ventas reales.</p></div></div>
    </div>
    <div class="tabs" role="tablist">${cfgTabs.map(([id, icon, label, n]) => `<button class="tab ${tab === id ? 'on' : ''}" data-a="cfg-tab" data-tab="${id}" role="tab">${ic(icon)}${label}${n ? `<span class="n">${n(s)}</span>` : ''}</button>`).join('')}</div>
    ${CFG[tab](s)}`;
  };

  const CFG = {};
  CFG.temas = (s) => `
    <div class="row between mb"><div><h2 style="font-size:20px">Catálogo de Temas E-Commerce</h2><p class="muted">Selecciona el diseño que mejor represente los productos de tu emprendimiento.</p></div><span class="chip">${ic('devices', 'sm')} Adaptables a móvil y escritorio</span></div>
    <div class="grid g3">
      ${SV.THEMES.map((t) => {
        const active = s.store.themeId === t.id;
        return `<div class="theme-card ${active ? 'active' : ''}">
          ${active ? '<span class="chip solid active-chip"><i class="d"></i>Activo en tu tienda</span>' : ''}
          ${schematic(t)}
          <div><div class="row between"><h3>${esc(t.name)}</h3><span class="tiny ok-t b">${esc(t.tag)}</span></div><p class="small muted" style="margin-top:4px">${esc(t.description)}</p></div>
          <div class="feat">${t.features.map((f) => `<span>${ic('check_circle')}${esc(f)}</span>`).join('')}</div>
          <div class="foot">${active ? `<button class="btn btn-primary grow" data-a="personalize">${ic('brush')} Personalizar Estilo</button>` : `<button class="btn btn-white grow" data-a="activate-theme" data-id="${t.id}">${ic('check')} Activar Plantilla</button>`}<button class="icon-btn soft" title="Ver demo del tema" data-a="preview-theme" data-id="${t.id}">${ic('visibility')}</button></div>
        </div>`;
      }).join('')}
    </div>
    <div class="card mt row between">
      <div class="row"><div class="avatar" style="width:48px;height:48px;border-radius:12px;background:var(--sec-c);color:var(--primary)">${ic('storefront')}</div><div><b>URL de Pruebas SENA: <code class="ok-t" style="background:var(--s-low);padding:2px 8px;border-radius:6px">${esc(s.store.subdomain)}.senaventas.edu.co</code></b><div class="small muted">Los cambios que configures se reflejan al instante en tu tienda de simulación.</div></div></div>
      <div class="row"><button class="btn btn-soft" data-a="open-store-tab">${ic('open_in_new')} Abrir Tienda Sandbox</button><button class="btn btn-primary" data-a="go" data-route="tienda">${ic('visibility')} Vista en vivo</button></div>
    </div>`;

  CFG.plugins = (s) => `
    <div class="row between mb"><div><h2 style="font-size:20px">Módulos Complementarios (Plugins)</h2><p class="muted">Activa funcionalidades para experimentar cómo opera una plataforma comercial moderna en Colombia. Cada plugin cambia el comportamiento real de la tienda.</p></div><span class="chip green">${ic('verified', 'sm')} Simulador transaccional activo</span></div>
    <div class="stack">
      ${SV.PLUGINS.map((p) => {
        const on = !!s.plugins[p.id];
        return `<div class="card row between" style="align-items:center">
          <div class="row grow" style="align-items:flex-start;gap:16px;flex-wrap:nowrap"><div class="avatar" style="width:48px;height:48px;border-radius:12px;background:${on ? 'var(--sec-c)' : 'var(--s-low)'};color:${on ? 'var(--sec)' : 'var(--muted)'}">${ic(p.icon)}</div>
          <div class="grow"><div class="row"><h3 style="font-size:15.5px">${esc(p.name)}</h3><span class="chip ${on ? 'green' : 'gray'}">${esc(p.tag)}</span></div><p class="muted small" style="margin:4px 0 6px">${esc(p.text)}</p><div class="row small muted" style="gap:16px">${p.chips.map(([i, l]) => `<span class="row" style="gap:4px">${ic(i, 'sm ok-t')}${esc(l)}</span>`).join('')}</div></div></div>
          <div class="row"><span class="small b ${on ? 'ok-t' : 'muted'}">${on ? 'Activado' : 'Desactivado'}</span>${sw(on, 'toggle-plugin', `data-id="${p.id}" aria-label="${esc(p.name)}"`)}</div>
        </div>`;
      }).join('')}
    </div>`;

  const ICONS = ['storefront', 'local_florist', 'diamond', 'agriculture', 'restaurant', 'coffee', 'checkroom', 'spa', 'pets', 'handyman', 'eco', 'sports_soccer', 'menu_book', 'palette', 'cake', 'local_mall'];
  PARTIALS.brandcard = (s) => {
    const v = SV.themeVars(s);
    return `<div class="card flat" style="padding:16px;background:${esc(v.alt)}"><div class="row" style="flex-wrap:nowrap"><div class="avatar" style="width:44px;height:44px;border-radius:12px;background:${esc(v.primary)};color:${esc(v.onPrimary)}">${ic(s.store.icon || 'storefront')}</div><div class="grow" style="min-width:0"><b style="display:block;color:${esc(v.primary)};font-family:${esc(v.fontHead)};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.store.name || 'Nombre de tu tienda')}</b><span class="tiny muted mono">${esc(s.store.subdomain)}.senaventas.edu.co</span></div></div><p class="small" style="margin:12px 0;color:${esc(v.muted)}">${esc(s.store.slogan)}</p><div class="row"><span style="padding:8px 14px;border-radius:8px;background:${esc(v.primary)};color:${esc(v.onPrimary)};font-size:12px;font-weight:700">${esc(s.store.ctaPrimary || 'Comprar')}</span><span style="padding:8px 14px;border-radius:8px;background:${esc(v.accent)};color:${esc(v.onAccent)};font-size:12px;font-weight:700">${ic('shopping_bag', 'sm')} Carrito</span></div></div>
    <div class="small muted mt-s">Moneda: <b>${esc(s.store.currency)}</b> · Envío ${s.plugins.shipping ? 'por zonas' : 'fijo ' + money(s.store.shippingFlat)} · Gratis desde ${money(s.store.freeShippingThreshold)}</div>`;
  };

  CFG.identidad = (s) => `
    <div class="grid g-side">
      <div class="stack">
        <div class="card pad-lg stack">
          <div class="row between"><h3 style="font-size:17px">Identidad de la marca & localización</h3><span class="small ok-t row" style="gap:4px">${ic('save', 'sm')} Guardado automático</span></div>
          ${field('Nombre de la tienda comercial', bindInput('store.name', { ph: 'Ej: EcoModa Colombia', attrs: 'maxlength="60"' }), 'Aparece en el encabezado, recibos de pedido y notificaciones.', true)}
          ${field('Lema o propuesta de valor', bindInput('store.slogan', { ph: 'Ej: Moda sostenible hecha en Medellín', attrs: 'maxlength="120"' }), '', true)}
          <div class="frow">
            ${field('Subdominio de pruebas', `<div class="row" style="flex-wrap:nowrap;gap:6px">${bindInput('store.subdomain', { ph: 'mi-tienda', attrs: 'data-slug="1"' })}<span class="small muted mono">.senaventas.edu.co</span></div>`)}
            ${field('Moneda de liquidación', `<select class="select" data-bind="store.currency">${opts([['COP', 'COP ($) Peso colombiano'], ['USD', 'USD ($) Dólar (exportación ficticia)'], ['EUR', 'EUR (€) Euro']], s.store.currency)}</select>`)}
          </div>
          <div class="field"><label>Ícono de la marca</label><div class="row" style="gap:6px">${ICONS.map((i) => `<button class="icon-btn ${s.store.icon === i ? 'soft' : ''}" style="${s.store.icon === i ? 'box-shadow:0 0 0 2px var(--primary-c);color:var(--primary)' : ''}" data-a="set-icon" data-icon="${i}" title="${i}">${ic(i)}</button>`).join('')}</div></div>
          <div class="field"><label>Color primario de marca</label><span class="hint">Define botones, llamadas a la acción y acentos gráficos. "Color del tema" usa la paleta original de la plantilla.</span>
            <div class="color-opts" style="margin-top:6px">${SV.BRAND_COLORS.map((c) => { const on = (s.store.brandColor || '') === c.hex; const shown = c.hex || SV.themeOf(s).vars.primary; return `<button class="color-opt ${on ? 'on' : ''}" data-a="brand-color" data-hex="${c.hex}"><span class="swatch" style="background:${shown}">${on ? ic('check', 'sm') : ''}</span><div><b>${esc(c.name)}</b><small>${esc(shown.toUpperCase())}</small></div></button>`; }).join('')}
              <label class="color-opt ${s.store.brandColor && !SV.BRAND_COLORS.some((c) => c.hex === s.store.brandColor) ? 'on' : ''}"><input type="color" data-bind="store.brandColor" value="${esc(s.store.brandColor || SV.themeOf(s).vars.primary)}" style="width:26px;height:26px;border:0;padding:0;background:none;cursor:pointer"><div><b>Personalizado</b><small>Selector hex</small></div></label>
            </div>
          </div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('local_shipping')} Contacto, envíos y logística</h3>
          <div class="frow">
            ${field('WhatsApp de la tienda', bindInput('store.whatsapp', { ph: '573001234567' }), 'Con indicativo 57, sin espacios.')}
            ${field('Correo de contacto', bindInput('store.email', { type: 'email', ph: 'contacto@tienda.co' }))}
          </div>
          <div class="frow three">
            ${field('Departamento de origen', `<select class="select" data-bind="store.city">${opts(SV.DEPARTAMENTOS, s.store.city)}</select>`)}
            ${field('Tarifa fija de envío', bindInput('store.shippingFlat', { type: 'number' }), 'Se usa si el plugin de envíos está apagado.')}
            ${field('Envío gratis desde', bindInput('store.freeShippingThreshold', { type: 'number' }), '0 desactiva el envío gratis.')}
          </div>
          <div class="card flat small"><b>Tarifas por zona (plugin Envíos Nacionales ${s.plugins.shipping ? 'activo' : 'apagado'}):</b> ${Object.values(SV.SHIPPING_ZONES).map((z) => `${esc(z.label)} ${money(z.price)} (${esc(z.days)})`).join(' · ')}</div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('badge')} Ficha del aprendiz (créditos académicos)</h3>
          <div class="frow">${field('Nombre completo', bindInput('owner.name'), '', true)}${field('Rol', `<select class="select" data-bind="owner.role">${opts(['Aprendiz SENA', 'Instructor(a) SENA', 'Emprendedor(a)', 'Estudiante', 'Docente'], s.owner.role)}</select>`)}</div>
          <div class="frow three">${field('Ficha', bindInput('owner.ficha'))}${field('Programa de formación', bindInput('owner.programa'))}${field('Regional', bindInput('owner.regional'))}</div>
          <div class="frow">${field('Centro de formación', bindInput('owner.centro'))}${field('Instructor(a) a cargo', bindInput('owner.instructor', { ph: 'Opcional' }))}</div>
        </div>
      </div>
      <div class="stack">
        <div class="card" style="position:sticky;top:84px">
          <div class="card-h"><h3 class="tiny" style="text-transform:uppercase;letter-spacing:.08em">Previsualización de marca</h3><span class="tiny ok-t b">En tiempo real</span></div>
          <div data-partial="brandcard">${PARTIALS.brandcard(s)}</div>
          <div class="row mt"><button class="btn btn-soft grow" data-a="go" data-route="tienda">${ic('visibility')} Ver tienda</button><button class="btn btn-soft" data-a="reset-identity" title="Restablecer textos del preset">${ic('restart_alt')}</button></div>
        </div>
      </div>
    </div>`;

  PARTIALS.seoscore = (s) => {
    const r = seoScore(s);
    return `<div class="row between"><b>Puntaje SEO didáctico</b><span class="chip ${r.score >= 80 ? 'green' : r.score >= 50 ? 'amber' : 'red'}">${r.score}%</span></div><div class="bar" style="margin:8px 0 10px"><i style="width:${r.score}%"></i></div><div class="stack" style="gap:5px">${r.checks.map(([ok, t]) => `<div class="row small" style="gap:6px;flex-wrap:nowrap">${ic(ok ? 'check_circle' : 'cancel', 'sm ' + (ok ? 'ok-t' : 'err-t'))}<span>${esc(t)}</span></div>`).join('')}</div>
    <div class="card flat mt-s" style="padding:12px;background:#fff;border:1px solid var(--s)"><div class="tiny muted">Vista en Google</div><div style="color:#1a0dab;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.store.seo.title || s.store.name)}</div><div class="tiny" style="color:#006621">https://${esc(s.store.subdomain)}.senaventas.edu.co</div><div class="small muted">${esc((s.store.seo.description || '').slice(0, 160))}</div></div>`;
  };

  CFG.contenido = (s) => {
    const sec = s.store.sections;
    const secs = [['announcement', 'Barra de anuncio'], ['hero', 'Portada (hero)'], ['promo', 'Promoción / kit'], ['catalog', 'Catálogo'], ['trust', 'Valores de marca'], ['about', 'Nosotros'], ['credits', 'Créditos académicos en el pie']];
    const pubs = s.products;
    return `
    <div class="grid g-side">
      <div class="stack">
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('view_agenda')} Secciones de la página</h3>
          <div class="grid g2" style="gap:10px">${secs.map(([k, l]) => `<div class="card flat row between" style="padding:10px 14px"><span class="small b">${l}</span>${sw(sec[k] !== false, 'toggle-section', `data-id="${k}"`)}</div>`).join('')}</div>
          ${field('Texto de la barra de anuncio', bindInput('store.announcement', { attrs: 'maxlength="140"' }))}
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('photo')} Portada (hero)</h3>
          ${field('Etiqueta superior', bindInput('store.heroBadge'))}
          <div class="frow">${field('Título', bindInput('store.heroTitle'))}${field('Texto destacado del título', bindInput('store.heroHighlight'))}</div>
          ${field('Párrafo', bindArea('store.heroText'))}
          <div class="frow">${field('Botón principal', bindInput('store.ctaPrimary'))}${field('Botón secundario', bindInput('store.ctaSecondary'))}</div>
          <div class="frow">${field('Tarjeta flotante: título', bindInput('store.heroCardTitle'))}${field('Tarjeta flotante: texto', bindInput('store.heroCardText'))}</div>
          <div class="field"><label>Imagen de portada</label>
            <div class="dropzone" data-a="pick-image" data-target="hero" data-drop="hero"><div class="thumb">${s.store.heroImage ? `<img src="${esc(s.store.heroImage)}" alt="Portada">` : ic('add_photo_alternate', 'xl')}</div><div class="small"><b>Arrastra una imagen o haz clic para subirla</b><div class="muted">Se optimiza a 900 px en JPEG para que la sesión pese poco.</div></div></div>
            ${bindInput('store.heroImage', { ph: 'o pega una URL https://...', attrs: 'data-rerender="1"' })}
          </div>
        </div>
        <div class="card pad-lg stack">
          <div class="row between"><h3 style="font-size:17px">${ic('redeem')} Promoción / kit (bundle)</h3>${sw(s.store.promo.enabled, 'toggle-promo')}</div>
          <div class="frow">${field('Etiqueta', bindInput('store.promo.badge'))}${field('Título', bindInput('store.promo.title'))}</div>
          ${field('Descripción', bindArea('store.promo.text', '', 2))}
          <div class="frow">${field('Precio del kit', bindInput('store.promo.price', { type: 'number' }), '0 = promoción solo informativa.')}${field('Precio de referencia (tachado)', bindInput('store.promo.compareAt', { type: 'number' }))}</div>
          <div class="field"><label>Productos incluidos en el kit</label><div class="grid g2" style="gap:6px">${pubs.map((p) => `<label class="check small"><input type="checkbox" data-a-change="promo-product" value="${esc(p.id)}" ${(s.store.promo.productIds || []).includes(p.id) ? 'checked' : ''}> ${esc(p.name)}${p.status !== 'publicado' ? ' <span class="chip gray">borrador</span>' : ''}</label>`).join('')}</div></div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('verified')} Valores de marca y nosotros</h3>
          <div class="frow">${field('Título de la sección', bindInput('store.trustTitle'))}${field('Subtítulo', bindInput('store.trustText'))}</div>
          ${(s.store.trust || []).map((t, i) => `<div class="form-sec"><div class="form-sec-h">Valor ${i + 1} ${ic(t.icon, 'sm')}</div><div class="frow three">${field('Ícono (Material Symbols)', bindInput('store.trust.' + i + '.icon'))}${field('Título', bindInput('store.trust.' + i + '.title'))}${field('Texto', bindInput('store.trust.' + i + '.text'))}</div></div>`).join('')}
          ${field('Título "Nosotros"', bindInput('store.aboutTitle'))}
          ${field('Texto "Nosotros"', bindArea('store.aboutText'))}
        </div>
      </div>
      <div class="stack">
        <div class="card stack" style="position:sticky;top:84px">
          <div class="row between"><h3 style="font-size:16px">${ic('travel_explore')} SEO & metadatos</h3>${s.plugins.seo ? '<span class="chip green">Plugin activo</span>' : `<button class="btn btn-sm btn-primary" data-a="toggle-plugin" data-id="seo">Activar plugin</button>`}</div>
          ${field('Título SEO', bindInput('store.seo.title', { attrs: 'maxlength="70"' }))}
          ${field('Meta descripción', bindArea('store.seo.description', 'Describe la tienda en 70 a 160 caracteres', 3))}
          ${field('Palabras clave (separadas por coma)', bindInput('store.seo.keywords'))}
          <div data-partial="seoscore">${PARTIALS.seoscore(s)}</div>
        </div>
      </div>
    </div>`;
  };

  CFG.catalogo = (s) => `
    <div class="grid g2">
      <div class="card pad-lg stack">
        <div class="row between"><h3 style="font-size:17px">${ic('category')} Categorías del catálogo</h3><span class="chip">${s.categories.length}</span></div>
        <p class="small muted">Las categorías se muestran como filtros y enlaces del menú de la tienda. Renombrar una categoría actualiza sus productos.</p>
        <div class="stack" style="gap:8px">${s.categories.map((c, i) => `<div class="row" style="flex-wrap:nowrap"><input class="input" value="${esc(c)}" data-a-change="rename-cat" data-i="${i}" aria-label="Categoría ${i + 1}"><span class="chip gray" title="Productos">${s.products.filter((p) => p.category === c).length}</span><button class="icon-btn danger" data-a="del-cat" data-i="${i}" title="Eliminar">${ic('delete')}</button></div>`).join('')}</div>
        <form class="row" data-form="add-cat" style="flex-wrap:nowrap"><input class="input" name="name" placeholder="Nueva categoría" maxlength="40" required><button class="btn btn-primary" type="submit">${ic('add')} Agregar</button></form>
      </div>
      <div class="card pad-lg stack">
        <div class="row between"><h3 style="font-size:17px">${ic('confirmation_number')} Cupones de descuento</h3>${s.plugins.coupons ? '<span class="chip green">Plugin activo</span>' : `<button class="btn btn-sm btn-primary" data-a="toggle-plugin" data-id="coupons">Activar plugin</button>`}</div>
        <div class="tbl-wrap"><table class="tbl" style="min-width:0"><thead><tr><th>Código</th><th>Tipo</th><th class="r">Valor</th><th class="c">Activo</th><th></th></tr></thead><tbody>
        ${s.coupons.map((c, i) => `<tr><td class="mono b">${esc(c.code)}</td><td>${c.type === 'percent' ? 'Porcentaje' : 'Valor fijo'}</td><td class="r">${c.type === 'percent' ? c.value + '%' : money(c.value)}</td><td class="c">${sw(c.active, 'toggle-coupon', `data-i="${i}"`)}</td><td class="c"><button class="icon-btn danger" data-a="del-coupon" data-i="${i}">${ic('delete')}</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted c">Sin cupones</td></tr>'}
        </tbody></table></div>
        <form class="frow three" data-form="add-coupon" style="align-items:end">
          ${field('Código', '<input class="input" name="code" required pattern="[A-Za-z0-9]{3,20}" placeholder="VERANO10" style="text-transform:uppercase">')}
          ${field('Tipo', `<select class="select" name="type">${opts([['percent', 'Porcentaje %'], ['fixed', 'Valor fijo $']], 'percent')}</select>`)}
          ${field('Valor', '<input class="input" name="value" type="number" min="1" required placeholder="10">')}
          <button class="btn btn-primary" type="submit" style="grid-column:1/-1">${ic('add')} Crear cupón</button>
        </form>
      </div>
    </div>`;

  /* ---------------- Productos & Inventario ---------------- */
  const filteredProducts = (s) => {
    const q = App.ui.prodQ.trim().toLowerCase();
    return s.products.filter((p) => {
      if (App.ui.prodCat && p.category !== App.ui.prodCat) return false;
      if (App.ui.prodStatus === 'agotado') { if (Number(p.stock) > 0) return false; }
      else if (App.ui.prodStatus === 'bajo') { if (!(Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock))) return false; }
      else if (App.ui.prodStatus && p.status !== App.ui.prodStatus) return false;
      if (q && !(p.name + ' ' + p.sku + ' ' + p.category + ' ' + (p.origin || '')).toLowerCase().includes(q)) return false;
      return true;
    });
  };

  PARTIALS.prodkpis = (s) => {
    const pubs = s.products.filter((p) => p.status === 'publicado');
    const invSale = s.products.reduce((a, p) => a + Number(p.price) * Number(p.stock), 0);
    const invCost = s.products.reduce((a, p) => a + Number(p.cost) * Number(p.stock), 0);
    const low = s.products.filter((p) => Number(p.stock) <= Number(p.minStock));
    const best = s.products.slice().sort((a, b) => (b.sold || 0) - (a.sold || 0))[0];
    const withPhoto = s.products.length ? Math.round(s.products.filter((p) => p.image).length / s.products.length * 100) : 0;
    return `
      <div class="kpi"><div class="kpi-h">Total productos ${ic('inventory_2')}</div><div class="kpi-v">${s.products.length} <small>${pubs.length} publicados</small></div><div class="kpi-f"><span>${s.categories.length} categorías</span><b>${withPhoto}% con foto</b></div></div>
      <div class="kpi"><div class="kpi-h">Valor inventario ${ic('payments')}</div><div class="kpi-v" style="font-size:25px">${money(invSale)}</div><div class="kpi-f"><span>Costo base: ${money(invCost)}</span><b>${invSale ? '+' + U.pct(U.margin(invSale, invCost)) : '0%'} margen</b></div></div>
      <div class="kpi" data-a="filter-low" style="cursor:pointer"><div class="kpi-h">Stock bajo / alertas ${ic('warning')}</div><div class="kpi-v">${low.length} ${low.length ? '<span class="chip green" style="font-size:12px">Reabastecer</span>' : ''}</div><div class="kpi-f"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${low.length ? esc(low.slice(0, 2).map((p) => p.name.split(' ').slice(0, 2).join(' ')).join(' & ')) : 'Inventario saludable'}</span>${ic('arrow_forward', 'sm ok-t')}</div></div>
      <div class="kpi"><div class="kpi-h">Más vendido ${ic('stars')}</div><div style="font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${best ? esc(best.name) : '—'}</div><b class="ok-t small">${best ? (best.sold || 0) + ' unidades vendidas' : ''}</b><div class="kpi-f"><span>Rotación ${best && best.sold > 50 ? 'alta' : 'media'}</span><b>${SV.commerce.stats(s).orders} pedidos</b></div></div>`;
  };

  PARTIALS.prodtable = (s) => {
    const list = filteredProducts(s);
    const per = App.ui.prodPer;
    const pages = Math.max(1, Math.ceil(list.length / per));
    if (App.ui.prodPage > pages) App.ui.prodPage = pages;
    const page = App.ui.prodPage;
    const rows = list.slice((page - 1) * per, page * per);
    const sel = App.ui.sel;
    const allSel = rows.length && rows.every((p) => sel.has(p.id));
    return `
      ${sel.size ? `<div class="bulk"><b>${sel.size} seleccionado(s)</b><span class="grow"></span><button class="btn btn-sm" data-a="bulk" data-op="publicado">${ic('public', 'sm')} Publicar</button><button class="btn btn-sm" data-a="bulk" data-op="borrador">${ic('draft', 'sm')} Borrador</button><button class="btn btn-sm" data-a="bulk" data-op="delete">${ic('delete', 'sm')} Eliminar</button><button class="btn btn-sm" data-a="bulk" data-op="clear">${ic('close', 'sm')}</button></div>` : ''}
      <div class="tbl-wrap"><table class="tbl cards"><thead><tr><th class="c" style="width:44px"><input type="checkbox" data-a="sel-all" ${allSel ? 'checked' : ''} aria-label="Seleccionar página"></th><th>Producto & identificador</th><th>Categoría</th><th class="r">Precio venta</th><th class="r">Costo / margen</th><th style="width:170px">Stock & disponibilidad</th><th class="c">Estado</th><th class="c">Acciones</th></tr></thead><tbody>
      ${rows.map((p) => {
        const m = U.margin(p.price, p.cost);
        const stock = Number(p.stock); const min = Number(p.minStock) || 0;
        const lvl = stock <= 0 ? 'out' : stock <= min ? 'low' : '';
        const pct = Math.min(100, Math.round(stock / Math.max(min * 4, 1) * 100));
        const lbl = stock <= 0 ? '<span class="err-t">Agotado</span>' : stock <= min ? '<span style="color:var(--sec)">Bajo stock</span>' : pct > 70 ? 'Nivel alto' : pct > 40 ? 'Óptimo' : 'Nivel medio';
        return `<tr class="${sel.has(p.id) ? 'sel' : ''}"><td class="c"><input type="checkbox" data-a="sel" data-id="${p.id}" ${sel.has(p.id) ? 'checked' : ''} aria-label="Seleccionar ${esc(p.name)}"></td>
          <td><div class="prod-cell"><img src="${imgSrc(p)}" alt="" data-ph="${esc(p.name)}" loading="lazy"><div style="min-width:0"><b data-a="edit-product" data-id="${p.id}">${esc(p.name)}</b><span class="sku">SKU: ${esc(p.sku || '—')}</span>${!p.image ? ' <span class="chip red" style="font-size:10px">sin foto</span>' : ''}</div></div></td>
          <td data-label="Categoría"><span class="chip">${esc(p.category)}</span></td>
          <td class="r b" data-label="Precio venta">${money(p.price)}${Number(p.compareAt) > Number(p.price) ? `<div class="tiny muted" style="text-decoration:line-through">${money(p.compareAt)}</div>` : ''}</td>
          <td class="r" data-label="Costo / margen"><div class="small muted">${money(p.cost)} c/u</div><b class="small ${m < 20 ? 'err-t' : 'ok-t'}">${m >= 0 ? '+' : ''}${U.pct(m)} margen</b></td>
          <td data-label="Stock"><div class="stockbar ${lvl}"><div class="top-line"><span class="${lvl === 'out' ? 'muted' : 'ok-t'}">${stock} uds</span><span class="muted">${lbl}</span></div><div class="bar"><i style="width:${stock <= 0 ? 0 : Math.max(6, pct)}%"></i></div><div class="row" style="gap:2px"><button class="btn btn-sm btn-ghost" style="padding:0 6px" data-a="stock" data-id="${p.id}" data-d="-1" title="Restar 1">−</button><button class="btn btn-sm btn-ghost" style="padding:0 6px" data-a="stock" data-id="${p.id}" data-d="1" title="Sumar 1">+</button><button class="btn btn-sm btn-ghost" style="padding:0 6px" data-a="stock" data-id="${p.id}" data-d="10" title="Sumar 10">+10</button></div></div></td>
          <td class="c" data-label="Estado"><button data-a="toggle-status" data-id="${p.id}" title="Cambiar estado">${p.status === 'publicado' ? '<span class="chip green"><i class="d"></i>Publicado</span>' : '<span class="chip gray"><i class="d"></i>Borrador</span>'}</button></td>
          <td class="td-actions"><div class="actions"><button class="icon-btn" title="Editar" data-a="edit-product" data-id="${p.id}">${ic('edit')}</button><button class="icon-btn" title="Duplicar" data-a="dup-product" data-id="${p.id}">${ic('content_copy')}</button><button class="icon-btn danger" title="Eliminar" data-a="del-product" data-id="${p.id}">${ic('delete')}</button></div></td></tr>`;
      }).join('') || `<tr><td colspan="8" class="td-empty"><div class="empty">${ic('inventory')}<p>No hay productos con estos filtros.</p><button class="btn btn-primary" data-a="new-product">${ic('add')} Nuevo producto</button></div></td></tr>`}
      </tbody></table></div>
      <div class="pager"><div class="row"><span>Filas por página:</span><select class="select" style="width:auto;padding:4px 30px 4px 10px" data-a-change="per-page">${opts([5, 10, 25, 50], per)}</select><span>${list.length ? (page - 1) * per + 1 : 0} - ${Math.min(page * per, list.length)} de ${list.length} ítems</span></div>
      <div class="pages"><button data-a="page" data-p="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Anterior">${ic('chevron_left')}</button>${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === page ? 'on' : ''}" data-a="page" data-p="${i + 1}">${i + 1}</button>`).join('')}<button data-a="page" data-p="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Siguiente">${ic('chevron_right')}</button></div></div>`;
  };

  VIEWS.productos = (s) => `
    <div class="page-head">
      <div><div class="row"><span class="mod-chip">Módulo práctico 03</span><span class="small muted">Ficha ${esc(s.owner.ficha)} · ${esc(s.owner.programa)}</span></div><h1>Gestión de Catálogo & Control de Inventario</h1><p class="lead">Monitorea existencias, calcula márgenes de beneficio y sincroniza tus canales comerciales.</p></div>
      <div class="row"><button class="btn btn-soft" data-a="import-csv">${ic('upload')} Importar CSV</button><button class="btn btn-soft" data-a="kardex">${ic('download')} Descargar Planilla Kardex</button><button class="btn btn-primary btn-lg" data-a="new-product">${ic('add_circle')} Nuevo Producto</button></div>
    </div>
    <div class="grid g4" data-partial="prodkpis">${PARTIALS.prodkpis(s)}</div>
    <div class="tip mt"><div class="ico">${ic('school')}</div><div class="grow"><h4>Consejo didáctico SENA</h4><p>Mantén actualizados los costos unitarios para que la plataforma calcule el margen de ganancia real. Fórmula: <b>Margen bruto = (Precio − Costo) ÷ Precio × 100</b>.</p></div><button class="btn btn-white btn-sm" data-a="costing-guide">Ver guía de costeo</button></div>
    <div class="table-card mt">
      <div class="toolbar"><div class="l">
        <div class="input-ico grow" style="min-width:220px">${ic('search')}<input class="input" id="prod-q" data-a-input="prod-q" value="${esc(App.ui.prodQ)}" placeholder="Buscar por nombre, SKU o etiqueta..." aria-label="Buscar productos"></div>
        <select class="select" style="width:auto;min-width:190px" data-a-change="prod-cat"><option value="">Todas las categorías</option>${opts(s.categories, App.ui.prodCat)}</select>
        <select class="select" style="width:auto;min-width:170px" data-a-change="prod-status">${opts([['', 'Todos los estados'], ['publicado', 'Publicado'], ['borrador', 'Borrador'], ['bajo', 'Stock bajo'], ['agotado', 'Agotado']], App.ui.prodStatus)}</select>
      </div><span class="small muted">${s.products.length} productos en catálogo</span></div>
      <div data-partial="prodtable">${PARTIALS.prodtable(s)}</div>
    </div>`;

  /* Panel de producto (crear / editar) */
  PARTIALS.margin = () => {
    const d = App.ui.draft; if (!d) return '';
    const price = Number(d.price) || 0; const cost = Number(d.cost) || 0;
    const m = U.margin(price, cost);
    const sug = cost > 0 ? Math.ceil(cost / 0.6 / 100) * 100 : 0;
    const cls = m < 20 ? 'err-t' : m < 35 ? 'warn-t' : 'ok-t';
    return `<div class="card flat row between" style="padding:12px;background:color-mix(in srgb,var(--sec-c) 40%,transparent)"><div><b class="small">Margen bruto calculado</b><div class="tiny muted">((Venta − Costo) ÷ Venta) × 100 · Ganancia por unidad: ${money(price - cost)}</div></div><b class="${cls}" style="font-size:20px">${U.pct(m)}</b></div>
      ${cost > 0 ? `<div class="tiny muted">Precio sugerido para un margen del 40%: <b>${money(sug)}</b> <button class="btn btn-sm btn-ghost" data-a="apply-suggested" data-v="${sug}">Aplicar</button></div>` : ''}
      ${m < 20 && price > 0 ? `<div class="tiny err-t">${ic('warning', 'sm')} Margen bajo: revisa el costo o el precio de venta.</div>` : ''}`;
  };
  PARTIALS.draftimg = () => {
    const d = App.ui.draft; if (!d) return '';
    return `<div class="thumb">${d.image ? `<img src="${esc(d.image)}" alt="" data-ph="${esc(d.name)}">` : ic('add_photo_alternate', 'xl')}</div><div class="small"><b>Arrastra la foto del producto o haz clic</b><div class="muted">JPG o PNG. Se optimiza automáticamente a 900 px.</div>${d.image ? `<button class="btn btn-sm btn-danger mt-s" data-a="clear-draft-img">${ic('delete', 'sm')} Quitar imagen</button>` : ''}</div>`;
  };
  const dInput = (k, { type = 'text', ph = '', attrs = '' } = {}) => `<input class="input" type="${type}" data-draft="${k}" value="${esc(App.ui.draft[k] == null ? '' : App.ui.draft[k])}" placeholder="${esc(ph)}" ${type === 'number' ? 'min="0" step="any"' : ''} ${attrs}>`;

  const openProduct = (p) => {
    const s = App.s;
    const isNew = !p;
    App.ui.draft = isNew ? { id: null, name: '', sku: '', category: s.categories[0] || 'General', status: 'publicado', price: '', compareAt: 0, cost: '', stock: 10, minStock: 5, moq: 1, image: '', description: '', badge: '', origin: '', rating: 4.8, reviews: 0, sold: 0 } : U.clone(p);
    const d = App.ui.draft;
    App.drawer({
      title: isNew ? 'Carga rápida de producto' : 'Editar producto',
      sub: 'Práctica didáctica paso a paso', icon: isNew ? 'add_box' : 'edit',
      top: `<div class="stepper"><span class="on"><i>1</i>Básicos</span><hr><span class="on"><i>2</i>Imagen</span><hr><span class="on"><i>3</i>Precios</span><hr><span class="on"><i>4</i>Stock</span></div>`,
      body: `
        <div class="form-sec"><div class="form-sec-h">Paso 1: Información básica ${ic('info', 'sm')}</div>
          ${field('Nombre del producto comercial', dInput('name', { ph: 'Ej: Café Molido Nariño 250g', attrs: 'maxlength="90"' }), '', true)}
          <div class="frow">${field('SKU / referencia', dInput('sku', { ph: 'CAF-002', attrs: 'maxlength="20" style="text-transform:uppercase"' }), 'Único. Letras, números y guion.', true)}${field('Categoría', `<select class="select" data-draft="category">${opts(s.categories, d.category)}</select>`)}</div>
          <div class="frow">${field('Etiqueta de origen', dInput('origin', { ph: 'Origen Huila • 500g' }))}${field('Insignia (badge)', dInput('badge', { ph: 'Más vendido, Oferta...' }))}</div>
          ${field('Descripción', `<textarea class="textarea" data-draft="description" rows="3" placeholder="Beneficios, materiales, presentación...">${esc(d.description || '')}</textarea>`)}
          ${field('Estado', `<select class="select" data-draft="status">${opts([['publicado', 'Publicado (visible en la tienda)'], ['borrador', 'Borrador (oculto)']], d.status)}</select>`)}
        </div>
        <div class="form-sec"><div class="form-sec-h">Paso 2: Imagen ${ic('image', 'sm')}</div>
          <div class="dropzone" data-a="pick-image" data-target="draft" data-drop="draft" data-partial="draftimg">${PARTIALS.draftimg()}</div>
          <input class="input" data-draft="image" data-rerender-part="draftimg" value="${esc(d.image && d.image.startsWith('data:') ? '' : d.image || '')}" placeholder="o pega la URL de una imagen https://...">
        </div>
        <div class="form-sec"><div class="form-sec-h">Paso 3: Precios & costos ${ic('calculate', 'sm')}</div>
          <div class="frow">${field('Precio de venta (' + esc(s.store.currency) + ')', dInput('price', { type: 'number', ph: '28000' }), '', true)}${field('Costo unitario (' + esc(s.store.currency) + ')', dInput('cost', { type: 'number', ph: '16000' }), 'Materia prima + mano de obra + empaque.')}</div>
          <div class="frow">${field('Precio de referencia (tachado)', dInput('compareAt', { type: 'number' }), 'Opcional, para mostrar oferta.')}${field('Pedido mínimo (MOQ)', dInput('moq', { type: 'number' }), 'Útil en el tema mayorista.')}</div>
          <div class="stack" style="gap:6px" data-partial="margin">${PARTIALS.margin()}</div>
        </div>
        <div class="form-sec"><div class="form-sec-h">Paso 4: Control de stock ${ic('warehouse', 'sm')}</div>
          <div class="frow">${field('Cantidad disponible', dInput('stock', { type: 'number' }))}${field('Umbral de alerta mínimo', dInput('minStock', { type: 'number' }), 'Dispara el evento stock.low.')}</div>
          <div class="frow">${field('Calificación (0 a 5)', dInput('rating', { type: 'number', attrs: 'max="5" step="0.1"' }))}${field('Número de reseñas', dInput('reviews', { type: 'number' }))}</div>
        </div>
        <div class="err-t small" id="prod-err"></div>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-primary" data-a="save-product">${ic('check')} Guardar & ${d.status === 'publicado' ? 'publicar' : 'guardar borrador'}</button>`,
      onClose: () => { App.ui.draft = null; }
    });
  };

  const saveProduct = () => {
    const s = App.s; const d = App.ui.draft; if (!d) return;
    const errs = [];
    d.name = String(d.name || '').trim();
    d.sku = String(d.sku || '').trim().toUpperCase();
    if (d.name.length < 3) errs.push('El nombre debe tener al menos 3 caracteres.');
    if (!/^[A-Z0-9\-_]{3,20}$/.test(d.sku)) errs.push('El SKU debe tener entre 3 y 20 caracteres (letras, números o guion).');
    else if (s.products.some((p) => p.sku.toUpperCase() === d.sku && p.id !== d.id)) errs.push('Ya existe otro producto con el SKU ' + d.sku + '.');
    ['price', 'cost', 'stock', 'minStock', 'compareAt', 'moq', 'rating', 'reviews'].forEach((k) => { d[k] = Number(d[k]) || 0; });
    if (!(d.price > 0)) errs.push('El precio de venta debe ser mayor que 0.');
    if (d.cost < 0 || d.stock < 0) errs.push('Costo y stock no pueden ser negativos.');
    if (!Number.isInteger(d.stock)) errs.push('El stock debe ser un número entero.');
    d.moq = Math.max(1, Math.round(d.moq));
    d.rating = Math.min(5, Math.max(0, d.rating));
    if (errs.length) { $('#prod-err').innerHTML = errs.map((e) => '• ' + esc(e)).join('<br>'); return; }
    const isNew = !d.id;
    if (isNew) { d.id = U.uid('p'); s.products.unshift(d); }
    else { const i = s.products.findIndex((p) => p.id === d.id); s.products[i] = d; }
    const pub = { id: d.id, sku: d.sku, name: d.name, price: d.price, stock: d.stock, status: d.status };
    emit(isNew ? 'product.created' : 'product.updated', pub);
    if (d.stock <= d.minStock) emit('stock.low', { id: d.id, sku: d.sku, name: d.name, stock: d.stock, min_stock: d.minStock });
    App.ui.draft = null;
    App.closeOverlay();
    App.commit((isNew ? 'Producto creado: ' : 'Producto actualizado: ') + d.name, { render: true });
    toast(isNew ? 'Producto creado' : 'Cambios guardados');
  };

  /* ---------------- Pedidos ---------------- */
  VIEWS.pedidos = (s) => {
    const st = SV.commerce.stats(s);
    const f = App.ui.orderStatus;
    const list = s.orders.filter((o) => !f || o.status === f);
    const counts = {};
    s.orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return `
    <div class="page-head">
      <div><div class="row"><span class="mod-chip">Módulo práctico 04</span><span class="small muted">Gestión de pedidos y postventa</span></div><h1>Pedidos & Ventas Simuladas</h1><p class="lead">Cada compra en tu tienda (vista previa, API o sitio publicado) llega aquí. Practica el flujo pagado → despachado → entregado.</p></div>
      <div class="row"><button class="btn btn-soft" data-a="export-orders" ${s.orders.length ? '' : 'disabled'}>${ic('download')} Exportar CSV</button><button class="btn btn-danger" data-a="clear-orders" ${s.orders.length ? '' : 'disabled'}>${ic('delete_sweep')} Borrar pedidos</button><button class="btn btn-primary" data-a="go" data-route="tienda">${ic('add_shopping_cart')} Simular compra</button></div>
    </div>
    <div class="grid g4">
      <div class="kpi"><div class="kpi-h">Pedidos válidos ${ic('receipt_long')}</div><div class="kpi-v">${st.orders}</div><div class="kpi-f"><span>${st.units} unidades vendidas</span><b>${counts.cancelado || 0} cancelados</b></div></div>
      <div class="kpi"><div class="kpi-h">Ventas totales ${ic('payments')}</div><div class="kpi-v" style="font-size:25px">${money(st.revenue)}</div><div class="kpi-f"><span>Incluye envíos</span><b>${esc(s.store.currency)}</b></div></div>
      <div class="kpi"><div class="kpi-h">Ticket promedio ${ic('shopping_cart')}</div><div class="kpi-v" style="font-size:25px">${money(st.avgTicket)}</div><div class="kpi-f"><span>Ventas ÷ pedidos</span><b>AOV</b></div></div>
      <div class="kpi"><div class="kpi-h">Utilidad bruta ${ic('trending_up')}</div><div class="kpi-v" style="font-size:25px">${money(st.grossProfit)}</div><div class="kpi-f"><span>Costo de ventas: ${money(st.cost)}</span><b>${st.revenue ? U.pct(st.grossProfit / st.revenue * 100) : '0%'}</b></div></div>
    </div>
    <div class="table-card mt">
      <div class="toolbar"><div class="row">${[['', 'Todos'], ['pendiente', 'Pendientes'], ['pagado', 'Pagados'], ['despachado', 'Despachados'], ['entregado', 'Entregados'], ['cancelado', 'Cancelados']].map(([v, l]) => `<button class="btn btn-sm ${f === v ? 'btn-primary' : 'btn-white'}" data-a="order-filter" data-v="${v}">${l} <span class="tiny">${v ? counts[v] || 0 : s.orders.length}</span></button>`).join('')}</div></div>
      <div class="tbl-wrap"><table class="tbl cards orders"><thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th class="c">Ítems</th><th class="r">Total</th><th>Pago</th><th>Estado</th><th>Canal</th><th></th></tr></thead><tbody>
      ${list.map((o) => `<tr><td class="mono b td-head"><a href="#" data-a="view-order" data-id="${esc(o.id)}">${esc(o.id)}</a></td><td class="small" data-label="Fecha">${esc(U.fmtDate(o.date))}</td><td data-label="Cliente"><b class="small">${esc(o.customer.name)}</b><div class="tiny muted">${esc(o.customer.city)}${o.customer.dep ? ', ' + esc(o.customer.dep) : ''}</div></td><td class="c" data-label="Ítems">${o.items.filter((i) => !i.bundle).reduce((a, i) => a + i.qty, 0)}</td><td class="r b" data-label="Total">${money(o.total)}</td><td class="small" data-label="Pago">${esc(o.payment.method)}<div class="tiny ${o.payment.status === 'aprobado' ? 'ok-t' : 'warn-t'}">${esc(o.payment.status)}</div></td><td data-label="Estado">${statusChip(o.status)}</td><td class="small muted" data-label="Canal">${esc(o.channel || '')}</td><td class="td-actions"><button class="icon-btn" data-a="view-order" data-id="${esc(o.id)}" title="Ver detalle">${ic('open_in_new')}</button></td></tr>`).join('') || `<tr><td colspan="9" class="td-empty"><div class="empty">${ic('shopping_cart_off')}<p>Aún no hay pedidos. Abre "Mi Tienda en Vivo", agrega productos al carrito y completa el checkout simulado.</p><button class="btn btn-primary" data-a="go" data-route="tienda">${ic('storefront')} Ir a mi tienda</button></div></td></tr>`}
      </tbody></table></div>
    </div>`;
  };

  const openOrder = (id) => {
    const s = App.s; const o = s.orders.find((x) => x.id === id); if (!o) return;
    const cost = SV.commerce.orderCost(o);
    const flow = [['pagado', 'payments', 'Marcar pagado'], ['despachado', 'local_shipping', 'Despachar'], ['entregado', 'task_alt', 'Entregado']];
    const msg = 'Hola ' + o.customer.name + ', tu pedido ' + o.id + ' de ' + s.store.name + ' está ' + o.status.toUpperCase() + '. Total ' + money(o.total) + (o.tracking ? '. Guía: ' + o.tracking : '') + '. ¡Gracias por tu compra!';
    App.drawer({
      title: 'Pedido ' + esc(o.id), sub: esc(U.fmtDate(o.date)) + ' · ' + esc(o.channel || ''), icon: 'receipt_long',
      body: `
        <div class="row between"><div class="row">${statusChip(o.status)}<span class="chip ${o.payment.status === 'aprobado' ? 'green' : 'amber'}">Pago ${esc(o.payment.status)}</span></div><b style="font-size:20px" class="ok-t">${money(o.total)}</b></div>
        <div class="form-sec"><div class="form-sec-h">Cambiar estado ${ic('sync_alt', 'sm')}</div><div class="row">${flow.map(([st, i, l]) => `<button class="btn btn-sm ${o.status === st ? 'btn-primary' : 'btn-white'}" data-a="order-status" data-id="${esc(o.id)}" data-st="${st}">${ic(i, 'sm')} ${l}</button>`).join('')}<button class="btn btn-sm btn-danger" data-a="order-status" data-id="${esc(o.id)}" data-st="${o.status === 'cancelado' ? 'pendiente' : 'cancelado'}">${ic(o.status === 'cancelado' ? 'undo' : 'block', 'sm')} ${o.status === 'cancelado' ? 'Reactivar' : 'Cancelar'}</button></div><span class="tiny muted">Cancelar devuelve las unidades al inventario. Cada cambio dispara el webhook order.updated.</span></div>
        <div class="form-sec"><div class="form-sec-h">Cliente ${ic('person', 'sm')}</div><div class="small"><b>${esc(o.customer.name)}</b><br>${esc(o.customer.email || '')} · ${esc(o.customer.phone || '')}<br>${esc(o.customer.address || '')} ${esc(o.customer.city || '')}, ${esc(o.customer.dep || '')}${o.tracking ? `<br><b>Guía de envío:</b> <span class="mono">${esc(o.tracking)}</span>` : ''}</div></div>
        <div class="form-sec"><div class="form-sec-h">Productos ${ic('shopping_bag', 'sm')}</div>
          <table class="tbl" style="min-width:0"><thead><tr><th>Producto</th><th class="c">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr></thead><tbody>${o.items.map((i) => `<tr><td class="small">${esc(i.name)}<div class="sku">${esc(i.sku)}</div></td><td class="c">${i.qty}</td><td class="r small">${i.bundle ? 'incluido' : money(i.price)}</td><td class="r small b">${i.bundle ? '' : money(i.price * i.qty)}</td></tr>`).join('')}</tbody></table>
          <div class="stack small" style="gap:4px"><div class="row between"><span>Subtotal</span><b>${money(o.subtotal)}</b></div>${o.discount ? `<div class="row between"><span>Descuento ${esc(o.coupon)}</span><b class="ok-t">−${money(o.discount)}</b></div>` : ''}<div class="row between"><span>Envío (${esc(o.shippingZone || '')})</span><b>${o.shipping ? money(o.shipping) : 'Gratis'}</b></div><div class="row between" style="font-size:15px"><b>Total</b><b class="ok-t">${money(o.total)}</b></div><div class="row between muted"><span>Costo de la mercancía</span><span>${money(cost)}</span></div><div class="row between"><span>Utilidad bruta del pedido</span><b>${money(o.total - o.shipping - cost)}</b></div></div>
        </div>
        <div class="form-sec"><div class="form-sec-h">Pago ${ic('credit_card', 'sm')}</div><div class="small">${esc(o.payment.method)} ${o.payment.ref ? '· ' + esc(o.payment.ref) : ''} · Estado: <b>${esc(o.payment.status)}</b></div></div>
        ${(o.history || []).length ? `<div class="form-sec"><div class="form-sec-h">Historial ${ic('history', 'sm')}</div><div class="log">${o.history.map((h) => `<div>${ic('radio_button_checked', 'ok-t')}<span>${esc(U.fmtDate(h.at))} → <b>${esc(h.status)}</b></span></div>`).join('')}</div></div>` : ''}`,
      foot: `<a class="btn btn-soft" target="_blank" rel="noopener" href="https://wa.me/57${esc(String(o.customer.phone || '').replace(/\D/g, ''))}?text=${encodeURIComponent(msg)}">${ic('chat')} Notificar por WhatsApp</a><button class="btn btn-primary" data-a="order-receipt" data-id="${esc(o.id)}">${ic('print')} Comprobante</button>`
    });
  };

  /* ---------------- Mi Tienda en Vivo ---------------- */
  const EV_LABELS = { page_view: ['visibility', 'Visita a la tienda'], view_item: ['pageview', 'Vio un producto'], add_to_cart: ['add_shopping_cart', 'Agregó al carrito'], begin_checkout: ['shopping_cart_checkout', 'Inició el checkout'], purchase: ['paid', 'Compra completada'], add_to_wishlist: ['favorite', 'Agregó a favoritos'] };
  PARTIALS.events = (s) => {
    const a = s.analytics || {};
    const conv = a.page_view ? (a.purchase || 0) / a.page_view * 100 : 0;
    return `<div class="ev-counts">${['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase'].map((k) => `<div><b>${a[k] || 0}</b><small>${EV_LABELS[k][1]}</small></div>`).join('')}<div><b>${U.pct(conv)}</b><small>Conversión (compras ÷ visitas)</small></div></div>
      <div class="events mt-s">${App.ui.liveEvents.slice(0, 30).map((e) => `<div>${ic((EV_LABELS[e.event] || ['bolt'])[0], 'sm ok-t')}<span class="grow">${esc((EV_LABELS[e.event] || [0, e.event])[1])}${e.detail ? ' · ' + esc(e.detail) : ''}</span><span class="tiny muted">${esc(new Date(e.at).toLocaleTimeString('es-CO'))}</span></div>`).join('') || '<div class="muted">Interactúa con la tienda para ver los eventos del píxel simulado.</div>'}</div>`;
  };
  PARTIALS.lastorders = (s) => s.orders.slice(0, 4).map((o) => `<div class="row between small" style="padding:6px 0"><span class="mono b">${esc(o.id)}</span><span>${statusChip(o.status)}</span><b>${money(o.total)}</b></div>`).join('') || '<p class="small muted">Sin pedidos aún.</p>';

  VIEWS.tienda = (s) => {
    const t = SV.themeOf(s);
    const d = App.ui.device;
    return `
    <div class="preview-bar">
      <div class="row"><span class="chip solid"><i class="d"></i>Simulador en vivo</span><span class="chip">${ic('palette', 'sm')} Tema: ${esc(t.name)}</span><span class="small muted hide-sm">Vista de comprador final · Ficha ${esc(s.owner.ficha)}</span></div>
      <div class="row"><div class="seg">${[['desktop', 'desktop_windows', 'Escritorio'], ['tablet', 'tablet', 'Tableta'], ['mobile', 'smartphone', 'Móvil']].map(([k, i, l]) => `<button class="${d === k ? 'on' : ''}" data-a="device" data-d="${k}">${ic(i, 'sm')}<span class="hide-sm">${l}</span></button>`).join('')}</div>
      <button class="btn btn-soft btn-sm" data-a="reload-preview" title="Recargar con los últimos cambios">${ic('refresh', 'sm')}</button><button class="btn btn-soft btn-sm" data-a="open-store-tab">${ic('open_in_new', 'sm')} Pestaña nueva</button><button class="btn btn-soft btn-sm" data-a="go" data-route="configuracion">${ic('tune', 'sm')} Volver al editor</button><button class="btn btn-primary btn-sm" data-a="go" data-route="publicar">${ic('rocket_launch', 'sm')} Publicar</button></div>
    </div>
    <div class="didactic"><div class="l"><div class="ico">${ic('school')}</div><div><h4>${esc(t.didactic.title)}</h4><p class="small">${esc(t.didactic.text)}</p></div></div><div class="row" style="gap:20px">${t.didactic.kpis.map(([k, v]) => `<div class="kp"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div></div>
    <div class="frame-wrap" id="frame-wrap" style="max-width:${d === 'mobile' ? '400px' : d === 'tablet' ? '820px' : '100%'}">
      <div class="frame-chrome"><i></i><i></i><i></i><div class="url">${ic('lock', 'sm')} https://${esc(s.store.subdomain)}.senaventas.edu.co</div></div>
      <iframe class="store-frame" id="store-frame" title="Vista previa de la tienda" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-modals allow-forms"></iframe>
    </div>
    <div class="grid g-side mt">
      <div class="card"><div class="card-h"><h3>${ic('monitoring')} Eventos en vivo (píxel y analítica simulados)</h3><button class="btn btn-sm btn-ghost" data-a="reset-analytics">Reiniciar</button></div><div data-partial="events">${PARTIALS.events(s)}</div></div>
      <div class="card"><div class="card-h"><h3>${ic('receipt_long')} Últimos pedidos</h3><button class="btn btn-sm btn-ghost" data-a="go" data-route="pedidos">Ver todos</button></div><div data-partial="lastorders">${PARTIALS.lastorders(s)}</div>
        <div class="tip mt" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('credit_card', 'sm')}</div><p class="small">Tarjeta de prueba que aprueba: <span class="kbd">4242 4242 4242 4242</span>. Rechazo: <span class="kbd">4000 0000 0000 0002</span>. Cupón: <span class="kbd">${esc((s.coupons.find((c) => c.active) || { code: '—' }).code)}</span></p></div>
      </div>
    </div>`;
  };
  AFTER.tienda = (s) => {
    const f = $('#store-frame');
    if (f) f.srcdoc = SV.renderStore(s, { mode: 'preview' });
    if (!s.progress.previewVisited) { s.progress.previewVisited = true; App.commit(null); }
  };

  /* ---------------- Integraciones & API ---------------- */
  const apiTabs = [['apps', 'extension', 'Aplicativos'], ['keys', 'key', 'Llaves de API'], ['console', 'terminal', 'Consola REST'], ['webhooks', 'webhook', 'Webhooks'], ['docs', 'menu_book', 'Documentación']];
  VIEWS.api = (s) => {
    const tab = App.ui.apiTab;
    return `
    <div class="page-head">
      <div><div class="row"><span class="mod-chip">Módulo práctico 05</span><span class="small muted">Interoperabilidad y automatización</span></div><h1>Integraciones & API de la Tienda</h1><p class="lead">Conecta tu tienda con pasarelas, facturación, marketing y logística. Consulta y modifica el catálogo por API REST y recibe eventos por webhooks. Todo en modo sandbox.</p></div>
      <div class="tip" style="max-width:420px"><div class="ico">${ic('security')}</div><div><h4>Buenas prácticas</h4><p class="small">Nunca publiques llaves secretas en el código de la tienda. Usa llaves de solo lectura para reportes y rota las llaves comprometidas.</p></div></div>
    </div>
    <div class="tabs">${apiTabs.map(([id, i, l]) => `<button class="tab ${tab === id ? 'on' : ''}" data-a="api-tab" data-tab="${id}">${ic(i)}${l}${id === 'apps' ? `<span class="n">${Object.values(s.integrations).filter((x) => x.connected).length}/${SV.INTEGRATIONS.length}</span>` : id === 'keys' ? `<span class="n">${s.apiKeys.filter((k) => !k.revoked).length}</span>` : id === 'webhooks' ? `<span class="n">${s.webhooks.length}</span>` : ''}</button>`).join('')}</div>
    ${API[tab](s)}`;
  };
  const API = {};
  API.apps = (s) => `
    <div class="grid g3">
      ${SV.INTEGRATIONS.map((it) => {
        const st = s.integrations[it.id];
        const on = st && st.connected;
        const busy = App.ui.busy[it.id];
        return `<div class="card integ">
          <div class="integ-h"><div class="integ-logo" style="background:${it.color};${it.color === '#ffe01b' ? 'color:#241c15' : ''}">${ic(it.icon)}</div><div class="grow"><h3>${esc(it.name)}</h3><div class="row" style="gap:6px;margin-top:3px"><span class="chip">${esc(it.cat)}</span>${on ? '<span class="chip green"><i class="d"></i>Conectado</span>' : '<span class="chip gray">Sin conectar</span>'}</div></div></div>
          <p class="small muted">${esc(it.desc)}</p>
          ${on ? `<div class="stack" style="gap:6px">${it.actions.map((a) => `<button class="btn btn-soft btn-sm" style="justify-content:flex-start" data-a="run-integ" data-id="${it.id}" data-act="${a.id}" ${busy ? 'disabled' : ''}>${ic(busy === a.id ? 'progress_activity' : 'play_arrow', 'sm')} ${esc(a.label)}</button>`).join('')}</div>
            <div class="log">${(st.log || []).slice(0, 4).map((l) => `<div>${ic(l.ok ? 'check_circle' : 'error', l.ok ? 'ok-t' : 'err-t')}<span class="grow">${esc(l.text)}</span><span class="tiny muted">${esc(U.timeAgo(l.at))}</span></div>`).join('')}</div>
            <div class="row"><span class="tiny muted grow">Conectado ${esc(U.timeAgo(st.connectedAt))}</span><button class="btn btn-sm btn-ghost" data-a="disconnect-integ" data-id="${it.id}">Desconectar</button></div>`
          : `<button class="btn btn-primary" data-a="connect-integ" data-id="${it.id}">${ic('link')} Conectar en modo sandbox</button>`}
        </div>`;
      }).join('')}
    </div>`;

  API.keys = (s) => `
    <div class="grid g-side">
      <div class="card">
        <div class="card-h"><h3>Llaves de API de la tienda</h3><button class="btn btn-primary btn-sm" data-a="new-key">${ic('add', 'sm')} Generar llave</button></div>
        ${s.apiKeys.length ? `<div class="stack">${s.apiKeys.map((k, i) => `<div class="card flat stack" style="gap:8px;padding:14px;${k.revoked ? 'opacity:.55' : ''}"><div class="row between"><div class="row"><b>${esc(k.label)}</b><span class="chip ${k.scope === 'write' ? 'amber' : 'blue'}">${k.scope === 'write' ? 'lectura + escritura' : 'solo lectura'}</span>${k.revoked ? '<span class="chip red">Revocada</span>' : ''}</div><span class="tiny muted">Creada ${esc(U.fmtDate(k.created))}${k.lastUsed ? ' · usada ' + esc(U.timeAgo(k.lastUsed)) : ''}</span></div>
          <div class="key-box"><span>${esc(k.show ? k.key : k.key.slice(0, 12) + '•'.repeat(18))}</span><button class="icon-btn" data-a="key-show" data-i="${i}" title="Mostrar u ocultar">${ic(k.show ? 'visibility_off' : 'visibility', 'sm')}</button><button class="icon-btn" data-a="copy" data-text="${esc(k.key)}" title="Copiar">${ic('content_copy', 'sm')}</button>${k.revoked ? '' : `<button class="icon-btn" data-a="use-key" data-i="${i}" title="Usar en la consola">${ic('terminal', 'sm')}</button><button class="icon-btn danger" data-a="revoke-key" data-i="${i}" title="Revocar">${ic('block', 'sm')}</button>`}</div></div>`).join('')}</div>` : `<div class="empty">${ic('key')}<p>No tienes llaves. Genera una para usar la Consola REST o conectar un aplicativo externo.</p></div>`}
      </div>
      <div class="card stack">
        <h3 style="font-size:16px">¿Cómo se usa una llave?</h3>
        <p class="small">Toda solicitud a la API debe enviar el encabezado:</p>
        <pre class="code">Authorization: Bearer sk_test_...</pre>
        <p class="small"><b>read</b>: consultar productos, pedidos y reportes (GET).<br><b>write</b>: además crear, editar y borrar (POST, PUT, PATCH, DELETE).</p>
        <p class="small">Límite didáctico: 60 solicitudes por minuto por llave (respuesta 429 si lo superas).</p>
        <div class="tip" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('lightbulb', 'sm')}</div><p class="small">Caso real: un ERP o una hoja de cálculo usa una llave <b>write</b> para actualizar el stock cada noche con <span class="kbd">PATCH /products/{sku}/stock</span>.</p></div>
      </div>
    </div>`;

  /* Resalta JSON: tokeniza el texto original y escapa cada fragmento. */
  const hl = (json) => {
    const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
    let out = ''; let last = 0; let m;
    while ((m = re.exec(json))) {
      out += esc(json.slice(last, m.index));
      if (m[1]) out += m[2] ? `<span class="k">${esc(m[1])}</span>${m[2]}` : `<span class="s">${esc(m[1])}</span>`;
      else if (m[3]) out += `<span class="bo">${m[3]}</span>`;
      else out += `<span class="n">${m[4]}</span>`;
      last = re.lastIndex;
    }
    return out + esc(json.slice(last));
  };
  PARTIALS.conresp = (s) => {
    const c = App.ui.con;
    if (c.busy) return `<div class="empty">${ic('progress_activity')}<p>Enviando solicitud...</p></div>`;
    if (!c.resp) return `<div class="empty">${ic('send')}<p>Envía una solicitud para ver la respuesta JSON, el código de estado y el tiempo de respuesta.</p></div>`;
    const r = c.resp;
    return `<div class="row between"><div class="row"><span class="status-pill st-${String(r.status)[0]}">${r.status}</span><span class="small muted">${r.ms} ms</span></div><button class="btn btn-sm btn-ghost" data-a="copy" data-text="${esc(JSON.stringify(r.body, null, 2))}">${ic('content_copy', 'sm')} Copiar</button></div>
      <div class="small muted mono" style="margin:8px 0">${Object.entries(r.headers || {}).map(([k, v]) => esc(k) + ': ' + esc(v)).join('<br>')}</div>
      <pre class="code">${r.body == null ? '<span class="muted">(sin contenido)</span>' : hl(JSON.stringify(r.body, null, 2))}</pre>`;
  };
  PARTIALS.snippet = () => {
    const c = App.ui.con;
    const req = { method: c.method, path: c.path, body: c.body, token: c.token };
    return `<div class="seg" style="margin-bottom:8px">${[['curl', 'cURL'], ['js', 'JavaScript'], ['python', 'Python']].map(([k, l]) => `<button class="${c.lang === k ? 'on' : ''}" data-a="con-lang" data-l="${k}">${l}</button>`).join('')}</div><pre class="code">${esc(SV.api.snippet(c.lang, req))}</pre>`;
  };
  API.console = (s) => {
    const c = App.ui.con;
    const keys = s.apiKeys.filter((k) => !k.revoked);
    if (!c.token && keys.length) c.token = keys[0].key;
    const sample = (s.products[0] || { sku: 'CAF-001' }).sku;
    return `
    <div class="grid g2">
      <div class="card stack">
        <h3 style="font-size:16px">${ic('terminal')} Solicitud</h3>
        ${keys.length ? '' : `<div class="tip" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('key', 'sm')}</div><div class="grow small">Necesitas una llave para autenticarte. <button class="btn btn-sm btn-primary" data-a="new-key">Generar llave</button></div></div>`}
        <div class="field"><label>Llave (Authorization: Bearer)</label><select class="select" data-a-change="con-token"><option value="">Sin llave (probar error 401)</option>${keys.map((k) => `<option value="${esc(k.key)}" ${c.token === k.key ? 'selected' : ''}>${esc(k.label)} · ${k.scope}</option>`).join('')}</select></div>
        <div class="row" style="flex-wrap:nowrap"><select class="select" style="width:120px" data-a-change="con-method">${opts(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], c.method)}</select><input class="input mono" data-a-input="con-path" value="${esc(c.path)}" aria-label="Ruta"></div>
        <div class="field"><label>Cuerpo JSON ${c.method === 'GET' || c.method === 'DELETE' ? '<span class="tiny muted">(no aplica para ' + c.method + ')</span>' : ''}</label><textarea class="code" data-a-input="con-body" spellcheck="false" placeholder="{ }">${esc(c.body)}</textarea></div>
        <div class="row"><button class="btn btn-primary btn-lg" data-a="con-send" ${c.busy ? 'disabled' : ''}>${ic('send')} Enviar solicitud</button><span class="small muted">Base: https://api.senaventas.edu.co${SV.api.BASE}</span></div>
        <div><div class="lbl" style="margin-bottom:6px">Endpoints rápidos</div><div class="stack" style="gap:4px">${SV.api.endpoints.map((e) => `<button class="row small" style="gap:8px;text-align:left;padding:5px 6px;border-radius:6px;flex-wrap:nowrap" data-a="con-pick" data-m="${e.m}" data-p="${esc(e.p.replace('{id|sku}', sample).replace('{id}', (s.orders[0] || { id: 'SV-000000' }).id))}" data-ex="${esc(e.m + ' ' + e.p)}"><span class="method m-${e.m}">${e.m}</span><span class="mono grow">${esc(e.p)}</span></button>`).join('')}</div></div>
      </div>
      <div class="stack">
        <div class="card"><h3 style="font-size:16px;margin-bottom:10px">${ic('data_object')} Respuesta</h3><div data-partial="conresp">${PARTIALS.conresp(s)}</div></div>
        <div class="card"><h3 style="font-size:16px;margin-bottom:10px">${ic('code')} Código equivalente</h3><div data-partial="snippet">${PARTIALS.snippet()}</div></div>
        <div class="card"><h3 style="font-size:16px;margin-bottom:10px">${ic('history')} Historial de solicitudes</h3><div class="log">${s.apiLog.slice(0, 12).map((l) => `<div><span class="method m-${l.method}">${l.method}</span><span class="mono grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.path)}</span><span class="status-pill st-${String(l.status)[0]}">${l.status}</span><span class="tiny muted">${l.ms}ms</span></div>`).join('') || '<div class="muted">Sin solicitudes aún.</div>'}</div></div>
      </div>
    </div>`;
  };

  API.webhooks = (s) => `
    <div class="grid g-side">
      <div class="stack">
        <div class="card">
          <div class="card-h"><h3>Webhooks registrados</h3><span class="small muted">La tienda avisa a otros sistemas cuando ocurre un evento.</span></div>
          ${s.webhooks.length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:600px"><thead><tr><th>Destino</th><th>Evento</th><th>Secreto de firma</th><th class="c">Activo</th><th></th></tr></thead><tbody>${s.webhooks.map((w, i) => `<tr><td class="mono small" style="max-width:260px;overflow:hidden;text-overflow:ellipsis">${esc(w.url)}${w.realSend ? ' <span class="chip amber">envío real</span>' : ''}</td><td><span class="chip">${esc(w.event === '*' ? 'todos' : w.event)}</span></td><td class="mono tiny">${esc(w.secret.slice(0, 10))}…</td><td class="c">${sw(w.active, 'toggle-webhook', `data-i="${i}"`)}</td><td><div class="actions"><button class="icon-btn" title="Enviar prueba" data-a="test-webhook" data-i="${i}">${ic('send')}</button><button class="icon-btn danger" title="Eliminar" data-a="del-webhook" data-i="${i}">${ic('delete')}</button></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">${ic('webhook')}<p>Registra un webhook para recibir eventos como order.created o stock.low.</p></div>`}
        </div>
        <div class="card">
          <div class="card-h"><h3>Entregas recientes</h3><button class="btn btn-sm btn-ghost" data-a="clear-deliveries" ${s.webhookLog.length ? '' : 'disabled'}>Limpiar</button></div>
          ${s.webhookLog.length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:600px"><thead><tr><th>Hora</th><th>Evento</th><th>Destino</th><th class="c">Código</th><th class="r">Tiempo</th><th></th></tr></thead><tbody>${s.webhookLog.slice(0, 25).map((d) => `<tr><td class="small">${esc(new Date(d.at).toLocaleTimeString('es-CO'))}</td><td><span class="chip">${esc(d.event)}</span></td><td class="mono tiny" style="max-width:220px;overflow:hidden;text-overflow:ellipsis">${esc(d.url)}</td><td class="c">${d.code == null ? '<span class="chip gray">…</span>' : `<span class="status-pill st-${String(d.code)[0]}">${d.code}</span>`}</td><td class="r small">${d.ms == null ? '' : d.ms + ' ms'}</td><td><button class="icon-btn" data-a="view-delivery" data-id="${d.id}" title="Ver payload">${ic('data_object')}</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="small muted">Sin entregas todavía.</p>'}
        </div>
      </div>
      <div class="card stack">
        <h3 style="font-size:16px">${ic('add_link')} Nuevo webhook</h3>
        <form class="stack" data-form="add-webhook">
          ${field('URL de destino', '<input class="input mono" name="url" required placeholder="https://webhook.site/tu-id" value="https://webhook.site/senaventas-demo">', 'Usa https. Una URL que contenga "fail" simula un error 500.')}
          ${field('Evento', `<select class="select" name="event"><option value="*">Todos los eventos</option>${opts(SV.WEBHOOK_EVENTS, 'order.created')}</select>`)}
          <label class="check small"><input type="checkbox" name="real"> Enviar de verdad (POST real desde el navegador a la URL)</label>
          <button class="btn btn-primary" type="submit">${ic('add')} Registrar webhook</button>
        </form>
        <div class="tip" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('verified', 'sm')}</div><p class="small">Cada entrega lleva el encabezado <span class="kbd">X-Senaventas-Signature</span>, calculado con el secreto. El receptor recalcula la firma para comprobar que el evento es auténtico.</p></div>
        <p class="small muted">Para ver envíos reales abre <a href="https://webhook.site" target="_blank" rel="noopener">webhook.site</a>, copia tu URL única y activa "Enviar de verdad".</p>
      </div>
    </div>`;

  API.docs = (s) => `
    <div class="grid g-side">
      <div class="table-card">
        <div class="toolbar"><b>Referencia de la API REST · ${esc(SV.api.BASE)}</b><span class="small muted">JSON · UTF-8 · Autenticación Bearer</span></div>
        <div class="tbl-wrap"><table class="tbl" style="min-width:620px"><thead><tr><th>Método</th><th>Ruta</th><th>Permiso</th><th>Descripción</th></tr></thead><tbody>${SV.api.endpoints.map((e) => `<tr><td><span class="method m-${e.m}">${e.m}</span></td><td class="mono small">${esc(e.p)}</td><td><span class="chip ${e.scope === 'write' ? 'amber' : 'blue'}">${e.scope}</span></td><td class="small">${esc(e.d)}</td></tr>`).join('')}</tbody></table></div>
      </div>
      <div class="stack">
        <div class="card stack"><h3 style="font-size:16px">Códigos de estado</h3>${[['200', 'OK: consulta o actualización exitosa'], ['201', 'Created: recurso creado'], ['202', 'Accepted: evento en cola'], ['204', 'No Content: eliminado'], ['400', 'Bad Request: JSON mal formado'], ['401', 'Unauthorized: falta o es inválida la llave'], ['403', 'Forbidden: la llave no tiene permiso'], ['404', 'Not Found: el recurso no existe'], ['409', 'Conflict: stock insuficiente'], ['422', 'Unprocessable: datos inválidos'], ['429', 'Too Many Requests: límite superado']].map(([c, d]) => `<div class="row small" style="flex-wrap:nowrap"><span class="status-pill st-${c[0]}">${c}</span><span>${d}</span></div>`).join('')}</div>
        <div class="card stack"><h3 style="font-size:16px">Eventos de webhook</h3>${SV.WEBHOOK_EVENTS.map((e) => `<span class="chip" style="width:max-content">${e}</span>`).join('')}</div>
        <div class="card stack"><h3 style="font-size:16px">Actividad sugerida</h3><ol class="steps-list small"><li>Genera una llave <b>write</b>.</li><li>Crea un producto con <span class="kbd">POST /products</span>.</li><li>Registra un webhook para <span class="kbd">stock.low</span>.</li><li>Baja el stock con <span class="kbd">PATCH /products/{sku}/stock</span> hasta el mínimo.</li><li>Revisa la entrega del webhook y explica la firma.</li></ol></div>
      </div>
    </div>`;

  /* ---------------- Publicar ---------------- */
  VIEWS.publicar = (s) => {
    const list = checklist(s);
    const score = scoreOf(list);
    const reqOk = list.filter((c) => c.req).every((c) => c.ok);
    const color = score >= 80 ? 'var(--primary-c)' : score >= 60 ? '#e3a008' : 'var(--error)';
    const p = s.published;
    return `
    <div class="page-head">
      <div><div class="row"><span class="mod-chip">Paso 5 de 5</span><span class="small muted">Lanzamiento del sitio</span></div><h1>Publicar & Lanzar la Tienda</h1><p class="lead">Verifica el checklist de calidad, publica tu tienda y descarga el sitio listo para subir a cualquier hosting gratuito.</p></div>
    </div>
    <div class="grid g-side">
      <div class="card">
        <div class="card-h"><h3>Checklist de calidad e-commerce</h3><span class="small muted">${list.filter((c) => c.ok).length} de ${list.length} criterios</span></div>
        <div class="stack" style="gap:8px">${list.map((c) => `<div class="check-item ${c.ok ? 'ok' : c.req ? 'no' : 'opt'}"><div class="st">${ic(c.ok ? 'check' : c.req ? 'close' : 'priority_high', 'sm')}</div><div class="grow"><b>${esc(c.t)} ${c.req ? '<span class="chip gray" style="font-size:10px">obligatorio</span>' : '<span class="chip" style="font-size:10px">recomendado</span>'}</b><small>${esc(c.d)}</small></div>${c.ok ? '' : `<button class="btn btn-sm btn-white" data-a="go" data-route="${c.route}" data-tab="${c.tab || ''}">Resolver</button>`}</div>`).join('')}</div>
      </div>
      <div class="stack">
        <div class="card stack" style="text-align:center">
          <div class="score-ring" style="background:conic-gradient(${color} ${score * 3.6}deg, var(--s) 0)"><div><b>${score}%</b><span class="tiny muted">Puntaje</span></div></div>
          <p class="small">${score >= 80 ? '<b class="ok-t">Nivel aprobado.</b> Tu tienda cumple los criterios de calidad.' : 'Completa los criterios pendientes para llegar al 80%.'}</p>
          ${p ? `<div class="card flat" style="text-align:left"><div class="row between"><span class="chip solid">${ic('public', 'sm')} Publicada · v${p.version}</span><span class="tiny muted">${esc(U.fmtDate(p.at))}</span></div><div class="mono small mt-s ok-t">https://${esc(s.store.subdomain)}.senaventas.edu.co</div></div>` : ''}
          <button class="btn btn-primary btn-lg btn-block" data-a="publish" ${reqOk ? '' : 'disabled'}>${ic('rocket_launch')} ${p ? 'Actualizar publicación (v' + (p.version + 1) + ')' : 'Publicar tienda'}</button>
          ${reqOk ? '' : '<p class="tiny err-t">Completa los criterios obligatorios para publicar.</p>'}
          ${p ? `<div class="grid g2" style="gap:8px"><button class="btn btn-soft" data-a="open-published">${ic('open_in_new')} Abrir sitio</button><button class="btn btn-soft" data-a="download-html">${ic('html')} index.html</button><button class="btn btn-primary" data-a="download-zip" style="grid-column:1/-1">${ic('folder_zip')} Descargar paquete del sitio (.zip)</button><button class="btn btn-ghost btn-sm" data-a="unpublish" style="grid-column:1/-1">Despublicar</button></div>` : ''}
          <button class="btn btn-ghost btn-sm" data-a="report">${ic('assignment')} Descargar informe de evidencia</button>
        </div>
      </div>
    </div>
    <div class="card mt">
      <div class="card-h"><h3>${ic('cloud_upload')} Subir el sitio a la web (gratis)</h3><span class="small muted">El paquete .zip contiene un sitio estático: no necesita base de datos ni servidor.</span></div>
      <div class="grid g3">
        <div class="card flat stack"><b>Netlify Drop (el más fácil)</b><ol class="steps-list small"><li>Descarga y descomprime el .zip.</li><li>Entra a <a href="https://app.netlify.com/drop" target="_blank" rel="noopener">app.netlify.com/drop</a>.</li><li>Arrastra la carpeta. En segundos recibes una URL pública.</li></ol></div>
        <div class="card flat stack"><b>GitHub Pages</b><ol class="steps-list small"><li>Crea un repositorio público en GitHub.</li><li>Sube los archivos del .zip (Add file → Upload files).</li><li>Settings → Pages → Deploy from branch → main. Tu tienda queda en usuario.github.io/repositorio.</li></ol></div>
        <div class="card flat stack"><b>Cualquier hosting</b><ol class="steps-list small"><li>Sube <span class="kbd">index.html</span> y los demás archivos por FTP o el administrador del hosting.</li><li>También funciona con Vercel, Cloudflare Pages o Google Drive como archivo.</li><li>Abre el archivo con doble clic para probarlo sin internet.</li></ol></div>
      </div>
      <p class="small muted mt-s">El sitio publicado mantiene la pasarela simulada, el carrito, los cupones y guarda los pedidos en el navegador del visitante. No procesa pagos reales.</p>
    </div>
    ${(s.publishHistory || []).length ? `<div class="card mt"><div class="card-h"><h3>Historial de publicaciones</h3></div><div class="log">${s.publishHistory.map((h) => `<div>${ic('public', 'ok-t')}<span class="grow">Versión ${h.version} · ${h.products} productos · puntaje ${h.score}%</span><span class="tiny muted">${esc(U.fmtDate(h.at))}</span></div>`).join('')}</div></div>` : ''}`;
  };

  /* ======================================================================
     Exportación del sitio
     ====================================================================== */
  const siteFiles = (s) => {
    const html = SV.renderStore(s, { mode: 'export' });
    const pubs = s.products.filter((p) => p.status === 'publicado');
    const base = 'https://' + s.store.subdomain + '.senaventas.edu.co/';
    const csv = U.toCSV([['sku', 'nombre', 'categoria', 'precio', 'precio_referencia', 'stock', 'estado', 'descripcion']].concat(pubs.map((p) => [p.sku, p.name, p.category, p.price, p.compareAt || '', p.stock, p.status, p.description])));
    const catalog = { tienda: s.store.name, moneda: s.store.currency, generado: new Date().toISOString(), productos: pubs.map((p) => ({ sku: p.sku, nombre: p.name, categoria: p.category, precio: p.price, stock: p.stock, descripcion: p.description, imagen: p.image && p.image.startsWith('data:') ? '(incrustada en index.html)' : p.image })) };
    const readme = `SITIO WEB GENERADO CON SENAVENTAS\r\n==================================\r\nTienda: ${s.store.name}\r\nResponsable: ${s.owner.name} (${s.owner.role}) · Ficha ${s.owner.ficha}\r\nVersión publicada: ${s.published ? s.published.version : 'borrador'}\r\nFecha: ${new Date().toLocaleString('es-CO')}\r\n\r\nCONTENIDO\r\n- index.html: la tienda completa (diseño, catálogo, carrito y checkout simulado).\r\n- productos.json / productos.csv: catálogo en formato de datos.\r\n- sitemap.xml y robots.txt: archivos para buscadores.\r\n- sesion.senaventas.json: respaldo para volver a abrir la tienda en SENAVENTAS.\r\n\r\nCÓMO PUBLICARLO\r\n1. Netlify Drop: arrastra esta carpeta a https://app.netlify.com/drop\r\n2. GitHub Pages: sube los archivos a un repositorio y activa Pages.\r\n3. Local: abre index.html con doble clic.\r\n\r\nAVISO: sitio con fines exclusivamente educativos. Los pagos son simulados y no se procesa dinero real.\r\n`;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${esc(base)}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`;
    return [
      { name: 'index.html', data: html },
      { name: 'productos.json', data: JSON.stringify(catalog, null, 2) },
      { name: 'productos.csv', data: '﻿' + csv },
      { name: 'sitemap.xml', data: sitemap },
      { name: 'robots.txt', data: `User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n` },
      { name: 'LEEME.txt', data: readme },
      { name: 'sesion.senaventas.json', data: JSON.stringify(sessionExport(s, false), null, 2) }
    ];
  };

  const sessionExport = (s, asTemplate) => {
    const copy = U.clone(s);
    if (asTemplate) {
      Object.assign(copy, { orders: [], apiLog: [], webhookLog: [], apiKeys: [], webhooks: [], integrations: {}, analytics: {}, published: null, publishHistory: [], activity: [{ at: Date.now(), text: 'Plantilla creada a partir de ' + s.name }] });
      copy.progress = { themeChosen: false, previewVisited: false };
      copy.name = s.name + ' (plantilla)';
    }
    return { app: 'SENAVENTAS', kind: asTemplate ? 'plantilla' : 'sesion', schema: SV.SCHEMA_VERSION, exportedAt: new Date().toISOString(), session: copy };
  };

  const openBlob = (html) => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const w = window.open(url, '_blank');
    if (!w) toast('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.', 'err', 'block');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const buildPortable = async () => {
    const get = async (u) => { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) throw new Error(u + ' → ' + r.status); return r.text(); };
    let html = await get('index.html');
    const css = await get('assets/css/app.css');
    html = html.replace(/<link rel="stylesheet" href="assets\/css\/app\.css">/, () => '<style>\n' + css + '\n</style>');
    const scripts = Array.from(html.matchAll(/<script src="(assets\/js\/[^"]+)"><\/script>/g)).map((m) => m[1]);
    for (const src of scripts) {
      const js = (await get(src)).replace(/<\/script/gi, '<\\/script');
      html = html.replace(`<script src="${src}"></script>`, () => '<script>\n' + js + '\n</script>');
    }
    const svg = await get('assets/icons/icon.svg');
    html = html.replace(/<link rel="manifest"[^>]*>\n?/, '').replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
      .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`);
    return html;
  };

  /* ======================================================================
     Sesiones
     ====================================================================== */
  const refreshSessions = async () => { App.sessions = await SV.storage.list(); };

  const openSession = async (id) => {
    if (App.ui.dirty) await saveNow();
    const data = await SV.storage.get(id);
    if (!data) { toast('No se encontró la sesión', 'err'); return; }
    App.s = SV.normalizeSession(data);
    App.ui.sel = new Set(); App.ui.liveEvents = []; App.ui.con.resp = null; App.ui.con.token = ''; App.ui.unseen = 0;
    SV.storage.setLast(id);
    await refreshSessions();
    render();
  };

  const createSession = async (themeId, owner) => {
    if (App.s && App.ui.dirty) await saveNow();
    const s = SV.newSession(themeId, owner);
    App.s = s;
    App.ui.sel = new Set(); App.ui.liveEvents = []; App.ui.con.resp = null; App.ui.con.token = '';
    await saveNow();
    await refreshSessions();
    return s;
  };

  const importFile = async (file) => {
    try {
      const txt = await U.readFile(file, 'text');
      const raw = JSON.parse(txt);
      const sess = SV.normalizeSession(raw.session || raw);
      sess.id = U.uid('ses_');
      sess.name = raw.kind === 'plantilla' ? sess.name.replace(/ \(plantilla\)$/, '') + ' · copia' : sess.name + ' (importada)';
      sess.updatedAt = Date.now();
      sess.activity.unshift({ at: Date.now(), text: 'Sesión importada desde ' + file.name });
      await SV.storage.put(sess);
      await refreshSessions();
      await openSession(sess.id);
      toast('Sesión importada: ' + sess.name);
    } catch (e) {
      toast('No se pudo importar: ' + e.message, 'err');
    }
  };

  const pickFile = (accept, cb) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept;
    inp.onchange = () => { if (inp.files[0]) cb(inp.files[0]); };
    inp.click();
  };

  const newSessionModal = () => {
    const o = App.s ? App.s.owner : {};
    const root = App.modal({
      title: 'Nueva tienda virtual', sub: 'Se crea una sesión nueva con contenido de ejemplo del tema elegido. Tu sesión actual queda guardada.', wide: true,
      body: `<form class="stack" id="new-form">
        <div class="frow">${field('Nombre del aprendiz o responsable', `<input class="input" name="name" required value="${esc(o.name && o.name !== 'Aprendiz SENA' ? o.name : '')}" placeholder="Ej: Carlos Mendoza">`, '', true)}${field('Ficha', `<input class="input" name="ficha" value="${esc(o.ficha || '')}" placeholder="27118">`)}</div>
        <div class="frow">${field('Programa de formación', `<input class="input" name="programa" value="${esc(o.programa || 'Gestión de Mercados')}">`)}${field('Instructor(a)', `<input class="input" name="instructor" value="${esc(o.instructor || '')}" placeholder="Opcional">`)}</div>
        <div class="field"><label>Tema de partida</label><div class="grid g3" style="gap:10px">${SV.THEMES.map((t, i) => `<label class="color-opt" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row" style="flex-wrap:nowrap"><input type="radio" name="theme" value="${t.id}" ${i === 0 ? 'checked' : ''} style="accent-color:var(--primary-c)"><b>${esc(t.name)}</b></div><div style="height:30px;border-radius:6px;background:linear-gradient(90deg,${t.vars.primary},${t.vars.accent})"></div><small>${esc(t.tag)}</small></label>`).join('')}</div></div>
      </form>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-primary" form="new-form" type="submit">${ic('add')} Crear tienda</button>`
    });
    root.querySelector('#new-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      await createSession(f.theme.value, { name: f.name.value.trim(), ficha: f.ficha.value.trim() || '27118', programa: f.programa.value.trim(), instructor: f.instructor.value.trim() });
      App.closeOverlay();
      go('inicio');
      toast('Tienda creada. ¡Empieza por la identidad de marca!');
    });
  };

  /* ======================================================================
     Acciones (delegación de eventos)
     ====================================================================== */
  const A = {};
  A['go'] = (el) => go(el.dataset.route, el.dataset.tab);
  A['open-side'] = () => document.body.classList.add('side-open');
  A['close-side'] = () => document.body.classList.remove('side-open');
  A['close-overlay'] = () => App.closeOverlay();
  A['save-now'] = async () => { await saveNow(); toast('Sesión guardada en este navegador', 'ok', 'cloud_done'); };
  A['install'] = async () => {
    if (!App.installPrompt) { toast('Usa el menú del navegador: Instalar SENAVENTAS', 'ok', 'install_desktop'); return; }
    App.installPrompt.prompt();
    await App.installPrompt.userChoice;
    App.installPrompt = null;
    $('#install-btn').classList.add('hide');
  };
  A['portable'] = async (el) => {
    el.disabled = true;
    try { U.download('senaventas-portable.html', await buildPortable(), 'text/html'); toast('Versión portable descargada'); }
    catch (e) { toast('No se pudo generar: ' + e.message, 'err'); }
    el.disabled = false;
  };
  A['help'] = () => App.modal({
    title: 'Guía rápida de SENAVENTAS', wide: true,
    body: `<div class="grid g2"><div class="stack"><ol class="steps-list small">
      <li><b>Identidad:</b> nombre, lema, color, contacto y ficha del aprendiz (Configuración → Identidad).</li>
      <li><b>Tema:</b> activa una de las 5 plantillas. Puedes cargar su contenido de ejemplo.</li>
      <li><b>Catálogo:</b> crea productos con foto, costo, precio y stock. Importa o exporta CSV.</li>
      <li><b>Prueba:</b> en Mi Tienda en Vivo compra como cliente con la pasarela simulada.</li>
      <li><b>Integra:</b> conecta aplicativos, genera llaves y usa la Consola REST y los webhooks.</li>
      <li><b>Publica:</b> cumple el checklist, publica y descarga el .zip para subirlo a Netlify o GitHub Pages.</li></ol></div>
      <div class="stack small"><div class="card flat"><b>¿Dónde se guarda mi trabajo?</b><p class="muted">En el navegador de este equipo (IndexedDB), con guardado automático. Para cambiar de equipo exporta la sesión (.json) desde Inicio y vuelve a importarla.</p></div>
      <div class="card flat"><b>Atajos</b><p class="muted"><span class="kbd">Ctrl</span> + <span class="kbd">S</span> guardar · <span class="kbd">Esc</span> cerrar paneles</p></div>
      <div class="card flat"><b>Fines educativos</b><p class="muted">SENAVENTAS no procesa pagos, no envía correos y no se conecta a pasarelas reales. Las integraciones responden como un sandbox para aprender el flujo.</p></div></div></div>`
  });
  A['activity'] = () => {
    const old = $('.popover'); if (old) { old.remove(); return; }
    App.ui.unseen = 0; renderChrome();
    const p = document.createElement('div');
    p.className = 'popover';
    p.innerHTML = `<div class="row between" style="margin-bottom:8px"><b>Actividad de la sesión</b><button class="icon-btn" data-a="close-popover">${ic('close', 'sm')}</button></div><div class="act-list">${App.s.activity.slice(0, 40).map((a) => `<div>${ic('bolt', 'sm ok-t')}<span>${esc(a.text)}<small>${esc(U.timeAgo(a.at))}</small></span></div>`).join('') || '<p class="muted small">Sin actividad.</p>'}</div>`;
    document.body.appendChild(p);
  };
  A['close-popover'] = () => { const p = $('.popover'); if (p) p.remove(); };
  A['edit-owner'] = () => go('configuracion', 'identidad');
  A['copy'] = async (el) => {
    try { await navigator.clipboard.writeText(el.dataset.text); toast('Copiado al portapapeles', 'ok', 'content_copy'); }
    catch (e) { toast('No se pudo copiar automáticamente', 'err'); }
  };

  /* Sesiones */
  A['new-session'] = () => newSessionModal();
  A['import-session'] = () => pickFile('.json,application/json', importFile);
  A['open-session'] = (el) => openSession(el.dataset.id);
  A['dup-session'] = async (el) => {
    const src = el.dataset.id === App.s.id ? App.s : await SV.storage.get(el.dataset.id);
    const copy = U.clone(src);
    copy.id = U.uid('ses_'); copy.name = src.name + ' (copia)'; copy.createdAt = copy.updatedAt = Date.now();
    await SV.storage.put(copy);
    await refreshSessions(); render();
    toast('Sesión duplicada');
  };
  A['export-session'] = async (el) => {
    const src = el.dataset.id === App.s.id ? App.s : await SV.storage.get(el.dataset.id);
    U.download(U.slug(src.name) + '.senaventas.json', JSON.stringify(sessionExport(src, false), null, 2), 'application/json');
    toast('Respaldo descargado');
  };
  A['export-template'] = () => { U.download(U.slug(App.s.name) + '-plantilla.senaventas.json', JSON.stringify(sessionExport(App.s, true), null, 2), 'application/json'); toast('Plantilla de clase descargada'); };
  A['del-session'] = async (el) => {
    const id = el.dataset.id;
    const info = App.sessions.find((x) => x.id === id);
    if (!(await App.confirm('Eliminar sesión', `Se eliminará <b>${esc(info ? info.name : '')}</b> de este navegador. Esta acción no se puede deshacer. Te recomendamos exportar un respaldo antes.`, { ok: 'Eliminar', danger: true }))) return;
    await SV.storage.remove(id);
    await refreshSessions();
    if (id === App.s.id) {
      if (App.sessions.length) await openSession(App.sessions[0].id);
      else { await createSession('minimal'); render(); }
    } else render();
    toast('Sesión eliminada');
  };
  A['rename-session'] = () => {
    const root = App.modal({ title: 'Renombrar sesión', body: `<input class="input" id="ren" value="${esc(App.s.name)}" maxlength="80">`, foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-primary" data-role="ok">Guardar</button>` });
    root.querySelector('[data-role=ok]').addEventListener('click', async () => {
      const v = root.querySelector('#ren').value.trim(); if (!v) return;
      App.s.name = v; App.s.nameTouched = true; App.closeOverlay(); App.commit('Sesión renombrada a ' + v); await saveNow(); await refreshSessions(); render();
    });
  };

  /* Configuración */
  A['cfg-tab'] = (el) => { App.ui.cfgTab = el.dataset.tab; render(); };
  A['personalize'] = () => { App.s.progress.themeChosen = true; App.ui.cfgTab = 'identidad'; App.commit('Tema personalizado', { render: true }); };
  A['preview-theme'] = (el) => {
    const t = SV.THEMES.find((x) => x.id === el.dataset.id);
    const demo = el.dataset.id === App.s.store.themeId ? App.s : Object.assign(SV.newSession(t.id, App.s.owner), { plugins: App.s.plugins });
    const root = App.modal({ title: 'Demo del tema: ' + esc(t.name), sub: esc(t.description), wide: true, body: `<div class="frame-wrap" style="max-width:100%"><div class="frame-chrome"><i></i><i></i><i></i><div class="url">${ic('lock', 'sm')} demo-${esc(t.id)}.senaventas.edu.co</div></div><iframe class="store-frame" style="height:66vh" sandbox="allow-scripts allow-modals allow-popups" title="Demo"></iframe></div>`, foot: el.dataset.id === App.s.store.themeId ? '' : `<button class="btn btn-soft" data-a="close-overlay">Cerrar</button><button class="btn btn-primary" data-a="activate-theme" data-id="${t.id}">${ic('check')} Activar esta plantilla</button>` });
    root.querySelector('iframe').srcdoc = SV.renderStore(demo, { mode: 'demo' });
  };
  A['activate-theme'] = (el) => {
    const id = el.dataset.id;
    const t = SV.THEMES.find((x) => x.id === id);
    App.closeOverlay(true);
    const root = App.modal({
      title: 'Activar ' + esc(t.name),
      body: `<p>¿Cómo quieres aplicar la plantilla?</p>
        <button class="card flat row" style="text-align:left;flex-wrap:nowrap" data-role="design">${ic('brush', 'lg ok-t')}<div><b>Solo el diseño</b><div class="small muted">Conserva tus productos, textos, pedidos e integraciones. Cambia colores, tipografía y distribución.</div></div></button>
        <button class="card flat row" style="text-align:left;flex-wrap:nowrap" data-role="full">${ic('auto_awesome', 'lg ok-t')}<div><b>Diseño + contenido de ejemplo</b><div class="small muted">Reemplaza textos, categorías, productos y cupones por el preset "${esc(t.name)}". Tus pedidos, llaves e integraciones se conservan.</div></div></button>`
    });
    const apply = (full) => {
      const s = App.s;
      s.store.themeId = id;
      s.store.brandColor = '';
      if (full) {
        const pre = U.clone(SV.PRESETS[id]);
        Object.assign(s.store, pre.store);
        s.categories = pre.categories; s.products = pre.products; s.coupons = pre.coupons;
        s.store.seo = { title: pre.store.name + ' | Tienda virtual', description: pre.store.slogan, keywords: pre.categories.join(', ') };
        App.ui.sel = new Set();
      }
      s.progress.themeChosen = true;
      App.closeOverlay();
      App.commit('Tema activado: ' + t.name + (full ? ' (con contenido de ejemplo)' : ''), { render: true });
      toast('Plantilla ' + t.name + ' activada');
    };
    root.querySelector('[data-role=design]').addEventListener('click', () => apply(false));
    root.querySelector('[data-role=full]').addEventListener('click', () => apply(true));
  };
  A['toggle-plugin'] = (el) => {
    const id = el.dataset.id;
    App.s.plugins[id] = !App.s.plugins[id];
    const p = SV.PLUGINS.find((x) => x.id === id);
    App.commit('Plugin ' + (App.s.plugins[id] ? 'activado' : 'desactivado') + ': ' + p.name, { render: true });
    toast(p.name + (App.s.plugins[id] ? ' activado' : ' desactivado'), 'ok', 'extension');
  };
  A['brand-color'] = (el) => { App.s.store.brandColor = el.dataset.hex; App.commit('Color de marca actualizado', { render: true }); };
  A['set-icon'] = (el) => { App.s.store.icon = el.dataset.icon; App.commit(null, { render: true }); };
  A['reset-identity'] = async () => {
    if (!(await App.confirm('Restablecer textos', 'Se restauran nombre, lema y textos de la página según el preset del tema activo. Productos y pedidos no cambian.'))) return;
    const pre = U.clone(SV.PRESETS[App.s.store.themeId]);
    Object.assign(App.s.store, pre.store);
    App.commit('Textos restablecidos al preset', { render: true });
  };
  A['toggle-section'] = (el) => { const k = el.dataset.id; App.s.store.sections[k] = App.s.store.sections[k] === false; App.commit('Sección ' + k + (App.s.store.sections[k] ? ' visible' : ' oculta'), { render: true }); };
  A['toggle-promo'] = () => { App.s.store.promo.enabled = !App.s.store.promo.enabled; App.commit('Promoción ' + (App.s.store.promo.enabled ? 'activada' : 'desactivada'), { render: true }); };
  A['del-cat'] = async (el) => {
    const s = App.s; const i = +el.dataset.i; const c = s.categories[i];
    if (s.categories.length <= 1) { toast('Debe existir al menos una categoría', 'err'); return; }
    const n = s.products.filter((p) => p.category === c).length;
    const target = s.categories.find((x) => x !== c);
    if (!(await App.confirm('Eliminar categoría', n ? `La categoría <b>${esc(c)}</b> tiene ${n} producto(s). Se moverán a <b>${esc(target)}</b>.` : `¿Eliminar la categoría <b>${esc(c)}</b>?`, { ok: 'Eliminar', danger: true }))) return;
    s.products.forEach((p) => { if (p.category === c) p.category = target; });
    s.categories.splice(i, 1);
    App.commit('Categoría eliminada: ' + c, { render: true });
  };
  A['toggle-coupon'] = (el) => { const c = App.s.coupons[+el.dataset.i]; c.active = !c.active; App.commit('Cupón ' + c.code + (c.active ? ' activado' : ' desactivado'), { render: true }); };
  A['del-coupon'] = (el) => { const c = App.s.coupons.splice(+el.dataset.i, 1)[0]; App.commit('Cupón eliminado: ' + c.code, { render: true }); };
  A['open-store-tab'] = () => openBlob(SV.renderStore(App.s, { mode: 'export' }));

  /* Imágenes */
  A['pick-image'] = (el, e) => {
    if (e.target.closest('button') && e.target.closest('button') !== el) return;
    const target = el.dataset.target;
    pickFile('image/*', (file) => handleImage(file, target));
  };
  const handleImage = async (file, target) => {
    try {
      const data = await U.compressImage(file);
      if (target === 'hero') { App.s.store.heroImage = data; App.commit('Imagen de portada actualizada', { render: true }); }
      else if (App.ui.draft) { App.ui.draft.image = data; refreshPartials(); }
      toast('Imagen optimizada (' + Math.round(data.length * 0.75 / 1024) + ' KB)', 'ok', 'image');
    } catch (err) { toast(err.message, 'err'); }
  };
  A['clear-draft-img'] = (el, e) => { e.stopPropagation(); App.ui.draft.image = ''; const u = $('[data-draft=image]'); if (u) u.value = ''; refreshPartials(); };

  /* Productos */
  A['new-product'] = () => openProduct(null);
  A['edit-product'] = (el) => openProduct(App.s.products.find((p) => p.id === el.dataset.id));
  A['save-product'] = () => saveProduct();
  A['apply-suggested'] = (el) => { App.ui.draft.price = +el.dataset.v; const i = $('[data-draft=price]'); if (i) i.value = el.dataset.v; refreshPartials(); };
  A['dup-product'] = (el) => {
    const s = App.s; const p = s.products.find((x) => x.id === el.dataset.id);
    const c = U.clone(p); c.id = U.uid('p'); c.name = p.name + ' (copia)'; c.status = 'borrador'; c.sold = 0;
    let n = 2; let sku = p.sku + '-C'; while (s.products.some((x) => x.sku === sku)) sku = p.sku + '-C' + n++;
    c.sku = sku.slice(0, 20);
    s.products.splice(s.products.indexOf(p) + 1, 0, c);
    emit('product.created', { id: c.id, sku: c.sku, name: c.name });
    App.commit('Producto duplicado: ' + c.name, { render: true });
  };
  A['del-product'] = async (el) => {
    const s = App.s; const p = s.products.find((x) => x.id === el.dataset.id);
    if (!(await App.confirm('Eliminar producto', `¿Eliminar <b>${esc(p.name)}</b> del catálogo? Los pedidos anteriores conservan su registro.`, { ok: 'Eliminar', danger: true }))) return;
    s.products = s.products.filter((x) => x.id !== p.id);
    App.ui.sel.delete(p.id);
    emit('product.deleted', { id: p.id, sku: p.sku });
    App.commit('Producto eliminado: ' + p.name, { render: true });
  };
  A['toggle-status'] = (el) => {
    const p = App.s.products.find((x) => x.id === el.dataset.id);
    p.status = p.status === 'publicado' ? 'borrador' : 'publicado';
    emit('product.updated', { id: p.id, sku: p.sku, status: p.status });
    App.commit(p.name + ' → ' + p.status);
  };
  A['stock'] = (el) => {
    const p = App.s.products.find((x) => x.id === el.dataset.id);
    const before = Number(p.stock);
    p.stock = Math.max(0, before + Number(el.dataset.d));
    if (p.stock === before) return;
    emit('product.updated', { id: p.id, sku: p.sku, stock_before: before, stock: p.stock });
    if (p.stock <= Number(p.minStock) && before > Number(p.minStock)) emit('stock.low', { id: p.id, sku: p.sku, name: p.name, stock: p.stock, min_stock: p.minStock });
    App.commit(null);
  };
  A['sel'] = (el) => { const id = el.dataset.id; if (el.checked) App.ui.sel.add(id); else App.ui.sel.delete(id); refreshPartials(); };
  A['sel-all'] = (el) => {
    const list = filteredProducts(App.s); const per = App.ui.prodPer; const page = App.ui.prodPage;
    list.slice((page - 1) * per, page * per).forEach((p) => { if (el.checked) App.ui.sel.add(p.id); else App.ui.sel.delete(p.id); });
    refreshPartials();
  };
  A['bulk'] = async (el) => {
    const s = App.s; const op = el.dataset.op; const ids = Array.from(App.ui.sel);
    if (op === 'clear') { App.ui.sel.clear(); refreshPartials(); return; }
    if (op === 'delete') {
      if (!(await App.confirm('Eliminar productos', `¿Eliminar ${ids.length} producto(s) seleccionados?`, { ok: 'Eliminar', danger: true }))) return;
      s.products = s.products.filter((p) => !App.ui.sel.has(p.id));
      ids.forEach((id) => emit('product.deleted', { id }));
    } else s.products.forEach((p) => { if (App.ui.sel.has(p.id)) p.status = op; });
    App.ui.sel.clear();
    App.commit(ids.length + ' producto(s): ' + (op === 'delete' ? 'eliminados' : 'marcados como ' + op), { render: true });
  };
  A['page'] = (el) => { App.ui.prodPage = +el.dataset.p; refreshPartials(); };
  A['filter-low'] = () => { App.ui.prodStatus = 'bajo'; App.ui.prodPage = 1; render(); };
  A['kardex'] = () => {
    const s = App.s;
    const rows = [['SKU', 'Producto', 'Categoría', 'Estado', 'Precio venta', 'Costo unitario', 'Margen %', 'Stock', 'Stock mínimo', 'Valor inventario (costo)', 'Valor inventario (venta)', 'Unidades vendidas', 'Alerta']]
      .concat(s.products.map((p) => [p.sku, p.name, p.category, p.status, p.price, p.cost, U.margin(p.price, p.cost).toFixed(1), p.stock, p.minStock, p.cost * p.stock, p.price * p.stock, p.sold || 0, Number(p.stock) <= 0 ? 'AGOTADO' : Number(p.stock) <= Number(p.minStock) ? 'REABASTECER' : 'OK']));
    U.download('kardex-' + U.slug(s.store.name) + '.csv', '﻿' + U.toCSV(rows), 'text/csv');
    toast('Planilla Kardex descargada (abre con Excel o Google Sheets)', 'ok', 'table_chart');
  };
  A['import-csv'] = () => {
    const root = App.modal({
      title: 'Importar productos desde CSV', sub: 'Separador punto y coma (;) o coma (,). La primera fila debe tener los encabezados.',
      body: `<pre class="code">sku;nombre;categoria;precio;costo;stock;stock_minimo;estado;imagen_url;descripcion
CAF-010;Café Tostado 250g;Cafés &amp; Bebidas;18000;9500;30;5;publicado;https://...;Notas a chocolate</pre>
        <p class="small muted">Si el SKU ya existe, el producto se actualiza. Las categorías nuevas se crean automáticamente. Estados válidos: publicado, borrador.</p>`,
      foot: `<button class="btn btn-soft" data-a="csv-template">${ic('download')} Descargar plantilla</button><button class="btn btn-primary" data-role="pick">${ic('upload_file')} Elegir archivo CSV</button>`
    });
    root.querySelector('[data-role=pick]').addEventListener('click', () => pickFile('.csv,text/csv', async (file) => {
      try {
        const rows = U.parseCSV(await U.readFile(file, 'text'));
        const head = rows.shift().map((h) => U.slug(h).replace(/-/g, '_'));
        const col = (r, ...names) => { for (const n of names) { const i = head.indexOf(n); if (i >= 0) return (r[i] || '').trim(); } return ''; };
        let created = 0, updated = 0, skipped = 0;
        const s = App.s;
        rows.forEach((r) => {
          const name = col(r, 'nombre', 'name', 'producto');
          const price = Number(String(col(r, 'precio', 'price', 'precio_venta')).replace(/[^\d.]/g, ''));
          if (!name || !(price > 0)) { skipped++; return; }
          let sku = col(r, 'sku', 'referencia').toUpperCase().replace(/[^A-Z0-9\-_]/g, '').slice(0, 20) || ('IMP-' + Math.random().toString(36).slice(2, 6).toUpperCase());
          const cat = col(r, 'categoria', 'category') || s.categories[0];
          if (!s.categories.includes(cat)) s.categories.push(cat);
          const data = { name, sku, category: cat, price, cost: Number(String(col(r, 'costo', 'cost')).replace(/[^\d.]/g, '')) || 0, stock: parseInt(col(r, 'stock', 'cantidad'), 10) || 0, minStock: parseInt(col(r, 'stock_minimo', 'min_stock'), 10) || 5, status: col(r, 'estado', 'status') === 'borrador' ? 'borrador' : 'publicado', description: col(r, 'descripcion', 'description') };
          const img = col(r, 'imagen_url', 'imagen', 'image');
          if (/^https?:\/\//.test(img)) data.image = img;
          const ex = s.products.find((p) => p.sku.toUpperCase() === sku);
          if (ex) { Object.assign(ex, data); updated++; }
          else { s.products.push(Object.assign({ id: U.uid('p'), image: '', compareAt: 0, rating: 4.5, reviews: 0, sold: 0, moq: 1, badge: '', origin: '' }, data)); created++; }
        });
        App.closeOverlay();
        App.commit(`CSV importado: ${created} creados, ${updated} actualizados, ${skipped} omitidos`, { render: true });
        toast(`${created} creados · ${updated} actualizados · ${skipped} omitidos`, 'ok', 'upload_file');
      } catch (e) { toast('CSV inválido: ' + e.message, 'err'); }
    }));
  };
  A['csv-template'] = () => {
    const s = App.s;
    const rows = [['sku', 'nombre', 'categoria', 'precio', 'costo', 'stock', 'stock_minimo', 'estado', 'imagen_url', 'descripcion']].concat(s.products.slice(0, 3).map((p) => [p.sku, p.name, p.category, p.price, p.cost, p.stock, p.minStock, p.status, p.image && !p.image.startsWith('data:') ? p.image : '', p.description]));
    U.download('plantilla-productos.csv', '﻿' + U.toCSV(rows), 'text/csv');
  };
  A['costing-guide'] = () => App.modal({
    title: 'Guía de costeo para e-commerce', wide: true,
    body: `<div class="grid g2"><div class="stack small">
      <p><b>1. Costo unitario</b> = materia prima + mano de obra directa + empaque + costos indirectos asignados.</p>
      <p><b>2. Margen bruto %</b> = (Precio − Costo) ÷ Precio × 100.</p>
      <p><b>3. Precio a partir de un margen objetivo</b> = Costo ÷ (1 − margen). Ejemplo: costo $16.000 y margen 40% → 16.000 ÷ 0,60 = <b>$26.667</b>.</p>
      <p><b>4. Markup</b> = (Precio − Costo) ÷ Costo. No lo confundas con el margen.</p>
      <p><b>5. Valor del inventario</b> = Σ (costo × stock). Es dinero inmovilizado que afecta el flujo de caja.</p></div>
      <div class="stack small"><div class="card flat"><b>Márgenes de referencia (didácticos)</b><p class="muted">Alimentos de origen 35% a 50% · Artesanías 35% a 45% · Cosmética natural 60% a 70% · Joyería 65% a 78% · Mayorista B2B 15% a 30%.</p></div>
      <div class="card flat"><b>No olvides</b><p class="muted">Comisión de la pasarela (2,5% a 3,5% + IVA), costo de envío no cobrado, devoluciones y pauta digital (CAC).</p></div></div></div>`
  });

  /* Pedidos */
  A['order-filter'] = (el) => { App.ui.orderStatus = el.dataset.v; render(); };
  A['view-order'] = (el, e) => { e.preventDefault(); openOrder(el.dataset.id); };
  A['order-status'] = (el) => {
    const s = App.s; const o = s.orders.find((x) => x.id === el.dataset.id); const st = el.dataset.st;
    const before = o.status;
    if (before === st) return;
    if (before === 'cancelado') {
      const lack = o.items.filter((it) => !it.bundleHeader).find((it) => { const p = s.products.find((x) => x.id === it.id); return p && Number(p.stock) < it.qty; });
      if (lack) { toast('No hay stock para reactivar: ' + lack.name, 'err'); return; }
    }
    SV.commerce.setOrderStatus(s, o, st);
    emit('order.updated', { id: o.id, status_before: before, status: st });
    App.closeOverlay();
    App.commit('Pedido ' + o.id + ': ' + before + ' → ' + st, { render: true });
    openOrder(o.id);
  };
  A['order-receipt'] = (el) => {
    const s = App.s; const o = s.orders.find((x) => x.id === el.dataset.id);
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Comprobante ${esc(o.id)}</title><style>body{font-family:Arial,sans-serif;max-width:720px;margin:30px auto;color:#0b1c30;padding:0 16px}h1{color:#005f2e;margin:0}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{padding:8px;border-bottom:1px solid #e5eeff;text-align:left}.r{text-align:right}.muted{color:#3f493f;font-size:13px}.box{background:#eff4ff;padding:12px;border-radius:8px}</style></head><body><h1>${esc(s.store.name)}</h1><p class="muted">Comprobante de pedido simulado · Documento educativo sin validez comercial ni tributaria</p><div class="box"><b>Pedido:</b> ${esc(o.id)} · <b>Fecha:</b> ${esc(U.fmtDate(o.date))} · <b>Estado:</b> ${esc(o.status)}<br><b>Cliente:</b> ${esc(o.customer.name)} · ${esc(o.customer.email || '')} · ${esc(o.customer.city || '')}, ${esc(o.customer.dep || '')}</div><table><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th></tr>${o.items.filter((i) => !i.bundle).map((i) => `<tr><td>${esc(i.name)}</td><td class="r">${i.qty}</td><td class="r">${money(i.price)}</td><td class="r">${money(i.price * i.qty)}</td></tr>`).join('')}<tr><td colspan="3" class="r">Subtotal</td><td class="r">${money(o.subtotal)}</td></tr>${o.discount ? `<tr><td colspan="3" class="r">Descuento</td><td class="r">−${money(o.discount)}</td></tr>` : ''}<tr><td colspan="3" class="r">Envío</td><td class="r">${money(o.shipping)}</td></tr><tr><th colspan="3" class="r">Total</th><th class="r">${money(o.total)}</th></tr></table><p class="muted">Pago: ${esc(o.payment.method)} ${esc(o.payment.ref || '')} (${esc(o.payment.status)}). ${esc(s.owner.name)} · Ficha ${esc(s.owner.ficha)} · SENAVENTAS.</p><script>window.print()<\/script></body></html>`;
    openBlob(html);
  };
  A['export-orders'] = () => {
    const s = App.s;
    const rows = [['Pedido', 'Fecha', 'Estado', 'Cliente', 'Correo', 'Departamento', 'Ciudad', 'Método de pago', 'Estado pago', 'Subtotal', 'Descuento', 'Envío', 'Total', 'Costo mercancía', 'Utilidad bruta', 'Canal', 'Productos']]
      .concat(s.orders.map((o) => { const c = SV.commerce.orderCost(o); return [o.id, new Date(o.date).toLocaleString('es-CO'), o.status, o.customer.name, o.customer.email, o.customer.dep, o.customer.city, o.payment.method, o.payment.status, o.subtotal, o.discount, o.shipping, o.total, c, o.total - o.shipping - c, o.channel, o.items.filter((i) => !i.bundle).map((i) => i.qty + 'x ' + i.sku).join(' | ')]; }));
    U.download('pedidos-' + U.slug(s.store.name) + '.csv', '﻿' + U.toCSV(rows), 'text/csv');
  };
  A['clear-orders'] = async () => {
    if (!(await App.confirm('Borrar pedidos', 'Se eliminan todos los pedidos de prueba de esta sesión. El inventario <b>no</b> se restaura automáticamente. Usa "Cancelar" en cada pedido si quieres devolver las unidades.', { ok: 'Borrar todo', danger: true }))) return;
    App.s.orders = [];
    App.commit('Pedidos de prueba eliminados', { render: true });
  };

  /* Tienda en vivo */
  A['device'] = (el) => { App.ui.device = el.dataset.d; $$('.seg button[data-a=device]').forEach((b) => b.classList.toggle('on', b === el)); const w = $('#frame-wrap'); if (w) w.style.maxWidth = { mobile: '400px', tablet: '820px', desktop: '100%' }[el.dataset.d]; };
  A['reload-preview'] = () => { const f = $('#store-frame'); if (f) f.srcdoc = SV.renderStore(App.s, { mode: 'preview' }); toast('Vista previa actualizada', 'ok', 'refresh'); };
  A['reset-analytics'] = () => { App.s.analytics = {}; App.ui.liveEvents = []; App.commit('Analítica reiniciada'); };

  /* Integraciones */
  A['api-tab'] = (el) => { App.ui.apiTab = el.dataset.tab; render(); };
  A['connect-integ'] = (el) => {
    const it = SV.INTEGRATIONS.find((x) => x.id === el.dataset.id);
    const root = App.modal({
      title: 'Conectar ' + esc(it.name), sub: 'Modo sandbox: las credenciales se validan por formato y nunca salen de este navegador.',
      body: `<form class="stack" id="integ-form">${it.fields.map((f) => field(esc(f.label), `<input class="input mono" name="${f.key}" placeholder="${esc(f.placeholder)}" autocomplete="off">`, 'Formato: ' + esc(f.placeholder))).join('')}
        <button type="button" class="btn btn-ghost btn-sm" style="align-self:flex-start" data-role="fill">${ic('auto_fix_high', 'sm')} Autocompletar credenciales de prueba</button>
        <div class="small" id="integ-msg"></div></form>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-primary" type="submit" form="integ-form">${ic('link')} Probar conexión</button>`
    });
    const sample = { publicKey: U.randomKey('pub_test_', 16), eventsSecret: U.randomKey('test_events_', 10), accessToken: 'TEST-' + Math.floor(1e15 + Math.random() * 9e15) + '-' + Math.floor(1e5 + Math.random() * 9e5) + '-abcd', username: 'api@' + U.slug(App.s.store.name).slice(0, 12) + '.co', accessKey: U.randomKey('', 24), email: 'contabilidad@' + U.slug(App.s.store.name).slice(0, 12) + '.co', token: it.id === 'whatsappapi' ? U.randomKey('EAAG', 20) : U.randomKey('', 20), sheetId: U.randomKey('1', 32), pixelId: String(Math.floor(1e14 + Math.random() * 9e14)), catalogId: String(Math.floor(1e14 + Math.random() * 9e14)), pixelCode: 'C' + U.randomKey('', 19).toUpperCase().replace(/[^A-Z0-9]/g, 'X'), phoneId: String(Math.floor(1e14 + Math.random() * 9e14)), client: String(Math.floor(1e6 + Math.random() * 9e6)), apiKey: it.id === 'mailchimp' ? Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('') + '-us21' : 'SRV-' + U.randomKey('', 4).toUpperCase().replace(/[^A-Z0-9]/g, '7') + '-' + U.randomKey('', 4).toUpperCase().replace(/[^A-Z0-9]/g, '3'), measurementId: 'G-' + U.randomKey('', 10).toUpperCase().replace(/[^A-Z0-9]/g, 'Q') };
    root.querySelector('[data-role=fill]').addEventListener('click', () => { it.fields.forEach((f) => { root.querySelector(`[name="${f.key}"]`).value = sample[f.key] || ''; }); });
    root.querySelector('#integ-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const values = {}; it.fields.forEach((f) => { values[f.key] = e.target[f.key].value.trim(); });
      const msg = root.querySelector('#integ-msg');
      msg.innerHTML = `<span class="muted">${ic('progress_activity', 'sm')} Verificando credenciales con ${esc(it.name)}...</span>`;
      const r = await SV.integrationsSim.connect(App.s, it.id, values);
      if (!r.ok) { msg.innerHTML = `<span class="err-t">${ic('error', 'sm')} ${esc(r.message)}</span>`; return; }
      App.closeOverlay();
      App.commit('Integración conectada: ' + it.name, { render: true });
      toast(r.message, 'ok', 'link');
    });
  };
  A['disconnect-integ'] = async (el) => {
    const it = SV.INTEGRATIONS.find((x) => x.id === el.dataset.id);
    if (!(await App.confirm('Desconectar', '¿Desconectar ' + esc(it.name) + '? Se borran las credenciales de prueba.'))) return;
    delete App.s.integrations[it.id];
    App.commit('Integración desconectada: ' + it.name, { render: true });
  };
  A['run-integ'] = async (el) => {
    const id = el.dataset.id; const act = el.dataset.act;
    const it = SV.INTEGRATIONS.find((x) => x.id === id);
    App.ui.busy[id] = act; render();
    const r = await SV.integrationsSim.run(App.s, id, act);
    App.ui.busy[id] = null;
    App.commit(it.name + ': ' + ((it.actions.find((a) => a.id === act) || {}).label || act), { render: App.route === 'api' });
    App.modal({ title: esc(it.name), sub: esc((it.actions.find((a) => a.id === act) || {}).label), body: `<div class="log" style="max-height:none">${r.lines.map((l) => `<div>${ic(l.ok ? 'check_circle' : 'error', l.ok ? 'ok-t' : 'err-t')}<span>${esc(l.text)}</span></div>`).join('')}</div><p class="tiny muted">Respuesta simulada con los datos reales de tu tienda. En producción, esta llamada viajaría por HTTPS al servidor del aplicativo.</p>` });
  };

  /* Llaves */
  A['new-key'] = () => {
    const root = App.modal({
      title: 'Generar llave de API',
      body: `<form class="stack" id="key-form">${field('Nombre de la llave', '<input class="input" name="label" required value="Integración ERP" maxlength="40">')}${field('Permisos', `<select class="select" name="scope">${opts([['write', 'Lectura y escritura (write)'], ['read', 'Solo lectura (read)']], 'write')}</select>`)}</form>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-primary" type="submit" form="key-form">${ic('key')} Generar</button>`
    });
    root.querySelector('#key-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const k = { key: U.randomKey('sk_test_', 28), label: e.target.label.value.trim(), scope: e.target.scope.value, created: Date.now(), show: true };
      App.s.apiKeys.unshift(k);
      App.ui.con.token = k.key;
      App.closeOverlay();
      App.commit('Llave de API generada: ' + k.label, { render: true });
      toast('Llave generada. Cópiala y guárdala en un lugar seguro.', 'ok', 'key');
    });
  };
  A['key-show'] = (el) => { const k = App.s.apiKeys[+el.dataset.i]; k.show = !k.show; App.commit(null, { render: true }); };
  A['revoke-key'] = async (el) => {
    const k = App.s.apiKeys[+el.dataset.i];
    if (!(await App.confirm('Revocar llave', 'Las aplicaciones que usen <b>' + esc(k.label) + '</b> recibirán 401.', { ok: 'Revocar', danger: true }))) return;
    k.revoked = true; k.show = false;
    if (App.ui.con.token === k.key) App.ui.con.token = '';
    App.commit('Llave revocada: ' + k.label, { render: true });
  };
  A['use-key'] = (el) => { App.ui.con.token = App.s.apiKeys[+el.dataset.i].key; App.ui.apiTab = 'console'; render(); };

  /* Consola */
  A['con-pick'] = (el) => {
    const c = App.ui.con;
    c.method = el.dataset.m; c.path = SV.api.BASE + el.dataset.p;
    const ex = SV.api.examples[el.dataset.ex];
    if (ex) { const b = U.clone(ex); if ('category' in b && b.category === null) b.category = App.s.categories[0]; if (b.items && App.s.products[0]) b.items[0].sku = (App.s.products.find((p) => p.status === 'publicado' && p.stock > 0) || App.s.products[0]).sku; c.body = JSON.stringify(b, null, 2); }
    else c.body = '';
    render();
  };
  A['con-lang'] = (el) => { App.ui.con.lang = el.dataset.l; refreshPartials(); };
  A['con-send'] = async () => {
    const c = App.ui.con;
    c.busy = true; refreshPartials();
    const r = await SV.api.request({ session: App.s, commit: (msg) => App.commit(msg), emit }, { method: c.method, path: c.path, body: c.body, token: c.token });
    c.busy = false; c.resp = r;
    App.commit(null);
    if (App.route === 'api' && App.ui.apiTab === 'console') {
      render();
      const r = $('[data-partial="conresp"]');
      if (r && window.innerWidth < 1100) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* Webhooks */
  A['toggle-webhook'] = (el) => { const w = App.s.webhooks[+el.dataset.i]; w.active = !w.active; App.commit('Webhook ' + (w.active ? 'activado' : 'pausado'), { render: true }); };
  A['del-webhook'] = (el) => { const w = App.s.webhooks.splice(+el.dataset.i, 1)[0]; App.commit('Webhook eliminado: ' + w.url, { render: true }); };
  A['test-webhook'] = (el) => {
    const w = App.s.webhooks[+el.dataset.i];
    const ev = w.event === '*' ? 'order.created' : w.event;
    const was = w.active; w.active = true;
    const only = App.s.webhooks.filter((x) => x !== w).map((x) => [x, x.active]);
    only.forEach(([x]) => { x.active = false; });
    SV.webhooks.dispatch(App.s, ev, { test: true, message: 'Evento de prueba desde SENAVENTAS', store: App.s.store.name }, () => { App.commit(null); if (App.route === 'api') render(); });
    only.forEach(([x, a]) => { x.active = a; });
    w.active = was;
    App.commit('Prueba de webhook ' + ev, { render: true });
  };
  A['view-delivery'] = (el) => {
    const d = App.s.webhookLog.find((x) => x.id === el.dataset.id); if (!d) return;
    let pretty = d.payload; try { pretty = JSON.stringify(JSON.parse(d.payload), null, 2); } catch (e) { /* texto plano */ }
    App.modal({ title: 'Entrega ' + esc(d.event), sub: esc(d.url), wide: true, body: `<div class="row"><span class="status-pill st-${String(d.code)[0]}">${d.code == null ? '…' : d.code}</span><span class="small muted">${d.ms || 0} ms · intento ${d.attempts}${d.real ? ' · envío real' : ' · simulado'}</span></div><p class="small">${esc(d.note || '')}</p><div class="lbl">Encabezados</div><pre class="code">POST ${esc(d.url)}\nContent-Type: application/json\nX-Senaventas-Event: ${esc(d.event)}\nX-Senaventas-Signature: ${esc(d.signature)}</pre><div class="lbl">Cuerpo</div><pre class="code">${hl(pretty)}</pre>` });
  };
  A['clear-deliveries'] = () => { App.s.webhookLog = []; App.commit(null, { render: true }); };

  /* Publicación */
  A['publish'] = () => {
    const s = App.s;
    const list = checklist(s);
    if (!list.filter((c) => c.req).every((c) => c.ok)) { toast('Completa los criterios obligatorios', 'err'); return; }
    const version = s.published ? s.published.version + 1 : 1;
    s.published = { at: Date.now(), version, url: 'https://' + s.store.subdomain + '.senaventas.edu.co' };
    s.publishHistory = [{ at: Date.now(), version, products: s.products.filter((p) => p.status === 'publicado').length, score: scoreOf(list) }].concat(s.publishHistory || []).slice(0, 20);
    emit('store.published', { version, url: s.published.url, products: s.products.filter((p) => p.status === 'publicado').length });
    App.commit('Tienda publicada · versión ' + version, { render: true });
    App.modal({
      title: '¡Tienda publicada! v' + version,
      body: `<div class="empty" style="padding:10px">${ic('celebration', 'ok-t')}<p>Tu tienda <b>${esc(s.store.name)}</b> quedó lista en el sandbox SENA.</p><code class="ok-t">${esc(s.published.url)}</code></div><p class="small muted">Descarga el paquete .zip para subirlo a Netlify Drop, GitHub Pages o cualquier hosting. También puedes abrir el sitio en una pestaña para compartir la demostración.</p>`,
      foot: `<button class="btn btn-soft" data-a="open-published">${ic('open_in_new')} Abrir sitio</button><button class="btn btn-primary" data-a="download-zip">${ic('folder_zip')} Descargar .zip</button>`
    });
  };
  A['unpublish'] = async () => {
    if (!(await App.confirm('Despublicar', 'La tienda vuelve a estado borrador. Los archivos que ya subiste a un hosting no se borran.'))) return;
    App.s.published = null;
    App.commit('Tienda despublicada', { render: true });
  };
  A['open-published'] = () => openBlob(SV.renderStore(App.s, { mode: 'export' }));
  A['download-html'] = () => { U.download('index.html', SV.renderStore(App.s, { mode: 'export' }), 'text/html'); toast('index.html descargado'); };
  A['download-zip'] = () => {
    const blob = U.zip(siteFiles(App.s));
    U.download(U.slug(App.s.store.name) + '-sitio.zip', blob);
    toast('Paquete del sitio descargado (' + Math.round(blob.size / 1024) + ' KB)', 'ok', 'folder_zip');
  };
  A['report'] = () => {
    const s = App.s; const list = checklist(s); const st = SV.commerce.stats(s);
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe de evidencia · ${esc(s.store.name)}</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:30px auto;color:#0b1c30;padding:0 16px;font-size:14px}h1{color:#005f2e;margin-bottom:0}h2{color:#005f2e;font-size:17px;margin-top:26px;border-bottom:2px solid #adedd3;padding-bottom:4px}table{width:100%;border-collapse:collapse}td,th{padding:7px;border-bottom:1px solid #e5eeff;text-align:left;font-size:13px}.ok{color:#005f2e;font-weight:bold}.no{color:#ba1a1a;font-weight:bold}.muted{color:#3f493f}</style></head><body>
      <h1>Informe de evidencia de producto</h1><p class="muted">SENAVENTAS · Creador de tiendas educativas · ${esc(new Date().toLocaleString('es-CO'))}</p>
      <h2>Datos del responsable</h2><table><tr><th>Nombre</th><td>${esc(s.owner.name)}</td><th>Rol</th><td>${esc(s.owner.role)}</td></tr><tr><th>Ficha</th><td>${esc(s.owner.ficha)}</td><th>Programa</th><td>${esc(s.owner.programa)}</td></tr><tr><th>Centro</th><td>${esc(s.owner.centro)}</td><th>Instructor(a)</th><td>${esc(s.owner.instructor || '')}</td></tr></table>
      <h2>Tienda</h2><table><tr><th>Nombre</th><td>${esc(s.store.name)}</td><th>Tema</th><td>${esc(SV.themeOf(s).name)}</td></tr><tr><th>URL sandbox</th><td colspan="3">https://${esc(s.store.subdomain)}.senaventas.edu.co ${s.published ? '(publicada v' + s.published.version + ')' : '(borrador)'}</td></tr><tr><th>Plugins activos</th><td colspan="3">${SV.PLUGINS.filter((p) => s.plugins[p.id]).map((p) => esc(p.name)).join(', ')}</td></tr><tr><th>Integraciones</th><td colspan="3">${SV.INTEGRATIONS.filter((i) => (s.integrations[i.id] || {}).connected).map((i) => esc(i.name)).join(', ') || 'Ninguna'}</td></tr></table>
      <h2>Checklist de calidad · Puntaje ${scoreOf(list)}%</h2><table>${list.map((c) => `<tr><td class="${c.ok ? 'ok' : 'no'}">${c.ok ? 'Cumple' : 'Pendiente'}</td><td>${esc(c.t)}</td><td>${c.req ? 'Obligatorio' : 'Recomendado'}</td><td class="muted">${esc(c.d)}</td></tr>`).join('')}</table>
      <h2>Catálogo (${s.products.length} productos)</h2><table><tr><th>SKU</th><th>Producto</th><th>Precio</th><th>Costo</th><th>Margen</th><th>Stock</th><th>Estado</th></tr>${s.products.map((p) => `<tr><td>${esc(p.sku)}</td><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${money(p.cost)}</td><td>${U.pct(U.margin(p.price, p.cost))}</td><td>${p.stock}</td><td>${esc(p.status)}</td></tr>`).join('')}</table>
      <h2>Resultados de la simulación</h2><table><tr><th>Pedidos</th><td>${st.orders}</td><th>Ventas</th><td>${money(st.revenue)}</td></tr><tr><th>Ticket promedio</th><td>${money(st.avgTicket)}</td><th>Utilidad bruta</th><td>${money(st.grossProfit)}</td></tr><tr><th>Visitas registradas</th><td>${(s.analytics || {}).page_view || 0}</td><th>Solicitudes API</th><td>${s.apiLog.length}</td></tr></table>
      <p class="muted" style="margin-top:30px">Documento generado automáticamente con fines educativos. Adjúntalo junto con el archivo .senaventas.json como evidencia.</p><script>window.print()<\/script></body></html>`;
    openBlob(html);
  };

  /* ======================================================================
     Enlace de eventos
     ====================================================================== */
  document.addEventListener('click', (e) => {
    const pop = $('.popover');
    if (pop && !e.target.closest('.popover') && !e.target.closest('[data-a=activity]')) pop.remove();
    const el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.a];
    if (!fn) return;
    if (el.tagName === 'A' || el.dataset.a === 'go') e.preventDefault();
    if (el.type === 'checkbox') { fn(el, e); return; }
    fn(el, e);
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.bind) {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (el.dataset.type === 'number') v = el.value === '' ? 0 : Number(el.value);
      if (el.dataset.slug) { v = U.slug(v); }
      setPath(App.s, el.dataset.bind, v);
      if (el.dataset.bind === 'store.name' && !App.s.nameTouched) App.s.name = v || App.s.name;
      App.commit(null);
      return;
    }
    if (el.dataset.draft && App.ui.draft) {
      App.ui.draft[el.dataset.draft] = el.value;
      refreshPartials();
      return;
    }
    const k = el.dataset.aInput;
    if (k === 'prod-q') { App.ui.prodQ = el.value; App.ui.prodPage = 1; refreshPartials(); }
    else if (k === 'con-path') { App.ui.con.path = el.value; refreshPartials(); }
    else if (k === 'con-body') { App.ui.con.body = el.value; refreshPartials(); }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.bind && (el.tagName === 'SELECT' || el.type === 'color')) {
      setPath(App.s, el.dataset.bind, el.value);
      App.commit(null, { render: el.dataset.bind === 'store.brandColor' || el.dataset.bind === 'store.currency' });
      return;
    }
    if (el.dataset.bind && el.dataset.rerender) { App.commit(null, { render: true }); return; }
    if (el.dataset.bind && el.dataset.slug) { el.value = getPath(App.s, el.dataset.bind); return; }
    if (el.dataset.draft && App.ui.draft) {
      App.ui.draft[el.dataset.draft] = el.value;
      if (el.dataset.draft === 'image') refreshPartials();
      if (el.dataset.draft === 'status') { const b = $('[data-a=save-product]'); if (b) b.innerHTML = ic('check') + ' Guardar & ' + (el.value === 'publicado' ? 'publicar' : 'guardar borrador'); }
      return;
    }
    const k = el.dataset.aChange;
    if (!k) return;
    const s = App.s;
    if (k === 'prod-cat') { App.ui.prodCat = el.value; App.ui.prodPage = 1; refreshPartials(); }
    else if (k === 'prod-status') { App.ui.prodStatus = el.value; App.ui.prodPage = 1; refreshPartials(); }
    else if (k === 'per-page') { App.ui.prodPer = +el.value; App.ui.prodPage = 1; refreshPartials(); }
    else if (k === 'con-token') { App.ui.con.token = el.value; refreshPartials(); }
    else if (k === 'con-method') { App.ui.con.method = el.value; render(); }
    else if (k === 'promo-product') {
      const ids = new Set(s.store.promo.productIds || []);
      if (el.checked) ids.add(el.value); else ids.delete(el.value);
      s.store.promo.productIds = Array.from(ids);
      App.commit('Productos del kit actualizados');
    } else if (k === 'rename-cat') {
      const i = +el.dataset.i; const old = s.categories[i]; const v = el.value.trim();
      if (!v || v === old) { el.value = old; return; }
      if (s.categories.includes(v)) { toast('Esa categoría ya existe', 'err'); el.value = old; return; }
      s.categories[i] = v;
      s.products.forEach((p) => { if (p.category === old) p.category = v; });
      App.commit('Categoría renombrada: ' + old + ' → ' + v, { render: true });
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target; const k = f.dataset.form;
    if (!k) return;
    e.preventDefault();
    const s = App.s;
    if (k === 'add-cat') {
      const v = f.name.value.trim();
      if (!v) return;
      if (s.categories.includes(v)) { toast('Esa categoría ya existe', 'err'); return; }
      s.categories.push(v);
      App.commit('Categoría creada: ' + v, { render: true });
    } else if (k === 'add-coupon') {
      const code = f.code.value.trim().toUpperCase();
      if (s.coupons.some((c) => c.code === code)) { toast('El cupón ya existe', 'err'); return; }
      const value = Number(f.value.value);
      if (f.type.value === 'percent' && value > 90) { toast('El porcentaje máximo es 90%', 'err'); return; }
      s.coupons.push({ code, type: f.type.value, value, active: true });
      App.commit('Cupón creado: ' + code, { render: true });
    } else if (k === 'add-webhook') {
      const url = f.url.value.trim();
      if (!/^https?:\/\/[^\s]+$/i.test(url)) { toast('URL inválida', 'err'); return; }
      s.webhooks.push({ id: U.uid('wh_'), url, event: f.event.value, active: true, realSend: f.real.checked, secret: U.randomKey('whsec_', 24), created: Date.now() });
      App.commit('Webhook registrado: ' + url, { render: true });
    }
  });

  /* Arrastrar y soltar imágenes */
  document.addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('over'); } });
  document.addEventListener('dragleave', (e) => { const z = e.target.closest('[data-drop]'); if (z) z.classList.remove('over'); });
  document.addEventListener('drop', (e) => {
    const z = e.target.closest('[data-drop]');
    if (!z) return;
    e.preventDefault(); z.classList.remove('over');
    const f = e.dataTransfer.files[0];
    if (f) handleImage(f, z.dataset.drop);
  });

  /* Imágenes rotas → reemplazo */
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.dataset && t.dataset.ph !== undefined && !t.__ph) { t.__ph = true; t.src = U.placeholder(t.dataset.ph); }
  }, true);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); A['save-now'](); }
    if (e.key === 'Escape') { const p = $('.popover'); if (p) p.remove(); else if (layers.length) App.closeOverlay(); else document.body.classList.remove('side-open'); }
  });

  /* Mensajes de la tienda (iframe de vista previa) */
  window.addEventListener('message', (e) => {
    const m = e.data || {};
    if (m.source !== 'senaventas-store' || !App.s) return;
    const frame = $('#store-frame');
    if (!frame || e.source !== frame.contentWindow) return;
    const s = App.s;
    if (m.type === 'focus') {
      const w = $('#frame-wrap');
      if (w) { const nav = $('#bnav'); const navH = nav && getComputedStyle(nav).display !== 'none' ? nav.offsetHeight : 0; const r = w.getBoundingClientRect(); if (r.bottom > window.innerHeight - navH || r.top < 64) w.scrollIntoView({ behavior: 'smooth', block: 'end' }); }
    } else if (m.type === 'track') {
      s.analytics[m.event] = (s.analytics[m.event] || 0) + 1;
      const p = m.payload || {};
      const prod = p.id ? s.products.find((x) => x.id === p.id) : null;
      App.ui.liveEvents.unshift({ at: Date.now(), event: m.event, detail: prod ? prod.name : p.value ? money(p.value) : '' });
      App.ui.liveEvents = App.ui.liveEvents.slice(0, 60);
      App.commit(null);
    } else if (m.type === 'order') {
      const order = m.order;
      const r = SV.commerce.applyOrder(s, order);
      e.source.postMessage({ source: 'senaventas-app', type: 'order-ack', orderId: order.id, ok: r.ok, message: r.message, stock: r.stock }, '*');
      if (!r.ok) { App.commit('Pedido rechazado: ' + r.message); toast(r.message, 'err'); return; }
      emit('order.created', order);
      (r.lowAlerts || []).forEach((p) => emit('stock.low', { id: p.id, sku: p.sku, name: p.name, stock: p.stock, min_stock: p.minStock }));
      App.commit('Nuevo pedido ' + order.id + ' por ' + money(order.total) + ' (' + order.payment.method + ')');
      toast('Nuevo pedido ' + order.id + ' · ' + money(order.total), 'ok', 'shopping_bag');
      if (r.lowAlerts && r.lowAlerts.length) toast('Stock bajo: ' + r.lowAlerts.map((p) => p.name).join(', '), 'err', 'warning');
    }
  });

  window.addEventListener('hashchange', () => { const r = location.hash.replace(/^#\/?/, ''); if (r && r !== App.route && VIEWS[r]) go(r); });
  window.addEventListener('beforeunload', () => { if (App.ui.dirty && App.s) SV.storage.put(App.s); });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); App.installPrompt = e; $('#install-btn').classList.remove('hide'); if (App.route === 'inicio') render(); });
  window.addEventListener('appinstalled', () => { App.installPrompt = null; $('#install-btn').classList.add('hide'); toast('SENAVENTAS quedó instalado en tu equipo', 'ok', 'install_desktop'); });

  /* ======================================================================
     Arranque
     ====================================================================== */
  /* Los nombres de los íconos quedan ocultos hasta que la fuente de íconos carga (evita ver "home", "tune"...). */
  const watchIconFont = (doc) => {
    const root = doc.documentElement;
    if (!doc.fonts) { root.classList.add('icons-ok'); return; }
    const ready = () => Array.from(doc.fonts).some((f) => /Material Symbols/.test(f.family) && f.status === 'loaded');
    let tries = 0;
    const tick = () => { if (ready()) { root.classList.add('icons-ok'); return; } if (++tries < 60) setTimeout(tick, 250); };
    tick();
    if (doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', () => { if (ready()) root.classList.add('icons-ok'); });
  };
  SV.watchIconFont = watchIconFont;

  const boot = async () => {
    watchIconFont(document);
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker no registrado', err));
    }
    await refreshSessions();
    const last = SV.storage.getLast();
    let data = null;
    if (last) data = await SV.storage.get(last);
    if (!data && App.sessions.length) data = await SV.storage.get(App.sessions[0].id);
    if (data) {
      try { App.s = SV.normalizeSession(data); }
      catch (e) { console.error(e); data = null; }
    }
    if (!App.s) { App.s = SV.newSession('minimal'); await saveNow(); await refreshSessions(); }
    App.ui.savedAt = App.s.updatedAt;
    const r = location.hash.replace(/^#\/?/, '');
    App.route = VIEWS[r] ? r : 'inicio';
    render();
  };
  boot();
})(window.SV);

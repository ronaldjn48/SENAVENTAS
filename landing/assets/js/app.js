/* ==========================================================================
   SENA VENTAS LANDING PAGE · Aplicación (marco, vistas y acciones)
   El editor visual está en editor.js y la base de datos en leads.js.
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
    VIEWS: {}, AFTER: {}, A: {}, PARTIALS: {}, DROP: {}, INPUT: [],
    ui: {
      marcaTab: 'empresa', nubeTab: 'conexion', device: 'desktop', edDevice: 'desktop',
      sel: null, lib: 'estructura', inspTab: 'contenido', openLi: {}, bpane: 'vista',
      openFld: null, liveEvents: [], unseen: 0, savedAt: 0, dirty: false, saveError: false,
      leadQ: '', leadSt: '', leadSrc: '', leadPage: 1, leadView: 'tabla', leadSel: new Set(),
      coord: null, links: {}
    }
  };
  App.U = U; App.esc = esc; App.$ = $; App.$$ = $$; App.ic = ic;
  const { VIEWS, AFTER, A, PARTIALS } = App;

  const ROUTES = [
    { id: 'inicio', label: 'Inicio & Proyectos', icon: 'home' },
    { id: 'plantillas', label: 'Plantillas', icon: 'dashboard_customize' },
    { id: 'editor', label: 'Editor Visual', icon: 'design_services', count: (s) => s.blocks.length },
    { id: 'marca', label: 'Diseño & Marca', icon: 'palette' },
    { id: 'formulario', label: 'Formulario & Captación', icon: 'contact_mail' },
    { id: 'leads', label: 'Base de Datos (Leads)', icon: 'database', count: (s) => s.leads.length },
    { id: 'vista', label: 'Vista en Vivo', icon: 'visibility' },
    { id: 'publicar', label: 'Publicar & Compartir', icon: 'rocket_launch' },
    { id: 'nube', label: 'Nube & Coordinación', icon: 'cloud' }
  ];

  /* ======================================================================
     Estado, guardado y utilidades de interfaz
     ====================================================================== */
  const saveNow = App.saveNow = async () => {
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

  /* Registra un cambio. opts.render: redibuja la vista; opts.insp: redibuja el inspector del editor. */
  App.commit = (msg, opts = {}) => {
    const s = App.s;
    s.updatedAt = Date.now();
    if (msg) {
      s.activity.unshift({ at: Date.now(), text: msg });
      s.activity = s.activity.slice(0, 150);
      App.ui.unseen++;
    }
    App.ui.dirty = true;
    renderSaveStatus();
    saveSoon();
    renderChrome();
    if (opts.render) render();
    else refreshPartials(opts);
    if (App.onChange) App.onChange(opts);
  };

  const getPath = App.getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = App.setPath = (obj, path, val) => {
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
    setTimeout(() => { t.style.transition = '.3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 3400);
  };

  const copy = App.copy = async (text, ok = 'Copiado al portapapeles') => {
    try { await navigator.clipboard.writeText(text); toast(ok, 'ok', 'content_copy'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(ok, 'ok', 'content_copy'); } catch (x) { toast('No se pudo copiar. Selecciona el texto y copia con Ctrl+C.', 'err'); }
      ta.remove();
    }
  };

  /* Capas: modales y paneles laterales apilables */
  const layers = [];
  const openLayer = (html, kind, onClose) => {
    const root = document.createElement('div');
    root.className = 'layer';
    root.innerHTML = `<div class="${kind === 'drawer' ? 'drawer-scrim' : 'modal-scrim'}" data-a="close-overlay"></div>` + html;
    $('#overlay-root').appendChild(root);
    layers.push({ root, onClose });
    const first = root.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=file]),select,textarea');
    if (first && kind === 'modal') setTimeout(() => first.focus(), 60);
    return root;
  };
  App.layers = layers;
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
  App.drawer = ({ title, sub, icon, body, foot, onClose }) => openLayer(
    `<aside class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="drawer-h"><div class="row"><div class="avatar" style="border-radius:8px;background:var(--primary-c)">${ic(icon || 'edit')}</div><div><h2>${title}</h2>${sub ? `<small class="muted">${sub}</small>` : ''}</div></div><button class="icon-btn" data-a="close-overlay" aria-label="Cerrar">${ic('close')}</button></div><div class="drawer-b">${body}</div>${foot ? `<div class="drawer-f">${foot}</div>` : ''}</aside>`, 'drawer', onClose);
  App.confirm = (title, text, { ok = 'Confirmar', danger = false } = {}) => new Promise((resolve) => {
    let done = false;
    const root = App.modal({
      title, body: `<p>${text}</p>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-role="ok">${esc(ok)}</button>`,
      onClose: () => { if (!done) resolve(false); }
    });
    root.querySelector('[data-role=ok]').addEventListener('click', () => { done = true; App.closeOverlay(); resolve(true); });
  });
  App.prompt = (title, label, value = '', { ok = 'Guardar', hint = '' } = {}) => new Promise((resolve) => {
    let done = false;
    const root = App.modal({
      title, body: `<div class="field"><label>${esc(label)}</label><input class="input" data-role="val" value="${esc(value)}">${hint ? `<span class="hint">${hint}</span>` : ''}</div>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-primary" data-role="ok">${esc(ok)}</button>`,
      onClose: () => { if (!done) resolve(null); }
    });
    const go = () => { done = true; const v = root.querySelector('[data-role=val]').value; App.closeOverlay(); resolve(v); };
    root.querySelector('[data-role=ok]').addEventListener('click', go);
    root.querySelector('[data-role=val]').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });

  /* ======================================================================
     Ruta pedagógica y checklist de publicación
     ====================================================================== */
  const waOk = App.waOk = (s) => (s.wa.mode === 'link' ? /^(https?:\/\/)?(wa\.me|api\.whatsapp\.com|wa\.link|whatsapp\.com)\//i.test(s.wa.link || '') : /^\d{10,13}$/.test(U.digits(s.wa.number)));
  const hasCloudDest = App.hasCloudDest = (s) => { const d = s.form.destinations; return (d.sheets.enabled && d.sheets.url) || (d.webhook.enabled && d.webhook.url) || (d.email.enabled && d.email.to); };

  const steps = App.steps = (s) => [
    { title: 'Brief de la empresa cliente', desc: 'Datos del negocio, contacto y ficha del aprendiz', done: !!s.progress.clientEdited && s.owner.name.trim() && s.owner.name !== 'Aprendiz SENA' && !!s.client.phone, route: 'marca', tab: 'empresa' },
    { title: 'Plantilla y estructura', desc: 'Escoge plantilla y personaliza los bloques', done: !!s.progress.templateChosen && !!s.progress.edited && s.blocks.length >= 4, route: 'editor' },
    { title: 'Formulario y WhatsApp', desc: 'Campos, autorización de datos y enlace WPB', done: s.form.fields.some((f) => f.type === 'tel') && s.form.consent.enabled && waOk(s), route: 'formulario' },
    { title: 'Prueba de captación', desc: '3 o más interesados registrados', done: s.leads.length >= 3, route: 'vista' },
    { title: 'Publicación y reporte', desc: 'Enlace funcional y base de datos en Excel', done: !!s.published && !!s.progress.excel, route: 'publicar' }
  ];

  const seoScore = App.seoScore = (s) => {
    const seo = s.seo || {};
    const checks = [
      [(seo.title || '').length >= 20 && (seo.title || '').length <= 60, 'Título entre 20 y 60 caracteres (' + (seo.title || '').length + ')'],
      [(seo.description || '').length >= 70 && (seo.description || '').length <= 160, 'Descripción entre 70 y 160 caracteres (' + (seo.description || '').length + ')'],
      [(seo.keywords || '').split(',').filter((k) => k.trim()).length >= 3, 'Al menos 3 palabras clave'],
      [!!(s.client.city || '').trim(), 'Ciudad del negocio (SEO local)'],
      [s.blocks.some((b) => b.type === 'hero' && !b.hidden), 'Portada con título principal (H1)'],
      [s.blocks.filter((b) => b.type === 'image').every((b) => (b.props.alt || '').trim()), 'Imágenes con texto alternativo']
    ];
    return { checks, score: Math.round(checks.filter((c) => c[0]).length / checks.length * 100) };
  };

  const checklist = App.checklist = (s) => {
    const vis = s.blocks.filter((b) => !b.hidden);
    const has = (t) => vis.some((b) => b.type === t);
    const formBlocks = vis.filter((b) => b.type === 'form' || (b.type === 'hero' && b.props.layout === 'form'));
    return [
      { req: true, ok: s.client.name.trim().length > 2 && (s.client.slogan || '').trim().length > 5, t: 'Nombre y propuesta de valor de la empresa', d: 'Diseño & Marca → Empresa cliente.', route: 'marca', tab: 'empresa' },
      { req: true, ok: s.owner.name !== 'Aprendiz SENA' && !!s.owner.name.trim() && !!String(s.owner.ficha).trim(), t: 'Ficha del aprendiz completa', d: 'Nombre y número de ficha para los créditos y el informe.', route: 'marca', tab: 'empresa' },
      { req: true, ok: formBlocks.length > 0, t: 'Formulario visible en la página', d: formBlocks.length ? formBlocks.length + ' formulario(s).' : 'Agrega el bloque Formulario o una portada con formulario.', route: 'editor' },
      { req: true, ok: s.form.fields.some((f) => f.key === 'nombre') && s.form.fields.some((f) => f.type === 'tel' || f.type === 'email'), t: 'Campos mínimos: nombre y un medio de contacto', d: s.form.fields.length + ' campos configurados.', route: 'formulario' },
      { req: true, ok: !!s.form.consent.enabled, t: 'Autorización de tratamiento de datos (Ley 1581)', d: 'Casilla obligatoria con enlace a la política.', route: 'formulario' },
      { req: true, ok: waOk(s), t: 'WhatsApp o enlace WPB configurado', d: s.wa.mode === 'link' ? 'Enlace: ' + (s.wa.link || 'vacío') : 'Número: ' + (s.wa.number || 'vacío'), route: 'marca', tab: 'whatsapp' },
      { req: true, ok: s.leads.length > 0, t: 'Prueba de captación realizada', d: s.leads.length + ' lead(s) en la base de datos.', route: 'vista' },
      { req: true, ok: (s.seo.title || '').length >= 10 && (s.seo.description || '').length >= 40, t: 'Título y descripción para buscadores', d: 'Diseño & Marca → SEO y seguimiento.', route: 'marca', tab: 'seo' },
      { req: false, ok: !!hasCloudDest(s), t: 'Destino real de los datos (Sheets, webhook o correo)', d: hasCloudDest(s) ? 'Los leads del enlace público llegan a la nube.' : 'Sin destino: los datos del enlace público solo quedan en el navegador del visitante.', route: 'formulario' },
      { req: false, ok: has('testimonials') || has('stats') || has('logos') || has('team'), t: 'Prueba social (testimonios, cifras, aliados o equipo)', d: 'Aumenta la confianza y la conversión.', route: 'editor' },
      { req: false, ok: has('faq'), t: 'Preguntas frecuentes', d: 'Resuelve objeciones antes del contacto.', route: 'editor' },
      { req: false, ok: Object.values(s.social || {}).some((v) => (v || '').trim()), t: 'Redes sociales de la empresa', d: 'Botones hacia Facebook, Instagram, TikTok u otras.', route: 'marca', tab: 'whatsapp' },
      { req: false, ok: seoScore(s).score >= 80, t: 'SEO de la página (80% o más)', d: 'Puntaje actual: ' + seoScore(s).score + '%.', route: 'marca', tab: 'seo' },
      { req: false, ok: !!(s.tracking.metaPixel || s.tracking.tiktokPixel || s.tracking.ga4), t: 'Píxel de pauta o analítica', d: 'Meta, TikTok o Google Analytics 4 para medir campañas.', route: 'marca', tab: 'seo' }
    ];
  };
  const scoreOf = App.scoreOf = (list) => {
    const total = list.reduce((a, c) => a + (c.req ? 10 : 5), 0);
    const got = list.reduce((a, c) => a + (c.ok ? (c.req ? 10 : 5) : 0), 0);
    return Math.round(got / total * 100);
  };

  /* ======================================================================
     Marco de la aplicación
     ====================================================================== */
  /* Solo reemplaza el HTML cuando cambia: evita perder clics si un campo se guarda al perder el foco. */
  const lastHtml = {};
  const put = (sel, html) => { if (lastHtml[sel] === html) return; lastHtml[sel] = html; $(sel).innerHTML = html; };
  const renderChrome = App.renderChrome = () => {
    const s = App.s; if (!s) return;
    const st = steps(s);
    const done = st.filter((x) => x.done).length;
    const next = st.find((x) => !x.done);
    put('#progress', `<div class="prog-h"><span>Taller Landing Page</span><span>${done * 20}%</span></div><div class="bar"><i style="width:${done * 20}%"></i></div><small>${next ? 'Paso ' + (st.indexOf(next) + 1) + ' de 5: ' + esc(next.title) : '¡Ruta completada! Landing publicada'}</small>`);
    put('#nav', ROUTES.map((r) => {
      const c = r.count ? r.count(s) : '';
      return `<a href="#/${r.id}" class="${App.route === r.id ? 'on' : ''}" data-a="go" data-route="${r.id}">${ic(r.icon)}<span>${r.label}</span>${c !== '' && c !== 0 ? `<span class="n">${c}</span>` : ''}</a>`;
    }).join(''));
    const bn = [['inicio', 'home', 'Inicio'], ['editor', 'design_services', 'Editor'], ['vista', 'visibility', 'Vista'], ['leads', 'database', 'Leads']];
    put('#bnav', bn.map(([id, i, l]) => `<a href="#/${id}" class="${App.route === id ? 'on' : ''}" data-a="go" data-route="${id}">${ic(i)}<span>${l}</span>${id === 'leads' && s.leads.length ? `<b>${s.leads.length}</b>` : ''}</a>`).join('') + `<button data-a="open-side" class="${['plantillas', 'marca', 'formulario', 'publicar', 'nube'].includes(App.route) ? 'on' : ''}">${ic('menu')}<span>Más</span></button>`);
    const initials = s.owner.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    put('#user-card', `<div class="avatar">${esc(initials || 'A')}</div><div class="grow"><b>${esc(s.owner.name)}</b><small>Usuario: ${esc(App.user ? App.user.username : '')}${s.owner.ficha ? ' • Ficha ' + esc(s.owner.ficha) : ''}</small></div>${ic('edit', 'sm muted')}`);
    $('#notif-dot').classList.toggle('hide', !App.ui.unseen);
    if (App.user) put('#acct-chip', `<span class="avatar">${esc(App.user.username.slice(0, 2).toUpperCase())}</span><span>${esc(App.user.username)}</span>`);
    renderSaveStatus();
  };

  const renderSaveStatus = () => {
    const s = App.s; if (!s) return;
    const st = App.ui.saveError ? `<span class="err-t">${ic('error', 'sm')} Error al guardar</span>` : App.ui.dirty ? `${ic('sync', 'sm')} Guardando...` : `${ic('cloud_done', 'sm ok-t')} Guardado ${App.ui.savedAt ? U.timeAgo(App.ui.savedAt) : ''}`;
    $('#ses-name').innerHTML = `<b title="${esc(s.name)}">${esc(s.name)}</b><small>${st}</small>`;
  };
  setInterval(renderSaveStatus, 20000);

  const render = App.render = () => {
    const s = App.s; if (!s) return;
    const view = VIEWS[App.route] || VIEWS.inicio;
    const main = $('#view');
    main.classList.toggle('wide', App.route === 'editor');
    main.innerHTML = view(s);
    renderChrome();
    if (AFTER[App.route]) AFTER[App.route](s);
  };

  const go = App.go = (route, tab) => {
    if (!VIEWS[route]) route = 'inicio';
    App.route = route;
    if (tab) { if (route === 'marca') App.ui.marcaTab = tab; if (route === 'nube') App.ui.nubeTab = tab; }
    if (location.hash !== '#/' + route) history.replaceState(null, '', '#/' + route);
    document.body.classList.remove('side-open');
    render();
    window.scrollTo(0, 0);
  };

  /* Partes de la vista que se actualizan sin redibujar todo (evita perder el foco). */
  const refreshPartials = App.refreshPartials = (opts = {}) => {
    $$('[data-partial]').forEach((el) => {
      const name = el.getAttribute('data-partial');
      if (el.hasAttribute('data-manual') && !(opts.parts || []).includes(name)) return;
      const fn = PARTIALS[name];
      if (!fn) return;
      const html = fn(App.s);
      if (el.__html !== html) { el.__html = html; el.innerHTML = html; }
    });
  };

  /* ---------- Controles de formulario ---------- */
  const bindInput = App.bindInput = (path, { type = 'text', ph = '', attrs = '', cls = 'input' } = {}) => {
    const v = getPath(App.s, path);
    return `<input class="${cls}" type="${type}" data-bind="${path}" ${type === 'number' ? 'data-type="number" step="any"' : ''} value="${esc(v == null ? '' : v)}" placeholder="${esc(ph)}" ${attrs}>`;
  };
  const bindArea = App.bindArea = (path, ph = '', rows = 3, attrs = '') => `<textarea class="textarea" rows="${rows}" data-bind="${path}" placeholder="${esc(ph)}" ${attrs}>${esc(getPath(App.s, path) || '')}</textarea>`;
  const bindSelect = App.bindSelect = (path, list, attrs = '') => `<select class="select" data-bind="${path}" ${attrs}>${opts(list, getPath(App.s, path))}</select>`;
  const field = App.field = (label, control, hint, req) => `<div class="field"><label>${label}${req ? ' <span class="req">*</span>' : ''}</label>${control}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
  const sw = App.sw = (on, action, attrs = '') => `<button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${!!on}" data-a="${action}" ${attrs}></button>`;
  const opts = App.opts = (list, cur) => list.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
  const counter = (len, min, max) => `<span class="counter ${len >= min && len <= max ? 'ok' : 'bad'}">${len} / ${min}-${max}</span>`;

  /* ======================================================================
     VISTAS
     ====================================================================== */

  /* ---------------- Inicio & Proyectos ---------------- */
  VIEWS.inicio = (s) => {
    const st = steps(s);
    const next = st.find((x) => !x.done);
    const tpl = SV.TEMPLATES.find((t) => t.id === s.templateId) || SV.TEMPLATES[0];
    const first = s.owner.name.split(' ')[0];
    const views = s.analytics.view || 0;
    const conv = views ? (s.leads.length / views) * 100 : 0;
    const canPortable = /^https?:/.test(location.protocol);
    return `
    <div class="hero-card mb">
      <span class="chip" style="background:rgba(255,255,255,.16);color:#fff">${ic('school', 'sm')} Simulador de captación de clientes</span>
      <h1>Hola, ${esc(first)}. Crea landing pages que capten clientes reales.</h1>
      <p>Escoge una plantilla o empieza desde cero, personaliza cada bloque con arrastrar y soltar, conecta el WhatsApp del negocio, recibe los datos de los interesados y descarga la base de datos en Excel. El enlace de tu landing funciona en cualquier celular.</p>
      <div class="row mt">
        ${next ? `<button class="btn btn-white btn-lg" data-a="go" data-route="${next.route}" data-tab="${next.tab || ''}">${ic('arrow_forward')} Continuar: ${esc(next.title)}</button>` : `<button class="btn btn-white btn-lg" data-a="go" data-route="publicar">${ic('rocket_launch')} Ver mi landing publicada</button>`}
        <button class="btn btn-glass" data-a="go" data-route="plantillas">${ic('add')} Nueva landing</button>
        <button class="btn btn-glass" data-a="import-session">${ic('upload_file')} Importar proyecto</button>
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
        <div class="card-h"><h3>Landing actual</h3><span class="chip">${ic(tpl.icon, 'sm')} ${esc(tpl.name)}</span></div>
        <div class="row" style="gap:12px;margin-bottom:14px;flex-wrap:nowrap"><div class="avatar" style="width:46px;height:46px;border-radius:12px;background:${esc(s.theme.primary)};color:${U.onColor(s.theme.primary)}">${ic(s.client.icon || 'storefront')}</div><div class="grow" style="min-width:0"><b>${esc(s.client.name)}</b><div class="small muted">${esc(s.client.sector || '')} · ${esc(s.client.city || 'Sin ciudad')}</div></div></div>
        <div class="grid g2" style="gap:10px">
          <div class="card flat" style="padding:12px"><div class="tiny muted">Leads</div><b style="font-size:20px">${s.leads.length}</b></div>
          <div class="card flat" style="padding:12px"><div class="tiny muted">Visitas</div><b style="font-size:20px">${views}</b></div>
          <div class="card flat" style="padding:12px"><div class="tiny muted">Conversión</div><b style="font-size:20px">${U.pct(conv)}</b></div>
          <div class="card flat" style="padding:12px"><div class="tiny muted">Bloques</div><b style="font-size:20px">${s.blocks.length}</b></div>
        </div>
        <div class="row mt"><button class="btn btn-primary grow" data-a="go" data-route="editor">${ic('design_services')} Editar</button><button class="btn btn-soft" data-a="go" data-route="vista" title="Vista en vivo">${ic('visibility')}</button><button class="btn btn-soft" data-a="export-session" data-id="${s.id}" title="Descargar respaldo">${ic('download')}</button></div>
      </div>
    </div>

    <div class="card mt">
      <div class="card-h"><div><h3>Mis proyectos guardados</h3><p class="small muted">Se guardan automáticamente en este navegador. Exporta un respaldo .json para llevarlos a otro equipo o entregarlos como evidencia.</p></div><div class="row"><button class="btn btn-soft btn-sm" data-a="import-session">${ic('upload_file', 'sm')} Importar</button><button class="btn btn-primary btn-sm" data-a="go" data-route="plantillas">${ic('add', 'sm')} Nueva landing</button></div></div>
      <div class="grid g3">
        ${App.sessions.map((x0) => {
          const x = x0.id === s.id ? Object.assign({}, x0, { name: s.name, blocks: s.blocks.length, leads: s.leads.length, templateId: s.templateId, updatedAt: s.updatedAt, published: s.published, color: s.theme.primary, icon: s.client.icon, owner: s.owner, client: s.client.name }) : x0;
          const th = SV.TEMPLATES.find((t) => t.id === x.templateId) || SV.TEMPLATES[0];
          const cur = x.id === s.id;
          const col = x.color || th.color;
          return `<div class="ses-card ${cur ? 'current' : ''}">
            <div class="ses-top" style="background:linear-gradient(120deg,${esc(col)},${esc(col)}cc)"><div class="ico">${ic(x.icon || th.icon)}</div>${cur ? '<span class="chip" style="background:rgba(255,255,255,.2);color:#fff">Abierto</span>' : ''}${x.published ? '<span class="chip" style="background:rgba(255,255,255,.2);color:#fff">' + ic('public', 'sm') + ' Publicada</span>' : ''}</div>
            <div class="ses-body"><h3>${esc(x.name)}</h3><span class="small muted">${esc(x.owner ? x.owner.name : '')} · ${esc(th.name)}</span><span class="tiny muted">${x.blocks} bloques · ${x.leads} leads · editado ${esc(U.timeAgo(x.updatedAt))}</span></div>
            <div class="ses-foot">${cur ? `<button class="btn btn-sm btn-ghost grow" data-a="rename-session">${ic('edit', 'sm')} Renombrar</button>` : `<button class="btn btn-sm btn-primary grow" data-a="open-session" data-id="${x.id}">${ic('folder_open', 'sm')} Abrir</button>`}
              <button class="icon-btn" title="Duplicar" data-a="dup-session" data-id="${x.id}">${ic('content_copy')}</button>
              <button class="icon-btn" title="Exportar respaldo .json" data-a="export-session" data-id="${x.id}">${ic('download')}</button>
              <button class="icon-btn danger" title="Eliminar" data-a="del-session" data-id="${x.id}">${ic('delete')}</button></div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card mt">
      <div class="card-h"><div><h3>${ic('account_circle')} Mi cuenta en este equipo</h3><p class="small muted">Usuario <b>${esc(App.user ? App.user.username : '')}</b>. Tus proyectos y leads solo aparecen con tu usuario. Al terminar la clase cierra sesión: la app queda limpia para el siguiente estudiante.</p></div>
        <div class="row"><button class="btn btn-soft btn-sm" data-a="export-session" data-id="${s.id}">${ic('download', 'sm')} Respaldo del proyecto</button><button class="btn btn-primary btn-sm" data-a="logout">${ic('logout', 'sm')} Cerrar sesión</button><button class="btn btn-danger btn-sm" data-a="delete-account">${ic('person_remove', 'sm')} Eliminar mi usuario y mis datos</button></div></div>
    </div>

    <div class="grid g2 mt">
      <div class="card">
        <div class="card-h"><h3>${ic('install_desktop')} Usar en el escritorio o sin conexión</h3></div>
        <div class="stack small">
          <p>SENA VENTAS LANDING PAGE es una aplicación web instalable (PWA). Funciona desde el navegador, como programa de escritorio y en la nube.</p>
          ${App.installPrompt ? `<button class="btn btn-primary" data-a="install">${ic('install_desktop')} Instalar en este equipo</button>` : `<ol class="steps-list"><li>Abre la app en Chrome o Edge desde su dirección web.</li><li>Pulsa ${ic('install_desktop', 'sm')} en la barra de direcciones o el menú ⋮ → "Instalar".</li><li>Queda un acceso directo en el escritorio y en el menú de inicio.</li></ol>`}
          <div class="tip" style="padding:12px"><div class="ico" style="width:34px;height:34px">${ic('description', 'sm')}</div><p class="small"><b>Versión portable:</b> un único archivo HTML que se abre con doble clic, sin instalar nada. Ideal para el LMS, una memoria USB o equipos sin permisos de administrador.</p></div>
          <button class="btn btn-soft" data-a="portable" ${canPortable ? '' : 'disabled title="Disponible cuando abres la app desde un servidor web"'}>${ic('download')} Descargar versión portable (.html)</button>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${ic('groups')} Replicar con el grupo</h3></div>
        <div class="stack small">
          <p>Convierte esta landing en una <b>plantilla de clase</b>: se exporta sin leads, sin publicación y sin tokens. Cada aprendiz la importa y parte del mismo punto.</p>
          <div class="row"><button class="btn btn-primary" data-a="export-template">${ic('content_copy')} Exportar como plantilla</button><button class="btn btn-soft" data-a="import-session">${ic('upload_file')} Importar plantilla</button></div>
          <div class="tip" style="padding:12px"><div class="ico" style="width:34px;height:34px">${ic('lightbulb', 'sm')}</div><p class="small"><b>Tip del instructor:</b> pide como evidencia el archivo <span class="kbd">.landing.json</span>, el enlace publicado y la base de datos en Excel. Con la Nube & Coordinación ves en un solo tablero las landing y los leads de todo el grupo.</p></div>
        </div>
      </div>
    </div>`;
  };

  /* ---------------- Plantillas ---------------- */
  VIEWS.plantillas = (s) => `
    <div class="page-head">
      <div><span class="eyebrow">${ic('school', 'sm')} Módulo didáctico • Selección de plantilla</span><h1>Plantillas de Landing Page</h1><p class="lead">Cuatro modelos listos para servicios con alta demanda de contacto, más un lienzo en blanco. Todas son 100% configurables: bloques, textos, imágenes, colores, fuentes y formulario.</p></div>
      <div class="tip" style="max-width:440px"><div class="ico">${ic('lightbulb')}</div><div><h4>Tip del instructor SENA</h4><p class="small">Una landing page tiene un solo objetivo: que el visitante deje sus datos o escriba por WhatsApp. Quita todo lo que distraiga de esa acción.</p></div></div>
    </div>
    <div class="grid g3">
      ${SV.TEMPLATES.map((t) => {
        const cur = s.templateId === t.id;
        return `<div class="tpl-card ${cur ? 'active' : ''}">
          <div class="tpl-thumb">${cur ? '<span class="chip solid"><i class="d"></i>Plantilla de este proyecto</span>' : `<span class="chip" style="background:${t.color};color:#fff">${ic(t.icon, 'sm')} ${esc(t.tag)}</span>`}<iframe data-thumb="${t.id}" title="Miniatura ${esc(t.name)}" loading="lazy" tabindex="-1" sandbox="allow-scripts"></iframe><div class="tpl-over"></div></div>
          <div class="tpl-body"><h3>${esc(t.name)}</h3><p class="small muted">${esc(t.description)}</p><div class="feat" style="display:flex;flex-direction:column;gap:5px;font-size:12.5px;color:var(--muted)">${t.features.map((f) => `<span class="row" style="gap:6px;flex-wrap:nowrap;align-items:flex-start">${ic('check_circle', 'sm ok-t')}${esc(f)}</span>`).join('')}</div></div>
          <div class="tpl-foot"><button class="btn btn-primary btn-sm grow" data-a="new-from-tpl" data-id="${t.id}">${ic('add', 'sm')} Crear proyecto</button><button class="btn btn-soft btn-sm" data-a="apply-tpl" data-id="${t.id}" title="Reemplaza el contenido del proyecto abierto">${ic('swap_horiz', 'sm')} Aplicar aquí</button><button class="icon-btn soft" title="Ver demo" data-a="demo-tpl" data-id="${t.id}">${ic('visibility')}</button></div>
        </div>`;
      }).join('')}
      <div class="card" style="display:flex;flex-direction:column;gap:12px;justify-content:center">
        <h3>${ic('upload_file')} ¿Tienes una plantilla del instructor?</h3>
        <p class="small muted">Importa el archivo .landing.json que te compartieron. Se crea un proyecto nuevo con esa estructura, estilos y formulario.</p>
        <button class="btn btn-soft" data-a="import-session">${ic('upload_file')} Importar plantilla de clase</button>
        <div class="tip" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('touch_app', 'sm')}</div><p class="small">En el <b>Editor Visual</b> arrastra bloques desde la biblioteca hacia la lista o directo sobre la página.</p></div>
      </div>
    </div>`;
  AFTER.plantillas = () => {
    SV.TEMPLATES.forEach((t) => {
      const f = $(`iframe[data-thumb="${t.id}"]`);
      if (f) f.srcdoc = SV.renderLanding(SV.newProject(t.id), { mode: 'edit' });
    });
  };

  /* ---------------- Diseño & Marca ---------------- */
  const marcaTabs = [['empresa', 'business', 'Empresa cliente'], ['estilo', 'palette', 'Colores y tipografía'], ['whatsapp', 'chat', 'WhatsApp y redes'], ['seo', 'travel_explore', 'SEO y seguimiento']];
  VIEWS.marca = (s) => `
    <div class="page-head">
      <div><span class="eyebrow">${ic('school', 'sm')} Módulo didáctico • Identidad de la empresa</span><h1>Diseño & Marca</h1><p class="lead">Datos del negocio que atiendes, estilo visual de la landing, canales de contacto y configuración para buscadores y pauta digital.</p></div>
      <div class="tip" style="max-width:420px"><div class="ico">${ic('lightbulb')}</div><div><h4>Tip del instructor SENA</h4><p class="small">Usa máximo dos fuentes y un color de acento para los botones. El contraste del botón principal define cuántos clics recibe.</p></div></div>
    </div>
    <div class="tabs" role="tablist">${marcaTabs.map(([id, i, l]) => `<button class="tab ${App.ui.marcaTab === id ? 'on' : ''}" data-a="marca-tab" data-tab="${id}">${ic(i)}${l}</button>`).join('')}</div>
    ${MARCA[App.ui.marcaTab](s)}`;

  const MARCA = {};
  PARTIALS.brandprev = (s) => {
    const t = s.theme;
    const onP = U.onColor(t.primary); const onA = U.onColor(t.accent);
    return `<div class="brand-prev" style="background:${esc(t.bg)};color:${esc(t.text)};font-family:'${esc(t.fontBody)}',sans-serif">
      <div style="padding:12px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid ${esc(t.text)}14">${s.client.logo ? `<img src="${esc(/^art:/.test(s.client.logo) ? SV.artSrc(s.client.logo, t.primary) : s.client.logo)}" style="height:30px;width:auto" alt="">` : `<span style="width:32px;height:32px;border-radius:9px;background:${esc(t.primary)};color:${onP};display:flex;align-items:center;justify-content:center">${ic(s.client.icon || 'storefront', 'sm')}</span>`}<b style="font-family:'${esc(t.fontHead)}',sans-serif">${esc(s.client.name)}</b></div>
      <div style="padding:22px 18px;background:${esc(t.surface)}"><span style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${esc(t.primary)}">${esc(s.client.sector || 'Sector')}</span><h2 style="font-family:'${esc(t.fontHead)}',sans-serif;font-size:24px;margin:6px 0">${esc(s.client.slogan || 'Tu propuesta de valor')}</h2><p style="color:${esc(t.muted)};font-size:13.5px">${esc(s.client.city || '')} ${s.client.phone ? '· ' + esc(s.client.phone) : ''}</p>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><span style="padding:9px 14px;border-radius:${t.btn === 'pill' ? 99 : t.btn === 'sharp' ? 2 : Math.min(14, t.radius)}px;background:${esc(t.primary)};color:${onP};font-weight:700;font-size:13px">Botón principal</span><span style="padding:9px 14px;border-radius:${t.btn === 'pill' ? 99 : t.btn === 'sharp' ? 2 : Math.min(14, t.radius)}px;background:${esc(t.accent)};color:${onA};font-weight:700;font-size:13px">Acento</span><span style="padding:9px 14px;border-radius:99px;background:#25d366;color:#fff;font-weight:700;font-size:13px">WhatsApp</span></div></div>
      <div style="padding:12px 16px;background:${esc(t.dark)};color:${U.onColor(t.dark)};font-size:12px">Pie de página · ${esc(s.owner.name)}</div></div>`;
  };

  MARCA.empresa = (s) => `
    <div class="grid g-side">
      <div class="stack">
        <div class="card pad-lg stack">
          <div class="row between"><h3 style="font-size:17px">${ic('business')} Empresa cliente</h3><span class="small ok-t row" style="gap:4px">${ic('save', 'sm')} Guardado automático</span></div>
          <div class="frow">${field('Nombre comercial', bindInput('client.name', { ph: 'Ej: Clínica Dental Sonríe', attrs: 'maxlength="70" data-client="1"' }), '', true)}${field('Sector', bindInput('client.sector', { ph: 'Ej: Salud, Inmobiliario', attrs: 'data-client="1"' }))}</div>
          ${field('Propuesta de valor (eslogan)', bindInput('client.slogan', { ph: 'Qué ofreces, para quién y por qué elegirte', attrs: 'maxlength="140" data-client="1"' }), '', true)}
          <div class="frow">${field('Teléfono de contacto', bindInput('client.phone', { ph: '601 745 2200 o 300 123 4567', attrs: 'data-client="1"' }), 'Se usa en los botones "Llamar".', true)}${field('Correo', bindInput('client.email', { type: 'email', ph: 'contacto@empresa.co', attrs: 'data-client="1"' }))}</div>
          <div class="frow">${field('Dirección', bindInput('client.address', { ph: 'Calle 10 # 20-30', attrs: 'data-client="1"' }))}${field('Ciudad', bindInput('client.city', { ph: 'Ej: Medellín, Antioquia', attrs: 'data-client="1"' }))}</div>
          ${field('Horario de atención', bindInput('client.schedule', { ph: 'Lunes a viernes 8:00 a.m. a 6:00 p.m.', attrs: 'data-client="1"' }))}
          <div class="field"><label>Logo</label>${App.imageField('p:client.logo', { small: true })}</div>
          <div class="field"><label>Ícono (si no hay logo)</label><button class="icon-pick" data-a="pick-icon" data-target="p:client.icon">${ic(s.client.icon || 'storefront')}<span class="grow">${esc(s.client.icon || 'storefront')}</span>${ic('expand_more', 'sm muted')}</button></div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('badge')} Ficha del aprendiz</h3>
          <div class="frow">${field('Nombre completo', bindInput('owner.name', { ph: 'Tu nombre' }), '', true)}${field('Número de ficha', bindInput('owner.ficha', { ph: 'Ej: 2879456' }), '', true)}</div>
          <div class="frow">${field('Programa de formación', bindInput('owner.programa'))}${field('Rol', bindSelect('owner.role', ['Aprendiz SENA', 'Instructor SENA', 'Estudiante', 'Emprendedor', 'Consultor']))}</div>
          <div class="frow three">${field('Centro de formación', bindInput('owner.centro', { ph: 'Centro de Comercio y Servicios' }))}${field('Regional', bindInput('owner.regional', { ph: 'Regional Antioquia' }))}${field('Instructor', bindInput('owner.instructor'))}</div>
        </div>
      </div>
      <div class="stack">
        <div class="card"><div class="card-h"><h3>Vista previa de marca</h3><button class="btn btn-sm btn-ghost" data-a="go" data-route="vista">${ic('visibility', 'sm')} Ver landing</button></div><div data-partial="brandprev">${PARTIALS.brandprev(s)}</div></div>
        <div class="tip"><div class="ico">${ic('psychology')}</div><div><h4>Brief rápido</h4><p class="small">Antes de diseñar, responde con el cliente: ¿qué servicio vende más?, ¿quién es su cliente ideal?, ¿qué objeción escucha siempre? y ¿por qué canal prefiere atender? Esas respuestas definen el título, los beneficios y las preguntas frecuentes.</p></div></div>
      </div>
    </div>`;

  MARCA.estilo = (s) => {
    const t = s.theme;
    const colors = [['primary', 'Principal (botones)'], ['secondary', 'Secundario'], ['accent', 'Acento'], ['bg', 'Fondo'], ['surface', 'Fondo suave / tarjetas'], ['text', 'Texto'], ['muted', 'Texto secundario'], ['dark', 'Secciones oscuras']];
    const fonts = SV.FONTS.map((f) => [f.name, f.name + (f.kind === 'serif' ? ' (serif)' : f.kind === 'display' ? ' (titulares)' : '')]);
    return `
    <div class="grid g-side">
      <div class="stack">
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('format_color_fill')} Paletas rápidas</h3>
          <div class="pal-grid">${SV.PALETTES.map((p, i) => `<button class="pal" data-a="apply-palette" data-i="${i}"><div class="sw">${['primary', 'accent', 'surface', 'dark'].map((k) => `<i style="background:${p[k]}"></i>`).join('')}</div><b>${esc(p.name)}</b></button>`).join('')}</div>
          <div class="grid g4" style="gap:10px">${colors.map(([k, l]) => `<div class="field"><label class="small">${l}</label><div class="color-row"><input type="color" data-bind="theme.${k}" value="${esc(t[k])}"><input class="input mono" data-bind="theme.${k}" value="${esc(t[k])}" maxlength="7" style="padding:7px 9px;font-size:12.5px"></div></div>`).join('')}</div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('text_fields')} Tipografía</h3>
          <div class="grid g3" style="gap:8px">${SV.FONT_PAIRS.map((f) => `<button class="font-pair ${t.fontHead === f.head && t.fontBody === f.body ? 'on' : ''}" data-a="apply-fonts" data-id="${f.id}"><b style="font-family:'${esc(f.head)}',sans-serif">${esc(f.name)}</b><small>${esc(f.head)} + ${esc(f.body)}</small></button>`).join('')}</div>
          <div class="frow">${field('Fuente de títulos', `<select class="select" data-bind="theme.fontHead" data-rerender="1">${opts(fonts, t.fontHead)}</select>`)}${field('Fuente de textos', `<select class="select" data-bind="theme.fontBody" data-rerender="1">${opts(fonts, t.fontBody)}</select>`)}</div>
          <div class="card flat" style="padding:16px"><div style="font-family:'${esc(t.fontHead)}',serif;font-size:26px;font-weight:800;line-height:1.15">${esc(s.client.slogan || 'Así se ven tus títulos')}</div><p style="font-family:'${esc(t.fontBody)}',sans-serif;margin-top:8px">Así se ven los párrafos de tu landing page. Una buena lectura mantiene al visitante hasta el formulario.</p></div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('rounded_corner')} Formas y proporciones</h3>
          <div class="frow">
            ${field('Redondeo de esquinas: <b data-partial="radius">' + esc(t.radius) + ' px</b>', `<input type="range" min="0" max="32" step="1" data-bind="theme.radius" data-type="number" value="${esc(t.radius)}" style="width:100%;accent-color:var(--primary-c)">`)}
            ${field('Ancho máximo del contenido', bindSelect('theme.width', [['1040', 'Compacto (1040 px)'], ['1180', 'Normal (1180 px)'], ['1320', 'Amplio (1320 px)']]))}
          </div>
          <div class="frow">
            ${field('Estilo de botones', `<div class="pill-seg">${[['solid', 'Sólido'], ['pill', 'Píldora'], ['sharp', 'Recto'], ['outline', 'Contorno']].map(([v, l]) => `<button class="${t.btn === v ? 'on' : ''}" data-a="set-theme" data-k="btn" data-v="${v}">${l}</button>`).join('')}</div>`)}
            ${field('Sombras', `<div class="pill-seg">${[['none', 'Planas'], ['soft', 'Suaves'], ['strong', 'Marcadas']].map(([v, l]) => `<button class="${t.shadow === v ? 'on' : ''}" data-a="set-theme" data-k="shadow" data-v="${v}">${l}</button>`).join('')}</div>`)}
          </div>
        </div>
      </div>
      <div class="stack"><div class="card" style="position:sticky;top:84px"><div class="card-h"><h3>Vista previa</h3><button class="btn btn-sm btn-ghost" data-a="go" data-route="editor">${ic('design_services', 'sm')} Editor</button></div><div data-partial="brandprev">${PARTIALS.brandprev(s)}</div><p class="tiny muted mt-s">Los cambios se aplican a toda la landing. Cada bloque puede tener además su propio fondo desde el Editor Visual → Estilo.</p></div></div>
    </div>`;
  };
  PARTIALS.radius = (s) => esc(s.theme.radius) + ' px';

  MARCA.whatsapp = (s) => {
    const wa = s.wa;
    const href = SV.waHref(s);
    return `
    <div class="grid g-side">
      <div class="stack">
        <div class="card pad-lg stack">
          <div class="row between"><h3 style="font-size:17px">${ic('chat')} WhatsApp Business (WPB)</h3><div class="row"><span class="small b ${wa.enabled ? 'ok-t' : 'muted'}">Botón flotante ${wa.enabled ? 'activo' : 'apagado'}</span>${sw(wa.enabled, 'toggle-bind', 'data-path="wa.enabled"')}</div></div>
          ${field('¿Cómo conectas el WhatsApp del negocio?', `<div class="pill-seg">${[['number', 'Con el número'], ['link', 'Con enlace WPB / wa.me']].map(([v, l]) => `<button class="${wa.mode === v ? 'on' : ''}" data-a="set-wa-mode" data-v="${v}">${l}</button>`).join('')}</div>`)}
          ${wa.mode === 'link' ? field('Enlace de WhatsApp Business', bindInput('wa.link', { ph: 'https://wa.me/message/ABCDEF123 o https://wa.me/573001234567' }), 'En la app WhatsApp Business: Herramientas para la empresa → Enlace corto → Copiar. También sirve un enlace de wa.link.', true)
            : field('Número de WhatsApp con indicativo', bindInput('wa.number', { ph: '573001234567' }), 'Indicativo 57 + celular, sin espacios ni signos. Ej: 573001234567.', true)}
          ${field('Mensaje prellenado', bindArea('wa.message', 'Hola, quiero información sobre...', 2), 'Aparece escrito cuando el cliente abre el chat. Las tarjetas agregan el nombre del inmueble, plan o servicio.')}
          <div class="frow">${field('Texto junto al botón flotante', bindInput('wa.label', { ph: '¿Hablamos?' }))}${field('Posición', bindSelect('wa.position', [['right', 'Abajo a la derecha'], ['left', 'Abajo a la izquierda']]))}</div>
          <div class="row"><button class="btn btn-soft" data-a="test-wa" ${href ? '' : 'disabled'}>${ic('open_in_new')} Probar enlace</button><span class="small muted mono" data-partial="walink" style="word-break:break-all">${esc(href || 'Configura el número o el enlace')}</span></div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('share')} Redes sociales de la empresa</h3>
          <p class="small muted">Se muestran en el pie de página y en el bloque "Redes sociales". Deja en blanco las que no uses.</p>
          ${SV.SOCIALS.filter((x) => x.id !== 'whatsapp').map((x) => `<div class="social-row"><span class="sico" style="background:${x.color}"><svg viewBox="0 0 24 24">${x.svg}</svg></span><input class="input" data-bind="social.${x.id}" value="${esc(s.social[x.id] || '')}" placeholder="${esc(x.label)}: https://..."></div>`).join('')}
        </div>
      </div>
      <div class="stack">
        <div class="tip"><div class="ico">${ic('support_agent')}</div><div><h4>Estrategia de contacto</h4><p class="small">El formulario captura datos para seguimiento. WhatsApp resuelve dudas al instante. Usa los dos: el formulario puede redirigir a WhatsApp después de enviar los datos (Formulario & Captación).</p></div></div>
        <div class="card"><h3 style="font-size:15px;margin-bottom:8px">Así lo ve el cliente</h3><div class="card flat" style="padding:14px;display:flex;gap:10px;align-items:center;justify-content:flex-end"><span style="background:#fff;padding:8px 12px;border-radius:12px;font-weight:700;font-size:13px;box-shadow:var(--shadow)" data-partial="walabel">${esc(wa.label || '')}</span><span style="width:52px;height:52px;border-radius:99px;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="28" height="28">${SV.SOCIALS[0].svg}</svg></span></div></div>
      </div>
    </div>`;
  };
  PARTIALS.walink = (s) => esc(SV.waHref(s) || 'Configura el número o el enlace');
  PARTIALS.walabel = (s) => esc(s.wa.label || '');

  MARCA.seo = (s) => {
    const seo = s.seo; const sc = seoScore(s);
    return `
    <div class="grid g-side">
      <div class="stack">
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('travel_explore')} Buscadores y redes (SEO)</h3>
          ${field('Título de la página <span data-partial="seot">' + counter((seo.title || '').length, 20, 60) + '</span>', bindInput('seo.title', { attrs: 'maxlength="90"' }), 'Incluye el servicio y la ciudad. Ej: Remodelaciones en Cali | Bases Firmes.')}
          ${field('Descripción <span data-partial="seod">' + counter((seo.description || '').length, 70, 160) + '</span>', bindArea('seo.description', '', 3, 'maxlength="220"'))}
          ${field('Palabras clave (separadas por coma)', bindInput('seo.keywords', { ph: 'odontólogo medellín, diseño de sonrisa' }))}
          ${field('Imagen para compartir en redes (URL pública)', bindInput('seo.ogImage', { ph: 'https://...jpg' }), 'Imagen de 1200 × 630 px alojada en internet. Se usa en la versión descargable (.zip).')}
          <div class="gprev" data-partial="gprev">${PARTIALS.gprev(s)}</div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('ads_click')} Píxeles de pauta digital</h3>
          <p class="small muted">Pega solo el identificador. La landing publicada registra: <b>PageView</b> al entrar, <b>Lead</b> al enviar el formulario (TikTok: SubmitForm, GA4: generate_lead) y <b>Contact</b> al abrir WhatsApp o llamar. En la vista previa del simulador los píxeles no se cargan.</p>
          <div class="frow three">${field('Meta Pixel ID', bindInput('tracking.metaPixel', { ph: '123456789012345' }))}${field('TikTok Pixel ID', bindInput('tracking.tiktokPixel', { ph: 'C1ABCDEF...' }))}${field('Google Analytics 4', bindInput('tracking.ga4', { ph: 'G-XXXXXXX' }))}</div>
          <div class="tip" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('campaign', 'sm')}</div><p class="small">Para campañas agrega parámetros UTM al enlace publicado, por ejemplo <span class="kbd">?utm_source=facebook&utm_campaign=promo-octubre</span>. Cada lead guarda la fuente y la campaña en la base de datos.</p></div>
        </div>
      </div>
      <div class="card"><div class="card-h"><h3>Puntaje SEO</h3></div><div data-partial="seoscore">${PARTIALS.seoscore(s)}</div><p class="tiny muted mt-s">Puntaje ${sc.score}% · Meta recomendada 80% o más.</p></div>
    </div>`;
  };
  PARTIALS.seot = (s) => counter((s.seo.title || '').length, 20, 60);
  PARTIALS.seod = (s) => counter((s.seo.description || '').length, 70, 160);
  PARTIALS.gprev = (s) => `<small>${esc(SV.publicBase() || 'https://tu-sitio.co/')}</small><b>${esc(s.seo.title || s.client.name)}</b><p>${esc(s.seo.description || s.client.slogan || '')}</p>`;
  PARTIALS.seoscore = (s) => { const sc = seoScore(s); return `<div class="score-ring" style="background:conic-gradient(var(--primary-c) ${sc.score * 3.6}deg, var(--s) 0)"><div><b>${sc.score}%</b><small class="muted">SEO</small></div></div><div class="stack mt" style="gap:6px">${sc.checks.map(([ok, t]) => `<div class="row small" style="gap:6px;flex-wrap:nowrap">${ic(ok ? 'check_circle' : 'cancel', 'sm ' + (ok ? 'ok-t' : 'err-t'))}<span>${esc(t)}</span></div>`).join('')}</div>`; };

  /* ---------------- Formulario & Captación ---------------- */
  VIEWS.formulario = (s) => {
    const f = s.form; const d = f.destinations; const cfg = SV.config();
    return `
    <div class="page-head">
      <div><span class="eyebrow">${ic('school', 'sm')} Módulo didáctico • Captación de datos</span><h1>Formulario & Captación</h1><p class="lead">Diseña los campos que pide la empresa, la autorización de datos y hacia dónde viajan los leads: base de datos del simulador, Google Sheets, webhook o correo.</p></div>
      <div class="tip" style="max-width:430px"><div class="ico">${ic('gavel')}</div><div><h4>Habeas Data · Ley 1581 de 2012</h4><p class="small">Toda landing que recoja datos personales en Colombia necesita la autorización expresa del titular y una política de tratamiento visible.</p></div></div>
    </div>
    <div class="grid g-side">
      <div class="stack">
        <div class="card pad-lg stack">
          <div class="row between"><h3 style="font-size:17px">${ic('dynamic_form')} Campos del formulario</h3><button class="btn btn-primary btn-sm" data-a="add-field">${ic('add', 'sm')} Agregar campo</button></div>
          <p class="small muted">Arrastra ${ic('drag_indicator', 'sm')} para ordenar. Los campos con clave <span class="kbd">nombre</span>, <span class="kbd">telefono</span>, <span class="kbd">correo</span>, <span class="kbd">servicio</span> y <span class="kbd">mensaje</span> van a columnas fijas de la base de datos.</p>
          <div data-partial="fields" data-manual>${PARTIALS.fields(s)}</div>
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('text_snippet')} Textos y comportamiento</h3>
          <div class="frow">${field('Texto del botón', bindInput('form.button', { ph: 'Enviar' }))}${field('Título por defecto', bindInput('form.title'))}</div>
          <div class="frow">${field('Título de agradecimiento', bindInput('form.successTitle'))}${field('Mensaje de agradecimiento', bindInput('form.successText'))}</div>
          <div class="row between card flat" style="padding:12px"><div><b class="small">Abrir WhatsApp después de enviar</b><div class="tiny muted">El visitante continúa la conversación con el mensaje "Hola, soy [nombre]..."</div></div>${sw(f.redirectWa, 'toggle-bind', 'data-path="form.redirectWa"')}</div>
        </div>
        <div class="card pad-lg stack">
          <div class="row between"><h3 style="font-size:17px">${ic('verified_user')} Autorización de datos personales</h3>${sw(f.consent.enabled, 'toggle-bind', 'data-path="form.consent.enabled"')}</div>
          ${field('Texto de la casilla', bindArea('form.consent.text', '', 2))}
          ${field('Política de tratamiento de datos', bindArea('form.consent.policy', '', 5), 'Se abre desde el enlace "Ver política" y desde el pie de página.')}
        </div>
        <div class="card pad-lg stack">
          <h3 style="font-size:17px">${ic('alt_route')} Destinos de los datos</h3>
          <p class="small muted">En la <b>vista en vivo</b> los leads llegan a la base de datos del simulador. En el <b>enlace público</b> viajan a los destinos que actives aquí. Si abres el enlace en este mismo navegador, también aparecen en tu base de datos.</p>
          <div class="dest card flat"><div class="avatar" style="background:var(--primary-c)">${ic('database')}</div><div class="grow"><div class="row between"><b>Base de datos del simulador</b><span class="chip green">Siempre activo</span></div><p class="small muted">Tabla, embudo de ventas y exportación a Excel en "Base de Datos (Leads)".</p></div></div>
          <div class="dest card flat"><div class="avatar" style="background:#0f9d58">${ic('table_view')}</div><div class="grow stack" style="gap:8px"><div class="row between"><b>Google Sheets (nube de la coordinación)</b>${sw(d.sheets.enabled, 'toggle-bind', 'data-path="form.destinations.sheets.enabled"')}</div>
            <p class="small muted">Cada lead se guarda como una fila en la Hoja de cálculo de la coordinación o del instructor. Requiere instalar el script de Nube & Coordinación.</p>
            ${bindInput('form.destinations.sheets.url', { ph: 'https://script.google.com/macros/s/.../exec' })}
            <div class="row">${cfg.nubeUrl && cfg.nubeUrl !== d.sheets.url ? `<button class="btn btn-sm btn-soft" data-a="use-cloud">${ic('link', 'sm')} Usar la nube configurada</button>` : ''}<button class="btn btn-sm btn-soft" data-a="test-sheets">${ic('send', 'sm')} Enviar lead de prueba</button><button class="btn btn-sm btn-ghost" data-a="go" data-route="nube">${ic('help', 'sm')} Cómo instalar</button></div></div></div>
          <div class="dest card flat"><div class="avatar" style="background:#6a2ea0">${ic('webhook')}</div><div class="grow stack" style="gap:8px"><div class="row between"><b>Webhook (Make, Zapier, n8n, CRM)</b>${sw(d.webhook.enabled, 'toggle-bind', 'data-path="form.destinations.webhook.enabled"')}</div>
            <p class="small muted">Envía el lead por POST a cualquier URL. Útil para conectar un CRM, Google Contacts o un flujo de correo automático. Pruébalo con webhook.site.</p>
            <div class="row" style="flex-wrap:nowrap">${bindInput('form.destinations.webhook.url', { ph: 'https://hook.make.com/...' })}<select class="select" data-bind="form.destinations.webhook.format" style="max-width:150px">${opts([['form', 'Formulario'], ['json', 'JSON']], d.webhook.format)}</select></div></div></div>
          <div class="dest card flat"><div class="avatar" style="background:#1d3f8f">${ic('mail')}</div><div class="grow stack" style="gap:8px"><div class="row between"><b>Aviso por correo (FormSubmit)</b>${sw(d.email.enabled, 'toggle-bind', 'data-path="form.destinations.email.enabled"')}</div>
            <p class="small muted">Servicio gratuito sin registro. El primer envío llega como correo de activación: ábrelo y confirma para recibir los siguientes.</p>
            ${bindInput('form.destinations.email.to', { type: 'email', ph: 'ventas@empresa.co' })}</div></div>
        </div>
      </div>
      <div class="stack">
        <div class="card" style="position:sticky;top:84px"><div class="card-h"><h3>Vista previa del formulario</h3><button class="btn btn-sm btn-ghost" data-a="go" data-route="vista">${ic('science', 'sm')} Probar</button></div><iframe class="form-prev" id="form-prev" title="Vista previa del formulario" sandbox="allow-scripts allow-popups allow-modals"></iframe></div>
      </div>
    </div>`;
  };

  PARTIALS.fields = (s) => `<div class="fld-list" data-dropzone="fld">${s.form.fields.map((fd, i) => {
    const t = SV.FIELD_TYPES.find((x) => x[0] === fd.type) || SV.FIELD_TYPES[0];
    const open = App.ui.openFld === i;
    const std = SV.STD_KEYS.includes(fd.key);
    return `<div class="fld-row ${open ? 'open' : ''}" data-drag="fld:${i}">
      <div class="fld-h" draggable="true" data-drag="fld:${i}" data-a="toggle-fld" data-i="${i}">${ic('drag_indicator', 'grip')}${ic(t[2], 'ok-t')}<div class="grow"><b>${esc(fd.label)}</b>${fd.required ? ' <span class="req">*</span>' : ''}<small>${esc(t[1])} · clave: ${esc(fd.key)}${std ? ' (columna fija)' : ''}</small></div>
        <button class="icon-btn" title="Subir" data-a="fld-move" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''}>${ic('arrow_upward')}</button><button class="icon-btn danger" title="Eliminar" data-a="fld-del" data-i="${i}">${ic('delete')}</button>${ic(open ? 'expand_less' : 'expand_more', 'muted')}</div>
      ${open ? `<div class="fld-b">
        <div class="frow">${field('Etiqueta', `<input class="input" data-fld="${i}.label" value="${esc(fd.label)}">`)}${field('Tipo', `<select class="select" data-fld="${i}.type" data-rerender="1">${opts(SV.FIELD_TYPES.map((x) => [x[0], x[1]]), fd.type)}</select>`)}</div>
        <div class="frow">${field('Clave (columna en la base de datos)', `<input class="input mono" data-fld="${i}.key" value="${esc(fd.key)}">`, 'Minúsculas sin espacios.')}${field(fd.type === 'hidden' ? 'Valor fijo' : 'Texto de ayuda (placeholder)', `<input class="input" data-fld="${i}.placeholder" value="${esc(fd.placeholder || '')}">`)}</div>
        ${['select', 'radio', 'checkbox'].includes(fd.type) ? field('Opciones (una por línea)', `<textarea class="textarea" rows="4" data-fld="${i}.options">${esc((fd.options || []).join('\n'))}</textarea>`) : ''}
        <div class="row between"><label class="check"><input type="checkbox" data-fld="${i}.required" ${fd.required ? 'checked' : ''}> Obligatorio</label><div class="pill-seg">${[['full', 'Ancho completo'], ['half', 'Media columna']].map(([v, l]) => `<button class="${(fd.width || 'full') === v ? 'on' : ''}" data-a="fld-width" data-i="${i}" data-v="${v}">${l}</button>`).join('')}</div></div>
      </div>` : ''}
    </div>`;
  }).join('')}</div>`;

  const formPreviewProject = (s) => Object.assign({}, s, { blocks: [SV.makeBlock('form', { layout: 'center', eyebrow: '', title: s.form.title || 'Formulario', text: '', bullets: [], showContact: false }, { variant: 'soft', pad: 's' })], wa: Object.assign({}, s.wa, { enabled: false }) });
  const refreshFormPreview = U.debounce(() => { const f = $('#form-prev'); if (f && App.s) f.srcdoc = SV.renderLanding(formPreviewProject(App.s), { mode: 'demo' }); }, 350);
  AFTER.formulario = () => refreshFormPreview();

  /* ---------------- Vista en vivo ---------------- */
  VIEWS.vista = (s) => {
    const d = App.ui.device;
    return `
    <div class="preview-bar">
      <div class="row"><span class="chip solid"><i class="d"></i>Simulador en vivo</span><span class="small muted hide-sm">Vista del visitante · los datos del formulario llegan a tu base de datos</span></div>
      <div class="row"><div class="seg">${[['desktop', 'desktop_windows', 'Escritorio'], ['tablet', 'tablet', 'Tableta'], ['mobile', 'smartphone', 'Móvil']].map(([k, i, l]) => `<button class="${d === k ? 'on' : ''}" data-a="device" data-d="${k}">${ic(i, 'sm')}<span class="hide-sm">${l}</span></button>`).join('')}</div>
      <button class="btn btn-soft btn-sm" data-a="reload-preview" title="Recargar con los últimos cambios">${ic('refresh', 'sm')}</button><button class="btn btn-soft btn-sm" data-a="open-preview-tab">${ic('open_in_new', 'sm')} Pestaña nueva</button><button class="btn btn-soft btn-sm" data-a="go" data-route="editor">${ic('design_services', 'sm')} Editor</button><button class="btn btn-primary btn-sm" data-a="go" data-route="publicar">${ic('rocket_launch', 'sm')} Publicar</button></div>
    </div>
    <div class="didactic"><div class="l"><div class="ico">${ic('school')}</div><div><h4>Ejercicio de captación</h4><p class="small">Actúa como un cliente potencial: navega, haz clic en WhatsApp y deja tus datos en el formulario. Registra al menos 3 interesados con servicios diferentes y revisa la conversión.</p></div></div><div class="row" style="gap:20px" data-partial="kpis">${PARTIALS.kpis(s)}</div></div>
    <div class="frame-wrap" id="frame-wrap" style="max-width:${d === 'mobile' ? '400px' : d === 'tablet' ? '820px' : '100%'}">
      <div class="frame-chrome"><i></i><i></i><i></i><div class="url">${ic('lock', 'sm')} ${esc(SV.publicBase() || 'https://')}ver.html</div></div>
      <iframe class="store-frame" id="lp-preview" title="Vista previa de la landing" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-modals allow-forms"></iframe>
    </div>
    <div class="grid g-side mt">
      <div class="card"><div class="card-h"><h3>${ic('monitoring')} Eventos en vivo (analítica y píxel simulados)</h3><button class="btn btn-sm btn-ghost" data-a="reset-analytics">Reiniciar</button></div><div data-partial="events">${PARTIALS.events(s)}</div></div>
      <div class="card"><div class="card-h"><h3>${ic('person_add')} Últimos leads</h3><button class="btn btn-sm btn-ghost" data-a="go" data-route="leads">Ver base de datos</button></div><div data-partial="lastleads">${PARTIALS.lastleads(s)}</div></div>
    </div>`;
  };
  PARTIALS.kpis = (s) => { const a = s.analytics; const conv = a.view ? (s.leads.length / a.view) * 100 : 0; return [['Visitas', a.view || 0], ['Clics WhatsApp', a.whatsapp || 0], ['Leads', s.leads.length], ['Conversión', U.pct(conv)]].map(([k, v]) => `<div class="kp"><small>${k}</small><b>${v}</b></div>`).join(''); };
  PARTIALS.events = (s) => {
    const a = s.analytics;
    const evs = App.ui.liveEvents;
    const names = { view: 'Visita a la página', form_start: 'Inició el formulario', lead: 'Lead registrado', whatsapp: 'Clic en WhatsApp', cta: 'Clic en botón', call: 'Clic en llamar', social: 'Clic en red social' };
    return `<div class="ev-counts" style="grid-template-columns:repeat(3,1fr)">${[['view', 'Visitas'], ['form_start', 'Iniciaron formulario'], ['lead', 'Enviaron formulario'], ['whatsapp', 'Clics WhatsApp'], ['cta', 'Clics en botones'], ['call', 'Clics llamar']].map(([k, l]) => `<div><b>${a[k] || 0}</b><small>${l}</small></div>`).join('')}</div>
      <div class="events mt-s">${evs.length ? evs.map((e) => `<div>${ic({ lead: 'person_add', whatsapp: 'chat', form_start: 'edit_note', view: 'visibility', call: 'call' }[e.event] || 'bolt', 'sm ok-t')}<span class="grow">${esc(names[e.event] || e.event)}${e.detail ? ' · ' + esc(e.detail) : ''}</span><span class="tiny muted">${esc(U.timeAgo(e.at))}</span></div>`).join('') : '<p class="small muted">Interactúa con la landing para ver los eventos.</p>'}</div>`;
  };
  PARTIALS.lastleads = (s) => (s.leads.length ? `<div class="log">${s.leads.slice(0, 6).map((l) => `<div>${ic('person', 'ok-t')}<span class="grow"><b>${esc(l.data.nombre || 'Sin nombre')}</b> · ${esc(l.data.servicio || l.interes || '')}</span><span class="tiny muted">${esc(U.timeAgo(l.at))}</span></div>`).join('')}</div>` : '<div class="empty" style="padding:16px">' + ic('inbox') + '<p class="small">Aún no hay leads. Llena el formulario de la vista previa.</p></div>');
  AFTER.vista = (s) => {
    const f = $('#lp-preview');
    if (f) f.srcdoc = SV.renderLanding(s, { mode: 'preview', search: '?utm_source=simulador&utm_medium=vista-previa' });
    if (!s.progress.previewVisited) { s.progress.previewVisited = true; App.commit(null); }
  };

  /* ---------------- Publicar & Compartir ---------------- */
  VIEWS.publicar = (s) => {
    const list = checklist(s);
    const score = scoreOf(list);
    const reqOk = list.filter((c) => c.req).every((c) => c.ok);
    const p = s.published;
    const stale = p && s.updatedAt > p.at + 3000;
    const base = SV.publicBase();
    const cfg = SV.config();
    const cloudUrl = s.form.destinations.sheets.url || cfg.nubeUrl;
    return `
    <div class="page-head">
      <div><span class="eyebrow">${ic('school', 'sm')} Módulo didáctico • Lanzamiento</span><h1>Publicar & Compartir</h1><p class="lead">Cumple el checklist, publica y comparte el enlace de tu landing por WhatsApp, redes o en tus anuncios de Meta y TikTok.</p></div>
    </div>
    <div class="grid g-side">
      <div class="card">
        <div class="card-h"><h3>Checklist de calidad</h3><span class="chip ${reqOk ? 'green' : 'amber'}">${reqOk ? 'Lista para publicar' : 'Faltan requisitos'}</span></div>
        <div class="stack" style="gap:8px">${list.map((c) => `<div class="check-item ${c.ok ? 'ok' : c.req ? 'no' : 'opt'}"><div class="st">${ic(c.ok ? 'check' : c.req ? 'close' : 'priority_high', 'sm')}</div><div class="grow"><b>${esc(c.t)} ${c.req ? '' : '<span class="chip gray" style="font-size:10px;padding:1px 7px">Opcional</span>'}</b><small>${esc(c.d)}</small></div>${c.ok ? '' : `<button class="btn btn-sm btn-ghost" data-a="go" data-route="${c.route}" data-tab="${c.tab || ''}">Resolver</button>`}</div>`).join('')}</div>
      </div>
      <div class="stack">
        <div class="card">
          <div class="score-ring" style="background:conic-gradient(var(--primary-c) ${score * 3.6}deg, var(--s) 0)"><div><b>${score}%</b><small class="muted">Calidad</small></div></div>
          <p class="small muted" style="text-align:center;margin:12px 0">${p ? `Publicada: versión ${p.version} · ${esc(U.fmtDate(p.at))}` : 'Aún sin publicar'}${stale ? '<br><span class="warn-t b">Tienes cambios sin publicar</span>' : ''}</p>
          <button class="btn btn-primary btn-lg btn-block" data-a="publish" ${reqOk ? '' : 'disabled'}>${ic('rocket_launch')} ${p ? 'Actualizar publicación (v' + (p.version + 1) + ')' : 'Publicar landing page'}</button>
          ${reqOk ? '' : '<p class="tiny muted mt-s" style="text-align:center">Completa los requisitos obligatorios para publicar.</p>'}
        </div>
        ${!base ? `<div class="card stack"><h3 style="font-size:15px">${ic('link_off')} Falta la dirección pública</h3><p class="small muted">Abriste la versión portable. Indica la dirección web donde está publicada la app (ver.html) para armar el enlace.</p>${field('Dirección pública de la app', `<input class="input" id="base-input" placeholder="https://usuario.github.io/SENAVENTAS/landing/">`)}<button class="btn btn-soft" data-a="save-base">${ic('save')} Guardar dirección</button></div>` : ''}
      </div>
    </div>
    ${p ? `
    <div class="grid g2 mt">
      <div class="card stack">
        <div class="card-h" style="margin:0"><h3>${ic('link')} Enlace directo</h3><span class="chip green">Funciona sin nube</span></div>
        <p class="small muted">La landing completa viaja comprimida dentro del enlace. Ábrelo en cualquier celular o computador. Si cambias algo, vuelve a publicar y comparte el nuevo enlace.</p>
        <div data-partial="directlink" data-manual>${PARTIALS.directlink(s)}</div>
      </div>
      <div class="card stack">
        <div class="card-h" style="margin:0"><h3>${ic('cloud')} Enlace corto en la nube</h3>${s.cloud.cloudLink ? '<span class="chip green">Conectado</span>' : '<span class="chip gray">Opcional</span>'}</div>
        <p class="small muted">Con la nube de la coordinación el enlace es corto, sirve para códigos QR y siempre muestra la última versión publicada.</p>
        ${s.cloud.cloudLink ? `<div class="link-box"><span>${esc(s.cloud.cloudLink)}</span><button class="icon-btn" data-a="copy" data-text="${esc(s.cloud.cloudLink)}" title="Copiar">${ic('content_copy')}</button><a class="icon-btn" href="${esc(s.cloud.cloudLink)}" target="_blank" rel="noopener" title="Abrir">${ic('open_in_new')}</a></div>
          <div class="row" style="align-items:flex-start;flex-wrap:nowrap"><div class="qr"><img alt="Código QR" src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(s.cloud.cloudLink)}" onerror="this.parentNode.innerHTML='<span class=&quot;tiny muted&quot; style=&quot;padding:8px;text-align:center&quot;>QR disponible con conexión</span>'"></div><div class="stack small" style="gap:6px"><a class="btn btn-soft btn-sm" href="https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&margin=20&format=png&data=${encodeURIComponent(s.cloud.cloudLink)}" target="_blank" rel="noopener">${ic('qr_code_2', 'sm')} QR en alta resolución</a><a class="btn btn-soft btn-sm" href="https://wa.me/?text=${encodeURIComponent(s.client.name + ': ' + s.cloud.cloudLink)}" target="_blank" rel="noopener">${ic('share', 'sm')} Compartir por WhatsApp</a></div></div>`
        : `<p class="small">${cloudUrl ? 'La nube está configurada. Pulsa "Publicar" para subir esta versión.' : 'Configura la nube en "Nube & Coordinación" para obtener el enlace corto.'}</p>${cloudUrl ? `<button class="btn btn-soft" data-a="publish-cloud">${ic('cloud_upload')} Subir a la nube ahora</button>` : `<button class="btn btn-soft" data-a="go" data-route="nube">${ic('cloud')} Configurar nube</button>`}`}
      </div>
    </div>` : ''}
    <div class="grid g2 mt">
      <div class="card stack">
        <h3>${ic('folder_zip')} Descargar el sitio</h3>
        <p class="small muted">Sube el paquete a Netlify Drop, GitHub Pages o el hosting de la empresa. Incluye los píxeles de pauta y envía los leads a los destinos configurados.</p>
        <div class="row"><button class="btn btn-primary" data-a="download-zip">${ic('folder_zip')} Paquete .zip</button><button class="btn btn-soft" data-a="download-html">${ic('html')} index.html</button><button class="btn btn-soft" data-a="open-export">${ic('open_in_new')} Abrir versión final</button></div>
      </div>
      <div class="card stack">
        <h3>${ic('assignment')} Evidencia de aprendizaje</h3>
        <p class="small muted">Informe imprimible con la ficha, la estructura de la landing, el checklist, los indicadores y los enlaces. Guárdalo como PDF desde el diálogo de impresión.</p>
        <div class="row"><button class="btn btn-soft" data-a="report">${ic('print')} Informe de evidencia</button><button class="btn btn-soft" data-a="export-session" data-id="${s.id}">${ic('download')} Proyecto .landing.json</button><button class="btn btn-soft" data-a="export-xlsx">${ic('table_view')} Leads en Excel</button></div>
      </div>
    </div>
    ${(s.publishHistory || []).length ? `<div class="card mt"><div class="card-h"><h3>Historial de publicaciones</h3></div><div class="log">${s.publishHistory.map((h) => `<div>${ic('public', 'ok-t')}<span class="grow">Versión ${h.version} · ${h.blocks} bloques · calidad ${h.score}%${h.cloud ? ' · en la nube' : ''}</span><span class="tiny muted">${esc(U.fmtDate(h.at))}</span></div>`).join('')}</div></div>` : ''}`;
  };
  PARTIALS.directlink = (s) => {
    const link = App.ui.links[s.id];
    if (!link) return `<p class="small muted">${ic('hourglass_top', 'sm')} Generando enlace...</p>`;
    const kb = (link.length / 1024).toFixed(1);
    return `<div class="link-box"><span>${esc(link)}</span><button class="icon-btn" data-a="copy" data-text="${esc(link)}" title="Copiar">${ic('content_copy')}</button><a class="icon-btn" href="${esc(link)}" target="_blank" rel="noopener" title="Abrir">${ic('open_in_new')}</a></div>
      <div class="row"><span class="chip ${link.length > 60000 ? 'amber' : 'gray'}">${ic('straighten', 'sm')} ${kb} KB</span><a class="btn btn-soft btn-sm" href="https://wa.me/?text=${encodeURIComponent(s.client.name + ': ' + link)}" target="_blank" rel="noopener">${ic('share', 'sm')} WhatsApp</a><button class="btn btn-soft btn-sm" data-a="copy-utm">${ic('campaign', 'sm')} Copiar con UTM</button></div>
      ${link.length > 60000 ? '<p class="tiny warn-t">El enlace es largo por las imágenes subidas desde el equipo. Usa imágenes por URL o el enlace corto de la nube.</p>' : ''}`;
  };
  AFTER.publicar = async (s) => {
    if (s.published && !App.ui.links[s.id]) {
      try { App.ui.links[s.id] = await SV.links.direct(s); } catch (e) { App.ui.links[s.id] = ''; }
      App.refreshPartials({ parts: ['directlink'] });
    }
  };

  /* ---------------- Nube & Coordinación ---------------- */
  const nubeTabs = [['conexion', 'cloud_sync', 'Conexión'], ['instalar', 'integration_instructions', 'Instalar la nube'], ['tablero', 'leaderboard', 'Tablero del grupo'], ['replicar', 'hub', 'Publicar la app']];
  VIEWS.nube = (s) => `
    <div class="page-head">
      <div><span class="eyebrow">${ic('school', 'sm')} Coordinación académica • Trabajo en la nube</span><h1>Nube & Coordinación</h1><p class="lead">Conecta una Hoja de cálculo de Google como base de datos del grupo: guarda los leads de todas las landing, genera enlaces cortos y da a instructores y coordinadores un tablero con el avance de cada aprendiz.</p></div>
    </div>
    <div class="tabs">${nubeTabs.map(([id, i, l]) => `<button class="tab ${App.ui.nubeTab === id ? 'on' : ''}" data-a="nube-tab" data-tab="${id}">${ic(i)}${l}</button>`).join('')}</div>
    ${NUBE[App.ui.nubeTab](s)}`;
  const NUBE = {};
  NUBE.conexion = (s) => {
    const cfg = SV.config();
    return `<div class="grid g-side">
      <div class="card pad-lg stack">
        <h3 style="font-size:17px">${ic('cloud_sync')} Nube de este navegador</h3>
        ${field('URL de la aplicación web (Apps Script)', `<input class="input" id="cloud-url" value="${esc(cfg.nubeUrl)}" placeholder="https://script.google.com/macros/s/.../exec">`, cfg._fromFile.nubeUrl ? 'La coordinación dejó configurada una nube en config.js.' : 'Pídela a tu instructor o instala tu propia nube en la pestaña "Instalar la nube".')}
        <div class="frow">${field('Código de clase (si la nube lo pide)', `<input class="input" id="cloud-code" value="${esc(cfg.clavePublicar)}">`)}${field('Clave de coordinación (solo instructores)', `<input class="input" id="cloud-key" type="password" value="${esc(cfg.claveCoordinacion || '')}">`)}</div>
        <div class="row"><button class="btn btn-primary" data-a="cloud-save">${ic('save')} Guardar y probar</button><button class="btn btn-soft" data-a="cloud-apply">${ic('link')} Usarla en este proyecto</button></div>
        <div data-partial="cloudstatus" data-manual><p class="small muted">${cfg.nubeUrl ? 'Pulsa "Guardar y probar" para verificar la conexión.' : 'Sin nube: todo funciona en este navegador. El enlace directo sigue siendo funcional.'}</p></div>
      </div>
      <div class="stack">
        <div class="card stack">
          <h3 style="font-size:15px">${ic('sync')} Sincronizar este proyecto</h3>
          <p class="small muted">${s.cloud.token ? 'Este proyecto está registrado en la nube. Trae los leads que dejaron los visitantes del enlace público.' : 'Publica el proyecto con la nube activa para registrarlo y poder traer sus leads.'}</p>
          <button class="btn btn-soft" data-a="sync-leads" ${s.cloud.token ? '' : 'disabled'}>${ic('cloud_download')} Traer leads de la nube</button>
          ${s.cloud.lastSync ? `<p class="tiny muted">Última sincronización: ${esc(U.fmtDate(s.cloud.lastSync))}</p>` : ''}
        </div>
        <div class="tip"><div class="ico">${ic('shield')}</div><div><h4>Seguridad</h4><p class="small">Cada proyecto recibe un token al publicarse: solo quien lo tiene lee sus leads. La clave de coordinación permite ver el tablero completo del grupo. No la compartas con los aprendices.</p></div></div>
      </div>
    </div>`;
  };
  NUBE.instalar = () => `<div class="grid g-side">
      <div class="card pad-lg stack">
        <h3 style="font-size:17px">${ic('integration_instructions')} Instalación en 6 pasos (10 minutos, gratis)</h3>
        <ol class="steps-list">
          <li>Con la cuenta de Google de la coordinación o del instructor, crea una Hoja de cálculo nueva: <a href="https://sheets.new" target="_blank" rel="noopener">sheets.new</a>.</li>
          <li>En la hoja abre <b>Extensiones → Apps Script</b>. Borra el código de ejemplo y pega el código de abajo.</li>
          <li>Cambia <span class="kbd">CLAVE_COORDINACION</span> por una clave propia. Si quieres que solo tu grupo publique, escribe un código en <span class="kbd">CLAVE_PUBLICAR</span>.</li>
          <li>Pulsa <b>Implementar → Nueva implementación</b>, elige el tipo <b>Aplicación web</b>, "Ejecutar como: Yo" y "Quién tiene acceso: Cualquier usuario".</li>
          <li>Autoriza los permisos de Google (Configuración avanzada → Ir al proyecto) y copia la URL que termina en <span class="kbd">/exec</span>.</li>
          <li>Pégala en la pestaña <b>Conexión</b> y compártela con el grupo, o déjala fija para todos en el archivo <span class="kbd">config.js</span>.</li>
        </ol>
        <div class="row between"><b class="small">Código de Google Apps Script</b><div class="row"><button class="btn btn-sm btn-soft" data-a="copy-script">${ic('content_copy', 'sm')} Copiar código</button><button class="btn btn-sm btn-soft" data-a="download-script">${ic('download', 'sm')} Descargar .gs</button></div></div>
        <pre class="code" style="max-height:360px">${esc(SV.APPS_SCRIPT)}</pre>
      </div>
      <div class="stack">
        <div class="tip"><div class="ico">${ic('table_view')}</div><div><h4>¿Qué crea el script?</h4><p class="small">Una hoja <b>Leads</b> con una fila por interesado (fecha, landing, aprendiz, ficha, datos del formulario, UTM y dispositivo) y una hoja <b>Paginas</b> con cada landing publicada, sus visitas y su total de leads.</p></div></div>
        <div class="tip"><div class="ico">${ic('mark_email_unread')}</div><div><h4>Notificaciones</h4><p class="small">Cambia <span class="kbd">NOTIFICAR_POR_CORREO</span> a true para recibir un correo por cada lead en la cuenta dueña de la hoja.</p></div></div>
        <div class="tip"><div class="ico">${ic('speed')}</div><div><h4>Capacidad</h4><p class="small">Una hoja soporta millones de celdas: alcanza para varios grupos. Para una regional completa crea una hoja por centro de formación.</p></div></div>
      </div>
    </div>`;
  NUBE.tablero = (s) => {
    const c = App.ui.coord;
    return `<div class="card">
      <div class="card-h"><div><h3>${ic('leaderboard')} Tablero de la coordinación</h3><p class="small muted">Landing pages publicadas en la nube, visitas y leads por aprendiz. Requiere la clave de coordinación.</p></div><div class="row"><button class="btn btn-primary btn-sm" data-a="coord-load">${ic('refresh', 'sm')} Cargar tablero</button>${c ? `<button class="btn btn-soft btn-sm" data-a="coord-xlsx">${ic('table_view', 'sm')} Excel del grupo</button>` : ''}</div></div>
      ${c ? `<div class="grid g4 mb">${[['Landing publicadas', c.paginas.length, 'web'], ['Aprendices', new Set(c.paginas.map((p) => p.aprendiz)).size, 'groups'], ['Visitas', c.paginas.reduce((a, p) => a + (Number(p.visitas) || 0), 0), 'visibility'], ['Leads', c.paginas.reduce((a, p) => a + (Number(p.leads) || 0), 0), 'person_add']].map(([l, v, i]) => `<div class="kpi" style="min-height:0"><div class="kpi-h"><span>${l}</span>${ic(i)}</div><div class="kpi-v">${v}</div></div>`).join('')}</div>
      <div class="tbl-wrap"><table class="tbl cards"><thead><tr><th>Aprendiz</th><th>Ficha</th><th>Landing</th><th>Empresa</th><th class="r">Visitas</th><th class="r">Leads</th><th class="r">Conversión</th><th>Actualizada</th><th></th></tr></thead><tbody>
      ${c.paginas.map((p) => `<tr><td class="td-head" data-label="Aprendiz"><b>${esc(p.aprendiz)}</b></td><td data-label="Ficha">${esc(p.ficha)}</td><td data-label="Landing">${esc(p.landing)}</td><td data-label="Empresa">${esc(p.empresa)}</td><td class="r" data-label="Visitas">${esc(p.visitas)}</td><td class="r" data-label="Leads">${esc(p.leads)}</td><td class="r" data-label="Conversión">${U.pct(Number(p.visitas) ? Number(p.leads) / Number(p.visitas) * 100 : 0)}</td><td data-label="Actualizada">${esc(p.actualizada ? U.fmtDate(Date.parse(p.actualizada)) : '')}</td><td class="td-actions"><a class="btn btn-sm btn-soft" target="_blank" rel="noopener" href="${esc(SV.links.cloud({ id: p.id }, null, SV.config().nubeUrl))}">${ic('open_in_new', 'sm')} Ver</a></td></tr>`).join('') || '<tr><td colspan="9" class="td-empty"><div class="empty">Aún no hay landing publicadas en esta nube.</div></td></tr>'}
      </tbody></table></div>` : `<div class="empty">${ic('lock')}<p>Guarda la URL de la nube y la clave de coordinación en la pestaña Conexión y pulsa "Cargar tablero".</p></div>`}
    </div>`;
  };
  NUBE.replicar = () => `<div class="grid g2">
      <div class="card pad-lg stack">
        <h3 style="font-size:17px">${ic('hub')} Publicar la app para toda la coordinación</h3>
        <ol class="steps-list small">
          <li>Crea una copia (fork) del repositorio del simulador en la cuenta de GitHub de la coordinación.</li>
          <li>Edita <span class="kbd">landing/config.js</span>: escribe la URL de la nube en <span class="kbd">nubeUrl</span> y la dirección pública en <span class="kbd">basePublica</span>.</li>
          <li>En GitHub abre <b>Settings → Pages</b> y en <i>Source</i> elige <b>GitHub Actions</b>. El flujo incluido publica la app en minutos.</li>
          <li>Comparte con los aprendices la dirección <span class="kbd">https://usuario.github.io/repositorio/landing/</span>. Todos quedan conectados a la misma nube.</li>
        </ol>
        <div class="tip" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('bolt', 'sm')}</div><p class="small">Alternativa sin GitHub: arrastra la carpeta <span class="kbd">landing</span> a <a href="https://app.netlify.com/drop" target="_blank" rel="noopener">Netlify Drop</a>.</p></div>
      </div>
      <div class="card pad-lg stack">
        <h3 style="font-size:17px">${ic('lan')} Otras formas de trabajo</h3>
        <div class="check-item ok"><div class="st">${ic('public', 'sm')}</div><div><b>En la nube (recomendada)</b><small>La app vive en GitHub Pages o Netlify. Los enlaces de las landing funcionan en cualquier celular.</small></div></div>
        <div class="check-item ok"><div class="st">${ic('install_desktop', 'sm')}</div><div><b>Instalada en el escritorio</b><small>Desde Chrome o Edge: botón "Instalar app". Funciona sin conexión.</small></div></div>
        <div class="check-item ok"><div class="st">${ic('description', 'sm')}</div><div><b>Portable (un archivo)</b><small>Inicio → Descargar versión portable. Para publicar enlaces usa la dirección pública configurada.</small></div></div>
        <div class="check-item ok"><div class="st">${ic('dns', 'sm')}</div><div><b>Servidor del aula</b><small>Con Node.js: <span class="kbd">npm start</span> dentro de la carpeta landing. Los aprendices entran con la IP del equipo del instructor.</small></div></div>
      </div>
    </div>`;

  /* ======================================================================
     Proyectos: crear, abrir, importar y exportar
     ====================================================================== */
  const refreshSessions = App.refreshSessions = async () => { App.sessions = await SV.storage.list(); };
  const openProject = App.openProject = async (p, msg) => {
    if (App.s && App.ui.dirty) await saveNow();
    App.s = p;
    App.ui.sel = null; App.ui.liveEvents = []; App.ui.leadSel = new Set(); App.ui.openLi = {};
    await saveNow();
    await refreshSessions();
    pullInbox();
    if (msg) toast(msg);
  };

  const newFromTemplate = async (id) => {
    if (App.s && App.s.pristine && !App.s.leads.length) await SV.storage.remove(App.s.id);
    const cur = App.s ? App.s.owner : {};
    const p = SV.newProject(id, Object.assign({}, cur));
    p.progress.templateChosen = true;
    await openProject(p, 'Proyecto creado con la plantilla ' + (SV.TEMPLATES.find((t) => t.id === id) || {}).name);
    go('editor');
  };

  const buildPortable = async () => {
    const get = async (u) => { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) throw new Error(u + ' → ' + r.status); return r.text(); };
    let html = await get('index.html');
    const css = await get('assets/css/app.css');
    html = html.replace(/<link rel="stylesheet" href="assets\/css\/app\.css">/, () => '<style>\n' + css + '\n</style>');
    const scripts = Array.from(html.matchAll(/<script src="([^"]+\.js)"><\/script>/g)).map((m) => m[1]);
    for (const src of scripts) {
      const js = (await get(src)).replace(/<\/script/gi, '<\\/script');
      html = html.replace(`<script src="${src}"></script>`, () => '<script>\n' + js + '\n</script>');
    }
    const svg = await get('assets/icons/icon.svg');
    html = html.replace(/<link rel="manifest"[^>]*>\n?/, '').replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
      .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`);
    return html;
  };

  /* Abre HTML en una pestaña nueva. Con sandbox, la landing corre aislada (origen opaco) para que
     el código de las incrustaciones no pueda leer los proyectos guardados en este navegador. */
  const openBlob = App.openBlob = (html, sandbox) => {
    if (sandbox) html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(App.s ? App.s.client.name : 'Landing')}</title><style>html,body{margin:0;height:100%}iframe{position:fixed;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals" srcdoc="${esc(html)}"></iframe></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const w = window.open(url, '_blank');
    if (!w) toast('Permite las ventanas emergentes para abrir la vista', 'err');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const fileSlug = (s) => U.slug(s.client.name || s.name);

  const sitePackage = (s) => {
    const html = SV.renderLanding(s, { mode: 'export' });
    const url = (s.cloud.cloudLink || SV.publicBase() || 'https://tu-dominio.co/').replace(/ver\.html.*$/, '');
    const readme = `LANDING PAGE GENERADA CON SENA VENTAS LANDING PAGE\r\n===================================================\r\nEmpresa: ${s.client.name}\r\nResponsable: ${s.owner.name} (${s.owner.role})${s.owner.ficha ? ' · Ficha ' + s.owner.ficha : ''}\r\nVersión: ${s.published ? s.published.version : 'borrador'}\r\nFecha: ${new Date().toLocaleString('es-CO')}\r\n\r\nCONTENIDO\r\n- index.html: la landing completa (diseño, formulario, WhatsApp y píxeles).\r\n- robots.txt y sitemap.xml: archivos para buscadores.\r\n- proyecto.landing.json: respaldo para volver a editar en el simulador.\r\n\r\nDESTINOS DE LOS LEADS\r\n- Google Sheets: ${s.form.destinations.sheets.enabled ? s.form.destinations.sheets.url : 'no activo'}\r\n- Webhook: ${s.form.destinations.webhook.enabled ? s.form.destinations.webhook.url : 'no activo'}\r\n- Correo: ${s.form.destinations.email.enabled ? s.form.destinations.email.to : 'no activo'}\r\n\r\nCÓMO PUBLICARLO\r\n1. Netlify Drop: arrastra esta carpeta a https://app.netlify.com/drop\r\n2. GitHub Pages: sube los archivos a un repositorio y activa Pages.\r\n3. Hosting propio: sube los archivos a la carpeta pública (public_html).\r\n\r\nLos datos personales recogidos se rigen por la Ley 1581 de 2012.\r\n`;
    const copy = U.clone(s); copy.leads = []; copy.cloud = { token: '', lastSync: 0, cloudLink: '' };
    return U.zip([
      { name: 'index.html', data: html },
      { name: 'robots.txt', data: 'User-agent: *\nAllow: /\n' },
      { name: 'sitemap.xml', data: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${U.esc(url)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url></urlset>\n` },
      { name: 'proyecto.landing.json', data: JSON.stringify(copy, null, 2) },
      { name: 'LEEME.txt', data: readme }
    ]);
  };

  /* Trae los leads y eventos que llegaron desde el enlace público en este mismo navegador. */
  const pullInbox = App.pullInbox = () => {
    const s = App.s; if (!s) return;
    const incoming = SV.inbox.take(s.id);
    const stats = SV.inbox.takeStats(s.id);
    let added = 0;
    incoming.forEach((l) => { if (App.addLead(l, l.source || 'enlace público', true)) added++; });
    Object.keys(stats).forEach((k) => { s.analytics[k] = (s.analytics[k] || 0) + stats[k]; });
    if (added || Object.keys(stats).length) {
      App.commit(added ? added + ' lead(s) recibidos desde el enlace público' : null, { render: ['leads', 'vista', 'inicio'].includes(App.route) });
      if (added) toast(added + ' nuevo(s) lead(s) desde el enlace público', 'ok', 'person_add');
    }
  };

  /* ======================================================================
     Acciones (delegación de eventos)
     ====================================================================== */
  A['go'] = (el) => go(el.dataset.route, el.dataset.tab);
  A['open-side'] = () => document.body.classList.add('side-open');
  A['close-side'] = () => document.body.classList.remove('side-open');
  A['close-overlay'] = () => App.closeOverlay();
  A['close-popover'] = () => { const p = $('.popover'); if (p) p.remove(); };
  A['save-now'] = async () => { await saveNow(); toast('Proyecto guardado en este navegador', 'ok', 'cloud_done'); };
  A['copy'] = (el) => copy(el.dataset.text);
  A['install'] = async () => {
    if (!App.installPrompt) { toast('Usa el menú del navegador: Instalar SENA VENTAS LANDING PAGE', 'ok', 'install_desktop'); return; }
    App.installPrompt.prompt();
    await App.installPrompt.userChoice;
    App.installPrompt = null;
    $('#install-btn').classList.add('hide');
  };
  A['portable'] = async (el) => {
    el.disabled = true;
    try { U.download('senaventas-landing-portable.html', await buildPortable(), 'text/html'); toast('Versión portable descargada'); }
    catch (e) { toast('No se pudo generar: ' + e.message, 'err'); }
    el.disabled = false;
  };
  A['help'] = () => App.modal({
    title: 'Guía rápida de SENA VENTAS LANDING PAGE', wide: true,
    body: `<div class="grid g2"><div class="stack"><ol class="steps-list small">
      <li><b>Brief:</b> datos de la empresa cliente y tu ficha (Diseño & Marca → Empresa cliente).</li>
      <li><b>Plantilla:</b> escoge Inmobiliaria, Salud, Obra civil, Refrigeración o Desde cero.</li>
      <li><b>Editor Visual:</b> arrastra bloques, cambia textos, imágenes, fondos y el orden de las secciones.</li>
      <li><b>Formulario:</b> define los campos, la autorización de datos y los destinos (Sheets, webhook, correo).</li>
      <li><b>WhatsApp:</b> conecta el número o el enlace de WhatsApp Business.</li>
      <li><b>Prueba:</b> en Vista en Vivo deja datos como cliente. Revisa la Base de Datos y descarga el Excel.</li>
      <li><b>Publica:</b> cumple el checklist, comparte el enlace y descarga el paquete del sitio.</li></ol></div>
      <div class="stack small"><div class="card flat"><b>¿Dónde se guarda mi trabajo?</b><p class="muted">En este navegador, dentro del espacio de tu usuario, con guardado automático. Nadie más ve tus proyectos. Al terminar cierra sesión. Para cambiar de equipo exporta el proyecto (.landing.json) desde Inicio.</p></div>
      <div class="card flat"><b>¿El enlace funciona de verdad?</b><p class="muted">Sí. El enlace directo contiene la landing completa y abre en cualquier dispositivo. Los datos que dejen los visitantes llegan a la nube, al webhook o al correo que configures.</p></div>
      <div class="card flat"><b>Atajos</b><p class="muted"><span class="kbd">Ctrl</span> + <span class="kbd">S</span> guardar · <span class="kbd">Supr</span> eliminar bloque seleccionado · <span class="kbd">Esc</span> cerrar paneles</p></div></div></div>`
  });
  A['activity'] = () => {
    const old = $('.popover'); if (old) { old.remove(); return; }
    App.ui.unseen = 0; renderChrome();
    const p = document.createElement('div');
    p.className = 'popover';
    p.innerHTML = `<div class="row between" style="margin-bottom:8px"><b>Actividad del proyecto</b><button class="icon-btn" data-a="close-popover">${ic('close', 'sm')}</button></div><div class="act-list">${App.s.activity.slice(0, 40).map((a) => `<div>${ic('bolt', 'sm ok-t')}<span>${esc(a.text)}<small>${esc(U.timeAgo(a.at))}</small></span></div>`).join('') || '<p class="muted small">Sin actividad.</p>'}</div>`;
    document.body.appendChild(p);
  };
  A['edit-owner'] = () => go('marca', 'empresa');
  const leave = () => { location.replace(location.href.split('#')[0]); };
  A['logout'] = async () => {
    const s = App.s;
    const root = App.modal({
      title: 'Cerrar sesión',
      body: `<p>Tu trabajo queda guardado con tu usuario <b>${esc(App.user.username)}</b> en este equipo. La pantalla se limpia para el siguiente estudiante.</p><div class="tip" style="padding:12px"><div class="ico" style="width:32px;height:32px">${ic('download', 'sm')}</div><p class="small">¿Vas a seguir en otro equipo? Descarga el respaldo (.landing.json) y luego impórtalo desde Inicio con tu usuario.</p></div>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-soft" data-role="backup">${ic('download')} Descargar respaldo y salir</button><button class="btn btn-primary" data-role="out">${ic('logout')} Cerrar sesión</button>`
    });
    const out = async (backup) => {
      if (backup) U.download(U.slug(s.name) + '.landing.json', JSON.stringify(s, null, 2), 'application/json');
      await saveNow();
      SV.auth.logout();
      setTimeout(leave, backup ? 600 : 0);
    };
    root.querySelector('[data-role=backup]').addEventListener('click', () => out(true));
    root.querySelector('[data-role=out]').addEventListener('click', () => out(false));
  };
  A['delete-account'] = async () => {
    if (!(await App.confirm('Eliminar mi usuario y mis datos', `Se borran el usuario <b>${esc(App.user.username)}</b>, sus proyectos y sus leads de este equipo. Esta acción no se puede deshacer. Descarga antes tus respaldos si los necesitas.`, { ok: 'Eliminar todo', danger: true }))) return;
    await SV.storage.wipe();
    SV.auth.remove(App.user.id);
    leave();
  };

  /* Proyectos */
  A['new-from-tpl'] = (el) => newFromTemplate(el.dataset.id);
  A['apply-tpl'] = async (el) => {
    const t = SV.TEMPLATES.find((x) => x.id === el.dataset.id);
    if (!(await App.confirm('Aplicar plantilla ' + t.name, 'Se reemplazan los bloques, colores, textos, formulario y WhatsApp del proyecto abierto. Se conservan tu ficha, los leads y el historial.', { ok: 'Aplicar plantilla' }))) return;
    const s = App.s;
    const fresh = SV.newProject(t.id, s.owner);
    ['client', 'social', 'theme', 'blocks', 'form', 'wa', 'seo'].forEach((k) => { s[k] = fresh[k]; });
    s.templateId = t.id;
    s.progress.templateChosen = true;
    s.pristine = false;
    App.ui.sel = null;
    App.commit('Plantilla aplicada: ' + t.name, { render: true });
    toast('Plantilla aplicada. Personalízala en el Editor Visual.');
  };
  A['demo-tpl'] = (el) => {
    const t = SV.TEMPLATES.find((x) => x.id === el.dataset.id);
    const root = App.modal({ title: 'Demo: ' + esc(t.name), sub: esc(t.tag), wide: true, body: '<iframe class="demo-frame" title="Demo" sandbox="allow-scripts allow-popups allow-modals allow-forms"></iframe>', foot: `<button class="btn btn-soft" data-a="close-overlay">Cerrar</button><button class="btn btn-primary" data-a="new-from-tpl" data-id="${t.id}">${ic('add')} Crear proyecto con esta plantilla</button>` });
    root.querySelector('iframe').srcdoc = SV.renderLanding(SV.newProject(t.id), { mode: 'demo' });
  };
  A['open-session'] = async (el) => {
    const data = await SV.storage.get(el.dataset.id);
    if (!data) { toast('No se encontró el proyecto', 'err'); return; }
    try { await openProject(SV.normalizeProject(data), 'Proyecto abierto: ' + data.name); go('inicio'); }
    catch (e) { toast(e.message, 'err'); }
  };
  A['dup-session'] = async (el) => {
    const data = el.dataset.id === App.s.id ? U.clone(App.s) : await SV.storage.get(el.dataset.id);
    if (!data) return;
    const copy2 = SV.normalizeProject(U.clone(data));
    copy2.id = U.uid('lp_'); copy2.name = data.name + ' (copia)'; copy2.createdAt = copy2.updatedAt = Date.now();
    copy2.published = null; copy2.publishHistory = []; copy2.cloud = { token: '', lastSync: 0, cloudLink: '' };
    await SV.storage.put(copy2);
    await refreshSessions(); render();
    toast('Proyecto duplicado');
  };
  A['del-session'] = async (el) => {
    const id = el.dataset.id;
    const x = App.sessions.find((y) => y.id === id);
    if (!(await App.confirm('Eliminar proyecto', `Se eliminará <b>${esc(x ? x.name : '')}</b> con sus leads de este navegador. Exporta un respaldo si lo necesitas.`, { ok: 'Eliminar', danger: true }))) return;
    await SV.storage.remove(id);
    await refreshSessions();
    if (id === App.s.id) {
      const next = App.sessions[0] ? await SV.storage.get(App.sessions[0].id) : null;
      App.s = next ? SV.normalizeProject(next) : freshProject(App.user);
      await saveNow(); await refreshSessions();
    }
    render();
    toast('Proyecto eliminado');
  };
  A['rename-session'] = async () => {
    const v = await App.prompt('Renombrar proyecto', 'Nombre del proyecto', App.s.name);
    if (v && v.trim()) { App.s.name = v.trim(); App.commit('Proyecto renombrado a ' + v.trim()); await saveNow(); await refreshSessions(); render(); }
  };
  A['export-session'] = async (el) => {
    const data = el.dataset.id === App.s.id ? App.s : await SV.storage.get(el.dataset.id);
    if (!data) return;
    U.download(U.slug(data.name) + '.landing.json', JSON.stringify(data, null, 2), 'application/json');
    toast('Respaldo descargado');
  };
  A['export-template'] = () => {
    const copy2 = U.clone(App.s);
    Object.assign(copy2, { leads: [], activity: [{ at: Date.now(), text: 'Plantilla de clase creada a partir de ' + App.s.name }], published: null, publishHistory: [], cloud: { token: '', lastSync: 0, cloudLink: '' }, analytics: {}, progress: { templateChosen: true }, isTemplate: true });
    copy2.owner = Object.assign({}, copy2.owner, { name: 'Aprendiz SENA', ficha: '' });
    U.download('plantilla-' + fileSlug(App.s) + '.landing.json', JSON.stringify(copy2, null, 2), 'application/json');
    toast('Plantilla de clase exportada');
  };
  A['import-session'] = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await U.readFile(f));
        const p = SV.normalizeProject(data);
        const exists = App.sessions.some((x) => x.id === p.id);
        if (exists || p.isTemplate) { p.id = U.uid('lp_'); p.cloud = { token: '', lastSync: 0, cloudLink: '' }; }
        if (p.isTemplate) { p.owner = Object.assign({}, p.owner, App.s ? { name: App.s.owner.name, ficha: App.s.owner.ficha, programa: App.s.owner.programa } : {}); delete p.isTemplate; p.name = p.client.name; }
        p.updatedAt = Date.now();
        await openProject(p, 'Proyecto importado: ' + p.name);
        go('inicio');
      } catch (e) { toast('No se pudo importar: ' + e.message, 'err'); }
    };
    inp.click();
  };

  /* Diseño & Marca */
  A['marca-tab'] = (el) => { App.ui.marcaTab = el.dataset.tab; render(); };
  A['apply-palette'] = (el) => {
    const p = SV.PALETTES[Number(el.dataset.i)];
    ['primary', 'secondary', 'accent', 'bg', 'surface', 'text', 'muted', 'dark'].forEach((k) => { App.s.theme[k] = p[k]; });
    App.commit('Paleta aplicada: ' + p.name, { render: true });
  };
  A['apply-fonts'] = (el) => {
    const f = SV.FONT_PAIRS.find((x) => x.id === el.dataset.id);
    App.s.theme.fontHead = f.head; App.s.theme.fontBody = f.body;
    loadAppFonts();
    App.commit('Tipografía: ' + f.name, { render: true });
  };
  A['set-theme'] = (el) => { App.s.theme[el.dataset.k] = el.dataset.v; App.commit(null, { render: true }); };
  A['set-wa-mode'] = (el) => { App.s.wa.mode = el.dataset.v; App.commit('WhatsApp conectado por ' + (el.dataset.v === 'link' ? 'enlace' : 'número'), { render: true }); };
  A['test-wa'] = () => { const h = SV.waHref(App.s); if (h) window.open(h, '_blank', 'noopener'); };
  A['toggle-bind'] = (el) => {
    const path = el.dataset.path;
    setPath(App.s, path, !getPath(App.s, path));
    App.commit(null, { render: true });
  };

  /* Formulario */
  A['toggle-fld'] = (el, e) => { if (e.target.closest('button')) return; const i = Number(el.dataset.i); App.ui.openFld = App.ui.openFld === i ? null : i; App.refreshPartials({ parts: ['fields'] }); };
  A['add-field'] = () => {
    App.modal({
      title: 'Agregar campo', body: `<div class="grid g2" style="gap:8px">${SV.FIELD_TYPES.map(([id, l, i]) => `<button class="step-card" data-a="add-field-type" data-t="${id}">${ic(i, 'ok-t')}<b class="grow">${esc(l)}</b></button>`).join('')}</div>
      <p class="small muted">Sugeridos: ${['Ciudad', 'Presupuesto', 'Fecha preferida', 'Cédula', 'Empresa'].map((x) => `<button class="chip" data-a="add-field-preset" data-l="${x}">${x}</button>`).join(' ')}</p>`
    });
  };
  const addField = (type, label) => {
    const s = App.s;
    let key = U.slug(label, 'campo').replace(/-/g, '_');
    while (s.form.fields.some((f) => f.key === key)) key += '_2';
    s.form.fields.push({ key, label, type, required: false, placeholder: '', width: 'full', options: ['select', 'radio', 'checkbox'].includes(type) ? ['Opción 1', 'Opción 2'] : [] });
    App.ui.openFld = s.form.fields.length - 1;
    App.closeOverlay();
    App.commit('Campo agregado: ' + label, { parts: ['fields'] });
  };
  A['add-field-type'] = (el) => { const t = SV.FIELD_TYPES.find((x) => x[0] === el.dataset.t); addField(t[0], t[1]); };
  A['add-field-preset'] = (el) => {
    const l = el.dataset.l;
    if (l === 'Presupuesto') addField('select', l);
    else if (l === 'Fecha preferida') addField('date', l);
    else if (l === 'Cédula') addField('number', l);
    else addField('text', l);
  };
  A['fld-del'] = async (el) => {
    const i = Number(el.dataset.i); const f = App.s.form.fields[i];
    if (!(await App.confirm('Eliminar campo', `¿Eliminar el campo <b>${esc(f.label)}</b>? Los leads ya guardados conservan su dato.`, { ok: 'Eliminar', danger: true }))) return;
    App.s.form.fields.splice(i, 1); App.ui.openFld = null;
    App.commit('Campo eliminado: ' + f.label, { parts: ['fields'] });
  };
  const moveFld = (from, to) => {
    const arr = App.s.form.fields;
    if (to < 0 || to >= arr.length || from === to) return;
    const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
    App.ui.openFld = null;
    App.commit(null, { parts: ['fields'] });
  };
  A['fld-move'] = (el) => { const i = Number(el.dataset.i); moveFld(i, i + Number(el.dataset.d)); };
  A['fld-width'] = (el) => { App.s.form.fields[Number(el.dataset.i)].width = el.dataset.v; App.commit(null, { parts: ['fields'] }); };
  App.DROP.fld = (kind, id, index) => { if (kind !== 'fld') return; const from = Number(id); moveFld(from, index > from ? index - 1 : index); };
  A['use-cloud'] = () => { App.s.form.destinations.sheets = { enabled: true, url: SV.config().nubeUrl }; App.commit('Formulario conectado a la nube de la coordinación', { render: true }); };
  A['test-sheets'] = async (el) => {
    const url = App.s.form.destinations.sheets.url;
    if (!SV.cloud.validUrl(url)) { toast('Escribe la URL /exec de la nube', 'err'); return; }
    el.disabled = true;
    try { await SV.cloud.testLead(url, App.s); toast('Lead de prueba guardado en la hoja. Revisa la pestaña Leads.', 'ok', 'table_view'); }
    catch (e) { toast(e.message, 'err'); }
    el.disabled = false;
  };

  /* Vista en vivo */
  A['device'] = (el) => { App.ui.device = el.dataset.d; render(); };
  A['reload-preview'] = () => AFTER.vista(App.s);
  A['open-preview-tab'] = () => openBlob(SV.renderLanding(App.s, { mode: 'demo' }), true);
  A['reset-analytics'] = () => { App.s.analytics = { view: 0, form_start: 0, lead: 0, whatsapp: 0, cta: 0, call: 0 }; App.ui.liveEvents = []; App.commit('Analítica reiniciada', { render: true }); };

  /* Publicar */
  A['publish'] = async (el) => {
    const s = App.s;
    const list = checklist(s);
    if (!list.filter((c) => c.req).every((c) => c.ok)) { toast('Completa los requisitos obligatorios', 'err'); return; }
    el.disabled = true;
    const version = s.published ? s.published.version + 1 : 1;
    s.published = { at: Date.now(), version };
    let cloudOk = false;
    const cloudUrl = s.form.destinations.sheets.url || SV.config().nubeUrl;
    if (cloudUrl && SV.cloud.validUrl(cloudUrl)) {
      try {
        const r = await SV.cloud.publish(cloudUrl, s, SV.config().clavePublicar);
        if (r.token) s.cloud.token = r.token;
        s.cloud.cloudLink = SV.links.cloud(s, null, cloudUrl);
        cloudOk = true;
      } catch (e) { toast('Nube: ' + e.message, 'err', 'cloud_off'); }
    }
    s.published.at = Date.now();
    s.publishHistory = [{ at: Date.now(), version, blocks: s.blocks.filter((b) => !b.hidden).length, score: scoreOf(list), cloud: cloudOk }].concat(s.publishHistory || []).slice(0, 20);
    try { App.ui.links[s.id] = await SV.links.direct(s); } catch (e) { App.ui.links[s.id] = ''; }
    s.updatedAt = s.published.at;
    App.commit('Landing publicada (versión ' + version + ')' + (cloudOk ? ' con enlace en la nube' : ''), { render: true });
    const link = s.cloud.cloudLink || App.ui.links[s.id];
    App.modal({
      title: '¡Landing publicada!',
      body: `<div class="empty" style="padding:10px">${ic('celebration', 'ok-t')}<p>La landing <b>${esc(s.client.name)}</b> quedó lista (versión ${version}).</p></div><div class="link-box"><span>${esc(link)}</span></div><p class="small muted">Ábrela en tu celular, compártela por WhatsApp o úsala como destino de tus anuncios. Los datos de los visitantes llegan a ${hasCloudDest(s) ? 'los destinos configurados' : 'este navegador únicamente: activa Google Sheets, webhook o correo para recibirlos desde otros equipos'}.</p>`,
      foot: `<button class="btn btn-soft" data-a="copy" data-text="${esc(link)}">${ic('content_copy')} Copiar enlace</button><a class="btn btn-primary" href="${esc(link)}" target="_blank" rel="noopener">${ic('open_in_new')} Abrir landing</a>`
    });
  };
  A['publish-cloud'] = async (el) => {
    const s = App.s; const cloudUrl = s.form.destinations.sheets.url || SV.config().nubeUrl;
    el.disabled = true;
    try {
      const r = await SV.cloud.publish(cloudUrl, s, SV.config().clavePublicar);
      if (r.token) s.cloud.token = r.token;
      s.cloud.cloudLink = SV.links.cloud(s, null, cloudUrl);
      App.commit('Landing subida a la nube', { render: true });
      toast('Enlace corto listo');
    } catch (e) { toast(e.message, 'err'); el.disabled = false; }
  };
  A['save-base'] = () => {
    const v = ($('#base-input') || {}).value || '';
    if (!/^https?:\/\//.test(v)) { toast('Escribe una dirección que empiece por https://', 'err'); return; }
    SV.saveConfig({ basePublica: v.trim() });
    toast('Dirección pública guardada');
    render();
  };
  A['copy-utm'] = async () => {
    const v = await App.prompt('Enlace con parámetros UTM', 'Fuente (utm_source)', 'facebook', { ok: 'Copiar', hint: 'Ejemplos: facebook, instagram, tiktok, google, whatsapp, volante' });
    if (!v) return;
    const link = App.ui.links[App.s.id];
    const [base, hash] = link.split('#');
    copy(base + (base.includes('?') ? '&' : '?') + 'utm_source=' + encodeURIComponent(v.trim()) + '&utm_medium=landing&utm_campaign=' + encodeURIComponent(fileSlug(App.s)) + (hash ? '#' + hash : ''), 'Enlace con UTM copiado');
  };
  A['download-html'] = () => { U.download(fileSlug(App.s) + '-index.html', SV.renderLanding(App.s, { mode: 'export' }), 'text/html'); toast('index.html descargado'); };
  A['download-zip'] = () => { U.download(fileSlug(App.s) + '-sitio.zip', sitePackage(App.s)); toast('Paquete del sitio descargado'); };
  A['open-export'] = () => openBlob(SV.renderLanding(App.s, { mode: 'export' }), true);
  A['report'] = () => {
    const s = App.s; const list = checklist(s); const sc = scoreOf(list);
    const by = (k) => { const m = {}; s.leads.forEach((l) => { const v = k(l) || 'Sin dato'; m[v] = (m[v] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
    const link = App.ui.links[s.id] || '';
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Evidencia · ${esc(s.client.name)}</title><style>body{font-family:Arial,sans-serif;color:#0b1c30;max-width:900px;margin:30px auto;padding:0 20px;font-size:13px}h1{color:#005f2e;margin:0}h2{font-size:16px;border-bottom:2px solid #007a3d;padding-bottom:4px;margin-top:26px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #cfd8dc;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eff4ff}.ok{color:#007a3d;font-weight:700}.no{color:#ba1a1a;font-weight:700}.head{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #007a3d;padding-bottom:10px}.link{word-break:break-all;font-size:11px}@media print{button{display:none}}</style></head><body>
      <div class="head"><div><h1>Evidencia de aprendizaje · Landing page</h1><div>SENA VENTAS LANDING PAGE · ${esc(new Date().toLocaleString('es-CO'))}</div></div><button onclick="print()">Imprimir / PDF</button></div>
      <h2>Aprendiz</h2><table><tr><th>Nombre</th><td>${esc(s.owner.name)}</td><th>Ficha</th><td>${esc(s.owner.ficha)}</td></tr><tr><th>Programa</th><td>${esc(s.owner.programa)}</td><th>Centro</th><td>${esc(s.owner.centro)} ${esc(s.owner.regional)}</td></tr><tr><th>Instructor</th><td colspan="3">${esc(s.owner.instructor)}</td></tr></table>
      <h2>Empresa cliente</h2><table><tr><th>Empresa</th><td>${esc(s.client.name)}</td><th>Sector</th><td>${esc(s.client.sector)}</td></tr><tr><th>Propuesta de valor</th><td colspan="3">${esc(s.client.slogan)}</td></tr><tr><th>Contacto</th><td colspan="3">${esc(s.client.phone)} · ${esc(s.client.email)} · ${esc(s.client.city)}</td></tr><tr><th>WhatsApp</th><td colspan="3">${esc(SV.waHref(s))}</td></tr></table>
      <h2>Estructura de la landing (${s.blocks.filter((b) => !b.hidden).length} bloques)</h2><table><tr><th>#</th><th>Bloque</th><th>Título</th></tr>${s.blocks.filter((b) => !b.hidden).map((b, i) => `<tr><td>${i + 1}</td><td>${esc(SV.BLOCKS[b.type].label)}</td><td>${esc(b.props.title || b.props.logoText || '')}</td></tr>`).join('')}</table>
      <h2>Formulario (${s.form.fields.length} campos)</h2><table><tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th></tr>${s.form.fields.map((f) => `<tr><td>${esc(f.label)}</td><td>${esc(f.type)}</td><td>${f.required ? 'Sí' : 'No'}</td></tr>`).join('')}</table>
      <h2>Indicadores</h2><table><tr><th>Visitas</th><td>${s.analytics.view || 0}</td><th>Leads</th><td>${s.leads.length}</td></tr><tr><th>Clics WhatsApp</th><td>${s.analytics.whatsapp || 0}</td><th>Conversión</th><td>${U.pct(s.analytics.view ? s.leads.length / s.analytics.view * 100 : 0)}</td></tr></table>
      <table><tr><th>Leads por estado</th><td>${by((l) => (SV.LEAD_STATUSES.find((x) => x.id === l.status) || {}).label).map(([k, v]) => esc(k) + ': ' + v).join('<br>')}</td><th>Leads por servicio</th><td>${by((l) => l.data.servicio || l.interes).map(([k, v]) => esc(k) + ': ' + v).join('<br>')}</td></tr></table>
      <h2>Checklist de calidad · ${sc}%</h2><table>${list.map((c) => `<tr><td class="${c.ok ? 'ok' : 'no'}">${c.ok ? 'Cumple' : 'Pendiente'}</td><td>${esc(c.t)}${c.req ? '' : ' (opcional)'}</td><td>${esc(c.d)}</td></tr>`).join('')}</table>
      <h2>Publicación</h2><table><tr><th>Versión</th><td>${s.published ? s.published.version + ' · ' + esc(U.fmtDate(s.published.at)) : 'Sin publicar'}</td></tr><tr><th>Enlace corto</th><td class="link">${esc(s.cloud.cloudLink || 'No configurado')}</td></tr><tr><th>Enlace directo</th><td class="link">${esc(link ? link.slice(0, 180) + (link.length > 180 ? '…' : '') : 'Publica para generarlo')}</td></tr></table>
      </body></html>`;
    openBlob(html);
  };

  /* Nube */
  A['nube-tab'] = (el) => { App.ui.nubeTab = el.dataset.tab; render(); };
  A['cloud-save'] = async (el) => {
    const url = ($('#cloud-url').value || '').trim();
    SV.saveConfig({ nubeUrl: url, clavePublicar: $('#cloud-code').value.trim(), claveCoordinacion: $('#cloud-key').value.trim() });
    const box = $('[data-partial="cloudstatus"]');
    if (!url) { box.innerHTML = '<p class="small muted">Nube desconectada en este navegador.</p>'; return; }
    el.disabled = true;
    box.innerHTML = `<p class="small">${ic('sync', 'sm')} Probando conexión...</p>`;
    try {
      const r = await SV.cloud.ping(url);
      box.innerHTML = `<div class="check-item ok"><div class="st">${ic('check', 'sm')}</div><div><b>Conectado a "${esc(r.hoja)}"</b><small>${r.requiereCodigo ? 'La nube pide código de clase para publicar.' : 'Publicación abierta para el grupo.'}</small></div></div>`;
      toast('Nube conectada', 'ok', 'cloud_done');
    } catch (e) {
      box.innerHTML = `<div class="check-item no"><div class="st">${ic('close', 'sm')}</div><div><b>Sin conexión</b><small>${esc(e.message)}</small></div></div>`;
    }
    el.disabled = false;
  };
  A['cloud-apply'] = () => {
    const url = ($('#cloud-url').value || '').trim();
    if (!SV.cloud.validUrl(url)) { toast('Escribe primero la URL de la nube', 'err'); return; }
    App.s.form.destinations.sheets = { enabled: true, url };
    App.commit('Proyecto conectado a la nube: los leads del enlace público llegan a Google Sheets');
    toast('Formulario conectado a la nube');
  };
  A['copy-script'] = () => copy(SV.APPS_SCRIPT, 'Código copiado. Pégalo en Apps Script.');
  A['download-script'] = () => U.download('senaventas-landing-nube.gs', SV.APPS_SCRIPT, 'text/plain');
  A['coord-load'] = async (el) => {
    const cfg = SV.config();
    if (!cfg.nubeUrl || !cfg.claveCoordinacion) { toast('Guarda la URL de la nube y la clave de coordinación en la pestaña Conexión', 'err'); return; }
    el.disabled = true;
    try { const r = await SV.cloud.summary(cfg.nubeUrl, cfg.claveCoordinacion, false); App.ui.coord = r; render(); toast('Tablero actualizado'); }
    catch (e) { toast(e.message, 'err'); el.disabled = false; }
  };
  A['coord-xlsx'] = async (el) => {
    const cfg = SV.config();
    el.disabled = true;
    try {
      const r = await SV.cloud.summary(cfg.nubeUrl, cfg.claveCoordinacion, true);
      const pages = [['ID', 'Aprendiz', 'Ficha', 'Landing', 'Empresa', 'Visitas', 'Leads', 'Conversión %', 'Creada', 'Actualizada', 'Versión']].concat(r.paginas.map((p) => [p.id, p.aprendiz, p.ficha, p.landing, p.empresa, Number(p.visitas) || 0, Number(p.leads) || 0, Number(p.visitas) ? Math.round(Number(p.leads) / Number(p.visitas) * 1000) / 10 : 0, Date.parse(p.creada) || '', Date.parse(p.actualizada) || '', Number(p.version) || 0]));
      const leads = [['Fecha', 'Aprendiz', 'Ficha', 'Landing', 'Empresa', 'Nombre', 'Teléfono', 'Correo', 'Servicio', 'Mensaje', 'Interés', 'Origen', 'utm_source', 'utm_campaign', 'Dispositivo']].concat(r.leads.map((l) => [l.at, l.aprendiz, l.ficha, l.landing, l.empresa, l.data.nombre, l.data.telefono, l.data.correo, l.data.servicio, l.data.mensaje, l.interes, l.source, (l.utm || {}).utm_source, (l.utm || {}).utm_campaign, l.device]));
      U.download('tablero-coordinacion-' + new Date().toISOString().slice(0, 10) + '.xlsx', U.xlsx([{ name: 'Landing por aprendiz', rows: pages, dateCols: [8, 9] }, { name: 'Leads del grupo', rows: leads, dateCols: [0] }], { title: 'Tablero de la coordinación' }));
      toast('Excel del grupo descargado');
    } catch (e) { toast(e.message, 'err'); }
    el.disabled = false;
  };

  /* ---------- Delegación de eventos ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a]');
    if (!el) { if (!e.target.closest('.popover') && !e.target.closest('[data-a="activity"]')) { const p = $('.popover'); if (p) p.remove(); } return; }
    const fn = A[el.dataset.a];
    if (!fn) return;
    if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href').startsWith('#/')) e.preventDefault();
    if (el.disabled) return;
    fn(el, e);
  });

  /* Entradas enlazadas al proyecto (data-bind) y a campos del formulario (data-fld) */
  const onInput = (e) => {
    const el = e.target;
    if (App.s && App.s.pristine && (el.dataset.bind || el.dataset.fld || el.dataset.bp || el.dataset.img || el.dataset.linksel)) App.s.pristine = false;
    for (const h of App.INPUT) if (h(el, e)) return;
    if (el.dataset.bind) {
      let v = el.type === 'checkbox' ? el.checked : el.value;
      if (el.dataset.type === 'number') v = v === '' ? 0 : Number(v);
      if (/^theme\.(primary|secondary|accent|bg|surface|text|muted|dark)$/.test(el.dataset.bind) && el.type !== 'color') { if (!/^#[0-9a-f]{6}$/i.test(v)) return; }
      setPath(App.s, el.dataset.bind, v);
      if (el.dataset.client) App.s.progress.clientEdited = true;
      $$(`[data-bind="${el.dataset.bind}"]`).forEach((o) => { if (o !== el && o.type !== 'checkbox') o.value = v; });
      if (el.dataset.bind === 'client.name' && !App.s.nameTouched) App.s.name = v || App.s.name;
      if (/^theme\.font/.test(el.dataset.bind)) loadAppFonts();
      if (el.dataset.rerender && e.type === 'change') { App.commit(null, { render: true }); return; }
      App.commit(null);
      if (App.route === 'formulario') refreshFormPreview();
      return;
    }
    if (el.dataset.fld) {
      const [i, k] = el.dataset.fld.split('.');
      const f = App.s.form.fields[Number(i)];
      if (!f) return;
      if (k === 'required') f.required = el.checked;
      else if (k === 'options') f.options = el.value.split('\n').map((x) => x.trim()).filter(Boolean);
      else if (k === 'key') f.key = U.slug(el.value, 'campo').replace(/-/g, '_');
      else f[k] = el.value;
      if (el.dataset.rerender && e.type === 'change') { App.commit(null, { parts: ['fields'] }); refreshFormPreview(); return; }
      App.commit(null);
      refreshFormPreview();
    }
  };
  document.addEventListener('input', (e) => { if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox' || e.target.type === 'file') return; onInput(e); });
  document.addEventListener('change', (e) => { if (e.target.type === 'file') return; onInput(e); });

  /* ---------- Arrastrar y soltar genérico ---------- */
  App.drag = null;
  document.addEventListener('dragstart', (e) => {
    const el = e.target.closest ? e.target.closest('[data-drag]') : null;
    if (!el) return;
    const [kind, id] = el.dataset.drag.split(':');
    App.drag = { kind, id, el };
    try { e.dataTransfer.setData('text/plain', 'svl:' + kind + ':' + id); e.dataTransfer.effectAllowed = 'copyMove'; } catch (x) { /* navegador sin dataTransfer */ }
    setTimeout(() => el.classList.add('dragging'), 0);
  });
  const clearInd = () => { $$('.drop-ind').forEach((x) => x.remove()); $$('.kcol.over').forEach((x) => x.classList.remove('over')); };
  const zoneFor = (e) => {
    const z = e.target.closest ? e.target.closest('[data-dropzone]') : null;
    if (!z || !App.drag) return null;
    const accepts = { blk: ['blk', 'lib'], fld: ['fld'], lead: ['lead'], li: ['li'] }[z.dataset.dropzone] || [];
    return accepts.includes(App.drag.kind) && (z.dataset.dropzone !== 'li' || z.dataset.list === App.drag.el.dataset.list) ? z : null;
  };
  const indexIn = (z, y) => {
    const kids = Array.from(z.children).filter((c) => c.hasAttribute('data-drag'));
    for (let i = 0; i < kids.length; i++) { const r = kids[i].getBoundingClientRect(); if (y < r.top + r.height / 2) return { i, before: kids[i] }; }
    return { i: kids.length, before: null };
  };
  document.addEventListener('dragenter', (e) => { if (zoneFor(e)) e.preventDefault(); });
  document.addEventListener('dragover', (e) => {
    const z = zoneFor(e);
    if (!z) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = App.drag.kind === 'lib' ? 'copy' : 'move'; } catch (x) { /* sin dataTransfer */ }
    clearInd();
    if (z.dataset.dropzone === 'lead') { z.classList.add('over'); return; }
    const { before } = indexIn(z, e.clientY);
    const ind = document.createElement('div'); ind.className = 'drop-ind';
    z.insertBefore(ind, before);
  });
  document.addEventListener('drop', (e) => {
    const z = zoneFor(e);
    if (!z) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = App.drag.kind === 'lib' ? 'copy' : 'move'; } catch (x) { /* sin dataTransfer */ }
    clearInd();
    const d = App.drag;
    const { i } = z.dataset.dropzone === 'lead' ? { i: 0 } : indexIn(z, e.clientY);
    const h = App.DROP[z.dataset.dropzone];
    App.drag = null;
    if (h) h(d.kind, d.id, i, z);
  });
  document.addEventListener('dragend', () => { clearInd(); $$('.dragging').forEach((x) => x.classList.remove('dragging')); setTimeout(() => { App.drag = null; }, 50); });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); A['save-now'](); }
    if (e.key === 'Escape') { const p = $('.popover'); if (p) p.remove(); else if (layers.length) App.closeOverlay(); else { document.body.classList.remove('side-open'); const b = $('.builder'); if (b) b.classList.remove('insp-open'); } }
  });

  /* Fuentes de la marca dentro del creador (vista previa de tipografía) */
  const loadAppFonts = App.loadAppFonts = () => {
    if (!App.s) return;
    let l = $('#brand-fonts');
    if (!l) { l = document.createElement('link'); l.id = 'brand-fonts'; l.rel = 'stylesheet'; document.head.appendChild(l); }
    const href = SV.fontsHref(App.s).text;
    if (l.getAttribute('href') !== href) l.setAttribute('href', href);
  };

  /* Mensajes de la landing en la vista en vivo (iframe) */
  window.addEventListener('message', (e) => {
    const m = e.data || {};
    if (m.source !== 'svl-landing' || !App.s) return;
    const frame = $('#lp-preview');
    if (!frame || e.source !== frame.contentWindow) return;
    const s = App.s;
    if (m.type === 'track') {
      s.analytics[m.event] = (s.analytics[m.event] || 0) + 1;
      App.ui.liveEvents.unshift({ at: Date.now(), event: m.event, detail: m.detail || '' });
      App.ui.liveEvents = App.ui.liveEvents.slice(0, 60);
      App.commit(null);
    } else if (m.type === 'lead' && m.payload) {
      const l = App.addLead(m.payload.lead, 'vista previa');
      if (l) { App.commit('Nuevo lead: ' + (l.data.nombre || 'sin nombre') + (l.data.servicio ? ' · ' + l.data.servicio : '')); toast('Nuevo lead: ' + (l.data.nombre || 'sin nombre'), 'ok', 'person_add'); }
    }
  });

  /* Leads del enlace público abierto en otra pestaña de este navegador */
  try {
    const bc = new BroadcastChannel('svl-leads');
    bc.onmessage = (ev) => { if (App.s && ev.data && ev.data.pid === App.s.id) setTimeout(pullInbox, 150); };
  } catch (e) { /* navegador antiguo */ }
  window.addEventListener('focus', () => pullInbox());
  window.addEventListener('hashchange', () => { const r = location.hash.replace(/^#\/?/, ''); if (r && r !== App.route && VIEWS[r]) go(r); });
  window.addEventListener('beforeunload', () => { if (App.ui.dirty && App.s) SV.storage.put(App.s); });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); App.installPrompt = e; $('#install-btn').classList.remove('hide'); if (App.route === 'inicio') render(); });
  window.addEventListener('appinstalled', () => { App.installPrompt = null; $('#install-btn').classList.add('hide'); toast('SENA VENTAS LANDING PAGE quedó instalada en tu equipo', 'ok', 'install_desktop'); });

  /* ======================================================================
     Arranque
     ====================================================================== */
  const watchIconFont = (doc) => {
    const root = doc.documentElement;
    if (!doc.fonts) { root.classList.add('icons-ok'); return; }
    const ready = () => Array.from(doc.fonts).some((f) => /Material Symbols/.test(f.family) && f.status === 'loaded');
    let tries = 0;
    const tick = () => { if (ready()) { root.classList.add('icons-ok'); return; } if (++tries < 60) setTimeout(tick, 250); };
    tick();
    if (doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', () => { if (ready()) root.classList.add('icons-ok'); });
  };

  /* Nombre legible a partir del usuario: "laura.gomez" → "Laura Gomez" */
  const niceName = (u) => String(u || 'Aprendiz').split(/[\s._-]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  /* Proyecto inicial de un usuario nuevo: lienzo limpio, sin leads ni datos de otras personas. */
  const freshProject = App.freshProject = (acc) => {
    const p = SV.newProject('blank', { name: niceName(acc && acc.username) });
    p.name = 'Mi primera landing';
    p.pristine = true;
    p.activity = [{ at: Date.now(), text: 'Sesión nueva de ' + (acc ? acc.username : 'aprendiz') + ': proyecto en blanco' }];
    return p;
  };

  App.boot = async () => {
    watchIconFont(document);
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker no registrado', err));
    }
    const acc = SV.auth.current();
    if (!acc) { SV.login.show((a, o) => App.start(a, o)); return; }
    App.start(acc, {});
  };

  /* Abre el espacio del usuario: solo sus proyectos y sus leads. */
  App.start = async (acc, { isNew } = {}) => {
    App.user = acc;
    SV.storage.useUser(acc.id);
    App.s = null;
    App.ui.links = {}; App.ui.coord = null; App.ui.undo = [];
    await refreshSessions();
    const last = SV.storage.getLast();
    let data = null;
    if (last) data = await SV.storage.get(last);
    if (!data && App.sessions.length) data = await SV.storage.get(App.sessions[0].id);
    if (data) {
      try { App.s = SV.normalizeProject(data); }
      catch (e) { console.error(e); data = null; }
    }
    let fresh = false;
    if (!App.s) { App.s = freshProject(acc); fresh = true; await saveNow(); await refreshSessions(); }
    App.ui.savedAt = App.s.updatedAt;
    loadAppFonts();
    pullInbox();
    const r = location.hash.replace(/^#\/?/, '');
    App.route = fresh ? 'plantillas' : VIEWS[r] ? r : 'inicio';
    if (location.hash !== '#/' + App.route) history.replaceState(null, '', '#/' + App.route);
    render();
    if (fresh) toast((isNew ? 'Bienvenido, ' : 'Hola, ') + acc.username + '. Escoge una plantilla o empieza desde cero.', 'ok', 'waving_hand');
  };
})(window.SV);

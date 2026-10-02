/* ==========================================================================
   SENA VENTAS LANDING PAGE · Editor visual (arrastrar y soltar)
   Estructura de bloques, biblioteca, lienzo en vivo e inspector.
   ========================================================================== */
(function (SV) {
  const App = SV.app;
  const { U, esc, $, $$, ic, VIEWS, AFTER, A, PARTIALS } = App;

  const sel = () => (App.s ? App.s.blocks.find((b) => b.id === App.ui.sel) : null);
  const label = (b) => (SV.BLOCKS[b.type] || {}).label || b.type;
  const summary = (b) => {
    const p = b.props || {};
    const t = p.title || p.logoText || p.text || p.body || (b.type === 'header' ? App.s.client.name : '') || SV.BLOCKS[b.type].desc;
    return String(t).replace(/\s+/g, ' ').slice(0, 60);
  };

  /* ---------- Deshacer ---------- */
  let lastSnap = 0;
  const pushUndo = (force) => {
    if (!force && Date.now() - lastSnap < 1500) return;
    lastSnap = Date.now();
    App.ui.undo = (App.ui.undo || []).concat([{ blocks: JSON.stringify(App.s.blocks), sel: App.ui.sel }]).slice(-40);
  };

  /* ---------- Vista del editor ---------- */
  VIEWS.editor = (s) => {
    if (!App.ui.edDeviceSet && window.innerWidth < 900) App.ui.edDevice = 'mobile';
    const d = App.ui.edDevice;
    return `
    <div class="tabs bpane-tabs">${[['estructura', 'account_tree', 'Estructura'], ['vista', 'preview', 'Página']].map(([k, i, l]) => `<button class="tab ${App.ui.bpane === k ? 'on' : ''}" data-a="bpane" data-p="${k}">${ic(i)}${l}</button>`).join('')}<button class="tab" data-a="open-insp">${ic('tune')}Propiedades</button></div>
    <div class="builder" id="builder" data-pane="${App.ui.bpane}">
      <div class="b-panel b-struct">
        <div class="b-head"><div class="tabs">${[['estructura', 'account_tree', 'Estructura', s.blocks.length], ['agregar', 'add_box', 'Agregar bloques', Object.keys(SV.BLOCKS).length]].map(([k, i, l, n]) => `<button class="tab ${App.ui.lib === k ? 'on' : ''}" data-a="lib-tab" data-tab="${k}">${ic(i, 'sm')}${l}<span class="n">${n}</span></button>`).join('')}</div></div>
        <div class="b-body" data-partial="struct">${PARTIALS.struct(s)}</div>
        <div class="b-foot"><button class="btn btn-soft btn-sm grow" data-a="undo" ${(App.ui.undo || []).length ? '' : 'disabled'}>${ic('undo', 'sm')} Deshacer</button><button class="btn btn-soft btn-sm" data-a="page-settings" title="Ajustes de toda la página">${ic('settings', 'sm')}</button></div>
      </div>
      <div class="b-canvas">
        <div class="preview-bar">
          <div class="row"><span class="chip solid"><i class="d"></i>Editor en vivo</span><span class="small muted hide-sm hint-txt">Clic en una sección para editarla · arrastra bloques sobre la página</span></div>
          <div class="row"><div class="seg">${[['desktop', 'desktop_windows', 'Escritorio'], ['tablet', 'tablet', 'Tableta'], ['mobile', 'smartphone', 'Móvil']].map(([k, i, l]) => `<button class="${d === k ? 'on' : ''}" data-a="ed-device" data-d="${k}" title="${l}">${ic(i, 'sm')}</button>`).join('')}</div><span class="canvas-zoom" id="ed-zoom"></span><button class="btn btn-soft btn-sm" data-a="ed-reload" title="Recargar">${ic('refresh', 'sm')}</button><button class="btn btn-soft btn-sm" data-a="go" data-route="vista" title="Probar como visitante">${ic('science', 'sm')}</button><button class="btn btn-primary btn-sm" data-a="go" data-route="publicar">${ic('rocket_launch', 'sm')} Publicar</button></div>
        </div>
        <div class="canvas-area" id="ed-area"><div class="frame-wrap" id="ed-wrap"><iframe id="ed-frame" title="Lienzo de la landing" sandbox="allow-scripts"></iframe></div></div>
      </div>
      <div class="b-panel b-insp insp" data-partial="insp" data-manual>${PARTIALS.insp(s)}</div>
    </div>`;
  };

  PARTIALS.struct = (s) => {
    const lib = `<div class="lib-pane"><p class="tiny muted" style="margin-bottom:8px">${ic('touch_app', 'sm')} Arrastra un bloque a la lista de estructura o directo sobre la página. Con un clic se agrega después del bloque seleccionado.</p>` +
      SV.BLOCK_CATS.map(([cat, name, icon]) => `<div class="lib-cat">${ic(icon, 'sm')}${esc(name)}</div><div class="lib-grid">${Object.entries(SV.BLOCKS).filter(([, d]) => d.cat === cat).map(([type, d]) => `<div class="lib-item" role="button" tabindex="0" draggable="true" data-drag="lib:${type}" data-a="add-block" data-type="${type}" title="${esc(d.desc)}">${ic(d.icon)}<span>${esc(d.label)}</span></div>`).join('')}</div>`).join('') + '</div>';
    const list = `<div class="list-pane"><div class="blk-list" data-dropzone="blk">${s.blocks.map((b, i) => `<div class="blk-row ${App.ui.sel === b.id ? 'sel' : ''} ${b.hidden ? 'hid' : ''}" draggable="true" data-drag="blk:${b.id}" data-a="sel-block" data-id="${b.id}">
        ${ic('drag_indicator', 'grip')}<span class="bi">${ic(SV.BLOCKS[b.type].icon, 'sm')}</span><span class="bt"><b>${i + 1}. ${esc(label(b))}</b><small>${esc(summary(b))}</small></span>
        <button class="icon-btn" title="${b.hidden ? 'Mostrar' : 'Ocultar'}" data-a="blk-hide" data-id="${b.id}">${ic(b.hidden ? 'visibility_off' : 'visibility')}</button><button class="icon-btn" title="Duplicar" data-a="blk-dup" data-id="${b.id}">${ic('content_copy')}</button><button class="icon-btn danger" title="Eliminar" data-a="blk-del" data-id="${b.id}">${ic('delete')}</button>
      </div>`).join('')}</div>
      ${s.blocks.length ? '' : `<div class="empty">${ic('add_box')}<p class="small">La página está vacía. Abre "Agregar bloques".</p></div>`}
      <button class="btn btn-soft btn-sm btn-block" data-a="lib-tab" data-tab="agregar">${ic('add', 'sm')} Agregar bloque</button></div>`;
    return `<div class="struct-panes" data-show="${App.ui.lib}">${lib}${list}</div>`;
  };

  /* ---------- Controles del inspector ---------- */
  const tgt = (t) => (t.startsWith('b:') ? { obj: sel(), path: t.slice(2) } : { obj: App.s, path: t.slice(2) });
  const getT = (t) => { const x = tgt(t); return x.obj ? App.getPath(x.obj, x.path) : ''; };
  const setT = (t, v) => { const x = tgt(t); if (x.obj) App.setPath(x.obj, x.path, v); };

  const imgPreview = (v) => (/^art:/.test(v || '') ? SV.artSrc(v, App.s.theme.primary) : v || '');
  App.imageField = (target, { small } = {}) => {
    const v = getT(target) || '';
    const isData = /^data:/.test(v);
    const art = /^art:/.test(v) ? (SV.ART_LIST.find((a) => 'art:' + a[0] === v) || [0, /avatar/.test(v) ? 'Persona' : /logo/.test(v) ? 'Logo' : 'Ilustración'])[1] : '';
    const shown = isData ? 'Imagen subida (' + Math.round(v.length * 0.75 / 1024) + ' KB)' : art ? 'Ilustración: ' + art : v;
    return `<div class="img-field"><div class="thumb" style="background-image:url('${esc(imgPreview(v)).replace(/'/g, '%27')}')"></div><div class="grow"><input class="input" data-img="${target}" data-small="${small ? 1 : ''}" value="${esc(shown)}" ${isData || art ? 'readonly title="Quita la imagen con la X para pegar una URL"' : ''} placeholder="URL de la imagen (https://...)"><div class="row"><button class="btn btn-soft btn-sm" data-a="img-upload" data-target="${target}" data-small="${small ? 1 : ''}">${ic('upload', 'sm')} Subir</button><button class="btn btn-soft btn-sm" data-a="img-art" data-target="${target}">${ic('palette', 'sm')} Ilustraciones</button>${v ? `<button class="icon-btn" title="Quitar imagen" data-a="img-clear" data-target="${target}">${ic('close')}</button>` : ''}</div></div></div>`;
  };

  const linkOptions = (allowEmpty) => {
    const base = [['form', 'Ir al formulario'], ['wa', 'Abrir WhatsApp'], ['tel', 'Llamar al teléfono'], ['mail', 'Enviar correo']];
    const anchors = App.s.blocks.filter((b) => !['header', 'footer', 'divider'].includes(b.type)).map((b) => ['#' + SV.anchorOf(b), 'Sección: ' + label(b) + (b.props.title ? ' · ' + String(b.props.title).slice(0, 24) : '')]);
    return (allowEmpty ? [['', 'Sin enlace']] : []).concat(base, anchors, [['__url', 'Enlace externo (URL)...']]);
  };
  const linkField = (path, val, allowEmpty) => {
    const list = linkOptions(allowEmpty);
    const known = list.some(([v]) => v === (val || ''));
    const cur = known ? (val || '') : '__url';
    return `<select class="select" data-linksel="${path}">${App.opts(list, cur)}</select>${cur === '__url' ? `<input class="input mt-s" data-bp="${path}" value="${esc(val || '')}" placeholder="https://...">` : ''}`;
  };

  const ctrl = (f, path, val) => {
    switch (f.t) {
      case 'textarea': return `<textarea class="textarea" data-bp="${path}" rows="${f.rows || 3}">${esc(val || '')}</textarea>`;
      case 'code': return `<textarea class="textarea code-area" data-bp="${path}" spellcheck="false">${esc(val || '')}</textarea>`;
      case 'number': return `<input class="input" type="number" data-bp="${path}" data-type="number" value="${esc(val == null ? '' : val)}">`;
      case 'datetime': return `<input class="input" type="datetime-local" data-bp="${path}" value="${esc(val || '')}">`;
      case 'color': return `<div class="color-row"><input type="color" data-bp="${path}" value="${esc(val || '#ffffff')}"><input class="input mono" data-bp="${path}" value="${esc(val || '')}" placeholder="#ffffff"></div>`;
      case 'toggle': return `<div class="row between card flat" style="padding:8px 10px"><span class="small b">${val ? 'Activado' : 'Desactivado'}</span>${App.sw(!!val, 'bp-toggle', `data-path="${path}"`)}</div>`;
      case 'select': return `<select class="select" data-bp="${path}" data-rerender="1">${App.opts(f.o, val == null ? '' : val)}</select>`;
      case 'icon': return `<button class="icon-pick" data-a="pick-icon" data-target="b:${path}">${ic(val || 'help')}<span class="grow">${esc(val || 'Elegir ícono')}</span>${ic('expand_more', 'sm muted')}</button>`;
      case 'image': return App.imageField('b:' + path, { small: f.small });
      case 'link': return linkField(path, val, f.allowEmpty);
      default: return `<input class="input" data-bp="${path}" value="${esc(val == null ? '' : val)}">`;
    }
  };
  const fieldHtml = (f, path, val) => (f.t === 'list' ? listField(f, path, val || []) : `<div class="field"><label>${esc(f.l)}</label>${ctrl(f, path, val)}${f.h ? `<span class="hint">${esc(f.h)}</span>` : ''}</div>`);

  const listField = (f, path, arr) => {
    const key = App.ui.sel + ':' + path;
    const open = App.ui.openLi[key];
    return `<div class="field"><div class="row between"><label>${esc(f.l)} <span class="chip gray" style="font-size:10.5px">${arr.length}</span></label><button class="btn btn-ghost btn-sm" data-a="li-add" data-path="${path}">${ic('add', 'sm')} Agregar</button></div>
      <div class="li-list" data-dropzone="li" data-list="${path}">${arr.map((it, i) => `<div class="li-item ${open === i ? 'open' : ''}" data-drag="li:${i}" data-list="${path}">
        <div class="li-h" draggable="true" data-drag="li:${i}" data-list="${path}" data-a="li-toggle" data-path="${path}" data-i="${i}">${ic('drag_indicator', 'grip sm')}<span data-lblfor="${path}.${i}.${f.lbl}">${esc(String(it[f.lbl] || 'Elemento ' + (i + 1)).slice(0, 50))}</span>
          <button class="icon-btn" title="Subir" data-a="li-move" data-path="${path}" data-i="${i}" data-d="-1">${ic('arrow_upward')}</button><button class="icon-btn" title="Duplicar" data-a="li-dup" data-path="${path}" data-i="${i}">${ic('content_copy')}</button><button class="icon-btn danger" title="Eliminar" data-a="li-del" data-path="${path}" data-i="${i}">${ic('delete')}</button></div>
        ${open === i ? `<div class="li-b">${f.item.map((sf) => fieldHtml(Object.assign({}, sf, { lblOf: f.lbl }), path + '.' + i + '.' + sf.k, it[sf.k])).join('')}</div>` : ''}
      </div>`).join('')}</div>${arr.length ? '' : '<p class="tiny muted">Sin elementos.</p>'}</div>`;
  };

  PARTIALS.insp = (s) => {
    const b = sel();
    if (!b) {
      return `<div class="b-head"><b class="grow">${ic('tune', 'sm')} Propiedades</b><button class="icon-btn insp-close" data-a="close-insp">${ic('close')}</button></div><div class="b-body">
        <div class="insp-empty">${ic('ads_click')}<b>Selecciona un bloque</b><p class="small">Haz clic en una sección de la página o en la lista de estructura para editar sus textos, imágenes, botones y fondo.</p></div>
        <div class="stack" style="gap:8px">
          <button class="step-card" data-a="go" data-route="marca" data-tab="estilo">${ic('palette', 'ok-t')}<div class="grow"><b>Colores y tipografía</b><small>Paletas, fuentes, bordes y botones</small></div></button>
          <button class="step-card" data-a="go" data-route="marca" data-tab="whatsapp">${ic('chat', 'ok-t')}<div class="grow"><b>WhatsApp y redes</b><small>Enlace WPB, botón flotante y redes sociales</small></div></button>
          <button class="step-card" data-a="go" data-route="formulario">${ic('contact_mail', 'ok-t')}<div class="grow"><b>Campos del formulario</b><small>Datos que pide la landing y destinos</small></div></button>
          <button class="step-card" data-a="go" data-route="marca" data-tab="empresa">${ic('business', 'ok-t')}<div class="grow"><b>Datos de la empresa</b><small>Nombre, teléfono, dirección y logo</small></div></button>
        </div></div>`;
    }
    const def = SV.BLOCKS[b.type];
    const tab = App.ui.inspTab;
    const idx = s.blocks.indexOf(b);
    const st = b.style;
    const styleFields = SV.STYLE_FIELDS.filter((f) => (f.k !== 'bg' || st.variant === 'custom') && ((f.k !== 'bgImage' && f.k !== 'overlay') || st.variant === 'image'));
    return `<div class="b-head"><div class="insp-h grow"><span class="bi">${ic(def.icon)}</span><div><b>${esc(def.label)}</b><small>Bloque ${idx + 1} de ${s.blocks.length}${b.hidden ? ' · oculto' : ''}</small></div></div>
        <button class="icon-btn" title="Subir" data-a="blk-move" data-id="${b.id}" data-d="-1" ${idx === 0 ? 'disabled' : ''}>${ic('arrow_upward')}</button><button class="icon-btn" title="Bajar" data-a="blk-move" data-id="${b.id}" data-d="1" ${idx === s.blocks.length - 1 ? 'disabled' : ''}>${ic('arrow_downward')}</button><button class="icon-btn danger" title="Eliminar" data-a="blk-del" data-id="${b.id}">${ic('delete')}</button><button class="icon-btn insp-close" data-a="close-insp">${ic('close')}</button>
        <div class="tabs">${[['contenido', 'edit_note', 'Contenido'], ['estilo', 'format_paint', 'Estilo']].map(([k, i, l]) => `<button class="tab ${tab === k ? 'on' : ''}" data-a="insp-tab" data-tab="${k}">${ic(i, 'sm')}${l}</button>`).join('')}</div></div>
      <div class="b-body">
        ${tab === 'contenido' ? `<p class="tiny muted" style="margin-bottom:10px">${esc(def.desc)}</p>${['form', 'hero'].includes(b.type) ? `<div class="tip" style="padding:10px;margin-bottom:12px"><div class="ico" style="width:30px;height:30px">${ic('dynamic_form', 'sm')}</div><p class="small">Los campos del formulario se editan en <a href="#/formulario" data-a="go" data-route="formulario">Formulario & Captación</a>.</p></div>` : ''}${b.type === 'social' || b.type === 'footer' ? `<p class="small"><a href="#/marca" data-a="go" data-route="marca" data-tab="whatsapp">${ic('share', 'sm')} Configurar redes sociales y WhatsApp</a></p>` : ''}
          ${def.fields.map((f) => fieldHtml(f, 'props.' + f.k, b.props[f.k])).join('')}`
        : styleFields.map((f) => fieldHtml(f, 'style.' + f.k, st[f.k])).join('') + `<p class="tiny muted">Los colores base se definen en Diseño & Marca. El ID de sección por defecto es <span class="kbd">${esc(SV.anchorOf(b))}</span>.</p>`}
        <button class="btn btn-soft btn-sm btn-block mt" data-a="blk-dup" data-id="${b.id}">${ic('content_copy', 'sm')} Duplicar bloque</button>
      </div>`;
  };

  /* ---------- Lienzo: iframe con actualización en caliente ---------- */
  let ready = false;
  const frame = () => $('#ed-frame');
  const post = (m) => { const f = frame(); if (f && f.contentWindow) f.contentWindow.postMessage(Object.assign({ source: 'svl-app' }, m), '*'); };
  const patch = U.debounce(() => {
    if (App.route !== 'editor' || !ready || !App.s) return;
    post(Object.assign({ type: 'patch', sel: App.ui.sel }, SV.landingParts(App.s, 'edit')));
  }, 140);
  const loadFrame = () => {
    const f = frame(); if (!f) return;
    ready = false;
    f.srcdoc = SV.renderLanding(App.s, { mode: 'edit' });
  };
  /* El lienzo se dibuja al ancho real del dispositivo y se escala para caber en el panel. */
  const DEVICE_W = { desktop: 1280, tablet: 820, mobile: 390 };
  const fit = () => {
    const area = $('#ed-area'); const wrap = $('#ed-wrap');
    if (!area || !wrap) return;
    const dw = DEVICE_W[App.ui.edDevice] || 1280;
    const aw = area.clientWidth - 24; const ah = area.clientHeight - 24;
    if (aw <= 0 || ah <= 0) return;
    const k = Math.min(1, aw / dw);
    wrap.style.width = dw + 'px';
    wrap.style.height = Math.round(ah / k) + 'px';
    wrap.style.transform = 'translateX(-50%) scale(' + k.toFixed(4) + ')';
    const z = $('#ed-zoom'); if (z) z.textContent = Math.round(k * 100) + '%';
  };
  let ro = null;
  AFTER.editor = () => {
    loadFrame();
    fit();
    if (ro) ro.disconnect();
    if (window.ResizeObserver && $('#ed-area')) { ro = new ResizeObserver(() => fit()); ro.observe($('#ed-area')); }
  };
  window.addEventListener('resize', () => { if (App.route === 'editor') fit(); });
  App.onChange = () => { if (App.route === 'editor') patch(); };

  const refreshStruct = () => App.refreshPartials({ parts: ['insp'] });
  const touch = (msg, opts = {}) => { App.s.progress.edited = true; App.s.pristine = false; App.commit(msg, Object.assign({ parts: ['insp'] }, opts)); const u = $('[data-a="undo"]'); if (u) u.disabled = !(App.ui.undo || []).length; };

  const select = (id, scroll = true) => {
    App.ui.sel = id;
    App.ui.inspTab = App.ui.inspTab || 'contenido';
    refreshStruct();
    if (scroll) post({ type: 'select', id });
    const b = $('#builder');
    if (b && window.innerWidth <= 1560 && id) b.classList.add('insp-open');
  };

  window.addEventListener('message', (e) => {
    const m = e.data || {};
    const f = frame();
    if (m.source !== 'svl-landing' || !f || e.source !== f.contentWindow) return;
    if (m.type === 'ready') { ready = true; if (App.ui.sel) post({ type: 'select', id: App.ui.sel }); }
    else if (m.type === 'select') { select(m.id, false); post({ type: 'select', id: m.id }); }
    else if (m.type === 'drop') {
      const data = String(m.data || '');
      const drag = App.drag;
      let kind = ''; let id = '';
      const mm = /^svl:(lib|blk):(.+)$/.exec(data);
      if (mm) { kind = mm[1]; id = mm[2]; } else if (drag) { kind = drag.kind; id = drag.id; }
      if (!kind) return;
      const blocks = App.s.blocks;
      let index = m.before ? blocks.findIndex((b) => b.id === m.before) : blocks.length;
      if (index < 0) index = blocks.length;
      App.DROP.blk(kind, id, index);
    }
  });

  /* ---------- Operaciones sobre bloques ---------- */
  const insertBlock = (type, index) => {
    pushUndo(true);
    const s = App.s;
    const b = SV.makeBlock(type);
    if (b.type === 'form' && s.blocks.some((x) => SV.anchorOf(x) === 'contacto')) b.style.anchor = '';
    const footer = s.blocks.findIndex((x) => x.type === 'footer');
    if (index == null) {
      const cur = s.blocks.findIndex((x) => x.id === App.ui.sel);
      index = cur >= 0 ? cur + 1 : footer >= 0 ? footer : s.blocks.length;
    }
    s.blocks.splice(Math.max(0, Math.min(index, s.blocks.length)), 0, b);
    App.ui.sel = b.id; App.ui.inspTab = 'contenido';
    showPane('estructura');
    touch('Bloque agregado: ' + label(b));
    App.refreshPartials({ parts: ['insp'] });
    setTimeout(() => post({ type: 'select', id: b.id }), 380);
    App.toast('Bloque agregado: ' + label(b), 'ok', SV.BLOCKS[type].icon);
  };
  const moveBlock = (id, to) => {
    const arr = App.s.blocks;
    const from = arr.findIndex((b) => b.id === id);
    if (from < 0) return;
    to = Math.max(0, Math.min(to, arr.length));
    if (to > from) to--;
    if (to === from) return;
    pushUndo(true);
    const [x] = arr.splice(from, 1); arr.splice(to, 0, x);
    App.ui.sel = id;
    touch('Bloque movido: ' + label(x));
  };
  App.DROP.blk = (kind, id, index) => { if (kind === 'lib' && SV.BLOCKS[id]) insertBlock(id, index); else if (kind === 'blk') moveBlock(id, index); };

  const showPane = (tab) => {
    App.ui.lib = tab;
    const p = $('.struct-panes'); if (p) p.dataset.show = tab;
    $$('.b-struct .b-head [data-a="lib-tab"]').forEach((t) => t.classList.toggle('on', t.dataset.tab === tab));
  };
  A['lib-tab'] = (el) => showPane(el.dataset.tab);
  /* Al arrastrar desde la biblioteca se muestra la lista para soltar el bloque en su lugar. */
  document.addEventListener('dragstart', (e) => { const el = e.target.closest ? e.target.closest('.lib-item') : null; if (el) setTimeout(() => showPane('estructura'), 60); });
  A['add-block'] = (el) => { if (App.drag) return; insertBlock(el.dataset.type); };
  A['sel-block'] = (el, e) => { if (e.target.closest('button')) return; select(el.dataset.id); };
  A['blk-hide'] = (el) => { const b = App.s.blocks.find((x) => x.id === el.dataset.id); pushUndo(true); b.hidden = !b.hidden; touch((b.hidden ? 'Bloque oculto: ' : 'Bloque visible: ') + label(b)); };
  A['blk-dup'] = (el) => {
    const arr = App.s.blocks; const i = arr.findIndex((x) => x.id === el.dataset.id); if (i < 0) return;
    pushUndo(true);
    const c = U.clone(arr[i]); c.id = U.uid('b'); if (c.style.anchor) c.style.anchor = '';
    arr.splice(i + 1, 0, c); App.ui.sel = c.id;
    touch('Bloque duplicado: ' + label(c));
  };
  A['blk-del'] = (el) => {
    const arr = App.s.blocks; const i = arr.findIndex((x) => x.id === el.dataset.id); if (i < 0) return;
    pushUndo(true);
    const [b] = arr.splice(i, 1);
    if (App.ui.sel === b.id) App.ui.sel = null;
    touch('Bloque eliminado: ' + label(b));
    App.toast('Bloque eliminado. Usa Deshacer para recuperarlo.', 'ok', 'delete');
  };
  A['blk-move'] = (el) => { const arr = App.s.blocks; const i = arr.findIndex((x) => x.id === el.dataset.id); const d = Number(el.dataset.d); moveBlock(el.dataset.id, d > 0 ? i + 2 : i - 1); };
  A['undo'] = () => {
    const st = App.ui.undo || []; const last = st.pop(); if (!last) return;
    App.s.blocks = JSON.parse(last.blocks); App.ui.sel = last.sel;
    lastSnap = 0;
    App.commit('Cambio deshecho', { parts: ['insp'] });
    const u = $('[data-a="undo"]'); if (u) u.disabled = !st.length;
  };
  A['insp-tab'] = (el) => { App.ui.inspTab = el.dataset.tab; refreshStruct(); };
  A['close-insp'] = () => { const b = $('#builder'); if (b) b.classList.remove('insp-open'); };
  A['open-insp'] = () => { const b = $('#builder'); if (b) b.classList.add('insp-open'); };
  A['bpane'] = (el) => { App.ui.bpane = el.dataset.p; const b = $('#builder'); if (b) b.dataset.pane = el.dataset.p; $$('.bpane-tabs [data-a="bpane"]').forEach((t) => t.classList.toggle('on', t.dataset.p === el.dataset.p)); setTimeout(fit, 30); };
  A['ed-device'] = (el) => { App.ui.edDevice = el.dataset.d; App.ui.edDeviceSet = true; fit(); $$('[data-a="ed-device"]').forEach((b) => b.classList.toggle('on', b === el)); };
  A['ed-reload'] = () => loadFrame();
  A['page-settings'] = () => { App.ui.sel = null; refreshStruct(); post({ type: 'select', id: null }); A['open-insp'](); };
  A['bp-toggle'] = (el) => { const b = sel(); if (!b) return; pushUndo(); App.setPath(b, el.dataset.path, !App.getPath(b, el.dataset.path)); touch(null); };

  /* Listas dentro del inspector */
  const listOf = (path) => { const b = sel(); return b ? App.getPath(b, path) : null; };
  A['li-toggle'] = (el, e) => { if (e.target.closest('button')) return; const key = App.ui.sel + ':' + el.dataset.path; const i = Number(el.dataset.i); App.ui.openLi[key] = App.ui.openLi[key] === i ? -1 : i; refreshStruct(); };
  A['li-add'] = (el) => {
    const b = sel(); if (!b) return;
    const path = el.dataset.path; const k = path.split('.').pop();
    const def = SV.BLOCKS[b.type].fields.find((f) => f.k === k);
    const arr = listOf(path) || [];
    pushUndo(true);
    const item = U.clone(def.add || {});
    if (item.photo && /^art:avatar/.test(item.photo)) item.photo = 'art:avatar:' + arr.length;
    if (item.image && /^art:logo/.test(item.image)) item.image = 'art:logo:' + arr.length;
    arr.push(item); App.setPath(b, path, arr);
    App.ui.openLi[App.ui.sel + ':' + path] = arr.length - 1;
    touch(null);
  };
  A['li-del'] = (el) => { const arr = listOf(el.dataset.path); if (!arr) return; pushUndo(true); arr.splice(Number(el.dataset.i), 1); App.ui.openLi[App.ui.sel + ':' + el.dataset.path] = -1; touch(null); };
  A['li-dup'] = (el) => { const arr = listOf(el.dataset.path); if (!arr) return; pushUndo(true); const i = Number(el.dataset.i); arr.splice(i + 1, 0, U.clone(arr[i])); App.ui.openLi[App.ui.sel + ':' + el.dataset.path] = i + 1; touch(null); };
  const moveLi = (path, from, to) => { const arr = listOf(path); if (!arr || to < 0 || to >= arr.length || to === from) return; pushUndo(true); const [x] = arr.splice(from, 1); arr.splice(to, 0, x); App.ui.openLi[App.ui.sel + ':' + path] = -1; touch(null); };
  A['li-move'] = (el) => { const i = Number(el.dataset.i); moveLi(el.dataset.path, i, i + Number(el.dataset.d)); };
  App.DROP.li = (kind, id, index, zone) => { if (kind !== 'li') return; const from = Number(id); moveLi(zone.dataset.list, from, index > from ? index - 1 : index); };

  /* Imágenes e íconos (sirven para el editor y para Diseño & Marca) */
  const afterAsset = (target, msg) => {
    if (target.startsWith('b:')) touch(msg);
    else { App.s.progress.clientEdited = true; App.commit(msg, { render: true }); }
  };
  A['img-upload'] = (el) => {
    const target = el.dataset.target; const small = !!el.dataset.small;
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        const data = await U.compressImage(f, small ? 360 : 1280, small ? 0.85 : 0.74);
        if (target.startsWith('b:')) pushUndo(true);
        setT(target, data);
        afterAsset(target, 'Imagen actualizada');
        App.toast('Imagen cargada (' + Math.round(data.length * 0.75 / 1024) + ' KB)', 'ok', 'image');
      } catch (e) { App.toast(e.message, 'err'); }
    };
    inp.click();
  };
  A['img-clear'] = (el) => { if (el.dataset.target.startsWith('b:')) pushUndo(true); setT(el.dataset.target, ''); afterAsset(el.dataset.target, null); };
  A['img-art'] = (el) => {
    const target = el.dataset.target;
    const list = SV.ART_LIST.concat([['avatar:0', 'Persona 1'], ['avatar:1', 'Persona 2'], ['avatar:2', 'Persona 3'], ['avatar:3', 'Persona 4'], ['avatar:4', 'Persona 5'], ['avatar:5', 'Persona 6'], ['logo:0', 'Logo 1'], ['logo:1', 'Logo 2'], ['logo:2', 'Logo 3'], ['logo:3', 'Logo 4'], ['logo:4', 'Logo 5'], ['logo:5', 'Logo 6']]);
    App.modal({ title: 'Ilustraciones de la biblioteca', sub: 'Se pintan con el color principal de la marca y no pesan en el enlace publicado.', wide: true, body: `<div class="art-grid">${list.map(([k, l]) => `<button data-a="img-art-set" data-target="${target}" data-v="art:${k}"><img src="${esc(SV.artSrc('art:' + k, App.s.theme.primary))}" alt=""><span>${esc(l)}</span></button>`).join('')}</div>` });
  };
  A['img-art-set'] = (el) => { if (el.dataset.target.startsWith('b:')) pushUndo(true); setT(el.dataset.target, el.dataset.v); App.closeOverlay(); afterAsset(el.dataset.target, 'Ilustración aplicada'); };
  A['pick-icon'] = (el) => {
    const target = el.dataset.target; const cur = getT(target);
    App.modal({ title: 'Elegir ícono', sub: 'Íconos Material Symbols. También puedes escribir el nombre de cualquier ícono de fonts.google.com/icons.', body: `<div class="icon-grid">${SV.ICONS.map((n) => `<button class="${n === cur ? 'on' : ''}" title="${n}" data-a="icon-set" data-target="${target}" data-v="${n}">${ic(n)}</button>`).join('')}</div><div class="row" style="flex-wrap:nowrap"><input class="input" id="icon-custom" placeholder="nombre_del_icono" value="${esc(cur || '')}"><button class="btn btn-primary" data-a="icon-set" data-target="${target}" data-custom="1">Usar</button></div>` });
  };
  A['icon-set'] = (el) => {
    const v = el.dataset.custom ? U.slug($('#icon-custom').value, '').replace(/-/g, '_') : el.dataset.v;
    if (!v) return;
    if (el.dataset.target.startsWith('b:')) pushUndo(true);
    setT(el.dataset.target, v); App.closeOverlay(); afterAsset(el.dataset.target, null);
  };

  /* Entradas del inspector */
  App.INPUT.push((el, e) => {
    if (el.dataset.img) {
      if (el.readOnly || e.type !== 'change') return true;
      if (el.dataset.img.startsWith('b:')) pushUndo(true);
      setT(el.dataset.img, el.value.trim());
      afterAsset(el.dataset.img, null);
      return true;
    }
    if (el.dataset.linksel) {
      const b = sel(); if (!b) return true;
      pushUndo(true);
      App.setPath(b, el.dataset.linksel, el.value === '__url' ? 'https://' : el.value);
      touch(null);
      return true;
    }
    if (!el.dataset.bp) return false;
    const b = sel(); if (!b) return true;
    let v = el.value;
    if (el.dataset.type === 'number') v = v === '' ? '' : Number(v);
    if (el.type !== 'color' && /\.bg$/.test(el.dataset.bp) && v && !/^#[0-9a-f]{6}$/i.test(v)) return true;
    pushUndo();
    App.setPath(b, el.dataset.bp, v);
    $$(`[data-bp="${el.dataset.bp}"]`).forEach((o) => { if (o !== el) o.value = v; });
    const lbl = $(`[data-lblfor="${el.dataset.bp}"]`); if (lbl) lbl.textContent = String(v).slice(0, 50);
    App.s.progress.edited = true;
    if (el.dataset.rerender && e.type === 'change') App.commit(null, { parts: ['insp'] });
    else App.commit(null);
    return true;
  });

  document.addEventListener('keydown', (e) => {
    if (App.route !== 'editor' || !App.ui.sel) return;
    if (e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (e.key === 'Delete') { e.preventDefault(); A['blk-del']({ dataset: { id: App.ui.sel } }); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); A['undo'](); }
  });
})(window.SV);

/* ==========================================================================
   SENA VENTAS LANDING PAGE · Base de datos de leads
   Tabla, embudo de ventas, datos de prueba, importación, sincronización
   con la nube y exportación a Excel (.xlsx) y CSV.
   ========================================================================== */
(function (SV) {
  const App = SV.app;
  const { U, esc, $, ic, VIEWS, A, PARTIALS } = App;
  const PER = 15;

  const stOf = (id) => SV.LEAD_STATUSES.find((x) => x.id === id) || SV.LEAD_STATUSES[0];
  const srcLabel = (l) => l.source || 'sin origen';
  const svc = (l) => l.data.servicio || l.interes || '';

  /* Agrega un lead normalizado. Devuelve null si ya existía (mismo id). */
  App.addLead = (lead, source) => {
    const s = App.s;
    if (!lead || typeof lead !== 'object') return null;
    const id = lead.id || U.uid('ld_');
    if (s.leads.some((x) => x.id === id)) return null;
    const l = {
      id, at: Number(lead.at) || Date.now(), data: Object.assign({}, lead.data || {}), interes: lead.interes || '',
      utm: lead.utm || {}, device: lead.device || '', url: lead.url || '', source: lead.source || source || 'manual',
      status: lead.status || 'nuevo', notes: lead.notes || '', history: lead.history || [{ at: Date.now(), text: 'Lead registrado (' + (lead.source || source || 'manual') + ')' }]
    };
    s.leads.unshift(l);
    s.pristine = false;
    s.leads.sort((a, b) => b.at - a.at);
    return l;
  };

  const phoneWa = (t) => { let d = U.digits(t); if (d.length === 10 && d.charAt(0) === '3') d = '57' + d; return d; };

  const filtered = (s) => {
    const q = App.ui.leadQ.trim().toLowerCase();
    return s.leads.filter((l) => (!App.ui.leadSt || l.status === App.ui.leadSt) && (!App.ui.leadSrc || srcLabel(l) === App.ui.leadSrc) &&
      (!q || [l.data.nombre, l.data.telefono, l.data.correo, svc(l), l.data.mensaje, l.notes, (l.utm || {}).utm_source].join(' ').toLowerCase().includes(q)));
  };

  const countBy = (list, fn) => { const m = {}; list.forEach((l) => { const k = fn(l) || 'Sin dato'; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };

  /* ---------------- Vista ---------------- */
  VIEWS.leads = (s) => {
    const views = (s.analytics.view || 0) + (s.analytics.cloudVisits || 0);
    const conv = views ? s.leads.length / views * 100 : 0;
    const nuevos = s.leads.filter((l) => l.status === 'nuevo').length;
    const clientes = s.leads.filter((l) => l.status === 'cliente').length;
    const top = countBy(s.leads, (l) => (l.utm || {}).utm_source || srcLabel(l))[0];
    const sources = Array.from(new Set(s.leads.map(srcLabel)));
    const cloudUrl = s.form.destinations.sheets.url || SV.config().nubeUrl;
    return `
    <div class="page-head">
      <div><span class="eyebrow">${ic('school', 'sm')} Módulo didáctico • Gestión de prospectos</span><h1>Base de Datos (Leads)</h1><p class="lead">Cada interesado que deja sus datos queda aquí. Clasifícalo por estado, haz seguimiento por WhatsApp y descarga la base de datos en Excel para el cliente o el instructor.</p></div>
      <div class="row"><button class="btn btn-primary" data-a="export-xlsx">${ic('table_view')} Descargar Excel</button><button class="btn btn-soft" data-a="export-csv">${ic('csv')} CSV</button></div>
    </div>
    <div class="grid g4 mb">
      <div class="kpi"><div class="kpi-h"><span>Leads totales</span>${ic('group_add')}</div><div class="kpi-v">${s.leads.length}</div><div class="kpi-f"><span>${nuevos} sin contactar</span></div></div>
      <div class="kpi"><div class="kpi-h"><span>Tasa de conversión</span>${ic('percent')}</div><div class="kpi-v">${U.pct(conv)}</div><div class="kpi-f"><span>${views} visitas${s.analytics.cloudVisits ? ' (' + s.analytics.cloudVisits + ' en la nube)' : ''}</span></div></div>
      <div class="kpi"><div class="kpi-h"><span>Clientes cerrados</span>${ic('handshake')}</div><div class="kpi-v">${clientes}</div><div class="kpi-f"><span>Cierre: <b>${U.pct(s.leads.length ? clientes / s.leads.length * 100 : 0)}</b></span></div></div>
      <div class="kpi"><div class="kpi-h"><span>Fuente principal</span>${ic('campaign')}</div><div class="kpi-v" style="font-size:22px">${esc(top ? top[0] : '—')}</div><div class="kpi-f"><span>${top ? top[1] + ' lead(s)' : 'Sin datos'}</span></div></div>
    </div>
    <div class="table-card">
      <div class="toolbar">
        <div class="l">
          <div class="input-ico" style="flex:1;min-width:200px">${ic('search')}<input class="input" id="lead-q" placeholder="Buscar nombre, teléfono, servicio..." value="${esc(App.ui.leadQ)}"></div>
          <select class="select" id="lead-st" style="width:auto"><option value="">Todos los estados</option>${SV.LEAD_STATUSES.map((x) => `<option value="${x.id}" ${App.ui.leadSt === x.id ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}</select>
          <select class="select" id="lead-src" style="width:auto"><option value="">Todos los orígenes</option>${sources.map((x) => `<option ${App.ui.leadSrc === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
        </div>
        <div class="row">
          <div class="pill-seg">${[['tabla', 'table_rows', 'Tabla'], ['embudo', 'view_kanban', 'Embudo']].map(([k, i, l]) => `<button class="${App.ui.leadView === k ? 'on' : ''}" data-a="lead-view" data-v="${k}">${ic(i, 'sm')} ${l}</button>`).join('')}</div>
          <button class="btn btn-soft btn-sm" data-a="lead-add">${ic('person_add', 'sm')} Agregar</button>
          <button class="btn btn-soft btn-sm" data-a="lead-fake">${ic('science', 'sm')} Datos de prueba</button>
          <button class="btn btn-soft btn-sm" data-a="lead-import">${ic('upload_file', 'sm')} Importar CSV</button>
          ${cloudUrl ? `<button class="btn btn-soft btn-sm" data-a="sync-leads" ${s.cloud.token ? '' : 'disabled title="Publica con la nube activa para registrar el proyecto"'}>${ic('cloud_download', 'sm')} Nube</button>` : ''}
        </div>
      </div>
      <div data-partial="leadbody" data-manual>${PARTIALS.leadbody(s)}</div>
    </div>
    <div class="grid g3 mt">
      <div class="card"><div class="card-h"><h3>${ic('filter_alt')} Embudo de conversión</h3></div>${funnel(s)}</div>
      <div class="card"><div class="card-h"><h3>${ic('campaign')} Leads por origen</h3></div>${bars(countBy(s.leads, (l) => (l.utm || {}).utm_source || srcLabel(l)))}</div>
      <div class="card"><div class="card-h"><h3>${ic('sell')} Leads por servicio</h3></div>${bars(countBy(s.leads, svc))}</div>
    </div>
    <div class="tip mt"><div class="ico">${ic('lightbulb')}</div><div><h4>Tip del instructor SENA</h4><p class="small">Un lead se enfría rápido: contáctalo en los primeros 5 minutos. Registra cada gestión en las notas y mueve el lead por el embudo. Así calculas la tasa de cierre real de la campaña.</p></div></div>`;
  };

  const funnel = (s) => {
    const a = s.analytics;
    const views = (a.view || 0) + (a.cloudVisits || 0);
    const rows = [['Visitas', views], ['Iniciaron formulario', a.form_start || 0], ['Leads', s.leads.length], ['Contactados o más', s.leads.filter((l) => l.status !== 'nuevo' && l.status !== 'descartado').length], ['Cita o visita', s.leads.filter((l) => ['agendado', 'cliente'].includes(l.status)).length], ['Clientes', s.leads.filter((l) => l.status === 'cliente').length]];
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return `<div class="funnel">${rows.map(([l, v]) => `<div><span>${l}</span><i style="width:${Math.max(2, v / max * 100)}%"></i><b>${v}</b></div>`).join('')}</div>`;
  };
  const bars = (list) => {
    if (!list.length) return '<p class="small muted">Sin datos todavía.</p>';
    const max = Math.max(...list.map((x) => x[1]));
    return `<div class="bars">${list.slice(0, 8).map(([k, v]) => `<div><span class="small" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(k)}">${esc(k)}</span><i style="width:${v / max * 100}%"></i><b class="small">${v}</b></div>`).join('')}</div>`;
  };

  PARTIALS.leadbody = (s) => {
    const list = filtered(s);
    if (App.ui.leadView === 'embudo') {
      return `<div style="padding:14px"><div class="kanban">${SV.LEAD_STATUSES.map((st) => { const items = list.filter((l) => l.status === st.id); return `<div class="kcol" data-dropzone="lead" data-status="${st.id}"><div class="kcol-h"><span class="row" style="gap:6px">${ic(st.icon, 'sm')}${esc(st.label)}</span><span class="chip ${st.chip}">${items.length}</span></div>${items.map((l) => `<div class="kcard" draggable="true" data-drag="lead:${l.id}" data-a="lead-open" data-id="${l.id}"><b>${esc(l.data.nombre || 'Sin nombre')}</b><span>${esc(svc(l))}</span><small>${esc(l.data.telefono || '')} · ${esc(U.timeAgo(l.at))}</small></div>`).join('')}</div>`; }).join('')}</div><p class="tiny muted mt-s">Arrastra las tarjetas entre columnas para cambiar el estado.</p></div>`;
    }
    const pages = Math.max(1, Math.ceil(list.length / PER));
    App.ui.leadPage = Math.min(App.ui.leadPage, pages);
    const rows = list.slice((App.ui.leadPage - 1) * PER, App.ui.leadPage * PER);
    const selN = App.ui.leadSel.size;
    return `${selN ? `<div class="bulk"><b>${selN} seleccionado(s)</b><select class="select" id="bulk-st" style="width:auto;background:rgba(255,255,255,.12);color:#fff;border:0">${SV.LEAD_STATUSES.map((x) => `<option value="${x.id}" style="color:#000">${esc(x.label)}</option>`).join('')}</select><button class="btn btn-sm" data-a="lead-bulk-st">Cambiar estado</button><button class="btn btn-sm" data-a="lead-bulk-xlsx">${ic('table_view', 'sm')} Excel</button><button class="btn btn-sm" data-a="lead-bulk-del">${ic('delete', 'sm')} Eliminar</button><button class="btn btn-sm" data-a="lead-bulk-clear">Cancelar</button></div>` : ''}
      <div class="tbl-wrap"><table class="tbl cards"><thead><tr><th class="c"><input type="checkbox" data-a="lead-sel-all" ${rows.length && rows.every((l) => App.ui.leadSel.has(l.id)) ? 'checked' : ''}></th><th>Fecha</th><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Servicio / interés</th><th>Origen</th><th>Estado</th><th class="c">Acciones</th></tr></thead><tbody>
      ${rows.map((l) => `<tr class="${App.ui.leadSel.has(l.id) ? 'sel' : ''}"><td class="c"><input type="checkbox" data-a="lead-sel" data-id="${l.id}" ${App.ui.leadSel.has(l.id) ? 'checked' : ''}></td>
        <td class="td-head" data-label="Fecha"><span class="small">${esc(U.fmtDate(l.at))}</span></td>
        <td data-label="Nombre"><span class="lead-name" data-a="lead-open" data-id="${l.id}">${esc(l.data.nombre || 'Sin nombre')}</span>${l.notes ? ` ${ic('sticky_note_2', 'sm muted')}` : ''}</td>
        <td data-label="Teléfono">${l.data.telefono ? `<a href="https://wa.me/${phoneWa(l.data.telefono)}" target="_blank" rel="noopener" class="row" style="gap:4px;flex-wrap:nowrap">${ic('chat', 'sm ok-t')}${esc(l.data.telefono)}</a>` : '<span class="muted">—</span>'}</td>
        <td data-label="Correo"><span class="small">${esc(l.data.correo || '—')}</span></td>
        <td data-label="Servicio">${esc(svc(l) || '—')}</td>
        <td data-label="Origen"><span class="chip gray">${esc(srcLabel(l))}</span>${(l.utm || {}).utm_source ? `<div class="tiny muted">${esc(l.utm.utm_source)}${l.utm.utm_campaign ? ' · ' + esc(l.utm.utm_campaign) : ''}</div>` : ''}</td>
        <td data-label="Estado"><select class="select st-select st-${l.status}" data-lead-st="${l.id}">${SV.LEAD_STATUSES.map((x) => `<option value="${x.id}" ${x.id === l.status ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}</select></td>
        <td class="td-actions"><div class="actions"><button class="icon-btn" title="Ver detalle" data-a="lead-open" data-id="${l.id}">${ic('visibility')}</button><button class="icon-btn danger" title="Eliminar" data-a="lead-del" data-id="${l.id}">${ic('delete')}</button></div></td></tr>`).join('') || `<tr><td colspan="9" class="td-empty"><div class="empty">${ic('inbox')}<p>${s.leads.length ? 'Ningún lead coincide con el filtro.' : 'Aún no hay leads. Prueba el formulario en Vista en Vivo, comparte el enlace publicado o genera datos de prueba.'}</p>${s.leads.length ? '' : `<div class="row"><button class="btn btn-primary btn-sm" data-a="go" data-route="vista">${ic('visibility', 'sm')} Ir a la vista en vivo</button><button class="btn btn-soft btn-sm" data-a="lead-fake">${ic('science', 'sm')} Generar datos de prueba</button></div>`}</div></td></tr>`}
      </tbody></table></div>
      <div class="pager"><span>${list.length} lead(s)${list.length !== s.leads.length ? ' filtrados de ' + s.leads.length : ''}</span><div class="pages"><button data-a="lead-page" data-p="${App.ui.leadPage - 1}" ${App.ui.leadPage <= 1 ? 'disabled' : ''}>${ic('chevron_left', 'sm')}</button>${Array.from({ length: pages }, (_, i) => i + 1).filter((n) => Math.abs(n - App.ui.leadPage) < 3 || n === 1 || n === pages).map((n) => `<button class="${n === App.ui.leadPage ? 'on' : ''}" data-a="lead-page" data-p="${n}">${n}</button>`).join('')}<button data-a="lead-page" data-p="${App.ui.leadPage + 1}" ${App.ui.leadPage >= pages ? 'disabled' : ''}>${ic('chevron_right', 'sm')}</button></div></div>`;
  };
  const refreshBody = () => App.refreshPartials({ parts: ['leadbody'] });

  /* ---------------- Excel y CSV ---------------- */
  const columns = (s, leads) => {
    const std = [['nombre', 'Nombre'], ['telefono', 'Teléfono'], ['correo', 'Correo'], ['servicio', 'Servicio'], ['mensaje', 'Mensaje']];
    const custom = s.form.fields.filter((f) => !SV.STD_KEYS.includes(f.key)).map((f) => [f.key, f.label]);
    const known = new Set(std.concat(custom).map((x) => x[0]));
    leads.forEach((l) => Object.keys(l.data || {}).forEach((k) => { if (!known.has(k)) { known.add(k); custom.push([k, k]); } }));
    return { std, custom };
  };
  const leadRows = (s, leads) => {
    const { std, custom } = columns(s, leads);
    const head = ['Fecha'].concat(std.map((x) => x[1]), custom.map((x) => x[1]), ['Interés seleccionado', 'Estado', 'Notas de seguimiento', 'Origen', 'utm_source', 'utm_medium', 'utm_campaign', 'Dispositivo', 'ID lead']);
    const rows = leads.map((l) => [l.at].concat(std.map(([k]) => l.data[k] || ''), custom.map(([k]) => { const v = l.data[k]; return v == null ? '' : (/^\d+(\.\d+)?$/.test(String(v)) && k !== 'telefono' && String(v).length < 10 ? Number(v) : String(v)); }), [l.interes || '', stOf(l.status).label, l.notes || '', srcLabel(l), (l.utm || {}).utm_source || '', (l.utm || {}).utm_medium || '', (l.utm || {}).utm_campaign || '', l.device || '', l.id]));
    return [head].concat(rows);
  };
  const workbook = (s, leads) => {
    const views = (s.analytics.view || 0) + (s.analytics.cloudVisits || 0);
    const B = (t) => ({ bold: true, text: t });
    const resumen = [['Indicador', 'Valor'],
      ['Landing', s.name], ['Empresa', s.client.name], ['Sector', s.client.sector || ''], ['Aprendiz', s.owner.name], ['Ficha', String(s.owner.ficha || '')], ['Programa', s.owner.programa || ''], ['Fecha de corte', U.fmtDate(Date.now())],
      [B('Visitas'), views], [B('Leads'), leads.length], [B('Tasa de conversión (%)'), views ? Math.round(leads.length / views * 1000) / 10 : 0], [B('Clics en WhatsApp'), s.analytics.whatsapp || 0],
      ['', ''], [B('Leads por estado'), '']].concat(SV.LEAD_STATUSES.map((x) => [x.label, leads.filter((l) => l.status === x.id).length]),
      [['', ''], [B('Leads por servicio'), '']], countBy(leads, svc),
      [['', ''], [B('Leads por origen'), '']], countBy(leads, (l) => (l.utm || {}).utm_source || srcLabel(l)));
    const dic = [['Clave', 'Etiqueta', 'Tipo', 'Obligatorio', 'Opciones']].concat(s.form.fields.map((f) => [f.key, f.label, (SV.FIELD_TYPES.find((x) => x[0] === f.type) || [0, f.type])[1], f.required ? 'Sí' : 'No', (f.options || []).join(' | ')]));
    return U.xlsx([
      { name: 'Leads', rows: leadRows(s, leads), dateCols: [0] },
      { name: 'Resumen', rows: resumen, dateCols: [], filter: false, widths: [34, 40] },
      { name: 'Diccionario de datos', rows: dic }
    ], { title: 'Base de datos de leads · ' + s.client.name, author: s.owner.name });
  };
  const exportXlsx = (leads, suffix = '') => {
    const s = App.s;
    const wb = workbook(s, leads);
    U.download('leads-' + U.slug(s.client.name) + suffix + '-' + new Date().toISOString().slice(0, 10) + '.xlsx', wb);
    if (!s.progress.excel) { s.progress.excel = true; App.commit('Base de datos exportada a Excel (' + leads.length + ' leads)'); }
    else App.commit('Base de datos exportada a Excel (' + leads.length + ' leads)');
    App.toast('Excel descargado con ' + leads.length + ' lead(s)', 'ok', 'table_view');
  };
  A['export-xlsx'] = () => exportXlsx(App.s.leads);
  A['export-csv'] = () => {
    const rows = leadRows(App.s, App.s.leads).map((r, i) => (i ? [U.fmtDate(r[0])].concat(r.slice(1)) : r)).map((r) => r.map((c) => (/^[=+\-@]/.test(String(c)) ? "'" + c : c)));
    U.download('leads-' + U.slug(App.s.client.name) + '.csv', U.toCSV(rows), 'text/csv');
    App.toast('CSV descargado');
  };

  /* ---------------- Datos de prueba ---------------- */
  const NAMES = ['Laura', 'Andrés', 'Camila', 'Juan David', 'Valentina', 'Santiago', 'Daniela', 'Carlos', 'María José', 'Sebastián', 'Paola', 'Jorge', 'Natalia', 'Felipe', 'Luisa', 'Diego', 'Mariana', 'Julián', 'Catalina', 'Óscar', 'Yuliana', 'Harold', 'Angie', 'Brayan'];
  const LAST = ['Gómez', 'Rodríguez', 'Martínez', 'López', 'García', 'Hernández', 'Ramírez', 'Torres', 'Díaz', 'Moreno', 'Rojas', 'Vargas', 'Castro', 'Ortiz', 'Suárez', 'Jiménez', 'Muñoz', 'Restrepo', 'Ospina', 'Cárdenas'];
  const PLACES = ['Chapinero', 'Suba', 'Kennedy', 'Usaquén', 'Laureles', 'Envigado', 'Bello', 'Ciudad Jardín', 'El Prado', 'Soledad', 'Cabecera', 'Floridablanca', 'Pance', 'Normandía'];
  const MSGS = ['Quisiera saber precios y disponibilidad.', 'Me pueden llamar después de las 5 p.m.', 'Necesito una cotización para esta semana.', '¿Tienen financiación?', 'Prefiero que me escriban por WhatsApp.', '¿Atienden los sábados?', ''];
  const SOURCES = [['facebook', 'paid_social', 30], ['instagram', 'paid_social', 25], ['tiktok', 'paid_social', 15], ['google', 'cpc', 12], ['whatsapp', 'referido', 10], ['', '', 8]];
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const weighted = (list) => { const t = list.reduce((a, x) => a + x[x.length - 1], 0); let r = Math.random() * t; for (const x of list) { r -= x[x.length - 1]; if (r <= 0) return x; } return list[0]; };

  const fakeLead = (s) => {
    const first = rnd(NAMES); const last = rnd(LAST) + ' ' + rnd(LAST);
    const data = {};
    s.form.fields.forEach((f) => {
      const o = (f.options || []).filter(Boolean);
      if (f.key === 'nombre') data.nombre = first + ' ' + last;
      else if (f.type === 'tel') data[f.key] = '3' + rnd(['00', '01', '10', '12', '15', '20', '23', '50', '04']) + String(Math.floor(1000000 + Math.random() * 8999999));
      else if (f.type === 'email') data[f.key] = Math.random() < 0.85 ? U.slug(first + '.' + last.split(' ')[0], 'cliente').replace(/-/g, '.') + Math.floor(Math.random() * 90 + 10) + '@' + rnd(['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com']) : '';
      else if (f.type === 'select' || f.type === 'radio') data[f.key] = o.length ? rnd(o) : '';
      else if (f.type === 'checkbox') data[f.key] = o.length ? rnd(o) : '';
      else if (f.type === 'date') data[f.key] = new Date(Date.now() + Math.floor(Math.random() * 20 + 1) * 864e5).toISOString().slice(0, 10);
      else if (f.type === 'time') data[f.key] = rnd(['08:00', '10:30', '14:00', '16:30']);
      else if (f.type === 'number') data[f.key] = String(Math.floor(Math.random() * 110 + 10));
      else if (f.type === 'textarea') data[f.key] = rnd(MSGS);
      else if (f.type === 'hidden') data[f.key] = f.placeholder || '';
      else if (/ciudad|zona|barrio|direcc/.test(f.key)) data[f.key] = rnd(PLACES);
      else if (/marca/.test(f.key)) data[f.key] = rnd(['LG', 'Samsung', 'Carrier', 'Haceb', 'Mabe', 'Whirlpool']);
      else data[f.key] = '';
    });
    const src = weighted(SOURCES);
    const at = Date.now() - Math.floor(Math.random() * 14 * 864e5);
    const status = weighted([['nuevo', 40], ['contactado', 25], ['agendado', 18], ['cliente', 10], ['descartado', 7]])[0];
    return { id: U.uid('ld_'), at, data, source: 'datos de prueba', status, utm: src[0] ? { utm_source: src[0], utm_medium: src[1], utm_campaign: 'campana-' + U.slug(s.client.name).split('-')[0] } : {}, device: weighted([['Celular', 70], ['Computador', 25], ['Tableta', 5]])[0] };
  };
  A['lead-fake'] = async () => {
    App.modal({
      title: 'Generar datos de prueba', sub: 'Interesados ficticios con nombres, teléfonos y servicios coherentes con tu formulario. Sirven para practicar el análisis y la exportación a Excel.',
      body: `<div class="grid g3" style="gap:8px">${[5, 15, 40].map((n) => `<button class="step-card" data-a="lead-fake-go" data-n="${n}"><div class="n">${n}</div><div class="grow"><b>${n} leads</b><small>${n === 5 ? 'Práctica rápida' : n === 15 ? 'Semana de campaña' : 'Mes de pauta'}</small></div></button>`).join('')}</div><p class="small muted">También suma visitas simuladas para que la tasa de conversión sea realista (entre 4% y 12%).</p>`
    });
  };
  A['lead-fake-go'] = (el) => {
    const s = App.s; const n = Number(el.dataset.n);
    for (let i = 0; i < n; i++) App.addLead(fakeLead(s), 'datos de prueba', true);
    s.analytics.view = (s.analytics.view || 0) + Math.round(n * (8 + Math.random() * 12));
    s.analytics.form_start = (s.analytics.form_start || 0) + Math.round(n * 1.6);
    s.analytics.whatsapp = (s.analytics.whatsapp || 0) + Math.round(n * 0.7);
    App.closeOverlay();
    App.commit(n + ' leads de prueba generados', { render: true });
  };

  /* ---------------- Alta manual, importación y nube ---------------- */
  A['lead-add'] = () => {
    const s = App.s;
    const fields = s.form.fields.filter((f) => f.type !== 'hidden');
    App.modal({
      title: 'Agregar lead manual', sub: 'Registra un interesado que llegó por llamada, visita o redes sociales.',
      body: `<form id="lead-form" class="stack" style="gap:10px">${fields.map((f) => `<div class="field"><label>${esc(f.label)}${f.required ? ' <span class="req">*</span>' : ''}</label>${['select', 'radio', 'checkbox'].includes(f.type) ? `<select class="select" name="${esc(f.key)}"><option value="">Selecciona</option>${App.opts(f.options || [], '')}</select>` : f.type === 'textarea' ? `<textarea class="textarea" name="${esc(f.key)}" rows="2"></textarea>` : `<input class="input" name="${esc(f.key)}" type="${['date', 'time', 'number', 'email', 'tel'].includes(f.type) ? f.type : 'text'}">`}</div>`).join('')}
        <div class="frow">${App.field('Origen', `<select class="select" name="_src">${App.opts(['llamada', 'visita al local', 'redes sociales', 'referido', 'feria o evento', 'manual'], 'llamada')}</select>`)}${App.field('Estado', `<select class="select" name="_st">${App.opts(SV.LEAD_STATUSES.map((x) => [x.id, x.label]), 'nuevo')}</select>`)}</div></form>`,
      foot: `<button class="btn btn-soft" data-a="close-overlay">Cancelar</button><button class="btn btn-primary" data-a="lead-add-save">${ic('save')} Guardar lead</button>`
    });
  };
  A['lead-add-save'] = () => {
    const f = $('#lead-form'); const s = App.s;
    const data = {};
    s.form.fields.filter((x) => x.type !== 'hidden').forEach((x) => { data[x.key] = (f.elements[x.key] ? f.elements[x.key].value : '').trim(); });
    if (!data.nombre && !data.telefono) { App.toast('Escribe al menos el nombre o el teléfono', 'err'); return; }
    const l = App.addLead({ data, source: f.elements._src.value, status: f.elements._st.value }, f.elements._src.value);
    App.closeOverlay();
    App.commit('Lead manual: ' + (l.data.nombre || l.data.telefono), { render: true });
  };
  A['lead-import'] = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,text/csv';
    inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      try {
        const rows = U.parseCSV(await U.readFile(file));
        if (rows.length < 2) throw new Error('El archivo no tiene filas de datos.');
        const s = App.s;
        const norm = (h) => U.slug(h, '').replace(/-/g, '_');
        const alias = { nombre_completo: 'nombre', name: 'nombre', celular: 'telefono', celular_whatsapp: 'telefono', whatsapp: 'telefono', phone: 'telefono', telefono_celular: 'telefono', email: 'correo', correo_electronico: 'correo', e_mail: 'correo', servicio_de_interes: 'servicio', comentarios: 'mensaje', observaciones: 'mensaje' };
        const byLabel = {}; s.form.fields.forEach((f) => { byLabel[norm(f.label)] = f.key; byLabel[f.key] = f.key; });
        const head = rows[0].map((h) => { const n = norm(h); return byLabel[n] || alias[n] || n; });
        let n = 0;
        rows.slice(1).forEach((r) => {
          const data = {}; let st = 'nuevo'; let at = Date.now(); let notes = '';
          head.forEach((k, i) => {
            const v = (r[i] || '').trim(); if (!v) return;
            if (k === 'estado') { const m = SV.LEAD_STATUSES.find((x) => norm(x.label) === norm(v) || x.id === norm(v)); if (m) st = m.id; }
            else if (k === 'fecha') { const t = Date.parse(v); if (t) at = t; }
            else if (k === 'notas_de_seguimiento' || k === 'notas') notes = v;
            else if (!['origen', 'id_lead', 'dispositivo'].includes(k)) data[k] = v;
          });
          if (Object.keys(data).length && App.addLead({ data, status: st, at, notes, source: 'importado' }, 'importado', true)) n++;
        });
        App.commit(n + ' leads importados desde CSV', { render: true });
        App.toast(n + ' leads importados', 'ok', 'upload_file');
      } catch (e) { App.toast('No se pudo importar: ' + e.message, 'err'); }
    };
    inp.click();
  };
  A['sync-leads'] = async (el) => {
    const s = App.s; const url = s.form.destinations.sheets.url || SV.config().nubeUrl;
    if (!s.cloud.token) { App.toast('Publica primero con la nube activa', 'err'); return; }
    el.disabled = true;
    try {
      const r = await SV.cloud.leads(url, s.id, s.cloud.token);
      let n = 0;
      (r.leads || []).forEach((l) => { if (App.addLead(Object.assign({}, l, { source: l.source || 'nube' }), 'nube', true)) n++; });
      s.analytics.cloudVisits = Number(r.visitas) || 0;
      s.cloud.lastSync = Date.now();
      App.commit(n ? n + ' lead(s) nuevos desde la nube' : 'Sincronización con la nube sin leads nuevos', { render: true });
      App.toast(n ? n + ' lead(s) nuevos desde la nube' : 'La base de datos ya está al día', 'ok', 'cloud_done');
    } catch (e) { App.toast(e.message, 'err'); el.disabled = false; }
  };

  /* ---------------- Detalle y seguimiento ---------------- */
  const templatesWa = (s, l) => {
    const n = (l.data.nombre || '').split(' ')[0];
    const serv = svc(l) || 'nuestros servicios';
    return [
      ['Saludo inicial', `Hola ${n}, te saluda el equipo de ${s.client.name}. Recibimos tu solicitud sobre ${serv}. ¿Tienes unos minutos para ayudarte?`],
      ['Agendar cita o visita', `Hola ${n}, ¿qué día y hora te queda mejor para la cita o visita de ${serv}? Tenemos disponibilidad esta semana.`],
      ['Enviar cotización', `Hola ${n}, te comparto la cotización de ${serv}. Quedo atento a tus preguntas.`],
      ['Recordatorio', `Hola ${n}, te escribimos de ${s.client.name} para recordarte tu solicitud de ${serv}. ¿Seguimos adelante?`]
    ];
  };
  A['lead-open'] = (el) => {
    const s = App.s; const l = s.leads.find((x) => x.id === el.dataset.id); if (!l) return;
    const labels = {}; s.form.fields.forEach((f) => { labels[f.key] = f.label; });
    const tel = phoneWa(l.data.telefono);
    App.drawer({
      title: esc(l.data.nombre || 'Lead sin nombre'), sub: 'Registrado ' + esc(U.fmtDate(l.at)), icon: 'person',
      body: `<div class="row">${SV.LEAD_STATUSES.map((x) => `<button class="chip ${x.id === l.status ? x.chip : 'gray'}" data-a="lead-set-st" data-id="${l.id}" data-st="${x.id}">${ic(x.icon, 'sm')} ${esc(x.label)}</button>`).join('')}</div>
        <div class="card flat"><dl class="detail-grid">${Object.keys(l.data).filter((k) => l.data[k]).map((k) => `<dt>${esc(labels[k] || k)}</dt><dd>${esc(l.data[k])}</dd>`).join('')}${l.interes ? `<dt>Interés</dt><dd>${esc(l.interes)}</dd>` : ''}<dt>Origen</dt><dd>${esc(srcLabel(l))}</dd>${Object.keys(l.utm || {}).map((k) => `<dt>${esc(k)}</dt><dd>${esc(l.utm[k])}</dd>`).join('')}${l.device ? `<dt>Dispositivo</dt><dd>${esc(l.device)}</dd>` : ''}</dl></div>
        <div class="field"><label>Notas de seguimiento</label><textarea class="textarea" rows="4" data-lead-note="${l.id}" placeholder="Ej: Se llamó el martes, pide cotización para 2 equipos...">${esc(l.notes || '')}</textarea></div>
        ${tel ? `<div class="field"><label>Respuestas rápidas por WhatsApp</label><div class="stack" style="gap:6px">${templatesWa(s, l).map(([t, m]) => `<a class="step-card" href="https://wa.me/${tel}?text=${encodeURIComponent(m)}" target="_blank" rel="noopener" data-a="lead-contacted" data-id="${l.id}">${ic('chat', 'ok-t')}<div class="grow"><b>${esc(t)}</b><small>${esc(m.slice(0, 80))}...</small></div></a>`).join('')}</div></div>` : ''}
        <div class="field"><label>Historial</label><div class="log">${(l.history || []).map((h) => `<div>${ic('history', 'sm ok-t')}<span class="grow">${esc(h.text)}</span><span class="tiny muted">${esc(U.timeAgo(h.at))}</span></div>`).join('')}</div></div>`,
      foot: `<button class="btn btn-danger" data-a="lead-del" data-id="${l.id}">${ic('delete')} Eliminar</button>${l.data.telefono ? `<a class="btn btn-soft" href="tel:${esc(U.digits(l.data.telefono))}">${ic('call')} Llamar</a>` : ''}<button class="btn btn-primary" data-a="close-overlay">Listo</button>`
    });
  };
  const setStatus = (l, st) => {
    if (l.status === st) return;
    l.history = (l.history || []).concat([{ at: Date.now(), text: 'Estado: ' + stOf(l.status).label + ' → ' + stOf(st).label }]);
    l.status = st;
  };
  A['lead-set-st'] = (el) => {
    const l = App.s.leads.find((x) => x.id === el.dataset.id); if (!l) return;
    setStatus(l, el.dataset.st);
    App.closeOverlay();
    App.commit('Lead ' + (l.data.nombre || '') + ': ' + stOf(l.status).label, { render: true });
    A['lead-open']({ dataset: { id: l.id } });
  };
  A['lead-contacted'] = (el) => {
    const l = App.s.leads.find((x) => x.id === el.dataset.id); if (!l) return;
    if (l.status === 'nuevo') setStatus(l, 'contactado');
    l.history.push({ at: Date.now(), text: 'Mensaje de WhatsApp enviado' });
    App.commit(null, { parts: ['leadbody'] });
  };
  A['lead-del'] = async (el) => {
    const s = App.s; const l = s.leads.find((x) => x.id === el.dataset.id); if (!l) return;
    if (!(await App.confirm('Eliminar lead', `¿Eliminar a <b>${esc(l.data.nombre || 'este lead')}</b> de la base de datos?`, { ok: 'Eliminar', danger: true }))) return;
    s.leads = s.leads.filter((x) => x.id !== l.id);
    App.ui.leadSel.delete(l.id);
    App.closeOverlay(true);
    App.commit('Lead eliminado', { render: true });
  };
  App.DROP.lead = (kind, id, i, zone) => {
    if (kind !== 'lead') return;
    const l = App.s.leads.find((x) => x.id === id); if (!l) return;
    setStatus(l, zone.dataset.status);
    App.commit('Lead ' + (l.data.nombre || '') + ' movido a ' + stOf(l.status).label, { render: true });
  };

  /* ---------------- Tabla: filtros, selección y acciones masivas ---------------- */
  A['lead-view'] = (el) => { App.ui.leadView = el.dataset.v; App.render(); };
  A['lead-page'] = (el) => { App.ui.leadPage = Math.max(1, Number(el.dataset.p)); refreshBody(); };
  A['lead-sel'] = (el) => { const id = el.dataset.id; if (el.checked) App.ui.leadSel.add(id); else App.ui.leadSel.delete(id); refreshBody(); };
  A['lead-sel-all'] = (el) => {
    const list = filtered(App.s).slice((App.ui.leadPage - 1) * PER, App.ui.leadPage * PER);
    list.forEach((l) => { if (el.checked) App.ui.leadSel.add(l.id); else App.ui.leadSel.delete(l.id); });
    refreshBody();
  };
  A['lead-bulk-clear'] = () => { App.ui.leadSel = new Set(); refreshBody(); };
  A['lead-bulk-st'] = () => {
    const st = $('#bulk-st').value;
    App.s.leads.filter((l) => App.ui.leadSel.has(l.id)).forEach((l) => setStatus(l, st));
    const n = App.ui.leadSel.size; App.ui.leadSel = new Set();
    App.commit(n + ' leads cambiados a ' + stOf(st).label, { render: true });
  };
  A['lead-bulk-del'] = async () => {
    const n = App.ui.leadSel.size;
    if (!(await App.confirm('Eliminar leads', `¿Eliminar ${n} lead(s) seleccionados?`, { ok: 'Eliminar', danger: true }))) return;
    App.s.leads = App.s.leads.filter((l) => !App.ui.leadSel.has(l.id));
    App.ui.leadSel = new Set();
    App.commit(n + ' leads eliminados', { render: true });
  };
  A['lead-bulk-xlsx'] = () => exportXlsx(App.s.leads.filter((l) => App.ui.leadSel.has(l.id)), '-seleccion');

  App.INPUT.push((el, e) => {
    if (el.id === 'lead-q') { App.ui.leadQ = el.value; App.ui.leadPage = 1; refreshBody(); return true; }
    if (el.id === 'lead-st' || el.id === 'lead-src') { if (e.type !== 'change') return true; App.ui[el.id === 'lead-st' ? 'leadSt' : 'leadSrc'] = el.value; App.ui.leadPage = 1; refreshBody(); return true; }
    if (el.id === 'bulk-st') return true;
    if (el.dataset.leadSt) {
      if (e.type !== 'change') return true;
      const l = App.s.leads.find((x) => x.id === el.dataset.leadSt); if (!l) return true;
      setStatus(l, el.value);
      el.className = 'select st-select st-' + el.value;
      App.commit('Lead ' + (l.data.nombre || '') + ': ' + stOf(l.status).label);
      return true;
    }
    if (el.dataset.leadNote) {
      const l = App.s.leads.find((x) => x.id === el.dataset.leadNote); if (!l) return true;
      l.notes = el.value;
      App.commit(null);
      return true;
    }
    return false;
  });
})(window.SV);

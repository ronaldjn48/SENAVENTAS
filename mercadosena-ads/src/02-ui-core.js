/* ============ UI: estado de interfaz, helpers y shell ============ */
const UI = { range: 'all', adsSort: 'clicks', adsQ: '', adsCamp: 'all', pending: {}, campQ: '', campF: 'all', live: null, bulk: false };
let PD = null;          // borrador de producto (memoria)
let RPT = null;         // borrador de reporte
let CONFIRM = null;
const NAV = [['inicio', 'Inicio', 'home'], ['productos', 'Productos', 'pkg'], ['campanas', 'Campañas', 'flag'], ['anuncios', 'Anuncios', 'bag'], ['metricas', 'Métricas', 'chart']];
const SIDE_EXTRA = [['acos', 'Calculadora ACOS', 'calc'], ['reporte', 'Reportes', 'file'], ['roas', 'Ajustes de ROAS', 'sliders'], ['datos', 'Datos y descarga', 'download']];
const TITLES = { inicio: 'Ruta del aprendiz', productos: 'Productos', campanas: 'Campañas', anuncios: 'Anuncios', anuncio: 'Detalle del anuncio', metricas: 'Métricas', acos: 'Calculadora ACOS', reporte: 'Reportes', roas: 'Ajustes de ROAS', datos: 'Datos y descarga' };

const go = h => { if (location.hash === h) render(); else location.hash = h; };
const route = () => { const h = (location.hash || '#/inicio').replace(/^#\/?/, '').split('?')[0].split('/'); return { name: h[0] || 'inicio', a: h[1], b: h[2] }; };
function toast(msg, kind) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = (kind === 'warn' ? ic('warn', 's18') : ic('checkc', 's18')) + '<span>' + esc(msg) + '</span>';
  document.body.appendChild(t); setTimeout(() => t.remove(), 3200);
}
function sheet(html) { closeSheet(); const d = document.createElement('div'); d.className = 'sheet-bg'; d.innerHTML = `<div class="sheet">${html}</div>`; d.addEventListener('click', e => { if (e.target === d) closeSheet(); }); document.body.appendChild(d); }
function closeSheet() { $$('.sheet-bg').forEach(x => x.remove()); }
function confirmBox(title, body, label, fn) {
  CONFIRM = fn;
  sheet(`<div class="col gap12"><h3 class="t-h3">${esc(title)}</h3><p class="c-var">${esc(body)}</p><div class="row gap8 mt8"><button class="btn gho grow" data-act="closeSheet">Cancelar</button><button class="btn dng grow" data-act="confirmYes">${esc(label)}</button></div></div>`);
}
function getPath(o, p) { return p.split('.').reduce((a, k) => a == null ? a : a[k], o); }
function setPath(o, p, v) { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; }
function R(root) { if (root === 'pd') return PD; if (root === 'cd') return S.draft; if (root === 'rp') return RPT; if (root === 'ac') return CALC; if (root === 'ax') return S.acos; if (root && root.startsWith('c:')) return campById(root.slice(2)); return null; }

/* ---- Piezas visuales reutilizables ---- */
const banner = (n, title, text, extra = '') => `<section class="banner"><div class="row-top gap12"><div class="num">${n}</div><div class="grow col gap4"><h2 class="t-h3">${title}</h2><p class="c-var">${text}</p>${extra}</div></div></section>`;
const sw = (on, act, data = '') => `<span class="switch-wrap" data-act="${act}" ${data} role="switch" aria-checked="${on}" tabindex="0"><span class="switch ${on ? 'on' : ''}"></span></span>`;
const thumb = (p, cls = '') => { const i = p && p.images && p.images[0]; return i ? `<img class="thumb ${cls}" src="${i.src}" alt="${esc(p.title)}">` : `<div class="thumb ${cls}" style="display:flex;align-items:center;justify-content:center;color:var(--secondary)">${ic('image', 's24')}</div>`; };
const statBox = (k, v, s = '', cls = '') => `<div class="stat"><span class="k">${k}</span><span class="v ${cls}">${v}</span>${s ? `<span class="s">${s}</span>` : ''}</div>`;
const kv = (k, v, cls = '') => `<div class="kv"><span class="k">${k}</span><span class="v ${cls}">${v}</span></div>`;
const emptyState = (title, text, btn) => `<div class="card empty"><div class="ill"><i style="width:40px;background:var(--secondary-fixed-dim)"></i><i style="width:32px;background:var(--outline-variant)"></i><i style="width:24px;background:var(--primary-fixed)"></i></div><h3 class="t-h3">${title}</h3><p class="c-sec" style="max-width:340px">${text}</p>${btn || ''}</div>`;
const acosCls = (acos, p) => !isFinite(acos) ? 'c-sec' : (p ? acos <= margin(p) : acos <= 25) ? 'c-prc' : 'c-err';
const pageHead = (title, right = '', sub = '') => `<div class="row between gap8 wrap"><div class="grow"><h1 class="t-h2">${title}</h1>${sub ? `<p class="c-sec t-sm">${sub}</p>` : ''}</div>${right}</div>`;
const simBar = () => `<div class="card flat row between wrap gap8 noprint"><div class="row gap8">${ic('clock', 's18')}<div><div class="t-lbl">Día simulado ${S.sim.day}</div><div class="t-sm c-sec">Avanza el tiempo para que los anuncios generen resultados</div></div></div><div class="row gap8 wrap"><button class="btn sec sm" data-act="sim" data-n="1">${ic('play', 's14')} +1 día</button><button class="btn sec sm" data-act="sim" data-n="7">+7 días</button><button class="btn sec sm" data-act="sim" data-n="30">+30 días</button><button class="btn ${UI.live ? 'pri' : 'gho'} sm" data-act="live">${ic(UI.live ? 'pause' : 'zap', 's14')} ${UI.live ? 'Detener' : 'En vivo'}</button></div></div>`;
const rangeFrom = () => UI.range === 'all' ? 0 : Math.max(0, S.sim.day - UI.range);
const rangeLabel = () => ({ all: 'Todo el periodo', 1: 'Último día', 7: 'Últimos 7 días', 30: 'Últimos 30 días' }[UI.range]);

function barsChart(from, to, camps) {
  const n = to - from + 1; if (n <= 0) return '<p class="c-sec t-sm center" style="padding:32px 0">Aún no hay días simulados. Avanza el tiempo para ver el comportamiento.</p>';
  const size = n <= 14 ? 1 : 7; const bk = [];
  for (let s = from; s <= to; s += size) { const e = Math.min(to, s + size - 1); bk.push({ l: size === 1 ? 'D' + (s + 1) : 'S' + (bk.length + 1), a: allMetrics(s, e, camps).revenue, o: organicSum(s, e).revenue }); }
  const v = bk.slice(-10); const mx = Math.max(1, ...v.map(x => Math.max(x.a, x.o)));
  return `<div class="bars">${v.map(x => `<div class="g" title="${x.l} · Ads ${money(x.a)} · Orgánico ${money(x.o)}"><div class="pair"><div class="b1" style="height:${x.o / mx * 100}%"></div><div class="b2" style="height:${x.a / mx * 100}%"></div></div></div>`).join('')}</div><div class="row" style="justify-content:space-between;padding:4px">${v.map(x => `<span class="t-xs c-sec grow center">${x.l}</span>`).join('')}</div>`;
}
function lineChart(camps, from, to) {
  const pts = []; for (let d = from; d <= to; d++) { const m = allMetrics(d, d, camps); pts.push(m); }
  if (pts.length < 2) return '<p class="c-sec t-sm center" style="padding:24px 0">Simula al menos 2 días para ver la tendencia.</p>';
  const W = 300, H = 90, mx = Math.max(1, ...pts.map(p => Math.max(p.revenue, p.cost)));
  const path = k => pts.map((p, i) => (i ? 'L' : 'M') + (i / (pts.length - 1) * W).toFixed(1) + ' ' + (H - 6 - p[k] / mx * (H - 12)).toFixed(1)).join(' ');
  return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${path('revenue')}" fill="none" stroke="#39a900" stroke-width="2.5" vector-effect="non-scaling-stroke"/><path d="${path('cost')}" fill="none" stroke="#ba1a1a" stroke-width="2" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/></svg><div class="legend t-sm"><span><i style="background:#39a900"></i>Ingresos por ads</span><span><i style="background:#ba1a1a"></i>Inversión</span></div>`;
}

/* ---- Shell ---- */
function shellHTML(r, body) {
  const logo = $('#logo-src').innerHTML;
  const cur = r.name === 'anuncio' ? 'anuncios' : r.name;
  const al = alerts();
  const side = [...NAV, null, ...SIDE_EXTRA].map(x => x ? `<a href="#/${x[0]}" class="${cur === x[0] ? 'on' : ''}">${ic(x[2])}<span>${x[1]}</span></a>` : '<div class="sep"></div>').join('');
  const nav = NAV.map(x => `<a href="#/${x[0]}" class="${cur === x[0] ? 'on' : ''}" ${cur === x[0] ? 'aria-current="page"' : ''}>${ic(x[2], 's24')}<span>${x[1]}</span></a>`).join('') + `<button class="navbtn" data-act="more">${ic('grid', 's24')}<span>Más</span></button>`;
  return `<header class="header"><div class="header-in"><div class="logo-wrap"><a href="#/inicio" aria-label="MercadoSENA Ads — inicio" class="logo">${logo}</a><div class="head-title"><span class="lab">Simulador educativo</span><span class="ttl trunc">${TITLES[r.name] || ''}</span></div></div><div class="row"><button class="icon-btn" data-act="alerts" aria-label="Notificaciones">${ic('bell', 's24')}${al.length ? '<span class="dot-badge"></span>' : ''}</button><button class="icon-btn" data-act="profile" aria-label="Perfil de vendedor"><span class="avatar">${ic('user', 's18')}</span></button></div></div></header>
  <aside class="side">${side}</aside><main class="main" id="main">${body}</main><nav class="nav"><div class="nav-in">${nav}</div></nav>`;
}
function alerts() {
  const a = [];
  S.campaigns.forEach(c => {
    if (c.status !== 'active') return;
    if (S.sim.day > 0) { const m = campMetrics(c, S.sim.day - 1, S.sim.day - 1); if (m.cost >= c.budgetDaily * .95) a.push({ t: 'Presupuesto agotado ayer', d: `${c.name} gastó ${money(m.cost)}. Evalúa subir el presupuesto si el ACOS es bueno.`, h: '#/campanas/' + c.id }); }
    c.ads.forEach(ad => { const p = prodById(ad.productId); if (!p) return; const m = adMetrics(ad); if (ad.active && m.sales >= 3 && m.acos > margin(p)) a.push({ t: 'ACOS por encima del margen', d: `${p.title}: ACOS ${pct(m.acos)} vs margen ${pct(margin(p))}. Cada venta pierde dinero.`, h: '#/anuncio/' + ad.id }); });
  });
  S.products.forEach(p => { if (p.stock <= 0) a.push({ t: 'Producto sin stock', d: `${p.title}: sus anuncios se pausaron automáticamente.`, h: '#/productos/' + p.id }); else if (p.stock <= 10) a.push({ t: 'Stock bajo', d: `${p.title}: quedan ${p.stock} unidades.`, h: '#/productos/' + p.id }); });
  return a;
}

/* ---- Ruteo y render ---- */
const VIEWS = {};
function render() {
  if (!AUTH.user) { $('#app').innerHTML = loginHTML(); document.title = 'Ingresar · MercadoSENA Ads'; window.scrollTo(0, 0); return; }
  const r = route(); const y = window.scrollY; const same = render.last === location.hash;
  const v = VIEWS[r.name] || VIEWS.inicio; let body;
  try { body = v(r); } catch (e) { console.error(e); body = `<div class="page"><div class="card">Ocurrió un error al mostrar esta pantalla: ${esc(e.message)}</div></div>`; }
  $('#app').innerHTML = shellHTML(r, body);
  window.scrollTo(0, same ? y : 0); render.last = location.hash;
  document.title = (TITLES[r.name] || 'Simulador') + ' · MercadoSENA Ads';
  if (VIEWS[r.name + '_after']) VIEWS[r.name + '_after'](r);
}
const rerender = () => render();

/* ---- Entrada de datos y acciones ---- */
const ACT = {};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const f = ACT[el.dataset.act]; if (f) { if (el.tagName !== 'A') e.preventDefault(); f(el, e); }
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-act][role="switch"],[data-act][role="radio"],[data-act][role="checkbox"]')) { e.preventDefault(); e.target.click(); } });
function onInput(e) {
  const el = e.target; if (!el.dataset || !el.dataset.set) return;
  const o = R(el.dataset.root); if (!o) return;
  let v = el.value; if (el.dataset.type === 'num') v = num(v); if (el.type === 'checkbox') v = el.checked;
  if (el.dataset.root === 'ax' && el.type === 'number' && v === '') v = '';
  else if (el.dataset.root === 'ax' && el.type === 'number') v = num(v);
  setPath(o, el.dataset.set, v);
  if (el.dataset.set.startsWith('audience.')) o.audience.touched = true;
  const rt = el.dataset.root;
  if (rt !== 'pd' && rt !== 'rp' && rt !== 'ac') save();
  if (rt === 'pd') liveProduct(); else if (rt === 'ac') liveAcos(); else if (rt !== 'rp' && rt !== 'ax') liveCamp(rt, el.dataset.set);
}
document.addEventListener('input', onInput);
document.addEventListener('change', e => { if (e.target.matches('select[data-set]')) onInput(e); });
ACT.closeSheet = closeSheet;
ACT.confirmYes = () => { const f = CONFIRM; CONFIRM = null; closeSheet(); if (f) f(); };
ACT.sim = el => { const n = +el.dataset.n; advance(n); toast(`Se simularon ${n} día${n > 1 ? 's' : ''}. Día actual: ${S.sim.day}.`); rerender(); };
ACT.live = () => {
  if (UI.live) { clearInterval(UI.live); UI.live = null; } else { UI.live = setInterval(() => { advance(1); rerender(); }, 2500); }
  rerender();
};
ACT.tog = el => {
  const o = R(el.dataset.root); const arr = getPath(o, el.dataset.path); const v = el.dataset.val; const i = arr.indexOf(v);
  if (i >= 0) arr.splice(i, 1); else arr.push(v);
  if (el.dataset.path.startsWith('audience.')) o.audience.touched = true;
  if (el.dataset.root !== 'pd') save(); rerender();
};
ACT.setv = el => { const o = R(el.dataset.root); let v = el.dataset.val; if (el.dataset.type === 'num') v = num(v); setPath(o, el.dataset.set, v); if (el.dataset.set.startsWith('audience.')) o.audience.touched = true; if (el.dataset.root !== 'pd') save(); rerender(); };
ACT.more = () => sheet(`<div class="col gap4"><h3 class="t-h3" style="margin-bottom:8px">Más herramientas</h3>${SIDE_EXTRA.map(x => `<a class="menu-item" href="#/${x[0]}" data-act="closeSheet">${ic(x[2], 's24')}<span>${x[1]}</span></a>`).join('')}</div>`);
ACT.alerts = () => {
  const a = alerts();
  sheet(`<h3 class="t-h3" style="margin-bottom:12px">Notificaciones</h3>${a.length ? a.map(x => `<a class="menu-item" href="${x.h}" data-act="closeSheet" style="align-items:flex-start">${ic('warn', 's24')}<div><div class="b">${esc(x.t)}</div><div class="t-sm c-sec" style="font-weight:400">${esc(x.d)}</div></div></a>`).join('') : '<p class="c-sec">No tienes alertas. Cuando una campaña agote su presupuesto, un producto se quede sin stock o un anuncio pierda dinero, aparecerá aquí.</p>'}`);
};
ACT.profile = () => sheet(`<div class="col gap12"><h3 class="t-h3">Perfil de vendedor</h3><div class="card flat row gap12"><span class="avatar">${ic('user', 's18')}</span><div class="grow"><div class="t-xs c-sec up">Sesión activa</div><div class="b">${esc(AUTH.user.name)}</div></div></div><div class="field"><label>Nombre de la tienda</label><input class="inp" id="sn" value="${esc(S.seller.name)}"></div><div class="field"><label>Ciudad</label><select class="sel" id="sc">${CITIES.map(c => `<option ${S.seller.city === c[0] ? 'selected' : ''}>${c[0]}</option>`).join('')}</select></div><button class="btn pri blk" data-act="saveProfile">Guardar</button><button class="btn out blk" data-act="logout">${ic('lock', 's16')} Cerrar sesión</button></div>`);
ACT.saveProfile = () => { S.seller.name = $('#sn').value.trim() || 'Mi tienda SENA'; S.seller.city = $('#sc').value; save(); closeSheet(); toast('Perfil actualizado'); };

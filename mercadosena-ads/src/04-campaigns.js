/* ============ Campañas ============ */
const newCamp = () => ({ id: uid('CAMP'), name: 'Campaña ' + (S.campaigns.length + 1), objective: 'ventas', roasTarget: 3, status: 'draft', budgetDaily: 10000, durationDays: 30, bid: 180, startDay: 0, audience: blankAudience(), groups: [{ id: uid('BLQ'), name: 'Bloque 1' }], ads: [], negatives: [], step: 1, createdAt: Date.now() });
function addAdTo(c, pid, gid) { if (c.ads.some(a => a.productId === pid)) return; c.ads.push({ id: uid('AD'), productId: pid, groupId: gid || c.groups[0].id, active: true, keywords: [], daily: [] }); }
function startDraft(ids) { S.draft = newCamp(); (ids || []).forEach(id => addAdTo(S.draft, id)); save(); }
const WSTEPS = ['Datos', 'Pauta', 'Audiencia', 'Palabras clave', 'Presupuesto', 'Lanzamiento'];

function validateCamp(c) {
  const e = [], w = [];
  if (!c.name.trim()) e.push('Escribe un nombre para la campaña.');
  if (!c.ads.length) e.push('Selecciona al menos un producto para promocionar.');
  if (c.budgetDaily < 5000) e.push('El presupuesto diario mínimo es de $ 5.000 COP.');
  if (c.bid < 50) e.push('La puja base mínima es de $ 50 COP por clic.');
  if (c.durationDays < 1) e.push('La duración debe ser de al menos 1 día.');
  if (c.audience.geo.scope === 'ciudades' && !c.audience.geo.cities.length) e.push('Elige al menos una ciudad o cambia a cobertura nacional.');
  if (c.audience.demo.ageMin > c.audience.demo.ageMax) e.push('La edad mínima no puede superar la máxima.');
  if (c.audience.demo.genders.length === 0) e.push('Selecciona al menos un género.');
  c.ads.forEach(a => { const p = prodById(a.productId); if (!p) return; if (!a.keywords.length) w.push(`"${p.title}" no tiene palabras clave: se usará segmentación automática.`); if (productQuality(p).score < 50) w.push(`"${p.title}" tiene calidad baja (${productQuality(p).score}). Gastarás más por cada venta.`); });
  if (c.budgetDaily < c.bid * 10) w.push('Tu presupuesto diario alcanza para menos de 10 clics. Considera aumentarlo.');
  return { e, w };
}
function launch(c) {
  const v = validateCamp(c); if (v.e.length) { toast(v.e[0], 'warn'); return false; }
  c.status = 'active'; c.startDay = S.sim.day; delete c.step;
  if (S.draft && S.draft.id === c.id) { S.campaigns.push(c); S.draft = null; }
  save(); toast('Campaña lanzada. Simula días para ver resultados.'); go('#/campanas/' + c.id + '/resultados'); return true;
}

/* ---- Formularios compartidos ---- */
function audLive(c) {
  const ps = c.ads.map(a => prodById(a.productId)).filter(Boolean); const arr = (ps.length ? ps : [{ cat: 'alimentos', price: 50000, title: '', desc: '' }]).map(p => audienceStats(c.audience, p));
  const reach = sum(arr, x => x.reach) / arr.length, cvr = sum(arr, x => x.cvr) / arr.length, ctr = sum(arr, x => x.ctr) / arr.length;
  const lvl = reach > .5 ? ['info', 'Amplia'] : reach > .15 ? ['ok', 'Media'] : ['warn', 'Específica'];
  const a = c.audience; const bad = a.demo.ageMin > a.demo.ageMax;
  return `<div class="row between"><div class="t-lblm b">Alcance estimado</div><span class="badge ${lvl[0]}">Audiencia ${lvl[1]}</span></div>
  <div class="t-display" style="font-size:26px">${compact(Math.round(reach * AUDIENCE_BASE))} <span class="t-sm c-sec" style="font-weight:600">personas por día</span></div>
  <div class="prog"><i style="width:${Math.max(2, reach * 100)}%"></i></div>
  <div class="grid3"><div class="kv"><span class="k">Del marketplace</span><span class="v">${pct(reach * 100)}</span></div><div class="kv"><span class="k">Conversión</span><span class="v ${cvr >= 1 ? 'c-pri' : 'c-err'}">×${cvr.toFixed(2).replace('.', ',')}</span></div><div class="kv"><span class="k">CTR</span><span class="v ${ctr >= 1 ? 'c-pri' : 'c-err'}">×${ctr.toFixed(2).replace('.', ',')}</span></div></div>
  ${bad ? '<div class="err">La edad mínima no puede superar la máxima.</div>' : ''}
  <p class="hint">Una audiencia específica reduce impresiones pero sube la probabilidad de compra. Una audiencia amplia llega a más gente con menor conversión.</p>`;
}
function audienceForm(root, c) {
  const a = c.audience; const chip = (path, val, label, on) => `<button type="button" class="chip ${on ? 'on' : ''}" data-act="tog" data-root="${root}" data-path="${path}" data-val="${esc(val)}">${on ? ic('check', 's14') : ''}${esc(label)}</button>`;
  const opt = (on, act, data, title, d, type = 'radio') => `<div class="opt ${on ? 'on' : ''}" data-act="${act}" ${data} role="${type}" aria-checked="${on}" tabindex="0">${type === 'radio' ? '<div class="radio"><i></i></div>' : `<div class="cbx">${on ? ic('check', 's14') : ''}</div>`}<div class="grow"><div class="b">${title}</div><div class="t-sm c-sec">${d}</div></div></div>`;
  return `<div class="col gap16">
  <section class="card col gap12"><div class="row gap8">${ic('pin', 's18')}<h3 class="t-h3">Geografía</h3></div>
    ${opt(a.geo.scope === 'nacional', 'setv', `data-root="${root}" data-set="audience.geo.scope" data-val="nacional"`, 'Todo el país', 'Llegas a compradores de cualquier ciudad de Colombia.')}
    ${opt(a.geo.scope === 'ciudades', 'setv', `data-root="${root}" data-set="audience.geo.scope" data-val="ciudades"`, 'Ciudades específicas', 'Concentra la inversión donde puedes entregar mejor.')}
    ${a.geo.scope === 'ciudades' ? `<div class="chips wrapped">${CITIES.map(ct => chip('audience.geo.cities', ct[0], ct[0], a.geo.cities.includes(ct[0]))).join('')}</div>` : ''}</section>
  <section class="card col gap12"><div class="row gap8">${ic('users', 's18')}<h3 class="t-h3">Demografía</h3></div>
    <div class="grid2"><div class="field"><label for="${root}-amin">Edad mínima</label><input id="${root}-amin" class="inp" type="number" min="18" max="65" inputmode="numeric" data-root="${root}" data-set="audience.demo.ageMin" data-type="num" value="${a.demo.ageMin}"></div><div class="field"><label for="${root}-amax">Edad máxima</label><input id="${root}-amax" class="inp" type="number" min="18" max="65" inputmode="numeric" data-root="${root}" data-set="audience.demo.ageMax" data-type="num" value="${a.demo.ageMax}"></div></div>
    <div class="field"><span class="lbl">Género</span><div class="chips wrapped">${chip('audience.demo.genders', 'mujer', 'Mujeres', a.demo.genders.includes('mujer'))}${chip('audience.demo.genders', 'hombre', 'Hombres', a.demo.genders.includes('hombre'))}</div></div>
    <div class="field"><span class="lbl">Nivel de ingresos (opcional)</span><div class="chips wrapped">${Object.entries(INCOMES).map(([k, v]) => chip('audience.demo.incomes', k, v[0], a.demo.incomes.includes(k))).join('')}</div></div></section>
  <section class="card col gap12"><div class="row gap8">${ic('store', 's18')}<h3 class="t-h3">Tipo de comprador</h3></div><p class="hint">Elige uno o varios. Sin selección se muestra a todos.</p>
    ${Object.entries(BUYERS).map(([k, b]) => opt(a.behavior.buyers.includes(k), 'tog', `data-root="${root}" data-path="audience.behavior.buyers" data-val="${k}"`, b.name, b.d, 'checkbox')).join('')}</section>
  <section class="card col gap12"><div class="row gap8">${ic('click', 's18')}<h3 class="t-h3">Comportamiento e intereses</h3></div>
    <div class="field"><span class="lbl">Intereses de compra</span><div class="chips wrapped">${INTERESTS.map(i => chip('audience.behavior.interests', i, i, a.behavior.interests.includes(i))).join('')}</div></div>
    <div class="field"><span class="lbl">Dispositivo</span><div class="chips wrapped">${Object.entries(DEVICES).map(([k, v]) => chip('audience.behavior.devices', k, v[0], a.behavior.devices.includes(k))).join('')}</div></div></section>
  <section class="card hl col gap8" id="audlive">${audLive(c)}</section></div>`;
}
function kwSuggestions(p) {
  const w = norm(p.title).split(/\s+/).filter(x => x.length > 2 && !/^(con|para|del|los|las|una|por)$/.test(x)); const cat = CATS[p.cat] || CATS.alimentos; const out = [];
  if (w.length >= 2) out.push(w.slice(0, 2).join(' ')); if (w.length >= 3) out.push(w.slice(0, 3).join(' ')); if (w[0]) out.push(w[0]); if (w[0]) out.push(norm(cat.name).split(/\s+/)[0] + ' ' + w[0]);
  return [...new Set(out)];
}
function keywordsForm(root, c) {
  return `<div class="col gap16">
  <section class="card flat col gap8"><h3 class="t-lblm b">Tipos de coincidencia</h3>${Object.values(MATCH).map(m => `<div class="t-sm"><b>${m.n}:</b> <span class="c-var">${m.d}</span></div>`).join('')}</section>
  ${c.ads.length ? c.ads.map((a, i) => { const p = prodById(a.productId); if (!p) return ''; const sug = kwSuggestions(p).filter(s => !a.keywords.some(k => norm(k.term) === s));
    return `<section class="card col gap12"><div class="row gap12">${thumb(p, 'sm')}<div class="grow"><div class="b trunc">${esc(p.title)}</div><div class="t-sm c-sec">${a.keywords.length} palabra${a.keywords.length === 1 ? '' : 's'} clave · ${esc((groupOf(c, a) || {}).name || '')}</div></div></div>
    ${a.keywords.length ? `<div class="col gap8">${a.keywords.map((k, j) => { const st = kwStats(k.term, p, c); return `<div class="kwrow"><span class="b grow" style="min-width:90px">${esc(k.term)}</span><select class="sel" aria-label="Coincidencia" data-root="${root}" data-set="ads.${i}.keywords.${j}.match">${Object.entries(MATCH).map(([mk, m]) => `<option value="${mk}" ${k.match === mk ? 'selected' : ''}>${m.n}</option>`).join('')}</select><input class="inp bid" type="number" min="50" step="10" aria-label="Puja" data-root="${root}" data-set="ads.${i}.keywords.${j}.bid" data-type="num" value="${k.bid}"><button class="icon-btn" style="width:34px;height:34px" data-act="delKw" data-root="${root}" data-i="${i}" data-j="${j}" aria-label="Quitar palabra">${ic('x', 's16')}</button><span class="t-xs c-sec" style="flex-basis:100%">Relevancia ${st.rel >= .75 ? 'alta' : st.rel >= .4 ? 'media' : 'baja'} · CPC de mercado ≈ ${money(st.marketCpc)}</span></div>`; }).join('')}</div>` : `<p class="hint">Sin palabras clave: el sistema usará segmentación automática con las primeras palabras del título (coincidencia amplia).</p>`}
    <div class="row gap8 wrap"><input id="kwi-${i}" class="inp grow" style="min-width:140px" placeholder="Escribe un término de búsqueda" data-enter="addKw" data-i="${i}" data-root="${root}"><select id="kwm-${i}" class="sel" style="width:auto">${Object.entries(MATCH).map(([k, m]) => `<option value="${k}" ${k === 'frase' ? 'selected' : ''}>${m.n}</option>`).join('')}</select><button class="btn sec" data-act="addKw" data-root="${root}" data-i="${i}">${ic('plus', 's16')} Agregar</button></div>
    ${sug.length ? `<div class="chips wrapped"><span class="t-sm c-sec" style="align-self:center">Sugeridas:</span>${sug.map(s => `<button class="chip soft" data-act="sugKw" data-root="${root}" data-i="${i}" data-term="${esc(s)}">${ic('plus', 's14')}${esc(s)}</button>`).join('')}</div>` : ''}</section>`; }).join('') : emptyState('Primero selecciona productos', 'Las palabras clave se asignan a cada anuncio.', '')}
  <section class="card col gap8"><div class="row gap8">${ic('x', 's18')}<h3 class="t-h3">Palabras negativas</h3></div><p class="hint">Evitan mostrarte en búsquedas que no te interesan y mejoran la precisión de la coincidencia amplia.</p>
    <div class="chips wrapped">${c.negatives.map((n, i) => `<button class="chip" data-act="delNeg" data-root="${root}" data-i="${i}">${esc(n)} ${ic('x', 's14')}</button>`).join('') || '<span class="t-sm c-sec">Aún no tienes palabras negativas.</span>'}</div>
    <div class="row gap8"><input id="neg-${root}" class="inp grow" placeholder="Ej. usado, gratis, repuesto" data-enter="addNeg" data-root="${root}"><button class="btn sec" data-act="addNeg" data-root="${root}">${ic('plus', 's16')} Agregar</button></div></section></div>`;
}
function budLive(c) {
  const e = campEstimate(c); const tot = c.budgetDaily * c.durationDays; const sp = Math.min(e.cost, c.budgetDaily);
  const low = c.budgetDaily < 5000;
  return `<div class="row between"><div class="t-lblm b">Proyección diaria (estimada)</div><span class="badge info">Estimación</span></div>
  <div class="grid2">${statBox('Impresiones', int(e.imp))}${statBox('Clics', int(e.clicks), 'CPC ' + money(e.cpc))}${statBox('Inversión / día', money(sp))}${statBox('Ventas / día', e.sales.toFixed(1).replace('.', ','), money(e.revenue))}</div>
  <div class="row between"><span>ACOS estimado</span><b class="${acosCls(e.acos)}">${pct(e.acos)}</b></div><div class="row between"><span>ROAS estimado</span><b>${isFinite(e.roas) ? e.roas.toFixed(1).replace('.', ',') + 'x' : '—'}</b></div>
  <div class="row between"><span>Inversión máxima total (${c.durationDays} días)</span><b>${money(tot)}</b></div>
  ${low ? '<div class="err">El presupuesto mínimo es $ 5.000 por día.</div>' : ''}
  ${e.cost >= c.budgetDaily * .98 ? '<div class="t-sm c-amb b">El presupuesto se agota antes de terminar el día. Subirlo puede aumentar las ventas.</div>' : ''}
  <p class="hint">Es un promedio esperado. En la simulación habrá variación diaria y una fase de aprendizaje de ${LEARN_DAYS} días.</p>`;
}
const roasNote = c => `ROAS ${String(c.roasTarget).replace('.', ',')}x equivale a un ACOS objetivo de <b>${pct(100 / c.roasTarget)}</b>: por cada $ 1 invertido esperas $ ${String(c.roasTarget).replace('.', ',')} en ventas.`;
function budgetForm(root, c, withRoas) {
  return `<div class="col gap16"><section class="card col gap16">
  <div class="field"><label for="${root}-bd">Presupuesto diario (COP)</label><input id="${root}-bd" class="inp" type="number" inputmode="numeric" min="5000" step="1000" data-root="${root}" data-set="budgetDaily" data-type="num" value="${c.budgetDaily}"><div class="chips">${[5000, 10000, 20000, 50000].map(v => `<button class="chip ${c.budgetDaily === v ? 'on' : ''}" data-act="setv" data-root="${root}" data-set="budgetDaily" data-type="num" data-val="${v}">${money(v)}</button>`).join('')}</div></div>
  <div class="grid2"><div class="field"><label for="${root}-bid">Puja base por clic (COP)</label><input id="${root}-bid" class="inp" type="number" inputmode="numeric" min="50" step="10" data-root="${root}" data-set="bid" data-type="num" value="${c.bid}"></div>
  <div class="field"><label for="${root}-dur">Duración</label><select id="${root}-dur" class="sel" data-root="${root}" data-set="durationDays" data-type="num">${[7, 15, 30, 60, 90].map(d => `<option value="${d}" ${c.durationDays === d ? 'selected' : ''}>${d} días</option>`).join('')}</select></div></div>
  <p class="hint">La puja es lo máximo que pagas por clic. Las palabras clave sin puja propia usan esta puja base. Con ROAS objetivo, el sistema la reduce si el clic sale más caro de lo rentable.</p>
  ${withRoas ? `<div class="field"><label>ROAS objetivo</label><div class="chips">${[2, 3, 5, 10].map(v => `<button class="chip ${c.roasTarget === v ? 'on' : ''}" data-act="setv" data-root="${root}" data-set="roasTarget" data-type="num" data-val="${v}">${v}x</button>`).join('')}</div><span id="roasnote" class="hint">${roasNote(c)}</span></div>` : ''}</section>
  <section class="card hl col gap8" id="budlive">${budLive(c)}</section></div>`;
}
function productPicker(root, c) {
  if (!S.products.length) return emptyState('No tienes productos', 'Crea al menos un producto para poder promocionarlo.', '<a class="btn pri" href="#/productos/nuevo">Crear producto</a>');
  return `<div class="col gap8">${S.products.map(p => { const on = c.ads.some(a => a.productId === p.id); const q = productQuality(p).score; return `<div class="opt ${on ? 'on' : ''}" data-act="togProd" data-root="${root}" data-id="${p.id}" role="checkbox" aria-checked="${on}" tabindex="0"><div class="cbx">${on ? ic('check', 's14') : ''}</div>${thumb(p, 'sm')}<div class="grow col gap4"><div class="b" style="line-height:18px">${esc(p.title)}</div><div class="row gap8 wrap t-sm"><span class="c-prc b">${money(p.price)}</span><span class="badge ${q >= 80 ? 'ok' : q >= 50 ? 'warn' : 'bad'}">Calidad ${q}</span><span class="c-sec">Margen ${pct(margin(p), 0)}</span></div></div></div>`; }).join('')}</div>`;
}
function blocksEditor(root, c) {
  return `<div class="col gap12">${c.groups.map((g, gi) => { const ads = c.ads.map((a, ai) => [a, ai]).filter(([a]) => a.groupId === g.id); return `<section class="card col gap12"><div class="row gap8">${ic('layers', 's18')}<input class="inp grow" aria-label="Nombre del bloque" data-root="${root}" data-set="groups.${gi}.name" value="${esc(g.name)}">${c.groups.length > 1 ? `<button class="icon-btn" style="width:36px;height:36px" data-act="delGroup" data-root="${root}" data-gi="${gi}" aria-label="Eliminar bloque">${ic('trash', 's16')}</button>` : ''}</div>
    ${ads.length ? ads.map(([a, ai]) => { const p = prodById(a.productId); return p ? `<div class="row gap8">${thumb(p, 'sm')}<div class="grow t-lbl" style="line-height:16px">${esc(p.title)}</div><select class="sel" style="width:auto;max-width:130px;min-height:36px" aria-label="Bloque" data-root="${root}" data-set="ads.${ai}.groupId" data-move="1">${c.groups.map(x => `<option value="${x.id}" ${x.id === a.groupId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>` : ''; }).join('') : '<p class="hint">Este bloque no tiene productos. Asigna alguno desde el selector de otro bloque.</p>'}</section>`; }).join('')}
  <button class="btn sec" data-act="addGroup" data-root="${root}">${ic('plus', 's16')} Agregar bloque de productos</button></div>`;
}
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.move) rerender(); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.enter) { e.preventDefault(); ACT[e.target.dataset.enter](e.target); } });
function liveCamp(root, path) {
  const c = R(root); if (!c) return;
  if (path.startsWith('audience.')) { const e = $('#audlive'); if (e) e.innerHTML = audLive(c); }
  if (['budgetDaily', 'bid', 'durationDays', 'roasTarget'].includes(path)) { const e = $('#budlive'); if (e) e.innerHTML = budLive(c); const r = $('#roasnote'); if (r) r.innerHTML = roasNote(c); }
}

/* ---- Acciones ---- */
ACT.togProd = el => { const c = R(el.dataset.root); const id = el.dataset.id; const ad = c.ads.find(a => a.productId === id); if (ad) { if (ad.daily.some(d => d && d.imp)) return confirmBox('Quitar anuncio', 'Perderás el historial de resultados de este anuncio en la campaña.', 'Quitar', () => { c.ads = c.ads.filter(a => a !== ad); save(); rerender(); }); c.ads = c.ads.filter(a => a !== ad); } else addAdTo(c, id, c.groups[0].id); save(); rerender(); };
ACT.addGroup = el => { const c = R(el.dataset.root); c.groups.push({ id: uid('BLQ'), name: 'Bloque ' + (c.groups.length + 1) }); save(); rerender(); };
ACT.delGroup = el => { const c = R(el.dataset.root); const g = c.groups[+el.dataset.gi]; const to = c.groups.find(x => x !== g); c.ads.forEach(a => { if (a.groupId === g.id) a.groupId = to.id; }); c.groups.splice(+el.dataset.gi, 1); save(); rerender(); };
function addKwTo(c, i, term, match) { term = term.trim().toLowerCase(); if (!term) return false; const a = c.ads[i]; if (a.keywords.some(k => norm(k.term) === norm(term))) { toast('Esa palabra clave ya existe en este anuncio', 'warn'); return false; } a.keywords.push({ term, match, bid: c.bid }); save(); return true; }
ACT.addKw = el => { const root = el.dataset.root, i = +el.dataset.i; const c = R(root); const inp = $('#kwi-' + i); if (addKwTo(c, i, inp.value, $('#kwm-' + i).value)) { rerender(); setTimeout(() => { const n = $('#kwi-' + i); if (n) n.focus(); }, 0); } };
ACT.sugKw = el => { const c = R(el.dataset.root); if (addKwTo(c, +el.dataset.i, el.dataset.term, 'frase')) rerender(); };
ACT.delKw = el => { const c = R(el.dataset.root); c.ads[+el.dataset.i].keywords.splice(+el.dataset.j, 1); save(); rerender(); };
ACT.addNeg = el => { const root = el.dataset.root; const c = R(root); const inp = $('[id="neg-' + root + '"]'); const t = inp.value.trim().toLowerCase(); if (!t) return; if (!c.negatives.includes(t)) c.negatives.push(t); save(); rerender(); };
ACT.delNeg = el => { const c = R(el.dataset.root); c.negatives.splice(+el.dataset.i, 1); save(); rerender(); };
ACT.step = el => { S.draft.step = +el.dataset.n; save(); rerender(); window.scrollTo(0, 0); };
ACT.next = () => {
  const c = S.draft; if (c.step === 1 && !c.name.trim()) return toast('Escribe un nombre para la campaña', 'warn');
  if (c.step === 2 && !c.ads.length) return toast('Selecciona al menos un producto', 'warn');
  if (c.step === 3) { const v = validateCamp(c).e.filter(x => /ciudad|edad|género/.test(x)); if (v.length) return toast(v[0], 'warn'); }
  c.step = Math.min(6, c.step + 1); save(); rerender(); window.scrollTo(0, 0);
};
ACT.prev = () => { S.draft.step = Math.max(1, S.draft.step - 1); save(); rerender(); window.scrollTo(0, 0); };
ACT.launch = () => { const c = R('cd'); if (c) launch(c); };
ACT.launchCamp = el => { const c = campById(el.dataset.id); if (c) launch(c); };
ACT.saveDraftCamp = () => { const c = S.draft; if (!c.ads.length) return toast('Agrega al menos un producto para guardar el borrador', 'warn'); c.status = 'draft'; delete c.step; S.campaigns.push(c); S.draft = null; save(); toast('Borrador guardado'); go('#/campanas/' + c.id + '/anuncios'); };
ACT.discardDraft = () => confirmBox('Descartar borrador', 'Se perderá la configuración que llevas de esta campaña.', 'Descartar', () => { S.draft = null; save(); go('#/campanas'); });
ACT.newCamp = () => { if (!S.draft) startDraft([]); go('#/campanas/nueva'); };
ACT.togCamp = el => {
  const c = campById(el.dataset.id); if (!c) return;
  if (c.status === 'draft') return void launch(c);
  if (c.status === 'active') c.status = 'paused'; else { if (c.status === 'ended') c.startDay = S.sim.day; c.status = 'active'; }
  save(); toast(c.status === 'active' ? 'Campaña activada' : 'Campaña pausada'); rerender();
};
ACT.adSwitch = el => {
  const f = findAd(el.dataset.ad); if (!f) return;
  if (el.dataset.mode === 'pending') { const cur = UI.pending[f.ad.id] ?? f.ad.active; UI.pending[f.ad.id] = !cur; } else { f.ad.active = !f.ad.active; save(); toast(f.ad.active ? 'Anuncio activado' : 'Anuncio pausado'); }
  rerender();
};
ACT.rmAd = el => { const f = findAd(el.dataset.ad); const p = prodById(f.ad.productId); confirmBox('Quitar anuncio de la campaña', `"${p ? p.title : 'Anuncio'}" dejará de promocionarse y perderás su historial.`, 'Quitar', () => { f.camp.ads = f.camp.ads.filter(a => a !== f.ad); save(); rerender(); }); };
ACT.dupCamp = el => { const c = campById(el.dataset.id); const n = JSON.parse(JSON.stringify(c)); n.id = uid('CAMP'); n.name = c.name + ' (copia)'; n.status = 'draft'; n.ads.forEach(a => { a.id = uid('AD'); a.daily = []; a.active = true; }); S.campaigns.push(n); save(); toast('Campaña duplicada como borrador'); go('#/campanas/' + n.id + '/anuncios'); };
ACT.delCamp = el => confirmBox('Eliminar campaña', 'Se eliminarán la campaña, sus bloques, anuncios y resultados.', 'Eliminar', () => { S.campaigns = S.campaigns.filter(c => c.id !== el.dataset.id); save(); toast('Campaña eliminada'); go('#/campanas'); });
ACT.dismiss = el => { S.dismissed[el.dataset.k] = true; save(); rerender(); };
ACT.filt = el => { UI.campF = el.dataset.f; rerender(); };
ACT.cq = el => { UI.campQ = el.value; };
document.addEventListener('input', e => { if (e.target.id === 'campq') { UI.campQ = e.target.value; const pos = e.target.selectionStart; rerender(); const n = $('#campq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } });

/* ---- Tarjetas ---- */
function trendVs(c) { const d = S.sim.day; if (d < 14) return null; const a = campMetrics(c, d - 7, d - 1).sales, b = campMetrics(c, d - 14, d - 8).sales; return b ? (a - b) / b * 100 : null; }
function campCard(c) {
  const m = campMetrics(c), st = campStatus(c), tr = trendVs(c); const ps = c.ads.map(a => prodById(a.productId)).filter(Boolean);
  const sts = st.learn ? `<span class="pulse"><i></i><i></i></span>` : `<span class="dotg ${st.k === 'ok' ? '' : ''}" style="background:${st.k === 'ok' ? 'var(--primary-container)' : st.k === 'warn' ? 'var(--amber)' : 'var(--secondary-fixed-dim)'}"></span>`;
  const todayM = S.sim.day > c.startDay && c.status !== 'draft' ? campMetrics(c, S.sim.day - 1, S.sim.day - 1) : null;
  return `<article class="card col gap12">
  <div class="row-top between gap8"><div class="row-top gap8 grow" style="min-width:0">${sw(c.status === 'active', 'togCamp', `data-id="${c.id}"`)}<div class="col grow" style="min-width:0"><a href="#/campanas/${c.id}/resultados" class="t-h3 trunc" style="color:var(--on-surface)">${esc(c.name)}</a><span class="t-sm c-sec">ID: ${c.id} • ${c.ads.length} anuncio${c.ads.length === 1 ? '' : 's'} • ${c.groups.length} bloque${c.groups.length === 1 ? '' : 's'}</span></div></div><a class="icon-btn" style="width:36px;height:36px" href="#/campanas/${c.id}/ajustes" aria-label="Opciones de campaña">${ic('more', 's18')}</a></div>
  <div class="status ${st.k === 'ok' ? 'ok' : st.k === 'warn' ? 'warn' : ''}"><div class="row gap8" style="min-width:0">${sts}<div class="col" style="min-width:0"><span class="t-xs up" style="color:${st.k === 'info' ? 'var(--tertiary)' : st.k === 'ok' ? 'var(--primary)' : 'var(--secondary)'}">${st.t}</span><span class="t-sm c-var trunc">${st.d}</span></div></div></div>
  <div class="strip">${ps.slice(0, 4).map(p => thumb(p, 'sm')).join('')}${ps.length > 4 ? `<div class="more"><span>+${ps.length - 4}</span><span style="font-weight:400;font-size:9px">ítems</span></div>` : ''}</div>
  <div class="grid2">
    <div class="stat"><div class="row between"><span class="k">Presupuesto diario</span><a href="#/campanas/${c.id}/ajustes" class="c-sec" aria-label="Editar presupuesto">${ic('edit', 's14')}</a></div><span class="v">${money(c.budgetDaily)}</span><span class="s">${todayM ? 'Consumido ayer: ' + pct(todayM.cost / c.budgetDaily * 100, 0) : 'Límite automático'}</span></div>
    <div class="stat"><div class="row between"><span class="k">ROAS objetivo</span><a href="#/roas/${c.id}" class="c-sec" aria-label="Editar ROAS">${ic('edit', 's14')}</a></div><span class="v">${c.roasTarget}x</span><span class="s c-pri row" style="gap:2px">${ic('zap', 's14')} ${isFinite(m.roas) ? (m.roas >= c.roasTarget ? 'Objetivo superado' : 'Por debajo del objetivo') : 'Estrategia activa'}</span></div>
    <div class="stat"><span class="k">Ventas Product Ads</span><span class="v">${int(m.sales)} <span class="t-sm c-sec" style="font-weight:400">uds</span></span><span class="s ${tr != null && tr < 0 ? 'c-err' : 'c-pri'}">${tr == null ? 'Ingresos ' + moneyC(m.revenue) : (tr >= 0 ? '▲ ' : '▼ ') + pct(Math.abs(tr), 0) + ' vs anterior'}</span></div>
    <div class="stat"><div class="row between"><span class="k">ACOS actual</span>${isFinite(m.acos) ? `<span class="badge ${m.acos <= 100 / c.roasTarget ? 'ok' : 'warn'}">${m.acos <= 100 / c.roasTarget ? 'Óptimo' : 'Alto'}</span>` : ''}</div><span class="v">${pct(m.acos, 2)}</span><span class="s">ROAS real: <b style="color:var(--on-surface)">${isFinite(m.roas) ? m.roas.toFixed(1).replace('.', ',') + 'x' : '—'}</b></span></div></div>
  <div class="row between"><a class="row t-lbl" href="#/campanas/${c.id}/anuncios">Ver los ${c.ads.length} anuncios ${ic('arr', 's16')}</a><a class="btn gho sm" href="#/campanas/${c.id}/resultados">Métricas</a></div></article>`;
}
function adCard(c, ad, mode) {
  const p = prodById(ad.productId); if (!p) return ''; const m = adMetrics(ad); const eff = mode === 'pending' ? (UI.pending[ad.id] ?? ad.active) : ad.active; const be = margin(p);
  const ar = isFinite(m.acos) ? (m.acos <= be ? 'tdn' : 'tup') : null; const g = groupOf(c, ad);
  const badge = p.stock <= 0 ? ['bad', 'Sin stock'] : !eff ? ['mut', 'Pausa'] : null;
  return `<article class="card col gap12 ${eff ? '' : 'dim'}" style="${eff ? '' : 'opacity:.82'}">
  <div class="row-top between gap8"><a href="#/anuncio/${ad.id}" class="row-top gap12 grow" style="min-width:0"><span class="thumbwrap">${thumb(p)}${badge ? `<span class="tag">${badge[1].toUpperCase()}</span>` : ''}</span><div class="grow col" style="min-width:0"><div class="row gap4 t-xs c-sec wrap"><span>ID: ${ad.id}</span></div><h3 class="t-h3 trunc" style="color:var(--on-surface)">${esc(p.title)}</h3><span class="t-m c-prc">${money(p.price)} <span class="t-xs c-sec" style="font-weight:400">COP</span></span></div></a>${sw(eff, 'adSwitch', `data-ad="${ad.id}" data-mode="${mode || ''}"`)}</div>
  <div class="row gap8 wrap"><span class="badge info">${ic('flag', 's14')} ${esc(c.name)}</span><span class="badge mut">${ic('layers', 's14')} ${esc(g ? g.name : 'Sin bloque')}</span></div>
  <div class="grid3 bento">${kv('Impresiones', int(m.imp))}${kv('Clics', int(m.clicks))}${kv('CPC Prom.', money(m.cpc))}${kv('Ventas', int(m.sales) + ' u.', 'c-pri')}${kv('Ingresos', moneyC(m.revenue))}${kv('ACOS', `${pct(m.acos)} ${ar ? ic(ar, 's14') : ''}`, acosCls(m.acos, p))}</div></article>`;
}

/* ---- Vistas ---- */
VIEWS.campanas = r => {
  if (r.a === 'nueva') return wizard();
  if (r.a) return campDetail(r);
  const all = S.campaigns; const act = all.filter(c => c.status === 'active').length, pau = all.filter(c => c.status === 'paused').length, bor = all.filter(c => c.status === 'draft').length;
  let list = all.filter(c => (UI.campF === 'all' || (UI.campF === 'acos' ? isFinite(campMetrics(c).acos) && campMetrics(c).acos < 15 : UI.campF === 'active' ? c.status === 'active' : UI.campF === 'paused' ? c.status === 'paused' : c.status === 'draft')) && norm(c.name).includes(norm(UI.campQ)));
  const chip = (f, l) => `<button class="chip ${UI.campF === f ? 'soft' : ''}" data-act="filt" data-f="${f}">${UI.campF === f ? ic('check', 's14') : ''}${l}</button>`;
  return `<div class="page">
  ${pageHead(`Campañas Product Ads <span class="badge mut" style="vertical-align:middle">${all.length}</span>`, `<button class="btn pri" data-act="newCamp">${ic('plusc', 's18')} <span>${S.draft ? 'Continuar borrador' : 'Crear campaña'}</span></button>`)}
  ${S.dismissed.concept ? '' : `<section class="card flat col gap8"><div class="row between"><h3 class="t-lblm b">Campaña, bloque y anuncio: ¿en qué se diferencian?</h3><button class="icon-btn" style="width:32px;height:32px" data-act="dismiss" data-k="concept" aria-label="Cerrar">${ic('x', 's16')}</button></div><div class="concept"><div><div class="row gap8 c-pri b">${ic('flag', 's16')} Campaña</div><p class="t-sm c-var">Contenedor con presupuesto, ROAS objetivo, audiencia y duración.</p></div><div><div class="row gap8 c-pri b">${ic('layers', 's16')} Bloque</div><p class="t-sm c-var">Agrupación de productos dentro de una campaña (por línea, margen o temporada).</p></div><div><div class="row gap8 c-pri b">${ic('bag', 's16')} Anuncio</div><p class="t-sm c-var">Un producto promocionado con sus palabras clave, pujas y métricas propias.</p></div></div></section>`}
  <div class="search">${ic('search', 's18 ic')}<input id="campq" type="search" placeholder="Buscar campaña por nombre..." value="${esc(UI.campQ)}" aria-label="Buscar campaña"></div>
  <div class="chips">${chip('all', 'Todas')}${chip('active', `Activas (${act})`)}${chip('paused', `Pausadas (${pau})`)}${bor ? chip('draft', `Borradores (${bor})`) : ''}${chip('acos', 'ACOS &lt; 15%')}</div>
  ${S.sim.day > 0 || all.some(c => c.status === 'active') ? simBar() : ''}
  ${banner(4, 'Usa las métricas del ecosistema SENA', 'Evalúa tus resultados y ajusta el ROAS si es necesario. Compara ventas directas y ACOS para asegurar que cada peso invertido protege tu margen.')}
  ${list.length ? list.map(campCard).join('') : ''}
  ${all.length === 0 || !list.length ? `<div class="card empty"><div class="ill"><i style="width:40px;background:var(--secondary-fixed-dim)"></i><i style="width:32px;background:var(--outline-variant)"></i><i style="width:24px;background:var(--primary-fixed)"></i></div><h3 class="t-h3">${all.length ? 'Sin resultados para este filtro' : 'Potencia más publicaciones'}</h3><p class="c-sec" style="max-width:340px">${all.length ? 'Cambia el filtro o la búsqueda.' : 'Aquí podrás agrupar y gestionar tus anuncios cuando crees una nueva campaña orientada por ROAS.'}</p><button class="btn sec" data-act="newCamp">${ic('send', 's18')} Crear nueva campaña</button></div>` : ''}</div>`;
};
function wizard() {
  if (!S.draft) startDraft([]); const c = S.draft; const st = c.step || 1;
  const stepper = `<div class="stepper" role="tablist">${WSTEPS.map((n, i) => `${i ? '<span class="step-sep"></span>' : ''}<button class="step ${st === i + 1 ? 'on' : st > i + 1 ? 'done' : ''}" data-act="step" data-n="${i + 1}" ${st === i + 1 ? 'aria-current="step"' : ''}><span class="c">${st > i + 1 ? ic('check', 's14') : i + 1}</span><span class="l">${n}</span></button>`).join('')}</div>`;
  let body = '';
  if (st === 1) body = `${banner(1, 'Datos de la campaña', 'Dale un nombre, define el objetivo y la rentabilidad que esperas (ROAS).')}<section class="card col gap16"><div class="field"><label for="cd-name">Nombre de la campaña</label><input id="cd-name" class="inp" data-root="cd" data-set="name" value="${esc(c.name)}" maxlength="60"></div>
    <div class="field"><span class="lbl">Objetivo</span><div class="col gap8">${Object.entries(OBJECTIVES).map(([k, v]) => `<div class="opt ${c.objective === k ? 'on' : ''}" data-act="setv" data-root="cd" data-set="objective" data-val="${k}" role="radio" aria-checked="${c.objective === k}" tabindex="0"><div class="radio"><i></i></div><div class="b">${v}</div></div>`).join('')}</div></div>
    <div class="field"><label>ROAS objetivo</label><div class="chips">${[2, 3, 5, 10].map(v => `<button class="chip ${c.roasTarget === v ? 'on' : ''}" data-act="setv" data-root="cd" data-set="roasTarget" data-type="num" data-val="${v}">${v}x${v === 3 ? ' · recomendado' : ''}</button>`).join('')}</div><span id="roasnote" class="hint">${roasNote(c)}</span></div></section>`;
  if (st === 2) body = `${banner(2, 'Selección de pauta', 'Elige los artículos creados que quieres promocionar y agrúpalos en bloques de productos.')}${productPicker('cd', c)}${c.ads.length ? `<h3 class="t-h3">Bloques de productos</h3><p class="c-sec t-sm" style="margin-top:-8px">Cada producto elegido se convierte en un anuncio. Los bloques te ayudan a ordenarlos.</p>${blocksEditor('cd', c)}` : ''}`;
  if (st === 3) body = `${banner(3, 'Segmentación de audiencia', 'Define a quién se mostrarán tus anuncios por ubicación, perfil, tipo de comprador e intereses.')}${audienceForm('cd', c)}`;
  if (st === 4) body = `${banner(4, 'Asignación de palabras clave', 'Ingresa los términos de búsqueda con coincidencia amplia, de frase o exacta, y su puja.')}${keywordsForm('cd', c)}`;
  if (st === 5) body = `${banner(5, 'Definición de presupuesto', 'Asigna cuánto dinero invertirás cada día y por cuánto tiempo.')}${budgetForm('cd', c, true)}`;
  if (st === 6) { const v = validateCamp(c); const e = campEstimate(c); const a = c.audience; const aud = audLive(c);
    body = `${banner(6, 'Revisión y lanzamiento', 'Verifica la configuración. Al lanzar, la campaña entra en fase de aprendizaje de ' + LEARN_DAYS + ' días.')}
    <section class="card col gap12"><div class="row between"><h3 class="t-h3">${esc(c.name)}</h3><button class="btn gho sm" data-act="step" data-n="1">${ic('edit', 's14')} Editar</button></div>
    <div class="grid2">${statBox('Objetivo', OBJECTIVES[c.objective])}${statBox('ROAS objetivo', c.roasTarget + 'x', 'ACOS ' + pct(100 / c.roasTarget))}${statBox('Presupuesto', money(c.budgetDaily) + '/día', c.durationDays + ' días')}${statBox('Puja base', money(c.bid))}</div>
    <div class="divider"></div><div class="row between"><span class="b">Anuncios (${c.ads.length}) en ${c.groups.filter(g => c.ads.some(x => x.groupId === g.id)).length} bloque(s)</span><button class="btn gho sm" data-act="step" data-n="2">${ic('edit', 's14')}</button></div>
    ${c.groups.map(g => { const ads = c.ads.filter(x => x.groupId === g.id); return ads.length ? `<div class="t-sm"><b>${esc(g.name)}:</b> ${ads.map(x => esc((prodById(x.productId) || {}).title || '')).join(' · ')}</div>` : ''; }).join('')}
    <div class="divider"></div><div class="row between"><span class="b">Audiencia</span><button class="btn gho sm" data-act="step" data-n="3">${ic('edit', 's14')}</button></div>
    <div class="t-sm c-var">${a.geo.scope === 'nacional' ? 'Todo el país' : esc(a.geo.cities.join(', '))} · ${a.demo.ageMin}–${a.demo.ageMax} años · ${a.demo.genders.map(g => g === 'mujer' ? 'Mujeres' : 'Hombres').join(' y ')}${a.behavior.buyers.length ? ' · ' + a.behavior.buyers.map(k => BUYERS[k].name).join(', ') : ' · Todos los compradores'}${a.behavior.interests.length ? ' · Intereses: ' + esc(a.behavior.interests.join(', ')) : ''}</div>
    <div class="divider"></div><div class="row between"><span class="b">Palabras clave</span><button class="btn gho sm" data-act="step" data-n="4">${ic('edit', 's14')}</button></div>
    <div class="t-sm c-var">${sum(c.ads, x => x.keywords.length)} palabras clave · ${c.negatives.length} negativas</div></section>
    <section class="card hl col gap8"><div class="t-lblm b">Proyección diaria estimada</div><div class="grid3">${kv('Clics', int(e.clicks))}${kv('Ventas', e.sales.toFixed(1).replace('.', ','))}${kv('ACOS', pct(e.acos), acosCls(e.acos))}</div></section>
    ${v.e.length ? `<section class="card col gap8" style="background:var(--error-container)"><h3 class="t-lblm b" style="color:#93000a">Corrige antes de lanzar</h3>${v.e.map(x => `<div class="check"><span class="ic no" style="background:var(--error);color:#fff">${ic('x', 's14')}</span><span>${esc(x)}</span></div>`).join('')}</section>` : ''}
    ${v.w.length ? `<section class="card col gap8" style="background:var(--amber-bg)"><h3 class="t-lblm b c-amb">Recomendaciones</h3>${v.w.map(x => `<div class="check"><span class="ic mid">${ic('info', 's14')}</span><span>${esc(x)}</span></div>`).join('')}</section>` : ''}`; }
  return `<div class="page">
  <div class="row between"><div class="row gap8"><a class="icon-btn" href="#/campanas" aria-label="Volver">${ic('arl', 's24')}</a><h1 class="t-h2">Crear campaña</h1></div><button class="btn gho sm" data-act="discardDraft">${ic('trash', 's14')} Descartar</button></div>
  ${stepper}${body}
  <div class="sticky-bar"><button class="btn gho" data-act="prev" ${st === 1 ? 'disabled' : ''}>${ic('arl', 's16')} Atrás</button><span class="t-sm c-sec">Paso ${st} de 6</span>${st < 6 ? `<button class="btn pri" data-act="next">Continuar ${ic('arr', 's16')}</button>` : `<div class="row gap8"><button class="btn gho" data-act="saveDraftCamp">Borrador</button><button class="btn pri" data-act="launch" ${validateCamp(c).e.length ? 'disabled' : ''}>${ic('send', 's16')} Lanzar</button></div>`}</div></div>`;
}
const CTABS = [['resultados', 'Resultados'], ['anuncios', 'Bloques y anuncios'], ['audiencia', 'Audiencia'], ['palabras', 'Palabras clave'], ['ajustes', 'Ajustes']];
function campDetail(r) {
  const c = campById(r.a); if (!c) return `<div class="page">${emptyState('Campaña no encontrada', 'Pudo haber sido eliminada.', '<a class="btn pri" href="#/campanas">Ver campañas</a>')}</div>`;
  const tab = CTABS.some(t => t[0] === r.b) ? r.b : 'resultados'; const st = campStatus(c); const m = campMetrics(c); let body = '';
  if (tab === 'resultados') {
    const has = S.sim.day > c.startDay && c.status !== 'draft'; const from = c.startDay, to = S.sim.day - 1;
    const rows = c.ads.map(a => ({ a, p: prodById(a.productId), m: adMetrics(a) })).filter(x => x.p).sort((x, y) => (isFinite(x.m.acos) ? x.m.acos : 1e9) - (isFinite(y.m.acos) ? y.m.acos : 1e9));
    body = `<div class="status ${st.k === 'ok' ? 'ok' : st.k === 'warn' ? 'warn' : ''}"><div class="col"><span class="t-xs up">${st.t}</span><span class="t-sm c-var">${st.d}</span></div>${c.status === 'draft' ? `<button class="btn pri sm" data-act="launchCamp" data-id="${c.id}">${ic('send', 's14')} Lanzar</button>` : ''}</div>
    ${c.status !== 'draft' && !has ? `<div class="card hl col gap8"><h3 class="t-h3">Tu campaña ya está publicada</h3><p class="c-var">Aún no transcurre ningún día. Avanza el tiempo del simulador para ver impresiones, clics, ventas y ACOS.</p></div>` : ''}
    ${c.status !== 'draft' ? simBar() : ''}
    <div class="grid2">${statBox('Inversión', money(m.cost), 'Presupuesto: ' + money(c.budgetDaily) + '/día')}${statBox('Ingresos por ads', money(m.revenue), int(m.sales) + ' ventas')}${statBox('ACOS', pct(m.acos), 'Objetivo ≤ ' + pct(100 / c.roasTarget), acosCls(m.acos))}${statBox('ROAS', isFinite(m.roas) ? m.roas.toFixed(1).replace('.', ',') + 'x' : '—', 'Objetivo ' + c.roasTarget + 'x')}${statBox('Impresiones', int(m.imp), 'CTR ' + pct(m.ctr, 2))}${statBox('Clics', int(m.clicks), 'CPC ' + money(m.cpc))}</div>
    ${has ? `<section class="card col gap8"><h3 class="t-h3">Inversión vs ingresos por día</h3>${lineChart([c], from, to)}</section>` : ''}
    <section class="card col gap8"><h3 class="t-h3">Resultado por anuncio</h3>${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Anuncio</th><th class="num">Inversión</th><th class="num">Ventas</th><th class="num">Ingresos</th><th class="num">ACOS</th></tr></thead><tbody>${rows.map((x, i) => `<tr class="${i === 0 && isFinite(x.m.acos) ? 'best' : ''}"><td><a href="#/anuncio/${x.a.id}" class="b">${esc(x.p.title.slice(0, 34))}${x.p.title.length > 34 ? '…' : ''}</a></td><td class="num">${money(x.m.cost)}</td><td class="num">${int(x.m.sales)}</td><td class="num">${money(x.m.revenue)}</td><td class="num ${acosCls(x.m.acos, x.p)} b">${pct(x.m.acos)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="c-sec">Esta campaña no tiene anuncios.</p>'}</section>
    <div class="row gap8 wrap"><a class="btn sec" href="#/roas/${c.id}">${ic('sliders', 's16')} Ajustar ROAS</a><a class="btn sec" href="#/acos">${ic('calc', 's16')} Calcular ACOS</a><a class="btn sec" href="#/reporte">${ic('file', 's16')} Elaborar reporte</a></div>`;
  }
  if (tab === 'anuncios') body = `${banner(3, 'Bloques y anuncios', 'Una campaña contiene bloques; cada bloque agrupa anuncios (un anuncio = un producto).')}
    ${c.groups.map(g => { const ads = c.ads.filter(a => a.groupId === g.id); const gm = emptyM(); ads.forEach(a => { const x = adMetrics(a); gm.imp += x.imp; gm.clicks += x.clicks; gm.cost += x.cost; gm.sales += x.sales; gm.revenue += x.revenue; }); derive(gm); return `<section class="col gap8"><div class="row between"><div class="row gap8 t-h3">${ic('layers', 's18')} ${esc(g.name)}</div><span class="t-sm c-sec">${ads.length} anuncio${ads.length === 1 ? '' : 's'} · ACOS ${pct(gm.acos)}</span></div>${ads.map(a => adCard(c, a)).join('') || '<p class="hint">Bloque vacío.</p>'}</section>`; }).join('')}
    <h3 class="t-h3">Agregar o quitar productos</h3>${productPicker('c:' + c.id, c)}<h3 class="t-h3">Organizar bloques</h3>${blocksEditor('c:' + c.id, c)}`;
  if (tab === 'audiencia') body = `${banner(3, 'Segmentación de audiencia', 'Los cambios se aplican desde el siguiente día simulado.')}${audienceForm('c:' + c.id, c)}`;
  if (tab === 'palabras') body = `${banner(4, 'Palabras clave', 'Agrega términos, cambia el tipo de coincidencia o ajusta la puja de cada uno.')}${keywordsForm('c:' + c.id, c)}`;
  if (tab === 'ajustes') body = `<section class="card col gap12"><div class="field"><label for="cn">Nombre</label><input id="cn" class="inp" data-root="c:${c.id}" data-set="name" value="${esc(c.name)}"></div></section>${budgetForm('c:' + c.id, c, false)}<a class="btn sec blk" href="#/roas/${c.id}">${ic('sliders', 's18')} Modificar ROAS objetivo (${c.roasTarget}x)</a>
    <div class="row gap8 wrap"><button class="btn gho grow" data-act="togCamp" data-id="${c.id}">${ic(c.status === 'active' ? 'pause' : 'play', 's16')} ${c.status === 'active' ? 'Pausar' : c.status === 'draft' ? 'Lanzar' : 'Activar'}</button><button class="btn gho grow" data-act="dupCamp" data-id="${c.id}">${ic('copy', 's16')} Duplicar</button><button class="btn dng grow" data-act="delCamp" data-id="${c.id}">${ic('trash', 's16')} Eliminar</button></div>`;
  return `<div class="page"><div class="row between"><div class="row gap8" style="min-width:0"><a class="icon-btn" href="#/campanas" aria-label="Volver">${ic('arl', 's24')}</a><div style="min-width:0"><h1 class="t-h2 trunc">${esc(c.name)}</h1><span class="t-sm c-sec">ID: ${c.id}</span></div></div>${sw(c.status === 'active', 'togCamp', `data-id="${c.id}"`)}</div>
  <div class="tabs" role="tablist">${CTABS.map(t => `<a class="tab ${t[0] === tab ? 'on' : ''}" href="#/campanas/${c.id}/${t[0]}" role="tab">${t[1]}</a>`).join('')}</div>${body}</div>`;
}

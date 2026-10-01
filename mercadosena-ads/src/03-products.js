/* ============ Productos ============ */
const newProduct = () => ({ id: '', title: '', desc: '', cat: 'alimentos', price: 0, cost: 0, stock: 20, images: [] });
const MAX_IMG = 6;

function qualityBox(p) {
  const q = productQuality(p); const col = q.score >= 80 ? '#39a900' : q.score >= 50 ? '#f59e0b' : '#ba1a1a';
  const msg = q.score >= 80 ? 'Excelente: tu anuncio competirá bien.' : q.score >= 50 ? 'Aceptable: mejora los puntos pendientes.' : 'Baja: tendrá pocas impresiones y poca conversión.';
  return `<div class="row gap12"><div class="score" style="background:${col}22;color:${col};box-shadow:inset 0 0 0 4px ${col}">${q.score}</div><div><div class="t-h3">Calidad de la publicación</div><div class="c-sec t-sm">${msg}</div></div></div>
  <div class="col gap8 mt12">${q.checks.map(c => { const st = c.got === c.pts ? 'ok' : c.got > 0 ? 'mid' : 'no'; return `<div class="check"><span class="ic ${st}">${ic(st === 'ok' ? 'check' : st === 'mid' ? 'info' : 'x', 's14')}</span><div><b>${c.label}</b> <span class="c-sec">(${c.got}/${c.pts})</span>${c.got < c.pts ? `<div class="c-sec">${c.tip}</div>` : ''}</div></div>`; }).join('')}</div>`;
}
function previewCard(p) {
  const cat = CATS[p.cat] || CATS.alimentos;
  return `<div class="row-top gap12">${thumb(p)}<div class="grow col gap4"><span class="t-xs c-prc up">Patrocinado</span><h3 class="t-lblm" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(p.title) || '<span class="c-sec">Título del artículo</span>'}</h3><div class="t-m">${p.price > 0 ? money(p.price) : '$ 0'}</div><div class="t-sm c-prc b">Envío gratis · ${esc(cat.name)}</div></div></div>`;
}
function liveProduct() {
  if (!PD) return;
  const q = $('#qbox'); if (q) q.innerHTML = qualityBox(PD);
  const pv = $('#pv'); if (pv) pv.innerHTML = previewCard(PD);
  const ct = $('#cnt-title'); if (ct) { const n = PD.title.trim().length; ct.textContent = n + ' / 70'; ct.className = 'counter ' + (n >= 30 && n <= 70 ? 'ok' : n > 70 ? 'bad' : ''); }
  const cd = $('#cnt-desc'); if (cd) { const n = PD.desc.trim().length; cd.textContent = n + ' caracteres (mínimo recomendado 150)'; cd.className = 'counter ' + (n >= 150 ? 'ok' : ''); }
  const mg = $('#mgn'); if (mg) { const m = margin(PD); mg.innerHTML = PD.price > 0 ? `Margen bruto <b class="${m >= 15 ? 'ok-txt' : 'bad-txt'}">${pct(m)}</b> · utilidad ${money(PD.price - PD.cost)} por unidad. <b>ACOS de equilibrio: ${pct(m)}</b> (si el ACOS supera este valor, vendes con pérdida).` : 'Ingresa el precio para calcular tu margen.'; }
  const ref = $('#refp'); if (ref) { const c = CATS[PD.cat] || CATS.alimentos; ref.textContent = `Precio de referencia en ${c.name}: ${money(c.ref)}`; }
}
function cornersLight(c) {
  const x = c.getContext('2d'); const pts = [[0, 0], [c.width - 10, 0], [0, c.height - 10], [c.width - 10, c.height - 10]]; let L = 0;
  pts.forEach(([a, b]) => { const d = x.getImageData(a, b, 10, 10).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114; L += s / (d.length / 4); });
  return L / 4 > 225;
}
function processImage(file) {
  return new Promise((res, rej) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return rej('Formato no permitido. Usa JPG, PNG o WebP.');
    if (file.size > 5 * 1024 * 1024) return rej('Pesa más de 5 MB.');
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight; URL.revokeObjectURL(url);
      if (w < 500 || h < 500) return rej(`Resolución ${w}×${h} px. El mínimo es 500×500 px.`);
      const s = Math.min(1, 800 / Math.max(w, h)); const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      res({ src: c.toDataURL('image/jpeg', .72), w, h, ok: true, bg: cornersLight(c) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej('No se pudo leer el archivo.'); };
    img.src = url;
  });
}
function sampleImage(p, v) {
  const c = document.createElement('canvas'); c.width = c.height = 800; const x = c.getContext('2d'); const cat = CATS[p.cat] || CATS.alimentos;
  const bgs = [['#ffffff', '#eaf6e3'], ['#d9f7c6', '#39a900'], ['#fdf3dc', '#e8c98a'], ['#e5eeff', '#668eff']][v % 4];
  const g = x.createRadialGradient(400, 400, 40, 400, 400, 560); g.addColorStop(0, bgs[0]); g.addColorStop(1, bgs[1]);
  x.fillStyle = v % 4 === 0 ? '#fff' : g; x.fillRect(0, 0, 800, 800);
  if (v % 4 === 0) { x.fillStyle = g; x.beginPath(); x.arc(400, 380, 300, 0, 7); x.fill(); }
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = (v % 4 === 2 ? 440 : 300) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.fillText(cat.emoji, 400, v % 4 === 2 ? 380 : 360);
  x.fillStyle = '#0f172a'; x.font = '800 38px "Plus Jakarta Sans",sans-serif';
  const words = (p.title || 'Producto').split(' '); const lines = ['', '']; let li = 0; words.forEach(w => { if ((lines[li] + ' ' + w).length > 26 && li < 1) li++; lines[li] = (lines[li] + ' ' + w).trim(); });
  lines.forEach((l, i) => { if (l) x.fillText(l.slice(0, 30), 400, 640 + i * 48); });
  x.fillStyle = '#39a900'; x.font = '700 24px "Plus Jakarta Sans",sans-serif'; x.fillText(['Vista frontal', 'Detalle', 'En uso', 'Empaque'][v % 4], 400, 745);
  return { src: c.toDataURL('image/jpeg', .7), w: 800, h: 800, ok: true, bg: v % 4 === 0 };
}

VIEWS.productos = r => {
  if (r.a) return productForm(r);
  PD = null;
  const list = S.products;
  const inCamps = id => S.campaigns.filter(c => c.ads.some(a => a.productId === id)).length;
  return `<div class="page">${pageHead('Mis productos', `<button class="btn pri" data-act="newProd">${ic('plusc', 's18')} Crear producto</button>`, `${list.length} artículo${list.length === 1 ? '' : 's'} en tu tienda`)}
  ${banner(1, 'Crea los artículos que vas a promocionar', 'Primero escribe el título y la descripción, luego define precio e imágenes. Una publicación completa vende más y paga menos por clic.')}
  ${list.length ? `<div class="col gap12">${list.map(p => { const q = productQuality(p), n = inCamps(p.id), m = margin(p); const b = q.score >= 80 ? 'ok' : q.score >= 50 ? 'warn' : 'bad'; return `<article class="card col gap12"><div class="row-top gap12"><a href="#/productos/${p.id}" class="thumbwrap">${thumb(p)}</a><div class="grow col gap4"><div class="row gap8 wrap t-sm c-sec"><span>ID: ${p.id}</span><span>•</span><span>${esc((CATS[p.cat] || {}).name)}</span></div><a href="#/productos/${p.id}"><h3 class="t-h3" style="line-height:22px">${esc(p.title)}</h3></a><div class="row gap8 wrap"><span class="t-m c-prc">${money(p.price)}</span><span class="badge ${b}">Calidad ${q.score}</span>${n ? `<span class="badge info">En ${n} campaña${n > 1 ? 's' : ''}</span>` : ''}${p.stock <= 0 ? '<span class="badge bad">Sin stock</span>' : ''}</div></div></div>
      <div class="grid3 bento">${kv('Stock', int(p.stock) + ' u.')}${kv('Costo', money(p.cost))}${kv('Margen', pct(m), m >= 15 ? 'c-pri' : 'c-err')}</div>
      <div class="row gap8 wrap"><a class="btn sec sm" href="#/productos/${p.id}">${ic('edit', 's14')} Editar</a><button class="btn pri sm" data-act="promote" data-id="${p.id}">${ic('send', 's14')} Promocionar</button><button class="btn gho sm" data-act="delProd" data-id="${p.id}">${ic('trash', 's14')} Eliminar</button></div></article>`; }).join('')}</div>`
      : emptyState('Aún no tienes productos', 'Crea tu primer artículo para poder promocionarlo, o carga el caso práctico con productos, campañas y 30 días de resultados simulados.', `<div class="row gap8 wrap" style="justify-content:center"><button class="btn pri" data-act="newProd">${ic('plusc', 's18')} Crear producto</button><button class="btn sec" data-act="practice">${ic('zap', 's18')} Cargar caso práctico</button></div>`)}</div>`;
};
function productForm(r) {
  const isNew = r.a === 'nuevo'; const ex = isNew ? null : prodById(r.a);
  if (!isNew && !ex) { return `<div class="page">${emptyState('Producto no encontrado', 'Es posible que lo hayas eliminado.', '<a class="btn pri" href="#/productos">Volver a productos</a>')}</div>`; }
  if (!PD || PD._for !== r.a) { PD = isNew ? newProduct() : JSON.parse(JSON.stringify(ex)); PD._for = r.a; }
  const p = PD; const cats = Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${p.cat === k ? 'selected' : ''}>${c.name}</option>`).join('');
  return `<div class="page">
  <div class="row gap8"><a class="icon-btn" href="#/productos" aria-label="Volver">${ic('arl', 's24')}</a><h1 class="t-h2">${isNew ? 'Crear producto' : 'Editar producto'}</h1></div>
  ${banner(1, 'Creación de productos', 'Escribe el título y la descripción del artículo como lo verá un comprador.')}
  <section class="card col gap16">
    <div class="field"><label for="f-title">Título del artículo</label><input id="f-title" class="inp" data-root="pd" data-set="title" value="${esc(p.title)}" maxlength="100" placeholder="Ej. Café especial origen Huila tostión media 500 g" autocomplete="off"><div class="row between"><span class="hint">Producto + marca + característica clave. Entre 30 y 70 caracteres.</span><span id="cnt-title" class="counter"></span></div></div>
    <div class="field"><label for="f-desc">Descripción</label><textarea id="f-desc" class="txt" data-root="pd" data-set="desc" placeholder="Materiales, medidas, usos, garantía, contenido del empaque…">${esc(p.desc)}</textarea><span id="cnt-desc" class="counter"></span></div>
    <div class="field"><label for="f-cat">Categoría</label><select id="f-cat" class="sel" data-root="pd" data-set="cat">${cats}</select></div>
  </section>
  ${banner(2, 'Configuración comercial', 'Define el precio y carga imágenes que cumplan los estándares de calidad.')}
  <section class="card col gap16">
    <div class="grid2"><div class="field"><label for="f-price">Precio de venta (COP)</label><input id="f-price" class="inp" inputmode="numeric" type="number" min="0" step="500" data-root="pd" data-set="price" data-type="num" value="${p.price || ''}" placeholder="38000"></div>
    <div class="field"><label for="f-cost">Costo unitario (COP)</label><input id="f-cost" class="inp" inputmode="numeric" type="number" min="0" step="500" data-root="pd" data-set="cost" data-type="num" value="${p.cost || ''}" placeholder="22000"></div></div>
    <div class="field"><label for="f-stock">Stock disponible (unidades)</label><input id="f-stock" class="inp" inputmode="numeric" type="number" min="0" data-root="pd" data-set="stock" data-type="num" value="${p.stock}"></div>
    <div class="card flat col gap4"><span id="refp" class="t-sm c-sec"></span><span id="mgn" class="t-sm"></span></div>
    <div class="field"><label>Imágenes (${p.images.length}/${MAX_IMG})</label>
      <div class="imgs">${p.images.map((im, i) => `<div class="imgcell"><img src="${im.src}" alt="Imagen ${i + 1}"><button class="x" data-act="rmImg" data-i="${i}" aria-label="Quitar imagen">${ic('x', 's14')}</button>${i === 0 ? `<span class="${im.bg ? 'ok' : 'ko'}">${im.bg ? 'Principal ✓' : 'Principal: fondo no claro'}</span>` : ''}</div>`).join('')}
      ${p.images.length < MAX_IMG ? `<label class="addimg" tabindex="0">${ic('upload', 's24')}<span>Subir imagen</span><input type="file" id="f-img" accept="image/jpeg,image/png,image/webp" multiple hidden></label>` : ''}</div>
      <div class="hint">Estándares: mínimo 500 × 500 px · JPG, PNG o WebP · máximo 5 MB · hasta ${MAX_IMG} imágenes · la primera con fondo blanco o claro, sin textos ni marcas de agua.</div>
      <div id="imgerr" class="err"></div>
      <button class="btn gho sm" style="align-self:flex-start" data-act="sampleImg">${ic('image', 's14')} Generar imagen de práctica</button>
    </div>
  </section>
  <section class="card" id="qbox"></section>
  <section class="card"><div class="lbl" style="margin-bottom:8px">Así se verá en el marketplace</div><div id="pv"></div></section>
  <div class="sticky-bar"><div class="col"><span class="t-lbl b">${isNew ? 'Nuevo producto' : 'ID ' + p.id}</span><span class="t-xs c-sec">Revisa la calidad antes de guardar</span></div><div class="row gap8"><a class="btn gho" href="#/productos">Cancelar</a><button class="btn pri" data-act="saveProd">${ic('check', 's18')} Guardar</button></div></div>
  </div>`;
}
VIEWS.productos_after = r => { if (r.a && PD) { liveProduct(); const f = $('#f-img'); if (f) f.addEventListener('change', onImgFiles); } };
async function onImgFiles(e) {
  const files = Array.from(e.target.files || []); const errs = [];
  for (const f of files) {
    if (PD.images.length >= MAX_IMG) { errs.push('Máximo ' + MAX_IMG + ' imágenes.'); break; }
    try { PD.images.push(await processImage(f)); } catch (m) { errs.push(`${f.name}: ${m}`); }
  }
  const y = window.scrollY; rerender(); window.scrollTo(0, y);
  if (errs.length) { $('#imgerr').innerHTML = errs.map(esc).join('<br>'); toast('Una o más imágenes no cumplen el estándar', 'warn'); }
}
ACT.newProd = () => { PD = null; go('#/productos/nuevo'); };
ACT.rmImg = el => { PD.images.splice(+el.dataset.i, 1); rerender(); };
ACT.sampleImg = () => { if (PD.images.length >= MAX_IMG) return toast('Ya tienes el máximo de imágenes', 'warn'); PD.images.push(sampleImage(PD, PD.images.length)); rerender(); };
ACT.saveProd = () => {
  const p = PD, e = [];
  if (p.title.trim().length < 10) e.push('Escribe un título de al menos 10 caracteres.');
  if (p.desc.trim().length < 30) e.push('Escribe una descripción de al menos 30 caracteres.');
  if (!(p.price > 0)) e.push('Define un precio mayor a 0.');
  if (p.cost < 0 || p.cost >= p.price) e.push('El costo debe ser menor al precio de venta.');
  if (p.images.length < 1) e.push('Carga al menos una imagen.');
  if (e.length) return sheet(`<h3 class="t-h3" style="margin-bottom:8px">Faltan datos</h3><ul style="margin:0 0 16px;padding-left:18px">${e.map(x => `<li>${esc(x)}</li>`).join('')}</ul><button class="btn pri blk" data-act="closeSheet">Entendido</button>`);
  const o = JSON.parse(JSON.stringify(p)); delete o._for; o.title = o.title.trim(); o.desc = o.desc.trim();
  if (!o.id) { o.id = String(Math.floor(100000000 + Math.random() * 900000000)); S.products.push(o); } else { const i = S.products.findIndex(x => x.id === o.id); S.products[i] = o; }
  save(); PD = null; toast('Producto guardado'); go('#/productos');
};
ACT.delProd = el => { const p = prodById(el.dataset.id); confirmBox('Eliminar producto', `Se eliminará "${p.title}" y los anuncios que lo usan en tus campañas.`, 'Eliminar', () => { S.products = S.products.filter(x => x.id !== p.id); S.campaigns.forEach(c => { c.ads = c.ads.filter(a => a.productId !== p.id); }); save(); toast('Producto eliminado'); rerender(); }); };
ACT.promote = el => { startDraft([el.dataset.id]); go('#/campanas/nueva'); };

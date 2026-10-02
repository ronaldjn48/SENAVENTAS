/* ==========================================================================
   SENAVENTAS · Simulador de API REST, webhooks e integraciones externas
   Todo corre en el navegador: no hay servidor ni dinero real.
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const U = SV.util;
  const BASE = '/api/v1';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const latency = () => 180 + Math.round(Math.random() * 420);

  /* ---------- Reglas de negocio compartidas (tienda, API y panel) ---------- */
  SV.commerce = {
    /* Valida stock, descuenta inventario y registra el pedido. */
    applyOrder(session, order) {
      const need = {};
      order.items.forEach((it) => { if (!it.bundleHeader) need[it.id] = (need[it.id] || 0) + Number(it.qty || 0); });
      for (const id of Object.keys(need)) {
        const p = session.products.find((x) => x.id === id);
        if (!p) return { ok: false, message: 'Producto inexistente: ' + id };
        if (p.status !== 'publicado') return { ok: false, message: p.name + ' ya no está publicado.' };
        if (Number(p.stock) < need[id]) return { ok: false, message: 'Stock insuficiente para ' + p.name + ' (disponible: ' + p.stock + ').', stock: SV.commerce.stockMap(session) };
      }
      const lowAlerts = [];
      Object.keys(need).forEach((id) => {
        const p = session.products.find((x) => x.id === id);
        p.stock = Number(p.stock) - need[id];
        p.sold = (Number(p.sold) || 0) + need[id];
        if (p.stock <= Number(p.minStock || 0)) lowAlerts.push(p);
      });
      order.items.forEach((it) => {
        const p = session.products.find((x) => x.id === it.id);
        if (p) it.cost = Number(p.cost) || 0;
      });
      session.orders.unshift(order);
      return { ok: true, stock: SV.commerce.stockMap(session), lowAlerts };
    },
    stockMap(session) { const m = {}; session.products.forEach((p) => { m[p.id] = Number(p.stock) || 0; }); return m; },
    orderCost(o) { return o.items.reduce((a, it) => a + (Number(it.cost) || 0) * Number(it.qty || 0), 0); },
    stats(session) {
      const valid = session.orders.filter((o) => o.status !== 'cancelado');
      const revenue = valid.reduce((a, o) => a + o.total, 0);
      const cost = valid.reduce((a, o) => a + SV.commerce.orderCost(o), 0);
      const units = valid.reduce((a, o) => a + o.items.filter((i) => !i.bundleHeader).reduce((b, i) => b + i.qty, 0), 0);
      return { orders: valid.length, revenue, cost, grossProfit: revenue - valid.reduce((a, o) => a + o.shipping, 0) - cost, units, avgTicket: valid.length ? revenue / valid.length : 0 };
    }
  };

  /* ---------- API REST simulada ---------- */
  const rate = {};
  const res = (status, body, extra = {}) => ({ status, body, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8', 'x-senaventas-sandbox': 'true' }, extra) });
  const err = (status, code, message, extra) => res(status, { error: { code, message, ...(extra || {}) } });

  const publicProduct = (p) => ({ id: p.id, sku: p.sku, name: p.name, category: p.category, price: Number(p.price), compare_at_price: Number(p.compareAt) || null, cost: Number(p.cost), margin_pct: Number(U.margin(p.price, p.cost).toFixed(1)), stock: Number(p.stock), min_stock: Number(p.minStock), moq: Number(p.moq) || 1, status: p.status, image: p.image && p.image.startsWith('data:') ? '(imagen cargada · base64)' : p.image, description: p.description });

  const findProduct = (session, key) => session.products.find((p) => p.id === key || p.sku.toLowerCase() === String(key).toLowerCase());

  const validateProduct = (session, b, current) => {
    const errors = [];
    if (!current || b.name !== undefined) { if (!b.name || String(b.name).trim().length < 3) errors.push({ field: 'name', message: 'Obligatorio, mínimo 3 caracteres.' }); }
    if (!current || b.price !== undefined) { if (!(Number(b.price) > 0)) errors.push({ field: 'price', message: 'Debe ser un número mayor que 0.' }); }
    if (b.cost !== undefined && Number(b.cost) < 0) errors.push({ field: 'cost', message: 'No puede ser negativo.' });
    if (b.stock !== undefined && (!Number.isInteger(Number(b.stock)) || Number(b.stock) < 0)) errors.push({ field: 'stock', message: 'Entero mayor o igual a 0.' });
    if (b.category !== undefined && !session.categories.includes(b.category)) errors.push({ field: 'category', message: 'Categoría inexistente.', allowed: session.categories });
    if (b.status !== undefined && !['publicado', 'borrador'].includes(b.status)) errors.push({ field: 'status', message: 'Valores permitidos: publicado, borrador.' });
    if (b.sku !== undefined) {
      if (!/^[A-Za-z0-9\-_]{3,20}$/.test(b.sku)) errors.push({ field: 'sku', message: 'Entre 3 y 20 caracteres: letras, números, guion.' });
      else if (session.products.some((p) => p.sku.toLowerCase() === b.sku.toLowerCase() && (!current || p.id !== current.id))) errors.push({ field: 'sku', message: 'El SKU ya existe.' });
    }
    return errors;
  };

  SV.api = {
    BASE,
    endpoints: [
      { m: 'GET', p: '/store', scope: 'read', d: 'Datos generales de la tienda.' },
      { m: 'GET', p: '/products', scope: 'read', d: 'Lista productos. Filtros: ?category= &status= &q= &limit= &page=' },
      { m: 'GET', p: '/products/{id|sku}', scope: 'read', d: 'Detalle de un producto.' },
      { m: 'POST', p: '/products', scope: 'write', d: 'Crea un producto (name, sku, price, cost, stock, category, status).' },
      { m: 'PUT', p: '/products/{id|sku}', scope: 'write', d: 'Actualiza campos de un producto.' },
      { m: 'PATCH', p: '/products/{id|sku}/stock', scope: 'write', d: 'Ajuste de inventario: { "delta": -2 } o { "stock": 30 }.' },
      { m: 'DELETE', p: '/products/{id|sku}', scope: 'write', d: 'Elimina un producto.' },
      { m: 'GET', p: '/categories', scope: 'read', d: 'Categorías del catálogo.' },
      { m: 'GET', p: '/orders', scope: 'read', d: 'Pedidos. Filtro: ?status=pagado|pendiente|despachado|entregado|cancelado' },
      { m: 'GET', p: '/orders/{id}', scope: 'read', d: 'Detalle de un pedido.' },
      { m: 'POST', p: '/orders', scope: 'write', d: 'Crea un pedido: { items:[{sku,qty}], customer:{name,email,dep,city}, payment_method }' },
      { m: 'PATCH', p: '/orders/{id}', scope: 'write', d: 'Cambia el estado: { "status": "despachado" }' },
      { m: 'GET', p: '/coupons', scope: 'read', d: 'Cupones activos.' },
      { m: 'GET', p: '/reports/sales', scope: 'read', d: 'Ventas, costo, utilidad bruta y ticket promedio.' },
      { m: 'GET', p: '/webhooks', scope: 'read', d: 'Webhooks registrados.' },
      { m: 'POST', p: '/webhooks/test', scope: 'write', d: 'Dispara un evento de prueba: { "event": "order.created" }' }
    ],
    examples: {
      'POST /products': { name: 'Panela Orgánica 1kg', sku: 'ALM-060', price: 9500, cost: 5200, stock: 40, category: null, status: 'publicado' },
      'PATCH /products/{id|sku}/stock': { delta: -3 },
      'POST /orders': { items: [{ sku: 'CAF-001', qty: 2 }], customer: { name: 'Cliente API', email: 'api@correo.co', dep: 'Antioquia', city: 'Medellín' }, payment_method: 'PSE' },
      'PATCH /orders/{id}': { status: 'despachado' },
      'POST /webhooks/test': { event: 'order.created' },
      'PUT /products/{id|sku}': { price: 35000, status: 'publicado' }
    },

    /* ctx = { session, commit(msg), emit(event, data) } */
    async request(ctx, req) {
      const t0 = performance.now();
      const out = this._handle(ctx, req);
      await wait(latency());
      out.ms = Math.round(performance.now() - t0);
      const s = ctx.session;
      s.apiLog.unshift({ at: Date.now(), method: req.method, path: req.path, status: out.status, ms: out.ms, key: (req.token || '').slice(0, 12) });
      s.apiLog = s.apiLog.slice(0, 80);
      return out;
    },

    _handle(ctx, req) {
      const s = ctx.session;
      const method = String(req.method || 'GET').toUpperCase();
      let raw = String(req.path || '').trim();
      if (!raw.startsWith(BASE)) return err(404, 'not_found', 'La ruta debe iniciar con ' + BASE);
      const [pathPart, queryPart] = raw.slice(BASE.length).split('?');
      const parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
      const query = {};
      (queryPart || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });

      /* Autenticación */
      const token = req.token || '';
      if (!token) return err(401, 'unauthorized', 'Falta el encabezado Authorization: Bearer <llave>. Genera una llave en la pestaña "Llaves de API".');
      const key = s.apiKeys.find((k) => k.key === token);
      if (!key) return err(401, 'invalid_key', 'La llave no existe o fue revocada.');
      if (key.revoked) return err(401, 'revoked_key', 'La llave fue revocada.');
      const needWrite = method !== 'GET';
      if (needWrite && key.scope !== 'write') return err(403, 'forbidden', 'Esta llave solo tiene permiso de lectura (scope: read).');
      const bucket = Math.floor(Date.now() / 60000);
      const rk = token + ':' + bucket;
      rate[rk] = (rate[rk] || 0) + 1;
      if (rate[rk] > 60) return err(429, 'rate_limited', 'Superaste 60 solicitudes por minuto. Espera y reintenta.');
      key.lastUsed = Date.now();

      let body = req.body;
      if (needWrite && typeof body === 'string') {
        if (body.trim() === '') body = {};
        else { try { body = JSON.parse(body); } catch (e) { return err(400, 'invalid_json', 'El cuerpo no es JSON válido: ' + e.message); } }
      }
      body = body || {};
      const [r0, r1, r2] = parts;

      /* /store */
      if (r0 === 'store' && !r1 && method === 'GET') {
        const st = s.store;
        return res(200, { data: { name: st.name, slogan: st.slogan, currency: st.currency, theme: st.themeId, subdomain: st.subdomain + '.senaventas.edu.co', city: st.city, plugins: Object.keys(s.plugins).filter((k) => s.plugins[k]), products: s.products.length, published: !!s.published } });
      }
      /* /categories */
      if (r0 === 'categories' && !r1 && method === 'GET') {
        return res(200, { data: s.categories.map((c) => ({ name: c, products: s.products.filter((p) => p.category === c).length })) });
      }
      /* /coupons */
      if (r0 === 'coupons' && !r1 && method === 'GET') return res(200, { data: s.coupons.filter((c) => c.active) });
      /* /reports/sales */
      if (r0 === 'reports' && r1 === 'sales' && method === 'GET') {
        const st = SV.commerce.stats(s);
        const top = s.products.slice().sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3).map((p) => ({ sku: p.sku, name: p.name, sold: p.sold || 0 }));
        return res(200, { data: { orders: st.orders, units: st.units, revenue: st.revenue, cost_of_goods: st.cost, gross_profit: st.grossProfit, avg_ticket: Math.round(st.avgTicket), top_products: top, currency: s.store.currency } });
      }
      /* /products */
      if (r0 === 'products') {
        if (!r1 && method === 'GET') {
          let list = s.products.slice();
          if (query.category) list = list.filter((p) => p.category.toLowerCase() === query.category.toLowerCase());
          if (query.status) list = list.filter((p) => p.status === query.status);
          if (query.q) list = list.filter((p) => (p.name + ' ' + p.sku).toLowerCase().includes(query.q.toLowerCase()));
          const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
          const page = Math.max(1, parseInt(query.page, 10) || 1);
          const total = list.length;
          return res(200, { data: list.slice((page - 1) * limit, page * limit).map(publicProduct), meta: { total, page, limit, pages: Math.ceil(total / limit) } });
        }
        if (!r1 && method === 'POST') {
          const b = Object.assign({ status: 'borrador', stock: 0, cost: 0, category: s.categories[0] }, body);
          if (b.category === null) b.category = s.categories[0];
          if (!b.sku) b.sku = 'API-' + Math.random().toString(36).slice(2, 6).toUpperCase();
          const errors = validateProduct(s, b, null);
          if (errors.length) return err(422, 'validation_error', 'Revisa los campos enviados.', { fields: errors });
          const p = { id: U.uid('p'), sku: b.sku, name: String(b.name).trim(), category: b.category, price: Number(b.price), compareAt: Number(b.compare_at_price) || 0, cost: Number(b.cost) || 0, stock: Number(b.stock) || 0, minStock: Number(b.min_stock) || 5, status: b.status, image: b.image || '', description: b.description || '', rating: 4.5, reviews: 0, sold: 0, moq: Number(b.moq) || 1, badge: '', origin: b.origin || '' };
          s.products.push(p);
          ctx.commit('API creó el producto ' + p.sku);
          ctx.emit('product.created', publicProduct(p));
          return res(201, { data: publicProduct(p) }, { location: BASE + '/products/' + p.id });
        }
        const p = r1 ? findProduct(s, r1) : null;
        if (r1 && !p) return err(404, 'not_found', 'No existe un producto con id o SKU "' + r1 + '".');
        if (p && !r2 && method === 'GET') return res(200, { data: publicProduct(p) });
        if (p && !r2 && (method === 'PUT' || method === 'PATCH')) {
          const errors = validateProduct(s, body, p);
          if (errors.length) return err(422, 'validation_error', 'Revisa los campos enviados.', { fields: errors });
          const map = { name: 'name', sku: 'sku', price: 'price', cost: 'cost', stock: 'stock', category: 'category', status: 'status', description: 'description', compare_at_price: 'compareAt', min_stock: 'minStock', moq: 'moq', image: 'image' };
          Object.keys(map).forEach((k) => { if (body[k] !== undefined) p[map[k]] = ['price', 'cost', 'stock', 'compare_at_price', 'min_stock', 'moq'].includes(k) ? Number(body[k]) : body[k]; });
          ctx.commit('API actualizó ' + p.sku);
          ctx.emit('product.updated', publicProduct(p));
          return res(200, { data: publicProduct(p) });
        }
        if (p && r2 === 'stock' && method === 'PATCH') {
          let next;
          if (body.stock !== undefined) next = Number(body.stock);
          else if (body.delta !== undefined) next = Number(p.stock) + Number(body.delta);
          else return err(422, 'validation_error', 'Envía { "delta": n } o { "stock": n }.');
          if (!Number.isInteger(next) || next < 0) return err(422, 'validation_error', 'El stock resultante debe ser un entero mayor o igual a 0 (resultado: ' + next + ').');
          const before = p.stock;
          p.stock = next;
          ctx.commit('API ajustó stock de ' + p.sku + ': ' + before + ' → ' + next);
          ctx.emit('product.updated', { id: p.id, sku: p.sku, stock_before: before, stock: next });
          if (next <= Number(p.minStock || 0)) ctx.emit('stock.low', { id: p.id, sku: p.sku, name: p.name, stock: next, min_stock: p.minStock });
          return res(200, { data: { id: p.id, sku: p.sku, stock_before: before, stock: next } });
        }
        if (p && !r2 && method === 'DELETE') {
          s.products = s.products.filter((x) => x.id !== p.id);
          ctx.commit('API eliminó ' + p.sku);
          ctx.emit('product.deleted', { id: p.id, sku: p.sku });
          return { status: 204, body: null, headers: { 'x-senaventas-sandbox': 'true' } };
        }
      }
      /* /orders */
      if (r0 === 'orders') {
        if (!r1 && method === 'GET') {
          let list = s.orders.slice();
          if (query.status) list = list.filter((o) => o.status === query.status);
          return res(200, { data: list.slice(0, 50).map((o) => ({ id: o.id, date: new Date(o.date).toISOString(), status: o.status, total: o.total, items: o.items.filter((i) => !i.bundle).length, customer: o.customer.name, city: o.customer.city, payment: o.payment.method, channel: o.channel })), meta: { total: list.length } });
        }
        if (!r1 && method === 'POST') {
          if (!Array.isArray(body.items) || !body.items.length) return err(422, 'validation_error', 'items debe ser una lista con al menos un { sku, qty }.');
          const items = [];
          for (const it of body.items) {
            const p = findProduct(s, it.sku || it.id || '');
            if (!p) return err(422, 'validation_error', 'SKU inexistente: ' + (it.sku || it.id));
            const qty = parseInt(it.qty, 10);
            if (!(qty > 0)) return err(422, 'validation_error', 'qty inválida para ' + p.sku);
            if (qty < (Number(p.moq) || 1)) return err(422, 'validation_error', p.sku + ' exige un pedido mínimo de ' + p.moq + ' unidades.');
            items.push({ id: p.id, sku: p.sku, name: p.name, price: Number(p.price), qty });
          }
          const c = body.customer || {};
          if (!c.name) return err(422, 'validation_error', 'customer.name es obligatorio.');
          const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
          const dep = c.dep || s.store.city;
          const zone = [SV.SHIPPING_ZONES.local, SV.SHIPPING_ZONES.remota, SV.SHIPPING_ZONES.principal].find((z) => z.deps.includes(dep)) || SV.SHIPPING_ZONES.nacional;
          let shipping = s.plugins.shipping ? zone.price : Number(s.store.shippingFlat) || 0;
          if (Number(s.store.freeShippingThreshold) > 0 && subtotal >= Number(s.store.freeShippingThreshold)) shipping = 0;
          const order = { id: 'SV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10), date: Date.now(), items, subtotal, discount: 0, coupon: '', shipping, shippingZone: zone.label, total: subtotal + shipping, customer: { name: c.name, email: c.email || '', phone: c.phone || '', dep, city: c.city || '', address: c.address || '' }, payment: { method: body.payment_method || 'API', ref: '', status: 'pendiente' }, status: 'pendiente', channel: 'API' };
          const r = SV.commerce.applyOrder(s, order);
          if (!r.ok) return err(409, 'conflict', r.message);
          ctx.commit('API creó el pedido ' + order.id);
          ctx.emit('order.created', order);
          (r.lowAlerts || []).forEach((p) => ctx.emit('stock.low', { id: p.id, sku: p.sku, name: p.name, stock: p.stock, min_stock: p.minStock }));
          return res(201, { data: order }, { location: BASE + '/orders/' + order.id });
        }
        const o = r1 ? s.orders.find((x) => x.id === r1) : null;
        if (r1 && !o) return err(404, 'not_found', 'No existe el pedido ' + r1);
        if (o && method === 'GET') return res(200, { data: o });
        if (o && method === 'PATCH') {
          const allowed = ['pendiente', 'pagado', 'despachado', 'entregado', 'cancelado'];
          if (!allowed.includes(body.status)) return err(422, 'validation_error', 'status debe ser uno de: ' + allowed.join(', '));
          const before = o.status;
          SV.commerce.setOrderStatus(s, o, body.status);
          ctx.commit('API cambió ' + o.id + ': ' + before + ' → ' + body.status);
          ctx.emit('order.updated', { id: o.id, status_before: before, status: o.status });
          return res(200, { data: { id: o.id, status_before: before, status: o.status } });
        }
      }
      /* /webhooks */
      if (r0 === 'webhooks') {
        if (!r1 && method === 'GET') return res(200, { data: s.webhooks.map((w) => ({ id: w.id, url: w.url, event: w.event, active: w.active })) });
        if (r1 === 'test' && method === 'POST') {
          const ev = body.event || 'order.created';
          if (!SV.WEBHOOK_EVENTS.includes(ev)) return err(422, 'validation_error', 'Evento no soportado.', { allowed: SV.WEBHOOK_EVENTS });
          const n = s.webhooks.filter((w) => w.active && (w.event === ev || w.event === '*')).length;
          ctx.emit(ev, { test: true, message: 'Evento de prueba enviado desde la API', at: new Date().toISOString() });
          return res(202, { data: { event: ev, deliveries: n } });
        }
      }
      return err(method === 'GET' || !parts.length ? 404 : 405, method === 'GET' || !parts.length ? 'not_found' : 'method_not_allowed', 'Ruta o método no soportado: ' + method + ' ' + raw);
    },

    snippet(lang, req) {
      const url = 'https://' + (req.host || 'api.senaventas.edu.co') + req.path;
      const hasBody = req.method !== 'GET' && req.method !== 'DELETE' && req.body && String(req.body).trim();
      let pretty = '';
      if (hasBody) { try { pretty = JSON.stringify(JSON.parse(req.body), null, 2); } catch (e) { pretty = String(req.body); } }
      const tk = req.token || '<TU_LLAVE>';
      if (lang === 'curl') return `curl -X ${req.method} "${url}" \\\n  -H "Authorization: Bearer ${tk}" \\\n  -H "Content-Type: application/json"${hasBody ? ` \\\n  -d '${pretty.replace(/'/g, "'\\''")}'` : ''}`;
      if (lang === 'python') return `import requests\n\nresp = requests.${req.method.toLowerCase()}(\n    "${url}",\n    headers={"Authorization": "Bearer ${tk}"},${hasBody ? `\n    json=${pretty.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')},` : ''}\n)\nprint(resp.status_code, resp.json())`;
      return `const resp = await fetch("${url}", {\n  method: "${req.method}",\n  headers: {\n    "Authorization": "Bearer ${tk}",\n    "Content-Type": "application/json"\n  }${hasBody ? `,\n  body: JSON.stringify(${pretty})` : ''}\n});\nconsole.log(resp.status, await resp.json());`;
    }
  };

  SV.commerce.setOrderStatus = (session, order, status) => {
    if (order.status === status) return;
    /* Al cancelar se devuelve el inventario; al reactivar se descuenta de nuevo si hay stock. */
    if (status === 'cancelado' && order.status !== 'cancelado') {
      order.items.forEach((it) => { if (it.bundleHeader) return; const p = session.products.find((x) => x.id === it.id); if (p) { p.stock = Number(p.stock) + it.qty; p.sold = Math.max(0, (p.sold || 0) - it.qty); } });
    } else if (order.status === 'cancelado' && status !== 'cancelado') {
      order.items.forEach((it) => { if (it.bundleHeader) return; const p = session.products.find((x) => x.id === it.id); if (p) { p.stock = Math.max(0, Number(p.stock) - it.qty); p.sold = (p.sold || 0) + it.qty; } });
    }
    if (status === 'pagado' || status === 'despachado' || status === 'entregado') order.payment.status = 'aprobado';
    order.status = status;
    order.history = order.history || [];
    order.history.push({ at: Date.now(), status });
  };

  /* ---------- Webhooks ---------- */
  SV.webhooks = {
    dispatch(session, event, data, onDone) {
      const targets = session.webhooks.filter((w) => w.active && (w.event === event || w.event === '*'));
      targets.forEach((w) => {
        const payload = JSON.stringify({ id: U.uid('evt_'), event, created_at: new Date().toISOString(), store: session.store.subdomain, data });
        const sig = U.signature(w.secret, payload);
        const entry = { id: U.uid('dlv_'), at: Date.now(), webhookId: w.id, event, url: w.url, payload, signature: sig, status: 'enviando', code: null, ms: null, attempts: 1, real: !!w.realSend };
        session.webhookLog.unshift(entry);
        session.webhookLog = session.webhookLog.slice(0, 60);
        const t0 = performance.now();
        const finish = (code, note) => { entry.code = code; entry.status = code >= 200 && code < 300 ? 'entregado' : 'fallido'; entry.note = note; entry.ms = Math.round(performance.now() - t0); if (entry.status === 'fallido') entry.nextRetry = Date.now() + 60000; onDone && onDone(entry); };
        if (w.realSend && /^https?:\/\//i.test(w.url)) {
          fetch(w.url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: payload })
            .then(() => finish(200, 'Enviado de verdad (respuesta opaca por CORS: el navegador no deja leer el código real).'))
            .catch((e) => finish(0, 'Error de red: ' + e.message));
        } else {
          setTimeout(() => {
            if (/fail|error|500/i.test(w.url)) finish(500, 'Respuesta simulada 500 Internal Server Error. Se reintentará con espera exponencial (1 min, 5 min, 30 min).');
            else if (!/^https:\/\//i.test(w.url)) finish(400, 'Simulación: la URL debe usar HTTPS para recibir webhooks en producción.');
            else finish(200, 'Respuesta simulada 200 OK.');
          }, 250 + Math.random() * 500);
        }
      });
      return targets.length;
    }
  };

  /* ---------- Integraciones con aplicativos externos ---------- */
  const line = (ok, text) => ({ ok, text });
  SV.integrationsSim = {
    async connect(session, id, values) {
      const def = SV.INTEGRATIONS.find((i) => i.id === id);
      await wait(600 + Math.random() * 700);
      const bad = def.fields.filter((f) => !new RegExp(f.pattern).test(String(values[f.key] || '').trim()));
      if (bad.length) return { ok: false, status: 401, message: '401 Unauthorized · Credenciales rechazadas en: ' + bad.map((f) => f.label).join(', ') + '. Revisa el formato de ejemplo.' };
      session.integrations[id] = { connected: true, connectedAt: Date.now(), values, log: [{ at: Date.now(), ok: true, text: 'Conexión verificada (200 OK) con ' + def.name }], stats: {} };
      return { ok: true, status: 200, message: 'Conexión establecida con ' + def.name + ' en modo sandbox.' };
    },

    async run(session, id, action) {
      const integ = session.integrations[id];
      if (!integ || !integ.connected) return { ok: false, lines: [line(false, 'La integración no está conectada.')] };
      await wait(700 + Math.random() * 900);
      const cur = session.store.currency;
      const pubs = session.products.filter((p) => p.status === 'publicado');
      const lastOrder = session.orders.find((o) => o.status !== 'cancelado');
      const a = session.analytics || {};
      let out;
      switch (id + ':' + action) {
        case 'wompi:test_payment': {
          const ref = 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase();
          out = [line(true, 'POST /v1/transactions → 201 Created'), line(true, 'Referencia ' + ref + ' · Monto ' + U.money(50000, cur) + ' · Estado APPROVED'), line(true, 'Evento transaction.updated recibido y validado con el secreto de eventos')];
          break;
        }
        case 'wompi:list_transactions':
          out = session.orders.length ? session.orders.slice(0, 5).map((o) => line(o.payment.status === 'aprobado', o.id + ' · ' + o.payment.method + ' · ' + U.money(o.total, cur) + ' · ' + (o.payment.status === 'aprobado' ? 'APPROVED' : 'PENDING'))) : [line(false, 'No hay transacciones. Realiza una compra en Mi Tienda en Vivo.')];
          break;
        case 'mercadopago:create_preference':
          out = [line(true, 'POST /checkout/preferences → 201'), line(true, 'Preferencia ' + U.uid('pref_') + ' con ' + Math.min(pubs.length, 3) + ' ítems'), line(true, 'init_point: https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=...')];
          break;
        case 'siigo:invoice_last':
          out = lastOrder ? [line(true, 'POST /v1/invoices → 201 Created'), line(true, 'Factura electrónica FE-' + (1000 + session.orders.length) + ' para ' + lastOrder.customer.name), line(true, 'Base ' + U.money(lastOrder.total / 1.19, cur) + ' · IVA 19% ' + U.money(lastOrder.total - lastOrder.total / 1.19, cur) + ' · Total ' + U.money(lastOrder.total, cur)), line(true, 'CUFE simulado: ' + U.randomKey('', 32).toLowerCase())] : [line(false, '422 · No hay pedidos para facturar.')];
          break;
        case 'siigo:sync_products':
        case 'alegra:export_sales': {
          if (action === 'export_sales') {
            const st = SV.commerce.stats(session);
            out = [line(true, 'POST /api/v1/journals → 201'), line(true, st.orders + ' ventas exportadas · Ingresos ' + U.money(st.revenue, cur)), line(true, 'Costo de ventas ' + U.money(st.cost, cur) + ' · Utilidad bruta ' + U.money(st.grossProfit, cur))];
          } else {
            const noSku = session.products.filter((p) => !p.sku);
            out = [line(true, 'POST /v1/products (lote) → 207 Multi-Status'), line(true, (session.products.length - noSku.length) + ' productos creados o actualizados')].concat(noSku.map((p) => line(false, 'Rechazado "' + p.name + '": falta el SKU')));
          }
          break;
        }
        case 'sheets:push_inventory':
          out = [line(true, 'PUT /v4/spreadsheets/' + integ.values.sheetId.slice(0, 8) + '…/values/Inventario!A1 → 200'), line(true, (session.products.length + 1) + ' filas escritas (encabezado + productos)'), line(true, 'Columnas: SKU, Producto, Categoría, Precio, Costo, Stock, Stock mínimo, Estado')];
          break;
        case 'sheets:pull_stock': {
          const changed = session.products.filter((p) => Number(p.stock) <= Number(p.minStock));
          changed.forEach((p) => { p.stock = Number(p.stock) + Number(p.minStock) * 3; });
          out = changed.length ? [line(true, 'GET /values/Inventario!A1:H → 200')].concat(changed.map((p) => line(true, 'Reabastecido ' + p.sku + ' desde la hoja: stock ahora ' + p.stock))) : [line(true, 'GET /values → 200'), line(true, 'Sin diferencias: el stock de la hoja coincide con la tienda')];
          out.mutated = changed.length > 0;
          break;
        }
        case 'meta:sync_catalog': {
          const rejected = pubs.filter((p) => !p.image || !p.description || !(p.price > 0));
          const okN = pubs.length - rejected.length;
          out = [line(true, 'POST /' + integ.values.catalogId + '/items_batch → 200'), line(okN > 0, okN + ' productos aprobados para Facebook e Instagram Shops')]
            .concat(rejected.map((p) => line(false, 'Rechazado "' + p.name + '": ' + (!p.image ? 'falta imagen' : !p.description ? 'falta descripción' : 'precio inválido'))))
            .concat(session.products.filter((p) => p.status !== 'publicado').length ? [line(false, session.products.filter((p) => p.status !== 'publicado').length + ' en borrador no se envían')] : []);
          break;
        }
        case 'meta:pixel_report':
        case 'ga4:funnel': {
          const pv = a.page_view || 0, vi = a.view_item || 0, ac = a.add_to_cart || 0, bc = a.begin_checkout || 0, pu = a.purchase || 0;
          const conv = pv ? (pu / pv * 100).toFixed(1) + '%' : '0%';
          out = [line(true, (id === 'ga4' ? 'GA4 · ' : 'Píxel ' + integ.values.pixelId + ' · ') + 'eventos registrados desde la vista previa de la tienda'), line(pv > 0, 'PageView / page_view: ' + pv), line(vi > 0, 'ViewContent / view_item: ' + vi), line(ac > 0, 'AddToCart / add_to_cart: ' + ac), line(bc > 0, 'InitiateCheckout / begin_checkout: ' + bc), line(pu > 0, 'Purchase / purchase: ' + pu), line(true, 'Tasa de conversión (compras / visitas): ' + conv)];
          if (!pv) out.push(line(false, 'Navega la tienda en "Mi Tienda en Vivo" para generar eventos.'));
          break;
        }
        case 'tiktok:sync_feed':
          out = [line(true, 'Feed CSV generado con ' + pubs.length + ' productos (sku_id, title, price, image_link, availability)'), line(true, 'POST /open_api/v1.3/catalog/product/upload → 200')].concat(pubs.filter((p) => !p.image).map((p) => line(false, p.sku + ' sin image_link: TikTok lo marcará como no apto')));
          break;
        case 'whatsappapi:send_template':
          out = lastOrder ? [line(true, 'POST /' + integ.values.phoneId + '/messages → 200'), line(true, 'Plantilla "confirmacion_pedido" enviada a ' + (lastOrder.customer.phone || 'cliente')), line(true, 'Variables: {{1}}=' + lastOrder.customer.name + ' {{2}}=' + lastOrder.id + ' {{3}}=' + U.money(lastOrder.total, cur))] : [line(false, 'No hay pedidos para notificar.')];
          break;
        case 'servientrega:quote':
          out = [line(true, 'POST /cotizador → 200'), line(true, 'Origen ' + session.store.city + ' → Medellín, Antioquia · 2 kg'), line(true, 'Flete ' + U.money(12000 + Math.round(Math.random() * 4) * 1000, cur) + ' · Entrega 2 a 3 días hábiles')];
          break;
        case 'servientrega:guides': {
          const pend = session.orders.filter((o) => o.status === 'pagado' || o.status === 'pendiente');
          pend.forEach((o) => { o.tracking = o.tracking || ('SRV' + Math.floor(1e9 + Math.random() * 9e9)); });
          out = pend.length ? pend.map((o) => line(true, 'Guía ' + o.tracking + ' generada para ' + o.id + ' → ' + (o.customer.city || o.customer.dep))) : [line(false, 'No hay pedidos pagados o pendientes para despachar.')];
          out.mutated = pend.length > 0;
          break;
        }
        case 'mailchimp:sync_customers': {
          const emails = Array.from(new Set(session.orders.map((o) => o.customer.email).filter(Boolean)));
          out = emails.length ? [line(true, 'POST /3.0/lists/{list_id} → 200'), line(true, emails.length + ' contactos agregados a la audiencia "Compradores"')].concat(emails.slice(0, 5).map((e) => line(true, '• ' + e))) : [line(false, 'Aún no hay compradores con correo.')];
          break;
        }
        default:
          out = [line(false, 'Acción no disponible.')];
      }
      integ.log = [{ at: Date.now(), ok: out.every((l) => l.ok), text: (SV.INTEGRATIONS.find((i) => i.id === id).actions.find((x) => x.id === action) || {}).label || action }].concat(integ.log || []).slice(0, 20);
      return { ok: out.every((l) => l.ok), lines: out, mutated: !!out.mutated };
    }
  };
})(window.SV);

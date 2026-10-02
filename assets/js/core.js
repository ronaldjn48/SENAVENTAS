/* ==========================================================================
   SENAVENTAS · Utilidades, modelo de sesión y almacenamiento
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  /* ---------- Utilidades ---------- */
  const U = SV.util = {};

  U.esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  U.uid = (p = '') => p + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 7);

  U.clone = (o) => JSON.parse(JSON.stringify(o));

  U.money = (n, cur = 'COP') => {
    const v = Number(n) || 0;
    if (cur === 'USD') return 'US$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (cur === 'EUR') return '€' + v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + Math.round(v).toLocaleString('es-CO');
  };

  U.pct = (n) => (Number.isFinite(n) ? n.toFixed(1) : '0.0') + '%';

  U.margin = (price, cost) => (price > 0 ? ((price - cost) / price) * 100 : 0);

  U.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  U.slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'tienda';

  U.fmtDate = (ts) => {
    try { return new Date(ts).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return String(ts); }
  };

  U.timeAgo = (ts) => {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 10) return 'ahora mismo';
    if (s < 60) return 'hace ' + s + ' s';
    if (s < 3600) return 'hace ' + Math.round(s / 60) + ' min';
    if (s < 86400) return 'hace ' + Math.round(s / 3600) + ' h';
    return U.fmtDate(ts);
  };

  U.download = (name, content, type = 'text/plain') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };

  U.readFile = (file, as = 'text') => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    as === 'dataurl' ? r.readAsDataURL(file) : r.readAsText(file);
  });

  /* Reduce la imagen a máx. 900 px y la convierte a JPEG para que la sesión pese poco. */
  U.compressImage = (file, max = 900, quality = 0.82) => new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error('El archivo no es una imagen.'));
    U.readFile(file, 'dataurl').then((src) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => rej(new Error('No se pudo leer la imagen.'));
      img.src = src;
    }).catch(rej);
  });

  /* Imagen de reemplazo cuando un producto no tiene foto. */
  U.placeholder = (text = '?', bg = '#e5eeff', fg = '#005f2e') => {
    const letter = U.esc(String(text).trim().charAt(0).toUpperCase() || '?');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="54%" font-family="Arial,sans-serif" font-size="150" font-weight="700" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${letter}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  /* ---------- CSV ---------- */
  U.toCSV = (rows) => rows.map((r) => r.map((c) => {
    const s = String(c == null ? '' : c);
    return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(';')).join('\n');

  U.parseCSV = (text) => {
    const sep = (text.split('\n')[0].match(/;/g) || []).length >= (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    const rows = []; let row = []; let cur = ''; let q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); cur = '';
        if (row.some((c) => c.trim() !== '')) rows.push(row);
        row = [];
      } else cur += ch;
    }
    row.push(cur);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
    return rows;
  };

  /* ---------- ZIP sin compresión (método STORE) ---------- */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (bytes) => {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };

  U.zip = (files) => {
    const enc = new TextEncoder();
    const parts = []; const central = []; let offset = 0;
    const d = new Date();
    const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach((f) => {
      const name = enc.encode(f.name);
      const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    const cSize = central.reduce((a, b) => a + b.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cSize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
  };

  /* Firma didáctica tipo HMAC (no criptográfica) para webhooks simulados. */
  U.signature = (secret, body) => {
    let h1 = 0x811c9dc5, h2 = 0x1b873593;
    const s = secret + '.' + body;
    for (let i = 0; i < s.length; i++) {
      h1 = Math.imul(h1 ^ s.charCodeAt(i), 16777619) >>> 0;
      h2 = Math.imul(h2 ^ s.charCodeAt(i), 2246822507) >>> 0;
    }
    return 'sha256=' + h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0') + (h1 ^ h2).toString(16).padStart(8, '0');
  };

  U.randomKey = (prefix, n = 24) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let s = '';
    const arr = new Uint32Array(n);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(arr) : arr.forEach((_, i) => { arr[i] = Math.random() * 1e9; });
    arr.forEach((v) => { s += chars[v % chars.length]; });
    return prefix + s;
  };

  /* Hash simple y determinista (no es criptográfico: el acceso es solo para separar el trabajo de cada estudiante). */
  U.simpleHash = (str) => {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  };

  /* ---------- Usuarios del equipo (sin verificación de correo) ---------- */
  const ACC_KEY = 'sv:accounts';
  const USER_KEY = 'sv:user';
  let memAccounts = {};
  let memUser = null;
  const readAcc = () => { try { return JSON.parse(localStorage.getItem(ACC_KEY) || '{}') || {}; } catch (e) { return memAccounts; } };
  const writeAcc = (o) => { memAccounts = o; try { localStorage.setItem(ACC_KEY, JSON.stringify(o)); } catch (e) { /* solo memoria */ } };
  const keyOf = (u) => String(u || '').trim().toLowerCase();
  const hashPw = (id, pw) => U.simpleHash(id + '\u0000' + pw);

  SV.auth = {
    keyOf,
    validUsername: (u) => /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ._\- ]{3,24}$/.test(String(u || '').trim()),
    exists: (u) => !!readAcc()[keyOf(u)],
    count: () => Object.keys(readAcc()).length,
    register(username, password) {
      const name = String(username || '').trim().replace(/\s+/g, ' ');
      if (!SV.auth.validUsername(name)) return { ok: false, error: 'El usuario debe tener entre 3 y 24 caracteres (letras, números, punto, guion o espacio).' };
      if (String(password || '').length < 4) return { ok: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
      const all = readAcc(); const id = keyOf(name);
      if (all[id]) return { ok: false, error: 'Ese usuario ya existe en este equipo. Elige otro o inicia sesión.', code: 'exists' };
      all[id] = { id, username: name, passHash: hashPw(id, password), createdAt: Date.now() };
      writeAcc(all);
      return { ok: true, account: all[id] };
    },
    login(username, password) {
      const id = keyOf(username); const acc = readAcc()[id];
      if (!acc) return { ok: false, error: 'No existe ese usuario en este equipo. Crea uno nuevo.', code: 'no_user' };
      if (acc.passHash !== hashPw(id, password)) return { ok: false, error: 'Contraseña incorrecta.', code: 'bad_pass' };
      return { ok: true, account: acc };
    },
    /* La sesión dura mientras la pestaña esté abierta; "mantener" la conserva en el equipo. */
    setCurrent(acc, keep) {
      try { sessionStorage.setItem(USER_KEY, acc.id); } catch (e) { memUser = acc.id; }
      try { if (keep) localStorage.setItem(USER_KEY, acc.id); else localStorage.removeItem(USER_KEY); } catch (e) { /* sin almacenamiento */ }
    },
    current() {
      let id = memUser;
      try { id = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY) || id; } catch (e) { /* sin almacenamiento */ }
      return id ? (readAcc()[id] || null) : null;
    },
    logout() {
      memUser = null;
      try { sessionStorage.removeItem(USER_KEY); } catch (e) { /* nada */ }
      try { localStorage.removeItem(USER_KEY); } catch (e) { /* nada */ }
    },
    remove(id) { const all = readAcc(); delete all[id]; writeAcc(all); SV.auth.logout(); }
  };

  /* ---------- Modelo de sesión ---------- */
  SV.SCHEMA_VERSION = 2;

  /* Tienda en blanco: conserva el diseño del tema, pero sin productos, pedidos ni textos de ejemplo. */
  const blankPreset = (themeId, ownerName) => {
    const base = SV.util.clone(SV.PRESETS[themeId] || SV.PRESETS.minimal);
    const nice = String(ownerName || 'Aprendiz').split(/[\s._-]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const name = 'Tienda de ' + nice;
    base.store = Object.assign(base.store, {
      name, slogan: '', announcement: '', heroBadge: 'Tienda virtual', heroTitle: 'Bienvenido a', heroHighlight: name,
      heroText: 'Escribe aquí la propuesta de valor de tu tienda.', heroImage: '', heroCardTitle: 'Producto destacado', heroCardText: 'Cuéntale al cliente por qué comprar',
      ctaPrimary: 'Ver productos', ctaSecondary: 'Ver carrito',
      promo: { enabled: false, badge: 'Promoción', title: 'Nombre de tu promoción', text: 'Describe tu kit o descuento.', price: 0, compareAt: 0, productIds: [] },
      trustTitle: 'Por qué comprar con nosotros', trustText: 'Cuenta tus valores de marca.',
      trust: [{ icon: 'verified', title: 'Calidad', text: 'Describe tu garantía.' }, { icon: 'local_shipping', title: 'Envíos', text: 'Explica cómo entregas.' }, { icon: 'support_agent', title: 'Atención', text: 'Indica cómo te contactan.' }],
      aboutTitle: 'Sobre nosotros', aboutText: 'Cuenta la historia de tu emprendimiento.',
      freeShippingThreshold: 0, shippingFlat: 10000
    });
    base.categories = ['General'];
    base.products = [];
    base.coupons = [];
    return base;
  };

  SV.newSession = (themeId = 'minimal', owner = {}, opts = {}) => {
    const ownerName = owner.name || 'Aprendiz SENA';
    const preset = opts.blank ? blankPreset(themeId, ownerName) : SV.util.clone(SV.PRESETS[themeId] || SV.PRESETS.minimal);
    const now = Date.now();
    return {
      schema: SV.SCHEMA_VERSION,
      id: U.uid('ses_'),
      userId: opts.userId || null,
      name: owner.sessionName || preset.store.name,
      createdAt: now,
      updatedAt: now,
      owner: {
        name: ownerName,
        role: owner.role || 'Aprendiz SENA',
        ficha: owner.ficha || '27118',
        programa: owner.programa || 'Gestión de Mercados',
        centro: owner.centro || 'Centro de Comercio y Servicios',
        regional: owner.regional || 'Regional Bogotá',
        instructor: owner.instructor || ''
      },
      store: Object.assign({
        themeId,
        brandColor: '',
        currency: 'COP',
        subdomain: opts.blank ? U.slug(ownerName) + '-tienda' : U.slug(ownerName.split(' ')[0]) + '-' + U.slug(preset.store.name).split('-')[0],
        whatsapp: '573001234567',
        email: 'contacto@tienda-sena.edu.co',
        city: 'Bogotá D.C.',
        sections: { announcement: true, hero: true, promo: true, catalog: true, trust: true, about: true, credits: true },
        seo: { title: preset.store.name + ' | Tienda virtual', description: preset.store.slogan, keywords: preset.categories.join(', ') }
      }, preset.store),
      categories: preset.categories,
      products: preset.products,
      coupons: preset.coupons,
      plugins: { payments: true, shipping: true, seo: false, whatsapp: true, coupons: true, freeShippingBar: true, reviews: true, wishlist: false },
      integrations: {},
      apiKeys: [],
      webhooks: [],
      webhookLog: [],
      apiLog: [],
      orders: [],
      analytics: {},
      activity: [{ at: now, text: (opts.blank ? 'Tienda nueva desde cero con el tema ' : 'Sesión creada con el tema ') + ((SV.THEMES.find((t) => t.id === themeId) || {}).name || themeId) }],
      progress: { themeChosen: false, previewVisited: false },
      published: null
    };
  };

  /* Completa campos faltantes cuando se importa una sesión antigua o editada a mano. */
  SV.normalizeSession = (s) => {
    if (!s || typeof s !== 'object' || !s.store || !Array.isArray(s.products)) throw new Error('El archivo no corresponde a una sesión de SENAVENTAS.');
    const base = SV.newSession(s.store.themeId && SV.PRESETS[s.store.themeId] ? s.store.themeId : 'minimal');
    const out = Object.assign({}, base, s);
    out.owner = Object.assign({}, base.owner, s.owner || {});
    out.store = Object.assign({}, base.store, s.store);
    out.store.sections = Object.assign({}, base.store.sections, (s.store || {}).sections || {});
    out.store.seo = Object.assign({}, base.store.seo, (s.store || {}).seo || {});
    out.store.promo = Object.assign({}, base.store.promo, (s.store || {}).promo || {});
    out.plugins = Object.assign({}, base.plugins, s.plugins || {});
    out.progress = Object.assign({}, base.progress, s.progress || {});
    ['integrations', 'analytics'].forEach((k) => { if (!out[k] || typeof out[k] !== 'object') out[k] = {}; });
    ['apiKeys', 'webhooks', 'webhookLog', 'apiLog', 'orders', 'activity', 'coupons', 'categories'].forEach((k) => { if (!Array.isArray(out[k])) out[k] = []; });
    out.products = out.products.map((p) => Object.assign({ id: U.uid('p'), sku: '', name: 'Producto', category: out.categories[0] || 'General', price: 0, cost: 0, stock: 0, minStock: 5, status: 'borrador', image: '', description: '', compareAt: 0, rating: 4.5, reviews: 0, sold: 0, moq: 1, badge: '', origin: '' }, p));
    out.schema = SV.SCHEMA_VERSION;
    return out;
  };

  /* ---------- Almacenamiento: IndexedDB con respaldo en localStorage ---------- */
  const DB_NAME = 'senaventas';
  const STORE = 'sessions';
  let dbPromise = null;

  const openDB = () => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((res, rej) => {
      if (!('indexedDB' in window)) return rej(new Error('Sin IndexedDB'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }).catch((e) => { console.warn('IndexedDB no disponible, se usa localStorage', e); return null; });
    return dbPromise;
  };

  const lsKey = (id) => 'sv:session:' + id;
  const lsIndex = () => { try { return JSON.parse(localStorage.getItem('sv:index') || '[]'); } catch (e) { return []; } };

  const summary = (v) => ({ id: v.id, name: v.name, updatedAt: v.updatedAt, createdAt: v.createdAt, themeId: v.store.themeId, owner: v.owner, products: v.products.length, orders: v.orders.length, published: v.published, storeName: v.store.name, icon: v.store.icon, userId: v.userId || null });
  const mine = (v, userId) => !!v && !!userId && v.userId === userId;

  SV.storage = {
    /* Solo devuelve sesiones del usuario indicado: cada estudiante ve únicamente su trabajo. */
    async list(userId) {
      const db = await openDB();
      if (db) {
        return new Promise((res) => {
          const out = [];
          const cur = db.transaction(STORE, 'readonly').objectStore(STORE).openCursor();
          cur.onsuccess = () => {
            const c = cur.result;
            if (c) { if (mine(c.value, userId)) out.push(summary(c.value)); c.continue(); }
            else res(out.sort((a, b) => b.updatedAt - a.updatedAt));
          };
          cur.onerror = () => res(out);
        });
      }
      return lsIndex().map((id) => { try { const v = JSON.parse(localStorage.getItem(lsKey(id))); return mine(v, userId) ? summary(v) : null; } catch (e) { return null; } })
        .filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async get(id, userId) {
      const db = await openDB();
      let v = null;
      if (db) {
        v = await new Promise((res) => {
          const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
          req.onsuccess = () => res(req.result || null);
          req.onerror = () => res(null);
        });
      } else { try { v = JSON.parse(localStorage.getItem(lsKey(id))); } catch (e) { v = null; } }
      return mine(v, userId) ? v : null;
    },
    async put(session) {
      if (!session.userId) throw new Error('La sesión no tiene usuario.');
      const db = await openDB();
      if (db) {
        return new Promise((res, rej) => {
          const tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put(session);
          tx.oncomplete = () => res(true);
          tx.onerror = () => rej(tx.error);
        });
      }
      localStorage.setItem(lsKey(session.id), JSON.stringify(session));
      const idx = lsIndex();
      if (!idx.includes(session.id)) { idx.push(session.id); localStorage.setItem('sv:index', JSON.stringify(idx)); }
      return true;
    },
    async remove(id, userId) {
      if (!(await SV.storage.get(id, userId))) return false;
      const db = await openDB();
      if (db) {
        return new Promise((res) => {
          const tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).delete(id);
          tx.oncomplete = () => res(true);
          tx.onerror = () => res(false);
        });
      }
      localStorage.removeItem(lsKey(id));
      localStorage.setItem('sv:index', JSON.stringify(lsIndex().filter((x) => x !== id)));
      return true;
    },
    async removeAll(userId) {
      const list = await SV.storage.list(userId);
      for (const x of list) await SV.storage.remove(x.id, userId);
      try { localStorage.removeItem('sv:last:' + userId); } catch (e) { /* nada */ }
    },
    getLast(userId) { try { return localStorage.getItem('sv:last:' + userId); } catch (e) { return null; } },
    setLast(id, userId) { try { localStorage.setItem('sv:last:' + userId, id); } catch (e) { /* sin almacenamiento */ } }
  };
})(window.SV);

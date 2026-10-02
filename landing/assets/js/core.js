/* ==========================================================================
   SENA VENTAS LANDING PAGE · Utilidades, Excel, enlaces comprimidos,
   modelo de proyecto y almacenamiento
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

  U.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  U.slug = (s, fb = 'landing') => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || fb;

  U.digits = (s) => String(s || '').replace(/\D/g, '');

  U.pct = (n) => (Number.isFinite(n) ? n.toFixed(1) : '0.0') + '%';

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

  /* Reduce la imagen y la convierte a JPEG (o PNG si tiene transparencia) para que el proyecto y el enlace pesen poco. */
  U.compressImage = (file, max = 1280, quality = 0.78) => new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error('El archivo no es una imagen.'));
    if (/svg/.test(file.type)) { U.readFile(file, 'dataurl').then(res, rej); return; }
    U.readFile(file, 'dataurl').then((src) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        const ctx = c.getContext('2d');
        const png = /png|webp|gif/.test(file.type) && max <= 400;
        if (!png) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        res(png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => rej(new Error('No se pudo leer la imagen.'));
      img.src = src;
    }).catch(rej);
  });

  U.placeholder = (text = '?', bg = '#e5eeff', fg = '#005f2e') => {
    const letter = U.esc(String(text).trim().charAt(0).toUpperCase() || '?');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="54%" font-family="Arial,sans-serif" font-size="120" font-weight="700" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${letter}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  /* Luminancia para decidir texto claro u oscuro sobre un color. */
  U.hexRgb = (hex) => {
    let h = String(hex || '').replace('#', '').trim();
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) return [0, 0, 0];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  U.isDark = (hex) => {
    const [r, g, b] = U.hexRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
  };
  U.onColor = (hex) => (U.isDark(hex) ? '#ffffff' : '#111827');

  /* ---------- CSV ---------- */
  U.toCSV = (rows) => '\ufeff' + rows.map((r) => r.map((c) => {
    const s = String(c == null ? '' : c);
    return /[",;\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(';')).join('\r\n');

  U.parseCSV = (text) => {
    text = String(text || '').replace(/^\ufeff/, '');
    const head = text.split('\n')[0];
    const sep = (head.match(/;/g) || []).length >= (head.match(/,/g) || []).length ? ';' : ',';
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

  U.zip = (files, mime = 'application/zip') => {
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
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: mime });
  };

  /* ---------- Excel (.xlsx) sin librerías ----------
     sheets: [{ name, rows: [[...]], widths: [n], dateCols: [i] }]
     La primera fila de cada hoja es el encabezado (negrita, fondo verde, filtro y fila fija). */
  const xmlEsc = (v) => String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const colName = (n) => { let s = ''; n += 1; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const excelDate = (ts) => { const d = new Date(ts); return (ts - d.getTimezoneOffset() * 60000) / 86400000 + 25569; };
  const sheetName = (n, i) => (String(n || 'Hoja' + (i + 1)).replace(/[\[\]:*?/\\]/g, ' ').slice(0, 31)) || 'Hoja' + (i + 1);

  U.xlsx = (sheets, meta = {}) => {
    const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const NR = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    const names = sheets.map((s, i) => sheetName(s.name, i));
    const files = [];
    files.push({ name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' + sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>' });
    files.push({ name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' });
    const iso = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    files.push({ name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEsc(meta.title || 'Base de datos')}</dc:title><dc:creator>${xmlEsc(meta.author || 'SENA VENTAS LANDING PAGE')}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${iso}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${iso}</dcterms:modified></cp:coreProperties>` });
    const filters = sheets.map((s, i) => (s.rows.length > 1 && s.rows[0].length ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xmlEsc(names[i]).replace(/'/g, "''")}'!$A$1:$${colName(s.rows[0].length - 1)}$${s.rows.length}</definedName>` : '')).join('');
    files.push({ name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="${NS}" xmlns:r="${NR}"><bookViews><workbookView/></bookViews><sheets>${names.map((n, i) => `<sheet name="${xmlEsc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>${filters ? '<definedNames>' + filters + '</definedNames>' : ''}</workbook>` });
    files.push({ name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` });
    files.push({ name: 'xl/styles.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="${NS}"><numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF007A3D"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>` });
    sheets.forEach((s, si) => {
      const rows = s.rows || [];
      const ncols = rows.reduce((m, r) => Math.max(m, r.length), 0);
      const dateCols = new Set(s.dateCols || []);
      const widths = s.widths || [];
      const cols = ncols ? '<cols>' + Array.from({ length: ncols }, (_, i) => {
        const auto = Math.min(60, Math.max(10, ...rows.slice(0, 200).map((r) => String(r[i] == null ? '' : r[i]).length + 2)));
        return `<col min="${i + 1}" max="${i + 1}" width="${widths[i] || (dateCols.has(i) ? 18 : auto)}" customWidth="1"/>`;
      }).join('') + '</cols>' : '';
      const data = rows.map((r, ri) => `<row r="${ri + 1}">` + r.map((v, ci) => {
        const ref = colName(ci) + (ri + 1);
        if (v == null || v === '') return '';
        if (ri === 0) return `<c r="${ref}" t="inlineStr" s="1"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
        if (dateCols.has(ci) && Number.isFinite(Number(v)) && Number(v) > 1e11) return `<c r="${ref}" s="2"><v>${excelDate(Number(v)).toFixed(6)}</v></c>`;
        if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"><v>${v}</v></c>`;
        if (v && typeof v === 'object' && v.bold) return `<c r="${ref}" t="inlineStr" s="4"><is><t xml:space="preserve">${xmlEsc(v.text)}</t></is></c>`;
        const str = String(v);
        return `<c r="${ref}" t="inlineStr"${str.length > 60 ? ' s="3"' : ''}><is><t xml:space="preserve">${xmlEsc(str)}</t></is></c>`;
      }).join('') + '</row>').join('');
      const freeze = s.freeze === false ? '' : '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/>';
      const af = s.filter !== false && rows.length > 1 && ncols ? `<autoFilter ref="A1:${colName(ncols - 1)}${rows.length}"/>` : '';
      files.push({ name: `xl/worksheets/sheet${si + 1}.xml`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="${NS}" xmlns:r="${NR}"><sheetViews><sheetView workbookViewId="0"${si === 0 ? ' tabSelected="1"' : ''}>${freeze}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${data}</sheetData>${af}</worksheet>` });
    });
    return U.zip(files, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  /* ---------- Enlaces: comprime el proyecto dentro de la URL ---------- */
  U.b64url = (bytes) => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  U.fromB64url = (str) => {
    let b = String(str || '').replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/]/g, '');
    while (b.length % 4) b += '=';
    const bin = atob(b);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };
  U.pack = async (obj) => {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) {
      try {
        const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
        const buf = new Uint8Array(await new Response(stream).arrayBuffer());
        return 'z' + U.b64url(buf);
      } catch (e) { /* sin compresión */ }
    }
    return 'j' + U.b64url(bytes);
  };
  U.unpack = async (str) => {
    const kind = str.charAt(0);
    const bytes = U.fromB64url(str.slice(1));
    let raw = bytes;
    if (kind === 'z') {
      if (!window.DecompressionStream) throw new Error('Este navegador no puede abrir enlaces comprimidos. Actualízalo o usa Chrome, Edge o Firefox.');
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
      raw = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    return JSON.parse(new TextDecoder().decode(raw));
  };

  /* ---------- Configuración de la coordinación (config.js) + ajustes locales ---------- */
  let userNs = '';
  const userCfgKey = () => 'svl:u:' + (userNs || 'sin-usuario') + ':cfg';
  SV.config = () => {
    const base = Object.assign({ institucion: 'SENA', coordinacion: '', nubeUrl: '', basePublica: '', clavePublicar: '' }, window.SV_CONFIG || {});
    let local = {};
    try { local = JSON.parse(localStorage.getItem('svl:cfg') || '{}'); } catch (e) { local = {}; }
    try { local.claveCoordinacion = JSON.parse(localStorage.getItem(userCfgKey()) || '{}').claveCoordinacion || ''; } catch (e) { /* sin almacenamiento */ }
    const out = Object.assign({}, base);
    Object.keys(local).forEach((k) => { if (local[k] !== '' && local[k] != null) out[k] = local[k]; });
    out._fromFile = base;
    return out;
  };
  SV.saveConfig = (patch) => {
    patch = Object.assign({}, patch);
    if ('claveCoordinacion' in patch) {
      try { localStorage.setItem(userCfgKey(), JSON.stringify({ claveCoordinacion: patch.claveCoordinacion })); } catch (e) { /* sin almacenamiento */ }
      delete patch.claveCoordinacion;
    }
    let local = {};
    try { local = JSON.parse(localStorage.getItem('svl:cfg') || '{}'); } catch (e) { local = {}; }
    Object.assign(local, patch);
    try { localStorage.setItem('svl:cfg', JSON.stringify(local)); } catch (e) { /* sin almacenamiento */ }
  };

  /* Dirección donde vive ver.html: la del servidor actual o la configurada por la coordinación. */
  SV.publicBase = () => {
    const norm = (u) => String(u).replace(/[#?].*$/, '').replace(/[^/]*\.html?$/i, '').replace(/\/?$/, '/');
    let local = {};
    try { local = JSON.parse(localStorage.getItem('svl:cfg') || '{}'); } catch (e) { local = {}; }
    if (local.basePublica) return norm(local.basePublica);
    if (/^https?:/.test(location.protocol)) return norm(location.href);
    const cfg = SV.config();
    return cfg.basePublica ? norm(cfg.basePublica) : '';
  };

  /* ---------- Modelo de proyecto ---------- */
  SV.SCHEMA_VERSION = 1;

  SV.newProject = (templateId = 'inmobiliaria', owner = {}) => {
    const tpl = SV.TEMPLATES.find((t) => t.id === templateId) || SV.TEMPLATES[0];
    const base = U.clone(tpl.build());
    const now = Date.now();
    const p = {
      schema: SV.SCHEMA_VERSION,
      id: U.uid('lp_'),
      name: owner.projectName || base.client.name,
      createdAt: now,
      updatedAt: now,
      templateId: tpl.id,
      owner: Object.assign({
        name: 'Aprendiz SENA', role: 'Aprendiz SENA', ficha: '', programa: 'Técnico en Operaciones de Comercio Electrónico',
        centro: '', regional: '', instructor: ''
      }, owner),
      client: base.client,
      social: Object.assign({ facebook: '', instagram: '', tiktok: '', youtube: '', linkedin: '', x: '', telegram: '', web: '' }, base.social || {}),
      theme: base.theme,
      blocks: base.blocks.map((b) => SV.makeBlock(b.type, b.props, b.style)),
      form: base.form,
      wa: Object.assign({ enabled: true, mode: 'number', number: '', link: '', message: '', label: '¿Hablamos por WhatsApp?', position: 'right' }, base.wa || {}),
      seo: base.seo,
      tracking: { metaPixel: '', tiktokPixel: '', ga4: '' },
      leads: [],
      analytics: { view: 0, form_start: 0, lead: 0, whatsapp: 0, cta: 0, call: 0 },
      activity: [{ at: now, text: 'Proyecto creado con la plantilla ' + tpl.name }],
      progress: { templateChosen: false, previewVisited: false, edited: false },
      published: null,
      publishHistory: [],
      cloud: { token: '', lastSync: 0, cloudLink: '' }
    };
    p.form.destinations = Object.assign({ sandbox: true, sheets: { enabled: false, url: '' }, webhook: { enabled: false, url: '', format: 'form' }, email: { enabled: false, to: '' } }, p.form.destinations || {});
    const cfg = SV.config();
    if (cfg.nubeUrl) p.form.destinations.sheets = { enabled: true, url: cfg.nubeUrl };
    return p;
  };

  SV.makeBlock = (type, props, style) => {
    const def = SV.BLOCKS[type];
    if (!def) throw new Error('Bloque desconocido: ' + type);
    return {
      id: U.uid('b'),
      type,
      hidden: false,
      props: Object.assign(U.clone(def.defaults || {}), U.clone(props || {})),
      style: Object.assign({ variant: 'default', pad: 'm', align: '', bg: '', bgImage: '', anchor: '', hideMobile: false, hideDesktop: false }, U.clone(def.style || {}), U.clone(style || {}))
    };
  };

  /* Completa campos faltantes cuando se importa un proyecto antiguo o editado a mano. */
  SV.normalizeProject = (s) => {
    if (!s || typeof s !== 'object' || !Array.isArray(s.blocks) || !s.theme) throw new Error('El archivo no corresponde a un proyecto de SENA VENTAS LANDING PAGE.');
    const base = SV.newProject(SV.TEMPLATES.some((t) => t.id === s.templateId) ? s.templateId : 'inmobiliaria');
    const out = Object.assign({}, base, s);
    ['owner', 'client', 'social', 'theme', 'wa', 'seo', 'tracking', 'analytics', 'progress', 'cloud'].forEach((k) => { out[k] = Object.assign({}, base[k], s[k] || {}); });
    out.form = Object.assign({}, base.form, s.form || {});
    out.form.fields = Array.isArray(out.form.fields) ? out.form.fields : base.form.fields;
    out.form.consent = Object.assign({}, base.form.consent, (s.form || {}).consent || {});
    out.form.destinations = Object.assign({}, base.form.destinations, (s.form || {}).destinations || {});
    ['sheets', 'webhook', 'email'].forEach((k) => { out.form.destinations[k] = Object.assign({}, base.form.destinations[k], out.form.destinations[k] || {}); });
    ['leads', 'activity', 'publishHistory'].forEach((k) => { if (!Array.isArray(out[k])) out[k] = []; });
    out.blocks = out.blocks.filter((b) => b && SV.BLOCKS[b.type]).map((b) => {
      const fresh = SV.makeBlock(b.type);
      return { id: b.id || fresh.id, type: b.type, hidden: !!b.hidden, props: Object.assign(fresh.props, b.props || {}), style: Object.assign(fresh.style, b.style || {}) };
    });
    out.leads = out.leads.map((l) => Object.assign({ id: U.uid('ld_'), at: Date.now(), data: {}, status: 'nuevo', notes: '', source: 'importado', utm: {} }, l));
    out.schema = SV.SCHEMA_VERSION;
    return out;
  };

  /* ---------- Usuarios del equipo (sin correo ni verificación) ----------
     Cada usuario tiene su propia base de datos en el navegador: nadie ve los
     proyectos ni los leads de otra persona y cada cuenta nueva empieza limpia. */
  U.simpleHash = (str) => {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let r = 0; r < 64; r++) {
      for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    }
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  };
  const ACC_KEY = 'svl:accounts';
  const USER_KEY = 'svl:user';
  let memAccounts = {};
  let memUser = null;
  const readAcc = () => { try { return JSON.parse(localStorage.getItem(ACC_KEY) || '{}') || {}; } catch (e) { return memAccounts; } };
  const writeAcc = (o) => { memAccounts = o; try { localStorage.setItem(ACC_KEY, JSON.stringify(o)); } catch (e) { /* solo memoria */ } };
  const keyOf = (u) => String(u || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const hashPw = (id, pw) => U.simpleHash(id + '|' + pw);

  SV.auth = {
    keyOf,
    validUsername: (u) => /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ._\- ]{3,24}$/.test(String(u || '').trim()),
    count: () => Object.keys(readAcc()).length,
    register(username, password) {
      const name = String(username || '').trim().replace(/\s+/g, ' ');
      if (!SV.auth.validUsername(name)) return { ok: false, error: 'El usuario debe tener entre 3 y 24 caracteres (letras, números, punto, guion o espacio).' };
      if (String(password || '').length < 4) return { ok: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
      const all = readAcc(); const id = keyOf(name);
      if (all[id]) return { ok: false, error: 'Ese usuario ya existe en este equipo. Elige otro o ingresa con tu contraseña.', code: 'exists' };
      all[id] = { id, username: name, passHash: hashPw(id, password), createdAt: Date.now() };
      writeAcc(all);
      return { ok: true, account: all[id] };
    },
    login(username, password) {
      const id = keyOf(username); const acc = readAcc()[id];
      if (!acc) return { ok: false, error: 'No existe ese usuario en este equipo. Crea uno nuevo.', code: 'no_user' };
      if (acc.passHash !== hashPw(id, password)) return { ok: false, error: 'Contraseña incorrecta.', code: 'bad_pass' };
      acc.lastLogin = Date.now(); const all = readAcc(); all[id] = acc; writeAcc(all);
      return { ok: true, account: acc };
    },
    /* La sesión dura mientras la pestaña esté abierta; "mantener" la conserva en el equipo. */
    setCurrent(acc, keep) {
      memUser = acc.id;
      try { sessionStorage.setItem(USER_KEY, acc.id); } catch (e) { /* solo memoria */ }
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

  /* ---------- Almacenamiento: IndexedDB con respaldo en localStorage (una base por usuario) ---------- */
  const DB_PREFIX = 'senaventas-landing-u-';
  const dbName = () => DB_PREFIX + encodeURIComponent(userNs || 'sin-usuario');
  const STORE = 'projects';
  let dbPromise = null;

  const openDB = () => {
    if (dbPromise) return dbPromise;
    const name = dbName();
    dbPromise = new Promise((res, rej) => {
      if (!('indexedDB' in window)) return rej(new Error('Sin IndexedDB'));
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }).catch((e) => { console.warn('IndexedDB no disponible, se usa localStorage', e); return null; });
    return dbPromise;
  };

  const lsPre = () => 'svl:u:' + (userNs || 'sin-usuario') + ':';
  const lsKey = (id) => lsPre() + 'project:' + id;
  const lsIndex = () => { try { return JSON.parse(localStorage.getItem(lsPre() + 'index') || '[]'); } catch (e) { return []; } };
  const summary = (v) => ({ id: v.id, name: v.name, updatedAt: v.updatedAt, createdAt: v.createdAt, templateId: v.templateId, owner: v.owner, blocks: (v.blocks || []).length, leads: (v.leads || []).length, published: v.published, client: v.client && v.client.name, color: v.theme && v.theme.primary, icon: v.client && v.client.icon });

  SV.storage = {
    async list() {
      const db = await openDB();
      if (db) {
        return new Promise((res) => {
          const out = [];
          const cur = db.transaction(STORE, 'readonly').objectStore(STORE).openCursor();
          cur.onsuccess = () => {
            const c = cur.result;
            if (c) { try { out.push(summary(c.value)); } catch (e) { /* registro dañado */ } c.continue(); }
            else res(out.sort((a, b) => b.updatedAt - a.updatedAt));
          };
          cur.onerror = () => res(out);
        });
      }
      return lsIndex().map((id) => { try { return summary(JSON.parse(localStorage.getItem(lsKey(id)))); } catch (e) { return null; } })
        .filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
    },
    async get(id) {
      const db = await openDB();
      if (db) {
        return new Promise((res) => {
          const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
          req.onsuccess = () => res(req.result || null);
          req.onerror = () => res(null);
        });
      }
      try { return JSON.parse(localStorage.getItem(lsKey(id))); } catch (e) { return null; }
    },
    async put(project) {
      const db = await openDB();
      if (db) {
        return new Promise((res, rej) => {
          const tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put(project);
          tx.oncomplete = () => res(true);
          tx.onerror = () => rej(tx.error);
        });
      }
      localStorage.setItem(lsKey(project.id), JSON.stringify(project));
      const idx = lsIndex();
      if (!idx.includes(project.id)) { idx.push(project.id); localStorage.setItem(lsPre() + 'index', JSON.stringify(idx)); }
      return true;
    },
    async remove(id) {
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
      localStorage.setItem(lsPre() + 'index', JSON.stringify(lsIndex().filter((x) => x !== id)));
      return true;
    },
    getLast() { try { return localStorage.getItem(lsPre() + 'last'); } catch (e) { return null; } },
    setLast(id) { try { localStorage.setItem(lsPre() + 'last', id); } catch (e) { /* sin almacenamiento */ } },
    /* Cambia al espacio del usuario que inició sesión. */
    useUser(id) { userNs = id || ''; if (dbPromise) dbPromise.then((db) => { if (db) db.close(); }); dbPromise = null; },
    /* Borra todos los proyectos y leads del usuario actual en este equipo. */
    async wipe() {
      const name = dbName();
      if (dbPromise) { const db = await dbPromise; if (db) db.close(); dbPromise = null; }
      await new Promise((res) => { try { const r = indexedDB.deleteDatabase(name); r.onsuccess = r.onerror = r.onblocked = () => res(); } catch (e) { res(); } });
      try { const pre = lsPre(); Object.keys(localStorage).filter((k) => k.indexOf(pre) === 0).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* ---------- Bandeja local: leads que llegan desde el enlace público abierto en este mismo navegador ---------- */
  SV.inbox = {
    key: (pid) => 'svl:inbox:' + pid,
    push(pid, lead) {
      try {
        const k = SV.inbox.key(pid);
        const list = JSON.parse(localStorage.getItem(k) || '[]');
        list.push(lead);
        localStorage.setItem(k, JSON.stringify(list.slice(-500)));
      } catch (e) { /* sin almacenamiento */ }
      try { const bc = new BroadcastChannel('svl-leads'); bc.postMessage({ pid, lead }); bc.close(); } catch (e) { /* navegador antiguo */ }
    },
    pushStat(pid, ev) {
      try {
        const k = 'svl:stats:' + pid;
        const st = JSON.parse(localStorage.getItem(k) || '{}');
        st[ev] = (st[ev] || 0) + 1;
        localStorage.setItem(k, JSON.stringify(st));
      } catch (e) { /* sin almacenamiento */ }
      try { const bc = new BroadcastChannel('svl-leads'); bc.postMessage({ pid, stat: ev }); bc.close(); } catch (e) { /* navegador antiguo */ }
    },
    takeStats(pid) {
      try {
        const k = 'svl:stats:' + pid;
        const st = JSON.parse(localStorage.getItem(k) || '{}');
        localStorage.removeItem(k);
        return st && typeof st === 'object' ? st : {};
      } catch (e) { return {}; }
    },
    take(pid) {
      try {
        const k = SV.inbox.key(pid);
        const list = JSON.parse(localStorage.getItem(k) || '[]');
        localStorage.removeItem(k);
        return Array.isArray(list) ? list : [];
      } catch (e) { return []; }
    }
  };
})(window.SV);

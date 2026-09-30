/* ==========================================================================
   SENA VENTAS LANDING PAGE · Nube de la coordinación
   Backend gratuito con Google Sheets + Google Apps Script:
   guarda leads, publica landing pages con enlace corto y entrega un
   tablero para instructores y coordinadores.
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const U = SV.util;

  /* Código que el instructor pega en Extensiones → Apps Script de una Hoja de cálculo de Google. */
  SV.APPS_SCRIPT = `/**
 * SENA VENTAS LANDING PAGE · Nube de la coordinación (Google Apps Script)
 *
 * INSTALACIÓN (una sola vez por coordinación o por instructor)
 * 1. Crea una Hoja de cálculo de Google nueva (sheets.new).
 * 2. Menú Extensiones > Apps Script. Borra el contenido y pega este código.
 * 3. Cambia CLAVE_COORDINACION por una clave propia y guarda (icono de disquete).
 * 4. Implementar > Nueva implementación > tipo "Aplicación web".
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 5. Autoriza los permisos y copia la URL que termina en /exec.
 * 6. Pega esa URL en SENA VENTAS LANDING PAGE > Nube & Coordinación.
 *
 * Cada vez que cambies este código: Implementar > Gestionar implementaciones >
 * editar (lápiz) > Versión: nueva versión > Implementar. La URL se conserva.
 */
var CLAVE_COORDINACION = 'cambia-esta-clave';  // permite ver el tablero de todo el grupo
var CLAVE_PUBLICAR = '';                        // opcional: código de clase para publicar páginas
var NOTIFICAR_POR_CORREO = false;               // true: correo al dueño de la hoja por cada lead

var HOJA_LEADS = 'Leads';
var HOJA_PAGINAS = 'Paginas';
var COLS_LEADS = ['Fecha', 'ID lead', 'ID página', 'Landing', 'Empresa', 'Aprendiz', 'Ficha', 'Nombre', 'Teléfono', 'Correo', 'Servicio', 'Mensaje', 'Otros datos', 'Interés', 'Origen', 'utm_source', 'utm_medium', 'utm_campaign', 'Dispositivo', 'URL', 'JSON'];
var COLS_PAG = ['ID', 'Landing', 'Empresa', 'Aprendiz', 'Ficha', 'Token', 'Creada', 'Actualizada', 'Versión', 'Visitas', 'Leads', 'Contenido'];
var COL_CONTENIDO = 12;

function hoja_(nombre, cols) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.appendRow(cols);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold').setBackground('#007a3d').setFontColor('#ffffff');
  }
  return sh;
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function limpio_(v) { var s = v == null ? '' : String(v); if (/^[=+\\-@]/.test(s)) s = "'" + s; return s.substring(0, 5000); }
function buscar_(id) {
  var sh = hoja_(HOJA_PAGINAS, COLS_PAG);
  var n = sh.getLastRow();
  if (n < 2) return { sh: sh, row: 0 };
  var ids = sh.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return { sh: sh, row: i + 2 };
  return { sh: sh, row: 0 };
}
function leerContenido_(sh, row) {
  var ancho = Math.max(sh.getLastColumn() - COL_CONTENIDO + 1, 1);
  return sh.getRange(row, COL_CONTENIDO, 1, ancho).getValues()[0].join('');
}
function guardarContenido_(sh, row, texto) {
  var partes = [];
  for (var i = 0; i < texto.length; i += 45000) partes.push(texto.substring(i, i + 45000));
  var ancho = Math.max(sh.getLastColumn() - COL_CONTENIDO + 1, partes.length, 1);
  var fila = [];
  for (var j = 0; j < ancho; j++) fila.push(partes[j] || '');
  sh.getRange(row, COL_CONTENIDO, 1, ancho).setNumberFormat('@').setValues([fila]);
}
function sumar_(sh, row, col) { var c = sh.getRange(row, col); c.setValue((Number(c.getValue()) || 0) + 1); }

function doGet(e) {
  var p = (e && e.parameter) || {};
  var accion = p.accion || 'ping';
  try {
    if (accion === 'ping') return json_({ ok: true, servicio: 'SENA VENTAS LANDING PAGE', hoja: SpreadsheetApp.getActiveSpreadsheet().getName(), requiereCodigo: !!CLAVE_PUBLICAR });
    if (accion === 'pagina') {
      var r = buscar_(p.id);
      if (!r.row) return json_({ ok: false, error: 'La página no existe en esta nube.' });
      var c = leerContenido_(r.sh, r.row);
      if (!c) return json_({ ok: false, error: 'La página aún no se publica en la nube.' });
      if (p.contar !== '0') { var lock = LockService.getScriptLock(); if (lock.tryLock(3000)) { sumar_(r.sh, r.row, 10); lock.releaseLock(); } }
      return json_({ ok: true, pagina: JSON.parse(c) });
    }
    if (accion === 'leads') {
      var pg = buscar_(p.id);
      var autorizado = p.clave === CLAVE_COORDINACION || (pg.row && p.token && String(pg.sh.getRange(pg.row, 6).getValue()) === String(p.token));
      if (!autorizado) return json_({ ok: false, error: 'Token o clave no válidos.' });
      var visitas = pg.row ? Number(pg.sh.getRange(pg.row, 10).getValue()) || 0 : 0;
      return json_({ ok: true, leads: leads_(p.id), visitas: visitas });
    }
    if (accion === 'resumen') {
      if (p.clave !== CLAVE_COORDINACION) return json_({ ok: false, error: 'Clave de coordinación no válida.' });
      var sh = hoja_(HOJA_PAGINAS, COLS_PAG);
      var n = sh.getLastRow();
      var filas = n > 1 ? sh.getRange(2, 1, n - 1, 11).getValues() : [];
      var paginas = filas.map(function (f) { return { id: f[0], landing: f[1], empresa: f[2], aprendiz: f[3], ficha: f[4], creada: f[6], actualizada: f[7], version: f[8], visitas: f[9], leads: f[10] }; });
      return json_({ ok: true, paginas: paginas, leads: p.conLeads === '1' ? leads_('') : [] });
    }
    return json_({ ok: false, error: 'Acción desconocida: ' + accion });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}

function leads_(id) {
  var sh = hoja_(HOJA_LEADS, COLS_LEADS);
  var n = sh.getLastRow();
  if (n < 2) return [];
  var filas = sh.getRange(2, 1, n - 1, COLS_LEADS.length).getValues();
  var out = [];
  filas.forEach(function (f) {
    if (id && String(f[2]) !== String(id)) return;
    var extra = {};
    try { extra = JSON.parse(f[20] || '{}'); } catch (x) { extra = {}; }
    out.push({ id: f[1], at: f[0] instanceof Date ? f[0].getTime() : Date.parse(f[0]) || 0, page: f[2], landing: f[3], empresa: f[4], aprendiz: f[5], ficha: f[6], data: extra.data || { nombre: f[7], telefono: f[8], correo: f[9], servicio: f[10], mensaje: f[11] }, interes: f[13], source: f[14], utm: extra.utm || { utm_source: f[15], utm_medium: f[16], utm_campaign: f[17] }, device: f[18], url: f[19] });
  });
  return out;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.accion === 'lead') {
      var pag = d.pagina || {}; var l = d.lead || {}; var data = l.data || {}; var utm = l.utm || {};
      var estandar = ['nombre', 'telefono', 'correo', 'servicio', 'mensaje'];
      var otros = Object.keys(data).filter(function (k) { return estandar.indexOf(k) < 0 && data[k]; }).map(function (k) { return k + ': ' + data[k]; }).join(' | ');
      var fila = [new Date(l.at || Date.now()), l.id, pag.id, pag.nombre, pag.empresa, pag.aprendiz, pag.ficha, data.nombre, data.telefono, data.correo, data.servicio, data.mensaje, otros, l.interes, l.source || 'enlace público', utm.utm_source, utm.utm_medium, utm.utm_campaign, l.device, l.url, JSON.stringify({ data: data, utm: utm })].map(function (v, i) { return i === 0 ? v : limpio_(v); });
      hoja_(HOJA_LEADS, COLS_LEADS).appendRow(fila);
      var r = buscar_(pag.id);
      if (r.row) sumar_(r.sh, r.row, 11);
      if (NOTIFICAR_POR_CORREO) {
        MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Nuevo interesado: ' + (data.nombre || '') + ' · ' + (pag.empresa || pag.nombre || ''),
          'Landing: ' + pag.nombre + '\\nNombre: ' + data.nombre + '\\nTeléfono: ' + data.telefono + '\\nCorreo: ' + data.correo + '\\nServicio: ' + data.servicio + '\\nMensaje: ' + data.mensaje + '\\nOtros: ' + otros);
      }
      return json_({ ok: true, id: l.id });
    }
    if (d.accion === 'publicar') {
      var reg = buscar_(d.id);
      var ahora = new Date();
      if (!reg.row) {
        if (CLAVE_PUBLICAR && d.codigo !== CLAVE_PUBLICAR) return json_({ ok: false, error: 'Código de clase no válido. Pídelo a tu instructor.' });
        var token = Utilities.getUuid().replace(/-/g, '');
        reg.sh.appendRow([d.id, limpio_(d.meta.landing), limpio_(d.meta.empresa), limpio_(d.meta.aprendiz), limpio_(d.meta.ficha), token, ahora, ahora, d.meta.version || 0, 0, 0]);
        reg = buscar_(d.id);
        if (d.pagina) guardarContenido_(reg.sh, reg.row, JSON.stringify(d.pagina));
        return json_({ ok: true, id: d.id, token: token, nueva: true });
      }
      if (String(reg.sh.getRange(reg.row, 6).getValue()) !== String(d.token)) return json_({ ok: false, error: 'Esta página pertenece a otro proyecto (token distinto).' });
      reg.sh.getRange(reg.row, 2, 1, 4).setValues([[limpio_(d.meta.landing), limpio_(d.meta.empresa), limpio_(d.meta.aprendiz), limpio_(d.meta.ficha)]]);
      reg.sh.getRange(reg.row, 8, 1, 2).setValues([[ahora, d.meta.version || 0]]);
      if (d.pagina) guardarContenido_(reg.sh, reg.row, JSON.stringify(d.pagina));
      return json_({ ok: true, id: d.id, token: d.token });
    }
    return json_({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
`;

  const get = async (url, params, ms = 20000) => {
    const u = url + (url.includes('?') ? '&' : '?') + new URLSearchParams(params).toString();
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(u, { signal: ctl.signal, redirect: 'follow' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'La nube respondió con un error.');
      return j;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('La nube tardó demasiado en responder.');
      if (e instanceof SyntaxError) throw new Error('La URL no responde como la nube de SENA VENTAS. Revisa que termine en /exec y que el acceso sea "Cualquier usuario".');
      throw new Error(/Failed to fetch|NetworkError|Load failed/i.test(e.message) ? 'Sin conexión con la nube. Revisa la URL, tu internet y que la implementación sea pública.' : e.message);
    } finally { clearTimeout(t); }
  };
  const post = async (url, body) => {
    try {
      const r = await fetch(url, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'La nube rechazó la solicitud.');
      return j;
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error('La URL no responde como la nube de SENA VENTAS.');
      throw new Error(/Failed to fetch|NetworkError|Load failed/i.test(e.message) ? 'Sin conexión con la nube. Revisa la URL y tu internet.' : e.message);
    }
  };

  SV.cloud = {
    validUrl: (u) => /^https:\/\/script\.google(usercontent)?\.com\/.+/.test(String(u || '').trim()) || /^https:\/\/.+/.test(String(u || '').trim()),
    isAppsScript: (u) => /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/.test(String(u || '').trim()),
    ping: (url) => get(url, { accion: 'ping' }),
    publish: (url, p, codigo) => post(url, {
      accion: 'publicar', id: p.id, token: p.cloud.token || '', codigo: codigo || '',
      meta: { landing: p.name, empresa: p.client.name, aprendiz: p.owner.name, ficha: p.owner.ficha, version: p.published ? p.published.version : 0 },
      pagina: SV.publicProject(p)
    }),
    page: (url, id) => get(url, { accion: 'pagina', id }),
    leads: (url, id, token) => get(url, { accion: 'leads', id, token }),
    summary: (url, clave, withLeads) => get(url, { accion: 'resumen', clave, conLeads: withLeads ? '1' : '0' }, 40000),
    testLead: (url, p) => post(url, {
      accion: 'lead',
      pagina: { id: p.id, nombre: p.name, empresa: p.client.name, aprendiz: p.owner.name, ficha: p.owner.ficha },
      lead: { id: U.uid('ld_'), at: Date.now(), data: { nombre: 'Prueba de conexión', telefono: '3000000000', correo: 'prueba@senaventas.edu.co', servicio: 'Prueba', mensaje: 'Registro de prueba enviado desde el simulador' }, source: 'prueba de conexión', utm: {}, device: 'Simulador' }
    })
  };

  /* Enlaces públicos */
  SV.links = {
    /* Enlace autónomo: la página completa viaja comprimida dentro del enlace. */
    async direct(p, base) {
      const packed = await U.pack(SV.publicProject(p));
      return (base || SV.publicBase()) + 'ver.html#' + packed;
    },
    /* Enlace corto: la página se lee desde la nube de la coordinación. */
    cloud(p, base, cloudUrl) {
      const cfg = SV.config();
      const n = cloudUrl && cloudUrl !== cfg._fromFile.nubeUrl ? '&n=' + U.b64url(new TextEncoder().encode(cloudUrl)) : '';
      return (base || SV.publicBase()) + 'ver.html?id=' + encodeURIComponent(p.id) + n;
    }
  };
})(window.SV);

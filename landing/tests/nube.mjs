/* Prueba del flujo en la nube: ejecuta el código real de Google Apps Script
   con una Hoja de cálculo simulada y lo conecta a la app en el navegador.
   Uso: npm start (en otra terminal) y luego node tests/nube.mjs [url] */
import { createRequire } from 'node:module';
import vm from 'node:vm';

const load = async () => {
  try { return await import('playwright'); } catch (e) {
    const req = createRequire(import.meta.url);
    const paths = (process.env.NODE_PATH || '').split(':').filter(Boolean);
    return req(req.resolve('playwright', { paths }));
  }
};
const { chromium } = await load();
const BASE = process.argv[2] || 'http://localhost:8090';
const CLOUD = 'https://script.google.com/macros/s/PRUEBA123/exec';
const ok = (cond, msg) => { if (!cond) throw new Error('FALLÓ: ' + msg); console.log('  ✓ ' + msg); };

/* ---------- Google Sheets simulado ---------- */
const sheets = {};
const mkSheet = () => {
  const data = [];
  const rng = (r, c, nr = 1, nc = 1) => ({
    getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => ((data[r - 1 + i] || [])[c - 1 + j] ?? ''))),
    setValues: (v) => { v.forEach((row, i) => row.forEach((x, j) => { data[r - 1 + i] = data[r - 1 + i] || []; data[r - 1 + i][c - 1 + j] = x; })); return rng(r, c, nr, nc); },
    getValue: () => ((data[r - 1] || [])[c - 1] ?? ''),
    setValue: (x) => { data[r - 1] = data[r - 1] || []; data[r - 1][c - 1] = x; },
    setFontWeight() { return this; }, setBackground() { return this; }, setFontColor() { return this; }, setNumberFormat() { return this; }
  });
  return { data, appendRow: (row) => data.push(row.slice()), setFrozenRows() {}, getRange: rng, getLastRow: () => data.length, getLastColumn: () => data.reduce((m, r) => Math.max(m, r.length), 0) };
};
const gas = {
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getName: () => 'Leads Coordinación', getSheetByName: (n) => sheets[n] || null, insertSheet: (n) => (sheets[n] = mkSheet()) }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ s, setMimeType() { return this; } }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, releaseLock() {} }) },
  Utilities: { getUuid: () => 'tok-' + Math.random().toString(16).slice(2) },
  Session: { getEffectiveUser: () => ({ getEmail: () => 'coordinacion@sena.edu.co' }) }, MailApp: { sendEmail() {} },
  JSON, Date, String, Number, Object, Math
};
vm.createContext(gas);
let loaded = false;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const errors = [];
await ctx.route(CLOUD + '**', async (route) => {
  const req = route.request();
  const url = new URL(req.url());
  const out = req.method() === 'POST'
    ? gas.doPost({ postData: { contents: req.postData() } })
    : gas.doGet({ parameter: Object.fromEntries(url.searchParams) });
  await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: out.s });
});
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));

try {
  console.log('1. Instalar la nube con el código real de Apps Script');
  await page.goto(BASE + '/index.html#/nube');
  await page.waitForSelector('.tabs');
  vm.runInContext(await page.evaluate(() => SV.APPS_SCRIPT), gas); loaded = true;
  ok(typeof gas.doGet === 'function' && typeof gas.doPost === 'function', 'script cargado');
  await page.fill('#cloud-url', CLOUD);
  await page.fill('#cloud-key', 'cambia-esta-clave');
  await page.click('[data-a="cloud-save"]');
  await page.waitForSelector('[data-partial="cloudstatus"] .check-item.ok');
  ok((await page.locator('[data-partial="cloudstatus"]').innerText()).includes('Leads Coordinación'), 'conexión verificada con la hoja');
  await page.click('[data-a="cloud-apply"]');

  console.log('2. Publicar con enlace corto');
  await page.evaluate(() => {
    const s = SV.app.s;
    s.owner.name = 'Camilo Pardo'; s.owner.ficha = '3012345'; s.progress.clientEdited = true;
    SV.app.addLead({ data: { nombre: 'Prueba local', telefono: '3001234567' } }, 'vista previa');
    SV.app.commit('Preparación de prueba', { render: true });
  });
  await page.click('#nav a[data-route="publicar"]');
  await page.click('[data-a="publish"]');
  await page.waitForSelector('.modal .link-box');
  const short = await page.locator('.modal .link-box span').innerText();
  ok(/ver\.html\?id=lp_/.test(short), 'enlace corto en la nube: ' + short.slice(0, 70) + '...');
  ok(sheets.Paginas && sheets.Paginas.data.length === 2, 'página registrada en la hoja Paginas');
  await page.click('.modal [data-a="close-overlay"]');

  console.log('3. Visitante abre el enlace corto y deja sus datos');
  const pub = await ctx.newPage();
  pub.on('pageerror', (e) => errors.push('ver.html: ' + e.message));
  await pub.goto(short + '&utm_source=tiktok');
  const lp = pub.frameLocator('#lp');
  const f = lp.locator('form[data-form]').first();
  await f.waitFor();
  await f.locator('[name="nombre"]').fill('Cliente Nube');
  await f.locator('[name="telefono"]').fill('3014567890');
  await f.locator('select[name="servicio"]').selectOption({ index: 1 });
  const consent = f.locator('input[name="_consent"]');
  if (await consent.count()) await consent.check();
  await f.locator('button[type=submit]').click();
  await lp.locator('.lp-ok').first().waitFor({ timeout: 15000 });
  const row = sheets.Leads.data.find((r) => r[7] === 'Cliente Nube');
  ok(!!row && row[15] === 'tiktok', 'lead guardado en Google Sheets con su UTM');
  ok(Number(sheets.Paginas.data[1][9]) >= 1, 'visita contada en la nube');

  console.log('4. Sincronizar y tablero de coordinación');
  gas.doPost({ postData: { contents: JSON.stringify({ accion: 'lead', pagina: { id: await page.evaluate(() => SV.app.s.id) }, lead: { id: 'ld_otro_equipo', at: Date.now(), data: { nombre: 'Desde otro celular', telefono: '3110000000' } } }) } });
  await page.click('#nav a[data-route="leads"]');
  await page.click('.toolbar [data-a="sync-leads"]');
  await page.waitForTimeout(800);
  ok((await page.locator('.tbl tbody').innerText()).includes('Desde otro celular'), 'leads de otros dispositivos sincronizados desde la nube');
  await page.click('#nav a[data-route="nube"]');
  await page.click('[data-a="nube-tab"][data-tab="tablero"]');
  await page.click('[data-a="coord-load"]');
  await page.waitForSelector('.tbl tbody tr');
  ok((await page.locator('.tbl tbody').innerText()).includes('Camilo Pardo'), 'tablero de la coordinación con el aprendiz');
} catch (e) {
  console.error('\n' + e.message);
  await page.screenshot({ path: 'tests/capturas/fallo-nube.png' }).catch(() => {});
  await browser.close();
  process.exit(1);
}
await browser.close();
if (errors.length) { console.log('Errores:\n' + errors.join('\n')); process.exit(1); }
console.log('\nFlujo en la nube correcto');

/* Prueba de extremo a extremo con Playwright.
   Requisitos: Playwright (npm i -D playwright o instalación global) y el servidor: npm start
   Uso: node tests/smoke.mjs [url]  (por defecto http://localhost:8090) */
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';

const load = async () => {
  try { return await import('playwright'); } catch (e) {
    const req = createRequire(import.meta.url);
    const paths = (process.env.NODE_PATH || '').split(':').filter(Boolean);
    return req(req.resolve('playwright', { paths }));
  }
};
const { chromium } = await load();
const BASE = process.argv[2] || 'http://localhost:8090';
const OUT = process.env.SHOTS || 'tests/capturas';
await mkdir(OUT, { recursive: true });

const errors = [];
const ok = (cond, msg) => { if (!cond) throw new Error('FALLÓ: ' + msg); console.log('  ✓ ' + msg); };
const watch = (p) => {
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_|net::|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
};

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const page = await ctx.newPage();
watch(page);
const frameOf = (sel) => page.frameLocator(sel);
const commitWait = () => page.waitForTimeout(350);

try {

console.log('1. Arranque y navegación');
await page.goto(BASE + '/index.html#/inicio');
await page.waitForSelector('.hero-card');
ok(await page.locator('#nav a').count() === 9, 'menú con 9 secciones');
for (const r of ['plantillas', 'editor', 'marca', 'formulario', 'leads', 'vista', 'publicar', 'nube', 'inicio']) {
  await page.click(`#nav a[data-route="${r}"]`);
  await page.waitForTimeout(250);
  ok((await page.locator('#view').innerText()).length > 100, 'vista ' + r + ' renderizada');
}
const [portable] = await Promise.all([page.waitForEvent('download'), page.click('[data-a="portable"]')]);
ok(portable.suggestedFilename() === 'senaventas-landing-portable.html', 'versión portable generada desde la app');

console.log('2. Plantillas');
await page.click('#nav a[data-route="plantillas"]');
ok(await page.locator('.tpl-card').count() === 5, '4 plantillas + desde cero');
await page.screenshot({ path: OUT + '/01-plantillas.png' });
await page.click('[data-a="new-from-tpl"][data-id="salud"]');
await page.waitForSelector('#builder');
ok((await page.locator('#ses-name').innerText()).includes('Vitalis'), 'proyecto nuevo con plantilla de salud');

console.log('3. Editor visual');
const canvas = frameOf('#ed-frame');
await canvas.locator('.blk-hero').waitFor();
await canvas.locator('.blk-hero h1').click();
await page.waitForSelector('.insp [data-bp="props.title"]');
ok(true, 'clic en el lienzo selecciona el bloque y abre el inspector');
await page.fill('.insp [data-bp="props.title"]', 'Sonrisas sanas para toda la familia en');
await page.waitForTimeout(600);
ok((await canvas.locator('.blk-hero h1').innerText()).includes('Sonrisas sanas'), 'edición de texto en vivo sobre el lienzo');
await page.selectOption('.insp [data-bp="props.layout"]', 'form');
await page.waitForTimeout(600);
ok(await canvas.locator('.blk-hero form[data-form]').count() === 1, 'cambio de distribución: portada con formulario');
await page.click('.insp [data-a="insp-tab"][data-tab="estilo"]');
await page.selectOption('.insp [data-bp="style.variant"]', 'dark');
await page.waitForTimeout(500);
ok(await canvas.locator('.blk-hero.v-dark').count() === 1, 'estilo de sección aplicado');
const before = await page.locator('.blk-row').count();
/* Arrastre con el mouse, como lo hace una persona */
const dnd = async (src, dst, pos) => {
  await page.locator(src).first().scrollIntoViewIfNeeded();
  const a = await page.locator(src).first().boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 12, a.y + a.height / 2 + 12, { steps: 4 });
  await page.waitForTimeout(200);
  const b = await page.locator(dst).first().boundingBox();
  await page.mouse.move(b.x + (pos ? pos.x : b.width / 2), b.y + (pos ? pos.y : b.height / 2), { steps: 12 });
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.waitForTimeout(400);
};
await page.click('.b-head [data-a="lib-tab"][data-tab="agregar"]');
await dnd('.lib-item[data-type="video"]', '.blk-list', { x: 60, y: 8 });
ok(await page.locator('.blk-row').nth(0).innerText().then((t) => t.includes('Video')), 'bloque arrastrado desde la biblioteca a la primera posición');
await page.click('.b-head [data-a="lib-tab"][data-tab="agregar"]');
await dnd('.lib-item[data-type="countdown"]', '.blk-list');
await page.click('.b-head [data-a="lib-tab"][data-tab="agregar"]');
await page.click('.lib-item[data-type="social"]');
await page.waitForTimeout(400);
const after = await page.locator('.blk-row').count();
ok(after === before + 3, 'bloques agregados desde la biblioteca (' + before + ' → ' + after + ')');
const firstBefore = await page.locator('.blk-row').nth(0).getAttribute('data-id');
await page.locator('.blk-row').nth(0).scrollIntoViewIfNeeded();
await dnd('.blk-row >> nth=2', '.blk-row >> nth=0', { x: 30, y: 4 });
await page.waitForTimeout(400);
ok(await page.locator('.blk-row').nth(0).getAttribute('data-id') !== firstBefore, 'reordenar bloques con arrastrar y soltar');
await page.click('[data-a="undo"]');
await page.waitForTimeout(300);
ok(await page.locator('.blk-row').nth(0).getAttribute('data-id') === firstBefore, 'deshacer restaura el orden');
await page.locator('.blk-row').filter({ hasText: 'Testimonios' }).click();
await page.click('.insp [data-a="insp-tab"][data-tab="contenido"]');
await page.click('.insp [data-a="li-add"][data-path="props.items"]');
await page.fill('.insp .li-item.open [data-bp$=".name"]', 'Paciente de prueba');
await page.waitForTimeout(500);
ok((await canvas.locator('.blk-testimonials').innerText()).includes('Paciente de prueba'), 'lista editable: testimonio agregado');
await page.click('.b-head [data-a="lib-tab"][data-tab="agregar"]');
await page.click('.lib-item[data-type="embed"]');
await page.fill('.insp [data-bp="props.code"]', '<p id="mi-widget">Widget incrustado</p>');
await page.waitForTimeout(500);
ok(await canvas.locator('#mi-widget').count() === 1, 'incrustación libre de HTML');
await page.screenshot({ path: OUT + '/02-editor.png' });

console.log('4. Diseño & Marca');
await page.click('#nav a[data-route="marca"]');
await page.fill('[data-bind="owner.name"]', 'Laura Gómez');
await page.fill('[data-bind="owner.ficha"]', '2879456');
await page.fill('[data-bind="client.name"]', 'Clínica Dental Sonríe');
await commitWait();
ok((await page.locator('[data-partial="brandprev"]').innerText()).includes('Clínica Dental Sonríe'), 'vista previa de marca en tiempo real');
await page.click('[data-a="marca-tab"][data-tab="estilo"]');
await page.click('[data-a="apply-palette"][data-i="1"]');
await page.click('[data-a="apply-fonts"][data-id="elegante"]');
ok(await page.locator('.font-pair.on').count() === 1, 'pareja tipográfica aplicada');
await page.click('[data-a="marca-tab"][data-tab="whatsapp"]');
await page.click('[data-a="set-wa-mode"][data-v="link"]');
await page.fill('[data-bind="wa.link"]', 'https://wa.me/message/ABCDEF123456');
await page.fill('[data-bind="social.instagram"]', 'https://instagram.com/sonrie');
await commitWait();
ok((await page.locator('[data-partial="walink"]').innerText()).includes('wa.me/message/ABCDEF123456'), 'enlace de WhatsApp Business registrado');
await page.click('[data-a="set-wa-mode"][data-v="number"]');
await page.fill('[data-bind="wa.number"]', '573001234567');
await commitWait();

console.log('5. Formulario & Captación');
await page.click('#nav a[data-route="formulario"]');
await page.click('[data-a="add-field"]');
await page.click('[data-a="add-field-preset"][data-l="Ciudad"]');
await commitWait();
ok((await page.locator('.fld-row').count()) >= 9, 'campo personalizado agregado');
await page.fill('.fld-row.open [data-fld$=".label"]', 'Ciudad de residencia');
await commitWait();
await page.waitForTimeout(500);
ok((await frameOf('#form-prev').locator('form').innerText()).includes('Ciudad de residencia'), 'vista previa del formulario actualizada');
await page.screenshot({ path: OUT + '/03-formulario.png' });

console.log('6. Vista en vivo: captación de leads');
await page.click('#nav a[data-route="vista"]');
const lp = frameOf('#lp-preview');
const form = lp.locator('form[data-form]').first();
await form.waitFor();
await form.locator('button[type=submit]').click();
ok((await form.locator('.ff-msg').innerText()).includes('Revisa'), 'validación de campos obligatorios');
const fill = async (nombre, tel, servicio) => {
  const f = lp.locator('form[data-form]').first();
  await f.locator('[name="nombre"]').fill(nombre);
  await f.locator('[name="telefono"]').fill(tel);
  await f.locator('[name="correo"]').fill(nombre.split(' ')[0].toLowerCase() + '@gmail.com');
  await f.locator('select[name="servicio"]').selectOption({ label: servicio });
  await f.locator('input[name="tipo_paciente"]').first().check();
  await f.locator('[name="ciudad"]').fill('Medellín');
  await f.locator('input[name="_consent"]').check();
  await f.locator('button[type=submit]').click();
  await lp.locator('.lp-ok').first().waitFor();
};
await fill('Andrés Pérez', '3001112233', 'Ortodoncia');
await page.click('[data-a="reload-preview"]');
await page.waitForTimeout(600);
await fill('María López', '3104445566', 'Implantes dentales');
await page.click('[data-a="reload-preview"]');
await page.waitForTimeout(600);
await fill('Julián Ríos', '3207778899', 'Medicina general');
await page.waitForTimeout(500);
ok((await page.locator('[data-partial="lastleads"]').innerText()).includes('Julián Ríos'), '3 leads capturados desde la landing');
await page.screenshot({ path: OUT + '/04-vista.png' });

console.log('7. Base de datos y Excel');
await page.click('#nav a[data-route="leads"]');
ok(await page.locator('.tbl tbody tr').count() === 3, 'tabla con 3 leads');
await page.selectOption('[data-lead-st]:first-of-type >> nth=0', 'contactado');
await page.click('[data-a="lead-fake"]');
await page.click('[data-a="lead-fake-go"][data-n="15"]');
ok((await page.locator('.kpi').first().innerText()).includes('18'), 'datos de prueba generados (18 leads)');
await page.click('[data-a="lead-view"][data-v="embudo"]');
ok(await page.locator('.kcol').count() === 5, 'embudo de ventas por estado');
await page.dragAndDrop('.kcol[data-status="nuevo"] .kcard >> nth=0', '.kcol[data-status="cliente"]');
await page.waitForTimeout(300);
await page.screenshot({ path: OUT + '/05-leads.png' });
const [xlsx] = await Promise.all([page.waitForEvent('download'), page.click('.page-head [data-a="export-xlsx"]')]);
const xpath = OUT + '/leads.xlsx';
await xlsx.saveAs(xpath);
const buf = await readFile(xpath);
ok(buf[0] === 0x50 && buf[1] === 0x4b && buf.includes(Buffer.from('xl/worksheets/sheet1.xml')), 'archivo Excel .xlsx válido descargado');
ok(buf.includes(Buffer.from('Ciudad de residencia')) && buf.includes(Buffer.from('Andr')), 'Excel con columnas del formulario y datos');

console.log('8. Publicación y enlace funcional');
await page.click('#nav a[data-route="publicar"]');
const pubBtn = page.locator('[data-a="publish"]');
ok(!(await pubBtn.isDisabled()), 'checklist obligatorio cumplido');
await pubBtn.click();
await page.waitForSelector('.modal .link-box');
await page.click('.modal [data-a="close-overlay"]');
await page.waitForSelector('[data-partial="directlink"] .link-box');
const link = await page.locator('[data-partial="directlink"] .link-box > span:first-child').innerText();
ok(/ver\.html#z/.test(link), 'enlace directo comprimido generado (' + (link.length / 1024).toFixed(1) + ' KB)');
await page.screenshot({ path: OUT + '/06-publicar.png' });

const pub = await ctx.newPage();
watch(pub);
await pub.goto(link.replace('ver.html#', 'ver.html?utm_source=instagram&utm_campaign=prueba#'));
const view = pub.frameLocator('#lp');
await view.locator('.blk-hero h1').waitFor();
ok((await view.locator('.blk-hero h1').innerText()).includes('Sonrisas sanas'), 'el enlace público abre la landing publicada');
ok((await pub.title()).length > 5, 'título SEO aplicado al enlace público');
const pf = view.locator('form[data-form]').first();
await pf.locator('[name="nombre"]').fill('Visitante Público');
await pf.locator('[name="telefono"]').fill('3159990000');
await pf.locator('select[name="servicio"]').selectOption({ index: 1 });
await pf.locator('input[name="tipo_paciente"]').first().check();
await pf.locator('[name="ciudad"]').fill('Envigado');
await pf.locator('input[name="_consent"]').check();
await pf.locator('button[type=submit]').click();
await view.locator('.lp-ok').first().waitFor({ timeout: 15000 });
ok(true, 'formulario enviado desde el enlace público');
await pub.screenshot({ path: OUT + '/07-enlace-publico.png' });
await page.bringToFront();
await page.evaluate(() => window.dispatchEvent(new Event('focus')));
await page.click('#nav a[data-route="leads"]');
await page.click('[data-a="lead-view"][data-v="tabla"]');
await page.fill('#lead-q', 'Visitante');
await page.waitForTimeout(300);
ok((await page.locator('.tbl tbody').innerText()).includes('Visitante Público'), 'lead del enlace público llegó a la base de datos');
ok((await page.locator('.tbl tbody').innerText()).includes('instagram'), 'UTM de la campaña registrado en el lead');

console.log('9. Descargas y respaldo');
await page.click('#nav a[data-route="publicar"]');
const [zip] = await Promise.all([page.waitForEvent('download'), page.click('[data-a="download-zip"]')]);
ok(/\.zip$/.test(zip.suggestedFilename()), 'paquete del sitio .zip');
const [json] = await Promise.all([page.waitForEvent('download'), page.click('.card [data-a="export-session"]')]);
ok(/\.landing\.json$/.test(json.suggestedFilename()), 'respaldo del proyecto .landing.json');
await page.click('#nav a[data-route="nube"]');
await page.click('[data-a="nube-tab"][data-tab="instalar"]');
ok((await page.locator('pre.code').innerText()).includes('function doPost'), 'código de Google Apps Script disponible');

console.log('10. Versión móvil');
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const m = await mob.newPage();
watch(m);
await m.goto(BASE + '/index.html#/editor');
await m.waitForSelector('.bpane-tabs');
ok(await m.locator('.bnav a').count() === 4, 'navegación inferior móvil');
await m.screenshot({ path: OUT + '/08-movil-editor.png' });
await m.goto(link);
await m.frameLocator('#lp').locator('.blk-hero').waitFor();
await m.screenshot({ path: OUT + '/09-movil-landing.png' });
ok(true, 'landing pública en celular');

} catch (e) {
  await page.screenshot({ path: OUT + '/fallo.png' }).catch(() => {});
  console.error('\n' + e.message + (errors.length ? '\n' + errors.join('\n') : ''));
  await browser.close();
  process.exit(1);
}
await browser.close();
if (errors.length) { console.log('\nErrores de consola:\n' + errors.join('\n')); process.exit(1); }
console.log('\nTodo correcto. Capturas en ' + OUT);

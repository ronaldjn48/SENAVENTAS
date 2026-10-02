/* Prueba de humo de extremo a extremo con Playwright.
   Requisitos: npm i -D playwright (o Playwright global) y el servidor: npm start
   Uso: node tests/smoke.mjs [url]  (por defecto http://localhost:8080) */
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';

const load = async () => {
  try { return await import('playwright'); } catch (e) {
    const req = createRequire(import.meta.url);
    const paths = (process.env.NODE_PATH || '').split(':').filter(Boolean);
    return req(req.resolve('playwright', { paths }));
  }
};
const { chromium } = await load();
const BASE = process.argv[2] || 'http://localhost:8080';
const OUT = process.env.SHOTS || 'tests/capturas';
await mkdir(OUT, { recursive: true });

const errors = [];
const ok = (cond, msg) => { if (!cond) throw new Error('FALLÓ: ' + msg); console.log('  ✓ ' + msg); };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/ERR_|net::|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });

console.log('1. Arranque y navegación');
await page.goto(BASE + '/index.html#/inicio');
await page.waitForSelector('#login');
ok(await page.locator('#view .hero-card').count() === 0 && !(await page.locator('#nav a').count()), 'sin usuario solo se ve la pantalla de acceso');
await page.screenshot({ path: OUT + '/00-login.png' });
await page.fill('#lg-user', 'laura.gomez');
await page.fill('#lg-pass', '1234');
await page.click('#login-form button[type=submit]');
await page.waitForSelector('.hero-card');
ok(await page.evaluate(() => SV.app.s.products.length === 0 && SV.app.s.orders.length === 0), 'usuario nuevo empieza con una tienda en blanco (0 productos)');
ok(await page.locator('.ses-card').count() === 1, 'una sola sesión inicial');
ok(await page.locator('#nav a').count() === 7, 'menú con 7 secciones');
await page.screenshot({ path: OUT + '/01-inicio.png', fullPage: true });
const [portable] = await Promise.all([page.waitForEvent('download'), page.click('[data-a="portable"]')]);
ok(portable.suggestedFilename() === 'senaventas-portable.html', 'versión portable generada desde la app');
for (const r of ['configuracion', 'productos', 'pedidos', 'tienda', 'api', 'publicar']) {
  await page.click(`#nav a[data-route="${r}"]`);
  await page.waitForTimeout(250);
  ok(await page.locator('#view').innerText().then((t) => t.length > 100), 'vista ' + r + ' renderizada');
}

console.log('2. Identidad y temas');
await page.click('#nav a[data-route="configuracion"]');
await page.click('[data-a="cfg-tab"][data-tab="identidad"]');
await page.fill('[data-bind="owner.name"]', 'Laura Gómez');
await page.fill('[data-bind="store.name"]', 'Café de Prueba SENA');
await page.waitForTimeout(300);
ok((await page.locator('[data-partial="brandcard"]').innerText()).includes('Café de Prueba SENA'), 'previsualización de marca en tiempo real');
await page.click('[data-a="cfg-tab"][data-tab="temas"]');
await page.screenshot({ path: OUT + '/02-temas.png', fullPage: true });
await page.click('[data-a="personalize"]');
await page.click('[data-a="cfg-tab"][data-tab="plugins"]');
await page.click('[data-a="toggle-plugin"][data-id="seo"]');
ok(await page.locator('[data-a="toggle-plugin"][data-id="seo"].on').count() === 1, 'plugin SEO activado');

await page.click('[data-a="cfg-tab"][data-tab="temas"]');
await page.click('[data-a="activate-theme"][data-id="boutique"]');
await page.click('[data-role="full"]');
await page.waitForTimeout(300);
ok(await page.evaluate(() => SV.app.s.products.length > 3), 'se pueden cargar ejemplos del tema cuando se quiere');

console.log('3. Productos');
await page.click('#nav a[data-route="productos"]');
await page.click('.page-head [data-a="new-product"]');
await page.fill('[data-draft="name"]', 'Panela Orgánica 1kg');
await page.fill('[data-draft="sku"]', 'ALM-060');
await page.fill('[data-draft="price"]', '9500');
await page.fill('[data-draft="cost"]', '5200');
await page.fill('[data-draft="stock"]', '40');
await page.fill('[data-draft="description"]', 'Panela pulverizada de caña orgánica de Santander, ideal para bebidas.');
await page.fill('[data-draft="image"]', 'https://example.invalid/panela.jpg');
await page.dispatchEvent('[data-draft="image"]', 'change');
ok((await page.locator('[data-partial="margin"]').innerText()).includes('45.3%'), 'margen calculado en vivo (45.3%)');
await page.screenshot({ path: OUT + '/03-producto.png' });
await page.click('[data-a="save-product"]');
await page.waitForTimeout(300);
ok((await page.locator('[data-partial="prodtable"]').innerText()).includes('Panela Orgánica 1kg'), 'producto creado y listado');
await page.fill('#prod-q', 'panela');
await page.waitForTimeout(200);
ok(await page.locator('[data-partial="prodtable"] tbody tr').count() === 1, 'búsqueda filtra la tabla');
await page.fill('#prod-q', '');
await page.screenshot({ path: OUT + '/04-productos.png', fullPage: true });

console.log('4. Compra simulada en la tienda (iframe)');
await page.click('#nav a[data-route="tienda"]');
const frame = page.frameLocator('#store-frame');
await frame.locator('.card [data-add]').first().waitFor();
await page.screenshot({ path: OUT + '/05-tienda.png', fullPage: true });
await frame.locator('.card [data-add]').first().click();
await frame.locator('#drawer.on').waitFor();
await frame.locator('[data-act="checkout"]').click();
await frame.locator('#f-ship [name=name]').fill('Cliente Demo');
await frame.locator('#f-ship [name=email]').fill('demo@correo.co');
await frame.locator('#f-ship [name=phone]').fill('3001234567');
await frame.locator('#f-ship [name=city]').fill('Medellín');
await frame.locator('#f-ship [name=address]').fill('Calle 10 # 20-30');
await frame.locator('#f-ship [name=dep]').selectOption('Antioquia');
await frame.locator('#f-ship button[type=submit]').click();
await frame.locator('[data-method="card"]').click();
await frame.locator('#card').fill('4000 0000 0000 0002');
await frame.locator('#exp').fill('12/30');
await frame.locator('#cvv').fill('123');
await frame.locator('[data-act="pay"]').click();
await frame.locator('.result.bad').waitFor({ timeout: 8000 });
ok(true, 'tarjeta de rechazo muestra pago rechazado');
await frame.locator('[data-act="retry-pay"]').click();
await frame.locator('[data-method="card"]').click();
await frame.locator('#card').fill('4242 4242 4242 4242');
await frame.locator('#exp').fill('12/30');
await frame.locator('#cvv').fill('123');
await frame.locator('[data-act="pay"]').click();
await frame.locator('.result .receipt').waitFor({ timeout: 8000 });
ok((await frame.locator('.result').innerText()).includes('SV-'), 'pedido confirmado con número');
await page.screenshot({ path: OUT + '/06-checkout.png' });
await page.waitForTimeout(400);
ok((await page.locator('[data-partial="lastorders"]').innerText()).includes('SV-'), 'el pedido llega al panel del creador');

console.log('5. API REST y webhooks');
await page.click('#nav a[data-route="api"]');
await page.click('[data-a="api-tab"][data-tab="keys"]');
await page.click('.card-h [data-a="new-key"]');
await page.click('#key-form ~ * [type=submit], .modal-f [type=submit]');
await page.click('[data-a="api-tab"][data-tab="webhooks"]');
await page.selectOption('form[data-form="add-webhook"] [name=event]', '*');
await page.click('form[data-form="add-webhook"] button[type=submit]');
await page.click('[data-a="api-tab"][data-tab="console"]');
await page.click('[data-a="con-pick"][data-m="PATCH"]');
await page.click('[data-a="con-send"]');
await page.waitForSelector('[data-partial="conresp"] .status-pill', { timeout: 5000 });
ok((await page.locator('[data-partial="conresp"] .status-pill').innerText()) === '200', 'PATCH stock responde 200');
await page.selectOption('[data-a-change="con-token"]', '');
await page.click('[data-a="con-send"]');
await page.waitForTimeout(900);
ok((await page.locator('[data-partial="conresp"] .status-pill').innerText()) === '401', 'sin llave responde 401');
await page.screenshot({ path: OUT + '/07-consola-api.png', fullPage: true });
await page.click('[data-a="api-tab"][data-tab="webhooks"]');
await page.waitForTimeout(900);
ok(await page.locator('.status-pill').count() >= 1, 'webhook entregado y registrado');
await page.click('[data-a="api-tab"][data-tab="apps"]');
await page.click('[data-a="connect-integ"][data-id="meta"]');
await page.click('[data-role="fill"]');
await page.click('.modal-f [type=submit]');
await page.waitForSelector('[data-a="run-integ"][data-id="meta"]', { timeout: 5000 });
await page.click('[data-a="run-integ"][data-id="meta"][data-act="sync_catalog"]');
await page.waitForSelector('.modal .log', { timeout: 5000 });
ok((await page.locator('.modal .log').innerText()).includes('productos aprobados'), 'integración Meta sincroniza catálogo');
await page.screenshot({ path: OUT + '/08-integraciones.png' });
await page.click('.modal [data-a="close-overlay"]');

console.log('6. Publicación');
await page.click('#nav a[data-route="publicar"]');
await page.screenshot({ path: OUT + '/09-publicar.png', fullPage: true });
ok(!(await page.locator('[data-a="publish"]').isDisabled()), 'checklist obligatorio completo');
await page.click('[data-a="publish"]');
await page.waitForSelector('.modal-f [data-a="download-zip"]');
const [zip] = await Promise.all([page.waitForEvent('download'), page.click('.modal-f [data-a="download-zip"]')]);
ok(/\.zip$/.test(zip.suggestedFilename()), 'paquete ZIP del sitio descargado: ' + zip.suggestedFilename());
await page.click('.modal [data-a="close-overlay"]');

console.log('7. Persistencia de la sesión');
await page.reload();
await page.waitForSelector('#nav a');
await page.click('#nav a[data-route="productos"]');
ok((await page.locator('[data-partial="prodtable"]').innerText()).includes('Panela'), 'la sesión se conserva al recargar');

console.log('7b. Acceso y aislamiento entre estudiantes');
const lauraSession = await page.evaluate(() => SV.app.s.id);
await page.click('#user-card [data-a="logout"]');
await page.click('[data-role="out"]');
await page.waitForSelector('#login');
ok(await page.locator('#view').innerText() === '', 'al salir se limpia la pantalla');
await page.click('.login-tabs [data-mode="login"]');
await page.fill('#lg-user', 'laura.gomez');
await page.fill('#lg-pass', 'mala');
await page.click('#login-form button[type=submit]');
ok((await page.locator('#lg-msg').innerText()).includes('Contraseña incorrecta'), 'contraseña incorrecta se rechaza');
await page.click('.login-tabs [data-mode="register"]');
await page.fill('#lg-user', 'pedro.ruiz');
await page.fill('#lg-pass', 'abcd');
await page.click('#login-form button[type=submit]');
await page.waitForSelector('.hero-card');
ok(await page.evaluate(() => SV.app.s.products.length === 0 && SV.app.sessions.length === 1), 'el siguiente estudiante recibe una versión limpia');
ok(!(await page.locator('body').innerText()).toLowerCase().includes('laura'), 'no aparece nada del estudiante anterior');
ok(await page.evaluate(async (id) => (await SV.storage.get(id, SV.app.user.id)) === null, lauraSession), 'las sesiones de otro usuario no se pueden abrir');
await page.click('#user-card [data-a="logout"]');
await page.click('[data-role="out"]');
await page.waitForSelector('#login');
await page.fill('#lg-user', 'Laura.Gomez');
await page.fill('#lg-pass', '1234');
await page.click('#login-form button[type=submit]');
await page.waitForSelector('.hero-card');
await page.click('#nav a[data-route="productos"]');
ok((await page.locator('[data-partial="prodtable"]').innerText()).includes('Panela'), 'cada estudiante recupera su propio trabajo');

console.log('8. Vista móvil');
await page.setViewportSize({ width: 390, height: 844 });
await page.click('[data-a="open-side"]');
await page.click('#nav a[data-route="tienda"]');
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + '/10-movil.png' });

await browser.close();
if (errors.length) { console.error('Errores en consola:\n' + errors.join('\n')); process.exit(1); }
console.log('\nTodas las pruebas pasaron.');

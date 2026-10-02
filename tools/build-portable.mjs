/* Genera dist/senaventas-portable.html: toda la aplicación en un solo archivo
   que se abre con doble clic (sin servidor). Uso: node tools/build-portable.mjs */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (p) => readFile(join(root, p), 'utf8');

let html = await read('index.html');
const css = await read('assets/css/app.css');
html = html.replace('<link rel="stylesheet" href="assets/css/app.css">', () => `<style>\n${css}\n</style>`);

const scripts = [...html.matchAll(/<script src="(assets\/js\/[^"]+)"><\/script>/g)].map((m) => m[1]);
for (const src of scripts) {
  const js = (await read(src)).replace(/<\/script/gi, '<\\/script');
  html = html.replace(`<script src="${src}"></script>`, () => `<script>\n${js}\n</script>`);
}

const svg = await read('assets/icons/icon.svg');
html = html
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
  .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`);

await mkdir(join(root, 'dist'), { recursive: true });
const out = join(root, 'dist', 'senaventas-portable.html');
await writeFile(out, html);
console.log(`Listo: ${out} (${Math.round(html.length / 1024)} KB, ${scripts.length} scripts incrustados)`);

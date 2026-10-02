// Genera el HTML portable (un solo archivo, sin dependencias externas).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const d = dirname(fileURLToPath(import.meta.url));
const rd = p => readFileSync(join(d, p), 'utf8');
let css = rd('src/styles.css');
for (const w of [400, 600, 700, 800]) css = css.replace(`__FONT${w}__`, () => readFileSync(join(d, `assets/pjs${w}.woff2`)).toString('base64'));
const js = readdirSync(join(d, 'src')).filter(f => /^\d\d[a-z]?-.*\.js$/.test(f)).sort().map(f => rd('src/' + f)).join('\n');
if (js.includes('</script')) throw new Error('El JS contiene </script');
const logo = rd('assets/logo-mercadosena-ads.svg').trim();
const html = rd('src/index.template.html').replace('__CSS__', () => css).replace('__LOGO__', () => logo).replace('__JS__', () => js);
writeFileSync(join(d, 'mercadosena-ads.html'), html);
console.log('OK mercadosena-ads.html', (html.length / 1024).toFixed(0) + ' KB');

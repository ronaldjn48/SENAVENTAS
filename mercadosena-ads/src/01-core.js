/* ============ Utilidades ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const dot = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const money = n => (n < 0 ? '-$ ' : '$ ') + dot(Math.abs(n));
const moneyC = n => { const a = Math.abs(n); const s = n < 0 ? '-' : ''; return a >= 1e6 ? s + '$ ' + (a / 1e6).toFixed(2).replace('.', ',') + 'M' : money(n); };
const pct = (n, d = 1) => (isFinite(n) ? n.toFixed(d).replace('.', ',') + '%' : '—');
const int = n => dot(n);
const compact = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1).replace('.', ',') + 'K' : dot(n);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const sum = (a, f) => a.reduce((s, x) => s + (f ? f(x) : x), 0);

const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  plusc: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkc: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  down: '<polyline points="6 9 12 15 18 9"/>', right: '<polyline points="9 18 15 12 9 6"/>', left: '<polyline points="15 18 9 12 15 6"/>',
  arr: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  arl: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  up: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  dn: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  pkg: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  tup: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  tdn: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
  edit: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>', pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8.01" y2="11"/><line x1="12" y1="11" x2="12.01" y2="11"/><line x1="16" y1="11" x2="16.01" y2="11"/><line x1="8" y1="15" x2="8.01" y2="15"/><line x1="12" y1="15" x2="12.01" y2="15"/><line x1="16" y1="15" x2="16.01" y2="15"/><line x1="8" y1="19" x2="12" y2="19"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  click: '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>',
  print: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  bulb: '<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  store: '<path d="M3 9l1-5h16l1 5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ============ Catálogos del mercado simulado ============ */
const CATS = {
  alimentos: { name: 'Alimentos y bebidas', emoji: '☕', ref: 38000, cpc: 140, demand: 900, tags: ['alimentos', 'gourmet', 'saludable', 'cocina'] },
  hogar: { name: 'Hogar y jardín', emoji: '🏡', ref: 120000, cpc: 220, demand: 700, tags: ['hogar', 'jardín', 'decoración'] },
  moda: { name: 'Moda y accesorios', emoji: '👜', ref: 85000, cpc: 180, demand: 1200, tags: ['moda', 'accesorios', 'tendencias'] },
  tecnologia: { name: 'Tecnología', emoji: '🎧', ref: 350000, cpc: 380, demand: 1500, tags: ['tecnología', 'electrónica', 'gamer'] },
  belleza: { name: 'Belleza y cuidado personal', emoji: '🧴', ref: 60000, cpc: 200, demand: 1000, tags: ['belleza', 'cuidado personal', 'salud'] },
  herramientas: { name: 'Herramientas y agro', emoji: '🛠️', ref: 246000, cpc: 260, demand: 500, tags: ['herramientas', 'agro', 'construcción'] },
  deportes: { name: 'Deportes y fitness', emoji: '🚴', ref: 110000, cpc: 210, demand: 800, tags: ['deportes', 'fitness', 'aire libre'] },
  artesanias: { name: 'Artesanías y regalos', emoji: '🎁', ref: 55000, cpc: 130, demand: 450, tags: ['artesanías', 'regalos', 'cultura'] }
};
const INTERESTS = ['alimentos', 'gourmet', 'saludable', 'cocina', 'hogar', 'jardín', 'decoración', 'moda', 'accesorios', 'tendencias', 'tecnología', 'electrónica', 'gamer', 'belleza', 'cuidado personal', 'salud', 'herramientas', 'agro', 'construcción', 'deportes', 'fitness', 'aire libre', 'artesanías', 'regalos', 'cultura', 'emprendimiento', 'familia', 'mascotas', 'viajes'];
const CITIES = [['Bogotá', .30], ['Medellín', .14], ['Cali', .11], ['Barranquilla', .08], ['Cartagena', .04], ['Bucaramanga', .04], ['Cúcuta', .03], ['Pereira', .03], ['Santa Marta', .03], ['Manizales', .02]];
const AGES = [[18, 24, .20], [25, 34, .30], [35, 44, .22], [45, 54, .15], [55, 65, .13]];
const BUYERS = {
  nuevo: { name: 'Persona nueva en la plataforma', d: 'Aún no ha comprado en MercadoSENA.', share: .35, cvr: .8, ctr: 1.0 },
  plataforma: { name: 'Comprador antiguo de la plataforma', d: 'Ya compró en otros vendedores del marketplace.', share: .45, cvr: 1.1, ctr: 1.05 },
  tienda: { name: 'Comprador antiguo de tu tienda', d: 'Ya te compró antes. Es la audiencia de recompra.', share: .08, cvr: 1.9, ctr: 1.3 },
  membresia: { name: 'Miembro con membresía SENA Plus', d: 'Compra con frecuencia y envíos gratis.', share: .12, cvr: 1.5, ctr: 1.15 }
};
const INCOMES = { bajo: ['Ingreso bajo', .40], medio: ['Ingreso medio', .45], alto: ['Ingreso alto', .15] };
const DEVICES = { movil: ['Celular', .62], escritorio: ['Computador', .23], app: ['App MercadoSENA', .15] };
const MATCH = {
  amplia: { n: 'Amplia', d: 'Llega a variantes y términos relacionados. Más alcance, menos precisión.', reach: 1, ctr: .8, cvr: .8 },
  frase: { n: 'Frase', d: 'Búsquedas que incluyen tu frase en orden.', reach: .6, ctr: 1, cvr: 1 },
  exacta: { n: 'Exacta', d: 'Solo la búsqueda idéntica. Menos alcance, más precisión.', reach: .3, ctr: 1.3, cvr: 1.25 }
};
const OBJECTIVES = { ventas: 'Aumentar ventas', visibilidad: 'Ganar visibilidad', lanzamiento: 'Lanzar un producto nuevo' };
const AUDIENCE_BASE = 480000; // personas activas por día en el marketplace simulado
const LEARN_DAYS = 3;

/* ============ Estado ============ */
const KEY = 'mercadosena-ads-v1';
const blankAudience = () => ({ geo: { scope: 'nacional', cities: [] }, demo: { ageMin: 18, ageMax: 65, genders: ['mujer', 'hombre'], incomes: [] }, behavior: { buyers: [], interests: [], devices: [] }, touched: false });
const blank = () => ({ v: 1, seller: { name: 'Mi tienda SENA', city: 'Barranquilla' }, products: [], campaigns: [], sim: { day: 0, organic: [] }, reports: [], acos: { answers: {}, camp: {}, best: '', why: '', checked: false }, draft: null, dismissed: {} });
let S = blank();
let saveFail = false;
function load() {
  try { const r = localStorage.getItem(KEY); if (r) { const o = JSON.parse(r); if (o && o.v === 1) S = Object.assign(blank(), o); } } catch (e) { }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); saveFail = false; }
  catch (e) { if (!saveFail) toast('Almacenamiento del navegador lleno. Exporta tu proyecto en Datos.', 'warn'); saveFail = true; }
}

/* ============ Calidad de la publicación ============ */
function productQuality(p) {
  const cat = CATS[p.cat] || CATS.alimentos;
  const t = (p.title || '').trim(), d = (p.desc || '').trim();
  const imgs = p.images || [];
  const checks = [];
  const add = (label, pts, got, tip) => checks.push({ label, pts, got, tip });
  add('Título de 30 a 70 caracteres', 20, t.length >= 30 && t.length <= 70 ? 20 : t.length >= 15 && t.length <= 90 ? 10 : 0, 'Incluye producto, marca y característica clave.');
  const bad = /[!¡$%*]{1,}|oferta|gratis|barato|envío gratis|MEJOR/i.test(t) || (t.length > 8 && t === t.toUpperCase());
  add('Título sin símbolos ni mayúsculas sostenidas', 10, t && !bad ? 10 : 0, 'Evita "oferta", signos de admiración y todo en mayúsculas.');
  add('Descripción de 150 caracteres o más', 20, d.length >= 150 ? 20 : d.length >= 60 ? 10 : 0, 'Describe materiales, medidas, usos y garantía.');
  const ratio = p.price / cat.ref;
  add('Precio competitivo frente al mercado', 15, p.price > 0 && ratio >= .6 && ratio <= 1.3 ? 15 : p.price > 0 && ratio <= 1.8 ? 5 : 0, `Referencia de ${cat.name}: ${money(cat.ref)}.`);
  add('Al menos 3 imágenes', 15, imgs.length >= 3 ? 15 : imgs.length >= 1 ? 5 : 0, 'Muestra frente, detalle y uso.');
  add('Todas las imágenes cumplen resolución (500 px o más)', 10, imgs.length && imgs.every(i => i.ok) ? 10 : 0, 'Mínimo 500 x 500 px, JPG, PNG o WebP.');
  add('Foto principal con fondo claro', 10, imgs[0] && imgs[0].bg ? 10 : 0, 'La primera imagen debe tener fondo blanco o muy claro.');
  const score = sum(checks, c => c.got);
  return { score, checks };
}
const qualityFactor = p => 0.45 + productQuality(p).score / 100;
const ticketFactor = p => clamp(Math.pow(60000 / Math.max(p.price, 1000), .35), .45, 1.4); // los artículos caros convierten menos
const priceFactor = p => { const r = p.price / (CATS[p.cat] || CATS.alimentos).ref; return r <= .8 ? 1.15 : r <= 1.1 ? 1 : r <= 1.4 ? .8 : .55; };
const margin = p => p.price > 0 ? (p.price - (p.cost || 0)) / p.price * 100 : 0;
const prodById = id => S.products.find(p => p.id === id);
const campById = id => S.campaigns.find(c => c.id === id);
function findAd(adId) { for (const c of S.campaigns) { const a = c.ads.find(x => x.id === adId); if (a) return { camp: c, ad: a }; } return null; }
const groupOf = (c, ad) => c.groups.find(g => g.id === ad.groupId);

/* ============ Audiencia ============ */
function audienceStats(a, p) {
  const cat = CATS[p.cat] || CATS.alimentos;
  let geo = 1; if (a.geo.scope === 'ciudades') geo = clamp(sum(CITIES.filter(c => a.geo.cities.includes(c[0])), c => c[1]) / .82, 0, 1) || .02;
  let age = 0; AGES.forEach(([lo, hi, w]) => { const ov = Math.max(0, Math.min(hi, a.demo.ageMax) - Math.max(lo, a.demo.ageMin) + 1); age += w * ov / (hi - lo + 1); }); age = clamp(age, .02, 1);
  const gen = a.demo.genders.length === 0 ? 1 : a.demo.genders.length / 2;
  let inc = 1, cvr = 1, ctr = 1;
  if (a.demo.incomes.length) { inc = clamp(sum(a.demo.incomes, k => INCOMES[k][1]), .05, 1); const tier = p.price > 200000 ? 'alto' : p.price > 60000 ? 'medio' : 'bajo'; cvr *= a.demo.incomes.includes(tier) ? 1.15 : .9; }
  let buy = 1;
  const bs = a.behavior.buyers.length ? a.behavior.buyers : Object.keys(BUYERS);
  const bsum = sum(bs, k => BUYERS[k].share); buy = clamp(bsum, .05, 1);
  cvr *= sum(bs, k => BUYERS[k].share * BUYERS[k].cvr) / bsum; ctr *= sum(bs, k => BUYERS[k].share * BUYERS[k].ctr) / bsum;
  let intr = 1;
  if (a.behavior.interests.length) { const hit = a.behavior.interests.some(i => cat.tags.includes(i)); intr = .7; cvr *= hit ? 1.15 : .8; ctr *= hit ? 1.15 : .85; }
  let dev = a.behavior.devices.length ? clamp(sum(a.behavior.devices, k => DEVICES[k][1]), .1, 1) : 1;
  const reach = clamp(geo * age * gen * inc * buy * intr * dev, .005, 1);
  return { reach, ctr, cvr, people: Math.round(reach * AUDIENCE_BASE) };
}

/* ============ Palabras clave ============ */
function kwStats(term, p, camp) {
  const cat = CATS[p.cat] || CATS.alimentos; const n = norm(term); const words = n.split(/\s+/).filter(Boolean); const h = hash(n);
  const longTail = words.length >= 3;
  const volume = (2000 + h % 12000) * cat.demand / 900 * (words.length === 1 ? 1.5 : longTail ? .45 : 1);
  const marketCpc = cat.cpc * (.8 + (h % 40) / 100) * (words.length === 1 ? 1.25 : longTail ? .8 : 1);
  const ptxt = norm(p.title + ' ' + cat.name + ' ' + p.desc);
  const sig = words.filter(w => w.length > 2); const matched = sig.filter(w => ptxt.includes(w)).length;
  const rel = sig.length ? matched / sig.length : 0;
  const relF = .25 + rel * 1.15 + (longTail ? .1 : 0);
  const negBoost = Math.min(.2, (camp.negatives || []).length * .04);
  return { volume, marketCpc, rel, relF, negBoost };
}
function autoKeywords(p, bid) { const w = norm(p.title).split(/\s+/).filter(x => x.length > 2).slice(0, 3).join(' '); return [{ term: w || 'producto', match: 'amplia', bid, auto: true }]; }

/* ============ Motor de simulación ============ */
// Una pasada de un día para un anuncio. rnd() decide el azar; en modo estimación rnd = () => .5
function adDay(camp, ad, p, dayIdx, share, rnd, est) {
  const aud = audienceStats(camp.audience, p), qf = qualityFactor(p), pf = priceFactor(p);
  const learning = (dayIdx - camp.startDay) < LEARN_DAYS ? .85 : 1;
  const kws = ad.keywords.length ? ad.keywords : autoKeywords(p, camp.bid);
  const baseCvr = .012, baseCtr = .012;
  let imp = 0, clk = 0, cost = 0, exp = 0;
  const perKw = [];
  kws.forEach(k => {
    const st = kwStats(k.term, p, camp), M = MATCH[k.match] || MATCH.frase;
    const nb = k.match === 'amplia' ? 1 + st.negBoost : 1;
    const cvr = baseCvr * qf * pf * ticketFactor(p) * M.cvr * aud.cvr * st.relF * nb;
    let bid = k.bid || camp.bid;
    if (camp.roasTarget) bid = Math.min(bid, p.price * cvr / camp.roasTarget); // la puja se limita para cumplir el ROAS objetivo
    const posF = Math.pow(clamp(bid / st.marketCpc, .1, 1.6), 1.3);
    const i = st.volume * M.reach * Math.pow(aud.reach, .6) * posF * learning * (.85 + .3 * rnd()) * .5 / Math.max(1, kws.length * .6);
    const ctr = clamp(baseCtr * qf * M.ctr * aud.ctr * st.relF * nb * (.9 + .2 * rnd()), .002, .08);
    const c = i * ctr; const cpc = bid * (.7 + .2 * rnd()) / learning;
    imp += i; clk += c; cost += c * cpc; exp += c * cvr;
  });
  const cap = camp.budgetDaily * share;
  if (cost > cap && cost > 0) { const k = cap / cost; imp *= k; clk *= k; cost *= k; exp *= k; }
  let sales = est ? exp : Math.floor(exp) + (rnd() < exp - Math.floor(exp) ? 1 : 0);
  if (!est) { sales = Math.min(sales, p.stock); imp = Math.round(imp); clk = Math.min(Math.round(clk), imp); cost = Math.round(cost); }
  return { imp, clicks: clk, cost, sales, revenue: sales * p.price, capped: cost >= cap * .98 };
}
const activeAds = c => c.ads.filter(a => a.active && prodById(a.productId));
function stepDay() {
  const day = S.sim.day; let orgS = 0, orgR = 0;
  S.products.forEach(p => {
    const cat = CATS[p.cat] || CATS.alimentos; const r = rng(hash(p.id + 'org' + day));
    const lift = S.campaigns.some(c => c.status === 'active' && c.ads.some(a => a.productId === p.id && a.active)) ? 1.15 : 1;
    const pot = (cat.demand / 900) * 1.1 * qualityFactor(p) * priceFactor(p) * lift * (.7 + .6 * r());
    let s = Math.floor(pot) + (r() < pot - Math.floor(pot) ? 1 : 0); s = Math.min(s, p.stock);
    p.stock -= s; orgS += s; orgR += s * p.price;
  });
  S.sim.organic[day] = { sales: orgS, revenue: orgR };
  S.campaigns.forEach(c => {
    if (c.status !== 'active') return;
    if (day - c.startDay >= c.durationDays) { c.status = 'ended'; return; }
    const ads = activeAds(c).filter(a => prodById(a.productId).stock > 0);
    c.ads.forEach(a => { if (a.active && prodById(a.productId) && prodById(a.productId).stock <= 0) a.active = false; });
    const tot = ads.length;
    ads.forEach(a => {
      const p = prodById(a.productId); const r = rng(hash(a.id + 'd' + day));
      const m = adDay(c, a, p, day, 1 / tot, r, false);
      p.stock -= m.sales; a.daily[day] = m;
    });
    c.ads.forEach(a => { if (!a.daily[day]) a.daily[day] = { imp: 0, clicks: 0, cost: 0, sales: 0, revenue: 0 }; });
  });
  S.sim.day++;
}
function advance(n) { for (let i = 0; i < n; i++) stepDay(); save(); }

/* ============ Agregación de métricas ============ */
const emptyM = () => ({ imp: 0, clicks: 0, cost: 0, sales: 0, revenue: 0 });
function adMetrics(ad, from = 0, to = Infinity) {
  const m = emptyM();
  ad.daily.forEach((d, i) => { if (d && i >= from && i <= to) { m.imp += d.imp; m.clicks += d.clicks; m.cost += d.cost; m.sales += d.sales; m.revenue += d.revenue; } });
  return derive(m);
}
function derive(m) {
  m.ctr = m.imp ? m.clicks / m.imp * 100 : 0; m.cpc = m.clicks ? m.cost / m.clicks : 0;
  m.acos = m.revenue > 0 ? m.cost / m.revenue * 100 : NaN; m.roas = m.cost > 0 ? m.revenue / m.cost : NaN;
  m.cvr = m.clicks ? m.sales / m.clicks * 100 : 0; return m;
}
function campMetrics(c, from = 0, to = Infinity) {
  const m = emptyM();
  c.ads.forEach(a => { const x = adMetrics(a, from, to); m.imp += x.imp; m.clicks += x.clicks; m.cost += x.cost; m.sales += x.sales; m.revenue += x.revenue; });
  return derive(m);
}
function allMetrics(from = 0, to = Infinity, camps = S.campaigns) {
  const m = emptyM();
  camps.forEach(c => { const x = campMetrics(c, from, to); m.imp += x.imp; m.clicks += x.clicks; m.cost += x.cost; m.sales += x.sales; m.revenue += x.revenue; });
  return derive(m);
}
function organicSum(from = 0, to = Infinity) { let s = 0, r = 0; S.sim.organic.forEach((d, i) => { if (d && i >= from && i <= to) { s += d.sales; r += d.revenue; } }); return { sales: s, revenue: r }; }
function netProfit(c, from = 0, to = Infinity) { let u = 0; c.ads.forEach(a => { const p = prodById(a.productId); if (!p) return; const m = adMetrics(a, from, to); u += m.sales * (p.price - (p.cost || 0)) - m.cost; }); return u; }
function adNet(a) { const p = prodById(a.productId); const m = adMetrics(a); return p ? m.sales * (p.price - (p.cost || 0)) - m.cost : 0; }
function adProfitable(a) { const p = prodById(a.productId); const m = adMetrics(a); return p && m.sales > 0 && m.acos < margin(p); }
function campEstimate(c, over) { // estimación de un día "estable" sin azar
  const cc = Object.assign({}, c, over || {}); const ads = cc.ads.filter(a => a.active && prodById(a.productId)); const tot = ads.length || 1;
  const m = emptyM(); ads.forEach(a => { const x = adDay(cc, a, prodById(a.productId), cc.startDay + 10, 1 / tot, () => .5, true); m.imp += x.imp; m.clicks += x.clicks; m.cost += x.cost; m.sales += x.sales; m.revenue += x.revenue; });
  return derive(m);
}
function acosBadge(acos, p) {
  if (!isFinite(acos)) return ['mut', 'Sin ventas'];
  const be = p ? margin(p) : 25;
  return acos <= be * .5 ? ['ok', 'Óptimo'] : acos <= be ? ['ok', 'Rentable'] : ['bad', 'Pierde dinero'];
}
function campStatus(c) {
  if (c.status === 'draft') return { k: 'mut', t: 'Borrador', d: 'Aún no se lanza. Revisa y publica.' };
  if (c.status === 'paused') return { k: 'warn', t: 'Pausada', d: 'No se muestran anuncios ni se gasta presupuesto.' };
  if (c.status === 'ended') return { k: 'mut', t: 'Finalizada', d: 'Cumplió su duración programada.' };
  const left = LEARN_DAYS - (S.sim.day - c.startDay);
  if (left > 0) return { k: 'info', t: 'Aprendiendo', d: `Se estabilizará en ${left} día${left > 1 ? 's' : ''} para calibrar la puja`, learn: true };
  return { k: 'ok', t: 'Campaña activa', d: 'Rendimiento continuo dentro del objetivo de ROAS' };
}

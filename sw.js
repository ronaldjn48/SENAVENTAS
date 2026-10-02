/* SENAVENTAS · Service worker: permite instalar la app y usarla sin conexión. */
const VERSION = 'senaventas-v1.1.0';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/app.css',
  'assets/js/images.js',
  'assets/js/data.js',
  'assets/js/core.js',
  'assets/js/store-css.js',
  'assets/js/store-render.js',
  'assets/js/api-sim.js',
  'assets/js/login.js',
  'assets/js/app.js',
  'assets/icons/icon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png'
];
const RUNTIME = VERSION + '-runtime';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Archivos propios: red primero para recibir actualizaciones, caché si no hay conexión. */
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
    );
    return;
  }

  /* Fuentes e imágenes externas: caché primero y actualización en segundo plano. */
  if (/fonts\.(googleapis|gstatic)\.com|googleusercontent\.com/.test(url.hostname)) {
    e.respondWith(
      caches.open(RUNTIME).then((c) => c.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
  }
});

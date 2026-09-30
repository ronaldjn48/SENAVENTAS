/* SENA VENTAS LANDING PAGE · Service worker: instalación como app y uso sin conexión. */
const VERSION = 'senaventas-landing-v1.0.0';
const SHELL = [
  './',
  'index.html',
  'ver.html',
  'config.js',
  'manifest.webmanifest',
  'assets/css/app.css',
  'assets/js/core.js',
  'assets/js/art.js',
  'assets/js/data.js',
  'assets/js/render.js',
  'assets/js/cloud.js',
  'assets/js/viewer.js',
  'assets/js/app.js',
  'assets/js/editor.js',
  'assets/js/leads.js',
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
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match(url.pathname.endsWith('ver.html') ? 'ver.html' : 'index.html')))
    );
    return;
  }

  /* Fuentes de Google: caché primero y actualización en segundo plano. */
  if (/fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(
      caches.open(RUNTIME).then((c) => c.match(req).then((hit) => {
        const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      }))
    );
  }
});

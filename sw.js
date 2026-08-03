const CACHE_NAME = 'lightbox-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './src/app.js',
  './src/image-export.js',
  './src/status-presenter.js',
  './src/transform-state.js',
  './src/viewport-state.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('lightbox-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

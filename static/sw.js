// Basic service worker for Intellistar Emulator PWA
// Caches the app shell and the most recent star.png request
const CACHE_NAME = 'intellistar-v1';
const APP_SHELL = [
  '/',
  '/static/manifest.json',
  '/static/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Strategy: network-first for /star.png (so it's fresh), fallback to cache
  if (e.request.url.includes('/star.png')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // update cache with latest star.png
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, res.clone()));
          return res.clone();
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // For other requests, try cache first then network
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

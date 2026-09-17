/**
 *ThopGames PWA Service Worker
 * Network-first for dynamic game catalog, Cache-first for core static assets
 */

const CACHE_NAME = 'skygames-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/sky-icon.png',
  '/src/main.jsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => { });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Ignore chrome extension & non-http schemes
  if (!request.url.startsWith('http')) return;

  // API calls & socket requests: direct network
  if (request.url.includes('/api/') || request.url.includes('/socket.io/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and update in background
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => { });
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

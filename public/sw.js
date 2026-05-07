// PHASE5: Exclude /api/ routes from service worker caching to prevent stale API responses
const CACHE_NAME = 'codebeing-v1';
const OFFLINE_URLS = [
  '/',
  '/codeground',
  '/algorithm-lab',
  '/templates',
  '/learn',
  '/playground',
  '/challenge',
  '/sign-up',
  '/contributions',
  '/team',
  '/blog',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // PHASE5: Never cache API routes
  if (event.request.url.includes('/api/')) { return; }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
      return cached || fetchPromise;
    })
  );
});

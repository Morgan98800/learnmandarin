const CACHE_NAME = 'notes-from-class-v1';

const STATIC_ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'data/vocab/index.json',
  'data/vocab/basics.json',
  'data/vocab/clothes.json',
  'data/vocab/directions.json',
  'data/vocab/emotions.json',
  'data/vocab/family.json',
  'data/vocab/greetings.json',
  'data/vocab/numbers.json',
  'data/vocab/ordering-food.json',
  'data/vocab/time-dates.json',
  'data/vocab/travel.json',
  'data/vocab/work-school.json',
  'data/frequency-1000.json',
  'data/grammar.json',
  'data/dictionary.json'
];

// Install Event: Pre-cache static assets and JSON databases
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets & JSON databases');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First with Network Fallback & Background Revalidation
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to keep cache updated
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {
          // Offline mode, silent fallback to cached response
        });
        return cachedResponse;
      }

      // Network fallback if not in initial pre-cache list
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('index.html');
        }
      });
    })
  );
});

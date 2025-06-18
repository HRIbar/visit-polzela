importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const CACHE_NAME = 'visit-polzela-v2';

// List all resources to cache
const resourcesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/styles/main-view-styles.css',
  '/styles/poi-detail-view-styles.css',
  '/styles/offline.css',
  '/images/polzela.webp',
  '/images/grbpolzela.webp',
  // Add all your images here
  '/images/castle1.webp', '/images/castle2.webp', '/images/castle3.webp',
  '/images/park1.webp', '/images/park2.webp', '/images/park3.webp',
  '/images/icecream1.webp', '/images/icecream2.webp', '/images/icecream3.webp',
  '/images/mountoljka1.webp', '/images/mountoljka2.webp', '/images/mountoljka3.webp',
  '/images/maurerhouse1.webp', '/images/maurerhouse2.webp', '/images/maurerhouse3.webp',
  '/images/romancamp1.webp', '/images/romancamp2.webp', '/images/romancamp3.webp',
  '/images/tractormuseum1.webp', '/images/tractormuseum2.webp', '/images/tractormuseum3.webp',
  '/images/cajhnhayrack1.webp', '/images/cajhnhayrack2.webp', '/images/cajhnhayrack3.webp',
  '/images/clayfigurines1.webp', '/images/clayfigurines2.webp', '/images/clayfigurines3.webp',
  '/images/noviklostermanor1.webp', '/images/noviklostermanor2.webp', '/images/noviklostermanor3.webp',
  '/images/stmargharetachurch1.webp', '/images/stmargharetachurch2.webp', '/images/stmargharetachurch3.webp',
  '/images/stnicholaschurch1.webp', '/images/stnicholaschurch2.webp', '/images/stnicholaschurch3.webp',
  '/images/standrewchurch1.webp', '/images/standrewchurch2.webp', '/images/standrewchurch3.webp',
  '/images/plaguememorial1.webp', '/images/plaguememorial2.webp', '/images/plaguememorial3.webp',
  '/images/jelovsekgranary1.webp', '/images/jelovsekgranary2.webp', '/images/jelovsekgranary3.webp',
  '/images/bolcinhouse1.webp', '/images/bolcinhouse2.webp', '/images/bolcinhouse3.webp',
  '/images/stoberhouse1.webp', '/images/stoberhouse2.webp', '/images/stoberhouse3.webp',
  '/images/barbankhouse1.webp', '/images/barbankhouse2.webp', '/images/barbankhouse3.webp',
  '/images/mesicmill1.webp', '/images/mesicmill2.webp', '/images/mesicmill3.webp',
  '/images/riverloznica1.webp', '/images/riverloznica2.webp', '/images/riverloznica3.webp',
  // Add all other resources you want to cache
];

// List all routes that should work offline
const OFFLINE_ROUTES = [
  '/',
  '/pois',
  '/poi/castle',
  '/poi/park',
  // Add all your routes here
];

workbox.precaching.precacheAndRoute([
    { url: '/', revision: null },
    { url: '/manifest.json', revision: null },
    { url: '/poi-descriptions/castle.txt', revision: null },
    { url: '/poi-descriptions/park.txt', revision: null },
    { url: '/poi-descriptions/icecream.txt', revision: null },
    // Add other resources you want to cache
]);

workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
        cacheName: 'pages',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
            }),
        ],
    })
);

workbox.routing.registerRoute(
    ({request}) => request.destination === 'style' ||
                   request.destination === 'script' ||
                   request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'assets',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
        ],
    })
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service worker installed');
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If we can't fetch the actual page, try to match the route
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // For all other requests (assets, API calls, etc.)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Otherwise try to fetch it
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Cache the fetched response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // If it's an image, return a placeholder
            if (request.destination === 'image') {
              return caches.match('/images/placeholder.png');
            }
          });
      })
  );
});

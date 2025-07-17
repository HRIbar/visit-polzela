// Cache names
const CACHE_NAME = 'visit-polzela-cache-v1';
const DATA_CACHE_NAME = 'visit-polzela-data-cache-v1';
const STATIC_CACHE_NAME = 'visit-polzela-static-cache-v1';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/images/applenavigationbutton.webp',
  '/images/barbankhouse.webp',
  '/images/bolcinhouse.webp',
  '/images/cajhnhayrack.webp',
  '/images/castle.webp',
  '/images/castle1.webp',
  '/images/castle2.webp',
  '/images/castle3.webp',
  '/images/clayfigurines.webp',
  '/images/deflag.webp',
  '/images/grbpolzela.webp',
  '/images/icecream.webp',
  '/images/icecream1.webp',
  '/images/icecream2.webp',
  '/images/jelovsekgranary.webp',
  '/images/maurerhouse.webp',
  '/images/maurerhouse1.webp',
  '/images/maurerhouse2.webp',
  '/images/maurerhouse3.webp',
  '/images/mesicmill.webp',
  '/images/mountoljka.webp',
  '/images/mountoljka1.webp',
  '/images/mountoljka2.webp',
  '/images/mountoljka3.webp',
  '/images/navigationbutton.webp',
  '/images/nlflag.webp',
  '/images/noviklostermanor.webp',
  '/images/park.webp',
  '/images/park1.webp',
  '/images/park2.webp',
  '/images/park3.webp',
  '/images/placeholder.png',
  '/images/plaguememorial.webp',
  '/images/polzela.webp',
  '/images/riverloznica.webp',
  '/images/romancamp.webp',
  '/images/romancamp1.webp',
  '/images/romancamp2.webp',
  '/images/siflag.webp',
  '/images/standrewchurch.webp',
  '/images/standrewchurch1.webp',
  '/images/standrewchurch2.webp',
  '/images/stmargharetachurch.webp',
  '/images/stmargharetachurch1.webp',
  '/images/stnicholaschurch.webp',
  '/images/stnicholaschurch1.webp',
  '/images/stnicholaschurch2.webp',
  '/images/stoberhouse.webp',
  '/images/tractormuseum.webp',
  '/images/ukflag.webp'
  '/poi-descriptions/barbankhouse.txt',
  '/poi-descriptions/bolcinhouse.txt',
  '/poi-descriptions/cajhnhayrack.txt',
  '/poi-descriptions/castle.txt',
  '/poi-descriptions/clayfigurines.txt',
  '/poi-descriptions/icecream.txt',
  '/poi-descriptions/jelovsekgranary.txt',
  '/poi-descriptions/maurerhouse.txt',
  '/poi-descriptions/mesicmill.txt',
  '/poi-descriptions/mountoljka.txt',
  '/poi-descriptions/noviklostermanor.txt',
  '/poi-descriptions/park.txt',
  '/poi-descriptions/plaguememorial.txt',
  '/poi-descriptions/riverloznica.txt',
  '/poi-descriptions/romancamp.txt',
  '/poi-descriptions/standrewchurch.txt',
  '/poi-descriptions/stmargharetachurch.txt',
  '/poi-descriptions/stnicholaschurch.txt',
  '/poi-descriptions/stoberhouse.txt',
  '/poi-descriptions/tractormuseum.txt',
  '/pointsofinterest/pois.txt',
  '/pointsofinterest/poititles.txt'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Add an activate event to clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME, STATIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim any clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return response from cache if found
        if (response) {
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then(networkResponse => {
          // Add the new resource to the cache
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

console.log('Service Worker loaded');
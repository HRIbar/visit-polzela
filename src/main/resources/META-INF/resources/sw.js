// Simple service worker for PWA functionality
const CACHE_NAME = 'visit-polzela-v1';
const urlsToCache = [
  '/',
  '/pointsofinterest/pois.txt',
  '/pointsofinterest/poititles.txt',
  '/images/polzela.webp',
  '/images/grbpolzela.webp',
  '/images/siflag.webp',
  '/images/ukflag.webp',
  '/images/deflag.webp',
  '/images/nlflag.webp',
  '/images/navigationbutton.webp',
  '/images/applenavigationbutton.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

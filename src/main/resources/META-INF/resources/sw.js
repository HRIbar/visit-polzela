// Increment CACHE_NAME when the app shell JS/CSS changes to force a cache refresh.
// POI images and JSON are managed by DataService via the separate 'poi-images-v1' bucket.
const CACHE_NAME = 'visit-polzela-shell-v1';

// App-shell only — everything that must be available before any network call.
// POI images, .txt description files, and legacy offline scripts are intentionally excluded.
const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  // UI-chrome images that ship inside the APK / public-mobile/
  '/images/siflag.webp',
  '/images/ukflag.webp',
  '/images/deflag.webp',
  '/images/nlflag.webp',
  '/images/grbpolzela.webp',
  '/images/polzela.webp',
  '/images/navigationbutton.webp',
  '/images/applenavigationbutton.webp',
  '/images/placeholder.png',
];

// ── Install: cache the app shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing…');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install failed:', err))
  );
});

// ── Activate: delete stale caches (except poi-images-v1) ─────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== 'poi-images-v1')
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.protocol.startsWith('http')) return;

  // Navigation requests → serve index.html (React Router handles routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => (res && res.ok ? res : caches.match('/index.html')))
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // /api/** → network-first (DataService handles IndexedDB fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res && res.ok && request.method === 'GET') {
            caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else → cache-first (app shell JS/CSS/images)
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (!res || res.status !== 200 || request.method !== 'GET') return res;
        const contentType = res.headers.get('content-type') || '';
        if (
          contentType.includes('javascript') ||
          contentType.includes('css') ||
          contentType.includes('image') ||
          url.pathname.endsWith('.webp') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.ico')
        ) {
          caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
        }
        return res;
      }).catch(() =>
        new Response('Offline — resource not available', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        })
      );
    })
  );
});

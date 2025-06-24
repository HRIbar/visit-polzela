(function() {
  const DB_NAME = 'visit-polzela-db';
  const DB_VERSION = 1;
  const STORE_NAME = 'pois';
  const CACHE_NAME = 'visit-polzela-cache'; // Ensure CACHE_NAME is defined

  let db;
  let isOffline = !navigator.onLine;

  const offlineStore = {
    async init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          db = event.target.result;
          resolve();
        };

        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.errorCode);
          reject('IndexedDB error: ' + event.target.errorCode);
        };
      }).then(() => {
        // Test image caching after initialization
        this.testImageCaching();
      });
    },

    async storePOIs(pois) {
      if (!db) await this.init();

      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      for (const poi of pois) {
        store.put(poi);
      }

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          console.log('POIs stored for offline use');
          resolve(true);
        };
        tx.onerror = () => reject(tx.error);
      });
    },

    async getAllPOIs() {
      if (!db) await this.init();

      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    async getPOI(id) {
      if (!db) await this.init();

      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    setupOfflineNavigation() {
      // Monitor online/offline status
      window.addEventListener('online', () => {
        isOffline = false;
        document.body.classList.remove('offline-mode');
        console.log('Back online');
      });

      window.addEventListener('offline', () => {
        isOffline = true;
        document.body.classList.add('offline-mode');
        console.log('Offline mode activated');
      });

      // Set initial state
      if (isOffline) {
        document.body.classList.add('offline-mode');
      }

      // Intercept clicks on POI links when offline
      document.addEventListener('click', async (e) => {
        if (!isOffline) return; // Only handle clicks when offline

        // Find if the click was on a POI link or its child
        let target = e.target;
        while (target && !target.classList.contains('poi-link')) {
          target = target.parentElement;
        }

        if (target && target.classList.contains('poi-link')) {
          e.preventDefault();
          e.stopPropagation();

          // Extract POI ID from href
          const href = target.getAttribute('href');
          const poiId = href.split('/').pop();

          try {
            const poi = await this.getPOI(poiId);
            if (poi) {
              this.renderOfflinePOIDetail(poi);
            } else {
              this.showOfflineMessage('This content is not available offline');
            }
          } catch (err) {
            console.error('Error loading offline POI:', err);
            this.showOfflineMessage('Error loading offline content');
          }
        }
      });
    },

    renderOfflinePOIDetail(poi) {
      console.log('Rendering offline POI:', poi);

      // Clear the outlet
      const outlet = document.getElementById('outlet');
      outlet.innerHTML = '';

      // Create offline POI detail view
      const container = document.createElement('div');
      container.className = 'offline-poi-detail';

      // Add back button
      const backButton = document.createElement('button');
      backButton.textContent = 'Back to List';
      backButton.className = 'offline-back-button';
      backButton.onclick = () => window.location.href = '/';

      // Add POI content
      const title = document.createElement('h2');
      title.textContent = poi.displayName;

      const image = document.createElement('img');
      // Fix image path and add debugging
      const imagePath = poi.imagePath.startsWith('/') ? poi.imagePath : '/images/' + poi.imagePath;
      console.log('Using image path:', imagePath);

      // Check if image is cached
      if (await this.isImageCached(imagePath)) {
        image.src = imagePath;
      } else {
        image.src = '/images/placeholder.png';
      }

      image.alt = poi.displayName;
      image.onerror = () => {
          console.error('Failed to load image:', imagePath);
          image.src = '/images/placeholder.png';
      };

      const description = document.createElement('div');
      description.className = 'poi-description';
      description.textContent = poi.description || 'No description available offline';

      // Add a short description below the image
      const shortDesc = document.createElement('p');
      shortDesc.textContent = poi.shortDescription || 'Historic castle in Polzela.';

      // Add offline indicator
      const offlineIndicator = document.createElement('p');
      offlineIndicator.className = 'offline-indicator';
      offlineIndicator.textContent = 'Viewing in offline mode';

      // Assemble the view
      container.appendChild(backButton);
      container.appendChild(title);
      container.appendChild(image);
      container.appendChild(shortDesc);
      container.appendChild(offlineIndicator);
      container.appendChild(description);

      outlet.appendChild(container);

      // Update browser history to simulate navigation
      history.pushState({}, poi.displayName, '/poi/' + poi.id);
    },

    showOfflineMessage(message) {
      const outlet = document.getElementById('outlet');
      outlet.innerHTML = `
        <div class="offline-message">
          <h2>Offline Mode</h2>
          <p>${message}</p>
          <button onclick="window.location.href='/'">Back to Home</button>
        </div>
      `;
    },

    async isImageCached(imagePath) {
      try {
          const cache = await caches.open(CACHE_NAME);
          const response = await cache.match(imagePath);
          console.log(`Image ${imagePath} cached: ${!!response}`);
          return !!response;
      } catch (err) {
          console.error('Error checking cache:', err);
          return false;
      }
    },

    async testImageCaching() {
      const imagePaths = [
          '/images/castle.webp',
          '/images/park.webp',
          '/images/placeholder.png'
      ];

      console.log('Testing image caching...');
      for (const path of imagePaths) {
          const isCached = await this.isImageCached(path);
          console.log(`${path}: ${isCached ? 'CACHED' : 'NOT CACHED'}`);
      }
    }
  };

  // Initialize the store
  offlineStore.init().then(() => {
    console.log('Offline store initialized');
  }).catch(err => {
    console.error('Failed to initialize offline store:', err);
  });

  // Expose to window
  window.offlineStore = offlineStore;
})();

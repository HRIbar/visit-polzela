class OfflineStore {
  constructor() {
    this.dbPromise = this.openDatabase();
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('visit-polzela-db', 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store for POIs
        if (!db.objectStoreNames.contains('pois')) {
          const poisStore = db.createObjectStore('pois', { keyPath: 'id' });
          poisStore.createIndex('name', 'name', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject('IndexedDB error: ' + event.target.errorCode);
      };
    });
  }

  // Store POIs in IndexedDB
  async storePOIs(pois) {
    const db = await this.dbPromise;
    const tx = db.transaction('pois', 'readwrite');
    const store = tx.objectStore('pois');

    pois.forEach(poi => {
      store.put(poi);
    });

    return tx.complete;
  }

  // Get all POIs from IndexedDB
  async getAllPOIs() {
    const db = await this.dbPromise;
    const tx = db.transaction('pois', 'readonly');
    const store = tx.objectStore('pois');

    return store.getAll();
  }

  // Get a specific POI by ID
  async getPOI(id) {
    const db = await this.dbPromise;
    const tx = db.transaction('pois', 'readonly');
    const store = tx.objectStore('pois');

    return store.get(id);
  }
}

// Export the store
window.offlineStore = new OfflineStore();
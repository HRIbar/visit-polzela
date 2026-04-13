import { openDB } from 'idb';
import { POI, Language } from '../types/POI';

const DB_NAME = 'visit-polzela';
const POI_STORE = 'pois';

export class DataService {
  private static instance: DataService;
  private db: any;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async initDB() {
    if (!this.db) {
      this.db = await openDB(DB_NAME, 2, {
        upgrade(db) {
          // Remove the old 'titles' store from the Vaadin-era schema
          if (db.objectStoreNames.contains('titles')) {
            db.deleteObjectStore('titles');
          }
          if (!db.objectStoreNames.contains(POI_STORE)) {
            db.createObjectStore(POI_STORE, { keyPath: 'name' });
          }
        },
      });
    }
    return this.db;
  }

  /**
   * Fetch all POIs from REST and cache in IndexedDB for offline fallback.
   */
  async loadPOIsFromREST(lang: Language): Promise<POI[]> {
    try {
      const response = await fetch(`/api/pois?lang=${lang}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const pois: POI[] = await response.json();

      // Cache in IndexedDB for offline access
      const db = await this.initDB();
      const tx = db.transaction(POI_STORE, 'readwrite');
      for (const poi of pois) {
        await tx.store.put(poi);
      }
      await tx.done;

      return pois;
    } catch (error) {
      console.warn('[DataService] REST fetch failed, falling back to IndexedDB:', error);
      return this.getPOIsFromDB();
    }
  }

  /**
   * Fetch a single POI with full localized description from REST.
   * Falls back to IndexedDB cached entry on network failure.
   */
  async getPOIFromREST(key: string, lang: Language): Promise<POI | null> {
    try {
      const response = await fetch(`/api/pois/${encodeURIComponent(key)}?lang=${lang}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      const poi: POI = await response.json();

      // Update cache with the enriched (description-bearing) entry
      const db = await this.initDB();
      await db.put(POI_STORE, poi);

      return poi;
    } catch (error) {
      console.warn(`[DataService] REST fetch failed for POI "${key}", using cache:`, error);
      const db = await this.initDB();
      return (await db.get(POI_STORE, key)) ?? null;
    }
  }

  /**
   * Fetch localized UI text strings (e.g. 'welcome', 'takeme') from REST.
   */
  async getLocalizedTexts(lang: Language, keys: string[]): Promise<Map<string, string>> {
    try {
      const keysParam = keys.join(',');
      const response = await fetch(`/api/texts?lang=${lang}&keys=${keysParam}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: { texts: Record<string, string> } = await response.json();
      return new Map(Object.entries(data.texts));
    } catch (error) {
      console.warn('[DataService] Failed to load localized texts:', error);
      return new Map();
    }
  }

  /**
   * Fetch available image URLs for a POI (main + up to 3 gallery images).
   */
  async getPOIImages(key: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/pois/${encodeURIComponent(key)}/images`);
      if (!response.ok) return [];
      const data: { imageUrls: string[] } = await response.json();
      return data.imageUrls;
    } catch (error) {
      console.warn(`[DataService] Failed to load images for "${key}":`, error);
      return [];
    }
  }

  async getPOIsFromDB(): Promise<POI[]> {
    const db = await this.initDB();
    return db.getAll(POI_STORE);
  }

  async initializeData(lang: Language): Promise<void> {
    try {
      await this.loadPOIsFromREST(lang);
    } catch (error) {
      console.error('[DataService] Error initializing data:', error);
    }
  }
}

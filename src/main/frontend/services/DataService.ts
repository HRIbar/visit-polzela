import { openDB } from 'idb';
import { POI, Language } from '../types/POI';

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_NAME = 'visit-polzela';
const DB_VERSION = 3;

// IndexedDB stores
const POI_STORE = 'pois';            // current-language list (quick load, backward compat)
const POI_LANG_STORE = 'poi_lang';   // all languages: key = `${name}_${lang}` or `${name}_${lang}_full`
const TEXT_STORE = 'text_cache';     // UI strings: key = `${textKey}_${lang}`
const IMAGE_META_STORE = 'image_meta'; // image URL list: key = poiKey

// Cache API bucket for binary images
const IMAGE_CACHE_NAME = 'poi-images-v1';

// Bump DATA_VERSION when POI data changes to force re-sync on all clients
const DATA_VERSION = 'v1';
const SYNC_FLAG_KEY = `poi_data_synced_${DATA_VERSION}`;

const LANGUAGES: Language[] = ['EN', 'SL', 'DE', 'NL'];

// Injected by Vite at build time:
//   '' (empty)                       → web build — uses relative /api/… paths
//   'https://visit-polzela.com'      → mobile build (vite.mobile.config.ts)
const BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) || '';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncProgressCallback = (message: string, progress: number) => void;

// ─── DataService ──────────────────────────────────────────────────────────────

export class DataService {
  private static instance: DataService;
  private db: any;
  // In-memory blob URL cache to avoid re-creating object URLs on every render
  private blobUrlCache = new Map<string, string>();

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // ─── IndexedDB ──────────────────────────────────────────────────────────────

  async initDB() {
    if (!this.db) {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Remove legacy Vaadin-era stores
          if (db.objectStoreNames.contains('titles')) {
            db.deleteObjectStore('titles');
          }
          if (!db.objectStoreNames.contains(POI_STORE)) {
            db.createObjectStore(POI_STORE, { keyPath: 'name' });
          }
          if (!db.objectStoreNames.contains(POI_LANG_STORE)) {
            db.createObjectStore(POI_LANG_STORE, { keyPath: 'cacheKey' });
          }
          if (!db.objectStoreNames.contains(TEXT_STORE)) {
            db.createObjectStore(TEXT_STORE, { keyPath: 'cacheKey' });
          }
          if (!db.objectStoreNames.contains(IMAGE_META_STORE)) {
            db.createObjectStore(IMAGE_META_STORE, { keyPath: 'key' });
          }
        },
      });
    }
    return this.db;
  }

  // ─── Cache API — binary images ───────────────────────────────────────────────

  /**
   * Fetches an image from the remote server and stores it in the Cache API.
   * The cache key is the absolute URL (BASE_URL + imagePath).
   * No-ops if the image is already cached.
   */
  async cacheImage(imagePath: string): Promise<void> {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const url = BASE_URL + imagePath;
      const existing = await cache.match(url);
      if (existing) return; // already cached
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (e) {
      console.warn(`[DataService] Failed to cache image ${imagePath}:`, e);
    }
  }

  /**
   * Returns a blob object URL for the cached image, or falls back to the remote URL.
   * Results are memoised in `blobUrlCache` so object URLs are reused across renders.
   */
  async getCachedImageUrl(imagePath: string): Promise<string> {
    if (this.blobUrlCache.has(imagePath)) {
      return this.blobUrlCache.get(imagePath)!;
    }
    if ('caches' in window) {
      try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const url = BASE_URL + imagePath;
        const cached = await cache.match(url);
        if (cached) {
          const blob = await cached.blob();
          const objectUrl = URL.createObjectURL(blob);
          this.blobUrlCache.set(imagePath, objectUrl);
          return objectUrl;
        }
      } catch (e) {
        // fall through to remote URL
      }
    }
    // Not cached yet — return absolute remote URL (will load from network)
    return BASE_URL + imagePath;
  }

  // ─── First-run bootstrap sync ─────────────────────────────────────────────

  /** Returns true when a first-run sync is needed (no valid cache stamp). */
  async needsSync(): Promise<boolean> {
    return !localStorage.getItem(SYNC_FLAG_KEY);
  }

  /**
   * Full offline bootstrap: downloads all POI data, descriptions, and images
   * for every supported language and stores them locally.
   * Should only be called on first launch or after a DATA_VERSION bump.
   */
  async syncAllContent(onProgress?: SyncProgressCallback): Promise<void> {
    const db = await this.initDB();

    const report = (msg: string, pct: number) => {
      console.log(`[DataService] Sync ${pct}%: ${msg}`);
      onProgress?.(msg, pct);
    };

    // ── 1. POI list for all languages ──────────────────────────────────────
    report('Downloading POI list…', 0);
    let poiKeys: string[] = [];
    for (let i = 0; i < LANGUAGES.length; i++) {
      const lang = LANGUAGES[i];
      try {
        const res = await fetch(`${BASE_URL}/api/pois?lang=${lang}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const pois: POI[] = await res.json();

        if (lang === 'EN') {
          poiKeys = pois.map(p => p.name);
        }

        const tx = db.transaction(POI_LANG_STORE, 'readwrite');
        for (const poi of pois) {
          await tx.store.put({ ...poi, cacheKey: `${poi.name}_${lang}` });
        }
        await tx.done;

        // Also keep the plain `pois` store current for the selected language
        const activeLang = (localStorage.getItem('selectedLanguage') as Language) || 'EN';
        if (lang === activeLang) {
          const tx2 = db.transaction(POI_STORE, 'readwrite');
          for (const poi of pois) await tx2.store.put(poi);
          await tx2.done;
        }
      } catch (e) {
        console.warn(`[DataService] Sync: POI list failed for ${lang}`, e);
      }
      report(`POI list (${lang})…`, Math.round(5 + (i / LANGUAGES.length) * 15));
    }

    // ── 2. Full POI details (with descriptions) for all POIs × all languages ──
    const totalDetails = poiKeys.length * LANGUAGES.length;
    let detailStep = 0;
    for (const key of poiKeys) {
      for (const lang of LANGUAGES) {
        try {
          const res = await fetch(`${BASE_URL}/api/pois/${encodeURIComponent(key)}?lang=${lang}`);
          if (res.ok) {
            const poi: POI = await res.json();
            await db.put(POI_LANG_STORE, { ...poi, cacheKey: `${key}_${lang}_full` });
          }
        } catch (e) {
          console.warn(`[DataService] Sync: detail failed ${key}/${lang}`, e);
        }
        detailStep++;
        report(
          `Downloading descriptions… (${detailStep}/${totalDetails})`,
          Math.round(20 + (detailStep / totalDetails) * 40)
        );
      }
    }

    // ── 3. Image metadata + binary image caching ───────────────────────────
    for (let i = 0; i < poiKeys.length; i++) {
      const key = poiKeys[i];
      try {
        const res = await fetch(`${BASE_URL}/api/pois/${encodeURIComponent(key)}/images`);
        if (res.ok) {
          const data: { imageUrls: string[] } = await res.json();
          await db.put(IMAGE_META_STORE, { key, imageUrls: data.imageUrls });
          for (const url of data.imageUrls) {
            await this.cacheImage(url);
          }
        }
      } catch (e) {
        console.warn(`[DataService] Sync: image caching failed for ${key}`, e);
      }
      report(
        `Caching images… (${i + 1}/${poiKeys.length})`,
        Math.round(60 + ((i + 1) / poiKeys.length) * 35)
      );
    }

    // ── 4. UI texts for all languages ──────────────────────────────────────
    for (const lang of LANGUAGES) {
      try {
        const res = await fetch(`${BASE_URL}/api/texts?lang=${lang}&keys=welcome,takeme`);
        if (res.ok) {
          const data: { texts: Record<string, string> } = await res.json();
          const tx = db.transaction(TEXT_STORE, 'readwrite');
          for (const [k, v] of Object.entries(data.texts)) {
            await tx.store.put({ cacheKey: `${k}_${lang}`, value: v });
          }
          await tx.done;
        }
      } catch (e) {
        console.warn(`[DataService] Sync: texts failed for ${lang}`, e);
      }
    }

    localStorage.setItem(SYNC_FLAG_KEY, 'true');
    report('Ready!', 100);
  }

  // ─── POI data methods ──────────────────────────────────────────────────────

  /**
   * Fetches the localized POI list from REST and caches the result.
   * Falls back to IndexedDB on network failure.
   */
  async loadPOIsFromREST(lang: Language): Promise<POI[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/pois?lang=${lang}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const pois: POI[] = await response.json();

      const db = await this.initDB();
      // Update both stores
      const tx1 = db.transaction(POI_STORE, 'readwrite');
      for (const poi of pois) await tx1.store.put(poi);
      await tx1.done;

      const tx2 = db.transaction(POI_LANG_STORE, 'readwrite');
      for (const poi of pois) {
        await tx2.store.put({ ...poi, cacheKey: `${poi.name}_${lang}` });
      }
      await tx2.done;

      return pois;
    } catch (error) {
      console.warn('[DataService] REST fetch failed, falling back to IndexedDB:', error);
      return this.getPOIsFromCache(lang);
    }
  }

  /**
   * Fetches a single POI with its full description from REST.
   * Falls back to IndexedDB cached entry on network failure.
   */
  async getPOIFromREST(key: string, lang: Language): Promise<POI | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/pois/${encodeURIComponent(key)}?lang=${lang}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      const poi: POI = await response.json();

      const db = await this.initDB();
      await db.put(POI_STORE, poi);
      await db.put(POI_LANG_STORE, { ...poi, cacheKey: `${key}_${lang}_full` });

      return poi;
    } catch (error) {
      console.warn(`[DataService] REST fetch failed for POI "${key}", using cache:`, error);
      const db = await this.initDB();
      const full = await db.get(POI_LANG_STORE, `${key}_${lang}_full`);
      if (full) {
        const { cacheKey, ...poi } = full;
        return poi as POI;
      }
      return (await db.get(POI_STORE, key)) ?? null;
    }
  }

  /**
   * Fetches localized UI text strings (e.g. 'welcome', 'takeme') from REST.
   * Falls back to the TEXT_STORE cache on network failure.
   */
  async getLocalizedTexts(lang: Language, keys: string[]): Promise<Map<string, string>> {
    try {
      const keysParam = keys.join(',');
      const response = await fetch(`${BASE_URL}/api/texts?lang=${lang}&keys=${keysParam}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: { texts: Record<string, string> } = await response.json();

      // Keep text cache fresh
      const db = await this.initDB();
      const tx = db.transaction(TEXT_STORE, 'readwrite');
      for (const [k, v] of Object.entries(data.texts)) {
        await tx.store.put({ cacheKey: `${k}_${lang}`, value: v });
      }
      await tx.done;

      return new Map(Object.entries(data.texts));
    } catch (error) {
      console.warn('[DataService] Failed to load localized texts, trying cache:', error);
      const db = await this.initDB();
      const result = new Map<string, string>();
      for (const k of keys) {
        const entry = await db.get(TEXT_STORE, `${k}_${lang}`);
        if (entry) result.set(k, entry.value);
      }
      return result;
    }
  }

  /**
   * Returns all available image URLs for a POI.
   * Tries REST first, falls back to IMAGE_META_STORE cache.
   */
  async getPOIImages(key: string): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/pois/${encodeURIComponent(key)}/images`);
      if (!response.ok) return [];
      const data: { imageUrls: string[] } = await response.json();

      const db = await this.initDB();
      await db.put(IMAGE_META_STORE, { key, imageUrls: data.imageUrls });

      return data.imageUrls;
    } catch (error) {
      console.warn(`[DataService] Failed to load images for "${key}", trying cache:`, error);
      const db = await this.initDB();
      const meta = await db.get(IMAGE_META_STORE, key);
      return meta?.imageUrls ?? [];
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async getPOIsFromCache(lang: Language): Promise<POI[]> {
    const db = await this.initDB();
    // Try per-language store first
    const all: any[] = await db.getAll(POI_LANG_STORE);
    const suffix = `_${lang}`;
    const langPois = all
      .filter(e => e.cacheKey.endsWith(suffix) && !e.cacheKey.includes('_full'))
      .map(({ cacheKey, ...poi }) => poi as POI);
    if (langPois.length > 0) return langPois;
    // Fall back to the current-language pois store
    return db.getAll(POI_STORE);
  }

  async getPOIsFromDB(): Promise<POI[]> {
    const db = await this.initDB();
    return db.getAll(POI_STORE);
  }

  /**
   * Entry-point called on app startup.
   * Runs syncAllContent on first launch (or after a DATA_VERSION bump),
   * otherwise refreshes the current language silently in the background.
   */
  async initializeData(lang: Language, onProgress?: SyncProgressCallback): Promise<void> {
    await this.initDB();
    if (await this.needsSync()) {
      await this.syncAllContent(onProgress);
    } else {
      // Refresh current language in the background — no await
      this.loadPOIsFromREST(lang).catch(() => {});
    }
  }
}

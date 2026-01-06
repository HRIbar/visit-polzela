import { openDB } from 'idb';
import { POI, POITitle, Language } from '../types/POI';

const DB_NAME = 'visit-polzela';
const POI_STORE = 'pois';
const TITLES_STORE = 'titles';
const DATA_VERSION = 7; // Increment this to force reload of POIs
const VERSION_KEY = 'data-version';

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
      this.db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(POI_STORE)) {
            db.createObjectStore(POI_STORE, { keyPath: 'name' });
          }
          if (!db.objectStoreNames.contains(TITLES_STORE)) {
            db.createObjectStore(TITLES_STORE, { keyPath: 'name' });
          }
        },
      });
    }
    return this.db;
  }

  async loadPOIsFromStatic(): Promise<POI[]> {
    try {
      const response = await fetch('/pointsofinterest/pois.txt');
      const text = await response.text();
      const lines = text.trim().split('\n');

      const pois: POI[] = lines.map((line, index) => {
        const parts = line.split(';');
        return {
          name: parts[0],
          displayName: parts[1],
          description: parts[2],
          imagePath: `/images/${parts[0]}.webp`,
          mapUrl: parts[3],
          navigationUrl: parts[4],
          appleNavigationUrl: parts[5] || parts[4],
          order: index
        };
      });

      // Store in IndexedDB for offline access
      const db = await this.initDB();
      const tx = db.transaction(POI_STORE, 'readwrite');
      for (const poi of pois) {
        await tx.store.put(poi);
      }
      await tx.done;

      return pois;
    } catch (error) {
      console.error('Error loading POIs from static file:', error);
      // Fallback to IndexedDB
      return this.getPOIsFromDB();
    }
  }

  async loadTitlesFromStatic(): Promise<POITitle[]> {
    try {
      const response = await fetch('/pointsofinterest/poititles.txt');
      const text = await response.text();
      const lines = text.trim().split('\n');

      const titles: POITitle[] = lines.map(line => {
        const parts = line.split(';');
        const title: POITitle = {
          name: parts[0],
          en: '',
          sl: '',
          de: '',
          nl: ''
        };

        // Parse language-specific titles
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();
          if (part.startsWith('EN:')) {
            title.en = part.substring(3);
          } else if (part.startsWith('SL:')) {
            title.sl = part.substring(3);
          } else if (part.startsWith('DE:')) {
            title.de = part.substring(3);
          } else if (part.startsWith('NL:')) {
            title.nl = part.substring(3);
          }
        }

        return title;
      });

      // Store in IndexedDB for offline access
      const db = await this.initDB();
      const tx = db.transaction(TITLES_STORE, 'readwrite');
      for (const title of titles) {
        await tx.store.put(title);
      }
      await tx.done;

      return titles;
    } catch (error) {
      console.error('Error loading titles from static file:', error);
      // Fallback to IndexedDB
      return this.getTitlesFromDB();
    }
  }

  async getPOIsFromDB(): Promise<POI[]> {
    const db = await this.initDB();
    return db.getAll(POI_STORE);
  }

  async getTitlesFromDB(): Promise<POITitle[]> {
    const db = await this.initDB();
    return db.getAll(TITLES_STORE);
  }

  async getPOIByName(name: string): Promise<POI | undefined> {
    const db = await this.initDB();
    return db.get(POI_STORE, name);
  }

  async getPOIsWithLocalizedTitles(language: Language): Promise<POI[]> {
    const [pois, titles] = await Promise.all([
      this.getPOIsFromDB(),
      this.getTitlesFromDB()
    ]);

    return pois
      .sort((a, b) => a.order - b.order)
      .map(poi => {
        const title = titles.find(t => t.name === poi.name);
        if (title) {
          const langKey = language.toLowerCase() as keyof Omit<POITitle, 'name'>;
          return {
            ...poi,
            displayName: title[langKey] || title.en || poi.displayName
          };
        }
        return poi;
      });
  }

  async getLocalizedText(key: string, language: Language): Promise<string> {
    const titles = await this.getTitlesFromDB();
    const title = titles.find(t => t.name === key);

    if (title) {
      const langKey = language.toLowerCase() as keyof Omit<POITitle, 'name'>;
      return title[langKey] || title.en || key;
    }

    return key;
  }

  async initializeData(): Promise<void> {
    try {
      // Always reload titles to ensure we have the latest translations
      await this.loadTitlesFromStatic();

      // Check version in localStorage
      const storedVersion = localStorage.getItem(VERSION_KEY);
      const currentVersion = DATA_VERSION.toString();

      // Force reload if version changed or POIs are empty
      const pois = await this.getPOIsFromDB();
      if (storedVersion !== currentVersion || pois.length === 0) {
        console.log('[DataService] Reloading POIs due to version change or empty cache');
        // Load POI data from static files
        await this.loadPOIsFromStatic();
        // Update stored version
        localStorage.setItem(VERSION_KEY, currentVersion);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }
}

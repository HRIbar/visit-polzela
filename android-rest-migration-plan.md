# Android REST Migration Plan: Slim APK with On-Demand Caching

## Overview

Strip all POI images and data files out of the mobile Capacitor build so the APK contains
only the JS/CSS app shell (~5 MB instead of 54 MB). On first launch the app fetches
everything from `https://visit-polzela.com` REST endpoints and persists it locally —
IndexedDB for JSON data, Cache API for binary images. Subsequent launches are fully
offline-capable without a network connection.

## Root Cause

`vite.mobile.config.ts` previously set `publicDir` to the entire
`src/main/resources/META-INF/resources/` directory. All 50+ `.webp` images, POI
description `.txt` files, and legacy scripts were copied into the Vite build output.
Capacitor bundled everything under `webDir` (`target/classes/META-INF/resources`) into
the APK, bloating it to 54 MB.

---

## Steps (all implemented ✅)

### ✅ 1. Created `src/main/frontend/public-mobile/`

Contains **only** the static assets needed before any network call completes:

- `images/` — flag images, coat of arms, panorama hero, navigation button, placeholder
- `icons/` — all app icon sizes
- `manifest.webmanifest`, `favicon.ico`

`publicDir` in `vite.mobile.config.ts` now points to this directory. Web build unchanged.

### ✅ 2. Injected `VITE_API_BASE_URL` into `vite.mobile.config.ts`

`define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://visit-polzela.com') }`

`DataService.ts` reads `const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''` and
prepends it to every `fetch()`. Web build → `''` (relative paths); mobile → absolute URL.
TypeScript types declared in `src/main/frontend/vite-env.d.ts`.

### ✅ 3. Cache API image caching in `DataService.ts`

- `cacheImage(imagePath)` — fetches `BASE_URL + imagePath`, stores Response in `poi-images-v1` CacheStorage. No-ops if already cached.
- `getCachedImageUrl(imagePath)` — checks cache, returns blob object URL (memoised); falls back to `BASE_URL + imagePath`.

### ✅ 4. First-run bootstrap `syncAllContent()` in `DataService.ts`

Gated by `localStorage` key `poi_data_synced_v1`. On first launch:

1. `GET /api/pois?lang=*` × 4 languages → `poi_lang` IndexedDB store
2. `GET /api/pois/{key}?lang=*` per POI × 4 languages → full descriptions in `poi_lang`
3. `GET /api/pois/{key}/images` per POI → `cacheImage()` for each URL
4. `GET /api/texts?lang=*&keys=welcome,takeme` × 4 languages → `text_cache`
5. Sets `localStorage['poi_data_synced_v1'] = 'true'`

Emits `SyncProgressCallback(message, 0–100%)` throughout.

**Cache invalidation**: bump `DATA_VERSION` in `DataService.ts` (`'v1'` → `'v2'`) to
force a re-sync on all clients after a POI data update.

### ✅ 5. `<CachedImage>` component (`components/CachedImage.tsx`)

Resolves images via `getCachedImageUrl()` in a `useEffect`; shows placeholder while
resolving. Used in `MainView.tsx` (POI grid) and `POIDetailView.tsx` (main image + gallery).

### ✅ 6. Sync progress overlay in `MainView.tsx`

During first-run sync shows: animated 🗺️ icon, step message, animated progress bar,
percentage. Styled via `.sync-overlay` / `.sync-progress-bar` in `main-view-styles.css`.

### ✅ 7. Simplified `sw.js`

- Precaches app shell only (no POI images/descriptions)
- `/api/**` → network-first
- Everything else → cache-first
- Preserves `poi-images-v1` bucket across SW updates

### ✅ 8. `package.json` scripts

```
npm run build          → web build (vite.config.ts)
npm run build:web      → alias for above
npm run build:mobile   → vite build --config vite.mobile.config.ts
```

---

## Mobile Build Workflow

```bash
# 1. Build the slim app shell
npm run build:mobile

# 2. Sync to Android
npx cap sync android

# 3. Build APK
cd android && ./gradlew assembleRelease
```

On first launch the user sees the sync overlay while all POI data and images download
from https://visit-polzela.com. Every subsequent launch is fully offline-capable.

---

## Further Considerations

1. **Sync language scope** — all 4 languages sync on first launch. Alternative: sync
   only the selected language first, queue the rest lazily for faster first launch.

2. **Cache invalidation** — bump `DATA_VERSION` in `DataService.ts` (e.g. `v1` → `v2`)
   when POI content changes. The new `SYNC_FLAG_KEY` forces a re-sync on next launch.

3. **Capacitor network config** — `capacitor.config.ts` already uses
   `androidScheme: 'https'` and `cleartext: true`. No `network_security_config.xml`
   changes needed for HTTPS calls to `visit-polzela.com`.

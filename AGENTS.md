# AGENTS.md

## Big picture
- This repo is a hybrid of **Quarkus + Vaadin** packaging and a **React SPA** that is also wrapped by **Capacitor Android**.
- The **active UI** is the React app in `src/main/frontend/`; start with `index.tsx`, `routes.tsx`, `views/MainView.tsx`, and `views/POIDetailView.tsx`.
- Treat `src/main/java/com/example/starter/base/views/*.java` as **legacy Flow views kept for history**; both Java view files are explicitly commented as disabled.
- `vite.config.ts` exists for Vaadin/Quarkus integration, but the **mobile app build uses `vite.mobile.config.ts` instead** and writes to `target/classes/META-INF/resources/`.

## Data and offline flow
- Content is file-driven, not API-driven: `DataService.ts` fetches `/pointsofinterest/pois.txt`, `/pointsofinterest/poititles.txt`, and `/poi-descriptions/<poi>.txt`.
- `DataService.initializeData()` caches POIs/titles in IndexedDB (`visit-polzela`) and uses `DATA_VERSION` to force reloads. If seeded POI data changes, update the static files and usually bump `DATA_VERSION`.
- POI ordering comes from line order in `pois.txt`; titles/translations come from `poititles.txt`; descriptions are one file per POI under `src/main/resources/META-INF/resources/poi-descriptions/`.
- The service worker in `src/main/resources/META-INF/resources/sw.js` hardcodes a cache name and a long precache list. If you add/rename offline-critical assets or POI description files, update `sw.js` too.
- React routing is purely client-side (`/` and `/poi/:name` in `routes.tsx`); `sw.js` serves cached `/index.html` for offline navigation.

## Project conventions
- Language state is stored in `localStorage` under `selectedLanguage`; current React views do **not** use `LanguageContext.tsx`.
- Leaflet is loaded globally from CDN in `src/main/frontend/index.html` and used as `window.L` inside `POIDetailView.tsx`; do not convert it to a direct module import unless you update the app shell too.
- SEO is handled in React with `components/SEO.tsx` + `utils/seoHelpers.ts`; preserve this pattern for page-level metadata and JSON-LD.
- Static assets are served from `src/main/resources/META-INF/resources/` and referenced with root-relative URLs like `/images/...` and `/pointsofinterest/...`.
- Avoid editing generated/derived outputs unless the task is specifically about build tooling: `target/`, `src/main/frontend/generated/`, `vite.generated.ts`, `src/main/bundles/`, and `android/app/src/main/assets/public/`.
- Legacy offline scripts under `src/main/resources/META-INF/resources/frontend/*.js` and `.../js/offline-store.js` belong to the older Flow/offline path; prefer `src/main/frontend/services/DataService.ts` for current behavior.

## Build, debug, and release workflows
- **Mobile/default frontend workflow:** `npm run build:mobile` → builds with `vite.mobile.config.ts` and syncs Capacitor assets into `android/`.
- **Quick local verification for frontend changes:** `npm run build:frontend`; then inspect `target/classes/META-INF/resources/` for fresh `index.html` and `assets/index-*.js`.
- **Android packaging:** `npm run android:bundle` or `npm run deploy:prepare`; Capacitor reads `webDir` from `capacitor.config.ts`.
- **Quarkus web dev/prod path:** `mvnw quarkus:dev` for local server, `mvnw package -Pproduction` for Vaadin production packaging.
- For Android/mobile work, prefer the npm scripts from `package.json`; `BUILD_GUIDE.md` explicitly warns not to rely on raw Maven/Vaadin builds for that path.
- If builds look stale or WebView loads old files, the documented fix is `npm run clean` then `npm run build:mobile`; also verify synced files in `android/app/src/main/assets/public/`.
- There are no obvious automated tests under `src/`; for most changes, the practical validation is a successful frontend build (mobile path) or Maven package (Quarkus path).

## Integration points worth checking before edits
- `capacitor.config.ts` and `android/app/build.gradle` control Android app ID, web asset sync, release settings, and versioning.
- `application.properties` disables Vaadin PWA mode (`vaadin.pwa.enabled=false`) even though `AppShell.java` still exists; keep that split in mind when changing PWA/offline behavior.


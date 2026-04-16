# Copilot Instructions

- Work in the active React app under `src/main/frontend/`; start from `index.tsx`, `routes.tsx`, `views/MainView.tsx`, and `views/POIDetailView.tsx`.
- Treat `src/main/java/com/example/starter/base/views/*.java` as legacy Flow history. Do not edit those files unless the task is explicitly about the old Vaadin UI.
- For mobile/frontend changes, follow the standalone Vite path in `vite.mobile.config.ts`, not the Vaadin build in `vite.config.ts`.
- Prefer the npm workflow from `package.json`: `npm run build:frontend` for quick verification and `npm run build:mobile` when Android assets need syncing.
- Keep routing client-side in `src/main/frontend/routes.tsx` with `/` and `/poi/:name`; do not reintroduce Flow server-side routes for the current app.
- Use `src/main/frontend/services/DataService.ts` for POI data access and caching. This app is file-driven, not API-driven.
- POI seed data comes from `src/main/resources/META-INF/resources/pointsofinterest/pois.txt`, `poititles.txt`, and `poi-descriptions/*.txt`. Preserve this structure.
- When changing seeded POI or translation data, usually also bump `DATA_VERSION` in `DataService.ts` so IndexedDB reloads the content.
- If you add or rename offline-critical assets or POI description files, update `src/main/resources/META-INF/resources/sw.js` because its precache list and cache name are hardcoded.
- Persist the selected language in `localStorage` under `selectedLanguage`; current React views do not use `contexts/LanguageContext.tsx`.
- Keep Leaflet loaded globally from the CDN in `src/main/frontend/index.html` and accessed as `window.L` in `POIDetailView.tsx` unless the app shell is updated too.
- Preserve the SEO pattern built around `src/main/frontend/components/SEO.tsx` and `src/main/frontend/utils/seoHelpers.ts` for metadata and JSON-LD.
- Reference static assets with root-relative URLs such as `/images/...`, `/pointsofinterest/...`, and `/poi-descriptions/...`.
- Do not edit generated or synced outputs unless the task is specifically about build tooling: `target/`, `src/main/frontend/generated/`, `vite.generated.ts`, `src/main/bundles/`, and `android/app/src/main/assets/public/`.
- Legacy offline scripts under `src/main/resources/META-INF/resources/frontend/*.js` and `src/main/resources/META-INF/resources/js/offline-store.js` belong to the older Flow path; prefer the React/TypeScript implementation for current work.


# AGENTS.md — Visit Polzela Codebase Guide

## Architecture Overview

This is a **Quarkus 3.20.0** app whose UI is a pure **React 18 + TypeScript** SPA.
Vaadin has been fully removed. The React app is bundled by standalone **Vite** and served as
static resources by Quarkus. POI data is delivered through Quarkus REST endpoints.

```
Browser → Quarkus (port 8080)
            ├─ /api/**        REST endpoints (JSON)
            └─ /**            Static files (Vite-built SPA + images)
```

- **Two routes only**: `/` (`MainView.tsx`) and `/poi/:name` (`POIDetailView.tsx`)
- **REST API**: POI data is fetched from Quarkus REST endpoints (no more flat-file fetches)
- **Offline-first**: Service worker + IndexedDB cache REST responses for offline use

---

## Developer Workflows

**Option A — Dev mode with pre-built frontend:**
```bash
npm install && npm run build    # build Vite bundle into META-INF/resources/
mvnw quarkus:dev                # Windows — serves REST + built assets on http://localhost:8080
./mvnw quarkus:dev              # Mac/Linux
```
Re-run `npm run build` (alias `npm run build:web`) after frontend changes.

**Option B — Full hot reload (Vite HMR + Quarkus live reload):**
```bash
# Terminal 1
mvnw quarkus:dev        # REST API on http://localhost:8080

# Terminal 2
npm run dev             # Vite HMR dev server on http://localhost:5173
```
Open **http://localhost:5173**. Vite proxies `/api/*` to Quarkus.

**Production build:**
```bash
mvnw package -DskipTests
java -jar target/visit-polzela-1.0-runner.jar
```

**Docker:**
```bash
docker build -t visit-polzela .
docker run -p 8080:8080 visit-polzela
```

**Mobile (Android/Capacitor):**
```bash
npm run build:frontend   # builds with vite.mobile.config.ts — quick verify, no Capacitor sync
npm run build:mobile     # builds with vite.mobile.config.ts + runs `npx cap sync android`
npm run cap:open         # opens Android Studio
cd android && ./gradlew bundleRelease   # or: npm run android:bundle
```
`vite.mobile.config.ts` differs from `vite.config.ts` in two key ways:
- `publicDir` → `src/main/frontend/public-mobile/` (only UI-chrome assets ship in the APK)
- Injects `VITE_API_BASE_URL=https://visit-polzela.com` so `DataService` prefixes all fetch calls with the remote origin instead of a relative path.

See `BUILD_SYSTEM_PRODUCTION_MVN.md` for the detailed pipeline.

---

## Data Architecture

### Static content (still in `src/main/resources/META-INF/resources/`)

| File | Format | Purpose |
|------|--------|---------|
| `pointsofinterest/pois.txt` | `;`-delimited | POI records read **server-side** by `POIService.java` |
| `pointsofinterest/poititles.txt` | `;`-delimited | Localized titles + UI strings, read **server-side** |
| `poi-descriptions/[key].txt` | Line-prefixed | Long descriptions, read **server-side** per `lang` |
| `images/[key].webp` | WebP | Served as static files; URLs returned by `/api/pois/{key}/images` |

### REST data flow

```
pois.txt + poititles.txt + poi-descriptions/*.txt
  → POIService.java (parses, merges, caches in memory)
    → POIResource.java / TextResource.java (JAX-RS)
      → /api/** (JSON responses)
        → DataService.ts (fetch + IndexedDB cache)
          → React state
```

The singleton `DataService` (`services/DataService.ts`) is the only data access layer.
Call `DataService.getInstance()` everywhere.

### REST endpoints

| Endpoint | Returns |
|----------|---------|
| `GET /api/pois?lang=EN` | All POIs (localized, no long description) |
| `GET /api/pois/{key}?lang=EN` | Single POI with full description |
| `GET /api/pois/{key}/images` | `{ imageUrls: string[] }` |
| `GET /api/texts?lang=EN&keys=welcome,takeme` | `{ texts: Record<string,string> }` |

---

## Internationalization Pattern

Supported languages: `EN | SL | DE | NL` (type `Language` in `types/POI.ts`).

- **Localization is server-side**: pass `?lang=XX` to any `/api/pois` or `/api/texts` endpoint.
- **Language persistence**: `localStorage.setItem('selectedLanguage', lang)` — read on component mount.
- **UI strings**: fetched via `dataService.getLocalizedTexts(language, ['welcome', 'takeme'])`.

To add a new UI string: append a line to `poititles.txt` and call
`dataService.getLocalizedTexts(lang, ['newkey'])`.

---

## Adding a New POI

1. Append to `pois.txt`: `poikey;Display Name;Short desc;osmUrl;googleMapsUrl;appleMapsUrl`
2. Append to `poititles.txt`: `poikey;EN:…;SL:…;DE:…;NL:…`
3. Create `poi-descriptions/poikey.txt` with `EN:`, `SL:`, `DE:`, `NL:` prefixed lines
4. Add `images/poikey.webp` (main) and optionally `poikey1-3.webp` (gallery)
5. Restart Quarkus (dev mode reloads automatically; production requires redeploy)

POI display order is determined by line order in `pois.txt`.

---

## Key Conventions

- **Leaflet is loaded globally** (not bundled). `POIDetailView.tsx` accesses it as `(window as any).L` — do not import Leaflet directly.
- **`vite.config.ts` is a standalone config** — `vite.generated.ts` no longer exists. Do not reference it.
- **`CachedImage` component**: use `<CachedImage src={url} alt={...} />` for all POI images. It resolves URLs from the Cache API first (offline), falling back to remote. Uses `/images/placeholder.png` while resolving. Do not use plain `<img>` tags for POI images.
- **SEO**: use the `<SEO>` component (`components/SEO.tsx`) with `react-helmet-async` and structured data helpers from `utils/seoHelpers.ts`.
- **Styles**: per-view CSS files in `styles/`; max content width is 800px; responsive breakpoints at 768px and 480px.
- **No tests** currently exist in the project.

---

## Key Files

| Path | Role |
|------|------|
| `src/main/frontend/services/DataService.ts` | All REST calls, IndexedDB offline cache, i18n lookup |
| `src/main/frontend/types/POI.ts` | `POI`, `Language` types |
| `src/main/frontend/components/CachedImage.tsx` | Offline-capable image renderer; resolves via Cache API, falls back to remote |
| `src/main/frontend/views/MainView.tsx` | Home page — POI grid + language switcher |
| `src/main/frontend/views/POIDetailView.tsx` | Detail page — map, gallery, navigation buttons |
| `src/main/java/.../resource/POIResource.java` | REST: `/api/pois`, `/api/pois/{key}`, `/api/pois/{key}/images` |
| `src/main/java/.../resource/TextResource.java` | REST: `/api/texts` |
| `src/main/java/.../services/POIService.java` | Server-side: parses pois.txt, poititles.txt, descriptions |
| `src/main/java/.../dto/POIDto.java` | DTO returned by `/api/pois` endpoints |
| `src/main/java/.../entity/PointOfInterest.java` | Internal POI domain object used by `POIService` |
| `src/main/resources/META-INF/resources/` | All static content (POI data files, images, SW, manifest) |
| `src/main/resources/application.properties` | Quarkus config (`PORT` env var, über-jar, static paths, CORS) |
| `vite.config.ts` | Standalone Vite config (root, outDir, dev proxy) |
| `vite.mobile.config.ts` | Mobile Vite config (public-mobile publicDir, VITE_API_BASE_URL injection) |
| `BUILD_SYSTEM_PRODUCTION_MVN.md` | Full build pipeline documentation |

## Codemap
Use codemap.md to quickly search for specific code locations, e.g. "Where is the POI REST endpoint implemented?" or "Where are the Vite build outputs configured?".

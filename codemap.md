# Visit Polzela — Structural Map

| | |
|---|---|
| **Java** | 17 |
| **Framework** | Quarkus 3.20.0 |
| **Base package** | `com.example.starter.base` |
| **Frontend** | React 18 + TypeScript SPA (standalone Vite build) |

> **Architecture:** Vaadin has been fully removed. The Java layer exposes a REST API
> (`/api/**`) and serves the Vite-built SPA as static files. All POI data flows from flat
> text files through `POIService.java` → JAX-RS resources → JSON → `DataService.ts` → React.

---

## Java Package Tree

```
com.example.starter.base/
├── Application.java          @QuarkusMain entry point
├── dto/
│   ├── POIDto.java           JSON response: name, displayName, shortDescription, description, imagePath, order, mapUrl, navigationUrl, appleNavigationUrl
│   ├── POIImagesDto.java     JSON response: poiName, imageUrls[]
│   └── LocalizedTextDto.java JSON response: texts{key→value}
├── entity/
│   └── PointOfInterest.java  Internal POJO (no CDI scope)
├── resource/
│   ├── POIResource.java      GET /api/pois, /api/pois/{key}, /api/pois/{key}/images
│   └── TextResource.java     GET /api/texts
└── services/
    └── POIService.java       Parses pois.txt / poititles.txt / poi-descriptions/*.txt; caches in memory
```

---

## src/main/java/com/example/starter/base/Application.java

- Annotation: `@QuarkusMain`
- **Entry point** — delegates to `Quarkus.run(args)`

---

## src/main/java/com/example/starter/base/dto/POIDto.java

- Plain DTO (no CDI scope)
- Fields: `name`, `displayName`, `shortDescription`, `description`, `imagePath`, `order`, `mapUrl`, `navigationUrl`, `appleNavigationUrl`
- Serialized to JSON by `quarkus-rest-jackson`

---

## src/main/java/com/example/starter/base/dto/POIImagesDto.java

- Plain DTO
- Fields: `poiName`, `imageUrls` (`List<String>`)

---

## src/main/java/com/example/starter/base/dto/LocalizedTextDto.java

- Plain DTO
- Fields: `texts` (`Map<String, String>`)

---

## src/main/java/com/example/starter/base/entity/PointOfInterest.java

- Plain POJO — no CDI scope, no Vaadin dependencies
- Fields: `name`, `displayName`, `description`, `imagePath`, `mapUrl`, `navigationUrl`, `appleNavigationUrl`
- Kept for internal use; REST responses use `POIDto` instead

---

## src/main/java/com/example/starter/base/services/POIService.java

- Scope: `@ApplicationScoped`
- Internal cache: `Map<String, Map<String, String>> titlesCache` keyed by language code (`EN`, `SL`, `DE`, `NL`)
- Public methods:
  - `getLocalizedPOIsDto(String lang)` → `List<POIDto>` *(all POIs, no long description)*
  - `getLocalizedPOIDto(String key, String lang)` → `POIDto` *(single POI with full description)*
  - `getPOIImageUrls(String key)` → `List<String>` *(probes classpath for `{key}.webp`, `{key}1-3.webp`)*
  - `getLocalizedTexts(String lang, List<String> keys)` → `Map<String, String>` *(UI strings)*
- Data sources:
  - `/META-INF/resources/pointsofinterest/pois.txt` (`;`-delimited, 6 fields)
  - `/META-INF/resources/pointsofinterest/poititles.txt` (`;`-delimited, `LANG:value` segments)
  - `/META-INF/resources/poi-descriptions/{key}.txt` (`LANG:` line-prefixed)

---

## src/main/java/com/example/starter/base/resource/POIResource.java

- Scope: `@ApplicationScoped`
- Path: `/api/pois`
- Endpoints:
  - `GET /api/pois?lang=EN` → `List<POIDto>`
  - `GET /api/pois/{key}?lang=EN` → `POIDto` (or 404)
  - `GET /api/pois/{key}/images` → `POIImagesDto`

---

## src/main/java/com/example/starter/base/resource/TextResource.java

- Scope: `@ApplicationScoped`
- Path: `/api/texts`
- Endpoints:
  - `GET /api/texts?lang=EN&keys=welcome,takeme` → `LocalizedTextDto`

---

## Frontend Entry Points (TypeScript)

| File | Role |
|------|------|
| `src/main/frontend/index.tsx` | React app root; mounts `<RouterProvider router={router} />` |
| `src/main/frontend/routes.tsx` | `createBrowserRouter` — routes `/` and `/poi/:name` |
| `src/main/frontend/services/DataService.ts` | Singleton — REST calls, IndexedDB cache, offline fallback |
| `src/main/frontend/types/POI.ts` | `POI`, `Language` types |
| `src/main/frontend/views/MainView.tsx` | Route `/` — POI grid, language switcher |
| `src/main/frontend/views/POIDetailView.tsx` | Route `/poi/:name` — map, gallery, navigation |
| `src/main/frontend/components/CachedImage.tsx` | `<CachedImage>` — offline-capable image via Cache API |
| `src/main/frontend/components/SEO.tsx` | `<SEO>` — react-helmet-async wrapper |
| `src/main/frontend/utils/seoHelpers.ts` | `generateOrganizationSchema()`, `generatePOISchema()`, `generateBreadcrumbSchema()`, `generatePOIListSchema()` |

---

## src/main/frontend/types/POI.ts

- `POI` interface: `name`, `displayName`, `shortDescription`, `description` *(empty in list responses)*, `imagePath`, `mapUrl`, `navigationUrl`, `appleNavigationUrl`, `order`
- `Language` type: `'EN' | 'SL' | 'DE' | 'NL'`

---

## src/main/frontend/routes.tsx

- Uses `createBrowserRouter` from `react-router`
- Exports `router` (for `<RouterProvider>`) and `routes` array
- Two routes: `/` → `<MainView>`, `/poi/:name` → `<POIDetailView>`

---

## src/main/frontend/services/DataService.ts

- Singleton: `DataService.getInstance()`
- `BASE_URL` = `import.meta.env.VITE_API_BASE_URL || ''` — empty for web, `https://visit-polzela.com` for mobile
- `DATA_VERSION = 'v1'` — bump to force IndexedDB re-sync on all clients
- IndexedDB name: `visit-polzela` v3; stores:
  - `pois` — current-language list (keyed by `name`)
  - `poi_lang` — all languages; key = `${name}_${lang}` or `${name}_${lang}_full`
  - `text_cache` — UI strings; key = `${textKey}_${lang}`
  - `image_meta` — image URL lists; key = `poiKey`
- Cache API bucket: `poi-images-v1` (binary images as blob object URLs, memoised in `blobUrlCache`)
- Public methods:
  - `initializeData(lang, onProgress?)` — entry-point; runs full sync on first launch, background refresh otherwise
  - `syncAllContent(onProgress?)` — full offline bootstrap (all languages × all POIs × all images)
  - `loadPOIsFromREST(lang)` → `POI[]` — fetches list, updates `pois` + `poi_lang` stores
  - `getPOIFromREST(key, lang)` → `POI | null` — fetches detail, updates stores
  - `getLocalizedTexts(lang, keys)` → `Map<string,string>` — fetches UI strings, updates `text_cache`
  - `getPOIImages(key)` → `string[]` — fetches image URL list, updates `image_meta`
  - `cacheImage(imagePath)` — stores binary image in Cache API
  - `getCachedImageUrl(imagePath)` → `string` — resolves blob URL from cache, falls back to remote

---

## src/main/frontend/components/CachedImage.tsx

- Props: `src`, `alt`, `className?`, `loading?`, `onClick?`, `onError?`, `style?`
- On mount calls `dataService.getCachedImageUrl(src)` and sets resolved src; shows `/images/placeholder.png` while resolving
- **Always use `<CachedImage>` for POI images** — never plain `<img>` tags

---

## Build Configs

| File | `publicDir` | `VITE_API_BASE_URL` | `outDir` |
|------|-------------|---------------------|---------|
| `vite.config.ts` | `src/main/resources/META-INF/resources` | *(not set — relative paths)* | `src/main/resources/META-INF/resources` |
| `vite.mobile.config.ts` | `src/main/frontend/public-mobile/` | `https://visit-polzela.com` | `target/classes/META-INF/resources` |

- Both configs: `root` = `src/main/frontend`, Vite dev server proxies `/api/*` to `:8080`
- Mobile config sets `base: './'` for Capacitor's relative asset paths
- Manual chunks: `vendor` (react, react-dom, react-router-dom), `idb`

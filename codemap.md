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

## Frontend Entry Points (TypeScript — for cross-reference)

| File | Role |
|------|------|
| `src/main/frontend/services/DataService.ts` | Singleton — REST calls, IndexedDB cache, offline fallback |
| `src/main/frontend/types/POI.ts` | `POI`, `Language` types |
| `src/main/frontend/views/MainView.tsx` | Route `/` — POI grid, language switcher |
| `src/main/frontend/views/POIDetailView.tsx` | Route `/poi/:name` — map, gallery, navigation |
| `src/main/frontend/components/SEO.tsx` | `<SEO>` — react-helmet-async wrapper |
| `src/main/frontend/utils/seoHelpers.ts` | `generateOrganizationSchema()`, `generatePOISchema()`, `generateBreadcrumbSchema()`, `generatePOIListSchema()` |

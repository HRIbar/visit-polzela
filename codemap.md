# Visit Polzela — Structural Map

| | |
|---|---|
| **Java** | 17 |
| **Framework** | Quarkus 3.20.0 + Vaadin Flow 24.7.6 |
| **Base package** | `com.example.starter.base` |
| **Frontend** | React 18 + TypeScript SPA (Vaadin used as build harness only) |

> **⚠️ Architecture note:** The Vaadin Flow Java views (`MainView.java`, `POIDetailView.java`) are **disabled** — their `@Route` annotations are commented out. The active UI is the React SPA in `src/main/frontend/`. The Java layer exists only to run Quarkus (static file serving) and retain historical reference implementations.

---

## No Constants, Utils, or REST Resource classes found

The packages `utils`, `constants`, `common`, and `api/resource` do not exist in this codebase.  
There are **no `TimeUtil`**, **no `Constants` class**, and **no REST endpoints** — cross-service integration is handled entirely client-side via flat text files and IndexedDB.

---

## src/main/java/com/example/starter/base/Application.java

- Annotation: `@QuarkusMain`
- **Entry point** — delegates to `Quarkus.run(args)`

---

## src/main/java/com/example/starter/base/AppShell.java

- Implements: `AppShellConfigurator`
- Annotation: `@PWA(name="Visit Polzela Progressive Web Application", manifestPath="manifest.json")`
- Inlines `META-INF/resources/sw-register.js` into every page as a script block
- Note: `vaadin.pwa.enabled=false` in `application.properties` overrides the built-in PWA; `sw.js` in `META-INF/resources/` is the active service worker

---

## src/main/java/com/example/starter/base/config/CustomBootstrapListener.java

- Implements: `VaadinServiceInitListener`
- `serviceInit(ServiceInitEvent)` → `void` *(stub — no custom logic)*

---

## src/main/java/com/example/starter/base/config/MapConfig.java

- Scope: `@ApplicationScoped`
- CDI producer:
  - `createComponentRegistry()` → `LComponentManagementRegistry` *(produces `LDefaultComponentManagementRegistry` bound to `UI.getCurrent().getElement()`)*

---

## src/main/java/com/example/starter/base/entity/PointOfInterest.java

- Plain POJO — no CDI scope
- Fields: `name`, `displayName`, `description`, `imagePath`, `mapUrl`, `navigationUrl`, `appleNavigationUrl`
- Notable public methods (non-boilerplate):
  - `getImageResource()` → `StreamResource` *(loads `/META-INF/resources/images/{imagePath}` from classpath as a Vaadin stream)*

---

## src/main/java/com/example/starter/base/services/POIService.java

- Scope: `@ApplicationScoped`
- Injects: `OfflineStorageService`
- Internal cache: `Map<String, Map<String, String>> titlesCache` keyed by language code (`EN`, `SL`, `DE`, `NL`)
- Public methods:
  - `getPointsOfInterest()` → `List<PointOfInterest>` *(delegates to English locale)*
  - `getPointsOfInterest(Locale)` → `List<PointOfInterest>` *(reads `pois.txt`, merges localized titles from `poititles.txt`)*
- Data source: `/META-INF/resources/pointsofinterest/pois.txt` (`;`-delimited, 6 fields per line)
- Title source: `/META-INF/resources/pointsofinterest/poititles.txt` (`;`-delimited, `LANG:value` segments)

---

## src/main/java/com/example/starter/base/services/OfflineStorageService.java

- Scope: `@ApplicationScoped`
- Bridges Java POI data into browser IndexedDB via `UI.getCurrent().getPage().executeJs()`
- IDB database name (in JS): `visit-polzela-db`, object store: `pois` (keyPath: `id`)
- **Note:** This service is distinct from the active frontend path. The React SPA uses its own `DataService.ts` writing to IndexedDB DB `visit-polzela` (store `pois`, keyPath: `name`). These are **two separate databases**.
- Public methods:
  - `storePOIs(List<PointOfInterest>)` → `void`
  - `getPOIs()` → `PendingJavaScriptResult`
  - `isOnline()` → `PendingJavaScriptResult`

---

## src/main/java/com/example/starter/base/views/MainView.java *(DISABLED)*

- `@Route` is **commented out** — not registered, not reachable
- Extends: `AppLayout`
- Injects: `POIService`
- Calls `OfflineStorageService` (via inline JS) and `POIService.getPointsOfInterest(Locale)` on language flag click
- Kept as historical reference for the original Vaadin Flow implementation

---

## src/main/java/com/example/starter/base/views/POIDetailView.java *(DISABLED)*

- `@Route("poi")` is **commented out** — not registered, not reachable
- Extends: `AppLayout`, implements `HasUrlParameter<String>`
- Annotations: `@JavaScript("https://unpkg.com/leaflet@1.7.1/...")`, `@StyleSheet(...)`, `@PreserveOnRefresh`
- Injects: `POIService`, `LComponentManagementRegistry`
- `setParameter(BeforeEvent, String)` → `void` *(route handler — builds the detail page for a given POI key)*
- Notable internal methods (public-facing surface):
  - *(none — all helpers are private)*
- Map coordinates parsed from OSM URL: last two path segments = `lat/lng`
- Kept as historical reference for the original Vaadin Flow implementation

---

## Frontend Entry Points (TypeScript — for cross-reference)

| File | Role |
|------|------|
| `src/main/frontend/services/DataService.ts` | Singleton — all data fetch, parse, IndexedDB read/write, i18n lookup |
| `src/main/frontend/types/POI.ts` | `POI`, `POITitle`, `Language` types |
| `src/main/frontend/views/MainView.tsx` | Route `/` — POI grid, language switcher |
| `src/main/frontend/views/POIDetailView.tsx` | Route `/poi/:name` — map, gallery, navigation |
| `src/main/frontend/components/SEO.tsx` | `<SEO>` — react-helmet-async wrapper |
| `src/main/frontend/utils/seoHelpers.ts` | `generateOrganizationSchema()`, `generatePOISchema()`, `generateBreadcrumbSchema()`, `generatePOIListSchema()` |


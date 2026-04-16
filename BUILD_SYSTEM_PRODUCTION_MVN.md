# Build System: Quarkus REST + Standalone Vite (post-Vaadin)

This project is a **Quarkus 3.20.0** application with a **React 18 + TypeScript** SPA frontend.
Vaadin has been fully removed. Maven is the top-level build tool: it compiles Java, runs the
Node/Vite frontend build via `frontend-maven-plugin`, and packages everything into a single
über-jar served by Quarkus.

---

## Architecture overview

```
Browser
  │
  ▼
Quarkus (port 8080)
  ├─ GET /api/pois?lang=EN          → POIResource.java  (JSON)
  ├─ GET /api/pois/{key}?lang=EN    → POIResource.java  (JSON, full description)
  ├─ GET /api/pois/{key}/images     → POIResource.java  (JSON, image URL list)
  ├─ GET /api/texts?lang=EN&keys=…  → TextResource.java (JSON, UI strings)
  └─ GET /**                        → static files from META-INF/resources/
       ├─ index.html + assets/      (Vite-built React SPA)
       ├─ images/                   (POI WebP images)
       ├─ pointsofinterest/         (pois.txt, poititles.txt — read by Java)
       ├─ poi-descriptions/         (per-POI description files — read by Java)
       ├─ sw.js                     (custom service worker)
       └─ manifest.webmanifest      (PWA manifest)
```

**Key inputs:**

| File | Role |
|------|------|
| `pom.xml` | Maven build — Quarkus plugin + `frontend-maven-plugin` |
| `package.json` | npm deps (React, Vite, TypeScript, idb, react-router) |
| `vite.config.ts` | Standalone Vite config — root, outDir, dev proxy |
| `src/main/frontend/` | React + TypeScript source |
| `src/main/resources/META-INF/resources/` | Static assets (images, POI data, SW, manifest) |
| `src/main/resources/application.properties` | Quarkus config |

---

## Developer workflows

### Option A — Quarkus dev mode only (simplest)

Run a full Maven build first to produce the frontend bundle, then start Quarkus:

```bash
# Windows
npm install
npm run build          # Vite outputs to src/main/resources/META-INF/resources
mvnw quarkus:dev       # Quarkus serves REST + built static files on http://localhost:8080

# Mac/Linux
npm install
npm run build
./mvnw quarkus:dev
```

After that, Java changes hot-reload automatically. For frontend changes, re-run `npm run build`
in a second terminal (no page refresh needed for Quarkus dev — it serves whatever is in the
resources directory).

### Option B — Vite dev server + Quarkus (full hot reload)

Run both servers simultaneously for instant frontend HMR:

```bash
# Terminal 1 — Quarkus REST API on port 8080
mvnw quarkus:dev       # Windows
./mvnw quarkus:dev     # Mac/Linux

# Terminal 2 — Vite dev server on port 5173
npm run dev
```

Open **http://localhost:5173** in your browser.

- Vite serves the React app with HMR.
- `/api/*` requests are proxied to Quarkus on port 8080 (configured in `vite.config.ts`).
- Static assets (images, icons, etc.) are served by Vite from `src/main/resources/META-INF/resources/`
  because `vite.config.ts` sets `publicDir` to that directory in `serve` mode.

> **HTTPS note:** Quarkus dev mode uses HTTP on port 8080 (no SSL cert required for local dev).
> If you need HTTPS locally, configure it in `application.properties`.

---

## Production build

### Standard Maven build

```bash
# Windows
mvnw package -DskipTests

# Mac/Linux
./mvnw package -DskipTests

# Run the output jar
java -jar target/visit-polzela-1.0-runner.jar
```

With the `-Pproduction` profile (optional — same steps, profile exists as a placeholder):

```bash
mvnw package -Pproduction -DskipTests
```

### What Maven does, step by step

#### 1. `generate-resources` phase — Node.js + npm install

`frontend-maven-plugin` runs two executions:

1. **`install-node-and-npm`** — downloads Node.js `v18.20.4` and npm `10.7.0` into the local
   `node/` directory (skipped on subsequent builds if already present).
2. **`npm install`** — installs packages listed in `package.json` into `node_modules/`.

Both are bound to `generate-resources` so they complete before any Java or frontend compilation.

#### 2. `process-resources` phase — copy Java resources

Maven copies `src/main/resources/**` → `target/classes/**`.

At this point `target/classes/META-INF/resources/` already contains the static assets
(images, POI data, sw.js, manifest, etc.) but **not yet** the Vite-built frontend bundle.

#### 3. `compile` phase — Vite build + Java compilation

Two things happen in the `compile` phase:

**3a. `npm run build`** (via `frontend-maven-plugin`):

```
vite build
  root  = src/main/frontend/
  outDir = src/main/resources/META-INF/resources/   (absolute path)
  emptyOutDir = false
```

Vite produces:
- `src/main/resources/META-INF/resources/index.html` — the SPA shell
- `src/main/resources/META-INF/resources/assets/` — hashed JS + CSS bundles

`emptyOutDir: false` ensures existing static files (images, sw.js, etc.) are **not deleted**.

> **Important:** The Vite output lands directly in the Maven resource directory. The next Maven
> resource-copy phase will pick it up automatically and include it in `target/classes/META-INF/resources/`.

**3b. Java compilation** (`maven-compiler-plugin`):

`src/main/java/**` → `target/classes/**`

Only four package trees remain after the Vaadin removal:
- `com.example.starter.base.Application` — Quarkus entry point
- `com.example.starter.base.dto` — `POIDto`, `POIImagesDto`, `LocalizedTextDto`
- `com.example.starter.base.resource` — `POIResource`, `TextResource` (JAX-RS)
- `com.example.starter.base.services` — `POIService`
- `com.example.starter.base.entity` — `PointOfInterest` (internal POJO)

#### 4. `package` phase — Quarkus über-jar

`quarkus-maven-plugin` runs augmentation and packages everything into a single runnable JAR:

```
target/visit-polzela-1.0-runner.jar
```

This jar contains:
- Compiled Java classes
- Quarkus runtime bootstrap
- `META-INF/resources/**` — all static assets **including** the Vite-built frontend bundle

---

## Docker build

```bash
docker build -t visit-polzela .
docker run -p 8080:8080 visit-polzela
```

The `Dockerfile` does:

1. Copies `pom.xml` + `package.json` → pre-fetches Java deps with `dependency:go-offline`.
2. Copies `src/` → runs `mvn package -DskipTests` which drives the full pipeline above
   (Node download → npm install → Vite build → Quarkus package) inside the container.
3. Copies only the über-jar into a minimal `distroless/java17` runtime image.

---

## Key configuration files

### `vite.config.ts`

```typescript
root: 'src/main/frontend'          // Entry HTML and TS sources
publicDir: (dev only)              // In serve mode: serves META-INF/resources as static
  path.resolve(..., 'src/main/resources/META-INF/resources')
build.outDir:                      // Outputs index.html + assets/ here
  path.resolve(..., 'src/main/resources/META-INF/resources')
build.emptyOutDir: false           // Never delete existing images/sw.js/etc.
server.proxy['/api']:              // Proxies REST calls to Quarkus:8080 in dev
  'http://localhost:8080'
```

### `package.json` scripts

| Script | Command | Use |
|--------|---------|-----|
| `npm run dev` | `vite` | Vite dev server on port 5173 (Option B) |
| `npm run build` | `vite build` | Production bundle → `META-INF/resources/` |
| `npm run preview` | `vite preview` | Preview the production build locally |

### `application.properties`

```properties
quarkus.http.port=${PORT:8080}
quarkus.http.static-resources.enabled=true
quarkus.http.static-resources.paths=META-INF/resources   # serves Vite output + images
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:5173           # for Vite dev server (Option B)
%prod.quarkus.package.jar.type=uber-jar
quarkus.package.jar.type=uber-jar
```

---

## REST API reference

All endpoints return `application/json` and accept an optional `?lang=` query parameter
(`EN` | `SL` | `DE` | `NL`, defaults to `EN`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/pois?lang=EN` | All POIs — localized `displayName` + `shortDescription`, no long description |
| `GET` | `/api/pois/{key}?lang=EN` | Single POI — full localized description included |
| `GET` | `/api/pois/{key}/images` | Available image URLs (`/images/{key}.webp`, `…1.webp` … `…3.webp`) |
| `GET` | `/api/texts?lang=EN&keys=welcome,takeme` | Localized UI strings from `poititles.txt` |

---

## Adding a new POI (no rebuild needed for data changes)

Data changes only require updating flat files — no code change, no rebuild:

1. Append to `src/main/resources/META-INF/resources/pointsofinterest/pois.txt`
2. Append to `src/main/resources/META-INF/resources/pointsofinterest/poititles.txt`
3. Create `src/main/resources/META-INF/resources/poi-descriptions/{key}.txt`
4. Add `src/main/resources/META-INF/resources/images/{key}.webp` (+ optional gallery images)

In dev mode Quarkus picks up resource changes on the fly. In production a redeploy is needed
(the files are embedded in the über-jar).

---

## Routing and the SPA fallback

Because the frontend uses React Router with browser-history paths (`/poi/:name`), the server
must return `index.html` for any unknown path so the client-side router can take over.

Quarkus's `quarkus-rest` extension serves `index.html` from `META-INF/resources/` for all
unmatched routes when static resource serving is enabled. If you observe 404s on direct URL
access, add an explicit catch-all in a JAX-RS resource that serves `index.html`.

---

## Quick mental model (one-liner)

`mvn package -DskipTests` = download Node → `npm install` → `vite build` (outputs to `META-INF/resources/`) → compile Java → Quarkus augments + packages all into `target/visit-polzela-1.0-runner.jar`.

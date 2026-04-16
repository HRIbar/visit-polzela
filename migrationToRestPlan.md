# Migration Plan: Remove Vaadin, Serve POI Data via Quarkus REST

## Overview

This plan details the complete removal of Vaadin from the Visit Polzela application and the introduction of a REST-based API for serving POI data. The frontend will transition from fetching static text files to consuming Quarkus REST endpoints, and the build system will shift from Vaadin's Maven plugin to a standalone Vite build.

**Current State:** Quarkus 3.20.0 + Vaadin Flow 24 (used as build harness only) + React 18 SPA with file-based data loading.

**Target State:** Quarkus 3.20.0 + React 18 SPA with REST API for POI data and standalone Vite build.

---

## Step 1: Create Quarkus REST Resource Layer

### 1.1 Add Dependencies to `pom.xml`

**Add:**
- `quarkus-rest-jackson` — JAX-RS REST framework with JSON serialization
- No additional CORS dependency is required — configure `quarkus.http.cors.*` properties for the dev Vite proxy
- Remove: `vaadin-bom`, `vaadin-quarkus-extension`, `vaadin-core`, `flow-server`, `vaadin-maps-leaflet-flow`
- Remove: Entire `vaadin-maven-plugin` execution

**In `<dependencyManagement>`:**
```xml
<!-- Remove or update to exclude Vaadin -->
```

**In `<dependencies>`:**
```xml
<!-- Add -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-jackson</artifactId>
</dependency>

<!-- Remove -->
<!-- vaadin-bom, vaadin-quarkus-extension, vaadin-core, flow-server, vaadin-maps-leaflet-flow, jboss-logmanager -->
```

### 1.2 Create REST DTOs

**File:** `src/main/java/com/example/starter/base/dto/POIDto.java`
```java
package com.example.starter.base.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class POIDto {
    public String name;
    public String displayName;
    public String shortDescription;
    public String description;
    public String imagePath;
    public int order;
    public String mapUrl;
    public String navigationUrl;
    public String appleNavigationUrl;

    public POIDto(String name, String displayName, String shortDescription, String description,
                  String imagePath, int order, String mapUrl, String navigationUrl, String appleNavigationUrl) {
        this.name = name;
        this.displayName = displayName;
        this.shortDescription = shortDescription;
        this.description = description;
        this.imagePath = imagePath;
        this.order = order;
        this.mapUrl = mapUrl;
        this.navigationUrl = navigationUrl;
        this.appleNavigationUrl = appleNavigationUrl;
    }
}
```

**File:** `src/main/java/com/example/starter/base/dto/POIImagesDto.java`
```java
package com.example.starter.base.dto;

import java.util.List;

public class POIImagesDto {
    public String poiName;
    public List<String> imageUrls;

    public POIImagesDto(String poiName, List<String> imageUrls) {
        this.poiName = poiName;
        this.imageUrls = imageUrls;
    }
}
```

**File:** `src/main/java/com/example/starter/base/dto/LocalizedTextDto.java`
```java
package com.example.starter.base.dto;

import java.util.Map;

public class LocalizedTextDto {
    public Map<String, String> texts;

    public LocalizedTextDto(Map<String, String> texts) {
        this.texts = texts;
    }
}
```

### 1.3 Refactor POIService to Support REST Responses

**File:** `src/main/java/com/example/starter/base/services/POIService.java`

Add methods:
- `getLocalizedPOIsDto(String lang)` — returns `List<POIDto>`
- `getLocalizedPOIDto(String key, String lang)` — returns single `POIDto` with full description
- `getPOIImageUrls(String key)` — returns `List<String>` of available image paths
- `getLocalizedTexts(String lang, List<String> keys)` — returns `Map<String, String>` of UI strings

Enhancements:
- Read descriptions from `poi-descriptions/{key}.txt` for each language
- Probe for gallery images (`{key}.webp`, `{key}1.webp`, `{key}2.webp`, `{key}3.webp`)
- Cache all parsed data in memory with a thread-safe map

### 1.4 Create POI REST Resource

**File:** `src/main/java/com/example/starter/base/resource/POIResource.java`

```java
package com.example.starter.base.resource;

import com.example.starter.base.dto.POIDto;
import com.example.starter.base.dto.POIImagesDto;
import com.example.starter.base.dto.LocalizedTextDto;
import com.example.starter.base.services.POIService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;

@Path("/api/pois")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class POIResource {

    @Inject
    POIService poiService;

    @GET
    public List<POIDto> getAllPOIs(@QueryParam("lang") @DefaultValue("EN") String lang) {
        return poiService.getLocalizedPOIsDto(lang);
    }

    @GET
    @Path("/{key}")
    public POIDto getPOI(@PathParam("key") String key, @QueryParam("lang") @DefaultValue("EN") String lang) {
        return poiService.getLocalizedPOIDto(key, lang);
    }

    @GET
    @Path("/{key}/images")
    public POIImagesDto getPOIImages(@PathParam("key") String key) {
        List<String> images = poiService.getPOIImageUrls(key);
        return new POIImagesDto(key, images);
    }
}
```

**File:** `src/main/java/com/example/starter/base/resource/TextResource.java`

```java
package com.example.starter.base.resource;

import com.example.starter.base.dto.LocalizedTextDto;
import com.example.starter.base.services.POIService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;

@Path("/api/texts")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class TextResource {

    @Inject
    POIService poiService;

    @GET
    public LocalizedTextDto getLocalizedTexts(
            @QueryParam("lang") @DefaultValue("EN") String lang,
            @QueryParam("keys") String keysParam) {
        
        List<String> keys = keysParam != null ? List.of(keysParam.split(",")) : List.of();
        Map<String, String> texts = poiService.getLocalizedTexts(lang, keys);
        return new LocalizedTextDto(texts);
    }
}
```

### 1.5 Update `application.properties`

```properties
# Remove or comment out:
# vaadin.pwa.enabled=false

# Add CORS if using Vite dev proxy (optional):
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:5173
quarkus.http.cors.methods=GET,OPTIONS
```

---

## Step 2: Delete Vaadin-Specific Java Classes

Remove the following files entirely:

1. `src/main/java/com/example/starter/base/AppShell.java`
2. `src/main/java/com/example/starter/base/config/CustomBootstrapListener.java`
3. `src/main/java/com/example/starter/base/config/MapConfig.java`
4. `src/main/java/com/example/starter/base/services/OfflineStorageService.java`
5. `src/main/java/com/example/starter/base/views/MainView.java`
6. `src/main/java/com/example/starter/base/views/POIDetailView.java`

Delete entire directories:
- `src/main/java/com/example/starter/base/config/` (if empty)
- `src/main/java/com/example/starter/base/views/` (if empty)

### 2.1 Simplify `PointOfInterest.java`

Remove:
- Import of `com.vaadin.flow.server.StreamResource`
- Methods: `getImageResource()`, `listResources()`
- Keep it as a simple POJO with getters/setters for internal use

---

## Step 3: Update Maven Configuration

### 3.1 Clean up `pom.xml`

**Remove:**
- `<dependency>` entries for all `com.vaadin:*` and `software.xdev:vaadin-maps-leaflet-flow`
- `<dependency>` for `jboss-logmanager` (optional, if not needed)
- The entire `vaadin-maven-plugin` plugin definition from both `<build>` and `<profile id="production">`

**Keep:**
- `io.quarkus` dependencies (core, rest-jackson)
- `maven-surefire-plugin`

**Add to `<build><plugins>`:**
```xml
<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>1.15.0</version>
    <configuration>
        <workingDirectory>.</workingDirectory>
        <nodeVersion>v18.17.0</nodeVersion>
        <npmVersion>9.8.1</npmVersion>
    </configuration>
    <executions>
        <execution>
            <id>install node and npm</id>
            <goals>
                <goal>install-node-and-npm</goal>
            </goals>
            <phase>generate-resources</phase>
        </execution>
        <execution>
            <id>npm install</id>
            <goals>
                <goal>npm</goal>
            </goals>
            <phase>generate-resources</phase>
            <configuration>
                <arguments>install</arguments>
            </configuration>
        </execution>
        <execution>
            <id>npm run build</id>
            <goals>
                <goal>npm</goal>
            </goals>
            <phase>compile</phase>
            <configuration>
                <arguments>run build</arguments>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### 3.2 Update `package.json`

**Remove:**
- All `@vaadin/*` packages
- All `@polymer/*` packages
- `lit`, `construct-style-sheets-polyfill`, `date-fns`
- Entire `"vaadin"` section
- `"overrides"` section (or trim it significantly)

**Final minimal `dependencies`:**
```json
{
  "dependencies": {
    "idb": "^8.0.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-router": "7.5.2",
    "react-router-dom": "^7.9.3"
  },
  "devDependencies": {
    "@types/react": "18.3.20",
    "@types/react-dom": "18.3.6",
    "@vitejs/plugin-react": "4.4.1",
    "typescript": "5.7.3",
    "vite": "6.3.4"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Step 4: Reconfigure Frontend Build to Standalone Vite

### 4.1 Delete Vaadin-Generated Files

Remove:
- `src/main/frontend/generated/` (entire directory)
- `vite.generated.ts`
- `src/main/bundles/` (if it exists)

### 4.2 Rewrite `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/main/frontend',
  build: {
    outDir: '../../resources/META-INF/resources',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'idb'],
  },
});
```

### 4.3 Update `tsconfig.json`

Remove Vaadin path aliases:
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "jsx": "react-jsx",
    "inlineSources": true,
    "module": "esNext",
    "target": "es2022",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": [
    "src/main/frontend/**/*",
    "types.d.ts"
  ]
}
```

### 4.4 Ensure `src/main/frontend/index.html` is Vite Entry

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>Visit Polzela - Discover Slovenia Tourist Attractions & Points of Interest</title>
  <!-- ...existing meta tags... -->
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
  <!-- Vite will inject index.tsx here -->
</head>
<body>
  <div id="outlet"></div>
  <script type="module" src="/index.tsx"></script>
</body>
</html>
```

---

## Step 5: Rewrite Frontend DataService to Call REST Endpoints

### 5.1 Update `src/main/frontend/services/DataService.ts`

Replace file-fetching logic with REST calls:

```typescript
import { openDB } from 'idb';
import { POI, Language } from '../types/POI';

const DB_NAME = 'visit-polzela';
const POI_STORE = 'pois';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

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
        },
      });
    }
    return this.db;
  }

  /**
   * Fetch all POIs from REST API and cache in IndexedDB
   */
  async loadPOIsFromREST(lang: Language): Promise<POI[]> {
    try {
      const response = await fetch(`/api/pois?lang=${lang}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch POIs: ${response.statusText}`);
      }
      const pois: POI[] = await response.json();

      // Cache in IndexedDB for offline access
      const db = await this.initDB();
      const tx = db.transaction(POI_STORE, 'readwrite');
      for (const poi of pois) {
        await tx.store.put(poi);
      }
      await tx.done;

      return pois;
    } catch (error) {
      console.error('Error loading POIs from REST:', error);
      // Fallback to IndexedDB
      return this.getPOIsFromDB();
    }
  }

  /**
   * Fetch single POI with full description
   */
  async getPOIFromREST(key: string, lang: Language): Promise<POI | null> {
    try {
      const response = await fetch(`/api/pois/${encodeURIComponent(key)}?lang=${lang}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching POI ${key}:`, error);
      return this.getPOIFromDB(key);
    }
  }

  /**
   * Fetch localized text strings (UI labels, etc.)
   */
  async getLocalizedTexts(lang: Language, keys: string[]): Promise<Map<string, string>> {
    try {
      const keysParam = keys.join(',');
      const response = await fetch(`/api/texts?lang=${lang}&keys=${keysParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch localized texts');
      }
      const data: { texts: Record<string, string> } = await response.json();
      return new Map(Object.entries(data.texts));
    } catch (error) {
      console.error('Error loading localized texts:', error);
      return new Map();
    }
  }

  /**
   * Fetch available images for a POI
   */
  async getPOIImages(key: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/pois/${encodeURIComponent(key)}/images`);
      if (!response.ok) {
        return [];
      }
      const data: { imageUrls: string[] } = await response.json();
      return data.imageUrls;
    } catch (error) {
      console.error(`Error fetching images for ${key}:`, error);
      return [];
    }
  }

  async getPOIsFromDB(): Promise<POI[]> {
    const db = await this.initDB();
    return db.getAll(POI_STORE);
  }

  async getPOIFromDB(name: string): Promise<POI | undefined> {
    const db = await this.initDB();
    return db.get(POI_STORE, name);
  }

  async initializeData(lang: Language): Promise<void> {
    try {
      await this.loadPOIsFromREST(lang);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }
}
```

### 5.2 Update `src/main/frontend/views/MainView.tsx`

Replace `dataService.getPOIsWithLocalizedTitles()` with:

```typescript
const loadPOIs = async () => {
  try {
    const pois = await dataService.loadPOIsFromREST(language);
    // POIs are already localized from REST
    setPois(pois.sort((a, b) => a.order - b.order));
  } catch (error) {
    console.error('Error loading POIs:', error);
  }
};

const loadWelcomeText = async () => {
  try {
    const texts = await dataService.getLocalizedTexts(language, ['welcome']);
    const text = texts.get('welcome') || 'Welcome to';
    setWelcomeText(text);
  } catch (error) {
    console.error('Error loading welcome text:', error);
  }
};
```

### 5.3 Update `src/main/frontend/views/POIDetailView.tsx`

Replace file-fetching and gallery image logic:

```typescript
const loadPOI = async (poiName: string) => {
  try {
    setLoading(true);
    
    // Fetch single POI with full description from REST
    const poiData = await dataService.getPOIFromREST(
      decodeURIComponent(poiName),
      language
    );

    if (poiData) {
      setPoi(poiData);
      setDescription(poiData.description || '');
    }

    // Fetch localized UI string
    const texts = await dataService.getLocalizedTexts(language, ['takeme']);
    setTakeMeText(texts.get('takeme') || 'Take me there!');

    setLoading(false);
  } catch (error) {
    console.error('Error loading POI:', error);
    setLoading(false);
  }
};

// Update ImageGallery to fetch from REST
const ImageGallery = ({ poi }: { poi: POI }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const urls = await dataService.getPOIImages(poi.name);
      setImageUrls(urls.filter(url => url.includes('1.webp') || url.includes('2.webp') || url.includes('3.webp')));
    };
    loadImages();
  }, [poi.name]);

  return (
    <>
      <div className="image-gallery">
        {imageUrls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={poi.displayName}
            className="gallery-image"
            onClick={() => setEnlargedImage(url)}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
      </div>

      {enlargedImage && (
        <div className="image-dialog" onClick={() => setEnlargedImage(null)}>
          <img
            src={enlargedImage}
            alt={poi.displayName}
            className="enlarged-image"
            onClick={() => setEnlargedImage(null)}
          />
        </div>
      )}
    </>
  );
};
```

---

## Step 6: Update Docker Build Configuration

### 6.1 Update `Dockerfile`

Replace Vaadin frontend build with standalone npm build:

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine as build
WORKDIR /app

# Copy and cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Install Node.js and build frontend
RUN apk add --no-cache nodejs npm
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY src ./src

# Build with Maven (which triggers npm build via frontend-maven-plugin)
RUN mvn package -DskipTests -B

# Runtime stage
FROM gcr.io/distroless/java17-debian11:nonroot
COPY --from=build --chown=nonroot:nonroot /app/target/visit-polzela-1.0-runner.jar /app/visit-polzela-1.0-runner.jar
EXPOSE 8080
USER nonroot

ENV QUARKUS_HTTP_HOST=0.0.0.0
ENV QUARKUS_HTTP_PORT=8080
ENV JAVA_OPTS="-Djava.util.logging.manager=org.jboss.logmanager.LogManager -XX:+UseG1GC -XX:MaxGCPauseMillis=100"

ENTRYPOINT ["java", "-jar", "/app/visit-polzela-1.0-runner.jar"]
```

---

## Step 7: Update Development Workflows

### 7.1 Development (Hot Reload)

**Windows:**
```bash
# Terminal 1: Start Quarkus dev server
mvnw quarkus:dev

# Terminal 2: Start Vite dev server (optional, for hot reload of frontend)
npm run dev
```

**Mac/Linux:**
```bash
# Terminal 1: Start Quarkus dev server
./mvnw quarkus:dev

# Terminal 2: Start Vite dev server (optional)
npm run dev
```

Quarkus serves both the REST API and static files from `src/main/resources/META-INF/resources/`.

### 7.2 Production Build

**Windows:**
```bash
mvnw package -DskipTests
java -jar target/visit-polzela-1.0-runner.jar
```

**Mac/Linux:**
```bash
./mvnw package -DskipTests
java -jar target/visit-polzela-1.0-runner.jar
```

Frontend is built to `src/main/resources/META-INF/resources/` by the Vite build during Maven compile phase.

---

## Step 8: Update Documentation & Configuration Files

### 8.1 Update `README.md`

- Replace "Vaadin Flow 24.7.6" with "Quarkus 3.20.0"
- Update technology stack to remove Vaadin
- Update development workflow instructions

### 8.2 Update `application.properties`

Remove or comment out Vaadin-specific properties:
```properties
# Removed: vaadin.pwa.enabled=false
# Removed: Vaadin theme properties

# Updated/Added:
quarkus.application.name=Visit Polzela
quarkus.http.root-path=/
quarkus.http.port=${PORT:8080}
quarkus.http.static-resources.enabled=true
quarkus.http.static-resources.paths=META-INF/resources
quarkus.package.jar.type=uber-jar
quarkus.native.container-build=true
quarkus.http.cors=true
quarkus.http.cors.origins=*
```

---

## Summary of Changes

| Area | Old Approach | New Approach |
|------|--------------|--------------|
| **Backend Data Access** | Static text files + client-side parsing | Quarkus REST endpoints (POI, Images, UI Texts) |
| **Frontend Data Layer** | File fetching in `DataService.ts` | REST API calls via `DataService.ts` |
| **Build System** | Vaadin Maven plugin + `vite.generated.ts` | Standalone Vite + `frontend-maven-plugin` |
| **Java Framework Usage** | Vaadin Flow (unused server-side components) | Quarkus only (REST serving) |
| **Dependencies** | Vaadin, Vaadin Leaflet, Vaadin React components | Quarkus REST, Jackson, HTTP CORS config |
| **Gallery Images** | Hardcoded probe for `{key}1.webp`, etc. | REST endpoint returns available images |
| **UI Strings** | Loaded from static `poititles.txt` | REST endpoint returns localized text |
| **Descriptions** | File-based, client-side parsing | Returned from REST with language selection |

---

## Migration Checklist

- [ ] Add `quarkus-rest-jackson` to `pom.xml`
- [ ] Create `POIDto.java`, `POIImagesDto.java`, `LocalizedTextDto.java` DTOs
- [ ] Add REST resource classes: `POIResource.java`, `TextResource.java`
- [ ] Refactor `POIService.java` with description & image loading
- [ ] Delete `AppShell.java`, `CustomBootstrapListener.java`, `MapConfig.java`, `OfflineStorageService.java`
- [ ] Delete `MainView.java`, `POIDetailView.java`, and their parent directory
- [ ] Remove all Vaadin dependencies from `pom.xml`
- [ ] Remove Vaadin Maven plugin from `pom.xml`
- [ ] Add `frontend-maven-plugin` execution to `pom.xml`
- [ ] Update `package.json` to remove Vaadin packages
- [ ] Add `npm run dev` and `npm run build` scripts to `package.json`
- [ ] Delete `src/main/frontend/generated/` directory
- [ ] Delete `vite.generated.ts`
- [ ] Rewrite `vite.config.ts` for standalone Vite
- [ ] Update `tsconfig.json` to remove Vaadin path aliases
- [ ] Ensure `src/main/frontend/index.html` has proper Vite entry point
- [ ] Rewrite `src/main/frontend/services/DataService.ts` to call REST endpoints
- [ ] Update `src/main/frontend/views/MainView.tsx` to use new DataService methods
- [ ] Update `src/main/frontend/views/POIDetailView.tsx` to fetch from REST
- [ ] Update `Dockerfile` to run `npm ci && npm run build`
- [ ] Update `application.properties` (remove Vaadin config)
- [ ] Update `README.md` with new tech stack and workflow
- [ ] Test dev mode: `mvnw quarkus:dev`
- [ ] Test production build: `mvnw package -DskipTests`
- [ ] Test Docker build

---

## Benefits of This Migration

1. **Decoupling**: Frontend completely independent of Vaadin framework
2. **Simpler Build**: Standalone Vite for faster iterations, clearer build output
3. **REST API**: Clear contract between backend and frontend; easier to extend
4. **Reduced Dependencies**: Smaller JAR, fewer transitive dependencies
5. **Better Caching**: REST responses can be cached by browser, CDN, or backend
6. **Flexibility**: Future mobile/desktop clients can reuse REST API
7. **Type Safety**: DTOs provide contract; easier to refactor and evolve schema

---

## Rollback Plan

If issues arise during migration:

1. Keep current `pom.xml`, `package.json` in a branch
2. Before major deletions, commit a stable checkpoint
3. Test each step incrementally with `mvnw quarkus:dev` and `npm run dev`
4. Maintain both REST endpoints and static file serving initially (easy fallback)

---

## Known Limitations & Future Work

- **Service Worker**: Currently caches images and static files; can be updated to also cache REST responses
- **PWA Installation**: Manifest still works; no changes needed
- **Offline Mode**: IndexedDB + SW + REST fallback maintains offline functionality
- **CORS**: If deploying frontend and backend separately, ensure CORS is configured
- **Image Serving**: Images still served as static files; consider separate CDN for scale



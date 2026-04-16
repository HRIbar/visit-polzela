# Skill: Build Visit Polzela for Android

## Purpose
This skill describes how to build the Visit Polzela project into a signed Android APK or
AAB. The project is a React + TypeScript SPA (Vite) wrapped by Capacitor and served from
a Quarkus backend. The mobile build is **completely independent** of the Quarkus/Maven
build — it uses its own Vite config and Capacitor directly.

---

## Build Pipeline (high level)

```
npm run build:mobile
  Step 1 — vite build --config vite.mobile.config.ts
             Outputs slim bundle (~0.8 MB) to:
             target/classes/META-INF/resources/
               ├─ index.html
               ├─ assets/index-*.js   (React app)
               ├─ assets/vendor-*.js  (React, Router)
               ├─ assets/idb-*.js     (IndexedDB lib)
               ├─ assets/index-*.css
               └─ images/             (10 UI-chrome images ONLY)

  Step 2 — npx cap sync android
             Copies bundle → android/app/src/main/assets/public/
             Updates Capacitor plugin references in Android project
```

POI images (~50 .webp files) are **NOT bundled**. They are downloaded on first app
launch from `https://visit-polzela.com` and cached locally via the Cache API.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20.x | System install or use bundled `node/node.exe` |
| Android Studio | Ladybug 2024.2+ | Must be installed; Gradle syncs automatically |
| Android SDK | API 35 | Install via Android Studio SDK Manager |
| Java (JDK) | 21 | Bundled with Android Studio |
| Gradle | 8.11.1 | Downloaded automatically by Gradle wrapper |

---

## Step-by-step: Full Build from Scratch

### 1. Install dependencies (first time or after package.json changes)
```bash
npm install
```
Installs: React, Vite, TypeScript, `@capacitor/cli@6`, `@capacitor/core@6`,
`@capacitor/android@6`, `@capacitor/app@6`, `@capacitor/splash-screen@6`.

### 2. Build frontend + sync to Android
```bash
npm run build:mobile
```
This is the single command that does everything:
- Runs `vite build --config vite.mobile.config.ts`
- Runs `npx cap sync android`

### 3. Build signed APK
```bash
npm run android:build
# Equivalent: cd android && ./gradlew assembleRelease (Mac/Linux)
#             cd android && gradlew.bat assembleRelease (Windows)
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### 3b. Build signed AAB (Google Play)
```bash
npm run android:bundle
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Keystore Setup (required for signed release builds)

The signing keystore is already in the repo: `visit-polzela-release.keystore`

Create `android/keystore.properties` (this file is in .gitignore, never commit it):
```properties
RELEASE_STORE_FILE=../../visit-polzela-release.keystore
RELEASE_STORE_PASSWORD=<password>
RELEASE_KEY_ALIAS=visit-polzela
RELEASE_KEY_PASSWORD=<password>
```
Template is at: `android/keystore.properties.template`

---

## Version Bumping

Edit `android/app/build.gradle` before each release:
```groovy
defaultConfig {
    versionCode 9          // must increment by 1 each Play Store upload
    versionName "1.0.8"    // shown to users
}
```

---

## Key Configuration Files

| File | Role |
|------|------|
| `vite.mobile.config.ts` | Mobile Vite config: `publicDir=public-mobile/`, injects `VITE_API_BASE_URL=https://visit-polzela.com` |
| `capacitor.config.ts` | App ID `com.polzela.tourism`, `webDir=target/classes/META-INF/resources`, SplashScreen plugin |
| `android/app/build.gradle` | `versionCode`, `versionName`, signing config, SDK versions |
| `android/variables.gradle` | `compileSdk=35`, `targetSdk=35`, `minSdk=23`, `JavaVersion.VERSION_21` |
| `android/capacitor.settings.gradle` | Gradle include paths to `node_modules/@capacitor/android` and `@capacitor/app` |
| `src/main/frontend/public-mobile/` | Only these assets ship in the APK (flags, icons, panorama, nav button, placeholder) |
| `src/main/frontend/services/DataService.ts` | `DATA_VERSION` constant controls offline cache invalidation |

---

## Available npm Scripts (all run from repo root)

| Script | Command | Description |
|--------|---------|-------------|
| `npm install` | — | Install all deps including Capacitor |
| `npm run build:mobile` | `vite build --config vite.mobile.config.ts && npx cap sync android` | Full mobile build |
| `npm run build:frontend` | `vite build --config vite.mobile.config.ts` | Vite only, no sync |
| `npm run cap:sync` | `npx cap sync android` | Sync assets to Android project |
| `npm run cap:open` | `npx cap open android` | Open Android Studio |
| `npm run cap:copy` | `npx cap copy android` | Copy assets only (no plugin update) |
| `npm run android:build` | `cd android && ./gradlew assembleRelease` | Signed APK |
| `npm run android:bundle` | `cd android && ./gradlew bundleRelease` | Signed AAB |
| `npm run android:clean` | `cd android && ./gradlew clean` | Clean Android build |

> ⚠ Never use `npm run build` or `npm run build:web` for Android — those use
> `vite.config.ts` (the Quarkus web config, not the mobile config).

---

## Offline Data Architecture

The APK ships with ~0.8 MB of assets (JS bundle + 10 UI-chrome images). On first launch:

1. A sync overlay appears: "Downloading POI list…", "Caching images…", etc.
2. `DataService.syncAllContent()` fetches from `https://visit-polzela.com`:
   - `GET /api/pois?lang=*` × 4 languages → stored in IndexedDB `poi_lang` store
   - `GET /api/pois/{key}?lang=*` per POI × 4 languages → full descriptions
   - `GET /api/pois/{key}/images` per POI → URLs fetched and stored in `poi-images-v1` CacheStorage
   - `GET /api/texts?lang=*&keys=welcome,takeme` × 4 languages → `text_cache` store
3. Sync flag `poi_data_synced_v1` is written to `localStorage`.
4. All subsequent launches read from IndexedDB/Cache API — fully offline.

### Forcing re-sync after POI data update
Bump `DATA_VERSION` in `src/main/frontend/services/DataService.ts`:
```typescript
const DATA_VERSION = 'v2';  // change this when POI content changes
```
Rebuild and release. All installed apps will re-sync on next launch.

---

## Verification Checklist

After `npm run build:mobile`:
- `target/classes/META-INF/resources/assets/index-*.js` — exists
- `target/classes/META-INF/resources/assets/vendor-*.js` — exists
- `target/classes/META-INF/resources/images/` — contains ~10 UI-chrome files only
- `target/classes/META-INF/resources/images/castle.webp` — must NOT exist
- `android/app/src/main/assets/public/index.html` — exists (sync succeeded)
- `android/app/src/main/assets/public/images/` — contains ~10 UI-chrome files only

---

## Common Failures and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `npx cap sync` → "could not determine executable" | `@capacitor/cli` not installed | `npm install` |
| Gradle sync fails | Stale build state | `npm run android:clean && npm run build:mobile` |
| App stuck on "Loading…" at first launch | No internet; sync from `visit-polzela.com` failed | Connect to internet and relaunch |
| POI images missing offline | First-run sync interrupted | Clear app data on device, relaunch |
| Release build → "Keystore not found" | `android/keystore.properties` missing | Create from `android/keystore.properties.template` |
| Wrong bundle built | Plain `vite build` used instead of mobile config | Always use `npm run build:mobile` or `npm run build:frontend` |
| APK rejected by Play Store | `versionCode` not incremented | Bump `versionCode` in `android/app/build.gradle` |

---

## SDK Version Reference

| Item | Value |
|------|-------|
| `compileSdk` | 35 |
| `targetSdk` | 35 |
| `minSdk` | 23 (Android 6.0+) |
| Java | 21 |
| Gradle wrapper | 8.11.1 |
| Android Gradle Plugin | 8.10.1 |
| Capacitor | 6.2.x |
| App ID | `com.polzela.tourism` |


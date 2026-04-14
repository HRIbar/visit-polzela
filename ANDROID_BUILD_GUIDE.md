# Android Build Guide — Visit Polzela

## Prerequisites

| Tool | Required version                                       | Download |
|------|--------------------------------------------------------|---------|
| **Node.js** | ≥ 20.x                                                 | https://nodejs.org |
| **npm** | ≥ 10.x (bundled with Node)                             | — |
| **Android Studio** | Ladybug 2024.2 or newer                                | https://developer.android.com/studio |
| **Android SDK** | compileSdk 35, minSdk 23                               | Install via Android Studio SDK Manager |
| **Java (JDK)** | 21                                                     | Bundled with Android Studio, or install separately |
| **Gradle** | 9.1.1 (downloaded automatically by the Gradle wrapper) | — |

> **Windows only**: use PowerShell or Git Bash for all commands below.  
> The project ships its own `node/` binary; you can also use a system Node.js installation.

---

## Architecture Overview

```
npm run build:mobile
  └─ vite build --config vite.mobile.config.ts
       └─ Outputs slim bundle (~0.8 MB) to
          target/classes/META-INF/resources/
            ├─ index.html
            ├─ assets/*.js / *.css
            └─ images/ (UI chrome only — flags, panorama, nav button…)
  └─ npx cap sync android
       └─ Copies bundle → android/app/src/main/assets/public/
       └─ Updates Capacitor plugins
```

**Key point — POI images are NOT bundled.**  
On first launch, the app connects to `https://visit-polzela.com`, downloads all POI data
and images, and stores them locally (IndexedDB + Cache API). Every subsequent launch
works fully offline from the local cache.

---

## 1. First-time Setup

### 1.1 Install npm packages

```bash
npm install
```

This installs React, Vite, TypeScript, and all Capacitor packages
(`@capacitor/cli`, `@capacitor/core`, `@capacitor/android`, `@capacitor/app`,
`@capacitor/splash-screen`).

### 1.2 Open the Android project in Android Studio

```bash
npm run cap:open
```

Android Studio will open `android/`. Let Gradle sync finish before continuing.

### 1.3 Set up the Android SDK (first time only)

In Android Studio:
- `File > Settings > Appearance & Behavior > System Settings > Android SDK`
- Ensure **API 35 (Android 15)** is installed
- Ensure **Android SDK Build-Tools 35** is installed
- Install an **Android Virtual Device** (AVD) via `Tools > Device Manager` if testing on emulator

---

## 2. Daily Development Workflow

### Build and sync in one command

```bash
npm run build:mobile
```

This does two things in sequence:
1. Builds the Vite bundle using `vite.mobile.config.ts`
2. Runs `cap sync android` — copies assets to the Android project and updates plugins

Then press **Shift+F10** in Android Studio to run on device / emulator.

### Build only (no sync)

```bash
npm run build:frontend
```

### Sync only (no rebuild)

```bash
npm run cap:sync
```

---

## 3. Release Build (APK / AAB)

### 3.1 Set up the keystore

The keystore file is already checked in at the repo root:  
`visit-polzela-release.keystore`

Create `android/keystore.properties` (never commit this file — it's in `.gitignore`):

```properties
RELEASE_STORE_FILE=../../visit-polzela-release.keystore
RELEASE_STORE_PASSWORD=<your_keystore_password>
RELEASE_KEY_ALIAS=visit-polzela
RELEASE_KEY_PASSWORD=<your_key_password>
```

> See `android/keystore.properties.template` for the exact format.

### 3.2 Build the frontend

```bash
npm run build:mobile
```

### 3.3a Build a signed APK

```bash
cd android
./gradlew assembleRelease       # Mac / Linux
gradlew.bat assembleRelease     # Windows
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### 3.3b Build a signed AAB (Play Store)

```bash
cd android
./gradlew bundleRelease         # Mac / Linux
gradlew.bat bundleRelease       # Windows
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Using npm scripts (from project root)

```bash
npm run android:build    # APK
npm run android:bundle   # AAB
```

---

## 4. Version Bumping

Before a release, update the version in `android/app/build.gradle`:

```groovy
defaultConfig {
    versionCode 9          // increment by 1 each release
    versionName "1.0.8"    // semantic version shown to users
}
```

---

## 5. First-Run Behaviour on Device

The first time the app is opened (or after a `DATA_VERSION` bump in `DataService.ts`):

1. A **"Visit Polzela" sync overlay** appears with a progress bar.
2. The app downloads from `https://visit-polzela.com`:
   - POI list and descriptions for all 4 languages (EN / SL / DE / NL)
   - All POI images (~50 `.webp` files)
   - UI text strings
3. Everything is stored locally:
   - **JSON data** → IndexedDB (`visit-polzela` DB, version 3)
   - **Images** → Cache API (`poi-images-v1` bucket)
4. Once sync is complete the main POI grid loads instantly.

All subsequent launches are **fully offline-capable** — no network required.

### Forcing a re-sync

To push updated POI data to all installed apps, bump `DATA_VERSION` in  
`src/main/frontend/services/DataService.ts`:

```typescript
const DATA_VERSION = 'v2';   // was 'v1'
```

On next launch every device detects the new sync flag key and re-downloads all content.

---

## 6. Project Structure Reference

```
visit-polzela/
├─ src/main/frontend/          React + TypeScript SPA
│   ├─ index.html              App shell HTML (Leaflet CDN loaded here)
│   ├─ index.tsx               React entry point + SW registration
│   ├─ routes.tsx              React Router: / and /poi/:name
│   ├─ views/
│   │   ├─ MainView.tsx        Home — POI grid + language switcher + sync overlay
│   │   └─ POIDetailView.tsx   Detail — map, gallery, navigation
│   ├─ services/
│   │   └─ DataService.ts      All REST calls + IndexedDB + Cache API
│   ├─ components/
│   │   └─ CachedImage.tsx     <img> that resolves from Cache API first
│   └─ public-mobile/          Only these files ship inside the APK:
│       ├─ images/             UI-chrome images (flags, panorama, nav button…)
│       ├─ icons/              App icons
│       ├─ manifest.webmanifest
│       └─ favicon.ico
│
├─ vite.mobile.config.ts       Mobile-only Vite config:
│                                - publicDir → public-mobile/
│                                - VITE_API_BASE_URL = https://visit-polzela.com
│
├─ capacitor.config.ts         Capacitor config (appId, webDir, SplashScreen)
├─ package.json                npm scripts + all dependencies
│
├─ android/                    Capacitor Android project (Android Studio)
│   ├─ app/
│   │   ├─ build.gradle        versionCode / versionName live here
│   │   └─ src/main/assets/public/   ← cap sync writes here
│   ├─ variables.gradle        SDK versions (compileSdk 35, minSdk 23, Java 21)
│   ├─ keystore.properties     ⚠ NOT in git — create from template
│   └─ keystore.properties.template
│
└─ visit-polzela-release.keystore    Signing keystore (in git)
```

---

## 7. Available npm Scripts

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies (run once, or after `package.json` changes) |
| `npm run build:mobile` | **Full mobile build**: Vite bundle + `cap sync android` |
| `npm run build:frontend` | Vite bundle only (no sync) |
| `npm run build` / `npm run build:web` | Web build for Quarkus (not for Android) |
| `npm run cap:sync` | `cap sync android` — copy assets + update plugins |
| `npm run cap:open` | Open Android Studio |
| `npm run cap:copy` | Copy assets only (skip plugin update) |
| `npm run android:build` | `gradlew assembleRelease` (signed APK) |
| `npm run android:bundle` | `gradlew bundleRelease` (signed AAB) |
| `npm run android:clean` | `gradlew clean` |
| `npm run dev` | Vite HMR dev server on http://localhost:5173 |

---

## 8. Troubleshooting

### `npx cap sync` fails — "could not determine executable to run"

Capacitor CLI is not installed. Run:
```bash
npm install
```

### App stuck on "Loading…" after first install

The sync from `https://visit-polzela.com` failed (no internet, or server down).  
Connect to the internet and relaunch the app. The sync will retry automatically.

### POI images not loading offline

The first-run sync may have been interrupted. Clear app data on the device:  
`Settings > Apps > Visit Polzela > Storage > Clear data`  
Then relaunch and complete the sync.

### Gradle sync fails in Android Studio

```bash
npm run android:clean
npm run build:mobile
```

Then in Android Studio: `File > Sync Project with Gradle Files`.

### "Keystore not found" when building release

Create `android/keystore.properties` as described in section 3.1.

### App shows old POI data

The POI data is cached indefinitely. To force a re-download for all users, bump
`DATA_VERSION` in `DataService.ts` (see section 5).  
To force a re-download on your device only: clear app storage as above.

### Build outputs wrong bundle (uses wrong Vite config)

Always use `npm run build:mobile` or `npm run build:frontend`.  
Never run plain `vite build` — that uses `vite.config.ts` (web/Quarkus config, not mobile).

---

## 9. Verification Checklist

After `npm run build:mobile`, confirm:

- [ ] `target/classes/META-INF/resources/assets/index-*.js` exists
- [ ] `target/classes/META-INF/resources/assets/vendor-*.js` exists
- [ ] `target/classes/META-INF/resources/images/` contains only the ~10 UI-chrome images
- [ ] **No** `images/castle.webp` or other POI images in the output (they are not bundled)
- [ ] `android/app/src/main/assets/public/index.html` exists (sync succeeded)
- [ ] `android/app/src/main/assets/public/images/` contains only UI-chrome images

---

## 10. SDK / Dependency Versions (reference)

| Item | Version |
|------|---------|
| Android compileSdk | 35 |
| Android targetSdk | 35 |
| Android minSdk | 23 (Android 6.0) |
| Java source/target | 21 |
| Gradle wrapper | 8.11.1 |
| Android Gradle Plugin | 8.10.1 |
| Capacitor | 6.2.x |
| React | 18.3.1 |
| Vite | 6.3.x |
| TypeScript | 5.7.x |


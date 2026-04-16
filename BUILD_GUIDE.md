# Visit Polzela - Build & Development Guide

## 🚀 Quick Start - Building for Android

### First Time Setup

Before building, install all dependencies:
```bash
npm install
```

This will install all required packages including `rimraf` for cross-platform file deletion (works on Windows, Mac, Linux).

### Complete Build Process
```bash
# Build the React frontend and sync to Android
npm run build:mobile
```

This single command will:
1. Clean previous build artifacts
2. Build your React app with Vite using standalone config (`vite.mobile.config.ts`)
3. Sync the compiled files to Android project (`npm run cap:sync`)

**Important**: This build uses a **standalone Vite configuration** (`vite.mobile.config.ts`) that is completely independent from Vaadin's build system.

### Open in Android Studio
```bash
npm run cap:open
```

Then click the green "Run" button or press `Shift+F10` to run on emulator/device.

---

## 📋 Development Workflow

### 1. Making Frontend Changes (React, CSS, TypeScript)

After making changes to your React components or styles:

```bash
npm run build:mobile
```

Then run the app again in Android Studio.

### 2. Testing the Build Locally

To verify your build before syncing to Android:

```bash
npm run build:frontend
```

Check that `target/classes/META-INF/resources/` contains:
- `index.html` (updated with asset references)
- `assets/index-*.js` (your React app bundle)
- `assets/index-*.css` (your styles)
- All static files from `src/main/resources/META-INF/resources/`

### 3. Clean Build

If you encounter build issues:

```bash
npm run clean
npm run build:mobile
```

---

## 🛠️ Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run clean` | Remove previous build artifacts |
| `npm run build:frontend` | Build React app with standalone Vite config |
| `npm run build:mobile` | Clean + Build frontend + sync to Android |
| `npm run cap:sync` | Sync web assets to Android project |
| `npm run cap:open` | Open Android Studio |
| `npm run cap:copy` | Copy web assets only (no sync) |
| `npm run android:build` | Build APK with Gradle |
| `npm run android:bundle` | Build AAB for Play Store |
| `npm run android:clean` | Clean Android build |
| `npm run deploy:prepare` | Full build + bundle for deployment |

---

## 🏗️ Build Architecture

Your app has a **hybrid architecture**:

- **Frontend**: Pure React app (built with Vite)
  - Source: `src/main/frontend/`
  - Output: `target/classes/META-INF/resources/`
  - Entry: `index.html` → `index.tsx`
  - Build Config: `vite.mobile.config.ts` (standalone, no Vaadin)

- **Static Resources**: Images, data files, etc.
  - Source: `src/main/resources/META-INF/resources/`
  - Copied to output during build via Vite's `publicDir`

- **Mobile**: Capacitor wraps the React app
  - Android project: `android/`
  - Config: `capacitor.config.ts`
  - Web dir: `target/classes/META-INF/resources/`

**Important**: The build system uses `vite.mobile.config.ts` which is **completely independent** from Vaadin's `vite.config.ts` and `vite.generated.ts`. This ensures clean builds without Vaadin dependencies.

---

## 🔄 Complete Development Cycle

### Daily Development

1. **Edit your React code** in `src/main/frontend/`
2. **Build and sync:**
   ```bash
   npm run build:mobile
   ```
3. **Run in Android Studio** (press Shift+F10)
4. **Test on emulator/device**

### Before Committing

```bash
# Clean build to verify everything works
npm run clean
npm run build:mobile
```

### Deploying to Play Store

```bash
npm run deploy:prepare
```

This creates an Android App Bundle (AAB) in:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🐛 Troubleshooting

### "Unable to open asset URL" errors

Your app is trying to load source files that weren't bundled. Solution:
```bash
npm run clean
npm run build:mobile
```

### "Loading Visit Polzela..." stuck at startup

The JavaScript bundles weren't generated properly. Solution:
```bash
# Force clean rebuild
npm run clean
npm run build:frontend
```

Verify that `target/classes/META-INF/resources/` contains:
- `index.html` with updated script references
- `assets/index-*.js` (your React app)
- `assets/index-*.css` (your styles)
- `assets/vendor-*.js` (React, React-DOM, React-Router)

### Build uses wrong Vite config

Make sure you're using the mobile build script:
```bash
npm run build:frontend
```

This explicitly uses `vite.mobile.config.ts` which is independent from Vaadin.

**DO NOT** run `vite build` directly or `mvnw` commands for mobile builds.

### Service Worker not registering

The SW registration is intentionally wrapped in a try-catch for mobile builds. Check browser/WebView console for errors.

### Android Studio sync issues

```bash
npm run android:clean
npm run clean
npm run build:mobile
```

Then rebuild in Android Studio: `Build > Clean Project` > `Build > Rebuild Project`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `vite.mobile.config.ts` | **Standalone** Vite config for mobile (no Vaadin) |
| `capacitor.config.ts` | Capacitor configuration |
| `src/main/frontend/index.html` | App entry point HTML |
| `src/main/frontend/index.tsx` | React app entry point |
| `src/main/frontend/routes.tsx` | React Router configuration |
| `package.json` | NPM scripts and dependencies |
| `vite.config.ts` | Vaadin's Vite config (NOT used for mobile) |
| `vite.generated.ts` | Vaadin generated config (NOT used for mobile) |

---

## 💡 Tips

1. **Always use `npm run build:mobile`**: Don't run Maven commands for mobile builds

2. **The mobile build is Vaadin-free**: We use a standalone Vite config that doesn't import or depend on Vaadin's build system

3. **Check the console**: Use Android Studio's Logcat filtered by "Capacitor" or "chromium" to see app logs

4. **Static assets** (images, JSON, txt files): Place in `src/main/resources/META-INF/resources/`

5. **Verify build output**: After building, check `target/classes/META-INF/resources/assets/` contains JS/CSS bundles

6. **Clean builds are your friend**: When in doubt, `npm run clean && npm run build:mobile`

---

## ✅ Verification Checklist

After building, verify:

- [ ] `target/classes/META-INF/resources/index.html` exists and has script tags
- [ ] `target/classes/META-INF/resources/assets/index-*.js` exists (main bundle)
- [ ] `target/classes/META-INF/resources/assets/index-*.css` exists (styles)
- [ ] `target/classes/META-INF/resources/assets/vendor-*.js` exists (React libs)
- [ ] Static files copied from `src/main/resources/META-INF/resources/`
- [ ] `android/app/src/main/assets/public/` contains the synced files
- [ ] App runs without "Unable to open asset URL" errors
- [ ] No references to Vaadin classes in browser console

---

## 🎯 Common Workflows

### Quick Test Cycle
```bash
npm run build:mobile
# Run in Android Studio (Shift+F10)
```

### Full Clean Build
```bash
npm run clean
npm run android:clean
npm run build:mobile
# Clean + Rebuild in Android Studio
```

### Deploy Build
```bash
npm run deploy:prepare
# Upload AAB to Google Play Console
```

### Debug Build Issues
```bash
# Check what was built
ls -la target/classes/META-INF/resources/
ls -la target/classes/META-INF/resources/assets/

# Verify Capacitor can see the files
npm run cap:copy
ls -la android/app/src/main/assets/public/
```

---

## 🚫 What NOT to Do

❌ Don't run `mvnw` commands for mobile builds  
❌ Don't run `vite build` directly (always use `npm run build:frontend`)  
❌ Don't modify `vite.generated.ts` (it's not used for mobile)  
❌ Don't try to use Vaadin components in the mobile app  
❌ Don't forget to run `npm run cap:sync` after building  

---

## 📞 Need Help?

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Verify all files in the "Verification Checklist"
3. Try a clean build: `npm run clean && npm run build:mobile`
4. Check Android Studio's Logcat for error messages
5. Verify `vite.mobile.config.ts` is being used (not `vite.config.ts`)

---

## 🔧 Build System Details

### Why Two Vite Configs?

- `vite.config.ts` + `vite.generated.ts`: Used by Vaadin for web builds
- `vite.mobile.config.ts`: **Standalone** config for Capacitor mobile builds

The mobile config:
- ✅ No Vaadin dependencies
- ✅ No Flow integration
- ✅ Pure React + Capacitor
- ✅ Optimized for mobile bundle size
- ✅ Copies static resources correctly

### Build Output Structure

```
target/classes/META-INF/resources/
├── index.html (entry point)
├── assets/
│   ├── index-[hash].js (main React app)
│   ├── index-[hash].css (styles)
│   ├── vendor-[hash].js (React, ReactDOM, Router)
│   ├── leaflet-[hash].js (Leaflet library)
│   └── idb-[hash].js (IndexedDB wrapper)
├── images/ (copied from resources)
├── poi-descriptions/ (copied from resources)
├── pointsofinterest/ (copied from resources)
└── ... (other static files)
```

---

**Last Updated**: November 4, 2025  
**Build System**: Vite (Standalone) + Capacitor + React  
**No Vaadin Dependencies in Mobile Build**


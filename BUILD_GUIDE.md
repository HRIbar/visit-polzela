# Visit Polzela - Build & Development Guide

## 🚀 Quick Start - Building for Android

### Complete Build Process
```bash
# Build the React frontend and sync to Android
npm run build:mobile
```

This single command will:
1. Build your React app with Vite (`npm run build:frontend`)
2. Sync the compiled files to Android project (`npm run cap:sync`)

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

### 2. Making Backend Changes (Java, Quarkus)

If you modify Java code or backend logic:

```bash
mvnw.cmd clean package -Pproduction -DskipTests
npm run cap:sync
```

### 3. Adding New Dependencies

**Frontend (npm packages):**
```bash
npm install <package-name>
npm run build:mobile
```

**Backend (Maven dependencies):**
Edit `pom.xml`, then:
```bash
mvnw.cmd clean compile
```

---

## 🛠️ Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run build:frontend` | Build React app with Vite |
| `npm run build:mobile` | Build frontend + sync to Android |
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
  - Entry: `index.tsx`

- **Backend**: Vaadin + Quarkus (for server-side if needed)
  - Source: `src/main/java/`
  - Currently not used in mobile app (pure client-side)

- **Mobile**: Capacitor wraps the React app
  - Android project: `android/`
  - Config: `capacitor.config.ts`

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
mvnw.cmd clean package -Pproduction -DskipTests
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

Your app is trying to load TypeScript source files. Solution:
```bash
npm run build:frontend && npm run cap:sync
```

### "Loading Visit Polzela..." stuck at startup

The JavaScript bundles weren't generated. Solution:
```bash
# Rebuild everything
npm run build:mobile
```

Verify that `target/classes/META-INF/resources/assets/` contains:
- `index-*.js` (your React app)
- `index-*.css` (your styles)

### Build fails with Vaadin errors

The Vaadin build system can be ignored for mobile builds. Use:
```bash
npm run build:mobile
```

This uses the standalone Vite configuration (`vite.mobile.config.ts`) instead.

### Android Studio sync issues

```bash
npm run android:clean
npm run build:mobile
```

Then rebuild in Android Studio: `Build > Clean Project` > `Build > Rebuild Project`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `vite.mobile.config.ts` | Vite config for building React app |
| `capacitor.config.ts` | Capacitor configuration |
| `src/main/frontend/index.html` | App entry point HTML |
| `src/main/frontend/index.tsx` | React app entry point |
| `src/main/frontend/routes.tsx` | React Router configuration |
| `package.json` | NPM scripts and dependencies |
| `pom.xml` | Maven configuration (backend) |

---

## 💡 Tips

1. **Always build before testing**: Run `npm run build:mobile` after any frontend changes

2. **Use Android Studio's Logcat**: Filter by "Capacitor" to see app logs and errors

3. **Hot reload doesn't work**: You need to rebuild and re-run the app after changes

4. **Static assets** (images, JSON): Place in `src/main/resources/META-INF/resources/`

5. **Check the assets folder**: After building, verify `target/classes/META-INF/resources/assets/` contains your JS/CSS bundles

---

## ✅ Verification Checklist

After building, verify:

- [ ] `target/classes/META-INF/resources/assets/index-*.js` exists
- [ ] `target/classes/META-INF/resources/assets/index-*.css` exists
- [ ] `target/classes/META-INF/resources/index.html` has been updated
- [ ] `android/app/src/main/assets/public/` contains the synced files
- [ ] App runs without "Unable to open asset URL" errors

---

## 🎯 Common Workflows

### Quick Test Cycle
```bash
npm run build:mobile
# Run in Android Studio (Shift+F10)
```

### Full Clean Build
```bash
mvnw.cmd clean
npm run build:mobile
# Clean + Rebuild in Android Studio
```

### Deploy Build
```bash
npm run deploy:prepare
# Upload AAB to Google Play Console
```

---

## 📞 Need Help?

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Verify all files in the "Verification Checklist"
3. Try a clean build: `mvnw.cmd clean && npm run build:mobile`
4. Check Android Studio's Logcat for error messages

---

**Last Updated**: October 18, 2025
**Build System**: Vite + Capacitor + Vaadin/Quarkus


# Quick Start - Android Build

This is a quick reference guide for building your Visit Polzela app for Android.

## Prerequisites Setup (One-time)

1. **Install Android Studio**: https://developer.android.com/studio
2. **Configure Android SDK**: Open Android Studio → Tools → SDK Manager → Install latest SDK
3. **Create Keystore** (for release builds):
   ```bash
   keytool -genkey -v -keystore visit-polzela.keystore -alias visit-polzela -keyalg RSA -keysize 2048 -validity 10000
   ```
   Store the keystore file securely and remember the passwords!

## Quick Build Commands

### Build for Testing (Debug APK)
```bash
# 1. Build web assets
mvnw.cmd clean package -Pproduction -DskipTests

# 2. Sync to Android
npm run cap:sync

# 3. Open in Android Studio
npm run cap:open

# Then in Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### Build for Play Store (Release AAB)
```bash
# All-in-one command
npm run deploy:prepare

# Or step by step:
mvnw.cmd clean package -Pproduction -DskipTests
npm run cap:sync
npm run android:bundle
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Testing Your Build

### Test on Emulator
1. Open Android Studio
2. Tools → Device Manager → Create Device
3. Select a device (e.g., Pixel 5)
4. Run → Run 'app'

### Test on Physical Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Select your device in Android Studio
5. Run → Run 'app'

## Version Updates

Before each release, update version in `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2  // Increment this (1, 2, 3, ...)
        versionName "1.1"  // Update version (1.0, 1.1, 2.0, ...)
    }
}
```

## Useful NPM Scripts

- `npm run cap:sync` - Sync web assets to Android
- `npm run cap:open` - Open Android Studio
- `npm run build:mobile` - Build web + sync to Android
- `npm run deploy:prepare` - Full build ready for Play Store
- `npm run android:clean` - Clean Android build

## Common Issues

**Issue**: Gradle build fails
- Solution: Open Android Studio → File → Invalidate Caches → Restart

**Issue**: App crashes on startup
- Check Android Logcat in Android Studio for errors
- Verify all web assets are present in `target/dev-bundle/webapp/`

**Issue**: "SDK location not found"
- Create `android/local.properties` with:
  ```
  sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
  ```

## Quick Deploy to Play Store

1. Build AAB: `npm run deploy:prepare`
2. Go to: https://play.google.com/console
3. Select your app → Production → Create new release
4. Upload AAB from `android/app/build/outputs/bundle/release/`
5. Add release notes
6. Review → Start rollout

## File Locations

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **Release AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Keystore**: Store securely outside project (e.g., `C:\keystores\visit-polzela.keystore`)

## First Time Play Store Setup Checklist

- [ ] Google Play Developer account ($25)
- [ ] App created in Play Console
- [ ] Store listing completed (title, description)
- [ ] App icon uploaded (512x512)
- [ ] Screenshots added (minimum 2)
- [ ] Feature graphic created (1024x500)
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] First AAB uploaded
- [ ] Release submitted for review

For detailed instructions, see [ANDROID_DEPLOYMENT.md](ANDROID_DEPLOYMENT.md)

---
Last updated: 2025-10-15


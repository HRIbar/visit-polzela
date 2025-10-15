# Android Deployment Guide - Visit Polzela

This guide covers building an APK using Capacitor and deploying to Google Play Store.

## Prerequisites

### Required Software
- **Android Studio**: [Download here](https://developer.android.com/studio)
- **Java JDK 17**: Already installed for Quarkus
- **Node.js & npm**: Already installed
- **Capacitor**: Already installed in this project

### Google Play Console Requirements
1. **Google Play Developer Account**: $25 one-time registration fee
   - Register at: https://play.google.com/console/signup
2. **App Signing Key**: For production releases
3. **Privacy Policy URL**: Required for Play Store listing
4. **App Screenshots**: At least 2 screenshots (minimum 320px on shortest side)
5. **Feature Graphic**: 1024px x 500px image for Play Store listing

## Project Setup

Your app is now configured with:
- **App ID**: `com.polzela.tourism`
- **App Name**: Visit Polzela
- **Capacitor Android Platform**: Added and synced

## Building the App

### Step 1: Build the Web Assets

First, build your Quarkus/Vaadin application:

```bash
# Windows
mvnw.cmd clean package -Pproduction -DskipTests

# Mac/Linux
./mvnw clean package -Pproduction -DskipTests
```

This creates the web assets in `target/dev-bundle/webapp/`

### Step 2: Sync Capacitor

After building, sync the web assets to Android:

```bash
npx cap sync android
```

### Step 3: Open in Android Studio

Open the Android project in Android Studio:

```bash
npx cap open android
```

Or manually: Open Android Studio → Open → Select `android` folder in your project

### Step 4: Build APK in Android Studio

#### Debug APK (For Testing)
1. In Android Studio: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. Click "locate" in the notification to find the APK
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (For Distribution)
1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Select **APK** → **Next**
3. Create or select a keystore (see Signing Configuration below)
4. Select **release** build variant
5. Click **Finish**
6. APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 5: Build from Command Line (Alternative)

You can also build APKs from the command line:

#### Debug APK
```bash
cd android
./gradlew assembleDebug
```

#### Release APK (Requires signing configuration)
```bash
cd android
./gradlew assembleRelease
```

## Signing Configuration for Release Builds

### Generate a Keystore

Create a signing keystore for your app:

```bash
keytool -genkey -v -keystore visit-polzela.keystore -alias visit-polzela -keyalg RSA -keysize 2048 -validity 10000
```

Answer the prompts and **remember the passwords** - you'll need them!

Store the keystore file securely (e.g., in a secure folder outside your project).

### Configure Gradle for Signing

1. Create a file: `android/keystore.properties` (add to .gitignore!)

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=visit-polzela
storeFile=PATH_TO_YOUR_KEYSTORE_FILE
```

2. Update `android/app/build.gradle`:

Find the `android` block and add before `buildTypes`:

```gradle
    signingConfigs {
        release {
            if (project.hasProperty('keystore.properties')) {
                def keystorePropertiesFile = rootProject.file("keystore.properties")
                def keystoreProperties = new Properties()
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
                
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
```

## App Icon and Splash Screen

### Generate App Icons

1. Create your app icon as a 1024x1024 PNG file
2. Use Android Studio's Asset Studio:
   - Right-click `android/app/src/main/res` → **New** → **Image Asset**
   - Select **Launcher Icons**
   - Upload your 1024x1024 icon
   - Click **Next** → **Finish**

### Alternative: Use Online Icon Generator
- [Android Asset Studio](http://romannurik.github.io/AndroidAssetStudio/)
- [App Icon Generator](https://www.appicon.co/)

### Configure Splash Screen

Your splash screen is already configured in `capacitor.config.ts`:
- Duration: 2 seconds
- Background color: #007bff (blue)

To customize the splash screen image:
1. Place splash screen image in: `android/app/src/main/res/drawable/`
2. Name it: `splash.png` (2732x2732px recommended)

## Google Play Store Deployment

### Step 1: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in:
   - **App name**: Visit Polzela
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
4. Accept declarations and click **Create app**

### Step 2: Set Up Store Listing

Navigate to **Store presence** → **Main store listing**:

#### Required Information:
- **App name**: Visit Polzela
- **Short description** (80 chars max):
  ```
  Discover Polzela's attractions - castles, churches, nature & local culture
  ```
- **Full description** (4000 chars max):
  ```
  Visit Polzela is your comprehensive guide to exploring Polzela, Slovenia. 
  Discover 16 curated points of interest including historical castles, 
  beautiful churches, natural landmarks, and unique cultural experiences.

  Features:
  • 16 Points of Interest with detailed descriptions
  • 4 languages: English, Slovenian, German, Dutch
  • Interactive maps with OpenStreetMap
  • Direct navigation via Google Maps & Apple Maps
  • Image galleries for each location
  • Offline support for browsing without internet
  • Progressive Web App technology

  Explore attractions like:
  - Polzela Castle
  - Mount Oljka & Mountaineering Lodge
  - Church of St. Margaret
  - Roman Legionary Camp
  - Vintage Tractor Museum
  - River Ložnica Floodplain
  - And much more!

  Perfect for tourists, locals, and history enthusiasts.
  ```

- **App icon**: 512x512 PNG (upload from `src/main/resources/META-INF/resources/icons/`)
- **Feature graphic**: 1024x500 PNG (create a banner with your logo and scenic Polzela image)
- **Phone screenshots**: At least 2 (take from your app - use Android Studio emulator)
- **Category**: Travel & Local
- **Email address**: Your contact email
- **Privacy policy URL**: Create and host a privacy policy

#### Screenshot Tips:
1. Run your app in Android Studio emulator
2. Use emulator's screenshot tool (camera icon)
3. Recommended sizes: 1080x1920 or 1440x2560
4. Show key features: Main view, POI detail, map, language switching

### Step 3: Content Rating

1. Navigate to **Policy** → **App content** → **Content rating**
2. Fill out the questionnaire
3. For a tourism app, it will likely get an "Everyone" rating

### Step 4: Privacy Policy

Create a simple privacy policy. Example:

```markdown
# Privacy Policy for Visit Polzela

Last updated: [Current Date]

## Information We Collect
Visit Polzela does not collect, store, or transmit any personal information.

## Local Storage
The app uses IndexedDB to cache attraction information locally for offline use.
This data never leaves your device.

## Location Services
The app provides navigation links to external map services (Google Maps, Apple Maps).
Location permissions are handled by these external services, not by our app.

## Third-Party Services
- OpenStreetMap for displaying maps
- Google Maps / Apple Maps for navigation (when user chooses to open them)

## Contact
For questions about this privacy policy, contact: [your-email@example.com]
```

Host this on GitHub Pages, your website, or use a service like [Privacy Policy Generator](https://www.privacypolicygenerator.info/).

### Step 5: Set Up App Access

Navigate to **App access** → Declare if your app requires any special access or has restrictions.

For Visit Polzela, select:
- "All functionality is available without special access"

### Step 6: Upload Your APK/AAB

Google Play now requires Android App Bundles (AAB) for new apps:

#### Build an AAB (Recommended)

In Android Studio:
1. **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Select your keystore
4. Choose **release** variant
5. Click **Finish**

Or via command line:
```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

#### Upload to Play Console

1. Navigate to **Release** → **Production** → **Create new release**
2. Click **Upload** and select your AAB file
3. Add release notes (what's new):
   ```
   Initial release of Visit Polzela - Your guide to exploring Polzela, Slovenia
   
   • 16 curated points of interest
   • 4 languages supported
   • Interactive maps and navigation
   • Offline browsing capability
   • Beautiful image galleries
   ```
4. Click **Next** → **Save** → **Review release**

### Step 7: Rollout

1. Review all sections for completeness
2. Click **Start rollout to Production**
3. Confirm the rollout

**Note**: First review can take several days. Subsequent updates are usually faster (hours).

## Testing Before Release

### Internal Testing
1. In Play Console: **Release** → **Testing** → **Internal testing**
2. Create a release and upload your AAB
3. Add testers via email addresses
4. Share the testing link with testers

### Closed Testing (Beta)
1. **Release** → **Testing** → **Closed testing**
2. Create a testing track
3. Add testers or create a testing list
4. Release to beta testers for feedback

### Open Testing
Available to anyone with the link, great for public beta.

## Updating Your App

### Process for Updates

1. **Update version in Capacitor**:
   
   Edit `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           versionCode 2  // Increment this
           versionName "1.1"  // Update version name
       }
   }
   ```

2. **Build your web assets**:
   ```bash
   mvnw.cmd clean package -Pproduction -DskipTests
   ```

3. **Sync Capacitor**:
   ```bash
   npx cap sync android
   ```

4. **Build new AAB**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

5. **Upload to Play Console**:
   - Go to **Production** → **Create new release**
   - Upload new AAB
   - Add release notes
   - Review and rollout

## Useful Commands Reference

```bash
# Build web assets
mvnw.cmd clean package -Pproduction -DskipTests

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build debug APK
cd android && ./gradlew assembleDebug

# Build release APK
cd android && ./gradlew assembleRelease

# Build release AAB
cd android && ./gradlew bundleRelease

# Clean Android build
cd android && ./gradlew clean
```

## Troubleshooting

### Issue: "SDK location not found"
**Solution**: Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Issue: Build fails with Gradle errors
**Solution**: 
1. Open Android Studio
2. File → Invalidate Caches → Invalidate and Restart
3. Rebuild project

### Issue: App crashes on launch
**Solution**: Check Android Logcat in Android Studio for errors. Common issues:
- Missing permissions in `AndroidManifest.xml`
- Network security configuration for HTTPS
- JavaScript errors (check Chrome DevTools via `chrome://inspect`)

### Issue: "Play Console Review Rejected"
**Solution**: Common reasons:
- Missing privacy policy
- Insufficient screenshots
- Content rating issues
- Permissions not justified

### Issue: Web assets not loading
**Solution**:
1. Ensure `target/dev-bundle/webapp/index.html` exists
2. Run `npx cap copy android` to copy assets
3. Check `capacitor.config.ts` webDir path

## Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android Studio Download](https://developer.android.com/studio)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Play Store Review Guidelines](https://play.google.com/about/developer-content-policy/)

## Checklist for First Release

- [ ] App built and tested on emulator
- [ ] App tested on physical device
- [ ] Keystore created and backed up
- [ ] App signed with release key
- [ ] Google Play Developer account created ($25)
- [ ] Store listing completed (title, description, icon)
- [ ] Screenshots captured (minimum 2)
- [ ] Feature graphic created (1024x500)
- [ ] Privacy policy created and hosted
- [ ] Content rating completed
- [ ] AAB uploaded to Play Console
- [ ] Release notes written
- [ ] All Play Console sections completed
- [ ] App submitted for review

Good luck with your Google Play Store release! 🚀


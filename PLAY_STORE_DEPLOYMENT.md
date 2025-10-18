# Google Play Store Deployment Guide - Visit Polzela

## 📱 Complete Step-by-Step Guide for Publishing to Google Play Store

---

## PART 1: Generate Signing Key (One-time Setup)

### Step 1: Generate Release Keystore

Open a terminal and run:

```bash
keytool -genkey -v -keystore visit-polzela-release.keystore -alias visit-polzela -keyalg RSA -keysize 2048 -validity 10000
```

**You will be asked:**
- **Keystore password**: Choose a strong password (remember this!)
- **Key password**: Choose a strong password (can be same as keystore password)
- **First and last name**: Your name or company name
- **Organizational unit**: Your team/department (e.g., "Development")
- **Organization**: Your company name (e.g., "Visit Polzela")
- **City**: Polzela
- **State**: Slovenia
- **Country code**: SI

**IMPORTANT:** 
- Save the keystore file to a secure location
- **NEVER commit the keystore to Git** (it's already in .gitignore)
- Back up this file - if you lose it, you can't update your app!
- Save the passwords in a secure password manager

### Step 2: Move Keystore to Android Project

Copy the generated `visit-polzela-release.keystore` file to:
```
C:\Users\hriba\GitHub_repositories\visit-polzela\android\app\
```

### Step 3: Create Signing Properties File

Create a file at:
```
C:\Users\hriba\GitHub_repositories\visit-polzela\android\keystore.properties
```

With this content (replace with your actual values):
```properties
RELEASE_STORE_FILE=visit-polzela-release.keystore
RELEASE_STORE_PASSWORD=your_keystore_password_here
RELEASE_KEY_ALIAS=visit-polzela
RELEASE_KEY_PASSWORD=your_key_password_here
```

**IMPORTANT:** This file is in .gitignore - never commit passwords to Git!

---

## PART 2: Build Signed App Bundle

### Option A: Build via Android Studio (Recommended for First Time)

1. **Open Android Studio**
   ```bash
   npm run cap:open
   ```

2. **Build the Frontend First**
   ```bash
   npm run build:mobile
   ```

3. **In Android Studio:**
   - Click **Build** > **Generate Signed Bundle / APK**
   - Select **Android App Bundle**
   - Click **Next**
   
4. **Sign the Bundle:**
   - **Key store path**: Click "Choose existing" and select `android/app/visit-polzela-release.keystore`
   - **Key store password**: Enter your keystore password
   - **Key alias**: `visit-polzela`
   - **Key password**: Enter your key password
   - ✅ Check "Remember passwords"
   - Click **Next**

5. **Build Variant:**
   - Select **release**
   - Click **Finish**

6. **Find Your AAB File:**
   The signed bundle will be created at:
   ```
   android/app/release/app-release.aab
   ```

### Option B: Build via Command Line (Faster for Updates)

After the first build with Android Studio, you can use:

```bash
npm run deploy:prepare
```

This will:
1. Build your React frontend
2. Sync to Android
3. Create signed AAB bundle

The AAB file will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## PART 3: Prepare Play Store Assets

### Required Assets for Play Store Listing

Create these assets before uploading:

#### 1. App Screenshots (REQUIRED)
- **Phone**: At least 2 screenshots
  - Size: 1080 x 1920 pixels (or your device's resolution)
  - Format: PNG or JPEG
  - Take screenshots on your Android device/emulator

#### 2. Feature Graphic (REQUIRED)
- Size: 1024 x 500 pixels
- Format: PNG or JPEG
- This appears at the top of your Play Store listing

#### 3. App Icon (REQUIRED)
- Size: 512 x 512 pixels
- Format: PNG (32-bit, no alpha)
- High-res version of your app icon

#### 4. Privacy Policy (REQUIRED)
- URL to your privacy policy
- You'll need to host this on a website

#### 5. App Description (REQUIRED)
- **Short description**: Max 80 characters
- **Full description**: Max 4000 characters

#### 6. Optional Assets:
- Promo video (YouTube URL)
- 7-inch tablet screenshots
- 10-inch tablet screenshots

---

## PART 4: Upload to Google Play Console

### Step 1: Access Play Console

1. Go to: https://play.google.com/console
2. Sign in with your Google Developer account
3. Click **Create app**

### Step 2: App Details

1. **App name**: Visit Polzela
2. **Default language**: English (United States)
3. **App or game**: App
4. **Free or paid**: Free
5. Accept declarations and click **Create app**

### Step 3: Set Up Store Listing

Navigate to **Store presence** > **Main store listing**

1. **App name**: Visit Polzela
2. **Short description**: 
   ```
   Discover Polzela's attractions with interactive maps, descriptions, and navigation.
   ```

3. **Full description**:
   ```
   Visit Polzela is your comprehensive guide to exploring the beautiful town of Polzela, Slovenia.

   Features:
   • Interactive Points of Interest with detailed descriptions
   • Multi-language support (Slovenian, English, German, Dutch)
   • Integrated maps and navigation to attractions
   • Photo galleries of local landmarks
   • Offline-capable for use without internet

   Discover historical sites, cultural attractions, and natural beauty spots. Get directions, view photos, and learn about each location in your preferred language.

   Perfect for tourists and locals alike!
   ```

4. **App icon**: Upload your 512x512 PNG icon

5. **Feature graphic**: Upload your 1024x500 graphic

6. **Phone screenshots**: Upload at least 2 screenshots

7. **Category**: 
   - Application type: **Travel & Local**
   - Category: **Travel & Local**

8. **Contact details**:
   - Email: your-email@example.com
   - Website: (if you have one)

9. **Privacy policy**: Enter your privacy policy URL

10. Click **Save**

### Step 4: Content Rating

1. Navigate to **Content rating**
2. Click **Start questionnaire**
3. Enter your email
4. Select category: **Travel & Local**
5. Answer all questions (mostly "No" for a tourism app)
6. Click **Save** and **Submit**
7. Click **Apply rating**

### Step 5: App Access

1. Navigate to **App access**
2. Select "All functionality is available without restrictions"
3. Click **Save**

### Step 6: Ads

1. Navigate to **Ads**
2. Select whether your app contains ads (probably "No")
3. Click **Save**

### Step 7: Target Audience and Content

1. Navigate to **Target audience**
2. **Age group**: Select "13+" or as appropriate
3. **Store presence**: Designed for children - "No"
4. Click **Next** and **Save**

### Step 8: News Apps (Optional)

Skip this if not applicable - click **Save**

### Step 9: COVID-19 Contact Tracing and Status Apps

Skip this - click **Save**

### Step 10: Data Safety

1. Navigate to **Data safety**
2. Answer questions about data collection:
   - Do you collect or share user data? 
     - If you use localStorage for language preference only: **Yes** (minimal data)
   - Complete the form for data types collected
3. Click **Save**

### Step 11: Government Apps

Skip this - click **Save**

### Step 12: Upload Your App Bundle

1. Navigate to **Production** > **Releases**
2. Click **Create new release**
3. **Upload** your `app-release.aab` file
4. **Release name**: "1.0.0" (or your version)
5. **Release notes**:
   ```
   Initial release of Visit Polzela
   
   Features:
   - Browse points of interest in Polzela
   - Multi-language support (SL, EN, DE, NL)
   - Interactive maps and navigation
   - Photo galleries
   - Offline support
   ```
6. Click **Save**

### Step 13: Review and Rollout

1. **Review summary** - Make sure all sections have green checkmarks
2. Fix any issues highlighted in red/orange
3. Click **Send for review**

---

## PART 5: App Review Process

### What Happens Next:

1. **Google Review**: Typically takes 1-7 days
   - Google will test your app
   - Check for policy violations
   - Verify content rating

2. **Possible Outcomes**:
   - ✅ **Approved**: Your app goes live automatically
   - ⚠️ **Changes requested**: Fix issues and resubmit
   - ❌ **Rejected**: Address violations and resubmit

3. **Track Status**:
   - Monitor in Play Console dashboard
   - You'll receive email notifications

---

## PART 6: Post-Launch

### After App is Published:

1. **Monitor**: Check crash reports and user reviews
2. **Respond**: Reply to user reviews
3. **Update**: When you make changes, increase versionCode and versionName

### For Future Updates:

1. **Update version in `build.gradle`**:
   ```groovy
   versionCode 2      // Increment by 1
   versionName "1.1.0"  // Semantic versioning
   ```

2. **Build and upload**:
   ```bash
   npm run build:mobile
   npm run deploy:prepare
   ```

3. **Create new release** in Play Console with updated AAB

---

## Troubleshooting

### "Keystore not found" Error
- Make sure `visit-polzela-release.keystore` is in `android/app/` directory
- Check `keystore.properties` file path

### "Wrong password" Error
- Verify passwords in `keystore.properties`
- Make sure there are no extra spaces

### Build Fails
```bash
# Clean and rebuild
npm run android:clean
npm run build:mobile
```

Then try building again in Android Studio.

### Upload Failed
- Make sure you're uploading `.aab` file, not `.apk`
- Verify the file isn't corrupted
- Try uploading again

---

## Quick Reference Commands

```bash
# Build frontend and sync to Android
npm run build:mobile

# Build signed AAB bundle
npm run deploy:prepare

# Open Android Studio
npm run cap:open

# Clean Android build
npm run android:clean
```

---

## Checklist Before Submitting

- [ ] Keystore created and backed up
- [ ] keystore.properties file created with correct passwords
- [ ] App built and tested on device
- [ ] Signed AAB bundle generated
- [ ] App icon (512x512) ready
- [ ] Feature graphic (1024x500) ready
- [ ] At least 2 screenshots taken
- [ ] Privacy policy URL ready
- [ ] Store listing description written
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] AAB file uploaded
- [ ] Release notes written
- [ ] All Play Console sections completed

---

## Important Notes

⚠️ **NEVER** commit these files to Git:
- `visit-polzela-release.keystore`
- `keystore.properties`
- Any file containing passwords

✅ **DO** backup securely:
- Your keystore file
- Keystore passwords
- Google Play Console credentials

📧 **Contact Google Play Support** if you have issues during review

---

**Current Status**: Ready for keystore generation and Play Store submission
**App Version**: 1.0.0
**Package Name**: com.polzela.tourism
**Build Type**: Android App Bundle (AAB)

Good luck with your app launch! 🚀


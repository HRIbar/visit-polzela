# Play Store Deployment - Quick Start Checklist

## ✅ Step-by-Step Checklist

### PHASE 1: Generate Signing Key (Do This First!)

- [ ] **Step 1.1**: Open Command Prompt or PowerShell
- [ ] **Step 1.2**: Run this command:
  ```bash
  keytool -genkey -v -keystore visit-polzela-release.keystore -alias visit-polzela -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] **Step 1.3**: Answer the questions and **SAVE YOUR PASSWORDS**
- [ ] **Step 1.4**: Move `visit-polzela-release.keystore` to:
  ```
  C:\Users\hriba\GitHub_repositories\visit-polzela\android\app\
  ```

### PHASE 2: Configure Signing

- [ ] **Step 2.1**: Copy the template file:
  ```
  From: android\keystore.properties.template
  To:   android\keystore.properties
  ```
- [ ] **Step 2.2**: Edit `android\keystore.properties` and replace with your actual passwords:
  ```properties
  RELEASE_STORE_FILE=visit-polzela-release.keystore
  RELEASE_STORE_PASSWORD=your_actual_keystore_password
  RELEASE_KEY_ALIAS=visit-polzela
  RELEASE_KEY_PASSWORD=your_actual_key_password
  ```
- [ ] **Step 2.3**: Save the file (it's in .gitignore, won't be committed)

### PHASE 3: Build Signed App Bundle

- [ ] **Step 3.1**: Build your frontend:
  ```bash
  npm run build:mobile
  ```
- [ ] **Step 3.2**: Build the signed AAB:
  ```bash
  npm run deploy:prepare
  ```
  OR use Android Studio (Build > Generate Signed Bundle / APK)

- [ ] **Step 3.3**: Find your AAB file at:
  ```
  android\app\build\outputs\bundle\release\app-release.aab
  ```

### PHASE 4: Prepare Play Store Assets

- [ ] **Screenshots**: Take 2-8 screenshots of your app (1080x1920 or device resolution)
- [ ] **Feature Graphic**: Create 1024x500 banner image
- [ ] **App Icon**: High-res 512x512 PNG
- [ ] **Privacy Policy**: Create and host privacy policy (required by Google)
- [ ] **Descriptions**: Write short (80 chars) and full (4000 chars) descriptions

### PHASE 5: Upload to Play Console

- [ ] **Step 5.1**: Go to https://play.google.com/console
- [ ] **Step 5.2**: Click "Create app"
- [ ] **Step 5.3**: Fill in app details
- [ ] **Step 5.4**: Complete all required sections:
  - [ ] Main store listing
  - [ ] Content rating
  - [ ] Target audience
  - [ ] Data safety
  - [ ] App access
  - [ ] Ads declaration
- [ ] **Step 5.5**: Upload your AAB file
- [ ] **Step 5.6**: Submit for review

### PHASE 6: Post-Submission

- [ ] Monitor review status (1-7 days typically)
- [ ] Respond to any Google requests
- [ ] App goes live automatically when approved!

---

## 🚨 CRITICAL REMINDERS

1. **BACKUP YOUR KEYSTORE** - You can NEVER update your app without it!
2. **SAVE PASSWORDS** - Store them in a password manager
3. **DON'T COMMIT** - keystore.properties and .keystore files are in .gitignore
4. **TEST FIRST** - Run the app on a device before uploading to Play Store

---

## 📞 Need Help?

- Detailed guide: See `PLAY_STORE_DEPLOYMENT.md`
- Google Play Console: https://support.google.com/googleplay/android-developer

---

**Status**: ⏳ Waiting for you to generate keystore and configure signing
**Next Action**: Run the keytool command to generate your signing key


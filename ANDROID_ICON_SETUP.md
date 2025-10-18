# Android App Icon Setup Guide

## 📱 Where to Place Your PNG Icon Files

Place your PNG icon files in these Android resource directories:

### Required Icon Sizes and Locations

```
android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher.png          (48x48 px)
├── mipmap-hdpi/
│   └── ic_launcher.png          (72x72 px)
├── mipmap-xhdpi/
│   └── ic_launcher.png          (96x96 px)
├── mipmap-xxhdpi/
│   └── ic_launcher.png          (144x144 px)
└── mipmap-xxxhdpi/
    └── ic_launcher.png          (192x192 px)
```

## 🎨 How to Create the Icons

### Option 1: Use an Online Tool (Easiest)

1. **Create a 512x512 PNG** of your app icon
2. Use one of these free tools to generate all sizes:
   - https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - https://easyappicon.com/
   - https://appicon.co/

3. Download the generated files
4. Copy them to the directories listed above

### Option 2: Manual Creation

If you have image editing software (Photoshop, GIMP, etc.):

1. Create your icon at **512x512 pixels**
2. Export/resize to these sizes:
   - **48x48** → Save as `mipmap-mdpi/ic_launcher.png`
   - **72x72** → Save as `mipmap-hdpi/ic_launcher.png`
   - **96x96** → Save as `mipmap-xhdpi/ic_launcher.png`
   - **144x144** → Save as `mipmap-xxhdpi/ic_launcher.png`
   - **192x192** → Save as `mipmap-xxxhdpi/ic_launcher.png`

### Option 3: Use Capacitor Assets Generator

If you have a source PNG (recommended 1024x1024), you can use:

```bash
npm install -g @capacitor/assets
```

Then place your icon at:
```
resources/icon.png
```

And run:
```bash
npx @capacitor/assets generate --android
```

## 📁 Full File Paths

Copy your PNG files to these exact locations:

```
C:\Users\hriba\GitHub_repositories\visit-polzela\android\app\src\main\res\mipmap-mdpi\ic_launcher.png
C:\Users\hriba\GitHub_repositories\visit-polzela\android\app\src\main\res\mipmap-hdpi\ic_launcher.png
C:\Users\hriba\GitHub_repositories\visit-polzela\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png
C:\Users\hriba\GitHub_repositories\visit-polzela\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png
C:\Users\hriba\GitHub_repositories\visit-polzela\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png
```

## ✅ After Adding Icons

Once you've placed the PNG files:

1. **No need to rebuild** - Just run the app again in Android Studio
2. **If icons don't update**, clean and rebuild:
   ```bash
   npm run android:clean
   ```
   Then in Android Studio: `Build > Clean Project` > `Build > Rebuild Project`

## 🔄 Optional: Round Icons (Modern Android)

For modern Android devices with round icon support, also create:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher_round.png    (48x48 px)
├── mipmap-hdpi/
│   └── ic_launcher_round.png    (72x72 px)
├── mipmap-xhdpi/
│   └── ic_launcher_round.png    (96x96 px)
├── mipmap-xxhdpi/
│   └── ic_launcher_round.png    (144x144 px)
└── mipmap-xxxhdpi/
    └── ic_launcher_round.png    (192x192 px)
```

## 💡 Tips

1. **Keep it simple** - App icons should be recognizable even at small sizes
2. **Use transparency** - PNG format supports transparency for better appearance
3. **Test on device** - Check how the icon looks on the actual device/emulator
4. **Square canvas** - Always use square dimensions (512x512, 1024x1024)
5. **No text** - Avoid small text as it becomes unreadable at small sizes

## 🎯 Quick Summary

**Minimum Required:**
- Create 5 PNG files at different sizes (48, 72, 96, 144, 192 pixels)
- Name them all `ic_launcher.png`
- Place in the 5 mipmap directories listed above
- Run your app in Android Studio

**Recommended:**
- Use an icon generator tool (saves time and ensures proper sizing)
- Start with a 1024x1024 PNG source file
- Keep the source file for future updates

---

**Current Status**: Default Capacitor icons are being used
**Action Needed**: Create and place PNG icon files in the mipmap directories above


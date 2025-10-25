# Android Build Guide for Google Play Store

This guide will help you build APK and AAB files for your React Native/Expo app to upload to Google Play Store.

## Prerequisites

- Android Studio installed
- Java Development Kit (JDK) 17 or higher
- Android SDK with build tools
- Node.js and npm/yarn
- Expo CLI installed globally: `npm install -g @expo/cli`

## Step 1: Generate Production Keystore

### For Windows:
```bash
# Run the keystore generation script
./generate-keystore.bat
```

### For macOS/Linux:
```bash
# Make script executable and run
chmod +x generate-keystore.sh
./generate-keystore.sh
```

**Important:** 
- Keep the keystore file and passwords safe
- You'll need these for future app updates
- Store the keystore in a secure backup location

## Step 2: Configure Build Properties

After generating the keystore, update `android/gradle.properties` with your keystore details:

```properties
# Add these lines to android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=keystore/upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

## Step 3: Build APK (for testing)

### For Windows:
```bash
./build-apk.bat
```

### For macOS/Linux:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

## Step 4: Build AAB (for Google Play Store)

### For Windows:
```bash
./build-aab.bat
```

### For macOS/Linux:
```bash
chmod +x build-aab.sh
./build-aab.sh
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

## Step 5: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app or create a new one
3. Navigate to "Release" → "Production" (or "Internal testing" for testing)
4. Click "Create new release"
5. Upload the AAB file (`app-release.aab`)
6. Fill in release notes and other required information
7. Review and publish

## Troubleshooting

### Common Issues:

1. **Build fails with signing errors:**
   - Ensure keystore file exists and paths are correct
   - Check that passwords in gradle.properties match your keystore

2. **Memory issues during build:**
   - Increase heap size in `android/gradle.properties`:
   ```properties
   org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
   ```

3. **Missing dependencies:**
   - Run `npm install` in the frontend directory
   - Ensure all Expo dependencies are installed

4. **Android SDK issues:**
   - Open Android Studio and install required SDK components
   - Ensure ANDROID_HOME environment variable is set

### Manual Build Commands:

If scripts don't work, you can run commands manually:

```bash
# Navigate to android directory
cd android

# Clean and build APK
./gradlew clean assembleRelease

# Clean and build AAB
./gradlew clean bundleRelease
```

## File Locations

- **APK:** `android/app/build/outputs/apk/release/app-release.apk`
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Keystore:** `android/keystore/upload-keystore.jks`

## Security Notes

- Never commit keystore files to version control
- Store keystore passwords securely
- Use different keystores for debug and release builds
- Keep backup copies of your production keystore

## Next Steps

1. Test the APK on various Android devices
2. Upload AAB to Google Play Console
3. Complete the app listing information
4. Submit for review
5. Monitor app performance and user feedback

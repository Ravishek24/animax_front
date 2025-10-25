@echo off
REM Script to generate a production keystore for Android app signing
REM This keystore will be used to sign your APK/AAB for Google Play Store

echo 🔐 Generating production keystore for Android app signing...

REM Create keystore directory if it doesn't exist
if not exist "android\keystore" mkdir android\keystore

REM Generate the keystore
keytool -genkey -v -keystore android\keystore\upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

echo ✅ Keystore generated successfully!
echo 📁 Location: android\keystore\upload-keystore.jks
echo.
echo ⚠️  IMPORTANT: Keep this keystore file and passwords safe!
echo    - Store the keystore file in a secure location
echo    - Remember the passwords you entered
echo    - You'll need these to update your app on Google Play Store
echo.
echo 📝 Next steps:
echo    1. Copy the keystore file to a secure backup location
echo    2. Update your gradle.properties with the keystore details
echo    3. Run the build scripts to create APK/AAB files

pause

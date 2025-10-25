@echo off
REM Script to build release APK for Android
echo 🚀 Building release APK...

REM Navigate to android directory
cd android

REM Clean previous builds
echo 🧹 Cleaning previous builds...
gradlew.bat clean

REM Build release APK
echo 📦 Building release APK...
gradlew.bat assembleRelease

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ APK build successful!
    echo 📁 APK location: android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo 📱 You can now:
    echo    - Install the APK on Android devices for testing
    echo    - Upload to Google Play Console for internal testing
    echo    - Share with beta testers
) else (
    echo ❌ APK build failed!
    echo Please check the error messages above and fix any issues.
    pause
    exit /b 1
)

pause

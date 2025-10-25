@echo off
REM Script to build Android App Bundle (AAB) for Google Play Store
echo 🚀 Building Android App Bundle (AAB) for Google Play Store...

REM Navigate to android directory
cd android

REM Clean previous builds
echo 🧹 Cleaning previous builds...
gradlew.bat clean

REM Build release AAB
echo 📦 Building release AAB...
gradlew.bat bundleRelease

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ AAB build successful!
    echo 📁 AAB location: android\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo 📱 You can now:
    echo    - Upload the AAB to Google Play Console
    echo    - The AAB will be automatically optimized for different device configurations
    echo    - Google Play will generate APKs for different device types
    echo.
    echo 🔗 Next steps:
    echo    1. Go to Google Play Console
    echo    2. Create a new release or update existing release
    echo    3. Upload the AAB file
    echo    4. Complete the release process
) else (
    echo ❌ AAB build failed!
    echo Please check the error messages above and fix any issues.
    pause
    exit /b 1
)

pause

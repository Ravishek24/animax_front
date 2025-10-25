#!/bin/bash

# Script to build release APK for Android
echo "🚀 Building release APK..."

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release APK
echo "📦 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ APK build successful!"
    echo "📁 APK location: android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "📱 You can now:"
    echo "   - Install the APK on Android devices for testing"
    echo "   - Upload to Google Play Console for internal testing"
    echo "   - Share with beta testers"
else
    echo "❌ APK build failed!"
    echo "Please check the error messages above and fix any issues."
    exit 1
fi

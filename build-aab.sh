#!/bin/bash

# Script to build Android App Bundle (AAB) for Google Play Store
echo "🚀 Building Android App Bundle (AAB) for Google Play Store..."

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release AAB
echo "📦 Building release AAB..."
./gradlew bundleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ AAB build successful!"
    echo "📁 AAB location: android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "📱 You can now:"
    echo "   - Upload the AAB to Google Play Console"
    echo "   - The AAB will be automatically optimized for different device configurations"
    echo "   - Google Play will generate APKs for different device types"
    echo ""
    echo "🔗 Next steps:"
    echo "   1. Go to Google Play Console"
    echo "   2. Create a new release or update existing release"
    echo "   3. Upload the AAB file"
    echo "   4. Complete the release process"
else
    echo "❌ AAB build failed!"
    echo "Please check the error messages above and fix any issues."
    exit 1
fi

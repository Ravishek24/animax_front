#!/bin/bash

echo "🔄 Rebuilding Expo app with new configuration..."

# Clean Expo cache
echo "🧹 Cleaning Expo cache..."
npx expo start --clear

# Run prebuild to regenerate native code with new package name
echo "🔨 Running prebuild with new package name..."
npx expo prebuild --clean

# Build and run on Android
echo "📱 Building and running on Android..."
npx expo run:android

echo "✅ Rebuild complete!"
echo ""
echo "📋 Next steps:"
echo "1. Uninstall any old versions of your app"
echo "2. Test the payment flow"
echo "3. Check console logs for detailed debugging info"
echo ""
echo "🔍 If you still see wrong apps opening:"
echo "- Check which package name is being used in console logs"
echo "- Uninstall conflicting apps with similar schemes"
echo "- Test with: adb shell am start -W -a android.intent.action.VIEW -d 'upi://pay?pa=test@bank'"

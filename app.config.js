export default {
  expo: {
    name: "Pashupalak",
    slug: "Pashupalak",
    scheme: "animalmarketplace", // Unique scheme to avoid conflicts
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.animalmarketplace.app" // Unique iOS bundle ID
    },
    android: {
      package: "com.animalmarketplace.app", // Unique Android package name
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      // Remove conflicting intent filters - let payment apps handle their own URLs
      // We don't want our app to intercept payment URLs
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router"
    ]
  }
};
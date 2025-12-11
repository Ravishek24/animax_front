# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# PayU Payment SDK rules
-keep class com.payu.** { *; }
-keep class com.payu.cardscanner.** { *; }
-keep class com.payu.phonepe.** { *; }
-keep class com.payu.ppiscanner.** { *; }
-keep class com.payu.ui.** { *; }
-keep class com.payu.base.** { *; }
-keep class com.payu.checkoutpro.** { *; }
-keep class com.payu.commonui.** { *; }

# Some PayU modules (card scanner, PhonePe, PPI scanner) are optional and may not be
# packaged. Prevent R8 from failing when these classes are referenced but not present.
-dontwarn com.payu.cardscanner.**
-dontwarn com.payu.phonepe.**
-dontwarn com.payu.ppiscanner.**

# Keep PayU callback interfaces
-keep interface com.payu.cardscanner.callbacks.** { *; }
-keep interface com.payu.phonepe.callbacks.** { *; }
-keep interface com.payu.ppiscanner.interfaces.** { *; }

# Keep PayU classes that might be missing
-keep class com.payu.cardscanner.PayU { *; }
-keep class com.payu.phonepe.PhonePe { *; }
-keep class com.payu.ppiscanner.PayUQRScanner { *; }
-keep class com.payu.ppiscanner.PayUScannerConfig { *; }

# React Native rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# Expo modules
-keep class expo.modules.** { *; }

# React Native core, Hermes, Yoga, DevSupport
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.yoga.** { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Network stack and JSON
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# Kotlin metadata/reflection used by libraries
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# Keep annotations and signatures often required at runtime
-keepattributes *Annotation*, InnerClasses, Signature, EnclosingMethod

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

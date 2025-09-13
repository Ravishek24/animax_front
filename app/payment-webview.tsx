import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PaymentWebView = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectingToApp, setRedirectingToApp] = useState(false);
  const [paymentStartTime] = useState(Date.now());
  const [isInPaymentFlow, setIsInPaymentFlow] = useState(false);
  
  const paymentUrl = params.paymentUrl as string;

  const handleNavigationStateChange = (navState: any) => {
    console.log('🔍 Navigation state changed:', {
      url: navState.url,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
      loading: navState.loading,
      title: navState.title
    });
    
    // Log the full URL for debugging
    if (navState.url && (navState.url.startsWith('intent://') || navState.url.startsWith('upi://'))) {
      console.log('🔍 Full payment URL:', navState.url);
    }
    
    // Payment URLs are now handled in onShouldStartLoadWithRequest
    // This prevents the WebView from trying to load them
    if (navState.url.startsWith('intent://') || navState.url.startsWith('upi://')) {
      console.log('🔍 Payment URL detected in navigation - should be handled by onShouldStartLoadWithRequest');
      return;
    }
    
    // Skip data URLs and PayU internal URLs
    if (navState.url.startsWith('data:') || navState.url.includes('apitest.payu.in') || navState.url.includes('test.payu.in')) {
      console.log('🔍 Skipping PayU internal navigation');
      return;
    }
    
    // Handle cases where navigation fails due to app redirects
    // This happens when canGoBack/canGoForward is false and loading stops
    if (!navState.canGoBack && !navState.canGoForward && !navState.loading) {
      console.log('🔍 Navigation blocked - likely due to app redirect');
      
      // Check if this looks like a payment redirect URL
      const paymentKeywords = ['pay', 'upi', 'payment', 'transaction', 'bank'];
      const isPaymentUrl = paymentKeywords.some(keyword => 
        navState.url.toLowerCase().includes(keyword)
      );
      
      if (isPaymentUrl && navState.url !== paymentUrl) {
        console.log('🔍 Payment redirect detected but blocked by WebView');
        setRedirectingToApp(false); // Stop any loading indicators
        return;
      }
    }
    
    // Check if user is redirected to success/failure URLs
    if (navState.url.includes('/api/payments/success')) {
      console.log('✅ Payment successful!');
      Alert.alert(
        'Payment Successful',
        'Your payment has been processed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } else if (navState.url.includes('/api/payments/failure')) {
      console.log('❌ Payment failed!');
      Alert.alert(
        'Payment Failed',
        'Your payment could not be processed. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  const handleLoadStart = () => {
    console.log('🔍 Payment page loading started');
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    console.log('🔍 Payment page loading completed');
    setLoading(false);
  };

  const tryOpenSpecificUPIApp = async (url: string, targetPackage?: string) => {
    console.log('🔍 [Expo] Trying to open specific UPI app for URL:', url);
    
    if (targetPackage) {
      // Try to open the specific target package
      try {
        const upiParams = url.includes('?') ? url.split('?')[1] : '';
        const intentUrl = `intent://pay?${upiParams}#Intent;package=${targetPackage};scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;flags=0x10000000;end`;
        console.log(`🔍 [Expo] Trying specific package ${targetPackage} with URL:`, intentUrl);
        
        await Linking.openURL(intentUrl);
        console.log(`🔍 [Expo] Successfully opened ${targetPackage}`);
        return true;
      } catch (error) {
        console.log(`🔍 [Expo] Failed to open ${targetPackage}:`, error);
      }
    }
    
    // Fallback: Try different UPI app packages in order of preference
    const upiApps = [
      { name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user' },
      { name: 'PhonePe', package: 'com.phonepe.app' },
      { name: 'Paytm', package: 'net.one97.paytm' },
      { name: 'BHIM', package: 'in.org.npci.upiapp' },
      { name: 'Amazon Pay', package: 'in.amazon.mShop.android.shopping' }
    ];
    
    // Convert UPI URL to Intent URL with specific package
    for (const app of upiApps) {
      try {
        const upiParams = url.includes('?') ? url.split('?')[1] : '';
        const intentUrl = `intent://pay?${upiParams}#Intent;package=${app.package};scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;flags=0x10000000;end`;
        console.log(`🔍 [Expo] Trying ${app.name} with URL:`, intentUrl);
        
        await Linking.openURL(intentUrl);
        console.log(`🔍 [Expo] Successfully opened ${app.name}`);
        return true;
      } catch (error) {
        console.log(`🔍 [Expo] ${app.name} failed:`, error);
      }
    }
    
    return false;
  };

  const handlePaymentUrl = (url: string) => {
    console.log('🔍 [Expo] Handling payment URL:', url);
    
    if (url.startsWith('intent://')) {
      // Extract payment app info from intent URL
      let appName = 'Payment App';
      let expectedPackage = '';
      
      if (url.includes('phonepe')) {
        appName = 'PhonePe';
        expectedPackage = 'com.phonepe.app';
      } else if (url.includes('paytm')) {
        appName = 'Paytm';
        expectedPackage = 'net.one97.paytm';
      } else if (url.includes('gpay') || url.includes('googlepay')) {
        appName = 'Google Pay';
        expectedPackage = 'com.google.android.apps.nbu.paisa.user';
      } else if (url.includes('bhim')) {
        appName = 'BHIM';
        expectedPackage = 'in.org.npci.upiapp';
      }
      
      console.log('🔍 [Expo] Detected app:', appName, 'Expected package:', expectedPackage);
      
      Alert.alert(
        `Open ${appName}`,
        `You will be redirected to ${appName} to complete the payment. After payment, please return to this app.\n\nIMPORTANT: If an app chooser appears, select "${appName}" from the list. If the wrong app opens, please select the correct payment app.`,
        [
          {
            text: 'Continue',
            onPress: async () => {
              try {
                setRedirectingToApp(true);
                console.log('🔍 [Expo] Opening payment app:', url);
                console.log('🔍 [Expo] App name:', appName);
                
                // Test if we can open the URL first (for debugging)
                try {
                  const canOpen = await Linking.canOpenURL(url);
                  console.log('🔍 [Expo] canOpenURL result:', canOpen);
                } catch (canOpenError) {
                  console.log('🔍 [Expo] canOpenURL failed:', canOpenError);
                }
                
                // Parse the Intent URL to understand what's happening
                console.log('🔍 [Expo] Full Intent URL:', url);
                
                // Try to extract package name from Intent URL
                const packageMatch = url.match(/package=([^;&]+)/);
                if (packageMatch) {
                  console.log('🔍 [Expo] Intent package:', packageMatch[1]);
                }
                
                // Try to extract action from Intent URL
                const actionMatch = url.match(/action=([^;&]+)/);
                if (actionMatch) {
                  console.log('🔍 [Expo] Intent action:', actionMatch[1]);
                }
                
                // Try to extract data from Intent URL
                const dataMatch = url.match(/data=([^;&]+)/);
                if (dataMatch) {
                  console.log('🔍 [Expo] Intent data:', dataMatch[1]);
                }
                
                // Create a more specific Intent URL that forces the correct app
                let finalUrl = url;
                
                if (expectedPackage) {
                  console.log('🔍 [Expo] Creating specific Intent for package:', expectedPackage);
                  
                  // Extract the UPI parameters from the Intent URL
                  const upiParams = url.match(/intent:\/\/pay\?([^#]+)/);
                  if (upiParams) {
                    const params = upiParams[1];
                    console.log('🔍 [Expo] UPI parameters:', params);
                    
                    // Create a very specific Intent URL that should force the correct app
                    finalUrl = `intent://pay?${params}#Intent;package=${expectedPackage};scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;flags=0x10000000;end`;
                    console.log('🔍 [Expo] Force-specific Intent URL:', finalUrl);
                  }
                }
                
                // Try multiple approaches to ensure the correct app opens
                let success = false;
                
                // Method 1: Try with the enhanced Intent URL
                try {
                  console.log('🔍 [Expo] Method 1: Attempting to open with enhanced Intent URL');
                  await Linking.openURL(finalUrl);
                  console.log('🔍 [Expo] Method 1: Payment app opened successfully');
                  success = true;
                } catch (firstError) {
                  console.log('🔍 [Expo] Method 1 failed:', firstError);
                }
                
                // Method 2: Try with original URL but force package
                if (!success) {
                  try {
                    console.log('🔍 [Expo] Method 2: Trying with forced package');
                    const fallbackUrl = `${url};package=${expectedPackage};flags=0x10000000`;
                    await Linking.openURL(fallbackUrl);
                    console.log('🔍 [Expo] Method 2: Payment app opened successfully');
                    success = true;
                  } catch (secondError) {
                    console.log('🔍 [Expo] Method 2 failed:', secondError);
                  }
                }
                
                // Method 3: Try with UPI-specific function
                if (!success) {
                  try {
                    console.log('🔍 [Expo] Method 3: Trying with UPI-specific function');
                    const upiSuccess = await tryOpenSpecificUPIApp(url, expectedPackage);
                    if (upiSuccess) {
                      console.log('🔍 [Expo] Method 3: Payment app opened successfully');
                      success = true;
                    }
                  } catch (thirdError) {
                    console.log('🔍 [Expo] Method 3 failed:', thirdError);
                  }
                }
                
                if (!success) {
                  throw new Error('All methods failed to open the payment app');
                }
                
                setTimeout(() => setRedirectingToApp(false), 3000);
              } catch (error) {
                setRedirectingToApp(false);
                console.error('🔍 [Expo] Failed to open payment app:', error);
                
                // Type-safe error handling
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('🔍 [Expo] Error details:', {
                  message: errorMessage,
                  error: error
                });
                
                // Check if it's a "no app found" error
                if (errorMessage.includes('No Activity found')) {
                  Alert.alert('App Not Found', `${appName} is not installed. Please install the app or choose a different payment method.`);
                } else {
                  // For other errors, assume the app might be there but had an issue
                  Alert.alert('Payment App', `Please complete the payment in ${appName} if it opened, or try a different payment method.`);
                }
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
    } else if (url.startsWith('upi://')) {
      console.log('🔍 [Expo] UPI URL detected:', url);
      
      // Parse UPI URL to understand the payment details
      const upiMatch = url.match(/upi:\/\/pay\?([^&]+)/);
      if (upiMatch) {
        const params = upiMatch[1];
        console.log('🔍 [Expo] UPI parameters:', params);
        
        // Extract payment details
        const paMatch = params.match(/pa=([^&]+)/);
        if (paMatch) {
          console.log('🔍 [Expo] UPI Payee:', paMatch[1]);
        }
      }
      
      Alert.alert(
        'UPI Payment',
        'Choose your UPI app to complete the payment. After payment, please return to this app.',
        [
          {
            text: 'Google Pay',
            onPress: async () => {
              try {
                setRedirectingToApp(true);
                const upiParams = url.split('?')[1];
                const intentUrl = `intent://pay?${upiParams}#Intent;package=com.google.android.apps.nbu.paisa.user;scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;end`;
                console.log('🔍 [Expo] Google Pay Intent URL:', intentUrl);
                await Linking.openURL(intentUrl);
                setTimeout(() => setRedirectingToApp(false), 3000);
              } catch (error) {
                setRedirectingToApp(false);
                console.error('🔍 [Expo] Google Pay error:', error);
                Alert.alert('Error', 'Google Pay is not installed or cannot be opened.');
              }
            }
          },
          {
            text: 'PhonePe',
            onPress: async () => {
              try {
                setRedirectingToApp(true);
                const upiParams = url.split('?')[1];
                const intentUrl = `intent://pay?${upiParams}#Intent;package=com.phonepe.app;scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;end`;
                console.log('🔍 [Expo] PhonePe Intent URL:', intentUrl);
                await Linking.openURL(intentUrl);
                setTimeout(() => setRedirectingToApp(false), 3000);
              } catch (error) {
                setRedirectingToApp(false);
                console.error('🔍 [Expo] PhonePe error:', error);
                Alert.alert('Error', 'PhonePe is not installed or cannot be opened.');
              }
            }
          },
          {
            text: 'Paytm',
            onPress: async () => {
              try {
                setRedirectingToApp(true);
                const upiParams = url.split('?')[1];
                const intentUrl = `intent://pay?${upiParams}#Intent;package=net.one97.paytm;scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;end`;
                console.log('🔍 [Expo] Paytm Intent URL:', intentUrl);
                await Linking.openURL(intentUrl);
                setTimeout(() => setRedirectingToApp(false), 3000);
              } catch (error) {
                setRedirectingToApp(false);
                console.error('🔍 [Expo] Paytm error:', error);
                Alert.alert('Error', 'Paytm is not installed or cannot be opened.');
              }
            }
          },
          {
            text: 'Other UPI App',
            onPress: async () => {
              try {
                setRedirectingToApp(true);
                console.log('🔍 [Expo] Opening generic UPI app:', url);
                
                // For UPI URLs, canOpenURL often returns false even when app is installed
                // So we'll try to open directly and handle errors gracefully
                await Linking.openURL(url);
                setTimeout(() => setRedirectingToApp(false), 3000);
              } catch (error) {
                setRedirectingToApp(false);
                console.error('🔍 [Expo] Failed to open UPI app:', error);
                Alert.alert('Error', 'Unable to open UPI app. Please try a different payment method.');
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('🔍 WebView error detected:', nativeEvent);
    
    // Check if this is an expected payment URL error
    const isPaymentUrlError = (
      (nativeEvent.url && nativeEvent.url.startsWith('intent://')) ||
      (nativeEvent.url && nativeEvent.url.startsWith('upi://')) ||
      (nativeEvent.description && nativeEvent.description.includes('ERR_UNKNOWN_URL_SCHEME'))
    );
    
    if (isPaymentUrlError) {
      console.log('🔍 Payment URL error suppressed - this is expected behavior');
      console.log('🔍 Error details (for debugging only):', {
        code: nativeEvent.code,
        description: nativeEvent.description,
        url: nativeEvent.url,
        canGoBack: nativeEvent.canGoBack,
        canGoForward: nativeEvent.canGoForward
      });
      
      // Suppress payment URL errors - they are handled by onNavigationStateChange
      return;
    }
    
    // For other errors, show them to the user
    console.error('❌ Unexpected WebView error:', nativeEvent);
    setError('Failed to load payment page. Please try again.');
    setLoading(false);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('🔍 Received message from WebView:', data);
      
      if (data.type === 'PAYMENT_SUCCESS') {
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else if (data.type === 'PAYMENT_FAILURE') {
        Alert.alert(
          'Payment Failed',
          'Your payment could not be processed. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#990906" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {(loading || redirectingToApp) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#990906" />
          <Text style={styles.loadingText}>
            {redirectingToApp ? 'Opening Payment App...' : 'Loading Payment Page...'}
          </Text>
        </View>
      )}
      
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        originWhitelist={['https://*', 'http://*', 'intent://*', 'upi://*', 'data:*']}
        mixedContentMode="compatibility"
        allowsFullscreenVideo={true}
        bounces={false}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        onShouldStartLoadWithRequest={(request) => {
          console.log('🔍 [Expo] onShouldStartLoadWithRequest called:', {
            url: request.url,
            navigationType: request.navigationType,
            mainDocumentURL: request.mainDocumentURL,
            isTopFrame: request.isTopFrame
          });
          
          // Handle Intent URLs (for Expo apps)
          if (request.url.startsWith('intent://')) {
            console.log('🔍 [Expo] BLOCKING Intent URL from loading in WebView:', request.url);
            
            // Handle the URL immediately
            setTimeout(() => {
              handlePaymentUrl(request.url);
            }, 100);
            
            return false; // Prevent WebView from loading the URL
          }
          
          // Handle UPI URLs (for Expo apps)
          if (request.url.startsWith('upi://')) {
            console.log('🔍 [Expo] BLOCKING UPI URL from loading in WebView:', request.url);
            
            // Handle the URL immediately
            setTimeout(() => {
              handlePaymentUrl(request.url);
            }, 100);
            
            return false; // Prevent WebView from loading the URL
          }
          
          // Handle other payment schemes
          if (request.url.startsWith('tel:') || request.url.startsWith('mailto:') || request.url.startsWith('sms:')) {
            console.log('🔍 [Expo] BLOCKING other payment scheme:', request.url);
            
            try {
              Linking.openURL(request.url);
            } catch (error) {
              console.error('Failed to open URL:', error);
            }
            
            return false;
          }
          
          console.log('🔍 [Expo] ALLOWING URL to load in WebView:', request.url);
          return true; // Allow other URLs to load normally
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#990906',
    textAlign: 'center',
  },
});

export default PaymentWebView;

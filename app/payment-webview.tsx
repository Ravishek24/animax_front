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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(params.paymentUrl as string);

  const handleNavigationStateChange = (navState: any) => {
    // Prevent going back to payment form after it's been submitted
    if (formSubmitted && navState.url.includes('/api/payments/form/')) {
      return;
    }
    
    // Payment URLs are now handled in onShouldStartLoadWithRequest
    // This prevents the WebView from trying to load them
    if (navState.url.startsWith('intent://') || navState.url.startsWith('upi://')) {
      return;
    }
    
    // Allow PayU internal URLs to load without interference
    if (navState.url.includes('apitest.payu.in') || navState.url.includes('test.payu.in') || navState.url.includes('payu.in')) {
      setIsInPaymentFlow(true);
      return;
    }
    
    // Handle cases where navigation fails due to app redirects
    // This happens when canGoBack/canGoForward is false and loading stops
    if (!navState.canGoBack && !navState.canGoForward && !navState.loading) {
      // Check if this looks like a payment redirect URL
      const paymentKeywords = ['pay', 'upi', 'payment', 'transaction', 'bank'];
      const isPaymentUrl = paymentKeywords.some(keyword => 
        navState.url.toLowerCase().includes(keyword)
      );
      
      if (isPaymentUrl && navState.url !== paymentUrl) {
        setRedirectingToApp(false); // Stop any loading indicators
        return;
      }
    }
    
    // Check if user is redirected to success/failure URLs
    if (navState.url.includes('/api/payments/success')) {
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
    // Only show loading for initial page load, not PayU pages
    if (!isInPaymentFlow) {
      setLoading(true);
    }
    setError(null);
  };

  const handleLoadEnd = () => {
    // Always hide loading indicator once page is loaded
    setLoading(false);
  };

  const openGenericUPIIntent = async (originalUrl: string) => {
    try {
      setRedirectingToApp(true);
      
      // Extract UPI parameters
      let upiParams = '';
      if (originalUrl.startsWith('intent://')) {
        const intentMatch = originalUrl.match(/intent:\/\/pay\?([^#]+)/);
        if (intentMatch) {
          upiParams = intentMatch[1];
        }
      } else if (originalUrl.startsWith('upi://')) {
        const upiMatch = originalUrl.match(/upi:\/\/pay\?(.+)/);
        if (upiMatch) {
          upiParams = upiMatch[1];
        }
      }
      
      // Use standard upi:// URL which will trigger Android's app chooser
      const upiUrl = `upi://pay?${upiParams}`;
      
      await Linking.openURL(upiUrl);
      
      setTimeout(() => setRedirectingToApp(false), 3000);
    } catch (error) {
      setRedirectingToApp(false);
      Alert.alert(
        'No UPI Apps Found',
        'No UPI apps found on your device. Please install a UPI app like Google Pay, PhonePe, or Paytm.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  const showUPIAppChooser = (originalUrl: string) => {
    // For React Native/Expo, the best approach is to just open the generic UPI intent
    // and let Android's native chooser handle app selection
    Alert.alert(
      'Choose Payment App',
      'Select your UPI app to complete the payment. Android will show you all available UPI apps.',
      [
        {
          text: 'Show UPI Apps',
          onPress: () => openGenericUPIIntent(originalUrl)
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
  };

  const handlePaymentUrl = async (url: string) => {
    if (url.startsWith('intent://') || url.startsWith('upi://')) {
      // Extract package name from the intent URL for informational purposes
      const packageMatch = url.match(/package=([^;&]+)/);
      const originalPackage = packageMatch ? packageMatch[1] : null;
      
      // Map package names to user-friendly names
      const packageToAppName: Record<string, string> = {
        'com.phonepe.app': 'PhonePe',
        'net.one97.paytm': 'Paytm',
        'com.google.android.apps.nbu.paisa.user': 'Google Pay',
        'in.org.npci.upiapp': 'BHIM UPI',
        'in.amazon.mShop.android.shopping': 'Amazon Pay',
        'com.mobikwik_new': 'MobiKwik',
        'com.freecharge.android': 'Freecharge'
      };
      
      // Determine suggested app name based on package
      let suggestedAppName = 'your UPI app';
      if (originalPackage && packageToAppName[originalPackage]) {
        suggestedAppName = packageToAppName[originalPackage];
      }
      
      // For React Native, we can't reliably open a specific package
      // Instead, we open the generic UPI intent and let Android handle the app selection
      Alert.alert(
        'Complete Payment',
        `PayU suggests using ${suggestedAppName}. You'll be shown all available UPI apps to choose from.`,
        [
          {
            text: 'Continue',
            onPress: async () => {
              await openGenericUPIIntent(url);
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
    
    // Check if this is an expected payment URL error
    const isPaymentUrlError = (
      (nativeEvent.url && nativeEvent.url.startsWith('intent://')) ||
      (nativeEvent.url && nativeEvent.url.startsWith('upi://')) ||
      (nativeEvent.description && nativeEvent.description.includes('ERR_UNKNOWN_URL_SCHEME'))
    );
    
    if (isPaymentUrlError) {
      // Suppress payment URL errors - they are handled by onNavigationStateChange
      return;
    }
    
    // For other errors, show them to the user
    setError('Failed to load payment page. Please try again.');
    setLoading(false);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'FORM_SUBMITTED') {
        setFormSubmitted(true);
        setIsInPaymentFlow(true);
      } else if (data.type === 'PAYMENT_SUCCESS') {
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
      // Silent error handling
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
        startInLoadingState={false}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        originWhitelist={['https://*', 'http://*', 'intent://*', 'upi://*']}
        mixedContentMode="compatibility"
        allowsFullscreenVideo={true}
        bounces={false}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        injectedJavaScript={`
          // Enhanced form submission and error detection for PayU
          (function() {
            // Track if form has been submitted to prevent duplicates
            let formSubmitted = false;
            
            // Function to check and submit form
            function checkAndSubmitForm() {
              if (formSubmitted) {
                return;
              }
              
              const form = document.getElementById('payment_post') || document.forms['payment_post'];
              if (form) {
                // If we're still on the payment form page (not PayU), trigger submit
                if (!window.location.href.includes('payu.in')) {
                  try {
                    formSubmitted = true; // Mark as submitted before submitting
                    form.submit();
                    
                    // Notify React Native that form was submitted (only once)
                    if (window.ReactNativeWebView && !window.formSubmittedNotified) {
                      window.formSubmittedNotified = true;
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'FORM_SUBMITTED',
                        url: window.location.href
                      }));
                    }
                  } catch (e) {
                    formSubmitted = false; // Reset if submission failed
                  }
                }
              }
            }
            
            // Function to check for PayU errors or messages
            function checkForPayUContent() {
              if (window.location.href.includes('payu.in')) {
                // Check for common error indicators
                const bodyText = document.body ? document.body.innerText : '';
                if (bodyText.includes('Error') || bodyText.includes('error') || bodyText.includes('Invalid')) {
                  // Silent error detection
                }
              }
            }
            
            // Single form submission attempt
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              setTimeout(function() {
                checkAndSubmitForm();
                checkForPayUContent();
              }, 1000);
            } else {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                  checkAndSubmitForm();
                  checkForPayUContent();
                }, 1000);
              });
            }
          })();
          true; // Required by React Native WebView
        `}
        onShouldStartLoadWithRequest={(request) => {
          // Prevent going back to payment form after submission
          if (formSubmitted && request.url.includes('/api/payments/form/')) {
            return false;
          }
          
          // Handle Intent URLs (for Expo apps)
          if (request.url.startsWith('intent://')) {
            // Handle the URL immediately
            setTimeout(() => {
              handlePaymentUrl(request.url);
            }, 100);
            
            return false; // Prevent WebView from loading the URL
          }
          
          // Handle UPI URLs (for Expo apps)
          if (request.url.startsWith('upi://')) {
            // Handle the URL immediately
            setTimeout(() => {
              handlePaymentUrl(request.url);
            }, 100);
            
            return false; // Prevent WebView from loading the URL
          }
          
          // Handle other payment schemes
          if (request.url.startsWith('tel:') || request.url.startsWith('mailto:') || request.url.startsWith('sms:')) {
            try {
              Linking.openURL(request.url);
            } catch (error) {
              // Silent error handling
            }
            
            return false;
          }
          
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

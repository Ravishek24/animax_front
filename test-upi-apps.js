// Test script to check which UPI apps are installed
// Run this in your React Native app to debug UPI app availability

import { Linking } from 'react-native';

const testUPIApps = async () => {
  const upiApps = [
    { name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user', scheme: 'tez' },
    { name: 'PhonePe', package: 'com.phonepe.app', scheme: 'phonepe' },
    { name: 'Paytm', package: 'net.one97.paytm', scheme: 'paytm' },
    { name: 'BHIM', package: 'in.org.npci.upiapp', scheme: 'bhim' },
    { name: 'Amazon Pay', package: 'in.amazon.mShop.android.shopping', scheme: 'amazonpay' }
  ];

  console.log('🔍 Testing UPI app availability...');
  
  for (const app of upiApps) {
    try {
      // Test if the app can be opened
      const canOpen = await Linking.canOpenURL(`${app.scheme}://`);
      console.log(`${app.name} (${app.package}): ${canOpen ? '✅ Available' : '❌ Not available'}`);
      
      // Test Intent URL
      const intentUrl = `intent://pay?pa=test@bank&pn=Test&am=100&cu=INR#Intent;package=${app.package};scheme=upi;action=android.intent.action.VIEW;category=android.intent.category.DEFAULT;category=android.intent.category.BROWSABLE;end`;
      const canOpenIntent = await Linking.canOpenURL(intentUrl);
      console.log(`${app.name} Intent: ${canOpenIntent ? '✅ Can handle Intent' : '❌ Cannot handle Intent'}`);
      
    } catch (error) {
      console.log(`${app.name}: ❌ Error testing - ${error.message}`);
    }
  }
};

export default testUPIApps;

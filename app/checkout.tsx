import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  cart_id: number;
  supplement_id: number;
  quantity: number;
  price_at_time: number;
  supplement: {
    supplement_id: number;
    title: string;
    price: number;
    description: string;
    brand: string;
    stock_quantity: number;
    status: string;
    images?: Array<{
      image_url: string;
      is_primary: boolean;
    }>;
  };
}

const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  
  let cartItems: CartItem[] = [];
  let totalAmount = 0;
  let subtotal = 0;
  let shipping = 50;
  
  try {
    // Check if this is cart checkout or single product checkout
    if (params.cartItems) {
      // Cart checkout
      cartItems = JSON.parse(params.cartItems as string) || [];
      totalAmount = parseFloat(params.totalAmount as string) || 0;
      subtotal = parseFloat(params.subtotal as string) || 0;
      shipping = parseFloat(params.shipping as string) || 50;
    } else if (params.product) {
      // Single product checkout
      const product = JSON.parse(params.product as string);
      const quantity = parseInt(params.quantity as string) || 1;
      totalAmount = parseFloat(params.totalAmount as string) || 0;
      subtotal = totalAmount - 50; // Assuming shipping is 50
      shipping = 50;
      
      // Convert single product to cart format
      cartItems = [{
        cart_id: 0,
        supplement_id: product.supplement_id,
        quantity: quantity,
        price_at_time: product.price,
        supplement: product
      }];
    }
  } catch (e) {
    console.error('Error parsing checkout data:', e);
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No items to checkout.</Text>
        </View>
      </View>
    );
  }

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('लॉगिन आवश्यक', 'भुगतान के लिए कृपया लॉगिन करें');
        return;
      }


      // Prepare payment data
      const productNames = cartItems.map(item => item.supplement.title).join(', ');
      const paymentData = {
        amount: totalAmount.toString(),
        productInfo: productNames,
        userInfo: {
          firstName: userData?.full_name || 'User',
          email: userData?.email || 'user@example.com',
          phone: userData?.phone_number || ''
        },
        cartItems: cartItems // Send cart items for order creation
      };

      // Send payment request to backend
      const response = await fetch('https://api.sociamosaic.com/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('🔗 Opening PayU URL in WebView:', result.paymentUrl);
        console.log('🔗 URL length:', result.paymentUrl.length);
        console.log('🔗 URL preview:', result.paymentUrl.substring(0, 100) + '...');
        
        // Navigate to WebView payment page
        try {
          router.push({
            pathname: '/payment-webview',
            params: { paymentUrl: result.paymentUrl }
          });
          console.log('✅ Navigated to PayU WebView successfully');
        } catch (error) {
          console.error('❌ Error navigating to PayU WebView:', error);
          Alert.alert('त्रुटि', 'PayU भुगतान पेज खोलने में समस्या आई: ' + error.message);
        }
      } else {
        console.error('❌ Payment initiation failed:', result);
        Alert.alert('त्रुटि', result.message || 'भुगतान शुरू करने में समस्या आई');
      }

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('त्रुटि', 'भुगतान में समस्या आई');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>चेकआउट</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ऑर्डर सारांश</Text>
            {cartItems.map((item: CartItem, index: number) => (
              <View key={index} style={styles.productCard}>
                <Text style={styles.productName}>{item.supplement.title}</Text>
                <Text style={styles.productPrice}>₹{parseFloat(item.price_at_time.toString()).toFixed(2)}</Text>
                <Text style={styles.quantityText}>मात्रा: {item.quantity}</Text>
              </View>
            ))}
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>मूल्य विवरण</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>उप-कुल</Text>
              <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>शिपिंग</Text>
              <Text style={styles.priceValue}>₹{shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>कुल राशि</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>भुगतान विधि</Text>
            <TouchableOpacity 
              style={[styles.paymentMethod, selectedPaymentMethod === 'card' && styles.selectedPaymentMethod]}
              onPress={() => setSelectedPaymentMethod('card')}
            >
              <Icon name="credit-card" size={24} color={selectedPaymentMethod === 'card' ? '#990906' : '#333'} />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'card' && styles.selectedPaymentText]}>
                क्रेडिट/डेबिट कार्ड (PayU)
              </Text>
              {selectedPaymentMethod === 'card' && <Icon name="check-circle" size={24} color="#990906" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentMethod, selectedPaymentMethod === 'upi' && styles.selectedPaymentMethod]}
              onPress={() => setSelectedPaymentMethod('upi')}
            >
              <Icon name="bank" size={24} color={selectedPaymentMethod === 'upi' ? '#990906' : '#333'} />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'upi' && styles.selectedPaymentText]}>
                UPI (PayU)
              </Text>
              {selectedPaymentMethod === 'upi' && <Icon name="check-circle" size={24} color="#990906" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentMethod, selectedPaymentMethod === 'netbanking' && styles.selectedPaymentMethod]}
              onPress={() => setSelectedPaymentMethod('netbanking')}
            >
              <Icon name="bank-transfer" size={24} color={selectedPaymentMethod === 'netbanking' ? '#990906' : '#333'} />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'netbanking' && styles.selectedPaymentText]}>
                नेट बैंकिंग (PayU)
              </Text>
              {selectedPaymentMethod === 'netbanking' && <Icon name="check-circle" size={24} color="#990906" />}
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Payment Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.payButton, loading && styles.disabledButton]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>
                ₹{totalAmount + 50} का भुगतान करें
              </Text>
            )}
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#990906',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#990906',
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#990906',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPaymentMethod: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 3,
    borderLeftColor: '#990906',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  selectedPaymentText: {
    color: '#990906',
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    backgroundColor: '#990906',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default CheckoutScreen;
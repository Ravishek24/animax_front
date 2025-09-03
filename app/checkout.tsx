import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
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
      <SafeAreaWrapper backgroundColor="#fff" topBackgroundColor="#E8E8E8" bottomBackgroundColor="#000">
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No items to checkout.</Text>
          </View>
        </SafeAreaView>
      </SafeAreaWrapper>
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

      // Handle Cash on Delivery
      if (selectedPaymentMethod === 'cod') {
        Alert.alert(
          'ऑर्डर प्लेस किया गया',
          'आपका ऑर्डर सफलतापूर्वक प्लेस हो गया है! भुगतान डिलीवरी के समय किया जाएगा।',
          [
            {
              text: 'ठीक है',
              onPress: () => router.push('/marketplace')
            }
          ]
        );
        return;
      }

      // Generate PayU payment hash
      const productNames = cartItems.map(item => item.supplement.title).join(', ');
      const paymentData = {
        key: 'your-payu-merchant-key', // Replace with your actual PayU key
        salt: 'your-payu-salt', // Replace with your actual PayU salt
        txnid: `TXN_${Date.now()}`,
        amount: totalAmount.toString(),
        productinfo: productNames,
        firstname: userData?.full_name || 'User',
        email: userData?.email || 'user@example.com',
        phone: userData?.phone_number || '',
        surl: 'https://api.sociamosaic.com/api/payu/success',
        furl: 'https://api.sociamosaic.com/api/payu/failure',
        hash: ''
      };

      // Generate hash
      const hashString = `${paymentData.key}|${paymentData.txnid}|${paymentData.amount}|${paymentData.productinfo}|${paymentData.firstname}|${paymentData.email}|||||||||||${paymentData.salt}`;
      
      const response = await fetch('https://api.sociamosaic.com/api/payu/generate-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hashString,
          hashName: 'hash'
        })
      });

      const hashResult = await response.json();
      paymentData.hash = hashResult.hash;

      // Create PayU payment URL
      const payuUrl = `https://test.payu.in/_payment?${new URLSearchParams(paymentData).toString()}`;
      
      // Open PayU payment page
      const supported = await Linking.canOpenURL(payuUrl);
      if (supported) {
        await Linking.openURL(payuUrl);
      } else {
        Alert.alert('त्रुटि', 'PayU भुगतान पेज खोलने में समस्या आई');
      }

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('त्रुटि', 'भुगतान में समस्या आई');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper backgroundColor="#fff" topBackgroundColor="#E8E8E8" bottomBackgroundColor="#fff">
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
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
              <Icon name="credit-card" size={24} color={selectedPaymentMethod === 'card' ? '#ff3b3b' : '#333'} />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'card' && styles.selectedPaymentText]}>
                क्रेडिट/डेबिट कार्ड (PayU)
              </Text>
              {selectedPaymentMethod === 'card' && <Icon name="check-circle" size={24} color="#ff3b3b" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentMethod, selectedPaymentMethod === 'upi' && styles.selectedPaymentMethod]}
              onPress={() => setSelectedPaymentMethod('upi')}
            >
              <Icon name="bank" size={24} color={selectedPaymentMethod === 'upi' ? '#ff3b3b' : '#333'} />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'upi' && styles.selectedPaymentText]}>
                UPI (PayU)
              </Text>
              {selectedPaymentMethod === 'upi' && <Icon name="check-circle" size={24} color="#ff3b3b" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentMethod, selectedPaymentMethod === 'netbanking' && styles.selectedPaymentMethod]}
              onPress={() => setSelectedPaymentMethod('netbanking')}
            >
              <Icon name="bank-transfer" size={24} color={selectedPaymentMethod === 'netbanking' ? '#ff3b3b' : '#333'} />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'netbanking' && styles.selectedPaymentText]}>
                नेट बैंकिंग (PayU)
              </Text>
              {selectedPaymentMethod === 'netbanking' && <Icon name="check-circle" size={24} color="#ff3b3b" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentMethod, selectedPaymentMethod === 'cod' && styles.selectedPaymentMethod]}
              onPress={() => setSelectedPaymentMethod('cod')}
            >
              <Icon name="cash" size={24} color={selectedPaymentMethod === 'cod' ? '#ff3b3b' : '#333'} />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'cod' && styles.selectedPaymentText]}>
                कैश ऑन डिलीवरी
              </Text>
              {selectedPaymentMethod === 'cod' && <Icon name="check-circle" size={24} color="#ff3b3b" />}
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
      </SafeAreaView>
    </SafeAreaWrapper>
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
    backgroundColor: '#ff3b3b',
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
    color: '#ff3b3b',
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
    color: '#ff3b3b',
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
    borderLeftColor: '#ff3b3b',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  selectedPaymentText: {
    color: '#ff3b3b',
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    backgroundColor: '#ff3b3b',
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
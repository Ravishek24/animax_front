import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import payuService from '../services/payuService';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import type { CartItem } from './slices/cartSlice';

interface UserInfo {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
}

const CheckoutScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cartItems: CartItem[] = useSelector((state: RootState) => state.cart.items);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Ravishek',
    phone: '8368099277',
    whatsapp: '8368099277',
    address: 'Twin Tower Gym Road, Block C, A-123\nGAUTAMBUDDHA NAGAR, Uttar Pradesh - 201301'
  });
  
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate sections on load
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const discount = subtotal > 1000 ? 100 : 0;
  const total = subtotal + deliveryCharge - discount;

  const getItemIcon = (itemName: string) => {
    if (itemName.includes('आहार') || itemName.includes('feed')) {
      return 'grain';
    } else if (itemName.includes('दवा') || itemName.includes('medicine')) {
      return 'medical-bag';
    } else if (itemName.includes('सप्लीमेंट') || itemName.includes('supplement')) {
      return 'pill';
    } else if (itemName.includes('मिनरल') || itemName.includes('mineral')) {
      return 'cube-outline';
    }
    return 'package-variant';
  };

  const handleChangeAddress = () => {
    Alert.alert(
      'पता बदलें',
      'नया पता जोड़ना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { text: 'नया पता जोड़ें', onPress: () => router.push('/add-address') }
      ]
    );
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      const paymentParams = {
        transactionId: `PLM_${Date.now()}`,
        amount: total.toString(),
        productInfo: `पशुपालन मंच - ${cartItems.length} आइटम`,
        firstName: userInfo.name,
        email: 'customer@pashupalan.com',
        phone: userInfo.phone,
        ios_surl: 'https://pashupalan-manch.com/payment/success',
        ios_furl: 'https://pashupalan-manch.com/payment/failure',
        android_surl: 'https://pashupalan-manch.com/payment/success',
        android_furl: 'https://pashupalan-manch.com/payment/failure',
      };

      const result = await payuService.initiatePayment(paymentParams);
      
      if (result.success) {
        // Navigate to order confirmation
        router.push({
          pathname: '/order-confirmation',
          params: {
            orderId: result.data.txnid,
            amount: total.toString(),
            items: JSON.stringify(cartItems)
          }
        });
      }
    } catch (error) {
      Alert.alert(
        'भुगतान त्रुटि',
        'भुगतान में समस्या हुई है। कृपया दोबारा कोशिश करें।',
        [{ text: 'ठीक है' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper
      backgroundColor="#f5f5f5"
      topBackgroundColor="#E8E8E8"
      bottomBackgroundColor="#000000"
    >
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>चेकआउट</Text>
        </View>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>चरण 1/2</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cart Summary */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Icon name="shopping" size={20} color="#ff3b3b" />
            <Text style={styles.sectionTitle}>आपका ऑर्डर</Text>
          </View>
          
          {cartItems.map((item: CartItem, index: number) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemIcon}>
                <Icon name={getItemIcon(item.name)} size={24} color="white" />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>मात्रा: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Delivery Address */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker" size={20} color="#ff3b3b" />
            <Text style={styles.sectionTitle}>डिलीवरी पता</Text>
            <TouchableOpacity style={styles.changeButton} onPress={handleChangeAddress}>
              <Text style={styles.changeButtonText}>बदलें</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{userInfo.name}</Text>
            <Text style={styles.addressText}>{userInfo.address}</Text>
          </View>
        </Animated.View>

        {/* Contact Info */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Icon name="phone" size={20} color="#ff3b3b" />
            <Text style={styles.sectionTitle}>संपर्क जानकारी</Text>
          </View>
          
          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Icon name="phone" size={16} color="white" />
            </View>
            <Text style={styles.contactText}>फोन: {userInfo.phone}</Text>
          </View>
          
          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Icon name="whatsapp" size={16} color="white" />
            </View>
            <Text style={styles.contactText}>WhatsApp: {userInfo.whatsapp}</Text>
          </View>
        </Animated.View>

        {/* Price Breakdown */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt" size={20} color="#ff3b3b" />
            <Text style={styles.sectionTitle}>मूल्य विवरण</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>उत्पाद मूल्य ({cartItems.length} आइटम)</Text>
            <Text style={styles.priceValue}>₹{subtotal}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>डिलीवरी चार्ज</Text>
            <Text style={styles.priceValue}>₹{deliveryCharge}</Text>
          </View>
          
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, styles.discountText]}>छूट</Text>
              <Text style={[styles.priceValue, styles.discountText]}>-₹{discount}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>कुल राशि</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </Animated.View>

        {/* Payment Method */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Icon name="credit-card" size={20} color="#ff3b3b" />
            <Text style={styles.sectionTitle}>भुगतान विधि</Text>
          </View>
          
          <View style={styles.paymentMethod}>
            <View style={styles.paymentIcon}>
              <Icon name="credit-card" size={20} color="white" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>PayU Gateway</Text>
              <Text style={styles.paymentDesc}>क्रेडिट कार्ड, डेबिट कार्ड, UPI, नेट बैंकिंग</Text>
            </View>
            <Icon name="shield-check" size={20} color="#4caf50" />
          </View>
        </Animated.View>

        {/* Order Notes */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Icon name="note-text" size={20} color="#ff3b3b" />
            <Text style={styles.sectionTitle}>विशेष निर्देश (वैकल्पिक)</Text>
          </View>
          
          <TextInput
            style={styles.notesInput}
            placeholder="डिलीवरी के लिए कोई विशेष निर्देश..."
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomAction}>
        <View style={styles.totalRow}>
          <Text style={styles.bottomTotalLabel}>कुल भुगतान:</Text>
          <Text style={styles.bottomTotalValue}>₹{total}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.placeOrderText}>भुगतान प्रक्रिया...</Text>
            </>
          ) : (
            <>
              <Icon name="lock" size={20} color="white" />
              <Text style={styles.placeOrderText}>सुरक्षित भुगतान करें</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 16,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#ff3b3b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stepIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b3b',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b3b',
    marginLeft: 8,
    flex: 1,
  },
  changeButton: {
    borderWidth: 1,
    borderColor: '#ff3b3b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeButtonText: {
    color: '#ff3b3b',
    fontSize: 12,
    fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ff3b3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b3b',
  },
  addressCard: {
    backgroundColor: '#fff8f8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ffcc00',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  discountText: {
    color: '#4caf50',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#ff3b3b',
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffcc00',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ff3b3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentDesc: {
    fontSize: 12,
    color: '#666',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomAction: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomTotalLabel: {
    fontSize: 16,
    color: '#666',
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3b3b',
  },
  placeOrderButton: {
    backgroundColor: '#ff3b3b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    elevation: 4,
    shadowColor: '#ff3b3b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CheckoutScreen;
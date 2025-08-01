import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const { width } = Dimensions.get('window');

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const OrderConfirmationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [orderId] = useState(params.orderId as string || `PLM${Date.now()}`);
  const [amount] = useState(params.amount as string || '0');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Parse order items
    try {
      if (params.items) {
        const parsedItems = JSON.parse(params.items as string);
        setOrderItems(parsedItems);
      }
    } catch (error) {
      console.error('Error parsing order items:', error);
    }

    // Start animations
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, params.items, scaleAnim, slideAnim]);

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now
    return deliveryDate.toLocaleDateString('hi-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTrackOrder = () => {
    // TODO: Implement order tracking
    Alert.alert('सूचना', 'ऑर्डर ट्रैकिंग जल्द ही उपलब्ध होगा।');
  };

  const handleContinueShopping = () => {
    router.push('/marketplace');
  };

  const handleGoHome = () => {
    router.push('/');
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ऑर्डर कन्फर्मेशन</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Animation & Message */}
        <View style={styles.successContainer}>
          <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.checkmarkContainer}>
              <Icon name="check" size={40} color="white" />
            </View>
          </Animated.View>
          
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.successTitle}>ऑर्डर सफल!</Text>
            <Text style={styles.successSubtitle}>
              आपका ऑर्डर सफलतापूर्वक प्लेस हो गया है
            </Text>
          </Animated.View>
        </View>

        {/* Order Details Card */}
        <Animated.View 
          style={[
            styles.orderCard, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.orderHeader}>
            <Icon name="receipt" size={24} color="#ff3b3b" />
            <Text style={styles.orderTitle}>ऑर्डर विवरण</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ऑर्डर ID:</Text>
              <Text style={styles.infoValue}>#{orderId}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>कुल राशि:</Text>
              <Text style={styles.amountValue}>₹{amount}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>भुगतान स्थिति:</Text>
              <View style={styles.statusContainer}>
                <Icon name="check-circle" size={16} color="#4caf50" />
                <Text style={styles.statusText}>सफल</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>अनुमानित डिलीवरी:</Text>
              <Text style={styles.infoValue}>{getEstimatedDelivery()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <Animated.View 
            style={[
              styles.itemsCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.orderHeader}>
              <Icon name="package-variant" size={24} color="#ff3b3b" />
              <Text style={styles.orderTitle}>ऑर्डर किए गए उत्पाद</Text>
            </View>
            
            {orderItems.map((item, index) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemIcon}>
                  <Icon name="grain" size={20} color="white" />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>मात्रा: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Delivery Information */}
        <Animated.View 
          style={[
            styles.deliveryCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.orderHeader}>
            <Icon name="truck-delivery" size={24} color="#ff3b3b" />
            <Text style={styles.orderTitle}>डिलीवरी जानकारी</Text>
          </View>
          
          <View style={styles.deliverySteps}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepActive]}>
                <Icon name="check" size={16} color="white" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>ऑर्डर कन्फर्म</Text>
                <Text style={styles.stepDesc}>आपका ऑर्डर प्राप्त हुआ</Text>
              </View>
            </View>
            
            <View style={styles.stepLine} />
            
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Icon name="package-variant" size={16} color="#666" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>पैकेजिंग</Text>
                <Text style={styles.stepDesc}>ऑर्डर तैयार किया जा रहा है</Text>
              </View>
            </View>
            
            <View style={styles.stepLine} />
            
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Icon name="truck" size={16} color="#666" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>शिपमेंट</Text>
                <Text style={styles.stepDesc}>डिलीवरी के लिए भेजा जाएगा</Text>
              </View>
            </View>
            
            <View style={styles.stepLine} />
            
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Icon name="home" size={16} color="#666" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>डिलीवर</Text>
                <Text style={styles.stepDesc}>आपके दरवाजे पर</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Support Information */}
        <Animated.View 
          style={[
            styles.supportCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.orderHeader}>
            <Icon name="headset" size={24} color="#ff3b3b" />
            <Text style={styles.orderTitle}>सहायता</Text>
          </View>
          
          <Text style={styles.supportText}>
            कोई समस्या या प्रश्न? हमारी टीम आपकी सहायता के लिए तैयार है।
          </Text>
          
          <View style={styles.supportOptions}>
            <TouchableOpacity style={styles.supportOption}>
              <Icon name="whatsapp" size={20} color="#25D366" />
              <Text style={styles.supportOptionText}>WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportOption}>
              <Icon name="phone" size={20} color="#ff3b3b" />
              <Text style={styles.supportOptionText}>कॉल करें</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View 
        style={[
          styles.actionContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
          <Icon name="map-marker-path" size={20} color="white" />
          <Text style={styles.trackButtonText}>ऑर्डर ट्रैक करें</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueShopping}>
            <Text style={styles.secondaryButtonText}>खरीदारी जारी रखें</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Icon name="home" size={16} color="#ff3b3b" />
            <Text style={styles.homeButtonText}>होम</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b3b',
    marginLeft: 8,
  },
  orderInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    fontSize: 16,
    color: '#ff3b3b',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
    marginLeft: 4,
  },
  itemsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIcon: {
    width: 40,
    height: 40,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff3b3b',
  },
  deliveryCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  deliverySteps: {
    paddingVertical: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepActive: {
    backgroundColor: '#4caf50',
  },
  stepContent: {
    flex: 1,
    paddingVertical: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#666',
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 15,
    marginVertical: 4,
  },
  supportCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  supportOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  supportOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 120,
  },
  actionContainer: {
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
  trackButton: {
    backgroundColor: '#ff3b3b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#ff3b3b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff3b3b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  homeButtonText: {
    color: '#ff3b3b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default OrderConfirmationScreen;
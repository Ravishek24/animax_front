import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  cart_id: number;
  supplement_id: number;
  quantity: number;
  price_at_time: number;
  added_at: string;
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

const CartScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  // Refresh cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [])
  );

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('लॉगिन आवश्यक', 'कार्ट देखने के लिए कृपया लॉगिन करें');
        router.push('/login');
        return;
      }

      const response = await fetch('https://api.sociamosaic.com/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      // Debug logging
      console.log('🔍 Cart API Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        // The API returns data.items, not data directly
        const cartData = Array.isArray(result.data?.items) ? result.data.items : [];
        console.log('🔍 Cart data to set:', JSON.stringify(cartData, null, 2));
        setCartItems(cartData);
      } else {
        console.error('Error loading cart:', result.message);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`https://api.sociamosaic.com/api/cart/update/${cartId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setCartItems(prev => 
          prev.map(item => 
            item.cart_id === cartId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        Alert.alert('त्रुटि', result.message || 'मात्रा अपडेट करने में समस्या आई');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('त्रुटि', 'मात्रा अपडेट करने में समस्या आई');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (cartId: number) => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`https://api.sociamosaic.com/api/cart/remove/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setCartItems(prev => prev.filter(item => item.cart_id !== cartId));
        Alert.alert('सफल', 'आइटम कार्ट से हटा दिया गया');
      } else {
        Alert.alert('त्रुटि', result.message || 'आइटम हटाने में समस्या आई');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('त्रुटि', 'आइटम हटाने में समस्या आई');
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    Alert.alert(
      'कार्ट खाली करें',
      'क्या आप वाकई पूरा कार्ट खाली करना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'हाँ',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const token = await AsyncStorage.getItem('userToken');
              
              const response = await fetch('https://api.sociamosaic.com/api/cart/clear', {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              const result = await response.json();
              
              if (result.success) {
                setCartItems([]);
                Alert.alert('सफल', 'कार्ट खाली कर दिया गया');
              } else {
                Alert.alert('त्रुटि', result.message || 'कार्ट खाली करने में समस्या आई');
              }
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('त्रुटि', 'कार्ट खाली करने में समस्या आई');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const proceedToCheckout = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      Alert.alert('खाली कार्ट', 'चेकआउट के लिए कार्ट में कुछ आइटम होने चाहिए');
      return;
    }

    // Calculate total safely using the same logic as calculateTotals
    const subtotal = cartItems.reduce((sum, item) => {
      if (!item || !item.quantity) {
        return sum;
      }
      const price = parseFloat(item.price_at_time) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    
    const shipping = subtotal > 500 ? 0 : 50;
    const totalAmount = subtotal + shipping;
    
    // Navigate to checkout with cart data
    router.push({
      pathname: '/checkout',
      params: {
        cartItems: JSON.stringify(cartItems),
        totalAmount: totalAmount.toString(),
        subtotal: subtotal.toString(),
        shipping: shipping.toString()
      }
    });
  };

  // Calculate totals safely
  const calculateTotals = () => {
    if (!cartItems || !Array.isArray(cartItems)) {
      return { subtotal: 0, shipping: 50, total: 50 };
    }
    
    const subtotal = cartItems.reduce((sum, item) => {
      if (!item || !item.quantity) {
        return sum;
      }
      // Convert price_at_time to number (it comes as string from API)
      const price = parseFloat(item.price_at_time) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;
    
    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotals();

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>कार्ट</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#990906" />
          <Text style={styles.loadingText}>कार्ट लोड हो रहा है...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>कार्ट</Text>
          </View>
          {Array.isArray(cartItems) && cartItems.length > 0 && (
            <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
              <Icon name="delete-sweep" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Cart Content */}
        <ScrollView style={styles.scrollView}>
          {!Array.isArray(cartItems) || cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="cart-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>आपका कार्ट खाली है</Text>
              <Text style={styles.emptySubtext}>कुछ उत्पाद जोड़ें और शॉपिंग शुरू करें</Text>
              <TouchableOpacity 
                style={styles.shopButton}
                onPress={() => router.push('/marketplace')}
              >
                <Text style={styles.shopButtonText}>शॉपिंग करें</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
                                            {/* Cart Items */}
               {Array.isArray(cartItems) && cartItems.map((item, index) => (
                 <View key={item.cart_id || index} style={styles.cartItem}>
                                     <View style={styles.itemImageContainer}>
                     <Image 
                       source={{ 
                         uri: item.supplement.images?.find(img => img.is_primary)?.image_url || 
                               item.supplement.images?.[0]?.image_url || 
                               'https://via.placeholder.com/80x80?text=Product'
                       }} 
                       style={styles.itemImage}
                       resizeMode="cover"
                       defaultSource={{ uri: 'https://via.placeholder.com/80x80?text=Product' }}
                     />
                   </View>
                   
                   <View style={styles.itemDetails}>
                     <Text style={styles.itemName} numberOfLines={2}>
                       {item.supplement.title}
                     </Text>
                    <Text style={styles.itemPrice}>₹{item.price_at_time}</Text>
                    
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.cart_id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                      >
                        <Icon name="minus" size={16} color="#333" />
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.cart_id, item.quantity + 1)}
                        disabled={updating}
                      >
                        <Icon name="plus" size={16} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                                     <View style={styles.itemActions}>
                     <Text style={styles.itemTotal}>₹{(parseFloat(item.price_at_time) * item.quantity).toFixed(2)}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeItem(item.cart_id)}
                      disabled={updating}
                    >
                      <Icon name="delete" size={20} color="#990906" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Price Summary */}
              <View style={styles.priceSummary}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>उप-कुल</Text>
                  <Text style={styles.priceValue}>₹{subtotal}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>शिपिंग</Text>
                  <Text style={styles.priceValue}>
                    {shipping === 0 ? 'मुफ्त' : `₹${shipping}`}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>कुल</Text>
                  <Text style={styles.totalValue}>₹{total}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Checkout Button */}
        {Array.isArray(cartItems) && cartItems.length > 0 && (
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={proceedToCheckout}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.checkoutButtonText}>
                  ₹{total} का भुगतान करें
                </Text>
              )}
            </TouchableOpacity>
        </View>
        )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  clearButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  shopButton: {
    backgroundColor: '#990906',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  shopButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
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
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#990906',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    overflow: 'hidden',
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
  priceSummary: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
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
  bottomBar: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkoutButton: {
    backgroundColor: '#ff3b3b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen; 
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

const CartScreen = () => {
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <SafeAreaWrapper backgroundColor="#fff" topBackgroundColor="#E8E8E8" bottomBackgroundColor="#000">
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>कार्ट</Text>
          </View>
        </View>
        {/* Cart Content */}
        <View style={styles.content}>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>आपका कार्ट खाली है।</Text>
          ) : (
            <>
              {cartItems.map((item, idx) => (
                <View key={item.id || idx} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                  <Text>मात्रा: {item.quantity}</Text>
                  <Text>₹{item.price}</Text>
                </View>
              ))}
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 10 }}>कुल: ₹{subtotal}</Text>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => router.push('/checkout')}
              >
                <Text style={styles.checkoutButtonText}>चेकआउट करें</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen; 
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ProductDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef(null);
  
  let product = null;
  try {
    product = params.product ? JSON.parse(params.product as string) : null;
  } catch (e) {
    product = null;
  }

  if (!product) {
    return (
      <SafeAreaWrapper backgroundColor="#fff" topBackgroundColor="#E8E8E8" bottomBackgroundColor="#fff">
        <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Product data is missing or invalid.</Text>
          </View>
        </SafeAreaView>
      </SafeAreaWrapper>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <FontAwesome key={i} name="star" size={16} color="#ffbb00" style={styles.star} />
        );
      } else {
        stars.push(
          <FontAwesome key={i} name="star-o" size={16} color="#ffbb00" style={styles.star} />
        );
      }
    }
    return <>{stars}</>;
  };

  const onSlideChange = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / (width - 40)
    );
    setActiveSlide(slideIndex);
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `${product.name} - ₹${product.price} - खरीदें पशुपालन मंच पर!`,
        url: 'https://pashupalan-manch.com/product/' + product.id,
      });
    } catch (error) {
      console.log((error as Error).message);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const addToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('लॉगिन आवश्यक', 'कार्ट में जोड़ने के लिए कृपया लॉगिन करें');
        return;
      }

      const response = await fetch('https://api.sociamosaic.com/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          supplement_id: product.id,
          quantity: quantity
        })
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('सफल', 'कार्ट में जोड़ा गया');
      } else {
        Alert.alert('त्रुटि', result.message || 'कार्ट में जोड़ने में समस्या आई');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('त्रुटि', 'कार्ट में जोड़ने में समस्या आई');
    }
  };

  const buyNow = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('लॉगिन आवश्यक', 'खरीदने के लिए कृपया लॉगिन करें');
        return;
      }

      // Navigate to checkout page with product details
      router.push({
        pathname: '/checkout',
        params: {
          product: JSON.stringify(product),
          quantity: quantity.toString(),
          totalAmount: (product.price * quantity).toString()
        }
      });
    } catch (error) {
      console.error('Buy now error:', error);
      Alert.alert('त्रुटि', 'खरीदने में समस्या आई');
    }
  };

  return (
    <SafeAreaWrapper backgroundColor="#fff" topBackgroundColor="#E8E8E8" bottomBackgroundColor="#fff">
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Header - Match Marketplace Style */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>उत्पाद विवरण</Text>
          </View>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* Product Images Carousel */}
          <View style={styles.carouselContainer}>
            {product.images && product.images.length > 0 ? (
              <FlatList
                ref={flatListRef}
                data={product.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onSlideChange}
                keyExtractor={(_, index) => `image_${index}`}
                renderItem={({ item }) => (
                  <View style={styles.slideItem}>
                    <View style={styles.imageContainer}>
                      <Image 
                        source={item} 
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                )}
              />
            ) : (
              <View style={styles.slideItem}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/300x200?text=No+Image' }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            )}
            {/* Image Pagination Dots */}
            {product.images && product.images.length > 1 && (
              <View style={styles.paginationContainer}>
                {product.images.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      activeSlide === index ? styles.paginationDotActive : {}
                    ]}
                  />
                ))}
              </View>
            )}
            {/* Out of stock badge */}
            {!product.stockAvailable && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>स्टॉक में नहीं</Text>
              </View>
            )}
          </View>
          
          {/* Product Details */}
          <View style={styles.productInfoContainer}>
            {/* Name and Price */}
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>₹{product.price}</Text>
            
            {/* Ratings */}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {renderStars(product.rating)}
              </View>
              <Text style={styles.reviewCount}>{product.reviews} समीक्षाएँ</Text>
            </View>
            
            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>मात्रा:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Icon name="minus" size={16} color="#333" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                  disabled={quantity >= 10}
                >
                  <Icon name="plus" size={16} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>विवरण</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
            
            {/* Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>विशेषताएँ</Text>
              <View style={styles.featuresList}>
                {product.features && product.features.length > 0 ? (
                  product.features.map((feature: string, index: number) => (
                    <View key={index} style={styles.featureItem}>
                      <Icon name="check-circle" size={16} color="#ff3b3b" style={styles.featureIcon} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noFeaturesText}>इस उत्पाद के लिए कोई विशेषताएँ उपलब्ध नहीं हैं</Text>
                )}
              </View>
            </View>
            
            {/* Shipping Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>शिपिंग</Text>
              <View style={styles.shippingInfo}>
                <Icon name="truck-delivery" size={18} color="#333" style={styles.shippingIcon} />
                <Text style={styles.shippingText}>
                  3-5 दिनों में डिलीवरी
                </Text>
              </View>
              <View style={styles.shippingInfo}>
                <Icon name="currency-inr" size={18} color="#333" style={styles.shippingIcon} />
                <Text style={styles.shippingText}>
                  ₹500 से अधिक की खरीद पर मुफ्त शिपिंग
                </Text>
              </View>
            </View>
            
            {/* Return Policy */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>रिटर्न नीति</Text>
              <Text style={styles.returnText}>
                डिलीवरी के 7 दिनों के भीतर आसान रिटर्न और पूरा रिफंड।
              </Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.wishlistButton}>
            <Icon name="heart-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              !product.stockAvailable && styles.disabledButton
            ]}
            disabled={!product.stockAvailable}
            onPress={addToCart}
          >
            <Text style={styles.addToCartText}>
              {product.stockAvailable ? 'कार्ट में जोड़ें' : 'स्टॉक में नहीं'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.buyNowButton,
              !product.stockAvailable && styles.disabledButton
            ]}
            disabled={!product.stockAvailable}
            onPress={buyNow}
          >
            <Text style={styles.buyNowText}>अभी खरीदें</Text>
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
  scrollView: {
    flex: 1,
  },
  carouselContainer: {
    height: 250,
    position: 'relative',
  },
  slideItem: {
    width: width,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width - 40,
    height: 230,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  paginationDotActive: {
    backgroundColor: '#ff3b3b',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 20,
    right: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  outOfStockText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productInfoContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3b3b',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  star: {
    marginRight: 3,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 15,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    overflow: 'hidden',
  },
  quantityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  featuresList: {
    marginTop: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#444',
  },
  noFeaturesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shippingIcon: {
    marginRight: 8,
  },
  shippingText: {
    fontSize: 14,
    color: '#444',
  },
  returnText: {
    fontSize: 14,
    color: '#444',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  wishlistButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    marginRight: 10,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    borderRadius: 30,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#ff3b3b',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buyNowText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
});

export default ProductDetailsScreen;
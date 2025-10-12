import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import NutriDietBanner from '../assets/NutriDiet (2).png';

const { width } = Dimensions.get('window');

// Define types
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  paName?: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  paDescription?: string;
  images: any[];
  features: string[];
  paFeatures?: string[];
  stockAvailable: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  router: any;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CATEGORIES = [
  { id: '1', name: 'categoriesAllProducts' },
  { id: '2', name: 'categoriesFeed' },
  { id: '3', name: 'categoriesMedicine' },
  { id: '4', name: 'categoriesSupplements' },
  { id: '5', name: 'categoriesEquipment' },
  { id: '6', name: 'categoriesCare' },
];

const POPULAR_PRODUCTS = [
  {
    id: '1',
    name: 'प्रीमियम गाय का आहार (20 किलो)',
    paName: 'ਪ੍ਰੀਮੀਅਮ ਗਾਂ ਦਾ ਆਹਾਰ (20 ਕਿ.)',
    price: 850,
    rating: 4,
    reviews: 34,
    description: 'हमारा प्रीमियम गाय का आहार उच्च गुणवत्ता वाले पोषक तत्वों से भरपूर है।',
    paDescription: 'ਸਾਡਾ ਪ੍ਰੀਮੀਅਮ ਗਾਂ ਦਾ ਆਹਾਰ ਉੱਚ ਗੁਣਵੱਤਾ ਵਾਲੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਨਾਲ ਭਰਪੂਰ ਹੈ।',
    images: [
      require('../assets/1.png'),
      require('../assets/2.png'),
    ],
    features: [
      'उच्च प्रोटीन सामग्री',
      'विटामिन और खनिज से समृद्ध',
      'बेहतर दूध उत्पादन में सहायता',
      'पशु स्वास्थ्य को बढ़ावा देता है'
    ],
    paFeatures: [
      'ਉੱਚ ਪ੍ਰੋਟੀਨ ਸਮੱਗਰੀ',
      'ਵਿਟਾਮਿਨ ਅਤੇ ਖਨੀਜ਼ ਨਾਲ ਭਰਪੂਰ',
      'ਵਧੀਆ ਦੁੱਧ ਉਤਪਾਦਨ ਵਿੱਚ ਮਦਦ',
      'ਪਸ਼ੂ ਸਿਹਤ ਨੂੰ ਉਤਸ਼ਾਹਿਤ ਕਰਦਾ ਹੈ'
    ],
    stockAvailable: true
  },
  // Add more products as needed...
];

const RECOMMENDED_PRODUCTS = [
  {
    id: '5',
    name: 'मिनरल ब्लॉक्स (5 किलो)',
    paName: 'ਮਿਨਰਲ ਬਲਾਕਸ (5 ਕਿ.)',
    price: 520,
    rating: 4,
    reviews: 19,
    description: 'ये मिनरल ब्लॉक्स आपके पशुओं को आवश्यक खनिजों का निरंतर स्रोत प्रदान करते हैं।',
    paDescription: 'ਇਹ ਮਿਨਰਲ ਬਲਾਕਸ ਤੁਹਾਡੇ ਪਸ਼ੂਆਂ ਨੂੰ ਲਾਜ਼ਮੀ ਖਨੀਜ਼ਾਂ ਦਾ ਨਿਰੰਤਰ ਸਰੋਤ ਦਿੰਦੇ ਹਨ।',
    images: [
      require('../assets/9.png'),
    ],
    features: [
      'आवश्यक खनिजों का मिश्रण',
      'लंबे समय तक चलने वाला',
      'पशुओं के स्वाद के अनुकूल',
      'पशुशाला में आसानी से स्थापित'
    ],
    paFeatures: [
      'ਲਾਜ਼ਮੀ ਖਨੀਜ਼ਾਂ ਦਾ ਮਿਸ਼ਰਣ',
      'ਲੰਮੇ ਸਮੇਂ ਤੱਕ ਚੱਲਣ ਵਾਲਾ',
      'ਪਸ਼ੂਆਂ ਦੇ ਸੁਆਦ ਮੁਤਾਬਕ',
      'ਸ਼ੈੱਡ ਵਿੱਚ ਆਸਾਨੀ ਨਾਲ ਲਗੇ'
    ],
    stockAvailable: true
  },
];

// Image Carousel component
const ImageCarousel = ({ images }: { images: any[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const itemWidth = width / 2 - 15;
    const index = Math.round(scrollPosition / itemWidth);
    if (index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `image_${index}`}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image
              source={item}
              style={[styles.productImage, { width: width / 2 - 15 }]}
              resizeMode="cover"
            />
          </View>
        )}
      />
      
      {images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_: any, index: number) => (
            <View
              key={`dot_${index}`}
              style={[
                styles.paginationDot,
                index === activeIndex ? styles.paginationDotActive : {}
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Updated ProductCard component
const ProductCard = ({ product, onPress, router, setCartItems }: ProductCardProps) => {
  const [addingToCart, setAddingToCart] = useState(false);
  
  const { t } = useLanguage();
  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(true);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert(t('loginRequired'), t('loginToAddToCart'));
        return;
      }

      const response = await fetch('https://api.sociamosaic.com/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          supplement_id: parseInt(product.id),
          quantity: 1
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local cart count
        setCartItems(prev => {
          const existingItem = prev.find(item => item.id === product.id);
          if (existingItem) {
            return prev.map(item => 
              item.id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [...prev, {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            }];
          }
        });
        
        Alert.alert(
          t('addedToCart'),
          t('addedToCartMsg').replace('{product}', product.name),
          [
            { text: t('continueShopping'), style: 'cancel' },
            { 
              text: t('viewCart'), 
              onPress: () => router.push('/cart')
            }
          ]
        );
      } else {
        Alert.alert(t('errorTitle'), result.message || 'कार्ट में जोड़ने में समस्या आई');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert(t('errorTitle'), 'ਕਾਰਟ ਵਿੱਚ ਜੋੜਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆਈ');
    } finally {
      setAddingToCart(false);
    }
  };

  const navigateToCheckout = (items: CartItem[]) => {
    router.push({
      pathname: '/checkout',
      params: {
        cartData: JSON.stringify(items)
      }
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <FontAwesome key={i} name="star" size={12} color="#ffbb00" />
        );
      } else {
        stars.push(
          <FontAwesome key={i} name="star-o" size={12} color="#ffbb00" />
        );
      }
    }
    return <>{stars}</>;
  };

  return (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => onPress(product)}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <ImageCarousel images={product.images} />
        
        {!product.stockAvailable && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>स्टॉक में नहीं</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>{product.paName || product.name}</Text>
        <Text style={styles.productPrice}>₹{product.price}</Text>
        <View style={styles.productRating}>
          <View style={styles.ratingStars}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.reviewCount}>({product.reviews})</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            (!product.stockAvailable || addingToCart) && styles.disabledButton
          ]}
          disabled={!product.stockAvailable || addingToCart}
          onPress={(e) => {
            e.stopPropagation();
            handleAddToCart(product);
          }}
        >
          {addingToCart ? (
            <>
              <ActivityIndicator size="small" color="#333" />
              <Text style={styles.addToCartText}>{t('addingToCart')}</Text>
            </>
          ) : (
            <Text style={styles.addToCartText}>
              {product.stockAvailable ? t('addToCart') : t('outOfStock')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Cart Icon component
const CartIcon = ({ cartItems, router }: { cartItems: CartItem[], router: any }) => {
  const itemCount = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  
  return (
    <TouchableOpacity 
      style={styles.cartIconContainer}
      onPress={() => router.push('/cart')}
    >
      <Icon name="cart-outline" size={28} color="white" />
      {itemCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MarketplaceScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([...POPULAR_PRODUCTS, ...RECOMMENDED_PRODUCTS]);
  const productsPerPage = 12;
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadInitialProducts();
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://api.sociamosaic.com/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const backendCartItems = result.data.map((item: any) => ({
          id: item.supplement_id.toString(),
          name: item.Supplement.title,
          price: item.price_at_time,
          quantity: item.quantity,
        }));
        setCartItems(backendCartItems);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const loadInitialProducts = () => {
    setDisplayedProducts(allProducts.slice(0, productsPerPage));
  };

  const loadMoreProducts = () => {
    if (loading) return;
    
    setLoading(true);
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    
    // Simulate API call delay
    setTimeout(() => {
      const newProducts = allProducts.slice(startIndex, endIndex);
      if (newProducts.length > 0) {
        setDisplayedProducts(prev => [...prev, ...newProducts]);
        setPage(nextPage);
      }
      setLoading(false);
    }, 1000);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-details',
      params: { product: JSON.stringify(product) }
    });
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#990906" />
        <Text style={styles.loadingText}>लोड हो रहा है...</Text>
      </View>
    );
  };

  return (
    <SafeAreaWrapper
      backgroundColor="#ffffff"
      topBackgroundColor="#E8E8E8"     // Tinted gray
      bottomBackgroundColor="#000000"  // Black
    >
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('marketplace')}</Text>
          </View>
          <CartIcon cartItems={cartItems} router={router} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Page Title */}
          <Text style={styles.pageTitle}>{t('feedAndMeds')}</Text>
          
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Icon name="magnify" size={24} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categories}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id}
                style={[
                  styles.category, 
                  activeCategory === category.id && styles.activeCategory
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.activeCategoryText
                ]}>
                  {t(category.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Offers Banner */}
          <View style={styles.offersBanner}>
            <Image 
              source={require('../assets/NutriDiet (3).png')}
              style={styles.offersBannerImage}
            />
          </View>

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
                router={router}
                setCartItems={setCartItems}
              />
            ))}
          </View>

          {renderFooter()}
          
          {/* Bottom Spacer */}
          <View style={styles.bottomSpacerContent} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#3a3a3a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchBar: {
    marginHorizontal: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categories: {
    marginBottom: 15,
  },
  categoriesContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  category: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  activeCategory: {
    backgroundColor: '#ff3b3b',
    borderColor: '#ff3b3b',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  offersBanner: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  offersBannerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    backgroundColor: '#39b3ff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 7.5,
  },
  productCard: {
    width: '50%',
    paddingHorizontal: 7.5,
    marginBottom: 15,
  },
  productImageContainer: {
    height: 150,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    height: 150,
    width: '100%',
  },
  carouselContainer: {
    height: 150,
    width: '100%',
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width / 2 - 15,
    height: 150,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#ff3b3b',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  outOfStockText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productDetails: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  productName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    height: 36,
  },
  productPrice: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#990906',
    marginBottom: 8,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 12,
    color: '#777',
  },
  addToCartButton: {
    backgroundColor: '#f9ca1b',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledButton: {
    backgroundColor: '#ddd',
  },
  addToCartText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomSpacerContent: {
    height: 70,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  cartIconContainer: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#f9ca1b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MarketplaceScreen;
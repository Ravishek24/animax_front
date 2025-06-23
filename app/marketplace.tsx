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
import NutriDietBanner from '../assets/NutriDiet (2).png';

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
  price: number;
  rating: number;
  reviews: number;
  description: string;
  images: any[];
  features: string[];
  stockAvailable: boolean;
}

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  router: any;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CATEGORIES = [
  { id: '1', name: 'सभी श्रेणियां' },
  { id: '2', name: 'आहार' },
  { id: '3', name: 'दवाइयां' },
  { id: '4', name: 'सप्लीमेंट्स' },
  { id: '5', name: 'उपकरण' },
  { id: '6', name: 'पशु देखभाल' },
];

const POPULAR_PRODUCTS = [
  {
    id: '1',
    name: 'प्रीमियम गाय का आहार (20 किलो)',
    price: 850,
    rating: 4,
    reviews: 34,
    description: 'हमारा प्रीमियम गाय का आहार उच्च गुणवत्ता वाले पोषक तत्वों से भरपूर है।',
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
    stockAvailable: true
  },
  // Add more products as needed...
];

const RECOMMENDED_PRODUCTS = [
  {
    id: '5',
    name: 'मिनरल ब्लॉक्स (5 किलो)',
    price: 520,
    rating: 4,
    reviews: 19,
    description: 'ये मिनरल ब्लॉक्स आपके पशुओं को आवश्यक खनिजों का निरंतर स्रोत प्रदान करते हैं।',
    images: [
      require('../assets/9.png'),
    ],
    features: [
      'आवश्यक खनिजों का मिश्रण',
      'लंबे समय तक चलने वाला',
      'पशुओं के स्वाद के अनुकूल',
      'पशुशाला में आसानी से स्थापित'
    ],
    stockAvailable: true
  },
];

// Image Carousel component
const ImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
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
          {images.map((_, index) => (
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
  
  const handleAddToCart = async (product: Product) => {
    setAddingToCart(true);
    
    // Add item to cart
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    };
    
    // Simulate adding to cart
    setTimeout(() => {
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === product.id);
        if (existingItem) {
          return prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prev, cartItem];
        }
      });
      setAddingToCart(false);
      
      // Show success message
      Alert.alert(
        'कार्ट में जोड़ा गया',
        `${product.name} आपके कार्ट में जोड़ दिया गया है।`,
        [
          { text: 'खरीदारी जारी रखें', style: 'cancel' },
          { 
            text: 'चेकआउट करें', 
            onPress: () => navigateToCheckout([cartItem])
          }
        ]
      );
    }, 1000);
  };

  const navigateToCheckout = (items) => {
    router.push({
      pathname: '/checkout',
      params: {
        cartData: JSON.stringify(items)
      }
    });
  };

  const renderStars = (rating) => {
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
    return stars;
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
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
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
              <Text style={styles.addToCartText}>जोड़ा जा रहा है...</Text>
            </>
          ) : (
            <Text style={styles.addToCartText}>
              {product.stockAvailable ? 'कार्ट में जोड़ें' : 'स्टॉक में नहीं'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Cart Icon component
const CartIcon = ({ cartItems, router }) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <TouchableOpacity 
      style={styles.cartIconContainer}
      onPress={() => router.push({
        pathname: '/checkout',
        params: { cartData: JSON.stringify(cartItems) }
      })}
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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([...POPULAR_PRODUCTS, ...RECOMMENDED_PRODUCTS]);
  const productsPerPage = 12;
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadInitialProducts();
  }, []);

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

  const handleProductPress = (product) => {
    router.push({
      pathname: '/product-details',
      params: { product: JSON.stringify(product) }
    });
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#D32F2F" />
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
            <Text style={styles.headerTitle}>मार्केटप्लेस</Text>
          </View>
          <CartIcon cartItems={cartItems} router={router} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Page Title */}
          <Text style={styles.pageTitle}>पशु आहार और दवाइयां</Text>
          
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Icon name="magnify" size={24} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="आहार, दवाइयां, सप्लीमेंट्स खोजें..."
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
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Offers Banner */}
          <View style={styles.offersBanner}>
            <Image 
              source={NutriDietBanner}
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
    color: '#ff3b3b',
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
    backgroundColor: '#ffcc00',
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
    backgroundColor: '#ffcc00',
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
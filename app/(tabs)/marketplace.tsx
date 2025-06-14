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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
    description: 'हमारा प्रीमियम गाय का आहार उच्च गुणवत्ता वाले पोषक तत्वों से भरपूर है और आपके पशुओं के स्वास्थ्य के लिए आदर्श है। इसमें सभी आवश्यक विटामिन और खनिज शामिल हैं।',
    images: [
      require('../../assets/1.png'),
      require('../../assets/1.png'),
    ],
    features: [
      'उच्च प्रोटीन सामग्री',
      'विटामिन और खनिज से समृद्ध',
      'बेहतर दूध उत्पादन में सहायता',
      'पशु स्वास्थ्य को बढ़ावा देता है'
    ],
    stockAvailable: true
  },
  {
    id: '2',
    name: 'कैल्शियम सप्लीमेंट (1 किलो)',
    price: 450,
    rating: 5,
    reviews: 56,
    description: 'यह कैल्शियम सप्लीमेंट आपके पशुओं के लिए मजबूत हड्डियों और बेहतर दूध उत्पादन सुनिश्चित करता है। सभी आयु के पशुओं के लिए उपयुक्त।',
    images: [
      require('../../assets/3.png'),
    ],
    features: [
      'उच्च अवशोषण वाला कैल्शियम',
      'विटामिन D3 के साथ',
      'मजबूत हड्डियों के लिए आवश्यक',
      'दूध उत्पादन में वृद्धि करता है'
    ],
    stockAvailable: true
  },
  {
    id: '3',
    name: 'विटामिन मिक्सचर (500 ग्राम)',
    price: 380,
    rating: 4,
    reviews: 21,
    description: 'सम्पूर्ण विटामिन मिश्रण जो आपके पशु के समग्र स्वास्थ्य और प्रतिरक्षा प्रणाली को बढ़ावा देता है। सभी आवश्यक विटामिन एक ही पैकेज में।',
    images: [
      require('../../assets/4.png'),
      require('../../assets/4.png'),
      require('../../assets/4.png'),
    ],
    features: [
      'विटामिन A, D, E, और B-कॉम्प्लेक्स',
      'प्रतिरक्षा प्रणाली को मजबूत बनाता है',
      'त्वचा और बालों के स्वास्थ्य में सुधार',
      'आसान उपयोग के लिए पाउडर रूप'
    ],
    stockAvailable: true
  },
  {
    id: '4',
    name: 'कृमिनाशक दवा (100 मिली)',
    price: 290,
    rating: 4,
    reviews: 43,
    description: 'व्यापक स्पेक्ट्रम कृमिनाशक जो आंतरिक परजीवियों से लड़ता है और आपके पशु के स्वास्थ्य की रक्षा करता है। उपयोग में आसान और प्रभावी।',
    images: [
      require('../../assets/7.png'),
      require('../../assets/7.png'),
    ],
    features: [
      'व्यापक स्पेक्ट्रम कृमिनाशक',
      'सुरक्षित और प्रभावी',
      '6 महीने तक सुरक्षा प्रदान करता है',
      'आसान प्रशासन'
    ],
    stockAvailable: false
  },
];

const RECOMMENDED_PRODUCTS = [
  {
    id: '5',
    name: 'मिनरल ब्लॉक्स (5 किलो)',
    price: 520,
    rating: 4,
    reviews: 19,
    description: 'ये मिनरल ब्लॉक्स आपके पशुओं को आवश्यक खनिजों का निरंतर स्रोत प्रदान करते हैं। मजबूत हड्डियों और समग्र स्वास्थ्य के लिए आदर्श।',
    images: [
      require('../../assets/9.png'),
    ],
    features: [
      'आवश्यक खनिजों का मिश्रण',
      'लंबे समय तक चलने वाला',
      'पशुओं के स्वाद के अनुकूल',
      'पशुशाला में आसानी से स्थापित'
    ],
    stockAvailable: true
  },
  {
    id: '6',
    name: 'टीकाकरण किट (बेसिक)',
    price: 750,
    rating: 5,
    reviews: 27,
    description: 'सामान्य पशु बीमारियों के लिए आवश्यक टीकों का यह बेसिक टीकाकरण किट आपके पशुओं की सुरक्षा करता है। पशुचिकित्सक द्वारा अनुशंसित।',
    images: [
      require('../../assets/10.png'),
      require('../../assets/11.png'),
    ],
    features: [
      'आवश्यक टीकों का सेट',
      'सुरक्षित भंडारण के लिए कूलिंग बैग',
      'उपयोग के आसान निर्देश',
      'पशुचिकित्सक द्वारा अनुशंसित'
    ],
    stockAvailable: true
  },
  {
    id: '7',
    name: 'दूध बढ़ाने वाला सप्लीमेंट (1 किलो)',
    price: 620,
    rating: 4,
    reviews: 38,
    description: 'यह सप्लीमेंट विशेष रूप से दूध उत्पादन को बढ़ाने के लिए तैयार किया गया है। सुरक्षित, प्राकृतिक सामग्री से बना और अत्यधिक प्रभावी।',
    images: [
      require('../../assets/12.png'),
    ],
    features: [
      'दूध उत्पादन में 15-20% वृद्धि',
      'प्राकृतिक अवयवों से निर्मित',
      'दूध की गुणवत्ता में सुधार',
      'नियमित उपयोग के लिए सुरक्षित'
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

const ProductCard = ({ product, onPress }) => {
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
            !product.stockAvailable && styles.disabledButton
          ]}
          disabled={!product.stockAvailable}
          onPress={(e) => {
            e.stopPropagation();
            console.log('Add to cart:', product.name);
          }}
        >
          <Text style={styles.addToCartText}>
            {product.stockAvailable ? 'कार्ट में जोड़ें' : 'स्टॉक में नहीं'}
          </Text>
        </TouchableOpacity>
      </View>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#ff3b3b" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Icon name="cow" size={30} color="white" style={styles.logoIcon} />
          <Text style={styles.logoText}>पशुपालन मंच</Text>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Icon name="cart-outline" size={28} color="white" />
        </TouchableOpacity>
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
            source={require('../../assets/NutriDiet (3).png')}
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
            />
          ))}
        </View>

        {renderFooter()}
        
        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 10,
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  cartButton: {
    padding: 4,
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionUnderline: {
    width: 50,
    height: 3,
    backgroundColor: '#ff3b3b',
    borderRadius: 3,
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
  productImagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
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
  bottomSpacer: {
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: 4,
  },
  cartBadge: {
    backgroundColor: '#ff3b3b',
    borderRadius: 12,
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginLeft: 5,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoryButton: {
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
});

export default MarketplaceScreen; 
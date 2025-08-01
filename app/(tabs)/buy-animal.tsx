import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

interface Animal {
  id: string;
  title: string;
  price: number;
  breed: string;
  milkCapacity: string;
  currentMilk: string;
  pregnant: boolean;
  pregnancyMonths?: number;
  age: string;
  location: string;
  distance: string;
  postedTime: string;
  sellerName: string;
  sellerPhone: string;
  missedCalls: number;
  isPremium: boolean;
  category: 'cow' | 'buffalo' | 'other';
  videos: string[];
  additionalInfo: string[];
  description?: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  key: 'all' | 'cow' | 'buffalo' | 'other';
}

const PAGE_SIZE = 20;
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.sociamosaic.com'; // Update this with your domain

const BuyAnimalsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cow' | 'buffalo' | 'other'>('all');
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories: Category[] = [
    { id: '1', name: 'सभी', emoji: '🐄', key: 'all' },
    { id: '2', name: 'गाय', emoji: '🐄', key: 'cow' },
    { id: '3', name: 'भैंस', emoji: '🐃', key: 'buffalo' },
    { id: '4', name: 'अन्य', emoji: '🐮', key: 'other' },
  ];

  // Mock animal data
  const mockAnimals: Animal[] = [
    {
      id: '1',
      title: '18L दूध क्षमता | मुर्रा | ब्यावी नहीं | OL अभी का दूध',
      price: 122000,
      breed: 'मुर्रा भैंस',
      milkCapacity: '18L',
      currentMilk: '16L',
      pregnant: true,
      pregnancyMonths: 8,
      age: '4 वर्ष',
      location: 'Gurugram',
      distance: '61 कि.मी.',
      postedTime: '2 दिन पहले',
      sellerName: 'Manav जी',
      sellerPhone: '+91-9876543210',
      missedCalls: 10,
      isPremium: true,
      category: 'buffalo',
      videos: ['video1.mp4', 'video2.mp4'],
      additionalInfo: [
        '8 महीने की गर्भवती है',
        '2nd timer jhoti h bhot sharif h first timer ne 16kg doodh diya tha 7.5month ki ghaban h'
      ],
    },
    {
      id: '2',
      title: 'साहीवाल गाय | 15L दूध | प्रथम ब्यांत | स्वस्थ',
      price: 95000,
      breed: 'साहीवाल',
      milkCapacity: '15L',
      currentMilk: '15L',
      pregnant: false,
      age: '3 वर्ष',
      location: 'Delhi',
      distance: '25 कि.मी.',
      postedTime: '1 दिन पहले',
      sellerName: 'Suresh जी',
      sellerPhone: '+91-9876543211',
      missedCalls: 5,
      isPremium: false,
      category: 'cow',
      videos: ['video3.mp4', 'video4.mp4'],
      additionalInfo: [
        'पूर्ण स्वस्थ, टीकाकरण पूर्ण',
        'आयु: 3 वर्ष',
        'वर्तमान दूध: 15 लीटर प्रति दिन'
      ],
    },
    {
      id: '3',
      title: 'नीली रावी भैंस | 20L दूध | द्वितीय ब्यांत',
      price: 145000,
      breed: 'नीली रावी',
      milkCapacity: '20L',
      currentMilk: '18L',
      pregnant: true,
      pregnancyMonths: 5,
      age: '5 वर्ष',
      location: 'Faridabad',
      distance: '45 कि.मी.',
      postedTime: '3 दिन पहले',
      sellerName: 'Rajesh जी',
      sellerPhone: '+91-9876543212',
      missedCalls: 15,
      isPremium: true,
      category: 'buffalo',
      videos: ['video5.mp4', 'video6.mp4'],
      additionalInfo: [
        '5 महीने की गर्भवती है',
        'उच्च गुणवत्ता नीली रावी नस्ल',
        'पहली बार 18L दूध दिया था'
      ],
    },
  ];

  useEffect(() => {
    loadAnimals(1, selectedCategory, nearbyOnly, true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line
  }, []);

  const loadAnimals = async (
    pageNum: number = 1,
    category: string = selectedCategory,
    nearby: boolean = nearbyOnly,
    reset: boolean = false
  ) => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/cows?page=${pageNum}&limit=${PAGE_SIZE}`;
      // Add category/nearby filters if needed
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const newAnimals = data.data;
        setAnimals(reset ? newAnimals : prev => [...prev, ...newAnimals]);
        setHasMore(newAnimals.length === PAGE_SIZE);
        setPage(pageNum);
      } else {
        throw new Error(data.message || 'Failed to load animals');
      }
    } catch (error) {
      console.error('Error loading animals:', error);
      Alert.alert('त्रुटि', 'पशु लोड करने में समस्या हुई है।');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadAnimals(page + 1, selectedCategory, nearbyOnly);
    }
  };

  const handleCategorySelect = (category: 'all' | 'cow' | 'buffalo' | 'other') => {
    setSelectedCategory(category);
    loadAnimals(1, category, nearbyOnly, true);
  };

  const toggleNearby = () => {
    const newNearby = !nearbyOnly;
    setNearbyOnly(newNearby);
    loadAnimals(1, selectedCategory, newNearby, true);
  };

  const handleCall = (phone: string, sellerName: string) => {
    Alert.alert(
      'कॉल करें',
      `${sellerName} को कॉल करें?`,
      [
        { text: 'रद्द करें', style: 'cancel' },
        { 
          text: 'कॉल करें', 
          onPress: () => Linking.openURL(`tel:${phone}`)
        }
      ]
    );
  };

  const handleWhatsApp = (phone: string, animalTitle: string) => {
    const message = `नमस्ते, मैं ${animalTitle} के बारे में जानकारी चाहता/चाहती हूं।`;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals(1, selectedCategory, nearbyOnly, true);
    setRefreshing(false);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.key && styles.selectedCategory
      ]}
      onPress={() => handleCategorySelect(item.key)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={[
        styles.categoryText,
        selectedCategory === item.key && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAnimal = ({ item, index }: { item: Animal, index: number }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({
        pathname: '/product-details',
        params: { product: JSON.stringify(item) }
      })}
    >
      <Animated.View
        style={[
          styles.animalCard,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.animalHeader}>
          <View style={styles.animalTitleContainer}>
            <Text style={styles.animalTitle} numberOfLines={2}>{item.title}</Text>
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <Icon name="crown" size={12} color="#FFD700" />
                <Text style={styles.premiumText}>प्रीमियम</Text>
              </View>
            )}
          </View>
          <Text style={styles.animalPrice}>₹{item.price.toLocaleString()}</Text>
        </View>

        <View style={styles.animalDetails}>
          <View style={styles.detailRow}>
            <Icon name="cow" size={16} color="#666" />
            <Text style={styles.detailText}>{item.breed}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="cup-water" size={16} color="#666" />
            <Text style={styles.detailText}>दूध: {item.currentMilk} / {item.milkCapacity}</Text>
          </View>
          {item.pregnant && (
            <View style={styles.detailRow}>
              <Icon name="baby-face-outline" size={16} color="#666" />
              <Text style={styles.detailText}>गर्भवती: {item.pregnancyMonths} महीने</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>आयु: {item.age}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location} ({item.distance})</Text>
          </View>
        </View>

        <View style={styles.sellerInfo}>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{item.sellerName}</Text>
            <Text style={styles.postedTime}>{item.postedTime}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(item.sellerPhone, item.sellerName)}
            >
              <Icon name="phone" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => handleWhatsApp(item.sellerPhone, item.title)}
            >
              <Icon name="whatsapp" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper
      backgroundColor="#ffffff"
      topBackgroundColor="#E8E8E8"     // Tinted gray
      bottomBackgroundColor="#000000"  // Black
    >
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Header - Same as Sell Animal Screen */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ff3b3b',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderColor: '#3a3a3a',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="cow" size={32} color="white" style={{ marginRight: 10, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }} />
            <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, letterSpacing: 1 }}>पशुपालन मंच</Text>
          </View>
          <TouchableOpacity 
            style={{ alignItems: 'center' }}
            onPress={() => router.push('/profile')}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffcc00', justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
              <Text style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>R</Text>
            </View>
            <Text style={{ color: 'white', fontSize: 14 }}>Profile</Text>
          </TouchableOpacity>
        </View>
        {/* Main Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>पशु खरीदें</Text>
          <TouchableOpacity
            style={[styles.nearbyButton, nearbyOnly && styles.nearbyButtonActive]}
            onPress={toggleNearby}
          >
            <Icon name="map-marker" size={20} color={nearbyOnly ? "#fff" : "#666"} />
            <Text style={[styles.nearbyText, nearbyOnly && styles.nearbyTextActive]}>
              पास के
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesListContent}
        />

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff3b3b" />
          </View>
        ) : (
          <FlatList
            data={animals}
            renderItem={renderAnimal}
            keyExtractor={(item) => item.id}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator size="large" color="#D32F2F" /> : null}
            contentContainerStyle={styles.animalsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#ff3b3b']}
                tintColor="#ff3b3b"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="cow-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>कोई पशु नहीं मिला</Text>
              </View>
            }
          />
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  nearbyButtonActive: {
    backgroundColor: '#ff3b3b',
  },
  nearbyText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  nearbyTextActive: {
    color: '#fff',
  },
  categoriesList: {
    maxHeight: 60,
  },
  categoriesListContent: {
    paddingHorizontal: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategory: {
    backgroundColor: '#ff3b3b',
    borderColor: '#ff3b3b',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  animalsList: {
    padding: 12,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  animalTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  animalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 12,
    color: '#FFA000',
    marginLeft: 4,
  },
  animalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b3b',
  },
  animalDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  postedTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
});

export default BuyAnimalsScreen;
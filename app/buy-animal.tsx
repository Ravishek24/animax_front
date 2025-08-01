import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

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

const BuyAnimalsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cow' | 'buffalo' | 'other'>('all');
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const categories: Category[] = [
    { id: '1', name: 'सभी', emoji: '🐄', key: 'all' },
    { id: '2', name: 'गाय', emoji: '🐄', key: 'cow' },
    { id: '3', name: 'भैंस', emoji: '🐃', key: 'buffalo' },
    { id: '4', name: 'अन्य', emoji: '🐮', key: 'other' },
  ];

  // Sample data - Replace with API call
  const sampleAnimals: Animal[] = [
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

  const loadAnimals = async (category?: string, nearby?: boolean) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredAnimals = sampleAnimals;
      
      // Filter by category
      if (category && category !== 'all') {
        filteredAnimals = filteredAnimals.filter(animal => animal.category === category);
      }
      
      // Filter by nearby (you'd implement actual location-based filtering)
      if (nearby) {
        filteredAnimals = filteredAnimals.filter(animal => 
          parseInt(animal.distance) <= 50
        );
      }
      
      setAnimals(filteredAnimals);
    } catch (error) {
      console.error('Error loading animals:', error);
      Alert.alert('त्रुटि', 'पशु लोड करने में समस्या हुई है।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimals();
    
    // Animate on load
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleCategorySelect = (category: 'all' | 'cow' | 'buffalo' | 'other') => {
    setSelectedCategory(category);
    loadAnimals(category, nearbyOnly);
  };

  const toggleNearby = () => {
    const newNearby = !nearbyOnly;
    setNearbyOnly(newNearby);
    loadAnimals(selectedCategory, newNearby);
  };

  const handleCall = (phone: string, sellerName: string) => {
    Alert.alert(
      'कॉल करें',
      `${sellerName} को कॉल करना चाहते हैं?`,
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
    const message = `नमस्ते, मुझे इस पशु में रुचि है: ${animalTitle}`;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('त्रुटि', 'WhatsApp खोलने में समस्या हुई है।');
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals(selectedCategory, nearbyOnly);
    setRefreshing(false);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.key && styles.categoryItemActive
      ]}
      onPress={() => handleCategorySelect(item.key)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={[
        styles.categoryText,
        selectedCategory === item.key && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAnimal = ({ item, index }: { item: Animal, index: number }) => (
    <Animated.View 
      style={[
        styles.animalCard,
        { 
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      {/* Animal Header */}
      <View style={styles.animalHeader}>
        <Text style={styles.animalTitle}>{item.title}</Text>
        <Text style={styles.animalPrice}>₹{item.price.toLocaleString('hi-IN')}</Text>
        <View style={styles.postingDetails}>
          <View style={styles.postingTime}>
            <Icon name="clock-outline" size={14} color="#666" />
            <Text style={styles.postingText}>{item.postedTime}</Text>
          </View>
          <View style={styles.postingLocation}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.postingText}>{item.location} (लगभग {item.distance})</Text>
          </View>
        </View>
      </View>

      {/* Media Section */}
      <View style={styles.mediaSection}>
        <View style={styles.videoThumbnail}>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={24} color="#ff3b3b" />
          </TouchableOpacity>
        </View>
        <View style={styles.videoThumbnail}>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={24} color="#ff3b3b" />
          </TouchableOpacity>
        </View>
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Icon name="crown" size={12} color="#333" />
            <Text style={styles.premiumText}>प्राइम पशु</Text>
          </View>
        )}
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        {item.pregnant && (
          <View style={styles.pregnancyInfo}>
            <Text style={styles.pregnancyText}>
              👆 {item.pregnancyMonths} महीने की गर्भवती है।
            </Text>
          </View>
        )}
        {item.additionalInfo.map((info, index) => (
          <View key={index} style={styles.infoItem}>
            <Icon name="information" size={16} color="#ff3b3b" />
            <Text style={styles.infoText}>{info}</Text>
          </View>
        ))}
      </View>

      {/* Seller Section */}
      <View style={styles.sellerSection}>
        <View style={styles.sellerInfo}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerInitial}>
              {item.sellerName.charAt(0)}
            </Text>
          </View>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{item.sellerName}</Text>
            <View style={styles.missedCalls}>
              <Icon name="phone" size={12} color="#666" />
              <Text style={styles.missedCallsText}>{item.missedCalls} आहक कॉल</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.sellerPhone, item.sellerName)}
          >
            <Icon name="phone" size={16} color="white" />
            <Text style={styles.callButtonText}>कॉल</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => handleWhatsApp(item.sellerPhone, item.title)}
          >
            <Icon name="whatsapp" size={16} color="white" />
            <Text style={styles.whatsappButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaWrapper
      backgroundColor="#ffffff"
      topBackgroundColor="#E8E8E8"
      bottomBackgroundColor="#000000"
    >
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
      
      {/* Header - Same as Home Screen */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Icon name="cow" size={32} color="white" style={styles.logoIcon} />
          <Text style={styles.logoText}>पशुपालन मंच</Text>
        </View>
        <TouchableOpacity 
          style={styles.userProfile}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>R</Text>
          </View>
          <Text style={styles.profileText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Location Section */}
      <View style={styles.locationSection}>
        <View style={styles.locationHeader}>
          <View style={styles.locationInfo}>
            <Icon name="map-marker" size={18} color="#ff3b3b" />
            <Text style={styles.locationText}>Block C, Ansal Golf Links 1,...</Text>
          </View>
          <View style={styles.nearbyToggle}>
            <Text style={styles.nearbyText}>आस पास के पशु</Text>
            <TouchableOpacity
              style={[styles.toggleSwitch, nearbyOnly && styles.toggleSwitchActive]}
              onPress={toggleNearby}
            >
              <View style={[styles.toggleThumb, nearbyOnly && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category Navigation */}
      <View style={styles.categoryNav}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        />
      </View>

      {/* Main Content */}
      <FlatList
        data={animals}
        renderItem={renderAnimal}
        keyExtractor={(item) => item.id}
        style={styles.animalsList}
        contentContainerStyle={styles.animalsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff3b3b" />
              <Text style={styles.loadingText}>पशु लोड हो रहे हैं...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="cow" size={64} color="#ccc" />
              <Text style={styles.emptyText}>कोई पशु उपलब्ध नहीं है</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadAnimals()}>
                <Text style={styles.retryButtonText}>दोबारा कोशिश करें</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          loading && animals.length > 0 ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#ff3b3b" />
              <Text style={styles.footerLoadingText}>अधिक पशु लोड हो रहे हैं...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  // Header - Same as Home Screen
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  userProfile: {
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffcc00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileInitial: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileText: {
    color: 'white',
    fontSize: 14,
  },

  // Location Section
  locationSection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  nearbyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: '#ccc',
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#ff3b3b',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  // Category Navigation
  categoryNav: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryContainer: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categoryItemActive: {
    backgroundColor: '#fff8f8',
    borderColor: '#ff3b3b',
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryTextActive: {
    color: '#ff3b3b',
  },

  // Animals List
  animalsList: {
    flex: 1,
  },
  animalsListContent: {
    padding: 16,
    paddingBottom: 80,
  },

  // Animal Card
  animalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b3b',
  },

  // Animal Header
  animalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  animalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  animalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3b3b',
    marginBottom: 8,
  },
  postingDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  postingTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  // Media Section
  mediaSection: {
    height: 200,
    flexDirection: 'row',
    position: 'relative',
  },
  videoThumbnail: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: 'white',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ffcc00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },

  // Additional Info
  additionalInfo: {
    padding: 16,
    backgroundColor: '#fff8f8',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pregnancyInfo: {
    marginBottom: 8,
  },
  pregnancyText: {
    backgroundColor: '#4caf50',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  // Seller Section
  sellerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff3b3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  missedCalls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missedCallsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default BuyAnimalsScreen;
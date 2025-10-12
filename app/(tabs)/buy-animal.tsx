import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { apiService } from '../../services';
import CommonHeader from '../../components/CommonHeader';

const { width } = Dimensions.get('window');

interface AnimalMedia {
  media_id: number;
  media_url: string;
  media_type: string;
  media_category?: string;
  is_primary?: boolean;
  tag?: string;
}

interface Animal {
  animal_id: number;
  title: string;
  description: string;
  price: string | number;
  breed_description: string;
  lactation_number?: number;
  milk_yield_per_day: string;
  peak_milk_yield_per_day?: string;
  is_pregnant: boolean;
  months_pregnant?: number;
  calf_status: string;
  selling_timeframe: string;
  preferred_animal_type: string;
  status: string;
  location_address: string;
  location_latitude?: number;
  location_longitude?: number;
  additional_info?: string;
  listing_date: string;
  is_negotiable: boolean;
  category_id: number;
  seller_id: number;
  Category?: {
    category_name: string;
  };
  User?: {
    full_name: string;
    phone_number: string;
  };
  media?: AnimalMedia[];
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  key: 'all' | 'cow' | 'buffalo' | 'other';
}

const PAGE_SIZE = 20;

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
  const [selectedMedia, setSelectedMedia] = useState<AnimalMedia | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const categories: Category[] = [
    { id: '1', name: 'सभी', emoji: '🐄', key: 'all' },
    { id: '2', name: 'गाय', emoji: '🐄', key: 'cow' },
    { id: '3', name: 'भैंस', emoji: '🐃', key: 'buffalo' },
    { id: '4', name: 'अन्य', emoji: '🐮', key: 'other' },
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
      console.log('🔍 Loading animals with params:', { pageNum, category, nearby });
      
      const params: any = {
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
        nearby: nearby ? 'true' : 'false'
      };
      
      // Add category filter if not 'all'
      if (category !== 'all') {
        const categoryMap: { [key: string]: string } = {
          'cow': '1',      // गाय
          'buffalo': '2',  // भैंस
          'other': '3'     // बैल (Ox) and others
        };
        params.category_id = categoryMap[category];
      }
      
      console.log('🌐 Making API request to /api/animals with params:', params);
      const data = await apiService.getAnimals(params);
      
      console.log('📥 API Response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        console.log('✅ Animals loaded successfully, count:', data.data.length);
        const newAnimals = data.data;
        
        // Debug: Check the structure of the first animal
        if (newAnimals.length > 0) {
          console.log('🔍 First animal structure:', JSON.stringify(newAnimals[0], null, 2));
          console.log('🔍 First animal media:', newAnimals[0].media);
        }
        
        setAnimals(reset ? newAnimals : prev => [...prev, ...newAnimals]);
        setHasMore(newAnimals.length === PAGE_SIZE);
        setPage(pageNum);
      } else {
        console.warn('⚠️ No animal data received or empty response');
        setAnimals(reset ? [] : prev => prev);
        setHasMore(false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('❌ Error loading animals:', error);
      setAnimals(reset ? [] : prev => prev);
      setHasMore(false);
      setPage(pageNum);
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

  const handleMediaPress = (media: AnimalMedia) => {
    setSelectedMedia(media);
    setShowMediaModal(true);
  };

  const closeMediaModal = () => {
    setShowMediaModal(false);
    setSelectedMedia(null);
  };

  const getPrimaryImage = (animal: Animal): string => {
    try {
      if (!animal || !animal.media || !Array.isArray(animal.media) || animal.media.length === 0) {
        return 'https://via.placeholder.com/300x200?text=No+Image';
      }
      
      // First try to find primary image
      const primaryImage = animal.media.find(m => m && m.is_primary && m.media_type?.includes('image'));
      if (primaryImage) return primaryImage.media_url;
      
      // Then try to find any udder photo
      const udderPhoto = animal.media.find(m => m && m.media_category === 'udder_photo');
      if (udderPhoto) return udderPhoto.media_url;
      
      // Then any image
      const anyImage = animal.media.find(m => m && m.media_type?.includes('image'));
      if (anyImage) return anyImage.media_url;
    } catch (error) {
      console.error('Error in getPrimaryImage:', error);
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  const getMediaCount = (animal: Animal): { images: number; videos: number; total: number } => {
    try {
      if (!animal || !animal.media || !Array.isArray(animal.media) || animal.media.length === 0) {
        return { images: 0, videos: 0, total: 0 };
      }

      const images = animal.media.filter(m => m && m.media_type && m.media_type.includes('image')).length;
      const videos = animal.media.filter(m => m && m.media_type && m.media_type.includes('video')).length;
      
      return {
        images,
        videos,
        total: animal.media.length
      };
    } catch (error) {
      console.error('Error in getMediaCount:', error);
      return { images: 0, videos: 0, total: 0 };
    }
  };

  const getMediaCategories = (animal: Animal): string[] => {
    try {
      if (!animal || !animal.media || !Array.isArray(animal.media) || animal.media.length === 0) return [];
      
      const categories = animal.media
        .map(m => m && m.media_category ? m.media_category : null)
        .filter((cat): cat is string => cat !== undefined && cat !== null) // Type guard to remove undefined/null
        .filter((cat, index, arr) => arr.indexOf(cat) === index); // Remove duplicates
      
      return categories;
    } catch (error) {
      console.error('Error in getMediaCategories:', error);
      return [];
    }
  };

  const getCategoryName = (animal: Animal): string => {
    return animal.Category?.category_name || 'Unknown';
  };

  const getSellerName = (animal: Animal): string => {
    return animal.User?.full_name || 'Unknown Seller';
  };

  const getSellerPhone = (animal: Animal): string => {
    return animal.User?.phone_number || '';
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-IN');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'आज';
    if (diffDays === 2) return 'कल';
    if (diffDays <= 7) return `${diffDays} दिन पहले`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} हफ्ते पहले`;
    return `${Math.floor(diffDays / 30)} महीने पहले`;
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

  const renderAnimal = ({ item, index }: { item: Animal, index: number }) => {
    const primaryImage = getPrimaryImage(item);
    const categoryName = getCategoryName(item);
    const sellerName = getSellerName(item);
    const sellerPhone = getSellerPhone(item);
    const formattedPrice = formatPrice(item.price);
    const postedTime = formatDate(item.listing_date);
    const mediaCount = getMediaCount(item);
    const mediaCategories = getMediaCategories(item);

    return (
      <View style={styles.animalCard}>
        <Animated.View
          style={[
            styles.animalCard,
            { opacity: fadeAnim }
          ]}
        >
                     {/* Animal Media Gallery */}
           {item.media && item.media.length > 0 && (
             <View style={styles.mediaGallery}>
               {/* Main large image/video */}
               <TouchableOpacity 
                 style={styles.mainMediaContainer}
                 onPress={() => handleMediaPress(item.media![0])}
               >
                                   {item.media[0].media_type?.includes('video') ? (
                    <Video
                      source={{ uri: item.media[0].media_url }}
                      style={styles.mainMedia}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isMuted={true}
                      isLooping={false}
                    />
                  ) : (
                    <Image
                      source={{ uri: item.media[0].media_url }}
                      style={styles.mainMedia}
                      resizeMode="cover"
                    />
                  )}
                 {item.media[0].media_type?.includes('video') && (
                   <View style={styles.playButton}>
                     <Icon name="play" size={24} color="#fff" />
                   </View>
                 )}
                 {item.is_negotiable && (
                   <View style={styles.negotiableBadge}>
                     <Text style={styles.negotiableText}>मोल-भाव</Text>
                   </View>
                 )}
               </TouchableOpacity>
               
               {/* Side media thumbnails */}
               {item.media.length > 1 && (
                 <View style={styles.sideMediaContainer}>
                   {item.media.slice(1, 3).map((media, idx) => (
                     <TouchableOpacity 
                       key={media.media_id} 
                       style={styles.sideMediaItem}
                       onPress={() => handleMediaPress(media)}
                     >
                                               {media.media_type?.includes('video') ? (
                          <Video
                            source={{ uri: media.media_url }}
                            style={styles.sideMedia}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={false}
                            isMuted={true}
                            isLooping={false}
                          />
                        ) : (
                          <Image
                            source={{ uri: media.media_url }}
                            style={styles.sideMedia}
                            resizeMode="cover"
                          />
                        )}
                       {media.media_type?.includes('video') && (
                         <View style={styles.sidePlayButton}>
                           <Icon name="play" size={16} color="#fff" />
                         </View>
                       )}
                     </TouchableOpacity>
                   ))}
                   {item.media.length > 3 && (
                     <View style={styles.moreMediaOverlay}>
                       <Text style={styles.moreMediaText}>+{item.media.length - 3}</Text>
                     </View>
                   )}
                 </View>
               )}
             </View>
           )}
          
          {/* Fallback single image if no media */}
          {(!item.media || item.media.length === 0) && (
            <View style={styles.animalImageContainer}>
              <Image
                source={{ uri: primaryImage }}
                style={styles.animalImage}
                resizeMode="cover"
              />
              {item.is_negotiable && (
                <View style={styles.negotiableBadge}>
                  <Text style={styles.negotiableText}>मोल-भाव</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.animalHeader}>
            <View style={styles.animalTitleContainer}>
              <Text style={styles.animalTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.categoryLabel}>{categoryName}</Text>
            </View>
            <Text style={styles.animalPrice}>₹{formattedPrice}</Text>
          </View>

          <View style={styles.animalDetails}>
            <View style={styles.detailRow}>
              <Icon name="cow" size={16} color="#666" />
              <Text style={styles.detailText}>नस्ल: {item.breed_description}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="cup-water" size={16} color="#666" />
              <Text style={styles.detailText}>दूध: {item.milk_yield_per_day}L प्रति दिन</Text>
            </View>
            {item.peak_milk_yield_per_day && (
              <View style={styles.detailRow}>
                <Icon name="trending-up" size={16} color="#666" />
                <Text style={styles.detailText}>अधिकतम: {item.peak_milk_yield_per_day}L</Text>
              </View>
            )}
            {item.lactation_number !== undefined && (
              <View style={styles.detailRow}>
                <Icon name="numeric" size={16} color="#666" />
                <Text style={styles.detailText}>ब्यांत: {item.lactation_number}</Text>
              </View>
            )}
            {item.is_pregnant && (
              <View style={styles.detailRow}>
                <Icon name="baby-face-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  गर्भवती: {item.months_pregnant || 'Unknown'} महीने
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>बिक्री समय: {item.selling_timeframe}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="home" size={16} color="#666" />
              <Text style={styles.detailText}>प्रकार: {item.preferred_animal_type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="map-marker" size={16} color="#666" />
              <Text style={styles.detailText}>{item.location_address}</Text>
            </View>
            {item.additional_info && (
              <View style={styles.detailRow}>
                <Icon name="information" size={16} color="#666" />
                <Text style={styles.detailText} numberOfLines={2}>{item.additional_info}</Text>
              </View>
            )}
            
            {/* Media Categories */}
            {mediaCategories.length > 0 && (
              <View style={styles.detailRow}>
                <Icon name="camera" size={16} color="#666" />
                <Text style={styles.detailText}>
                  मीडिया: {mediaCategories.map(cat => {
                    switch(cat) {
                      case 'udder_photo': return 'धन का फोटो';
                      case 'general_video': return 'सामान्य वीडियो';
                      case 'milking_video': return 'दूध दुहाई वीडियो';
                      default: return cat;
                    }
                  }).join(', ')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.sellerInfo}>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{sellerName}</Text>
              <Text style={styles.postedTime}>{postedTime}</Text>
            </View>
            <View style={styles.actionButtons}>
              {sellerPhone && (
                <>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(sellerPhone, sellerName)}
                  >
                    <Icon name="phone" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => handleWhatsApp(sellerPhone, item.title)}
                  >
                    <Icon name="whatsapp" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>
                     </View>
         </Animated.View>
       </View>
     );
   };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Header */}
        <CommonHeader title="पशु खरीदें" />
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
            <ActivityIndicator size="large" color="#990906" />
            <Text style={styles.loadingText}>पशु लोड हो रहे हैं...</Text>
          </View>
        ) : (
          <FlatList
            data={animals}
            renderItem={renderAnimal}
            keyExtractor={(item) => item.animal_id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator size="large" color="#D32F2F" /> : null}
            contentContainerStyle={styles.animalsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#990906']}
                tintColor="#990906"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="cow-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>कोई पशु नहीं मिला</Text>
                <Text style={styles.emptySubText}>अभी तक कोई पशु बिक्री के लिए नहीं डाला गया है</Text>
              </View>
            }
          />
        )}

        {/* Media Modal */}
        {showMediaModal && selectedMedia && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeMediaModal}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
                             {selectedMedia.media_type?.includes('video') ? (
                 <Video
                   source={{ uri: selectedMedia.media_url }}
                   style={styles.modalVideo}
                   useNativeControls
                   resizeMode={ResizeMode.CONTAIN}
                   isLooping={false}
                   shouldPlay={true}
                 />
               ) : (
                 <Image
                   source={{ uri: selectedMedia.media_url }}
                   style={styles.modalImage}
                   resizeMode="contain"
                 />
               )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
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
    backgroundColor: '#990906',
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
    maxHeight: 100,
    paddingVertical: 8,
  },
  categoriesListContent: {
    paddingHorizontal: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 36,
  },
  selectedCategory: {
    backgroundColor: '#990906',
    borderColor: '#990906',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  animalImageContainer: {
    height: 200,
    position: 'relative',
  },
  animalImage: {
    width: '100%',
    height: '100%',
  },
  negotiableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  negotiableText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 16,
    paddingBottom: 0,
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
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  animalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#990906',
  },
  animalDetails: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Media Gallery Styles
  mediaGallery: {
    flexDirection: 'row',
    height: 200,
  },
  mainMediaContainer: {
    flex: 2,
    position: 'relative',
  },
  mainMedia: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideMediaContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sideMediaItem: {
    flex: 1,
    marginBottom: 2,
    position: 'relative',
  },
  sideMedia: {
    width: '100%',
    height: '100%',
  },
  sidePlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMediaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#000',
    borderRadius: 12,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalVideo: {
    width: '100%',
    height: '100%',
  },
});

export default BuyAnimalsScreen;
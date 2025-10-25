import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StatusBar,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services';

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

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Animals state
  const [userAnimals, setUserAnimals] = useState<Animal[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  
  // Media modal state
  const [selectedMedia, setSelectedMedia] = useState<AnimalMedia | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const stats = (user as any)?.stats || {} as any;
  const locationText = (user?.city || user?.state) ? `${user?.city || ''} ${user?.state || ''}`.trim() : (user?.address || '—');
  const animalsListed = stats.animalsListed ?? 0;
  const callsMade = stats.callsMade ?? 0;
  const monthsConnected = stats.monthsConnected ?? 0;
  const completionPercent = typeof stats.completionPercent === 'number' ? stats.completionPercent : 0;
  const incompletePercent = Math.max(0, 100 - completionPercent);

  // Fetch user's animals
  useEffect(() => {
    const fetchUserAnimals = async () => {
      if (!user?.user_id) return;
      
      try {
        setLoadingAnimals(true);
        const response = await apiService.getAnimals({
          seller_id: user.user_id.toString(),
        });
        
        if (response.success && response.data) {
          setUserAnimals(response.data);
        }
      } catch (error) {
        console.error('Error fetching user animals:', error);
      } finally {
        setLoadingAnimals(false);
      }
    };

    fetchUserAnimals();
  }, [user?.user_id]);

  // Media handlers
  const handleMediaPress = (media: AnimalMedia) => {
    setSelectedMedia(media);
    setShowMediaModal(true);
    setVideoPaused(true);
  };

  const closeMediaModal = () => {
    setVideoPaused(true);
    setShowMediaModal(false);
    setSelectedMedia(null);
    setVideoProgress(0);
    setVideoDuration(0);
  };

  const getPrimaryImage = (animal: Animal): string => {
    try {
      if (!animal || !animal.media || !Array.isArray(animal.media) || animal.media.length === 0) {
        return 'https://via.placeholder.com/300x200?text=No+Image';
      }
      
      const primaryImage = animal.media.find(m => m && m.is_primary && m.media_type?.includes('image'));
      if (primaryImage) return primaryImage.media_url;
      
      const udderPhoto = animal.media.find(m => m && m.media_category === 'udder_photo');
      if (udderPhoto) return udderPhoto.media_url;
      
      const anyImage = animal.media.find(m => m && m.media_type?.includes('image'));
      if (anyImage) return anyImage.media_url;
    } catch (error) {
      console.error('Error in getPrimaryImage:', error);
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
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

  const handleLogout = () => {
    Alert.alert(
      t('logoutConfirmTitle'),
      t('logoutConfirmMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logoutAction'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/opening');
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (animalId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await apiService.updateAnimalStatus(animalId, newStatus);
      
      if (response.success) {
        // Update the local state
        setUserAnimals(prevAnimals =>
          prevAnimals.map(animal =>
            animal.animal_id === animalId
              ? { ...animal, status: newStatus }
              : animal
          )
        );
        
        Alert.alert(
          'सफलता',
          newStatus === 'active' 
            ? 'पशु सक्रिय कर दिया गया है' 
            : 'पशु निष्क्रिय कर दिया गया है'
        );
      }
    } catch (error) {
      console.error('Error toggling animal status:', error);
      Alert.alert('त्रुटि', 'स्थिति बदलने में समस्या आई');
    }
  };

  const renderAnimalCard = ({ item }: { item: Animal }) => {
    const formattedPrice = formatPrice(item.price);
    const postedTime = formatDate(item.listing_date);
    const categoryName = item.Category?.category_name || 'Unknown';

    return (
      <View style={styles.animalCard}>
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
                  resizeMode="cover"
                  paused={true}
                  muted={true}
                  repeat={false}
                  controls={false}
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
                  <Icon name="play" size={28} color="#990906" />
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
                {item.media.slice(1, 3).map((media) => (
                  <TouchableOpacity 
                    key={media.media_id} 
                    style={styles.sideMediaItem}
                    onPress={() => handleMediaPress(media)}
                  >
                    {media.media_type?.includes('video') ? (
                      <Video
                        source={{ uri: media.media_url }}
                        style={styles.sideMedia}
                        resizeMode="cover"
                        paused={true}
                        muted={true}
                        repeat={false}
                        controls={false}
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
                        <Icon name="play" size={18} color="#990906" />
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
              source={{ uri: getPrimaryImage(item) }}
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
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location_address}</Text>
          </View>
        </View>

        <View style={styles.sellerInfo}>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{item.User?.full_name || 'Unknown Seller'}</Text>
            <Text style={styles.postedTime}>{postedTime}</Text>
          </View>
          
          {/* Status Badge and Toggle */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              item.status === 'active' && styles.statusBadgeActive,
              item.status === 'inactive' && styles.statusBadgeInactive,
              item.status === 'sold' && styles.statusBadgeSold
            ]}>
              <Text style={styles.statusText}>
                {item.status === 'active' ? 'सक्रिय' : item.status === 'inactive' ? 'निष्क्रिय' : 'बिक गया'}
              </Text>
            </View>
            
            {/* Toggle Button (not available for sold items) */}
            {item.status !== 'sold' && (
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  item.status === 'active' ? styles.toggleButtonDisable : styles.toggleButtonEnable
                ]}
                onPress={() => handleToggleStatus(item.animal_id, item.status)}
              >
                <Icon 
                  name={item.status === 'active' ? 'eye-off' : 'eye'} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.toggleButtonText}>
                  {item.status === 'active' ? 'छुपाएं' : 'दिखाएं'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{t('profile')}</Text>
          
          <View style={styles.headerRightContainer}>
            <View>
              <TouchableOpacity 
                style={styles.languageButton}
                onPress={() => setShowLanguageMenu((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text style={styles.languageText}>
                  {language === 'en-hi' ? 'En | हि' : 'ਪੰਜਾਬੀ'}
                </Text>
                <Icon name="chevron-down" size={18} color="#fff" />
              </TouchableOpacity>
              {showLanguageMenu && (
                <View style={styles.languageMenu}>
                  <TouchableOpacity 
                    style={styles.languageMenuItem}
                    onPress={() => { setLanguage('en-hi'); setShowLanguageMenu(false); }}
                  >
                    <Text style={styles.languageMenuText}>En | हि (Default)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.languageMenuItem}
                    onPress={() => { setLanguage('pa'); setShowLanguageMenu(false); }}
                  >
                    <Text style={styles.languageMenuText}>ਪੰਜਾਬੀ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.moreButton} onPress={handleLogout}>
              <Icon name="logout" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>
                  {user?.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.completionBadge}>
                <Text style={styles.completionText}>{incompletePercent}% {t('incomplete')}</Text>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
              
              <View style={styles.locationRow}>
                <Icon name="map-marker" size={18} color="#666" />
                <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                  {locationText}
                </Text>
              </View>
              
              <View style={styles.contactRow}>
                <View style={styles.phoneContainer}>
                  <Icon name="phone" size={16} color="#666" />
                  <Text style={styles.phoneText}>
                    {user?.phone_number?.replace('+91', '') || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.whatsappContainer}>
                  <Icon name="whatsapp" size={16} color="#666" />
                  <Text style={styles.phoneText}>
                    {user?.phone_number?.replace('+91', '') || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
            >
              <FeatherIcon name="edit-2" size={20} color="#990906" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t('statsJourneyTitle')}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="cow" size={24} color="#990906" />
              <Text style={styles.statValue}>{animalsListed}</Text>
              <Text style={styles.statLabel}>{t('statAnimalsListed')}</Text>
            </View>
            
            <View style={[styles.statItem, styles.statBorder]}>
              <Icon name="phone" size={24} color="#990906" />
              <Text style={styles.statValue}>{callsMade}</Text>
              <Text style={styles.statLabel}>{t('statCallsMade')}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="calendar-month" size={24} color="#990906" />
              <Text style={styles.statValue}>{monthsConnected}</Text>
              <Text style={styles.statLabel}>{t('statMonthsConnected')}</Text>
            </View>
          </View>
        </View>
        
        {/* Profile Completion Card */}
        <View style={styles.completionCard}>
          <View style={styles.completionContent}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="alert-circle" size={24} color="#E53935" />
              <Text style={styles.avatarText}>अधूरी प्रोफाइल</Text>
            </View>
            
            <View style={styles.completionTextContainer}>
              <Text style={styles.completionTitleText}>
                {t('yourProfile')} <Text style={styles.percentText}>{incompletePercent}% {t('incomplete')}</Text> {t('isWord')}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>{t('completeNow')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* User's Animals Section Header */}
        <View style={styles.animalsHeaderContainer}>
          <View style={styles.animalsTitleContainer}>
            <Icon name="cow" size={24} color="#333" />
            <Text style={styles.animalsTitle}>{user?.full_name || 'User'} {t('animalsOfSuffix')}</Text>
          </View>
          
          <TouchableOpacity style={styles.supportButton}>
            <Icon name="headset" size={20} color="#fff" />
            <Text style={styles.supportButtonText}>{t('customerSupport')}</Text>
          </TouchableOpacity>
        </View>

        {/* User's Animals List */}
        {loadingAnimals ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#990906" />
            <Text style={styles.loadingText}>पशु लोड हो रहे हैं...</Text>
          </View>
        ) : userAnimals.length > 0 ? (
          <FlatList
            data={userAnimals}
            renderItem={renderAnimalCard}
            keyExtractor={(item) => item.animal_id.toString()}
            contentContainerStyle={styles.animalsList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="cow-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>कोई पशु नहीं मिला</Text>
            <Text style={styles.emptySubText}>आपने अभी तक कोई पशु नहीं डाला है</Text>
          </View>
        )}
      </ScrollView>

      {/* Media Modal */}
      <Modal
        visible={showMediaModal && !!selectedMedia}
        animationType="fade"
        transparent={true}
        onRequestClose={closeMediaModal}
      >
        <View style={styles.mediaModalOverlay}>
          <TouchableOpacity 
            style={styles.mediaModalBackdrop}
            activeOpacity={1}
            onPress={closeMediaModal}
          />
          <View style={styles.mediaModalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeMediaModal}
            >
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>
            
            {selectedMedia?.media_type?.includes('video') ? (
              <View style={styles.modalVideoContainer}>
                <Video
                  source={{ uri: selectedMedia.media_url }}
                  style={styles.modalVideo}
                  resizeMode="contain"
                  paused={videoPaused}
                  muted={false}
                  repeat={false}
                  controls={false}
                  playInBackground={false}
                  playWhenInactive={false}
                  ignoreSilentSwitch="ignore"
                  onLoad={(data) => {
                    setVideoDuration(data.duration);
                  }}
                  onProgress={(data) => {
                    setVideoProgress(data.currentTime);
                  }}
                  onError={(error) => {
                    console.log('Modal video error:', error);
                    Alert.alert('Video Error', 'Failed to load video. Please try again.');
                  }}
                />
                {videoPaused && (
                  <TouchableOpacity 
                    style={styles.modalPlayButtonOverlay}
                    onPress={() => setVideoPaused(false)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.modalPlayButton}>
                      <Icon 
                        name="play" 
                        size={32} 
                        color="#990906" 
                      />
                    </View>
                  </TouchableOpacity>
                )}
                {!videoPaused && (
                  <TouchableOpacity 
                    style={styles.modalPlayButtonOverlay}
                    onPress={() => setVideoPaused(true)}
                    activeOpacity={1}
                  />
                )}
                {/* Video Progress Bar */}
                <View style={styles.videoProgressContainer}>
                  <View 
                    style={[
                      styles.videoProgressBar, 
                      { width: videoDuration > 0 ? `${(videoProgress / videoDuration) * 100}%` : '0%' }
                    ]} 
                  />
                </View>
              </View>
            ) : selectedMedia ? (
              <Image
                source={{ uri: selectedMedia.media_url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7E57C2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  languageText: {
    color: '#fff',
    marginRight: 4,
  },
  languageMenu: {
    position: 'absolute',
    right: 12,
    top: 42,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 100,
  },
  languageMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 120,
  },
  languageMenuText: {
    color: '#333',
    fontSize: 14,
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f9ca1b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  completionBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFCDD2',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  completionText: {
    fontSize: 10,
    color: '#990906',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
    color: '#555',
    fontSize: 14,
    width: '85%',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    marginLeft: 4,
    color: '#555',
    fontSize: 14,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: '#FFEBEE',
    margin: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
  },
  completionCard: {
    backgroundColor: '#FFF5F5',
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  completionContent: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    color: '#E53935',
    textAlign: 'center',
    marginTop: 4,
  },
  completionTextContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  completionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  percentText: {
    color: '#E53935',
  },
  completionDescription: {
    fontSize: 14,
    color: '#555',
  },
  completeButton: {
    backgroundColor: '#990906',
    padding: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  animalsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
  },
  animalsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animalsTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  supportButton: {
    backgroundColor: '#990906',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Animals List Styles
  animalsList: {
    padding: 12,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingVertical: 40,
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
  // Animal Card Styles
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
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#4CAF50',
  },
  statusBadgeInactive: {
    backgroundColor: '#9E9E9E',
  },
  statusBadgeSold: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  toggleButtonEnable: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonDisable: {
    backgroundColor: '#E53935',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#990906',
  },
  sideMediaContainer: {
    flex: 1,
    paddingLeft: 2,
    gap: 4,
  },
  sideMediaItem: {
    flex: 1,
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
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#990906',
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
  // Media Modal Styles
  mediaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 80,
  },
  mediaModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mediaModalContent: {
    width: width - 24,
    height: 280,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalVideoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  modalVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  modalPlayButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 40,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#990906',
  },
  videoProgressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  videoProgressBar: {
    height: '100%',
    backgroundColor: '#f9ca1b',
  },
});

export default ProfileScreen;
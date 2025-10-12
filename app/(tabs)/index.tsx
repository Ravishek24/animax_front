import React from 'react';
import {
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CommonHeader from '../../components/CommonHeader';
import { useLanguage } from '../../contexts/LanguageContext';
import VideoCarousel from '../../components/VideoCarousel';
import { fetchActiveVideos } from '../../services/videos';

const { width } = Dimensions.get('window');


const HomeScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentBannerSlide, setCurrentBannerSlide] = React.useState(0);
  const [currentProcessSlide, setCurrentProcessSlide] = React.useState(0);
  const [videos, setVideos] = React.useState<any[]>([]);
  
  // Banner slider animation
  React.useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerSlide((prevSlide) => (prevSlide + 1) % 3);
    }, 4000);
    
    return () => clearInterval(bannerInterval);
  }, []);

  // Process slider animation
  React.useEffect(() => {
    const processInterval = setInterval(() => {
      setCurrentProcessSlide((prevSlide) => (prevSlide + 1) % 5);
    }, 3000);
    
    return () => clearInterval(processInterval);
  }, []);

  // Load videos for the video section
  React.useEffect(() => {
    (async () => {
      try {
        const list = await fetchActiveVideos();
        setVideos(list || []);
      } catch (e) {
        setVideos([]);
      }
    })();
  }, []);

  const processScrollViewRef = React.useRef<ScrollView>(null);
  
  React.useEffect(() => {
    if (processScrollViewRef.current) {
      processScrollViewRef.current.scrollTo({
        x: currentProcessSlide * 195,
        animated: true,
      });
    }
  }, [currentProcessSlide]);

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <CommonHeader title={t('appName')} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Banner Slider */}
        <View style={styles.bannerSlider}>
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentOffset={{ x: currentBannerSlide * width * 0.9, y: 0 }}
          >
            <View style={styles.bannerSlide}>
              <Image 
                source={require('../../assets/Untitled (960 x 600 px) (970 x 600 px) (980 x 600 px).png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.bannerSlide}>
              <Image 
                source={require('../../assets/Untitled (960 x 600 px) (970 x 600 px) (980 x 600 px).png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.bannerSlide}>
              <Image 
                source={require('../../assets/Untitled (960 x 600 px) (970 x 600 px) (980 x 600 px).png')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
          </ScrollView>
          <View style={styles.bannerControls}>
            {[0, 1, 2].map((index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.bannerDot,
                  currentBannerSlide === index && styles.bannerDotActive
                ]}
                onPress={() => setCurrentBannerSlide(index)}
              />
            ))}
          </View>
        </View>

        {/* Combined Animal Services Section with Stats */}
        <View style={styles.sectionContainer}>
          <View style={styles.combinedServicesContainer}>
            {/* Buy Animals Card */}
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => router.push('/buy-animal')}
            >
              <View style={styles.serviceCardHeader}>
                <View style={styles.serviceIcons}>
                  <Image source={require('../../assets/a.png')} style={styles.serviceIconImage} />
                </View>
                <Text style={styles.serviceCardTitle}>{t('buyAnimals')}</Text>
                <Text style={styles.serviceCardStats}>(342+ नए पशु उपलब्ध)</Text>
              </View>
            </TouchableOpacity>

            {/* Sell Animals Card */}
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => router.push('/sell-animal')}
            >
              <View style={styles.serviceCardHeader}>
                <View style={styles.serviceIcons}>
                  <Image source={require('../../assets/b.png')} style={styles.serviceIconImage} />
                </View>
                <Text style={styles.serviceCardTitle}>{t('sellAnimals')}</Text>
                <Text style={styles.serviceCardStats}>(520+ खरीदार उपलब्ध)</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Marketplace Promo Card */
        }
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('animalSupplies')}</Text>
          <TouchableOpacity 
            style={styles.marketplaceCard}
            onPress={() => router.push('/marketplace')}
          >
            <Text style={styles.marketplacePillText}>{t('marketplacePill')}</Text>
          </TouchableOpacity>
        </View>

        

        {/* Free Listing Section */}
        <View style={styles.freeListing}>
          <View style={styles.freeHeader}>
            <View style={styles.freeHeaderIcon}>
              <Icon name="account" size={28} color="#990906" />
            </View>
            <View>
              <Text style={styles.freeTitle}>FREE में पशु दर्ज करें</Text>
              <Text style={styles.freeSubtitle}>बिना किसी पेमेंट के, पशु आसानी से बेचें</Text>
            </View>
          </View>
          <Text style={styles.whatToSell}>क्या बेचना है?</Text>
          <View style={styles.animalOptions}>
            <TouchableOpacity 
              style={styles.animalOption}
              onPress={() => router.push('/sell-animal')}
            >
              <Text style={styles.animalOptionText}>गाय</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.animalOption}
              onPress={() => router.push('/sell-animal')}
            >
              <Text style={styles.animalOptionText}>भैंस</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.animalOption}
              onPress={() => router.push('/sell-animal')}
            >
              <Text style={styles.animalOptionText}>अन्य पशु</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Videos Section */}
        {videos.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('ourVideos')}</Text>
            <VideoCarousel items={videos} />
          </View>
        )}

        {/* Process Section */}
        <View style={styles.processSection}>
          <Text style={styles.processTitle}>{t('processTitle')}</Text>
          <ScrollView 
            ref={processScrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.processSteps}
          >
            <View style={styles.processStep}>
              <View style={styles.stepImage}>
                <Icon name="cart" size={36} color="white" />
              </View>
              <Text style={styles.stepTitle}>कैसे खरीदें पशुपालन मंच पे पशु?</Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepImage}>
                <Icon name="hand-coin" size={36} color="white" />
              </View>
              <Text style={styles.stepTitle}>पशु बेचने का सही तरीका जानें</Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepImage}>
                <Icon name="clock-fast" size={36} color="white" />
              </View>
              <Text style={styles.stepTitle}>1 दिन में कैसे बिकेगा पशु?</Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepImage}>
                <Icon name="certificate" size={36} color="white" />
              </View>
              <Text style={styles.stepTitle}>पशु की गुणवत्ता की पहचान</Text>
            </View>
            <View style={styles.processStep}>
              <View style={styles.stepImage}>
                <Icon name="truck" size={36} color="white" />
              </View>
              <Text style={styles.stepTitle}>पशु परिवहन के टिप्स</Text>
            </View>
          </ScrollView>
          
          {/* Slider Navigation Dots */}
          <View style={styles.sliderDots}>
            {[0, 1, 2, 3, 4].map((index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.dot,
                  currentProcessSlide === index && styles.dotActive
                ]}
                onPress={() => setCurrentProcessSlide(index)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Remove the tab bar spacer - it's causing the white block */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  
  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollViewContent: {
    paddingBottom: 80, // Add padding to the bottom of the ScrollView
  },
  
  // Banner Slider
  bannerSlider: {
    position: 'relative',
    height: 200,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  bannerSlide: {
    width: width - 32,
    height: 200,
    backgroundColor: 'white',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bannerControls: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  bannerDot: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bannerDotActive: {
    backgroundColor: 'white',
    width: 20,
    borderRadius: 10,
  },
  
  // Combined Services Section
  combinedServicesContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#990906',
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  serviceCardHeader: {
    alignItems: 'center',
  },
  serviceIcons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  serviceIcon: {
    marginHorizontal: 4,
  },
  serviceIconImage: {
    width: 50,
    height: 50,
    marginHorizontal: 4,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceCardStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  
  // Section Container and Title
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
    position: 'relative',
  },
  
  // Icon Grid
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
  },
  iconItem: {
    width: '25%',
    padding: 6,
    alignItems: 'center',
  },
  iconImage: {
    marginBottom: 8,
  },
  iconText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  
  // Marketplace Card
  marketplaceCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
    height: 70,
    backgroundColor: '#f9ca1b',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  marketplacePillText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
  },
  
  // Free Listing Section
  freeListing: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  freeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  freeHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  freeTitle: {
    color: '#990906',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 5,
    position: 'relative',
  },
  freeSubtitle: {
    color: '#666',
    fontSize: 13,
  },
  whatToSell: {
    marginVertical: 15,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    paddingLeft: 10,
    position: 'relative',
    borderLeftWidth: 3,
    borderLeftColor: '#990906',
  },
  animalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  animalOption: {
    flex: 1,
    backgroundColor: '#f9ca1b',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalOptionText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 13,
  },
  
  // Process Section
  processSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  processTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
    marginBottom: 15,
    position: 'relative',
  },
  processSteps: {
    flexDirection: 'row',
    paddingVertical: 5,
    marginBottom: 15,
  },
  processStep: {
    width: 180,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  stepImage: {
    height: 100,
    backgroundColor: '#39b3ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stepTitle: {
    padding: 12,
    textAlign: 'center',
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  
  // Slider Dots
  sliderDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#990906',
    width: 20,
    borderRadius: 10,
  },
  

});

export default HomeScreen;
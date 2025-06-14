import React from 'react';
import {
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import NutriDietBanner from '../../assets/Untitled (960 x 600 px) (970 x 600 px) (980 x 600 px).png';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const [currentBannerSlide, setCurrentBannerSlide] = React.useState(0);
  const [currentProcessSlide, setCurrentProcessSlide] = React.useState(0);
  
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

  // Reference to the process steps scroll view
  const processScrollViewRef = React.useRef(null);
  
  // Update process scroll position when currentProcessSlide changes
  React.useEffect(() => {
    if (processScrollViewRef.current) {
      processScrollViewRef.current.scrollTo({
        x: currentProcessSlide * 195,
        animated: true,
      });
    }
  }, [currentProcessSlide]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#ff3b3b" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Icon name="cow" size={32} color="white" style={styles.logoIcon} />
          <Text style={styles.logoText}>Home</Text>
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

      <ScrollView style={styles.scrollView}>
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
                source={NutriDietBanner}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.bannerSlide}>
              <Image 
                source={NutriDietBanner}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.bannerSlide}>
              <Image 
                source={NutriDietBanner}
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

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={styles.statsNumber}>342+</Text>
            <Text style={styles.statsLabel}>नए पशु उपलब्ध</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsNumber}>520+</Text>
            <Text style={styles.statsLabel}>ख़रीदार उपलब्ध</Text>
          </View>
        </View>

        {/* Animal Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>पशु सेवा</Text>
          <View style={styles.iconGrid}>
            <TouchableOpacity 
              style={styles.iconItem}
              onPress={() => router.push('/buy-animal')}
            >
              <Icon name="cow" size={24} color="#0047AB" style={styles.iconImage} />
              <Text style={styles.iconText}>गाय खरीदें</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconItem}
              onPress={() => router.push('/sell-animal')}
            >
              <Icon name="cow" size={24} color="#0047AB" style={styles.iconImage} />
              <Text style={styles.iconText}>गाय बेचें</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconItem}
              onPress={() => router.push('/buy-animal')}
            >
              <Icon name="cow" size={24} color="#00897B" style={styles.iconImage} />
              <Text style={styles.iconText}>भैंस खरीदें</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconItem}
              onPress={() => router.push('/sell-animal')}
            >
              <Icon name="cow" size={24} color="#00897B" style={styles.iconImage} />
              <Text style={styles.iconText}>भैंस बेचें</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Marketplace Promo Card */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>पशु आपूर्ति</Text>
          <View style={styles.marketplaceCard}>
            <View style={styles.marketplaceImage}>
              <Text style={styles.marketplaceText}>पशु दवा और आहार</Text>
            </View>
            <TouchableOpacity 
              style={styles.marketplaceButton}
              onPress={() => router.push('/marketplace')}
            >
              <Text style={styles.marketplaceButtonText}>खरीदें</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Links Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>सेवा लिंक</Text>
          <View style={styles.iconGrid}>
            <TouchableOpacity style={styles.iconItem}>
              <Icon name="format-list-bulleted" size={24} color="#0047AB" style={styles.iconImage} />
              <Text style={styles.iconText}>बाज़ार भाव</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <FontAwesome name="user-md" size={24} color="#0047AB" style={styles.iconImage} />
              <Text style={styles.iconText}>स्वास्थ्य</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <Icon name="history" size={24} color="#0047AB" style={styles.iconImage} />
              <Text style={styles.iconText}>लेनदेन</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <Icon name="star" size={24} color="#0047AB" style={styles.iconImage} />
              <Text style={styles.iconText}>सभी सेवाएँ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Free Listing Section */}
        <View style={styles.freeListing}>
          <View style={styles.freeHeader}>
            <View style={styles.freeHeaderIcon}>
              <Icon name="account" size={28} color="#ff3b3b" />
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

        {/* Process Section */}
        <View style={styles.processSection}>
          <Text style={styles.processTitle}>समझें हर प्रक्रिया, आसान तरीके से!</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Header
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
  
  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    width: width - 32, // Full width minus horizontal margins
    height: 200,
    backgroundColor: 'white', // Keep background for rounded corners
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Show full image, no side cutoff
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
  
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  statsBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3b3b',
    marginBottom: 5,
  },
  statsLabel: {
    fontSize: 12,
    color: '#444',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 70,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  marketplaceImage: {
    flex: 1,
    height: '100%',
    backgroundColor: '#ff3b3b',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  marketplaceText: {
    color: 'white',
    fontWeight: '600',
  },
  marketplaceButton: {
    height: '100%',
    width: 140,
    backgroundColor: '#ffcc00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketplaceButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
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
    color: '#ff3b3b',
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
    borderLeftColor: '#ff3b3b',
  },
  animalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  animalOption: {
    flex: 1,
    backgroundColor: '#ffcc00',
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
    backgroundColor: '#ff3b3b',
    width: 20,
    borderRadius: 10,
  },
});

export default HomeScreen;

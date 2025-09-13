import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  TextInput,
  StatusBar,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../components/SafeAreaWrapper';

const AnimalSellScreen = () => {
  const router = useRouter();
  // State for form inputs and selections
  const [selectedTab, setSelectedTab] = useState('upload'); // 'upload', 'form', 'price'
  const [animalType, setAnimalType] = useState('');
  const [breed, setBreed] = useState('');
  const [currentMilk, setCurrentMilk] = useState('');
  const [maxMilk, setMaxMilk] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [location, setLocation] = useState('Twin Tower Gym Road, Block C, A...');

  // Render the upload screen (Screenshot 1)
  const renderUploadScreen = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.uploadContainer}>
          {/* Video upload section */}
          <View style={styles.videoSection}>
            <Text style={styles.infoText}>वीडियो डालने पर पशु जल्दी बिकता है</Text>
            <View style={styles.videoIconContainer}>
              <Icon name="video" size={40} color="#9E9E9E" />
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>वीडियो चुनें</Text>
            </TouchableOpacity>
          </View>

          {/* Photo upload section */}
          <View style={styles.photoSection}>
            <View style={styles.photoRow}>
              <View style={styles.photoBox}>
                <Text style={styles.photoTitle}>धन का फोटो चुनें</Text>
                <Image 
                  source={require('../assets/cow-udder.jpeg')} 
                  style={styles.photoImage}
                  defaultSource={({ uri: 'https://via.placeholder.com/100' })}
                />
                <TouchableOpacity style={styles.photoButton}>
                  <Text style={styles.photoButtonText}>फोटो चुनें</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.photoBox}>
                <Text style={styles.photoTitle}>साइड फोटो चुनें</Text>
                <Image 
                  source={require('../assets/cow-side.jpeg')} 
                  style={styles.photoImage}
                  defaultSource={({ uri: 'https://via.placeholder.com/100' })}
                />
                <TouchableOpacity style={styles.photoButton}>
                  <Text style={styles.photoButtonText}>फोटो चुनें</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Location section */}
          <View style={styles.locationSection}>
            <View style={styles.sectionTitle}>
              <Icon name="map-marker" size={24} color="#9E9E9E" />
              <Text style={styles.sectionTitleText}>जगह</Text>
            </View>
            <Text style={styles.locationInfo}>
              खरीदारों को आपका पशु इस जगह दिखेगा
            </Text>
            <View style={styles.locationInputContainer}>
              <TextInput 
                style={styles.locationInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter location"
              />
              <TouchableOpacity style={styles.changeButton}>
                <Text style={styles.changeButtonText}>बदलें</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register button */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => setSelectedTab('form')}
          >
            <Text style={styles.registerButtonText}>दर्ज (upload) करें</Text>
          </TouchableOpacity>

          <Text style={styles.freeUploadText}>
            हर 30 दिन में 1 पशु फ्री में दर्ज कर पायंगे
          </Text>

          {/* Help section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>मदद चाहिए?</Text>
            <TouchableOpacity style={styles.chatButton}>
              <Icon name="whatsapp" size={20} color="#25D366" />
              <Text style={styles.chatButtonText}>हमसे बात करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Render the form screen (Screenshot 2)
  const renderFormScreen = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>पशु बेचें</Text>
          <TouchableOpacity style={styles.myAnimalsButton}>
            <Text style={styles.myAnimalsText}>मेरे पशु</Text>
            <Icon name="chevron-right" size={20} color="#990906" />
          </TouchableOpacity>
        </View>

        {/* Animal Type */}
        <View style={styles.formSection}>
          <View style={styles.formLabelRow}>
            <Icon name="cow" size={24} color="#9E9E9E" />
            <Text style={styles.formLabel}>कौन सा पशु</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>पशु चुने</Text>
            <Icon name="chevron-down" size={24} color="#990906" />
          </TouchableOpacity>
        </View>

        {/* Breed */}
        <View style={styles.formSection}>
          <View style={styles.formLabelRow}>
            <Icon name="cow" size={24} color="#9E9E9E" />
            <Text style={styles.formLabel}>ब्यात</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>ब्यात चुने</Text>
            <Icon name="chevron-down" size={24} color="#00897B" />
          </TouchableOpacity>
        </View>

        {/* Current Milk */}
        <View style={styles.formSection}>
          <View style={styles.formLabelRow}>
            <Icon name="cow" size={24} color="#9E9E9E" />
            <Text style={styles.formLabel}>अभी का दूध (प्रति-दिन)</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <Text style={styles.milkSubLabel}>आज का 2 समय का कुल दूध</Text>
          <View style={styles.inputWithUnit}>
            <TextInput 
              style={styles.numberInput}
              value={currentMilk}
              onChangeText={setCurrentMilk}
              placeholder="जैसे: 10"
              keyboardType="numeric"
            />
            <View style={styles.unitContainer}>
              <Text style={styles.unitText}>लीटर</Text>
            </View>
          </View>
        </View>

        {/* Max Milk */}
        <View style={styles.formSection}>
          <View style={styles.formLabelRow}>
            <Icon name="cow" size={24} color="#9E9E9E" />
            <Text style={styles.formLabel}>दूध की क्षमता (प्रति-दिन)</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <Text style={styles.milkSubLabel}>सबसे ज्यादा आज तक का कितना दूध दिया</Text>
          <View style={styles.inputWithUnit}>
            <TextInput 
              style={styles.numberInput}
              value={maxMilk}
              onChangeText={setMaxMilk}
              placeholder="जैसे: 12"
              keyboardType="numeric"
            />
            <View style={styles.unitContainer}>
              <Text style={styles.unitText}>लीटर</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => setSelectedTab('price')}
        >
          <Text style={styles.continueButtonText}>जारी रखें</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Render the price screen (Screenshot 3)
  const renderPriceScreen = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.priceContainer}>
          {/* Price input */}
          <View style={styles.formSection}>
            <View style={styles.formLabelRow}>
              <Icon name="currency-inr" size={24} color="#9E9E9E" />
              <Text style={styles.formLabel}>रेट (₹)</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <Text style={styles.priceSubLabel}>सही रेट डालें, उससे ज्यादा ग्राहक कॉल करते हैं</Text>
            <View style={styles.inputWithUnit}>
              <TextInput 
                style={styles.numberInput}
                value={price}
                onChangeText={setPrice}
                placeholder="जैसे: ₹40,000"
                keyboardType="numeric"
              />
              <View style={styles.unitContainer}>
                <Text style={styles.unitText}>रुपए</Text>
              </View>
            </View>
          </View>

          {/* More info button */}
          <TouchableOpacity style={styles.moreInfoButton}>
            <Text style={styles.moreInfoText}>और जानकारी डालें</Text>
            <Icon name="chevron-down" size={24} color="#990906" />
          </TouchableOpacity>

          {/* Negotiable toggle */}
          <View style={styles.negotiableSection}>
            <View style={styles.negotiableContent}>
              <Icon name="handshake" size={24} color="#990906" />
              <View style={styles.negotiableTextContainer}>
                <Text style={styles.negotiableTitle}>मोल भाव</Text>
                <Text style={styles.negotiableSubtitle}>पशु के रेट पे खरीदार से मोल भाव</Text>
                <Text style={styles.negotiableDesc}>मोल भाव करने से ज्यादा खरीदार के कॉल आते हैं</Text>
              </View>
              <Switch
                value={negotiable}
                onValueChange={setNegotiable}
                trackColor={{ false: '#767577', true: '#990906' }}
                thumbColor={negotiable ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Photo upload reminder */}
          <View style={styles.photoUploadSection}>
            <View style={styles.formLabelRow}>
              <Icon name="camera" size={24} color="#9E9E9E" />
              <Text style={styles.formLabel}>फोटो डालें (कम से कम एक)</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <Text style={styles.photoUploadInfo}>अच्छी फोटो डालने पर जल्दी बिकती है</Text>
          </View>

          {/* Video upload section */}
          <View style={styles.videoSection}>
            <Text style={styles.infoText}>वीडियो डालने पर पशु जल्दी बिकता है</Text>
            <View style={styles.videoIconContainer}>
              <Icon name="video" size={40} color="#9E9E9E" />
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>वीडियो चुनें</Text>
            </TouchableOpacity>
          </View>

          {/* Permission button */}
          <TouchableOpacity style={styles.permissionButton}>
            <Icon name="cow" size={24} color="#fff" />
            <Text style={styles.permissionButtonText}>फोटो डालने के लिए अनुमति दें</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaWrapper
      backgroundColor="#ffffff"
      topBackgroundColor="#E8E8E8"     // Tinted gray
      bottomBackgroundColor="#000000"  // Black
    >
      
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-left" size={24} color="#990906" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Icon name="cow" size={24} color="#990906" />
            <Text style={styles.headerTitle}>पशुपालन मंच</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.walletButton} onPress={() => router.push('/wallet' as any)}>
              <Icon name="circle" size={14} color="#f9ca1b" />
              <Icon name="wallet" size={24} color="#D32F2F" />
              <Text style={styles.headerButtonText}>वॉलेट</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
              <Icon name="account" size={24} color="#D32F2F" />
              <Text style={styles.headerButtonText}>प्रोफाइल</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Main content based on selected tab */}
        {selectedTab === 'upload' && renderUploadScreen()}
        {selectedTab === 'form' && renderFormScreen()}
        {selectedTab === 'price' && renderPriceScreen()}
      </SafeAreaView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#990906',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  walletButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  profileButton: {
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 12,
    color: '#757575',
  },
  scrollView: {
    flex: 1,
  },
  uploadContainer: {
    padding: 16,
  },
  videoSection: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    textAlign: 'center',
    color: '#757575',
    marginBottom: 16,
  },
  videoIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#990906',
    fontWeight: 'bold',
    fontSize: 16,
  },
  photoSection: {
    marginBottom: 16,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  photoTitle: {
    textAlign: 'center',
    color: '#757575',
    marginBottom: 8,
  },
  photoImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  photoButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#990906',
    fontWeight: 'bold',
  },
  locationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationInfo: {
    color: '#757575',
    marginBottom: 8,
  },
  locationInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  changeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  freeUploadText: {
    textAlign: 'center',
    color: '#757575',
    marginBottom: 16,
  },
  helpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    color: '#757575',
    marginRight: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#25D366',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chatButtonText: {
    color: '#25D366',
    marginLeft: 4,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  myAnimalsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myAnimalsText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    marginRight: 4,
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  formLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  requiredStar: {
    color: '#D32F2F',
    fontSize: 16,
    marginLeft: 4,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    color: '#9E9E9E',
  },
  milkSubLabel: {
    color: '#757575',
    marginBottom: 8,
  },
  inputWithUnit: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  numberInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unitContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  unitText: {
    color: '#757575',
  },
  continueButton: {
    backgroundColor: '#D32F2F',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  priceContainer: {
    padding: 16,
  },
  priceSubLabel: {
    color: '#757575',
    marginBottom: 8,
  },
  moreInfoButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  moreInfoText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  negotiableSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  negotiableContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  negotiableTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  negotiableTitle: {
    fontWeight: 'bold',
  },
  negotiableSubtitle: {
    fontSize: 14,
    color: '#333',
  },
  negotiableDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  photoUploadSection: {
    marginBottom: 16,
  },
  photoUploadInfo: {
    color: '#757575',
    marginBottom: 8,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#757575',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: 'center',
    marginVertical: 8,
  },
  permissionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default AnimalSellScreen;
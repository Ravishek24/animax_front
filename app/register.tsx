import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Modal,
  StatusBar,
  I18nManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useAuth } from '../contexts/AuthContext';
import { googlePlacesService } from '../services/googlePlacesService';
import { apiService } from '../services';

// Force LTR layout
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

const RegisterScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const params = useLocalSearchParams();
  const { sessionUuid, phoneNumber } = params;
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [houseAddress, setHouseAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState<string | null>(null);
  const [loadingGooglePlaces, setLoadingGooglePlaces] = useState(true);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch Google Places API key when component mounts
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setLoadingGooglePlaces(true);
        const apiKey = await googlePlacesService.getApiKey();
        setGoogleApiKey(apiKey);
      } catch (error) {
        console.error('❌ Failed to fetch Google Places API key:', error);
      } finally {
        setLoadingGooglePlaces(false);
      }
    };

    fetchApiKey();
  }, []);

  // Search for address suggestions
  const searchAddresses = async (query: string) => {
    if (query.length < 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const result = await googlePlacesService.searchPlaces(query);
      if (result.success && result.predictions) {
        setAddressSuggestions(result.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Address search error:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle address selection
  const selectAddress = async (prediction: any) => {
    setAddress(prediction.description);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    
    // Get place details for address components
    try {
      const details = await googlePlacesService.getPlaceDetails(prediction.place_id);
      if (details.success && details.details) {
        const placeDetails = details.details;
        
        // Extract address components
        if (placeDetails.address_components && Array.isArray(placeDetails.address_components)) {
          // Extract city
          const cityComponent = placeDetails.address_components.find(
            component => component.types && component.types.includes('locality') || 
                         component.types && component.types.includes('administrative_area_level_2')
          );
          if (cityComponent) {
            setCity(cityComponent.long_name);
          }
          
          // Extract state
          const stateComponent = placeDetails.address_components.find(
            component => component.types && component.types.includes('administrative_area_level_1')
          );
          if (stateComponent) {
            setState(stateComponent.long_name);
          }
          
          // Extract pincode
          const pincodeComponent = placeDetails.address_components.find(
            component => component.types && component.types.includes('postal_code')
          );
          if (pincodeComponent) {
            setPincode(pincodeComponent.long_name);
          }
          
          // Extract coordinates
          if (placeDetails.geometry && placeDetails.geometry.location) {
            setLatitude(placeDetails.geometry.location.lat);
            setLongitude(placeDetails.geometry.location.lng);
          }
        }
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleRegister = async () => {
    setError('');
    
    if (!fullName.trim()) {
      setError('कृपया अपना पूरा नाम दर्ज करें');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('नाम कम से कम 2 अक्षर का होना चाहिए');
      return;
    }

    if (!houseAddress.trim()) {
      setError('कृपया घर नंबर दर्ज करें');
      return;
    }

    if (!address.trim()) {
      setError('कृपया अपना लोकेशन/इलाका दर्ज करें');
      return;
    }

    if (!city.trim()) {
      setError('कृपया शहर दर्ज करें');
      return;
    }

    if (!state.trim()) {
      setError('कृपया राज्य दर्ज करें');
      return;
    }

    if (!pincode.trim()) {
      setError('कृपया पिन कोड दर्ज करें');
      return;
    }

    if (pincode.trim().length !== 6) {
      setError('पिन कोड 6 अंक का होना चाहिए');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        sessionUuid: typeof sessionUuid === 'string' ? sessionUuid : Array.isArray(sessionUuid) ? sessionUuid[0] : '',
        fullName: fullName.trim(),
        address: `${houseAddress.trim()}, ${address.trim()}`,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude: latitude || 0,
        longitude: longitude || 0
      };

      const data = await apiService.register(userData);
      
      if (data.success) {
        // Store token and user data using AuthContext
        await login(data.user, data.token || '');
        Alert.alert('सफल', 'रजिस्ट्रेशन सफल! आपका अकाउंट बन गया है', [
          { 
            text: 'ठीक है', 
            onPress: () => router.replace('/(tabs)') 
          }
        ]);
      } else {
        setError(data.message || 'रजिस्ट्रेशन में समस्या हुई');
      }
    } catch (error) {
      console.error('Register Error:', error);
      setError('नेटवर्क समस्या। कृपया दोबारा कोशिश करें');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
          <Icon name="account-plus" size={64} color="#990906" style={{ marginBottom: 12 }} />
          <Text style={styles.title}>प्रोफाइल पूरा करें</Text>
          <Text style={styles.subtitle}>
            अपना पूरा नाम और पता दर्ज करें
          </Text>
          <Text style={styles.phoneText}>
            मोबाइल: {phoneNumber}
          </Text>
        </View>

        <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
          <View style={styles.form}>
            <Text style={styles.label}>पूरा नाम *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="अपना पूरा नाम दर्ज करें"
            placeholderTextColor="#bbb"
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={styles.label}>घर नंबर *</Text>
          <TextInput
            style={styles.input}
            value={houseAddress}
            onChangeText={setHouseAddress}
            placeholder="घर नंबर दर्ज करें"
            placeholderTextColor="#bbb"
            multiline={false}
            textAlignVertical="center"
            editable={true}
          />

          <Text style={styles.label}>पता *</Text>
          {loadingGooglePlaces ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#990906" style={{ marginRight: 8 }} />
              <Text style={styles.loadingText}>Google Places लोड हो रहा है...</Text>
            </View>
          ) : googleApiKey && googleApiKey !== 'BACKEND_SEARCH' ? (
            <View style={styles.addressContainer}>
              <TextInput
                style={[styles.input, styles.addressInput]}
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  searchAddresses(text);
                }}
                placeholder="अपना पूरा पता दर्ज करें"
                placeholderTextColor="#bbb"
                multiline={false}
                textAlign="left"
                textAlignVertical="center"
                editable={true}
                autoCorrect={false}
                selectTextOnFocus={false}
              />
              {loadingSuggestions && (
                <Text style={styles.loadingText}>सुझाव खोज रहे हैं...</Text>
              )}
              {showSuggestions && addressSuggestions.length > 0 && (
                <ScrollView style={styles.suggestionsContainer} nestedScrollEnabled={true}>
                  {addressSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectAddress(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : googleApiKey === 'BACKEND_SEARCH' ? (
            <View style={styles.addressContainer}>
              <TextInput
                style={[styles.input, styles.addressInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="अपना पूरा पता दर्ज करें"
                placeholderTextColor="#bbb"
                multiline={false}
                textAlign="left"
                textAlignVertical="center"
                editable={true}
                autoCorrect={false}
                selectTextOnFocus={false}
              />
              <Text style={styles.infoText}>
                💡 पता टाइप करें और शहर, राज्य, पिन कोड स्वतः भर जाएगा
              </Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.addressInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="अपना पूरा पता दर्ज करें"
              placeholderTextColor="#bbb"
              multiline={false}
              textAlign="left"
              textAlignVertical="center"
              editable={true}
              autoCorrect={false}
              selectTextOnFocus={false}
            />
          )}

          <View style={styles.addressDetails}>
            <Text style={styles.label}>शहर *</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="शहर"
              placeholderTextColor="#bbb"
              editable={true}
            />

            <Text style={styles.label}>राज्य *</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="राज्य"
              placeholderTextColor="#bbb"
              editable={true}
            />

            <Text style={styles.label}>पिन कोड *</Text>
            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={setPincode}
              placeholder="पिन कोड"
              placeholderTextColor="#bbb"
              editable={true}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>अकाउंट बनाएं</Text>
            )}
          </TouchableOpacity>

            <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
              <Text style={styles.backText}>वापस लॉगिन पर जाएं</Text>
            </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <Modal
        visible={!!error}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setError('')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorIconContainer}>
              <Icon name="alert-circle" size={48} color="#ff4444" />
            </View>
            <Text style={styles.errorModalTitle}>Error</Text>
            <Text style={styles.errorModalText}>{error}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setError('')}
            >
              <Text style={styles.errorModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#990906',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneText: {
    fontSize: 14,
    color: '#888',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    fontSize: 18,
    color: '#222',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    minHeight: 50,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  addressInput: {
    minHeight: 50,
    height: 50,
    width: '100%',
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'center',
    direction: 'ltr',
  },
  addressContainer: {
    width: '100%',
    position: 'relative',
    zIndex: 100,
    marginBottom: 12,
  },
  addressDetails: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#990906',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
  },
  backText: {
    color: '#990906',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 9999,
  },
  suggestionItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#222',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 12,
  },
  errorModalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorModalButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  errorModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RegisterScreen;
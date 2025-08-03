import React, { useState, useRef } from 'react';
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
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services';

const RegisterScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const params = useLocalSearchParams();
  const { sessionUuid, phoneNumber } = params;
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addressRef = useRef<any>(null);

  const handleAddressSelect = (data: any, details: any = null) => {
    if (details) {
      setAddress(data.description);
      
      // Extract address components
      const addressComponents = details.address_components;
      let cityName = '';
      let stateName = '';
      let pincodeValue = '';

      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          cityName = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          stateName = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          pincodeValue = component.long_name;
        }
      }

      setCity(cityName);
      setState(stateName);
      setPincode(pincodeValue);
      setLatitude(details.geometry.location.lat);
      setLongitude(details.geometry.location.lng);
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

    if (!address.trim()) {
      setError('कृपया अपना पता दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        sessionUuid: typeof sessionUuid === 'string' ? sessionUuid : Array.isArray(sessionUuid) ? sessionUuid[0] : '',
        fullName: fullName.trim(),
        address: address.trim(),
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Icon name="account-plus" size={64} color="#ff3b3b" style={{ marginBottom: 12 }} />
          <Text style={styles.title}>प्रोफाइल पूरा करें</Text>
          <Text style={styles.subtitle}>
            अपना पूरा नाम और पता दर्ज करें
          </Text>
          <Text style={styles.phoneText}>
            मोबाइल: {phoneNumber}
          </Text>
        </View>

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

          <Text style={styles.label}>पता *</Text>
          <GooglePlacesAutocomplete
            ref={addressRef}
            placeholder="अपना पता खोजें और चुनें"
            fetchDetails={true}
            onPress={handleAddressSelect}
            query={{
              key: 'YOUR_GOOGLE_PLACES_API_KEY', // Replace with your API key
              language: 'hi', // Hindi
              components: 'country:in', // India only
            }}
            styles={{
              container: styles.googlePlacesContainer,
              textInput: styles.googlePlacesInput,
              listView: styles.googlePlacesListView,
            }}
            enablePoweredByContainer={false}
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={300}
          />

          <View style={styles.addressDetails}>
            <Text style={styles.label}>शहर</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="शहर"
              placeholderTextColor="#bbb"
              editable={false}
            />

            <Text style={styles.label}>राज्य</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="राज्य"
              placeholderTextColor="#bbb"
              editable={false}
            />

            <Text style={styles.label}>पिन कोड</Text>
            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={setPincode}
              placeholder="पिन कोड"
              placeholderTextColor="#bbb"
              editable={false}
              keyboardType="numeric"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff3b3b',
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
  },
  googlePlacesContainer: {
    width: '100%',
    marginBottom: 12,
  },
  googlePlacesInput: {
    fontSize: 18,
    color: '#222',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  googlePlacesListView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginTop: 4,
  },
  addressDetails: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ff3b3b',
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
    color: '#ff3b3b',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});

export default RegisterScreen;
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services';

interface ProfileFormData {
  full_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null
  });

  const addressRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        latitude: user.latitude || null,
        longitude: user.longitude || null
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressSelect = (data: any, details: any = null) => {
    if (details) {
      setFormData(prev => ({
        ...prev,
        address: data.description
      }));
      
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

      setFormData(prev => ({
        ...prev,
        city: cityName,
        state: stateName,
        pincode: pincodeValue,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('त्रुटि', 'कृपया अपना नाम दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.updateProfile(formData);
      
      if (response.success) {
        Alert.alert(
          'सफलता',
          'प्रोफाइल सफलतापूर्वक अपडेट हो गई है',
          [
            {
              text: 'ठीक है',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('त्रुटि', response.message || 'प्रोफाइल अपडेट करने में समस्या आई');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('त्रुटि', 'प्रोफाइल अपडेट करने में समस्या आई');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'रद्द करें',
      'क्या आप वाकई बिना सहेजे वापस जाना चाहते हैं?',
      [
        {
          text: 'नहीं',
          style: 'cancel'
        },
        {
          text: 'हाँ',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>प्रोफाइल संपादित करें</Text>
          
          <View style={styles.headerRightContainer}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>सहेजें</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>व्यक्तिगत जानकारी</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>पूरा नाम *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.full_name}
                onChangeText={(value) => handleInputChange('full_name', value)}
                placeholder="अपना पूरा नाम दर्ज करें"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>पता</Text>
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
                textInputProps={{
                  value: formData.address,
                  onChangeText: (value) => handleInputChange('address', value)
                }}
              />
            </View>

            <View style={styles.row}>
                             <View style={[styles.inputGroup, styles.halfWidth]}>
                 <Text style={styles.inputLabel}>शहर</Text>
                 <TextInput
                   style={styles.textInput}
                   value={formData.city}
                   placeholder="शहर (स्वचालित भरा जाएगा)"
                   placeholderTextColor="#999"
                   editable={false}
                 />
               </View>

               <View style={[styles.inputGroup, styles.halfWidth]}>
                 <Text style={styles.inputLabel}>राज्य</Text>
                 <TextInput
                   style={styles.textInput}
                   value={formData.state}
                   placeholder="राज्य (स्वचालित भरा जाएगा)"
                   placeholderTextColor="#999"
                   editable={false}
                 />
               </View>
            </View>

                         <View style={styles.inputGroup}>
               <Text style={styles.inputLabel}>पिन कोड</Text>
               <TextInput
                 style={styles.textInput}
                 value={formData.pincode}
                 placeholder="पिन कोड (स्वचालित भरा जाएगा)"
                 placeholderTextColor="#999"
                 editable={false}
                 keyboardType="numeric"
                 maxLength={6}
               />
             </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>संपर्क जानकारी</Text>
            
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#666" />
              <Text style={styles.infoText}>
                {user.phone_number?.replace('+91', '') || 'N/A'}
              </Text>
              <Text style={styles.infoNote}>(बदला नहीं जा सकता)</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>रद्द करें</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButtonLarge} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>प्रोफाइल अपडेट करें</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 80,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  infoNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonLarge: {
    flex: 2,
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  googlePlacesContainer: {
    width: '100%',
    marginBottom: 12,
  },
  googlePlacesInput: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  googlePlacesListView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default EditProfileScreen;

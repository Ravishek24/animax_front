import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.sociamosaic.com';

const RegisterScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { sessionUuid, phoneNumber } = params;

  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionUuid,
          fullName: fullName.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token and user data
        // You can use AsyncStorage or Redux here
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
    <SafeAreaWrapper backgroundColor="#fff" topBackgroundColor="#E8E8E8" bottomBackgroundColor="#000">
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.header}>
          <Icon name="account-plus" size={64} color="#ff3b3b" style={{ marginBottom: 12 }} />
          <Text style={styles.title}>प्रोफाइल पूरा करें</Text>
          <Text style={styles.subtitle}>
            अपना पूरा नाम दर्ज करें और अपना अकाउंट बनाएं
          </Text>
          <Text style={styles.phoneText}>
            मोबाइल: {phoneNumber}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>पूरा नाम</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="अपना पूरा नाम दर्ज करें"
            placeholderTextColor="#bbb"
            autoCapitalize="words"
            autoCorrect={false}
          />

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
      </SafeAreaView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
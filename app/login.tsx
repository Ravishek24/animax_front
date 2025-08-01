import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.sociamosaic.com';

const LoginScreen = () => {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionUuid, setSessionUuid] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    setError('');
    if (!/^\d{10}$/.test(phone)) {
      setError('कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: `+91${phone}` 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionUuid(data.sessionUuid);
        setOtpSent(true);
        Alert.alert('सफल', 'OTP आपके मोबाइल नंबर पर भेज दिया गया है');
      } else {
        setError(data.message || 'OTP भेजने में समस्या हुई');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      setError('नेटवर्क समस्या। कृपया दोबारा कोशिश करें');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('कृपया 6 अंकों का OTP दर्ज करें');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionUuid,
          otp 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.userExists) {
          // User exists - login successful
          // Store token and user data
          // You can use AsyncStorage or Redux here
          Alert.alert('सफल', 'लॉगिन सफल!', [
            { text: 'ठीक है', onPress: () => router.replace('/(tabs)') }
          ]);
        } else {
          // User doesn't exist - show registration form
          router.push({
            pathname: '/register',
            params: { 
              sessionUuid: data.sessionUuid,
              phoneNumber: data.phoneNumber 
            }
          });
        }
      } else {
        setError(data.message || 'OTP सत्यापन में समस्या हुई');
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      setError('नेटवर्क समस्या। कृपया दोबारा कोशिश करें');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
  };

  return (
    <SafeAreaWrapper backgroundColor="#fff" topBackgroundColor="#E8E8E8" bottomBackgroundColor="#000">
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.header}>
          <Icon name="account-circle" size={64} color="#ff3b3b" style={{ marginBottom: 12 }} />
          <Text style={styles.title}>{otpSent ? 'OTP सत्यापन' : 'लॉगिन करें'}</Text>
          <Text style={styles.subtitle}>
            {otpSent 
              ? 'अपने मोबाइल पर भेजे गए OTP को दर्ज करें'
              : 'मोबाइल नंबर दर्ज करें और OTP प्राप्त करें'
            }
          </Text>
        </View>

        <View style={styles.form}>
          {!otpSent ? (
            <>
              <Text style={styles.label}>मोबाइल नंबर</Text>
              <View style={styles.inputRow}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor="#bbb"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>OTP दर्ज करें</Text>
              <TextInput
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                placeholder="123456"
                placeholderTextColor="#bbb"
              />
              <TouchableOpacity onPress={handleResendOTP} style={styles.resendButton}>
                <Text style={styles.resendText}>OTP दोबारा भेजें</Text>
              </TouchableOpacity>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={otpSent ? handleVerifyOTP : handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {otpSent ? 'सत्यापित करें' : 'OTP भेजें'}
              </Text>
            )}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  countryCode: {
    fontSize: 18,
    color: '#888',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#222',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  otpInput: {
    width: '100%',
    fontSize: 24,
    color: '#222',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 8,
  },
  resendButton: {
    marginBottom: 12,
  },
  resendText: {
    color: '#ff3b3b',
    fontSize: 14,
    textDecorationLine: 'underline',
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
  error: {
    color: '#d32f2f',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});

export default LoginScreen; 
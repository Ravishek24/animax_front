import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import payuService from '../services/payuService';

const PaymentScreen = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const paymentParams = {
                transactionId: "TXN_" + Date.now(),
                amount: amount,
                productInfo: "Test Product",
                firstName: "Test User",
                email: "test@example.com",
                phone: "1234567890",
                ios_surl: "https://cbjs.payu.in/sdk/success",
                ios_furl: "https://cbjs.payu.in/sdk/failure",
                android_surl: "https://cbjs.payu.in/sdk/success",
                android_furl: "https://cbjs.payu.in/sdk/failure",
            };

            const result = await payuService.initiatePayment(paymentParams);
            
            if (result.success) {
                // Verify payment
                const verificationResult = await payuService.verifyPayment(result.data.txnid);
                Alert.alert('Success', 'Payment successful!');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Make a Payment</Text>
            
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    placeholderTextColor="#999"
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handlePayment}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Pay Now</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#00A4BD',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PaymentScreen; 
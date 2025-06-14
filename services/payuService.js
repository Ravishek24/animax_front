import PayUBizSdk from 'payu-non-seam-less-react';
import axios from 'axios';
import { NativeEventEmitter } from 'react-native';

class PayUService {
    constructor() {
        this.apiUrl = process.env.PAYU_API_URL;
        this.merchantKey = process.env.PAYU_MERCHANT_KEY;
    }

    // Generate hash for payment
    async generateHash(hashData) {
        try {
            const response = await axios.post(`${this.apiUrl}/payu/generate-hash`, hashData);
            return response.data;
        } catch (error) {
            throw new Error(`Hash generation failed: ${error.message}`);
        }
    }

    // Initiate payment
    async initiatePayment(paymentParams) {
        try {
            const paymentObject = {
                payUPaymentParams: {
                    ...paymentParams,
                    key: this.merchantKey,
                    environment: process.env.PAYU_ENVIRONMENT === 'LIVE' ? '0' : '1',
                },
                payUCheckoutProConfig: {
                    // Optional config
                    showExitConfirmationOnCheckoutScreen: true,
                    showExitConfirmationOnPaymentScreen: true,
                    showCbToolbar: true,
                    toolbarColor: '#00A4BD',
                    toolbarTitle: 'PayU Checkout Pro',
                    toolbarTitleColor: '#FFFFFF',
                    enableLogging: true,
                }
            };
            
            return new Promise((resolve, reject) => {
                const eventEmitter = new NativeEventEmitter(PayUBizSdk);
                
                const paymentSuccess = eventEmitter.addListener('onPaymentSuccess', (e) => {
                    paymentSuccess.remove();
                    paymentFailure.remove();
                    resolve({ success: true, data: e });
                });
                
                const paymentFailure = eventEmitter.addListener('onPaymentFailure', (e) => {
                    paymentSuccess.remove();
                    paymentFailure.remove();
                    reject({ success: false, data: e });
                });

                PayUBizSdk.openCheckoutScreen(paymentObject);
            });
        } catch (error) {
            throw new Error(`Payment initiation failed: ${error.message}`);
        }
    }

    // Verify payment
    async verifyPayment(txnId) {
        try {
            const response = await axios.post(`${this.apiUrl}/payu/verify-payment`, { txnId });
            return response.data;
        } catch (error) {
            throw new Error(`Payment verification failed: ${error.message}`);
        }
    }

    // Get transaction details
    async getTransactionDetails(startDate, endDate) {
        try {
            const response = await axios.get(`${this.apiUrl}/payu/transaction-details`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get transaction details: ${error.message}`);
        }
    }

    // Validate VPA
    async validateVPA(vpa) {
        try {
            const response = await axios.post(`${this.apiUrl}/payu/validate-vpa`, { vpa });
            return response.data;
        } catch (error) {
            throw new Error(`VPA validation failed: ${error.message}`);
        }
    }

    // Get EMI details
    async getEmiDetails(amount) {
        try {
            const response = await axios.get(`${this.apiUrl}/payu/emi-details/${amount}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get EMI details: ${error.message}`);
        }
    }
}

export default new PayUService(); 
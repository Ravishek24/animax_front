import { API_CONFIG, API_ENDPOINTS } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions
interface UserData {
  sessionUuid: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  sessionUuid?: string;
  userExists?: boolean;
  user?: any;
  token?: string;
  phoneNumber?: string;
}

interface RequestParams {
  [key: string]: string | number | boolean | undefined;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Get auth token from storage
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Create headers with auth token
  async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    return {
      ...API_CONFIG.HEADERS,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getHeaders();

      const config: RequestInit = {
        method: 'GET',
        headers,
        ...options,
      };

      console.log(`🌐 API Request: ${config.method} ${url}`);
      
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Expected JSON response but got ${contentType} for ${endpoint}`);
        // Return empty data for HTML responses instead of throwing
        return {
          success: true,
          data: [],
          message: 'No data available'
        } as T;
      }
      
      const data: ApiResponse<T> = await response.json();

      console.log(`📥 API Response: ${response.status}`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle SupplementImage association error gracefully
      if (data.message && data.message.includes('SupplementImage is not associated to Supplement')) {
        console.warn('SupplementImage association error detected, returning empty data array');
        return {
          success: true,
          data: [],
          message: 'No supplement data available'
        } as T;
      }

      return data as T;
    } catch (error) {
      console.error('❌ API Error:', error);
      // Provide more context about the error
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error('API request failed: Unknown error');
      }
    }
  }

  // GET request
  async get<T = any>(endpoint: string, params: RequestParams = {}): Promise<T> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(url);
  }

  // POST request
  async post<T = any>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T = any>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth specific methods
  async sendOTP(phoneNumber: string): Promise<ApiResponse> {
    return this.post<ApiResponse>(API_ENDPOINTS.AUTH.SEND_OTP, { phoneNumber });
  }

  async verifyOTP(sessionUuid: string, otp: string): Promise<ApiResponse> {
    return this.post<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, { sessionUuid, otp });
  }

  async register(userData: UserData): Promise<ApiResponse> {
    return this.post<ApiResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  async getProfile(): Promise<ApiResponse> {
    return this.get<ApiResponse>(API_ENDPOINTS.AUTH.PROFILE);
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.put<ApiResponse>(API_ENDPOINTS.AUTH.PROFILE, profileData);
  }

  // Animals specific methods
  async getAnimals(params: RequestParams = {}): Promise<ApiResponse> {
    return this.get<ApiResponse>(API_ENDPOINTS.ANIMALS.LIST, params);
  }

  async getAnimalsByLocation(latitude: number, longitude: number, radius: number = 100): Promise<ApiResponse> {
    return this.get<ApiResponse>(API_ENDPOINTS.ANIMALS.LIST, {
      latitude,
      longitude,
      radius
    });
  }

  async getAnimalDetails(id: string): Promise<ApiResponse> {
    return this.get<ApiResponse>(API_ENDPOINTS.ANIMALS.DETAILS.replace(':id', id));
  }

  // Orders specific methods
  async getOrders(): Promise<ApiResponse> {
    return this.get<ApiResponse>(API_ENDPOINTS.ORDERS.LIST);
  }

  async createOrder(orderData: any): Promise<ApiResponse> {
    return this.post<ApiResponse>(API_ENDPOINTS.ORDERS.CREATE, orderData);
  }

  // Supplements specific methods
  async getSupplements(params: RequestParams = {}): Promise<ApiResponse> {
    return this.get<ApiResponse>(API_ENDPOINTS.SUPPLEMENTS.LIST, params);
  }

  async getSupplementDetails(id: string): Promise<ApiResponse> {
    return this.get<ApiResponse>(API_ENDPOINTS.SUPPLEMENTS.DETAILS.replace(':id', id));
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService; 
declare module '../services/apiService' {
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
  }

  interface RequestParams {
    [key: string]: string | number | boolean | undefined;
  }

  class ApiService {
    sendOTP(phoneNumber: string): Promise<ApiResponse>;
    verifyOTP(sessionUuid: string, otp: string): Promise<ApiResponse>;
    register(userData: UserData): Promise<ApiResponse>;
    getProfile(): Promise<ApiResponse>;
    getAnimals(params?: RequestParams): Promise<ApiResponse>;
    getAnimalDetails(id: string): Promise<ApiResponse>;
    getOrders(): Promise<ApiResponse>;
    createOrder(orderData: any): Promise<ApiResponse>;
    getSupplements(params?: RequestParams): Promise<ApiResponse>;
    getSupplementDetails(id: string): Promise<ApiResponse>;
  }

  const apiService: ApiService;
  export default apiService;
} 
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { apiService } from '../services';

interface User {
  user_id: number;
  full_name: string;
  phone_number: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  registration_date?: string;
  role?: string;
  stats?: {
    animalsListed: number;
    callsMade: number;
    monthsConnected: number;
    coins: number;
    completionPercent: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, userToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        // Verify token with backend
        try {
          const data = await apiService.getProfile();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            throw new Error('Invalid profile data');
          }
        } catch (error) {
          // Token is invalid, clear storage
          await AsyncStorage.multiRemove(['userToken', 'userData']);
          setUser(null);
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear storage on error
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (userData: User, userToken: string) => {
    try {
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setToken(userToken);
    } catch (error) {
      console.error('Login storage error:', error);
      Alert.alert('Error', 'Failed to save login information');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
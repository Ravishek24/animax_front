// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.sociamosaic.com',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  ANIMALS: {
    LIST: '/api/animals',
    DETAILS: '/api/animals/:id',
    CREATE: '/api/animals',
    UPDATE: '/api/animals/:id',
    DELETE: '/api/animals/:id',
  },
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    DETAILS: '/api/orders/:id',
  },
  SUPPLEMENTS: {
    LIST: '/api/supplements',
    DETAILS: '/api/supplements/:id',
  }
  ,
  VIDEOS: {
    LIST: '/api/videos'
  }
}; 
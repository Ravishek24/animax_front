# Authentication System Implementation

## Overview
This document describes the authentication system implemented in the Animal Marketplace app using the backend API with OTP-based authentication.

## Features

### 🔐 Authentication Flow
1. **Opening Screen**: Beautiful splash screen with app branding
2. **OTP-based Login**: Phone number verification with OTP
3. **Automatic Registration**: New users are automatically registered after OTP verification
4. **Token-based Authentication**: JWT tokens for secure API access
5. **Persistent Login**: Users stay logged in across app sessions
6. **Protected Routes**: Main app screens are protected from unauthorized access
7. **Logout Functionality**: Secure logout with confirmation

### 🎨 UI/UX Features
- **Animated Opening Screen**: Smooth animations and loading indicators
- **Responsive Design**: Works on all screen sizes
- **Hindi Language Support**: Full Hindi text throughout the app
- **Consistent Styling**: Matches the app's red (#ff3b3b) theme
- **Safe Area Handling**: Proper safe area colors (gray top, black bottom)

## File Structure

```
frontend/
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── components/
│   └── ProtectedRoute.tsx       # Route protection component
├── app/
│   ├── _layout.tsx              # Root layout with AuthProvider
│   ├── opening.tsx              # Opening/splash screen
│   ├── login.tsx                # Login screen with OTP
│   ├── register.tsx             # Registration screen
│   ├── profile.tsx              # User profile with logout
│   └── (tabs)/
│       └── _layout.tsx          # Protected tab navigation
```

## API Integration

### Backend Endpoints Used
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and check user existence
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get user profile (protected)

### Authentication Flow
```
1. User opens app → Opening screen
2. Check stored token → If valid, go to main app
3. If no token → Login screen
4. Enter phone → Send OTP
5. Enter OTP → Verify
6. If user exists → Login and go to main app
7. If new user → Registration screen
8. Complete registration → Login and go to main app
```

## Key Components

### AuthContext
- Manages authentication state globally
- Handles token storage with AsyncStorage
- Provides login/logout functions
- Validates tokens with backend

### ProtectedRoute
- Wraps main app screens
- Checks authentication status
- Redirects to opening screen if not authenticated
- Shows loading indicator during auth check

### Opening Screen
- Beautiful animated splash screen
- Shows app branding and welcome message
- Handles initial navigation based on auth status
- 3-second animation duration

## Environment Configuration

### Required Environment Variables
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

### Default Configuration
- Backend URL: `https://api.sociamosaic.com`
- Token expiry: 30 days (handled by backend)
- OTP expiry: 10 minutes (handled by backend)

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the frontend directory:
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

### 3. Start the App
```bash
npm start
```

## Usage

### For Users
1. **First Time**: App shows opening screen → Login → Enter phone → OTP → Register → Main app
2. **Returning Users**: App shows opening screen → Automatically goes to main app
3. **Logout**: Profile screen → Logout button → Confirmation → Back to opening screen

### For Developers
1. **Adding Protected Screens**: Wrap with `<ProtectedRoute>`
2. **Accessing User Data**: Use `useAuth()` hook
3. **Making API Calls**: Include token in Authorization header
4. **Handling Auth Errors**: Check for 401 responses and redirect to login

## Security Features

### Token Management
- Tokens stored securely in AsyncStorage
- Automatic token validation on app start
- Token refresh handled by backend
- Secure logout clears all stored data

### API Security
- All protected endpoints require valid JWT token
- Token included in Authorization header
- Automatic token validation with backend
- Graceful handling of expired tokens

### Input Validation
- Phone number format validation (10 digits)
- OTP format validation (6 digits)
- Name validation (minimum 2 characters)
- Server-side validation for all inputs

## Error Handling

### Network Errors
- Graceful handling of network failures
- User-friendly error messages in Hindi
- Retry mechanisms for failed requests
- Offline state handling

### Authentication Errors
- Invalid OTP handling
- Expired session handling
- Invalid token handling
- Automatic logout on auth failures

## Styling & Theming

### Color Scheme
- Primary: `#ff3b3b` (Red)
- Secondary: `#ffcc00` (Yellow)
- Background: `#ffffff` (White)
- Text: `#333333` (Dark Gray)
- Safe Areas: `#E8E8E8` (Top), `#000000` (Bottom)

### Typography
- Hindi text support throughout
- Consistent font sizes and weights
- Proper text alignment and spacing

## Testing

### Manual Testing Checklist
- [ ] App opens to opening screen
- [ ] New user can register successfully
- [ ] Existing user can login successfully
- [ ] User stays logged in after app restart
- [ ] Logout works correctly
- [ ] Protected routes are inaccessible without auth
- [ ] Error messages display correctly
- [ ] Network errors are handled gracefully

### API Testing
- [ ] OTP sending works
- [ ] OTP verification works
- [ ] User registration works
- [ ] Profile fetching works
- [ ] Token validation works

## Troubleshooting

### Common Issues
1. **OTP not received**: Check phone number format and network
2. **Login fails**: Verify backend is running and accessible
3. **Token expired**: User will be automatically logged out
4. **Network errors**: Check internet connection and API URL

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('Auth Debug:', { user, token, isLoading });
```

## Future Enhancements

### Planned Features
- [ ] Biometric authentication
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Password-based login option
- [ ] Account recovery options
- [ ] Profile picture upload
- [ ] Email verification

### Performance Optimizations
- [ ] Token caching optimization
- [ ] Lazy loading of auth components
- [ ] Background token refresh
- [ ] Offline mode support

## Support

For issues or questions:
1. Check the backend API documentation
2. Verify environment variables
3. Test with different network conditions
4. Check console logs for errors
5. Ensure all dependencies are installed

---

**Note**: This authentication system is designed to work with the provided backend API. Make sure the backend is properly configured and running before testing the authentication flow. 
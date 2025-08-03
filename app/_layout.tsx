// app/_layout.tsx - Add checkout routes
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from '../contexts/AuthContext';

import { useColorScheme } from '@/hooks/useColorScheme';

// Custom wrapper component to handle safe area colors
function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      {/* Top safe area with gray background */}
      <View style={[styles.topSafeArea, { height: insets.top }]} />
      
      {/* Main content */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Bottom safe area with black background */}
      <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <SafeAreaWrapper>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  presentation: 'card',
                  animation: Platform.OS === 'ios' ? 'default' : 'fade',
                }}
              >
                {/* Opening/Splash Screen */}
                <Stack.Screen name="opening" options={{ headerShown: false }} />
                
                {/* Authentication Screens */}
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                
                {/* Main App Screens */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="marketplace" options={{ headerShown: false }} />
                <Stack.Screen name="product-details" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="sell-animal" options={{ headerShown: false }} />
                
                {/* Checkout Flow */}
                <Stack.Screen 
                  name="checkout" 
                  options={{ 
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                  }} 
                />
                <Stack.Screen 
                  name="order-confirmation" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                    animation: 'fade'
                  }} 
                />
                <Stack.Screen name="cart" options={{ headerShown: false }} />
                
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar 
                style="light" 
                translucent={true}
              />
            </ThemeProvider>
          </SafeAreaWrapper>
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    backgroundColor: '#E8E8E8', // Gray color for top safe area
    width: '100%',
  },
  content: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: '#000000', // Black color for bottom safe area
    width: '100%',
  },
});
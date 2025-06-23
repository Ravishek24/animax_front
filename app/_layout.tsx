// app/_layout.tsx - Add checkout routes
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            presentation: 'card',
            animation: Platform.OS === 'ios' ? 'default' : 'fade',
          }}
        >
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
          <Stack.Screen 
            name="track-order" 
            options={{ 
              headerShown: false,
              animation: 'slide_from_right'
            }} 
          />
          <Stack.Screen 
            name="add-address" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }} 
          />
          
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar 
          style="light" 
          backgroundColor="#ff3b3b"
          translucent={false}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
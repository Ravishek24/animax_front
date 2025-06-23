// app/(tabs)/_layout.tsx - FIXED VERSION
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

export default function TabLayout() {
  return (
    <SafeAreaWrapper
      backgroundColor="#ffffff"
      topBackgroundColor="#E8E8E8"     // Tinted gray
      bottomBackgroundColor="#000000"  // Black
    >
      <StatusBar backgroundColor="#E8E8E8" barStyle="dark-content" translucent={false} />
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#ff3b3b',
              borderTopWidth: 0,
              height: Platform.OS === 'ios' ? 85 : 60, // Different heights for iOS/Android
              paddingBottom: Platform.OS === 'ios' ? 25 : 5, // Account for home indicator on iOS
              paddingTop: 5,
              borderLeftWidth: 2,
              borderRightWidth: 2,
              borderColor: '#3a3a3a',
              // Ensure tab bar stays in safe area
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            },
            tabBarActiveTintColor: '#ffcc00',
            tabBarInactiveTintColor: 'white',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginBottom: Platform.OS === 'ios' ? 0 : 5,
            },
            // Prevent tab bar from interfering with safe area
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'पशुपालन मंच',
              tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="buy-animal"
            options={{
              title: 'पशु खरीदें',
              tabBarIcon: ({ color }) => <Icon name="cart-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="sell-animal"
            options={{
              title: 'पशु बेचें',
              tabBarIcon: ({ color }) => <Icon name="tag-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="marketplace"
            options={{
              title: 'मार्केटप्लेस',
              tabBarIcon: ({ color }) => <Icon name="pill" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="vip"
            options={{
              title: 'VIP बनें',
              tabBarIcon: ({ color }) => <Icon name="crown" size={24} color={color} />,
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </SafeAreaWrapper>
  );
}
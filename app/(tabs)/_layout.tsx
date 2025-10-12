// app/(tabs)/_layout.tsx - FIXED VERSION
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#990906',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 85 : 60,
            paddingBottom: Platform.OS === 'ios' ? 25 : 5,
            paddingTop: 5,
            borderLeftWidth: 2,
            borderRightWidth: 2,
            borderColor: '#3a3a3a',
          },
          // Ensure all tab items share equal width
          tabBarItemStyle: {
            flex: 1,
          },
          tabBarActiveTintColor: '#f9ca1b',
          tabBarInactiveTintColor: 'white',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginBottom: Platform.OS === 'ios' ? 0 : 5,
          },
          tabBarHideOnKeyboard: true,
        }}
      >
          <Tabs.Screen
            name="index"
            options={{
              title: t('appName'),
              tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="buy-animal"
            options={{
              title: t('buyAnimals'),
              tabBarIcon: ({ color }) => <Icon name="cart-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="sell-animal"
            options={{
              title: t('sellAnimals'),
              tabBarIcon: ({ color }) => <Icon name="tag-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="marketplace"
            options={{
              title: t('marketplace'),
              tabBarIcon: ({ color }) => <Icon name="pill" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="vip"
            options={{
              title: 'VIP',
              tabBarIcon: ({ color }) => <Icon name="crown" size={24} color={color} />,
            }}
          />
        </Tabs>
    </ProtectedRoute>
  );
}
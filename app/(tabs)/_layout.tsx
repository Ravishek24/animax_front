import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ff3b3b',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderColor: '#3a3a3a',
        },
        tabBarActiveTintColor: '#ffcc00',
        tabBarInactiveTintColor: 'white',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
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
  );
}

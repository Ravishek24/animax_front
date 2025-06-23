// components/SafeAreaWrapper.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  topBackgroundColor?: string;
  bottomBackgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  backgroundColor = '#ffffff',
  topBackgroundColor = '#E8E8E8', // Tinted gray
  bottomBackgroundColor = '#000000', // Black
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Top Safe Area Background */}
      <View 
        style={[
          styles.topSafeArea, 
          { 
            height: insets.top,
            backgroundColor: topBackgroundColor 
          }
        ]} 
      />
      
      {/* Main Content */}
      <SafeAreaView 
        style={[styles.content, { backgroundColor }]} 
        edges={['left', 'right']}
      >
        {children}
      </SafeAreaView>
      
      {/* Bottom Safe Area Background */}
      <View 
        style={[
          styles.bottomSafeArea, 
          { 
            height: insets.bottom,
            backgroundColor: bottomBackgroundColor 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  bottomSafeArea: {
    width: '100%',
  },
});

export default SafeAreaWrapper;
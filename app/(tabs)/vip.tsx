import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const VipScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaWrapper
      backgroundColor="#ffffff"
      topBackgroundColor="#E8E8E8"     // Tinted gray
      bottomBackgroundColor="#000000"  // Black
    >
      
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.title}>VIP बनें</Text>
          <Text style={styles.subtitle}>यहाँ VIP फीचर्स आएंगे।</Text>
        </View>
        
        {/* Bottom spacer for tab bar */}
        <View style={[styles.bottomSpacer, { 
          height: Platform.OS === 'ios' ? insets.bottom + 85 : 70 
        }]} />
      </SafeAreaView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3b3b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  bottomSpacer: {
    backgroundColor: 'transparent',
  },
});

export default VipScreen;
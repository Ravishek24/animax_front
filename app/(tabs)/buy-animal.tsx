import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BuyAnimalScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#ff3b3b" barStyle="light-content" />
      <View style={styles.centered}>
        <Text style={styles.title}>पशु खरीदें</Text>
        <Text style={styles.subtitle}>यहाँ पशु खरीदने की सुविधा जल्द आएगी।</Text>
      </View>
    </SafeAreaView>
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
});

export default BuyAnimalScreen; 
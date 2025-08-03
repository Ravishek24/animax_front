import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VipScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Text style={styles.title}>VIP बनें</Text>
        <Text style={styles.subtitle}>यहाँ VIP फीचर्स आएंगे।</Text>
      </View>
    </View>
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

export default VipScreen;
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoaderProps {
  visible: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ visible, message = 'लोड हो रहा है...' }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#990906" />
        <Text style={styles.loaderText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 150,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 16,
    color: '#990906',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Loader;

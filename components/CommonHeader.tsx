import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CommonHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ 
  title = "पशुपालन मंच", 
  showBackButton = false,
  onBackPress 
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        )}
        <View style={styles.logo}>
          <Icon name="cow" size={32} color="white" style={styles.logoIcon} />
          <Text style={styles.logoText}>{title}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.userProfile}
        onPress={() => router.push('/profile')}
      >
        <View style={styles.profileImage}>
          <Text style={styles.profileEmoji}>👨‍🌾</Text>
        </View>
        <Text style={styles.profileText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#990906',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#3a3a3a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  userProfile: {
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9ca1b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileEmoji: {
    fontSize: 20,
  },
  profileText: {
    color: 'white',
    fontSize: 14,
  },
});

export default CommonHeader; 
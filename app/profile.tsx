import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const stats = (user as any)?.stats || {} as any;
  const locationText = (user?.city || user?.state) ? `${user?.city || ''} ${user?.state || ''}`.trim() : (user?.address || '—');
  const animalsListed = stats.animalsListed ?? 0;
  const callsMade = stats.callsMade ?? 0;
  const monthsConnected = stats.monthsConnected ?? 0;
  const coins = stats.coins ?? 0;
  const completionPercent = typeof stats.completionPercent === 'number' ? stats.completionPercent : 0;
  const incompletePercent = Math.max(0, 100 - completionPercent);

  const handleLogout = () => {
    Alert.alert(
      'लॉगआउट',
      'क्या आप वाकई लॉगआउट करना चाहते हैं?',
      [
        {
          text: 'रद्द करें',
          style: 'cancel',
        },
        {
          text: 'लॉगआउट',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/opening');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>प्रोफाइल</Text>
          
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageText}>En | हि</Text>
              <Icon name="chevron-down" size={18} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.moreButton} onPress={handleLogout}>
              <Icon name="logout" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>
                  {user?.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.completionBadge}>
                <Text style={styles.completionText}>{incompletePercent}% अधूरी</Text>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
              
              <View style={styles.locationRow}>
                <Icon name="map-marker" size={18} color="#666" />
                <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                  {locationText}
                </Text>
              </View>
              
              <View style={styles.contactRow}>
                <View style={styles.phoneContainer}>
                  <Icon name="phone" size={16} color="#666" />
                  <Text style={styles.phoneText}>
                    {user?.phone_number?.replace('+91', '') || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.whatsappContainer}>
                  <Icon name="whatsapp" size={16} color="#666" />
                  <Text style={styles.phoneText}>
                    {user?.phone_number?.replace('+91', '') || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
            >
              <FeatherIcon name="edit-2" size={20} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Animax पर आपका सफर</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="cow" size={24} color="#D32F2F" />
              <Text style={styles.statValue}>{animalsListed}</Text>
              <Text style={styles.statLabel}>पशु ऐप पर डाले</Text>
            </View>
            
            <View style={[styles.statItem, styles.statBorder]}>
              <Icon name="phone" size={24} color="#D32F2F" />
              <Text style={styles.statValue}>{callsMade}</Text>
              <Text style={styles.statLabel}>आपने कॉल किए</Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="calendar-month" size={24} color="#D32F2F" />
              <Text style={styles.statValue}>{monthsConnected} महीने</Text>
              <Text style={styles.statLabel}>ऐनिमल से जुड़े</Text>
            </View>
          </View>
        </View>
        
        {/* Profile Completion Card */}
        <View style={styles.completionCard}>
          <View style={styles.completionContent}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="alert-circle" size={24} color="#E53935" />
              <Text style={styles.avatarText}>अधूरी प्रोफाइल</Text>
            </View>
            
            <View style={styles.completionTextContainer}>
              <Text style={styles.completionTitleText}>
                आपकी प्रोफाइल <Text style={styles.percentText}>{incompletePercent}% अधूरी</Text> है
              </Text>
              <Text style={styles.completionDescription}>
                प्रोफाइल पूरा करें और <Icon name="circle" size={12} color="#FFC107" /> 10 कॉइन्स पाएँ
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>अभी पूरी करें</Text>
          </TouchableOpacity>
        </View>
        
        {/* Wallet Section */}
        <View style={styles.walletContainer}>
          <View style={styles.walletHeader}>
            <View style={styles.walletTitleContainer}>
              <Icon name="wallet" size={24} color="#FFC107" />
              <Text style={styles.walletTitle}>वॉलेट</Text>
            </View>
            
            <View style={styles.coinContainer}>
              <Icon name="circle" size={20} color="#FFC107" />
              <Text style={styles.coinCount}>{coins}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.walletButton}>
            <Text style={styles.walletButtonText}>वॉलेट देखें</Text>
            <Icon name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* User's Animals */}
        <View style={styles.animalsContainer}>
          <View style={styles.animalsTitleContainer}>
            <Icon name="cow" size={24} color="#333" />
            <Text style={styles.animalsTitle}>{user?.full_name || 'User'} जी के पशु</Text>
          </View>
          
          <TouchableOpacity style={styles.supportButton}>
            <Icon name="headset" size={20} color="#fff" />
            <Text style={styles.supportButtonText}>ग्राहक सेवा</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7E57C2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  languageText: {
    color: '#fff',
    marginRight: 4,
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  completionBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFCDD2',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  completionText: {
    fontSize: 10,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
    color: '#555',
    fontSize: 14,
    width: '85%',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    marginLeft: 4,
    color: '#555',
    fontSize: 14,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: '#FFEBEE',
    margin: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
  },
  completionCard: {
    backgroundColor: '#FFF5F5',
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  completionContent: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    color: '#E53935',
    textAlign: 'center',
    marginTop: 4,
  },
  completionTextContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  completionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  percentText: {
    color: '#E53935',
  },
  completionDescription: {
    fontSize: 14,
    color: '#555',
  },
  completeButton: {
    backgroundColor: '#D32F2F',
    padding: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  walletContainer: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  walletButton: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  walletButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  animalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
    marginBottom: 80,
  },
  animalsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animalsTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  supportButton: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ProfileScreen;
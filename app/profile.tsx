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
import { useLanguage } from '../contexts/LanguageContext';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);

  const stats = (user as any)?.stats || {} as any;
  const locationText = (user?.city || user?.state) ? `${user?.city || ''} ${user?.state || ''}`.trim() : (user?.address || '—');
  const animalsListed = stats.animalsListed ?? 0;
  const callsMade = stats.callsMade ?? 0;
  const monthsConnected = stats.monthsConnected ?? 0;
  const completionPercent = typeof stats.completionPercent === 'number' ? stats.completionPercent : 0;
  const incompletePercent = Math.max(0, 100 - completionPercent);

  const handleLogout = () => {
    Alert.alert(
      t('logoutConfirmTitle'),
      t('logoutConfirmMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logoutAction'),
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
          
          <Text style={styles.headerTitle}>{t('profile')}</Text>
          
          <View style={styles.headerRightContainer}>
            <View>
              <TouchableOpacity 
                style={styles.languageButton}
                onPress={() => setShowLanguageMenu((prev) => !prev)}
                activeOpacity={0.8}
              >
                <Text style={styles.languageText}>
                  {language === 'en-hi' ? 'En | हि' : 'ਪੰਜਾਬੀ'}
                </Text>
                <Icon name="chevron-down" size={18} color="#fff" />
              </TouchableOpacity>
              {showLanguageMenu && (
                <View style={styles.languageMenu}>
                  <TouchableOpacity 
                    style={styles.languageMenuItem}
                    onPress={() => { setLanguage('en-hi'); setShowLanguageMenu(false); }}
                  >
                    <Text style={styles.languageMenuText}>En | हि (Default)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.languageMenuItem}
                    onPress={() => { setLanguage('pa'); setShowLanguageMenu(false); }}
                  >
                    <Text style={styles.languageMenuText}>ਪੰਜਾਬੀ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
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
                <Text style={styles.completionText}>{incompletePercent}% {t('incomplete')}</Text>
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
              <FeatherIcon name="edit-2" size={20} color="#990906" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>{t('statsJourneyTitle')}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="cow" size={24} color="#990906" />
              <Text style={styles.statValue}>{animalsListed}</Text>
              <Text style={styles.statLabel}>{t('statAnimalsListed')}</Text>
            </View>
            
            <View style={[styles.statItem, styles.statBorder]}>
              <Icon name="phone" size={24} color="#990906" />
              <Text style={styles.statValue}>{callsMade}</Text>
              <Text style={styles.statLabel}>{t('statCallsMade')}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="calendar-month" size={24} color="#990906" />
              <Text style={styles.statValue}>{monthsConnected}</Text>
              <Text style={styles.statLabel}>{t('statMonthsConnected')}</Text>
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
                {t('yourProfile')} <Text style={styles.percentText}>{incompletePercent}% {t('incomplete')}</Text> {t('isWord')}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>{t('completeNow')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* User's Animals */}
        <View style={styles.animalsContainer}>
          <View style={styles.animalsTitleContainer}>
            <Icon name="cow" size={24} color="#333" />
            <Text style={styles.animalsTitle}>{user?.full_name || 'User'} {t('animalsOfSuffix')}</Text>
          </View>
          
          <TouchableOpacity style={styles.supportButton}>
            <Icon name="headset" size={20} color="#fff" />
            <Text style={styles.supportButtonText}>{t('customerSupport')}</Text>
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
  languageMenu: {
    position: 'absolute',
    right: 12,
    top: 42,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 100,
  },
  languageMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 120,
  },
  languageMenuText: {
    color: '#333',
    fontSize: 14,
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
    backgroundColor: '#f9ca1b',
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
    color: '#990906',
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
    backgroundColor: '#990906',
    padding: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    backgroundColor: '#990906',
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
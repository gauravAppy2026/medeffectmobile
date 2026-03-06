import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { Colors } from '../theme';
import { DarkHeader } from '../components';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';

const chevronIcon = require('../assets/icons/chevron_right.png');

const icons = {
  account_circle: require('../assets/icons/account_circle.png'),
  lock: require('../assets/icons/lock.png'),
  fingerprint: require('../assets/icons/fingerprint.png'),
  help: require('../assets/icons/help.png'),
  docs: require('../assets/icons/docs.png'),
  security: require('../assets/icons/security.png'),
};

const ProfileMenuItem = ({
  iconSource,
  title,
  onPress,
  rightContent,
  backgroundColor,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, { backgroundColor }]}>
      <Image source={iconSource} style={styles.menuIconImage} resizeMode="contain" />
    </View>
    <Text style={styles.menuTitle}>{title}</Text>
    {rightContent || (
      <Image source={chevronIcon} style={styles.arrowIcon} resizeMode="contain" />
    )}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadBiometricSetting();
  }, []);

  const loadBiometricSetting = async () => {
    try {
      const val = await storage.get('biometric_enabled');
      setBiometricEnabled(val === 'true');
    } catch (e) {
      // ignore
    }
  };

  const toggleBiometric = async (value) => {
    setBiometricEnabled(value);
    await storage.set('biometric_enabled', value ? 'true' : 'false');
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <DarkHeader
        leftContent={
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        }
        title={userName}
        subtitle="Welcome back!"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <ProfileMenuItem
            iconSource={icons.account_circle}
            title="Account Information"
            onPress={() => navigation.navigate('AccountInformation')}
            backgroundColor="#EFF6FF"
          />
          <ProfileMenuItem
            iconSource={icons.lock}
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
            backgroundColor="#FFFBEB"
          />
          <ProfileMenuItem
            iconSource={icons.fingerprint}
            title="Biometric Login"
            backgroundColor="#FFF1F2"
            rightContent={
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: '#D6DCE8', true: '#0089FF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        <View style={styles.divider} />

        {/* Support Section */}
        <View style={styles.section}>
          <ProfileMenuItem
            iconSource={icons.help}
            title="Help & Support"
            onPress={() => navigation.navigate('HelpSupport')}
            backgroundColor="#EFF6FF"
          />
          <ProfileMenuItem
            iconSource={icons.docs}
            title="Terms of Service"
            onPress={() => navigation.navigate('CMSPage', { key: 'terms_of_service', title: 'Terms of Service' })}
            backgroundColor="#FFFBEB"
          />
          <ProfileMenuItem
            iconSource={icons.security}
            title="Privacy Policy"
            onPress={() => navigation.navigate('CMSPage', { key: 'privacy_policy', title: 'Privacy Policy' })}
            backgroundColor="#FFF1F2"
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  section: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#24315D',
    flex: 1,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#0089FF',
  },
  divider: {
    height: 1,
    backgroundColor: '#D6DCE8',
    marginHorizontal: 10,
    marginVertical: 8,
  },
  logoutButton: {
    backgroundColor: '#0089FF',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;

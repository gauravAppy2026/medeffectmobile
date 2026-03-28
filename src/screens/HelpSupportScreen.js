import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { LightHeader } from '../components';
import { cmsService } from '../services/cmsService';

const HelpSupportScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await cmsService.getPage('help_support');
      setData(res.data?.data || res.data);
    } catch (err) {
      console.log('Help fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openLink = async (url, fallbackTitle, fallbackMsg) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(fallbackTitle, fallbackMsg);
      }
    } catch (err) {
      Alert.alert(fallbackTitle, fallbackMsg);
    }
  };

  const handleCall = () => {
    const phone = data?.contactPhone;
    if (!phone) return;
    openLink(`tel:${phone}`, 'Phone Number', phone);
  };

  const handleEmail = () => {
    const email = data?.contactEmail;
    if (!email) return;
    openLink(`mailto:${email}`, 'Email Address', email);
  };

  return (
    <View style={styles.container}>
      <LightHeader title="Help & Support" onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator color="#0089FF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {data?.content ? (
            <Text style={styles.contentText}>{data.content}</Text>
          ) : null}

          {data?.contactPhone ? (
            <Pressable
              style={({ pressed }) => [
                styles.contactCard,
                pressed && styles.contactCardPressed,
              ]}
              onPress={handleCall}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.contactIconText}>📞</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{data.contactPhone}</Text>
              </View>
              <Image source={require('../assets/icons/chevron_right.png')} style={styles.chevron} resizeMode="contain" />
            </Pressable>
          ) : null}

          {data?.contactEmail ? (
            <Pressable
              style={({ pressed }) => [
                styles.contactCard,
                pressed && styles.contactCardPressed,
              ]}
              onPress={handleEmail}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#FFFBEB' }]}>
                <Text style={styles.contactIconText}>✉️</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{data.contactEmail}</Text>
              </View>
              <Image source={require('../assets/icons/chevron_right.png')} style={styles.chevron} resizeMode="contain" />
            </Pressable>
          ) : null}

          {!data?.contactPhone && !data?.contactEmail && !data?.content ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No support information available yet.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  contentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactCardPressed: {
    backgroundColor: '#F1F5F9',
    opacity: 0.9,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0089FF',
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: '#0089FF',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C7490',
  },
});

export default HelpSupportScreen;

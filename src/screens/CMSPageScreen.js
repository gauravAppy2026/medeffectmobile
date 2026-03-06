import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LightHeader } from '../components';
import { cmsService } from '../services/cmsService';

const CMSPageScreen = ({ navigation, route }) => {
  const { key, title } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await cmsService.getPage(key);
      setData(res.data?.data || res.data);
    } catch (err) {
      console.log('CMS fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openUrl = async () => {
    let url = data?.url;
    if (!url) return;
    // Ensure URL has a scheme
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Cannot Open Link', `Unable to open: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <LightHeader title={title} onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator color="#0089FF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {data?.content ? (
            <Text style={styles.contentText}>{data.content}</Text>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No content available yet.</Text>
            </View>
          )}

          {data?.url ? (
            <Text style={styles.linkText} onPress={openUrl}>
              {data.url}
            </Text>
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
  },
  linkText: {
    marginTop: 16,
    fontSize: 14,
    color: '#0089FF',
    textDecorationLine: 'underline',
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

export default CMSPageScreen;

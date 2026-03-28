import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { DarkHeader, TabFilter, Button } from '../components';
import { ivrService } from '../services/ivrService';

const chevronIcon = require('../assets/icons/chevron_right.png');

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'covered', label: 'Covered' },
  { key: 'not_covered', label: 'Not Covered' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES = {
  submitted: { color: '#BB4D00', bg: '#FFF8DB' },
  covered: { color: '#007A55', bg: '#DEFCED' },
  not_covered: { color: '#2958E8', bg: '#E6F1FF' },
  rejected: { color: '#C70036', bg: '#FFEBEC' },
};

const STATUS_LABELS = {
  submitted: 'Submitted',
  covered: 'Covered',
  not_covered: 'Not Covered',
  rejected: 'Rejected',
};

const AVATAR_COLORS = ['#D4E8FF', '#F3E5FF', '#FFF3E0', '#E8F5E9', '#FDE8E8'];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

const IVRListScreen = ({ navigation, route }) => {
  const { initialStatus } = route?.params || {};
  const [activeTab, setActiveTab] = useState(initialStatus || 'all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async (status) => {
    try {
      const params = { limit: 50 };
      if (status && status !== 'all') params.status = status;
      const response = await ivrService.getIVRRequests(params);
      setRequests(response.data.data?.data || response.data.data || []);
    } catch (err) {
      console.log('IVR list fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchRequests(activeTab); }, [activeTab, fetchRequests]));

  const handleTabPress = (tabKey) => {
    setActiveTab(tabKey);
    setLoading(true);
  };

  const onRefresh = () => { setRefreshing(true); fetchRequests(activeTab); };

  const renderRequestCard = ({ item, index }) => {
    const name = `${item.patient?.firstName || ''} ${item.patient?.lastName || ''}`.trim() || 'Unknown';
    const initials = getInitials(name);
    const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.submitted;
    const statusLabel = STATUS_LABELS[item.status] || item.status;

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => navigation.navigate('IVRDetail', { ivrId: item._id })}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{name}</Text>
          <Text style={styles.cardId}>{item.requestId || 'N/A'}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{statusLabel}</Text>
          </View>
          <Image source={chevronIcon} style={styles.chevronIcon} resizeMode="contain" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <DarkHeader
        title="IVR"
        subtitle="Manage customer IVR orders easily"
        bottomContent={
          <Button
            title="+ Create New IVR"
            onPress={() => navigation.navigate('InsuranceVerification')}
            style={styles.createButton}
          />
        }
      />

      <TabFilter
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

      <View style={styles.content}>

        {loading ? (
          <ActivityIndicator color="#0089FF" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={requests}
            renderItem={renderRequestCard}
            keyExtractor={(item) => item._id || item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No IVR requests found</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  createButton: {
    borderRadius: BorderRadius.md,
    height: 50,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    fontFamily: 'System',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C7490',
  },

  /* Request Card */
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    height: 78,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Avatar Circle */
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    fontFamily: 'System',
  },

  /* Card Content (Name and ID) */
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    fontFamily: 'System',
    marginBottom: 2,
  },
  cardId: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
    fontFamily: 'System',
  },

  /* Card Right (Status Dot and Chevron) */
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.primary,
  },
});

export default IVRListScreen;

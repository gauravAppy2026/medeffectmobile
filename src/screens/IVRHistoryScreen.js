import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LightHeader } from '../components';
import { ivrService } from '../services/ivrService';

const chevronIcon = require('../assets/icons/chevron_right.png');

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES = {
  pending: { color: '#BB4D00', bg: '#FFF8DB' },
  approved: { color: '#007A55', bg: '#DEFCED' },
  rejected: { color: '#C70036', bg: '#FFEBEC' },
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Covered',
  rejected: 'Not Covered',
};

const AVATAR_COLORS = ['#D4E8FF', '#F3E5FF', '#FFF3E0', '#E8F5E9', '#FDE8E8'];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

const IVRHistoryScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
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
      console.log('IVR history fetch error:', err.message);
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
    const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
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
      <LightHeader
        title="IVR History"
        onBack={() => navigation.goBack()}
      />

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Request List */}
      {loading ? (
        <ActivityIndicator color="#0089FF" style={{ marginTop: 40 }} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  /* Tab Bar */
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D6DCE8',
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9299B4',
  },
  tabTextActive: {
    color: '#0089FF',
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: '#0089FF',
    borderRadius: 1.5,
  },
  /* List */
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 78,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  /* Avatar */
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#24315D',
  },
  /* Card Content */
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#24315D',
    marginBottom: 2,
  },
  cardId: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C7490',
  },
  /* Card Right */
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: '#0089FF',
  },
});

export default IVRHistoryScreen;

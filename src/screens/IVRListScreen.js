import React, { useState, useEffect, useCallback } from 'react';
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
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { DarkHeader, Button } from '../components';
import { ivrService } from '../services/ivrService';

const historyIcon = require('../assets/icons/history.png');
const chevronIcon = require('../assets/icons/chevron_right.png');

const STATUS_COLORS = {
  pending: '#FACC15',
  approved: '#22C55E',
  rejected: '#F87171',
};

const AVATAR_COLORS = ['#D4E8FF', '#F3E5FF', '#FFF3E0', '#E8F5E9', '#FDE8E8'];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

const IVRListScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await ivrService.getIVRRequests({ limit: 50 });
      setRequests(response.data.data?.data || response.data.data || []);
    } catch (err) {
      console.log('IVR list fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const onRefresh = () => { setRefreshing(true); fetchRequests(); };

  const renderRequestCard = ({ item, index }) => {
    const name = `${item.patient?.firstName || ''} ${item.patient?.lastName || ''}`.trim() || 'Unknown';
    const initials = getInitials(name);
    const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const statusColor = STATUS_COLORS[item.status] || '#FACC15';

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => navigation.navigate('IVRHistory')}
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
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
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
        rightContent={
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('IVRHistory')}
          >
            <Image source={historyIcon} style={styles.historyIconImage} resizeMode="contain" />
          </TouchableOpacity>
        }
        bottomContent={
          <Button
            title="+ Create New IVR"
            onPress={() => navigation.navigate('InsuranceVerification')}
            style={styles.createButton}
          />
        }
      />

      <View style={styles.content}>

        <Text style={styles.sectionTitle}>Recent Requests</Text>

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

  /* History Button in Header */
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIconImage: {
    width: 22,
    height: 22,
    tintColor: '#0089FF',
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
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.primary,
  },
});

export default IVRListScreen;

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DarkHeader, OrderListItem } from '../components';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { ivrService } from '../services/ivrService';

const plusIcon = require('../assets/icons/plus_circle.png');
const deployedCodeIcon = require('../assets/icons/deployed_code.png');
const shippingIcon = require('../assets/icons/shipping.png');
const taskAltIcon = require('../assets/icons/task_alt.png');
const cancelIcon = require('../assets/icons/cancel.png');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({ submitted: 0, approved: 0, shipped: 0, cancelled: 0 });
  const [ivrCounts, setIvrCounts] = useState({ submitted: 0, covered: 0, not_covered: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, orderCountsRes, ivrCountsRes] = await Promise.all([
        orderService.getOrders({ limit: 4 }),
        orderService.getStatusCounts(),
        ivrService.getStatusCounts(),
      ]);
      setRecentOrders(ordersRes.data.data?.data || ordersRes.data.data || []);
      setOrderCounts(orderCountsRes.data.data || { submitted: 0, approved: 0, shipped: 0, cancelled: 0 });
      setIvrCounts(ivrCountsRes.data.data || { submitted: 0, covered: 0, not_covered: 0, rejected: 0 });
    } catch (err) {
      console.log('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';
  const renderIVRStatusCard = (number, label, bgColor, borderColor, numberColor, statusKey) => (
    <TouchableOpacity
      style={[styles.ivrCard, { backgroundColor: bgColor, borderColor: borderColor }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('IVR', { initialStatus: statusKey })}
    >
      <Text style={[styles.ivrNumber, { color: numberColor }]}>{number}</Text>
      <Text style={[styles.ivrLabel, { color: numberColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderOrderStatusCard = (icon, count, label, countColor, bgColor, borderColor, statusKey) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: bgColor, borderColor: borderColor }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Orders', { initialStatus: statusKey })}
    >
      <View style={styles.orderCardTopRow}>
        <Image source={icon} style={[styles.cardIcon, { tintColor: countColor }]} resizeMode="contain" />
        <Text style={[styles.orderCount, { color: countColor }]}>{count}</Text>
      </View>
      <Text style={[styles.orderLabel, { color: countColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Dark Header with gradient background */}
      <DarkHeader
        title={userName}
        subtitle="Welcome back!"
        leftContent={
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        }
        rightContent={
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => navigation.navigate('OrderCreation')}
            activeOpacity={0.7}
          >
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* IVR Status Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>IVR Status</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IVRHistory')}>
              <Text style={styles.viewMoreLink}>View More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ivrStatusContainer}>
            {renderIVRStatusCard(ivrCounts.submitted, 'Submitted', 'rgba(255,248,219,0.5)', 'rgba(254,230,133,0.5)', '#BB4D00', 'submitted')}
            {renderIVRStatusCard(ivrCounts.covered, 'Covered', 'rgba(222,252,237,0.5)', 'rgba(164,244,207,0.5)', '#007A55', 'covered')}
            {renderIVRStatusCard(ivrCounts.not_covered, 'Not Covered', 'rgba(230,241,255,0.5)', 'rgba(190,219,255,0.5)', '#2958E8', 'not_covered')}
            {renderIVRStatusCard(ivrCounts.rejected, 'Rejected', 'rgba(255,235,236,0.5)', 'rgba(255,204,211,0.5)', '#C70036', 'rejected')}
          </View>
        </View>

        {/* Order Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>

          <View style={styles.orderStatusGrid}>
            <View style={styles.orderStatusRow}>
              {renderOrderStatusCard(deployedCodeIcon, orderCounts.submitted, 'Submitted', '#BB4D00', '#FFF8DB', '#FEE685', 'submitted')}
              {renderOrderStatusCard(taskAltIcon, orderCounts.approved, 'Approved', '#1447E6', '#E6F1FF', '#BEDBFF', 'approved')}
            </View>
            <View style={styles.orderStatusRow}>
              {renderOrderStatusCard(shippingIcon, orderCounts.shipped, 'Shipped', '#007A55', '#DEFCED', '#A4F4CF', 'shipped')}
              {renderOrderStatusCard(cancelIcon, orderCounts.cancelled, 'Cancelled', '#C70036', '#FFEBEC', '#FFCCD3', 'cancelled')}
            </View>
          </View>
        </View>

        {/* Recent Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')} activeOpacity={0.7}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#0089FF" style={{ marginTop: 20 }} />
          ) : recentOrders.length === 0 ? (
            <Text style={{ color: '#6C7490', textAlign: 'center', marginTop: 16 }}>No orders yet</Text>
          ) : (
            recentOrders.map((order) => {
              const providerName = order.doctor
                ? `${order.doctor.firstName || ''} ${order.doctor.lastName || ''}`.trim()
                : '';
              const patientName = (order.patientName ||
                `${order.patient?.firstName || ''} ${order.patient?.lastName || ''}`.trim()).trim();
              const displayName = providerName
                ? `${providerName}${patientName ? ', ' + patientName : ''}`
                : (patientName || 'Order');
              let dateStr = '';
              if (order.createdAt) {
                const d = new Date(order.createdAt);
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                dateStr = `${mm}/${dd}/${d.getFullYear()}`;
              }
              return (
                <OrderListItem
                  key={order._id}
                  name={displayName}
                  orderId={order.orderId}
                  date={dateStr}
                  status={order.status}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order._id })}
                />
              );
            })
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#0089FF',
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 28,
    textAlign: 'center',
    marginTop: -1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24315D',
  },
  viewMoreLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0089FF',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0089FF',
  },
  /* IVR Status Section Styles */
  ivrStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ivrCard: {
    flex: 1,
    height: 76,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  ivrNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  ivrLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  /* Order Status Section Styles */
  orderStatusGrid: {
    gap: 12,
  },
  orderStatusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  orderCard: {
    flex: 1,
    height: 84,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
  },
  orderCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 24,
    height: 24,
  },
  orderCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  orderLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;

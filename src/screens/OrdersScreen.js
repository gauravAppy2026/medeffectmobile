import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { DarkHeader, TabFilter, OrderListItem, Button } from '../components';
import { orderService } from '../services/orderService';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  submitted: '#FFB020',
  approved: '#0089FF',
  shipped: '#4CAF50',
  completed: '#4CAF50',
  cancelled: '#FF4D6A',
  rejected: '#FF4D6A',
};

const OrdersScreen = ({ navigation, route }) => {
  const { initialStatus } = route?.params || {};
  const [activeTab, setActiveTab] = useState(initialStatus || 'all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (status) => {
    try {
      const params = { limit: 50 };
      if (status && status !== 'all') params.status = status;
      const response = await orderService.getOrders(params);
      setOrders(response.data.data?.data || response.data.data || []);
    } catch (err) {
      console.log('Orders fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(activeTab); }, [activeTab, fetchOrders]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    setLoading(true);
  };

  const onRefresh = () => { setRefreshing(true); fetchOrders(activeTab); };

  const renderItem = ({ item }) => {
    const providerName = item.doctor
      ? `${item.doctor.firstName || ''} ${item.doctor.lastName || ''}`.trim()
      : '';
    const patientName = (item.patientName ||
      `${item.patient?.firstName || ''} ${item.patient?.lastName || ''}`.trim()).trim();
    const displayName = providerName
      ? `${providerName}${patientName ? ', ' + patientName : ''}`
      : (patientName || 'Order');
    let dateStr = '';
    if (item.createdAt) {
      const d = new Date(item.createdAt);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dateStr = `${mm}/${dd}/${d.getFullYear()}`;
    }
    return (
      <OrderListItem
        name={displayName}
        orderId={item.orderId}
        date={dateStr}
        statusColor={STATUS_COLORS[item.status]}
        status={item.status}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Figma: dark header with "Order History" title */}
      <DarkHeader
        title="Order History"
        subtitle="Manage customer orders  history easily"
        bottomContent={
          <Button
            title="+ Create New Order"
            onPress={() => navigation.navigate('OrderCreation')}
            style={styles.createButton}
          />
        }
      />

      {/* Figma: tab filter with underline style */}
      <TabFilter
        tabs={TABS}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

      {loading ? (
        <ActivityIndicator color="#0089FF" style={{ marginTop: 40 }} />
      ) : (
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders found</Text>
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
  createButton: {
    borderRadius: 10,
    height: 50,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C7490',
  },
});

export default OrdersScreen;

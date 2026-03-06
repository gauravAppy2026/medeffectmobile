import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../theme';
import { DarkHeader, TabFilter, OrderListItem } from '../components';
import { orderService } from '../services/orderService';

const plusIcon = require('../assets/icons/plus_circle.png');

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Shipped' },
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

const OrdersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
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
    const name = item.patientName || `${item.patient?.firstName || ''} ${item.patient?.lastName || ''}`;
    return (
      <OrderListItem
        name={name}
        orderId={item.orderId}
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
        compact
        rightContent={
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderCreation')}
          >
            <Image source={plusIcon} style={styles.plusIconImage} resizeMode="contain" />
          </TouchableOpacity>
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  plusIconImage: {
    width: 40,
    height: 40,
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

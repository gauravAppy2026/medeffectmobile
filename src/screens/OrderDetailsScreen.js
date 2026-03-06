import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme';
import { LightHeader } from '../components';
import { orderService } from '../services/orderService';

const STATUS_COLORS = {
  submitted: '#FFB020',
  approved: '#0089FF',
  shipped: '#4CAF50',
  completed: '#4CAF50',
  cancelled: '#FF4D6A',
  rejected: '#FF4D6A',
};

// Map backend status to display label
const STATUS_LABELS = {
  submitted: 'Submitted',
  approved: 'Approved',
  completed: 'Shipped',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const TIMELINE_STEPS = ['submitted', 'approved', 'shipped'];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const TimelineStep = ({ title, date, isCompleted, isLast }) => (
  <View style={styles.timelineStep}>
    <View style={styles.timelineLeft}>
      <View style={[
        styles.timelineDot,
        isCompleted ? styles.timelineDotCompleted : styles.timelineDotPending,
      ]}>
        {isCompleted && <Text style={styles.timelineDotIcon}>{'✓'}</Text>}
      </View>
      {!isLast && <View style={[
        styles.timelineLine,
        isCompleted ? styles.timelineLineCompleted : styles.timelineLinePending,
      ]} />}
    </View>
    <View style={styles.timelineContent}>
      <Text style={styles.timelineTitle}>{title}</Text>
      <Text style={styles.timelineDate}>{date}</Text>
    </View>
  </View>
);

const InfoCard = ({ label, children }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoBadge}>
      <Text style={styles.infoBadgeText}>{label}</Text>
    </View>
    {children}
  </View>
);

const OrderDetailsScreen = ({ navigation, route }) => {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrderById(orderId);
        setOrder(response.data.data);
      } catch (err) {
        console.log('Order detail fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LightHeader title="Order Details" onBack={() => navigation.goBack()} />
        <ActivityIndicator color="#0089FF" style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <LightHeader title="Order Details" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[order.status] || '#6C7490';
  const statusLabel = STATUS_LABELS[order.status] || (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : '');

  // Build timeline from statusHistory
  const statusHistory = order.statusHistory || [];
  const statusMap = {};
  statusHistory.forEach((h) => {
    statusMap[h.status] = h.timestamp;
    // Map 'completed' from backend to 'shipped' for timeline display
    if (h.status === 'completed') statusMap['shipped'] = h.timestamp;
  });

  // Map 'completed' from backend to 'shipped' for timeline display
  const mappedStatus = order.status === 'completed' ? 'shipped' : order.status;
  const currentStepIndex = TIMELINE_STEPS.indexOf(mappedStatus);

  const patientName = order.patientName ||
    `${order.patient?.firstName || ''} ${order.patient?.lastName || ''}`.trim() || 'N/A';
  const patientPhone = order.patient?.phone || '';
  const addr = order.address || order.patient?.address;
  const patientAddress = addr
    ? (typeof addr === 'string' ? addr : [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', '))
    : '';

  const doctorName = order.doctor
    ? `Dr. ${order.doctor.firstName || ''} ${order.doctor.lastName || ''}`.trim()
    : 'N/A';
  const doctorDept = order.doctor?.department || '';

  const productName = order.product?.name || 'N/A';
  const productPrice = order.product?.price ? `$${order.product.price.toLocaleString()}` : '';
  const quantity = order.quantity || 1;

  return (
    <View style={styles.container}>
      <LightHeader
        title="Order Details"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order ID Card */}
        <View style={styles.orderIdCard}>
          <View>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderIdValue}>{order.orderId}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {TIMELINE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const historyDate = statusMap[step] ? formatDate(statusMap[step]) : '';
            return (
              <TimelineStep
                key={step}
                title={step.charAt(0).toUpperCase() + step.slice(1)}
                date={historyDate}
                isCompleted={isCompleted}
                isLast={idx === TIMELINE_STEPS.length - 1}
              />
            );
          })}
        </View>

        {/* Tracking Number */}
        {order.trackingNumber && (
          <View style={styles.trackingCard}>
            <View>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            </View>
          </View>
        )}

        {/* Patient Info */}
        <InfoCard label="Patient">
          <Text style={styles.infoName}>{patientName}</Text>
          {!!patientPhone && <Text style={styles.infoDetail}>{patientPhone}</Text>}
          {!!patientAddress && <Text style={styles.infoDetail}>{patientAddress}</Text>}
        </InfoCard>

        {/* Provider Info */}
        <InfoCard label="Provider">
          <Text style={styles.infoName}>{doctorName}</Text>
          {!!doctorDept && <Text style={styles.infoDetail}>{doctorDept}</Text>}
        </InfoCard>

        {/* Products Info */}
        <InfoCard label="Products">
          <View style={styles.productRow}>
            <View>
              <Text style={styles.infoName}>{productName}</Text>
              <Text style={styles.infoDetail}>Quantity : {quantity}</Text>
            </View>
            {!!productPrice && <Text style={styles.productPrice}>{productPrice}</Text>}
          </View>
        </InfoCard>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6C7490',
  },
  // Order ID Card
  orderIdCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#6C7490',
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24315D',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Timeline
  timelineContainer: {
    marginBottom: 20,
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#10B981',
  },
  timelineDotPending: {
    backgroundColor: '#D6DCE8',
  },
  timelineDotIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineLinePending: {
    backgroundColor: '#D6DCE8',
  },
  timelineContent: {
    marginLeft: 12,
    paddingBottom: 16,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24315D',
  },
  timelineDate: {
    fontSize: 12,
    color: '#6C7490',
    marginTop: 2,
  },
  // Tracking
  trackingCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6C7490',
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0089FF',
    marginTop: 2,
  },
  trackingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trackingBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Info Cards
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D6DCE8',
  },
  infoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  infoBadgeText: {
    fontSize: 11,
    color: '#0089FF',
    fontWeight: '600',
  },
  infoName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24315D',
  },
  infoDetail: {
    fontSize: 12,
    color: '#6C7490',
    marginTop: 2,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0089FF',
  },
});

export default OrderDetailsScreen;

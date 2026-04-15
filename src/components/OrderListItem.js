import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../theme';

const chevronIcon = require('../assets/icons/chevron_right.png');

// Figma: card is white, border #E2E8F0, rounded 14, shadow, height 78
// Avatar 46x46 circle with colored bg and initials
// Status dot 10x10 + chevron arrow
const OrderListItem = ({
  name,
  orderId,
  initials,
  statusColor,
  onPress,
  style,
  date,
}) => {
  // Avatar background colors matching Figma
  const getInitialsBg = () => {
    const colors = ['#D4E8FF', '#FFF3E0', '#E8F5E9', '#FCE4EC', '#F3E5F5', '#E0F7FA'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Derive initials from first segment of name (provider part before comma)
  const computedInitials = (() => {
    if (initials) return initials;
    if (!name) return '';
    const providerPart = name.split(',')[0].trim();
    const words = providerPart.split(/\s+/);
    return words.slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
  })();

  const subtitle = date ? `${orderId}  ·  ${date}` : orderId;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar - Figma: 46x46 circle */}
      <View style={[styles.avatar, { backgroundColor: getInitialsBg() }]}>
        <Text style={styles.initials}>{computedInitials}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.orderId} numberOfLines={1}>{subtitle}</Text>
      </View>

      {/* Right: status dot + chevron */}
      <View style={styles.rightSection}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Image source={chevronIcon} style={styles.chevronIcon} resizeMode="contain" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 78,
    paddingHorizontal: 16,
    marginBottom: 10,
    // Shadow from Figma: 0px 1px 2px rgba(0,0,0,0.05)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  initials: {
    fontSize: 18,
    fontWeight: '500',
    color: '#24315D',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#24315D',
  },
  orderId: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C7490',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: '#0089FF',
  },
});

export default OrderListItem;

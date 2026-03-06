import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../theme';

const StatusCard = ({
  count,
  label,
  backgroundColor,
  textColor,
  icon,
  style,
}) => {
  return (
    <View style={[styles.card, { backgroundColor }, style]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.count, { color: textColor }]}>{count}</Text>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const StatusCardWide = ({
  count,
  label,
  backgroundColor,
  textColor,
  icon,
  style,
}) => {
  return (
    <View style={[styles.wideCard, { backgroundColor }, style]}>
      {icon && <View style={styles.wideIcon}>{icon}</View>}
      <View style={styles.wideContent}>
        <Text style={[styles.wideLabel, { color: textColor }]}>{label}</Text>
      </View>
      <Text style={[styles.wideCount, { color: textColor }]}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  iconWrapper: {
    marginBottom: Spacing.xs,
  },
  count: {
    ...Typography.h1,
    marginBottom: 2,
  },
  label: {
    ...Typography.caption,
    fontWeight: '500',
  },
  wideCard: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 70,
  },
  wideIcon: {
    marginRight: Spacing.md,
  },
  wideContent: {
    flex: 1,
  },
  wideLabel: {
    ...Typography.caption,
    fontWeight: '500',
  },
  wideCount: {
    ...Typography.h2,
  },
});

export { StatusCard, StatusCardWide };
export default StatusCard;

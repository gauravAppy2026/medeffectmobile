import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

// Dark navy header used on Home, Orders, IVR, Profile
// Figma: gradient from #1D293D to #0F172B, height ~200px for full, ~120px for compact
const DarkHeader = ({ title, subtitle, leftContent, rightContent, bottomContent, style, compact = false }) => {
  return (
    <View style={[styles.darkHeader, compact && styles.darkHeaderCompact, style]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.darkContent}>
        {leftContent && <View style={styles.leftContent}>{leftContent}</View>}
        <View style={styles.titleArea}>
          {subtitle && <Text style={styles.darkSubtitle}>{subtitle}</Text>}
          {title && <Text style={styles.darkTitle}>{title}</Text>}
        </View>
        {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
      </View>
      {bottomContent && <View style={styles.bottomContent}>{bottomContent}</View>}
    </View>
  );
};

// Light header with back button for inner screens
const LightHeader = ({ title, onBack, rightContent, style }) => {
  return (
    <View style={[styles.lightHeader, style]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.lightContent}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.lightTitle} numberOfLines={1}>{title}</Text>
        {rightContent ? (
          <View style={styles.rightContent}>{rightContent}</View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkHeader: {
    backgroundColor: Colors.navy,
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  darkHeaderCompact: {
    paddingBottom: 18,
  },
  darkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContent: {
    marginRight: 12,
  },
  titleArea: {
    flex: 1,
  },
  darkTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  darkSubtitle: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  rightContent: {
    marginLeft: 12,
  },
  bottomContent: {
    marginTop: 16,
  },
  lightHeader: {
    backgroundColor: Colors.white,
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  lightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 32,
    color: Colors.textPrimary,
    fontWeight: '300',
    marginTop: -4,
  },
  lightTitle: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
});

export { DarkHeader, LightHeader };

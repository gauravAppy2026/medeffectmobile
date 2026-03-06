import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme';

// Figma: buttons are #0089FF bg, rounded 10, height 50
const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'large',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const base = [styles.base, styles[size]];
    switch (variant) {
      case 'secondary':
        return [...base, styles.secondary];
      case 'outline':
        return [...base, styles.outline];
      case 'danger':
        return [...base, styles.danger];
      default:
        return [...base, styles.primary];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.text, { color: '#0089FF' }];
      default:
        return [styles.text, { color: '#FFFFFF' }];
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  large: {
    height: 50,
    paddingHorizontal: 24,
    width: '100%',
  },
  primary: {
    backgroundColor: '#0089FF',
  },
  secondary: {
    backgroundColor: '#1D293D',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0089FF',
  },
  danger: {
    backgroundColor: '#F14336',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Button;

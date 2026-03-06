import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme';

// Figma: same style as Input but with dropdown arrow
const DropdownInput = ({
  label,
  placeholder,
  value,
  onPress,
  required = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TouchableOpacity style={styles.inputWrapper} onPress={onPress} activeOpacity={0.7}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C7490',
    marginBottom: 8,
  },
  required: {
    color: '#F14336',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6DCE8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 50,
    paddingHorizontal: 16,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#24315D',
  },
  placeholder: {
    color: '#9299B4',
  },
  arrow: {
    fontSize: 10,
    color: '#6C7490',
    marginLeft: 8,
  },
});

export default DropdownInput;

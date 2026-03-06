import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme';

// Figma: label #6C7490 12px Medium, input border #D6DCE8, rounded 8, height 50
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  required = false,
  editable = true,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  style,
  inputStyle,
  error,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={[
        styles.inputWrapper,
        multiline && styles.multilineWrapper,
        error && styles.inputError,
      ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9299B4"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>{isSecure ? '👁' : '👁'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconButton}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  multilineWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#24315D',
    fontWeight: '400',
    height: '100%',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#F14336',
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  iconText: {
    fontSize: 18,
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    color: '#F14336',
    marginTop: 4,
  },
});

export default Input;

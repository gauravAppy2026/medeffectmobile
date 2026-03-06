import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';

const successBadge = require('../assets/icons/success_badge_lg.png');

const SuccessScreen = ({ navigation, route }) => {
  const type = route?.params?.type || 'order';
  const isIVR = type === 'ivr';
  const handleBackToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Badge Icon - Figma: green verified badge ~50px */}
        <View style={styles.iconContainer}>
          <Image
            source={successBadge}
            style={styles.successBadge}
            resizeMode="contain"
          />
        </View>

        {/* Success Message - Figma: 18px #24315D */}
        <Text style={styles.title}>{isIVR ? 'IVR Submitted!' : 'Request Submitted!'}</Text>
        <Text style={styles.subtitle}>
          {isIVR
            ? `Your IVR has been submitted${'\n'}successfully.`
            : `Your order has been submitted${'\n'}successfully.`}
        </Text>

        {/* Button - Figma: #0089FF, rounded 10, height 50 */}
        <TouchableOpacity style={styles.button} onPress={handleBackToDashboard}>
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  successBadge: {
    width: 50,
    height: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#24315D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6C7490',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#0089FF',
    borderRadius: 10,
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SuccessScreen;

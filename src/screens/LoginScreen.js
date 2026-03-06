import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validators';

// Import actual Figma assets
const logoImage = require('../assets/icons/logo.png');
const visibilityIcon = require('../assets/icons/visibility.png');
const fingerprintLoginIcon = require('../assets/icons/fingerprint_login.png');

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async () => {
    const errors = {};
    const emailError = validateEmail(email);
    // Only check password is present for login (HIPAA password policy applies to new/changed passwords only)
    const passwordError = !password ? 'Password is required' : null;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo - Figma: actual image, 238x52, centered at ~155px from top */}
          <View style={styles.logoContainer}>
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Email Field - Figma: label #6C7490 12px, input border #D6DCE8, rounded 8, height 50 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#97A3B6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field - Figma: same input style + visibility icon */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#24315D"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Image
                  source={visibilityIcon}
                  style={styles.eyeIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember me / Forgot password - Figma positions */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Field Errors */}
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

          {/* Login Button - Figma: bg #0089FF, rounded 10, height 50 */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Section - Figma: divider lines 30px, centered text */}
          <View style={styles.biometricSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use Biometric</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Fingerprint circle - Figma: 80x80, rounded 20, border #D6DCE8, icon 50x50 */}
            <TouchableOpacity style={styles.biometricButton}>
              <View style={styles.fingerprintCircle}>
                <Image
                  source={fingerprintLoginIcon}
                  style={styles.fingerprintImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom - Figma: "Need access? Contact Admin" with underline on Contact Admin */}
          <View style={styles.bottomSection}>
            <Text style={styles.needAccess}>
              Need access?{' '}
              <Text style={styles.contactAdmin}>Contact Admin</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  // Logo - Figma: 238x52 image centered, top ~155px (minus status bar ~42px = ~113px margin)
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  logoImage: {
    width: 238,
    height: 52,
  },

  // Input fields
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C7490',
    marginBottom: 8,
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#24315D',
    fontWeight: '400',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  eyeIconImage: {
    width: 24,
    height: 24,
    tintColor: '#6C7490',
  },

  // Options row
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D6DCE8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#0089FF',
    borderColor: '#0089FF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#24315D',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#F14336',
  },

  // Login button - Figma: #0089FF, rounded 10, height 50
  loginButton: {
    backgroundColor: '#0089FF',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F14336',
    fontSize: 13,
    textAlign: 'center',
  },
  fieldError: {
    color: '#F14336',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8,
  },

  // Biometric section
  biometricSection: {
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  dividerLine: {
    width: 30,
    height: 1,
    backgroundColor: '#D9D9D9',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6C7490',
    marginHorizontal: 12,
  },
  biometricButton: {
    marginBottom: 24,
  },
  // Figma: 80x80 circle, rounded 20, border #D6DCE8
  fingerprintCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6DCE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma: fingerprint icon 50x50 inside circle
  fingerprintImage: {
    width: 50,
    height: 50,
  },

  // Bottom section
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 30,
    marginTop: 'auto',
  },
  needAccess: {
    fontSize: 14,
    fontWeight: '400',
    color: '#24315D',
    textAlign: 'center',
  },
  contactAdmin: {
    color: '#0089FF',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;

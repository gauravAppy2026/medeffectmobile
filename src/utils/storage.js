// HIPAA: Use EncryptedStorage instead of AsyncStorage
// iOS: Data stored in Keychain (hardware-encrypted)
// Android: Data stored in EncryptedSharedPreferences (AES-256)
import EncryptedStorage from 'react-native-encrypted-storage';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

export const storage = {
  async getAccessToken() {
    return EncryptedStorage.getItem(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken() {
    return EncryptedStorage.getItem(KEYS.REFRESH_TOKEN);
  },

  async setTokens(accessToken, refreshToken) {
    await EncryptedStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    await EncryptedStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getUser() {
    const user = await EncryptedStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  async setUser(user) {
    await EncryptedStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async clear() {
    await EncryptedStorage.removeItem(KEYS.ACCESS_TOKEN);
    await EncryptedStorage.removeItem(KEYS.REFRESH_TOKEN);
    await EncryptedStorage.removeItem(KEYS.USER);
  },

  async get(key) {
    return EncryptedStorage.getItem(key);
  },

  async set(key, value) {
    return EncryptedStorage.setItem(key, value);
  },
};

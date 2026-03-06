import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { storage } from '../utils/storage';
import { setSessionExpiredHandler } from '../services/api';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Register the session-expired handler so api.js can trigger logout
  const handleSessionExpired = useCallback(() => {
    setUser(null);
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [{ text: 'OK' }],
    );
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
    return () => setSessionExpiredHandler(null);
  }, [handleSessionExpired]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getAccessToken();
      if (token) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 5000),
        );
        const response = await Promise.race([
          userService.getProfile(),
          timeoutPromise,
        ]);
        setUser(response.data.data);
      }
    } catch (error) {
      console.log('[AuthContext] checkAuth error:', error?.message);
      await storage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { user: userData, accessToken, refreshToken } = response.data.data;

    if (userData.role !== 'sales_rep' && userData.role !== 'admin') {
      throw new Error('Access denied. Only sales representatives and admins can log in.');
    }

    await storage.setTokens(accessToken, refreshToken);
    await storage.setUser(userData);
    setUser(userData);
    return userData;
  };

  const refreshUser = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data.data;
      setUser(userData);
      await storage.setUser(userData);
    } catch (error) {
      console.log('[AuthContext] refreshUser error:', error?.message);
    }
  };

  const logout = async () => {
    await storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

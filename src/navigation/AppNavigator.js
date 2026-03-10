import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

import {
  LoginScreen,
  HomeScreen,
  IVRListScreen,
  InsuranceVerificationScreen,
  OrderCreationScreen,
  OrdersScreen,
  OrderDetailsScreen,
  ProfileScreen,
  SuccessScreen,
  IVRHistoryScreen,
  IVRDetailScreen,
  AccountInformationScreen,
  ChangePasswordScreen,
  HelpSupportScreen,
  CMSPageScreen,
} from '../screens';

// Import tab icons
const tabIcons = {
  Home: {
    default: require('../assets/icons/home.png'),
    active: require('../assets/icons/home_filled.png'),
  },
  IVR: {
    default: require('../assets/icons/ivr.png'),
    active: require('../assets/icons/ivr.png'),
  },
  Orders: {
    default: require('../assets/icons/orders.png'),
    active: require('../assets/icons/orders.png'),
  },
  Profile: {
    default: require('../assets/icons/profile.png'),
    active: require('../assets/icons/profile.png'),
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const iconSet = tabIcons[route.name];
          const iconSource = focused ? iconSet.active : iconSet.default;
          return (
            <Image
              source={iconSource}
              style={[
                styles.tabIcon,
                { tintColor: focused ? '#0089FF' : '#6C7490' },
              ]}
              resizeMode="contain"
            />
          );
        },
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? '#0089FF' : '#6C7490' },
              focused && { fontWeight: '500' },
            ]}
          >
            {route.name}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="IVR" component={IVRListScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Loading Screen
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0089FF" />
  </View>
);

// Main Stack Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();

  const handleInactivityTimeout = useCallback(() => {
    Alert.alert(
      'Session Expired',
      'You have been logged out due to inactivity.',
      [{ text: 'OK', onPress: () => logout() }],
      { cancelable: false },
    );
  }, [logout]);

  const panHandlers = useInactivityTimeout(
    isAuthenticated ? handleInactivityTimeout : null,
  );

  if (isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <View style={{ flex: 1 }} {...panHandlers}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="InsuranceVerification"
              component={InsuranceVerificationScreen}
            />
            <Stack.Screen
              name="OrderCreation"
              component={OrderCreationScreen}
            />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
            />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="IVRHistory" component={IVRHistoryScreen} />
            <Stack.Screen name="IVRDetail" component={IVRDetailScreen} />
            <Stack.Screen name="AccountInformation" component={AccountInformationScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="CMSPage" component={CMSPageScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D6DCE8',
    height: 81,
    paddingTop: 8,
    paddingBottom: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabIcon: {
    width: 18,
    height: 18,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;

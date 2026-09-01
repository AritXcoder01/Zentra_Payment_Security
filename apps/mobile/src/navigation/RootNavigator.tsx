import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { FraudStackNavigator } from './FraudStackNavigator';
import { TransactionDetailScreen } from '../screens/activity/TransactionDetailScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { DevicesSessionsScreen } from '../screens/profile/DevicesSessionsScreen';
import { HelpEmergencyScreen } from '../screens/help/HelpEmergencyScreen';
import { FraudReportHistoryScreen } from '../screens/profile/FraudReportHistoryScreen';
import { FraudReportDetailScreen } from '../screens/profile/FraudReportDetailScreen';
import { colors } from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="FraudStack" component={FraudStackNavigator} />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
          options={{
            headerShown: true,
            title: 'Transaction Details',
            headerStyle: { backgroundColor: colors.base.background },
            headerTintColor: colors.primary.main,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            headerShown: true,
            title: 'Edit Profile',
            headerStyle: { backgroundColor: colors.base.background },
            headerTintColor: colors.primary.main,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="DevicesSessions"
          component={DevicesSessionsScreen}
          options={{
            headerShown: true,
            title: 'Devices & Sessions',
            headerStyle: { backgroundColor: colors.base.background },
            headerTintColor: colors.primary.main,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="HelpEmergency"
          component={HelpEmergencyScreen}
          options={{
            headerShown: true,
            title: 'Emergency Help',
            headerStyle: { backgroundColor: colors.base.background },
            headerTintColor: colors.primary.main,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="FraudReportHistory"
          component={FraudReportHistoryScreen}
          options={{
            headerShown: true,
            title: 'Fraud Report History',
            headerStyle: { backgroundColor: colors.base.background },
            headerTintColor: colors.primary.main,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="FraudReportDetail"
          component={FraudReportDetailScreen}
          options={{
            headerShown: true,
            title: 'Fraud Report Details',
            headerStyle: { backgroundColor: colors.base.background },
            headerTintColor: colors.primary.main,
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

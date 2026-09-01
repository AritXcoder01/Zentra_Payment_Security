import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ActivityScreen } from '../screens/activity/ActivityScreen';
import { SafetyScreen } from '../screens/safety/SafetyScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Icon } from '../components/Icon';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary.main,
        tabBarInactiveTintColor: colors.base.textMuted,
        tabBarStyle: {
          backgroundColor: colors.base.white,
          borderTopColor: colors.base.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color }) => <Icon name="activity" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="SafetyTab"
        component={SafetyScreen}
        options={{
          tabBarLabel: 'Safety',
          tabBarIcon: ({ color }) => <Icon name="safety" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color }) => <Icon name="alerts" size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="profile" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

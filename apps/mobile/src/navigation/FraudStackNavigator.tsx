import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FraudStackParamList } from './types';
import { FraudLandingScreen } from '../screens/fraud/FraudLandingScreen';
import { PaymentModeScreen } from '../screens/fraud/PaymentModeScreen';
import { IncidentDetailsScreen } from '../screens/fraud/IncidentDetailsScreen';
import { ReviewReportScreen } from '../screens/fraud/ReviewReportScreen';
import { IncidentGuidanceScreen } from '../screens/fraud/IncidentGuidanceScreen';
import { colors } from '../theme';

const Stack = createStackNavigator<FraudStackParamList>();

export const FraudStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.base.background },
        headerTintColor: colors.primary.main,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="FraudLanding"
        component={FraudLandingScreen}
        options={{ title: 'Report Fraud' }}
      />
      <Stack.Screen
        name="PaymentMode"
        component={PaymentModeScreen}
        options={{ title: 'Payment Channel' }}
      />
      <Stack.Screen
        name="IncidentDetails"
        component={IncidentDetailsScreen}
        options={{ title: 'Incident Details' }}
      />
      <Stack.Screen
        name="ReviewReport"
        component={ReviewReportScreen}
        options={{ title: 'Review Report' }}
      />
      <Stack.Screen
        name="IncidentGuidance"
        component={IncidentGuidanceScreen}
        options={{ title: 'Guidance & Support', headerLeft: () => null }}
      />
    </Stack.Navigator>
  );
};

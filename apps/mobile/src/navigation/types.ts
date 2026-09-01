export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  OtpVerification: { mobileNumber: string; demoOtp?: string };
  Registration: { registrationToken: string; mobileNumber: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  ActivityTab: undefined;
  SafetyTab: undefined;
  AlertsTab: undefined;
  ProfileTab: undefined;
};

export type FraudStackParamList = {
  FraudLanding: { transactionId?: string };
  PaymentMode: { categoryId: string; categoryName: string };
  IncidentDetails: { categoryId: string; paymentMode: string };
  ReviewReport: {
    categoryId: string;
    paymentMode: string;
    amount: number;
    incidentDate: string;
    description: string;
    transactionReference?: string;
  };
  IncidentGuidance: { reportId?: string; categoryId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  FraudStack: { screen: keyof FraudStackParamList; params?: any };
  TransactionDetail: { transaction: any };
  EditProfile: undefined;
  DevicesSessions: undefined;
  HelpEmergency: undefined;
  FraudReportHistory: undefined;
  FraudReportDetail: { reportId: string };
};

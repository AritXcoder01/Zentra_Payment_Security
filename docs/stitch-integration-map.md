# Zentra — Google Stitch Design Integration Map

This document maps Google Stitch HTML/UI export screens to React Native CLI components and backend API endpoints in `apps/mobile/`.

## Screen Mapping Matrix

| Stitch Screen Directory | Target React Native Screen | Reusable Components Used | Backend API Endpoint | Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| `splash_screen` | `SplashScreen` | `Logo`, `StatusChip` | None | IMPLEMENTED |
| `onboarding_1` | `OnboardingScreen` | `PrimaryButton`, `IndicatorDots` | None (Local Storage) | IMPLEMENTED |
| `login` | `LoginScreen` | `AppTextInput`, `PrimaryButton` | `POST /api/v1/auth/request-otp` | IMPLEMENTED |
| `otp_verification` | `OtpVerificationScreen` | `OtpInput`, `PrimaryButton` | `POST /api/v1/auth/verify-otp` | IMPLEMENTED |
| `registration` | `RegistrationScreen` | `AppTextInput`, `PrimaryButton` | `POST /api/v1/auth/register/complete` | IMPLEMENTED |
| `home_dashboard` | `HomeScreen` | `GlassCard`, `SecurityStatusCard`, `QuickAction` | `GET /api/v1/users/me` | IMPLEMENTED |
| `activity` | `ActivityScreen` | `TransactionCard`, `EmptyState`, `SearchInput` | `GET /api/v1/transactions` (Backend Gap) | IMPLEMENTED (Empty State) |
| `transaction_detail` | `TransactionDetailScreen` | `GlassCard`, `DangerButton`, `StatusChip` | None | IMPLEMENTED |
| `security_center` | `SafetyScreen` | `GlassCard`, `SecurityStatusCard` | Educational Guidance | IMPLEMENTED |
| `security_alerts` | `AlertsScreen` | `AlertCard`, `EmptyState` | `GET /api/v1/security-alerts` (Backend Gap) | IMPLEMENTED (Empty State) |
| `profile` | `ProfileScreen` | `ProfileRow`, `PrimaryButton`, `DangerButton` | `GET /api/v1/users/me` | IMPLEMENTED |
| `edit_profile` | `EditProfileScreen` | `AppTextInput`, `PrimaryButton` | `PATCH /api/v1/users/me` | IMPLEMENTED |
| `delete_account_confirmation` | `DeleteAccountModal` | `ConfirmationModal`, `DangerButton` | `DELETE /api/v1/users/me` | IMPLEMENTED |
| `fraud_report_landing` | `FraudLandingScreen` | `GlassCard`, `PrimaryButton` | None | IMPLEMENTED |
| `select_payment_mode` | `PaymentModeScreen` | `SelectableCard`, `PrimaryButton` | None | IMPLEMENTED |
| `incident_details` | `IncidentDetailsScreen` | `AppTextInput`, `PrimaryButton` | None | IMPLEMENTED |
| `review_report` | `ReviewReportScreen` | `GlassCard`, `PrimaryButton` | `POST /api/v1/fraud/reports` (Backend Gap) | IMPLEMENTED |
| `recommended_next_steps` | `IncidentGuidanceScreen` | `ResourceCard`, `GlassCard` | `GET /api/v1/resources` (Backend Gap) | IMPLEMENTED |
| `help_emergency` | `HelpEmergencyScreen` | `ResourceCard`, `GlassCard` | Educational / Help Matrix | IMPLEMENTED |
| `devices_sessions` | `DevicesSessionsScreen` | `GlassCard`, `EmptyState` | `GET /api/v1/sessions` (Backend Gap) | IMPLEMENTED (Empty State) |

## Design Tokens & Color Palette
- **Primary**: Deep/Dark Blue (`#0F172A`, `#020617`, `#1E293B`)
- **Secondary Accent**: Light Blue (`#0284C7`, `#38BDF8`, `#E0F2FE`)
- **Base Surface**: Clean White (`#FFFFFF`, `#F8FAFC`, `#E2E8F0`)
- **Glassmorphism**: Translucent white backdrop (`rgba(255, 255, 255, 0.85)`), subtle light border (`rgba(255, 255, 255, 0.4)`), soft shadow (`rgba(15, 23, 42, 0.08)`).

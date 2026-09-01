# Zentra — Academic UML Use Case Specification & Diagram Suite

This document provides the authoritative academic UML Use Case Diagrams, Use Case Specifications, Actor Descriptions, and Implementation Traceability for the Zentra payment security system.

---

## 1. Actor Identification Summary

| Actor Name | Type | Role & System Interaction Description |
|---|---|---|
| **Zentra User** | Primary Human Actor | Registered Android application user who authenticates via mobile OTP, views financial summaries, manages sessions, enables payment detection, and reports fraud incidents. |
| **Android OS** | System Actor | Provides Android `NotificationListenerService` bindings, permission toggles, system notifications, and hardware Android KeyStore cryptography services. |
| **Official External Services** | External Actor | Represents external government helplines (`1930`), reporting portals (`cybercrime.gov.in`), and complaint systems (`RBI CMS`, `Chakshu`). *Note: Zentra provides direct verified links; users manually initiate calls/visits.* |

---

## 2. High-Resolution Visual Diagram Assets

- **Full Technical Use Case SVG**: [`docs/uml/zentra_use_case_full.svg`](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_use_case_full.svg)
- **Full Technical Use Case PNG**: [`docs/uml/zentra_use_case_full.png`](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_use_case_full.png)
- **Presentation Use Case SVG**: [`docs/uml/zentra_use_case_presentation.svg`](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_use_case_presentation.svg)
- **Presentation Use Case PNG**: [`docs/uml/zentra_use_case_presentation.png`](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_use_case_presentation.png)

---

## 3. Version A — Full Technical Use Case Diagram (PlantUML Source)

```plantuml
@startuml Zentra_Full_Use_Case_Diagram
skinparam backgroundColor white
skinparam packageStyle rectangle
skinparam shadowing false
skinparam actorStyle stickman

left to right direction

actor "Zentra User" as User
actor "Android OS" as AndroidOS
actor "Official External Services" as ExternalGov

rectangle "ZENTRA PAYMENT SECURITY SYSTEM" {
    
    package "AUTHENTICATION" {
        usecase UC_Register as "Register Account"
        usecase UC_Login as "Login with Mobile Number"
        usecase UC_ReqOTP as "Request & Verify OTP"
        usecase UC_Logout as "Logout"
        usecase UC_DeleteAcc as "Delete Account"
    }
    
    package "TRANSACTIONS" {
        usecase UC_Home as "View Home Dashboard"
        usecase UC_TxnAct as "View Transaction Activity"
        usecase UC_TxnDet as "View Transaction Details"
        usecase UC_AddDemo as "Add Demo Transaction\n<<development/demo>>"
    }
    
    package "PAYMENT ACTIVITY DETECTION" {
        usecase UC_NotifConsent as "Manage Notification Access"
        usecase UC_DetectEvent as "Detect Eligible Payment Notification"
        usecase UC_ReviewCandidate as "Review Possible Payment"
        usecase UC_AddCandidate as "Add Detected Transaction"
    }
    
    package "FRAUD ASSISTANCE" {
        usecase UC_ReportFraud as "Report Payment Fraud"
        usecase UC_SubmitFraud as "Submit Report to Zentra"
        usecase UC_ViewActions as "View Recommended Actions"
        usecase UC_AccessOfficial as "Access Verified Official Resource"
        usecase UC_FraudHist as "View Fraud Report History"
    }
    
    package "SAFETY & ALERTS" {
        usecase UC_SafetyCenter as "View Safety Center"
        usecase UC_ViewAlerts as "View Security Alerts"
    }
    
    package "PROFILE & SESSIONS" {
        usecase UC_EditProf as "View & Edit Profile"
        usecase UC_ViewSess as "View & Revoke Sessions"
    }
}

' User Associations
User -- UC_Register
User -- UC_Login
User -- UC_Logout
User -- UC_DeleteAcc
User -- UC_Home
User -- UC_TxnAct
User -- UC_TxnDet
User -- UC_AddDemo
User -- UC_NotifConsent
User -- UC_ReviewCandidate
User -- UC_ReportFraud
User -- UC_FraudHist
User -- UC_SafetyCenter
User -- UC_ViewAlerts
User -- UC_EditProf
User -- UC_ViewSess

' Android OS Associations
AndroidOS -- UC_NotifConsent
AndroidOS -- UC_DetectEvent

' External Services Associations
ExternalGov -- UC_AccessOfficial

' Relationships: Includes & Extends
UC_Register ..> UC_ReqOTP : <<include>>
UC_Login ..> UC_ReqOTP : <<include>>

UC_DetectEvent ..> UC_AddCandidate : <<extend>>
UC_DetectEvent ..> UC_ReviewCandidate : <<extend>>

UC_ReportFraud ..> UC_SubmitFraud : <<include>>
UC_ReportFraud ..> UC_ViewActions : <<include>>

UC_AccessOfficial ..> UC_ViewActions : <<extend>>

@enduml
```

---

## 4. Version B — Presentation Use Case Diagram (PPT / Viva Simplified)

```plantuml
@startuml Zentra_Presentation_Use_Case_Diagram
skinparam backgroundColor white
skinparam packageStyle rectangle
skinparam shadowing false
skinparam actorStyle stickman

left to right direction

actor "Zentra User" as User
actor "Android OS" as AndroidOS
actor "Official External Services" as ExternalGov

rectangle "ZENTRA PAYMENT SECURITY SYSTEM" {
    usecase UC_Auth as "Register / Login"
    usecase UC_Txn as "View Dashboard & Activity"
    usecase UC_Detect as "Payment Activity Detection"
    usecase UC_Fraud as "Report Payment Fraud"
    usecase UC_Guidance as "View Action Guidance"
    usecase UC_AccessGov as "Access Official Resource"
    usecase UC_History as "View Fraud Report History"
    usecase UC_Alerts as "View Security Alerts"
    usecase UC_Profile as "Manage Profile & Sessions"
}

User -- UC_Auth
User -- UC_Txn
User -- UC_Detect
User -- UC_Fraud
User -- UC_History
User -- UC_Alerts
User -- UC_Profile

AndroidOS -- UC_Detect

UC_Fraud ..> UC_Guidance : <<include>>
UC_AccessGov ..> UC_Guidance : <<extend>>
ExternalGov -- UC_AccessGov

@enduml
```

---

## 5. Use Case Specification Table

| Use Case ID | Use Case Name | Primary Actor | Preconditions | Main Outcome / Postcondition |
|---|---|---|---|---|
| **UC-01** | Register Account | Zentra User | App installed, valid Indian mobile number | New user account created, JWT session tokens issued. |
| **UC-02** | Login with Mobile | Zentra User | Registered account exists | 6-digit OTP validated, JWT access token & 30-day refresh token stored in Keystore. |
| **UC-03** | View Transactions | Zentra User | Authenticated session | Paginated transaction activity list loaded with exact 2-decimal amounts. |
| **UC-04** | Enable Payment Detection | Zentra User | NotificationListener permission granted | On-device Regex parser listens for bank payment alerts; parses candidates locally. |
| **UC-05** | Report Payment Fraud | Zentra User | Authenticated session | Fraud incident saved in Zentra database; deterministic guidance displayed. |
| **UC-06** | Access Official Resource | Zentra User | Incident guidance viewed | Direct dialing (`1930`) or web portal navigation (`cybercrime.gov.in`) initiated safely. |
| **UC-07** | View Fraud History | Zentra User | Authenticated session | Historical Zentra fraud submissions & timelines loaded. |
| **UC-08** | Manage Sessions | Zentra User | Authenticated session | Active hardware devices listed; revoked sessions terminated immediately. |
| **UC-09** | Edit Profile | Zentra User | Authenticated session | User full name and email updated in database. Mobile number remains immutable. |

---

## 6. Implementation Traceability Matrix

| Use Case Name | Mobile UI Screen (`apps/mobile/src/screens/`) | Backend Service (`apps/api/src/modules/`) |
|---|---|---|
| Register Account | `LoginScreen.tsx`, `OtpScreen.tsx`, `RegistrationScreen.tsx` | `AuthModule` (`auth.service.ts`) |
| Login with Mobile | `LoginScreen.tsx`, `OtpScreen.tsx` | `AuthModule` (`auth.service.ts`) |
| View Transactions | `HomeScreen.tsx`, `ActivityScreen.tsx`, `TransactionDetailScreen.tsx` | `TransactionsModule` (`transactions.service.ts`) |
| Payment Detection | `SafetyScreen.tsx`, `NotificationBridgeService.ts` | `TransactionsModule` (`transactions.service.ts`) |
| Report Fraud | `IncidentLandingScreen.tsx`, `IncidentDetailsScreen.tsx`, `IncidentGuidanceScreen.tsx` | `FraudModule` (`fraud.service.ts`) |
| View Fraud History | `ProfileScreen.tsx`, `FraudReportHistoryScreen.tsx`, `FraudReportDetailScreen.tsx` | `FraudModule` (`fraud.service.ts`) |
| Manage Sessions | `SessionsScreen.tsx` | `SessionsModule` (`sessions.service.ts`) |
| Edit Profile | `EditProfileScreen.tsx` | `UsersModule` (`users.service.ts`) |

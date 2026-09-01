# Zentra — Mobile API Contract Map

This document defines the verified REST API contracts between the NestJS backend (`apps/api`) and the React Native mobile client (`apps/mobile`).

---

## 1. Authentication Module (`/api/v1/auth`)

### 1.1 Request OTP
* **Method**: `POST`
* **Path**: `/api/v1/auth/request-otp`
* **Authentication**: None (Public)
* **Request Body**:
  ```json
  {
    "mobileNumber": "+919876543210"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "If this number can receive an OTP, a verification code has been sent.",
    "demoOtp": "123456" // Returned only in mock/demo mode
  }
  ```
* **Consumed By**: `LoginScreen`

### 1.2 Verify OTP
* **Method**: `POST`
* **Path**: `/api/v1/auth/verify-otp`
* **Authentication**: None (Public)
* **Request Body**:
  ```json
  {
    "mobileNumber": "+919876543210",
    "otp": "123456"
  }
  ```
* **Response (200 OK - Returning User)**:
  ```json
  {
    "isNewUser": false,
    "tokens": {
      "accessToken": "jwt_access_token_string",
      "refreshToken": "raw_hex_refresh_token",
      "tokenType": "Bearer",
      "expiresInSeconds": 900
    },
    "user": {
      "id": "uuid",
      "mobileNumber": "+919876543210",
      "email": "user@example.com",
      "fullName": "Jane Doe",
      "accountStatus": "ACTIVE",
      "createdAt": "2026-08-26T15:00:00.000Z",
      "lastLoginAt": "2026-08-26T15:30:00.000Z"
    }
  }
  ```
* **Response (200 OK - New User)**:
  ```json
  {
    "isNewUser": true,
    "registrationToken": "jwt_short_lived_registration_token",
    "message": "OTP verified. Please complete registration by providing your email and name."
  }
  ```
* **Consumed By**: `OtpVerificationScreen`

### 1.3 Complete Registration
* **Method**: `POST`
* **Path**: `/api/v1/auth/register/complete`
* **Authentication**: None (Public - registrationToken payload)
* **Request Body**:
  ```json
  {
    "registrationToken": "jwt_short_lived_registration_token",
    "fullName": "Jane Doe",
    "email": "jane@example.com"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "tokens": {
      "accessToken": "jwt_access_token_string",
      "refreshToken": "raw_hex_refresh_token",
      "tokenType": "Bearer",
      "expiresInSeconds": 900
    },
    "user": {
      "id": "uuid",
      "mobileNumber": "+919876543210",
      "email": "jane@example.com",
      "fullName": "Jane Doe",
      "accountStatus": "ACTIVE",
      "createdAt": "2026-08-26T15:00:00.000Z"
    }
  }
  ```
* **Consumed By**: `RegistrationScreen`

### 1.4 Refresh Token
* **Method**: `POST`
* **Path**: `/api/v1/auth/refresh`
* **Authentication**: None (RefreshToken payload)
* **Request Body**:
  ```json
  {
    "refreshToken": "raw_hex_refresh_token"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_rotated_hex_refresh_token",
    "tokenType": "Bearer",
    "expiresInSeconds": 900
  }
  ```
* **Consumed By**: `ApiClient.ts` (Automatic 401 retry interceptor)

### 1.5 Logout
* **Method**: `POST`
* **Path**: `/api/v1/auth/logout`
* **Authentication**: Bearer Token
* **Request Body**:
  ```json
  {
    "refreshToken": "raw_hex_refresh_token"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully logged out"
  }
  ```
* **Consumed By**: `ProfileScreen`

---

## 2. User Profile Module (`/api/v1/users`)

### 2.1 Get Current Profile
* **Method**: `GET`
* **Path**: `/api/v1/users/me`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
  ```json
  {
    "id": "uuid",
    "mobileNumber": "+919876543210",
    "email": "jane@example.com",
    "fullName": "Jane Doe",
    "profilePhoto": null,
    "accountStatus": "ACTIVE",
    "createdAt": "2026-08-26T15:00:00.000Z",
    "lastLoginAt": "2026-08-26T15:30:00.000Z"
  }
  ```
* **Consumed By**: `HomeScreen`, `ProfileScreen`, `EditProfileScreen`

### 2.2 Update Profile
* **Method**: `PATCH`
* **Path**: `/api/v1/users/me`
* **Authentication**: Bearer Token
* **Request Body**:
  ```json
  {
    "fullName": "Jane Updated Doe",
    "email": "jane.updated@example.com"
  }
  ```
* **Response (200 OK)**: Updated user object.
* **Consumed By**: `EditProfileScreen`

### 2.3 Delete Account
* **Method**: `DELETE`
* **Path**: `/api/v1/users/me`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Account successfully deleted"
  }
  ```
* **Consumed By**: `ProfileScreen`

---

## 3. Transactions Module (`/api/v1/transactions`)

### 3.1 Record Transaction
* **Method**: `POST`
* **Path**: `/api/v1/transactions`
* **Authentication**: Bearer Token
* **Request Body**:
  ```json
  {
    "transactionType": "DEBIT",
    "amount": 1500.50,
    "currency": "INR",
    "transactionReference": "UPI/1234567890/PAY",
    "merchantName": "Starbucks Coffee",
    "merchantVpa": "starbucks@upi",
    "accountMask": "XX1234",
    "transactionDate": "2026-08-26T14:30:00.000Z",
    "source": "MANUAL"
  }
  ```
* **Response (201 Created)**: Transaction object.
* **Consumed By**: Demo Mode Quick Add Transaction Helper

### 3.2 List Transactions
* **Method**: `GET`
* **Path**: `/api/v1/transactions?type=DEBIT&search=starbucks&page=1&limit=20`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "userId": "uuid",
        "transactionType": "DEBIT",
        "amount": "1500.50",
        "currency": "INR",
        "transactionReference": "UPI/1234567890/PAY",
        "merchantName": "Starbucks Coffee",
        "merchantVpa": "starbucks@upi",
        "accountMask": "XX1234",
        "transactionDate": "2026-08-26T14:30:00.000Z",
        "source": "MANUAL",
        "createdAt": "2026-08-26T14:30:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```
* **Consumed By**: `HomeScreen` (Recent activity), `ActivityScreen`

### 3.3 Financial Activity Summary
* **Method**: `GET`
* **Path**: `/api/v1/transactions/summary`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
  ```json
  {
    "moneyIn": 5000.00,
    "moneyOut": 1500.50,
    "transactionCount": 2
  }
  ```
* **Consumed By**: `HomeScreen` (Balance summary card)

### 3.4 Single Transaction Details
* **Method**: `GET`
* **Path**: `/api/v1/transactions/:id`
* **Authentication**: Bearer Token
* **Response (200 OK)**: Transaction object.
* **Consumed By**: `TransactionDetailScreen`

---

## 4. Fraud Module (`/api/v1/fraud`)

### 4.1 Get Fraud Categories
* **Method**: `GET`
* **Path**: `/api/v1/fraud/categories`
* **Authentication**: None / Public
* **Response (200 OK)**: Array of category objects (`id`, `code`, `name`, `description`, `severity`).
* **Consumed By**: `FraudLandingScreen`

### 4.2 Submit Fraud Report
* **Method**: `POST`
* **Path**: `/api/v1/fraud/reports`
* **Authentication**: Bearer Token
* **Request Body**:
  ```json
  {
    "fraudCategory": "UPI_FRAUD",
    "paymentMode": "UPI",
    "amount": 2500.00,
    "incidentDate": "2026-08-26",
    "description": "Received fake QR collect request pretending to be a buyer.",
    "transactionReference": "UPI/987654321/QR",
    "relatedTransactionId": "tx_uuid_optional"
  }
  ```
* **Response (201 Created)**: Fraud report object containing assigned `id`.
* **Consumed By**: `ReviewReportScreen`

### 4.3 Get Fraud Reports List
* **Method**: `GET`
* **Path**: `/api/v1/fraud/reports`
* **Authentication**: Bearer Token
* **Response (200 OK)**: Array of user fraud report objects.
* **Consumed By**: Fraud history tracking

### 4.4 Get Fraud Report Details & Guidance
* **Method**: `GET`
* **Path**: `/api/v1/fraud/reports/:id/guidance`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
  ```json
  {
    "reportCategory": "UPI_FRAUD",
    "paymentMode": "UPI",
    "severity": "HIGH",
    "immediateActions": [
      "Contact your bank or payment provider support immediately to report the transaction.",
      "Update your UPI PIN and credentials right away."
    ],
    "safetyRecommendations": [
      "Remember: Entering your UPI PIN is ONLY for transferring money OUT of your account, NEVER for receiving money."
    ],
    "officialResources": []
  }
  ```
* **Consumed By**: `IncidentGuidanceScreen`

---

## 5. Official Resources Module (`/api/v1/resources`)

### 5.1 List Verified Resources
* **Method**: `GET`
* **Path**: `/api/v1/resources?fraudCategory=UPI_FRAUD&paymentMode=UPI`
* **Authentication**: None / Public
* **Response (200 OK)**: Array of verified official resources (`[]` when no verified resources are seeded).
* **Consumed By**: `IncidentGuidanceScreen`, `HelpEmergencyScreen`

---

## 6. Security Alerts Module (`/api/v1/security-alerts`)

### 6.1 List User Security Alerts
* **Method**: `GET`
* **Path**: `/api/v1/security-alerts`
* **Authentication**: Bearer Token
* **Response (200 OK)**: Array of alert objects (`id`, `alertType`, `severity`, `title`, `message`, `isRead`, `createdAt`).
* **Consumed By**: `AlertsScreen`, `HomeScreen`

### 6.2 Mark Alert as Read
* **Method**: `PATCH`
* **Path**: `/api/v1/security-alerts/:id/read`
* **Authentication**: Bearer Token
* **Response (200 OK)**: `{ "success": true, "message": "Alert marked as read" }`
* **Consumed By**: `AlertsScreen`

---

## 7. Sessions Module (`/api/v1/sessions`)

### 7.1 List Active & Historical Sessions
* **Method**: `GET`
* **Path**: `/api/v1/sessions`
* **Authentication**: Bearer Token
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "status": "ACTIVE",
      "createdAt": "2026-08-26T15:00:00.000Z",
      "lastUsedAt": "2026-08-26T15:30:00.000Z",
      "expiresAt": "2026-09-25T15:00:00.000Z",
      "currentSession": true,
      "device": null
    }
  ]
  ```
* **Consumed By**: `DevicesSessionsScreen`

### 7.2 Revoke Session
* **Method**: `POST`
* **Path**: `/api/v1/sessions/:id/revoke`
* **Authentication**: Bearer Token
* **Response (200 OK)**: `{ "success": true, "message": "Session successfully revoked" }`
* **Consumed By**: `DevicesSessionsScreen`

### 7.3 Sign Out Other Sessions
* **Method**: `POST`
* **Path**: `/api/v1/sessions/revoke-others`
* **Authentication**: Bearer Token
* **Response (201 Created)**: `{ "success": true, "count": 2, "message": "Successfully revoked 2 other active session(s)" }`
* **Consumed By**: `DevicesSessionsScreen`

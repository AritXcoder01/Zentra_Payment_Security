# Zentra — System Architecture & Component Diagram

This document contains the verified system architecture, component relationships, data flow pipelines, and security boundaries of the Zentra application.

---

## 1. High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph MobileDevice["📱 Android Mobile Device (Physical Android 13/14)"]
        subgraph NativeLayer["Native Android Layer (Kotlin)"]
            NLS["ZentraNotificationListenerService<br/>(System Service Binding)"]
            NLM["NotificationListenerModule<br/>(Native Bridge)"]
            Keystore["Android KeyStore<br/>(AES-256-GCM Encryption)"]
            EncryptedPrefs["Encrypted Native Queue<br/>(zentra_native_notifications_secure)"]
        end

        subgraph RNLayer["React Native JS Runtime (React 18.2 / RN 0.73.2)"]
            UI["UI Components & Navigation<br/>(Home, Activity, Fraud, Safety, Profile)"]
            NPService["NotificationParserService<br/>(Local Regex Engine)"]
            NBService["NotificationBridgeService<br/>(Queue & Dedup Controller)"]
            DedupCache["Persistent Dedup Cache<br/>(SHA-256 Fingerprint Hashes)"]
            ApiClient["ApiClient<br/>(Axios / Auth Interceptors)"]
            KeyStorage["SecureAuthStorage<br/>(Keychain Keystore Bridge)"]
        end
    end

    subgraph BackendInfrastructure["⚡ NestJS Backend API & Data Tier (Port 3000)"]
        subgraph NestJS["NestJS Application Engine"]
            GlobalGuard["JwtAuthGuard / RolesGuard"]
            DtoVal["class-validator & DTO Transformer"]
            
            subgraph Modules["API Business Modules"]
                AuthMod["AuthModule<br/>(OTP, JWT, Refresh Rotation)"]
                TxnMod["TransactionsModule<br/>(Prisma Decimal, Analytics)"]
                FraudMod["FraudModule<br/>(Incident Reports, Guidance)"]
                ResMod["ResourcesModule<br/>(Verified Official Action Links)"]
                SafetyMod["Safety & SessionsModule<br/>(Session Revocation, Alerts)"]
                AuditMod["AuditService<br/>(Immutable Security Logging)"]
            end
        end

        subgraph DataStores["Persistence Tier"]
            Prisma["Prisma ORM<br/>(Parameterized Queries)"]
            PostgreSQL[("PostgreSQL Database<br/>(numeric(12,2) Precision)")]
            Redis[("Redis Cache<br/>(SHA-256 OTP Hashes & Rate Limits)")]
        end
    end

    %% Event & Data Flow Connections
    NLS -->|1. Event Broadcast| NLM
    NLS -->|2. JS Process Dead: Encrypt Safe Candidate| Keystore
    Keystore --> EncryptedPrefs
    EncryptedPrefs -->|3. On App Launch Flush| NLM
    NLM -->|4. Pass Filtered Text| NPService
    NPService -->|5. SHA-256 Hashed Fingerprint| DedupCache
    NPService -->|6. High-Confidence Candidate| NBService
    NBService -->|7. Secure Transport DTO| ApiClient
    
    ApiClient -->|8. HTTP Bearer JWT| GlobalGuard
    GlobalGuard --> DtoVal
    DtoVal --> Modules
    
    AuthMod -->|OTP Rate Limits & Hashes| Redis
    AuthMod -->|Session Tokens| Prisma
    TxnMod -->|Prisma.Decimal Transport| Prisma
    FraudMod -->|Incident Records| Prisma
    SafetyMod -->|Active Sessions| Prisma
    AuditMod -->|Security Audit Logs| Prisma
    
    Prisma -->|Raw SQL Prepared Statements| PostgreSQL
```

---

## 2. On-Device Notification Ingestion & Privacy Architecture

```mermaid
sequenceDiagram
    autonumber
    participant System as Android Notification System
    participant NLS as ZentraNotificationListenerService (Kotlin)
    participant Keystore as Android KeyStore (AES-256-GCM)
    participant NativeStore as Encrypted SharedPreferences
    participant RN as NotificationParserService (TypeScript)
    participant API as NestJS /transactions API

    System->>NLS: System Notification Posted (Title, Text, App)
    NLS->>NLS: Apply Native Exclusion Filter (OTP, Promo, Loan, KYC, Failed)
    alt Unrelated / OTP / Promo
        NLS-->>NLS: Drop Notification Immediately (Zero Log)
    else Financial Payment Notification
        alt React Native JS Runtime ALIVE
            NLS->>RN: Emit Event (sendNotificationEvent)
        else React Native JS Runtime DEAD / DISCONNECTED
            NLS->>Keystore: Encrypt Safe Candidate Metadata (NO Raw Text)
            Keystore-->>NativeStore: Persist AES-256 Encrypted Candidate JSON
        end
    end

    Note over RN: App Launch / Resume
    RN->>NLS: Flush getPendingNativeNotifications()
    NLS->>NativeStore: Decrypt AES-256 Queue & Return Safe JSON
    NativeStore-->>RN: Safe Candidate Array

    RN->>RN: Parse Amount ("1500.00"), Reference, Merchant, Type
    RN->>RN: Compute SHA-256(FingerprintString)
    alt Duplicate SHA-256 Hash in Dedup Store (< 48h)
        RN-->>RN: Ignore Duplicate
    else New High-Confidence Candidate
        RN->>API: POST /transactions ("amount": "1500.00", "source": "NOTIFICATION")
        API-->>RN: 201 Created (Transaction Logged)
    end
```

---

## 3. End-to-End Authentication & Refresh Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    participant User as Mobile User
    participant App as React Native Mobile App
    participant Auth as AuthService (NestJS)
    participant Redis as Redis Cache
    participant DB as PostgreSQL (Prisma)

    User->>App: Enter Mobile Number (e.g. 9876543210)
    App->>Auth: POST /auth/request-otp { mobileNumber }
    Auth->>Redis: Check Rate Limit & Save SHA-256(OTP) Hash (5m TTL)
    Auth-->>App: { success: true, demoOtp: "123456" }

    User->>App: Enter OTP ("123456")
    App->>Auth: POST /auth/verify-otp { mobileNumber, otp }
    Auth->>Redis: Verify SHA-256(OTP) Hash
    Auth->>DB: Query User & Create Active Session
    DB-->>Auth: Session Entity
    Auth-->>App: { accessToken (15m), refreshToken (30d), user }

    Note over App: 15 Minutes Pass (Access Token Expired)

    App->>Auth: POST /auth/refresh { refreshToken }
    Auth->>DB: Lookup Session by SHA-256(refreshToken)
    alt Session Active & Token Valid
        Auth->>DB: Revoke Old Session & Issue New Session
        Auth-->>App: { accessToken (New 15m), refreshToken (New 30d) }
    else Reuse of Old Revoked Refresh Token Detected
        Auth->>DB: SECURITY ALERT: Revoke ALL User Sessions
        Auth-->>App: 401 Unauthorized (Force Logout)
    end
```

---

## 4. Key Security & Boundary Specifications

| Security Boundary | Verified Technical Control |
|---|---|
| **SMS Permissions** | **STRICTLY ABSENT**. Zero `READ_SMS` or `RECEIVE_SMS` manifest permissions. |
| **Notification Privacy** | 100% On-Device local parsing. Zero raw title, text, or payload transmitted to API. |
| **Native Queue Security** | AES-256-GCM encryption using an Android Keystore-managed key (`NativeKeystoreHelper`). |
| **Deduplication Privacy** | SHA-256 hashed fingerprints stored on-device. Zero plaintext amounts/references stored in dedup cache. |
| **Financial Decimal Precision** | Exact string transport (`"1500.75"`), `Prisma.Decimal`, PostgreSQL `numeric(12,2)` column. |
| **Token Storage** | Android Keystore hardware-backed storage via `react-native-keychain`. Zero tokens in `AsyncStorage`. |
| **User Data Isolation** | NestJS Prisma `where: { userId }` filters on all endpoints. Cross-account access returns `404 Not Found`. |
| **Official Emergency Links** | Verified links (`1930`, `cybercrime.gov.in`, `RBI CMS`). Strict `https://` & `tel:` scheme validation. |

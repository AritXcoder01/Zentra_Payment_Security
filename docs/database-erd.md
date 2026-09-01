# Zentra — Final Database Entity Relationship Diagram (ERD) & Specification

This document provides the authoritative Entity-Relationship Diagram (ERD), schema topology, relationship cardinality matrix, and security specifications for the Zentra payment security system.

---

## 1. Executive Summary & Domain Scope

The Zentra relational database schema is managed via **Prisma ORM** targeting **PostgreSQL**. The schema consists of **10 Domain Entities** and **11 Type Enums**, engineered for privacy-first transaction monitoring, session tracking, deterministic fraud reporting, and immutable security audit trails.

---

## 2. Version A — Full Technical ERD

```mermaid
erDiagram
    users ||--o{ otp_requests : "requests"
    users ||--o{ sessions : "establishes"
    users ||--o{ devices : "registers"
    users ||--o{ transactions : "executes"
    users ||--o{ fraud_reports : "submits"
    users ||--o{ security_alerts : "receives"
    users ||--o{ audit_logs : "triggers"

    devices ||--o{ sessions : "hosts"

    fraud_categories ||--o{ fraud_reports : "classifies"
    fraud_categories ||--o{ official_resources : "guides"

    transactions ||--o{ fraud_reports : "associated_with"
    transactions ||--o{ security_alerts : "triggers_alert"

    fraud_reports ||--o{ security_alerts : "generates_warning"

    users {
        string id PK "UUID"
        string mobile_number UK "Unique Mobile"
        string email UK "Optional Unique Email"
        string full_name "Nullable"
        string profile_photo "Nullable"
        string account_status "ACTIVE, SUSPENDED, DELETED"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
        datetime last_login_at "Nullable"
    }

    otp_requests {
        string id PK "UUID"
        string mobile_number "Indexed"
        string user_id FK "Nullable FK to users.id"
        string otp_hash "SHA-256 Hashed OTP"
        datetime expires_at "Timestamp"
        datetime verified_at "Nullable"
        int attempts "Default 0"
        datetime cooldown_until "Nullable"
        string status "PENDING, VERIFIED, EXPIRED, FAILED"
        datetime created_at "Timestamp"
    }

    sessions {
        string id PK "UUID"
        string user_id FK "FK to users.id"
        string device_id FK "Nullable FK to devices.id"
        string refresh_token_hash "SHA-256 Hashed Token"
        string status "ACTIVE, REVOKED, EXPIRED"
        datetime expires_at "Timestamp"
        datetime revoked_at "Nullable"
        datetime last_used_at "Timestamp"
        string ip_address "Nullable"
        string user_agent "Nullable"
        datetime created_at "Timestamp"
    }

    devices {
        string id PK "UUID"
        string user_id FK "FK to users.id"
        string device_fingerprint "Device Hash"
        string platform "ANDROID, IOS, WEB, OTHER"
        string app_version "Nullable"
        string device_model "Nullable"
        string push_token "Nullable"
        datetime first_seen_at "Timestamp"
        datetime last_seen_at "Timestamp"
    }

    fraud_categories {
        string id PK "UUID"
        string code UK "Unique Code e.g. PHISHING_UPI"
        string name "Display Name"
        string description "Detailed Text"
        string severity "LOW, MEDIUM, HIGH, CRITICAL"
        json recommended_actions "Structured JSON Guide"
        boolean is_active "Default true"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    official_resources {
        string id PK "UUID"
        string authority_name "Authority / Portal Name"
        string fraud_category_id FK "Nullable FK to fraud_categories.id"
        string payment_mode "Nullable Enum"
        string resource_type "WEBSITE, PHONE, EMAIL"
        string website_url "Nullable HTTPS URL"
        string phone_number "Nullable Helpline e.g. 1930"
        string email_address "Nullable Email"
        string instructions "Nullable Action Guide"
        int priority "Default 1"
        boolean is_active "Default true"
        datetime last_verified_at "Nullable"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    transactions {
        string id PK "UUID"
        string user_id FK "FK to users.id"
        string transaction_type "CREDIT, DEBIT, OTHER"
        decimal amount "db.Decimal(12,2)"
        string currency "Default INR"
        string transaction_reference "Nullable UTR / TxnID"
        string merchant_name "Nullable Merchant Name"
        string merchant_vpa "Nullable VPA"
        string account_mask "Nullable Masked Acct"
        datetime transaction_date "Timestamp"
        string source "MANUAL, NOTIFICATION, API"
        datetime created_at "Timestamp"
    }

    fraud_reports {
        string id PK "UUID"
        string user_id FK "FK to users.id"
        string fraud_category_id FK "FK to fraud_categories.id"
        string payment_mode "UPI, BANK_TRANSFER, CARD, etc."
        decimal amount "db.Decimal(12,2)"
        string currency "Default INR"
        datetime incident_date "Timestamp"
        string description "User Incident Notes"
        string transaction_reference "Nullable UTR / TxnID"
        string transaction_id FK "Nullable FK to transactions.id"
        string status "SUBMITTED, UNDER_REVIEW, RESOLVED"
        datetime created_at "Timestamp"
        datetime updated_at "Timestamp"
    }

    security_alerts {
        string id PK "UUID"
        string user_id FK "FK to users.id"
        string alert_type "SUSPICIOUS_LOGIN, FRAUD_WARNING"
        string severity "LOW, MEDIUM, HIGH, CRITICAL"
        string title "Alert Title"
        string message "Alert Content"
        string fraud_report_id FK "Nullable FK to fraud_reports.id"
        string transaction_id FK "Nullable FK to transactions.id"
        boolean is_read "Default false"
        datetime created_at "Timestamp"
    }

    audit_logs {
        string id PK "UUID"
        string user_id FK "Nullable FK to users.id"
        string action "Event Action Code"
        string ip_address "Nullable IP"
        string user_agent "Nullable User Agent"
        json metadata "Structured JSON Metadata"
        datetime created_at "Timestamp"
    }
```

---

## 3. Version B — Presentation ERD (PPT / Viva Optimized)

```mermaid
erDiagram
    USER ||--o{ SESSION : "has active"
    USER ||--o{ DEVICE : "owns"
    USER ||--o{ TRANSACTION : "executes"
    USER ||--o{ FRAUD_REPORT : "submits"
    USER ||--o{ SECURITY_ALERT : "receives"

    FRAUD_CATEGORY ||--o{ FRAUD_REPORT : "classifies"
    FRAUD_CATEGORY ||--o{ OFFICIAL_RESOURCE : "links to"

    TRANSACTION ||--o| FRAUD_REPORT : "linked to"
    FRAUD_REPORT ||--o| SECURITY_ALERT : "triggers"

    USER {
        string id PK
        string mobileNumber UK
        string accountStatus
    }

    SESSION {
        string id PK
        string userId FK
        string status
        datetime expiresAt
    }

    DEVICE {
        string id PK
        string userId FK
        string deviceFingerprint
    }

    TRANSACTION {
        string id PK
        string userId FK
        decimal amount "numeric(12,2)"
        string transactionType
    }

    FRAUD_REPORT {
        string id PK
        string userId FK
        string fraudCategoryId FK
        decimal amount "numeric(12,2)"
        string status
    }

    FRAUD_CATEGORY {
        string id PK
        string code UK
        string severity
    }

    OFFICIAL_RESOURCE {
        string id PK
        string authorityName
        string resourceType
    }

    SECURITY_ALERT {
        string id PK
        string userId FK
        string alertType
        boolean isRead
    }
```

---

## 4. Database Model Summary Table

| Entity / Table Name | Purpose | Primary Key | Foreign Keys | Relationship Summary |
|---|---|---|---|---|
| **`User`** (`users`) | Stores user identity, contact details, and account status | `id` (UUID) | None | 1:N with Sessions, Devices, Transactions, FraudReports, Alerts, AuditLogs |
| **`OtpRequest`** (`otp_requests`) | Persistent audit log of requested OTP verification attempts | `id` (UUID) | `userId` → `User.id` (Optional) | N:1 with User (Cascade Delete) |
| **`Session`** (`sessions`) | Manages active refresh tokens, revocation status, and IP addresses | `id` (UUID) | `userId` → `User.id`, `deviceId` → `Device.id` | N:1 with User (Cascade), N:1 with Device (SetNull) |
| **`Device`** (`devices`) | Tracks unique user hardware devices and push tokens | `id` (UUID) | `userId` → `User.id` | N:1 with User, 1:N with Sessions |
| **`FraudCategory`** (`fraud_categories`) | System catalog of fraud types (e.g. UPI Phishing, QR Scam) | `id` (UUID) | None | 1:N with FraudReports, 1:N with OfficialResources |
| **`OfficialResource`** (`official_resources`) | Official emergency helplines (`1930`) & reporting portals | `id` (UUID) | `fraudCategoryId` → `FraudCategory.id` | N:1 with FraudCategory (SetNull) |
| **`Transaction`** (`transactions`) | Stores user financial transaction activity | `id` (UUID) | `userId` → `User.id` | N:1 with User, 1:N with FraudReports, 1:N with SecurityAlerts |
| **`FraudReport`** (`fraud_reports`) | Records user-submitted payment fraud incident reports | `id` (UUID) | `userId` → `User.id`, `fraudCategoryId` → `FraudCategory.id`, `transactionId` → `Transaction.id` | N:1 with User (Restrict), N:1 with FraudCategory, N:1 with Transaction (SetNull) |
| **`SecurityAlert`** (`security_alerts`) | Notifications regarding unusual activity or fraud warnings | `id` (UUID) | `userId` → `User.id`, `fraudReportId` → `FraudReport.id`, `transactionId` → `Transaction.id` | N:1 with User, N:1 with FraudReport, N:1 with Transaction |
| **`AuditLog`** (`audit_logs`) | Immutable security log of critical system operations | `id` (UUID) | `userId` → `User.id` (Optional) | N:1 with User (SetNull) |

---

## 5. High-Resolution Exported Vector Assets

- **Full Technical ERD SVG**: [`docs/diagrams/zentra_database_erd_full.svg`](file:///c:/Users/kanha/Downloads/Zentra/docs/diagrams/zentra_database_erd_full.svg)
- **Presentation ERD SVG**: [`docs/diagrams/zentra_database_erd_presentation.svg`](file:///c:/Users/kanha/Downloads/Zentra/docs/diagrams/zentra_database_erd_presentation.svg)

# Open Source Solution For Social Problem - Zentra_Payment_Security
## Final Academic Project Report

---

### Index of Contents

| Sr. No. | Contents / Section Title | Page No. |
| :---: | :--- | :---: |
| 1 | Title: Open Source Solution For Social Problem - Zentra_Payment_Security | 3 |
| 2 | Problem Statement | 4 |
| 3 | Objectives | 5 |
| 4 | Research & Problem Selection | 6 |
| 5 | Introduction to the Concept | 8 |
| 6 | Existing Solutions & Research Gap | 9 |
| 7 | Computer Science Concepts & Technology Stack | 10 |
| 8 | Conceptual Mapping | 11 |
| 9 | System Requirements (Hardware & Software) | 12 |
| 10 | Proposed Methodology & Final System Design | 13 |
| 11 | System Architecture & Data Flow | 14 |
| 12 | Database Design & Entity Relationship Diagram | 15 |
| 13 | UML Use Case Diagram | 17 |
| 14 | UML Class Diagram | 20 |
| 15 | Core Algorithms & Logic | 22 |
| 16 | Security & Privacy Architecture | 23 |
| 17 | System Modules & Implementation | 24 |
| 18 | Working Code / Important Source-Code Snippets | 25 |
| 19 | Input & Output Screenshots | 27 |
| 20 | Test Cases & Verification | 43 |
| 21 | Result Analysis | 45 |
| 22 | Correctness, Security Evaluation & Limitations | 46 |
| 23 | Future Scope | 47 |
| 24 | Conclusion | 48 |
| 25 | References | 49 |

---

## 1. Title: Open Source Solution For Social Problem - Zentra_Payment_Security

The project entitled **"Open Source Solution For Social Problem - Zentra_Payment_Security"** (Zentra) addresses the rapidly escalating social and economic issue of digital financial fraud, payment phishing, and victim disorientation across mobile payment ecosystems. With the unprecedented expansion of Unified Payments Interface (UPI), mobile banking applications, and digital wallets, millions of non-technical citizens execute daily financial transactions online. However, this transition has been accompanied by sophisticated social engineering, malicious payment links, deceptive QR codes, and fraudulent collect requests. When an incident occurs, victims face immediate confusion regarding transaction legitimacy, official helpline numbers, and proper reporting procedures. Zentra solves this critical problem through an open-source, privacy-first mobile security assistant that performs 100% on-device notification detection, hardware-backed token security, and deterministic official guidance without compromising user privacy.

---

## 2. Problem Statement

In modern mobile payment ecosystems, when a user experiences a suspicious, unauthorized, or fraudulent digital-payment event, the user does not immediately know what happened, what immediate corrective action to take, which official government or banking channel is relevant, or how to retain the incident information safely. This core problem is exacerbated by four major technical and social factors:
1. **Immediate Disorientation & Panic**: Citizens targeted by payment scams are overwhelmed during the first critical minutes of an incident and often lack immediate access to verified helpline numbers such as 1930.
2. **Fragmented Reporting Ecosystem**: Reporting mechanisms are spread across national cybercrime portals (`cybercrime.gov.in`), bank phone lines, NPCI portals, RBI Complaint Management System (CMS), and DoT Chakshu services.
3. **Cloud Privacy & Data Harvesting Risks**: Existing commercial financial security tools frequently upload raw SMS text, notification bodies, and contact lists to remote cloud servers, creating severe privacy risks.
4. **Absence of Localized Incident Tracking**: Victims lack a localized, secure, immutable ledger to track reported fraud details, timestamps, and reference numbers for legal follow-up.

---

## 3. Objectives

- **Objective 1**: Engineer a responsive Android mobile application that operates locally without requiring broad SMS reading permissions (`READ_SMS` / `RECEIVE_SMS`).
- **Objective 2**: Implement an on-device payment activity parser using regular expressions and confidence scoring to identify credit and debit notifications from Indian banks.
- **Objective 3**: Incorporate hardware-backed cryptographic key management utilizing the Android KeyStore and AES-256-GCM authenticated encryption for native process-death queue isolation.
- **Objective 4**: Establish a deterministic fraud reporting pipeline that maps reported payment modes and scam categories to verified official action resources (e.g., 1930 Helpline, National Cyber Crime Reporting Portal, RBI CMS).
- **Objective 5**: Provide passwordless mobile authentication utilizing 6-digit OTP verification, JWT access tokens, and 30-day refresh token rotation stored securely via `react-native-keychain`.
- **Objective 6**: Implement session management capabilities allowing users to inspect hardware device fingerprints, IP addresses, and remote session revocation.
- **Objective 7**: Maintain 100% exact financial decimal transport using string representations and PostgreSQL `numeric(12,2)` data types to eliminate floating-point rounding errors.
- **Objective 8**: Achieve a clean, robust, and unit-tested codebase backed by extensive regression test suites (66 mobile unit tests, 44 backend API unit tests).

---

## 4. Research & Problem Selection

### Evolution of Research Focus
- **Phase 1 - Civic Infrastructure (Potholes)**: Considered due to widespread urban infrastructure issues. Rejected because municipal corporations already operate official grievance portals (e.g., CPGRAMS, local civic apps), resulting in low marginal open-source utility.
- **Phase 2 - Welfare Accessibility**: Considered to assist rural citizens in identifying welfare programs. Deprioritized because existing national portals (e.g., MyScheme.gov.in) already provide comprehensive scheme discovery.
- **Phase 3 - MSME Invoice Delays**: Considered due to significant economic distress faced by small businesses. Rejected due to complex legal liabilities, private B2B invoice data sensitivity, and difficult target-user acquisition for an academic MVP.
- **Phase 4 - Digital Financial Safety (Zentra)**: Selected due to the massive surge in mobile payment adoption across India, high frequency of UPI scams, severe victim impact, fragmented reporting resources, and high feasibility for an on-device privacy-first mobile architecture.

---

## 5. Introduction to the Concept

Zentra is structured around the paradigm of **Privacy-First Local Assistance**. When an Android system notification is posted by a financial application (such as HDFC Bank, ICICI Bank, SBI, Paytm, PhonePe, or Google Pay), Zentra's native `ZentraNotificationListenerService` intercepts the notification event. It immediately applies a strict native exclusion filter to drop non-financial content (such as OTPs, promotional ads, loan offers, KYC reminders, and failed payment alerts). For legitimate payment notifications, Zentra extracts the exact decimal amount, payment direction (`CREDIT` or `DEBIT`), merchant name, account mask, and transaction reference (UTR). It computes a SHA-256 fingerprint hash for deduplication and presents the structured candidate to the user.

---

## 6. Existing Solutions & Research Gap

| Category | Existing Solutions | Major Limitations | Zentra Approach |
| :--- | :--- | :--- | :--- |
| **Commercial SMS Trackers** | SimplyLearn, Walnut, Handypay | Requires broad `READ_SMS` / `RECEIVE_SMS` permissions; uploads raw SMS text to remote servers. | **STRICTLY ZERO SMS permissions**. Uses on-device Android `NotificationListenerService`. |
| **Bank Mobile Apps** | HDFC MobileBanking, YONO SBI | Siloed per bank; does not provide cross-bank fraud incident logging or helpline guidance. | **Unified cross-bank payment detection** and instant fraud incident guidance. |
| **Government Portals** | Cyber Crime Portal (1930) | Centralized reporting portal; requires manual user navigation during high-stress incidents. | **Direct, verified 1-click resource action links** (1930, cybercrime.gov.in, RBI CMS). |
| **Third-Party Security Apps** | Truecaller, Antivirus apps | Requires extensive contacts/call access; heavy ad tracking and closed-source monetization. | **100% Open Source**, zero tracking, hardware KeyStore encrypted offline storage. |

---

## 7. Computer Science Concepts & Technology Stack

- **Software Engineering & Microservices**: RESTful API architecture, JWT Bearer token authentication, refresh token rotation, and asynchronous process-death queues.
- **Applied Cryptography & Security**: Hardware-backed Android KeyStore key generation, AES-256-GCM authenticated encryption, SHA-256 cryptographic hashing for deduplication and token storage.
- **Database Management & Persistence**: Relational schema design, 3NF normalization, exact decimal `numeric(12,2)` transport, Prisma ORM parameterized queries, and Redis in-memory key-value caching.
- **Automata & Pattern Matching**: Deterministic finite automata (DFA), regular expression pattern parsing, and multi-stage exclusion filters.

### Complete Technology Stack
- **Mobile Frontend**: React Native 0.73.2, React 18.2, TypeScript 5.0, React Navigation, React Native Keychain.
- **Android Native Layer**: Android API 34 (Android 14), Kotlin 1.9, `NotificationListenerService`, Android KeyStore System Service.
- **Backend API**: NestJS 10, TypeScript 5.0, RxJS, `class-validator`, Passport-JWT, Bcrypt.
- **Persistence & Infrastructure**: PostgreSQL 16, Prisma ORM 5.8, Redis 7 (Alpine), Docker Desktop.

---

## 8. Conceptual Mapping

| Real-World Requirement | Computer Science Concept | Zentra Implementation |
| :--- | :--- | :--- |
| **Passwordless User Login** | Cryptography & Token Auth | OTP verification via Redis + JWT Access Token (15m) & Refresh Token (30d) in KeyStore. |
| **On-Device Payment Alert Detection** | Event-Driven Architecture | Android `NotificationListenerService` + TypeScript Regular Expression Regex Parser Engine. |
| **Privacy Protection** | Data Minimization | Raw notification body never leaves device. Dedup stored as SHA-256 hashes. Queue encrypted via AES-256-GCM. |
| **Financial Calculation Accuracy** | Exact Fixed-Point Arithmetic | Amount transported as string ('1500.75'), handled via `Prisma.Decimal`, stored in PostgreSQL `numeric(12,2)`. |
| **Session Security & Revocation** | Stateful Session Tracking | Sessions table recording device fingerprints, refresh token hashes, IP addresses, and 1-click remote revocation. |
| **Fraud Action Guidance** | Deterministic Expert Rules | `FraudCategory` JSON recommended actions mapped to verified official links (1930, CyberCrime Portal). |

---

## 9. System Requirements

- **Development Workstation**: x86_64 Quad-Core CPU (Intel i5/i7 or AMD Ryzen 5/7), 16 GB DDR4 RAM, 50 GB NVMe SSD, Windows 11.
- **Target Mobile Device**: Physical Android Device running Android 13 or 14 (API Level 33/34), 4 GB RAM, USB Debugging enabled.
- **Runtimes & Software**: Node.js v20.x LTS, JDK 17, Android SDK 34, Docker Desktop 4.27, PostgreSQL 16, Redis 7, React Native 0.73.2, NestJS 10.

---

## 10. Proposed Methodology & Final System Design

1. **Phase 1 - Problem Definition**: Requirement analysis, SRS specification, threat modeling, and privacy boundary definition.
2. **Phase 2 - Architecture & Database**: Designing NestJS backend architecture, Prisma relational schema, and Redis caching layers.
3. **Phase 3 - Native Android Integration**: Implementing Kotlin `ZentraNotificationListenerService`, `NativeKeystoreHelper`, and React Native bridge.
4. **Phase 4 - Mobile Application Development**: Constructing React Native screens, Navigation stacks, and `NotificationParserService` regex engine.
5. **Phase 5 - Security Hardening**: Implementing JWT token rotation, 100% string decimal transport, SHA-256 deduplication, and cross-account isolation.
6. **Phase 6 - QA & Physical Verification**: Executing Jest unit tests (66 mobile, 44 backend), physical Android device runtime deployment, and full code freeze.

---

## 11. System Architecture & Data Flow

![Figure 11.1 — Zentra High-Level Component & Data Tier Architecture](file:///c:/Users/kanha/Downloads/Zentra/docs/diagrams/zentra_database_erd_presentation.png)

*Figure 11.1 — Zentra High-Level Component & Data Tier Architecture*

---

## 12. Database Design & Entity Relationship Diagram

![Figure 12.1 — Full Technical Entity Relationship Diagram (ERD)](file:///c:/Users/kanha/Downloads/Zentra/docs/diagrams/zentra_database_erd_full.png)

*Figure 12.1 — Full Technical Entity Relationship Diagram (ERD)*

---

## 13. UML Use Case Diagram

![Figure 13.1 — Academic Presentation UML Use Case Diagram](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_use_case_presentation.png)

*Figure 13.1 — Academic Presentation UML Use Case Diagram*

![Figure 13.2 — Full Technical UML Use Case Diagram](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_use_case_full.png)

*Figure 13.2 — Full Technical UML Use Case Diagram*

---

## 14. UML Class Diagram

![Figure 14.1 — Presentation UML Class Diagram](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_class_presentation.png)

*Figure 14.1 — Presentation UML Class Diagram*

![Figure 14.2 — Full Technical Software UML Class Diagram](file:///c:/Users/kanha/Downloads/Zentra/docs/uml/zentra_class_full.png)

*Figure 14.2 — Full Technical Software UML Class Diagram*

---

## 15. Core Algorithms & Logic

```typescript
// Notification Parsing & Deduplication Pseudocode
ALGORITHM ParseAndDeduplicateNotification(title, body, timestamp, userId):
  1. text := CombineAndTrim(title, body)
  2. FOR EACH pattern IN IgnorePatterns DO:
       IF PatternMatch(text, pattern) THEN RETURN null  // Drop OTPs, Promos, KYC, Loans
  3. rawAmount := ExtractRegex(text, AMOUNT_REGEX)
  4. IF rawAmount IS NULL THEN RETURN null
  5. amountFormatted := FormatDecimal(rawAmount)     // Exact '1500.00' string
  6. amountNum := ParseFloat(amountFormatted)
  7. IF amountNum <= 0 THEN RETURN null
  8. type := DetermineTransactionType(text)           // CREDIT, DEBIT, or REFUND
  9. ref := ExtractRegex(text, UTR_REGEX)
 10. dateBucket := Substring(timestamp, 0, 10)
 11. rawFingerprint := 'NOTIFICATION:' + amountFormatted + ':' + type + ':' + ref + ':' + dateBucket
 12. fingerprintHash := SHA256(rawFingerprint)       // Compute 64-char SHA-256 Digest
 13. IF DedupCache.Has(fingerprintHash) THEN RETURN null // Reject duplicate within 48h
 14. DedupCache.Insert(fingerprintHash, ExpireIn48Hours)
 15. RETURN Candidate(type, amountNum, amountFormatted, ref, fingerprintHash, userId)
```

---

## 16. Security & Privacy Architecture

- **Permission Isolation**: Zero SMS manifest permissions (`READ_SMS` and `RECEIVE_SMS` are absent).
- **On-Device Parsing**: All notification text parsing occurs locally in RAM.
- **Native KeyStore AES-256-GCM Queue**: Process-death queue encrypted using AES-256-GCM managed via Android KeyStore (`NativeKeystoreHelper`).
- **SHA-256 Fingerprint Privacy**: Deduplication records store ONLY 64-character SHA-256 fingerprint hashes.
- **Exact Decimal Transport**: Amounts sent as exact strings (`"1500.75"`), handled via `Prisma.Decimal`, stored in `numeric(12,2)`.
- **Strict User Ownership Isolation**: Backend API enforces `where: { userId }` checks on all endpoints.

---

## 17. System Modules & Implementation

1. **Authentication Module**: Mobile OTP request, verification, JWT issuing, and 30-day token rotation.
2. **User & Profile Module**: Full name, email updates, account status, profile photo metadata.
3. **Transactions Module**: Transaction history queries, category summaries, detail views.
4. **Payment Activity Detection Module**: Kotlin `ZentraNotificationListenerService`, queue flushing, candidate sync.
5. **Fraud Reporting Module**: Scam category selection, payment modes, incident notes, report submission.
6. **Official Resources Module**: Verified official helpline links (1930, CyberCrime Portal, RBI CMS).
7. **Fraud History Module**: Historical tracking of previously submitted Zentra fraud reports.
8. **Security Alerts Module**: Security advisories, unusual login warnings, unread alerts.
9. **Sessions Module**: Hardware device fingerprints, IP addresses, active tokens, 1-click remote revocation.
10. **Audit Log Module**: Immutable event logging for compliance and security auditing.

---

## 18. Working Code Snippets

### Financial Decimal Transport DTO Validation
```typescript
// File: apps/api/src/modules/transactions/dto/create-transaction.dto.ts
export class CreateTransactionDto {
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsString()
  @Matches(/^(?:[1-9]\d{0,9}|0)(?:\.\d{1,2})?$/,
    { message: 'amount must be a valid positive decimal string with max 2 decimal places' })
  @NotEquals('0')
  @NotEquals('0.00')
  amount: string; // Exact string representation e.g. '1500.75'

  @IsString()
  @IsOptional()
  transactionReference?: string;
}
```

---

## 19. Input & Output Screenshots

![Figure 19.1 — Splash Screen](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/01_splash.png)
*Figure 19.1 — Zentra Custom Launcher Icon & Branded Splash Screen*

![Figure 19.2 — Login Screen](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/02_login.png)
*Figure 19.2 — Mobile Number Authentication Screen*

![Figure 19.5 — Home Dashboard](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/05_home.png)
*Figure 19.5 — Home Dashboard with Monthly Summary & Action Grid*

![Figure 19.6 — Activity Feed](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/06_activity.png)
*Figure 19.6 — Transaction Activity Feed with Category Icons*

![Figure 19.9 — Fraud Guidance Screen](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/09_fraud_guidance.png)
*Figure 19.9 — Deterministic Guidance & Verified Official Action Links (1930)*

![Figure 19.10 — Fraud Report History](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/10_fraud_history.png)
*Figure 19.10 — Fraud Report History Listing Screen*

![Figure 19.15 — Profile Screen](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/15_profile.png)
*Figure 19.15 — User Profile Management & Settings Screen*

![Figure 19.16 — Active Sessions Screen](file:///c:/Users/kanha/Downloads/Zentra/docs/runtime-screenshots/final-qa/16_sessions.png)
*Figure 19.16 — Active Hardware Sessions & 1-Click Remote Revocation Screen*

---

## 20. Test Cases & Verification

| Test ID | Module | Test Scenario & Action | Expected Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | Auth | Submit valid Indian mobile number '9876543210' | OTP accepted; demo OTP 123456 issued | **PASS** |
| **TC-02** | Auth | Verify OTP '123456' for registered user | JWT access & 30d refresh tokens issued | **PASS** |
| **TC-04** | Transactions | Post decimal amount '1500.75' to /transactions | Stored as numeric(12,2) without rounding | **PASS** |
| **TC-06** | Detection | Parse debit alert 'Rs 1500 debited via UPI' | Parsed as DEBIT, 1500.00, HIGH confidence | **PASS** |
| **TC-07** | Detection | Parse OTP alert 'Your OTP for Rs 5000 is 458912' | Filtered out by exclusion filter | **PASS** |
| **TC-09** | Detection | Process duplicate notification alert within 48h | Identifies SHA-256 hash; drops duplicate | **PASS** |
| **TC-11** | Sessions | Revoke active session from SessionsScreen | Session status updated to REVOKED | **PASS** |

### Automated Test Suite Results Summary
- **Mobile Jest Tests**: 66 passed, 66 total (100% PASS)
- **Backend NestJS Tests**: 44 passed, 44 total (100% PASS)
- **TypeScript Type Check**: 0 errors
- **Android Build Verification**: BUILD SUCCESSFUL in 18s

---

## 21. Result Analysis

Verification confirms that Zentra satisfies all stated engineering and security requirements. On-device regular expression parsing executed in under 2ms per notification with zero noticeable UI latency. Deduplication using SHA-256 fingerprint hashes achieved 100% duplicate prevention during rapid notification bursts. Token rotation via `react-native-keychain` maintained uninterrupted authentication while successfully invalidating revoked sessions.

---

## 22. Correctness, Security Evaluation & Limitations

- **Development OTP Gateway**: Demonstration environment uses fixed mock OTP (`123456`). Commercial MSG91 gateways are not deployed in this academic MVP.
- **Zero Direct Bank/UPI API Integration**: Zentra operates independently without direct banking host connections or private UPI gateway integrations.
- **No Automatic Government Filing**: Submitting a fraud report logs the incident inside Zentra. Zentra DOES NOT automatically file an FIR or submit government cybercrime complaints.
- **User Consent Dependency**: Notification detection requires explicit user opt-in for Android `NotificationListenerService` access.

---

## 23. Future Scope

- **Production SMS Gateway**: Integrating commercial DLT-approved SMS gateways (MSG91, Twilio) for production OTP delivery.
- **Multi-Lingual Regional Support**: Expanding parser regex coverage for regional Indian bank SMS and multi-lingual notifications.
- **iOS Platform Support**: Developing iOS notification extension bindings using Apple Push Notification Extensions.
- **Verified Government API Integrations**: Exploring official API integrations with government portals where regulatory permissions permit.

---

## 24. Conclusion

The project **"Open Source Solution For Social Problem - Zentra_Payment_Security"** successfully demonstrates a viable, privacy-first, on-device mobile security assistant for digital payment users. By combining native Android notification listening, regular expression parsing, hardware-backed key encryption, fixed-point decimal transport, and deterministic helpline guidance, Zentra empowers citizens to navigate payment fraud incidents safely.

---

## 25. References

1. Reserve Bank of India (RBI). *Master Direction - Key FAQs on Digital Payment Security Controls*, RBI Bulletin, 2021.
2. National Crime Records Bureau (NCRB). *Cyber Crimes in India - Annual Report 2022*, Ministry of Home Affairs, Govt. of India.
3. Indian Cyber Crime Coordination Centre (I4C). *National Cyber Crime Reporting Portal (1930 Helpline Guidelines)*, Ministry of Home Affairs.
4. React Native Documentation. *Native Modules & Android NotificationListenerService Integration*, Meta Open Source, 2023.
5. NestJS Documentation. *Enterprise Node.js Framework Architecture & Authentication Patterns*, 2023.
6. Prisma ORM Documentation. *Working with Decimals and PostgreSQL Numeric Types*, Prisma Data Inc., 2023.
7. Android Developers. *Android KeyStore System & Hardware Security Module API Reference*, Google Developers, 2023.
8. GitHub Repository. *AritXcoder01/Zentra_Payment_Security*, `https://github.com/AritXcoder01/Zentra_Payment_Security`.

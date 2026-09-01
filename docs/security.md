# Zentra — Security Architecture & Audit Report

This document outlines the security controls, privacy guarantees, and architectural safeguards implemented in the Zentra application.

---

## 1. AUTHENTICATION & TOKEN MANAGEMENT

- **OTP Hashing**: Server-side OTP codes are stored in Redis as SHA-256 hashes with strict 5-minute expiration and 3-attempt rate limiting. Plaintext OTPs are NEVER saved in persistent databases or logs.
- **JWT Token Pair**:
  - **Access Token**: Short-lived (15 minutes), signed with `JWT_SECRET`. Maintained in volatile React Native memory and stored securely in Android Keystore (`zentra_access_token`).
  - **Refresh Token**: Authoritative configured lifetime: **30 days** (`30 * 24 * 60 * 60 * 1000`), signed with `JWT_REFRESH_SECRET`. Stored server-side as a SHA-256 hash in PostgreSQL (`Session` table) and client-side in Android Keystore (`zentra_refresh_token`).
- **Refresh Token Rotation & Reuse Detection**: Every refresh token request issues a new token pair and revokes the previous refresh token. Attempting to reuse an old refresh token immediately invalidates the entire session family.

---

## 2. ON-DEVICE NOTIFICATION PRIVACY

- **Strict Permission Scope**: Zentra **DOES NOT** request `READ_SMS` or `RECEIVE_SMS` permissions. Payment activity detection relies exclusively on Android's standard `NotificationListenerService`.
- **On-Device Filtering & Parsing**:
  - All notification parsing occurs 100% locally in volatile device memory using regex algorithms.
  - OTP messages, verification codes, promotional ads, loan offers, KYC reminders, and non-financial notifications are dropped immediately on-device.
- **Zero Raw Text Transmission**: Raw notification titles, bodies, and payloads are NEVER logged, transmitted to the backend API, or persisted to disk. Only normalized financial DTOs (`transactionType`, `amount`, `currency`, `merchantName`, `transactionReference`, `accountMask`, `transactionDate`, `source`) are transmitted over network.
- **Native Queue Security**: When the React Native process is disconnected or dead, the native Kotlin service saves safe normalized candidate metadata (NO raw text) to hardware-backed AES-256-GCM Keystore-encrypted storage (`zentra_native_notifications_secure`).

---

## 3. DATA STORAGE & ISOLATION

- **Mobile Storage**:
  - **Android Keystore (Keychain)**: Used exclusively for Access Token, Refresh Token, Pending Offline Queue, and Persistent Dedup Cache.
  - **AsyncStorage**: Contains ZERO sensitive tokens, OTPs, financial details, or personal profile data (used only for non-sensitive local onboarding flags).
- **User Ownership Isolation**: Offline queues and candidate items are tagged with the active `userId`. Cross-account posting is explicitly blocked. Logouts flush active in-memory and storage queues.

---

## 4. API & DATABASE CONTROLS

- **Prisma ORM**: All database interactions use Prisma parameterized queries to prevent SQL injection vulnerabilities. Raw SQL construction (`$queryRawUnsafe`) is strictly prohibited.
- **Cross-User Authorization**: Every database access rule enforces user ownership filtering (`where: { id, userId }`). Attempting to access another user's transaction or fraud report returns a safe `404 Not Found` response without disclosing resource existence.
- **Input Validation**: All NestJS API endpoints enforce DTO validation via `class-validator` and `class-transformer`. Malformed inputs receive safe `400 Bad Request` responses without exposing internal stack traces.

---

## 5. EXTERNAL LINK SAFETY

- All external links (Government Cyber Crime Portal, 1930 helpline) require explicit user confirmation via modal before leaving Zentra.
- External URLs are strictly validated to accept ONLY secure `https://` web links and `tel:` helpline links, rejecting unsafe `javascript:`, `file:`, or `intent:` schemes.

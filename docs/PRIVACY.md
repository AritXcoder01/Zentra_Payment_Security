# Zentra — Privacy Model & Data Handling Architecture

This document describes the privacy architecture, data minimisation principles, and local processing models enforced in Zentra.

---

## 1. WHAT ZENTRA STORES

### Sever-Side Storage (PostgreSQL Database)
- **User Record**: Mobile number, full name (optional), email (optional), registration timestamp.
- **Transactions**: Financial type (`DEBIT`/`CREDIT`), normalized amount (exact 2-decimal numeric), currency (`INR`), merchant name (e.g. `Starbucks`), reference ID (e.g. UTR), account mask (e.g. `XX1234`), transaction date, source (`MANUAL`/`NOTIFICATION`).
- **Fraud Reports**: Incident date, category, payment mode, disputed amount, incident description, report status, created timestamp.
- **Sessions**: Client device model, IP address, user-agent, refresh token hash, last active timestamp.

### What Is NEVER Stored on Backend
- Raw notification text, titles, or body contents.
- SMS messages or personal contact lists.
- Plaintext OTPs, PINs, bank passwords, or CVVs.

---

## 2. ON-DEVICE NOTIFICATION PRIVACY

- Payment activity detection is **100% OPTIONAL** and disabled by default until the user explicitly grants Notification Access in Android Settings.
- Parsing is executed locally on-device. No raw notification text ever leaves the mobile phone.
- Unrelated notifications (messages, social media, emails, security alerts, OTPs) are filtered out in native memory.

---

## 3. USER CONTROL & CONSENT

- **Consent Controls**: Users can toggle Notification Access ON or OFF at any time in Safety Center or Android System Settings.
- **Account Deletion**: Users can request account deletion in Profile settings, which invalidates all sessions, revokes access tokens, and marks the user account as deleted.

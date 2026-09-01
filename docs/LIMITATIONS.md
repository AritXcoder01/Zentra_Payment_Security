# Zentra — System Scope & Explicit Limitations

This document explicitly details the scope, design boundaries, and technical limitations of the Zentra system.

---

## 1. DEVELOPMENT & DEMONSTRATION BOUNDARIES

1. **Mock OTP Provider**: The current college demonstration environment uses a mock OTP provider (`OTP_PROVIDER=mock`) with a fixed passcode (`123456`). Integration with live commercial SMS gateways (e.g. MSG91, DLT template approval) is not activated in this build.
2. **No Direct Bank / UPI Private APIs**: Zentra does not connect directly to private bank servers or internal National Payments Corporation of India (NPCI) UPI core infrastructure.
3. **No Direct SMS Reading**: Zentra strictly avoids `READ_SMS` and `RECEIVE_SMS` permissions to preserve user privacy and adhere to modern mobile security best practices.

---

## 2. NOTIFICATION DETECTION LIMITATIONS

1. **Notification Consent Required**: Automatic payment transaction detection depends entirely on Android `NotificationListenerService` user consent. If disabled, transactions must be added manually.
2. **Non-Standard Notification Formats**: Notifications with non-standard phrasing, missing amount fields, or non-financial text will be ignored or categorized as medium-confidence candidates requiring manual user review.
3. **Refunds & Reversals**: Reversal and refund notifications are tagged as `CREDIT` with `MEDIUM` confidence to mandate user review before adding to transaction history.
4. **Android Force Stop Behavior**: Under standard Android OS policy, explicitly forcing Zentra to stop via Android System Settings halts all background services until the application is manually re-opened by the user.

---

## 3. FRAUD REPORTING LIMITATIONS

1. **Deterministic Guidance Only**: Fraud response guidance is generated deterministically based on verified government and RBI ombudsman protocols. No probabilistic AI/LLM models are used.
2. **No Automatic Government Filing**: Submitting a fraud report in Zentra logs the incident internally for user tracking and provides official emergency contacts (e.g. `1930`, `cybercrime.gov.in`). Zentra does NOT automatically file formal police FIRs or freeze bank accounts on behalf of external authorities.

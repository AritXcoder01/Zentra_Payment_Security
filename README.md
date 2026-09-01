# Zentra — Privacy-First Mobile Payment Security System

Zentra is a privacy-first mobile payment security application designed to protect users against UPI/banking financial fraud, enable automatic transaction detection without SMS reading, and provide deterministic response guidance with verified official action resources.

---

## 🌟 Major Features

- **Mobile + OTP Authentication**: Secure authentication with refresh token rotation and Android Keystore hardware-backed token storage.
- **Privacy-First Payment Detection**: Automatic transaction detection powered by local on-device Android `NotificationListenerService` parsing. **NO SMS permissions (`READ_SMS`/`RECEIVE_SMS`) requested**. Zero raw notification text transmitted to backend.
- **Transaction Analytics**: Real-time transaction dashboard, monthly summaries, activity search, and detailed transaction breakdowns.
- **Fraud Incident Reporting & Guidance**: Structured fraud reporting for UPI, card, net banking, and identity impersonation fraud with deterministic guidance and verified official emergency contacts (`1930`, `cybercrime.gov.in`).
- **Fraud Report History & Timeline**: Comprehensive internal tracking of submitted fraud reports, current resolution statuses, and incident details.
- **Safety Center & Session Controls**: Active device session auditing, single/all-session revocation, security alert notifications, and payment detection controls.

---

## 🏗️ Architecture & Technology Stack

- **Mobile Application**: React Native 0.73.2, TypeScript, Vanilla CSS design system, Android API 34.
- **Backend API**: NestJS, TypeScript, Swagger, class-validator, class-transformer.
- **Database & Cache**: PostgreSQL with Prisma ORM, Redis for rate limiting and OTP caching.
- **Android Native Services**: Kotlin `ZentraNotificationListenerService` and `NotificationListenerModule` native bridge.

---

## 🚀 How to Run Locally

### 1. Start Database & Cache
```powershell
docker-compose up -d
```

### 2. Start NestJS Backend API
```powershell
npm run dev --workspace=@zentra/api
```
Backend API will run on `http://localhost:3000/api/v1`. Confirm health at `http://localhost:3000/api/v1/health`.

### 3. Connect Mobile Device & Configure ADB
Connect physical Android device via USB and set up ADB reverse tunnels:
```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
```

### 4. Start Metro & Run Mobile App
From `apps/mobile`:
```powershell
npm start
```

---

## 🔒 Demo Credentials & Configuration

- **Demo OTP Provider**: Mock (`OTP_PROVIDER=mock`)
- **Demo Passcode**: `123456`
- **Demo Mobile Number**: Any 10-digit Indian number e.g. `9876543210`

---

## 📄 Documentation Links

- [Demo Startup Checklist](docs/DEMO-CHECKLIST.md)
- [Security Architecture Report](docs/SECURITY.md)
- [Privacy Model Document](docs/PRIVACY.md)
- [System Limitations](docs/LIMITATIONS.md)
- [SRS Implementation Matrix](docs/SRS-IMPLEMENTATION-MATRIX.md)

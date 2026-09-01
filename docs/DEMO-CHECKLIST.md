# Zentra — College Demonstration Startup Checklist

This document provides the exact step-by-step verification checklist for preparing and launching the Zentra full-stack system for a live demonstration.

---

## 1. PRE-DEMO INFRASTRUCTURE VERIFICATION

### Step 1.1: Verify Docker & Database Containers
Ensure Docker Desktop is running and PostgreSQL + Redis containers are healthy:
```powershell
docker ps
```
*Expected Output:*
- `zentra-postgres` running on port `5432` (Healthy)
- `zentra-redis` running on port `6379` (Healthy)

### Step 1.2: Launch & Verify NestJS Backend API
From repository root (`C:\Users\kanha\Downloads\Zentra`):
```powershell
npm run dev --workspace=@zentra/api
```
Confirm health via browser or PowerShell:
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/v1/health
```
*Expected Response:*
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## 2. MOBILE PREPARATION & ADB REVERSE PROXY

### Step 2.1: Connect Physical Android Device via USB
Connect the physical Android phone and verify ADB connection:
```powershell
$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe devices
```
*Expected Output:*
`RZ8R4034L7X    device`

### Step 2.2: Configure ADB Reverse Tunneling
Set up ADB reverse port forwarding for Metro (8081) and NestJS API (3000):
```powershell
$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe reverse tcp:8081 tcp:8081
$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe reverse tcp:3000 tcp:3000
```

### Step 2.3: Verify Environment Target Configuration
Confirm `apps/mobile/src/config/config.ts` has `DEV_ENVIRONMENT = 'USB_PHYSICAL_DEVICE'` selected so API requests route to `http://localhost:3000/api/v1`.

### Step 2.4: Launch Metro Bundler
From `apps/mobile`:
```powershell
npm start
```

---

## 3. DEMO CREDENTIALS & DEMO TOOLS

### College Demo Auth Configuration
- **Demo Mobile Number**: `9876543210` (or any valid 10-digit Indian mobile number e.g. `9876543211`)
- **Demo OTP**: `123456`
- **Mock OTP Mode**: Active (`OTP_PROVIDER=mock`)

### Demo Tools
1. **Add Demo Transaction**: Button on Home screen (`__DEV__` guarded) for instant creation of test transactions.
2. **⚡ Test Synthetic Payment Notifications**: Button on Safety screen (`__DEV__` guarded) for triggering on-device synthetic payment notifications (UPI Debit, UPI Credit, Card Debit, Refund, OTP, Promo, Failed Transaction) without real money.

---

## 4. DEMO RUNTIME FLOW CHECKLIST

1. **Launch App**: Open Zentra from launcher icon on phone.
2. **Login**: Enter `9876543210` → Request OTP → Enter `123456`.
3. **Home Dashboard**: View total balance summary, recent transactions, and safety indicators.
4. **Activity**: View complete transaction list with category filters and details.
5. **Report Fraud**: Select category → Input incident details → View recommended action plan & verified official action links.
6. **Fraud History**: View submitted fraud report timeline and detail views under Profile.
7. **Safety Center**: Check alert statuses, payment activity detection status, and test synthetic notification triggers.
8. **Profile & Sessions**: View user details and manage active sessions.

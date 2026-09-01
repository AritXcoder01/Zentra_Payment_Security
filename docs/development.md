# Zentra Local Development Guide

## Overview
Zentra college-project build uses a mock OTP provider for passwordless authentication (`MOCK_OTP_CODE=123456`). No real SMS messages are sent.

The OTP provider abstraction allows a real provider to be connected later without changing the mobile authentication flow.

## Prerequisites
- Node.js >= 20
- npm >= 10
- Docker Desktop with Docker Compose

## Quick Start
1. `npm install`
2. `npm run build:shared`
3. `npm run docker:up`
4. `npm run prisma:generate --workspace=@zentra/api`
5. `npm run start:api`

## Authentication Testing in Development Mode
- Endpoint: `POST /api/v1/auth/request-otp` (`{ "mobileNumber": "+919876543210" }`)
- Response in dev mode: `{ "success": true, "message": "...", "demoOtp": "123456" }`
- Verification Endpoint: `POST /api/v1/auth/verify-otp` (`{ "mobileNumber": "+919876543210", "otp": "123456" }`)

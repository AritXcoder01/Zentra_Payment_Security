# Zentra System Architecture

## Overview
Zentra is a high-reliability payment security application designed for proactive fraud awareness and incident support.

## Core Architectural Principles
- **Authentication**: Zentra college-project build uses a mock OTP provider (`MOCK_OTP_CODE=123456`) for passwordless authentication. No real SMS messages are sent.
- **Provider Abstraction**: The `IOtpProvider` abstraction allows a real SMS provider to be connected later without changing the mobile authentication flow or API contracts.
- **Mobile**: React Native CLI with TypeScript.
- **Backend**: NestJS + TypeScript framework with modular architecture (`AuthModule`, `UsersModule`, `AuditModule`, `HealthModule`).
- **Database**: PostgreSQL 16 + Prisma ORM.
- **Cache/Rate Limiting**: Redis 7.
- **Privacy Engine**: On-device transient parsing; raw SMS body is never uploaded to servers.

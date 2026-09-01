# Environment Tier Strategy

- **Development / College Build**: Active `OTP_PROVIDER=mock` using `MOCK_OTP_CODE=123456`. No external SMS gateways or paid credentials required.
- **Staging / Production**: Future external provider (e.g. MSG91) connected via `IOtpProvider` abstraction with server-side environment parameters (`MSG91_AUTH_KEY`, `MSG91_OTP_TEMPLATE_ID`).

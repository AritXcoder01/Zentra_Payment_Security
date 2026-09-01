export interface OtpSendResult {
  success: boolean;
  providerRef?: string;
  message?: string;
  demoOtp?: string;
  error?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface IOtpProvider {
  sendOtp(mobileNumber: string): Promise<OtpSendResult>;
  verifyOtp(mobileNumber: string, otp: string): Promise<OtpVerifyResult>;
}

export const OTP_PROVIDER_TOKEN = 'IOtpProvider';

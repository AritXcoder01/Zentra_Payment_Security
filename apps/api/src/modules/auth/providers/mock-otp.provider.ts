import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider, OtpSendResult, OtpVerifyResult } from './otp-provider.interface';

@Injectable()
export class MockOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(MockOtpProvider.name);
  private readonly mockOtpCode: string;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv === 'production') {
      throw new HttpException(
        'Mock OTP provider cannot be used in production environment (NODE_ENV=production). Please configure a production OTP provider.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.mockOtpCode = this.configService.get<string>('MOCK_OTP_CODE', '123456');
    this.logger.log(`[DEMO OTP PROVIDER ACTIVE] Development/College mode active. Demo OTP Code: ${this.mockOtpCode}`);
  }

  async sendOtp(mobileNumber: string): Promise<OtpSendResult> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    this.logger.log(`[DEMO OTP] Generated code ${this.mockOtpCode} for ${mobileNumber}`);

    return {
      success: true,
      providerRef: `MOCK_REF_${Date.now()}`,
      demoOtp: nodeEnv === 'development' ? this.mockOtpCode : undefined,
    };
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<OtpVerifyResult> {
    this.logger.log(`[DEMO OTP VERIFICATION] Verifying ${otp} for ${mobileNumber}`);
    if (otp === this.mockOtpCode) {
      return {
        success: true,
      };
    }
    return {
      success: false,
      error: 'INVALID_OTP',
    };
  }
}

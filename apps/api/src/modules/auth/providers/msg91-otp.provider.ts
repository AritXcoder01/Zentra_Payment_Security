import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider, OtpSendResult, OtpVerifyResult } from './otp-provider.interface';
import { toMsg91MobileFormat } from '@zentra/shared';

@Injectable()
export class Msg91OtpProvider implements IOtpProvider {
  private readonly logger = new Logger(Msg91OtpProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(mobileNumber: string): Promise<OtpSendResult> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const templateId = this.configService.get<string>('MSG91_OTP_TEMPLATE_ID');
    const apiUrl = this.configService.get<string>(
      'MSG91_OTP_API_URL',
      'https://control.msg91.com/api/v5/otp',
    );

    if (!templateId || templateId.includes('your_msg91_template_id')) {
      this.logger.error('MSG91_OTP_TEMPLATE_NOT_CONFIGURED: Missing template ID configuration');
      throw new HttpException(
        'OTP template is not configured on server.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!authKey || authKey.includes('your_msg91_auth_key')) {
      this.logger.error('MSG91_AUTH_KEY_NOT_CONFIGURED: Missing auth key configuration');
      throw new HttpException(
        'OTP provider credentials are not configured.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const formattedMobile = toMsg91MobileFormat(mobileNumber);

    try {
      const url = `${apiUrl}?template_id=${encodeURIComponent(templateId)}&mobile=${encodeURIComponent(formattedMobile)}&authkey=${encodeURIComponent(authKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = (await response.json()) as any;

      if (response.ok && data?.type === 'success') {
        this.logger.log(`[MSG91] OTP sent successfully to ${mobileNumber}`);
        return {
          success: true,
          providerRef: data?.message || 'MSG91_SENT',
        };
      }

      this.logger.error(`[MSG91 Error] Code: ${data?.code || response.status} | Type: ${data?.type}`);
      return {
        success: false,
        error: 'OTP_REQUEST_REJECTED',
      };
    } catch (error: any) {
      this.logger.error(`[MSG91 Transport Error] ${error?.message || error}`);
      return {
        success: false,
        error: 'OTP_PROVIDER_UNAVAILABLE',
      };
    }
  }

  async verifyOtp(mobileNumber: string, otp: string): Promise<OtpVerifyResult> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const verifyApiUrl = this.configService.get<string>(
      'MSG91_VERIFY_OTP_API_URL',
      'https://control.msg91.com/api/v5/otp/verify',
    );

    if (!authKey || authKey.includes('your_msg91_auth_key')) {
      throw new HttpException(
        'OTP provider credentials are not configured.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const formattedMobile = toMsg91MobileFormat(mobileNumber);

    try {
      const url = `${verifyApiUrl}?otp=${encodeURIComponent(otp)}&mobile=${encodeURIComponent(formattedMobile)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          authkey: authKey,
        },
      });

      const data = (await response.json()) as any;

      if (response.ok && data?.type === 'success') {
        this.logger.log(`[MSG91] OTP verified successfully for ${mobileNumber}`);
        return {
          success: true,
        };
      }

      this.logger.warn(`[MSG91 Verification Failed] Mobile: ${mobileNumber}`);
      return {
        success: false,
        error: 'INVALID_OTP',
      };
    } catch (error: any) {
      this.logger.error(`[MSG91 Verify Transport Error] ${error?.message || error}`);
      return {
        success: false,
        error: 'OTP_PROVIDER_UNAVAILABLE',
      };
    }
  }
}

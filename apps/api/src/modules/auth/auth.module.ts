import { Module, HttpException, HttpStatus } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RateLimiterService } from '../../common/utils/rate-limiter.util';
import { PrismaService } from '../../providers/database/prisma.service';
import { RedisService } from '../../providers/redis/redis.service';
import { OTP_PROVIDER_TOKEN } from './providers/otp-provider.interface';
import { Msg91OtpProvider } from './providers/msg91-otp.provider';
import { MockOtpProvider } from './providers/mock-otp.provider';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_ACCESS_SECRET',
          'zentra_dev_access_secret_min_32_chars_long',
        ),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RateLimiterService,
    PrismaService,
    RedisService,
    JwtAuthGuard,
    {
      provide: OTP_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('OTP_PROVIDER', 'mock').toLowerCase();
        const nodeEnv = configService.get<string>('NODE_ENV', 'development').toLowerCase();

        if (nodeEnv === 'production' && provider === 'mock') {
          throw new HttpException(
            'Mock OTP provider cannot be used in production environment (NODE_ENV=production). Please configure a production OTP provider.',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        if (provider === 'msg91') {
          return new Msg91OtpProvider(configService);
        }
        return new MockOtpProvider(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RedisService } from '../../providers/redis/redis.service';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Checks and enforces OTP request rate limits for mobile number & IP address
   */
  async checkOtpRateLimit(mobileNumber: string, ipAddress: string): Promise<void> {
    const now = Date.now();
    const cooldownKey = `cooldown:otp:${mobileNumber}`;
    const mobileCountKey = `ratelimit:mobile:${mobileNumber}`;
    const ipCountKey = `ratelimit:ip:${ipAddress}`;

    // 1. Check 60-second cooldown
    const cooldownTTL = await this.redisService.get(cooldownKey);
    if (cooldownTTL) {
      throw new HttpException(
        'Please wait 60 seconds before requesting another OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check mobile hourly count (Max 5 requests/hour)
    const mobileCountStr = await this.redisService.get(mobileCountKey);
    const mobileCount = mobileCountStr ? parseInt(mobileCountStr, 10) : 0;
    if (mobileCount >= 5) {
      throw new HttpException(
        'Maximum OTP requests exceeded for this mobile number. Please try again in an hour.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Check IP hourly count (Max 20 requests/hour)
    const ipCountStr = await this.redisService.get(ipCountKey);
    const ipCount = ipCountStr ? parseInt(ipCountStr, 10) : 0;
    if (ipCount >= 20) {
      throw new HttpException(
        'Too many OTP requests from this IP address. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Set cooldown (60 seconds)
    await this.redisService.set(cooldownKey, now.toString(), 60);

    // Increment mobile count (1 hour TTL)
    await this.redisService.set(mobileCountKey, (mobileCount + 1).toString(), 3600);

    // Increment IP count (1 hour TTL)
    await this.redisService.set(ipCountKey, (ipCount + 1).toString(), 3600);
  }
}

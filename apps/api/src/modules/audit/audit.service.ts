import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.service';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: CreateAuditLogParams): Promise<void> {
    try {
      // Security check: ensure metadata never contains sensitive tokens or authkeys
      const sanitizedMetadata = params.metadata ? this.sanitizeMetadata(params.metadata) : undefined;

      await this.prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
          metadata: sanitizedMetadata || undefined,
        },
      });

      this.logger.log(`[AUDIT] Action: ${params.action} | User: ${params.userId || 'ANONYMOUS'}`);
    } catch (error: any) {
      this.logger.error(`Failed to record audit log: ${error?.message || error}`);
    }
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized = { ...metadata };
    const sensitiveKeys = ['otp', 'authkey', 'password', 'token', 'accessToken', 'refreshToken', 'secret'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}

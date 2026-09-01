import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAllForUser(userId: string, currentSessionId?: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      include: { device: true },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((sess: any) => ({
      id: sess.id,
      status: sess.status,
      createdAt: sess.createdAt,
      lastUsedAt: sess.lastUsedAt,
      expiresAt: sess.expiresAt,
      ipAddress: sess.ipAddress,
      userAgent: sess.userAgent,
      currentSession: currentSessionId ? sess.id === currentSessionId : false,
      device: sess.device
        ? {
            platform: sess.device.platform,
            deviceModel: sess.device.deviceModel,
            appVersion: sess.device.appVersion,
          }
        : null,
    }));
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === 'REVOKED') {
      return { success: true, message: 'Session is already revoked' };
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await this.auditService.log({
      userId,
      action: 'SESSION_REVOKED',
      ipAddress,
      userAgent,
      metadata: { sessionId },
    });

    return { success: true, message: 'Session successfully revoked' };
  }

  async revokeOthers(
    userId: string,
    currentSessionId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const whereClause: any = {
      userId,
      status: 'ACTIVE',
    };

    if (currentSessionId) {
      whereClause.id = { not: currentSessionId };
    }

    const result = await this.prisma.session.updateMany({
      where: whereClause,
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await this.auditService.log({
      userId,
      action: 'OTHER_SESSIONS_REVOKED',
      ipAddress,
      userAgent,
      metadata: { count: result.count, preservedSessionId: currentSessionId },
    });

    return {
      success: true,
      count: result.count,
      message: `Successfully revoked ${result.count} other active session(s)`,
    };
  }
}

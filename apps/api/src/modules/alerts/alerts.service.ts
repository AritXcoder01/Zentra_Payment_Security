import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAllForUser(userId: string) {
    return this.prisma.securityAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, alertId: string, ipAddress?: string, userAgent?: string) {
    const alert = await this.prisma.securityAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new NotFoundException('Security alert not found');
    }

    if (!alert.isRead) {
      await this.prisma.securityAlert.update({
        where: { id: alertId },
        data: { isRead: true },
      });

      await this.auditService.log({
        userId,
        action: 'SECURITY_ALERT_READ',
        ipAddress,
        userAgent,
        metadata: { alertId },
      });
    }

    return { success: true, message: 'Alert marked as read' };
  }
}

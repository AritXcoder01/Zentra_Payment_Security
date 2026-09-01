import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AlertsService } from './alerts.service';

@ApiTags('Security Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('security-alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get security alerts for authenticated user' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.alertsService.findAllForUser(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a security alert as read' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.alertsService.markAsRead(userId, id, req.ip, req.headers['user-agent']);
  }
}

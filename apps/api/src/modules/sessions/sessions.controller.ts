import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get authenticated user active and historical sessions' })
  async findAll(@CurrentUser('id') userId: string, @Req() req: any) {
    return this.sessionsService.findAllForUser(userId, req.userSessionId);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke a specific user session' })
  async revoke(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.sessionsService.revokeSession(userId, id, req.ip, req.headers['user-agent']);
  }

  @Post('revoke-others')
  @ApiOperation({ summary: 'Sign out all other active sessions except current session' })
  async revokeOthers(@CurrentUser('id') userId: string, @Req() req: any) {
    return this.sessionsService.revokeOthers(
      userId,
      req.userSessionId,
      req.ip,
      req.headers['user-agent'],
    );
  }
}

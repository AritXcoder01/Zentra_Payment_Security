import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../providers/database/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const secret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'zentra_dev_access_secret_min_32_chars_long',
    );

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User account no longer exists');
      }

      if (user.accountStatus === 'DELETED') {
        throw new ForbiddenException('Account has been deleted');
      }

      if (user.accountStatus === 'SUSPENDED') {
        throw new ForbiddenException('Account is suspended');
      }

      request.user = user;
      request.userSessionId = payload.sid || null;
      return true;
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

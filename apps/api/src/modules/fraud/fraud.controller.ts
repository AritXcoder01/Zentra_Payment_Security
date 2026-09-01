import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FraudService } from './fraud.service';
import { CreateFraudReportDto } from './dto/create-fraud-report.dto';

@ApiTags('Fraud')
@Controller('fraud')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get active fraud classification taxonomy categories' })
  async getCategories() {
    return this.fraudService.getCategories();
  }

  @Post('reports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a fraud incident report' })
  async createReport(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFraudReportDto,
    @Req() req: any,
  ) {
    return this.fraudService.createReport(userId, dto, req.ip, req.headers['user-agent']);
  }

  @Get('reports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get authenticated user submitted fraud reports' })
  async findAllReports(@CurrentUser('id') userId: string) {
    return this.fraudService.findAllReports(userId);
  }

  @Get('reports/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get details of a specific fraud report' })
  async findOneReport(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.fraudService.findOneReport(userId, id);
  }

  @Get('reports/:id/guidance')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get deterministic guidance action plan for a fraud report' })
  async getGuidance(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.fraudService.getGuidance(userId, id);
  }
}

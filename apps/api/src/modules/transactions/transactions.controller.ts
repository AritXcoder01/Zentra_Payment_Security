import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a transaction' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTransactionDto,
    @Req() req: any,
  ) {
    return this.transactionsService.create(userId, dto, req.ip, req.headers['user-agent']);
  }

  @Get()
  @ApiOperation({ summary: 'Get authenticated user transaction history' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.transactionsService.findAll(userId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregated financial activity summary (Money In / Out)' })
  async getSummary(@CurrentUser('id') userId: string) {
    return this.transactionsService.getSummary(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific transaction' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transactionsService.findOne(userId, id);
  }
}

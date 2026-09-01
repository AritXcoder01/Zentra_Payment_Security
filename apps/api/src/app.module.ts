import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { SessionsModule } from './modules/sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    AuditModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    FraudModule,
    ResourcesModule,
    AlertsModule,
    SessionsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { FeesInsuranceController } from './fees-insurance.controller';
import { FeesInsuranceService } from './fees-insurance.service';
import { AuthModule } from '../01-auth/auth.module';
import { NotificationsModule } from '../11-notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [FeesInsuranceController],
  providers: [FeesInsuranceService],
  exports: [FeesInsuranceService],
})
export class FeesInsuranceModule {}

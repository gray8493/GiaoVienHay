import { Module } from '@nestjs/common';
import { FeesInsuranceController } from './fees-insurance.controller';
import { FeesInsuranceService } from './fees-insurance.service';
import { AuthModule } from '../01-auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FeesInsuranceController],
  providers: [FeesInsuranceService],
  exports: [FeesInsuranceService],
})
export class FeesInsuranceModule {}

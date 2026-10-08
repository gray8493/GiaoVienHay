import { Module } from '@nestjs/common';
import { RemarksController } from './remarks.controller';
import { RemarksService } from './remarks.service';
import { AuthModule } from '../01-auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RemarksController],
  providers: [RemarksService],
  exports: [RemarksService],
})
export class RemarksModule {}

import { Module } from '@nestjs/common';
import { ExamRemindersController } from './exam-reminders.controller';
import { ExamRemindersService } from './exam-reminders.service';
import { AuthModule } from '../01-auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ExamRemindersController],
  providers: [ExamRemindersService],
  exports: [ExamRemindersService],
})
export class ExamRemindersModule {}

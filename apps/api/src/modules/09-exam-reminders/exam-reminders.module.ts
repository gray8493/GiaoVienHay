import { Module } from '@nestjs/common';
import { ExamRemindersController } from './exam-reminders.controller';
import { ExamRemindersService } from './exam-reminders.service';
import { AuthModule } from '../01-auth/auth.module';
import { NotificationsModule } from '../11-notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [ExamRemindersController],
  providers: [ExamRemindersService],
  exports: [ExamRemindersService],
})
export class ExamRemindersModule {}

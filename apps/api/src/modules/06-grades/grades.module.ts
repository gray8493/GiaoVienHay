import { Module } from '@nestjs/common';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { AuthModule } from '../01-auth/auth.module';
import { NotificationsModule } from '../11-notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}

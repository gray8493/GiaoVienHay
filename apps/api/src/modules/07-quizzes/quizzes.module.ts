import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { AuthModule } from '../01-auth/auth.module';
import { AttendanceModule } from '../05-attendance/attendance.module';
import { NvidiaModule } from '../../common/nvidia/nvidia.module';
import { AdminModule } from '../12-admin/admin.module';

@Module({
  imports: [AuthModule, AttendanceModule, NvidiaModule, AdminModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}

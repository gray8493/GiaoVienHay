import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { AuthModule } from '../01-auth/auth.module';
import { AttendanceModule } from '../05-attendance/attendance.module';
import { GeminiModule } from '../../common/gemini/gemini.module';

@Module({
  imports: [AuthModule, AttendanceModule, GeminiModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}

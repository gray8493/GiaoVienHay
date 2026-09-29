import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { FirebaseModule } from './common/firebase/firebase.module';
import { GeminiModule } from './common/gemini/gemini.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// 12 Phân hệ nghiệp vụ chuẩn + Health Check
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/01-auth/auth.module';
import { UsersModule } from './modules/02-users/users.module';
import { ClassesModule } from './modules/03-classes/classes.module';
import { StudentsModule } from './modules/04-students/students.module';
import { AttendanceModule } from './modules/05-attendance/attendance.module';
import { GradesModule } from './modules/06-grades/grades.module';
import { QuizzesModule } from './modules/07-quizzes/quizzes.module';
import { RemarksModule } from './modules/08-remarks/remarks.module';
import { ExamRemindersModule } from './modules/09-exam-reminders/exam-reminders.module';
import { FeesInsuranceModule } from './modules/10-fees-insurance/fees-insurance.module';
import { NotificationsModule } from './modules/11-notifications/notifications.module';
import { AdminModule } from './modules/12-admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // In-memory Cache Module (0đ chi phí, tốc độ RAM)
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 phút mặc định
      max: 1000, // Giới hạn 1000 items trong RAM
    }),
    // Asynchronous Event Emitter Module (Xử lý tác vụ nặng bất đồng bộ ngầm)
    EventEmitterModule.forRoot(),

    FirebaseModule,
    GeminiModule,

    // Core & Business Modules
    HealthModule,
    AuthModule,
    UsersModule,
    ClassesModule,
    StudentsModule,
    AttendanceModule,
    GradesModule,
    QuizzesModule,
    RemarksModule,
    ExamRemindersModule,
    FeesInsuranceModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimingInterceptor, // Đo thời gian xử lý và gắn header X-Response-Time
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor, // Chuẩn hóa Envelope dữ liệu
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // Bắt lỗi và chuẩn hóa ErrorCode
    },
  ],
})
export class AppModule {}

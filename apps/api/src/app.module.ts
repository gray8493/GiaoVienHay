import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

import { SupabaseModule } from './common/supabase/supabase.module';
import { NvidiaModule } from './common/nvidia/nvidia.module';
import { FirebaseAdminModule } from './common/firebase/firebase-admin.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { UserThrottlerGuard } from './common/guards/user-throttler.guard';

import { AppController } from './app.controller';

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

    // Rate Limiting Throttler Module (Giới hạn request theo User / IP)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10000, // 10 giây (10.000 ms)
        limit: 30,  // Tối đa 30 requests / 10s (chống burst attack)
      },
      {
        name: 'medium',
        ttl: 60000, // 1 phút (60.000 ms)
        limit: 100, // Tối đa 100 requests / 1 phút cho mỗi User / Client IP
      },
    ]),

    SupabaseModule,
    NvidiaModule,
    FirebaseAdminModule,

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
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard, // Tự động kích hoạt Rate Limit toàn cục cho mọi API
    },
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

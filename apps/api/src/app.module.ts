import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 12 phân hệ nghiệp vụ sẽ được đăng ký tại đây:
    // AuthModule, UsersModule, ClassesModule, StudentsModule,
    // AttendanceModule, GradesModule, QuizzesModule, RemarksModule,
    // ExamRemindersModule, FeesInsuranceModule, NotificationsModule, AdminModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

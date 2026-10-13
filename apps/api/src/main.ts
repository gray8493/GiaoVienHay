import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    exposedHeaders: 'X-Response-Time',
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const formatErrors = (errs: any[]): { field: string; issue: string }[] => {
          const details: { field: string; issue: string }[] = [];
          for (const err of errs) {
            if (err.constraints) {
              const issues = Object.values(err.constraints) as string[];
              details.push({
                field: err.property,
                issue: issues[0] || 'Dữ liệu không hợp lệ',
              });
            }
            if (err.children && err.children.length > 0) {
              const childDetails = formatErrors(err.children);
              for (const cd of childDetails) {
                details.push({
                  field: `${err.property}.${cd.field}`,
                  issue: cd.issue,
                });
              }
            }
          }
          return details;
        };

        const details = formatErrors(errors);
        return new BadRequestException({
          message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
          error_code: 'COMMON_VALIDATION_ERROR',
          details,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('GiaoVienHay Backend API')
    .setDescription(
      'Hệ thống Quản lý Giáo dục & Trợ giảng Thông minh GiaoVienHay (Đầy đủ 12 phân hệ nghiệp vụ)',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Xác thực & Phiên làm việc')
    .addTag('Users', 'Hồ sơ người dùng & Thiết bị')
    .addTag('Classes', 'Quản lý Lớp học & Học sinh')
    .addTag('Students & Parent Portal', 'Cổng tra cứu toàn diện cho phụ huynh')
    .addTag('Attendance', 'Điểm danh 1-chạm & Cảnh báo vắng FCM')
    .addTag('Grades & Leaderboard', 'Sổ điểm điện tử & Vinh danh Top điểm cao')
    .addTag('Quizzes & Gamification', 'Trợ giảng AI, Vòng quay may mắn & 3 Mini-game')
    .addTag('Remarks', 'Nhận xét văn bản ngắn gọn & Phụ huynh xác nhận')
    .addTag('Exam Reminders', 'Nhắc lịch kiểm tra sắp tới tới phụ huynh')
    .addTag('Fees & Insurance', 'Theo dõi thu nộp BHYT & Học phí')
    .addTag('Notifications Log', 'Nhật ký thông báo đẩy FCM')
    .addTag('Admin', 'Quản trị người dùng & Giám sát hệ thống')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend API Server is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger Interactive Docs: http://localhost:${port}/api/docs`);
}
bootstrap();

import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getOptionsToken } from '@nestjs/throttler';
import { AppModule } from '../../apps/api/src/app.module';

function formatErrors(errs: any[]): { field: string; issue: string }[] {
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
}

// Bản sao exceptionFactory của main.ts để e2e khớp 100% hành vi production.
function validationExceptionFactory(errors: any[]) {
  const details = formatErrors(errors);

  const isDeviceTokenError = errors.some(
    (err) => err.property === 'fcm_device_token' || err.property === 'device_token',
  );
  if (isDeviceTokenError) {
    return new BadRequestException({
      message: 'fcm_device_token không được để trống',
      error_code: 'EMPTY_DEVICE_TOKEN',
      details,
    });
  }

  return new BadRequestException({
    message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
    error_code: 'COMMON_VALIDATION_ERROR',
    details,
  });
}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
    // Tắt rate-limit trong e2e: suite có hàng trăm request từ 127.0.0.1
    // (global guard chạy trước JwtAuthGuard nên mọi request đều tính theo IP).
    .overrideProvider(getOptionsToken())
    .useValue({
      throttlers: [{ name: 'e2e', ttl: 60000, limit: 1000000 }],
    })
    .compile();

  const app = moduleFixture.createNestApplication({ logger: false });
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  await app.init();
  return app;
}

// Sinh SĐT ngẫu nhiên hợp lệ (10 chữ số, đầu số di động VN) — mỗi spec
// dùng SĐT riêng để không đụng độ dữ liệu seed.
let phoneCounter = 0;
export function randomPhone(): string {
  phoneCounter += 1;
  const suffix = String(Date.now() % 100000000 + phoneCounter).padStart(8, '0').slice(-8);
  return `09${suffix}`;
}

export const TEST_PASSWORD = 'MatKhau123@';

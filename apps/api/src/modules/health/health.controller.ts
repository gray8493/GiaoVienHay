import {
  Controller,
  Get,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái máy chủ (Health Check Endpoint)',
    description: 'Dùng cho UptimeRobot, Render và Load Balancer ping định kỳ giữ server thức 24/24.',
  })
  checkHealth() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const memoryUsage = process.memoryUsage();

    return {
      status: 'UP',
      uptime: `${uptimeSeconds}s`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heap_used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heap_total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'production',
      gitCommit: process.env.RENDER_GIT_COMMIT || 'local',
      hasFirebaseCredentials: !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test-500')
  @ApiOperation({
    summary: 'Mô phỏng lỗi 500 Internal Server Error để kiểm thử',
    description: 'Endpoint này cố tình ném lỗi 500 để test giao diện hiển thị lỗi của Frontend & Exception Filter.',
  })
  test500() {
    throw new InternalServerErrorException(
      'Mô phỏng lỗi máy chủ 500 (Internal Server Error) thành công! Hệ thống Exception Filter đã bắt và format chuẩn xác.',
    );
  }

  @Get('test-503')
  @ApiOperation({
    summary: 'Mô phỏng lỗi 503 Service Unavailable để kiểm thử',
    description: 'Endpoint này cố tình ném lỗi 503 để test phản ứng khi dịch vụ quá tải hoặc bảo trì.',
  })
  test503() {
    throw new ServiceUnavailableException(
      'Mô phỏng lỗi 503 (Service Unavailable) thành công! Hệ thống đang tạm thời gián đoạn để bảo trì hoặc quá tải.',
    );
  }
}

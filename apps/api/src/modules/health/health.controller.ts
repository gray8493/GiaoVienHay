import { Controller, Get } from '@nestjs/common';
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
      timestamp: new Date().toISOString(),
    };
  }
}

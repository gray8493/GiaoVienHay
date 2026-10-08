import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { ErrorCode, ERROR_MESSAGES } from '@giaovienhay/shared-types';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  /**
   * Định danh Tracker cho từng client / user:
   * 1. Nếu đã đăng nhập (JWT Auth Guard đã gán req.user): dùng 'user_${uid}'
   * 2. Nếu khách vãng lai hoặc chưa đăng nhập: dùng IP của Client ('ip_${ip}')
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.user && (req.user.uid || req.user.id)) {
      return `user_${req.user.uid || req.user.id}`;
    }

    const clientIp =
      req.ips?.length ? req.ips[0] : (req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1');

    return `ip_${clientIp}`;
  }

  /**
   * Tùy biến Exception khi vượt quá ngưỡng rate limit:
   * Chuẩn hóa trả về ErrorCode.SYS_RATE_LIMIT_EXCEEDED và câu thông báo tiếng Việt chuẩn
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new HttpException(
      {
        success: false,
        status_code: HttpStatus.TOO_MANY_REQUESTS,
        error_code: ErrorCode.SYS_RATE_LIMIT_EXCEEDED,
        message: ERROR_MESSAGES[ErrorCode.SYS_RATE_LIMIT_EXCEEDED] || 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        details: {
          limit: throttlerLimitDetail.limit,
          ttl_ms: throttlerLimitDetail.ttl,
          time_to_expire: throttlerLimitDetail.timeToExpire,
        },
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

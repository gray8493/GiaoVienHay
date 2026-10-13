import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '@giaovienhay/shared-types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
        error_code: ErrorCode.AUTH_UNAUTHORIZED,
      });
    }

    const token = authHeader.split(' ')[1];
    const isLogout = request.url?.includes('/auth/logout');

    if (!token || token.trim() === '' || token === 'invalid_jwt_token' || token === 'invalid_token') {
      if (isLogout) {
        throw new UnauthorizedException({
          message: 'Token xác thực không hợp lệ hoặc đã bị thu hồi',
          error_code: ErrorCode.AUTH_TOKEN_INVALID,
        });
      }
      throw new UnauthorizedException({
        message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
        error_code: ErrorCode.AUTH_UNAUTHORIZED,
      });
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'giaovienhay_super_secret_jwt_key_2026';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      request.user = payload;
      return true;
    } catch (err: any) {
      if (isLogout) {
        throw new UnauthorizedException({
          message: 'Token xác thực không hợp lệ hoặc đã bị thu hồi',
          error_code: ErrorCode.AUTH_TOKEN_INVALID,
        });
      }
      throw new UnauthorizedException({
        message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
        error_code: ErrorCode.AUTH_UNAUTHORIZED,
      });
    }
  }
}

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
        message: 'Yêu cầu mã xác thực Bearer Token hợp lệ',
        error_code: ErrorCode.AUTH_UNAUTHORIZED,
      });
    }

    const token = authHeader.split(' ')[1];
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'giaovienhay_super_secret_jwt_key_2026';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException({
        message: 'Phiên làm việc đã hết hạn hoặc token không hợp lệ',
        error_code: ErrorCode.AUTH_TOKEN_EXPIRED,
      });
    }
  }
}

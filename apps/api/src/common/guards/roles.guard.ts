import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ErrorCode, UserRole } from '@giaovienhay/shared-types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(UserRole | string)[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException({
        message: 'Bạn không có quyền thực hiện hành động này',
        error_code: ErrorCode.AUTH_ROLE_FORBIDDEN,
      });
    }

    // Role matching logic
    const hasRole = requiredRoles.some((role) => {
      if (role === 'TEACHER_*') {
        return (
          user.role === UserRole.TEACHER ||
          user.role === UserRole.TEACHER_HOMEROOM ||
          user.role === UserRole.TEACHER_SUBJECT
        );
      }
      return user.role === role;
    });

    if (!hasRole) {
      throw new ForbiddenException({
        message: 'Tài khoản của bạn không có quyền hạn truy cập tài nguyên này',
        error_code: ErrorCode.AUTH_ROLE_FORBIDDEN,
      });
    }

    return true;
  }
}

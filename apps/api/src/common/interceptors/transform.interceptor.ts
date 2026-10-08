import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@giaovienhay/shared-types';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // If data already contains custom envelope, return directly
        if (data && typeof data === 'object' && 'success' in data && 'status_code' in data) {
          return {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          };
        }

        const message = data?.message || 'Thao tác thành công';
        const actualData = data?.data !== undefined ? data.data : data;

        return {
          success: true,
          status_code: statusCode,
          message: typeof message === 'string' ? message : 'Thao tác thành công',
          data: actualData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

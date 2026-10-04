import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse, ErrorCode } from '@giaovienhay/shared-types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Đã có lỗi xảy ra trên máy chủ, vui lòng thử lại sau';
    let errorCode: string = ErrorCode.SYS_INTERNAL_ERROR;
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        message = resObj.message || message;
        errorCode = resObj.error_code || this.mapStatusToErrorCode(status);
        details = resObj.details || (Array.isArray(resObj.message) ? resObj.message : undefined);

        if (Array.isArray(resObj.message)) {
          message = 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng';
          errorCode = ErrorCode.COMMON_VALIDATION_ERROR;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      status_code: status,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      error_code: errorCode,
      details,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorPayload);
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.COMMON_VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.AUTH_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.AUTH_ROLE_FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.SYS_ROUTE_NOT_FOUND;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.SYS_RATE_LIMIT_EXCEEDED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SYS_SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.SYS_INTERNAL_ERROR;
    }
  }
}

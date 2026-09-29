import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response, Request } from 'express';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl } = request;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        // Gắn header X-Response-Time cho client đo lường
        try {
          response.setHeader('X-Response-Time', `${duration}ms`);
        } catch (e) {}

        if (duration > 500) {
          this.logger.warn(`⚠️ [SLOW API] ${method} ${originalUrl} took ${duration}ms`);
        } else {
          this.logger.log(`⚡ [METRICS] ${method} ${originalUrl} - ${duration}ms`);
        }
      }),
    );
  }
}

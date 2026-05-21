import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ExceptionMapper } from './exceptionMapper';

@Catch()
export class GlobalExceptionFilterHandler implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilterHandler.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ method: string; url: string }>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : 500;
    const mapper = new ExceptionMapper().mapper(status);

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status}: ${
          isHttp ? JSON.stringify(exception.getResponse()) : String(exception)
        }`,
      );
    }

    response.status(status).json(mapper);
  }
}

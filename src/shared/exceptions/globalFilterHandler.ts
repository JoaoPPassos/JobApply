import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ExceptionMapper } from './exceptionMapper';
import { BaseException } from './baseException';

@Catch()
export class GlobalExceptionFilterHandler implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilterHandler.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ method: string; url: string }>();

    let status: number;
    let message: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.extractHttpMessage(exception);
    } else if (exception instanceof BaseException) {
      status = exception.statusCode;
      message = exception.message;
    } else if (
      exception instanceof QueryFailedError &&
      (exception as QueryFailedError & { code: string }).code === '23505'
    ) {
      status = 409;
      message = 'Resource already exists';
    } else {
      status = 500;
    }

    const mapper = new ExceptionMapper().mapper(status, message);

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status}: ${
          exception instanceof HttpException
            ? JSON.stringify(exception.getResponse())
            : String(exception)
        }`,
      );
    }

    response.status(status).json(mapper);
  }

  private extractHttpMessage(exception: HttpException): string {
    const res = exception.getResponse();

    if (typeof res === 'string') return res;

    if (typeof res === 'object' && res !== null) {
      const { message } = res as Record<string, unknown>;
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }

    return exception.message;
  }
}

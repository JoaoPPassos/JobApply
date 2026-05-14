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

    const excep = exception instanceof HttpException;
    const status = excep ? exception.getStatus() : 500;
    const mapper = new ExceptionMapper().mapper(status);

    response.status(status).json(mapper);
  }
}

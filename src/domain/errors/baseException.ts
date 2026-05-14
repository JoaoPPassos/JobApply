import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(message: string, status: number) {
    super(message, status);
  }
}

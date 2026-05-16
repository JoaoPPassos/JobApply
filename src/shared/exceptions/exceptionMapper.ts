import { BaseException } from './baseException';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from './exceptions';

export class ExceptionMapper {
  mapper(status: number, message?: string): BaseException {
    switch (status) {
      case 400:
        return new BadRequestException(message);
      case 401:
        return new UnauthorizedException(message);
      case 403:
        return new ForbiddenException(message);
      case 404:
        return new NotFoundException(message);
      case 409:
        return new ConflictException(message);
      case 422:
        return new UnprocessableEntityException(message);
      default:
        return new InternalServerErrorException(message);
    }
  }
}

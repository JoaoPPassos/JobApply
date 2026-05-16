import { BaseException } from './baseException';

export class BadRequestException extends BaseException {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundException extends BaseException {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictException extends BaseException {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class UnprocessableEntityException extends BaseException {
  constructor(message = 'Unprocessable Entity') {
    super(message, 422);
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

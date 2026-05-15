import { ISuccessResponse } from './base.response';

export class SuccessResponse<T> implements ISuccessResponse<T> {
  constructor(
    public data: T,
    public statusCode: number,
    public message: string,
  ) {}

  toJson(): string {
    return JSON.stringify({
      data: this.data,
      statusCode: this.statusCode,
      message: this.message,
    });
  }
}

import { IBaseResponse } from './base.response';

export class FailResponse implements IBaseResponse {
  constructor(
    public statusCode: number,
    public message: string,
  ) {}

  toJson(): string {
    return JSON.stringify({
      statusCode: this.statusCode,
      message: this.message,
    });
  }
}

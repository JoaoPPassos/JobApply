export interface IBaseResponse {
  statusCode: number;
  message: string;
  toJson: () => string;
}

export interface ISuccessResponse<T> extends IBaseResponse {
  data: T;
}

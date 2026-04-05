export class ApiResponse<T> {
  readonly statusCode: number;
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
  readonly meta: object | null;

  constructor(
    statusCode: number,
    message: string,
    data: T | null = null,
    meta: object | null = null
  ) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}

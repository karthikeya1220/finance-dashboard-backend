export class ApiResponse<T> {
  readonly status: "success" | "error";
  readonly statusCode: number;
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
    this.status = statusCode < 400 ? "success" : "error";
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}

/**
 * Standard API response envelope
 * @template T - Type of the response data
 */
export class ApiResponse<T> {
  readonly statusCode: number;
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
  readonly meta: object | null;

  /**
   * Create a new API response
   * @param statusCode - HTTP status code
   * @param message - Response message
   * @param data - Response data payload
   * @param meta - Metadata (e.g., pagination info)
   */
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

/**
 * Details about a single error
 */
export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors: ErrorDetail[];

  /**
   * Create a new app error
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param errors - Array of error details
   */
  constructor(
    message: string,
    statusCode: number = 500,
    errors: ErrorDetail[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends AppError {
  /**
   * Create a new validation error
   * @param message - Error message
   * @param errors - Array of validation errors
   */
  constructor(message: string = "Validation failed", errors: ErrorDetail[] = []) {
    super(message, 422, errors);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  /**
   * Create a new authentication error
   * @param message - Error message
   */
  constructor(message: string = "Authentication failed") {
    super(message, 401, []);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  /**
   * Create a new forbidden error
   * @param message - Error message
   */
  constructor(message: string = "Access forbidden") {
    super(message, 403, []);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  /**
   * Create a new not found error
   * @param resource - Resource name that was not found
   */
  constructor(resource: string) {
    const message = `${resource} not found`;
    super(message, 404, []);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  /**
   * Create a new conflict error
   * @param message - Error message
   */
  constructor(message: string = "Conflict") {
    super(message, 409, []);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

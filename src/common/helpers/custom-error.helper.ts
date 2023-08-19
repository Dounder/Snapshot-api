export enum ErrorCodes {
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  CREATION_FAILED = 'CREATION_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class CustomError extends Error {
  code: number;

  constructor({ message, code }: { message: string; code: number }) {
    super(message); // Pass the message to the base class

    // Ensure the name of this error is set as the class name
    this.name = this.constructor.name;

    // Save the error code
    this.code = code;

    // This clips the constructor off the stack trace, making it cleaner
    Error.captureStackTrace(this, this.constructor);
  }
}

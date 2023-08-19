import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorCodes } from './custom-error.helper';

const logger = new Logger('Exception');

export function ExceptionHandler(error: any) {
  if (!error.code) {
    // Unexpected error
    logger.log(error);
    throw new InternalServerErrorException({
      message: 'Unexpected error',
      error: ErrorCodes.UNEXPECTED_ERROR,
      statusCode: 500,
    });
  }

  switch (error.code) {
    // IX unique key violation error code in postgres
    case '23505':
      throw new BadRequestException({
        message: error.detail,
        error: ErrorCodes.ALREADY_EXISTS,
        statusCode: 409,
      });

    case 404:
      throw new NotFoundException({
        message: error.message,
        error: ErrorCodes.NOT_FOUND,
        statusCode: 404,
      });

    case 403:
      throw new ForbiddenException({
        message: error.message,
        error: ErrorCodes.FORBIDDEN,
        statusCode: 403,
      });

    case 401:
      throw new UnauthorizedException({
        message: error.message,
        error: ErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      });

    case 400:
      throw new BadRequestException({
        message: error.message,
        error: ErrorCodes.BAD_REQUEST,
        statusCode: 400,
      });

    default:
      logger.log(error);
      throw new InternalServerErrorException({
        message: 'Unexpected error',
        error: ErrorCodes.UNEXPECTED_ERROR,
        statusCode: 500,
      });
  }
}

import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpStatusError } from '../../utils/httpStatusError';
import { ErrorResponseDto } from '../../dtos/common.dto';

interface PrismaKnownError {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaKnownError(value: unknown): value is PrismaKnownError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as { code?: unknown }).code === 'string'
  );
}

function normalizeMessage(response: string | object): string {
  if (typeof response === 'string') {
    return response;
  }

  if ('message' in response) {
    const message = (response as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Unexpected error';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response<ErrorResponseDto>>();
    const request = context.getRequest<Request>();
    const { status, message } = this.resolveException(exception);

    if (status >= 500) {
      const error = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`${request.method} ${request.url} failed`, error);
    }

    response.status(status).json({ message });
  }

  private resolveException(exception: unknown): { status: number; message: string } {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: normalizeMessage(exception.getResponse()),
      };
    }

    if (exception instanceof HttpStatusError) {
      return {
        status: exception.status,
        message: exception.message,
      };
    }

    if (isPrismaKnownError(exception)) {
      switch (exception.code) {
        case 'P2002':
          return {
            status: HttpStatus.CONFLICT,
            message: new ConflictException('A record with this unique value already exists').message,
          };
        case 'P2003':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Referenced record does not exist',
          };
        case 'P2025':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Record not found',
          };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}

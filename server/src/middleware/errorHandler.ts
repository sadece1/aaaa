import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ApiResponse } from '../types';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Detect database connection errors and convert to 503
  let retryAfter: number | undefined;
  if (
    err.message.includes('ECONNREFUSED') ||
    err.message.includes('ETIMEDOUT') ||
    err.message.includes('database') ||
    err.message.includes('connection') ||
    err.message.includes('Connection lost') ||
    (err as any).code === 'ECONNREFUSED' ||
    (err as any).code === 'ETIMEDOUT' ||
    (err as any).code === 'PROTOCOL_CONNECTION_LOST' ||
    (err as any).code === 'PROTOCOL_ENQUEUE_AFTER_QUIT'
  ) {
    statusCode = 503;
    message = 'Service temporarily unavailable. Database connection failed.';
    retryAfter = 30; // Retry after 30 seconds
    logger.error('Database connection error detected, returning 503:', {
      error: err.message,
      code: (err as any).code,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
    code: (err as any).code,
  });

  // Handle specific error types
  if (err.name === 'ValidationError' || err.message.includes('validation')) {
    statusCode = 422;
  } else if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
    statusCode = 401;
  } else if (err.name === 'ForbiddenError' || err.message.includes('forbidden')) {
    statusCode = 403;
  } else if (err.message.includes('not found') || err.message.includes('does not exist')) {
    statusCode = 404;
  } else if (err.message.includes('already exists') || err.message.includes('duplicate')) {
    statusCode = 409;
  }

  // Add Retry-After header for 503 errors (SEO best practice)
  if (statusCode === 503 && retryAfter) {
    res.setHeader('Retry-After', retryAfter.toString());
  }

  // Send error response
  const response: ApiResponse<null> = {
    success: false,
    error: message,
    message,
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err.stack || message;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Async Error Handler Wrapper
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};



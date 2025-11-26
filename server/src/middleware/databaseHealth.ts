import { Request, Response, NextFunction } from 'express';
import { getConnectionHealth } from '../config/database';
import { AppError } from './errorHandler';
import logger from '../utils/logger';

/**
 * Middleware to check database health before processing requests
 * Returns 503 if database is unavailable
 */
export const checkDatabaseHealth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const health = getConnectionHealth();
  
  if (!health.healthy) {
    logger.warn('Request blocked due to unhealthy database connection:', {
      url: req.originalUrl,
      method: req.method,
      lastError: health.lastError,
      retryCount: health.retryCount,
    });
    
    res.setHeader('Retry-After', '30');
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable. Database connection failed.',
      message: 'Service temporarily unavailable. Please try again later.',
      retryAfter: 30,
    });
    return;
  }
  
  next();
};

/**
 * Optional database health check - logs warning but allows request to proceed
 * Use this for non-critical endpoints
 */
export const optionalDatabaseHealthCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const health = getConnectionHealth();
  
  if (!health.healthy) {
    logger.warn('Database connection unhealthy (non-blocking):', {
      url: req.originalUrl,
      method: req.method,
      lastError: health.lastError,
    });
    // Continue processing - endpoint may handle gracefully
  }
  
  next();
};



import { Response } from 'express';
import { getConnectionHealth } from '../config/database';
import logger from './logger';

/**
 * Graceful degradation helper
 * Returns cached or default responses when database is unavailable
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<any>>();

/**
 * Get cached data if available and not expired
 */
export const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
};

/**
 * Set cache entry
 */
export const setCached = <T>(key: string, data: T, ttl: number = 300000): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

/**
 * Check if database is available
 */
export const isDatabaseAvailable = (): boolean => {
  const health = getConnectionHealth();
  return health.healthy;
};

/**
 * Send graceful degradation response when database is unavailable
 */
export const sendGracefulResponse = (
  res: Response,
  message: string = 'Service temporarily unavailable',
  cachedData?: any
): void => {
  res.setHeader('Retry-After', '30');
  res.setHeader('X-Service-Status', 'degraded');
  
  if (cachedData) {
    res.setHeader('X-Data-Source', 'cache');
    res.status(200).json({
      success: true,
      data: cachedData,
      message: `${message} (serving cached data)`,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      success: false,
      error: message,
      message: 'Service temporarily unavailable. Please try again later.',
      retryAfter: 30,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Cache key generators
 */
export const cacheKeys = {
  categories: () => 'cache:categories',
  gear: (filters?: string) => `cache:gear:${filters || 'all'}`,
  blog: (id?: string) => `cache:blog:${id || 'list'}`,
  campsites: (filters?: string) => `cache:campsites:${filters || 'all'}`,
};

/**
 * Clear cache
 */
export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    logger.info('Cache cleared');
    return;
  }
  
  // Clear matching keys
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
  logger.info(`Cache cleared for pattern: ${pattern}`);
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
      expired: Date.now() - entry.timestamp > entry.ttl,
    })),
  };
};



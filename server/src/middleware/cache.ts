import { Request, Response, NextFunction } from 'express';
import { setCached, getCached } from '../utils/gracefulDegradation';

/**
 * Cache middleware for API responses
 * Reduces TTFB by caching frequently accessed data
 */

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean; // Condition to enable caching
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

/**
 * Generate cache key from request
 */
const defaultKeyGenerator = (req: Request): string => {
  const path = req.path;
  const query = req.query ? JSON.stringify(req.query) : '';
  const method = req.method;
  return `cache:${method}:${path}:${query}`;
};

/**
 * Cache middleware factory
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = DEFAULT_TTL,
    keyGenerator = defaultKeyGenerator,
    condition = () => true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check condition
    if (!condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator(req);

    // Try to get from cache
    const cached = getCached<any>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (body: any) {
      // Cache successful responses (status 200)
      if (res.statusCode === 200 && body) {
        setCached(cacheKey, body, ttl);
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=300');
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Static asset cache headers
 */
export const staticCacheHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Cache static assets for 1 year
  if (req.path.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot|css|js)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
  }
  // Cache HTML for 1 hour
  else if (req.path.endsWith('.html') || req.path === '/') {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  // Cache API responses for 5 minutes (can be overridden by route-specific cache)
  else if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }

  next();
};

/**
 * No-cache middleware for sensitive endpoints
 */
export const noCache = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};


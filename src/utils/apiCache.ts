/**
 * Simple in-memory cache for API calls
 * Prevents duplicate requests and improves performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<any>>();

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

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
export const setCached = <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

/**
 * Clear cache entry
 */
export const clearCache = (key: string): void => {
  cache.delete(key);
};

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  cache.clear();
};

/**
 * Cached fetch wrapper
 * Automatically caches GET requests
 */
export const cachedFetch = async <T = any>(
  url: string,
  options: RequestInit = {},
  ttl: number = DEFAULT_TTL
): Promise<T> => {
  // Only cache GET requests
  if (options.method && options.method !== 'GET') {
    const response = await fetch(url, options);
    return response.json();
  }

  // Check cache first
  const cached = getCached<T>(url);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const response = await fetch(url, options);
  const data = await response.json();
  
  // Only cache successful responses
  if (response.ok) {
    setCached(url, data, ttl);
  }
  
  return data;
};


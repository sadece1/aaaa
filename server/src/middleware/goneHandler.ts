import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * List of permanently removed URLs (410 Gone)
 * These URLs should return 410 status to tell search engines
 * that the content is permanently removed and won't come back
 */
const goneUrls: string[] = [
  // Add permanently removed URLs here
  // Example: '/old-removed-page',
  // Example: '/deprecated-feature',
];

/**
 * 410 Gone Handler Middleware
 * Returns 410 for permanently removed content
 * This is better than 404 for SEO as it tells search engines
 * to remove the URL from index faster
 */
export const goneHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const path = req.path.toLowerCase();
  
  // Check if URL is in gone list
  if (goneUrls.includes(path)) {
    logger.info(`410 Gone: ${path}`, {
      originalUrl: req.originalUrl,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
    
    res.status(410).json({
      success: false,
      error: 'Gone',
      message: 'This resource has been permanently removed and is no longer available.',
      code: 410,
    });
    return;
  }
  
  next();
};

/**
 * Add a URL to the gone list
 */
export const addGoneUrl = (url: string): void => {
  if (!goneUrls.includes(url)) {
    goneUrls.push(url);
    logger.info(`Added to gone list: ${url}`);
  }
};

/**
 * Remove a URL from the gone list
 */
export const removeGoneUrl = (url: string): void => {
  const index = goneUrls.indexOf(url);
  if (index > -1) {
    goneUrls.splice(index, 1);
    logger.info(`Removed from gone list: ${url}`);
  }
};

/**
 * Get all gone URLs (for admin/debugging)
 */
export const getGoneUrls = (): string[] => {
  return [...goneUrls];
};


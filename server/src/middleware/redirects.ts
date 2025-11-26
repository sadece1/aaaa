import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Redirect mapping for old URLs to new URLs
 * Used for 301 permanent redirects to preserve SEO value
 */
const redirectMap: Record<string, string> = {
  // Turkish to English route mappings
  '/hakkimizda': '/about',
  '/hakkimizda/': '/about',
  '/blog/': '/blog',
  '/iletisim': '/contact',
  '/iletisim/': '/contact',
  '/referanslar': '/references',
  '/referanslar/': '/references',
  '/sss': '/faq',
  '/sss/': '/faq',
  '/ekipman': '/gear',
  '/ekipman/': '/gear',
  '/kategori': '/category',
  '/kategori/': '/category',
  
  // Add more redirects as needed
  // Example: '/old-page': '/new-page',
};

/**
 * 301 Permanent Redirect Middleware
 * Handles old URL redirects to preserve SEO value (PageRank)
 */
export const redirectMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const path = req.path.toLowerCase();
  
  // Check if path needs redirect
  if (redirectMap[path]) {
    const newPath = redirectMap[path];
    logger.info(`301 Redirect: ${path} -> ${newPath}`, {
      originalUrl: req.originalUrl,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
    
    // 301 Permanent Redirect (preserves 90-99% of PageRank)
    res.redirect(301, newPath);
    return;
  }
  
  // Check for trailing slash redirects (SEO best practice)
  if (path.length > 1 && path.endsWith('/')) {
    const pathWithoutSlash = path.slice(0, -1);
    if (redirectMap[pathWithoutSlash] || pathWithoutSlash.startsWith('/api')) {
      // Don't redirect API routes
      next();
      return;
    }
    
    // Redirect to version without trailing slash
    logger.info(`301 Redirect: ${path} -> ${pathWithoutSlash} (trailing slash)`, {
      originalUrl: req.originalUrl,
    });
    res.redirect(301, pathWithoutSlash);
    return;
  }
  
  next();
};

/**
 * Add a redirect mapping programmatically
 */
export const addRedirect = (oldPath: string, newPath: string): void => {
  redirectMap[oldPath] = newPath;
  logger.info(`Redirect mapping added: ${oldPath} -> ${newPath}`);
};

/**
 * Get all redirect mappings (for admin/debugging)
 */
export const getRedirects = (): Record<string, string> => {
  return { ...redirectMap };
};


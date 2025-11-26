/**
 * Image optimization utilities
 * Optimizes Unsplash URLs and local images for better performance
 * Supports WebP/AVIF formats and responsive images
 */

/**
 * Optimize image URL - supports both Unsplash and local images
 * For local images, returns optimized path (assumes backend handles conversion)
 * For Unsplash, adds WebP/AVIF parameters
 */
export const optimizeImage = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string => {
  if (!url || url.startsWith('data:')) {
    return url;
  }

  const { width, height, quality = 80, format = 'auto' } = options;

  // Handle Unsplash URLs
  if (url.includes('unsplash.com')) {
    return optimizeUnsplashUrl(url, width, quality);
  }

  // Handle local images - assume backend can serve WebP/AVIF
  // For now, return as-is but add query params for future backend optimization
  try {
    const urlObj = new URL(url, window.location.origin);
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    if (quality) urlObj.searchParams.set('q', quality.toString());
    if (format !== 'auto') urlObj.searchParams.set('fm', format);
    return urlObj.toString();
  } catch {
    // Relative URL - return as-is (backend should handle optimization)
    return url;
  }
};

/**
 * Optimize Unsplash image URL with WebP format and appropriate sizing
 */
export const optimizeUnsplashUrl = (
  url: string,
  width?: number,
  quality: number = 80
): string => {
  if (!url || !url.includes('unsplash.com')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // Set WebP format for better compression
    params.set('fm', 'webp');

    // Set quality (80 is a good balance)
    params.set('q', quality.toString());

    // Set width if provided
    if (width) {
      params.set('w', width.toString());
    }

    // Add auto format for modern browsers
    params.set('auto', 'format');

    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original
    return url;
  }
};

/**
 * Generate optimized Unsplash URL with responsive sizes
 */
export const generateResponsiveUnsplashUrl = (
  baseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
): string[] => {
  if (!baseUrl || !baseUrl.includes('unsplash.com')) {
    return [baseUrl];
  }

  return sizes.map((size) => optimizeUnsplashUrl(baseUrl, size));
};

/**
 * Generate srcset string for responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
): string => {
  if (!baseUrl || !baseUrl.includes('unsplash.com')) {
    return '';
  }

  return sizes
    .map((size) => {
      const optimized = optimizeUnsplashUrl(baseUrl, size);
      return `${optimized} ${size}w`;
    })
    .join(', ');
};


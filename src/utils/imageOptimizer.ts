/**
 * Image optimization utilities
 * Optimizes Unsplash URLs and other image sources for better performance
 */

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


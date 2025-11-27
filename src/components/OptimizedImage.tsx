import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { optimizeUnsplashUrl, generateSrcSet } from '@/utils/imageOptimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onError?: () => void;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * OptimizedImage component with WebP/AVIF support and responsive images
 * Automatically optimizes Unsplash URLs and adds srcset for responsive loading
 */
export const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-image.jpg',
  onError,
  width,
  height,
  priority = false,
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Optimize image URL - add WebP format and size parameters
  const optimizedSrc = useMemo(() => {
    if (!src) return placeholder;
    
    // Use imageOptimizer utility for Unsplash URLs
    if (src.includes('unsplash.com')) {
      return optimizeUnsplashUrl(src, width);
    }
    
    // For local images and API uploads, add optimization parameters
    // This enables responsive images and format optimization
    // Handles both /path/to/image.jpg and /api/uploads/image.jpg
    if ((src.startsWith('/') || src.includes('/api/uploads/')) && !src.includes('?')) {
      // Add width parameter for responsive images
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      params.set('q', '80'); // Quality
      return `${src}?${params.toString()}`;
    }
    
    // If URL already has params, ensure optimization params are present
    if (src.includes('/api/uploads/') && src.includes('?')) {
      const urlObj = new URL(src, window.location.origin);
      if (!urlObj.searchParams.has('q')) urlObj.searchParams.set('q', '80');
      if (width && !urlObj.searchParams.has('w')) urlObj.searchParams.set('w', width.toString());
      return urlObj.toString();
    }
    
    return src;
  }, [src, width, placeholder]);

  // Generate srcset for responsive images
  const srcSet = useMemo(() => {
    if (!src) return undefined;
    
    // Unsplash images
    if (src.includes('unsplash.com')) {
      return generateSrcSet(src);
    }
    
    // Local images and API uploads - generate responsive srcset
    if ((src.startsWith('/') || src.includes('/api/uploads/')) && !src.includes('unsplash.com')) {
      const sizes = [400, 800, 1200, 1600];
      const baseUrl = src.split('?')[0]; // Remove existing params if any
      return sizes
        .map((size) => {
          const params = new URLSearchParams();
          params.set('w', size.toString());
          params.set('q', '80');
          return `${baseUrl}?${params.toString()} ${size}w`;
        })
        .join(', ');
    }
    
    return undefined;
  }, [src]);

  const handleError = () => {
    if (imageSrc !== placeholder) {
      setImageSrc(placeholder);
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <motion.picture
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* AVIF format (best compression) */}
        {srcSet && (
          <source
            srcSet={srcSet.replace(/[?&]fm=\w+/g, '').replace(/(\?|&)(w=\d+)/g, '$1$2&fm=avif&q=80')}
            type="image/avif"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {/* WebP format (good compression, wider support) */}
        {srcSet && (
          <source
            srcSet={srcSet.replace(/[?&]fm=\w+/g, '').replace(/(\?|&)(w=\d+)/g, '$1$2&fm=webp&q=80')}
            type="image/webp"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {/* Fallback to original */}
        <motion.img
          src={optimizedSrc}
          srcSet={srcSet}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </motion.picture>
    </div>
  );
};


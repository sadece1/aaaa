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
    
    // For local images, return as-is
    return src;
  }, [src, width, placeholder]);

  // Generate srcset for responsive images
  const srcSet = useMemo(() => {
    if (!src || !src.includes('unsplash.com')) {
      return undefined;
    }
    
    // Use imageOptimizer utility to generate srcset
    return generateSrcSet(src);
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
            srcSet={srcSet.replace(/fm=webp/g, 'fm=avif')}
            type="image/avif"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {/* WebP format (good compression, wider support) */}
        {srcSet && (
          <source
            srcSet={srcSet}
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


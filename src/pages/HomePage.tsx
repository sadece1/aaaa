import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/Button';
import { OptimizedImage } from '@/components/OptimizedImage';
import { routes, config } from '@/config';
import { categoryManagementService } from '@/services/categoryManagementService';
import { Category } from '@/types';
import { formatDate, formatPrice } from '@/utils/validation';

export const HomePage = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Slider images
  const sliderImages = [
    '/1.webp',
    '/2.webp',
    '/3.webp',
    '/4.webp',
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [heroTouchStart, setHeroTouchStart] = useState(0);
  const [heroTouchEnd, setHeroTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSlideInterval, setAutoSlideInterval] = useState<NodeJS.Timeout | null>(null);
  const [categoryMouseStart, setCategoryMouseStart] = useState(0);
  const [categoryMouseEnd, setCategoryMouseEnd] = useState(0);
  const [isCategoryDragging, setIsCategoryDragging] = useState(false);
  const [categoryScrollLeft, setCategoryScrollLeft] = useState(0);
  const [categoryTouchStart, setCategoryTouchStart] = useState(0);
  const [categoryTouchScrollLeft, setCategoryTouchScrollLeft] = useState(0);
  const [isCategoryTouchDragging, setIsCategoryTouchDragging] = useState(false);
  const [categoryDragDistance, setCategoryDragDistance] = useState(0);
  
  useEffect(() => {
    // Auto slide with pause on interaction
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }
    }, 5000); // 5 saniyede bir değişir
    
    setAutoSlideInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sliderImages.length, isDragging]);
  
  // Touch handlers for category stories (mobile) - native scroll with link click prevention
  const onCategoryTouchStart = (e: React.TouchEvent) => {
    // Sadece başlangıç pozisyonunu kaydet, native scroll'a izin ver
    setCategoryTouchStart(e.targetTouches[0].clientX);
    setCategoryTouchScrollLeft(0);
    setIsCategoryTouchDragging(false);
    setCategoryDragDistance(0);
  };
  
  const onCategoryTouchMove = (e: React.TouchEvent) => {
    // Native scroll çalışsın, sadece drag distance'ı takip et (link tıklamasını engellemek için)
    if (categoryTouchStart) {
      const x = e.targetTouches[0].clientX;
      const distance = Math.abs(x - categoryTouchStart);
      setCategoryDragDistance(distance);
      // 10px'den fazla hareket varsa dragging olarak işaretle
      if (distance > 10) {
        setIsCategoryTouchDragging(true);
      }
    }
  };
  
  const onCategoryTouchEnd = () => {
    // Kısa bir süre sonra reset et (link tıklamasını engellemek için)
    setTimeout(() => {
      setCategoryDragDistance(0);
      setIsCategoryTouchDragging(false);
    }, 150);
    setCategoryTouchStart(0);
  };
  
  // Mouse drag handlers for category stories (desktop)
  const onCategoryMouseDown = (e: React.MouseEvent) => {
    setIsCategoryDragging(true);
    setCategoryDragDistance(0);
    setCategoryMouseStart(e.clientX);
    const scrollContainer = document.getElementById('category-stories-container');
    if (scrollContainer) {
      setCategoryScrollLeft(scrollContainer.scrollLeft);
    }
    e.preventDefault();
  };
  
  useEffect(() => {
    const handleCategoryMouseMove = (e: MouseEvent) => {
      if (!isCategoryDragging || !categoryMouseStart) return;
      
      const scrollContainer = document.getElementById('category-stories-container');
      if (scrollContainer) {
        const x = e.clientX;
        const walk = (x - categoryMouseStart) * 2; // Scroll speed multiplier
        setCategoryDragDistance(Math.abs(walk));
        scrollContainer.scrollLeft = categoryScrollLeft - walk;
      }
    };
    
    const handleCategoryMouseUp = () => {
      setIsCategoryDragging(false);
      setTimeout(() => {
        setCategoryDragDistance(0);
      }, 100);
      setCategoryMouseStart(0);
      setCategoryScrollLeft(0);
    };
    
    if (isCategoryDragging) {
      window.addEventListener('mousemove', handleCategoryMouseMove);
      window.addEventListener('mouseup', handleCategoryMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleCategoryMouseMove);
        window.removeEventListener('mouseup', handleCategoryMouseUp);
      };
    }
  }, [isCategoryDragging, categoryMouseStart, categoryScrollLeft]);
  
  // Swipe handlers for hero slider - Instagram style smooth swipe
  const heroMinSwipeDistance = 30;
  
  const onHeroTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setHeroTouchEnd(0);
    setHeroTouchStart(e.targetTouches[0].clientX);
  };
  
  const onHeroTouchMove = (e: React.TouchEvent) => {
    setHeroTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onHeroTouchEnd = () => {
    setIsDragging(false);
    if (!heroTouchStart || !heroTouchEnd) return;
    
    const distance = heroTouchStart - heroTouchEnd;
    const isLeftSwipe = distance > heroMinSwipeDistance;
    const isRightSwipe = distance < -heroMinSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    }
    
    // Reset after a delay
    setTimeout(() => {
      setHeroTouchStart(0);
      setHeroTouchEnd(0);
    }, 100);
  };
  
  // Mouse drag handlers for desktop
  const onHeroMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHeroTouchEnd(0);
    setHeroTouchStart(e.clientX);
    e.preventDefault();
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && heroTouchStart) {
        setHeroTouchEnd(e.clientX);
      }
    };
    
    const handleMouseUp = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      if (!heroTouchStart || !heroTouchEnd) return;
      
      const distance = heroTouchStart - heroTouchEnd;
      const isLeftSwipe = distance > heroMinSwipeDistance;
      const isRightSwipe = distance < -heroMinSwipeDistance;
      
      if (isLeftSwipe) {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      } else if (isRightSwipe) {
        setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
      }
      
      // Reset after a delay
      setTimeout(() => {
        setHeroTouchStart(0);
        setHeroTouchEnd(0);
      }, 100);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, heroTouchStart, heroTouchEnd, heroMinSwipeDistance, sliderImages.length]);
  
  const onHeroMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setHeroTouchStart(0);
      setHeroTouchEnd(0);
    }
  };
  
  // Navigation buttons for hero
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };
  
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };
  
  // Fetch sub-subcategories (alt alt kategoriler) - Load immediately on mount
  useEffect(() => {
    const loadSubSubCategories = async () => {
      try {
        // Get all categories at once (faster than multiple calls)
        const allCategories = await categoryManagementService.getAllCategories();
        
        // Get root categories
        const rootCategories = allCategories.filter(cat => !cat.parentId);
        
        // Get all subcategories from root categories
        const allSubCategories: Category[] = [];
        rootCategories.forEach(rootCat => {
          const children = allCategories.filter(cat => cat.parentId === rootCat.id);
          allSubCategories.push(...children);
        });
        
        // Get sub-subcategories (alt alt kategoriler)
        const allSubSubCategories: Category[] = [];
        allSubCategories.forEach(subCat => {
          const subChildren = allCategories.filter(cat => cat.parentId === subCat.id);
          allSubSubCategories.push(...subChildren);
        });
        
        // If no sub-subcategories, use subcategories instead
        const categoriesToShow = allSubSubCategories.length > 0 
          ? allSubSubCategories 
          : allSubCategories;
        
        // Limit to first 15 categories for display
        setSubCategories(categoriesToShow.slice(0, 15));
      } catch (error) {
        console.error('Failed to load subcategories:', error);
      }
    };
    
    // Load immediately, don't wait
    loadSubSubCategories();
  }, []);
  
  // No API calls - static content only
  // Data will be loaded on-demand when user navigates to blog/gear pages
  const featuredBlogs: any[] = [];
  const featuredGear: any[] = [];

  // Stats data - static values (no API dependency)
  const stats = [
    { label: 'Kamp Malzemesi', value: '500+', icon: '🎒', color: 'text-green-600' },
    { label: 'Blog Yazısı', value: '100+', icon: '📝', color: 'text-purple-600' },
    { label: 'Mutlu Müşteri', value: '5000+', icon: '😊', color: 'text-orange-600' },
    { label: 'Kiralık Ekipman', value: '300+', icon: '⛺', color: 'text-blue-600' },
  ];

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": config.appName,
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
          "width": 512,
          "height": 512
        },
        "description": "Doğada unutulmaz kamp deneyimleri için kiralık kamp malzemeleri pazaryeri",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "info@wecamp.com",
          "availableLanguage": "Turkish"
        }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": config.appName,
        "description": "Kiralık kamp malzemeleri pazaryeri - Doğada unutulmaz deneyimler için",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "inLanguage": "tr-TR",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        "url": baseUrl,
        "name": `${config.appName} - Ana Sayfa`,
        "description": "Doğada unutulmaz kamp deneyimleri için kiralık kamp malzemeleri. Türkiye'nin en kapsamlı kamp malzemeleri pazaryeri.",
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "about": {
          "@id": `${baseUrl}/#organization`
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": `${baseUrl}/mutlaka-bunu-kullan.webp`
        },
        "datePublished": "2024-01-01T00:00:00+03:00",
        "dateModified": new Date().toISOString(),
        "inLanguage": "tr-TR"
      }
    ]
  };

  return (
    <>
      <SEO
        title="WeCamp - Kiralık Kamp Malzemeleri Pazar Yeri | Doğada Unutulmaz Deneyimler"
        description="Doğada unutulmaz kamp deneyimleri için kiralık kamp malzemeleri. Türkiye'nin en kapsamlı kamp malzemeleri pazaryeri. 500+ kamp malzemesi ile doğada unutulmaz anılar biriktirin."
        keywords="kamp, kamp malzemeleri, doğa, outdoor, kamp çadırı, kamp ekipmanları, kamp rehberi, kiralık kamp malzemeleri, kamp pazarı, doğa aktiviteleri, kamp deneyimi, kamp tüyoları, WeCamp, kiralık çadır, kiralık kamp ekipmanları"
        image="/mutlaka-bunu-kullan.webp"
        url={baseUrl}
        canonicalUrl={baseUrl}
        structuredData={structuredData}
        author={config.appName}
        locale="tr_TR"
      />

      {/* Category Stories Section - Instagram Style - Render first so it appears above hero */}
      {subCategories.length > 0 && (
        <section className="pt-0 pb-4 sm:pb-6 md:pb-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="w-full max-w-7xl mx-auto px-4">
            <div
              id="category-stories-container"
              className={`flex gap-2 sm:gap-2 md:gap-3 lg:gap-2 overflow-x-auto lg:overflow-x-hidden pb-4 scrollbar-hide pl-2 sm:pl-4 md:pl-0 lg:pl-0 lg:justify-center snap-x snap-mandatory ${
                isCategoryDragging || isCategoryTouchDragging ? 'cursor-grabbing' : 'cursor-grab'
              } select-none`}
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
                scrollBehavior: 'smooth', // Smooth scroll for snap
                overscrollBehaviorX: 'contain',
                touchAction: 'pan-x', // Sadece yatay scroll'a izin ver
                scrollSnapType: 'x mandatory', // Snap scrolling
              }}
              onTouchStart={onCategoryTouchStart}
              onTouchMove={onCategoryTouchMove}
              onTouchEnd={onCategoryTouchEnd}
              onMouseDown={onCategoryMouseDown}
            >
              {subCategories.slice(0, 12).map((category, index) => {
                // Her 4. item'da snap (0, 4, 8, 12...)
                const isSnapPoint = index % 4 === 0;
                return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="flex-shrink-0 flex flex-col items-center group snap-start sm:snap-start md:snap-none lg:snap-none"
                  style={{ 
                    minWidth: '64px',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: isSnapPoint ? 'always' : 'normal', // Her 4. item'da dur
                  }}
                  onClick={(e) => {
                    // Prevent navigation if user was dragging (more than 5px)
                    if (categoryDragDistance > 5) {
                      e.preventDefault();
                    }
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-16 lg:h-16 rounded-full overflow-hidden cursor-pointer"
                    style={{
                      background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
                      padding: '2px',
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center">
                      {/* Use category icon if available, otherwise use tent icon */}
                      <span className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl">
                        {category.icon || '⛺'}
                      </span>
                    </div>
                  </motion.div>
                  <span className="mt-1 sm:mt-1.5 text-[9px] xs:text-[10px] sm:text-xs lg:text-[10px] text-gray-700 dark:text-gray-300 text-center max-w-[56px] xs:max-w-[64px] sm:max-w-[72px] lg:max-w-[64px] truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors px-1">
                    {category.name}
                  </span>
                </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Mobile optimized */}
      <section 
        className="relative h-[50vh] sm:h-[60vh] md:min-h-[70vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 cursor-grab active:cursor-grabbing select-none"
        onTouchStart={onHeroTouchStart}
        onTouchMove={onHeroTouchMove}
        onTouchEnd={onHeroTouchEnd}
        onMouseDown={onHeroMouseDown}
        onMouseLeave={onHeroMouseLeave}
      >
        {/* Slider Background */}
        <div className="absolute inset-0 w-full h-full">
          {sliderImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0,
                scale: currentSlide === index ? 1 : 1.05
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.4, 0.0, 0.2, 1] // Instagram-like smooth cubic bezier easing
              }}
            >
              {/* Optimized responsive images with WebP/AVIF support */}
              <picture>
                {/* AVIF format (best compression) */}
                <source
                  srcSet={`${image}?w=400&q=75&fm=avif 400w, ${image}?w=800&q=75&fm=avif 800w, ${image}?w=1280&q=75&fm=avif 1280w, ${image}?w=1920&q=75&fm=avif 1920w`}
                  type="image/avif"
                  sizes="100vw"
                />
                {/* WebP format (good compression, wider support) */}
                <source
                  srcSet={`${image}?w=400&q=75&fm=webp 400w, ${image}?w=800&q=75&fm=webp 800w, ${image}?w=1280&q=75&fm=webp 1280w, ${image}?w=1920&q=75&fm=webp 1920w`}
                  type="image/webp"
                  sizes="100vw"
                />
                {/* Fallback to original WebP with responsive srcset */}
                <source
                  srcSet={`${image}?w=400&q=75 400w, ${image}?w=800&q=75 800w, ${image}?w=1280&q=75 1280w, ${image}?w=1920&q=75 1920w`}
                  type="image/webp"
                  sizes="100vw"
                />
                <img
                  src={`${image}?w=1280&q=75`}
                  srcSet={`${image}?w=400&q=75 400w, ${image}?w=800&q=75 800w, ${image}?w=1280&q=75 1280w, ${image}?w=1920&q=75 1920w`}
                  alt={`Kamp manzarası ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover opacity-25 sm:opacity-30 md:opacity-20"
                  style={{ 
                    objectPosition: 'center center',
                    minHeight: '100%',
                    minWidth: '100%',
                  }}
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  width="1280"
                  height="853"
                  sizes="100vw"
                />
              </picture>
            </motion.div>
          ))}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent sm:from-black/60 sm:via-black/20 z-[1]" />

        {/* Navigation Buttons - Hidden on mobile, visible on larger screens */}
        <button
          onClick={goToPrevSlide}
          className="hidden sm:flex absolute left-2 sm:left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-300"
          aria-label="Previous slide"
          >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNextSlide}
          className="hidden sm:flex absolute right-2 sm:right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-300"
          aria-label="Next slide"
          >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slider Indicators - Mobile optimized */}
        <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 lg:bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 md:h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                currentSlide === index 
                  ? 'w-6 sm:w-8 md:w-10 bg-white' 
                  : 'w-1.5 sm:w-2 md:w-2.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Rakamlarla WeCamp
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Binlerce kullanıcının tercihi
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className={`text-4xl lg:text-5xl font-bold ${stat.color} dark:text-primary-400 mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium text-sm lg:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blog Posts - Hidden when no data (no API dependency) */}
      {false && featuredBlogs.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  📚 Öne Çıkan Blog Yazıları
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  En popüler ve güncel kamp rehberleri, ipuçları ve deneyimler
                </p>
              </div>
              <Link to={routes.blog} className="mt-4 sm:mt-0">
                <Button variant="outline" size="lg">
                  Tümünü Gör →
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <Link to={`/blog/${post.id}`}>
                    <div className="relative h-56 overflow-hidden">
                      <OptimizedImage
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        width={400}
                        height={225}
                        priority={index < 2} // First 2 blog images above-the-fold: eager loading
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-primary-600 text-white text-sm font-semibold rounded-full shadow-lg">
                          {post.category}
                        </span>
                      </div>
                      {post.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                            ⭐ Öne Çıkan
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="flex items-center">
                          <span className="mr-1.5">📅</span>
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1.5">📖</span>
                          {post.readTime} dk
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Gear Section - Hidden when no data (no API dependency) */}
      {false && featuredGear.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  🎒 Öne Çıkan Kamp Malzemeleri
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  En popüler ve kaliteli kamp ekipmanları
                </p>
              </div>
              <Link to={routes.gear} className="mt-4 sm:mt-0">
                <Button variant="outline" size="lg">
                  Tümünü Gör →
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGear.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <Link to={`/gear/${item.id}`}>
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {item.images && item.images.length > 0 ? (
                        <OptimizedImage
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          width={400}
                          height={225}
                          priority={index < 2} // First 2 gear images above-the-fold: eager loading
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🎒
                        </div>
                      )}
                      {!item.available && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            Kiralanamaz
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-2">
                        <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <h3 
                        className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          overflowX: 'hidden',
                          maxWidth: '100%',
                        }}
                      >
                        {item.name}
                      </h3>
                      <p 
                        className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          overflowX: 'hidden',
                          maxWidth: '100%',
                        }}
                      >
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {formatPrice(item.pricePerDay ?? item.price ?? 0)}
                          </span>
                        </div>
                        {item.rating && (
                          <div className="flex items-center text-yellow-500">
                            <span className="mr-1">⭐</span>
                            <span className="font-semibold">{typeof item.rating === 'number' ? item.rating.toFixed(1) : parseFloat(String(item.rating)).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Neden WeCamp?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Doğada unutulmaz deneyimler yaşamanız için ihtiyacınız olan her şey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '✅',
                title: 'Güvenli Ödeme',
                description: 'Güvenli ve hızlı ödeme sistemleri ile rahatça alışveriş yapın'
              },
              {
                icon: '🚚',
                title: 'Hızlı Teslimat',
                description: 'Seçtiğiniz malzemeleri hızlı ve güvenli bir şekilde kapınıza getiriyoruz'
              },
              {
                icon: '⭐',
                title: 'Kaliteli Ürünler',
                description: 'Sadece test edilmiş ve kaliteli kamp malzemeleri sunuyoruz'
              },
              {
                icon: '📱',
                title: 'Kolay Kullanım',
                description: 'Kullanıcı dostu arayüz ile kolayca rezervasyon yapabilirsiniz'
              },
              {
                icon: '🔄',
                title: 'Esnek İptal',
                description: 'Planlarınız değiştiyse esnek iptal politikamızdan yararlanın'
              },
              {
                icon: '💬',
                title: '7/24 Destek',
                description: 'Her zaman yanınızdayız. Sorularınız için 7/24 destek alabilirsiniz'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Maceranıza Bugün Başlayın
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Doğada unutulmaz anılar biriktirin ve kamp deneyiminizi en üst seviyeye çıkarın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={routes.blog}>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                  style={{ backgroundColor: '#eab308', borderColor: '#eab308', color: 'white' }}
                >
                  📖 Blog Yazılarını Keşfet
                </Button>
              </Link>
              <Link to={routes.gear}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 transition-all duration-300 shadow-xl"
                >
                  🎒 Kamp Malzemelerini İncele
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

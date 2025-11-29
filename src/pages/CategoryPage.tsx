import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { GearCard } from '@/components/GearCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Gear, Category, GearFilters } from '@/types';
import { categoryManagementService } from '@/services/categoryManagementService';
import { useGearStore } from '@/store/gearStore';

export const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { gear, fetchGear, isLoading: gearLoading } = useGearStore();
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [categoryGear, setCategoryGear] = useState<Gear[]>([]);
  const [filters, setFilters] = useState<GearFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (categorySlug) {
        setIsLoading(true);
        try {
          // Get category info from categoryManagementService
          const category = await categoryManagementService.getCategoryBySlug(categorySlug);
          
          if (category) {
            setCategoryInfo(category);
            // Get subcategories
            const children = await categoryManagementService.getChildCategories(category.id);
            setSubCategories(children);
          } else {
            // Category not found
            setCategoryInfo(null);
            setIsLoading(false);
            return;
          }
          
          // Fetch all gear and filter by category
          // Use reasonable limit (backend max is 100 anyway)
          fetchGear({}, 1, 500);
        } catch (error) {
          console.error('Failed to load category data:', error);
          setCategoryInfo(null);
          setIsLoading(false);
        }
      }
    };

    loadCategoryData();

    // Listen for category updates
    const handleCategoryUpdate = () => {
      loadCategoryData();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'camp_categories_storage') {
        loadCategoryData();
      }
    };

    window.addEventListener('categoriesUpdated', handleCategoryUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [categorySlug, fetchGear]);

  useEffect(() => {
    if (categorySlug) {
      const filterGear = async () => {
        try {
          const category = await categoryManagementService.getCategoryBySlug(categorySlug);
          if (!category) {
            setIsLoading(false);
            return;
          }

          if (gear.length > 0) {
            // Get all categories to build a mapping
            const allCategories = await categoryManagementService.getAllCategories();
            
            // Fetch backend categories to map UUID category_ids (with cache)
            let backendCategories: any[] = [];
            try {
              const { cachedFetch } = await import('@/utils/apiCache');
              const backendCategoriesResponse = await cachedFetch<{ success: boolean; data: any[] }>('/api/categories', {}, 5 * 60 * 1000); // Cache for 5 minutes
              if (backendCategoriesResponse.success && backendCategoriesResponse.data) {
                backendCategories = backendCategoriesResponse.data;
              }
            } catch (error) {
              // Failed to fetch backend categories, using frontend categories only
            }
            
            // Build a map of backend UUID category IDs to frontend category IDs
            const backendToFrontendCategoryMap = new Map<string, string>();
            backendCategories.forEach(backendCat => {
              const catId = backendCat.id;
              const catSlug = backendCat.slug?.toLowerCase().trim();
              if (catId && catSlug) {
                // Find matching frontend category by slug
                const matchingFrontendCat = allCategories.find(fc => 
                  fc.slug?.toLowerCase().trim() === catSlug
                );
                if (matchingFrontendCat) {
                  backendToFrontendCategoryMap.set(catId, matchingFrontendCat.id);
                }
              }
            });
            
            // Build a set of matching category IDs - ONLY the current category and its direct children
            // NOT parent categories (we want exact category match, not parent's all products)
            const matchingCategoryIds = new Set<string>();
            matchingCategoryIds.add(category.id);
            
            // Add direct child categories (if user wants to see subcategory products too)
            // But NOT parent categories
            const childCategories = allCategories.filter(c => c.parentId === category.id);
            childCategories.forEach(child => matchingCategoryIds.add(child.id));
            
            // Filter gear - ONLY show items that match the exact category or its direct children
            const filtered = gear.filter((item) => {
              // Get categoryId from item (could be categoryId or category_id from backend)
              const itemCategoryId = (item as any).categoryId || (item as any).category_id;
              
              if (!itemCategoryId) {
                return false;
              }
              
              // Check if item's categoryId matches the current category ID (exact match)
              if (matchingCategoryIds.has(itemCategoryId)) {
                return true;
              }
              
              // If item has a backend UUID category_id, map it to frontend category ID
              if (backendToFrontendCategoryMap.has(itemCategoryId)) {
                const frontendCategoryId = backendToFrontendCategoryMap.get(itemCategoryId);
                if (frontendCategoryId && matchingCategoryIds.has(frontendCategoryId)) {
                  return true;
                }
              }
              
              // Check if item's category field (slug) matches the current category slug (exact match only)
              const itemCategory = item.category || (item as any).category_slug;
              if (itemCategory && typeof itemCategory === 'string') {
                const normalizedItemCategory = itemCategory.toLowerCase().trim();
                const normalizedCategorySlug = category.slug.toLowerCase().trim();
                // Exact slug match only
                if (normalizedItemCategory === normalizedCategorySlug) {
                  return true;
                }
              }
              
              return false;
            });
            
            setCategoryGear(filtered);
            setIsLoading(false);
          } else if (!gearLoading) {
            // If gear is empty and not loading, try fetching again
            fetchGear({}, 1, 500);
          }
        } catch (error) {
          console.error('Failed to filter gear:', error);
          setIsLoading(false);
        }
      };
      
      filterGear();
    }
  }, [categorySlug, gear, gearLoading, fetchGear]);

  // Apply filters to category gear
  const filteredGear = useMemo(() => {
    let result = [...categoryGear];

    // Apply filters
    if (filters?.minPrice) {
      result = result.filter(g => g.pricePerDay >= filters.minPrice!);
    }
    if (filters?.maxPrice) {
      result = result.filter(g => g.pricePerDay <= filters.maxPrice!);
    }
    if (filters?.available !== undefined) {
      result = result.filter(g => g.available === filters.available);
    }
    // Status filter - handle 'for-sale-or-sold' to show both for-sale and sold items
    if (filters?.status) {
      if (filters.status === 'for-sale-or-sold') {
        // Get status from gear item (fallback to available for backward compatibility)
        result = result.filter(g => {
          const itemStatus = g.status || (g.available ? 'for-sale' : 'sold');
          return itemStatus === 'for-sale' || itemStatus === 'sold';
        });
      } else {
        // Filter by specific status
        result = result.filter(g => {
          const itemStatus = g.status || (g.available ? 'for-sale' : 'sold');
          return itemStatus === filters.status;
        });
      }
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(searchLower) ||
        g.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.brand && filters.brand.trim() !== '') {
      const brandLower = filters.brand.toLowerCase().trim();
      result = result.filter(g => {
        // First check if gear has a brand field that matches
        if (g.brand && g.brand.toLowerCase().includes(brandLower)) {
          return true;
        }
        // Then search in name, description, and specifications
        const nameMatch = g.name.toLowerCase().includes(brandLower);
        const descMatch = g.description.toLowerCase().includes(brandLower);
        const specMatch = g.specifications 
          ? Object.values(g.specifications).some(val => 
              String(val).toLowerCase().includes(brandLower)
            )
          : false;
        return nameMatch || descMatch || specMatch;
      });
    }
    if (filters?.color && filters.color.trim() !== '') {
      const colorLower = filters.color.toLowerCase().trim();
      result = result.filter(g => {
        // First check if gear has a color field that matches
        if (g.color && g.color.toLowerCase().includes(colorLower)) {
          return true;
        }
        // Then search in name, description, and specifications
        const nameMatch = g.name.toLowerCase().includes(colorLower);
        const descMatch = g.description.toLowerCase().includes(colorLower);
        const specMatch = g.specifications 
          ? Object.values(g.specifications).some(val => 
              String(val).toLowerCase().includes(colorLower)
            )
          : false;
        return nameMatch || descMatch || specMatch;
      });
    }
    if (filters?.minRating !== undefined) {
      result = result.filter(g => (g.rating || 0) >= filters.minRating!);
    }

    // Apply sorting
    if (filters?.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.pricePerDay - b.pricePerDay;
          case 'price-desc':
            return b.pricePerDay - a.pricePerDay;
          case 'name-asc':
            return a.name.localeCompare(b.name, 'tr');
          case 'name-desc':
            return b.name.localeCompare(a.name, 'tr');
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });
    }

    return result;
  }, [categoryGear, filters]);

  const isLoadingState = isLoading || gearLoading;

  if (isLoadingState) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <>
        <SEO title="Kategori Bulunamadı" description="Aradığınız kategori bulunamadı" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Kategori Bulunamadı
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Aradığınız kategori mevcut değil.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${categoryInfo.name} - WeCamp | Kamp Ekipmanları ve Malzemeleri`} 
        description={categoryInfo.description || `${categoryInfo.name} kategorisindeki ürünler. ${categoryInfo.name} kiralık kamp malzemeleri ve ekipmanları. Türkiye'nin en kapsamlı kamp pazar yeri.`} 
        keywords={`${categoryInfo.name}, kamp malzemeleri, kamp ekipmanları, kiralık kamp malzemeleri, ${categoryInfo.name} kiralama, outdoor ekipmanları`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white flex-1 min-w-0">
                {categoryInfo.icon && <span className="mr-2 sm:mr-3 flex-shrink-0">{categoryInfo.icon}</span>}
                <span className="break-words">{categoryInfo.name}</span>
              </h1>
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap flex-shrink-0 self-start sm:self-auto"
              >
                {isFilterOpen ? 'Filtreleri Gizle' : 'Filtreler'}
              </button>
            </div>
            {categoryInfo.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                {categoryInfo.description}
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="hidden lg:block">
                <FilterSidebar
                  type="gear"
                  filters={filters}
                  onFilterChange={setFilters}
                />
              </div>
              {isFilterOpen && (
                <div className="lg:hidden">
                  <FilterSidebar
                    type="gear"
                    filters={filters}
                    onFilterChange={setFilters}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sorting - Right Side */}
              <div className="flex justify-end mb-4">
                <div className="w-full sm:w-auto">
                  <select
                    value={filters.sortBy || ''}
                    onChange={(e) => {
                      setFilters({ ...filters, sortBy: e.target.value || undefined });
                    }}
                    className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sıralama Seçin</option>
                    <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                    <option value="name-asc">İsim: A-Z</option>
                    <option value="name-desc">İsim: Z-A</option>
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                  </select>
                </div>
              </div>
              {/* Sub Categories */}
              {subCategories.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Alt Kategoriler
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subCategories.map((subCat) => (
                      <Link
                        key={subCat.id}
                        to={`/category/${subCat.slug}`}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          {subCat.icon && <span className="text-2xl">{subCat.icon}</span>}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {subCat.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {filteredGear.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Ürünler
                    </h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredGear.length} ürün bulundu
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGear.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <GearCard gear={item} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  {categoryGear.length === 0
                    ? 'Bu kategoride henüz ürün bulunmamaktadır.'
                    : 'Aradığınız kriterlere uygun ürün bulunamadı.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



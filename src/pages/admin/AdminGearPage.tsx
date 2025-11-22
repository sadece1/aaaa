import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGearStore } from '@/store/gearStore';
import { categoryManagementService } from '@/services/categoryManagementService';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { routes } from '@/config';
import { Gear, Category } from '@/types';

type ViewMode = 'grid' | 'list' | 'category';
type SortOption = 'name' | 'price' | 'status' | 'date';

export const AdminGearPage = () => {
  const { gear, fetchGear, isLoading, deleteGear } = useGearStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [backendCategoryMap, setBackendCategoryMap] = useState<Map<string, string>>(new Map()); // UUID -> frontend category ID
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchGear({}, 1, 500); // Reasonable limit for admin page
    const loadCategories = async () => {
      const allCategories = await categoryManagementService.getAllCategories();
      setCategories(allCategories);
    };
    loadCategories();
    
    // Fetch backend categories and create mapping
    const fetchBackendCategories = async () => {
      try {
        // Get frontend categories first
        const allCategories = await categoryManagementService.getAllCategories();
        
        const response = await fetch('/api/categories');
        const backendCategoriesResponse = await response.json();
        if (backendCategoriesResponse.success && backendCategoriesResponse.data) {
          const backendCategories = backendCategoriesResponse.data;
          const map = new Map<string, string>();
          
          // Map backend UUIDs to frontend category IDs
          backendCategories.forEach((bc: any) => {
            const backendSlug = (bc.slug || '').toLowerCase().trim();
            const backendName = (bc.name || '').toLowerCase().trim();
            
            // Find matching frontend category
            const matchingFrontendCategory = allCategories.find(fc => {
              const frontendSlug = (fc.slug || '').toLowerCase().trim();
              const frontendName = (fc.name || '').toLowerCase().trim();
              
              // Exact match
              if (backendSlug === frontendSlug || backendName === frontendName) {
                return true;
              }
              
              // Partial match
              const backendWords = backendName.split(/\s+/);
              const frontendWords = frontendName.split(/\s+/);
              const hasMatchingWord = backendWords.some(bw => 
                frontendWords.some(fw => fw.includes(bw) || bw.includes(fw))
              );
              if (hasMatchingWord) {
                return true;
              }
              
              // Slug contains match
              if (backendSlug.includes(frontendSlug) || frontendSlug.includes(backendSlug)) {
                return true;
              }
              
              return false;
            });
            
            if (matchingFrontendCategory) {
              map.set(bc.id, matchingFrontendCategory.id);
            }
          });
          
          setBackendCategoryMap(map);
        }
      } catch (error) {
        console.warn('Failed to fetch backend categories for mapping:', error);
      }
    };
    
    fetchBackendCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // İstatistikler
  const stats = useMemo(() => {
    const forSale = gear.filter(g => (g.status || (g.available ? 'for-sale' : 'sold')) === 'for-sale').length;
    const orderable = gear.filter(g => {
      const status = g.status || (g.available ? 'for-sale' : 'sold');
      return status === 'waiting' || status === 'arrived' || status === 'shipped';
    }).length;
    const sold = gear.filter(g => (g.status || (g.available ? 'for-sale' : 'sold')) === 'sold').length;
    const totalValue = gear.reduce((sum, g) => sum + (g.pricePerDay || 0), 0);
    
    return {
      total: gear.length,
      forSale,
      orderable,
      sold,
      averagePrice: gear.length > 0 ? (totalValue / gear.length).toFixed(2) : '0',
    };
  }, [gear]);

  // Kategorilere göre ürünleri grupla
  const gearByCategory = useMemo(() => {
    const grouped: Record<string, Gear[]> = {};
    const uncategorized: Gear[] = [];

    gear.forEach((item) => {
      // Get category_id from item (could be categoryId or category_id from backend)
      const itemCategoryId = (item as any).categoryId || (item as any).category_id;
      let categoryKey: string | null = null;
      
      // Try to find category by frontend ID first
      let category = categories.find(c => c.id === itemCategoryId || c.slug === itemCategoryId);
      
      // If not found and itemCategoryId is a UUID, try backend category map
      if (!category && itemCategoryId && backendCategoryMap.has(itemCategoryId)) {
        const frontendCategoryId = backendCategoryMap.get(itemCategoryId);
        if (frontendCategoryId) {
          category = categories.find(c => c.id === frontendCategoryId);
        }
      }
      
      // If still not found, try to match by category slug
      if (!category && item.category) {
        category = categories.find(c => c.slug === item.category);
      }
      
      if (category) {
        categoryKey = category.slug || category.id;
      }

      if (categoryKey && categories.some(c => c.slug === categoryKey || c.id === categoryKey)) {
        if (!grouped[categoryKey]) {
          grouped[categoryKey] = [];
        }
        grouped[categoryKey].push(item);
      } else {
        uncategorized.push(item);
      }
    });

    const sorted: Record<string, Gear[]> = {};
    const rootCats = categories.filter(c => !c.parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
    const subCats = categories.filter(c => c.parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    rootCats.forEach((cat) => {
      const key = cat.slug || cat.id;
      if (grouped[key] && grouped[key].length > 0) {
        sorted[cat.name] = grouped[key];
      }
    });

    subCats.forEach((cat) => {
      const key = cat.slug || cat.id;
      if (grouped[key] && grouped[key].length > 0) {
        sorted[cat.name] = grouped[key];
      }
    });

    if (uncategorized.length > 0) {
      sorted['Kategorisiz'] = uncategorized;
    }

    return sorted;
  }, [gear, categories, backendCategoryMap]);

  // İlk yüklemede tüm kategorileri açık yap
  useEffect(() => {
    if (gear.length > 0 && categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(Object.keys(gearByCategory)));
    }
  }, [gearByCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tüm ürünleri düzleştir
  const allGear = useMemo(() => {
    return Object.values(gearByCategory).flat();
  }, [gearByCategory]);

  // Filtrelenmiş ve sıralanmış ürünler
  const filteredAndSortedGear = useMemo(() => {
    let filtered: Gear[] = [];

    // Kategori filtresi
    if (selectedCategory) {
      const selectedCat = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
      if (selectedCat) {
        const selectedCategoryIds = new Set([selectedCat.id]);
        const getAllChildIds = (parentId: string): void => {
          const children = categories.filter(c => c.parentId === parentId);
          children.forEach(child => {
            selectedCategoryIds.add(child.id);
            getAllChildIds(child.id);
          });
        };
        getAllChildIds(selectedCat.id);
        
        filtered = allGear.filter(item => {
          const itemCategoryId = item.categoryId || item.category;
          return selectedCategoryIds.has(itemCategoryId) || 
                 categories.some(cat => 
                   (cat.id === itemCategoryId || cat.slug === itemCategoryId) && 
                   selectedCategoryIds.has(cat.id)
                 );
        });
      } else {
        filtered = allGear;
      }
    } else {
      filtered = allGear;
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query)
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        const status = item.status || (item.available ? 'for-sale' : 'sold');
        return status === statusFilter;
      });
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (b.pricePerDay || 0) - (a.pricePerDay || 0);
        case 'status':
          const statusA = a.status || (a.available ? 'for-sale' : 'sold');
          const statusB = b.status || (b.available ? 'for-sale' : 'sold');
          return statusA.localeCompare(statusB);
        case 'date':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [allGear, searchQuery, selectedCategory, statusFilter, sortOption, categories]);

  // Kategori filtresi için yardımcı fonksiyon
  const getSelectedCategoryIds = useMemo(() => {
    if (!selectedCategory) return null;
    const selectedCat = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
    if (!selectedCat) return null;
    
    const selectedCategoryIds = new Set([selectedCat.id]);
    const getAllChildIds = (parentId: string): void => {
      const children = categories.filter(c => c.parentId === parentId);
      children.forEach(child => {
        selectedCategoryIds.add(child.id);
        getAllChildIds(child.id);
      });
    };
    getAllChildIds(selectedCat.id);
    return selectedCategoryIds;
  }, [selectedCategory, categories]);

  // Bir ürünün seçili kategoriye ait olup olmadığını kontrol eden fonksiyon
  const itemMatchesCategory = useCallback((item: Gear): boolean => {
    if (!getSelectedCategoryIds) return true;
    
    const itemCategoryId = item.categoryId || item.category;
    return getSelectedCategoryIds.has(itemCategoryId) || 
           categories.some(cat => 
             (cat.id === itemCategoryId || cat.slug === itemCategoryId) && 
             getSelectedCategoryIds.has(cat.id)
           );
  }, [getSelectedCategoryIds, categories]);

  // Filtrelenmiş kategoriler (category view için)
  const filteredCategories = useMemo(() => {
    const filtered: Record<string, Gear[]> = {};

    Object.entries(gearByCategory).forEach(([categoryName, items]) => {
      // Kategori filtresi - kategori seçiliyse sadece o kategoriyi göster
      if (selectedCategory) {
        const categoryMatches = categories.some(cat => 
          cat.name === categoryName && getSelectedCategoryIds?.has(cat.id)
        );
        if (!categoryMatches) {
          return; // Bu kategoriyi atla
        }
      }

      const filteredItems = items.filter(item => {
        // Kategori filtresi
        if (selectedCategory && !itemMatchesCategory(item)) {
          return false;
        }

        // Arama filtresi
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (!item.name.toLowerCase().includes(query) &&
              !item.description?.toLowerCase().includes(query) &&
              !item.brand?.toLowerCase().includes(query)) {
            return false;
          }
        }

        // Durum filtresi
        if (statusFilter !== 'all') {
          const status = item.status || (item.available ? 'for-sale' : 'sold');
          if (status !== statusFilter) {
            return false;
          }
        }

        return true;
      });

      // Sıralama
      filteredItems.sort((a, b) => {
        switch (sortOption) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return (b.pricePerDay || 0) - (a.pricePerDay || 0);
          case 'status':
            const statusA = a.status || (a.available ? 'for-sale' : 'sold');
            const statusB = b.status || (b.available ? 'for-sale' : 'sold');
            return statusA.localeCompare(statusB);
          case 'date':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default:
            return 0;
        }
      });

      if (filteredItems.length > 0) {
        filtered[categoryName] = filteredItems;
      }
    });

    return filtered;
  }, [gearByCategory, searchQuery, statusFilter, selectedCategory, categories, sortOption, getSelectedCategoryIds, itemMatchesCategory]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await deleteGear(id);
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (window.confirm(`${selectedItems.size} ürünü silmek istediğinizden emin misiniz?`)) {
      try {
        await Promise.all(Array.from(selectedItems).map(id => deleteGear(id)));
        setSelectedItems(new Set());
      } catch (error) {
        alert('Toplu silme işlemi başarısız oldu');
      }
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedGear.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedGear.map(g => g.id)));
    }
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAllCategories = () => {
    setExpandedCategories(new Set(Object.keys(filteredCategories)));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  const rootCategories = categories.filter(c => !c.parentId);

  const getStatusBadge = (item: Gear) => {
    const status = item.status || (item.available ? 'for-sale' : 'sold');
    const configs: Record<string, { label: string; bg: string; text: string }> = {
      'for-sale': { label: '🛒 Satılık', bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
      'waiting': { label: '📦 Bekleniyor', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
      'arrived': { label: '📦 Ürün Geldi', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
      'shipped': { label: '📦 Yola Çıktı', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
      'sold': { label: '✅ Satıldı', bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
    };
    const config = configs[status as keyof typeof configs] || configs['for-sale'];
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <SEO title="Ürün Yönetimi" description="Ürünleri yönetin" />
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Ürün Yönetimi
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                {stats.total} ürün yönetiliyor
              </p>
            </div>
            <Link to={routes.adminAddGear} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base px-4 py-2">
                <span>+</span>
                <span className="hidden xs:inline">Yeni Ürün Ekle</span>
                <span className="xs:hidden">Ekle</span>
              </Button>
            </Link>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">Toplam Ürün</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">{stats.total}</p>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-80 flex-shrink-0 ml-2">📦</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-green-100 text-xs sm:text-sm font-medium truncate">Satılık</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">{stats.forSale}</p>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-80 flex-shrink-0 ml-2">🛒</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-purple-100 text-xs sm:text-sm font-medium truncate">Sipariş Edilebilir</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">{stats.orderable}</p>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-80 flex-shrink-0 ml-2">📦</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-red-100 text-xs sm:text-sm font-medium truncate">Satıldı</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">{stats.sold}</p>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-80 flex-shrink-0 ml-2">✅</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-amber-100 text-xs sm:text-sm font-medium truncate">Ortalama Fiyat</p>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold mt-0.5 sm:mt-1">₺{stats.averagePrice}</p>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-80 flex-shrink-0 ml-2">💰</div>
              </div>
            </motion.div>
          </div>

          {/* Filtreler ve Kontroller */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {/* Arama */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  🔍 Ara
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün adı, açıklama veya marka ile ara..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Kategori Filtresi */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  🏷️ Kategori
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Tüm Kategoriler</option>
                  {rootCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Durum Filtresi */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  📊 Durum
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="for-sale">Satılık</option>
                  <option value="waiting">Bekleniyor</option>
                  <option value="arrived">Ürün Geldi</option>
                  <option value="shipped">Yola Çıktı</option>
                  <option value="sold">Satıldı</option>
                </select>
              </div>
            </div>

            {/* View Mode, Sort ve Toplu İşlemler */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 w-full xs:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Görünüm:</span>
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 sm:p-1 flex-1 xs:flex-initial">
                    <button
                      onClick={() => setViewMode('category')}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'category'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="hidden sm:inline">📁 Kategoriler</span>
                      <span className="sm:hidden">📁</span>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'grid'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="hidden sm:inline">⊞ Grid</span>
                      <span className="sm:hidden">⊞</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'list'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="hidden sm:inline">☰ Liste</span>
                      <span className="sm:hidden">☰</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full xs:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sırala:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="flex-1 xs:flex-initial px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="name">İsme Göre</option>
                    <option value="price">Fiyata Göre</option>
                    <option value="status">Duruma Göre</option>
                    <option value="date">Tarihe Göre</option>
                  </select>
                </div>
              </div>

              {selectedItems.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 w-full sm:w-auto justify-end"
                >
                  <span className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                    {selectedItems.size} seçili
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    🗑️ <span className="hidden sm:inline">Toplu Sil</span>
                    <span className="sm:hidden">Sil</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Ürünler */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {viewMode === 'category' ? (
            <div className="space-y-3 sm:space-y-4">
              {Object.keys(filteredCategories).length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-6 sm:p-8 md:p-12 text-center">
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📦</div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                        {searchQuery || selectedCategory || statusFilter !== 'all'
                      ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                      : 'Henüz ürün eklenmemiş.'}
                  </p>
                </div>
              ) : (
                    <>
                      {/* Kategori Görünümü Kontrolleri */}
                      <div className="flex flex-col xs:flex-row justify-end gap-2">
                        <button
                          onClick={expandAllCategories}
                          className="w-full xs:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          📂 <span className="hidden sm:inline">Tümünü Aç</span>
                          <span className="sm:hidden">Aç</span>
                        </button>
                        <button
                          onClick={collapseAllCategories}
                          className="w-full xs:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          📁 <span className="hidden sm:inline">Tümünü Kapat</span>
                          <span className="sm:hidden">Kapat</span>
                        </button>
                      </div>

                      {Object.entries(filteredCategories).map(([categoryName, items]) => {
                  const isExpanded = expandedCategories.has(categoryName);
                  return (
                          <motion.div
                      key={categoryName}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                    >
                      <button
                        onClick={() => toggleCategory(categoryName)}
                        className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <span className="text-xl sm:text-2xl flex-shrink-0">
                            {categories.find(c => c.name === categoryName)?.icon || '📦'}
                          </span>
                          <div className="text-left flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {categoryName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {items.length} ürün
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                            <AnimatePresence>
                      {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                          <div className="overflow-x-auto -mx-3 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    <input
                                      type="checkbox"
                                              checked={items.every(item => selectedItems.has(item.id))}
                                      onChange={() => {
                                        const allSelected = items.every(item => selectedItems.has(item.id));
                                        const newSelected = new Set(selectedItems);
                                        items.forEach(item => {
                                          if (allSelected) {
                                            newSelected.delete(item.id);
                                          } else {
                                            newSelected.add(item.id);
                                          }
                                        });
                                        setSelectedItems(newSelected);
                                      }}
                                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 sm:w-5 sm:h-5"
                                    />
                                  </th>
                                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            Ürün
                                  </th>
                                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden sm:table-cell">
                                    Fiyat
                                  </th>
                                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden md:table-cell">
                                    Durum
                                  </th>
                                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                    İşlemler
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map((item: Gear) => (
                                          <tr
                                    key={item.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  >
                                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4">
                                      <input
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => toggleSelectItem(item.id)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 sm:w-5 sm:h-5"
                                      />
                                    </td>
                                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4">
                                      <div className="flex items-center gap-2 sm:gap-3">
                                                {item.images && item.images.length > 0 && (
                                          <img
                                            src={item.images[0]}
                                            alt={item.name}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0"
                                          />
                                        )}
                                                <div className="min-w-0 flex-1">
                                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {item.name}
                                          </div>
                                          {item.description && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md hidden sm:block">
                                              {item.description}
                                            </div>
                                          )}
                                          {/* Mobilde fiyat ve durum */}
                                          <div className="sm:hidden mt-1 flex items-center gap-2">
                                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                              ₺{item.pricePerDay}
                                            </div>
                                            {getStatusBadge(item)}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                            <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                                              <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                      ₺{item.pricePerDay}
                                              </div>
                                      {item.deposit && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Depozito: ₺{item.deposit}
                                                </div>
                                      )}
                                    </td>
                                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                                              {getStatusBadge(item)}
                                    </td>
                                    <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                      <div className="flex items-center justify-end gap-2 sm:gap-3">
                                        <Link
                                          to={`/admin/gear/edit/${item.id}`}
                                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium whitespace-nowrap"
                                        >
                                                  <span className="hidden sm:inline">✏️ Düzenle</span>
                                                  <span className="sm:hidden">✏️</span>
                                        </Link>
                                        <button
                                          onClick={() => handleDelete(item.id)}
                                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium whitespace-nowrap"
                                        >
                                                  <span className="hidden sm:inline">🗑️ Sil</span>
                                                  <span className="sm:hidden">🗑️</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div>
                  {filteredAndSortedGear.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-6 sm:p-8 md:p-12 text-center">
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📦</div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                        Arama kriterlerinize uygun ürün bulunamadı.
                      </p>
                    </div>
                  ) : (
                    <>
                      {selectedItems.size > 0 && (
                        <div className="mb-4 flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {selectedItems.size} ürün seçildi
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={toggleSelectAll}
                              className="px-3 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors"
                            >
                              {selectedItems.size === filteredAndSortedGear.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                            </button>
                            <button
                              onClick={handleBulkDelete}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                              🗑️ Toplu Sil
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredAndSortedGear.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                          >
                            <div className="relative">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.name}
                                  className="w-full h-40 sm:h-48 object-cover"
                                />
                              ) : (
                                <div className="w-full h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-3xl sm:text-4xl">📦</span>
                    </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.has(item.id)}
                                  onChange={() => toggleSelectItem(item.id)}
                                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-white"
                                />
                              </div>
                            </div>
                            <div className="p-3 sm:p-4">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2">
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                                <div>
                                  <div className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                                    ₺{item.pricePerDay}
                                  </div>
                                  {item.deposit && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Depozito: ₺{item.deposit}
                                    </div>
                                  )}
                                </div>
                                <div className="self-start sm:self-auto">{getStatusBadge(item)}</div>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  to={`/admin/gear/edit/${item.id}`}
                                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary-600 text-white text-center text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                  <span className="hidden sm:inline">✏️ Düzenle</span>
                                  <span className="sm:hidden">✏️</span>
                                </Link>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedItems.size === filteredAndSortedGear.length && filteredAndSortedGear.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 sm:w-5 sm:h-5"
                            />
                          </th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Ürün
                          </th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden md:table-cell">
                            Kategori
                          </th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden sm:table-cell">
                            Fiyat
                          </th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden md:table-cell">
                            Durum
                          </th>
                          <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAndSortedGear.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📦</div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                                Arama kriterlerinize uygun ürün bulunamadı.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedGear.map((item) => {
                            // Get category_id from item (could be categoryId or category_id from backend)
                            const itemCategoryId = (item as any).categoryId || (item as any).category_id;
                            
                            // Try to find category by frontend ID first
                            let category = categories.find(c => c.id === itemCategoryId || c.slug === itemCategoryId);
                            
                            // If not found and itemCategoryId is a UUID, try backend category map
                            if (!category && itemCategoryId && backendCategoryMap.has(itemCategoryId)) {
                              const frontendCategoryId = backendCategoryMap.get(itemCategoryId);
                              if (frontendCategoryId) {
                                category = categories.find(c => c.id === frontendCategoryId);
                              }
                            }
                            
                            // If still not found, try to match by category slug
                            if (!category && item.category) {
                              category = categories.find(c => c.slug === item.category);
                            }
                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => toggleSelectItem(item.id)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4 sm:w-5 sm:h-5"
                                  />
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    {item.images && item.images.length > 0 && (
                                      <img
                                        src={item.images[0]}
                                        alt={item.name}
                                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover rounded-lg flex-shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {item.name}
                                      </div>
                                      {item.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md hidden sm:block">
                                          {item.description}
                                        </div>
                                      )}
                                      {/* Mobilde kategori, fiyat ve durum */}
                                      <div className="sm:hidden mt-1 space-y-1">
                                        {category && (
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {category.name}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                            ₺{item.pricePerDay}
                                          </div>
                                          {getStatusBadge(item)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    {category?.name || 'Kategorisiz'}
                                  </span>
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                                  <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                    ₺{item.pricePerDay}
                                  </div>
                                  {item.deposit && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Depozito: ₺{item.deposit}
                                    </div>
                                  )}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                                  {getStatusBadge(item)}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                  <div className="flex items-center justify-end gap-2 sm:gap-3">
                                    <Link
                                      to={`/admin/gear/edit/${item.id}`}
                                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium whitespace-nowrap"
                                    >
                                      <span className="hidden sm:inline">✏️ Düzenle</span>
                                      <span className="sm:hidden">✏️</span>
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium whitespace-nowrap"
                                    >
                                      <span className="hidden sm:inline">🗑️ Sil</span>
                                      <span className="sm:hidden">🗑️</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                  );
                })
              )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { routes } from '@/config';
import { Category } from '@/types';
import { categoryManagementService } from '@/services/categoryManagementService';

export const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  type CategoryType = 'root' | 'column' | 'leaf';
  const [categoryType, setCategoryType] = useState<CategoryType>('root');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>();
  const parentIdValue = watch('parentId');

  useEffect(() => {
    const loadCategories = async () => {
      const categories = await categoryManagementService.getAllCategories();
      setCategories(categories);
    };

    loadCategories();

    // Listen for category updates
    const handleCategoryUpdate = () => {
      loadCategories();
    };

    window.addEventListener('categoriesUpdated', handleCategoryUpdate);
    window.addEventListener('storage', handleCategoryUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
      window.removeEventListener('storage', handleCategoryUpdate);
    };
  }, []);

  const onSubmit = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Name validation: min 2, max 100 karakter
      if (!data.name || data.name.trim().length < 2) {
        alert('⚠️ Kategori adı en az 2 karakter olmalıdır.');
        return;
      }
      if (data.name.trim().length > 100) {
        alert('⚠️ Kategori adı en fazla 100 karakter olabilir.');
        return;
      }

      // Slug validation ve normalize etme
      let normalizedSlug = data.slug?.trim() || '';
      if (!normalizedSlug) {
        // Slug yoksa name'den oluştur
        normalizedSlug = data.name
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      } else {
        // Slug'u normalize et: sadece küçük harf, sayı ve tire
        normalizedSlug = normalizedSlug
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      // Slug pattern validation: sadece küçük harf, sayı ve tire
      if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
        alert('⚠️ Slug sadece küçük harf, sayı ve tire (-) içerebilir.');
        return;
      }

      if (normalizedSlug.length < 2) {
        alert('⚠️ Slug en az 2 karakter olmalıdır.');
        return;
      }

      if (normalizedSlug.length > 100) {
        alert('⚠️ Slug en fazla 100 karakter olabilir.');
        return;
      }

      // Parent ID validation: UUID format veya null
      let normalizedParentId: string | null = null;
      if (data.parentId && data.parentId.trim() !== '') {
        const parentIdTrimmed = data.parentId.trim();
        // UUID format kontrolü
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(parentIdTrimmed)) {
          alert('⚠️ Geçersiz üst kategori ID formatı.');
          return;
        }
        normalizedParentId = parentIdTrimmed;
      }

      // Order validation: number, integer, min 0
      let normalizedOrder = 0;
      if (data.order !== undefined && data.order !== null) {
        if (typeof data.order === 'number') {
          normalizedOrder = Math.max(0, Math.floor(data.order));
        } else {
          const parsed = parseInt(String(data.order), 10);
          if (isNaN(parsed) || parsed < 0) {
            normalizedOrder = 0;
          } else {
            normalizedOrder = parsed;
          }
        }
      }

      // Description validation: max 500 karakter
      const normalizedDescription = data.description && data.description.trim().length > 500 
        ? data.description.trim().substring(0, 500) 
        : data.description?.trim() || null;

      // Icon validation: max 50 karakter
      const normalizedIcon = data.icon && data.icon.trim().length > 50 
        ? data.icon.trim().substring(0, 50) 
        : data.icon?.trim() || null;

      const normalizedData = {
        name: data.name.trim(),
        slug: normalizedSlug,
        description: normalizedDescription,
        parentId: normalizedParentId,
        icon: normalizedIcon,
        order: normalizedOrder,
      };

      await categoryManagementService.createCategory(normalizedData);
      navigate(routes.adminCategories);
    } catch (error: any) {
      let errorMessage = 'Kategori eklenemedi';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Validation hataları için özel mesajlar
      if (errorMessage.includes('must be at least 2 characters') || errorMessage.includes('en az 2 karakter')) {
        alert('⚠️ Kategori adı en az 2 karakter olmalıdır.');
        return;
      }
      if (errorMessage.includes('must not exceed 100 characters') || errorMessage.includes('en fazla 100 karakter')) {
        alert('⚠️ Kategori adı en fazla 100 karakter olabilir.');
        return;
      }
      if (errorMessage.includes('Slug must contain only lowercase') || errorMessage.includes('Slug sadece')) {
        alert('⚠️ Slug sadece küçük harf, sayı ve tire (-) içerebilir.');
        return;
      }
      if (errorMessage.includes('already exists') || errorMessage.includes('zaten mevcut')) {
        alert(`⚠️ Bu kategori zaten mevcut!\n\nKategori adı veya slug'u değiştirip tekrar deneyin.`);
        return;
      }
      if (errorMessage.includes('Parent category not found') || errorMessage.includes('Üst kategori bulunamadı')) {
        alert('⚠️ Seçilen üst kategori bulunamadı. Lütfen geçerli bir üst kategori seçin.');
        return;
      }
      if (errorMessage.includes('cannot exceed three levels') || errorMessage.includes('üç seviyeyi aşamaz')) {
        alert('⚠️ Kategori hiyerarşisi en fazla 3 seviye olabilir (Ana Başlık > Sütun > Alt Kategori).');
        return;
      }

      // Genel hata mesajı
      alert(`❌ Hata: ${errorMessage}`);
    }
  };

  useEffect(() => {
    setValue('parentId', '');
    trigger('parentId');
  }, [categoryType, setValue, trigger]);

  const rootCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const columnCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (!cat.parentId) return false;
        const parent = categories.find((parentCat) => parentCat.id === cat.parentId);
        return parent && !parent.parentId;
      })
      .map((cat) => {
        const parent = categories.find((parentCat) => parentCat.id === cat.parentId);
        return {
          ...cat,
          parentName: parent?.name || 'Bilinmeyen',
          parentOrder: parent?.order || 0,
        };
      })
      .sort((a, b) => {
        if (a.parentOrder !== b.parentOrder) {
          return a.parentOrder - b.parentOrder;
        }
        return (a.order || 0) - (b.order || 0);
      });
  }, [categories]);

  const categoryTypeOptions: Array<{
    value: CategoryType;
    title: string;
    description: string;
    icon: string;
    disabled: boolean;
    disabledReason?: string;
  }> = [
    {
      value: 'root',
      title: 'Ana Başlık',
      description: 'Navbar üzerinde görünen üst seviye',
      icon: '🏕️',
      disabled: false,
    },
    {
      value: 'column',
      title: 'Sütun Kategorisi',
      description: 'Ana başlık altında kolon oluşturur',
      icon: '🧱',
      disabled: rootCategories.length === 0,
      disabledReason: rootCategories.length === 0 ? 'Önce en az bir ana kategori oluşturun.' : undefined,
    },
    {
      value: 'leaf',
      title: 'Alt Kategori',
      description: 'Ürün detayına yönlendiren son seviye',
      icon: '🔗',
      disabled: columnCategories.length === 0,
      disabledReason: columnCategories.length === 0 ? 'Önce ilgili sütun kategorilerini oluşturun.' : undefined,
    },
  ];

  return (
    <>
      <SEO title="Yeni Kategori Ekle" description="Yeni kategori ekleyin" />
      <AdminLayout>
        <div className="max-w-2xl mx-auto px-2 sm:px-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-8">
            Yeni Kategori Ekle
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
            <input
              type="hidden"
              {...register('parentId', {
                validate: (value) => {
                  if (categoryType === 'root') {
                    return true;
                  }
                  if (!value) {
                    return 'Lütfen bir üst kategori seçin';
                  }
                  return true;
                },
              })}
            />

            <Input
              label="Kategori Adı"
              {...register('name', { 
                required: 'Kategori adı gereklidir',
                minLength: { value: 2, message: 'En az 2 karakter olmalıdır' },
                maxLength: { value: 100, message: 'En fazla 100 karakter olabilir' },
              })}
              error={errors.name?.message}
            />

            <Input
              label="Slug"
              {...register('slug', { 
                required: false,
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Sadece küçük harf, sayı ve tire (-) içerebilir'
                },
                minLength: { value: 2, message: 'En az 2 karakter olmalıdır' },
                maxLength: { value: 100, message: 'En fazla 100 karakter olabilir' },
              })}
              error={errors.slug?.message}
              placeholder="kategori-adi (boş bırakılırsa otomatik oluşturulur)"
            />

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                Hiyerarşi Seviyesi *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {categoryTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col gap-1.5 sm:gap-2 rounded-xl border p-3 sm:p-4 cursor-pointer transition-all ${
                      categoryType === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500'
                    } ${option.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="categoryType"
                      value={option.value}
                      className="sr-only"
                      disabled={option.disabled}
                      checked={categoryType === option.value}
                      onChange={() => {
                        if (option.disabled) return;
                        setCategoryType(option.value);
                      }}
                    />
                    <div className="text-xl sm:text-2xl">{option.icon}</div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{option.title}</div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                    {option.disabled && option.disabledReason && (
                      <p className="text-[10px] sm:text-xs text-red-500">{option.disabledReason}</p>
                    )}
                    {categoryType === option.value && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-primary-600 dark:text-primary-400 font-semibold text-sm sm:text-base">
                        ✓
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Üst Kategori
              </label>
              {categoryType === 'root' && (
                <div className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                  Bu kategori ana başlık olarak oluşturulacak ve navbar üzerinde direkt görünecek.
                </div>
              )}

              {categoryType === 'column' && (
                <div className="space-y-2">
                  <select
                    value={parentIdValue || ''}
                    onChange={(e) => setValue('parentId', e.target.value, { shouldValidate: true })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Ana başlık seçin</option>
                    {rootCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon ? `${cat.icon} ` : ''}
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Sütun kategorileri yalnızca ana başlıkların altında yer alabilir.
                  </p>
                </div>
              )}

              {categoryType === 'leaf' && (
                <div className="space-y-2">
                  <select
                    value={parentIdValue || ''}
                    onChange={(e) => setValue('parentId', e.target.value, { shouldValidate: true })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sütun kategorisi seçin</option>
                    {columnCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parentName} › {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Alt kategoriler yalnızca sütun kategorileri altında oluşturulabilir.
                  </p>
                </div>
              )}

              {errors.parentId && categoryType !== 'root' && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.parentId.message}</p>
              )}
            </div>

            <Input
              label="İkon (emoji) - Opsiyonel"
              {...register('icon')}
              placeholder="🏕️ (boş bırakılabilir)"
              className="text-sm sm:text-base"
            />

            <Input
              label="Sıra"
              type="number"
              {...register('order', { valueAsNumber: true })}
              placeholder="0"
              className="text-sm sm:text-base"
            />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button type="submit" variant="primary" className="w-full sm:w-auto text-sm sm:text-base">
                Kaydet
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(routes.adminCategories)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};


import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useGearStore } from '@/store/gearStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { categoryManagementService } from '@/services/categoryManagementService';
import { brandService } from '@/services/brandService';
import { colorService } from '@/services/colorService';
import { gearService } from '@/services/gearService';
import { uploadService } from '@/services/uploadService';
import { routes } from '@/config';
import { Gear, Category, GearStatus } from '@/types';

export const EditGearPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGear, fetchGearById, updateGearInStore, isLoading } = useGearStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedFinalCategory, setSelectedFinalCategory] = useState<string>('');
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [finalCategories, setFinalCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [allGear, setAllGear] = useState<Gear[]>([]);
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] = useState<string[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  
  // YENİ: Direkt state ile rating yönetimi (React Hook Form'dan bağımsız)
  const [ratingState, setRatingState] = useState<number | null>(null);
  
  // YENİ: Direkt state ile specifications yönetimi (React Hook Form'dan bağımsız)
  const [specificationsState, setSpecificationsState] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  
  // Flag to prevent category state resets during initial load
  const [isLoadingCategoryHierarchy, setIsLoadingCategoryHierarchy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<Partial<Gear>>();

  const ratingValue = watch('rating');

  useEffect(() => {
    const loadRootCategories = async () => {
      const rootCats = await categoryManagementService.getRootCategories();
      setParentCategories(rootCats);
    };
    loadRootCategories();
    
    // Load brands and colors
    const loadBrandsAndColors = async () => {
      try {
        const allBrands = await brandService.getAllBrands();
        const brandNames = Array.isArray(allBrands) ? allBrands.map(b => b.name).filter(Boolean) : [];
        setBrands(brandNames);
      } catch (error) {
        console.error('❌ Failed to load brands:', error);
        setBrands([]);
      }
      
      try {
        const allColors = colorService.getAllColors();
        setColors(Array.isArray(allColors) ? allColors.map(c => c.name) : []);
      } catch (error) {
        console.error('Failed to load colors:', error);
        setColors([]);
      }
    };
    
    loadBrandsAndColors();
    
    // Load all gear for recommended products selection
    const loadAllGear = async () => {
      try {
        const response = await gearService.getGear({}, 1, 200); // Get gear for recommendations
        setAllGear(response.data);
      } catch (error) {
        console.error('Failed to load gear for recommendations:', error);
      }
    };
    loadAllGear();
    
    // Listen for updates
    const handleBrandsUpdate = async () => {
      try {
        const updatedBrands = await brandService.getAllBrands();
        const brandNames = Array.isArray(updatedBrands) ? updatedBrands.map(b => b.name).filter(Boolean) : [];
        setBrands(brandNames);
      } catch (error) {
        console.error('❌ Failed to update brands:', error);
        setBrands([]);
      }
    };
    
    const handleColorsUpdate = () => {
      try {
        const updatedColors = colorService.getAllColors();
        setColors(Array.isArray(updatedColors) ? updatedColors.map(c => c.name) : []);
      } catch (error) {
        console.error('Failed to update colors:', error);
        setColors([]);
      }
    };
    
    window.addEventListener('brandsUpdated', handleBrandsUpdate);
    window.addEventListener('colorsUpdated', handleColorsUpdate);
    
    return () => {
      window.removeEventListener('brandsUpdated', handleBrandsUpdate);
      window.removeEventListener('colorsUpdated', handleColorsUpdate);
    };
  }, []);

  useEffect(() => {
    if (id) {
      fetchGearById(id);
    }
  }, [id, fetchGearById]);

  useEffect(() => {
    if (currentGear) {
      // Status'u belirle (available'dan veya mevcut status'tan)
      const status = currentGear.status || (currentGear.available ? 'for-sale' : 'sold');
      
      // Get actual values - check all possible field names from backend
      const gearData = currentGear as any;
      
      // Ensure pricePerDay is a valid number, not NaN
      // Backend returns price_per_day (snake_case) as string, so we need to convert it
      let actualPricePerDay = gearData.pricePerDay ?? gearData.price_per_day ?? gearData.price ?? 0;
      if (typeof actualPricePerDay === 'string') {
        actualPricePerDay = parseFloat(actualPricePerDay) || 0;
      }
      if (typeof actualPricePerDay !== 'number' || isNaN(actualPricePerDay)) {
        actualPricePerDay = 0;
      }
      
      // Ensure deposit is a valid number or null
      // Backend may return deposit as string
      let actualDeposit = gearData.deposit ?? gearData.deposit_amount ?? null;
      if (actualDeposit !== null && actualDeposit !== undefined) {
        if (typeof actualDeposit === 'string') {
          actualDeposit = parseFloat(actualDeposit) || null;
        }
        if (typeof actualDeposit !== 'number' || isNaN(actualDeposit)) {
          actualDeposit = null;
        }
      }
      
      // Ensure rating is a valid number or null (0 is valid!)
      // Backend may return rating as string or null
      let actualRating: number | null = null;
      const rawRating = gearData.rating;
      if (rawRating !== undefined && rawRating !== null && rawRating !== '') {
        if (typeof rawRating === 'string') {
          const trimmed = rawRating.trim();
          if (trimmed === '' || trimmed === 'null') {
            actualRating = null;
          } else {
            const parsed = parseFloat(trimmed);
            actualRating = isNaN(parsed) ? null : parsed;
          }
        } else if (typeof rawRating === 'number') {
          actualRating = isNaN(rawRating) ? null : rawRating;
        } else {
          actualRating = null;
        }
      } else {
        actualRating = null;
      }
      
      // Reset form with all gear data - use actual values, not defaults
      const formData = {
        name: currentGear.name || '',
        description: currentGear.description || '',
        pricePerDay: actualPricePerDay,
        deposit: actualDeposit,
        brand: currentGear.brand || '',
        color: currentGear.color || '',
        rating: actualRating,
        status: status as GearStatus,
      };
      
      // Reset form immediately with defaultValues
      reset(formData, { keepDefaultValues: false });
      
      // Force set values multiple times to ensure they stick
      const setValues = () => {
        setValue('name', formData.name, { shouldValidate: false, shouldDirty: false });
        setValue('description', formData.description, { shouldValidate: false, shouldDirty: false });
        setValue('pricePerDay', formData.pricePerDay, { shouldValidate: false, shouldDirty: false });
        setValue('deposit', formData.deposit, { shouldValidate: false, shouldDirty: false });
        setValue('brand', formData.brand, { shouldValidate: false, shouldDirty: false });
        setValue('color', formData.color, { shouldValidate: false, shouldDirty: false });
        setValue('rating', formData.rating, { shouldValidate: false, shouldDirty: false });
        setValue('status', formData.status, { shouldValidate: false, shouldDirty: false });
      };
      
      // Set immediately
      setValues();
      
      // Then set again after delays to ensure they stick
      const timer1 = setTimeout(setValues, 50);
      const timer2 = setTimeout(setValues, 200);
      const timer3 = setTimeout(setValues, 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
      
      setImageUrls(currentGear.images && currentGear.images.length > 0 ? currentGear.images : []);
      setImageFiles([]);
      
      // Load recommended products
      if (currentGear.recommendedProducts && currentGear.recommendedProducts.length > 0) {
        setSelectedRecommendedProducts(currentGear.recommendedProducts);
      } else {
        setSelectedRecommendedProducts([]);
      }
      
      // Load specifications - YENİ: State'e direkt yükle
      if (currentGear.specifications && Object.keys(currentGear.specifications).length > 0) {
        const specsArray = Object.entries(currentGear.specifications).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setSpecifications(specsArray);
        setSpecificationsState(specsArray); // YENİ: State'e de yükle
      } else {
        setSpecifications([{ key: '', value: '' }]);
        setSpecificationsState([{ key: '', value: '' }]); // YENİ: State'e de yükle
      }
      
      // YENİ: Rating'i state'e direkt yükle - MEVCUT DEĞERİ KORU (0 dahil!)
      const gearRating = currentGear.rating;
      let finalRating: number | null = null;
      
      if (gearRating !== null && gearRating !== undefined) {
        if (typeof gearRating === 'number') {
          finalRating = isNaN(gearRating) ? null : gearRating;
        } else if (typeof gearRating === 'string') {
          const trimmed = String(gearRating).trim();
          if (trimmed === '' || trimmed === 'null') {
            finalRating = null;
          } else {
            const parsed = parseFloat(trimmed);
            finalRating = isNaN(parsed) ? null : parsed;
          }
        } else {
          finalRating = null;
        }
      } else {
        finalRating = null;
      }
      
      setRatingState(finalRating);
      
      // Category ve specifications yükleme artık ayrı useEffect'lerde yapılıyor
    }
  }, [currentGear, reset, setValue]);

  // CRITICAL: Separate useEffect to ALWAYS update rating state when currentGear.rating changes
  useEffect(() => {
    if (currentGear && currentGear.rating !== undefined) {
      const gearRating = currentGear.rating;
      let finalRating: number | null = null;
      
      if (gearRating !== null && gearRating !== undefined) {
        if (typeof gearRating === 'number') {
          finalRating = isNaN(gearRating) ? null : gearRating;
        } else if (typeof gearRating === 'string') {
          const trimmed = String(gearRating).trim();
          if (trimmed === '' || trimmed === 'null') {
            finalRating = null;
          } else {
            const parsed = parseFloat(trimmed);
            finalRating = isNaN(parsed) ? null : parsed;
          }
        } else {
          finalRating = null;
        }
      } else {
        finalRating = null;
      }
      
      // Only update if different to avoid infinite loops
      if (ratingState !== finalRating) {
        setRatingState(finalRating);
      }
    }
  }, [currentGear?.rating, currentGear?.id, ratingState]); // Only depend on rating and id, not entire currentGear

  // CRITICAL: Separate useEffect to ALWAYS update specifications state when currentGear.specifications changes
  useEffect(() => {
    if (currentGear && currentGear.specifications !== undefined) {
      // Convert current state to object for comparison
      const currentSpecsObj = specificationsState
        .filter(s => s.key.trim() && s.value.trim())
        .reduce((acc, s) => ({ ...acc, [s.key.trim()]: s.value.trim() }), {});
      const currentSpecsStr = JSON.stringify(currentSpecsObj);
      const gearSpecsStr = JSON.stringify(currentGear.specifications || {});
      
      // Only update if different to avoid unnecessary re-renders
      if (gearSpecsStr !== currentSpecsStr) {
        if (currentGear.specifications && Object.keys(currentGear.specifications).length > 0) {
          const specsArray = Object.entries(currentGear.specifications).map(([key, value]) => ({
            key,
            value: String(value),
          }));
          setSpecificationsState(specsArray);
          setSpecifications(specsArray);
        } else {
          // Empty specifications - set to empty array with one empty field
          if (specificationsState.length !== 1 || specificationsState[0].key !== '' || specificationsState[0].value !== '') {
            setSpecificationsState([{ key: '', value: '' }]);
            setSpecifications([{ key: '', value: '' }]);
          }
        }
      }
    }
  }, [currentGear?.specifications, currentGear?.id, currentGear?.updatedAt]); // Include updatedAt to detect when gear is updated

  // CRITICAL: Separate useEffect to ALWAYS update category selection when currentGear.categoryId changes
  useEffect(() => {
    if (currentGear && currentGear.categoryId && !isLoadingCategoryHierarchy) {
      const categoryId = currentGear.categoryId;
      const loadCategoryHierarchy = async () => {
        try {
          setIsLoadingCategoryHierarchy(true);
          const category = await categoryManagementService.getCategoryById(categoryId);
          if (category) {
            // Parent kategoriyi bul
            let current: Category | null = category;
            const path: Category[] = [];
            
            while (current) {
              path.unshift(current);
              if (current.parentId) {
                current = await categoryManagementService.getCategoryById(current.parentId);
              } else {
                break;
              }
            }
            
            if (path.length > 0) {
              const rootCategory = path[0];
              
              // Ana kategoriyi set et
              if (selectedParentCategory !== rootCategory.id) {
                setSelectedParentCategory(rootCategory.id);
              }
              
              // Alt kategorileri yükle
              if (path.length > 1) {
                const subCats = await categoryManagementService.getChildCategories(rootCategory.id);
                setSubCategories(subCats);
                
                const subCategory = path[1];
                if (selectedSubCategory !== subCategory.id) {
                  setSelectedSubCategory(subCategory.id);
                }
                
                // Final kategorileri yükle
                if (path.length > 2) {
                  const finalCats = await categoryManagementService.getChildCategories(subCategory.id);
                  setFinalCategories(finalCats);
                  
                  const finalCategory = path[2];
                  if (selectedFinalCategory !== finalCategory.id) {
                    setSelectedFinalCategory(finalCategory.id);
                  }
                } else {
                  setSelectedFinalCategory('');
                  setFinalCategories([]);
                }
              } else {
                setSelectedSubCategory('');
                setSubCategories([]);
                setSelectedFinalCategory('');
                setFinalCategories([]);
              }
              
              // Form value'larını set et
              const finalCategory = path[path.length - 1];
              setValue('categoryId', finalCategory.id, { shouldValidate: false, shouldDirty: false });
              setValue('category', finalCategory.slug, { shouldValidate: false, shouldDirty: false });
              setSelectedCategoryName(`${finalCategory.icon || ''} ${finalCategory.name}`);
            }
          }
        } catch (error) {
          console.error('Failed to sync category hierarchy:', error);
        } finally {
          setIsLoadingCategoryHierarchy(false);
        }
      };
      loadCategoryHierarchy();
    }
  }, [currentGear?.categoryId, currentGear?.id, currentGear?.updatedAt, setValue]); // Include updatedAt to detect when gear is updated

  // Ana kategori değiştiğinde alt kategorileri güncelle
  useEffect(() => {
    // Kategori hiyerarşisi yüklenirken state'leri sıfırlama
    if (isLoadingCategoryHierarchy) return;
    
    if (selectedParentCategory) {
      const loadSubCategories = async () => {
        const subCats = await categoryManagementService.getChildCategories(selectedParentCategory);
        setSubCategories(subCats);
        // Eğer mevcut alt kategori yeni ana kategorinin altında değilse, sıfırla
        if (selectedSubCategory && !subCats.find(c => c.id === selectedSubCategory)) {
          setSelectedSubCategory('');
          setSelectedFinalCategory('');
          setFinalCategories([]);
        }
      };
      loadSubCategories();
    } else {
      setSubCategories([]);
      // Sadece kullanıcı manuel olarak değiştirdiyse sıfırla
      if (!currentGear?.categoryId) {
        setSelectedSubCategory('');
        setSelectedFinalCategory('');
        setFinalCategories([]);
      }
    }
  }, [selectedParentCategory, isLoadingCategoryHierarchy, currentGear]);

  // Alt kategori değiştiğinde final kategorileri güncelle
  useEffect(() => {
    // Kategori hiyerarşisi yüklenirken state'leri sıfırlama
    if (isLoadingCategoryHierarchy) return;
    
    if (selectedSubCategory) {
      const loadFinalCategories = async () => {
        const finalCats = await categoryManagementService.getChildCategories(selectedSubCategory);
        setFinalCategories(finalCats);
        // Eğer mevcut final kategori yeni alt kategorinin altında değilse, sıfırla
        if (selectedFinalCategory && !finalCats.find(c => c.id === selectedFinalCategory)) {
          setSelectedFinalCategory('');
        }
      };
      loadFinalCategories();
    } else {
      setFinalCategories([]);
      // Sadece kullanıcı manuel olarak değiştirdiyse sıfırla
      if (!currentGear?.categoryId) {
        setSelectedFinalCategory('');
      }
    }
  }, [selectedSubCategory, isLoadingCategoryHierarchy, currentGear]);

  // Final kategori seçildiğinde form value'sunu güncelle
  useEffect(() => {
    const updateCategoryValue = async () => {
      if (selectedFinalCategory) {
        const category = await categoryManagementService.getCategoryById(selectedFinalCategory);
        if (category) {
          setValue('categoryId', category.id);
          setValue('category', category.slug);
          setSelectedCategoryName(`${category.icon || ''} ${category.name}`);
        }
      } else if (selectedSubCategory) {
        const category = await categoryManagementService.getCategoryById(selectedSubCategory);
        if (category) {
          setValue('categoryId', category.id);
          setValue('category', category.slug);
          setSelectedCategoryName(`${category.icon || ''} ${category.name}`);
        }
      } else if (selectedParentCategory) {
        const category = await categoryManagementService.getCategoryById(selectedParentCategory);
        if (category) {
          setValue('categoryId', category.id);
          setValue('category', category.slug);
          setSelectedCategoryName(`${category.icon || ''} ${category.name}`);
        }
      } else {
        setSelectedCategoryName('');
      }
    };
    updateCategoryValue();
  }, [selectedFinalCategory, selectedSubCategory, selectedParentCategory, setValue]);

  const onSubmit = async (data: Partial<Gear>) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // MANUALLY GET ALL VALUES - Don't trust handleSubmit
      const allFormValues = getValues();
      const watchedValues = watch();
      
      // Get values directly from form inputs
      const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
      const descriptionInput = document.querySelector<HTMLTextAreaElement>('textarea[name="description"]');
      const priceInput = document.querySelector<HTMLInputElement>('input[name="pricePerDay"]');
      const depositInput = document.querySelector<HTMLInputElement>('input[name="deposit"]');
      const brandInput = document.querySelector<HTMLInputElement>('input[name="brand"]');
      const colorInput = document.querySelector<HTMLInputElement>('input[name="color"]');
      const ratingInput = document.querySelector<HTMLInputElement>('input[name="rating"]');
      const statusInput = document.querySelector<HTMLSelectElement>('select[name="status"]');
      
      // Collect all values manually
      const manualData: any = {
        name: nameInput?.value || allFormValues.name || watchedValues.name || data.name || '',
        description: descriptionInput?.value || allFormValues.description || watchedValues.description || data.description || '',
        pricePerDay: priceInput?.value || allFormValues.pricePerDay || watchedValues.pricePerDay || data.pricePerDay || 0,
        deposit: depositInput?.value 
          ? (depositInput.value.trim() === '' ? null : (isNaN(Number(depositInput.value)) ? null : Number(depositInput.value)))
          : (allFormValues.deposit !== undefined && allFormValues.deposit !== null && !isNaN(Number(allFormValues.deposit))
            ? Number(allFormValues.deposit)
            : (watchedValues.deposit !== undefined && watchedValues.deposit !== null && !isNaN(Number(watchedValues.deposit))
              ? Number(watchedValues.deposit)
              : (data.deposit !== undefined && data.deposit !== null && !isNaN(Number(data.deposit))
                ? Number(data.deposit)
                : null))),
        brand: brandInput?.value || allFormValues.brand || watchedValues.brand || data.brand || '',
        color: colorInput?.value || allFormValues.color || watchedValues.color || data.color || '',
        rating: ratingInput?.value || allFormValues.rating || watchedValues.rating || ratingValue || data.rating || null,
        status: statusInput?.value || allFormValues.status || watchedValues.status || data.status || 'for-sale',
      };
      
      // Use manual data
      const formData = manualData;
      // Son seçilen kategoriyi belirle - mevcut kategoriyi de kontrol et
      let finalCategoryId = selectedFinalCategory || selectedSubCategory || selectedParentCategory || currentGear.categoryId;
      let finalCategorySlug = '';
      
      if (finalCategoryId) {
        const category = await categoryManagementService.getCategoryById(finalCategoryId);
        if (category) {
          finalCategorySlug = category.slug;
        }
      }

      // Sadece hiç kategori yoksa (yeni ürün gibi) hata ver
      if (!finalCategoryId) {
        alert('Lütfen bir kategori seçin!');
        setIsSubmitting(false);
        return;
      }

      // Upload new images if there are any
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          const uploadedFiles = await uploadService.uploadImages(imageFiles);
          uploadedImageUrls = uploadedFiles.map(file => uploadService.getFileUrl(file.path));
        } catch (error) {
          console.error('Failed to upload images:', error);
          alert('Resimler yüklenirken hata oluştu. Lütfen tekrar deneyin.');
          setIsSubmitting(false);
          setUploadingImages(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      // Combine existing URLs with newly uploaded images
      // Eğer imageUrls boşsa, mevcut resimleri koru
      const existingImages = imageUrls.length > 0 
        ? imageUrls 
        : (currentGear.images && currentGear.images.length > 0 ? currentGear.images : []);
      const validImages = [...existingImages, ...uploadedImageUrls].filter(url => url.trim() !== '');
      
      // YENİ MEKANİZMA 1: Teknik Özellikler - State'den direkt al, yoksa mevcut değerleri koru
      const specificationsObj: Record<string, string> = {};
      // ÖNEMLİ: specificationsState kullan (specifications değil!)
      specificationsState.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specificationsObj[spec.key.trim()] = spec.value.trim();
        }
      });
      
      // Extract and validate form values
      const pricePerDay = typeof formData.pricePerDay === 'number' && !isNaN(formData.pricePerDay) ? formData.pricePerDay : (formData.pricePerDay ? Number(formData.pricePerDay) : 0);
      const deposit = formData.deposit !== undefined && formData.deposit !== null && !isNaN(Number(formData.deposit)) ? Number(formData.deposit) : null;
      
      // YENİ MEKANİZMA 2: Yıldız (Rating) - State'den direkt al, yoksa mevcut değeri koru
      // Eğer ratingState null/undefined ise, mevcut rating'i koru (0 dahil!)
      let finalRatingValue: number | null = null;
      if (ratingState !== null && ratingState !== undefined) {
        // State'de değer var, direkt kullan
        finalRatingValue = ratingState;
      } else {
        // State'de değer yok, currentGear'den al
        const gearRating = currentGear.rating;
        if (gearRating !== null && gearRating !== undefined) {
          if (typeof gearRating === 'number') {
            finalRatingValue = isNaN(gearRating) ? null : gearRating;
          } else if (typeof gearRating === 'string') {
            const trimmed = String(gearRating).trim();
            if (trimmed === '' || trimmed === 'null') {
              finalRatingValue = null;
            } else {
              const parsed = parseFloat(trimmed);
              finalRatingValue = isNaN(parsed) ? null : parsed;
            }
          } else {
            finalRatingValue = null;
          }
        } else {
          finalRatingValue = null;
        }
      }
      
      // Specifications: Eğer state'de değer yoksa veya sadece boş alanlar varsa, mevcut değerleri koru
      const hasValidSpecs = specificationsState.some(spec => spec.key.trim() && spec.value.trim());
      const finalSpecifications = hasValidSpecs
        ? specificationsObj 
        : (currentGear.specifications && Object.keys(currentGear.specifications).length > 0 
          ? currentGear.specifications 
          : {});
      // Category: Eğer seçim yapılmamışsa, mevcut kategoriyi koru
      const finalCategoryIdValue = (selectedFinalCategory || selectedSubCategory || selectedParentCategory) 
        || currentGear.categoryId 
        || '';
      
      // Ensure all values are explicitly set, NEVER undefined - use formData
      const updates: Partial<Gear> = {
        name: formData.name || data.name || '',
        description: formData.description || data.description || '',
        category: finalCategorySlug || formData.category || data.category || 'other',
        categoryId: finalCategoryIdValue, // ALWAYS set, never undefined
        images: validImages,
        pricePerDay: pricePerDay,
        deposit: deposit !== null ? deposit : null, // Explicitly set null
        available: (formData.status || data.status) === 'for-sale' || (formData.status || data.status) === 'orderable' ? true : false,
        status: (formData.status || data.status) ?? 'for-sale',
        specifications: finalSpecifications, // ALWAYS set, never undefined
        brand: formData.brand || data.brand || '',
        color: formData.color || data.color || '',
        rating: finalRatingValue, // ALWAYS set, never undefined (null is valid)
        recommendedProducts: selectedRecommendedProducts.length > 0 ? selectedRecommendedProducts : (currentGear.recommendedProducts || []),
      };

      // DOUBLE CHECK: Ensure rating is included
      if (updates.rating === undefined) {
        updates.rating = finalRatingValue !== undefined ? finalRatingValue : (ratingValue !== undefined ? ratingValue : null);
      }
      
      // DOUBLE CHECK: Ensure specifications is included
      if (updates.specifications === undefined) {
        updates.specifications = Object.keys(specificationsObj).length > 0 ? specificationsObj : (currentGear.specifications || {});
      }
      
      // DOUBLE CHECK: Ensure categoryId is included
      if (!updates.categoryId) {
        updates.categoryId = finalCategoryId || currentGear.categoryId;
      }

      await updateGearInStore(id, updates);
      navigate(routes.adminGear);
    } catch (error) {
      console.error('Failed to update gear:', error);
      alert('Ürün güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...files]);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrlField = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  // YENİ MEKANİZMA: Teknik Özellikler - State Yönetimi
  const addSpecification = () => {
    const newSpecs = [...specificationsState, { key: '', value: '' }];
    setSpecificationsState(newSpecs);
    setSpecifications(newSpecs); // Eski state'i de güncelle (backward compatibility)
  };

  const removeSpecification = (index: number) => {
    const newSpecs = specificationsState.filter((_, i) => i !== index);
    if (newSpecs.length === 0) {
      newSpecs.push({ key: '', value: '' }); // En az bir boş alan bırak
    }
    setSpecificationsState(newSpecs);
    setSpecifications(newSpecs); // Eski state'i de güncelle
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specificationsState];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSpecificationsState(newSpecs);
    setSpecifications(newSpecs); // Eski state'i de güncelle
  };

  if (isLoading || !currentGear) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEO title="Ürün Düzenle" description="Ürünü düzenleyin" />
      <AdminLayout>
        <div className="max-w-4xl mx-auto px-4" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8">
            Ürün Düzenle
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
              <Input
                label="Ürün Adı"
                {...register('name', { required: 'Ürün adı gereklidir' })}
                error={errors.name?.message}
                style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                <textarea
                  {...register('description', { required: 'Açıklama gereklidir' })}
                  rows={5}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y`}
                  style={{ 
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    wordBreak: 'break-word', 
                    overflowWrap: 'break-word',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    display: 'block',
                    position: 'relative'
                  }}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Hiyerarşik Kategori Seçimi */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori Seçimi *
              </label>
              
              {/* Ana Kategori */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  1. Ana Kategori
                </label>
                <select
                  value={selectedParentCategory}
                  onChange={(e) => {
                    setSelectedParentCategory(e.target.value);
                    setSelectedSubCategory('');
                    setSelectedFinalCategory('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Ana Kategori Seçiniz</option>
                  {Array.isArray(parentCategories) && parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alt Kategori */}
              {subCategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    2. Alt Kategori
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => {
                      setSelectedSubCategory(e.target.value);
                      setSelectedFinalCategory('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Alt Kategori Seçiniz (İsteğe Bağlı)</option>
                    {Array.isArray(subCategories) && subCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Final Kategori */}
              {finalCategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    3. Alt Alt Kategori
                  </label>
                  <select
                    value={selectedFinalCategory}
                    onChange={(e) => {
                      setSelectedFinalCategory(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Alt Alt Kategori Seçiniz (İsteğe Bağlı)</option>
                    {Array.isArray(finalCategories) && finalCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Seçilen Kategori Bilgisi */}
              {(selectedParentCategory || selectedSubCategory || selectedFinalCategory) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Seçilen Kategori:</strong>{' '}
                    {selectedCategoryName || 'Kategori seçilmedi'}
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Fiyat (₺)"
              type="number"
              step="0.01"
              {...register('pricePerDay', {
                required: 'Fiyat gereklidir',
                min: { value: 0, message: 'Fiyat 0\'dan büyük olmalıdır' },
                valueAsNumber: true,
              })}
              error={errors.pricePerDay?.message}
            />

            <Input
              label="Teminat (₺) - İsteğe Bağlı"
              type="number"
              step="0.01"
              {...register('deposit', {
                min: { value: 0, message: 'Teminat 0\'dan büyük olmalıdır' },
                valueAsNumber: true,
              })}
              error={errors.deposit?.message}
            />

            {/* Marka */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marka
              </label>
              <input
                type="text"
                {...register('brand')}
                list="brands-list"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.brand
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Marka adı girin (ör: Coleman, MSR...)"
              />
              <datalist id="brands-list">
                {Array.isArray(brands) && brands.length > 0 ? (
                  brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))
                ) : (
                  <option value="Marka bulunamadı" />
                )}
              </datalist>
              {Array.isArray(brands) && brands.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setValue('brand', brand)}
                      className="px-3 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Marka yükleniyor...
                </div>
              )}
            </div>

            {/* Renk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Renk
              </label>
              <input
                type="text"
                {...register('color')}
                list="colors-list"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.color
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Renk girin (ör: Siyah, Beyaz, Mavi...)"
              />
              <datalist id="colors-list">
                {Array.isArray(colors) && colors.map((color) => (
                  <option key={color} value={color} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(colors) && colors.slice(0, 10).map((color) => {
                  const colorObj = colorService.getColorByName(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className="px-3 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                      style={colorObj?.hexCode ? { 
                        backgroundColor: colorObj.hexCode + '20',
                        border: `1px solid ${colorObj.hexCode}`,
                      } : {}}
                    >
                      {colorObj?.hexCode && (
                        <span 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: colorObj.hexCode }}
                        />
                      )}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* YENİ MEKANİZMA: Değerlendirme (Yıldız) - Direkt State Yönetimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Değerlendirme (Yıldız) *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isSelected = ratingState !== null && ratingState >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRatingState(star);
                        // Form'a da set et (backup)
                        setValue('rating', star, { shouldValidate: false, shouldDirty: false });
                      }}
                      className={`text-3xl transition-all ${
                        isSelected
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      } hover:scale-110`}
                    >
                      ★
                    </button>
                  );
                })}
                {ratingState !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setRatingState(null);
                      setValue('rating', null, { shouldValidate: false, shouldDirty: false });
                    }}
                    className="ml-4 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Temizle
                  </button>
                )}
              </div>
              <input
                type="hidden"
                {...register('rating', { valueAsNumber: true })}
                value={ratingState !== null ? ratingState : ''}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Seçilen: {ratingState !== null ? `${ratingState} yıldız` : 'Yok'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resimler
              </label>

              {/* Mevcut Resimler */}
              {imageUrls.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mevcut Resimler:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                    {Array.isArray(imageUrls) && imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Resim ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Use SVG placeholder as fallback
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="18"%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeImageUrlField(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yeni Dosya Yükleme */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yeni Resimler Ekle
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                />
                {imageFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {Array.isArray(imageFiles) && imageFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeImageFile(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URL Ekleme (İsteğe Bağlı) */}
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Veya URL ile ekle (İsteğe Bağlı)
                </summary>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrlField}
                    className="mt-2"
                  >
                    + Resim URL Ekle
                  </Button>
                </div>
              </details>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Yeni resimler ekleyin veya mevcut resimleri düzenleyin
              </p>
            </div>

            {/* Teknik Bilgi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teknik Bilgi
              </label>
              {Array.isArray(specificationsState) && specificationsState.map((spec, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                    placeholder="Örn: Malzeme"
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    placeholder="Örn: Alüminyum"
                    className="flex-1"
                  />
                  {specificationsState.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpecification}
                className="mt-2"
              >
                + Teknik Bilgi Ekle
              </Button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ürün teknik özelliklerini ekleyin (ör: Malzeme, Ağırlık, Kapasite)
              </p>
            </div>

            {/* Ürün Durumu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ürün Durumu *
              </label>
              <select
                {...register('status', { required: 'Ürün durumu seçilmelidir' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.status
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="for-sale">🛒 Satılık</option>
                <option value="orderable">📦 Sipariş Edilebilir</option>
                <option value="sold">✅ Satıldı</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Satılık: Hemen satın alınabilir | Sipariş Edilebilir: Sipariş verilebilir | Satıldı: Artık satılmamış
              </p>
            </div>

            {/* Recommended Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tavsiye Edilen Ürünler (En fazla 4 ürün seçebilirsiniz)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                {allGear.filter(g => g.id !== id).length > 0 ? (
                  Array.isArray(allGear) && allGear.filter(g => g.id !== id).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRecommendedProducts.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedRecommendedProducts.length < 4) {
                              setSelectedRecommendedProducts([...selectedRecommendedProducts, item.id]);
                            } else {
                              alert('En fazla 4 ürün seçebilirsiniz!');
                            }
                          } else {
                            setSelectedRecommendedProducts(selectedRecommendedProducts.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        disabled={!selectedRecommendedProducts.includes(item.id) && selectedRecommendedProducts.length >= 4}
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {item.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Henüz başka ürün bulunmuyor</p>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Seçilen: {selectedRecommendedProducts.length} / 4 ürün
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button type="submit" variant="primary" isLoading={isSubmitting || uploadingImages} size="lg" className="w-full sm:w-auto">
                {uploadingImages ? 'Resimler Yükleniyor...' : 'Ürünü Güncelle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate(routes.adminGear)}
                className="w-full sm:w-auto"
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

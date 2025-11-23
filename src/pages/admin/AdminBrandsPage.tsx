import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { brandService, Brand } from '@/services/brandService';
import { uploadService } from '@/services/uploadService';

export const AdminBrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState<File | null>(null);
  const [newBrandLogoPreview, setNewBrandLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLogo, setEditingLogo] = useState<string | null>(null);
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null);
  const [editingLogoPreview, setEditingLogoPreview] = useState<string>('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const allBrands = await brandService.getAllBrands();
      setBrands(allBrands);
    } catch (error) {
      console.error('Failed to load brands:', error);
      alert('Markalar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo dosyası 5MB\'dan büyük olamaz');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin');
      return;
    }

    if (isEditing) {
      setEditingLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewBrandLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBrandLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newBrandName.trim()) {
      alert('Lütfen marka adı girin');
      return;
    }

    try {
      setUploadingLogo(true);
      let logoUrl: string | null = null;

      if (newBrandLogo) {
        const uploaded = await uploadService.uploadImage(newBrandLogo);
        logoUrl = uploadService.getFileUrl(uploaded.path);
      }

      await brandService.createBrand({ name: newBrandName, logo: logoUrl });
      setNewBrandName('');
      setNewBrandLogo(null);
      setNewBrandLogoPreview('');
      setIsAdding(false);
      await loadBrands();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Marka eklenemedi');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
    setEditingLogo(brand.logo || null);
    setEditingLogoFile(null);
    setEditingLogoPreview(brand.logo || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      alert('Lütfen marka adı girin');
      return;
    }

    try {
      setUploadingLogo(true);
      let logoUrl: string | null = editingLogo;

      if (editingLogoFile) {
        const uploaded = await uploadService.uploadImage(editingLogoFile);
        logoUrl = uploadService.getFileUrl(uploaded.path);
      }

      await brandService.updateBrand(editingId, { name: editingName, logo: logoUrl });
      setEditingId(null);
      setEditingName('');
      setEditingLogo(null);
      setEditingLogoFile(null);
      setEditingLogoPreview('');
      await loadBrands();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Marka güncellenemedi');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingLogo(null);
    setEditingLogoFile(null);
    setEditingLogoPreview('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      try {
        await brandService.deleteBrand(id);
        await loadBrands();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Marka Yönetimi" description="Markaları yönetin" />
      <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Marka Yönetimi
          </h1>
          {!isAdding && (
            <Button variant="primary" onClick={() => setIsAdding(true)} className="w-full sm:w-auto text-sm sm:text-base">
              <span className="hidden sm:inline">+ Yeni Marka Ekle</span>
              <span className="sm:hidden">+ Yeni Ekle</span>
            </Button>
          )}
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Yeni Marka Ekle
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex-1">
                <Input
                  label="Marka Adı"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Örn: Coleman, MSR..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd();
                    }
                  }}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marka Logosu
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  {newBrandLogoPreview && (
                    <img
                      src={newBrandLogoPreview}
                      alt="Logo preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoSelect(e, false)}
                    className="block w-full text-xs sm:text-sm text-gray-500 dark:text-gray-400
                      file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4
                      file:rounded-lg file:border-0
                      file:text-xs sm:file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      dark:file:bg-primary-900 dark:file:text-primary-300"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                <Button variant="primary" onClick={handleAdd} disabled={uploadingLogo} className="w-full sm:w-auto text-sm sm:text-base">
                  {uploadingLogo ? 'Yükleniyor...' : 'Kaydet'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setNewBrandName('');
                  setNewBrandLogo(null);
                  setNewBrandLogoPreview('');
                }} className="w-full sm:w-auto text-sm sm:text-base">
                  İptal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Brands List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Yükleniyor...
            </div>
          ) : brands.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {editingId === brand.id ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex-1">
                        <Input
                          label="Marka Adı"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Marka Logosu
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                          {editingLogoPreview && (
                            <img
                              src={editingLogoPreview}
                              alt="Logo preview"
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoSelect(e, true)}
                            className="block w-full text-xs sm:text-sm text-gray-500 dark:text-gray-400
                              file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4
                              file:rounded-lg file:border-0
                              file:text-xs sm:file:text-sm file:font-semibold
                              file:bg-primary-50 file:text-primary-700
                              hover:file:bg-primary-100
                              dark:file:bg-primary-900 dark:file:text-primary-300"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={uploadingLogo} className="w-full sm:w-auto text-xs sm:text-sm">
                          {uploadingLogo ? 'Yükleniyor...' : 'Kaydet'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit} className="w-full sm:w-auto text-xs sm:text-sm">
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {brand.logo && (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                            {brand.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Oluşturulma: {new Date(brand.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(brand)}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Henüz marka eklenmemiş
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};















import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampsiteStore } from '@/store/campsiteStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { routes } from '@/config';
import { Campsite } from '@/types';

export const AdminCampsitesPage = () => {
  const { campsites, fetchCampsites, isLoading, deleteCampsite } = useCampsiteStore();

  useEffect(() => {
    fetchCampsites({}, 1);
  }, [fetchCampsites]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kamp alanını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteCampsite(id);
        fetchCampsites({}, 1);
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Kamp Alanları Yönetimi" description="Kamp alanlarını yönetin" />
      <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Kamp Alanları Yönetimi
          </h1>
          <Link to={routes.adminAddCampsite} className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto text-sm sm:text-base">
              <span className="hidden sm:inline">Yeni Kamp Alanı Ekle</span>
              <span className="sm:hidden">+ Yeni Ekle</span>
            </Button>
          </Link>
        </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {campsites.length > 0 ? (
                  campsites.map((campsite: Campsite) => (
                    <div
                      key={campsite.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                            {campsite.name}
                          </h3>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {campsite.location.city}, {campsite.location.region}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                              ₺{campsite.pricePerNight}/gece
                            </div>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                campsite.available
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {campsite.available ? 'Müsait' : 'Dolu'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          to={`/admin/campsites/edit/${campsite.id}`}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-center"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleDelete(campsite.id)}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Henüz kamp alanı eklenmemiş</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Ad
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Konum
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fiyat
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {campsites.length > 0 ? (
                        campsites.map((campsite: Campsite) => (
                        <tr key={campsite.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div className="max-w-xs truncate" title={campsite.name}>
                              {campsite.name}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {campsite.location.city}, {campsite.location.region}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            ₺{campsite.pricePerNight}/gece
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                campsite.available
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {campsite.available ? 'Müsait' : 'Dolu'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/campsites/edit/${campsite.id}`}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 text-xs sm:text-sm"
                              >
                                Düzenle
                              </Link>
                              <button
                                onClick={() => handleDelete(campsite.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm"
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Henüz kamp alanı eklenmemiş
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
      </AdminLayout>
    </>
  );
};


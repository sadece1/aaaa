import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlogStore } from '@/store/blogStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { routes } from '@/config';
import { BlogPost } from '@/types';
import { blogService } from '@/services/blogService';

export const AdminBlogsPage = () => {
  const { blogs, fetchBlogs, isLoading } = useBlogStore();

  useEffect(() => {
    fetchBlogs({}, 1);
  }, [fetchBlogs]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      try {
        await blogService.deleteBlog(id);
        fetchBlogs({}, 1);
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Blog Yönetimi" description="Blogları yönetin" />
      <AdminLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Blog Yönetimi
          </h1>
          <Link to={routes.adminAddBlog} className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              Yeni Blog Yazısı Ekle
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Henüz blog yazısı yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              İlk blog yazınızı ekleyerek başlayın
            </p>
            <Link to={routes.adminAddBlog}>
              <Button variant="primary">Yeni Blog Yazısı Ekle</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {blogs.map((blog: BlogPost) => (
                <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {blog.title}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {blog.category} • {blog.author}
                      </div>
                    </div>
                    {blog.featured && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex-shrink-0 ml-2">
                        ⭐
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(blog.publishedAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/blogs/edit/${blog.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Başlık
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                        Yazar
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden xl:table-cell">
                        Tarih
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                        Öne Çıkan
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {blogs.map((blog: BlogPost) => (
                      <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs">
                          <div className="truncate" title={blog.title}>
                            {blog.title}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {blog.category}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden lg:table-cell">
                          {blog.author}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden xl:table-cell">
                          {new Date(blog.publishedAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {blog.featured ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              ⭐ Öne Çıkan
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/blogs/edit/${blog.id}`}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              Düzenle
                            </Link>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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


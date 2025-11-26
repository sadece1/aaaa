import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { routes } from '@/config';

export const NotFoundPage = () => {
  return (
    <>
      <SEO
        title="Sayfa Bulunamadı - 404"
        description="Aradığınız sayfa bulunamadı. Ana sayfaya dönmek için tıklayın."
        noindex={true}
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Animation/Illustration */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              404
            </h1>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Aradığınız sayfa taşınmış, kaldırılmış veya hiç var olmamış olabilir.
          </p>

          {/* Suggested Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Belki bunları aradınız?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to={routes.home}
                className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
              >
                <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  Ana Sayfa
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Sitenin ana sayfasına dönün
                </div>
              </Link>
              <Link
                to={routes.blog}
                className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
              >
                <div className="font-semibold text-green-600 dark:text-green-400 mb-1">
                  Blog
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Son blog yazılarını keşfedin
                </div>
              </Link>
              <Link
                to={routes.gear}
                className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
              >
                <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">
                  Ekipmanlar
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Kamp ekipmanlarını inceleyin
                </div>
              </Link>
              <Link
                to={routes.about}
                className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
              >
                <div className="font-semibold text-orange-600 dark:text-orange-400 mb-1">
                  Hakkımızda
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Bizim hakkımızda bilgi edinin
                </div>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={routes.home}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              to={routes.contact}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
            >
              İletişime Geç
            </Link>
          </div>

          {/* Search Suggestion */}
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Aradığınızı bulamadınız mı?{' '}
              <Link
                to={routes.search}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Arama yapmayı
              </Link>{' '}
              deneyin.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};


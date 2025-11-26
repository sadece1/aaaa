import { SEO } from '@/components/SEO';
import { motion } from 'framer-motion';

export const TermsOfServicePage = () => {
  return (
    <>
      <SEO
        title="Kullanım Şartları - WeCamp"
        description="WeCamp kullanım şartları ve hizmet koşulları. Platform kullanımı, rezervasyon kuralları ve kullanıcı yükümlülükleri hakkında bilgiler."
        noindex={false}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Kullanım Şartları
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Genel Hükümler
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Bu Kullanım Şartları, WeCamp platformunu (https://sadece1deneme.com) kullanımınızı düzenler. 
                  Platformu kullanarak, bu şartları kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız, 
                  lütfen platformu kullanmayın.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  WeCamp, kamp alanları ve kamp malzemeleri için bir pazar yeri platformudur. 
                  Platform, kullanıcıların kamp alanlarını keşfetmesini, rezervasyon yapmasını ve 
                  kamp malzemeleri kiralamasını sağlar.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Hizmet Tanımı
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  WeCamp aşağıdaki hizmetleri sunmaktadır:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Kamp alanı listeleme ve rezervasyon hizmeti</li>
                  <li>Kamp malzemeleri kiralama platformu</li>
                  <li>Kullanıcı hesapları ve profil yönetimi</li>
                  <li>İletişim ve destek hizmetleri</li>
                  <li>Blog ve içerik paylaşımı</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300">
                  WeCamp, bir aracı platformdur. Kamp alanları ve malzemeler, üçüncü taraf sağlayıcılar 
                  tarafından sunulmaktadır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. Kullanıcı Yükümlülükleri
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Platformu kullanırken aşağıdaki kurallara uymanız gerekmektedir:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Doğru, güncel ve eksiksiz bilgi sağlamak</li>
                  <li>Hesap bilgilerinizi güvende tutmak ve yetkisiz erişime izin vermemek</li>
                  <li>Platformu yasalara aykırı amaçlarla kullanmamak</li>
                  <li>Başkalarının haklarını ihlal etmemek</li>
                  <li>Zararlı yazılım, virüs veya kötü amaçlı kod yüklememek</li>
                  <li>Spam, istenmeyen mesaj veya reklam göndermemek</li>
                  <li>Telif hakkı, marka veya diğer fikri mülkiyet haklarını ihlal etmemek</li>
                  <li>Diğer kullanıcıların deneyimini bozacak davranışlarda bulunmamak</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Rezervasyon ve Ödeme
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>4.1. Rezervasyon İşlemleri:</strong>
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Rezervasyonlar, kamp alanı sahiplerinin onayına tabidir</li>
                  <li>Rezervasyon iptal ve değişiklik koşulları, her kamp alanı için farklı olabilir</li>
                  <li>Rezervasyon detayları, onay e-postası ile bildirilir</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>4.2. Ödeme:</strong>
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Ödemeler, güvenli ödeme sağlayıcıları aracılığıyla işlenir</li>
                  <li>Fiyatlar, kamp alanı sahipleri tarafından belirlenir</li>
                  <li>WeCamp, ödeme işlemlerinde aracılık yapar</li>
                  <li>Vergi ve ek ücretler, fiyata dahil olabilir veya ayrıca belirtilebilir</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. İptal ve İade Politikası
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  İptal ve iade koşulları, her kamp alanı ve malzeme sağlayıcısı için farklı olabilir. 
                  Detaylı bilgi, rezervasyon sırasında ve onay e-postasında belirtilir.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Genel olarak:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>İptal talepleri, kamp alanı sahibine iletilir</li>
                  <li>İade işlemleri, sağlayıcının politikasına göre yapılır</li>
                  <li>WeCamp, iptal ve iade konusunda aracılık yapar ancak nihai karar sağlayıcıya aittir</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Fikri Mülkiyet Hakları
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Platform içeriği (metin, görsel, logo, tasarım vb.) WeCamp'a aittir ve telif hakkı koruması altındadır. 
                  İçerik, WeCamp'ın yazılı izni olmadan kopyalanamaz, dağıtılamaz veya kullanılamaz.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Kullanıcılar tarafından yüklenen içerikler (fotoğraflar, yorumlar vb.), 
                  WeCamp'a kullanım lisansı verilmiş sayılır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Sorumluluk Sınırlaması
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  WeCamp, bir aracı platformdur ve aşağıdaki konularda sorumluluk kabul etmez:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Kamp alanlarının kalitesi, güvenliği veya uygunluğu</li>
                  <li>Kamp malzemelerinin durumu veya işlevselliği</li>
                  <li>Rezervasyon iptalleri veya değişiklikleri</li>
                  <li>Üçüncü taraf sağlayıcıların hizmetleri</li>
                  <li>Doğal afetler, hava koşulları veya diğer mücbir sebep durumları</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300">
                  Kullanıcılar, rezervasyon yaparken kamp alanı ve malzeme sağlayıcılarının 
                  koşullarını dikkatle okumalıdır.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Hesap İptali ve Askıya Alma
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  WeCamp, aşağıdaki durumlarda kullanıcı hesaplarını askıya alabilir veya iptal edebilir:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Kullanım şartlarının ihlali</li>
                  <li>Yasalara aykırı davranış</li>
                  <li>Dolandırıcılık veya kötü niyetli faaliyet</li>
                  <li>Diğer kullanıcılara zarar verme</li>
                  <li>Uzun süreli inaktivite (belirli bir süre sonra)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Değişiklikler
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  WeCamp, bu Kullanım Şartlarını her zaman güncelleyebilir. Önemli değişiklikler, 
                  platform üzerinden veya e-posta yoluyla bildirilir. Değişikliklerden sonra 
                  platformu kullanmaya devam etmeniz, güncellenmiş şartları kabul ettiğiniz anlamına gelir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Uygulanacak Hukuk ve Uyuşmazlık Çözümü
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Bu Kullanım Şartları, Türkiye Cumhuriyeti yasalarına tabidir. 
                  Uyuşmazlıklar, öncelikle dostane çözüm yolları ile çözülmeye çalışılır.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Çözülemediği takdirde, Türkiye Cumhuriyeti mahkemeleri yetkilidir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  11. İletişim
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Kullanım şartları hakkında sorularınız için:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>E-posta: info@wecamp.com.tr</li>
                  <li>
                    <a href="/contact" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      İletişim Formu
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};


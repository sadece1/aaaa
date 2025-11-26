import { SEO } from '@/components/SEO';
import { motion } from 'framer-motion';

export const PrivacyPolicyPage = () => {
  return (
    <>
      <SEO
        title="Gizlilik Politikası - WeCamp"
        description="WeCamp gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında bilgiler. KVKK ve GDPR uyumlu."
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
              Gizlilik Politikası
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Genel Bilgiler
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  WeCamp olarak, kişisel verilerinizin korunmasına büyük önem vermekteyiz. Bu Gizlilik Politikası, 
                  <strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)</strong> ve{' '}
                  <strong>Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR)</strong> kapsamında, 
                  kişisel verilerinizin nasıl toplandığı, işlendiği, saklandığı ve korunduğu hakkında bilgi vermektedir.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Bu politika, WeCamp platformunu kullandığınızda geçerlidir. Platformu kullanarak, 
                  bu politikanın şartlarını kabul etmiş sayılırsınız.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Veri Sorumlusu
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>Veri Sorumlusu:</strong> WeCamp
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>İletişim:</strong>
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>E-posta: info@wecamp.com.tr</li>
                  <li>Web: https://sadece1deneme.com/contact</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. Toplanan Kişisel Veriler
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Platformumuzu kullanırken aşağıdaki kişisel veriler toplanabilir:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası</li>
                  <li><strong>Hesap Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenmiş olarak saklanır)</li>
                  <li><strong>İletişim Bilgileri:</strong> Adres, şehir, posta kodu</li>
                  <li><strong>İşlem Bilgileri:</strong> Rezervasyon geçmişi, ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)</li>
                  <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı bilgileri, cihaz bilgileri, çerezler (Cookies)</li>
                  <li><strong>Kullanım Verileri:</strong> Site kullanım alışkanlıkları, tercihler, favoriler</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Kişisel Verilerin İşlenme Amaçları
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Platform hizmetlerinin sunulması ve yönetimi</li>
                  <li>Kullanıcı hesaplarının oluşturulması ve yönetimi</li>
                  <li>Rezervasyon işlemlerinin gerçekleştirilmesi</li>
                  <li>Müşteri hizmetleri ve destek sağlanması</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                  <li>İstatistiksel analiz ve iyileştirme çalışmaları</li>
                  <li>Pazarlama ve iletişim faaliyetleri (izin verildiğinde)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Kişisel Verilerin Paylaşılması
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Kişisel verileriniz, yasal zorunluluklar ve hizmet sunumu için gerekli olduğu durumlarda, 
                  aşağıdaki üçüncü taraflarla paylaşılabilir:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Ödeme işleme sağlayıcıları (güvenli ödeme için)</li>
                  <li>Kamp alanı sahipleri (rezervasyon işlemleri için)</li>
                  <li>Yasal merciler (yasal zorunluluklar gereği)</li>
                  <li>Hizmet sağlayıcılarımız (hosting, analitik - sadece gerekli veriler)</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300">
                  Verileriniz, yasal zorunluluklar dışında, açık rızanız olmadan üçüncü taraflarla paylaşılmaz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Çerezler (Cookies)
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Platformumuz, kullanıcı deneyimini iyileştirmek ve site işlevselliğini sağlamak için çerezler kullanmaktadır. 
                  Çerez kullanımı hakkında detaylı bilgi için{' '}
                  <a href="/cookie-policy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    Çerez Politikası
                  </a>{' '}
                  sayfamızı ziyaret edebilirsiniz.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Veri Güvenliği
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Kişisel verilerinizin güvenliği için aşağıdaki önlemler alınmaktadır:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>SSL/TLS şifreleme (HTTPS)</li>
                  <li>Güvenli veritabanı saklama</li>
                  <li>Düzenli güvenlik denetimleri</li>
                  <li>Erişim kontrolü ve yetkilendirme</li>
                  <li>Şifrelerin hash'lenerek saklanması</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. KVKK Kapsamındaki Haklarınız
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  KVKK'nın 11. maddesi uyarınca, aşağıdaki haklara sahipsiniz:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenmişse bilgi talep etme</li>
                  <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                  <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                  <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                  <li>Düzeltme, silme, yok etme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                  <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                  <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300">
                  Haklarınızı kullanmak için{' '}
                  <a href="/contact" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    İletişim
                  </a>{' '}
                  sayfamızdan bizimle iletişime geçebilirsiniz.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Veri Saklama Süresi
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve yasal saklama süreleri 
                  (örneğin, ticari kayıtlar için 10 yıl) çerçevesinde saklanmaktadır. Amacın sona ermesi 
                  veya saklama süresinin dolması halinde, verileriniz yasalara uygun şekilde silinir veya anonimleştirilir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Değişiklikler
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Bu Gizlilik Politikası, yasal düzenlemelerdeki değişiklikler veya hizmetlerimizdeki güncellemeler 
                  nedeniyle güncellenebilir. Önemli değişiklikler, platform üzerinden veya e-posta yoluyla bildirilir.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Güncel politika, her zaman bu sayfada yayınlanmış halidir.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  11. İletişim
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Gizlilik politikamız hakkında sorularınız veya KVKK kapsamındaki haklarınızı kullanmak için:
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


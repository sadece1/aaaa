# VPS Build Komutları - mutlaka-bunu-kullan.webp için

## 🔧 Sorun
`mutlaka-bunu-kullan.webp` dosyası 404 hatası veriyor çünkü VPS'de build yapılmamış.

## ✅ Çözüm
VPS'de frontend build yapılması gerekiyor. Vite build sırasında `public` klasöründeki dosyaları `dist` klasörüne kopyalar.

## 📋 VPS Komutları

```bash
# 1. Proje dizinine git
cd /var/www/campscape

# 2. Son değişiklikleri çek
git pull origin main

# 3. Cache temizle (DELETE 404 fix için önemli!)
rm -rf dist
rm -rf node_modules/.vite

# 4. Frontend build yap (public klasöründeki dosyalar dist'e kopyalanır)
npm run build

# 5. Build sonrası dosyanın varlığını kontrol et
ls -la dist/mutlaka-bunu-kullan.webp

# 6. Nginx'i reload et (gerekirse)
sudo systemctl reload nginx
```

## 🚀 Tek Komut ile Tüm İşlemler (Önerilen)

```bash
cd /var/www/campscape && \
git pull origin main && \
rm -rf dist node_modules/.vite && \
npm run build && \
sudo systemctl reload nginx
```

## 🔍 Kontrol

```bash
# Dosyanın dist'te olduğunu kontrol et
ls -la /var/www/campscape/dist/mutlaka-bunu-kullan.webp

# Dosyanın web'de erişilebilir olduğunu kontrol et
curl -I https://sadece1deneme.com/mutlaka-bunu-kullan.webp

# index.html'deki inline script'in varlığını kontrol et
grep -A 5 "Error handler" /var/www/campscape/dist/index.html
```

## 📝 Not
- Vite build sırasında `public` klasöründeki tüm dosyalar `dist` root'una kopyalanır. Hash eklenmez, dosya adı aynı kalır.
- **DELETE 404 fix için önemli**: `rm -rf dist` komutu ile eski build'i temizleyin, böylece inline script düzgün çalışır.
- Build sonrası **mutlaka** `sudo systemctl reload nginx` yapın, böylece yeni dosyalar serve edilir.

## ⚠️ DELETE 404 Hatası İçin Özel Not
Eğer DELETE 404 hatası görüyorsanız:
1. **Cache temizle**: `rm -rf dist node_modules/.vite`
2. **Yeniden build yap**: `npm run build`
3. **Nginx reload**: `sudo systemctl reload nginx`
4. **Browser cache temizle**: Hard refresh (Ctrl+Shift+R) veya gizli sekme kullan

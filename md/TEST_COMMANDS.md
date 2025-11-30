# Test Komutları - Lighthouse Optimizasyonları

## 🚀 Hızlı Test Komutları

### 1. Build Test (Local)
```bash
npm run build
```

### 2. Bundle Size Analizi
```bash
# Build sonrası dist klasöründe
du -sh dist/assets/*
```

### 3. Lighthouse Test (Local - Chrome gerekli)
```bash
# Chrome/Chromium yüklü olmalı
npx lighthouse http://localhost:5173 --output html --output-path=./lighthouse-report.html --chrome-flags="--headless"
```

### 4. Production Test (VPS)
```bash
# VPS'de çalıştır
cd /var/www/campscape
git pull origin main
npm install
npm run build
cd server
npm install
npm run build
pm2 restart campscape-backend
sudo systemctl reload nginx
```

### 5. Header Test (VPS)
```bash
# Security headers kontrolü
curl -I https://sadece1deneme.com/ 2>&1 | grep -i "strict-transport\|x-content-type\|x-frame\|x-xss\|referrer-policy\|permissions-policy"

# Tüm header'ları gör
curl -I https://sadece1deneme.com/

# Cache headers kontrolü
curl -I https://sadece1deneme.com/assets/css/index-*.css 2>&1 | grep -i "cache-control\|expires"
```

### 6. Compression Test
```bash
# Gzip/Brotli kontrolü
curl -H "Accept-Encoding: gzip" -I https://sadece1deneme.com/ 2>&1 | grep -i "content-encoding"
```

### 7. Console Error Test
```bash
# Browser console'da ERR_BLOCKED_BY_CLIENT hatalarının görünmediğini kontrol et
# Chrome DevTools > Console > Filter: "ERR_BLOCKED_BY_CLIENT"
```

### 8. Performance Test (PageSpeed Insights)
```bash
# Online test
# https://pagespeed.web.dev/analysis?url=https://sadece1deneme.com
```

## 📊 Beklenen Sonuçlar

### Security Headers ✅
- `strict-transport-security`: max-age=31536000; includeSubDomains; preload
- `x-content-type-options`: nosniff
- `x-frame-options`: SAMEORIGIN
- `x-xss-protection`: 1; mode=block
- `referrer-policy`: no-referrer-when-downgrade
- `permissions-policy`: geolocation=(), microphone=(), camera=()

### CSS Optimization ✅
- CSS bundle: ~76 kB (gzip: ~12 kB)
- cssnano ile minified
- Critical CSS inline

### Console Errors ✅
- ERR_BLOCKED_BY_CLIENT hataları yakalanıyor ve sessizce handle ediliyor

### Bundle Sizes
- Vendor chunk: ~415 kB (gzip: ~133 kB)
- Main chunk: ~70 kB (gzip: ~28 kB)
- CSS: ~76 kB (gzip: ~12 kB)

## 🎯 Lighthouse Hedef Skorları

- **Performance**: 100/100
- **Accessibility**: 100/100
- **Best Practices**: 100/100
- **SEO**: 100/100

## 🔍 Kontrol Listesi

- [ ] Security headers görünüyor mu?
- [ ] CSS bundle size optimize edilmiş mi?
- [ ] Console'da ERR_BLOCKED_BY_CLIENT hataları var mı?
- [ ] Cache headers doğru mu?
- [ ] Compression aktif mi?
- [ ] LCP image keşfediliyor mu?
- [ ] Critical CSS inline mı?


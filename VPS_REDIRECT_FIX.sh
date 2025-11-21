#!/bin/bash

# ERR_TOO_MANY_REDIRECTS Hatası - Hızlı Düzeltme Scripti
# Bu script VPS'te çalıştırılmalıdır

echo "=========================================="
echo "ERR_TOO_MANY_REDIRECTS Düzeltme Scripti"
echo "=========================================="
echo ""

# 1. SSL durumunu kontrol et
echo "1. SSL durumunu kontrol ediliyor..."
if [ -f "/etc/letsencrypt/live/sadece1deneme.com/fullchain.pem" ]; then
    echo "   ✓ SSL sertifikası bulundu"
    USE_SSL=true
else
    echo "   ✗ SSL sertifikası bulunamadı"
    USE_SSL=false
fi
echo ""

# 2. Backend'i güncelle
echo "2. Backend güncelleniyor..."
cd /var/www/campscape
git pull origin main
cd server
npm run build
pm2 restart campscape-backend
echo "   ✓ Backend güncellendi ve yeniden başlatıldı"
echo ""

# 3. Nginx config'i seç ve uygula
echo "3. Nginx config'i uygulanıyor..."
if [ "$USE_SSL" = true ]; then
    echo "   SSL config kullanılıyor..."
    sudo cp /var/www/campscape/nginx-campscape-ssl.config.conf /etc/nginx/sites-available/campscape
else
    echo "   Normal config kullanılıyor..."
    sudo cp /var/www/campscape/nginx-campscape-config.conf /etc/nginx/sites-available/campscape
fi

# 4. Nginx config'i test et
echo "4. Nginx config test ediliyor..."
if sudo nginx -t; then
    echo "   ✓ Nginx config geçerli"
    sudo systemctl reload nginx
    echo "   ✓ Nginx yeniden yüklendi"
else
    echo "   ✗ Nginx config hatası! Lütfen manuel kontrol edin."
    exit 1
fi
echo ""

# 5. Frontend'i build et
echo "5. Frontend build ediliyor..."
cd /var/www/campscape
npm run build
echo "   ✓ Frontend build edildi"
echo ""

# 6. Test
echo "6. Test ediliyor..."
echo "   Backend health check:"
curl -s http://localhost:3000/health | head -1
echo ""
echo "   API test:"
if [ "$USE_SSL" = true ]; then
    curl -s -I https://sadece1deneme.com/api/gear?page=1&limit=10 | head -5
else
    curl -s -I http://sadece1deneme.com/api/gear?page=1&limit=10 | head -5
fi
echo ""

echo "=========================================="
echo "Düzeltme tamamlandı!"
echo "=========================================="
echo ""
echo "Eğer hala ERR_TOO_MANY_REDIRECTS hatası alıyorsanız:"
echo "1. Tarayıcı cache'ini temizleyin (Ctrl+Shift+Delete)"
echo "2. Nginx log'larını kontrol edin: sudo tail -f /var/log/nginx/campscape-error.log"
echo "3. Backend log'larını kontrol edin: pm2 logs campscape-backend"
echo ""


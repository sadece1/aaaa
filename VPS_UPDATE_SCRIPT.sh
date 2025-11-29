#!/bin/bash

# VPS Update Script - Git pull, build ve Nginx reload
# DELETE 404 fix için cache temizleme dahil

set -e

echo "🚀 VPS Update başlatılıyor..."

# 1. Proje dizinine git
cd /var/www/campscape
echo "📁 Dizin: $(pwd)"

# 2. Git pull
echo "📥 Git pull yapılıyor..."
git pull origin main

# 3. Cache temizle (DELETE 404 fix için kritik!)
echo "🧹 Cache temizleniyor..."
rm -rf dist
rm -rf node_modules/.vite
echo "✅ Cache temizlendi"

# 4. Frontend build
echo "🏗️  Frontend build yapılıyor..."
npm run build
echo "✅ Build tamamlandı"

# 5. Nginx reload
echo "🔄 Nginx reload ediliyor..."
sudo systemctl reload nginx
echo "✅ Nginx reload edildi"

echo ""
echo "✅ VPS Update tamamlandı!"
echo ""
echo "📋 Test komutları:"
echo "  curl -I https://sadece1deneme.com/ | grep -i cache-control"
echo "  ls -la /var/www/campscape/dist/index.html"
echo ""
echo "⚠️  Browser cache temizlemek için:"
echo "  - Hard refresh: Ctrl+Shift+R"
echo "  - Gizli sekme kullan"
echo "  - DevTools → Network → Disable cache"


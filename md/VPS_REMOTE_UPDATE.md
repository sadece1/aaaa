# VPS Remote URL Güncelleme

## Yeni Repository'ye Geçiş

VPS'te git remote URL'ini güncellemek için:

```bash
cd /var/www/campscape

# Mevcut remote'u kontrol et
git remote -v

# Yeni remote URL'ini ayarla
git remote set-url origin https://github.com/sadece1/boyleisin.git

# Kontrol et
git remote -v

# Son değişiklikleri çek
git pull origin main

# Backend build ve restart
cd server
npm install
npm run build
pm2 restart campscape-backend

# Frontend build ve restart
cd ..
npm install
npm run build
pm2 restart all
```

## Tek Komutla Tüm İşlem

```bash
cd /var/www/campscape && git remote set-url origin https://github.com/sadece1/boyleisin.git && git remote -v && git pull origin main && cd server && npm install && npm run build && pm2 restart campscape-backend && cd .. && npm install && npm run build && pm2 restart all
```


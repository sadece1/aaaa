# VPS Deploy Komutları

## Tüm Değişiklikleri Deploy Etme

```bash
# Proje dizinine git
cd /var/www/campscape

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

## Sadece Backend Değişiklikleri

```bash
cd /var/www/campscape/server
git pull origin main
npm install
npm run build
pm2 restart campscape-backend
```

## Sadece Frontend Değişiklikleri

```bash
cd /var/www/campscape
git pull origin main
npm install
npm run build
pm2 restart all
```

## PM2 Durumunu Kontrol Etme

```bash
pm2 status
pm2 logs campscape-backend --lines 50
pm2 logs all --lines 50
```

## Backend Loglarını İzleme

```bash
pm2 logs campscape-backend --lines 100
```

## Frontend Loglarını İzleme

```bash
pm2 logs all --lines 100
```

## Hızlı Restart (Build Olmadan)

```bash
# Sadece backend restart
pm2 restart campscape-backend

# Tüm servisleri restart
pm2 restart all
```


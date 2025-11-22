# VPS Deploy Komutları

## Hızlı Deploy (Tüm Değişiklikler)

```bash
cd /var/www/campscape
git pull origin main
cd server
npm install
npm run build
pm2 restart campscape-backend
cd ..
npm run build
pm2 restart all
```

## Adım Adım Deploy

### 1. Backend Güncelleme
```bash
cd /var/www/campscape
git pull origin main
cd server
npm install
npm run build
pm2 restart campscape-backend
```

### 2. Frontend Güncelleme
```bash
cd /var/www/campscape
npm run build
pm2 restart all
```

## PM2 Durum Kontrolü

```bash
pm2 status
pm2 logs campscape-backend --lines 50
```

## Veritabanı Migration (Gerekirse)

```bash
mysql -u root -p
# Şifre: MySecurePass123!@#

USE campscape_marketplace;

# Migration SQL komutlarını buraya yapıştır

EXIT;
```

## Nginx Yeniden Başlatma (Gerekirse)

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

## Hata Ayıklama

### Backend logları
```bash
pm2 logs campscape-backend --lines 100
```

### Frontend build hatası
```bash
cd /var/www/campscape
npm run build
```

### Port kontrolü
```bash
netstat -tulpn | grep :3000
curl http://localhost:3000/api/health
```


# VPS Deployment Commands

## Hostinger VPS için Deployment Komutları

### 1. SSH ile VPS'e Bağlan
```bash
ssh root@your-vps-ip
```

### 2. Proje Dizinine Git
```bash
cd /var/www/campscape
```

### 3. Git Remote URL'i Güncelle (Gerekirse)
```bash
git remote set-url origin https://github.com/sadece1/amk.git
```

### 4. Son Değişiklikleri Çek
```bash
git pull origin main
```

### 5. Dependencies Güncelle
```bash
npm install
```

### 6. Frontend Build Et
```bash
npm run build
```

### 7. Backend'i Restart Et (Eğer PM2 kullanıyorsanız)
```bash
pm2 restart campscape-backend
# veya
pm2 restart all
```

### 8. Nginx'i Restart Et (Gerekirse)
```bash
sudo systemctl restart nginx
```

## Tek Komut ile Tüm İşlemler

Tüm adımları tek seferde çalıştırmak için:

```bash
cd /var/www/campscape && \
git remote set-url origin https://github.com/sadece1/amk.git && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart all
```

## Hızlı Update (Sadece Pull ve Build)

Eğer sadece kod güncellemesi yapıyorsanız:

```bash
cd /var/www/campscape
git pull origin main
npm run build
pm2 restart all
```

## Sorun Giderme

### Build Hatası
```bash
# Node modules'ı temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Git Pull Hatası
```bash
# Değişiklikleri stash et
git stash
git pull origin main
git stash pop
```

### Permission Hatası
```bash
# Dosya izinlerini düzelt
sudo chown -R $USER:$USER /var/www/campscape
chmod -R 755 /var/www/campscape
```


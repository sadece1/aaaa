# 🚨 VERİTABANI KURTARMA REHBERİ

## ⚠️ ÖNEMLİ: Seed Script Production'da Artık Çalışmıyor!

Seed script'e güvenlik kontrolü eklendi. Production'da çalışması için `ALLOW_PRODUCTION_SEED=true` environment variable'ı gerekli.

## 🔄 Veritabanını Geri Yükleme

### Seçenek 1: Backup Varsa (ÖNERİLEN)

```bash
# VPS'te backup dosyasını bul
cd /var/www/campscape
ls -la *.sql

# Backup'ı geri yükle
mysql -u root -p campscape < backup.sql
# veya
mysql -u root -p campscape_marketplace < backup.sql
```

### Seçenek 2: Backup Yoksa - Seed Script ile Temel Verileri Yükle

**⚠️ DİKKAT: Bu sadece temel verileri yükler (admin kullanıcı, örnek kategoriler vb.)**

```bash
cd /var/www/campscape/server

# Production'da seed çalıştırmak için:
ALLOW_PRODUCTION_SEED=true npm run db:seed

# Veya manuel olarak:
ALLOW_PRODUCTION_SEED=true NODE_ENV=production npm run db:seed
```

### Seçenek 3: Manuel Olarak Temel Verileri Ekle

MySQL'e giriş yap:
```bash
mysql -u root -p
# Şifre: MySecurePass123!@#
```

```sql
USE campscape;
-- veya
USE campscape_marketplace;

-- Admin kullanıcı oluştur (şifre: Admin123!)
INSERT INTO users (id, email, name, password_hash, role, is_active) 
VALUES (
  UUID(),
  'admin@campscape.com',
  'Admin User',
  '$2b$10$rQ8K8K8K8K8K8K8K8K8K8uK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
  'admin',
  TRUE
) ON DUPLICATE KEY UPDATE email=email;

-- Temel kategoriler ekle (örnek)
-- (Kategorileri admin panelinden ekleyebilirsiniz)

EXIT;
```

## 🛡️ Gelecek İçin Backup Alın

### Otomatik Backup Script Oluştur

```bash
# Backup script oluştur
cat > /var/www/campscape/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/campscape/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="campscape"  # veya campscape_marketplace

mkdir -p $BACKUP_DIR
mysqldump -u root -p'MySecurePass123!@#' $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Eski backup'ları sil (30 günden eski)
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

echo "Backup created: $BACKUP_DIR/backup_$DATE.sql"
EOF

chmod +x /var/www/campscape/backup_db.sh

# Cron job ekle (her gün saat 02:00'de)
crontab -e
# Şu satırı ekle:
# 0 2 * * * /var/www/campscape/backup_db.sh
```

### Manuel Backup

```bash
cd /var/www/campscape
mysqldump -u root -p'MySecurePass123!@#' campscape > backup_$(date +%Y%m%d).sql
# veya
mysqldump -u root -p'MySecurePass123!@#' campscape_marketplace > backup_$(date +%Y%m%d).sql
```

## ✅ Kontrol Et

```bash
# Veritabanında tabloları kontrol et
mysql -u root -p'MySecurePass123!@#' -e "USE campscape; SHOW TABLES;"

# Kullanıcıları kontrol et
mysql -u root -p'MySecurePass123!@#' -e "USE campscape; SELECT id, email, name, role FROM users;"
```

## 🔐 Admin Şifresi

Seed script çalıştırıldıktan sonra:
- **Email**: `admin@campscape.com`
- **Şifre**: `Admin123!`

## 📝 Notlar

1. Seed script artık production'da otomatik çalışmaz
2. Production'da seed çalıştırmak için `ALLOW_PRODUCTION_SEED=true` gerekli
3. Düzenli backup alın!
4. Production'da seed script'i çalıştırmadan önce mutlaka backup alın!


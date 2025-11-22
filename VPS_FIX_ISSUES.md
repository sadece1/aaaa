# VPS Hata Düzeltme Adımları

## 1. Kodu Güncelle ve Build Et

```bash
cd /var/www/campscape
git pull origin main
cd server
npm install
npm run build
pm2 restart campscape-backend
```

## 2. user_orders Tablosunu Oluştur

```bash
mysql -u root -p
# Şifre: MySecurePass123!@#
```

MySQL'de:

```sql
USE campscape_marketplace;

CREATE TABLE IF NOT EXISTS user_orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    gear_id VARCHAR(36) NOT NULL,
    status ENUM('waiting', 'arrived', 'shipped') NOT NULL DEFAULT 'waiting',
    price DECIMAL(10, 2) NOT NULL,
    public_note TEXT,
    private_note TEXT,
    shipped_date DATE,
    shipped_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_gear_id (gear_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gear_id) REFERENCES gear(id) ON DELETE CASCADE
);

EXIT;
```

## 3. Kontrol Et

```bash
pm2 logs campscape-backend --lines 20
```

## Hızlı Komutlar (Tek Satır)

```bash
# Kodu güncelle ve build et
cd /var/www/campscape && git pull origin main && cd server && npm install && npm run build && pm2 restart campscape-backend

# Tablo oluştur (MySQL'de çalıştır)
mysql -u root -p campscape_marketplace -e "CREATE TABLE IF NOT EXISTS user_orders (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, gear_id VARCHAR(36) NOT NULL, status ENUM('waiting', 'arrived', 'shipped') NOT NULL DEFAULT 'waiting', price DECIMAL(10, 2) NOT NULL, public_note TEXT, private_note TEXT, shipped_date DATE, shipped_time TIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_user_id (user_id), INDEX idx_gear_id (gear_id), INDEX idx_status (status), INDEX idx_created_at (created_at), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (gear_id) REFERENCES gear(id) ON DELETE CASCADE);"
```


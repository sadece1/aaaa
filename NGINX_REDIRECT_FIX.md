# ERR_TOO_MANY_REDIRECTS Hatası Düzeltme

## Sorun
`ERR_TOO_MANY_REDIRECTS` hatası genellikle SSL sertifikası olmadan HTTPS redirect yapılmaya çalışıldığında oluşur.

## Çözüm

### 1. SSL Sertifikası Durumunu Kontrol Et

```bash
# SSL sertifikası var mı?
ls -la /etc/letsencrypt/live/sadece1deneme.com/
```

### 2A. SSL Sertifikası YOKSA (HTTP Config Kullan)

```bash
# Mevcut config'i yedekle
sudo cp /etc/nginx/sites-available/campscape /etc/nginx/sites-available/campscape.backup

# HTTP config'i kullan (SSL yok)
sudo cp /var/www/campscape/nginx-campscape-config.conf /etc/nginx/sites-available/campscape

# Config'i test et
sudo nginx -t

# Nginx'i reload et
sudo systemctl reload nginx
```

### 2B. SSL Sertifikası VARSA (SSL Config Kullan)

```bash
# Mevcut config'i yedekle
sudo cp /etc/nginx/sites-available/campscape /etc/nginx/sites-available/campscape.backup

# SSL config'i kullan
sudo cp /var/www/campscape/nginx-campscape-ssl.config.conf /etc/nginx/sites-available/campscape

# Config'i test et
sudo nginx -t

# Nginx'i reload et
sudo systemctl reload nginx
```

### 3. SSL Sertifikası Kurmak İstersen

```bash
# Certbot kur
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası al
sudo certbot --nginx -d sadece1deneme.com -d www.sadece1deneme.com

# Otomatik yenileme test et
sudo certbot renew --dry-run
```

## Önemli Notlar

- **SSL yoksa**: `nginx-campscape-config.conf` kullan (HTTP only)
- **SSL varsa**: `nginx-campscape-ssl.config.conf` kullan (HTTPS redirect)
- Backend'de `enforceHttps` middleware zaten devre dışı (Nginx proxy için)
- Helmet'te `upgradeInsecureRequests` devre dışı

## Hata Devam Ederse

```bash
# Nginx error log'larını kontrol et
sudo tail -f /var/log/nginx/campscape-error.log

# Nginx access log'larını kontrol et
sudo tail -f /var/log/nginx/campscape-access.log
```


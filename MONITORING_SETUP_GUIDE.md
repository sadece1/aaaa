# 503 Hata Önleme ve İzleme Sistemi Kurulum Rehberi

Bu rehber, raporda belirtilen 503 hatalarını önlemek ve izlemek için kapsamlı bir çözüm sunmaktadır.

## 📋 İçindekiler

1. [Uygulanan İyileştirmeler](#uygulanan-iyileştirmeler)
2. [Veritabanı Bağlantı İzleme](#veritabanı-bağlantı-izleme)
3. [Health Check Endpoint Kullanımı](#health-check-endpoint-kullanımı)
4. [Monitoring Araçları Kurulumu](#monitoring-araçları-kurulumu)
5. [Alerting Yapılandırması](#alerting-yapılandırması)
6. [Troubleshooting](#troubleshooting)

## ✅ Uygulanan İyileştirmeler

### 1. Gelişmiş Veritabanı Bağlantı Yönetimi

- ✅ **Retry Logic**: Veritabanı bağlantı hatalarında otomatik yeniden deneme (3 deneme, 5 saniye aralık)
- ✅ **Connection Pool Monitoring**: Bağlantı havuzu durumu izleme
- ✅ **Health Tracking**: Bağlantı sağlık durumu takibi
- ✅ **Otomatik İzleme**: Production ortamında 30 saniyede bir otomatik sağlık kontrolü

### 2. 503 Hata Yönetimi

- ✅ **Retry-After Header**: SEO için kritik olan Retry-After header'ı eklendi
- ✅ **Otomatik Tespit**: Veritabanı bağlantı hataları otomatik olarak 503'e dönüştürülüyor
- ✅ **Detaylı Logging**: Tüm 503 hataları detaylı şekilde loglanıyor

### 3. Gelişmiş Health Check Endpoint

- ✅ **Detaylı Sistem Durumu**: Veritabanı, bellek, yanıt süresi kontrolü
- ✅ **Pool İstatistikleri**: Bağlantı havuzu detaylı istatistikleri
- ✅ **Memory Monitoring**: Bellek kullanımı izleme ve uyarıları

## 🔍 Veritabanı Bağlantı İzleme

### Health Check Endpoint Kullanımı

#### Temel Health Check
```bash
curl http://localhost:3000/health
```

#### Detaylı Health Check (Önerilen)
```bash
curl http://localhost:3000/api/health
```

**Başarılı Yanıt (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 12345,
  "environment": "production",
  "version": "1.0.0",
  "responseTime": 45,
  "checks": {
    "database": {
      "status": "healthy",
      "healthy": true,
      "lastError": null,
      "retryCount": 0,
      "poolStats": {
        "totalConnections": 5,
        "freeConnections": 3,
        "queuedRequests": 0
      }
    },
    "memory": {
      "status": "healthy",
      "heapUsed": 45,
      "heapTotal": 128,
      "rss": 180,
      "usagePercent": 35
    },
    "responseTime": {
      "status": "healthy",
      "ms": 45
    }
  }
}
```

**Başarısız Yanıt (503 Service Unavailable):**
```json
{
  "success": false,
  "status": "unhealthy",
  "timestamp": "2025-01-XX...",
  "checks": {
    "database": {
      "status": "unhealthy",
      "healthy": false,
      "lastError": "Connection refused",
      "retryCount": 3,
      "poolStats": {
        "totalConnections": 0,
        "freeConnections": 0,
        "queuedRequests": 5
      }
    }
  }
}
```

### Health Check Response Header'ları

503 durumunda otomatik olarak `Retry-After: 30` header'ı eklenir (SEO için kritik).

## 📊 Monitoring Araçları Kurulumu

### 1. Freshping (Önerilen - Raporda Belirtilen)

**Kurulum Adımları:**

1. [Freshping.io](https://www.freshworks.com/website-monitoring/) hesabı oluşturun
2. Yeni bir monitor ekleyin:
   - **URL**: `https://sadece1deneme.com/health`
   - **Monitor Type**: HTTP(S)
   - **Check Interval**: 1 dakika (önerilen)
   - **Locations**: En az 5 küresel konum seçin
3. Alert kanallarını yapılandırın:
   - E-posta
   - SMS (opsiyonel)
   - Webhook (Slack, Discord vb.)

**Yapılandırma Örneği:**
```
Monitor Name: sadece1deneme.com Health Check
URL: https://sadece1deneme.com/health
Expected Status Code: 200
Timeout: 10 seconds
Check Interval: 1 minute
Locations: 
  - US East (Virginia)
  - EU West (Ireland)
  - Asia Pacific (Singapore)
  - South America (São Paulo)
  - Australia (Sydney)
Alert Conditions:
  - Status code != 200 → Immediate alert
  - Response time > 3000ms → Warning alert
  - 3 consecutive failures → Critical alert
```

### 2. UptimeRobot (Alternatif)

1. [UptimeRobot.com](https://uptimerobot.com/) hesabı oluşturun
2. Yeni monitor ekleyin:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://sadece1deneme.com/health`
   - **Monitoring Interval**: 5 dakika (ücretsiz plan)
3. Alert contacts ekleyin

### 3. Custom Monitoring Script (Sunucu İçi)

Sunucunuzda çalıştırabileceğiniz basit bir monitoring script'i:

```bash
#!/bin/bash
# server/monitor-health.sh

HEALTH_URL="http://localhost:3000/health"
ALERT_EMAIL="admin@example.com"
LOG_FILE="/var/log/health-monitor.log"

while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    if [ "$response" != "200" ]; then
        echo "[$timestamp] ALERT: Health check failed with status $response" >> $LOG_FILE
        # E-posta gönder (mail komutu veya sendmail kullanarak)
        echo "Health check failed at $timestamp. Status: $response" | mail -s "ALERT: Server Health Check Failed" $ALERT_EMAIL
    else
        echo "[$timestamp] OK: Health check passed" >> $LOG_FILE
    fi
    
    sleep 60  # 1 dakika bekle
done
```

**Cron Job Olarak Çalıştırma:**
```bash
# Crontab'a ekleyin (her 1 dakikada bir)
* * * * * /path/to/monitor-health.sh
```

## 🚨 Alerting Yapılandırması

### 1. E-posta Alerting

**Nodemailer ile E-posta Gönderimi:**

```typescript
// server/src/utils/alerting.ts (örnek)
import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendHealthAlert = async (message: string) => {
  try {
    await transporter.sendMail({
      from: process.env.ALERT_FROM_EMAIL,
      to: process.env.ALERT_TO_EMAIL,
      subject: '🚨 Server Health Alert - sadece1deneme.com',
      text: message,
      html: `<pre>${message}</pre>`,
    });
    logger.info('Health alert email sent');
  } catch (error) {
    logger.error('Failed to send health alert email:', error);
  }
};
```

### 2. Slack Webhook

```typescript
// Slack webhook örneği
export const sendSlackAlert = async (message: string) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *Server Health Alert*\n${message}`,
        username: 'Health Monitor',
        icon_emoji: ':warning:',
      }),
    });
  } catch (error) {
    logger.error('Failed to send Slack alert:', error);
  }
};
```

### 3. SMS Alerting (Twilio)

```typescript
// Twilio SMS örneği
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMSAlert = async (message: string) => {
  try {
    await client.messages.create({
      body: `🚨 Server Alert: ${message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ALERT_PHONE_NUMBER,
    });
  } catch (error) {
    logger.error('Failed to send SMS alert:', error);
  }
};
```

## 🔧 Environment Variables

`.env` dosyanıza ekleyin:

```env
# Database Connection Settings
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Monitoring
HEALTH_CHECK_INTERVAL=30000  # 30 seconds
MONITORING_ENABLED=true

# Alerting (opsiyonel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_FROM_EMAIL=alerts@example.com
ALERT_TO_EMAIL=admin@example.com

# Slack (opsiyonel)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Twilio (opsiyonel)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
ALERT_PHONE_NUMBER=+1234567890
```

## 🐛 Troubleshooting

### Problem: Health Check Sürekli 503 Döndürüyor

**Çözüm Adımları:**

1. **Veritabanı Bağlantısını Kontrol Edin:**
   ```bash
   # MySQL/MariaDB servisinin çalıştığından emin olun
   sudo systemctl status mysql
   # veya
   sudo systemctl status mariadb
   ```

2. **Veritabanı Kimlik Bilgilerini Doğrulayın:**
   ```bash
   mysql -h localhost -u root -p
   # .env dosyasındaki bilgilerle bağlanmayı deneyin
   ```

3. **Log Dosyalarını İnceleyin:**
   ```bash
   tail -f server/logs/error.log
   tail -f server/logs/combined.log
   ```

4. **Manuel Bağlantı Testi:**
   ```bash
   node -e "require('./server/dist/config/database').testConnection().then(() => console.log('OK')).catch(e => console.error('FAIL:', e))"
   ```

### Problem: Monitoring Araçları Alert Göndermiyor

**Kontrol Listesi:**

- ✅ Health check endpoint'i erişilebilir mi? (`curl https://sadece1deneme.com/health`)
- ✅ Firewall kuralları doğru mu?
- ✅ Nginx reverse proxy doğru yapılandırılmış mı?
- ✅ SSL sertifikası geçerli mi?
- ✅ Monitoring servisinin IP'si engellenmemiş mi?

### Problem: Yüksek Bellek Kullanımı

**Çözüm:**

1. **Connection Pool Limitini Azaltın:**
   ```env
   DB_CONNECTION_LIMIT=5  # 10'dan 5'e düşürün
   ```

2. **Memory Leak Kontrolü:**
   ```bash
   # Node.js memory profiler kullanın
   node --inspect server/dist/server.js
   ```

3. **Process Manager Kullanın (PM2):**
   ```bash
   npm install -g pm2
   pm2 start server/dist/server.js --name api-server
   pm2 monit  # Memory kullanımını izleyin
   ```

## 📈 Performans Metrikleri İzleme

### GTmetrix Kurulumu

1. [GTmetrix.com](https://gtmetrix.com/) hesabı oluşturun
2. Yeni test oluşturun:
   - **URL**: `https://sadece1deneme.com`
   - **Test Location**: Ana hedef kitlenizin konumuna yakın seçin
   - **Browser**: Chrome (önerilen)
   - **Connection**: Fast 4G (gerçekçi test için)
3. Otomatik test zamanlaması ayarlayın (günlük/haftalık)

### Google PageSpeed Insights

1. [PageSpeed Insights](https://pagespeed.web.dev/) kullanın
2. URL'nizi girin ve analiz edin
3. Core Web Vitals metriklerini takip edin:
   - **LCP (Largest Contentful Paint)**: < 2.5s (İyi)
   - **FID/INP (Interaction to Next Paint)**: < 200ms (İyi)
   - **CLS (Cumulative Layout Shift)**: < 0.1 (İyi)

## 🔄 Planlı Bakım Protokolü

Planlı bakımlar için kontrollü 503 yanıtı:

```typescript
// server/src/middleware/maintenance.ts
export const maintenanceMode = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    res.setHeader('Retry-After', process.env.MAINTENANCE_RETRY_AFTER || '3600');
    res.status(503).json({
      success: false,
      message: 'Service is under maintenance. Please try again later.',
      maintenance: true,
      estimatedCompletion: process.env.MAINTENANCE_ETA || '1 hour',
    });
    return;
  }
  next();
};
```

**Kullanım:**
```bash
# Bakım modunu aktifleştir
export MAINTENANCE_MODE=true
export MAINTENANCE_RETRY_AFTER=3600  # 1 saat
export MAINTENANCE_ETA="2025-01-XX 14:00 UTC"

# Bakım modunu kapat
export MAINTENANCE_MODE=false
```

## 📝 Özet ve Sonraki Adımlar

### Tamamlanan İyileştirmeler ✅

1. ✅ Veritabanı bağlantı retry logic
2. ✅ 503 hata yönetimi ve Retry-After header
3. ✅ Gelişmiş health check endpoint
4. ✅ Otomatik bağlantı izleme
5. ✅ Detaylı logging ve hata takibi

### Önerilen Sonraki Adımlar

1. **Monitoring Araçlarını Kurun:**
   - Freshping veya UptimeRobot hesabı oluşturun
   - Health check endpoint'ini izlemeye başlayın
   - Alert kanallarını yapılandırın

2. **Performans İzleme:**
   - GTmetrix ve PageSpeed Insights'ta düzenli testler yapın
   - Core Web Vitals metriklerini takip edin

3. **Altyapı İyileştirmeleri:**
   - CDN kurulumu (Cloudflare, AWS CloudFront)
   - Database query optimization
   - Caching stratejisi (Redis)

4. **Dokümantasyon:**
   - Runbook oluşturun (operasyonel prosedürler)
   - Incident response planı hazırlayın

## 📞 Destek

Sorularınız için:
- Log dosyaları: `server/logs/`
- Health check: `https://sadece1deneme.com/api/health`
- Database health: Health check response'unda `checks.database` objesi

---

**Son Güncelleme:** 2025-01-XX
**Versiyon:** 1.0.0



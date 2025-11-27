# Category DELETE 404 Hatası - Çözüm

## 🔍 Sorun
`DELETE /api/categories/{id}` endpoint'i 404 hatası veriyor.

## ✅ Kontrol Adımları

### 1. Backend Çalışıyor mu?
```bash
# PM2 durumunu kontrol et
pm2 status

# Backend loglarını kontrol et
pm2 logs campscape-backend --lines 50

# Health check
curl http://localhost:3000/api/health
```

### 2. Backend Build Kontrolü
```bash
cd /var/www/campscape/server

# Build yapılmış mı kontrol et
ls -la dist/routes/categories.routes.js

# Eğer yoksa build yap
npm run build

# PM2 restart
pm2 restart campscape-backend
```

### 3. Route Test
```bash
# Backend'de route çalışıyor mu test et
curl -X DELETE http://localhost:3000/api/categories/test-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Nginx Proxy Kontrolü
```bash
# Nginx error log kontrolü
sudo tail -f /var/log/nginx/campscape-error.log

# Nginx config test
sudo nginx -t

# Nginx reload
sudo systemctl reload nginx
```

### 5. Frontend API Base URL Kontrolü
Browser console'da:
```javascript
// API base URL kontrolü
console.log(import.meta.env.VITE_API_BASE_URL || '/api');
```

## 🔧 Olası Çözümler

### Çözüm 1: Backend Restart
```bash
cd /var/www/campscape/server
npm run build
pm2 restart campscape-backend
```

### Çözüm 2: Route Sıralaması Kontrolü
`server/src/app.ts` dosyasında route'ların doğru sırada olduğundan emin ol:
```typescript
app.use('/api/categories', categoryRoutes);
```

### Çözüm 3: Authentication Kontrolü
DELETE endpoint'i `authenticate` ve `authorizeAdmin` middleware'leri gerektiriyor. Token'ın geçerli olduğundan emin ol.

## 📝 Not
404 hatası genellikle:
- Route tanımlı değil
- Backend build edilmemiş
- Nginx proxy yanlış yapılandırılmış
- Route sıralaması yanlış

anlamına gelir.


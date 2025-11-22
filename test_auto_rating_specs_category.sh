#!/bin/bash
# test_auto_rating_specs_category.sh - Otomatik Rating, Specifications ve Category Test Script
# Bu script, API'ye direkt PUT request göndererek sadece fiyatı günceller ve diğer değerlerin korunup korunmadığını test eder

echo "=========================================="
echo "🤖 OTOMATIK RATING, SPECS & CATEGORY TEST"
echo "=========================================="

# Test için gear ID (kullanıcı değiştirebilir)
GEAR_ID="74af800d-01da-4fcd-a6d5-18ec846493f7"

# MySQL bilgileri
DB_USER="root"
DB_PASS="MySecurePass123!@#"
DB_NAME="campscape_marketplace"

# API Base URL
API_BASE="http://localhost:3000/api"

echo ""
echo "1️⃣ Mevcut Değerleri Al (Güncelleme ÖNCESİ):"
echo "----------------------------------------"
BEFORE_RESPONSE=$(curl -s "$API_BASE/gear/$GEAR_ID")
BEFORE_RATING=$(echo "$BEFORE_RESPONSE" | jq -r '.data.rating // "null"' 2>/dev/null || echo "null")
BEFORE_CATEGORY_ID=$(echo "$BEFORE_RESPONSE" | jq -r '.data.category_id // "null"' 2>/dev/null || echo "null")
BEFORE_SPECS=$(echo "$BEFORE_RESPONSE" | jq -c '.data.specifications // {}' 2>/dev/null || echo "{}")
BEFORE_PRICE=$(echo "$BEFORE_RESPONSE" | jq -r '.data.price_per_day // "0"' 2>/dev/null || echo "0")
BEFORE_NAME=$(echo "$BEFORE_RESPONSE" | jq -r '.data.name // ""' 2>/dev/null || echo "")

echo "  Rating: $BEFORE_RATING"
echo "  Category ID: $BEFORE_CATEGORY_ID"
echo "  Specifications: $BEFORE_SPECS"
echo "  Price: $BEFORE_PRICE"
echo "  Name: $BEFORE_NAME"

# Yeni fiyat (mevcut fiyat + 100)
NEW_PRICE=$(echo "$BEFORE_PRICE + 100" | bc 2>/dev/null || echo "$(( ${BEFORE_PRICE%.*} + 100 )).00")

echo ""
echo "2️⃣ Güncelleme Yapılıyor (Sadece Fiyat Değiştiriliyor):"
echo "----------------------------------------"
echo "  Yeni Fiyat: $NEW_PRICE"
echo "  Rating: KORUNACAK ($BEFORE_RATING)"
echo "  Category ID: KORUNACAK ($BEFORE_CATEGORY_ID)"
echo "  Specifications: KORUNACAK ($BEFORE_SPECS)"

# API Token (eğer gerekirse - şimdilik boş bırakıyoruz, backend auth kontrol edecek)
# TOKEN="your_token_here"

# Güncelleme payload - SADECE fiyat değiştir, diğerleri korunmalı
UPDATE_PAYLOAD=$(cat <<EOF
{
  "pricePerDay": $NEW_PRICE,
  "name": "$BEFORE_NAME"
}
EOF
)

echo ""
echo "3️⃣ PUT Request Gönderiliyor:"
echo "----------------------------------------"
echo "Payload: $UPDATE_PAYLOAD"
echo ""

# PUT request gönder
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/gear/$GEAR_ID" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD")

echo "Response: $UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"

# 2 saniye bekle (veritabanı güncellemesi için)
sleep 2

echo ""
echo "4️⃣ Güncellenmiş Değerleri Kontrol Et (Güncelleme SONRASI):"
echo "----------------------------------------"
AFTER_RESPONSE=$(curl -s "$API_BASE/gear/$GEAR_ID")
AFTER_RATING=$(echo "$AFTER_RESPONSE" | jq -r '.data.rating // "null"' 2>/dev/null || echo "null")
AFTER_CATEGORY_ID=$(echo "$AFTER_RESPONSE" | jq -r '.data.category_id // "null"' 2>/dev/null || echo "null")
AFTER_SPECS=$(echo "$AFTER_RESPONSE" | jq -c '.data.specifications // {}' 2>/dev/null || echo "{}")
AFTER_PRICE=$(echo "$AFTER_RESPONSE" | jq -r '.data.price_per_day // "0"' 2>/dev/null || echo "0")

echo "  Rating: $AFTER_RATING"
echo "  Category ID: $AFTER_CATEGORY_ID"
echo "  Specifications: $AFTER_SPECS"
echo "  Price: $AFTER_PRICE"

echo ""
echo "5️⃣ Veritabanı Kontrolü:"
echo "----------------------------------------"
mysql -u $DB_USER -p"$DB_PASS" $DB_NAME -e "
SELECT 
  id,
  name,
  rating,
  category_id,
  specifications,
  price_per_day,
  updated_at
FROM gear 
WHERE id = '$GEAR_ID';
" 2>/dev/null

echo ""
echo "6️⃣ Sonuçlar:"
echo "=========================================="

# Rating kontrolü
if [ "$BEFORE_RATING" = "$AFTER_RATING" ]; then
  echo "✅ Rating KORUNDU: $BEFORE_RATING"
else
  echo "❌ Rating KORUNMADI: $BEFORE_RATING → $AFTER_RATING"
fi

# null kontrolü
if [ "$BEFORE_RATING" = "null" ] && [ "$AFTER_RATING" = "null" ]; then
  echo "⚠️  Rating zaten null, korunma testi yapılamadı"
fi

# Category kontrolü
if [ "$BEFORE_CATEGORY_ID" = "$AFTER_CATEGORY_ID" ]; then
  echo "✅ Category ID KORUNDU: $BEFORE_CATEGORY_ID"
else
  echo "❌ Category ID KORUNMADI: $BEFORE_CATEGORY_ID → $AFTER_CATEGORY_ID"
fi

# Specifications kontrolü
if [ "$BEFORE_SPECS" = "$AFTER_SPECS" ]; then
  echo "✅ Specifications KORUNDU: $BEFORE_SPECS"
else
  echo "❌ Specifications KORUNMADI: $BEFORE_SPECS → $AFTER_SPECS"
fi

# Price kontrolü (değişmiş olmalı)
if [ "$BEFORE_PRICE" != "$AFTER_PRICE" ]; then
  echo "✅ Price DEĞİŞTİ: $BEFORE_PRICE → $AFTER_PRICE"
else
  echo "⚠️  Price DEĞİŞMEDİ: $BEFORE_PRICE (beklenen: $NEW_PRICE)"
fi

echo ""
echo "=========================================="
echo "✅ Test tamamlandı!"
echo "=========================================="


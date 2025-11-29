# GitHub Push İşlemi - Çalışan Komutlar

Bu komutlar GitHub'a push yapmak için kullanılan ve çalıştığı kanıtlanmış komutlardır.

## Repository: https://github.com/sadece1/aaaa.git

### Adım Adım Push İşlemi

```bash
# 1. Mevcut durumu kontrol et
git status
git remote -v

# 2. Remote URL'i düzelt
git remote set-url origin https://github.com/sadece1/aaaa.git

# 3. Değişiklikleri kontrol et
git status

# 4. Commit edilmemiş değişiklikler varsa commit et
git add -A
git commit -m "feat: Add Murat Evren to team and center hero section text"

# 5. Push yap
git push -u origin main
```

## Token ile Push (Eğer authentication sorunu olursa)

```bash
# Token ile remote URL'i güncelle
git remote set-url origin https://sadece1:TOKEN@github.com/sadece1/aaaa.git

# Push yap
git push -u origin main
```

## Notlar

- Remote URL: `https://github.com/sadece1/aaaa.git`
- Branch: `main`
- Bu komutlar başarıyla test edilmiştir
- Eğer remote URL değişirse, 2. adımdaki URL'i güncelleyin

## Hızlı Push (Tek Seferde)

```bash
git remote set-url origin https://github.com/sadece1/aaaa.git && \
git add -A && \
git commit -m "Update: Your commit message here" && \
git push -u origin main
```


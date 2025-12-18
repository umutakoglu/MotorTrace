# 🚀 MotorTrace - Quick Reference

## Production Deployment

### 🎯 Hızlı Başlangıç (3 Adım)

```bash
# 1. Environment hazırla
cp .env.production.example .env
nano .env  # Şifreleri değiştir!

# 2. SSL sertifikası oluştur
./scripts/generate-ssl.sh  # Test için
# VEYA
sudo certbot certonly --standalone -d yourdomain.com  # Production için

# 3. Deploy et
./deploy-production.sh
```

**✅ Bitti! Uygulama https://yourdomain.com adresinde çalışıyor**

---

## 📌 Önemli Komutlar

### Başlat/Durdur

```bash
# Başlat
docker-compose -f docker-compose.prod.yml up -d

# Durdur
docker-compose -f docker-compose.prod.yml down

# Yeniden başlat
docker-compose -f docker-compose.prod.yml restart

# Rebuild ve başlat
docker-compose -f docker-compose.prod.yml up -d --build
```

### Loglar

```bash
# Tüm loglar
docker-compose -f docker-compose.prod.yml logs -f

# Backend logları
docker-compose -f docker-compose.prod.yml logs -f backend

# Son 100 satır
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Backup

```bash
# Yedek al
./backup.sh

# Geri yükle
./restore.sh 20241218_140530
```

### Durum Kontrolü

```bash
# Container durumu
docker-compose -f docker-compose.prod.yml ps

# Resource kullanımı
docker stats

# Health check
curl https://yourdomain.com/health
```

---

## 🔧 Günlük İşlemler

### Database Yönetimi

```bash
# MySQL'e bağlan
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# Database backup
docker-compose -f docker-compose.prod.yml exec mysql \
  mysqldump -u root -p motortrace > backup.sql

# Database restore
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T mysql \
  mysql -u root -p motortrace
```

### Log Temizleme

```bash
# Docker log temizleme
docker system prune -a --volumes

# Eski yedekleri sil (30 günden eski)
find backups/ -mtime +30 -delete
```

### Güncelleme

```bash
# Kodu çek
git pull origin main

# Rebuild ve restart
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## ⚠️ Sorun Giderme

### Container çalışmıyor

```bash
# Logları kontrol et
docker-compose -f docker-compose.prod.yml logs <service>

# Yeniden başlat
docker-compose -f docker-compose.prod.yml restart <service>
```

### Database bağlantı hatası

```bash
# MySQL health check
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping

# Backend'i restart et
docker-compose -f docker-compose.prod.yml restart backend
```

### SSL hatası

```bash
# Sertifikaları kontrol et
ls -la ssl/
openssl x509 -in ssl/cert.pem -text -noout

# Nginx'i restart et
docker-compose -f docker-compose.prod.yml restart nginx
```

### Tüm sistemi sıfırla (⚠️ Veri kaybı!)

```bash
# Önce backup al!
./backup.sh

# Sıfırla
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔐 Güvenlik Checklist

- [ ] .env dosyasındaki şifreler değiştirildi
- [ ] JWT_SECRET güçlü ve rastgele (64+ karakter)
- [ ] SSL sertifikaları kuruldu (Let's Encrypt)
- [ ] Firewall aktif (UFW)
- [ ] Fail2Ban kuruldu
- [ ] Otomatik yedekleme aktif
- [ ] Database sadece internal network'te
- [ ] Backend sadece nginx üzerinden erişilebilir

---

## 📁 Önemli Dosyalar

```
MotorTrace/
├── .env                          # Environment variables (GİZLİ!)
├── docker-compose.prod.yml       # Production yapılandırması
├── deploy-production.sh          # Deployment scripti
├── backup.sh                     # Yedekleme scripti
├── restore.sh                    # Geri yükleme scripti
├── ssl/                          # SSL sertifikaları
│   ├── cert.pem
│   └── key.pem
├── backups/                      # Yedekler
├── logs/                         # Log dosyaları
└── nginx/conf.d/                 # Nginx config
```

---

## 🌐 URL'ler

- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Health**: https://yourdomain.com/health
- **Uploads**: https://yourdomain.com/uploads

---

## 📞 Yardım

Detaylı bilgi için:
- **Full Guide**: [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md)
- **Docker Guide**: [DOCKER.md](DOCKER.md)
- **GitHub Issues**: https://github.com/yourusername/MotorTrace/issues

---

**Son Güncelleme**: 2024-12-18

# 🚀 MotorTrace Production Deployment Guide

Production ortamına Docker ile deployment rehberi.

## 📋 İçindekiler

- [Gereksinimler](#gereksinimler)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Detaylı Kurulum](#detaylı-kurulum)
- [SSL Sertifikası Kurulumu](#ssl-sertifikası-kurulumu)
- [Yönetim Komutları](#yönetim-komutları)
- [Yedekleme ve Geri Yükleme](#yedekleme-ve-geri-yükleme)
- [Güvenlik](#güvenlik)
- [Monitoring](#monitoring)
- [Sorun Giderme](#sorun-giderme)

## 🔧 Gereksinimler

### Sistem Gereksinimleri
- **İşletim Sistemi**: Linux (Ubuntu 20.04+ önerilir)
- **RAM**: Minimum 2GB, önerilen 4GB+
- **Disk**: Minimum 20GB boş alan
- **CPU**: 2 core önerilir

### Yazılım Gereksinimleri
- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL (SSL sertifikaları için)

### Yükleme

```bash
# Docker kurulumu (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Çıkış yapıp tekrar giriş yapın
logout
```

## 🚀 Hızlı Başlangıç

### 1. Kodu Klonlayın

```bash
git clone https://github.com/yourusername/MotorTrace.git
cd MotorTrace
```

### 2. Environment Dosyasını Oluşturun

```bash
cp .env.production.example .env
nano .env  # veya vim, vi
```

**Mutlaka değiştirin:**
```env
DB_PASSWORD=GÜÇLÜ_ŞİFRE_123!
DB_ROOT_PASSWORD=ROOT_ŞİFRESİ_456!
JWT_SECRET=EN_AZ_64_KARAKTER_UZUNLUĞUNDA_RASTGELE_STRING
FRONTEND_URL=https://yourdomain.com
```

### 3. SSL Sertifikası Oluşturun

**Üretim için (Let's Encrypt ile):**
```bash
# Certbot kurulumu
sudo apt-get update
sudo apt-get install certbot

# SSL sertifikası oluşturma
sudo certbot certonly --standalone -d yourdomain.com

# Sertifikaları kopyalama
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown -R $USER:$USER ssl
```

**Test için (Self-signed):**
```bash
./scripts/generate-ssl.sh
```

### 4. Deploy Edin

```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

✅ Uygulama şu adreste çalışacak: **https://yourdomain.com**

## 📚 Detaylı Kurulum

### Adım 1: Sunucu Hazırlığı

```bash
# Sistem güncellemesi
sudo apt-get update && sudo apt-get upgrade -y

# Gerekli paketler
sudo apt-get install -y git curl wget ufw

# Firewall ayarları
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### Adım 2: Docker Kurulumu

```bash
# Docker kurulum scripti
curl -fsSL https://get.docker.com | sudo sh

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER

# Servisi başlat
sudo systemctl enable docker
sudo systemctl start docker

# Test et
docker --version
docker-compose --version
```

### Adım 3: Uygulama Kurulumu

```bash
# Repository'yi klonla
git clone https://github.com/yourusername/MotorTrace.git
cd MotorTrace

# Environment dosyasını hazırla
cp .env.production.example .env

# ⚠️ MUTLAKA .env dosyasını düzenleyin!
nano .env
```

### Adım 4: Dizin İzinleri

```bash
# Gerekli dizinleri oluştur
mkdir -p backups logs ssl backend/uploads/qr-codes backend/uploads/services

# İzinleri ayarla
chmod -R 755 backups logs backend/uploads
chmod 600 ssl/*.pem  # SSL sertifikaları için
```

### Adım 5: Deployment

```bash
# Deploy scriptini çalıştırılabilir yap
chmod +x deploy-production.sh backup.sh restore.sh

# Deploy et
./deploy-production.sh
```

## 🔐 SSL Sertifikası Kurulumu

### Let's Encrypt (Ücretsiz ve Önerilen)

```bash
# Certbot kurulumu
sudo apt-get install certbot

# Nginx'i geçici olarak durdur
docker-compose -f docker-compose.prod.yml stop nginx

# Sertifika al
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos

# Sertifikaları kopyala
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown -R $USER:$USER ssl
sudo chmod 600 ssl/*.pem

# Nginx'i tekrar başlat
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Otomatik Yenileme

```bash
# Crontab düzenle
sudo crontab -e

# Şunu ekle (Her ay 1'inde saat 02:00'de yenile)
0 2 1 * * certbot renew --quiet && docker-compose -f /path/to/MotorTrace/docker-compose.prod.yml restart nginx
```

### Self-Signed SSL (Test için)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=TR/ST=Istanbul/L=Istanbul/O=MotorTrace/CN=localhost"
```

## 🎮 Yönetim Komutları

### Container Yönetimi

```bash
# Tüm servisleri başlat
docker-compose -f docker-compose.prod.yml up -d

# Belirli servisi başlat
docker-compose -f docker-compose.prod.yml up -d backend

# Servisleri durdur
docker-compose -f docker-compose.prod.yml down

# Yeniden başlat
docker-compose -f docker-compose.prod.yml restart

# Yeniden build et ve başlat
docker-compose -f docker-compose.prod.yml up -d --build
```

### Logları İzleme

```bash
# Tüm loglar
docker-compose -f docker-compose.prod.yml logs -f

# Belirli servis
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f mysql
docker-compose -f docker-compose.prod.yml logs -f nginx

# Son 100 satır
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Container'a Bağlanma

```bash
# Backend container'a bash ile bağlan
docker-compose -f docker-compose.prod.yml exec backend sh

# MySQL'e bağlan
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# Nginx'e bağlan
docker-compose -f docker-compose.prod.yml exec nginx sh
```

### Container Durumu

```bash
# Çalışan containerları göster
docker-compose -f docker-compose.prod.yml ps

# Detaylı durum
docker-compose -f docker-compose.prod.yml ps -a

# Resource kullanımı
docker stats
```

## 💾 Yedekleme ve Geri Yükleme

### Manuel Yedekleme

```bash
# Otomatik yedekleme scripti
./backup.sh

# Yedekler backups/ dizininde:
# - db_backup_YYYYMMDD_HHMMSS.sql.gz
# - uploads_backup_YYYYMMDD_HHMMSS.tar.gz
```

### Otomatik Yedekleme (Cron)

```bash
# Crontab düzenle
crontab -e

# Her gün saat 02:00'de yedek al
0 2 * * * /path/to/MotorTrace/backup.sh >> /path/to/MotorTrace/logs/backup.log 2>&1
```

### Geri Yükleme

```bash
# Mevcut yedekleri listele
ls -lh backups/

# Geri yükle (YYYYMMDD_HHMMSS formatında)
./restore.sh 20241218_140530
```

### Manuel Database Export/Import

```bash
# Export
docker-compose -f docker-compose.prod.yml exec mysql \
  mysqldump -u root -p motortrace > backup.sql

# Import
docker-compose -f docker-compose.prod.yml exec -T mysql \
  mysql -u root -p motortrace < backup.sql
```

## 🔒 Güvenlik

### 1. Güçlü Şifreler Kullanın

```bash
# Rastgele şifre oluştur
openssl rand -base64 32

# .env dosyasındaki şifreleri değiştirin
DB_PASSWORD=<güçlü-şifre>
DB_ROOT_PASSWORD=<güçlü-şifre>
JWT_SECRET=<64-karakter-rastgele-string>
```

### 2. Firewall Ayarları

```bash
# UFW kurulumu
sudo apt-get install ufw

# Sadece gerekli portları aç
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. Fail2Ban Kurulumu (Brute-force koruması)

```bash
# Fail2Ban kurulumu
sudo apt-get install fail2ban

# Konfigürasyon
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Servisi başlat
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Docker Container Güvenliği

```yaml
# docker-compose.prod.yml içinde zaten mevcut:
- Non-root user kullanımı
- Read-only volumes
- Resource limits
- Network isolation
```

### 5. SSL/TLS Güvenliği

```bash
# nginx/conf.d/motortrace.conf içinde:
- TLS 1.2 ve 1.3 protokolleri
- Güçlü cipher suites
- HSTS header
- Security headers
```

## 📊 Monitoring

### Health Check

```bash
# Tüm servislerin sağlık durumu
docker-compose -f docker-compose.prod.yml ps

# HTTP health endpoint
curl http://localhost/health
curl https://yourdomain.com/health
```

### Resource Monitoring

```bash
# Gerçek zamanlı resource kullanımı
docker stats

# Disk kullanımı
df -h
docker system df
```

### Log Monitoring

```bash
# Canlı log takibi
docker-compose -f docker-compose.prod.yml logs -f

# Error logları
docker-compose -f docker-compose.prod.yml logs | grep -i error

# Nginx access logs
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log
```

## 🔧 Sorun Giderme

### Container Başlamıyor

```bash
# Container loglarını kontrol et
docker-compose -f docker-compose.prod.yml logs <service-name>

# Container durumunu kontrol et
docker-compose -f docker-compose.prod.yml ps

# Yeniden başlat
docker-compose -f docker-compose.prod.yml restart <service-name>
```

### Database Bağlantı Hatası

```bash
# MySQL loglarını kontrol et
docker-compose -f docker-compose.prod.yml logs mysql

# MySQL'in hazır olmasını bekle
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost

# Backend'i yeniden başlat
docker-compose -f docker-compose.prod.yml restart backend
```

### SSL Sertifika Hatası

```bash
# Sertifika dosyalarını kontrol et
ls -la ssl/

# Sertifika geçerliliğini kontrol et
openssl x509 -in ssl/cert.pem -text -noout

# Nginx konfigürasyonunu test et
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Yavaş Performans

```bash
# Resource kullanımını kontrol et
docker stats

# Database performansını optimize et
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"

# Nginx cache temizle
docker-compose -f docker-compose.prod.yml restart nginx
```

### Her Şeyi Sıfırla

```bash
# ⚠️ DİKKAT: Bu komut tüm veriyi siler!

# Önce backup alın
./backup.sh

# Tüm containerları ve volumeları sil
docker-compose -f docker-compose.prod.yml down -v

# Temiz başlangıç
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📞 Destek

Sorun yaşıyorsanız:

1. Önce logları kontrol edin
2. GitHub Issues'da arayın
3. Yeni issue açın

## 🎯 Checklist: Production'a Almadan Önce

- [ ] `.env` dosyasındaki tüm şifreler değiştirildi
- [ ] JWT_SECRET güçlü ve rastgele
- [ ] SSL sertifikaları kuruldu (Let's Encrypt)
- [ ] Domain DNS kayıtları ayarlandı
- [ ] Firewall kuralları uygulandı
- [ ] Otomatik yedekleme kuruldu
- [ ] Health check'ler çalışıyor
- [ ] Loglar izleniyor
- [ ] Resource limits ayarlandı
- [ ] Güvenlik başlıkları aktif

---

**Başarılar! 🚀**

- ✅ Motor CRUD işlemleri (Admin)
- ✅ QR kod oluşturma ve okuma
- ✅ Servis geçmişi takibi
- ✅ Gelişmiş filtreleme ve arama
- ✅ Roller tabanlı yetkilendirme (Admin/User)
- ✅ Modern ve responsive web arayüzü
- ✅ RESTful API
- ✅ API dokümantasyonu

## 🛠️ Teknoloji Stack

### Backend
- Node.js & Express
- MySQL
- JWT Authentication
- QR Code Generation
- bcrypt password hashing

### Frontend
- Vanilla JavaScript (SPA)
- Tailwind CSS
- HTML5 QR Code Scanner
- Glassmorphism Design

## 📋 Gereksinimler

- Node.js v14+ (Kurulu: v25.2.1)
- npm v6+ (Kurulu: 11.6.2)
- MySQL
- Modern web tarayıcısı

## 🔧 Kurulum

### 1. Veritabanı Kurulumu

Veritabanını oluşturun:

```bash
# MySQL'e bağlanın (phpMyAdmin veya terminal)
mysql -u root -p

# Veritabanı şemasını import edin
source backend/database/schema.sql
```

### 2. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları kur
npm install

# .env dosyasını yapılandırın
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME ayarlarını kontrol edin

# Development modda çalıştır
npm run dev

# Production modda çalıştır
npm start
```

Backend şu adreste çalışacak: `http://localhost:5000`

### 3. Frontend Kurulumu

Frontend için ayrı bir sunucu gerekli (örneğin http-server veya live-server):

```bash
cd frontend

# http-server kur (global)
npm install -g http-server

# Sunucuyu başlat
http-server public -p 3000 -c-1
```

Frontend şu adreste çalışacak: `http://localhost:3000`

## 📖 Kullanım

### Giriş Bilgileri

**Admin Hesabı:**
- Email: `admin@motortrace.com`
- Şifre: `admin123`

### API Endpoints

Detaylı API dokümantasyonu için: [backend/API.md](backend/API.md)

Ana endpoint'ler:
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/register` - Kayıt ol
- `GET /api/motors` - Motorları listele
- `POST /api/motors` - Yeni motor ekle (Admin)
- `GET /api/motors/:id` - Motor detayı
- `GET /api/motors/scan/:motorId` - QR kod ile motor bilgisi
- `GET /api/services/motor/:motorId` - Motor servis geçmişi
- `POST /api/services/motor/:motorId` - Servis kaydı ekle (Admin)

### QR Kod Kullanımı

1. Admin olarak giriş yapın
2. Yeni motor ekleyin
3. Motor oluşturulduğunda otomatik QR kod oluşturulur
4. QR kodu indirin ve yazdırın
5. Mobil cihazdan QR'ı okutun → Motor bilgilerine anında erişin

## 🏗️ Proje Yapısı

```
MotorTrace/
├── backend/
│   ├── config/          # Veritabanı yapılandırması
│   ├── controllers/     # İş mantığı
│   ├── middleware/      # Auth, admin, error handling
│   ├── models/          # Veri modelleri
│   ├── routes/          # API rotaları
│   ├── database/        # SQL şemaları
│   ├── uploads/         # QR kodlar ve dosyalar
│   ├── server.js        # Ana sunucu
│   ├── .env             # Ortam değişkenleri
│   └── API.md           # API dokümantasyonu
├── frontend/
│   └── public/
│       ├── css/         # Özel stiller
│       ├── js/
│       │   ├── components/  # UI bileşenleri
│       │   ├── utils/       # Yardımcı fonksiyonlar
│       │   └── app.js       # Ana uygulama
│       └── index.html       # Ana HTML
└── README.md
```

## 🔐 Güvenlik

- JWT token tabanlı authentication
- Bcrypt ile şifre hashleme
- SQL injection koruması
- XSS koruması
- CORS yapılandırması
- Rol tabanlı yetkilendirme

## 🎨 Tasarım

- Modern glassmorphism efektleri
- Gradient renkler ve animasyonlar
- Responsive mobil tasarım
- Dark tema
- Smooth geçişler
- Premium görünüm

## 📱 Mobil Uyumluluk

Web arayüzü responsive tasarıma sahip ve tüm mobil cihazlarda çalışır. PWA desteği için sonraki versiyonlarda eklenecek.

## 🚧 Geliştirme Devam Ediyor

Şu anki sürüm temel özellikleri içeriyor. Geliştirilecek özellikler:
- Motor detay sayfası (tamamlanacak)
- Motor ekleme/düzenleme formları (tamamlanacak)
- Servis geçmişi detaylı görünümü (tamamlanacak)
- Dosya yükleme (servis fotoğrafları)
- Dashboard istatistikler
- Raporlama modülü

## 🤝 Katkıda Bulunma

Bu proje şu anda geliştirme aşamasındadır.

## 📄 Lisans

ISC

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**MotorTrace** - Motor takibini kolaylaştırıyor! 🏍️✨

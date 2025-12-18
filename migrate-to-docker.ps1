# MotorTrace Migration Script - Windows
# Bu script yerel verilerinizi Production Docker ortamına taşır

Write-Host "🚧 MotorTrace Taşıma İşlemi Başlıyor..." -ForegroundColor Cyan

# 1. Klasörleri Kontrol Et
if (-not (Test-Path "backend/uploads")) {
    New-Item -ItemType Directory -Force -Path "backend/uploads" | Out-Null
    Write-Host "✅ Uploads klasörü oluşturuldu." -ForegroundColor Green
}

# 2. Veritabanı Yedeğini Al (Eğer yerel MySQL kullanıyorsanız)
# Not: Eğer yerel Docker kullanıyorsanız aşağıyı değiştirin
Write-Host "📂 Veritabanı yedeği aranıyor..." -ForegroundColor Yellow

$backupFile = "migration_backup.sql"

if (Test-Path $backupFile) {
    Write-Host "✅ Mevcut yedek dosyası bulundu: $backupFile" -ForegroundColor Green
} else {
    Write-Host "⚠️  $backupFile bulunamadı!" -ForegroundColor Yellow
    Write-Host "Lütfen veritabanı yedeğinizi 'migration_backup.sql' adıyla bu klasöre koyun."
    Write-Host "Yedek almak için örnek komut (Yerel MySQL):"
    Write-Host "mysqldump -u root -p motortrace > migration_backup.sql"
    exit
}

# 3. Docker Production Ortamını Başlat
Write-Host "🚀 Docker Production ortamı başlatılıyor..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml up -d

Write-Host "⏳ MySQL'in hazır olması bekleniyor (20 saniye)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 4. Veritabanını İçeri Aktar
Write-Host "📥 Veritabanı Docker içine aktarılıyor..." -ForegroundColor Cyan
# Docker içindeki MySQL'e bağlanıp yedeği yükle
Get-Content $backupFile | docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p"$env:DB_ROOT_PASSWORD" motortrace

if ($?) {
    Write-Host "✅ Veritabanı başarıyla aktarıldı!" -ForegroundColor Green
} else {
    Write-Host "❌ Veritabanı aktarımı başarısız oldu. Lütfen şifreleri kontrol edin." -ForegroundColor Red
}

# 5. Dosyaları Kopyalam
Write-Host "📂 Dosyalar (uploads) kopyalanıyor..." -ForegroundColor Cyan
# Uploads klasörü volume olarak mount edildiği için, yerel backend/uploads klasöründeki her şey
# otomatik olarak container içinde görünür olacaktır (bind mount kullanıyorsak).
# Production config'de volume kullandığımız için manuel kopyalama gerekebilir.

# Container ID'sini bul
$containerId = docker-compose -f docker-compose.prod.yml ps -q backend

if ($containerId) {
    # Yerel uploads klasörünü container içine kopyala
    docker cp ./backend/uploads/. "$($containerId):/app/uploads/"
    Write-Host "✅ Dosyalar başarıyla kopyalandı!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend container bulunamadı." -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Taşıma İşlemi Tamamlandı!" -ForegroundColor Green
Write-Host "Uygulamanız şu adreste çalışıyor: https://localhost"

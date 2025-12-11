#!/bin/bash

# MotorTrace Setup Script

echo "🚀 MotorTrace Kurulum Başlatılıyor..."
echo ""

# Check Node.js
echo "📦 Node.js versiyonu kontrol ediliyor..."
node --version
npm --version
echo ""

# Check MySQL
echo "🗄️  MySQL kontrolü..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL kurulu"
else
    echo "⚠️  MySQL bulunamadı. XAMPP'de MySQL'in çalıştığından emin olun."
fi
echo ""

# Backend setup
echo "🔧 Backend bağımlılıkları kuruluyor..."
cd backend
npm install
echo ""

echo "📝 Veritabanı kurulum talimatları:"
echo "1. XAMPP Control Panel'i açın"
echo "2. MySQL'i başlatın"
echo "3. phpMyAdmin'i açın (http://localhost/phpmyadmin)"
echo "4. 'SQL' sekmesine gidin"
echo "5. backend/database/schema.sql dosyasını içe aktarın"
echo ""

echo "✅ Kurulum tamamlandı!"
echo ""
echo "Backend başlatmak için:"
echo "  cd backend && npm run dev"
echo ""
echo "Frontend başlatmak için:"
echo "  cd frontend && http-server public -p 3000 -c-1"
echo ""
echo "📖 Daha fazla bilgi için README.md dosyasını inceleyin"

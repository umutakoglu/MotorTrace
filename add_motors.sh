#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImFkbWluQG1vdG9ydHJhY2UuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY1NzM1ODY5LCJleHAiOjE3NjYzNDA2Njl9.WoiYuCXKXWexOFnDfnm4G8cT1wZC496wqRdLPe63YuU"

# Motor 1: Honda CBR500R
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"HC5001TR2024001","engine_number":"ENG500RCBR001","color":"Kırmızı","model":"CBR500R","year":2024,"manufacturer":"Honda","status":"in_stock","notes":"Yeni model sportif motor"}'

# Motor 2: Yamaha MT-07
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"YMT071TR2023045","engine_number":"ENG700MT07045","color":"Mavi","model":"MT-07","year":2023,"manufacturer":"Yamaha","status":"sold","notes":"2024 başında satıldı"}'

# Motor 3: Kawasaki Ninja 650
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"KN6501TR2024012","engine_number":"ENG650N6012","color":"Yeşil","model":"Ninja 650","year":2024,"manufacturer":"Kawasaki","status":"in_stock","notes":"Performans odaklı"}'

# Motor 4: Suzuki GSX-R750
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"SG7501TR2022089","engine_number":"ENG750GSX089","color":"Beyaz","model":"GSX-R750","year":2022,"manufacturer":"Suzuki","status":"in_service","notes":"Bakımda"}'

# Motor 5: BMW S1000RR
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"BS1001TR2024003","engine_number":"ENG1000BMW003","color":"Siyah","model":"S1000RR","year":2024,"manufacturer":"BMW","status":"in_stock","notes":"Premium model"}'

# Motor 6: Ducati Panigale V2
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"DP9561TR2023027","engine_number":"ENG956DUC027","color":"Kırmızı","model":"Panigale V2","year":2023,"manufacturer":"Ducati","status":"sold","notes":"Koleksiyoncu müşteriye satıldı"}'

# Motor 7: KTM Duke 390
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"KD3901TR2024056","engine_number":"ENG390KTM056","color":"Turuncu","model":"Duke 390","year":2024,"manufacturer":"KTM","status":"in_stock","notes":"Giriş seviyesi"}'

# Motor 8: Triumph Street Triple
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"TS7651TR2023033","engine_number":"ENG765TRI033","color":"Gri","model":"Street Triple","year":2023,"manufacturer":"Triumph","status":"in_stock","notes":"Naked bike"}'

# Motor 9: Aprilia RS 660
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"AR6601TR2024019","engine_number":"ENG660APR019","color":"Gümüş","model":"RS 660","year":2024,"manufacturer":"Aprilia","status":"in_service","notes":"İlk servis"}'

# Motor 10: Harley-Davidson Sportster S
curl -X POST http://localhost:5001/api/motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chassis_number":"HS1201TR2021078","engine_number":"ENG1200HD078","color":"Kahverengi","model":"Sportster S","year":2021,"manufacturer":"Harley-Davidson","status":"scrapped","notes":"Kaza sonrası hurda"}'

echo "✅ 10 motor eklendi ve QR kodları oluşturuldu!"

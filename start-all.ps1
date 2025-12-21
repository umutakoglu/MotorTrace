#!/usr/bin/env pwsh
# Start Both Backend and Frontend Servers

Write-Host "Starting MotorTrace Application..." -ForegroundColor Green

# Set environment variables for backend
$env:JWT_SECRET = "super-secret-key-for-dev"
$env:DB_HOST = "127.0.0.1"
$env:DB_USER = "root"
$env:DB_PASSWORD = ""
$env:DB_NAME = "motortrace"
$env:PORT = "5000"
$env:JWT_EXPIRES_IN = "7d"

# Start backend in background
Write-Host "Starting Backend on port 5000..." -ForegroundColor Cyan
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "backend/server.js" -WorkingDirectory $PSScriptRoot -WindowStyle Minimized

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend in background
Write-Host "Starting Frontend on port 3000..." -ForegroundColor Cyan
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "frontend/server.js" -WorkingDirectory $PSScriptRoot -WindowStyle Minimized

Write-Host ""
Write-Host "✅ Application started successfully!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login with: admin@motortrace.com / admin123" -ForegroundColor Cyan

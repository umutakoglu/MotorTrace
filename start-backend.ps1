#!/usr/bin/env pwsh
# Backend Startup Script with Environment Variables

Write-Host "Starting MotorTrace Backend Server..." -ForegroundColor Cyan

# Set environment variables
$env:JWT_SECRET = "super-secret-key-for-dev"
$env:DB_HOST = "127.0.0.1"
$env:DB_USER = "root"
$env:DB_PASSWORD = ""
$env:DB_NAME = "motortrace"
$env:PORT = "5000"
$env:JWT_EXPIRES_IN = "7d"

# Change to backend directory
Set-Location backend

# Start the server
& "C:\Program Files\nodejs\node.exe" server.js

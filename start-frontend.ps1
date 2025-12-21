#!/usr/bin/env pwsh
# Frontend Startup Script

Write-Host "Starting MotorTrace Frontend Server..." -ForegroundColor Cyan

# Start the frontend server
& "C:\Program Files\nodejs\node.exe" frontend/server.js

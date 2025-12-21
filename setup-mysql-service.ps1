$ErrorActionPreference = "Stop"

Write-Host "Setting up MySQL Service..." -ForegroundColor Cyan

# Check for Admin privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "This script requires Administrator privileges to register the MySQL service."
    Write-Warning "Please right-click and 'Run as Administrator'."
    exit
}

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
if (!(Test-Path $mysqlPath)) {
    Write-Error "MySQL Binaries not found at $mysqlPath. Please verify installation."
    exit 1
}

Set-Location $mysqlPath

# Check if service exists
$service = Get-Service MySQL -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "MySQL Service already exists."
    if ($service.Status -ne 'Running') {
        Write-Host "Starting MySQL Service..."
        Start-Service MySQL
    }
} else {
    Write-Host "Initializing Data Directory..."
    .\mysqld.exe --initialize-insecure
    
    Write-Host "Installing MySQL Service..."
    .\mysqld.exe --install MySQL
    
    Write-Host "Starting MySQL Service..."
    Start-Service MySQL
}

Write-Host "MySQL Setup Complete!" -ForegroundColor Green
Write-Host "You can now proceed with the project setup."

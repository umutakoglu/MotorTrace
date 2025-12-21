#!/bin/bash

# MotorTrace Production Deployment Script
# This script handles the deployment of MotorTrace to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  MotorTrace Production Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "${YELLOW}Creating .env from .env.production.example...${NC}"
    cp .env.production.example .env
    echo -e "${RED}Please edit .env file with your production values before continuing!${NC}"
    exit 1
fi

# Check if SSL certificates exist
if [ ! -f ./ssl/cert.pem ] || [ ! -f ./ssl/key.pem ]; then
    echo -e "${YELLOW}Warning: SSL certificates not found!${NC}"
    echo -e "${YELLOW}Creating self-signed certificates for testing...${NC}"
    mkdir -p ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=TR/ST=State/L=City/O=Organization/CN=localhost"
    echo -e "${GREEN}Self-signed certificates created.${NC}"
    echo -e "${YELLOW}⚠️  For production, replace with valid SSL certificates!${NC}"
    echo ""
fi

# Create necessary directories
echo -e "${GREEN}Creating necessary directories...${NC}"
mkdir -p backups logs backend/uploads/qr-codes backend/uploads/services
chmod -R 755 backups logs backend/uploads

# Pull latest code (if using git)
if [ -d .git ]; then
    echo -e "${GREEN}Pulling latest code from git...${NC}"
    git pull origin main || echo -e "${YELLOW}Warning: Could not pull from git${NC}"
fi

# Stop existing containers
echo -e "${GREEN}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Build and start containers
echo -e "${GREEN}Building and starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo -e "${GREEN}Waiting for services to be healthy...${NC}"
MAX_TRIES=30
COUNT=0

while [ $COUNT -lt $MAX_TRIES ]; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
        echo -e "${YELLOW}Waiting for services... ($((COUNT+1))/$MAX_TRIES)${NC}"
        sleep 5
        COUNT=$((COUNT+1))
    else
        break
    fi
done

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    echo -e "${RED}Error: Some services are unhealthy!${NC}"
    docker-compose -f docker-compose.prod.yml ps
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Show running containers
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}Application URLs:${NC}"
echo -e "  Frontend: ${GREEN}https://localhost${NC}"
echo -e "  API: ${GREEN}https://localhost/api${NC}"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo -e "  1. Update .env with production credentials"
echo -e "  2. Replace SSL certificates with valid ones"
echo -e "  3. Set up domain DNS records"
echo -e "  4. Configure firewall rules"
echo -e "  5. Set up automated backups"
echo ""
echo -e "${GREEN}To view logs: ${NC}docker-compose -f docker-compose.prod.yml logs -f"
echo -e "${GREEN}To stop: ${NC}docker-compose -f docker-compose.prod.yml down"
echo ""

#!/bin/bash

# MotorTrace Production Deployment Script
# For app.umutakoglu.com

set -e  # Exit on error

echo "🚀 MotorTrace Production Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}Please create .env.production from .env.production.template${NC}"
    exit 1
fi

# Load environment variables
source .env.production

echo -e "${GREEN}✓${NC} Environment file loaded"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Pull latest images
echo ""
echo "📥 Pulling latest MySQL image..."
docker-compose -f docker-compose.prod.yml pull mysql

# Build application images
echo ""
echo "🔨 Building application images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo ""
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Check if this is first deployment (empty database)
TABLES_COUNT=$(docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "USE ${DB_NAME}; SHOW TABLES;" 2>/dev/null | wc -l)

if [ "$TABLES_COUNT" -le 1 ]; then
    echo ""
    echo "📊 First deployment detected - initializing database..."
    
    # Database will auto-initialize from /docker-entrypoint-initdb.d
    echo "   Database schema will be created automatically"
    sleep 5
    
    # Run additional migration scripts
    echo "   Running migration scripts..."
    docker-compose -f docker-compose.prod.yml exec -T motortrace_backend node database/create-advanced-tables.js || true
    docker-compose -f docker-compose.prod.yml exec -T motortrace_backend node database/add-technician-role.js || true
    docker-compose -f docker-compose.prod.yml exec -T motortrace_backend node database/create-activity-logs-table.js || true
    docker-compose -f docker-compose.prod.yml exec -T motortrace_backend node database/update-roles-and-users.js || true
    
    echo -e "${GREEN}✓${NC} Database initialized"
fi

# Show running containers
echo ""
echo "📋 Running containers:"
docker-compose -f docker-compose.prod.yml ps

# Health check
echo ""
echo "🏥 Running health checks..."
sleep 5

# Check backend health
if curl -sf http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is healthy"
else
    echo -e "${YELLOW}⚠${NC}  Backend health check failed (might take a moment to start)"
fi

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: https://app.umutakoglu.com"
echo "   API:      https://app.umutakoglu.com/api"
echo "   Health:   https://app.umutakoglu.com/health"
echo ""
echo "🔑 Default Admin Credentials:"
echo "   Email:    admin@motortrace.com"
echo "   Password: admin123"
echo "   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!"
echo ""
echo "📊 Useful commands:"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop:         docker-compose -f docker-compose.prod.yml down"
echo "   Restart:      docker-compose -f docker-compose.prod.yml restart"
echo ""

#!/bin/bash

# MotorTrace Restore Script
# Restores MySQL database and uploads from backup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}Usage: $0 <backup_date>${NC}"
    echo -e "${YELLOW}Example: $0 20241218_140530${NC}"
    echo ""
    echo -e "${GREEN}Available backups:${NC}"
    ls -lh backups/ | grep -E "\.sql\.gz|\.tar\.gz"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="./backups"
DB_BACKUP="$BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  MotorTrace Restore Process${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if backups exist
if [ ! -f "$DB_BACKUP" ]; then
    echo -e "${RED}Error: Database backup not found: $DB_BACKUP${NC}"
    exit 1
fi

if [ ! -f "$UPLOADS_BACKUP" ]; then
    echo -e "${YELLOW}Warning: Uploads backup not found: $UPLOADS_BACKUP${NC}"
fi

# Confirm restoration
echo -e "${YELLOW}⚠️  WARNING: This will overwrite current data!${NC}"
echo -e "Database backup: $DB_BACKUP"
echo -e "Uploads backup: $UPLOADS_BACKUP"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Restore cancelled.${NC}"
    exit 0
fi

# Stop application
echo -e "${GREEN}Stopping application...${NC}"
docker-compose -f docker-compose.prod.yml down

# Restore database
echo -e "${GREEN}Restoring database...${NC}"
docker-compose -f docker-compose.prod.yml up -d mysql

# Wait for MySQL to be ready
echo -e "${GREEN}Waiting for MySQL to start...${NC}"
sleep 10

# Import database
gunzip < "$DB_BACKUP" | docker-compose -f docker-compose.prod.yml exec -T mysql \
    mysql -u root -p${DB_ROOT_PASSWORD}

echo -e "${GREEN}Database restored successfully!${NC}"

# Restore uploads
if [ -f "$UPLOADS_BACKUP" ]; then
    echo -e "${GREEN}Restoring uploads directory...${NC}"
    rm -rf backend/uploads
    tar -xzf "$UPLOADS_BACKUP"
    echo -e "${GREEN}Uploads restored successfully!${NC}"
fi

# Restart application
echo -e "${GREEN}Starting application...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Restore completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

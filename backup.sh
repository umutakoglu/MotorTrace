#!/bin/bash

# MotorTrace Backup Script
# Automatically backs up MySQL database and uploads directory

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting backup process...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup MySQL database
echo -e "${GREEN}Backing up MySQL database...${NC}"
docker-compose -f docker-compose.prod.yml exec -T mysql \
    mysqldump -u root -p${DB_ROOT_PASSWORD} --all-databases \
    > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compress database backup
gzip "$BACKUP_DIR/db_backup_$DATE.sql"
echo -e "${GREEN}Database backup created: db_backup_$DATE.sql.gz${NC}"

# Backup uploads directory
echo -e "${GREEN}Backing up uploads directory...${NC}"
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" backend/uploads
echo -e "${GREEN}Uploads backup created: uploads_backup_$DATE.tar.gz${NC}"

# Remove old backups
echo -e "${GREEN}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Show backup summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Backup location: $BACKUP_DIR"
echo -e "Database: db_backup_$DATE.sql.gz"
echo -e "Uploads: uploads_backup_$DATE.tar.gz"
echo ""
ls -lh "$BACKUP_DIR" | grep "$DATE"
echo ""
echo -e "${GREEN}Backup completed successfully!${NC}"

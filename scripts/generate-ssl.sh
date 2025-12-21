#!/bin/bash

# Generate Self-Signed SSL Certificate
# For testing purposes only - NOT for production!

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Generating Self-Signed SSL Certificate...${NC}"
echo -e "${YELLOW}⚠️  This is for TESTING ONLY!${NC}"
echo -e "${YELLOW}⚠️  For production, use Let's Encrypt or commercial certificate${NC}"
echo ""

# Create ssl directory
mkdir -p ssl

# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=TR/ST=Istanbul/L=Istanbul/O=MotorTrace/OU=IT/CN=localhost"

# Set permissions
chmod 600 ssl/*.pem

echo ""
echo -e "${GREEN}Certificate generated successfully!${NC}"
echo -e "Location: ./ssl/"
echo -e "  - ssl/cert.pem"
echo -e "  - ssl/key.pem"
echo ""
echo -e "${YELLOW}Remember to replace with valid SSL certificates for production!${NC}"

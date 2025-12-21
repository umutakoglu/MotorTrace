# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/qr-codes uploads/services

# Expose backend port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]

# 🐳 Docker Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (comes with Docker Desktop)

### One-Command Deployment

```bash
# Clone and start
git clone https://github.com/umutakoglu/MotorTrace.git
cd MotorTrace
docker-compose up -d
```

That's it! The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **MySQL:** localhost:3306

### Configuration

1. **Create environment file:**
```bash
cp .env.docker .env
```

2. **Edit `.env` file with your settings:**
```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your-random-secret-key
```

3. **Start the containers:**
```bash
docker-compose up -d
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

### Database Initialization

The database will be automatically initialized on first run with the schema files in `backend/database/`.

To manually run migrations:
```bash
docker-compose exec backend node database/create-advanced-tables.js
docker-compose exec backend node database/add-technician-role.js
```

### Accessing Services

**MySQL Database:**
```bash
docker-compose exec mysql mysql -u motortrace_user -p motortrace
```

**Backend Shell:**
```bash
docker-compose exec backend sh
```

### Port Configuration

Default ports (can be changed in docker-compose.yml):
- Frontend: `3000:80`
- Backend: `5001:5001`
- MySQL: `3306:3306`

### Volumes

- `mysql_data` - Persistent database storage
- `./backend/uploads` - QR codes and service attachments

### Troubleshooting

**Database connection errors:**
```bash
# Wait for MySQL to be ready
docker-compose logs mysql

# Check backend health
docker-compose ps
```

**Reset everything:**
```bash
docker-compose down -v
docker-compose up -d --build
```

**View container status:**
```bash
docker-compose ps
```

## Production Deployment

### Security Recommendations

1. **Change default passwords**
2. **Use strong JWT secret**
3. **Enable HTTPS with reverse proxy (nginx/traefik)**
4. **Set up firewall rules**
5. **Regular backups of mysql_data volume**

### Environment Variables for Production

```env
NODE_ENV=production
DB_PASSWORD=<very-strong-password>
JWT_SECRET=<random-256-bit-key>
FRONTEND_URL=https://yourdomain.com
```

### Backup Database

```bash
# Backup
docker-compose exec mysql mysqldump -u motortrace_user -p motortrace > backup.sql

# Restore
docker-compose exec -T mysql mysql -u motortrace_user -p motortrace < backup.sql
```

### Using with Portainer

1. Add this repository as a Git repository in Portainer
2. Use docker-compose.yml as the compose file
3. Set environment variables in Portainer UI
4. Deploy the stack

---

For more information, see the main [README.md](README.md)

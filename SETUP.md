# 🚀 Marketing CRM - Setup Guide

Complete installation guide for deploying Marketing CRM to any environment.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start (Development)](#-quick-start-development)
- [Manual Setup](#-manual-setup)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)

---

## 🔧 Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Download |
|----------|----------------|-------------|----------|
| **Node.js** | 20.x | 20.11+ (LTS) | [nodejs.org](https://nodejs.org) |
| **npm** | 10.x | Latest | Included with Node.js |
| **Docker** | 20.x | Latest | [docker.com](https://docker.com) |
| **Docker Compose** | 2.x | Latest | Included with Docker Desktop |
| **Git** | 2.x | Latest | [git-scm.com](https://git-scm.com) |

### System Requirements

- **OS:** Linux, macOS, or Windows 10/11
- **RAM:** Minimum 4GB (8GB+ recommended)
- **Disk:** 2GB free space
- **Internet:** Required for initial setup

### Verify Installation

```bash
node --version    # Should be v20.x or higher
npm --version     # Should be 10.x or higher
docker --version  # Should be 20.x or higher
docker compose version  # Should be v2.x or higher
git --version     # Should be 2.x or higher
```

---

## ⚡ Quick Start (Development)

### Automated Setup (Recommended)

**Linux / macOS:**
```bash
# 1. Clone repository
git clone <repository-url>
cd marketingcrm

# 2. Run automated setup script
chmod +x setup.sh
./setup.sh
```

**Windows (PowerShell):**
```powershell
# 1. Clone repository
git clone <repository-url>
cd marketingcrm

# 2. Run automated setup script
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

The automated script will:
- ✅ Check prerequisites
- ✅ Install npm dependencies
- ✅ Configure environment variables
- ✅ Start Docker MySQL container
- ✅ Run database migrations
- ✅ Seed initial data
- ✅ Validate setup
- ✅ Start development server

**Default Credentials:**
- URL: http://localhost:3000
- Email: admin@example.com
- Password: password

---

## 📖 Manual Setup

If you prefer manual setup or the automated script fails:

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd marketingcrm
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

**Minimal .env configuration:**
```env
DATABASE_URL="mysql://crm_user:secret@localhost:3308/crm_single"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

### Step 4: Start MySQL Database

**Using Docker (Recommended):**
```bash
docker compose up -d
```

**Verify MySQL is running:**
```bash
docker ps | grep crm_mysql
```

**Check MySQL logs (if issues):**
```bash
docker logs crm_mysql
```

### Step 5: Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

### Step 6: Seed Initial Data

```bash
npm run seed:all
```

This creates:
- ✅ Admin user (admin@example.com / password)
- ✅ Lead form sections (4 sections)
- ✅ Lead system fields (source, status, priority)
- ✅ Investor form sections (2 sections)
- ✅ Investor system fields (source, status, priority)

### Step 7: Validate Setup

```bash
npm run setup:validate
```

This checks:
- Environment variables
- Database connection
- Required tables
- Seed data integrity

### Step 8: Start Development Server

```bash
npm run dev
```

**Access application:**
- URL: http://localhost:3000
- Login: admin@example.com / password

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] Review and update `.env.production.example`
- [ ] Generate secure `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Set up production MySQL database
- [ ] Configure SSL/HTTPS
- [ ] Set up error tracking (Sentry)
- [ ] Configure email SMTP
- [ ] Set up file storage (AWS S3, etc.)
- [ ] Configure monitoring and alerts
- [ ] Set up automated backups
- [ ] Test disaster recovery

### Environment Configuration

```bash
# Copy production template
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

**Critical production settings:**
```env
# HTTPS URL (required)
NEXTAUTH_URL="https://crm.yourcompany.com"

# Strong secret (NEVER use default!)
NEXTAUTH_SECRET="<generated-with-openssl-rand-base64-32>"

# Production database
DATABASE_URL="mysql://prod_user:STRONG_PASSWORD@prod-host:3306/crm_prod"

# Production environment
NODE_ENV="production"
```

### Deployment Options

#### Option 1: Traditional VPS/Server

```bash
# 1. Install Node.js, Docker on server
# 2. Clone repository
git clone <repository-url>
cd marketingcrm

# 3. Install dependencies
npm install --production

# 4. Setup environment
cp .env.production.example .env
nano .env

# 5. Start database
docker compose up -d

# 6. Database migration
npx prisma generate
npx prisma db push

# 7. Seed data
npm run seed:all

# 8. Build application
npm run build

# 9. Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "crm" -- start
pm2 save
pm2 startup
```

#### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t marketing-crm .

# Run container
docker run -d \
  --name marketing-crm \
  -p 3000:3000 \
  --env-file .env.production \
  marketing-crm
```

#### Option 3: Cloud Platforms

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Heroku:**
```bash
heroku create your-crm-app
git push heroku main
```

**AWS/GCP/Azure:**
- Use platform-specific deployment guides
- Configure environment variables in platform settings
- Set up managed MySQL database

### Post-Deployment

1. **Test application:**
   ```bash
   curl https://crm.yourcompany.com/api/health
   ```

2. **Validate setup:**
   ```bash
   npm run setup:validate
   ```

3. **Monitor logs:**
   ```bash
   pm2 logs crm        # If using PM2
   docker logs crm     # If using Docker
   ```

4. **Set up monitoring:**
   - Configure Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot, etc.)
   - Configure log aggregation (Datadog, CloudWatch)

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: Docker MySQL Port Already in Use

**Error:** `Bind for 0.0.0.0:3308 failed: port is already allocated`

**Solution:**
```bash
# Check what's using port 3308
lsof -i :3308  # Linux/Mac
netstat -ano | findstr :3308  # Windows

# Option 1: Stop the conflicting service
# Option 2: Change port in docker-compose.yml
ports:
  - "3309:3306"  # Use different host port

# Don't forget to update DATABASE_URL in .env
DATABASE_URL="mysql://crm_user:secret@localhost:3309/crm_single"
```

#### Issue 2: Database Connection Failed

**Error:** `Can't connect to MySQL server`

**Check:**
1. MySQL container is running:
   ```bash
   docker ps | grep crm_mysql
   ```

2. Start if stopped:
   ```bash
   docker compose up -d
   ```

3. Check MySQL logs:
   ```bash
   docker logs crm_mysql
   ```

4. Test connection:
   ```bash
   docker exec -it crm_mysql mysql -u crm_user -psecret crm_single
   ```

#### Issue 3: Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npx prisma generate
```

#### Issue 4: Migration Fails

**Error:** `Migration failed: Table already exists`

**Solution:**
```bash
# Reset database (CAUTION: Deletes all data!)
npx prisma db push --force-reset

# Then re-seed
npm run seed:all
```

#### Issue 5: Admin User Not Found

**Error:** `Invalid credentials` when logging in

**Check:**
```bash
# Verify admin user exists
npm run setup:validate

# Re-seed if needed
npm run seed:all
```

#### Issue 6: Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Option 1: Find and stop process using port 3000
lsof -ti :3000 | xargs kill  # Linux/Mac
netstat -ano | findstr :3000  # Windows (note PID, then taskkill /PID <pid> /F)

# Option 2: Use different port
PORT=3001 npm run dev
```

#### Issue 7: Permission Denied on setup.sh

**Error:** `Permission denied: ./setup.sh`

**Solution:**
```bash
chmod +x setup.sh
./setup.sh
```

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment variable
DEBUG=* npm run dev

# Or for Prisma only
DEBUG=prisma:* npm run dev
```

### Getting Help

1. **Check logs:**
   - Application: `npm run dev` output
   - Database: `docker logs crm_mysql`
   - System: Check console for errors

2. **Validation:**
   ```bash
   npm run setup:validate
   ```

3. **Database inspection:**
   ```bash
   npx prisma studio  # Opens GUI at http://localhost:5555
   ```

4. **Reset everything:**
   ```bash
   # Stop everything
   docker compose down -v

   # Clean install
   rm -rf node_modules package-lock.json
   npm install

   # Re-run setup
   ./setup.sh
   ```

---

## ❓ FAQ

### General

**Q: Can I use PostgreSQL instead of MySQL?**
A: Yes, but you'll need to update `schema.prisma` and `DATABASE_URL`. See Prisma docs for PostgreSQL connection strings.

**Q: What Node.js version should I use?**
A: Use Node.js 20.x (LTS). Version 18.x may work but is not tested.

**Q: Can I deploy without Docker?**
A: Yes, install MySQL directly on your system and update `DATABASE_URL` to point to it.

### Database

**Q: How do I backup the database?**
```bash
# Create backup
docker exec crm_mysql mysqldump -u crm_user -psecret crm_single > backup.sql

# Restore backup
docker exec -i crm_mysql mysql -u crm_user -psecret crm_single < backup.sql
```

**Q: How do I reset the database?**
```bash
npx prisma db push --force-reset
npm run seed:all
```

**Q: Can I use an external MySQL server?**
A: Yes, update `DATABASE_URL` in `.env` to point to your MySQL server:
```env
DATABASE_URL="mysql://user:password@external-host:3306/database"
```

### Authentication

**Q: How do I change the admin password?**
```bash
# Option 1: Use Prisma Studio
npx prisma studio
# Navigate to users table, edit admin user

# Option 2: Reset via script (create custom script to hash new password)
```

**Q: How do I add more users?**
A: Currently, users must be added via database or Prisma Studio. User registration UI is planned for future releases.

### Development

**Q: Hot reload not working?**
A: Restart dev server:
```bash
npm run dev
```

**Q: How do I add new environment variables?**
1. Add to `.env`
2. Add to `.env.example` with documentation
3. Update `SETUP.md` and `CLAUDE.md`

**Q: How do I update dependencies?**
```bash
npm update
npm audit fix
```

### Production

**Q: What's the recommended production setup?**
- Use managed MySQL (AWS RDS, Google Cloud SQL)
- Deploy to Vercel/Netlify/AWS/GCP
- Use Redis for session storage (optional)
- Configure CDN for static assets
- Set up monitoring (Sentry, Datadog)

**Q: How do I enable HTTPS?**
A: Use a reverse proxy (nginx, Apache) with SSL certificates, or deploy to a platform that provides SSL (Vercel, Netlify).

**Q: How do I scale the application?**
- Use load balancer (nginx, AWS ELB)
- Scale database (read replicas, connection pooling)
- Enable caching (Redis)
- Use CDN for static files

---

## 📚 Additional Resources

### Documentation

- [CLAUDE.md](./CLAUDE.md) - Project overview and architecture
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

### Scripts Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open Prisma Studio GUI
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma db pull       # Pull schema from database

# Setup & Seeding
npm run seed:all         # Seed all data
npm run setup:validate   # Validate setup
npm run db:reset         # Reset database + re-seed

# Docker
docker compose up -d     # Start MySQL
docker compose down      # Stop MySQL
docker compose down -v   # Stop + remove volumes
```

### File Structure

```
marketingcrm/
├── .env                 # Environment variables (DO NOT commit)
├── .env.example         # Environment template
├── .env.production.example  # Production template
├── SETUP.md             # This file
├── CLAUDE.md            # Project documentation
├── docker-compose.yml   # Docker configuration
├── package.json         # Node.js dependencies
├── prisma/
│   └── schema.prisma    # Database schema
├── scripts/
│   ├── seed-all.ts      # Master seed script
│   └── validate-setup.ts  # Setup validation
├── setup.sh             # Linux/Mac setup script
└── setup.ps1            # Windows setup script
```

---

## 🆘 Support

If you encounter issues not covered in this guide:

1. **Check validation:** `npm run setup:validate`
2. **Review logs:** Check console output for errors
3. **Search issues:** Check project issue tracker
4. **Create issue:** Provide error logs and system info

---

**Last Updated:** 2025-01-05
**Version:** 1.0.0

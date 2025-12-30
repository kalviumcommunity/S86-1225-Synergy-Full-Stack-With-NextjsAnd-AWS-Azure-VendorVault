# VendorVault

Railway Vendor License Management System - A comprehensive, production-ready platform for managing vendor licenses and applications with optimized database transactions, query performance, and data integrity.

**Status:** ✅ Ready for Production
- **Transaction Safety:** ACID-compliant transactions with automatic rollback
- **Query Performance:** 150x faster with optimized indexes
- **Data Integrity:** Automatic validation and constraint enforcement
- **Secure File Upload:** AWS S3 pre-signed URLs for direct, scalable uploads
- **Responsive Design:** Mobile-first design with adaptive breakpoints
- **Theme Support:** Complete light/dark mode with accessibility compliance
- **Cloud Database:** Fully configured for AWS RDS and Azure PostgreSQL

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Cloud Infrastructure](#-cloud-infrastructure)
- [Getting Started](#-getting-started)
- [Database Configuration](#-database-configuration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- 🔐 **Multi-role Authentication**: Vendor, Admin, Inspector roles with JWT-based auth
- 📝 **Vendor Application Management**: Complete license application workflow
- ✅ **Inspector Dashboard**: Application review and approval system
- 👨‍💼 **Admin Panel**: User management, analytics, and system configuration
- 📊 **Analytics Dashboard**: Real-time insights and reporting
- 🔍 **License Verification**: QR code-based public license verification

### Technical Features
- ⚡ **Optimized Database Queries**: 150x performance improvement with strategic indexing
- 🔄 **Transaction Safety**: ACID-compliant operations with automatic rollback
- 🌐 **RESTful API**: Well-documented endpoints with Postman collections
- 🎨 **Modern UI/UX**: Responsive design with Tailwind CSS
- 🌙 **Dark Mode**: Complete theme support with system preference detection
- 📧 **Email Integration**: AWS SES for transactional emails
- 🗄️ **Cloud Storage**: S3/Azure Blob for secure file storage
- 🔒 **Security**: Input sanitization, SQL injection prevention, XSS protection
- 📦 **Redis Caching**: High-performance session and data caching
- 🔐 **RBAC**: Role-based access control with granular permissions

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + SWR
- **UI Components**: Custom component library

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL (AWS RDS / Azure Database)
- **Cache**: Redis Cloud
- **Authentication**: NextAuth.js + JWT

### Infrastructure
- **Cloud Providers**: AWS / Azure
- **Database**: AWS RDS PostgreSQL / Azure Database for PostgreSQL
- **Storage**: AWS S3 / Azure Blob Storage
- **Email**: AWS SES / SendGrid
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (planned)

---

## ☁️ Cloud Infrastructure

### Database Configuration (AWS RDS / Azure PostgreSQL)

VendorVault is configured to work with managed PostgreSQL databases in the cloud:

#### AWS RDS PostgreSQL
- **Instance Type**: db.t3.micro (Free tier eligible)
- **Storage**: 20 GB GP3 with autoscaling
- **Backup**: 7-day automated backups
- **Multi-AZ**: Optional for high availability
- **Monitoring**: CloudWatch integration

#### Azure Database for PostgreSQL
- **Tier**: Burstable B1ms (1 vCore, 2 GB RAM)
- **Storage**: 32 GB with auto-grow
- **Backup**: 7-day point-in-time recovery
- **Replication**: Read replicas available
- **Monitoring**: Azure Monitor integration

#### Key Features
✅ **Automated Backups**: Daily snapshots with point-in-time recovery  
✅ **High Availability**: Multi-zone deployment options  
✅ **SSL/TLS Encryption**: All connections encrypted in transit  
✅ **Network Security**: VPC isolation and IP allowlisting  
✅ **Monitoring**: Real-time performance metrics and alerts  
✅ **Automatic Updates**: Security patches applied automatically  

📖 **[Complete Setup Guide](./docs/CLOUD_DATABASE_SETUP.md)** - Detailed instructions for provisioning and configuring cloud databases

### Network Architecture
```
Internet
    │
    ├─→ Application (Next.js)
    │       │
    │       ├─→ AWS RDS / Azure PostgreSQL (Managed DB)
    │       ├─→ Redis Cloud (Session & Cache)
    │       ├─→ AWS S3 / Azure Blob (File Storage)
    │       └─→ AWS SES (Email Service)
    │
    └─→ Public API (License Verification)
```

### Security Measures
- 🔒 **Database**: Private VPC, encrypted at rest and in transit
- 🛡️ **API**: Rate limiting, CORS, input validation
- 🔐 **Authentication**: JWT with refresh tokens, password hashing (bcrypt)
- 📝 **Audit Logging**: All critical operations logged
- 🚫 **XSS/SQL Injection**: Input sanitization and parameterized queries

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (local) or AWS RDS / Azure Database
- Redis (local or Redis Cloud)
- AWS Account (for S3, SES) or Azure Account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vendorvault
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database (Local PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/vendorvault"

# For AWS RDS:
# DATABASE_URL="postgresql://vaultadmin:password@your-rds-endpoint:5432/vendorvault?sslmode=require"

# For Azure:
# DATABASE_URL="postgresql://vaultadmin%40server:password@server.postgres.database.azure.com:5432/vendorvault?sslmode=require"

# Redis
REDIS_URL="your-redis-url"
REDIS_PASSWORD="your-redis-password"

# Authentication
NEXTAUTH_SECRET="generate-random-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="generate-random-secret"

# AWS S3 (or Azure Blob)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET_NAME="vendorvault-documents"

# Email
EMAIL_FROM="noreply@vendorvault.com"
AWS_SES_REGION="us-east-1"
```

4. **Run database migrations**
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed  # Optional: seed with sample data
```

5. **Start the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Using Docker Compose

```bash
# Start all services (app + PostgreSQL + Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 💾 Database Configuration

### Local Development (Docker)
The project includes a `docker-compose.yml` with PostgreSQL and Redis:
```bash
docker-compose up -d postgres redis
```

### Cloud Database Setup

#### Option 1: AWS RDS
Follow the [Cloud Database Setup Guide](./docs/CLOUD_DATABASE_SETUP.md#aws-rds-setup) for:
- RDS instance provisioning
- Security group configuration
- Connection string setup
- SSL/TLS configuration

#### Option 2: Azure Database for PostgreSQL
Follow the [Cloud Database Setup Guide](./docs/CLOUD_DATABASE_SETUP.md#azure-database-for-postgresql-setup) for:
- Azure PostgreSQL provisioning
- Firewall rule configuration
- Connection string format
- Private endpoint setup

### Database Schema
The application uses Prisma ORM with the following key models:
- **User**: Authentication and role management
- **Vendor**: Vendor profile and business information
- **License**: Approved vendor licenses
- **Application**: License applications and workflow
- **Inspection**: Inspector reviews and approvals
- **AuditLog**: System activity tracking

View the complete schema: [prisma/schema.prisma](./prisma/schema.prisma)

### Migrations
```bash
# Create a new migration
npx prisma migrate dev --name description

# Apply migrations to production
npx prisma migrate deploy

# Reset database (DEV ONLY)
npx prisma migrate reset
```

### Backup Strategy

#### AWS RDS
- **Automated Backups**: 7-day retention (configurable to 35 days)
- **Manual Snapshots**: Create before major changes
- **Point-in-Time Recovery**: Restore to any point within retention period
- **Export to S3**: Long-term archival storage

#### Azure PostgreSQL
- **Automated Backups**: 7-day retention
- **Geo-Redundant Backup**: Optional for disaster recovery
- **On-Demand Backup**: Create backups manually
- **Export via pg_dump**: Standard PostgreSQL backups

#### Manual Backup
```bash
# Local backup
pg_dump -h localhost -U postgres vendorvault > backup.sql

# Cloud backup
pg_dump -h your-cloud-endpoint -U admin vendorvault > backup_$(date +%Y%m%d).sql

# Restore
psql -h your-endpoint -U admin vendorvault < backup.sql
```

---

## 🧪 Testing

### Database Connection Test
Test your cloud database connection:
```bash
npm run test:db
```

This will:
- ✅ Verify Prisma connection
- ✅ Test raw PostgreSQL connection
- ✅ Check database health metrics
- ✅ Display connection pool status

### API Testing
Use the included Postman collections:
- `postman-collection.json` - All API endpoints
- `postman-jwt-auth-collection.json` - Authentication flows

### Unit Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## 🌐 Deployment

### Vercel (Recommended for Next.js)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Important**: Ensure your cloud database allows Vercel's IP ranges

### AWS (EC2 + RDS)
1. Provision EC2 instance
2. Deploy application with PM2 or Docker
3. Connect to RDS instance in same VPC
4. Use Application Load Balancer for HTTPS

### Azure (App Service + Azure Database)
1. Create App Service (Node.js)
2. Deploy via GitHub Actions or Azure DevOps
3. Connect to Azure Database for PostgreSQL
4. Enable Application Insights for monitoring

### Environment Variables in Production
Ensure all production environment variables are set:
- `DATABASE_URL` with cloud database endpoint
- `NEXTAUTH_URL` with production domain
- SSL certificates configured
- S3/Blob storage credentials
- Email service credentials

---

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login and get JWT
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/logout            - Logout and invalidate token
```

### Vendor Endpoints
```
GET    /api/vendors                - List all vendors (Admin)
GET    /api/vendors/[id]           - Get vendor details
POST   /api/vendor/apply           - Submit license application
GET    /api/vendor/dashboard       - Vendor dashboard data
```

### Admin Endpoints
```
GET    /api/admin/dashboard        - Admin analytics
GET    /api/admin/applications     - All applications
PATCH  /api/admin/applications/[id] - Update application status
GET    /api/admin/users            - User management
```

### Public Endpoints
```
GET    /api/verify/[licenseNumber] - Verify license (public)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is part of the Kalvium curriculum. All rights reserved.

---

## 📞 Support

For issues or questions:
- 📧 Email: support@vendorvault.com
- 📖 Documentation: [./docs](./docs)
- 🐛 Issues: [GitHub Issues](./issues)

---

## 🎯 Roadmap

- [x] Multi-role authentication
- [x] License application workflow
- [x] Cloud database integration (AWS RDS / Azure)
- [x] File upload to S3/Blob
- [x] Email notifications
- [x] Redis caching
- [ ] SMS notifications (Twilio)
- [ ] Payment integration (Stripe)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

**Built with ❤️ by the VendorVault Team**

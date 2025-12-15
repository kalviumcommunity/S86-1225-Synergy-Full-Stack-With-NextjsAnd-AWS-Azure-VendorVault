# 🚀 VendorVault - Quick Start Guide

## One-Command Setup

```bash
# 1. Navigate to project
cd vendorvault

# 2. Install dependencies
npm install

# 3. Start PostgreSQL (in new terminal from project root)
cd .. && docker-compose up -d db && cd vendorvault

# 4. Setup environment
cp .env.example .env

# 5. Run migrations
npm run db:migrate
# → Name it: init_schema

# 6. Seed database
npm run db:seed

# 7. Start dev server
npm run dev
```

Visit: http://localhost:3000

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@vendorvault.com | Password123! |
| **Inspector** | inspector1@vendorvault.com | Password123! |
| **Vendor** | vendor1@example.com | Password123! |

---

## Database Schema at a Glance

### 9 Core Tables

```
users ─┬─→ vendors ──→ licenses ──→ inspections
       │              └──→ documents
       ├─→ notifications
       └─→ audit_logs
```

### Key Entities

| Table | Records | Purpose |
|-------|---------|---------|
| `users` | 9 | Authentication (Vendor/Admin/Inspector) |
| `vendors` | 5 | Business info (tea stalls, bookshops, etc.) |
| `licenses` | 5 | PENDING/APPROVED/REJECTED/EXPIRED |
| `documents` | 8 | Aadhaar, PAN, photos |
| `inspections` | 2 | Field compliance checks |
| `notifications` | 3 | Email/SMS alerts |
| `audit_logs` | 2 | Immutable history |

---

## Common Commands

### Database
```bash
npm run db:studio      # Open Prisma Studio GUI
npm run db:generate    # Regenerate Prisma Client
npm run db:push        # Push schema without migration
npm run db:reset       # ⚠️ Reset DB (deletes all data)
```

### Development
```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Run ESLint
```

### Docker
```bash
docker-compose up -d           # Start all services
docker-compose logs -f db      # View database logs
docker-compose down            # Stop services
docker ps                      # Check running containers
```

---

## Project URLs

| Service | URL | Container |
|---------|-----|-----------|
| **App** | http://localhost:3000 | vendorvault_app |
| **PostgreSQL** | localhost:5432 | postgres_db |
| **Redis** | localhost:6379 | redis_cache |
| **Prisma Studio** | http://localhost:5555 | (local) |

---

## File Locations

```
vendorvault/
├── prisma/
│   ├── schema.prisma        ← Database schema
│   ├── seed.ts              ← Sample data
│   └── migrations/          ← Migration history
├── lib/prisma.ts            ← Prisma client singleton
├── .env                     ← Environment variables
└── package.json             ← Scripts & dependencies
```

---

## Troubleshooting

### Port 5432 already in use
```bash
# Stop local PostgreSQL
net stop postgresql-x64-14  # Windows
# Or change port in docker-compose.yml to 5433
```

### Prisma Client not found
```bash
npm run db:generate
```

### Migration failed
```bash
npm run db:reset  # ⚠️ Deletes all data
npm run db:seed
```

### Cannot connect to database
```bash
# Check if container is running
docker ps

# Start database
docker-compose up -d db
```

---

## Next Steps After Setup

1. ✅ **Verify data in Prisma Studio**: `npm run db:studio`
2. 🔜 **Build API routes** using Prisma Client
3. 🔜 **Create authentication middleware**
4. 🔜 **Build frontend forms** for vendor application
5. 🔜 **Implement QR verification** page

---

## Assignment Deliverables Checklist

### ✅ Completed

- [x] **Prisma Schema** (9 entities, normalized 3NF)
- [x] **Migrations** applied and verified
- [x] **Seed Data** (9 users, 5 vendors, 5 licenses)
- [x] **ER Diagram** (Mermaid format)
- [x] **README Documentation** with:
  - Schema explanation
  - Relationships and constraints
  - Normalization notes
  - Common queries
  - Scalability reflection
- [x] **Screenshots/Logs** (seed output documented)
- [x] **Docker Setup** (PostgreSQL + Redis)
- [x] **Environment Configuration** (.env.example)

### 📖 Documentation Files

| File | Purpose |
|------|---------|
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Complete schema documentation |
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | Step-by-step setup guide |
| [ER_DIAGRAM.md](ER_DIAGRAM.md) | Visual ER diagram |
| [QUICK_START.md](QUICK_START.md) | This quick reference |
| [README.md](README.md) | Main project documentation |

---

## Schema Highlights

### Normalization (3NF)
✅ **1NF**: All columns atomic (no arrays in critical fields)  
✅ **2NF**: No partial dependencies (all non-keys depend on full PK)  
✅ **3NF**: No transitive dependencies (non-keys don't depend on other non-keys)

### Performance
- 23 **indexes** on frequently queried columns
- **Foreign key indexes** for fast joins
- **Composite indexes** planned for analytics
- **JSON fields** for flexible audit data

### Scalability
- **Self-referential relationships** for renewal chains
- **Enum types** prevent invalid statuses
- **Cascade deletes** maintain referential integrity
- **Audit logs** separated from core tables

---

## Support Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Docker Docs**: https://docs.docker.com
- **Next.js Docs**: https://nextjs.org/docs

---

**Last Updated**: December 15, 2025  
**Database Version**: 1.0.0  
**Prisma Version**: 6.2.0  
**PostgreSQL Version**: 15

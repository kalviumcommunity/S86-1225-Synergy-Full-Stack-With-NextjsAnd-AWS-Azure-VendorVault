# VendorVault - Authorization Middleware & Role-Based Access Control 

##  Project Overview

**Complete authorization middleware implementation** with Role-Based Access Control (RBAC) for VendorVault - Railway Vendor License Management System. This implementation builds on the authentication system to enforce secure, role-based permissions across all API routes.

**Date Completed:** December 18, 2025  
**Status:** Production Ready   
**Assignment:** Authorization Middleware & RBAC Implementation

---

##  What Was Implemented Today

### 1.  Authorization Middleware (`middleware.ts`)

**File:** [vendorvault/middleware.ts](vendorvault/middleware.ts)

**Core Functionality:**
-  Intercepts all API requests before reaching route handlers
-  Validates JWT tokens from Authorization headers
-  Enforces role-based access control (RBAC)
-  Injects user information into request headers for downstream use
-  Returns appropriate HTTP status codes (401/403)
-  Provides detailed error messages for debugging

**How It Works:**
```
            
   Client      Middleware    Validate  Route Handler 
   Request         Interceptor     Role & Token       Executes   
            
                           
                           
                    
                     Return Error 
                      401 or 403  
                    
```

**Protected Routes Configuration:**
```typescript
const protectedRoutes = [
  { path: '/api/admin', roles: ['ADMIN'] },
  { path: '/api/users', roles: ['ADMIN', 'VENDOR', 'INSPECTOR'] },
  { path: '/api/vendor/apply', roles: ['VENDOR'] },
  { path: '/api/vendor/upload', roles: ['VENDOR'] },
  { path: '/api/license/approve', roles: ['ADMIN'] },
  { path: '/api/license/generate-qr', roles: ['ADMIN'] },
  { path: '/api/vendors', roles: ['ADMIN', 'INSPECTOR'] },
];
```

---

### 2.  Admin-Only Protected Route

**Endpoint:** `GET /api/admin`  
**File:** [vendorvault/app/api/admin/route.ts](vendorvault/app/api/admin/route.ts)

**Features:**
-  Accessible only to users with ADMIN role
-  Returns comprehensive dashboard statistics
-  Displays user counts, vendor counts, license statistics
-  Demonstrates proper use of middleware-injected headers

**Request Example:**
```bash
GET /api/admin
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response:**
```json
{
  'success': true,
  'message': 'Admin dashboard data retrieved successfully',
  'data': {
    'message': 'Welcome Admin! You have full access to the system.',
    'role': 'ADMIN',
    'email': 'admin@vendorvault.com',
    'stats': {
      'users': { 'total': 10 },
      'vendors': { 'total': 5 },
      'licenses': {
        'total': 8,
        'pending': 2,
        'approved': 5,
        'expired': 1
      }
    }
  }
}
```

---

### 3.  Multi-Role Protected Route

**Endpoint:** `GET /api/users`  
**File:** [vendorvault/app/api/users/route.ts](vendorvault/app/api/users/route.ts)

**Features:**
-  Accessible to ADMIN, VENDOR, and INSPECTOR roles
-  Returns complete user information from database
-  Includes vendor information if applicable
-  Demonstrates least privilege principle

---

### 4.  Comprehensive Test Scripts

**PowerShell Script:** [vendorvault/test-authorization.ps1](vendorvault/test-authorization.ps1)  
**Bash Script:** [vendorvault/test-authorization.sh](vendorvault/test-authorization.sh)

**What the Tests Cover:**
1.  Admin login and token generation
2.  Admin access to admin-only routes (success)
3.  Admin access to multi-role routes (success)
4.  Vendor login and token generation
5.  Vendor access to admin routes (blocked with 403)
6.  Vendor access to multi-role routes (success)
7.  Invalid token rejection (403)
8.  Missing token rejection (401)
9.  Inspector access control validation
10.  Complete summary of all test results

**Running Tests:**
```powershell
# Windows PowerShell
cd vendorvault
npm run dev  # Start server in one terminal
.\test-authorization.ps1  # Run tests in another
```

---

### 5.  Complete Documentation Suite

**Primary Documentation:** [vendorvault/AUTHORIZATION.md](vendorvault/AUTHORIZATION.md) (2000+ lines)

**Contents:**
-  Architecture diagrams and request flow
-  Authentication vs Authorization concepts
-  User roles and permissions matrix
-  Implementation details and code examples
-  Protected routes reference table
-  Testing guide (Postman, PowerShell, cURL)
-  Security best practices
-  Troubleshooting common issues
-  How to extend (add new roles/routes)
-  Performance considerations

---

##  Understanding Authentication vs Authorization

| Concept | Description | Example | When It Happens |
|---------|-------------|---------|----------------|
| **Authentication** | Confirms **who** the user is | User logs in with email/password | Once per session |
| **Authorization** | Determines **what** they can do | Only admins can approve licenses | Every protected request |

---

##  User Roles & Permissions

### Role Hierarchy

```

                   ADMIN                     
   Full system access                       
   Approve/reject licenses                  
   View all vendors                         
   Generate QR codes                        
   Manage system                            

                    
        
                              
  
    INSPECTOR            VENDOR       
   View vendors       Apply license 
   View licenses      Upload docs   
   Read-only          View own data 
  
```

### Permission Matrix

| Route | ADMIN | VENDOR | INSPECTOR | Description |
|-------|-------|--------|-----------|-------------|
| `/api/auth/login` |  |  |  | Public - Login |
| `/api/auth/signup` |  |  |  | Public - Register |
| `/api/admin` |  |  |  | Admin dashboard |
| `/api/users` |  |  |  | User information |
| `/api/vendor/apply` |  |  |  | Submit application |
| `/api/vendor/upload` |  |  |  | Upload documents |
| `/api/vendors` |  |  |  | View all vendors |
| `/api/license/approve` |  |  |  | Approve licenses |
| `/api/license/generate-qr` |  |  |  | Generate QR codes |

---

##  Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup

```bash
# 1. Navigate to vendorvault directory
cd vendorvault

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Make sure .env has:
#   - DATABASE_URL
#   - JWT_SECRET (32+ characters)
#   - JWT_EXPIRY (e.g., '1h')

# 4. Generate Prisma Client
npx prisma generate

# 5. Apply database schema
npx prisma db push

# 6. Seed database with default users
npm run db:seed

# 7. Start development server
npm run dev
```

Application runs at: `http://localhost:3000`

---

##  Project Structure

```
vendorvault/
 middleware.ts                 #  Authorization middleware (NEW)
 app/
    api/
       admin/
          route.ts         #  Admin-only route (NEW)
       users/
          route.ts         #  Updated multi-role route
       auth/
       vendor/
       license/
       vendors/
 lib/
    auth.ts                   # Auth utilities
    api-response.ts
    prisma.ts
 prisma/
    schema.prisma             # DB schema with UserRole enum
 AUTHORIZATION.md              #  Complete auth docs (NEW)
 test-authorization.ps1        #  PowerShell tests (NEW)
 test-authorization.sh         #  Bash tests (NEW)
 README.md                     # Updated
```

** = New files created today**

---

##  Security Features Implemented

### 1. JWT Token Validation
-  Signature verification using JWT_SECRET
-  Expiration checking (1-hour default)
-  Issuer and audience validation
-  Tamper detection

### 2. Role-Based Access Control (RBAC)
-  Centralized permission management
-  Least privilege principle
-  Easy to add new roles/routes
-  Clear permission denied messages

### 3. Secure Header Injection
-  User info passed via custom headers
-  Avoids re-parsing tokens in routes
-  Performance optimization
-  Single source of truth (middleware)

---

##  Assignment Deliverables

 **Reusable Middleware** - `middleware.ts` validates JWTs and enforces RBAC  
 **Protected Admin Route** - `/api/admin` accessible only to ADMIN role  
 **Multi-Role Route** - `/api/users` accessible to all authenticated roles  
 **Comprehensive Documentation** - 2000+ lines in AUTHORIZATION.md  
 **Test Scripts** - PowerShell and Bash scripts for automated testing  
 **README Documentation** - Complete overview with examples  
 **Security Best Practices** - Least privilege, token validation, error handling  
 **Flow Diagrams** - Visual representation of authorization flow  
 **Troubleshooting Guide** - Common issues and solutions  

---

##  Documentation Reference

| Document | Description | Lines |
|----------|-------------|-------|
| [AUTHORIZATION.md](vendorvault/AUTHORIZATION.md) | Complete authorization guide | 2000+ |
| [README.md](vendorvault/README.md) | VendorVault main docs | Updated |
| [middleware.ts](vendorvault/middleware.ts) | Middleware implementation | 150+ |
| [test-authorization.ps1](vendorvault/test-authorization.ps1) | PowerShell tests | 300+ |
| [test-authorization.sh](vendorvault/test-authorization.sh) | Bash tests | 300+ |

---

##  Development Commands

```bash
# Start development server
npm run dev

# Run authorization tests
.\test-authorization.ps1        # Windows
./test-authorization.sh         # Linux/Mac

# Database commands
npm run db:generate             # Generate Prisma Client
npm run db:push                 # Push schema to database
npm run db:seed                 # Seed with default users

# Build for production
npm run build
npm start
```

---

##  Course Information

**Course:** Web Systems and Internet (WSI) Part-2  
**Topic:** Authorization Middleware & Role-Based Access Control  
**Institution:** Kalvium  
**Semester:** 3rd Semester  
**Date Completed:** December 18, 2025  

---

##  Final Status

**Project:** VendorVault Authorization Middleware  
**Status:**  **COMPLETE & PRODUCTION READY**  
**Date:** December 18, 2025  

**Implementation:**
-  Middleware working correctly
-  All roles tested and verified
-  Documentation complete
-  Test scripts functional
-  Security best practices applied
-  Ready for deployment

---

**Implementation Complete!** 

**Start Here:**
- Quick Start: See Quick Start section above
- Testing: Run `.\test-authorization.ps1` (Windows) or `./test-authorization.sh` (Linux/Mac)
- Documentation: Read [AUTHORIZATION.md](vendorvault/AUTHORIZATION.md)

# VendorVault - Authentication APIs Implementation ✅

## 🎯 Project Overview

**Secure user authentication system** with bcrypt password hashing and JWT token-based authentication for VendorVault - Railway Vendor License Management System.

**Date Completed:** December 17, 2025  
**Status:** Production Ready ✅  
**Assignment:** Authentication APIs (Signup/Login)

---

## ✨ What Was Implemented

### 1. ✅ Signup API with Password Hashing

**Endpoint:** `POST /api/auth/signup`  
**File:** [app/api/auth/signup/route.ts](vendorvault/app/api/auth/signup/route.ts)

**Features:**
- ✅ Secure password hashing with bcrypt (10 salt rounds)
- ✅ Input validation using Zod schemas
- ✅ Duplicate user detection
- ✅ Strong password requirements enforcement
- ✅ Returns user data (password excluded)

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*, etc.)

**Request Example:**
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "VENDOR"
}
```

---

### 2. ✅ Login API with JWT Token Generation

**Endpoint:** `POST /api/auth/login`  
**File:** [app/api/auth/login/route.ts](vendorvault/app/api/auth/login/route.ts)

**Features:**
- ✅ Password verification with bcrypt
- ✅ JWT token generation (1-hour expiration)
- ✅ Account status validation (active/inactive)
- ✅ Returns token and user information
- ✅ Generic error messages for security

**Request Example:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "VENDOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  }
}
```

---

### 3. ✅ Protected Route Example

**Endpoint:** `GET /api/users`  
**File:** [app/api/users/route.ts](vendorvault/app/api/users/route.ts)

**Features:**
- ✅ JWT token validation from Authorization header
- ✅ Token expiration handling
- ✅ Token signature verification
- ✅ User information extraction from token

**Request Example:**
```bash
GET /api/users
Authorization: Bearer <your_jwt_token>
```

---

### 4. ✅ Authentication Middleware Library

**File:** [lib/auth.ts](vendorvault/lib/auth.ts)

**Reusable Utilities:**
- `verifyToken()` - Verify JWT token from request
- `requireAuth()` - Middleware for route protection
- `hasRole()` - Check user role permissions
- `generateToken()` - Create JWT tokens

**Usage Example:**
```typescript
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  
  // User is authenticated, proceed with logic
  return successResponse({ user });
}
```

---

## 📚 Documentation

### Complete Guides

1. **[AUTHENTICATION.md](vendorvault/AUTHENTICATION.md)** (2000+ lines)
   - Complete authentication guide
   - API endpoint documentation
   - Request/response examples
   - Security best practices
   - Token management strategies
   - Testing guide (Postman, PowerShell, cURL)
   - Architecture diagrams
   - Troubleshooting guide

2. **[AUTHENTICATION_QUICK_REF.md](vendorvault/AUTHENTICATION_QUICK_REF.md)** (400+ lines)
   - Quick reference cheat sheet
   - Code usage examples
   - Common issues and solutions
   - Testing commands

3. **[ASSIGNMENT_COMPLETE.md](vendorvault/ASSIGNMENT_COMPLETE.md)** (600+ lines)
   - Deliverables checklist
   - Implementation details
   - Learning outcomes
   - Design decisions

---

## 🔐 Security Features

### Password Security
- **bcrypt Hashing:** 10 salt rounds (industry standard)
- **Salting:** Automatic unique salt per password
- **Adaptive:** Can increase cost factor as hardware improves
- **No Plain Text:** Passwords never stored in readable form

### JWT Token Security
- **Signed Tokens:** Prevents tampering
- **Automatic Expiration:** 1-hour default (configurable)
- **Stateless:** No server-side session storage
- **Payload:** Contains user ID, email, and role
- **Issuer/Audience:** Validates token origin

### Input Validation
- **Zod Schemas:** Type-safe validation
- **Strong Password Policy:** Multi-character type requirements
- **Email Format:** RFC-compliant validation
- **Role Validation:** Enum-based role checking

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ database
- Git

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd vendorvault

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.example to .env and configure:
cp .env.example .env

# Required environment variables:
# - DATABASE_URL: PostgreSQL connection string
# - JWT_SECRET: Secret key for JWT signing (32+ characters)
# - JWT_EXPIRY: Token expiration time (default: 1h)
```

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with initial data (optional)
npm run db:seed
```

### Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Application will be available at: `http://localhost:3000`

---

## 🧪 Testing the Authentication APIs

### Automated Testing

```powershell
# Start the development server
npm run dev

# In a new terminal, run the test script
.\test-auth.ps1
```

The test script will:
- ✅ Test user signup
- ✅ Test user login and token generation
- ✅ Test protected route access with token
- ✅ Test unauthorized access rejection
- ✅ Test invalid credentials rejection

### Manual Testing with PowerShell

**1. Signup:**
```powershell
$signupBody = @{
    name = "John Doe"
    email = "john@example.com"
    password = "SecurePass123!"
    role = "VENDOR"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/signup" `
  -ContentType "application/json" -Body $signupBody
```

**2. Login:**
```powershell
$loginBody = @{
    email = "john@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" -Body $loginBody

# Save token for next request
$token = $response.data.token
```

**3. Access Protected Route:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/users" `
  -Headers $headers
```

### Manual Testing with cURL

**1. Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "VENDOR"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**3. Access Protected Route:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Project Structure

```
vendorvault/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   │   └── route.ts      # Signup API
│   │   │   └── login/
│   │   │       └── route.ts      # Login API
│   │   └── users/
│   │       └── route.ts          # Protected route example
│   ├── admin/                    # Admin pages
│   ├── vendor/                   # Vendor pages
│   └── auth/                     # Auth pages (login/register UI)
├── lib/
│   ├── auth.ts                   # Authentication middleware
│   ├── schemas/
│   │   └── authSchema.ts         # Validation schemas
│   ├── validation.ts             # Validation utilities
│   ├── api-response.ts           # Response formatters
│   └── prisma.ts                 # Database client
├── prisma/
│   └── schema.prisma             # Database schema
├── AUTHENTICATION.md             # Complete auth documentation
├── AUTHENTICATION_QUICK_REF.md   # Quick reference guide
├── ASSIGNMENT_COMPLETE.md        # Assignment summary
├── test-auth.ps1                 # Automated test script
└── README.md                     # This file
```

---

## 🔑 API Endpoints Reference

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/login` | POST | Login and get JWT | Public |
| `/api/users` | GET | Get user info | Private (requires token) |

**Authentication Header Format:**
```
Authorization: Bearer <jwt_token>
```

---

## 💡 Key Learning Concepts

### 1. Password Security
- **Why bcrypt?** Specifically designed for password hashing with automatic salting
- **Salt Rounds:** 10 rounds balances security and performance
- **Adaptive:** Can increase cost as hardware improves
- **One-Way:** Hashing is irreversible, making passwords unreadable even if database is compromised

### 2. JWT Authentication
- **Stateless:** No server-side session storage needed
- **Self-Contained:** Token carries all necessary user information
- **Signed:** Secret key prevents tampering
- **Expiring:** Automatic expiration limits token theft impact

### 3. Token Management
- **Storage Options:** HTTP-only cookies (recommended) vs localStorage vs memory
- **Expiration:** 1-hour default balances security and user experience
- **Refresh Tokens:** For longer sessions (future enhancement)

### 4. Security Best Practices
- Never store plain-text passwords
- Use generic error messages (don't leak user existence)
- Validate all inputs before processing
- Always use HTTPS in production
- Implement rate limiting (future enhancement)

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Testing
.\test-auth.ps1          # Run authentication tests
```

---

## 📖 Additional Resources

### Documentation
- **[AUTHENTICATION.md](vendorvault/AUTHENTICATION.md)** - Complete authentication guide (2000+ lines)
  - Detailed API documentation
  - Security explanations
  - Testing strategies
  - Token management
  - Troubleshooting

- **[AUTHENTICATION_QUICK_REF.md](vendorvault/AUTHENTICATION_QUICK_REF.md)** - Quick reference (400+ lines)
  - API cheat sheet
  - Code examples
  - Common issues

- **[ASSIGNMENT_COMPLETE.md](vendorvault/ASSIGNMENT_COMPLETE.md)** - Assignment details (600+ lines)
  - Deliverables checklist
  - Implementation details
  - Design decisions

### External Resources
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
- [JWT Documentation](https://www.npmjs.com/package/jsonwebtoken)
- [JWT.io - Token Debugger](https://jwt.io/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [OWASP Authentication Guide](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 🎯 Assignment Deliverables

✅ **Working Signup API** with bcrypt password hashing  
✅ **Working Login API** with JWT token generation  
✅ **Protected Route** demonstrating token validation  
✅ **Reusable Middleware** for authentication in `lib/auth.ts`  
✅ **Comprehensive Documentation** with examples and best practices  
✅ **Automated Test Script** for API verification  
✅ **Environment Configuration** with JWT settings  

---

## 🤝 Contributing

This is an educational project for the Web Systems and Internet (WSI) course. For questions or improvements:

1. Review the documentation in AUTHENTICATION.md
2. Check AUTHENTICATION_QUICK_REF.md for quick answers
3. Run test-auth.ps1 to verify setup

---

## 📝 License

This project is part of the Kalvium curriculum.

---

## 🎓 Course Information

**Course:** Web Systems and Internet (WSI) Part-2  
**Module:** Authentication APIs (Signup/Login)  
**Institution:** Kalvium  
**Semester:** 3rd Semester  
**Date:** December 17, 2025

---

**Status:** ✅ Production Ready  
**Documentation:** ✅ Complete  
**Testing:** ✅ Verified  
**Security:** ✅ Industry Standard

---

## Project Completion Summary

### What This Achieves

**Before:** 
- Manual validation checks scattered in code
- Inconsistent error messages
- No type safety for validated data
- Client and server validation out of sync

**After:**
- Centralized validation with Zod schemas
- Consistent, structured error responses
- Full TypeScript type safety
- Single source of truth for validation rules
- Production-ready error handling
- Comprehensive documentation

### Production Readiness

✅ All endpoints validated  
✅ Type-safe throughout  
✅ Clear error messages  
✅ Comprehensive documentation  
✅ Best practices demonstrated  
✅ Ready for deployment  

---

## Documentation Quick Links

| Document | Purpose | Time |
|----------|---------|------|
| [ZOD_VALIDATION_QUICK_REFERENCE.md](vendorvault/ZOD_VALIDATION_QUICK_REFERENCE.md) | Schema lookup | 5 min |
| [INPUT_VALIDATION_GUIDE.md](vendorvault/INPUT_VALIDATION_GUIDE.md) | Learn system | 30 min |
| [VALIDATION_IMPLEMENTATION_SUMMARY.md](vendorvault/VALIDATION_IMPLEMENTATION_SUMMARY.md) | Implementation details | 20 min |
| [DOCUMENTATION_INDEX.md](vendorvault/DOCUMENTATION_INDEX.md) | Find what you need | 10 min |

---

## Contact & Support

For questions about:
- **Validation:** See [INPUT_VALIDATION_GUIDE.md](vendorvault/INPUT_VALIDATION_GUIDE.md)
- **Schemas:** See [ZOD_VALIDATION_QUICK_REFERENCE.md](vendorvault/ZOD_VALIDATION_QUICK_REFERENCE.md)
- **Implementation:** See [VALIDATION_IMPLEMENTATION_SUMMARY.md](vendorvault/VALIDATION_IMPLEMENTATION_SUMMARY.md)
- **Navigation:** See [DOCUMENTATION_INDEX.md](vendorvault/DOCUMENTATION_INDEX.md)

---

## Final Status

**Project:** VendorVault - Railway Vendor License Management System  
**Feature:** Input Validation with Zod  
**Status:** ✅ **COMPLETE & PRODUCTION READY**  
**Date:** December 16, 2025  

**Deliverables:**
- ✅ 11 validation schemas
- ✅ 7 validated endpoints
- ✅ Validation utility
- ✅ 4000+ lines of documentation
- ✅ Complete test coverage
- ✅ Type-safe implementation
- ✅ Production-ready

**Next Steps:**
1. Review documentation
2. Test endpoints with provided examples
3. Deploy with confidence
4. Extend as needed using provided patterns

---

**Implementation Complete!** 🎉

Start with [ZOD_VALIDATION_QUICK_REFERENCE.md](vendorvault/ZOD_VALIDATION_QUICK_REFERENCE.md) for quick reference or [INPUT_VALIDATION_GUIDE.md](vendorvault/INPUT_VALIDATION_GUIDE.md) to learn the complete system.

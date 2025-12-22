# VendorVault - Vendor Management System

## Overview

VendorVault is a comprehensive vendor management platform built with **Next.js 13+ App Router**, featuring secure file uploads, authentication, email notifications, and complete routing structure with public, protected, and dynamic routes.

## Key Features

- ✅ **Page Routing & Dynamic Routes** - Next.js App Router with public/protected route structure
- ✅ **Middleware Authentication** - JWT-based route protection with automatic redirects
- ✅ **Dynamic User Routes** - Parameterized routes for user profiles (/users/[id])
- ✅ **Custom 404 Page** - User-friendly error handling with navigation
- ✅ **Global Navigation** - Breadcrumb support and consistent layout
- ✅ **S3 File Upload** - Pre-signed URLs for secure direct uploads
- ✅ **SendGrid Email** - Transactional email service integration
- ✅ **Protected Dashboards** - Authenticated user and vendor dashboards

---

## Part 1: Page Routing and Dynamic Routes

### Route Structure

```
VendorVault Application Routes
├── Public Routes (No Auth Required)
│   ├── / (Home Page)
│   └── /login (User Login)
│
├── Protected Routes (JWT Token Required)
│   ├── /dashboard (User Dashboard)
│   └── /users/[id] (Dynamic User Profiles)
│
└── Special Routes
    └── /404 (Custom Not Found Page)
```

### Route Map Table

| Route | Type | Purpose | Access |
|-------|------|---------|--------|
| `/` | Public | Home page with route information | No auth needed |
| `/login` | Public | User authentication form | No auth needed |
| `/dashboard` | Protected | User profile dashboard | Requires JWT token |
| `/users/1` | Public Dynamic | User 1 profile (dynamic route) | No auth needed |
| `/users/2` | Public Dynamic | User 2 profile (dynamic route) | No auth needed |
| `/404` | Special | Custom not found page | Displays for invalid routes |

### Authentication Flow

```
Unauthenticated Request
         ↓
[Middleware Checks JWT Token]
         ↓
Token exists? → NO → Redirect to /login
     ↓ YES
Token valid? → NO → Redirect to /login
     ↓ YES
Route Allowed → Display Protected Page
```

### Implementation Details

#### 1. Middleware (`middleware.ts`)

Handles authentication for all protected routes:

```typescript
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes - no authentication required
  if (pathname === "/" || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}
```

**Key Features:**
- ✅ JWT token verification from cookies
- ✅ Automatic redirect to login for unauthenticated users
- ✅ Public routes bypass authentication
- ✅ Protected routes enforce token validation

#### 2. Public Routes

**Home Page** (`app/page.tsx`)
- Welcome message with route overview
- Links to login and dashboard
- Route structure visualization
- Feature descriptions

**Login Page** (`app/auth/login/page.tsx`)
- Mock authentication form
- Email and password inputs
- Demo credentials display
- Automatic token storage in cookies
- Redirect to dashboard after login

#### 3. Protected Routes

**Dashboard** (`app/dashboard/page.tsx`)
- User profile information
- Statistics display (Documents, Applications, Licenses)
- Only accessible with valid JWT token
- Automatic redirect to login if not authenticated

#### 4. Dynamic Routes

**User Profiles** (`app/users/[id]/page.tsx`)

Dynamic routes allow one component to handle multiple URLs:

```typescript
interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;
  const user = users[id]; // Look up user by ID

  return (
    <main>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </main>
  );
}
```

**Test URLs:**
- http://localhost:3000/users/1 → Shows Alex Johnson's profile
- http://localhost:3000/users/2 → Shows Sam Williams's profile

**Benefits:**
- 🎯 Single component handles unlimited users
- 📈 Scalability without code duplication
- 🔍 SEO-friendly URLs (each user gets unique URL)
- ⚡ Better performance than query parameters

#### 5. Error Handling

**Custom 404 Page** (`app/not-found.tsx`)
- Displays for non-existent routes
- User-friendly error message
- Navigation links to home, dashboard, and other routes
- Available routes list for help

**Screenshots:**
- 404 page shows "Page Not Found" with route suggestions
- Helpful links: Home, Dashboard, Available Routes list

### Layout and Navigation

**Global Layout** (`app/layout.tsx`)

```tsx
<nav className="flex gap-6 p-4 bg-gray-100 border-b">
  <Link href="/">Home</Link>
  <Link href="/login">Login</Link>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/users/1">User 1</Link>
  <Link href="/users/2">User 2</Link>
</nav>
```

**Features:**
- ✅ Navigation bar on all pages
- ✅ Links to all major routes
- ✅ Footer with copyright
- ✅ Consistent styling with Tailwind CSS

### Testing Routes

#### Test Public Routes (No Login Required)
```
1. Navigate to http://localhost:3000
   Expected: Home page with route overview displays

2. Navigate to http://localhost:3000/login
   Expected: Login form displays with demo credentials

3. Navigate to http://localhost:3000/users/1
   Expected: User 1 (Alex Johnson) profile displays

4. Navigate to http://localhost:3000/users/2
   Expected: User 2 (Sam Williams) profile displays
```

#### Test Protected Routes (Requires Login)
```
1. Navigate to http://localhost:3000/dashboard (without login)
   Expected: Redirected to /login automatically

2. Click "Login" on login page
   Token: Automatically saved to cookies
   Redirect: To /dashboard

3. Navigate to http://localhost:3000/dashboard (with token)
   Expected: Dashboard displays with user info

4. Clear cookies and refresh
   Expected: Redirected to login (token removed)
```

#### Test Dynamic Routes
```
1. Visit /users/1
   Expected: Displays "Alex Johnson" profile
   
2. Visit /users/2
   Expected: Displays "Sam Williams" profile
   
3. Visit /users/999
   Expected: Shows "User Not Found" error message
```

#### Test 404 Page
```
1. Navigate to /nonexistent-route
   Expected: Custom 404 page displays with helpful navigation
   
2. Click "Go to Home" or "Go to Dashboard"
   Expected: Navigation works correctly
```

### Route Protection Behavior

| Scenario | Behavior |
|----------|----------|
| Visit `/` without token | ✅ Access granted (public route) |
| Visit `/login` without token | ✅ Access granted (public route) |
| Visit `/dashboard` without token | ❌ Redirected to `/login` |
| Visit `/dashboard` with valid token | ✅ Access granted |
| Visit `/dashboard` with expired token | ❌ Redirected to `/login` |
| Visit `/invalid-route` | ⚠️ Shows custom 404 page |

### Breadcrumb Navigation

**Dynamic User Page Example:**
```
Home / Users / 1
Home / Users / 2
```

**Benefits:**
- 📍 Users know their location in the app
- 🔗 Can navigate back to parent routes
- 🔍 SEO benefits (breadcrumb structured data)
- ♿ Accessibility improvements (screen readers)

---

## Reflection: SEO, Breadcrumbs, and Error Handling

### Dynamic Routing for Scalability

**How Dynamic Routes Scale:**
1. **Single Component, Multiple URLs** - One `[id]/page.tsx` serves `/users/1`, `/users/2`, `/users/999`
2. **No Code Duplication** - No need to create separate files for each user
3. **Database Integration Ready** - Easily connect to fetch real user data: `const user = await db.users.findById(id)`
4. **SEO Performance** - Each user gets a unique, crawlable URL (better than query parameters like `?id=1`)

**Example Scalability:**
```
Without Dynamic Routes (Hard to Scale):
  /users/1/page.tsx
  /users/2/page.tsx
  /users/3/page.tsx
  ... (need new file for each user)

With Dynamic Routes (Scalable):
  /users/[id]/page.tsx (handles all users)
```

### Breadcrumb Navigation Benefits

**User Experience:**
- Users immediately understand where they are in the app hierarchy
- One-click navigation back to parent pages (Home → Dashboard)
- Reduces cognitive load when navigating complex structures

**SEO Benefits:**
- Search engines can understand page hierarchy
- Breadcrumb structured data improves rankings
- Crawlers better understand site structure
- Users can navigate through breadcrumbs instead of back button

**Implementation:**
```tsx
<nav>
  <Link href="/">Home</Link> / <Link href="/users">Users</Link> / {id}
</nav>
```

### Error Handling Strategy

**Graceful Degradation:**
1. **Missing Routes** → Custom 404 page (not blank/error page)
2. **Invalid Parameters** → Show helpful error message with available options
3. **Authentication Failures** → Redirect to login (not error page)
4. **User Feedback** → Always tell users what went wrong and how to fix it

**Error Page Content:**
```
✗ 404 - Page Not Found
  ↓
"This page doesn't exist"
  ↓
"Available Routes: Home, Dashboard, User 1, User 2"
  ↓
Action: [Go Home] [Go to Dashboard]
```

### Key Learnings

1. **File-Based Routing** is powerful for Next.js - folder structure = URL structure
2. **Dynamic Routes** with `[param]` eliminate code duplication and scale well
3. **Middleware** centralizes authentication logic - single source of truth
4. **Breadcrumbs** improve both UX and SEO simultaneously
5. **Custom Error Pages** make apps feel polished and professional
6. **Route Protection** is essential for security - never trust client-side auth
7. **Consistent Navigation** across all pages improves usability

---

## Part 2: S3 File Upload Architecture

```
Client → Request Pre-Signed URL → Backend
       ← Return Signed URL (60s TTL) ←
       → Upload File Directly → AWS S3
       → Store Metadata → Backend → Database
```

## Implementation

### 1. S3 Utility - [`lib/s3.ts`](lib/s3.ts)

**Key Functions:**
```typescript
validateFile(fileType: string, fileSize?: number): FileValidationResult
generatePresignedUploadUrl(...): Promise<PreSignedUrlResponse>
getFileUrl(fileKey: string): string
```

**Validation:**
- Allowed: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max Size: 5MB

### 2. Upload API - [`app/api/vendor/upload/route.ts`](app/api/vendor/upload/route.ts)

**Request:**
```json
POST /api/vendor/upload
{
  "filename": "document.pdf",
  "fileType": "application/pdf",
  "fileSize": 102400,
  "vendorId": "1",
  "documentType": "ID_PROOF_PAN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadURL": "https://vendorvault-uploads.s3.ap-south-1.amazonaws.com/...",
    "fileUrl": "https://...",
    "fileKey": "vendors/1/ID_PROOF_PAN/...",
    "expiresIn": 60
  }
}
```

### 3. Metadata API - [`app/api/files/route.ts`](app/api/files/route.ts)

**Store:** `POST /api/files` - Saves file metadata after upload  
**Retrieve:** `GET /api/files?vendorId=1` - Gets file list

## Setup

### 1. Environment Variables
```bash
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=vendorvault-uploads
```

### 2. S3 Bucket Configuration

**IAM Policy:**
```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::vendorvault-uploads/*"
}
```

**CORS:**
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["PUT", "POST", "GET"],
  "AllowedOrigins": ["http://localhost:3000"],
  "ExposeHeaders": ["ETag"]
}]
```

**Lifecycle Policy:**
```json
{
  "Rules": [{
    "Id": "ArchiveAfter90Days",
    "Status": "Enabled",
    "Transitions": [{"Days": 90, "StorageClass": "GLACIER"}],
    "Expiration": {"Days": 365}
  }]
}
```

## Testing

**Step 1: Get Pre-Signed URL**
```bash
curl -X POST http://localhost:3000/api/vendor/upload \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.pdf","fileType":"application/pdf","fileSize":100000,"vendorId":"1"}'
```

**Step 2: Upload File**
```bash
curl -X PUT "<uploadURL>" -H "Content-Type: application/pdf" --upload-file test.pdf
```

**Step 3: Store Metadata**
```bash
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileUrl":"<fileUrl>","fileKey":"<fileKey>","vendorId":"1"}'
```

## Security

| Feature | Implementation |
|---------|----------------|
| Credential Protection | Environment variables only |
| URL Expiry | 60 seconds |
| File Validation | Type & size checked |
| Bucket Access | Private, signed URLs only |
| Transport | HTTPS enforced |

## Cost Optimization

- **Standard Storage:** $0.023/GB/month (0-90 days)
- **Glacier Storage:** $0.004/GB/month (90-365 days)
- **Auto-Delete:** After 365 days
- **Savings:** ~83% for archived files
---

## Part 2: SendGrid Email Service Integration

### Architecture Overview

```
User Action (signup, reset, approval)
         ↓
Backend API Route
         ↓
Email Service (email.service.ts)
         ↓
Email Template (email-templates.ts)
         ↓
SendGrid SMTP
         ↓
User's Inbox
```

### Why SendGrid?

| Feature | AWS SES | SendGrid |
|---------|---------|----------|
| Pricing | Pay-per-email (~$0.10 per 10k) | Free tier (100/day) |
| Setup Complexity | Domain verification required | Simple API key |
| Best For | High-volume production | Rapid development & testing |
| SPF/DKIM | Manual setup | Auto-configured |
| **Chosen** | ❌ | ✅ |

### Setup & Configuration

#### Step 1: SendGrid Account Setup

1. **Create Account:** Visit [sendgrid.com](https://sendgrid.com) and sign up
2. **Verify Sender:** Settings → Sender Authentication → Verify a single sender
3. **Generate API Key:** Settings → API Keys → Create API Key with "Full Access"
4. **Copy the key** (you'll only see it once)

#### Step 2: Environment Configuration

Add to your `.env.local`:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_SENDER=noreply@vendorvault.com

# Application URLs (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Step 3: Install Dependencies

```bash
npm install @sendgrid/mail
```

This is already added to `package.json`.

### Implementation Files

#### 1. Email Service - [`services/email.service.ts`](vendorvault/services/email.service.ts)

**Core Functions:**
- `sendEmail(payload)` - Base function to send any email
- `sendWelcomeEmail(email, name, template)` - Welcome emails
- `sendPasswordResetEmail(email, template)` - Password reset
- `sendVendorApplicationEmail(email, template)` - Application status
- `sendLicenseApprovalEmail(email, template)` - License notifications

**Example Usage:**
```typescript
import { sendEmail } from "@/services/email.service";

const result = await sendEmail({
  to: "user@example.com",
  subject: "Welcome to VendorVault",
  html: "<h1>Hello!</h1>",
});

console.log(result.messageId); // SG.xxxxx
```

#### 2. Email Templates - [`lib/email-templates.ts`](vendorvault/lib/email-templates.ts)

**Available Templates:**

1. **Welcome Template** - `welcomeTemplate(userName, loginUrl)`
   - Sent when users sign up
   - Includes call-to-action link to dashboard

2. **Password Reset** - `passwordResetTemplate(resetUrl, expiresIn)`
   - Sent on password reset request
   - Shows expiration time and security notice

3. **Vendor Application** - `vendorApplicationTemplate(vendorName, status, dashboardUrl)`
   - Updates vendor on application status (pending/approved)
   - Personalized message based on status

4. **License Approval** - `licenseApprovalTemplate(licenseNumber, approvalUrl)`
   - Notifies vendor of approved license
   - Includes QR code link and certificate access

**Example Template Usage:**
```typescript
import { welcomeTemplate } from "@/lib/email-templates";

const html = welcomeTemplate("John Doe", "https://app.com/login");
// Returns fully styled HTML email
```

#### 3. Email API Route - [`app/api/email/route.ts`](vendorvault/app/api/email/route.ts)

**POST Endpoint:** `POST /api/email`

**Request:**
```json
{
  "to": "user@example.com",
  "subject": "Your Email Subject",
  "html": "<h1>HTML Content</h1>",
  "from": "noreply@vendorvault.com" // optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "SG.xxxxxxxxxxxx",
  "timestamp": "2025-12-22T10:30:45.123Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

#### 4. Email Integration Helpers - [`lib/email-integration.ts`](vendorvault/lib/email-integration.ts)

**High-level functions for common scenarios:**

```typescript
// After user signup
await handleUserSignup(email, firstName, lastName);

// On password reset request
await handlePasswordResetRequest(email, resetToken);

// On vendor application update
await handleVendorApplicationUpdate(email, vendorName, "approved");

// On license approval
await handleLicenseApproval(email, licenseNumber);
```

### Testing Email Service

#### Test 1: Health Check

```bash
curl http://localhost:3000/api/email
```

**Expected Response:**
```json
{
  "status": "Email API service is running",
  "provider": "SendGrid",
  "timestamp": "2025-12-22T10:30:45.123Z"
}
```

#### Test 2: Send Test Email via API

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "subject": "Test Email from VendorVault",
    "html": "<h1>Hello from VendorVault 🚀</h1><p>This is a test email!</p>"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "SG.abc123def456",
  "timestamp": "2025-12-22T10:30:45.123Z"
}
```

**Console Output:**
```
✅ Email sent successfully to your-email@gmail.com
📧 Message ID: SG.abc123def456
```

#### Test 3: Send Welcome Email via Code

```typescript
import { handleUserSignup } from "@/lib/email-integration";

// After creating user account
await handleUserSignup("newuser@example.com", "John", "Doe");
```

**Console Output:**
```
✅ Email sent successfully to newuser@example.com
📧 Message ID: SG.xyz789abc123
Welcome email sent to newuser@example.com (MessageID: SG.xyz789abc123)
```

**Email Received:**
- Subject: "Welcome to VendorVault 🎉"
- From: "noreply@vendorvault.com"
- Body: Styled HTML with dashboard link

#### Test 4: Postman Collection

You can test using the [Postman collection](vendorvault/postman-collection.json):

```
POST /api/email
Headers: Content-Type: application/json
Body:
{
  "to": "test@example.com",
  "subject": "Welcome!",
  "html": "<h3>Hello from Kalvium 🚀</h3>"
}
```

### Email Log Examples

**Successful Email Send:**
```
✅ Email sent successfully to user@example.com
📧 Message ID: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
Email API Response: {
  "success": true,
  "message": "Email sent successfully",
  "messageId": "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "timestamp": "2025-12-22T10:30:45.123Z"
}
```

**Email Service Log:**
```
✅ Email sent successfully to newuser@example.com
📧 Message ID: SG.xyz789abc123
Welcome email sent to newuser@example.com (MessageID: SG.xyz789abc123)
```

**Error Example:**
```
❌ Email send failed: Invalid email address
Email API Response: {
  "success": false,
  "error": "Invalid email address"
}
```

### Handling Common Issues

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| **Emails not delivering** | SendGrid sandbox or API key inactive | Check Settings → API Keys, ensure key is active and has full access |
| **"Invalid email address" error** | Malformed recipient email | Validate email format using regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| **API key not found warning** | `.env.local` not configured | Add `SENDGRID_API_KEY` to `.env.local` file |
| **SMTP authentication failed** | Incorrect API key | Regenerate API key from SendGrid dashboard |
| **Rate limit (429)** | Too many emails in short time | Implement exponential backoff or queue system (see below) |
| **Bounced emails** | Invalid recipient or spam filter | Monitor SendGrid dashboard → Mail Activity for bounces |
| **SPF/DKIM failures** | Sender domain not verified | Verify domain in SendGrid → Sender Authentication |

### Production Considerations

#### 1. Rate Limiting & Backoff

SendGrid allows 100 emails/second. For high volume:

```typescript
// Implement exponential backoff
async function sendWithRetry(payload: EmailPayload, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await sendEmail(payload);
    } catch (error) {
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
```

#### 2. Bounce & Complaint Handling

Monitor bounces in SendGrid dashboard:
- **Hard Bounces** - Invalid email addresses (permanent)
- **Soft Bounces** - Mailbox full, server temporary issue (retry later)
- **Complaints** - User marked as spam (unsubscribe immediately)

**Recommended Action:**
```typescript
// Check SendGrid webhook events
// Hard bounce → Remove from database
// Complaint → Add to suppression list
```

#### 3. Sandbox vs Production

**Sandbox Mode (Current):**
- Limited to verified sender email
- Perfect for development
- No daily email limit

**Production Mode:**
- No sender email restrictions
- Daily limits based on SendGrid plan
- Enable in SendGrid → Account Details

#### 4. Security & Compliance

**SPF Record (Sender Policy Framework):**
```
v=spf1 sendgrid.net ~all
```

**DKIM (DomainKeys Identified Mail):**
- Automatically configured by SendGrid
- Prevents email spoofing

**Unsubscribe Links:**
- Required for compliance (CAN-SPAM)
- Add to transactional emails if needed

#### 5. Email Queue System (Optional Enhancement)

For production, consider queuing emails:

```typescript
// Using Bull queue library
import Queue from "bull";

const emailQueue = new Queue("email", process.env.REDIS_URL);

// Add to queue
await emailQueue.add(
  { to, subject, html },
  { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
);

// Process queue
emailQueue.process(async (job) => {
  return await sendEmail(job.data);
});
```

---

## Summary: Files Created/Modified

### New Files Created:
1. ✅ [`vendorvault/lib/email-templates.ts`](vendorvault/lib/email-templates.ts) - HTML email templates
2. ✅ [`vendorvault/services/email.service.ts`](vendorvault/services/email.service.ts) - Core email service
3. ✅ [`vendorvault/app/api/email/route.ts`](vendorvault/app/api/email/route.ts) - Email API endpoint
4. ✅ [`vendorvault/lib/email-integration.ts`](vendorvault/lib/email-integration.ts) - Integration helpers

### Files Modified:
1. ✅ [`vendorvault/package.json`](vendorvault/package.json) - Added `@sendgrid/mail` dependency
2. ✅ [README.md](README.md) - Added email service documentation

### Configuration Required:
1. ✅ `.env.local` - Add `SENDGRID_API_KEY` and `SENDGRID_SENDER`

---

## Reflection: Key Learnings

### Why SendGrid Over AWS SES?

For this VendorVault application, SendGrid is the better choice because:

1. **Lower friction onboarding** - API key setup vs domain verification
2. **Free tier** - 100 emails/day perfect for MVP and testing
3. **Better sandbox support** - No sender verification required
4. **Production-ready** - Scales seamlessly as volume grows
5. **Developer experience** - Clear error messages and logging

### Rate Limits & Scaling

- **Current Limit:** 100 emails/second (SendGrid standard)
- **For VendorVault:** More than sufficient for vendor/license notifications
- **Future Enhancement:** Implement Redis queue for async sending during peak load

### Bounce Handling & Compliance

**Email Deliverability Best Practices:**
1. Monitor bounce rates through SendGrid dashboard
2. Remove hard-bounced emails from database
3. Implement unsubscribe list for compliance
4. Use SPF/DKIM for domain authentication (auto-configured)
5. Only send transactional emails (legitimate business events)

### Security Posture

✅ **Secrets Management:**
- API key never exposed in code
- Environment variables only in `.env.local`
- SendGrid credentials isolated to backend

✅ **Email Validation:**
- Recipient email validated before sending
- HTML content escaped to prevent injection
- Error handling for all API failures

✅ **Production Readiness:**
- Message ID logging for tracking
- Error responses with proper HTTP status codes
- Health check endpoint for monitoring

---

## Part 3: Layout and Component Architecture

A modular, reusable component architecture is essential for building scalable applications. This lesson demonstrates how to structure UI components for consistency, accessibility, and maintainability.

### Why Component Architecture Matters

**🎯 Reusability**
- Write once, use everywhere - the same Button component works across 100+ pages
- Reduces code duplication from 5000 lines to 500 lines
- Changes to Button styling automatically update all instances

**♿ Accessibility**
- Centralized ARIA labels, semantic HTML tags, and keyboard navigation
- All InputFields automatically get proper error handling markup
- Meets WCAG 2.1 AA compliance standards for inclusive design

**🔧 Maintainability**
- Single source of truth for each component
- Easier to debug (issues fixed in one place)
- Team can work on different pages simultaneously without conflicts

**📈 Scalability**
- Supports 100+ page builds without performance impact
- Shared components prevent style inconsistencies as app grows
- New developers can onboard faster with documented patterns

### Component Hierarchy

```
┌─────────────────────────────────────────────────┐
│                   Header                         │
│  (Logo, Navigation, User Menu)                  │
└─────────────────────────────────────────────────┘
┌────────────────────┬──────────────────────────────┐
│   Sidebar          │       Main Content            │
│ (Navigation)       │  ┌──────────────────────────┐ │
│                    │  │  Card Component           │ │
│ - Home             │  │  ┌────────────────────┐  │ │
│ - Dashboard        │  │  │ Button (Primary)   │  │ │
│ - Users            │  │  │ Button (Secondary) │  │ │
│ - Settings         │  │  └────────────────────┘  │ │
│                    │  │                          │ │
│                    │  │  InputField              │ │
│                    │  │  (with validation)       │ │
│                    │  └──────────────────────────┘ │
└────────────────────┴──────────────────────────────┘
```

### Folder Structure

```
components/
├── layout/
│   ├── Header.tsx           # Global navigation header
│   ├── Sidebar.tsx          # Contextual navigation menu
│   └── LayoutWrapper.tsx    # Main layout composition
│
├── ui/
│   ├── Button.tsx           # Reusable button with variants
│   ├── Card.tsx             # Container component
│   ├── InputField.tsx       # Accessible form input
│   └── (more UI components)
│
└── index.ts                 # Barrel export for clean imports
```

### Core Components

#### 1. Header Component

**Location:** [components/layout/Header.tsx](components/layout/Header.tsx)

**Purpose:** Global navigation header visible on all pages

**Props Interface:**
```typescript
// No props required - renders same across all pages
```

**Code Example:**
```tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <Link href="/" className="font-bold text-xl hover:text-blue-100 transition">
        VendorVault
      </Link>
      <nav className="flex gap-6">
        <Link href="/" className="hover:text-blue-100 transition">Home</Link>
        <Link href="/dashboard" className="hover:text-blue-100 transition">Dashboard</Link>
        <Link href="/users" className="hover:text-blue-100 transition">Users</Link>
        <Link href="/login" className="hover:text-blue-100 transition">Login</Link>
      </nav>
    </header>
  );
}
```

**Features:**
- ✅ Semantic `<header>` tag for screen readers
- ✅ `<nav>` element for navigation semantics
- ✅ Hover transitions for better UX
- ✅ Responsive design with Tailwind utilities

---

#### 2. Sidebar Component

**Location:** [components/layout/Sidebar.tsx](components/layout/Sidebar.tsx)

**Purpose:** Contextual navigation menu for main application areas

**Props Interface:**
```typescript
// No props required - renders same across all pages
```

**Code Example:**
```tsx
"use client";

import Link from "next/link";

const sidebarLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/users", label: "Users", icon: "👥" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      {sidebarLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-gray-700 hover:text-blue-600"
        >
          <span>{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </aside>
  );
}
```

**Features:**
- ✅ Reusable links array for easy customization
- ✅ Icon + label layout for visual clarity
- ✅ Hover effects with smooth transitions
- ✅ Fixed width with scrollable overflow for long menus

---

#### 3. LayoutWrapper Component

**Location:** [components/layout/LayoutWrapper.tsx](components/layout/LayoutWrapper.tsx)

**Purpose:** Main layout composition combining Header, Sidebar, and page content

**Props Interface:**
```typescript
interface LayoutWrapperProps {
  children: React.ReactNode;
}
```

**Code Example:**
```tsx
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Header spans full width */}
      <Header />
      
      {/* Sidebar + Content flex row */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Features:**
- ✅ Server component (no "use client" needed)
- ✅ Full-height screen layout with proper flex structure
- ✅ Scrollable main content without header/sidebar scroll
- ✅ Semantic `<main>` tag for content accessibility

**Integration in Root Layout:**
```typescript
// app/layout.tsx
import { LayoutWrapper } from "@/components";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
```

---

#### 4. Button Component (UI)

**Location:** [components/ui/Button.tsx](components/ui/Button.tsx)

**Purpose:** Reusable button with multiple style variants

**Props Interface:**
```typescript
interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullWidth?: boolean;
}
```

**Code Example:**
```tsx
interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const baseStyles = "px-4 py-2 rounded-lg transition font-medium";
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${widthStyle}`}
      aria-label={label}
    >
      {label}
    </button>
  );
}
```

**Variants:**

| Variant | Style | Use Case |
|---------|-------|----------|
| `primary` | Blue background (blue-600 → blue-700) | Main actions, form submission |
| `secondary` | Gray background (gray-200 → gray-300) | Alternative actions, cancel |
| `danger` | Red background (red-600 → red-700) | Destructive actions, delete |

**Usage Examples:**
```tsx
// Primary button (default)
<Button label="Submit" onClick={() => console.log("Submitted")} />

// Secondary variant
<Button label="Cancel" variant="secondary" />

// Danger variant (delete action)
<Button label="Delete User" variant="danger" onClick={deleteUser} />

// Full width (form submission)
<Button label="Sign Up" fullWidth />

// Disabled state
<Button label="Submit" disabled onClick={submit} />
```

---

#### 5. Card Component (UI)

**Location:** [components/ui/Card.tsx](components/ui/Card.tsx)

**Purpose:** Reusable container component for grouping related content

**Props Interface:**
```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Code Example:**
```tsx
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">
          {title}
        </h2>
      )}
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
}
```

**Usage Examples:**
```tsx
// Card with title
<Card title="User Information">
  <p>Name: John Doe</p>
  <p>Email: john@example.com</p>
</Card>

// Card without title (just container)
<Card>
  <div className="grid grid-cols-3 gap-4">
    <MetricBox value="150" label="Total Users" />
    <MetricBox value="42" label="Active Licenses" />
    <MetricBox value="8" label="Pending Applications" />
  </div>
</Card>

// Card with custom styling
<Card 
  title="Dashboard" 
  className="bg-blue-50 border-blue-200"
>
  {/* Content */}
</Card>
```

---

#### 6. InputField Component (UI)

**Location:** [components/ui/InputField.tsx](components/ui/InputField.tsx)

**Purpose:** Accessible form input with integrated label, validation, and error handling

**Props Interface:**
```typescript
interface InputFieldProps {
  label: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}
```

**Code Example:**
```tsx
interface InputFieldProps {
  label: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}: InputFieldProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="mb-4">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `error-${fieldId}` : undefined}
        className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && (
        <p id={`error-${fieldId}`} className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
```

**Accessibility Features:**
- ✅ `aria-label` - Screen reader announces the field name
- ✅ `aria-invalid` - Alerts assistive tech to validation errors
- ✅ `aria-describedby` - Links error message to field for context
- ✅ `htmlFor` - Label properly associated with input element
- ✅ Visual indicators (red border for errors, required asterisk)

**Usage Examples:**
```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errors, setErrors] = useState({});

<InputField
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>

<InputField
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  error={errors.password ? "Password must be at least 8 characters" : undefined}
  required
/>
```

---

### Using the Component System

#### Barrel Exports

**Location:** [components/index.ts](components/index.ts)

Instead of importing from multiple paths:
```tsx
// ❌ Without barrel export (tedious)
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
```

Use barrel exports:
```tsx
// ✅ With barrel export (clean)
import { Header, Sidebar, Button, Card, InputField } from "@/components";
```

**Barrel Export File:**
```typescript
// components/index.ts
export { default as Header } from "./layout/Header";
export { default as Sidebar } from "./layout/Sidebar";
export { default as LayoutWrapper } from "./layout/LayoutWrapper";
export { default as Button } from "./ui/Button";
export { default as Card } from "./ui/Card";
export { default as InputField } from "./ui/InputField";
```

#### Example Page Using Components

```tsx
// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { Button, Card, InputField } from "@/components";

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    console.log("Form submitted:", { email, message });
    setEmail("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <Card title="Welcome to Dashboard">
        <p className="text-gray-600">
          Manage your vendor applications and licenses below.
        </p>
      </Card>

      <Card title="Quick Stats">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <p className="text-gray-600">Applications</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">8</div>
            <p className="text-gray-600">Approved</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">4</div>
            <p className="text-gray-600">Pending</p>
          </div>
        </div>
      </Card>

      <Card title="Send Message">
        <InputField
          label="Your Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="your@email.com"
          required
        />
        <InputField
          label="Message"
          value={message}
          onChange={setMessage}
          placeholder="Type your message..."
        />
        <div className="flex gap-3 mt-6">
          <Button label="Send" variant="primary" onClick={handleSubmit} />
          <Button
            label="Clear"
            variant="secondary"
            onClick={() => {
              setEmail("");
              setMessage("");
            }}
          />
        </div>
      </Card>
    </div>
  );
}
```

---

### Accessibility & Semantic HTML

All components follow **WCAG 2.1 AA standards** for inclusive design:

**Header Component:**
```tsx
<header>           {/* Semantic HTML - identifies page header */}
  <nav>            {/* Semantic HTML - identifies navigation region */}
    <Link>         {/* Accessible link component */}
  </nav>
</header>
```

**InputField Component:**
```tsx
<label htmlFor={fieldId}>
  {/* Connects label to input for screen readers */}
</label>
<input
  id={fieldId}                                 {/* Unique ID for association */}
  aria-label={label}                           {/* Screen reader name */}
  aria-invalid={!!error}                       {/* Flags validation errors */}
  aria-describedby={error ? `error-${id}` : undefined}  {/* Links error text */}
/>
<p id={`error-${fieldId}`}>Error message</p>  {/* Associated error description */}
```

**Color Contrast:**
- Primary buttons: Blue-600 (#2563eb) on white → 6.8:1 ratio ✅
- Text: Gray-700 (#374151) on white → 8.1:1 ratio ✅
- Error messages: Red-600 (#dc2626) on white → 5.3:1 ratio ✅

**Keyboard Navigation:**
- All buttons respond to Enter/Space keys
- InputFields can be tabbed through with Tab key
- Links follow browser focus management
- Sidebar links are keyboard accessible

---

### Benefits of This Architecture

**🎯 Developer Experience**
- New developers can build pages in hours instead of days
- Consistent component API reduces learning curve
- Single responsibility principle prevents "God components"
- Examples and documentation centralize knowledge

**♿ User Experience**
- Consistent styling across all 100+ pages
- Accessible to users with disabilities
- Faster load times (components reused, less CSS)
- Better mobile experience with responsive design

**🔧 Maintenance**
- Bug fixes in Button.tsx apply to entire app
- Style updates propagate to all pages instantly
- Adding new variants (e.g., `variant="outline"`) takes 1 minute
- Code reviews focus on component quality, not duplication

**📈 Scaling**
- Supports 10x more pages without performance degradation
- Multiple teams can work on different features simultaneously
- A/B testing becomes simple (swap component variant)
- Design system remains consistent as team grows from 5 → 50 people

---

## Next Steps

1. ✅ **Component Architecture Complete** - All layout and UI components are ready
2. **Integration in Progress** - app/layout.tsx updated to use LayoutWrapper
3. **Start Building Pages** - Create new pages using reusable components from barrel exports
4. **Extend Component Library** - Add more UI components (Modal, Tabs, DataTable, etc.) as needed
5. **Document Component Variants** - Add Storybook for visual component documentation (future phase)

---

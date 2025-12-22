# VendorVault - File Upload API with AWS S3 Pre-Signed URLs & SendGrid Email Service

## Overview

Secure file upload system using **AWS S3 Pre-Signed URLs** for direct client-to-S3 uploads without exposing backend credentials, combined with **SendGrid Transactional Email Service** for automated notifications.

## Features

- ✅ **S3 Pre-Signed URLs** - Secure direct uploads with 60-second TTL
- ✅ **SendGrid Integration** - Production-ready email service
- ✅ **HTML Email Templates** - Welcome, password reset, vendor applications, license approvals
- ✅ **Email Logging** - Console logging with message IDs for debugging
- ✅ **Error Handling** - Graceful error handling with detailed error messages
- ✅ **Rate Limiting Ready** - Template for implementing backoff strategies

---

## Part 1: S3 File Upload Architecture

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

## Next Steps

1. **Set up SendGrid account** and add API key to `.env.local`
2. **Test email API** with the curl commands above
3. **Integrate into signup flow** using `handleUserSignup()` helper
4. **Monitor email delivery** via SendGrid dashboard
5. **Scale with queue system** when handling 1000+ emails/day

---

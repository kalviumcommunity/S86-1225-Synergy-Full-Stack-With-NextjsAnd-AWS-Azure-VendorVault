# VendorVault - File Upload API with AWS S3 Pre-Signed URLs

## Overview

Secure file upload system using **AWS S3 Pre-Signed URLs** for direct client-to-S3 uploads without exposing backend or credentials.

## Architecture

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

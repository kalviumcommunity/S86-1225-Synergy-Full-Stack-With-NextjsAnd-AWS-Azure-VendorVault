# AWS Certificate Manager (ACM) Setup Guide

## 🔒 SSL Certificate Configuration for VendorVault

This guide covers requesting, validating, and attaching SSL certificates using AWS Certificate Manager.

---

## Step 1: Request Certificate

### Using AWS CLI

```bash
# Request certificate with wildcard
aws acm request-certificate \
  --domain-name vendorvault.com \
  --subject-alternative-names '*.vendorvault.com' \
  --validation-method DNS \
  --region us-east-1 \
  --idempotency-token vendorvault-$(date +%s)

# Save the Certificate ARN from output
```

### Using AWS Console

1. Navigate to **AWS Certificate Manager** (ACM)
2. **Important:** Select **us-east-1** region (required for CloudFront/ALB)
3. Click **Request a certificate**
4. Select **Request a public certificate**
5. Click **Next**

**Domain names:**
- Add domain name: `vendorvault.com`
- Add another name: `*.vendorvault.com`

**Validation method:**
- Select: **DNS validation - recommended**

**Key algorithm:**
- RSA 2048 (default)

**Tags (optional):**
- Key: `Project`, Value: `VendorVault`
- Key: `Environment`, Value: `Production`

6. Click **Request**

---

## Step 2: DNS Validation

### Automatic Validation (Recommended)

1. In ACM Console → Select your certificate
2. Under **Domains**, click **Create records in Route 53**
3. ACM will automatically create CNAME records in Route 53
4. Click **Create records**
5. Wait 5-30 minutes for validation

**Status will change:**
- **Pending validation** → **Success**

### Manual Validation

```bash
# Get validation CNAME records
aws acm describe-certificate \
  --certificate-arn <CERTIFICATE_ARN> \
  --region us-east-1

# Output will show:
# Name: _abc123xyz.vendorvault.com
# Value: _def456ghi.acm-validations.aws.
```

Add CNAME records to Route 53:

```bash
# Create validation CNAME record
aws route53 change-resource-record-sets \
  --hosted-zone-id <HOSTED_ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_abc123xyz.vendorvault.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{
          "Value": "_def456ghi.acm-validations.aws."
        }]
      }
    }]
  }'
```

---

## Step 3: Verify Certificate Status

```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn <CERTIFICATE_ARN> \
  --region us-east-1 \
  --query 'Certificate.Status'

# Expected output: "ISSUED"

# Check certificate details
aws acm describe-certificate \
  --certificate-arn <CERTIFICATE_ARN> \
  --region us-east-1 \
  --output table
```

**Certificate should show:**
- Status: **Issued**
- Domain Validation Status: **Success**
- In use: **Yes** (after attaching to ALB)

---

## Step 4: Attach Certificate to Application Load Balancer

### Add HTTPS Listener

```bash
# Get ALB ARN
aws elbv2 describe-load-balancers \
  --names vendorvault-alb \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text

# Get target group ARN
aws elbv2 describe-target-groups \
  --names vendorvault-tg \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text

# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn <ALB_ARN> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<CERTIFICATE_ARN> \
  --default-actions Type=forward,TargetGroupArn=<TARGET_GROUP_ARN> \
  --ssl-policy ELBSecurityPolicy-TLS13-1-2-2021-06
```

### Via AWS Console

1. Go to **EC2** → **Load Balancers**
2. Select **vendorvault-alb**
3. Click **Listeners** tab
4. Click **Add listener**

**Listener configuration:**
- **Protocol:** HTTPS
- **Port:** 443
- **Default SSL certificate:** From ACM
- **Certificate:** Select your certificate
- **Security policy:** ELBSecurityPolicy-TLS13-1-2-2021-06 (recommended)
- **Default action:** Forward to `vendorvault-tg`

5. Click **Add**

---

## Step 5: Configure HTTP to HTTPS Redirect

### Modify HTTP Listener

```bash
# Get HTTP listener ARN
aws elbv2 describe-listeners \
  --load-balancer-arn <ALB_ARN> \
  --query 'Listeners[?Port==`80`].ListenerArn' \
  --output text

# Modify HTTP listener to redirect
aws elbv2 modify-listener \
  --listener-arn <HTTP_LISTENER_ARN> \
  --default-actions '[
    {
      "Type": "redirect",
      "RedirectConfig": {
        "Protocol": "HTTPS",
        "Port": "443",
        "StatusCode": "HTTP_301"
      }
    }
  ]'
```

### Via Console

1. Select HTTP listener (Port 80)
2. Click **Edit**
3. Remove existing default action
4. Click **Add action** → **Redirect to...**
5. **Protocol:** HTTPS
6. **Port:** 443
7. **Status code:** 301 - Permanently moved
8. Click **Save**

---

## Step 6: Update Security Group

```bash
# Allow HTTPS traffic (443)
aws ec2 authorize-security-group-ingress \
  --group-id <SECURITY_GROUP_ID> \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Verify rules
aws ec2 describe-security-groups \
  --group-ids <SECURITY_GROUP_ID> \
  --query 'SecurityGroups[0].IpPermissions'
```

**Required inbound rules:**
- **Port 80 (HTTP):** For redirects
- **Port 443 (HTTPS):** For secure traffic
- **Port 3000:** From ALB to ECS tasks (if using target groups)

---

## Step 7: Certificate Renewal

### Automatic Renewal

ACM automatically renews certificates:
- Renewal attempt: 60 days before expiration
- DNS-validated certificates renew automatically
- No manual intervention required

### Monitor Renewal Status

```bash
# Check certificate expiration
aws acm describe-certificate \
  --certificate-arn <CERTIFICATE_ARN> \
  --region us-east-1 \
  --query 'Certificate.NotAfter'

# List all certificates
aws acm list-certificates \
  --region us-east-1 \
  --certificate-statuses ISSUED EXPIRED PENDING_VALIDATION \
  --output table
```

### Set Up CloudWatch Alarm

```bash
# Create SNS topic for alerts
aws sns create-topic --name vendorvault-cert-expiry

# Subscribe email
aws sns subscribe \
  --topic-arn <TOPIC_ARN> \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create CloudWatch alarm (via EventBridge)
aws events put-rule \
  --name vendorvault-cert-renewal \
  --description "Alert on certificate renewal issues" \
  --event-pattern '{
    "source": ["aws.acm"],
    "detail-type": ["ACM Certificate Approaching Expiration"]
  }'
```

---

## Verification Commands

```bash
# Test SSL certificate
openssl s_client -connect vendorvault.com:443 -servername vendorvault.com

# Check certificate chain
openssl s_client -showcerts -connect vendorvault.com:443 </dev/null

# Check expiration date
echo | openssl s_client -servername vendorvault.com \
  -connect vendorvault.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Test HTTPS redirect
curl -I http://vendorvault.com
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://vendorvault.com/
```

---

## SSL Security Best Practices

### 1. Use Latest TLS Policy

**Recommended:** `ELBSecurityPolicy-TLS13-1-2-2021-06`

```bash
# Update listener SSL policy
aws elbv2 modify-listener \
  --listener-arn <HTTPS_LISTENER_ARN> \
  --ssl-policy ELBSecurityPolicy-TLS13-1-2-2021-06
```

**Features:**
- TLS 1.3 and 1.2 only
- Strong cipher suites
- Forward secrecy
- A+ rating on SSL Labs

### 2. Enable HSTS

Already configured in `next.config.ts`:
```typescript
{
  key: "Strict-Transport-Security",
  value: "max-age=63072000; includeSubDomains; preload"
}
```

### 3. Certificate Transparency Logging

ACM automatically logs certificates to Certificate Transparency logs.

### 4. Monitor Certificate Health

```bash
# Create custom metric for certificate days until expiry
aws cloudwatch put-metric-data \
  --namespace VendorVault \
  --metric-name CertificateDaysUntilExpiry \
  --value <DAYS> \
  --unit Count
```

---

## Troubleshooting

### Certificate Stuck in "Pending Validation"

**Check:**
1. CNAME records created in Route 53
2. DNS propagation complete (`dig _validation.vendorvault.com`)
3. No CAA records blocking Amazon
4. Waiting time (up to 30 minutes)

**Solution:**
```bash
# Verify DNS record exists
dig _abc123xyz.vendorvault.com CNAME +short

# Force DNS cache clear
dig _abc123xyz.vendorvault.com @8.8.8.8 CNAME
```

### HTTPS Not Working After Certificate Attached

**Check:**
1. HTTPS listener created on ALB (port 443)
2. Security group allows port 443
3. Certificate ARN correct
4. Target group health checks passing

**Solution:**
```bash
# Verify listener exists
aws elbv2 describe-listeners \
  --load-balancer-arn <ALB_ARN> \
  --query 'Listeners[?Port==`443`]'

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN>
```

### Certificate Renewal Failed

**Possible causes:**
- DNS validation records deleted
- Route 53 hosted zone deleted
- CAA records added blocking Amazon

**Solution:**
1. Check ACM console for renewal status
2. Verify DNS validation records still exist
3. Request new certificate if needed

---

## Cost Information

**AWS Certificate Manager:**
- ✅ **FREE** for public SSL/TLS certificates
- ✅ Unlimited certificates
- ✅ Automatic renewal included
- ✅ No charge for data transfer

**Associated costs:**
- Route 53: $0.50/month per hosted zone
- ALB: ~$20/month (separate from certificates)
- Data transfer: Standard AWS rates

---

## Certificate ARN Template

**Save this for reference:**

```bash
# Production Certificate
CERTIFICATE_ARN="arn:aws:acm:us-east-1:123456789012:certificate/abc-123-xyz"

# Add to ECS task definition environment
{
  "name": "CERTIFICATE_ARN",
  "value": "arn:aws:acm:us-east-1:123456789012:certificate/abc-123-xyz"
}
```

---

## Multi-Environment Certificates

### Production
```bash
Domain: vendorvault.com
Wildcard: *.vendorvault.com
Region: us-east-1
```

### Staging
```bash
Domain: staging.vendorvault.com
Wildcard: *.staging.vendorvault.com
Region: us-east-1
```

### Development
```bash
Domain: dev.vendorvault.com
Region: us-east-1
```

---

**Last Updated:** January 1, 2026  
**Certificate Provider:** AWS Certificate Manager  
**Auto-renewal:** Enabled ✅

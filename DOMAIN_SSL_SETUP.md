# VendorVault - Domain & SSL Setup Guide

## 🔒 Complete Guide to Custom Domain and HTTPS Configuration

This guide covers the complete setup of a custom domain with SSL/TLS certificates for VendorVault, ensuring secure HTTPS connections for your production deployment.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [AWS Route 53 & ACM Setup](#aws-route-53--acm-setup)
- [Azure DNS & SSL Setup](#azure-dns--ssl-setup)
- [HTTPS Configuration](#https-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Reflection](#reflection)

---

## 🎯 Overview

### What You'll Accomplish

✅ Configure custom domain (e.g., `vendorvault.com`)  
✅ Set up DNS records (A, CNAME, TXT)  
✅ Issue and apply SSL/TLS certificates  
✅ Enable HTTPS with automatic HTTP redirect  
✅ Verify secure connection (🔒 padlock icon)  
✅ Automate certificate renewal  

### Understanding DNS and SSL

| Component | Purpose | Example |
|-----------|---------|---------|
| **DNS (Domain Name System)** | Maps human-readable domain to IP/load balancer | `vendorvault.com` → Load Balancer IP |
| **SSL/TLS Certificate** | Encrypts traffic between users and your app | HTTPS with 🔒 padlock |
| **HTTPS Redirect** | Forces secure connections | `http://` → `https://` |
| **Certificate Authority** | Issues trusted SSL certificates | AWS ACM / Let's Encrypt |

### Benefits

- 🔒 **Security**: Encrypted data transmission
- 🔍 **SEO**: Google ranks HTTPS sites higher
- ✅ **Trust**: Users see verified secure connection
- 📱 **Compliance**: Required for PWAs and modern web APIs
- 🚀 **Performance**: HTTP/2 and HTTP/3 require HTTPS

---

## 📝 Prerequisites

### Domain Registration

**Option 1: Use Existing Domain**
- Domain registered with any registrar (GoDaddy, Namecheap, Google Domains)
- Access to DNS management panel

**Option 2: Register New Domain**
- **AWS Route 53**: Register directly ($12-20/year)
- **Azure App Service Domains**: Register through Azure
- **Third-party registrars**: Namecheap, Google Domains, etc.

### Deployment Requirements

- ✅ Application deployed to AWS ECS or Azure App Service
- ✅ Load balancer or public IP address available
- ✅ Application accessible via cloud-provided URL
- ✅ DNS propagation time (up to 48 hours)

### Access Requirements

- AWS Account with IAM permissions for Route 53, ACM, ECS
- Azure Account with permissions for DNS, App Service, Certificates
- Domain registrar login credentials

---

## ☁️ AWS Route 53 & ACM Setup

### Step 1: Create Hosted Zone in Route 53

#### 1.1 Create Hosted Zone

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name vendorvault.com \
  --caller-reference $(date +%s) \
  --hosted-zone-config Comment="VendorVault production domain"

# Get nameservers
aws route53 get-hosted-zone --id <hosted-zone-id>
```

**Via AWS Console:**
1. Go to **Route 53** → **Hosted Zones**
2. Click **Create Hosted Zone**
3. Enter domain name: `vendorvault.com`
4. Type: **Public Hosted Zone**
5. Click **Create**
6. Note the 4 nameservers (NS records)

#### 1.2 Update Domain Nameservers

**At your domain registrar:**
1. Log in to your domain registrar
2. Go to DNS Management / Nameservers
3. Replace existing nameservers with Route 53 NS records:
   ```
   ns-1234.awsdns-12.org
   ns-5678.awsdns-34.com
   ns-9012.awsdns-56.net
   ns-3456.awsdns-78.co.uk
   ```
4. Save changes (propagation: 24-48 hours)

**Verify nameserver update:**
```bash
# Check nameservers
dig vendorvault.com NS +short

# Or using nslookup
nslookup -type=NS vendorvault.com
```

---

### Step 2: Create DNS Records

#### 2.1 A Record for Root Domain

**Points to:** ECS Application Load Balancer

```bash
# Get your ALB DNS name
aws elbv2 describe-load-balancers \
  --names vendorvault-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text

# Create A record (alias to ALB)
aws route53 change-resource-record-sets \
  --hosted-zone-id <hosted-zone-id> \
  --change-batch file://dns-records-root.json
```

**dns-records-root.json:**
```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "vendorvault.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<alb-hosted-zone-id>",
          "DNSName": "<alb-dns-name>",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
```

**Via AWS Console:**
1. In Route 53 Hosted Zone → **Create Record**
2. **Record name:** Leave blank (root domain)
3. **Record type:** A
4. **Alias:** Yes
5. **Route traffic to:** Application Load Balancer
6. **Region:** Select your region
7. **Load balancer:** Select your ALB
8. Click **Create records**

#### 2.2 CNAME Record for www Subdomain

```bash
# Create CNAME record
aws route53 change-resource-record-sets \
  --hosted-zone-id <hosted-zone-id> \
  --change-batch file://dns-records-www.json
```

**dns-records-www.json:**
```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.vendorvault.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "vendorvault.com"
          }
        ]
      }
    }
  ]
}
```

**Via Console:**
1. Create Record → **Record name:** `www`
2. **Type:** CNAME
3. **Value:** `vendorvault.com`
4. **TTL:** 300 seconds

#### 2.3 Additional Records (Optional)

**API Subdomain:**
```json
{
  "Name": "api.vendorvault.com",
  "Type": "CNAME",
  "Value": "vendorvault.com"
}
```

**Staging Environment:**
```json
{
  "Name": "staging.vendorvault.com",
  "Type": "CNAME",
  "Value": "<staging-alb-dns>"
}
```

---

### Step 3: Request SSL Certificate (AWS ACM)

#### 3.1 Request Certificate

```bash
# Request certificate for domain and wildcard
aws acm request-certificate \
  --domain-name vendorvault.com \
  --subject-alternative-names '*.vendorvault.com' \
  --validation-method DNS \
  --region us-east-1

# Get certificate ARN
aws acm list-certificates --region us-east-1
```

**Via AWS Console:**
1. Go to **AWS Certificate Manager** (ACM)
2. **Important:** Must be in **us-east-1** region for CloudFront/ALB
3. Click **Request a certificate**
4. **Certificate type:** Public certificate
5. **Domain names:**
   - `vendorvault.com`
   - `*.vendorvault.com` (wildcard for subdomains)
6. **Validation method:** DNS validation
7. Click **Request**

#### 3.2 Complete DNS Validation

**ACM will provide a CNAME record for validation:**

```bash
# Get validation records
aws acm describe-certificate \
  --certificate-arn <cert-arn> \
  --region us-east-1

# Add CNAME record to Route 53 (automatic via console)
```

**Via Console:**
1. In ACM → Select your certificate
2. Click **Create records in Route 53** (easiest method)
3. ACM automatically adds validation CNAME to Route 53
4. Wait 5-30 minutes for validation
5. Status changes: **Pending** → **Issued**

**Manual CNAME Record:**
```
Name: _abc123.vendorvault.com
Type: CNAME
Value: _xyz789.acm-validations.aws.
```

---

### Step 4: Attach Certificate to Load Balancer

#### 4.1 Add HTTPS Listener

```bash
# Add HTTPS listener to ALB
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<cert-arn> \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

**Via Console:**
1. Go to **EC2** → **Load Balancers**
2. Select your ALB → **Listeners** tab
3. Click **Add listener**
4. **Protocol:** HTTPS
5. **Port:** 443
6. **Default SSL certificate:** Select your ACM certificate
7. **Default actions:** Forward to target group
8. Click **Add**

#### 4.2 Configure HTTP to HTTPS Redirect

```bash
# Modify HTTP listener to redirect
aws elbv2 modify-listener \
  --listener-arn <http-listener-arn> \
  --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'
```

**Via Console:**
1. Select HTTP listener (port 80)
2. Click **Edit**
3. Remove default action
4. Add action: **Redirect to**
5. **Protocol:** HTTPS
6. **Port:** 443
7. **Status code:** 301 (Permanent redirect)
8. Click **Save**

---

### Step 5: Update ECS Task Definition (Optional)

**Add environment variables:**

```json
{
  "name": "NEXTAUTH_URL",
  "value": "https://vendorvault.com"
},
{
  "name": "ALLOWED_ORIGINS",
  "value": "https://vendorvault.com,https://www.vendorvault.com"
}
```

---

## 🌐 Azure DNS & SSL Setup

### Step 1: Create DNS Zone

#### 1.1 Create DNS Zone in Azure

```bash
# Create DNS Zone
az network dns zone create \
  --resource-group vendorvault-rg \
  --name vendorvault.com

# Get nameservers
az network dns zone show \
  --resource-group vendorvault-rg \
  --name vendorvault.com \
  --query nameServers
```

**Via Azure Portal:**
1. Go to **DNS zones** → **+ Create**
2. **Resource group:** vendorvault-rg
3. **Name:** vendorvault.com
4. **Location:** Global
5. Click **Review + Create**
6. Note the nameservers (4 NS records)

#### 1.2 Update Domain Nameservers

Update your domain registrar with Azure nameservers:
```
ns1-01.azure-dns.com
ns2-01.azure-dns.net
ns3-01.azure-dns.org
ns4-01.azure-dns.info
```

---

### Step 2: Create DNS Records

#### 2.1 A Record for Root Domain

```bash
# Get App Service IP
az webapp show \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --query outboundIpAddresses

# Create A record
az network dns record-set a add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name '@' \
  --ipv4-address <app-service-ip>
```

**Via Portal:**
1. DNS Zone → **+ Record set**
2. **Name:** @ (root)
3. **Type:** A
4. **IP address:** Your App Service IP
5. Click **OK**

#### 2.2 CNAME for www

```bash
# Create CNAME
az network dns record-set cname set-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'www' \
  --cname vendorvault.com
```

#### 2.3 TXT Record for Verification (Required)

```bash
# Get verification ID
az webapp show \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --query customDomainVerificationId

# Create TXT record
az network dns record-set txt add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'asuid' \
  --value '<verification-id>'
```

---

### Step 3: Configure Custom Domain in App Service

#### 3.1 Add Custom Domain

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name vendorvault-app \
  --resource-group vendorvault-rg \
  --hostname vendorvault.com

# Add www subdomain
az webapp config hostname add \
  --webapp-name vendorvault-app \
  --resource-group vendorvault-rg \
  --hostname www.vendorvault.com
```

**Via Portal:**
1. Go to **App Service** → **Custom domains**
2. Click **+ Add custom domain**
3. **Domain provider:** Azure DNS / External
4. **TLS/SSL certificate:** Will add in next step
5. **Hostname:** vendorvault.com
6. Click **Validate** → **Add**

---

### Step 4: Create and Bind SSL Certificate

#### 4.1 Create App Service Managed Certificate (Free)

```bash
# Create managed certificate
az webapp config ssl create \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --hostname vendorvault.com

# Bind certificate
az webapp config ssl bind \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

**Via Portal:**
1. App Service → **TLS/SSL settings**
2. **Private Key Certificates (.pfx)**
3. Click **+ Create App Service Managed Certificate**
4. Select domain: vendorvault.com
5. Click **Create**
6. Go to **Custom domains**
7. Click **Add binding** for each domain
8. Select certificate
9. **TLS/SSL Type:** SNI SSL
10. Click **Add**

**Repeat for www.vendorvault.com**

#### 4.2 Alternative: Upload Custom Certificate

```bash
# Upload PFX certificate
az webapp config ssl upload \
  --certificate-file certificate.pfx \
  --certificate-password <password> \
  --name vendorvault-app \
  --resource-group vendorvault-rg
```

---

### Step 5: Enable HTTPS Only

```bash
# Force HTTPS
az webapp update \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --https-only true
```

**Via Portal:**
1. App Service → **TLS/SSL settings**
2. **HTTPS Only:** ON
3. Save changes

---

## 🔐 HTTPS Configuration

### Update Next.js Configuration

**Read current config:**

```bash
# Check current next.config.ts
cat vendorvault/next.config.ts
```

**Update for HTTPS redirect and security headers:**

See updated configuration in [vendorvault/next.config.ts](vendorvault/next.config.ts)

Key additions:
- HTTPS redirects
- Security headers (HSTS, CSP)
- Domain configuration

---

### Application-Level Security

#### Update Environment Variables

```bash
# Production environment
NEXTAUTH_URL=https://vendorvault.com
NEXT_PUBLIC_API_URL=https://vendorvault.com/api
ALLOWED_ORIGINS=https://vendorvault.com,https://www.vendorvault.com
```

#### CORS Configuration

```typescript
// In API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://vendorvault.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

---

## ✅ Verification

### Step 1: DNS Propagation Check

```bash
# Check A record
dig vendorvault.com +short

# Check CNAME
dig www.vendorvault.com +short

# Check nameservers
dig vendorvault.com NS +short

# Online tools
# https://dnschecker.org
# https://www.whatsmydns.net
```

**Expected Results:**
- A record returns Load Balancer IP or ALIAS
- CNAME returns root domain
- NS records show Route 53 or Azure nameservers

---

### Step 2: SSL Certificate Verification

#### Browser Check
1. Visit `https://vendorvault.com`
2. Look for 🔒 padlock icon in address bar
3. Click padlock → **Certificate is valid**
4. Check certificate details:
   - Issued to: vendorvault.com
   - Issued by: Amazon / Let's Encrypt / DigiCert
   - Valid from/to dates

#### Command Line Check

```bash
# Check SSL certificate
openssl s_client -connect vendorvault.com:443 -servername vendorvault.com

# Check SSL expiry
echo | openssl s_client -servername vendorvault.com -connect vendorvault.com:443 2>/dev/null | openssl x509 -noout -dates
```

#### Online SSL Test

```bash
# Visit these tools:
https://www.ssllabs.com/ssltest/analyze.html?d=vendorvault.com
https://www.whynopadlock.com/
```

**Target Grade:** A or A+

---

### Step 3: HTTPS Redirect Test

```bash
# Test HTTP to HTTPS redirect
curl -I http://vendorvault.com

# Expected response:
HTTP/1.1 301 Moved Permanently
Location: https://vendorvault.com/
```

**Verify in browser:**
1. Type `http://vendorvault.com` (without https)
2. Should automatically redirect to `https://vendorvault.com`
3. Check address bar shows HTTPS

---

### Step 4: Security Headers Check

```bash
# Check security headers
curl -I https://vendorvault.com

# Expected headers:
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

**Online tools:**
```
https://securityheaders.com/
https://observatory.mozilla.org/
```

---

### Step 5: Complete Application Test

**Functional tests:**
- ✅ Homepage loads over HTTPS
- ✅ API endpoints work
- ✅ Authentication functions
- ✅ File uploads work
- ✅ All resources load securely (no mixed content)

**Browser DevTools Check:**
1. Open DevTools (F12)
2. **Console tab:** No mixed content warnings
3. **Network tab:** All requests use HTTPS
4. **Security tab:** "This page is secure"

---

## 🔧 Troubleshooting

### DNS Issues

**Problem:** Domain doesn't resolve
```bash
# Check propagation
dig vendorvault.com +trace

# Verify nameservers at registrar
whois vendorvault.com | grep "Name Server"
```

**Solution:**
- Wait 24-48 hours for DNS propagation
- Verify nameservers updated at registrar
- Clear DNS cache: `ipconfig /flushdns` (Windows)

---

### SSL Certificate Issues

**Problem:** Certificate not issued

**AWS ACM:**
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn <arn>
```

**Solutions:**
- Verify CNAME validation record in Route 53
- Ensure domain ownership
- Check for CAA records blocking issuance

**Problem:** Certificate mismatch error

**Solution:**
- Ensure certificate includes www and root domain
- Use wildcard: `*.vendorvault.com`
- Clear browser cache and cookies

---

### Mixed Content Warnings

**Problem:** Some resources load over HTTP

**Solution:**
```javascript
// Update all URLs to relative or HTTPS
// Bad:
src="http://example.com/image.jpg"

// Good:
src="https://example.com/image.jpg"
// Or relative:
src="/images/logo.jpg"
```

---

### HTTPS Redirect Loop

**Problem:** Infinite redirect

**Solution:**
- Check X-Forwarded-Proto header handling
- Ensure only one redirect rule (either ALB or app)
- Clear browser cache

---

## 📊 Multi-Environment Setup

### Environment Strategy

| Environment | Domain | Certificate | Purpose |
|-------------|--------|-------------|---------|
| **Production** | vendorvault.com | ACM/App Service | Live app |
| **Staging** | staging.vendorvault.com | ACM/App Service | Testing |
| **Development** | dev.vendorvault.com | ACM/App Service | Development |
| **API** | api.vendorvault.com | ACM/App Service | API endpoints |

### Route 53 Configuration

```json
{
  "vendorvault.com": "→ Production ALB",
  "www.vendorvault.com": "→ CNAME to root",
  "staging.vendorvault.com": "→ Staging ALB",
  "api.vendorvault.com": "→ API Gateway"
}
```

---

## 💰 Cost Considerations

### AWS Route 53
- **Hosted Zone:** $0.50/month per zone
- **DNS Queries:** $0.40 per million queries
- **ACM Certificates:** FREE (public certificates)

### Azure DNS
- **DNS Zone:** $0.50/month per zone
- **DNS Queries:** $0.40 per million queries
- **App Service Managed Certificate:** FREE
- **Custom Certificate:** $69.99/year (optional)

### Domain Registration
- **.com domain:** $12-20/year
- **Premium domains:** Varies widely

---

## 🔄 Certificate Renewal

### AWS ACM
- ✅ **Automatic renewal** for DNS-validated certificates
- ACM renews 60 days before expiration
- No manual intervention required
- Email notifications if renewal fails

**Monitor expiration:**
```bash
aws acm describe-certificate --certificate-arn <arn> \
  --query 'Certificate.NotAfter'
```

### Azure App Service Managed Certificate
- ✅ **Automatic renewal** every 6 months
- Azure handles renewal automatically
- Synced with App Service lifecycle
- No action required

### Best Practices
- Set up CloudWatch/Azure Monitor alerts
- Monitor certificate expiration dates
- Test renewal process in staging
- Document manual renewal procedure as backup

---

## 🎓 Reflection & Learnings

### DNS Management Insights

**1. DNS Propagation Time**
- Full propagation can take 24-48 hours
- Use lower TTL during migration (300s)
- Increase TTL after stable (3600s or higher)
- Plan domain changes during low-traffic periods

**2. Hosted Zone vs Domain Registrar**
- Hosted Zone manages DNS records (Route 53/Azure DNS)
- Domain Registrar owns domain registration
- Can separate registrar and DNS provider
- Benefits: Better performance, advanced features, integration

**3. Alias vs CNAME Records**
- **AWS Alias:** Free, apex domain support, faster
- **CNAME:** Standard, requires subdomain, charged
- Use Alias for root domain on AWS
- Use A record for Azure App Service

---

### SSL/TLS Best Practices

**1. Certificate Types**
- **Single domain:** vendorvault.com only
- **Wildcard:** *.vendorvault.com (all subdomains)
- **Multi-domain:** vendorvault.com + example.com
- **Recommendation:** Use wildcard for flexibility

**2. Validation Methods**
- **DNS validation:** Automatic, no email required (preferred)
- **Email validation:** Manual, requires inbox access
- **HTTP validation:** Requires web server access

**3. Security Headers**
- **HSTS:** Forces HTTPS for future visits
- **CSP:** Prevents XSS attacks
- **X-Frame-Options:** Prevents clickjacking
- **Impact:** Improves security score and SEO

---

### Production Readiness Considerations

**1. Monitoring & Alerts**
- Set up certificate expiration alerts
- Monitor DNS query failures
- Track SSL/TLS handshake errors
- Alert on HTTP 502/503 errors after domain changes

**2. Backup & Recovery**
- Document all DNS records
- Export Route 53/Azure DNS configurations
- Keep backup of custom certificates
- Test disaster recovery procedure

**3. Performance Impact**
- SSL/TLS adds ~100ms latency (initial handshake)
- HTTP/2 over HTTPS improves performance
- Use CDN (CloudFront/Azure CDN) for edge caching
- Enable OCSP stapling for faster certificate validation

**4. Compliance & Trust**
- HTTPS required for: PWAs, Geolocation, Camera access
- GDPR compliance requires encrypted transmission
- PCI-DSS requires SSL for payment processing
- Builds user trust and confidence

---

### Multi-Environment Strategy

**1. Subdomain Organization**
```
Production:   vendorvault.com, www.vendorvault.com
Staging:      staging.vendorvault.com
Development:  dev.vendorvault.com
API:          api.vendorvault.com
Docs:         docs.vendorvault.com
Status:       status.vendorvault.com
```

**2. Certificate Management**
- One wildcard certificate covers all subdomains
- Separate certificates for different root domains
- Use automation for multi-cert deployments

**3. Environment Isolation**
- Different VPCs/Resource Groups per environment
- Separate databases and secrets
- Blue-green deployment for zero downtime

---

### Cost Optimization

**1. DNS Costs**
- Hosted zones: Fixed monthly cost
- Queries: Volume-based (usually negligible)
- Use Route 53 health checks sparingly
- Consider multi-zone redundancy carefully

**2. Certificate Costs**
- Use free ACM/App Service certificates
- Avoid premium CA certificates unless required
- Wildcard certificates more cost-effective
- Let's Encrypt free alternative for non-cloud

**3. Automation ROI**
- Initial setup time: 2-4 hours
- Manual renewal: 30 minutes/year
- Automation saves time and prevents downtime
- Focus effort on critical environments

---

## 📝 Documentation Checklist

For your README.md, include:

- [ ] Domain name and DNS provider
- [ ] DNS record configuration table
- [ ] SSL certificate provider and type
- [ ] Screenshot: Route 53/Azure DNS records
- [ ] Screenshot: SSL certificate status (Issued)
- [ ] Screenshot: Browser with HTTPS and padlock
- [ ] Screenshot: SSL Labs test result (Grade A/A+)
- [ ] Renewal automation details
- [ ] Multi-environment routing strategy
- [ ] Security headers configuration
- [ ] Troubleshooting notes
- [ ] Cost breakdown
- [ ] Reflection on DNS and SSL setup

---

## 🔗 Additional Resources

### AWS Documentation
- [Route 53 Getting Started](https://docs.aws.amazon.com/route53/)
- [ACM User Guide](https://docs.aws.amazon.com/acm/)
- [ELB HTTPS Listeners](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html)

### Azure Documentation
- [Azure DNS Overview](https://docs.microsoft.com/azure/dns/)
- [App Service Custom Domain](https://docs.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain)
- [SSL Certificates](https://docs.microsoft.com/azure/app-service/configure-ssl-certificate)

### Tools
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL configuration test
- [DNS Checker](https://dnschecker.org/) - DNS propagation check
- [Security Headers](https://securityheaders.com/) - Security headers analysis
- [Why No Padlock](https://www.whynopadlock.com/) - Mixed content detection

---

**Last Updated:** January 1, 2026  
**VendorVault:** Custom Domain & SSL Configuration  
**Status:** Production Ready 🔒

# Azure App Service SSL Certificate Setup Guide

## 🔒 SSL/TLS Configuration for VendorVault on Azure

This guide covers configuring SSL certificates for custom domains in Azure App Service.

---

## Prerequisites

- Azure App Service created and running
- Custom domain configured in Azure DNS
- DNS records propagated
- App Service domain verification completed

---

## Step 1: Add Custom Domain to App Service

### Using Azure CLI

```bash
# Get custom domain verification ID
az webapp show \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --query customDomainVerificationId \
  --output tsv

# Add root domain
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

### Using Azure Portal

1. Go to **App Services** → Select `vendorvault-app`
2. Click **Custom domains** in left menu
3. Click **+ Add custom domain**
4. **Domain provider:** Select appropriate option
5. **TLS/SSL certificate:** Select "Add later"
6. **Hostname:** Enter `vendorvault.com`
7. Click **Validate**
8. Ensure validation checks pass (A record, TXT record)
9. Click **Add**
10. Repeat for `www.vendorvault.com`

---

## Step 2: Create App Service Managed Certificate (FREE)

### Option A: App Service Managed Certificate (Recommended)

**Benefits:**
- ✅ Completely FREE
- ✅ Automatic renewal every 6 months
- ✅ Managed by Azure
- ✅ No manual intervention

**Limitations:**
- Only for verified custom domains
- Not exportable
- Bound to App Service lifecycle

```bash
# Create managed certificate for root domain
az webapp config ssl create \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --hostname vendorvault.com

# Create managed certificate for www
az webapp config ssl create \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --hostname www.vendorvault.com

# List certificates
az webapp config ssl list \
  --resource-group vendorvault-rg \
  --output table
```

### Via Azure Portal

1. App Service → **TLS/SSL settings**
2. Click **Private Key Certificates (.pfx)** tab
3. Click **+ Create App Service Managed Certificate**
4. **Custom domain:** Select `vendorvault.com` from dropdown
5. Click **Create**
6. Wait for certificate creation (1-2 minutes)
7. Repeat for `www.vendorvault.com`

**Certificate status:**
- Processing → **Healthy**

---

## Step 3: Bind SSL Certificate to Domain

### Using Azure CLI

```bash
# Get certificate thumbprint
CERT_THUMBPRINT=$(az webapp config ssl list \
  --resource-group vendorvault-rg \
  --query "[?name=='vendorvault.com'].thumbprint" \
  --output tsv)

# Bind certificate to hostname
az webapp config ssl bind \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --certificate-thumbprint $CERT_THUMBPRINT \
  --ssl-type SNI

# Bind www certificate
WWW_CERT_THUMBPRINT=$(az webapp config ssl list \
  --resource-group vendorvault-rg \
  --query "[?name=='www.vendorvault.com'].thumbprint" \
  --output tsv)

az webapp config ssl bind \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --certificate-thumbprint $WWW_CERT_THUMBPRINT \
  --ssl-type SNI
```

### Via Azure Portal

1. Go to **Custom domains**
2. Find `vendorvault.com` in the list
3. Click **Add binding**
4. **Private Certificate Thumbprint:** Select your managed certificate
5. **TLS/SSL Type:** **SNI SSL** (recommended)
6. Click **Add Binding**
7. Repeat for `www.vendorvault.com`

**SSL Status should show:**
- 🔒 Secured

---

## Step 4: Enable HTTPS Only

### Force HTTPS Redirect

```bash
# Enable HTTPS only
az webapp update \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --https-only true

# Verify setting
az webapp show \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --query httpsOnly
```

### Via Portal

1. App Service → **TLS/SSL settings**
2. **HTTPS Only:** Toggle to **On**
3. Click **Save**

**Effect:**
- All HTTP requests automatically redirect to HTTPS
- HTTP → HTTPS (301 Permanent Redirect)

---

## Step 5: Configure Minimum TLS Version

### Set TLS 1.2 as Minimum

```bash
# Set minimum TLS version
az webapp config set \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --min-tls-version 1.2

# Verify
az webapp config show \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --query minTlsVersion
```

### Via Portal

1. TLS/SSL settings → **Protocol Settings**
2. **Minimum TLS Version:** Select **1.2**
3. Click **Save**

**Recommendation:** TLS 1.2 or higher for security

---

## Option B: Upload Custom Certificate

### If You Have Your Own Certificate

```bash
# Upload PFX certificate
az webapp config ssl upload \
  --certificate-file /path/to/certificate.pfx \
  --certificate-password <PASSWORD> \
  --name vendorvault-app \
  --resource-group vendorvault-rg

# Bind uploaded certificate
az webapp config ssl bind \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --certificate-thumbprint <THUMBPRINT> \
  --ssl-type SNI
```

### Generate Self-Signed Certificate (Development Only)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes \
  -subj "/CN=vendorvault.com"

# Convert to PFX
openssl pkcs12 -export \
  -out certificate.pfx \
  -inkey key.pem \
  -in cert.pem \
  -password pass:YourPassword
```

**⚠️ Warning:** Self-signed certificates not trusted by browsers. Use only for testing.

---

## Step 6: Configure Custom Domain DNS (If Not Done)

### Azure DNS Records Required

```bash
# A Record pointing to App Service IP
az network dns record-set a add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name '@' \
  --ipv4-address <APP_SERVICE_IP>

# CNAME for www
az network dns record-set cname set-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'www' \
  --cname vendorvault.com

# TXT record for verification
az network dns record-set txt add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'asuid' \
  --value '<VERIFICATION_ID>'

# TXT record for www verification
az network dns record-set txt add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'asuid.www' \
  --value '<VERIFICATION_ID>'
```

---

## Step 7: Certificate Renewal

### Automatic Renewal (Managed Certificates)

**App Service Managed Certificates:**
- ✅ Renew automatically every **6 months**
- ✅ No manual action required
- ✅ Renewal happens 1 month before expiration
- ✅ Email notifications if renewal fails

### Monitor Certificate Status

```bash
# Check certificate expiration
az webapp config ssl list \
  --resource-group vendorvault-rg \
  --query "[].{hostname:name, expiry:expirationDate, thumbprint:thumbprint}" \
  --output table

# Check specific certificate
az webapp config ssl show \
  --resource-group vendorvault-rg \
  --certificate-thumbprint <THUMBPRINT>
```

### Set Up Alerts

```bash
# Create action group for notifications
az monitor action-group create \
  --name vendorvault-ssl-alerts \
  --resource-group vendorvault-rg \
  --short-name ssl-alert \
  --email-receiver name=admin email=admin@example.com

# Create alert rule (via Portal recommended)
# Monitor → Alerts → New alert rule
# Resource: App Service
# Condition: Certificate near expiration
```

---

## Step 8: Verify SSL Configuration

### Browser Verification

1. Visit `https://vendorvault.com`
2. Check for 🔒 padlock icon
3. Click padlock → View certificate
4. Verify:
   - Issued to: vendorvault.com
   - Issuer: Microsoft Azure TLS Issuing CA
   - Valid dates
   - No security warnings

### Command Line Verification

```bash
# Test SSL certificate
openssl s_client -connect vendorvault.com:443 -servername vendorvault.com

# Check certificate details
echo | openssl s_client -showcerts -servername vendorvault.com \
  -connect vendorvault.com:443 2>/dev/null | \
  openssl x509 -inform pem -noout -text

# Test HTTPS redirect
curl -I http://vendorvault.com
# Should return: HTTP/1.1 301 Moved Permanently

# Test HTTPS
curl -I https://vendorvault.com
# Should return: HTTP/2 200
```

### Online SSL Testing

Visit these tools:
```
https://www.ssllabs.com/ssltest/analyze.html?d=vendorvault.com
https://www.whynopadlock.com/
https://securityheaders.com/?q=vendorvault.com
```

**Target Grade:** A or A+

---

## Troubleshooting

### Custom Domain Not Showing in Certificate Dropdown

**Cause:** Domain not added or not validated

**Solution:**
```bash
# Verify domain is added
az webapp config hostname list \
  --resource-group vendorvault-rg \
  --webapp-name vendorvault-app

# Check validation status
az webapp config hostname list \
  --resource-group vendorvault-rg \
  --webapp-name vendorvault-app \
  --query "[].{name:name, validation:customDomainVerificationStatus}"
```

### Certificate Creation Failed

**Common issues:**
1. Domain not validated (check TXT record)
2. A record not pointing to App Service
3. App Service tier too low (requires Basic or higher)
4. Domain already has certificate

**Solution:**
```bash
# Verify App Service tier
az appservice plan show \
  --name vendorvault-plan \
  --resource-group vendorvault-rg \
  --query sku.tier

# Must be: Basic, Standard, Premium, or Isolated
```

### HTTPS Shows "Not Secure" Warning

**Check:**
1. Certificate binding completed
2. Certificate not expired
3. No mixed content (HTTP resources on HTTPS page)
4. Domain matches certificate

**Solution:**
```bash
# Verify binding
az webapp config ssl list \
  --resource-group vendorvault-rg \
  --query "[].{domain:name, thumbprint:thumbprint}"

# Rebind if needed
az webapp config ssl bind \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --certificate-thumbprint <THUMBPRINT> \
  --ssl-type SNI
```

---

## App Service Tier Requirements

| Tier | Custom Domain | Free SSL | SNI SSL | IP-based SSL |
|------|---------------|----------|---------|--------------|
| **Free** | ❌ | ❌ | ❌ | ❌ |
| **Shared** | ✅ | ❌ | ❌ | ❌ |
| **Basic** | ✅ | ✅ | ✅ | ❌ |
| **Standard** | ✅ | ✅ | ✅ | ✅ |
| **Premium** | ✅ | ✅ | ✅ | ✅ |

**Recommendation:** Basic tier minimum for production with SSL

---

## Cost Information

### App Service Managed Certificate
- ✅ **FREE** - No additional cost
- Included with Basic tier and above
- Automatic renewal included

### App Service Pricing (India Central)
- **Basic B1:** ~₹2,500/month
- **Standard S1:** ~₹5,000/month
- **Premium P1v3:** ~₹11,000/month

### Additional Costs
- Azure DNS Zone: $0.50/month
- Bandwidth: Standard rates
- Custom certificates: $0 (if using managed certificates)

---

## Security Best Practices

### 1. Enable HTTPS Only
```bash
az webapp update --https-only true \
  --resource-group vendorvault-rg \
  --name vendorvault-app
```

### 2. Set Minimum TLS 1.2
```bash
az webapp config set --min-tls-version 1.2 \
  --resource-group vendorvault-rg \
  --name vendorvault-app
```

### 3. Configure HSTS Headers
Already configured in `next.config.ts`

### 4. Enable Client Certificate Authentication (Optional)
```bash
az webapp update \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --client-cert-enabled true
```

### 5. Use Managed Identities for Secrets
```bash
# Enable managed identity
az webapp identity assign \
  --resource-group vendorvault-rg \
  --name vendorvault-app
```

---

## Multi-Domain Configuration

### Add Multiple Domains

```bash
# Add API subdomain
az webapp config hostname add \
  --webapp-name vendorvault-app \
  --resource-group vendorvault-rg \
  --hostname api.vendorvault.com

# Create certificate
az webapp config ssl create \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --hostname api.vendorvault.com

# Bind certificate
az webapp config ssl bind \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --certificate-thumbprint <THUMBPRINT> \
  --ssl-type SNI
```

---

## Export Certificate (If Using Custom Certificate)

```bash
# Download certificate
az webapp config ssl download \
  --resource-group vendorvault-rg \
  --certificate-thumbprint <THUMBPRINT> \
  --certificate-file backup.pfx
```

**Note:** App Service Managed Certificates cannot be exported.

---

**Last Updated:** January 1, 2026  
**Provider:** Azure App Service Managed Certificates  
**Auto-renewal:** Enabled ✅  
**Cost:** FREE ✅

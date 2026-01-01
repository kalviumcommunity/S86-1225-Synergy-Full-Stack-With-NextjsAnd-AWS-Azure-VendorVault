# Domain & SSL Verification Checklist

Use this checklist to verify successful domain and SSL configuration for VendorVault.

---

## 📋 Pre-Deployment Checklist

### Domain Registration
- [ ] Domain registered or owned
- [ ] Access to domain registrar account
- [ ] Domain not locked for transfer
- [ ] WHOIS privacy configured (optional)

### Cloud Account Access
- [ ] AWS/Azure account with necessary permissions
- [ ] Route 53 or Azure DNS access
- [ ] ACM or App Service certificate permissions
- [ ] Billing configured and limits understood

### Application Status
- [ ] Application deployed and running
- [ ] Load balancer or App Service available
- [ ] Health check endpoint responding (`/api/health`)
- [ ] Application accessible via cloud-provided URL

---

## 🌐 DNS Configuration Checklist

### AWS Route 53

#### Hosted Zone Setup
- [ ] Hosted zone created for domain
- [ ] Note all 4 nameservers from Route 53
- [ ] Nameservers updated at domain registrar
- [ ] DNS propagation completed (24-48 hours)
- [ ] Nameservers verified with `dig` or `nslookup`

#### DNS Records Created
- [ ] **A Record** (root domain → ALB)
  - Name: `@` or blank
  - Type: A (Alias to Application Load Balancer)
  - Target: Load Balancer DNS name
- [ ] **CNAME Record** (www → root)
  - Name: `www`
  - Type: CNAME
  - Target: vendorvault.com
- [ ] **Additional Records** (if applicable)
  - [ ] API subdomain: `api.vendorvault.com`
  - [ ] Staging subdomain: `staging.vendorvault.com`

#### Verification Commands
```bash
dig vendorvault.com +short          # Should return ALB IP
dig www.vendorvault.com +short      # Should return vendorvault.com
dig vendorvault.com NS +short       # Should show Route 53 nameservers
```

### Azure DNS

#### DNS Zone Setup
- [ ] DNS zone created in Azure
- [ ] Note all 4 nameservers from Azure DNS
- [ ] Nameservers updated at domain registrar
- [ ] DNS propagation completed (24-48 hours)
- [ ] Nameservers verified

#### DNS Records Created
- [ ] **A Record** (root → App Service IP)
  - Name: `@`
  - Type: A
  - IP: App Service outbound IP
- [ ] **CNAME Record** (www → root)
  - Name: `www`
  - Type: CNAME
  - Value: vendorvault.com
- [ ] **TXT Records** (verification)
  - [ ] asuid: Domain verification ID
  - [ ] asuid.www: WWW verification ID

#### Custom Domain Added
- [ ] Custom domain added to App Service
- [ ] Domain validation completed
- [ ] Domain status shows "Healthy"

---

## 🔒 SSL Certificate Checklist

### AWS Certificate Manager (ACM)

#### Certificate Request
- [ ] Certificate requested in **us-east-1** region
- [ ] Domain name: vendorvault.com
- [ ] Subject alternative name: *.vendorvault.com
- [ ] Validation method: DNS validation
- [ ] Certificate ARN saved for reference

#### DNS Validation
- [ ] CNAME validation record obtained from ACM
- [ ] CNAME record added to Route 53
- [ ] Or used "Create records in Route 53" button
- [ ] Certificate status changed to **"Issued"**
- [ ] Validation took <30 minutes

#### Certificate Attachment
- [ ] HTTPS listener created on ALB (port 443)
- [ ] Certificate attached to HTTPS listener
- [ ] Default action set to forward to target group
- [ ] SSL policy set: ELBSecurityPolicy-TLS13-1-2-2021-06

### Azure App Service SSL

#### Managed Certificate Creation
- [ ] Custom domain added and verified
- [ ] App Service tier: Basic or higher
- [ ] Managed certificate created for root domain
- [ ] Managed certificate created for www subdomain
- [ ] Certificate status shows **"Healthy"**

#### Certificate Binding
- [ ] Certificate bound to vendorvault.com
- [ ] Certificate bound to www.vendorvault.com
- [ ] SSL Type: SNI SSL
- [ ] Custom domain shows 🔒 Secured status

#### Security Settings
- [ ] **HTTPS Only** enabled
- [ ] Minimum TLS version: 1.2
- [ ] FTP state: Disabled (recommended)
- [ ] Client certificates: Configured if needed

---

## 🔐 HTTPS Configuration Checklist

### Load Balancer / App Service

- [ ] **HTTP Listener** (Port 80)
  - [ ] Redirects to HTTPS (301)
  - [ ] No default action to targets
- [ ] **HTTPS Listener** (Port 443)
  - [ ] Forwards to target group
  - [ ] SSL certificate attached
  - [ ] Health checks passing
- [ ] **Security Group** (AWS)
  - [ ] Port 80 allowed (for redirects)
  - [ ] Port 443 allowed (HTTPS)
  - [ ] Port 3000 allowed from ALB to ECS

### Application Configuration

- [ ] `next.config.ts` updated with redirects
- [ ] Security headers configured (HSTS, CSP, etc.)
- [ ] Environment variables updated:
  - [ ] `NEXTAUTH_URL=https://vendorvault.com`
  - [ ] `ALLOWED_ORIGINS` includes HTTPS URLs
- [ ] CORS configuration allows HTTPS origins
- [ ] No hardcoded HTTP URLs in code

---

## ✅ Verification Checklist

### Browser Verification

- [ ] Visit `https://vendorvault.com`
  - [ ] **Loads successfully** without errors
  - [ ] **🔒 Padlock icon** visible in address bar
  - [ ] No "Not Secure" warning
  - [ ] No mixed content warnings
- [ ] Click padlock → View certificate
  - [ ] Certificate valid (not expired)
  - [ ] Issued to: vendorvault.com
  - [ ] Issuer: Amazon/Microsoft/Let's Encrypt
  - [ ] Valid from/to dates correct
- [ ] Visit `http://vendorvault.com` (without https)
  - [ ] **Automatically redirects** to HTTPS
  - [ ] Address bar shows HTTPS after redirect
- [ ] Visit `https://www.vendorvault.com`
  - [ ] Loads correctly (or redirects to non-www)
  - [ ] Certificate valid

### Developer Tools Check

- [ ] Open DevTools (F12) → Console tab
  - [ ] No "Mixed Content" errors
  - [ ] No SSL/certificate warnings
- [ ] Network tab
  - [ ] All requests use HTTPS
  - [ ] No HTTP resources loaded
  - [ ] Status codes: 200 OK or appropriate
- [ ] Security tab
  - [ ] "This page is secure (valid HTTPS)"
  - [ ] Certificate information visible
  - [ ] Connection encrypted with TLS 1.2+

### Command Line Verification

```bash
# Test DNS resolution
dig vendorvault.com +short
# Should return: Load Balancer IP or App Service IP

# Test HTTP redirect
curl -I http://vendorvault.com
# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://vendorvault.com/

# Test HTTPS
curl -I https://vendorvault.com
# Expected: HTTP/2 200

# Check certificate
openssl s_client -connect vendorvault.com:443 -servername vendorvault.com
# Certificate should show valid dates

# Check expiration
echo | openssl s_client -servername vendorvault.com -connect vendorvault.com:443 2>/dev/null | openssl x509 -noout -dates
# Should show valid from/to dates
```

- [ ] All commands return expected results
- [ ] Certificate not expired
- [ ] HTTP redirects to HTTPS
- [ ] HTTPS returns 200 OK

### Online SSL Testing

- [ ] **SSL Labs Test**
  - Visit: https://www.ssllabs.com/ssltest/analyze.html?d=vendorvault.com
  - [ ] Overall rating: **A** or **A+**
  - [ ] Certificate: Valid and trusted
  - [ ] Protocol Support: TLS 1.2, TLS 1.3
  - [ ] Key Exchange: Strong
  - [ ] Cipher Strength: Strong

- [ ] **Security Headers Test**
  - Visit: https://securityheaders.com/?q=vendorvault.com
  - [ ] Grade: **A** or better
  - [ ] HSTS header present
  - [ ] CSP header present
  - [ ] X-Frame-Options present
  - [ ] X-Content-Type-Options present

- [ ] **Mixed Content Check**
  - Visit: https://www.whynopadlock.com/
  - Enter: vendorvault.com
  - [ ] No mixed content warnings
  - [ ] All resources loaded securely

### Functional Testing

- [ ] **Homepage**
  - [ ] Loads over HTTPS
  - [ ] All images load
  - [ ] All stylesheets load
  - [ ] All scripts execute
  - [ ] No console errors

- [ ] **Authentication**
  - [ ] Login page loads
  - [ ] Can log in successfully
  - [ ] Session cookies secure flag set
  - [ ] JWT/tokens work over HTTPS

- [ ] **API Endpoints**
  - [ ] API calls succeed
  - [ ] CORS works correctly
  - [ ] Authentication headers work
  - [ ] File uploads work

- [ ] **All Pages**
  - [ ] Navigate through all major pages
  - [ ] No SSL warnings anywhere
  - [ ] All functionality works
  - [ ] No performance issues

---

## 📊 Performance Verification

### Page Load Times
- [ ] Homepage loads in <3 seconds
- [ ] API responses in <500ms
- [ ] Time to first byte (TTFB) <200ms
- [ ] No significant slowdown from HTTPS

### SSL Handshake
- [ ] SSL handshake time <200ms
- [ ] Certificate chain validated quickly
- [ ] No certificate download delays

---

## 🔄 Certificate Renewal Verification

### AWS ACM
- [ ] Certificate renewal method: Automatic (DNS validated)
- [ ] Renewal period: 60 days before expiry
- [ ] Email notifications configured
- [ ] CloudWatch alarm set for certificate expiry

### Azure App Service
- [ ] Managed certificate renewal: Automatic
- [ ] Renewal period: 6 months
- [ ] Azure Monitor alerts configured
- [ ] Certificate health monitoring enabled

---

## 📸 Screenshot Checklist

### Required Screenshots

1. **DNS Configuration**
   - [ ] Route 53 hosted zone with all records
   - [ ] Or Azure DNS zone with all records
   - [ ] Screenshot shows domain name and record types

2. **SSL Certificate Status**
   - [ ] ACM certificate status showing "Issued"
   - [ ] Or Azure managed certificate showing "Healthy"
   - [ ] Certificate ARN or thumbprint visible

3. **Browser with HTTPS**
   - [ ] Address bar showing `https://vendorvault.com`
   - [ ] 🔒 Padlock icon clearly visible
   - [ ] Application loaded successfully
   - [ ] No security warnings

4. **Certificate Details**
   - [ ] Browser certificate viewer
   - [ ] Shows issued to, issued by, validity dates
   - [ ] Certificate chain visible

5. **SSL Labs Test Result**
   - [ ] Grade A or A+ clearly visible
   - [ ] Domain name in screenshot
   - [ ] Certificate, protocol, key exchange ratings shown

6. **Security Headers**
   - [ ] Browser DevTools showing security headers
   - [ ] Or securityheaders.com result
   - [ ] HSTS, CSP, and other headers visible

7. **HTTP to HTTPS Redirect**
   - [ ] Browser showing redirect (or DevTools Network tab)
   - [ ] 301 status code visible
   - [ ] Location header shows HTTPS

8. **Load Balancer Configuration** (AWS)
   - [ ] ALB listeners (port 80 and 443)
   - [ ] HTTPS listener with certificate
   - [ ] HTTP listener with redirect rule

9. **Custom Domain in App Service** (Azure)
   - [ ] Custom domains list showing configured domains
   - [ ] SSL binding status showing "Secured"
   - [ ] Certificate thumbprints visible

---

## 📝 Documentation Checklist

- [ ] **README.md updated** with:
  - [ ] Domain name
  - [ ] DNS provider (Route 53 / Azure DNS)
  - [ ] SSL certificate provider (ACM / App Service)
  - [ ] DNS records table
  - [ ] HTTPS enforcement details

- [ ] **Environment variables documented**
  - [ ] `NEXTAUTH_URL` updated to HTTPS
  - [ ] Any domain-specific variables noted

- [ ] **Deployment guide includes**
  - [ ] Domain setup instructions
  - [ ] SSL configuration steps
  - [ ] Verification procedures

- [ ] **Screenshots captured and organized**
  - [ ] All required screenshots taken
  - [ ] Clear and readable
  - [ ] Properly labeled
  - [ ] Added to documentation

---

## 🎓 Reflection Checklist

Document your learnings:

- [ ] **DNS Configuration Insights**
  - [ ] DNS propagation time experienced
  - [ ] Challenges with nameserver updates
  - [ ] Best practices learned

- [ ] **SSL Certificate Management**
  - [ ] Validation method experience (DNS vs Email)
  - [ ] Automatic renewal understanding
  - [ ] Certificate provider comparison

- [ ] **HTTPS Implementation**
  - [ ] Redirect configuration approach
  - [ ] Security headers impact
  - [ ] Performance considerations

- [ ] **Cost Considerations**
  - [ ] DNS hosting costs
  - [ ] Certificate costs (or savings with free options)
  - [ ] Ongoing maintenance costs

- [ ] **Multi-Environment Strategy**
  - [ ] Subdomain organization
  - [ ] Certificate management per environment
  - [ ] Deployment workflow improvements

---

## ✨ Final Verification

### Production Readiness
- [ ] Domain resolves correctly
- [ ] SSL certificate valid and trusted
- [ ] HTTPS enforced (HTTP redirects)
- [ ] Security headers configured
- [ ] No mixed content
- [ ] Certificate auto-renewal enabled
- [ ] Monitoring and alerts set up
- [ ] All functionality tested
- [ ] Performance acceptable
- [ ] Documentation complete

### Compliance
- [ ] SSL Labs grade A or A+
- [ ] Security headers grade A or better
- [ ] TLS 1.2+ only
- [ ] Strong cipher suites
- [ ] HSTS preload eligible (if desired)

### User Experience
- [ ] No security warnings for users
- [ ] Fast page loads
- [ ] All features work over HTTPS
- [ ] Mobile devices work correctly
- [ ] Different browsers tested

---

## 🎯 Success Criteria

Your domain and SSL setup is complete when:

✅ `https://vendorvault.com` loads with 🔒 padlock  
✅ HTTP automatically redirects to HTTPS  
✅ SSL Labs grade: **A** or **A+**  
✅ Security Headers grade: **A** or better  
✅ Certificate auto-renewal configured  
✅ All functionality works over HTTPS  
✅ Documentation complete with screenshots  
✅ Team can maintain and troubleshoot setup  

---

**Assignment Status:**
- [ ] Domain configured
- [ ] SSL certificate issued
- [ ] HTTPS enforced
- [ ] Verified and tested
- [ ] Screenshots captured
- [ ] Documentation updated
- [ ] Ready for submission

**Date Completed:** _______________  
**Verified By:** _______________  
**Platform Used:** AWS / Azure (circle one)

# Azure DNS Configuration for VendorVault

## Create DNS Zone

```bash
# Create DNS Zone
az network dns zone create \
  --resource-group vendorvault-rg \
  --name vendorvault.com

# Get nameservers
az network dns zone show \
  --resource-group vendorvault-rg \
  --name vendorvault.com \
  --query nameServers -o tsv
```

## A Record for Root Domain

```bash
# Get App Service outbound IP
az webapp show \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --query outboundIpAddresses -o tsv

# Create A record
az network dns record-set a add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name '@' \
  --ipv4-address <APP_SERVICE_IP>
```

## CNAME Records

```bash
# www subdomain
az network dns record-set cname set-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'www' \
  --cname vendorvault.com

# API subdomain
az network dns record-set cname set-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'api' \
  --cname vendorvault.com

# Staging subdomain
az network dns record-set cname set-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'staging' \
  --cname vendorvault-staging-app.azurewebsites.net
```

## TXT Record for Domain Verification

```bash
# Get verification ID
az webapp show \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --query customDomainVerificationId -o tsv

# Create TXT record
az network dns record-set txt add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'asuid' \
  --value '<VERIFICATION_ID>'

# Create TXT record for www
az network dns record-set txt add-record \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --record-set-name 'asuid.www' \
  --value '<VERIFICATION_ID>'
```

## List All Records

```bash
# List all record sets
az network dns record-set list \
  --resource-group vendorvault-rg \
  --zone-name vendorvault.com \
  --output table
```

## Expected DNS Records

| Name | Type | Value |
|------|------|-------|
| @ | A | <App Service IP> |
| www | CNAME | vendorvault.com |
| api | CNAME | vendorvault.com |
| staging | CNAME | vendorvault-staging-app.azurewebsites.net |
| asuid | TXT | <Verification ID> |
| asuid.www | TXT | <Verification ID> |

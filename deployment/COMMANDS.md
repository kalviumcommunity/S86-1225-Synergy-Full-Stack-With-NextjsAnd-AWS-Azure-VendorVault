# Deployment Commands Reference

## AWS ECS Deployment

### Initial Setup

```bash
# 1. Create ECR Repository
aws ecr create-repository \
  --repository-name vendorvault \
  --region ap-south-1

# 2. Create ECS Cluster
aws ecs create-cluster \
  --cluster-name vendorvault-cluster \
  --region ap-south-1

# 3. Create CloudWatch Log Group
aws logs create-log-group \
  --log-group-name /ecs/vendorvault \
  --region ap-south-1

# 4. Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name vendorvault-alb \
  --subnets subnet-xxxxxx subnet-yyyyyy \
  --security-groups sg-xxxxxx \
  --scheme internet-facing \
  --type application

# 5. Create Target Group
aws elbv2 create-target-group \
  --name vendorvault-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxxx \
  --target-type ip \
  --health-check-path /api/health
```

### Build & Deploy

```bash
# 1. Authenticate Docker to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com

# 2. Build Docker Image
cd vendorvault
docker build -t vendorvault:latest .

# 3. Tag Image
docker tag vendorvault:latest \
  <account-id>.dkr.ecr.ap-south-1.amazonaws.com/vendorvault:latest

# 4. Push to ECR
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/vendorvault:latest

# 5. Register Task Definition
aws ecs register-task-definition \
  --cli-input-json file://deployment/ecs-task-definition.json

# 6. Create or Update Service
aws ecs create-service \
  --cli-input-json file://deployment/ecs-service-definition.json

# Or update existing service
aws ecs update-service \
  --cluster vendorvault-cluster \
  --service vendorvault-service \
  --force-new-deployment
```

### Auto-scaling Setup

```bash
# 1. Register Scalable Target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/vendorvault-cluster/vendorvault-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 5 \
  --region ap-south-1

# 2. Create CPU-based Scaling Policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/vendorvault-cluster/vendorvault-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-autoscaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://deployment/ecs-autoscaling.json

# 3. Create Memory-based Scaling Policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/vendorvault-cluster/vendorvault-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name memory-autoscaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 80.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageMemoryUtilization"
    }
  }'
```

### Monitoring

```bash
# View Service Status
aws ecs describe-services \
  --cluster vendorvault-cluster \
  --services vendorvault-service

# View Task Status
aws ecs list-tasks \
  --cluster vendorvault-cluster \
  --service-name vendorvault-service

# View Logs
aws logs tail /ecs/vendorvault --follow

# Check Scaling Activities
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/vendorvault-cluster/vendorvault-service
```

---

## Azure App Service Deployment

### Initial Setup

```bash
# 1. Create Resource Group
az group create \
  --name vendorvault-rg \
  --location centralindia

# 2. Create Azure Container Registry
az acr create \
  --resource-group vendorvault-rg \
  --name kalviumregistry \
  --sku Basic \
  --admin-enabled true

# 3. Get ACR Credentials
az acr credential show \
  --name kalviumregistry \
  --resource-group vendorvault-rg

# 4. Create App Service Plan
az appservice plan create \
  --name vendorvault-plan \
  --resource-group vendorvault-rg \
  --is-linux \
  --sku P1v3

# 5. Create Key Vault
az keyvault create \
  --name vendorvault-kv \
  --resource-group vendorvault-rg \
  --location centralindia
```

### Build & Deploy

```bash
# 1. Log in to ACR
az acr login --name kalviumregistry

# 2. Build Docker Image
cd vendorvault
docker build -t vendorvault:latest .

# 3. Tag Image
docker tag vendorvault:latest \
  kalviumregistry.azurecr.io/vendorvault:latest

# 4. Push to ACR
docker push kalviumregistry.azurecr.io/vendorvault:latest

# 5. Create Web App
az webapp create \
  --resource-group vendorvault-rg \
  --plan vendorvault-plan \
  --name vendorvault-app \
  --deployment-container-image-name kalviumregistry.azurecr.io/vendorvault:latest

# 6. Configure App Settings
az webapp config appsettings set \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --settings \
    WEBSITES_PORT=3000 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    DOCKER_REGISTRY_SERVER_URL=https://kalviumregistry.azurecr.io \
    DOCKER_REGISTRY_SERVER_USERNAME=<username> \
    DOCKER_REGISTRY_SERVER_PASSWORD=<password>

# 7. Enable Continuous Deployment
az webapp deployment container config \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --enable-cd true
```

### Secrets Management

```bash
# Store secrets in Key Vault
az keyvault secret set \
  --vault-name vendorvault-kv \
  --name database-url \
  --value "postgresql://..."

az keyvault secret set \
  --vault-name vendorvault-kv \
  --name redis-url \
  --value "redis://..."

az keyvault secret set \
  --vault-name vendorvault-kv \
  --name nextauth-secret \
  --value "your-secret-key"

# Grant App Service access to Key Vault
az webapp identity assign \
  --name vendorvault-app \
  --resource-group vendorvault-rg

# Get the identity
IDENTITY=$(az webapp identity show \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --query principalId -o tsv)

# Set Key Vault access policy
az keyvault set-policy \
  --name vendorvault-kv \
  --object-id $IDENTITY \
  --secret-permissions get list

# Reference secrets in app settings
az webapp config appsettings set \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --settings \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://vendorvault-kv.vault.azure.net/secrets/database-url/)" \
    REDIS_URL="@Microsoft.KeyVault(SecretUri=https://vendorvault-kv.vault.azure.net/secrets/redis-url/)" \
    NEXTAUTH_SECRET="@Microsoft.KeyVault(SecretUri=https://vendorvault-kv.vault.azure.net/secrets/nextauth-secret/)"
```

### Auto-scaling Setup

```bash
# Create Autoscale Settings
az monitor autoscale create \
  --resource-group vendorvault-rg \
  --resource vendorvault-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name vendorvault-autoscale \
  --min-count 1 \
  --max-count 5 \
  --count 2

# Add Scale-out Rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group vendorvault-rg \
  --autoscale-name vendorvault-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1

# Add Scale-in Rule (CPU < 30%)
az monitor autoscale rule create \
  --resource-group vendorvault-rg \
  --autoscale-name vendorvault-autoscale \
  --condition "Percentage CPU < 30 avg 10m" \
  --scale in 1

# Add Memory-based Rule
az monitor autoscale rule create \
  --resource-group vendorvault-rg \
  --autoscale-name vendorvault-autoscale \
  --condition "Memory Percentage > 80 avg 5m" \
  --scale out 1
```

### Monitoring

```bash
# View App Status
az webapp show \
  --name vendorvault-app \
  --resource-group vendorvault-rg

# Stream Logs
az webapp log tail \
  --name vendorvault-app \
  --resource-group vendorvault-rg

# Download Logs
az webapp log download \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --log-file logs.zip

# View Metrics
az monitor metrics list \
  --resource vendorvault-app \
  --resource-group vendorvault-rg \
  --resource-type Microsoft.Web/sites \
  --metric CpuPercentage MemoryPercentage ResponseTime

# Check Autoscale History
az monitor autoscale show \
  --name vendorvault-autoscale \
  --resource-group vendorvault-rg
```

### Custom Domain & SSL

```bash
# Map custom domain
az webapp config hostname add \
  --webapp-name vendorvault-app \
  --resource-group vendorvault-rg \
  --hostname www.vendorvault.com

# Enable HTTPS
az webapp update \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --https-only true

# Bind SSL certificate (Azure Managed)
az webapp config ssl create \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --hostname www.vendorvault.com
```

---

## Common Operations

### Update Deployment

**AWS ECS:**
```bash
# Build and push new image
docker build -t vendorvault:latest .
docker tag vendorvault:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/vendorvault:latest
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/vendorvault:latest

# Force new deployment
aws ecs update-service \
  --cluster vendorvault-cluster \
  --service vendorvault-service \
  --force-new-deployment
```

**Azure:**
```bash
# Build and push new image
docker build -t vendorvault:latest .
docker tag vendorvault:latest kalviumregistry.azurecr.io/vendorvault:latest
docker push kalviumregistry.azurecr.io/vendorvault:latest

# Restart app (auto-pulls latest image)
az webapp restart \
  --name vendorvault-app \
  --resource-group vendorvault-rg
```

### Rollback

**AWS ECS:**
```bash
# Update service to previous task definition revision
aws ecs update-service \
  --cluster vendorvault-cluster \
  --service vendorvault-service \
  --task-definition vendorvault-task:1
```

**Azure:**
```bash
# Deploy previous image
az webapp config container set \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --docker-custom-image-name kalviumregistry.azurecr.io/vendorvault:previous-tag
```

### Scale Manually

**AWS ECS:**
```bash
aws ecs update-service \
  --cluster vendorvault-cluster \
  --service vendorvault-service \
  --desired-count 3
```

**Azure:**
```bash
az appservice plan update \
  --name vendorvault-plan \
  --resource-group vendorvault-rg \
  --number-of-workers 3
```

---

## Cleanup

### AWS
```bash
# Delete service
aws ecs delete-service \
  --cluster vendorvault-cluster \
  --service vendorvault-service \
  --force

# Delete cluster
aws ecs delete-cluster --cluster vendorvault-cluster

# Delete ECR repository
aws ecr delete-repository \
  --repository-name vendorvault \
  --force
```

### Azure
```bash
# Delete entire resource group (includes all resources)
az group delete \
  --name vendorvault-rg \
  --yes --no-wait
```

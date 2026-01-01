# VendorVault - Docker Deployment Guide

## 📦 Containerization Overview

VendorVault is containerized using Docker with a multi-stage build process optimized for production deployment. The application can be deployed to both AWS ECS (Elastic Container Service) and Azure App Service for Containers.

---

## 🏗️ Architecture

### Multi-Stage Dockerfile

Our Dockerfile uses a **3-stage build process**:

1. **Dependencies Stage**: Installs production dependencies
2. **Builder Stage**: Compiles the Next.js application
3. **Runner Stage**: Creates a minimal production image with only necessary files

**Benefits:**
- Reduced image size (~150MB vs ~1GB)
- Improved security (non-root user, minimal attack surface)
- Faster deployments and cold starts
- Built-in health checks

---

## 🚀 Quick Start - Local Testing

### Prerequisites
- Docker installed (version 20.10+)
- Docker Compose (optional, for full stack)

### Build and Run Locally

```bash
# Navigate to vendorvault directory
cd vendorvault

# Build the Docker image
docker build -t vendorvault:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e REDIS_URL="your-redis-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  vendorvault:latest

# Access the application
# Visit: http://localhost:3000
```

### Using Docker Compose (Full Stack)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## ☁️ Cloud Deployment Options

### Option 1: AWS ECS (Fargate)

#### 1.1 Prerequisites
- AWS Account with appropriate IAM permissions
- AWS CLI configured
- ECR repository created

#### 1.2 Push Image to ECR

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com

# Build and tag image
cd vendorvault
docker build -t vendorvault:latest .
docker tag vendorvault:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/vendorvault:latest

# Push to ECR
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/vendorvault:latest
```

#### 1.3 Create ECS Resources

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name vendorvault-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://deployment/ecs-task-definition.json

# Create service
aws ecs create-service --cli-input-json file://deployment/ecs-service-definition.json

# Configure auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/vendorvault-cluster/vendorvault-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 5
```

#### 1.4 ECS Configuration Details

**Task Resources:**
- CPU: 512 (0.5 vCPU)
- Memory: 1024 MB
- Launch Type: Fargate

**Auto-scaling Rules:**
- Min Capacity: 1 task
- Max Capacity: 5 tasks
- Scale out: CPU > 70% or Memory > 80%
- Scale in: CPU < 30% for 10 minutes
- Request count: > 1000 requests per target

**Health Checks:**
- Interval: 30 seconds
- Timeout: 10 seconds
- Healthy threshold: 3
- Unhealthy threshold: 3

---

### Option 2: Azure App Service for Containers

#### 2.1 Prerequisites
- Azure Account with active subscription
- Azure CLI installed
- Azure Container Registry created

#### 2.2 Push Image to ACR

```bash
# Create resource group
az group create --name vendorvault-rg --location centralindia

# Create Azure Container Registry
az acr create --resource-group vendorvault-rg \
  --name kalviumregistry --sku Basic

# Log in to ACR
az acr login --name kalviumregistry

# Build and push image
cd vendorvault
docker build -t vendorvault:latest .
docker tag vendorvault:latest kalviumregistry.azurecr.io/vendorvault:latest
docker push kalviumregistry.azurecr.io/vendorvault:latest
```

#### 2.3 Create App Service

```bash
# Create App Service Plan (Premium v3)
az appservice plan create \
  --name vendorvault-plan \
  --resource-group vendorvault-rg \
  --is-linux \
  --sku P1v3

# Create Web App
az webapp create \
  --resource-group vendorvault-rg \
  --plan vendorvault-plan \
  --name vendorvault-app \
  --deployment-container-image-name kalviumregistry.azurecr.io/vendorvault:latest

# Configure container settings
az webapp config appsettings set \
  --resource-group vendorvault-rg \
  --name vendorvault-app \
  --settings WEBSITES_PORT=3000 NODE_ENV=production

# Enable continuous deployment
az webapp deployment container config \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --enable-cd true
```

#### 2.4 Azure Configuration Details

**App Service Plan:**
- Tier: Premium v3 (P1v3)
- vCPU: 2
- Memory: 8 GB
- Storage: 250 GB

**Auto-scaling:**
- Min instances: 1
- Max instances: 5
- Scale out: CPU > 70% or Memory > 80%
- Scale in: CPU < 30% for 10 minutes
- Cooldown: 5 minutes (scale out), 10 minutes (scale in)

---

## 🔄 CI/CD Pipeline Setup

### GitHub Actions - AWS ECS

The workflow automatically:
1. Builds Docker image on push to main/production
2. Pushes to Amazon ECR
3. Updates ECS task definition
4. Deploys to ECS service with rolling update

**Required GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### GitHub Actions - Azure App Service

The workflow automatically:
1. Builds Docker image on push to main/production
2. Pushes to Azure Container Registry
3. Deploys to Azure App Service

**Required GitHub Secrets:**
- `AZURE_CREDENTIALS`
- `ACR_USERNAME`
- `ACR_PASSWORD`

---

## 🔒 Security Best Practices

### Environment Variables & Secrets

**AWS (Secrets Manager):**
```bash
# Store secrets
aws secretsmanager create-secret \
  --name vendorvault/database-url \
  --secret-string "postgresql://..."

aws secretsmanager create-secret \
  --name vendorvault/nextauth-secret \
  --secret-string "your-secret-key"
```

**Azure (Key Vault):**
```bash
# Create Key Vault
az keyvault create \
  --name vendorvault-kv \
  --resource-group vendorvault-rg \
  --location centralindia

# Store secrets
az keyvault secret set \
  --vault-name vendorvault-kv \
  --name database-url \
  --value "postgresql://..."
```

### Container Security
- ✅ Non-root user (nextjs:nodejs)
- ✅ Minimal base image (alpine)
- ✅ No unnecessary packages
- ✅ Secrets from vault (not in image)
- ✅ HTTPS only
- ✅ Security scanning enabled

---

## 📊 Monitoring & Observability

### AWS CloudWatch
```bash
# View logs
aws logs tail /ecs/vendorvault --follow

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name vendorvault-high-cpu \
  --alarm-description "CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Azure Monitor
```bash
# View logs
az webapp log tail --name vendorvault-app --resource-group vendorvault-rg

# Create alerts
az monitor metrics alert create \
  --name vendorvault-high-cpu \
  --resource-group vendorvault-rg \
  --scopes /subscriptions/.../vendorvault-app \
  --condition "avg Percentage CPU > 80" \
  --description "CPU exceeds 80%"
```

---

## 🎯 Performance Optimization

### Cold Start Mitigation
1. **Keep containers warm**: Maintain minimum 1 instance
2. **Use Application Load Balancer health checks**: Prevents idle containers
3. **Optimize image size**: Multi-stage builds reduce startup time
4. **Pre-compile code**: Next.js build happens during image build

### Resource Sizing Strategy

| Metric | Development | Production | High-Traffic |
|--------|------------|-----------|--------------|
| CPU | 0.25 vCPU | 0.5 vCPU | 1-2 vCPU |
| Memory | 512 MB | 1024 MB | 2048 MB |
| Instances | 1 | 2-3 | 3-10 |

### Health Check Configuration
```javascript
// Add to app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
```

---

## 🧪 Testing Deployment

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://your-app-url.com/

# Using wrk
wrk -t12 -c400 -d30s https://your-app-url.com/
```

### Validate Auto-scaling
```bash
# AWS
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=vendorvault-service \
  --start-time 2026-01-01T00:00:00Z \
  --end-time 2026-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average

# Azure
az monitor metrics list \
  --resource vendorvault-app \
  --resource-group vendorvault-rg \
  --resource-type "Microsoft.Web/sites" \
  --metric "CpuPercentage"
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Container fails health check**
```bash
# Check logs
docker logs <container-id>

# Test health endpoint locally
curl http://localhost:3000/api/health
```

**Issue: Out of memory**
- Increase memory allocation in task definition
- Check for memory leaks
- Optimize bundle size

**Issue: Slow cold starts**
- Reduce image size
- Use build cache
- Keep minimum instances running

---

## 📈 Cost Optimization

### AWS ECS
- Use Fargate Spot for non-critical workloads (70% savings)
- Enable auto-scaling to match demand
- Use reserved capacity for baseline load
- Monitor and right-size resources

### Azure App Service
- Use appropriate tier (B1 for dev, P1v3 for prod)
- Enable auto-scaling
- Use deployment slots for zero-downtime
- Consider Azure Functions for sporadic traffic

---

## 🎓 Reflection & Learnings

### Deployment Strategy Considerations

1. **Container Orchestration**
   - ECS provides better integration with AWS services
   - Azure App Service offers simpler deployment
   - Both support auto-scaling and health monitoring

2. **Cold Start Optimization**
   - Multi-stage builds reduced image size by 85%
   - Health checks prevent premature traffic routing
   - Warm containers maintain sub-second response times

3. **Scaling Strategy**
   - CPU-based scaling works for compute-intensive tasks
   - Request count scaling better for API services
   - Memory scaling prevents OOM crashes

4. **Production Readiness**
   - CI/CD automation ensures consistency
   - Secrets management enhances security
   - Monitoring enables proactive issue detection

---

## 📚 Additional Resources

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 📝 Deployment Checklist

- [ ] Dockerfile optimized with multi-stage build
- [ ] .dockerignore configured
- [ ] Environment variables stored in secrets manager
- [ ] Health check endpoint implemented
- [ ] Auto-scaling policies configured
- [ ] CI/CD pipeline tested
- [ ] Monitoring and alerts set up
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Last Updated:** January 1, 2026  
**Maintainer:** VendorVault Team  
**Cloud Platforms:** AWS ECS (Fargate) | Azure App Service

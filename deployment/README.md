# Deployment Configuration Files

This directory contains all deployment configurations and documentation for VendorVault.

## 📁 Directory Contents

### Configuration Files

| File | Purpose | Platform |
|------|---------|----------|
| `ecs-task-definition.json` | ECS task configuration | AWS |
| `ecs-service-definition.json` | ECS service settings | AWS |
| `ecs-autoscaling.json` | Auto-scaling policies | AWS |
| `azure-app-service-config.json` | App Service configuration | Azure |
| `azure-autoscaling.json` | Auto-scale rules | Azure |

### Documentation

| File | Description |
|------|-------------|
| `COMMANDS.md` | Complete CLI command reference for AWS and Azure |
| `CHECKLIST.md` | 150+ item deployment checklist |
| `SCREENSHOTS.md` | Screenshot documentation guide and template |
| `COMPLETION_SUMMARY.md` | Assignment completion summary |
| `README.md` | This file |

## 🚀 Quick Links

- **Main Deployment Guide:** [../DEPLOYMENT.md](../DEPLOYMENT.md)
- **Quick Start:** [../QUICK_START.md](../QUICK_START.md)
- **CI/CD Workflows:** [../.github/workflows/](../.github/workflows/)

## 📖 Usage

### For AWS ECS Deployment:
1. Review and update `ecs-task-definition.json` with your account ID
2. Review and update `ecs-service-definition.json` with your VPC/subnet IDs
3. Follow commands in `COMMANDS.md` under "AWS ECS Deployment"
4. Use `CHECKLIST.md` to verify all steps

### For Azure App Service Deployment:
1. Review and update `azure-app-service-config.json` with your subscription ID
2. Review and update `azure-autoscaling.json` with your resource IDs
3. Follow commands in `COMMANDS.md` under "Azure App Service Deployment"
4. Use `CHECKLIST.md` to verify all steps

## 🔧 Customization

Before deploying, replace the following placeholders in configuration files:

**AWS ECS:**
- `<ACCOUNT_ID>` - Your AWS account ID
- `subnet-xxxxxxxxx` - Your VPC subnet IDs
- `sg-xxxxxxxxx` - Your security group ID

**Azure App Service:**
- `<SUBSCRIPTION_ID>` - Your Azure subscription ID
- `<ACR_USERNAME>` - Your ACR username
- `<ACR_PASSWORD>` - Your ACR password

## 📊 Configuration Overview

### AWS ECS Configuration
- **CPU:** 512 (0.5 vCPU)
- **Memory:** 1024 MB
- **Launch Type:** Fargate
- **Scaling:** 1-5 tasks
- **Health Check:** 30s interval, 10s timeout

### Azure App Service Configuration
- **Tier:** Premium v3 (P1v3)
- **CPU:** 2 vCPU
- **Memory:** 8 GB
- **Scaling:** 1-5 instances
- **Runtime:** Docker Container

## 🎯 Deployment Workflow

```
1. Configure Infrastructure
   ↓
2. Push Docker Image to Registry (ECR/ACR)
   ↓
3. Create/Update Task Definition or App Service
   ↓
4. Deploy Service
   ↓
5. Configure Auto-scaling
   ↓
6. Verify Deployment
   ↓
7. Setup Monitoring & Alerts
```

## 🔒 Security Notes

- Never commit real credentials to version control
- Use Secrets Manager (AWS) or Key Vault (Azure) for sensitive data
- Ensure security groups/network security groups follow least privilege
- Enable HTTPS/TLS for all external endpoints
- Regularly rotate access keys and passwords

## 📞 Support

For detailed instructions and troubleshooting:
- See [DEPLOYMENT.md](../DEPLOYMENT.md)
- Check [COMMANDS.md](COMMANDS.md) for specific commands
- Review [CHECKLIST.md](CHECKLIST.md) for verification steps

---

**Last Updated:** January 1, 2026  
**Project:** VendorVault

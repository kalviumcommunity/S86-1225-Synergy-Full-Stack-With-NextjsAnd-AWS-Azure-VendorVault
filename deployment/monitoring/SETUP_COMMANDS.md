# Logging and Monitoring Setup Commands

## AWS CloudWatch Setup

### 1. Create Log Group
```bash
aws logs create-log-group \
  --log-group-name /ecs/vendorvault \
  --region ap-south-1

aws logs put-retention-policy \
  --log-group-name /ecs/vendorvault \
  --retention-in-days 30 \
  --region ap-south-1
```

### 2. Create Metric Filters
```bash
# Error count
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name ErrorLogFilter \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations \
    metricName=ErrorCount,metricNamespace=VendorVault/Application,metricValue=1,defaultValue=0,unit=Count \
  --region ap-south-1

# Fatal errors
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name FatalLogFilter \
  --filter-pattern '{ $.level = "fatal" }' \
  --metric-transformations \
    metricName=FatalErrorCount,metricNamespace=VendorVault/Application,metricValue=1,defaultValue=0,unit=Count \
  --region ap-south-1

# Warnings
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name WarnLogFilter \
  --filter-pattern '{ $.level = "warn" }' \
  --metric-transformations \
    metricName=WarningCount,metricNamespace=VendorVault/Application,metricValue=1,defaultValue=0,unit=Count \
  --region ap-south-1

# Response time
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name ApiResponseTimeFilter \
  --filter-pattern '{ $.metadata.duration EXISTS }' \
  --metric-transformations \
    metricName=ApiResponseTime,metricNamespace=VendorVault/Performance,metricValue=$.metadata.duration,unit=Milliseconds \
  --region ap-south-1

# 4xx errors
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name Api4xxErrorsFilter \
  --filter-pattern '{ ($.metadata.statusCode >= 400) && ($.metadata.statusCode < 500) }' \
  --metric-transformations \
    metricName=ClientErrors,metricNamespace=VendorVault/Application,metricValue=1,defaultValue=0,unit=Count \
  --region ap-south-1

# 5xx errors
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name Api5xxErrorsFilter \
  --filter-pattern '{ $.metadata.statusCode >= 500 }' \
  --metric-transformations \
    metricName=ServerErrors,metricNamespace=VendorVault/Application,metricValue=1,defaultValue=0,unit=Count \
  --region ap-south-1

# Database query time
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name DatabaseQueryTimeFilter \
  --filter-pattern '{ $.message = "Database query executed" }' \
  --metric-transformations \
    metricName=DatabaseQueryDuration,metricNamespace=VendorVault/Database,metricValue=$.metadata.duration,unit=Milliseconds \
  --region ap-south-1
```

### 3. Create SNS Topics
```bash
# Regular alerts topic
aws sns create-topic \
  --name vendorvault-alerts \
  --region ap-south-1

# Critical alerts topic
aws sns create-topic \
  --name vendorvault-critical-alerts \
  --region ap-south-1

# Subscribe email to regular alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --protocol email \
  --notification-endpoint dev-team@vendorvault.com \
  --region ap-south-1

# Subscribe email to critical alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-critical-alerts \
  --protocol email \
  --notification-endpoint dev-team@vendorvault.com \
  --region ap-south-1

# Subscribe SMS for critical alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-critical-alerts \
  --protocol sms \
  --notification-endpoint +91XXXXXXXXXX \
  --region ap-south-1
```

### 4. Create CloudWatch Alarms
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-HighErrorRate \
  --alarm-description "Triggers when error count exceeds threshold" \
  --metric-name ErrorCount \
  --namespace VendorVault/Application \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --region ap-south-1

# Fatal error alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-FatalErrors \
  --alarm-description "Triggers on any fatal error" \
  --metric-name FatalErrorCount \
  --namespace VendorVault/Application \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-critical-alerts \
  --region ap-south-1

# High response time alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-HighResponseTime \
  --alarm-description "Triggers when average response time exceeds 2 seconds" \
  --metric-name ApiResponseTime \
  --namespace VendorVault/Performance \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 2000 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --region ap-south-1

# High CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-HighCPUUtilization \
  --alarm-description "Triggers when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=vendorvault-service Name=ClusterName,Value=vendorvault-cluster \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --region ap-south-1

# High memory utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-HighMemoryUtilization \
  --alarm-description "Triggers when memory exceeds 85%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=vendorvault-service Name=ClusterName,Value=vendorvault-cluster \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --region ap-south-1

# High 5xx errors alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-HighServerErrors \
  --alarm-description "Triggers when 5xx errors exceed threshold" \
  --metric-name ServerErrors \
  --namespace VendorVault/Application \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --region ap-south-1

# Slow database queries alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-SlowDatabaseQueries \
  --alarm-description "Triggers when average query time exceeds 500ms" \
  --metric-name DatabaseQueryDuration \
  --namespace VendorVault/Database \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 500 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --region ap-south-1
```

### 5. Create Dashboard
```bash
aws cloudwatch put-dashboard \
  --dashboard-name VendorVault-Production-Dashboard \
  --dashboard-body file://deployment/monitoring/cloudwatch-dashboard.json \
  --region ap-south-1
```

### 6. View Logs
```bash
# Stream logs in real-time
aws logs tail /ecs/vendorvault --follow --region ap-south-1

# Query logs
aws logs start-query \
  --log-group-name /ecs/vendorvault \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, level, message | filter level = "error"' \
  --region ap-south-1
```

---

## Azure Monitor Setup

### 1. Create Log Analytics Workspace
```bash
az monitor log-analytics workspace create \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs \
  --location centralindia

# Get workspace ID
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs \
  --query id -o tsv)
```

### 2. Enable Diagnostic Settings
```bash
az monitor diagnostic-settings create \
  --name vendorvault-diagnostics \
  --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --workspace $WORKSPACE_ID \
  --logs '[
    {
      "category": "AppServiceConsoleLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServiceHTTPLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServiceAppLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    },
    {
      "category": "AppServicePlatformLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 14
      }
    }
  ]' \
  --metrics '[
    {
      "category": "AllMetrics",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": 30
      }
    }
  ]'
```

### 3. Configure Application Logging
```bash
az webapp log config \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --application-logging filesystem \
  --level information \
  --web-server-logging filesystem

az webapp config set \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --detailed-error-logging-enabled true \
  --failed-request-tracing-enabled true
```

### 4. Create Action Groups
```bash
# Regular alerts action group
az monitor action-group create \
  --name vendorvault-alerts \
  --short-name VV-Alerts \
  --resource-group vendorvault-rg \
  --action email dev-team dev-team@vendorvault.com \
  --action webhook slack https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Critical alerts action group
az monitor action-group create \
  --name vendorvault-critical-alerts \
  --short-name VV-Critical \
  --resource-group vendorvault-rg \
  --action email dev-team dev-team@vendorvault.com \
  --action email management management@vendorvault.com \
  --action sms oncall +91 XXXXXXXXXX
```

### 5. Create Metric Alerts
```bash
# High CPU alert
az monitor metrics alert create \
  --name VendorVault-HighCPU-Azure \
  --resource-group vendorvault-rg \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --condition "avg CpuPercentage > 80" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --action vendorvault-alerts \
  --severity 2 \
  --description "Triggers when CPU exceeds 80%"

# High memory alert
az monitor metrics alert create \
  --name VendorVault-HighMemory-Azure \
  --resource-group vendorvault-rg \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --condition "avg MemoryPercentage > 85" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --action vendorvault-alerts \
  --severity 2 \
  --description "Triggers when memory exceeds 85%"
```

### 6. Create Log Query Alerts
```bash
# High error rate alert
az monitor scheduled-query create \
  --name VendorVault-HighErrorRate-Azure \
  --resource-group vendorvault-rg \
  --scopes $WORKSPACE_ID \
  --condition "count 'Heartbeat' > 10" \
  --condition-query "AppServiceConsoleLogs | where TimeGenerated > ago(5m) | where ResultDescription contains '\"level\":\"error\"' | summarize ErrorCount = count()" \
  --description "Triggers when error count exceeds 10 in 5 minutes" \
  --severity 2 \
  --window-size 5m \
  --evaluation-frequency 5m \
  --action-groups /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/microsoft.insights/actionGroups/vendorvault-alerts

# Fatal error alert
az monitor scheduled-query create \
  --name VendorVault-FatalError-Azure \
  --resource-group vendorvault-rg \
  --scopes $WORKSPACE_ID \
  --condition "count 'Heartbeat' > 0" \
  --condition-query "AppServiceConsoleLogs | where TimeGenerated > ago(1m) | where ResultDescription contains '\"level\":\"fatal\"' | summarize FatalCount = count()" \
  --description "Triggers on any fatal error" \
  --severity 0 \
  --window-size 1m \
  --evaluation-frequency 1m \
  --action-groups /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/microsoft.insights/actionGroups/vendorvault-critical-alerts
```

### 7. Set Log Retention
```bash
az monitor log-analytics workspace update \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs \
  --retention-time 90
```

### 8. View Logs
```bash
# Stream logs in real-time
az webapp log tail \
  --name vendorvault-app \
  --resource-group vendorvault-rg

# Query logs with KQL
az monitor log-analytics query \
  --workspace $WORKSPACE_ID \
  --analytics-query "AppServiceConsoleLogs | where TimeGenerated > ago(1h) | where ResultDescription contains 'error' | limit 10"
```

---

## Verify Setup

### AWS CloudWatch
```bash
# List log groups
aws logs describe-log-groups --region ap-south-1

# List metric filters
aws logs describe-metric-filters \
  --log-group-name /ecs/vendorvault \
  --region ap-south-1

# List alarms
aws cloudwatch describe-alarms --region ap-south-1

# List dashboards
aws cloudwatch list-dashboards --region ap-south-1

# List SNS topics
aws sns list-topics --region ap-south-1
```

### Azure Monitor
```bash
# List Log Analytics workspaces
az monitor log-analytics workspace list \
  --resource-group vendorvault-rg

# List diagnostic settings
az monitor diagnostic-settings list \
  --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app

# List action groups
az monitor action-group list \
  --resource-group vendorvault-rg

# List metric alerts
az monitor metrics alert list \
  --resource-group vendorvault-rg
```

---

## Test Logging

### Local Test
```bash
# Start application
cd vendorvault
npm run dev

# Test logging endpoint
curl http://localhost:3000/api/logging-demo

# Test with error
curl -X POST http://localhost:3000/api/logging-demo \
  -H "Content-Type: application/json" \
  -d '{"simulateError": true}'
```

### Production Test
```bash
# Test CloudWatch logs
aws logs tail /ecs/vendorvault --follow --region ap-south-1

# Test Azure logs
az webapp log tail --name vendorvault-app --resource-group vendorvault-rg
```

---

## Clean Up (Optional)

### AWS CloudWatch
```bash
# Delete alarms
aws cloudwatch delete-alarms \
  --alarm-names VendorVault-HighErrorRate VendorVault-FatalErrors \
  --region ap-south-1

# Delete dashboard
aws cloudwatch delete-dashboards \
  --dashboard-names VendorVault-Production-Dashboard \
  --region ap-south-1

# Delete metric filters
aws logs delete-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name ErrorLogFilter \
  --region ap-south-1

# Delete log group
aws logs delete-log-group \
  --log-group-name /ecs/vendorvault \
  --region ap-south-1

# Delete SNS topics
aws sns delete-topic \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --region ap-south-1
```

### Azure Monitor
```bash
# Delete alerts
az monitor metrics alert delete \
  --name VendorVault-HighCPU-Azure \
  --resource-group vendorvault-rg

# Delete action groups
az monitor action-group delete \
  --name vendorvault-alerts \
  --resource-group vendorvault-rg

# Delete diagnostic settings
az monitor diagnostic-settings delete \
  --name vendorvault-diagnostics \
  --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app

# Delete workspace
az monitor log-analytics workspace delete \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs
```

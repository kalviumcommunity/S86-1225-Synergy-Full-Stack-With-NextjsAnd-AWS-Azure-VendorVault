# 📊 Logging and Monitoring Guide - VendorVault

## Table of Contents

1. [Overview](#overview)
2. [Structured Logging Implementation](#structured-logging-implementation)
3. [AWS CloudWatch Setup](#aws-cloudwatch-setup)
4. [Azure Monitor Setup](#azure-monitor-setup)
5. [Log Analysis and Queries](#log-analysis-and-queries)
6. [Dashboards](#dashboards)
7. [Alerts and Notifications](#alerts-and-notifications)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Cost Optimization](#cost-optimization)
11. [Reflection](#reflection)

---

## Overview

### Why Logging and Monitoring?

Comprehensive logging and monitoring provide:

- **Visibility**: Real-time insights into application health and performance
- **Debugging**: Rapid identification and resolution of issues
- **Performance Tracking**: Monitor response times, throughput, and resource utilization
- **Security**: Detect anomalous behavior and potential security threats
- **Compliance**: Audit trails for regulatory requirements
- **Proactive Alerting**: Early detection of failures before they impact users

### Architecture Overview

```
┌──────────────────┐
│   Next.js App    │
│  (Logger Class)  │
└────────┬─────────┘
         │ JSON Logs
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌─▼────────┐
│  AWS  │  │  Azure   │
│ Cloud │  │  Monitor │
│ Watch │  │          │
└───┬───┘  └─┬────────┘
    │        │
    │        │
┌───▼────────▼─────┐
│   Dashboards     │
│   & Alerts       │
└──────────────────┘
```

### Key Metrics Tracked

| Category | Metrics | Purpose |
|----------|---------|---------|
| **Application** | Error count, warning count, fatal errors | Health monitoring |
| **Performance** | Response time (avg, p95, p99) | User experience |
| **Infrastructure** | CPU, memory, disk, network | Resource optimization |
| **Business** | Request count, unique users, endpoint usage | Analytics |
| **Database** | Query duration, connection pool | Database performance |

---

## Structured Logging Implementation

### Logger Utility (`lib/logger.ts`)

Our custom logger provides:

✅ **JSON structured logs** for machine readability  
✅ **Correlation IDs** for request tracing across services  
✅ **Log levels** (debug, info, warn, error, fatal)  
✅ **Performance metrics** tracking  
✅ **Error context capture** with stack traces  

### Log Structure

Every log entry follows this structure:

```json
{
  "timestamp": "2026-01-01T12:00:00.000Z",
  "level": "info",
  "message": "API request received",
  "metadata": {
    "requestId": "1735732800000-abc123xyz",
    "userId": "user_123",
    "endpoint": "/api/vendors",
    "method": "POST",
    "duration": 145,
    "statusCode": 200,
    "ip": "203.0.113.42",
    "userAgent": "Mozilla/5.0..."
  },
  "environment": "production",
  "service": "vendorvault",
  "version": "1.0.0"
}
```

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| `DEBUG` | Development details | Variable values, detailed flow |
| `INFO` | Normal operations | Request received, task completed |
| `WARN` | Warning conditions | Deprecated API used, slow query |
| `ERROR` | Error conditions | API failure, validation error |
| `FATAL` | Critical failures | Database connection lost, crash |

### Correlation IDs

Every request receives a unique `requestId`:

```typescript
const requestId = Logger.generateRequestId();
// Format: 1735732800000-abc123xyz

// All logs for this request include the same ID
logger.info('Processing request', { requestId });
logger.info('Database query completed', { requestId });
logger.info('Response sent', { requestId });
```

**Benefits:**
- Trace entire request lifecycle
- Identify slow operations
- Debug multi-step processes
- Correlate logs across services

---

## AWS CloudWatch Setup

### Step 1: Configure ECS Task Definition

Update your ECS task definition to enable CloudWatch Logs:

```json
{
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/vendorvault",
      "awslogs-region": "ap-south-1",
      "awslogs-stream-prefix": "ecs",
      "awslogs-create-group": "true"
    }
  }
}
```

**File**: [deployment/monitoring/aws-ecs-task-logging.json](deployment/monitoring/aws-ecs-task-logging.json)

### Step 2: Create CloudWatch Log Group

```bash
# Create log group
aws logs create-log-group \
  --log-group-name /ecs/vendorvault \
  --region ap-south-1

# Set retention policy (30 days)
aws logs put-retention-policy \
  --log-group-name /ecs/vendorvault \
  --retention-in-days 30 \
  --region ap-south-1

# Verify
aws logs describe-log-groups \
  --log-group-name-prefix /ecs/vendorvault \
  --region ap-south-1
```

### Step 3: Create Metric Filters

Metric filters extract data from logs and create CloudWatch metrics.

```bash
# Error count metric filter
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name ErrorLogFilter \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations \
    metricName=ErrorCount,\
metricNamespace=VendorVault/Application,\
metricValue=1,\
defaultValue=0,\
unit=Count

# Response time metric filter
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name ApiResponseTimeFilter \
  --filter-pattern '{ $.metadata.duration EXISTS }' \
  --metric-transformations \
    metricName=ApiResponseTime,\
metricNamespace=VendorVault/Performance,\
metricValue=$.metadata.duration,\
unit=Milliseconds
```

**All metric filters**: [deployment/monitoring/cloudwatch-metric-filters.json](deployment/monitoring/cloudwatch-metric-filters.json)

### Step 4: Query Logs with CloudWatch Insights

Example queries:

```sql
-- Find all errors in the last hour
fields @timestamp, level, message, metadata.requestId
| filter level = "error"
| sort @timestamp desc
| limit 100

-- Average response time by endpoint
fields metadata.endpoint, metadata.duration
| filter metadata.duration > 0
| stats avg(metadata.duration) as avgDuration by metadata.endpoint
| sort avgDuration desc

-- Slow queries (>1 second)
fields @timestamp, metadata.endpoint, metadata.duration
| filter metadata.duration > 1000
| sort metadata.duration desc
| limit 50

-- Error rate over time
fields @timestamp, level
| filter level = "error"
| stats count() as errorCount by bin(5m)
```

### Step 5: Create CloudWatch Dashboard

```bash
# Create dashboard from JSON
aws cloudwatch put-dashboard \
  --dashboard-name VendorVault-Production \
  --dashboard-body file://deployment/monitoring/cloudwatch-dashboard.json \
  --region ap-south-1
```

**Dashboard includes:**
- Error trends (errors, warnings, fatal)
- API response time (average, p99)
- HTTP status codes (4xx, 5xx)
- ECS resource utilization (CPU, memory)
- Load balancer metrics
- Database query performance
- Recent error logs
- Slow API requests

**Configuration**: [deployment/monitoring/cloudwatch-dashboard.json](deployment/monitoring/cloudwatch-dashboard.json)

### Step 6: Configure Alarms

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-HighErrorRate \
  --alarm-description "Triggers when error count exceeds 10 in 5 minutes" \
  --metric-name ErrorCount \
  --namespace VendorVault/Application \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts

# Fatal error alarm (immediate)
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
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-critical-alerts
```

**All alarms**: [deployment/monitoring/cloudwatch-alarms.json](deployment/monitoring/cloudwatch-alarms.json)

### Step 7: Set Up SNS for Notifications

```bash
# Create SNS topic for regular alerts
aws sns create-topic \
  --name vendorvault-alerts \
  --region ap-south-1

# Create SNS topic for critical alerts
aws sns create-topic \
  --name vendorvault-critical-alerts \
  --region ap-south-1

# Subscribe email to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --protocol email \
  --notification-endpoint dev-team@vendorvault.com

# Subscribe SMS for critical alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-critical-alerts \
  --protocol sms \
  --notification-endpoint +91XXXXXXXXXX
```

### Step 8: Archive Logs to S3

```bash
# Create S3 bucket for log archival
aws s3 mb s3://vendorvault-logs-archive --region ap-south-1

# Configure log group export
aws logs create-export-task \
  --log-group-name /ecs/vendorvault \
  --from $(date -d '30 days ago' +%s)000 \
  --to $(date +%s)000 \
  --destination s3://vendorvault-logs-archive \
  --destination-prefix cloudwatch-logs/
```

---

## Azure Monitor Setup

### Step 1: Enable Diagnostic Settings

Configure your App Service to send logs to Log Analytics:

```bash
# Create Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs \
  --location centralindia

# Get workspace ID
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs \
  --query id -o tsv)

# Enable diagnostic settings
az monitor diagnostic-settings create \
  --name vendorvault-diagnostics \
  --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --workspace $WORKSPACE_ID \
  --logs '[
    {"category": "AppServiceConsoleLogs", "enabled": true, "retentionPolicy": {"enabled": true, "days": 30}},
    {"category": "AppServiceHTTPLogs", "enabled": true, "retentionPolicy": {"enabled": true, "days": 30}},
    {"category": "AppServiceAppLogs", "enabled": true, "retentionPolicy": {"enabled": true, "days": 30}}
  ]' \
  --metrics '[
    {"category": "AllMetrics", "enabled": true, "retentionPolicy": {"enabled": true, "days": 30}}
  ]'
```

**Configuration**: [deployment/monitoring/azure-app-service-logging.json](deployment/monitoring/azure-app-service-logging.json)

### Step 2: Configure Application Logging

```bash
# Enable application logging
az webapp log config \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --application-logging filesystem \
  --level information \
  --web-server-logging filesystem

# Enable detailed error messages
az webapp config set \
  --name vendorvault-app \
  --resource-group vendorvault-rg \
  --detailed-error-logging-enabled true \
  --failed-request-tracing-enabled true
```

### Step 3: Query Logs with Kusto (KQL)

Azure Monitor uses Kusto Query Language (KQL) for log analysis.

**Error logs (last 24 hours):**

```kusto
AppServiceConsoleLogs
| where TimeGenerated > ago(24h)
| where ResultDescription contains "\"level\":\"error\""
| extend LogData = parse_json(ResultDescription)
| project 
    TimeGenerated,
    Level = LogData.level,
    Message = LogData.message,
    RequestId = LogData.metadata.requestId,
    Endpoint = LogData.metadata.endpoint,
    ErrorName = LogData.error.name,
    ErrorMessage = LogData.error.message
| order by TimeGenerated desc
| limit 100
```

**Response time trends:**

```kusto
AppServiceConsoleLogs
| where TimeGenerated > ago(24h)
| where ResultDescription contains "\"metadata\":{\"duration\""
| extend LogData = parse_json(ResultDescription)
| extend Duration = toreal(LogData.metadata.duration)
| summarize 
    AvgDuration = avg(Duration),
    P95 = percentile(Duration, 95),
    P99 = percentile(Duration, 99)
    by bin(TimeGenerated, 5m)
| render timechart
```

**15 comprehensive queries**: [deployment/monitoring/azure-monitor-queries.kql](deployment/monitoring/azure-monitor-queries.kql)

### Step 4: Create Azure Monitor Dashboard

1. **Go to Azure Portal** → **Monitor** → **Dashboards**
2. **Create new dashboard**: "VendorVault Production"
3. **Add tiles** for each query:

   - Error count by hour (timechart)
   - Response time trends (timechart)
   - HTTP status distribution (piechart)
   - Slow API requests (table)
   - Top endpoints by volume (barchart)
   - CPU/Memory utilization (metrics)

4. **Pin queries** directly from Log Analytics
5. **Share dashboard** with team

### Step 5: Configure Alerts

Create action groups:

```bash
# Create action group for regular alerts
az monitor action-group create \
  --name vendorvault-alerts \
  --short-name VV-Alerts \
  --resource-group vendorvault-rg \
  --action email dev-team dev-team@vendorvault.com \
  --action webhook slack https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Create action group for critical alerts
az monitor action-group create \
  --name vendorvault-critical-alerts \
  --short-name VV-Critical \
  --resource-group vendorvault-rg \
  --action email dev-team dev-team@vendorvault.com \
  --action email management management@vendorvault.com \
  --action sms oncall +91XXXXXXXXXX
```

Create metric alerts:

```bash
# High error rate alert
az monitor metrics alert create \
  --name VendorVault-HighErrorRate-Azure \
  --resource-group vendorvault-rg \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --condition "count AppServiceConsoleLogs where ResultDescription contains '\"level\":\"error\"' > 10" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --action vendorvault-alerts \
  --severity 2

# High CPU alert
az monitor metrics alert create \
  --name VendorVault-HighCPU-Azure \
  --resource-group vendorvault-rg \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --condition "avg CpuPercentage > 80" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --action vendorvault-alerts \
  --severity 2
```

**All alerts**: [deployment/monitoring/azure-alerts.json](deployment/monitoring/azure-alerts.json)

### Step 6: Set Log Retention

```bash
# Set retention for workspace (90 days)
az monitor log-analytics workspace update \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs \
  --retention-time 90

# Archive to blob storage for long-term retention
az storage account create \
  --name vendorvaultlogs \
  --resource-group vendorvault-rg \
  --location centralindia \
  --sku Standard_LRS

# Configure diagnostic settings to archive
az monitor diagnostic-settings update \
  --name vendorvault-diagnostics \
  --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --storage-account vendorvaultlogs \
  --logs '[
    {"category": "AppServiceConsoleLogs", "enabled": true, "retentionPolicy": {"enabled": true, "days": 365}}
  ]'
```

---

## Log Analysis and Queries

### Common Analysis Patterns

#### 1. Error Investigation

**Find error context:**

```sql
-- CloudWatch Insights
fields @timestamp, message, metadata.requestId, metadata.endpoint, error.message, error.stack
| filter level = "error"
| filter @timestamp > ago(1h)
| sort @timestamp desc
```

```kusto
-- Azure Monitor (KQL)
AppServiceConsoleLogs
| where TimeGenerated > ago(1h)
| where ResultDescription contains "\"level\":\"error\""
| extend LogData = parse_json(ResultDescription)
| project 
    TimeGenerated,
    Message = LogData.message,
    RequestId = LogData.metadata.requestId,
    Endpoint = LogData.metadata.endpoint,
    ErrorMessage = LogData.error.message,
    Stack = LogData.error.stack
| order by TimeGenerated desc
```

#### 2. Performance Analysis

**Identify slow endpoints:**

```sql
-- CloudWatch Insights
fields metadata.endpoint, metadata.duration
| filter metadata.duration > 1000
| stats avg(metadata.duration) as avgDuration, 
        max(metadata.duration) as maxDuration,
        count() as slowRequests 
  by metadata.endpoint
| sort avgDuration desc
```

```kusto
-- Azure Monitor (KQL)
AppServiceConsoleLogs
| where ResultDescription contains "\"metadata\":{\"duration\""
| extend LogData = parse_json(ResultDescription)
| extend Duration = toreal(LogData.metadata.duration)
| where Duration > 1000
| summarize 
    AvgDuration = avg(Duration),
    MaxDuration = max(Duration),
    SlowRequests = count()
    by Endpoint = tostring(LogData.metadata.endpoint)
| order by AvgDuration desc
```

#### 3. User Activity Tracking

**Track requests by IP:**

```sql
-- CloudWatch Insights
fields metadata.ip, metadata.endpoint, metadata.method
| stats count() as requestCount by metadata.ip
| sort requestCount desc
| limit 20
```

```kusto
-- Azure Monitor (KQL)
AppServiceConsoleLogs
| where ResultDescription contains "API request received"
| extend LogData = parse_json(ResultDescription)
| summarize RequestCount = count() by IP = tostring(LogData.metadata.ip)
| order by RequestCount desc
| top 20 by RequestCount
```

#### 4. Request Flow Tracing

**Trace complete request lifecycle:**

```sql
-- CloudWatch Insights
fields @timestamp, message, metadata.duration
| filter metadata.requestId = "1735732800000-abc123xyz"
| sort @timestamp asc
```

```kusto
-- Azure Monitor (KQL)
AppServiceConsoleLogs
| extend LogData = parse_json(ResultDescription)
| where tostring(LogData.metadata.requestId) == "1735732800000-abc123xyz"
| project 
    TimeGenerated,
    Message = LogData.message,
    Duration = LogData.metadata.duration
| order by TimeGenerated asc
```

---

## Dashboards

### AWS CloudWatch Dashboard

**Widgets included:**

1. **Application Health**
   - Error count (sum)
   - Fatal error count (sum)
   - Warning count (sum)

2. **Performance Metrics**
   - API response time (average, p99)
   - Database query duration (average, p95)
   - Load balancer response time

3. **Infrastructure**
   - ECS CPU utilization
   - ECS memory utilization
   - Task count

4. **Traffic**
   - Request count
   - HTTP status codes (4xx, 5xx)
   - Requests by endpoint

5. **Log Insights**
   - Recent error logs (top 20)
   - Slow API requests (top 20)

**Access Dashboard:**
```
https://console.aws.amazon.com/cloudwatch/home?region=ap-south-1#dashboards:name=VendorVault-Production-Dashboard
```

**Screenshot:**
![CloudWatch Dashboard](screenshots/cloudwatch-dashboard.png)

### Azure Monitor Dashboard

**Tiles included:**

1. **Error Trends**
   - Error count by hour
   - Fatal errors timeline
   - Warning distribution

2. **Performance**
   - Response time trends
   - P95/P99 latency
   - Slow requests list

3. **Resource Utilization**
   - CPU percentage
   - Memory percentage
   - Network I/O

4. **HTTP Analysis**
   - Status code distribution
   - Request volume by endpoint
   - User activity by IP

5. **Query Insights**
   - Error logs table
   - Slow queries
   - Top error messages

**Access Dashboard:**
```
https://portal.azure.com/#blade/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade/dashboards
```

**Screenshot:**
![Azure Dashboard](screenshots/azure-monitor-dashboard.png)

---

## Alerts and Notifications

### Alert Severity Levels

| Severity | Description | Response Time | Notification |
|----------|-------------|---------------|--------------|
| **Critical (0)** | Service down, fatal errors | Immediate | SMS + Email + PagerDuty |
| **High (1)** | High error rate, 5xx errors | <15 minutes | Email + Slack |
| **Medium (2)** | Performance degradation | <1 hour | Email |
| **Low (3)** | Warning conditions | <24 hours | Email (digest) |

### AWS CloudWatch Alarms

**Configured Alarms:**

1. ✅ **VendorVault-HighErrorRate**: Error count > 10 in 5 min
2. ✅ **VendorVault-FatalErrors**: Any fatal error (immediate)
3. ✅ **VendorVault-HighResponseTime**: Avg response > 2s
4. ✅ **VendorVault-HighCPUUtilization**: CPU > 80%
5. ✅ **VendorVault-HighMemoryUtilization**: Memory > 85%
6. ✅ **VendorVault-HighServerErrors**: 5xx count > 5 in 5 min
7. ✅ **VendorVault-UnhealthyTargets**: Unhealthy target count ≥ 1
8. ✅ **VendorVault-SlowDatabaseQueries**: Avg query time > 500ms

### Azure Monitor Alerts

**Configured Alerts:**

1. ✅ **VendorVault-HighErrorRate-Azure**: Error count > 10 in 5 min
2. ✅ **VendorVault-FatalError-Azure**: Any fatal error
3. ✅ **VendorVault-SlowResponseTime-Azure**: Avg response > 2s
4. ✅ **VendorVault-HighCPU-Azure**: CPU > 80%
5. ✅ **VendorVault-HighMemory-Azure**: Memory > 85%
6. ✅ **VendorVault-High5xxErrors-Azure**: 5xx count > 5 in 5 min
7. ✅ **VendorVault-AppServiceDown-Azure**: Health check failed
8. ✅ **VendorVault-SlowDatabaseQueries-Azure**: Avg query > 500ms

### Notification Channels

**AWS SNS Topics:**
- `vendorvault-alerts`: Regular alerts (email)
- `vendorvault-critical-alerts`: Critical alerts (SMS + email)

**Azure Action Groups:**
- `vendorvault-alerts`: Regular alerts (email + Slack)
- `vendorvault-critical-alerts`: Critical alerts (SMS + email + PagerDuty)

### Alert Response Workflow

```
┌─────────────┐
│ Alert Fired │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Severity Check   │
└──────┬───────────┘
       │
    ┌──┴──┐
    │     │
┌───▼──┐ ┌▼────────┐
│ Low/ │ │Critical/│
│Medium│ │  High   │
└───┬──┘ └┬────────┘
    │     │
    │     ▼
    │  ┌──────────────┐
    │  │  Immediate   │
    │  │  Response    │
    │  │  (On-call)   │
    │  └──────────────┘
    │
    ▼
┌──────────────┐
│   Ticket     │
│   Created    │
└──────────────┘
```

---

## Best Practices

### 1. Log Hygiene

✅ **DO:**
- Use structured JSON logging
- Include correlation IDs
- Log at appropriate levels
- Sanitize sensitive data (passwords, tokens)
- Use consistent timestamp format (ISO 8601)
- Include context (user ID, request ID, endpoint)

❌ **DON'T:**
- Log passwords or API keys
- Use excessive debug logging in production
- Log large payloads (truncate to 200 chars)
- Mix log levels inappropriately
- Use console.log() directly (use logger utility)

### 2. Correlation IDs

**Always propagate request IDs:**

```typescript
// Generate at entry point
const requestId = Logger.generateRequestId();

// Pass to all function calls
await processVendor(data, { requestId });

// Include in database queries
logger.logDatabaseQuery(query, duration, { requestId });

// Return in API response
res.headers.set('X-Request-ID', requestId);
```

### 3. Performance Logging

**Track operation duration:**

```typescript
const timer = new PerformanceTimer('Vendor creation');

// ... operation ...

const duration = timer.end();
logger.info('Vendor created', { requestId, duration });

// Alert if slow
if (duration > 1000) {
  logger.warn('Slow vendor creation', { requestId, duration });
}
```

### 4. Error Context

**Always include full error context:**

```typescript
try {
  await createVendor(data);
} catch (error) {
  logger.error(
    'Failed to create vendor',
    error as Error,
    {
      requestId,
      vendorData: { name: data.name, type: data.type },
      userId: session.user.id,
    }
  );
  throw error;
}
```

### 5. Metrics Tracking

**Log custom metrics:**

```typescript
logger.logMetric(
  'vendor_creation',
  1,
  'count',
  { requestId, vendorType: 'food' }
);

logger.logMetric(
  'license_renewal_rate',
  85.5,
  'percent',
  { requestId, month: '2026-01' }
);
```

### 6. Log Retention Strategy

| Environment | Retention | Archive |
|-------------|-----------|---------|
| **Development** | 7 days | No |
| **Staging** | 14 days | No |
| **Production** | 30 days | Yes (S3/Blob) |
| **Audit Logs** | 90 days | Yes (1 year) |

### 7. Cost Optimization

**Reduce logging costs:**

- Filter out health check logs at application level
- Use debug logs only in development
- Sample high-volume requests (10% in production)
- Archive old logs to S3/Blob Storage
- Set appropriate retention periods
- Use metric filters instead of querying all logs

### 8. Security Considerations

**Sanitize logs:**

```typescript
// BAD - logs sensitive data
logger.info('User login', { 
  email: 'user@example.com',
  password: 'secret123' // ❌ Never log passwords
});

// GOOD - sanitized
logger.info('User login attempt', {
  email: 'user@example.com',
  authMethod: 'password',
  ipAddress: req.ip,
});
```

### 9. Alert Fatigue Prevention

**Set meaningful thresholds:**

- Don't alert on single occurrences (use evaluation periods)
- Group related alerts
- Use severity levels appropriately
- Implement alert suppression during maintenance
- Review and adjust thresholds monthly

### 10. Dashboard Design

**Effective dashboards:**

- Show key metrics above the fold
- Use colors meaningfully (red = error, yellow = warning, green = healthy)
- Include time range selector
- Add comparison to previous period
- Limit to 6-8 widgets per dashboard
- Create role-specific dashboards (dev, ops, business)

---

## Troubleshooting

### Problem: Logs Not Appearing

**AWS CloudWatch:**

```bash
# Check log group exists
aws logs describe-log-groups \
  --log-group-name-prefix /ecs/vendorvault \
  --region ap-south-1

# Check ECS task definition
aws ecs describe-task-definition \
  --task-definition vendorvault-nextjs \
  --region ap-south-1 \
  | jq '.taskDefinition.containerDefinitions[0].logConfiguration'

# Check IAM permissions
aws iam get-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name CloudWatchLogsPolicy
```

**Azure Monitor:**

```bash
# Check diagnostic settings
az monitor diagnostic-settings show \
  --name vendorvault-diagnostics \
  --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app

# Check App Service logs enabled
az webapp log show \
  --name vendorvault-app \
  --resource-group vendorvault-rg

# Stream logs in real-time
az webapp log tail \
  --name vendorvault-app \
  --resource-group vendorvault-rg
```

### Problem: Metric Filters Not Working

**Verify filter pattern:**

```bash
# Test metric filter pattern
aws logs test-metric-filter \
  --filter-pattern '{ $.level = "error" }' \
  --log-event-messages '{"level":"error","message":"Test error"}'
```

**Check logs match pattern:**

```bash
# Search logs for pattern
aws logs filter-log-events \
  --log-group-name /ecs/vendorvault \
  --filter-pattern '{ $.level = "error" }' \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --limit 10
```

### Problem: Alerts Not Triggering

**Check alarm state:**

```bash
# AWS
aws cloudwatch describe-alarms \
  --alarm-names VendorVault-HighErrorRate \
  --region ap-south-1

# Azure
az monitor metrics alert show \
  --name VendorVault-HighErrorRate-Azure \
  --resource-group vendorvault-rg
```

**Verify SNS/Action Group:**

```bash
# AWS - Test SNS
aws sns publish \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:vendorvault-alerts \
  --message "Test alert from VendorVault" \
  --region ap-south-1

# Azure - Test Action Group
az monitor action-group test-notifications create \
  --action-group vendorvault-alerts \
  --resource-group vendorvault-rg \
  --alert-type servicehealth
```

### Problem: High Logging Costs

**Analyze log volume:**

```bash
# AWS - Check ingestion
aws logs get-log-group-fields \
  --log-group-name /ecs/vendorvault \
  --time $(date -d '24 hours ago' +%s) \
  --region ap-south-1

# Azure - Check ingestion
az monitor log-analytics workspace table show \
  --resource-group vendorvault-rg \
  --workspace-name vendorvault-logs \
  --name AppServiceConsoleLogs
```

**Optimization strategies:**

1. Filter health check logs
2. Reduce debug logging in production
3. Sample high-volume requests
4. Set shorter retention (7-14 days)
5. Archive to S3/Blob Storage

### Problem: Slow Query Performance

**CloudWatch Insights:**

- Limit time range to last hour/day
- Use specific field names instead of `fields @message`
- Filter early in query (use `filter` before `stats`)
- Limit result set with `limit` clause

**Azure Monitor (KQL):**

- Use `where` clauses to filter early
- Avoid parsing entire log body
- Use `project` to select specific fields
- Add `| limit 1000` to large queries

---

## Cost Optimization

### AWS CloudWatch Costs

| Component | Pricing | Monthly Estimate |
|-----------|---------|------------------|
| **Log Ingestion** | $0.50/GB | ~$10 (20 GB) |
| **Log Storage** | $0.03/GB | ~$0.90 (30 GB × 30 days) |
| **Dashboard** | $3/dashboard | $3 |
| **Alarms** | $0.10/alarm | $0.80 (8 alarms) |
| **Insights Queries** | $0.005/GB scanned | ~$2 (400 GB scanned) |
| **Total** | | **~$17/month** |

### Azure Monitor Costs

| Component | Pricing | Monthly Estimate |
|-----------|---------|------------------|
| **Log Ingestion** | $2.76/GB (first 5 GB free) | ~$41 (15 GB) |
| **Log Retention** | $0.12/GB (90 days) | ~$1.80 |
| **Alerts** | $0.10/alert | $0.80 (8 alerts) |
| **Dashboard** | Free | $0 |
| **Queries** | Free | $0 |
| **Total** | | **~$43/month** |

### Cost Reduction Strategies

1. **Reduce log volume:**
   - Filter out health check requests
   - Sample high-frequency logs (10% in prod)
   - Truncate large payloads
   - Use appropriate log levels

2. **Optimize retention:**
   - Keep only 7-14 days in CloudWatch/Azure Monitor
   - Archive to S3/Blob Storage for long-term
   - Delete old exports regularly

3. **Efficient queries:**
   - Query specific time ranges
   - Use metric filters instead of scanning logs
   - Cache dashboard data
   - Limit query result size

4. **Alert consolidation:**
   - Combine related metrics into single alarm
   - Use composite alarms (AWS)
   - Set reasonable evaluation periods

---

## Reflection

### What I Learned

#### 1. Importance of Structured Logging

**Before:**
```javascript
console.log('Error happened:', error);
// Unstructured, hard to search, no context
```

**After:**
```typescript
logger.error('Vendor creation failed', error, {
  requestId: '1735732800000-abc123xyz',
  vendorId: 'V-12345',
  userId: 'user-789',
});
// Structured, searchable, full context
```

**Key insight:** Structured logs with correlation IDs dramatically reduce debugging time. In a production incident, I can trace an entire request flow across microservices using a single request ID.

#### 2. Correlation IDs Are Essential

Without correlation IDs, debugging distributed systems is nearly impossible. With them, I can:

- Trace a request across services
- Identify bottlenecks in multi-step processes
- Correlate frontend errors with backend logs
- Debug race conditions and timing issues

**Example:**
```
Request ID: 1735732800000-abc123xyz
12:00:00 - API request received (POST /api/vendors)
12:00:01 - Database query started
12:00:02 - Database query completed (1200ms) ⚠️ SLOW
12:00:02 - S3 upload started
12:00:03 - S3 upload completed
12:00:03 - Response sent (3000ms total)
```

#### 3. Metrics vs Logs

- **Logs**: Detailed events (what happened, when, why)
- **Metrics**: Aggregated numbers (how many, how fast)

**Use logs for:** Debugging specific issues  
**Use metrics for:** Trends, alerting, dashboards

**Best practice:** Use metric filters to convert logs → metrics for efficient querying.

#### 4. Alert Threshold Tuning

Initial thresholds were too sensitive, causing alert fatigue:

- ❌ Error count > 1 → **Too noisy**
- ✅ Error count > 10 in 5 min → **Just right**

**Lesson:** Monitor for a week, analyze patterns, then set thresholds. Use evaluation periods (2-3) to reduce false positives.

#### 5. Log Levels Matter

| Level | Production Volume | Use Case |
|-------|-------------------|----------|
| DEBUG | 0% | Never in production |
| INFO | 60% | Normal operations |
| WARN | 30% | Recoverable issues |
| ERROR | 9% | Failures that need attention |
| FATAL | 1% | Critical system failures |

**Insight:** Debug logs are useful in development but expensive in production. Use them sparingly.

#### 6. CloudWatch vs Azure Monitor

| Feature | AWS CloudWatch | Azure Monitor | Winner |
|---------|----------------|---------------|--------|
| **Query Language** | CloudWatch Insights SQL | Kusto (KQL) | Azure |
| **Ease of Setup** | Moderate | Easy | Azure |
| **Cost** | Lower | Higher | AWS |
| **Dashboards** | Paid ($3/dashboard) | Free | Azure |
| **Integration** | Excellent with AWS | Excellent with Azure | Tie |
| **Metric Filters** | Manual setup required | Built-in | Azure |

**Recommendation:** Use CloudWatch for AWS deployments, Azure Monitor for Azure.

#### 7. Log Retention Strategy

**Operational logs:** 7-14 days (active debugging)  
**Audit logs:** 90+ days (compliance)  
**Archive:** S3/Blob Storage (cost-effective long-term)

**Mistake I made:** Initially set 90-day retention for all logs → High costs. Reduced to 30 days with S3 archival → 60% cost savings.

#### 8. Security Considerations

**Never log:**
- Passwords
- API keys
- OAuth tokens
- Credit card numbers
- Personal Identifiable Information (PII) without encryption

**Always sanitize:**
```typescript
// BAD
logger.info('Payment processed', { 
  cardNumber: '4111111111111111' // ❌
});

// GOOD
logger.info('Payment processed', {
  cardLast4: '1111', // ✅
  amount: 100.00,
  currency: 'USD',
});
```

#### 9. Dashboard Design Principles

**Effective dashboards:**
1. Show most important metrics first (errors, response time)
2. Use consistent colors (red = bad, green = good)
3. Include time range selector
4. Add comparison to previous period
5. Group related metrics
6. Limit to 6-8 widgets

**Avoid:**
- Too many widgets (overwhelming)
- Irrelevant metrics
- No context (what's normal?)

#### 10. On-Call Readiness

Logging and monitoring aren't just for debugging—they're for **operations**:

- **Runbooks**: Link alerts to resolution steps
- **Escalation**: Define severity levels and response times
- **Postmortems**: Use logs to understand what went wrong
- **Continuous Improvement**: Analyze incidents to prevent recurrence

### Challenges Faced

#### Challenge 1: Log Format Inconsistency

**Problem:** Different parts of the app used different log formats:
```javascript
console.log('Vendor created'); // Plain string
console.log({ vendor: data }); // Object
console.error('Error:', error.message); // Mixed
```

**Solution:** Created centralized `Logger` class with consistent JSON format:
```typescript
logger.info('Vendor created', { vendorId, userId });
logger.error('Vendor creation failed', error, { vendorId });
```

#### Challenge 2: Missing Correlation Between Logs

**Problem:** Couldn't trace requests across multiple API calls.

**Solution:** Implemented request ID generation and propagation:
```typescript
const requestId = Logger.generateRequestId();
// Pass requestId to all function calls
// Include in API responses via X-Request-ID header
```

#### Challenge 3: Alert Fatigue

**Problem:** Too many alerts from sensitive thresholds:
- 50+ alerts per day
- Team started ignoring alerts
- Real issues missed

**Solution:**
- Increased thresholds (error count > 1 → > 10)
- Added evaluation periods (2-3 periods)
- Consolidated related alerts
- Set severity levels appropriately

**Result:** 5-10 meaningful alerts per day.

#### Challenge 4: High Logging Costs

**Problem:** Initial costs were $150/month (Azure Monitor).

**Root cause:**
- Logging every single request (high volume)
- 90-day retention for all logs
- Debug logs in production

**Solution:**
- Filter health check logs
- Reduce retention to 30 days
- Archive to Blob Storage
- Sample high-volume endpoints (10%)
- Remove debug logs from production

**Result:** Reduced to ~$43/month (71% savings).

#### Challenge 5: Slow Query Performance

**Problem:** CloudWatch Insights queries taking 30+ seconds.

**Solution:**
- Limit time range (24h instead of 7d)
- Filter early with specific field names
- Use metric filters for common queries
- Add `limit` clauses

**Result:** Queries complete in <5 seconds.

### Key Takeaways

1. ✅ **Structured logging is non-negotiable** for production systems
2. ✅ **Correlation IDs save hours** of debugging time
3. ✅ **Metrics are for trends, logs are for details**
4. ✅ **Alert thresholds need tuning** based on real traffic
5. ✅ **Log retention is a balance** between cost and compliance
6. ✅ **Sanitize sensitive data** before logging
7. ✅ **Dashboards should be actionable**, not just pretty
8. ✅ **Cost optimization is ongoing**, not one-time
9. ✅ **CloudWatch for AWS, Azure Monitor for Azure**
10. ✅ **Logging is observability**, not just debugging

### Future Improvements

**Short-term (1 month):**
- [ ] Add distributed tracing (OpenTelemetry)
- [ ] Implement log sampling (10% of high-volume requests)
- [ ] Create runbooks for common alerts
- [ ] Set up weekly log analysis automation

**Medium-term (3 months):**
- [ ] Integrate with APM tools (New Relic, Datadog)
- [ ] Implement anomaly detection (ML-based)
- [ ] Create business metrics dashboards
- [ ] Set up log-based SLOs

**Long-term (6 months):**
- [ ] Centralized logging across microservices
- [ ] Real-time log streaming to data lake
- [ ] Advanced analytics (user behavior, trends)
- [ ] Automated incident response

---

## Quick Reference

### Common Commands

**AWS CloudWatch:**

```bash
# Stream logs in real-time
aws logs tail /ecs/vendorvault --follow --region ap-south-1

# Query logs
aws logs start-query \
  --log-group-name /ecs/vendorvault \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, level, message | filter level = "error"'

# Create metric filter
aws logs put-metric-filter \
  --log-group-name /ecs/vendorvault \
  --filter-name ErrorCount \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations metricName=ErrorCount,metricNamespace=VendorVault,metricValue=1

# Create alarm
aws cloudwatch put-metric-alarm \
  --alarm-name VendorVault-HighErrors \
  --metric-name ErrorCount \
  --namespace VendorVault/Application \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

**Azure Monitor:**

```bash
# Stream logs
az webapp log tail --name vendorvault-app --resource-group vendorvault-rg

# Query logs (KQL)
az monitor log-analytics query \
  --workspace vendorvault-logs \
  --analytics-query "AppServiceConsoleLogs | where ResultDescription contains 'error' | limit 10"

# Create alert
az monitor metrics alert create \
  --name VendorVault-HighErrors \
  --resource-group vendorvault-rg \
  --scopes /subscriptions/SUB_ID/resourceGroups/vendorvault-rg/providers/Microsoft.Web/sites/vendorvault-app \
  --condition "count AppServiceConsoleLogs where ResultDescription contains 'error' > 10" \
  --window-size 5m
```

### Log Query Cheat Sheet

| Task | CloudWatch Insights | Azure Monitor (KQL) |
|------|---------------------|---------------------|
| **Find errors** | `filter level = "error"` | `where ResultDescription contains "error"` |
| **Time range** | `@timestamp > ago(1h)` | `where TimeGenerated > ago(1h)` |
| **Count** | `stats count() as total` | `summarize Total = count()` |
| **Average** | `stats avg(metadata.duration)` | `summarize Avg = avg(Duration)` |
| **Group by** | `stats count() by endpoint` | `summarize count() by Endpoint` |
| **Sort** | `sort @timestamp desc` | `order by TimeGenerated desc` |
| **Limit** | `limit 100` | `limit 100` or `top 100` |
| **Parse JSON** | `parse @message` | `parse_json(ResultDescription)` |

### Useful Log Patterns

**Error investigation:**
```
fields @timestamp, message, error.message, metadata.requestId
| filter level = "error"
| sort @timestamp desc
```

**Performance analysis:**
```
stats avg(metadata.duration), percentile(metadata.duration, 95) by metadata.endpoint
```

**User activity:**
```
stats count() as requests by metadata.ip
| sort requests desc
```

**Request tracing:**
```
filter metadata.requestId = "YOUR_REQUEST_ID"
| sort @timestamp asc
```

---

## Screenshots

### CloudWatch Dashboard
![CloudWatch Dashboard showing error trends, response times, and resource utilization](screenshots/cloudwatch-dashboard.png)

### CloudWatch Logs Insights Query
![CloudWatch Logs Insights showing error log query results](screenshots/cloudwatch-logs-query.png)

### CloudWatch Alarms
![CloudWatch Alarms configured for VendorVault application](screenshots/cloudwatch-alarms.png)

### Azure Monitor Dashboard
![Azure Monitor Dashboard with KQL queries and visualizations](screenshots/azure-monitor-dashboard.png)

### Azure Log Analytics Query
![Azure Log Analytics showing error investigation query](screenshots/azure-logs-query.png)

### Azure Alerts
![Azure Monitor Alerts configuration and action groups](screenshots/azure-alerts.png)

### Structured Log Example
![Example of structured JSON log from VendorVault application](screenshots/structured-log-example.png)

### Request Flow Tracing
![Complete request trace using correlation ID](screenshots/request-trace.png)

---

## Conclusion

Logging and monitoring transform your application from a black box into an observable system. With structured logs, correlation IDs, comprehensive metrics, and proactive alerts, you can:

✅ Debug issues 10x faster  
✅ Detect problems before users notice  
✅ Understand application behavior  
✅ Make data-driven decisions  
✅ Sleep better at night (fewer 3 AM pages!)  

**Remember:** Logging is not just for debugging—it's for **observability**.

---

**Assignment:** Logging and Monitoring  
**Status:** ✅ **Complete**  
**Date:** January 1, 2026  
**Project:** VendorVault - Railway Vendor License Management System

---

## Additional Resources

- **AWS CloudWatch Documentation:** https://docs.aws.amazon.com/cloudwatch/
- **Azure Monitor Documentation:** https://docs.microsoft.com/azure/azure-monitor/
- **Structured Logging Best Practices:** https://www.loggly.com/ultimate-guide/
- **Observability Engineering (Book):** By Charity Majors, Liz Fong-Jones, George Miranda
- **Site Reliability Engineering (Book):** By Google SRE Team
- **OpenTelemetry:** https://opentelemetry.io/

---

**Questions? Issues?** Open a GitHub issue or contact the dev team at dev-team@vendorvault.com

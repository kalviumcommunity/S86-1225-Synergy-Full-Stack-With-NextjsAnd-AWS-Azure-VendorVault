# Screenshots Guide - Logging and Monitoring

For your assignment submission, capture the following screenshots:

---

## 1. Structured Log Output

**Location:** Console/Terminal

**What to capture:**
- JSON structured logs from the application
- Multiple log entries showing different log levels (info, warn, error)
- Correlation IDs visible in logs
- Metadata fields (requestId, endpoint, duration, statusCode)

**How to capture:**
```bash
# Start application
npm run dev

# Generate logs
curl http://localhost:3000/api/logging-demo

# Capture terminal output showing JSON logs
```

**File name:** `01-structured-logs-console.png`

**Should show:**
- ✅ JSON format
- ✅ Timestamp in ISO 8601 format
- ✅ Log level field
- ✅ Message field
- ✅ Metadata object with requestId
- ✅ Service and version fields

---

## 2. CloudWatch Dashboard (AWS)

**Location:** AWS Console → CloudWatch → Dashboards

**What to capture:**
- Complete VendorVault-Production-Dashboard
- All 9 widgets with live data
- Error trends, response time, CPU/memory graphs
- Recent error logs table
- Slow requests table

**How to capture:**
1. Go to https://console.aws.amazon.com/cloudwatch/
2. Navigate to Dashboards → VendorVault-Production-Dashboard
3. Set time range to "Last 1 hour" or "Last 3 hours"
4. Wait for all widgets to load with data
5. Take full-page screenshot

**File name:** `02-cloudwatch-dashboard.png`

**Should show:**
- ✅ Dashboard name at top
- ✅ All widgets with data (not "No data")
- ✅ Time range selector
- ✅ Error count graph
- ✅ Response time graph
- ✅ Resource utilization graphs

---

## 3. CloudWatch Logs Insights Query (AWS)

**Location:** AWS Console → CloudWatch → Logs Insights

**What to capture:**
- Log query showing errors
- Query results table
- Multiple log entries
- JSON fields expanded

**Query to use:**
```sql
fields @timestamp, level, message, metadata.requestId, metadata.endpoint
| filter level = "error"
| sort @timestamp desc
| limit 20
```

**How to capture:**
1. Go to CloudWatch → Logs Insights
2. Select log group: `/ecs/vendorvault`
3. Paste the query above
4. Set time range to "Last 1 hour"
5. Click "Run query"
6. Take screenshot showing query and results

**File name:** `03-cloudwatch-logs-query.png`

**Should show:**
- ✅ Log group selected
- ✅ Query text visible
- ✅ Results table with multiple rows
- ✅ JSON fields in results
- ✅ Timestamp, level, message columns

---

## 4. CloudWatch Alarms (AWS)

**Location:** AWS Console → CloudWatch → Alarms

**What to capture:**
- List of all configured alarms
- Alarm states (OK, ALARM, or INSUFFICIENT_DATA)
- Alarm names starting with "VendorVault-"

**How to capture:**
1. Go to CloudWatch → Alarms → All alarms
2. Filter by "VendorVault"
3. Ensure all 8 alarms are visible
4. Take screenshot

**File name:** `04-cloudwatch-alarms.png`

**Should show:**
- ✅ 8 alarms listed
- ✅ Alarm names visible
- ✅ Current state for each
- ✅ Metric name column
- ✅ Threshold column

**Bonus:** Click on one alarm and capture detail view showing:
- Alarm configuration
- SNS topic
- Evaluation periods
- Threshold

**Bonus file name:** `04b-cloudwatch-alarm-detail.png`

---

## 5. Azure Monitor Dashboard

**Location:** Azure Portal → Monitor → Dashboards

**What to capture:**
- VendorVault Production dashboard
- All tiles with KQL query visualizations
- Error trends, response time charts
- Log tables

**How to capture:**
1. Go to https://portal.azure.com/
2. Navigate to Monitor → Dashboards
3. Select "VendorVault Production" dashboard
4. Wait for all tiles to load
5. Take full-page screenshot

**File name:** `05-azure-monitor-dashboard.png`

**Should show:**
- ✅ Dashboard name
- ✅ Multiple tiles with charts
- ✅ Time range selector
- ✅ Error count chart
- ✅ Response time chart
- ✅ Log query results

---

## 6. Azure Log Analytics Query

**Location:** Azure Portal → Monitor → Logs

**What to capture:**
- KQL query showing errors
- Query results table
- Multiple log entries with parsed JSON

**Query to use:**
```kusto
AppServiceConsoleLogs
| where TimeGenerated > ago(1h)
| where ResultDescription contains "\"level\":\"error\""
| extend LogData = parse_json(ResultDescription)
| project 
    TimeGenerated,
    Level = LogData.level,
    Message = LogData.message,
    RequestId = LogData.metadata.requestId,
    Endpoint = LogData.metadata.endpoint
| order by TimeGenerated desc
| limit 20
```

**How to capture:**
1. Go to Monitor → Logs
2. Select scope: vendorvault-logs workspace
3. Paste KQL query
4. Set time range to "Last hour"
5. Click "Run"
6. Take screenshot showing query and results

**File name:** `06-azure-logs-query.png`

**Should show:**
- ✅ Workspace selected
- ✅ KQL query visible
- ✅ Results table with columns
- ✅ Parsed JSON fields
- ✅ Multiple rows of data

---

## 7. Azure Alerts Configuration

**Location:** Azure Portal → Monitor → Alerts

**What to capture:**
- List of alert rules
- Alert rule names
- Status and severity

**How to capture:**
1. Go to Monitor → Alerts → Alert rules
2. Filter by resource group: vendorvault-rg
3. Ensure all 8 alerts visible
4. Take screenshot

**File name:** `07-azure-alerts.png`

**Should show:**
- ✅ 8 alert rules listed
- ✅ Alert names with "VendorVault-" prefix
- ✅ Resource column
- ✅ Severity column
- ✅ Enabled status

**Bonus:** Click on one alert and capture:
- Alert rule details
- Condition configuration
- Action group assignment

**Bonus file name:** `07b-azure-alert-detail.png`

---

## 8. Request Trace with Correlation ID

**What to capture:**
- Complete request lifecycle
- Multiple log entries with same requestId
- Shows request → processing → response flow

**How to capture:**
1. Make API request and note the X-Request-ID from response:
   ```bash
   curl -v http://localhost:3000/api/logging-demo
   # Note the X-Request-ID header value
   ```

2. Search logs for that requestId:
   
   **CloudWatch:**
   ```sql
   fields @timestamp, message, metadata.duration
   | filter metadata.requestId = "YOUR_REQUEST_ID"
   | sort @timestamp asc
   ```

   **Azure:**
   ```kusto
   AppServiceConsoleLogs
   | extend LogData = parse_json(ResultDescription)
   | where tostring(LogData.metadata.requestId) == "YOUR_REQUEST_ID"
   | project TimeGenerated, Message = LogData.message, Duration = LogData.metadata.duration
   | order by TimeGenerated asc
   ```

3. Take screenshot showing chronological log entries

**File name:** `08-request-trace-correlation.png`

**Should show:**
- ✅ Same requestId in all entries
- ✅ Chronological order (timestamps)
- ✅ Request start log
- ✅ Processing logs (database query, etc.)
- ✅ Request completion log
- ✅ Duration visible

---

## 9. Metric Filters (AWS) or Log Analytics Workspace (Azure)

### For AWS:

**Location:** CloudWatch → Logs → Log groups → Metric filters

**What to capture:**
- List of metric filters for /ecs/vendorvault
- Filter names and patterns
- Metric names

**File name:** `09-aws-metric-filters.png`

### For Azure:

**Location:** Monitor → Log Analytics workspaces

**What to capture:**
- Workspace overview
- Usage and estimated costs
- Data ingestion statistics

**File name:** `09-azure-workspace.png`

---

## 10. Alert Notification (Email or SMS)

**What to capture:**
- Email notification from CloudWatch/Azure Monitor
- Shows alarm/alert triggered
- Includes alarm details

**How to trigger:**
1. Simulate errors to trigger alarm:
   ```bash
   # Generate 15 errors quickly
   for i in {1..15}; do
     curl -X POST http://localhost:3000/api/logging-demo \
       -H "Content-Type: application/json" \
       -d '{"simulateError": true}'
   done
   ```

2. Wait 5-10 minutes for alarm to trigger
3. Check email for notification
4. Take screenshot of email

**File name:** `10-alert-notification-email.png`

**Should show:**
- ✅ From: AWS SNS or Azure Monitor
- ✅ Subject with alarm name
- ✅ Alarm description
- ✅ Threshold exceeded
- ✅ Timestamp

---

## Screenshot Checklist

Before submitting, ensure you have:

- [ ] `01-structured-logs-console.png` - JSON logs in terminal
- [ ] `02-cloudwatch-dashboard.png` - AWS dashboard with all widgets
- [ ] `03-cloudwatch-logs-query.png` - CloudWatch Insights query results
- [ ] `04-cloudwatch-alarms.png` - List of CloudWatch alarms
- [ ] `05-azure-monitor-dashboard.png` - Azure Monitor dashboard
- [ ] `06-azure-logs-query.png` - KQL query results
- [ ] `07-azure-alerts.png` - List of Azure alert rules
- [ ] `08-request-trace-correlation.png` - Full request trace
- [ ] `09-aws-metric-filters.png` OR `09-azure-workspace.png` - Platform-specific
- [ ] `10-alert-notification-email.png` - Email/SMS notification

**Optional but recommended:**
- [ ] `04b-cloudwatch-alarm-detail.png` - Alarm configuration detail
- [ ] `07b-azure-alert-detail.png` - Alert rule detail
- [ ] `11-performance-dashboard.png` - Response time and metrics
- [ ] `12-error-dashboard.png` - Error trends over time

---

## Tips for Good Screenshots

1. **Full Context**: Include browser URL bar and page title
2. **High Resolution**: Use at least 1920x1080 resolution
3. **Clear Text**: Ensure log text is readable (zoom if needed)
4. **Data Visible**: Wait for all widgets/charts to load
5. **Annotations**: Add arrows or highlights to key areas (optional)
6. **Consistent Naming**: Follow the naming convention above
7. **Dark Mode**: Use light mode for better visibility in documents

---

## Organizing Screenshots

Create a folder structure:
```
screenshots/
├── aws/
│   ├── 02-cloudwatch-dashboard.png
│   ├── 03-cloudwatch-logs-query.png
│   ├── 04-cloudwatch-alarms.png
│   └── 09-aws-metric-filters.png
├── azure/
│   ├── 05-azure-monitor-dashboard.png
│   ├── 06-azure-logs-query.png
│   ├── 07-azure-alerts.png
│   └── 09-azure-workspace.png
├── local/
│   ├── 01-structured-logs-console.png
│   └── 08-request-trace-correlation.png
└── notifications/
    └── 10-alert-notification-email.png
```

---

## Adding Screenshots to Documentation

Update LOGGING_MONITORING.md with actual screenshots:

```markdown
### CloudWatch Dashboard
![CloudWatch Dashboard](screenshots/aws/02-cloudwatch-dashboard.png)

### Azure Monitor Dashboard
![Azure Monitor Dashboard](screenshots/azure/05-azure-monitor-dashboard.png)

### Request Trace
![Request Trace](screenshots/local/08-request-trace-correlation.png)
```

---

**Good luck with your screenshots!** 📸

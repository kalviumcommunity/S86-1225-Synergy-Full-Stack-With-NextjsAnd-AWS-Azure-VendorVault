# Screenshots Directory

This directory contains screenshots for the Logging and Monitoring assignment.

## Structure

```
screenshots/
├── aws/                    - AWS CloudWatch screenshots
├── azure/                  - Azure Monitor screenshots
├── local/                  - Local development screenshots
└── notifications/          - Alert notification screenshots
```

## Required Screenshots

See [deployment/monitoring/SCREENSHOTS_GUIDE.md](../deployment/monitoring/SCREENSHOTS_GUIDE.md) for detailed instructions on what to capture.

### AWS (4 screenshots)
- `02-cloudwatch-dashboard.png`
- `03-cloudwatch-logs-query.png`
- `04-cloudwatch-alarms.png`
- `09-aws-metric-filters.png`

### Azure (4 screenshots)
- `05-azure-monitor-dashboard.png`
- `06-azure-logs-query.png`
- `07-azure-alerts.png`
- `09-azure-workspace.png`

### Local (2 screenshots)
- `01-structured-logs-console.png`
- `08-request-trace-correlation.png`

### Notifications (1 screenshot)
- `10-alert-notification-email.png`

## How to Add Screenshots

1. Capture screenshots following the guide
2. Save with the correct filename in the appropriate folder
3. Verify image quality and readability
4. Update documentation with image references

## Image Requirements

- **Format:** PNG (preferred) or JPG
- **Resolution:** At least 1920x1080
- **File size:** Keep under 5MB per image
- **Text:** Ensure all text is readable
- **Context:** Include browser/terminal chrome for context

## Adding to Documentation

Reference screenshots in Markdown:

```markdown
![CloudWatch Dashboard](screenshots/aws/02-cloudwatch-dashboard.png)
```

Or with caption:

```markdown
**CloudWatch Dashboard:**
![Dashboard showing error trends and performance metrics](screenshots/aws/02-cloudwatch-dashboard.png)
*Figure 1: Production dashboard with 9 monitoring widgets*
```

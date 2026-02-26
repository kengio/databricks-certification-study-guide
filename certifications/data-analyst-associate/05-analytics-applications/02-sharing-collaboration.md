---
title: Sharing & Collaboration
type: study-material
tags:
  - sharing
  - collaboration
  - permissions
  - distribution
---

# Sharing & Collaboration

## Overview

Sharing queries, dashboards, and results enables teams to collaborate effectively. Databricks provides fine-grained access controls, version history, and distribution mechanisms.

## Sharing Objects

### What Can Be Shared

```yaml
Shareable Objects:
  Queries:
    - SQL query files
    - Saved queries
    - Ad-hoc queries

  Dashboards:
    - Published dashboards
    - Draft dashboards
    - Dashboard snapshots

  Notebooks:
    - Data analysis notebooks
    - Documentation
    - Shared workspaces

  Data:
    - Tables via views
    - External files
    - Reports
```

## Permission Levels

### Role-Based Access

```yaml
Permissions Hierarchy:

Owner (Creator):
  - View, Edit, Delete object
  - Change permissions
  - Share with others
  - Set refresh schedules

Editor:
  - View, Edit object
  - Share with others
  - Cannot delete
  - Cannot change owner

Viewer:
  - View object only
  - Can interact (filters, parameters)
  - Cannot edit
  - Can duplicate to own workspace

Commenter (on queries):
  - View + leave comments
  - Cannot edit query
```

### Permission Inheritance

```text
Query → Dashboard
  If query permission: "Viewer"
  Then dashboard must have: "Viewer" or higher

Dashboard → Underlying Queries
  Must have permission to queries displayed
  If no query permission, widget shows error
```

## Sharing Methods

### Direct User/Group Sharing

```yaml
Share Dashboard with People:

  Method: Dashboard Settings → Share

  Add Users:
    Name: analyst@company.com
    Role: Viewer
    [Add]

    Name: engineer@company.com
    Role: Editor
    [Add]

  Add Groups:
    Name: Sales Team
    Role: Viewer
    [Add]

  Result:
    - All team members can access immediately
    - Permissions managed centrally
    - Changes apply to all members
```

### Shareable Link

```yaml
Generate Shareable Link:

Dashboard Settings → Share → Copy Link

Link: https://databricks.com/sql/dashboards/shared/abc123xyz

Link Characteristics:
  - Anyone with link can view (if permissions allow)
  - Can be shared via email, chat, etc.
  - Works across organizations (with auth)
  - Lifetime: Indefinite until revoked
```

### Email Distribution

```yaml
Schedule Email Distribution:

Dashboard Actions → Email Schedule

Schedule Configuration:
  Name: "Weekly Sales Report"
  Frequency: Every Monday 8 AM
  Recipients: sales-team@company.com

Email Content:
  Subject: "Weekly Sales Report - {{week}}"
  Body: Text introduction
  Attachment: Dashboard snapshot (PNG)
  Attachment: CSV export of data
  Include: Link to live dashboard

Send Options:
  - Static snapshot (PNG image)
  - Query results (CSV/Excel)
  - Link to interactive dashboard
```

### Embedded in Applications

```html
<!-- Embed dashboard in website or app -->
<iframe
  src="https://databricks.com/sql/dashboards/shared/abc123"
  width="100%"
  height="600">
</iframe>

<!-- Parameters via URL -->
<iframe
  src="https://databricks.com/sql/dashboards/shared/abc123
    ?region=West&year=2024"
  width="100%"
  height="600">
</iframe>
```

## Collaboration Features

### Comments & Annotations

```yaml
Query/Dashboard Comments:

Users can:
  - Add comment threads
  - Mention @colleague for notification
  - Tag with #labels (e.g., #urgent, #review)
  - Pin important notes

Example:
  Comment: "@eng_team This query needs optimization"
  Reply: "Done! Reduced from 45s to 8s"
  Resolved: Mark as resolved
```

### Version History

```yaml
Query Version Control:

Save Query:
  v1: Initial query (2024-01-01 10:00)
  v2: Added filter (2024-01-01 14:30)
  v3: Fixed aggregation (2024-01-02 09:15)
  v4: [Current version]

View History:
  - See all versions in sidebar
  - Restore previous version
  - Compare two versions
  - View who changed what
```

### Diff/Compare Versions

```text
Version 3 → Version 4 Diff:

- SELECT *        ← Removed
- SELECT id, name, email     ← Added

  FROM customers

- WHERE status = 'active'     ← Modified
+ WHERE status = 'active'
+   AND signup_date >= '2024-01-01'    ← Added
+   LIMIT 1000  ← Added
```

## Publishing & Release

### Draft vs Published

```yaml
Query States:

Draft:
  - Personal workspace only
  - Unsaved changes
  - Not shared widely
  - Can discard without impact

Published:
  - Visible to shared audience
  - Version controlled
  - Locked for integrity
  - Changes require version bump
```

### Publishing Process

```text
Draft Query
    ↓ (Edit / Test)
Review (Share with approvers)
    ↓ (Get feedback)
Revise (Address comments)
    ↓ (Fix issues)
Publish (Release to audience)
    ↓ (Set permissions)
Announce (Notify users)
```

## Governance & Security

### Access Control Best Practices

```yaml
✅ Do:
  - Use groups for permission management
  - Grant minimum necessary access
  - Use Viewer role by default
  - Review access quarterly

❌ Don't:
  - Share with "everyone" indiscriminately
  - Use Owner role for viewers
  - Change permissions after sharing widely
  - Forget to revoke access when employee leaves
```

### Data Sensitivity

```yaml
Data Classifications:

Public:
  - Share broadly
  - No restrictions
  - Can email externally

Internal:
  - Share within company
  - Require authentication
  - Not for external distribution

Confidential:
  - Limited to specific team
  - Requires explicit approval
  - Cannot embed publicly

Restricted (PII):
  - Only authorized users
  - Masked/limited columns
  - No external access
  - Audit logged
```

### Audit & Compliance

```sql
-- Track who accessed what
SELECT
    workspace_id,
    object_type,      -- Query, Dashboard, Table
    object_id,
    user_name,
    action,           -- View, Edit, Share, Delete
    timestamp
FROM system.access_logs
WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL 30 DAYS
ORDER BY timestamp DESC;

-- Compliance report
SELECT
    query_name,
    owner,
    viewer_count,
    ARRAY_JOIN(viewers, ', ') as viewers,
    last_accessed
FROM query_metrics
WHERE last_accessed >= CURRENT_TIMESTAMP - INTERVAL 90 DAYS;
```

## Collaboration Workflows

### Code Review Process

```yaml
Query Review Workflow:

1. Developer creates query (draft)
2. Shares with: Reviewer (Commenter role)
3. Reviewer adds comments/suggestions
4. Developer revises based on feedback
5. Reviewer approves
6. Query published to production
7. Announce to users via email
8. Monitor performance/issues
```

### Dashboard Development Cycle

```yaml
Phase 1: Exploration
  - Analyst creates draft dashboard
  - Shares with manager (editor access)
  - Tests queries and visualizations
  - Iterates on design

Phase 2: Validation
  - Manager reviews accuracy
  - Tests with real scenarios
  - Approves publish

Phase 3: Release
  - Publish dashboard
  - Grant viewer access to team
  - Send announcement email
  - Monitor usage/issues

Phase 4: Maintenance
  - Track query performance
  - Answer user questions
  - Plan updates/improvements
```

## Communication & Documentation

### README & Labels

```markdown

# Sales Performance Dashboard

## Purpose

Tracks weekly sales by region and product

## Audience

- Sales directors
- Regional managers
- Insights team

## Update Frequency

Daily at 8 AM

## Key Metrics

- Total Revenue ($ sum)
- Order Count (# transactions)
- Average Order Value ($ per order)

## How to Use

1. Select date range with filters
2. Click region for drill-down
3. Export data via "Download" button

## Questions?

Contact: analytics@company.com
Last Updated: 2024-02-15
Maintained By: Analytics Team
```

### Metadata & Tags

```yaml
Dashboard Metadata:

Name: Sales Performance
Description: Weekly sales metrics by region
Tags: #sales #weekly #performance #directors
Owner: analytics_team@company.com
Status: Production
Last Updated: 2024-02-15
Refresh Frequency: Daily 8 AM
Dependencies: orders, customers, product tables
```

## Team Collaboration Platforms

### Slack Integration

```yaml
Databricks ↔ Slack:

Share in Slack:
  /databricks share https://link.to/dashboard

  Slack Action:
  - Preview dashboard in message
  - Quick link to open in browser
  - Button to request access

Subscribe to Alerts:
  /databricks subscribe dashboard-name

  Slack Actions:
  - Daily summary in channel
  - Alerts when thresholds crossed
  - Query results posted
```

## Use Cases

- **Team Dashboard Distribution**: Sharing a published dashboard with an entire group (e.g., Sales Team as Viewer) so all members see the same metrics without individual setup.
- **Pre-filtered Links for Stakeholders**: Distributing URL-parameterized dashboard links so each regional manager opens the dashboard pre-filtered to their region.

## Common Issues & Errors

### Shared Dashboard Shows "Permission Denied"

**Scenario:** A colleague clicks the shared dashboard link but gets an access error.
**Fix:** The viewer needs at minimum `CAN VIEW` on the dashboard AND `SELECT` permission (plus `USE CATALOG`/`USE SCHEMA`) on the underlying tables.

## Exam Tips

- Editor role allows editing but cannot change permissions or delete; Owner has full control
- Protect sensitive data by granting Viewer access to masked views, not raw tables
- Use groups (not individual users) to manage permissions at scale for 50+ users
- Audit logs track who viewed, edited, or shared dashboards and queries

## Key Takeaways

- **Permission levels**: Owner (full), Editor (edit), Viewer (read-only)
- **Sharing methods**: Direct (users/groups), URL link, email
- **Comments**: Collaborate on queries/dashboards
- **Version history**: Track changes, restore previous versions
- **Draft vs Published**: Development vs production states
- **Access control**: Groups for scalability, audit permissions
- **Data sensitivity**: Public, Internal, Confidential, Restricted levels
- **Workflows**: Review → Revise → Publish → Announce
- **Integration**: Slack notifications, email distribution

## Related Topics

- [Access Control & Security](../02-data-management/03-access-control.md) - Detailed RBAC and permission management
- [Unity Catalog Basics](../../../shared/fundamentals/unity-catalog-basics.md) - Governance framework that underpins sharing controls
- [Dashboards & Dashboard Design](../04-dashboards-visualization/01-dashboards.md) - Creating dashboards to share with teams

## Official Documentation

- [Databricks SQL Sharing](https://docs.databricks.com/sql/user/queries/share-query.html)
- [Dashboard Permissions](https://docs.databricks.com/sql/user/dashboards/dashboard-permissions.html)

---

**[← Previous: Query Parameters & Dynamic Queries](./01-parameters-queries.md) | [↑ Back to Analytics Applications](./README.md)**

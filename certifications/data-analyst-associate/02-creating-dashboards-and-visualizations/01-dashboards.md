---
title: Dashboards & Dashboard Design
type: study-material
tags:
  - dashboards
  - design
  - layout
  - interactive
---

# Dashboards & Dashboard Design

## Overview

Dashboards are interactive collections of visualizations that communicate data insights. Effective dashboard design balances aesthetic appeal with functionality and user context.

## Dashboard Architecture

```mermaid
flowchart TD
    subgraph Dashboard["Dashboard Components"]
        Title["Title & Description"]
        Filters["Filters & Parameters"]
        Widgets["Visualization Widgets"]
        Text["Text & Links"]
    end

    subgraph Backend["Backend"]
        Queries["Queries"]
        Warehouse["SQL Warehouse"]
        Cache["Result Cache"]
    end

    subgraph Users["Users"]
        Analyst["Data Analysts"]
        Exec["Executives"]
        Stakeholders["Stakeholders"]
    end

    Dashboard --> Backend
    Backend --> Users
```

## Creating Dashboards

### Dashboard Basic Setup

```yaml
Create Dashboard:
  Name: "Sales Performance Dashboard"
  Description: "Weekly sales metrics and trends"
  Permissions:
    Owner: analyst_team@company.com
    Viewers: everyone@company.com

Dashboard Settings:
  Refresh Schedule: Every 8 hours
  Timezone: America/New_York
  Layout: Grid (auto-resizing)
  Color Theme: Light/Dark
```

### Dashboard Navigation

**UI Structure:**

```text
[Dashboard Name]
├─ Filters/Parameters (top bar)
├─ Title & Description
├─ Row 1: KPI Cards
├─ Row 2: Charts & Trends
├─ Row 3: Detailed Metrics
└─ Row 4: Drill-down Tables
```

## Dashboard Widgets

### Widget Types

```mermaid
flowchart LR
    Widgets["Dashboard Widgets"]

    Widgets --> KPI["KPI Card<br/>Single metric"]
    Widgets --> Chart["Chart<br/>Visual analysis"]
    Widgets --> Table["Table<br/>Detailed data"]
    Widgets --> Gauge["Gauge<br/>Progress"]
    Widgets --> Text["Text<br/>Context"]
```

### KPI Card Widget

```sql
-- Query for KPI card (single number)
SELECT COUNT(*) as total_orders
FROM orders
WHERE order_date >= CURRENT_DATE - 30;

-- Output: 1,245
```

**Widget Configuration:**

```yaml
Type: Scalar (Number)
Format: 1,234 (with thousand separator)
Font Size: Large (for prominence)
Color: Green/Red based on threshold
Icon: Up arrow (for trend)
Comparison: "↑ 15% vs last month"
```

### Time Series Chart

```sql
-- Daily revenue trend
SELECT
    DATE_TRUNC('day', order_date) as day,
    SUM(amount) as revenue,
    COUNT(*) as order_count
FROM orders
WHERE order_date >= CURRENT_DATE - 90
GROUP BY DATE_TRUNC('day', order_date)
ORDER BY day;
```

**Visualization Configuration:**

```yaml
Type: Line Chart
X-axis: day (time)
Y-axis: revenue (quantity)
Series: Multiple lines (order_count on secondary Y)
Zoom: Enable
Legend: Display
Colors: Brand colors (blue #0066CC)
Tooltip: Show on hover
```

### Category Comparison (Bar Chart)

```sql
-- Revenue by region
SELECT
    region,
    SUM(amount) as revenue,
    COUNT(DISTINCT customer_id) as customers
FROM orders
GROUP BY region
ORDER BY revenue DESC;
```

**Visualization Configuration:**

```yaml
Type: Bar Chart
X-axis: region (categories)
Y-axis: revenue (quantity)
Sort: Descending by revenue
Colors: Sequential gradient
Drill-down: Click region for detailed view
Show Values: On bars
```

### Gauge/Progress Widget

```sql
-- Performance against target
SELECT
    SUM(amount) as actual,
    500000 as target,
    ROUND(SUM(amount) * 100.0 / 500000, 1) as pct_of_target
FROM orders
WHERE order_date >= CURRENT_DATE - 30;

-- Output: actual=475000, target=500000, pct_of_target=95%
```

**Visualization Configuration:**

```yaml
Type: Gauge Chart
Min: 0
Max: 500000 (target)
Current: 475000 (actual)
Threshold:
  Green: 85-100%
  Yellow: 70-84%
  Red: <70%
Display: Percentage (95%)
```

## Dashboard Layout & Design

### Grid System

```text
Dashboard 12-column grid:
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│ KPI  │ KPI  │ KPI  │KPI │  (Row 1: 3 cols each)
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│            │            │  (Row 2: 6 cols each)
│   Chart 1  │  Chart 2   │
│            │            │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                          │  (Row 3: 12 cols full width)
│        Data Table        │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

### Design Best Practices

**1. Visual Hierarchy**

```text
Dashboard Structure:
├─ 1. Title (prominent, at top)
├─ 2. Key metrics (KPIs first, largest)
├─ 3. Trends (time-series charts)
├─ 4. Details (filtered data, tables)
└─ 5. Context (definitions, links)
```

**2. Color Coding**

```text
Standard Colors:
  Green: Positive, good, exceeds target
  Yellow: Caution, meets target
  Red: Negative, below target
  Blue: Neutral information
  Gray: Disabled/unavailable states
```

**3. Information Density**

```text
❌ Too dense:
├─ 20+ charts on one page
├─ No white space
└─ Hard to scan

✅ Balanced:
├─ 5-8 key visualizations
├─ Clear sections
├─ White space for focus
└─ Easy to scan
```

## Interactivity & Parameters

### Dashboard Filters

```sql
-- Query with multiple parameters
SELECT
    DATE_TRUNC('day', order_date) as day,
    region,
    SUM(amount) as revenue
FROM orders
WHERE order_date >= '{{ start_date }}'
  AND order_date <= '{{ end_date }}'
  AND region = '{{ selected_region }}'
GROUP BY DATE_TRUNC('day', order_date), region;
```

**Filter Widget Configuration:**

```yaml
Parameter: start_date
  Type: Date Picker
  Default: CURRENT_DATE - 30

Parameter: end_date
  Type: Date Picker
  Default: CURRENT_DATE

Parameter: selected_region
  Type: Dropdown
  Options: North, South, East, West, All
  Default: All
```

### Drill-down Navigation

```sql
-- Dashboard query (summary level)
SELECT
    region,
    COUNT(*) as orders,
    SUM(amount) as revenue
FROM orders
GROUP BY region;

-- Drill-down query (detail level, triggered by click)
SELECT
    region,
    store_id,
    COUNT(*) as orders,
    SUM(amount) as revenue
FROM orders
WHERE region = '{{ selected_region }}'
GROUP BY region, store_id;
```

**Navigation Configuration:**

```yaml
Dashboard:
  - Regional Summary (click for drill)
    └─ Link to Store Detail Dashboard
         with parameter: region_filter = selected_region
```

## Refresh Strategy

### Scheduled Refresh

```yaml
Refresh Options:
  Manual: Click "Refresh" button
  Every 8 hours: Good for stable dashboards
  Every hour: For active monitoring
  Every 5 minutes: Real-time dashboards
  Never: Static snapshots
```

### Query Caching

```yaml
Cache Strategy:
  Result Cache: 24 hours (default)
  Dashboard Refresh: Uses warehouse cache
  Avoid refreshing same query repeatedly

  Manual Cache Clear:
  - Edit query
  - Change parameters
  - Re-run to bypass cache
```

## Sharing & Collaboration

### Permission Levels

```yaml
Dashboard Permissions:
  Owner:
    - View, Edit, Delete, Share
    - Can change permissions
    - Can set refresh schedule

  Editor:
    - View, Edit, Share
    - Cannot change owner permissions

  Viewer:
    - View only
    - Can interact with filters
    - Cannot modify dashboard
```

### Share Dashboard

```text
Dashboard Settings:
  Share → Add People/Groups
  ├─ Email: analyst@company.com (Editor)
  ├─ Email: executive@company.com (Viewer)
  └─ Group: Sales Team (Viewer)
```

### Email Subscriptions

```yaml
Scheduled Email:
  Frequency: Daily, Weekly, Monthly
  Recipients: team@company.com
  Include: Dashboard snapshot (PNG)
  Attachment: CSV export of data
```

## Dashboard Performance

### Query Optimization

```sql
-- ❌ Inefficient - full table scan
SELECT * FROM orders;

-- ✅ Optimized - with filters
SELECT
    region,
    SUM(amount)
FROM orders
WHERE order_date >= CURRENT_DATE - 30
GROUP BY region;
```

### Monitoring Refresh Time

```yaml
Dashboard Performance:
  Query runtime: Should be < 5 seconds
  Dashboard load: < 2 seconds

  Optimization:
  - Reduce data range (fewer days)
  - Aggregate pre-computed tables
  - Use LIMIT for large datasets
  - Partition tables by date
```

## Dashboard Naming & Organization

### Naming Convention

```text
Good names:
  "Sales Performance - Weekly"
  "Customer Churn Analysis"
  "Inventory by Location"

Poor names:
  "Dashboard 1"
  "Report123"
  "Sales"
```

### Folder Organization

```text
Dashboards/
├── Sales/
│   ├── Daily Performance
│   ├── Regional Analysis
│   └── Customer Segmentation
├── Finance/
│   ├── Budget vs Actual
│   └── Cash Flow
└── Operations/
    ├── Inventory
    └── Supply Chain
```

## Use Cases

- **Executive KPI Monitoring**: Building a dashboard with KPI cards, trend lines, and regional breakdowns that auto-refreshes for leadership review.
- **Self-service Reporting**: Creating parameterized dashboards that let business users filter by date range, region, or product category without writing SQL.

## Common Issues & Errors

### Dashboard Shows Stale Data

**Scenario:** Dashboard displays yesterday's numbers despite new data being loaded.
**Fix:** Check the refresh schedule. Dashboards do not auto-refresh unless a schedule is configured. Click "Refresh" or set an automatic refresh interval.

## Exam Tips

- Dashboard refresh frequency depends on use case: 8 hours for stable data, hourly for monitoring, 5 minutes for real-time
- A shared parameter can filter multiple widgets simultaneously when used in each widget's query
- Editing a shared dashboard updates it for all viewers with access
- Optimize load time by filtering queries (date range), pre-aggregating data, and leveraging result caching

## Key Takeaways

- **Dashboard**: Collection of visualizations with interactivity
- **Widgets**: Individual components (KPI, chart, table, text)
- **Filters**: Parameters for dynamic queries
- **Grid layout**: 12-column flexible layout system
- **Refresh**: Scheduled or manual; uses result cache
- **Permissions**: Owner, Editor, Viewer roles
- **Sharing**: Via email, links, or groups
- **Performance**: Queries should run < 5 seconds
- **Drill-down**: Navigate from summary to detail

## Related Topics

- [Visualizations & Chart Types](./02-visualizations.md) - Choosing the right chart type for dashboard widgets
- [Alerts & Scheduling](./03-alerts-scheduling.md) - Automating dashboard refresh and alert notifications
- [SQL Essentials](../../../shared/fundamentals/sql-essentials.md) - Writing efficient queries for dashboard widgets

## Official Documentation

- [Databricks SQL Dashboards](https://docs.databricks.com/sql/user/dashboards/index.html)
- [Dashboard Widgets](https://docs.databricks.com/sql/user/dashboards/dashboard-widgets.html)

---

**[↑ Back to Dashboards & Visualization](./README.md) | [Next: Visualizations & Chart Types](./02-visualizations.md) →**

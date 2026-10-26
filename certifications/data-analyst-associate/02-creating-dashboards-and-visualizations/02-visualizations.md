---
title: Visualizations & Chart Types
type: study-material
tags:
  - visualizations
  - charts
  - formatting
  - best-practices
---

# Visualizations & Chart Types

## Overview

Different visualization types communicate data in different ways. Section 6 of the October 2025 exam guide asks you to "create visualizations in notebooks and the SQL editor" and to "identify the effective visualization type to communicate insights clearly".

> [!abstract]
>
> - In the SQL editor and notebooks: click **+** above a result, then **Visualization**
> - AI/BI dashboard visualization types include bar, line, area, pie, scatter, counter, table, pivot, histogram, heatmap, funnel, maps, and more
> - Pick the chart from the question: compare, trend, part of whole, distribution, relationship

> [!tip] What the Exam Tests
>
> - Matching a business question to the right visualization
> - Where visualizations can be created and added to dashboards

---

## Creating Visualizations in the SQL Editor and Notebooks

1. Run a query (SQL editor) or a cell (notebook).
2. Click **+** above the result and select **Visualization**.
3. Choose the **Visualization Type**, map the columns, and save.

- In a notebook, a visualization from a SQL cell can be added to an AI/BI dashboard (**Add to dashboard**). Visualizations from non-SQL cells and data profiles can be added only to a notebook dashboard.
- Filters applied to a result table also affect its visualizations.
- A notebook **data profile** gives summary statistics and histograms for each column.

AI/BI dashboard visualization types: area, bar, box, bubble, choropleth map, cohort, combo, counter, custom, funnel, Gantt, heatmap, histogram, line, path map, pie, pivot, point map, Sankey, scatter, table, and waterfall.

Sources: [Visualizations in notebooks and the SQL editor](https://docs.databricks.com/aws/en/visualizations/), [Dashboard visualization types](https://docs.databricks.com/aws/en/dashboards/visualizations/types) (checked 2026-10-26).

## Chart Selection Guide

```mermaid
flowchart TD
    Q["What question do you<br/>want to answer?"]

    Q -->|Compare<br/>categories| BC["Bar Chart"]
    Q -->|Show<br/>trends over time| LC["Line Chart"]
    Q -->|Show<br/>part of whole| PC["Pie/Donut"]
    Q -->|Show<br/>distribution| HS["Histogram"]
    Q -->|Show<br/>correlation| SC["Scatter Plot"]
    Q -->|Show<br/>relationships| TB["Table"]

    BC --> BCE["✓ Best for: 5-15 categories<br/>✓ Use: Revenue by region"]
    LC --> LCE["✓ Best for: Time series<br/>✓ Use: Sales over 12 months"]
    PC --> PCE["✓ Best for: Single breakdown<br/>✓ Use: Market share"]
    HS --> HSE["✓ Best for: Distribution shape<br/>✓ Use: Customer age ranges"]
    SC --> SCE["✓ Best for: Relationship analysis<br/>✓ Use: Price vs demand"]
    TB --> TBE["✓ Best for: Detailed data<br/>✓ Use: Exact numbers"]
```

## Core Chart Types

### Bar Chart

**Purpose**: Compare values across categories

```sql
-- Revenue by region
SELECT region, SUM(amount) as revenue
FROM orders
GROUP BY region
ORDER BY revenue DESC;
```

**Visualization Settings:**

```yaml
Type: Column Chart (vertical bars)
X-axis: region (categorical)
Y-axis: revenue (quantitative)
Sort: Descending
Colors: Single color or gradient
Show Values: On bars or hover
Stacked: No (comparison)
```

**Variants:**

```text
Vertical Column Chart: Good for limited categories
Horizontal Bar Chart: Better for long labels (>20 chars)
Stacked Bar: Show totals + breakdown
Clustered Bar: Compare multiple series
```

**Best Practices:**

- ✅ Limit to 5-15 categories (more = uses table)
- ✅ Sort by value (makes patterns obvious)
- ✅ Use same scale on Y-axis
- ❌ 3D effects (distorts perception)

### Line Chart

**Purpose**: Show trends over time

```sql
-- Weekly revenue trend
SELECT
    DATE_TRUNC('week', order_date) as week,
    SUM(amount) as revenue
FROM orders
GROUP BY DATE_TRUNC('week', order_date)
ORDER BY week;
```

**Visualization Settings:**

```yaml
Type: Line Chart
X-axis: week (time)
Y-axis: revenue (quantitative)
Line Style: Solid
Markers: Dots at data points
Zoom: Enable for time-series
Multiple Series: Support for overlays
Forecast: Optional trend line
```

**Best Practices:**

- ✅ Use for sequential, time-ordered data
- ✅ Multiple series for comparison (2-4 lines)
- ✅ Add trend line for forecast
- ✅ Enable zoom for detailed inspection
- ❌ More than 4 lines = unreadable

### Pie Chart

**Purpose**: Show part-to-whole relationships (market share, composition)

```sql
-- Market share by company
SELECT
    company_name,
    COUNT(*) as orders,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as market_share_pct
FROM orders
GROUP BY company_name
ORDER BY orders DESC;
```

**Visualization Settings:**

```yaml
Type: Pie Chart
Values: orders
Labels: company_name + market_share_pct
Colors: Distinct colors or palette
Donut Style: Optional center cutout
Legend: Show company names
```

**When to Use:**

- ✅ 3-5 slices only
- ✅ Show composition (80% red, 20% blue)
- ✅ Part-of-whole relationships

**When to Avoid:**

- ❌ >5 slices (comparison hard)
- ❌ Comparing values (use bar instead)
- ❌ Precise values (label with %)

### Scatter Plot

**Purpose**: Show relationship/correlation between two variables

```sql
-- Price vs revenue correlation
SELECT
    price,
    revenue_generated
FROM products
WHERE category = 'electronics'
ORDER BY price;
```

**Visualization Settings:**

```yaml
Type: Scatter Plot
X-axis: price
Y-axis: revenue_generated
Bubble Size: Optional third metric
Color: Optional category
Trend Line: Linear regression fit
Correlation Coefficient: Show R²
```

**Interpretation:**

```text
Scatter Pattern Analysis:
  Tight cluster along diagonal: Strong positive correlation
  Inverse diagonal: Strong negative correlation
  Random scatter: No correlation

R² Value:
  0.9-1.0: Very strong correlation
  0.7-0.9: Strong correlation
  0.3-0.7: Moderate correlation
  <0.3: Weak or no correlation
```

### Area Chart

**Purpose**: Show cumulative totals over time

```sql
-- Stacked area: Revenue trend by region
SELECT
    DATE_TRUNC('month', order_date) as month,
    region,
    SUM(amount) as revenue
FROM orders
GROUP BY month, region
ORDER BY month, region;
```

**Visualization Settings:**

```yaml
Type: Stacked Area Chart
X-axis: month (time)
Y-axis: revenue (quantitative)
Series: Separate area per region
Legend: Region names with colors
Stack: Stacked (cumulative) or grouped
Fill: Semi-transparent for visibility
```

**Use Cases:**

- ✅ Cumulative growth (total + breakdown)
- ✅ Resource allocation over time
- ✅ Portfolio composition changes

### Counter

**Purpose**: Display a single KPI prominently, optionally compared with an offset value

```sql
-- Current month revenue
SELECT SUM(amount) AS current_revenue
FROM orders
WHERE order_date >= DATE_TRUNC('MONTH', CURRENT_DATE);
```

### Table

**Purpose**: Show detailed data with ability to sort/filter

```sql
-- Detailed customer orders
SELECT
    order_id,
    customer_name,
    order_date,
    amount,
    status
FROM orders
ORDER BY order_date DESC
LIMIT 1000;
```

**Table Configuration:**

```yaml
Type: Table View
Columns:
  - order_id (number, right-align)
  - customer_name (text, left-align)
  - order_date (date, center)
  - amount (currency, formatted $)
  - status (text, color-coded)
Sorting: User-clickable headers
Filtering: Quick filter per column
Pagination: 25 rows per page
Export: CSV, JSON download
```

**When to Use:**

- ✅ Show exact values (not estimates)
- ✅ Large datasets (>15 data points)
- ✅ Multiple dimensions/attributes
- ✅ User wants to explore

## Chart Formatting

### Colors

```yaml
Color Strategies:
  Sequential: Light to dark (single hue)
    Use: Sales amounts, intensity

  Diverging: Blue-White-Red (two hues)
    Use: Positive/negative, above/below target

  Categorical: Distinct colors
    Use: Regions, departments, categories

Best Practices:
  - Use 3-7 colors max
  - Colorblind-friendly: Blue, orange, green
  - Avoid: Red-green combo alone
  - Use ColorBrewer for palettes
```

### Labels & Legends

```yaml
Labels:
  On Chart: Values directly on bars/points
  Hover: Tooltip with detailed info
  Axis: Clear titles (e.g., "Revenue ($)")
  Legend: Category descriptions (right/bottom)

Good Practice:
  - Descriptive axis titles
  - Format values: $100K not $100000
  - Include units: "Hours" not bare numbers
```

### Data Formatting

```sql
-- Format values for display
SELECT
    region,
    ROUND(SUM(amount), 2) as revenue,
    ROUND(COUNT(*) / 1000.0, 1) as orders_k,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as share_pct
FROM orders
GROUP BY region;

-- Formatted output:
-- region | revenue   | orders_k | share_pct
-- North  | $2500000  | 123.5    | 25.0%
```

## Multi-series Visualizations

### Combining Charts

```sql
-- Revenue and order count on one chart
SELECT
    DATE_TRUNC('week', order_date) as week,
    SUM(amount) as revenue,
    COUNT(*) as order_count
FROM orders
GROUP BY DATE_TRUNC('week', order_date)
ORDER BY week;
```

**Dual Axis Configuration:**

```yaml
Chart Type: Combination Chart
Primary Y-axis: revenue ($, bar)
Secondary Y-axis: order_count (units, line)
X-axis: week (time)
Display: Both metrics visible
Scale: Independent axes for clarity
```

### Side-by-side Comparison

```sql
-- Compare two time periods
SELECT
    DATE_TRUNC('week', order_date) as week,
    'Current Year' as period,
    SUM(amount) as revenue
FROM orders
WHERE YEAR(order_date) = 2024

UNION ALL

SELECT
    DATE_TRUNC('week', order_date) as week,
    'Prior Year' as period,
    SUM(amount) as revenue
FROM orders
WHERE YEAR(order_date) = 2023;
```

## Visualization Best Practices

### Data Integrity

```yaml
✅ Do:
  1. Show data aggregation details in tooltip
  2. Include data collection date/time
  3. Note any data limitations
  4. Round appropriately (no false precision)

❌ Don't:
  1. Hide underlying data
  2. Use confusing aggregations
  3. Misalign scales
  4. Use 3D or non-standard projections
```

### Accessibility

```yaml
Colorblind-safe palette:
  - Blue (ok for all)
  - Orange (ok for all)
  - Red (avoid for red-green colorblind)

Text:
  - Use font size >= 12pt
  - Use sufficient contrast (4.5:1 ratio)
  - Avoid small text in legend

Alternative:
  - Provide data table option
  - Include text description
```

## Use Cases

- **Sales Trend Analysis**: Using line charts to show revenue over time with multiple series for year-over-year comparison.
- **Market Share Breakdown**: Using pie or donut charts (with 3-5 slices) to communicate composition at a glance in executive presentations.

## Common Issues & Errors

### Chart Not Rendering Correctly

**Scenario:** A bar chart shows only one bar despite multiple categories in the data.
**Fix:** Verify the X-axis column is categorical (not a single aggregated value). Check column mappings in the visualization editor.

## Exam Tips

1. **Chart selection** - Bar chart for category comparison, line chart for trends over time, scatter for correlation
2. **Pie chart limit** - Best for 5 or fewer slices; more categories become hard to read
3. **Histogram vs bar chart** - Histogram shows distribution of a single numeric variable; bar chart compares categories
4. **Scatter plot R²** - R² close to 1 means strong linear relationship; close to 0 means weak or no relationship
5. **Dual-axis charts** - Use when comparing two metrics with different scales (e.g., revenue and count)
6. **Color usage** - Use sequential palettes for continuous data, categorical palettes for distinct groups
7. **Aggregation matters** - Always verify the aggregation method (SUM, AVG, COUNT) matches the question intent
8. **Table vs chart** - Use tables when exact values matter; use charts when patterns or trends matter
9. **Formatting** - Labels, axis titles, and legends are essential for exam questions about readability
10. **Time series** - Line charts require a properly ordered time axis; bar charts can misrepresent time sequences

## Key Takeaways

- **Bar chart**: Compare categories
- **Line chart**: Trend over time
- **Pie chart**: Part-of-whole (3-5 slices only)
- **Scatter plot**: Correlation analysis
- **Area chart**: Cumulative/stacked over time
- **Counter**: Single KPI, optionally compared with an offset value
- **Table**: Detailed data exploration
- **Colors**: Sequential, diverging, categorical strategies
- **Formatting**: Axes labels, number formats, legends
- **Multi-series**: Dual axes, side-by-side comparisons

## Related Topics

- [Dashboards & Dashboard Design](./01-dashboards.md) - Building dashboards with visualizations
- [Alerts & Scheduling](./03-alerts-scheduling.md) - Triggering alerts from query results
- [Analyzing Queries](../03-analyzing-queries/README.md) - Making the queries behind charts faster

## Official Documentation

- [Visualizations in Databricks notebooks and SQL editor](https://docs.databricks.com/aws/en/visualizations/)
- [Dashboard visualization types](https://docs.databricks.com/aws/en/dashboards/visualizations/types)

---

**[← Previous: AI/BI Dashboards & Dashboard Design](./01-dashboards.md) | [↑ Back to Section](./README.md) | [Next: Alerts & Scheduling →](./03-alerts-scheduling.md)**

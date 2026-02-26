---
title: Query Parameters & Dynamic Queries
type: study-material
tags:
  - parameters
  - dynamic-queries
  - filtering
  - user-input
---

# Query Parameters & Dynamic Queries

## Overview

Query parameters enable dashboards and reports to accept user input, allowing non-technical users to filter data without modifying SQL code. This makes analytics applications flexible and reusable.

## Parameter Basics

### Parameter Syntax

```sql
-- Parameter declaration using double braces
SELECT
    order_id,
    customer_name,
    amount,
    order_date
FROM orders
WHERE order_date >= '{{ start_date }}'
AND order_date <= '{{ end_date }}'
AND region = '{{ selected_region }}';

-- Parameters: start_date, end_date, selected_region
```

### When Parameters Are Used

```yaml
Dashboard View (User Perspective):
  [Select Region ▼] [Start Date 📅] [End Date 📅] [Apply Filters]

  When user selects:
    Region = "North"
    Start Date = "2024-01-01"
    End Date = "2024-01-31"

  Query executes as:
    WHERE order_date >= '2024-01-01'
    AND order_date <= '2024-01-31'
    AND region = 'North'
```

## Parameter Types

### Text Parameter

```sql
-- Simple text input
SELECT * FROM customers
WHERE customer_name LIKE '%{{ search_name }}%';

-- User enters: "alice"
-- Query becomes:
-- WHERE customer_name LIKE '%alice%'
```

**Configuration:**

```yaml
Parameter: search_name
  Type: Text
  Display: Text box
  Default: "" (empty)
  Placeholder: "Enter customer name"
  Validation: None
```

### Number Parameter

```sql
-- Numeric filtering
SELECT * FROM orders
WHERE amount >= {{ min_amount }}
AND amount <= {{ max_amount }};

-- User enters: min_amount=100, max_amount=1000
-- Query becomes:
-- WHERE amount >= 100 AND amount <= 1000
```

**Configuration:**

```yaml
Parameter: min_amount
  Type: Number
  Display: Number input box
  Default: 0
  Minimum: 0
  Maximum: 1000000

Parameter: max_amount
  Type: Number
  Display: Number input box
  Default: 10000
  Minimum: 0
  Maximum: 1000000
```

### Date Parameter

```sql
-- Date range filtering
SELECT * FROM orders
WHERE order_date BETWEEN '{{ start_date }}' AND '{{ end_date }}';

-- User selects: 2024-01-01 to 2024-01-31
-- Query becomes:
-- WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31'
```

**Configuration:**

```yaml
Parameter: start_date
  Type: Date
  Display: Date picker calendar
  Default: TODAY - 30 DAYS
  Format: YYYY-MM-DD

Parameter: end_date
  Type: Date
  Display: Date picker calendar
  Default: TODAY
  Format: YYYY-MM-DD
```

### Dropdown List Parameter

```sql
-- Dropdown selection from fixed list
SELECT
    product_id,
    product_name,
    sales
FROM product_sales
WHERE region IN ({{ selected_regions }})
ORDER BY sales DESC;

-- Dropdown options: North, South, East, West, All
-- User selects: "West"
```

**Configuration:**

```yaml
Parameter: selected_regions
  Type: Dropdown
  Display: Single select
  Options:
    - identifier: "North"
    - identifier: "South"
    - identifier: "East"
    - identifier: "West"
    - identifier: "All"
  Default: "All"
  Allow Multiple: Yes/No
```

### Multi-select Parameter

```sql
-- Multiple selection support
SELECT * FROM orders
WHERE status IN ({{ selected_statuses }});

-- User selects: "completed", "pending"
-- Query becomes:
-- WHERE status IN ('completed', 'pending')
```

**Configuration:**

```yaml
Parameter: selected_statuses
  Type: Dropdown (Multi-select)
  Display: Checkboxes or multi-select
  Options:
    - "completed"
    - "pending"
    - "cancelled"
    - "failed"
  Default: ["completed"]
  Allow Multiple: Yes
```

### Dynamic Dropdown (From Query)

```sql
-- Dropdown populated from query results
SELECT DISTINCT region FROM orders
ORDER BY region;

-- Becomes dropdown options in dashboard parameter
```

**Configuration:**

```yaml
Parameter: selected_region
  Type: Dropdown (Dynamic)
  Source Query: |
    SELECT DISTINCT region FROM orders ORDER BY region
  Value Column: region
  Label Column: region
  Default: First option
```

## Parameter Best Practices

### Sensible Defaults

```sql
-- Good: Defaults to last 30 days
SELECT * FROM orders
WHERE order_date >= DATE_ADD('{{ start_date }}', -30)
AND order_date <= DATE_ADD('{{ end_date }}', 0);

-- Configuration:
start_date default: CURRENT_DATE - 30
end_date default: CURRENT_DATE

-- Users see recent data without setting anything
```

### Validation & Constraints

```yaml
Parameter Validation:
  start_date:
    Type: Date
    Min: 2020-01-01 (earliest available)
    Max: CURRENT_DATE (today)
    Cannot be > end_date

  min_amount:
    Type: Number
    Min: 0
    Max: 1000000

  selected_status:
    Type: Dropdown
    Required: Yes (must select something)
```

### Performance Optimization

```sql
-- ❌ Problematic - full table scan for each text search
SELECT * FROM customers
WHERE name LIKE '%{{ search_text }}%';

-- ✅ Better - indexed column lookup
SELECT * FROM customers
WHERE LOWER(name) = LOWER('{{ search_text }}');

-- ✅ Best - dimension table join
SELECT c.* FROM customers c
WHERE c.segment_id = (
    SELECT id FROM segments WHERE name = '{{ selected_segment }}'
);
```

## Advanced Parameter Patterns

### Cascading Parameters

```sql
-- First parameter: Select region
-- Query 1 (dashboard filter):
SELECT DISTINCT region FROM orders

-- Second parameter: Select store (depends on region)
-- Query 2 (dynamic, depends on {{ selected_region }}):
SELECT DISTINCT store
FROM orders
WHERE region = '{{ selected_region }}'

-- Example:
-- User selects Region = "West"
-- Then Store dropdown shows: "Seattle", "Portland", "LA", "San Diego"
```

### Date Range Presets

```yaml
Parameter: date_preset
  Type: Dropdown
  Options:
    - "Last 7 days"
    - "Last 30 days"
    - "Last 90 days"
    - "Year to date"
    - "Custom"

  Calculate start_date based on selection:
    Last 7 days → start_date = TODAY - 7, end_date = TODAY
    Last 30 days → start_date = TODAY - 30, end_date = TODAY
    Year to date → start_date = Jan 1, end_date = TODAY
    Custom → User enters both dates
```

### Optional Parameters

```sql
-- Parameters with CASE for optional filtering
SELECT
    order_id,
    customer_name,
    amount
FROM orders
WHERE 1=1
AND (region = '{{ region }}' OR '{{ region }}' = 'All')
AND (status LIKE '%{{ status_filter }}%' OR '{{ status_filter }}' = '')
AND (amount >= COALESCE({{ min_amount }}, 0) OR {{ min_amount }} IS NULL);

-- Allows users to leave blank for any/all
```

## Parameter Configuration in Dashboards

### Adding Parameter to Dashboard

```yaml
Dashboard: Sales Performance
  Name: sales_perf_dashboard

  Parameters:
    1. start_date (Date)
    2. end_date (Date)
    3. selected_region (Dropdown: North/South/East/West/All)

  Widget 1: Revenue Trend Chart
    Query: Q1_revenue_by_date
    Uses parameters: start_date, end_date, selected_region

  Widget 2: Regional Summary
    Query: Q2_regional_summary
    Uses parameters: selected_region

  Widget 3: Top Customers Table
    Query: Q3_top_customers
    Uses parameters: start_date, end_date, selected_region
```

### Linking Parameters Between Widgets

```yaml
Scenario: Multi-widget dashboard

  Parameter: selected_region
    Shared across 5 widgets
    One selection updates all charts

  Effect:
    Chart 1: Region drill-down
    Chart 2: Region comparison
    Chart 3: Region trend
    Table: Region detail rows
```

## URL Parameters

### Share with Pre-filled Parameters

```text
Dashboard URL with parameters:
https://databricks.com/sql/dashboards/prod/sales
  ?start_date=2024-01-01
  &end_date=2024-01-31
  &region=West

// Dashboard loads with:
// - Date range: Jan 1 - 31, 2024
// - Region: West
// - All charts filtered accordingly
```

### Distributing Pre-filtered Links

```yaml
Email to stakeholders:
  Subject: "West Region Q1 Performance"

  Body:
    "View your region's Q1 results here:

    [Click for West Q1 Dashboard]
    https://databricks.com/sql/dashboards/...
      ?region=West&quarter=Q1
    "

  Benefit:
    - Recipients see only their data
    - No need to manually filter
    - Can bookmark/favorite personalized link
```

## Dynamic Segmentation

### User-driven Segmentation

```sql
-- Dashboard allows users to define segments
SELECT
    customer_id,
    customer_name,
    CASE
        WHEN lifetime_value >= {{ vip_threshold }} THEN 'VIP'
        WHEN lifetime_value >= {{ highvalue_threshold }} THEN 'High Value'
        ELSE 'Standard'
    END as customer_segment,
    lifetime_value
FROM customers
WHERE lifetime_value >= {{ min_lifetime_value }};

-- Parameters:
-- vip_threshold default: $50000
-- highvalue_threshold default: $10000
-- min_lifetime_value default: $1000

-- Users can adjust thresholds to see different segmentations
```

## Parameter Validation in Queries

### Type Safety

```sql
-- Type casting to prevent SQL injection
SELECT * FROM orders
WHERE region = '{{ region }}'  -- String auto-quoted
AND amount = {{ amount }}       -- Number auto-cast
AND order_date = '{{ order_date }}'  -- Date auto-formatted
LIMIT {{ row_limit }};          -- Integer auto-cast
```

### Required vs Optional

```sql
-- Parameter validation patterns

-- Required (must have value)
WHERE region = '{{ region }}'
-- Error if region is empty

-- Optional (allows null/empty)
WHERE (region = '{{ region }}' OR '{{ region }}' = '')
-- Allows users to leave empty for "all"
```

## Testing Parameters

### Test Query with Parameters

```sql
-- Before publishing, test with sample values:

-- Test 1: Normal range
start_date = 2024-01-01, end_date = 2024-01-31
-- Verify: Returns ~500 rows

-- Test 2: Edge cases
start_date = 2024-01-01, end_date = 2024-01-01
-- Verify: Returns ~20 rows (single day)

-- Test 3: Empty results
start_date = 2099-01-01, end_date = 2099-01-31
-- Verify: Returns 0 rows (no error, clean empty state)

-- Test 4: Blank parameter
selected_region = ''
-- Verify: Treats as "All" or returns error message
```

## Use Cases

- **Self-service Filtering**: Adding date range and region dropdown parameters so business users can slice dashboard data without editing SQL.
- **Cascading Drill-downs**: Using cascading parameters (region then store) to let users progressively narrow their view from high-level summaries to granular detail.

## Common Issues & Errors

### Parameter Not Applied to Query

**Scenario:** Changing a query parameter dropdown does not update results.
**Fix:** Ensure the parameter is referenced in the query using double curly braces (`{{ param_name }}`). Verify the parameter name matches exactly (case-sensitive).

## Exam Tips

- Parameter syntax is double curly braces: `{{ parameter_name }}`
- Make a parameter optional using the pattern `WHERE (col = '{{ param }}' OR '{{ param }}' = '')`
- Cascading parameters allow chaining: the second dropdown's query references the first parameter
- Share pre-filled dashboards using URL parameters (e.g., `?region=West&date=2024-01-01`)

## Key Takeaways

- **Parameter**: User input placeholder `{{ param_name }}`
- **Text parameter**: `{{ customer_name }}` for LIKE searches
- **Number parameter**: `{{ min_value }}` for numerical filtering
- **Date parameter**: `{{ start_date }}` with calendar picker
- **Dropdown parameter**: Predefined options or dynamic from query
- **Multi-select**: Multiple options supported
- **Cascading**: Second parameter depends on first (region → store)
- **URL parameters**: Pre-fill filters via URL
- **Validation**: Type casting, required vs optional

## Related Topics

- [Query Editor & Execution](../01-databricks-sql/02-query-editor.md) - The editor where parameterized queries are written and tested
- [Dashboards & Dashboard Design](../04-dashboards-visualization/01-dashboards.md) - Dashboards that consume parameterized queries
- [SQL Essentials](../../../shared/fundamentals/sql-essentials.md) - Core SQL concepts underlying dynamic queries

## Official Documentation

- [Query Parameters](https://docs.databricks.com/sql/user/queries/query-parameters.html)
- [Databricks SQL Queries](https://docs.databricks.com/sql/user/queries/index.html)

---

**[↑ Back to Analytics Applications](./README.md) | [Next: Sharing & Collaboration](./02-sharing-collaboration.md) →**

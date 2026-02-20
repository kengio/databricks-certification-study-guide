---
title: Window Functions & Analytics
type: study-material
tags:
  - window-functions
  - analytics
  - ranking
  - sql-queries
---

# Window Functions & Analytics

## Overview

Window functions perform calculations across a set of rows related to the current row without collapsing groups. They're essential for time-series analysis, ranking, and running totals.

## Window Function Architecture

```mermaid
flowchart TD
    WF["Window Functions"]

    WF --> Ranking["Ranking"]
    Ranking --> R1["ROW_NUMBER<br/>RANK<br/>DENSE_RANK"]

    WF --> Aggregate["Aggregate"]
    Aggregate --> A1["SUM<br/>AVG<br/>COUNT<br/>MIN/MAX"]

    WF --> Analytic["Analytic"]
    Analytic --> An1["LAG<br/>LEAD<br/>FIRST_VALUE<br/>LAST_VALUE"]

    WF --> Offset["Offset"]
    Offset --> O1["LAG/LEAD<br/>Previous/Next"]
```text

## Basic Window Clause

```sql
-- Generic window function syntax
SELECT
    column1,
    column2,
    WINDOW_FUNCTION() OVER (
        PARTITION BY col     -- Group dimension
        ORDER BY col         -- Sort within group
        ROWS/RANGE ...       -- Frame specification
    ) as result
FROM table;

-- Example
SELECT
    employee_id,
    employee_name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as salary_rank
FROM employees;
```text

## Ranking Functions

### ROW_NUMBER

Assigns unique sequential number regardless of ties:

```sql
-- Rank employees by salary (no ties)
SELECT
    employee_id,
    employee_name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- Result:
-- emp1, Alice, $100k, 1
-- emp2, Bob, $95k, 2
-- emp3, Charlie, $95k, 3 ← Note: Both get unique rows
-- emp4, Diana, $90k, 4
```text

**Pattern: Top N in each category**

```sql
SELECT employee_id, employee_name, department, salary
FROM (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY department
            ORDER BY salary DESC
        ) as rank_in_dept
    FROM employees
)
WHERE rank_in_dept <= 3;  -- Top 3 per department
```text

### RANK

Assigns same rank to ties, skips numbers:

```sql
-- Rank employees by salary (with ties)
SELECT
    employee_id,
    employee_name,
    salary,
    RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;

-- Result:
-- emp1, Alice, $100k, 1
-- emp2, Bob, $95k, 2
-- emp3, Charlie, $95k, 2 ← Tie gets same rank
-- emp4, Diana, $90k, 4  ← Next rank skips
```text

### DENSE_RANK

Assigns same rank to ties, no gaps:

```sql
-- Rank with no gaps
SELECT
    employee_id,
    employee_name,
    salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) as dense_rank
FROM employees;

-- Result:
-- emp1, Alice, $100k, 1
-- emp2, Bob, $95k, 2
-- emp3, Charlie, $95k, 2 ← Tie
-- emp4, Diana, $90k, 3  ← No gap
```text

### Ranking Comparison

| Function | Description | Ties | Gap |
|----------|---|---|---|
| **ROW_NUMBER** | Unique number | ✗ Different | N/A |
| **RANK** | Ranking with gaps | ✓ Same | Yes |
| **DENSE_RANK** | Ranking no gaps | ✓ Same | No |

## Aggregate Window Functions

### Running Totals

```sql
-- Cumulative sales by date
SELECT
    sale_date,
    daily_revenue,
    SUM(daily_revenue) OVER (
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as cumulative_revenue
FROM daily_sales
ORDER BY sale_date;

-- Result:
-- 2024-01-01: $100k, $100k
-- 2024-01-02: $110k, $210k
-- 2024-01-03: $95k, $305k
```text

### Moving Average

```sql
-- 7-day moving average
SELECT
    sale_date,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as avg_7day
FROM daily_sales
ORDER BY sale_date;

-- Window includes 7 days: 6 before + current row
```text

### Partitioned Aggregates

```sql
-- Revenue by product, compared to category average
SELECT
    product_id,
    product_name,
    category,
    revenue,
    AVG(revenue) OVER (PARTITION BY category) as category_avg,
    revenue - AVG(revenue) OVER (PARTITION BY category) as vs_avg
FROM products;

-- Shows each product vs its category average
```text

## Offset Functions

### LAG - Previous Row

```sql
-- Compare to previous month
SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) as prev_month_revenue,
    revenue - LAG(revenue) OVER (ORDER BY month) as month_over_month,
    ROUND(
        (revenue - LAG(revenue) OVER (ORDER BY month)) /
        LAG(revenue) OVER (ORDER BY month) * 100, 2
    ) as pct_change
FROM monthly_sales
ORDER BY month;

-- Result:
-- 2024-01: $100k, NULL,       NULL,      NULL
-- 2024-02: $110k, $100k,      $10k,      10.00%
-- 2024-03: $95k,  $110k,      -$15k,     -13.64%
```text

### LEAD - Next Row

```sql
-- Preview next month's revenue
SELECT
    month,
    revenue,
    LEAD(revenue) OVER (ORDER BY month) as next_month_revenue
FROM monthly_sales;

-- Useful for: forecasting, planning, finding drops
```text

### Custom Offset

```sql
-- Get value from 3 months ago
SELECT
    month,
    revenue,
    LAG(revenue, 3) OVER (ORDER BY month) as revenue_3mo_ago,
    revenue - LAG(revenue, 3) OVER (ORDER BY month) as vs_3mo_ago
FROM monthly_sales
ORDER BY month;

-- LAG(column, offset, default_if_null)
SELECT
    month,
    revenue,
    LAG(revenue, 1, 0) OVER (ORDER BY month) as prev_revenue
FROM monthly_sales;
-- If no previous row, use 0 instead of NULL
```text

## Window Frame Specification

### ROWS vs RANGE

```sql
-- ROWS: Count of rows
ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
-- Exactly 7 rows (6 before + current)

-- RANGE: Value-based range
RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW
-- All rows within 6-day window

-- Examples:
SELECT
    date,
    revenue,
    -- Last 7 days of rows
    SUM(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW),
    -- Last 7 calendar days
    SUM(revenue) OVER (ORDER BY date RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW)
FROM sales;
```text

### Frame Boundaries

```sql
-- UNBOUNDED PRECEDING to current row (running total)
SUM(...) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)

-- All rows in partition (complete aggregate)
SUM(...) OVER (PARTITION BY category)
-- Equivalent to: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING

-- Last 3 and next 3 rows
AVG(...) OVER (ORDER BY date ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING)
```text

## FIRST_VALUE & LAST_VALUE

### Get First / Last in Window

```sql
-- First and last sales in each month
SELECT
    month,
    sale_date,
    customer_id,
    amount,
    FIRST_VALUE(customer_id) OVER (
        PARTITION BY month
        ORDER BY sale_date
    ) as first_customer_of_month,
    LAST_VALUE(customer_id) OVER (
        PARTITION BY month
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as last_customer_of_month
FROM sales
ORDER BY month, sale_date;

-- Note: LAST_VALUE needs UNBOUNDED FOLLOWING
-- Otherwise defaults to CURRENT ROW, missing future rows
```text

## Partitioning Strategy

### Single Partition

```sql
-- Rank across entire dataset
SELECT
    employee_id,
    employee_name,
    salary,
    RANK() OVER (ORDER BY salary DESC) as overall_rank
FROM employees;
```text

### Multiple Partitions

```sql
-- Rank within each department
SELECT
    department,
    employee_id,
    employee_name,
    salary,
    RANK() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) as rank_in_department
FROM employees
ORDER BY department, rank_in_department;

-- Result:
-- Sales, emp1, Alice, $100k, 1
-- Sales, emp2, Bob, $95k, 2
-- Finance, emp3, Charlie, $110k, 1
-- Finance, emp4, Diana, $105k, 2
```text

### Multiple Window Definitions

```sql
-- Use multiple window definitions in one query
SELECT
    region,
    branch,
    revenue,

    -- Overall rank
    RANK() OVER (ORDER BY revenue DESC) as overall_rank,

    -- Rank by region
    RANK() OVER (PARTITION BY region ORDER BY revenue DESC) as region_rank,

    -- Running total nationwide
    SUM(revenue) OVER (ORDER BY region, branch) as cumulative_revenue
FROM sales
ORDER BY region, branch;
```text

## Complex Analytics Examples

### Retention Cohort

```sql
-- Track customer retention by signup cohort
SELECT
    signup_cohort,
    days_since_signup,
    COUNT(DISTINCT customer_id) as active_customers,
    FIRST_VALUE(COUNT(DISTINCT customer_id)) OVER (
        PARTITION BY signup_cohort
        ORDER BY days_since_signup
    ) as customers_in_cohort,
    ROUND(
        COUNT(DISTINCT customer_id) * 100.0 /
        FIRST_VALUE(COUNT(DISTINCT customer_id)) OVER (
            PARTITION BY signup_cohort ORDER BY days_since_signup
        ), 2
    ) as retention_pct
FROM customer_activity
GROUP BY signup_cohort, days_since_signup
ORDER BY signup_cohort, days_since_signup;
```text

### Session Analysis

```sql
-- Identify sessions (gaps > 30 min = new session)
WITH events_with_gaps AS (
    SELECT
        user_id,
        event_timestamp,
        LAG(event_timestamp) OVER (
            PARTITION BY user_id
            ORDER BY event_timestamp
        ) as prev_event_time,
        CASE
            WHEN LAG(event_timestamp) OVER (
                    PARTITION BY user_id ORDER BY event_timestamp
                ) IS NULL THEN 1
            WHEN event_timestamp - LAG(event_timestamp) OVER (
                    PARTITION BY user_id ORDER BY event_timestamp
                ) > INTERVAL 30 MINUTE THEN 1
            ELSE 0
        END as is_session_start
    FROM events
)
SELECT
    user_id,
    SUM(is_session_start) OVER (
        PARTITION BY user_id
        ORDER BY event_timestamp
    ) as session_id,
    COUNT(*) OVER (
        PARTITION BY user_id,
        SUM(is_session_start) OVER (PARTITION BY user_id ORDER BY event_timestamp)
    ) as events_in_session
FROM events_with_gaps;
```text

## Key Exam Concepts

- **Window function**: Calculation across related rows (no grouping)
- **PARTITION BY**: Defines groups for window scope
- **ORDER BY**: Specifies ordering within partition
- **ROW_NUMBER**: Unique sequential number
- **RANK/DENSE_RANK**: Handle ties differently
- **LAG/LEAD**: Access offset rows
- **Running totals**: SUM with ROWS BETWEEN
- **Frame**: ROWS (count-based) vs RANGE (value-based)
- **FIRST_VALUE/LAST_VALUE**: Boundary values in window

## Common Exam Questions

**Q: How is RANK different from ROW_NUMBER?**

- **A**: RANK gives same rank to ties and skips numbers; ROW_NUMBER always unique

**Q: What's needed to get correct results from LAST_VALUE?**

- **A**: Specify ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING

**Q: How do you calculate YoY growth using window functions?**

- **A**: Use LAG(value, 12) for 12-month prior, then calculate (current - prior) / prior

**Q: Can you use multiple PARTITION BY clauses?**

- **A**: No, but can include multiple columns: PARTITION BY col1, col2

---

**[← Back to Topic](./README.md)**

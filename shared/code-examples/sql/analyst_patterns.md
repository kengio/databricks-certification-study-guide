---
tags:
  - databricks
  - code-examples
  - sql
  - data-analyst
  - functions
---

# Analyst SQL Patterns

Common SQL patterns for data analysts on Databricks. Run in the SQL editor or a notebook.
The sample data setup block creates temporary views used by all subsequent examples.

## Sample Data Setup

```sql
CREATE OR REPLACE TEMP VIEW sales AS
SELECT * FROM VALUES
    (1,  'Alice',   'Electronics', '2025-01-05', 299.99, 'North'),
    (2,  'Bob',     'Clothing',    '2025-01-08', 89.50,  'South'),
    (3,  'Alice',   'Electronics', '2025-01-15', 449.99, 'North'),
    (4,  'Charlie', 'Home',        '2025-01-20', 125.00, 'East'),
    (5,  'Alice',   'Clothing',    '2025-02-01', 75.00,  'North'),
    (6,  'Bob',     'Electronics', '2025-02-10', 599.99, 'South'),
    (7,  'Charlie', 'Electronics', '2025-02-15', 199.99, 'East'),
    (8,  'Diana',   'Home',        '2025-03-01', 320.00, 'West'),
    (9,  'Alice',   'Home',        '2025-03-10', 45.00,  'North'),
    (10, 'Bob',     'Clothing',    '2025-03-20', 210.00, 'South'),
    (11, 'Diana',   'Electronics', '2025-03-25', 749.99, 'West'),
    (12, 'Charlie', 'Clothing',    '2025-04-01', 55.00,  'East')
AS t(sale_id, customer, category, sale_date, amount, region);
```

## CASE Expressions

```sql
-- Categorize customers by spending tier
SELECT
    customer,
    SUM(amount) AS total_spent,
    CASE
        WHEN SUM(amount) >= 500 THEN 'High Value'
        WHEN SUM(amount) >= 200 THEN 'Medium Value'
        ELSE 'Low Value'
    END AS spending_tier
FROM sales
GROUP BY customer
ORDER BY total_spent DESC;
```

```sql
-- Conditional aggregation (count by category without subqueries)
SELECT
    customer,
    COUNT(CASE WHEN category = 'Electronics' THEN 1 END) AS electronics_orders,
    COUNT(CASE WHEN category = 'Clothing' THEN 1 END) AS clothing_orders,
    COUNT(CASE WHEN category = 'Home' THEN 1 END) AS home_orders
FROM sales
GROUP BY customer;
```

## PIVOT

```sql
-- Transform rows to columns: total sales by customer and category
SELECT *
FROM (
    SELECT customer, category, amount
    FROM sales
)
PIVOT (
    SUM(amount) FOR category IN ('Electronics', 'Clothing', 'Home')
);
```

## UNPIVOT

```sql
-- Transform columns back to rows
WITH pivoted AS (
    SELECT *
    FROM (SELECT customer, category, amount FROM sales)
    PIVOT (SUM(amount) FOR category IN ('Electronics', 'Clothing', 'Home'))
)
SELECT *
FROM pivoted
UNPIVOT (
    total_amount FOR category IN (Electronics, Clothing, Home)
);
```

## Date Functions

```sql
-- Extract date parts
SELECT
    sale_id,
    sale_date,
    YEAR(sale_date)                       AS sale_year,
    MONTH(sale_date)                      AS sale_month,
    DAY(sale_date)                        AS sale_day,
    DAYOFWEEK(sale_date)                  AS day_of_week,
    DATE_FORMAT(sale_date, 'EEEE')        AS day_name,
    DATE_FORMAT(sale_date, 'MMMM yyyy')   AS month_year,
    QUARTER(sale_date)                    AS quarter
FROM sales;
```

```sql
-- Date arithmetic
SELECT
    sale_id,
    sale_date,
    DATE_ADD(sale_date, 30)               AS plus_30_days,
    DATE_SUB(sale_date, 7)                AS minus_7_days,
    DATEDIFF(CURRENT_DATE(), sale_date)   AS days_since_sale,
    MONTHS_BETWEEN(CURRENT_DATE(), sale_date) AS months_since_sale,
    DATE_TRUNC('MONTH', sale_date)        AS first_of_month,
    LAST_DAY(sale_date)                   AS last_of_month
FROM sales;
```

## String Functions

```sql
SELECT
    customer,
    UPPER(customer)                          AS upper_name,
    LOWER(customer)                          AS lower_name,
    LENGTH(customer)                         AS name_length,
    CONCAT(customer, ' — ', region)          AS customer_region,
    SUBSTRING(customer, 1, 3)                AS first_three,
    REPLACE(region, 'North', 'N')            AS short_region,
    TRIM('  padded  ')                       AS trimmed,
    REGEXP_REPLACE(customer, '[aeiou]', '*') AS vowels_replaced
FROM sales;
```

## Parameterized Queries

```sql
-- Use {{ parameter_name }} in the SQL editor to create dropdown/text inputs
-- This creates interactive dashboards

SELECT *
FROM sales
WHERE category = {{ category_filter }}
  AND sale_date BETWEEN {{ start_date }} AND {{ end_date }};
```

```sql
-- Multi-select parameter (generates IN clause)
SELECT customer, category, SUM(amount) AS total
FROM sales
WHERE region IN ({{ region_selector }})
GROUP BY customer, category;
```

## Running Totals and Moving Averages

```sql
-- Running total by customer ordered by date
SELECT
    customer,
    sale_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY customer
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales
ORDER BY customer, sale_date;
```

```sql
-- 3-period moving average of sales amount
SELECT
    sale_date,
    amount,
    AVG(amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_3
FROM sales;
```

## Percentiles and Distribution

```sql
-- Percentile of each sale within its category
SELECT
    category,
    customer,
    amount,
    PERCENT_RANK() OVER (PARTITION BY category ORDER BY amount) AS pct_rank,
    NTILE(4) OVER (PARTITION BY category ORDER BY amount)       AS quartile
FROM sales;
```

```sql
-- Approximate percentiles for large datasets
SELECT
    category,
    PERCENTILE_APPROX(amount, 0.5)  AS median_amount,
    PERCENTILE_APPROX(amount, 0.25) AS p25,
    PERCENTILE_APPROX(amount, 0.75) AS p75,
    PERCENTILE_APPROX(amount, 0.90) AS p90
FROM sales
GROUP BY category;
```

## Year-over-Year Comparison

```sql
-- Compare monthly totals with previous month
WITH monthly AS (
    SELECT
        DATE_TRUNC('MONTH', sale_date) AS month,
        SUM(amount) AS monthly_total
    FROM sales
    GROUP BY DATE_TRUNC('MONTH', sale_date)
)
SELECT
    month,
    monthly_total,
    LAG(monthly_total) OVER (ORDER BY month) AS prev_month_total,
    ROUND(
        (monthly_total - LAG(monthly_total) OVER (ORDER BY month))
        / LAG(monthly_total) OVER (ORDER BY month) * 100, 1
    ) AS pct_change
FROM monthly
ORDER BY month;
```

## NULL Handling

```sql
-- COALESCE returns the first non-null value
SELECT
    customer,
    COALESCE(region, 'Unknown')     AS region_clean,
    NULLIF(amount, 0)               AS amount_no_zeros,
    IFNULL(region, 'N/A')           AS region_filled,
    NVL(region, 'N/A')              AS region_nvl,
    NVL2(region, 'Has Region', 'No Region') AS region_flag
FROM sales;
```

## Notes

- `PIVOT` in Databricks SQL requires an explicit list of values in the `IN` clause
- `{{ param }}` syntax works in the SQL editor for dashboard parameters — not in notebooks
- `PERCENTILE_APPROX` is faster than exact percentiles on large datasets (uses t-digest)
- `DATE_TRUNC` supports: `YEAR`, `QUARTER`, `MONTH`, `WEEK`, `DAY`, `HOUR`, `MINUTE`, `SECOND`
- `REGEXP_REPLACE` uses Java regex syntax

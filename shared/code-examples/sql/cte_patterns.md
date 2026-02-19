---
tags:
  - databricks
  - code-examples
  - sql
  - cte
  - pivot
---

# CTE Patterns, PIVOT, and UNPIVOT — SQL

SQL examples for Common Table Expressions, PIVOT, and UNPIVOT. Run in a Databricks SQL editor
or notebook. The sample data setup block creates a temporary view used by all subsequent examples.

## Sample Data Setup

```sql
CREATE OR REPLACE TEMP VIEW orders AS
SELECT * FROM VALUES
    (1,  101, '2025-01-15', 'Electronics', 299.99),
    (2,  102, '2025-01-16', 'Clothing',     89.50),
    (3,  101, '2025-01-17', 'Electronics', 149.99),
    (4,  103, '2025-02-01', 'Clothing',    125.00),
    (5,  102, '2025-02-05', 'Electronics', 599.99),
    (6,  101, '2025-02-10', 'Home',         45.00),
    (7,  103, '2025-03-01', 'Electronics', 199.99),
    (8,  104, '2025-03-15', 'Home',        320.00),
    (9,  101, '2025-03-20', 'Clothing',     75.00),
    (10, 102, '2025-03-25', 'Home',        210.00)
AS t(order_id, customer_id, order_date, category, amount);
```

## Basic CTE

```sql
WITH monthly_totals AS (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        SUM(amount) AS total_revenue,
        COUNT(*) AS order_count
    FROM orders
    GROUP BY DATE_TRUNC('month', order_date)
)
SELECT
    month,
    total_revenue,
    order_count,
    total_revenue / order_count AS avg_order_value
FROM monthly_totals
ORDER BY month;
```

## Multiple CTEs (Chained)

```sql
WITH customer_orders AS (
    -- Step 1: Aggregate per customer
    SELECT
        customer_id,
        COUNT(*) AS order_count,
        SUM(amount) AS total_spent,
        MIN(order_date) AS first_order,
        MAX(order_date) AS last_order
    FROM orders
    GROUP BY customer_id
),
customer_segments AS (
    -- Step 2: Classify customers based on spending
    SELECT
        customer_id,
        order_count,
        total_spent,
        first_order,
        last_order,
        CASE
            WHEN total_spent > 500 THEN 'High Value'
            WHEN total_spent > 200 THEN 'Medium Value'
            ELSE 'Low Value'
        END AS segment
    FROM customer_orders
)
-- Step 3: Summarise by segment
SELECT
    segment,
    COUNT(*) AS customer_count,
    AVG(total_spent) AS avg_spending,
    AVG(order_count) AS avg_orders
FROM customer_segments
GROUP BY segment
ORDER BY avg_spending DESC;
```

## CTE with Window Functions

```sql
WITH ranked_orders AS (
    SELECT
        customer_id,
        order_date,
        amount,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY order_date
        ) AS order_sequence,
        LAG(order_date) OVER (
            PARTITION BY customer_id
            ORDER BY order_date
        ) AS prev_order_date
    FROM orders
)
SELECT
    customer_id,
    order_date,
    amount,
    order_sequence,
    DATEDIFF(order_date, prev_order_date) AS days_between_orders
FROM ranked_orders
ORDER BY customer_id, order_sequence;
```

## PIVOT — Rows to Columns

```sql
-- Revenue by category as columns
SELECT *
FROM (
    SELECT
        DATE_TRUNC('month', order_date) AS month,
        category,
        amount
    FROM orders
)
PIVOT (
    SUM(amount) AS revenue
    FOR category IN ('Electronics', 'Clothing', 'Home')
)
ORDER BY month;

-- Customer spending by category with multiple aggregations
SELECT *
FROM (
    SELECT customer_id, category, amount
    FROM orders
)
PIVOT (
    SUM(amount) AS total,
    COUNT(*) AS count
    FOR category IN ('Electronics', 'Clothing', 'Home')
)
ORDER BY customer_id;
```

## UNPIVOT — Columns to Rows

```sql
-- Create a pivoted view first
CREATE OR REPLACE TEMP VIEW quarterly_metrics AS
SELECT
    'Revenue' AS metric,
    150000.00 AS Q1,
    175000.00 AS Q2,
    190000.00 AS Q3,
    220000.00 AS Q4;

-- Unpivot to convert columns to rows
SELECT *
FROM quarterly_metrics
UNPIVOT (
    value FOR quarter IN (Q1, Q2, Q3, Q4)
);
```

## CTE for Data Quality Checks

```sql
WITH validation AS (
    SELECT
        order_id,
        customer_id,
        amount,
        CASE WHEN amount <= 0 THEN 'Invalid amount'
             WHEN customer_id IS NULL THEN 'Missing customer'
             WHEN order_date > current_date() THEN 'Future date'
             ELSE 'Valid'
        END AS validation_status
    FROM orders
)
SELECT
    validation_status,
    COUNT(*) AS record_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM validation
GROUP BY validation_status;
```

## CTE for Deduplication

```sql
WITH ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id, order_date, amount
            ORDER BY order_id
        ) AS rn
    FROM orders
)
-- Keep only the first occurrence of each duplicate
SELECT order_id, customer_id, order_date, category, amount
FROM ranked
WHERE rn = 1;
```

## CTE with Aggregation Patterns

```sql
-- Year-over-year comparison pattern
WITH current_period AS (
    SELECT
        category,
        SUM(amount) AS current_revenue
    FROM orders
    WHERE order_date >= '2025-01-01' AND order_date < '2025-04-01'
    GROUP BY category
),
previous_period AS (
    SELECT
        category,
        SUM(amount) AS previous_revenue
    FROM orders
    WHERE order_date >= '2024-01-01' AND order_date < '2024-04-01'
    GROUP BY category
)
SELECT
    c.category,
    c.current_revenue,
    COALESCE(p.previous_revenue, 0) AS previous_revenue,
    ROUND(
        (c.current_revenue - COALESCE(p.previous_revenue, 0))
        / NULLIF(p.previous_revenue, 0) * 100, 2
    ) AS growth_pct
FROM current_period c
LEFT JOIN previous_period p ON c.category = p.category
ORDER BY growth_pct DESC;
```

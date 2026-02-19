---
tags:
  - databricks
  - code-examples
  - sql
  - window-functions
---

# Window Functions — SQL

SQL examples for window functions. Run in a Databricks SQL editor or notebook. The sample data
setup block creates a temporary view used by all subsequent examples.

## Sample Data Setup

```sql
CREATE OR REPLACE TEMP VIEW sales AS
SELECT * FROM VALUES
    (1, 'Alice',   'Engineering', 95000,  '2023-01-15'),
    (2, 'Bob',     'Marketing',   72000,  '2023-03-01'),
    (3, 'Charlie', 'Engineering', 88000,  '2022-06-10'),
    (4, 'Diana',   'Sales',       67000,  '2024-01-20'),
    (5, 'Eve',     'Engineering', 91000,  '2023-09-05'),
    (6, 'Frank',   'Marketing',   75000,  '2022-11-15'),
    (7, 'Grace',   'Sales',       82000,  '2023-07-01'),
    (8, 'Henry',   'Engineering', 105000, '2021-04-10')
AS t(id, name, department, salary, hire_date);
```

## ROW_NUMBER — Unique Sequential Numbering

```sql
-- Rank employees within each department by salary (highest first)
SELECT
    name,
    department,
    salary,
    ROW_NUMBER() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS row_num
FROM sales;

-- Get the highest-paid employee per department
SELECT * FROM (
    SELECT
        name,
        department,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM sales
)
WHERE rn = 1;
```

## RANK and DENSE_RANK — Handle Ties Differently

`RANK` skips numbers after ties (1, 2, 2, 4); `DENSE_RANK` does not (1, 2, 2, 3).

```sql
SELECT
    name,
    department,
    salary,
    RANK()       OVER (ORDER BY salary DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num
FROM sales;
```

## LAG and LEAD — Access Previous/Next Rows

```sql
-- Compare each employee's salary to the previous hire's salary
SELECT
    name,
    hire_date,
    salary,
    LAG(salary, 1) OVER (ORDER BY hire_date) AS prev_salary,
    salary - LAG(salary, 1) OVER (ORDER BY hire_date) AS salary_diff
FROM sales;

-- Look ahead: next hire in same department
SELECT
    name,
    department,
    hire_date,
    LEAD(name, 1) OVER (
        PARTITION BY department
        ORDER BY hire_date
    ) AS next_hire
FROM sales;
```

## Running Aggregates

```sql
-- Running total of salaries by hire date
SELECT
    name,
    hire_date,
    salary,
    SUM(salary) OVER (
        ORDER BY hire_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales;

-- Running average salary within department
SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (
        PARTITION BY department
        ORDER BY hire_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_avg
FROM sales;

-- Running count
SELECT
    name,
    hire_date,
    COUNT(*) OVER (
        ORDER BY hire_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS employee_count
FROM sales;
```

## NTILE — Divide Rows into Buckets

```sql
-- Split employees into salary quartiles
SELECT
    name,
    salary,
    NTILE(4) OVER (ORDER BY salary) AS salary_quartile
FROM sales;
```

## FIRST_VALUE and LAST_VALUE

```sql
-- Get highest and lowest salary in each department
SELECT
    name,
    department,
    salary,
    FIRST_VALUE(salary) OVER (
        PARTITION BY department ORDER BY salary DESC
    ) AS max_salary,
    FIRST_VALUE(salary) OVER (
        PARTITION BY department ORDER BY salary ASC
    ) AS min_salary
FROM sales;
```

## PERCENT_RANK and CUME_DIST

```sql
-- Percentile rank (0 to 1 range)
SELECT
    name,
    salary,
    PERCENT_RANK() OVER (ORDER BY salary) AS pct_rank,
    CUME_DIST()    OVER (ORDER BY salary) AS cume_dist
FROM sales;
```

## Window Frame Specifications

```sql
-- Moving average (3-row window)
SELECT
    name,
    hire_date,
    salary,
    AVG(salary) OVER (
        ORDER BY hire_date
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) AS moving_avg_3
FROM sales;

-- Range-based window (all rows within 10000 salary range)
SELECT
    name,
    salary,
    COUNT(*) OVER (
        ORDER BY salary
        RANGE BETWEEN 10000 PRECEDING AND 10000 FOLLOWING
    ) AS similar_salary_count
FROM sales;
```

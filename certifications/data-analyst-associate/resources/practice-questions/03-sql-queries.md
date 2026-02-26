---
title: SQL Queries Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, sql, joins, window-functions]
---

# SQL Queries Practice Questions

**Exam Weight: 29%** — This domain carries the most exam weight.

[← Back to Practice Questions](./README.md) | [Next: Dashboards](./04-dashboards-visualization.md)

---

## Question 1: INNER JOIN vs LEFT JOIN *(Medium)*

A query needs all employees and their department names, including employees without a department.
Which JOIN type should be used?

A) INNER JOIN — returns only matching rows
B) LEFT JOIN — returns all rows from the left table, NULL for unmatched right rows
C) CROSS JOIN — all combinations
D) SEMI JOIN — checks for existence only

> [!success]- Answer
> **Correct Answer: B**
>
> LEFT JOIN preserves all rows from the left table (employees). Employees without a department
> get NULL in the department name column. INNER JOIN would exclude employees with no department.

---

## Question 2: Window Function — ROW_NUMBER *(Medium)*

A query must return one row per customer with the highest purchase amount. Which window function
assigns a unique rank per customer?

A) `RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC)`
B) `DENSE_RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC)`
C) `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC)`
D) `NTILE(1) OVER (PARTITION BY customer_id ORDER BY amount DESC)`

> [!success]- Answer
> **Correct Answer: C**
>
> `ROW_NUMBER()` assigns 1 to the top row per partition with no ties (always unique). Filter
> `WHERE rn = 1` to get one row per customer. `RANK()` and `DENSE_RANK()` can produce duplicates
> when there are ties.

---

## Question 3: RANK vs DENSE_RANK *(Hard)*

Sales figures are: Alice=100, Bob=100, Carol=90. Using `RANK()` and `DENSE_RANK()`, what are
Carol's values?

A) `RANK()` = 2, `DENSE_RANK()` = 2
B) `RANK()` = 3, `DENSE_RANK()` = 2
C) `RANK()` = 2, `DENSE_RANK()` = 3
D) `RANK()` = 3, `DENSE_RANK()` = 3

> [!success]- Answer
> **Correct Answer: B**
>
> With two tied rows at rank 1, `RANK()` skips to 3 for the next row (gaps exist). `DENSE_RANK()`
> assigns 2 (no gaps). Alice and Bob both get rank 1 in both functions.

---

## Question 4: LAG Function *(Medium)*

A query calculates the change in monthly sales vs the previous month. Which function retrieves the
previous month's value?

A) `PREV(sales) OVER (ORDER BY month)`
B) `LAG(sales, 1) OVER (ORDER BY month)`
C) `LEAD(sales, -1) OVER (ORDER BY month)`
D) `OFFSET(sales, 1) OVER (ORDER BY month)`

> [!success]- Answer
> **Correct Answer: B**
>
> `LAG(column, offset)` returns the value from `offset` rows before the current row within the
> window. `LEAD` looks forward; `LAG` looks backward. `PREV` and `OFFSET` are not valid Databricks
> SQL functions.

---

## Question 5: QUALIFY Clause *(Hard)*

An analyst wants to return only the top-ranked product per category (based on revenue), using
window functions. Which clause filters on the window function result?

A) `HAVING rank = 1`
B) `WHERE rank = 1`
C) `QUALIFY ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) = 1`
D) `FILTER (WHERE rank = 1)`

> [!success]- Answer
> **Correct Answer: C**
>
> `QUALIFY` filters on window function expressions directly. `WHERE` executes before window
> functions; `HAVING` filters on aggregates after GROUP BY. `QUALIFY` is the correct clause for
> filtering window results without wrapping in a subquery.

---

## Question 6: Running Total *(Medium)*

An analyst needs a running total of sales, ordered by date, within each region. Which expression
computes this?

A) `SUM(sales) OVER (PARTITION BY region)`
B) `SUM(sales) OVER (PARTITION BY region ORDER BY date)`
C) `SUM(sales) GROUP BY region, date`
D) `CUMSUM(sales) OVER (PARTITION BY region ORDER BY date)`

> [!success]- Answer
> **Correct Answer: B**
>
> `SUM(sales) OVER (PARTITION BY region ORDER BY date)` computes a cumulative sum within each
> region, increasing with each row sorted by date. Without `ORDER BY`, it returns the total sum
> for the entire partition. `CUMSUM` is not a valid Databricks SQL function.

---

## Question 7: CTE vs Subquery *(Easy)*

Which statement about CTEs (Common Table Expressions) is TRUE?

A) CTEs are always faster than equivalent subqueries
B) CTEs improve readability and can be referenced multiple times in the same query
C) CTEs cannot be used in SELECT statements
D) CTEs are materialized by default in Databricks SQL

> [!success]- Answer
> **Correct Answer: B**
>
> CTEs improve readability by naming intermediate result sets. They can be referenced multiple
> times in the same query without repeating logic. Performance is typically equivalent to
> subqueries — both are logical constructs, not necessarily materialized.

---

## Question 8: EXPLODE for Arrays *(Easy)*

A table has a `tags` column of type `ARRAY<STRING>`. A query needs one row per tag. Which function
produces this?

A) `FLATTEN(tags)`
B) `UNNEST(tags)`
C) `EXPLODE(tags)`
D) `SPLIT(tags, ',')`

> [!success]- Answer
> **Correct Answer: C**
>
> `EXPLODE(array_column)` creates one row per array element. `FLATTEN` combines nested arrays into
> a flat array without exploding rows. `UNNEST` is PostgreSQL syntax, not used in Databricks SQL.
> `SPLIT` converts a string to an array but does not expand rows.

---

## Question 9: COLLECT_LIST Aggregation *(Easy)*

Which aggregate function combines multiple row values into an array?

A) `ARRAY_AGG` or `COLLECT_LIST`
B) `GROUP_CONCAT`
C) `STRING_AGG`
D) `CONCAT_WS`

> [!success]- Answer
> **Correct Answer: A**
>
> Both `COLLECT_LIST` (Spark SQL) and `ARRAY_AGG` (SQL standard alias) aggregate multiple values
> into an array column. `GROUP_CONCAT` and `STRING_AGG` produce a delimited string, not an array.
> `CONCAT_WS` concatenates strings with a separator but is not an aggregate.

---

## Question 10: ANTI JOIN *(Medium)*

A query needs all customers who have NOT made a purchase. Which JOIN type filters for non-matches?

A) `LEFT JOIN ... WHERE purchase_id IS NULL`
B) `LEFT ANTI JOIN`
C) Both A and B are correct approaches
D) `OUTER JOIN ... WHERE purchase_id IS NULL`

> [!success]- Answer
> **Correct Answer: C**
>
> Both approaches work. `LEFT ANTI JOIN` is the explicit syntax for returning only non-matching
> left rows. `LEFT JOIN ... WHERE right_key IS NULL` is the equivalent filter approach. The
> explicit `ANTI JOIN` syntax is often clearer in intent.

---

## Question 11: PIVOT Syntax *(Medium)*

An analyst wants to pivot monthly sales into columns (Jan, Feb, Mar). Which SQL feature
accomplishes this?

A) `CASE WHEN month = 'Jan' THEN sales END` in SELECT
B) `PIVOT (SUM(sales) FOR month IN ('Jan', 'Feb', 'Mar'))`
C) `GROUP BY month HAVING month IN ('Jan', 'Feb', 'Mar')`
D) `TRANSPOSE(sales, month)`

> [!success]- Answer
> **Correct Answer: B**
>
> `PIVOT` reshapes rows into columns. Both conditional aggregation (A) and PIVOT (B) produce the
> same result, but `PIVOT` syntax is more concise. Full syntax:
> `FROM table PIVOT (agg(col) FOR pivot_col IN (values))`. `TRANSPOSE` is not a valid Databricks
> SQL function.

---

## Question 12: HAVING vs WHERE *(Medium)*

An analyst writes a query with `WHERE COUNT(*) > 5` and gets an error. What is the correct
approach?

A) Replace `WHERE` with `QUALIFY`
B) Replace `WHERE` with `HAVING` after a `GROUP BY`
C) Replace `WHERE COUNT(*)` with `WHERE SUM(1)`
D) Add `ORDER BY COUNT(*)` after WHERE

> [!success]- Answer
> **Correct Answer: B**
>
> `WHERE` filters individual rows before aggregation; aggregate functions like `COUNT()` cannot
> appear in a `WHERE` clause. `HAVING` filters after GROUP BY aggregation and supports aggregate
> expressions. `QUALIFY` filters window function results, not aggregate results.

---

## Question 13: Date Function *(Easy)*

Which function returns the number of days between `order_date` and today?

A) `DATE_DIFF(current_date(), order_date)`
B) `DATEDIFF(current_date(), order_date)`
C) `DAYS_BETWEEN(order_date, current_date())`
D) `TIMESTAMPDIFF('day', order_date, current_date())`

> [!success]- Answer
> **Correct Answer: B**
>
> `DATEDIFF(end_date, start_date)` is the Databricks SQL function for date difference in days.
> Note the argument order: end date first, then start date. `DATE_DIFF` (with underscore) is not
> the standard Databricks function name. `DAYS_BETWEEN` does not exist in Databricks SQL.

---

## Question 14: String Function — SUBSTRING *(Hard)*

Which expression extracts characters 2 through 5 from the `product_code` column?

A) `SUBSTR(product_code, 2, 4)`
B) `LEFT(product_code, 5)`
C) `SUBSTRING(product_code, 2, 5)`
D) `MID(product_code, 2, 4)`

> [!success]- Answer
> **Correct Answer: A**
>
> `SUBSTR(string, start_pos, length)` where start is 1-indexed. Starting at position 2 with
> length 4 extracts characters 2, 3, 4, 5. Option C has the wrong length parameter — starting at
> position 2 with length 5 would extract characters 2 through 6. `MID` is MySQL syntax not used
> in Databricks SQL.

---

## Question 15: EXPLAIN Statement *(Easy)*

A data analyst wants to understand why a SQL query is performing slowly. Which statement provides
the query execution plan?

A) `DESCRIBE query_name`
B) `PROFILE SELECT ...`
C) `EXPLAIN SELECT ...`
D) `ANALYZE SELECT ...`

> [!success]- Answer
> **Correct Answer: C**
>
> `EXPLAIN SELECT ...` shows the logical and physical query plan including joins, scans, and
> filters. In Databricks SQL, the query history UI also shows a visual plan for completed queries.
> `DESCRIBE` describes table schemas, not query plans. `PROFILE` and `ANALYZE SELECT` are not
> valid Databricks SQL statements.

---

## Question 16: NULL Handling in Aggregations *(Medium)*

A column `revenue` has some NULL values. What does `SUM(revenue)` return?

A) NULL — if any value is NULL, the aggregate is NULL
B) The sum of non-NULL values
C) An error — cannot aggregate columns with NULLs
D) 0 — NULLs are treated as 0 in aggregations

> [!success]- Answer
> **Correct Answer: B**
>
> SQL aggregate functions (SUM, AVG, COUNT, MIN, MAX) ignore NULL values by default. Only
> `COUNT(*)` counts NULLs; `COUNT(column)` ignores them. `SUM` returns NULL only if ALL values
> in the column are NULL. NULLs are never silently treated as 0.

---

## Question 17: SEMI JOIN *(Medium)*

A query returns all products that have at least one review. Which JOIN type is most appropriate?

A) INNER JOIN on reviews
B) LEFT JOIN on reviews
C) LEFT SEMI JOIN — returns left rows where match exists, no duplication
D) CROSS JOIN

> [!success]- Answer
> **Correct Answer: C**
>
> `LEFT SEMI JOIN` returns rows from the left table (products) where a match exists in the right
> table (reviews), without producing duplicate product rows. INNER JOIN can produce multiple rows
> per product when a product has multiple reviews, requiring a DISTINCT or GROUP BY to deduplicate.

---

## Question 18: Subquery in WHERE *(Medium)*

Which query returns employees earning more than the average salary?

A) `SELECT * FROM employees WHERE salary > AVG(salary)`
B) `SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)`
C) `SELECT * FROM employees HAVING salary > AVG(salary)`
D) `SELECT * FROM employees WHERE salary > MEAN(salary)`

> [!success]- Answer
> **Correct Answer: B**
>
> Aggregate functions cannot appear in `WHERE` clauses of the outer query. A scalar subquery in
> the `WHERE` clause computes the average separately and passes it as a value for comparison.
> `MEAN` is not a standard SQL aggregate function in Databricks SQL — use `AVG`.

---

**[← Previous: Data Management Practice Questions](./02-data-management.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Dashboards & Visualization Practice Questions](./04-dashboards-visualization.md) →**

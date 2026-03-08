---
tags: [interview-prep, pyspark, sql]
aliases: [PySpark API, 08-pyspark-api]
---

# Interview Questions — PySpark & SQL Patterns

---

## Question 1: Window Function Frame Specifications

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A colleague's running total query gives unexpected results. They're using `sum("amount").over(Window.partitionBy("customer_id").orderBy("event_date"))` but notice rows with the same `event_date` all get the same running total instead of a true cumulative sum. What is wrong and how do you fix it?

> [!success]- Answer Framework
>
> **Short Answer**: When `orderBy` is present in a Window spec without an explicit frame, Spark defaults to `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, which groups all tied rows into the same frame and produces identical sums for tied dates; fix it by specifying `rowsBetween(Window.unboundedPreceding, 0)` to use row position instead of value range for the frame boundary.
>
> ### Key Points to Cover
>
> - Default frame with `orderBy`: `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
> - `RANGE` frame groups rows with equal `orderBy` values together (treats ties as one frame)
> - `ROWS` frame uses physical row position — always unique, never groups ties
> - Fix: always specify `rowsBetween(Window.unboundedPreceding, 0)` for running aggregations
> - Common frame patterns: running total, total per group, moving average
>
> ### Example Answer
>
> **The problem — `RANGE` frame and ties**: Spark's default frame when `orderBy` is present is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. A `RANGE` frame includes all rows whose `orderBy` column value is ≤ the current row's value. When two rows share the same `event_date`, they are both "current" in the range, so they both receive the same sum — the total for the entire tied group, not a proper running cumulative.
>
> ```python
> from pyspark.sql import Window
> from pyspark.sql.functions import sum, col
>
> # Buggy: uses RANGE frame by default — ties get the same sum
> window_range = Window.partitionBy("customer_id").orderBy("event_date")
> df.withColumn("running_total", sum("amount").over(window_range))
>
> # Fixed: use ROWS frame — strictly positional, no tie ambiguity
> window_rows = (
>     Window.partitionBy("customer_id")
>     .orderBy("event_date")
>     .rowsBetween(Window.unboundedPreceding, 0)
> )
> df.withColumn("running_total", sum("amount").over(window_rows))
> ```
>
> **Common window frame patterns:**
>
> | Goal | Frame Spec |
> | ---- | ---------- |
> | Running total (cumulative sum) | `rowsBetween(unboundedPreceding, 0)` |
> | Total per partition (same for all rows) | `rowsBetween(unboundedPreceding, unboundedFollowing)` |
> | 7-day moving average | `rowsBetween(-6, 0)` |
> | Previous row only | `rowsBetween(-1, -1)` |
>
> **When to use `RANGE` vs `ROWS`**:
>
> - Use `RANGE` when you want all rows with the same value to receive the same aggregate (e.g., dense-rank-style grouping)
> - Use `ROWS` for true positional running aggregations (running total, moving average)
>
> ### Follow-up Questions
>
> - What happens if you omit `orderBy` from a window spec entirely? What is the default frame?
> - For a 7-day moving average on a sparse time series (missing days), should you use `ROWS` or `RANGE`? Why?
> - Can you use `rowsBetween` with an unordered window spec? What error do you get?

---

## Question 2: Ranking Functions — rank vs dense_rank vs row_number

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
You need to find the most recent order for each customer. Two orders for customer 42 share the exact same `order_timestamp`. Which ranking function guarantees exactly one row per customer, and what happens with the other ranking functions when there is a tie?

> [!success]- Answer Framework
>
> **Short Answer**: Use `row_number()` for deduplication — it always assigns a unique sequential number within each partition regardless of ties; `rank()` assigns the same number to tied rows and leaves gaps (1, 1, 3), while `dense_rank()` assigns the same number without gaps (1, 1, 2) — neither guarantees uniqueness per group.
>
> ### Key Points to Cover
>
> - `row_number()`: always unique within partition; arbitrary tiebreak; use for deduplication
> - `rank()`: tied rows share the same rank; subsequent rank has a gap; use for leaderboard-style ranking
> - `dense_rank()`: tied rows share the same rank; no gaps; use for competition-style leaderboard
> - Deduplication pattern: `row_number()` + `orderBy(desc("ts"), "id")` for deterministic tiebreak
> - Filter with `.filter(col("rn") == 1)` after ranking
>
> ### Example Answer
>
> ```python
> from pyspark.sql import Window
> from pyspark.sql.functions import row_number, rank, dense_rank, desc, col
>
> window = Window.partitionBy("customer_id").orderBy(desc("order_timestamp"), "order_id")
>
> ranked = (df
>     .withColumn("rn", row_number().over(window))
>     .withColumn("rnk", rank().over(window))
>     .withColumn("dense_rnk", dense_rank().over(window)))
> ```
>
> For customer 42 with two tied orders (same timestamp):
>
> | order_id | order_timestamp | row_number | rank | dense_rank |
> | -------- | --------------- | ---------- | ---- | ---------- |
> | 101 | 2025-01-15 12:00 | 1 | 1 | 1 |
> | 102 | 2025-01-15 12:00 | 2 | 1 | 1 |
> | 99 | 2025-01-10 09:00 | 3 | 3 | 2 |
>
> **Why `row_number()` for deduplication**: `rank()` and `dense_rank()` both assign rank=1 to both tied rows — filtering `WHERE rank = 1` returns two rows for customer 42, not one. `row_number()` always gives unique numbers; the tie is broken by `order_id` (secondary sort key), deterministically selecting one row.
>
> ```python
> # Deduplication: keep the most recent order per customer
> most_recent = (df
>     .withColumn(
>         "rn",
>         row_number().over(
>             Window.partitionBy("customer_id")
>             .orderBy(desc("order_timestamp"), "order_id")
>         )
>     )
>     .filter(col("rn") == 1)
>     .drop("rn"))
> ```
>
> **Choosing the right function:**
>
> | Use Case | Function |
> | -------- | -------- |
> | Deduplicate (exactly 1 per group) | `row_number()` |
> | Competition ranking (1st, 1st, 3rd) | `rank()` |
> | Leaderboard without gaps (1st, 1st, 2nd) | `dense_rank()` |
>
> ### Follow-up Questions
>
> - If you add a secondary `orderBy` column as a tiebreaker in `row_number()`, is the result deterministic across re-runs?
> - `dense_rank()` is preferred over `rank()` for what type of analytical query? Give a concrete example.
> - Can you use `row_number()` without `orderBy`? What does Spark return?

---

## Question 3: lag() and lead() for Time-Series Comparisons

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Calculate month-over-month revenue change for each product. Flag any month where revenue dropped more than 20% compared to the prior month. Products with no prior month record should not be flagged.

> [!success]- Answer Framework
>
> **Short Answer**: Use `lag("revenue", 1).over(Window.partitionBy("product_id").orderBy("year_month"))` to bring the previous month's revenue into the current row, then compute the percentage change and apply `when/otherwise` to set the flag — handle the first-month null explicitly with `when(prev_revenue.isNull(), False)` to avoid flagging products with no history.
>
> ### Key Points to Cover
>
> - `lag(col, offset, default)` — access previous row's value; returns null if no prior row
> - `lead(col, offset, default)` — access next row's value
> - Always partition correctly (per entity) before ordering by time
> - Null handling: first period has no prior — `when(...isNull()...)` prevents false flags
> - `when/otherwise` for conditional flag column
>
> ### Example Answer
>
> ```python
> from pyspark.sql import Window
> from pyspark.sql.functions import lag, col, when, round as spark_round
>
> window = Window.partitionBy("product_id").orderBy("year_month")
>
> result = (df
>     .withColumn("prev_revenue", lag("revenue", 1).over(window))
>     .withColumn(
>         "mom_change_pct",
>         when(
>             col("prev_revenue").isNull() | (col("prev_revenue") == 0),
>             None
>         ).otherwise(
>             spark_round(
>                 (col("revenue") - col("prev_revenue")) / col("prev_revenue") * 100,
>                 2
>             )
>         )
>     )
>     .withColumn(
>         "revenue_drop_flag",
>         when(col("prev_revenue").isNull(), False)
>         .when(col("mom_change_pct") < -20, True)
>         .otherwise(False)
>     ))
> ```
>
> **Common lag/lead patterns:**
>
> | Goal | Function |
> | ---- | -------- |
> | Compare to previous period | `lag("col", 1).over(window)` |
> | Compare to same period last year | `lag("col", 12).over(window)` |
> | Look ahead (forecast comparison) | `lead("col", 1).over(window)` |
> | Default for first/last row | `lag("col", 1, 0).over(window)` |
>
> **Equivalent SQL:**
>
> ```sql
> SELECT
>     product_id,
>     year_month,
>     revenue,
>     LAG(revenue, 1) OVER (PARTITION BY product_id ORDER BY year_month) AS prev_revenue,
>     CASE
>         WHEN LAG(revenue, 1) OVER (PARTITION BY product_id ORDER BY year_month) IS NULL THEN FALSE
>         WHEN (revenue - LAG(revenue, 1) OVER (PARTITION BY product_id ORDER BY year_month))
>              / LAG(revenue, 1) OVER (PARTITION BY product_id ORDER BY year_month) < -0.20 THEN TRUE
>         ELSE FALSE
>     END AS revenue_drop_flag
> FROM monthly_revenue;
> ```
>
> ### Follow-up Questions
>
> - Your data has missing months for some products. Does `lag` look back to the last existing row or the previous calendar month?
> - How do you calculate a 3-month rolling average using window functions?
> - What is the difference between `lag("col", 1, 0)` and `coalesce(lag("col", 1), lit(0))`?

---

## Question 4: Python UDFs vs Pandas UDFs vs Native Spark Functions

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A colleague wrote a Python UDF to normalize phone numbers (strip non-digit characters, format as `+1-XXX-XXX-XXXX`). The job processes 500 million records and takes 4 hours. What are the performance problems with Python UDFs and how would you fix this?

> [!success]- Answer Framework
>
> **Short Answer**: Row-at-a-time Python UDFs serialize each row through the JVM-Python boundary (costly per-row overhead), while Pandas UDFs process entire columnar batches via Apache Arrow (~10–100x faster), and native Spark functions (`regexp_replace`, `concat`) execute entirely in the JVM with zero serialization — always prefer native → Pandas UDF → Python UDF in that order, and phone normalization can usually be handled entirely with native functions.
>
> ### Key Points to Cover
>
> - Python UDF: row-at-a-time, JVM↔Python serialization per row, no Catalyst optimization
> - Pandas UDF (`@pandas_udf`): batch processing via Apache Arrow, much faster
> - Native functions: run in JVM, Catalyst-optimized, fastest
> - Priority: native first, Pandas UDF if no native option, Python UDF only as last resort
> - Phone normalization is a regex operation — use native `regexp_replace`
>
> ### Example Answer
>
> **Why Python UDFs are slow**: Every row must be serialized from the JVM, deserialized in Python, processed, serialized back, and deserialized into the JVM again. At 500M rows, this serialization overhead dominates runtime.
>
> **Option 1 — Native Spark functions (fastest)**:
>
> Phone normalization is string manipulation — Spark already has `regexp_replace` and `substr`:
>
> ```python
> from pyspark.sql.functions import regexp_replace, concat, lit, col
>
> digits = regexp_replace(col("phone"), r"\D", "")
> normalized = (df.withColumn(
>     "phone_normalized",
>     concat(
>         lit("+1-"),
>         digits.substr(1, 3),
>         lit("-"),
>         digits.substr(4, 3),
>         lit("-"),
>         digits.substr(7, 4)
>     )
> ))
> ```
>
> No Python serialization, no UDF overhead, Catalyst-optimized.
>
> **Option 2 — Pandas UDF (when native is insufficient)**:
>
> ```python
> import pandas as pd
> from pyspark.sql.functions import pandas_udf
> from pyspark.sql.types import StringType
>
> @pandas_udf(StringType())
> def normalize_phone(phones: pd.Series) -> pd.Series:
>     digits = phones.str.replace(r"\D", "", regex=True)
>     return digits.apply(
>         lambda p: f"+1-{p[0:3]}-{p[3:6]}-{p[6:10]}" if len(p) >= 10 else None
>     )
>
> df.withColumn("phone_normalized", normalize_phone(col("phone")))
> ```
>
> Pandas UDFs process an entire Arrow batch at once — no per-row serialization.
>
> **Performance comparison:**
>
> | Approach | Overhead | Catalyst Optimizable | When to Use |
> | -------- | -------- | -------------------- | ----------- |
> | Native functions | None | Yes | Always first choice |
> | Pandas UDF | Arrow batch serialization | No | Complex logic, no native equivalent |
> | Python UDF | Per-row serialization | No | Last resort; avoid in production |
>
> ### Follow-up Questions
>
> - When can you NOT replace a Python UDF with a Pandas UDF? Give an example.
> - A Pandas UDF processes a batch of rows at once. Where does this batch size come from?
> - You need to call an external ML model API for each row. Which UDF type is appropriate, and what other optimization would you apply?

---

## Question 5: Handling Nested and Complex Data Types

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Your Bronze table has a `payload` column containing JSON strings like `{"events": [{"type": "click", "ts": 1706745600}, {"type": "view", "ts": 1706745700}]}`. You need to produce a Silver table with one row per event. Walk through your approach.

> [!success]- Answer Framework
>
> **Short Answer**: Parse the JSON string with `from_json(col("payload"), schema)` to get a struct, access the nested array with `col("parsed.events")`, then use `explode()` to produce one row per event element — use `explode_outer` instead of `explode` to preserve rows where the array is null or empty, and always define the schema explicitly rather than inferring it at runtime.
>
> ### Key Points to Cover
>
> - `from_json(col, schema)` to parse JSON string into a struct
> - Schema definition: explicit `StructType` or `schema_of_json` for inference from sample
> - `explode(col)` — one row per array element; silently drops rows where array is null/empty
> - `explode_outer(col)` — preserves null/empty array rows as a single null row
> - Dot notation for struct field access: `col("parsed.events")`
> - `get_json_object` for simple single-field extraction without full parsing
>
> ### Example Answer
>
> **Step 1 — Define the schema**:
>
> ```python
> from pyspark.sql.types import (
>     StructType, StructField, StringType, LongType, ArrayType
> )
>
> event_schema = StructType([
>     StructField("events", ArrayType(StructType([
>         StructField("type", StringType()),
>         StructField("ts", LongType())
>     ])))
> ])
> ```
>
> **Step 2 — Parse JSON and explode**:
>
> ```python
> from pyspark.sql.functions import from_json, explode_outer, col
>
> silver = (bronze_df
>     .withColumn("parsed", from_json(col("payload"), event_schema))
>     .withColumn("event", explode_outer(col("parsed.events")))
>     .select(
>         col("record_id"),
>         col("_ingestion_timestamp"),
>         col("event.type").alias("event_type"),
>         col("event.ts").alias("event_ts")
>     ))
> ```
>
> **Why `explode_outer` over `explode`**: If a Bronze row has `payload = null` or `{"events": []}`, `explode` silently drops the row — you lose data. `explode_outer` keeps the row with null event fields so you can audit empty payloads.
>
> **Quick reference for nested data operations:**
>
> | Function | Use Case |
> | -------- | -------- |
> | `from_json(col, schema)` | Parse JSON string to struct |
> | `to_json(col)` | Serialize struct back to JSON string |
> | `get_json_object(col, "$.field")` | Extract one field without full parse |
> | `explode(col)` | One row per array element (drops nulls) |
> | `explode_outer(col)` | One row per array element (keeps nulls) |
> | `col("struct.nested_field")` | Access nested struct field |
> | `flatten(col)` | Flatten array of arrays to one array |
> | `arrays_zip(a, b)` | Zip two arrays element-wise into structs |
>
> ### Follow-up Questions
>
> - The JSON schema is inconsistent — some records have extra fields. How does `from_json` handle unknown fields?
> - How do you handle a column that is sometimes a JSON string and sometimes already a struct?
> - After `explode`, how many rows does a Bronze record with 5 events produce? What about a record with an empty events array when using `explode_outer`?

---

## Question 6: QUALIFY Clause in Databricks SQL

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Write a query to keep only the most recent record per `customer_id` from a `customers` table — without using a subquery or CTE. Then explain what `QUALIFY` does and when to use it.

> [!success]- Answer Framework
>
> **Short Answer**: `QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1` filters rows directly on a window function result in a single clause — it is Databricks SQL's equivalent of wrapping a window expression in a CTE and adding a `WHERE` filter, but without nesting; use it for deduplication and top-N-per-group queries.
>
> ### Key Points to Cover
>
> - `QUALIFY` filters on the result of a window function inline (no CTE or subquery needed)
> - Equivalent to CTE + `WHERE rn = 1` pattern but more concise
> - Supported in Databricks SQL and BigQuery; not standard ANSI SQL
> - Works with any window function: `row_number`, `rank`, `dense_rank`, aggregate functions
> - `QUALIFY` is evaluated after `WHERE` and `HAVING`, before `ORDER BY` and `LIMIT`
>
> ### Example Answer
>
> **Without QUALIFY** (CTE pattern):
>
> ```sql
> WITH ranked AS (
>     SELECT
>         customer_id,
>         name,
>         email,
>         updated_at,
>         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn
>     FROM customers
> )
> SELECT customer_id, name, email, updated_at
> FROM ranked
> WHERE rn = 1;
> ```
>
> **With QUALIFY** (Databricks SQL):
>
> ```sql
> SELECT customer_id, name, email, updated_at
> FROM customers
> QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1;
> ```
>
> **How `QUALIFY` works**: It applies a filter condition on the result of a window function computed over the current query's result set. The window function expression does not need to appear in the `SELECT` list — it is evaluated implicitly for filtering only.
>
> **Other useful `QUALIFY` patterns:**
>
> ```sql
> -- Top 3 orders by revenue per customer
> SELECT customer_id, order_id, revenue
> FROM orders
> QUALIFY RANK() OVER (PARTITION BY customer_id ORDER BY revenue DESC) <= 3;
>
> -- Keep only the row where the running total first exceeds a threshold
> SELECT customer_id, order_date, amount
> FROM orders
> QUALIFY SUM(amount) OVER (
>     PARTITION BY customer_id ORDER BY order_date
>     ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
> ) <= 10000;
> ```
>
> **Query clause evaluation order:**
>
> ```text
> FROM → WHERE → GROUP BY → HAVING → SELECT (window functions) → QUALIFY → ORDER BY → LIMIT
> ```
>
> ### Follow-up Questions
>
> - Can you use `QUALIFY` with `HAVING` in the same query? What order are they evaluated?
> - Is `QUALIFY` available in standard Spark SQL (not Databricks SQL)? How would you handle deduplication in a PySpark job?
> - You want the most recent record per customer, but if two records share the same `updated_at`, pick the one with the higher `customer_id`. How do you write the `QUALIFY` clause?

---

## Question 7: Recursive CTEs for Hierarchical Data

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
You have an `employees` table with `employee_id` and `manager_id` columns. You need to find all reports (direct and indirect) for a given manager. How do you solve this in Databricks SQL, and what do you do in PySpark if recursive CTEs are not available?

> [!success]- Answer Framework
>
> **Short Answer**: Use `WITH RECURSIVE` in Databricks SQL to traverse the hierarchy by anchoring on the target manager and recursively joining on `manager_id = employee_id` until no more child rows are found; in PySpark, implement an iterative loop that joins the current level's employees to their direct reports and unions results until the new level is empty.
>
> ### Key Points to Cover
>
> - `WITH RECURSIVE` syntax: anchor member (base case) + recursive member (self-join)
> - Termination condition: recursion stops when the recursive member returns no new rows
> - Max recursion depth: default limit exists to prevent infinite loops (circular references)
> - PySpark iterative workaround: loop with join + union + anti-join to detect new rows
> - Performance: recursive CTEs can be expensive on deep hierarchies — consider materializing levels
>
> ### Example Answer
>
> **Databricks SQL — `WITH RECURSIVE`**:
>
> ```sql
> WITH RECURSIVE org_chart AS (
>     -- Anchor: start with the target manager
>     SELECT
>         employee_id,
>         employee_name,
>         manager_id,
>         0 AS depth
>     FROM employees
>     WHERE employee_id = 1001  -- target manager
>
>     UNION ALL
>
>     -- Recursive: find direct reports of the current level
>     SELECT
>         e.employee_id,
>         e.employee_name,
>         e.manager_id,
>         oc.depth + 1
>     FROM employees e
>     INNER JOIN org_chart oc
>         ON e.manager_id = oc.employee_id
> )
> SELECT * FROM org_chart
> ORDER BY depth, employee_name;
> ```
>
> The query starts with manager 1001 (anchor), then recursively finds everyone whose `manager_id` matches an `employee_id` already in the result set. It terminates when a recursive iteration returns zero new rows.
>
> **Guarding against infinite loops**: Circular references (A reports to B, B reports to A) will cause infinite recursion. Add a depth limit:
>
> ```sql
> -- Add to the WHERE clause of the recursive member:
> WHERE oc.depth < 20  -- safety limit
> ```
>
> **PySpark iterative workaround** (when recursive CTEs are unavailable): Use a `while` loop that joins `current_level` to `employees` on `manager_id == employee_id`, unions each new level into the result, and terminates when no new rows are found or a depth limit is reached. The SQL recursive CTE is cleaner and lets the optimizer handle execution, but the iterative approach gives more control over termination and per-level transformations.
>
> ### Follow-up Questions
>
> - What is the default maximum recursion depth in Databricks SQL, and how do you change it?
> - How would you find the shortest path between two employees in the org chart?
> - If the `employees` table has 10 million rows but only 8 levels deep, which approach performs better and why?

---

## Question 8: PIVOT and UNPIVOT for Reshaping Data

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
You have a table with columns `(product, month, revenue)` containing monthly revenue by product. Your BI tool requires the data reshaped so each month becomes its own column. How do you pivot this data in both SQL and PySpark, and how do you reverse it?

> [!success]- Answer Framework
>
> **Short Answer**: Use SQL `PIVOT` to rotate row values into columns by specifying an aggregate function and the list of pivot values, use `UNPIVOT` to reverse the transformation back to rows; in PySpark, use `.groupBy("product").pivot("month").agg(sum("revenue"))` — note that SQL PIVOT requires a static column list while PySpark can discover values dynamically (at the cost of an extra scan).
>
> ### Key Points to Cover
>
> - SQL `PIVOT`: requires explicit list of values to become columns
> - SQL `UNPIVOT`: reverses pivot — converts columns back to rows
> - PySpark `.pivot()`: can auto-discover values (but triggers extra job) or accept explicit list
> - Static column list requirement: SQL PIVOT does not support dynamic column lists natively
> - Dynamic pivot workaround: query distinct values first, then build the PIVOT SQL string
>
> ### Example Answer
>
> **Source data:**
>
> | product | month | revenue |
> | ------- | ----- | ------- |
> | Widget  | Jan   | 1000    |
> | Widget  | Feb   | 1200    |
> | Gadget  | Jan   | 800     |
> | Gadget  | Feb   | 950     |
>
> **SQL PIVOT** — rows to columns:
>
> ```sql
> SELECT *
> FROM monthly_revenue
> PIVOT (
>     SUM(revenue)
>     FOR month IN ('Jan' AS Jan, 'Feb' AS Feb, 'Mar' AS Mar)
> );
> ```
>
> Result:
>
> | product | Jan  | Feb  | Mar  |
> | ------- | ---- | ---- | ---- |
> | Widget  | 1000 | 1200 | NULL |
> | Gadget  | 800  | 950  | NULL |
>
> **SQL UNPIVOT** — columns back to rows:
>
> ```sql
> SELECT product, month, revenue
> FROM pivoted_revenue
> UNPIVOT (
>     revenue
>     FOR month IN (Jan, Feb, Mar)
> );
> ```
>
> This converts each month column back into a `(month, revenue)` row, dropping NULLs by default.
>
> **PySpark PIVOT**:
>
> ```python
> from pyspark.sql.functions import sum
>
> pivoted = (df
>     .groupBy("product")
>     .pivot("month", ["Jan", "Feb", "Mar"])  # explicit list avoids extra scan
>     .agg(sum("revenue")))
>
> pivoted.show()
> ```
>
> Passing the values list to `.pivot()` is a best practice — without it, PySpark scans the entire column to discover distinct values, which is expensive on large datasets.
>
> **PySpark UNPIVOT** (using `stack`):
>
> ```python
> from pyspark.sql.functions import expr
>
> unpivoted = (pivoted
>     .select(
>         "product",
>         expr("""
>             stack(3,
>                 'Jan', Jan,
>                 'Feb', Feb,
>                 'Mar', Mar
>             ) AS (month, revenue)
>         """)
>     )
>     .filter("revenue IS NOT NULL"))
>
> unpivoted.show()
> ```
>
> **Dynamic pivot workaround** — when you do not know the month values at code time:
>
> ```python
> # Step 1: discover distinct values
> months = [row.month for row in df.select("month").distinct().collect()]
>
> # Step 2: use the list in pivot
> pivoted = (df
>     .groupBy("product")
>     .pivot("month", months)
>     .agg(sum("revenue")))
> ```
>
> Or in SQL, generate the query string dynamically in a notebook and execute it with `spark.sql()`.
>
> ### Follow-up Questions
>
> - What happens if a pivot value appears multiple times for the same group? How does the aggregation handle it?
> - How do you handle pivoting on two columns simultaneously (e.g., month and region)?
> - Why does PySpark's `.pivot()` without an explicit value list cause a performance penalty?

---

## Question 9: Semi-Joins, Anti-Joins, and EXISTS Patterns

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
During a data migration, you need to find records that exist in the source table but are missing from the target table. What is the most efficient approach, and what pitfalls should you watch for?

> [!success]- Answer Framework
>
> **Short Answer**: Use a `LEFT ANTI JOIN` to find records in the source with no match in the target — it returns only non-matching rows without duplicating data; avoid `NOT IN` with nullable columns because a single NULL in the subquery causes the entire result to be empty, and prefer `NOT EXISTS` or anti-join for null-safe correctness and performance.
>
> ### Key Points to Cover
>
> - LEFT ANTI JOIN: returns rows from left table with no match in right — no duplication risk
> - LEFT SEMI JOIN: returns rows from left table with at least one match in right — also no duplication
> - `NOT EXISTS` vs `NOT IN`: `NOT IN` returns zero rows if the subquery contains any NULL value
> - Performance: anti-join can broadcast the smaller table for hash-based filtering
> - PySpark equivalents: `.join(other, condition, "left_anti")` and `.join(other, condition, "left_semi")`
>
> ### Example Answer
>
> **LEFT ANTI JOIN** — find records in source missing from target:
>
> ```sql
> -- Records in source but NOT in target (missing from migration)
> SELECT s.*
> FROM source_table s
> LEFT ANTI JOIN target_table t
>     ON s.record_id = t.record_id;
> ```
>
> This is the cleanest and safest approach. It returns only source rows with no corresponding target row, without any risk of row duplication.
>
> **LEFT SEMI JOIN** — find records in source that DO exist in target:
>
> ```sql
> -- Records in source that WERE successfully migrated
> SELECT s.*
> FROM source_table s
> LEFT SEMI JOIN target_table t
>     ON s.record_id = t.record_id;
> ```
>
> Unlike a regular `INNER JOIN`, a semi-join never duplicates rows from the left table — even if there are multiple matches in the right table. This makes it ideal for existence checks.
>
> **The `NOT IN` null-safety trap**:
>
> ```sql
> -- DANGEROUS: returns ZERO rows if any record_id in target is NULL
> SELECT *
> FROM source_table
> WHERE record_id NOT IN (SELECT record_id FROM target_table);
>
> -- SAFE: NOT EXISTS handles NULLs correctly
> SELECT *
> FROM source_table s
> WHERE NOT EXISTS (
>     SELECT 1
>     FROM target_table t
>     WHERE t.record_id = s.record_id
> );
> ```
>
> **Why `NOT IN` fails with NULLs**: SQL's three-valued logic means `5 NOT IN (1, 2, NULL)` evaluates to `UNKNOWN` (not `TRUE`), because `5 <> NULL` is `UNKNOWN`. When any element is UNKNOWN, the entire `NOT IN` is UNKNOWN, and the row is excluded.
>
> **PySpark equivalents**:
>
> ```python
> # Anti-join: source records missing from target
> missing = source_df.join(
>     target_df,
>     on="record_id",
>     how="left_anti"
> )
>
> # Semi-join: source records present in target
> present = source_df.join(
>     target_df,
>     on="record_id",
>     how="left_semi"
> )
> ```
>
> **Performance comparison**:
>
> | Pattern | Null-Safe | Duplicates Left Rows | Broadcast Eligible |
> | ------- | --------- | -------------------- | ------------------ |
> | LEFT ANTI JOIN | Yes | No | Yes (small right table) |
> | NOT EXISTS | Yes | No | Depends on optimizer |
> | NOT IN | No (fails with NULLs) | No | Depends on optimizer |
> | LEFT JOIN + WHERE IS NULL | Yes | Yes (if multiple matches) | Yes |
>
> The `LEFT JOIN + WHERE t.key IS NULL` pattern is common but risky — if the right table has duplicate keys, it produces duplicate left rows before the filter, wasting memory and compute. Anti-join avoids this entirely.
>
> ### Follow-up Questions
>
> - When would you choose `NOT EXISTS` over `LEFT ANTI JOIN`? Are they always equivalent in Databricks?
> - How does Spark's optimizer handle a semi-join when the right side is small enough to broadcast?
> - You need to find records that exist in both source and target but have different column values. Which join type do you use?

---

**[← Previous: Performance Optimization](./07-performance-optimization.md) | [↑ Back to Interview Prep](./README.md) | [Next: Python Code Quality →](./09-python-code-quality.md)**

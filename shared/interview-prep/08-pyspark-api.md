# Interview Questions — PySpark API Deep Dive

[Back to Interview Prep](./README.md) | [Previous: File Formats & Spark Internals](07-file-formats-spark.md) | [Next: Python for Production Data Engineering](09-python-code-quality.md)

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

[Back to Interview Prep](./README.md) | [Previous: File Formats & Spark Internals](07-file-formats-spark.md) | [Next: Python for Production Data Engineering](09-python-code-quality.md)

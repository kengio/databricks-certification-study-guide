---
tags:
  - code-examples
  - sql
  - cdc
  - merge
  - scd
  - delta-lake
---

# CDC and MERGE Patterns — SQL

SQL examples for SCD MERGE, APPLY CHANGES (DLT), Change Data Feed queries, and deduplication.

## SCD Type 1 MERGE — Overwrite Current State

```sql
-- Basic upsert: update if exists, insert if new
MERGE INTO my_catalog.silver.customers AS t
USING my_catalog.bronze.customers_cdc AS s
ON t.customer_id = s.customer_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

```sql
-- Upsert with timestamp guard (only apply newer records)
MERGE INTO my_catalog.silver.customers AS t
USING my_catalog.bronze.customers_cdc AS s
ON t.customer_id = s.customer_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
  UPDATE SET
    t.name       = s.name,
    t.email      = s.email,
    t.updated_at = s.updated_at
WHEN NOT MATCHED THEN INSERT *;
```

```sql
-- Upsert + soft-delete in one statement
MERGE INTO my_catalog.silver.customers AS t
USING my_catalog.bronze.customers_cdc AS s
ON t.customer_id = s.customer_id
WHEN MATCHED AND s.op = 'D' THEN
  UPDATE SET t.is_deleted = true, t.deleted_at = current_timestamp()
WHEN MATCHED AND s.op != 'D' AND s.updated_at > t.updated_at THEN
  UPDATE SET *
WHEN NOT MATCHED AND s.op != 'D' THEN INSERT *;
```

## SCD Type 2 MERGE — Full History

```sql
-- Step 1: Expire current records that have changed
MERGE INTO my_catalog.silver.customers_history AS t
USING my_catalog.bronze.customers_cdc AS s
ON t.customer_id = s.customer_id AND t.is_current = true
WHEN MATCHED AND (t.email <> s.email OR t.name <> s.name) THEN
  UPDATE SET
    t.is_current = false,
    t.__END_AT   = current_timestamp();

-- Step 2: Insert new versions for the changed records
INSERT INTO my_catalog.silver.customers_history
SELECT
  s.customer_id,
  s.name,
  s.email,
  true           AS is_current,
  current_timestamp() AS __START_AT,
  NULL           AS __END_AT
FROM my_catalog.bronze.customers_cdc AS s
INNER JOIN my_catalog.silver.customers_history AS t
  ON s.customer_id = t.customer_id
  AND t.is_current = false
  AND t.__END_AT >= current_timestamp() - INTERVAL 5 MINUTES;
```

```sql
-- Query current (active) records
SELECT * FROM my_catalog.silver.customers_history
WHERE is_current = true;

-- Query full history for one customer
SELECT customer_id, name, email, __START_AT, __END_AT
FROM my_catalog.silver.customers_history
WHERE customer_id = 42
ORDER BY __START_AT;

-- Query state as of a specific date
SELECT * FROM my_catalog.silver.customers_history
WHERE __START_AT <= '2024-06-01'
  AND (  __END_AT > '2024-06-01'
      OR __END_AT IS NULL);
```

## APPLY CHANGES SQL Syntax (DLT)

Full syntax for the APPLY CHANGES INTO statement used inside Lakeflow Pipelines:

```sql
-- Create target streaming table first
CREATE OR REFRESH STREAMING TABLE my_catalog.silver.customers;

-- SCD Type 1
APPLY CHANGES INTO LIVE.customers
FROM STREAM(LIVE.customers_cdc)
KEYS (customer_id)
SEQUENCE BY updated_at
COLUMNS * EXCEPT (_commit_version, _commit_timestamp)
STORED AS SCD TYPE 1;
```

```sql
-- SCD Type 2 with history columns
CREATE OR REFRESH STREAMING TABLE my_catalog.silver.customers_history;

APPLY CHANGES INTO LIVE.customers_history
FROM STREAM(LIVE.customers_cdc)
KEYS (customer_id)
SEQUENCE BY updated_at
COLUMNS email, name, phone          -- Only track changes to these columns
STORED AS SCD TYPE 2;
```

```sql
-- With delete and truncate support
APPLY CHANGES INTO LIVE.customers
FROM STREAM(LIVE.customers_cdc)
KEYS (customer_id)
SEQUENCE BY updated_at
APPLY AS DELETES WHEN op = 'D'
APPLY AS TRUNCATES WHEN op = 'TRUNCATE'
STORED AS SCD TYPE 1;
```

| Clause | Description |
| :--- | :--- |
| `KEYS (cols)` | Primary key columns |
| `SEQUENCE BY col` | Column for ordering changes (latest wins) |
| `COLUMNS * EXCEPT (...)` | Exclude metadata columns from target |
| `APPLY AS DELETES WHEN expr` | Treat matching rows as deletes |
| `APPLY AS TRUNCATES WHEN expr` | Treat matching rows as table truncate |
| `STORED AS SCD TYPE 1\|2` | Overwrite vs full history |

## CDF Query Patterns

```sql
-- Read CDF as batch (version range)
SELECT *,
       _change_type,
       _commit_version,
       _commit_timestamp
FROM table_changes('my_catalog.bronze.orders', 5, 10);

-- Read CDF from a version to the latest
SELECT * FROM table_changes('my_catalog.bronze.orders', 5);

-- Read CDF by timestamp range
SELECT * FROM table_changes(
  'my_catalog.bronze.orders',
  '2024-01-01 00:00:00',
  '2024-01-31 23:59:59'
);

-- Filter to inserts and updates only
SELECT * FROM table_changes('my_catalog.bronze.orders', 0)
WHERE _change_type IN ('insert', 'update_postimage');

-- Find all deletes
SELECT order_id, _commit_timestamp
FROM table_changes('my_catalog.bronze.orders', 0)
WHERE _change_type = 'delete'
ORDER BY _commit_timestamp DESC;
```

## Deduplication SQL

```sql
-- Keep latest record per key using ROW_NUMBER
WITH ranked AS (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY event_id
           ORDER BY updated_at DESC
         ) AS rn
  FROM my_catalog.bronze.events
)
INSERT INTO my_catalog.silver.events_deduped
SELECT * EXCEPT (rn)
FROM ranked
WHERE rn = 1;
```

```sql
-- Deduplicate with SELECT DISTINCT (when full row is the key)
INSERT INTO my_catalog.silver.events_deduped
SELECT DISTINCT *
FROM my_catalog.bronze.events;
```

```sql
-- Idempotent load: MERGE to prevent duplicate insertions
MERGE INTO my_catalog.silver.events AS t
USING (
  SELECT *,
         ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY updated_at DESC) AS rn
  FROM my_catalog.bronze.events
) AS s
ON t.event_id = s.event_id AND s.rn = 1
WHEN MATCHED AND s.updated_at > t.updated_at THEN UPDATE SET *
WHEN NOT MATCHED AND s.rn = 1 THEN INSERT *;
```

```sql
-- CTAS dedup: create a clean table from scratch
CREATE OR REPLACE TABLE my_catalog.silver.events_deduped AS
WITH ranked AS (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY event_id
           ORDER BY updated_at DESC
         ) AS rn
  FROM my_catalog.bronze.events
)
SELECT * EXCEPT (rn) FROM ranked WHERE rn = 1;
```

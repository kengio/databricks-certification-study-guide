---
title: "Lab 01 — Medallion Ingestion"
type: lab
tags:
  - labs
  - medallion
  - delta
  - pyspark
status: published
---

# Lab 01 — Medallion Ingestion (Bronze → Silver → Gold)

End-to-end walkthrough of the medallion architecture with PySpark + Delta. Land raw events in Bronze, cleanse and dedupe into Silver, aggregate into Gold for analytics consumption.

> [!abstract]
>
> - Create three Delta tables in three UC schemas (`bronze`, `silver`, `gold`)
> - Ingest synthetic order events into Bronze using `COPY INTO`
> - Cleanse + dedupe Silver via `MERGE INTO`
> - Aggregate Gold via `CREATE OR REPLACE TABLE AS SELECT`
> - Run `OPTIMIZE` + `VACUUM` to see file-management in action

> [!tip] What you'll exercise
>
> - Delta table create / write / read / merge
> - `COPY INTO` idempotency
> - Schema evolution with `mergeSchema = true`
> - File compaction with `OPTIMIZE` and clean-up with `VACUUM`

---

## Setup — schemas and a UC volume

```sql
USE CATALOG main;

CREATE SCHEMA IF NOT EXISTS bronze;
CREATE SCHEMA IF NOT EXISTS silver;
CREATE SCHEMA IF NOT EXISTS gold;

CREATE VOLUME IF NOT EXISTS main.bronze.landing;
```

> [!note]
> If your workspace's default catalog isn't `main`, substitute your own catalog throughout this lab.

## Step 1 — Synthesise raw events in the landing volume

```python
from pyspark.sql import functions as F
import json, uuid, random
from datetime import datetime, timezone, timedelta

# Build 1,000 synthetic order events as JSON lines
rng = random.Random(42)
now = datetime.now(timezone.utc)
events = []
for i in range(1000):
    events.append({
        "order_id": str(uuid.uuid4()),
        "customer_id": rng.randint(1, 100),
        "amount": round(rng.uniform(5, 500), 2),
        "currency": rng.choice(["USD", "EUR", "JPY"]),
        "event_ts": (now - timedelta(seconds=rng.randint(0, 86400))).isoformat(),
    })

# Sprinkle some duplicates and one malformed row to exercise Silver dedup + bad-record handling
events.append(events[7])
events.append({"order_id": "BAD", "customer_id": "not-a-number", "amount": "x", "currency": "USD", "event_ts": now.isoformat()})

# Write as 4 JSON files in the landing volume
chunks = [events[i::4] for i in range(4)]
for i, chunk in enumerate(chunks):
    path = f"/Volumes/main/bronze/landing/orders_part_{i:02d}.json"
    dbutils.fs.put(path, "\n".join(json.dumps(e) for e in chunk), overwrite=True)

print("Landed 4 files:", dbutils.fs.ls("/Volumes/main/bronze/landing/"))
```

## Step 2 — Bronze: ingest with `COPY INTO`

```sql
CREATE TABLE IF NOT EXISTS main.bronze.orders (
  order_id     STRING,
  customer_id  STRING,
  amount       STRING,
  currency     STRING,
  event_ts     STRING,
  _ingest_ts   TIMESTAMP,
  _source_file STRING
);

COPY INTO main.bronze.orders
FROM (
  SELECT *,
         current_timestamp() AS _ingest_ts,
         _metadata.file_name AS _source_file
  FROM '/Volumes/main/bronze/landing/'
)
FILEFORMAT = JSON
FORMAT_OPTIONS ('inferSchema' = 'true', 'multiline' = 'false')
COPY_OPTIONS ('mergeSchema' = 'true');

SELECT count(*) AS bronze_rows FROM main.bronze.orders;
```

> [!tip]
> Re-run the `COPY INTO` — it should report 0 new files loaded (idempotency in action).

## Step 3 — Silver: cleanse, type, dedupe with `MERGE`

```sql
CREATE TABLE IF NOT EXISTS main.silver.orders (
  order_id    STRING NOT NULL,
  customer_id INT,
  amount      DECIMAL(10, 2),
  currency    STRING,
  event_ts    TIMESTAMP,
  _ingest_ts  TIMESTAMP
)
USING DELTA;

MERGE INTO main.silver.orders AS tgt
USING (
  SELECT
    order_id,
    CAST(customer_id AS INT) AS customer_id,
    CAST(amount AS DECIMAL(10, 2)) AS amount,
    currency,
    CAST(event_ts AS TIMESTAMP) AS event_ts,
    _ingest_ts,
    ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY _ingest_ts DESC) AS rn
  FROM main.bronze.orders
  WHERE order_id IS NOT NULL
    AND TRY_CAST(customer_id AS INT) IS NOT NULL
    AND TRY_CAST(amount      AS DECIMAL(10, 2)) IS NOT NULL
    AND TRY_CAST(event_ts    AS TIMESTAMP) IS NOT NULL
) AS src
ON tgt.order_id = src.order_id
WHEN MATCHED AND src.rn = 1 AND src._ingest_ts > tgt._ingest_ts THEN UPDATE SET *
WHEN NOT MATCHED AND src.rn = 1 THEN INSERT *;

SELECT count(*) AS silver_rows,
       count(DISTINCT order_id) AS distinct_ids
FROM main.silver.orders;
```

The two counts should now match — Silver is deduplicated and well-typed. The malformed row was filtered by the `TRY_CAST` predicates.

## Step 4 — Gold: aggregate for the dashboard

```sql
CREATE OR REPLACE TABLE main.gold.daily_revenue AS
SELECT
  date_trunc('day', event_ts) AS event_date,
  currency,
  COUNT(*)        AS orders,
  SUM(amount)     AS revenue,
  AVG(amount)     AS avg_order_value
FROM main.silver.orders
GROUP BY 1, 2;

SELECT * FROM main.gold.daily_revenue ORDER BY event_date DESC, currency;
```

## Step 5 — File management

```sql
-- Compact small files in the Silver layer
OPTIMIZE main.silver.orders;

-- Inspect the operation history
DESCRIBE HISTORY main.silver.orders LIMIT 5;

-- Drop tombstoned files older than 7 days
-- (in dev only — production should keep the default 7-day retention)
SET spark.databricks.delta.retentionDurationCheck.enabled = false;
VACUUM main.silver.orders RETAIN 0 HOURS;
RESET spark.databricks.delta.retentionDurationCheck.enabled;
```

> [!warning]
> `VACUUM ... RETAIN 0 HOURS` is unsafe in production — it can delete files needed by concurrent readers / time-travel queries. The default 7-day retention exists for a reason. The code above is lab-only.

## Verification

```sql
-- Row counts at each layer
SELECT 'bronze' AS layer, count(*) AS rows FROM main.bronze.orders
UNION ALL SELECT 'silver', count(*) FROM main.silver.orders
UNION ALL SELECT 'gold',   count(*) FROM main.gold.daily_revenue;

-- Gold queries should be fast and return aggregated totals
SELECT currency, SUM(revenue) AS total_revenue
FROM main.gold.daily_revenue
GROUP BY currency;
```

## Cleanup

```sql
DROP TABLE IF EXISTS main.gold.daily_revenue;
DROP TABLE IF EXISTS main.silver.orders;
DROP TABLE IF EXISTS main.bronze.orders;
-- Optionally drop the schemas + volume too
-- DROP SCHEMA main.bronze CASCADE;
-- DROP SCHEMA main.silver CASCADE;
-- DROP SCHEMA main.gold   CASCADE;
```

## Related study material

- [Medallion Architecture (shared)](../shared/fundamentals/medallion-architecture.md)
- [Delta Lake basics (shared)](../shared/fundamentals/delta-lake-basics.md)
- [DE Pro — Data Modelling](../certifications/data-engineer-professional/09-data-modelling/README.md)
- [DE Pro — COPY INTO](../certifications/data-engineer-professional/07-data-ingestion-and-acquisition/02-copy-into.md)

---

**[↑ Back to Labs](./README.md) | [Next: Unity Catalog setup →](./02-unity-catalog-setup.md)**

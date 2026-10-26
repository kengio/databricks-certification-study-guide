---
title: JDBC, REST, and Semi-Structured Ingestion
type: study-material
tags:
  - data-engineer-associate
  - ingestion
  - jdbc
  - rest-api
  - json
  - variant
  - structured-streaming
status: published
---

# JDBC, REST, and Semi-Structured Ingestion

## Overview

Some sources have no managed connector. They are reachable only through a **JDBC/ODBC driver** or a **REST API**. For those, you write notebook code that lands data in cloud storage (a UC volume) or directly in a Unity Catalog table, and you schedule it with **Lakeflow Jobs**. This file also covers ingesting **semi-structured** (nested JSON) and **unstructured** data into UC Delta tables, and the Structured Streaming triggers that turn any of these into batch, incremental, or streaming loads.

> [!abstract]
>
> - **JDBC**: `spark.read.format("jdbc")` with `url`, `dbtable` or `query`, and credentials from **Databricks secrets**. Parallelize with `partitionColumn`, `lowerBound`, `upperBound`, and `numPartitions`
> - **REST**: call the API from a notebook, write the raw responses to a **UC volume**, then load them with Auto Loader or `COPY INTO`, or write a DataFrame straight to a UC table
> - **Semi-structured**: use structs and arrays with dot notation and `explode`, the `:` path syntax on JSON strings, or the **`VARIANT`** type, which Databricks recommends over JSON strings
> - **Triggers**: `processingTime` (streaming), `availableNow` (incremental batch), or no trigger (micro-batches as fast as possible)

> [!tip] What the Exam Tests
>
> - Exam guide skills: JDBC/ODBC or REST clients in notebooks landing data in cloud storage or UC tables, scheduled with Lakeflow Jobs; ingesting semi-structured and unstructured data (JSON, nested data) into UC Delta tables
> - Keeping credentials out of code with `dbutils.secrets.get`
> - Why a JDBC read is slow (a single thread by default) and how to parallelize it
> - Reading nested JSON fields and flattening arrays

---

## JDBC reads from a notebook

```python
jdbc_url = "jdbc:postgresql://db.example.com:5432/sales"

orders = (spark.read
    .format("jdbc")
    .option("url", jdbc_url)
    .option("dbtable", "public.orders")
    .option("user", dbutils.secrets.get(scope="jdbc", key="username"))
    .option("password", dbutils.secrets.get(scope="jdbc", key="password"))
    # Parallel read: split the key range into 8 concurrent queries
    .option("partitionColumn", "order_id")
    .option("lowerBound", "1")
    .option("upperBound", "10000000")
    .option("numPartitions", "8")
    .option("fetchSize", "1000")
    .load())

orders.write.mode("overwrite").saveAsTable("main.bronze.orders_snapshot")
```

| Option | Purpose | Guidance from the docs |
| :--- | :--- | :--- |
| `url`, `dbtable` | Connection string and source table. `dbtable` can be a subquery, which pushes the query down to the database | Store credentials in **secrets**, not in the URL |
| `partitionColumn`, `lowerBound`, `upperBound`, `numPartitions` | Split the read into parallel queries | A JDBC read uses **one thread by default**. Pick an indexed column. Be cautious above about 50 partitions |
| `fetchSize` | Rows per network round trip | Too low adds latency; too high can cause out-of-memory errors. Oracle's default is 10 |

Source: [Query databases using JDBC](https://docs.databricks.com/aws/en/connect/external-systems/jdbc). The same page states: "If Lakehouse Federation supports your source database, Databricks recommends using that instead". Federation queries the source in place without a copy. Choose JDBC ingestion when you need a governed copy in Delta, for example for history or performance.

### JDBC vs Lakehouse Federation vs a managed connector

| Approach | Copies data? | Incremental? | Effort | Pick it when |
| :--- | :--- | :--- | :--- | :--- |
| **Managed database connector** | Yes, into streaming tables | Yes, via CDC | Low (configuration only) | The source is a supported database and you want continuous, governed replication |
| **Lakehouse Federation** | No, queries run against the source | n/a | Low | You need live queries without a copy, and the source is supported |
| **JDBC read in a notebook** | Yes, into Delta tables you control | Only if you code it (watermark + `MERGE`) | Medium (code + scheduling) | No connector exists, or you need custom extraction logic |

### Incremental JDBC pattern

A full snapshot every run gets expensive. A common incremental pattern pushes a watermark filter into the source query and merges the result:

```python
last_ts = spark.sql("SELECT coalesce(max(updated_at), '1900-01-01') AS ts FROM main.bronze.orders").first().ts

changes = (spark.read.format("jdbc")
    .option("url", jdbc_url)
    .option("query", f"SELECT * FROM public.orders WHERE updated_at > '{last_ts}'")
    .option("user", dbutils.secrets.get(scope="jdbc", key="username"))
    .option("password", dbutils.secrets.get(scope="jdbc", key="password"))
    .load())

changes.createOrReplaceTempView("changes")
spark.sql("""
  MERGE INTO main.bronze.orders AS t
  USING changes AS s ON t.order_id = s.order_id
  WHEN MATCHED THEN UPDATE SET *
  WHEN NOT MATCHED THEN INSERT *
""")
```

If the database is supported by a **managed database connector** (MySQL, PostgreSQL, SQL Server, Oracle), the connector's CDC-based ingestion is usually the better choice than this hand-written pattern. See [01-ingestion-patterns-and-lakeflow-connect.md](./01-ingestion-patterns-and-lakeflow-connect.md).

### ODBC and other drivers

The same pattern applies to ODBC clients and Python database libraries installed as notebook-scoped (`%pip install`) or environment libraries. Read in the driver, convert to a Spark DataFrame, and write to a UC table. Keep connection secrets in a secret scope.

## REST APIs from a notebook

```python
import json, requests
from datetime import datetime, timezone

token = dbutils.secrets.get(scope="vendor_api", key="token")
resp = requests.get(
    "https://api.vendor.example.com/v1/orders",
    headers={"Authorization": f"Bearer {token}"},
    params={"updated_since": dbutils.widgets.get("updated_since")},
    timeout=60,
)
resp.raise_for_status()

# Land the raw payload in a UC volume (cloud storage), one file per run
run_ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
path = f"/Volumes/main/raw/landing/vendor_orders/orders_{run_ts}.json"
with open(path, "w") as f:
    f.write(json.dumps(resp.json()["data"]))
```

Two landing choices:

| Choice | How | When |
| :--- | :--- | :--- |
| **Land in cloud storage first** (recommended for raw data) | Write JSON files to a UC volume, then ingest with Auto Loader or `COPY INTO` | Keeps an immutable raw copy for replay. Schema evolution is handled by the loader |
| **Write directly to a UC table** | `spark.createDataFrame(records).write.mode("append").saveAsTable(...)` | Small payloads where a raw copy isn't needed |

### Parameterizing the notebook

Make the extraction window a parameter rather than a hard-coded value, so the same notebook serves daily runs and backfills:

```python
dbutils.widgets.text("updated_since", "1900-01-01")   # default for interactive runs
updated_since = dbutils.widgets.get("updated_since")   # job parameter overrides it
```

In the job, set the task parameter `updated_since` to a value such as `{{job.start_time.iso_date}}`. Dynamic value references are resolved when the run starts ([dynamic value references](https://docs.databricks.com/aws/en/jobs/dynamic-value-references)).

### Scheduling with Lakeflow Jobs

Make the notebook the first task of a Lakeflow Job:

1. **Task 1 (notebook)**: call the API and land the files. Pass `updated_since` as a job parameter or a dynamic value such as `{{job.start_time.iso_date}}`
2. **Task 2 (pipeline or notebook)**: Auto Loader moves the landed files into Bronze
3. Add **retries** to Task 1 for transient HTTP errors, a **timeout** for hung calls, and a **scheduled** trigger. See [Domain 4](../04-working-with-lakeflow-jobs/README.md)

## Semi-structured and nested data

### Structs and arrays (typed schema)

When JSON is read with an inferred or explicit schema, nested objects become **structs** and lists become **arrays**:

```python
raw = spark.read.json("/Volumes/main/raw/landing/vendor_orders/")

from pyspark.sql.functions import col, explode

flat = (raw
    .select(
        col("order_id"),
        col("customer.id").alias("customer_id"),        # struct field
        col("customer.address.city").alias("city"),     # nested struct
        explode(col("line_items")).alias("item"))       # one row per array element
    .select("order_id", "customer_id", "city",
            col("item.sku").alias("sku"), col("item.qty").alias("qty")))
```

### JSON strings with the `:` path syntax

If a column holds JSON **strings**, Databricks SQL extracts fields with `<column>:<path>`:

```sql
SELECT
  raw:customer.id              AS customer_id,
  raw:line_items[0].sku        AS first_sku,     -- arrays are 0-based
  raw:total::double            AS total          -- cast with ::
FROM main.bronze.vendor_orders_raw;

-- Cast a nested fragment into a typed struct
SELECT from_json(raw:customer, 'id BIGINT, name STRING') AS customer
FROM main.bronze.vendor_orders_raw;
```

Source: [Query JSON strings](https://docs.databricks.com/aws/en/semi-structured/json).

### The `VARIANT` type

`VARIANT` stores semi-structured data in a typed binary form. It is available in Databricks Runtime 15.4 and above, and "Databricks recommends using `VARIANT` over JSON strings for semi-structured data" ([Query variant data](https://docs.databricks.com/aws/en/semi-structured/variant)).

```sql
CREATE TABLE main.bronze.events_variant AS
SELECT parse_json(raw) AS payload FROM main.bronze.vendor_orders_raw;

SELECT payload:customer.id::bigint AS customer_id,
       variant_get(payload, '$.total', 'double') AS total
FROM main.bronze.events_variant;
```

### Unstructured data

```python
# Batch: read PDFs as binary rows (path, modificationTime, length, content)
pdfs = (spark.read.format("binaryFile")
    .option("pathGlobFilter", "*.pdf")
    .load("/Volumes/main/raw/documents/contracts/"))

# Incremental: Auto Loader with the binaryFile format
docs = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "binaryFile")
    .load("/Volumes/main/raw/documents/contracts/"))
```

Images, PDFs, and audio files belong in a **UC volume**. They can be read with the `binaryFile` format, which returns the path, modification time, length, and content, or with Auto Loader (`cloudFiles.format = "binaryFile"`) for incremental loads. Managed **file source** connectors such as SharePoint and Google Drive bring documents in without custom code.

## Structured Streaming triggers (quick reference)

| Trigger | Syntax | Behaviour |
| :--- | :--- | :--- |
| Default (none set) | — | Micro-batches back to back (`processingTime` of 0), roughly 3–5 s latency |
| Fixed interval | `.trigger(processingTime="1 minute")` | A micro-batch every interval until stopped |
| Incremental batch | `.trigger(availableNow=True)` | Processes everything available in one or more micro-batches, then stops |
| Once | `.trigger(once=True)` | **Deprecated** (DBR 11.3 LTS+). Use `availableNow` |
| Continuous | `.trigger(continuous="1 second")` | **Not supported** on Databricks. Use real-time mode instead |

Every streaming write needs a **`checkpointLocation`** (unless a Lakeflow pipeline manages it), and a streaming DataFrame must be written with **`writeStream`**, not `write`. Source: [trigger intervals](https://docs.databricks.com/aws/en/structured-streaming/triggers).

## Use Cases

- **ERP without a connector**: a nightly Lakeflow Job runs a parallel JDBC read of yesterday's changes and merges them into Bronze
- **Marketing API**: a notebook pulls campaign stats from a REST API every hour, lands JSON in a volume, and Auto Loader ingests it
- **Nested order events**: Silver flattens `line_items` with `explode` so each item is a row for revenue aggregation
- **Evolving event payloads**: Bronze stores the raw event as `VARIANT`, and Silver extracts typed columns as they stabilise

## Common Issues & Errors

### JDBC Read Runs on One Core

**Scenario:** A 200-million-row JDBC read takes hours while the cluster sits idle.
**Fix:** Without `partitionColumn`, `lowerBound`, `upperBound`, and `numPartitions`, Spark reads with one thread. Add them on an indexed numeric or date column.

### Password Visible in a Notebook

**Scenario:** A reviewer finds the database password hard-coded in the JDBC options.
**Fix:** Store it in a secret scope and read it with `dbutils.secrets.get`. Secret values are redacted in notebook output.

### Exploding Drops Orders With No Item List

**Scenario:** After `explode(line_items)`, orders whose `line_items` is NULL disappear from Silver.
**Fix:** `explode` returns no rows when the collection is NULL. `explode_outer` produces a single row with NULLs instead, so the parent order is kept ([explode_outer](https://docs.databricks.com/aws/en/sql/language-manual/functions/explode_outer)).

### API Rate Limits Fail the Nightly Job

**Scenario:** The REST extraction task fails intermittently with HTTP 429 responses, and the whole job is marked failed.
**Fix:** Add task-level **retries** with a retry interval to the extraction task, and page through the API in smaller windows. Because raw files land in a volume first, a retried run re-lands only its own window. Auto Loader then picks up whichever files are new.

### Streaming DataFrame Written With `write`

**Scenario:** `df.write.saveAsTable(...)` on a `readStream` DataFrame raises an `AnalysisException`.
**Fix:** Streaming sources must be written with `writeStream` (`.toTable(...)` or `.start(...)`) and a checkpoint location.

## Exam Tips

> [!tip] Exam Tips
>
> - "Source has only a JDBC driver" → `spark.read.format("jdbc")`. If Lakehouse Federation supports the source and no copy is needed, federation is preferred
> - Credentials always come from **`dbutils.secrets.get`**
> - Slow JDBC read → add `partitionColumn` / bounds / `numPartitions`
> - REST pattern: land raw files in a **volume**, load with Auto Loader, and schedule both steps in one **Lakeflow Job**
> - `availableNow` = process all new data, then stop. `once` is deprecated. `continuous` isn't supported

## Key Takeaways

- Notebook code fills the gaps left by managed connectors: JDBC/ODBC for databases, REST for APIs
- Land raw data in UC volumes for replayability, then load it into UC tables
- Nested JSON is handled with structs and arrays, `explode`, the `:` path syntax, or `VARIANT`
- Lakeflow Jobs schedule and retry these notebooks like any other task

## Related Topics

- [Ingestion Patterns and Lakeflow Connect](./01-ingestion-patterns-and-lakeflow-connect.md)
- [COPY INTO and Auto Loader](./02-copy-into-and-auto-loader.md)
- [Advanced Transformations (arrays, structs, explode)](../03-data-transformation-and-modeling/04-advanced-transformations.md)
- [Lakeflow Jobs and Tasks](../04-working-with-lakeflow-jobs/01-lakeflow-jobs-and-tasks.md)
- [Streaming Fundamentals](../../../shared/fundamentals/streaming-fundamentals.md)

## Official Documentation

- [Query databases using JDBC](https://docs.databricks.com/aws/en/connect/external-systems/jdbc)
- [Secret management](https://docs.databricks.com/aws/en/security/secrets/)
- [Query JSON strings](https://docs.databricks.com/aws/en/semi-structured/json)
- [Query variant data](https://docs.databricks.com/aws/en/semi-structured/variant)
- [Configure Structured Streaming trigger intervals](https://docs.databricks.com/aws/en/structured-streaming/triggers)

---

**[← Previous: COPY INTO and Auto Loader](./02-copy-into-and-auto-loader.md) | [↑ Back to Data Ingestion and Loading](./README.md)**

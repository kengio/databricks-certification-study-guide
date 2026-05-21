---
title: COPY INTO
type: study-material
tags:
  - data-engineer-professional
  - ingestion
  - copy-into
  - batch
status: published
---

# COPY INTO

## Overview

`COPY INTO` is the SQL command for **idempotent batch ingestion** from cloud object storage into a Delta table. It tracks every file it has ever loaded into the target table's history, so re-running with the same source path is a no-op for already-processed files. It complements **Auto Loader** (continuous / streaming) and the **UI uploader** (one-off small files) by filling the "scheduled batch ingest of a few-to-many files" slot.

> [!abstract]
>
> - **Idempotent**: each file is loaded at most once, tracked in the target table's `_change_data` / commit log
> - **Schema-flexible**: `FORMAT_OPTIONS('inferSchema'='true')` infers; `mergeSchema='true'` evolves; declared target schema validates
> - **Supports CSV / JSON / Parquet / Avro / ORC / TEXT / BINARYFILE**
> - **Pattern-based**: `FILES` (explicit list) or `PATTERN` (glob/regex) restricts what's loaded
> - **Force reload** with `COPY_OPTIONS('force'='true')` re-loads everything (use with care — duplicates if MERGE is not used)

> [!tip] What the Exam Tests
>
> - `COPY INTO` vs Auto Loader: when to pick which (scheduled batch vs continuous incremental)
> - The idempotency guarantee — re-running is safe by default
> - How `FORMAT_OPTIONS` (parsing) differs from `COPY_OPTIONS` (load behaviour)
> - That `PATTERN` and `FILES` let you control what gets ingested without changing the source path
> - That `COPY INTO` reads from object storage paths (s3://, abfss://, gs://) or UC volumes — not from Delta tables

---

## Anatomy of a `COPY INTO` statement

```sql
COPY INTO main.bronze.orders
FROM '/Volumes/main/landing/orders/'
FILEFORMAT = JSON
FORMAT_OPTIONS (
  'inferSchema' = 'true',
  'mergeSchema' = 'true'
)
COPY_OPTIONS (
  'mergeSchema' = 'true'
);
```

| Clause | Purpose |
| :--- | :--- |
| `FROM <path>` | Cloud-storage path or UC volume path |
| `FILEFORMAT` | One of `CSV`, `JSON`, `PARQUET`, `AVRO`, `ORC`, `TEXT`, `BINARYFILE` |
| `FORMAT_OPTIONS` | Parser options — `inferSchema`, `header`, `delimiter`, `dateFormat`, etc. |
| `COPY_OPTIONS` | Load behaviour — `mergeSchema`, `force`, `validate` |
| `FILES` (optional) | Explicit comma-separated file names to load (subset of the path) |
| `PATTERN` (optional) | Glob / regex on file names (e.g., `*.json`, `orders_2026*.parquet`) |

## Idempotency in practice

```sql
-- First run: loads 100 files
COPY INTO main.bronze.orders
FROM '/Volumes/main/landing/orders/'
FILEFORMAT = JSON;
-- Result: 100 files loaded

-- 5 minutes later, 3 new files arrive. Re-run:
COPY INTO main.bronze.orders
FROM '/Volumes/main/landing/orders/'
FILEFORMAT = JSON;
-- Result: 3 new files loaded; 100 originals skipped automatically
```

Databricks tracks the files-already-loaded set in the target table's commit log. You don't need an external watermark or processed-files table.

## When to use `COPY INTO` vs Auto Loader

| Scenario | Pick |
| :--- | :--- |
| One-time bulk load of historical data | `COPY INTO` (simpler, no streaming infra) |
| Scheduled daily / hourly batch from a known prefix | `COPY INTO` from a Lakeflow Job |
| Continuous low-latency ingest as files land | **Auto Loader** with `cloudFiles` streaming source |
| Millions of small files arriving every minute | **Auto Loader** in file-notification mode |
| Ad-hoc one-off CSV from a colleague | UI uploader (smaller blast radius than SQL) |

## Use Cases

- **Bronze ingestion in a medallion pipeline** — `COPY INTO` from raw-zone object storage to a Bronze Delta table
- **Reprocessing a specific date partition** — combine `PATTERN` with `force = true` to reload a known set
- **Validation before commit** — `COPY_OPTIONS('validate'='true')` parses files without writing, surfacing schema or format errors
- **Multi-cloud landing zones** — point at any S3 / ADLS / GCS path; UC connections supply credentials

## Common Issues & Errors

- **Schema mismatch without `mergeSchema`** — `COPY INTO` defaults to schema validation; new columns in source cause errors unless `mergeSchema = true`
- **`force = true` creates duplicates** — when re-loading processed files, all rows are appended again unless the target uses a MERGE step downstream
- **DBFS mount paths are deprecated** — use UC volume paths (`/Volumes/...`) for new pipelines
- **`COPY INTO` reading Delta** — not supported; `COPY INTO` reads *files*, not other Delta tables. For Delta-to-Delta, use `INSERT INTO ... SELECT FROM`
- **`PATTERN` matches against full path, not just basename** — be explicit, e.g., `PATTERN = '*.parquet'` matches files anywhere under the source path

## Exam Tips

> [!tip]
>
> - **Idempotent by default.** Re-running the same statement is safe.
> - `FORMAT_OPTIONS` is **parsing**; `COPY_OPTIONS` is **load behaviour**. Don't confuse them.
> - Reads **files**, not Delta tables. For Delta sources use SQL `INSERT INTO ... SELECT`.
> - Prefer **UC volume paths** over DBFS mounts in new pipelines.
> - `force = true` bypasses the de-duplication tracking — use only when you genuinely want to re-load everything.

## Key Takeaways

- `COPY INTO` = idempotent batch ingest from object storage to a Delta table
- Tracks loaded files in the target table's commit log automatically
- Pair with Lakeflow Jobs for scheduled batch ingest; pair with Auto Loader for streaming
- `FORMAT_OPTIONS` (parser) vs `COPY_OPTIONS` (behaviour) — know the difference

## Related Topics

- [Auto Loader](./01-auto-loader.md) — the streaming-style sibling
- [Streaming Ingestion from Message Buses](./03-streaming-ingestion-from-message-buses.md) — for non-file sources
- [Lakeflow Jobs](../01-developing-code-for-data-processing/07-lakeflow-jobs-part1.md) — scheduling the batch load

## Official Documentation

- [`COPY INTO` SQL reference](https://docs.databricks.com/en/sql/language-manual/delta-copy-into.html)
- [`COPY INTO` patterns and examples](https://docs.databricks.com/en/ingestion/copy-into/examples.html)
- [Unity Catalog volumes](https://docs.databricks.com/en/connect/unity-catalog/volumes.html)

---

**[← Previous: Auto Loader](./01-auto-loader.md) | [↑ Back to Data Ingestion & Acquisition](./README.md) | [Next: Streaming Ingestion from Message Buses →](./03-streaming-ingestion-from-message-buses.md)**

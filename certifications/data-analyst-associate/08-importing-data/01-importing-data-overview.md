---
title: Importing Data Overview
type: study-material
tags:
  - data-analyst-associate
  - import
  - copy-into
status: published
---

# Importing Data Overview

## Overview

Analysts have three main paths for getting data into a Unity Catalog table: the **UI file-upload wizard** (one-off small files), **`COPY INTO`** (repeatable bulk loads), and **read-only federation** for querying external sources without copying. Continuous ingestion (Auto Loader, Lakeflow Pipelines) sits beyond the analyst exam scope but is good vocabulary to recognise.

> [!abstract]
>
> - **UI upload** — fastest path; CSV / TSV / JSON / Parquet / Avro / text; creates a managed Delta table (Delta is the *output* format, not an input the uploader accepts)
> - **`COPY INTO`** — idempotent SQL command for bulk loads; skips already-processed files
> - **Lakehouse Federation** — query external sources (Snowflake, BigQuery, …) without copying data
> - **Auto Loader / Lakeflow Declarative Pipelines** — continuous ingestion; recognise the name, depth covered in DE Pro

> [!tip] What the Exam Tests
>
> - Which path fits which scenario (one-off vs repeatable vs continuous vs federated)
> - That `COPY INTO` is idempotent and tracks processed files
> - That federation is read-mostly — not a write path
> - The supported formats in the UI uploader

---

## Path 1 — UI file upload

**When**: one-off small file, fast prototype, ad-hoc analysis.

In the workspace: **+ New** → **Add or upload data** → drag the file. The wizard:

- Infers schema (you can override types)
- Creates a managed Delta table in a UC catalog/schema you pick
- Shows a preview before committing

Limits: the UI uploader supports up to **10 files at a time** and **2 GB total** per upload. For larger loads, use `COPY INTO` or a notebook-driven ingest.

## Path 2 — `COPY INTO` (idempotent bulk load)

**When**: repeatable batch load from object storage; you want re-runs to skip already-loaded files automatically.

```sql
COPY INTO main.bronze.orders
FROM '/Volumes/main/landing/orders/'
FILEFORMAT = JSON
FORMAT_OPTIONS ('inferSchema' = 'true')
COPY_OPTIONS ('mergeSchema' = 'true');
```

Idempotency: `COPY INTO` records which files have been ingested in the target table's history. Re-running with the same `FROM` clause is a no-op for files already loaded.

> [!note]
> The example uses a **UC volume path** (`/Volumes/main/landing/orders/`) — the modern, governed location for non-tabular files. Legacy **DBFS paths** (`/mnt/...`) still work but are deprecated for new ingestion paths. Prefer UC volumes.

## Path 3 — Lakehouse Federation (no copy)

**When**: you want to query an external database (Snowflake, BigQuery, PostgreSQL, …) without ETL'ing the data into Delta first.

For depth, see the DE Pro [Lakehouse Federation](../../data-engineer-professional/10-data-sharing-and-federation/02-lakehouse-federation.md) topic. For the analyst exam, just recognise:

- Federation = read-mostly query path
- Credentials live in a UC `CREATE CONNECTION` securable
- Queries through a foreign catalog look like queries against any UC catalog

## Path 4 — Continuous ingestion (out of analyst scope)

Names to recognise:

- **Auto Loader** (`cloudFiles`) — incremental file ingestion from cloud object stores
- **Lakeflow Declarative Pipelines** — declarative ETL framework (formerly Delta Live Tables)

If a question asks "which Databricks tool would a data engineer use to continuously ingest new files as they land," the answer is **Auto Loader** (inside a streaming job or a Lakeflow Declarative Pipeline).

## Use Cases

| Scenario | Best path |
| :--- | :--- |
| One-off CSV from a colleague | UI upload |
| Daily file drop in cloud storage | `COPY INTO` (scheduled job) |
| Live external database we don't own | Lakehouse Federation |
| Files landing every few minutes | Auto Loader (engineer's job) |
| Streaming change feed from a source | Lakeflow Declarative Pipelines (engineer's job) |

## Common Issues & Errors

- **Schema mismatch on `COPY INTO`** — use `mergeSchema = true` to evolve, or pre-declare the target schema
- **UI upload truncating large files** — the uploader fails silently above its size limit; use `COPY INTO` instead
- **Federation push-down disabled** — a function the source doesn't support forces a pull; check the query profile

## Exam Tips

> [!tip]
>
> - **`COPY INTO` is idempotent.** This is the #1 testable property — re-running is safe.
> - Federation is **read-mostly**; if a question asks about writing back, federation is probably wrong.
> - **Auto Loader and Lakeflow Pipelines** are engineer-scope; recognise them but don't expect deep questions on the analyst exam.

## Key Takeaways

- 4 ingestion paths: UI upload, `COPY INTO`, federation, continuous (engineer-scope)
- `COPY INTO` = idempotent bulk load
- Federation = read-mostly, no ETL
- Recognise Auto Loader and Lakeflow Pipelines without deep-diving

## Related Topics

- [Managing Data](../06-managing-data/01-tables-schemas.md)
- [Lakehouse Federation (DE Pro)](../../data-engineer-professional/10-data-sharing-and-federation/02-lakehouse-federation.md)

## Official Documentation

- [`COPY INTO` SQL reference](https://docs.databricks.com/en/sql/language-manual/delta-copy-into.html)
- [Upload data to Databricks](https://docs.databricks.com/en/ingestion/add-data/index.html)
- [Lakehouse Federation overview](https://docs.databricks.com/en/query-federation/index.html)

---

**[↑ Back to Importing Data](./README.md)**

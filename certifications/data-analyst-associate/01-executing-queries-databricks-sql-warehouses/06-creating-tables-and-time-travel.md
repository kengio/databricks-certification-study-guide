---
title: Creating Tables & Delta Time Travel
type: study-material
tags:
  - data-analyst-associate
  - managed-tables
  - external-tables
  - ctas
  - read-files
  - time-travel
---

# Creating Tables & Delta Time Travel

## Overview

Section 4 of the October 2025 exam guide asks you to "create managed tables and external tables, including creating tables by joining data from multiple sources (e.g., CSV, Parquet, Delta tables)" and to "use Delta Lake's time travel to access and query historical data versions". This file covers the SQL for both. Managed vs external semantics are explained in [Tables & Schemas](../06-managing-data/01-tables-schemas.md).

> [!abstract]
>
> - Managed tables (Unity Catalog owns the storage) vs external tables (a `LOCATION` you manage)
> - `CREATE TABLE ... AS SELECT` with `read_files` to combine CSV, Parquet, and Delta sources
> - `CREATE OR REPLACE TABLE` keeps history and grants; `IF NOT EXISTS` does nothing if the table exists
> - Time travel with `VERSION AS OF` / `TIMESTAMP AS OF`, limited by `VACUUM`

> [!tip] What the Exam Tests
>
> - Choosing between `CREATE OR REPLACE`, `IF NOT EXISTS`, and `DROP` + `CREATE`
> - Building one table from files and existing Delta tables in a single statement
> - Why time travel to an old version can fail

---

## Managed and External Tables

```sql
-- Managed: Unity Catalog chooses and manages the storage location
CREATE TABLE main.sales.customers (
  customer_id BIGINT,
  name        STRING,
  region      STRING
);

-- External: data lives at a path covered by an external location you manage
CREATE TABLE main.sales.customers_ext (
  customer_id BIGINT,
  name        STRING
)
LOCATION 's3://acme-data/customers/';
```

| | Managed table | External table |
| :--- | :--- | :--- |
| Storage | Managed by Unity Catalog | A path you specify with `LOCATION` |
| `DROP TABLE` | Deletes metadata and data | Deletes metadata only; files stay |
| Typical use | Default for new tables | Data that other systems also read or write |

## Creating a Table from Several Sources

`read_files` reads files in cloud storage or volumes as a table. It supports JSON, CSV, XML, TEXT, BINARYFILE, PARQUET, AVRO, and ORC, and infers a schema when you do not supply one. Inside `CREATE TABLE ... AS SELECT` (CTAS), you can join file sources with existing Delta tables:

```sql
CREATE OR REPLACE TABLE main.sales.customer_orders AS
SELECT c.customer_id,
       c.name,
       p.category,
       o.order_id,
       o.amount
FROM read_files('/Volumes/main/raw/customers/', format => 'csv') AS c
JOIN main.sales.orders AS o                                  -- existing Delta table
  ON o.customer_id = c.customer_id
JOIN read_files('/Volumes/main/raw/products/', format => 'parquet') AS p
  ON p.product_id = o.product_id;
```

The result is a new managed Delta table. To keep it current as new files arrive, use a streaming table instead — see [Materialized Views & Streaming Tables](./07-materialized-views-and-streaming-tables.md).

## Replacing a Table Safely

| Statement | If the table exists |
| :--- | :--- |
| `CREATE TABLE t (...)` | Error |
| `CREATE TABLE IF NOT EXISTS t (...)` | Statement is ignored |
| `CREATE OR REPLACE TABLE t (...)` | Table is replaced; **history, granted privileges, row filters, and column masks are kept** |
| `DROP TABLE t; CREATE TABLE t (...)` | History and grants are lost |

`CREATE OR REPLACE TABLE ... IF NOT EXISTS` is not allowed. Databricks strongly recommends `REPLACE` over dropping and re-creating a table.

## Time Travel

Every write to a Delta table creates a new version. Find versions with `DESCRIBE HISTORY`, then query one:

```sql
DESCRIBE HISTORY main.sales.orders;            -- version, timestamp, user, operation, ...

SELECT * FROM main.sales.orders VERSION AS OF 12;
SELECT * FROM main.sales.orders TIMESTAMP AS OF '2026-10-25';
SELECT * FROM main.sales.orders@v12;           -- shorthand for a version

RESTORE TABLE main.sales.orders TO VERSION AS OF 12;   -- needs MODIFY
```

### How far back can you go?

| Setting | Default | Controls |
| :--- | :--- | :--- |
| `delta.logRetentionDuration` | 30 days | How long table history is kept |
| `delta.deletedFileRetentionDuration` | 7 days | How old unreferenced files must be before `VACUUM` deletes them |

After `VACUUM` deletes the data files an old version needs, you can no longer query or restore that version, even if `DESCRIBE HISTORY` still lists it.

## Use Cases

- **Unified reporting table**: Joining CSV extracts, Parquet exports, and a Delta orders table into one managed table for a dashboard.
- **Rebuilding a table**: Changing a table's definition with `CREATE OR REPLACE` without breaking users' grants.
- **Point-in-time reporting**: Reproducing last month's numbers with `TIMESTAMP AS OF`.

## Common Issues & Errors

### Time travel fails for an old version

**Scenario:** `VERSION AS OF` fails for a version that `DESCRIBE HISTORY` still shows.
**Fix:** `VACUUM` removed the data files. Keep versions longer by raising `delta.deletedFileRetentionDuration` (and `logRetentionDuration`) before the files are vacuumed.

### Users lose access after a rebuild

**Scenario:** After `DROP TABLE` and `CREATE TABLE`, analysts get permission errors.
**Fix:** Use `CREATE OR REPLACE TABLE`, which keeps granted privileges.

## Exam Tips

- `CREATE OR REPLACE` keeps history and grants; `DROP` + `CREATE` loses them
- `read_files(path, format => 'csv')` turns files into a table inside a query
- Default retention: 30 days of history, 7 days before `VACUUM` can delete old files

## Key Takeaways

- **Managed vs external**: drop deletes data only for managed tables
- **CTAS + read_files**: one statement can join files and Delta tables
- **Time travel**: `VERSION AS OF`, `TIMESTAMP AS OF`, `@v` syntax, `RESTORE`
- **VACUUM**: the usual reason old versions become unreadable

## Related Topics

- [Tables & Schemas](../06-managing-data/01-tables-schemas.md) - Managed vs external tables in depth
- [Delta History & Liquid Clustering](../03-analyzing-queries/02-delta-history-and-liquid-clustering.md) - Auditing and comparing versions
- [Importing Data](../08-importing-data/01-importing-data-overview.md) - Loading files with the UI, `COPY INTO`, and Auto Loader

## Official Documentation

- [CREATE TABLE \[USING\]](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-create-table-using)
- [read_files table-valued function](https://docs.databricks.com/aws/en/sql/language-manual/functions/read_files)
- [Work with table history](https://docs.databricks.com/aws/en/delta/history)

---

**[← Previous: Window Functions & Analytics](./05-window-functions.md) | [↑ Back to Section](./README.md) | [Next: Materialized Views & Streaming Tables →](./07-materialized-views-and-streaming-tables.md)**

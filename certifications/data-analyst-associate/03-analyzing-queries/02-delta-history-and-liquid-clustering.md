---
title: Delta History & Liquid Clustering
type: study-material
tags:
  - data-analyst-associate
  - delta-lake
  - describe-history
  - time-travel
  - liquid-clustering
---

# Delta History & Liquid Clustering

## Overview

Section 5 of the October 2025 exam guide asks you to "utilize Delta Lake to audit and view history, validate results, and compare historical results or trends" and to "apply Liquid Clustering to improve query speed when filtering large tables on specific columns". Both rely on Delta Lake: its transaction log records every change, and its data layout decides how many files a filter must read.

> [!abstract]
>
> - `DESCRIBE HISTORY` shows each write: operation, user, timestamp, parameters, metrics
> - Time travel reads old versions to validate a load or compare results over time
> - **Liquid clustering** (`CLUSTER BY`) replaces partitioning and `ZORDER` for new tables
> - `OPTIMIZE` clusters data incrementally; `CLUSTER BY AUTO` lets Databricks pick keys

> [!tip] What the Exam Tests
>
> - Answering "who changed this table, and when?"
> - Comparing two versions with time travel and `EXCEPT`
> - Choosing liquid clustering keys and knowing what happens when you change them

---

## Auditing with DESCRIBE HISTORY

```sql
DESCRIBE HISTORY main.sales.orders;          -- full history, newest first
DESCRIBE HISTORY main.sales.orders LIMIT 1;  -- last operation only
```

Each row describes one write: the version, timestamp, user, operation (`WRITE`, `MERGE`, `DELETE`, `OPTIMIZE`, ...), `operationParameters` (such as the predicate of a `DELETE`), and `operationMetrics` (such as the number of rows deleted or files written). History is kept for 30 days by default (`delta.logRetentionDuration`).

## Validating and Comparing Results

```sql
-- Rows in version 12 that were not in version 10 (validate a load)
SELECT * FROM main.sales.orders VERSION AS OF 12
EXCEPT
SELECT * FROM main.sales.orders VERSION AS OF 10;

-- New customers in the last 7 days (trend from two points in time)
SELECT
  (SELECT COUNT(DISTINCT customer_id) FROM main.sales.orders)
  - (SELECT COUNT(DISTINCT customer_id)
     FROM main.sales.orders TIMESTAMP AS OF date_sub(current_date(), 7))
  AS new_customers_last_7_days;

-- Undo a bad load (needs MODIFY)
RESTORE TABLE main.sales.orders TO VERSION AS OF 10;
```

Old versions are readable only while their data files exist; `VACUUM` deletes unreferenced files older than 7 days by default. Syntax details are in [Creating Tables & Delta Time Travel](../01-executing-queries-databricks-sql-warehouses/06-creating-tables-and-time-travel.md).

## Liquid Clustering

Liquid clustering organises data files by the clustering keys so that filters on those keys skip most files. It **replaces table partitioning and `ZORDER`**, and Databricks recommends it **for all new tables**, including streaming tables and materialized views.

```sql
-- New table
CREATE TABLE main.sales.events (
  event_id   BIGINT,
  event_date DATE,
  country    STRING,
  amount     DOUBLE
) CLUSTER BY (event_date, country);

-- Existing table: change keys without rewriting existing data
ALTER TABLE main.sales.events CLUSTER BY (country);

-- Cluster new and changed data (incremental)
OPTIMIZE main.sales.events;

-- Recluster everything (Databricks Runtime 16.4 LTS and above)
OPTIMIZE main.sales.events FULL;

-- Let Databricks choose keys (Unity Catalog managed tables + predictive optimization)
ALTER TABLE main.sales.events CLUSTER BY AUTO;
```

| Rule | Detail |
| :--- | :--- |
| Choosing keys | Columns most often used in query filters |
| Number of keys | Up to four |
| Compatibility | Not compatible with partitioning or `ZORDER` on the same table |
| Clustering runs | When you run `OPTIMIZE`, or automatically through predictive optimization |
| Changing keys | Allowed at any time; existing data is not rewritten until clustered |

> [!note] Platform update (Oct 2026)
> Converting a partitioned table to liquid clustering became generally available on June 12, 2026 (`REPLACE PARTITIONED BY WITH CLUSTER BY`, Databricks Runtime 18.1 and above) — [release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/june).

## Use Cases

- **Audit**: Finding which job deleted rows overnight with `DESCRIBE HISTORY`.
- **Validation**: Comparing yesterday's and today's versions after a load.
- **Speed**: Clustering a large event table on the date and country columns that dashboards filter on.

## Common Issues & Errors

### Partitioned table cannot be clustered

**Scenario:** `ALTER TABLE ... CLUSTER BY` fails on a partitioned table.
**Fix:** Liquid clustering is not compatible with partitioning. Convert the table (see the note above) or recreate it with `CLUSTER BY`.

### New keys don't seem to help

**Scenario:** After changing clustering keys, queries are no faster.
**Fix:** Existing data is not rewritten by the `ALTER`. Run `OPTIMIZE` (or `OPTIMIZE ... FULL`), or let predictive optimization do it.

## Exam Tips

- `DESCRIBE HISTORY` = who, what, when, with metrics
- Time travel + `EXCEPT` compares two versions
- Liquid clustering: `CLUSTER BY`, up to four keys from common filter columns, recommended for all new tables
- `CLUSTER BY AUTO` needs predictive optimization

## Key Takeaways

- **History** supports auditing, validation, and rollback (`RESTORE`)
- **Liquid clustering** replaces partitioning and `ZORDER`
- **OPTIMIZE** applies clustering incrementally

## Related Topics

- [Photon & Query Performance](./01-photon-and-query-performance.md)
- [Creating Tables & Delta Time Travel](../01-executing-queries-databricks-sql-warehouses/06-creating-tables-and-time-travel.md)
- [Delta Lake Commands Cheat Sheet](../../../shared/cheat-sheets/delta-lake-commands.md)

## Official Documentation

- [Work with table history](https://docs.databricks.com/aws/en/delta/history)
- [Use liquid clustering for tables](https://docs.databricks.com/aws/en/delta/clustering)

---

**[← Previous: Photon & Query Performance](./01-photon-and-query-performance.md) | [↑ Back to Section](./README.md) | [Next: Fixing Queries →](./03-fixing-queries.md)**

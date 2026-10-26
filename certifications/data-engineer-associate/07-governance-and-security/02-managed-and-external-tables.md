---
title: Managed and External Tables
type: study-material
tags:
  - data-engineer-associate
  - unity-catalog
  - managed-tables
  - external-tables
  - governance
status: published
---

# Managed and External Tables

## Overview

Unity Catalog has two table types with very different lifecycles. With a **managed** table, Unity Catalog owns the data's storage, layout, and optimization. With an **external** table, Unity Catalog governs the metadata while the data files stay at a path you control. The exam guide expects you to tell them apart and to **create, modify, delete, and convert between** them, including the newer `SET MANAGED` and `UNSET MANAGED` commands.

> [!abstract]
>
> - **Managed** (default, recommended): created with no `LOCATION`. Data lives in the schema's or catalog's managed storage. Eligible for predictive optimization and automatic liquid clustering
> - **External**: created with `LOCATION` on a path covered by a UC **external location**. `DROP TABLE` removes metadata only, and the files remain
> - Dropped managed tables can be recovered with **`UNDROP TABLE` for 7 days** by default, and the data files are deleted after that
> - Convert external → managed with **`ALTER TABLE ... SET MANAGED`** (DBR 17.3 LTS+ or serverless). Roll back within **14 days** with **`ALTER TABLE ... UNSET MANAGED`**

> [!tip] What the Exam Tests
>
> - Exam guide skill: differentiate managed and external tables in Unity Catalog and perform basic operations (create, modify, delete, and convert between them)
> - What `DROP TABLE` does to the data for each type
> - Privileges needed to create external tables (`CREATE EXTERNAL TABLE` on the external location)
> - Conversion and rollback commands, their windows, and their side effects (streams restart, time travel by version only)

---

## Side-by-Side

| | Managed table | External table |
| :--- | :--- | :--- |
| Create | `CREATE TABLE c.s.t (...)` (no `LOCATION`) | `CREATE TABLE c.s.t (...) LOCATION 's3://...'` |
| Data location | Managed storage of the containing schema or catalog | A path you choose, under a UC external location |
| Formats | Delta (default) or Iceberg (`USING iceberg`) | DELTA, CSV, JSON, AVRO, PARQUET, ORC, TEXT |
| Who manages layout and optimization | Unity Catalog (predictive optimization, automatic liquid clustering) | You |
| `DROP TABLE` | Metadata removed. Data recoverable with `UNDROP` for 7 days (configurable 0 h or 7–30 days), then deleted | **Metadata only**. "Unity Catalog does not delete the underlying data in cloud storage" |
| Databricks recommendation | **Default, recommended** for most cases | Existing data that isn't compatible with managed tables, or external clients needing direct file access |

Sources: [Unity Catalog managed tables](https://docs.databricks.com/aws/en/tables/managed), [Work with external tables](https://docs.databricks.com/aws/en/tables/external).

## Create

```sql
-- Managed (Delta by default)
CREATE TABLE main.silver.customers (
  customer_id BIGINT NOT NULL,
  email STRING,
  country STRING
);

-- Managed from a query
CREATE TABLE main.gold.revenue AS
SELECT region, SUM(amount) AS revenue FROM main.silver.orders GROUP BY region;

-- External: data stays at a governed cloud path
CREATE TABLE main.bronze.vendor_feed (
  id BIGINT, payload STRING
)
LOCATION 's3://acme-landing/vendor_feed/';
```

```python
# External table from a DataFrame write (path option)
(df.write
   .option("path", "s3://acme-landing/vendor_feed/")
   .saveAsTable("main.bronze.vendor_feed"))
```

**Privileges for an external table**: `CREATE EXTERNAL TABLE` on an external location that covers the path, plus `USE CATALOG`, `USE SCHEMA`, and `CREATE TABLE` on the parents. Managed tables need `USE CATALOG`, `USE SCHEMA`, and `CREATE TABLE`.

## Modify

```sql
ALTER TABLE main.silver.customers ADD COLUMN signup_date DATE;
ALTER TABLE main.silver.customers RENAME COLUMN email TO email_address;    -- may require column mapping
ALTER TABLE main.silver.customers SET TBLPROPERTIES ('contains_pii' = 'true');
ALTER TABLE main.silver.customers OWNER TO `data-platform-admins`;
COMMENT ON TABLE main.silver.customers IS 'Deduplicated customer master';

-- External tables: if metadata changed outside Unity Catalog, resync it
MSCK REPAIR TABLE main.bronze.vendor_feed SYNC METADATA;
```

## Delete and Recover

```sql
DROP TABLE main.silver.customers;            -- managed: recoverable for the recovery period
UNDROP TABLE main.silver.customers;          -- within 7 days by default

DROP TABLE main.bronze.vendor_feed;          -- external: files remain at the LOCATION
-- To remove the data too, delete the files in cloud storage yourself
```

Dropping requires ownership or `MANAGE` on the table. The recovery period for managed tables can be set per catalog or schema (Public Preview): 0 hours (no recovery) or 7–30 days ([June 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/june)).

## Convert External → Managed (`SET MANAGED`)

```sql
ALTER TABLE main.bronze.vendor_feed SET MANAGED;

-- If the external table has Iceberg reads (UniForm) enabled:
ALTER TABLE main.bronze.vendor_feed SET MANAGED TRUNCATE UNIFORM HISTORY;
```

| Aspect | What the docs say |
| :--- | :--- |
| **Requirements** | Databricks Runtime **17.3 LTS+ or serverless**. The table must be Delta, and you must **own** it. Readers and writers should be on DBR 15.4 LTS+ |
| **What's kept** | Name, settings, permissions, views, and table history |
| **How it works** | Step 1 copies data and the transaction log to managed storage, with no downtime. Step 2 moves over commits made during the copy and updates the metadata. Writers are blocked briefly (about 1–5 minutes, depending on size) |
| **Streams** | Existing read and write streams **fail** after conversion. Restart them with the same configuration |
| **Time travel** | On DBR 15.3 or below, after conversion you can time travel **by version only**, not by timestamp |
| **Before you start** | Cancel running `OPTIMIZE` jobs and don't schedule new ones during conversion |

## Roll Back Managed → External (`UNSET MANAGED`)

```sql
ALTER TABLE main.bronze.vendor_feed UNSET MANAGED;
```

- Available **within 14 days** of the conversion. Databricks keeps the source data for 14 days to allow rollback
- It "updates the table metadata to point back to the original external location", and writes made to the managed location after conversion are preserved
- Commits made between conversion and rollback support time travel **by version but not by timestamp**
- **Seven days after rollback**, Databricks automatically deletes the data in the managed location
- Restart streams after a rollback too. Confirm the result by checking that the table type is `EXTERNAL`

Source: [Convert external or foreign tables to managed tables](https://docs.databricks.com/aws/en/tables/convert-external-managed).

> [!warning] Common Mistake
> `RESTORE TABLE ... VERSION AS OF` restores **data versions**. It doesn't change the table **type**. To undo a `SET MANAGED`, use `UNSET MANAGED` within the 14-day window. Dropping and recreating the table isn't required.

## Use Cases

- **Greenfield Silver and Gold**: create managed tables to get predictive optimization and automatic clustering
- **Existing data lake folders**: register as external tables first, then `SET MANAGED` once nothing writes to the path directly
- **Accidental drop**: `UNDROP TABLE` restores a managed table within the recovery period
- **Data that external engines write directly**: keep it external, because direct path writes bypass UC governance

## Common Issues & Errors

### Data Still There After DROP

**Scenario:** After `DROP TABLE`, the files still exist in S3.
**Fix:** The table was external, so `DROP` removed only metadata. Delete the files yourself if they should be removed.

### Data Gone After DROP

**Scenario:** A managed table was dropped by mistake.
**Fix:** Run `UNDROP TABLE` within the recovery period (7 days by default). After that, the data files are deleted.

### `CREATE TABLE ... LOCATION` Permission Denied

**Scenario:** An engineer can create managed tables but gets a permission error with `LOCATION`.
**Fix:** External tables need `CREATE EXTERNAL TABLE` on an external location that covers the path.

### Streams Fail Right After Conversion

**Scenario:** After `SET MANAGED`, a streaming job reading the table errors.
**Fix:** Expected behaviour. Restart the streams with the same configuration.

## Exam Tips

> [!tip] Exam Tips
>
> - **Managed** = UC owns the data. `DROP` deletes it after the `UNDROP` window. **External** = `DROP` removes metadata only
> - Managed tables are the **default and recommended** type, and the only type predictive optimization runs on
> - External → managed: `ALTER TABLE ... SET MANAGED`. Undo: `ALTER TABLE ... UNSET MANAGED` **within 14 days**
> - `RESTORE` restores data versions. It doesn't revert a type conversion
> - External tables need `CREATE EXTERNAL TABLE` on an **external location**

## Key Takeaways

- The two table types differ in who owns storage, layout, and the data lifecycle
- `UNDROP` recovers dropped managed tables within the recovery period
- `SET MANAGED` / `UNSET MANAGED` convert in either direction, with documented windows and side effects
- Prefer managed tables. Keep external tables for data that must stay at a path other engines write to

## Related Topics

- [Unity Catalog Basics](./01-unity-catalog-basics.md)
- [Access Control and Permissions](./03-access-control-permissions.md)
- [Liquid Clustering and Predictive Optimization](../06-troubleshooting-monitoring-and-optimization/04-liquid-clustering-and-predictive-optimization.md)
- [Delta Lake Fundamentals](../01-databricks-intelligence-platform/04-delta-lake-fundamentals.md)

## Official Documentation

- [Unity Catalog managed tables](https://docs.databricks.com/aws/en/tables/managed)
- [Work with external tables](https://docs.databricks.com/aws/en/tables/external)
- [Convert external or foreign tables to managed tables](https://docs.databricks.com/aws/en/tables/convert-external-managed)

---

**[← Previous: Unity Catalog Basics](./01-unity-catalog-basics.md) | [↑ Back to Governance and Security](./README.md) | [Next: Access Control and Permissions →](./03-access-control-permissions.md)**

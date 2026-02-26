---
tags: [cheat-sheet, delta-lake, data-engineer-professional]
---

# Delta Lake Quick Reference

## MERGE (Upsert)

```sql
-- Basic upsert
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;

-- Conditional update
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED AND s.updated_at > t.updated_at
  THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;

-- With delete
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED AND s.is_deleted = true THEN DELETE
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

```python
# PySpark MERGE

from delta.tables import DeltaTable

target = DeltaTable.forName(spark, "catalog.schema.target")

target.alias("t").merge(
    source.alias("s"),
    "t.id = s.id"
).whenMatchedUpdateAll(
).whenNotMatchedInsertAll(
).execute()
```

## OPTIMIZE

```sql
-- Basic optimize (bin-packing)
OPTIMIZE catalog.schema.table;

-- Optimize with Z-ORDER
OPTIMIZE catalog.schema.table
ZORDER BY (column1, column2);

-- Optimize specific partitions
OPTIMIZE catalog.schema.table
WHERE date = '2024-01-15';
```

| Setting | Default | Description |
|---------|---------|-------------|
| Target file size | 1 GB | Optimal file size for queries |
| Auto optimize | Enabled (managed tables) | Automatic compaction |
| Auto compact | After write | Triggers when small files accumulate |

## VACUUM

```sql
-- Vacuum with default retention (7 days)
VACUUM catalog.schema.table;

-- Vacuum with specific retention
VACUUM catalog.schema.table RETAIN 168 HOURS;

-- Dry run (show files to delete)
VACUUM catalog.schema.table DRY RUN;
```

| Parameter | Default | Notes |
|-----------|---------|-------|
| Minimum retention | 168 hours (7 days) | Cannot go below unless safety disabled |
| Safety check | Enabled | `spark.databricks.delta.retentionDurationCheck.enabled` |

**Warning**: VACUUM removes ability to time travel beyond retention period.

## Z-ORDER vs Liquid Clustering

| Feature | Z-ORDER | Liquid Clustering |
|---------|---------|-------------------|
| Syntax | `OPTIMIZE ... ZORDER BY` | `CLUSTER BY` in table definition |
| Automatic | No (manual) | Yes (incremental) |
| Column limit | ~4 columns | ~4 columns |
| When to use | Existing tables | New tables (recommended) |
| Rewrite | Full table | Incremental |

```sql
-- Z-ORDER (existing tables)
OPTIMIZE my_table ZORDER BY (country, city);

-- Liquid Clustering (new tables)
CREATE TABLE my_table (
  id INT,
  country STRING,
  city STRING
) CLUSTER BY (country, city);

-- Change clustering columns
ALTER TABLE my_table CLUSTER BY (region, country);
```

## Time Travel

```sql
-- Query by version
SELECT * FROM my_table VERSION AS OF 5;
SELECT * FROM my_table@v5;

-- Query by timestamp
SELECT * FROM my_table TIMESTAMP AS OF '2024-01-15T10:00:00';

-- View history
DESCRIBE HISTORY my_table;

-- Restore to version
RESTORE TABLE my_table TO VERSION AS OF 5;
RESTORE TABLE my_table TO TIMESTAMP AS OF '2024-01-15';
```

| Property | Default | Description |
|----------|---------|-------------|
| Log retention | 30 days | How long transaction log kept |
| Data retention | 7 days | VACUUM default |

## Table Constraints

```sql
-- NOT NULL
ALTER TABLE my_table ALTER COLUMN id SET NOT NULL;

-- CHECK constraint
ALTER TABLE my_table ADD CONSTRAINT valid_price CHECK (price > 0);

-- Drop constraint
ALTER TABLE my_table DROP CONSTRAINT valid_price;

-- View constraints
DESCRIBE TABLE EXTENDED my_table;
```

## Key Table Properties

```sql
-- Enable Change Data Feed
ALTER TABLE my_table SET TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true'
);

-- Enable auto optimize
ALTER TABLE my_table SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);

-- Set log retention
ALTER TABLE my_table SET TBLPROPERTIES (
  'delta.logRetentionDuration' = 'interval 45 days'
);

-- View all properties
SHOW TBLPROPERTIES my_table;
```

| Property | Default | Description |
|----------|---------|-------------|
| `delta.enableChangeDataFeed` | false | Enable CDF |
| `delta.autoOptimize.optimizeWrite` | true (managed) | Auto file sizing |
| `delta.autoOptimize.autoCompact` | true (managed) | Auto compaction |
| `delta.logRetentionDuration` | 30 days | Transaction log retention |
| `delta.deletedFileRetentionDuration` | 7 days | Minimum VACUUM retention |

## Schema Evolution

```sql
-- Add column
ALTER TABLE my_table ADD COLUMN new_col STRING;

-- Add column with position
ALTER TABLE my_table ADD COLUMN new_col STRING AFTER existing_col;

-- Rename column
ALTER TABLE my_table RENAME COLUMN old_name TO new_name;

-- Change column type (limited)
ALTER TABLE my_table ALTER COLUMN col_name TYPE BIGINT;
```

```python
# Auto merge schema on write

(df.write.format("delta")
    .option("mergeSchema", "true")
    .mode("append")
    .saveAsTable("my_table"))
```

## Cloning

```sql
-- Shallow clone (metadata only, references source files)
CREATE TABLE my_clone SHALLOW CLONE source_table;

-- Deep clone (full data copy)
CREATE TABLE my_clone DEEP CLONE source_table;

-- Clone to specific version
CREATE TABLE my_clone CLONE source_table VERSION AS OF 5;
```

| Clone Type | Use Case | Data Copied |
|------------|----------|-------------|
| Shallow | Testing, experimentation | No (references) |
| Deep | Production copy, archival | Yes (full copy) |

## Common Exam Tips

1. VACUUM default is 168 hours (7 days) - cannot reduce without disabling safety
2. Z-ORDER is manual; Liquid Clustering is automatic and incremental
3. Time travel limited by VACUUM retention, not log retention
4. `mergeSchema=true` for automatic schema evolution on writes
5. Change Data Feed must be explicitly enabled per table
6. Shallow clones don't copy data; they reference source files
7. MERGE can handle INSERT, UPDATE, and DELETE in single statement
8. Constraints are validated on write, not retroactively

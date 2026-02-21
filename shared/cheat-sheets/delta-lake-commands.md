---
tags: [cheat-sheet, delta-lake, sql, data-engineering]
---

# Delta Lake Commands Cheat Sheet

## Table Operations

### Create Tables

```sql
-- Managed table
CREATE TABLE catalog.schema.table_name (
  id INT,
  name STRING,
  created_at TIMESTAMP
) USING DELTA;

-- External table
CREATE TABLE catalog.schema.table_name
USING DELTA
LOCATION 'abfss://container@storage.dfs.core.windows.net/path';

-- Create table as select
CREATE TABLE new_table AS SELECT * FROM source_table;

-- Create or replace
CREATE OR REPLACE TABLE table_name AS SELECT * FROM source;
```

### Read Tables

```sql
-- Basic read
SELECT * FROM catalog.schema.table_name;

-- Time travel by version
SELECT * FROM table_name VERSION AS OF 5;

-- Time travel by timestamp
SELECT * FROM table_name TIMESTAMP AS OF '2024-01-01';
```

```python
# Python read
df = spark.read.format("delta").load("/path/to/table")

# Time travel
df = spark.read.format("delta").option("versionAsOf", 5).load("/path")
df = spark.read.format("delta").option("timestampAsOf", "2024-01-01").load("/path")
```

## Data Modification

### Insert / Append

```sql
INSERT INTO table_name VALUES (1, 'John', current_timestamp());
INSERT INTO table_name SELECT * FROM source_table;
INSERT OVERWRITE table_name SELECT * FROM source_table;
```

```python
df.write.format("delta").mode("append").saveAsTable("table_name")
df.write.format("delta").mode("overwrite").saveAsTable("table_name")
```

### Update

```sql
UPDATE table_name SET column = 'value' WHERE condition;
```

### Delete

```sql
DELETE FROM table_name WHERE condition;
```

### Merge (Upsert)

```sql
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;

-- With delete
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED AND s.deleted = true THEN DELETE
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

## Table Maintenance

### OPTIMIZE

```sql
-- Basic optimize
OPTIMIZE table_name;

-- With Z-ORDER
OPTIMIZE table_name ZORDER BY (column1, column2);

-- Specific partition
OPTIMIZE table_name WHERE date = '2024-01-01';
```

### VACUUM

```sql
-- Default retention (7 days)
VACUUM table_name;

-- Custom retention
VACUUM table_name RETAIN 168 HOURS;

-- Dry run (see files to delete)
VACUUM table_name DRY RUN;
```

### ANALYZE

```sql
-- Compute statistics
ANALYZE TABLE table_name COMPUTE STATISTICS;
ANALYZE TABLE table_name COMPUTE STATISTICS FOR COLUMNS col1, col2;
```

## Schema Operations

### Describe

```sql
DESCRIBE TABLE table_name;
DESCRIBE EXTENDED table_name;
DESCRIBE HISTORY table_name;
DESCRIBE DETAIL table_name;
```

### Alter Table

```sql
-- Add column
ALTER TABLE table_name ADD COLUMN new_col STRING;

-- Rename column
ALTER TABLE table_name RENAME COLUMN old_name TO new_name;

-- Change column type (limited)
ALTER TABLE table_name ALTER COLUMN col_name TYPE BIGINT;

-- Add constraint
ALTER TABLE table_name ADD CONSTRAINT pk PRIMARY KEY (id);
ALTER TABLE table_name ADD CONSTRAINT chk CHECK (amount > 0);

-- Set table properties
ALTER TABLE table_name SET TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');
```

## Cloning

```sql
-- Shallow clone (references source data files)
CREATE TABLE clone_table SHALLOW CLONE source_table;

-- Deep clone (copies data files)
CREATE TABLE clone_table DEEP CLONE source_table;

-- Clone specific version
CREATE TABLE clone_table CLONE source_table VERSION AS OF 10;
```

## Change Data Feed (CDF)

```sql
-- Enable CDF
ALTER TABLE table_name SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');

-- Read changes
SELECT * FROM table_changes('table_name', 1, 5);
SELECT * FROM table_changes('table_name', '2024-01-01', '2024-01-31');

-- Read changes from specific version to latest
SELECT * FROM table_changes('table_name', 5);
```

```python
# Python CDF read
(spark.read.format("delta")
  .option("readChangeFeed", "true")
  .option("startingVersion", 1)
  .option("endingVersion", 5)
  .table("table_name"))
```

> **Exam tip:** CDF only tracks changes made **after** it's enabled — it is NOT retroactive.

## Key Properties

| Property                             | Description               |
| ------------------------------------ | ------------------------- |
| `delta.enableChangeDataFeed`         | Enable CDF                |
| `delta.autoOptimize.optimizeWrite`   | Auto-optimize writes      |
| `delta.autoOptimize.autoCompact`     | Auto-compact files        |
| `delta.logRetentionDuration`         | Transaction log retention |
| `delta.deletedFileRetentionDuration` | Deleted file retention    |

## Key Numbers

| Setting                   | Default            |
| ------------------------- | ------------------ |
| VACUUM retention          | 168 hours (7 days) |
| Target file size          | 1 GB               |
| Transaction log retention | 30 days            |

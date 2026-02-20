---
title: Delta Lake Optimization
type: study-material
tags:
  - optimization
  - maintenance
  - performance
---

# Delta Lake Optimization

## Overview

Delta Lake optimization ensures tables remain performant as they grow. Key operations include compacting small files, removing old data, indexing for faster queries, and collecting statistics for query optimization.

## OPTIMIZE Command (Compaction)

```mermaid
flowchart TB
    subgraph Before["Before OPTIMIZE"]
        F1["File 1<br/>100MB"]
        F2["File 2<br/>50MB"]
        F3["File 3<br/>75MB"]
        F4["File 4<br/>25MB"]
        F5["File X..."]
        Total["Total: Many small files<br/>Slow scans"]
    end

    subgraph After["After OPTIMIZE"]
        Large["1-2 Large files<br/>~250MB each"]
        Optimized["Fewer files<br/>Faster queries"]
    end

    Before -->|OPTIMIZE| After
```text

### Basic OPTIMIZE

```sql
OPTIMIZE employees;

-- Output:
-- Added file count: 0
-- Removed file count: 150
-- Partition Values: [...]
```text

```python
# Python API
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "/mnt/data/employees")
delta_table.optimize().executeCompaction()
```text

### Partitioned OPTIMIZE

```sql
-- Optimize specific partitions only
OPTIMIZE employees WHERE year = 2025;

OPTIMIZE employees WHERE year = 2025 AND month = 1;
```text

```python
# Optimize with partition pruning
delta_table.optimize() \
    .where("year = 2025") \
    .executeCompaction()
```text

### OPTIMIZE with Z-order

Z-order indexing rearranges data to improve query performance on frequently filtered columns:

```sql
-- Optimize and Z-order by department (most filtered column)
OPTIMIZE employees
ZORDER BY (department, year);

-- Multiple columns for complex access patterns
OPTIMIZE orders
ZORDER BY (customer_id, order_date);
```text

```python
# Z-order via Python
from delta.tables import DeltaTable

DeltaTable.forPath(spark, "/mnt/data/employees") \
    .optimize() \
    .zorderBy("department") \
    .executeCompaction()
```text

## Z-order Indexing

Z-order clustering colocates related data to speed up queries:

```python
# Scenario: Employee queries typically filter by department and salary range
# Z-order on these columns

# Bad query (without Z-order):
# Scans many files to find department='Engineering' with salary > 100000

# Good query (with Z-order):
# Z-order clusters by (department, salary)
# Only scans files containing relevant data
```text

### When to Use Z-order

| Column Type | Benefit | Example |
|-----------|---------|---------|
| **Frequently Filtered** | High | WHERE department = 'X' |
| **Range Queries** | High | WHERE salary BETWEEN X AND Y |
| **High Cardinality** | Medium | Employee IDs |
| **Date Columns** | High | WHERE date > '2025-01-01' |
| **Low Cardinality** | Low | WHERE active = true |

## VACUUM Command

VACUUM removes old data files and transaction log entries to save storage:

```sql
-- Remove files older than 7 days (default)
VACUUM employees;

-- Remove files older than 30 days
VACUUM employees RETAIN 30 DAYS;

-- Remove files older than 1 hour (not recommended - breaks retention)
VACUUM employees RETAIN 1 HOURS;

-- Dry run (preview what would be deleted)
VACUUM employees DRY RUN;
```text

```python
# VACUUM via Python
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "/mnt/data/employees")
delta_table.vacuum(retention_hours=168)  # 7 days
```text

### VACUUM Safety

```python
# Default retention (7 days)
spark.conf.set("delta.deletedFileRetentionDuration", "interval 7 days")

# This prevents accidental data loss:
# - Retains versions for 7 days
# - Queries using timestamps within 7 days still work
# - Restoring to old versions requires 7-day retention
```text

### VACUUM and Time Travel Impact

```python
# VACUUM removes old files, breaking time travel to those versions
# Example:

# 1. Create table (v0)
spark.sql("CREATE TABLE employees AS SELECT ...")

# 2. Insert data daily for 60 days (v0 - v60)
# 3. Run VACUUM RETAIN 30 DAYS
#    - Removes versions older than 30 days
#    - Time travel to v5 fails!

# 4. Run VACUUM RETAIN 60 DAYS (safer)
#    - Time travel works for all versions within 60 days
```text

## Table Statistics

Delta stores statistics to help the query optimizer make better decisions:

### Inspecting Statistics

```sql
-- Show detailed statistics
SHOW TABLES
EXTENDED employees;

-- Check column statistics
SELECT
    COLUMN_NAME,
    STATISTICS
FROM
    (DESCRIBE EXTENDED employees)
WHERE
    COLUMN_NAME IN ('id', 'salary')
```text

### Column Statistics

```python
# Columns statistics tracked automatically:
# - min value
# - max value
# - null count
# - data type
# - index

# Example for salary column:
# min: 30000
# max: 500000
# nullCount: 0
# numValues: 10000
```text

### Collecting Statistics

```sql
-- Spark automatically collects stats on write
-- But can force collection:

ANALYZE TABLE employees COMPUTE STATISTICS;

-- Per-column statistics
ANALYZE TABLE employees COMPUTE STATISTICS FOR COLUMNS salary, department;
```text

```python
# Python equivalent
spark.sql("ANALYZE TABLE employees COMPUTE STATISTICS")
spark.sql("ANALYZE TABLE employees COMPUTE STATISTICS FOR COLUMNS salary, department")
```text

## Delta Table Properties for Optimization

### Auto-Optimize

```sql
-- Enable auto-optimization (runs OPTIMIZE on every commit)
ALTER TABLE employees
SET TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true'
);
```text

### Data Indexing

```sql
-- Enable data skipping with statistics
ALTER TABLE employees
SET TBLPROPERTIES (
    'delta.dataSkippingNumIndexedCols' = '32'
);
```text

### Bloom Filters

```sql
-- Bloom filter for fast lookups on specific column
ALTER TABLE employees
SET TBLPROPERTIES (
    'delta.bloomFilter.enabled' = 'true',
    'delta.bloomFilter.columns' = 'email'
);
```text

## Performance Tuning Strategy

### 1. Monitor File Size

```python
# Check average file size
files = spark.sql("""
    SELECT
        COUNT(*) as num_files,
        AVG(size) as avg_size_mb,
        SUM(size) as total_size_mb
    FROM
        (SELECT path, size FROM delta.detail('employees'))
""")
```text

### 2. Schedule Regular OPTIMIZE

```python
# Recommended: Weekly optimization for large tables
# Run during off-peak hours

def optimize_all_tables():
    tables = spark.sql("SHOW TABLES").collect()
    for table_row in tables:
        table_name = table_row['tableName']
        print(f"Optimizing {table_name}")
        spark.sql(f"OPTIMIZE {table_name}")
```text

### 3. Partition Strategy

```python
# Partition large tables by date
spark.sql("""
CREATE TABLE events (
    event_id INT,
    event_name STRING,
    timestamp TIMESTAMP,
    user_id INT
)
USING DELTA
PARTITIONED BY (year INT, month INT, day INT)
""")

# Insert with partition pruning
spark.sql("""
INSERT INTO events PARTITION (year=2025, month=1, day=15)
SELECT event_id, event_name, timestamp, user_id
FROM raw_events
WHERE YEAR(timestamp) = 2025 AND MONTH(timestamp) = 1 AND DAY(timestamp) = 15
""")
```text

## Maintenance Schedule

```python
# Recommended maintenance tasks

# Daily: Monitor table size
spark.sql("SELECT COUNT(*) FROM employees").show()

# Weekly: Optimize and analyze
spark.sql("OPTIMIZE employees")
spark.sql("ANALYZE TABLE employees COMPUTE STATISTICS")

# Monthly: VACUUM old data
spark.sql("VACUUM employees RETAIN 30 DAYS")

# Quarterly: Review Z-order strategy and adjust
# spark.sql("OPTIMIZE employees ZORDER BY (new_column)")
```text

## Compression and Format

### Delta with Different Encodings

```python
# Delta automatically uses optimal compression (Snappy by default)
df.write \
    .format("delta") \
    .option("compression", "snappy") \
    .mode("overwrite") \
    .save("/mnt/data/employees")

# Other options: gzip, lz4, uncompressed
```text

### Storage Format Comparison

| Format | Compression | Scan Speed | Size |
|--------|-----------|-----------|------|
| **Parquet (Snappy)** | Good | Fast | Medium |
| **Delta (Snappy)** | Good | Fast | Medium |
| **Parquet (Gzip)** | Best | Slower | Small |
| **Uncompressed** | None | Fastest | Large |

## Monitoring Query Performance

```python
# Check query execution plan
spark.sql("""
EXPLAIN EXTENDED
SELECT * FROM employees WHERE salary > 100000
""").show(truncate=False)

# Check if Z-order is used
# Look for "DataFilters" section
```text

## Optimization Workflow Example

```python
# Complete optimization example

from delta.tables import DeltaTable
from pyspark.sql.functions import *

table_path = "/mnt/data/employees"
delta_table = DeltaTable.forPath(spark, table_path)

# 1. Analyze current state
spark.sql("ANALYZE TABLE employees COMPUTE STATISTICS")

# 2. Optimize and Z-order
delta_table.optimize() \
    .zorderBy("department", "hire_date") \
    .executeCompaction()

# 3. VACUUM old files
delta_table.vacuum(retention_hours=168)  # 7 days

# 4. Verify improvements
print("Optimization complete!")
spark.sql("DESCRIBE HISTORY employees LIMIT 1").show()
```text

## Key Exam Concepts

- **OPTIMIZE**: Compact small files into larger ones for faster scans
- **Z-order**: Index columns for better query performance on filters
- **VACUUM**: Remove old data files and transaction logs to save storage
- **Statistics**: Automatic collection helps query optimizer
- **Retention**: Default 7 days prevents accidental data loss
- **Auto-optimize**: Automatic OPTIMIZE on write (if enabled)
- **Bloom Filters**: Fast lookup filtering on specific columns
- **Maintenance**: Regular OPTIMIZE, ANALYZE, and VACUUM needed

---

**[← Back to Delta Lake](README.md)**

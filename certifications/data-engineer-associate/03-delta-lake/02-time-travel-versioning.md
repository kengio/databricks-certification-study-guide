---
title: Time Travel and Versioning
type: study-material
tags:
  - time-travel
  - versioning
  - history
---

# Time Travel and Versioning

## Overview

Delta Lake maintains a complete history of all changes via its transaction log. This enables time travel (querying historical data), versioning, rollback, and clone operations—capabilities unique among major data formats.

## Transaction Log and Versioning

```mermaid
flowchart LR
    T0["Version 0<br/>Initial load<br/>1000 rows"]
    T1["Version 1<br/>Insert 100 rows<br/>1100 rows"]
    T2["Version 2<br/>Update salaries<br/>1100 rows"]
    T3["Version 3<br/>Delete 10 rows<br/>1090 rows"]

    T0 -->|delta_log/00...json| T1
    T1 -->|delta_log/01...json| T2
    T2 -->|delta_log/02...json| T3

    AccessPoint["Query any version"]

    T0 -.->|Time Travel| AccessPoint
    T1 -.->|Time Travel| AccessPoint
    T2 -.->|Time Travel| AccessPoint
    T3 -.->|Time Travel| AccessPoint
```

## Viewing Version History

### DESCRIBE HISTORY

```sql
DESCRIBE HISTORY employees

-- Output: version, timestamp, userId, userName, operation, operationParameters, cluster_id
```

```python
# Get history as DataFrame

history_df = spark.sql("DESCRIBE HISTORY employees")
history_df.show()
```

### Version Details

```sql
SELECT
    version,
    timestamp,
    operation,
    operationParameters
FROM
    (DESCRIBE HISTORY employees)
ORDER BY version DESC
LIMIT 10;
```

## Time Travel Queries

### Query by Version Number

```python
# Read exact version

df_v0 = (spark.read
    .format("delta")
    .option("versionAsOf", 0)
    .load("/mnt/data/employees"))

df_v5 = (spark.read
    .format("delta")
    .option("versionAsOf", 5)
    .load("/mnt/data/employees"))

# Compare versions

df_v0.count()  # 1000 rows
df_v5.count()  # 1150 rows
```

### Query by Timestamp

```python
# Read data as of specific date/time

df_past = (spark.read
    .format("delta")
    .option("timestampAsOf", "2025-01-15T10:30:00Z")
    .load("/mnt/data/employees"))

# Read data from yesterday

from pyspark.sql.functions import date_sub, current_date
yesterday = date_sub(current_date(), 1)

df_yesterday = (spark.read
    .format("delta")
    .option("timestampAsOf", yesterday)
    .load("/mnt/data/employees"))
```

### SQL Time Travel

```sql
-- Query by version
SELECT * FROM employees VERSION AS OF 5;

SELECT * FROM employees@v5;

-- Query by timestamp
SELECT * FROM employees TIMESTAMP AS OF '2025-01-15T10:30:00Z';

SELECT * FROM employees@'2025-01-15';
```

## Data Recovery and Rollback

### Restore to Previous Version

```sql
-- Restore table to version 5
RESTORE TABLE employees TO VERSION AS OF 5;

-- Restore to timestamp
RESTORE TABLE employees TO TIMESTAMP AS OF '2025-01-15';
```

```python
# Via PySpark

from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "/mnt/data/employees")
delta_table.restoreToVersion(5)
```

### Complete Rollback Example

```python
# Scenario: Accidental delete of 100 rows

from pyspark.sql.functions import col

# Check current state

spark.sql("SELECT COUNT(*) FROM employees").show()  # 900 rows (oops!)

# Find version before delete

spark.sql("DESCRIBE HISTORY employees").show(20)  # Version 10 had 1000 rows

# Restore

spark.sql("RESTORE TABLE employees TO VERSION AS OF 10")

# Verify recovery

spark.sql("SELECT COUNT(*) FROM employees").show()  # 1000 rows (recovered!)
```

## Clone Operations

### Shallow Clone

A shallow clone copies the Delta metadata and references the same data files. It's fast and cost-effective but shares data with the source:

```python
# Create shallow clone

spark.sql("""
CREATE TABLE employees_clone
SHALLOW CLONE employees;
""")

# Or with Python

(DeltaTable.forPath(spark, "/mnt/data/employees")
    .clone("/mnt/data/employees_clone", isShallow=True))
```

Shallow clone benefits:

- Nearly instant (copies only metadata)
- Minimal storage (references existing files)
- Changes only affect the clone

### Deep Clone

A deep clone copies both metadata AND data files. Changes in the clone don't affect the source:

```python
# Create deep clone

spark.sql("""
CREATE TABLE employees_backup
DEEP CLONE employees;
""")

# Or with Python

(DeltaTable.forPath(spark, "/mnt/data/employees")
    .clone("/mnt/data/employees_backup", isShallow=False))
```

Deep clone benefits:

- Full independence (separate data)
- Safe for testing/experiments
- Larger storage footprint

### Clone Use Cases

```python
# Use Case 1: Create test copy before experimenting

spark.sql("CREATE TABLE test_df DEEP CLONE production_table")

# Use Case 2: Point-in-time backup

spark.sql("CREATE TABLE backup_20250115 DEEP CLONE employees")

# Use Case 3: Zero-copy reference for read-only access

spark.sql("CREATE TABLE read_only SHALLOW CLONE sensitive_data")
```

## Comparing Versions

### Find What Changed

```python
# Get history with details

history = spark.sql("DESCRIBE HISTORY employees LIMIT 100")
(history.select("version", "timestamp", "operation", "operationParameters")
    .show(truncate=False))

# Compare version 3 and version 5

v3 = (spark.read
    .format("delta")
    .option("versionAsOf", 3)
    .load("/mnt/data/employees"))

v5 = (spark.read
    .format("delta")
    .option("versionAsOf", 5)
    .load("/mnt/data/employees"))

# Count differences

v3.count()  # 1000 rows
v5.count()  # 1100 rows

# Find new rows

new_rows = v5.except(v3)  # Rows in v5 not in v3
new_rows.show()
```

### Audit Data Changes

```python
# Find all updates to a specific row

employee_id = 123

# Check history

spark.sql(f"""
    SELECT
        version,
        timestamp,
        operation,
        operationParameters
    FROM
        (DESCRIBE HISTORY employees)
    ORDER BY version DESC
""").show()

# Query employee in each version

for version in [0, 5, 10, 15]:
    print(f"\n--- Version {version} ---")
    (spark.read
        .format("delta")
        .option("versionAsOf", version)
        .load("/mnt/data/employees")
        .filter(f"id = {employee_id}")
        .show())
```

## Retention Policies

### Set Data Retention

```sql
-- Keep 30 days of history
ALTER TABLE employees
SET TBLPROPERTIES (
    'delta.logRetentionDuration' = '30 days'
);

-- Or default
ALTER TABLE employees
SET TBLPROPERTIES (
    'delta.logRetentionDuration' = 'interval 30 days'
);
```

### Delete Old Versions

```python
# Manual cleanup (remove versions older than 30 days)

(DeltaTable.forPath(spark, "/mnt/data/employees")
    .delete(condition="timestamp < current_timestamp() - interval 30 days"))
```

## Version Management Best Practices

```python
# Always check history before modifying

spark.sql("DESCRIBE HISTORY employees").show(5)

# Keep test/staging changes isolated via clones

spark.sql("CREATE TABLE staging DEEP CLONE production")

# Document significant operations

spark.sql("""
INSERT INTO employees
SELECT * FROM external_source
""")
spark.sql("DESCRIBE HISTORY employees LIMIT 1").show()

# Archive old data via clones

spark.sql("""
CREATE TABLE archive_2024_12_31
DEEP CLONE employees
""")

# Monitor transaction log size

import os
log_path = "/mnt/data/employees/_delta_log"
# Check filesystem for accumulating logs

```

## Time Travel Limitations

| Limitation | Details | Impact |
|-----------|---------|--------|
| **Retention** | Default 30 days | Older versions deleted |
| **Log Size** | Grows with activity | Storage cost |
| **Metadata Size** | Large datasets | Memory overhead |
| **Performance** | Older versions slower | Network I/O to cloud |

## Delta Lake vs Other Formats - Time Travel

| Format | Version History | Time Travel | Recovery | Data Lineage |
|--------|---|---|---|---|
| **Delta Lake** | Full transaction log | Yes | Complete rollback | Yes |
| **Parquet** | None | No | Manual backups | No |
| **Iceberg** | Full history | Yes | Complete rollback | Yes |
| **Hudi** | Limited history | Yes | Snapshot restore | Limited |

## Use Cases

- **Accidental Data Recovery**: Restoring a Delta table to a previous version after an erroneous `DELETE` or `UPDATE` operation, using `RESTORE TABLE ... TO VERSION AS OF n` to recover lost data within minutes.
- **Regulatory Audit and Compliance**: Querying historical versions of a table to reproduce reports as they existed on a specific date, satisfying audit requirements without maintaining separate snapshot copies.

## Common Issues & Errors

### Configuration Oversights

**Scenario:** The default settings for Time Travel and Versioning do not scale well with sudden spikes in data volume.
**Fix:** Explicitly define and tune the configuration parameters for Time Travel and Versioning to handle production-scale workloads.

### VersionNotFoundException After VACUUM

**Scenario:** A time travel query like `SELECT * FROM table VERSION AS OF 5` fails with `VersionNotFoundException` because `VACUUM` already removed the data files for that version.
**Fix:** Time travel is only available within the retention period (default 7 days). Plan VACUUM retention to cover your audit and recovery requirements, and use `DESCRIBE HISTORY` to check which versions are still available.

### Accidentally Restoring to the Wrong Version

**Scenario:** An engineer runs `RESTORE TABLE ... TO VERSION AS OF n` but picks the wrong version number, overwriting the current table state with incorrect data.
**Fix:** Always run `DESCRIBE HISTORY` first to verify the contents and operation of each version before executing `RESTORE`. Since RESTORE creates a new version, you can restore again to undo a mistaken restore.

## Exam Tips

- Know both syntaxes for time travel: `VERSION AS OF n` and `TIMESTAMP AS OF 'date'` in SQL; `versionAsOf` and `timestampAsOf` options in PySpark
- `RESTORE TABLE ... TO VERSION AS OF n` rolls back the table -- this creates a new version (it does not delete versions)
- Shallow clone copies metadata only (fast, small); Deep clone copies data and metadata (slow, independent)
- VACUUM removes old files and breaks time travel for versions older than the retention period

## Key Takeaways

- **Version History**: Tracked in `_delta_log/` JSON files
- **Time Travel**: Query any historical version by version number or timestamp
- **Restore**: Rollback table to previous state
- **Shallow Clone**: Metadata copy, shared data files, instant
- **Deep Clone**: Complete copy, independent data, larger storage
- **Retention Policy**: Default 30 days for versions
- **Audit Trail**: Full history of all operations
- **Point-in-Time Recovery**: Essential for compliance and debugging

## Related Topics

- [Delta Lake Fundamentals](./01-delta-lake-fundamentals.md)
- [Delta Lake Optimization](./03-delta-optimization.md)
- [Delta Lake Commands Cheat Sheet](../../../shared/cheat-sheets/delta-lake-commands.md)

## Official Documentation

- [Delta Lake Time Travel](https://docs.databricks.com/en/delta/history.html)
- [Clone a Table on Databricks](https://docs.databricks.com/en/delta/clone.html)

---

**[← Previous: Delta Lake Fundamentals](./01-delta-lake-fundamentals.md) | [↑ Back to Delta Lake](./README.md) | [Next: Delta Lake Optimization](./03-delta-optimization.md) →**

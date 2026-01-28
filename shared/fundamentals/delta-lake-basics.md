# Delta Lake Basics

Delta Lake is an open-source storage layer that brings ACID transactions to Apache Spark and big data workloads.

## What is Delta Lake?

Delta Lake is a storage format that sits on top of cloud object storage (S3, ADLS, GCS) and provides:

- **ACID Transactions** - Ensures data integrity with atomicity, consistency, isolation, and durability
- **Scalable Metadata** - Handles petabyte-scale tables with billions of partitions
- **Time Travel** - Access previous versions of data for audits, rollbacks, or reproducibility
- **Schema Enforcement** - Prevents bad data from corrupting your tables
- **Schema Evolution** - Allows schema changes without rewriting data

## Delta Lake vs Parquet

| Feature             | Parquet | Delta Lake |
| ------------------- | ------- | ---------- |
| ACID Transactions   | No      | Yes        |
| Time Travel         | No      | Yes        |
| Schema Enforcement  | No      | Yes        |
| MERGE/UPDATE/DELETE | No      | Yes        |
| Concurrent Writes   | No      | Yes        |
| Data Versioning     | No      | Yes        |

## Core Concepts

### Transaction Log

Delta Lake maintains a transaction log (`_delta_log/`) that records all changes to the table:

```text
my_table/
├── _delta_log/
│   ├── 00000000000000000000.json
│   ├── 00000000000000000001.json
│   └── 00000000000000000002.json
├── part-00000-xxx.parquet
└── part-00001-xxx.parquet
```

Each JSON file contains:

- Add/remove file actions
- Metadata changes
- Transaction information

### Table Properties

```sql
-- Create a Delta table
CREATE TABLE my_table (
  id INT,
  name STRING,
  updated_at TIMESTAMP
)
USING DELTA
LOCATION '/path/to/table';

-- View table properties
DESCRIBE EXTENDED my_table;

-- View table history
DESCRIBE HISTORY my_table;
```

## Basic Operations

### Reading Delta Tables

```python
# Python
df = spark.read.format("delta").load("/path/to/table")

# Or using table name
df = spark.table("my_table")
```

```sql
-- SQL
SELECT * FROM my_table;
SELECT * FROM delta.`/path/to/table`;
```

### Writing to Delta Tables

```python
# Overwrite
df.write.format("delta").mode("overwrite").save("/path/to/table")

# Append
df.write.format("delta").mode("append").save("/path/to/table")

# Using saveAsTable
df.write.format("delta").saveAsTable("my_table")
```

```sql
-- SQL
INSERT INTO my_table VALUES (1, 'Alice', current_timestamp());
INSERT OVERWRITE my_table SELECT * FROM source_table;
```

### Update and Delete

```sql
-- Update records
UPDATE my_table
SET name = 'Bob'
WHERE id = 1;

-- Delete records
DELETE FROM my_table
WHERE id = 1;
```

```python
# Python DeltaTable API
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "/path/to/table")

# Update
delta_table.update(
    condition="id = 1",
    set={"name": "'Bob'"}
)

# Delete
delta_table.delete("id = 1")
```

### MERGE (Upsert)

```sql
MERGE INTO target_table t
USING source_table s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

```python
delta_table.alias("t").merge(
    source_df.alias("s"),
    "t.id = s.id"
).whenMatchedUpdateAll(
).whenNotMatchedInsertAll(
).execute()
```

## Time Travel

Access previous versions of your data:

```sql
-- By version number
SELECT * FROM my_table VERSION AS OF 5;

-- By timestamp
SELECT * FROM my_table TIMESTAMP AS OF '2025-01-15 10:00:00';

-- Restore to previous version
RESTORE TABLE my_table TO VERSION AS OF 5;
```

```python
# Python
df = spark.read.format("delta").option("versionAsOf", 5).load("/path/to/table")
df = spark.read.format("delta").option("timestampAsOf", "2025-01-15").load("/path/to/table")
```

## Schema Management

### Schema Enforcement

Delta Lake rejects writes that don't match the table schema:

```python
# This will fail if schema doesn't match
df.write.format("delta").mode("append").save("/path/to/table")
```

### Schema Evolution

Allow schema changes during writes:

```python
# Add new columns automatically
df.write.format("delta") \
    .mode("append") \
    .option("mergeSchema", "true") \
    .save("/path/to/table")
```

```sql
-- SQL: Add column
ALTER TABLE my_table ADD COLUMN email STRING;

-- SQL: Change column type (if compatible)
ALTER TABLE my_table ALTER COLUMN id TYPE BIGINT;
```

## Use Cases

| Use Case              | How Delta Lake Helps                      |
| --------------------- | ----------------------------------------- |
| Data Lakes            | ACID transactions prevent data corruption |
| ETL Pipelines         | MERGE enables efficient upserts           |
| Regulatory Compliance | Time travel for audit trails              |
| ML Feature Stores     | Schema enforcement ensures data quality   |
| Real-time Analytics   | Concurrent reads/writes without conflicts |

## Common Issues

| Issue                                         | Cause                         | Solution                                      |
| --------------------------------------------- | ----------------------------- | --------------------------------------------- |
| `AnalysisException: A schema mismatch...`     | Schema doesn't match          | Use `mergeSchema` option or fix source data   |
| `ConcurrentModificationException`             | Conflicting concurrent writes | Implement retry logic or use isolation levels |
| Slow queries on large tables                  | Too many small files          | Run OPTIMIZE to compact files                 |
| Storage growth                                | Old versions retained         | Run VACUUM to clean up old files              |

## Related Topics

- [Open Table Formats](open-table-formats.md) - UniForm, Iceberg, Hudi comparison
- [Delta Lake Operations (Advanced)](../../certifications/data-engineer-professional/01-data-processing/01-delta-lake-operations.md) - OPTIMIZE, VACUUM, Z-ordering
- [Medallion Architecture](medallion-architecture.md) - Bronze/Silver/Gold pattern
- [Change Data Capture](../../certifications/data-engineer-professional/01-data-processing/06-change-data-capture.md) - CDC patterns

## Official Documentation

- [Delta Lake Documentation](https://docs.delta.io/)
- [Databricks Delta Lake Guide](https://docs.databricks.com/delta/index.html)

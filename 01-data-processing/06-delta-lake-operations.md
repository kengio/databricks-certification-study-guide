# Delta Lake Operations

Delta Lake operations are fundamental to the exam. Master MERGE, OPTIMIZE, VACUUM, and time travel as they appear in multiple question scenarios.

## Overview

```mermaid
flowchart TD
    DL[Delta Lake Operations] --> DML[Data Modification]
    DL --> Maint[Table Maintenance]
    DL --> TT[Time Travel]
    DL --> Schema[Schema Management]

    DML --> MERGE
    DML --> UPDATE
    DML --> DELETE

    Maint --> OPTIMIZE
    Maint --> VACUUM
    Maint --> ANALYZE

    TT --> Version[Version Queries]
    TT --> Restore[RESTORE]

    Schema --> Clone[Cloning]
    Schema --> Alter[ALTER TABLE]
```

## MERGE Operation

MERGE is the most important Delta Lake operation for the exam. It enables upserts (update + insert) in a single atomic transaction.

### Basic Syntax

```sql
MERGE INTO target_table AS t
USING source_table AS s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

### MERGE Clauses

```mermaid
flowchart TD
    Start[Row from Source] --> Match{Matches Target?}
    Match -->|Yes| Matched[WHEN MATCHED]
    Match -->|No| NotMatched[WHEN NOT MATCHED]

    Matched --> MatchAction{Action?}
    MatchAction --> Update[UPDATE SET]
    MatchAction --> Delete[DELETE]

    NotMatched --> InsertAction[INSERT]

    Target[Target Row] --> BySource{In Source?}
    BySource -->|No| NotBySource[WHEN NOT MATCHED BY SOURCE]
    NotBySource --> BySourceAction{Action?}
    BySourceAction --> UpdateOrphan[UPDATE]
    BySourceAction --> DeleteOrphan[DELETE]
```

| Clause | Purpose | When Triggered |
|--------|---------|----------------|
| `WHEN MATCHED` | Update or delete existing rows | Source row matches target row |
| `WHEN NOT MATCHED` | Insert new rows | Source row has no match in target |
| `WHEN NOT MATCHED BY SOURCE` | Handle orphan rows | Target row has no match in source |

### MERGE with Conditions

```sql
MERGE INTO customers AS t
USING updates AS s
ON t.customer_id = s.customer_id
WHEN MATCHED AND s.is_deleted = true THEN DELETE
WHEN MATCHED AND s.is_deleted = false THEN UPDATE SET
    t.name = s.name,
    t.email = s.email,
    t.updated_at = current_timestamp()
WHEN NOT MATCHED AND s.is_deleted = false THEN INSERT (
    customer_id, name, email, created_at, updated_at
) VALUES (
    s.customer_id, s.name, s.email, current_timestamp(), current_timestamp()
);
```

### Star Syntax

```sql
-- UPDATE SET * updates all columns from source
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

### MERGE with Schema Evolution

```sql
-- Allow new columns from source to be added to target
MERGE WITH SCHEMA EVOLUTION INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

### Python MERGE API

```python
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "/path/to/target")

delta_table.alias("t").merge(
    source_df.alias("s"),
    "t.id = s.id"
).whenMatchedUpdateAll(
).whenNotMatchedInsertAll(
).execute()
```

```python
# With conditions
delta_table.alias("t").merge(
    source_df.alias("s"),
    "t.id = s.id"
).whenMatchedUpdate(
    condition="s.is_deleted = false",
    set={"name": "s.name", "email": "s.email"}
).whenMatchedDelete(
    condition="s.is_deleted = true"
).whenNotMatchedInsert(
    condition="s.is_deleted = false",
    values={"id": "s.id", "name": "s.name", "email": "s.email"}
).execute()
```

## Common MERGE Patterns

### Simple Upsert

```sql
-- Insert new, update existing
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

### Upsert with Delete

```sql
-- CDC pattern: handle inserts, updates, and deletes
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN MATCHED AND s.operation = 'DELETE' THEN DELETE
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED AND s.operation != 'DELETE' THEN INSERT *;
```

### Insert-Only Merge (Deduplication)

```sql
-- Only insert if not exists (no updates)
MERGE INTO target AS t
USING source AS s
ON t.id = s.id
WHEN NOT MATCHED THEN INSERT *;
```

### SCD Type 1 (Overwrite)

```sql
-- Always overwrite with latest values
MERGE INTO dim_customer AS t
USING stg_customer AS s
ON t.customer_id = s.customer_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

## OPTIMIZE Command

OPTIMIZE compacts small files into larger ones, improving read performance.

### OPTIMIZE Syntax

```sql
-- Optimize entire table
OPTIMIZE catalog.schema.table_name;

-- Optimize specific partition
OPTIMIZE table_name WHERE date = '2024-01-01';

-- Optimize with predicate
OPTIMIZE table_name WHERE region = 'us-west';
```

### ZORDER BY

ZORDER co-locates related data in the same files for faster filtering.

```sql
-- Optimize with Z-ordering on frequently filtered columns
OPTIMIZE table_name ZORDER BY (customer_id, order_date);

-- Partition + ZORDER
OPTIMIZE table_name
WHERE date >= '2024-01-01'
ZORDER BY (customer_id);
```

| Aspect | OPTIMIZE | ZORDER |
|--------|----------|--------|
| Purpose | Compact small files | Co-locate data for queries |
| When to use | After many small writes | Improve filter performance |
| Columns | N/A | 1-4 columns (practical limit) |
| Cost | Rewrites files | Higher cost than plain OPTIMIZE |

### ZORDER Column Selection

```mermaid
flowchart TD
    Start[Choose ZORDER Columns] --> Q1{High cardinality?}
    Q1 -->|Yes| Q2{Used in WHERE clauses?}
    Q1 -->|No| Skip[Skip - low cardinality]
    Q2 -->|Yes| Q3{1-4 columns total?}
    Q2 -->|No| Skip2[Skip - not filtered]
    Q3 -->|Yes| Include[Include in ZORDER]
    Q3 -->|No| Prioritize[Keep most selective columns]
```

### Auto Optimize

```sql
-- Enable auto optimize on table
ALTER TABLE table_name SET TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true'
);
```

| Property | Behavior |
|----------|----------|
| `optimizeWrite` | Automatically optimize file sizes during writes |
| `autoCompact` | Automatically compact small files after writes |

## Liquid Clustering

Liquid Clustering is an alternative to ZORDER that automatically manages data layout.

```sql
-- Create table with liquid clustering
CREATE TABLE table_name (
    id INT,
    name STRING,
    region STRING
) USING DELTA
CLUSTER BY (region, id);

-- Add clustering to existing table
ALTER TABLE table_name CLUSTER BY (region, id);

-- Remove clustering
ALTER TABLE table_name CLUSTER BY NONE;
```

| Feature | ZORDER | Liquid Clustering |
|---------|--------|-------------------|
| Manual optimization | Required | Automatic |
| Column changes | Requires full rewrite | Incremental |
| Best for | Stable query patterns | Evolving patterns |
| Write overhead | During OPTIMIZE | During writes |

## VACUUM Command

VACUUM removes old files that are no longer referenced by the Delta table.

### VACUUM Syntax

```sql
-- Default retention (7 days / 168 hours)
VACUUM table_name;

-- Custom retention
VACUUM table_name RETAIN 240 HOURS;

-- Dry run (preview files to delete)
VACUUM table_name DRY RUN;
```

### Critical VACUUM Facts (Exam Important)

| Setting | Value |
|---------|-------|
| Default retention | **168 hours (7 days)** |
| Minimum safe retention | 168 hours |
| Override minimum | `spark.databricks.delta.retentionDurationCheck.enabled = false` |

```mermaid
flowchart LR
    Write[Write Data] --> Files[Data Files Created]
    Files --> Update[UPDATE/DELETE/OPTIMIZE]
    Update --> Old[Old Files Marked Obsolete]
    Old --> Retention{Past Retention?}
    Retention -->|No| Keep[Keep for Time Travel]
    Retention -->|Yes| Vacuum[VACUUM Removes]
```

### VACUUM Safety

```sql
-- DANGEROUS: Never do this in production
SET spark.databricks.delta.retentionDurationCheck.enabled = false;
VACUUM table_name RETAIN 0 HOURS;  -- Breaks time travel!

-- Safe: Always use default or higher retention
VACUUM table_name RETAIN 168 HOURS;
```

**Warning**: Running VACUUM with retention less than 7 days can break:

- Time travel queries
- Concurrent readers
- Streaming queries with old checkpoints

## Time Travel

Time travel allows querying previous versions of a Delta table.

### Query by Version

```sql
-- Query specific version
SELECT * FROM table_name VERSION AS OF 5;

-- Using @ syntax
SELECT * FROM table_name@v5;
```

### Query by Timestamp

```sql
-- Query at specific timestamp
SELECT * FROM table_name TIMESTAMP AS OF '2024-01-15 10:00:00';

-- Using @ syntax
SELECT * FROM table_name@'2024-01-15';
```

### Python Time Travel

```python
# By version
df = spark.read.format("delta") \
    .option("versionAsOf", 5) \
    .load("/path/to/table")

# By timestamp
df = spark.read.format("delta") \
    .option("timestampAsOf", "2024-01-15") \
    .load("/path/to/table")
```

### DESCRIBE HISTORY

```sql
-- View table history
DESCRIBE HISTORY table_name;

-- Limit results
DESCRIBE HISTORY table_name LIMIT 10;
```

Returns columns:

- `version` - Version number
- `timestamp` - When the version was created
- `operation` - WRITE, MERGE, DELETE, etc.
- `operationParameters` - Details of the operation
- `userIdentity` - Who made the change

### RESTORE Command

```sql
-- Restore to previous version
RESTORE TABLE table_name TO VERSION AS OF 5;

-- Restore to timestamp
RESTORE TABLE table_name TO TIMESTAMP AS OF '2024-01-15';
```

### Time Travel Retention

```sql
-- Configure log retention (default 30 days)
ALTER TABLE table_name SET TBLPROPERTIES (
    'delta.logRetentionDuration' = 'interval 45 days'
);

-- Configure deleted file retention (default matches VACUUM)
ALTER TABLE table_name SET TBLPROPERTIES (
    'delta.deletedFileRetentionDuration' = 'interval 14 days'
);
```

## Table Cloning

### Shallow Clone

Creates a copy that references the source's data files.

```sql
-- Shallow clone (fast, shares data files)
CREATE TABLE clone_table SHALLOW CLONE source_table;

-- Clone specific version
CREATE TABLE clone_table SHALLOW CLONE source_table VERSION AS OF 10;
```

### Deep Clone

Creates an independent copy with its own data files.

```sql
-- Deep clone (copies all data)
CREATE TABLE clone_table DEEP CLONE source_table;

-- Clone to specific location
CREATE TABLE clone_table DEEP CLONE source_table
LOCATION 'abfss://container@storage/path';
```

| Feature | Shallow Clone | Deep Clone |
|---------|---------------|------------|
| Data files | Shared (referenced) | Copied |
| Speed | Fast | Slow (copies data) |
| Storage | Minimal | Full copy |
| Independence | Dependent on source | Fully independent |
| Use case | Testing, experimentation | Backups, migration |

## ANALYZE TABLE

Compute statistics for the query optimizer.

```sql
-- Compute table statistics
ANALYZE TABLE table_name COMPUTE STATISTICS;

-- Compute column statistics
ANALYZE TABLE table_name COMPUTE STATISTICS FOR COLUMNS col1, col2;

-- Compute all column statistics
ANALYZE TABLE table_name COMPUTE STATISTICS FOR ALL COLUMNS;
```

## Schema Operations

### Add Column

```sql
ALTER TABLE table_name ADD COLUMN new_col STRING;
ALTER TABLE table_name ADD COLUMN new_col STRING AFTER existing_col;
ALTER TABLE table_name ADD COLUMNS (col1 STRING, col2 INT);
```

### Rename Column

```sql
ALTER TABLE table_name RENAME COLUMN old_name TO new_name;
```

### Change Column Type

```sql
-- Only widening conversions allowed (e.g., INT to BIGINT)
ALTER TABLE table_name ALTER COLUMN col_name TYPE BIGINT;
```

### Add Constraints

```sql
-- Primary key (informational, not enforced)
ALTER TABLE table_name ADD CONSTRAINT pk PRIMARY KEY (id);

-- Check constraint (enforced)
ALTER TABLE table_name ADD CONSTRAINT chk_amount CHECK (amount > 0);

-- Not null constraint
ALTER TABLE table_name ALTER COLUMN col_name SET NOT NULL;

-- Drop constraint
ALTER TABLE table_name DROP CONSTRAINT constraint_name;
```

## Key Table Properties

| Property | Description | Default |
|----------|-------------|---------|
| `delta.enableChangeDataFeed` | Enable Change Data Feed | false |
| `delta.autoOptimize.optimizeWrite` | Optimize file sizes on write | false |
| `delta.autoOptimize.autoCompact` | Auto-compact after writes | false |
| `delta.logRetentionDuration` | Transaction log retention | 30 days |
| `delta.deletedFileRetentionDuration` | Deleted file retention | 7 days |
| `delta.minReaderVersion` | Minimum reader protocol | varies |
| `delta.minWriterVersion` | Minimum writer protocol | varies |

## Transaction Log

The transaction log (`_delta_log/`) is the source of truth for Delta tables.

```mermaid
flowchart LR
    subgraph Transaction Log
        J1[00000.json] --> J2[00001.json]
        J2 --> J3[00002.json]
        J3 --> CP[00010.checkpoint.parquet]
        CP --> J4[00011.json]
    end
```

- JSON files record each transaction
- Checkpoint files (every 10 commits) for faster reads
- Enables ACID transactions and time travel

## Delta Lake 3.0+ Features

These modern features are increasingly important for the exam.

### Deletion Vectors

Deletion vectors mark rows as deleted without rewriting entire data files, significantly improving DELETE, UPDATE, and MERGE performance.

```mermaid
flowchart LR
    subgraph Without DVs
        D1[DELETE row] --> R1[Rewrite entire file]
        R1 --> S1[Expensive for large files]
    end

    subgraph With DVs
        D2[DELETE row] --> R2[Write small DV file]
        R2 --> S2[Fast, constant time]
    end
```

| Aspect | Without DVs | With DVs |
|--------|-------------|----------|
| DELETE/UPDATE | Rewrite entire file | Write small DV file |
| Performance | Slow for large files | Fast, constant time |
| Space reclaim | Immediate | On VACUUM |
| File count | Fewer files | More small DV files |

#### Enabling Deletion Vectors

```sql
-- Enable on new table
CREATE TABLE table_name (
    id INT,
    name STRING
) USING DELTA
TBLPROPERTIES ('delta.enableDeletionVectors' = 'true');

-- Enable on existing table
ALTER TABLE table_name
SET TBLPROPERTIES ('delta.enableDeletionVectors' = 'true');
```

```python
# Check if DVs are enabled
spark.sql("DESCRIBE DETAIL table_name").select("properties").show(truncate=False)
```

**Exam Tip**: Deletion vectors are enabled by default on Databricks Runtime 14.x+ for new tables.

### Predictive Optimization

Databricks automatically analyzes table access patterns and runs OPTIMIZE and VACUUM operations.

```sql
-- Enable at table level
ALTER TABLE table_name
SET TBLPROPERTIES ('delta.enablePredictiveOptimization' = 'true');
```

| Feature | Behavior |
|---------|----------|
| Auto OPTIMIZE | Runs based on write patterns |
| Auto VACUUM | Runs based on file age and access |
| Workload analysis | Recommends clustering columns |
| Cost | Included in serverless compute |

**When to use**: Enable for tables with frequent small writes that need regular optimization without manual scheduling.

### Delta UniForm (Universal Format)

UniForm enables reading Delta tables as Apache Iceberg or Apache Hudi without data conversion.

```sql
-- Enable UniForm for Iceberg compatibility
CREATE TABLE table_name (
    id INT,
    name STRING
) USING DELTA
TBLPROPERTIES ('delta.universalFormat.enabledFormats' = 'iceberg');

-- Enable on existing table
ALTER TABLE table_name
SET TBLPROPERTIES ('delta.universalFormat.enabledFormats' = 'iceberg');

-- Enable both Iceberg and Hudi
ALTER TABLE table_name
SET TBLPROPERTIES ('delta.universalFormat.enabledFormats' = 'iceberg,hudi');
```

| Format | Use Case | Compatibility |
|--------|----------|---------------|
| Iceberg | Snowflake, Trino, Presto, Spark | Iceberg v2 |
| Hudi | Existing Hudi ecosystems | Hudi 0.14+ |

**Trade-offs**:

- Additional metadata storage overhead
- Slight write latency increase
- Enables cross-platform data sharing

### Identity Columns

Auto-generate unique sequential IDs for new rows (Delta 3.3+).

```sql
-- GENERATED ALWAYS - system controls all values
CREATE TABLE orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY,
    customer_id INT,
    amount DOUBLE
) USING DELTA;

-- GENERATED BY DEFAULT - allows manual override
CREATE TABLE orders (
    order_id BIGINT GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 1),
    customer_id INT,
    amount DOUBLE
) USING DELTA;
```

| Option | Behavior |
|--------|----------|
| `GENERATED ALWAYS` | System generates all values, manual insert fails |
| `GENERATED BY DEFAULT` | System generates if not provided, allows override |
| `START WITH` | Initial value |
| `INCREMENT BY` | Step between values |

**Use cases**: Surrogate keys, audit sequences, replacing sequences from source systems.

### VACUUM LITE

Faster file cleanup using transaction log analysis (Delta 3.3+).

```sql
-- VACUUM LITE uses transaction log for faster cleanup
VACUUM table_name LITE;

-- Still supports retention
VACUUM table_name LITE RETAIN 168 HOURS;
```

| Aspect | Standard VACUUM | VACUUM LITE |
|--------|-----------------|-------------|
| Performance | Slower (file listing) | 5-10x faster |
| Method | Lists all files | Uses transaction log |
| Best for | Occasional cleanup | Frequent cleanup |

### Row Tracking

Track row-level lineage across table versions (Delta 3.2+).

```sql
-- Enable row tracking on new table
CREATE TABLE table_name (...)
USING DELTA
TBLPROPERTIES ('delta.enableRowTracking' = 'true');

-- Enable on existing table (requires backfill)
ALTER TABLE table_name
SET TBLPROPERTIES ('delta.enableRowTracking' = 'true');
```

Row tracking adds hidden columns:

- `_row_id` - Stable identifier for each row
- `_row_commit_version` - Version when row was last modified

**Use cases**: Audit trails, CDC verification, debugging data lineage.

### Liquid Clustering Deep Dive

Expanding on Liquid Clustering for modern workloads:

#### Migration from ZORDER

```sql
-- Step 1: Check current ZORDER usage
DESCRIBE HISTORY table_name;

-- Step 2: Enable Liquid Clustering (replaces ZORDER)
ALTER TABLE table_name CLUSTER BY (col1, col2);

-- Step 3: Trigger initial clustering
OPTIMIZE table_name;
```

#### Liquid Clustering vs ZORDER vs Partitioning

| Feature | Partitioning | ZORDER | Liquid Clustering |
|---------|--------------|--------|-------------------|
| Column cardinality | Low | High | Any |
| Column changes | Requires rewrite | Requires rewrite | Incremental |
| Optimization | N/A | Manual OPTIMIZE | Automatic |
| Skipping | Partition pruning | Data skipping | Data skipping |
| Best for | Date, region | Customer ID, SKU | Evolving queries |

```sql
-- Liquid Clustering with OPTIMIZE still works
OPTIMIZE table_name;  -- Applies clustering

-- Check clustering columns
DESCRIBE DETAIL table_name;
```

## Use Cases

| Scenario | Recommended Operation | Why? |
|----------|-----------------------|------|
| **GDPR Compliance (Right to be Forgotten)** | `DELETE` + `VACUUM` | Removes PII from current table and history (physical deletion). |
| **Daily Full Refresh** | `overwrite` or `replaceWhere` | Efficiently replaces data without deleting table schema/history. |
| **Slow Filter Queries** | `OPTIMIZE` + `ZORDER` | Co-locates data to enable efficient data skipping. |
| **Handling Late Arriving Data** | `MERGE` | Updates existing records or inserts new ones based on keys. |

## Common Issues & Errors

### 1. "Multiple matches" in MERGE
**Scenario:** Source table has duplicate keys matching a single target row.

**Fix:** Deduplicate the source data before running MERGE.

### 2. Time Travel Fails ("File not found")
**Scenario:** Trying to query an old version after VACUUM has run.

**Fix:** Increase retention duration if longer history is needed, but accept higher storage costs.

### 3. ZORDER Effectiveness Low
**Scenario:** Z-ordering on too many columns (e.g., > 5) or low-cardinality columns.

**Fix:** Limit ZORDER to 1-4 high-cardinality columns frequently used in WHERE clauses.

### 4. VACUUM 0 Hours Data Loss
**Scenario:** User disabled safety check and ran `VACUUM RETAIN 0 HOURS`.

**Fix:** **Irreversible**. Recover from deep clone or backup if available. Never do this in production.

## Exam Tips

1. **VACUUM default is 168 hours (7 days)** - This is frequently tested
2. **MERGE WHEN MATCHED** can have multiple conditions with different actions
3. **ZORDER** columns should be high cardinality and used in WHERE clauses
4. **Time travel** requires files to exist - VACUUM removes old files
5. **Shallow clone** shares data files; **deep clone** copies them
6. **Auto Optimize** has two settings: `optimizeWrite` and `autoCompact`
7. **RESTORE** creates a new version, doesn't delete history
8. **Deletion vectors** are default on DBR 14.x+ - faster DELETE/UPDATE/MERGE
9. **Liquid Clustering** replaces ZORDER for evolving query patterns
10. **UniForm** enables reading Delta as Iceberg/Hudi for cross-platform sharing
11. **Predictive Optimization** auto-schedules OPTIMIZE and VACUUM

## Best Practices

- Run OPTIMIZE on partitions with many small files
- Use ZORDER on 1-4 high-cardinality filter columns
- Schedule VACUUM to run regularly but keep 7+ days retention
- Use shallow clones for testing, deep clones for backups
- Enable auto optimize for streaming or frequent small writes
- Compute statistics after large data loads for better query plans

## Related Topics

- [Change Data Capture](05-change-data-capture.md) - MERGE generates CDF records
- [Data Deduplication](07-data-deduplication.md) - MERGE for dedup patterns
- [Delta Lake Commands Cheat Sheet](../cheat-sheets/delta-lake-commands.md)

## Official Documentation

- [Delta Lake MERGE](https://docs.databricks.com/delta/merge.html)
- [Delta Lake OPTIMIZE](https://docs.databricks.com/delta/optimize.html)
- [Delta Lake VACUUM](https://docs.databricks.com/delta/vacuum.html)
- [Delta Lake Time Travel](https://docs.databricks.com/delta/history.html)

---
title: Batch ETL Pipelines — Part 2
type: topic
tags:
  - data-engineering
  - batch
  - etl
status: published
---

# Batch ETL Pipelines — Part 2

This part covers performance optimization techniques (Photon, DPP, AQE, partition pruning), error handling patterns, use cases, and exam tips for batch ETL pipelines.

> For DataFrame transformations, joins, aggregations, window functions, and write operations, see [Part 1](./01-batch-etl-pipelines-part1.md).

## Performance Optimization

### Photon Engine

Photon is Databricks' native vectorized query engine written in C++ for faster SQL and DataFrame operations.

```python

# Photon is enabled at cluster level, not via code
# Check if Photon is active

spark.conf.get("spark.databricks.photon.enabled")
```

| Workload | Photon Benefit |
|----------|----------------|
| Joins | High - vectorized hash joins |
| Aggregations | High - SIMD operations |
| Filters | High - predicate pushdown |
| Scans | High - optimized Parquet/Delta reads |
| Python UDFs | None - not accelerated |
| Complex nested types | Limited |

**Photon Limitations**:

- Python/Scala UDFs not accelerated (runs in fallback mode)
- Some window functions not fully supported
- Certain complex data types may fall back to Spark

**When to use Photon**:

- SQL-heavy workloads with joins and aggregations
- Large scan operations on Delta/Parquet
- Filter-heavy queries

### Dynamic Partition Pruning (DPP)

DPP optimizes joins by pushing partition filters from one side of the join to the other.

```sql
-- DPP applies automatically in queries like this:
SELECT f.*
FROM fact_sales f
JOIN dim_date d ON f.date_key = d.date_key
WHERE d.year = 2024;
-- Spark pushes year=2024 filter to fact_sales scan
```

```python
# Check DPP configuration

spark.conf.get("spark.sql.optimizer.dynamicPartitionPruning.enabled")  # true by default

# Disable if causing issues (rare)

spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.enabled", "false")
```

| Condition | DPP Applied? |
|-----------|--------------|
| Join on partition column | Yes |
| Broadcast join | Yes (most effective) |
| Sort-merge join | Yes (with subquery) |
| Filter on dimension table | Triggers DPP |

### Adaptive Query Execution (AQE)

AQE optimizes queries at runtime based on actual data statistics.

```python
# AQE is enabled by default in Databricks

spark.conf.get("spark.sql.adaptive.enabled")  # true

# Key AQE features

spark.conf.get("spark.sql.adaptive.coalescePartitions.enabled")  # Reduce partitions
spark.conf.get("spark.sql.adaptive.skewJoin.enabled")  # Handle skew
spark.conf.get("spark.sql.adaptive.localShuffleReader.enabled")  # Optimize shuffles
```

| AQE Feature | Behavior |
|-------------|----------|
| Coalesce partitions | Reduces small partitions after shuffle |
| Skew join handling | Splits skewed partitions automatically |
| Join strategy switch | Changes join type based on actual sizes |
| Local shuffle reader | Avoids shuffle when possible |

```python
# Configure shuffle partitions (AQE adjusts automatically)

spark.conf.set("spark.sql.shuffle.partitions", "auto")  # Let AQE decide

# Or set initial value that AQE can reduce

spark.conf.set("spark.sql.shuffle.partitions", "200")
```

### Broadcast Join Optimization

```python
from pyspark.sql.functions import broadcast

# Force broadcast for small tables

result = large_df.join(broadcast(small_df), "key")

# Check/set broadcast threshold (default 10MB)

spark.conf.get("spark.sql.autoBroadcastJoinThreshold")  # 10485760 (10MB)

# Increase for larger dimension tables

spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "50MB")

# Disable auto broadcast (force sort-merge)

spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")
```

```sql
-- SQL broadcast hint
SELECT /*+ BROADCAST(dim_product) */ *
FROM fact_sales f
JOIN dim_product p ON f.product_id = p.product_id;
```

### Partition Pruning Best Practices

```python
# Good: Filter on partition column - triggers partition pruning

df = spark.read.format("delta").load("/path/to/table")
filtered = df.filter(col("date") == "2024-01-15")  # Only reads one partition

# Bad: Filter after load without pushdown

df = spark.read.format("delta").load("/path/to/table")
filtered = df.filter(col("date").cast("string") == "2024-01-15")  # May scan all partitions
```

| Pattern | Partition Pruning? |
|---------|-------------------|
| `col("date") == "2024-01-15"` | Yes |
| `col("date") >= "2024-01-01"` | Yes |
| `col("date").cast("string") == "2024-01-15"` | No (function on column) |
| `year(col("date")) == 2024` | No (function on column) |

## Error Handling

### Try-Catch Pattern

```python
try:
    df = spark.read.format("delta").load("/path/to/table")
    # Process data
    result = df.filter(col("status") == "active")
    result.write.format("delta").mode("overwrite").save("/output/path")
except AnalysisException as e:
    print(f"Table not found: {e}")
except Exception as e:
    print(f"Processing error: {e}")
    raise
```

### Data Quality Checks

```python
# Assert row count

row_count = df.count()
assert row_count > 0, "DataFrame is empty"

# Check for nulls in critical columns

null_count = df.filter(col("id").isNull()).count()
assert null_count == 0, f"Found {null_count} null IDs"

# Validate schema

expected_columns = {"id", "name", "amount"}
actual_columns = set(df.columns)
assert expected_columns.issubset(actual_columns), "Missing required columns"
```

## Use Cases

Understanding when to apply specific techniques is crucial for the exam and real-world engineering.

### Ingestion & Reading

| Scenario | Recommended Technique | Why? |
|----------|----------------------|------|
| **Daily Batch Processing** | Standard `spark.read` with Schema | Explicit schemas prevent drift and ensure data quality. |
| **Corrupt Data Handling** | `PERMISSIVE` mode + `_corrupt_record` column | Allows pipeline to continue processing valid data while capturing bad records for later analysis. |
| **Small Reference Data** | Cache or Broadcast | faster access during lookups. |

### Transformations & Performance

| Scenario | Recommended Technique | Why? |
|----------|----------------------|------|
| **Complex Math/Logic** | Built-in Spark Functions | Significantly faster than UDFs due to Catalyst optimization. |
| **Custom Complex Logic** | Pandas UDF (Vectorized) | Better performance than standard Python UDFs for row-by-row operations. |
| **Joins with Small Tables (<10MB)** | Broadcast Join | Avoids shuffling large tables across the network. |
| **Joins with Large/Skewed Data** | AQE (Adaptive Query Execution) | Automatically handles skew and optimizes join strategies at runtime. |
| **Filtering Large Datasets** | Partition Pruning (Filter on Partition Key) | Skips scanning irrelevant files/partitions. |

### Aggregation & De-duplication

| Scenario | Recommended Technique | Why? |
|----------|----------------------|------|
| **Latest Record per Key** | Window `row_number()` | Flexible way to pick the "latest" based on any ordering column. |
| **Running Totals** | Window `sum()` with `rowsBetween` | Efficiently calculates cumulative sums without self-joins. |
| **Pivot Reports** | `groupBy().pivot()` | Transforms unique column values into columns for reporting. |

### Writing & Loading

| Scenario | Recommended Technique | Why? |
|----------|----------------------|------|
| **Full Table Refresh** | `overwrite` mode | Completely replaces target table. |
| **Daily Incremental Load** | `append` mode | Adds new records to the end of the table. |
| **Reprocessing Specific Dates** | Dynamic Partition Overwrite | Safely overwrites only the partitions being touched by the current job, preserving others. |

## Common Issues & Errors

### AnalysisException: Path does not exist

**Scenario:** Reading from a path that hasn't been created yet.

**Fix:** Use `dbutils.fs.ls()` to verify path or use `try-catch` block.

**Exam Context:** Trick questions often omit the check for file existence before reading.

### OutOfMemoryError: Java heap space during specific transformation

**Scenario:** Calling `.collect()` on a large DataFrame or broadcasting a table larger than the driver's memory.

**Fix:** Remove `.collect()` (use `.take()` or `.show()` instead) or increase broadcast threshold/disable broadcast.

**Exam Context:** Identifying the specific line causing OOM (usually an action that brings data to the driver).

### Skew Join (Slow Stages/Stragglers)

**Scenario:** One task takes significantly longer than others during a join (e.g., specific keys have millions of records while others have few).

**Fix:** Enable checking `spark.sql.adaptive.skewJoin.enabled` (default true) or use "salting" technique (manually add a random key).

**Exam Context:** Identifying "straggler tasks" as a symptom of data skew.

### NullPointerException in UDFs

**Scenario:** Python UDF fails on null input because it assumes a value exists.

**Fix:** Explicitly handle `None` in Python code or use `df.na.fill()` before calling the UDF.

### Cartesian Product (Cross Join)

**Scenario:** Accidental cross join when join conditions are missing or incorrect.

**Fix:** Ensure join keys are specified correctly. If intentional, set `spark.sql.crossJoin.enabled` to true.

**Exam Context:** Queries that run forever or produce massive output unexpectedly.

### Small File Problem

**Scenario:** Writing too many small files (e.g., using `partitionBy` on a high-cardinality column like `timestamp`).

**Fix:** choosing a lower cardinality partition column (like `date`) or using `OPTIMIZE` / Auto Optimize.

## Best Practices

- Define schemas explicitly instead of using `inferSchema`
- Use built-in functions instead of UDFs when possible
- Broadcast small dimension tables for faster joins
- Partition large tables by date or other common filter columns
- Use `replaceWhere` for efficient partition overwrites
- Always handle null values explicitly

## Exam Tips

1. **Know all join types** - especially left_anti and left_semi
2. **Window functions** - row_number vs rank vs dense_rank behavior with ties
3. **Write modes** - what happens with each mode when data exists
4. **Broadcast joins** - default threshold is 10MB
5. **Corrupt record handling** - PERMISSIVE, DROPMALFORMED, FAILFAST
6. **Pandas UDFs** are faster than regular Python UDFs
7. **Partition pruning** - filter on partition columns for performance
8. **Photon** accelerates joins/aggregations but not UDFs
9. **AQE** handles skew and optimizes joins at runtime
10. **DPP** pushes filters from dimension to fact tables automatically

## Key Takeaways

- **Photon** accelerates SQL joins, aggregations, filters, and scans but provides no speedup for Python/Scala UDFs
- **AQE** (`spark.sql.adaptive.enabled=true` by default) handles skew joins, coalesces small partitions, and switches join strategies at runtime based on actual data statistics
- **DPP** automatically pushes partition filters from a dimension table to a fact table during joins, requiring the join to be on a partition column
- **Broadcast join** threshold default is 10 MB (`spark.sql.autoBroadcastJoinThreshold`); use `broadcast()` hint or increase the threshold for larger dimension tables
- **Partition pruning** only works when filtering directly on a partition column; applying functions (e.g., `year(col("date"))`) prevents pruning
- **Dynamic Partition Overwrite** (`.option("partitionOverwriteMode","dynamic")`) rewrites only touched partitions, preserving untouched partitions in the same table
- **Corrupt record modes**: `PERMISSIVE` (default, stores bad records in `_corrupt_record`), `DROPMALFORMED`, `FAILFAST`
- **Pandas UDFs** (vectorized) outperform standard Python row-at-a-time UDFs and are the recommended choice when custom logic is unavoidable

## Related Topics

- [Delta Lake Operations](./04-delta-lake-operations-part1.md) - MERGE for upserts
- [Data Deduplication](../03-data-transformation-cleansing-quality/02-data-deduplication.md) - Dedup strategies
- [SQL Functions Cheat Sheet](../../../shared/cheat-sheets/sql-functions.md)

## Official Documentation

- [Spark SQL Guide](https://spark.apache.org/docs/latest/sql-programming-guide.html)
- [Databricks DataFrame Guide](https://docs.databricks.com/spark/latest/dataframes-datasets/index.html)
- [Delta Lake Write Operations](https://docs.databricks.com/delta/delta-batch.html)

---

**[← Previous: Batch ETL Pipelines — Part 1](./01-batch-etl-pipelines-part1.md) | [↑ Back to Data Processing](./README.md) | [Next: Incremental Processing](./02-incremental-processing.md) →**

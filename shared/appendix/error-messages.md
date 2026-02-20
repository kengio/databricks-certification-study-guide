---
tags: [errors, troubleshooting, reference, data-engineering]
---

# Common Error Messages and Solutions

## Delta Lake Errors

### VACUUM Retention Error

```text
VACUUM cannot delete files more recent than 168 hours
```text

**Cause**: Attempting to VACUUM with retention less than default 7 days.

**Solution**:

```sql
-- Option 1: Use longer retention
VACUUM table_name RETAIN 168 HOURS;

-- Option 2: Disable safety check (dangerous!)
SET spark.databricks.delta.retentionDurationCheck.enabled = false;
VACUUM table_name RETAIN 0 HOURS;
```text

### Schema Mismatch Error

```text
A schema mismatch detected when writing to the Delta table
```text

**Cause**: Incoming data schema doesn't match table schema.

**Solution**:

```python
# Option 1: Enable schema evolution
df.write.option("mergeSchema", "true").format("delta").mode("append").save(path)

# Option 2: Overwrite schema
df.write.option("overwriteSchema", "true").format("delta").mode("overwrite").save(path)
```text

### Concurrent Write Conflict

```text
ConcurrentAppendException: Files were added to the table by a concurrent update
```text

**Cause**: Multiple writers modifying the same partition/files.

**Solution**:

- Use isolation level settings
- Implement retry logic
- Consider partitioning strategy

```python
# Retry logic
from delta.exceptions import ConcurrentAppendException
import time

max_retries = 3
for attempt in range(max_retries):
    try:
        df.write.format("delta").mode("append").save(path)
        break
    except ConcurrentAppendException:
        time.sleep(2 ** attempt)
```text

### Time Travel Version Not Found

```text
The requested version X does not exist
```text

**Cause**: Version has been removed by VACUUM or doesn't exist.

**Solution**:

```sql
-- Check available versions
DESCRIBE HISTORY table_name;

-- Use available version
SELECT * FROM table_name VERSION AS OF <available_version>;
```text

## Streaming Errors

### Checkpoint Incompatibility

```text
The checkpoint of your query is incompatible with the current version
```text

**Cause**: Query structure changed after checkpoint was created.

**Solution**:

1. Delete checkpoint directory
2. Restart stream from scratch
3. Or: Reprocess from beginning with new checkpoint location

### Missing Checkpoint Location

```text
checkpointLocation must be specified
```text

**Solution**:

```python
(df.writeStream
    .option("checkpointLocation", "/path/to/checkpoint")
    .format("delta")
    .start())
```text

### Watermark Required for State

```text
Streaming aggregation requires watermark for state cleanup
```text

**Solution**:

```python
(df.withWatermark("event_time", "10 minutes")
    .groupBy(window("event_time", "5 minutes"))
    .count())
```text

## Auto Loader Errors

### Schema Location Required

```text
'cloudFiles.schemaLocation' must be specified
```text

**Solution**:

```python
(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/path/to/schema")
    .load("/data/path"))
```text

### Schema Evolution Rescue

```text
Found new columns that cannot be added to schema
```text

**Solution**:

```python
# Use rescue column for unexpected data
(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaEvolutionMode", "rescue")
    .option("cloudFiles.schemaLocation", "/schema")
    .load("/data"))
```text

## Unity Catalog Errors

### Permission Denied

```text
User does not have privilege SELECT on table
```text

**Solution**:

```sql
-- Grant permission
GRANT SELECT ON TABLE catalog.schema.table TO `user@email.com`;

-- Check current grants
SHOW GRANTS ON TABLE catalog.schema.table;
```text

### Catalog Not Found

```text
Catalog 'catalog_name' not found
```text

**Solution**:

```sql
-- List available catalogs
SHOW CATALOGS;

-- Create if needed (requires admin)
CREATE CATALOG catalog_name;

-- Use correct catalog
USE CATALOG correct_catalog_name;
```text

### External Location Permission

```text
User does not have permission to access external location
```text

**Solution**:

```sql
GRANT READ FILES ON EXTERNAL LOCATION location_name TO `user@email.com`;
GRANT WRITE FILES ON EXTERNAL LOCATION location_name TO `user@email.com`;
```text

## Spark Errors

### Out of Memory

```text
java.lang.OutOfMemoryError: Java heap space
```text

**Solutions**:

1. Increase executor memory
2. Reduce data per partition
3. Cache strategically
4. Use disk-based shuffle

```python
# Increase partitions to reduce per-partition memory
spark.conf.set("spark.sql.shuffle.partitions", 500)

# Spill to disk
spark.conf.set("spark.memory.fraction", 0.4)
```text

### Task Serialization Error

```text
org.apache.spark.SparkException: Task not serializable
```text

**Cause**: Non-serializable object used in transformation.

**Solution**:

```python
# Bad: Using non-serializable object
connection = get_db_connection()
df.map(lambda x: connection.query(x))  # Error!

# Good: Create connection inside transformation
def process_row(row):
    connection = get_db_connection()
    return connection.query(row)

df.map(process_row)
```text

### Shuffle Block Fetch Failure

```text
FetchFailedException: Failed to fetch block
```text

**Causes**: Network issues, executor failures, memory pressure.

**Solutions**:

```python
# Increase retry attempts
spark.conf.set("spark.shuffle.io.maxRetries", 10)
spark.conf.set("spark.shuffle.io.retryWait", "30s")

# Reduce shuffle block size
spark.conf.set("spark.sql.shuffle.partitions", 1000)
```text

## DLT/Lakeflow Errors

### Expectation Failure

```text
Pipeline stopped due to expectation violation
```text

**Cause**: Data failed `EXPECT...ON VIOLATION FAIL UPDATE` constraint.

**Solution**:

1. Check event logs for failed records
2. Fix source data or adjust expectation
3. Change to `DROP ROW` if failures are acceptable

### Circular Dependency

```text
Circular dependency detected in pipeline
```text

**Solution**: Review and remove table dependencies that form cycles.

## Common Solutions Summary

| Error Type  | First Step             |
| ----------- | ---------------------- |
| Permission  | Check SHOW GRANTS      |
| Schema      | Enable mergeSchema     |
| Memory      | Increase partitions    |
| Checkpoint  | Delete and restart     |
| Concurrency | Add retry logic        |
| Time Travel | Check DESCRIBE HISTORY |

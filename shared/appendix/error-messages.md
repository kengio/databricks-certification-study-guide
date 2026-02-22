---
tags: [errors, troubleshooting, reference, data-engineering, ml, genai]
---

# Common Error Messages and Solutions

## Delta Lake Errors

### VACUUM Retention Error

```text
VACUUM cannot delete files more recent than 168 hours
```

**Cause**: Attempting to VACUUM with retention less than default 7 days.

**Solution**:

```sql
-- Option 1: Use longer retention
VACUUM table_name RETAIN 168 HOURS;

-- Option 2: Disable safety check (dangerous!)
SET spark.databricks.delta.retentionDurationCheck.enabled = false;
VACUUM table_name RETAIN 0 HOURS;
```

### Schema Mismatch Error

```text
A schema mismatch detected when writing to the Delta table
```

**Cause**: Incoming data schema doesn't match table schema.

**Solution**:

```python
# Option 1: Enable schema evolution
df.write.option("mergeSchema", "true").format("delta").mode("append").save(path)

# Option 2: Overwrite schema
df.write.option("overwriteSchema", "true").format("delta").mode("overwrite").save(path)
```

### Concurrent Write Conflict

```text
ConcurrentAppendException: Files were added to the table by a concurrent update
```

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
```

### Time Travel Version Not Found

```text
The requested version X does not exist
```

**Cause**: Version has been removed by VACUUM or doesn't exist.

**Solution**:

```sql
-- Check available versions
DESCRIBE HISTORY table_name;

-- Use available version
SELECT * FROM table_name VERSION AS OF <available_version>;
```

## Streaming Errors

### Checkpoint Incompatibility

```text
The checkpoint of your query is incompatible with the current version
```

**Cause**: Query structure changed after checkpoint was created.

**Solution**:

1. Delete checkpoint directory
2. Restart stream from scratch
3. Or: Reprocess from beginning with new checkpoint location

### Missing Checkpoint Location

```text
checkpointLocation must be specified
```

**Solution**:

```python
(df.writeStream
    .option("checkpointLocation", "/path/to/checkpoint")
    .format("delta")
    .start())
```

### Watermark Required for State

```text
Streaming aggregation requires watermark for state cleanup
```

**Solution**:

```python
(df.withWatermark("event_time", "10 minutes")
    .groupBy(window("event_time", "5 minutes"))
    .count())
```

## Auto Loader Errors

### Schema Location Required

```text
'cloudFiles.schemaLocation' must be specified
```

**Solution**:

```python
(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/path/to/schema")
    .load("/data/path"))
```

### Schema Evolution Rescue

```text
Found new columns that cannot be added to schema
```

**Solution**:

```python
# Use rescue column for unexpected data
(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaEvolutionMode", "rescue")
    .option("cloudFiles.schemaLocation", "/schema")
    .load("/data"))
```

## Unity Catalog Errors

### Permission Denied

```text
User does not have privilege SELECT on table
```

**Solution**:

```sql
-- Grant permission
GRANT SELECT ON TABLE catalog.schema.table TO `user@email.com`;

-- Check current grants
SHOW GRANTS ON TABLE catalog.schema.table;
```

### Catalog Not Found

```text
Catalog 'catalog_name' not found
```

**Solution**:

```sql
-- List available catalogs
SHOW CATALOGS;

-- Create if needed (requires admin)
CREATE CATALOG catalog_name;

-- Use correct catalog
USE CATALOG correct_catalog_name;
```

### External Location Permission

```text
User does not have permission to access external location
```

**Solution**:

```sql
GRANT READ FILES ON EXTERNAL LOCATION location_name TO `user@email.com`;
GRANT WRITE FILES ON EXTERNAL LOCATION location_name TO `user@email.com`;
```

## Spark Errors

### Out of Memory

```text
java.lang.OutOfMemoryError: Java heap space
```

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
```

### Task Serialization Error

```text
org.apache.spark.SparkException: Task not serializable
```

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
```

### Shuffle Block Fetch Failure

```text
FetchFailedException: Failed to fetch block
```

**Causes**: Network issues, executor failures, memory pressure.

**Solutions**:

```python
# Increase retry attempts
spark.conf.set("spark.shuffle.io.maxRetries", 10)
spark.conf.set("spark.shuffle.io.retryWait", "30s")

# Reduce shuffle block size
spark.conf.set("spark.sql.shuffle.partitions", 1000)
```

## DLT/Lakeflow Errors

### Expectation Failure

```text
Pipeline stopped due to expectation violation
```

**Cause**: Data failed `EXPECT...ON VIOLATION FAIL UPDATE` constraint.

**Solution**:

1. Check event logs for failed records
2. Fix source data or adjust expectation
3. Change to `DROP ROW` if failures are acceptable

### Circular Dependency

```text
Circular dependency detected in pipeline
```

**Solution**: Review and remove table dependencies that form cycles.

## MLflow and Model Registry Errors

### Wrong Registry URI

```text
MlflowException: No such model version found
```

**Cause**: Using workspace registry URI when model is registered in Unity Catalog (or vice versa).

**Solution**:

```python
import mlflow

# For Unity Catalog models
mlflow.set_registry_uri("databricks-uc")
client = mlflow.tracking.MlflowClient(registry_uri="databricks-uc")

# For workspace registry (legacy)
mlflow.set_registry_uri("databricks")
```

### Model Signature Mismatch

```text
MlflowException: Incompatible input types for the model signature
```

**Cause**: Input DataFrame schema does not match the model's logged signature.

**Solution**:

```python
# Check model signature
import mlflow.pyfunc
model = mlflow.pyfunc.load_model("models:/catalog.schema.model@champion")
print(model.metadata.signature)

# Ensure input matches expected schema
# Cast columns if needed before calling predict()
```

### Alias Not Found

```text
MlflowException: Registered model alias 'champion' not found
```

**Cause**: The `@champion` alias has not been assigned to any version yet.

**Solution**:

```python
from mlflow import MlflowClient
client = MlflowClient(registry_uri="databricks-uc")

client.set_registered_model_alias(
    name="catalog.schema.model_name",
    alias="champion",
    version="1",
)
```

## Model Serving Errors

### Wrong Payload Format

```text
{"error_code": "BAD_REQUEST", "message": "Failed to parse request"}
```

**Cause**: Request body does not match the expected serving input format.

**Solution**:

```python
import requests

# Correct format for pyfunc models
payload = {
    "dataframe_records": [
        {"feature1": 1.0, "feature2": "value"}
    ]
}

# Or for tensor-based models
payload = {
    "inputs": [[1.0, 2.0, 3.0]]
}
```

### Scale-to-Zero Cold Start Timeout

```text
{"error_code": "REQUEST_TIMEOUT", "message": "Endpoint is initializing"}
```

**Cause**: Endpoint scaled to zero and the first request arrived before warm-up completed.

**Solution**:

- Disable scale-to-zero for latency-sensitive or canary test endpoints
- Implement client-side retry with exponential backoff

```python
from databricks.sdk.service.serving import ServedModelInput

ServedModelInput(
    scale_to_zero_enabled=False,  # Keep warm for SLA compliance
    ...
)
```

### Endpoint Config Update Conflict

```text
{"error_code": "RESOURCE_CONFLICT", "message": "Endpoint is being updated"}
```

**Cause**: Attempting to update endpoint configuration while a previous update is in progress.

**Solution**: Poll endpoint state and wait for `READY` status before applying the next update.

## Vector Search and GenAI Errors

### Vector Index Not Ready

```text
DatabricksError: Vector search index is not in READY state
```

**Cause**: Index creation or sync is still in progress.

**Solution**:

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()
index = vsc.get_index(endpoint_name="my_endpoint", index_name="catalog.schema.index")

# Wait for READY state before querying
index.describe()  # Check state field
```

### CDF Not Enabled for Delta Sync Index

```text
DatabricksError: Change Data Feed must be enabled on the source Delta table
```

**Cause**: Attempting to create a `DELTA_SYNC` vector index on a table without CDF enabled.

**Solution**:

```sql
ALTER TABLE catalog.schema.my_table
SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');
```

### Embedding Dimension Mismatch

```text
DatabricksError: Query vector dimension (768) does not match index dimension (1536)
```

**Cause**: Query was embedded with a different model than the one used to build the index.

**Solution**: Always use the same embedding model for indexing and querying. Never change the embedding model on an existing index; rebuild the index instead.

### Foundation Model API Rate Limit

```text
{"error_code": "TOO_MANY_REQUESTS", "message": "Rate limit exceeded"}
```

**Solution**:

- Implement exponential backoff with jitter
- Use provisioned throughput for production workloads with guaranteed QPS
- Batch embedding requests to reduce call volume

## Common Solutions Summary

| Error Type          | First Step                      |
| ------------------- | ------------------------------- |
| Permission          | Check SHOW GRANTS               |
| Schema              | Enable mergeSchema              |
| Memory              | Increase partitions             |
| Checkpoint          | Delete and restart              |
| Concurrency         | Add retry logic                 |
| Time Travel         | Check DESCRIBE HISTORY          |
| Wrong registry      | Set `mlflow.set_registry_uri()` |
| Model signature     | Print and match `model.metadata.signature` |
| Scale-to-zero cold start | Disable `scale_to_zero_enabled` |
| Vector index not ready | Wait for `READY` state; enable CDF |
| Embedding mismatch  | Use same model for index and query |

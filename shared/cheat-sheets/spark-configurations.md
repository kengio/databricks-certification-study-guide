---
tags: [cheat-sheet, spark, performance, data-engineering]
---

# Spark Configurations Cheat Sheet

## Setting Configurations

```python
# In notebook
spark.conf.set("spark.sql.shuffle.partitions", 200)

# Get current value
spark.conf.get("spark.sql.shuffle.partitions")

# In cluster config (spark_conf)
spark.sql.shuffle.partitions 200
```

```sql
-- SQL
SET spark.sql.shuffle.partitions = 200;
```

## Shuffle & Partitioning

| Configuration                         | Default     | Description                            |
| ------------------------------------- | ----------- | -------------------------------------- |
| `spark.sql.shuffle.partitions`        | 200         | Number of partitions for shuffles      |
| `spark.sql.files.maxPartitionBytes`   | 128MB       | Max bytes per partition when reading   |
| `spark.sql.files.minPartitionNum`     | None        | Min partitions when reading            |
| `spark.default.parallelism`           | Total cores | Default parallelism for RDD operations |

```python
# Reduce shuffle partitions for small data
spark.conf.set("spark.sql.shuffle.partitions", 50)

# Increase for large data
spark.conf.set("spark.sql.shuffle.partitions", 500)
```

## Adaptive Query Execution (AQE)

| Configuration                                                   | Default | Description                       |
| --------------------------------------------------------------- | ------- | --------------------------------- |
| `spark.sql.adaptive.enabled`                                    | true    | Enable AQE                        |
| `spark.sql.adaptive.coalescePartitions.enabled`                 | true    | Auto-coalesce shuffle partitions  |
| `spark.sql.adaptive.coalescePartitions.minPartitionSize`        | 1MB     | Min partition size after coalesce |
| `spark.sql.adaptive.skewJoin.enabled`                           | true    | Handle skewed joins               |
| `spark.sql.adaptive.skewJoin.skewedPartitionFactor`             | 5       | Skew detection factor             |
| `spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes`   | 256MB   | Skew threshold                    |
| `spark.sql.adaptive.autoBroadcastJoinThreshold`                 | 30MB    | Auto broadcast threshold          |

```python
# Enable AQE (usually already enabled)
spark.conf.set("spark.sql.adaptive.enabled", "true")

# Aggressive partition coalescing
spark.conf.set("spark.sql.adaptive.coalescePartitions.minPartitionSize", "4MB")
```

## Broadcast Join

| Configuration                           | Default | Description              |
| --------------------------------------- | ------- | ------------------------ |
| `spark.sql.autoBroadcastJoinThreshold`  | 10MB    | Auto broadcast threshold |

```python
# Increase broadcast threshold
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "50MB")

# Disable auto broadcast
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")
```

```python
# Force broadcast hint
from pyspark.sql.functions import broadcast
df1.join(broadcast(df2), "key")
```

## Delta Lake Configurations

| Configuration                                                      | Default | Description                 |
| ------------------------------------------------------------------ | ------- | --------------------------- |
| `spark.databricks.delta.optimizeWrite.enabled`                     | true    | Optimize write file sizes   |
| `spark.databricks.delta.autoCompact.enabled`                       | false   | Auto-compact after writes   |
| `spark.databricks.delta.schema.autoMerge.enabled`                  | false   | Auto schema evolution       |
| `spark.databricks.delta.properties.defaults.enableChangeDataFeed`  | false   | Default CDF for new tables  |

```python
# Enable auto-optimize
spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
spark.conf.set("spark.databricks.delta.autoCompact.enabled", "true")

# Enable schema evolution
spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")
```

## File Sizes

| Configuration                                    | Default | Description                    |
| ------------------------------------------------ | ------- | ------------------------------ |
| `spark.databricks.delta.optimizeWrite.fileSize`  | 128MB   | Target file size for streaming |
| `spark.databricks.delta.optimize.maxFileSize`    | 1GB     | Max file size after OPTIMIZE   |
| `spark.databricks.delta.optimize.minFileSize`    | 1GB     | Target file size for OPTIMIZE  |

## Memory & Execution

| Configuration                   | Default | Description                    |
| ------------------------------- | ------- | ------------------------------ |
| `spark.executor.memory`         | 1g      | Executor memory                |
| `spark.driver.memory`           | 1g      | Driver memory                  |
| `spark.memory.fraction`         | 0.6     | Fraction for execution/storage |
| `spark.memory.storageFraction`  | 0.5     | Storage vs execution split     |

```python
# These are typically set at cluster level, not runtime
# spark.conf.set("spark.executor.memory", "4g")  # Won't work at runtime
```

## Caching

| Configuration                                     | Default | Description                     |
| ------------------------------------------------- | ------- | ------------------------------- |
| `spark.sql.inMemoryColumnarStorage.compressed`    | true    | Compress cached data            |
| `spark.sql.inMemoryColumnarStorage.batchSize`     | 10000   | Batch size for columnar caching |

```python
# Cache DataFrame
df.cache()  # or df.persist()

# Uncache
df.unpersist()

# Check if cached
df.is_cached
```

## Photon

| Configuration                      | Default       | Description          |
| ---------------------------------- | ------------- | -------------------- |
| `spark.databricks.photon.enabled`  | Cluster-level | Enable Photon engine |

Photon is enabled at the cluster level, not via spark.conf.

## Common Tuning Scenarios

### Small Data (< 1GB)

```python
spark.conf.set("spark.sql.shuffle.partitions", 8)
spark.conf.set("spark.sql.adaptive.coalescePartitions.minPartitionSize", "64MB")
```

### Large Data (> 100GB)

```python
spark.conf.set("spark.sql.shuffle.partitions", 2000)
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "-1")  # Disable broadcast
```

### Streaming Optimization

```python
spark.conf.set("spark.databricks.delta.optimizeWrite.enabled", "true")
spark.conf.set("spark.databricks.delta.optimizeWrite.fileSize", "128MB")
```

### Skewed Data

```python
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "128MB")
```

## Viewing Current Settings

```python
# All configurations
spark.sparkContext.getConf().getAll()

# Specific configuration
spark.conf.get("spark.sql.shuffle.partitions")

# SQL catalog configurations
spark.sql("SET").show(truncate=False)
```

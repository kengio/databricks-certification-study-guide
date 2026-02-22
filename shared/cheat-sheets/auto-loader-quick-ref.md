---
tags: [cheat-sheet, auto-loader, streaming, cloud-files, data-engineering]
---

# Auto Loader (Cloud Files) Quick Reference

Quick reference for Auto Loader (`cloudFiles`) — schema inference, evolution modes, file notification, metadata columns, and UC Volumes integration.

## Basic Syntax

```python
# Basic Auto Loader read
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/path/to/schema")
    .load("/path/to/source"))

# Write to Delta table
(df.writeStream
    .option("checkpointLocation", "/path/to/checkpoint")
    .trigger(availableNow=True)
    .toTable("catalog.schema.target_table"))
```

## Essential Options

| Option | Description | Required |
| :--- | :--- | :--- |
| `cloudFiles.format` | Source file format (`json`, `csv`, `parquet`, `avro`, `text`) | Yes |
| `cloudFiles.schemaLocation` | Path to store inferred schema | Yes (for inference) |
| `cloudFiles.schemaHints` | Override inferred column types | No |
| `cloudFiles.inferColumnTypes` | Infer types (default: all strings for JSON/CSV) | No |

```python
# With schema hints and type inference
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaHints", "id INT, timestamp TIMESTAMP")
    .load("/data/source"))
```

## Schema Evolution Modes

| Mode | Behavior | Use Case |
| :--- | :--- | :--- |
| `addNewColumns` | Add new columns automatically; rescue unparseable data | Production default |
| `rescue` | Put all unexpected data in `_rescued_data` column | Debug, preserve all data |
| `failOnNewColumns` | Fail stream on new columns | Strict schema enforcement |
| `none` | Ignore new columns silently | Fixed schema |

```python
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load("/data/source"))
```

### `_rescued_data` Column

`_rescued_data` (JSON string) captures data that cannot be parsed into the schema:

- Fields not present in the schema
- Type mismatches (e.g., string value for INT column)
- Unparseable records

Enable with `schemaEvolutionMode=rescue` or it appears automatically when `addNewColumns` can't map a field.

## Directory Listing vs File Notification

| Aspect | Directory Listing | File Notification |
| :--- | :--- | :--- |
| Setup | Automatic | Requires cloud config (SNS/SQS, Event Grid, Pub/Sub) |
| Scalability | Slows with many files | Constant-time lookup |
| Latency | Depends on list time | Near real-time |
| Cost | Free | Cloud notification costs |
| Best for | < 10K files/day | > 10K files/day |

```python
# File notification mode
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("cloudFiles.useNotifications", "true")
    .load("/data/source"))
```

## File Format Options

```python
# JSON (multi-line)
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("multiLine", "true")
    .load("/data/json/"))

# CSV
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "csv")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("header", "true")
    .option("sep", ",")
    .load("/data/csv/"))

# Parquet (no schema location needed — schema embedded)
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "parquet")
    .load("/data/parquet/"))
```

## Common Options Reference

| Option | Default | Description |
| :--- | :--- | :--- |
| `cloudFiles.format` | — | Source format (required) |
| `cloudFiles.schemaLocation` | — | Schema storage path |
| `cloudFiles.inferColumnTypes` | `false` | Infer types vs all-string defaults |
| `cloudFiles.schemaEvolutionMode` | `addNewColumns` | How to handle schema changes |
| `cloudFiles.useNotifications` | `false` | Use cloud event notifications |
| `cloudFiles.includeExistingFiles` | `true` | Process files already in directory |
| `cloudFiles.maxFilesPerTrigger` | `1000` | Files per micro-batch |
| `cloudFiles.maxBytesPerTrigger` | — | Bytes per micro-batch |
| `pathGlobFilter` | — | Filter files by glob pattern |
| `recursiveFileLookup` | `false` | Search subdirectories recursively |

## File Filtering

```python
# Only process JSON files
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("pathGlobFilter", "*.json")
    .load("/data/source"))

# Recursive subdirectory lookup
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "parquet")
    .option("recursiveFileLookup", "true")
    .load("/data/source"))
```

## Metadata Columns

```python
from pyspark.sql.functions import current_timestamp, col

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .load("/data/source")
    .select(
        "*",
        col("_metadata.file_path"),
        col("_metadata.file_name"),
        col("_metadata.file_size"),
        col("_metadata.file_modification_time")
    ))
```

| Metadata Column | Description |
| :--- | :--- |
| `_metadata.file_path` | Full path to source file |
| `_metadata.file_name` | File name only |
| `_metadata.file_size` | Size in bytes |
| `_metadata.file_modification_time` | Last modified timestamp |

## Unity Catalog Volumes Integration

```python
# Read from UC Volume — requires READ FILES privilege on volume
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation",
            "/Volumes/main/landing/schema_store")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load("/Volumes/main/landing/raw_events/"))

# Write to UC table with schema evolution
(df.select("*", current_timestamp().alias("ingestion_time"))
    .writeStream
    .option("checkpointLocation",
            "/Volumes/main/landing/checkpoints/events")
    .option("mergeSchema", "true")
    .trigger(availableNow=True)
    .toTable("main.bronze.events"))
```

## Complete Production Example

```python
from pyspark.sql.functions import current_timestamp, col

# Read with full options
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/mnt/checkpoints/schema")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("cloudFiles.useNotifications", "true")
    .option("cloudFiles.maxFilesPerTrigger", "1000")
    .load("/mnt/landing/events/"))

# Enrich with metadata and write
(df.select(
    "*",
    col("_metadata.file_path").alias("source_file"),
    current_timestamp().alias("ingestion_time")
).writeStream
    .format("delta")
    .option("checkpointLocation", "/mnt/checkpoints/events")
    .option("mergeSchema", "true")
    .trigger(availableNow=True)
    .toTable("bronze.events"))
```

## Exam Quick Facts

1. `cloudFiles.schemaLocation` is required for schema inference (JSON, CSV)
2. `addNewColumns` is the default schema evolution mode
3. `_rescued_data` column captures unparseable data and unexpected columns
4. Use file notification (`useNotifications=true`) for > 10K files/day
5. `inferColumnTypes=true` infers types; without it, JSON/CSV fields default to string
6. Parquet and Avro do **not** need `schemaLocation` (schema embedded in files)
7. `_metadata` column provides file-level metadata (path, size, modification time)
8. `trigger(availableNow=True)` processes all available files then stops (batch-like)
9. Schema stored at `schemaLocation` persists across stream restarts
10. `maxFilesPerTrigger` controls throughput/latency trade-off (default: 1000)

## Related Topics

- [Streaming Quick Reference](./streaming-quick-ref.md)
- [Auto Loader (DE Pro)](../../certifications/data-engineer-professional/01-data-processing/04-auto-loader.md)
- [Streaming Examples](../code-examples/python/streaming_examples.md)
- [Streaming Fundamentals](../fundamentals/streaming-fundamentals.md)

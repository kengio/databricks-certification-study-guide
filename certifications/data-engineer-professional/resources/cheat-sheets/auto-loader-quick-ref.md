---
tags: [cheat-sheet, auto-loader, data-engineer-professional]
---

# Auto Loader Quick Reference

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
|--------|-------------|----------|
| `cloudFiles.format` | Source file format (json, csv, parquet, avro, text) | Yes |
| `cloudFiles.schemaLocation` | Path to store inferred schema | Yes (for inference) |
| `cloudFiles.schemaHints` | Override inferred column types | No |
| `cloudFiles.inferColumnTypes` | Infer types (default: strings for JSON/CSV) | No |

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
|------|----------|----------|
| `addNewColumns` | Add new columns, rescue unparseable | Production default |
| `rescue` | All unexpected data to `_rescued_data` | Debug, preserve data |
| `failOnNewColumns` | Fail stream on new columns | Strict schema control |
| `none` | Ignore new columns | Fixed schema |

```python
# Schema evolution with addNewColumns

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load("/data/source"))
```

### Rescued Data Column

```python
# Always include rescued data column

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("cloudFiles.schemaEvolutionMode", "rescue")
    .load("/data/source"))

# _rescued_data column contains:
# - Unparseable records
# - Unexpected columns
# - Type mismatches

```

## Directory Listing vs File Notification

| Mode | Option | Description |
|------|--------|-------------|
| Directory Listing | `cloudFiles.useNotifications = false` | Polls directory (default) |
| File Notification | `cloudFiles.useNotifications = true` | Uses cloud events |

```python
# File notification mode (scalable for large directories)

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("cloudFiles.useNotifications", "true")
    .load("/data/source"))
```

| Aspect | Directory Listing | File Notification |
|--------|-------------------|-------------------|
| Setup | Automatic | Requires cloud config |
| Scalability | Slows with many files | Constant time |
| Latency | Depends on list time | Near real-time |
| Cost | Free | Cloud notification costs |
| Best for | < 10K files/day | > 10K files/day |

## File Format Options

### JSON

```python
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("multiLine", "true")
    .load("/data/json/"))
```

### CSV

```python
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "csv")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("header", "true")
    .option("sep", ",")
    .option("inferSchema", "false")
    .load("/data/csv/"))
```

### Parquet

```python
df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "parquet")
    .load("/data/parquet/"))
# No schema location needed - schema embedded in files

```

## Common Options Reference

| Option | Default | Description |
|--------|---------|-------------|
| `cloudFiles.format` | - | Source format (required) |
| `cloudFiles.schemaLocation` | - | Schema storage path |
| `cloudFiles.inferColumnTypes` | false | Infer types vs all strings |
| `cloudFiles.schemaEvolutionMode` | addNewColumns | How to handle changes |
| `cloudFiles.useNotifications` | false | Use cloud notifications |
| `cloudFiles.includeExistingFiles` | true | Process existing files |
| `cloudFiles.maxFilesPerTrigger` | 1000 | Files per micro-batch |
| `cloudFiles.maxBytesPerTrigger` | - | Bytes per micro-batch |
| `pathGlobFilter` | - | Filter files by pattern |
| `recursiveFileLookup` | false | Search subdirectories |

## File Filtering

```python
# Only process JSON files

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("pathGlobFilter", "*.json")
    .load("/data/source"))

# Recursive file lookup

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "parquet")
    .option("recursiveFileLookup", "true")
    .load("/data/source"))
```

## Metadata Columns

```python
# Access file metadata

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .load("/data/source")
    .select(
        "*",
        "_metadata.file_path",
        "_metadata.file_name",
        "_metadata.file_size",
        "_metadata.file_modification_time"
    ))
```

| Metadata Column | Description |
|-----------------|-------------|
| `_metadata.file_path` | Full file path |
| `_metadata.file_name` | File name only |
| `_metadata.file_size` | Size in bytes |
| `_metadata.file_modification_time` | Last modified timestamp |

## Complete Example

```python
# Production Auto Loader pipeline

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/mnt/checkpoints/schema")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("cloudFiles.useNotifications", "true")
    .option("maxFilesPerTrigger", "1000")
    .load("/mnt/landing/events/"))

# Add metadata and write

(df.select(
    "*",
    "_metadata.file_path".alias("source_file"),
    current_timestamp().alias("ingestion_time")
).writeStream
    .format("delta")
    .option("checkpointLocation", "/mnt/checkpoints/events")
    .option("mergeSchema", "true")
    .trigger(availableNow=True)
    .toTable("bronze.events"))
```

## Common Exam Tips

1. `cloudFiles.schemaLocation` required for schema inference (JSON, CSV)
2. `addNewColumns` is default schema evolution mode
3. `_rescued_data` column captures unparseable data
4. Use file notification for > 10K files/day
5. `inferColumnTypes=true` for typed inference (otherwise strings)
6. Parquet/Avro don't need schema location (embedded)
7. `_metadata` column provides file-level information
8. `trigger(availableNow=True)` processes all available, then stops
9. Schema stored at schemaLocation persists across restarts
10. `maxFilesPerTrigger` controls throughput/latency tradeoff

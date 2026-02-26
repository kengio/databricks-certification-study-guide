---
tags:
  - databricks
  - cheat-sheet
aliases:
  - Cheat Sheets
---

# Cheat Sheets

Quick reference guides for common Databricks operations and configurations.

## Available Cheat Sheets

| Cheat Sheet | Description |
| ----------- | ----------- |
| [Delta Lake Commands](delta-lake-commands.md) | OPTIMIZE, VACUUM, MERGE, and table operations |
| [DESCRIBE and SHOW Commands](describe-show-commands.md) | Metadata inspection with example outputs |
| [Spark Configurations](spark-configurations.md) | Key Spark settings for tuning and optimization |
| [Performance Optimization](performance-optimization.md) | File sizing, indexing decisions, and cost optimization |
| [SQL Functions](sql-functions.md) | Common SQL functions and syntax |
| [Unity Catalog Quick Reference](./unity-catalog-quick-ref.md) | Permissions, grants, and catalog operations |
| [MLflow Quick Reference](mlflow-quick-ref.md) | Experiment tracking, model registry, inference APIs |
| [PySpark API Quick Reference](pyspark-api-quick-ref.md) | DataFrame, aggregation, window, streaming APIs |
| [DLT / Lakeflow Pipelines Quick Reference](./dlt-quick-ref.md) | Table types, expectations, APPLY CHANGES, pipeline settings |
| [Auto Loader Quick Reference](./auto-loader-quick-ref.md) | cloudFiles options, schema evolution modes, file notification, UC Volumes |
| [Streaming Quick Reference](./streaming-quick-ref.md) | Triggers, watermarks, stream-stream joins, stateful aggregations, exactly-once |

## How to Use

These cheat sheets are designed for quick lookups during:

- Exam preparation (memorize key numbers and defaults)
- Development (copy-paste code snippets)
- Troubleshooting (find the right configuration)

## Key Numbers to Remember

| Topic | Value | Notes |
| ----- | ----- | ----- |
| Target file size (batch) | 1 GB | Default OPTIMIZE target |
| Target file size (streaming) | 128 MB | Optimized writes default |
| VACUUM retention | 168 hours (7 days) | Minimum safe retention |
| Shuffle partitions | 200 | Default, adjust by data size |
| Broadcast threshold | 10 MB | Auto-broadcast join limit |
| Max Z-ORDER columns | 3-4 | Practical limit |
| Auto Loader max files/trigger | 1000 | `cloudFiles.maxFilesPerTrigger` default |
| File notification threshold | > 10K files/day | Use notification over directory listing |

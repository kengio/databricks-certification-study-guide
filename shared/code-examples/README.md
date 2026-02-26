---
tags:
  - databricks
  - code-examples
aliases:
  - Code Examples
---

# Code Examples

Practical, runnable code examples for Databricks exam preparation and development reference.
All examples are stored as Markdown files with fenced code blocks for readability in Obsidian.

## Python Examples

- [python/delta_lake_operations.md](python/delta_lake_operations.md) — Create, read, write, merge, time travel, VACUUM
- [python/streaming_examples.md](python/streaming_examples.md) — Structured Streaming, Auto Loader, triggers, watermarks
- [python/unity_catalog_setup.md](python/unity_catalog_setup.md) — Catalog/schema/table creation, grants, external locations
- [python/python_patterns.md](python/python_patterns.md) — Data structures, comprehensions, generators, dataclasses, context managers, string manipulation, inheritance, error handling, CSV/JSON, datetime, logging
- [python/cdc_and_deduplication.md](python/cdc_and_deduplication.md) — CDF enable/read, metadata columns, SCD Type 1/2 MERGE, deduplication strategies, row tracking, identity columns
- [python/feature_store_and_vector_search.md](python/feature_store_and_vector_search.md) — Feature Store API, training set creation, Vector Search index types, similarity search, RAG pattern
- [python/ml_inference_examples.md](python/ml_inference_examples.md) — Batch scoring with spark_udf, Model Serving REST API, A/B testing, MLflow evaluation, custom PyFunc
- [python/dlt_pipelines.md](python/dlt_pipelines.md) — DLT/LakeFlow declarative pipelines, expectations, APPLY CHANGES, event log queries
- [python/mlflow_patterns.md](python/mlflow_patterns.md) — Experiment tracking, autologging, UC model registry, aliases, batch inference, GenAI evaluation

## SQL Examples

- [sql/delta_lake_operations.md](sql/delta_lake_operations.md) — DDL, DML, OPTIMIZE, VACUUM, MERGE, CDF
- [sql/window_functions.md](sql/window_functions.md) — ROW_NUMBER, RANK, LAG/LEAD, running aggregates
- [sql/cte_patterns.md](sql/cte_patterns.md) — Common Table Expressions, PIVOT, UNPIVOT
- [sql/cdc_merge_patterns.md](sql/cdc_merge_patterns.md) — SCD Type 1/2 MERGE, APPLY CHANGES syntax, CDF queries, deduplication SQL
- [sql/analyst_patterns.md](sql/analyst_patterns.md) — CASE, PIVOT, UNPIVOT, date/string functions, parameters, percentiles, NULL handling

## How to Use

1. Open an example file in Obsidian to browse with syntax highlighting
2. Copy snippets into a Databricks notebook and adjust table names and paths
3. Run cells sequentially — each example builds on previous context

## Notes

- Examples use Unity Catalog three-level namespace (`catalog.schema.table`)
- Replace `my_catalog`, `my_schema`, and paths with your actual values
- Some operations require specific permissions (e.g., CREATE CATALOG requires metastore admin)

---
tags:
  - databricks
  - code-examples
aliases:
  - Code Examples
---

# Code Examples

Practical, runnable code examples for Databricks exam preparation and development reference.

## Python Examples

> [!note] Coming Soon
> Example files are planned. Topics to be covered:

- `python/delta_lake_operations.py` — Create, read, write, merge, time travel, VACUUM
- `python/streaming_examples.py` — Structured Streaming, Auto Loader, triggers, watermarks
- `python/unity_catalog_setup.py` — Catalog/schema/table creation, grants, external locations

## SQL Examples

> [!note] Coming Soon
> Example files are planned. Topics to be covered:

- `sql/delta_lake_operations.sql` — DDL, DML, OPTIMIZE, VACUUM, MERGE, CDF
- `sql/window_functions.sql` — ROW_NUMBER, RANK, LAG/LEAD, running aggregates
- `sql/cte_patterns.sql` — Common Table Expressions, PIVOT, UNPIVOT

## How to Use

1. Open the examples in a Databricks notebook
2. Adjust table names and paths for your environment
3. Run cells sequentially -- each example builds on previous context

## Notes

- Examples use Unity Catalog three-level namespace (`catalog.schema.table`)
- Replace `my_catalog`, `my_schema`, and paths with your actual values
- Some operations require specific permissions (e.g., CREATE CATALOG requires metastore admin)

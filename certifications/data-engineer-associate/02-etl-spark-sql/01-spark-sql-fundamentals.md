---
title: Spark SQL Fundamentals
type: study-material
tags:
  - spark-sql
  - sql
  - queries
---

# Spark SQL Fundamentals

## Overview

Spark SQL provides a SQL interface to process structured data with Spark's distributed computing power. It handles SQL queries, CSV, Parquet, Delta, and connects to external data sources.

## Spark SQL Architecture

```mermaid
flowchart TB
    SQL["SQL Query"]
    Parser["SQL Parser"]
    Analyzer["Logical Plan Analyzer"]
    Optimizer["Catalyst Optimizer"]
    Planner["Physical Planner"]
    Executor["Spark Engine"]

    SQL --> Parser
    Parser --> Analyzer
    Analyzer --> Optimizer
    Optimizer --> Planner
    Planner --> Executor
```

## Spark SQL vs DataFrames

| Aspect | Spark SQL | DataFrames |
|--------|-----------|------------|
| **Interface** | SQL queries | Python/Scala/Java API |
| **Performance** | Optimized via Catalyst | Same Catalyst optimizer |
| **Learning Curve** | Easy for SQL users | Requires API knowledge |
| **Flexibility** | SQL syntax | Programmatic control |
| **Interop** | Can mix with DataFrames | Can mix with SQL |

## Creating Tables

### Managed vs External Tables

```python
# Managed table (data stored in warehouse directory)

spark.sql("""
CREATE TABLE my_table (
    id INT,
    name STRING,
    salary DECIMAL(10, 2)
)
USING DELTA
""")

# External table (data stored in external location)

spark.sql("""
CREATE TABLE my_external (
    id INT,
    name STRING
)
USING DELTA
LOCATION '/mnt/data/my_table'
""")
```

### From DataFrame

```python
# Create from existing data

df.write.mode("overwrite").saveAsTable("my_table")  # Managed

# Create external

(df.write
    .mode("overwrite")
    .option("path", "/mnt/data/external")
    .saveAsTable("my_external_table"))

# From file

spark.sql("""
CREATE TABLE my_parquet
USING PARQUET
LOCATION '/mnt/data/input.parquet'
""")
```

## Queries and Aggregations

### Basic SELECT

```python
spark.sql("""
SELECT
    id,
    name,
    salary
FROM employees
WHERE salary > 50000
ORDER BY salary DESC
LIMIT 10
""").show()
```

### Aggregations

```python
spark.sql("""
SELECT
    department,
    COUNT(*) as emp_count,
    AVG(salary) as avg_salary,
    MAX(salary) as max_salary,
    MIN(salary) as min_salary
FROM employees
GROUP BY department
HAVING COUNT(*) > 5
""")
```

### Window Functions

```sql
SELECT
    name,
    department,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
    SUM(salary) OVER (PARTITION BY department) as dept_total
FROM employees
```

## Views and Temporary Views

### Permanent Views

```python
# Create view (stored in metastore)

spark.sql("""
CREATE VIEW high_earners AS
SELECT name, salary
FROM employees
WHERE salary > 100000
""")

# Drop view

spark.sql("DROP VIEW IF EXISTS high_earners")
```

### Temporary Views

```python
# Session-scoped (deleted when session ends)

spark.sql("""
CREATE TEMP VIEW temp_view AS
SELECT * FROM employees LIMIT 100
""")

# Global temporary (accessible across sessions)

spark.sql("""
CREATE GLOBAL TEMP VIEW global_view AS
SELECT * FROM large_table
""")

# Query global temp view

spark.sql("SELECT * FROM global_temp.global_view")
```

## Catalog Operations

### Listing Objects

```python
# List databases

spark.catalog.listDatabases()

# List tables in database

spark.catalog.listTables("default")

# List columns

spark.catalog.listColumns("my_table")

# Check if table exists

spark.catalog.tableExists("my_table")
```

### Switching Context

```python
# Set current database

spark.sql("USE my_database")

# Now queries reference my_database by default

spark.sql("SELECT * FROM my_table")  # Uses my_database.my_table
```

## Data Types

```sql
-- Numeric Types
INT, BIGINT, FLOAT, DOUBLE, DECIMAL(10,2)

-- String Types
STRING, VARCHAR(100), CHAR(10)

-- Boolean
BOOLEAN

-- Date/Time
DATE, TIMESTAMP, TIMESTAMP_NTZ

-- Complex Types
ARRAY<INT>
MAP<STRING, INT>
STRUCT<name STRING, age INT>

-- Binary
BINARY
```

## Partitioning

```python
# Create partitioned table

spark.sql("""
CREATE TABLE sales (
    id INT,
    amount DECIMAL(10, 2)
)
PARTITIONED BY (year INT, month INT)
USING DELTA
""")

# Insert with partition

spark.sql("""
INSERT INTO sales
PARTITION (year=2025, month=1)
SELECT id, amount FROM new_sales
""")
```

## SQL vs Hive SQL Differences

| Feature | Spark SQL | Hive SQL |
|---------|-----------|----------|
| **Performance** | Fast (Catalyst) | Slower |
| **Data Types** | 20+ types | Limited |
| **Compliance** | ANSI SQL | Hive dialect |
| **Execution** | Spark engine | Hive + MapReduce |

## Use Cases

- **Large Scale Transformations**: Leveraging Spark SQL distributed execution semantics to transform multi-terabyte datasets efficiently.
- **Interactive Data Exploration**: Using Spark SQL in notebooks to run ad-hoc queries against Delta tables, inspect schema metadata via `DESCRIBE`, and prototype transformation logic before codifying it in production pipelines.

## Common Issues & Errors

### OOM Errors

**Scenario:** Data skew causes an executor to run out of memory.
**Fix:** Use Adaptive Query Execution (AQE) and review joining logic.

### Temp Views Not Visible Across SparkSessions

**Scenario:** A temporary view created in one notebook is not accessible from another notebook or a different SparkSession, causing `AnalysisException: Table or view not found`.
**Fix:** Use global temporary views (`CREATE GLOBAL TEMP VIEW`) and query them via `global_temp.view_name`, or persist the data as a table instead of a view.

### SQL Syntax Differences Between Spark SQL and ANSI SQL

**Scenario:** Queries using strict ANSI SQL syntax (e.g., integer division, implicit casting) produce unexpected results or errors in Spark SQL due to dialect differences.
**Fix:** Set `spark.sql.ansi.enabled = true` to enforce strict ANSI behavior, or review Spark SQL-specific syntax rules for operators and type casting.

## Exam Tips

- Know the difference between managed tables (data deleted with `DROP TABLE`) and external tables (data persists after `DROP TABLE`)
- Temporary views are session-scoped; global temporary views use the `global_temp` database and survive across sessions
- The Catalyst optimizer optimizes both SQL and DataFrame queries identically
- Understand `CREATE TABLE ... USING DELTA` vs `CREATE TABLE ... USING PARQUET` and the benefits of Delta

## Key Takeaways

- **Managed vs External**: Data location and lifecycle
- **Temporary Views**: Session-scoped, auto-deleted
- **Partitioning**: Organize large tables for performance
- **Catalog**: Metadata management
- **SQL Optimization**: Catalyst optimizer benefits

## Related Topics

- [DataFrame Operations](./02-dataframe-operations.md)
- [SQL Essentials (Shared)](../../../shared/fundamentals/sql-essentials.md)
- [SQL Functions Cheat Sheet](../../../shared/cheat-sheets/sql-functions.md)

## Official Documentation

- [Spark SQL Guide](https://docs.databricks.com/en/sql/language-manual/index.html)
- [Tables in Databricks](https://docs.databricks.com/en/tables/index.html)

---

**[↑ Back to ETL with Spark SQL and Python](./README.md) | [Next: DataFrame Operations](./02-dataframe-operations.md) →**

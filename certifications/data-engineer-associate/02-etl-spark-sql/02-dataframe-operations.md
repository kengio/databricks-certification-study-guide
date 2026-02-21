---
title: DataFrame Operations
type: study-material
tags:
  - dataframe
  - pyspark
  - operations
---

# DataFrame Operations

## Overview

DataFrames are the primary abstraction in Spark for structured data. They provide a distributed collection of rows organized into named columns with a defined schema. DataFrames combine the familiarity of SQL with the power of distributed computing.

## What is a DataFrame?

```mermaid
flowchart TB
    subgraph Input["Input Data Sources"]
        CSV["CSV Files"]
        JSON["JSON Data"]
        DB["Databases"]
        Streaming["Streaming"]
    end

    DataFrame["Apache Spark DataFrame"]

    subgraph Operations["DataFrame Operations"]
        Transform["Transformations<br/>(select, filter, map)"]
        Action["Actions<br/>(show, collect, write)"]
    end

    subgraph Output["Output"]
        DF["DeltaLake"]
        SQL["SQL Tables"]
        Files["Parquet/CSV"]
    end

    Input --> DataFrame
    DataFrame --> Operations
    Transform --> Action
    Action --> Output
```text

## Creating DataFrames

### From Python Collections

```python
# From list of tuples
data = [
    (1, "Alice", 85000),
    (2, "Bob", 75000),
    (3, "Charlie", 95000)
]

df = spark.createDataFrame(data, ["id", "name", "salary"])
df.show()
```text

### From Files

```python
# CSV
df_csv = spark.read.format("csv") \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .load("/path/to/data.csv")

# JSON
df_json = spark.read.json("/path/to/data.json")

# Parquet
df_parquet = spark.read.parquet("/path/to/data.parquet")

# Delta
df_delta = spark.read.format("delta").load("/path/to/delta/table")
```text

### From Pandas

```python
import pandas as pd

pandas_df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"],
    "salary": [85000, 75000, 95000]
})

spark_df = spark.createDataFrame(pandas_df)
```text

### From SQL Query

```python
df = spark.sql("""
    SELECT id, name, salary
    FROM employees
    WHERE department = 'Engineering'
""")
```text

## DataFrame Schema

### Inspecting Schema

```python
# Print schema
df.printSchema()

# Output:
# root
#  |-- id: long (nullable = true)
#  |-- name: string (nullable = true)
#  |-- salary: decimal(10,2) (nullable = true)

# Get schema as StructType
schema = df.schema

# Get column names
columns = df.columns  # ['id', 'name', 'salary']

# Get data types
dtypes = df.dtypes  # [('id', 'long'), ('name', 'string'), ...]
```text

### Defining Schema Explicitly

```python
from pyspark.sql.types import StructType, StructField, IntegerType, StringType, DecimalType

schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("name", StringType(), True),
    StructField("salary", DecimalType(10, 2), True)
])

df = spark.read.schema(schema).csv("/path/to/data.csv", header=True)
```text

## Core DataFrame Transformations

### Select and Projection

```python
# Select specific columns
df.select("id", "name").show()

# Select with alias
df.select(
    col("id"),
    col("name").alias("employee_name"),
    col("salary")
).show()

# Select with expressions
df.selectExpr(
    "id",
    "name as employee_name",
    "salary * 1.1 as projected_salary"
).show()
```text

### Filter and WHERE

```python
# Filter with conditions
df.filter(col("salary") > 80000).show()

# Multiple conditions
df.filter((col("salary") > 50000) & (col("name") != "Bob")).show()

# Using SQL filter
df.filter("salary > 80000 AND department = 'Engineering'").show()
```text

### Adding and Dropping Columns

```python
# Add column
df_new = df.withColumn("bonus", col("salary") * 0.1)

# Add multiple columns
df_new = df.withColumn("annual_bonus", col("salary") * 0.15) \
    .withColumn("is_manager", col("salary") > 100000)

# Rename column
df_renamed = df.withColumnRenamed("salary", "annual_salary")

# Drop column
df_dropped = df.drop("bonus")
```text

### Distinct and Deduplication

```python
# Get distinct rows
df.distinct().show()

# Count distinct values
df.select(col("department")).distinct().count()

# Drop duplicates on specific columns
df.dropDuplicates(["id", "name"])
```text

### Sorting

```python
# Sort by single column
df.orderBy("salary").show()

# Sort descending
df.orderBy(col("salary").desc()).show()

# Sort by multiple columns
df.orderBy(
    col("department").asc(),
    col("salary").desc()
).show()
```text

## DataFrame Actions

Actions compute and return results to the driver or write data:

```python
# Show (display first 20 rows)
df.show()
df.show(100)  # Show 100 rows
df.show(truncate=False)  # Don't truncate long strings

# Collect (retrieve all rows to driver - use carefully!)
all_rows = df.collect()

# Count
row_count = df.count()

# Take (get first n rows)
first_5 = df.take(5)

# Write
df.write.format("delta").mode("overwrite").save("/path/to/table")
```text

## Data Types Reference

| Type | Python Example | Size |
|------|---|---|
| `IntegerType` | `123` | 4 bytes |
| `LongType` | `123456789` | 8 bytes |
| `FloatType` | `1.23` | 4 bytes |
| `DoubleType` | `1.23456` | 8 bytes |
| `StringType` | `"text"` | Variable |
| `BooleanType` | `True` | 1 byte |
| `DateType` | `date(2025, 1, 15)` | 4 bytes |
| `TimestampType` | `datetime.now()` | 8 bytes |
| `ArrayType` | `[1, 2, 3]` | Variable |
| `MapType` | `{"key": "value"}` | Variable |

## Common DataFrame Patterns

### Check DataFrame Size

```python
# Number of rows
num_rows = df.count()

# Approximate size (MB)
memory_usage = df.cache().memory_usage / 1024 / 1024

# Schema info
print(f"Columns: {len(df.columns)}")
print(f"Rows: {df.count()}")
```text

### DataFrame to Pandas (for small datasets only)

```python
# WARNING: pulls all data to driver, only use for small DataFrames
pandas_df = df.toPandas()

# Only first 1000 rows
pandas_df = df.limit(1000).toPandas()
```text

### Sample Data

```python
# Random sample
sample_df = df.sample(fraction=0.1)  # 10% sample

# Stratified sample
sample_df = df.sampleBy("category", fractions={
    "A": 0.2,
    "B": 0.3
})
```text

## Performance Considerations

| Operation | Cost | When to Use |
|-----------|------|-----------|
| `select` | Low | Always use to reduce columns |
| `filter` | Low | Push filters early |
| `collect` | High | Avoid on large DataFrames |
| `distinct` | High | Use carefully on large datasets |
| `take` | Low | Use before show/collect |

## Key Exam Concepts

- **DataFrame**: Distributed, immutable collection of rows with schema
- **Lazy Evaluation**: Transformations don't execute until action called
- **Schema**: Column names, types, nullability metadata
- **Transformations**: Return new DataFrame (select, filter, withColumn)
- **Actions**: Compute and return results (show, collect, count, write)
- **Column Selection**: Use `col()` function for expressions
- **Filter Conditions**: Use `&` (and), `|` (or), `~` (not) for logic operators

---

**[← Back to ETL with Spark SQL](README.md)**

## Use Cases

- **DataFrame Operations Implementation**: Incorporating DataFrame Operations principles to build scalable and maintainable solutions in Databricks environments.
- **Optimized DataFrame Operations Workflows**: Using the advanced capabilities of DataFrame Operations to automate processes and reduce manual operational overhead.

## Common Issues & Errors

### 1. Configuration Oversights
**Scenario:** The default settings for DataFrame Operations do not scale well with sudden spikes in data volume.
**Fix:** Explicitly define and tune the configuration parameters for DataFrame Operations to handle production-scale workloads.

### 2. Integration Bottlenecks
**Scenario:** Connecting DataFrame Operations to other downstream components results in unexpected failures.
**Fix:** Ensure that permissions and network access rules are correctly provisioned for DataFrame Operations prior to deployment.


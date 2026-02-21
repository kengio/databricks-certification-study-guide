---
tags: [cheat-sheet, pyspark, python, data-engineering, ml-associate]
---

# PySpark API Quick Reference

Quick reference for commonly used PySpark DataFrame, SQL, and streaming APIs.

## DataFrame Creation

```python
from pyspark.sql import SparkSession
spark = SparkSession.builder.getOrCreate()

# From Python data
df = spark.createDataFrame([(1, "Alice"), (2, "Bob")], ["id", "name"])

# From files
df = spark.read.format("delta").load("/path/to/table")
df = spark.read.format("json").option("multiline", True).load("/path/")
df = spark.read.format("csv").option("header", True).load("/path/")
df = spark.read.table("catalog.schema.table")

# From streaming source
stream = spark.readStream.format("cloudFiles").option("cloudFiles.format", "json").load("/path/")
```

## Selections and Filtering

```python
from pyspark.sql.functions import col, lit, expr

df.select("id", "name")
df.select(col("id"), col("name").alias("full_name"))
df.selectExpr("id", "upper(name) as name_upper")

df.filter(col("age") > 18)
df.filter("age > 18 AND country = 'US'")
df.where(col("status").isin(["active", "pending"]))
df.where(col("name").isNotNull())
df.dropna(subset=["id", "name"])
```

## Transformations

```python
from pyspark.sql.functions import when, coalesce, upper, lower, trim

df.withColumn("age_group", when(col("age") < 18, "minor").otherwise("adult"))
df.withColumn("name", upper(col("name")))
df.withColumn("score", col("raw") * 100.0)
df.withColumn("val", coalesce(col("a"), col("b"), lit(0)))

df.drop("temp_col")
df.dropDuplicates(["id", "event_type"])
df.distinct()
df.limit(100)
```

## Aggregations

```python
from pyspark.sql.functions import count, sum, avg, max, min, countDistinct, collect_list

df.groupBy("category").agg(
    count("*").alias("total"),
    sum("amount").alias("total_amount"),
    avg("amount").alias("avg_amount"),
    countDistinct("user_id").alias("unique_users"),
    max("event_date").alias("latest_event"),
    collect_list("product_id").alias("products")
)

# Pivot
df.groupBy("user_id").pivot("month").sum("amount")
```

## Joins

```python
df1.join(df2, "user_id")                          # Inner join on column name
df1.join(df2, df1.id == df2.user_id, "left")       # Left outer join
df1.join(df2, ["id", "date"], "inner")             # Join on multiple columns
df1.join(df2, "id", "left_anti")                   # Rows in df1 not in df2
df1.join(df2, "id", "semi")                        # Rows in df1 that match df2
df1.crossJoin(df2)                                 # Cartesian product
```

**Hint syntax:**

```python
from pyspark.sql.functions import broadcast
# Force broadcast of small table
df1.join(broadcast(small_df), "id")
```

## Window Functions

```python
from pyspark.sql import Window
from pyspark.sql.functions import row_number, rank, dense_rank, lag, lead, sum, avg

window = Window.partitionBy("user_id").orderBy("event_date")

df.withColumn("row_num", row_number().over(window))
df.withColumn("rank", rank().over(window))
df.withColumn("prev_amount", lag("amount", 1).over(window))
df.withColumn("next_amount", lead("amount", 1).over(window))

# Running total
df.withColumn("running_total", sum("amount").over(
    Window.partitionBy("user_id").orderBy("event_date").rowsBetween(Window.unboundedPreceding, 0)
))

# Rolling 7-row average
df.withColumn("rolling_avg", avg("amount").over(
    Window.partitionBy("user_id").orderBy("event_date").rowsBetween(-6, 0)
))
```

## String Functions

```python
from pyspark.sql.functions import (
    concat, concat_ws, split, substring, regexp_replace, regexp_extract,
    upper, lower, trim, ltrim, rtrim, length, lpad, rpad, instr, locate
)

df.withColumn("full_name", concat_ws(" ", col("first"), col("last")))
df.withColumn("parts", split(col("path"), "/"))
df.withColumn("area_code", regexp_extract(col("phone"), r"^\((\d{3})\)", 1))
df.withColumn("clean", regexp_replace(col("text"), r"[^a-zA-Z0-9]", ""))
df.withColumn("first3", substring(col("name"), 1, 3))
```

## Date/Time Functions

```python
from pyspark.sql.functions import (
    current_timestamp, current_date, to_timestamp, to_date,
    date_format, date_add, date_sub, datediff, months_between,
    year, month, dayofmonth, hour, minute, dayofweek, trunc, date_trunc
)

df.withColumn("ts", to_timestamp("ts_str", "yyyy-MM-dd HH:mm:ss"))
df.withColumn("date_only", to_date("ts"))
df.withColumn("year", year("ts"))
df.withColumn("formatted", date_format("ts", "MM/dd/yyyy"))
df.withColumn("days_diff", datediff("end_date", "start_date"))
df.withColumn("month_trunc", date_trunc("month", "ts"))
```

## Schema Operations

```python
from pyspark.sql.types import StructType, StructField, StringType, LongType, DoubleType

# Define schema explicitly
schema = StructType([
    StructField("id", LongType(), nullable=False),
    StructField("name", StringType(), nullable=True),
    StructField("score", DoubleType(), nullable=True),
])

df.printSchema()
df.schema                                # Returns StructType
df.dtypes                                # List of (column, dtype) tuples
df.columns                               # List of column names

# Cast
df.withColumn("id", col("id").cast("long"))
```

## Actions (Trigger Computation)

```python
df.count()                               # Row count
df.collect()                             # Return all rows as list
df.first()                               # First row
df.show(10, truncate=False)              # Print 10 rows
df.take(5)                               # Return first 5 rows
df.toPandas()                            # Convert to pandas (small data only)
df.describe("amount", "age").show()      # Summary statistics
```

## Writing Data

```python
# Write modes: append, overwrite, ignore, error
df.write.format("delta").mode("append").save("/path/to/table")
df.write.format("delta").mode("overwrite").saveAsTable("catalog.schema.table")
df.write.format("delta").partitionBy("date").mode("overwrite").save("/path/")

# With options
(df.write
    .format("delta")
    .option("mergeSchema", "true")
    .mode("append")
    .save("/path/"))
```

## Streaming Write

```python
query = (
    df.writeStream
    .format("delta")
    .outputMode("append")                # append | complete | update
    .trigger(processingTime="1 minute")  # or availableNow=True
    .option("checkpointLocation", "/checkpoints/my_query")
    .start("/output/path")
)

query.awaitTermination()
query.stop()
query.status
query.lastProgress
```

## UDFs

```python
from pyspark.sql.functions import udf, pandas_udf
from pyspark.sql.types import StringType
import pandas as pd

# Regular UDF (slow — serialize row by row)
@udf(returnType=StringType())
def clean_email(email):
    return email.strip().lower() if email else None

# Pandas UDF (vectorized — fast)
@pandas_udf(returnType="double")
def score_to_percent(scores: pd.Series) -> pd.Series:
    return scores * 100.0

df.withColumn("clean", clean_email(col("email")))
df.withColumn("pct", score_to_percent(col("score")))
```

## Key Performance Tips

| Pattern | Recommendation |
| :--- | :--- |
| Shuffle partitions | `spark.conf.set("spark.sql.shuffle.partitions", "200")` |
| Broadcast joins | Use when one table < 10 MB |
| Avoid `collect()` | Never collect large DataFrames to driver |
| Prefer `selectExpr` | Can use SQL syntax for complex transformations |
| Cache wisely | `df.cache()` only for DataFrames used 2+ times |

## Related Topics

- [Spark Configurations](spark-configurations.md)
- [Performance Optimization](performance-optimization.md)
- [Interview Prep — PySpark API](../interview-prep/08-pyspark-api.md)
- [Spark Fundamentals](../fundamentals/spark-fundamentals.md)

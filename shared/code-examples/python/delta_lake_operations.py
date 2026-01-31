# Delta Lake Operations - Python Examples
# Run these examples in a Databricks notebook

# ============================================================
# 1. CREATE A DELTA TABLE
# ============================================================

from pyspark.sql.types import StructType, StructField, StringType, IntegerType
from pyspark.sql.functions import col

# Create schema
schema = StructType([
    StructField("id", IntegerType(), False),
    StructField("name", StringType(), True),
    StructField("department", StringType(), True),
    StructField("salary", IntegerType(), True)
])

# Create sample data
data = [
    (1, "Alice", "Engineering", 95000),
    (2, "Bob", "Marketing", 72000),
    (3, "Charlie", "Engineering", 88000),
    (4, "Diana", "Sales", 67000)
]

df = spark.createDataFrame(data, schema)

# Write as Delta table
df.write.format("delta").mode("overwrite").saveAsTable("my_catalog.my_schema.employees")


# ============================================================
# 2. READ A DELTA TABLE
# ============================================================

# Using table name
employees = spark.table("my_catalog.my_schema.employees")
employees.show()

# Using path
employees = spark.read.format("delta").load("/path/to/employees")


# ============================================================
# 3. APPEND DATA
# ============================================================

new_data = [(5, "Eve", "Engineering", 91000)]
new_df = spark.createDataFrame(new_data, schema)

new_df.write.format("delta").mode("append").saveAsTable("my_catalog.my_schema.employees")


# ============================================================
# 4. SCHEMA EVOLUTION (mergeSchema)
# ============================================================

from pyspark.sql.types import DateType

# DataFrame with a new column
extended_schema = StructType(schema.fields + [StructField("hire_date", DateType(), True)])
extended_data = [(6, "Frank", "Sales", 70000, None)]
extended_df = spark.createDataFrame(extended_data, extended_schema)

# Append with schema evolution
(
    extended_df.write.format("delta")
    .mode("append")
    .option("mergeSchema", "true")
    .saveAsTable("my_catalog.my_schema.employees")
)


# ============================================================
# 5. MERGE (UPSERT)
# ============================================================

from delta.tables import DeltaTable

# Source data with updates and new records
updates = [
    (1, "Alice", "Engineering", 105000),   # salary update
    (7, "Grace", "Marketing", 78000)        # new employee
]
updates_df = spark.createDataFrame(updates, schema)

# Get reference to target table
target = DeltaTable.forName(spark, "my_catalog.my_schema.employees")

# Perform merge
target.alias("t").merge(
    updates_df.alias("s"),
    "t.id = s.id"
).whenMatchedUpdateAll(
).whenNotMatchedInsertAll(
).execute()


# ============================================================
# 6. TIME TRAVEL
# ============================================================

# Read a specific version
df_v0 = (
    spark.read.format("delta")
    .option("versionAsOf", 0)
    .table("my_catalog.my_schema.employees")
)

# Read by timestamp
df_ts = (
    spark.read.format("delta")
    .option("timestampAsOf", "2025-01-15 10:00:00")
    .table("my_catalog.my_schema.employees")
)

# View table history
history = DeltaTable.forName(spark, "my_catalog.my_schema.employees").history()
history.select("version", "timestamp", "operation", "operationMetrics").show(truncate=False)


# ============================================================
# 7. OPTIMIZE AND VACUUM
# ============================================================

# Compact small files
spark.sql("OPTIMIZE my_catalog.my_schema.employees")

# Compact with Z-ORDER
spark.sql("OPTIMIZE my_catalog.my_schema.employees ZORDER BY (department)")

# Remove old files (default 7-day retention)
spark.sql("VACUUM my_catalog.my_schema.employees")

# Vacuum with custom retention (use with caution)
spark.sql("VACUUM my_catalog.my_schema.employees RETAIN 168 HOURS")


# ============================================================
# 8. CHANGE DATA FEED (CDF)
# ============================================================

# Enable CDF on a table
spark.sql("""
    ALTER TABLE my_catalog.my_schema.employees
    SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
""")

# Read change data by version
changes = (
    spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 1)
    .table("my_catalog.my_schema.employees")
)

changes.select("id", "name", "salary", "_change_type", "_commit_version").show()

# Filter specific change types
inserts = changes.filter(col("_change_type") == "insert")
updates = changes.filter(col("_change_type") == "update_postimage")
deletes = changes.filter(col("_change_type") == "delete")


# ============================================================
# 9. LIQUID CLUSTERING
# ============================================================

# Create table with liquid clustering
spark.sql("""
    CREATE TABLE my_catalog.my_schema.orders (
        order_id BIGINT,
        customer_id BIGINT,
        order_date DATE,
        amount DECIMAL(10,2)
    ) USING DELTA
    CLUSTER BY (customer_id, order_date)
""")

# Change clustering columns (no rewrite needed)
spark.sql("ALTER TABLE my_catalog.my_schema.orders CLUSTER BY (customer_id)")

# Remove clustering
spark.sql("ALTER TABLE my_catalog.my_schema.orders CLUSTER BY NONE")

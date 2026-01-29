# Structured Streaming & Auto Loader - Python Examples
# Run these examples in a Databricks notebook

# ============================================================
# 1. BASIC STRUCTURED STREAMING (Rate Source for Testing)
# ============================================================

# Generate test stream
stream_df = spark.readStream \
    .format("rate") \
    .option("rowsPerSecond", 10) \
    .load()

# Write to Delta table
query = stream_df.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "/tmp/checkpoints/rate_stream") \
    .toTable("my_catalog.my_schema.rate_events")

# Stop the stream
query.stop()


# ============================================================
# 2. AUTO LOADER (cloudFiles)
# ============================================================

# Read new JSON files as they arrive
auto_loader_df = spark.readStream \
    .format("cloudFiles") \
    .option("cloudFiles.format", "json") \
    .option("cloudFiles.schemaLocation", "/tmp/schema/events") \
    .option("cloudFiles.inferColumnTypes", "true") \
    .load("/path/to/landing/events/")

# Write to Bronze table
query = auto_loader_df.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "/tmp/checkpoints/events_bronze") \
    .option("mergeSchema", "true") \
    .toTable("my_catalog.bronze.events")

query.stop()


# ============================================================
# 3. AUTO LOADER WITH SCHEMA EVOLUTION
# ============================================================

# Schema evolution modes:
# - "addNewColumns" : Add new columns to schema
# - "rescue"        : Send unexpected data to _rescued_data column
# - "failOnNewColumns" : Fail on new columns (default)
# - "none"          : Ignore new columns

auto_loader_evolve = spark.readStream \
    .format("cloudFiles") \
    .option("cloudFiles.format", "json") \
    .option("cloudFiles.schemaLocation", "/tmp/schema/events_v2") \
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns") \
    .load("/path/to/landing/events/")


# ============================================================
# 4. TRIGGER MODES
# ============================================================

from pyspark.sql.streaming import DataStreamWriter

stream_source = spark.readStream.format("delta").table("my_catalog.bronze.events")

# Continuous processing (default) - process as data arrives
query_continuous = stream_source.writeStream \
    .format("delta") \
    .trigger(processingTime="10 seconds") \
    .option("checkpointLocation", "/tmp/checkpoints/continuous") \
    .toTable("my_catalog.silver.events_continuous")

# Available Now - process all available data then stop (replaces trigger once)
query_available = stream_source.writeStream \
    .format("delta") \
    .trigger(availableNow=True) \
    .option("checkpointLocation", "/tmp/checkpoints/available") \
    .toTable("my_catalog.silver.events_batch")

# Once (deprecated) - process one micro-batch then stop
query_once = stream_source.writeStream \
    .format("delta") \
    .trigger(once=True) \
    .option("checkpointLocation", "/tmp/checkpoints/once") \
    .toTable("my_catalog.silver.events_once")

# Stop streams
query_continuous.stop()
query_available.awaitTermination()
query_once.awaitTermination()


# ============================================================
# 5. WATERMARKING (Late Data Handling)
# ============================================================

from pyspark.sql.functions import window, col, count

# Assume events have an event_time column
events = spark.readStream.format("delta").table("my_catalog.bronze.events")

# Define watermark: allow up to 10 minutes of late data
windowed_counts = events \
    .withWatermark("event_time", "10 minutes") \
    .groupBy(
        window("event_time", "5 minutes"),
        col("event_type")
    ).agg(count("*").alias("event_count"))

query = windowed_counts.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "/tmp/checkpoints/watermark") \
    .toTable("my_catalog.gold.event_counts")

query.stop()


# ============================================================
# 6. STREAMING WITH FOREACHBATCH (Custom Logic)
# ============================================================

from delta.tables import DeltaTable

def upsert_to_silver(batch_df, batch_id):
    """Merge each micro-batch into the silver table."""
    target = DeltaTable.forName(spark, "my_catalog.silver.events")

    target.alias("t").merge(
        batch_df.alias("s"),
        "t.event_id = s.event_id"
    ).whenMatchedUpdateAll(
    ).whenNotMatchedInsertAll(
    ).execute()

# Use foreachBatch for custom write logic
query = spark.readStream \
    .format("delta") \
    .table("my_catalog.bronze.events") \
    .writeStream \
    .foreachBatch(upsert_to_silver) \
    .option("checkpointLocation", "/tmp/checkpoints/foreach") \
    .start()

query.stop()


# ============================================================
# 7. STREAMING FROM CHANGE DATA FEED
# ============================================================

# Stream changes from a CDF-enabled source table
cdf_stream = spark.readStream \
    .format("delta") \
    .option("readChangeFeed", "true") \
    .option("startingVersion", 0) \
    .table("my_catalog.bronze.orders")

# Process only inserts and updates
filtered = cdf_stream.filter(
    col("_change_type").isin("insert", "update_postimage")
)

query = filtered.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "/tmp/checkpoints/cdf_stream") \
    .toTable("my_catalog.silver.orders")

query.stop()


# ============================================================
# 8. MONITORING STREAMS
# ============================================================

# Check active streams
for stream in spark.streams.active:
    print(f"Stream: {stream.name}, ID: {stream.id}, Status: {stream.status}")

# Get stream progress
# query.lastProgress     # Latest micro-batch stats
# query.recentProgress   # Recent micro-batch stats
# query.status           # Current status

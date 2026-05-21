---
title: Streaming Ingestion from Message Buses
type: study-material
tags:
  - data-engineer-professional
  - ingestion
  - kafka
  - kinesis
  - eventhubs
  - streaming
status: published
---

# Streaming Ingestion from Message Buses

## Overview

Object-storage ingest covers files. Message buses — **Apache Kafka**, **Confluent Cloud**, **AWS Kinesis**, **Azure Event Hubs**, **GCP Pub/Sub** — cover events. Databricks reads them through Structured Streaming sources (`kafka`, `kinesis`, `eventhubs`) and writes to Delta with the same `writeStream` patterns used for any streaming sink. This page covers the canonical configurations, credential handling, exactly-once semantics, and how to combine with **Lakeflow Declarative Pipelines** for declarative ingest.

> [!abstract]
>
> - **Kafka source** (`format("kafka")`) — the most common; works with Confluent Cloud, MSK, self-managed
> - **Kinesis source** (`format("kinesis")`) — AWS-native; supports enhanced fan-out
> - **Event Hubs source** — Azure-native; uses the Kafka-compatible endpoint or the dedicated `eventhubs` connector
> - **Exactly-once writes** via Delta + checkpointing
> - **Credentials live in UC connections or secret scopes** — never in `spark.conf`
> - **Lakeflow Declarative Pipelines** wrap the streaming source with `@dlt.table` + `cloudFiles`-style ergonomics

> [!tip] What the Exam Tests
>
> - Which source connector matches which message bus
> - Required options per source (Kafka: bootstrap servers + topic; Kinesis: stream name + region; Event Hubs: namespace + name)
> - That checkpointing is what gives you exactly-once into Delta
> - That credentials should come from a UC connection or secret scope, not hard-coded
> - The trade-off between streaming source + `writeStream` (full control) vs Lakeflow Declarative Pipelines (declarative)

---

## Kafka ingest (PySpark)

```python
from pyspark.sql.functions import col, from_json
from pyspark.sql.types import StructType, StringType, LongType

schema = StructType().add("order_id", StringType()).add("amount", LongType())

events = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "broker.example.com:9093")
    .option("subscribe", "orders")
    .option("startingOffsets", "latest")
    .option("kafka.security.protocol", "SASL_SSL")
    .option("kafka.sasl.mechanism", "PLAIN")
    .option("kafka.sasl.jaas.config",
            f'org.apache.kafka.common.security.plain.PlainLoginModule required '
            f'username="{dbutils.secrets.get("kafka", "user")}" '
            f'password="{dbutils.secrets.get("kafka", "pwd")}";')
    .load()
    .select(from_json(col("value").cast("string"), schema).alias("data"),
            col("timestamp").alias("ingest_ts"))
    .select("data.*", "ingest_ts")
)

(events.writeStream
    .format("delta")
    .option("checkpointLocation", "/Volumes/main/landing/_checkpoints/orders")
    .outputMode("append")
    .toTable("main.bronze.orders"))
```

| Key option | Purpose |
| :--- | :--- |
| `kafka.bootstrap.servers` | Broker list |
| `subscribe` / `subscribePattern` / `assign` | Topic selection |
| `startingOffsets` | `latest`, `earliest`, or per-partition JSON |
| `maxOffsetsPerTrigger` | Bounds throughput per micro-batch |
| `kafka.security.protocol` + `sasl.*` | TLS / SASL auth |
| `checkpointLocation` | Delta exactly-once requires this |

## Kinesis ingest

```python
kinesis = (
    spark.readStream
    .format("kinesis")
    .option("streamName", "orders-stream")
    .option("region", "us-east-1")
    .option("initialPosition", "LATEST")
    .option("awsAccessKey", dbutils.secrets.get("aws", "access_key"))
    .option("awsSecretKey", dbutils.secrets.get("aws", "secret_key"))
    .load()
)
```

Kinesis supports **enhanced fan-out** for multi-consumer high-throughput reads — set `consumerMode = "efo"` (the alternative is `consumerMode = "polling"`, which is cheaper for single-consumer workloads).

## Event Hubs ingest

Event Hubs exposes a Kafka-compatible endpoint, so the simplest path is to use the Kafka source pointed at the Event Hubs broker. Required JAAS config uses the Event Hubs SAS connection string as the password.

## Lakeflow Declarative Pipelines wrapper

For declarative ingest where you want pipeline-level expectations, automatic dependency tracking, and the Lakeflow event log:

```python
import dlt
from pyspark.sql.functions import col, from_json

@dlt.table(name="bronze_orders", comment="Raw Kafka events")
@dlt.expect_or_drop("valid_amount", "amount > 0")
def bronze_orders():
    return (
        spark.readStream.format("kafka")
        .option("kafka.bootstrap.servers", spark.conf.get("kafka.servers"))
        .option("subscribe", "orders")
        .load()
        .select(from_json(col("value").cast("string"), schema).alias("data"))
        .select("data.*")
    )
```

The Pipeline runtime handles checkpointing, retries, and event-log capture for you.

## Exactly-once semantics

Delta + checkpointing gives you exactly-once **into Delta**. The contract:

1. The streaming source records its committed offsets in `checkpointLocation`
2. Delta records the same offsets in its commit log atomically with the data write
3. On restart, the source resumes from the last committed offset; Delta refuses to re-write already-written batches

**Caveats**: the upstream source must be replayable from a known offset (Kafka and Kinesis both are). UDFs with side effects (writing to other systems) are *not* exactly-once.

## Use Cases

- **Kafka → Bronze** as the first hop in a medallion pipeline
- **CDC from Debezium → Kafka → Lakeflow Pipelines → Silver** with `APPLY CHANGES INTO`
- **Click-stream from Kinesis → Bronze → real-time dashboards** via DBSQL streaming queries
- **IoT telemetry from Event Hubs → Bronze** with high-throughput partitioning

## Common Issues & Errors

- **Hard-coded credentials in `spark.conf`** — fails security review and rotates badly. Use secret scopes or UC connections
- **Checkpoint location not unique per query** — sharing a checkpoint between two queries corrupts both. One checkpoint per `writeStream`
- **Missing `startingOffsets`** — for streaming queries the default is `latest`, so the first run skips all existing events. Set to `earliest` for back-fill. (For *batch* `spark.read.format("kafka")` the default is `earliest`.)
- **Skew on partition key** — one Kafka partition becomes a hot Spark partition; consider key rebalancing or repartition after read
- **Kinesis throttling** — the default polling mode shares throughput with other consumers; switch to enhanced fan-out for dedicated bandwidth

## Exam Tips

> [!tip]
>
> - **Three sources to know**: `kafka`, `kinesis`, `eventhubs` (or Kafka-compatible Event Hubs endpoint).
> - **Checkpointing + Delta = exactly-once** into the lakehouse. Same pattern for all three sources.
> - Credentials live in **secret scopes** or **UC connections**, never in code.
> - `startingOffsets = latest` is the **streaming** default for Kafka — set to `earliest` for history. (Batch reads default to `earliest`.)
> - Lakeflow Declarative Pipelines wrap the streaming source ergonomically and add the pipeline event log; standard `writeStream` gives you more control.

## Key Takeaways

- Message-bus ingestion uses Structured Streaming sources: `kafka` / `kinesis` / `eventhubs`
- Delta + checkpointing provides exactly-once into the lakehouse
- Credentials must be externalised to secret scopes or UC connections
- Lakeflow Declarative Pipelines wrap the source for declarative ergonomics
- `startingOffsets` and `maxOffsetsPerTrigger` are the two most-tuned options

## Related Topics

- [Auto Loader](./01-auto-loader.md) — for file sources
- [COPY INTO](./02-copy-into.md) — for batch file ingest
- [Structured Streaming Part 1](../01-developing-code-for-data-processing/03-structured-streaming-part1.md)
- [Lakeflow Declarative Pipelines](../01-developing-code-for-data-processing/06-declarative-pipelines.md)
- [Change Data Capture](../03-data-transformation-cleansing-quality/01-change-data-capture-part1.md)

## Official Documentation

- [Apache Kafka source for Structured Streaming](https://docs.databricks.com/en/structured-streaming/kafka.html)
- [Amazon Kinesis source](https://docs.databricks.com/en/structured-streaming/kinesis.html)
- [Azure Event Hubs source](https://learn.microsoft.com/en-us/azure/databricks/structured-streaming/eventhubs)
- [Lakeflow Declarative Pipelines syntax](https://docs.databricks.com/en/delta-live-tables/index.html)

---

**[← Previous: COPY INTO](./02-copy-into.md) | [↑ Back to Data Ingestion & Acquisition](./README.md)**

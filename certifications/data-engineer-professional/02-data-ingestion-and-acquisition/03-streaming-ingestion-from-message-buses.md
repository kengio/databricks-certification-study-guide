---
title: Streaming Ingestion from Message Buses
type: study-material
tags:
  - data-engineer-professional
  - ingestion
  - kafka
  - kinesis
  - pubsub
  - eventhubs
  - streaming
status: published
---

# Streaming Ingestion from Message Buses

## Overview

Object-storage ingestion covers files; message buses — **Apache Kafka** (including Confluent, Amazon MSK, Google Cloud Managed Kafka), **Azure Event Hubs**, **Amazon Kinesis**, and **Google Pub/Sub** — cover events. Databricks reads them as Structured Streaming sources (`kafka`, `kinesis`, `pubsub`) or SQL table-valued functions (`read_kafka`, `read_kinesis`, `read_pubsub`) and writes to Delta with checkpointed `writeStream` or Lakeflow Pipelines streaming tables. This page also maps every **data format** in the exam bullet (Delta Lake, Parquet, JSON, Iceberg, CSV, Binary) to the right ingestion API.

> [!abstract]
>
> - **Kafka** (`format("kafka")`) — also the path for **Event Hubs** through its Kafka-compatible endpoint (port 9093); a managed **Lakeflow Connect Kafka connector** is in Beta
> - **Kinesis** (`format("kinesis")`) — `streamName` or `streamARN`; polling or enhanced fan-out (`consumerMode = "efo"`)
> - **Pub/Sub** (`format("pubsub")`) — `subscriptionId` + `topicId` + `projectId` required; exactly-once processing of fetched rows, but the bus itself can deliver duplicates
> - Message payloads arrive as **binary** (`value`, `data`, `payload`) and must be decoded (`cast("string")`, `from_json`, `from_avro`)
> - **Exactly-once into Delta** comes from a replayable source + a unique checkpoint per query; credentials come from **UC service credentials / connections** or secrets, never hard-coded

> [!tip] What the Exam Tests
>
> - "Develop data ingestion pipelines to ingest a variety of data formats, including Delta Lake, Parquet, JSON, Iceberg, CSV, and Binary from diverse sources such as message buses (Kafka, Kinesis, Pub/Sub) and cloud storage"
> - Required options per source and their defaults (`startingOffsets`, `initialPosition`, `maxOffsetsPerTrigger`)
> - Which reader handles which format: Auto Loader `cloudFiles.format` values, `binaryFile`, Delta streaming reads, Iceberg read paths
> - Checkpoints for exactly-once; Lakeflow Pipelines (declarative) vs raw `writeStream` (full control) vs a managed connector

---

## Source × Format Matrix

| Source | Reader | Formats / payload | Notes |
| :--- | :--- | :--- | :--- |
| Kafka / Event Hubs | `spark.readStream.format("kafka")`, `read_kafka()` | `key`/`value` are `BINARY` — decode JSON, Avro, text, Protobuf yourself | Batch reads also supported |
| Kinesis | `format("kinesis")`, `read_kinesis()` | `data` is `BINARY` — cast to string, then parse | Streaming only (`STREAM read_kinesis`) |
| Pub/Sub | `format("pubsub")`, `read_pubsub()` | `payload` is `ArrayType[ByteType]`; `attributes` is a JSON string | Exactly-once for fetched rows; handle bus duplicates |
| Cloud storage files | **Auto Loader** (`cloudFiles`), `read_files()`, `COPY INTO` | Auto Loader `cloudFiles.format`: `avro`, `binaryFile`, `csv`, `json`, `orc`, `parquet`, `text`, `xml` | Auto Loader also reads pre-compressed files |
| Delta Lake tables | `spark.readStream.table(...)` / `format("delta")` | Delta | `skipChangeCommits`, `readChangeFeed`, `startingVersion` |
| Iceberg tables | `spark.read.table(...)` on **managed Iceberg** (UC) or **foreign Iceberg** (catalog federation: Glue, Hive metastore, Snowflake Horizon) | Iceberg (Parquet data files) | Foreign Iceberg tables are read-only; `CONVERT TO DELTA iceberg.\`path\`` converts in place |
| OpenSharing | `format("deltaSharing")` | Shared Delta / Iceberg tables | Streaming needs tables shared with history |

> [!note]
> Delta and Iceberg are *table* formats — they are read through table APIs, not through Auto Loader. Auto Loader and `read_files` ingest raw **files** (JSON, CSV, Parquet, Avro, ORC, text, XML, binary).

---

## Kafka

```python
from pyspark.sql.functions import col, from_json
from pyspark.sql.types import LongType, StringType, StructType

schema = StructType().add("order_id", StringType()).add("amount", LongType())

jaas = (
    'kafkashaded.org.apache.kafka.common.security.plain.PlainLoginModule required '
    f'username="{dbutils.secrets.get("kafka", "user")}" '
    f'password="{dbutils.secrets.get("kafka", "pwd")}";'
)

events = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "broker.example.com:9093")
    .option("subscribe", "orders")
    .option("startingOffsets", "earliest")
    .option("maxOffsetsPerTrigger", 100000)
    .option("kafka.security.protocol", "SASL_SSL")
    .option("kafka.sasl.mechanism", "PLAIN")
    .option("kafka.sasl.jaas.config", jaas)
    .load()
    .select(
        from_json(col("value").cast("string"), schema).alias("data"),
        col("timestamp").alias("ingest_ts"),
    )
    .select("data.*", "ingest_ts")
)

(events.writeStream
    .format("delta")
    .option("checkpointLocation", "/Volumes/main/landing/_checkpoints/orders")
    .outputMode("append")
    .toTable("main.bronze.orders"))
```

| Option | Default | Purpose |
| :--- | :--- | :--- |
| `kafka.bootstrap.servers` | — | Broker `host:port` list (a wrong list may not error — clients retry forever) |
| `subscribe` / `subscribePattern` / `assign` | — | Exactly one topic-selection option is required |
| `startingOffsets` | `latest` (streaming), `earliest` (batch) | Only applies when a **new** query starts; resumed queries use the checkpoint; `latest` isn't allowed for batch |
| `startingTimestamp`, `startingOffsetsByTimestamp` | — | Start from a point in time |
| `maxOffsetsPerTrigger` | — | Cap offsets per micro-batch (streaming only) |
| `minOffsetsPerTrigger` + `maxTriggerDelay` | — / `15m` | Wait to accumulate a minimum batch |
| `minPartitions`, `maxRecordsPerPartition` | — | Split skewed Kafka partitions for more parallelism |
| `failOnDataLoss` | `true` | Fail if offsets were truncated or topics deleted |
| `includeHeaders` | `false` | Add Kafka headers as a column |

**Schema**: `key` and `value` (`binary`), `topic`, `partition`, `offset`, `timestamp`, `timestampType`.

**Authentication**:

- **UC service credential** (DBR 16.1+, recommended on standard-access clusters and serverless) for cloud-managed Kafka — Amazon MSK, Azure Event Hubs, Google Cloud Managed Kafka: set `databricks.serviceCredential`; no SASL/JAAS options needed.
- Otherwise SASL/SSL options passed as `kafka.*` properties (`SASL_SSL` + `PLAIN`, `SCRAM-SHA-256/512`, `OAUTHBEARER`, `AWS_MSK_IAM`, or SSL keystores).
- Any Kafka class referenced in options must use the **shaded** prefix `kafkashaded.`; unshaded names raise `RESTRICTED_STREAMING_OPTION_PERMISSION_ENFORCED`.

```python
msk_stream = (spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "<bootstrap-hostname>:9092")
    .option("subscribe", "orders")
    .option("databricks.serviceCredential", "<service-credential-name>")
    .load())
```

### Azure Event Hubs

Event Hubs exposes an Apache Kafka-compatible interface, so you use the **Kafka source** with `kafka.bootstrap.servers` set to `<event-hubs-server>:9093` (the namespace server shown on the Event Hubs overview page). On Azure Databricks, authenticate with a **UC service credential** (DBR 16.1+; optionally `databricks.serviceCredential.scope`) or Microsoft Entra ID OAuth with a client ID and secret. Lakeflow Pipelines use the same Kafka connector.

### Managed alternative: Lakeflow Connect Kafka connector (Beta)

The managed Kafka connector stores the bootstrap servers and credentials in a **UC connection** and runs a serverless ingestion pipeline that writes streaming tables — no Structured Streaming code. Use raw Structured Streaming when you need custom offset handling or per-batch transformations. Lakeflow Connect also has a managed **RabbitMQ** connector (Beta); Kinesis, Pub/Sub, and Pulsar have no managed connector and are read with Structured Streaming or Lakeflow Pipelines.

---

## Kinesis

```python
from pyspark.sql.functions import col

kinesis = (
    spark.readStream
    .format("kinesis")
    .option("databricks.connection", "kinesis_conn")   # UC connection, DBR 19+
    .option("streamName", "orders-stream")
    .option("initialPosition", "trim_horizon")
    .load()
    .select(col("data").cast("string").alias("json"), "approximateArrivalTimestamp")
)
```

| Option | Default | Notes |
| :--- | :--- | :--- |
| `streamName` **or** `streamARN` | — | Exactly one; `streamARN` needs DBR 16.1+; don't switch between them on a running query |
| `initialPosition` | `latest` | `latest`, `trim_horizon` (= `earliest`), `earliest`, `at_timestamp` (JSON timestamp) |
| `consumerMode` | `polling` | `efo` = enhanced fan-out, dedicated 2 MB/s per shard |
| `region` | Locally resolved | Don't set with `databricks.connection` |
| `maxFetchRate`, `minFetchPeriod`, `maxRecordsPerFetch` | `1.0` MB/s, `400ms`, `10000` | Throttling controls |
| `shardsPerTask` | `5` | Shards prefetched per Spark task |

**Authentication** (preferred first): a **UC connection** of type `KINESIS` that references a service credential (`databricks.connection`, DBR 19+); a **service credential** (`serviceCredential`, DBR 16.1+); or instance profile, `roleArn`, or access keys (`awsAccessKey`/`awsSecretKey` from secrets). Combining `databricks.connection` with `region`, `roleArn`, or access-key options fails with `KINESIS_UC_CONNECTION_OPTION_CONFLICT`.

```sql
CREATE CONNECTION IF NOT EXISTS kinesis_conn TYPE KINESIS
OPTIONS (aws_region 'us-east-1', credential 'kinesis_service_cred');

GRANT USE CONNECTION ON CONNECTION kinesis_conn TO `stream-engineers`;
GRANT ACCESS ON SERVICE CREDENTIAL kinesis_service_cred TO `stream-engineers`;
```

**Schema**: `partitionKey`, `data` (`binary`), `stream`, `shardId`, `sequenceNumber`, `approximateArrivalTimestamp`. `Trigger.AvailableNow` is supported (DBR 13.3 LTS+) for incremental-batch runs.

---

## Google Pub/Sub

```python
auth_options = {
    "clientId": dbutils.secrets.get("pubsub", "clientId"),
    "clientEmail": dbutils.secrets.get("pubsub", "clientEmail"),
    "privateKey": dbutils.secrets.get("pubsub", "privateKey"),
    "privateKeyId": dbutils.secrets.get("pubsub", "privateKeyId"),
}

pubsub = (
    spark.readStream
    .format("pubsub")
    .option("subscriptionId", "orders-sub")   # created if it doesn't exist
    .option("topicId", "orders")
    .option("projectId", "my-project")
    .options(**auth_options)
    .load()
)
```

| Option | Default | Notes |
| :--- | :--- | :--- |
| `subscriptionId`, `topicId`, `projectId` | — | **Required** |
| `serviceCredential` | — | Databricks service credential (DBR 16.1+) instead of the four key options |
| `clientEmail`, `clientId`, `privateKey`, `privateKeyId` | — | Required when not using a service credential |
| `numFetchPartitions` | Half the executors at stream start | Parallel fetch tasks |
| `maxRecordsPerFetch` | `1000` | Rows fetched per task before processing |
| `maxBytesPerTrigger` | — | Soft limit per micro-batch |
| `deleteSubscriptionOnStreamStop` | `false` | Needs `roles/pubsub.editor` |

- **IAM roles**: `roles/pubsub.viewer` (or `roles/viewer`) and `roles/pubsub.subscriber` are required; `roles/pubsub.editor` is optional (create/delete subscriptions).
- **Schema**: `messageId`, `payload` (raw bytes), `attributes` (JSON string), `publishTimestampInMillis`.
- **Semantics**: the connector processes subscriber rows exactly once, but Pub/Sub can publish duplicates or deliver out of order — deduplicate downstream (for example on `messageId`).
- `Trigger.AvailableNow` processes everything published before the recorded start time; `spark.speculation` is not supported.

---

## Cloud Storage Formats

### Auto Loader for files

```python
bronze_json = (spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/Volumes/main/landing/_schemas/orders")
    .option("cloudFiles.inferColumnTypes", "true")
    .load("/Volumes/main/landing/orders/"))

bronze_csv = (spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "csv")
    .option("header", "true")
    .option("cloudFiles.schemaLocation", "/Volumes/main/landing/_schemas/customers")
    .load("/Volumes/main/landing/customers/"))
```

- `cloudFiles.format` is **required**: `avro`, `binaryFile`, `csv`, `json`, `orc`, `parquet`, `text`, `xml`.
- `cloudFiles.schemaLocation` is required for schema inference; JSON and CSV columns infer as strings unless `cloudFiles.inferColumnTypes` is `true`.
- `cloudFiles.schemaEvolutionMode`: `addNewColumns` (default without a schema), `rescue`, `failOnNewColumns`, `none`.
- Full Auto Loader coverage: [Auto Loader](./01-auto-loader.md); batch idempotent loads: [COPY INTO](./02-copy-into.md).

### Binary files

```python
images = (spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "binaryFile")
    .option("pathGlobFilter", "*.png")   # the path is only a prefix filter
    .load("/Volumes/main/raw/images/"))
```

The `binaryFile` source returns one row per file with a fixed schema: `path`, `modificationTime`, `length`, `content` (`BINARY`). Use `pathGlobFilter` for suffixes and `recursiveFileLookup` to ignore partition-style directories; batch reads use `spark.read.format("binaryFile")` or `read_files(path, format => 'binaryFile')`. Databricks recommends saving binary data to a Delta table for faster reads.

### Delta Lake as a streaming source

```python
silver_feed = (spark.readStream
    .option("skipChangeCommits", "true")   # ignore updates/deletes, process appends only
    .table("main.bronze.orders"))

cdf_feed = (spark.readStream
    .option("readChangeFeed", "true")
    .option("startingVersion", 5)
    .table("main.silver.customers"))
```

`skipChangeCommits` replaces `ignoreChanges` on DBR 12.2 LTS+; `startingVersion` and `startingTimestamp` are mutually exclusive and only apply to new queries.

### Iceberg

- **Managed Iceberg tables** in Unity Catalog (DBR 16.4 LTS+) are read like any UC table; external engines read and write them through the Iceberg REST Catalog.
- **Foreign Iceberg tables** registered in Glue, Hive metastore, or Snowflake Horizon are read through **catalog federation** — read-only, metadata from the external catalog. See [Lakehouse Federation](./08-lakehouse-federation.md).
- **Converting** an Iceberg table directory to Delta in place: `CONVERT TO DELTA iceberg.\`s3://bucket/path\`` (paths only; managed Iceberg tables can't be converted).

```sql
-- Batch read of a managed or foreign Iceberg table, landed into a Delta bronze table
CREATE OR REPLACE TABLE main.bronze.vendor_orders AS
SELECT * FROM glue_catalog.sales.orders;
```

---

## Lakeflow Pipelines Wrapper

For declarative ingestion with expectations, dependency tracking, managed checkpoints, retries, and the pipeline event log:

```python
from pyspark import pipelines as dp
from pyspark.sql.functions import col, from_json

@dp.table(name="bronze_orders", comment="Raw Kafka events")
@dp.expect_or_drop("valid_amount", "amount > 0")
def bronze_orders():
    return (
        spark.readStream.format("kafka")
        .option("kafka.bootstrap.servers", spark.conf.get("kafka.servers"))
        .option("subscribe", "orders")
        .load()
        .select(from_json(col("value").cast("string"), "order_id STRING, amount BIGINT").alias("data"))
        .select("data.*")
    )
```

```sql
CREATE OR REFRESH STREAMING TABLE kafka_raw AS
SELECT * FROM STREAM read_kafka(
  bootstrapServers => 'kafka_server:9092',
  subscribe => 'topic1'
);

CREATE OR REFRESH STREAMING TABLE pubsub_raw AS
SELECT * FROM STREAM read_pubsub(
  subscriptionId => 'my-subscription',
  projectId => 'my-project',
  topicId => 'my-topic',
  clientEmail => secret('pubsub-scope', 'clientEmail'),
  clientId => secret('pubsub-scope', 'clientId'),
  privateKeyId => secret('pubsub-scope', 'privateKeyId'),
  privateKey => secret('pubsub-scope', 'privateKey')
);
```

For low latency, run these streaming tables in a **continuous** pipeline; `read_kinesis` and `read_pulsar` follow the same pattern.

## Exactly-once Semantics

Delta + checkpointing gives you exactly-once **into Delta**:

1. The streaming source records its progress (offsets, sequence numbers) in `checkpointLocation`.
2. The Delta sink commits each micro-batch atomically and records the batch in its log.
3. On restart the query resumes from the checkpoint, and Delta skips batches it already committed.

**Caveats**: the source must be replayable from a known position (Kafka offsets, Kinesis sequence numbers); a bus that delivers duplicates (Pub/Sub) still needs deduplication; side effects in UDFs or `foreachBatch` writes to other systems are not exactly-once unless made idempotent.

---

## Use Cases

- **Kafka → bronze streaming table** as the first hop of a medallion pipeline
- **Debezium CDC → Kafka → Lakeflow Pipelines → silver** with the AUTO CDC APIs (formerly APPLY CHANGES)
- **Clickstream from Kinesis (EFO) → bronze → near-real-time dashboards**
- **IoT telemetry through Event Hubs' Kafka endpoint → bronze**
- **GCP event fan-in from Pub/Sub** with `messageId` deduplication
- **Images/PDFs via Auto Loader `binaryFile` → Delta** for ML or AI-function processing

## Common Issues & Errors

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| First run skips existing Kafka events | Streaming default `startingOffsets = latest` | Set `earliest` (only honored for a new checkpoint) |
| Changing `startingOffsets` has no effect | Query resumes from its checkpoint | Use a new checkpoint location |
| `RESTRICTED_STREAMING_OPTION_PERMISSION_ENFORCED` | Unshaded Kafka class in `kafka.sasl.jaas.config` | Prefix with `kafkashaded.` |
| Two queries corrupt each other | Shared checkpoint location | One checkpoint per `writeStream` |
| Kinesis throttling | Polling consumers share per-shard read throughput | Switch to `consumerMode = "efo"` or tune `maxFetchRate` |
| `KINESIS_UC_CONNECTION_OPTION_CONFLICT` | `region`/keys/role set alongside `databricks.connection` | Let the connection supply region and credential |
| Duplicate Pub/Sub rows | Pub/Sub at-least-once delivery | Deduplicate on `messageId` |
| Hard-coded secrets in `spark.conf` | Fails security review, rotates badly | UC service credentials/connections or secret scopes |
| Hot Spark partition | Skewed Kafka partition key | `minPartitions` / `maxRecordsPerPartition` or repartition after read |

## Exam Tips

> [!tip]
>
> - **Sources to know**: `kafka` (also Event Hubs on port 9093), `kinesis`, `pubsub`; SQL: `read_kafka`, `read_kinesis`, `read_pubsub`.
> - Payloads are **binary** — decode with `cast("string")` + `from_json` (or `from_avro`).
> - `startingOffsets = latest` is the **streaming** default for Kafka (`earliest` for batch); Kinesis `initialPosition` defaults to `latest`; both apply only to a fresh checkpoint.
> - Pub/Sub needs `subscriptionId`, `topicId`, `projectId`; it can deliver duplicates.
> - Auto Loader formats: `avro`, `binaryFile`, `csv`, `json`, `orc`, `parquet`, `text`, `xml`. **Delta and Iceberg are read as tables**, not with Auto Loader.
> - Checkpoint + Delta = exactly-once; credentials from UC service credentials/connections or secrets.

## Key Takeaways

- Message-bus ingestion uses Structured Streaming sources (`kafka`, `kinesis`, `pubsub`) or their SQL TVFs inside Lakeflow Pipelines streaming tables.
- Event Hubs is consumed through the Kafka connector; a managed Lakeflow Connect Kafka connector (Beta) removes the code entirely.
- Each source has its own required options and defaults; message bodies are binary and must be decoded.
- File formats go through Auto Loader / `read_files` / `COPY INTO`; Delta streams via `readStream.table`; Iceberg via managed or foreign (federated) tables.
- Delta plus a unique checkpoint per query provides exactly-once into the lakehouse.

## Related Topics

- [Auto Loader](./01-auto-loader.md) — file ingestion in depth
- [COPY INTO](./02-copy-into.md) — idempotent batch file ingestion
- [Change Data Capture (CDC) — Part 1](./04-change-data-capture-part1.md) — CDF and change streams
- [Lakeflow Connect Database CDC](./05-lakeflow-connect-database-cdc.md) — managed database ingestion
- [Lakehouse Federation](./08-lakehouse-federation.md) — foreign Iceberg tables via catalog federation
- [Structured Streaming — Part 1](../01-developing-code-for-data-processing/04-structured-streaming-part1.md)
- [Lakeflow Pipelines](../01-developing-code-for-data-processing/06-declarative-pipelines.md)

## Official Documentation

- [Connect to Apache Kafka](https://docs.databricks.com/aws/en/connect/streaming/kafka/)
- [Kafka authentication](https://docs.databricks.com/aws/en/connect/streaming/kafka/authentication) and [Azure Event Hubs authentication (Azure Databricks)](https://learn.microsoft.com/en-us/azure/databricks/connect/streaming/kafka/authentication)
- [Connect to Amazon Kinesis](https://docs.databricks.com/aws/en/connect/streaming/kinesis) and [Kinesis authentication](https://docs.databricks.com/aws/en/connect/streaming/kinesis/authentication)
- [Subscribe to Google Pub/Sub](https://docs.databricks.com/aws/en/connect/streaming/pub-sub)
- [Spark API options reference](https://docs.databricks.com/aws/en/spark/api-options) (Kafka, Kinesis, Pub/Sub, Auto Loader options)
- [Streaming connectors in Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/streaming-overview) and [Kafka connector (Beta)](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/kafka)
- [Load data in pipelines](https://docs.databricks.com/aws/en/ldp/load)
- [`read_kafka`](https://docs.databricks.com/aws/en/sql/language-manual/functions/read_kafka), [`read_kinesis`](https://docs.databricks.com/aws/en/sql/language-manual/functions/read_kinesis), [`read_files`](https://docs.databricks.com/aws/en/sql/language-manual/functions/read_files)
- [What is Auto Loader?](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/) and [Read binary files](https://docs.databricks.com/aws/en/query/formats/binary)
- [Delta Lake table streaming reads and writes](https://docs.databricks.com/aws/en/structured-streaming/delta-lake)
- [What is Apache Iceberg in Databricks?](https://docs.databricks.com/aws/en/iceberg/) and [`CONVERT TO DELTA`](https://docs.databricks.com/aws/en/sql/language-manual/delta-convert-to-delta)

---

**[← Previous: COPY INTO](./02-copy-into.md) | [↑ Back to Section](./README.md) | [Next: Change Data Capture (CDC) — Part 1 →](./04-change-data-capture-part1.md)**

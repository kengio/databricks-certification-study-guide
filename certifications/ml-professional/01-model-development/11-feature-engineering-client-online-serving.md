---
title: Feature Engineering Client and Online Serving
type: study-material
tags:
  - ml-professional
  - feature-engineering
  - feature-store
  - point-in-time
  - online-tables
  - feature-serving
status: published
---

# Feature Engineering Client and Online Serving

## Overview

The **Advanced Feature Store Concepts** section of the exam guide tests five skills: point-in-time correct lookups, automated feature pipelines with the **FeatureEngineering Client**, **online tables configured with the Databricks SDK**, streaming feature generation, and **on-demand features served with feature serving**. This file covers each one with the `databricks-feature-engineering` API (`FeatureEngineeringClient`, Feature Engineering in Unity Catalog). Earlier files in this folder still show the legacy workspace `FeatureStoreClient`, for comparison only.

> [!abstract]
>
> - **Time series feature tables** (a timestamp in the primary key) plus `FeatureLookup(timestamp_lookup_key=...)` give **point-in-time** joins: each training row gets the latest feature value *before* its timestamp.
> - **Automated pipelines**: a scheduled job (or a Lakeflow pipeline with a primary key) calls `fe.write_table(..., mode="merge")`. A streaming DataFrame in `write_table` returns a `StreamingQuery`.
> - **Online serving**: features are synced from the Delta offline table to a low-latency store. The exam names **online tables** created through the Databricks SDK. The current platform uses **Databricks Online Feature Stores** (Lakebase).
> - **On-demand features**: a Unity Catalog Python UDF wrapped in `FeatureFunction` runs at training **and** inference time, so both compute the feature the same way. A **`FeatureSpec`** served on an endpoint exposes lookups and functions as a REST API.

> [!tip] What the Exam Tests
>
> - Which parameter prevents label leakage (`timestamp_lookup_key`) and what the time series key must be part of (the primary key)
> - Building and scheduling feature computation with `FeatureEngineeringClient` (`create_table`, `write_table`, `create_training_set`, `log_model`, `score_batch`)
> - Configuring an online copy of a feature table with the Databricks SDK, and the triggered vs continuous sync trade-off
> - Using `FeatureFunction` + `FeatureLookup` for on-demand features, and `create_feature_spec` for feature serving endpoints

---

## Point-in-Time Correctness

Data leakage happens when a training row uses a feature value that wasn't yet available when its label was recorded. The model then learns from the future and underperforms in production ([Point-in-time support](https://docs.databricks.com/aws/en/machine-learning/feature-store/time-series)).

### Create a time series feature table

```python
from databricks.feature_engineering import FeatureEngineeringClient

fe = FeatureEngineeringClient()

fe.create_table(
    name="main.fraud.customer_txn_features",
    primary_keys=["customer_id", "feature_ts"],   # the timestamp is part of the primary key
    timeseries_column="feature_ts",               # TIMESTAMP or DATE
    df=customer_features_df,
    description="Rolling customer spend features",
)
```

```sql
-- SQL equivalent: the TIMESERIES keyword inside the primary key makes it a time series feature table
CREATE TABLE main.fraud.customer_txn_features (
  customer_id STRING NOT NULL,
  feature_ts  TIMESTAMP NOT NULL,
  spend_7d    DOUBLE,
  txn_count_7d BIGINT,
  CONSTRAINT pk_customer PRIMARY KEY (customer_id, feature_ts TIMESERIES)
);
```

> [!note]
> The current `FeatureEngineeringClient.create_table` signature uses `timeseries_column` ([API reference](https://api-docs.databricks.com/python/feature-engineering/latest/feature_engineering.client.html)). Older docs and examples show `timeseries_columns`, and the legacy workspace `FeatureStoreClient` used `timestamp_keys`.

### Point-in-time lookup

```python
from datetime import timedelta
from databricks.feature_engineering import FeatureLookup

lookups = [
    FeatureLookup(
        table_name="main.fraud.customer_txn_features",
        lookup_key="customer_id",
        timestamp_lookup_key="event_ts",            # column in the label DataFrame
        feature_names=["spend_7d", "txn_count_7d"],
        lookback_window=timedelta(days=7),          # optional: ignore stale values
    )
]

training_set = fe.create_training_set(
    df=labels_df,                     # customer_id, event_ts, is_fraud
    feature_lookups=lookups,
    label="is_fraud",
    exclude_columns=["customer_id", "event_ts"],
)
training_df = training_set.load_df()
```

- For each row, the lookup returns the **latest feature values recorded before `event_ts`** for that `customer_id`. If none exists, the result is null.
- Any `FeatureLookup` on a time series table **must** include `timestamp_lookup_key`.
- `lookback_window` applies to training and batch inference. Online inference always uses the latest value.

## Automated Feature Pipelines with the FeatureEngineering Client

| Step | API | Notes |
| :--- | :--- | :--- |
| Create the table once | `fe.create_table(name, primary_keys, df=..., timeseries_column=...)` | Unity Catalog three-level name; primary key required |
| Incremental refresh | `fe.write_table(name, df, mode="merge")` | `merge` is the only supported mode. Rows whose key isn't in `df` stay unchanged |
| Streaming refresh | `fe.write_table(name, df=streaming_df, checkpoint_location=..., trigger=...)` | Returns a `StreamingQuery`. The default trigger is a 5-second processing time |
| Build a training set | `fe.create_training_set(df, feature_lookups, label, exclude_columns)` | Joins features to labels, point-in-time if time series |
| Log with lineage | `fe.log_model(model, artifact_path, flavor, training_set, registered_model_name)` | Packages feature metadata so inference can look features up |
| Batch inference | `fe.score_batch(model_uri, df)` | `df` needs only lookup keys and request-time columns |

Source: [Feature Engineering client API](https://api-docs.databricks.com/python/feature-engineering/latest/feature_engineering.client.html) and [Work with feature tables in Unity Catalog](https://docs.databricks.com/aws/en/machine-learning/feature-store/uc/feature-tables-uc).

```python
# Notebook task scheduled by a Lakeflow Job (or defined as a job resource in a bundle)
from pyspark.sql import functions as F
from databricks.feature_engineering import FeatureEngineeringClient

fe = FeatureEngineeringClient()

daily = (spark.table("main.fraud.transactions")
    .where(F.col("txn_date") == F.current_date() - 1)
    .groupBy("customer_id", F.col("txn_date").cast("timestamp").alias("feature_ts"))
    .agg(F.sum("amount").alias("spend_1d"), F.count("*").alias("txn_count_1d")))

fe.write_table(name="main.fraud.customer_daily_features", df=daily, mode="merge")
```

Databricks recommends a job that runs the feature notebook on a schedule ([Work with feature tables](https://docs.databricks.com/aws/en/machine-learning/feature-store/uc/feature-tables-uc)). Any table that a Lakeflow pipeline publishes **with a primary key constraint** can also act as a feature table, and so can any Unity Catalog streaming table or materialized view with a primary key. Table constraints on Lakeflow pipelines are in Public Preview.

> [!note] Platform update (Oct 2026)
> Lakeflow Declarative Pipelines was renamed **Lakeflow Spark Declarative Pipelines** on Nov 12, 2025 ([November 2025 release notes](https://docs.databricks.com/aws/en/release-notes/product/2025/november)). Current docs also use the short form "Lakeflow pipelines". The Python module is `from pyspark import pipelines as dp`. `import dlt` still works, but `pipelines` is recommended ([Python reference](https://docs.databricks.com/aws/en/ldp/developer/python-ref)). Feature Views, a separate feature-definition API, became generally available on Oct 12, 2026 ([October 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/october)). The exam guide doesn't name them.

## Streaming Feature Generation

When features must reflect events within seconds or minutes (fraud velocity, session activity), compute them with Structured Streaming and write them incrementally.

```python
from pyspark.sql import functions as F

velocity = (spark.readStream.table("main.fraud.card_events")
    .withWatermark("event_ts", "10 minutes")
    .groupBy("card_id", F.window("event_ts", "5 minutes", "1 minute"))
    .agg(F.count("*").alias("txn_count_5m"), F.sum("amount").alias("amount_5m"))
    .select("card_id", F.col("window.end").alias("feature_ts"), "txn_count_5m", "amount_5m"))

query = fe.write_table(
    name="main.fraud.card_velocity_features",       # PK (card_id, feature_ts TIMESERIES)
    df=velocity,
    checkpoint_location="/Volumes/main/fraud/checkpoints/card_velocity",
    trigger={"processingTime": "1 minute"},
)
```

Design points for scalable streaming features:

- **Watermarks** bound the state of windowed aggregations so the stream doesn't grow memory without limit.
- **Sliding windows** (`window(ts, "5 minutes", "1 minute")`) give fresh rolling aggregates. The window end becomes the feature timestamp for point-in-time training.
- **Continuous online sync** (`publish_mode="CONTINUOUS"` for an online feature store, or a continuous online table) carries streaming updates to serving within seconds. Triggered sync is cheaper but staler.
- Expensive aggregates that don't need sub-minute freshness belong in **scheduled batch** jobs. Reserve streaming for the features that actually need it.

## Online Tables for Low-Latency Applications (Databricks SDK)

The exam guide asks you to configure **online tables** with the **Databricks SDK**. An online table is a read-only, row-oriented copy of a Delta table, kept in sync for fast primary-key lookups by Model Serving and Feature Serving endpoints.

```python
# Exam-era pattern (legacy online tables) — Databricks SDK for Python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.catalog import (
    OnlineTable,
    OnlineTableSpec,
    OnlineTableSpecTriggeredSchedulingPolicy,
)

w = WorkspaceClient()

spec = OnlineTableSpec(
    source_table_full_name="main.fraud.customer_txn_features",
    primary_key_columns=["customer_id"],
    timeseries_key="feature_ts",   # keep only the latest row per key
    run_triggered=OnlineTableSpecTriggeredSchedulingPolicy.from_dict({"triggered": "true"}),
)

online_table = w.online_tables.create_and_wait(
    table=OnlineTable(name="main.fraud.customer_txn_features_online", spec=spec)
)
print(w.online_tables.get("main.fraud.customer_txn_features_online"))
```

| Setting | Meaning | Trade-off |
| :--- | :--- | :--- |
| `primary_key_columns` | Lookup key(s) used by endpoints | Must uniquely identify a row, or be combined with `timeseries_key` |
| `timeseries_key` | Keeps the latest value per primary key | Needed when the source holds history |
| `run_triggered` | Sync on demand or on a schedule (incremental with Change Data Feed) | Cheaper; data is as fresh as the last sync |
| `run_continuously` | Streaming sync | Freshest; continuously consumes compute |

> [!note] Platform update (Oct 2026)
> **Legacy online tables are retired.** The Databricks docs marked them deprecated with "not accessible after January 15, 2026" ([archived docs snapshot, Oct 5, 2025](https://web.archive.org/web/20251005154718/https://docs.databricks.com/aws/en/machine-learning/feature-store/online-tables)). The old URL now redirects to **Databricks Online Feature Stores**, which run on **Lakebase**. Online feature stores created after March 23, 2026 are Lakebase Autoscaling projects ([Online Feature Stores](https://docs.databricks.com/aws/en/machine-learning/feature-store/online-feature-store)). For non-feature-store applications, the replacement is a **Lakebase synced table** (`w.postgres.create_synced_table`, with Snapshot, Triggered, and Continuous sync modes) ([Synced tables](https://docs.databricks.com/aws/en/oltp/projects/sync-tables)). Databricks Free Edition doesn't support online tables ([Free Edition limitations](https://docs.databricks.com/aws/en/getting-started/free-edition-limitations)). Answer exam questions with the exam's "online tables" vocabulary and build new systems on the current APIs below.

### Current equivalent: Databricks Online Feature Store

```python
from databricks.feature_engineering import FeatureEngineeringClient

fe = FeatureEngineeringClient()

fe.create_online_store(name="fraud-online-store", capacity="CU_2")   # CU_1, CU_2, CU_4, CU_8
store = fe.get_online_store(name="fraud-online-store")

fe.publish_table(
    online_store=store,
    source_table_name="main.fraud.customer_txn_features",
    online_table_name="main.fraud_online.customer_txn_features",
    publish_mode="TRIGGERED",          # default; or "CONTINUOUS" / "SNAPSHOT"
)
```

Prerequisites carry over from online tables: a primary key constraint, non-nullable key columns, and **Change Data Feed** enabled on the source for `TRIGGERED` and `CONTINUOUS` modes. Delete online tables with `w.feature_store.delete_online_table(...)`, not `DROP TABLE`, which leaves the underlying database storage behind ([Online Feature Stores](https://docs.databricks.com/aws/en/machine-learning/feature-store/online-feature-store)).

## On-Demand Features and Feature Serving

Some features can only be computed at request time, such as the ratio of *this* transaction's amount to the customer's 7-day average. Writing that logic twice, once in a training notebook and again in the serving app, invites training-serving skew. A **Unity Catalog Python UDF** referenced through `FeatureFunction` runs the same code in both places ([On-demand features](https://docs.databricks.com/aws/en/machine-learning/feature-store/on-demand-features)).

```sql
CREATE OR REPLACE FUNCTION main.fraud.amount_vs_avg(amount DOUBLE, avg_amount DOUBLE)
RETURNS DOUBLE
LANGUAGE PYTHON
AS $$
import math
# Missing lookups arrive as None in batch scoring and NaN in online serving
if avg_amount is None or math.isnan(avg_amount) or avg_amount == 0:
    return None
return amount / avg_amount
$$
```

```python
import mlflow
from databricks.feature_engineering import FeatureEngineeringClient, FeatureFunction, FeatureLookup

fe = FeatureEngineeringClient()
mlflow.set_registry_uri("databricks-uc")

features = [
    FeatureLookup(
        table_name="main.fraud.customer_txn_features",
        lookup_key="customer_id",
        timestamp_lookup_key="event_ts",
        feature_names=["spend_7d"],
    ),
    FeatureFunction(
        udf_name="main.fraud.amount_vs_avg",
        input_bindings={"amount": "amount", "avg_amount": "spend_7d"},  # request column + looked-up feature
        output_name="amount_vs_avg",
    ),
]

training_set = fe.create_training_set(
    df=labels_df,                          # customer_id, event_ts, amount, is_fraud
    feature_lookups=features,
    label="is_fraud",
    exclude_columns=["customer_id", "event_ts"],
)
model = train(training_set.load_df())

fe.log_model(
    model=model,
    artifact_path="model",
    flavor=mlflow.sklearn,
    training_set=training_set,             # stores lookup + UDF metadata with the model
    registered_model_name="main.fraud.fraud_on_demand",
)

# Batch scoring computes the lookups and the UDF automatically
scored = fe.score_batch(model_uri="models:/main.fraud.fraud_on_demand@champion", df=batch_df)
```

When this model is deployed to **Model Serving**, the endpoint looks up `spend_7d` from the online store and runs `amount_vs_avg` on each request. The caller sends only `customer_id`, `event_ts`, and `amount`.

### Feature Serving endpoints (features without a model)

To serve features and on-demand computations directly, for example to a rules engine or an application, package them as a **`FeatureSpec`** and serve the spec ([Feature Serving](https://docs.databricks.com/aws/en/machine-learning/feature-store/feature-function-serving)).

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import EndpointCoreConfigInput, ServedEntityInput

fe.create_feature_spec(name="main.fraud.customer_risk_spec", features=features)

w = WorkspaceClient()
w.serving_endpoints.create(
    name="customer-risk-features",
    config=EndpointCoreConfigInput(
        served_entities=[
            ServedEntityInput(
                entity_name="main.fraud.customer_risk_spec",
                scale_to_zero_enabled=True,
                workload_size="Small",
            )
        ]
    ),
)
```

Every table in a `FeatureSpec` must be **published to an online store** first. Query the endpoint like any serving endpoint, for example with `mlflow.deployments.get_deploy_client("databricks").predict(endpoint=..., inputs={"dataframe_records": [...]})`.

## Use Cases

- **Churn model without leakage**: A time series customer feature table plus `timestamp_lookup_key="snapshot_date"` makes sure each training row sees only features from before its churn label date.
- **Card-velocity fraud features**: A streaming `write_table` with sliding windows feeds a continuously synced online store, so the serving endpoint sees counts that are about a minute old.
- **Request-time ratio features**: A `FeatureFunction` computes `amount_vs_avg` at training and at serving time from the same UC UDF, with no duplicated code.
- **Feature API for a rules engine**: A `FeatureSpec` endpoint returns the latest customer features plus computed risk ratios over REST, with no ML model involved.

## Common Issues & Errors

### Training metrics far better than production

**Scenario:** `FeatureLookup` against a feature table with history omitted `timestamp_lookup_key`, so training rows picked up feature values recorded after the label.
**Fix:** Make the table a time series feature table (timestamp in the primary key) and set `timestamp_lookup_key` to the label DataFrame's event-time column.

### Endpoint fails to deploy with feature lookup errors

**Scenario:** A model logged with `fe.log_model` is served, but a referenced feature table was never published online.
**Fix:** Publish every looked-up table to an online store (or, on the exam, an online table) before creating the endpoint. Remember that recreating an online table creates a new Unity Catalog securable, so the endpoint's service principal must be granted `SELECT` again.

### `publish_table` fails in `TRIGGERED` mode

**Scenario:** Publishing to an online store errors on a table without Change Data Feed.
**Fix:** `ALTER TABLE ... SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')`, and make sure the primary-key columns are `NOT NULL`.

## Exam Tips

> [!tip]
>
> - "Prevent data leakage in feature lookups" points to a time series feature table + `timestamp_lookup_key`.
> - "Consistent feature computation across training and production" for request-time logic points to `FeatureFunction` (a UC Python UDF). For stored features, `fe.log_model(training_set=...)` + automatic lookup.
> - "Low-latency feature lookups configured with the Databricks SDK" is the exam's **online tables** (`w.online_tables.create...`). Triggered sync is cheaper; continuous is fresher.
> - `fe.write_table` accepts a **streaming** DataFrame and returns a `StreamingQuery`. Its only write mode is `merge`.

## Key Takeaways

- **Point-in-time** = time series feature table + `timestamp_lookup_key` (+ optional `lookback_window`)
- **`FeatureEngineeringClient`** is the UC API: `create_table`, `write_table(mode="merge")`, `create_training_set`, `log_model`, `score_batch`, `create_feature_spec`, `publish_table`
- **Online tables** (exam term) = SDK-configured, synced, row-oriented copy for millisecond lookups; **now replaced** by Lakebase-backed Online Feature Stores and synced tables
- **Streaming features** use watermarks + windows and stream into `write_table`; continuous sync carries them to serving
- **On-demand features** = `FeatureFunction` over a UC Python UDF; **Feature Serving** = `FeatureSpec` on a serving endpoint

## Related Topics

- [Feature Store Fundamentals](./01-feature-store-fundamentals.md) — offline vs online concepts, training-serving skew
- [Feature Store Production Patterns](./04-feature-store-production.md) — governance and monitoring of feature pipelines
- [Advanced MLflow Tracking](./10-advanced-mlflow-tracking.md) — custom pyfunc request-time features
- [Feature Engineering Basics (shared)](../../../shared/fundamentals/feature-engineering-basics.md)

## Official Documentation

- [Point-in-time support using time series feature tables](https://docs.databricks.com/aws/en/machine-learning/feature-store/time-series)
- [Work with feature tables in Unity Catalog](https://docs.databricks.com/aws/en/machine-learning/feature-store/uc/feature-tables-uc)
- [Feature Engineering client API reference](https://api-docs.databricks.com/python/feature-engineering/latest/feature_engineering.client.html)
- [Databricks Online Feature Stores](https://docs.databricks.com/aws/en/machine-learning/feature-store/online-feature-store)
- [On-demand features with Python UDFs](https://docs.databricks.com/aws/en/machine-learning/feature-store/on-demand-features)
- [Feature Serving endpoints](https://docs.databricks.com/aws/en/machine-learning/feature-store/feature-function-serving)
- [Lakebase synced tables](https://docs.databricks.com/aws/en/oltp/projects/sync-tables)

---

**[← Previous: Advanced MLflow Tracking](./10-advanced-mlflow-tracking.md) | [↑ Back to Model Development](./README.md)**

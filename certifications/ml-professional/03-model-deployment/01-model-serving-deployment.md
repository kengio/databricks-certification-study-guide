---
title: Model Serving and Deployment
type: study-material
tags:
  - model-serving
  - rest-endpoint
  - batch-scoring
  - databricks-model-serving
  - pyfunc
status: published
---

# Model Serving and Deployment

## Overview

Once a model is registered in the MLflow Model Registry, you need to decide **how** it reaches
the systems that depend on it. Databricks supports three fundamentally different deployment
patterns, each with different trade-offs in latency, throughput, and operational complexity:

- **Real-time REST endpoint** — a managed HTTP API that returns predictions in milliseconds,
  suitable for user-facing features and fraud decisioning.
- **Batch scoring via `spark_udf`** — model applied as a distributed Spark transformation across
  millions of rows, writing results to Delta tables on a schedule.
- **Streaming inference** — the `spark_udf` pattern applied inside a Structured Streaming query,
  giving near-real-time scoring with seconds of latency and natural backpressure handling.

Choosing the wrong deployment mode is a common exam trap. The decision turns on two questions:
does the consumer need a result **right now** (real-time), or is a **periodic batch result**
acceptable? And, is the data volume so large that a distributed Spark job is cheaper than
per-record HTTP calls?

## Deployment Architecture

```mermaid
flowchart LR
    Registry["Model Registry\n(Unity Catalog)\n@champion"]

    Registry --> EP["REST Endpoint\n(Databricks Model Serving)\nHTTP POST — <500 ms"]
    Registry --> Batch["Batch Scoring\nmlflow.pyfunc.spark_udf\nScheduled job — minutes"]
    Registry --> Stream["Streaming Inference\nStructured Streaming + UDF\nContinuous — seconds"]

    EP --> App["Web / Mobile\nApp"]
    EP --> API["Downstream\nAPI Consumers"]
    Batch --> DeltaTable["Delta Table\ngold.fraud_scores"]
    Stream --> StreamTable["Delta Table\ngold.streaming_fraud_scores"]
```

## Databricks Model Serving (REST Endpoints)

Databricks Model Serving manages the compute, autoscaling, and health-check infrastructure so
you focus on the model. Under the hood, each endpoint runs the model inside a containerized
environment derived from the model's `MLmodel` metadata and `pip_requirements`.

You can deploy a custom model in three ways: the **Serving UI** (Serving → Create serving endpoint), the **REST API** (`POST /api/2.0/serving-endpoints`), or an SDK. Two SDKs work: the **Databricks SDK** (`WorkspaceClient().serving_endpoints`) and the **MLflow Deployments SDK** ([Create custom model serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints)).

```python
# Databricks SDK
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import EndpointCoreConfigInput, ServedEntityInput

client = WorkspaceClient()

endpoint = client.serving_endpoints.create(
    name="fraud-classifier-endpoint",
    config=EndpointCoreConfigInput(
        served_entities=[
            ServedEntityInput(
                entity_name="ml_catalog.fraud_models.fraud_classifier",   # UC model
                entity_version="3",
                workload_size="Small",
                scale_to_zero_enabled=False,
            )
        ]
    ),
)
```

```python
# MLflow Deployments SDK: same endpoint, MLflow-native client
import mlflow
from mlflow.deployments import get_deploy_client

mlflow.set_registry_uri("databricks-uc")
deploy_client = get_deploy_client("databricks")

deploy_client.create_endpoint(
    name="fraud-classifier-endpoint",
    config={
        "served_entities": [{
            "entity_name": "ml_catalog.fraud_models.fraud_classifier",
            "entity_version": "3",
            "workload_size": "Small",
            "scale_to_zero_enabled": False,
        }]
    },
)
# Later changes: deploy_client.update_endpoint_config(endpoint="fraud-classifier-endpoint", config={...})
```

> [!note]
> Older examples (including some later in this guide) use `served_models` / `ServedModelInput` with `model_name` / `model_version`. Current Databricks docs use **`served_entities`** / `ServedEntityInput` with `entity_name` / `entity_version`. Traffic routes still reference the served model **name** through `served_model_name`.

**Workload size** ("Compute scale-out" in the UI) sets how many requests a served model can process **at the same time**: **Small** handles 0–4 concurrent requests, **Medium** 8–16, and **Large** 16–64. Estimate the requirement as concurrent requests ≈ QPS × model execution time. Concurrency can also be set explicitly with `min_provisioned_concurrency` / `max_provisioned_concurrency` (multiples of 4) ([Create custom model serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints)).

**`scale_to_zero_enabled=True`** shuts down compute when the endpoint is idle. It reduces cost for low-traffic endpoints, but the first request afterwards pays a **cold start** (additional latency while capacity is restored). Databricks says scale to zero "is not recommended for production endpoints, as capacity is not guaranteed when scaled to zero."

**Endpoint states** you need to recognize:

- `READY` — serving requests normally.
- `UPDATING` — a config change is being applied; existing traffic is still served by the old config.
- `FAILED` — deployment failed (model load error, missing dependencies, bad signature).
- `NOT_READY` — being provisioned for the first time.

## Querying a REST Endpoint

The simplest SDK-based client is the **MLflow Deployments SDK** (MLflow 2.9+). `predict()` takes the endpoint name and the inputs, and handles authentication and JSON payload formatting for you ([Query serving endpoints for custom models](https://docs.databricks.com/aws/en/machine-learning/model-serving/score-custom-model-endpoints)):

```python
import mlflow.deployments

client = mlflow.deployments.get_deploy_client("databricks")
response = client.predict(
    endpoint="fraud-classifier-endpoint",
    inputs={"dataframe_split": {
        "columns": ["amount", "merchant_category", "hour_of_day"],
        "data": [[250.0, "online", 2], [15.0, "grocery", 14]],
    }},
)
print(response["predictions"])
```

Over plain REST, the endpoint exposes `POST https://<workspace>/serving-endpoints/<endpoint-name>/invocations`. Send the token in the `Authorization: Bearer` **header**, never in the query string, and put the inputs in the JSON **body**. Accepted body keys are `dataframe_split` (recommended), `dataframe_records`, and, for tensor inputs, `instances` (row format) or `inputs` (columnar). SQL users can call the endpoint with `ai_query`. That's a SQL function, not a Python SDK method.

```python
import json
import requests

# Retrieve credentials from the Databricks notebook context

token = (
    dbutils.notebook.entry_point
    .getDbutils().notebook().getContext()
    .apiToken().get()
)
host = spark.conf.get("spark.databricks.workspaceUrl")

url = f"https://{host}/serving-endpoints/fraud-classifier-endpoint/invocations"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
}

# dataframe_records: a list of dicts — one dict per row

payload_records = {
    "dataframe_records": [
        {"amount": 250.0, "merchant_category": "online", "hour_of_day": 2},
        {"amount": 15.0, "merchant_category": "grocery", "hour_of_day": 14},
    ]
}

response = requests.post(url, headers=headers, data=json.dumps(payload_records))
predictions = response.json()["predictions"]
print(predictions)  # [0.87, 0.03]
```

The alternative `dataframe_split` format uses column names and row arrays, which is more compact
for wide schemas:

```python
# dataframe_split: column names once, then rows as arrays

payload_split = {
    "dataframe_split": {
        "columns": ["amount", "merchant_category", "hour_of_day"],
        "data": [
            [250.0, "online", 2],
            [15.0, "grocery", 14],
        ],
    }
}

response = requests.post(url, headers=headers, data=json.dumps(payload_split))
```

Use `dataframe_records` when building payloads dynamically from dicts (note that it doesn't guarantee column order). Use `dataframe_split`, the documented recommendation, when payload size and column order matter: the column names are sent once rather than repeated for every row.

> [!note]
> Endpoints created with **route optimization** use a dedicated URL and accept only Databricks **OAuth** tokens, not personal access tokens. See [A/B Testing and Canary Deployments](./02-ab-testing-canary.md#route-optimization-for-high-traffic-endpoints).

## Batch Scoring with spark_udf

For offline batch scoring, `mlflow.pyfunc.spark_udf()` wraps the model as a Spark UDF. The
model is serialized and broadcast to each executor, so prediction runs **in parallel across
the cluster** — not on the driver. This is the correct approach for scoring millions of rows.

```python
import mlflow.pyfunc

# Load the champion version as a Spark UDF
# result_type must match the model's output dtype

fraud_udf = mlflow.pyfunc.spark_udf(
    spark,
    model_uri="models:/ml_catalog.fraud_models.fraud_classifier@champion",
    result_type="double",
)

# Apply UDF to any Spark DataFrame — runs on executors, fully distributed

transactions_df = spark.table("silver.transactions")

scored_df = transactions_df.withColumn(
    "fraud_score",
    fraud_udf("amount", "merchant_category", "hour_of_day"),
)

# Write results back to Delta — partitioning by date for downstream efficiency

(scored_df
    .write
    .format("delta")
    .mode("overwrite")
    .partitionBy("transaction_date")
    .saveAsTable("gold.fraud_scores"))
```

**Critical distinction**: `mlflow.pyfunc.load_model().predict(df)` runs on the **Spark driver**
only. For DataFrames with millions of rows this causes OOM errors and is effectively single-node
throughput. Always use `spark_udf()` for large-scale batch jobs.

The `result_type` parameter must match the model output. For classifiers returning class labels
use `"string"`, for probabilities use `"double"`, for multi-output models use an `ArrayType`.

## Streaming Inference

Streaming inference extends the `spark_udf` pattern to Structured Streaming. The UDF is
registered once and applied inside the streaming query, scoring each micro-batch as it arrives.
This is appropriate when you need results within seconds of data arrival but cannot justify
the infrastructure cost of a dedicated REST endpoint.

```python
import mlflow.pyfunc

# Same UDF creation — works identically in streaming and batch contexts

fraud_udf = mlflow.pyfunc.spark_udf(
    spark,
    model_uri="models:/ml_catalog.fraud_models.fraud_classifier@champion",
    result_type="double",
)

# Read from a Delta streaming source

streaming_scores = (
    spark.readStream
    .format("delta")
    .table("bronze.transactions_stream")
    .withColumn(
        "fraud_score",
        fraud_udf("amount", "merchant_category", "hour_of_day"),
    )
)

# Write scored micro-batches to a Delta table

query = (
    streaming_scores
    .writeStream
    .format("delta")
    .outputMode("append")
    .trigger(processingTime="30 seconds")
    .option("checkpointLocation", "/checkpoints/fraud_streaming_scores")
    .table("gold.streaming_fraud_scores")
)
```

The `trigger(processingTime="30 seconds")` setting means results are available within roughly
30 seconds of a transaction landing in the bronze table. For tighter SLAs, reduce the trigger
interval or switch to a REST endpoint.

## Custom pyfunc Models

The built-in MLflow flavors (`mlflow.sklearn`, `mlflow.xgboost`, etc.) cover most cases. Use
a **custom `pyfunc`** when:

- You need to bundle preprocessing (scalers, encoders) and the model into a single artifact.
- The model framework has no native MLflow flavor.
- The output format requires post-processing (e.g., returning a dict instead of a float).

```python
import mlflow.pyfunc
import pandas as pd


class FraudClassifierWithPreprocessing(mlflow.pyfunc.PythonModel):

    def load_context(self, context):
        """Called once when the model is loaded — good place for expensive initialization."""
        import joblib
        # Trusted artifacts packaged into this model by our own training run
        self.model = joblib.load(context.artifacts["model_path"])
        self.scaler = joblib.load(context.artifacts["scaler_path"])

    def predict(self, context, model_input):
        """model_input is a pandas DataFrame; must return a pandas DataFrame or Series."""
        scaled = self.scaler.transform(model_input)
        proba = self.model.predict_proba(scaled)[:, 1]
        return pd.DataFrame({
            "fraud_score": proba,
            "is_fraud": (proba > 0.5).astype(int),
        })


# Paths to pre-saved artifacts that will be bundled with the model

artifacts = {
    "model_path": "/Volumes/ml_catalog/fraud_models/artifacts/model.pkl",
    "scaler_path": "/Volumes/ml_catalog/fraud_models/artifacts/scaler.pkl",
}

from mlflow.models import infer_signature

input_example = X_sample.head(5)                      # raw input columns callers will send
signature = infer_signature(
    input_example,
    pd.DataFrame({"fraud_score": [0.1] * 5, "is_fraud": [0] * 5}),
)

mlflow.set_registry_uri("databricks-uc")              # register in Unity Catalog

with mlflow.start_run():
    mlflow.pyfunc.log_model(
        name="fraud_model",                           # MLflow 3 (replaces artifact_path)
        python_model=FraudClassifierWithPreprocessing(),
        artifacts=artifacts,                          # custom artifacts packaged with the model
        signature=signature,                          # required for Unity Catalog registration
        input_example=input_example,
        pip_requirements=["scikit-learn==1.3.0", "joblib==1.3.0"],
        registered_model_name="ml_catalog.fraud_models.fraud_pyfunc",
    )
```

`load_context()` is called once at model load time — put expensive initialization there, not in
`predict()`. The `artifacts` dict maps logical names to file URIs; MLflow copies these
files into the model artifact directory so they are available at serving time via
`context.artifacts["model_path"]`. Unity Catalog requires a **signature** to register a model ([Custom models](https://docs.databricks.com/aws/en/machine-learning/model-serving/custom-models)). Once registered, the version can be served with any of the three deployment methods above.

## Traffic Splitting for Canary Deployments

A serving endpoint can host multiple **served models** simultaneously, with a traffic routing
config that distributes requests by percentage. This is covered in depth in file 03, but the
endpoint update pattern is introduced here because it uses the same SDK objects as endpoint
creation.

```python
from databricks.sdk.service.serving import (
    Route,
    ServedEntityInput,
    TrafficConfig,
)

# Update an existing endpoint to split traffic 90/10

client.serving_endpoints.update_config(
    name="fraud-classifier-endpoint",
    served_entities=[
        ServedEntityInput(
            name="champion",
            entity_name="ml_catalog.fraud_models.fraud_classifier",
            entity_version="3",
            workload_size="Small",
            scale_to_zero_enabled=False,
        ),
        ServedEntityInput(
            name="challenger",
            entity_name="ml_catalog.fraud_models.fraud_classifier",
            entity_version="4",
            workload_size="Small",
            scale_to_zero_enabled=False,
        ),
    ],
    traffic_config=TrafficConfig(
        routes=[
            Route(served_model_name="champion", traffic_percentage=90),
            Route(served_model_name="challenger", traffic_percentage=10),
        ]
    ),
)
```

Note: `scale_to_zero_enabled=False` is recommended during A/B tests. If the challenger scales
to zero between requests, its first request after idle incurs cold-start latency that would
unfairly skew latency comparisons.

## Deployment Mode Comparison Table

| Mode | Typical Use Case | Latency | Throughput | Scaling | Primary API |
| :--- | :--- | :--- | :--- | :--- | :--- |
| REST Endpoint | Real-time, interactive, user-facing | <500 ms | Low-medium RPS | Autoscale (managed) | HTTP POST `/invocations` |
| Batch `spark_udf` | Score millions of rows on a schedule | Minutes | Very high | Spark cluster | `.withColumn(udf(...))` |
| Streaming UDF | Continuous scoring of arriving records | Seconds | Medium-high | Spark Streaming | `readStream` + UDF |

## Common Pitfalls

| Pitfall | Consequence | Fix |
| :--- | :--- | :--- |
| `scale_to_zero_enabled=True` for latency-sensitive endpoints | Cold start on the first request after idle; capacity not guaranteed | Disable scale-to-zero for production endpoints |
| Using `load_model().predict()` on a Spark DataFrame | Runs on driver only — OOM for large DataFrames | Use `spark_udf()` for distributed scoring |
| Missing `pip_requirements` in custom pyfunc | Serving container missing dependencies; `FAILED` state | Declare all non-standard packages explicitly |
| Wrong `result_type` in `spark_udf()` | Type mismatch error in Spark executor | Match `result_type` to model output dtype |
| Signature column mismatch | Serving returns 4xx with schema error | Ensure payload column names exactly match signature |
| Not setting `checkpointLocation` in streaming write | Query cannot recover after restart | Always set a stable checkpoint path on cloud storage |
| Hardcoding `model_version` in endpoint config | Manual update required for each promotion | Pair with alias-based automation or CI/CD pipeline |

## Practice Questions

> [!success]- Question 1: Batch vs REST for Large-Scale Scoring
>
> Your team needs to score 50 million transaction records every night and write the results to
> a Delta table for downstream reporting. Which approach is most appropriate?
>
> A) Create a Databricks REST serving endpoint and send each record as a separate HTTP request
> B) Load the model with `mlflow.pyfunc.load_model()` on the driver and call `.predict()` on the full DataFrame
> C) Use `mlflow.pyfunc.spark_udf()` and apply the UDF in a Spark batch job writing to Delta
> D) Use Structured Streaming with a 1-second trigger interval
>
> **Correct Answer: C**
>
> `spark_udf()` distributes prediction across all Spark executors, giving high throughput with
> no per-record HTTP overhead. Option A would require 50 million HTTP round-trips — extremely
> slow and expensive. Option B runs on the driver, causing OOM with 50 million rows. Option D
> is streaming infrastructure for continuously arriving data, not appropriate for a nightly
> batch over a static dataset.

---

> [!success]- Question 2: Scale-to-Zero Cold Start
>
> A fraud detection endpoint has `scale_to_zero_enabled=True`. A product manager reports that
> occasionally the first transaction of the morning takes over a minute to get a score. What
> is the most likely explanation?
>
> A) The model version was deleted from the registry overnight
> B) The endpoint scaled to zero during the overnight idle period and the first request pays a cold start
> C) MLflow tracing is enabled, which adds latency to every first request
> D) The workload size `SMALL` is too small for the model and needs to be upgraded to `MEDIUM`
>
> **Correct Answer: B**
>
> With `scale_to_zero_enabled=True`, Databricks Model Serving terminates endpoint compute after
> an idle period. The next request triggers a cold start while capacity is provisioned and the
> model is loaded; capacity is not guaranteed while scaled to zero. The fix is to disable
> scale-to-zero (`scale_to_zero_enabled=False`) for latency-sensitive endpoints, accepting
> higher idle cost in exchange for consistent response times.

---

> [!success]- Question 3: REST Endpoint Payload Format
>
> A developer queries a Databricks serving endpoint and receives a 400 error with the message
> "Invalid request format." The payload sent was:
>
> ```json
> {"inputs": [250.0, "online", 2]}
> ```
>
> Which payload format would be accepted by a standard pyfunc MLflow serving endpoint?
>
> A) `{"inputs": [250.0, "online", 2]}`
> B) `{"dataframe_records": [{"amount": 250.0, "merchant_category": "online", "hour_of_day": 2}]}`
> C) `{"records": [{"amount": 250.0, "merchant_category": "online", "hour_of_day": 2}]}`
> D) `{"data": [[250.0, "online", 2]]}`
>
> **Correct Answer: B**
>
> For a model whose signature is a set of **named columns**, send a DataFrame payload:
> `dataframe_records` (list of row dicts) or `dataframe_split` (column names + row arrays, the
> documented recommendation). The `"inputs"` and `"instances"` keys are accepted for **tensor**
> inputs, so a bare positional list under `"inputs"` doesn't match this column-based signature.
> Options C and D use keys (`"records"`, `"data"`) that are not recognized at all and return a 400 error.

## Use Cases

- **Real-Time Fraud Scoring API**: Deploying a fraud detection model as a REST endpoint with `scale_to_zero_enabled=False` for consistent sub-500ms latency, with a canary deployment strategy that routes 10% of traffic to the challenger model version.
- **Nightly Batch Scoring at Scale**: Using `mlflow.pyfunc.spark_udf()` to score 50 million transaction records distributed across a Spark cluster, writing results to a partitioned Delta table for downstream reporting dashboards.

## Common Issues & Errors

### Endpoint Stuck in FAILED State After Deployment

**Scenario:** A custom pyfunc model deploys but the endpoint immediately enters `FAILED` state. The model loads fine locally.
**Fix:** Check the model's `pip_requirements` -- the serving container only installs packages explicitly listed. Missing dependencies (e.g., `scikit-learn`, `joblib`) cause import errors at container startup. Also verify the model signature matches the expected input schema.

### Model Serving Cold Start Latency

**Scenario:** An endpoint with `scale_to_zero_enabled=True` responds slowly (cold start) after an idle period, causing timeouts in the calling application.
**Fix:** Disable scale-to-zero for latency-sensitive and production endpoints (`scale_to_zero_enabled=False`). If cost is a concern, keep a small minimum provisioned concurrency (concurrency values are multiples of 4) so capacity stays warm. For dev/test endpoints that can tolerate startup delays, scale-to-zero is fine.

## Exam Tips

> [!tip]
>
> - "SDK-based approach that simplifies authentication and payload handling" means the MLflow Deployments `predict(endpoint=..., inputs=...)`. `ai_query` is SQL, and the MLflow Tracking client doesn't query endpoints.
> - REST calls put the token in the `Authorization` header and the inputs in the JSON body, never in query-string parameters.
> - Registering a custom PyFunc in Unity Catalog needs `mlflow.set_registry_uri("databricks-uc")`, a three-level name, and a **signature**. Custom files travel through the `artifacts` dict.
> - "Compute scale-out" / workload size = concurrency (Small 0–4, Medium 8–16, Large 16–64).

## Key Takeaways

- **Three deployment modes**: REST endpoint (<500 ms, real-time), batch `spark_udf` (distributed, minutes, high throughput), streaming UDF (seconds, continuous)
- **Scale-to-zero cold start**: `scale_to_zero_enabled=True` saves idle cost but adds cold-start latency after idle and does not guarantee capacity — not recommended for production endpoints
- **`spark_udf` vs `load_model().predict()`**: `spark_udf()` runs on executors (distributed); `.predict()` runs on the driver — use `.predict()` only on small DataFrames
- **Payload formats**: `dataframe_split` (recommended) or `dataframe_records` for tabular models; `instances` / `inputs` for tensor models; `"records"` / `"data"` are invalid
- **Query clients**: MLflow Deployments SDK `get_deploy_client("databricks").predict(endpoint=..., inputs=...)` or REST `POST /serving-endpoints/<name>/invocations` with a Bearer header
- **Custom pyfunc**: `load_context()` called once at load time for initialization; `predict()` receives and returns a pandas DataFrame or Series
- **Workload sizes** (concurrency): Small 0–4, Medium 8–16, Large 16–64 concurrent requests
- **Deploy custom models** via the Serving UI, REST API, or SDK (Databricks SDK `serving_endpoints.create` / MLflow Deployments `create_endpoint`)
- **Endpoint states to recognize**: READY, UPDATING (old config still serves), FAILED (model load error), NOT_READY (first provision)

## Related Topics

- [Model Versioning & Registry](../02-ml-ops/01-model-versioning-registry.md)
- [A/B Testing & Canary Deployments](./02-ab-testing-canary.md)
- [Model Lifecycle Orchestration](../02-ml-ops/02-model-lifecycle-orchestration.md)
- [Advanced MLflow Tracking](../01-model-development/10-advanced-mlflow-tracking.md) — custom pyfunc with request-time features

## Official Documentation

- [Deploy custom models with Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/custom-models)
- [Create custom model serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints)
- [Query serving endpoints for custom models](https://docs.databricks.com/aws/en/machine-learning/model-serving/score-custom-model-endpoints)
- [Route optimization on serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/route-optimization)

---

**[↑ Back to Model Deployment](./README.md) | [Next: A/B Testing and Canary Deployments →](./02-ab-testing-canary.md)**

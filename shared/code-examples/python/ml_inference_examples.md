---
title: ML Inference Examples
tags:
  - python
  - mlflow
  - model-serving
  - inference
  - code-examples
---

# ML Inference Examples

Code examples for batch and real-time model inference on Databricks. MLflow code targets **MLflow 3** (current Databricks practice as of Oct 2026); see the [MLflow 2 → 3 mapping](../../cheat-sheets/mlflow-quick-ref.md#mlflow-2--3-mapping).

## Batch Inference with spark_udf

The most common pattern for scoring large datasets — wraps an MLflow model as a Spark UDF.

### Basic Batch Scoring

```python
import mlflow

# Load model as a Spark UDF
model_uri = "models:/ml.prod.churn_model@champion"
predict_udf = mlflow.pyfunc.spark_udf(spark, model_uri=model_uri)

# Score a DataFrame
scored_df = (spark.table("ml.features.customer_features")
    .withColumn("prediction", predict_udf("feature1", "feature2", "feature3")))

# Write predictions to a Delta table
(scored_df.write
    .format("delta")
    .mode("overwrite")
    .saveAsTable("ml.results.churn_predictions"))
```

### Batch Scoring with Feature Store

```python
from databricks.feature_engineering import FeatureEngineeringClient

fe = FeatureEngineeringClient()

# Score using features looked up from Feature Store
predictions = fe.score_batch(
    model_uri="models:/ml.prod.churn_model@champion",
    df=spark.table("ml.scoring.customer_ids"),  # just primary keys + any request-time features
    result_type="double"
)

predictions.display()
```

## Real-Time Inference via Model Serving

### Query a Serving Endpoint (Python)

```python
import requests
import json

endpoint_url = "https://<workspace>.databricks.com/serving-endpoints/churn-model/invocations"
token = dbutils.secrets.get(scope="ml", key="serving-token")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

payload = {
    "dataframe_records": [
        {"feature1": 0.5, "feature2": 1.2, "feature3": "category_a"},
        {"feature1": 0.8, "feature2": 0.3, "feature3": "category_b"}
    ]
}

response = requests.post(endpoint_url, headers=headers, json=payload)
predictions = response.json()["predictions"]
print(predictions)  # [0.82, 0.15]
```

### Query Using the Databricks SDK

```python
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()

response = w.serving_endpoints.query(
    name="churn-model",
    dataframe_records=[
        {"feature1": 0.5, "feature2": 1.2, "feature3": "category_a"}
    ]
)

print(response.predictions)
```

## Model Registry Operations

### Register a Model to Unity Catalog

```python
import mlflow

mlflow.set_registry_uri("databricks-uc")  # default in MLflow 3; required on MLflow 2.x

with mlflow.start_run():
    model_info = mlflow.sklearn.log_model(
        sk_model=model,
        name="model",  # MLflow 3: name= replaces artifact_path=
        registered_model_name="ml.prod.churn_model"
    )

print(model_info.model_uri)                    # models:/<model_id>
print(model_info.registered_model_version)     # new UC version number
```

### Promote a Model Version with Aliases

```python
from mlflow import MlflowClient

client = MlflowClient()

# Set champion alias to a specific version
client.set_registered_model_alias(
    name="ml.prod.churn_model",
    alias="champion",
    version=5
)

# Load model by alias
model = mlflow.pyfunc.load_model("models:/ml.prod.churn_model@champion")
```

### Compare Model Versions

```python
from mlflow import MlflowClient

client = MlflowClient()

# Get current champion version
champion_version = client.get_model_version_by_alias("ml.prod.churn_model", "champion")
print(f"Champion: v{champion_version.version}, run_id={champion_version.run_id}")

# Get metrics for comparison
champion_run = client.get_run(champion_version.run_id)
print(f"Champion AUC: {champion_run.data.metrics['auc']}")
```

## A/B Testing with Traffic Routing

### Configure Traffic Split

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import (
    EndpointCoreConfigInput,
    ServedEntityInput,
    TrafficConfig,
    Route
)

w = WorkspaceClient()

w.serving_endpoints.update_config(
    name="churn-model",
    served_entities=[
        ServedEntityInput(
            entity_name="ml.prod.churn_model",
            entity_version="5",
            name="champion",
            scale_to_zero_enabled=True
        ),
        ServedEntityInput(
            entity_name="ml.prod.churn_model",
            entity_version="6",
            name="challenger",
            scale_to_zero_enabled=True
        )
    ],
    traffic_config=TrafficConfig(
        routes=[
            Route(served_model_name="champion", traffic_percentage=90),
            Route(served_model_name="challenger", traffic_percentage=10)
        ]
    )
)
```

## MLflow Model Evaluation

### Evaluate a Classification Model

```python
import mlflow

# mlflow.evaluate() is deprecated as of MLflow 3.0; classic ML uses mlflow.models.evaluate()
results = mlflow.models.evaluate(
    model="models:/ml.prod.churn_model@champion",
    data=eval_df,
    targets="label",
    model_type="classifier",
    evaluators="default"
)

print(f"Accuracy: {results.metrics['accuracy_score']}")
print(f"AUC: {results.metrics['roc_auc']}")

# View per-row results
results.tables["eval_results_table"].display()
```

### Evaluate a RAG / LLM Application

MLflow 3 evaluates GenAI apps with `mlflow.genai.evaluate()` and scorers from `mlflow.genai.scorers` (the MLflow 2.x `mlflow.evaluate(model_type="question-answering")` + `mlflow.metrics.genai` path is legacy).

```python
import mlflow
from mlflow.genai.scorers import Correctness, RelevanceToQuery, RetrievalGroundedness

eval_dataset = [
    {
        "inputs": {"question": "How do I cancel my subscription?"},
        "expectations": {"expected_response": "Go to Settings > Billing and choose Cancel."},
    },
]

results = mlflow.genai.evaluate(
    data=eval_dataset,
    predict_fn=rag_app,  # traced app; called as rag_app(question=...)
    scorers=[
        Correctness(),            # compares to expectations
        RelevanceToQuery(),
        RetrievalGroundedness(),  # needs a RETRIEVER span (@mlflow.trace(span_type=SpanType.RETRIEVER))
    ],
)

print(results.metrics)
results.result_df.head()
```

```python
# Same evaluation against a deployed chat endpoint
predict_fn = mlflow.genai.to_predict_fn("endpoints:/rag-chatbot")
chat_eval = [{"inputs": {"messages": [{"role": "user", "content": "How do I cancel my subscription?"}]}}]
results = mlflow.genai.evaluate(data=chat_eval, predict_fn=predict_fn, scorers=[RelevanceToQuery()])
```

## Custom PyFunc Model

### Wrap Custom Logic as an MLflow Model

```python
import mlflow

class ChurnModelWithPreprocessing(mlflow.pyfunc.PythonModel):
    def load_context(self, context):
        import joblib
        self.model = joblib.load(context.artifacts["model_path"])
        self.scaler = joblib.load(context.artifacts["scaler_path"])

    def predict(self, context, model_input):
        scaled = self.scaler.transform(model_input)
        return self.model.predict_proba(scaled)[:, 1]

# Log and register
with mlflow.start_run():
    mlflow.pyfunc.log_model(
        name="model",
        python_model=ChurnModelWithPreprocessing(),
        artifacts={
            "model_path": "/tmp/model.joblib",
            "scaler_path": "/tmp/scaler.joblib"
        },
        registered_model_name="ml.prod.churn_model_custom"
    )
```

## Official Documentation

- [Get started with MLflow 3 — Databricks](https://docs.databricks.com/aws/en/mlflow/mlflow-3-install)
- [Manage model lifecycle in Unity Catalog (aliases)](https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/)
- [Legacy LLM evaluation (`mlflow.evaluate` deprecation, `mlflow.models.evaluate`) — mlflow.org](https://mlflow.org/docs/latest/genai/eval-monitor/legacy-llm-evaluation/)
- [MLflow evaluation examples for GenAI (`to_predict_fn`)](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/eval-examples)
- [Create and manage serving endpoints (`served_entities`)](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints)
- [Serve multiple models to an endpoint (traffic split)](https://docs.databricks.com/aws/en/machine-learning/model-serving/serve-multiple-models-to-serving-endpoint)

---

**[↑ Back to Code Examples](../README.md)**

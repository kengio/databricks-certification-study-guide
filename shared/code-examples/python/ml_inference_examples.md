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

Code examples for batch and real-time model inference on Databricks.

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

mlflow.set_registry_uri("databricks-uc")

with mlflow.start_run():
    mlflow.sklearn.log_model(
        sk_model=model,
        artifact_path="model",
        registered_model_name="ml.prod.churn_model"
    )
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

results = mlflow.evaluate(
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

```python
import mlflow

results = mlflow.evaluate(
    model=rag_chain,
    data=eval_dataset,  # DataFrame with "question" and "ground_truth" columns
    model_type="question-answering",
    extra_metrics=[
        mlflow.metrics.faithfulness(),
        mlflow.metrics.relevance(),
        mlflow.metrics.answer_correctness(),
    ]
)

print(f"Faithfulness: {results.metrics['faithfulness/v1/mean']}")
print(f"Relevance: {results.metrics['relevance/v1/mean']}")
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
        artifact_path="model",
        python_model=ChurnModelWithPreprocessing(),
        artifacts={
            "model_path": "/tmp/model.joblib",
            "scaler_path": "/tmp/scaler.joblib"
        },
        registered_model_name="ml.prod.churn_model_custom"
    )
```

---

**[↑ Back to Code Examples](../README.md)**

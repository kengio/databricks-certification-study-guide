---
title: "Lab 04 — MLflow Tracking and Model Registry in UC"
type: lab
tags:
  - labs
  - mlflow
  - model-registry
  - unity-catalog
  - ml
status: published
---

# Lab 04 — MLflow Tracking and Model Registry in UC

Train a regression model, track every run with MLflow, register the best version in Unity Catalog, promote it to the `Production` alias, and serve it behind a Model Serving endpoint.

> [!abstract]
>
> - **MLflow autologging** captures params, metrics, and the model artifact automatically
> - **Model Registry in UC** stores model versions under `catalog.schema.model_name`
> - **Model aliases** (`Production`, `Champion`, `Challenger`) replace the legacy stage system
> - **Model Serving** loads the aliased version behind a REST endpoint
> - **Inference Tables** capture every request/response for monitoring

> [!tip] What you'll exercise
>
> - `mlflow.set_registry_uri("databricks-uc")` to register in UC instead of workspace registry
> - Logging metrics across multiple runs and identifying the best
> - Setting a model alias and querying by alias
> - Calling a Model Serving endpoint from Python

---

## Setup — a UC schema for ML assets

```sql
USE CATALOG main;
CREATE SCHEMA IF NOT EXISTS ml_lab;
```

## Step 1 — Train + log with autologging

```python
import mlflow
import mlflow.sklearn
from sklearn.datasets import make_regression
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split

# Register in UC, not the workspace model registry
mlflow.set_registry_uri("databricks-uc")
mlflow.autolog()  # autologs params, metrics, model artifact, signature

X, y = make_regression(n_samples=10_000, n_features=20, noise=10.0, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

mlflow.set_experiment("/Users/<your-email>/ml-lab-ridge")

# Train 3 variants with different alpha and log each as a separate run
for alpha in [0.1, 1.0, 10.0]:
    with mlflow.start_run(run_name=f"ridge_alpha={alpha}") as run:
        model = Ridge(alpha=alpha)
        model.fit(X_train, y_train)
        score = model.score(X_test, y_test)
        mlflow.log_metric("r2_test", score)
        print(f"alpha={alpha} → r2={score:.4f}, run_id={run.info.run_id}")
```

## Step 2 — Find the best run programmatically

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()
experiment = client.get_experiment_by_name("/Users/<your-email>/ml-lab-ridge")

best_run = client.search_runs(
    experiment_ids=[experiment.experiment_id],
    order_by=["metrics.r2_test DESC"],
    max_results=1,
)[0]

print(f"Best run: {best_run.info.run_id}, r2 = {best_run.data.metrics['r2_test']:.4f}")
```

## Step 3 — Register the best run in UC

```python
model_uri = f"runs:/{best_run.info.run_id}/model"  # autologged artifact path
registered_model = "main.ml_lab.ridge_regression"

registered_version = mlflow.register_model(
    model_uri=model_uri,
    name=registered_model,
)

print(f"Registered as version {registered_version.version}")
```

## Step 4 — Set the `Production` alias

```python
client.set_registered_model_alias(
    name=registered_model,
    alias="Production",
    version=registered_version.version,
)

# Query by alias — the canonical lookup pattern
import mlflow.pyfunc
prod_model = mlflow.pyfunc.load_model(f"models:/{registered_model}@Production")
prediction = prod_model.predict(X_test[:5])
print(prediction)
```

## Step 5 — Promote a Challenger and compare

```python
# Train one more candidate
with mlflow.start_run(run_name="ridge_alpha=5.0") as run:
    model = Ridge(alpha=5.0)
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    mlflow.log_metric("r2_test", score)
    challenger_run_id = run.info.run_id

challenger_version = mlflow.register_model(
    model_uri=f"runs:/{challenger_run_id}/model",
    name=registered_model,
)

client.set_registered_model_alias(
    name=registered_model,
    alias="Challenger",
    version=challenger_version.version,
)

# Side-by-side score comparison
import numpy as np
prod_pred  = mlflow.pyfunc.load_model(f"models:/{registered_model}@Production").predict(X_test)
chal_pred  = mlflow.pyfunc.load_model(f"models:/{registered_model}@Challenger").predict(X_test)
print("Prod    R²:", 1 - np.sum((y_test - prod_pred) ** 2) / np.sum((y_test - y_test.mean()) ** 2))
print("Chal    R²:", 1 - np.sum((y_test - chal_pred) ** 2) / np.sum((y_test - y_test.mean()) ** 2))
```

If `Challenger > Production`, promote:

```python
client.set_registered_model_alias(
    name=registered_model,
    alias="Production",
    version=challenger_version.version,
)
```

## Step 6 — Deploy to Model Serving

```python
from databricks.sdk import WorkspaceClient
w = WorkspaceClient()

w.serving_endpoints.create(
    name="ridge-regression",
    config={
        "served_entities": [{
            "entity_name": registered_model,
            "entity_version": str(registered_version.version),
            "workload_size": "Small",
            "scale_to_zero_enabled": True,
        }],
        "auto_capture_config": {
            "catalog_name": "main",
            "schema_name": "ml_lab",
            "table_name_prefix": "ridge_regression_inference",
            "enabled": True,
        },
    },
)
```

The `auto_capture_config` enables Inference Tables — every request/response lands in `main.ml_lab.ridge_regression_inference_payload`.

> [!note]
> `auto_capture_config` is the legacy path. Newer endpoints can configure Inference Tables under `ai_gateway.inference_table_config` (same `catalog_name` / `schema_name` / `table_name_prefix` fields). Both forms still work; Databricks is migrating customers to the AI Gateway-managed form.

## Step 7 — Invoke the endpoint

```python
import requests
import os
import json

endpoint = "https://<workspace-hostname>/serving-endpoints/ridge-regression/invocations"
headers = {
    "Authorization": f"Bearer {dbutils.notebook.entry_point.getDbutils().notebook().getContext().apiToken().get()}",
    "Content-Type": "application/json",
}
payload = {"dataframe_records": [{f"feature_{i}": float(X_test[0, i]) for i in range(20)}]}

response = requests.post(endpoint, headers=headers, data=json.dumps(payload))
print(response.json())
```

## Step 8 — Inspect Inference Tables

```sql
-- Wait a few minutes after invocations for the table to materialise
SELECT *
FROM main.ml_lab.ridge_regression_inference_payload
ORDER BY timestamp_ms DESC
LIMIT 10;
```

## Cleanup

```python
# Delete the endpoint
w.serving_endpoints.delete(name="ridge-regression")

# Delete the registered model + all versions
client.delete_registered_model(name=registered_model)
```

```sql
DROP TABLE IF EXISTS main.ml_lab.ridge_regression_inference_payload;
DROP SCHEMA IF EXISTS main.ml_lab CASCADE;
```

## Related Study Material

- [MLflow basics (shared)](../shared/fundamentals/mlflow-basics.md)
- [MLflow cheat sheet (shared)](../shared/cheat-sheets/mlflow-quick-ref.md)
- [ML Associate — MLflow Deployment](../certifications/ml-associate/04-model-deployment/README.md)
- [ML Professional — Model Production Lifecycle](../certifications/ml-professional/03-model-deployment/README.md)

---

**[← Previous: Lakeflow Declarative Pipelines](./03-lakeflow-declarative-pipelines.md) | [↑ Back to Labs](./README.md) | [Next: Mosaic AI Vector Search RAG demo →](./05-mosaic-ai-rag-demo.md)**

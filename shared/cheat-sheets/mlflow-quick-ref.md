---
tags: [cheat-sheet, mlflow, machine-learning, ml-associate, ml-professional]
---

# MLflow Quick Reference

Quick reference for MLflow tracking, model registry, and inference APIs on Databricks.

## Experiment Tracking

```python
import mlflow

# Set experiment (creates if not exists)
mlflow.set_experiment("/Users/team/my-experiment")

# Start a run
with mlflow.start_run(run_name="my-run"):
    mlflow.log_param("lr", 0.01)            # Single param
    mlflow.log_params({"n_trees": 100, "depth": 5})  # Multiple params

    mlflow.log_metric("accuracy", 0.92)      # Single metric
    mlflow.log_metric("loss", 0.08, step=10) # Metric with step

    mlflow.log_artifact("plot.png")          # Single file
    mlflow.log_artifacts("outputs/")         # Directory

    mlflow.set_tag("team", "ml-platform")
```text

## Autologging

```python
mlflow.autolog()                          # All supported frameworks
mlflow.sklearn.autolog()                  # sklearn only
mlflow.xgboost.autolog()
mlflow.pytorch.autolog()
mlflow.tensorflow.autolog()
mlflow.spark.autolog()
```text

## Logging Models

```python
# sklearn
mlflow.sklearn.log_model(model, "model", registered_model_name="my-model")

# PyTorch
mlflow.pytorch.log_model(model, "model")

# Custom Python function
mlflow.pyfunc.log_model("model", python_model=MyModel(), artifacts={...})

# Log model with signature
from mlflow.models import infer_signature
signature = infer_signature(X_train, model.predict(X_train))
mlflow.sklearn.log_model(model, "model", signature=signature)
```text

## Model Registry — Aliases (MLflow 2.x)

```python
from mlflow import MlflowClient
client = MlflowClient()

# Register
result = mlflow.register_model("runs:/RUN_ID/model", "my-model")

# Set alias
client.set_registered_model_alias("my-model", "champion", version=3)

# Delete alias
client.delete_registered_model_alias("my-model", "challenger")

# Load by alias
model = mlflow.pyfunc.load_model("models:/my-model@champion")
```text

## Model Registry — Legacy Stages

| Stage | Description |
| :--- | :--- |
| `None` | Newly registered |
| `Staging` | Testing / validation |
| `Production` | Serving live traffic |
| `Archived` | Retired |

```python
# Transition stage
client.transition_model_version_stage("my-model", version=3, stage="Production")

# Load by stage (legacy)
model = mlflow.pyfunc.load_model("models:/my-model/Production")
```text

## Loading Models

```python
# Generic (any framework)
model = mlflow.pyfunc.load_model("models:/my-model@champion")
predictions = model.predict(df)

# Framework-specific
model = mlflow.sklearn.load_model("models:/my-model/3")
model = mlflow.pytorch.load_model("runs:/RUN_ID/model")

# Spark UDF for batch inference
udf = mlflow.pyfunc.spark_udf(spark, "models:/my-model@champion", result_type="double")
df = df.withColumn("prediction", udf(*feature_cols))
```text

## Searching Runs

```python
runs = mlflow.search_runs(
    experiment_names=["/Users/team/my-experiment"],
    filter_string="metrics.f1_score > 0.85 AND params.model_type = 'rf'",
    order_by=["metrics.f1_score DESC"],
    max_results=10
)
# Returns pandas DataFrame
```text

## Unity Catalog Model Registry

```python
# Use UC registry (three-level namespace)
mlflow.set_registry_uri("databricks-uc")

mlflow.sklearn.log_model(
    model,
    artifact_path="model",
    registered_model_name="prod_catalog.ml_models.my-model"
)
```text

## Key Numbers

| Setting | Value |
| :--- | :--- |
| Default artifact storage (Databricks) | DBFS or UC volumes |
| Model URI formats | `runs:/<run_id>/<path>`, `models:/<name>/<version>`, `models:/<name>@<alias>` |
| Autolog frameworks | sklearn, XGBoost, LightGBM, PyTorch, TF, Keras, Spark ML, HuggingFace |

## Common Errors

| Error | Fix |
| :--- | :--- |
| `MlflowException: Run not active` | Use `with mlflow.start_run():` or call `mlflow.end_run()` |
| `Model not found in registry` | Check spelling and that the model was registered, not just logged |
| Alias not found | Use `client.get_registered_model_alias()` to verify alias exists |

## Related Topics

- [MLflow Basics (Fundamentals)](../fundamentals/mlflow-basics.md)
- [ML Associate Certification](../../certifications/ml-associate/README.md)
- [Interview Prep — PySpark API](../interview-prep/08-pyspark-api.md)

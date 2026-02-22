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
```

## Autologging

```python
mlflow.autolog()                          # All supported frameworks
mlflow.sklearn.autolog()                  # sklearn only
mlflow.xgboost.autolog()
mlflow.pytorch.autolog()
mlflow.tensorflow.autolog()
mlflow.spark.autolog()
```

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
```

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
```

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
```

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
```

## Searching Runs

```python
runs = mlflow.search_runs(
    experiment_names=["/Users/team/my-experiment"],
    filter_string="metrics.f1_score > 0.85 AND params.model_type = 'rf'",
    order_by=["metrics.f1_score DESC"],
    max_results=10
)
# Returns pandas DataFrame
```

## Unity Catalog Model Registry

```python
# Use UC registry (three-level namespace)
mlflow.set_registry_uri("databricks-uc")

mlflow.sklearn.log_model(
    model,
    artifact_path="model",
    registered_model_name="prod_catalog.ml_models.my-model"
)
```

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

## MLflow for GenAI

MLflow 2.x adds LLM-specific tracking and evaluation:

```python
import mlflow

# Log a table of evaluation inputs/outputs
with mlflow.start_run():
    mlflow.log_table(
        data={
            "question": ["What is Delta Lake?", "How does Auto Loader work?"],
            "answer":   ["Delta Lake is...",     "Auto Loader uses cloudFiles..."],
            "context":  ["context A",            "context B"]
        },
        artifact_file="eval_dataset.json"
    )

# Evaluate an LLM endpoint with built-in metrics
results = mlflow.evaluate(
    model="endpoints:/databricks-meta-llama-3-1-70b-instruct",
    data=eval_df,           # DataFrame with "inputs" and optional "targets" columns
    model_type="question-answering",  # or "text", "text-summarization"
    evaluators="default"
)

print(results.metrics)  # toxicity, readability, answer_similarity, ...
```

```python
# Custom scorer added alongside built-in metrics
from mlflow.metrics import make_genai_metric

conciseness = make_genai_metric(
    name="conciseness",
    definition="Rate how concisely the answer addresses the question.",
    grading_prompt="Score 1-5 where 5 is very concise.",
    model="endpoints:/databricks-meta-llama-3-1-70b-instruct"
)

results = mlflow.evaluate(
    model="endpoints:/my-rag-app",
    data=eval_df,
    model_type="question-answering",
    extra_metrics=[conciseness]
)
```

## Related Topics

- [MLflow Basics (Fundamentals)](../fundamentals/mlflow-basics.md)
- [ML Associate Certification](../../certifications/ml-associate/README.md)
- [Interview Prep — PySpark API](../interview-prep/08-pyspark-api.md)

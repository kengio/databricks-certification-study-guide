---
title: MLflow Tracking
type: study-material
tags:
  - mlflow
  - tracking
  - logging
  - experimentation
---

# MLflow Tracking

## Overview

MLflow Tracking is the core component for logging, storing, and querying machine learning experiments. It captures parameters, metrics, artifacts, and models to enable reproducibility and comparison.

## MLflow Architecture

```mermaid
flowchart TB
    subgraph Training["Training Code"]
        Code["ML Code"]
    end

    subgraph Tracking["MLflow Tracking Server"]
        Logger["MLflow Logger"]
        Backend["Backend Store"]
        Artifact["Artifact Store"]
    end

    subgraph Storage["Storage"]
        DB["Metadata DB"]
        S3["Object Storage<br/>S3, GCS, ADLS"]
    end

    subgraph UI["MLflow UI"]
        Browser["Web Interface"]
    end

    Code -->|log| Logger
    Logger -->|metadata| Backend
    Logger -->|files| Artifact
    Backend --> DB
    Artifact --> S3
    DB --> Browser
    S3 --> Browser
```

## Core Concepts

### **Tracking APIs**

```python
# Initialize MLflow

import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, auc_score

# Start a run

mlflow.start_run(run_name="rf_baseline")

# Log parameters (hyperparameters)

mlflow.log_param("n_estimators", 100)
mlflow.log_param("max_depth", 10)
mlflow.log_param("min_samples_split", 2)

# Log metrics (performance measurements)

mlflow.log_metric("accuracy", 0.92)
mlflow.log_metric("auc", 0.95)
mlflow.log_metric("precision", 0.91)
mlflow.log_metric("recall", 0.93)

# Log model

model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)
mlflow.sklearn.log_model(model, "model")

# End run

mlflow.end_run()
```

### **Logging Parameters**

```python
# Log single parameter

mlflow.log_param("learning_rate", 0.01)

# Log multiple parameters

params = {
    "optimizer": "adam",
    "batch_size": 32,
    "epochs": 100,
    "dropout": 0.5,
    "l2_reg": 0.001
}
mlflow.log_params(params)
```

### **Logging Metrics**

```python
# Single metric

mlflow.log_metric("loss", 0.456)

# Multiple metrics

metrics = {
    "train_accuracy": 0.89,
    "val_accuracy": 0.87,
    "test_accuracy": 0.86,
    "f1_score": 0.88,
    "auc": 0.91
}
mlflow.log_metrics(metrics)

# Track metric over time (epochs)

for epoch in range(1, 101):
    train_loss = train_model(epoch)
    val_loss = validate_model(epoch)

    mlflow.log_metric("train_loss", train_loss, step=epoch)
    mlflow.log_metric("val_loss", val_loss, step=epoch)
```

### **Logging Artifacts**

```python
import json
import matplotlib.pyplot as plt
import pickle

# Log text files

with open("training_log.txt", "w") as f:
    f.write("Training completed successfully")
mlflow.log_artifact("training_log.txt")

# Log plots

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [1, 4, 9])
plt.savefig("learning_curve.png")
mlflow.log_artifact("learning_curve.png")

# Log model data

model_dict = {"model": model, "scaler": scaler}
with open("artifacts.pkl", "wb") as f:
    pickle.dump(model_dict, f)
mlflow.log_artifact("artifacts.pkl")

# Log entire directory

mlflow.log_artifact("config/")
```

## MLflow Tracking UI

### **Viewing Experiments**

```python

# Access MLflow UI
# Databricks: Workspace → Experiments
# Local: http://localhost:5000 after running mlflow ui

# Create experiment

mlflow.set_experiment("/Users/user@company.com/churn_model")

# Get experiment ID

exp = mlflow.get_experiment_by_name("/Users/user@company.com/churn_model")
print(f"Experiment ID: {exp.experiment_id}")

# List all runs in experiment

from mlflow.tracking import MlflowClient
client = MlflowClient()
runs = client.search_runs(exp.experiment_id)
for run in runs:
    print(f"Run: {run.info.run_name}, Status: {run.info.status}")
```

## Databricks Integration

### **Automatic Tracking**

```python

# Databricks automatically creates:/Experiments/Users/{user_email}/notebook_name
# Each notebook cell execution creates a run

%python
import mlflow

# Automatically associated with notebook experiment

mlflow.log_param("model_type", "gradient_boosting")
mlflow.log_metric("accuracy", 0.95)

# Check active experiment

active_exp = mlflow.get_experiment_by_name(
    f"/Users/{<user_email>}/notebook_name"
)
print(f"Active experiment: {active_exp.name}")
```

### **Unity Catalog Integration**

```python
# Store models in Unity Catalog

mlflow.set_registry_uri("databricks-uc")

# Log model to UC

mlflow.sklearn.log_model(
    model,
    artifact_path="model",
    registered_model_name="catalog.schema.model_name"
)

# Load from UC

model = mlflow.sklearn.load_model(
    "models:/catalog.schema.model_name/stageName"
)
```

## Advanced Tracking Features

### **Custom Tags**

```python
# Tag runs for organization

mlflow.set_tag("project", "customer_churn")
mlflow.set_tag("team", "data_science")
mlflow.set_tag("environment", "production")
mlflow.set_tag("algorithm_type", "tree_based")

# Set multiple tags

tags = {
    "experiment_type": "hyperparameter_tuning",
    "baseline": "yes",
    "model_complexity": "high"
}
mlflow.set_tags(tags)
```

### **Run Management**

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Get current run

active_run = mlflow.active_run()
run_id = active_run.info.run_id

# Update run metadata

client.set_tag(run_id, "status", "production_ready")

# Get run details

run = client.get_run(run_id)
print(f"Duration: {run.info.end_time - run.info.start_time} ms")

# Delete run

client.delete_run(run_id)

# Restore run

client.restore_run(run_id)
```

### **Searching Experiments**

```python
# Search runs by metrics

top_runs = client.search_runs(
    experiment_ids=["1"],
    filter_string="metrics.accuracy > 0.90 and params.model_type = 'rf'",
    order_by=["metrics.accuracy DESC"],
    max_results=10
)

for run in top_runs:
    print(f"{run.info.run_name}: {run.data.metrics['accuracy']}")
```

## Logging Models

### **Framework-Specific Logging**

```python
import mlflow.sklearn
import mlflow.spark
import mlflow.xgboost
import mlflow.lightgbm

# Scikit-learn

from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
mlflow.sklearn.log_model(model, "sklearn_model")

# Spark ML

from pyspark.ml import Pipeline
pipeline = Pipeline(stages=[...])
mlflow.spark.log_model(pipeline, "spark_model")

# XGBoost

import xgboost as xgb
xgb_model = xgb.XGBClassifier()
mlflow.xgboost.log_model(xgb_model, "xgb_model")

# LightGBM

import lightgbm as lgb
lgb_model = lgb.LGBMClassifier()
mlflow.lightgbm.log_model(lgb_model, "lgb_model")

# Generic log_model for custom frameworks

mlflow.log_model(custom_model, "custom_model")
```

## Real-World Example

### **Full Experiment Tracking**

```python
%python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pandas as pd
import json

# Load data

df = spark.read.table("ml_catalog.data.customer_data").toPandas()

# Split data

X = df.drop("churn", axis=1)
y = df["churn"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Create experiment

mlflow.set_experiment("/Users/user@company.com/churn_model_v2")

# Hyperparameters to test

hyperparameters = [
    {"n_estimators": 50, "max_depth": 5},
    {"n_estimators": 100, "max_depth": 10},
    {"n_estimators": 200, "max_depth": 15},
]

best_f1 = 0
best_run_id = None

for params in hyperparameters:
    with mlflow.start_run(run_name=f"rf_{params['n_estimators']}_{params['max_depth']}"):
        # Log parameters
        mlflow.log_params(params)

        # Train model
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        model = RandomForestClassifier(**params)
        model.fit(X_train_scaled, y_train)

        # Predictions
        y_pred = model.predict(X_test_scaled)

        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)

        # Log metrics
        mlflow.log_metrics({
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1": f1
        })

        # Log model
        mlflow.sklearn.log_model(model, "model")

        # Log feature importance
        feature_importance = {
            col: float(imp)
            for col, imp in zip(X.columns, model.feature_importances_)
        }
        with open("feature_importance.json", "w") as f:
            json.dump(feature_importance, f)
        mlflow.log_artifact("feature_importance.json")

        # Track best model
        if f1 > best_f1:
            best_f1 = f1
            best_run_id = mlflow.active_run().info.run_id

        mlflow.set_tag("best_model", best_run_id == mlflow.active_run().info.run_id)

print(f"Best run: {best_run_id} with F1: {best_f1}")
```

## Comparison: MLflow vs Alternatives

| Aspect | MLflow | Weights & Biases | Neptune | DVC |
|--------|--------|---|---|---|
| **Ease of Use** | Very easy | Easy | Moderate | Complex |
| **Tracking** | ✓ | ✓ | ✓ | Limited |
| **Model Registry** | ✓ | ✓ | ✓ | ✓ |
| **Experiment Management** | ✓ | ✓ | ✓ | ✓ |
| **UI Quality** | Good | Excellent | Good | CLI-only |
| **Cost** | Free (open source) | Paid | Paid | Free |
| **Databricks Native** | ✓ | ✗ | ✗ | ✗ |

## Use Cases

- **Hyperparameter Sweep with Experiment Comparison**: Logging parameters and metrics for multiple model configurations (e.g., Random Forest with different `n_estimators` and `max_depth` values) in the same experiment, then using `client.search_runs()` to find the best run by F1 score.
- **Reproducible Model Artifacts**: Logging the trained model, scaler, feature importance JSON, and learning curve plots as artifacts so any team member can reproduce or inspect the exact model version that was promoted to production.

## Common Issues & Errors

### Metrics Not Logged to Experiment

**Scenario:** `mlflow.log_metric()` calls succeed but metrics don't appear in the experiment UI.
**Fix:** Ensure `mlflow.start_run()` was called and the run is active. Metrics logged outside an active run context are silently dropped. Use the `with mlflow.start_run():` context manager to guarantee the run is properly opened and closed.

### Duplicate Runs Created in Databricks Notebooks

**Scenario:** Re-running a notebook cell creates a new MLflow run each time, cluttering the experiment with incomplete runs.
**Fix:** Use `mlflow.start_run()` with an explicit `run_name` and wrap training logic in a `with` block. Call `mlflow.end_run()` if using the imperative API to ensure the previous run is closed before starting a new one.

## Exam Tips

- `log_param()` stores a single string value (hyperparameter); `log_metric()` stores a numeric value (performance measure) and supports a `step` argument for epoch tracking
- `log_params()` and `log_metrics()` accept dictionaries for batch logging -- know the plural forms
- Databricks automatically creates an experiment at `/Users/{email}/notebook_name` when you log from a notebook -- no explicit `set_experiment()` is needed
- `mlflow.sklearn.log_model()` vs `mlflow.spark.log_model()` -- know which flavor matches which framework (sklearn, xgboost, lightgbm, spark)
- `client.search_runs(filter_string="metrics.accuracy > 0.9")` uses a SQL-like filter syntax with `metrics.` and `params.` prefixes
- Artifacts (plots, JSON files, pickled objects) are stored in the artifact store (object storage), not the backend metadata store

## Key Takeaways

- MLflow Tracking captures all experiment data (parameters, metrics, artifacts)
- Metrics can be logged with steps for tracking over time
- Artifacts enable reproducibility by capturing models and data
- Databricks provides native MLflow integration with automatic experiment creation
- Search functionality enables finding best runs across experiments
- Tags enable organization and filtering of runs

## Related Topics

- [Experiments & Runs](02-experiments-runs.md)
- [ML Experimentation Workflow](03-ml-experimentation-workflow.md)
- [Model Registry](../04-mlflow-deployment/01-model-registry.md)

## Official Documentation

- [MLflow Tracking](https://mlflow.org/docs/latest/tracking.html)
- [MLflow on Databricks](https://docs.databricks.com/mlflow/index.html)

---

**[↑ Back to ML Workflows](./README.md) | [Next: Experiments & Runs](./02-experiments-runs.md) →**

---
tags:
  - databricks
  - code-examples
  - mlflow
  - python
  - model-registry
---

# MLflow Patterns — Python

Practical MLflow examples for experiment tracking, model logging, and Unity Catalog
integration. Run in a Databricks notebook with MLflow pre-installed.

## Experiment Tracking — Basic Run

```python
import mlflow

mlflow.set_experiment("/Users/your_email/my-experiment")

with mlflow.start_run(run_name="baseline-rf"):
    # Log parameters
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 5)
    mlflow.log_param("random_state", 42)

    # Train model
    from sklearn.ensemble import RandomForestClassifier
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    # Log metrics
    accuracy = model.score(X_test, y_test)
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("n_features", X_train.shape[1])

    # Log model
    mlflow.sklearn.log_model(model, "model")
```

## Autologging — Zero-Code Tracking

```python
import mlflow

# Enable for all supported frameworks (sklearn, xgboost, lightgbm, spark, pytorch, etc.)
mlflow.autolog()

# Now just train — parameters, metrics, and model are logged automatically
from sklearn.ensemble import GradientBoostingClassifier
model = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1)
model.fit(X_train, y_train)

# Disable when done
mlflow.autolog(disable=True)
```

## Log Artifacts and Tags

```python
import mlflow
import json

with mlflow.start_run():
    # Log a dictionary as a JSON artifact
    feature_importance = {"feature_a": 0.45, "feature_b": 0.30, "feature_c": 0.25}
    with open("feature_importance.json", "w") as f:
        json.dump(feature_importance, f)
    mlflow.log_artifact("feature_importance.json")

    # Log a directory of artifacts
    mlflow.log_artifacts("./plots", artifact_path="visualizations")

    # Set tags for organization and search
    mlflow.set_tag("team", "data-science")
    mlflow.set_tag("dataset_version", "v2.3")
    mlflow.set_tag("model_type", "classification")
```

## Search and Compare Runs

```python
import mlflow

# Search runs by metric threshold
runs = mlflow.search_runs(
    experiment_ids=["123456"],
    filter_string="metrics.accuracy > 0.85 AND params.model_type = 'rf'",
    order_by=["metrics.accuracy DESC"],
    max_results=10
)

# Display as DataFrame
display(runs[["run_id", "params.n_estimators", "metrics.accuracy", "end_time"]])

# Get the best run
best_run = runs.iloc[0]
print(f"Best run: {best_run.run_id} with accuracy {best_run['metrics.accuracy']:.4f}")
```

## Register Model in Unity Catalog

```python
import mlflow

# IMPORTANT: Set registry URI to Unity Catalog before registration
mlflow.set_registry_uri("databricks-uc")

model_name = "ml_catalog.models.fraud_detector"

with mlflow.start_run():
    mlflow.sklearn.log_model(model, "model")
    # Register directly from the run
    mlflow.register_model(f"runs:/{mlflow.active_run().info.run_id}/model", model_name)
```

## Manage Model Aliases (UC)

```python
from mlflow import MlflowClient

client = MlflowClient()
model_name = "ml_catalog.models.fraud_detector"

# Set alias on a specific version
client.set_registered_model_alias(model_name, "champion", version=3)
client.set_registered_model_alias(model_name, "challenger", version=4)

# Load model by alias (production code uses this)
champion_model = mlflow.pyfunc.load_model(f"models:/{model_name}@champion")

# Load model by version (testing/debugging)
v3_model = mlflow.pyfunc.load_model(f"models:/{model_name}/3")

# Delete an alias
client.delete_registered_model_alias(model_name, "challenger")
```

## Batch Inference with Spark UDF

```python
import mlflow

# Load model as a Spark UDF for distributed batch scoring
model_uri = "models:/ml_catalog.models.fraud_detector@champion"
predict_udf = mlflow.pyfunc.spark_udf(spark, model_uri, result_type="double")

# Score a large table
scored_df = (
    spark.read.table("ml_catalog.features.transactions")
    .withColumn("fraud_score", predict_udf("amount", "merchant_category", "hour_of_day"))
)

scored_df.write.mode("overwrite").saveAsTable("ml_catalog.predictions.fraud_scores")
```

## Custom PyFunc Model

```python
import mlflow

class PreprocessAndPredict(mlflow.pyfunc.PythonModel):
    """Custom model that wraps preprocessing + prediction."""

    def load_context(self, context):
        import joblib
        self.preprocessor = joblib.load(context.artifacts["preprocessor"])
        self.model = joblib.load(context.artifacts["model"])

    def predict(self, context, model_input):
        processed = self.preprocessor.transform(model_input)
        return self.model.predict(processed)

# Log the custom model with artifacts
with mlflow.start_run():
    mlflow.pyfunc.log_model(
        artifact_path="model",
        python_model=PreprocessAndPredict(),
        artifacts={
            "preprocessor": "preprocessor.joblib",
            "model": "classifier.joblib"
        },
        pip_requirements=["scikit-learn==1.3.0", "joblib==1.3.2"]
    )
```

## Model Evaluation

```python
import mlflow
import pandas as pd

# Evaluate a logged model against a dataset
eval_data = pd.DataFrame({"feature_a": [...], "feature_b": [...], "label": [...]})

with mlflow.start_run():
    results = mlflow.evaluate(
        model="runs:/abc123/model",
        data=eval_data,
        targets="label",
        model_type="classifier",
        evaluators=["default"]
    )

    print(f"Accuracy: {results.metrics['accuracy_score']:.4f}")
    print(f"F1: {results.metrics['f1_score']:.4f}")

    # Results are automatically logged to the run
```

## MLflow for GenAI — Evaluate LLM Outputs

```python
import mlflow
import pandas as pd

eval_data = pd.DataFrame({
    "inputs": [
        "What is Delta Lake?",
        "Explain Unity Catalog."
    ],
    "ground_truth": [
        "Delta Lake is an open-source storage layer that adds ACID transactions to data lakes.",
        "Unity Catalog is a unified governance solution for data and AI assets on Databricks."
    ]
})

with mlflow.start_run():
    results = mlflow.evaluate(
        model="endpoints:/my-llm-endpoint",
        data=eval_data,
        targets="ground_truth",
        model_type="question-answering",
        evaluators=["default"]
    )

    # Metrics: toxicity, relevance, similarity scores
    print(results.metrics)
    # Per-row results table
    display(results.tables["eval_results_table"])
```

## Notes

- Always call `mlflow.set_registry_uri("databricks-uc")` before any model registration or loading when targeting Unity Catalog
- UC model registry uses **aliases** (`champion`, `challenger`) — not legacy lifecycle stages (`Staging`, `Production`)
- `mlflow.autolog()` supports: sklearn, xgboost, lightgbm, spark, pytorch, tensorflow, keras, fastai
- Load models by alias in production code (`@champion`), by version only for testing (`/3`)
- `mlflow.evaluate()` with `model_type="question-answering"` enables LLM-specific metrics

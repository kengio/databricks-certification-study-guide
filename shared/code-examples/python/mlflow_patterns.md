---
tags:
  - databricks
  - code-examples
  - mlflow
  - python
  - model-registry
  - genai
---

# MLflow Patterns — Python

Practical MLflow examples for experiment tracking, model logging, and Unity Catalog
integration. Run in a Databricks notebook with MLflow pre-installed.

> [!note] MLflow 3
> These examples target **MLflow 3** (current Databricks practice as of Oct 2026): `log_model(..., name=...)` instead of `artifact_path=`, the logged-model URI from `model_info.model_uri`, Unity Catalog as the default registry, `mlflow.models.evaluate()` for classic ML, and `mlflow.genai.evaluate()` with scorers for GenAI. See the [MLflow 2 → 3 mapping](../../cheat-sheets/mlflow-quick-ref.md#mlflow-2--3-mapping).

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

    # Log model (MLflow 3: name= replaces artifact_path=)
    model_info = mlflow.sklearn.log_model(model, name="model")
    print(model_info.model_uri)  # models:/<model_id>
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

# Default registry URI in MLflow 3; required explicitly on MLflow 2.x clients
mlflow.set_registry_uri("databricks-uc")

model_name = "ml_catalog.models.fraud_detector"  # three-level UC name

with mlflow.start_run():
    model_info = mlflow.sklearn.log_model(model, name="model")

# Register the logged model by its URI (models:/<model_id>)
model_version = mlflow.register_model(model_info.model_uri, model_name)
print(f"Registered version {model_version.version}")
```

## Manage Model Aliases (UC)

```python
from mlflow import MlflowClient

client = MlflowClient()
model_name = "ml_catalog.models.fraud_detector"

# Set alias on a specific version
client.set_registered_model_alias(model_name, "champion", version=3)
client.set_registered_model_alias(model_name, "challenger", version=4)

# Look up which version an alias points to
champion = client.get_model_version_by_alias(model_name, "champion")
print(champion.version, champion.run_id)

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
        name="model",
        python_model=PreprocessAndPredict(),
        artifacts={
            "preprocessor": "preprocessor.joblib",
            "model": "classifier.joblib"
        },
        pip_requirements=["scikit-learn==1.3.0", "joblib==1.3.2"]
    )
```

## Model Evaluation (Classic ML)

`mlflow.evaluate()` is deprecated as of MLflow 3.0. For classic ML models, `mlflow.models.evaluate()` takes the same arguments.

```python
import mlflow
import pandas as pd

# Evaluate a logged model against a dataset
eval_data = pd.DataFrame({"feature_a": [...], "feature_b": [...], "label": [...]})

with mlflow.start_run():
    results = mlflow.models.evaluate(
        model=model_info.model_uri,  # or "models:/ml_catalog.models.fraud_detector@champion"
        data=eval_data,
        targets="label",
        model_type="classifier",
        evaluators=["default"]
    )

    print(f"Accuracy: {results.metrics['accuracy_score']:.4f}")
    print(f"F1: {results.metrics['f1_score']:.4f}")

    # Results are automatically logged to the run
```

## MLflow for GenAI — Trace an App

```python
import mlflow
from mlflow.entities import SpanType

mlflow.openai.autolog()  # automatic spans for OpenAI client calls

@mlflow.trace(span_type=SpanType.RETRIEVER)
def retrieve(question: str) -> list[str]:
    # Vector Search lookup goes here
    return ["Delta Lake adds ACID transactions to data lakes."]

@mlflow.trace
def rag_app(question: str) -> str:
    context = "\n".join(retrieve(question))
    # call an LLM with context + question here
    return f"Answer based on: {context}"
```

## MLflow for GenAI — Evaluate with Scorers

MLflow 3 replaces `mlflow.evaluate(model_type="question-answering")` with `mlflow.genai.evaluate()`. Each record's `inputs` are passed to `predict_fn` as keyword arguments; `expectations` hold ground truth.

```python
import mlflow
from mlflow.genai.scorers import (
    Correctness,
    Guidelines,
    RelevanceToQuery,
    RetrievalGroundedness,
    Safety,
)

eval_data = [
    {
        "inputs": {"question": "What is Delta Lake?"},
        "expectations": {
            "expected_response": "Delta Lake is an open-source storage layer that adds ACID transactions to data lakes."
        },
    },
    {
        "inputs": {"question": "Explain Unity Catalog."},
        "expectations": {
            "expected_facts": ["unified governance", "data and AI assets"]
        },
    },
]

results = mlflow.genai.evaluate(
    data=eval_data,
    predict_fn=rag_app,  # called as rag_app(question=...)
    scorers=[
        Correctness(),
        RelevanceToQuery(),
        RetrievalGroundedness(),  # uses the RETRIEVER span
        Safety(),
        Guidelines(name="no_speculation", guidelines="The answer must not speculate beyond the context."),
    ],
)

print(results.metrics)    # aggregate scores, e.g. "<scorer>/mean"
display(results.result_df)  # per-row assessments
```

To evaluate an app that is already deployed to Model Serving, wrap the endpoint: `predict_fn=mlflow.genai.to_predict_fn("endpoints:/my-llm-endpoint")` (chat endpoints expect `{"inputs": {"messages": [...]}}` records).

## Notes

- MLflow 3 defaults the registry URI to `databricks-uc`; call `mlflow.set_registry_uri("databricks-uc")` explicitly when the code may run on MLflow 2.x
- MLflow 3 `log_model` takes `name=` (`artifact_path=` is deprecated) and returns `model_info.model_uri` (`models:/<model_id>`) — prefer it over `runs:/<run_id>/model`
- UC model registry uses **aliases** (`champion`, `challenger`) — not legacy lifecycle stages (`Staging`, `Production`)
- `mlflow.autolog()` supports: sklearn, xgboost, lightgbm, spark, pytorch, tensorflow, keras, fastai
- Load models by alias in production code (`@champion`), by version only for testing (`/3`)
- Classic ML evaluation: `mlflow.models.evaluate()`; GenAI evaluation: `mlflow.genai.evaluate(data=..., predict_fn=..., scorers=[...])` — `mlflow.evaluate()` is deprecated as of MLflow 3.0

## Official Documentation

- [Get started with MLflow 3 — Databricks](https://docs.databricks.com/aws/en/mlflow/mlflow-3-install)
- [MLflow 3 migration (`name=`, `models:/<model_id>`) — mlflow.org](https://www.mlflow.org/docs/latest/ml/mlflow-3/)
- [Manage model lifecycle in Unity Catalog](https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/)
- [Legacy LLM evaluation (`mlflow.evaluate` deprecation) — mlflow.org](https://mlflow.org/docs/latest/genai/eval-monitor/legacy-llm-evaluation/)
- [MLflow evaluation examples for GenAI](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/eval-examples)
- [Evaluate and improve a GenAI app — Databricks](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/evaluate-app)
- [Manual and custom tracing](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/manual-tracing)

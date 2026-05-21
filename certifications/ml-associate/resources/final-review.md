---
title: Final Review — ML Associate
type: final-review
tags:
  - ml-associate
  - final-review
  - exam-morning
status: published
---

# Final Review — ML Associate (20-minute exam-morning scan)

## 2-minute facts that show up *most often*

- **MLflow autologging**: `mlflow.autolog()` logs params + metrics + model + signature for scikit-learn / PyTorch / Spark ML / XGBoost
- **Registry URI**: `mlflow.set_registry_uri("databricks-uc")` registers in UC instead of the workspace registry
- **Model aliases** (`Production`, `Champion`, `Challenger`) replace the legacy stage system — load via `models:/<name>@<alias>`
- **AutoML** generates baseline notebooks for classification, regression, forecasting
- **Spark ML `Pipeline`** chains Estimators + Transformers; `StringIndexer` + `OneHotEncoder` is the canonical categorical pair; `VectorAssembler` combines features
- **Feature Engineering in UC** stores feature tables; **point-in-time lookups** prevent training-serving skew
- **Mosaic AI Model Serving** auto-scales; `auto_capture_config` (or `ai_gateway.inference_table_config`) enables Inference Tables
- **`scale_to_zero_enabled`** saves cost but adds cold-start latency on the first request

## 5-minute per-domain quick-fire (4 domains)

### 01 — Databricks Machine Learning (38 %)

- **Databricks Runtime for ML** comes with PyTorch / TensorFlow / scikit-learn / MLflow pre-installed
- **Single-user vs shared access mode**: ML workloads with custom UDFs or libraries usually need single-user
- **AutoML** outputs: best-model notebook + data-exploration notebook + leaderboard
- **GPU clusters** require single-user mode

### 02 — Model Development (31 %)

- `pyspark.ml.Pipeline(stages=[...])` for composable pipelines
- Encoders: `StringIndexer` → `OneHotEncoder` for categoricals; `Imputer` for missing values
- `VectorAssembler` produces the `features` column most estimators expect
- Feature Engineering in UC: log feature tables with `mlflow.feature_engineering`; lookups use feature key + timestamp

### 03 — ML Workflows (19 %)

- Experiment vs Run: experiment is a folder; run is a single trial
- Nested runs for hyperparameter sweeps: `with mlflow.start_run(nested=True)`
- Comparing runs in the experiment UI: sort by metric, select multiple, compare side-by-side
- Search runs programmatically: `client.search_runs(experiment_ids=[...], order_by=[...])`

### 04 — Model Deployment (12 %)

- Register: `mlflow.register_model(model_uri, name)` — returns a `ModelVersion`
- Alias: `client.set_registered_model_alias(name, alias, version)`
- Serve: `WorkspaceClient().serving_endpoints.create(...)` with `served_entities` + `auto_capture_config`
- Inference Tables auto-capture every request/response

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Load a specific model version" | `models:/<name>@<alias>` (by alias) or `models:/<name>/<version>` (by number) |
| "Stage Production / Staging / Archived" | Deprecated — use aliases instead |
| "Where do feature tables live now?" | Unity Catalog (Feature Engineering in UC) — not the workspace Feature Store |
| "Workspace registry vs UC registry" | UC is current — `mlflow.set_registry_uri("databricks-uc")` |
| "Cold start on first request" | `scale_to_zero_enabled = true` trade-off |
| "Pipeline ordering" | Estimator → Transformer; `StringIndexer` before `OneHotEncoder` |

## Today's exam — 90-minute time budget

- **48 questions ÷ 90 minutes ≈ 1m50s/question** — slight time pressure; keep moving
- Code-shaped questions: read the **outer** function name first (autolog / register_model / log_model) — that's usually the discriminator
- "Most-managed Databricks" answer wins — AutoML > custom sweep, UC registry > workspace, Model Serving > custom Flask

## Eat. Hydrate. Breathe.

You're ready. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to ML Associate](../README.md)**

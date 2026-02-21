---
title: ML Associate Exam Tips
type: exam-tips
tags: [ml-associate, exam-tips, certification]
status: published
---

# ML Associate Exam Tips and Strategies

Practical strategies for passing the Databricks Certified Machine Learning Associate exam on your first attempt.

## Exam Format

| Detail | Value |
|---|---|
| Number of Questions | 45 |
| Duration | 90 minutes |
| Passing Score | 70% (32+ correct) |
| Language | Python only |
| Question Format | Multiple choice (single answer) |
| Delivery | Online proctored or test center |

## Domain Weights and Study Time

| Domain | Weight | Questions | Recommended Study Time |
|---|---|---|---|
| Feature Engineering (Spark ML) | 33% | ~15 | 8–10 hours |
| Databricks ML | 29% | ~13 | 6–8 hours |
| ML Workflows (MLflow) | 29% | ~13 | 6–8 hours |
| MLflow Deployment | 9% | ~4 | 3–4 hours |

Feature Engineering carries the most weight — prioritize Spark ML Pipeline, VectorAssembler, and Feature Store APIs.

## Time Management

| Phase | Time | Target |
|---|---|---|
| First pass (answer all) | 60 min | ~45 sec per question |
| Review flagged questions | 20 min | Revisit uncertain answers |
| Final review | 10 min | Sanity-check skipped items |

Flag any question you are unsure about and keep moving. Do not spend more than 2 minutes on any single question during the first pass.

## Key Topics to Master

### Must Know (High Frequency)

- [ ] `VectorAssembler` — `inputCols` and `outputCol` parameters, assembles feature columns into a single vector
- [ ] `Pipeline` — ordered list of `Estimator` and `Transformer` stages; `fit()` returns a `PipelineModel`
- [ ] `mlflow.autolog()` — automatically logs params, metrics, and model for supported frameworks
- [ ] `mlflow.log_metric()` / `mlflow.log_param()` / `mlflow.log_artifact()` — manual logging APIs
- [ ] `mlflow.start_run()` — context manager that creates a new MLflow run
- [ ] `MlflowClient.transition_model_version_stage()` — the only way to change a model version stage
- [ ] Feature Store `create_feature_table()` — requires `primary_keys` parameter
- [ ] `CrossValidator` — k-fold cross-validation, `numFolds` defaults to 3
- [ ] AutoML — produces MLflow experiments, supports classification, regression, and forecasting
- [ ] Model registry stages — None → Staging → Production → Archived

### Should Know (Medium Frequency)

- [ ] `StringIndexer` → `OneHotEncoder` ordering in a pipeline (index first, encode second)
- [ ] `ParamGridBuilder.addGrid()` syntax for hyperparameter search
- [ ] `mlflow.search_runs()` — filter strings like `"metrics.accuracy > 0.9"`
- [ ] `mlflow.pyfunc.spark_udf()` — wraps a registered model as a Spark UDF for batch scoring
- [ ] Feature Store `write_table()` — `mode="merge"` or `mode="overwrite"`
- [ ] `mlflow.register_model()` — takes a `runs:/<run_id>/model` URI
- [ ] Databricks ML Runtime — pre-installs MLflow, TensorFlow, PyTorch, scikit-learn
- [ ] Single-node vs multi-node clusters — pandas/sklearn workloads vs distributed Spark ML

### Good to Know (Lower Frequency)

- [ ] Nested runs — `mlflow.start_run(nested=True)` for parent/child run hierarchies
- [ ] `TrainValidationSplit` vs `CrossValidator` — TVS does single random split (faster, less accurate)
- [ ] Point-in-time lookups in Feature Store — avoids data leakage for time-sensitive features
- [ ] `mlflow.pyfunc.load_model("models:/name/Production")` — loading a registered model
- [ ] Custom `PythonModel` class for non-standard model flavors
- [ ] GPU cluster policies and when to use them (deep learning workloads)

## Common Exam Traps

| Trap | What the Exam Tests | Correct Understanding |
|---|---|---|
| `autolog()` vs manual logging | Does autolog capture custom metrics? | No — `autolog()` does NOT capture custom metrics. You must call `mlflow.log_metric()` explicitly for any custom values. |
| `spark_udf()` scope | Is this for real-time or batch? | `mlflow.pyfunc.spark_udf()` is for **batch** scoring on a Spark DataFrame, not real-time serving. Real-time requires a serving endpoint. |
| Feature Store primary key | Is `primary_keys` optional? | No — `create_feature_table()` **requires** `primary_keys`. Omitting it raises an error. |
| `CrossValidator` vs `TrainValidationSplit` | Which does k-fold CV? | `CrossValidator` does k-fold (default 3). `TrainValidationSplit` does a single train/validation split (faster but less reliable). |
| AutoML output | Does AutoML create an MLflow experiment? | Yes — AutoML automatically creates and populates an MLflow experiment with all trial runs and the best model notebook. |
| Stage transitions | Can you use `mlflow.*` for stage changes? | No — stage transitions require `MlflowClient.transition_model_version_stage()`. There is no `mlflow.*` shortcut. |
| `Pipeline.fit()` vs `transform()` | What does each return? | `Pipeline.fit(trainDF)` returns a `PipelineModel`. `PipelineModel.transform(testDF)` applies all fitted stages. |
| `log_model` vs `register_model` | Are these the same? | No — `log_model()` saves a model as a run artifact. `register_model()` registers it to the Model Registry under a name. |

## Quick Reference Numbers

| Item | Value |
|---|---|
| Exam passing score | 70% (32 of 45 questions) |
| `CrossValidator` default `numFolds` | 3 |
| Feature Store primary key requirement | Required (not optional) |
| AutoML supported task types | Classification, Regression, Forecasting |
| MLflow model stages | None, Staging, Production, Archived |
| `autolog()` supported frameworks | scikit-learn, XGBoost, LightGBM, PyTorch, TensorFlow/Keras, Spark ML, statsmodels |

## Day Before the Exam

- [ ] Review the domain weight table — mentally allocate effort to Feature Engineering first
- [ ] Re-read Spark ML Pipeline stages: which are `Estimator` vs `Transformer`
- [ ] Review MLflow logging API signatures (params vs metrics vs artifacts)
- [ ] Re-read Feature Store APIs: `create_feature_table()`, `write_table()`, `score_batch()`
- [ ] Review model registry stage names and transition API
- [ ] Confirm your Databricks account access and proctor software is installed
- [ ] Get 8 hours of sleep

## During the Exam

- [ ] Read each question fully before looking at choices — identify the key constraint
- [ ] Eliminate clearly wrong answers first to narrow choices
- [ ] For API questions, recall the exact parameter names (e.g., `inputCols` plural, not `inputCol`)
- [ ] Flag uncertain questions and move on — do not get stuck
- [ ] Watch for "best practice" wording — the exam often has two plausible answers; choose the recommended approach
- [ ] For Feature Store questions, check whether it asks about offline batch or online serving
- [ ] Double-check `runs:/<run_id>/model` URI format for any registry question

---

[← Back to Resources](./README.md)

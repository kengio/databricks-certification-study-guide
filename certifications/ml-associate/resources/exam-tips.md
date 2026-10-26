---
title: ML Associate Exam Tips
type: exam-tips
tags: [ml-associate, exam-tips, certification]
status: published
---

# ML Associate Exam Tips and Strategies

Practical strategies for passing the Databricks Certified Machine Learning Associate exam on your first attempt. Facts below come from the exam guide PDF (re-issued "August 2026"; exam version March 1, 2025).

## Exam Format

| Detail | Value |
| :--- | :--- |
| Scored questions | 48 multiple-choice **and multiple-selection** questions |
| Unscored items | Up to 10, not identified (extra time is already included) |
| Duration | 90 minutes |
| Passing score | Not published — treat the exam as pass/fail and aim to be solid in every section |
| Code | Python for ML code; non-ML data manipulation may appear in SQL |
| Delivery | Online proctored or test center |
| Fee | USD 200 plus applicable taxes |

## Section Weights and Study Time

| Section | Weight | ≈ Scored questions | Suggested study time |
| :--- | :---: | :---: | :--- |
| 1 — Databricks Machine Learning | 38 % | ~18 | 8–10 hours |
| 3 — Model Development | 31 % | ~15 | 7–9 hours |
| 2 — Data Processing | 19 % | ~9 | 4–5 hours |
| 4 — Model Deployment | 12 % | ~6 | 3–4 hours |

Section 1 is the largest: MLOps strategy, ML runtimes, AutoML, feature tables in Unity Catalog, MLflow tracking and the Client API, and the Unity Catalog model registry all live there.

> [!note]
> The certification web page labels the 19 % section "ML Workflows"; the exam-guide PDF calls it **Data Processing** and lists summary statistics, outliers, imputation, one-hot encoding, and log transforms. Study the PDF's bullets.

## Time Management

Up to 58 items in 90 minutes is about **1.5 minutes per item**.

| Phase | Time | Target |
| :--- | :--- | :--- |
| First pass (answer all) | 65 min | ~1 min per question; flag anything uncertain |
| Review flagged questions | 20 min | Revisit uncertain answers |
| Final check | 5 min | Make sure nothing is blank |

For **multiple-selection** questions, read how many answers are required and judge each option on its own.

## Key Topics to Master

### Must Know (High Frequency)

- [ ] Feature tables in Unity Catalog: `FeatureEngineeringClient.create_table(name, primary_keys, df)`, `write_table(..., mode="merge")`, `FeatureLookup` + `create_training_set`, `fe.log_model`, `fe.score_batch`
- [ ] MLflow manual logging: `log_param(s)`, `log_metric(s)` (with `step`), `log_artifact` vs `log_artifacts`, `<flavor>.log_model`
- [ ] Best run with the Client API: `MlflowClient().search_runs([exp_id], order_by=["metrics.m DESC"], max_results=1)[0]`
- [ ] UC registry: `mlflow.set_registry_uri("databricks-uc")`, `create_registered_model` / `create_model_version`, aliases (`set_registered_model_alias`), tags (`set_/delete_model_version_tag`)
- [ ] Spark ML: Estimator (`fit`) vs Transformer (`transform`), `Pipeline` → `PipelineModel`, `StringIndexer` → `OneHotEncoder` → `VectorAssembler`
- [ ] Tuning: grid / random / Bayesian; Hyperopt `fmin(fn, space, algo, max_evals, trials)`; `SparkTrials` for single-node models; models trained = combinations × folds
- [ ] Metrics: F1, log loss, ROC AUC, precision vs recall; RMSE vs MAE vs R²; choosing the metric for a scenario
- [ ] Serving choice: batch vs streaming vs real-time; `spark_udf`; Model Serving endpoints and traffic splits

### Should Know (Medium Frequency)

- [ ] `df.summary()` vs `describe()`; `dbutils.data.summarize(df)`
- [ ] Outlier rules: μ ± 3σ vs Q1 − 1.5·IQR … Q3 + 1.5·IQR
- [ ] Imputation: mean (symmetric), median (skewed/outliers), mode (categorical); `Imputer(strategy=...)`
- [ ] When one-hot encoding is / is not appropriate (high cardinality, ordinal, tree models)
- [ ] Log transforms for right-skewed positive data; exponentiate log-space predictions before metrics
- [ ] Class imbalance: class weights / cost-sensitive learning, resampling the training split, stratified splits
- [ ] Bias-variance diagnosis from training vs validation error
- [ ] Deploy code vs deploy models (and when each is preferred)
- [ ] AutoML outputs: MLflow experiment, best-trial + data exploration notebooks, SHAP importance (off by default)

### Good to Know (Lower Frequency)

- [ ] ML runtime advantages: pre-installed, version-tested ML/DL libraries, MLflow, AutoML, GPU variants
- [ ] Online vs offline feature tables; point-in-time lookups with `timestamp_lookup_key`
- [ ] Custom `mlflow.pyfunc.PythonModel` for endpoints with custom logic
- [ ] Endpoint URL `/serving-endpoints/<name>/invocations`; `dataframe_split` / `dataframe_records`
- [ ] Streaming inference with Delta Live Tables: model as a Spark UDF inside a streaming table

## Common Exam Traps

| Trap | What the Exam Tests | Correct Understanding |
| :--- | :--- | :--- |
| Promoting a model | Stages or aliases? | In Unity Catalog, move an **alias** (`set_registered_model_alias`). Stages / `transition_model_version_stage` are legacy workspace-registry features. |
| Creating a feature table in UC | Which API? | `FeatureEngineeringClient.create_table` (or a Delta table with a `PRIMARY KEY` constraint). No `AS FEATURE STORE` clause. |
| Tag vs alias | Does a `champion` tag change what is served? | No — tags are metadata; only aliases are resolved by `models:/name@alias`. |
| `autolog()` vs custom metrics | Does autolog capture custom metrics? | No — log custom values with `mlflow.log_metric()`. |
| `fmin` direction | Maximise accuracy? | `fmin` minimises the loss — return `-accuracy`. |
| `SparkTrials` with MLlib | Parallelise everything? | `SparkTrials` is for single-machine models; use `Trials` for distributed MLlib. |
| Counting models | Grid 3 × 2 × 3, 5-fold CV | 18 × 5 = 90 during the search (a final refit adds one). |
| Imbalanced data | Is 95 % accuracy good? | Not when 95 % of rows are one class — use F1 / recall / PR AUC and class weights or resampling. |
| Log-transformed target | Evaluate directly? | Exponentiate predictions first, then compute RMSE/MAE in original units. |
| Overfitting vs underfitting | Low train error, high validation error? | High variance → reduce complexity / regularise. High error on both → high bias. |
| Serving approach | Real-time for everything? | No — nightly full-population scoring is batch; continuous events within seconds are streaming. |

## Quick Reference Numbers

| Item | Value |
| :--- | :--- |
| Scored questions / time | 48 / 90 minutes (+ up to 10 unscored items) |
| `CrossValidator` default `numFolds` | 3 |
| `TrainValidationSplit` default `trainRatio` | 0.75 |
| `Imputer` strategies | `mean` (default), `median`, `mode` |
| AutoML problem types | Classification, regression, forecasting |
| AutoML default split | 60 / 20 / 20 train / validation / test |
| IQR fences | Q1 − 1.5·IQR, Q3 + 1.5·IQR |

## Platform Names You May See

The exam guide was written for the March 2025 exam. As of October 2026:

| Exam wording | Current name / status |
| :--- | :--- |
| Delta Live Tables | Lakeflow Spark Declarative Pipelines (renamed November 12, 2025) |
| Hyperopt | Not included in Databricks Runtime ML after 16.4 LTS ML; Optuna / Ray Tune recommended |
| Databricks Repos | Git folders |
| Databricks Asset Bundles | Declarative Automation Bundles (renamed March 16, 2026) |
| Community Edition | Retired January 1, 2026 — use Databricks Free Edition for hands-on practice |

Answer exam questions using the exam's wording.

## Day Before the Exam

- [ ] Re-read the exam-guide bullet list and tick off each one
- [ ] Review Estimator vs Transformer and the `Pipeline` fit/transform flow
- [ ] Rehearse the feature-table and UC-registry API calls
- [ ] Review the metric-choice and bias-variance tables
- [ ] Run the system check for online proctoring
- [ ] Get a full night's sleep

## During the Exam

- [ ] Read each question fully and identify the key constraint (latency, cost, data access, interpretability)
- [ ] For multiple-selection questions, confirm how many answers are required
- [ ] Eliminate clearly wrong answers first
- [ ] For API questions, check exact names (`inputCols` vs `inputCol`, `log_artifacts` vs `log_artifact`)
- [ ] Prefer the recommended, governed Databricks approach (Unity Catalog, aliases, deploy code) when two answers seem plausible
- [ ] Flag uncertain questions and move on

---

[← Back to Resources](./README.md)

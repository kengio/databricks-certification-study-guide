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

> [!important]
> Four sections: **Databricks ML 38 %**, **Model Development 31 %**, **Data Processing 19 %**, **Model Deployment 12 %**. 48 scored multiple-choice and multiple-selection questions, plus up to 10 unscored items, in 90 minutes.

## 2-minute facts that show up *most often*

- **Feature tables in UC**: `FeatureEngineeringClient().create_table(name="cat.sch.t", primary_keys=[...], df=...)`; `write_table(..., mode="merge")`; train with `FeatureLookup` + `create_training_set` + `fe.log_model`; score with `fe.score_batch`
- **UC registry**: `mlflow.set_registry_uri("databricks-uc")`; promote by moving an **alias** (`set_registered_model_alias(name, "champion", v)`); load `models:/cat.sch.m@champion`; **no stages in UC**
- **Best run**: `MlflowClient().search_runs([exp_id], order_by=["metrics.rmse ASC"], max_results=1)[0]`
- **Estimator vs Transformer**: `fit()` → Model vs `transform()` → DataFrame; `StringIndexer`, `OneHotEncoder`, `StandardScaler`, `Imputer`, every algorithm and `Pipeline` are Estimators
- **Tuning**: Hyperopt `fmin` minimises the loss; `tpe.suggest` = Bayesian, `rand.suggest` = random; `SparkTrials` for single-node models; models trained = combinations × folds
- **Deploy code** is the default MLOps recommendation; **deploy models** when training is very expensive, single workspace, or no CI/CD

## 5-minute per-domain quick-fire (4 sections)

### 1 — Databricks Machine Learning (38 %)

- ML runtime = pre-installed, version-tested ML/DL libraries + MLflow + AutoML (+ GPU variants)
- AutoML: classification / regression / forecasting; one MLflow run per trial; best-trial + data exploration notebooks; SHAP importance off by default
- UC feature tables: account-level → shared across workspaces, UC governance, lineage; offline (Delta) vs online store (low-latency serving)
- Manual logging: `log_param(s)`, `log_metric(s)` (`step`), `log_artifact` (file) vs `log_artifacts` (folder), `<flavor>.log_model`
- Tags: `set_/delete_registered_model_tag`, `set_/delete_model_version_tag` — metadata only

### 2 — Data Processing (19 %)

- `df.summary()` adds quartiles to `describe()`; `dbutils.data.summarize(df)` renders a profile
- Outliers: μ ± 3σ (symmetric data) or Q1 − 1.5·IQR … Q3 + 1.5·IQR (skewed data)
- Continuous × continuous → scatter + correlation; categorical × categorical → cross-tab + chi-square
- Impute: mean (symmetric), median (skewed), mode (categorical); look at the distribution first
- One-hot: nominal, low cardinality, linear/distance models — not for high-cardinality or ordinal features
- Log transform: positive, right-skewed, orders of magnitude (`log1p` if zeros)

### 3 — Model Development (31 %)

- Imbalance: class weights / cost-sensitive learning, resample the **training** split; judge with F1 / recall / PR AUC
- CV: more reliable, k× cost; train-validation split: cheaper, noisier; `CrossValidator` default 3 folds
- Precision = few false positives; recall = few false negatives; log loss = calibrated probabilities; RMSE punishes big misses, MAE is robust
- Log target → exponentiate predictions before metrics
- Low train / high validation error = overfitting (high variance); high both = underfitting (high bias)

### 4 — Model Deployment (12 %)

- Batch (scheduled, cheapest) vs streaming (continuous, seconds) vs real-time (endpoint, milliseconds)
- pandas: `pyfunc.load_model(uri).predict(pdf)`; at scale: `mlflow.pyfunc.spark_udf`
- Streaming with Delta Live Tables: model as a Spark UDF inside a streaming table
- Custom model: `mlflow.pyfunc.PythonModel` → `pyfunc.log_model` → register in UC → endpoint
- Query `/serving-endpoints/<name>/invocations` with `dataframe_split`; split traffic with `traffic_config` routes summing to 100

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Promote to Production stage" | UC has no stages — move the `champion` alias |
| "`AS FEATURE STORE` clause" | Does not exist — use `create_table` or a `PRIMARY KEY` constraint |
| "Tag the version as champion" | Tags don't change what is served; aliases do |
| "`fmin` returns the best accuracy" | Only if the objective returns `-accuracy` as the loss |
| "Oversample before splitting" | Resample the training split only |
| "RMSE on log predictions in dollars" | Exponentiate first |
| "Stream through a serving endpoint" | Apply the model as a Spark UDF in the pipeline |
| "Delta Live Tables" in a question | Same thing as Lakeflow Spark Declarative Pipelines — answer in exam terms |

## Today's exam — 90-minute time budget

- **Up to 58 items ÷ 90 minutes ≈ 1.5 minutes each** — keep moving and flag uncertain questions
- For multiple-selection items, check how many answers are required
- When two answers look plausible, prefer the governed, recommended Databricks approach (Unity Catalog, aliases, deploy code, the least-real-time serving that meets the latency need)

## Eat. Hydrate. Breathe.

You're ready. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to ML Associate](../README.md)**

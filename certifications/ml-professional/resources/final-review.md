---
title: Final Review — ML Professional
type: final-review
tags:
  - ml-professional
  - final-review
  - exam-morning
status: published
---

# Final Review — ML Professional (20-minute exam-morning scan)

> [!important]
> Exam: 59 scored questions, 120 minutes, pass / fail, English. The outline is the September 30, 2025 exam guide (PDF re-issued in Oct 2026, same exam). Answer in the **exam's vocabulary** ("Lakehouse Monitoring", "online tables", "DABs") even where the platform has renamed things.

## 2-minute facts that show up *most often*

- **Spark ML at scale**: `StringIndexer` → `OneHotEncoder` → `VectorAssembler` → estimator in a `Pipeline`; `PipelineModel.transform()` scores batch **and** streaming
- **Optuna + MLflow, distributed**: `MlflowStorage(experiment_id=...)` + `MlflowSparkStudy(...).optimize(...)`. Plain `n_jobs` is driver threads only
- **Ray**: `setup_ray_cluster(...)` on Databricks, then Ray Tune. Ray = task parallelism, Spark = data parallelism
- **pandas Function API**: `groupBy(key).applyInPandas(train_fn, schema)` gives one model per group
- **Nested runs**: parent experiment → child per hyperparameter set (aggregated CV metrics) → final-model run
- **Feature Engineering in UC** (`FeatureEngineeringClient`): point-in-time via `timestamp_lookup_key`; on-demand via `FeatureFunction`; online tables / online stores for serving
- **Model Registry in UC**: `databricks-uc` registry URI; aliases (`Champion` / `Challenger`) replace stages; reference production by **alias**, not latest version
- **Deploy code**: promote code, retrain in prod; unit tests on PRs, integration tests in staging
- **Bundles**: `experiments`, `registered_models`, `model_serving_endpoints`, `jobs` in `databricks.yml`; `bundle deploy -t <target>`
- **Lakehouse Monitoring** profiles: Snapshot (whole table), TimeSeries (windows), InferenceLog (adds model quality)
- **Traffic splitting** is a Model Serving feature (`traffic_config` routes across served entities); canary = small share, ramped while monitored

## 5-minute per-domain quick-fire (3 domains — 44/44/12)

### 01 — Model Development (44 %)

- **Spark ML vs single-node**: big data / streaming / batch → Spark ML or `spark_udf`; single-request real-time → single-node model on Model Serving
- **Estimator vs transformer**: `StringIndexer`, `OneHotEncoder`, `StandardScaler`, algorithms are estimators; `VectorAssembler` is a transformer
- **Regression vs classification**: continuous target → `LinearRegression` / GBT regressor; logistic / Naive Bayes / softmax are classifiers
- **Vertical first**: single machine when data and model fit; horizontal when they don't
- **Data vs model parallelism**: model fits on one GPU → DDP; too big → FSDP / DeepSpeed ZeRO / pipeline parallelism
- **Custom metrics, params, artifacts**: `log_metric(..., step=)`, `log_params`, `log_dict`, `log_table`, `log_figure`, `log_artifact`
- **Custom pyfunc**: `load_context` loads artifacts once; `predict` engineers request-time features
- **Online tables via SDK**: `w.online_tables.create_and_wait(table=OnlineTable(spec=OnlineTableSpec(...)))`; triggered (cheaper) vs continuous (fresher)
- **Streaming features**: `fe.write_table(df=streaming_df, checkpoint_location=...)` returns a `StreamingQuery`

### 02 — ML Ops (44 %)

- **Alias promotion** is atomic: `set_registered_model_alias(name, alias, version)`
- **Integration re-run rule**: a change re-tests its stage + everything downstream (hyperparameters → training, evaluation, deployment)
- **Environments**: `dev` / `staging` / `prod` catalogs; data scientists read-only in prod; prod jobs as a service principal
- **Retraining triggers**: drift or performance breach in monitor tables → alert / check task → retraining job → evaluation gate
- **Selection metric**: threshold-on-probability decisions → **log loss**; ranking → AUROC; imbalanced labels → F1
- **Drift tests**: numeric → `ks_test`, `wasserstein_distance`, `population_stability_index`; categorical → `chi_squared_test`, `tv_distance`, `l_infinity_distance`, `js_distance`
- **Drift types**: `BASELINE` (vs baseline table) and `CONSECUTIVE` (vs previous window)
- **Custom metrics**: aggregate / derived → profile table; drift → drift table; `slicing_exprs` + granularities for per-segment, per-window analysis
- **Endpoint health**: latency, request rate, error rate, CPU, memory (Serving UI or metrics export)

### 03 — Model Deployment (12 %)

- **`served_entities`**: list of UC-registered models served on one endpoint
- **`traffic_config`**: weighted `routes` summing to 100 % across `served_model_name`s
- **High-traffic safe rollout**: scale out + route optimization + canary ramp (not 100 % at once)
- **Blue-green**: atomic switch with instant rollback; **shadow**: zero user exposure
- **Route optimization**: creation-time only; OAuth + dedicated URL; custom models and feature serving
- **Query**: MLflow Deployments `predict(endpoint=..., inputs=...)` or REST `POST /serving-endpoints/<name>/invocations` with a Bearer header

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Traffic splitting is a Unity AI Gateway policy" | False — it's a Model Serving feature (`traffic_config`) |
| "`study.optimize(n_jobs=16)` distributes Optuna over the cluster" | No — driver threads; use `MlflowSparkStudy` or Ray |
| "Where do Feature Tables live now?" | Unity Catalog (Feature Engineering in UC) |
| "Stages: Production / Staging" | Deprecated — aliases |
| "Best baseline drift test for continuous features" | KS test (+ PSI / Wasserstein for magnitude); chi-square / JS / TV for categorical |
| "Audit trail of every served request" | Inference Tables |
| "Pass the token in the query string" | Never — `Authorization: Bearer` header + JSON body |
| "Enable route optimization on the existing endpoint" | Not possible — create a new route-optimized endpoint |

## Today's exam — 120-minute time budget

- **59 questions ÷ 120 minutes ≈ 2 min/question** — manage time on multi-paragraph scenarios
- Multi-step scenarios: identify the **final state** first, then work backwards to the choice that gets there with the fewest moving parts
- "Most-managed Databricks" still wins: Lakehouse Monitoring > custom drift code; Feature Engineering in UC > hand-rolled feature tables; UC Registry > workspace; bundles > ad-hoc scripts
- Watch for **API names that look right but are wrong**: `publish_online_features()` doesn't exist (the real call is `fe.publish_table(...)`), and the MLflow Tracking client doesn't query serving endpoints

## Eat. Hydrate. Breathe.

You've put in the hours. Trust the prep. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to ML Professional](../README.md)**

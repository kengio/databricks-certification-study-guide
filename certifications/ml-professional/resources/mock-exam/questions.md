---
title: ML Professional Mock Exam 1 — Questions
type: mock-exam
tags: [ml-professional, mock-exam, practice]
---

# ML Professional Mock Exam 1 — Questions

[← Back to Mock Exam](./README.md) | [Practice Questions](../practice-questions/README.md)

---

## Feature Engineering (Questions 1–9)

## Question 1 *(Easy)*

**What primary key constraint must a feature table have for Databricks Feature Engineering in UC?**

A) No constraint — any column can serve as the key
B) Must declare a primary key column to enable point-in-time lookups and online serving
C) Must be named `entity_id`
D) Must be a numeric integer type

> [!success]- Answer
> **Correct Answer: B) Must declare a primary key column to enable point-in-time lookups and online serving**
>
> Feature tables in UC require a declared primary key column. This enables entity-based lookups at serving time and supports point-in-time correct joins during training set creation.

---

## Question 2 *(Easy)*

**A team wants to compute and register features for reuse across multiple ML projects. Which API should they use?**

A) `mlflow.MlflowClient`
B) `databricks.feature_engineering.FeatureEngineeringClient`
C) `pyspark.ml.Pipeline`
D) `databricks.sdk.WorkspaceClient`

> [!success]- Answer
> **Correct Answer: B) `databricks.feature_engineering.FeatureEngineeringClient`**
>
> `FeatureEngineeringClient` is the correct API for managing Databricks Feature Engineering in Unity Catalog feature tables.

---

## Question 3 *(Easy)*

**`FeatureEngineeringClient.create_training_set()` returns which object?**

A) A Spark DataFrame directly
B) A `FeatureEngineeringTrainingSet` that must be converted with `.load_df()`
C) An MLflow dataset object
D) A pandas DataFrame

> [!success]- Answer
> **Correct Answer: B) A `FeatureEngineeringTrainingSet` that must be converted with `.load_df()`**
>
> `create_training_set()` returns a `FeatureEngineeringTrainingSet`. Call `.load_df()` on it to get the actual training DataFrame.

---

## Question 4 *(Medium)*

**A model deployed via `fe.log_model()` is served from an endpoint. How does the endpoint retrieve feature values for incoming requests?**

A) The client application must include all feature values in every request
B) The endpoint automatically retrieves features from the online store using the entity key in the request
C) A separate feature computation pipeline must run before each prediction
D) Features are cached at endpoint startup

> [!success]- Answer
> **Correct Answer: B) The endpoint automatically retrieves features from the online store using the entity key in the request**
>
> Feature Engineering in UC automatically links the model to its feature tables; at serving time, the endpoint retrieves features from the online store using only the entity key.

---

## Question 5 *(Easy)*

**What is "point-in-time correct" feature retrieval?**

A) Retrieving the most recently computed feature values
B) Retrieving feature values that were available at the time of each label's event timestamp, preventing future data leakage
C) Retrieving features refreshed within the past hour
D) Retrieving features at exactly midnight each day

> [!success]- Answer
> **Correct Answer: B) Retrieving feature values that were available at the time of each label's event timestamp, preventing future data leakage**
>
> Point-in-time correct retrieval joins features to labels using timestamps so that only data available before the label's event time is used, preventing data leakage.

---

## Question 6 *(Easy)*

**Which `FeatureLookup` parameter enables point-in-time correct retrieval?**

A) `lookup_key`
B) `feature_names`
C) `timestamp_lookup_key`
D) `event_time_col`

> [!success]- Answer
> **Correct Answer: C) `timestamp_lookup_key`**
>
> `timestamp_lookup_key` specifies the column to use as the event timestamp for point-in-time joins.

---

## Question 7 *(Easy)*

**A feature requires < 10ms retrieval latency for real-time serving. Where should the feature values be published?**

A) Delta Lake offline store only
B) Online store (Redis-backed)
C) Parquet files in ADLS
D) MLflow artifact store

> [!success]- Answer
> **Correct Answer: B) Online store (Redis-backed)**
>
> The online store provides millisecond-latency access required for real-time inference. The Delta offline store is suitable for batch and training, not real-time serving.

---

## Question 8 *(Medium)*

**Train-serving skew is caused by:**

A) The model being retrained too frequently
B) Feature computation logic differing between the training pipeline and the serving pipeline
C) The online store going offline during serving
D) Using a stale version of the model

> [!success]- Answer
> **Correct Answer: B) Feature computation logic differing between the training pipeline and the serving pipeline**
>
> Train-serving skew occurs when features are computed differently at training time vs serving time, causing the model to see different data distributions than it was trained on.

---

## Question 9 *(Easy)*

**A data scientist calls `fe.write_table(df=features_df, name="catalog.schema.user_features")` and the table does not yet exist. What happens?**

A) An error is raised — must call `create_table()` first
B) The feature table is created automatically with schema inferred from the DataFrame
C) The DataFrame is written as a regular unmanaged Delta table
D) The call fails unless the online store is configured

> [!success]- Answer
> **Correct Answer: B) The feature table is created automatically with schema inferred from the DataFrame**
>
> `write_table` creates the feature table if it doesn't exist, inferring the schema from the DataFrame.

---

## Hyperparameter Optimization (Questions 10–18)

## Question 10 *(Easy)*

**A data scientist runs Hyperopt with `Trials()` on a 20-node Databricks cluster. How many trials run in parallel?**

A) 20 — one per worker
B) 1 — `Trials` runs locally on the driver node only
C) Based on number of CPU cores on the driver
D) Based on the `parallelism` parameter

> [!success]- Answer
> **Correct Answer: B) 1 — `Trials` runs locally on the driver node only**
>
> `Trials` is a local, single-process object. Use `SparkTrials` to distribute Hyperopt across the cluster.

---

## Question 11 *(Medium)*

**What must the Hyperopt objective function return to signal a failed trial?**

A) `None`
B) `{'loss': float('inf'), 'status': STATUS_OK}`
C) `{'status': STATUS_FAIL}`
D) Raise an exception

> [!success]- Answer
> **Correct Answer: C) `{'status': STATUS_FAIL}`**
>
> Return `{'status': STATUS_FAIL}` to signal a failed trial without crashing the entire search. The trial is skipped and the next configuration is tried.

---

## Question 12 *(Medium)*

**Which `hp.*` function is best for tuning a learning rate over the range 1e-5 to 1e-1?**

A) `hp.uniform('lr', 1e-5, 1e-1)`
B) `hp.loguniform('lr', np.log(1e-5), np.log(1e-1))`
C) `hp.choice('lr', [1e-5, 1e-4, 1e-3, 1e-2, 1e-1])`
D) `hp.randint('lr', 5)`

> [!success]- Answer
> **Correct Answer: B) `hp.loguniform('lr', np.log(1e-5), np.log(1e-1))`**
>
> Log-uniform search allocates equal probability to each order of magnitude. `hp.uniform` would concentrate most trials near the upper end of the range.

---

## Question 13 *(Easy)*

**`mlflow.autolog()` is enabled and Hyperopt runs 50 trials with `SparkTrials`. How are MLflow runs organized?**

A) 50 separate top-level runs
B) 1 parent run with 50 child runs (one per trial)
C) 1 run with 50 nested metrics
D) No runs created — autolog doesn't support Hyperopt

> [!success]- Answer
> **Correct Answer: B) 1 parent run with 50 child runs (one per trial)**
>
> MLflow autolog with Hyperopt creates a parent run for the `fmin()` call and a child run for each individual trial.

---

## Question 14 *(Easy)*

**A `CrossValidator` with `numFolds=5` evaluates a parameter grid with 12 combinations. How many models are trained total?**

A) 12
B) 5
C) 60
D) 17

> [!success]- Answer
> **Correct Answer: C) 60**
>
> Each of the 12 parameter combinations is trained on 5 folds = 60 models total.

---

## Question 15 *(Medium)*

**When does Bayesian optimization (TPE) outperform random search most significantly?**

A) When the search space is very small (< 10 combinations)
B) When compute budget is limited relative to the search space size
C) When all hyperparameters are categorical
D) When the objective function is convex

> [!success]- Answer
> **Correct Answer: B) When compute budget is limited relative to the search space size**
>
> Bayesian optimization shines when you have limited trials: it uses results from past trials to prioritize promising regions, whereas random search wastes budget on unpromising areas.

---

## Question 16 *(Easy)*

**What does `parallelism=8` in `SparkTrials(parallelism=8)` control?**

A) Number of Spark partitions per trial
B) Number of trials that run simultaneously across the cluster
C) Number of MLflow child runs per trial
D) Number of cross-validation folds

> [!success]- Answer
> **Correct Answer: B) Number of trials that run simultaneously across the cluster**
>
> `parallelism` in SparkTrials controls how many Hyperopt trials execute concurrently across the Spark cluster.

---

## Question 17 *(Easy)*

**The `early_stop_fn` parameter in `fmin()` allows:**

A) Stopping individual trials that exceed a time limit
B) Stopping the entire search early if improvement has stalled
C) Stopping cluster auto-scaling during tuning
D) Stopping MLflow logging mid-search

> [!success]- Answer
> **Correct Answer: B) Stopping the entire search early if improvement has stalled**
>
> `early_stop_fn` is called after each trial and can signal `fmin()` to stop searching early based on custom logic (e.g., no improvement in last N trials).

---

## Question 18 *(Medium)*

**A team has budget for 30 trials to tune 6 hyperparameters. Which strategy is most efficient?**

A) Grid search — guarantees coverage
B) Random search
C) Bayesian optimization (TPE via Hyperopt)
D) Manual search based on intuition

> [!success]- Answer
> **Correct Answer: C) Bayesian optimization (TPE via Hyperopt)**
>
> With 30 trials over 6 parameters, Bayesian optimization uses previous results to guide the search, typically finding better configurations than random search in the same budget.

---

## Model Production Lifecycle (Questions 19–32)

## Question 19 *(Easy)*

**Which URI loads a model from the UC registry by alias?**

A) `models:/fraud_classifier@champion`
B) `models:/ml_catalog.fraud_models.fraud_classifier@champion`
C) `uc://ml_catalog/fraud_models/fraud_classifier@champion`
D) `mlflow://ml_catalog.fraud_models.fraud_classifier:champion`

> [!success]- Answer
> **Correct Answer: B) `models:/ml_catalog.fraud_models.fraud_classifier@champion`**
>
> UC model URIs use the full three-level namespace followed by `@alias`.

---

## Question 20 *(Medium)*

**A serving endpoint with `scale_to_zero_enabled=True` hasn't received traffic for 45 minutes. What happens to the next request?**

A) The request fails with a 503 error
B) The request succeeds after a 60-120 second cold start delay
C) The request returns from cache immediately
D) Auto-scaling resumes within 1 second

> [!success]- Answer
> **Correct Answer: B) The request succeeds after a 60-120 second cold start delay**
>
> Scale-to-zero deprovisions compute when idle. The first request after idle must wait for cluster startup, typically 60-120 seconds.

---

## Question 21 *(Easy)*

**`mlflow.pyfunc.spark_udf()` runs inference on which Spark component?**

A) Driver node only
B) Spark executors (distributed across the cluster)
C) Databricks SQL warehouse
D) A dedicated GPU cluster

> [!success]- Answer
> **Correct Answer: B) Spark executors (distributed across the cluster)**
>
> `spark_udf` distributes inference across Spark executors, enabling parallel scoring of millions of rows.

---

## Question 22 *(Medium)*

**A model is registered to the workspace registry (no `set_registry_uri` call). Which UC feature is unavailable?**

A) Model aliases
B) Version tags
C) UC lineage tracking and cross-catalog permissions
D) Model descriptions

> [!success]- Answer
> **Correct Answer: C) UC lineage tracking and cross-catalog permissions**
>
> UC lineage and GRANT/REVOKE on model objects require the UC registry. The workspace registry supports aliases and tags but not UC governance features.

---

## Question 23 *(Medium)*

**Which statement about model aliases is TRUE?**

A) Each model can have only one alias at a time
B) Aliases are named pointers — changing the pointed-to version doesn't require updating application code
C) Aliases replace version numbers entirely
D) Aliases are equivalent to legacy lifecycle stages

> [!success]- Answer
> **Correct Answer: B) Aliases are named pointers — changing the pointed-to version doesn't require updating application code**
>
> This is the core value of aliases: application code uses `models:/name@champion`, and promotion is just reassigning the alias to a different version.

---

## Question 24 *(Easy)*

**An endpoint has champion at 80% and challenger at 10% traffic. Is this a valid configuration?**

A) Yes — challenger traffic below 50% is fine
B) No — percentages must sum to exactly 100%
C) Yes — Databricks distributes the remaining 10% randomly
D) No — only two served models are allowed per endpoint

> [!success]- Answer
> **Correct Answer: B) No — percentages must sum to exactly 100%**
>
> Traffic config percentages must sum to exactly 100%. The configuration described (80% + 10% = 90%) is invalid.

---

## Question 25 *(Easy)*

**Which deployment pattern runs the challenger model in parallel without serving its predictions to users?**

A) Canary deployment
B) Blue-green deployment
C) Shadow deployment
D) A/B testing

> [!success]- Answer
> **Correct Answer: C) Shadow deployment**
>
> Shadow deployment sends all traffic to the champion but also runs the challenger silently, logging its predictions for offline comparison with zero user impact.

---

## Question 26 *(Medium)*

**What enables automatic logging of all requests and responses from a serving endpoint to a Delta table?**

A) `MonitorInferenceLog` in Lakehouse Monitoring
B) `AutoCaptureConfigInput` in the endpoint configuration
C) `mlflow.langchain.autolog()`
D) Delta Streaming from the endpoint logs

> [!success]- Answer
> **Correct Answer: B) `AutoCaptureConfigInput` in the endpoint configuration**
>
> `AutoCaptureConfigInput` (inference tables) is configured on the serving endpoint and automatically logs all request/response payloads to a Delta table.

---

## Question 27 *(Medium)*

**A `PythonModel` subclass needs to load a pre-trained tokenizer at serving time. The tokenizer is stored locally as a file. How should it be packaged with the model?**

A) Hardcode the file path in the `predict()` method
B) Pass it as an environment variable
C) Include it in the `artifacts` dict in `mlflow.pyfunc.log_model()` and load it in `load_context()`
D) Store it in DBFS and access it from the model

> [!success]- Answer
> **Correct Answer: C) Include it in the `artifacts` dict in `mlflow.pyfunc.log_model()` and load it in `load_context()`**
>
> The `artifacts` dict in `log_model()` specifies local files to bundle with the model; `load_context()` receives the resolved paths via `context.artifacts`.

---

## Question 28 *(Medium)*

**Which task dependency setting ensures an integration test task runs only if the evaluation gate task succeeds?**

A) `depends_on: [evaluation_gate]` only
B) `run_if: ALL_SUCCESS` with `depends_on: [evaluation_gate]`
C) `run_if: AT_LEAST_ONE_SUCCESS`
D) No special configuration — tasks always wait for predecessors

> [!success]- Answer
> **Correct Answer: B) `run_if: ALL_SUCCESS` with `depends_on: [evaluation_gate]`**
>
> `run_if: ALL_SUCCESS` plus the `depends_on` dependency ensures the task runs only when all upstream tasks have completed successfully.

---

## Question 29 *(Medium)*

**Drift-triggered retraining uses which mechanism to start a Databricks Job?**

A) Scheduled cron expression
B) SQL alert → webhook → Databricks Jobs REST API
C) Auto-trigger based on MLflow metric threshold
D) Git push to the model training branch

> [!success]- Answer
> **Correct Answer: B) SQL alert → webhook → Databricks Jobs REST API**
>
> Monitoring alerts (Databricks SQL alerts or Lakehouse Monitoring alerts) fire webhooks to external systems; the webhook calls the Databricks Jobs REST API to trigger a retraining run.

---

## Question 30 *(Medium)*

**For real-time fraud detection requiring < 50ms response time, which deployment mode is correct?**

A) Batch scoring with `spark_udf`
B) REST endpoint with `scale_to_zero_enabled=False`
C) Streaming inference with a 30-second trigger
D) Scheduled scoring job every 5 minutes

> [!success]- Answer
> **Correct Answer: B) REST endpoint with `scale_to_zero_enabled=False`**
>
> REST endpoint provides sub-100ms latency; disabling scale_to_zero eliminates cold start risk for latency-sensitive workloads.

---

## Question 31 *(Hard)*

**A custom pyfunc model returns predictions as a DataFrame with columns `[score, label]`. What should `result_type` be in `spark_udf()`?**

A) `"double"`
B) `"string"`
C) `StructType([StructField("score", DoubleType()), StructField("label", StringType())])`
D) `"array<double>"`

> [!success]- Answer
> **Correct Answer: C) `StructType([StructField("score", DoubleType()), StructField("label", StringType())])`**
>
> When the pyfunc returns a multi-column DataFrame, `result_type` must be a Spark `StructType` matching the output columns.

---

## Question 32 *(Medium)*

**What is the purpose of archiving the previous `champion` alias as `previous_champion` during promotion?**

A) Required by MLflow API
B) Enables quick rollback by setting `champion` back to the `previous_champion` version
C) Prevents the old version from being deleted
D) Required for UC audit compliance

> [!success]- Answer
> **Correct Answer: B) Enables quick rollback by setting `champion` back to the `previous_champion` version**
>
> Keeping a `previous_champion` alias allows one-command rollback: `client.set_registered_model_alias(name, "champion", prev_version)`.

---

## Model Governance & MLOps (Questions 33–45)

## Question 33 *(Easy)*

**Feature PSI = 0.05 this week. What action should you take?**

A) Retrain the model immediately
B) Investigate the upstream data pipeline
C) No action — PSI < 0.10 indicates stable population
D) Enable Lakehouse Monitoring

> [!success]- Answer
> **Correct Answer: C) No action — PSI < 0.10 indicates stable population**
>
> PSI < 0.10 means no significant population shift. Continue regular monitoring cadence.

---

## Question 34 *(Medium)*

**A model's AUC dropped from 0.92 to 0.84 over 3 weeks with ground truth labels available. Which drift type explains this?**

A) Data drift — features changed
B) Prediction drift — outputs changed
C) Concept drift — the input-output relationship changed
D) Label drift — target class balance shifted

> [!success]- Answer
> **Correct Answer: C) Concept drift — the input-output relationship changed**
>
> Measurable performance degradation (AUC drop) with ground truth labels indicates concept drift: the relationship between features and the target has changed.

---

## Question 35 *(Medium)*

**Which column in a Databricks inference table identifies which model version handled each request (for A/B analysis)?**

A) `model_version`
B) `served_model_name`
C) `databricks_request_id`
D) `endpoint_name`

> [!success]- Answer
> **Correct Answer: B) `served_model_name`**
>
> The `served_model_name` field (extracted from the request JSON) identifies which served model configuration handled each request.

---

## Question 36 *(Easy)*

**Which Lakehouse Monitoring monitor type is appropriate for a static, snapshot Delta table with no timestamp column?**

A) TimeSeries
B) InferenceLog
C) Snapshot
D) DriftProfile

> [!success]- Answer
> **Correct Answer: C) Snapshot**
>
> Snapshot monitors compute statistics on the entire table as-is, without time-window partitioning.

---

## Question 37 *(Easy)*

**UC audit logs capture which ML-related event?**

A) Model training duration
B) Hyperopt trial results
C) `updateModelVersionAlias` — alias changes (model promotions)
D) MLflow autolog metrics

> [!success]- Answer
> **Correct Answer: C) `updateModelVersionAlias` — alias changes (model promotions)**
>
> UC audit logs capture governance events including alias updates (promotions), permission grants, and model registrations.

---

## Question 38 *(Easy)*

**The GDPR Article 22 requirement that affects ML models is:**

A) Data must be encrypted at rest
B) Models must be retrained every 6 months
C) Individuals have the right to meaningful explanation of automated decisions affecting them
D) Predictions must be stored for 7 years

> [!success]- Answer
> **Correct Answer: C) Individuals have the right to meaningful explanation of automated decisions affecting them**
>
> Article 22 grants individuals the right to not be subject to solely automated decisions and requires meaningful explanation. SHAP values are the standard technical control.

---

## Question 39 *(Medium)*

**Equalized odds as a fairness metric requires:**

A) Equal accuracy across demographic groups
B) Equal true positive rates and equal false positive rates across groups
C) Equal approval rates across groups
D) Equal training data representation across groups

> [!success]- Answer
> **Correct Answer: B) Equal true positive rates and equal false positive rates across groups**
>
> Equalized odds (Hardt et al.) requires both TPR and FPR to be equal across protected groups, making it stricter than demographic parity (which only requires equal positive prediction rates).

---

## Question 40 *(Medium)*

**A model has PSI = 0.28 on prediction scores (not features). What does this indicate?**

A) The model is stable
B) Input features have drifted
C) Model output distribution has shifted significantly — potential concept drift or upstream data change
D) The online store is returning stale values

> [!success]- Answer
> **Correct Answer: C) Model output distribution has shifted significantly — potential concept drift or upstream data change**
>
> High PSI on prediction scores indicates the model is producing very different outputs than it did against the baseline. Investigate whether upstream data or the concept has changed.

---

## Question 41 *(Hard)*

**Which UC permission allows a data scientist to register new model versions but NOT change the `champion` alias?**

A) `EXECUTE ON MODEL`
B) `SELECT ON MODEL`
C) `MODIFY ON MODEL` (both registering and alias setting require MODIFY — use process controls)
D) `CREATE ON SCHEMA`

> [!success]- Answer
> **Correct Answer: C) `MODIFY ON MODEL` (both registering and alias setting require MODIFY — use process controls)**
>
> Both registering new versions and setting aliases require `MODIFY`. There is no separate UC permission to separate these; process-level controls (PR review, approval workflows) enforce the distinction.

---

## Question 42 *(Medium)*

**A Delta table contains PII (email addresses) that must be hidden from data scientists but visible to the ML platform team. Which control should be used?**

A) Row-level security
B) Delta column masking policy
C) Separate Delta table without PII
D) Encrypt the column with a user-specific key

> [!success]- Answer
> **Correct Answer: B) Delta column masking policy**
>
> Delta column masking applies a masking function at query time, showing masked values to unauthorized users while platform team queries see real values.

---

## Question 43 *(Easy)*

**Databricks Lakehouse Monitoring outputs a `_drift_metrics` table. What columns does this table contain?**

A) Raw feature values from production
B) Statistical drift measures (e.g., KS statistic, chi-square, PSI) per feature per time window compared to baseline
C) Model hyperparameters
D) MLflow run IDs for the monitored model

> [!success]- Answer
> **Correct Answer: B) Statistical drift measures (e.g., KS statistic, chi-square, PSI) per feature per time window compared to baseline**
>
> The drift metrics table contains per-feature, per-window drift statistics comparing the current window profile to the baseline profile.

---

## Question 44 *(Medium)*

**After retraining a model and promoting it to champion, what must be updated in Lakehouse Monitoring?**

A) The monitor type
B) The baseline table — update it to reflect the new model's training distribution
C) The alert thresholds
D) Nothing — LHM automatically detects the new champion

> [!success]- Answer
> **Correct Answer: B) The baseline table — update it to reflect the new model's training distribution**
>
> The baseline table should be updated after a significant model change (new training data, new features) so that drift metrics compare against the new model's expected distribution, not the old one.

---

## Question 45 *(Medium)*

**A compliance evidence package for a high-risk ML model must include which item?**

A) Source code for all Spark jobs
B) Bias test results demonstrating the model meets fairness thresholds
C) A list of all MLflow experiments in the workspace
D) Cloud infrastructure cost reports

> [!success]- Answer
> **Correct Answer: B) Bias test results demonstrating the model meets fairness thresholds**
>
> Bias and fairness test results are critical compliance evidence for high-risk models, demonstrating that the model was evaluated for discriminatory impact before deployment.

---

[← Back to Mock Exam](./README.md) | [Practice Questions](../practice-questions/README.md)

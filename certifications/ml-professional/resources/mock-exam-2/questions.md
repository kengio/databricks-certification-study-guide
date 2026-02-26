---
title: ML Professional Mock Exam 2 — Questions
type: mock-exam
tags: [ml-professional, mock-exam, practice]
---

# ML Professional Mock Exam 2 — Questions

[← Back to Mock Exam 2](./README.md) | [Practice Questions](../practice-questions/README.md)

---

## Feature Engineering (Questions 1–9)

## Question 1 *(Easy)*

**Which method in `FeatureEngineeringClient` retrieves feature table metadata?**

A) `get_table()`
B) `describe_table()`
C) `read_table()`
D) `inspect_table()`

> [!success]- Answer
> **Correct Answer: A) `get_table()`**
>
> `fe.get_table(name="catalog.schema.feature_table")` retrieves the FeatureTable metadata object including schema, primary keys, and timestamp column.

---

## Question 2 *(Medium)*

**A feature table has `user_id` as primary key and `event_time` as the timestamp column. Which `FeatureLookup` parameters are needed for point-in-time retrieval?**

A) `lookup_key="user_id"` only
B) `lookup_key="user_id"` and `timestamp_lookup_key="event_time"`
C) `timestamp_lookup_key="event_time"` only
D) `feature_names=["user_id", "event_time"]`

> [!success]- Answer
> **Correct Answer: B) `lookup_key="user_id"` and `timestamp_lookup_key="event_time"`**
>
> Both lookup_key (for entity matching) and timestamp_lookup_key (for point-in-time join) are required for temporally correct feature retrieval.

---

## Question 3 *(Medium)*

**What is the relationship between the offline and online feature stores?**

A) They are identical — same storage, different access patterns
B) Offline (Delta) stores historical feature values; online (Redis-backed) stores the latest values for real-time serving
C) Online store is a cache of the offline store with 24-hour TTL
D) They are separate systems with no automatic synchronization

> [!success]- Answer
> **Correct Answer: B) Offline (Delta) stores historical feature values; online (Redis-backed) stores the latest values for real-time serving**
>
> The offline store (Delta Lake) holds all historical feature values for training and batch scoring. The online store holds the latest values for real-time inference. `publish_online_features()` syncs from offline to online.

---

## Question 4 *(Medium)*

**A team logs a model using `mlflow.sklearn.log_model()` instead of `fe.log_model()`. What is the consequence for feature lineage?**

A) No consequence — both methods capture feature lineage
B) Feature table dependencies are NOT automatically linked to the model version
C) The model cannot be registered to the UC registry
D) Point-in-time features will not work at serving time

> [!success]- Answer
> **Correct Answer: B) Feature table dependencies are NOT automatically linked to the model version**
>
> Only `fe.log_model()` (FeatureEngineeringClient) captures the feature table dependencies and enables automatic feature retrieval at serving. `mlflow.sklearn.log_model()` does not capture this lineage.

---

## Question 5 *(Easy)*

**`publish_online_features()` is called on a feature table. What does this do?**

A) Creates a new version of the offline feature table
B) Synchronizes the latest feature values from Delta (offline) to the online store
C) Runs feature engineering computation jobs
D) Registers the feature table in the UC registry

> [!success]- Answer
> **Correct Answer: B) Synchronizes the latest feature values from Delta (offline) to the online store**
>
> `publish_online_features()` pushes the latest feature values to the online (Redis-backed) store, making them available for real-time serving.

---

## Question 6 *(Medium)*

**A model at serving time needs to retrieve user features using only the `user_id` from the request. What is required in the feature table?**

A) The feature table must have `user_id` as the primary key and be published to the online store
B) The feature table must be a managed Delta table
C) The model must include the feature computation logic internally
D) The feature table must be co-located in the same catalog as the model

> [!success]- Answer
> **Correct Answer: A) The feature table must have `user_id` as the primary key and be published to the online store**
>
> For automatic feature retrieval at serving, the feature table needs `user_id` as primary key (for lookup) and values in the online store (for low-latency access).

---

## Question 7 *(Medium)*

**How does `FeatureEngineeringClient.create_training_set()` prevent data leakage?**

A) It filters out test set records
B) It uses `timestamp_lookup_key` to join feature values that were available before each label's event timestamp
C) It randomly shuffles the training data
D) It drops features that are correlated with the target

> [!success]- Answer
> **Correct Answer: B) It uses `timestamp_lookup_key` to join feature values that were available before each label's event timestamp**
>
> The point-in-time join ensures features are joined only from the time period before the label's event occurred, preventing any future information from contaminating the training set.

---

## Question 8 *(Medium)*

**A data scientist needs feature lineage for compliance but does not need real-time serving. Which approach is correct?**

A) Use `fe.log_model()` with only the offline store configured (no online store required)
B) Use `mlflow.sklearn.log_model()` with manual lineage documentation
C) Skip feature lineage — it's only needed for real-time serving
D) Use a regular Delta table instead of a feature table

> [!success]- Answer
> **Correct Answer: A) Use `fe.log_model()` with only the offline store configured (no online store required)**
>
> `fe.log_model()` captures feature lineage (the connection between feature tables and the model) regardless of whether the online store is configured. The online store is only needed for real-time serving.

---

## Question 9 *(Easy)*

**What happens when two rows with the same primary key are written to a feature table using `fe.write_table()`?**

A) An error is raised
B) The existing row is updated (upserted) with the new values
C) Both rows are retained (duplicates allowed)
D) The new row is silently dropped

> [!success]- Answer
> **Correct Answer: B) The existing row is updated (upserted) with the new values**
>
> Feature tables are designed for upsert semantics — writing a row with an existing primary key updates the existing record.

---

## Hyperparameter Optimization (Questions 10–18)

## Question 10 *(Medium)*

**A data scientist defines `space = {'n_estimators': hp.quniform('n_estimators', 100, 1000, 100)}`. What values can `n_estimators` take?**

A) Any float between 100 and 1000
B) Integer multiples of 100 between 100 and 1000: 100, 200, ..., 1000
C) Random floats between 0 and 1
D) Only 100 and 1000

> [!success]- Answer
> **Correct Answer: B) Integer multiples of 100 between 100 and 1000: 100, 200, ..., 1000**
>
> `hp.quniform(label, low, high, q)` returns values rounded to the nearest multiple of `q`. With q=100, values are 100, 200, 300, ..., 1000.

---

## Question 11 *(Medium)*

**A Spark ML `CrossValidator` with `numFolds=3` and `parallelism=3` trains a grid of 9 configurations. How many models train simultaneously?**

A) 3
B) 9
C) 27
D) 1

> [!success]- Answer
> **Correct Answer: A) 3**
>
> `parallelism=3` means 3 models train simultaneously. Total models = 9 × 3 = 27, trained in batches of 3.

---

## Question 12 *(Medium)*

**What is the main advantage of `hp.loguniform` over `hp.uniform` for a regularization parameter like `alpha` ranging from 0.0001 to 1.0?**

A) `hp.loguniform` is faster to compute
B) `hp.loguniform` allocates equal probability to each order of magnitude (0.0001-0.001, 0.001-0.01, 0.01-0.1, 0.1-1.0), preventing bias toward large values
C) `hp.loguniform` only works with positive values
D) `hp.loguniform` is required for Bayesian optimization

> [!success]- Answer
> **Correct Answer: B) `hp.loguniform` allocates equal probability to each order of magnitude, preventing bias toward large values**
>
> On a linear scale, most trials would cluster near 1.0. Log scale ensures equal exploration across orders of magnitude, which matters for regularization and learning rate parameters.

---

## Question 13 *(Easy)*

**AutoML is run on a classification task. Which outputs are produced?**

A) Only the best model artifact
B) A best-model notebook, a data exploration notebook, feature importance plots, and an MLflow experiment with all trial runs
C) A hyperparameter configuration file only
D) A trained model endpoint

> [!success]- Answer
> **Correct Answer: B) A best-model notebook, a data exploration notebook, feature importance plots, and an MLflow experiment with all trial runs**
>
> Databricks AutoML produces: a best-trial notebook (editable), a data exploration notebook, an MLflow experiment with runs for all tested algorithms, and the best model registered.

---

## Question 14 *(Medium)*

**The objective function for Hyperopt returns `1 - accuracy`. Why not return `-accuracy`?**

A) There is no practical difference
B) Both are correct — either negation works because Hyperopt minimizes the returned loss
C) `1 - accuracy` is more numerically stable
D) `-accuracy` would cause Hyperopt to maximize, not minimize

> [!success]- Answer
> **Correct Answer: B) Both are correct — either negation works because Hyperopt minimizes the returned loss**
>
> Both `1 - accuracy` and `-accuracy` correctly signal to Hyperopt to maximize accuracy (by minimizing the returned loss). Both are valid; the convention varies by team.

---

## Question 15 *(Hard)*

**A team runs Hyperopt with `SparkTrials(parallelism=4)` and `max_evals=40`. Bayesian optimization (TPE) requires results from previous trials to suggest the next configuration. How does this work with parallelism?**

A) Parallelism is disabled when using TPE
B) TPE runs 4 random trials first (no history), then uses available results to suggest batches of 4 subsequent trials
C) Each parallel trial accesses the same history simultaneously
D) Parallelism only works with random search, not TPE

> [!success]- Answer
> **Correct Answer: B) TPE runs 4 random trials first (no history), then uses available results to suggest batches of 4 subsequent trials**
>
> With parallelism > 1, TPE initially makes semi-random suggestions for the first batch, then incorporates completed trial results to suggest the next batch. This reduces but does not eliminate the Bayesian efficiency advantage.

---

## Question 16 *(Medium)*

**A model pipeline includes `VectorAssembler → StandardScaler → RandomForestClassifier`. A team wants to tune `RandomForestClassifier.numTrees` and `StandardScaler.withMean`. What object should wrap the tuning?**

A) Tune only the `RandomForestClassifier` stage
B) Wrap the entire `Pipeline` in `CrossValidator` — `ParamGridBuilder` can reference any stage's params
C) Separate `CrossValidator` per stage
D) Use Hyperopt on each stage independently

> [!success]- Answer
> **Correct Answer: B) Wrap the entire `Pipeline` in `CrossValidator` — `ParamGridBuilder` can reference any stage's params**
>
> `CrossValidator` wraps the full Pipeline. `ParamGridBuilder` uses `stage.paramName` syntax to reference params across any stage.

---

## Question 17 *(Easy)*

**What does `no_progress_loss(n)` do in a Hyperopt early stopping function?**

A) Stops if loss increases for n consecutive trials
B) Stops if no improvement is seen in the best loss across the last n trials
C) Stops after n total trials regardless of improvement
D) Stops if any trial takes longer than n seconds

> [!success]- Answer
> **Correct Answer: B) Stops if no improvement is seen in the best loss across the last n trials**
>
> `no_progress_loss(n)` is a built-in early stopping function that halts the search if the best observed loss hasn't improved in the last n trials.

---

## Question 18 *(Easy)*

**A data scientist wants to compare a fixed set of 8 hyperparameter combinations exhaustively. Which search strategy is most appropriate?**

A) Bayesian optimization — always best
B) Random search with max_evals=8
C) Grid search — exhaustive when search space is fully enumerable and small
D) AutoML

> [!success]- Answer
> **Correct Answer: C) Grid search — exhaustive when search space is fully enumerable and small**
>
> When the search space is small and fully known (8 combinations), grid search guarantees every combination is evaluated. Bayesian optimization overhead is unnecessary for such small spaces.

---

## Model Production Lifecycle (Questions 19–32)

## Question 19 *(Easy)*

**A model version is in the UC registry. What is the correct way to load the latest version tagged with alias `champion`?**

A) `mlflow.sklearn.load_model("models:/catalog.schema.model/latest")`
B) `mlflow.pyfunc.load_model("models:/catalog.schema.model@champion")`
C) `MlflowClient().get_model_version_by_alias(name, "champion")`
D) `mlflow.pyfunc.load_model(f"models:/catalog.schema.model/{version_number}")`

> [!success]- Answer
> **Correct Answer: B) `mlflow.pyfunc.load_model("models:/catalog.schema.model@champion")`**
>
> `mlflow.pyfunc.load_model("models:/catalog.schema.model@champion")` loads the version currently pointed to by the `champion` alias.

---

## Question 20 *(Medium)*

**A team registers a model with `mlflow.sklearn.log_model(model, "model", registered_model_name="fraud_clf")`. Which registry does this go to if `set_registry_uri` was not called?**

A) UC registry in `main` catalog
B) Workspace model registry
C) The call fails — must call `set_registry_uri` first
D) A temporary registry that expires after 30 days

> [!success]- Answer
> **Correct Answer: B) Workspace model registry**
>
> Without `mlflow.set_registry_uri("databricks-uc")`, models are registered to the workspace registry (not UC). UC features like GRANT and lineage are unavailable.

---

## Question 21 *(Medium)*

**A `ServedModelInput` is configured with `workload_size=SMALL` and a traffic of 100 RPS arrives. What happens?**

A) Requests are queued until compute scales up
B) The endpoint auto-scales to Medium/Large compute to handle the load
C) Requests fail with 429 Too Many Requests until manually scaled
D) SMALL size is fixed — it cannot auto-scale

> [!success]- Answer
> **Correct Answer: A) Requests are queued until compute scales up**
>
> Databricks Model Serving queues requests and auto-scales the serving compute based on traffic, with some queuing latency during scale-up.

---

## Question 22 *(Hard)*

**Model signatures with `infer_signature()` are inferred from training data. Why might this cause a serving error?**

A) Signatures are only valid for 30 days
B) If the training data has extra columns (e.g., label column), the signature includes them; serving requests without those columns will fail schema validation
C) `infer_signature` doesn't work for sklearn models
D) Signatures with more than 10 features cause serving errors

> [!success]- Answer
> **Correct Answer: B) If the training data has extra columns (e.g., label column), the signature includes them; serving requests without those columns will fail schema validation**
>
> Always infer signature from the feature input (X) only, not the full training DataFrame including the label column.

---

## Question 23 *(Hard)*

**In a multi-task Databricks Job, Task B `depends_on` Task A with `run_if: ALL_SUCCESS`. Task A is skipped because its condition was false. What happens to Task B?**

A) Task B runs anyway
B) Task B is also skipped
C) Task B fails
D) Task B waits indefinitely

> [!success]- Answer
> **Correct Answer: B) Task B is also skipped**
>
> If a dependency is skipped, downstream tasks with `ALL_SUCCESS` are also skipped (not failed), since the condition was "skipped" rather than "failed".

---

## Question 24 *(Medium)*

**A team wants to compare champion vs challenger performance using inference tables. Which SQL query approach identifies predictions from each model?**

A) Query by `timestamp_ms` range
B) Extract `served_model_name` from the request JSON field
C) Filter by `model_version` column
D) Join with the MLflow experiment table

> [!success]- Answer
> **Correct Answer: B) Extract `served_model_name` from the request JSON field**
>
> The inference table's `request` JSON contains the `served_model_name` field, which identifies which endpoint configuration (champion or challenger) served each request.

---

## Question 25 *(Easy)*

**What is a "blue-green deployment" in the context of ML model serving?**

A) Splitting traffic 50/50 between two model versions
B) Running two full serving environments (blue=current production, green=new version), then switching all traffic from blue to green atomically
C) Gradually increasing challenger traffic from 10% to 100%
D) Running shadow deployment alongside champion

> [!success]- Answer
> **Correct Answer: B) Running two full serving environments (blue=current production, green=new version), then switching all traffic from blue to green atomically**
>
> Blue-green switches the entire traffic to the new version in one step after the new environment is validated, providing instant rollback capability by switching back to blue.

---

## Question 26 *(Medium)*

**A model registered with `fe.log_model()` is deployed. A request comes in with only `{"user_id": 12345}`. How does the endpoint respond?**

A) Error — insufficient features in the request
B) The endpoint looks up all required features from the online store using `user_id` and returns a prediction
C) A prediction of null is returned
D) The endpoint requests the missing features from the client

> [!success]- Answer
> **Correct Answer: B) The endpoint looks up all required features from the online store using `user_id` and returns a prediction**
>
> This is the key Feature Engineering in UC serving pattern: the model knows which features to retrieve and automatically looks them up from the online store using the entity key.

---

## Question 27 *(Easy)*

**`mlflow.evaluate()` is called after training. What does it return?**

A) A retrained model
B) An `EvaluationResult` with metrics, artifacts, and a logged MLflow run
C) A report in PDF format
D) A serving endpoint configuration

> [!success]- Answer
> **Correct Answer: B) An `EvaluationResult` with metrics, artifacts, and a logged MLflow run**
>
> `mlflow.evaluate()` returns an `EvaluationResult` object containing computed metrics, generated artifacts (confusion matrix, etc.), and logs everything to MLflow.

---

## Question 28 *(Medium)*

**A Python wheel task is preferred over a notebook task in a Databricks Job because:**

A) Notebook tasks are deprecated
B) Python wheel tasks are versioned, testable, and installable as library packages — better for production pipelines
C) Notebook tasks cannot use cluster libraries
D) Python wheels use less cluster memory

> [!success]- Answer
> **Correct Answer: B) Python wheel tasks are versioned, testable, and installable as library packages — better for production pipelines**
>
> Python wheel tasks encapsulate code as testable, versioned packages, making them more suitable for production ML pipelines than ad-hoc notebooks.

---

## Question 29 *(Medium)*

**What should happen to the `previous_champion` alias after a successful canary completion and full traffic migration?**

A) Keep it indefinitely for rollback
B) Delete it once the new champion has been stable in production for your team's defined stability period (e.g., 2 weeks)
C) Rename it to `archived`
D) It is automatically deleted by Databricks after 30 days

> [!success]- Answer
> **Correct Answer: B) Delete it once the new champion has been stable in production for your team's defined stability period (e.g., 2 weeks)**
>
> Keep `previous_champion` as a rapid rollback option initially. Once the new champion is stable, clean up stale aliases to avoid confusion. The retention period is team-defined.

---

## Question 30 *(Medium)*

**Which configuration option on a serving endpoint helps ensure consistent low latency for a high-SLA fraud detection service?**

A) `scale_to_zero_enabled=True`
B) `scale_to_zero_enabled=False` with appropriate `workload_size`
C) `max_concurrent_requests=1`
D) `traffic_percentage=100` for the champion

> [!success]- Answer
> **Correct Answer: B) `scale_to_zero_enabled=False` with appropriate `workload_size`**
>
> Keeping compute always-on (scale_to_zero disabled) eliminates cold start latency. Appropriate workload size ensures enough capacity for peak traffic.

---

## Question 31 *(Easy)*

**A serving endpoint receives 1,000 requests per second. 5 requests returned status 500. What is the error rate?**

A) 5%
B) 0.5%
C) 0.005% (5 out of 100,000 if measured over 100 seconds)
D) Cannot calculate without knowing the time window

> [!success]- Answer
> **Correct Answer: B) 0.5%**
>
> 5 errors / 1000 requests = 0.5% error rate (for that specific second; requires time windowing for a meaningful rate metric).

---

## Question 32 *(Medium)*

**A team needs to implement a promotion gate that compares challenger AUC to champion AUC. The champion alias must be updated only if the challenger improves by ≥ 0.5%. Which tool runs this logic?**

A) Databricks SQL alert
B) A notebook task in a Databricks Job, using `MlflowClient` to compare metrics and `set_registered_model_alias` to promote
C) MLflow autolog automatic promotion
D) Lakehouse Monitoring auto-promotion

> [!success]- Answer
> **Correct Answer: B) A notebook task in a Databricks Job, using `MlflowClient` to compare metrics and `set_registered_model_alias` to promote**
>
> Promotion gate logic is custom Python code in a Databricks Job task that: loads both models, evaluates on holdout, compares metrics, and promotes if the threshold is met.

---

## Model Governance & MLOps (Questions 33–45)

## Question 33 *(Medium)*

**A team's model has PSI = 0.22 on the `income_bracket` feature. What is the recommended first step?**

A) Immediately retrain with all available data
B) Investigate why `income_bracket` has shifted — check upstream data pipeline and data quality
C) Roll back to the previous model version
D) Ignore — PSI above 0.2 is normal

> [!success]- Answer
> **Correct Answer: B) Investigate why `income_bracket` has shifted — check upstream data pipeline and data quality**
>
> PSI > 0.2 indicates significant drift, but the root cause must be determined first. If it's an upstream data pipeline issue (wrong data, schema change), retraining on bad data would make things worse.

---

## Question 34 *(Easy)*

**Which LHM output table stores per-window statistical profiles (mean, stddev, quantiles) of each feature?**

A) `_drift_metrics`
B) `_monitor_info`
C) `_profile_metrics`
D) `_alert_history`

> [!success]- Answer
> **Correct Answer: C) `_profile_metrics`**
>
> The `_profile_metrics` table stores statistical profiles (mean, std, min, max, quantiles, null counts) per feature per time window.

---

## Question 35 *(Medium)*

**A compliance officer asks: "Who changed the `champion` alias for `ml_catalog.fraud_models.fraud_classifier` on Jan 15?" Where is this information found?**

A) MLflow experiment runs
B) `system.access.audit` filtered by `actionName = 'updateModelVersionAlias'` and date
C) Databricks cluster logs
D) The model's `description` field

> [!success]- Answer
> **Correct Answer: B) `system.access.audit` filtered by `actionName = 'updateModelVersionAlias'` and date**
>
> UC audit logs in `system.access.audit` record all alias update events with user identity, timestamp, and the specific model name.

---

## Question 36 *(Medium)*

**A team runs bias testing before deployment and finds disparate impact = 0.73. What should happen next?**

A) Deploy the model — 0.73 is close enough to 0.80
B) Block deployment — investigate and remediate the bias before promoting to production
C) Deploy with a disclaimer in the model card
D) Retrain with twice the minority group data

> [!success]- Answer
> **Correct Answer: B) Block deployment — investigate and remediate the bias before promoting to production**
>
> Disparate impact of 0.73 is below the four-fifths rule threshold of 0.80. Deployment should be blocked until the bias is investigated and remediated to meet the fairness threshold.

---

## Question 37 *(Medium)*

**An MLflow run logs `mlflow.log_input(dataset, context="training")`. What does this enable?**

A) Automatic retraining when the dataset changes
B) UC data lineage: the Delta table version used for training is linked to the model version in the lineage graph
C) Dataset versioning in the MLflow artifact store
D) Automatic data quality monitoring

> [!success]- Answer
> **Correct Answer: B) UC data lineage: the Delta table version used for training is linked to the model version in the lineage graph**
>
> `log_input` with a `DeltaDatasetSource` creates a UC lineage link between the specific Delta table version and the model version, enabling auditors to trace exactly which data trained which model.

---

## Question 38 *(Easy)*

**Lakehouse Monitoring is configured with `granularities=["1 day", "1 week"]`. What does this mean?**

A) Monitoring runs once per day and once per week
B) Drift and profile metrics are computed at both daily and weekly time windows
C) Alerts fire every day and every week
D) Data is retained for 1 day or 1 week depending on the monitor type

> [!success]- Answer
> **Correct Answer: B) Drift and profile metrics are computed at both daily and weekly time windows**
>
> Granularities specify the time windows over which metrics are computed. `["1 day", "1 week"]` produces both daily and weekly aggregated metrics in the output tables.

---

## Question 39 *(Easy)*

**Model cards provide which compliance benefit?**

A) Reduce model training costs
B) Document intended use, limitations, evaluation metrics, and fairness considerations — required for regulatory model risk management
C) Automatically generate audit reports
D) Replace manual code review

> [!success]- Answer
> **Correct Answer: B) Document intended use, limitations, evaluation metrics, and fairness considerations — required for regulatory model risk management**
>
> Model cards (stored as MLflow registered model descriptions and version tags) provide structured documentation about the model's purpose, performance, and risks — essential for SR 11-7 and similar frameworks.

---

## Question 40 *(Hard)*

**After a model is promoted to production, the baseline table for LHM should be updated. When is the right time?**

A) Immediately when any new data arrives
B) After the new model has been stable in production for a defined period (e.g., 1-2 weeks), and updated to reflect the new model's distribution
C) Never — the original baseline should always be the training data
D) Daily, automatically

> [!success]- Answer
> **Correct Answer: B) After the new model has been stable in production for a defined period (e.g., 1-2 weeks), and updated to reflect the new model's distribution**
>
> Update the baseline after the new model is confirmed stable. Updating too early may mask genuine drift; updating too late means drift is compared against the wrong reference distribution.

---

## Question 41 *(Hard)*

**A model uses PII (social security numbers) as a training feature. GDPR requires the right to erasure for a specific user. What is the correct approach?**

A) Delete the model — it was trained on PII
B) Document that the training data included the user's PII but the model artifact itself doesn't store individual records; apply Delta column masking for future feature access and document the data source in the model card
C) Retrain the model without the user's data
D) Encrypt the user's records in the feature table

> [!success]- Answer
> **Correct Answer: B) Document that the training data included the user's PII but the model artifact itself doesn't store individual records; apply Delta column masking for future feature access and document the data source in the model card**
>
> Standard ML practice: document which data was used, apply masking to prevent future access to deleted records, and retain the model artifact (which is an aggregation, not a record). Retraining is optional and resource-intensive.

---

## Question 42 *(Medium)*

**Which drift type can be detected WITHOUT ground truth labels?**

A) Concept drift
B) Performance drift
C) Data drift and prediction drift
D) Label drift

> [!success]- Answer
> **Correct Answer: C) Data drift and prediction drift**
>
> Data drift (input distribution comparison) and prediction drift (output distribution comparison) require only historical feature/prediction distributions. Concept drift requires labels to compute performance metrics.

---

## Question 43 *(Medium)*

**A governance team requires that every production ML model be explainable. Which MLflow feature enables storing explainability artifacts with each model version?**

A) `mlflow.set_tag("explainable", "true")`
B) `mlflow.log_artifact("shap_summary.png")` within the training run, linked to the registered model version via the run ID
C) The MLflow Model Registry automatically generates SHAP plots
D) `mlflow.pyfunc.log_model(explainability=True)`

> [!success]- Answer
> **Correct Answer: B) `mlflow.log_artifact("shap_summary.png")` within the training run, linked to the registered model version via the run ID**
>
> SHAP artifacts (summary plots, values CSV) are logged as run artifacts. Since model versions link to their training run, auditors can access explainability artifacts via the run ID stored in the model version metadata.

---

## Question 44 *(Easy)*

**A UC model object has the alias `champion` pointing to version 5. A new `champion` alias is set to version 6. What happens to version 5?**

A) Version 5 is automatically deleted
B) Version 5 remains in the registry but no longer has the `champion` alias — it becomes an "unaliased" version
C) Version 5's `champion` alias is renamed to `previous_champion` automatically
D) Version 5 is archived (moved to Archived stage)

> [!success]- Answer
> **Correct Answer: B) Version 5 remains in the registry but no longer has the `champion` alias — it becomes an "unaliased" version**
>
> Setting an alias to a new version simply moves the pointer. The old version remains in the registry with all its other tags/metadata, just without that alias.

---

## Question 45 *(Hard)*

**A serving endpoint's p99 latency has been increasing by 15ms per week for 4 weeks. AUC is stable. What is the most likely cause?**

A) Concept drift
B) Data drift
C) Operational degradation — possibly growing request payload size, feature store latency, or endpoint compute fragmentation
D) Model version mismatch

> [!success]- Answer
> **Correct Answer: C) Operational degradation — possibly growing request payload size, feature store latency, or endpoint compute fragmentation**
>
> Stable AUC with increasing latency indicates a non-model-quality issue: operational factors like growing feature retrieval time, larger request payloads, or serving compute degradation are most likely.

---

[← Back to Mock Exam 2](./README.md) | [Practice Questions](../practice-questions/README.md)

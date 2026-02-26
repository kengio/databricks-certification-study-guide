---
title: "Practice Questions - Model Production Lifecycle"
type: practice-questions
tags:
  - ml-professional
  - model-lifecycle
  - mlflow
  - model-serving
  - unity-catalog
status: complete
---

# Practice Questions: Model Production Lifecycle

[← Back to Practice Questions](./README.md) | [Next: Model Governance](./04-model-governance.md)

---

## Question 1 *(Medium)*: Unity Catalog Registry URI

**Question**: A data scientist registers a model using `mlflow.sklearn.log_model()` without calling `mlflow.set_registry_uri()` first. Where does the model get registered?

A) Unity Catalog model registry, under the default catalog
B) Workspace model registry (legacy), scoped to the current workspace
C) The call fails with a `RegistryURINotSetError`
D) A local MLflow tracking server on the driver node

> [!success]- Answer
> **Correct Answer: B) Workspace model registry (legacy), scoped to the current workspace**
>
> When `set_registry_uri()` is not called, MLflow defaults to the workspace model registry (the legacy, non-UC registry). To target Unity Catalog, you must explicitly call `mlflow.set_registry_uri("databricks-uc")` before registering models. The workspace registry uses stage-based promotion (Staging, Production) while the UC registry uses aliases.

---

## Question 2 *(Easy)*: Model Alias URI Format

**Question**: A data scientist wants to load the model version tagged with the alias `champion` from a Unity Catalog registered model `ml_catalog.fraud.detector`. Which URI is correct?

A) `models:/ml_catalog.fraud.detector/champion`
B) `models:/ml_catalog.fraud.detector@champion`
C) `models://ml_catalog/fraud/detector@champion`
D) `uc://ml_catalog.fraud.detector:champion`

> [!success]- Answer
> **Correct Answer: B) `models:/ml_catalog.fraud.detector@champion`**
>
> In Unity Catalog, model aliases are referenced with the `@` separator: `models:/<catalog>.<schema>.<model>@<alias>`. The three-part namespace replaces the simple model name used in the workspace registry. Option A uses a slash before the alias, which is the legacy workspace registry syntax for stage-based loading and is not valid for UC aliases. Options C and D use non-existent URI schemes.

---

## Question 3 *(Medium)*: Legacy Stages in Unity Catalog

**Question**: A team migrates their model registry from the workspace registry to Unity Catalog. A developer calls `client.transition_model_version_stage(name, version, stage="Production")`. What happens?

A) The model version is promoted to the Production alias in UC
B) The call succeeds but the stage is stored as a tag rather than a true stage
C) The call raises an error — UC does not support stage-based transitions; use aliases instead
D) The model is copied to a separate production catalog automatically

> [!success]- Answer
> **Correct Answer: C) The call raises an error — UC does not support stage-based transitions; use aliases instead**
>
> Unity Catalog's model registry replaces the concept of stages (Staging, Production, Archived) with flexible, user-defined aliases. `transition_model_version_stage()` is a workspace-registry-only method and will raise a `MlflowException` when the registry URI is set to `databricks-uc`. The correct UC equivalent is `client.set_registered_model_alias(name, "champion", version)`.

---

## Question 4 *(Medium)*: spark_udf result_type

**Question**: A regression model returns `float64` predictions. A data scientist loads it as a Spark UDF: `mlflow.pyfunc.spark_udf(spark, model_uri, result_type=???)`. What should `result_type` be?

A) `"float"`
B) `"double"`
C) `"float64"`
D) `DoubleType()`

> [!success]- Answer
> **Correct Answer: B) `"double"`**
>
> The `result_type` parameter accepts Spark SQL type strings or `pyspark.sql.types` objects. Spark's `DoubleType` corresponds to the string `"double"`, which maps to Python/numpy `float64`. Using `"float"` would give `FloatType` (32-bit), losing precision. `"float64"` is a numpy dtype string, not a valid Spark type string. While `DoubleType()` (option D) also works, passing the string `"double"` is more concise and equally correct.

---

## Question 5 *(Medium)*: load_model vs spark_udf Execution Location

**Question**: A team needs to score 50 million rows daily using an MLflow model. One option uses `mlflow.pyfunc.load_model()` followed by `model.predict(pandas_df)`. The other uses `mlflow.pyfunc.spark_udf()` applied to a Spark DataFrame. What is the key architectural difference?

A) `load_model` loads the model to each executor; `spark_udf` loads it only to the driver
B) `load_model` runs inference on the driver node (single machine); `spark_udf` runs on executors (distributed)
C) `spark_udf` requires a GPU cluster; `load_model` works on CPU clusters
D) There is no meaningful difference — both use all available cluster resources

> [!success]- Answer
> **Correct Answer: B) `load_model` runs inference on the driver node (single machine); `spark_udf` runs on executors (distributed)**
>
> `mlflow.pyfunc.load_model()` returns a Python object used for prediction on the driver. For large datasets, the entire DataFrame must be collected to the driver, which is a bottleneck and may cause OOM errors at scale. `spark_udf` serializes the model to each executor and applies inference in parallel across partitions, making it the correct choice for scoring millions of rows efficiently.

---

## Question 6 *(Medium)*: Scale-to-Zero Cold Start

**Question**: A Databricks Model Serving endpoint is configured with scale-to-zero enabled. A user sends the first request after the endpoint has been idle for two hours. What should they expect?

A) The request fails with a 503 error and must be retried manually
B) The request is queued and fulfilled after a 60–120 second cold start while new compute spins up
C) The request is served instantly from a cached model artifact on disk
D) Scale-to-zero is not available on Databricks Model Serving

> [!success]- Answer
> **Correct Answer: B) The request is queued and fulfilled after a 60–120 second cold start while new compute spins up**
>
> When scale-to-zero is enabled, the serving endpoint shuts down its compute when idle to reduce cost. The first request after an idle period triggers provisioning of new compute, loading the model into memory, and then serving the request — a process that typically takes 60–120 seconds. Applications that cannot tolerate this latency should keep a minimum of one replica active or use a warm-up strategy.

---

## Question 7 *(Medium)*: Model Signature Enforcement

**Question**: A model is registered in MLflow with a signature requiring a `float` column named `age`. An incoming serving request sends `age` as a `string`. What happens at serving time?

A) The serving endpoint silently coerces the string to float before inference
B) The serving endpoint logs a warning but proceeds with inference using the raw string
C) The serving endpoint returns a 400 error due to input schema validation failure
D) The model ignores the signature at serving time; signatures are informational only

> [!success]- Answer
> **Correct Answer: C) The serving endpoint returns a 400 error due to input schema validation failure**
>
> MLflow model signatures are enforced at serving time in Databricks Model Serving. When an incoming request does not match the expected input schema — wrong type, missing required column, or unexpected column — the endpoint returns an HTTP 400 (Bad Request) with a schema validation error message before the model ever runs inference. This protects models from unexpected input shapes that could cause silent failures or incorrect predictions.

---

## Question 8 *(Easy)*: Traffic Split Totals

**Question**: A team configures a Model Serving endpoint with `champion` receiving 80% of traffic and `challenger` receiving 10%. What is the result?

A) The remaining 10% is automatically routed to the default model
B) The configuration is invalid — all traffic percentages must sum to exactly 100%
C) The endpoint accepts the configuration and drops the unallocated 10% of requests
D) The challenger receives the full remaining 20% at runtime despite the 10% configuration

> [!success]- Answer
> **Correct Answer: B) The configuration is invalid — all traffic percentages must sum to exactly 100%**
>
> Databricks Model Serving requires that the traffic split across all served model versions adds up to exactly 100%. If the total is less than or greater than 100%, the endpoint update is rejected with a validation error. To run an A/B test with champion at 80%, the challenger must be assigned the full remaining 20% to satisfy the constraint.

---

## Question 9 *(Medium)*: Inference Table Configuration Timing

**Question**: A team launches a Model Serving endpoint without configuring inference table logging. Six months later they realize they need historical request and response data. Can they retroactively capture it?

A) Yes — Databricks retains all inference data for 90 days and can backfill on request
B) Yes — enabling inference tables at any point will back-populate from endpoint creation
C) No — inference tables must be configured before deployment; retroactive logging is not possible
D) No — inference tables are only available for endpoints using GPU compute

> [!success]- Answer
> **Correct Answer: C) No — inference tables must be configured before deployment; retroactive logging is not possible**
>
> Inference table logging captures raw request payloads and model responses to a Delta table in real time. This logging must be configured when the endpoint is created or updated; Databricks does not retain historical payloads for later backfill. Teams planning to use inference data for monitoring, drift detection, or retraining should enable inference tables before going to production.

---

## Question 10 *(Easy)*: Shadow Deployment

**Question**: In a shadow deployment, a challenger model runs alongside the champion. Who receives the challenger's predictions?

A) 10% of real users, as a canary group
B) Internal QA engineers only, via a separate API endpoint
C) No users — the challenger runs in parallel but its predictions are logged only, not returned to callers
D) All users, with results hidden unless they opt in

> [!success]- Answer
> **Correct Answer: C) No users — the challenger runs in parallel but its predictions are logged only, not returned to callers**
>
> Shadow mode (also called shadow testing or dark launching) routes live production traffic to both the champion and challenger simultaneously. Only the champion's predictions are returned to users. The challenger's predictions are captured in logs or inference tables for offline comparison. This allows safety evaluation of the challenger on real traffic without any user-facing risk.

---

## Question 11 *(Medium)*: Canary vs A/B Testing

**Question**: A team wants to detect whether a new model is statistically significantly better than the current champion at the same metric. Which deployment strategy is designed for this?

A) Canary deployment — gradually increases traffic from 5% to 100%
B) Shadow deployment — runs challenger in parallel with no user exposure
C) A/B testing — splits traffic (typically 50/50) to enable statistical comparison
D) Blue-green deployment — keeps both versions live and switches instantly on cutover

> [!success]- Answer
> **Correct Answer: C) A/B testing — splits traffic (typically 50/50) to enable statistical comparison**
>
> A/B testing deliberately splits traffic between champion and challenger (often 50/50) to collect comparable sample sizes for statistical hypothesis testing. The goal is to determine with confidence whether the performance difference is significant. Canary deployments roll out gradually (5% → 25% → 100%) to limit blast radius during release, not to run controlled experiments. Shadow deployments collect no user-observable signal because users only see the champion's output.

---

## Question 12 *(Medium)*: Multi-Task Job run_if for Integration Tests

**Question**: A CI/CD pipeline is a Databricks multi-task job: Task A trains the model, Task B evaluates it against a gate threshold, and Task C runs integration tests. Integration tests should only execute if evaluation passes. How should Task C be configured?

A) Set `depends_on: [B]` with no condition — tasks always run after dependencies complete
B) Set `depends_on: [B]` with `run_if: ALL_SUCCESS` — only runs if Task B succeeded
C) Set `depends_on: [A, B]` with `run_if: AT_LEAST_ONE_SUCCESS`
D) Use a `try/except` block inside Task B to call Task C conditionally

> [!success]- Answer
> **Correct Answer: B) Set `depends_on: [B]` with `run_if: ALL_SUCCESS` — only runs if Task B succeeded**
>
> Databricks multi-task jobs support `run_if` conditions on each task. `ALL_SUCCESS` means all upstream dependency tasks must have completed with a success status. If Task B (the evaluation gate) fails — because the model did not meet the threshold — Task C is skipped automatically. This is the standard pattern for conditional pipeline stages without needing custom control-flow code inside the tasks themselves.

---

## Question 13 *(Easy)*: Promoting Challenger to Champion via Alias

**Question**: A challenger model (version 7) has passed all evaluation gates and must be promoted to the champion alias, replacing version 5. Which operation is correct?

A) `client.delete_registered_model_alias(name, "champion")` then re-register version 7 as champion
B) `client.set_registered_model_alias(name, "champion", 7)` — reassigns the alias to version 7
C) `client.transition_model_version_stage(name, 7, stage="Production")`
D) Delete version 5 from the registry, then the alias automatically moves to the latest version

> [!success]- Answer
> **Correct Answer: B) `client.set_registered_model_alias(name, "champion", 7)` — reassigns the alias to version 7**
>
> In Unity Catalog, aliases are pointers that can be freely reassigned. Calling `set_registered_model_alias` with the same alias name and a new version number atomically moves the pointer from version 5 to version 7. The previous version (5) remains in the registry and is unaffected — it simply no longer holds the `champion` alias. No deletion is required, and `transition_model_version_stage` is a workspace-registry-only method.

---

## Question 14 *(Medium)*: Custom pyfunc — When to Use PythonModel

**Question**: A team trains a model using an internal proprietary framework that MLflow does not have a built-in flavor for. They also need custom preprocessing steps bundled with inference. Which MLflow capability is appropriate?

A) Use `mlflow.sklearn.log_model()` with a custom wrapper class
B) Log the model weights as a generic artifact using `mlflow.log_artifact()`
C) Implement `mlflow.pyfunc.PythonModel` to create a custom MLflow flavor
D) Write the model to Delta as a binary column and load it at serving time

> [!success]- Answer
> **Correct Answer: C) Implement `mlflow.pyfunc.PythonModel` to create a custom MLflow flavor**
>
> `mlflow.pyfunc.PythonModel` is MLflow's extension point for frameworks without a native flavor. By subclassing `PythonModel` and implementing `load_context()` and `predict()`, teams can bundle arbitrary model artifacts, dependencies, and pre/post-processing logic into a single deployable package. The resulting model is loadable via `mlflow.pyfunc.load_model()` and deployable to Databricks Model Serving like any other MLflow model.

---

## Question 15 *(Hard)*: Drift-Triggered Retraining

**Question**: A Databricks Lakehouse Monitoring alert detects that the model's AUC on recent data has dropped below the threshold. Which retraining trigger type best describes this scenario, and what is the recommended mechanism to invoke retraining?

A) Scheduled retraining — a cron job retriggers the training pipeline weekly regardless of performance
B) Drift-triggered retraining — the monitoring alert fires a webhook that calls the Databricks Jobs API to start the training job
C) Manual retraining — a data scientist reviews the alert and kicks off the pipeline by hand
D) Event-triggered retraining — new data arriving in cloud storage automatically starts retraining

> [!success]- Answer
> **Correct Answer: B) Drift-triggered retraining — the monitoring alert fires a webhook that calls the Databricks Jobs API to start the training job**
>
> Drift-triggered (or performance-triggered) retraining responds to observed degradation rather than a fixed schedule, making it both timely and resource-efficient. Databricks Lakehouse Monitoring supports alert conditions on monitored metrics; when a threshold is breached, a notification can call a webhook that in turn invokes the Databricks Jobs REST API to start a retraining pipeline. This creates a closed-loop MLOps system where production monitoring directly drives model refresh.

[← Back to Practice Questions](./README.md) | [Next: Model Governance](./04-model-governance.md)

---

**[← Previous: "Practice Questions - Hyperparameter Optimization"](./02-hyperparameter-optimization.md) | [↑ Back to ML Professional Practice Questions](./README.md) | [Next: ML Professional Practice Questions — Model Governance & MLOps](./04-model-governance.md) →**

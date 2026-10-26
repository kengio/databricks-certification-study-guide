---
title: ML Professional Practice Questions — Model Governance & MLOps
type: practice-questions
tags: [ml-professional, model-governance, mlops, drift, lakehouse-monitoring, fairness, unity-catalog]
status: complete
---

# Model Governance & MLOps — Practice Questions

[← Back to Practice Questions](./README.md) | [Back to Resources](../README.md)

---

## Question 1 *(Medium)*: Data Drift vs Concept Drift

**A model's input features have shifted distribution, but AUC remains stable at 0.93. Which drift type has occurred?**

A) Concept drift — the model relationship changed
B) Data drift only — input distributions changed but model still generalizes
C) Prediction drift — outputs changed
D) Label drift — target variable shifted

> [!success]- Answer
> **Correct Answer: B) Data drift only — input distributions changed but model still generalizes**
>
> Data drift occurred (feature distributions shifted), but because AUC is stable, there is no concept drift. The model still correctly captures the input-output relationship despite the distribution change.

---

## Question 2 *(Easy)*: PSI Threshold — No Action

**A feature's PSI is calculated as 0.07. What is the recommended action?**

A) Immediate retraining
B) Investigate the data pipeline
C) No action — within acceptable range (PSI < 0.10)
D) Roll back to previous model

> [!success]- Answer
> **Correct Answer: C) No action — within acceptable range (PSI < 0.10)**
>
> PSI < 0.10 indicates the population is stable. No immediate action is needed, though continued monitoring is recommended.

---

## Question 3 *(Easy)*: PSI Threshold — Investigate

**A feature's PSI score is 0.14 this week. What does this indicate?**

A) No significant change — continue monitoring
B) Slight population shift — investigate but retraining not yet mandatory
C) Significant drift — retrain immediately
D) Model is performing well

> [!success]- Answer
> **Correct Answer: B) Slight population shift — investigate but retraining not yet mandatory**
>
> PSI between 0.10 and 0.20 indicates a slight but notable shift. Investigate the source of change; retraining may not be needed if model performance is unaffected.

---

## Question 4 *(Easy)*: Chi-Square for Categorical Drift

**A team monitors the `payment_method` feature (values: card, cash, wallet). Which statistical test detects distribution drift in this feature?**

A) Kolmogorov-Smirnov test
B) Chi-square test
C) t-test
D) PSI with continuous binning

> [!success]- Answer
> **Correct Answer: B) Chi-square test**
>
> Chi-square test compares observed categorical frequencies to expected (baseline) frequencies. KS test requires continuous distributions.

---

## Question 5 *(Easy)*: KS Test Applicability

**A data scientist wants to detect drift in the `transaction_amount` feature (continuous, numeric). Which test is appropriate?**

A) Chi-square test
B) Fisher's exact test
C) Kolmogorov-Smirnov test
D) Shapiro-Wilk test

> [!success]- Answer
> **Correct Answer: C) Kolmogorov-Smirnov test**
>
> KS test compares two continuous distributions and is the standard choice for detecting numeric feature drift.

---

## Question 6 *(Easy)*: Lakehouse Monitoring Monitor Type

**A team creates a monitor on an ML serving endpoint's inference table with prediction and label columns. Which monitor type should they select?**

A) TimeSeries
B) Snapshot
C) InferenceLog
D) DriftProfile

> [!success]- Answer
> **Correct Answer: C) InferenceLog**
>
> InferenceLog is the specialized monitor type for ML inference tables. It computes model performance metrics (accuracy, AUC, RMSE) in addition to drift metrics.

---

## Question 7 *(Medium)*: Baseline Table Requirement

**Why does Databricks Lakehouse Monitoring require a baseline table when computing drift metrics?**

A) Drift is always compared against the previous day's data
B) Drift metrics compare the current window's statistics against the baseline — without it, no relative comparison is possible
C) The baseline table stores model hyperparameters
D) Databricks uses the baseline to retrain models automatically

> [!success]- Answer
> **Correct Answer: B) Drift metrics compare the current window's statistics against the baseline — without it, no relative comparison is possible**
>
> LHM computes drift by comparing the current monitoring window's profile against the baseline table (typically training data or an established reference period).

---

## Question 8 *(Easy)*: Inference Table Timing

**A model goes to production on Monday without inference tables configured. On Thursday the team enables inference tables. Which requests are captured?**

A) All requests from Monday onward
B) Only requests from Thursday onward
C) Requests from the past 7 days are backfilled
D) Requests from the past 24 hours are backfilled

> [!success]- Answer
> **Correct Answer: B) Only requests from Thursday onward**
>
> Inference tables are prospective only. They capture requests after configuration; retroactive logging of past traffic is not possible.

---

## Question 9 *(Easy)*: UC Audit Logs Location

**A compliance team needs to audit all MLflow model alias changes over the past 30 days. Where should they query?**

A) `system.runtime.query_history`
B) `system.access.audit` table
C) `mlflow.runs` experiment table
D) Databricks model serving logs

> [!success]- Answer
> **Correct Answer: B) `system.access.audit` table**
>
> Unity Catalog audit events including `updateModelVersionAlias` are logged to `system.access.audit` in UC-enabled workspaces.

---

## Question 10 *(Medium)*: SHAP for Regulatory Compliance

**A financial institution must explain why a specific loan application was denied by an ML model. Which technical control satisfies GDPR Article 22's right to explanation?**

A) Show the model's overall accuracy
B) Show the model version number and training date
C) Provide SHAP values showing each feature's contribution to the denial decision
D) Show the prediction probability score only

> [!success]- Answer
> **Correct Answer: C) Provide SHAP values showing each feature's contribution to the denial decision**
>
> SHAP values provide local, instance-level explanations showing which features drove the prediction. This satisfies the "meaningful information about the logic involved" requirement of GDPR Article 22.

---

## Question 11 *(Hard)*: Disparate Impact Rule

**A credit scoring model has an approval rate of 65% for Group A and 84% for Group B. What is the disparate impact ratio and what does it indicate?**

A) 0.77 — below the four-fifths (0.80) threshold, indicates potential discrimination
B) 0.77 — above the minimum threshold, no concern
C) 1.29 — above 1.0, model is biased toward Group B
D) 0.65 — the minority group's raw approval rate

> [!success]- Answer
> **Correct Answer: A) 0.77 — below the four-fifths (0.80) threshold, indicates potential discrimination**
>
> Disparate impact = 65% / 84% = 0.774. This is below the four-fifths rule threshold of 0.80, indicating potential discriminatory impact requiring investigation.

---

## Question 12 *(Easy)*: UC EXECUTE Permission

**A serving endpoint service principal needs to load and serve a model from `ml_catalog.fraud_models.fraud_classifier`. Which permission is required?**

A) `SELECT ON MODEL`
B) `MODIFY ON MODEL`
C) `EXECUTE ON MODEL`
D) `USE CATALOG`

> [!success]- Answer
> **Correct Answer: C) `EXECUTE ON MODEL`**
>
> `EXECUTE ON MODEL` grants the right to load and serve a model. `MODIFY` allows registering versions and setting aliases, but not serving.

---

## Question 13 *(Medium)*: Prediction Drift as Proxy

**Ground truth labels are available only after 14 days. What monitoring approach detects potential model degradation before labels arrive?**

A) Wait 14 days and compute AUC retroactively
B) Monitor prediction score distributions for drift using PSI
C) Disable monitoring until labels arrive
D) Use the model's training metrics as the current performance estimate

> [!success]- Answer
> **Correct Answer: B) Monitor prediction score distributions for drift using PSI**
>
> Prediction drift (monitoring output distribution changes) serves as a leading indicator. Significant PSI on prediction scores often precedes measurable AUC degradation once labels arrive.

---

## Question 14 *(Medium)*: Feature Importance Drift

**A team suspects that some features have become less informative in production compared to training. How should they investigate?**

A) Compare training AUC vs production AUC
B) Compare mean absolute SHAP values from training vs production data
C) Re-run hyperparameter optimization
D) Check the feature table's Delta version

> [!success]- Answer
> **Correct Answer: B) Compare mean absolute SHAP values from training vs production data**
>
> Comparing SHAP value distributions between training and production data reveals which features have changed importance. A feature that was highly important during training but has low SHAP values in production indicates distribution shift in that feature.

---

## Question 15 *(Medium)*: Concept Drift Detection Requirement

**Which of the following is REQUIRED to detect concept drift (not just data drift)?**

A) Feature distribution statistics from production
B) Model training logs from MLflow
C) Ground truth labels from production
D) SHAP values from the model

> [!success]- Answer
> **Correct Answer: C) Ground truth labels from production**
>
> Concept drift means the relationship between inputs and the target has changed. Detecting it requires comparing predictions against actual outcomes (ground truth). Without labels, you can only detect data drift or prediction drift.

---

## Question 16 *(Medium)*: Reading Categorical Drift from the Drift Metrics Table *(2026 guide)*

**Question**: A Lakehouse Monitoring profile tracks `merchant_category`, a string column. Which drift-metrics-table columns hold meaningful values for this column?

A) `ks_test` and `wasserstein_distance`  
B) `population_stability_index` only  
C) `chi_squared_test`, `tv_distance`, `l_infinity_distance`, and `js_distance`  
D) None. Categorical columns aren't profiled

> [!success]- Answer
> **Correct Answer: C) `chi_squared_test`, `tv_distance`, `l_infinity_distance`, and `js_distance`**
>
> Categorical columns get chi-square, total variation, L-infinity, and Jensen–Shannon statistics.
>
> `ks_test`, `wasserstein_distance`, and `population_stability_index` apply to numeric columns only and are NULL for categorical columns. Pair the chi-square p-value (significance) with a distance such as JS or TV (magnitude) before deciding to act.

---

## Question 17 *(Medium)*: Baseline vs Consecutive Drift *(2026 guide)*

**Question**: A team wants to know (1) whether this week's feature distributions differ from the training data, and (2) whether they changed suddenly compared with last week. How do they get both from Lakehouse Monitoring?

A) Only (2) is possible. Monitors can't compare against training data  
B) Set `baseline_table_name` to the training data; read `drift_type = 'BASELINE'` rows for (1) and `drift_type = 'CONSECUTIVE'` rows for (2)  
C) Create two monitors on the same table, one per comparison  
D) Use `slicing_exprs` with the value `baseline`

> [!success]- Answer
> **Correct Answer: B) Set `baseline_table_name` to the training data; read `drift_type = 'BASELINE'` rows for (1) and `drift_type = 'CONSECUTIVE'` rows for (2)**
>
> `BASELINE` drift compares to the baseline table; `CONSECUTIVE` drift compares each window to the previous one.
>
> Without a baseline table, only consecutive drift is computed. Only one profile can exist per table, and slicing expressions split the data by segment; they don't define comparisons.

---

## Question 18 *(Easy)*: Choosing a Profile Type *(2026 guide)*

**Question**: A `dim_customer` table has no event timestamp and is fully rewritten each night. The team wants to track null rates and distributions of the whole table over time. Which profile type fits?

A) InferenceLog  
B) TimeSeries  
C) Snapshot  
D) No profile is possible without a timestamp column

> [!success]- Answer
> **Correct Answer: C) Snapshot**
>
> Snapshot profiles the full table contents at each refresh.
>
> TimeSeries and InferenceLog need a timestamp column for windows. InferenceLog adds model-quality metrics for prediction tables. Snapshot profiles are limited to 4 TB; use TimeSeries for larger tables.

---

## Question 19 *(Medium)*: Custom Metric Types *(2026 guide)*

**Question**: A fraud team wants (1) the total dollar amount of missed fraud per window, computed from table columns, and (2) how much that amount changed versus the baseline. Which custom metric types do they need?

A) (1) derived, (2) aggregate  
B) (1) aggregate, (2) drift  
C) (1) drift, (2) derived  
D) Both aggregate

> [!success]- Answer
> **Correct Answer: B) (1) aggregate, (2) drift**
>
> Aggregate metrics compute from table columns into the profile metrics table; drift metrics compare them across windows or against the baseline into the drift metrics table.
>
> Derived metrics combine previously computed aggregate metrics without scanning the table. Drift definitions use templates such as `{{current_df}}.metric - {{base_df}}.metric`. Custom metrics are defined with `MonitorMetric` / `MonitorMetricType` and passed as `custom_metrics`.

---

## Question 20 *(Easy)*: Per-Segment Monitoring *(2026 guide)*

**Question**: A model's overall accuracy is stable, but the team suspects it degrades for transactions above $1,000 and for some merchant categories. How should the monitor be configured to show this?

A) Add `slicing_exprs=["amount > 1000", "merchant_category"]`  
B) Add `granularities=["1 hour"]`  
C) Create a separate table per merchant category  
D) Lower the alert threshold on overall accuracy

> [!success]- Answer
> **Correct Answer: A) Add `slicing_exprs=["amount > 1000", "merchant_category"]`**
>
> Slicing expressions compute every metric per slice: true / false for a predicate, and one slice per value for a column.
>
> Rows with `slice_key IS NULL` cover the whole table. High-cardinality columns slice on their top 100 values. Granularities change window sizes, not segments.

---

## Question 21 *(Medium)*: Monitoring Endpoint Health *(2026 guide)*

**Question**: An SRE team needs alerts when a custom model endpoint's p95 latency, 5xx error rate, CPU usage, or memory usage spikes, in their existing Prometheus / Datadog stack. Where do these signals come from?

A) The Lakehouse Monitoring drift metrics table  
B) Model Serving endpoint metrics: shown in the Serving UI and exported through `/api/2.0/serving-endpoints/{name}/metrics` for Prometheus or Datadog scraping  
C) The MLflow experiment of the training run  
D) `system.access.audit`

> [!success]- Answer
> **Correct Answer: B) Model Serving endpoint metrics: shown in the Serving UI and exported through `/api/2.0/serving-endpoints/{name}/metrics` for Prometheus or Datadog scraping**
>
> Model Serving exposes infrastructure metrics (latency, request rate, error rate, CPU, memory) and a metrics export API.
>
> The Serving UI shows them for the last 14 days by default. Exported metrics include `request_latency_ms`, `request_5xx_count_total`, `cpu_usage_percentage`, and `mem_usage_percentage`. Profile and drift tables describe data and model quality, not infrastructure health. Inference tables can supplement latency and status codes for long-term history.

---

## Question 22 *(Hard)*: Selection Metric for Threshold-Driven Decisions *(2026 guide)*

**Question**: An insurer auto-approves claims when the model's predicted probability of legitimacy is at least 0.9, auto-rejects at 0.1 or below, and sends the rest to manual review. Which metric should automated retraining use to select the best candidate model?

A) Accuracy  
B) AUROC  
C) Log loss  
D) Recall of the positive class

> [!success]- Answer
> **Correct Answer: C) Log loss**
>
> Actions depend on calibrated probabilities, and log loss directly penalizes poorly calibrated probabilities.
>
> AUROC measures ranking, and accuracy and recall evaluate hard labels at one threshold. A model can rank well yet be over-confident near 0.9, which is exactly where decisions happen. Compare challenger and champion on the same hold-out set, and require a minimum improvement plus guardrails before promotion.

---

## Question 23 *(Medium)*: Automating Retraining from Monitoring *(2026 guide)*

**Question**: A team wants retraining to start automatically when a monitored model's `log_loss` in the profile metrics table exceeds a threshold. Which design implements this on Databricks?

A) Wait for a data scientist to notice the dashboard and run the training notebook  
B) Schedule the monitor refresh, then run a job whose first task queries the metric table and fails or exits when the threshold isn't breached, gating a downstream retraining task (or use a SQL alert that triggers the job)  
C) Set the endpoint's workload size to Large so it retrains itself  
D) Enable inference tables, which retrain the model when drift is detected

> [!success]- Answer
> **Correct Answer: B) Schedule the monitor refresh, then run a job whose first task queries the metric table and fails or exits when the threshold isn't breached, gating a downstream retraining task (or use a SQL alert that triggers the job)**
>
> A metric-check task (or alert) on the monitor's tables gates or triggers the retraining job.
>
> The Declarative Automation Bundles docs show this pattern: a `quality_monitors` resource plus a retraining job whose first task checks a monitored metric for violations. The retrained model then passes an evaluation gate before alias promotion. Inference tables only log requests; they don't retrain anything.

---

**[← Previous: "Practice Questions - Model Production Lifecycle"](./03-model-lifecycle.md) | [↑ Back to ML Professional Practice Questions](./README.md) | [Next: Spark ML & Scaling →](./05-spark-ml-and-scaling.md)**

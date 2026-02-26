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

**[← Previous: "Practice Questions - Model Production Lifecycle"](./03-model-lifecycle.md) | [↑ Back to ML Professional Practice Questions](./README.md)**

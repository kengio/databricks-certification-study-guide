---
tags: [exam-tips, ml-professional, certification]
---

# Exam Tips and Strategies

## Exam Format

- **Questions**: 59 scored multiple-choice, plus up to 10 unscored items you can't identify
- **Duration**: 120 minutes (time for the unscored items is already included)
- **Passing Score**: Not published; the result is pass / fail
- **Language**: English; code in stems is Python
- **Format**: Online proctored or at a test center; no test aides
- **Exam guide**: [September 30, 2025 outline (PDF re-issued Oct 2026)](https://www.databricks.com/sites/default/files/2026-10/databricks-certified-machine-learning-professional-exam-guide-august.pdf)

## Time Management

### Recommended Pacing

| Time | Activity |
|------|----------|
| 0-90 min | First pass (1.5 min/question avg) |
| 90-110 min | Review flagged questions |
| 110-120 min | Final review |

### Question Strategy

1. **Read carefully** - Watch for words like "BEST", "MOST", "LEAST"
2. **Flag and move** - Don't spend more than 2-3 minutes on difficult questions
3. **Eliminate wrong answers** - Narrow down to 2 choices
4. **Trust first instinct** - Don't change answers unless certain

## Topic Priority by Weight

| Priority | Domain | Weight | Exam-guide sections |
|----------|--------|--------|---------------------|
| 1 | Model Development | 44 % | Using Spark ML · Scaling and Tuning · Advanced MLflow Usage · Advanced Feature Store Concepts |
| 1 | ML Ops | 44 % | Model Lifecycle Management · Validation Testing · Environment Architectures · Automated Retraining · Drift Detection and Lakehouse Monitoring |
| 3 | Model Deployment | 12 % | Deployment Strategies · Custom Model Serving |

Model Development and ML Ops each carry about 26 of the 59 questions, and Model Deployment about 7. Split your study time roughly 45 / 45 / 10.

## Key Topics to Master

### Must Know (High Frequency)

- [ ] Spark ML pipeline: `StringIndexer` → `OneHotEncoder` → `VectorAssembler` → estimator; estimators `fit()`, transformers `transform()`
- [ ] Optuna distributed with MLflow: `MlflowStorage(experiment_id=...)` + `MlflowSparkStudy(...).optimize(objective, n_trials, n_jobs)`
- [ ] Ray on Databricks: `setup_ray_cluster(...)` then Ray Tune; Spark = data parallelism, Ray = task parallelism
- [ ] `groupBy().applyInPandas(func, schema)` for one model per group (each group must fit in memory)
- [ ] Nested runs: parent experiment → child per hyperparameter set (aggregated CV metrics) → final-model run
- [ ] Point-in-time lookups: time series feature table + `FeatureLookup(timestamp_lookup_key=...)`
- [ ] Unit tests (`pytest`, functions in Python files) vs integration tests (staging, all pipelines)
- [ ] Bundles (DABs) define `experiments`, `registered_models`, `model_serving_endpoints` per target
- [ ] `mlflow.set_registry_uri("databricks-uc")` — required before UC registry operations
- [ ] Model aliases vs stages — UC uses `champion`/`challenger` aliases; stages are workspace-registry only
- [ ] `pyfunc.spark_udf()` for batch inference — runs on executors, not just the driver
- [ ] `AutoCaptureConfigInput` — enables inference tables; must be configured before production traffic
- [ ] Lakehouse Monitoring (LHM) monitor types: `InferenceLog`, `TimeSeries`, `Snapshot`
- [ ] PSI thresholds: < 0.10 no change, 0.10–0.20 investigate, > 0.20 significant change
- [ ] KS test for continuous features / chi-square for categorical features
- [ ] `FeatureEngineeringClient.create_training_set()` with `FeatureLookup`
- [ ] `SparkTrials` vs `Trials` for Hyperopt — `SparkTrials` distributes across cluster workers

### Should Know (Medium Frequency)

- [ ] `traffic_config` for canary deployments — percentage-based traffic splitting, ramped while monitoring
- [ ] Blue-green (atomic switch) vs canary (gradual) for high-traffic endpoints; route optimization set at creation
- [ ] MLflow Deployments SDK: `get_deploy_client("databricks").predict(endpoint=..., inputs=...)`
- [ ] Online tables via Databricks SDK (`w.online_tables.create_and_wait(...)`) — and their Lakebase replacement
- [ ] On-demand features: `FeatureFunction` over a UC Python UDF; Feature Serving with `create_feature_spec`
- [ ] Drift metrics table: numeric (`ks_test`, `wasserstein_distance`, `population_stability_index`) vs categorical (`chi_squared_test`, `tv_distance`, `l_infinity_distance`, `js_distance`); `BASELINE` vs `CONSECUTIVE`
- [ ] Custom metrics (aggregate / derived / drift), `slicing_exprs`, granularities
- [ ] Endpoint health: latency, request rate, error rate, CPU, memory
- [ ] Shadow vs canary vs A/B testing — know the distinction for each deployment pattern
- [ ] `system.access.audit` — Unity Catalog audit log table for governance queries
- [ ] SHAP values for regulatory explainability — model-agnostic feature attribution
- [ ] Disparate impact four-fifths rule — minimum ratio of 0.80 (80%) between protected groups
- [ ] Bayesian optimization (TPE) vs random search — TPE is smarter but sequential

### Good to Know (Lower Frequency)

- [ ] Vertical vs horizontal scaling; data vs model parallelism (DDP vs FSDP / DeepSpeed ZeRO)
- [ ] Deploy code vs deploy models; dev / staging / prod catalogs
- [ ] Selection metric for retraining: log loss when actions depend on probability thresholds
- [ ] Fairness metrics: equalized odds, demographic parity, calibration

> [!note]
> GenAI agent topics (`ChatModel`, `agents.deploy()`) aren't in the ML Professional exam guide; they belong to the GenAI Engineer Associate track. Agents deployed to Model Serving moved to a Legacy docs section on Oct 5, 2026 ([October 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/october)).

## Common Question Patterns

### Scenario-Based Questions

```text
"A data scientist needs to serve predictions with sub-100ms latency.
The model requires feature values computed at training time.
Which approach minimizes latency?"
```

**Strategy**: Identify requirements, match to feature store and serving capabilities.

### Best Practice Questions

```text
"What is the recommended approach for promoting a model to production
in a Unity Catalog-enabled workspace?"
```

**Strategy**: Know official best practices — aliases over stages, UC over workspace registry.

### Troubleshooting Questions

```text
"A batch inference job completes but results differ from online serving.
What is the most likely cause?"
```

**Strategy**: Know debugging steps — train-serving skew is the default suspect.

### Configuration Questions

```text
"Which configuration must be set before calling mlflow.register_model()
to store the model in Unity Catalog?"
```

**Strategy**: Memorize key API calls and their required setup steps.

## Common Exam Traps

| Topic | Trap | Correct Answer |
|-------|------|----------------|
| Registry | Forgetting `set_registry_uri` | Must call `mlflow.set_registry_uri("databricks-uc")` for UC |
| Aliases vs Stages | Using stages with UC models | UC uses aliases (`champion`), stages are workspace-registry only |
| Batch inference | Using `load_model().predict()` on large data | Use `spark_udf()` — runs on executors, not just driver |
| Drift test selection | KS test for categorical feature | Use chi-square for categorical, KS for continuous only |
| PSI interpretation | PSI 0.15 = must retrain | PSI 0.10–0.20 = investigate, not necessarily retrain |
| Inference tables | Enabling after deployment | Must be configured before production traffic starts |
| LHM monitor type | TimeSeries for inference endpoint | Use InferenceLog for endpoints (has prediction/label columns) |
| Optuna distribution | `study.optimize(n_jobs=16)` "distributes" trials | Plain `n_jobs` = driver threads; use `MlflowSparkStudy` (Spark executors) |
| Rollout | Send 100 % to the new served entity at once | Canary: second served entity, increase traffic incrementally while monitoring |
| Route optimization | Turn it on for an existing endpoint | Only at endpoint creation; needs OAuth + dedicated URL |
| Querying endpoints | Token / inputs as query-string parameters | Bearer header + JSON body, or MLflow Deployments `predict()` |
| Retraining metric | Accuracy / AUROC for threshold-driven actions | Log loss measures probability calibration |
| Integration tests | Re-run everything after a hyperparameter change | Training, evaluation, deployment; feature engineering unchanged |

## Quick Reference Numbers

| Item | Value |
|------|-------|
| PSI no change threshold | < 0.10 |
| PSI slight change threshold | 0.10 – 0.20 |
| PSI significant change threshold | > 0.20 |
| Disparate impact minimum (four-fifths rule) | 0.80 |
| KS test significance level | p < 0.05 |
| VACUUM default retention | 168 hours |
| Workload size concurrency | Small 0–4, Medium 8–16, Large 16–64 |
| Scored questions / time | 59 / 120 min (≈ 2 min each) |

## Day Before Exam

### Do

- [ ] Review cheat sheets
- [ ] Get good sleep
- [ ] Prepare testing environment
- [ ] Test internet connection
- [ ] Have ID ready

### Don't

- [ ] Cram new material
- [ ] Stay up late
- [ ] Skip meals
- [ ] Stress about specific questions

## During the Exam

### Technical Setup

- Stable internet connection
- Quiet environment
- Clear desk (proctored)
- Valid government ID
- Close unnecessary applications

### Mental Approach

- Stay calm, you've prepared
- Each question is independent
- Wrong answers don't cascade
- Use full time available
- Flag uncertain questions

## If You Don't Pass

- Review score report by section
- Focus on weak areas
- Wait required period (usually 14 days)
- Practice more questions in weak areas
- Re-take with confidence

## Study Resources Priority

### Essential (Do These)

1. The [exam guide PDF](https://www.databricks.com/sites/default/files/2026-10/databricks-certified-machine-learning-professional-exam-guide-august.pdf) and its [AI Prep Guide](https://www.databricks.com/sites/default/files/2026-06/ai-prep-guide-any-databricks-certification.pdf)
2. Databricks Academy: *Machine Learning at Scale* and *Advanced Machine Learning Operations*
3. Official documentation for Spark ML, Optuna / Ray, Feature Engineering, MLflow, Model Serving, and data profiling (Lakehouse Monitoring)
4. Practice exams and scenario-based questions
5. Hands-on work in [Databricks Free Edition](https://docs.databricks.com/aws/en/getting-started/free-edition) (Community Edition retired Jan 1, 2026) or a company workspace. Free Edition has no GPU serving, provisioned throughput, or online tables

### Helpful (If Time Permits)

1. MLflow GitHub issues and release notes
2. Databricks Community Forum exam discussions
3. Blog posts from certified ML engineers
4. Additional practice questions

### Skip

- Outdated content (pre-2024 MLflow API, workspace Model Registry stages, `FeatureStoreClient`-only examples)
- Spark ML algorithms in depth beyond pipelines, estimators / transformers, tuning, and evaluation
- Deep dives on rarely tested topics

## Final Checklist

Before clicking "Submit":

- [ ] All questions answered
- [ ] Flagged questions reviewed
- [ ] No obvious mistakes
- [ ] Time remaining checked
- [ ] Ready to submit

[← Back to Resources](./README.md)

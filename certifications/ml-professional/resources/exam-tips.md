---
tags: [exam-tips, ml-professional, certification]
---

# Exam Tips and Strategies

## Exam Format

- **Questions**: 60 multiple-choice
- **Duration**: 120 minutes (2 hours)
- **Passing Score**: 70%
- **Languages**: Python and Scala code examples
- **Format**: Proctored online exam

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

| Priority | Topic | Weight | Study Time |
|----------|-------|--------|------------|
| 1 | Model Lifecycle Management | 30% | 30% |
| 2 | Model Governance & MLOps | 30% | 30% |
| 3 | Hyperparameter Optimization | 20% | 20% |
| 4 | Advanced Feature Engineering | 20% | 20% |

## Key Topics to Master

### Must Know (High Frequency)

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

- [ ] `traffic_config` for canary deployments — percentage-based traffic splitting
- [ ] Shadow vs canary vs A/B testing — know the distinction for each deployment pattern
- [ ] `system.access.audit` — Unity Catalog audit log table for governance queries
- [ ] SHAP values for regulatory explainability — model-agnostic feature attribution
- [ ] Disparate impact four-fifths rule — minimum ratio of 0.80 (80%) between protected groups
- [ ] Bayesian optimization (TPE) vs random search — TPE is smarter but sequential

### Good to Know (Lower Frequency)

- [ ] `ChatModel` interface for custom LLM wrappers in MLflow
- [ ] `agents.deploy()` for deploying compound AI systems
- [ ] Fairness metrics: equalized odds, demographic parity, calibration

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

## Quick Reference Numbers

| Item | Value |
|------|-------|
| PSI no change threshold | < 0.10 |
| PSI slight change threshold | 0.10 – 0.20 |
| PSI significant change threshold | > 0.20 |
| Disparate impact minimum (four-fifths rule) | 0.80 |
| KS test significance level | p < 0.05 |
| VACUUM default retention | 168 hours |
| Scale-to-zero cold start | 60–120 seconds |

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

1. Databricks Academy — Machine Learning Professional pathway
2. Official documentation for Feature Engineering, MLflow, and Lakehouse Monitoring
3. Practice exams and scenario-based questions
4. Hands-on labs in Databricks workspace (model registry, feature store, LHM)

### Helpful (If Time Permits)

1. MLflow GitHub issues and release notes
2. Databricks Community Forum exam discussions
3. Blog posts from certified ML engineers
4. Additional practice questions

### Skip

- Outdated content (pre-2024 MLflow API)
- Non-Databricks Spark ML content unrelated to exam domains
- Deep dives on rarely tested topics

## Final Checklist

Before clicking "Submit":

- [ ] All questions answered
- [ ] Flagged questions reviewed
- [ ] No obvious mistakes
- [ ] Time remaining checked
- [ ] Ready to submit

[← Back to Resources](./README.md)

---
tags: [ml-professional, resources, official-links]
type: references
---

# Official Links and Resources

## Certification

- [Databricks Machine Learning Professional Certification](https://www.databricks.com/learn/certification/machine-learning-professional) — exam registration, exam guide PDF, official exam domains
- [Exam guide PDF — September 30, 2025 outline (re-issued Oct 2026)](https://www.databricks.com/sites/default/files/2026-10/databricks-certified-machine-learning-professional-exam-guide-august.pdf) — the source of truth for this guide
- [AI Prep Guide — any Databricks certification (PDF)](https://www.databricks.com/sites/default/files/2026-06/ai-prep-guide-any-databricks-certification.pdf) — referenced by the exam guide for study planning and hands-on checklists

## Hands-On Practice

- [Databricks Free Edition](https://docs.databricks.com/aws/en/getting-started/free-edition) — free workspace for practice; replaces the retired Community Edition (retired Jan 1, 2026)
- [Free Edition limitations](https://docs.databricks.com/aws/en/getting-started/free-edition-limitations) — serverless only; no GPU serving endpoints, no provisioned throughput, no online tables

## Core Documentation

- [Databricks Machine Learning Documentation](https://docs.databricks.com/aws/en/machine-learning/) — top-level ML hub
- [Apache Spark MLlib on Databricks](https://docs.databricks.com/aws/en/machine-learning/train-model/mllib) — `pyspark.ml` support on serverless, standard, and dedicated compute
- [pandas function APIs](https://docs.databricks.com/aws/en/pandas/pandas-function-apis) — `applyInPandas`, `mapInPandas`, cogrouped map
- [Hyperparameter tuning](https://docs.databricks.com/aws/en/machine-learning/automl-hyperparam-tuning/) — Optuna, Ray Tune; Hyperopt deprecation note
- [Hyperparameter tuning with Optuna](https://docs.databricks.com/aws/en/machine-learning/automl-hyperparam-tuning/optuna) — `MlflowStorage`, `MlflowSparkStudy`
- [Ray on Databricks](https://docs.databricks.com/aws/en/machine-learning/ray/) — Ray-on-Spark clusters, Ray vs Spark, Ray + MLflow
- [Distributed training](https://docs.databricks.com/aws/en/machine-learning/train-model/distributed-training/) — single-node first, TorchDistributor, DeepSpeed, Ray
- [Feature Engineering in Unity Catalog](https://docs.databricks.com/aws/en/machine-learning/feature-store/) — `FeatureEngineeringClient`, feature tables, point-in-time lookups
- [Databricks Online Feature Stores](https://docs.databricks.com/aws/en/machine-learning/feature-store/online-feature-store) — Lakebase-backed successor to legacy online tables
- [On-demand features](https://docs.databricks.com/aws/en/machine-learning/feature-store/on-demand-features) and [Feature Serving](https://docs.databricks.com/aws/en/machine-learning/feature-store/feature-function-serving) — `FeatureFunction`, `FeatureSpec`
- [MLflow Model Registry (Unity Catalog)](https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/) — UC registry, aliases, permissions
- [MLOps workflows](https://docs.databricks.com/aws/en/machine-learning/mlops/mlops-workflow) and [deployment patterns](https://docs.databricks.com/aws/en/machine-learning/mlops/deployment-patterns) — deploy code vs deploy models, environments
- [MLOps Stacks](https://docs.databricks.com/aws/en/machine-learning/mlops/mlops-stacks) — bundle-based project template
- [Declarative Automation Bundles resources](https://docs.databricks.com/aws/en/dev-tools/bundles/resources) — formerly Databricks Asset Bundles; `experiments`, `registered_models`, `model_serving_endpoints`, `quality_monitors`
- [Unit testing for notebooks](https://docs.databricks.com/aws/en/notebooks/testing) — organizing functions and tests, running `pytest`
- [Databricks Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/) — custom models, served entities, traffic splitting
- [Query custom model endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/score-custom-model-endpoints) — MLflow Deployments SDK, REST payload formats
- [Route optimization](https://docs.databricks.com/aws/en/machine-learning/model-serving/route-optimization) — high-QPS endpoints, OAuth-only querying
- [Monitor endpoint health](https://docs.databricks.com/aws/en/machine-learning/model-serving/monitor-diagnose-endpoints) and [export metrics](https://docs.databricks.com/aws/en/machine-learning/model-serving/metrics-export-serving-endpoint) — latency, request rate, error rate, CPU, memory
- [Data quality monitoring / data profiling (formerly Lakehouse Monitoring)](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-quality-monitoring/) — profile types, drift metrics, custom metrics, alerts
- [Data profiling metric tables](https://docs.databricks.com/aws/en/lakehouse-monitoring/monitor-output) — drift test columns, `BASELINE` vs `CONSECUTIVE`

## Release Notes Worth Knowing

- [Bundles release notes](https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles) — Databricks Asset Bundles renamed Declarative Automation Bundles (Mar 16, 2026)
- [November 2025 release notes](https://docs.databricks.com/aws/en/release-notes/product/2025/november) — Lakeflow Declarative Pipelines renamed Lakeflow Spark Declarative Pipelines (Nov 12, 2025)
- [October 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/october) — agents on Model Serving / MLflow `AgentServer` moved to Legacy (Oct 5); Feature Views GA (Oct 12)

## MLflow Documentation

- [MLflow Documentation](https://mlflow.org/docs/latest/index.html) — full MLflow reference
- [MLflow Python API](https://mlflow.org/docs/latest/api_reference/python_api/mlflow.html) — `start_run(nested=True)`, `log_*` functions
- [MLflow `pyfunc` API](https://mlflow.org/docs/latest/api_reference/python_api/mlflow.pyfunc.html) — `PythonModel`, `log_model(name=...)`, `spark_udf`

## Community and Practice

- [Databricks Community Forum](https://community.databricks.com/) — exam discussions
- [Databricks Academy](https://www.databricks.com/learn/training) — *Machine Learning at Scale* and *Advanced Machine Learning Operations*
- [MLflow GitHub](https://github.com/mlflow/mlflow) — source and issues

[← Back to Resources](./README.md)

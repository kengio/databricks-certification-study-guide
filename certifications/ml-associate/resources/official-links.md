---
title: Official Resources — ML Associate
type: reference
tags: [ml-associate, official-links]
status: published
---

# Official Resources and Documentation Links

Curated list of official Databricks, MLflow, and Spark documentation for the ML Associate exam, grouped by exam-guide section.

## Certification

| Resource | URL |
| :--- | :--- |
| ML Associate certification page | <https://www.databricks.com/learn/certification/machine-learning-associate> |
| Exam guide PDF (re-issued "August 2026"; exam version March 1, 2025) | <https://www.databricks.com/sites/default/files/2026-10/Databricks-Certified-Machine-Learning-Associate-Exam-Guide-August-2026.pdf> |
| AI Prep Guide (any Databricks exam) | <https://www.databricks.com/sites/default/files/2026-06/ai-prep-guide-any-databricks-certification.pdf> |
| Certification overview and FAQ | <https://www.databricks.com/learn/certification> |

## Section 1 — Databricks Machine Learning

| Resource | URL |
| :--- | :--- |
| MLOps workflows on Databricks | <https://docs.databricks.com/aws/en/machine-learning/mlops/mlops-workflow> |
| Model deployment patterns (deploy code vs deploy models) | <https://docs.databricks.com/aws/en/machine-learning/mlops/deployment-patterns> |
| Databricks Runtime for Machine Learning | <https://docs.databricks.com/aws/en/machine-learning/databricks-runtime-ml> |
| What is AutoML? | <https://docs.databricks.com/aws/en/machine-learning/automl/> |
| AutoML Python API reference | <https://docs.databricks.com/aws/en/machine-learning/automl/automl-api-reference> |
| Feature management (Feature Store) | <https://docs.databricks.com/aws/en/machine-learning/feature-store/> |
| Work with feature tables in Unity Catalog | <https://docs.databricks.com/aws/en/machine-learning/feature-store/uc/feature-tables-uc> |
| Use features to train models | <https://docs.databricks.com/aws/en/machine-learning/feature-store/train-models-with-feature-store> |
| Online Feature Stores | <https://docs.databricks.com/aws/en/machine-learning/feature-store/online-feature-store> |
| Feature Engineering Python API | <https://api-docs.databricks.com/python/feature-engineering/latest/feature_engineering.client.html> |
| MLflow on Databricks | <https://docs.databricks.com/aws/en/mlflow/> |
| Manage training code with MLflow runs | <https://docs.databricks.com/aws/en/mlflow/runs> |
| Databricks Autologging | <https://docs.databricks.com/aws/en/mlflow/databricks-autologging> |
| Manage model lifecycle in Unity Catalog | <https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/> |
| MLflow Python API (`MlflowClient`) | <https://mlflow.org/docs/latest/api_reference/python_api/mlflow.client.html> |

## Section 2 — Data Processing

| Resource | URL |
| :--- | :--- |
| Databricks Utilities (`dbutils.data.summarize`) | <https://docs.databricks.com/aws/en/dev-tools/databricks-utils> |
| PySpark `DataFrame.summary` | <https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.summary.html> |
| Spark ML basic statistics (correlation, chi-square) | <https://spark.apache.org/docs/latest/ml-statistics.html> |
| Spark ML feature transformers (`Imputer`, `StringIndexer`, `OneHotEncoder`) | <https://spark.apache.org/docs/latest/ml-features.html> |
| Visualizations in Databricks notebooks | <https://docs.databricks.com/aws/en/visualizations/> |

## Section 3 — Model Development

| Resource | URL |
| :--- | :--- |
| Spark ML Pipelines | <https://spark.apache.org/docs/latest/ml-pipeline.html> |
| Spark ML Tuning (`CrossValidator`, `TrainValidationSplit`) | <https://spark.apache.org/docs/latest/ml-tuning.html> |
| Spark ML classification and regression | <https://spark.apache.org/docs/latest/ml-classification-regression.html> |
| Hyperparameter tuning on Databricks | <https://docs.databricks.com/aws/en/machine-learning/automl-hyperparam-tuning/> |
| Hyperopt concepts | <https://docs.databricks.com/aws/en/machine-learning/automl-hyperparam-tuning/hyperopt-concepts> |
| Hyperparameter tuning with Optuna | <https://docs.databricks.com/aws/en/machine-learning/automl-hyperparam-tuning/optuna> |
| scikit-learn model evaluation | <https://scikit-learn.org/stable/modules/model_evaluation.html> |

## Section 4 — Model Deployment

| Resource | URL |
| :--- | :--- |
| Model Serving | <https://docs.databricks.com/aws/en/machine-learning/model-serving/> |
| Deploy custom models | <https://docs.databricks.com/aws/en/machine-learning/model-serving/custom-models> |
| Create custom model serving endpoints | <https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints> |
| Query serving endpoints for custom models | <https://docs.databricks.com/aws/en/machine-learning/model-serving/score-custom-model-endpoints> |
| Lakeflow Spark Declarative Pipelines Python reference (formerly Delta Live Tables) | <https://docs.databricks.com/aws/en/ldp/developer/python-ref> |
| Pipeline autoscaling | <https://docs.databricks.com/aws/en/ldp/auto-scaling> |
| `mlflow.pyfunc` (incl. `spark_udf`) | <https://mlflow.org/docs/latest/api_reference/python_api/mlflow.pyfunc.html> |

## Practice Resources

| Resource | URL |
| :--- | :--- |
| Databricks Academy / training | <https://www.databricks.com/learn/training> |
| Databricks Free Edition (hands-on practice) | <https://docs.databricks.com/aws/en/getting-started/free-edition> |
| Free Edition limitations | <https://docs.databricks.com/aws/en/getting-started/free-edition-limitations> |

> [!note] Platform update (Oct 2026)
> Databricks **Community Edition** was retired on January 1, 2026; the exam guide now points to **Free Edition** for hands-on practice ([Databricks Community announcement](https://community.databricks.com/t5/announcements/psa-community-edition-retires-on-january-1-2026-move-to-the-free/m-p/141888)). Free Edition is serverless-only and lists limits relevant to this exam: no GPU serving endpoints, no provisioned throughput, no custom models on GPU or batch inference, and no online tables.

---

[← Back to Resources](./README.md)

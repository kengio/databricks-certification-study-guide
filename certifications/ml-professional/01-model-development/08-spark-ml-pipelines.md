---
title: Spark ML Pipelines
type: study-material
tags:
  - ml-professional
  - spark-ml
  - mllib
  - pipelines
  - batch-inference
  - streaming-inference
status: published
---

# Spark ML Pipelines

## Overview

The September 2025 exam guide opens Model Development with **Using Spark ML**. It tests seven skills: when Spark ML is the right tool, how to build a `Pipeline`, which estimator or transformer fits a use case, how to tune and evaluate a Spark ML model, how to score it in batch or streaming, and when a single-node model is the better choice for inference. This file covers all seven.

> [!abstract]
>
> - A Spark ML **`Pipeline`** chains **transformers** (`transform()`) and **estimators** (`fit()` returns a model). Fitting a pipeline returns a `PipelineModel`, which is itself a transformer.
> - Feature preparation for tabular data usually follows the same pattern: `StringIndexer` → `OneHotEncoder` → `VectorAssembler` → estimator.
> - Tuning uses `ParamGridBuilder` with `CrossValidator` or `TrainValidationSplit`. Evaluation uses `BinaryClassificationEvaluator`, `MulticlassClassificationEvaluator`, or `RegressionEvaluator`.
> - A fitted `PipelineModel` scores **batch and Structured Streaming** DataFrames with the same `transform()` call. For low-latency REST serving, a single-node model is usually the better choice.

> [!tip] What the Exam Tests
>
> - Recognising data-volume signals (hundreds of millions of rows, data already in Delta) that make Spark ML the right answer over pandas or scikit-learn
> - Picking the correct estimator for the problem type: continuous target → regression, binary → binary classifier, multi-class → multinomial classifier
> - Knowing which stages are estimators (`StringIndexer`, `OneHotEncoder`, `StandardScaler`, any learning algorithm) and which are plain transformers (`VectorAssembler`)
> - Choosing between a Spark ML model and a single-node model for **batch**, **streaming**, and **real-time** inference

---

## When Spark ML Is the Right Tool

Databricks recommends training on a single machine whenever the data and model fit in memory, because distributed code is more complex and pays communication overhead ([Distributed training](https://docs.databricks.com/aws/en/machine-learning/train-model/distributed-training/)). Spark ML earns its place when that assumption breaks.

| Signal in the scenario | Better fit | Why |
| :--- | :--- | :--- |
| Hundreds of millions of rows, data already in Delta / Spark DataFrames | **Spark ML** | Training and feature preparation run on the executors; no `toPandas()` bottleneck |
| Workflow must keep scaling "as data volume increases" | **Spark ML** | Adding workers scales the same pipeline code |
| Algorithm exists in MLlib (linear/logistic regression, tree ensembles, GBT, ALS, k-means) | **Spark ML** | Native distributed implementation |
| Data fits comfortably in driver memory | **Single-node** (scikit-learn, XGBoost, LightGBM) | Faster iteration, larger algorithm catalogue, no shuffle overhead |
| Deep learning, or an algorithm MLlib lacks | **Single-node or distributed DL** (TorchDistributor, Ray) | MLlib is not a deep-learning framework |
| Many small, independent models (one per store or device) | **pandas Function API** | See [Scaling ML Workloads](./09-scaling-ml-workloads.md) |

`pyspark.ml` is supported on serverless, standard, and dedicated compute ([MLlib on Databricks](https://docs.databricks.com/aws/en/machine-learning/train-model/mllib)). The older RDD-based `pyspark.mllib` package is in maintenance mode. Exam answers use the DataFrame-based `pyspark.ml` API.

## Estimators vs Transformers

| Concept | Method | Output | Examples |
| :--- | :--- | :--- | :--- |
| **Transformer** | `transform(df)` | A new DataFrame with added columns | `VectorAssembler`, `SQLTransformer`, `Bucketizer`, any fitted `*Model`, `PipelineModel` |
| **Estimator** | `fit(df)` | A fitted model (which is a transformer) | `StringIndexer`, `OneHotEncoder`, `StandardScaler`, `Imputer`, `LogisticRegression`, `RandomForestClassifier`, `LinearRegression`, `CrossValidator` |
| **Pipeline** | `fit(df)` | `PipelineModel` | Ordered list of stages; each estimator is fitted on the output of the previous stages |
| **Evaluator** | `evaluate(predictions)` | A single metric (float) | `BinaryClassificationEvaluator`, `MulticlassClassificationEvaluator`, `RegressionEvaluator` |

> [!warning] Common Mistake
> `StringIndexer` and `OneHotEncoder` are **estimators**. They must learn the category vocabulary from the training data. `VectorAssembler` is a pure **transformer** and has nothing to learn. If a question asks which stage "requires fitting", the answer is never `VectorAssembler`.

## Constructing a Pipeline

The canonical tabular pipeline encodes categoricals, assembles one feature vector, and fits an estimator. Fitting the whole `Pipeline` on the training split, rather than each stage by hand, makes sure the test split and production data go through the same fitted preprocessing.

```python
from pyspark.ml import Pipeline
from pyspark.ml.classification import LogisticRegression
from pyspark.ml.feature import OneHotEncoder, StringIndexer, VectorAssembler

categorical_cols = ["employment_type", "education_level"]
numeric_cols = ["income", "loan_amount", "credit_history_years"]

indexer = StringIndexer(
    inputCols=categorical_cols,
    outputCols=[f"{c}_idx" for c in categorical_cols],
    handleInvalid="keep",  # unseen categories at scoring time get their own index
)
encoder = OneHotEncoder(
    inputCols=[f"{c}_idx" for c in categorical_cols],
    outputCols=[f"{c}_ohe" for c in categorical_cols],
)
assembler = VectorAssembler(
    inputCols=numeric_cols + [f"{c}_ohe" for c in categorical_cols],
    outputCol="features",
    handleInvalid="skip",
)
classifier = LogisticRegression(featuresCol="features", labelCol="approved")

pipeline = Pipeline(stages=[indexer, encoder, assembler, classifier])

train_df, test_df = spark.table("main.lending.applications").randomSplit([0.8, 0.2], seed=42)
pipeline_model = pipeline.fit(train_df)          # PipelineModel
predictions = pipeline_model.transform(test_df)  # adds rawPrediction, probability, prediction
```

Tree-based estimators (`RandomForestClassifier`, `GBTClassifier`) can use the `StringIndexer` output directly, so one-hot encoding is optional for them. Linear models need the one-hot vectors, because a raw index would imply an order between categories.

## Choosing an Estimator for the Use Case

| Target / task | Estimator(s) | Notes |
| :--- | :--- | :--- |
| Continuous value (revenue, demand, price) | `LinearRegression`, `RandomForestRegressor`, `GBTRegressor` | Regression. Evaluate with RMSE, MAE, or R² |
| Binary label (approve / deny, fraud / not fraud) | `LogisticRegression`, `RandomForestClassifier`, `GBTClassifier`, `LinearSVC` | `probability` column available for most (not `LinearSVC`) |
| Multi-class label | `LogisticRegression(family="multinomial")`, `RandomForestClassifier`, `NaiveBayes` | `NaiveBayes(modelType="multinomial")` expects non-negative count-style features |
| Segmentation without labels | `KMeans`, `BisectingKMeans`, `GaussianMixture` | Evaluate with `ClusteringEvaluator` (silhouette) |
| User–item recommendations | `ALS` | Set `coldStartStrategy="drop"` before evaluating |
| Standardise numeric features | `StandardScaler` (estimator) | Fit inside the pipeline so the scaling statistics come from training data only |
| Bucketise a continuous feature | `Bucketizer` (transformer, fixed splits) or `QuantileDiscretizer` (estimator, learned splits) | Learned splits must be fitted on training data |

## Tuning with MLlib

MLlib tuning wraps an estimator (usually the whole pipeline) in a model-selection estimator. `parallelism` controls how many parameter combinations are fitted at the same time. The [Tuning Fundamentals](./05-tuning-fundamentals.md) file goes deeper on grid vs random search.

```python
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.tuning import CrossValidator, ParamGridBuilder

param_grid = (
    ParamGridBuilder()
    .addGrid(classifier.regParam, [0.01, 0.1, 1.0])
    .addGrid(classifier.elasticNetParam, [0.0, 0.5])
    .build()
)

evaluator = BinaryClassificationEvaluator(labelCol="approved", metricName="areaUnderROC")

cv = CrossValidator(
    estimator=pipeline,          # tune the whole pipeline, not just the classifier
    estimatorParamMaps=param_grid,
    evaluator=evaluator,
    numFolds=3,
    parallelism=4,
    seed=42,
)
cv_model = cv.fit(train_df)
best_pipeline_model = cv_model.bestModel   # PipelineModel refit on all of train_df
```

| Selector | Splits | Cost | Use when |
| :--- | :--- | :--- | :--- |
| `CrossValidator` | k folds | k × combinations fits | Smaller data or you need a robust estimate |
| `TrainValidationSplit` | One split (`trainRatio`) | 1 × combinations fits | Very large data where k-fold is too expensive |

Turn on `mlflow.pyspark.ml.autolog()` to record each parameter combination. The legacy automatic MLlib tracking is deprecated and disabled by default on Databricks Runtime 10.4 LTS ML and above ([Hyperparameter tuning](https://docs.databricks.com/aws/en/machine-learning/automl-hyperparam-tuning/)).

## Evaluating a Spark ML Model

```python
from pyspark.ml.evaluation import (
    BinaryClassificationEvaluator,
    MulticlassClassificationEvaluator,
    RegressionEvaluator,
)

test_predictions = best_pipeline_model.transform(test_df)

auc = BinaryClassificationEvaluator(
    labelCol="approved", metricName="areaUnderROC"
).evaluate(test_predictions)

f1 = MulticlassClassificationEvaluator(
    labelCol="approved", predictionCol="prediction", metricName="f1"
).evaluate(test_predictions)

log_loss = MulticlassClassificationEvaluator(
    labelCol="approved", probabilityCol="probability", metricName="logLoss"
).evaluate(test_predictions)
```

| Evaluator | Common `metricName` values | Problem type |
| :--- | :--- | :--- |
| `BinaryClassificationEvaluator` | `areaUnderROC` (default), `areaUnderPR` | Binary classification (ranking quality) |
| `MulticlassClassificationEvaluator` | `f1` (default), `accuracy`, `weightedPrecision`, `weightedRecall`, `logLoss` | Binary or multi-class (label quality, or calibration with `logLoss`) |
| `RegressionEvaluator` | `rmse` (default), `mse`, `mae`, `r2` | Regression |

Pick the metric that matches the decision the model drives. If downstream actions depend on **probability thresholds**, a calibration-sensitive metric such as log loss matters more than AUROC or accuracy. See [Model Lifecycle Orchestration](../02-ml-ops/02-model-lifecycle-orchestration.md#selecting-the-top-performing-model).

## Logging and Registering the Pipeline

```python
import mlflow
from mlflow.models import infer_signature

mlflow.set_registry_uri("databricks-uc")

sample_input = test_df.drop("approved").limit(100)
signature = infer_signature(sample_input, best_pipeline_model.transform(sample_input).select("prediction"))

with mlflow.start_run(run_name="loan_approval_spark_ml"):
    mlflow.log_metric("test_auc", auc)
    mlflow.spark.log_model(
        best_pipeline_model,
        artifact_path="model",
        signature=signature,  # signatures are required to register in Unity Catalog
        registered_model_name="main.lending.loan_approval_spark",
    )
```

## Scoring: Batch and Streaming

A `PipelineModel` scores any Spark DataFrame. A streaming DataFrame is scored with exactly the same `transform()` call, so one model artefact serves both nightly batch and continuous scoring.

```python
model_uri = "models:/main.lending.loan_approval_spark@champion"
loaded = mlflow.spark.load_model(model_uri)   # returns a PipelineModel

# Batch: score a Delta table and overwrite the output table
(loaded.transform(spark.table("main.lending.applications_today"))
    .select("application_id", "prediction", "probability")
    .write.mode("overwrite")
    .saveAsTable("main.lending.approval_scores"))

# Streaming: same transform() on a streaming DataFrame
(loaded.transform(spark.readStream.table("main.lending.applications_stream"))
    .select("application_id", "prediction")
    .writeStream
    .option("checkpointLocation", "/Volumes/main/lending/checkpoints/approval_stream")
    .trigger(availableNow=True)          # or processingTime="1 minute" for continuous
    .toTable("main.lending.approval_scores_stream"))
```

`mlflow.pyfunc.spark_udf()` is the other batch and streaming option. It wraps **any** MLflow model, including single-node scikit-learn models, as a Spark UDF that runs on the executors ([Model Serving and Deployment](../03-model-deployment/01-model-serving-deployment.md#batch-scoring-with-spark_udf)).

## Spark ML vs Single-Node Model by Inference Type

| Inference type | Typical requirement | Recommended model / pattern |
| :--- | :--- | :--- |
| **Batch** (nightly, millions of rows) | Throughput | Spark ML `PipelineModel.transform()`, or a single-node model distributed with `spark_udf()` |
| **Streaming** (micro-batches, seconds to minutes) | Continuous throughput | Spark ML `transform()` on a streaming DataFrame, or `spark_udf()` inside the stream |
| **Real-time** (one request, milliseconds) | Low per-request latency | **Single-node model** (scikit-learn, XGBoost, PyTorch) on a Model Serving endpoint |

The reasoning for real-time: Spark parallelism pays off across many rows, not within one request. MLflow's Spark flavor scores outside a cluster by instantiating a SparkContext and converting the input to a Spark DataFrame first ([`mlflow.spark` API](https://mlflow.org/docs/latest/api_reference/python_api/mlflow.spark.html)). That per-request overhead works against a latency target. A model that runs natively in pandas or NumPy is lighter to serve.

> [!note]
> "Single-node model" describes how the model **trains and runs**, not how much data you can score. A scikit-learn model wrapped in `spark_udf()` still scores a billion rows in parallel across the cluster.

## Use Cases

- **Loan approval at 400M+ rows**: Index and one-hot encode employment and education, assemble with numeric features, and fit a logistic regression pipeline with `CrossValidator`. The pipeline scales by adding workers.
- **Quarterly revenue forecasting**: A continuous target calls for `LinearRegression` or `GBTRegressor`, evaluated with `RegressionEvaluator(metricName="rmse")`.
- **Streaming risk scoring**: Load the registered `PipelineModel` once and apply `transform()` to a Delta streaming source, writing scores to a Delta table with a checkpoint.

## Common Issues & Errors

### `IllegalArgumentException` for an unseen label at scoring time

**Scenario:** A `StringIndexer` fitted on training data meets a new category in production and the job fails.
**Fix:** Set `handleInvalid="keep"` (extra index bucket) or `"skip"` (drop the row) on `StringIndexer`. Choose `keep` when every row must be scored.

### Test metrics look too good

**Scenario:** A `StandardScaler` or `StringIndexer` was fitted on the full dataset before the train/test split.
**Fix:** Put every learned preprocessing stage inside the `Pipeline` and call `fit()` on the training split only, so the test data never influences the fitted statistics.

### `CrossValidator` runs slowly or exhausts memory

**Scenario:** A large grid with `numFolds=5` and high `parallelism` launches many concurrent fits.
**Fix:** Reduce the grid, use `TrainValidationSplit` for very large data, and set `parallelism` to what the cluster can run at once.

## Exam Tips

> [!tip]
>
> - "430 million records", "scales as data volume increases", and similar phrases point to Spark ML (`StringIndexer` + `OneHotEncoder` + `VectorAssembler`). `pandas.get_dummies` and scikit-learn encoders are single-node.
> - Continuous target means a regression estimator. Logistic regression, Naive Bayes, and softmax are **classifiers**, whatever their names suggest.
> - `PipelineModel.transform()` works on streaming DataFrames. You don't need a separate streaming model.
> - Real-time, single-record, millisecond latency points to a single-node model on Model Serving. Batch and streaming at volume point to Spark ML or `spark_udf()`.

## Key Takeaways

- **Pipeline = ordered stages**: estimators are fitted in sequence; the result is a `PipelineModel` transformer
- **Estimators learn** (`StringIndexer`, `OneHotEncoder`, `StandardScaler`, all algorithms); **transformers only map** (`VectorAssembler`)
- **Tune the whole pipeline** with `CrossValidator` / `TrainValidationSplit` and `ParamGridBuilder`; `parallelism` sets concurrent fits
- **Evaluate with the metric that matches the decision**: AUROC for ranking, F1 / accuracy for labels, log loss for calibrated probabilities, RMSE / R² for regression
- **Same `transform()` for batch and streaming**; **single-node models for real-time** REST serving

## Related Topics

- [Tuning Fundamentals](./05-tuning-fundamentals.md) — grid vs random search with `CrossValidator`
- [Scaling ML Workloads](./09-scaling-ml-workloads.md) — pandas Function API, vertical vs horizontal scaling, Ray vs Spark
- [Model Serving and Deployment](../03-model-deployment/01-model-serving-deployment.md) — `spark_udf`, streaming inference, REST endpoints
- [Spark Fundamentals (shared)](../../../shared/fundamentals/spark-fundamentals.md)

## Official Documentation

- [Apache Spark MLlib on Databricks](https://docs.databricks.com/aws/en/machine-learning/train-model/mllib)
- [Spark ML Pipelines guide](https://spark.apache.org/docs/latest/ml-pipeline.html)
- [Spark ML feature transformers](https://spark.apache.org/docs/latest/ml-features.html)
- [Spark ML tuning](https://spark.apache.org/docs/latest/ml-tuning.html)
- [Distributed training on Databricks](https://docs.databricks.com/aws/en/machine-learning/train-model/distributed-training/)
- [`mlflow.spark` API reference](https://mlflow.org/docs/latest/api_reference/python_api/mlflow.spark.html)

---

**[← Previous: Distributed Hyperparameter Tuning](./07-distributed-tuning.md) | [↑ Back to Model Development](./README.md) | [Next: Scaling ML Workloads →](./09-scaling-ml-workloads.md)**

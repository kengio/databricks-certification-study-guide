---
title: "Practice Questions - Spark ML and Scaling"
type: practice-questions
tags:
  - ml-professional
  - practice-questions
  - spark-ml
  - scaling
  - pandas-function-api
  - ray
status: complete
---

# Practice Questions: Spark ML and Scaling

[← Back to Practice Questions](./README.md) | [Previous: Model Governance](./04-model-governance.md)

All questions in this file target the September 2025 exam guide sections **Using Spark ML** and **Scaling and Tuning**. They were added in the October 2026 refresh.

---

## Question 1 *(Easy)*: When Spark ML Is Recommended *(2026 guide)*

**Question**: Which scenario most clearly calls for Spark ML rather than scikit-learn on the driver?

A) A 900-million-row Delta table of telemetry, where the training pipeline must keep working as volume grows  
B) A 40 MB CSV with 20,000 rows for a quick prototype  
C) A model that needs a transformer-based deep-learning architecture  
D) A single-record, sub-20 ms real-time scoring API

> [!success]- Answer
> **Correct Answer: A) A 900-million-row Delta table of telemetry, where the training pipeline must keep working as volume grows**
>
> Data far larger than one machine's memory, already in Delta and still growing, is the Spark ML signal.
>
> Databricks recommends single-machine training when data and model fit in memory, because distributed code adds complexity and communication overhead. Deep learning belongs with TorchDistributor or Ray, and single-record real-time scoring favors a single-node model on Model Serving.

---

## Question 2 *(Medium)*: Estimators vs Transformers *(2026 guide)*

**Question**: In the pipeline `[StringIndexer, OneHotEncoder, VectorAssembler, RandomForestClassifier]`, which stage does **not** learn anything from the training data?

A) `StringIndexer`  
B) `OneHotEncoder`  
C) `VectorAssembler`  
D) `RandomForestClassifier`

> [!success]- Answer
> **Correct Answer: C) `VectorAssembler`**
>
> `VectorAssembler` is a pure transformer: it concatenates columns into one vector.
>
> `StringIndexer` learns the category-to-index mapping, `OneHotEncoder` learns category sizes (it's an estimator since Spark 3.0), and the classifier learns model parameters. All three are fitted when `Pipeline.fit()` runs, which returns a `PipelineModel`.

---

## Question 3 *(Medium)*: Building a Pipeline for Mixed Features *(2026 guide)*

**Question**: A 300-million-row dataset has numeric columns (`income`, `tenure`) and string columns (`plan_type`, `region`). The team will train a logistic regression and wants preprocessing to scale with the data. Which pipeline is correct?

A) `VectorAssembler` on all four columns → `LogisticRegression`  
B) `StringIndexer` on the string columns → `OneHotEncoder` on the indexes → `VectorAssembler` on the numeric and encoded columns → `LogisticRegression`  
C) `pandas.get_dummies` on a `toPandas()` copy → `LogisticRegression`  
D) `OneHotEncoder` directly on the string columns → `LogisticRegression`

> [!success]- Answer
> **Correct Answer: B) `StringIndexer` on the string columns → `OneHotEncoder` on the indexes → `VectorAssembler` on the numeric and encoded columns → `LogisticRegression`**
>
> Index the strings, one-hot encode the indexes, assemble one feature vector, then fit the estimator.
>
> `VectorAssembler` can't take raw string columns, and Spark's `OneHotEncoder` expects numeric category indexes, so `StringIndexer` must come first. Linear models need one-hot vectors so that indexes don't imply an order. `toPandas()` on 300 million rows doesn't scale.

---

## Question 4 *(Easy)*: Estimator for a Continuous Target *(2026 guide)*

**Question**: A logistics team predicts delivery time in minutes from distance, weather, and traffic features. Which Spark ML estimator fits the task?

A) `LogisticRegression`  
B) `NaiveBayes`  
C) `GBTRegressor`  
D) `MultilayerPerceptronClassifier`

> [!success]- Answer
> **Correct Answer: C) `GBTRegressor`**
>
> A continuous target is a regression problem, so use a regressor such as `GBTRegressor` or `LinearRegression`.
>
> Logistic regression, Naive Bayes, and the multilayer perceptron classifier all predict classes despite their names. Evaluate regressors with `RegressionEvaluator` (`rmse`, `mae`, `r2`).

---

## Question 5 *(Medium)*: CrossValidator vs TrainValidationSplit *(2026 guide)*

**Question**: Tuning a Spark ML pipeline over 24 parameter combinations on a 2-billion-row table with 5-fold `CrossValidator` is too slow. Which change keeps a principled validation step at much lower cost?

A) Replace `CrossValidator` with `TrainValidationSplit(trainRatio=0.8)`  
B) Raise `numFolds` to 10 for a more stable estimate  
C) Evaluate on the training data instead of a validation split  
D) Remove the evaluator and pick the last parameter map

> [!success]- Answer
> **Correct Answer: A) Replace `CrossValidator` with `TrainValidationSplit(trainRatio=0.8)`**
>
> `TrainValidationSplit` fits each combination once instead of k times.
>
> With very large data, one validation split is usually reliable enough, and it cuts cost by roughly the number of folds. `parallelism` controls how many combinations fit at once, so set it to what the cluster can handle. Evaluating on training data hides overfitting.

---

## Question 6 *(Medium)*: Scoring a Streaming Source *(2026 guide)*

**Question**: A registered Spark ML `PipelineModel` must score records continuously as they land in a Delta table. What is the simplest correct approach?

A) Retrain a separate streaming model, because batch models can't score streams  
B) Deploy the model to a REST endpoint and call it once per row from a Python loop  
C) Collect each micro-batch to the driver and call `predict` row by row  
D) Load it with `mlflow.spark.load_model(...)` and call `.transform()` on `spark.readStream.table(...)`, writing with `writeStream` and a checkpoint location

> [!success]- Answer
> **Correct Answer: D) Load it with `mlflow.spark.load_model(...)` and call `.transform()` on `spark.readStream.table(...)`, writing with `writeStream` and a checkpoint location**
>
> A fitted `PipelineModel` transforms streaming DataFrames with the same `transform()` call it uses for batch.
>
> Write the scored stream to Delta with a checkpoint so it can restart. `mlflow.pyfunc.spark_udf` is an alternative that works for any MLflow model, including single-node ones. Per-row REST calls or driver collection don't scale.

---

## Question 7 *(Medium)*: Model Choice for Real-Time Inference *(2026 guide)*

**Question**: A checkout service needs a fraud score for one transaction at a time within 30 ms. The current model is a Spark ML `PipelineModel`. Which approach best fits the latency requirement?

A) Keep the Spark ML model and score each request with a Spark job on an all-purpose cluster  
B) Train an equivalent single-node model (for example scikit-learn or XGBoost) and serve it on a Model Serving endpoint  
C) Score all possible transactions nightly in batch  
D) Run Structured Streaming with a 1-second trigger and have the service poll the output table

> [!success]- Answer
> **Correct Answer: B) Train an equivalent single-node model (for example scikit-learn or XGBoost) and serve it on a Model Serving endpoint**
>
> For single-record, millisecond scoring, a single-node model on Model Serving avoids Spark overhead.
>
> Spark's parallelism pays off across many rows, not inside one request. Outside a cluster, MLflow's Spark flavor has to instantiate a SparkContext to score, which adds latency. Batch and streaming fit throughput workloads, not synchronous per-request answers.

---

## Question 8 *(Medium)*: Group-Specific Training with applyInPandas *(2026 guide)*

**Question**: A retailer needs a separate demand model for each of 3,000 stores, trained in parallel on the cluster. Which approach is correct?

A) `df.groupBy("store_id").applyInPandas(train_fn, schema="store_id string, rmse double, run_id string")`, where `train_fn` takes and returns a pandas DataFrame  
B) Loop over the stores on the driver, calling `toPandas()` and training each model in turn  
C) `df.mapInPandas(train_fn, schema)` with no grouping  
D) One Spark ML model with `store_id` one-hot encoded

> [!success]- Answer
> **Correct Answer: A) `df.groupBy("store_id").applyInPandas(train_fn, schema="store_id string, rmse double, run_id string")`, where `train_fn` takes and returns a pandas DataFrame**
>
> Grouped map (`applyInPandas`) hands each store's rows to `train_fn` as a pandas DataFrame and runs the groups in parallel.
>
> The returned DataFrame must match the declared schema. Pass the experiment and parent run IDs into the function explicitly if each group logs a child run to MLflow, because executors don't see the driver's active run. `mapInPandas` doesn't guarantee that a store's rows arrive together.

---

## Question 9 *(Hard)*: applyInPandas Out-of-Memory on One Group *(2026 guide)*

**Question**: An `applyInPandas` training job succeeds for 2,999 stores but fails with out-of-memory errors on the flagship store, which has 60× more rows than average. What is the cause, and what fixes it?

A) `spark.sql.execution.arrow.maxRecordsPerBatch` is too high; lowering it splits the group  
B) The output schema is wrong  
C) `applyInPandas` can't process more than 1 GB in total; switch to a pandas UDF  
D) All of a group's data is loaded into memory at once; split or salt the oversized key, pre-aggregate, or give executors more memory

> [!success]- Answer
> **Correct Answer: D) All of a group's data is loaded into memory at once; split or salt the oversized key, pre-aggregate, or give executors more memory**
>
> Each group must fit in executor memory, because all of its rows are loaded before the function runs.
>
> `maxRecordsPerBatch` doesn't apply to groups, so tuning it doesn't help. Skewed keys are the usual cause. Split them into sub-groups, reduce the data per group, or increase executor memory.

---

## Question 10 *(Medium)*: Vertical vs Horizontal Scaling *(2026 guide)*

**Question**: A team trains a gradient-boosting model on 6 GB of tabular data. Training takes 40 minutes on a small node, and they want it faster with minimal code changes. What should they try first?

A) Rewrite the training in Spark ML and add 20 workers  
B) Scale vertically: use a larger single node (more cores and memory) with the same single-node library  
C) Port the model to Ray Train across 50 nodes  
D) Split the data into shards and average models trained separately

> [!success]- Answer
> **Correct Answer: B) Scale vertically: use a larger single node (more cores and memory) with the same single-node library**
>
> When data and model fit on one machine, scaling up is the simplest and usually the most efficient option.
>
> Databricks recommends single-machine training when possible. Horizontal scaling adds distributed code and communication overhead, and it's worth it when data or model no longer fit, or when the work is many independent tasks such as tuning trials.

---

## Question 11 *(Hard)*: Data vs Model Parallelism *(2026 guide)*

**Question**: A team fine-tunes a deep-learning model whose parameters, gradients, and optimizer state don't fit in one GPU's memory, on a multi-GPU node. Which strategy fits?

A) Sharded data parallelism or model parallelism, for example FSDP or DeepSpeed ZeRO, which shard model state across GPUs  
B) Plain DDP (Distributed Data Parallel), which keeps a full model replica on every GPU  
C) Hyperparameter tuning with more trials  
D) `applyInPandas` grouped by GPU ID

> [!success]- Answer
> **Correct Answer: A) Sharded data parallelism or model parallelism, for example FSDP or DeepSpeed ZeRO, which shard model state across GPUs**
>
> When the model doesn't fit on one device, shard the model state (FSDP / ZeRO) or split the model (pipeline / tensor parallelism).
>
> DDP replicates the full model on each GPU, so it suits models that fit on one GPU and need more data throughput. Databricks' multi-GPU guidance maps DDP to the case where the model fits, and FSDP / DeepSpeed ZeRO to very large models.

---

## Question 12 *(Medium)*: Comparing Ray and Spark *(2026 guide)*

**Question**: Which statement correctly compares Ray and Spark on Databricks?

A) Ray replaces Spark for ETL and SQL on Databricks  
B) Spark excels at data parallelism (the same operation over a large dataset); Ray excels at task parallelism (many independent or dynamic tasks such as tuning trials and RL); they can run together on one cluster  
C) Ray runs only on serverless compute, and Spark only on classic clusters  
D) Spark can't train ML models; only Ray can

> [!success]- Answer
> **Correct Answer: B) Spark excels at data parallelism (the same operation over a large dataset); Ray excels at task parallelism (many independent or dynamic tasks such as tuning trials and RL); they can run together on one cluster**
>
> Use Spark for data-intensive stages and Ray for compute-intensive, task-parallel stages.
>
> Ray on Databricks runs on Spark clusters (`setup_ray_cluster`). It isn't supported on serverless-based runtimes; Ray on AI Runtime covers serverless GPU. Spark ML trains distributed models at data scale.

---

**[← Previous: ML Professional Practice Questions — Model Governance & MLOps](./04-model-governance.md) | [↑ Back to ML Professional Practice Questions](./README.md)**

---
title: Mock Exam 2 Questions — ML Associate
type: mock-exam-questions
tags: [ml-associate, mock-exam]
status: published
---

# Mock Exam 2 — Questions

Set a 90-minute timer and answer all 45 questions before checking answers. This exam emphasizes integration scenarios, edge cases, and troubleshooting.

[← Back to Mock Exam 2 Instructions](./README.md)

---

## Databricks ML (Questions 1–13)

---

## Question 1 *(Medium)*

**Question**: A data scientist is debugging a scikit-learn pipeline on a small sample of data locally in a Databricks notebook. The full training dataset is 2 TB in Delta Lake. Which cluster type should they use for the debugging phase?

A) Multi-node cluster with 20 workers to match the production environment
B) Single-node cluster to minimize cost during the debugging phase
C) GPU cluster to ensure the code runs correctly before moving to GPU production
D) High-concurrency cluster shared with the rest of the team

> [!success]- Answer
> **Correct Answer: B**
>
> During debugging with a small data sample using scikit-learn (which does not distribute), a single-node cluster minimizes cost. Multi-node clusters add overhead with no benefit for non-distributed code. GPU and high-concurrency clusters are not needed for debugging scikit-learn logic.

---

## Question 2 *(Medium)*

**Question**: A data scientist accidentally launches a Databricks Runtime ML cluster instead of Databricks Runtime ML GPU for a PyTorch training job that requires GPU. What symptom will they observe?

A) The cluster fails to start because GPU drivers cannot be installed on a non-GPU runtime
B) PyTorch runs in CPU-only mode, and GPU acceleration is unavailable
C) The job runs normally because Databricks automatically detects and enables GPU support
D) MLflow autolog is disabled because GPU metrics cannot be tracked

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Runtime ML GPU is needed for CUDA/GPU support. If a GPU instance type is selected with the standard ML Runtime, PyTorch will run in CPU-only mode because the CUDA libraries are not installed. The runtime selection must explicitly be ML GPU to enable GPU acceleration.

---

## Question 3 *(Medium)*

**Question**: An ML platform team wants to allow data scientists to configure cluster memory and core counts but prevent them from changing the auto-termination setting. How should the policy be configured?

A) Set auto-termination to a fixed value in the cluster policy
B) Make auto-termination a hidden field in the cluster creation UI
C) Create a separate termination policy in the billing console
D) Set a minimum auto-termination threshold without fixing it

> [!success]- Answer
> **Correct Answer: A**
>
> Cluster policies support `fixed` constraints that lock a parameter to a specific value, preventing users from changing it. Setting auto-termination to a fixed value in the policy ensures all clusters terminate after the specified idle time, regardless of user preferences.

---

## Question 4 *(Medium)*

**Question**: A data scientist runs AutoML for classification. The resulting experiment shows 20 trial runs. They want to use the best model's code as a starting point for further tuning. Where is this code located?

A) In the DBFS path `/ml/automl/best_model.py`
B) In a generated notebook linked from the best run in the AutoML experiment
C) In the MLflow model artifact under `source_code/`
D) In a Delta table named `automl_best_model_code`

> [!success]- Answer
> **Correct Answer: B**
>
> AutoML generates a Python notebook containing the complete training code for the best-performing trial. This notebook is linked directly from the best run in the MLflow experiment UI. Data scientists can clone and modify it to customize the training approach.

---

## Question 5 *(Medium)*

**Question**: A company wants to standardize all ML cluster configurations so that data scientists cannot accidentally change the Databricks Runtime version. Which cluster policy constraint type should be used?

A) `allowlist` — provide a list of allowed runtime versions
B) `fixed` — lock the runtime to a specific version
C) `range` — specify minimum and maximum runtime versions
D) `default` — set a default but allow overrides

> [!success]- Answer
> **Correct Answer: B**
>
> The `fixed` constraint in a cluster policy locks a parameter to a specific value that cannot be changed by users. `allowlist` allows users to choose from a set of approved values. `range` sets min/max bounds. `default` sets an initial value but allows the user to override it.

---

## Question 6 *(Easy)*

**Question**: A data scientist wants to track their ML experiment notebooks in version control and collaborate with teammates using pull requests. Which Databricks feature should they use?

A) MLflow experiment tags
B) Databricks Repos with Git integration
C) Delta Lake change data feed
D) Databricks Workflows version history

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Repos integrates with Git providers, enabling full Git workflows including branching, committing, pushing, and pull requests. This is the correct feature for source-controlling notebooks and collaborating through code reviews.

---

## Question 7 *(Medium)*

**Question**: A data scientist is running a hyperparameter optimization loop in a notebook. After 50 iterations, they want to identify which hyperparameter combination produced the best validation AUC. What is the most efficient approach?

A) Manually inspect each cell's output in the notebook
B) Export all results to a CSV and sort by AUC
C) Use `mlflow.search_runs()` to query runs by `metrics.val_auc` in descending order
D) Review the printed output from each training loop iteration

> [!success]- Answer
> **Correct Answer: C**
>
> `mlflow.search_runs(filter_string="", order_by=["metrics.val_auc DESC"])` programmatically retrieves all runs sorted by the specified metric. This is more efficient and reproducible than manual inspection or CSV exports.

---

## Question 8 *(Hard)*

**Question**: An organization uses AutoML for initial model prototyping. A data scientist notices that the AutoML experiment uses different feature transformations than their production preprocessing pipeline. What is the risk?

A) The AutoML model may perform better than expected in production due to more optimized preprocessing
B) The AutoML model may perform worse in production due to train-serve skew from different feature transformations
C) AutoML preprocessing is always identical to production because it uses the Databricks Feature Store
D) There is no risk because AutoML models are never used directly in production

> [!success]- Answer
> **Correct Answer: B**
>
> If AutoML's internal feature transformations differ from the production preprocessing pipeline, the model will experience train-serve skew — it will be evaluated in production on differently transformed features than it was trained on. This can significantly degrade prediction quality. Integrating the Feature Store with AutoML or carefully replicating feature logic mitigates this risk.

---

## Question 9 *(Easy)*

**Question**: A data scientist wants to run their model training notebook as a scheduled job. Which Databricks feature orchestrates this?

A) Databricks Repos (scheduled sync)
B) MLflow experiment scheduler
C) Databricks Workflows (Jobs)
D) Delta Live Tables pipeline

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Workflows (Jobs) allows scheduling and orchestrating notebook, Python script, and pipeline executions on a recurring schedule or trigger. MLflow does not have a scheduler, Repos is for version control, and Delta Live Tables is for data pipeline orchestration.

---

## Question 10 *(Easy)*

**Question**: A data scientist runs `dbutils.notebook.run("train_model", 600)`. What does the integer `600` represent?

A) The maximum number of rows to process
B) The timeout in seconds before the notebook execution is aborted
C) The maximum number of MLflow runs to create
D) The cluster auto-termination time in minutes

> [!success]- Answer
> **Correct Answer: B**
>
> The second parameter to `dbutils.notebook.run()` is the timeout in seconds. If the called notebook does not complete within 600 seconds (10 minutes), the call raises a `TimeoutError`. Unlike `%run`, `dbutils.notebook.run()` returns only a string result, not shared variables.

---

## Question 11 *(Hard)*

**Question**: Which Databricks Runtime feature reduces data shuffle costs in Spark ML training by keeping data co-located?

A) Photon engine
B) Delta Lake Z-ordering
C) Adaptive Query Execution (AQE)
D) Spark ML `cacheData` option in `CrossValidator`

> [!success]- Answer
> **Correct Answer: D**
>
> `CrossValidator` has a `parallelism` parameter and a `seed` for reproducibility, but more importantly, `CrossValidator` (and `TrainValidationSplit`) have a `collectSubModels` option and support data caching via `cacheData=True` to avoid recomputing the dataset for each fold. AQE and Photon optimize general Spark queries but are not ML-specific caching features.

---

## Question 12 *(Medium)*

**Question**: A team wants to share an AutoML-generated notebook with a colleague who works in a different Databricks workspace. What is the best approach?

A) Export the notebook as a .dbc file and import it into the colleague's workspace
B) Share the MLflow experiment URL — it is accessible across workspaces
C) Push the notebook to a shared Git repository using Databricks Repos
D) Copy the notebook text and paste it into an email

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Repos with Git integration is the best approach for sharing notebooks across workspaces. Pushing to a shared Git repository allows the colleague to clone or pull the notebook in their own workspace. The `.dbc` export/import approach works but is less maintainable for ongoing collaboration.

---

## Question 13 *(Easy)*

**Question**: A data scientist wants to create a reproducible experiment where the same random split is used every time the notebook runs. Which parameter in `train_test_split` (sklearn) or `randomSplit` (Spark) controls this?

A) `reproducible=True`
B) `random_state` (sklearn) or `seed` (Spark)
C) `deterministic=True`
D) `fixed_split=True`

> [!success]- Answer
> **Correct Answer: B**
>
> In scikit-learn, `train_test_split(df, random_state=42)` sets the random seed. In Spark, `df.randomSplit([0.8, 0.2], seed=42)` sets the split seed. The parameter is `random_state` in sklearn and `seed` in Spark. `reproducible`, `deterministic`, and `fixed_split` are not valid parameters.

---

## ML Workflows (Questions 14–26)

---

## Question 14 *(Medium)*

**Question**: A data scientist enables `mlflow.autolog()` and then manually logs `mlflow.log_metric("custom_f1", 0.88)` within the same run. What is the result?

A) An error is raised because manual and automatic logging cannot coexist
B) The `custom_f1` metric is logged alongside the automatically captured metrics
C) Autolog is disabled after the first manual logging call
D) The manual log overwrites all autolog metrics with the same name

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.autolog()` and manual logging calls are fully compatible. Autolog captures framework-generated metrics, while manual calls add supplementary data. All logged values coexist in the same run record. Autolog is not disabled by manual logging.

---

## Question 15 *(Medium)*

**Question**: A data scientist wants to log the full training dataset as an artifact for reproducibility. The dataset is a Spark DataFrame. What is the recommended approach?

A) `mlflow.log_artifact(train_df)` — pass the DataFrame directly
B) Save the DataFrame to a Delta table path and log the path string as a parameter
C) `mlflow.log_param("dataset_path", delta_table_path)` or save a sample CSV and log with `log_artifact()`
D) Log the DataFrame as a pickle file using `mlflow.log_artifact()`

> [!success]- Answer
> **Correct Answer: C**
>
> Spark DataFrames cannot be passed directly to `log_artifact()`. The best practice is to log the data location (Delta table path or version) as a parameter with `log_param()`, ensuring reproducibility without duplicating large datasets. For small datasets, saving a sample and logging with `log_artifact()` is also acceptable.

---

## Question 16 *(Hard)*

**Question**: A parent run is active. A data scientist calls `mlflow.start_run(nested=True)` inside a loop to create child runs. When does the parent run end?

A) After the first child run ends
B) After all child runs in the loop have ended
C) Only when the parent run's context manager or `mlflow.end_run()` is explicitly called
D) Automatically after 60 minutes of inactivity

> [!success]- Answer
> **Correct Answer: C**
>
> The parent run's lifecycle is independent of its child runs. The parent run ends when its `with` block exits (if using a context manager) or when `mlflow.end_run()` is explicitly called. Child runs ending does not affect the parent run's status.

---

## Question 17 *(Medium)*

**Question**: A data scientist uses the same experiment name in two different notebooks running simultaneously. Both call `mlflow.set_experiment("shared-experiment")` and `mlflow.start_run()`. What happens?

A) The second notebook's runs overwrite the first notebook's runs
B) Both notebooks log runs to the same experiment — runs are identified by unique run IDs
C) An error is raised because experiments cannot be used by multiple notebooks concurrently
D) One notebook's runs are automatically moved to a new experiment

> [!success]- Answer
> **Correct Answer: B**
>
> MLflow experiments support concurrent access. Each `mlflow.start_run()` creates a unique run with its own `run_id`. Multiple runs from different notebooks can coexist in the same experiment simultaneously. There is no locking or overwriting.

---

## Question 18 *(Medium)*

**Question**: A data scientist wants to retrieve the top 3 runs from an experiment ordered by `val_accuracy` descending. Which code is correct?

A)

```python
runs = mlflow.search_runs(
    experiment_ids=["123"],
    order_by=["metrics.val_accuracy DESC"],
    max_results=3
)
```

B)

```python
runs = mlflow.search_runs(
    experiment_ids=["123"],
    sort_by="val_accuracy",
    limit=3
)
```

C)

```python
runs = mlflow.get_experiment("123").runs[:3]
```

D)

```python
runs = mlflow.search_runs("123").sort_values("val_accuracy")[:3]
```

> [!success]- Answer
> **Correct Answer: A**
>
> `mlflow.search_runs()` accepts `order_by` (a list of strings in the format `"metrics.<name> DESC"`) and `max_results` to limit the number of returned runs. `sort_by` and `limit` are not valid parameter names. `mlflow.get_experiment()` does not expose a `.runs` attribute.

---

## Question 19 *(Medium)*

**Question**: A data scientist logs a model inside a run but forgets to register it to the Model Registry. Later, they want to register it without re-running training. What should they do?

A) Retrain the model and call `mlflow.register_model()` this time
B) Use `mlflow.register_model("runs:/<run_id>/<artifact_path>", "model_name")` to register the logged model
C) Delete the run and start over with proper registration
D) Copy the artifact file to the model registry manually using DBFS commands

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.register_model()` can be called at any time after a model has been logged to a run. As long as you know the `run_id` and `artifact_path`, you can register the model to the registry without re-running training. The run must not have been deleted.

---

## Question 20 *(Medium)*

**Question**: Which MLflow tag is automatically set to identify the notebook path where a run was started in Databricks?

A) `mlflow.source.name`
B) `mlflow.databricks.notebookPath`
C) `mlflow.notebook.path`
D) `databricks.notebook.id`

> [!success]- Answer
> **Correct Answer: A**
>
> MLflow automatically sets the `mlflow.source.name` tag to the notebook path when runs are started from a Databricks notebook. Other Databricks-specific tags such as `mlflow.databricks.notebookRevisionID` and `mlflow.databricks.cluster.id` are also set automatically.

---

## Question 21 *(Medium)*

**Question**: A data scientist calls `mlflow.log_metric("accuracy", 0.92)` multiple times in a run without specifying a `step`. What happens?

A) Only the first value is retained; subsequent calls are ignored
B) The last logged value overwrites the previous values
C) All values are retained in the metric history and the last value is shown in the run summary
D) An error is raised because a metric can only be logged once per run

> [!success]- Answer
> **Correct Answer: C**
>
> MLflow stores the complete history for each metric, including all values and their timestamps. When you call `log_metric()` without a `step`, MLflow uses an auto-incrementing step. The run summary (`run.data.metrics`) shows the last logged value, but the full history is accessible via `MlflowClient().get_metric_history()`.

---

## Question 22 *(Medium)*

**Question**: A data scientist wants to log a Python dictionary as a JSON artifact. Which approach is correct?

A) `mlflow.log_artifact(my_dict)` — dicts are automatically serialized
B) Save the dict to a JSON file locally, then call `mlflow.log_artifact("config.json")`
C) `mlflow.log_param("config", str(my_dict))`
D) `mlflow.log_metric("config", my_dict)`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.log_artifact()` requires a local file path, not a Python object. The correct approach is to serialize the dictionary to a local file (e.g., using `json.dump()`) and then call `log_artifact()` with the file path. `log_param()` works for short strings but not for large dictionaries. `log_metric()` only accepts numeric values.

---

## Question 23 *(Hard)*

**Question**: A data scientist wants to programmatically delete all MLflow runs in an experiment that have `val_loss > 1.0`. Which approach is correct?

A) Use `mlflow.delete_runs()` with a filter string
B) Use `mlflow.search_runs()` to find matching run IDs, then call `MlflowClient().delete_run(run_id)` for each
C) Delete the entire experiment with `mlflow.delete_experiment(experiment_id)`
D) Use `MlflowClient().archive_runs(filter_string="metrics.val_loss > 1.0")`

> [!success]- Answer
> **Correct Answer: B**
>
> There is no `mlflow.delete_runs()` bulk function or `archive_runs()` method. The correct approach is to use `mlflow.search_runs()` to retrieve matching run IDs, then iterate and call `MlflowClient().delete_run(run_id)` for each. Deleting the entire experiment would also delete all passing runs.

---

## Question 24 *(Medium)*

**Question**: A data scientist sets `mlflow.autolog(log_models=False)`. What is the effect?

A) Autolog is completely disabled
B) Autolog captures parameters and metrics but does NOT log the model artifact
C) Autolog logs the model artifact but not parameters or metrics
D) Autolog raises a deprecation warning and falls back to default behavior

> [!success]- Answer
> **Correct Answer: B**
>
> `log_models=False` disables automatic model artifact logging within autolog, but parameters and metrics are still captured. This is useful when you want to log the model manually with custom metadata or a different artifact path, while still benefiting from automatic metric and parameter capture.

---

## Question 25 *(Hard)*

**Question**: A data scientist uses `mlflow.autolog(disable=True)` at the top of their notebook. Then they call `mlflow.sklearn.autolog()` for a specific sklearn model. What happens?

A) All autolog functionality remains disabled because the global disable takes precedence
B) Global autolog is disabled, but explicitly calling `mlflow.sklearn.autolog()` re-enables sklearn-specific autolog
C) An error is raised because autolog cannot be partially enabled
D) The global `disable=True` is overridden by the sklearn-specific call for all frameworks

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.autolog(disable=True)` disables the global autolog. However, calling a framework-specific autolog function like `mlflow.sklearn.autolog()` explicitly re-enables autolog for that specific framework only. This allows fine-grained control over which integrations are active.

---

## Question 26 *(Medium)*

**Question**: A data scientist has trained a model and wants to log it under a specific artifact subdirectory called `models/classifier` within the run. Which call is correct?

A) `mlflow.sklearn.log_model(model, artifact_path="models/classifier")`
B) `mlflow.sklearn.log_model(model, artifact_dir="models/classifier")`
C) `mlflow.log_artifact(model, "models/classifier")`
D) `mlflow.sklearn.log_model(model, path="models/classifier")`

> [!success]- Answer
> **Correct Answer: A**
>
> The `artifact_path` parameter in `log_model()` specifies the subdirectory within the run's artifact store where the model is saved. The full URI to reference this model would be `runs:/<run_id>/models/classifier`. `artifact_dir` and `path` are not valid parameter names for `log_model()`.

---

## Feature Engineering (Questions 27–41)

---

## Question 27 *(Hard)*

**Question**: A data scientist creates a `Pipeline` with a `VectorAssembler` and `LogisticRegression`. The `VectorAssembler` uses `inputCols=["age", "income"]` and `outputCol="features"`. `LogisticRegression` uses `featuresCol="features"`. What happens if the test DataFrame is missing the `income` column?

A) The pipeline silently ignores the missing column and uses only `age`
B) An exception is raised when `transform()` is called on the missing column
C) The `VectorAssembler` fills missing values with 0 by default
D) The pipeline adds a null `income` column automatically

> [!success]- Answer
> **Correct Answer: B**
>
> `VectorAssembler` raises an exception if any column specified in `inputCols` is missing from the input DataFrame at transform time. There is no automatic null-filling or column creation behavior unless `handleInvalid="keep"` is set, which handles null values in existing columns but not entirely absent columns.

---

## Question 28 *(Medium)*

**Question**: A data scientist wants to one-hot encode two categorical columns `city` and `category`. They use two `StringIndexer` stages and two `OneHotEncoder` stages. Which pipeline ordering is correct?

A) `OHE(city)` → `OHE(category)` → `SI(city)` → `SI(category)`
B) `SI(city)` → `SI(category)` → `OHE(city)` → `OHE(category)`
C) `SI(city)` → `OHE(city)` → `SI(category)` → `OHE(category)`
D) All four stages can be in any order since they operate on different columns

> [!success]- Answer
> **Correct Answer: B**
>
> While options B and C both work functionally (each `StringIndexer` must precede its corresponding `OneHotEncoder`), the typical convention is to group all `StringIndexer` stages first, then all `OneHotEncoder` stages. However, B and C are both logically correct. The key constraint is that `SI(city)` must precede `OHE(city)` and `SI(category)` must precede `OHE(category)`.

---

## Question 29 *(Hard)*

**Question**: A `CrossValidator` with `numFolds=5` is used to tune a model with a `ParamGrid` containing 6 hyperparameter combinations. How many total model training runs occur?

A) 6 (one per hyperparameter combination)
B) 5 (one per fold)
C) 30 (6 combinations × 5 folds)
D) 11 (6 combinations + 5 folds)

> [!success]- Answer
> **Correct Answer: C**
>
> `CrossValidator` trains a model for every combination of hyperparameters and every fold. With 6 parameter combinations and 5 folds, the total is 6 × 5 = 30 training runs. After selecting the best combination, a final model is optionally retrained on the full dataset.

---

## Question 30 *(Medium)*

**Question**: A data scientist fits a `Pipeline` on training data and saves it with `pipeline_model.save("/dbfs/models/pipeline")`. Later, they load it with `PipelineModel.load("/dbfs/models/pipeline")`. Which statement is true?

A) The loaded model needs to be re-fitted on new data before it can transform
B) The loaded model contains all fitted stage parameters and can transform new data immediately
C) Only the final estimator stage is saved; preprocessing stages must be re-fitted
D) The `save()` method does not persist the fitted parameters, only the stage configuration

> [!success]- Answer
> **Correct Answer: B**
>
> `PipelineModel.save()` persists all fitted stage parameters (e.g., `StringIndexerModel`'s index mapping, `StandardScalerModel`'s mean and variance, `LogisticRegressionModel`'s coefficients). When loaded, the model is fully ready to call `transform()` without any re-fitting.

---

## Question 31 *(Medium)*

**Question**: A data scientist wants to add `parallelism=4` to a `CrossValidator`. What does this parameter do?

A) It splits the training data into 4 parallel streams
B) It trains up to 4 hyperparameter-fold combinations simultaneously
C) It uses 4 threads to read data from Delta Lake
D) It limits the CrossValidator to evaluating only 4 hyperparameter combinations

> [!success]- Answer
> **Correct Answer: B**
>
> The `parallelism` parameter in `CrossValidator` (and `TrainValidationSplit`) specifies the degree of parallelism for fitting and evaluating models. Setting `parallelism=4` allows up to 4 (hyperparameter combination, fold) pairs to be trained simultaneously, which can significantly reduce wall-clock time for large parameter grids.

---

## Question 32 *(Hard)*

**Question**: A data scientist creates a Feature Store table called `customer_features` with `primary_keys=["customer_id"]`. They then try to write a DataFrame that has duplicate `customer_id` values using `mode="merge"`. What happens?

A) The duplicate rows are silently deduplicated, keeping the last row
B) An error is raised because duplicate primary keys violate the Feature Store constraint
C) All duplicate rows are written, resulting in duplicate primary key entries
D) Only the first occurrence of each duplicate `customer_id` is written

> [!success]- Answer
> **Correct Answer: B**
>
> The Databricks Feature Store enforces primary key uniqueness. Writing a DataFrame with duplicate primary key values in `mode="merge"` raises an error. You must deduplicate the DataFrame before writing to ensure each primary key appears exactly once.

---

## Question 33 *(Medium)*

**Question**: A data scientist is building a Feature Store pipeline where features are computed daily. They want to ensure that model training uses feature values from the day before each label's event. Which Feature Store capability should they use?

A) `write_table(mode="overwrite")` to replace features daily
B) Point-in-time lookups with a `timestamp_lookup_key` in `FeatureLookup`
C) Delta Lake time travel to query feature tables at a specific version
D) Scheduled `score_batch()` runs that re-score all historical entities

> [!success]- Answer
> **Correct Answer: B**
>
> Point-in-time lookups use a `timestamp_lookup_key` in `FeatureLookup` to retrieve feature values as they existed at a specific timestamp for each training example. This prevents data leakage by ensuring that only feature values available before each label's event time are used in training.

---

## Question 34 *(Medium)*

**Question**: A data scientist accidentally passes a string column directly to `OneHotEncoder` (skipping `StringIndexer`). What happens?

A) `OneHotEncoder` automatically converts strings to integer indices internally
B) An error is raised because `OneHotEncoder` expects numeric input
C) The string column is encoded as binary using ASCII values
D) `OneHotEncoder` silently ignores the column and produces a zero vector

> [!success]- Answer
> **Correct Answer: B**
>
> `OneHotEncoder` requires numeric input (specifically, integer indices produced by `StringIndexer`). Passing a string column directly raises a `SparkException` at runtime because the transformer cannot process string data. `StringIndexer` must always precede `OneHotEncoder` in the pipeline.

---

## Question 35 *(Medium)*

**Question**: A data scientist uses the Feature Store to train a model. Later, a new version of the feature table is available with additional columns. How does this affect the deployed model?

A) The deployed model automatically uses the new feature columns because it queries the live feature table
B) The deployed model is unaffected — it only uses the features specified in its `FeatureLookup` configuration at training time
C) The deployed model fails with an error because the schema has changed
D) The deployed model uses the new columns but ignores their values

> [!success]- Answer
> **Correct Answer: B**
>
> Models deployed with Feature Store integration use the `FeatureLookup` configuration captured at training time. New columns added to the feature table are ignored by existing models unless the model is retrained with an updated `FeatureLookup` that includes the new features. Schema additions do not break existing models.

---

## Question 36 *(Easy)*

**Question**: Which Spark ML evaluator class should be used with `CrossValidator` for a binary classification problem?

A) `RegressionEvaluator`
B) `MulticlassClassificationEvaluator`
C) `BinaryClassificationEvaluator`
D) `ClusteringEvaluator`

> [!success]- Answer
> **Correct Answer: C**
>
> `BinaryClassificationEvaluator` is used for binary classification problems. It supports metrics such as `areaUnderROC` (AUC) and `areaUnderPR`. `MulticlassClassificationEvaluator` supports more than two classes with metrics like accuracy and F1. `RegressionEvaluator` is for regression tasks.

---

## Question 37 *(Medium)*

**Question**: A data scientist trains a model with Feature Store features. They call `FeatureStoreClient.log_model()` instead of `mlflow.sklearn.log_model()`. What is the key advantage?

A) The model is automatically deployed to a serving endpoint
B) The model artifact includes feature lookup metadata, enabling `score_batch()` to automatically retrieve features during inference
C) The model is stored in Delta Lake instead of the MLflow artifact store
D) The model skips cross-validation and uses the full dataset for training

> [!success]- Answer
> **Correct Answer: B**
>
> When you log a model with `FeatureStoreClient.log_model()`, the feature lookup metadata (table names, primary keys, feature names) is stored alongside the model artifact. This metadata is later used by `FeatureStoreClient.score_batch()` to automatically retrieve the correct features from the Feature Store during batch inference, preventing train-serve skew.

---

## Question 38 *(Medium)*

**Question**: A data scientist applies `Normalizer(p=2.0)` to a feature vector. What transformation is applied?

A) Each feature value is divided by the maximum value in the column
B) Each row vector is scaled to have unit L2 norm
C) Each feature value is transformed to have zero mean and unit variance
D) Each feature value is scaled to the range [0, 1]

> [!success]- Answer
> **Correct Answer: B**
>
> `Normalizer` with `p=2.0` scales each **row** vector to unit L2 norm (Euclidean norm). This is row-wise normalization, not column-wise. `MinMaxScaler` scales to [0, 1], `StandardScaler` applies z-score normalization, and neither is `Normalizer`.

---

## Question 39 *(Medium)*

**Question**: A data scientist's `CrossValidator` is running slowly because the parameter grid has 100 combinations and 5 folds (500 total training runs). Which `CrossValidator` parameter reduces wall-clock time by training multiple combinations simultaneously?

A) `numFolds=2` — reduces the number of folds
B) `parallelism=8` — trains up to 8 combinations concurrently
C) `seed=42` — enables deterministic caching
D) `collectSubModels=True` — reduces memory overhead

> [!success]- Answer
> **Correct Answer: B**
>
> `parallelism` controls how many (hyperparameter combination, fold) pairs are trained concurrently. Setting `parallelism=8` can reduce wall-clock time by up to 8×. Reducing `numFolds` also reduces training runs but decreases estimate reliability. `seed` and `collectSubModels` do not affect parallelism.

---

## Question 40 *(Hard)*

**Question**: A data scientist uses `Pipeline` with stages `[indexer, encoder, assembler, classifier]`. During `pipeline.fit(train_df)`, which stages call `.fit()` vs `.transform()`?

A) All stages call `.fit()` then `.transform()` sequentially
B) Only the classifier (last stage) calls `.fit()`; all others call only `.transform()`
C) `Estimator` stages (e.g., indexer, classifier) call `.fit()` then `.transform()`; `Transformer` stages call only `.transform()`
D) All stages call `.transform()` only; `.fit()` is called once at the pipeline level

> [!success]- Answer
> **Correct Answer: C**
>
> During `Pipeline.fit()`, each stage is processed in order. `Estimator` stages (like `StringIndexer` and `RandomForestClassifier`) call `.fit(df)` to learn parameters, then `.transform(df)` to produce the output DataFrame for the next stage. `Transformer` stages (like `VectorAssembler` and `OneHotEncoderModel`) call only `.transform(df)` since they have no parameters to learn.

---

## Question 41 *(Medium)*

**Question**: A data scientist wants to retrieve feature values from a Feature Store table for a list of customer IDs to prepare a batch scoring dataset. Which function retrieves features without performing model inference?

A) `FeatureStoreClient.score_batch(model_uri, entity_df)`
B) `FeatureStoreClient.read_table(table_name)`
C) `FeatureStoreClient.create_training_set(df, feature_lookups, label=None)`
D) `FeatureStoreClient.get_table(table_name)`

> [!success]- Answer
> **Correct Answer: C**
>
> `FeatureStoreClient.create_training_set()` retrieves features from Feature Store tables by joining on primary keys, supporting point-in-time lookups if a timestamp key is provided. Setting `label=None` creates a feature dataset for scoring without a target column. `read_table()` reads the full table. `score_batch()` performs inference. `get_table()` returns table metadata only.

---

## MLflow Deployment (Questions 42–45)

---

## Question 42 *(Medium)*

**Question**: A data scientist wants to create a custom MLflow model that wraps a proprietary scoring library. Which MLflow class should they subclass?

A) `mlflow.pyfunc.BaseModel`
B) `mlflow.pyfunc.PythonModel`
C) `mlflow.sklearn.SklearnModel`
D) `mlflow.models.CustomModel`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.pyfunc.PythonModel` is the base class for custom MLflow models. By subclassing it and implementing the `predict(context, model_input)` method, data scientists can wrap any arbitrary Python logic, including proprietary libraries, as a deployable MLflow model. `BaseModel`, `SklearnModel`, and `CustomModel` do not exist in the MLflow API.

---

## Question 43 *(Hard)*

**Question**: A model is in Production in the Model Registry. A new, better version has been trained and registered as version 5. A data scientist wants to promote version 5 to Production and archive version 4. What is the correct sequence of API calls?

A) Call `transition_model_version_stage(version=5, stage="Production")` only — version 4 is automatically archived
B) Call `transition_model_version_stage(version=5, stage="Production")` with `archive_existing_versions=True`
C) Call `delete_model_version(version=4)` first, then `transition_model_version_stage(version=5, stage="Production")`
D) Call `transition_model_version_stage(version=5, stage="Staging")` first, then promote to Production in a separate call

> [!success]- Answer
> **Correct Answer: B**
>
> `MlflowClient().transition_model_version_stage(name, version, stage, archive_existing_versions=True)` promotes the specified version to Production and automatically archives all existing Production versions in a single call. This is the recommended approach for clean Production transitions.

---

## Question 44 *(Medium)*

**Question**: A data scientist loads a model using `mlflow.pyfunc.load_model("models:/my-model/Production")` and calls `model.predict(df)`. The model was trained with scikit-learn. What type does `df` need to be?

A) A Spark DataFrame
B) A pandas DataFrame or numpy array (inputs compatible with the sklearn model's `predict()`)
C) A Python list of dictionaries
D) A Delta Lake table path string

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.pyfunc.load_model()` returns a `PyFuncModel` whose `predict()` method accepts pandas DataFrames or numpy arrays — the same inputs that the underlying sklearn model accepts. For Spark-based distributed scoring, use `mlflow.pyfunc.spark_udf()` instead.

---

## Question 45 *(Medium)*

**Question**: A data scientist registers the same model artifact to two different registered model names: `model-v1` and `model-v2`. Both point to `runs:/abc123/model`. Which statement is true?

A) This raises an error — a run artifact can only be registered to one model name
B) Both registrations succeed, each creating version 1 of their respective model names
C) Only the first registration succeeds; the second is rejected as a duplicate
D) The second registration automatically increments the version on `model-v1`

> [!success]- Answer
> **Correct Answer: B**
>
> MLflow allows registering the same run artifact to multiple model names. Each registration is independent and creates version 1 of the respective registered model. This is useful for A/B testing or maintaining separate staging and production model lineages from the same training run.

---

**End of Mock Exam 2 — 45 Questions**

[← Back to Mock Exam 2 Instructions](./README.md) | [← Back to Resources](../README.md)

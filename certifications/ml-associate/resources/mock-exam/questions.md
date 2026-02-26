---
title: Mock Exam 1 Questions — ML Associate
type: mock-exam-questions
tags: [ml-associate, mock-exam]
status: published
---

# Mock Exam 1 — Questions

Set a 90-minute timer and answer all 45 questions before checking answers.

[← Back to Mock Exam Instructions](./README.md)

---

## Databricks ML (Questions 1–13)

---

## Question 1 *(Easy)*

**Question**: Which pre-installed library distinguishes Databricks Runtime for Machine Learning from the standard Databricks Runtime?

A) Apache Spark
B) Delta Lake connector
C) MLflow
D) JDBC driver

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Runtime for ML pre-installs ML-specific libraries including MLflow, TensorFlow, PyTorch, and scikit-learn. Apache Spark and Delta Lake are included in the standard runtime. JDBC drivers are available in both runtimes.

---

## Question 2 *(Medium)*

**Question**: A data scientist is prototyping a model using pandas and scikit-learn on a 200 MB dataset. Which cluster type minimizes cost while supporting this workload?

A) Multi-node cluster with 2 workers
B) Single-node cluster
C) High-concurrency cluster
D) GPU-enabled multi-node cluster

> [!success]- Answer
> **Correct Answer: B**
>
> A single-node cluster is optimal for pandas and scikit-learn workloads because these libraries do not distribute across Spark workers. Adding worker nodes increases cost without improving performance for non-distributed workloads.

---

## Question 3 *(Easy)*

**Question**: What does Databricks AutoML produce after completing a classification experiment?

A) A single deployable model binary
B) An MLflow experiment with one run per algorithm trial, plus a generated best-model notebook
C) A Delta table of feature importances
D) A REST endpoint ready for production traffic

> [!success]- Answer
> **Correct Answer: B**
>
> AutoML creates an MLflow experiment and logs each algorithm trial as a separate run. It also generates an editable Python notebook for the best-performing model that the data scientist can customize. It does not automatically deploy the model or create Delta tables.

---

## Question 4 *(Easy)*

**Question**: A data scientist wants to use AutoML to forecast future sales. Which AutoML task type should they select?

A) Regression
B) Classification
C) Forecasting
D) Time Series

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks AutoML supports three task types: classification, regression, and forecasting. Forecasting is specifically designed for time-series prediction problems. "Time Series" is not a separate AutoML task type.

---

## Question 5 *(Medium)*

**Question**: An administrator wants to enforce that all ML team clusters use a specific instance type for cost control. What is the correct mechanism?

A) Create a Unity Catalog data policy
B) Define a cluster policy with fixed node type settings
C) Set a workspace-level spending limit in the billing console
D) Use a Databricks Workflow job with restricted compute settings

> [!success]- Answer
> **Correct Answer: B**
>
> Cluster policies allow administrators to enforce cluster configuration constraints such as fixed or allowlisted node types, maximum cluster size, and auto-termination settings. Policies are enforced at the platform level when users create or edit clusters.

---

## Question 6 *(Easy)*

**Question**: Which Databricks Runtime is required to use GPU-accelerated deep learning with CUDA?

A) Databricks Runtime (standard)
B) Databricks Runtime ML
C) Databricks Runtime ML GPU
D) Databricks Runtime Photon

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Runtime ML GPU includes CUDA, cuDNN, NCCL, and GPU-optimized versions of PyTorch and TensorFlow. The standard ML Runtime does not include GPU drivers or CUDA libraries.

---

## Question 7 *(Easy)*

**Question**: A data scientist stores shared feature engineering functions in a notebook. What magic command runs that notebook and imports its variables into the current notebook?

A) `%import ./shared_utils`
B) `%run ./shared_utils`
C) `%load ./shared_utils`
D) `%source ./shared_utils`

> [!success]- Answer
> **Correct Answer: B**
>
> `%run ./notebook_path` executes a notebook in the context of the current notebook, making all defined functions and variables available in the current scope. The other magic commands (`%import`, `%load`, `%source`) are not valid Databricks directives.

---

## Question 8 *(Medium)*

**Question**: A data scientist runs AutoML on a regression problem. After the experiment completes, they want to understand why the best model performed well. What does AutoML provide for this purpose?

A) A Shapley value explanation for each training row
B) A generated notebook containing training code with built-in feature importance analysis
C) A PDF report summarizing the model's performance
D) An automatic A/B test comparing the best model to the baseline

> [!success]- Answer
> **Correct Answer: B**
>
> AutoML generates an editable notebook for the best model that includes training code and often integrates SHAP-based feature importance analysis. This gives data scientists a starting point to understand the model and customize it further.

---

## Question 9 *(Medium)*

**Question**: A platform team wants to prevent users from creating clusters with more than 10 workers. Which cluster policy attribute achieves this?

A) Set `autoscale.max_workers` to a fixed value of 10
B) Set `num_workers` with `maxValue: 10`
C) Set `worker_limit: 10` in the workspace settings
D) Create a Unity Catalog group policy restricting cluster size

> [!success]- Answer
> **Correct Answer: B**
>
> Cluster policies use JSON policy definitions where numeric parameters can have `maxValue` constraints. Setting `num_workers` with `maxValue: 10` prevents users from creating clusters with more than 10 workers. Unity Catalog governs data access, not cluster configuration.

---

## Question 10 *(Easy)*

**Question**: Which feature of Databricks Repos enables collaborative development on ML model code?

A) Automatic conflict resolution using MLflow
B) Git-based version control with branch, commit, and pull request support
C) Automated notebook execution on push
D) Shared feature store table locking

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Repos integrates with Git providers and supports standard Git operations including branching, committing, pulling, pushing, and pull requests. This enables collaborative development workflows for ML code in notebooks and Python files.

---

## Question 11 *(Medium)*

**Question**: A data scientist wants to train a PyTorch model on image data. Which cluster configuration is most appropriate?

A) Single-node cluster with no GPU
B) Multi-node CPU cluster with autoscaling
C) Single-node or multi-node cluster with GPU instances, using Databricks Runtime ML GPU
D) Standard Databricks Runtime on a general-purpose cluster

> [!success]- Answer
> **Correct Answer: C**
>
> PyTorch image model training benefits significantly from GPU acceleration. Databricks Runtime ML GPU provides the necessary CUDA libraries and PyTorch GPU support. The number of nodes depends on whether distributed training is required.

---

## Question 12 *(Medium)*

**Question**: What is the primary benefit of using Databricks AutoML over manually training multiple models?

A) AutoML models cannot be overfitted because they use ensemble methods
B) AutoML eliminates the need to write any Python code for the entire ML workflow
C) AutoML reduces the time to a baseline model by automatically trying multiple algorithms and hyperparameters
D) AutoML automatically deploys models to production without human review

> [!success]- Answer
> **Correct Answer: C**
>
> AutoML accelerates the path to a baseline model by systematically trying multiple algorithms and hyperparameter combinations, logging all results to MLflow. It does not eliminate coding entirely (data scientists still customize the generated notebooks), it can overfit on small datasets, and it does not automatically deploy to production.

---

## Question 13 *(Easy)*

**Question**: A data scientist is using Databricks Repos and wants to create a new feature branch before making changes. Which operation should they perform in the Repos UI?

A) Create a new MLflow experiment with the branch name
B) Click "Create Branch" in the Repos panel and name the branch
C) Clone the repository to a new folder
D) Tag the current commit with the feature name

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Repos provides UI controls for standard Git operations including creating branches. The data scientist should use "Create Branch" to start a new feature branch. MLflow experiments are unrelated to Git branches.

---

## ML Workflows (Questions 14–26)

---

## Question 14 *(Easy)*

**Question**: What is the correct way to log a hyperparameter called `learning_rate` with value `0.01` to the current MLflow run?

A) `mlflow.log_metric("learning_rate", 0.01)`
B) `mlflow.log_param("learning_rate", 0.01)`
C) `mlflow.log_artifact("learning_rate", 0.01)`
D) `mlflow.set_tag("learning_rate", 0.01)`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.log_param()` is used for hyperparameters and configuration values (typically strings or numbers that describe how the model was configured). `mlflow.log_metric()` is for numeric performance measurements that can be tracked over time. `log_artifact()` saves files. `set_tag()` logs string metadata.

---

## Question 15 *(Easy)*

**Question**: A data scientist calls `mlflow.autolog()` at the start of a notebook and then trains a scikit-learn `RandomForestClassifier`. What is automatically logged?

A) Only the trained model artifact
B) The model's feature importances as a custom metric
C) Parameters (n_estimators, max_depth, etc.), metrics (accuracy, f1, etc.), and the model artifact
D) Parameters only — metrics must still be logged manually

> [!success]- Answer
> **Correct Answer: C**
>
> `mlflow.autolog()` with scikit-learn automatically captures estimator parameters (from `get_params()`), training metrics (via cross-validation if applicable), and logs the trained model as an artifact. Feature importances are sometimes logged as artifacts depending on the estimator type.

---

## Question 16 *(Easy)*

**Question**: A data scientist wants all runs in their notebook to be grouped under an experiment named `churn-model-v3`. Which code achieves this?

A) `mlflow.start_run(experiment_name="churn-model-v3")`
B) `mlflow.set_experiment("churn-model-v3")`
C) `mlflow.create_experiment("churn-model-v3")`
D) `mlflow.log_tag("experiment", "churn-model-v3")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.set_experiment(name)` sets the active experiment so all subsequent `start_run()` calls log to that experiment. `create_experiment()` creates a new experiment but does not set it as active. `start_run()` does not accept an `experiment_name` parameter.

---

## Question 17 *(Medium)*

**Question**: A data scientist wants to find all runs in experiment ID `123` where `val_loss` is less than `0.5`. Which `search_runs` call is correct?

A) `mlflow.search_runs(experiment_ids=["123"], filter_string="metrics.val_loss < 0.5")`
B) `mlflow.search_runs(experiment_id="123", filter="val_loss < 0.5")`
C) `mlflow.search_runs("123", metrics={"val_loss": "<0.5"})`
D) `mlflow.find_runs(experiment_ids=["123"], filter_string="metric.val_loss < 0.5")`

> [!success]- Answer
> **Correct Answer: A**
>
> `mlflow.search_runs()` accepts `experiment_ids` (a list) and `filter_string` using `metrics.` prefix. `experiment_id` (singular) is not a valid parameter. `metrics` as a dictionary and `find_runs` do not exist in the MLflow Python API. The prefix must be `metrics.` (plural), not `metric.`.

---

## Question 18 *(Medium)*

**Question**: A data scientist logs a metric `accuracy` at step 1 (0.72), step 2 (0.85), and step 3 (0.91) within a single run. What does `mlflow.get_run(run_id).data.metrics["accuracy"]` return?

A) 0.72 (first logged value)
B) A list of all three values: [0.72, 0.85, 0.91]
C) 0.91 (last logged value)
D) The average: 0.827

> [!success]- Answer
> **Correct Answer: C**
>
> `run.data.metrics` returns a dictionary with the **last logged value** for each metric. To retrieve the full metric history, use `MlflowClient().get_metric_history(run_id, metric_key)`, which returns all logged values with their steps and timestamps.

---

## Question 19 *(Easy)*

**Question**: Which MLflow function saves a local file called `report.html` to the current run's artifact store?

A) `mlflow.log_metric("report", "report.html")`
B) `mlflow.log_artifact("report.html")`
C) `mlflow.log_param("report_path", "report.html")`
D) `mlflow.upload("report.html")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.log_artifact(local_path)` uploads a local file to the artifact store associated with the current run. Metrics are numeric values, params are string key-value configuration, and `mlflow.upload()` does not exist.

---

## Question 20 *(Medium)*

**Question**: A data scientist runs a hyperparameter sweep and wants each trial to be a child of a single parent run. Which code correctly creates a child run?

A) `mlflow.start_run(parent=active_run_id)`
B) `mlflow.start_run(nested=True)`
C) `mlflow.start_child_run(parent_run_id=active_run_id)`
D) `MlflowClient().create_run(parent_run_id=active_run_id)`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.start_run(nested=True)` creates a child run within the currently active run. The parent run must already be active when this is called. `start_child_run()` does not exist. `MlflowClient().create_run()` does not accept a `parent_run_id` parameter in this form.

---

## Question 21 *(Easy)*

**Question**: A data scientist logs a directory of plots called `./plots/` as artifacts. Which function is correct?

A) `mlflow.log_artifact("./plots/")`
B) `mlflow.log_artifacts("./plots/")`
C) `mlflow.log_artifact("./plots/*")`
D) `mlflow.log_file_directory("./plots/")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.log_artifacts(local_dir)` uploads all files in a local directory to the artifact store. `mlflow.log_artifact(path)` uploads a single file. Glob patterns are not supported. `log_file_directory()` does not exist.

---

## Question 22 *(Easy)*

**Question**: What is the best way to compare the `val_accuracy` of 20 MLflow runs from the same experiment in the Databricks UI?

A) Open each run individually and note the metric value
B) Export all runs to a CSV and sort in Excel
C) On the Experiments page, select all runs and click "Compare" to view parallel coordinates and scatter plots
D) Use the Model Registry to compare version metrics

> [!success]- Answer
> **Correct Answer: C**
>
> The MLflow Experiments page allows selecting multiple runs and clicking "Compare" to generate visualizations including parallel coordinate plots, scatter plots, contour plots, and metric comparison tables. This is the intended workflow for comparing runs within an experiment.

---

## Question 23 *(Medium)*

**Question**: A data scientist uses `mlflow.autolog()` and also manually calls `mlflow.log_metric("custom_score", 0.95)`. What is the result?

A) An error is raised because manual logging conflicts with autolog
B) The custom metric is logged in addition to the automatically logged metrics
C) The custom metric overwrites the autolog metrics
D) Autolog is disabled for the rest of the run once manual logging starts

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.autolog()` and manual logging are fully compatible. Autolog captures framework-generated metrics and parameters, while manual logging adds any additional custom values. Both sets of data are stored in the same run without conflict.

---

## Question 24 *(Easy)*

**Question**: A data scientist calls `mlflow.log_metric("loss", 0.3, step=10)`. What does the `step` parameter represent?

A) The number of seconds elapsed since training started
B) The training epoch or iteration number associated with this metric value
C) The version of the metric schema being used
D) The number of times this metric has been logged in the run

> [!success]- Answer
> **Correct Answer: B**
>
> The `step` parameter allows associating a metric value with a specific training step, epoch, or iteration. This enables plotting metric curves over time in the MLflow UI. It is an optional integer that defaults to 0 if not provided.

---

## Question 25 *(Easy)*

**Question**: Which `mlflow.start_run()` parameter allows providing a human-readable name for the run?

A) `run_name`
B) `name`
C) `description`
D) `run_label`

> [!success]- Answer
> **Correct Answer: A**
>
> `mlflow.start_run(run_name="my-experiment-v1")` assigns a human-readable name to the run. This name appears in the MLflow UI alongside the run ID. The other parameter names (`name`, `description`, `run_label`) are not valid parameters for `start_run()`.

---

## Question 26 *(Medium)*

**Question**: A data scientist retrieves a run object with `run = mlflow.get_run(run_id)`. How do they access the value of a logged parameter named `max_depth`?

A) `run.params["max_depth"]`
B) `run.data.params["max_depth"]`
C) `run.metrics["max_depth"]`
D) `run.data["params"]["max_depth"]`

> [!success]- Answer
> **Correct Answer: B**
>
> The `Run` object returned by `mlflow.get_run()` has a `.data` attribute of type `RunData`, which has `.params`, `.metrics`, and `.tags` dictionaries. The correct access pattern is `run.data.params["max_depth"]`.

---

## Feature Engineering (Questions 27–41)

---

## Question 27 *(Easy)*

**Question**: Which `VectorAssembler` parameter specifies the list of input columns to combine into a single feature vector?

A) `inputCol`
B) `inputCols`
C) `featureCols`
D) `columns`

> [!success]- Answer
> **Correct Answer: B**
>
> `VectorAssembler` uses `inputCols` (plural) because it accepts a list of column names. Using `inputCol` (singular) will raise a `TypeError` because `inputCol` is a single-value parameter used by transformers like `StringIndexer` that operate on one column at a time.

---

## Question 28 *(Medium)*

**Question**: A data scientist has a `Pipeline` with stages: `StringIndexer`, `VectorAssembler`, `RandomForestClassifier`. They call `pipeline.fit(train_df)`. In what order do the stages execute?

A) `RandomForestClassifier` → `VectorAssembler` → `StringIndexer`
B) All stages execute simultaneously in parallel
C) `StringIndexer` → `VectorAssembler` → `RandomForestClassifier`
D) The order depends on which stages are `Estimator` vs `Transformer`

> [!success]- Answer
> **Correct Answer: C**
>
> A `Pipeline` executes stages sequentially in the order they are listed. During `fit()`, each stage's `fit()` (for Estimators) or `transform()` (for Transformers) is called in order, passing the transformed DataFrame to the next stage.

---

## Question 29 *(Easy)*

**Question**: After calling `pipeline_model = pipeline.fit(train_df)`, a data scientist calls `predictions = pipeline_model.transform(test_df)`. What does `predictions` contain?

A) A trained `PipelineModel` object
B) The `test_df` with new columns added by each stage's transformation
C) Only the final model's predictions column
D) A dictionary of metric values from the model evaluation

> [!success]- Answer
> **Correct Answer: B**
>
> `PipelineModel.transform(df)` passes the DataFrame through each stage's `transform()` method sequentially. The result is the input DataFrame with additional columns appended by each stage (e.g., `StringIndexer` adds an index column, `VectorAssembler` adds a features column, and the classifier adds `rawPrediction`, `probability`, and `prediction` columns).

---

## Question 30 *(Easy)*

**Question**: What is the default number of folds used by `CrossValidator` if `numFolds` is not specified?

A) 5
B) 10
C) 2
D) 3

> [!success]- Answer
> **Correct Answer: D**
>
> `CrossValidator` defaults to `numFolds=3`. This means the training data is split into 3 equal folds, and for each hyperparameter combination in the grid, the model is trained on 2 folds and evaluated on the remaining 1 fold, repeating 3 times.

---

## Question 31 *(Medium)*

**Question**: A data scientist wants to search over `maxDepth` values of 5 and 10 for a `DecisionTreeClassifier` named `dt`. Which code correctly adds this to the parameter grid?

A) `ParamGridBuilder().addGrid("maxDepth", [5, 10]).build()`
B) `ParamGridBuilder().addGrid(dt.maxDepth, [5, 10]).build()`
C) `ParamGridBuilder(dt.maxDepth=[5, 10]).build()`
D) `ParamGridBuilder().add(dt, "maxDepth", [5, 10]).build()`

> [!success]- Answer
> **Correct Answer: B**
>
> `ParamGridBuilder().addGrid(estimator.param, [values]).build()` is the correct syntax. The first argument to `addGrid` must be the actual `Param` object from the estimator (e.g., `dt.maxDepth`), not a string. The constructor does not accept keyword arguments.

---

## Question 32 *(Medium)*

**Question**: What is the key advantage of `CrossValidator` over `TrainValidationSplit` for hyperparameter tuning?

A) `CrossValidator` is always faster because it uses more CPU cores
B) `CrossValidator` provides more reliable performance estimates by using all data for both training and validation across multiple folds
C) `CrossValidator` automatically selects the best algorithm, not just the best hyperparameters
D) `CrossValidator` requires less memory because it processes one fold at a time

> [!success]- Answer
> **Correct Answer: B**
>
> `CrossValidator` uses k-fold cross-validation, ensuring every data point is used for validation exactly once across k experiments. This produces more reliable performance estimates than `TrainValidationSplit`, which uses a single random split and may produce high-variance estimates on small datasets.

---

## Question 33 *(Easy)*

**Question**: What error occurs if you call `FeatureStoreClient.create_feature_table()` without the `primary_keys` parameter?

A) The table is created with a default UUID primary key
B) A `ValueError` is raised because `primary_keys` is required
C) The table is created successfully with no primary key
D) A `DeprecationWarning` is shown but the table is still created

> [!success]- Answer
> **Correct Answer: B**
>
> `primary_keys` is a required parameter for `create_feature_table()`. The Feature Store needs primary keys to uniquely identify rows for updates, point-in-time lookups, and online store publishing. Omitting it raises a `ValueError`.

---

## Question 34 *(Medium)*

**Question**: A data engineer wants to add new rows and update existing rows in a Feature Store table based on primary key matches. Which `write_table()` mode should they use?

A) `mode="append"`
B) `mode="overwrite"`
C) `mode="merge"`
D) `mode="upsert"`

> [!success]- Answer
> **Correct Answer: C**
>
> `mode="merge"` performs an upsert: rows with matching primary keys are updated, and new rows are inserted. `mode="overwrite"` replaces all existing data. `mode="append"` is not a valid option for Feature Store `write_table()`. `mode="upsert"` is not a valid mode name.

---

## Question 35 *(Medium)*

**Question**: A data scientist trained a model using Feature Store features and wants to score a new batch of customer IDs. Which function performs offline batch inference while automatically retrieving features from the Feature Store?

A) `mlflow.pyfunc.load_model(model_uri).predict(entity_df)`
B) `FeatureStoreClient.score_batch(model_uri, entity_df)`
C) `FeatureStoreClient.get_table(table_name).join(entity_df)`
D) `mlflow.pyfunc.spark_udf(spark, model_uri)(entity_df)`

> [!success]- Answer
> **Correct Answer: B**
>
> `FeatureStoreClient.score_batch(model_uri, df)` automatically retrieves features specified in the model's `FeatureLookup` configuration, joins them with the entity DataFrame, and applies the model. This ensures serving uses the same feature definitions as training, preventing train-serve skew.

---

## Question 36 *(Medium)*

**Question**: Why does the Databricks Feature Store provide point-in-time feature lookups?

A) To allow features to be queried faster using time-indexed partitioning
B) To prevent data leakage by ensuring training labels are only joined with feature values that existed before the label's event time
C) To enable automatic feature refresh on a schedule
D) To support real-time feature computation with sub-second latency

> [!success]- Answer
> **Correct Answer: B**
>
> Point-in-time lookups prevent temporal data leakage. When training a model, each training example's features should reflect what was known at the time the label was generated. Without point-in-time lookups, future feature values could leak into the training data, leading to optimistic performance estimates.

---

## Question 37 *(Medium)*

**Question**: Which class is an `Estimator` in Spark ML (requiring `fit()` to produce a fitted object)?

A) `VectorAssembler`
B) `Bucketizer`
C) `Normalizer`
D) `MinMaxScaler`

> [!success]- Answer
> **Correct Answer: D**
>
> `MinMaxScaler` is an `Estimator` that learns the minimum and maximum values of each feature during `fit()`. `VectorAssembler`, `Bucketizer`, and `Normalizer` are `Transformer` classes that apply deterministic transformations without learning from data.

---

## Question 38 *(Hard)*

**Question**: A Pipeline contains a `CrossValidator` as its last stage. Which statement is true?

A) `CrossValidator` cannot be used inside a `Pipeline`
B) The `CrossValidator` is only applied to the last stage's estimator
C) The entire preceding pipeline (all stages) is treated as the estimator inside `CrossValidator`
D) `CrossValidator` automatically wraps all prior pipeline stages

> [!success]- Answer
> **Correct Answer: C**
>
> When the estimator passed to `CrossValidator` is a `Pipeline`, the entire pipeline (all stages) is fit and evaluated for each hyperparameter combination in each fold. This ensures that preprocessing stages fit only on training data within each fold, preventing data leakage.

---

## Question 39 *(Medium)*

**Question**: A data scientist uses `StringIndexer` with `handleInvalid="keep"`. What happens when the transformer encounters a category during test inference that was not seen during training?

A) An exception is raised and the pipeline halts
B) The unseen category is mapped to index 0 (the most frequent category)
C) The unseen category is assigned a new index at the end of the index range
D) The row containing the unseen category is dropped from the output

> [!success]- Answer
> **Correct Answer: C**
>
> `handleInvalid="keep"` instructs `StringIndexer` to assign unseen categories a reserved index equal to the number of distinct training categories (i.e., one beyond the existing range). This allows inference to continue without errors. The alternative `handleInvalid="error"` raises an exception, and `handleInvalid="skip"` drops the row.

---

## Question 40 *(Easy)*

**Question**: Which parameter in `FeatureLookup` specifies how the training DataFrame joins to the feature table?

A) `join_key`
B) `primary_key`
C) `lookup_key`
D) `entity_key`

> [!success]- Answer
> **Correct Answer: C**
>
> `lookup_key` in `FeatureLookup` specifies the column(s) in the training DataFrame that map to the feature table's primary key columns. This is used to join features to training labels at the correct row level.

---

## Question 41 *(Easy)*

**Question**: A data scientist wants to apply feature scaling so that each numerical feature has zero mean and unit variance. Which Spark ML transformer should they use?

A) `Normalizer`
B) `StandardScaler`
C) `MinMaxScaler`
D) `MaxAbsScaler`

> [!success]- Answer
> **Correct Answer: B**
>
> `StandardScaler` standardizes features by removing the mean and scaling to unit variance (z-score normalization). `Normalizer` scales rows to unit norm (not column-wise). `MinMaxScaler` scales to a [0, 1] range. `MaxAbsScaler` scales by the maximum absolute value.

---

## MLflow Deployment (Questions 42–45)

---

## Question 42 *(Easy)*

**Question**: A data scientist has run_id `xyz789` and logged a model with `artifact_path="classifier"`. Which URI registers this model to the registry as `purchase-predictor`?

A) `mlflow.register_model("classifier/xyz789", "purchase-predictor")`
B) `mlflow.register_model("runs:/xyz789/classifier", "purchase-predictor")`
C) `mlflow.register_model("artifacts:/xyz789/classifier", "purchase-predictor")`
D) `mlflow.register_model("models:/purchase-predictor/None", "purchase-predictor")`

> [!success]- Answer
> **Correct Answer: B**
>
> The correct URI format is `runs:/<run_id>/<artifact_path>`. The artifact path matches the `artifact_path` argument used in `log_model()`. The `artifacts:/` and `models:/` URI schemes serve different purposes and are not valid for `register_model()`.

---

## Question 43 *(Medium)*

**Question**: A data scientist wants to move model version 5 of `revenue-predictor` to `Production`. Which code is correct?

A) `mlflow.promote_model("revenue-predictor", 5, "Production")`
B)

```python
client = MlflowClient()
client.transition_model_version_stage(
    name="revenue-predictor",
    version=5,
    stage="Production"
)
```

C) `mlflow.set_model_stage("revenue-predictor", version=5, stage="Production")`
D) `mlflow.register_model("models:/revenue-predictor/Staging", "revenue-predictor")`

> [!success]- Answer
> **Correct Answer: B**
>
> Stage transitions require `MlflowClient.transition_model_version_stage()`. The `mlflow.*` namespace does not have a `promote_model()` or `set_model_stage()` function. `register_model()` creates a new version, not a stage transition.

---

## Question 44 *(Medium)*

**Question**: A data scientist wants to perform distributed batch scoring of 50 million rows using a registered MLflow model. Which approach is correct?

A)

```python
model = mlflow.pyfunc.load_model("models:/mymodel/Production")
result = model.predict(spark_df.toPandas())
```

B)

```python
predict_udf = mlflow.pyfunc.spark_udf(spark, "models:/mymodel/Production")
result_df = spark_df.withColumn("prediction", predict_udf(*feature_cols))
```

C)

```python
import requests
result = requests.post(serving_endpoint_url, json=spark_df.toPandas().to_dict())
```

D)

```python
model = mlflow.sklearn.load_model("models:/mymodel/Production")
result = spark_df.rdd.map(model.predict).collect()
```

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.pyfunc.spark_udf()` creates a Spark UDF that enables distributed scoring across all workers. Calling `.toPandas()` on 50 million rows collects all data to the driver, which causes out-of-memory errors. Sending 50 million rows via HTTP is not feasible. Using `rdd.map()` with a non-serializable sklearn model will raise a serialization error.

---

## Question 45 *(Easy)*

**Question**: Which is NOT a valid stage in the MLflow Model Registry lifecycle?

A) None
B) Staging
C) Production
D) Deprecated

> [!success]- Answer
> **Correct Answer: D**
>
> The valid Model Registry stages are: **None** (newly registered), **Staging** (under evaluation), **Production** (serving live traffic), and **Archived** (retired). "Deprecated" is not a valid stage. Use "Archived" to retire a model version.

---

**End of Mock Exam 1 — 45 Questions**

[← Back to Mock Exam Instructions](./README.md) | [Try Mock Exam 2 →](../mock-exam-2/README.md)

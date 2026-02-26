---
title: Practice Questions — ML Workflows
type: practice-questions
tags: [ml-associate, practice-questions, mlflow, ml-workflows]
status: published
---

# Practice Questions — ML Workflows (Domain 2)

13 questions covering MLflow tracking, autolog, experiment organization, and run management.

[← Back to Practice Questions](./README.md) | [Next: Feature Engineering →](./03-feature-engineering.md)

---

## Question 1: Start Run Context Manager

**Question** *(Easy)*: A data scientist writes the following code. What happens when the `with` block exits normally?

```python
with mlflow.start_run():
    mlflow.log_param("alpha", 0.5)
    mlflow.log_metric("rmse", 1.23)
```

A) The run stays open until `mlflow.end_run()` is called manually
B) The run is automatically ended and its status is set to FINISHED
C) The run is automatically ended and its status is set to FAILED
D) The run parameters and metrics are discarded

> [!success]- Answer
> **Correct Answer: B**
>
> When used as a context manager, `mlflow.start_run()` automatically calls `mlflow.end_run()` when the `with` block exits. If the block exits normally (no exception), the run status is set to FINISHED. If an exception is raised, the run status is set to FAILED.

---

## Question 2: log_metric vs log_metrics

**Question** *(Easy)*: A data scientist wants to log three metrics at once — `accuracy`, `precision`, and `recall` — without writing three separate log calls. Which function signature is correct?

A) `mlflow.log_metric({"accuracy": 0.9, "precision": 0.85, "recall": 0.88})`
B) `mlflow.log_metrics({"accuracy": 0.9, "precision": 0.85, "recall": 0.88})`
C) `mlflow.log_metrics(accuracy=0.9, precision=0.85, recall=0.88)`
D) `mlflow.log_metric("accuracy", "precision", "recall", [0.9, 0.85, 0.88])`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.log_metrics()` (plural) accepts a dictionary of metric name to numeric value. `mlflow.log_metric()` (singular) accepts a single name-value pair. Neither function accepts keyword arguments or positional lists for multiple metrics.

---

## Question 3: Autolog Supported Frameworks

**Question** *(Medium)*: A data scientist calls `mlflow.autolog()` at the start of their notebook. Which of the following frameworks will have its parameters and metrics automatically logged?

A) scikit-learn only
B) scikit-learn and XGBoost only
C) scikit-learn, XGBoost, LightGBM, and PyTorch Lightning
D) All Python libraries that call `fit()` on a model object

> [!success]- Answer
> **Correct Answer: C**
>
> `mlflow.autolog()` supports multiple frameworks including scikit-learn, XGBoost, LightGBM, PyTorch Lightning, TensorFlow/Keras, Spark ML, and statsmodels. It does not automatically log all Python libraries — only those with built-in MLflow integration. Calling `mlflow.autolog()` enables all supported integrations at once.

---

## Question 4: Autolog and Custom Metrics

**Question** *(Medium)*: A data scientist enables `mlflow.autolog()` and trains a scikit-learn model. They also compute a custom business metric called `revenue_impact`. Will `revenue_impact` be logged automatically?

A) Yes, autolog captures all variables assigned in the training script
B) Yes, autolog logs all numeric values computed during training
C) No, autolog only logs metrics defined by the framework (e.g., accuracy, loss); custom metrics must be logged with `mlflow.log_metric()`
D) No, custom metrics cannot be logged in the same run as autolog metrics

> [!success]- Answer
> **Correct Answer: C**
>
> `mlflow.autolog()` only captures metrics, parameters, and artifacts that the underlying framework itself produces (e.g., sklearn's cross-validation scores). Custom business metrics like `revenue_impact` must be explicitly logged with `mlflow.log_metric("revenue_impact", value)`. Both autolog and manual logging can coexist in the same run.

---

## Question 5: search_runs Filter Syntax

**Question** *(Medium)*: A data scientist wants to find all MLflow runs where the `test_accuracy` metric is greater than 0.90. Which `mlflow.search_runs()` call is correct?

A) `mlflow.search_runs(filter_string="metrics.test_accuracy > 0.90")`
B) `mlflow.search_runs(filter_string="metric.test_accuracy > 0.90")`
C) `mlflow.search_runs(filter="test_accuracy > 0.90")`
D) `mlflow.search_runs(metrics={"test_accuracy": ">0.90"})`

> [!success]- Answer
> **Correct Answer: A**
>
> The correct filter string prefix for metrics is `metrics.` (plural). The filter string syntax uses dot notation: `metrics.<name>`, `params.<name>`, or `tags.<name>`. Using the singular `metric.` or passing a plain column name without the prefix will raise an error or return no results.

---

## Question 6: log_artifact Usage

**Question** *(Easy)*: A data scientist wants to save a confusion matrix image file (`confusion_matrix.png`) as part of their MLflow run. Which code is correct?

A) `mlflow.log_metric("confusion_matrix", "confusion_matrix.png")`
B) `mlflow.log_artifact("confusion_matrix.png")`
C) `mlflow.log_param("confusion_matrix", "confusion_matrix.png")`
D) `mlflow.save_artifact("confusion_matrix.png")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.log_artifact(local_path)` uploads a local file to the run's artifact store. Metrics are numeric values, parameters are string key-value pairs, and `save_artifact` is not a valid MLflow function.

---

## Question 7: Experiment vs Run

**Question** *(Easy)*: What is the relationship between an MLflow experiment and an MLflow run?

A) An experiment is a single training attempt; a run is a collection of experiments
B) An experiment is a logical container for runs; a run is a single training attempt with its own parameters, metrics, and artifacts
C) An experiment and a run are the same concept with different names
D) A run contains multiple experiments, each representing a different dataset

> [!success]- Answer
> **Correct Answer: B**
>
> In MLflow, an **experiment** is a named container that groups related runs. A **run** represents a single execution of training code, capturing parameters, metrics, artifacts, and metadata. One experiment can contain many runs, making it easy to compare different model configurations.

---

## Question 8: Nested Runs

**Question** *(Medium)*: A data scientist is running a hyperparameter sweep and wants to create a parent run that tracks the sweep, with each individual trial as a child run. Which code correctly creates a child run inside an existing parent run?

A) `mlflow.start_run(parent=True)`
B) `mlflow.start_run(nested=True)`
C) `mlflow.start_child_run()`
D) `mlflow.start_run(run_type="child")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.start_run(nested=True)` creates a child run within the currently active parent run. There is no `parent=True`, `start_child_run()`, or `run_type` parameter in the MLflow API.

---

## Question 9: log_artifacts for a Directory

**Question** *(Easy)*: A data scientist generates multiple output files in a local directory called `./outputs/` and wants to log all of them as artifacts. Which function should they use?

A) `mlflow.log_artifact("./outputs/")`
B) `mlflow.log_artifacts("./outputs/")`
C) `mlflow.log_artifact("./outputs/*")`
D) `mlflow.log_model("./outputs/")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.log_artifacts(local_dir)` (plural) uploads all files in a local directory to the artifact store. `mlflow.log_artifact(local_path)` (singular) uploads a single file. Glob patterns are not supported, and `log_model` is for ML model objects, not arbitrary files.

---

## Question 10: Workspace vs Model Experiments

**Question** *(Medium)*: When a data scientist registers a model in the MLflow Model Registry, which type of experiment is automatically associated with model versions?

A) Workspace experiment
B) Model experiment
C) Registry experiment
D) Production experiment

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks MLflow supports two types of experiments: workspace experiments (created manually by users in the workspace) and model experiments (automatically created for each registered model in the Model Registry). Model experiments store runs associated with registered model versions.

---

## Question 11: Run Comparison in UI

**Question** *(Easy)*: A data scientist has run 10 experiments with different hyperparameters and wants to visually compare their metrics. Which MLflow UI feature enables this?

A) The artifact browser in each individual run
B) The "Compare" feature on the Experiments page, which creates parallel coordinate plots and scatter plots
C) The model registry page, which shows metric comparisons across versions
D) The run tags section, which can be filtered by metric value

> [!success]- Answer
> **Correct Answer: B**
>
> The MLflow Experiments page allows you to select multiple runs and click "Compare" to view parallel coordinate plots, scatter plots, and metric comparison tables. This makes it straightforward to identify which hyperparameter combinations produced the best results. The artifact browser, model registry page, and run tags do not provide side-by-side metric comparison views.

---

## Question 12: Setting the Active Experiment

**Question** *(Easy)*: A data scientist wants all MLflow runs in their notebook to be logged to an experiment named `fraud-detection-v2`. Which code sets the active experiment?

A) `mlflow.set_experiment("fraud-detection-v2")`
B) `mlflow.start_run(experiment_name="fraud-detection-v2")`
C) `mlflow.create_experiment("fraud-detection-v2")`
D) `mlflow.use_experiment("fraud-detection-v2")`

> [!success]- Answer
> **Correct Answer: A**
>
> `mlflow.set_experiment(experiment_name)` sets the active experiment for the current session. Subsequent `mlflow.start_run()` calls will log to that experiment. `mlflow.create_experiment()` creates a new experiment but does not set it as active. `start_run()` does not accept an `experiment_name` parameter directly. `use_experiment()` does not exist.

---

## Question 13: Retrieving Run Data Programmatically

**Question** *(Medium)*: A data scientist wants to retrieve the `rmse` metric from a specific MLflow run by its `run_id`. Which approach is correct?

A) `mlflow.get_run(run_id).data.metrics["rmse"]`
B) `mlflow.load_run(run_id)["rmse"]`
C) `mlflow.search_runs(run_id=run_id)["metrics.rmse"]`
D) `MlflowClient().get_metric(run_id, "rmse")`

> [!success]- Answer
> **Correct Answer: A**
>
> `mlflow.get_run(run_id)` returns a `Run` object. The metrics are accessible via `.data.metrics`, which is a dictionary of metric names to their last logged values. `mlflow.load_run()` does not exist. `search_runs()` returns a pandas DataFrame; while you can filter by run ID, it is not the idiomatic way to retrieve a single run's metric. `MlflowClient().get_metric()` does not exist as a single-call API.

---

**[← Previous: Practice Questions — Databricks ML](./01-databricks-ml.md) | [↑ Back to Practice Questions — ML Associate](./README.md) | [Next: Practice Questions — Feature Engineering](./03-feature-engineering.md) →**

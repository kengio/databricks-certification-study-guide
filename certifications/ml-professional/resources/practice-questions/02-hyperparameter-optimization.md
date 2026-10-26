---
title: "Practice Questions - Hyperparameter Optimization"
type: practice-questions
tags:
  - ml-professional
  - hyperparameter-optimization
  - hyperopt
  - automl
  - cross-validation
status: complete
---

# Practice Questions: Hyperparameter Optimization

> [!note]
> Questions 1–12 use Hyperopt, which Databricks Runtime ML stopped shipping after 16.4 LTS ML. The September 2025 exam guide names **Optuna** and **Ray** (questions 13–15). Questions 16–18 cover Advanced MLflow Usage.

[← Back to Practice Questions](./README.md) | [Next: Model Lifecycle](./03-model-lifecycle.md)

---

## Question 1 *(Easy)*: SparkTrials vs Trials

**Question**: A data scientist wants to parallelize Hyperopt trials across a Spark cluster with multiple worker nodes. Which trials object should they use?

A) `Trials()` — runs trials sequentially on the driver
B) `SparkTrials()` — distributes trials across Spark executors
C) `DistributedTrials()` — Hyperopt's built-in cluster mode
D) `ParallelTrials(n_jobs=-1)` — uses all available cores

> [!success]- Answer
> **Correct Answer: B) `SparkTrials()` — distributes trials across Spark executors**
>
> `SparkTrials` dispatches each trial to a Spark executor, enabling true distributed hyperparameter search across a cluster. `Trials` runs all evaluations sequentially on the driver node and is appropriate only for local, single-machine workloads. Options C and D do not exist in Hyperopt.

---

## Question 2 *(Medium)*: fmin() Objective Direction

**Question**: A data scientist passes `roc_auc_score` directly as the objective function to `fmin()`. The search completes but the "best" model has the lowest AUC in the search. What is the problem?

A) `fmin()` always minimizes the objective; returning raw AUC causes it to minimize AUC instead of maximizing it
B) `fmin()` randomly selects the best trial rather than choosing by metric
C) `roc_auc_score` is not a supported metric for Hyperopt
D) The model was not serialized correctly during the trial

> [!success]- Answer
> **Correct Answer: A) `fmin()` always minimizes the objective; returning raw AUC causes it to minimize AUC instead of maximizing it**
>
> Hyperopt's `fmin()` treats the return value of the objective function as a loss to be minimized. To maximize AUC, the objective must return `1 - auc` or `-auc`. Returning the raw AUC score causes Hyperopt to search for hyperparameters that produce the lowest AUC, which is the opposite of the desired behavior.

---

## Question 3 *(Easy)*: MLflow Autolog Run Structure with Hyperopt

**Question**: A data scientist enables `mlflow.sklearn.autolog()` and runs Hyperopt with `fmin()` for 20 trials. How are the MLflow runs organized?

A) 20 independent top-level runs, one per trial
B) 20 experiments, each containing one run
C) 1 run that logs all 20 trials' metrics in a single record
D) 1 parent run containing 20 child runs, one per trial

> [!success]- Answer
> **Correct Answer: D) 1 parent run containing 20 child runs, one per trial**
>
> When `mlflow.autolog()` is active and an active MLflow run exists before `fmin()` is called, Hyperopt creates that run as the parent and nests one child run per trial beneath it. Each child run captures that trial's hyperparameters, metrics, and optionally the fitted model artifact. This hierarchy makes it straightforward to compare all trials under a single experiment entry.

---

## Question 4 *(Medium)*: hp.loguniform vs hp.uniform for Learning Rate

**Question**: A data scientist needs to search learning rate values between `1e-5` and `1e-1`. Which Hyperopt search space expression is most appropriate?

A) `hp.uniform('lr', 1e-5, 1e-1)`
B) `hp.loguniform('lr', np.log(1e-5), np.log(1e-1))`
C) `hp.quniform('lr', 1e-5, 1e-1, 0.001)`
D) `hp.normal('lr', 1e-3, 1e-4)`

> [!success]- Answer
> **Correct Answer: B) `hp.loguniform('lr', np.log(1e-5), np.log(1e-1))`**
>
> Learning rates span multiple orders of magnitude, so a log-uniform distribution is appropriate: it samples values such that ratios (e.g., 1e-4 to 1e-3) are as likely as (1e-2 to 1e-1). `hp.uniform` samples linearly and would overwhelmingly draw values near the upper end of the range, neglecting the small values that are often optimal. The arguments to `hp.loguniform` are `(label, low, high)` in natural-log space, so both bounds must be wrapped in `np.log()`.

---

## Question 5 *(Easy)*: SparkTrials parallelism Parameter

**Question**: A data scientist sets `parallelism=8` in `SparkTrials(parallelism=8)`. What does this control?

A) The number of trials that run simultaneously across the cluster
B) The number of Spark executor cores allocated to each trial
C) The total number of trials that will be evaluated
D) The number of cross-validation folds run per trial

> [!success]- Answer
> **Correct Answer: A) The number of trials that run simultaneously across the cluster**
>
> The `parallelism` argument in `SparkTrials` sets how many trials are dispatched to Spark executors at the same time. With `parallelism=8`, up to 8 trials are in flight concurrently. Higher parallelism increases throughput but can reduce the benefit of Bayesian search because fewer completed results are available to guide the selection of the next batch of trials.

---

## Question 6 *(Medium)*: Early Stopping in Hyperopt

**Question**: A data scientist wants Hyperopt to stop automatically if no improvement is seen for 50 consecutive trials. Which approach is correct?

A) Set `max_evals=50` in `fmin()` to cap total trials
B) Pass `early_stop_fn=no_progress_loss(50)` to `fmin()`
C) Use a `callbacks` argument with an `EarlyStopping` object
D) Wrap `fmin()` in a try/except block and raise `StopIteration` after 50 flat trials

> [!success]- Answer
> **Correct Answer: B) Pass `early_stop_fn=no_progress_loss(50)` to `fmin()`**
>
> Hyperopt's `fmin()` accepts an `early_stop_fn` parameter for stopping conditions. The `hyperopt.early_stop.no_progress_loss(n)` helper returns a function that signals Hyperopt to stop when the best loss has not improved for `n` consecutive trials. Setting `max_evals` only caps the total count regardless of improvement. Hyperopt does not use a `callbacks` API or `StopIteration`.

---

## Question 7 *(Medium)*: Bayesian vs Random Search for Limited Budgets

**Question**: A hyperparameter search space contains over 1,000 possible combinations. A team has a compute budget for only 50 trials. Which search strategy is most sample-efficient?

A) Grid search — evaluates all combinations systematically
B) Random search — unbiased sampling across the full space
C) Bayesian optimization (TPE) — uses past trial results to guide future selections
D) Manual search — a domain expert selects the 50 most promising configurations

> [!success]- Answer
> **Correct Answer: C) Bayesian optimization (TPE) — uses past trial results to guide future selections**
>
> Tree-structured Parzen Estimators (TPE), Hyperopt's default algorithm, builds a probabilistic model of the objective surface and focuses trials in regions likely to improve the result. With only 50 trials available out of 1,000+ combinations, this sample efficiency is critical. Grid search is infeasible at this scale, and random search is unguided. TPE consistently outperforms random search when the trial budget is small relative to the search space.

---

## Question 8 *(Easy)*: hp.choice for Categorical Hyperparameters

**Question**: A data scientist wants Hyperopt to search over `["linear", "rbf", "poly"]` for an SVM kernel. Which Hyperopt space function should they use?

A) `hp.uniform('kernel', 0, 3)`
B) `hp.randint('kernel', 3)`
C) `hp.categorical('kernel', ["linear", "rbf", "poly"])`
D) `hp.choice('kernel', ["linear", "rbf", "poly"])`

> [!success]- Answer
> **Correct Answer: D) `hp.choice('kernel', ["linear", "rbf", "poly"])`**
>
> `hp.choice` is the correct function for selecting one item from a discrete list of categorical values. It returns the selected element (e.g., `"rbf"`) rather than an index, so it plugs directly into model constructors. `hp.uniform` and `hp.randint` produce numeric values, not strings. `hp.categorical` does not exist in Hyperopt.

---

## Question 9 *(Easy)*: CrossValidator parallelism in Spark ML

**Question**: A data scientist uses Spark ML's `CrossValidator` to perform 5-fold cross-validation over a parameter grid with 10 configurations, training 50 models total. What parameter controls how many models train simultaneously?

A) `numFolds` — number of cross-validation folds
B) `sparkContext.setParallelism(10)` — global Spark parallelism setting
C) `n_jobs` — standard scikit-learn parallel jobs argument
D) `parallelism` — number of models to train in parallel

> [!success]- Answer
> **Correct Answer: D) `parallelism` — number of models to train in parallel**
>
> Spark ML's `CrossValidator` and `TrainValidationSplit` both expose a `parallelism` parameter (default `1`) that specifies how many (model, fold) combinations are trained concurrently. Setting it to match the number of available executor cores significantly reduces wall-clock time for large grids. `n_jobs` is a scikit-learn concept not present in Spark ML. `numFolds` controls evaluation strategy, not concurrency.

---

## Question 10 *(Easy)*: AutoML as a Baseline Before Manual HPO

**Question**: A team is beginning a new classification problem and needs the fastest path to a reasonable baseline model and starting hyperparameters. What should they do first?

A) Run a random hyperparameter search with 100 trials using Hyperopt
B) Manually tune a logistic regression as an interpretable starting point
C) Run Databricks AutoML to generate a baseline notebook with hyperparameters automatically
D) Train an ensemble of 10 default models and average their predictions

> [!success]- Answer
> **Correct Answer: C) Run Databricks AutoML to generate a baseline notebook with hyperparameters automatically**
>
> Databricks AutoML explores multiple algorithms and hyperparameter configurations, then generates an editable Python notebook containing the best model found along with the trial results. This gives teams a well-tuned starting point in minutes rather than hours. The generated notebook can then be used as a base for further refinement with Hyperopt. Running Hyperopt from scratch without a baseline risks spending budget on poorly structured search spaces.

---

## Question 11 *(Hard)*: Hyperparameter Overfitting Risk

**Question**: A data scientist tunes hyperparameters by running 200 Hyperopt trials evaluated against the test set, selects the best configuration, and reports that test set AUC as the final model performance. What is the primary risk?

A) The reported AUC is optimistically biased because the test set influenced hyperparameter selection
B) Hyperopt cannot evaluate against a test set directly
C) 200 trials is too few for reliable Bayesian optimization
D) The model will underfit because hyperparameters were selected to minimize loss

> [!success]- Answer
> **Correct Answer: A) The reported AUC is optimistically biased because the test set influenced hyperparameter selection**
>
> When the test set is used to guide any model selection decision — including hyperparameter tuning — it is no longer a held-out, unbiased estimate of generalization performance. The correct practice is to tune on a separate validation set (or use cross-validation), and reserve the test set for a single final evaluation. Using the test set for HPO leads to overfitting to the test distribution and inflated performance estimates.

---

## Question 12 *(Easy)*: Metrics Auto-Logged per Child Run

**Question**: With `mlflow.autolog()` enabled and Hyperopt running 20 trials using a scikit-learn model, what is logged in each child run?

A) Only the hyperparameter values for that trial
B) Only the final loss value returned by the objective function
C) Model metrics, hyperparameter values, and the fitted model artifact
D) Aggregate statistics across all 20 trials combined

> [!success]- Answer
> **Correct Answer: C) Model metrics, hyperparameter values, and the fitted model artifact**
>
> When `mlflow.sklearn.autolog()` is active, each child run created by Hyperopt captures: the hyperparameter values passed to the trial, all metrics computed during `fit()` and `score()` (e.g., AUC, accuracy, RMSE depending on estimator type), and the fitted model serialized as an MLflow artifact. This makes each child run a complete, reproducible record of that trial. Aggregate analysis across trials is visible in the parent run.

---

## Question 13 *(Medium)*: Distributing Optuna Trials with MLflow *(2026 guide)*

**Question**: A team already uses Optuna on a single node. They want to spread trials across the executors of their multi-node Databricks cluster and have each trial recorded in an MLflow experiment, writing as little extra code as possible. What should they use?

A) `optuna.create_study().optimize(objective, n_trials=200, n_jobs=32)`  
B) `MlflowStorage(experiment_id=...)` as the study storage and `MlflowSparkStudy(study_name=..., storage=...).optimize(objective, n_trials=..., n_jobs=...)`  
C) Hyperopt `fmin(..., trials=SparkTrials(parallelism=32))` with the Optuna objective unchanged  
D) Python `asyncio` tasks that each call `study.optimize` with an MLflow callback

> [!success]- Answer
> **Correct Answer: B) `MlflowStorage(experiment_id=...)` as the study storage and `MlflowSparkStudy(study_name=..., storage=...).optimize(objective, n_trials=..., n_jobs=...)`**
>
> `MlflowStorage` keeps the study in MLflow and `MlflowSparkStudy` runs trials on PySpark executors, logging each trial.
>
> Plain Optuna `n_jobs` (A) uses threads on the driver only. Hyperopt (C) is a different library with a different objective contract, and it's no longer shipped in Databricks Runtime ML after 16.4 LTS ML. Async tasks (D) don't distribute work across the cluster. `MlflowStorage` lives in `mlflow.optuna.storage` and `MlflowSparkStudy` in `mlflow.pyspark.optuna.study` (MLflow 3, pre-installed on Databricks Runtime 17.0 ML+).

---

## Question 14 *(Easy)*: Starting Ray on a Databricks Cluster *(2026 guide)*

**Question**: An engineer wants to run a Ray Tune search across the workers of a classic Databricks cluster from a notebook. What must happen before the `tune.Tuner(...).fit()` call?

A) Nothing. `ray.init()` alone automatically uses all Spark workers  
B) Run `%pip install ray` after the Ray cluster starts, so workers pick up the library  
C) Convert the cluster to serverless compute, which runs Ray natively  
D) Start a Ray-on-Spark cluster with `ray.util.spark.setup_ray_cluster(...)`, then `ray.init()`

> [!success]- Answer
> **Correct Answer: D) Start a Ray-on-Spark cluster with `ray.util.spark.setup_ray_cluster(...)`, then `ray.init()`**
>
> `setup_ray_cluster` launches Ray worker nodes on the Spark cluster's executors. Ray then sees the whole cluster.
>
> Without it, `ray.init()` starts a local Ray on the driver only. Ray on Spark isn't supported on serverless-based runtimes. Running `%pip` on a running Ray cluster shuts it down, so install libraries first.

---

## Question 15 *(Medium)*: Ray vs Spark for Distributing ML Work *(2026 guide)*

**Question**: Which workload is the **best** fit for Ray rather than Apache Spark on Databricks?

A) Joining three Delta tables and aggregating them into a feature table  
B) Training a reinforcement-learning agent whose many simulation tasks have dynamic, heterogeneous resource needs  
C) Fitting a Spark ML logistic regression on 500 million rows already in Delta  
D) Running nightly SQL ETL to refresh gold tables

> [!success]- Answer
> **Correct Answer: B) Training a reinforcement-learning agent whose many simulation tasks have dynamic, heterogeneous resource needs**
>
> Ray excels at task (logical) parallelism: many independent, dynamic tasks such as RL, hyperparameter search, and deep-learning training.
>
> Spark excels at data parallelism, applying the same operation to every element of a large dataset: joins, aggregations, ETL, and MLlib. Databricks recommends combining them: Spark for the data-intensive stages, Ray for the compute-heavy stage.

---

## Question 16 *(Medium)*: Structuring Nested Runs for Cross-Validated Tuning *(2026 guide)*

**Question**: A data scientist evaluates 12 hyperparameter configurations with 5-fold cross-validation, then refits the winner on the full training set. They want configurations to be comparable in the MLflow UI and the final model traceable to the search. Which run structure fits best?

A) One flat run per fold per configuration (60 runs) with tags for fold and configuration  
B) A parent run per fold, each with 12 child runs for the configurations  
C) A parent run for the search, one child run per configuration logging mean and std CV metrics, and a final-model run under the same parent for the refit  
D) A single run logging all 60 fold scores as separate metrics, plus the final model

> [!success]- Answer
> **Correct Answer: C) A parent run for the search, one child run per configuration logging mean and std CV metrics, and a final-model run under the same parent for the refit**
>
> Parent = search, children = configurations with aggregated CV metrics, plus a final-model run linked to the parent.
>
> This keeps the configurations side by side in the UI (one child each), stores the CV summary where it's compared, and links the final model to the search that produced it. Per-fold values can still be logged inside each child with `log_metric(..., step=fold)`. Flat runs (A) and fold-level parents (B) scatter each configuration's evidence; a single run (D) loses structure.

---

## Question 17 *(Easy)*: Logging a Metric Series *(2026 guide)*

**Question**: During training, a team wants MLflow to chart validation loss for each of 50 epochs within one run. Which call should run inside the epoch loop?

A) `mlflow.log_metric("val_loss", loss, step=epoch)`  
B) `mlflow.log_param("val_loss", loss)`  
C) `mlflow.set_tag("val_loss", loss)`  
D) `mlflow.log_dict({"val_loss": loss}, "loss.json")`

> [!success]- Answer
> **Correct Answer: A) `mlflow.log_metric("val_loss", loss, step=epoch)`**
>
> `log_metric` with `step` records a time series that the run page charts.
>
> Parameters are write-once inputs, tags are metadata strings, and `log_dict` saves a file artifact (each call with the same name would overwrite it). Only metrics with steps produce a per-epoch chart.

---

## Question 18 *(Medium)*: Custom PyFunc with Request-Time Feature Engineering *(2026 guide)*

**Question**: A custom `mlflow.pyfunc.PythonModel` must derive `hour_of_day` and a ratio against a merchant lookup file from the raw request, then score with a scikit-learn estimator stored as an artifact. Where should each step go?

A) Load the estimator and lookup file inside `predict()` on every call, so they're always fresh  
B) Store the lookup file on the training cluster's local disk and read it by absolute path in `predict()`  
C) Compute the features in the client application and keep the model a plain `mlflow.sklearn` flavor  
D) Load the estimator and lookup file once in `load_context()` via `context.artifacts[...]`; compute the features and score in `predict()`

> [!success]- Answer
> **Correct Answer: D) Load the estimator and lookup file once in `load_context()` via `context.artifacts[...]`; compute the features and score in `predict()`**
>
> `load_context()` runs once at load time for heavy artifacts; `predict()` runs per request for feature engineering and scoring.
>
> Packaging the transformation inside the model keeps training and serving consistent. Files passed through the `artifacts` dict are copied into the model package and resolved with `context.artifacts`. Local paths from the training cluster (B) don't exist on the serving container, and loading per request (A) adds latency.

---
[← Back to Practice Questions](./README.md) | [Next: Model Lifecycle](./03-model-lifecycle.md)

---

**[← Previous: Feature Engineering Practice Questions](./01-feature-engineering.md) | [↑ Back to ML Professional Practice Questions](./README.md) | [Next: "Practice Questions - Model Production Lifecycle"](./03-model-lifecycle.md) →**

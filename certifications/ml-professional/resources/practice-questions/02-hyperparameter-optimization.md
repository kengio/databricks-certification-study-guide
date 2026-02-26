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

A) `fmin()` randomly selects the best trial rather than choosing by metric
B) `fmin()` always minimizes the objective; returning raw AUC causes it to minimize AUC instead of maximizing it
C) `roc_auc_score` is not a supported metric for Hyperopt
D) The model was not serialized correctly during the trial

> [!success]- Answer
> **Correct Answer: B) `fmin()` always minimizes the objective; returning raw AUC causes it to minimize AUC instead of maximizing it**
>
> Hyperopt's `fmin()` treats the return value of the objective function as a loss to be minimized. To maximize AUC, the objective must return `1 - auc` or `-auc`. Returning the raw AUC score causes Hyperopt to search for hyperparameters that produce the lowest AUC, which is the opposite of the desired behavior.

---

## Question 3 *(Easy)*: MLflow Autolog Run Structure with Hyperopt

**Question**: A data scientist enables `mlflow.sklearn.autolog()` and runs Hyperopt with `fmin()` for 20 trials. How are the MLflow runs organized?

A) 20 independent top-level runs, one per trial
B) 1 parent run containing 20 child runs, one per trial
C) 1 run that logs all 20 trials' metrics in a single record
D) 20 experiments, each containing one run

> [!success]- Answer
> **Correct Answer: B) 1 parent run containing 20 child runs, one per trial**
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

A) The number of Spark executor cores allocated to each trial
B) The number of trials that run simultaneously across the cluster
C) The total number of trials that will be evaluated
D) The number of cross-validation folds run per trial

> [!success]- Answer
> **Correct Answer: B) The number of trials that run simultaneously across the cluster**
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
C) `hp.choice('kernel', ["linear", "rbf", "poly"])`
D) `hp.categorical('kernel', ["linear", "rbf", "poly"])`

> [!success]- Answer
> **Correct Answer: C) `hp.choice('kernel', ["linear", "rbf", "poly"])`**
>
> `hp.choice` is the correct function for selecting one item from a discrete list of categorical values. It returns the selected element (e.g., `"rbf"`) rather than an index, so it plugs directly into model constructors. `hp.uniform` and `hp.randint` produce numeric values, not strings. `hp.categorical` does not exist in Hyperopt.

---

## Question 9 *(Easy)*: CrossValidator parallelism in Spark ML

**Question**: A data scientist uses Spark ML's `CrossValidator` to perform 5-fold cross-validation over a parameter grid with 10 configurations, training 50 models total. What parameter controls how many models train simultaneously?

A) `numFolds` — number of cross-validation folds
B) `parallelism` — number of models to train in parallel
C) `n_jobs` — standard scikit-learn parallel jobs argument
D) `sparkContext.setParallelism(10)` — global Spark parallelism setting

> [!success]- Answer
> **Correct Answer: B) `parallelism` — number of models to train in parallel**
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

A) Hyperopt cannot evaluate against a test set directly
B) The reported AUC is optimistically biased because the test set influenced hyperparameter selection
C) 200 trials is too few for reliable Bayesian optimization
D) The model will underfit because hyperparameters were selected to minimize loss

> [!success]- Answer
> **Correct Answer: B) The reported AUC is optimistically biased because the test set influenced hyperparameter selection**
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

[← Back to Practice Questions](./README.md) | [Next: Model Lifecycle](./03-model-lifecycle.md)

---

**[← Previous: Feature Engineering Practice Questions](./01-feature-engineering.md) | [↑ Back to ML Professional Practice Questions](./README.md) | [Next: "Practice Questions - Model Production Lifecycle"](./03-model-lifecycle.md) →**

---
title: Mock Exam 2 Questions — ML Associate
type: mock-exam-questions
tags: [ml-associate, mock-exam]
status: published
---

# Mock Exam 2 — Questions

Set a 90-minute timer and answer all 48 questions before checking answers. Sections follow the exam guide's four sections and weights (38 / 19 / 31 / 12 %). This exam emphasizes integration scenarios, edge cases, and troubleshooting.

[← Back to Mock Exam 2 Instructions](./README.md)

---

## Databricks Machine Learning (Questions 1–18)

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

## Question 3 *(Hard)*

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

## Question 4 *(Medium)*

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

## Question 5 *(Hard)*

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

## Question 6 *(Medium)*

**Question**: A data scientist wants the top 3 runs of experiment `123` ordered by `val_accuracy`, highest first. Which call is correct?

A) `mlflow.search_runs(experiment_ids=["123"], order_by=["metrics.val_accuracy DESC"], max_results=3)`  
B) `mlflow.search_runs(experiment_ids=["123"], sort_by="val_accuracy", limit=3)`  
C) `mlflow.get_experiment("123").runs[:3]`  
D) `mlflow.search_runs(experiment_ids=["123"], order_by=["metrics.val_accuracy ASC"], max_results=3)`

> [!success]- Answer
> **Correct Answer: A**
>
> `search_runs` takes `order_by` strings such as `"metrics.val_accuracy DESC"` and `max_results` to limit the result.
>
> `sort_by` and `limit` are not parameters, an `Experiment` object has no `.runs`, and `ASC` would return the lowest accuracies.

---

## Question 7 *(Medium)*

**Question**: A data scientist logged a model in run `r9` (artifact path `model`) but forgot to register it. How can they register it as `ml.churn.clf` in Unity Catalog without retraining?

A) Retrain the model and pass `registered_model_name` this time  
B) `mlflow.register_model("runs:/r9/model", "ml.churn.clf")`  
C) Delete the run and start over  
D) Copy the artifact files into the catalog with `dbutils.fs.cp`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.register_model()` can be called any time after logging, using the `runs:/<run_id>/<artifact_path>` URI and a three-level Unity Catalog name.
>
> The run must still exist, and the model version must have a signature for Unity Catalog.

---

## Question 8 *(Medium)*

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

## Question 9 *(Medium)*

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

## Question 10 *(Medium)*

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

## Question 11 *(Medium)*

**Question**: Features are computed daily into a time-series feature table. Training must use, for each label, the feature values as of the label's event time. Which capability provides this?

A) `fe.write_table(..., mode="merge")` every day  
B) A point-in-time lookup: `FeatureLookup(..., timestamp_lookup_key="event_ts")`  
C) Delta time travel to the latest table version  
D) Calling `fe.score_batch()` on historical entities

> [!success]- Answer
> **Correct Answer: B**
>
> Point-in-time lookups use the label's timestamp to fetch the feature values as they existed at that moment, preventing future data leaking into training rows.
>
> Merging and time travel to the latest version do not align features with each label's time, and `score_batch` scores rather than building training sets.

---

## Question 12 *(Medium)*

**Question**: A model logged with `fe.log_model` was trained on three features of `ml.features.customers`. Later two new columns are added to that feature table. How are the model's scoring calls affected?

A) The model automatically starts using the new columns  
B) They are unaffected — the model looks up only the features recorded in its training set  
C) Scoring fails because the table schema changed  
D) The new columns are passed in but given zero weight

> [!success]- Answer
> **Correct Answer: B**
>
> `fe.log_model` stores the feature lookups used at training; `score_batch` and online lookups fetch exactly those features. New columns are used only if the model is retrained with them.

---

## Question 13 *(Medium)*

**Question**: Why log a feature-table-trained model with `fe.log_model(...)` instead of `mlflow.sklearn.log_model(...)`?

A) It deploys the model to a serving endpoint automatically  
B) It packages the feature lookup metadata, so `fe.score_batch` (and online lookups) can fetch the features automatically at inference  
C) It stores the model in a Delta table instead of MLflow  
D) It skips signature inference

> [!success]- Answer
> **Correct Answer: B**
>
> `FeatureEngineeringClient.log_model(model, artifact_path, flavor, training_set, ...)` records which feature tables and keys the model needs; inference then needs only the keys.
>
> It does not deploy anything or replace MLflow storage, and Unity Catalog still requires a signature.

---

## Question 14 *(Medium)*

**Question**: A data scientist needs a DataFrame of feature values for a list of `customer_id`s to inspect before scoring, without running a model. Which call fits?

A) `fe.score_batch(model_uri, ids_df)`  
B) `fe.create_training_set(df=ids_df, feature_lookups=lookups, label=None).load_df()`  
C) `fe.publish_table(...)`  
D) `fe.create_table(name, primary_keys=["customer_id"])`

> [!success]- Answer
> **Correct Answer: B**
>
> `create_training_set` joins the requested features onto the key DataFrame; `label=None` builds a feature set without a target column, and `load_df()` returns it.
>
> `score_batch` runs inference, `publish_table` copies to an online store, and `create_table` creates a new table.

---

## Question 15 *(Hard)*

**Question**: Version 5 of `ml.ads.ctr_model` should replace version 4 in production. Consumers load `@champion`, and the team also wants to keep a pointer to the previous model for quick rollback. Which sequence is correct?

A) `transition_model_version_stage(version=5, stage="Production", archive_existing_versions=True)`  
B) `set_registered_model_alias(name, "previous", 4)` then `set_registered_model_alias(name, "champion", 5)`  
C) `delete_model_version(name, 4)` then `set_registered_model_alias(name, "champion", 5)`  
D) `set_model_version_tag(name, "5", "stage", "Production")`

> [!success]- Answer
> **Correct Answer: B**
>
> Aliases are named pointers you control: keep `previous` on version 4 for rollback, then move `champion` to version 5. Rolling back is just moving `champion` back.
>
> Stages (and `archive_existing_versions`) are not supported in Unity Catalog, deleting version 4 removes the rollback target, and a tag does not change what consumers load.

---

## Question 16 *(Medium)*

**Question**: A data scientist registers the same logged model `runs:/abc123/model` under two Unity Catalog names: `ml.team_a.model` and `ml.team_b.model`. What happens?

A) An error — a run's model can only be registered once  
B) Both succeed, each creating version 1 of its own registered model  
C) Only the first succeeds  
D) The second call adds version 2 to `ml.team_a.model`

> [!success]- Answer
> **Correct Answer: B**
>
> Registration creates a version under the target name; the same source can back versions in different registered models, each starting at version 1.

---

## Question 17 *(Easy)*

**Question**: Version 6 of `ml.churn.clf` should carry `validation_status=approved`. Which call adds that tag to the version?

A) `client.set_registered_model_alias("ml.churn.clf", "approved", 6)`  
B) `client.set_model_version_tag("ml.churn.clf", "6", "validation_status", "approved")`  
C) `client.set_registered_model_tag("ml.churn.clf", "validation_status", "approved")`  
D) `client.update_model_version("ml.churn.clf", 6, tag="approved")`

> [!success]- Answer
> **Correct Answer: B**
>
> `set_model_version_tag(name, version, key, value)` tags one version; `delete_model_version_tag(name, version, key)` removes it.
>
> A model-level tag applies to the registered model, an alias is a pointer rather than a tag, and `update_model_version` changes the description.

---

## Question 18 *(Medium)*

**Question**: Why might an organisation keep feature tables in Unity Catalog rather than in a legacy workspace feature store?

A) Unity Catalog feature tables don't need primary keys  
B) Feature tables registered in Unity Catalog can be discovered and reused from any workspace on the metastore, with centralised governance and lineage  
C) Unity Catalog feature tables are refreshed automatically  
D) Workspace feature stores support online serving but Unity Catalog does not

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog is account-level, giving cross-workspace sharing and discovery, UC access control, and lineage to models.
>
> Primary keys are required, refresh is your pipeline's job, and UC feature tables publish to online stores.

---

## Data Processing (Questions 19–27)

---

## Question 19 *(Medium)*

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

## Question 20 *(Medium)*

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

## Question 21 *(Easy)*

**Question**: Which Databricks utility renders summary statistics for a Spark or pandas DataFrame in a notebook?

A) `dbutils.data.summarize(df)`  
B) `dbutils.notebook.summarize(df)`  
C) `dbutils.fs.describe(df)`  
D) `dbutils.widgets.summary(df)`

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.data.summarize(df)` calculates and displays summary statistics; `precise=True` trades speed for precision.
>
> The other utilities handle notebooks, files, and widgets.

---

## Question 22 *(Medium)*

**Question**: Which approach removes rows whose `amount` lies more than 3 standard deviations from the mean?

A) Compute `mu` and `sigma` with `F.mean`/`F.stddev`, then `df.filter(F.abs(F.col("amount") - mu) <= 3 * sigma)`  
B) `df.filter(F.col("amount") <= 3)`  
C) `df.dropna(subset=["amount"])`  
D) `df.orderBy("amount").limit(int(df.count() * 0.97))`

> [!success]- Answer
> **Correct Answer: A**
>
> The z-score rule keeps |x − μ| ≤ 3σ.
>
> Filtering a raw value of 3, dropping nulls, or trimming the top 3 % are different operations.

---

## Question 23 *(Medium)*

**Question**: What is the most appropriate way to examine the relationship between two continuous features, `age` and `annual_spend`?

A) A contingency table with a chi-square test  
B) A scatter plot with a correlation coefficient  
C) A bar chart of distinct ages  
D) One-hot encoding both columns

> [!success]- Answer
> **Correct Answer: B**
>
> Scatter plots and Pearson/Spearman correlation describe two continuous features; Spearman is preferable for monotonic or skewed relationships.
>
> Contingency tables and chi-square tests are for categorical pairs.

---

## Question 24 *(Medium)*

**Question**: A data scientist must impute missing `delivery_days` (a numeric feature that is roughly symmetric, with no strong outliers). Which strategy is reasonable?

A) Mean  
B) Mode of a string column  
C) Always zero  
D) Drop the column

> [!success]- Answer
> **Correct Answer: A**
>
> For symmetric continuous data without strong outliers, the mean is a reasonable estimate (median for skewed data, mode for categorical).
>
> Zero-filling invents values, and dropping a mostly complete column throws away signal.

---

## Question 25 *(Medium)*

**Question**: Which Spark code imputes missing numeric `age` with its median, learned from the training data?

A) `Imputer(inputCols=["age"], outputCols=["age_imp"], strategy="median").fit(train_df)`  
B) `train_df.fillna("median")`  
C) `Imputer(strategy="median").transform(train_df)` with no fit  
D) `train_df.na.drop(subset=["age"])`

> [!success]- Answer
> **Correct Answer: A**
>
> `Imputer` is an Estimator: `fit` learns the median on training data, and the resulting `ImputerModel` transforms train, validation, and test data.
>
> `fillna("median")` fills the literal string, an unfitted `Imputer` cannot transform, and dropping rows is not imputation.

---

## Question 26 *(Medium)*

**Question**: Which feature is a poor candidate for one-hot encoding?

A) `payment_type` with 4 nominal levels for a logistic regression  
B) `customer_id` with 3 million distinct values  
C) `day_of_week` for a linear model  
D) `region` with 6 levels for k-nearest neighbours

> [!success]- Answer
> **Correct Answer: B**
>
> Millions of levels would create millions of sparse columns; identifiers like this are usually dropped or replaced by aggregate or encoded features.
>
> Low-cardinality nominal features for linear or distance-based models are classic one-hot candidates.

---

## Question 27 *(Medium)*

**Question**: When is a log transformation of a feature most appropriate?

A) The feature is already normally distributed around zero  
B) The feature is positive, right-skewed, and spans several orders of magnitude  
C) The feature contains many negative values  
D) The feature is a high-cardinality categorical column

> [!success]- Answer
> **Correct Answer: B**
>
> A log compresses large values and makes right-skewed positive data more symmetric.
>
> It adds nothing for normal data, is undefined for zero or negative values (use `log1p` for zeros), and is not a cardinality-reduction technique.

---

## Model Development (Questions 28–42)

---

## Question 28 *(Easy)*

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

## Question 29 *(Hard)*

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

## Question 30 *(Medium)*

**Question**: A pipeline must one-hot encode `city` and `category`. Which stage ordering is **invalid**?

A) `SI(city)` → `SI(category)` → `OHE(city_idx, category_idx)` → `VectorAssembler`  
B) `SI(city)` → `OHE(city_idx)` → `SI(category)` → `OHE(category_idx)` → `VectorAssembler`  
C) `OHE(city)` → `SI(city)` → `OHE(category)` → `SI(category)` → `VectorAssembler`  
D) `SI(city, category)` (multi-column) → `OHE(city_idx, category_idx)` → `VectorAssembler`

> [!success]- Answer
> **Correct Answer: C**
>
> Each `OneHotEncoder` needs the numeric index produced by its `StringIndexer`, so every indexer must come before the encoder that uses its output.
>
> Grouping all indexers first, interleaving index/encode pairs, or using multi-column stages are all valid.

---

## Question 31 *(Hard)*

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

## Question 32 *(Medium)*

**Question**: A data scientist fits a `Pipeline` on training data and saves it with `pipeline_model.save("/Volumes/ml/churn/models/pipeline")`. Later, they load it with `PipelineModel.load("/Volumes/ml/churn/models/pipeline")`. Which statement is true?

A) The loaded model needs to be re-fitted on new data before it can transform  
B) The loaded model contains all fitted stage parameters and can transform new data immediately  
C) Only the final estimator stage is saved; preprocessing stages must be re-fitted  
D) The `save()` method does not persist the fitted parameters, only the stage configuration

> [!success]- Answer
> **Correct Answer: B**
>
> `PipelineModel.save()` persists all fitted stage parameters (e.g., `StringIndexerModel`'s index mapping, `StandardScalerModel`'s mean and variance, `LogisticRegressionModel`'s coefficients). When loaded, the model is fully ready to call `transform()` without any re-fitting.

---

## Question 33 *(Easy)*

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

## Question 34 *(Medium)*

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

## Question 35 *(Hard)*

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

## Question 36 *(Easy)*

**Question**: Which Hyperopt setting performs random search instead of Bayesian search?

A) `algo=tpe.suggest`  
B) `algo=rand.suggest`  
C) `trials=SparkTrials()`  
D) `max_evals=1`

> [!success]- Answer
> **Correct Answer: B**
>
> `rand.suggest` samples hyperparameters at random; `tpe.suggest` is the Bayesian (TPE) algorithm.
>
> `SparkTrials` controls parallel execution, not the search strategy.

---

## Question 37 *(Hard)*

**Question**: A data scientist tunes a Spark ML `RandomForestClassifier` on a large table with Hyperopt. Which `trials` setting is recommended?

A) `SparkTrials(parallelism=16)`  
B) The default `Trials()`, because each MLlib fit is already distributed across the cluster  
C) `SparkTrials(parallelism=1)`  
D) No trials object; Hyperopt cannot tune MLlib

> [!success]- Answer
> **Correct Answer: B**
>
> `SparkTrials` is for single-machine models; distributed MLlib training should use `Trials`.
>
> Note: Hyperopt is not included in Databricks Runtime ML after 16.4 LTS ML; the docs now recommend Optuna or Ray Tune.

---

## Question 38 *(Medium)*

**Question**: A marketing team needs to explain to stakeholders how each attribute influences a customer's predicted spend (a continuous value). Which model is the best starting point?

A) Linear regression (with regularisation if needed)  
B) Logistic regression  
C) k-means  
D) A 500-tree gradient-boosted ensemble

> [!success]- Answer
> **Correct Answer: A**
>
> Linear regression predicts a continuous target and its coefficients explain each feature's effect.
>
> Logistic regression is for classification, k-means is unsupervised, and large ensembles are harder to explain.

---

## Question 39 *(Medium)*

**Question**: Which is a valid way to mitigate class imbalance in training data?

A) Oversample the minority class in the training split only  
B) Oversample the minority class in the test split  
C) Remove the minority class  
D) Evaluate only with accuracy

> [!success]- Answer
> **Correct Answer: A**
>
> Resampling the training split (or class weights) helps the model learn the minority class; evaluation data must keep the real distribution.
>
> Evaluating only with accuracy hides poor minority-class performance.

---

## Question 40 *(Medium)*

**Question**: Revenue forecasts must heavily penalise occasional very large misses. Which metric fits?

A) MAE  
B) RMSE  
C) Accuracy  
D) F1

> [!success]- Answer
> **Correct Answer: B**
>
> RMSE squares errors before averaging, so large misses dominate — useful when big errors are especially costly.
>
> MAE treats all errors linearly; accuracy and F1 are classification metrics.

---

## Question 41 *(Medium)*

**Question**: A regression model trained on `log(price)` reports RMSE = 0.18 on the validation set. A stakeholder asks for the typical error in dollars. What is the correct next step?

A) Report $0.18  
B) Exponentiate the predictions and compute RMSE against the original prices  
C) Report e^0.18 dollars  
D) Retrain without the log transform

> [!success]- Answer
> **Correct Answer: B**
>
> Convert predictions back to dollars (exp) and evaluate them against the dollar labels; a log-space RMSE cannot be converted to dollars by a simple formula.
>
> There is no need to abandon the log target — just invert it before evaluation.

---

## Question 42 *(Medium)*

**Question**: Increasing a tree's `maxDepth` from 3 to 6 lowers both training and validation error. What does this suggest about the depth-3 model?

A) It was overfitting (high variance)  
B) It was underfitting (high bias), so extra complexity helped  
C) It had data leakage  
D) Nothing — validation error is irrelevant

> [!success]- Answer
> **Correct Answer: B**
>
> When added complexity lowers validation error too, the simpler model was too biased. Keep increasing complexity only while validation error keeps improving.
>
> Overfitting would show validation error rising as training error falls.

---

## Model Deployment (Questions 43–48)

---

## Question 43 *(Medium)*

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

## Question 44 *(Medium)*

**Question**: A data scientist loads `mlflow.pyfunc.load_model("models:/ml.retail.mymodel@champion")` for a scikit-learn model and calls `model.predict(data)`. What should `data` be?

A) A Spark DataFrame  
B) A pandas DataFrame (or array) compatible with the model's signature  
C) A Delta table path string  
D) A list of SQL statements

> [!success]- Answer
> **Correct Answer: B**
>
> A `PyFuncModel.predict` takes pandas DataFrames (or NumPy arrays) matching the model signature — batch inference with pandas.
>
> For Spark DataFrames, use `mlflow.pyfunc.spark_udf` instead.

---

## Question 45 *(Easy)*

**Question**: A retailer scores 5 million customers each night for the next day's email campaign. No one needs a prediction in real time. Which approach is most cost-effective?

A) An always-on real-time endpoint  
B) A scheduled batch inference job  
C) A continuously running streaming pipeline  
D) A GPU endpoint with provisioned concurrency

> [!success]- Answer
> **Correct Answer: B**
>
> Scheduled scoring of a full population with no latency requirement is batch inference — the simplest and cheapest option.

---

## Question 46 *(Medium)*

**Question**: Which Databricks SDK call shape creates a Model Serving endpoint for version 2 of `ml.fraud.clf`?

A) `w.serving_endpoints.create(name="fraud", config=EndpointCoreConfigInput(served_entities=[ServedEntityInput(entity_name="ml.fraud.clf", entity_version="2", workload_size="Small", scale_to_zero_enabled=True)]))`  
B) `w.clusters.create(model="ml.fraud.clf", version=2)`  
C) `mlflow.register_model("ml.fraud.clf/2", "fraud")`  
D) `w.jobs.create(name="fraud", endpoint=True)`

> [!success]- Answer
> **Correct Answer: A**
>
> Endpoints are created with `served_entities` naming the Unity Catalog model, version, workload size, and scale-to-zero setting (or the same payload through the MLflow Deployments client or the UI).
>
> Clusters, registration, and jobs do not create serving endpoints.

---

## Question 47 *(Medium)*

**Question**: An endpoint serves `champion-v7` and `challenger-v8`. Which `traffic_config` sends a quarter of requests to the challenger?

A) `{"routes": [{"served_model_name": "champion-v7", "traffic_percentage": 75}, {"served_model_name": "challenger-v8", "traffic_percentage": 25}]}`  
B) `{"routes": [{"served_model_name": "challenger-v8", "traffic_percentage": 25}]}`  
C) `{"alias": "challenger", "share": 0.25}`  
D) `{"routes": [{"served_model_name": "champion-v7", "traffic_percentage": 100}, {"served_model_name": "challenger-v8", "traffic_percentage": 25}]}`

> [!success]- Answer
> **Correct Answer: A**
>
> Each served entity gets a route, and the percentages must add up to 100.
>
> A single 25 % route or routes summing to 125 % are invalid, and aliases do not route traffic.

---

## Question 48 *(Medium)*

**Question**: Listening events must be scored for low engagement as they arrive, at tens of thousands of events per second, with compute that grows and shrinks with traffic. Which design fits best?

A) A Delta Live Tables pipeline that applies the model as a Spark UDF to the streaming events  
B) A notebook that a person reruns every hour  
C) A serving endpoint called once per event from a Python loop on the driver  
D) A weekly batch job

> [!success]- Answer
> **Correct Answer: A**
>
> A pipeline keeps the model in-process (Spark UDF) for throughput and manages streaming state, checkpoints, and enhanced autoscaling.
>
> Per-event endpoint calls from the driver add overhead and do not scale; manual or weekly runs miss the latency requirement.

---

**End of Mock Exam 2 — 48 Questions**

[← Back to Mock Exam 2 Instructions](./README.md) | [← Back to Resources](../README.md)

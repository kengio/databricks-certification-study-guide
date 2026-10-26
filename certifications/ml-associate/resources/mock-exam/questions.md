---
title: Mock Exam 1 Questions — ML Associate
type: mock-exam-questions
tags: [ml-associate, mock-exam]
status: published
---

# Mock Exam 1 — Questions

Set a 90-minute timer and answer all 48 questions before checking answers. Sections follow the exam guide's four sections and weights (38 / 19 / 31 / 12 %).

[← Back to Mock Exam Instructions](./README.md)

---

## Databricks Machine Learning (Questions 1–18)

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

## Question 2 *(Easy)*

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

## Question 3 *(Easy)*

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

## Question 4 *(Easy)*

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

## Question 5 *(Medium)*

**Question**: A data scientist runs AutoML on a regression problem and wants to understand which features drive the best model's predictions. What does AutoML provide for this purpose?

A) A Shapley value table written automatically to Unity Catalog  
B) A generated best-trial notebook with a SHAP feature-importance section that can be enabled (it is off by default)  
C) A PDF report summarizing the model's performance  
D) An automatic A/B test comparing the best model to the baseline

> [!success]- Answer
> **Correct Answer: B**
>
> AutoML's generated notebooks include a Feature importance section that computes Shapley values with SHAP. Because it is memory-intensive it is off by default — set `shap_enabled = True` and rerun the notebook.
>
> AutoML writes no SHAP table, produces no PDF report, and does not run A/B tests.

---

## Question 6 *(Medium)*

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

## Question 7 *(Easy)*

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

## Question 8 *(Easy)*

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

## Question 9 *(Medium)*

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

## Question 10 *(Medium)*

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

## Question 11 *(Easy)*

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

## Question 12 *(Easy)*

**Question**: A data scientist calls `FeatureEngineeringClient().create_table(name="ml.features.users", df=users_df)` without `primary_keys`. What happens?

A) The table is created with a default UUID primary key  
B) The call fails because `primary_keys` is a required argument  
C) The table is created successfully with no primary key  
D) A deprecation warning is shown but the table is still created

> [!success]- Answer
> **Correct Answer: B**
>
> `primary_keys` has no default in `FeatureEngineeringClient.create_table`. In Unity Catalog a feature table is a Delta table with a primary key; lookups, training sets, `score_batch`, and online publishing all rely on it.

---

## Question 13 *(Medium)*

**Question**: A data engineer wants to add new rows and update existing rows of a Unity Catalog feature table by primary key, leaving other rows unchanged. Which `FeatureEngineeringClient.write_table()` mode should they use?

A) `mode="append"`  
B) `mode="overwrite"`  
C) `mode="merge"`  
D) `mode="upsert"`

> [!success]- Answer
> **Correct Answer: C**
>
> `mode="merge"` upserts by primary key: matching keys are updated, new keys inserted, and rows not in the DataFrame stay unchanged. It is the only (and default) `write_table` mode of `FeatureEngineeringClient`.
>
> To replace all data you would delete rows or recreate the table; `append` and `upsert` are not modes.

---

## Question 14 *(Medium)*

**Question**: A model trained on Unity Catalog feature tables was logged with `fe.log_model(...)`. A new DataFrame contains only `customer_id`. Which call retrieves the features and scores the batch?

A) `mlflow.pyfunc.load_model(model_uri).predict(entity_df)`  
B) `fe.score_batch(model_uri=model_uri, df=entity_df)`  
C) `fe.read_table(name=table_name).join(entity_df)`  
D) `mlflow.pyfunc.spark_udf(spark, model_uri)(entity_df)`

> [!success]- Answer
> **Correct Answer: B**
>
> `FeatureEngineeringClient.score_batch` reads the feature metadata packaged by `fe.log_model`, joins the features to the keys, and applies the model — identical feature definitions to training.
>
> A plain pyfunc model does not know how to fetch features, `read_table(...).join(...)` only fetches features, and a UDF is applied to columns, not to a whole DataFrame.

---

## Question 15 *(Easy)*

**Question**: A data scientist has run_id `xyz789` and logged a model with `artifact_path="classifier"`. With the registry URI set to `databricks-uc`, which call registers it as `ml.sales.purchase_predictor`?

A) `mlflow.register_model("classifier/xyz789", "ml.sales.purchase_predictor")`  
B) `mlflow.register_model("runs:/xyz789/classifier", "ml.sales.purchase_predictor")`  
C) `mlflow.register_model("artifacts:/xyz789/classifier", "ml.sales.purchase_predictor")`  
D) `mlflow.register_model("runs:/xyz789/classifier", "purchase_predictor")` with no catalog or schema

> [!success]- Answer
> **Correct Answer: B**
>
> A logged model is referenced as `runs:/<run_id>/<artifact_path>`, and Unity Catalog names are three-level `catalog.schema.model`.
>
> `artifacts:/` is not a valid scheme and a one-part name is not a Unity Catalog model name.

---

## Question 16 *(Medium)*

**Question**: Version 5 of the Unity Catalog model `ml.finance.revenue_predictor` has beaten the current production version. Scoring jobs load `models:/ml.finance.revenue_predictor@champion`. What is the recommended way to promote version 5?

A) `MlflowClient().transition_model_version_stage("ml.finance.revenue_predictor", 5, "Production")`  
B) Delete the old champion version so version 5 is the only one left  
C) `MlflowClient().set_registered_model_alias("ml.finance.revenue_predictor", "champion", 5)`  
D) `MlflowClient().set_model_version_tag("ml.finance.revenue_predictor", "5", "champion", "true")`

> [!success]- Answer
> **Correct Answer: C**
>
> In Unity Catalog, promotion moves an alias: pointing `champion` at version 5 makes every consumer of `@champion` use it without code changes.
>
> Stages belong to the legacy workspace registry and are not supported in UC; deleting versions is destructive; a tag is only metadata.

---

## Question 17 *(Medium)*

**Question**: A team's model training takes 20 minutes, and its data scientists cannot read production data from the development workspace. The company uses Git and CI/CD. Which deployment pattern does Databricks recommend here?

A) Deploy models: train in dev and copy the model version to production  
B) Deploy code: promote the reviewed training code so the model is retrained in production  
C) Train in staging on a sample and promote that artifact  
D) Skip staging and register directly into the production catalog from dev

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks recommends **deploy code** in most situations, and it is the pattern that works when production data is restricted: the training code moves through dev → staging → prod and trains where the data lives.
>
> Deploy models fits very expensive or hard-to-reproduce training, a single workspace, or no CI/CD — none of which applies here.

---

## Question 18 *(Medium)*

**Question**: A recommendation endpoint must fetch a user's latest features in milliseconds by `user_id`, and the same features feed weekly retraining. Which design fits?

A) Read the offline Delta feature table with a full scan on every request  
B) Use the offline feature table for training and batch scoring, and publish it to an online store for low-latency lookups at serving time  
C) Keep the features only in an online store and train from it  
D) Hard-code the features into the model artifact

> [!success]- Answer
> **Correct Answer: B**
>
> Offline feature tables (Delta tables in Unity Catalog) serve training and batch scoring; an online store serves key-based millisecond lookups to real-time endpoints, where a model logged with `fe.log_model` can look features up automatically.

---

## Data Processing (Questions 19–27)

---

## Question 19 *(Medium)*

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

## Question 20 *(Easy)*

**Question**: Which call shows count, mean, stddev, min, the 25 %/50 %/75 % percentiles, and max for every column of a Spark DataFrame `df`?

A) `df.describe()`  
B) `df.summary()`  
C) `df.stats()`  
D) `df.agg("*")`

> [!success]- Answer
> **Correct Answer: B**
>
> `summary()` with no arguments returns count, mean, stddev, min, approximate quartiles, and max; `describe()` omits the percentiles.
>
> `df.stats()` does not exist and `agg("*")` is invalid.

---

## Question 21 *(Medium)*

**Question**: For `session_minutes`, Q1 = 10 and Q3 = 30. Using the 1.5 × IQR rule, which filter removes outliers?

A) `df.filter(F.col("session_minutes").between(-20, 60))`  
B) `df.filter(F.col("session_minutes").between(10, 30))`  
C) `df.filter(F.col("session_minutes") <= 45)`  
D) `df.filter(F.col("session_minutes").between(-5, 45))`

> [!success]- Answer
> **Correct Answer: A**
>
> IQR = 30 − 10 = 20, so the fences are 10 − 30 = −20 and 30 + 30 = 60.
>
> Keeping only Q1–Q3 would drop half the data; the other bounds use the wrong multiple.

---

## Question 22 *(Medium)*

**Question**: A roughly normal feature should be cleaned of extreme values using its mean and standard deviation. Which rule is the standard choice?

A) Keep values within the 5th–95th percentiles  
B) Keep values within μ ± 3σ  
C) Keep values within Q1 − 1.5·IQR and Q3 + 1.5·IQR  
D) Remove all values above the mean

> [!success]- Answer
> **Correct Answer: B**
>
> The standard-deviation (z-score) rule keeps values within k standard deviations of the mean, commonly k = 3, and suits roughly symmetric data.
>
> The IQR rule is the alternative for skewed data; percentile trimming and removing everything above the mean are not the standard-deviation method.

---

## Question 23 *(Easy)*

**Question**: A data scientist wants to see the distribution shape (skew, multiple peaks) of the continuous feature `trip_distance`. Which plot is most appropriate?

A) A bar chart of counts per distinct value  
B) A pie chart  
C) A histogram or density plot  
D) A contingency table

> [!success]- Answer
> **Correct Answer: C**
>
> Histograms and density (KDE) plots show the distribution of a continuous feature; box plots add outliers and quartiles.
>
> Bar and pie charts suit categorical frequencies, and contingency tables compare two categorical variables.

---

## Question 24 *(Medium)*

**Question**: Which method is appropriate for checking whether two categorical features, `device_type` and `subscription_tier`, are associated?

A) Pearson correlation of the string values  
B) A cross-tabulation of counts with a chi-square test of independence  
C) A scatter plot  
D) Computing the mean of each column

> [!success]- Answer
> **Correct Answer: B**
>
> A contingency table (`df.stat.crosstab`) shows the joint counts, and a chi-square test checks independence.
>
> Correlation, scatter plots, and means need numeric data.

---

## Question 25 *(Medium)*

**Question**: `house_price` is right-skewed with a few very expensive properties, and some values are missing. Which imputation is most appropriate?

A) Mean  
B) Median  
C) Mode  
D) The maximum value

> [!success]- Answer
> **Correct Answer: B**
>
> The median is robust to skew and outliers; the mean is pulled upward by the expensive properties.
>
> Mode suits categorical data, and the maximum would distort the feature.

---

## Question 26 *(Easy)*

**Question**: Which imputation strategy is appropriate for missing values in a categorical feature such as `browser`?

A) Mean  
B) Median  
C) Mode (most frequent value)  
D) Standard deviation

> [!success]- Answer
> **Correct Answer: C**
>
> Mean and median are undefined for categories; the most frequent value (or an explicit "unknown" level) is used.
>
> Spark's `Imputer` handles numeric columns only, so fill string columns with `fillna`.

---

## Question 27 *(Medium)*

**Question**: For which model is one-hot encoding a nominal feature with 4 levels most clearly appropriate?

A) A random forest, which can split on indexed categories directly  
B) A linear regression, which would otherwise treat the index 0–3 as an ordered magnitude  
C) Any model, for a feature with 100,000 levels  
D) An ordinal feature whose order matters

> [!success]- Answer
> **Correct Answer: B**
>
> Linear and distance-based models interpret numeric codes as magnitudes, so nominal levels should become indicator columns.
>
> Trees often do not need one-hot encoding, very high-cardinality features need other encodings, and ordinal features should keep their order.

---

## Model Development (Questions 28–42)

---

## Question 28 *(Easy)*

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

## Question 29 *(Medium)*

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

## Question 30 *(Easy)*

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

## Question 31 *(Easy)*

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

## Question 32 *(Medium)*

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

## Question 33 *(Medium)*

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

## Question 34 *(Medium)*

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

## Question 35 *(Hard)*

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

## Question 36 *(Easy)*

**Question**: A data scientist wants to apply feature scaling so that each numerical feature has zero mean and unit variance. Which Spark ML feature stage should they use?

A) `Normalizer`  
B) `StandardScaler`  
C) `MinMaxScaler`  
D) `MaxAbsScaler`

> [!success]- Answer
> **Correct Answer: B**
>
> `StandardScaler` standardizes features by removing the mean and scaling to unit variance (z-score normalization). `Normalizer` scales rows to unit norm (not column-wise). `MinMaxScaler` scales to a [0, 1] range. `MaxAbsScaler` scales by the maximum absolute value.

---

## Question 37 *(Medium)*

**Question**: A data scientist uses Hyperopt to tune a scikit-learn `GradientBoostingClassifier` and wants up to 6 trials to run at once on the cluster's workers. Which `fmin` call is appropriate?

A) `fmin(fn=objective, space=space, algo=tpe.suggest, max_evals=60, trials=Trials())`  
B) `fmin(fn=objective, space=space, algo=tpe.suggest, max_evals=60, trials=SparkTrials(parallelism=6))`  
C) `fmin(fn=objective, space=space, algo=rand.suggest, max_evals=6)`  
D) `CrossValidator(estimator=objective, parallelism=6)`

> [!success]- Answer
> **Correct Answer: B**
>
> `SparkTrials` parallelises single-machine models such as scikit-learn across Spark workers; `parallelism` caps concurrent trials.
>
> `Trials()` runs sequentially on the driver, and `CrossValidator` tunes Spark ML estimators, not Python objective functions.

---

## Question 38 *(Medium)*

**Question**: A `GridSearchCV` uses `{"max_depth": [3, 5, 7, 9], "min_samples_leaf": [1, 5, 10]}` with `cv=3`. How many models are trained during the grid search, not counting the final refit?

A) 7  
B) 12  
C) 21  
D) 36

> [!success]- Answer
> **Correct Answer: D**
>
> The grid has 4 × 3 = 12 combinations and 3-fold CV trains 3 models per combination: 12 × 3 = 36.
>
> With `refit=True` (the default) one more model is then trained on all the data.

---

## Question 39 *(Medium)*

**Question**: Only 8 % of training rows belong to the positive class. Which technique directly counters the model's bias toward the majority class?

A) Standardise all features  
B) Collect more majority-class rows  
C) Assign a higher weight to minority-class rows during training (cost-sensitive learning)  
D) Shuffle the rows before training

> [!success]- Answer
> **Correct Answer: C**
>
> Class weights or cost-sensitive learning make minority-class errors more expensive; resampling the training split is the alternative.
>
> Scaling, more majority data, and shuffling do not change the class balance the model optimises for.

---

## Question 40 *(Medium)*

**Question**: A spam filter sends messages it flags to a hidden folder, and users are very unhappy when legitimate mail is hidden. Which metric best reflects this concern?

A) Recall  
B) Precision  
C) RMSE  
D) R²

> [!success]- Answer
> **Correct Answer: B**
>
> Precision = TP / (TP + FP) measures how many flagged messages really are spam, so it penalises hiding legitimate mail.
>
> Recall focuses on missed spam; RMSE and R² are regression metrics.

---

## Question 41 *(Medium)*

**Question**: A model was trained on `log1p(sales)`. Before reporting MAE in units of sales, what must be done?

A) Nothing — MAE is scale-free  
B) Apply `expm1` to the predictions and compare them with the original `sales` values  
C) Apply `log1p` to the predictions again  
D) Divide the MAE by the mean of `sales`

> [!success]- Answer
> **Correct Answer: B**
>
> Predictions are in log space; invert the transform (`expm1` for `log1p`, `exp` for `log`) and evaluate against the original labels.
>
> MAE is in the target's units, so log-space MAE is not in sales units.

---

## Question 42 *(Hard)*

**Question**: A model shows 2 % training error and 25 % validation error. Which change is most likely to help?

A) Increase model complexity  
B) Train for more epochs without other changes  
C) Reduce model complexity or add regularization (or more training data)  
D) Remove the validation set

> [!success]- Answer
> **Correct Answer: C**
>
> Low training error with much higher validation error is high variance (overfitting); simplify the model, regularise, or add data.
>
> Adding complexity or training longer worsens overfitting; removing validation hides the problem.

---

## Model Deployment (Questions 43–48)

---

## Question 43 *(Medium)*

**Question**: A data scientist must score 50 million rows in a Spark DataFrame with the registered model `ml.retail.mymodel`. Which approach is correct?

A) `mlflow.pyfunc.load_model("models:/ml.retail.mymodel@champion").predict(spark_df.toPandas())`  
B) `predict_udf = mlflow.pyfunc.spark_udf(spark, "models:/ml.retail.mymodel@champion")`, then `spark_df.withColumn("prediction", predict_udf(*feature_cols))`  
C) POST `spark_df.toPandas().to_dict()` to a serving endpoint in one request  
D) `spark_df.rdd.map(model.predict).collect()` with a scikit-learn model loaded on the driver

> [!success]- Answer
> **Correct Answer: B**
>
> `spark_udf` distributes the model to the workers and scores partitions in parallel pandas batches.
>
> `toPandas()` on 50 million rows collects everything to the driver (out-of-memory risk), one HTTP request with 50 million rows is not feasible, and mapping a driver-side model over an RDD and collecting the results does not scale.

---

## Question 44 *(Medium)*

**Question**: Card transactions arrive continuously and each must be scored for fraud within seconds, with the score written to a Delta table for investigators. Which serving approach fits best?

A) A nightly batch job  
B) Streaming inference with the model applied to the incoming stream  
C) A real-time endpoint called by investigators on demand  
D) Weekly retraining only

> [!success]- Answer
> **Correct Answer: B**
>
> Continuously arriving events scored within seconds and stored in a table is the streaming pattern (for example a Delta Live Tables pipeline with the model as a Spark UDF).
>
> Nightly batch is too late, and an on-demand endpoint does not score every transaction as it arrives.

---

## Question 45 *(Medium)*

**Question**: How is streaming inference typically implemented in a Delta Live Tables pipeline?

A) Delta Live Tables calls the workspace's default serving endpoint for each row  
B) Load the registered model with `mlflow.pyfunc.spark_udf` and apply it to `spark.readStream` data in a pipeline table definition  
C) Delta Live Tables trains a new model on every micro-batch  
D) Delta Live Tables only supports batch, so a separate tool is required

> [!success]- Answer
> **Correct Answer: B**
>
> The model runs in-process as a Spark UDF inside a streaming table; the pipeline handles checkpoints, retries, and autoscaling.
>
> Delta Live Tables is now called Lakeflow Spark Declarative Pipelines; the pattern is unchanged.

---

## Question 46 *(Medium)*

**Question**: A team needs an endpoint that returns a fraud probability plus a decision string computed from business rules that are not part of the trained model. What should they deploy?

A) The raw scikit-learn model, with rules implemented in every client  
B) A custom `mlflow.pyfunc.PythonModel` that wraps the model and the rules, logged with `mlflow.pyfunc.log_model`, registered in Unity Catalog, and served from a Model Serving endpoint  
C) A SQL view containing the rules  
D) A notebook uploaded to Model Serving

> [!success]- Answer
> **Correct Answer: B**
>
> Custom pyfunc models package arbitrary Python logic with the model so the endpoint returns exactly what callers need.
>
> Endpoints serve registered MLflow models, not views or notebooks.

---

## Question 47 *(Easy)*

**Question**: Which request body is valid for querying a custom model endpoint with two rows of tabular data?

A) `{"dataframe_split": {"columns": ["a", "b"], "data": [[1, 2], [3, 4]]}}`  
B) `{"rows": [[1, 2], [3, 4]]}`  
C) `{"spark_df": "a,b\n1,2\n3,4"}`  
D) `{"predict": [1, 2, 3, 4]}`

> [!success]- Answer
> **Correct Answer: A**
>
> `dataframe_split` (recommended) and `dataframe_records` are the tabular formats; `instances` and `inputs` are tensor formats.
>
> The other keys are not accepted.

---

## Question 48 *(Medium)*

**Question**: A team wants 10 % of live requests to go to a new model version while 90 % stay on the current one, on the same endpoint. What should they configure?

A) Give the new version the `challenger` alias  
B) Two served entities on the endpoint with `traffic_config` routes of 90 and 10  
C) A tag `traffic=10` on the new version  
D) A second workspace

> [!success]- Answer
> **Correct Answer: B**
>
> An endpoint can serve several versions, and `traffic_config.routes` sets each one's `traffic_percentage` (summing to 100).
>
> Aliases and tags are registry metadata and do not route traffic.

---

**End of Mock Exam 1 — 48 Questions**

[← Back to Mock Exam Instructions](./README.md) | [Try Mock Exam 2 →](../mock-exam-2/README.md)

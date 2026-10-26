---
title: Practice Questions — Feature Engineering
type: practice-questions
tags: [ml-associate, practice-questions, feature-engineering, spark-ml, feature-store]
status: published
---

# Practice Questions — Spark ML Pipelines, Tuning & Feature Tables (Sections 1 & 3)

15 questions covering Spark ML pipelines, `VectorAssembler`, `CrossValidator` (**Section 3: Model Development, 31 %**) and feature tables in Unity Catalog (**Section 1: Databricks Machine Learning, 38 %**). Study material: [Spark ML Pipelines](../../03-model-development/01-spark-ml-pipelines.md), [Hyperparameter Tuning](../../03-model-development/02-hyperparameter-tuning.md), [Feature Store in Unity Catalog](../../01-databricks-machine-learning/04-feature-store.md).

[← Back to Practice Questions](./README.md) | [Next: Model Registry & Deployment →](./04-mlflow-deployment.md)

---

## Question 1: VectorAssembler Required Parameters

**Question** *(Easy)*: A data scientist wants to use `VectorAssembler` to combine columns `age`, `income`, and `credit_score` into a single feature vector column called `features`. Which code is correct?

A) `VectorAssembler(inputCol=["age", "income", "credit_score"], outputCol="features")`  
B) `VectorAssembler(inputCols=["age", "income", "credit_score"], outputCol="features")`  
C) `VectorAssembler(columns=["age", "income", "credit_score"], output="features")`  
D) `VectorAssembler(features=["age", "income", "credit_score"], label="features")`

> [!success]- Answer
> **Correct Answer: B**
>
> `VectorAssembler` requires `inputCols` (plural, a list of column names) and `outputCol` (singular, the output column name). Using `inputCol` (singular) is the common mistake — `VectorAssembler` always takes a list, so the parameter is always plural. The other options use non-existent parameter names.

---

## Question 2: Pipeline Stage Ordering — StringIndexer and OneHotEncoder

**Question** *(Medium)*: A data scientist wants to one-hot encode a categorical column `color`. Which stage ordering in the Pipeline is correct?

A) `OneHotEncoder` → `StringIndexer`  
B) `StringIndexer` → `OneHotEncoder`  
C) `VectorAssembler` → `StringIndexer` → `OneHotEncoder`  
D) `OneHotEncoder` can be applied directly to a string column without `StringIndexer`

> [!success]- Answer
> **Correct Answer: B**
>
> `StringIndexer` must come before `OneHotEncoder`. `StringIndexer` converts string categories to numeric indices (e.g., "red" → 0, "blue" → 1). `OneHotEncoder` then converts those integer indices into sparse binary vectors. `OneHotEncoder` does not accept raw string columns — it requires numeric index input.

---

## Question 3: Pipeline fit() vs transform()

**Question** *(Medium)*: A data scientist creates a `Pipeline` with a `StringIndexer` and a `LogisticRegression` estimator. They call `pipeline.fit(train_df)`. What is returned?

A) A trained `LogisticRegressionModel` object  
B) A `PipelineModel` object containing fitted stages  
C) The original `Pipeline` object with updated parameters  
D) A pandas DataFrame with predictions

> [!success]- Answer
> **Correct Answer: B**
>
> `Pipeline.fit(df)` returns a `PipelineModel`, not a single model object. The `PipelineModel` contains all the fitted stages — in this case, a fitted `StringIndexerModel` and a fitted `LogisticRegressionModel`. You then call `pipeline_model.transform(test_df)` to generate predictions.

---

## Question 4: PipelineModel transform()

**Question** *(Easy)*: After fitting a `Pipeline`, a data scientist calls `pipeline_model.transform(test_df)`. What does this return?

A) A new `Pipeline` object trained on `test_df`  
B) A `PipelineModel` with updated weights  
C) A Spark DataFrame with new columns added by each stage  
D) A Python dictionary of model metrics

> [!success]- Answer
> **Correct Answer: C**
>
> `PipelineModel.transform(df)` applies each stage's `transform()` method sequentially and returns a new Spark DataFrame. Each stage adds one or more columns. For example, a `VectorAssembler` adds a `features` column, and a fitted classifier adds a `prediction` column.

---

## Question 5: CrossValidator numFolds Default

**Question** *(Easy)*: A data scientist creates a `CrossValidator` without specifying `numFolds`. How many folds will be used by default?

A) 5  
B) 10  
C) 3  
D) 2

> [!success]- Answer
> **Correct Answer: C**
>
> The default value of `numFolds` in `CrossValidator` is 3. This means the data is split into 3 equal folds, and the model is trained and evaluated 3 times, each time using a different fold as the validation set. You can override this with `numFolds=5` or `numFolds=10` for more robust estimates.

---

## Question 6: ParamGridBuilder Syntax

**Question** *(Medium)*: A data scientist wants to search over two values of `regParam` (0.01 and 0.1) and two values of `maxIter` (10 and 100) for a `LogisticRegression` model. Which code correctly builds the parameter grid?

A) `ParamGridBuilder().addGrid(lr.regParam, [0.01, 0.1]).addGrid(lr.maxIter, [10, 100]).build()`  
B) `ParamGridBuilder().add(lr.regParam, [0.01, 0.1]).add(lr.maxIter, [10, 100])`  
C) `ParamGridBuilder(lr.regParam=[0.01, 0.1], lr.maxIter=[10, 100]).build()`  
D) `{"regParam": [0.01, 0.1], "maxIter": [10, 100]}` passed directly as `estimatorParamMaps`

> [!success]- Answer
> **Correct Answer: A**
>
> `ParamGridBuilder` uses a builder pattern with chained `.addGrid(param, values)` calls followed by `.build()`, which returns the list of param maps (here 2 × 2 = 4 combinations). The `param` argument must be the actual parameter object from the estimator (e.g., `lr.regParam`), not a string.
>
> There is no `.add()` method, the constructor does not accept keyword arguments, and a plain dictionary is not a valid `estimatorParamMaps` value.

---

## Question 7: CrossValidator vs TrainValidationSplit

**Question** *(Medium)*: A data scientist has a small dataset of 5,000 rows. They want to select hyperparameters using the most statistically reliable method. Which Spark ML class should they use?

A) `TrainValidationSplit` — it is faster and more reliable on small datasets  
B) `CrossValidator` — it performs k-fold cross-validation, providing more reliable estimates on small datasets  
C) `ParamGridBuilder` — it directly selects the best hyperparameter combination  
D) `Pipeline` — it automatically performs cross-validation when `numFolds` is set

> [!success]- Answer
> **Correct Answer: B**
>
> `CrossValidator` performs k-fold cross-validation, which provides more reliable hyperparameter estimates because every data point is used for both training and validation across different folds. This is especially valuable on small datasets. `TrainValidationSplit` uses a single random split, which is faster but less reliable on small datasets. `ParamGridBuilder` and `Pipeline` do not perform cross-validation themselves.

---

## Question 8: Feature Table Primary Keys in Unity Catalog

**Question** *(Easy)*: A data scientist calls `FeatureEngineeringClient().create_table(name="ml.features.customers", df=features_df)` without specifying `primary_keys`. What happens?

A) The feature table is created with an auto-generated UUID as the primary key  
B) The call fails because `primary_keys` is a required argument  
C) The feature table is created with no primary key, allowing duplicate rows  
D) The feature table is created using the first column as the default primary key

> [!success]- Answer
> **Correct Answer: B**
>
> `primary_keys` is a required argument of `FeatureEngineeringClient.create_table` (it has no default). In Unity Catalog a feature table *is* a Delta table with a primary key; the key is what lookups, training-set joins, `score_batch`, and online publishing use to find rows.
>
> No key is ever invented for you. The legacy workspace `FeatureStoreClient.create_table` also required primary keys.

---

## Question 9: Writing to a Feature Table

**Question** *(Medium)*: A data scientist wants to update an existing Unity Catalog feature table with new and changed rows while preserving existing rows that are not in the new DataFrame. Which `FeatureEngineeringClient.write_table()` call is correct?

A) `fe.write_table(name=..., df=new_df, mode="overwrite")`  
B) `fe.write_table(name=..., df=new_df, mode="append")`  
C) `fe.write_table(name=..., df=new_df, mode="merge")`  
D) `fe.write_table(name=..., df=new_df, mode="update")`

> [!success]- Answer
> **Correct Answer: C**
>
> `mode="merge"` upserts by primary key: matching keys are updated, new keys are inserted, and rows whose key is not in the DataFrame stay unchanged. In `FeatureEngineeringClient` it is the only supported `write_table` mode (and the default).
>
> To fully replace the data you would delete rows or recreate the table first; `append` and `update` are not `write_table` modes.

---

## Question 10: Scoring with Feature Tables

**Question** *(Medium)*: A model was trained on Unity Catalog feature tables and logged with `fe.log_model(...)`. A data scientist has a DataFrame containing only `customer_id` values to score. Which call retrieves the features and scores the batch?

A) `fe.predict(model_uri, entities_df)`  
B) `fe.score_batch(model_uri=model_uri, df=entities_df)`  
C) `mlflow.pyfunc.load_model(model_uri).transform(entities_df)`  
D) `fe.read_table(name=feature_table_name).join(entities_df)`

> [!success]- Answer
> **Correct Answer: B**
>
> `FeatureEngineeringClient.score_batch(model_uri, df)` reads the feature-lookup metadata packaged by `fe.log_model`, joins the required features to the input keys, and applies the model — the same feature definitions as training, so no training-serving skew.
>
> There is no `fe.predict`, a pyfunc model has `predict` rather than `transform`, and `read_table(...).join(...)` only fetches features without scoring.

---

## Question 11: Point-in-Time Lookups

**Question** *(Medium)*: Why do feature tables in Unity Catalog support point-in-time lookups?

A) To ensure features are computed faster using parallel processing  
B) To prevent data leakage by retrieving feature values as they existed at the time of each training label's event  
C) To allow real-time feature updates without retraining the model  
D) To automatically version all feature tables when new data is ingested

> [!success]- Answer
> **Correct Answer: B**
>
> Point-in-time lookups (a `timestamp_lookup_key` on the `FeatureLookup`) retrieve the feature values that were available at the exact moment each training label was generated. This prevents data leakage, which occurs when future information is used to predict a past event. For example, when predicting a customer's purchase at time T, only features available before or at time T should be used.

---

## Question 12: Train-Serve Skew Prevention

**Question** *(Hard)*: A data scientist trains a model using manually computed features in their notebook. In production, a different team recomputes those features. The model's production accuracy is lower than its training accuracy. What is the most likely cause?

A) The production cluster has fewer cores than the training cluster  
B) Train-serve skew — the feature computation logic differs between training and serving  
C) The MLflow model version in production is different from the one that was tested  
D) The production Delta table uses a different partition scheme

> [!success]- Answer
> **Correct Answer: B**
>
> Train-serve skew occurs when the features used at training time are computed differently from those computed at serving time. Even small differences in logic (e.g., different null handling, different aggregation windows) can cause significant accuracy degradation. Feature tables in Unity Catalog prevent this by centralizing feature definitions: a model logged with `fe.log_model` gets its features from the same tables at training, batch scoring, and serving time.

---

## Question 13: Estimator vs Transformer in Pipeline

**Question** *(Medium)*: Which of the following Spark ML classes is an `Estimator` (requires `fit()`) rather than a `Transformer` (only requires `transform()`)?

A) `VectorAssembler`  
B) `Bucketizer`  
C) `StandardScaler`  
D) `SQLTransformer`

> [!success]- Answer
> **Correct Answer: C**
>
> `StandardScaler` is an `Estimator` because it must learn the mean and standard deviation of the training data during `fit()` before it can scale new data. `VectorAssembler`, `Bucketizer`, and `SQLTransformer` are all `Transformer` classes — they do not learn from data and can apply their transformations directly without fitting.

---

## Question 14: Feature Lookup in Feature Store

**Question** *(Easy)*: When building a training set from Unity Catalog feature tables, a data scientist specifies a `FeatureLookup`. What is the purpose of the `lookup_key` parameter?

A) It specifies the primary key column in the feature table to join on  
B) It specifies the MLflow run ID used to retrieve the feature values  
C) It specifies the encryption key for secure feature retrieval  
D) It specifies the maximum number of features to retrieve

> [!success]- Answer
> **Correct Answer: A**
>
> The `lookup_key` parameter in `FeatureLookup` specifies the column in the training dataset that maps to the primary key in the feature table. This enables `create_training_set` to join the training DataFrame with the feature table to retrieve the correct feature values for each entity.

---

## Question 15: Pipeline with CrossValidator

**Question** *(Hard)*: A data scientist wraps a `Pipeline` inside a `CrossValidator`. When `CrossValidator.fit(train_df)` is called, what happens?

A) The Pipeline is fit once on the full training set, then evaluated on a held-out test set  
B) The Pipeline is fit and evaluated K times using K-fold splits, and the best hyperparameter combination is selected  
C) The Pipeline stages are fit independently, and CrossValidator only tunes the final estimator  
D) The Pipeline is converted to a single estimator before cross-validation begins

> [!success]- Answer
> **Correct Answer: B**
>
> When a `Pipeline` is used as the estimator inside `CrossValidator`, the entire pipeline (all stages) is fit and evaluated K times across K folds for each hyperparameter combination in the `ParamGrid`. This ensures that preprocessing stages like `StringIndexer` and `VectorAssembler` are fit only on training data in each fold, preventing data leakage from the validation fold.

---

**[← Previous: MLflow Tracking & Experiments](./02-ml-workflows.md) | [↑ Back to Practice Questions — ML Associate](./README.md) | [Next: Model Registry & Deployment →](./04-mlflow-deployment.md)**

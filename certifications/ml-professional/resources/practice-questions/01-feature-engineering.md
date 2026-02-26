---
title: Feature Engineering Practice Questions
type: practice-questions
tags: [ml-professional, practice-questions, feature-engineering, feature-store]
---

# Advanced Feature Engineering — Practice Questions

[← Back to Practice Questions](./README.md) | [Next: Hyperparameter Optimization](./02-hyperparameter-optimization.md)

---

## Question 1 *(Medium)*: Online vs Offline Feature Store Selection

**Question**: A recommendation model needs to return personalized results within 50ms of a user clicking a product page. Pre-computed user embeddings are updated nightly. Which feature store configuration is most appropriate?

A) Offline feature store only — read feature values from Delta Lake at request time
B) Online feature store — publish features to low-latency key-value store; model reads at serving time
C) Recompute features from raw events inside the model serving endpoint
D) Cache features in the driver node's memory between requests

> [!success]- Answer
> **Correct Answer: B) Online feature store — publish features to low-latency key-value store; model reads at serving time**
>
> The online feature store is designed for sub-100ms serving latency. It holds a copy of features in a
> low-latency key-value store (e.g., DynamoDB or Cosmos DB) so the serving endpoint can retrieve them
> in single-digit milliseconds. Reading from Delta Lake (option A) incurs seconds of latency due to file
> I/O and query planning, making it unsuitable for real-time serving requirements.

---

## Question 2 *(Medium)*: Primary Key Requirement for write_table()

**Question**: A data engineer calls `FeatureEngineeringClient.write_table()` to persist a feature DataFrame to the feature store. The call raises a `MlflowException`. What is the most likely cause?

A) The DataFrame contains null values in non-key columns
B) The target feature table does not yet exist in Unity Catalog
C) The DataFrame is missing the primary key column defined on the feature table
D) The Spark session is not connected to a GPU-enabled cluster

> [!success]- Answer
> **Correct Answer: C) The DataFrame is missing the primary key column defined on the feature table**
>
> Every feature table in Databricks Feature Store requires a primary key. When `write_table()` is
> called, the client validates that the DataFrame contains the primary key column(s) matching the
> table's schema. If the primary key is absent or renamed, the write fails. Null values in non-key
> columns are permitted, and the table can be created implicitly on first write if it does not exist.

---

## Question 3 *(Easy)*: create_training_set() and lookup_key

**Question**: A data scientist uses `FeatureEngineeringClient.create_training_set()` with a `FeatureLookup` to join user features onto a label DataFrame. The label DataFrame has a column `user_id`. Which parameter on `FeatureLookup` connects the label DataFrame to the feature table?

A) `join_key`
B) `primary_key`
C) `lookup_key`
D) `entity_key`

> [!success]- Answer
> **Correct Answer: C) `lookup_key`**
>
> `FeatureLookup` uses the `lookup_key` parameter to specify which column(s) in the label DataFrame
> correspond to the primary key of the feature table. If the column name in the label DataFrame
> matches the primary key name on the feature table, `lookup_key` can be omitted — but when names
> differ, it must be set explicitly. `join_key` and `entity_key` are not valid parameter names for
> this API.

---

## Question 4 *(Medium)*: Point-in-Time Correct Feature Retrieval

**Question**: A fraud detection model is trained on historical transactions. Each transaction has an `event_timestamp`. The data scientist wants to ensure that feature values joined to each transaction reflect only information available at the moment the transaction occurred, avoiding future leakage. Which parameter enables this in `FeatureLookup`?

A) `feature_names` — list only features recorded before the event
B) `timestamp_lookup_key` — specifies the column used for point-in-time correct joins
C) `as_of_delta_version` — reads the Delta table version at the transaction time
D) `max_lookback_days` — limits how far back in time features are retrieved

> [!success]- Answer
> **Correct Answer: B) `timestamp_lookup_key` — specifies the column used for point-in-time correct joins**
>
> Setting `timestamp_lookup_key` on a `FeatureLookup` instructs `create_training_set()` to perform a
> point-in-time correct join: for each row in the label DataFrame, it retrieves the feature values
> whose timestamp is the most recent one that does not exceed the value in `timestamp_lookup_key`.
> This prevents future feature values from leaking into training data. The other options do not exist
> as valid API parameters for this purpose.

---

## Question 5 *(Easy)*: Feature Lineage via log_model()

**Question**: A team wants to track which feature table versions were used to train each model version, enabling them to reproduce training data for any registered model. Which method establishes this lineage automatically in Databricks?

A) `mlflow.sklearn.log_model()` with `registered_model_name` set
B) `FeatureEngineeringClient.log_model()` with the `training_set` parameter
C) `mlflow.log_artifact()` with the feature table Delta log path
D) `mlflow.set_tag("feature_table", table_name)` before logging the model

> [!success]- Answer
> **Correct Answer: B) `FeatureEngineeringClient.log_model()` with the `training_set` parameter**
>
> `FeatureEngineeringClient.log_model()` accepts a `training_set` object (the output of
> `create_training_set()`) and records the exact feature tables, primary keys, and feature names used
> during training as part of the MLflow run metadata. This creates auditable lineage between every
> model version and its source features. Using `mlflow.sklearn.log_model()` directly does not capture
> feature store lineage.

---

## Question 6 *(Medium)*: Automatic Feature Retrieval at Inference Time

**Question**: A model was logged with `FeatureEngineeringClient.log_model()` and deployed to a Databricks Model Serving endpoint. At inference time the client sends only `customer_id` in the request payload. How does the endpoint obtain the full set of feature values needed for prediction?

A) The client must send all feature values in the request payload alongside `customer_id`
B) The endpoint retrains a lightweight feature computation step on every request
C) The model's pyfunc wrapper automatically retrieves features from the online store using `customer_id` as the lookup key
D) A separate microservice must be called first to hydrate features before hitting the model endpoint

> [!success]- Answer
> **Correct Answer: C) The model's pyfunc wrapper automatically retrieves features from the online store using `customer_id` as the lookup key**
>
> When a model is logged via `FeatureEngineeringClient.log_model()`, Databricks packages a pyfunc
> wrapper that knows which features to look up and from which feature tables. At serving time, the
> wrapper uses the lookup key(s) from the request to fetch feature values from the online store and
> assembles the full feature vector before calling the underlying model's predict function. This
> eliminates the need for callers to know the feature schema.

---

## Question 7 *(Hard)*: Train-Serving Skew Root Cause

**Question**: A production model shows higher error rates on live data than on the held-out test set, even though the input distribution has not shifted. What is the most likely root cause?

A) The model was not registered in Unity Catalog before deployment
B) The online feature store was not refreshed after training completed
C) Feature values are computed differently between training (batch ETL) and serving (online lookup)
D) The serving endpoint uses a different Python version than the training cluster

> [!success]- Answer
> **Correct Answer: C) Feature values are computed differently between training (batch ETL) and serving (online lookup)**
>
> Train-serving skew occurs when the feature engineering logic applied during training differs from
> the logic used at serving time — for example, a mean imputation computed on the full dataset during
> training versus a hardcoded constant at serving time. Even when the raw input distribution is
> stable, inconsistent feature computation produces systematically different feature vectors, degrading
> model accuracy. Using the Feature Engineering Client's `log_model()` and online store helps mitigate
> this by ensuring the same feature definitions are used in both paths.

---

## Question 8 *(Easy)*: publish_online_features()

**Question**: A team has a feature table stored in Delta Lake (offline store). They want to make those features available for sub-10ms lookups from a model serving endpoint. What is the correct next step?

A) Copy the Delta table to a Parquet file on object storage accessible to the endpoint
B) Call `FeatureEngineeringClient.publish_online_features()` to sync features to the online store
C) Register the Delta table as an external table in Unity Catalog
D) Mount the Delta table path as a DBFS mount accessible from the serving cluster

> [!success]- Answer
> **Correct Answer: B) Call `FeatureEngineeringClient.publish_online_features()` to sync features to the online store**
>
> `publish_online_features()` pushes feature data from the offline Delta-backed store into the
> configured online store (e.g., DynamoDB or Cosmos DB), which supports single-digit millisecond
> read latency required for real-time serving. The offline Delta table serves as the source of truth
> for batch training, while the online store serves real-time inference. The other options do not
> provide the low-latency key-value access pattern that serving requires.

---

## Question 9 *(Easy)*: Feature Table Schema Requirements

**Question**: A data scientist attempts to create a feature table using `FeatureEngineeringClient.create_table()`. Which combination of requirements must be satisfied for the call to succeed?

A) The table must have at least one primary key column and a numeric data type for all feature columns
B) The table must have at least one primary key column; feature columns can be any supported Spark data type
C) The table must have a composite primary key of exactly two columns
D) The table must include a timestamp column alongside the primary key

> [!success]- Answer
> **Correct Answer: B) The table must have at least one primary key column; feature columns can be any supported Spark data type**
>
> Databricks Feature Store requires at least one primary key column to enable feature lookups. Feature
> columns themselves support any Spark SQL data type including strings, arrays, maps, and structs —
> they are not restricted to numeric types. A timestamp column is optional and only needed when
> point-in-time correct lookups are required. There is no requirement for a composite key.

---

## Question 10 *(Easy)*: Creating a Training Dataset

**Question**: Which `FeatureEngineeringClient` method generates a training dataset by joining a label DataFrame with feature values from one or more feature tables?

A) `get_training_set()`
B) `join_features()`
C) `create_training_set()`
D) `build_dataset()`

> [!success]- Answer
> **Correct Answer: C) `create_training_set()`**
>
> `create_training_set()` is the designated API for building a training dataset. It accepts a label
> DataFrame, a list of `FeatureLookup` objects (specifying which feature tables and columns to join),
> and optional parameters like `timestamp_lookup_key` for point-in-time joins. The returned
> `TrainingSet` object can then be materialized with `.load_df()` or passed directly to
> `log_model()`. None of the other method names (`get_training_set`, `join_features`,
> `build_dataset`) exist in the Databricks Feature Engineering Client API.

---

## Question 11 *(Easy)*: Delta Lake as the Offline Store

**Question**: A data engineer asks why feature data stored via `FeatureEngineeringClient.write_table()` supports time travel queries. What is the underlying reason?

A) The Feature Engineering Client maintains a separate audit log table for each feature table
B) Feature tables are backed by Delta Lake, which retains a transaction log and data file snapshots
C) Databricks automatically creates a history table with `_HIST` suffix for every feature table
D) The Feature Engineering Client snapshots feature values to DBFS on each write

> [!success]- Answer
> **Correct Answer: B) Feature tables are backed by Delta Lake, which retains a transaction log and data file snapshots**
>
> Databricks Feature Store uses Delta Lake as the underlying storage format for offline feature tables.
> Delta Lake's transaction log records every write operation along with the data files associated with
> each version. This means you can query any historical version of a feature table using `VERSION AS OF`
> or `TIMESTAMP AS OF` syntax, which is foundational to point-in-time correct feature retrieval during
> training.

---

## Question 12 *(Medium)*: Online Store vs Passing Features Directly

**Question**: A batch scoring pipeline scores 10 million customer records nightly. Features are already computed and stored in a Delta table. A teammate suggests configuring the online store to serve these features. When is this suggestion necessary?

A) Always — the online store is required for all model serving regardless of latency requirements
B) Only when the serving endpoint must retrieve individual feature records in real time with low latency
C) Only when the feature table exceeds 1 TB
D) Only when Unity Catalog is not enabled

> [!success]- Answer
> **Correct Answer: B) Only when the serving endpoint must retrieve individual feature records in real time with low latency**
>
> The online store is designed for real-time, low-latency point lookups (single-digit milliseconds)
> by entity key. For a nightly batch pipeline, the model can read features directly from the offline
> Delta table using Spark — no online store is required. Publishing to the online store adds
> operational complexity (cost, sync pipelines) that is only justified when individual records must
> be retrieved in sub-100ms for interactive serving.

---

## Question 13 *(Easy)*: Feature Sharing Across Teams with Unity Catalog

**Question**: Team A has created a feature table `catalog_a.features.customer_ltv`. Team B wants to use this feature table to train their own model. What must Team A do to enable this?

A) Export the feature table to a shared DBFS path that Team B can read
B) Grant Team B the appropriate privilege on the feature table in Unity Catalog
C) Duplicate the feature table into Team B's catalog
D) Convert the feature table to a view and share the view definition

> [!success]- Answer
> **Correct Answer: B) Grant Team B the appropriate privilege on the feature table in Unity Catalog**
>
> Feature tables stored in Unity Catalog are governed by UC's fine-grained permission model. Team A
> can grant `SELECT` (and optionally `USE CATALOG` / `USE SCHEMA`) privileges to Team B's principal
> (user, group, or service principal) without any data duplication. This is one of the key benefits
> of Unity Catalog: centralized governance enables secure, auditable feature sharing across teams
> within the same account.

---

## Question 14 *(Hard)*: Avoiding Data Leakage with Point-in-Time Lookups

**Question**: A model predicts whether a customer will churn in the next 30 days. The training data contains churn labels from the past year. A data scientist joins customer activity features without using `timestamp_lookup_key`. What is the likely consequence?

A) The join will fail because `FeatureLookup` requires a timestamp column
B) All feature values will default to zero for historical rows
C) Future feature values will leak into the training data, inflating model performance metrics
D) The model will train correctly but fail to deploy due to a schema mismatch

> [!success]- Answer
> **Correct Answer: C) Future feature values will leak into the training data, inflating model performance metrics**
>
> Without `timestamp_lookup_key`, `create_training_set()` uses the latest feature values for every
> row in the label DataFrame, regardless of when each label was generated. For historical training
> examples, this means features computed using data from the future (e.g., a customer's total logins
> in the month after the label date) are incorrectly joined. This makes the model appear more accurate
> during evaluation than it will be in production, a form of data leakage.

---

## Question 15 *(Hard)*: Feature Versioning via Delta Table Versions

**Question**: A data scientist needs to reproduce the exact training dataset used to train model version 12, which was trained six months ago. The feature table has had many updates since then. How does Databricks enable this?

A) The Feature Engineering Client stores a snapshot of every training dataset as a compressed artifact in MLflow
B) Because feature tables are backed by Delta Lake, the model run's metadata records the Delta table version at training time, enabling `VERSION AS OF` queries
C) Databricks automatically creates a read-only clone of the feature table for every `create_training_set()` call
D) You must manually checkpoint the Delta table before each training run to enable later reproduction

> [!success]- Answer
> **Correct Answer: B) Because feature tables are backed by Delta Lake, the model run's metadata records the Delta table version at training time, enabling `VERSION AS OF` queries**
>
> When `FeatureEngineeringClient.log_model()` is called with a `training_set`, Databricks records
> the Delta table version(s) used for each feature table in the MLflow run's metadata. Because Delta
> Lake retains its transaction log (subject to the configured VACUUM retention period), a data
> scientist can reconstruct the exact feature DataFrame from six months ago by querying the feature
> table `VERSION AS OF <recorded_version>`. This makes reproducibility a first-class concern in
> the feature store design.

---

**[↑ Back to ML Professional Practice Questions](./README.md) | [Next: "Practice Questions - Hyperparameter Optimization"](./02-hyperparameter-optimization.md) →**

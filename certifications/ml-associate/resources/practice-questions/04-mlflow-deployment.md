---
title: Practice Questions — MLflow Deployment
type: practice-questions
tags: [ml-associate, practice-questions, mlflow, deployment, model-registry]
status: published
---

# Practice Questions — Model Registry & Deployment (Sections 1 & 4)

8 questions covering model registration and aliases in Unity Catalog (**Section 1: Databricks Machine Learning, 38 %**), plus batch scoring with `spark_udf` and serving endpoints (**Section 4: Model Deployment, 12 %**). Study material: [Model Registry in Unity Catalog](../../01-databricks-machine-learning/07-model-registry.md), [Model Deployment & Serving](../../04-model-deployment/01-model-deployment-serving.md).

[← Back to Practice Questions](./README.md) | [Next: Unity Catalog, MLOps & MLflow Client →](./05-unity-catalog-mlops.md)

---

## Question 1: register_model URI Format

**Question** *(Easy)*: A data scientist has trained a model and its `run_id` is `abc123`. The model was logged with `mlflow.sklearn.log_model(model, artifact_path="model")`. With the registry URI set to `databricks-uc`, which call registers it as `ml.fraud.detector` in Unity Catalog?

A) `mlflow.register_model("model/abc123", "ml.fraud.detector")`  
B) `mlflow.register_model("runs:/abc123/model", "ml.fraud.detector")`  
C) `mlflow.register_model("mlflow:/abc123/model", "ml.fraud.detector")`  
D) `mlflow.register_model("artifacts:/abc123/model", "ml.fraud.detector")`

> [!success]- Answer
> **Correct Answer: B**
>
> The URI for a model logged in a run is `runs:/<run_id>/<artifact_path>` — here `runs:/abc123/model` — and Unity Catalog model names are three-level `catalog.schema.model`. The `mlflow:/` and `artifacts:/` schemes do not exist.
>
> In MLflow 3, `log_model` also returns a `models:/<model_id>` URI you can register directly.

---

## Question 2: Promoting a Version with an Alias

**Question** *(Medium)*: Version 3 of the Unity Catalog model `ml.churn.predictor` has passed validation. Production scoring code loads `models:/ml.churn.predictor@champion`. Which call makes production use version 3?

A) `MlflowClient().transition_model_version_stage("ml.churn.predictor", 3, "Production")`  
B) `MlflowClient().set_registered_model_alias("ml.churn.predictor", "champion", 3)`  
C) `MlflowClient().set_model_version_tag("ml.churn.predictor", "3", "champion", "true")`  
D) `mlflow.register_model("models:/ml.churn.predictor/3", "ml.churn.predictor")`

> [!success]- Answer
> **Correct Answer: B**
>
> In Unity Catalog, promotion means pointing an **alias** at a version: `set_registered_model_alias(name, "champion", 3)` moves `@champion` to version 3, and code that loads `models:/ml.churn.predictor@champion` picks it up without changes.
>
> Stage transitions are a legacy workspace-registry feature and are not supported in UC. A tag is descriptive metadata and changes nothing that is served. Re-registering creates yet another version.

---

## Question 3: Stages vs Aliases in Unity Catalog

**Question** *(Easy)*: A team migrating from the workspace model registry to Models in Unity Catalog asks which registry feature does **not** carry over. Which one is it?

A) Numbered model versions  
B) Model stages such as `Staging` and `Production`  
C) Tags on registered models and model versions  
D) Loading a specific version with `models:/<name>/<version>`

> [!success]- Answer
> **Correct Answer: B**
>
> "Stages are not supported for models in Unity Catalog." UC uses **aliases** (for example `@champion` / `@challenger`) plus separate catalogs per environment instead.
>
> Versions, tags, and version-number URIs all work in UC.

---

## Question 4: Loading a Registered Model for Inference

**Question** *(Medium)*: A data scientist wants to load whichever version of the Unity Catalog model `ml.pricing.estimator` currently holds the `champion` alias, in a way that works for any model flavor. Which code is correct?

A) `model = mlflow.load_model("models:/ml.pricing.estimator@champion")`  
B) `model = mlflow.pyfunc.load_model("models:/ml.pricing.estimator@champion")`  
C) `model = MlflowClient().load_model("ml.pricing.estimator", alias="champion")`  
D) `model = mlflow.pyfunc.load_model("models:/ml.pricing.estimator/champion")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.pyfunc.load_model()` is the flavor-agnostic loader, and `models:/<name>@<alias>` resolves an alias. `mlflow.load_model()` and `MlflowClient().load_model()` do not exist.
>
> `models:/<name>/<x>` expects a version number (or, in the legacy workspace registry, a stage) — `@` is the alias syntax.

---

## Question 5: spark_udf for Batch Scoring

**Question** *(Medium)*: A data scientist wants to score a Spark DataFrame of 10 million customer records using a registered MLflow model. Which approach is most appropriate for distributed batch scoring?

A) Load the model with `mlflow.pyfunc.load_model()` and call `model.predict(df.toPandas())`  
B) Use `mlflow.pyfunc.spark_udf()` to create a UDF and apply it to the Spark DataFrame  
C) Deploy the model to a serving endpoint and send the DataFrame as a single HTTP request  
D) Use `fe.score_batch()` without any model URI

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.pyfunc.spark_udf(spark, model_uri)` creates a Spark UDF that wraps the model, enabling distributed batch scoring across all Spark workers. Calling `.toPandas()` on 10 million rows collects all data to the driver, which can cause out-of-memory errors. Sending 10 million rows in a single HTTP request to a serving endpoint is not feasible. `fe.score_batch()` needs a model URI and a model logged with `fe.log_model`.

---

## Question 6: spark_udf Usage Pattern

**Question** *(Medium)*: A data scientist creates a `spark_udf` from a registered model. Which option correctly creates and applies the UDF to a DataFrame `df` that has a `features` column?

A) `predict_udf = mlflow.pyfunc.spark_udf(spark, "models:/ml.demo.mymodel@champion")`, then `df.withColumn("prediction", predict_udf("features"))`  
B) `predict_udf = mlflow.pyfunc.spark_udf("models:/ml.demo.mymodel@champion")`, then `predict_udf.transform(df)`  
C) `predict_udf = mlflow.pyfunc.spark_udf(spark, "models:/ml.demo.mymodel@champion")`, then `spark.sql("SELECT predict_udf(features) FROM df")` with no registration  
D) `predict_udf = mlflow.load_model("models:/ml.demo.mymodel@champion")`, then `df.withColumn("prediction", predict_udf(df["features"]))`

> [!success]- Answer
> **Correct Answer: A**
>
> `mlflow.pyfunc.spark_udf(spark, model_uri)` takes the `spark` session as its first argument and returns a Spark UDF, applied with `df.withColumn("prediction", predict_udf("features"))` (column names as strings or `Column` objects).
>
> A Python UDF object is not visible to SQL until it is registered (`spark.udf.register`), `mlflow.load_model()` does not exist, and a UDF has no `transform()` method.

---

## Question 7: log_model vs register_model

**Question** *(Medium)*: What is the key difference between `mlflow.sklearn.log_model()` and `mlflow.register_model()`?

A) `log_model()` saves the model to the Model Registry; `register_model()` saves it as a run artifact  
B) `log_model()` saves the model as a run artifact inside an MLflow run; `register_model()` registers a previously logged artifact to the Model Registry under a named version  
C) `log_model()` and `register_model()` are interchangeable — both register a model to the registry  
D) `register_model()` can only be called immediately after `log_model()` in the same code block

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.sklearn.log_model()` (and other flavor-specific `log_model` functions) saves a model as an artifact within the current MLflow run. The model is associated with that specific run. `mlflow.register_model()` takes a `runs:/` or `models:/` URI and creates a numbered version of a registered model (in Unity Catalog, `catalog.schema.model`), making it discoverable, governed, and promotable with aliases. These are two separate steps, and `register_model()` can be called at any time after the model is logged.

---

## Question 8: Model Serving Endpoint Invocation

**Question** *(Easy)*: A data scientist has deployed a model to a Databricks Model Serving endpoint. Which format is used to send prediction requests to the endpoint?

A) A Spark DataFrame serialized as a Parquet file  
B) A JSON payload with a `dataframe_records` or `dataframe_split` key  
C) A Python pickle of the input DataFrame  
D) A CSV file uploaded to DBFS and referenced by path

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Model Serving endpoints accept JSON payloads via HTTP POST requests. The standard input format uses either `dataframe_records` (list of row dictionaries) or `dataframe_split` (columnar format with `columns` and `data` keys). Parquet, pickle, and DBFS file references are not supported input formats for real-time serving endpoints.

---

**[← Previous: Spark ML, Tuning & Feature Tables](./03-feature-engineering.md) | [↑ Back to Practice Questions — ML Associate](./README.md) | [Next: Unity Catalog, MLOps & MLflow Client →](./05-unity-catalog-mlops.md)**

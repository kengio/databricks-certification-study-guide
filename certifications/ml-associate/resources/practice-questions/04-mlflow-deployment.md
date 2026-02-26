---
title: Practice Questions — MLflow Deployment
type: practice-questions
tags: [ml-associate, practice-questions, mlflow, deployment, model-registry]
status: published
---

# Practice Questions — MLflow Deployment (Domain 4)

8 questions covering model registration, lifecycle stage transitions, batch scoring with spark_udf, and model serving endpoints.

[← Back to Practice Questions](./README.md)

---

## Question 1: register_model URI Format

**Question** *(Easy)*: A data scientist has trained a model and its `run_id` is `abc123`. The model was logged with `mlflow.sklearn.log_model(model, artifact_path="model")`. Which URI correctly registers this model to the Model Registry?

A) `mlflow.register_model("model/abc123", "fraud-detector")`
B) `mlflow.register_model("runs:/abc123/model", "fraud-detector")`
C) `mlflow.register_model("mlflow:/abc123/model", "fraud-detector")`
D) `mlflow.register_model("artifacts:/abc123/model", "fraud-detector")`

> [!success]- Answer
> **Correct Answer: B**
>
> The correct URI format for referencing a logged model artifact is `runs:/<run_id>/<artifact_path>`. In this case, the artifact path is `model` (the value passed to `artifact_path` in `log_model()`), so the full URI is `runs:/abc123/model`. The `mlflow:/` and `artifacts:/` schemes do not exist.

---

## Question 2: Model Version Stage Transition

**Question** *(Medium)*: A data scientist wants to promote model version 3 of a model named `churn-predictor` from `Staging` to `Production`. Which code is correct?

A) `mlflow.transition_model_stage("churn-predictor", 3, "Production")`
B) `mlflow.set_model_stage("churn-predictor", version=3, stage="Production")`
C)

```python
client = MlflowClient()
client.transition_model_version_stage(
    name="churn-predictor",
    version=3,
    stage="Production"
)
```

D)

```python
mlflow.register_model(
    "models:/churn-predictor/Staging",
    "churn-predictor",
    stage="Production"
)
```

> [!success]- Answer
> **Correct Answer: C**
>
> Stage transitions require `MlflowClient().transition_model_version_stage()`. There is no `mlflow.transition_model_stage()` or `mlflow.set_model_stage()` function. `mlflow.register_model()` creates a new model version, it does not change an existing version's stage.

---

## Question 3: Valid Model Registry Stages

**Question** *(Easy)*: Which of the following is NOT a valid stage in the MLflow Model Registry?

A) Staging
B) Production
C) Archived
D) Deprecated

> [!success]- Answer
> **Correct Answer: D**
>
> The four valid stages in the MLflow Model Registry are: **None** (newly registered, no stage assigned), **Staging** (under testing), **Production** (live serving), and **Archived** (retired). "Deprecated" is not a valid stage.

---

## Question 4: Loading a Registered Model for Inference

**Question** *(Medium)*: A data scientist wants to load the Production version of a model named `price-estimator` using its `models:/` URI. Which code is correct?

A) `model = mlflow.load_model("models:/price-estimator/Production")`
B) `model = mlflow.pyfunc.load_model("models:/price-estimator/Production")`
C) `model = MlflowClient().load_model("price-estimator", stage="Production")`
D) `model = mlflow.sklearn.load_model("models:/price-estimator/Production")`

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.pyfunc.load_model()` is the generic loader that works with any model flavor using the `models:/name/stage` URI format. `mlflow.load_model()` does not exist. `MlflowClient().load_model()` does not exist. `mlflow.sklearn.load_model()` is flavor-specific and also accepts the `models:/` URI, but using `pyfunc` is the recommended approach for flexibility.

---

## Question 5: spark_udf for Batch Scoring

**Question** *(Medium)*: A data scientist wants to score a Spark DataFrame of 10 million customer records using a registered MLflow model. Which approach is most appropriate for distributed batch scoring?

A) Load the model with `mlflow.pyfunc.load_model()` and call `model.predict(df.toPandas())`
B) Use `mlflow.pyfunc.spark_udf()` to create a UDF and apply it to the Spark DataFrame
C) Deploy the model to a serving endpoint and send the DataFrame as a single HTTP request
D) Use `FeatureStoreClient.score_batch()` without any model URI

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.pyfunc.spark_udf(spark, model_uri)` creates a Spark UDF that wraps the model, enabling distributed batch scoring across all Spark workers. Calling `.toPandas()` on 10 million rows collects all data to the driver, which can cause out-of-memory errors. Sending 10 million rows in a single HTTP request to a serving endpoint is not feasible. `score_batch()` requires Feature Store integration.

---

## Question 6: spark_udf Usage Pattern

**Question** *(Medium)*: A data scientist creates a `spark_udf` from a registered model. Which code correctly applies the UDF to a DataFrame `df` that has a `features` column?

A)

```python
predict_udf = mlflow.pyfunc.spark_udf(spark, "models:/mymodel/Production")
result_df = df.withColumn("prediction", predict_udf("features"))
```

B)

```python
predict_udf = mlflow.pyfunc.spark_udf("models:/mymodel/Production")
result_df = predict_udf.transform(df)
```

C)

```python
predict_udf = mlflow.pyfunc.spark_udf(spark, "models:/mymodel/Production")
result_df = spark.sql("SELECT predict_udf(features) FROM df")
```

D)

```python
predict_udf = mlflow.load_model("models:/mymodel/Production")
result_df = df.withColumn("prediction", predict_udf(df["features"]))
```

> [!success]- Answer
> **Correct Answer: A**
>
> `mlflow.pyfunc.spark_udf(spark, model_uri)` requires the `spark` session as its first argument and returns a callable UDF. The UDF is then applied using `df.withColumn("prediction", predict_udf("features"))` where the column names are passed as strings. `mlflow.load_model()` does not exist, and `predict_udf.transform()` is not a valid pattern for a UDF.

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
> `mlflow.sklearn.log_model()` (and other flavor-specific `log_model` functions) saves a model as an artifact within the current MLflow run. The model is associated with that specific run. `mlflow.register_model()` takes a `runs:/` or `models:/` URI and creates a named version in the Model Registry, making it discoverable and promotable through lifecycle stages. These are two separate steps, and `register_model()` can be called at any time after the model is logged.

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

**[← Previous: Practice Questions — Feature Engineering](./03-feature-engineering.md) | [↑ Back to Practice Questions — ML Associate](./README.md)**

---
title: Practice Questions — Model Deployment
type: practice-questions
tags: [ml-associate, practice-questions, model-deployment, model-serving, streaming-inference]
status: published
---

# Practice Questions — Model Deployment (Section 4)

11 questions added for the re-issued exam guide, covering **Section 4: Model Deployment (12 %)** — batch vs streaming vs real-time serving, pandas batch inference, custom model endpoints, querying, traffic splitting, and streaming inference with Delta Live Tables. Study material: [Model Deployment](../../04-model-deployment/README.md).

[← Back to Practice Questions](./README.md)

---

## Question 1: Choosing Streaming Inference *(2026 guide)*

**Question** *(Medium)*: Sensor readings arrive continuously from thousands of machines. Each reading must be scored for anomalies within seconds and the result written to a Delta table for an operations dashboard. No application waits for an individual prediction. Which serving approach fits best?

A) Nightly batch inference  
B) A real-time Model Serving endpoint called once per reading  
C) Streaming inference on the incoming data  
D) Manual scoring in a notebook when the dashboard is opened  

> [!success]- Answer
> **Correct Answer: C**
>
> Continuously arriving data that must be scored within seconds and stored is the streaming use case — apply the model as a Spark UDF to a stream (for example in a Delta Live Tables pipeline).
>
> Nightly batch is too slow, and a request/response endpoint adds per-call overhead when no caller is waiting.

---

## Question 2: Choosing Real-Time Inference *(2026 guide)*

**Question** *(Easy)*: A mobile app shows a personalised price quote while the user waits on the checkout screen. Which serving approach is required?

A) Real-time inference behind a Model Serving REST endpoint  
B) Weekly batch inference  
C) Streaming inference into a Delta table  
D) Exporting predictions to a CSV file each night  

> [!success]- Answer
> **Correct Answer: A**
>
> When a caller needs the prediction inside the request (milliseconds), use a real-time endpoint. Batch and file exports cannot react to a new request, and streaming writes results to tables rather than answering a caller.

---

## Question 3: Choosing Batch Inference *(2026 guide)*

**Question** *(Easy)*: Every Monday a retention team needs a churn-risk list for 2 million customers. Nobody needs individual predictions in real time. Which approach is most appropriate and cost-effective?

A) An always-on GPU serving endpoint queried once per customer  
B) A scheduled batch inference job that scores all customers and writes a table  
C) A continuously running streaming pipeline  
D) A real-time endpoint with scale-to-zero disabled  

> [!success]- Answer
> **Correct Answer: B**
>
> Scheduled scoring of a whole population with no latency requirement is batch inference — the simplest and cheapest option. Endpoints and streaming pipelines add always-on infrastructure for latency the workload does not need.

---

## Question 4: Batch Inference with pandas *(2026 guide)*

**Question** *(Medium)*: A model registered as `ml.sales.forecaster` must score a 40,000-row table once a day; the data easily fits on the driver. What is the simplest correct approach?

A) Create a serving endpoint and send one HTTP request per row  
B) Build a streaming pipeline over the table  
C) `model = mlflow.pyfunc.load_model("models:/ml.sales.forecaster@champion")`, then `model.predict(df.toPandas()[features])`  
D) `mlflow.pyfunc.spark_udf(...)` is mandatory for any registered model  

> [!success]- Answer
> **Correct Answer: C**
>
> For small data, load the model as a generic `pyfunc` and call `predict` on a pandas DataFrame. Endpoints and streaming add unnecessary infrastructure, and `spark_udf` is the tool for data too large for one machine, not a requirement.

---

## Question 5: Why spark_udf Scales *(2026 guide)*

**Question** *(Medium)*: Why does `mlflow.pyfunc.spark_udf` handle 300 million rows when `load_model(...).predict(df.toPandas())` fails?

A) `spark_udf` uses a GPU automatically  
B) `spark_udf` sends rows to a serving endpoint  
C) `spark_udf` samples 1 % of the rows  
D) `spark_udf` ships the model to the workers and scores partitions in parallel as pandas batches, while `toPandas()` collects every row to the driver  

> [!success]- Answer
> **Correct Answer: D**
>
> `spark_udf` wraps the model as a Spark UDF, so each worker loads the model once and scores its partitions in pandas batches. `toPandas()` pulls the entire dataset into driver memory and can run out of memory. It neither uses GPUs automatically, calls endpoints, nor samples.

---

## Question 6: Deploying a Custom Model *(2026 guide)*

**Question** *(Medium)*: An endpoint must return a churn probability **and** a yes/no flag based on a business threshold, using preprocessing that is not part of the scikit-learn model. How should this be deployed?

A) Subclass `mlflow.pyfunc.PythonModel` with a `predict` method that applies the preprocessing and threshold, log it with `mlflow.pyfunc.log_model` (with an input example), register it in Unity Catalog, and serve that version from a Model Serving endpoint  
B) Deploy the raw scikit-learn model and ask every client to apply the threshold  
C) Write the logic in a SQL view and point the endpoint at the view  
D) Upload the notebook directly to Model Serving  

> [!success]- Answer
> **Correct Answer: A**
>
> A custom `pyfunc` model packages arbitrary Python logic with the model so the endpoint returns exactly what clients need. Unity Catalog requires a signature (inferred from the input example). Pushing logic to clients duplicates it, and endpoints serve registered MLflow models, not views or notebooks.

---

## Question 7: Request Format *(2026 guide)*

**Question** *(Easy)*: Which JSON key is the recommended way to send tabular input to a custom model serving endpoint?

A) `"rows"`  
B) `"spark_dataframe"`  
C) `"dataframe_split"` (with `columns` and `data`)  
D) `"csv"`  

> [!success]- Answer
> **Correct Answer: C**
>
> Endpoints accept `dataframe_split` (recommended, pandas split orientation), `dataframe_records`, and the tensor formats `instances` / `inputs`. `rows`, `spark_dataframe`, and `csv` are not accepted keys.

---

## Question 8: Endpoint URL *(2026 guide)*

**Question** *(Easy)*: A Model Serving endpoint is named `churn-model`. Which URL is used to query it over REST?

A) `https://<workspace>/api/2.0/mlflow/predict/churn-model`  
B) `https://<workspace>/serving-endpoints/churn-model/invocations`  
C) `https://<workspace>/models/churn-model/score`  
D) `https://<workspace>/serving/churn-model/predict`  

> [!success]- Answer
> **Correct Answer: B**
>
> The invocation URL is `https://<databricks-instance>/serving-endpoints/<endpoint-name>/invocations`, called with a POST and a JSON body. From Python, `mlflow.deployments.get_deploy_client("databricks").predict(endpoint=..., inputs=...)` wraps the same call.

---

## Question 9: Splitting Traffic Between Versions *(2026 guide)*

**Question** *(Medium)*: The team wants 80 % of real-time requests to keep going to version 7 and 20 % to go to version 8 for an A/B comparison. What is the recommended setup?

A) Create two endpoints and have each client pick one at random  
B) Give version 8 the `challenger` alias; Model Serving then routes 20 % automatically  
C) Tag version 8 with `traffic=20`  
D) Serve both versions as served entities on one endpoint and set `traffic_config` routes of 80 and 20  

> [!success]- Answer
> **Correct Answer: D**
>
> One endpoint can host several served entities, and `traffic_config.routes` assigns each a `traffic_percentage` (summing to 100). Aliases and tags are registry metadata; they do not route traffic. Two endpoints push routing logic onto every client.

---

## Question 10: Streaming Inference with Delta Live Tables *(2026 guide)*

**Question** *(Medium)*: How is streaming inference performed with Delta Live Tables?

A) Delta Live Tables has a built-in `MODEL` table type that trains and scores automatically  
B) Load the registered model as a Spark UDF with `mlflow.pyfunc.spark_udf` and apply it to the streaming input inside a Delta Live Tables table definition  
C) Delta Live Tables can only run batch pipelines, so streaming inference is impossible  
D) Delta Live Tables forwards every row to the workspace's default serving endpoint  

> [!success]- Answer
> **Correct Answer: B**
>
> The model is loaded once as a Spark UDF and applied to `spark.readStream` data in a pipeline table; the pipeline manages checkpoints, retries, and autoscaling. There is no `MODEL` table type, pipelines support streaming tables, and nothing forwards rows to an endpoint automatically.
>
> Platform note: Delta Live Tables is now called Lakeflow Spark Declarative Pipelines (`from pyspark import pipelines as dp`; `import dlt` still works).

---

## Question 11: Scale to Zero *(2026 guide)*

**Question** *(Easy)*: A development endpoint has `scale_to_zero_enabled=True`. What trade-off does this create?

A) Lower cost when idle, but the first request after an idle period has cold-start latency  
B) Higher accuracy, but lower throughput  
C) The endpoint cannot be queried from Python  
D) Requests are dropped while the endpoint is idle  

> [!success]- Answer
> **Correct Answer: A**
>
> Scaling to zero releases compute when there is no traffic, saving cost, but the next request waits while compute starts again. It has no effect on accuracy or client libraries, and requests are served once compute is back. Latency-critical production endpoints usually disable it.

---

**[← Previous: Model Development](./07-model-development.md) | [↑ Back to Practice Questions — ML Associate](./README.md)**

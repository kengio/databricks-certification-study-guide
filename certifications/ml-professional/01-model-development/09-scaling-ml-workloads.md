---
title: Scaling ML Workloads
type: study-material
tags:
  - ml-professional
  - scaling
  - pandas-function-api
  - applyinpandas
  - ray
  - distributed-training
status: published
---

# Scaling ML Workloads

## Overview

The **Scaling and Tuning** section of the September 2025 exam guide asks you to choose *how* a workload should scale. The options are a bigger machine or more machines, data parallelism or model parallelism, Spark or Ray, and the pandas Function API for many small models. This file covers those decisions. Distributed hyperparameter tuning with Optuna and Ray Tune is in [Distributed Hyperparameter Tuning](./07-distributed-tuning.md).

> [!abstract]
>
> - **Vertical scaling** (a larger single node) is the default. Databricks recommends single-machine training whenever the data and model fit in memory. **Horizontal scaling** (more nodes) is for workloads that don't fit.
> - **Data parallelism** replicates the model and splits the data, as in Spark ML and PyTorch DDP. **Model parallelism** splits the model itself, as in pipeline parallelism, with FSDP and DeepSpeed ZeRO sharding model state.
> - The **pandas Function API** (`groupBy().applyInPandas()`) trains or scores one independent model per group in parallel across the cluster.
> - **Spark** is best at data parallelism (ETL, joins, feature engineering, MLlib). **Ray** is best at task and logical parallelism (hyperparameter search, reinforcement learning, deep-learning training). You can run them together on the same cluster.

> [!tip] What the Exam Tests
>
> - Trading off vertical vs horizontal scaling for a described workload (data size, model size, cost, complexity)
> - Picking data vs model parallelism from whether the **model** fits on one device
> - Writing a grouped-map training or inference function and its output **schema** for `applyInPandas`
> - Comparing Ray and Spark for distributing ML training

---

## Vertical vs Horizontal Scaling

| Dimension | Vertical (scale up) | Horizontal (scale out) |
| :--- | :--- | :--- |
| What changes | Bigger driver / single node: more RAM, cores, or GPUs | More worker nodes in the cluster |
| Code changes | None. scikit-learn, XGBoost, and PyTorch run unchanged | Needs distributed-aware code (Spark ML, `applyInPandas`, TorchDistributor, Ray) |
| Communication overhead | None | Network shuffles, gradient sync, and coordination |
| Ceiling | Largest available instance type | Practically the data volume you can afford to process |
| Fault tolerance | Single point of failure | Spark and Ray retry failed tasks |
| Best for | Data and model fit in memory; fast iteration; small to medium tabular ML | Data larger than one machine's memory; many independent tasks; large DL models |

Databricks' guidance is to train on a single machine when possible. Distributed code is "more complex than single-machine code and slower due to communication overhead", and is worth it only when the model or data is too large to fit in memory on one machine ([Distributed training](https://docs.databricks.com/aws/en/machine-learning/train-model/distributed-training/)).

> [!note]
> Hyperparameter tuning is the common exception. Each trial is independent, so tuning scales out well even when every single trial fits on one node. That's why Optuna's `MlflowSparkStudy`, Hyperopt's `SparkTrials`, and Ray Tune all fan trials out across workers.

## Data Parallelism vs Model Parallelism

| Strategy | What is split | Use when | Databricks tooling |
| :--- | :--- | :--- | :--- |
| **Data parallelism** | The **data**. Every worker holds a full model replica and trains on a shard; gradients or statistics are aggregated | The full model fits on one device and you need more throughput | Spark ML (distributed algorithms), PyTorch **DDP** via `TorchDistributor` or the AI Runtime `@distributed` decorator |
| **Sharded data parallelism** | Data **and** model state (parameters, gradients, optimizer state) | The model is too large for one GPU but you still want data parallelism | **FSDP**, **DeepSpeed ZeRO** (DeepSpeed distributor) |
| **Model parallelism** | The **model**. Layers or tensors are placed on different devices; activations flow between them | A single model can't fit on one device even when sharded | Pipeline / tensor parallelism (DeepSpeed offers pipeline parallelism) |
| **Task parallelism** | Independent **tasks**, not one model | Hyperparameter trials, per-group models, simulations | Ray, `applyInPandas`, `MlflowSparkStudy`, `SparkTrials` |

Databricks' multi-GPU guidance maps to the first two rows. Use DDP when the full model fits in a single GPU's memory and you need to scale data throughput. Use FSDP or DeepSpeed ZeRO for very large models that don't fit in one GPU ([Multi-GPU distributed training](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/examples/gpu-distributed-training)).

> [!note] Platform update (Oct 2026)
> HorovodRunner is deprecated, and Databricks Runtime ML releases after 15.4 LTS ML don't include it. Use TorchDistributor for PyTorch ([HorovodRunner](https://docs.databricks.com/aws/en/machine-learning/train-model/distributed-training/horovod-runner)). On serverless GPU compute, the Databricks AI Runtime SDK (`databricks-sdk-air`, with `@distributed` and `ray_init`) replaced the `serverless_gpu` package starting with GPU environment version 6 on Oct 13, 2026 ([October 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/october)).

## pandas Function API

The pandas Function API applies a Python function that takes and returns **pandas** objects to a PySpark DataFrame, using Apache Arrow for transfer ([pandas function APIs](https://docs.databricks.com/aws/en/pandas/pandas-function-apis)).

| API | Call | Input → output | ML use |
| :--- | :--- | :--- | :--- |
| Grouped map | `df.groupBy(key).applyInPandas(func, schema)` | One pandas DataFrame per group → any number of rows | **Train one model per group**; per-group inference |
| Map | `df.mapInPandas(func, schema)` | Iterator of pandas DataFrames (Arrow batches) → iterator of DataFrames | Batch inference with a model loaded once per partition |
| Cogrouped map | `df1.groupBy(k).cogroup(df2.groupBy(k)).applyInPandas(func, schema)` | Two pandas DataFrames per key → rows | Joining group-level training data with group-level config |

Unlike Series-to-Series pandas UDFs, function APIs can return output of arbitrary length, and Python type hints are optional.

> [!warning] Memory caveat
> "All data for a group is loaded into memory before the function is applied." A skewed key, such as one store with 50× the rows of the others, can cause out-of-memory errors. `maxRecordsPerBatch` doesn't apply to groups, so you have to make sure each group fits in memory yourself ([pandas function APIs](https://docs.databricks.com/aws/en/pandas/pandas-function-apis)).

### Group-specific model training

```python
import mlflow
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

result_schema = "store_id string, n_rows long, rmse double, run_id string"

experiment_id = mlflow.get_experiment_by_name("/Shared/store-forecasting").experiment_id

with mlflow.start_run(experiment_id=experiment_id, run_name="per_store_training") as parent:
    parent_run_id = parent.info.run_id

    def train_store_model(pdf: pd.DataFrame) -> pd.DataFrame:
        store_id = pdf["store_id"].iloc[0]
        X, y = pdf[["price", "promo", "day_of_week"]], pdf["units_sold"]
        model = LinearRegression().fit(X, y)
        rmse = mean_squared_error(y, model.predict(X)) ** 0.5

        # Child run per group, linked to the driver's parent run explicitly.
        # (The driver's active run is not visible inside executor processes.)
        with mlflow.start_run(
            experiment_id=experiment_id,
            run_name=f"store_{store_id}",
            tags={"mlflow.parentRunId": parent_run_id, "store_id": store_id},
        ) as child:
            mlflow.log_metric("rmse", rmse)
            mlflow.sklearn.log_model(model, name="model")

        return pd.DataFrame([{
            "store_id": store_id, "n_rows": len(pdf), "rmse": rmse, "run_id": child.info.run_id,
        }])

    results = (spark.table("main.retail.daily_sales")
        .groupBy("store_id")
        .applyInPandas(train_store_model, schema=result_schema))

    results.write.mode("overwrite").saveAsTable("main.retail.store_model_runs")
```

Points to remember:

- The function receives **one complete group** as a pandas DataFrame and returns a pandas DataFrame that matches `schema` exactly (column names and types).
- Each group trains independently and in parallel. Spark schedules groups as tasks across the executors.
- Pass identifiers (experiment ID, parent run ID) into the function explicitly. Code inside `applyInPandas` runs on executors, so it doesn't see the driver's active MLflow run, and `nested=True` alone won't attach the child to the parent there. Setting the `mlflow.parentRunId` tag links the runs in the MLflow UI. If executors can't reach the tracking server in your setup, return the metrics in the output DataFrame and log them from the driver instead.

### Group-specific inference

```python
import mlflow
import pandas as pd

runs = spark.table("main.retail.store_model_runs").select("store_id", "run_id")
to_score = spark.table("main.retail.next_week_features").join(runs, "store_id")

def score_store(pdf: pd.DataFrame) -> pd.DataFrame:
    model = mlflow.sklearn.load_model(f"runs:/{pdf['run_id'].iloc[0]}/model")
    pdf["forecast"] = model.predict(pdf[["price", "promo", "day_of_week"]])
    return pdf[["store_id", "date", "forecast"]]

forecasts = to_score.groupBy("store_id").applyInPandas(
    score_store, schema="store_id string, date date, forecast double"
)
```

Each group loads its own model **once** and scores all of its rows. That's much cheaper than loading a model per row in a row-at-a-time UDF.

## Ray vs Spark for Distributing ML Training

Ray on Databricks runs Ray clusters on top of Apache Spark clusters (Ray 2.3.0 and later). It's aimed at AI workloads and still gets platform governance, MLflow, Jobs, and Delta Lake ([Ray on Databricks](https://docs.databricks.com/aws/en/machine-learning/ray/)).

| Dimension | Apache Spark | Ray |
| :--- | :--- | :--- |
| Parallelism model | **Data parallelism**: apply the same operation to every element of a large dataset | **Task parallelism**: run many independent, possibly heterogeneous tasks concurrently |
| Sweet spot | ETL, joins, filters, aggregations, feature engineering, MLlib / Spark ML | Hyperparameter search, reinforcement learning, deep-learning training, fine-grained dynamic tasks |
| ML libraries | Spark ML (`pyspark.ml`), pandas Function API | Ray Tune, Ray Train, Ray Data, RLlib |
| Typical data unit | Spark DataFrame / Delta table | Python objects, Ray Datasets, GPU tensors |
| Best combined pattern | Spark prepares and writes the data | Ray consumes it for the compute-heavy stage |

The Databricks guidance is to use Spark for the data-intensive stages and switch to Ray for the heavy computation. Spark can handle input and output while Ray handles the compute in the same task, or ETL can run as its own job task so the cluster type matches the workload ([When to use Spark vs. Ray](https://docs.databricks.com/aws/en/machine-learning/ray/spark-ray-overview)).

### Starting Ray on a Databricks cluster

```python
import ray
from ray.util.spark import setup_ray_cluster, shutdown_ray_cluster

setup_ray_cluster(
    min_worker_nodes=2,
    max_worker_nodes=4,
    num_cpus_per_node=8,
    num_gpus_per_node=0,
    collect_log_to_path="/Volumes/main/ml/ray_logs",
)
ray.init(ignore_reinit_error=True)

# ... Ray Tune / Ray Train / Ray Data work here ...

shutdown_ray_cluster()
```

| Mode | Created with | Who can use it | Lifetime |
| :--- | :--- | :--- | :--- |
| Per-user (local) | `setup_ray_cluster` | Only the notebook user who started it | Ends when the notebook detaches, or after 30 minutes with no submitted tasks |
| Shared (global) | `setup_global_ray_cluster` (Ray 2.9.0+, shared access mode) | All users attached to the cluster; one per cluster | Runs until interrupted, detached, or the cluster terminates |

Source: [Start a Ray cluster on Databricks](https://docs.databricks.com/aws/en/machine-learning/ray/ray-create).

Operational constraints to remember:

- Ray on Spark is supported on dedicated access mode, no-isolation shared access mode, and jobs clusters. It isn't supported on serverless-based runtimes; for serverless GPU, see Ray on AI Runtime.
- Install libraries **before** starting Ray. Running `%pip` on a running Ray cluster shuts it down.

## Use Cases

- **10,000 per-SKU demand models**: `groupBy("sku").applyInPandas(train_fn, schema)` trains every SKU's model in parallel and logs each as a child run. Scale it with more workers, not a bigger driver.
- **Tabular model on 2 GB of data**: Scale vertically. A single memory-optimised node with scikit-learn or XGBoost beats a distributed setup on simplicity and speed.
- **Fine-tuning a model too large for one GPU**: Use FSDP or DeepSpeed ZeRO (sharded data parallelism), not plain DDP.
- **ETL followed by a large hyperparameter search**: Spark builds the training table in Delta, then Ray Tune runs the search on the same cluster.

## Common Issues & Errors

### `applyInPandas` task fails with out-of-memory for one key

**Scenario:** Most groups finish, but one very large group crashes its executor.
**Fix:** Every group must fit in executor memory. Salt or split very large keys, filter or aggregate before grouping, or use larger executor memory for the job.

### Output schema mismatch

**Scenario:** `applyInPandas` fails with a schema or Arrow conversion error.
**Fix:** The returned pandas DataFrame must contain exactly the columns declared in `schema`, with compatible types. Cast numeric types explicitly, for example `int64` to `long`.

### Ray cluster disappears after installing a package

**Scenario:** A user runs `%pip install` mid-session and Ray tasks start failing.
**Fix:** `%pip` restarts Python, which shuts down Ray. Install everything first, then call `setup_ray_cluster`.

## Exam Tips

> [!tip]
>
> - "Model fits on one GPU, need more throughput" means **data parallelism** (DDP). "Model too large for one GPU" means **sharding or model parallelism** (FSDP, DeepSpeed ZeRO, pipeline parallelism).
> - "Train a separate model for each store / device / region" means **`groupBy().applyInPandas()`** with an explicit output schema.
> - Spark is for **data parallelism**, Ray for **task parallelism**. "Reinforcement learning", "dynamic tasks", and "Ray Tune" point to Ray. "Joins, aggregations, feature tables" point to Spark.
> - Don't distribute what fits on one machine. Vertical scaling is the simpler, default answer for modest data.

## Key Takeaways

- **Single machine first**: scale vertically until data or model no longer fits; then scale horizontally
- **Data parallelism** = replicate model, split data; **model parallelism** = split the model; **FSDP / ZeRO** shard model state for very large models
- **`applyInPandas`** runs one pandas function per group in parallel; each group must fit in memory; the output must match `schema`
- **Log per-group models** by passing experiment and parent run IDs into the function explicitly
- **Spark + Ray are complementary**: Spark for data-intensive stages, Ray for compute-intensive stages; `setup_ray_cluster` starts Ray on a Databricks cluster

## Related Topics

- [Spark ML Pipelines](./08-spark-ml-pipelines.md) — data-parallel training with MLlib
- [Distributed Hyperparameter Tuning](./07-distributed-tuning.md) — Optuna `MlflowSparkStudy`, Ray Tune, `SparkTrials`
- [Advanced MLflow Tracking](./10-advanced-mlflow-tracking.md) — parent and child runs for per-group models

## Official Documentation

- [pandas function APIs](https://docs.databricks.com/aws/en/pandas/pandas-function-apis)
- [Distributed training](https://docs.databricks.com/aws/en/machine-learning/train-model/distributed-training/)
- [Multi-GPU distributed training (DDP / FSDP / DeepSpeed)](https://docs.databricks.com/aws/en/machine-learning/ai-runtime/examples/gpu-distributed-training)
- [Ray on Databricks](https://docs.databricks.com/aws/en/machine-learning/ray/)
- [When to use Spark vs. Ray](https://docs.databricks.com/aws/en/machine-learning/ray/spark-ray-overview)
- [Start a Ray cluster on Databricks](https://docs.databricks.com/aws/en/machine-learning/ray/ray-create)

---

**[← Previous: Spark ML Pipelines](./08-spark-ml-pipelines.md) | [↑ Back to Model Development](./README.md) | [Next: Advanced MLflow Tracking →](./10-advanced-mlflow-tracking.md)**

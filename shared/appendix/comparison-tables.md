---
tags: [reference, comparison, data-engineering, ml, genai]
---

# Comparison Tables

## Batch vs Streaming Processing

| Aspect            | Batch                      | Streaming                    |
| ----------------- | -------------------------- | ---------------------------- |
| **Latency**       | Minutes to hours           | Seconds to minutes           |
| **Data Volume**   | Large, bounded datasets    | Continuous, unbounded        |
| **Processing**    | Complete dataset at once   | Incremental micro-batches    |
| **Trigger**       | Scheduled (cron, workflow) | Continuous or interval       |
| **Use Case**      | Historical analysis, ETL   | Real-time dashboards, alerts |
| **Checkpointing** | Not required               | Required for exactly-once    |
| **Cost**          | Pay for execution time     | Pay for continuous compute   |

## Delta Lake vs Parquet

| Feature                 | Delta Lake       | Parquet          |
| ----------------------- | ---------------- | ---------------- |
| **ACID Transactions**   | Yes              | No               |
| **Time Travel**         | Yes              | No               |
| **Schema Enforcement**  | Yes              | No               |
| **MERGE/UPDATE/DELETE** | Yes              | Requires rewrite |
| **Change Data Feed**    | Yes              | No               |
| **Audit History**       | Yes              | No               |
| **Streaming Support**   | Full             | Limited          |
| **File Compaction**     | OPTIMIZE command | Manual           |
| **Overhead**            | Transaction log  | None             |

## Managed vs External Tables

| Aspect             | Managed Table               | External Table              |
| ------------------ | --------------------------- | --------------------------- |
| **Data Location**  | Controlled by Unity Catalog | User-specified path         |
| **DROP TABLE**     | Deletes data and metadata   | Deletes metadata only       |
| **Data Lifecycle** | Managed automatically       | User responsibility         |
| **Best For**       | New data assets             | Existing data lakes         |
| **Permissions**    | Simplified                  | Location credentials needed |

## Shallow Clone vs Deep Clone

| Aspect                | Shallow Clone           | Deep Clone            |
| --------------------- | ----------------------- | --------------------- |
| **Data Files**        | References source files | Copies all data files |
| **Storage Cost**      | Minimal                 | Full copy             |
| **Creation Speed**    | Fast                    | Slow (data copy)      |
| **Independence**      | Shares source data      | Fully independent     |
| **Use Case**          | Testing, experiments    | Backups, migrations   |
| **Source Dependency** | Yes                     | No                    |

## Auto Loader Modes

| Aspect          | Directory Listing  | File Notification      |
| --------------- | ------------------ | ---------------------- |
| **Detection**   | Scans directory    | Cloud events           |
| **Scalability** | Limited by listing | Highly scalable        |
| **Cost**        | API calls per scan | Event-based charges    |
| **Setup**       | Simple             | Requires configuration |
| **Best For**    | Small directories  | Large-scale ingestion  |

## Streaming Triggers

| Trigger            | When to Use           | Behavior            |
| ------------------ | --------------------- | ------------------- |
| **Default**        | Continuous processing | Process ASAP        |
| **processingTime** | Rate limiting         | Fixed intervals     |
| **once**           | One-time migration    | Single batch, stop  |
| **availableNow**   | Batch-like streaming  | All available, stop |
| **continuous**     | Ultra-low latency     | Experimental        |

## Output Modes

| Mode         | Behavior                  | Use Case               |
| ------------ | ------------------------- | ---------------------- |
| **append**   | Only new rows written     | Immutable data sources |
| **complete** | Entire result rewritten   | Aggregations           |
| **update**   | Only changed rows written | Stateful with updates  |

## SCD Types

| Type       | History | Method         | Storage                  |
| ---------- | ------- | -------------- | ------------------------ |
| **Type 1** | No      | Overwrite      | Same row                 |
| **Type 2** | Full    | Insert new row | Multiple rows per key    |
| **Type 3** | Limited | Add column     | Previous + current value |

## Cluster Types

| Type              | Purpose         | Cost      | Startup | Best For            |
| ----------------- | --------------- | --------- | ------- | ------------------- |
| **All-Purpose**   | Interactive     | Higher    | Minutes | Development         |
| **Job Cluster**   | Production jobs | Lower     | Minutes | Scheduled workloads |
| **Serverless**    | On-demand       | Per-query | Seconds | SQL analytics       |
| **Instance Pool** | Fast startup    | Moderate  | Seconds | Frequent restarts   |

## DLT Table Types

| Type                  | Processing     | Refresh      | Use Case                |
| --------------------- | -------------- | ------------ | ----------------------- |
| **Streaming Table**   | Incremental    | Continuous   | Append-only sources     |
| **Materialized View** | Full recompute | On change    | Aggregations, joins     |
| **View**              | On-demand      | Never stored | Intermediate transforms |

## Expectation Types

| Expectation              | Violation Behavior | Data    | Pipeline  |
| ------------------------ | ------------------ | ------- | --------- |
| **EXPECT**               | Log warning        | Kept    | Continues |
| **EXPECT...DROP ROW**    | Drop row           | Removed | Continues |
| **EXPECT...FAIL UPDATE** | Fail update        | Kept    | Stops     |

## Unity Catalog vs Hive Metastore

| Aspect             | Unity Catalog | Hive Metastore  |
| ------------------ | ------------- | --------------- |
| **Scope**          | Account-level | Workspace-level |
| **Governance**     | Centralized   | Per-workspace   |
| **Access Control** | Fine-grained  | Basic           |
| **Audit Logging**  | Built-in      | Manual setup    |
| **Data Sharing**   | Delta Sharing | Not native      |
| **Lineage**        | Automatic     | Not available   |

## Optimize Write vs Auto Compact

| Feature           | Optimize Write          | Auto Compact          |
| ----------------- | ----------------------- | --------------------- |
| **When**          | During write            | After write           |
| **Target**        | New files only          | All small files       |
| **Overhead**      | Minimal                 | Additional job        |
| **Configuration** | `optimizeWrite.enabled` | `autoCompact.enabled` |
| **Best For**      | Streaming               | Frequent small writes |

## Z-Order vs Liquid Clustering

| Feature            | Z-Order           | Liquid Clustering       |
| ------------------ | ----------------- | ----------------------- |
| **Maintenance**    | Manual OPTIMIZE   | Automatic               |
| **Column Limit**   | ~4 practical      | More flexible           |
| **Incremental**    | No (full rewrite) | Yes                     |
| **New Data**       | Not clustered     | Automatically clustered |
| **Maturity**       | GA, older         | GA, newer               |
| **Recommendation** | Existing tables   | New tables              |

## UC Model Registry vs Workspace Registry

| Aspect               | Unity Catalog Registry            | Workspace Registry           |
| -------------------- | --------------------------------- | ---------------------------- |
| **Namespace**        | `catalog.schema.model_name`       | `model_name` only            |
| **Governance**       | UC GRANT/REVOKE (SQL-based)       | ACL via workspace UI         |
| **Aliases**          | Named aliases (`@champion`)       | Legacy stages (Staging/Production) |
| **Cross-workspace**  | Yes (account-level)               | No (workspace-scoped)        |
| **Lineage**          | Automatic via UC                  | Not available                |
| **Registry URI**     | `"databricks-uc"`                 | `"databricks"` (default)     |
| **Recommendation**   | New deployments                   | Legacy only                  |

## Model Deployment Modes

| Mode                  | API                          | Latency    | Use Case                       | Scales to Zero |
| --------------------- | ---------------------------- | ---------- | ------------------------------ | -------------- |
| **Real-time serving** | Model Serving REST endpoint  | < 100 ms   | Online inference, APIs         | Yes (optional) |
| **Batch (Spark)**     | `mlflow.pyfunc.spark_udf()`  | Minutes    | Bulk scoring, scheduled jobs   | N/A            |
| **Streaming**         | `mlflow.pyfunc.spark_udf()` in `writeStream` | Seconds | Continuous scoring  | N/A            |

## Shadow vs Canary vs A/B Test

| Strategy          | Traffic to Challenger | User Impact | Risk    | Purpose                              |
| ----------------- | --------------------- | ----------- | ------- | ------------------------------------ |
| **Shadow**        | 0% (mirrored only)    | None        | Lowest  | Offline output validation            |
| **Canary**        | 5–25%                 | Minimal     | Low     | Gradual rollout with live signals    |
| **A/B Test**      | 50%                   | Half users  | Medium  | Statistical comparison with outcome  |

## Dense vs Sparse vs Hybrid Vector Search

| Aspect           | Dense (Semantic)         | Sparse (Keyword/BM25)      | Hybrid                        |
| ---------------- | ------------------------ | -------------------------- | ----------------------------- |
| **Matching**     | Semantic similarity      | Exact keyword frequency    | Both combined                 |
| **Best for**     | Natural language queries | Technical terms, IDs, SKUs | General-purpose RAG           |
| **Embedding**    | Required                 | Not required               | Required for dense component  |
| **Tuning**       | `ef_search` parameter    | BM25 weights               | `alpha` mixing parameter      |
| **Miss rate**    | Low for paraphrases      | Low for exact terms        | Low overall                   |

## RAG vs Fine-tuning

| Aspect                | RAG                                  | Fine-tuning                           |
| --------------------- | ------------------------------------ | ------------------------------------- |
| **Knowledge update**  | Real-time (retrieval from live index)| Requires retraining (static snapshot) |
| **Hallucination risk**| Lower (grounded in retrieved docs)   | Higher (relies on baked-in weights)   |
| **Data required**     | Documents for indexing               | Labeled input-output pairs            |
| **Cost**              | Index + inference                    | Training + inference                  |
| **Best for**          | Domain knowledge, FAQs, docs         | Tone/style, task adaptation           |
| **Explainability**    | High (source citations possible)     | Low                                   |

## Pay-per-Token vs Provisioned Throughput

| Aspect              | Pay-per-Token (Foundation Model API) | Provisioned Throughput            |
| ------------------- | ------------------------------------ | --------------------------------- |
| **Billing**         | Per input/output token               | Per hour (reserved capacity)      |
| **Latency**         | Variable (shared pool)               | Predictable (dedicated resources) |
| **Throughput**      | Best-effort                          | Guaranteed QPS SLA                |
| **Setup**           | Immediate, no config                 | Must pre-provision capacity       |
| **Best for**        | Dev, low-volume, variable load       | Production, high-volume, SLA-bound|

## Drift Types

| Drift Type          | What Changes                                   | Labels Needed | Detectable Early |
| ------------------- | ---------------------------------------------- | ------------- | ---------------- |
| **Data drift**      | Distribution of input features                 | No            | Yes              |
| **Prediction drift**| Distribution of model output scores/classes    | No            | Yes              |
| **Concept drift**   | Relationship between inputs and target         | Yes           | No               |
| **Label drift**     | Distribution of actual ground-truth labels     | Yes           | No               |

## Tungsten vs Photon

| Feature | Tungsten (Apache Spark default) | Photon (Databricks) |
| --- | --- | --- |
| **Language** | JVM bytecode (via Janino compiler) | Native C++ |
| **Execution model** | Whole-Stage Code Generation (WSCG) | Vectorized columnar execution |
| **Memory management** | Off-heap UnsafeRow (reduced GC) | Fully off-JVM (no GC) |
| **Vectorized reads** | Parquet/ORC batch reader (4096-row batches) | Extended vectorized reads |
| **Speedup vs baseline** | Baseline (replaces interpreted execution) | 2–8× over Tungsten |
| **Availability** | All Apache Spark clusters | Photon-enabled Databricks clusters only |
| **Code changes needed** | No | No |
| **Fallback behavior** | N/A (is the baseline) | Falls back to Tungsten for unsupported ops |
| **Enabled by** | Default (always on) | Select Photon runtime in cluster config |

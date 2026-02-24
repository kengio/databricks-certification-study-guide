---
tags: [glossary, reference, data-engineering, ml, genai]
---

# Glossary

## A

| Term                        | Definition                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| **ACID**                    | Atomicity, Consistency, Isolation, Durability — database transaction properties           |
| **Agent (AI)**              | Autonomous system that uses an LLM to plan and execute multi-step tasks via tool calls    |
| **AI Gateway**              | Databricks service for routing, rate-limiting, and observability of external LLM API calls|
| **Alias (Model Registry)**  | Named pointer to a specific model version (e.g., `@champion`, `@challenger`) in UC        |
| **AQE**                     | Adaptive Query Execution — Spark's runtime query optimization                             |
| **Auto Loader**             | Databricks feature for incrementally ingesting files from cloud storage                   |
| **Auto Optimize**           | Automatic file compaction after writes to Delta tables                                    |

## B

| Term              | Definition                                                      |
| ----------------- | --------------------------------------------------------------- |
| **Broadcast Join**| Join strategy where small table is sent to all executors        |
| **Bronze Layer**  | First layer in medallion architecture; raw, unprocessed data    |

## C

| Term                    | Definition                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Catalog**             | Top-level container in Unity Catalog hierarchy                                          |
| **CDC**                 | Change Data Capture — tracking and processing data changes                              |
| **CDF**                 | Change Data Feed — Delta Lake feature to track row-level changes                        |
| **Champion model**      | Current production model in a canary or A/B test; the baseline to beat                 |
| **Challenger model**    | Candidate replacement model evaluated against the champion before promotion             |
| **Checkpoint**          | Persistent state for streaming jobs to enable recovery                                  |
| **Chunking**            | Splitting documents into smaller segments for embedding and RAG indexing                |
| **Clone**               | Copy of a Delta table (shallow or deep)                                                 |
| **Cluster**             | Group of compute resources for running Spark workloads                                  |
| **CoT (Chain-of-Thought)**| Prompting technique instructing the model to reason step by step before answering     |
| **Concept drift**       | Change in the statistical relationship between input features and the target variable   |
| **Control Plane**       | Databricks-managed layer handling web UI, APIs, and orchestration                       |

## D

| Term                | Definition                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **DAB**             | Databricks Asset Bundles — CI/CD deployment tool for Databricks resources                   |
| **Data drift**      | Change in the statistical distribution of input features over time                          |
| **Data Plane**      | Compute layer where clusters run and data is processed (in customer or Databricks cloud)    |
| **DBFS**            | Databricks File System — distributed file system abstraction                                |
| **Deletion Vector** | Delta Lake optimization storing deleted row positions separately; avoids full file rewrite  |
| **Delta Lake**      | Open-source storage layer providing ACID transactions over Parquet files                    |
| **Delta Sharing**   | Open protocol for secure data sharing without data duplication                              |
| **DLT**             | Delta Live Tables — declarative ETL framework (renamed Lakeflow Pipelines)                  |
| **Driver**          | Central coordinator in a Spark application; runs on the master node                        |

## E

| Term              | Definition                                                                              |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Embeddings**    | Dense numerical vector representations of text enabling semantic similarity comparisons |
| **Executor**      | Worker process that runs Spark tasks                                                    |
| **Expectations**  | Data quality rules in Lakeflow/DLT pipelines                                            |
| **External Table**| Table where data is stored outside Unity Catalog management (at a user-specified path)  |

## F

| Term                      | Definition                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Faithfulness**          | RAG metric measuring whether the generated answer is grounded in the retrieved context|
| **Feature Store**         | Centralized repository for storing, sharing, and serving ML features                 |
| **Few-shot prompting**    | Including example input-output pairs in a prompt to guide model behavior             |
| **File Notification Mode**| Auto Loader mode using cloud events (SQS/Event Grid) for new file detection          |
| **Foundation Model API**  | Databricks API for pay-per-token access to large pre-trained LLMs and embedding models|

## G

| Term            | Definition                                                      |
| --------------- | --------------------------------------------------------------- |
| **Git Folders** | Databricks feature for Git repository integration in workspaces |
| **Gold Layer**  | Final layer in medallion architecture; business-ready aggregates|

## H

| Term                                   | Definition                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| **HNSW**                               | Hierarchical Navigable Small World — graph-based approximate nearest neighbor algorithm |
| **HyDE (Hypothetical Document Embeddings)**| RAG technique embedding a hypothetical ideal answer to improve retrieval accuracy  |

## I

| Term              | Definition                                                                              |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Idempotent**    | Operation that produces the same result regardless of how many times it is executed     |
| **Inference table**| Delta table automatically capturing all model serving endpoint requests and responses  |
| **Instance Pool** | Pre-allocated VM instances for faster cluster startup                                   |

## J

| Term           | Definition                                               |
| -------------- | -------------------------------------------------------- |
| **Job Cluster**| Cluster created for and terminated after a specific job  |

## K

| Term                            | Definition                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| **KS test (Kolmogorov-Smirnov)**| Statistical test comparing two distributions to detect drift in continuous metrics  |

## L

| Term                  | Definition                                                                            |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Lakeflow**          | Databricks platform for building data pipelines (includes DLT/Lakeflow Pipelines)    |
| **Lakehouse**         | Architecture combining data lake flexibility with data warehouse governance and speed |
| **Liquid Clustering** | Delta Lake feature for automatic data organization; incrementally replaces ZORDER     |
| **LLM**               | Large Language Model — neural network trained on large text corpora for text tasks    |
| **LLM-as-judge**      | Evaluation approach using an LLM to score or compare model outputs against criteria  |

## M

| Term                       | Definition                                                                     |
| -------------------------- | ------------------------------------------------------------------------------ |
| **Managed Table**          | Table where data lifecycle (including DROP) is managed by Unity Catalog        |
| **Materialized View**      | Pre-computed query results stored as a table and refreshed incrementally       |
| **Medallion Architecture** | Data organization pattern with Bronze/Silver/Gold layers                       |
| **MERGE**                  | SQL operation combining INSERT, UPDATE, DELETE in one atomic statement         |
| **Metastore**              | Top-level container in Unity Catalog for metadata                              |
| **Micro-batch**            | Default Spark Streaming processing model                                       |
| **MLflow**                 | Open-source platform for ML experiment tracking, model registry, and deployment|
| **Model signature**        | Schema definition of a model's expected input and output types                 |

## O

| Term           | Definition                                           |
| -------------- | ---------------------------------------------------- |
| **OPTIMIZE**   | Delta Lake command to compact small files            |
| **Output Mode**| Streaming write behavior (append, complete, update)  |

## P

| Term                    | Definition                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **Partition**           | Logical division of data for parallel processing                                           |
| **Partition Pruning**   | Query optimization skipping irrelevant partitions based on filter predicates               |
| **Photon**              | Databricks vectorized query engine written in C++ for faster Spark SQL execution           |
| **Prediction drift**    | Change in the distribution of model output scores or predicted classes over time           |
| **Private Link**        | Cloud service for private network connectivity to Databricks (AWS/Azure/GCP)               |
| **Prompt**              | Text input to an LLM that guides its output generation                                     |
| **Provisioned throughput**| Reserved model serving capacity billed per hour regardless of request volume             |
| **PSI (Population Stability Index)**| Metric quantifying distribution shift; >0.1 warrants investigation, >0.2 significant |
| **pyfunc**              | MLflow model flavor wrapping arbitrary Python logic with a standard `predict()` interface  |

## R

| Term            | Definition                                                                               |
| --------------- | ---------------------------------------------------------------------------------------- |
| **RAG (Retrieval-Augmented Generation)**| Architecture grounding LLM responses in retrieved context from a knowledge base |
| **Re-ranking**  | Post-retrieval step reordering candidate documents using a more precise relevance model  |
| **REST API**    | HTTP interface for programmatic Databricks access                                        |

## S

| Term                   | Definition                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **SCD**                | Slowly Changing Dimension — data modeling pattern for historical data management       |
| **SCC**                | Secure Cluster Connectivity — clusters with no public IP addresses                     |
| **Schema**             | Structure definition for data (also: database-level namespace in Unity Catalog)        |
| **Schema Evolution**   | Automatic handling of schema changes over time                                         |
| **Schema Inference**   | Automatic detection of data structure from source files                                |
| **Secret Scope**       | Secure storage for credentials and secrets in Databricks                               |
| **Serverless**         | Compute resources fully managed by Databricks; no cluster configuration required       |
| **Shadow deployment**  | Running a new model in parallel without serving its predictions to users; offline-only  |
| **Shuffle**            | Data redistribution across partitions across the network                               |
| **Silver Layer**       | Middle layer in medallion architecture; cleaned and deduplicated data                  |
| **Sparse retrieval**   | Keyword-based vector search using term frequency signals (BM25, TF-IDF)               |
| **Spark UI**           | Web interface for monitoring Spark application execution and performance                |
| **Spill**              | Data written to disk when executor memory is insufficient for the operation             |
| **Streaming Table**    | DLT/Lakeflow table type for incremental processing from append-only sources            |
| **Structured Streaming**| Spark's stream processing API with exactly-once guarantees                            |

## T

| Term               | Definition                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- |
| **Temperature**    | LLM sampling parameter controlling output randomness; 0 = deterministic, >1 = creative |
| **Time Travel**    | Delta Lake feature to query historical data versions by version number or timestamp     |
| **Tool calling**   | LLM capability to invoke external functions or APIs to complete a task                  |
| **Transaction Log**| Record of all changes to a Delta table (stored in `_delta_log/`)                       |
| **Trigger**        | Defines when streaming micro-batches are processed                                      |
| **Tungsten**       | Apache Spark's in-memory execution engine (Spark 1.5+); provides off-heap memory via UnsafeRow, Whole-Stage Code Generation, and vectorized Parquet/ORC reading |

## U

| Term             | Definition                                                                     |
| ---------------- | ------------------------------------------------------------------------------ |
| **Unity Catalog**| Databricks' unified governance solution for data and AI assets across accounts |
| **UnsafeRow**    | Tungsten's compact binary row format stored off-heap, bypassing JVM garbage collection for large in-memory Spark datasets |
| **Upsert**       | Combined INSERT and UPDATE operation; implemented via MERGE in Delta Lake       |

## V

| Term           | Definition                                                                              |
| -------------- | --------------------------------------------------------------------------------------- |
| **VACUUM**     | Delta Lake command to remove data files no longer referenced by the transaction log     |
| **Vector index**| Data structure enabling fast approximate nearest neighbor search over embeddings       |
| **Vector search**| Finding semantically similar items in high-dimensional embedding space                |
| **Volume**     | Unity Catalog object for managing non-tabular files (images, models, CSVs)             |

## W

| Term               | Definition                                                               |
| ------------------ | ------------------------------------------------------------------------ |
| **Watermark**      | Threshold for handling late-arriving data in streaming aggregations      |
| **Whole-Stage Code Generation (WSCG)** | Tungsten optimization that fuses multiple Spark operators into a single compiled bytecode function; stages marked `*(N)` in `df.explain()` output are WSCG-compiled |
| **Widget**         | Notebook parameter input element for interactive parameterization        |
| **Window Function**| SQL function operating over a sliding or fixed row partition             |
| **Workspace**      | Databricks environment for notebooks, jobs, clusters, and experiments    |

## Z

| Term       | Definition                                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| **ZORDER** | Delta Lake data organization command for multi-dimensional clustering; manual OPTIMIZE required |

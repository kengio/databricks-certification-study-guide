---
tags: [reference, version-history, delta-lake, databricks, ml, genai]
---

# Version History and Feature Timeline

## Delta Lake Versions

### Delta Lake 3.x (2024+)

| Version | Key Features                                        |
| ------- | --------------------------------------------------- |
| **3.2** | Liquid Clustering GA, Deletion Vectors improvements |
| **3.1** | UniForm GA (Iceberg/Hudi compatibility), Variant type |
| **3.0** | Default column mapping, Coordinated commits         |

### Delta Lake 2.x (2022-2023)

| Version | Key Features                                 |
| ------- | -------------------------------------------- |
| **2.4** | Liquid Clustering preview, Deletion vectors  |
| **2.3** | Type widening, Domain metadata               |
| **2.2** | Column mapping mode changes                  |
| **2.1** | Change Data Feed improvements                |
| **2.0** | Python API parity, DROP COLUMN support       |

### Delta Lake 1.x (2020-2022)

| Version | Key Features                           |
| ------- | -------------------------------------- |
| **1.2** | Change Data Feed (CDF)                 |
| **1.1** | Generated columns, MERGE improvements  |
| **1.0** | GA release, Z-ordering                 |

## Databricks Runtime Versions

### Current LTS Versions (Recommended)

| Version       | Release | Delta Lake | Spark | Support Until |
| ------------- | ------- | ---------- | ----- | ------------- |
| **16.x LTS**  | 2025    | 3.3+       | 3.5   | ~2027         |
| **15.4 LTS**  | 2024    | 3.2        | 3.5   | ~2026         |
| **14.3 LTS**  | 2024    | 3.1        | 3.5   | ~2025         |
| **13.3 LTS**  | 2023    | 2.4        | 3.4   | ~2025         |

### Feature Availability by Runtime

| Feature                 | Min Runtime            |
| ----------------------- | ---------------------- |
| Liquid Clustering       | 13.3+                  |
| Deletion Vectors        | 12.1+                  |
| Predictive Optimization | 12.0+                  |
| Photon                  | 9.1+ (fully GA 10.4+)  |
| Unity Catalog           | 11.3+                  |
| Serverless ML           | 14.0+                  |
| Foundation Model API    | 13.3+                  |

## Unity Catalog Evolution

### 2025+

- Model serving governance via Unity Catalog
- AI/ML asset lineage and tagging
- Lakehouse Federation GA (query external sources via UC)
- Volumes GA for non-tabular file management

### 2024

- Lakehouse Federation GA
- AI/ML asset governance
- Volumes GA
- Enhanced Delta Sharing

### 2023 — Unity Catalog GA

- External locations
- Storage credentials
- System tables

### 2022 — Unity Catalog Preview

- Three-level namespace
- Centralized access control

## Lakeflow/DLT Evolution

### 2025 (Current)

- Lakeflow branding fully consolidated (DLT = Lakeflow Pipelines, Workflows = Lakeflow Jobs)
- Enhanced serverless compute support
- Improved APPLY CHANGES API for SCD Type 1 and Type 2

### 2024

- Delta Live Tables renamed to Lakeflow Pipelines
- Serverless compute support for pipelines
- Enhanced monitoring and event logs

### 2023

- Streaming tables
- Materialized views
- Expectations with metrics
- Event log improvements

### 2022 — DLT GA

- Python and SQL support
- CDC support

## Auto Loader Evolution

| Year     | Feature                                     |
| -------- | ------------------------------------------- |
| **2025** | Unified with Lakeflow ingestion workflows   |
| **2024** | Schema evolution improvements, rescue data  |
| **2023** | File notification mode GA (all clouds)      |
| **2022** | Inferred schema persistence                 |
| **2021** | Auto Loader GA                              |

## Databricks Asset Bundles (DAB)

| Version  | Features                                         |
| -------- | ------------------------------------------------ |
| **2025** | Full CI/CD integration, multi-env promotion      |
| **2024** | DAB GA, Enhanced templates, Model Serving bundles|
| **2023** | DAB preview, Basic templates                     |

## MLflow Evolution

### 2025+

- MLflow Tracing GA (spans, trace export to MLflow UI)
- `mlflow.langchain.autolog()` captures prompt/response automatically
- `ChatModel` interface for custom LLM wrappers
- `agents.deploy()` for one-step agent serving via Unity Catalog
- Review App for human-in-the-loop LLM evaluation

### 2024

- MLflow 2.x GenAI additions: LLM evaluation, `mlflow.evaluate()` with LLM-as-judge
- Unity Catalog integration: `registry_uri="databricks-uc"`, named aliases (`@champion`)
- Model signatures enforced at serving time

### 2023

- MLflow Model Registry aliases replace legacy Stages (Staging/Production)
- `spark_udf()` for batch inference at scale

### 2022

- MLflow 2.0: Model signature enforcement, improved CLI
- Unity Catalog Model Registry preview

## Mosaic AI / Foundation Model API Timeline

| Year     | Feature                                                            |
| -------- | ------------------------------------------------------------------ |
| **2025** | AI Playground GA, AI Gateway for external models, agent framework  |
| **2024** | Foundation Model API GA (DBRX, Llama, Mixtral, BGE embeddings)     |
| **2024** | Provisioned throughput endpoints for guaranteed QPS                |
| **2024** | Vector Search GA with Delta Sync and Direct Access indexes         |
| **2023** | Mosaic AI branding, Vector Search preview                          |
| **2023** | Pay-per-token Foundation Model API preview                         |

## Databricks Vector Search Timeline

| Year     | Feature                                                         |
| -------- | --------------------------------------------------------------- |
| **2025** | Private endpoint support, enhanced metadata filtering           |
| **2024** | Vector Search GA, HNSW algorithm, Direct Access index type      |
| **2024** | Delta Sync index with CDF-based incremental updates             |
| **2023** | Vector Search preview                                           |

## Key Configuration Changes

### Deprecated Settings

| Old Setting                                    | Replacement    | Since    |
| ---------------------------------------------- | -------------- | -------- |
| `spark.databricks.delta.merge.enabledTriggers` | Always enabled | DBR 12.0 |
| `delta.autoOptimize.optimizeWrite`             | On by default  | DBR 11.0 |
| Hive metastore tables                          | Unity Catalog  | DBR 11.3 |
| MLflow stages (Staging/Production)             | Named aliases  | 2023     |

### Default Changes

| Setting        | Old Default | New Default  | Since     |
| -------------- | ----------- | ------------ | --------- |
| AQE            | false       | true         | Spark 3.2 |
| Column mapping | none        | name         | Delta 3.0 |
| CDF            | false       | configurable | Delta 2.0 |

## Exam Relevance Notes

### Focus Areas (2025/2026 Exams)

The exams emphasize:

- Unity Catalog (current architecture, named model aliases, GRANT/REVOKE)
- Lakeflow (new name for DLT + Workflows)
- Databricks Asset Bundles (CI/CD)
- Serverless compute options
- Liquid Clustering (replacing ZORDER for new tables)
- Foundation Model API (pay-per-token vs provisioned throughput)
- Vector Search (HNSW, Delta Sync vs Direct Access, CDF requirement)
- MLflow Tracing and GenAI evaluation (`mlflow.evaluate()`, LLM-as-judge)

### Legacy Topics (Still Tested)

- Hive metastore concepts (for migration scenarios)
- Traditional ZORDER (for existing tables)
- Workspace-level security (comparison to UC)
- MLflow legacy stages (for migration understanding)

### Topics Less Emphasized

- Very old runtime versions (< DBR 11.x)
- Deprecated APIs
- Manual file management (DBFS over UC Volumes)

## Staying Current

### Official Channels

- [Databricks Release Notes](https://docs.databricks.com/release-notes/index.html)
- [Delta Lake Releases](https://github.com/delta-io/delta/releases)
- [MLflow Changelog](https://github.com/mlflow/mlflow/blob/master/CHANGELOG.md)
- [Databricks Blog](https://www.databricks.com/blog)

### Exam Updates

- Exam guide last reviewed: Early 2026
- Check certification page for current exam guide version

---
tags: [reference, version-history, delta-lake, databricks, ml, genai]
---

# Version History and Feature Timeline

## 2025–2026 Rename and Exam-Guide Timeline

Databricks renamed several products between mid-2025 and late 2026. Exam guides lag the product, so a question stem may use either name — learn both.

> [!note] Platform update (Oct 2026)
> Snapshot as of **Oct 26, 2026**. Certification pages now call the platform the **Databricks Data + AI Platform** (older guides say *Data Intelligence Platform*).

### Product renames

| Date | Change | Source |
| :--- | :--- | :--- |
| **Jun 11, 2025** | DLT rebranded under Lakeflow (as *Lakeflow Declarative Pipelines*); "The product known as Databricks Jobs is now Lakeflow Jobs" (Workflows → Lakeflow Jobs) | [Jun 2025 release notes](https://docs.databricks.com/aws/en/release-notes/product/2025/june) |
| **Nov 7, 2025** | Community Edition → Free Edition migration tool (Public Preview) | [Nov 2025 release notes](https://docs.databricks.com/aws/en/release-notes/product/2025/november) |
| **Nov 12, 2025** | "Lakeflow Declarative Pipelines has been renamed to Lakeflow Spark Declarative Pipelines"; Python API `from pyspark import pipelines as dp` replaces `import dlt`; `dp.create_auto_cdc_flow` replaces `dlt.apply_changes` | [Nov 2025 release notes](https://docs.databricks.com/aws/en/release-notes/product/2025/november) · [Python reference](https://docs.databricks.com/aws/en/ldp/developer/python-ref) |
| **Jan 1, 2026** | Community Edition retired — use [Free Edition](https://docs.databricks.com/aws/en/getting-started/free-edition) | [Community announcement](https://community.databricks.com/t5/announcements/psa-community-edition-retires-on-january-1-2026-move-to-the-free/m-p/141888) |
| **Mar 16, 2026** | "Databricks Asset Bundles has been renamed to Declarative Automation Bundles" — non-breaking; `databricks bundle` commands and `databricks.yml` are unchanged | [Bundles release notes](https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles) · [Bundles FAQ](https://docs.databricks.com/aws/en/dev-tools/bundles/faqs) |
| **Jun 10, 2026** | "Delta Sharing is now OpenSharing" (Databricks-to-Databricks and Databricks-to-Open sharing) | [Jun 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/june) |
| **Jun 17, 2026** | Genie spaces (now Genie Agents) can be shared externally via OpenSharing (Beta) | [Jun 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/june) |
| **Jul 8, 2026** | "Genie Spaces are now called Genie Agents" — capabilities unchanged; the REST path is still `/api/2.0/genie/spaces/...` | [Jul 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/july) |
| **By Jul 2026** | Vector Search appears as **AI Search** in the docs ("Databricks AI Search (formerly Databricks Vector Search)"); new SDK `databricks-ai-search`, `VectorSearchClient` kept as an alias. No dated rename announcement found | [AI Search docs](https://docs.databricks.com/aws/en/vector-search/vector-search) · [PyPI](https://pypi.org/project/databricks-ai-search/) |
| **Sep 30, 2026** | Supervisor API (Beta) end-of-life | [Supervisor API (deprecated)](https://docs.databricks.com/gcp/en/agents/custom-agents/supervisor-api-app) |
| **Oct 5, 2026** | Agents deployed to Model Serving and MLflow `AgentServer` / `LongRunningAgentServer` moved to **Legacy**; `DurableAgentServer` runs agents on **Agent Runtime** (Databricks Apps) | [Oct 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/october) |
| **Oct 12, 2026** | Knowledge Assistant and Supervisor Agent are legacy; code agents → **Agent Bricks CLI** (Beta); no-code agents → Genie Agents | [Oct 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/october) · [Agent Bricks CLI](https://docs.databricks.com/aws/en/agents/custom-agents/agent-bricks-cli) |
| **Oct 31, 2026** | Bare managed-MCP Genie endpoint `/api/2.0/mcp/genie` retires — use `/api/2.0/mcp/genie/{space_id}` | [Built-in MCP services](https://docs.databricks.com/aws/en/agents/mcp-tools/built-in-mcp-services) |

Also deprecated: the MLflow `ChatAgent` and `ChatModel` agent schemas → migrate to `ResponsesAgent` ([legacy agent schema](https://learn.microsoft.com/en-us/azure/databricks/generative-ai/agent-framework/agent-legacy-schema)).

### Current exam-guide versions

| Certification | Exam version (published) | Guide PDF | What it means for you |
| :--- | :--- | :--- | :--- |
| **Data Engineer Associate** | May 4, 2026 (guide updated Aug 6, 2026) | [PDF](https://www.databricks.com/sites/default/files/2026-10/Databricks-Certified-Data-Engineer-Associate-Exam-Guide-August-2026.pdf) | 7 domains, 45 questions; says *Lakeflow Declarative Pipelines* and *Declarative Automation Bundles (formerly Databricks Asset Bundles)* |
| **Data Engineer Professional** | **New exam Oct 9, 2026** | [PDF](https://www.databricks.com/sites/default/files/2026-10/Databricks-Certified-Data-Engineer-Professional-Exam-Guide-9-Oct-2026.pdf) | 9 domains, 60 questions (replaces the Nov 30, 2025 10-domain version); says *Lakeflow Pipelines*, *OpenSharing*, *Declarative Automation Bundles* |
| **Data Analyst Associate** | Oct 30, 2025 (unchanged) | [PDF](https://www.databricks.com/sites/default/files/2025-10/databricks-certified-data-analyst-associate-oct-2025.pdf) | 9 domains, 45 questions; still says *Genie spaces* and *Delta Sharing* |
| **ML Associate** | Mar 1, 2025 (guide PDF re-issued Aug 2026) | [PDF](https://www.databricks.com/sites/default/files/2026-10/Databricks-Certified-Machine-Learning-Associate-Exam-Guide-August-2026.pdf) | 4 domains, 48 questions; same exam version |
| **ML Professional** | Sep 30, 2025 (guide PDF re-issued Aug 2026) | [PDF](https://www.databricks.com/sites/default/files/2026-10/databricks-certified-machine-learning-professional-exam-guide-august.pdf) | 3 domains, 59 questions; same exam version |
| **GenAI Engineer Associate** | Mar 18, 2026 (guide PDF re-issued Aug 2026) | [PDF](https://www.databricks.com/sites/default/files/2026-10/databricks-certified-gen-ai-associate-exam-guide-august-2026.pdf) | 6 domains, 45 questions; still says *Vector Search*, *Agent Framework*, *Model Serving* |

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

Supported LTS releases as of Oct 2026 ([release notes](https://docs.databricks.com/aws/en/release-notes/runtime/)); 13.3 LTS is no longer supported.

| Version       | Release      | Apache Spark | End of Support |
| ------------- | ------------ | ------------ | -------------- |
| **18 LTS**    | Jun 10, 2026 | 4.1.0        | Jun 10, 2029   |
| **17.3 LTS**  | Oct 22, 2025 | 4.0.0        | Oct 22, 2028   |
| **16.4 LTS**  | May 9, 2025  | 3.5.2        | May 9, 2028    |
| **15.4 LTS**  | Aug 19, 2024 | 3.5.0        | Aug 19, 2027   |
| **14.3 LTS**  | Feb 1, 2024  | 3.5.0        | Feb 1, 2027    |

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
- Enhanced Delta Sharing (renamed OpenSharing on Jun 10, 2026)

### 2023 — Unity Catalog GA

- External locations
- Storage credentials
- System tables

### 2022 — Unity Catalog Preview

- Three-level namespace
- Centralized access control

## Lakeflow Pipelines (formerly DLT) Evolution

### 2026 (Current)

- Docs use **Lakeflow Spark Declarative Pipelines** / **Lakeflow pipelines** throughout; `pyspark.pipelines` (`dp`) is the recommended Python module
- Jun 9, 2026 — `update_flow` API GA (an update flow that emits only changed rows per batch)
- Oct 12, 2026 — pipeline parameters GA; Oct 21, 2026 — Lakeflow pipelines system tables (`pipelines`, `pipeline_update_timeline`) GA ([Oct 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/october))

### 2025

- Feb 5, 2025 — publishing-mode cutover: "All tables created before February 5, 2025, use legacy publishing mode by default"; in the default publishing mode the deprecated `LIVE.` virtual schema is silently ignored ([LIVE schema](https://docs.databricks.com/aws/en/ldp/live-schema))
- Jun 11, 2025 — DLT rebranded as Lakeflow Declarative Pipelines (and Databricks Jobs → Lakeflow Jobs)
- Nov 12, 2025 — renamed **Lakeflow Spark Declarative Pipelines**; `APPLY CHANGES` APIs replaced by **AUTO CDC** APIs with the same syntax ([AUTO CDC](https://docs.databricks.com/aws/en/ldp/cdc))

### 2024

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

## Declarative Automation Bundles (formerly Databricks Asset Bundles, DAB)

| Version  | Features                                         |
| -------- | ------------------------------------------------ |
| **2026** | Mar 16 — renamed Declarative Automation Bundles (non-breaking; `databricks bundle` CLI unchanged); Jun 10 — direct deployment engine GA, default for bundles created with CLI 1.3.0+ instead of the Terraform engine |
| **2025** | Full CI/CD integration, multi-env promotion      |
| **2024** | DAB GA, Enhanced templates, Model Serving bundles|
| **2023** | DAB preview, Basic templates                     |

## MLflow Evolution

### 2026 (Current)

- `ChatAgent`, `ChatModel`, `SplitChatMessageRequest`, and `StringResponse` agent schemas deprecated — author agents with **`ResponsesAgent`**
- Oct 5, 2026 — agents deployed to Model Serving (`agents.deploy()`) and the MLflow `AgentServer` / `LongRunningAgentServer` moved to Legacy; new code agents use the Agent Bricks CLI and `DurableAgentServer` on Agent Runtime
- GenAI evaluation runs through MLflow 3 `mlflow.genai.evaluate()` with scorers (replacing Agent Evaluation's `mlflow.evaluate(model_type="databricks-agent")`)

### 2025

- MLflow Tracing GA (spans, trace export to MLflow UI)
- `mlflow.langchain.autolog()` captures prompt/response automatically
- `ChatModel` interface for custom LLM wrappers (now deprecated — see 2026)
- `agents.deploy()` for one-step agent serving via Unity Catalog (now a legacy path — see 2026)
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
| **2026** | Jul 8 — Genie Spaces renamed Genie Agents; Oct 12 — Agent Bricks CLI (Beta) recommended for new code agents, Knowledge Assistant and Supervisor Agent legacy |
| **2025** | AI Playground GA, AI Gateway for external models, agent framework  |
| **2024** | Foundation Model API GA (DBRX, Llama, Mixtral, BGE embeddings)     |
| **2024** | Provisioned throughput endpoints for guaranteed QPS                |
| **2024** | Vector Search GA with Delta Sync and Direct Access indexes         |
| **2023** | Mosaic AI branding, Vector Search preview                          |
| **2023** | Pay-per-token Foundation Model API preview                         |

## Databricks Vector Search (now AI Search) Timeline

| Year     | Feature                                                         |
| -------- | --------------------------------------------------------------- |
| **2026** | Docs rename to **Databricks AI Search** (formerly Vector Search); `databricks-ai-search` SDK with `AISearchClient` (`VectorSearchClient` kept as alias); Jul 15 — High QPS for standard endpoints GA |
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

- Unity Catalog (current architecture, named model aliases, GRANT/REVOKE, ABAC)
- Lakeflow Jobs (formerly Workflows) and Lakeflow Spark Declarative Pipelines (formerly DLT)
- Declarative Automation Bundles (formerly Databricks Asset Bundles) for CI/CD
- Serverless compute options
- Liquid Clustering (replacing ZORDER for new tables)
- Foundation Model API (pay-per-token vs provisioned throughput)
- Vector Search / AI Search (Delta Sync vs Direct Access, CDF requirement)
- MLflow Tracing and GenAI evaluation (`mlflow.genai.evaluate()` with scorers, LLM-as-judge)

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

- Exam guides last reviewed: Oct 26, 2026 (see [Current exam-guide versions](#current-exam-guide-versions))
- Check certification page for current exam guide version

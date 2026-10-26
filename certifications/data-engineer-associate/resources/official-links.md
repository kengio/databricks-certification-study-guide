---
title: Official Resources — Data Engineer Associate
type: reference
tags: [data-engineer-associate, official-links]
status: published
---

# Official Resources and Documentation Links

Curated list of official Databricks documentation relevant to the Data Engineer Associate exam.

## Certification

| Resource | URL |
|---|---|
| Databricks DE Associate certification page | <https://www.databricks.com/learn/certification/data-engineer-associate> |
| Exam guide (August 2026, PDF) | <https://www.databricks.com/sites/default/files/2026-10/Databricks-Certified-Data-Engineer-Associate-Exam-Guide-August-2026.pdf> |
| Certification overview | <https://www.databricks.com/learn/certification> |
| Databricks Academy | <https://www.databricks.com/learn/training> |
| Databricks Free Edition (hands-on practice) | <https://docs.databricks.com/aws/en/getting-started/free-edition> |
| Free Edition limitations | <https://docs.databricks.com/aws/en/getting-started/free-edition-limitations> |

## Domain 1 — Databricks Intelligence Platform

| Resource | URL |
|---|---|
| What is a data lakehouse? | <https://docs.databricks.com/aws/en/lakehouse/> |
| What is Delta Lake? | <https://docs.databricks.com/aws/en/delta/> |
| What is Unity Catalog? | <https://docs.databricks.com/aws/en/data-governance/unity-catalog/> |
| Compute configuration reference | <https://docs.databricks.com/aws/en/compute/configure> |
| Serverless compute | <https://docs.databricks.com/aws/en/compute/serverless/> |
| SQL warehouse types | <https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-types> |
| Delta Lake time travel (table history) | <https://docs.databricks.com/aws/en/delta/history> |

## Domain 2 — Data Ingestion and Loading

| Resource | URL |
|---|---|
| What is Lakeflow Connect? | <https://docs.databricks.com/aws/en/ingestion/overview> |
| Managed connector concepts | <https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/> |
| Ingest with SQL and Spark APIs (standard connectors) | <https://docs.databricks.com/aws/en/ingestion/> |
| Get started with COPY INTO | <https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/copy-into/> |
| COPY INTO reference | <https://docs.databricks.com/aws/en/sql/language-manual/delta-copy-into> |
| What is Auto Loader? | <https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/> |
| Auto Loader schema inference and evolution | <https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema> |
| Auto Loader file detection modes | <https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/file-detection-modes> |
| Query databases using JDBC | <https://docs.databricks.com/aws/en/connect/external-systems/jdbc> |
| Query variant data | <https://docs.databricks.com/aws/en/semi-structured/variant> |
| Structured Streaming trigger intervals | <https://docs.databricks.com/aws/en/structured-streaming/triggers> |

## Domain 3 — Data Transformation and Modeling

| Resource | URL |
|---|---|
| SQL language reference | <https://docs.databricks.com/aws/en/sql/language-manual/> |
| PySpark DataFrame API | <https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/dataframe.html> |
| Standalone materialized views | <https://docs.databricks.com/aws/en/views/materialized> |
| Standalone streaming tables | <https://docs.databricks.com/aws/en/tables/streaming> |
| Pipeline expectations (data quality) | <https://docs.databricks.com/aws/en/ldp/expectations> |
| Lakeflow pipelines Python reference | <https://docs.databricks.com/aws/en/ldp/developer/python-ref> |
| Constraints on Databricks | <https://docs.databricks.com/aws/en/tables/constraints> |
| Adaptive query execution | <https://docs.databricks.com/aws/en/optimizations/aqe> |
| Set Spark configuration properties | <https://docs.databricks.com/aws/en/spark/conf> |

## Domain 4 — Working with Lakeflow Jobs

| Resource | URL |
|---|---|
| Lakeflow Jobs | <https://docs.databricks.com/aws/en/jobs/> |
| Configure and edit tasks | <https://docs.databricks.com/aws/en/jobs/configure-task> |
| Configure task dependencies (Run if) | <https://docs.databricks.com/aws/en/jobs/conditional-tasks> |
| If/else task | <https://docs.databricks.com/aws/en/jobs/if-else> |
| For each task | <https://docs.databricks.com/aws/en/jobs/for-each> |
| Schedules and triggers | <https://docs.databricks.com/aws/en/jobs/triggers> |
| File arrival triggers | <https://docs.databricks.com/aws/en/jobs/file-arrival-triggers> |
| Table update triggers | <https://docs.databricks.com/aws/en/jobs/trigger-table-update> |

## Domain 5 — Implementing CI/CD

| Resource | URL |
|---|---|
| Databricks Git folders | <https://docs.databricks.com/aws/en/repos/> |
| Git operations in Git folders | <https://docs.databricks.com/aws/en/repos/git-operations-with-repos> |
| Declarative Automation Bundles | <https://docs.databricks.com/aws/en/dev-tools/bundles/> |
| Bundle variables | <https://docs.databricks.com/aws/en/dev-tools/bundles/variables> |
| Bundle deployment modes | <https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes> |
| `databricks bundle` commands | <https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands> |
| Bundles release notes (rename, Mar 16, 2026) | <https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles> |

## Domain 6 — Troubleshooting, Monitoring, and Optimization

| Resource | URL |
|---|---|
| Monitor Lakeflow Jobs | <https://docs.databricks.com/aws/en/jobs/monitor> |
| Skew and spill (Spark UI guide) | <https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage-page> |
| Liquid clustering | <https://docs.databricks.com/aws/en/delta/clustering> |
| Predictive optimization | <https://docs.databricks.com/aws/en/optimizations/predictive-optimization> |
| Compute termination error codes | <https://docs.databricks.com/aws/en/compute/troubleshooting/cluster-error-codes> |
| Install libraries | <https://docs.databricks.com/aws/en/libraries/> |
| System tables | <https://docs.databricks.com/aws/en/admin/system-tables/> |

## Domain 7 — Governance and Security

| Resource | URL |
|---|---|
| Unity Catalog managed tables | <https://docs.databricks.com/aws/en/tables/managed> |
| External tables | <https://docs.databricks.com/aws/en/tables/external> |
| Convert external tables to managed | <https://docs.databricks.com/aws/en/tables/convert-external-managed> |
| Manage privileges | <https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/> |
| Privileges reference | <https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/privileges> |
| Row filters and column masks | <https://docs.databricks.com/aws/en/tables/row-and-column-filters> |
| ABAC | <https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/> |
| ABAC DENY policies (Beta) | <https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/deny-policies> |
| DENY (legacy Hive metastore) | <https://docs.databricks.com/aws/en/sql/language-manual/security-deny> |

## Platform Release Notes Referenced in This Guide

| Change | URL |
|---|---|
| Lakeflow Declarative Pipelines → Lakeflow Spark Declarative Pipelines (Nov 12, 2025) | <https://docs.databricks.com/aws/en/release-notes/product/2025/november> |
| Delta Sharing → OpenSharing (Jun 10, 2026) | <https://docs.databricks.com/aws/en/release-notes/product/2026/june> |
| Community Edition retirement | <https://community.databricks.com/t5/announcements/psa-community-edition-retires-on-january-1-2026-move-to-the-free/m-p/141888> |

## Practice Resources

| Resource | URL |
|---|---|
| Databricks Academy | <https://www.databricks.com/learn/training> |
| Databricks Free Edition | <https://docs.databricks.com/aws/en/getting-started/free-edition> |
| Databricks Community forums | <https://community.databricks.com/> |
| Delta Lake GitHub | <https://github.com/delta-io/delta> |

---

[← Back to Resources](./README.md)

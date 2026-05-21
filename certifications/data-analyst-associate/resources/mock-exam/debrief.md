---
title: Mock Exam 1 Debrief — Data Analyst Associate
type: mock-exam-debrief
tags:
  - data-analyst-associate
  - mock-exam
  - debrief
---

# Mock Exam 1 Debrief — Databricks Data Analyst Associate

## Domain → study-resource mapping

| Domain (weight) | Topic folder | Cheat sheet |
| :--- | :--- | :--- |
| Executing Queries (20 %) | [`01-executing-queries-databricks-sql-warehouses/`](../../01-executing-queries-databricks-sql-warehouses/README.md) | [`sql-functions`](../../../../shared/cheat-sheets/sql-functions.md) |
| Creating Dashboards & Visualizations (16 %) | [`02-creating-dashboards-and-visualizations/`](../../02-creating-dashboards-and-visualizations/README.md) | — |
| Analyzing Queries (15 %) | [`03-analyzing-queries/`](../../03-analyzing-queries/README.md) | [`sql-functions`](../../../../shared/cheat-sheets/sql-functions.md) |
| AI/BI Genie Spaces (12 %) | [`04-developing-sharing-maintaining-genie-spaces/`](../../04-developing-sharing-maintaining-genie-spaces/README.md) | — |
| Understanding Platform (11 %) | [`05-understanding-databricks-platform/`](../../05-understanding-databricks-platform/README.md) | [`unity-catalog-quick-ref`](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| Managing Data (8 %) | [`06-managing-data/`](../../06-managing-data/README.md) | [`delta-lake-commands`](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| Securing Data (8 %) | [`07-securing-data/`](../../07-securing-data/README.md) | [`unity-catalog-quick-ref`](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| Importing Data (5 %) | [`08-importing-data/`](../../08-importing-data/README.md) | [`auto-loader-quick-ref`](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| Data Modeling with DBSQL (5 %) | [`09-data-modeling-with-databricks-sql/`](../../09-data-modeling-with-databricks-sql/README.md) | — |

## Per-section question map

The DA mock-exam questions.md is structured as a single flat block (no domain sub-sections); each question covers one domain end-to-end. Use the table below to map your missed questions to the new 9-domain blueprint by reading the scenario.

| Topic in the scenario | Maps to official domain (weight) |
| :--- | :--- |
| SQL Warehouse setup / sizing / connectivity | Executing Queries (20 %) |
| AI/BI Dashboard, visualisation, alerts, sharing | Creating Dashboards (16 %) |
| Joins / aggregations / window / parameters | Analyzing Queries (15 %) |
| AI/BI Genie Space creation / curation / permissions | Genie Spaces (12 %) |
| UC namespace, JDBC/ODBC, Power BI/Tableau connections | Understanding Platform (11 %) |
| `CREATE/ALTER/DROP` table, managed vs external | Managing Data (8 %) |
| GRANT/REVOKE, row filters, column masks | Securing Data (8 %) |
| UI upload / `COPY INTO` / Lakehouse Federation read | Importing Data (5 %) |
| Star vs snowflake, view vs MV, medallion | Data Modeling with DBSQL (5 %) |
| Refresh: GS-1, GS-2, GS-3 | Genie Spaces (12 %) |
| Refresh: DASH-1 | Creating Dashboards (16 %) |
| Refresh: DM-1 | Data Modeling with DBSQL (5 %) |

## Study plan by miss count (45-question mock)

| Missed | Status | Action |
| :---: | :--- | :--- |
| **0–5** (≥ 88 %) | Excellent | Schedule the exam |
| **6–9** (80–87 %) | Likely passing | Spot-fill weakest 2 domains |
| **10–13** (72–78 %) | On the bubble | 1-2 weeks focused study |
| **14–18** (60–70 %) | Not ready | 3-4 weeks comprehensive review |
| **19+** (< 60 %) | Significant gap | Restart from SQL essentials + UC basics |

## Highest-leverage study moves

- **Executing Queries (20 %)** — know SQL Warehouse types (Pro / Serverless / Classic), result caching, query history
- **Genie Spaces (12 %)** — practitioners often miss that **UC permissions apply automatically** to Genie SQL; this is the #1 trap
- **Dashboard vs SQL alerts** — dashboards refresh on schedule; SQL alerts fire on query-result thresholds

---

**[← Back to Mock Exam](./README.md)** | **[↑ Back to Resources](../README.md)** | **[← Back to Data Analyst Associate](../../README.md)**

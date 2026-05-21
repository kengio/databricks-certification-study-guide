---
title: Mock Exam 1 Debrief — Data Engineer Professional
type: mock-exam-debrief
tags:
  - data-engineer-professional
  - mock-exam
  - debrief
---

# Mock Exam 1 Debrief — Databricks Data Engineer Professional

After timing yourself through the 63 + new-domain questions, use this debrief to:

1. **Identify weak domains** with the per-question domain map below
2. **Find the topic file** that covers each missed question
3. **Follow the study plan** matched to your miss count

> [!tip]
> **The number of questions you missed matters less than *which domains* they came from.** Three missed questions on the 5 %-weight Data Sharing and Federation domain hits very differently than three missed on the 22 %-weight Developing Code domain.

## Domain → study-resource mapping

| Domain | Topic folder | Cheat sheet | Notes |
| :--- | :--- | :--- | :--- |
| Developing Code for Data Processing (22 %) | [`01-developing-code-for-data-processing/`](../../01-developing-code-for-data-processing/README.md) | [`pyspark-api-quick-ref`](../../../../shared/cheat-sheets/pyspark-api-quick-ref.md), [`dlt-quick-ref`](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) | Highest-leverage domain — master first |
| Cost & Performance Optimization (13 %) | [`02-cost-and-performance-optimization/`](../../02-cost-and-performance-optimization/README.md) | [`performance-optimization`](../../../../shared/cheat-sheets/performance-optimization.md), [`spark-configurations`](../../../../shared/cheat-sheets/spark-configurations.md) | Photon, ZORDER, liquid clustering, compute |
| Data Transformation, Cleansing, Quality (10 %) | [`03-data-transformation-cleansing-quality/`](../../03-data-transformation-cleansing-quality/README.md) | [`delta-lake-commands`](../../../../shared/cheat-sheets/delta-lake-commands.md), [`dlt-quick-ref`](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) | CDC, dedup, expectations, APPLY CHANGES INTO |
| Monitoring and Alerting (10 %) | [`04-monitoring-and-alerting/`](../../04-monitoring-and-alerting/README.md) | [`unity-catalog-quick-ref`](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) | System tables, Lakeflow event log, SQL Alerts |
| Ensuring Data Security and Compliance (10 %) | [`05-ensuring-data-security-and-compliance/`](../../05-ensuring-data-security-and-compliance/README.md) | [`unity-catalog-quick-ref`](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) | GRANT/DENY, row filters, column masks, secrets |
| Debugging and Deploying (10 %) | [`06-debugging-and-deploying/`](../../06-debugging-and-deploying/README.md) | [`spark-configurations`](../../../../shared/cheat-sheets/spark-configurations.md) | Asset Bundles, CI/CD, Spark UI, CLI, REST API |
| Data Ingestion & Acquisition (7 %) | [`07-data-ingestion-and-acquisition/`](../../07-data-ingestion-and-acquisition/README.md) | [`auto-loader-quick-ref`](../../../../shared/cheat-sheets/auto-loader-quick-ref.md), [`streaming-quick-ref`](../../../../shared/cheat-sheets/streaming-quick-ref.md) | Auto Loader, COPY INTO, Kafka/Kinesis |
| Data Governance (7 %) | [`08-data-governance/`](../../08-data-governance/README.md) | [`unity-catalog-quick-ref`](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) | UC three-level namespace, managed vs external |
| Data Modelling (6 %) | [`09-data-modelling/`](../../09-data-modelling/README.md) | [`delta-lake-commands`](../../../../shared/cheat-sheets/delta-lake-commands.md) | Medallion, schema management, SCD |
| Data Sharing and Federation (5 %) | [`10-data-sharing-and-federation/`](../../10-data-sharing-and-federation/README.md) | [`unity-catalog-quick-ref`](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) | Delta Sharing, Lakehouse Federation |

## Per-section question map (for self-scoring)

The original mock has 63 questions plus the new-domain refresh additions at the end. Sections in `questions.md`:

| Section in `questions.md` | Maps to official domain | Total Qs |
| :--- | :--- | :---: |
| Section 1: Data Processing | Developing Code + Data Transformation + Data Ingestion | 18 |
| Section 2: Databricks Tooling | Debugging and Deploying + Developing Code | 12 |
| Section 3: Data Modeling | Data Modelling + Cost & Performance | 9 |
| Section 4: Security & Governance | Ensuring Data Security and Compliance + Data Governance | 6 |
| Section 5: Monitoring & Logging | Monitoring and Alerting | 6 |
| Section 6: Testing & Deployment | Debugging and Deploying | 6 |
| Section 7: Lakeflow Pipelines | Developing Code + Data Transformation | 3 |
| Section 8: Performance Optimization | Cost & Performance Optimization | 3 |
| Refresh: Data Sharing & Federation (DSF-1, DSF-2) | Data Sharing and Federation | 2+ |

> [!note]
> The legacy section labels in `questions.md` don't 1:1 match the Nov 30 2025 official 10-domain structure — they predate the reorg. The mapping table above bridges legacy → official.

## Study plan by miss count

| Missed | Status | Study plan |
| :---: | :--- | :--- |
| **0–6** (≥ 90 %) | Excellent | Quick review of any missed topic; you're exam-ready |
| **7–13** (78–89 %) | Likely passing | Identify the 2-3 weakest domains; spend 1-2 hours per domain re-reading the topic folder; retake the same mock in 1 week to confirm |
| **14–19** (70–77 %) | On the bubble | Block 1-2 weeks for focused study on the weakest 3-4 domains. Read every topic file in those folders. Re-attempt Mock Exam 2 |
| **20–25** (60–68 %) | Not ready yet | Take 2-3 weeks for comprehensive review. Work through each topic folder in order. Use cheat sheets daily. Re-take Mock Exam 1 + 2 before scheduling the real exam |
| **26+** (< 60 %) | Significant gap | Restart from shared/fundamentals/. Plan a 4-6 week study cycle. Consider the Databricks Academy advanced DE course |

## When most misses cluster in one domain

| Domain with the misses | Top study action |
| :--- | :--- |
| Developing Code | Read all 8 sub-topics in `01-developing-code-for-data-processing/`. Run the streaming-joins example in a notebook |
| Cost & Performance | Walk through `02-cost-and-performance-optimization/06-explain-plans-aqe.md` with an actual EXPLAIN plan |
| Transformation | `APPLY CHANGES INTO` examples in `03-data-transformation-cleansing-quality/04-apply-changes-api.md` |
| Monitoring | Query `system.serving.endpoint_usage` and the Lakeflow event log yourself in a workspace |
| Security & Compliance | Walk through row filters + column masks in `05-ensuring-data-security-and-compliance/01-access-control.md` |
| Debugging & Deploying | Build a minimal Asset Bundle from scratch end-to-end |
| Data Ingestion | Run Auto Loader + COPY INTO + Kafka source side-by-side in a notebook |
| Governance | Walk through every UC object type — catalog, schema, table, volume, model — and run a GRANT on each |
| Modelling | Implement SCD Type 1 vs Type 2 with `APPLY CHANGES INTO` |
| Sharing & Federation | Create a Delta Share + a Lakehouse Federation foreign catalog in your workspace |

---

**[← Back to Mock Exam](./README.md)** | **[↑ Back to Resources](../README.md)** | **[← Back to DE Professional](../../README.md)**

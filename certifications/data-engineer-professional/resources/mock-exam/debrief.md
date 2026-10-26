---
title: Mock Exam 1 Debrief — Data Engineer Professional
type: mock-exam-debrief
tags:
  - data-engineer-professional
  - mock-exam
  - debrief
---

# Mock Exam 1 Debrief — Databricks Data Engineer Professional

After timing yourself through the 63 questions, use this debrief to:

1. **Identify weak sections** with the per-question map below
2. **Find the topic folder** that covers each missed question
3. **Follow the study plan** matched to your miss count

> [!tip]
> **The number of questions you missed matters less than *which sections* they came from.** Three misses in the 5 % Data Governance section hit very differently than three misses in the 23 % Developing Code section.

> [!note]
> Questions are labelled with the **9 sections of the Oct 9, 2026 exam guide**. The mock was written for earlier guides, so its mix does not match the official weights exactly — use the counts below when you score yourself, and use the [practice questions](../practice-questions/README.md) for the skills that are new in 2026.

## Section → study-resource mapping

| Exam section | Topic folder | Cheat sheet | Notes |
| :--- | :--- | :--- | :--- |
| 1. Developing Code for Data Processing using Python and SQL (23 %) | [01-developing-code-for-data-processing](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) | Highest-weighted section — master first |
| 2. Data Ingestion & Acquisition (12 %) | [02-data-ingestion-and-acquisition](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) | Auto Loader, message buses, CDC, Lakeflow Connect, OpenSharing, Clean Rooms, Federation |
| 3. Data Manipulation (12 %) | [03-data-manipulation](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) | Window functions, MERGE, VARIANT, `ai_query`, expectations |
| 4. Monitoring and Alerting (10 %) | [04-monitoring-and-alerting](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) | System tables, event log, alerts, REST API / CLI / SDK |
| 5. Cost & Performance Optimization (15 %) | [05-cost-and-performance-optimization](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) | Managed tables, predictive optimization, liquid clustering, caching, query profile |
| 6. Ensuring Data Security and Compliance (8 %) | [06-ensuring-data-security-and-compliance](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) | ACLs, ABAC, masking, PII, purging |
| 7. Data Governance (5 %) | [07-data-governance](../../07-data-governance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) | Permission inheritance, tags and comments |
| 8. Debugging and Deploying (10 %) | [08-debugging-and-deploying](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) | Spark UI, logs, job repair, bundles, Git folders |
| 9. Data Modeling (5 %) | [09-data-modeling](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) | Table layout, SCD, dimensional models, metric views |

## Per-question quick map

Each question is mapped to its primary exam section. Questions that touch two sections are listed under the one their correct answer depends on. The supplementary questions at the end of `questions.md` are listed last.

| Q# | Difficulty | Section | Topic folder | Cheat sheet |
| :---: | :---: | :--- | :--- | :--- |
| 1 | Easy | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 2 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 3 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 4 | Medium | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 5 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 6 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 7 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 8 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 9 | Medium | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 10 | Easy | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 11 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 12 | Hard | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 13 | Hard | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 14 | Easy | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 15 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 16 | Easy | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 17 | Medium | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 18 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 19 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 20 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 21 | Easy | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 22 | Easy | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 23 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 24 | Medium | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 25 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 26 | Medium | Data Governance | [Section 7 folder](../../07-data-governance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 27 | Easy | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 28 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 29 | Medium | Data Governance | [Section 7 folder](../../07-data-governance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 30 | Medium | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 31 | Easy | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 32 | Easy | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 33 | Medium | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 34 | Easy | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 35 | Hard | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 36 | Medium | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 37 | Medium | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 38 | Easy | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 39 | Medium | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 40 | Medium | Data Governance | [Section 7 folder](../../07-data-governance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 41 | Medium | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 42 | Easy | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 43 | Easy | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 44 | Easy | Data Governance | [Section 7 folder](../../07-data-governance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 45 | Hard | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 46 | Easy | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 47 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 48 | Medium | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 49 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 50 | Easy | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 51 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 52 | Easy | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 53 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 54 | Easy | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 55 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 56 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 57 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 58 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 59 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 60 | Medium | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 61 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 62 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 63 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| DSF-1 | — | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| DSF-2 | — | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| PERF-1 | — | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| COST-1 | — | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| MON-1 | — | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |

## Per-section question counts (for self-scoring)

| Exam section | Official weight | Questions in this mock (of 63) |
| :--- | :---: | :---: |
| 1. Developing Code for Data Processing using Python and SQL | 23 % | 14 |
| 2. Data Ingestion & Acquisition | 12 % | 5 |
| 3. Data Manipulation | 12 % | 5 |
| 4. Monitoring and Alerting | 10 % | 6 |
| 5. Cost & Performance Optimization | 15 % | 10 |
| 6. Ensuring Data Security and Compliance | 8 % | 5 |
| 7. Data Governance | 5 % | 4 |
| 8. Debugging and Deploying | 10 % | 7 |
| 9. Data Modeling | 5 % | 7 |

## Study plan by miss count

| Missed | Status | Study plan |
| :---: | :--- | :--- |
| **0–6** (≥ 90 %) | Excellent | Quick review of any missed topic; you're exam-ready |
| **7–13** (78–89 %) | Likely passing | Identify the 2-3 weakest domains; spend 1-2 hours per domain re-reading the topic folder; retake the same mock in 1 week to confirm |
| **14–19** (70–77 %) | On the bubble | Block 1-2 weeks for focused study on the weakest 3-4 domains. Read every topic file in those folders. Re-attempt Mock Exam 2 |
| **20–25** (60–68 %) | Not ready yet | Take 2-3 weeks for comprehensive review. Work through each topic folder in order. Use cheat sheets daily. Re-take Mock Exam 1 + 2 before scheduling the real exam |
| **26+** (< 60 %) | Significant gap | Restart from shared/fundamentals/. Plan a 4-6 week study cycle. Consider the Databricks Academy advanced DE course |

## When most misses cluster in one section

| Section with the misses | Top study action |
| :--- | :--- |
| Developing Code | Read `01-developing-code-for-data-processing/` end to end; build a small pipeline with a streaming table, a materialized view and an AUTO CDC flow |
| Data Ingestion | Run Auto Loader, a Kafka read and a Lakeflow Connect pipeline side by side; create an OpenSharing share and a foreign catalog |
| Data Manipulation | Write window-function and MERGE queries by hand; load JSON into a VARIANT column and query it with `:` paths |
| Monitoring | Query `system.billing.usage` and `system.lakeflow.job_run_timeline`; create an alert and wire it into a job with an If/else task |
| Cost & Performance | Read `05-cost-and-performance-optimization/01-managed-tables-predictive-optimization.md` and open a query profile on a slow query |
| Security & Compliance | Write a column mask and an ABAC policy on a governed tag; walk through the DELETE → REORG PURGE → VACUUM erasure flow |
| Data Governance | Grant on a catalog, create a new table, and confirm the grant is inherited; add tags and comments |
| Debugging & Deploying | Deploy a bundle to two targets; fail a job task on purpose and repair the run with a new parameter value |
| Data Modeling | Design a star schema and define one metric view over it |

---

**[← Back to Mock Exam 1](./README.md)** | **[↑ Back to Resources](../README.md)** | **[← Back to DE Professional](../../README.md)**

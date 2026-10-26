---
title: Mock Exam 2 Debrief — Data Engineer Professional
type: mock-exam-debrief
tags:
  - data-engineer-professional
  - mock-exam
  - debrief
---

# Mock Exam 2 Debrief — Databricks Data Engineer Professional

Use this after Mock Exam 1's debrief, working from your *second* timed sitting.

> [!tip]
> If your Mock-2 score is **higher than Mock-1**, the gap is closing — keep the study cadence. If it's **lower or flat**, your study plan needs a course correction toward the weakest sections.

> [!note]
> Questions are labelled with the **9 sections of the Oct 9, 2026 exam guide**. The mock was written for earlier guides, so its mix does not match the official weights exactly — use the counts below when you score yourself, and use the [practice questions](../practice-questions/README.md) for the skills that are new in 2026.

## Section → study-resource mapping

Same as Mock Exam 1's debrief — see the [Mock Exam 1 debrief](../mock-exam/debrief.md) for the full section → resource table.

## Per-question quick map

Each question is mapped to its primary exam section. Questions that touch two sections are listed under the one their correct answer depends on. The supplementary questions at the end of `questions.md` are listed last.

| Q# | Difficulty | Section | Topic folder | Cheat sheet |
| :---: | :---: | :--- | :--- | :--- |
| 1 | Medium | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 2 | Hard | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 3 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 4 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 5 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 6 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 7 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 8 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 9 | Medium | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 10 | Medium | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 11 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 12 | Medium | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 13 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 14 | Medium | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 15 | Medium | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 16 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 17 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 18 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 19 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 20 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 21 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 22 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 23 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 24 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 25 | Medium | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 26 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 27 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 28 | Medium | Data Governance | [Section 7 folder](../../07-data-governance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 29 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 30 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 31 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 32 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 33 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 34 | Medium | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 35 | Medium | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 36 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 37 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 38 | Medium | Data Manipulation | [Section 3 folder](../../03-data-manipulation/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 39 | Hard | Data Modeling | [Section 9 folder](../../09-data-modeling/README.md) | [Delta Lake commands](../../../../shared/cheat-sheets/delta-lake-commands.md) |
| 40 | Medium | Data Governance | [Section 7 folder](../../07-data-governance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 41 | Hard | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 42 | Hard | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| 43 | Hard | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 44 | Medium | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 45 | Hard | Security & Compliance | [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 46 | Hard | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 47 | Hard | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 48 | Medium | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 49 | Hard | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 50 | Hard | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |
| 51 | Hard | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 52 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 53 | Hard | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 54 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 55 | Hard | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 56 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 57 | Medium | Debugging & Deploying | [Section 8 folder](../../08-debugging-and-deploying/README.md) | [Spark configurations](../../../../shared/cheat-sheets/spark-configurations.md) |
| 58 | Medium | Developing Code | [Section 1 folder](../../01-developing-code-for-data-processing/README.md) | [Lakeflow Pipelines quick ref](../../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) |
| 59 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| 60 | Medium | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| DSF-1 | — | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| DSF-2 | — | Data Ingestion | [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md) | [Auto Loader quick ref](../../../../shared/cheat-sheets/auto-loader-quick-ref.md) |
| PERF-1 | — | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| COST-1 | — | Cost & Performance | [Section 5 folder](../../05-cost-and-performance-optimization/README.md) | [Performance optimization](../../../../shared/cheat-sheets/performance-optimization.md) |
| MON-1 | — | Monitoring | [Section 4 folder](../../04-monitoring-and-alerting/README.md) | [Unity Catalog quick ref](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |

## Per-section question counts (for self-scoring)

| Exam section | Official weight | Questions in this mock (of 60) |
| :--- | :---: | :---: |
| 1. Developing Code for Data Processing using Python and SQL | 23 % | 16 |
| 2. Data Ingestion & Acquisition | 12 % | 5 |
| 3. Data Manipulation | 12 % | 5 |
| 4. Monitoring and Alerting | 10 % | 4 |
| 5. Cost & Performance Optimization | 15 % | 7 |
| 6. Ensuring Data Security and Compliance | 8 % | 4 |
| 7. Data Governance | 5 % | 2 |
| 8. Debugging and Deploying | 10 % | 8 |
| 9. Data Modeling | 5 % | 9 |

## Study plan by miss count (60-question mock)

| Missed | Status | Action |
| :---: | :--- | :--- |
| **0–6** (≥ 90 %) | Excellent | Schedule the real exam this week |
| **7–12** (80–89 %) | Likely passing | Spot-fill the 2-3 weakest domains; re-confirm by re-attempting the missed questions in 1 week |
| **13–17** (72–78 %) | On the bubble | 1-2 more weeks of focused study; consider an Academy advanced course |
| **18–24** (60–70 %) | Not ready | Comprehensive review; re-take Mock 1 + 2 after 3-4 weeks |
| **25+** (< 60 %) | Significant gap | Restart from `shared/fundamentals/`; plan 4-6 weeks |

## Common Mock-2 traps

- **Lakeflow Pipelines event-log queries** — multiple questions test reading the pipeline event log; know the column shape
- **Declarative Automation Bundles `mode: development` vs `mode: production`** — dev pauses schedules and prefixes resources; production uses the run-as identity
- **APPLY CHANGES INTO** vs hand-written MERGE — APPLY CHANGES INTO is preferred for SCD inside declarative pipelines
- **OpenSharing identifier vs activation URL** — D2D uses sharing identifiers; open OpenSharing uses activation URLs

---

**[← Back to Mock Exam 2](./README.md)** | **[↑ Back to Resources](../README.md)** | **[← Back to DE Professional](../../README.md)**

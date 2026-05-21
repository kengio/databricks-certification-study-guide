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
> If your Mock-2 score is **higher than Mock-1**, the gap is closing — keep the study cadence. If it's **lower or flat**, your study plan needs a course correction toward the weakest domains.

## Domain → study-resource mapping

Same as Mock Exam 1's debrief — see [`../mock-exam/debrief.md`](../mock-exam/debrief.md) for the full Domain → resource table.

## Per-section question map

| Section in `questions.md` | Maps to official domain | Total Qs |
| :--- | :--- | :---: |
| Section 1: Data Processing | Developing Code + Transformation + Ingestion | ~17 |
| Section 2: Databricks Tooling | Debugging and Deploying + Developing Code | ~12 |
| Section 3: Data Modeling | Data Modelling + Cost & Performance | ~9 |
| Section 4: Security & Governance | Security & Compliance + Data Governance | ~6 |
| Section 5: Monitoring & Logging | Monitoring and Alerting | ~6 |
| Section 6: Testing & Deployment | Debugging and Deploying | ~6 |
| Section 7: Lakeflow Pipelines | Developing Code + Data Transformation | ~3 |
| Section 8: Performance Optimization | Cost & Performance Optimization | ~3 |
| Refresh: Data Sharing & Federation (DSF-1, DSF-2) | Data Sharing and Federation | 2+ |

## Study plan by miss count (60-question mock)

| Missed | Status | Action |
| :---: | :--- | :--- |
| **0–6** (≥ 90 %) | Excellent | Schedule the real exam this week |
| **7–12** (80–89 %) | Likely passing | Spot-fill the 2-3 weakest domains; re-confirm by re-attempting the missed questions in 1 week |
| **13–17** (72–78 %) | On the bubble | 1-2 more weeks of focused study; consider an Academy advanced course |
| **18–24** (60–70 %) | Not ready | Comprehensive review; re-take Mock 1 + 2 after 3-4 weeks |
| **25+** (< 60 %) | Significant gap | Restart from `shared/fundamentals/`; plan 4-6 weeks |

## Common Mock-2 traps

- **Lakeflow Declarative Pipelines event-log queries** — multiple questions test reading the pipeline event log; know the column shape
- **Asset Bundles `mode: development` vs `mode: production`** — dev pauses schedules and prefixes resources; production uses the run-as identity
- **APPLY CHANGES INTO** vs hand-written MERGE — APPLY CHANGES INTO is preferred for SCD inside declarative pipelines
- **Delta Sharing identifier vs activation URL** — D2D uses sharing identifiers; open Delta Sharing uses activation URLs

---

**[← Back to Mock Exam 2](./README.md)** | **[↑ Back to Resources](../README.md)** | **[← Back to DE Professional](../../README.md)**

---
title: Monitoring and Alerting
type: category
tags:
  - data-engineer-professional
  - monitoring
  - observability
status: published
---

# Monitoring and Alerting (10 % of Exam)

Observability for Lakeflow Jobs, Lakeflow Declarative Pipelines, and Databricks SQL — using **system tables**, the **Lakeflow event log**, the **query profiler**, and structured-streaming progress metrics.

## Topics Overview

```mermaid
flowchart LR
    Mon[Monitoring & Alerting] --> ST[System Tables]
    Mon --> LEL[Lakeflow Event Logs]
    Mon --> QP[Query Profiler]
    Mon --> SMon[Streaming Monitoring]
```

## Section Contents

| File | Topic | Priority |
| :--- | :--- | :--- |
| [01-system-tables.md](./01-system-tables.md) | `system.access`, `system.compute`, `system.billing` — querying audit, lineage, usage | High |
| [02-lakeflow-event-logs.md](./02-lakeflow-event-logs.md) | Pipeline event log: expectations, flow progress, data quality events | High |
| [03-query-profiler.md](./03-query-profiler.md) | Databricks SQL query profiler, reading task timelines | High |
| [04-streaming-monitoring-optimization.md](./04-streaming-monitoring-optimization.md) | StreamingQueryListener, back-pressure, state-store monitoring, troubleshooting | High |

## Key Concepts to Master

| Concept | Why it matters |
| :--- | :--- |
| **System tables** | Unity Catalog tables in `system.*` schemas that expose audit, access, compute, billing, and lineage events |
| **Lakeflow event log** | Append-only Delta table per pipeline that records every operator event, including expectations |
| **Query profiler** | DBSQL-native graphical profiler — shows shuffle, spill, time per stage |
| **Lakeflow alerts** | Email / webhook alerts on job-level success/failure, run duration, repair attempts |
| **System table latency** | Most system tables refresh within minutes; some up to ~1 hour — plan dashboards accordingly |

## Related Resources

- [Unity Catalog cheat sheet (shared)](../../../shared/cheat-sheets/unity-catalog-quick-ref.md)
- [Performance Troubleshooting appendix (shared)](../../../shared/appendix/performance-troubleshooting.md)

---

**[← Previous: Data Transformation](../03-data-transformation-cleansing-quality/README.md) | [↑ Back to DE Professional](../README.md) | [Next: Ensuring Data Security and Compliance →](../05-ensuring-data-security-and-compliance/README.md)**

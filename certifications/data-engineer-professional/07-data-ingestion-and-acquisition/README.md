---
title: Data Ingestion & Acquisition
type: category
tags:
  - data-engineer-professional
  - ingestion
  - auto-loader
status: published
---

# Data Ingestion & Acquisition (7 % of Exam)

Landing data into the lakehouse from object stores, message buses, and external systems. **Auto Loader** is the workhorse for cloud-storage ingestion; this section also covers batch ingestion patterns and source-side connectors.

## Topics Overview

```mermaid
flowchart LR
    Ing[Data Ingestion] --> AL[Auto Loader]
    Ing --> Batch[Batch Ingestion]
    Ing --> Conn[External Connectors]
```

## Section Contents

| File | Topic | Priority |
| :--- | :--- | :--- |
| [01-auto-loader.md](./01-auto-loader.md) | Schema inference, evolution, file notification mode | High |

## Key Concepts to Master

| Concept | Why it matters |
| :--- | :--- |
| **Auto Loader** | Incremental file ingestion (`cloudFiles` source) with built-in schema inference, evolution, and listing/notification modes |
| **File notification vs directory listing** | Notification (SNS/SQS, EventGrid) scales to millions of files; listing is simpler but limits scale |
| **`cloudFiles.schemaLocation`** | Persists inferred schema so re-runs don't re-scan source files |
| **Schema evolution modes** | `addNewColumns` (default), `rescue`, `failOnNewColumns`, `none` |
| **Batch ingestion patterns** | `COPY INTO` for idempotent batch loads; Auto Loader for streaming or incremental batch |

## Related Resources

- [Auto Loader cheat sheet (shared)](../../../shared/cheat-sheets/auto-loader-quick-ref.md)
- [Streaming Fundamentals (shared)](../../../shared/fundamentals/streaming-fundamentals.md)
- [Auto Loader documentation](https://docs.databricks.com/en/ingestion/auto-loader/index.html)

> [!note]
> This domain is currently represented by a single deep-dive on Auto Loader, the most-tested ingestion mechanism. Expanded coverage of **batch ingestion patterns** (`COPY INTO`, JDBC/ODBC ingestion, partner connectors) is on the [guide roadmap](../../../README.md#roadmap-for-the-guide-itself).

---

**[← Previous: Debugging and Deploying](../06-debugging-and-deploying/README.md) | [↑ Back to DE Professional](../README.md) | [Next: Data Governance →](../08-data-governance/README.md)**

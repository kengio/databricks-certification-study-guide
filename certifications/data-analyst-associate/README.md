---
title: Data Analyst Associate
tags:
  - databricks
  - certification
  - data-analyst
type: certification
aliases:
  - DA Associate
---

# Databricks Data Analyst Associate

> [!important]
> **What changed in the October 2025 exam guide**
>
> - Restructured from 5 broad sections into **9 explicitly weighted domains**
> - **AI/BI Genie Spaces** is now a first-class domain (12 %) — natural-language analytics on top of Unity Catalog
> - **Securing Data** broken out as its own 8 % domain
> - **Importing Data** and **Data Modeling with Databricks SQL** are now distinct 5 % domains
> - Pass / fail — **the October 2025 exam guide does not publish a numeric passing score**
>
> The official source of truth: [Databricks Certified Data Analyst Associate](https://www.databricks.com/learn/certification/data-analyst-associate) and the [exam guide PDF](https://www.databricks.com/sites/default/files/2025-10/databricks-certified-data-analyst-associate-oct-2025.pdf). The folder structure in this guide matches the official 9-domain blueprint 1 : 1, and each section README maps every exam-guide skill to a file.

> [!note] Platform update (Oct 2026)
> No new exam guide has been published (checked October 26, 2026). The certification page now names the platform domain **"Understanding of Databricks Data + AI Platform"** (the PDF says "Data Intelligence Platform"). Several products the exam names have been renamed — answer with the exam's term:
>
> | Exam guide says | Current name |
> | :--- | :--- |
> | Delta Live Tables | Lakeflow Spark Declarative Pipelines (Nov 12, 2025) |
> | Databricks Assistant | Genie Code (Mar 11, 2026) |
> | Delta Sharing | OpenSharing (Jun 10, 2026) |
> | Genie spaces | Genie Agents (Jul 8, 2026) |
>
> Sources: Databricks release notes for [November 2025](https://docs.databricks.com/aws/en/release-notes/product/2025/november), [March 2026](https://docs.databricks.com/aws/en/release-notes/product/2026/march), [June 2026](https://docs.databricks.com/aws/en/release-notes/product/2026/june), and [July 2026](https://docs.databricks.com/aws/en/release-notes/product/2026/july).

## Exam Overview

| Detail              | Information                                 |
| ------------------- | ------------------------------------------- |
| **Certification**   | Databricks Certified Data Analyst Associate |
| **Exam guide**      | October 2025                                |
| **Scored questions**| 45 multiple-choice                          |
| **Duration**        | 90 minutes                                  |
| **Result**          | Pass / fail (no numeric threshold in the October 2025 exam guide) |
| **Languages**       | English                                     |
| **Code in stems**   | SQL (ANSI-compliant)                        |
| **Experience**      | 6+ months hands-on with Databricks SQL (recommended) |
| **Recertification** | Every 2 years — see [Renewal Guide](../../shared/appendix/renewal-guide.md) |
| **Cost**            | $200 USD                                    |
| **Delivery**        | Online proctored or test center             |

## Exam Domain Weights (official — October 2025)

```mermaid
pie title Exam Topic Distribution (9 domains)
    "Executing Queries Using Databricks SQL and Warehouses" : 20
    "Creating Dashboards and Visualizations" : 16
    "Analyzing Queries" : 15
    "Developing, Sharing, and Maintaining AI/BI Genie Spaces" : 12
    "Understanding of Databricks Data + AI Platform" : 11
    "Managing Data" : 8
    "Securing Data" : 8
    "Importing Data" : 5
    "Data Modeling with Databricks SQL" : 5
```

| Domain | Weight |
| :--- | :---: |
| Executing Queries Using Databricks SQL and Warehouses | 20 % |
| Creating Dashboards and Visualizations | 16 % |
| Analyzing Queries | 15 % |
| Developing, Sharing, and Maintaining AI/BI Genie Spaces | 12 % |
| Understanding of Databricks Data + AI Platform | 11 % |
| Managing Data | 8 % |
| Securing Data | 8 % |
| Importing Data | 5 % |
| Data Modeling with Databricks SQL | 5 % |

## Study Topics

The folder structure below matches the October 2025 official 9-domain blueprint. Read in order; each folder's `README.md` has the section contents and key concepts.

| Section                                                                                | Weight | Focus |
| -------------------------------------------------------------------------------------- | :----: | :--- |
| [01 — Executing Queries Using Databricks SQL and Warehouses](./01-executing-queries-databricks-sql-warehouses/README.md) | 20 %   | SQL warehouses, Assistant, joins and set operations, aggregates, tables, time travel, MVs vs streaming tables, federation |
| [02 — Creating Dashboards and Visualizations](./02-creating-dashboards-and-visualizations/README.md) | 16 %   | AI/BI dashboards, visualizations, parameters, alerts, schedules, sharing and embedding |
| [03 — Analyzing Queries](./03-analyzing-queries/README.md)                              | 15 %   | Photon, query history and profile, caching, Delta history, liquid clustering, fixing queries |
| [04 — Developing, Sharing, and Maintaining AI/BI Genie Spaces](./04-developing-sharing-maintaining-genie-spaces/README.md) | 12 % | Genie Spaces (now Genie Agents) creation, curation, benchmarks, sharing, API |
| [05 — Understanding of Databricks Data + AI Platform](./05-understanding-databricks-platform/README.md) | 11 % | Platform components, Unity Catalog, Catalog Explorer, Marketplace, connections |
| [06 — Managing Data](./06-managing-data/README.md)                                     |  8 %   | Certified datasets, tags, lineage, data cleaning, tables and schemas |
| [07 — Securing Data](./07-securing-data/README.md)                                     |  8 %   | Privileges, ownership, namespace and volumes, row filters, column masks, PII |
| [08 — Importing Data](./08-importing-data/README.md)                                   |  5 %   | UI upload, S3 and `COPY INTO`, Auto Loader, Delta Sharing, API intake, Marketplace |
| [09 — Data Modeling with Databricks SQL](./09-data-modeling-with-databricks-sql/README.md) |  5 %   | Medallion, star/snowflake, Data Vault, views vs MVs |

### Practice & Resources

| Resource                                                        | Description                              |
| --------------------------------------------------------------- | ---------------------------------------- |
| [Practice Questions](./resources/practice-questions/README.md)  | 159 questions across the 9 official domains |
| [Mock Exam 1](./resources/mock-exam/README.md)                  | Full-length practice exam                |
| [Mock Exam 2](./resources/mock-exam-2/README.md)                | Alternative practice exam                |
| [Exam Tips](./resources/exam-tips.md)                           | Exam strategies and tips                 |
| [Official Links](./resources/official-links.md)                 | Documentation and resources              |

## Interview Preparation

After completing this certification, explore:

- [Interview Prep Resource](../../shared/interview-prep/README.md) - Complement your SQL knowledge with system design and architecture

## Prerequisites

Review these shared fundamentals:

- [SQL Essentials](../../shared/fundamentals/sql-essentials.md)
- [Delta Lake Basics](../../shared/fundamentals/delta-lake-basics.md)
- [Unity Catalog Basics](../../shared/fundamentals/unity-catalog-basics.md)

## Study Progress Tracker

- [ ] Explain what a SQL warehouse does; compare serverless, pro, and classic
- [ ] Write joins, set operations, aggregates, and time-travel queries
- [ ] Create a materialized view and a streaming table; join a federated table
- [ ] Build a multi-page AI/BI dashboard with parameters, a schedule, and an alert
- [ ] Find a slow query in query history and read its query profile; apply liquid clustering
- [ ] Build a Genie Space (Genie Agent) on a UC schema, tune it, and score it with benchmarks
- [ ] Match each platform component (exam name and current name) to its job; explore Marketplace
- [ ] Certify, tag, and trace lineage in Catalog Explorer; clean a table in SQL
- [ ] Apply row filters and column masks; transfer ownership to a group
- [ ] Load data with the UI, `COPY INTO`, and Auto Loader; read a share
- [ ] Map star, snowflake, and Data Vault models to medallion layers

## Official Resources

- [Databricks Certification Page](https://www.databricks.com/learn/certification/data-analyst-associate)
- [Databricks SQL documentation](https://docs.databricks.com/aws/en/sql/)
- [Databricks Free Edition](https://docs.databricks.com/aws/en/getting-started/free-edition) — free hands-on practice (replaced the retired Community Edition)
- [Genie Agents documentation (formerly AI/BI Genie spaces)](https://docs.databricks.com/aws/en/genie-agents/)

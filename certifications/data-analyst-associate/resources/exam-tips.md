---
tags: [exam-tips, data-analyst-associate, certification]
---

# Exam Tips and Strategies

Checked against the October 2025 exam guide, the certification page, and the Databricks documentation on October 26, 2026.

## Exam Format

| Item | Value |
| :--- | :--- |
| Questions | 45 scored multiple-choice (plus possible unscored items) |
| Duration | 90 minutes |
| Passing score | Not published — Databricks does not publish passing scores |
| Code in questions | SQL, ANSI-compliant |
| Delivery | Online proctored or test center |
| Fee | $200 |
| Retakes | Wait 14 days between attempts; each attempt costs the full fee |
| Validity | 2 years; recertify by taking the current exam |

Sources: [exam guide PDF](https://www.databricks.com/sites/default/files/2025-10/databricks-certified-data-analyst-associate-oct-2025.pdf), [certification page](https://www.databricks.com/learn/certification/data-analyst-associate), [certification FAQ](https://www.databricks.com/learn/certification/faq).

## Time Management

| Time | Activity |
| :--- | :--- |
| 0–60 min | First pass (about 1.3 min per question) |
| 60–80 min | Review flagged questions |
| 80–90 min | Final check and submit |

### Question Strategy

1. **Read carefully** — watch for "BEST", "MOST", "NOT", "EXCEPT"
2. **Find the constraint** — freshness, cost, who must see what, copy vs no copy
3. **Flag and move** — don't spend more than 2 minutes on one question
4. **Eliminate** — narrow to two choices, then decide

## Topic Priority by Weight

| Priority | Domain | Weight |
| :---: | :--- | :---: |
| 1 | Executing queries using Databricks SQL and Databricks SQL Warehouses | 20 % |
| 2 | Creating Dashboards and Visualizations in Databricks | 16 % |
| 3 | Analyzing Queries | 15 % |
| 4 | Developing, Sharing, and Maintaining AI/BI Genie spaces | 12 % |
| 5 | Understanding of Databricks Data + AI Platform | 11 % |
| 6 | Managing Data | 8 % |
| 7 | Securing Data | 8 % |
| 8 | Importing Data | 5 % |
| 9 | Data Modeling with Databricks SQL | 5 % |

## Key Topics to Master

### Must Know

- [ ] What a SQL warehouse does; serverless vs pro vs classic (IWM is serverless-only; federation needs pro or serverless)
- [ ] Auto stop defaults: 10 minutes (serverless), 45 minutes (pro, classic)
- [ ] Joins (incl. semi/anti, composite keys) and `UNION` vs `UNION ALL`
- [ ] `approx_count_distinct`, `GROUP BY` vs `HAVING`, NULL handling
- [ ] Materialized view vs streaming table vs (dynamic) view
- [ ] Time travel (`VERSION AS OF`, `TIMESTAMP AS OF`) and why `VACUUM` breaks it
- [ ] Query history, query profile, Photon, result caching, liquid clustering
- [ ] AI/BI dashboards: pages, datasets, widgets, schedules, sharing, embedding
- [ ] Parameters: named markers `:name` (legacy `{{ }}` only in the legacy SQL editor)
- [ ] SQL alerts: query + condition + schedule + destination
- [ ] Genie spaces (now Genie Agents): curation, trusted assets, benchmarks, permissions
- [ ] Unity Catalog: namespace, privileges, ownership, row filters, column masks

### Should Know

- [ ] Databricks Assistant (now Genie Code): `/explain`, `/fix`, `/optimize`
- [ ] Lakehouse Federation: connection → foreign catalog → query
- [ ] Catalog Explorer: certified tables, tags, lineage
- [ ] Importing: UI upload limits, `COPY INTO` (idempotent), Auto Loader, Delta Sharing, Marketplace
- [ ] Data modeling: star, snowflake, Data Vault, medallion alignment

## Common Exam Traps

| Topic | Trap | Correct answer |
| :--- | :--- | :--- |
| Warehouse size vs clusters | "Bigger size fixes queueing" | Size lowers latency; more clusters add concurrency |
| Auto stop | "Default is 120 minutes" | 10 minutes serverless, 45 minutes pro/classic |
| Parameters | `{{param}}` in a dashboard | Dashboards use `:param`; mustache is legacy-editor only |
| `UNION` | Keeps duplicates | `UNION` removes duplicates; `UNION ALL` keeps them |
| QUALIFY | Confusing with HAVING | HAVING filters groups; QUALIFY filters window results |
| DROP TABLE | Same for managed and external | Managed: data and metadata deleted; external: metadata only |
| Time travel | History = readable versions | `VACUUM` can delete files an old version needs |
| Streaming table vs MV | MV for continuously arriving files | Streaming table for append-only incremental loads; MV for precomputed queries |
| Dashboard row filters | "Row filters don't work on dashboards" | Publish with individual data permissions |
| `DENY` | "Use DENY in Unity Catalog" | Unity Catalog has no DENY; use `REVOKE` |
| Genie | "Benchmarks improve answers" | Benchmarks only score accuracy |
| Delta Sharing | Copies data | Shares live, read-only data without copying |

## Quick Reference Numbers

| Item | Value |
| :--- | :--- |
| Serverless warehouse start-up | About 2–6 seconds |
| Pro / classic start-up | About 4 minutes |
| Concurrency guideline | About 1 cluster per 10 concurrent queries |
| Result cache entry lifetime | Up to 24 hours (invalidated when tables change) |
| Table history retention (`logRetentionDuration`) | 30 days |
| `VACUUM` threshold (`deletedFileRetentionDuration`) | 7 days |
| UI upload | Up to 10 files, under 2 GB total |
| Liquid clustering keys | Up to 4 |
| Tags per object | Up to 50 |
| Dashboard subscribers per schedule | Up to 100 |

## Renamed Products (exam name → current name)

| Exam guide says | Current name (Oct 2026) |
| :--- | :--- |
| Data Intelligence Platform | Data + AI Platform |
| Delta Live Tables | Lakeflow Spark Declarative Pipelines (Nov 12, 2025) |
| Databricks Assistant | Genie Code (Mar 11, 2026) |
| Genie spaces | Genie Agents (Jul 8, 2026) |
| Delta Sharing | OpenSharing (Jun 10, 2026) |

Answer with the exam's term; recognise the new one.

## Practice Hands-On

Use [Databricks Free Edition](https://docs.databricks.com/aws/en/getting-started/free-edition) — it includes serverless compute, the SQL editor, dashboards, and Genie. Community Edition has been retired; Free Edition replaced it.

## If You Don't Pass

- Review your score report by domain
- Start with Executing Queries (20 %) and Dashboards (16 %)
- Work through the matching [practice questions](./practice-questions/README.md)
- Wait 14 days before retaking

[← Back to Resources](./README.md)

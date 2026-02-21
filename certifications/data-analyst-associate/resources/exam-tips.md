---
tags: [exam-tips, data-analyst-associate, certification]
---

# Exam Tips and Strategies

## Exam Format

- **Questions**: 45 multiple-choice
- **Duration**: 90 minutes
- **Passing Score**: 70% (32/45 correct)
- **Languages**: SQL (primary), some Python references
- **Format**: Proctored online exam

## Time Management

| Time | Activity |
|---|---|
| 0-60 min | First pass (1.3 min/question avg) |
| 60-80 min | Review flagged questions |
| 80-90 min | Final review and submit |

### Question Strategy

1. **Read carefully** — Watch for "BEST", "MOST", "CANNOT", "EXCEPT"
2. **Flag and move** — Don't spend > 2 minutes on any question
3. **Eliminate wrong answers** — Narrow to 2 then choose
4. **SQL syntax questions** — Know exact function signatures, not just concepts

## Topic Priority by Weight

| Priority | Topic | Weight | Study Time |
|---|---|---|---|
| 1 | SQL Queries | 29% | 29% |
| 2 | Databricks SQL | 22% | 22% |
| 3 | Data Management | 20% | 20% |
| 4 | Dashboards & Visualization | 18% | 18% |
| 5 | Analytics Applications | 11% | 11% |

## Key Topics to Master

### Must Know (High Frequency)

- [ ] SQL window functions: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`, `SUM() OVER (PARTITION BY ... ORDER BY ...)`
- [ ] `QUALIFY` clause — filter on window function results
- [ ] SQL warehouse types: Classic, Pro, Serverless — differences and when to use each
- [ ] Unity Catalog three-level namespace: `catalog.schema.table`
- [ ] `GRANT` and `REVOKE` syntax for UC objects
- [ ] Managed vs external tables — DROP behavior difference
- [ ] Delta Lake schema evolution: `mergeSchema`, `overwriteSchema`
- [ ] Dashboard widget types (table, counter, chart, text) and their use cases
- [ ] SQL alert configuration — threshold condition, schedule, notification destination
- [ ] Query parameterization: `{{variable}}` syntax

### Should Know (Medium Frequency)

- [ ] JOIN types: INNER, LEFT, RIGHT, FULL, CROSS, ANTI, SEMI
- [ ] CTEs vs subqueries — when to use each
- [ ] `PIVOT` and `UNPIVOT`
- [ ] Array functions: `EXPLODE`, `ARRAY_AGG`, `COLLECT_LIST`
- [ ] SQL warehouse auto-stop default (120 minutes)
- [ ] Serverless vs Pro warehouse key differences
- [ ] `EXPLAIN` for query profiling
- [ ] Clustering keys on Delta tables

### Good to Know (Lower Frequency)

- [ ] Lakeview Dashboards vs legacy dashboards
- [ ] `QUALIFY` vs `HAVING` — when each applies
- [ ] Dashboard embedding and sharing options
- [ ] Row-level security patterns in Databricks SQL
- [ ] Query history and profiling

## Common Exam Traps

| Topic | Trap | Correct Answer |
|---|---|---|
| Warehouse types | Serverless = no cold start, Pro = multiple clusters | Serverless: instant start, per-second billing. Pro: up to 10 clusters, fixed capacity |
| QUALIFY | Confusing with HAVING | HAVING filters GROUP BY aggregations; QUALIFY filters window function results |
| DROP TABLE | Same for managed and external | Managed: deletes data AND metadata. External: deletes metadata only |
| UC hierarchy | Two-level vs three-level | UC always three-level: catalog.schema.table |
| GRANT syntax | `GRANT ON TABLE` vs `GRANT SELECT ON TABLE` | Must specify privilege: `GRANT SELECT ON TABLE` |
| Auto-stop | Always enabled by default | Default is 120 minutes; can be disabled on Pro/Serverless |
| Schema evolution | Automatic for Delta | Must explicitly set `mergeSchema` option — not automatic |

## Quick Reference: SQL Warehouse Comparison

| Feature | Classic | Pro | Serverless |
|---|---|---|---|
| Max clusters | 1 | Up to 10 | Auto-managed |
| Start time | 2-5 min | 2-5 min | Seconds (instant) |
| Auto-stop | Yes (default 120 min) | Yes | Yes |
| Billing | Per DBU-hour | Per DBU-hour | Per DBU-second |
| Best for | Single workloads | High concurrency | Bursty/unpredictable |
| Row-level security | No | Yes | Yes |
| Query federation | No | Yes | Yes |

## Quick Reference Numbers

| Item | Value |
|---|---|
| SQL warehouse default auto-stop | 120 minutes |
| UC catalog default | `main` |
| Default shuffle partitions | 200 |
| Broadcast join threshold | 10 MB |
| Delta VACUUM default retention | 168 hours (7 days) |

## Day Before Exam

### Do

- [ ] Review window function syntax — write a few by hand
- [ ] Review UC GRANT statement patterns
- [ ] Review SQL warehouse type comparison table
- [ ] Get good sleep

### Don't

- [ ] Cram new topics
- [ ] Second-guess concepts you've studied
- [ ] Skip the quick reference numbers

## During the Exam

- Read all 4 options before selecting — two may look correct
- For SQL syntax questions: exact spelling matters (`OVER`, `PARTITION BY`, `ORDER BY`)
- For UC questions: always think three-level namespace
- Use full 90 minutes — don't rush to submit

## If You Don't Pass

- Review score report by domain
- Focus on SQL Queries (29%) and Databricks SQL (22%) first — highest weights
- Practice more window function queries
- Re-read UC permission documentation
- Wait 14 days before retaking

## Final Checklist

Before submitting:

- [ ] All 45 questions answered
- [ ] Flagged questions reviewed
- [ ] Window function syntax confirmed
- [ ] Submit

[← Back to Resources](./README.md)

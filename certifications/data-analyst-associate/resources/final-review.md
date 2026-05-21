---
title: Final Review — Data Analyst Associate
type: final-review
tags:
  - data-analyst-associate
  - final-review
  - exam-morning
status: published
---

# Final Review — Data Analyst Associate (20-minute exam-morning scan)

> [!important]
> Cram scan for exam morning. Unfamiliar lines → that's the domain to revisit later.

## 2-minute facts that show up *most often*

- **Three SQL Warehouse types**: Pro (Photon-on, Predictive I/O), Serverless (instant start), Classic (legacy)
- **Query result cache** is per-warehouse; identical queries return instantly until source data changes
- **AI/BI Dashboards** is the *current* dashboarding product (replaces "Databricks SQL Dashboards")
- **AI/BI Genie Spaces** generate SQL from natural language, **enforcing UC permissions** (row filters + column masks apply automatically)
- **Genie curation priorities** (per official best practice): **SQL expressions** first, **example SQL queries** second, **text instructions** last resort, **synonyms** as a complementary lever
- **`COPY INTO` is idempotent**; UI upload supports CSV/TSV/JSON/Parquet/Avro/text (limit 10 files / 2 GB)
- **Lakehouse Federation** = read-mostly query of external DBs
- **DENY overrides GRANT**; **REVOKE only removes a prior GRANT**
- **Row filters and column masks** = SQL UDFs attached to a column/table, enforced at query time
- **Materialized view** stores the result + refreshes; **standard view** runs on read
- **Star schema** is the BI default; snowflake when normalisation matters

## 5-minute per-domain quick-fire (9 domains)

### 01 — Executing Queries Using Databricks SQL and Warehouses (20 %)

- **Pro vs Serverless vs Classic** — pick Serverless for fast-start ad-hoc; Pro for production dashboards; Classic only for legacy compatibility
- **Query history** is per-workspace; query profiler shows shuffle / spill / time per stage

### 02 — Creating Dashboards and Visualizations (16 %)

- Dataset (saved query) vs widget (chart bound to a dataset)
- **SQL Alerts** evaluate on a schedule (down to 1 minute), apply a comparator, route to email/webhook
- Run-as: dashboard owner vs viewer — viewer mode respects each viewer's permissions

### 03 — Analyzing Queries (15 %)

- Joins: inner / outer / cross / **semi** (left rows that match) / **anti** (left rows that don't)
- `GROUPING SETS` / `ROLLUP` / `CUBE` for multi-dim aggregation in one query
- Window functions: `ROW_NUMBER` (unique), `RANK` (ties leave gaps), `DENSE_RANK` (no gaps); frame = `ROWS BETWEEN` or `RANGE BETWEEN`
- Parameters: type-safe binding; SQL injection not possible through the param channel

### 04 — Developing, Sharing, and Maintaining AI/BI Genie Spaces (12 %)

- A **Genie Space** is curated UC tables + optional SQL expressions + example queries + instructions + synonyms
- Genie generates SQL → runs on a SQL Warehouse → returns results. NOT "the model reads the data"
- **Genie respects UC permissions** — column masks + row filters apply
- Audit trail: every Genie-generated SQL captured

### 05 — Understanding Databricks Data Intelligence Platform (11 %)

- Three-level namespace `catalog.schema.object`; metastore at the region level
- Connections from BI tools: OAuth for humans; PAT or service-principal OAuth for service accounts
- Personal SQL Warehouse (small, on-demand) vs shared Serverless (multi-user)

### 06 — Managing Data (8 %)

- Managed (UC owns storage) vs External (you own storage)
- `CREATE OR REPLACE TABLE` atomically replaces contents
- `CREATE TABLE AS SELECT` (CTAS) materialises a query result

### 07 — Securing Data (8 %)

- GRANT cascades from catalog → schema → table; DENY overrides; REVOKE only removes prior GRANT
- Row filter: returns true/false per row; UC enforces per query
- Column mask: returns the original value or a masked one per row

### 08 — Importing Data (5 %)

- UI upload: ≤ 10 files / ≤ 2 GB; output is a managed Delta table
- `COPY INTO`: idempotent, bulk, repeatable; reads files (not Delta tables)
- Auto Loader: continuous file ingest — recognise the name (engineer-scope)
- Lakehouse Federation: read-mostly external query

### 09 — Data Modeling with Databricks SQL (5 %)

- Bronze (raw) / Silver (cleansed) / Gold (aggregated) — analysts mostly query Gold
- Star schema = fact + dimensions; snowflake = normalised dimensions
- View vs Materialized view: view runs on read; MV pre-computes + refreshes
- MVs can refresh **incrementally** when the source is Delta and the query is expressible incrementally

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Without copying data" + non-Delta external source | Lakehouse Federation |
| "Plain-English questions on UC tables" | AI/BI Genie Spaces |
| "Genie sees PII the user shouldn't see" | False — UC permissions apply to Genie SQL |
| "Threshold-based notification within minutes" | SQL Alert with webhook destination |
| "Dashboard takes too long to load" | Materialised view as the backing table |
| "First curation lever for Genie" | SQL expression (not text instruction) |
| "Re-running the load — will it duplicate?" | `COPY INTO` is idempotent — no |

## Today's exam — 90-minute time budget

- **45 questions ÷ 90 minutes = 2 min/question** — keep moving
- Skim each scenario for the *constraint* (single-user? threshold? cost? freshness?) — that picks the answer
- "Most managed / most governed" choice usually wins for Databricks-philosophy questions
- Watch for **legacy product names** ("Databricks SQL Dashboards" → AI/BI Dashboards; "DLT" → Lakeflow Declarative Pipelines)

## Eat. Hydrate. Breathe.

The work is done. Trust the prep. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to Data Analyst Associate](../README.md)**

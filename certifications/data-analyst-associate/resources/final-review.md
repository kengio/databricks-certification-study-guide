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

- **Three SQL warehouse types**: serverless (starts in 2–6 s, IWM, UI default), pro (Predictive I/O, ~4 min start), classic (~4 min start); Photon on all; federation needs pro or serverless
- **Result caches**: local (per cluster) and remote (serverless-only, shared across warehouses, survives restarts); invalidated when tables change
- **AI/BI Dashboards** is the *current* dashboarding product (replaces "Databricks SQL Dashboards")
- **AI/BI Genie Spaces** (renamed **Genie Agents** on July 8, 2026 — the exam still says "spaces") generate read-only SQL from natural language, **enforcing UC permissions per asking user** (row filters + column masks apply automatically)
- **Genie curation priorities** (per official best practice): **SQL expressions** first, **example SQL queries** second, **text instructions** last resort, **synonyms** as a complementary lever
- **`COPY INTO` is idempotent** (thousands of files); **Auto Loader** for millions; UI upload supports CSV/TSV/JSON/Parquet/Avro/text (limit 10 files / 2 GB)
- **Lakehouse Federation** = read-only query of external DBs through a foreign catalog
- **Parameters**: named markers `:name`; `{{ }}` mustache is legacy-SQL-editor only
- **No `DENY` in Unity Catalog** (legacy `hive_metastore` only) — remove access with **`REVOKE`**; grants on a catalog or schema apply to current and future children
- **Row filters and column masks** = SQL UDFs attached to a column/table, enforced at query time
- **Materialized view** stores the result + refreshes; **standard view** runs on read
- **Star schema** is the BI default; snowflake when normalisation matters

## 5-minute per-domain quick-fire (9 domains)

### 01 — Executing Queries Using Databricks SQL and Warehouses (20 %)

- Warehouse **size** = latency; **max clusters** = concurrency (~1 cluster per 10 concurrent queries); auto stop 10 min serverless / 45 min pro & classic
- Databricks Assistant (now **Genie Code**): `/explain`, `/fix` (Diagnose error), `/optimize`
- `UNION` removes duplicates, `UNION ALL` keeps them; join on every key column
- `approx_count_distinct` (HLL++, ~5 %); notebook data profile / `dbutils.data.summarize` for summary stats
- **MV** precomputes a query; **streaming table** appends new rows (`STREAM read_files`); **dynamic view** filters per user at read time
- `CREATE OR REPLACE TABLE` keeps history and grants; time travel `VERSION AS OF` / `TIMESTAMP AS OF`, limited by `VACUUM`
- Federated join: connection → foreign catalog → query on a pro or serverless warehouse

### 02 — Creating Dashboards and Visualizations (16 %)

- AI/BI dashboard = Data tab (many datasets) + pages + widgets (visualizations, filters, text, images)
- Parameters: `:name`, multi-select `array_contains(:p, col)`, date range `:p.min` / `:p.max`; test by typing a value and running
- **SQL alerts**: query + condition (value/aggregate, operator, threshold) + schedule + destination (admin-created); states OK / TRIGGERED / ERROR
- Publish with **shared** (publisher's credentials, default) or **individual** data permissions; account users get CAN RUN; external embedding uses a service principal

### 03 — Analyzing Queries (15 %)

- **Photon**: default vectorized engine on SQL warehouses; UDFs fall back to Spark; check Photon % in the query profile
- **Query history** (filters: user, date, compute, status...) → **query profile** (rows/time/memory per operator; exploding joins, full scans) → performance insights
- `DESCRIBE HISTORY` audits writes; time travel + `EXCEPT` compares versions
- **Liquid clustering**: `CLUSTER BY` up to 4 filter columns; replaces partitioning and `ZORDER`; `OPTIMIZE` applies it
- Fix-a-query classics: missing `GROUP BY`, aggregate in `WHERE` (→ `HAVING`), `= NULL` (→ `IS NULL`), outer join undone by `WHERE`

### 04 — Developing, Sharing, and Maintaining AI/BI Genie Spaces (12 %)

- A **Genie Space** is curated UC data (aim for **five or fewer tables**, max 50) + knowledge store + example SQL + SQL functions + instructions, on a **pro or serverless** SQL warehouse
- Genie generates SQL → runs on a SQL Warehouse → returns results. NOT "the model reads the data"
- **Genie respects UC permissions** — column masks + row filters apply per user; consumers need `SELECT` but **no warehouse permission**
- **Trusted assets** = parameterized example SQL (`:param`) + UC SQL functions → verified answers
- **Sharing**: `CAN MANAGE` / `CAN EDIT` / `CAN RUN` / `CAN VIEW`; distribute by link, iframe embed, or app integrations (Genie API)
- **Maintain**: Monitor tab (questions, feedback) → curate → refresh UC metadata → re-run **benchmarks** (Chat mode compares result sets; extra columns = Bad)
- Generated queries are attributed to the end user in query history and on the Monitor tab

### 05 — Understanding of Databricks Data + AI Platform (11 %)

- Exam names → today: Delta Live Tables → Lakeflow Spark Declarative Pipelines; Data Intelligence Engine = DatabricksIQ; Mosaic AI under Agent Bricks
- Catalog Explorer: managed vs external, certified/deprecated badges (`system.certification_status`), Lineage tab (needs `BROWSE`)
- Marketplace: datasets, models, notebooks, apps; delivered as shared catalogs via Delta Sharing (OpenSharing)

### 06 — Managing Data (8 %)

- Certify with **Assign certification** or `SET TAG ON ...`; find with `certificationStatus:certified`
- Tag with **Add tags** or `ALTER TABLE ... ALTER COLUMN ... SET TAGS`; needs `APPLY TAG`
- Clean with `DELETE ... WHERE`, `COALESCE`, `try_cast`, `DISTINCT`, `QUALIFY ROW_NUMBER() = 1`

### 07 — Securing Data (8 %)

- `catalog.schema.table|view|volume`; volume files at `/Volumes/<catalog>/<schema>/<volume>/`
- Owner = all privileges; `MANAGE` = manage without owning; metastore admin is optional; own production data with groups
- Row filter (rows) and column mask (values) are SQL UDFs on the table; `is_account_group_member()` for UC groups

### 08 — Importing Data (5 %)

- UI upload: ≤ 10 files / < 2 GB → managed Delta table; volume upload: any format, 5 GB per file
- S3 via external locations or volumes; `COPY INTO` (idempotent) vs Auto Loader (exactly-once, millions of files)
- Delta Sharing (OpenSharing): live, read-only, no copy; Zerobus Ingest for API push; Marketplace for third-party data

### 09 — Data Modeling with Databricks SQL (5 %)

- Bronze (raw) / Silver (validated, cleaned) / Gold (dimensional, measures) — analysts mostly query Gold
- Star = fact + denormalised dimensions; snowflake = normalised dimensions; Data Vault = hubs, links, satellites
- Data Vault / 3NF usually in **Silver**; Kimball star schemas in **Gold**

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Without copying data" + non-Delta external source | Lakehouse Federation |
| "Plain-English questions on UC tables" | AI/BI Genie Spaces |
| "Genie sees PII the user shouldn't see" | False — UC permissions apply to Genie SQL |
| "Threshold-based notification within minutes" | SQL Alert with webhook destination |
| "Dashboard takes too long to load" | Materialised view as the backing table |
| "First curation lever for Genie" | SQL expression (not text instruction) |
| "Benchmarks improve Genie's answers" | False — benchmarks only score accuracy |
| "Hide the column so nobody can read it" | Hiding only removes it from Genie's context — use UC grants / column masks |
| "Re-running the load — will it duplicate?" | `COPY INTO` is idempotent — no |

## Today's exam — 90-minute time budget

- **45 questions ÷ 90 minutes = 2 min/question** — keep moving
- Skim each scenario for the *constraint* (single-user? threshold? cost? freshness?) — that picks the answer
- "Most managed / most governed" choice usually wins for Databricks-philosophy questions
- Watch for **renamed products**: answer with the exam term ("Delta Live Tables", "Databricks Assistant", "Genie spaces", "Delta Sharing") — today they are Lakeflow Spark Declarative Pipelines, Genie Code, Genie Agents, and OpenSharing

## Eat. Hydrate. Breathe.

The work is done. Trust the prep. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to Data Analyst Associate](../README.md)**

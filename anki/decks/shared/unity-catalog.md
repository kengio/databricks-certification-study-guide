---
deck: Databricks::Shared::Unity Catalog
tags:
  - unity-catalog
  - governance
  - de-associate
  - de-professional
  - da-associate
  - ml-associate
  - ml-professional
  - genai-associate
---

# Unity Catalog — Anki Deck

> [!info]
> 22 cards covering the three-level UC namespace, privilege model, external locations, lineage, and the deprecated workspace-Hive-metastore pattern UC replaces. Sourced from `shared/fundamentals/unity-catalog-basics.md` and `shared/cheat-sheets/unity-catalog-quick-ref.md`.

## Three-level namespace

What does the full qualified name of a Unity Catalog table look like, and what are the three levels?

> [!success]- Answer
> `<catalog>.<schema>.<table>` — e.g., `prod.sales.orders`. Levels: **catalog** (top-level container, ~ workspace boundary) → **schema** (formerly "database") → **table** / **view** / **volume** / **function** / **model**.

## Metastore vs Workspace

In UC, what's the relationship between metastores and workspaces?

> [!success]- Answer
> One **metastore** per region (per Databricks account). Multiple **workspaces** can attach to the same metastore — they share catalogs, schemas, and tables. The metastore is the unit of cross-workspace sharing within a region.

## Managed vs External tables

What's the storage difference between a managed and an external table in UC?

> [!success]- Answer
> - **Managed** — UC owns the data files. Stored in the catalog's / schema's default storage location. `DROP TABLE` deletes data.
> - **External** — UC tracks metadata; you own the storage path (set via `LOCATION`). `DROP TABLE` deletes metadata only — files remain.

## External Location vs Storage Credential

What are the two UC primitives that govern access to cloud storage, and how do they relate?

> [!success]- Answer
> - **Storage Credential** — auth (IAM role / service principal / managed identity)
> - **External Location** — a path (e.g., `s3://bucket/prefix/`) + a Storage Credential it uses
>
> Tables and Volumes reference External Locations, which reference Storage Credentials. Two-layer indirection lets you rotate credentials without touching tables.

## GRANT syntax

What's the syntax to grant SELECT on a table to a group?

> [!success]- Answer
> ```sql
> GRANT SELECT ON TABLE prod.sales.orders TO `analysts`;
> ```
> Backticks around the group name aren't strictly required, but recommended for names with special characters.

## Privilege hierarchy

A user has `SELECT` on a schema but not on any tables inside. Can they query the tables?

> [!success]- Answer
> **Yes.** Privileges inherit downward in the hierarchy: catalog → schema → table. A `SELECT` grant at the schema level applies to every table currently in that schema and every new table added later. Explicit table-level grants are additive, not required.

## Information Schema

Where do you query *current* table / column / privilege metadata in UC?

> [!success]- Answer
> The `system.information_schema` views — e.g., `system.information_schema.tables`, `…columns`, `…table_privileges`. Standard ANSI views; queryable from any UC-enabled compute.

## Audit table

What system table contains UC access audit logs, and what's the retention?

> [!success]- Answer
> `system.access.audit`. Records every privileged operation (SELECT, INSERT, GRANT, etc.) with actor, object, action, source IP, timestamp. **Default retention: 365 days** (per system-table policy as of 2025).

## Row filters

How do you restrict which rows a user sees in a table without creating a separate view?

> [!success]- Answer
> Create a SQL UDF that returns a boolean, then attach it as a row filter:
> ```sql
> CREATE FUNCTION region_filter(region STRING)
>   RETURN region = current_user_region();
> ALTER TABLE sales SET ROW FILTER region_filter ON (region);
> ```
> Filter runs transparently on every read.

## Column masks

What's a column mask in UC, and how is it different from a row filter?

> [!success]- Answer
> A column mask is a SQL UDF that **transforms a column's value** based on the caller (typical use: redact PII for non-privileged users). Row filter excludes whole rows; column mask alters values within rows the user can already see.

## Volumes — managed vs external

What's a Volume, and what's the difference between managed and external?

> [!success]- Answer
> A **Volume** is a UC-governed file storage abstraction (for non-tabular data: JSON, images, ML model artifacts, raw uploads).
>
> - **Managed Volume** — UC owns the underlying storage path
> - **External Volume** — points to a path you own via External Location
>
> Both support file API and `dbutils.fs` access; both are governed by `READ VOLUME` / `WRITE VOLUME` privileges.

## Lineage — what's tracked automatically

If a notebook reads `silver.events` and writes `gold.daily_metrics`, what does UC lineage capture automatically?

> [!success]- Answer
> Table-level lineage AND column-level lineage (which input columns feed which output columns), captured for SQL, PySpark DataFrame API, and `dlt.*` declarative pipelines. No instrumentation required. Visible in Catalog Explorer's Lineage tab + queryable in `system.access.table_lineage`.

## Tags

What are UC tags used for, and where can you attach them?

> [!success]- Answer
> Key/value metadata for **classification + cost allocation + governance policies**. Attach to catalog / schema / table / column / volume / model. Queryable in `system.information_schema.tags`. Common pattern: `data_classification = pii` → drives row filter / column mask attachment.

## Service principals

When do you use a Service Principal vs a User account in UC, and how is auth different?

> [!success]- Answer
> Use a **service principal** for automated workloads (jobs, CI/CD, external apps) so the workload's identity is decoupled from any human. Auth via OAuth client credentials or PAT (PAT is being phased out). Service principals appear in audit logs as the actor for the work they run.

## Account-level groups

Where do groups live in UC, and why does it matter?

> [!success]- Answer
> Groups live at the **account level**, not the workspace level — one group definition spans every workspace under the account. Add group members once; permissions you grant the group apply consistently across workspaces. Workspace-local groups still exist for legacy reasons but are not recommended.

## Privilege names — USE vs USAGE

What's the difference between `USE CATALOG` and `USAGE` on a catalog?

> [!success]- Answer
> - `USE CATALOG` — lets you reference the catalog in queries (`SELECT * FROM catalog.schema.table`). Required just to "see" objects within.
> - `USAGE` — legacy / Hive-metastore privilege still recognised; superseded by `USE CATALOG` + `USE SCHEMA` for UC objects.
>
> On new UC tables, you need `USE CATALOG` + `USE SCHEMA` + table-level (e.g., `SELECT`).

## UC-enabled cluster — access modes

Which Databricks compute access modes are UC-compatible, and which one supports streaming + UDFs?

> [!success]- Answer
> Both **Single-user** and **Shared** access modes are UC-enabled.
>
> - **Single-user (Assigned)** — full feature compatibility (streaming, Python UDFs, custom libraries, init scripts)
> - **Shared** — multi-user with row-level isolation; some restrictions (e.g., no DBFS init scripts, limited UDF support pre-DBR 14)

## Model Registry in UC

Where do you register an MLflow model in UC, and what's the URI format?

> [!success]- Answer
> Register under `<catalog>.<schema>.<model_name>`. Set the client first: `mlflow.set_registry_uri("databricks-uc")`. Reference a version via alias: `models:/prod.ml.churn_classifier@Champion`. Aliases replace the deprecated `Staging` / `Production` / `Archived` stages.

## Feature Engineering in UC

Where do features live in UC, and what's the function that creates a feature table?

> [!success]- Answer
> Features live as regular UC tables — typically under a `<catalog>.features.<table>` schema. Create via:
> ```python
> from databricks.feature_engineering import FeatureEngineeringClient
> fe = FeatureEngineeringClient()
> fe.create_table(name="prod.features.customer", primary_keys=["customer_id"], schema=df.schema)
> ```
> No separate "Feature Store" — it's just UC tables with feature-engineering APIs over them.

## Foreign catalogs — Lakehouse Federation

What does Lakehouse Federation let you do, and what's the canonical use case?

> [!success]- Answer
> Query data **in place** in external databases (Postgres, MySQL, Snowflake, Redshift, BigQuery, SQL Server) via UC as if they were UC tables. The data never moves. Use case: federated reporting across operational systems without copying data into the lakehouse.

## Catalog binding

How do you restrict a catalog to be accessible from only specific workspaces?

> [!success]- Answer
> Use **catalog binding**: `ALTER CATALOG prod SET ISOLATION MODE = ISOLATED` then `ALTER CATALOG prod ADD ENVIRONMENTS WORKSPACES (workspace_id_1, workspace_id_2)`. Useful for prod-catalog isolation in shared-metastore setups.

## Default catalog

How do you make queries resolve unqualified table names against a specific catalog without writing `catalog.schema.table` every time?

> [!success]- Answer
> Set the workspace's default catalog: `Workspace settings → Default catalog`. Then `SELECT * FROM schema.table` resolves against the default catalog. Per-user override: `USE CATALOG prod;` at the top of the query session.

---

**[← Back to Anki index](../../README.md)**

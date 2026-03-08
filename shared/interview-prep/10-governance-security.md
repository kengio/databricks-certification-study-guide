---
tags: [interview-prep, governance, security]
---

# Interview Questions — Governance & Security

---

## Question 1: Unity Catalog Securable Object Hierarchy

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Explain Unity Catalog's securable object hierarchy. How does it differ from the legacy Hive metastore model, and why does the three-level namespace matter for enterprise data governance?

> [!success]- Answer Framework
>
> **Short Answer**: Unity Catalog organizes objects in a four-level hierarchy — Metastore (one per region, manages credentials and all metadata) → Catalog (domain or environment grouping) → Schema (groups tables and views) → Table — addressed via the three-level namespace `catalog.schema.table`, which enables centralized ACLs, cross-workspace access, and automatic audit logging unlike the workspace-scoped Hive metastore.
>
> ### Key Points to Cover
>
> - Hierarchy: Metastore → Catalog → Schema → Table/View/Function/Volume
> - Three-level namespace: `catalog.schema.table`
> - One metastore per cloud region (typically); attached to multiple workspaces
> - Hive metastore: single-level (`database.table`), workspace-scoped, no cross-workspace governance
> - UC: cross-workspace, centralized ACLs, audit logging, lineage — all in one place
> - Every securable has an owner with full control
>
> ### Example Answer
>
> Unity Catalog organizes data assets in a four-level hierarchy:
>
> ```text
> Metastore (1 per region)
> └── Catalog (e.g., prod, dev, finance)
>     └── Schema (e.g., bronze, silver, gold)
>         └── Table / View / Function / Volume
> ```
>
> The **metastore** is the top-level container — typically one per cloud region — and is attached to one or more Databricks workspaces. It stores storage credentials, external locations, and all catalog metadata.
>
> A **catalog** groups schemas by domain, environment, or team:
>
> - Environment pattern: `prod`, `dev`, `staging`
> - Domain pattern: `sales`, `finance`, `marketing`
>
> A **schema** (equivalent to a database) groups tables, views, and functions within a catalog. The **three-level namespace** means every object is uniquely addressable as `catalog.schema.table` — e.g., `prod.silver.orders`.
>
> **Why this matters for governance:**
>
> In the legacy Hive metastore, permissions were workspace-scoped — a user in Workspace A couldn't easily share data with Workspace B without copying. ACLs were stored in each workspace separately, leading to inconsistent access control.
>
> Unity Catalog's centralized model means:
>
> - A permission granted on `prod.silver.orders` applies across all workspaces attached to the metastore
> - Audit logs capture all access events centrally in `system.access.audit`
> - Data lineage is tracked automatically across workspaces
> - A `data_governance` team can manage all permissions from one place
>
> Every securable object has an **owner** (user or group) with full control. Ownership can be transferred:
>
> ```sql
> ALTER TABLE prod.silver.orders SET OWNER TO `data_engineering`;
> ```
>
> ### Follow-up Questions
>
> - Can a single Unity Catalog metastore serve workspaces in different cloud regions?
> - What is the difference between a managed table and an external table in terms of what happens when you DROP them?
> - How does Unity Catalog's storage credential work and why does it matter for external tables?

---

## Question 2: Row-Level and Column-Level Security

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Your HR table contains employee salary data and PII (name, SSN, email). HR managers should see all columns for their own department's employees only. Finance auditors should see salary but not SSN/email. Regular employees see no salary data. How do you implement this in Unity Catalog?

> [!success]- Answer Framework
>
> **Short Answer**: Create a Row Filter function using `IS_ACCOUNT_GROUP_MEMBER` and attach it with `ALTER TABLE ... SET ROW FILTER` so HR managers automatically see only their department's rows; create Column Mask functions that return masked values for SSN and email to non-HR groups and attach them with `ALTER TABLE ... ALTER COLUMN SET MASK` — both are enforced transparently at query time with no changes needed for consumers.
>
> ### Key Points to Cover
>
> - Row-level security: Row Filter using `CREATE FUNCTION` that filters based on `current_user()` or group membership
> - Column-level security: Column Mask using `CREATE FUNCTION` that returns masked value based on user/group
> - Assign filters/masks with `ALTER TABLE ... SET ROW FILTER / SET COLUMN MASK`
> - Groups: `hr_managers`, `finance_auditors`, `employees`
> - Filters evaluated at query time, transparent to consumers
>
> ### Example Answer
>
> Unity Catalog implements fine-grained access control with **Row Filters** and **Column Masks**.
>
> **Step 1 — Create groups** (in account admin):
>
> - `hr_managers`, `finance_auditors`, `employees`
>
> **Step 2 — Row Filter** (HR managers see only their department):
>
> ```sql
> CREATE FUNCTION prod.hr.dept_filter(dept_id INT)
> RETURN
>   IS_ACCOUNT_GROUP_MEMBER('hr_admins')  -- full access for HR admins
>   OR current_user() IN (
>     SELECT manager_email FROM prod.hr.departments WHERE department_id = dept_id
>   );
>
> -- Apply the row filter to the table
> ALTER TABLE prod.hr.employees
> SET ROW FILTER prod.hr.dept_filter ON (department_id);
> ```
>
> Now when HR managers query `prod.hr.employees`, they automatically see only rows where they are the manager. The filter is invisible to the consumer — it's applied by the engine.
>
> **Step 3 — Column Mask** (hide SSN and email from finance auditors):
>
> ```sql
> -- Mask SSN: show last 4 digits only, except for hr_admins
> CREATE FUNCTION prod.hr.mask_ssn(ssn STRING)
> RETURN
>   CASE
>     WHEN IS_ACCOUNT_GROUP_MEMBER('hr_admins') THEN ssn
>     ELSE CONCAT('***-**-', RIGHT(ssn, 4))
>   END;
>
> -- Mask email entirely for non-HR users
> CREATE FUNCTION prod.hr.mask_email(email STRING)
> RETURN
>   CASE
>     WHEN IS_ACCOUNT_GROUP_MEMBER('hr_admins') THEN email
>     ELSE '****@****'
>   END;
>
> ALTER TABLE prod.hr.employees
>   ALTER COLUMN ssn SET MASK prod.hr.mask_ssn,
>   ALTER COLUMN email SET MASK prod.hr.mask_email;
> ```
>
> **Step 4 — Salary access for finance auditors**:
> Finance auditors get `SELECT` on the table (they can see salary) but the column masks mean they only see the masked SSN and email. No separate view needed.
>
> ```sql
> GRANT USE CATALOG ON CATALOG prod TO `finance_auditors`;
> GRANT USE SCHEMA ON SCHEMA prod.hr TO `finance_auditors`;
> GRANT SELECT ON TABLE prod.hr.employees TO `finance_auditors`;
> -- Column masks automatically apply
> ```
>
> ### Follow-up Questions
>
> - Row filters and column masks are enforced even when a downstream view queries the base table. Why is this important?
> - A new analyst joins the `finance_auditors` group. Do you need to change any table permissions?
> - How do you test that a column mask is working correctly without granting yourself access as the target user?

---

## Question 3: Metastore, Catalog, Schema, Table — What's the Difference?

**Level**: Associate
**Type**: Deep Dive

**Scenario / Question**:
A new team member confuses "metastore", "catalog", "schema", and "table" when setting up Unity Catalog. Explain each level clearly, give an example of when you'd create each, and explain what `USE CATALOG` and `USE SCHEMA` actually do.

> [!success]- Answer Framework
>
> **Short Answer**: The metastore is a region-level container managed by account admins (not created in SQL); a catalog groups schemas by domain or environment; a schema groups tables, views, and functions within a catalog; and `USE CATALOG` / `USE SCHEMA` set the default namespace so you can write unqualified object names — they require navigation privileges but do not grant data access.
>
> ### Key Points to Cover
>
> - Metastore: one per region, managed by account admin; not created in SQL
> - Catalog: top-level namespace, created by catalog admin; isolates environments or domains
> - Schema: groups objects within a catalog (equivalent to a database)
> - Table: the actual data object; managed (UC owns data) or external (you own data)
> - `USE CATALOG` / `USE SCHEMA`: set the default namespace for unqualified references
>
> ### Example Answer
>
> Think of it like a filing system:
>
> | Level | Analogy | Who Creates It | Example |
> | ----- | ------- | -------------- | ------- |
> | Metastore | The filing cabinet | Account admin (in UI) | One per AWS region |
> | Catalog | A drawer in the cabinet | Catalog admin | `prod`, `dev`, `finance` |
> | Schema | A folder in the drawer | Data engineer | `bronze`, `silver`, `gold` |
> | Table | A document in the folder | Data engineer | `orders`, `customers` |
>
> **Metastore**: Managed by your Databricks account admin. You don't create it with SQL — it's provisioned in the account console. Typically one per cloud region. All workspaces in the same region share one metastore.
>
> **Catalog**: The first level you create with SQL. Use this to separate environments or domains:
>
> ```sql
> CREATE CATALOG IF NOT EXISTS prod;
> CREATE CATALOG IF NOT EXISTS dev;
> ```
>
> **Schema**: Groups tables, views, and functions within a catalog:
>
> ```sql
> CREATE SCHEMA IF NOT EXISTS prod.bronze;
> CREATE SCHEMA IF NOT EXISTS prod.silver;
> CREATE SCHEMA IF NOT EXISTS prod.gold;
> ```
>
> **Table**: Where the actual data lives:
>
> ```sql
> CREATE TABLE prod.silver.orders (
>     order_id BIGINT,
>     customer_id BIGINT,
>     amount DECIMAL(10,2)
> ) USING DELTA;
> ```
>
> **What `USE CATALOG` and `USE SCHEMA` do**: They set the default namespace so you can write shorter SQL without repeating the full three-level path:
>
> ```sql
> USE CATALOG prod;
> USE SCHEMA silver;
>
> -- Now this is equivalent to prod.silver.orders
> SELECT * FROM orders;
> ```
>
> Important: `USE CATALOG` / `USE SCHEMA` require that you have `USE CATALOG` and `USE SCHEMA` privileges respectively — they don't grant access, they just set defaults.
>
> ### Follow-up Questions
>
> - If you run `USE CATALOG dev` in one session, does that affect another user's session?
> - What happens to data files when you `DROP SCHEMA` containing managed tables?
> - Why might you create multiple catalogs instead of multiple schemas in one catalog?

---

## Question 4: Data Lineage for Regulated Industries

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
You're building a data platform for a bank subject to BCBS 239 (data lineage requirements). Auditors need to trace any number in a regulatory report back to its source system. How would you implement data lineage tracking in a Databricks + Unity Catalog platform?

> [!success]- Answer Framework
>
> **Short Answer**: Unity Catalog auto-captures column-level lineage for all SQL operations via `system.lineage.column_lineage`; supplement this with Bronze provenance metadata (source system, file path, extraction timestamp) that propagates through Silver to Gold, and use `system.access.audit` for immutable access logs — together these satisfy the BCBS 239 requirement to trace any report value to its source record.
>
> ### Key Points to Cover
>
> - Unity Catalog auto-captures column-level lineage for SQL operations (notebooks, SQL warehouses, DLT)
> - Lineage visible in Catalog Explorer and queryable via `system.lineage.column_lineage` (system tables)
> - Supplement with pipeline-level metadata (source system, ingestion timestamp, file name)
> - Document transformations in table/column comments and tags
> - For full audit trail: Delta transaction log + Unity Catalog audit logs (`system.access.audit`)
> - Consider data contracts between teams for documented interfaces
>
> ### Example Answer
>
> A BCBS 239-compliant lineage implementation uses Unity Catalog as the foundation, supplemented with operational metadata.
>
> **Layer 1 — Automatic UC lineage**: Unity Catalog captures column-level lineage automatically for operations executed through Databricks (notebooks, SQL warehouses, DLT pipelines). An auditor can trace `gold.regulatory_report.tier1_capital_ratio` back through Silver transformations to Bronze raw data — all in the Catalog Explorer UI or via system tables:
>
> ```sql
> -- Query column lineage programmatically
> SELECT
>     source_table_full_name,
>     source_column_name,
>     target_table_full_name,
>     target_column_name,
>     entity_type
> FROM system.lineage.column_lineage
> WHERE target_table_full_name = 'prod.gold.regulatory_report'
>   AND target_column_name = 'tier1_capital_ratio';
> ```
>
> **Layer 2 — Source system metadata in Bronze**: Capture provenance at ingestion time — source system name, source file path, extraction timestamp, source record ID:
>
> ```python
> bronze_df = (raw_df
>     .withColumn("_source_system", lit("core_banking_oracle"))
>     .withColumn("_source_file", input_file_name())
>     .withColumn("_extraction_timestamp", lit(extraction_ts))
>     .withColumn("_ingestion_timestamp", current_timestamp()))
> ```
>
> **Layer 3 — Propagate lineage columns through Silver → Gold**: Carry `_source_system` and `_source_record_id` forward so Gold-level report cells can be traced to a specific source record.
>
> **Layer 4 — Audit logs**: Unity Catalog audit logs (`system.access.audit`) record every SELECT, INSERT, and schema change with user, timestamp, and affected objects. These are immutable and available for 1 year (configurable) — meeting regulatory data access audit requirements.
>
> **Layer 5 — Data contracts**: Document transformation logic in table/column comments and use UC Tags (`'regulatory_critical' = 'true'`) to mark sensitive or reportable fields.
>
> ### Follow-up Questions
>
> - UC lineage only captures operations through Databricks. What about Spark jobs running directly via spark-submit?
> - How do you handle lineage for derived columns computed by Python UDFs, which UC can't introspect?
> - A regulator asks for a full audit trail of who changed the transformation logic for a specific report column. Where do you find this?

---

## Question 5: GRANT/REVOKE Inheritance and Privilege Scope

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Explain how privilege inheritance works in Unity Catalog. If I `GRANT SELECT ON SCHEMA prod.gold TO analysts`, do analysts automatically get `SELECT` on every table in that schema now and in the future? What's the minimum grant set for a user to query a table?

> [!success]- Answer Framework
>
> **Short Answer**: The minimum grant set to query a table is `USE CATALOG` + `USE SCHEMA` (navigation only) + `SELECT ON TABLE` (or `SELECT ON SCHEMA` to cover all current and future tables); privileges do NOT cascade automatically through the hierarchy — `ALL PRIVILEGES ON CATALOG` does not grant access to the tables within it, and each level requires its own explicit grant.
>
> ### Key Points to Cover
>
> - Schema-level `SELECT` grant covers all current AND future tables in that schema
> - But `USE CATALOG` and `USE SCHEMA` are still required separately (not inherited from SELECT)
> - Minimum: `USE CATALOG` + `USE SCHEMA` + `SELECT` (on table or schema)
> - `ALL PRIVILEGES` on catalog ≠ `ALL PRIVILEGES` on all schemas (each level is independent)
> - Best practice: grant to groups, not individual users; grant at schema level, not table level
> - REVOKE is explicit — removing schema grant removes access to all tables in schema
>
> ### Example Answer
>
> Unity Catalog privileges **do not cascade automatically** through the hierarchy the way you might expect. Each level requires explicit grants. However, a grant at a higher level (schema) covers objects at the lower level (tables) within that scope.
>
> **Minimum grants for a user to query `prod.gold.daily_sales`:**
>
> ```sql
> -- Step 1: Allow the user to navigate into the catalog
> GRANT USE CATALOG ON CATALOG prod TO `analysts`;
>
> -- Step 2: Allow the user to navigate into the schema
> GRANT USE SCHEMA ON SCHEMA prod.gold TO `analysts`;
>
> -- Step 3a: Grant SELECT on the specific table
> GRANT SELECT ON TABLE prod.gold.daily_sales TO `analysts`;
>
> -- OR Step 3b: Grant SELECT on the entire schema (all current + future tables)
> GRANT SELECT ON SCHEMA prod.gold TO `analysts`;
> ```
>
> **Schema-level `SELECT` and future tables**: Yes — `GRANT SELECT ON SCHEMA prod.gold` covers all tables that currently exist AND any new tables created in `prod.gold` in the future. This is a key difference from table-level grants.
>
> **What `USE CATALOG` does NOT grant**: `USE CATALOG` only allows navigation — it does not give `SELECT`, `CREATE TABLE`, or any other data access. Similarly, `USE SCHEMA` does not imply `SELECT`.
>
> **Inheritance rule of thumb:**
>
> | Grant Level | Covers |
> | ----------- | ------ |
> | `USE CATALOG` | Navigation into catalog only |
> | `USE SCHEMA` | Navigation into schema only |
> | `SELECT ON TABLE` | That specific table only |
> | `SELECT ON SCHEMA` | All current and future tables in schema |
> | `ALL PRIVILEGES ON CATALOG` | All privileges on the catalog object itself, NOT on schemas/tables within it |
>
> **Best practice**: Grant to groups, not individual users. Grant `SELECT ON SCHEMA prod.gold TO analysts` once rather than maintaining per-table grants for each new table.
>
> ```sql
> -- When an analyst is added to the analysts group, they immediately
> -- have access to all gold tables — no additional grants needed
> ```
>
> ### Follow-up Questions
>
> - An analyst has `SELECT ON SCHEMA prod.gold`. A new table `prod.gold.weekly_summary` is created. Does the analyst need a new grant?
> - You `REVOKE SELECT ON SCHEMA prod.gold FROM analysts`. Do they lose access to tables they were separately granted `SELECT` on at the table level?
> - What is the `OWNERSHIP` privilege and when should you assign it?

---

## Question 6: Lakehouse Federation — Querying External Systems

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Your analytics team needs to join a Delta table in Unity Catalog with data living in PostgreSQL and Snowflake — but moving the data into Databricks isn't an option due to contractual and latency constraints. How do you enable cross-system queries without data movement?

> [!success]- Answer Framework
>
> **Short Answer**: Lakehouse Federation lets you create Unity Catalog connections to external databases (PostgreSQL, Snowflake, MySQL, etc.), register them as foreign catalogs, and query them with standard SQL alongside native Delta tables — all governed by UC permissions.
>
> ### Key Points to Cover
>
> - Lakehouse Federation creates read-only connections to external databases through Unity Catalog
> - `CREATE CONNECTION` stores connection details (host, port, credentials via secrets)
> - `CREATE FOREIGN CATALOG` maps the external database into the UC three-level namespace
> - Federated tables are queried as `foreign_catalog.schema.table` — identical syntax to native tables
> - Predicate and projection pushdown reduces data transferred from external systems
> - UC permissions apply to federated tables — you can `GRANT SELECT` on foreign catalogs/schemas
> - When to federate vs ingest: federate for low-frequency, small-volume queries; ingest for high-frequency, large-volume, or latency-sensitive workloads
>
> ### Example Answer
>
> Lakehouse Federation is the Databricks feature that lets you query external databases directly through Unity Catalog without copying data. It supports PostgreSQL, MySQL, SQL Server, Snowflake, BigQuery, Redshift, and others.
>
> **Setting up a connection to PostgreSQL:**
>
> ```sql
> -- Step 1: Create a connection (credentials stored via Databricks secrets)
> CREATE CONNECTION postgres_erp
> TYPE POSTGRESQL
> OPTIONS (
>     host 'erp-db.company.internal',
>     port '5432',
>     user secret('federation-scope', 'pg-user'),
>     password secret('federation-scope', 'pg-password')
> );
>
> -- Step 2: Create a foreign catalog that maps to the external database
> CREATE FOREIGN CATALOG erp_postgres
> USING CONNECTION postgres_erp
> OPTIONS (database 'erp_production');
> ```
>
> **Setting up Snowflake:**
>
> ```sql
> CREATE CONNECTION snowflake_finance
> TYPE SNOWFLAKE
> OPTIONS (
>     host 'acme.snowflakecomputing.com',
>     user secret('federation-scope', 'sf-user'),
>     password secret('federation-scope', 'sf-password'),
>     sfWarehouse 'ANALYTICS_WH'
> );
>
> CREATE FOREIGN CATALOG finance_snowflake
> USING CONNECTION snowflake_finance
> OPTIONS (database 'FINANCE_DB');
> ```
>
> **Querying across systems:**
>
> ```sql
> -- Join a native Delta table with PostgreSQL and Snowflake data
> SELECT
>     o.order_id,
>     c.customer_name,
>     r.revenue_amount
> FROM prod.silver.orders o
> JOIN erp_postgres.public.customers c ON o.customer_id = c.id
> JOIN finance_snowflake.reporting.revenue r ON o.order_id = r.order_id
> WHERE o.order_date >= '2025-01-01';
> ```
>
> **Performance considerations**: Databricks pushes predicates and column projections down to the external system, so `WHERE` clauses and column selections execute remotely. However, joins between two external systems still pull data into Databricks. For large-volume, high-frequency queries, ingesting data into Delta is almost always better — federation shines for ad-hoc analytics, low-frequency reporting, or data that contractually cannot be copied.
>
> **Governance**: Federated tables are governed by UC permissions like any other table. You can `GRANT SELECT ON CATALOG erp_postgres TO analysts` and they'll see it alongside native catalogs.
>
> ### Follow-up Questions
>
> - What happens to a federated query if the external database is down or slow?
> - Can you write to external databases through Lakehouse Federation, or is it read-only?
> - How does query performance compare between a federated query and the same data ingested into Delta?

---

## Question 7: Unity Catalog Volumes and External Locations

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Your team manages raw files — CSVs, JSONs, images, and ML model artifacts — alongside Delta tables. How does Unity Catalog handle governance for non-tabular data, and what are the key constructs involved?

> [!success]- Answer Framework
>
> **Short Answer**: Unity Catalog governs non-tabular data through Volumes (managed or external), which provide a file-system-like interface under the three-level namespace. External locations and storage credentials control access to cloud storage paths, enabling fine-grained governance over raw files just like tables.
>
> ### Key Points to Cover
>
> - Managed volumes: UC manages the storage location; files are stored under the catalog's managed storage
> - External volumes: point to existing cloud storage (S3, ADLS, GCS) that you manage
> - External locations: map a cloud storage path to a UC-governed object with an associated storage credential
> - Storage credentials: wrap cloud IAM roles or service principals for secure access
> - Volumes are accessed via `/Volumes/catalog/schema/volume_name/path/to/file`
> - Migration from DBFS mounts: replace `/mnt/` paths with `/Volumes/` paths
> - Use managed volumes for new data; external volumes for existing cloud storage you can't move
>
> ### Example Answer
>
> Unity Catalog extends governance beyond tables to raw files through two key constructs: **external locations** (cloud storage mapping) and **volumes** (file-system interface).
>
> **External location and storage credential setup:**
>
> ```sql
> -- Step 1: Create a storage credential wrapping an IAM role
> CREATE STORAGE CREDENTIAL landing_zone_cred
> WITH (
>     AWS_IAM_ROLE = 'arn:aws:iam::123456789:role/uc-landing-zone'
> );
>
> -- Step 2: Create an external location mapping a cloud path
> CREATE EXTERNAL LOCATION landing_zone
> URL 's3://company-landing-zone/raw/'
> WITH (STORAGE CREDENTIAL landing_zone_cred);
> ```
>
> **Creating volumes:**
>
> ```sql
> -- Managed volume (UC controls storage)
> CREATE VOLUME prod.bronze.raw_uploads
> COMMENT 'Uploaded CSVs and JSONs from partner feeds';
>
> -- External volume (you control storage)
> CREATE EXTERNAL VOLUME prod.bronze.legacy_files
> LOCATION 's3://company-landing-zone/raw/legacy/'
> COMMENT 'Legacy files in existing S3 bucket';
> ```
>
> **Accessing files in volumes:**
>
> ```python
> # Read a CSV from a managed volume
> df = (spark.read.format("csv")
>     .option("header", "true")
>     .load("/Volumes/prod/bronze/raw_uploads/partner_feed.csv"))
>
> # Copy files into a volume
> dbutils.fs.cp(
>     "s3://temp-bucket/upload.json",
>     "/Volumes/prod/bronze/raw_uploads/upload.json"
> )
> ```
>
> **Managed vs external volumes**: Use managed volumes for new data where you want UC to handle storage lifecycle (drop volume = delete files). Use external volumes when the data already exists in cloud storage and moving it isn't feasible — UC governs access but doesn't own the storage.
>
> **Governance**: Volumes support `GRANT READ VOLUME` and `GRANT WRITE VOLUME` permissions, so you can control who reads or writes files. Combined with external locations, this replaces the old DBFS mount pattern with proper access control and audit logging.
>
> ### Follow-up Questions
>
> - What happens to the underlying files when you `DROP VOLUME` for managed vs external volumes?
> - Can you use volumes with DLT pipelines, or are they only for ad-hoc access?
> - How do you migrate existing notebooks that use `/mnt/data/` paths to use volumes?

---

## Question 8: Delta Sharing — External Partner Data Exchange

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
Your company needs to share curated revenue data with an external audit firm that doesn't use Databricks. The data must be filtered by region, access must be revocable, and all access must be logged. How do you set this up?

> [!success]- Answer Framework
>
> **Short Answer**: Delta Sharing is an open protocol for secure data exchange without copying data. Create a share containing specific tables (optionally filtered by partition), create a recipient representing the audit firm, and provide them an activation link — they can then access the data from any client that supports the Delta Sharing protocol, including pandas, Spark, Power BI, and Tableau.
>
> ### Key Points to Cover
>
> - Delta Sharing is an open protocol — recipients don't need Databricks
> - Open sharing: recipient gets an activation link and downloads a credential file (`.share` file)
> - Databricks-to-Databricks sharing: native integration without credential files
> - Partition filtering: share only specific partitions (e.g., `region = 'EMEA'`)
> - Recipient activation flow: create recipient → share activation link → recipient downloads credentials
> - Audit logging: all access is recorded in `system.access.audit`
> - Access revocation: `DROP RECIPIENT` or `ALTER SHARE ... REMOVE TABLE` immediately cuts access
>
> ### Example Answer
>
> Delta Sharing lets you share data with external organizations securely without data copying or vendor lock-in.
>
> **Setting up the share:**
>
> ```sql
> -- Step 1: Create a share (logical container for shared objects)
> CREATE SHARE audit_revenue_share
> COMMENT 'Revenue data for external auditors - EMEA region only';
>
> -- Step 2: Add a table with partition filtering
> ALTER SHARE audit_revenue_share
> ADD TABLE prod.gold.revenue_summary
> PARTITION (region = 'EMEA')
> COMMENT 'EMEA revenue only';
>
> -- Step 3: Create a recipient for the audit firm
> CREATE RECIPIENT deloitte_audit_2025
> COMMENT 'Deloitte external audit engagement 2025';
> -- This generates an activation link
>
> -- Step 4: Grant the recipient access to the share
> GRANT SELECT ON SHARE audit_revenue_share TO RECIPIENT deloitte_audit_2025;
> ```
>
> **Recipient activation flow**: After creating the recipient, Databricks generates a one-time activation link. You send this link to the audit firm. They click it, download a `.share` credential file, and use it to connect from their tools:
>
> ```python
> # Audit firm's side — reading shared data with pandas
> import delta_sharing
>
> profile = "path/to/credential.share"
> table_url = f"{profile}#audit_revenue_share.default.revenue_summary"
> df = delta_sharing.load_as_pandas(table_url)
> ```
>
> **Partition-level control**: The `PARTITION (region = 'EMEA')` clause means the audit firm only sees EMEA data — they cannot access other regions even if the underlying table contains global data. You can add multiple partition filters per table.
>
> **Revoking access**: When the audit engagement ends, revoke immediately:
>
> ```sql
> -- Option 1: Remove the recipient entirely
> DROP RECIPIENT deloitte_audit_2025;
>
> -- Option 2: Remove specific tables from the share
> ALTER SHARE audit_revenue_share REMOVE TABLE prod.gold.revenue_summary;
> ```
>
> **Audit logging**: All recipient access (data reads, schema inspections) is captured in Unity Catalog audit logs. You can query `system.access.audit` to see exactly when the audit firm accessed the data, what they queried, and how much data was transferred.
>
> ### Follow-up Questions
>
> - Can you share views or only tables? What about sharing materialized views?
> - How do you rotate or expire the recipient's credentials?
> - What's the difference between open sharing and Databricks-to-Databricks sharing in terms of setup and capabilities?

---

## Question 9: DBFS Deprecation and Mount Migration Strategy

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Your team uses DBFS mounts (`/mnt/data/`) extensively across hundreds of notebooks. Leadership has mandated a migration to Unity Catalog. What's your migration plan, and why is this migration necessary?

> [!success]- Answer Framework
>
> **Short Answer**: DBFS mounts are insecure because they grant workspace-level access with no fine-grained permissions, no audit logging, and no lineage tracking. The migration path is: inventory all mount points, create corresponding UC external locations and volumes, update notebook paths from `/mnt/` to `/Volumes/`, test, and decommission mounts.
>
> ### Key Points to Cover
>
> - DBFS mounts are workspace-scoped — any user in the workspace can read all mounted data
> - No fine-grained permissions: you cannot restrict access to specific folders or files within a mount
> - No lineage tracking or audit logging for mount-based access
> - Migration path: inventory → create UC objects → update paths → test → decommission
> - Use `dbutils.fs.mounts()` to inventory existing mounts
> - Replace `/mnt/data/` paths with `/Volumes/catalog/schema/volume/` paths
> - Phased rollout: migrate one team or pipeline at a time, run old and new in parallel
>
> ### Example Answer
>
> DBFS mounts were the original way to access cloud storage in Databricks, but they have fundamental security limitations that Unity Catalog addresses.
>
> **Why mounts are a security risk**: When you create a mount with `dbutils.fs.mount()`, every user in the workspace can read every file under that mount. There's no way to restrict access to specific folders — it's all-or-nothing at the workspace level. There's also no audit trail of who read what, and no data lineage tracking.
>
> **Migration plan:**
>
> ```python
> # Step 1: Inventory all existing mounts
> for mount in dbutils.fs.mounts():
>     print(f"Mount: {mount.mountPoint} -> {mount.source}")
> # Output example:
> # Mount: /mnt/raw -> s3://company-data-lake/raw/
> # Mount: /mnt/curated -> s3://company-data-lake/curated/
> ```
>
> **Step 2 — Create UC external locations and volumes:**
>
> ```sql
> -- Map the cloud storage path to a UC-governed external location
> CREATE EXTERNAL LOCATION raw_data_location
> URL 's3://company-data-lake/raw/'
> WITH (STORAGE CREDENTIAL data_lake_cred);
>
> -- Create an external volume for file access
> CREATE EXTERNAL VOLUME prod.bronze.raw_data
> LOCATION 's3://company-data-lake/raw/';
> ```
>
> **Step 3 — Update notebook paths**: Search and replace across notebooks:
>
> ```python
> # Old pattern (DBFS mount)
> df = spark.read.csv("dbfs:/mnt/raw/customers.csv")
>
> # New pattern (UC volume)
> df = spark.read.csv("/Volumes/prod/bronze/raw_data/customers.csv")
> ```
>
> **Step 4 — Phased rollout**: Migrate one pipeline at a time. Run the updated pipeline alongside the old one to validate results match. Once validated, decommission the mount with `dbutils.fs.unmount("/mnt/raw")`.
>
> The key benefit beyond security is that UC volumes provide `GRANT READ VOLUME` / `GRANT WRITE VOLUME` permissions, audit logging, and lineage — capabilities that mounts simply don't have.
>
> ### Follow-up Questions
>
> - What happens to running jobs if you unmount a path that notebooks are actively reading from?
> - Can you use volumes and mounts simultaneously during the migration period?
> - How do you handle notebooks that use `dbfs:/` paths (not `/mnt/`) — does UC affect those too?

---

**[← Previous: Python Code Quality](./09-python-code-quality.md) | [↑ Back to Interview Prep](./README.md) | [Next: Production Operations →](./11-production-operations.md)**

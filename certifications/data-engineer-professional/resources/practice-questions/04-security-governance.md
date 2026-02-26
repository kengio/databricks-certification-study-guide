---
title: "Practice Questions: Security & Governance"
type: practice-questions
tags: [data-engineer-professional, practice-questions, security-governance]
---

# Practice Questions - Section 04: Security & Governance (10%)

## Question 4.1: Unity Catalog Permission Inheritance

**Scenario**: A user is granted SELECT on a schema in Unity Catalog.

**Question** *(Easy)*: What happens to tables created in that schema after the grant?

A) User automatically has SELECT on new tables
B) User must be granted SELECT on each new table
C) User has no access to new tables
D) User has MODIFY access to new tables

> [!success]- Answer
> **Correct Answer: A**
>
> Permissions in Unity Catalog inherit downward. A SELECT grant on a schema applies to all current and future tables in that schema. This simplifies access management compared to table-level grants.

---

## Question 4.2: Row-Level Security

**Scenario**: Different sales teams should only see data for their assigned regions.

**Question** *(Medium)*: Which approach implements row-level security in Unity Catalog?

A) Create separate tables for each region
B) Use dynamic views with `current_user()` function
C) Apply column masking policies
D) Use secret scopes for each region

> [!success]- Answer
> **Correct Answer: B**
>
> Dynamic views using `current_user()` or `is_member()` functions filter rows based on the querying user's identity or group membership. Column masking hides column values. Separate tables don't scale. Secret scopes are for credentials.

---

## Question 4.3: Delta Sharing

**Scenario**: A company needs to share data with an external partner who uses Snowflake.

**Question** *(Easy)*: Which statement about Delta Sharing is correct?

A) The recipient must have a Databricks workspace
B) The recipient can read shared data using any Delta Sharing client
C) Data is physically copied to the recipient's storage
D) Delta Sharing only works within the same cloud provider

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Sharing is an open protocol. Recipients can use any compatible client (Spark, pandas, Power BI, Snowflake, etc.) without needing Databricks. Data is read in place, not copied. It works across cloud providers.

---

## Question 4.4: Secret Management

**Scenario**: A notebook needs to access a database password without exposing it in code.

**Question** *(Easy)*: Which approach correctly retrieves the secret?

A) `dbutils.secrets.get(scope="db-scope", key="password")`
B) `spark.conf.get("db.password")`
C) `dbutils.credentials.get("db-scope", "password")`
D) `os.environ.get("DB_PASSWORD")`

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.secrets.get(scope, key)` retrieves secrets from Databricks secret scopes. The value is automatically redacted in notebook output. The other options either don't exist or expose credentials.

---

## Question 4.5: Managed vs External Tables

**Scenario**: A team needs to register an existing data lake path in Unity Catalog without moving the data.

**Question** *(Easy)*: What type of table should they create?

A) Managed table
B) External table
C) View
D) Materialized view

> [!success]- Answer
> **Correct Answer: B**
>
> External tables point to data at a user-specified location. Managed tables store data in Unity Catalog-managed storage (data would be moved/copied). Views don't store data. Materialized views persist computed results.

---

## Question 4.6: Data Lineage

**Scenario**: An audit team needs to understand how a Gold-layer table is derived from raw data sources, including all intermediate transformations.

**Question** *(Medium)*: How does Unity Catalog capture this lineage information?

A) Lineage is automatically captured from Spark jobs, DLT pipelines, and SQL queries without additional configuration
B) Engineers must manually register lineage by calling `dbutils.lineage.register()` after each transformation
C) Lineage is only available for DLT pipelines, not for general Spark jobs
D) Lineage requires enabling a separate "Lineage Tracking" feature at the metastore level

> [!success]- Answer
> **Correct Answer: A**
>
> Unity Catalog automatically captures column-level and table-level lineage from Spark operations, DLT pipelines, and SQL queries. No manual registration is needed. The lineage is available in the Catalog Explorer UI and via REST API. It works across notebooks, jobs, and DLT pipelines.

---

## Question 4.7: Audit Logging

**Scenario**: A security team needs to investigate who accessed a sensitive table in the last 30 days and what queries they ran.

**Question** *(Medium)*: Which system table provides this information?

A) `system.information_schema.tables` - contains table metadata including last access time
B) `system.billing.usage` - tracks DBU consumption per user and table
C) `system.access.audit` - records all access events including user, action, and resource
D) `system.compute.clusters` - logs cluster activity and associated table access

> [!success]- Answer
> **Correct Answer: C**
>
> `system.access.audit` is the system table that records all access events in Unity Catalog, including who accessed which resources, what actions were performed, and when. Information schema has metadata, not access history. Billing tracks costs. Compute tables track cluster lifecycle.

---

## Question 4.8: Column Masking

**Scenario**: A table contains PII (email, phone number). Analysts need to query the table but should only see masked versions of PII columns unless they are in the `pii_readers` group.

**Question** *(Hard)*: Which Unity Catalog feature implements this requirement?

A) Create a dynamic view that checks `is_member('pii_readers')` and conditionally shows full or masked values
B) Create separate tables with and without PII, granting access to the appropriate one
C) Use `DENY SELECT` on PII columns for non-PII readers
D) Apply column mask functions using `ALTER TABLE ... ALTER COLUMN ... SET MASK`

> [!success]- Answer
> **Correct Answer: D**
>
> Unity Catalog column masking (`SET MASK`) applies a function that controls what value each user sees based on their identity or group membership. This is applied directly to the table, not requiring separate views or tables. `DENY SELECT` on individual columns is not supported in Unity Catalog. Dynamic views work but column masking is the more direct, recommended approach.

---

## Question 4.9: Information Schema

**Scenario**: A data governance team needs to programmatically inventory all tables across all catalogs that a service principal has access to, including their column types and descriptions.

**Question** *(Medium)*: Which query approach provides this information?

A) Query `system.information_schema.columns` which shows metadata for all accessible objects
B) Run `SHOW TABLES IN *` to list all tables across catalogs
C) Use `dbutils.fs.ls()` to scan the metastore storage location
D) Call the Unity Catalog REST API endpoint `/api/2.1/unity-catalog/tables`

> [!success]- Answer
> **Correct Answer: A**
>
> `system.information_schema.columns` provides metadata about all columns in all tables the current user/principal can access. It includes column names, types, descriptions, and table ownership. `SHOW TABLES` works per-schema only. `dbutils.fs.ls()` shows files, not metadata. The REST API works but requires pagination and more code.

---

## Question 4.10: Network Security

**Scenario**: A financial services company requires that all Databricks workspace traffic stays within their private network and never traverses the public internet.

**Question** *(Hard)*: Which network configuration achieves this?

A) Enable IP access lists to restrict source IP addresses
B) Configure VPN peering between the corporate network and Databricks control plane
C) Deploy a workspace with Private Link / Private Endpoints for both front-end and back-end connectivity
D) Use a firewall to block all outbound traffic from the Databricks data plane

> [!success]- Answer
> **Correct Answer: C**
>
> Private Link (AWS) / Private Endpoints (Azure) ensure both the front-end (UI/API) and back-end (data plane to control plane) connections remain on the private network backbone without traversing the public internet. IP access lists restrict who can access but still use public internet. VPN alone doesn't cover all connection paths. Blocking outbound breaks Databricks functionality.

---

## Question 4.11: Data Classification Tags

**Scenario**: An organization needs to tag tables and columns containing sensitive data (PII, financial, health) to enforce governance policies and improve discoverability.

**Question** *(Medium)*: How should data classification be implemented in Unity Catalog?

A) Store classification metadata in a separate governance database and cross-reference during queries
B) Use Unity Catalog tags (`ALTER TABLE ... SET TAGS`) to apply classification labels at table and column level
C) Add `COMMENT` on each column with classification keywords and search comments for enforcement
D) Create a naming convention (e.g., `pii_email`, `sensitive_ssn`) and enforce via CI/CD checks

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog tags provide first-class support for classifying tables and columns. Tags are searchable in Catalog Explorer, can be queried via information schema, and integrate with governance workflows. Comments are free-text and harder to enforce programmatically. Naming conventions are fragile. Separate databases add complexity.

---

## Question 4.12: GDPR Compliance - Right to Erasure

**Scenario**: Under GDPR, a customer requests deletion of all their personal data. The customer's data exists in Bronze, Silver, and Gold Delta tables across the lakehouse.

**Question** *(Hard)*: What is the correct approach to fulfill this deletion request?

A) Run `VACUUM` on all tables to remove files containing the customer's data
B) Use time travel to revert each table to a version before the customer's data was ingested
C) Delete the customer's records only from Gold tables since Bronze/Silver are considered raw storage exempt from GDPR
D) Execute `DELETE FROM` on all tables containing the customer's data, then `VACUUM` to physically remove the old files

> [!success]- Answer
> **Correct Answer: D**
>
> GDPR right to erasure requires physical deletion. First, `DELETE FROM` marks records as removed in Delta's transaction log. Then `VACUUM` removes the old files that still contain the deleted data. All tables (including Bronze/Silver) must be processed - GDPR applies regardless of data tier. Time travel would lose all other changes. VACUUM alone doesn't target specific records.

---

**[← Previous: Practice Questions - Section 03: Data Modeling](./03-data-modeling.md) | [↑ Back to Practice Questions](./README.md) | [Next: Practice Questions - Section 05: Monitoring & Logging](./05-monitoring-logging.md) →**

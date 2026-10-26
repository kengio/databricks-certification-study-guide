---
title: "Practice Questions: Ensuring Data Security and Compliance"
type: practice-questions
tags: [data-engineer-professional, practice-questions, security-compliance]
---

# Section 6: Ensuring Data Security and Compliance (8 %)

Practice questions for Section 6 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 6 folder](../../06-ensuring-data-security-and-compliance/README.md).

---

## Question 1: Row-Level Security

**Question** *(Medium)*: Different sales teams should only see data for their assigned regions. Which approach implements row-level security in Unity Catalog?

A) Create separate tables for each region  
B) Use dynamic views with `current_user()` function  
C) Apply column masking policies  
D) Use secret scopes for each region  

> [!success]- Answer
> **Correct Answer: B**
>
> Dynamic views using `current_user()` or `is_member()` functions filter rows based on the querying user's identity or group membership. Column masking hides column values. Separate tables don't scale. Secret scopes are for credentials.

---

## Question 2: Secret Management

**Question** *(Easy)*: A notebook needs to access a database password without exposing it in code. Which approach correctly retrieves the secret?

A) `dbutils.secrets.get(scope="db-scope", key="password")`  
B) `spark.conf.get("db.password")`  
C) `dbutils.credentials.get("db-scope", "password")`  
D) `os.environ.get("DB_PASSWORD")`  

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.secrets.get(scope, key)` retrieves secrets from Databricks secret scopes. The value is automatically redacted in notebook output. The other options either don't exist or expose credentials.

---

## Question 3: Data Lineage

**Question** *(Medium)*: An audit team needs to understand how a Gold-layer table is derived from raw data sources, including all intermediate transformations. How does Unity Catalog capture this lineage information?

A) Lineage is automatically captured from Spark jobs, Lakeflow pipelines, and SQL queries without additional configuration  
B) Engineers must manually register lineage by calling `dbutils.lineage.register()` after each transformation  
C) Lineage is only available for Lakeflow pipelines, not for general Spark jobs  
D) Lineage requires enabling a separate "Lineage Tracking" feature at the metastore level  

> [!success]- Answer
> **Correct Answer: A**
>
> Unity Catalog automatically captures column-level and table-level lineage from Spark operations, Lakeflow pipelines, and SQL queries. No manual registration is needed. The lineage is available in the Catalog Explorer UI and via REST API. It works across notebooks, jobs, and Lakeflow pipelines.

---

## Question 4: Audit Logging

**Question** *(Medium)*: A security team needs to investigate who accessed a sensitive table in the last 30 days and what queries they ran. Which system table provides this information?

A) `system.information_schema.tables` - contains table metadata including last access time  
B) `system.billing.usage` - tracks DBU consumption per user and table  
C) `system.access.audit` - records all access events including user, action, and resource  
D) `system.compute.clusters` - logs cluster activity and associated table access  

> [!success]- Answer
> **Correct Answer: C**
>
> `system.access.audit` is the system table that records all access events in Unity Catalog, including who accessed which resources, what actions were performed, and when. Information schema has metadata, not access history. Billing tracks costs. Compute tables track cluster lifecycle.

---

## Question 5: Column Masking

**Question** *(Hard)*: A table contains PII (email, phone number). Analysts need to query the table but should only see masked versions of PII columns unless they are in the `pii_readers` group. Which Unity Catalog feature implements this requirement?

A) Create a dynamic view that checks `is_member('pii_readers')` and conditionally shows full or masked values  
B) Create separate tables with and without PII, granting access to the appropriate one  
C) Use `DENY SELECT` on PII columns for non-PII readers  
D) Apply column mask functions using `ALTER TABLE ... ALTER COLUMN ... SET MASK`  

> [!success]- Answer
> **Correct Answer: D**
>
> Unity Catalog column masking (`SET MASK`) applies a function that controls what value each user sees based on their identity or group membership. This is applied directly to the table, not requiring separate views or tables. `DENY SELECT` on individual columns is not supported in Unity Catalog. Dynamic views work but column masking is the more direct, recommended approach.

---

## Question 6: Network Security

**Question** *(Hard)*: A financial services company requires that all Databricks workspace traffic stays within their private network and never traverses the public internet. Which network configuration achieves this?

A) Enable IP access lists to restrict source IP addresses  
B) Configure VPN peering between the corporate network and Databricks control plane  
C) Deploy a workspace with Private Link / Private Endpoints for both front-end and back-end connectivity  
D) Use a firewall to block all outbound traffic from the Databricks data plane  

> [!success]- Answer
> **Correct Answer: C**
>
> Private Link (AWS) / Private Endpoints (Azure) ensure both the front-end (UI/API) and back-end (data plane to control plane) connections remain on the private network backbone without traversing the public internet. IP access lists restrict who can access but still use public internet. VPN alone doesn't cover all connection paths. Blocking outbound breaks Databricks functionality.

---

## Question 7: GDPR Compliance - Right to Erasure

**Question** *(Hard)*: Under GDPR, a customer requests deletion of all their personal data. The customer's data exists in Bronze, Silver, and Gold Delta tables across the lakehouse. What is the correct approach to fulfill this deletion request?

A) Run `VACUUM` on all tables to remove files containing the customer's data  
B) Use time travel to revert each table to a version before the customer's data was ingested  
C) Delete the customer's records only from Gold tables since Bronze/Silver are considered raw storage exempt from GDPR  
D) Execute `DELETE FROM` on all tables containing the customer's data, then `VACUUM` to physically remove the old files  

> [!success]- Answer
> **Correct Answer: D**
>
> GDPR right to erasure requires physical deletion. First, `DELETE FROM` marks records as removed in Delta's transaction log. Then `VACUUM` removes the old files that still contain the deleted data. All tables (including Bronze/Silver) must be processed - GDPR applies regardless of data tier. Time travel would lose all other changes. VACUUM alone doesn't target specific records.

---

## Question 8: Least-Privilege Job Operators *(2026 blueprint)*

**Question** *(Medium)*: An on-call support group must be able to trigger, cancel, and repair runs of a production Lakeflow job and read its run logs, but must not be able to edit the job's tasks or change its permissions. Which job permission level should the group receive?

A) CAN VIEW  
B) CAN MANAGE  
C) CAN MANAGE RUN  
D) IS OWNER  

> [!success]- Answer
> **Correct Answer: C**
>
> CAN MANAGE RUN is the least-privilege level that allows running, cancelling, and viewing run logs without editing the job.
>
> CAN MANAGE RUN allows Run now, Run now with different parameters, cancel, and viewing Spark UI and logs, but not editing job settings, deleting, or modifying permissions. CAN VIEW only shows job details and results. CAN MANAGE and IS OWNER both add editing, deleting, and permission changes, which violates least privilege, and a group cannot be IS OWNER of a job.

---

## Question 9: Data Grants vs Workspace ACLs *(2026 blueprint)*

**Question** *(Medium)*: Analysts must run ad hoc queries on the `prod.gold` schema through a shared SQL warehouse, with no ability to change the warehouse or modify data. Which combination follows least privilege?

A) CAN MANAGE on the warehouse and `ALL PRIVILEGES` on `prod.gold`  
B) CAN USE on the warehouse, plus `USE CATALOG` on `prod` and `USE SCHEMA`, `SELECT` on `prod.gold`  
C) CAN USE on the warehouse and `SELECT` on `prod.gold` only  
D) IS OWNER on the warehouse and `MODIFY` on `prod.gold`  

> [!success]- Answer
> **Correct Answer: B**
>
> CAN USE on the warehouse plus `USE CATALOG`, `USE SCHEMA`, and `SELECT` is the minimal combination.
>
> Workspace ACLs control the warehouse (CAN USE lets users start it and run queries) while Unity Catalog grants control data; reading a table requires the usage privileges on the parent catalog and schema plus `SELECT`. Option C fails because `SELECT` without `USE CATALOG` causes permission denied. Options A and D grant editing rights on the warehouse and write access to data.

---

## Question 10: Choosing ABAC for Future Tables *(2026 blueprint)*

**Question** *(Medium)*: A governance team must mask every column tagged `pii : ssn` in all current and future tables of the `hr` catalog, and table owners must not be able to remove the masking. What should they implement?

A) A column mask policy created with `CREATE POLICY ... ON CATALOG hr COLUMN MASK ... MATCH COLUMNS has_tag_value('pii', 'ssn')`  
B) `ALTER TABLE ... ALTER COLUMN ssn SET MASK` on every existing table  
C) A dynamic view per table that hashes the SSN column  
D) A row filter function attached to each schema in the catalog  

> [!success]- Answer
> **Correct Answer: A**
>
> An ABAC column mask policy at the catalog level, matching the governed tag, covers current and future tables centrally.
>
> ABAC policies are evaluated dynamically for every table in scope whose columns carry the matching governed tag, and table owners cannot modify or bypass a policy set at a higher level. Per-table `SET MASK` does not cover future tables and table owners can remove it. Dynamic views require new objects and users could still query base tables if granted. A row filter hides rows, not column values.

---

## Question 11: ABAC Permissions and Tag Scope *(2026 blueprint)*

**Question** *(Hard)*: A schema-level ABAC column mask policy uses `MATCH COLUMNS has_tag('pii') AS c ON COLUMN c`. A steward tags the table `customers` with `pii` but not its columns, and queries still return unmasked values. What is the cause?

A) The policy creator lacks `SELECT` on the table  
B) Column conditions in `MATCH COLUMNS` match only tags set directly on columns; table tags do not propagate to columns  
C) ABAC policies only apply to tables created after the policy  
D) The `pii` tag must be ungoverned for ABAC to use it  

> [!success]- Answer
> **Correct Answer: B**
>
> `MATCH COLUMNS` checks column-level tags only, so the column itself must be tagged.
>
> `has_tag()` in `WHEN` considers table tags and tags inherited from the schema or catalog, but in `MATCH COLUMNS` it checks tags applied directly on the column; tags never inherit to columns. Policies apply to existing and future tables, and ABAC works only with governed tags. Creating a policy requires `MANAGE` on the scope and `EXECUTE` on the UDF, not `SELECT`.

---

## Question 12: Pseudonymization for Joins *(2026 blueprint)*

**Question** *(Medium)*: Analysts need to join orders, support tickets, and web events by customer without ever seeing customer email addresses, and the same customer must map to the same value in every table. Which technique fits best?

A) Suppression: replace email with `NULL` in all tables  
B) Generalization: keep only the email domain  
C) Pseudonymization: store `sha2(concat(<secret salt>, lower(email)), 256)` as the join key  
D) Random tokens generated with `uuid()` independently in each table  

> [!success]- Answer
> **Correct Answer: C**
>
> A salted deterministic hash pseudonymizes the email while keeping it joinable across tables.
>
> `sha2` produces the same output for the same input, so the hashed key joins across tables, and the secret salt prevents dictionary reversal of low-entropy values. Suppression and generalization remove the ability to join individual customers. Independent `uuid()` values differ per table unless managed through a single token vault.

---

## Question 13: Anonymization vs Pseudonymization *(2026 blueprint)*

**Question** *(Easy)*: Which transformation is an anonymization technique rather than a pseudonymization technique?

A) Replacing exact ages with ten-year age bands and ZIP codes with their first three digits  
B) Replacing emails with tokens stored in a restricted lookup table  
C) Encrypting SSNs with `aes_encrypt` using a key from a secret scope  
D) Hashing customer IDs with a salted `sha2`  

> [!success]- Answer
> **Correct Answer: A**
>
> Generalization (age bands, truncated ZIP codes) coarsens data irreversibly, which is anonymization.
>
> Tokenization, encryption, and salted hashing keep records linkable and can be reversed or re-linked with additional information (vault, key, or salt), so they are pseudonymization techniques.

---

## Question 14: Automated PII Detection and Masking *(2026 blueprint)*

**Question** *(Medium)*: New source feeds land in a catalog every week through batch jobs and Lakeflow streaming tables. The company wants sensitive columns detected and masked automatically without engineers tagging each new column. Which approach uses Unity Catalog features to achieve this?

A) Ask engineers to add AI-generated comments to every new table and mask columns whose comment mentions PII  
B) Enable Data Classification with auto-tagging on the catalog and create an ABAC column mask policy on the catalog that matches the `class.*` tags  
C) Write a regex UDF in each pipeline and apply it before writing every table  
D) Create a dynamic view over each new table after it is published  

> [!success]- Answer
> **Correct Answer: B**
>
> Data Classification auto-tags detected PII columns with `class.*` system tags, and a catalog-level ABAC policy masks them for all table types.
>
> Data Classification incrementally scans tables, streaming tables, and materialized views, and ABAC policies apply to all tables in scope, so new feeds are covered automatically for batch and streaming consumers. Databricks states AI-generated comments should not be relied on to detect PII. Per-pipeline regex and dynamic views require manual work for each new table.

---

## Question 15: Pipeline Identity and Masked Refreshes *(2026 blueprint)*

**Question** *(Hard)*: After a catalog-level ABAC column mask policy `TO account users` is created, a Lakeflow pipeline refreshes a gold materialized view from masked silver tables, and every user, including privacy officers, now sees masked values in the materialized view. What is the correct fix?

A) Grant `SELECT` on the materialized view to the privacy officers  
B) Add the pipeline owner or run-as service principal to the policy's `EXCEPT` clause and fully refresh the materialized view  
C) Disable deletion vectors on the materialized view  
D) Move the policy from the catalog to each table  

> [!success]- Answer
> **Correct Answer: B**
>
> The pipeline identity must be exempt so the refresh reads unmasked source data.
>
> Pipelines evaluate policies with the pipeline owner or run-as identity during refresh, so a masked identity permanently stores masked data in the materialized view; exempting it via `EXCEPT` and refreshing fixes the stored data while consumers remain covered by policies. Extra grants do not unmask stored values, deletion vectors are unrelated, and table-level policies would reproduce the same problem.

---

## Question 16: Erasure with Deletion Vectors *(2026 blueprint)*

**Question** *(Medium)*: A table has deletion vectors enabled. To satisfy a right-to-erasure request, an engineer runs `DELETE FROM users WHERE user_id = 42`. Which additional steps physically remove the user's data from storage?

A) `OPTIMIZE users` immediately, which guarantees removal  
B) `REORG TABLE users APPLY (PURGE)`, then `VACUUM users` after the old files exceed the retention threshold  
C) `VACUUM users` immediately; deletion vectors are removed by `VACUUM`  
D) `RESTORE TABLE users` to the version before the delete  

> [!success]- Answer
> **Correct Answer: B**
>
> `REORG TABLE ... APPLY (PURGE)` rewrites files containing soft-deleted rows, and `VACUUM` later deletes the old files.
>
> With deletion vectors, `DELETE` only marks rows as removed; `APPLY (PURGE)` rewrites the affected files, but older files remain for time travel until `VACUUM` removes them after they expire under `delta.deletedFileRetentionDuration`. `OPTIMIZE` compaction gives no strict guarantee of applying deletion vectors, `VACUUM` alone does not rewrite current files, and `RESTORE` brings the data back.

---

## Question 17: Retention on Databricks Runtime 18 *(2026 blueprint)*

**Question** *(Hard)*: On Databricks Runtime 18.0, an engineer runs `VACUUM events RETAIN 72 HOURS` to shorten the purge window for a compliance requirement, but files older than 72 hours are not removed. What should they do?

A) Run `VACUUM events RETAIN 72 HOURS DRY RUN` first  
B) Set `delta.deletedFileRetentionDuration` on the table to the required interval and run `VACUUM`  
C) Increase `delta.logRetentionDuration` to 365 days  
D) Disable predictive optimization  

> [!success]- Answer
> **Correct Answer: B**
>
> In Databricks Runtime 18.0+, retention is controlled by the `delta.deletedFileRetentionDuration` table property.
>
> The Runtime 18.0 release notes state that `VACUUM` ignores the retention argument except for `0 HOURS`, and that `deletedFileRetentionDuration` and `logRetentionDuration` must be consistent. `DRY RUN` only lists files, increasing log retention lengthens history, and disabling predictive optimization stops automatic `VACUUM` instead of purging sooner.

---

**[← Previous: Cost & Performance Optimization](./05-cost-performance.md) | [↑ Back to Practice Questions](./README.md) | [Next: Data Governance →](./07-data-governance.md)**

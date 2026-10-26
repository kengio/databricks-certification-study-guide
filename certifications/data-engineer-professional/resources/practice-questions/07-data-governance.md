---
title: "Practice Questions: Data Governance"
type: practice-questions
tags: [data-engineer-professional, practice-questions, data-governance]
---

# Section 7: Data Governance (5 %)

Practice questions for Section 7 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 7 folder](../../07-data-governance/README.md).

---

## Question 1: Unity Catalog Volumes vs DBFS

**Question** *(Easy)*: A team needs to store raw data files that will be governed by Unity Catalog. Which storage option should they use?

A) DBFS root storage  
B) Mounted cloud storage  
C) Unity Catalog Volume  
D) Workspace files  

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog Volumes provide governed file storage with access controls, auditing, and lineage. DBFS and mounts are legacy approaches without UC governance. Workspace files are for notebooks and small files, not data.

---

## Question 2: Unity Catalog Permission Inheritance

**Question** *(Easy)*: A user is granted SELECT on a schema in Unity Catalog. What happens to tables created in that schema after the grant?

A) User automatically has SELECT on new tables  
B) User must be granted SELECT on each new table  
C) User has no access to new tables  
D) User has MODIFY access to new tables  

> [!success]- Answer
> **Correct Answer: A**
>
> Permissions in Unity Catalog inherit downward. A SELECT grant on a schema applies to all current and future tables in that schema. This simplifies access management compared to table-level grants.

---

## Question 3: Managed vs External Tables

**Question** *(Easy)*: A team needs to register an existing data lake path in Unity Catalog without moving the data. What type of table should they create?

A) Managed table  
B) External table  
C) View  
D) Materialized view  

> [!success]- Answer
> **Correct Answer: B**
>
> External tables point to data at a user-specified location. Managed tables store data in Unity Catalog-managed storage (data would be moved/copied). Views don't store data. Materialized views persist computed results.

---

## Question 4: Information Schema

**Question** *(Medium)*: A data governance team needs to programmatically inventory all tables across all catalogs that a service principal has access to, including their column types and descriptions. Which query approach provides this information?

A) Query `system.information_schema.columns` which shows metadata for all accessible objects  
B) Run `SHOW TABLES IN *` to list all tables across catalogs  
C) Use `dbutils.fs.ls()` to scan the metastore storage location  
D) Call the Unity Catalog REST API endpoint `/api/2.1/unity-catalog/tables`  

> [!success]- Answer
> **Correct Answer: A**
>
> `system.information_schema.columns` provides metadata about all columns in all tables the current user/principal can access. It includes column names, types, descriptions, and table ownership. `SHOW TABLES` works per-schema only. `dbutils.fs.ls()` shows files, not metadata. The REST API works but requires pagination and more code.

---

## Question 5: Data Classification Tags

**Question** *(Medium)*: An organization needs to tag tables and columns containing sensitive data (PII, financial, health) to enforce governance policies and improve discoverability. How should data classification be implemented in Unity Catalog?

A) Store classification metadata in a separate governance database and cross-reference during queries  
B) Use Unity Catalog tags (`ALTER TABLE ... SET TAGS`) to apply classification labels at table and column level  
C) Add `COMMENT` on each column with classification keywords and search comments for enforcement  
D) Create a naming convention (e.g., `pii_email`, `sensitive_ssn`) and enforce via CI/CD checks  

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog tags provide first-class support for classifying tables and columns. Tags are searchable in Catalog Explorer, can be queried via information schema, and integrate with governance workflows. Comments are free-text and harder to enforce programmatically. Naming conventions are fragile. Separate databases add complexity.

---

## Question 6: Tags vs Comments *(2026 blueprint)*

**Question** *(Easy)*: A data steward wants analysts to find all tables belonging to the finance team through workspace search filters and also give each table a human-readable description. Which combination is appropriate?

A) Comments for both purposes  
B) A tag such as `team = finance` for filtering, and `COMMENT ON TABLE` for the description  
C) Table properties set with `TBLPROPERTIES` for both purposes  
D) A row filter that returns only finance rows  

> [!success]- Answer
> **Correct Answer: B**
>
> Tags are key-value attributes suited to filtering and searching, while comments hold free-text descriptions.
>
> Workspace search supports `tag:<key>:<value>` and tag filters, and also indexes table and column comments. Comments alone do not give structured filtering, table properties are not the discovery mechanism, and row filters restrict data access rather than add metadata.

---

## Question 7: Discoverability Without Data Access *(2026 blueprint)*

**Question** *(Medium)*: All employees should be able to see that tables in the `sales` catalog exist, including their names, comments, and tags, and request access, without being able to read any data. Which grant achieves this?

A) `GRANT USE CATALOG ON CATALOG sales` to the account users group  
B) `GRANT SELECT ON CATALOG sales` to the account users group  
C) `GRANT BROWSE ON CATALOG sales` to the account users group  
D) `GRANT APPLY TAG ON CATALOG sales` to the account users group  

> [!success]- Answer
> **Correct Answer: C**
>
> `BROWSE` exposes object metadata and access requests without data access.
>
> `BROWSE` is granted at the catalog level and lets users discover objects and view names, descriptions, and tags without `USE CATALOG`, `USE SCHEMA`, or `SELECT`. `SELECT` grants data access, `USE CATALOG` alone is only a prerequisite, and `APPLY TAG` lets users change tags.

---

## Question 8: Inheritance to New Tables *(2026 blueprint)*

**Question** *(Easy)*: An administrator grants `USE CATALOG, USE SCHEMA, SELECT` on catalog `sales` to the `finance_team` group. A week later, a new schema `sales.forecast` and a table `sales.forecast.q4` are created. Assuming no other grants, what can `finance_team` do with `sales.forecast.q4`?

A) Nothing until `SELECT` is granted on the new table  
B) Query it, because privileges granted on a catalog are inherited by current and future schemas and tables  
C) Query it only if they also own the new schema  
D) Modify and drop it, because catalog grants imply ownership  

> [!success]- Answer
> **Correct Answer: B**
>
> Catalog-level privileges inherit downward to all current and future child objects.
>
> Because `USE CATALOG`, `USE SCHEMA`, and `SELECT` were granted on the catalog, they apply to every schema and table in it, including ones created later. No per-table grant is needed, ownership is unrelated to inherited privileges, and `SELECT` does not include `MODIFY` or drop rights.

---

## Question 9: Ownership vs MANAGE *(2026 blueprint)*

**Question** *(Medium)*: A platform team wants a governance group to grant and revoke privileges on every table in `prod.gold`, including future tables, without making the group the owner and without giving it automatic read access to the data. What should they grant?

A) `ALL PRIVILEGES ON SCHEMA prod.gold`  
B) `SELECT ON SCHEMA prod.gold WITH GRANT OPTION`  
C) `MANAGE ON SCHEMA prod.gold`  
D) Ownership of every table in `prod.gold`  

> [!success]- Answer
> **Correct Answer: C**
>
> `MANAGE` on the schema delegates grant management for the schema and all its current and future objects.
>
> `MANAGE` allows managing privileges, transferring ownership, and dropping objects without ownership and is inherited by child objects, but does not itself include data privileges. `ALL PRIVILEGES` grants data access and excludes `MANAGE`, Unity Catalog has no `WITH GRANT OPTION`, and transferring ownership of each table is not what was asked.

---

**[← Previous: Ensuring Data Security and Compliance](./06-security-compliance.md) | [↑ Back to Practice Questions](./README.md) | [Next: Debugging and Deploying →](./08-debugging-deploying.md)**

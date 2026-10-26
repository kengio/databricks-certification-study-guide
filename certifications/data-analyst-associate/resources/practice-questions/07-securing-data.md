---
title: Securing Data Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, securing-data, unity-catalog, privileges, row-filters, column-masks]
---

# Securing Data Practice Questions

**Exam Weight: 8 %** — Section 9 of the October 2025 exam guide

Questions marked *(2025 blueprint)* target skills added in the October 2025 exam guide. All questions were checked against the Databricks documentation on October 26, 2026.

[← Previous: Managing Data](./06-managing-data.md) | [↑ Back to Practice Questions](./README.md) | [Next: Importing Data](./08-importing-data.md)

---

## Question 1: Three-Level Namespace *(Easy)*

Which name correctly refers to a table in Unity Catalog?

A) `schema.table`  
B) `catalog.schema.table`  
C) `workspace.catalog.table`  
D) `database.table`  

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog uses a three-level namespace: `catalog.schema.object`, where the object can be a table, view, volume, function, or model. The two-level `schema.table` form comes from the legacy Hive metastore.

---

## Question 2: Granting Read Access *(Easy)*

Which statement gives the `finance_analysts` group read access to a Unity Catalog table?

A) `GRANT READ ON TABLE main.finance.transactions TO finance_analysts`  
B) `GRANT ACCESS ON TABLE main.finance.transactions TO finance_analysts`  
C) `GRANT VIEW ON TABLE main.finance.transactions TO finance_analysts`  
D) `GRANT SELECT ON TABLE main.finance.transactions TO finance_analysts`  

> [!success]- Answer
> **Correct Answer: D**
>
> `SELECT` is the Unity Catalog privilege for reading a table or view. The group also needs `USE CATALOG` on `main` and `USE SCHEMA` on `main.finance`.
>
> `READ`, `ACCESS`, and `VIEW` are not table privileges. Principal names that contain special characters, such as `@` or `-`, must be quoted with backticks.

---

## Question 3: Removing Access *(Easy)*

An analyst's access to `finance.transactions` must be removed. Which statement is correct?

A) `DELETE GRANT SELECT ON TABLE finance.transactions FROM contractors`  
B) `REVOKE SELECT ON TABLE finance.transactions FROM contractors`  
C) `DROP GRANT SELECT ON TABLE finance.transactions FROM contractors`  
D) `DENY SELECT ON TABLE finance.transactions TO contractors`  

> [!success]- Answer
> **Correct Answer: B**
>
> `REVOKE` removes a privilege that was granted. If the privilege was granted on the parent schema or catalog, revoke it there, because it is inherited.
>
> `DENY` applies only to the legacy `hive_metastore` catalog and is not supported by Unity Catalog (D).

---

## Question 4: Default Catalog and Schema *(Medium)*

An analyst runs `USE CATALOG analytics; USE SCHEMA reporting;`. Which table does `SELECT * FROM revenue` read?

A) `main.default.revenue`  
B) `analytics.default.revenue`  
C) `default.reporting.revenue`  
D) `analytics.reporting.revenue`  

> [!success]- Answer
> **Correct Answer: D**
>
> `USE CATALOG` sets the current catalog and `USE SCHEMA` sets the current schema, so unqualified names resolve to `analytics.reporting.revenue`.

---

## Question 5: One Table, Different Rows per User *(Hard)*

A sales table must show each sales rep only their own region's rows, in every tool and dashboard, without separate tables or views. Which feature does this?

A) A dashboard filter that each user sets  
B) A `WHERE` clause written for each user in each query  
C) A Unity Catalog row filter on the table  
D) A separate dashboard per region  

> [!success]- Answer
> **Correct Answer: C**
>
> A row filter is a SQL UDF attached with `ALTER TABLE ... SET ROW FILTER`. Rows where it returns FALSE are excluded at query time, for every query on the table.
>
> Dashboard filters can be changed by viewers, so they are not security (A). For the same rule across many tables, Databricks recommends ABAC policies based on governed tags.

---

## Question 6: Privileges Needed to Query *(Easy)* *(2025 blueprint)*

A group has `SELECT` on `main.sales.orders` but still gets a permission error. Which privileges are most likely missing?

A) `USE CATALOG` on `main` and `USE SCHEMA` on `main.sales`  
B) `MODIFY` on the table  
C) `CREATE TABLE` on the schema  
D) `ALL PRIVILEGES` on the metastore  

> [!success]- Answer
> **Correct Answer: A**
>
> Reading a table requires `SELECT` on the table plus `USE CATALOG` and `USE SCHEMA` on its parents.
>
> `MODIFY` is for inserting, updating, and deleting (B). `CREATE TABLE` is for creating tables (C).

---

## Question 7: Granting at the Schema Level *(Medium)* *(2025 blueprint)*

A steward runs `GRANT SELECT ON SCHEMA main.gold TO bi_readers`. Next week, a new table is created in `main.gold`. Can `bi_readers` read it?

A) No, each new table needs its own grant  
B) Only if the new table is external  
C) Only after the metastore admin approves it  
D) Yes, because privileges granted on a schema apply to all current and future tables and views in it  

> [!success]- Answer
> **Correct Answer: D**
>
> Unity Catalog privileges are inherited. A privilege granted on a catalog or schema applies to the matching child objects, including objects created later.
>
> The group still needs `USE CATALOG` on `main` and `USE SCHEMA` on `main.gold`.

---

## Question 8: Ownership When Someone Leaves *(Medium)* *(2025 blueprint)*

An analyst who owns several production tables is leaving the company. What should be done with ownership?

A) Transfer ownership to a group, for example with `ALTER TABLE ... OWNER TO data_owners`  
B) Nothing, because owners have no special rights  
C) Drop and recreate the tables  
D) Grant `SELECT` to everyone  

> [!success]- Answer
> **Correct Answer: A**
>
> Every securable object has an owner, and the owner has all privileges on it, including granting privileges to others. Transferring ownership to a group means no single person controls the asset. You can transfer ownership with `ALTER <securable> ... OWNER TO <principal>` or with the **Owner** field in Catalog Explorer.
>
> The current owner, a metastore admin, the owner of the parent container, or a user with `MANAGE` can transfer ownership.

---

## Question 9: The MANAGE Privilege *(Medium)* *(2025 blueprint)*

A team lead must manage who can access a table without becoming its owner. Which privilege allows this?

A) `SELECT`  
B) `MODIFY`  
C) `MANAGE`  
D) `BROWSE`  

> [!success]- Answer
> **Correct Answer: C**
>
> `MANAGE` lets a user manage privileges on an object, transfer its ownership, and delete it without being the owner.
>
> `ALL PRIVILEGES` does not include `MANAGE`. `BROWSE` lets users discover objects and view their metadata without reading data (D).

---

## Question 10: Masking a PII Column *(Medium)* *(2025 blueprint)*

HR wants everyone except the `hr_admins` group to see `ssn` as `***-**-****`, in every query on the `employees` table. Which approach fits?

A) Hide the column in a dashboard  
B) Remove `SELECT` from everyone  
C) Store the column in a separate external table  
D) Create a SQL UDF that returns the real value only for `hr_admins` members, and attach it with `ALTER TABLE employees ALTER COLUMN ssn SET MASK mask_ssn`  

> [!success]- Answer
> **Correct Answer: D**
>
> A column mask is a SQL UDF that returns either the original value or a masked value at query time. Each column can have one mask.
>
> Hiding a column in one tool does not protect it in other tools (A). Removing `SELECT` blocks the whole table (B).

---

## Question 11: Volume Paths *(Easy)* *(2025 blueprint)*

Raw CSV files are stored in a Unity Catalog volume named `landing` in `main.raw`. Which path refers to a file in it?

A) `/mnt/main/raw/landing/orders.csv`  
B) `main.raw.landing.orders.csv`  
C) `s3://Volumes/main/raw/landing/orders.csv`  
D) `/Volumes/main/raw/landing/orders.csv`  

> [!success]- Answer
> **Correct Answer: D**
>
> Volumes sit at the third level of the namespace (`catalog.schema.volume`), and their files use the path `/Volumes/<catalog>/<schema>/<volume>/<path>`.
>
> Reading files requires `READ VOLUME` and writing requires `WRITE VOLUME`, plus `USE CATALOG` and `USE SCHEMA`.

---

## Question 12: Sharing a Saved Query Safely *(Medium)* *(2025 blueprint)*

An analyst shares a saved query in a shared folder. Colleagues should be able to run it but not change it. Which permission should they get?

A) CAN RUN  
B) CAN MANAGE  
C) CAN EDIT  
D) IS OWNER  

> [!success]- Answer
> **Correct Answer: A**
>
> Workspace objects such as queries, dashboards, notebooks, and folders are secured with access control lists. For queries, the levels are CAN VIEW, CAN RUN, CAN EDIT, and CAN MANAGE. Objects in a folder inherit the folder's permissions.
>
> Workspace object permissions do not replace Unity Catalog privileges. Running the query still requires access to the tables it reads.

---

## Question 13: Optional Admin Role *(Medium)* *(2025 blueprint)*

Which Unity Catalog admin role is optional?

A) Account admin  
B) Workspace admin  
C) Metastore admin  
D) None, all three are required  

> [!success]- Answer
> **Correct Answer: C**
>
> Account admins and workspace admins are required for every deployment. The metastore admin role is optional, but you need one for some tasks, such as changing the ownership of objects you don't own.
>
> Databricks recommends assigning the metastore admin role to a group rather than to a single user.

---

## Question 14: Group Checks in a Dynamic View *(Hard)* *(2025 blueprint)*

A dynamic view over Unity Catalog data should show salaries only to members of the account-level group `auditors`. Which function should the view use?

A) `is_account_group_member('auditors')`  
B) `is_member('auditors')`  
C) `current_database() = 'auditors'`  
D) `has_role('auditors')`  

> [!success]- Answer
> **Correct Answer: A**
>
> `is_account_group_member()` checks account-level group membership and is recommended for dynamic views over Unity Catalog data.
>
> `is_member()` checks workspace-level groups only and exists for Hive metastore compatibility, so Databricks advises against it for Unity Catalog (B). Also, do not grant users access to the tables the view reads, or they can bypass it.

---

**[← Previous: Managing Data Practice Questions](./06-managing-data.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Importing Data Practice Questions →](./08-importing-data.md)**

---
title: "Practice Questions: Governance and Security"
type: practice-questions
tags: [data-engineer-associate, practice-questions, governance-and-security]
---

# Domain 7: Governance and Security

Exam weight: **15 %** (August 2026 exam guide). Questions marked *(2026 blueprint)* target skills added or reworded in the 2026 guide. Each question cites the Databricks documentation that supports its answer, where one exists.

## Question 1: External Table Data Retention After DROP

**Question** *(Medium)*: A data engineer drops `my_table` with `DROP TABLE IF EXISTS my_table`. The object no longer appears in `SHOW TABLES`, but the data files still exist on the filesystem. What explains this?

A) The DROP command failed silently due to insufficient permissions
B) The table had active streaming readers that prevented file deletion
C) The table was an external table
D) The VACUUM command needs to be run separately to remove data files

> [!success]- Answer
> **Correct Answer: C**
>
> The table was an external table.
>
> When an external table is dropped, Databricks removes only the metadata entry from the metastore. The underlying data files are stored at a user-defined location and are not managed by Databricks, so they remain intact after the table is dropped.

---

## Question 2: Default Schema Location in the Legacy Hive Metastore

**Question** *(Easy)*: In a workspace still using the legacy `hive_metastore` catalog, a data engineer has established a new database with this command:

```sql
CREATE DATABASE IF NOT EXISTS customer360;
```

Where will the `customer360` database be situated?

A) `dbfs:/user/hive/warehouse/customer360.db`
B) `dbfs:/user/hive/warehouse/`
C) `dbfs:/databricks/databases/customer360/`
D) `dbfs:/mnt/default/customer360.db`

> [!success]- Answer
> **Correct Answer: A**
>
> `dbfs:/user/hive/warehouse/customer360.db`
>
> When a database is created without specifying a `LOCATION`, Databricks stores it in the default Hive warehouse directory at `dbfs:/user/hive/warehouse/`. A subdirectory named `<database_name>.db` is automatically created for it. Specifying only `dbfs:/user/hive/warehouse` (without the `.db` suffix) is incorrect — that is the parent warehouse directory, not the database's own location.

---

## Question 3: DESCRIBE DATABASE Location

**Question** *(Easy)*: Which command retrieves the location of the `customer360` database?

A) `SHOW DATABASE LOCATION customer360;`
B) `SELECT location FROM information_schema.databases WHERE name = 'customer360';`
C) `DESCRIBE DATABASE customer360;`
D) `LIST DATABASE customer360;`

> [!success]- Answer
> **Correct Answer: C**
>
> `DESCRIBE DATABASE customer360;`
>
> This command returns database metadata including the storage location path, owner, comment, and custom properties. It is the standard way to inspect database-level information in Spark SQL and Databricks.

---

## Question 4: Managed Table File Deletion After DROP

**Question** *(Medium)*: A data engineer drops `my_table` and observes that both data files and metadata files are deleted from the filesystem. What explains the complete deletion?

A) The VACUUM command was automatically triggered after the DROP
B) The table was stored in a temporary storage location
C) The table was a managed table
D) The table had a retention policy set to zero days

> [!success]- Answer
> **Correct Answer: C**
>
> The table was a managed table.
>
> When a managed (internal) table is dropped, Databricks deletes both the metastore entry and the underlying data files, because Databricks controls the full lifecycle of managed table data. This is the opposite behavior from external tables. In Unity Catalog, a dropped managed table can be recovered with `UNDROP TABLE` for 7 days by default, and the data files are deleted after that recovery period.

---

## Question 5: Table Ownership Transfer

**Question** *(Medium)*: A data engineer has left the organization and no longer has access. The team must transfer ownership of the engineer's Unity Catalog tables to the new lead data engineer. Who can perform this transfer?

A) Any user with SELECT privilege on the tables
B) A metastore admin, or the owner of the tables' parent schema (or a user with MANAGE on the tables)
C) The new lead data engineer, by running `ALTER TABLE ... OWNER TO` on their own
D) Any member of the data team with MODIFY privilege

> [!success]- Answer
> **Correct Answer: B**
>
> A metastore admin, or the owner of the tables' parent schema (or a user with MANAGE on the tables).
>
> In Unity Catalog, ownership can be transferred by the current owner, a metastore admin, the owner of the container (the schema for a table), or a user with the `MANAGE` privilege on the object. `SELECT` and `MODIFY` don't allow it. Use `ALTER TABLE ... OWNER TO <principal>` or the Owner field in Catalog Explorer ([Manage privileges](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/)).

---

## Question 6: GRANT ALL PRIVILEGES on a Database

**Question** *(Easy)*: A new data engineering team needs full privileges on the `customers` database to manage the project effectively. Which command grants all permissions?

A) `GRANT FULL ACCESS ON DATABASE customers TO team;`
B) `GRANT ALL PRIVILEGES ON DATABASE customers TO team;`
C) `GRANT READ, WRITE, ADMIN ON DATABASE customers TO team;`
D) `GRANT MANAGE ON DATABASE customers TO team;`

> [!success]- Answer
> **Correct Answer: B**
>
> `GRANT ALL PRIVILEGES ON DATABASE customers TO team;`
>
> `DATABASE` is a synonym for `SCHEMA`. `ALL PRIVILEGES` grants every applicable privilege on the schema and its objects. In Unity Catalog it does **not** include `MANAGE` (or `EXTERNAL USE SCHEMA` / `EXTERNAL USE LOCATION` / `READ METADATA`), so it isn't the same as ownership.

---

## Question 7: Discovering Tables Without Reading Data

**Question** *(Medium)*: A newly formed data engineering team needs to discover which tables exist in the Unity Catalog catalog `customers` and view their metadata, without being able to read any data yet. Which grant fits best?

A) `GRANT SELECT ON CATALOG customers TO team;`
B) `GRANT ALL PRIVILEGES ON CATALOG customers TO team;`
C) `GRANT USAGE ON DATABASE customers TO team;`
D) `GRANT BROWSE ON CATALOG customers TO team;`

> [!success]- Answer
> **Correct Answer: D**
>
> `GRANT BROWSE ON CATALOG customers TO team;`
>
> `BROWSE` lets users discover objects and view metadata without usage privileges, and Databricks recommends granting it on catalogs. `SELECT` and `ALL PRIVILEGES` would expose data. `USAGE` is a legacy Hive metastore privilege. In Unity Catalog the usage privileges are `USE CATALOG` / `USE SCHEMA`, and they don't grant data access on their own ([UC privileges reference](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/privileges)).

---

## Question 8: Where to Check Table Permissions

**Question** *(Easy)*: A data engineer needs to use a Delta table but is unsure whether they have the necessary permissions. Where can they check their table permissions?

A) The Databricks Admin Console under User Management
B) Catalog Explorer
C) The cluster configuration page under Security settings
D) The SQL warehouse's access control list

> [!success]- Answer
> **Correct Answer: B**
>
> Catalog Explorer.
>
> The Catalog Explorer in Databricks provides a dedicated "Permissions" tab for each table, listing which users and groups have access and what privilege levels are granted. It is the primary interface for inspecting and managing object-level permissions.

---

## Question 9: Identifying a Table Owner

**Question** *(Easy)*: A data engineer requires access to `new_table` but does not know who owns it. What method can be used to identify the owner?

A) Run `SHOW GRANT ON TABLE new_table` to list all privilege holders
B) Check the cluster logs for the user who last wrote to the table
C) Query the `information_schema.tables` view for the table's creator
D) Review the Owner field in the table's page in Catalog Explorer

> [!success]- Answer
> **Correct Answer: D**
>
> Review the Owner field in the table's page in Catalog Explorer.
>
> Catalog Explorer displays the table owner in the table details panel. Any user with workspace access can view this field without needing special permissions, making it the standard way to identify who to contact for permission requests.

---

## Question 10: Undoing an External-to-Managed Conversion *(2026 blueprint)*

**Question** *(Hard)*: A data engineer converted an external table to a Unity Catalog managed table with `ALTER TABLE ... SET MANAGED`. Two days later, the team must undo it. What should they run?

A) `ALTER TABLE ... UNSET MANAGED`
B) `RESTORE TABLE ... TO VERSION AS OF` the version before the conversion
C) Drop the table and recreate it as external, because rollback isn't supported
D) `ALTER TABLE ... SET EXTERNAL`

> [!success]- Answer
> **Correct Answer: A**
>
> `ALTER TABLE ... UNSET MANAGED`.
>
> Rollback is supported within **14 days** of conversion. `UNSET MANAGED` points the table metadata back to the original external location and preserves writes made after conversion. Streams must be restarted, and Databricks deletes the managed copy seven days after rollback. `RESTORE` restores data versions, not the table type ([Convert to managed tables](https://docs.databricks.com/aws/en/tables/convert-external-managed)).

---

## Question 11: Converting an External Table to Managed *(2026 blueprint)*

**Question** *(Medium)*: Which command converts an existing Unity Catalog external Delta table to a managed table while keeping its name, permissions, and history?

A) `CREATE OR REPLACE TABLE t AS SELECT * FROM t`
B) `ALTER TABLE t SET MANAGED` on Databricks Runtime 17.3 LTS+ or serverless
C) `CONVERT TO DELTA t`
D) `ALTER TABLE t SET LOCATION NULL`

> [!success]- Answer
> **Correct Answer: B**
>
> `ALTER TABLE t SET MANAGED` on Databricks Runtime 17.3 LTS+ or serverless.
>
> The conversion copies data and the transaction log to managed storage, then switches metadata, with only brief writer downtime. It keeps the name, settings, permissions, views, and history. You must own the table, and existing streams must be restarted afterwards ([Convert to managed tables](https://docs.databricks.com/aws/en/tables/convert-external-managed)).

---

## Question 12: Recovering a Dropped Managed Table *(2026 blueprint)*

**Question** *(Easy)*: A Unity Catalog managed table was dropped by mistake yesterday. What can the team do?

A) Nothing, because managed-table data is deleted immediately
B) Run `UNDROP TABLE` within the recovery period (7 days by default)
C) Run `RESTORE TABLE` on the dropped name
D) Recreate it with `CREATE TABLE ... LOCATION` pointing at the old path

> [!success]- Answer
> **Correct Answer: B**
>
> Run `UNDROP TABLE` within the recovery period (7 days by default).
>
> Dropped managed tables can be recovered with `UNDROP TABLE` for 7 days by default, and the data files are deleted when the recovery period expires. Dropping an external table removes only metadata, and its files stay in cloud storage ([UC managed tables](https://docs.databricks.com/aws/en/tables/managed)).

---

## Question 13: DENY in Unity Catalog *(2026 blueprint)*

**Question** *(Hard)*: An admin runs `DENY SELECT ON TABLE prod.gold.revenue TO contractors` in a Unity Catalog catalog, and the statement fails. Which statement is correct?

A) The syntax is wrong. It should be `DENY SELECT TO contractors ON prod.gold.revenue`
B) The classic `DENY` statement applies only to the legacy `hive_metastore` catalog. In Unity Catalog, remove access by revoking (or not granting) `SELECT`, and use filters, masks, or ABAC for partial access
C) `DENY` works only on schemas, not tables
D) `DENY` requires a metastore admin, and a workspace admin can't run it

> [!success]- Answer
> **Correct Answer: B**
>
> The classic `DENY` statement applies only to the legacy `hive_metastore` catalog. In Unity Catalog, remove access by revoking (or not granting) `SELECT`, and use filters, masks, or ABAC for partial access.
>
> The DENY reference states it "is not supported by Unity Catalog". Unity Catalog's deny mechanism is the ABAC DENY policy (Beta), which currently denies only `MANAGE ACCESS CONTROL` ([DENY](https://docs.databricks.com/aws/en/sql/language-manual/security-deny), [ABAC DENY policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/deny-policies)).

---

## Question 14: Minimum Privileges for One Table *(2026 blueprint)*

**Question** *(Medium)*: The `auditors` group must query only `prod.finance.ledger`, not the other tables in `prod.finance`. Which grants are required?

A) `SELECT` on the table only
B) `USE CATALOG` on `prod`, `USE SCHEMA` on `prod.finance`, and `SELECT` on `prod.finance.ledger`
C) `SELECT` on schema `prod.finance`
D) `ALL PRIVILEGES` on catalog `prod`

> [!success]- Answer
> **Correct Answer: B**
>
> `USE CATALOG` on `prod`, `USE SCHEMA` on `prod.finance`, and `SELECT` on `prod.finance.ledger`.
>
> The usage privileges are required to reach objects inside a catalog or schema, but they don't grant data access by themselves. A schema-level `SELECT` would be inherited by every current and future table in the schema, which is too broad here ([UC privileges](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/privileges)).

---

## Question 15: Masking a Column by Group *(2026 blueprint)*

**Question** *(Medium)*: Only members of `finance_team` may see full values in `credit_card_number`. Everyone else should see a masked value, and everyone queries the same table. What should be implemented?

A) A column mask function using `is_account_group_member('finance_team')`, attached with `ALTER TABLE ... ALTER COLUMN credit_card_number SET MASK`
B) A separate copy of the table per group
C) `DENY SELECT` on the column for everyone except `finance_team`
D) Cloud IAM permissions on the column

> [!success]- Answer
> **Correct Answer: A**
>
> A column mask function using `is_account_group_member('finance_team')`, attached with `ALTER TABLE ... ALTER COLUMN credit_card_number SET MASK`.
>
> A column mask is a SQL UDF that receives the value and returns either the original or a masked value, evaluated per query. Its return type must match the column type. Copies drift, and `DENY` isn't a Unity Catalog column-level mechanism ([row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters)).

---

## Question 16: Row-Level Security *(2026 blueprint)*

**Question** *(Medium)*: Regional sales managers must see only the rows of `main.silver.orders` for their own region. Which implementation fits?

A) A row filter UDF returning `BOOLEAN` that checks group membership against `region`, attached with `ALTER TABLE main.silver.orders SET ROW FILTER fn ON (region)`
B) A column mask on `region`
C) Partition the table by region and grant `SELECT` per partition
D) `REVOKE SELECT` from all managers

> [!success]- Answer
> **Correct Answer: A**
>
> A row filter UDF returning `BOOLEAN` that checks group membership against `region`, attached with `ALTER TABLE main.silver.orders SET ROW FILTER fn ON (region)`.
>
> Rows for which the row filter returns `FALSE` are excluded from results. Masks change column values, not row visibility, and Unity Catalog doesn't grant privileges per partition ([row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters)).

---

## Question 17: Masking PII Across Many Tables *(2026 blueprint)*

**Question** *(Hard)*: A privacy team must mask every email column in all tables of the `main.silver` schema, including tables created later. Table owners must not be able to remove the masking. What should they use?

A) A column mask set separately on each table by its owner
B) A Unity Catalog ABAC column mask policy on the schema, matching columns tagged with a governed tag such as `pii = email`
C) A dynamic view per table
D) An ABAC DENY policy on `SELECT`

> [!success]- Answer
> **Correct Answer: B**
>
> A Unity Catalog ABAC column mask policy on the schema, matching columns tagged with a governed tag such as `pii = email`.
>
> ABAC policies (`CREATE POLICY ... COLUMN MASK ... FOR TABLES MATCH COLUMNS has_tag_value('pii','email')`) attach at catalog, schema, or table level and apply automatically to objects with matching governed tags. Because higher-level admins define them, table owners can't override or remove them. DENY policies currently deny only `MANAGE ACCESS CONTROL` ([ABAC](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/), [ABAC policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/policies)).

---

**[← Previous: Domain 6: Troubleshooting, Monitoring, and Optimization](./06-troubleshooting-monitoring-and-optimization.md) | [↑ Back to DE Associate Practice Questions](./README.md)**

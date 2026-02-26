---
title: Data Management Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, data-management, unity-catalog, delta-lake]
---

# Data Management Practice Questions

[← Back to Practice Questions](./README.md) | [Next: SQL Queries](./03-sql-queries.md)

---

## Question 1: Unity Catalog Three-Level Namespace *(Easy)*

Which format correctly refers to a table in Unity Catalog?

A) `schema.table`
B) `catalog.schema.table`
C) `workspace.catalog.table`
D) `database.table`

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog uses a three-level namespace: `catalog.schema.table`. The two-level
> `schema.table` format was used with the legacy Hive metastore.

---

## Question 2: Managed vs External Table DROP *(Medium)*

A data engineer drops a managed Delta table and then drops an external Delta table. What happens in each case?

A) Both operations delete data files and metadata
B) Both operations delete only metadata
C) Managed: deletes data AND metadata. External: deletes metadata only, data files remain
D) External: deletes data AND metadata. Managed: deletes metadata only

> [!success]- Answer
> **Correct Answer: C**
>
> This is the defining difference: dropping a managed table removes both the Delta files and
> the table definition. Dropping an external table removes only the Hive metastore entry;
> files stay in external storage.

---

## Question 3: GRANT SELECT on a Table *(Easy)*

Which SQL statement correctly grants read access to a table in Unity Catalog?

A) `GRANT READ ON TABLE catalog.schema.table TO 'user@company.com'`
B) `GRANT SELECT ON TABLE catalog.schema.table TO 'user@company.com'`
C) `GRANT ACCESS ON TABLE catalog.schema.table TO 'user@company.com'`
D) `GRANT VIEW ON TABLE catalog.schema.table TO 'user@company.com'`

> [!success]- Answer
> **Correct Answer: B**
>
> `SELECT` is the correct privilege for read access in Unity Catalog. `READ` and `ACCESS`
> are not valid UC privilege names.

---

## Question 4: CREATE TABLE in UC *(Medium)*

Which statement creates a managed table in the `gold` schema of the `ml_catalog` catalog?

A) `CREATE TABLE gold.transactions AS SELECT ...`
B) `CREATE TABLE ml_catalog.gold.transactions AS SELECT ...`
C) `USE CATALOG ml_catalog; CREATE TABLE gold.transactions AS SELECT ...`
D) Both B and C are correct

> [!success]- Answer
> **Correct Answer: D**
>
> Both a fully-qualified name and `USE CATALOG` + two-level reference create the table in
> the correct location.

---

## Question 5: Schema Evolution — mergeSchema *(Medium)*

An analyst appends data with a new column to an existing Delta table using `df.write.format("delta").mode("append").save(path)`. The new column is not in the table schema. What happens?

A) The new column is automatically added to the table schema
B) An error is raised — new columns are not allowed without explicit schema evolution
C) The new column is silently dropped
D) The write succeeds and the column is stored as a nested JSON string

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake enforces schema-on-write by default. To add new columns, use
> `.option("mergeSchema", "true")` or set
> `spark.databricks.delta.schema.autoMerge.enabled = true`.

---

## Question 6: overwriteSchema Option *(Easy)*

What does the `overwriteSchema` option do in a Delta Lake write?

A) Adds new columns to the existing schema
B) Replaces the existing schema entirely with the new DataFrame's schema
C) Validates the DataFrame schema matches the table schema
D) Enables automatic type casting

> [!success]- Answer
> **Correct Answer: B**
>
> `overwriteSchema=true` (combined with `mode("overwrite")`) replaces the entire table
> schema. This is necessary when columns are renamed or dropped, not just added.

---

## Question 7: REVOKE Privilege *(Easy)*

A data analyst's access to `finance.transactions` must be removed. Which statement is correct?

A) `DELETE GRANT SELECT ON TABLE finance.transactions FROM 'analyst@co.com'`
B) `REVOKE SELECT ON TABLE finance.transactions FROM 'analyst@co.com'`
C) `DROP GRANT SELECT ON TABLE finance.transactions FROM 'analyst@co.com'`
D) `REMOVE ACCESS ON TABLE finance.transactions FROM 'analyst@co.com'`

> [!success]- Answer
> **Correct Answer: B**
>
> `REVOKE` is the correct SQL command to remove privileges in Unity Catalog.

---

## Question 8: Metastore vs Catalog *(Medium)*

In Unity Catalog, what is the relationship between a metastore and a catalog?

A) They are the same thing — different names for the same object
B) A metastore is the top-level account-level container; a catalog is an object within the metastore
C) A catalog contains multiple metastores
D) A metastore is created per workspace; a catalog is account-level

> [!success]- Answer
> **Correct Answer: B**
>
> A Unity Catalog metastore is created once per region at the account level. Multiple
> catalogs exist within a metastore. Workspaces are attached to the metastore.

---

## Question 9: Delta Lake TBLPROPERTIES *(Easy)*

Which statement sets a custom property on a Delta table?

A) `SET TABLE finance.transactions PROPERTIES (owner = 'finance-team')`
B) `ALTER TABLE finance.transactions SET TBLPROPERTIES ('owner' = 'finance-team')`
C) `UPDATE TABLE finance.transactions SET PROPERTY owner = 'finance-team'`
D) `CONFIGURE TABLE finance.transactions WITH PROPERTIES (owner = 'finance-team')`

> [!success]- Answer
> **Correct Answer: B**
>
> `ALTER TABLE ... SET TBLPROPERTIES` is the correct syntax. Properties are key-value
> string pairs.

---

## Question 10: Data Lineage in UC Explorer *(Medium)*

A compliance team wants to see which dashboards read from the `gold.revenue_metrics` table. Which UC feature provides this?

A) MLflow experiment tracking
B) Delta transaction log
C) Unity Catalog data lineage graph in the Catalog Explorer UI
D) SQL warehouse query history

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog automatically captures column-level and table-level lineage. The Catalog
> Explorer UI shows upstream (sources) and downstream (consumers) for any table.

---

## Question 11: External Location *(Hard)*

An analyst creates an external table pointing to `s3://company-data/raw/sales/`. The underlying S3 files are deleted by a pipeline mistake. What happens when the table is queried?

A) The table returns empty results
B) An error is raised — the files referenced by the external table no longer exist
C) Delta Lake automatically restores the files from the transaction log
D) The table is automatically dropped

> [!success]- Answer
> **Correct Answer: B**
>
> External tables point to external storage. If the files are deleted, queries fail with a
> file-not-found error. Delta can only restore files if they were managed and within VACUUM
> retention.

---

## Question 12: USE CATALOG Statement *(Medium)*

A data analyst runs `USE CATALOG analytics; USE SCHEMA reporting;`. What does `SELECT * FROM revenue` query?

A) `main.default.revenue`
B) `analytics.reporting.revenue`
C) `analytics.default.revenue`
D) `default.reporting.revenue`

> [!success]- Answer
> **Correct Answer: B**
>
> `USE CATALOG` sets the default catalog and `USE SCHEMA` sets the default schema.
> Unqualified table references use these defaults: `analytics.reporting.revenue`.

---

**[← Previous: Databricks SQL Practice Questions](./01-databricks-sql.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: SQL Queries Practice Questions](./03-sql-queries.md) →**

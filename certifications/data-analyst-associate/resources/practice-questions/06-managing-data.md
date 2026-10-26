---
title: Managing Data Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, managing-data, unity-catalog, tags, data-cleaning]
---

# Managing Data Practice Questions

**Exam Weight: 8 %** — Section 2 of the October 2025 exam guide

Questions marked *(2025 blueprint)* target skills added in the October 2025 exam guide. All questions were checked against the Databricks documentation on October 26, 2026.

[← Previous: Understanding of Databricks Data + AI Platform](./05-databricks-platform.md) | [↑ Back to Practice Questions](./README.md) | [Next: Securing Data](./07-securing-data.md)

---

## Question 1: Appending a New Column *(Medium)*

An analyst appends data that has an extra column to an existing Delta table with `df.write.format("delta").mode("append").saveAsTable("sales")`. The new column is not in the table schema. What happens?

A) The column is added to the table schema automatically  
B) The write fails, because Delta Lake enforces the table schema unless schema evolution is enabled  
C) The new column is dropped silently  
D) The column is stored as a JSON string  

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake enforces the schema on write. To add the new column during the write, enable schema evolution, for example with `.option("mergeSchema", "true")`.
>
> Delta never drops or reshapes columns silently (C, D).

---

## Question 2: Replacing a Schema *(Easy)*

What does the `overwriteSchema` option do when it is combined with `mode("overwrite")` in a Delta Lake write?

A) Replaces the table's schema with the schema of the data being written  
B) Adds new columns to the existing schema  
C) Checks that the schemas match and fails if they differ  
D) Casts every column to string  

> [!success]- Answer
> **Correct Answer: A**
>
> `overwriteSchema` replaces the schema as well as the data. You need it when columns are renamed, dropped, or change type. `mergeSchema` only adds columns.

---

## Question 3: Setting a Table Property *(Easy)*

Which statement sets a custom property on a Delta table?

A) `SET TABLE finance.transactions PROPERTIES (owner_team = 'finance')`  
B) `UPDATE TABLE finance.transactions SET PROPERTY owner_team = 'finance'`  
C) `CONFIGURE TABLE finance.transactions WITH (owner_team = 'finance')`  
D) `ALTER TABLE finance.transactions SET TBLPROPERTIES ('owner_team' = 'finance')`  

> [!success]- Answer
> **Correct Answer: D**
>
> `ALTER TABLE ... SET TBLPROPERTIES` sets key-value table properties. The other options are not valid syntax.

---

## Question 4: Who Reads This Table? *(Medium)*

A compliance team wants to see which notebooks, jobs, and dashboards read from `gold.revenue_metrics`. Which feature shows this?

A) MLflow experiment tracking  
B) The Delta transaction log  
C) SQL warehouse monitoring  
D) Unity Catalog lineage on the table's Lineage tab in Catalog Explorer  

> [!success]- Answer
> **Correct Answer: D**
>
> Unity Catalog captures lineage at the table level and, where possible, the column level, across queries, notebooks, jobs, dashboards, and pipelines. The Lineage tab lists them, and **See Lineage Graph** shows them as a diagram.
>
> Lineage shown in Catalog Explorer is kept indefinitely, while the lineage system tables keep a rolling year. Lineage is not preserved when an object is renamed.

---

## Question 5: NULLs in SUM *(Medium)*

A `revenue` column contains some NULL values. What does `SUM(revenue)` return?

A) NULL, because any NULL makes the aggregate NULL  
B) An error  
C) The sum with NULLs counted as 0, and 0 when every value is NULL  
D) The sum of the non-NULL values  

> [!success]- Answer
> **Correct Answer: D**
>
> Aggregate functions such as `SUM`, `AVG`, `MIN`, `MAX`, and `COUNT(col)` ignore NULLs. `COUNT(*)` counts every row. `SUM` returns NULL only when every value is NULL, which is why option C is wrong.
>
> If NULL should count as zero, write `SUM(COALESCE(revenue, 0))`.

---

## Question 6: Certifying a Table *(Hard)* *(2025 blueprint)*

A data steward wants `main.sales.transactions` to show as certified so analysts know it is the trusted source. What should the steward do?

A) Set the governed tag `system.certification_status` to `certified` on the table, with `SET TAG ON TABLE` or **Assign certification** in the UI  
B) Set a table property `certified` to `true` with `ALTER TABLE ... SET TBLPROPERTIES`  
C) Grant a `CERTIFY` privilege on the table to the stewards group  
D) Add the word "certified" to the table comment  

> [!success]- Answer
> **Correct Answer: A**
>
> Certification is the system-governed tag `system.certification_status` with the values `certified` or `deprecated`. In SQL, use `SET TAG ON TABLE` with the tag key quoted in backticks. In the UI, choose **Assign certification** from the object's kebab menu.
>
> Applying it requires the ASSIGN permission on that governed tag, plus APPLY TAG on the object (or ownership) and USE SCHEMA and USE CATALOG on its parents. A table property or comment does not show the badge (B, D), and `CERTIFY` is not a privilege (C).

---

## Question 7: Finding Certified Data *(Easy)* *(2025 blueprint)*

An analyst wants to see only certified tables when searching the workspace. How?

A) Search for `certificationStatus:certified` or use the **Certification status** filter  
B) Query `system.query.history`  
C) Run `SHOW TABLES LIKE 'certified*'`  
D) Certified tables cannot be searched  

> [!success]- Answer
> **Correct Answer: A**
>
> Workspace search supports `certificationStatus:certified` and `certificationStatus:deprecated`, and has a **Certification status** filter.
>
> `SHOW TABLES LIKE` matches table names, not tags (C).

---

## Question 8: Tagging a PII Column *(Medium)* *(2025 blueprint)*

An analyst must tag the `ssn` column of `abac.customers.profiles` as PII. Which statement does this?

A) `ALTER TABLE abac.customers.profiles SET TBLPROPERTIES ('ssn' = 'pii')`  
B) `ALTER TABLE abac.customers.profiles ALTER COLUMN ssn SET TAGS ('pii' = 'ssn')`  
C) `UPDATE abac.customers.profiles SET TAG ssn = 'pii'`  
D) `TAG COLUMN ssn AS pii`  

> [!success]- Answer
> **Correct Answer: B**
>
> `ALTER TABLE ... ALTER COLUMN ... SET TAGS` adds column tags. In Catalog Explorer, you do the same from the object's Overview page under **Tags** > **Add tags**.
>
> To tag an object, you must own it or have APPLY TAG on it, plus USE SCHEMA and USE CATALOG on its parents. Tag keys are case-sensitive, and each object can have up to 50 tags.

---

## Question 9: Listing Tagged Columns *(Medium)* *(2025 blueprint)*

An analyst wants a SQL list of every column tagged `pii` in a catalog. Where should they look?

A) `DESCRIBE HISTORY`  
B) `information_schema.column_tags`  
C) `system.query.history`  
D) `SHOW GRANTS`  

> [!success]- Answer
> **Correct Answer: B**
>
> The information schema has views for tags, including `CATALOG_TAGS`, `SCHEMA_TAGS`, `TABLE_TAGS`, `COLUMN_TAGS`, and `VOLUME_TAGS`. Results are limited to objects you have privileges on.

---

## Question 10: Removing Invalid Rows *(Easy)* *(2025 blueprint)*

A Delta table `silver.orders` contains rows with negative `amount` values, which are invalid. Which statement removes them?

A) `DROP ROWS FROM silver.orders WHERE amount < 0`  
B) `DELETE FROM silver.orders WHERE amount < 0`  
C) `TRUNCATE TABLE silver.orders WHERE amount < 0`  
D) `ALTER TABLE silver.orders DROP amount < 0`  

> [!success]- Answer
> **Correct Answer: B**
>
> `DELETE FROM ... WHERE` removes the matching rows from a Delta table, and the change is recorded in the table history.
>
> `TRUNCATE TABLE` removes all rows and takes no `WHERE` clause (C). Options A and D are not valid syntax.

---

## Question 11: Filling Missing Values *(Easy)* *(2025 blueprint)*

In a cleaned view, a NULL `region` should appear as `'Unknown'`. Which expression does this?

A) `NULLIF(region, 'Unknown')`  
B) `region IS 'Unknown'`  
C) `COALESCE(region, 'Unknown')`  
D) `CAST(region AS 'Unknown')`  

> [!success]- Answer
> **Correct Answer: C**
>
> `COALESCE` returns its first non-NULL argument, so NULL regions become `'Unknown'`. `IFNULL` and `NVL` do the same with two arguments.
>
> `NULLIF(a, b)` does the opposite: it returns NULL when `a` equals `b` (A).

---

## Question 12: Removing Duplicates *(Hard)* *(2025 blueprint)*

`bronze.customers` contains exact duplicate rows. An analyst wants a clean `silver.customers` table with each row once. Which statement does this?

A) `CREATE TABLE silver.customers AS SELECT * FROM bronze.customers GROUP BY ALL HAVING COUNT(*) > 1`  
B) `DELETE DUPLICATES FROM bronze.customers`  
C) `CREATE OR REPLACE TABLE silver.customers AS SELECT DISTINCT * FROM bronze.customers`  
D) `CREATE VIEW silver.customers AS SELECT * FROM bronze.customers LIMIT 1`  

> [!success]- Answer
> **Correct Answer: C**
>
> `SELECT DISTINCT *` keeps one copy of each identical row, and `CREATE OR REPLACE TABLE ... AS` stores the result.
>
> Option A keeps only the rows that were duplicated. Option B is not valid syntax. When rows are duplicates by key rather than identical, use `ROW_NUMBER()` with `QUALIFY ... = 1` instead.

---

## Question 13: Bad Values in a Numeric Column *(Medium)* *(2025 blueprint)*

A string column `qty_raw` mostly holds numbers but sometimes holds text such as `'n/a'`. `CAST(qty_raw AS INT)` makes the query fail. What lets the query succeed and turns invalid values into NULL?

A) `CAST(qty_raw AS STRING)`  
B) `qty_raw::BIGINT`  
C) `INT(qty_raw)`  
D) `try_cast(qty_raw AS INT)`  

> [!success]- Answer
> **Correct Answer: D**
>
> `try_cast` returns NULL when a value cannot be converted, instead of raising an error. You can then handle the NULLs, for example with `COALESCE` or a `WHERE` filter.
>
> `::` is shorthand for `CAST`, so it fails the same way (B).

---

**[← Previous: Understanding of Databricks Data + AI Platform Practice Questions](./05-databricks-platform.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Securing Data Practice Questions →](./07-securing-data.md)**

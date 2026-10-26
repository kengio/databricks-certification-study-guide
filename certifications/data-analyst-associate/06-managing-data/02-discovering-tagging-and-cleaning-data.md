---
title: Discovering, Tagging & Cleaning Data
type: study-material
tags:
  - data-analyst-associate
  - unity-catalog
  - certified-data
  - tags
  - lineage
  - data-cleaning
---

# Discovering, Tagging & Cleaning Data

## Overview

Section 2 of the October 2025 exam guide has three skills: "use Unity Catalog to discover, query, and manage certified datasets", "use the Catalog Explorer to tag a data asset and view its lineage", and "perform data cleaning on Unity Catalog Tables in SQL, including removing invalid data or handling missing values".

> [!abstract]
>
> - **Certification**: the system-governed tag `system.certification_status` (`certified` or `deprecated`)
> - **Tags**: key-value labels on catalogs, schemas, tables, columns, volumes, and more
> - **Lineage**: the Lineage tab and lineage graph in Catalog Explorer
> - **Cleaning in SQL**: `DELETE`, `COALESCE`, `try_cast`, `DISTINCT`, `ROW_NUMBER` + `QUALIFY`

> [!tip] What the Exam Tests
>
> - Finding and flagging trusted (certified) data
> - Adding a tag in Catalog Explorer or SQL, and the privilege it needs
> - Choosing the SQL that removes invalid rows or fills missing values

---

## Discovering and Certifying Data

**Find data**: search the workspace or browse **Catalog** in the sidebar. Certified assets show a check mark; deprecated assets show a restricted icon.

- Search with `certificationStatus:certified` (or `deprecated`), or use the **Certification status** filter.
- Tag search needs exact terms.

**Certify data** (catalogs, schemas, tables, views, volumes, functions, models, dashboards, Genie Agents, apps, notebooks):

1. Open the object, open the kebab menu, and select **Assign certification**.
2. Choose **Certified**, **Deprecated**, or **None**, then **Save**.

```sql
SET TAG ON TABLE main.sales.transactions `system.certification_status` = `certified`;
```

Applying certification requires the `ASSIGN` permission on the `system.certification_status` governed tag, plus ownership of the object or `APPLY TAG` on it, and `USE SCHEMA` and `USE CATALOG` on its parents.

## Tagging in Catalog Explorer

1. Open **Catalog** and select the object.
2. On the **Overview** page, under **Tags**, click **Add tags**.
3. Choose or enter a key and an optional value. Governed tags appear under a *Governed* header with a lock icon.

```sql
-- Column tag (Databricks Runtime 13.3 LTS and above)
ALTER TABLE main.crm.customers ALTER COLUMN email SET TAGS ('pii' = 'email');

-- Object tag (Databricks Runtime 16.1 and above)
SET TAG ON TABLE main.crm.customers domain = crm;

-- Find tagged columns
SELECT table_name, column_name, tag_name, tag_value
FROM main.information_schema.column_tags
WHERE tag_name = 'pii';
```

| Rule | Value |
| :--- | :--- |
| Who can tag | Owner, or `APPLY TAG` on the object + `USE SCHEMA` + `USE CATALOG` |
| Max tags per object | 50 |
| Key and value length | Up to 256 characters each; keys are case-sensitive |
| Governed tags | Account-level; admins control allowed values and who can assign them |

## Viewing Lineage

Open the table, select the **Lineage** tab, and click **See Lineage Graph**. Click an edge for details. Lineage covers queries, notebooks, jobs, dashboards, and pipelines, at table level and (where possible) column level. You need at least `BROWSE` on the parent catalog. See [Platform Components, Catalog Explorer & Marketplace](../05-understanding-databricks-platform/03-platform-components-and-marketplace.md).

## Cleaning Data in SQL

```sql
-- Remove invalid rows from a Delta table (recorded in table history)
DELETE FROM main.silver.orders WHERE amount < 0 OR order_id IS NULL;

-- Handle missing values and bad types in a cleaned table
CREATE OR REPLACE TABLE main.silver.customers AS
SELECT
  customer_id,
  COALESCE(region, 'Unknown')                     AS region,      -- fill NULLs
  try_cast(age_raw AS INT)                        AS age,         -- 'n/a' -> NULL, no error
  NULLIF(TRIM(email), '')                         AS email,       -- empty string -> NULL
  UPPER(TRIM(country_code))                       AS country_code -- standardise
FROM main.bronze.customers
WHERE customer_id IS NOT NULL;                                    -- drop rows without a key

-- Exact duplicates
CREATE OR REPLACE TABLE main.silver.events AS
SELECT DISTINCT * FROM main.bronze.events;

-- Duplicates by key: keep the latest row per customer
CREATE OR REPLACE TABLE main.silver.customers_latest AS
SELECT * FROM main.bronze.customers
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) = 1;
```

| Problem | SQL |
| :--- | :--- |
| Invalid rows | `DELETE FROM ... WHERE ...` or filter in a CTAS / view |
| Missing values | `COALESCE`, `IFNULL`/`NVL`; filter with `IS NULL` |
| Strings that should be numbers | `try_cast` (returns NULL instead of failing) |
| Empty strings | `NULLIF(col, '')` |
| Duplicates | `SELECT DISTINCT`, or `ROW_NUMBER()` + `QUALIFY` |

Aggregates ignore NULLs, so decide whether a missing value should count as zero (`SUM(COALESCE(x, 0))`) before reporting.

## Use Cases

- **Trusted sources**: Certifying the gold revenue table and deprecating the old one so analysts stop using it.
- **PII inventory**: Tagging sensitive columns and listing them from `information_schema.column_tags`.
- **Silver layer clean-up**: Turning raw bronze rows into typed, deduplicated silver tables.

## Common Issues & Errors

### "Assign certification" is greyed out

**Scenario:** A user cannot certify a table they own.
**Fix:** They also need `ASSIGN` on the `system.certification_status` governed tag.

### `CAST` fails on bad values

**Scenario:** `CAST(qty AS INT)` errors on `'n/a'`.
**Fix:** Use `try_cast`, then handle the NULLs.

## Exam Tips

- Certified/deprecated = governed tag `system.certification_status`
- Tagging needs `APPLY TAG` (or ownership); governed tags also need `ASSIGN`
- `COALESCE` fills NULLs; `NULLIF` creates them; `try_cast` avoids errors
- `DELETE ... WHERE` removes invalid rows and is recorded in history

## Key Takeaways

- Discover with search and Catalog Explorer; trust what is certified
- Tags and lineage live on the object's pages in Catalog Explorer
- Clean data with plain SQL into silver tables

## Related Topics

- [Tables & Schemas](./01-tables-schemas.md)
- [Platform Components, Catalog Explorer & Marketplace](../05-understanding-databricks-platform/03-platform-components-and-marketplace.md)
- [Data Modeling with Databricks SQL](../09-data-modeling-with-databricks-sql/01-data-modeling-overview.md) - Where cleaning sits in the medallion architecture

## Official Documentation

- [Flag data as certified or deprecated](https://docs.databricks.com/aws/en/data-governance/unity-catalog/certify-deprecate-data)
- [Apply tags to Unity Catalog securable objects](https://docs.databricks.com/aws/en/database-objects/tags)
- [View data lineage using Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage)

---

**[← Previous: Tables & Schemas](./01-tables-schemas.md) | [↑ Back to Section](./README.md)**

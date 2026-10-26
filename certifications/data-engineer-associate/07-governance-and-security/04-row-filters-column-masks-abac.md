---
title: Row Filters, Column Masks, and ABAC
type: study-material
tags:
  - data-engineer-associate
  - unity-catalog
  - row-filters
  - column-masks
  - abac
  - security
status: published
---

# Row Filters, Column Masks, and ABAC

## Overview

Privileges decide **whether** a principal can query a table. Fine-grained access control decides **which rows and which column values** that principal sees. Unity Catalog offers three tools for this. **Row filters** and **column masks** are SQL UDFs attached to one table. **Dynamic views** are the classic view-based approach. **Attribute-based access control (ABAC) policies** apply filters and masks centrally, using governed tags across a catalog or schema.

> [!abstract]
>
> - **Row filter**: a SQL UDF returning `BOOLEAN`, attached with `ALTER TABLE ... SET ROW FILTER fn ON (cols)`. Rows where it returns `FALSE` are hidden
> - **Column mask**: a SQL UDF returning the column's type, attached with `ALTER TABLE ... ALTER COLUMN c SET MASK fn`. Each column can have one mask
> - Gate both by group with **`is_account_group_member('group')`**
> - **ABAC**: `CREATE POLICY ... ROW FILTER | COLUMN MASK ... FOR TABLES WHEN has_tag_value(...)`, attached at catalog, schema, or table level. Table owners can't override policies set by higher-level admins

> [!tip] What the Exam Tests
>
> - Exam guide skill: understand column-level masking and row-level security to restrict data visibility based on user groups
> - Exam guide skill: understand Unity Catalog ABAC policies to centrally control row filtering and column masking for sensitive data
> - Writing a mask with `is_account_group_member(...)` so only one group sees the clear value
> - When to use per-table filters and masks, dynamic views, or ABAC

---

## Column Masks

```sql
-- 1. A mask function: finance sees the full card number, everyone else sees the last 4 digits
CREATE OR REPLACE FUNCTION main.security.mask_card(card STRING)
RETURNS STRING
RETURN CASE
  WHEN is_account_group_member('finance_team') THEN card
  ELSE concat('****-****-****-', right(card, 4))
END;

-- 2. Attach it to the column
ALTER TABLE main.silver.payments
  ALTER COLUMN credit_card_number SET MASK main.security.mask_card;

-- 3. Remove it
ALTER TABLE main.silver.payments ALTER COLUMN credit_card_number DROP MASK;
```

- The function receives the column value and returns the original or a masked value. The **return type must match** the column type, or be castable to it
- **One mask per column**. Masks can reference other columns

## Row Filters

```sql
-- Users see only their region's rows; admins see everything
CREATE OR REPLACE FUNCTION main.security.region_filter(region STRING)
RETURNS BOOLEAN
RETURN is_account_group_member('admins')
    OR (is_account_group_member('emea_sales') AND region = 'EMEA')
    OR (is_account_group_member('amer_sales') AND region = 'AMER');

ALTER TABLE main.silver.orders SET ROW FILTER main.security.region_filter ON (region);

ALTER TABLE main.silver.orders DROP ROW FILTER;
```

Rows for which the function returns `FALSE` are excluded from query results ([Row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters)).

### Requirements and Limitations (Table-Level Filters and Masks)

| Topic | Detail |
| :--- | :--- |
| **Runtime** | DBR below 12.2 LTS doesn't support them, and **returns no data** rather than failing open |
| **Dedicated access mode** | DBR 15.4 LTS+ with serverless enabled in the workspace (queries run through serverless fine-grained access control). DBR 15.4–16.2 is read-only, and writes need 16.3+ |
| **Views** | You **can't** apply row filters or column masks to a view |
| **Not supported** | Time travel on tables with table-level policies. Deep or shallow clones. OpenSharing of such tables. Creating an AI Search index from them |
| **Who manages** | The table owner or a user with `MANAGE` |

> [!note] Platform update (Oct 2026)
> The docs now use **AI Search** for what the exam guides call **Vector Search**, and **OpenSharing** for Delta Sharing (renamed Jun 10, 2026, [release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/june)).

## Dynamic Views

Before table-level filters and masks existed, the standard pattern was a **dynamic view**: a view over the base table that filters or masks based on the querying user, granted to consumers instead of the base table.

```sql
CREATE OR REPLACE VIEW main.gold.v_payments AS
SELECT payment_id,
       CASE WHEN is_account_group_member('finance_team') THEN credit_card_number
            ELSE '****' END AS credit_card_number,
       amount, region
FROM main.silver.payments
WHERE is_account_group_member('admins') OR region = 'EMEA';

GRANT SELECT ON main.gold.v_payments TO `analysts`;   -- analysts get no SELECT on the base table
```

Dynamic views still fit when you share a **curated or transformed slice** of data, or when consumers should never touch the base table.

## ABAC Policies

Attribute-based access control evaluates **attributes (governed tags)** on securable objects. One policy can protect every table and column with the targeted tags, current and future, across a catalog or schema ([Unity Catalog ABAC](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/)).

```sql
-- Tag the data (governed tags must exist and be applied)
ALTER TABLE main.silver.customers ALTER COLUMN email SET TAGS ('pii' = 'email');

-- A masking UDF
CREATE OR REPLACE FUNCTION main.security.mask_email(email STRING)
RETURNS STRING
RETURN concat('***@', split(email, '@')[1]);

-- One policy masks every tagged email column in the schema for analysts
CREATE POLICY mask_pii_email
ON SCHEMA main.silver
COMMENT 'Mask email addresses for analysts'
COLUMN MASK main.security.mask_email
TO `analysts`
EXCEPT `privacy_admins`
FOR TABLES
MATCH COLUMNS has_tag_value('pii', 'email') AS email
ON COLUMN email;

-- A row filter policy on tables tagged sensitivity = high
CREATE POLICY us_rows_only
ON CATALOG main
ROW FILTER main.security.us_only
TO `contractors`
FOR TABLES
WHEN has_tag_value('sensitivity', 'high')
MATCH COLUMNS has_tag('region') AS region
USING COLUMNS (region);
```

Policy grammar (from [ABAC policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/policies)): `CREATE [OR REPLACE] POLICY name ON { METASTORE | CATALOG c | SCHEMA s | TABLE t } { ROW FILTER fn | COLUMN MASK fn } TO principals [EXCEPT principals] FOR TABLES [WHEN condition] [MATCH COLUMNS condition AS alias] [ON COLUMN alias] [USING COLUMNS (...)]`.

| Aspect | Detail |
| :--- | :--- |
| **Attach at** | Catalog, schema, or table. Metastore-level is Beta |
| **Targets** | Objects whose **governed tags** match `WHEN` / `MATCH COLUMNS` (`has_tag`, `has_tag_value`) |
| **Requirements** | DBR **16.4+ or serverless**. `MANAGE` (or ownership) on the object where the policy attaches. `EXECUTE` on the UDF |
| **Override** | Defined by higher-level admins, so **table owners can't override or remove** them |
| **Other policy types** | GRANT policies (Beta) and DENY policies (Beta, which deny `MANAGE ACCESS CONTROL`) |

## Choosing an Approach

| Need | Use |
| :--- | :--- |
| Mask or filter one specific table | **Table-level** column mask or row filter |
| Consistent rules across many tables that carry the same sensitive attribute | **ABAC policy** on the catalog or schema, matched by governed tags. The docs recommend this for scale |
| Share a curated, transformed slice and hide the base table | **Dynamic view** |
| Hide a whole table from a group | Don't grant `SELECT`. A filter or mask isn't needed |

## Use Cases

- **PCI**: only `finance_team` sees full card numbers. Everyone else sees the last four digits
- **Regional sales**: each sales group sees only its region's orders through a row filter
- **Enterprise PII program**: a privacy team tags PII columns once, and one ABAC policy masks them in every schema
- **Partner extract**: a dynamic view exposes an aggregated, masked subset

## Common Issues & Errors

### Mask Function Rejected

**Scenario:** `SET MASK` fails because the function returns `STRING` but the column is `DECIMAL`.
**Fix:** A mask's return type must match the column type, or be castable to it.

### Users on an Old Runtime See No Rows

**Scenario:** A team on DBR 11.3 gets empty results from a filtered table.
**Fix:** Runtimes below 12.2 LTS don't support row filters or masks, and return no data instead of failing open. Upgrade, or use serverless or a SQL warehouse.

### Time Travel Fails on a Masked Table

**Scenario:** `SELECT ... VERSION AS OF 3` fails after a row filter was added.
**Fix:** Time travel isn't supported with table-level policies. Plan audits around current data, or keep a separately governed history.

### Table Owner Can't Remove a Mask

**Scenario:** A table owner tries to drop a masking rule on an email column and can't.
**Fix:** The mask comes from an ABAC policy attached at the schema or catalog, so only an admin with `MANAGE` there can change it.

## Exam Tips

> [!tip] Exam Tips
>
> - "Only group X sees the full value" → **column mask** UDF with `is_account_group_member('X')`
> - "Users see only their rows" → **row filter** UDF returning `BOOLEAN`, attached with `SET ROW FILTER ... ON (cols)`
> - `DENY` on a column isn't how Unity Catalog masks data (and the classic `DENY` statement is Hive-metastore only)
> - **ABAC** = `CREATE POLICY` + governed tags at catalog or schema level, applied consistently to many tables
> - Filters and masks can't be applied to views. Use a dynamic view instead

## Key Takeaways

- Row filters and column masks are SQL UDFs attached to tables and evaluated for every query
- `is_account_group_member()` ties visibility to account-level groups
- ABAC scales the same controls across catalogs and schemas through governed tags
- Dynamic views remain useful for curated, shareable slices

## Related Topics

- [Access Control and Permissions](./03-access-control-permissions.md)
- [Managed and External Tables](./02-managed-and-external-tables.md)
- [Data Sharing](./05-data-sharing.md)
- [Unity Catalog Quick Reference](../../../shared/cheat-sheets/unity-catalog-quick-ref.md)

## Official Documentation

- [Row filters and column masks](https://docs.databricks.com/aws/en/tables/row-and-column-filters)
- [Unity Catalog attribute-based access control (ABAC)](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/)
- [Create and manage ABAC policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/policies)
- [ABAC DENY policies (Beta)](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/deny-policies)

---

**[← Previous: Access Control and Permissions](./03-access-control-permissions.md) | [↑ Back to Governance and Security](./README.md) | [Next: Data Sharing →](./05-data-sharing.md)**

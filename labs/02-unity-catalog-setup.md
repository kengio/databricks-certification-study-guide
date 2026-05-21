---
title: "Lab 02 — Unity Catalog Setup"
type: lab
tags:
  - labs
  - unity-catalog
  - governance
  - row-filter
  - column-mask
status: published
---

# Lab 02 — Unity Catalog Setup (catalogs, schemas, volumes, grants, row filters, column masks)

Walks through UC's full governance surface end-to-end: create a catalog and schema, add a managed table, set up a UC volume, apply GRANT / REVOKE / DENY, attach a row filter and a column mask, and verify enforcement.

> [!abstract]
>
> - **Three-level namespace**: `catalog.schema.object`
> - **Managed vs external** tables and volumes
> - **`GRANT` / `REVOKE` / `DENY`** with privilege hierarchy
> - **Row filters** and **column masks** as SQL UDFs attached to a column / table
> - **Lineage** and **audit** via `system.access.*`

> [!tip] What you'll exercise
>
> - The DDL for creating UC securables
> - How GRANT cascades from catalog → schema → table
> - How `DENY` overrides `GRANT`
> - Implementing row-level + column-level access with UDFs
> - Querying the lineage and audit system tables

---

## Setup — make a workspace catalog

```sql
-- Replace 'lab_uc' with a catalog name you control
CREATE CATALOG IF NOT EXISTS lab_uc COMMENT 'UC lab catalog';
USE CATALOG lab_uc;

CREATE SCHEMA IF NOT EXISTS hr
  COMMENT 'Employee data — restricted';
-- UC uses the catalog's default managed location when MANAGED LOCATION is omitted.

CREATE VOLUME IF NOT EXISTS lab_uc.hr.docs;
```

## Step 1 — Create a managed Delta table

```sql
CREATE TABLE lab_uc.hr.employees (
  employee_id INT,
  name        STRING,
  email       STRING,        -- PII: will be column-masked
  salary      DECIMAL(10,2), -- sensitive: will be column-masked
  region      STRING,        -- used by row filter
  is_active   BOOLEAN
);

INSERT INTO lab_uc.hr.employees VALUES
  (1, 'Alice Anderson', 'alice@example.com', 120000.00, 'AMER', true),
  (2, 'Bao Banh',       'bao@example.com',   95000.00,  'APAC', true),
  (3, 'Carla Costa',    'carla@example.com', 105000.00, 'EMEA', true),
  (4, 'Dan Davies',     'dan@example.com',   110000.00, 'AMER', false);
```

## Step 2 — GRANT / REVOKE / DENY

```sql
-- Create two groups in your workspace's IDP, then run these from an account-admin or metastore-admin context.
-- (For lab purposes, use existing groups you have or substitute your own user.)

-- Read access for analysts
GRANT USAGE ON CATALOG lab_uc TO `analysts`;
GRANT USAGE ON SCHEMA  lab_uc.hr TO `analysts`;
GRANT SELECT ON TABLE  lab_uc.hr.employees TO `analysts`;

-- Hard-deny pattern: even if someone is in analysts, exec-leadership members can't see salaries
DENY SELECT ON TABLE lab_uc.hr.employees TO `exec-leadership-blocked`;
```

> [!note]
> `DENY` is *evaluated independently from GRANT*. If a user is in both `analysts` (grant) and `exec-leadership-blocked` (deny), the deny wins. `REVOKE` only removes an explicit grant; it does not block access.

## Step 3 — Row filter (restrict by region)

```sql
-- Create a UDF that decides which rows the calling user can see
CREATE OR REPLACE FUNCTION lab_uc.hr.region_filter(region_col STRING)
RETURNS BOOLEAN
RETURN
  is_account_group_member('emea-admins')   AND region_col = 'EMEA'
  OR is_account_group_member('amer-admins') AND region_col = 'AMER'
  OR is_account_group_member('apac-admins') AND region_col = 'APAC'
  OR is_account_group_member('global-admins');

-- Attach the row filter to the table
ALTER TABLE lab_uc.hr.employees
  SET ROW FILTER lab_uc.hr.region_filter ON (region);
```

When a member of `emea-admins` runs `SELECT * FROM lab_uc.hr.employees`, they see only `region = 'EMEA'` rows. A member of `global-admins` sees everything.

## Step 4 — Column mask (hide PII from non-privileged users)

```sql
CREATE OR REPLACE FUNCTION lab_uc.hr.mask_email(email_col STRING)
RETURNS STRING
RETURN CASE
         WHEN is_account_group_member('pii-cleared') THEN email_col
         ELSE concat('[redacted-', sha2(email_col, 256), ']')
       END;

ALTER TABLE lab_uc.hr.employees
  ALTER COLUMN email SET MASK lab_uc.hr.mask_email;

CREATE OR REPLACE FUNCTION lab_uc.hr.mask_salary(salary_col DECIMAL(10,2))
RETURNS DECIMAL(10,2)
RETURN CASE
         WHEN is_account_group_member('hr-comp-admins') THEN salary_col
         ELSE NULL
       END;

ALTER TABLE lab_uc.hr.employees
  ALTER COLUMN salary SET MASK lab_uc.hr.mask_salary;
```

Non-`pii-cleared` users now see `[redacted-<hash>]` instead of an email; non-`hr-comp-admins` see `NULL` for salary. **UC applies the mask at query time** — the underlying data is unchanged.

## Step 5 — Verify and inspect

```sql
SELECT * FROM lab_uc.hr.employees;

-- What grants are on the table?
SHOW GRANTS ON TABLE lab_uc.hr.employees;

-- Recent access events for this catalog
SELECT
  event_time,
  user_identity.email AS user_email,
  action_name,
  request_params.full_name_arg AS object
FROM system.access.audit
WHERE service_name = 'unityCatalog'
  AND event_time >= current_timestamp - INTERVAL 1 DAY
  AND request_params.full_name_arg LIKE 'lab_uc.%'
ORDER BY event_time DESC
LIMIT 50;

-- Table lineage (who reads/writes this table)
SELECT *
FROM system.access.table_lineage
WHERE source_table_full_name = 'lab_uc.hr.employees'
   OR target_table_full_name = 'lab_uc.hr.employees'
ORDER BY event_time DESC
LIMIT 20;
```

> [!warning]
> The `system.access.*` tables refresh on a delay (minutes to ~1 hour). Don't expect events from the last 60 seconds to appear immediately.

## Step 6 — Add an external Delta table for comparison

```sql
-- Pre-requisite: create a storage credential + external location on your cloud account.
-- The DDL is intentionally illustrative; you'll need to fill in your own external location URL.

-- CREATE STORAGE CREDENTIAL lab_credential ...;
-- CREATE EXTERNAL LOCATION lab_external_loc
--   URL 's3://my-bucket/lab/'
--   WITH STORAGE CREDENTIAL lab_credential;

CREATE TABLE lab_uc.hr.archived_employees (
  -- same schema as employees
  employee_id INT,
  name        STRING,
  region      STRING
)
USING DELTA
LOCATION 's3://my-bucket/lab/archived_employees';

-- External tables: UC owns the metadata; you own the storage.
-- Dropping with DROP TABLE removes the metadata but leaves the files behind.
```

## Cleanup

```sql
ALTER TABLE lab_uc.hr.employees DROP ROW FILTER;
ALTER TABLE lab_uc.hr.employees ALTER COLUMN email  DROP MASK;
ALTER TABLE lab_uc.hr.employees ALTER COLUMN salary DROP MASK;
DROP FUNCTION IF EXISTS lab_uc.hr.region_filter;
DROP FUNCTION IF EXISTS lab_uc.hr.mask_email;
DROP FUNCTION IF EXISTS lab_uc.hr.mask_salary;
DROP TABLE IF EXISTS lab_uc.hr.employees;
DROP TABLE IF EXISTS lab_uc.hr.archived_employees;
DROP VOLUME IF EXISTS lab_uc.hr.docs;
DROP SCHEMA IF EXISTS lab_uc.hr CASCADE;
-- Optionally: DROP CATALOG lab_uc CASCADE;
```

## Related Study Material

- [Unity Catalog basics (shared)](../shared/fundamentals/unity-catalog-basics.md)
- [Unity Catalog cheat sheet (shared)](../shared/cheat-sheets/unity-catalog-quick-ref.md)
- [DE Pro — Data Governance](../certifications/data-engineer-professional/08-data-governance/README.md)
- [DE Pro — Ensuring Data Security and Compliance](../certifications/data-engineer-professional/05-ensuring-data-security-and-compliance/README.md)
- [DA — Securing Data](../certifications/data-analyst-associate/07-securing-data/README.md)

---

**[← Previous: Medallion ingestion](./01-medallion-ingestion.md) | [↑ Back to Labs](./README.md) | [Next: Lakeflow Declarative Pipelines →](./03-lakeflow-declarative-pipelines.md)**

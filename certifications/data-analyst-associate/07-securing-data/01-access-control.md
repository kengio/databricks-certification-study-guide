---
title: Access Control & Security
type: study-material
tags:
  - access-control
  - security
  - permissions
  - rbac
---

# Access Control & Security

## Overview

Databricks protects data with Unity Catalog privileges, row filters and column masks, dynamic views, and workspace-level permissions (ACLs) on objects such as queries and dashboards. Section 9 of the October 2025 exam guide covers this; the newer topics (admin roles, ownership, volumes, row filters, column masks, and PII) are in [Ownership, Fine-Grained Access & PII](./02-ownership-fine-grained-access-and-pii.md).

> [!abstract]
>
> - Authentication: OAuth/SSO for people, service principals for automation, PATs where needed
> - Unity Catalog privileges: `USE CATALOG`, `USE SCHEMA`, `SELECT`, `MODIFY`, ... granted with `GRANT` and removed with `REVOKE`
> - Privileges on a catalog or schema are inherited by current and future child objects

> [!tip] What the Exam Tests
>
> - The privileges needed to read a table
> - `GRANT` / `REVOKE` syntax
> - Masking and filtering patterns for sensitive data

---

## Access Control Hierarchy

```mermaid
flowchart TD
    subgraph AC["Access Control Layers"]
        Workspace["Workspace Level<br/>Who can access workspace"]
        Catalog["Catalog Level<br/>Catalog visibility"]
        Schema["Schema Level<br/>Table access"]
        Object["Object Level<br/>Tables, Views"]
        Row["Row Level<br/>Dynamic filtering"]
        Column["Column Level<br/>Column masking"]
    end

    subgraph Auth["Authentication"]
        SSO["SSO / Azure AD"]
        SAML["SAML"]
        PAT["Personal Access Token"]
    end

    Auth --> Workspace
    Workspace --> Catalog
    Catalog --> Schema
    Schema --> Object
    Object --> Row
    Object --> Column
```

## Authentication Methods

### Personal Access Token (PAT)

Most common for programmatic access:

```bash
# Generate PAT (Account Settings → User Settings → Personal Access Tokens)

dapi1234567890abcdefghijklmnopqrstu

# Use in API calls

curl -X GET https://dbc-abc123.cloud.databricks.com/api/2.1/catalogs \
  -H "Authorization: Bearer dapi1234567890abcdefghijklmnopqrstu"

# Use in connections

connection = sql.connect(
    server_hostname="dbc-abc123.cloud.databricks.com",
    http_path="/sql/1.0/warehouses/abc123",
    auth_type="pat",
    token="dapi1234567890abcdefghijklmnopqrstu"
)
```

**Security:**

- Created per user
- Can be revoked individually
- Expires after 90 days (configurable)
- Should be rotated regularly

### Single Sign-On (SSO)

Enterprise authentication via identity provider:

```yaml
SSO Configuration:
  Identity Provider: Azure AD, Okta, Google Workspace
  Protocol: SAML 2.0 or OAuth 2.0
  Automatic provisioning: Yes
  MFA support: Yes

Workflow:
  1. User clicks Databricks link
  2. Redirected to SSO provider
  3. User authenticates
  4. Authority redirected back to Databricks
  5. Session created with enterprise identity
```

### Service Principals (M2M)

For automation and service-to-service authentication:

```python
# Service Principal Authentication

connection = sql.connect(
    server_hostname="dbc-abc123.cloud.databricks.com",
    http_path="/sql/1.0/warehouses/abc123",
    auth_type="service_principal",
    tenant_id="tenant-id",
    client_id="client-id",  # Service Principal ID
    client_secret="client-secret"  # Secret
)

# In automated pipeline (e.g., Airflow)

@task
def query_databricks():
    with sql.connect(...service_principal_auth...) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM prod.sales.orders")
        results = cursor.fetchall()
    return results
```

## Workspace-Level Permissions

### Workspace Entitlements and Object ACLs

Workspace admins manage users, groups, and entitlements. Workspace objects — notebooks, folders, queries, dashboards, alerts, Genie Agents, and SQL warehouses — are protected by access control lists (ACLs):

| Object | Permission levels |
| :--- | :--- |
| Queries, notebooks | CAN VIEW, CAN RUN, CAN EDIT, CAN MANAGE |
| Dashboards | CAN VIEW / CAN READ, CAN RUN, CAN EDIT, CAN MANAGE |
| Alerts | CAN RUN, CAN MANAGE |
| SQL warehouses | CAN VIEW, CAN MONITOR, CAN USE, IS OWNER, CAN MANAGE |

Workspace admins have CAN MANAGE on all workspace objects; creators get CAN MANAGE on what they create; objects inherit their folder's permissions. Object ACLs never replace Unity Catalog privileges on the data.

## Catalog-Level Permissions

### GRANT Statements

```sql
-- Grant permissions to user on catalog
GRANT SELECT ON CATALOG production TO `analyst@company.com`;

-- Grant to group
GRANT SELECT ON CATALOG production TO `analysts`;

-- Grant multiple privileges
GRANT SELECT, CREATE TABLE ON CATALOG production
TO `engineer@company.com`;

-- Grant with admin grant option (can grant to others)
GRANT SELECT ON CATALOG production
TO `admin@company.com` WITH GRANT OPTION;
```

### Privilege Types

| Privilege | Allows | Typical Users |
|-----------|--------|---|
| **SELECT** | Read tables, views, volumes | Analysts, BI Tools |
| **MODIFY** | INSERT, UPDATE, DELETE data | Engineers |
| **CREATE TABLE** | Create new tables/views | Data Engineers |
| **CREATE SCHEMA** | Create schemas | Data Engineers |
| **ALL PRIVILEGES** | Full control | Admins |
| **EXECUTE** | Run functions/procedures | Various |

### Permission Hierarchy

```text
GRANT SELECT ON CATALOG prod
├─ All schemas in catalog "prod"
│  ├─ All tables in schema
│  ├─ All views in schema
│  └─ All external locations
└─ Flows to all future schemas
```

## Schema-Level Permissions

```sql
-- Grant permission on specific schema
GRANT SELECT ON SCHEMA production.sales
TO `analyst@company.com`;

-- Grant to create tables in schema
GRANT CREATE TABLE ON SCHEMA production.sales
TO `engineer@company.com`;

-- View permissions on object
SHOW GRANTS ON SCHEMA production.sales;
-- Output: principal, privilege, created_by, etc.
```

## Table-Level Permissions

### Specific Table Access

```sql
-- Grant SELECT on one table
GRANT SELECT ON TABLE production.sales.orders
TO `analyst@company.com`;

-- Grant INSERT on table
GRANT INSERT ON TABLE production.sales.orders
TO `etl_job`;

-- Revoke specific privilege
REVOKE SELECT ON TABLE production.sales.orders
FROM `contractor@company.com`;

-- View table permissions
SHOW GRANTS ON TABLE production.sales.orders;
```

### View Permissions

```sql
-- Views inherit permissions from underlying tables
-- But can add ad-hoc security through restricted views

-- Create view with security (below)
CREATE VIEW production.sales.orders_masked AS
SELECT
    order_id,
    customer_id,
    CASE
        WHEN current_user() = 'admin@company.com' THEN amount
        ELSE NULL
    END as amount
FROM production.sales.orders;

-- Junior analyst sees NULL amount
-- Admin sees actual amount
SELECT * FROM production.sales.orders_masked;
-- Depending on user: NULL or actual value
```

## Row-Level Security (Dynamic Views)

### Restricting Data By User

```sql
-- Create view that filters based on user
CREATE VIEW production.sales.orders_user_filtered AS
SELECT
    order_id,
    customer_id,
    amount,
    region
FROM production.sales.orders
WHERE region IN (
    SELECT assigned_region
    FROM production.meta.user_regions
    WHERE user_email = current_user()
);

-- Midwest analyst sees only Midwest orders
SELECT * FROM production.sales.orders_user_filtered;
-- Returns ~50k rows for Midwest
```

### Implementation Pattern

```sql
-- 1. Create mapping table
CREATE TABLE production.meta.user_regions (
    user_email STRING,
    assigned_region STRING
);

INSERT INTO production.meta.user_regions VALUES
    ('alice@company.com', 'US-East'),
    ('bob@company.com', 'US-West'),
    ('admin@company.com', 'ALL');

-- 2. Create secure view
CREATE VIEW production.sales.orders_regional AS
SELECT o.*
FROM production.sales.orders o
WHERE o.region IN (
    SELECT assigned_region
    FROM production.meta.user_regions
    WHERE user_email = current_user()
) OR current_user() = 'admin@company.com';

-- 3. Grant access
REVOKE SELECT ON TABLE production.sales.orders
FROM `analyst@company.com`;

GRANT SELECT ON VIEW production.sales.orders_regional
TO `analyst@company.com`;
```

## Column-Level Security (Data Masking)

### Column Masking Policies

```sql
-- Create masking policy (approach varies by version)
-- Pattern: CASE statement in view

CREATE VIEW production.sales.customers_masked AS
SELECT
    customer_id,
    name,
    CASE
        WHEN current_user() IN ('admin@company.com', 'finance@company.com')
        THEN email
        ELSE '***@***'
    END as email,
    CASE
        WHEN current_user() IN ('admin@company.com', 'finance@company.com')
        THEN phone
        ELSE 'REDACTED'
    END as phone,
    address  -- Not masked
FROM production.sales.customers;

-- Finance team sees full email/phone
-- Other users see masked values
SELECT * FROM production.sales.customers_masked;
```

### Masking Strategy

Prefer a **column mask** on the table itself (a SQL UDF attached with `ALTER TABLE ... ALTER COLUMN ... SET MASK`) so the rule applies to every query. Check group membership with `is_account_group_member()`:

```sql
CREATE FUNCTION main.hr.mask_ssn(ssn STRING) RETURNS STRING
RETURN CASE WHEN is_account_group_member('hr_admins') THEN ssn
            ELSE CONCAT('***-**-', RIGHT(ssn, 4)) END;

ALTER TABLE main.hr.employees ALTER COLUMN ssn SET MASK main.hr.mask_ssn;
```

See [Ownership, Fine-Grained Access & PII](./02-ownership-fine-grained-access-and-pii.md).

## Current User Functions

### Checking Current User

```sql
-- Get the name of current user
SELECT current_user();
-- Output: user@company.com

-- Get current catalog
SELECT current_catalog();
-- OUTPUT: production

-- Get current schema
SELECT current_schema();
-- OUTPUT: sales

-- Check group membership (advanced)
SELECT * FROM system.principals
WHERE user_name = current_user();
```

## Best Practices

### Principle of Least Privilege

```sql
-- ❌ Too broad
GRANT ALL PRIVILEGES ON CATALOG production TO `user@company.com`;

-- ✅ Specific and minimal
GRANT SELECT ON SCHEMA production.sales TO `user@company.com`;
GRANT SELECT ON VIEW production.reports.daily_summary
TO `user@company.com`;
```

### Use Groups

```sql
-- Groups and their members are managed by admins
-- (account console, workspace admin settings, or SCIM provisioning)

-- Grant permission to group
GRANT SELECT ON CATALOG production TO `analysts`;
-- Automatically applies to all group members
```

### Audit Regularly

```sql
-- Who has access to a table?
SHOW GRANTS ON TABLE main.sales.orders;

-- Privileges across a catalog (information schema)
SELECT grantee, table_schema, table_name, privilege_type
FROM main.information_schema.table_privileges
WHERE table_schema = 'sales';
```

Grant and revoke events are also recorded in the audit log system table (`system.access.audit`), which admins can query.

### Secure PII

```sql
-- Identify PII columns
CREATE TABLE production.meta.pii_columns (
    catalog STRING,
    schema STRING,
    table_name STRING,
    column_name STRING,
    pii_type STRING  -- email, phone, ssn, etc.
);

-- Create masked views for public access
-- Keep unmasked tables for authorized use only
```

## Use Cases

- **PII Protection**: Using column-masking views with `current_user()` to let analysts query customer tables without exposing email addresses, phone numbers, or SSNs.
- **Team-based Access**: Creating groups (e.g., `sales_analysts`) and granting schema-level SELECT so new team members inherit the correct permissions automatically.

## Common Issues & Errors

### Grant Applied but Data Still Inaccessible

**Scenario:** Admin grants SELECT on a table but the user still gets permission denied.
**Fix:** Unity Catalog requires `USE CATALOG` + `USE SCHEMA` on parent objects in addition to the table-level grant.

## Exam Tips

- Protect PII with column masks on the table (or dynamic views); check groups with `is_account_group_member()`
- Row filters apply row-level security directly to a table with `ALTER TABLE ... SET ROW FILTER`
- `DENY` is not supported in Unity Catalog; remove access with `REVOKE`
- Service Principal (M2M) authentication is best for CI/CD pipelines and automation
- Use `SHOW GRANTS ON TABLE tablename` to verify who has access to a table

## Key Takeaways

- **Authentication**: PAT (programmatic), SSO (enterprise), Service Principals (automation)
- **Workspace permissions**: ACLs on queries, dashboards, notebooks, folders, warehouses
- **Catalog RBAC**: SELECT, MODIFY, CREATE TABLE, CREATE SCHEMA privileges
- **Hierarchy**: Permissions cascade (Catalog → Schema → Table → Row/Column)
- **Row-level**: Row filters on tables, or dynamic views
- **Column-level**: Column masks on tables, or dynamic views
- **Groups**: Simplify permission management across many users
- **Current user**: Use current_user(), current_catalog(), current_schema()

## Related Topics

- [Unity Catalog Basics](../../../shared/fundamentals/unity-catalog-basics.md) - Foundation for understanding access control in Unity Catalog
- [Unity Catalog Quick Reference](../../../shared/cheat-sheets/unity-catalog-quick-ref.md) - Quick reference for permissions and GRANT syntax
- [Unity Catalog](../05-understanding-databricks-platform/01-unity-catalog.md) - The governance platform that powers access control

## Official Documentation

- [Access control lists](https://docs.databricks.com/aws/en/security/auth/access-control/)
- [Unity Catalog privileges and securable objects](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/privileges)

---

**[↑ Back to Section](./README.md) | [Next: Ownership, Fine-Grained Access & PII →](./02-ownership-fine-grained-access-and-pii.md)**

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

Databricks SQL provides comprehensive access control through Unity Catalog RBAC, row-level and column-level security, and workspace-level permissions. These mechanisms protect sensitive data while enabling collaboration.

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

### User Roles

```sql
-- User
-- • Can create notebooks, clusters, jobs
-- • Limited to own workspace
-- • Cannot manage workspace settings

-- Advanced User
-- • Can create and manage clusters
-- • Can install libraries
-- • Limited admin capabilities

-- Admin
-- • Full workspace control
-- • Can manage workspace settings, users, policies
-- • Can create and modify SQL warehouses
-- • Access to all workspace resources
```

### Managing Workspace Access

```yaml
Workspace Settings:
  Users & Groups:
    → User email
    → Role (User, Advanced User, Admin)
    → Status (Active, Inactive)

  Groups:
    → Create custom groups
    → Assign members
    → Assign roles as group
```

## Catalog-Level Permissions

### GRANT Statements

```sql
-- Grant permissions to user on catalog
GRANT SELECT ON CATALOG production TO `analyst@company.com`;

-- Grant to group
GRANT SELECT ON CATALOG production TO `analysts`;

-- Grant multiple privileges
GRANT SELECT, CREATE_TABLE ON CATALOG production
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
| **CREATE_TABLE** | Create new tables/views | Data Engineers |
| **CREATE_SCHEMA** | Create schemas | Data Engineers |
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
GRANT CREATE_TABLE ON SCHEMA production.sales
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

```sql
-- Email masking
CASE
    WHEN has_privilege(current_user(), 'SENSITIVE')
    THEN email
    ELSE CONCATENATE(SUBSTRING(email, 1, 1), '***@company.com')
END as email

-- Phone masking
CASE
    WHEN has_privilege(current_user(), 'SENSITIVE')
    THEN phone
    ELSE CONCATENATE(SUBSTRING(phone, 1, 3), '-***-****')
END as phone

-- SSN masking
CASE
    WHEN has_privilege(current_user(), 'SENSITIVE')
    THEN ssn
    ELSE CONCATENATE('***-**-', SUBSTRING(ssn, 8, 4))
END as ssn
```

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
-- Create group one time
CREATE GROUP analysts;

-- Add members to group
ALTER GROUP analysts ADD MEMBER `alice@company.com`;
ALTER GROUP analysts ADD MEMBER `bob@company.com`;

-- Grant permission to group
GRANT SELECT ON CATALOG production TO `analysts`;
-- Automatically applies to all group members
```

### Audit Regularly

```sql
-- Who has what permissions?
SELECT *
FROM system.information_schema.role_principals;

-- Recent permission changes
SELECT
    timestamp,
    principal,
    action,
    resource_type
FROM system.audit_logs
WHERE action IN ('GRANT', 'REVOKE')
ORDER BY timestamp DESC
LIMIT 100;
```

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

- PII should be protected using masked views with CASE statements checking `current_user()`
- Row-level security cannot be applied directly to tables; use dynamic views that filter based on `current_user()`
- Service Principal (M2M) authentication is best for CI/CD pipelines and automation
- Use `SHOW GRANTS ON TABLE tablename` to verify who has access to a table

## Key Takeaways

- **Authentication**: PAT (programmatic), SSO (enterprise), Service Principals (automation)
- **Workspace permissions**: User, Advanced User, Admin roles
- **Catalog RBAC**: SELECT, MODIFY, CREATE_TABLE, CREATE_SCHEMA privileges
- **Hierarchy**: Permissions cascade (Catalog → Schema → Table → Row/Column)
- **Row-level**: Dynamic views using current_user()
- **Column-level**: CASE statements for masking sensitive data
- **Groups**: Simplify permission management across many users
- **Current user**: Use current_user(), current_catalog(), current_schema()

## Related Topics

- [Unity Catalog Basics](../../../shared/fundamentals/unity-catalog-basics.md) - Foundation for understanding access control in Unity Catalog
- [Unity Catalog Quick Reference](../../../shared/cheat-sheets/unity-catalog-quick-ref.md) - Quick reference for permissions and GRANT syntax
- [Unity Catalog](./02-unity-catalog.md) - The governance platform that powers access control

## Official Documentation

- [Databricks Access Control](https://docs.databricks.com/security/access-control/index.html)
- [Unity Catalog Privileges](https://docs.databricks.com/data-governance/unity-catalog/manage-privileges/privileges.html)

---

**[← Previous: Unity Catalog](./02-unity-catalog.md) | [↑ Back to Data Management in Databricks](./README.md)**

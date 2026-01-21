# Unity Catalog Quick Reference

## Three-Level Namespace

```text
catalog.schema.table
   │       │      │
   │       │      └── Tables, views, functions
   │       └── Database/schema (groups objects)
   └── Catalog (top-level container)
```

```sql
-- Full reference
SELECT * FROM my_catalog.my_schema.my_table;

-- Set defaults
USE CATALOG my_catalog;
USE SCHEMA my_schema;
SELECT * FROM my_table;
```

## Hierarchy

```text
Metastore (account-level)
    └── Catalog
            └── Schema
                    ├── Table (managed/external)
                    ├── View
                    ├── Function
                    └── Volume
```

| Level | Scope | Examples |
|-------|-------|----------|
| Metastore | Account | Linked to workspace(s) |
| Catalog | Organization | `prod`, `dev`, `staging` |
| Schema | Domain/Project | `sales`, `marketing`, `raw` |
| Objects | Data assets | Tables, views, volumes |

## GRANT Syntax

```sql
-- Grant on catalog
GRANT USE CATALOG ON CATALOG my_catalog TO `user@example.com`;
GRANT CREATE SCHEMA ON CATALOG my_catalog TO `data_engineers`;

-- Grant on schema
GRANT USE SCHEMA ON SCHEMA my_catalog.my_schema TO `analysts`;
GRANT CREATE TABLE ON SCHEMA my_catalog.my_schema TO `data_engineers`;

-- Grant on table
GRANT SELECT ON TABLE my_catalog.my_schema.my_table TO `analysts`;
GRANT MODIFY ON TABLE my_catalog.my_schema.my_table TO `data_engineers`;

-- Grant on all tables in schema
GRANT SELECT ON ALL TABLES IN SCHEMA my_catalog.my_schema TO `analysts`;

-- Grant to groups (recommended)
GRANT SELECT ON TABLE my_table TO `data_analysts_group`;
```

## REVOKE Syntax

```sql
-- Revoke specific privilege
REVOKE SELECT ON TABLE my_table FROM `user@example.com`;

-- Revoke all privileges
REVOKE ALL PRIVILEGES ON TABLE my_table FROM `user@example.com`;
```

## Permission Types

| Privilege | Description | Applies To |
|-----------|-------------|------------|
| `USE CATALOG` | Access catalog | Catalog |
| `USE SCHEMA` | Access schema | Schema |
| `SELECT` | Read data | Table, View |
| `MODIFY` | Insert/Update/Delete | Table |
| `CREATE TABLE` | Create tables | Schema |
| `CREATE SCHEMA` | Create schemas | Catalog |
| `CREATE CATALOG` | Create catalogs | Metastore |
| `ALL PRIVILEGES` | Full access | Any |

### Permission Inheritance

```text
CATALOG (USE CATALOG)
    │
    └── SCHEMA (USE SCHEMA)  ← Requires USE CATALOG on parent
            │
            └── TABLE (SELECT)  ← Requires USE SCHEMA on parent
```

**Important**: Access to a table requires `USE CATALOG` + `USE SCHEMA` + `SELECT`.

## External Locations

```sql
-- Create storage credential
CREATE STORAGE CREDENTIAL my_credential
WITH (
  AZURE_MANAGED_IDENTITY = 'managed-identity-id'
);

-- Create external location
CREATE EXTERNAL LOCATION my_location
URL 'abfss://container@storage.dfs.core.windows.net/path'
WITH (STORAGE CREDENTIAL my_credential);

-- Grant access
GRANT READ FILES ON EXTERNAL LOCATION my_location TO `data_engineers`;
GRANT WRITE FILES ON EXTERNAL LOCATION my_location TO `data_engineers`;
```

| External Location Privileges | Description |
|------------------------------|-------------|
| `READ FILES` | Read from external location |
| `WRITE FILES` | Write to external location |
| `CREATE EXTERNAL TABLE` | Create external tables |

## Dynamic Views (Row/Column Security)

```sql
-- Row-level security
CREATE VIEW secure_sales AS
SELECT *
FROM sales
WHERE region = current_user_attribute('region');

-- Column-level security (mask sensitive data)
CREATE VIEW secure_customers AS
SELECT
  customer_id,
  name,
  CASE
    WHEN is_account_group_member('pii_access')
    THEN email
    ELSE '***MASKED***'
  END AS email
FROM customers;

-- Using current_user()
CREATE VIEW my_orders AS
SELECT *
FROM orders
WHERE created_by = current_user();
```

### Security Functions

| Function | Description |
|----------|-------------|
| `current_user()` | Current user's email |
| `is_account_group_member('group')` | Check group membership |
| `is_member('group')` | Check workspace group |
| `current_user_attribute('attr')` | Get user attribute |

## Volumes (File Storage)

```sql
-- Create managed volume
CREATE VOLUME my_catalog.my_schema.my_volume;

-- Create external volume
CREATE EXTERNAL VOLUME my_catalog.my_schema.ext_volume
LOCATION 'abfss://container@storage.dfs.core.windows.net/path';

-- Access path
-- /Volumes/catalog/schema/volume/file.csv
```

```python
# Read from volume
df = spark.read.csv("/Volumes/my_catalog/my_schema/my_volume/data.csv")

# List files
dbutils.fs.ls("/Volumes/my_catalog/my_schema/my_volume/")
```

| Volume Type | Data Location | Use Case |
|-------------|---------------|----------|
| Managed | UC-managed storage | Default, governed |
| External | Customer storage | Existing data, compliance |

## Key System Tables

```sql
-- View all grants on an object
SHOW GRANTS ON TABLE my_catalog.my_schema.my_table;

-- View all grants to a principal
SHOW GRANTS TO `user@example.com`;

-- Audit logs (system.access.audit)
SELECT * FROM system.access.audit
WHERE action_name = 'getTable'
  AND request_params.full_name_arg = 'my_catalog.my_schema.my_table';
```

| System Table | Description |
|--------------|-------------|
| `system.access.audit` | Audit logs for UC actions |
| `system.information_schema.catalogs` | Catalog metadata |
| `system.information_schema.tables` | Table metadata |
| `system.information_schema.columns` | Column metadata |

## Ownership

```sql
-- View owner
DESCRIBE TABLE EXTENDED my_table;

-- Transfer ownership
ALTER TABLE my_table SET OWNER TO `new_owner@example.com`;

-- Owners have all privileges and can grant to others
```

## Common Exam Tips

1. Three-level namespace: `catalog.schema.table`
2. `USE CATALOG` + `USE SCHEMA` required before `SELECT` works
3. Metastore is account-level, not workspace-level
4. Grant to groups, not individuals (best practice)
5. Dynamic views enable row/column security without data duplication
6. `current_user()` and `is_account_group_member()` for security filters
7. Managed volumes in UC-managed storage; external volumes in customer storage
8. Volume path format: `/Volumes/catalog/schema/volume/path`
9. Owners can grant any privilege on their objects
10. External locations require storage credentials

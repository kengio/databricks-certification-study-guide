---
tags: [cheat-sheet, unity-catalog, governance, data-engineering]
---

# Unity Catalog Quick Reference

## Hierarchy

```text
Metastore
└── Catalog
    └── Schema (Database)
        ├── Table
        ├── View
        ├── Function
        └── Volume
```

## Permission Hierarchy

Accessing any object requires permissions on **all parent objects**:

```text
CATALOG (USE CATALOG)
    │
    └── SCHEMA (USE SCHEMA)  ← Requires USE CATALOG on parent
            │
            └── TABLE (SELECT)  ← Requires USE SCHEMA on parent
```

**Rule:** Reading a table always requires `USE CATALOG` + `USE SCHEMA` + `SELECT`.

## Three-Level Namespace

```sql
-- Full path
SELECT * FROM catalog_name.schema_name.table_name;

-- Set defaults
USE CATALOG catalog_name;
USE SCHEMA schema_name;
SELECT * FROM table_name;
```

## Creating Objects

### Catalogs

```sql
CREATE CATALOG catalog_name;
CREATE CATALOG IF NOT EXISTS catalog_name;
CREATE CATALOG catalog_name COMMENT 'Description';
```

### Schemas

```sql
CREATE SCHEMA catalog_name.schema_name;
CREATE SCHEMA IF NOT EXISTS schema_name;
CREATE SCHEMA schema_name
  MANAGED LOCATION 'abfss://container@storage/path';
```

### Tables

```sql
-- Managed table (data managed by Unity Catalog)
CREATE TABLE catalog.schema.table (
  id INT,
  name STRING
);

-- External table (data at external location)
CREATE TABLE catalog.schema.table (
  id INT,
  name STRING
)
LOCATION 'abfss://container@storage/path';
```

### Views

```sql
CREATE VIEW catalog.schema.view_name AS
SELECT * FROM catalog.schema.source_table;

-- Dynamic view for row-level security
CREATE VIEW catalog.schema.secure_view AS
SELECT * FROM catalog.schema.table
WHERE region = current_user();
```

### Volumes

```sql
-- Managed volume
CREATE VOLUME catalog.schema.volume_name;

-- External volume
CREATE EXTERNAL VOLUME catalog.schema.volume_name
LOCATION 'abfss://container@storage/path';
```

Volumes are accessed at runtime via the `/Volumes/` path format:

```python
# Path format: /Volumes/<catalog>/<schema>/<volume>/<file>
df = spark.read.csv("/Volumes/my_catalog/my_schema/my_volume/data.csv")
dbutils.fs.ls("/Volumes/my_catalog/my_schema/my_volume/")
```

Requires `READ FILES` (or `WRITE FILES`) privilege on the volume.

## Permissions

### Privilege Types

| Privilege         | Applies To  | Description                         |
| ----------------- | ----------- | ----------------------------------- |
| `USE CATALOG`     | Catalog     | Access the catalog                  |
| `USE SCHEMA`      | Schema      | Access the schema                   |
| `SELECT`          | Table, View | Read data                           |
| `MODIFY`          | Table       | Write data (INSERT, UPDATE, DELETE) |
| `CREATE TABLE`    | Schema      | Create tables in schema             |
| `CREATE VIEW`     | Schema      | Create views in schema              |
| `CREATE FUNCTION` | Schema      | Create functions in schema          |
| `CREATE VOLUME`   | Schema      | Create volumes in schema            |
| `ALL PRIVILEGES`  | Any         | Full access                         |

### Grant Syntax

```sql
-- Grant to user
GRANT SELECT ON TABLE catalog.schema.table TO `user@email.com`;

-- Grant to group
GRANT SELECT ON TABLE catalog.schema.table TO `group_name`;

-- Grant to service principal
GRANT SELECT ON TABLE catalog.schema.table TO `app-id`;

-- Grant on schema (applies to all objects)
GRANT USE SCHEMA ON SCHEMA catalog.schema TO `user@email.com`;
GRANT SELECT ON SCHEMA catalog.schema TO `user@email.com`;

-- Grant on catalog
GRANT USE CATALOG ON CATALOG catalog_name TO `user@email.com`;

-- Grant all privileges
GRANT ALL PRIVILEGES ON TABLE catalog.schema.table TO `user@email.com`;

-- Bulk grant on all tables in a schema
GRANT SELECT ON ALL TABLES IN SCHEMA my_catalog.my_schema TO `analysts`;

-- Grant with delegation rights
GRANT SELECT ON TABLE catalog.schema.table TO `user@email.com` WITH GRANT OPTION;
```

### Revoke Syntax

```sql
REVOKE SELECT ON TABLE catalog.schema.table FROM `user@email.com`;
REVOKE ALL PRIVILEGES ON SCHEMA catalog.schema FROM `user@email.com`;
```

### Show Grants

```sql
SHOW GRANTS ON TABLE catalog.schema.table;
SHOW GRANTS TO `user@email.com`;
SHOW GRANTS ON CATALOG catalog_name;
```

## Ownership

```sql
-- Transfer ownership
ALTER TABLE catalog.schema.table SET OWNER TO `new_owner@email.com`;
ALTER SCHEMA catalog.schema SET OWNER TO `new_owner@email.com`;
ALTER CATALOG catalog_name SET OWNER TO `new_owner@email.com`;
```

## Row & Column Level Security

### Row-Level (Dynamic Views)

```sql
CREATE VIEW catalog.schema.filtered_data AS
SELECT * FROM catalog.schema.source_table
WHERE department = current_user()
   OR is_account_group_member('admins');
```

### Column-Level (Column Masking)

```sql
-- Create masking function
CREATE FUNCTION catalog.schema.mask_email(email STRING)
RETURNS STRING
RETURN CASE
  WHEN is_account_group_member('admins') THEN email
  ELSE regexp_replace(email, '(.*)@', '***@')
END;

-- Apply to column
ALTER TABLE catalog.schema.table
ALTER COLUMN email SET MASK catalog.schema.mask_email;
```

## External Locations & Storage Credentials

```sql
-- Create storage credential
CREATE STORAGE CREDENTIAL credential_name
WITH (
  AZURE_MANAGED_IDENTITY = '<managed-identity-id>'
);

-- Create external location
CREATE EXTERNAL LOCATION location_name
URL 'abfss://container@storage.dfs.core.windows.net/path'
WITH (STORAGE CREDENTIAL credential_name);

-- Grant access
GRANT READ FILES ON EXTERNAL LOCATION location_name TO `user@email.com`;
GRANT WRITE FILES ON EXTERNAL LOCATION location_name TO `user@email.com`;
```

## Delta Sharing

```sql
-- Create share
CREATE SHARE share_name;

-- Add table to share
ALTER SHARE share_name ADD TABLE catalog.schema.table;

-- Create recipient
CREATE RECIPIENT recipient_name;

-- Grant share to recipient
GRANT SELECT ON SHARE share_name TO RECIPIENT recipient_name;
```

## Information Schema

The `information_schema` and `system` schemas provide metadata and audit access:

```sql
-- Tables in a catalog
SELECT table_name, table_type, created
FROM system.information_schema.tables
WHERE table_catalog = 'my_catalog' AND table_schema = 'my_schema';

-- Column details
SELECT column_name, data_type
FROM system.information_schema.columns
WHERE table_catalog = 'my_catalog' AND table_name = 'my_table';

-- Grants on a table
SELECT grantee, privilege_type
FROM system.information_schema.table_privileges
WHERE table_catalog = 'my_catalog' AND table_name = 'my_table';

-- Audit log (who accessed what, when)
SELECT user_identity.email, action_name, event_time
FROM system.access.audit
WHERE action_name = 'getTable'
  AND request_params.full_name_arg = 'my_catalog.my_schema.my_table';
```

| System Table | Description |
| :--- | :--- |
| `system.information_schema.catalogs` | All catalogs visible to the user |
| `system.information_schema.tables` | Table metadata (type, owner, created) |
| `system.information_schema.columns` | Column metadata per table |
| `system.information_schema.table_privileges` | Privilege grants per table |
| `system.access.audit` | Full UC audit log |

## Key Functions

| Function | Description |
| :--- | :--- |
| `current_user()` | Current user's email |
| `is_account_group_member('group')` | Check account-level group membership |
| `is_member('group')` | Check workspace-level group membership |
| `current_user_attribute('attr')` | Get a custom user attribute value |

## Managed vs External

| Aspect        | Managed          | External        |
| ------------- | ---------------- | --------------- |
| Data location | Controlled by UC | User-specified  |
| DROP TABLE    | Deletes data     | Keeps data      |
| Best for      | New tables       | Existing data   |

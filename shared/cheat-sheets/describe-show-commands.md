---
tags: [cheat-sheet, sql, metadata, data-engineering]
---

# DESCRIBE and SHOW Commands Cheat Sheet

Quick reference for inspecting metadata in Databricks SQL.

## Quick Reference

| Command | Use Case | Key Output |
| ------- | -------- | ---------- |
| `DESCRIBE TABLE` | Column schema | Column names, types, comments |
| `DESCRIBE EXTENDED` | Full metadata | Schema + properties, location, owner |
| `DESCRIBE HISTORY` | Version history | Operations, timestamps, versions |
| `DESCRIBE DETAIL` | Physical details | File count, size, partitions |
| `SHOW TABLES` | List tables | Table names in schema |
| `SHOW SCHEMAS` | List schemas | Schema names in catalog |
| `SHOW CREATE TABLE` | Get DDL | CREATE TABLE statement |
| `SHOW GRANTS` | Check permissions | Principal, action, object |
| `SHOW TBLPROPERTIES` | Table properties | Property key-value pairs |

## DESCRIBE Commands

### DESCRIBE TABLE

**Use case:** Check column names, data types, and comments.

```sql
DESCRIBE TABLE catalog.schema.orders;
-- or
DESCRIBE catalog.schema.orders;
```

**Example output:**

```text
col_name        data_type    comment
--------------  -----------  ------------------
order_id        BIGINT       Primary key
customer_id     BIGINT       FK to customers
order_date      DATE         Date of order
amount          DECIMAL(10,2) Order total
status          STRING       Order status
```

### DESCRIBE EXTENDED

**Use case:** Get full metadata including table properties, location, owner, and storage info.

```sql
DESCRIBE EXTENDED catalog.schema.orders;
-- or
DESCRIBE TABLE EXTENDED catalog.schema.orders;
```

**Example output:**

```text
col_name                    data_type                    comment
--------------------------  ---------------------------  ------------------
order_id                    BIGINT                       Primary key
customer_id                 BIGINT                       FK to customers
amount                      DECIMAL(10,2)                Order total

# Detailed Table Information
Catalog                     main
Database                    sales
Table                       orders
Owner                       user@company.com
Created Time                2025-01-01 10:00:00
Last Access                 2025-01-15 14:30:00
Type                        MANAGED
Location                    dbfs:/user/hive/warehouse/sales.db/orders
Provider                    delta
Table Properties            [delta.enableChangeDataFeed=true]
```

### DESCRIBE HISTORY

**Use case:** View version history for time travel, auditing, or finding a version to restore.

```sql
DESCRIBE HISTORY catalog.schema.orders;

-- Limit results
DESCRIBE HISTORY catalog.schema.orders LIMIT 10;
```

**Example output:**

```text
version  timestamp            userId           userName        operation  operationParameters
-------  -------------------  ---------------  --------------  ---------  -------------------
5        2025-01-15 14:30:00  user@company.com user@company.com MERGE     {predicate -> id = id}
4        2025-01-14 10:00:00  user@company.com user@company.com WRITE     {mode -> Append}
3        2025-01-13 09:00:00  user@company.com user@company.com OPTIMIZE  {zOrderBy -> [customer_id]}
2        2025-01-12 08:00:00  user@company.com user@company.com WRITE     {mode -> Append}
1        2025-01-11 07:00:00  user@company.com user@company.com CREATE    {}
```

**Key columns:**

| Column | Description |
| ------ | ----------- |
| `version` | Delta version number (for time travel) |
| `timestamp` | When operation occurred |
| `operation` | WRITE, MERGE, DELETE, OPTIMIZE, etc. |
| `operationParameters` | Details about the operation |
| `operationMetrics` | Rows affected, files added/removed |

### DESCRIBE DETAIL

**Use case:** Check physical storage details - file count, size, partitioning. Essential for optimization decisions.

```sql
DESCRIBE DETAIL catalog.schema.orders;
```

**Example output:**

```text
format  id                                    name    location                              partitionColumns  numFiles  sizeInBytes  properties
------  ------------------------------------  ------  ------------------------------------  ----------------  --------  -----------  ----------
delta   abc123-def456-...                     orders  dbfs:/user/hive/warehouse/.../orders  [order_date]           42   1073741824  {delta...}
```

**Key columns:**

| Column | Description | Use For |
| ------ | ----------- | ------- |
| `format` | Table format (delta) | Verify Delta table |
| `numFiles` | Number of data files | Check if OPTIMIZE needed |
| `sizeInBytes` | Total table size | Capacity planning |
| `partitionColumns` | Partition columns | Understand data layout |

**Tip:** Check if OPTIMIZE is needed:

```sql
SELECT numFiles, sizeInBytes/1024/1024/1024 AS size_gb
FROM (DESCRIBE DETAIL catalog.schema.orders);
-- If numFiles is high and size_gb is small, run OPTIMIZE
```

## SHOW Commands

### SHOW CATALOGS

**Use case:** List all catalogs you have access to.

```sql
SHOW CATALOGS;
```

**Example output:**

```text
catalog
-----------
hive_metastore
main
dev
prod
```

### SHOW SCHEMAS / SHOW DATABASES

**Use case:** List schemas in a catalog.

```sql
SHOW SCHEMAS;                    -- Current catalog
SHOW SCHEMAS IN main;            -- Specific catalog
SHOW DATABASES IN main;          -- Same as SHOW SCHEMAS
```

**Example output:**

```text
databaseName
------------
default
bronze
silver
gold
```

### SHOW TABLES

**Use case:** List tables in a schema.

```sql
SHOW TABLES;                           -- Current schema
SHOW TABLES IN main.silver;            -- Specific schema
SHOW TABLES IN main.silver LIKE '*orders*';  -- Filter by pattern
```

**Example output:**

```text
database    tableName       isTemporary
----------  --------------  -----------
silver      orders          false
silver      orders_history  false
silver      customers       false
```

### SHOW VIEWS

**Use case:** List views in a schema.

```sql
SHOW VIEWS IN main.gold;
SHOW VIEWS IN main.gold LIKE '*summary*';
```

**Example output:**

```text
database    viewName            isTemporary
----------  ------------------  -----------
gold        daily_summary       false
gold        monthly_summary     false
```

### SHOW COLUMNS

**Use case:** List columns in a table (simpler than DESCRIBE).

```sql
SHOW COLUMNS IN catalog.schema.orders;
SHOW COLUMNS IN catalog.schema.orders LIKE '*id*';
```

**Example output:**

```text
col_name
-----------
order_id
customer_id
order_date
amount
status
```

### SHOW CREATE TABLE

**Use case:** Get the DDL statement to recreate a table.

```sql
SHOW CREATE TABLE catalog.schema.orders;
```

**Example output:**

```text
createtab_stmt
---------------------------------------------------------------------
CREATE TABLE main.sales.orders (
  order_id BIGINT COMMENT 'Primary key',
  customer_id BIGINT COMMENT 'FK to customers',
  order_date DATE COMMENT 'Date of order',
  amount DECIMAL(10,2) COMMENT 'Order total',
  status STRING COMMENT 'Order status'
)
USING delta
PARTITIONED BY (order_date)
LOCATION 'dbfs:/user/hive/warehouse/sales.db/orders'
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true',
  'delta.minReaderVersion' = '1',
  'delta.minWriterVersion' = '2'
)
```

### SHOW TBLPROPERTIES

**Use case:** View table properties (Delta features, settings).

```sql
SHOW TBLPROPERTIES catalog.schema.orders;

-- Specific property
SHOW TBLPROPERTIES catalog.schema.orders ('delta.enableChangeDataFeed');
```

**Example output:**

```text
key                              value
-------------------------------  -------
delta.enableChangeDataFeed       true
delta.minReaderVersion           1
delta.minWriterVersion           2
delta.autoOptimize.optimizeWrite true
```

### SHOW GRANTS

**Use case:** Check permissions on objects.

```sql
-- Grants on a table
SHOW GRANTS ON TABLE catalog.schema.orders;

-- Grants to a user
SHOW GRANTS TO `user@company.com`;

-- Grants on a catalog
SHOW GRANTS ON CATALOG main;

-- Grants on a schema
SHOW GRANTS ON SCHEMA main.silver;
```

**Example output:**

```text
principal           action_type  object_type  object_name
------------------  -----------  -----------  ----------------------
user@company.com    SELECT       TABLE        main.silver.orders
user@company.com    MODIFY       TABLE        main.silver.orders
data_engineers      ALL_PRIVILEGES TABLE      main.silver.orders
```

### SHOW VOLUMES

**Use case:** List Unity Catalog volumes.

```sql
SHOW VOLUMES IN main.default;
```

**Example output:**

```text
database    volumeName    volumeType
----------  ------------  ----------
default     raw_files     MANAGED
default     external_data EXTERNAL
```

## Decision Guide

| I want to... | Use this command |
| ------------ | ---------------- |
| See column names and data types | `DESCRIBE TABLE` |
| Find table location and owner | `DESCRIBE EXTENDED` |
| Find a version for time travel | `DESCRIBE HISTORY` |
| Check if table needs OPTIMIZE | `DESCRIBE DETAIL` |
| List all tables in a schema | `SHOW TABLES IN schema` |
| Get DDL to recreate a table | `SHOW CREATE TABLE` |
| Check who has access to a table | `SHOW GRANTS ON TABLE` |
| See Delta table properties | `SHOW TBLPROPERTIES` |
| Find partition columns | `DESCRIBE DETAIL` |
| Audit recent changes | `DESCRIBE HISTORY` |

## Common Patterns

### Check Table Health

```sql
-- File count and size
DESCRIBE DETAIL my_table;

-- Recent operations
DESCRIBE HISTORY my_table LIMIT 5;

-- Table properties
SHOW TBLPROPERTIES my_table;
```

### Time Travel Workflow

```sql
-- 1. Find the version you need
DESCRIBE HISTORY my_table;

-- 2. Query that version
SELECT * FROM my_table VERSION AS OF 3;

-- 3. Or restore to that version
RESTORE TABLE my_table TO VERSION AS OF 3;
```

### Permission Audit

```sql
-- Check table permissions
SHOW GRANTS ON TABLE catalog.schema.table;

-- Check user's permissions
SHOW GRANTS TO `user@company.com`;

-- Check schema permissions
SHOW GRANTS ON SCHEMA catalog.schema;
```

## Related Topics

- [Delta Lake Commands](delta-lake-commands.md) - OPTIMIZE, VACUUM, MERGE
- [Unity Catalog Quick Reference](./unity-catalog-quick-ref.md) - Permissions and grants
- [SQL Functions](sql-functions.md) - Common SQL functions

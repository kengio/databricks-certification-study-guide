---
tags:
  - databricks
  - unity-catalog
  - fundamentals
aliases:
  - Unity Catalog
---

# Unity Catalog Basics

Unity Catalog is Databricks' unified governance solution for data and AI assets. It provides centralized access control, auditing, lineage, and data discovery across all workspaces.

## Overview

Unity Catalog provides:

- **Unified Governance** - Single place to manage permissions for all data assets
- **Data Discovery** - Search and browse data across workspaces
- **Audit Logging** - Track who accessed what data and when
- **Data Lineage** - Visualize data flow from source to consumption
- **Centralized Access Control** - Fine-grained permissions at any level

## Three-Level Namespace

Unity Catalog uses a three-level namespace: **Catalog → Schema → Object**

```mermaid
flowchart TB
    subgraph Metastore["METASTORE (one per region)"]
        subgraph Prod["CATALOG: prod"]
            subgraph Bronze["SCHEMA: bronze"]
                T1[TABLE: orders]
                V1[VIEW: orders_summary]
                F1[FUNCTION: parse_json]
            end
            subgraph Silver["SCHEMA: silver"]
                T2[TABLE: customers]
            end
        end
        Cat2["CATALOG: dev"]
        Cat3["CATALOG: sandbox"]
    end
```

![Unity Catalog Explorer showing namespace hierarchy](../../images/databricks-ui/catalog-explorer/namespace-hierarchy.png)

*Catalog Explorer showing the three-level namespace structure*

### Naming Convention

```sql
-- Full three-level name
catalog.schema.table

-- Examples
prod.bronze.raw_orders
dev.silver.customers
main.gold.daily_sales
```

## Key Concepts

### Metastore

The top-level container for all data assets. Typically one per cloud region.

- Contains catalogs, storage credentials, external locations
- Links to cloud storage for managed tables
- Attached to Databricks workspaces

### Catalog

A grouping of schemas (databases). Common patterns:

| Pattern     | Example Catalogs                     |
| ----------- | ------------------------------------ |
| Environment | `prod`, `dev`, `staging`             |
| Domain      | `sales`, `marketing`, `finance`      |
| Team        | `data_engineering`, `data_science`   |

```sql
-- Create a catalog
CREATE CATALOG IF NOT EXISTS prod;

-- List catalogs
SHOW CATALOGS;

-- Use a catalog
USE CATALOG prod;
```

### Schema (Database)

A grouping of tables, views, and functions.

```sql
-- Create a schema
CREATE SCHEMA IF NOT EXISTS prod.bronze;

-- List schemas
SHOW SCHEMAS IN prod;

-- Use a schema
USE SCHEMA prod.bronze;
-- or
USE prod.bronze;
```

### Tables

#### Managed Tables

- Unity Catalog manages both metadata and data files
- Data stored in metastore's managed storage location
- Dropping the table deletes the data

```sql
-- Create managed table
CREATE TABLE prod.silver.customers (
  customer_id INT,
  name STRING,
  email STRING
);
```

#### External Tables

- Unity Catalog manages only metadata
- Data stored in external location you specify
- Dropping the table keeps the data

```sql
-- Create external table
CREATE TABLE prod.bronze.raw_orders
LOCATION 's3://my-bucket/raw/orders/'
AS SELECT * FROM json.`s3://my-bucket/landing/orders/`;
```

### Views

```sql
-- Standard view
CREATE VIEW prod.gold.active_customers AS
SELECT * FROM prod.silver.customers
WHERE status = 'active';

-- Materialized view (for SQL warehouses)
CREATE MATERIALIZED VIEW prod.gold.customer_summary AS
SELECT customer_id, COUNT(*) as order_count
FROM prod.silver.orders
GROUP BY customer_id;
```

### Functions

```sql
-- Create a function
CREATE FUNCTION prod.common.mask_email(email STRING)
RETURNS STRING
RETURN CONCAT(LEFT(email, 2), '****@', SPLIT(email, '@')[1]);

-- Use the function
SELECT prod.common.mask_email(email) FROM prod.silver.customers;
```

## Access Control

### Principals

| Principal Type    | Description             |
| ----------------- | ----------------------- |
| User              | Individual user account |
| Group             | Collection of users     |
| Service Principal | Application identity    |

### Privileges

| Privilege        | Description                 |
| ---------------- | --------------------------- |
| `USE CATALOG`    | Access catalog              |
| `USE SCHEMA`     | Access schema               |
| `SELECT`         | Read table/view data        |
| `MODIFY`         | Insert, update, delete data |
| `CREATE TABLE`   | Create tables in schema     |
| `CREATE SCHEMA`  | Create schemas in catalog   |
| `ALL PRIVILEGES` | All available privileges    |

### Granting Permissions

```sql
-- Grant catalog access
GRANT USE CATALOG ON CATALOG prod TO `data_analysts`;

-- Grant schema access
GRANT USE SCHEMA ON SCHEMA prod.gold TO `data_analysts`;

-- Grant table access
GRANT SELECT ON TABLE prod.gold.daily_sales TO `data_analysts`;

-- Grant to all tables in schema
GRANT SELECT ON SCHEMA prod.gold TO `data_analysts`;

-- Revoke access
REVOKE SELECT ON TABLE prod.gold.daily_sales FROM `data_analysts`;

-- Show grants
SHOW GRANTS ON TABLE prod.gold.daily_sales;
```

### Ownership

Every securable object has an owner with full control.

```sql
-- Transfer ownership
ALTER TABLE prod.silver.customers
SET OWNER TO `data_engineering`;

-- Check ownership
DESCRIBE TABLE EXTENDED prod.silver.customers;
```

## External Locations and Credentials

### Storage Credentials

Manage authentication to cloud storage.

```sql
-- Create storage credential (admin only)
CREATE STORAGE CREDENTIAL my_s3_cred
WITH (
  AWS_IAM_ROLE = 'arn:aws:iam::123456789:role/databricks-access'
);
```

### External Locations

Map cloud storage paths to Unity Catalog.

```sql
-- Create external location
CREATE EXTERNAL LOCATION my_external_loc
URL 's3://my-bucket/external-data/'
WITH (STORAGE CREDENTIAL my_s3_cred);

-- Grant access
GRANT READ FILES ON EXTERNAL LOCATION my_external_loc TO `data_engineers`;
```

## Data Lineage

Unity Catalog automatically tracks lineage:

- Table-to-table dependencies
- Column-level lineage
- Notebook and job relationships

View lineage in the Databricks UI:

1. Navigate to a table in the Catalog Explorer
2. Click the "Lineage" tab
3. See upstream (sources) and downstream (consumers)

![Unity Catalog lineage visualization](../../images/databricks-ui/catalog-explorer/lineage-graph.png)

*Lineage graph showing upstream and downstream dependencies*

## Data Discovery

### Search

```sql
-- Search for tables (UI feature, or use information_schema)
SELECT *
FROM system.information_schema.tables
WHERE table_name LIKE '%customer%';
```

### Tags and Comments

```sql
-- Add table comment
COMMENT ON TABLE prod.silver.customers IS 'Customer master data from CRM';

-- Add column comment
ALTER TABLE prod.silver.customers
ALTER COLUMN email COMMENT 'Customer email address, PII';

-- Add tags (for classification)
ALTER TABLE prod.silver.customers
SET TAGS ('pii' = 'true', 'owner' = 'data-team');
```

## Common Patterns

### Environment Isolation

```mermaid
flowchart LR
    subgraph Envs["Environment Pattern"]
        prod[prod]
        staging[staging]
        dev[dev]
        sandbox[sandbox]
    end
```

### Data Mesh

```mermaid
flowchart LR
    subgraph Domains["Domain Pattern"]
        sales[sales]
        marketing[marketing]
        finance[finance]
        shared[shared]
    end
```

## Use Cases

| Use Case                 | How Unity Catalog Helps                       |
| ------------------------ | --------------------------------------------- |
| Compliance (GDPR, CCPA)  | Audit logs, access control, data lineage      |
| Data Discovery           | Search, tags, comments, lineage visualization |
| Multi-team Collaboration | Fine-grained permissions, catalog isolation   |
| Data Quality             | Lineage tracking, centralized metadata        |
| ML Governance            | Track models, features, and training data     |

## Common Issues

| Issue                       | Cause                              | Solution                                |
| --------------------------- | ---------------------------------- | --------------------------------------- |
| `PERMISSION_DENIED`         | Missing grants                     | Grant required privilege to user/group  |
| `CATALOG_NOT_FOUND`         | Catalog doesn't exist or no access | Check catalog exists, grant USE CATALOG |
| `TABLE_NOT_FOUND`           | Wrong namespace or no access       | Use full three-level name, check grants |
| External table read fails   | Missing external location access   | Grant READ FILES on external location   |

## Migration from Hive Metastore

```sql
-- Upgrade table from Hive metastore to Unity Catalog
CREATE TABLE prod.silver.customers
AS SELECT * FROM hive_metastore.default.customers;

-- Or use SYNC to keep in sync during migration
```

## Practice Questions

### Question 1: Three-Level Namespace

**Question**: What is the correct three-level namespace for referencing a table in Unity Catalog?

A) `workspace.schema.table`
B) `catalog.schema.table`
C) `database.schema.table`
D) `metastore.catalog.table`

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog uses a three-level namespace: `catalog.schema.table`. The catalog is the top-level container, schemas (databases) organize objects within a catalog, and tables/views/functions are the securable objects within a schema.

---

### Question 2: Managed vs External Tables

**Question**: What happens when you DROP a managed table in Unity Catalog?

A) Only the metadata is deleted; data files remain
B) Both metadata and underlying data files are deleted
C) The table is archived but can be restored
D) The data is moved to a recycle bin for 30 days

> [!success]- Answer
> **Correct Answer: B**
>
> When a managed table is dropped, Unity Catalog deletes both the metadata and the underlying data files. For external tables, only the metadata is removed; data files remain at the external location. This is a key distinction for the exam.

---

### Question 3: Granting Access

**Question**: A data analyst needs to read data from tables in the `prod.sales` schema. What is the minimum set of grants required?

A) `GRANT SELECT ON SCHEMA prod.sales TO analyst`
B) `GRANT USE CATALOG ON CATALOG prod TO analyst` and `GRANT USE SCHEMA ON SCHEMA prod.sales TO analyst` and `GRANT SELECT ON SCHEMA prod.sales TO analyst`
C) `GRANT ALL PRIVILEGES ON CATALOG prod TO analyst`
D) `GRANT READ ON SCHEMA prod.sales TO analyst`

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog requires explicit grants at each level. To read tables, a user needs: `USE CATALOG` on the catalog, `USE SCHEMA` on the schema, and `SELECT` on the schema or individual tables. Without `USE CATALOG` and `USE SCHEMA`, the user cannot navigate to the tables even with `SELECT` granted.

---

### Question 4: Data Lineage

**Question**: What does Unity Catalog's data lineage feature track?

A) Only table-level dependencies
B) Column-level data flow across tables, notebooks, and jobs
C) Only SQL query history
D) Storage-level file access patterns

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog automatically captures column-level lineage, tracking how data flows from source columns to target columns across tables, notebooks, workflows, and dashboards. This is captured automatically without requiring manual configuration.

## Referenced By

- [Data Engineer Associate](../../certifications/data-engineer-associate/README.md)
- [Data Engineer Professional](../../certifications/data-engineer-professional/README.md)
- [Data Analyst Associate](../../certifications/data-analyst-associate/README.md)
- [ML Professional](../../certifications/ml-professional/README.md)
- [GenAI Engineer Associate](../../certifications/genai-engineer-associate/README.md)

## Related Topics

- [Delta Lake Basics](delta-lake-basics.md)
- [Databricks Workspace](databricks-workspace.md)
- [Security and Governance](../../certifications/data-engineer-professional/04-security-governance/README.md)

## Official Documentation

- [Unity Catalog Documentation](https://docs.databricks.com/data-governance/unity-catalog/index.html)
- [Unity Catalog Best Practices](https://docs.databricks.com/data-governance/unity-catalog/best-practices.html)
- [Privileges and Securable Objects](https://docs.databricks.com/data-governance/unity-catalog/manage-privileges/index.html)

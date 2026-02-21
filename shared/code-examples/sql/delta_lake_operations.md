---
tags:
  - databricks
  - code-examples
  - delta-lake
  - sql
---

# Delta Lake Operations — SQL

SQL examples for Delta Lake operations. Run in a Databricks SQL editor or notebook; replace
`my_catalog.my_schema` with your actual catalog and schema names.

## Create Delta Tables

```sql
-- Managed table
CREATE TABLE IF NOT EXISTS my_catalog.my_schema.products (
    product_id BIGINT,
    name STRING,
    category STRING,
    price DECIMAL(10,2),
    updated_at TIMESTAMP
)
USING DELTA
COMMENT 'Product catalog';

-- Table with liquid clustering
CREATE TABLE IF NOT EXISTS my_catalog.my_schema.orders (
    order_id BIGINT,
    customer_id BIGINT,
    product_id BIGINT,
    quantity INT,
    total DECIMAL(10,2),
    order_date DATE
)
USING DELTA
CLUSTER BY (customer_id, order_date);

-- CTAS (Create Table As Select)
CREATE TABLE my_catalog.my_schema.high_value_orders AS
SELECT * FROM my_catalog.my_schema.orders
WHERE total > 1000;
```

## Insert Data

```sql
-- Insert values
INSERT INTO my_catalog.my_schema.products
VALUES
    (1, 'Widget A', 'Electronics', 29.99, current_timestamp()),
    (2, 'Widget B', 'Electronics', 49.99, current_timestamp()),
    (3, 'Gadget C', 'Accessories', 14.99, current_timestamp());

-- Insert from select
INSERT INTO my_catalog.my_schema.orders
SELECT * FROM my_catalog.staging.new_orders;

-- Overwrite entire table
INSERT OVERWRITE my_catalog.my_schema.products
SELECT * FROM my_catalog.staging.products_full;
```

## Update and Delete

```sql
-- Update records
UPDATE my_catalog.my_schema.products
SET price = 34.99, updated_at = current_timestamp()
WHERE product_id = 1;

-- Delete records
DELETE FROM my_catalog.my_schema.products
WHERE category = 'Discontinued';
```

## Merge (Upsert)

```sql
MERGE INTO my_catalog.my_schema.products AS target
USING my_catalog.staging.product_updates AS source
ON target.product_id = source.product_id
WHEN MATCHED THEN
    UPDATE SET
        target.name = source.name,
        target.price = source.price,
        target.updated_at = current_timestamp()
WHEN NOT MATCHED THEN
    INSERT (product_id, name, category, price, updated_at)
    VALUES (source.product_id, source.name, source.category, source.price, current_timestamp())
WHEN NOT MATCHED BY SOURCE THEN
    DELETE;
```

## Time Travel

```sql
-- Query by version
SELECT * FROM my_catalog.my_schema.products VERSION AS OF 3;

-- Query by timestamp
SELECT * FROM my_catalog.my_schema.products TIMESTAMP AS OF '2025-06-01 10:00:00';

-- View table history
DESCRIBE HISTORY my_catalog.my_schema.products;

-- Restore to previous version
RESTORE TABLE my_catalog.my_schema.products TO VERSION AS OF 3;
```

## Optimize and Vacuum

```sql
-- Compact small files into larger ones (target: ~1 GB)
OPTIMIZE my_catalog.my_schema.orders;

-- Compact with Z-ORDER indexing
OPTIMIZE my_catalog.my_schema.orders
ZORDER BY (customer_id);

-- Remove old data files (default: 7 days retention)
VACUUM my_catalog.my_schema.orders;

-- Vacuum with custom retention
VACUUM my_catalog.my_schema.orders RETAIN 168 HOURS;

-- Check file metrics after OPTIMIZE
DESCRIBE DETAIL my_catalog.my_schema.orders;
```

## Change Data Feed (CDF)

```sql
-- Enable CDF on a table
ALTER TABLE my_catalog.my_schema.orders
SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');

-- Read changes between versions
SELECT * FROM table_changes('my_catalog.my_schema.orders', 1, 10);

-- Read changes between timestamps
SELECT * FROM table_changes('my_catalog.my_schema.orders', '2025-01-01', '2025-01-31');

-- Filter change types
SELECT order_id, customer_id, total, _change_type, _commit_version
FROM table_changes('my_catalog.my_schema.orders', 5)
WHERE _change_type IN ('insert', 'update_postimage');
```

## Schema Management

```sql
-- Add a column
ALTER TABLE my_catalog.my_schema.products
ADD COLUMN description STRING AFTER name;

-- Rename a column (requires column mapping)
ALTER TABLE my_catalog.my_schema.products
RENAME COLUMN name TO product_name;

-- Change column type (compatible changes only)
ALTER TABLE my_catalog.my_schema.products
ALTER COLUMN product_id TYPE BIGINT;

-- Set table properties
ALTER TABLE my_catalog.my_schema.products
SET TBLPROPERTIES (
    'delta.autoOptimize.optimizeWrite' = 'true',
    'delta.autoOptimize.autoCompact' = 'true'
);
```

## Table Metadata

```sql
-- Show table details
DESCRIBE EXTENDED my_catalog.my_schema.products;

-- Show table properties
SHOW TBLPROPERTIES my_catalog.my_schema.products;

-- Show create statement
SHOW CREATE TABLE my_catalog.my_schema.products;

-- Show file-level details (size, numFiles, clustering info)
DESCRIBE DETAIL my_catalog.my_schema.orders;
```

# Mock Exam - Section 3: Data Modeling (Questions 31-39)

[Back to Exam Overview](./README.md) | [Previous: Databricks Tooling](02-databricks-tooling.md) | [Next: Security & Governance](04-security-governance.md)

---

## Question 31

**Scenario**: A retail company is implementing the medallion architecture. Raw point-of-sale data arrives as JSON files with nested structures containing transaction details and line items.

**Question**: Which layer should handle flattening the nested JSON structure into a relational format?

A) Bronze layer - ingest and flatten immediately
B) Gold layer - create denormalized tables for analytics
C) Silver layer - transform raw data into cleaned, conformed structures
D) A separate staging layer before bronze

> [!success]- Answer
> **Correct Answer: C**
>
> The silver layer is responsible for data cleansing and conforming, including flattening nested structures. Bronze should preserve raw data as-is for auditability. Gold focuses on business aggregations. Option D adds unnecessary complexity.

---

## Question 32

**Scenario**: A Delta table has a column `email` defined as `STRING NOT NULL`. A new data file arrives containing records with null email values.

**Question**: What happens when this data is written to the table?

A) Null values are converted to empty strings
B) The write fails with a constraint violation error
C) Records with null emails are silently dropped
D) The NOT NULL constraint is automatically removed

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake enforces NOT NULL constraints at write time. Attempting to write null values to a NOT NULL column causes the entire write operation to fail with an error. Options A, C, and D describe behaviors that don't occur.

---

## Question 33

**Scenario**: A data engineer needs to add a new column `loyalty_tier` to an existing Delta table with millions of records. The column should be nullable and positioned after the `customer_id` column.

**Question**: Which statement correctly adds this column?

A) `ALTER TABLE customers ADD COLUMN loyalty_tier STRING AFTER customer_id`
B) `ALTER TABLE customers ADD COLUMNS (loyalty_tier STRING AFTER customer_id)`
C) `ALTER TABLE customers ADD COLUMN loyalty_tier STRING` (column position cannot be specified)
D) Table must be recreated to add a column at a specific position

> [!success]- Answer
> **Correct Answer: A**
>
> Delta Lake supports column positioning with `FIRST` or `AFTER` clauses in ADD COLUMN statements. The syntax `ALTER TABLE ADD COLUMN column_name TYPE AFTER existing_column` correctly positions the new column. Option B uses incorrect syntax (COLUMNS instead of COLUMN with positioning). Option C is incorrect because position CAN be specified. Option D is unnecessary since ADD COLUMN with AFTER is supported.

---

## Question 34

**Scenario**: A slowly changing dimension table tracks customer addresses with SCD Type 2 implementation. The table has columns: customer_id, address, start_date, end_date, is_current. A customer changes their address.

**Question**: How many rows should be affected by this single address change?

A) 1 row (update the existing record)
B) 2 rows (close old record, insert new record)
C) 3 rows (update old, insert new, update audit table)
D) Depends on the number of historical records for that customer

> [!success]- Answer
> **Correct Answer: B**
>
> SCD Type 2 handles changes by: (1) closing the current record (setting end_date and is_current=false) and (2) inserting a new record with the new address (is_current=true). This affects exactly 2 rows. Option A describes SCD Type 1. Options C and D describe non-standard implementations.

---

## Question 35

**Scenario**: A fact table containing 5 years of transaction data is partitioned by `transaction_date`. Most queries filter on `customer_id` and `product_id`, rarely filtering on date. Query performance is poor.

**Question**: What modification would most improve query performance?

A) Add more partitions by also partitioning on `customer_id`
B) Remove date partitioning and use Z-ORDER on `customer_id, product_id`
C) Keep date partitioning and add Z-ORDER on `customer_id, product_id`
D) Convert to Liquid Clustering on `customer_id, product_id`

> [!success]- Answer
> **Correct Answer: D**
>
> Liquid Clustering on the frequently filtered columns provides automatic data organization and maintenance. Since queries rarely filter on date, date partitioning provides little benefit. Option B loses time-based data management benefits. Option C combines both but has more maintenance overhead than liquid clustering. Option A creates too many small partitions.

---

## Question 36

**Scenario**: A data engineer is implementing a Delta table for product catalog data. Products are frequently updated, and analysts need to see what the catalog looked like at any point in the past 30 days.

**Question**: Which Delta Lake feature and configuration supports this requirement?

A) Enable Change Data Feed to track all changes
B) Create a separate history table with trigger-based logging
C) Time travel with default retention (30 days log retention)
D) Use Delta Lake versioning with `delta.logRetentionDuration = 30 days`

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake's time travel allows querying historical versions using `VERSION AS OF` or `TIMESTAMP AS OF`. The default 30-day log retention supports this requirement. Option A tracks changes but doesn't provide point-in-time queries. Option B is unnecessary given Delta's built-in capabilities. Option D describes the feature partially but misses that it's the default behavior.

---

## Question 37

**Scenario**: A table has schema evolution enabled with `mergeSchema = true`. The source data occasionally includes columns with names that differ from existing columns only by case (e.g., "CustomerId" vs "customerid").

**Question**: What is the default behavior in Delta Lake and how can it be controlled?

A) Delta is case-insensitive by default; both names map to the same column
B) Delta is case-sensitive by default; they become separate columns
C) Delta throws an error on case conflicts
D) Delta automatically renames conflicting columns with suffixes

> [!success]- Answer
> **Correct Answer: A**
>
> By default, Delta Lake (following Spark SQL) treats column names as case-insensitive. "CustomerId" and "customerid" refer to the same column. This behavior can be changed with `spark.sql.caseSensitive = true`. Options B, C, and D describe non-default behaviors.

---

## Question 38

**Scenario**: A deep clone of a production Delta table is created for a testing environment. After the clone, updates are made to both the production table and the clone.

**Question**: How do changes to the production table affect the cloned table?

A) Changes automatically propagate to the clone
B) Changes propagate until the clone is modified, then it becomes independent
C) Only schema changes propagate; data changes don't
D) The clone is completely independent; changes don't propagate

> [!success]- Answer
> **Correct Answer: D**
>
> Deep clone creates a completely independent copy with its own data files. After cloning, both tables evolve independently. No changes propagate between them. Option A describes linked tables, not clones. Options B and C describe behaviors that don't exist.

---

## Question 39

**Scenario**: A dimension table needs to track corrections to historical records. When an error is discovered in a past record, the correction should be applied, but there must also be an audit trail showing the original incorrect value.

**Question**: Which SCD type best supports this requirement?

A) SCD Type 1 with a separate audit log table
B) SCD Type 2 with effective dates
C) SCD Type 3 with previous value columns
D) SCD Type 6 (hybrid) with Type 1, 2, and 3 elements

> [!success]- Answer
> **Correct Answer: A**
>
> For corrections (not legitimate changes), SCD Type 1 updates the current value while a separate audit log table preserves the history of corrections. Type 2 is for legitimate business changes, not error corrections. Type 3 only tracks one previous value. Type 6 is complex and not specifically designed for corrections.

---

**[← Previous: Mock Exam - Section 2: Databricks Tooling](./02-databricks-tooling.md) | [↑ Back to Full-Length Practice Exam](./README.md) | [Next: Mock Exam - Section 4: Security & Governance](./04-security-governance.md) →**

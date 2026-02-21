# Mock Exam 2 - Section 3: Data Modeling (Questions 31-39)

## Question 31

**Scenario**: A logistics company ingests GPS telemetry data from delivery trucks into a Bronze table. The data arrives as raw JSON with minimal structure issues. The analytics team needs a Gold table that provides real-time aggregated metrics such as average speed per route and delivery time percentiles. The Silver layer would only perform minor formatting (e.g., timestamp parsing) with no significant cleansing or joins required.

**Question**: What is the most appropriate approach for building this pipeline in the medallion architecture?

A) Write directly from Bronze to Gold, skipping Silver, since the intermediate transformations add no meaningful value
B) Always create a Silver layer to maintain architectural consistency, even if transformations are trivial
C) Write the raw data directly to Gold and skip both Bronze and Silver
D) Create a Silver table but only materialize it as a view to reduce storage costs

> [!success]- Answer
> **Correct Answer: A**
>
> When the Silver layer would only perform trivial transformations that add no real cleansing or conforming value, it is acceptable to bypass it and write directly from Bronze to Gold. The medallion architecture is a guideline, not a rigid rule, and unnecessary layers add latency and storage overhead without benefit. Option B wastes resources on an empty pass-through, and option C loses the raw data auditability that Bronze provides.

---

## Question 32

**Scenario**: A data engineer is implementing SCD Type 2 on a `dim_customer` table using Delta Lake's MERGE statement. The table tracks historical changes with `effective_start_date`, `effective_end_date`, and `is_current` flag columns. When a matching customer record has changed attributes, the engineer needs to expire the old row and insert the new row.

**Question**: Which MERGE approach correctly implements SCD Type 2 with proper current/expired flag management?

A) Use MERGE with `WHEN MATCHED THEN UPDATE SET *` to overwrite the existing row with the new values
B) Use MERGE with `WHEN MATCHED THEN DELETE` followed by a separate INSERT of both the expired and new rows
C) Use MERGE with `WHEN MATCHED AND source.hash <> target.hash THEN UPDATE SET is_current = false, effective_end_date = current_date()` combined with a `WHEN NOT MATCHED THEN INSERT` clause, then run a second INSERT for the new current rows
D) Use MERGE with `WHEN MATCHED THEN UPDATE SET is_current = false` and include the new row in the WHEN NOT MATCHED clause, which automatically handles both operations in a single pass

> [!success]- Answer
> **Correct Answer: C**
>
> SCD Type 2 requires two operations for changed records: expiring the old row (updating `is_current` to false and setting `effective_end_date`) and inserting the new current row. The correct approach uses a MERGE to expire matched rows with changed attributes, then a separate INSERT statement to add the new current versions. Option D is incorrect because the `WHEN NOT MATCHED` clause only fires for source rows with no match in the target, not for rows that were just updated.

---

## Question 33

**Scenario**: A data engineering team has a production Delta table with a column named `txn_amt` that business users find confusing. They want to rename it to `transaction_amount`. They also need to drop an obsolete column called `legacy_flag`. The table has 500 million rows and they cannot afford to rewrite the entire table.

**Question**: Which approach allows the team to rename and drop columns on the Delta table without rewriting data files?

A) Use `ALTER TABLE RENAME COLUMN txn_amt TO transaction_amount` and `ALTER TABLE DROP COLUMN legacy_flag` directly, as Delta Lake supports this by default
B) Create a new table with the desired schema and use `INSERT INTO ... SELECT` to copy the data
C) Create a view on top of the existing table with column aliases to simulate the rename
D) Enable Delta column mapping by setting `delta.columnMapping.mode = 'name'` and then use `ALTER TABLE RENAME COLUMN` and `ALTER TABLE DROP COLUMN`

> [!success]- Answer
> **Correct Answer: D**
>
> Delta column mapping (`delta.columnMapping.mode = 'name'`) decouples logical column names from physical column names in Parquet files, enabling column rename and drop operations without rewriting data files. Without column mapping enabled, Delta Lake does not support column rename or drop operations. Option A would fail because the default column mapping mode (`none`) does not permit these operations. Option B requires a full data rewrite, which violates the constraint.

---

## Question 34

**Scenario**: A financial services company is building a lakehouse for regulatory reporting. They have complex queries that join customer, account, transaction, and product data. Reports require filtering by customer segment, product type, and time period. Query performance is critical because reports are generated on tight regulatory deadlines, and the data team includes SQL analysts accustomed to relational modeling.

**Question**: Which data modeling approach is most appropriate for the Gold layer of this lakehouse?

A) A fully denormalized single wide table containing all customer, account, transaction, and product attributes
B) A star schema with a central fact table for transactions and dimension tables for customer, account, and product
C) A normalized third normal form (3NF) model to minimize data redundancy
D) A Data Vault 2.0 model with hubs, links, and satellites for maximum flexibility

> [!success]- Answer
> **Correct Answer: B**
>
> A star schema is ideal for the Gold layer when queries involve multiple filter dimensions and the team includes SQL analysts familiar with relational patterns. It provides a balance of query performance (through reduced joins compared to 3NF) and manageability (compared to a single denormalized table that would be unwieldy with this many entities). Option A would create an extremely wide table with massive redundancy, while option C optimizes for storage at the cost of query performance due to excessive joins.

---

## Question 35

**Scenario**: A data engineer needs to create a copy of a 2 TB production Delta table for a development environment. The dev team will run experimental transformations that may alter or delete data, but they primarily need to read the table for testing queries. Storage costs are a concern, and the copy needs to be created quickly during a short maintenance window.

**Question**: Which cloning strategy best meets these requirements?

A) Use SHALLOW CLONE, which copies only the metadata and transaction log while referencing the original data files, providing a fast and storage-efficient copy
B) Use DEEP CLONE, which copies all data files and metadata to create a fully independent copy
C) Use CTAS (`CREATE TABLE AS SELECT`) to create a complete physical copy of the data
D) Use SHALLOW CLONE and then immediately run OPTIMIZE on the clone to consolidate files

> [!success]- Answer
> **Correct Answer: A**
>
> SHALLOW CLONE creates a copy by referencing the source table's data files without physically duplicating them, making it both fast and storage-efficient. This is ideal for development and testing environments where cost and speed matter. Option B (DEEP CLONE) would require copying all 2 TB of data, which is slow and expensive. Note that if the dev team writes to a shallow clone, only the modified files are stored separately while unchanged data still references the source.

---

## Question 36

**Scenario**: A data engineer is designing a Delta table to store IoT sensor readings. The table will hold 10 billion rows and receive 50 million new rows daily. Queries almost always filter by `device_region` (5 distinct values) and `reading_date`. Occasional queries filter by `sensor_id` (500,000 distinct values). The team is using Hive-style partitioning.

**Question**: Which partitioning strategy is most appropriate for this table?

A) Partition by `sensor_id` to ensure queries filtering on individual sensors are fast
B) Partition by both `device_region` and `reading_date` to align with the two most common filter columns
C) Partition by `device_region` only, and use Z-ORDER BY on `reading_date, sensor_id` for additional data skipping
D) Partition by `reading_date` only, since it is the most granular time-based column

> [!success]- Answer
> **Correct Answer: C**
>
> With Hive-style partitioning, partition columns should have low cardinality to avoid creating too many small files. `device_region` with 5 distinct values is an excellent partition column. Adding `reading_date` as a partition would create thousands of sub-partitions (5 regions x 365+ days), leading to a small-files problem. Z-ORDER on `reading_date` and `sensor_id` provides efficient data skipping within each partition. Option A is wrong because 500,000 partitions would cause severe performance degradation.

---

## Question 37

**Scenario**: A data platform team is migrating an existing Hive-style partitioned Delta table (`PARTITIONED BY (year, month, day)`) to a more modern layout strategy. The table suffers from partition skew (some days have 100x more data than others), requires frequent partition management, and analysts occasionally need to query by non-partition columns like `customer_segment` and `product_category`.

**Question**: What is the primary advantage of converting this table to use Liquid Clustering?

A) Liquid Clustering compresses data files more efficiently than Hive-style partitioning, reducing storage costs
B) Liquid Clustering incrementally reorganizes data without requiring full table rewrites and supports flexible, multi-column clustering that adapts to evolving query patterns
C) Liquid Clustering eliminates the need for the OPTIMIZE command entirely since data is always optimally organized at write time
D) Liquid Clustering automatically creates materialized views for the most frequently queried column combinations

> [!success]- Answer
> **Correct Answer: B**
>
> Liquid Clustering's key advantages over Hive-style partitioning are incremental data reorganization (no full rewrites needed), support for multiple clustering columns without the small-files problem of multi-column partitioning, and the ability to change clustering keys without rewriting all data. Option C is incorrect because OPTIMIZE is still used to trigger clustering; it just works incrementally. Option A is misleading because compression is not the primary differentiator.

---

## Question 38

**Scenario**: A new data engineer joins a team that uses the medallion architecture. They are asked to document the data quality expectations at each layer. The pipeline ingests raw e-commerce event data and produces analytics-ready tables for business intelligence.

**Question**: Which description correctly characterizes the transformations applied at each layer of the medallion architecture?

A) Bronze applies schema enforcement and deduplication; Silver adds business aggregations; Gold provides filtered views for consumers
B) Bronze performs data type casting and validation; Silver joins reference data; Gold stores raw backup copies
C) Bronze ingests raw data with minimal transformation (e.g., adding metadata columns and enforcing schema-on-read); Silver cleanses, deduplicates, and conforms data with schema enforcement; Gold applies business-level aggregations, joins, and curations for specific use cases
D) Bronze and Silver perform identical cleansing operations for redundancy; Gold handles all business logic and aggregation

> [!success]- Answer
> **Correct Answer: C**
>
> The medallion architecture defines clear responsibilities: Bronze preserves raw data with minimal changes (append metadata, track ingestion), Silver handles data quality (dedup, null handling, type casting, schema enforcement, conforming), and Gold delivers business-ready datasets (aggregations, dimensional models, KPI tables). Option A incorrectly places schema enforcement and deduplication at the Bronze layer, which should preserve raw data fidelity.

---

## Question 39

**Scenario**: A data engineer adds both a `NOT NULL` constraint and a `CHECK` constraint (`CHECK (quantity > 0)`) to a Delta table. During a pipeline run, a batch of 10,000 records is written where 5 records have null quantities and 3 records have `quantity = -1`.

**Question**: How does Delta Lake enforce these constraints during the write operation?

A) The NOT NULL constraint is enforced but CHECK constraints are only evaluated during reads, so only the 5 null records cause failures
B) Both constraints are treated as warnings, and violating records are logged but still written to the table
C) The CHECK constraint catches all 8 violating records (nulls and negatives) since CHECK implicitly covers nulls, and the write fails for the entire batch
D) Both constraints are enforced independently at write time, and the entire write operation fails if any record violates either constraint, with an error indicating which constraint was violated

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Lake enforces both NOT NULL and CHECK constraints at write time. If any record in the batch violates either constraint, the entire transaction is rejected with an error message identifying the violated constraint. These are independent checks: NOT NULL catches the 5 null records and CHECK catches the 3 negative-quantity records. Option C is incorrect because CHECK constraints do not implicitly handle nulls; SQL CHECK constraints evaluate to UNKNOWN (not false) for nulls, so the NOT NULL constraint is needed separately.

---

**[← Previous: Mock Exam 2 - Section 2: Databricks Tooling](./02-databricks-tooling.md) | [↑ Back to Mock Exam 2 - Databricks Data Engineer Professional](./README.md) | [Next: Mock Exam 2 - Section 4: Security & Governance](./04-security-governance.md) →**

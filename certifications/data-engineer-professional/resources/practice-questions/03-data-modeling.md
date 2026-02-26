---
title: "Practice Questions: Data Modeling"
type: practice-questions
tags: [data-engineer-professional, practice-questions, data-modeling]
---

# Practice Questions - Section 03: Data Modeling (15%)

## Question 3.1: Medallion Architecture

**Scenario**: A data architect is designing a lakehouse. Raw JSON data needs to be ingested, cleaned, and then aggregated.

**Question** *(Easy)*: In which layer should data type casting and null handling occur?

A) Bronze layer
B) Silver layer
C) Gold layer
D) Landing zone

> [!success]- Answer
> **Correct Answer: B**
>
> The Silver layer is for cleaned, conformed data including type casting, null handling, deduplication, and standardization. Bronze stores raw data as-is. Gold is for business-level aggregations. Landing zone is temporary staging.

---

## Question 3.2: Delta Lake Time Travel

**Scenario**: A user accidentally deleted important records 3 days ago. The table has default retention settings.

**Question** *(Medium)*: Which command restores the data?

A) `RESTORE TABLE orders TO VERSION AS OF 100`
B) `SELECT * FROM orders TIMESTAMP AS OF '2024-01-12'`
C) `ROLLBACK TABLE orders TO 3 DAYS AGO`
D) Both A and B can be used to access historical data

> [!success]- Answer
> **Correct Answer: D**
>
> Both version-based (`VERSION AS OF`) and timestamp-based (`TIMESTAMP AS OF`) time travel work. RESTORE actually reverts the table, while SELECT reads historical data. Default retention is 7 days, so 3-day-old data is available.

---

## Question 3.3: Schema Evolution

**Scenario**: A streaming pipeline receives data with a new column. The target Delta table should automatically accept this change.

**Question** *(Easy)*: Which option enables this?

A) `.option("mergeSchema", "true")`
B) `.option("overwriteSchema", "true")`
C) `.option("schemaEvolution", "true")`
D) Schema evolution is automatic in Delta

> [!success]- Answer
> **Correct Answer: A**
>
> `mergeSchema = true` allows adding new columns during writes. `overwriteSchema` replaces the entire schema (dangerous). Option C is not a valid option. Schema evolution must be explicitly enabled.

---

## Question 3.4: SCD Type 2

**Scenario**: A dimension table needs to track full history of changes with effective dates.

**Question** *(Easy)*: Which columns are typically added for SCD Type 2?

A) `is_current`, `version`
B) `start_date`, `end_date`, `is_current`
C) `created_at`, `updated_at`
D) `previous_value`, `current_value`

> [!success]- Answer
> **Correct Answer: B**
>
> SCD Type 2 tracks history using `start_date` (when version became active), `end_date` (when superseded, NULL for current), and often `is_current` flag. This allows point-in-time queries and current state queries.

---

## Question 3.5: Liquid Clustering vs Z-ORDER

**Scenario**: A table is frequently filtered by `customer_id` and `order_date`. The team wants automatic optimization.

**Question** *(Medium)*: Which approach provides automatic maintenance?

A) `OPTIMIZE table ZORDER BY (customer_id, order_date)` scheduled daily
B) `ALTER TABLE table CLUSTER BY (customer_id, order_date)`
C) `CREATE TABLE table PARTITIONED BY (customer_id, order_date)`
D) Both A and B provide automatic maintenance

> [!success]- Answer
> **Correct Answer: B**
>
> Liquid Clustering (`CLUSTER BY`) provides automatic, incremental clustering without manual OPTIMIZE commands. Z-ORDER requires scheduled OPTIMIZE runs. Partitioning is for low-cardinality columns and doesn't cluster data within partitions.

---

## Question 3.6: Partitioning Best Practices

**Scenario**: A table has 100 million rows with a `status` column containing 5 distinct values and a `customer_id` column with 1 million distinct values.

**Question** *(Hard)*: Which partitioning strategy is correct?

A) Partition by `customer_id`
B) Partition by `status`
C) Partition by both `customer_id` and `status`
D) Don't partition, use Z-ORDER on `customer_id`

> [!success]- Answer
> **Correct Answer: D**
>
> Partitioning works best for low-cardinality columns with ~1000 or fewer values. `customer_id` has too many values (would create 1M partitions). `status` has too few values (only 5 partitions, may not help much). Z-ORDER or liquid clustering on high-cardinality columns is better.

---

**[← Previous: Practice Questions - Section 02: Databricks Tooling](./02-databricks-tooling.md) | [↑ Back to Practice Questions](./README.md) | [Next: Practice Questions - Section 04: Security & Governance](./04-security-governance.md) →**

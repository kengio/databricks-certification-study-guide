---
title: "Practice Questions: Data Modeling"
type: practice-questions
tags: [data-engineer-professional, practice-questions, data-modeling]
---

# Section 9: Data Modeling (5 %)

Practice questions for Section 9 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 9 folder](../../09-data-modeling/README.md).

---

## Question 1: Medallion Architecture

**Question** *(Easy)*: A data architect is designing a lakehouse. Raw JSON data needs to be ingested, cleaned, and then aggregated. In which layer should data type casting and null handling occur?

A) Bronze layer  
B) Silver layer  
C) Gold layer  
D) Landing zone  

> [!success]- Answer
> **Correct Answer: B**
>
> The Silver layer is for cleaned, conformed data including type casting, null handling, deduplication, and standardization. Bronze stores raw data as-is. Gold is for business-level aggregations. Landing zone is temporary staging.

---

## Question 2: Schema Evolution

**Question** *(Easy)*: A streaming pipeline receives data with a new column. The target Delta table should automatically accept this change. Which option enables this?

A) `.option("mergeSchema", "true")`  
B) `.option("overwriteSchema", "true")`  
C) `.option("schemaEvolution", "true")`  
D) Schema evolution is automatic in Delta  

> [!success]- Answer
> **Correct Answer: A**
>
> `mergeSchema = true` allows adding new columns during writes. `overwriteSchema` replaces the entire schema (dangerous). Option C is not a valid option. Schema evolution must be explicitly enabled.

---

## Question 3: SCD Type 2

**Question** *(Easy)*: A dimension table needs to track full history of changes with effective dates. Which columns are typically added for SCD Type 2?

A) `is_current`, `version`  
B) `start_date`, `end_date`, `is_current`  
C) `created_at`, `updated_at`  
D) `previous_value`, `current_value`  

> [!success]- Answer
> **Correct Answer: B**
>
> SCD Type 2 tracks history using `start_date` (when version became active), `end_date` (when superseded, NULL for current), and often `is_current` flag. This allows point-in-time queries and current state queries.

---

## Question 4: Partitioning Best Practices

**Question** *(Hard)*: A table has 100 million rows with a `status` column containing 5 distinct values and a `customer_id` column with 1 million distinct values. Which partitioning strategy is correct?

A) Partition by `customer_id`  
B) Partition by `status`  
C) Partition by both `customer_id` and `status`  
D) Don't partition, use Z-ORDER on `customer_id`  

> [!success]- Answer
> **Correct Answer: D**
>
> Partitioning works best for low-cardinality columns with ~1000 or fewer values. `customer_id` has too many values (would create 1M partitions). `status` has too few values (only 5 partitions, may not help much). Z-ORDER or liquid clustering on high-cardinality columns is better.

---

## Question 5: One Definition, Any Grouping *(2026 blueprint)*

**Question** *(Medium)*: Finance defines average order value as net revenue divided by the number of distinct orders. Analysts query it from AI/BI dashboards, Genie Agents, and Power BI, grouped by region in one report and by month and customer segment in another. Some reports currently average pre-aggregated daily ratios and get wrong numbers. Which design gives one governed definition that stays correct at any grouping?

A) A Unity Catalog metric view over `fact_sales` with atomic measures for net revenue and order count, and `avg_order_value` defined as `MEASURE(net_revenue) / MEASURE(order_count)`  
B) A materialized view that stores average order value by day, region, and segment  
C) A standard view that computes `AVG(order_value)` grouped by region  
D) A Python UDF that each notebook imports to compute the ratio  

> [!success]- Answer
> **Correct Answer: A**
>
> A metric view defines measures once and lets consumers group by any field. The engine computes the ratio from the atomic measures at the requested grain.
>
> Metric views separate measure definitions from fields, so a composed measure like `MEASURE(net_revenue) / MEASURE(order_count)` re-aggregates correctly for any `GROUP BY` and is governed in Unity Catalog for every tool. A materialized view (B) fixes the grain, and averaging stored ratios across rows gives the wrong answer. A standard view (C) fixes its grouping and uses a different formula. A UDF copied into notebooks (D) isn't governed and doesn't reach dashboards or BI tools.

---

## Question 6: Enabling Incremental Materialized View Refresh *(2026 blueprint)*

**Question** *(Hard)*: A Gold materialized view, refreshed on serverless, pre-aggregates the Delta tables `fact_sales` and `dim_product` for dashboards. Neither source table has row tracking enabled. Every refresh shows a `FULL_RECOMPUTE` technique in the event log, and refresh cost keeps growing with table size. The query uses only `SUM` over `DECIMAL` columns, `GROUP BY`, and an inner join between the two tables. Which change most directly allows incremental refresh?

A) Add a `customer_key BIGINT GENERATED ALWAYS AS IDENTITY` column to the materialized view  
B) Cast the `DECIMAL` amounts to `DOUBLE` before summing  
C) Enable row tracking on the source tables and set `REFRESH POLICY INCREMENTAL STRICT` so a non-incremental plan fails instead of recomputing  
D) Convert the materialized view to a standard view so it's computed at query time  

> [!success]- Answer
> **Correct Answer: C**
>
> Incremental refresh needs supported operations, serverless refresh, and row tracking on the Delta sources. `INCREMENTAL STRICT` makes any remaining blocker fail loudly instead of silently recomputing.
>
> The docs say source Delta tables should have row tracking enabled to support incremental refresh, and `REFRESH POLICY INCREMENTAL STRICT` fails the refresh rather than falling back to a full recompute. That makes the cause visible and stops the cost growth. Materialized views don't support identity columns or surrogate keys (A). `SUM` over `FLOAT` or `DOUBLE` forces a full refresh, so casting to `DOUBLE` (B) makes things worse. A standard view (D) removes the pre-computation the dashboards depend on.

---

## Question 7: Fixing an Over-Partitioned Table *(2026 blueprint)*

**Question** *(Medium)*: A 600 GB Delta table is partitioned by `customer_id` and has millions of small files. Queries filter on `customer_id` and on `event_date`. The workspace runs Databricks Runtime 18.1. The engineer wants better data skipping and balanced file sizes without a manual CTAS rebuild. What should the engineer do?

A) Add a generated `event_month` column and repartition the table by `(event_month, customer_id)`  
B) Keep the partitions and run `OPTIMIZE ... ZORDER BY (event_date)` in each partition  
C) Lower `delta.targetFileSize` to 16 MB so each partition writes smaller files  
D) Run `ALTER TABLE ... REPLACE PARTITIONED BY WITH CLUSTER BY (customer_id, event_date)` and then `OPTIMIZE`  

> [!success]- Answer
> **Correct Answer: D**
>
> Converting in place to liquid clustering on the filter columns, then running `OPTIMIZE`, fixes both data skipping and file sizes.
>
> The docs say not to partition tables under 1 TB at all, and partitioning by a high-cardinality column creates the small-file problem described here. In DBR 18.1+, `REPLACE PARTITIONED BY WITH CLUSTER BY` converts the table without a full manual rebuild, and `OPTIMIZE` then clusters and compacts the data. Option A keeps a partitioned layout below the recommended size and still partitions on a high-cardinality column. Option B leaves millions of small partitions in place, because Z-order can't combine files across partition boundaries. Option C makes the small-file problem worse.

---

## Question 8: Clustering a Fact Table for Star-Schema Joins *(2026 blueprint)*

**Question** *(Hard)*: A 30 TB unpartitioned fact table, `fact_sales`, is joined to a small filtered `dim_product` table on `product_key`, and most queries also filter on `sale_date`. Query profiles show that dynamic file pruning is applied but still scans most fact files, because `product_key` values are spread across every file. Which layout change best aligns the table with this access pattern?

A) Partition `fact_sales` by `product_key`  
B) Enable liquid clustering on `fact_sales` with `CLUSTER BY (sale_date, product_key)`, then run `OPTIMIZE ... FULL`  
C) Set `delta.targetFileSize` to 32 MB so there are more files to skip  
D) Disable predictive optimization and schedule `VACUUM` every hour  

> [!success]- Answer
> **Correct Answer: B**
>
> Liquid clustering on the filter column and the join key puts matching rows in fewer files, so dynamic file pruning can skip more of them. `OPTIMIZE FULL` reclusters the existing data.
>
> The dynamic file pruning docs say its effect depends on how data is clustered, and recommend liquid clustering on frequently joined columns. Clustering keys should come from the most common filter and join columns, up to four keys. Partitioning on a high-cardinality join key (A) causes over-partitioning and small files, and the docs prefer liquid clustering below 100 TB anyway. Shrinking files (C) works against the autotuned 1 GB target for a table this size and adds metadata overhead. `VACUUM` (D) removes unreferenced files and doesn't change data layout.

---

**[← Previous: Debugging and Deploying](./08-debugging-deploying.md) | [↑ Back to Practice Questions](./README.md)**

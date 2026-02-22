---
title: Photon, Diagnostics & Query Optimization — Part 2
type: topic
tags:
  - data-engineering
  - performance
  - spark
  - photon
  - diagnostics
status: published
---

# Photon, Diagnostics & Query Optimization — Part 2

This part covers query optimization strategies, common issues, exam tips, and practice questions for Photon and query diagnostics.

> For Photon acceleration, memory diagnostics, and Spark UI analysis, see [Part 1](./06-photon-diagnostics-optimization-part1.md).

## Query Optimization Strategies

### Predicate Pushdown

```python

# Predicate pushdown moves filters to the scan level
# This reduces data read from storage

# Good: Filter can be pushed down

df = (spark.table("orders")
    .filter(col("order_date") == "2024-01-15")   # Pushed to scan
    .filter(col("status") == "completed")         # Pushed to scan
    .select("customer_id", "amount"))

df.explain()
# Should show PushedFilters: [EqualTo(order_date,...), EqualTo(status,...)]

```

```sql
-- Verify pushdown in SQL
EXPLAIN
SELECT customer_id, amount
FROM orders
WHERE order_date = '2024-01-15'
  AND status = 'completed';

-- Look for PushedFilters in the output
```

### Column Pruning

```python

# Column pruning reads only needed columns from Parquet
# Parquet is columnar, so this skips entire column chunks

# Bad: Reads ALL columns then selects

df = spark.table("orders").select("*")

# Good: Reads only needed columns

df = spark.table("orders").select("customer_id", "amount", "order_date")

# The physical plan shows ReadSchema with only requested columns:
# FileScan parquet [customer_id,amount,order_date]
# ReadSchema: struct<customer_id:string,amount:double,order_date:date>

```

### Constant Folding

```text
Catalyst optimizer evaluates constant expressions at compile time:

Before optimization:
  Filter (amount > 100 * 10)

After constant folding:
  Filter (amount > 1000)

Also applies to:
  - String concatenation of literals
  - Date arithmetic with constants
  - Boolean simplification (true AND x -> x)
```

### Join Reordering

```python

# Catalyst can reorder joins for better performance
# based on table statistics

# The optimizer may reorder these joins:

result = (table_a
    .join(table_b, "key_ab")    # table_b is 1TB
    .join(table_c, "key_ac"))   # table_c is 10MB

# Optimizer may choose to join table_a with table_c first
# (broadcast table_c) then join with table_b

# Force specific order with hints if needed:

result = (table_a
    .join(broadcast(table_c), "key_ac")
    .join(table_b, "key_ab"))
```

### Statistics Collection: ANALYZE TABLE

```sql
-- Collect table-level statistics
ANALYZE TABLE orders COMPUTE STATISTICS;

-- Collect column-level statistics (more useful for CBO)
ANALYZE TABLE orders COMPUTE STATISTICS FOR COLUMNS
    customer_id, amount, order_date, status;

-- Check collected statistics
DESCRIBE EXTENDED orders;

-- Column statistics include:
--   distinct count, min, max, null count, avg length, max length, histogram
```

```python
# Verify statistics are being used

df = spark.table("orders").filter(col("amount") > 1000)
df.explain(mode="cost")
# Look for "Statistics(sizeInBytes=..., rowCount=...)" in the plan

```

### Histogram-Based Optimization

```sql
-- Equi-height histograms improve join and filter estimates
ANALYZE TABLE orders COMPUTE STATISTICS FOR COLUMNS amount;

-- Histograms help the optimizer with:
--   - Skewed data distributions
--   - Range predicates (amount BETWEEN 100 AND 500)
--   - Join cardinality estimation

-- Enable histogram-based optimization
SET spark.sql.cbo.enabled = true;
SET spark.sql.cbo.joinReorder.enabled = true;
SET spark.sql.statistics.histogram.enabled = true;
```

### Subquery Elimination

```text
Catalyst optimizer eliminates redundant subqueries:

Before:
  SELECT *
  FROM orders
  WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US')
    AND order_date IN (SELECT id FROM customers WHERE region = 'US')
                       ^-- Same subquery referenced twice

After optimization:
  - Subquery computed once and reused
  - May be converted to a join

Tip: Use EXISTS instead of IN for large subqueries:
  WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.region = 'US')
```

## Use Cases

- **Cost-Based Optimizer Enhancement**: Running `ANALYZE TABLE COMPUTE STATISTICS FOR COLUMNS` on a multi-terabyte fact table so the Catalyst optimizer can exploit column histograms to accurately estimate filter selectivity and choose a broadcast join over a costly sort-merge.
- **Predicate Pushdown Verification**: Using `EXPLAIN FORMATTED` to definitively prove that a newly added filter on a massive Delta table is successfully populating the `PushedFilters` array, drastically reducing the volume of data pulled from object storage into Spark memory.

## Common Issues and Errors

### Query Plan Shows CartesianProduct

**Scenario:** Unexpectedly slow query with CartesianProduct in the plan.

**Cause:** Missing or incorrect join condition.

**Fix:** Verify join conditions:

```sql
-- Bad: Missing join condition creates CartesianProduct
SELECT * FROM orders o, customers c
WHERE o.amount > 100;

-- Good: Explicit join condition
SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.amount > 100;
```

### Predicate Pushdown Not Working

**Scenario:** PushedFilters is empty when you expect pushdown.

**Cause:** UDF in filter, non-deterministic expression, or filter after transformation.

**Fix:** Move simple filters before complex operations:

```python
# Bad: Filter after UDF prevents pushdown

df = (spark.table("orders")
    .withColumn("processed", my_udf(col("data")))
    .filter(col("order_date") == "2024-01-15"))

# Good: Simple filters first

df = (spark.table("orders")
    .filter(col("order_date") == "2024-01-15")  # Pushed down
    .withColumn("processed", my_udf(col("data"))))
```

### AQE Not Converting to Broadcast Join

**Scenario:** AQE does not convert SortMergeJoin to BroadcastHashJoin despite small data.

**Cause:** Runtime table size exceeds adaptive broadcast threshold, or AQE broadcast is disabled.

**Fix:** Adjust AQE broadcast threshold:

```python
# Increase the adaptive broadcast threshold

spark.conf.set("spark.sql.adaptive.autoBroadcastJoinThreshold", "100MB")

# Verify AQE is enabled

spark.conf.get("spark.sql.adaptive.enabled")  # Should be "true"
```

### Photon Fallback to Spark

**Scenario:** Expected Photon acceleration but plan shows standard Spark operators.

**Cause:** UDFs, unsupported types, or non-Photon runtime.

**Fix:** Check runtime and avoid UDFs:

```python
# Check if Photon is enabled

print(spark.conf.get("spark.databricks.photon.enabled"))

# Replace UDFs with built-in functions
# Bad: UDF prevents Photon

from pyspark.sql.functions import udf
clean_udf = udf(lambda x: x.strip().lower())
df = df.withColumn("clean_name", clean_udf(col("name")))

# Good: Built-in functions use Photon

df = df.withColumn("clean_name", lower(trim(col("name"))))
```

### Excessive Shuffle in Multi-Join Queries

**Scenario:** Plan shows multiple Exchange operators (shuffles) across joins.

**Fix:** Repartition once on the join key, or use bucketed tables:

```python
# Strategy 1: Pre-repartition on join key

orders = spark.table("orders").repartition("customer_id")
payments = spark.table("payments").repartition("customer_id")
result = orders.join(payments, "customer_id")

# Strategy 2: Bucketed tables (eliminates shuffle for repeated joins)

spark.sql("""
    CREATE TABLE orders_bucketed
    USING delta
    CLUSTERED BY (customer_id) INTO 100 BUCKETS
    AS SELECT * FROM orders
""")
```

### Spill Causing Slow Aggregations

**Scenario:** HashAggregate shows large spill metrics in Spark UI.

**Fix:** Increase partitions and memory:

```python
# More partitions = less data per partition = less spill

spark.conf.set("spark.sql.shuffle.partitions", "2000")

# Or increase the memory fraction for execution

spark.conf.set("spark.memory.fraction", "0.8")

# For extreme cases, use sort-based aggregation (spills more gracefully)

spark.conf.set("spark.sql.execution.useObjectHashAggregateExec", "false")
```

## Exam Tips

1. **Read plans bottom-up** - Start at FileScan (data source) and work up to the final output; the bottom operator executes first
2. **PartitionFilters vs PushedFilters** - PartitionFilters prune entire partitions (directory-level); PushedFilters push predicates into the file reader (row-group level)
3. **AQE operates at shuffle boundaries** - It collects real statistics after each stage completes and re-optimizes the remaining plan using actual data sizes
4. **Photon prefix in operators** - When Photon is active, operators are prefixed with "Photon" (e.g., PhotonGroupingAgg, PhotonScan); absence means Spark fallback
5. **Exchange = Shuffle** - Every Exchange operator in the plan means a full shuffle across the network; minimize these for better performance
6. **BroadcastHashJoin vs SortMergeJoin** - Broadcast is chosen when one side is smaller than `autoBroadcastJoinThreshold` (default 10MB); AQE can switch to broadcast at runtime if actual size is small
7. **Spill to disk is a red flag** - Any non-zero Shuffle Spill (Disk) in Spark UI means memory pressure; fix by increasing partitions, memory, or using broadcast joins
8. **ANALYZE TABLE enables CBO** - Column statistics allow the Cost-Based Optimizer to make better decisions about join order and strategy
9. **Photon does not accelerate UDFs** - Python/Scala UDFs always fall back to Spark JVM execution; replace with built-in functions to benefit from Photon
10. **CustomShuffleReaderExec confirms AQE** - Seeing this operator (or AQEShuffleRead) in the plan confirms that AQE has actively modified the execution strategy

## Practice Questions

### Question 1

An engineer runs `EXPLAIN FORMATTED` on a query joining two Delta tables and sees the following in the physical plan:

```text
+- SortMergeJoin [customer_id], [id], Inner
   :- Exchange hashpartitioning(customer_id, 200)
   :  +- FileScan parquet [customer_id, amount]
   +- Exchange hashpartitioning(id, 200)
      +- FileScan parquet [id, name, region]
```

The `customers` table has only 5 MB of data. What should the engineer do to improve performance?

A) Increase `spark.sql.shuffle.partitions` to 500
B) Use a broadcast hint or increase `spark.sql.autoBroadcastJoinThreshold` to broadcast the customers table
C) Add a `SORT BY` clause before the join
D) Disable Adaptive Query Execution

> [!success]- Answer
> **Correct Answer: B**
>
> The customers table is only 5 MB, which is below the default broadcast threshold of 10 MB but is using SortMergeJoin with two shuffles. This suggests statistics may not be available. Using `broadcast(customers)` hint or verifying that `autoBroadcastJoinThreshold >= 5MB` would eliminate both shuffles by broadcasting the small table. AQE may also detect this at runtime, but the explicit hint guarantees it.

### Question 2

An engineer notices that a query plan shows `PushedFilters: []` (empty) even though the query has a `WHERE` clause filtering on a column. Which of the following is the most likely cause?

A) The table does not have statistics collected
B) The filter uses a Python UDF on the column
C) The table is stored in Delta format
D) The cluster does not have Photon enabled

> [!success]- Answer
> **Correct Answer: B**
>
> Python UDFs are opaque to the Catalyst optimizer and cannot be pushed down to the data source. The optimizer cannot evaluate a UDF at scan time because UDF logic runs in the Python process. Statistics (A) affect cost-based optimization but not predicate pushdown. Delta tables (C) support pushdown well. Photon (D) does not affect pushdown behavior.

### Question 3

In the Spark UI Stages tab, an engineer observes the following task summary for a shuffle stage:

```text
Duration:     Min=2s   Median=4s   Max=180s
Input Size:   Min=50MB Median=65MB Max=8GB
Spill (Disk): Min=0    Median=0    Max=6GB
```

What does this indicate and what is the best solution?

A) Network latency - increase `spark.sql.broadcastTimeout`
B) Insufficient executor memory - increase `spark.executor.memory`
C) Data skew - enable AQE skew join optimization
D) Too few partitions - decrease `spark.sql.shuffle.partitions`

> [!success]- Answer
> **Correct Answer: C**
>
> The extreme variance between median and max values (duration: 4s vs 180s, input: 65MB vs 8GB) is a classic indicator of data skew. One partition has vastly more data than others, causing a straggler task that also spills 6GB to disk. Enabling AQE skew join optimization (`spark.sql.adaptive.skewJoin.enabled = true`) will automatically split the large partition into smaller sub-partitions. Option D would make the problem worse by creating fewer, larger partitions.

### Question 4

An engineer is running a query on a Photon-enabled cluster but the `EXPLAIN FORMATTED` output shows `HashAggregate` and `FileScan` operators without the "Photon" prefix. What is the most likely reason?

A) The query result set is too large for Photon
B) The query uses a Python UDF in one of the transformations
C) The Delta table has not been optimized recently
D) The cluster is using too many executors

> [!success]- Answer
> **Correct Answer: B**
>
> Python UDFs force Photon to fall back to standard Spark JVM execution. When any operator in the pipeline requires Spark JVM execution (like a Python UDF), operators adjacent to it may also fall back. The solution is to replace Python UDFs with built-in Spark SQL functions that are Photon-compatible. Table optimization (C) and cluster sizing (D) do not affect whether Photon is used.

### Question 5

Which EXPLAIN mode should an engineer use to see how the Catalyst optimizer has transformed the logical plan, including predicate pushdown and column pruning optimizations?

A) `EXPLAIN`
B) `EXPLAIN EXTENDED`
C) `EXPLAIN FORMATTED`
D) `EXPLAIN COST`

> [!success]- Answer
> **Correct Answer: B**
>
> `EXPLAIN EXTENDED` shows all four plan stages: Parsed Logical Plan, Analyzed Logical Plan, Optimized Logical Plan, and Physical Plan. By comparing the Analyzed and Optimized logical plans, an engineer can see exactly which optimizer rules were applied, including predicate pushdown and column pruning. `EXPLAIN` (A) shows only the physical plan. `EXPLAIN FORMATTED` (C) shows a formatted physical plan. `EXPLAIN COST` (D) shows cost estimates but not the full optimization stages.

## Key Takeaways

- **Photon prefix in operators**: When Photon is active, plan operators are named `PhotonGroupingAgg`, `PhotonScan`, etc.; absence of the prefix means the operator fell back to standard Spark JVM execution.
- **UDFs disable Photon**: Python UDFs always execute in the Spark JVM and cause adjacent operators to fall back from Photon — replace UDFs with built-in Spark SQL functions to restore Photon acceleration.
- **Predicate pushdown order matters**: Place simple equality or range filters before UDFs and complex transformations so the Catalyst optimizer can push them into `PushedFilters` at the scan level.
- **ANALYZE TABLE for CBO**: `ANALYZE TABLE ... COMPUTE STATISTICS FOR COLUMNS` collects column histograms; enable `spark.sql.cbo.enabled = true` and `spark.sql.cbo.joinReorder.enabled = true` to leverage them.
- **Subquery elimination**: Catalyst automatically detects and evaluates duplicate subqueries only once — prefer `EXISTS` over `IN` for large correlated subqueries to allow the optimizer to convert them to joins.
- **Spill fix for aggregations**: If `HashAggregate` spills to disk, increase `spark.sql.shuffle.partitions` (more, smaller partitions) or raise `spark.memory.fraction` to give execution more heap space.
- **CartesianProduct is a bug signal**: Seeing `CartesianProduct` or `BroadcastNestedLoopJoin` without an explicit cross join intent almost always indicates a missing or incorrect join condition in the query.
- **AQE broadcast conversion**: If AQE does not convert `SortMergeJoin` to `BroadcastHashJoin` despite small runtime table size, increase `spark.sql.adaptive.autoBroadcastJoinThreshold` or use an explicit `broadcast()` hint.

## Related Topics

- [Spark Tuning](03-spark-tuning.md) - Core Spark configurations, AQE, and shuffle optimization
- [File Sizing](01-file-sizing.md) - File compaction and OPTIMIZE for scan performance
- [Z-ORDER Indexing](02-zorder-indexing.md) - Data layout optimization and data skipping
- [Cost Optimization](04-cost-optimization.md) - Cluster selection, Photon cost/benefit analysis

## Official Documentation

- [EXPLAIN Statement](https://docs.databricks.com/sql/language-manual/sql-ref-syntax-qry-explain.html)
- [Adaptive Query Execution](https://docs.databricks.com/optimizations/aqe.html)
- [Photon Runtime](https://docs.databricks.com/compute/photon.html)
- [Query Performance Tuning](https://docs.databricks.com/optimizations/index.html)
- [Spark UI Guide](https://docs.databricks.com/clusters/spark-ui.html)
- [Cost-Based Optimizer](https://docs.databricks.com/optimizations/cbo.html)

---

**[← Previous: Photon, Diagnostics & Query Optimization — Part 1](./06-photon-diagnostics-optimization-part1.md) | [↑ Back to Performance Optimization](./README.md) | [Next: Streaming Performance Optimization](./07-streaming-optimization.md) →**

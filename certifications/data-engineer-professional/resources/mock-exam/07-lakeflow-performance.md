# Mock Exam - Sections 7 & 8: Lakeflow Pipelines & Performance (Questions 58-63)

[Back to Exam Overview](./README.md) | [Previous: Testing & Deployment](06-testing-deployment.md)

---

## Section 7: Lakeflow Pipelines (Questions 58-60)

### Question 58

**Scenario**: A Lakeflow (DLT) pipeline has a streaming table that ingests data and a downstream materialized view that aggregates it. The materialized view is showing stale data even though the streaming table is updating.

**Question**: What is the most likely cause?

A) The pipeline is configured for triggered execution, not continuous
B) Materialized views don't automatically refresh from streaming tables
C) There's a data type mismatch between the tables
D) The materialized view requires a manual REFRESH command

> [!success]- Answer
> **Correct Answer: A**
>
> In triggered execution mode, materialized views only refresh when the pipeline runs. For near real-time updates, use continuous mode or schedule frequent pipeline runs. In continuous mode, materialized views refresh as streaming tables update. Options B and D are incorrect; DLT handles refreshes automatically within pipeline runs. Option C would cause errors, not stale data.

---

### Question 59

**Scenario**: A DLT pipeline implements CDC from a source database using APPLY CHANGES. Some records are arriving with out-of-order timestamps due to source system behavior.

**Question**: How does APPLY CHANGES handle out-of-order records by default?

A) Records are processed in arrival order, ignoring timestamps
B) Records are processed by sequence column; out-of-order records are dropped
C) Records are processed by sequence column; out-of-order records update if sequence is higher
D) The pipeline fails on out-of-order detection

> [!success]- Answer
> **Correct Answer: C**
>
> APPLY CHANGES uses the SEQUENCE BY column to determine record order. If a later-arriving record has a higher sequence value than the current record, it updates the target. Records with lower sequence values than existing records are ignored (as they represent older data). This handles out-of-order arrival correctly.

---

### Question 60

**Scenario**: A DLT pipeline has an expectation `CONSTRAINT valid_amount EXPECT (amount > 0) ON VIOLATION DROP ROW`. After processing, the engineer wants to know how many rows were dropped.

**Question**: How can the dropped row count be retrieved?

A) Check the `dropped_records` column in the target table
B) Dropped rows are not tracked; add manual logging
C) Run `DESCRIBE HISTORY` on the target table
D) Query the pipeline event log for expectation metrics

> [!success]- Answer
> **Correct Answer: D**
>
> DLT stores detailed expectation metrics in the event log including `num_dropped_records` for each expectation. Query the event log filtering for expectation events. Option A doesn't exist. Option C shows Delta operations, not expectation details. Option B is incorrect; DLT tracks this automatically.

---

## Section 8: Performance Optimization (Questions 61-63)

### Question 61

**Scenario**: A Delta table with 2TB of data has 50,000 small files averaging 40MB each. Queries scanning the table are slow due to file listing overhead.

**Question**: What is the optimal compaction strategy?

A) Run `OPTIMIZE` to compact files to the default 1GB target size
B) Run `VACUUM` to remove small files
C) Enable auto-compaction for future writes and run `OPTIMIZE` for existing files
D) Repartition the table with `spark.sql.shuffle.partitions = 2000`

> [!success]- Answer
> **Correct Answer: C**
>
> `OPTIMIZE` compacts existing small files into larger ones (target ~1GB). Enabling auto-compaction (`spark.databricks.delta.autoCompact.enabled`) prevents small files in future writes. Option B removes old files, not compaction. Option D affects partitions in processing, not file sizes.

---

### Question 62

**Scenario**: A query joins a 500GB fact table with a 50MB dimension table. The join is running slowly with significant shuffle.

**Question**: Which optimization would most improve this join performance?

A) Increase `spark.sql.shuffle.partitions` to 1000
B) Enable broadcast join by setting `spark.sql.autoBroadcastJoinThreshold = 100MB`
C) Z-ORDER the fact table by the join key
D) Partition both tables by the join key

> [!success]- Answer
> **Correct Answer: B**
>
> A 50MB dimension table is a good candidate for broadcast join (eliminates shuffle of the large fact table). Increasing the threshold from 10MB default to 100MB enables automatic broadcast. Option A doesn't reduce shuffle. Option C helps filters, not joins. Option D requires data redistribution.

---

### Question 63

**Scenario**: A data engineer is tuning a complex aggregation query that processes 100GB of data. The query runs out of memory during the shuffle phase.

**Question**: Which configuration change most likely resolves this issue?

A) Increase `spark.sql.shuffle.partitions` to create smaller partitions
B) Decrease `spark.memory.fraction` to leave more room for user objects
C) Enable `spark.sql.adaptive.enabled` for dynamic partition coalescing
D) Set `spark.executor.memoryOverhead` to 0 for maximum heap space

> [!success]- Answer
> **Correct Answer: A**
>
> OOM during shuffle typically means individual partitions are too large. Increasing shuffle partitions creates smaller partitions that fit in memory. Option B reduces available memory. Option C helps with small partitions, not OOM. Option D can cause off-heap OOM errors.

---

[Back to Exam Overview](./README.md) | [Previous: Testing & Deployment](06-testing-deployment.md)

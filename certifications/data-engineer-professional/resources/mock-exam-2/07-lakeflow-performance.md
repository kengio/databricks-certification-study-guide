# Mock Exam 2 - Section 7: Lakeflow Pipelines & Performance (Questions 58-60)

## Lakeflow Pipelines & Performance

### Question 58

**Scenario**: A data engineering team is building a Lakeflow (DLT) pipeline that ingests clickstream events from Kafka and produces aggregated session metrics consumed by two downstream systems. A real-time dashboard queries the latest session data every 30 seconds, and a nightly batch process generates a daily summary report from the same session metrics.

**Question**: How should the team define the session metrics dataset in the DLT pipeline to best serve both downstream consumers?

A) Define it as a materialized view so that both the dashboard and batch process always read a consistent, pre-computed result
B) Define it as a streaming table with Change Data Feed enabled so the batch process can read incremental changes
C) Define it as a streaming table so the real-time dashboard reads low-latency results, while the batch process queries the same table on its own schedule
D) Define two separate datasets: a streaming table for the dashboard and a materialized view for the batch process

> [!success]- Answer
> **Correct Answer: C**
>
> A streaming table continuously processes incoming records with low latency, which satisfies the real-time dashboard's requirement for fresh data. The nightly batch process can simply query the same streaming table at its scheduled time without requiring a separate materialized view. Option D introduces unnecessary duplication, and option A (materialized view) only recomputes on pipeline refresh rather than processing incrementally, adding latency unsuitable for the 30-second dashboard polling.

---

### Question 59

**Scenario**: A data engineer is evaluating whether to enable Photon on a production SQL warehouse that runs a mix of workloads. The warehouse processes nightly ETL jobs that perform large-scale joins and aggregations across Delta tables with hundreds of columns, as well as ad-hoc exploratory queries from analysts that use many UDFs written in Python.

**Question**: Which workload pattern benefits most from enabling Photon on this warehouse?

A) The ad-hoc exploratory queries, because Photon accelerates Python UDF execution through native compilation
B) The nightly ETL jobs, because Photon accelerates scan-heavy operations, joins, and aggregations on Delta tables
C) Both workloads benefit equally, because Photon replaces the entire Spark execution engine
D) Neither workload benefits significantly, because Photon only optimizes streaming workloads

> [!success]- Answer
> **Correct Answer: B**
>
> Photon is a vectorized query engine written in C++ that significantly accelerates scan-intensive operations, hash joins, aggregations, and shuffle operations on Delta tables -- exactly the patterns in the nightly ETL jobs. Photon does not accelerate Python UDFs, which still execute in the standard Python runtime, so the ad-hoc queries with Python UDFs see limited benefit. Option C is incorrect because Photon does not replace the entire engine; unsupported operations fall back to standard Spark execution.

---

### Question 60

**Scenario**: A data engineer manages a 5TB Delta table that was originally optimized using `OPTIMIZE ... ZORDER BY (region, event_date)`. The team has decided to migrate to liquid clustering by running `ALTER TABLE events CLUSTER BY (region, event_date)`. After migration, the engineer notices that running `OPTIMIZE events` no longer requires specifying `ZORDER BY` columns.

**Question**: How does `OPTIMIZE` behave differently after the table has been converted to liquid clustering?

A) OPTIMIZE no longer performs any file compaction; it only updates clustering metadata in the Delta log
B) OPTIMIZE applies Z-ORDER clustering automatically using the columns defined in the CLUSTER BY clause, with no behavioral change to the compaction process
C) OPTIMIZE rewrites all data files on every run to ensure complete clustering, which increases write amplification compared to Z-ORDER
D) OPTIMIZE incrementally clusters only the files that need reorganization, avoiding full rewrites and enabling more efficient partial clustering over time

> [!success]- Answer
> **Correct Answer: D**
>
> With liquid clustering, `OPTIMIZE` uses an incremental approach that identifies and rewrites only the files that would benefit from better clustering, rather than rewriting the entire table or requiring a full sort. This is a key behavioral difference from Z-ORDER, which rewrites all files in the targeted partitions on each OPTIMIZE run. The incremental strategy reduces write amplification and makes it practical to run OPTIMIZE more frequently without excessive I/O cost.

---

**[← Previous: Mock Exam 2 - Section 6: Testing & Deployment](./06-testing-deployment.md) | [↑ Back to Mock Exam 2 - Databricks Data Engineer Professional](./README.md)**

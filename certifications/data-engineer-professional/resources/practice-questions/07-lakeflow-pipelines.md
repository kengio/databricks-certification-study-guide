---
title: "Practice Questions: Lakeflow Pipelines"
type: practice-questions
tags: [data-engineer-professional, practice-questions, lakeflow-pipelines]
---

# Practice Questions - Section 07: Lakeflow Pipelines (5%)

## Question 7.1: Streaming Table vs Materialized View

**Scenario**: A DLT pipeline needs a table that aggregates daily sales totals from a streaming source.

**Question** *(Medium)*: Which table type is most appropriate?

A) Streaming table
B) Materialized view
C) Live table
D) Temporary view

> [!success]- Answer
> **Correct Answer: B**
>
> Materialized views are appropriate for aggregations as they fully recompute results. Streaming tables are for append-only incremental processing and don't support aggregations well. "Live table" is deprecated terminology.

---

## Question 7.2: Expectations

**Scenario**: A DLT pipeline requires that all records have a non-null customer_id. Invalid records should be removed but not fail the pipeline.

**Question** *(Easy)*: Which expectation syntax achieves this?

A) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL)`
B) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION DROP ROW`
C) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION FAIL UPDATE`
D) `@dlt.expect_all("valid_id", "customer_id IS NOT NULL")`

> [!success]- Answer
> **Correct Answer: B**
>
> `ON VIOLATION DROP ROW` removes invalid records without failing the pipeline. Option A only logs warnings but keeps invalid rows. Option C fails the entire pipeline. Option D has incorrect syntax.

---

## Question 7.3: APPLY CHANGES

**Scenario**: A CDC pipeline receives insert, update, and delete events. The target table should reflect the current state only.

**Question** *(Medium)*: Which APPLY CHANGES configuration is correct?

A) `STORED AS SCD TYPE 1`
B) `STORED AS SCD TYPE 2`
C) `STORED AS SNAPSHOT`
D) `STORED AS CURRENT`

> [!success]- Answer
> **Correct Answer: A**
>
> SCD Type 1 maintains only the current state by overwriting on updates. SCD Type 2 maintains full history with start/end dates. Options C and D are not valid APPLY CHANGES syntax.

---

## Question 7.4: DLT Table Reference

**Scenario**: A DLT SQL query needs to read from another table defined in the same pipeline.

**Question** *(Easy)*: How should the source table be referenced?

A) `SELECT * FROM source_table`
B) `SELECT * FROM LIVE.source_table`
C) `SELECT * FROM delta.source_table`
D) `SELECT * FROM dlt.source_table`

> [!success]- Answer
> **Correct Answer: B**
>
> In DLT SQL, tables within the pipeline are referenced using the `LIVE.` prefix. This tells DLT that the table is defined within the same pipeline and creates the proper dependency.

---

## Question 7.5: Pipeline Modes

**Scenario**: A DLT pipeline processes data continuously as it arrives with minimal latency.

**Question** *(Easy)*: Which pipeline configuration enables this?

A) `triggered: true`
B) `continuous: true`
C) `development: false`
D) `streaming: true`

> [!success]- Answer
> **Correct Answer: B**
>
> `continuous: true` keeps the pipeline running continuously, processing data as it arrives. Triggered mode (default) processes data in batches when manually started or scheduled. `development` affects cluster size, not processing mode.

---

## Question 7.6: Full Refresh

**Scenario**: A schema change requires reprocessing all historical data in a DLT pipeline.

**Question** *(Easy)*: How should the pipeline be refreshed?

A) Delete the target tables and restart
B) Use `databricks pipelines start --full-refresh`
C) Set `reset: true` in pipeline configuration
D) Drop and recreate the pipeline

> [!success]- Answer
> **Correct Answer: B**
>
> `--full-refresh` flag clears checkpoints and reprocesses all data from the beginning. This preserves pipeline configuration while resetting state. Manually deleting tables or recreating pipelines is error-prone.

---

**[← Previous: Practice Questions - Section 06: Testing & Deployment](./06-testing-deployment.md) | [↑ Back to Practice Questions](./README.md) | [Next: Practice Questions - Section 08: Performance Optimization](./08-performance-optimization.md) →**

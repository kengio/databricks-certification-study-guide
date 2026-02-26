---
title: "Practice Questions: Monitoring & Logging"
type: practice-questions
tags: [data-engineer-professional, practice-questions, monitoring-logging]
---

# Practice Questions - Section 05: Monitoring & Logging (10%)

## Question 5.1: System Tables

**Scenario**: A data engineer needs to track compute costs by team over the past month.

**Question** *(Easy)*: Which system table provides this information?

A) `system.access.audit`
B) `system.billing.usage`
C) `system.compute.clusters`
D) `system.query.history`

> [!success]- Answer
> **Correct Answer: B**
>
> `system.billing.usage` contains cost and usage data including DBUs consumed. `audit` tracks access events. `clusters` contains cluster metadata. `query.history` tracks SQL queries, not costs.

---

## Question 5.2: Spark UI Debugging

**Scenario**: A Spark job is experiencing long task times with high "Shuffle Read Blocked Time."

**Question** *(Medium)*: What does this indicate?

A) Too few partitions
B) Network congestion or slow shuffle fetch
C) Out of memory errors
D) Insufficient disk space

> [!success]- Answer
> **Correct Answer: B**
>
> Shuffle Read Blocked Time indicates tasks waiting for shuffle data from other executors, typically due to network issues or executors being slow to serve shuffle blocks. Solutions include increasing shuffle retry settings or investigating network.

---

## Question 5.3: DLT Event Log

**Scenario**: A DLT pipeline ran with data quality issues. The team needs to find how many records failed expectations.

**Question** *(Easy)*: How can this information be retrieved?

A) Query the Delta table directly
B) Check the Spark UI
C) Query the pipeline's event log
D) Review the cluster logs

> [!success]- Answer
> **Correct Answer: C**
>
> The DLT event log contains expectation metrics including passed/failed record counts. Query it using `event_log(TABLE(pipeline))` or access via the system tables. The event log provides detailed pipeline observability.

---

## Question 5.4: Query Profiler

**Scenario**: A SQL query is running slowly. The data engineer wants to see if partition pruning is working.

**Question** *(Medium)*: What should they look for in EXPLAIN output?

A) `PartitionFilters` showing filter conditions
B) `DataFilters` showing filter conditions
C) `PushedFilters` showing filter conditions
D) All of the above indicate different types of filtering

> [!success]- Answer
> **Correct Answer: D**
>
> `PartitionFilters` shows partition pruning (best). `DataFilters` shows filters applied after scan. `PushedFilters` shows filters pushed to the file format. Ideally, filters should appear in PartitionFilters for best performance.

---

## Question 5.5: Identifying Data Skew

**Scenario**: A job has 99 tasks completing in 1 minute but one task takes 30 minutes.

**Question** *(Medium)*: What is the most likely cause?

A) Insufficient cluster memory
B) Data skew in partition keys
C) Network timeout
D) Corrupt data file

> [!success]- Answer
> **Correct Answer: B**
>
> One task taking much longer than others typically indicates data skew - one partition has significantly more data. Solutions include salting keys, using AQE skew handling, or repartitioning data more evenly.

---

**[← Previous: Practice Questions - Section 04: Security & Governance](./04-security-governance.md) | [↑ Back to Practice Questions](./README.md) | [Next: Practice Questions - Section 06: Testing & Deployment](./06-testing-deployment.md) →**

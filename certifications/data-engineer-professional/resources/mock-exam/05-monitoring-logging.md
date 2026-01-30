# Mock Exam - Section 5: Monitoring & Logging (Questions 46-51)

[Back to Exam Overview](./README.md) | [Previous: Security & Governance](04-security-governance.md) | [Next: Testing & Deployment](06-testing-deployment.md)

---

## Question 46

**Scenario**: A cost analyst needs to identify which jobs consumed the most DBUs last month to optimize spending.

**Question**: Which system table provides this billing information?

A) `system.compute.clusters`
B) `system.billing.usage`
C) `system.access.audit`
D) `system.workflow.jobs`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> The `system.billing.usage` table contains detailed DBU consumption data by workspace, cluster, and SKU. It's the primary source for cost analysis. Option A has cluster metadata. Option C has security audit logs. Option D has job definitions, not cost data.

</details>

---

## Question 47

**Scenario**: A streaming job is running slower than expected. The Spark UI shows that one task in a stage takes 10x longer than the others, while most executors sit idle.

**Question**: What does this pattern indicate and what is the recommended solution?

A) Insufficient executors; increase cluster size
B) Data skew; enable AQE skew join handling or salt the skewed key
C) Memory pressure; increase executor memory
D) Network bottleneck; check cluster networking

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> One slow task with idle executors is the classic sign of data skew--one partition has much more data than others. AQE can automatically split skewed partitions, or you can manually salt keys. Option A wouldn't help if executors are idle. Options C and D show different symptoms.

</details>

---

## Question 48

**Scenario**: A Lakeflow (DLT) pipeline shows "Update Failed" status. The data engineer needs to identify which specific expectation caused the failure.

**Question**: Which approach retrieves the expectation violation details?

A) Check the cluster driver logs
B) Query the pipeline's event log table for expectation metrics
C) Use `dbutils.pipelines.getLatestUpdate()` API
D) Review the pipeline settings in the UI

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> DLT stores detailed metrics including expectation results in the event log. Querying the event log with filters for the update ID shows which expectations failed and the row counts. Option A has limited detail. Option C isn't a valid API. Option D shows configuration, not runtime details.

</details>

---

## Question 49

**Scenario**: A data engineer needs to understand why a SQL query is performing a full table scan despite having filters that should enable partition pruning.

**Question**: Which tool reveals whether partition pruning is occurring?

A) Run `ANALYZE TABLE` to update statistics
B) Run `EXPLAIN` and check for `PartitionFilters` in the plan
C) Check the Query History for execution time breakdown
D) Review the table's `DESCRIBE DETAIL` output

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `EXPLAIN` shows the query execution plan including `PartitionFilters` (pruned partitions) and `PushedFilters` (filters pushed to scan). Empty `PartitionFilters` indicates no pruning occurred. Option A updates statistics but doesn't show the plan. Options C and D don't show execution details.

</details>

---

## Question 50

**Scenario**: The security team requests a report of all users who accessed a specific table containing PII data in the last 7 days.

**Question**: Which system table contains this access information?

A) `system.billing.usage`
B) `system.access.audit`
C) `system.information_schema.tables`
D) `system.compute.clusters`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> The `system.access.audit` table contains audit logs of actions including table reads, with user identity and timestamp. Filter by `action_name` and `request_params` for table access events. Option A has billing data. Option C has table metadata. Option D has cluster info.

</details>

---

## Question 51

**Scenario**: A batch job's execution time has gradually increased from 30 minutes to 2 hours over the past month. The code hasn't changed.

**Question**: Which factors should be investigated first?

A) Data volume growth and partition sizing
B) Cluster hardware degradation
C) Changes to Databricks Runtime
D) Network latency to cloud storage

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> Gradual performance degradation with unchanged code typically indicates data volume growth or small file accumulation (affecting read performance). Check table sizes, file counts, and partition strategies. Option B is unlikely to be gradual. Options C and D would cause immediate changes, not gradual.

</details>

---

[Back to Exam Overview](./README.md) | [Previous: Security & Governance](04-security-governance.md) | [Next: Testing & Deployment](06-testing-deployment.md)

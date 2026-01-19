# Practice Questions

## Data Processing (30%)

### Question 1: Auto Loader Schema Evolution

**Scenario**: A data engineering team ingests JSON files from cloud storage using Auto Loader. New fields are occasionally added to the source data.

**Question**: Which configuration ensures new columns are automatically added to the target table schema?

A) `cloudFiles.schemaEvolutionMode = "addNewColumns"`  
B) `cloudFiles.schemaEvolutionMode = "rescue"`  
C) `cloudFiles.inferColumnTypes = "true"`  
D) `cloudFiles.mergeSchema = "true"`

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> `schemaEvolutionMode = "addNewColumns"` automatically adds new columns to the schema. Option B rescues unexpected data to a separate column. Option C enables type inference but not schema evolution. Option D is not a valid Auto Loader option (that's for Delta writes).

</details>

---

### Question 2: Streaming Triggers

**Scenario**: A streaming job processes data from a message queue. The business requires the job to process all available data once per hour and then stop.

**Question**: Which trigger configuration should be used?

A) `trigger(processingTime='1 hour')`  
B) `trigger(once=True)`  
C) `trigger(availableNow=True)`  
D) `trigger(continuous='1 hour')`

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> `availableNow=True` processes all available data and stops, making it ideal for scheduled batch-like streaming. `processingTime` runs continuously. `once=True` is deprecated and only processes one batch. `continuous` is for low-latency and doesn't stop.

</details>

---

### Question 3: MERGE Operation

**Scenario**: A data engineer needs to update existing records and insert new ones from a source table into a target Delta table.

**Question**: Which MERGE clause handles records that exist in the source but not in the target?

A) `WHEN MATCHED THEN UPDATE`  
B) `WHEN NOT MATCHED THEN INSERT`  
C) `WHEN MATCHED THEN INSERT`  
D) `WHEN NOT MATCHED THEN UPDATE`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `WHEN NOT MATCHED THEN INSERT` handles source records that don't have a matching key in the target. `WHEN MATCHED` handles existing records. Options C and D use invalid clause combinations.

</details>

---

## Unity Catalog (10%)

### Question 4: Permission Inheritance

**Scenario**: A user is granted SELECT on a schema in Unity Catalog.

**Question**: What happens to tables created in that schema after the grant?

A) User automatically has SELECT on new tables  
B) User must be granted SELECT on each new table  
C) User has no access to new tables  
D) User has MODIFY access to new tables

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> Permissions in Unity Catalog inherit downward. A SELECT grant on a schema applies to all current and future tables in that schema. This is a key difference from workspace-level access control.

</details>

---

### Question 5: Managed vs External Tables

**Scenario**: A team needs to register an existing data lake path in Unity Catalog without moving the data.

**Question**: What type of table should they create?

A) Managed table  
B) External table  
C) View  
D) Delta table

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> External tables point to data at a user-specified location. Managed tables store data in Unity Catalog-managed storage. A view doesn't store data. "Delta table" is a format, not a table type.

</details>

---

## Lakeflow/DLT (Variable)

### Question 6: Expectations

**Scenario**: A DLT pipeline requires that all records have a non-null customer_id. Invalid records should be removed but not fail the pipeline.

**Question**: Which expectation syntax achieves this?

A) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL)`  
B) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION DROP ROW`  
C) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION FAIL UPDATE`  
D) `CONSTRAINT valid_id REQUIRE (customer_id IS NOT NULL)`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `ON VIOLATION DROP ROW` removes invalid records without failing. Option A only logs warnings. Option C fails the pipeline. Option D is not valid DLT syntax.

</details>

---

### Question 7: Streaming vs Materialized View

**Scenario**: A DLT pipeline needs a table that aggregates daily sales totals from a streaming source.

**Question**: Which table type is most appropriate?

A) Streaming table  
B) Materialized view  
C) Live table  
D) External table

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Materialized views are appropriate for aggregations as they fully recompute results. Streaming tables are for append-only incremental processing. "Live table" is the old terminology. External tables are not a DLT concept.

</details>

---

## Performance Optimization

### Question 8: OPTIMIZE and ZORDER

**Scenario**: A table frequently filters on `region` and `date` columns. Small files are causing performance issues.

**Question**: Which command best optimizes query performance?

A) `OPTIMIZE table_name`  
B) `OPTIMIZE table_name ZORDER BY (region)`  
C) `OPTIMIZE table_name ZORDER BY (region, date)`  
D) `VACUUM table_name`

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> ZORDER on both frequently filtered columns provides the best query performance. Option A compacts files but doesn't optimize data layout. Option B only optimizes for one column. VACUUM removes old files but doesn't improve query performance.

</details>

---

### Question 9: Shuffle Partitions

**Scenario**: A Spark job processing 10GB of data is running slowly with default settings.

**Question**: What is the default value of `spark.sql.shuffle.partitions` and how should it be adjusted?

A) 100; increase for large data  
B) 200; decrease for small data  
C) 200; increase for large data  
D) 500; keep default for all data

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Default is 200. For 10GB (relatively small), reducing partitions can improve performance by reducing overhead. Each partition has scheduling overhead, so too many partitions for small data is inefficient.

</details>

---

## Deployment & CI/CD

### Question 10: Databricks Asset Bundles

**Scenario**: A team needs to deploy the same pipeline to dev, staging, and production environments.

**Question**: How should environments be configured in Databricks Asset Bundles?

A) Create separate bundle files for each environment  
B) Use targets in databricks.yml with environment-specific settings  
C) Use Git branches for each environment  
D) Manually modify settings before each deployment

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> DAB uses targets to define environment-specific configurations in a single databricks.yml. This is the recommended approach for multi-environment deployments. Separate files or manual changes lead to drift and errors.

</details>

---

## Monitoring & Debugging

### Question 11: System Tables

**Scenario**: A data engineer needs to track compute costs by team over the past month.

**Question**: Which system table provides this information?

A) `system.access.audit`  
B) `system.billing.usage`  
C) `system.compute.clusters`  
D) `system.query.history`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `system.billing.usage` contains cost and usage data. `audit` tracks access events. `clusters` contains cluster metadata. `query.history` tracks SQL queries, not costs.

</details>

---

### Question 12: Spark UI Debugging

**Scenario**: A Spark job is experiencing long task times with high "Shuffle Read Blocked Time."

**Question**: What does this indicate?

A) Too few partitions  
B) Network congestion or slow shuffle fetch  
C) Out of memory errors  
D) Insufficient disk space

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Shuffle Read Blocked Time indicates tasks waiting for shuffle data from other executors, typically due to network issues or executors being slow to serve shuffle blocks. Solutions include increasing shuffle retry settings or investigating network.

</details>

---

## Scoring Guide

| Score | Assessment |
|-------|------------|
| 10-12 correct | Ready for exam |
| 7-9 correct | Review weak areas |
| 4-6 correct | More study needed |
| 0-3 correct | Significant preparation required |

## Additional Practice Resources

- [Udemy Practice Exams](https://www.udemy.com/topic/databricks-certified-data-engineer-professional/)
- [ExamTopics](https://www.examtopics.com/exams/databricks/certified-data-engineer-professional/)
- [SkillCertPro](https://skillcertpro.com/product/databricks-data-engineer-professional-practice-tests/)

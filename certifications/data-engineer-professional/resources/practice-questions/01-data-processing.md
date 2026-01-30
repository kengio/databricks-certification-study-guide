# Practice Questions - Section 01: Data Processing (30%)

[Back to Overview](./README.md) | [Next: Databricks Tooling](02-databricks-tooling.md)

---

## Question 1.1: Auto Loader Schema Evolution

**Scenario**: A data engineering team ingests JSON files from cloud storage using Auto Loader. New fields are occasionally added to the source data.

**Question**: Which configuration ensures new columns are automatically added to the target table schema?

A) `cloudFiles.schemaEvolutionMode = "addNewColumns"`
B) `cloudFiles.schemaEvolutionMode = "rescue"`
C) `cloudFiles.inferColumnTypes = "true"`
D) `cloudFiles.mergeSchema = "true"`

> [!success]- Answer
> **Correct Answer: A**
>
> `schemaEvolutionMode = "addNewColumns"` automatically adds new columns to the schema. Option B rescues unexpected data to a separate column. Option C enables type inference but not schema evolution. Option D is not a valid Auto Loader option (that's for Delta writes).

---

## Question 1.2: Streaming Triggers

**Scenario**: A streaming job processes data from a message queue. The business requires the job to process all available data once per hour and then stop.

**Question**: Which trigger configuration should be used?

A) `trigger(processingTime='1 hour')`
B) `trigger(once=True)`
C) `trigger(availableNow=True)`
D) `trigger(continuous='1 hour')`

> [!success]- Answer
> **Correct Answer: C**
>
> `availableNow=True` processes all available data and stops, making it ideal for scheduled batch-like streaming. `processingTime` runs continuously. `once=True` is deprecated and only processes one batch. `continuous` is for low-latency and doesn't stop.

---

## Question 1.3: MERGE Operation

**Scenario**: A data engineer needs to update existing records and insert new ones from a source table into a target Delta table.

**Question**: Which MERGE clause handles records that exist in the source but not in the target?

A) `WHEN MATCHED THEN UPDATE`
B) `WHEN NOT MATCHED THEN INSERT`
C) `WHEN MATCHED THEN INSERT`
D) `WHEN NOT MATCHED BY SOURCE THEN DELETE`

> [!success]- Answer
> **Correct Answer: B**
>
> `WHEN NOT MATCHED THEN INSERT` handles source records that don't have a matching key in the target. `WHEN MATCHED` handles existing records. Option C is invalid syntax. Option D handles records in target not in source.

---

## Question 1.4: Change Data Feed

**Scenario**: A data engineer needs to track all changes (inserts, updates, deletes) to a Delta table for downstream CDC processing.

**Question**: Which statement correctly enables this capability?

A) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataCapture' = true)`
B) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataFeed' = true)`
C) `ALTER TABLE orders ENABLE CHANGE TRACKING`
D) `CREATE TABLE orders WITH (CDC = ENABLED)`

> [!success]- Answer
> **Correct Answer: B**
>
> `delta.enableChangeDataFeed = true` enables Change Data Feed (CDF) on a Delta table. This allows reading changes using `table_changes()` function or `readChangeData` option. The other options use incorrect syntax.

---

## Question 1.5: Watermarking in Streaming

**Scenario**: A streaming aggregation job groups events by a 10-minute window. Events can arrive up to 30 minutes late.

**Question**: Which watermark configuration is correct?

A) `withWatermark("event_time", "10 minutes")`
B) `withWatermark("event_time", "30 minutes")`
C) `withWatermark("event_time", "40 minutes")`
D) `withWatermark("processing_time", "30 minutes")`

> [!success]- Answer
> **Correct Answer: B**
>
> The watermark should match the maximum expected lateness (30 minutes). This tells Spark to wait 30 minutes before finalizing windows. Using event_time (not processing_time) is required for event-time processing.

---

## Question 1.6: Incremental Processing with readStream

**Scenario**: A pipeline reads from a Delta table that receives both inserts and updates. Only new and updated records should be processed.

**Question**: Which configuration enables this?

A) `spark.readStream.option("ignoreChanges", "true").table("source")`
B) `spark.readStream.option("readChangeData", "true").table("source")`
C) `spark.readStream.option("readChangeFeed", "true").table("source")`
D) `spark.readStream.option("skipChangeCommits", "true").table("source")`

> [!success]- Answer
> **Correct Answer: C**
>
> `readChangeFeed = true` (with CDF enabled on the table) reads the change data feed which includes inserts, updates, and deletes. Option A ignores updates/deletes. Option B uses the wrong option name (`readChangeData` is not valid; the correct name is `readChangeFeed`). Option D is not a valid option.

---

[Back to Overview](./README.md) | [Next: Databricks Tooling](02-databricks-tooling.md)

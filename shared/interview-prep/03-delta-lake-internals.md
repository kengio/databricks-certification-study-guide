---
tags: [interview-prep, delta-lake]
---

# Interview Questions — Delta Lake Internals

---

## Question 1: The Transaction Log and ACID Guarantees

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Explain how Delta Lake achieves ACID transactions on top of cloud object storage. Walk me through what happens when two jobs try to write to the same table at the same time.

> [!success]- Answer Framework
>
> **Short Answer**: Delta Lake uses a `_delta_log/` directory as a write-ahead log — every write atomically appends a new JSON commit file listing add/remove file actions; concurrent writers use optimistic concurrency control (both proceed, first to write the next version wins, the other detects a conflict and retries), and checkpoint Parquet files are written every 10 commits to speed up log replay.
>
> ### Key Points to Cover
>
> - `_delta_log/` directory stores ordered JSON transaction files
> - Each commit = a new JSON file with add/remove file actions
> - Optimistic concurrency: both writers proceed, conflict detected at commit time
> - `ConcurrentAppendException` vs `ConcurrentDeleteReadException`
> - Checkpoint files every 10 commits for faster log replay
> - Protocol action ensures minimum reader/writer version compatibility
>
> ### Example Answer
>
> Delta Lake achieves ACID by using the `_delta_log/` directory as a **write-ahead log** on top of cloud object storage. Every write — whether an INSERT, UPDATE, DELETE, or MERGE — produces a new zero-padded JSON file in this log (e.g., `00000000000000000003.json`). A transaction is considered committed only when its log file is successfully written. If two writers race, only one can "win" the log file for a given version number; the other must retry.
>
> For **Atomicity**: either the log file is written with all file actions, or none of them take effect. There's no partial write state.
>
> For **Isolation**: Delta uses **optimistic concurrency control**. Both writers read the current table state, compute their changes, and try to write the next log version. The first to commit wins. The second detects a conflict and either retries (if the operations don't overlap) or raises `ConcurrentModificationException`.
>
> ```text
> Writer A: reads version 5, computes changes, tries to write 00000...0006.json ✓
> Writer B: reads version 5, computes changes, tries to write 00000...0006.json ✗
>           → detects conflict → retries by reading version 6 → writes version 7
> ```
>
> For **Durability**: cloud object stores (S3, ADLS, GCS) provide strong consistency — once a file is written and the PUT succeeds, it's durable. Delta relies on this guarantee.
>
> Checkpoint files (`.checkpoint.parquet`) are written every 10 commits to allow log replay without reading hundreds of JSON files.
>
> ### Follow-up Questions
>
> - What is the difference between `ConcurrentAppendException` and `ConcurrentDeleteReadException`?
> - When would you set `isolationLevel = 'Serializable'` and what's the performance cost?
> - How does the checkpoint file affect startup time for a table with 10,000 commits?
> - What happens to the transaction log when you run `VACUUM`?

---

## Question 2: Concurrent Writers and Conflict Resolution

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
You have a Silver table that's written by two jobs simultaneously — one appends new rows, and another runs a MERGE to update existing rows. Under what conditions will they conflict? How would you design around it?

> [!success]- Answer Framework
>
> **Short Answer**: Append + append never conflicts (both add new files to the log); append + MERGE conflicts only if MERGE touches the same partitions/files as the append; MERGE + MERGE always conflicts because both read the same files — design around this with partition isolation, scheduling order, or DLT.
>
> ### Key Points to Cover
>
> - Append-only vs. MERGE: append + append = no conflict (both write new files)
> - Append + MERGE may conflict if MERGE touches the same partitions/files
> - `WriteSerializable` (default) vs `Serializable` isolation levels
> - Design solution: separate append and merge to different schedules or partition scopes
> - Delta's optimistic concurrency will retry appends automatically
> - Partition-level isolation reduces conflict surface area
>
> ### Example Answer
>
> Delta Lake's default isolation level is `WriteSerializable`, which allows concurrent reads during writes. The conflict rules are:
>
> - **Append + Append**: No conflict — both jobs add new files, both succeed
> - **Append + MERGE**: Only conflicts if MERGE touches files that the append also affects (same partition). If they write to different partitions, Delta can reconcile them.
> - **MERGE + MERGE**: Always conflicts — both read the same files to find matches
>
> Design strategies to avoid conflicts:
>
> 1. **Partition isolation**: If your table is partitioned by `event_date`, the append job writes to today's partition while the MERGE targets yesterday's. No conflict.
>
> 2. **Schedule separation**: Run the MERGE first, then trigger the append. Use Databricks Workflows with `depends_on` to enforce order.
>
> 3. **Use DLT**: Delta Live Tables handles concurrent write orchestration automatically by managing the execution order of pipeline stages.
>
> 4. **Retry logic**: For non-critical appends, wrap in a retry loop — Delta's conflict detection is designed for this:
>
> ```python
> from delta.exceptions import ConcurrentModificationException
> import time
>
> for attempt in range(3):
>     try:
>         df.write.format("delta").mode("append").save(path)
>         break
>     except ConcurrentModificationException:
>         time.sleep(2 ** attempt)
> ```
>
> ### Follow-up Questions
>
> - If I set `Serializable` isolation, what operations become more expensive?
> - Two streaming jobs write to the same Delta table — do they conflict?
> - What's the difference between `optimisticTransaction` retry and a simple job retry?

---

## Question 3: OPTIMIZE, ZORDER, and Liquid Clustering — When to Use Which

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A Delta table has 500 million rows and users typically filter by `customer_id` and `order_date`. You're seeing slow query performance. Walk me through how you'd decide between partitioning, Z-ordering, and Liquid Clustering.

> [!success]- Answer Framework
>
> **Short Answer**: Partition on `order_date` (low cardinality, enables partition pruning) and Z-ORDER on `customer_id` within each partition for an existing table; for a new table, prefer Liquid Clustering on both columns — it auto-maintains, allows flexible column changes, and eliminates the need for manual `OPTIMIZE ZORDER` schedules.
>
> ### Key Points to Cover
>
> - Partitioning: best for low-cardinality columns (date, region); enables partition pruning
> - Z-ORDER: co-locates related data for high-cardinality columns; requires manual OPTIMIZE runs
> - Liquid Clustering: replaces both for new tables; auto-maintains, flexible column changes
> - Data skipping: all three enable file-level min/max statistics for skipping
> - Check `DESCRIBE DETAIL` for file count and size before choosing
>
> ### Example Answer
>
> First, I'd diagnose: run `DESCRIBE DETAIL orders` to see file count and average file size, and check the Spark UI for how many files are being scanned per query.
>
> The decision tree for this case:
>
> **`order_date`** has low cardinality (maybe 1,000–3,000 distinct values) → good candidate for **partitioning**. Partition pruning eliminates entire directories from the scan.
>
> **`customer_id`** has high cardinality (millions of customers) → terrible for partitioning (too many partitions, tiny files). Good candidate for **Z-ORDER** or **Liquid Clustering**.
>
> For an existing table:
>
> ```sql
> -- Partition by date (done at table creation, can't change easily)
> -- Then Z-ORDER within each partition by customer_id
> OPTIMIZE orders ZORDER BY (customer_id);
> ```
>
> For a new table (Databricks 13.3+):
>
> ```sql
> CREATE TABLE orders (
>     order_id BIGINT,
>     customer_id BIGINT,
>     order_date DATE,
>     amount DECIMAL(10,2)
> ) USING DELTA
> CLUSTER BY (customer_id, order_date);
> ```
>
> Liquid Clustering is preferred for new tables because: (1) no manual `OPTIMIZE ZORDER` schedule needed, (2) clustering columns can change with `ALTER TABLE`, (3) it works incrementally — only new data gets clustered.
>
> ### Follow-up Questions
>
> - What does `OPTIMIZE ZORDER` actually do to the Parquet files?
> - How does Delta's data skipping use min/max statistics and where are those stored?
> - Your table is partitioned by `year/month/day` and has 100,000 partitions. What problems does this cause?
> - How do you know if a query is actually benefiting from Z-ORDER?

---

## Question 4: MERGE Operation Internals

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Walk me through exactly what happens under the hood when you run a MERGE statement on a Delta table with 1 billion rows. How does Delta avoid reading all 1 billion rows?

> [!success]- Answer Framework
>
> **Short Answer**: Delta MERGE uses min/max statistics from the transaction log to identify only the files that could contain matching rows (data skipping), opens and joins just those candidate files, then rewrites only the touched files atomically in the log — files with no matches are untouched, so a well-clustered table on the join key can limit MERGE to reading < 1% of total data.
>
> ### Key Points to Cover
>
> - Delta reads source, joins against target using join predicate
> - Data skipping: min/max statistics narrow which files to read from target
> - Only files that may contain matching rows are opened
> - Files with matches are rewritten (touched files replaced); unmatched files untouched
> - Transaction log records: RemoveFile (old) + AddFile (new) for touched files
> - Photon accelerates MERGE significantly
>
> ### Example Answer
>
> MERGE in Delta Lake is smarter than a full table scan. Here's the execution flow:
>
> 1. **Read source**: Load the source DataFrame (e.g., today's updates — maybe 100K rows).
>
> 2. **Data skipping on target**: Delta reads the transaction log to find which Parquet files might contain matching rows, using stored min/max statistics on the join key. If `order_id` ranges [1–10M] live in files 1–50, and your source has `order_id` in [500K–600K], Delta only opens those files — not all 1 billion rows.
>
> 3. **Join + classify**: Spark inner-joins source rows against candidate target files to find `MATCHED` rows, and identifies rows in source not found in target (`NOT MATCHED`).
>
> 4. **Rewrite touched files**: Parquet is immutable — Delta can't edit in place. Instead, it rewrites only the files that contain matched rows, applying the update/delete logic. Files with no matches are left untouched.
>
> 5. **Commit**: The transaction log records `RemoveFile` actions for old versions of touched files and `AddFile` actions for the newly written files. This is an atomic operation.
>
> The efficiency comes from **only rewriting the small subset of files that contain matches**. On a well-organized table (Z-ordered or Liquid Clustered on the join key), this can be < 1% of total files.
>
> ### Follow-up Questions
>
> - What happens if your MERGE source has 50M rows and the join key has poor selectivity?
> - How does `WHEN NOT MATCHED BY SOURCE THEN DELETE` change the execution plan?
> - What's the difference between `UPDATE SET *` and specifying individual columns in MERGE?
> - How would you tune a slow MERGE — what would you check first?

---

## Question 5: Time Travel — How It Works and Its Limits

**Level**: Associate
**Type**: Deep Dive

**Scenario / Question**:
A data engineer accidentally ran `DELETE FROM orders WHERE order_date < '2024-01-01'` on production. They want to restore the deleted rows. How does Delta time travel work, and what could prevent it from working in this scenario?

> [!success]- Answer Framework
>
> **Short Answer**: Delta keeps logically removed Parquet files on disk until VACUUM deletes them; time travel works by reading the transaction log at an earlier version which still references those original files — `RESTORE TABLE` reverses the delete atomically, but only works if VACUUM hasn't already purged the files (default 7-day retention).
>
> ### Key Points to Cover
>
> - Time travel reads older Parquet files referenced by earlier transaction log versions
> - `RESTORE TABLE` brings the table back to a previous state
> - VACUUM is the only thing that permanently deletes files (removes them from disk)
> - Default retention: 7 days (168 hours); `VACUUM RETAIN 0 HOURS` is dangerous
> - `deletedFileRetentionDuration` controls how long removed files stay on disk
>
> ### Example Answer
>
> Delta time travel works by keeping the original Parquet data files on disk even after they've been logically "removed" by a DELETE or OVERWRITE. The transaction log records a `RemoveFile` action pointing to the old files, but the files themselves stay on cloud storage until VACUUM deletes them.
>
> To restore, the engineer has two options:
>
> ```sql
> -- Option 1: Query the previous version to see what was deleted
> SELECT * FROM orders VERSION AS OF 42;
>
> -- Option 2: Restore the entire table to before the delete
> RESTORE TABLE orders TO VERSION AS OF 42;
>
> -- Or by timestamp (1 hour before the delete)
> RESTORE TABLE orders TO TIMESTAMP AS OF '2026-02-17 14:00:00';
> ```
>
> **What prevents this from working:**
>
> - **VACUUM was run** after the DELETE: If `VACUUM` has run since the delete and the retention period (default 7 days) has elapsed, the old Parquet files are gone permanently. Time travel shows the version in the log, but reading it fails because the files no longer exist on disk.
> - **Retention too short**: If someone ran `VACUUM RETAIN 0 HOURS` (bypassing the safety check), files are immediately deleted.
>
> Best practice: increase the default retention for critical tables:
>
> ```sql
> ALTER TABLE orders
> SET TBLPROPERTIES ('delta.deletedFileRetentionDuration' = '30 days');
> ```
>
> ### Follow-up Questions
>
> - What is the difference between `RESTORE TABLE` and reading a previous version with `VERSION AS OF`?
> - Can you time travel on an external Delta table where the files are in a different bucket?
> - How does `DESCRIBE HISTORY orders` help you identify which version to restore?
> - What's the storage cost implication of setting a 30-day retention?

---

## Question 6: Change Data Feed vs Change Data Capture

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
A colleague says "Delta's Change Data Feed is the same as Change Data Capture — we don't need Debezium anymore." How would you respond? When would you use each?

> [!success]- Answer Framework
>
> **Short Answer**: Delta CDF tracks row-level changes (insert/update/delete with `_change_type` metadata) within Delta tables and is ideal for propagating changes between lakehouse layers; CDC tools like Debezium read changes from external database transaction logs and are required when the source is not a Delta table — they are complementary and most architectures use both.
>
> ### Key Points to Cover
>
> - CDF = Delta-native feature that tracks row changes in Delta tables (not source systems)
> - CDC = broader pattern for capturing changes from source systems (databases, apps)
> - Debezium / CDC tools read database transaction logs (PostgreSQL WAL, MySQL binlog)
> - CDF is useful for propagating changes *within* a lakehouse (Bronze → Silver → Gold)
> - Debezium is needed when the source is not a Delta table
> - They are complementary, not mutually exclusive
>
> ### Example Answer
>
> Your colleague is partially right — but these solve different problems, and in most architectures you need both.
>
> **Change Data Feed (CDF)** is a Delta Lake feature that tracks row-level changes (inserts, updates, deletes) made to a **Delta table**. It adds metadata columns (`_change_type`, `_commit_version`, `_commit_timestamp`) that downstream jobs can read to process only changed rows:
>
> ```sql
> -- Enable CDF on a Delta table
> ALTER TABLE silver.orders
> SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');
>
> -- Read only changes since version 50
> SELECT * FROM table_changes('silver.orders', 50);
> ```
>
> CDF is ideal for **propagating changes within the lakehouse** — e.g., Silver → Gold incremental updates, or triggering downstream ML retraining on only changed rows.
>
> **Change Data Capture (CDC)** refers to the pattern of capturing changes from **source systems** — usually relational databases — using tools like Debezium (reads PostgreSQL WAL), AWS DMS, or Fivetran. These tools emit events for every INSERT/UPDATE/DELETE in the source database before they ever reach your lakehouse.
>
> **When to use each:**
>
> | Scenario | Use |
> | -------- | --- |
> | Source is PostgreSQL/MySQL/Oracle | Debezium or DMS (CDC tool) |
> | Propagate changes Bronze → Silver | Delta CDF |
> | Build incremental Gold aggregations | Delta CDF |
> | Sync lakehouse data to another system | Delta CDF |
> | Source is a SaaS API | Custom CDC / Fivetran |
>
> In practice, a complete pipeline often uses Debezium to ingest from PostgreSQL into Bronze, then CDF to propagate changes from Bronze → Silver → Gold.
>
> ### Follow-up Questions
>
> - CDF must be enabled before changes occur — what happens if you enable it after data already exists?
> - How do you handle `update_preimage` vs `update_postimage` rows in CDF output?
> - A downstream consumer reads CDF changes every 15 minutes. How do you ensure they don't miss any changes if the stream falls behind?

---

## Question 7: VACUUM Best Practices & Retention

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Your Delta tables are consuming 3x the expected storage because old files aren't being cleaned up. Explain how VACUUM works and the trade-offs of different retention policies.

> [!success]- Answer Framework
>
> **Short Answer**: VACUUM removes data files no longer referenced by the current table version AND older than the retention threshold (default 7 days); once vacuumed, you cannot time-travel to versions that relied on deleted files — set retention based on business needs (audit requirements may need 30-90 days), schedule VACUUM as a maintenance job during off-peak hours, and never lower retention below 7 days unless you fully understand the consequences.
>
> ### Key Points to Cover
>
> - VACUUM removes data files no longer referenced by the current table version AND older than the retention threshold
> - Default retention: 7 days (`delta.deletedFileRetentionDuration = 'interval 7 days'`)
> - Time travel dependency: once vacuumed, you CANNOT time-travel to versions that relied on deleted files
> - Safety check: Databricks prevents VACUUM with retention < 7 days unless you set `spark.databricks.delta.retentionDurationCheck.enabled = false` — DANGEROUS
> - VACUUM does NOT delete the transaction log files (JSON/checkpoint) — only data files
> - `VACUUM` runs on the driver and can be slow for large tables — consider off-peak scheduling
> - Best practice: schedule VACUUM as a maintenance job (daily/weekly), set retention based on business needs
>
> ### Example Answer
>
> VACUUM is Delta Lake's garbage collection mechanism. It removes Parquet data files that are no longer referenced by the current version of the table AND that are older than the retention threshold.
>
> **How VACUUM decides what to delete:**
>
> 1. Read the transaction log to identify all data files referenced by the **current** table version
> 2. List all data files in the table's storage directory
> 3. Any file NOT in the current version's reference list AND older than the retention period is deleted
>
> **Default retention and time travel trade-off:**
>
> ```sql
> -- Default: files older than 7 days are eligible for deletion
> VACUUM schema.table_name;
>
> -- Explicit retention: keep files for 168 hours (7 days)
> VACUUM schema.table_name RETAIN 168 HOURS;
>
> -- Check what versions exist before vacuuming
> DESCRIBE HISTORY schema.table_name;
> ```
>
> Once VACUUM deletes a file, any time travel query that depends on that file will fail with a `FileNotFoundException`. For example, if version 42 references `part-00001.parquet` and VACUUM deletes it, `SELECT * FROM table VERSION AS OF 42` will fail even though the log entry still exists.
>
> **Retention policy trade-offs:**
>
> | Retention | Pros | Cons |
> | --------- | ---- | ---- |
> | 7 days (default) | Reasonable storage cost | Limited time travel window |
> | 30-90 days | Audit compliance, longer rollback | 3-10x storage overhead |
> | 0 hours | Minimal storage | No time travel at all — DANGEROUS |
>
> **Safety check:** Databricks prevents VACUUM with retention < 7 days by default. To override:
>
> ```python
> # DANGEROUS — only do this if you understand the consequences
> spark.conf.set(
>     "spark.databricks.delta.retentionDurationCheck.enabled",
>     "false"
> )
> ```
>
> **Important distinctions:**
>
> - VACUUM deletes **data files** (Parquet) — NOT transaction log files (JSON/checkpoint in `_delta_log/`)
> - Transaction log cleanup is handled separately by Delta's log compaction (checkpoint files every 10 commits)
> - VACUUM runs on the **driver node**, not distributed across executors — it can be slow for tables with millions of files
>
> **Best practice — schedule as maintenance:**
>
> ```sql
> -- Run during off-peak hours as a scheduled job
> VACUUM schema.table_name RETAIN 168 HOURS;
>
> -- For critical tables with audit requirements
> ALTER TABLE schema.table_name
> SET TBLPROPERTIES ('delta.deletedFileRetentionDuration' = '90 days');
> ```
>
> ### Follow-up Questions
>
> - What happens to the transaction log when you run VACUUM? Does it get cleaned up too?
> - How does VACUUM interact with concurrent readers — can a long-running query fail if VACUUM deletes files it's reading?
> - What's the storage cost impact of increasing retention from 7 days to 90 days on a table with frequent updates?

---

## Question 8: Delta Table Corruption Recovery

**Level**: Both
**Type**: Scenario

**Scenario / Question**:
A production Delta table has become corrupted — queries return wrong results after an accidental UPDATE with a bad WHERE clause. How do you recover?

> [!success]- Answer Framework
>
> **Short Answer**: Use `DESCRIBE HISTORY` to identify the version before the bad change, then `RESTORE TABLE ... TO VERSION AS OF <good_version>` to atomically revert the table; verify with row counts and checksums against expected values; for extra safety, create a deep clone backup before restoring, and implement prevention measures like testing UPDATE/DELETE statements with SELECT first.
>
> ### Key Points to Cover
>
> - Step 1: `DESCRIBE HISTORY` to identify which version introduced the bad change
> - Step 2: `RESTORE TABLE ... TO VERSION AS OF <good_version>` — atomically reverts to a previous state
> - Step 3: Verify with `SELECT COUNT(*), SUM(amount)` and compare to expected values
> - Alternative: `CREATE TABLE backup AS SELECT * FROM table VERSION AS OF <good_version>` for side-by-side comparison
> - Shallow clone vs deep clone for backup: shallow = metadata only (fast, space-efficient), deep = full data copy (independent but expensive)
> - Prevention: always test UPDATE/DELETE with SELECT first, use transactions with proper WHERE clauses
> - Transaction log corruption (rare): if `_delta_log/` is damaged, may need to reconstruct from checkpoint files
>
> ### Example Answer
>
> This is a recoverable situation as long as VACUUM hasn't deleted the old data files. Here's the recovery process:
>
> **Step 1 — Identify the bad version:**
>
> ```sql
> -- Show recent operations on the table
> DESCRIBE HISTORY schema.table_name;
> ```
>
> The output shows each version with its timestamp, operation type (UPDATE, DELETE, MERGE), and the user who ran it. Find the version number just BEFORE the accidental UPDATE — say version 15 was the last good state and version 16 was the bad UPDATE.
>
> **Step 2 — Verify the good version has correct data:**
>
> ```sql
> -- Peek at the good version before restoring
> SELECT COUNT(*) AS row_count,
>        SUM(amount) AS total_amount
> FROM schema.table_name VERSION AS OF 15;
> ```
>
> Compare these values against known-good metrics (dashboards, reports, upstream source counts).
>
> **Step 3 — Restore the table:**
>
> ```sql
> -- Atomically revert to the good version
> RESTORE TABLE schema.table_name TO VERSION AS OF 15;
> ```
>
> `RESTORE` is an atomic operation — it creates a new commit in the transaction log that references the same data files as version 15. No data is physically copied; it simply updates the log to point back to the old files.
>
> **Step 4 — Verify the restoration:**
>
> ```sql
> SELECT COUNT(*) AS row_count,
>        SUM(amount) AS total_amount
> FROM schema.table_name;
> -- Should match the values from Step 2
> ```
>
> **Alternative — Deep clone for safety:**
>
> If you want a safety net before restoring, create a backup first:
>
> ```sql
> -- Deep clone: full independent copy of the good version
> CREATE TABLE schema.table_name_backup
> DEEP CLONE schema.table_name VERSION AS OF 15;
>
> -- Shallow clone: metadata-only reference (fast but depends on source files)
> CREATE TABLE schema.table_name_backup_shallow
> SHALLOW CLONE schema.table_name VERSION AS OF 15;
> ```
>
> | Clone Type | Speed | Storage Cost | Independent? |
> | ---------- | ----- | ------------ | ------------ |
> | Deep clone | Slow (copies all data) | Full duplicate | Yes — survives VACUUM on source |
> | Shallow clone | Fast (metadata only) | Minimal | No — breaks if source files are vacuumed |
>
> **Prevention measures:**
>
> - **Always test with SELECT first**: Before running `UPDATE ... SET ... WHERE ...`, run the same `SELECT ... WHERE ...` to verify the WHERE clause returns the expected rows
> - **Use row-level checks**: After critical operations, validate row counts and checksums against expected values
> - **Schedule regular deep clone backups**: For mission-critical tables, maintain a nightly deep clone as an independent recovery point
>
> **Transaction log corruption (rare edge case):**
>
> If the `_delta_log/` directory itself is corrupted (e.g., files accidentally deleted from cloud storage), recovery is harder. Delta writes checkpoint files every 10 commits — if the latest checkpoint is intact, Delta can recover from it. If not, you may need to reconstruct from cloud storage backup or the data files themselves.
>
> ### Follow-up Questions
>
> - What's the difference between RESTORE and reading data with `VERSION AS OF`? Does RESTORE copy data?
> - How do shallow and deep clones differ in terms of VACUUM dependency and storage cost?
> - How would you prevent accidental data corruption in production — what guardrails would you implement?

---

**[← Previous: File Formats & Spark Internals](./02-file-formats-spark-internals.md) | [↑ Back to Interview Prep](./README.md) | [Next: Pipeline Architecture →](./04-pipeline-architecture.md)**

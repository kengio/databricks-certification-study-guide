---
deck: Databricks::Shared::Delta Lake
tags:
  - delta-lake
  - de-associate
  - de-professional
---

# Delta Lake — Anki Deck

> [!info]
> 27 cards covering Delta Lake fundamentals: storage format, ACID semantics, table maintenance (OPTIMIZE / VACUUM / Z-order / Liquid Clustering), Time Travel, CDF, and the schema-management API. Sourced from `shared/cheat-sheets/delta-lake-commands.md` and `shared/fundamentals/delta-lake-basics.md`.

## What is Delta Lake?

In one sentence, what storage format does Delta Lake add on top of, and what does it add?

> [!success]- Answer
> Delta Lake is **Parquet** + a JSON transaction log (`_delta_log/`) that together provide ACID guarantees, time travel, schema evolution, and DML (UPDATE/DELETE/MERGE) on object storage.

## Where is the transaction log stored?

A Delta table at `s3://bucket/sales/` keeps its transaction log where exactly?

> [!success]- Answer
> `s3://bucket/sales/_delta_log/` — a sibling directory next to the Parquet data files. Each successful commit writes a new `0000…N.json` file there; periodically checkpointed to Parquet.

## ACID — the four properties

What does each letter in ACID guarantee in Delta Lake?

> [!success]- Answer
> - **A**tomicity — a write either fully commits or doesn't appear at all (no partial states)
> - **C**onsistency — readers see a valid table state at every version
> - **I**solation — concurrent writers can't see each other's uncommitted data (snapshot isolation)
> - **D**urability — once committed, the change survives node / cluster failure

## OPTIMIZE — what does it do?

What does `OPTIMIZE <table>` do, and what's the default target file size?

> [!success]- Answer
> Coalesces small Parquet files into larger ones to reduce small-file overhead on reads. Default target: **`delta.targetFileSize` ≈ 1 GB** (auto-tuned). Doesn't change row content — just rewrites files.

## Z-ordering — what and when

What is Z-ordering and what's the canonical column type to Z-order on?

> [!success]- Answer
> Z-ordering is **multi-dimensional clustering** that co-locates rows with similar values for the specified columns on disk. Apply to **high-cardinality columns that appear in WHERE clauses**, especially equality and range filters. Syntax: `OPTIMIZE <table> ZORDER BY (col1, col2)`.

## Liquid Clustering vs Z-ordering

Same use case, different mechanisms — when do you pick Liquid Clustering over Z-ordering?

> [!success]- Answer
> Pick **Liquid Clustering** (`CLUSTER BY`) on any new table on **DBR 13.3+** because it:
>
> - Clusters incrementally as data is written (no manual `OPTIMIZE ZORDER BY` reruns)
> - Lets you change the clustering keys without a full rewrite
> - Works on both the read path (predicate pushdown) and the merge path
>
> Z-ordering is the legacy approach — keep using it only for existing tables you can't migrate.

## VACUUM — what and default retention

What does `VACUUM` do, and what's its default retention?

> [!success]- Answer
> Deletes files no longer referenced by the current table version *and* older than the retention threshold. **Default retention: 7 days (168 hours).** Lower thresholds risk breaking Time Travel and concurrent readers.

## VACUUM safety threshold

Why does Databricks enforce a minimum retention of 168 hours by default on VACUUM?

> [!success]- Answer
> So in-flight readers and writers (which may have started before the VACUUM and still hold references to older files) don't get `FileNotFoundException`. To override: set `spark.databricks.delta.retentionDurationCheck.enabled = false` — only when you're sure no concurrent operations span the gap.

## Time Travel — by version

Read a Delta table at a specific commit version. Syntax in SQL and PySpark?

> [!success]- Answer
> SQL: `SELECT * FROM events VERSION AS OF 5`
>
> PySpark: `spark.read.format("delta").option("versionAsOf", 5).load(path)`

## Time Travel — by timestamp

What's the syntax to read a Delta table as it existed at `2026-05-01 09:00:00`?

> [!success]- Answer
> SQL: `SELECT * FROM events TIMESTAMP AS OF '2026-05-01 09:00:00'`
>
> PySpark: `spark.read.format("delta").option("timestampAsOf", "2026-05-01 09:00:00").load(path)`
>
> Note: timestamps resolve to the *latest commit at or before* the given timestamp.

## RESTORE TABLE

What does `RESTORE TABLE <name> TO VERSION AS OF 5` do, and is it destructive?

> [!success]- Answer
> Rolls the table state back to version 5 by writing a *new* commit that reverses subsequent changes. **Not destructive** — versions 6, 7, … remain accessible via Time Travel until VACUUM removes their files.

## Schema evolution — mergeSchema

How do you add a new column at write time without manually altering the table?

> [!success]- Answer
> Set `.option("mergeSchema", "true")` on the write. Allowed evolution: adding new columns, widening compatible types (e.g., int → long). Disallowed: dropping columns, narrowing types, renaming.

## Schema enforcement

If you try to write a column that doesn't exist in a Delta table and don't set `mergeSchema`, what happens?

> [!success]- Answer
> The write fails with `AnalysisException` — Delta enforces schema at write time by default. This is the safety net that prevents silent data corruption.

## CHECK constraints

How do you ensure a column never has negative values, and what happens if a write violates it?

> [!success]- Answer
> `ALTER TABLE sales ADD CONSTRAINT positive_amount CHECK (amount >= 0)`. Subsequent writes that violate the constraint fail at commit time — the bad batch is rejected entirely (atomic).

## DESCRIBE HISTORY

What does `DESCRIBE HISTORY <table>` show, and how is it useful in incident response?

> [!success]- Answer
> Returns one row per commit with: version, timestamp, user, operation (WRITE / UPDATE / MERGE / OPTIMIZE / VACUUM / etc.), operationParameters, and metrics. In incident response: trace exactly which write broke the table and which version to RESTORE to.

## MERGE INTO — basic syntax

Write the canonical upsert pattern with MERGE INTO.

> [!success]- Answer
> ```sql
> MERGE INTO target t
> USING source s
> ON t.id = s.id
> WHEN MATCHED THEN UPDATE SET *
> WHEN NOT MATCHED THEN INSERT *
> ```

## Idempotent writes — txnVersion / txnAppId

How do you make a Structured Streaming write idempotent across retries?

> [!success]- Answer
> Set `.option("txnAppId", "<app-id>").option("txnVersion", <monotonic-id>)` on the write. Delta dedupes on `(txnAppId, txnVersion)` — re-running the same `(appId, version)` is a no-op.

## Change Data Feed (CDF) — enable

How do you enable CDF on an existing Delta table, and how do you read the changes?

> [!success]- Answer
> Enable: `ALTER TABLE sales SET TBLPROPERTIES (delta.enableChangeDataFeed = true)`
>
> Read: `SELECT * FROM table_changes('sales', startVersion, endVersion)` — returns columns plus `_change_type` (insert / update_preimage / update_postimage / delete), `_commit_version`, `_commit_timestamp`.

## Deletion Vectors

What does enabling Deletion Vectors do for `DELETE` and `MERGE` operations?

> [!success]- Answer
> Instead of rewriting entire files when rows are deleted/updated, Delta marks deleted rows in a sidecar bitmap (`.dv`). **Result: large `DELETE`s and `MERGE`s become orders of magnitude faster** because no Parquet rewrite is needed. Files are physically rewritten only at the next `OPTIMIZE`.

## Generated columns

What's a Generated Column and what's a common use case?

> [!success]- Answer
> A column whose value is computed from an expression over other columns at write time. Defined with `GENERATED ALWAYS AS (expr)`. Canonical use: a partition column derived from a timestamp, e.g., `event_date GENERATED ALWAYS AS (CAST(event_time AS DATE))` — partitions update automatically without writer-side logic.

## Auto Optimize — two settings

What do `delta.autoOptimize.optimizeWrite` and `delta.autoOptimize.autoCompact` do, and when do you turn each on?

> [!success]- Answer
> - `optimizeWrite = true` — Spark rebalances data across files **at write time** for better file sizing. Lower write latency cost; recommended for most workloads.
> - `autoCompact = true` — Spark runs a *small* OPTIMIZE **after** every write that produces many small files. More expensive per write; turn on for streaming sinks producing micro-batches.

## Delta Sharing — what is it?

What does the Delta Sharing protocol let you do?

> [!success]- Answer
> Share Delta tables (and Volumes) across orgs / clouds **without copying data**. Recipients query a signed URL endpoint that streams Parquet directly. Two flavours: **Open Sharing** (any client, token-auth) and **Databricks-to-Databricks** (full UC-backed sharing with views, row filters, audit).

## UniForm — Delta as Iceberg

What does enabling UniForm do, and what's it for?

> [!success]- Answer
> Writes Delta + **Iceberg metadata simultaneously** so a single physical table can be read by both Delta clients and Iceberg clients (Snowflake, Trino, Athena, BigQuery). Enable via `TBLPROPERTIES ('delta.universalFormat.enabledFormats' = 'iceberg')`. Underlying Parquet is unchanged.

## Streaming source — readChangeFeed

How do you stream the CDF of a Delta table as a Structured Streaming source?

> [!success]- Answer
> ```python
> spark.readStream
>     .format("delta")
>     .option("readChangeFeed", "true")
>     .option("startingVersion", 10)
>     .table("sales")
> ```
> Emits the CDF rows (with `_change_type`, `_commit_version`, etc.) as a stream — useful for incremental downstream processing.

## CONVERT TO DELTA

You have a Parquet table at `s3://bucket/legacy/`. How do you upgrade it to Delta in place?

> [!success]- Answer
> `CONVERT TO DELTA parquet.`s3://bucket/legacy``
>
> Writes a `_delta_log/` directory next to the existing Parquet, taking inventory of files. **No data is rewritten.** Reverse with `CONVERT TO PARQUET` (rare).

## Delta on Structured Streaming — checkpoint

What's special about the `checkpointLocation` for a Structured Streaming write into Delta?

> [!success]- Answer
> Stores streaming offsets + commit metadata. Must be a stable, durable path **unique per query** (don't share checkpoints across queries). Lost checkpoint = stream loses progress and either replays from `startingOffsets` or restarts fresh (lossy).

## Optimistic concurrency — conflict types

When two writers both try to commit to the same Delta table, which operations are guaranteed safe to run concurrently?

> [!success]- Answer
> **Append-only writes** are always safe (Delta serializes their commits with no conflict). **UPDATE / DELETE / MERGE / OVERWRITE** conflict if they touch overlapping files. Delta retries the loser automatically up to a configurable retry count; on persistent conflict, the loser throws `ConcurrentAppendException` or `ConcurrentDeleteReadException`.

---

**[← Back to Anki index](../../README.md)**

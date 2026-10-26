---
title: "Practice Questions: Data Manipulation"
type: practice-questions
tags: [data-engineer-professional, practice-questions, data-manipulation]
---

# Section 3: Data Manipulation (12 %)

Practice questions for Section 3 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 3 folder](../../03-data-manipulation/README.md).

---

## Question 1: MERGE Operation

**Question** *(Easy)*: A data engineer needs to update existing records and insert new ones from a source table into a target Delta table. Which MERGE clause handles records that exist in the source but not in the target?

A) `WHEN MATCHED THEN UPDATE`  
B) `WHEN NOT MATCHED BY SOURCE THEN DELETE`  
C) `WHEN MATCHED THEN INSERT`  
D) `WHEN NOT MATCHED THEN INSERT`  

> [!success]- Answer
> **Correct Answer: D**
>
> `WHEN NOT MATCHED THEN INSERT` handles source records that don't have a matching key in the target. `WHEN MATCHED` handles existing records. Option C is invalid syntax. Option B handles records in target not in source.

---

## Question 2: Delta Lake Time Travel

**Question** *(Medium)*: A user accidentally deleted important records 3 days ago. The table has default retention settings. Which command restores the data?

A) `RESTORE TABLE orders TO VERSION AS OF 100`  
B) `SELECT * FROM orders TIMESTAMP AS OF '2024-01-12'`  
C) `ROLLBACK TABLE orders TO 3 DAYS AGO`  
D) Both A and B can be used to access historical data  

> [!success]- Answer
> **Correct Answer: D**
>
> Both version-based (`VERSION AS OF`) and timestamp-based (`TIMESTAMP AS OF`) time travel work. RESTORE actually reverts the table, while SELECT reads historical data. Default retention is 7 days, so 3-day-old data is available.

---

## Question 3: Expectations

**Question** *(Easy)*: A Lakeflow pipeline requires that all records have a non-null customer_id. Invalid records should be removed but not fail the pipeline. Which expectation syntax achieves this?

A) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL)`  
B) `@dlt.expect_all("valid_id", "customer_id IS NOT NULL")`  
C) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION FAIL UPDATE`  
D) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION DROP ROW`  

> [!success]- Answer
> **Correct Answer: D**
>
> `ON VIOLATION DROP ROW` removes invalid records without failing the pipeline. Option A only logs warnings but keeps invalid rows. Option C fails the entire pipeline. Option B has incorrect syntax.

---

## Question 4: Quarantining Bad Records *(2026 blueprint)*

**Question** *(Medium)*: Records that fail two validation rules must not reach the silver path but must be kept for review. The team wants per-rule pass/fail metrics, and the pipeline must keep running. Which implementation fits?

A) `@dp.expect_all_or_drop(rules)` on the silver table only  
B) `@dp.expect_all_or_fail(rules)` on the silver table  
C) A private table with `@dp.expect_all(rules)` that adds `is_quarantined = NOT(<all rules>)`, plus valid and invalid views that filter on that flag  
D) `CONSTRAINT valid EXPECT (...) ON VIOLATION QUARANTINE ROW`  

> [!success]- Answer
> **Correct Answer: C**
>
> The documented quarantine pattern uses warn-level expectations for metrics and a computed flag to split valid and invalid rows without losing any.
>
> A is wrong because dropped rows are only counted, not kept for review. B is wrong because a fail expectation stops the flow's update instead of routing the rows. D is wrong because the only `ON VIOLATION` actions are `DROP ROW` and `FAIL UPDATE`.

---

## Question 5: Fail Expectation Behavior *(2026 blueprint)*

**Question** *(Hard)*: A **triggered** Lakeflow pipeline has a materialized view `gold_balances` with `@dp.expect_or_fail("non_negative", "balance >= 0")`. An independent streaming table in the same pipeline ingests clickstream data. During an update, one balance is negative. What happens?

A) The violating row is dropped and counted as a dropped record in the event log  
B) Every flow in the pipeline, including the clickstream table, fails and rolls back  
C) The row is written to `gold_balances` and a warning metric is recorded  
D) The `gold_balances` flow fails and its update is rolled back, while the independent clickstream flow continues to update  

> [!success]- Answer
> **Correct Answer: D**
>
> In a triggered pipeline, a fail expectation fails and atomically rolls back only that flow's update; other parallel flows are not failed.
>
> A describes `expect_or_drop`. B is wrong because only in continuous mode does a failure also stop dependent flows, and an unrelated flow is not affected in triggered mode. C describes the default warn action. Note also that no expectation metrics are recorded for an update that fails.

---

## Question 6: Tolerant JSON Parsing into VARIANT *(2026 blueprint)*

**Question** *(Medium)*: A Bronze table receives webhook payloads as JSON strings in a column named `raw`. About 0.1 % of payloads are malformed. The Silver job must convert every payload to a `VARIANT` column without failing the whole batch, and it must keep a `NULL` for unparseable payloads so they can be quarantined later. Which expression should the engineer use?

A) `parse_json(raw)`  
B) `try_parse_json(raw)`  
C) `to_json(raw)`  
D) `variant_get(raw, '$', 'variant')`  

> [!success]- Answer
> **Correct Answer: B**
>
> `try_parse_json(raw)` returns a `VARIANT` for valid JSON and `NULL` for malformed input, so the batch keeps running.
>
> `try_parse_json` is the error-tolerant version of `parse_json`, and its `NULL` result can be routed to a quarantine table. `parse_json` (A) raises `MALFORMED_RECORD_IN_PARSING` on invalid JSON and would fail the batch. `to_json` (C) goes the other way, turning a `STRUCT` or `VARIANT` into a JSON string. `variant_get` (D) extracts typed values from an existing `VARIANT` expression and can't parse a string.

---

## Question 7: Clustering on a Field Inside VARIANT *(2026 blueprint)*

**Question** *(Hard)*: A Silver table stores clickstream events in a single `payload VARIANT` column. Most queries filter on `payload:customer_id` and `payload:event_ts`, and scans are slow. The team wants file-level data skipping on those two attributes while keeping the rest of the payload flexible. Which design should the engineer choose?

A) Run `ALTER TABLE events CLUSTER BY (payload)` and then `OPTIMIZE`  
B) Recreate the table with `PARTITIONED BY (payload:customer_id)`  
C) Extract `payload:customer_id::BIGINT` and `payload:event_ts::TIMESTAMP` into typed top-level columns, keep `payload` as `VARIANT`, and cluster on the new columns  
D) Run `OPTIMIZE events ZORDER BY (payload)`  

> [!success]- Answer
> **Correct Answer: C**
>
> Promote the frequently filtered fields to typed columns, keep the rest as `VARIANT`, and liquid-cluster on the typed columns.
>
> `VARIANT` columns can't be partition, clustering, or Z-order keys, and they don't collect min/max statistics. Databricks recommends extracting frequently queried fields into non-variant columns to speed up queries and improve layout. Options A, B, and D all try to use the `VARIANT` column, or an expression on it, as a layout key, which isn't supported. Partition columns must also be top-level columns rather than expressions.

---

## Question 8: Keeping Large ai_query Batches Running *(2026 blueprint)*

**Question** *(Medium)*: A nightly job enriches 40 million product reviews with `ai_query('system.ai.meta-llama-3-3-70b-instruct', prompt || review_text)`. A handful of rows hit model endpoint errors each night, the whole query fails, and all completed inferences are lost. What should the engineer change to keep the successful results and still identify the failed rows?

A) Add `failOnError => false` and write rows where `result.errorMessage IS NOT NULL` to a retry table  
B) Split the input into 1,000-row batches and run them in a Python loop  
C) Wrap the call in `try_cast(... AS STRING)`  
D) Add `modelParameters => named_struct('temperature', 0.0)`  

> [!success]- Answer
> **Correct Answer: A**
>
> With `failOnError => false`, `ai_query` returns a `STRUCT` with `response` and `errorMessage`, so the job completes and failed rows can be found.
>
> The docs recommend `failOnError => false` for large workloads. A row with a model endpoint error gets a `NULL` `response` and a populated `errorMessage`, and successful rows are kept. Manual micro-batching (B) is discouraged because AI Functions already handle parallelization, retries, and scaling, and smaller batches can lower throughput. `try_cast` (C) doesn't intercept inference errors. Model parameters (D) change generation behavior, not error handling. `temperature` already defaults to 0.0 in `ai_query`.

---

## Question 9: Ticket Routing with Minimal Prompt Engineering *(2026 blueprint)*

**Question** *(Medium)*: A Lakeflow pipeline must route incoming support tickets to one of five known queues (billing, defect, account, feature request, other). The team has no custom model, wants no prompt engineering, and needs the output to be exactly one of the five label names so downstream routing logic doesn't break. Which approach fits best?

A) `ai_summarize(body, 5)` followed by `regexp_extract` to find a queue name  
B) `ai_gen('Which queue should this ticket go to? ' || body)`  
C) `ai_query` against a chat model with a free-form prompt and no `responseFormat`  
D) `ai_classify(body, '["billing", "defect", "account", "feature_request", "other"]', map('version', '2.1'))`  

> [!success]- Answer
> **Correct Answer: D**
>
> `ai_classify` is the task-specific function for classifying text into labels you provide, and it returns label names that exactly match the `labels` argument.
>
> Databricks recommends starting with a task-specific AI Function when one matches the task. `ai_classify` needs no prompt, accepts label descriptions and instructions, and in version 2.x returns a `VARIANT` whose `response[0].value` is one of the supplied labels. Option A is a fragile workaround on a summary. `ai_gen` (B) and an unconstrained `ai_query` (C) produce free text that might not match a queue name. `ai_query` is meant for cases that need a specific model, prompt, or output schema.

---

**[← Previous: Data Ingestion & Acquisition](./02-data-ingestion.md) | [↑ Back to Practice Questions](./README.md) | [Next: Monitoring and Alerting →](./04-monitoring-alerting.md)**

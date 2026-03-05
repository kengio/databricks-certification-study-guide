---
tags: [interview-prep, data-quality, compliance, gdpr, pii, schema-evolution]
---

# Interview Questions — Data Compliance & Quality Engineering

---

## Question 1: GDPR/CCPA Data Deletion in Delta Lake

**Level**: Both
**Type**: Scenario

**Scenario / Question**:
A customer requests deletion of all their data under GDPR right-to-be-forgotten. Your data is spread across Bronze, Silver, and Gold Delta tables. Walk me through your approach.

> [!success]- Answer Framework
>
> **Short Answer**: Execute `DELETE FROM table WHERE customer_id = 'X123'` across all relevant Bronze, Silver, and Gold tables, then run `VACUUM` after legal confirmation to physically remove the underlying Parquet files (default 7-day retention); design for this proactively by isolating PII in separate lookup tables so a single delete cascades logically, and use Unity Catalog audit logs to prove deletion compliance.
>
> ### Key Points to Cover
>
> - `DELETE FROM` marks files for removal in the Delta log but does not physically delete data
> - `VACUUM` physically removes files older than the retention threshold (default 7 days)
> - PII isolation strategy: store PII in a separate lookup table, join at query time — deleting from one table cascades logically across all downstream queries
> - Unity Catalog audit logging (`system.access.audit`) to prove deletion compliance
> - Automated deletion pipelines triggered by compliance requests
> - Pseudonymization as an alternative: replace PII with tokens, then delete the mapping table
> - Track deletion requests in a compliance log Delta table
>
> ### Example Answer
>
> GDPR right-to-be-forgotten requires that personal data be erased upon request. In a Delta Lakehouse, this is a two-step process: logical deletion followed by physical removal.
>
> **Step 1 — Logical deletion across all layers:**
>
> ```sql
> -- Delete from Bronze (raw ingestion)
> DELETE FROM prod.bronze.raw_customers
> WHERE customer_id = 'X123';
>
> -- Delete from Silver (cleaned/enriched)
> DELETE FROM prod.silver.customers
> WHERE customer_id = 'X123';
>
> -- Delete from Gold (aggregated — if customer-level data exists)
> DELETE FROM prod.gold.customer_360
> WHERE customer_id = 'X123';
> ```
>
> At this point, Delta's transaction log marks the old files as removed, but the physical Parquet files still exist on storage. **Time travel can still access the deleted data.**
>
> **Step 2 — Physical removal with VACUUM:**
>
> ```sql
> -- After legal confirmation, physically remove old files
> -- Default retention is 7 days; can override for compliance
> VACUUM prod.bronze.raw_customers RETAIN 0 HOURS;
> VACUUM prod.silver.customers RETAIN 0 HOURS;
> VACUUM prod.gold.customer_360 RETAIN 0 HOURS;
> ```
>
> Note: `RETAIN 0 HOURS` requires setting `spark.databricks.delta.retentionDurationCheck.enabled = false` — this disables the safety check. Only do this for verified compliance deletions.
>
> **Proactive design — PII isolation pattern:**
>
> The best approach is to design for deletion from the start. Store PII in a separate lookup table and reference it by a surrogate key:
>
> ```sql
> -- PII lookup table (single source of truth for personal data)
> CREATE TABLE prod.silver.customer_pii (
>     customer_id STRING,
>     full_name STRING,
>     email STRING,
>     phone STRING
> ) USING DELTA;
>
> -- Fact tables reference customer_id only (no PII embedded)
> -- Deleting from customer_pii removes PII from all downstream joins
> DELETE FROM prod.silver.customer_pii
> WHERE customer_id = 'X123';
> ```
>
> **Compliance audit trail:**
>
> ```sql
> -- Log every deletion request for audit purposes
> INSERT INTO prod.compliance.deletion_log
> VALUES ('X123', 'GDPR', current_timestamp(), current_user(), 'COMPLETED');
> ```
>
> ### Follow-up Questions
>
> - How do you verify that deleted data is truly unrecoverable after VACUUM?
> - What happens if downstream tables reference deleted records via foreign key relationships?
> - How do you handle deletion requests for streaming tables that continuously ingest new data?

---

## Question 2: PII Handling Strategies

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Your organization processes sensitive customer data (emails, SSNs, addresses). Design a comprehensive PII protection strategy in Databricks.

> [!success]- Answer Framework
>
> **Short Answer**: Implement defense-in-depth: column-level security via Unity Catalog restricts sensitive columns to authorized groups, dynamic data masking via SQL UDFs returns masked values based on `is_member()` group membership, encryption at rest uses customer-managed keys, and Unity Catalog audit logs track all access — combine these with data classification tags and physical isolation of PII in dedicated storage with stricter IAM policies.
>
> ### Key Points to Cover
>
> - Column-level security via Unity Catalog column masks
> - Dynamic data masking: SQL UDFs with `IS_ACCOUNT_GROUP_MEMBER()` checks
> - Encryption at rest: customer-managed keys (CMK) via cloud KMS
> - Tokenization: replace PII with reversible tokens, store mapping in a secured vault
> - Data classification: tag columns as PII/PHI/PCI in Unity Catalog metadata
> - Physical isolation: separate storage accounts/buckets for PII with stricter IAM/network policies
> - Access audit: Unity Catalog audit logs track who accessed what data and when
>
> ### Example Answer
>
> PII protection requires multiple layers — no single mechanism is sufficient.
>
> **Layer 1 — Data classification and tagging:**
>
> Tag sensitive columns in Unity Catalog so teams know what they're dealing with:
>
> ```sql
> ALTER TABLE prod.silver.customers
>   ALTER COLUMN email SET TAGS ('pii' = 'true', 'sensitivity' = 'high');
> ALTER TABLE prod.silver.customers
>   ALTER COLUMN ssn SET TAGS ('pii' = 'true', 'sensitivity' = 'critical');
> ```
>
> **Layer 2 — Dynamic data masking:**
>
> Create masking functions that return different values based on the caller's group membership:
>
> ```sql
> -- Mask email: authorized users see full email, others see masked
> CREATE FUNCTION prod.security.mask_email(email STRING)
> RETURN
>   CASE
>     WHEN IS_ACCOUNT_GROUP_MEMBER('pii_authorized') THEN email
>     ELSE CONCAT(LEFT(email, 1), '***@', SPLIT(email, '@')[1])
>   END;
>
> -- Mask SSN: only compliance team sees full value
> CREATE FUNCTION prod.security.mask_ssn(ssn STRING)
> RETURN
>   CASE
>     WHEN IS_ACCOUNT_GROUP_MEMBER('compliance_team') THEN ssn
>     ELSE CONCAT('***-**-', RIGHT(ssn, 4))
>   END;
>
> -- Apply masks to the table
> ALTER TABLE prod.silver.customers
>   ALTER COLUMN email SET MASK prod.security.mask_email;
> ALTER TABLE prod.silver.customers
>   ALTER COLUMN ssn SET MASK prod.security.mask_ssn;
> ```
>
> **Layer 3 — Physical isolation:**
>
> Store PII tables in a dedicated external location with stricter cloud IAM policies:
>
> ```sql
> CREATE EXTERNAL LOCATION pii_storage
>   URL 's3://company-pii-bucket/data/'
>   WITH (STORAGE CREDENTIAL pii_credential);
>
> -- Only the pii_credential has access to this bucket
> -- Network policies restrict access to specific VPC endpoints
> ```
>
> **Layer 4 — Encryption with customer-managed keys:**
>
> Configure workspace-level CMK via your cloud provider's KMS (AWS KMS, Azure Key Vault, GCP Cloud KMS). This ensures Databricks cannot read your data without your key — you control rotation and revocation.
>
> **Layer 5 — Audit everything:**
>
> ```sql
> -- Query who accessed PII columns in the last 7 days
> SELECT
>     event_date,
>     user_identity.email AS user_email,
>     request_params.full_name_arg AS table_accessed,
>     action_name
> FROM system.access.audit
> WHERE action_name IN ('commandSubmit', 'getTable')
>   AND event_date >= current_date() - INTERVAL 7 DAYS;
> ```
>
> ### Follow-up Questions
>
> - What is the difference between masking and tokenization, and when would you choose each?
> - How do you handle PII in Bronze tables before any cleaning or masking is applied?
> - When would you use encryption vs masking — are they complementary or alternatives?

---

## Question 3: Data Reconciliation Patterns

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
After migrating a data pipeline, business users report discrepancies between the old and new systems. Design a reconciliation framework.

> [!success]- Answer Framework
>
> **Short Answer**: Implement a three-tier reconciliation framework: row count validation at each medallion layer, checksum/hash validation of critical columns using MD5 for deterministic comparison, and aggregate reconciliation comparing SUM/AVG/MIN/MAX of numeric columns — automate these as scheduled jobs writing results to a reconciliation log Delta table with threshold-based alerting (e.g., >0.1% variance triggers investigation).
>
> ### Key Points to Cover
>
> - Row count validation: compare source and target counts at each layer
> - Checksum/hash validation: MD5/SHA hash of critical columns for deterministic comparison
> - Aggregate reconciliation: SUM, AVG, MIN, MAX of numeric columns
> - Automated reconciliation jobs: scheduled Delta table comparisons
> - Historical comparison via Delta time travel: detect unexpected changes
> - Mismatch alerting: threshold-based alerts (>0.1% variance triggers investigation)
> - Reconciliation dashboards: Databricks SQL dashboards showing daily status
>
> ### Example Answer
>
> A robust reconciliation framework validates data at multiple granularities.
>
> **Tier 1 — Row count validation:**
>
> ```sql
> -- Compare row counts between legacy and new system
> SELECT
>     'legacy' AS system,
>     COUNT(*) AS row_count
> FROM legacy_db.orders
> WHERE order_date = '2026-03-01'
>
> UNION ALL
>
> SELECT
>     'new' AS system,
>     COUNT(*) AS row_count
> FROM prod.gold.orders
> WHERE order_date = '2026-03-01';
> ```
>
> **Tier 2 — Aggregate reconciliation:**
>
> ```sql
> -- Compare key metrics between systems
> WITH legacy_agg AS (
>     SELECT
>         SUM(amount) AS total_amount,
>         AVG(amount) AS avg_amount,
>         COUNT(DISTINCT customer_id) AS unique_customers,
>         MIN(order_date) AS min_date,
>         MAX(order_date) AS max_date
>     FROM legacy_db.orders
>     WHERE order_date BETWEEN '2026-03-01' AND '2026-03-31'
> ),
> new_agg AS (
>     SELECT
>         SUM(amount) AS total_amount,
>         AVG(amount) AS avg_amount,
>         COUNT(DISTINCT customer_id) AS unique_customers,
>         MIN(order_date) AS min_date,
>         MAX(order_date) AS max_date
>     FROM prod.gold.orders
>     WHERE order_date BETWEEN '2026-03-01' AND '2026-03-31'
> )
> SELECT
>     l.total_amount AS legacy_total,
>     n.total_amount AS new_total,
>     ABS(l.total_amount - n.total_amount) / l.total_amount * 100
>         AS pct_variance
> FROM legacy_agg l
> CROSS JOIN new_agg n;
> ```
>
> **Tier 3 — Row-level hash comparison:**
>
> ```sql
> -- Identify specific rows that differ
> WITH legacy_hashed AS (
>     SELECT order_id, MD5(CONCAT_WS('|', order_id, customer_id,
>         CAST(amount AS STRING), order_date)) AS row_hash
>     FROM legacy_db.orders
> ),
> new_hashed AS (
>     SELECT order_id, MD5(CONCAT_WS('|', order_id, customer_id,
>         CAST(amount AS STRING), order_date)) AS row_hash
>     FROM prod.gold.orders
> )
> SELECT
>     COALESCE(l.order_id, n.order_id) AS order_id,
>     CASE
>         WHEN l.row_hash IS NULL THEN 'MISSING_IN_LEGACY'
>         WHEN n.row_hash IS NULL THEN 'MISSING_IN_NEW'
>         WHEN l.row_hash != n.row_hash THEN 'MISMATCH'
>     END AS status
> FROM legacy_hashed l
> FULL OUTER JOIN new_hashed n ON l.order_id = n.order_id
> WHERE l.row_hash IS NULL
>    OR n.row_hash IS NULL
>    OR l.row_hash != n.row_hash;
> ```
>
> **Automation — write results to reconciliation log:**
>
> ```python
> recon_result = (spark.sql(recon_query)
>     .withColumn("recon_date", current_date())
>     .withColumn("recon_type", lit("aggregate"))
>     .withColumn("table_name", lit("orders")))
>
> (recon_result.write.format("delta")
>     .mode("append")
>     .saveAsTable("prod.monitoring.reconciliation_log"))
> ```
>
> **Delta time travel for drift detection:**
>
> ```sql
> -- Compare today's output vs yesterday's for unexpected changes
> SELECT COUNT(*) AS today_count FROM prod.gold.orders;
> SELECT COUNT(*) AS yesterday_count
> FROM prod.gold.orders VERSION AS OF 5;
> ```
>
> ### Follow-up Questions
>
> - How do you handle floating-point precision differences between systems?
> - What is acceptable variance for financial data vs log data?
> - How do you reconcile streaming pipelines where data is continuously arriving?

---

## Question 4: Data Quality Testing & Automation

**Level**: Both
**Type**: System Design

**Scenario / Question**:
You need to implement a data quality framework for a Lakehouse with 200+ Delta tables. What is your approach?

> [!success]- Answer Framework
>
> **Short Answer**: Use DLT Expectations as the first line of defense — `EXPECT` logs violations, `EXPECT ... ON VIOLATION DROP ROW` discards bad rows, and `EXPECT ... ON VIOLATION FAIL UPDATE` halts the pipeline; complement this with Auto Loader's `_rescued_data` column for schema violations, PyTest for unit testing transformation logic, and a data quality dashboard tracking null rates, duplicate rates, and freshness SLAs over time.
>
> ### Key Points to Cover
>
> - DLT Expectations: `EXPECT` (log), `ON VIOLATION DROP ROW` (discard), `ON VIOLATION FAIL UPDATE` (halt)
> - Great Expectations integration for custom validation suites
> - PyTest for transformation logic: unit test individual functions with small DataFrames
> - `_rescued_data` column in Auto Loader: captures schema-violating records
> - Data quality dashboards: track metrics over time (null rates, duplicate rates, freshness)
> - Freshness monitoring: alert when tables miss expected SLA
> - Schema validation: StructType enforcement at ingestion boundaries
>
> ### Example Answer
>
> A data quality framework for 200+ tables needs automation at every layer — manual checks do not scale.
>
> **Layer 1 — DLT Expectations (pipeline-level quality gates):**
>
> ```python
> import dlt
> from pyspark.sql.functions import col
>
> @dlt.table
> @dlt.expect("valid_amount", "amount > 0")
> @dlt.expect_or_drop("valid_email", "email IS NOT NULL")
> @dlt.expect_or_fail("valid_order_id", "order_id IS NOT NULL")
> def silver_orders():
>     return (dlt.read("bronze_orders")
>         .filter(col("status") != "CANCELLED")
>         .select("order_id", "customer_id", "amount", "email"))
> ```
>
> - `@dlt.expect`: logs violations in the event log but passes all rows through
> - `@dlt.expect_or_drop`: silently drops rows that violate the constraint
> - `@dlt.expect_or_fail`: halts the entire pipeline update on violation — use for critical invariants
>
> **Layer 2 — Auto Loader rescued data:**
>
> ```python
> raw_df = (spark.readStream
>     .format("cloudFiles")
>     .option("cloudFiles.format", "json")
>     .option("cloudFiles.schemaLocation", "/checkpoints/schema")
>     .option("rescuedDataColumn", "_rescued_data")
>     .load("/data/landing/"))
>
> # Rows with schema mismatches land in _rescued_data instead of failing
> # Monitor rescued data volume as a quality signal
> ```
>
> **Layer 3 — PyTest for transformation logic:**
>
> ```python
> # tests/test_transforms.py
> import pytest
> from pyspark.sql import SparkSession
> from transforms import calculate_order_total
>
>
> @pytest.fixture(scope="session")
> def spark():
>     return SparkSession.builder.master("local[*]").getOrCreate()
>
>
> def test_calculate_order_total(spark):
>     input_df = spark.createDataFrame(
>         [("O1", 100.0, 0.1), ("O2", 200.0, 0.0)],
>         ["order_id", "subtotal", "discount"]
>     )
>     result = calculate_order_total(input_df)
>     rows = result.collect()
>     assert rows[0]["total"] == 90.0
>     assert rows[1]["total"] == 200.0
> ```
>
> **Layer 4 — Data quality dashboard metrics:**
>
> ```sql
> -- Freshness check: alert if table not updated within SLA
> SELECT
>     table_name,
>     MAX(commit_timestamp) AS last_update,
>     TIMESTAMPDIFF(HOUR, MAX(commit_timestamp), current_timestamp())
>         AS hours_since_update
> FROM (
>     DESCRIBE HISTORY prod.silver.orders
> )
> WHERE hours_since_update > 4;  -- 4-hour SLA
>
> -- Null rate monitoring
> SELECT
>     current_date() AS check_date,
>     'prod.silver.orders' AS table_name,
>     COUNT(*) AS total_rows,
>     SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END) AS null_emails,
>     ROUND(SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END)
>         * 100.0 / COUNT(*), 2) AS null_email_pct
> FROM prod.silver.orders;
> ```
>
> ### Follow-up Questions
>
> - How do you prioritize which tables need the strictest quality checks?
> - What is the trade-off between DROP ROW and FAIL UPDATE?
> - How do you handle false positive quality alerts at scale?

---

## Question 5: Schema Drift Detection & Handling

**Level**: Both
**Type**: Scenario

**Scenario / Question**:
Your ingestion pipeline suddenly fails because the upstream API added new fields and changed a column type. How do you design pipelines resilient to schema drift?

> [!success]- Answer Framework
>
> **Short Answer**: Use Auto Loader with `cloudFiles.schemaEvolutionMode` set to `addNewColumns` so new fields are automatically added to the target table, combine this with the `_rescued_data` column to capture records that don't match the expected schema without losing data, and use `mergeSchema` for batch writes; for breaking changes like type modifications, use explicit StructType enforcement at ingestion boundaries with alerting on schema drift.
>
> ### Key Points to Cover
>
> - Auto Loader schema evolution modes: `addNewColumns`, `rescue`, `failOnNewColumns`, `none`
> - `_rescued_data` column: catches rows/fields that don't match expected schema
> - `mergeSchema` option: `.option("mergeSchema", "true")` adds new columns during writes
> - `overwriteSchema`: for breaking changes like type changes — replaces entire schema
> - StructType enforcement: define explicit schema at ingestion boundary for critical pipelines
> - Schema change alerting: compare current vs expected schema, alert on drift
> - Versioned schemas: track schema changes in a metadata table for audit trail
>
> ### Example Answer
>
> Schema drift is inevitable when ingesting from external APIs and partner feeds. The goal is to handle it gracefully — never lose data, never silently corrupt data.
>
> **Strategy 1 — Auto Loader with schema evolution and rescued data:**
>
> ```python
> # Auto Loader automatically detects schema changes
> raw_df = (spark.readStream
>     .format("cloudFiles")
>     .option("cloudFiles.format", "json")
>     .option("cloudFiles.inferColumnTypes", "true")
>     .option("cloudFiles.schemaLocation", "/checkpoints/api_data/schema")
>     .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
>     .option("rescuedDataColumn", "_rescued_data")
>     .load("/data/landing/api_feed/"))
> ```
>
> Schema evolution modes:
>
> | Mode | Behavior |
> | ---- | -------- |
> | `addNewColumns` | New fields automatically added to target schema |
> | `rescue` | New/mismatched fields captured in `_rescued_data` |
> | `failOnNewColumns` | Pipeline fails on schema change (strictest) |
> | `none` | Ignore new columns entirely |
>
> The `_rescued_data` column is critical — it captures any field that does not match the current schema, whether due to new columns, type mismatches, or malformed records. Nothing is lost.
>
> **Strategy 2 — mergeSchema for batch writes:**
>
> ```python
> # When the source DataFrame has new columns, merge into target
> (transformed_df.write
>     .format("delta")
>     .mode("append")
>     .option("mergeSchema", "true")
>     .saveAsTable("prod.silver.api_data"))
> ```
>
> Use `mergeSchema` when adding new columns is safe (additive change). Use `overwriteSchema` only for breaking changes like type modifications:
>
> ```python
> # Breaking change: column type changed from STRING to INT
> (corrected_df.write
>     .format("delta")
>     .mode("overwrite")
>     .option("overwriteSchema", "true")
>     .saveAsTable("prod.silver.api_data"))
> ```
>
> **Strategy 3 — Explicit schema enforcement for critical pipelines:**
>
> ```python
> from pyspark.sql.types import (
>     StructType, StructField, StringType, IntegerType, DoubleType
> )
>
> # Define the expected schema explicitly
> expected_schema = StructType([
>     StructField("order_id", StringType(), nullable=False),
>     StructField("customer_id", StringType(), nullable=False),
>     StructField("amount", DoubleType(), nullable=False),
>     StructField("status", StringType(), nullable=True),
> ])
>
> # Read with explicit schema — type mismatches go to _rescued_data
> raw_df = (spark.readStream
>     .format("cloudFiles")
>     .option("cloudFiles.format", "json")
>     .option("rescuedDataColumn", "_rescued_data")
>     .schema(expected_schema)
>     .load("/data/landing/critical_feed/"))
> ```
>
> **Strategy 4 — Schema drift alerting:**
>
> ```python
> # Compare current schema against expected schema
> current_schema = spark.table("prod.silver.api_data").schema
> expected_fields = set(f.name for f in expected_schema.fields)
> actual_fields = set(f.name for f in current_schema.fields)
>
> new_fields = actual_fields - expected_fields
> if new_fields:
>     # Log to monitoring table and send alert
>     print(f"Schema drift detected: new fields {new_fields}")
> ```
>
> ### Follow-up Questions
>
> - When would you choose strict schema enforcement over schema evolution?
> - How do you handle schema changes in streaming pipelines that are running 24/7?
> - What is the rescue pattern and when would you use it instead of `addNewColumns`?

---

**[← Previous: Production Operations](./11-production-operations.md) | [↑ Back to Interview Prep](./README.md) | [Next: System Design →](./13-system-design.md)**

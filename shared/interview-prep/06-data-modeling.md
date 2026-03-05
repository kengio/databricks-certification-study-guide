---
tags: [interview-prep, data-modeling]
---

# Interview Questions — Data Modeling

---

## Question 1: Star Schema Design — Facts, Dimensions, and Grain

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
You're designing a Gold-layer data model for an e-commerce platform. The business needs to analyze orders by customer, product, promotion, and date. Walk through how you'd design a star schema, explain the concept of grain, and identify which tables are facts and which are dimensions.

> [!success]- Answer Framework
>
> **Short Answer**: A star schema puts measurable events in a central fact table (one row per order line item, with `quantity`, `revenue`, and foreign keys to dimensions) and descriptive context in surrounding dimension tables (`dim_customer`, `dim_product`, `dim_date`, `dim_promotion`); the grain — the atomic unit of one fact row — must be defined first because it determines what measures can live in the fact table and what must be aggregated separately.
>
> ### Key Points to Cover
>
> - Fact table: one row per measurable event, numeric measures, foreign keys to dimensions
> - Dimension tables: descriptive attributes, slow-changing, usually smaller
> - Grain: the atomic unit of one fact row — define this before any other design decision
> - Additive vs semi-additive vs non-additive measures
> - Degenerate dimensions (order number stored in fact, no separate dim table)
> - Why star outperforms snowflake for Spark analytics: fewer joins
>
> ### Example Answer
>
> **Step 1 — Define the grain**: The grain is "one row per order line item" (one product per order). One order with 3 products = 3 fact rows. This grain supports product-level analysis.
>
> **Star schema:**
>
> ```text
> fact_order_line (grain: one row per order line item)
> ├── order_line_sk   BIGINT       -- surrogate key
> ├── order_id        BIGINT       -- degenerate dimension (no dim table needed)
> ├── customer_sk     BIGINT FK    → dim_customer
> ├── product_sk      BIGINT FK    → dim_product
> ├── date_sk         INT FK       → dim_date
> ├── promotion_sk    BIGINT FK    → dim_promotion (nullable)
> ├── quantity        INT          -- additive measure
> ├── unit_price      DECIMAL      -- semi-additive (do not SUM across products)
> └── line_revenue    DECIMAL      -- additive measure
>
> dim_customer: customer_sk, customer_id, name, city, country, segment
> dim_product: product_sk, product_id, name, category, brand, cost
> dim_date: date_sk (YYYYMMDD INT), date, year, quarter, month, week, is_holiday
> dim_promotion: promotion_sk, promo_code, discount_pct, start_date, end_date
> ```
>
> **Measure types matter for aggregation:**
>
> | Type | Example | Can SUM across? |
> | ---- | ------- | --------------- |
> | Additive | `line_revenue`, `quantity` | Yes — across all dimensions |
> | Semi-additive | `unit_price`, account balance | Across some dimensions only |
> | Non-additive | ratios, percentages | Never — recalculate from base facts |
>
> **Degenerate dimensions**: `order_id` is a natural key (invoice number) with no descriptive attributes worth a dimension table. Store it directly in the fact table — it enables order-level drill-through without a join.
>
> **Why star over snowflake in Databricks**: Columnar storage (Parquet/Delta) compresses repeated dimension values efficiently. Star schema joins are simple and predictable; every additional normalized dimension in a snowflake schema is another shuffle in Spark.
>
> ### Follow-up Questions
>
> - You later need to analyze revenue at the order level (not line level). Does your fact table support this without aggregation?
> - What is a factless fact table, and when would you use one in an e-commerce context?
> - Your `dim_date` covers 10 years back and 2 years forward. How many rows does it have?

---

## Question 2: Snowflake Schema vs Star Schema for Databricks

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A data architect proposes normalizing the product dimension into three tables: `dim_product`, `dim_category`, and `dim_brand` to reduce storage redundancy. You're building this for Databricks SQL warehouses. How do you respond?

> [!success]- Answer Framework
>
> **Short Answer**: In Databricks, star schema (denormalized dimensions) is almost always preferred over snowflake because columnar storage with Parquet compression eliminates most redundancy savings, while each extra join in a snowflake schema can trigger an additional shuffle — the storage cost is negligible on cloud object storage, but the query cost of extra joins is measurable and real.
>
> ### Key Points to Cover
>
> - Star: denormalized dimension tables, fewer joins, faster queries
> - Snowflake: normalized dimensions (dim tables reference other dim tables), more joins
> - Parquet/Delta compresses repeated string values efficiently — redundancy is negligible in bytes
> - Each extra join in Spark = potential shuffle = wall-clock cost
> - Databricks SQL warehouses are Photon-powered and optimized for star schema queries
> - Snowflake schema makes sense for very wide dimensions where only a small subset is typically queried
>
> ### Example Answer
>
> **Star schema (recommended for Databricks):**
>
> ```sql
> -- One join to get product + category + brand
> SELECT p.name, p.category_name, p.brand_name, SUM(f.line_revenue)
> FROM fact_order_line f
> JOIN dim_product p ON f.product_sk = p.product_sk
> GROUP BY 1, 2, 3;
> ```
>
> **Snowflake schema (what the architect proposes):**
>
> ```sql
> -- Three joins to get the same result
> SELECT p.name, c.category_name, b.brand_name, SUM(f.line_revenue)
> FROM fact_order_line f
> JOIN dim_product p ON f.product_sk = p.product_sk
> JOIN dim_category c ON p.category_sk = c.category_sk
> JOIN dim_brand b ON p.brand_sk = b.brand_sk
> GROUP BY 1, 2, 3;
> ```
>
> **Why the storage argument doesn't hold for Databricks**:
>
> - A `category_name` column repeated across 1M product rows compresses to near-zero in Parquet due to dictionary encoding — the actual bytes saved by normalization are negligible
> - Delta Lake on cloud storage costs ~$0.02/GB/month — storing the denormalized string costs less than a dollar per billion rows
>
> **When snowflake schema makes sense**:
>
> - Very wide dimensions (100+ columns) where different user groups query different subsets — splitting allows each group to scan fewer columns
> - When dimension attributes change independently at different cadences (brand hierarchy changes annually; product attributes change weekly)
> - OLTP databases where write performance matters (star schema duplicates data on write)
>
> **Recommendation**: Denormalize `category_name` and `brand_name` into `dim_product`. If the product dimension becomes extremely wide (50+ columns), consider splitting by analytical domain, not by normalization.
>
> ### Follow-up Questions
>
> - A business analyst wants to add 30 new product attributes to `dim_product`. Does this change your recommendation?
> - What is the Galaxy schema (also called Fact Constellation), and when would it apply to this e-commerce model?
> - How do you handle the case where brand data changes frequently but product data is stable?

---

## Question 3: SCD Types — When to Use Each

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A customer changes their shipping city from New York to San Francisco. Historical orders were shipped to New York. Should those historical orders reflect the old city or the new city? How does your answer change depending on the use case, and how do SCD types help you decide?

> [!success]- Answer Framework
>
> **Short Answer**: Use SCD Type 1 (overwrite) when only the current value matters (e.g., email for marketing — you always want the current address); use SCD Type 2 (add a new row with `valid_from`/`valid_to`/`is_current`) when historical reports must reflect the value at the time of the event (e.g., shipping city at the time of the order) — the decision is driven by "does the business need to know what the value was at the time of the event?"
>
> ### Key Points to Cover
>
> - SCD Type 0: immutable — value never changes once set (e.g., `date_of_birth`)
> - SCD Type 1: overwrite — always reflects current value; no history preserved
> - SCD Type 2: add new row — full history with `valid_from`, `valid_to`, `is_current`
> - SCD Type 3: add `previous_value` column — keeps only one prior value
> - Choosing by business question: "do I need historical accuracy for this attribute?"
> - Delta Lake MERGE statement for SCD2 updates
>
> ### Example Answer
>
> **SCD Type 0 — Immutable**: The attribute never changes. Store it once and never update.
>
> Example: `customer_id` (natural key), `date_of_birth`, `original_signup_channel`. These reflect the original fact and must never be overwritten.
>
> **SCD Type 1 — Overwrite** (no history):
>
> ```sql
> UPDATE dim_customer
> SET city = 'San Francisco', updated_at = current_timestamp()
> WHERE customer_id = 42;
> ```
>
> When to use: Email address (always send to current email), phone number, typo corrections. Historical reports show the current value — appropriate when the question is "what is true now?"
>
> **SCD Type 2 — Add new row** (full history):
>
> ```sql
> -- Close the old row
> UPDATE dim_customer
> SET valid_to = current_date(), is_current = false
> WHERE customer_id = 42 AND is_current = true;
>
> -- Insert new row
> INSERT INTO dim_customer
> VALUES (42, 'San Francisco', current_date(), null, true, ...);
> ```
>
> Result: Historical orders joined to `dim_customer` on `customer_sk` and `order_date BETWEEN valid_from AND valid_to` still show New York — because the old surrogate key was used when the order was placed.
>
> When to use: Shipping city (fulfillment analytics), price at time of sale, customer segment at acquisition.
>
> **SCD Type 3 — Previous value column** (limited history):
>
> ```sql
> UPDATE dim_customer
> SET previous_city = city, city = 'San Francisco'
> WHERE customer_id = 42;
> ```
>
> Keeps only one prior value — simpler than SCD2 but loses all earlier history. Use when you need "current and previous" but not full history (e.g., most recent job title change).
>
> **Decision framework:**
>
> | Business Question | SCD Type |
> | ----------------- | -------- |
> | "What is the current value?" | Type 1 |
> | "What was the value at the time of the event?" | Type 2 |
> | "What was the value before the latest change?" | Type 3 |
> | "This value never changes" | Type 0 |
>
> ### Follow-up Questions
>
> - A customer's discount tier changes from Silver to Gold. Historical revenue reports need to show the correct tier at the time of each order. Which SCD type applies?
> - SCD Type 2 requires a surrogate key in the fact table (not the natural key). Why?
> - How does SCD Type 4 differ from Type 2? What problem does it solve for very wide dimension tables?

---

## Question 4: Implementing SCD Type 2 in Delta Lake

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Walk through a concrete implementation of SCD Type 2 for a `dim_customer` table in Delta Lake. The source is a CDC feed with new and updated customer records. Handle inserts (new customers), updates (attribute changes — close old row, open new row), and unchanged records (no-op).

> [!success]- Answer Framework
>
> **Short Answer**: SCD Type 2 requires a two-phase approach: a MERGE to close changed rows (`WHEN MATCHED AND source differs THEN UPDATE SET valid_to = current_date(), is_current = false`) plus a follow-up INSERT for the new current version (`valid_from = current_date(), is_current = true`); or use DLT's `APPLY CHANGES INTO ... STORED AS SCD TYPE 2` which handles both phases atomically.
>
> ### Key Points to Cover
>
> - SCD2 requires two operations per update: close old row + insert new row
> - Standard MERGE handles `WHEN NOT MATCHED` (inserts) and `WHEN MATCHED` (close old row)
> - New version row must be inserted after the MERGE
> - Surrogate key (`customer_sk`) is auto-generated — different from natural key (`customer_id`)
> - Delta MERGE condition: `ON source.customer_id = target.customer_id AND target.is_current = true`
> - DLT alternative: `APPLY CHANGES INTO` with `STORED AS SCD TYPE 2`
>
> ### Example Answer
>
> **Table schema:**
>
> ```sql
> CREATE TABLE dim_customer (
>     customer_sk     BIGINT GENERATED ALWAYS AS IDENTITY,  -- surrogate key
>     customer_id     BIGINT,                               -- natural key
>     name            STRING,
>     city            STRING,
>     email           STRING,
>     valid_from      DATE NOT NULL,
>     valid_to        DATE,                                 -- NULL = current record
>     is_current      BOOLEAN NOT NULL
> ) USING DELTA;
> ```
>
> **Phase 1 — MERGE to close changed rows and insert new customers:**
>
> ```sql
> MERGE INTO dim_customer AS target
> USING (
>     SELECT customer_id, name, city, email
>     FROM source_customers
> ) AS source
> ON target.customer_id = source.customer_id
>    AND target.is_current = true
>
> -- New customer: insert as current record
> WHEN NOT MATCHED THEN
>     INSERT (customer_id, name, city, email, valid_from, valid_to, is_current)
>     VALUES (source.customer_id, source.name, source.city, source.email,
>             current_date(), NULL, true)
>
> -- Existing customer with changed attributes: close old row
> WHEN MATCHED AND (
>     target.city  <> source.city
>     OR target.email <> source.email
>     OR target.name  <> source.name
> ) THEN
>     UPDATE SET
>         valid_to   = current_date(),
>         is_current = false;
> ```
>
> **Phase 2 — Insert new current rows for updated customers:**
>
> ```sql
> INSERT INTO dim_customer (customer_id, name, city, email, valid_from, valid_to, is_current)
> SELECT
>     source.customer_id, source.name, source.city, source.email,
>     current_date(), NULL, true
> FROM source_customers source
> JOIN dim_customer target
>     ON source.customer_id = target.customer_id
>    AND target.valid_to = current_date()   -- just closed today
>    AND target.is_current = false;
> ```
>
> **DLT alternative (recommended for production):**
>
> ```python
> import dlt
>
> @dlt.table
> def source_customers():
>     return spark.table("bronze.raw_customers")
>
> dlt.apply_changes(
>     target="dim_customer",
>     source="source_customers",
>     keys=["customer_id"],
>     sequence_by="updated_at",
>     stored_as_scd_type=2
> )
> ```
>
> DLT handles both phases atomically, manages the surrogate key, and integrates with Unity Catalog lineage.
>
> **Querying SCD2:**
>
> ```sql
> -- Current records only
> SELECT * FROM dim_customer WHERE is_current = true;
>
> -- What was the customer's city on 2024-06-01?
> SELECT * FROM dim_customer
> WHERE customer_id = 42
>   AND valid_from <= '2024-06-01'
>   AND (valid_to IS NULL OR valid_to > '2024-06-01');
> ```
>
> ### Follow-up Questions
>
> - The two-phase approach (MERGE + INSERT) is not atomic by default. What are the consistency risks, and how do you mitigate them in Delta Lake?
> - How do you handle a customer record that reverts to a previous value (e.g., moves back to New York)?
> - Your `dim_customer` SCD2 table has 10 years of history and 500M rows. How do you optimize queries that only need `is_current = true` records?

---

## Question 5: Data Model Versioning and Handling Breaking Schema Changes

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Your `gold.daily_sales_summary` table needs two changes: (1) add a new `channel` column, and (2) rename `customer_segment` to `segment`. Three downstream dashboards and one ML feature pipeline depend on this table. How do you execute this migration without breaking consumers?

> [!success]- Answer Framework
>
> **Short Answer**: Adding a column is a safe additive change (`mergeSchema=true`) that leaves consumers unaffected; renaming a column is a breaking change — instead, add the new `segment` column alongside the old `customer_segment`, create or update a view as the stable consumer interface, communicate a deprecation timeline, and drop the old column only after all consumers have migrated.
>
> ### Key Points to Cover
>
> - Additive changes (add column): safe; consumers not affected; use `mergeSchema=true`
> - Breaking changes (rename, drop, type change): always additive-first, then migrate consumers
> - View as stable interface: underlying table can change; the view contract is what consumers depend on
> - Delta `mergeSchema` for additive changes
> - Deprecation lifecycle: add new → communicate → migrate consumers → drop old
> - Data contracts and UC Tags as governance patterns
>
> ### Example Answer
>
> **Change 1 — Add `channel` column** (safe additive change):
>
> ```python
> # Option A: add column with ALTER TABLE
> spark.sql("ALTER TABLE gold.daily_sales_summary ADD COLUMN channel STRING")
>
> # Option B: write with mergeSchema=true (new column added automatically)
> (df_with_channel.write
>     .format("delta")
>     .mode("append")
>     .option("mergeSchema", "true")
>     .saveAsTable("gold.daily_sales_summary"))
> ```
>
> Existing consumers that reference named columns are unaffected. `channel` appears as NULL for historical rows — additive, no breakage.
>
> **Change 2 — Rename `customer_segment` to `segment`** (breaking change):
>
> **Do NOT do this directly:**
>
> ```sql
> -- This breaks every dashboard and pipeline immediately
> ALTER TABLE gold.daily_sales_summary RENAME COLUMN customer_segment TO segment;
> ```
>
> **Correct migration pattern:**
>
> ```sql
> -- Step 1: Add new column alongside old (both exist simultaneously)
> ALTER TABLE gold.daily_sales_summary ADD COLUMN segment STRING;
>
> -- Step 2: Backfill new column from old
> UPDATE gold.daily_sales_summary SET segment = customer_segment;
>
> -- Step 3: Create or update the stable view interface
> CREATE OR REPLACE VIEW gold.v_daily_sales_summary AS
> SELECT
>     date,
>     channel,
>     segment,
>     revenue,
>     order_count
> FROM gold.daily_sales_summary;
> ```
>
> **Step 4 — Communicate the deprecation** to dashboard owners and the ML team:
>
> - `customer_segment` column is deprecated; use `segment` (or use the view) by a specified date
>
> **Step 5 — Drop old column** only after all consumers confirm migration:
>
> ```sql
> ALTER TABLE gold.daily_sales_summary DROP COLUMN customer_segment;
> ```
>
> **UC Tags for governance:**
>
> ```sql
> ALTER TABLE gold.daily_sales_summary
> SET TAGS ('contract_version' = '2.0', 'deprecated_columns' = 'customer_segment');
> ```
>
> **Change classification:**
>
> | Change Type | Breaking? | Safe Approach |
> | ----------- | --------- | ------------- |
> | Add column | No | `mergeSchema=true` or `ALTER TABLE ADD COLUMN` |
> | Rename column | Yes | Add new column → migrate consumers → drop old |
> | Drop column | Yes | Deprecation lifecycle |
> | Change data type | Yes | New column with new type + migration |
> | Add partition | Possibly | Test with downstream; rewrite if needed |
>
> ### Follow-up Questions
>
> - A consumer ML pipeline reads the table with `spark.read.table()`. How does it behave when a column it references is dropped?
> - How do you use Delta Lake time travel to recover data from before the schema change if something goes wrong?
> - What is a "data contract" and how does it formalize the producer-consumer relationship for tables like this?

---

**[← Previous: Streaming & CDC](./05-streaming-cdc.md) | [↑ Back to Interview Prep](./README.md) | [Next: Performance Optimization →](./07-performance-optimization.md)**

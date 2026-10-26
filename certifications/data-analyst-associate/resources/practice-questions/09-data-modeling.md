---
title: Data Modeling with Databricks SQL Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, data-modeling, star-schema, data-vault, medallion]
---

# Data Modeling with Databricks SQL Practice Questions

**Exam Weight: 5 %** — Section 8 of the October 2025 exam guide

Every question here targets the October 2025 exam guide and is marked *(2025 blueprint)*. All questions were checked against Databricks documentation and Databricks blog guidance on October 26, 2026.

[← Previous: Importing Data](./08-importing-data.md) | [↑ Back to Practice Questions](./README.md)

---

## Question 1: Star Schema Shape *(Easy)* *(2025 blueprint)*

Which description matches a star schema?

A) Every table normalized to third normal form  
B) Hubs, links, and satellites  
C) One central fact table with measures, joined to denormalized dimension tables  
D) One wide table with every attribute  

> [!success]- Answer
> **Correct Answer: C**
>
> A star schema has a central fact table holding measures, such as amounts and quantities, joined to dimension tables such as date, product, and customer. Dimensions are denormalized, with redundant columns, so queries need fewer joins.
>
> Option B describes Data Vault. Option A describes a 3NF model.

---

## Question 2: Snowflake vs Star *(Medium)* *(2025 blueprint)*

How does a snowflake schema differ from a star schema?

A) A snowflake schema has no fact table  
B) A snowflake schema stores data only in Snowflake  
C) A snowflake schema denormalizes the fact table  
D) A snowflake schema normalizes dimensions into several related tables, so queries need more joins  

> [!success]- Answer
> **Correct Answer: D**
>
> In a snowflake schema, a dimension such as product is split into product, category, and department tables. That reduces redundancy but adds joins. A star schema keeps each dimension in one denormalized table, which is simpler for BI users.
>
> The name has nothing to do with the Snowflake product (B).

---

## Question 3: Spotting the Fact Table *(Easy)* *(2025 blueprint)*

A model has `dim_customer`, `dim_product`, `dim_date`, and a table with `order_id`, `customer_key`, `product_key`, `date_key`, `quantity`, and `net_amount`. What is that last table?

A) A fact table  
B) A dimension table  
C) A bridge table  
D) A satellite table  

> [!success]- Answer
> **Correct Answer: A**
>
> It holds numeric measures (`quantity`, `net_amount`) and foreign keys to each dimension, which is what a fact table looks like.

---

## Question 4: Data Vault Building Blocks *(Medium)* *(2025 blueprint)*

In a Data Vault model, which table type stores the descriptive attributes of a business entity, and their history?

A) Satellite  
B) Hub  
C) Link  
D) Fact  

> [!success]- Answer
> **Correct Answer: A**
>
> Hubs hold the core business entities, keyed by business keys. Links hold only the join keys that relate hubs. Satellites hold the descriptive attributes of a hub or link, with their history.
>
> Facts belong to dimensional models, not Data Vault (D).

---

## Question 5: Data Vault Keys *(Hard)* *(2025 blueprint)*

What does Data Vault modeling recommend as the primary key of a hub, and how can it be built in Databricks SQL?

A) An auto-increment identity column  
B) The load timestamp alone  
C) A random UUID per load  
D) A hash of the business key, built with functions such as `md5` or `sha2`  

> [!success]- Answer
> **Correct Answer: D**
>
> Data Vault recommends hashing the business keys to form primary keys. Databricks SQL provides `hash`, `md5`, and SHA functions for this.
>
> A hash is deterministic, so the same business key always produces the same primary key, load after load. A random UUID changes on every load (C).

---

## Question 6: Models and Medallion Layers *(Medium)* *(2025 blueprint)*

According to Databricks guidance, where do Data Vault and Kimball star schemas usually fit in the medallion architecture?

A) Both in bronze  
B) Star schemas in silver; Data Vault in gold  
C) Neither fits a lakehouse  
D) Data Vault (and 3NF-like models) in silver; Kimball star schemas in gold  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks guidance places Data Vault hubs, links, and satellites, and other 3NF-like models, in the silver layer. Kimball-style star schemas and data marts fit the gold layer, which serves reporting.
>
> Bronze holds raw, unvalidated data as it arrived (A).

---

## Question 7: What the Gold Layer Is For *(Easy)* *(2025 blueprint)*

Which statement best describes the gold layer?

A) Highly refined data, modeled dimensionally with defined measures, that drives dashboards, analytics, ML, and applications  
B) Raw files exactly as they arrived  
C) A temporary staging area that is deleted daily  
D) The layer where schema enforcement is turned off  

> [!success]- Answer
> **Correct Answer: A**
>
> Gold holds highly refined views of the data. The medallion docs describe modeling it with a dimensional model, establishing relationships and defining measures. Its users include business analysts, BI developers, data scientists, and executives.
>
> Raw data is bronze (B). Silver is validated, cleaned, and enriched data.

---

## Question 8: Why Add a Star Schema on Top of a Vault *(Medium)* *(2025 blueprint)*

A team loads source data into a Data Vault in silver. Why do they still build star schemas in gold for analysts?

A) Data Vault cannot store history  
B) Data Vault is write-optimized and needs many joins to answer business questions; star schemas are simpler and faster to query for BI  
C) Star schemas cannot be built from a vault  
D) Gold must contain exactly one table  

> [!success]- Answer
> **Correct Answer: B**
>
> Data Vault is a write-optimized style that adapts well to changing sources. Answering a business question can need many hub, link, and satellite joins. A dimensional model in gold presents the same data in a shape that BI users and tools query easily.
>
> Satellites keep history, so option A is false.

---

## Question 9: Where Cleaning Happens *(Easy)* *(2025 blueprint)*

In the medallion architecture, where are type casting, null handling, and deduplication usually done?

A) Silver  
B) Bronze  
C) Gold  
D) In each dashboard  

> [!success]- Answer
> **Correct Answer: A**
>
> Silver holds validated, cleaned, and enriched versions of the bronze data. Medallion is a recommended pattern, not a requirement.
>
> Gold builds business-level models on top of clean silver data (C).

---

**[← Previous: Importing Data Practice Questions](./08-importing-data.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md)**

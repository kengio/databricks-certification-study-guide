---
title: Lakehouse Architecture
type: study-material
tags:
  - lakehouse
  - architecture
  - data-platform
---

# Lakehouse Architecture

## Overview

The Databricks Lakehouse combines the best of data warehouses and data lakes, enabling analytics, AI, and real-time applications on all your data. On the exam this is Domain 1 (Databricks Intelligence Platform): the core components, meaning the architecture, Delta Lake, and Unity Catalog.

> [!abstract]
>
> - A lakehouse keeps one copy of data in open formats on cloud object storage and adds warehouse-grade reliability with Delta Lake
> - Medallion layers: Bronze (raw, as ingested), Silver (cleaned and conformed), Gold (business-level aggregates for BI and analytics)
> - Unity Catalog adds centralized access control, lineage, and auditing across workspaces

> [!tip] What the Exam Tests
>
> - Exam guide skill: understand the core components of the platform (architecture, Delta Lake, Unity Catalog)
> - Why one governed copy of the data gives AI and BI a single source of truth, with rollback (time travel) and audit trails
> - Which medallion layer a given transformation or table belongs in

---

## Lakehouse Architecture

```mermaid
flowchart LR
    subgraph DataLake["Data Lake"]
        S1["Raw Data Sources"]
        S2["Historical Logs"]
        S3["Streaming Data"]
    end

    subgraph Medallion["Medallion Layers"]
        B["Bronze Layer<br/>(Raw)"]
        S["Silver Layer<br/>(Cleaned)"]
        G["Gold Layer<br/>(Analytics)"]
    end

    subgraph Governance["Governance"]
        UC["Unity Catalog"]
        Policy["Access Control"]
        Audit["Auditing"]
    end

    subgraph Compute["Compute Engines"]
        SQL["SQL Engine"]
        Analytics["Analytics"]
        ML["ML/AI"]
    end

    S1 --> B
    S2 --> B
    S3 --> B
    B --> S
    S --> G
    G --> SQL
    G --> Analytics
    G --> ML
    UC --> Governance
    Policy --> Governance
    Audit --> Governance
```

## Data Warehouse vs Data Lake vs Lakehouse

| Aspect | Data Warehouse | Data Lake | Lakehouse |
|--------|---|---|---|
| **Data Format** | Structured only | Any format | Structured + Unstructured |
| **Cost** | High | Low | Low |
| **Speed** | Very fast queries | Slower queries | Fast queries |
| **Governance** | Strong | Weak | Strong |
| **Flexibility** | Fixed schema | Flexible | Both |
| **Use Cases** | BI, Analytics | Data science, ML | All |

## Key Lakehouse Concepts

### **ACID Transactions**

- Ensures data reliability and consistency
- Supports concurrent reads and writes
- Enables rollback and recovery
- Built into Delta Lake format

### **Schema Enforcement & Evolution**

```python
# Schema enforcement prevents bad data

(df.write
    .mode("append")
    .saveAsTable("main.silver.orders"))   # fails if df's schema doesn't match

# Schema evolution allows controlled changes

(df.write
    .mode("append")
    .option("mergeSchema", "true")
    .saveAsTable("main.silver.orders"))   # adds new columns from df
```

### **Data Versioning & Time Travel**

- Access historical versions of data
- Query data "as of" a specific timestamp
- No git, snapshots work like version control

```python
# Time travel query

(spark.read
    .option("versionAsOf", 0)
    .table("main.silver.orders"))

# Or by timestamp

(spark.read
    .option("timestampAsOf", "2025-01-15")
    .table("main.silver.orders"))
```

### **Data Lineage & Audit Logs**

- Track data changes over time
- Who modified data and when
- Support compliance requirements
- Enable data governance

## Delta Lake Foundation

Delta Lake is the open-source storage engine powering the Lakehouse:

- **ACID Compliance**: Multi-version concurrency control (MVCC)
- **Format**: Parquet files + transaction log
- **Reliability**: Handles schema mismatches and data corruption
- **Performance**: Native support for DELETE, UPDATE, MERGE operations

```python
# Create a Delta table

df.write.mode("overwrite").saveAsTable("main.bronze.my_table")   # Delta is the default format

# Or convert existing Parquet

from delta.tables import DeltaTable
DeltaTable.convertToDelta(spark, "parquet.`/path/to/data`")
```

## Medallion Architecture (Bronze/Silver/Gold)

A best-practice data organization pattern:

```mermaid
flowchart TB
    Raw["Raw Data Sources"]

    subgraph Bronze["🥉 Bronze Layer"]
        B1["Raw Ingestion"]
        B2["Minimal Transformation"]
        B3["Append-Only"]
    end

    subgraph Silver["🥈 Silver Layer"]
        S1["Cleaned & Deduplicated"]
        S2["Schema Enforced"]
        S3["Business Logic Applied"]
    end

    subgraph Gold["🥇 Gold Layer"]
        G1["Business Aggregates"]
        G2["Dimension Tables"]
        G3["Optimized for BI/ML"]
    end

    BI["BI Tools & Dashboards"]
    ML["ML Models"]

    Raw --> Bronze
    Bronze --> Silver
    Silver --> Gold
    Gold --> BI
    Gold --> ML
```

### Bronze Layer

- **Purpose**: Raw ingestion from source systems
- **Schema**: Matches source exactly (may be unstructured)
- **Retention**: Minimal transformation, keep all raw data
- **Quality**: May contain duplicates, nulls, errors
- **Use Case**: Preserve original data for audit trails

### Silver Layer

- **Purpose**: Cleansed, deduplicated analytical hub
- **Schema**: Standardized, enforced
- **Retention**: Remove duplicates, handle nulls
- **Quality**: Conforms to business rules
- **Use Case**: Join source systems, identify dimensions

### Gold Layer

- **Purpose**: Business-ready aggregates for BI/ML
- **Schema**: Optimized for specific use cases
- **Retention**: Only needed for analytics
- **Quality**: Fully validated, high confidence
- **Use Case**: Power dashboards, ML features

## Where Each Layer Lives in Databricks

| Layer | Typical Unity Catalog location | Format | Access |
|-------|---------|--------|--------|
| **Bronze** | `main.bronze.*` tables (raw files in a UC volume such as `/Volumes/main/raw/landing/`) | Delta | Data engineers |
| **Silver** | `main.silver.*` | Delta | Data engineers, analysts |
| **Gold** | `main.gold.*` tables, views, and materialized views | Delta | Analysts, BI tools, ML |

Many teams use a catalog per environment (`dev`, `prod`) and a schema per layer. Some use a catalog per layer instead. Either way, the layers are UC securables, not DBFS mount paths. DBFS mounts are deprecated in favour of Unity Catalog volumes and external locations ([What is DBFS?](https://docs.databricks.com/aws/en/dbfs/)).

## Unity Catalog for Governance

Unity Catalog provides a unified governance solution:

- **Catalogs**: Database-like containers for organizing tables
- **Schemas**: Namespaces within catalogs
- **Tables/Volumes**: Data objects with fine-grained access control
- **Fine-grained security**: row filters, column masks, and ABAC policies (see [Domain 7](../07-governance-and-security/04-row-filters-column-masks-abac.md))

```python
# Three-level namespace

spark.sql("SELECT * FROM main.default.my_table")

#                        ^    ^       ^
#                  catalog schema  table

```

## Use Cases

1. **Real-Time Analytics**: Stream data through medallion layers, query immediately
2. **Machine Learning**: Reproducible feature sets in Gold layer, time travel for data versioning
3. **Data Warehousing**: Replace traditional EDW with lower cost, more flexibility
4. **Compliance**: Audit trails on all data changes, column-level masking
5. **Data Sharing**: Secure external data sharing without data duplication

## Common Issues & Errors

### Conflicting Data Formats

**Scenario:** Queries fail when mixing Parquet, CSV, and JSON files in the same directory.

**Fix:** Convert all raw data to Delta format early in the medallion pipeline (Bronze layer) so downstream layers always read a consistent format.

### Stale Metadata Cache

**Scenario:** Newly written data is not visible to queries.

**Fix:** Run `REFRESH TABLE <table_name>` or use Delta Lake (which handles metadata automatically) instead of plain Parquet/CSV tables.

## Exam Tips

- Know the three layers of the Medallion Architecture (Bronze, Silver, Gold) and the purpose of each
- Understand the difference between a data warehouse, data lake, and lakehouse — especially around ACID support and schema flexibility
- Remember that Delta Lake is Parquet + transaction log; this enables ACID, time travel, and DML operations
- Be able to identify the Unity Catalog three-level namespace: `catalog.schema.table`

## Key Takeaways

- **Lakehouse combines**: ACID transactions and strong governance of a data warehouse with the low cost and schema flexibility of a data lake
- **Delta Lake**: Powers the Lakehouse — Parquet files plus a transaction log; enables ACID, time travel, and MERGE/UPDATE/DELETE
- **Medallion layers**: Bronze (raw ingestion, append-only) → Silver (cleansed, deduplicated, schema-enforced) → Gold (business aggregates, BI/ML-ready)
- **Schema enforcement**: Default behavior; prevents bad data writes. Enable evolution with `.option("mergeSchema", "true")`
- **Time travel**: Query by version (`versionAsOf`) or timestamp (`timestampAsOf`) — no external tool needed
- **Unity Catalog namespace**: Three levels — `catalog.schema.table`; provides column-level security, lineage, and auditing
- **ACID via MVCC**: Multi-version concurrency control lets concurrent readers and writers operate without locks

## Related Topics

- [Delta Lake Fundamentals](04-delta-lake-fundamentals.md)
- [Unity Catalog Basics](../07-governance-and-security/01-unity-catalog-basics.md)
- [Medallion Architecture (Shared)](../../../shared/fundamentals/medallion-architecture.md)

## Official Documentation

- [What is a data lakehouse?](https://docs.databricks.com/aws/en/lakehouse/)
- [What is Delta Lake?](https://docs.databricks.com/aws/en/delta/)
- [What is Unity Catalog?](https://docs.databricks.com/aws/en/data-governance/unity-catalog/)

---

**[↑ Back to Databricks Intelligence Platform](./README.md) | [Next: Databricks Workspace →](./02-databricks-workspace.md)**

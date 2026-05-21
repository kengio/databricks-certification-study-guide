---
title: Hands-On Lab Pack
type: labs-index
tags:
  - labs
  - hands-on
  - databricks
status: published
---

# Hands-On Lab Pack

Runnable, scenario-driven labs that exercise the core Databricks features tested across the certification line-up. Each lab is a single file with full code, step-by-step prose, and verification commands. Read them in order or jump to whichever feature you need to drill.

> [!important]
> **Each lab assumes a Databricks workspace with Unity Catalog enabled.** Pick a catalog you can write to (the examples use `main` — substitute your own catalog). All paths use UC volumes (`/Volumes/...`), not DBFS mounts.

## Labs

| # | Lab | Topics exercised | Certs |
| :---: | :--- | :--- | :--- |
| **01** | [Medallion ingestion](./01-medallion-ingestion.md) | Bronze / Silver / Gold layering, Delta operations, MERGE, OPTIMIZE | DE Associate · DE Professional |
| **02** | [Unity Catalog setup](./02-unity-catalog-setup.md) | Catalog / schema / volume creation, GRANT, row filters, column masks | DE Associate · DE Professional · Data Analyst · ML Associate · GenAI |
| **03** | [Lakeflow Declarative Pipelines](./03-lakeflow-declarative-pipelines.md) | `@dlt.table`, expectations, `APPLY CHANGES INTO`, event log | DE Professional |
| **04** | [MLflow tracking and Model Registry in UC](./04-mlflow-tracking.md) | MLflow autologging, Model Registry in UC, version promotion | ML Associate · ML Professional |
| **05** | [Mosaic AI Vector Search + RAG demo](./05-mosaic-ai-rag-demo.md) | Embeddings, Vector Search index, `ResponsesAgent` compound app, deployment | GenAI Engineer Associate |

## Prerequisites

- Databricks workspace with Unity Catalog enabled and a serverless or Pro SQL Warehouse available
- A catalog you can write to (the examples use `main`)
- A user identity with at least `USE CATALOG` + `CREATE SCHEMA` on the target catalog
- For Lab 04: a workspace with Mosaic AI Model Serving available
- For Lab 05: Mosaic AI Vector Search and Foundation Model APIs enabled

## How the labs map to the study guide

Each lab cross-links into the relevant topic folders so you can drill deeper after running the code. The labs are *exercises*; the topic folders are the *reference material*.

## Running the code

The code blocks are designed to run in a Databricks notebook (PySpark / SQL / Python cells). Copy each block into a separate cell and run top-to-bottom. Verification SQL queries at the end of each section help you confirm each step worked.

## Cleanup

Each lab ends with a **Cleanup** section that drops the resources it created so you don't accumulate Delta tables and Vector Search indexes across runs.

---

**[← Back to repo root](../README.md)**

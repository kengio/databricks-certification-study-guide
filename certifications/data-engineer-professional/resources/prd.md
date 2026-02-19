---
tags: [prd, data-engineer-professional, planning]
---

# PRD: Databricks Data Engineer Professional Study Guide

## Overview

Complete study guide for the Databricks Data Engineer Professional certification, covering all 8 exam sections with comprehensive content files.

## Final Status

| Section | Exam Weight | Status | Files |
|---------|-------------|--------|-------|
| 01-Data Processing | 30% | ✅ Complete | 9 |
| 02-Databricks Tooling | 20% | ✅ Complete | 5 |
| 03-Data Modeling | 15% | ✅ Complete | 5 |
| 04-Security & Governance | 10% | ✅ Complete | 6 |
| 05-Monitoring & Logging | 10% | ✅ Complete | 4 |
| 06-Testing & Deployment | 10% | ✅ Complete | 6 |
| 07-Lakeflow Pipelines | 5% | ✅ Complete | 4 |
| 08-Performance Optimization | 5% | ✅ Complete | 7 |

**Total content files: 46** (split from 4 oversized files, each divided into 2 focused files)

## Content Format Standard

Each content file follows this structure:

- **Length**: 600-900 lines
- **Components**:
  - Overview with mermaid diagram
  - Key concepts with explanations
  - Code examples (Python and SQL)
  - Comparison tables
  - Common issues/errors section
  - Exam tips (10 key points)
  - Related topics with links
  - Official documentation references

## Completed Files by Section

### Section 01: Data Processing (30%)

| File | Topic |
|------|-------|
| `01-batch-etl-pipelines.md` | Batch processing patterns |
| `02-incremental-processing.md` | Change Data Feed, incremental loads |
| `03-structured-streaming.md` | Structured Streaming |
| `04-auto-loader.md` | Auto Loader ingestion |
| `05-change-data-capture.md` | CDC patterns |
| `06-delta-lake-operations.md` | Delta Lake fundamentals |
| `07-data-deduplication.md` | Deduplication strategies |
| `08-streaming-joins-stateful.md` | Stream-stream joins, stateful ops, watermarking, deduplication |
| `09-streaming-monitoring-optimization.md` | Back-pressure, monitoring, state store, troubleshooting |

### Section 02: Databricks Tooling (20%)

| File | Topic | Key Content |
|------|-------|-------------|
| `01-workspace-and-notebooks.md` | Notebook features | Widgets, magic commands, %run, dbutils |
| `02-databricks-cli.md` | CLI commands | Authentication, workspace management, secrets |
| `03-rest-api.md` | REST API | Jobs API 2.1, Clusters API, SDK |
| `04-databricks-compute.md` | Compute types | All-purpose vs job clusters, serverless, pools |
| `05-dbfs-and-mounts.md` | Storage | DBFS, Unity Catalog volumes, cloud mounts |

### Section 03: Data Modeling (15%)

| File | Topic | Key Content |
|------|-------|-------------|
| `01-medallion-architecture.md` | Multi-hop design | Bronze/Silver/Gold layers, data quality tiers |
| `02-delta-lake-fundamentals.md` | Delta Lake | ACID, time travel, cloning, constraints |
| `03-schema-management.md` | Schema handling | Enforcement, evolution, column mapping |
| `04-scd-patterns.md` | SCD implementation | Type 1, Type 2, Type 3 with MERGE |
| `05-partitioning-strategies.md` | Partitioning | Selection criteria, liquid clustering, Z-ORDER |

### Section 04: Security & Governance (10%)

| File | Topic | Key Content |
|------|-------|-------------|
| `01-unity-catalog.md` | UC fundamentals | Metastore, catalog hierarchy, permissions |
| `02-access-control.md` | Access control | Row/column security, dynamic views |
| `03-data-sharing.md` | Delta Sharing | External sharing, recipients, marketplace |
| `04-secret-management.md` | Secrets | Scopes, dbutils.secrets, Key Vault integration |
| `05-audit-lineage-network-security.md` | Audit & observability | Data lineage, audit logging, information schema, network security |
| `06-classification-compliance-permissions.md` | Data protection | Data classification, GDPR/CCPA compliance, advanced permissions |

### Section 05: Monitoring & Logging (10%)

| File | Topic | Key Content |
|------|-------|-------------|
| `01-system-tables.md` | System tables | Audit logs, billing, query history |
| `02-spark-ui-debugging.md` | Spark UI | Stages, tasks, shuffle, bottlenecks |
| `03-lakeflow-event-logs.md` | DLT observability | Event log queries, pipeline metrics |
| `04-query-profiler.md` | Query analysis | EXPLAIN plans, AQE, optimization |

### Section 06: Testing & Deployment (10%)

| File | Topic | Key Content |
|------|-------|-------------|
| `01-asset-bundles.md` | DAB | Bundle structure, databricks.yml, targets |
| `02-cicd-integration.md` | CI/CD | GitHub Actions, Azure DevOps, GitLab |
| `03-git-folders.md` | Git integration | Git folders, branching, PR workflows |
| `04-unit-testing.md` | Testing | pytest, Nutter framework, mocking |
| `05-bundle-deployment-strategies.md` | Deployment | Advanced bundle patterns, CI/CD pipelines, blue/green, OIDC |
| `06-advanced-testing-operations.md` | Advanced testing | Property-based testing, DLT testing, integration tests, GitOps |

### Section 07: Lakeflow Pipelines (5%)

| File | Topic | Key Content |
|------|-------|-------------|
| `01-declarative-pipelines.md` | DLT syntax | Streaming tables, materialized views |
| `02-expectations-data-quality.md` | Expectations | EXPECT, DROP ROW, FAIL UPDATE |
| `03-apply-changes-api.md` | CDC with DLT | APPLY CHANGES, SCD Type 1/2 |
| `04-lakeflow-jobs.md` | Orchestration | Task dependencies, triggers, task values |

### Section 08: Performance Optimization (5%)

| File | Topic | Key Content |
|------|-------|-------------|
| `01-file-sizing.md` | File optimization | OPTIMIZE, auto compaction, streaming |
| `02-zorder-indexing.md` | Data skipping | Z-ORDER, liquid clustering, bloom filters |
| `03-spark-tuning.md` | Spark configs | AQE, shuffle, joins, memory tuning |
| `04-cost-optimization.md` | Cost management | Spot instances, autoscaling, serverless |
| `05-explain-plans-aqe.md` | Query analysis | EXPLAIN plans, AQE deep dive, runtime optimization |
| `06-photon-diagnostics-optimization.md` | Acceleration | Photon engine, memory diagnostics, Spark UI, query optimization |
| `07-streaming-optimization.md` | Streaming perf | Streaming-specific performance tuning |

## Directory Structure

```text
certifications/data-engineer-professional/
├── README.md
├── prd.md (this file)
├── 01-data-processing/
│   ├── README.md
│   └── [9 content files]
├── 02-databricks-tooling/
│   ├── README.md
│   └── [5 content files]
├── 03-data-modeling/
│   ├── README.md
│   └── [5 content files]
├── 04-security-governance/
│   ├── README.md
│   └── [6 content files]
├── 05-monitoring-logging/
│   ├── README.md
│   └── [4 content files]
├── 06-testing-deployment/
│   ├── README.md
│   └── [6 content files]
├── 07-lakeflow-pipelines/
│   ├── README.md
│   └── [4 content files]
└── 08-performance-optimization/
    ├── README.md
    └── [7 content files]
```

## Enhancements Status

| Enhancement | Status | Location |
|-------------|--------|----------|
| Practice Questions | ✅ Complete | `resources/practice-questions/` (73 questions) |
| Mock Exam 1 | ✅ Complete | `resources/mock-exam/` (63 questions) |
| Mock Exam 2 | ✅ Complete | `resources/mock-exam-2/` (60 questions) |
| Cheat Sheets | ✅ Complete | `cheat-sheets/` (5 quick reference cards) |
| Exam Tips | ✅ Complete | `resources/exam-tips.md` |
| Official Links | ✅ Complete | `resources/official-links.md` |

### Future Additions (Optional)

1. **Hands-on Labs** - Practical exercises with sample data
2. **Study Schedule** - Recommended timeline for exam preparation

## Verification Checklist

### Content Files

- [x] All 41 content files created (7 in Section 01 + 34 new)
- [x] Each file follows established format (600-900 lines)
- [x] Mermaid diagrams included in all files
- [x] Code examples in Python and SQL
- [x] Comparison tables for key concepts
- [x] Common issues/errors documented
- [x] Exam tips included (10 per file)
- [x] Cross-references to related topics
- [x] Official documentation links provided

### Practice Materials

- [x] Practice questions cover all 8 sections (73 questions)
- [x] Mock Exam 1 with answer key (63 questions)
- [x] Mock Exam 2 with answer key (60 questions)
- [x] Cheat sheets for high-weight topics (5 cards)
- [x] Exam tips and strategies documented

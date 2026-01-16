# Databricks Data Engineer Professional Certification Study Notes

## Exam Overview

| Detail | Information |
|--------|-------------|
| **Certification** | Databricks Certified Data Engineer Professional |
| **Questions** | ~60 multiple-choice |
| **Duration** | 120 minutes (2 hours) |
| **Passing Score** | 70% |
| **Languages** | Python and SQL |
| **Experience** | 1+ years hands-on with Databricks |
| **Recertification** | Every 2 years |

## Exam Domain Weights

```mermaid
pie title Exam Topic Distribution
    "Data Processing" : 30
    "Databricks Tooling" : 20
    "Data Modeling" : 15
    "Security & Governance" : 10
    "Monitoring & Logging" : 10
    "Testing & Deployment" : 10
    "Other (Lakeflow, Perf)" : 5
```

## Study Guide Structure

### Core Topics (By Exam Weight)

| Section | Weight | Topics |
|---------|--------|--------|
| [01-Data Processing](01-data-processing/) | 30% | ETL pipelines, streaming, CDC, Delta Lake operations |
| [02-Databricks Tooling](02-databricks-tooling/) | 20% | Workspace, CLI, REST API, compute |
| [03-Data Modeling](03-data-modeling/) | 15% | Medallion architecture, schema management, SCD |
| [04-Security & Governance](04-security-governance/) | 10% | Unity Catalog, access control, data sharing |
| [05-Monitoring & Logging](05-monitoring-logging/) | 10% | System tables, Spark UI, observability |
| [06-Testing & Deployment](06-testing-deployment/) | 10% | Asset Bundles, CI/CD, Git integration |

### Additional Topics

| Section | Description |
|---------|-------------|
| [07-Lakeflow Pipelines](07-lakeflow-pipelines/) | Delta Live Tables, declarative pipelines, data quality |
| [08-Performance Optimization](08-performance-optimization/) | File sizing, indexing, Spark tuning |

### Quick Reference

| Resource | Purpose |
|----------|---------|
| [Cheat Sheets](cheat-sheets/) | Last-minute review before exam |
| [Appendix](appendix/) | Glossary, comparison tables, error reference |
| [Resources](resources/) | Exam tips, practice questions, official links |

## Key Technologies Covered

- **Delta Lake** - ACID transactions, time travel, CDF
- **Unity Catalog** - Data governance and access control
- **Auto Loader** - Incremental file ingestion
- **Lakeflow (DLT)** - Declarative ETL pipelines
- **Structured Streaming** - Real-time data processing
- **Databricks Asset Bundles** - CI/CD and deployment

## Study Progress Tracker

### Phase 1: Foundations

- [ ] Delta Lake fundamentals
- [ ] Medallion architecture
- [ ] Unity Catalog basics

### Phase 2: Core Processing

- [ ] Batch ETL patterns
- [ ] Structured Streaming
- [ ] Auto Loader
- [ ] Change Data Capture

### Phase 3: Advanced Topics

- [ ] Lakeflow/DLT pipelines
- [ ] Performance optimization
- [ ] Security & governance
- [ ] Monitoring & debugging

### Phase 4: Exam Prep

- [ ] Review cheat sheets
- [ ] Complete practice questions
- [ ] Review weak areas

## Official Resources

- [Databricks Certification Page](https://www.databricks.com/learn/certification/data-engineer-professional)
- [Databricks Documentation](https://docs.databricks.com/)
- [Databricks Academy](https://www.databricks.com/learn/training)

## Recommended Courses

1. **Advanced Data Engineering with Databricks** - Primary exam prep course
2. **Data Management and Governance with Unity Catalog**
3. **Build Data Pipelines with Lakeflow Spark Declarative Pipelines**
4. **Automated Deployment with Databricks Asset Bundles**

---

*Last updated: January 2026*

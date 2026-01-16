# Version History and Feature Timeline

## Delta Lake Versions

### Delta Lake 3.x (2024+)

| Version | Key Features |
|---------|-------------|
| **3.2** | Liquid Clustering GA, Deletion Vectors improvements |
| **3.1** | UniForm GA (Iceberg/Hudi compatibility), Variant type |
| **3.0** | Default column mapping, Coordinated commits |

### Delta Lake 2.x (2022-2023)

| Version | Key Features |
|---------|-------------|
| **2.4** | Liquid Clustering preview, Deletion vectors |
| **2.3** | Type widening, Domain metadata |
| **2.2** | Column mapping mode changes |
| **2.1** | Change Data Feed improvements |
| **2.0** | Python API parity, DROP COLUMN support |

### Delta Lake 1.x (2020-2022)

| Version | Key Features |
|---------|-------------|
| **1.2** | Change Data Feed (CDF) |
| **1.1** | Generated columns, MERGE improvements |
| **1.0** | GA release, Z-ordering |

## Databricks Runtime Versions

### Current LTS Versions (Recommended)

| Version | Release | Delta Lake | Spark | Support Until |
|---------|---------|------------|-------|---------------|
| **15.4 LTS** | 2024 | 3.2 | 3.5 | ~2026 |
| **14.3 LTS** | 2024 | 3.1 | 3.5 | ~2025 |
| **13.3 LTS** | 2023 | 2.4 | 3.4 | ~2025 |

### Feature Availability by Runtime

| Feature | Min Runtime |
|---------|-------------|
| Liquid Clustering | 13.3+ |
| Deletion Vectors | 12.1+ |
| Predictive Optimization | 12.0+ |
| Photon | 9.1+ (fully GA 10.4+) |
| Unity Catalog | 11.3+ |

## Unity Catalog Evolution

### 2024+

- Lakehouse Federation GA
- AI/ML asset governance
- Volumes GA
- Enhanced Delta Sharing

### 2023

- Unity Catalog GA
- External locations
- Storage credentials
- System tables

### 2022

- Unity Catalog preview
- Three-level namespace
- Centralized access control

## Lakeflow/DLT Evolution

### Current (2024+)

- Renamed from Delta Live Tables to Lakeflow
- Serverless compute support
- Enhanced monitoring
- APPLY CHANGES improvements

### DLT 2023

- Streaming tables
- Materialized views
- Expectations with metrics
- Event log improvements

### DLT 2022

- DLT GA release
- Python and SQL support
- CDC support

## Auto Loader Evolution

| Year | Feature |
|------|---------|
| **2024** | Schema evolution improvements, rescue data |
| **2023** | File notification mode GA (all clouds) |
| **2022** | Inferred schema persistence |
| **2021** | Auto Loader GA |

## Databricks Asset Bundles (DAB)

| Version | Features |
|---------|----------|
| **2024** | DAB GA, Enhanced templates |
| **2023** | DAB preview, Basic templates |

## Key Configuration Changes

### Deprecated Settings

| Old Setting | Replacement | Since |
|-------------|-------------|-------|
| `spark.databricks.delta.merge.enabledTriggers` | Always enabled | DBR 12.0 |
| `delta.autoOptimize.optimizeWrite` | On by default | DBR 11.0 |
| Hive metastore tables | Unity Catalog | DBR 11.3 |

### Default Changes

| Setting | Old Default | New Default | Since |
|---------|-------------|-------------|-------|
| AQE | false | true | Spark 3.2 |
| Column mapping | none | name | Delta 3.0 |
| CDF | false | configurable | Delta 2.0 |

## Exam Relevance Notes

### Focus Areas (2025/2026 Exam)

The exam emphasizes:

- Unity Catalog (current architecture)
- Lakeflow (new name for DLT)
- Databricks Asset Bundles (CI/CD)
- Serverless compute options
- Liquid Clustering (replacing ZORDER for new tables)

### Legacy Topics (Still Tested)

- Hive metastore concepts (for migration scenarios)
- Traditional ZORDER (for existing tables)
- Workspace-level security (comparison to UC)

### Topics Less Emphasized

- Very old runtime versions
- Deprecated APIs
- Manual file management

## Staying Current

### Official Channels

- [Databricks Release Notes](https://docs.databricks.com/release-notes/index.html)
- [Delta Lake Releases](https://github.com/delta-io/delta/releases)
- [Databricks Blog](https://www.databricks.com/blog)

### Exam Updates

- Exam guide updated: March 2025
- Exam version updated: September 2025
- Check certification page for latest version

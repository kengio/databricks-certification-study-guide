# Comparison Tables

## Batch vs Streaming Processing

| Aspect | Batch | Streaming |
|--------|-------|-----------|
| **Latency** | Minutes to hours | Seconds to minutes |
| **Data Volume** | Large, bounded datasets | Continuous, unbounded |
| **Processing** | Complete dataset at once | Incremental micro-batches |
| **Trigger** | Scheduled (cron, workflow) | Continuous or interval |
| **Use Case** | Historical analysis, ETL | Real-time dashboards, alerts |
| **Checkpointing** | Not required | Required for exactly-once |
| **Cost** | Pay for execution time | Pay for continuous compute |

## Delta Lake vs Parquet

| Feature                 | Delta Lake       | Parquet          |
| ----------------------- | ---------------- | ---------------- |
| **ACID Transactions**   | Yes              | No               |
| **Time Travel**         | Yes              | No               |
| **Schema Enforcement**  | Yes              | No               |
| **MERGE/UPDATE/DELETE** | Yes              | Requires rewrite |
| **Change Data Feed**    | Yes              | No               |
| **Audit History**       | Yes              | No               |
| **Streaming Support**   | Full             | Limited          |
| **File Compaction**     | OPTIMIZE command | Manual           |
| **Overhead**            | Transaction log  | None             |

## Managed vs External Tables

| Aspect | Managed Table | External Table |
|--------|---------------|----------------|
| **Data Location** | Controlled by Unity Catalog | User-specified path |
| **DROP TABLE** | Deletes data and metadata | Deletes metadata only |
| **Data Lifecycle** | Managed automatically | User responsibility |
| **Best For** | New data assets | Existing data lakes |
| **Permissions** | Simplified | Location credentials needed |

## Shallow Clone vs Deep Clone

| Aspect | Shallow Clone | Deep Clone |
|--------|---------------|------------|
| **Data Files** | References source files | Copies all data files |
| **Storage Cost** | Minimal | Full copy |
| **Creation Speed** | Fast | Slow (data copy) |
| **Independence** | Shares source data | Fully independent |
| **Use Case** | Testing, experiments | Backups, migrations |
| **Source Dependency** | Yes | No |

## Auto Loader Modes

| Aspect | Directory Listing | File Notification |
|--------|-------------------|-------------------|
| **Detection** | Scans directory | Cloud events |
| **Scalability** | Limited by listing | Highly scalable |
| **Cost** | API calls per scan | Event-based charges |
| **Setup** | Simple | Requires configuration |
| **Best For** | Small directories | Large-scale ingestion |

## Streaming Triggers

| Trigger | When to Use | Behavior |
|---------|-------------|----------|
| **Default** | Continuous processing | Process ASAP |
| **processingTime** | Rate limiting | Fixed intervals |
| **once** | One-time migration | Single batch, stop |
| **availableNow** | Batch-like streaming | All available, stop |
| **continuous** | Ultra-low latency | Experimental |

## Output Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| **append** | Only new rows written | Immutable data sources |
| **complete** | Entire result rewritten | Aggregations |
| **update** | Only changed rows written | Stateful with updates |

## SCD Types

| Type | History | Method | Storage |
|------|---------|--------|---------|
| **Type 1** | No | Overwrite | Same row |
| **Type 2** | Full | Insert new row | Multiple rows per key |
| **Type 3** | Limited | Add column | Previous + current value |

## Cluster Types

| Type | Purpose | Cost | Startup | Best For |
|------|---------|------|---------|----------|
| **All-Purpose** | Interactive | Higher | Minutes | Development |
| **Job Cluster** | Production jobs | Lower | Minutes | Scheduled workloads |
| **Serverless** | On-demand | Per-query | Seconds | SQL analytics |
| **Instance Pool** | Fast startup | Moderate | Seconds | Frequent restarts |

## DLT Table Types

| Type | Processing | Refresh | Use Case |
|------|------------|---------|----------|
| **Streaming Table** | Incremental | Continuous | Append-only sources |
| **Materialized View** | Full recompute | On change | Aggregations, joins |
| **View** | On-demand | Never stored | Intermediate transforms |

## Expectation Types

| Expectation | Violation Behavior | Data | Pipeline |
|-------------|-------------------|------|----------|
| **EXPECT** | Log warning | Kept | Continues |
| **EXPECT...DROP ROW** | Drop row | Removed | Continues |
| **EXPECT...FAIL UPDATE** | Fail update | Kept | Stops |

## Unity Catalog vs Hive Metastore

| Aspect | Unity Catalog | Hive Metastore |
|--------|---------------|----------------|
| **Scope** | Account-level | Workspace-level |
| **Governance** | Centralized | Per-workspace |
| **Access Control** | Fine-grained | Basic |
| **Audit Logging** | Built-in | Manual setup |
| **Data Sharing** | Delta Sharing | Not native |
| **Lineage** | Automatic | Not available |

## Optimize Write vs Auto Compact

| Feature | Optimize Write | Auto Compact |
|---------|----------------|--------------|
| **When** | During write | After write |
| **Target** | New files only | All small files |
| **Overhead** | Minimal | Additional job |
| **Configuration** | `optimizeWrite.enabled` | `autoCompact.enabled` |
| **Best For** | Streaming | Frequent small writes |

## Z-Order vs Liquid Clustering

| Feature | Z-Order | Liquid Clustering |
|---------|---------|-------------------|
| **Maintenance** | Manual OPTIMIZE | Automatic |
| **Column Limit** | ~4 practical | More flexible |
| **Incremental** | No (full rewrite) | Yes |
| **New Data** | Not clustered | Automatically clustered |
| **Maturity** | GA, older | GA, newer |
| **Recommendation** | Existing tables | New tables |

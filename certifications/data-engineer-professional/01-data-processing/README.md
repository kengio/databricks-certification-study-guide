# Data Processing (30% of Exam)

This is the **highest-weighted** section of the exam. Master these topics thoroughly.

## Topics Overview

```mermaid
flowchart TD
    DP[Data Processing] --> Batch[Batch ETL]
    DP --> Inc[Incremental Processing]
    DP --> Stream[Structured Streaming]
    DP --> AL[Auto Loader]
    DP --> CDC[Change Data Capture]
    DP --> DL[Delta Lake Operations]
    DP --> Dedup[Data Deduplication]
```

## Section Contents

| File | Topic | Priority |
|------|-------|----------|
| [01-batch-etl-pipelines.md](01-batch-etl-pipelines.md) | ETL design patterns, DataFrame transformations | High |
| [02-incremental-processing.md](02-incremental-processing.md) | Incremental loads, checkpoint management | High |
| [03-structured-streaming.md](03-structured-streaming.md) | Streaming fundamentals, triggers, output modes | High |
| [04-auto-loader.md](04-auto-loader.md) | Schema inference, evolution, file notification | High |
| [05-change-data-capture.md](05-change-data-capture.md) | Delta CDF, CDC patterns with DLT | High |
| [06-delta-lake-operations.md](06-delta-lake-operations.md) | MERGE, OPTIMIZE, VACUUM, ZORDER, time travel | High |
| [07-data-deduplication.md](07-data-deduplication.md) | Deduplication strategies, idempotent writes | Medium |

## Key Concepts to Master

### Batch vs Streaming Processing

| Aspect | Batch | Streaming |
|--------|-------|-----------|
| Latency | Minutes to hours | Seconds to minutes |
| Data Volume | Large, bounded | Continuous, unbounded |
| Processing | Complete dataset | Incremental micro-batches |
| Use Case | Historical analysis | Real-time dashboards |

### Delta Lake Operations Comparison

| Operation | Purpose | When to Use |
|-----------|---------|-------------|
| `MERGE` | Upsert data | CDC, SCD patterns |
| `OPTIMIZE` | Compact small files | After many small writes |
| `VACUUM` | Remove old files | Free up storage |
| `ZORDER` | Co-locate data | Improve query filters |

### Streaming Triggers

| Trigger | Behavior |
|---------|----------|
| `processingTime` | Fixed interval batches |
| `availableNow` | Process all available, then stop |
| `once` | Single batch, then stop |
| `continuous` | Low-latency (experimental) |

## Exam Tips

1. **Know the difference** between `trigger(once=True)` and `trigger(availableNow=True)`
2. **Understand watermarking** for late data handling in streaming
3. **MERGE conditions** - know when `MATCHED` vs `NOT MATCHED` applies
4. **VACUUM retention** - default is 7 days (168 hours), never go below
5. **Auto Loader modes** - directory listing vs file notification

## Practice Focus Areas

- [ ] Write MERGE statements for CDC scenarios
- [ ] Configure Auto Loader with schema evolution
- [ ] Set up streaming with watermarks and windows
- [ ] Optimize Delta tables with ZORDER
- [ ] Handle deduplication in both batch and streaming

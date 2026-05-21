---
title: Online Monitoring
type: study-material
tags:
  - genai-engineer-associate
  - monitoring
  - inference-tables
  - drift
status: published
---

# Online Monitoring

## Overview

Offline evaluation tells you whether the app *would* work on a frozen dataset. **Online monitoring** tells you whether it *is* working in production — minute by minute, request by request. On Databricks, online monitoring is built on top of **Inference Tables** (auto-captured request/response Delta tables), **system tables** (usage, latency, cost), **Lakeflow Jobs alerts** (drift / failure notifications), and **MLflow LLM-as-judge** runs against captured production samples.

> [!abstract]
>
> - **Inference Tables** are the raw data — every prompt and every response auto-captured to a UC Delta table
> - **Latency / cost dashboards** built on top of Inference Tables + `system.serving.endpoint_usage`
> - **Drift detection** — monitor the input distribution (prompt topic, length, language) and the output distribution (refusal rate, length, faithfulness score)
> - **LLM-as-judge backtests** — periodically replay a sample of captured production requests through an evaluator chain
> - **Alerting** — DBSQL alerts + Lakeflow Jobs notifications on threshold breaches

> [!tip] What the Exam Tests
>
> - That online monitoring builds on Inference Tables, not custom application logging
> - The metric categories you should always monitor: latency (P50/P95/P99), cost (tokens/request), refusal/error rate, quality drift (LLM-as-judge), input-distribution drift
> - That alerts are configured via DBSQL alerts (on metrics computed from Inference Tables) or Lakeflow Jobs notifications
> - The difference between offline evaluation (frozen dataset) and online monitoring (live traffic sample)

---

## What to monitor

| Category | Metric | Why |
| :--- | :--- | :--- |
| **Latency** | P50 / P95 / P99 end-to-end latency | Slow tail kills UX; P99 is the canary |
| **Cost** | Tokens per request, $ per request, per app/user | Catches runaway prompts and accidental loops |
| **Reliability** | Error rate, refusal rate, timeout rate | Spikes signal upstream model issues or prompt regressions |
| **Quality (LLM-as-judge)** | Faithfulness, answer relevance, safety score over a sample | Catches quality drift even when latency/cost look fine |
| **Input drift** | Prompt length distribution, topic distribution, language mix | New use cases or new attacks shift this |
| **Output drift** | Response length, refusal patterns, sentiment | Often the first signal that the underlying model changed |

## A simple monitoring SQL query

```sql
-- Latency + cost roll-up by hour for the past 7 days
-- Schema: Model Serving inference-table layout (Gateway-unified schema uses request_time + a different layout)
SELECT
  date_trunc('hour', timestamp_ms / 1000) AS hour,
  COUNT(*)                                  AS requests,
  AVG(execution_duration_ms)                AS avg_latency_ms,
  PERCENTILE(execution_duration_ms, 0.95)   AS p95_latency_ms,
  AVG(response:usage.total_tokens::INT)     AS avg_tokens,
  SUM(response:usage.total_tokens::INT)     AS total_tokens
FROM main.serving_logs.customer_support_rag_inference
WHERE timestamp_ms >= unix_millis(current_timestamp - INTERVAL 7 DAYS)
GROUP BY 1
ORDER BY 1 DESC;
```

Wrap this in a **materialised view** that refreshes every 5 minutes, and point a DBSQL alert at the latest row to trigger when P95 > target.

## LLM-as-judge backtest

```python
import mlflow
from databricks import sql

# Sample 500 recent production requests
with sql.connect(server_hostname=..., http_path=...) as conn:
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT request:messages AS messages, response:choices AS response
            FROM main.serving_logs.customer_support_rag_inference
            WHERE timestamp_ms >= unix_millis(current_timestamp - INTERVAL 1 DAY)
            TABLESAMPLE (500 ROWS)
        """)
        df = cursor.fetchall_arrow().to_pandas()

# Replay through an evaluator chain that judges faithfulness + relevance
with mlflow.start_run(run_name="prod_backtest_daily"):
    results = mlflow.evaluate(
        model=judge_chain,
        data=df,
        model_type="text",
        evaluators=["llm_as_judge"],
        evaluator_config={"metrics": ["faithfulness", "relevance"]},
    )
```

Run this on a schedule (daily); alert if the rolling average drops below a threshold.

## Alerting patterns

- **DBSQL alert** on a query that computes a metric from Inference Tables — fires when a threshold is crossed
- **Lakeflow Jobs notifications** on the backtest job — fires on job failure or on a custom-thresholded task result
- **System-table-based alerts** on cost (`system.serving.endpoint_usage`) — fires when daily spend exceeds budget

## Use Cases

- **Catch quality regression after model swap** — LLM-as-judge backtest reveals faithfulness dropped after switching providers via Gateway traffic split
- **Detect runaway cost from a prompt-injection attack** — sudden spike in tokens-per-request alerts the team within minutes
- **Surface a new use case** — input drift dashboard shows users now asking about a topic the app wasn't designed for
- **Capacity planning** — usage trend on `system.serving.endpoint_usage` informs when to bump provisioned throughput

## Common Issues & Errors

- **Inference Tables disabled on the endpoint** — no audit data; turn on via the Gateway endpoint config
- **Schema differences** — Model Serving inference tables (legacy) use `timestamp_ms` + `databricks_request_id`; Gateway-wrapped endpoints use `request_time` + a different layout. Pick one and stick with it
- **Backtest runs against stale samples** — sample only the most recent N hours / days, otherwise you're judging old behaviour
- **Alert fatigue** — too many alerts → no one watches. Start with P99 latency + cost + error rate; add quality alerts after you have the baseline

## Exam Tips

> [!tip]
>
> - **Inference Tables are the foundation** of online monitoring. They are the same Delta tables used for governance audit (Layer 5 of governance).
> - Always monitor **latency + cost + error rate** at minimum. Quality (LLM-as-judge) comes second.
> - **Online drift** = production input distribution diverges from your eval set. **Online quality regression** = LLM-as-judge metrics drop on a recent sample.
> - Alerts fire from **DBSQL** or **Lakeflow Jobs**, not from Mosaic AI itself.

## Key Takeaways

- Online monitoring builds on Inference Tables + system tables + DBSQL alerts + Lakeflow Jobs notifications
- Monitor 6 categories: latency, cost, reliability, quality, input drift, output drift
- LLM-as-judge backtests against captured production samples catch quality regression
- Don't enable monitoring without an Inference Table; without the table, you're flying blind

## Related Topics

- [Evaluation (offline)](./01-evaluation-llm-apps.md)
- [Governance — Inference Tables as audit-of-record](../06-governance/01-governance-overview.md#layer-5--inference-tables)
- [Unity AI Gateway Endpoint Setup](../02-assembling-and-deploying-apps/04-ai-gateway-endpoint-setup.md)
- [Mosaic AI Model Serving](../02-assembling-and-deploying-apps/01-mosaic-ai-and-foundation-models.md)

## Official Documentation

- [Inference Tables](https://docs.databricks.com/en/machine-learning/model-serving/inference-tables.html)
- [MLflow LLM evaluation](https://mlflow.org/docs/latest/llms/llm-evaluate/index.html)
- [Databricks SQL alerts](https://docs.databricks.com/en/sql/user/alerts/index.html)
- [Lakeflow Jobs notifications](https://docs.databricks.com/en/jobs/notifications.html)

---

**[← Previous: Evaluation of LLM Apps](./01-evaluation-llm-apps.md) | [↑ Back to Evaluation and Monitoring](./README.md)**

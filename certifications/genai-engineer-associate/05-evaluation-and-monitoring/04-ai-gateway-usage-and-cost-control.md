---
title: "AI Gateway: Usage Tracking and Cost Control"
type: study-material
tags:
  - genai-engineer-associate
  - evaluation-and-monitoring
  - ai-gateway
  - unity-gateway
  - inference-tables
  - usage-tracking
  - rate-limits
  - cost-control
status: published
---

# AI Gateway: Usage Tracking and Cost Control

## Overview

The 2026 exam guide places AI Gateway in the **Evaluation and Monitoring** domain: *"Use AI Gateway (Inference Tables, Usage Tables, and rate limiting) to track an LLM or agent deployed via Agent Framework"* and *"Use Databricks features to control LLM costs."* AI Gateway is the governance layer in front of serving endpoints. It logs every request and response to **inference tables**, records tokens and requesters in **usage system tables**, and enforces **rate limits** — the three tools you use to see what a live LLM or agent is doing and what it costs.

> [!abstract]
>
> - **Inference tables (payload logging)** — request and response JSON for every call, in a Unity Catalog Delta table (`<catalog>.<schema>.<prefix>_payload`)
> - **Usage tables** — `system.serving.endpoint_usage` (+ `system.serving.served_entities`) for serving endpoints; `system.ai_gateway.usage` for the newer Unity Gateway
> - **Rate limits** — queries per minute (QPM) or tokens per minute (TPM) for the endpoint, each user, groups, or service principals; exceeded requests get HTTP 429
> - **Cost controls** — rate limits, budgets, the right pricing mode (pay-per-token vs provisioned throughput), scale-to-zero, smaller models, and batch `ai_query()`

> [!tip] What the Exam Tests
>
> - Which gateway feature answers which question: *what was asked and answered?* (inference tables), *who used how many tokens?* (usage tables), *how do we stop one consumer overspending?* (rate limits)
> - Configuring payload logging, usage tracking, and rate limits on an endpoint
> - Choosing cost levers for a scenario (spiky vs steady traffic, batch vs real-time, per-user caps)
> - Joining usage and payload data for cost attribution

---

> [!note] Platform update (Oct 2026)
> What the exam calls **AI Gateway** is now documented as **AI Gateway (legacy) for serving endpoints**. Its successor, **Unity Gateway**, is generally available and governs model services, external model providers, and MCP services as Unity Catalog securables ([Governance for model serving endpoints (legacy)](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints), [AI governance with Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/)). The tables differ: **Unity Gateway endpoints log usage to `system.ai_gateway.usage`, legacy serving endpoints to `system.serving.endpoint_usage`** ([Unity Gateway observability](https://docs.databricks.com/aws/en/ai-gateway/observability)). **Budgets**, including per-user budgets for Unity Gateway, became generally available on 2026-07-06 ([July 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/july)). The concepts the exam tests — inference tables, usage tables, rate limiting — exist in both.

## Features at a glance

| Feature | Answers | Paid? |
| :--- | :--- | :---: |
| **Payload logging** (inference tables) | What exactly was sent and returned? Which requests failed? | Yes |
| **Usage tracking** (system tables) | Who called which endpoint, with how many tokens, when? | Yes |
| **Permission and rate limiting** | Who may call, and how much? | No |
| **AI Guardrails** (Public Preview) | Block unsafe content and detect PII in requests and responses | — |
| **Traffic splitting** | Route percentages of traffic across served models | No |
| **Fallbacks** | Retry on another served model after 429 or 5xx (external models) | No |

Paid vs free per the [legacy overview](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints): inference tables and usage tracking are paid; query permissions, rate limiting, fallbacks, and traffic splitting are free.

### Support depends on the endpoint type

| Feature | External model | FMAPI pay-per-token | FMAPI provisioned throughput | Databricks agents | Custom model |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Permission and rate limiting | ✓ | ✓ | ✓ | — | ✓ |
| Payload logging | ✓ | ✓ | ✓ | ✓ | ✓ |
| Usage tracking | ✓ | ✓ | ✓ | — | ✓ |
| AI Guardrails | ✓ | ✓ | ✓ | — | — |
| Fallbacks | ✓ | — | — | — | — |
| Traffic splitting | ✓ | — | ✓ | — | ✓ |

> [!important]
> For an **agent** deployed with the Agent Framework, payload logging to inference tables is always available (`agents.deploy()` enables it), and the agent's own traces go to MLflow. Usage tracking and rate limits apply to the **LLM endpoints the agent calls** (Foundation Model APIs or external models), which is where tokens are consumed. TPM limits cannot be applied to endpoints serving custom models or agents. Source: [legacy feature matrix](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints) and [configuration page](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints).

## Configuring the gateway on an endpoint

Configure in the **AI Gateway** section of the serving endpoint UI, or with `PUT /api/2.0/serving-endpoints/{name}/ai-gateway` ([REST reference](https://docs.databricks.com/api/workspace/servingendpoints/putaigateway)):

```json
{
  "usage_tracking_config": { "enabled": true },
  "inference_table_config": {
    "enabled": true,
    "catalog_name": "main",
    "schema_name": "serving_logs",
    "table_name_prefix": "support_llm"
  },
  "rate_limits": [
    { "key": "endpoint", "calls": 600, "renewal_period": "minute" },
    { "key": "user", "calls": 30, "renewal_period": "minute" },
    { "key": "user_group", "principal": "data-science", "tokens": 200000, "renewal_period": "minute" }
  ]
}
```

| Rate-limit field | Values |
| :--- | :--- |
| `key` | `endpoint` (global maximum), `user` (default per-user), `user_group`, `service_principal` |
| `calls` / `tokens` | QPM and / or TPM; if both are set, the more restrictive applies |
| `principal` | The user email, group name, or service principal ID for custom limits |
| `renewal_period` | `minute` (the only supported value) |

Rate-limit rules: the endpoint limit is a global cap; custom limits override the default per-user limit; a user-specific limit beats a group limit; up to **20** rate limits and **5** group limits per endpoint; no limits exist by default.

## Inference tables: tracking what a live endpoint does

Enabling payload logging creates `<catalog>.<schema>.<prefix>_payload` (a view over a `_otel_logs` telemetry table). Rows arrive within about an hour; payloads larger than 1 MiB are not logged; streaming responses are aggregated ([inference tables for serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/inference-tables-serving-endpoints)).

| Column | Use |
| :--- | :--- |
| `request_time`, `request_date` | Time-series monitoring and partition pruning |
| `databricks_request_id`, `client_request_id` | Join to usage tables and to your own logs |
| `status_code` | Error-rate monitoring |
| `execution_duration_ms` | Model latency (excludes network overhead) |
| `request`, `response` | Raw JSON — prompts, answers, token usage, retrieved context |
| `requester` | Which user or service principal called |
| `sampling_fraction` | Down-sampling factor, if any |

```sql
-- Error rate and model latency per hour, last 7 days
SELECT
  date_trunc('hour', request_time)                AS hour,
  COUNT(*)                                        AS requests,
  AVG(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS error_rate,
  PERCENTILE(execution_duration_ms, 0.95)         AS p95_ms
FROM main.serving_logs.support_llm_payload
WHERE request_date >= current_date() - INTERVAL 7 DAYS
GROUP BY 1
ORDER BY 1 DESC;
```

Agents deployed with `agents.deploy()` also get `<model>_payload_request_logs` (formatted requests, responses, and MLflow traces) and `<model>_payload_assessment_logs` (Review App feedback); Databricks marks request and assessment logs as deprecated in favour of MLflow 3 tracing and `mlflow.log_feedback()`.

## Usage tables: who used what

```sql
-- Tokens per requester and endpoint, last 30 days (legacy serving endpoints)
SELECT
  se.endpoint_name,
  eu.requester,
  SUM(eu.input_token_count)  AS input_tokens,
  SUM(eu.output_token_count) AS output_tokens,
  COUNT(*)                   AS requests
FROM system.serving.endpoint_usage AS eu
JOIN system.serving.served_entities AS se
  ON eu.served_entity_id = se.served_entity_id
WHERE eu.request_time >= current_date() - INTERVAL 30 DAYS
GROUP BY 1, 2
ORDER BY output_tokens DESC;
```

- `endpoint_usage` records token and character counts, status code, requester, streaming flag, and a `usage_context` map per request; `served_entities` holds endpoint and model metadata
- Only **account admins** can query these tables by default
- Add identifiers such as `end_user_to_charge` to `usage_context` in the request to attribute cost to end users or applications
- For Unity Gateway services, query `system.ai_gateway.usage`, use the built-in usage dashboard, and join `system.billing.usage` with `system.billing.list_prices` to estimate spend ([Track model usage](https://docs.databricks.com/aws/en/ai-gateway/usage-tracking))

## Controlling LLM costs

Exam guide bullet: *"Use Databricks features to control LLM costs."*

| Lever | How it saves money |
| :--- | :--- |
| **Rate limits** (QPM / TPM) | Caps runaway consumers, loops, and abuse; per-user fairness |
| **Budgets** | Spending thresholds with alerts; for Unity Gateway, per-user thresholds and usage blocking |
| **Usage tracking + `usage_context` / tags** | Shows which team, app, or user drives spend so you can act |
| **Pay-per-token** | No idle cost — best for low or spiky traffic and prototypes |
| **Provisioned throughput** | Reserved capacity — cheaper per token at steady high volume, predictable latency |
| **Scale-to-zero** (custom models / agents) | No cost when idle, at the price of cold-start latency |
| **Smaller or task-specific models** | Fewer dollars per token; AI Functions such as `ai_classify` for narrow tasks |
| **Batch with `ai_query()`** | Offline workloads run as jobs instead of an always-on endpoint |
| **Prompt and context hygiene** | Shorter prompts, fewer retrieved chunks, `max_tokens` caps |
| **Serverless usage / budget policies** | Tag serverless spend (Agent Bricks requires a policy with a nonzero budget) for attribution |

## Traffic splitting and fallbacks

Served-entity percentages must add up to 100 %. Use traffic splitting for **canary releases** (for example 10 % to a candidate model) and compare quality in inference tables before ramping. A model with 0 % traffic can serve as a fallback-only entity. **Fallbacks** retry the request on the next served entity after a 429 or 5xx, and are supported on **external model** endpoints. The first successful (or last failed) attempt is what gets logged to the usage and payload tables.

## Use Cases

- **Per-team caps** — a `user_group` TPM limit keeps one data-science team from consuming the shared endpoint's capacity
- **Chargeback** — usage tables joined with `served_entities`, grouped by `usage_context` application ID, feed a monthly cost report
- **Incident review** — the inference table shows the exact prompts that produced a bad answer, with `requester` and timestamp
- **Spiky prototype → steady production** — move from pay-per-token to provisioned throughput once traffic becomes predictable

## Common Issues & Errors

### HTTP 429 Too Many Requests

**Scenario:** Clients receive 429 responses during peak hours.
**Fix:** A rate limit was reached (endpoint, user, or group). Raise or restructure limits, and implement client retries with exponential backoff.

### Inference Table Is Empty

**Scenario:** Payload logging was enabled but the table has no rows.
**Fix:** Rows can take up to an hour to appear; payloads over 1 MiB are skipped; the configuring identity needs `USE CATALOG`, `USE SCHEMA`, and `CREATE TABLE`. Do not rename, delete, or change the schema of the table — logging can stop.

### Usage Table Access Denied

**Scenario:** The endpoint owner enabled usage tracking but cannot query `system.serving.endpoint_usage`.
**Fix:** Only account admins can read the table by default; ask an admin to grant access to the system tables or share a dashboard.

## Exam Tips

> [!tip] Exam Tips
>
> - **Inference tables** = request/response content. **Usage tables** = tokens, requester, counts. **Rate limits** = QPM/TPM caps (429 when exceeded).
> - Rate-limit keys: `endpoint`, `user`, `user_group`, `service_principal`; user-specific beats group; endpoint limit is a global cap.
> - Cost levers: rate limits, budgets, pay-per-token vs provisioned throughput, scale-to-zero, smaller models, batch `ai_query()`.
> - Real-world mapping: legacy serving endpoints → `system.serving.endpoint_usage`; Unity Gateway → `system.ai_gateway.usage`.

## Key Takeaways

- AI Gateway adds payload logging, usage tracking, rate limits, guardrails, traffic splitting, and fallbacks to serving endpoints
- Inference tables hold the raw request and response for monitoring, debugging, and evaluation backtests
- Usage system tables attribute tokens and cost to requesters, endpoints, and applications
- Rate limits and budgets cap spend; pricing mode, model size, scale-to-zero, and batch inference reduce it
- Unity Gateway is the GA successor with its own usage table, budgets, and policies

## Related Topics

- [Online Monitoring](./02-online-monitoring.md)
- [MLflow Scorers, Judges, SME Feedback, and Agent Monitoring](./03-mlflow-scorers-judges-and-feedback.md)
- [Mosaic AI & Foundation Models](../02-assembling-and-deploying-apps/01-mosaic-ai-and-foundation-models.md)
- [Governance Overview](../06-governance/01-governance-overview.md)

## Official Documentation

- [Governance for model serving endpoints (legacy)](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints)
- [Configure governance on model serving endpoints (legacy)](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints)
- [Inference tables for serving endpoints (legacy)](https://docs.databricks.com/aws/en/ai-gateway/inference-tables-serving-endpoints)
- [AI governance with Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/)
- [Unity Gateway rate limits](https://docs.databricks.com/aws/en/ai-gateway/rate-limits)
- [Manage budgets for Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/budgets)

---

**[← Previous: MLflow Scorers, Judges, SME Feedback, and Agent Monitoring](./03-mlflow-scorers-judges-and-feedback.md) | [↑ Back to Evaluation and Monitoring](./README.md)**

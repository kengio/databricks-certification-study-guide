---
title: Unity AI Gateway Endpoint Setup
type: study-material
tags:
  - genai-engineer-associate
  - unity-ai-gateway
  - model-serving
  - guardrails
status: published
---

# Unity AI Gateway Endpoint Setup

## Overview

**Unity AI Gateway** is Databricks' central AI governance layer for served LLM endpoints, agents, and MCP servers. It wraps any Model Serving endpoint with policies for **rate limits**, **traffic splitting**, **payload logging** (into Inference Tables), **usage tracking** (into system tables), and **guardrails** (where supported by the underlying model). This page covers how to configure each policy on a Model Serving endpoint.

> [!abstract]
>
> - Gateway policies are configured **per endpoint** via the workspace UI, REST API, or `databricks` CLI
> - **Rate limits** — tokens/sec or requests/sec, per user or per app
> - **Traffic splitting** — weighted routing across multiple model backends behind one endpoint
> - **Payload logging** — auto-capture into Inference Tables (UC Delta table)
> - **Usage tracking** — surfaces into `system.serving.endpoint_usage`
> - **Guardrails** — content-safety / PII filtering for endpoints that support it (depends on the model)

> [!tip] What the Exam Tests
>
> - That Gateway policies live on the *endpoint*, not in the model code
> - The five officially documented policy categories (rate limit, traffic splitting, payload logging, usage tracking, guardrails)
> - That payload logging is the bridge to Inference Tables — they're the same audit trail, configured at the Gateway layer
> - How to set up A/B traffic splitting between two model versions or two providers
> - That guardrails availability depends on the model — not every Gateway endpoint has PII detection

---

## Configuring policies

### Rate limits

```python
from databricks.sdk import WorkspaceClient
w = WorkspaceClient()

w.serving_endpoints.update_ai_gateway(
    name="customer-support-rag",
    rate_limits=[{
        "calls": 60,
        "renewal_period": "minute",
        "key": "user",  # per user; alternatives: "endpoint" (global)
    }],
)
```

Use per-user rate limits to prevent one consumer from starving others; use endpoint-wide limits to cap total cost.

### Traffic splitting

```python
w.serving_endpoints.update_config(
    name="customer-support-rag",
    served_entities=[
        {"entity_name": "main.genai.rag_v3", "entity_version": "1", "name": "candidate"},
        {"entity_name": "main.genai.rag_v2", "entity_version": "5", "name": "stable"},
    ],
    traffic_config={
        "routes": [
            {"served_model_name": "candidate", "traffic_percentage": 10},
            {"served_model_name": "stable",    "traffic_percentage": 90},
        ],
    },
)
```

This is the canonical **A/B test** pattern: send 10 % of traffic to the new version, measure quality via Inference Tables, ramp up.

### Payload logging → Inference Tables

```python
w.serving_endpoints.update_ai_gateway(
    name="customer-support-rag",
    inference_table_config={
        "enabled": True,
        "catalog_name": "main",
        "schema_name": "serving_logs",
        "table_name_prefix": "customer_support_rag_inference",
    },
)
```

After enabling, every request/response lands in `main.serving_logs.customer_support_rag_inference_payload` (the exact suffix depends on Gateway version). Use this for monitoring, evaluation backtests, and compliance audits.

### Usage tracking

Usage is automatic when the endpoint is wrapped by the Gateway — query `system.serving.endpoint_usage` for token counts, request counts, and latency percentiles. No additional configuration required.

### Guardrails (where supported)

```python
w.serving_endpoints.update_ai_gateway(
    name="customer-support-rag",
    guardrails={
        "input": {"safety": {"valid_topics": ["customer support", "billing"]}},
        "output": {"safety": True},
    },
)
```

Guardrails are model-dependent. Foundation Model APIs (Llama, Claude, GPT-class) generally support safety classifiers; custom models or smaller open models may not. Check the per-model docs.

## Use Cases

- **Per-team budget caps** — rate-limit each team's app to a known tokens/minute budget
- **Canary deploys** — traffic-split 5–10 % to a candidate version, watch quality metrics in Inference Tables before ramping
- **Compliance audit trail** — Inference Tables + system tables = queryable record of every served prompt and its cost
- **Multi-provider hedging** — same endpoint splits across two LLM providers; failover happens at the Gateway

## Common Issues & Errors

- **Inference Tables not appearing** — payload logging takes a few minutes to propagate after enabling; also, the UC schema must exist and the workspace's serverless compute identity must have `USE SCHEMA` + `MODIFY` on it
- **Traffic-split totals must equal 100 %** — anything else returns a config validation error
- **Guardrails request rejected by upstream model** — if the model doesn't support the Gateway-configured guardrail, the request fails at the Gateway boundary; check Inference Tables for `error` field
- **Rate-limit identity confusion** — `key="user"` uses the *caller's* identity; for service-principal-driven workloads, that may be the SP not the human user

## Exam Tips

> [!tip]
>
> - Five policy categories: **rate limit, traffic splitting, payload logging, usage tracking, guardrails**. Memorise the list.
> - Payload logging *is* the bridge to Inference Tables. Same Delta table, configured at the Gateway.
> - Traffic splitting weights must sum to **100 %**.
> - Guardrails are **model-dependent** — Gateway exposes the policy surface but the backing model has to support it.
> - For per-user fairness, key rate limits on `user`; for total-cost caps, key on `endpoint`.

## Key Takeaways

- Unity AI Gateway sits in front of Model Serving endpoints and configures 5 policy categories
- Configured per endpoint via UI / REST API / SDK / CLI
- Payload logging → Inference Tables (UC Delta) is the audit-of-record
- Traffic splitting enables canary deploys and A/B tests behind one endpoint
- Guardrails are best-effort and depend on the model

## Related Topics

- [Compound AI Apps](./03-compound-ai-apps.md)
- [MLflow for GenAI](./02-mlflow-for-genai.md)
- [Online Monitoring](../05-evaluation-and-monitoring/02-online-monitoring.md)
- [Governance — Unity AI Gateway as Layer 4](../06-governance/01-governance-overview.md#layer-4--unity-ai-gateway)

## Official Documentation

- [Unity AI Gateway overview](https://docs.databricks.com/aws/en/ai-gateway/)
- [Configure guardrails](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-guardrails)
- [Rate limits](https://docs.databricks.com/aws/en/ai-gateway/external-models/rate-limits)
- [Inference Tables](https://docs.databricks.com/en/machine-learning/model-serving/inference-tables.html)

---

**[← Previous: Compound AI Apps](./03-compound-ai-apps.md) | [↑ Back to Assembling and Deploying Apps](./README.md)**

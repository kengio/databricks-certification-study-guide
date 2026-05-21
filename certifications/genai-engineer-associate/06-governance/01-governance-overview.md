---
title: Governance Overview
type: study-material
tags:
  - genai-engineer-associate
  - governance
  - unity-catalog
  - content-safety
status: published
---

# Governance Overview

## Overview

The March 2026 blueprint elevates governance to a first-class 8 % domain. In Databricks, GenAI governance lives at four layers: **Unity Catalog** governs the *assets* (embeddings, models, prompts, agents, vector indexes), **PII handling** governs the *data flowing through* the pipeline, **content safety** governs the *prompts and generations*, and **AI Gateway** governs the *endpoints* themselves. Inference Tables provide the audit trail underneath all four.

> [!abstract]
>
> - **UC AI assets** — embeddings tables, vector indexes, registered models, prompt templates, agents — all UC-securable with `GRANT/REVOKE`
> - **PII handling** — strip / hash / mask before embedding; tag PII columns with UC tags; use column masks for retrieval-time enforcement
> - **Content safety** — input / output classifiers detect unsafe prompts and unsafe outputs
> - **AI Gateway** — per-endpoint policies for rate limit, content filtering, prompt-injection detection
> - **Inference Tables** — auto-captured Delta tables of every request/response on a Model Serving endpoint

> [!tip] What the Exam Tests
>
> - Which UC objects are governable (embeddings tables, vector indexes, registered models — yes; in-memory prompts — no)
> - Why PII must be handled before embedding, not after retrieval
> - Which guardrails sit in AI Gateway vs in the model itself
> - That Inference Tables are the audit-of-record for served endpoints

---

## Layer 1 — Unity Catalog for AI assets

Every persistent AI artifact in Databricks is a UC securable:

| Asset | UC object type | Governs |
| :--- | :--- | :--- |
| **Embeddings** | Table (Delta) | Who can read the vector column |
| **Vector Index** | Vector index (special UC object) | Who can query the index |
| **Registered model** | Model in UC | Who can load / serve / version |
| **Prompt template** | Function or table | Who can fetch the prompt |
| **Agent** | Model in UC (compound) | Who can invoke |

GRANT/REVOKE works exactly as for tables. Row filters and column masks apply to embedding tables — so PII filtering can happen at the table layer.

## Layer 2 — PII handling

**Strip / hash / mask BEFORE embedding.** Embeddings are dense numeric vectors but they preserve enough information that you can sometimes reconstruct sensitive content from them. Once a name or SSN is embedded, it lives in the index. Sanitise at chunk time:

```python
import re

def redact(text: str) -> str:
    text = re.sub(r"\d{3}-\d{2}-\d{4}", "[SSN]", text)   # SSN
    text = re.sub(r"[\w\.-]+@[\w\.-]+", "[EMAIL]", text) # email
    return text

chunks = [redact(c) for c in raw_chunks]
embeddings = fmapi.embed(chunks)
```

Use UC **tags** (e.g., `pii=true`) on source-table columns so downstream pipelines can detect and route them through redaction.

## Layer 3 — Content safety

Two-sided:

- **Input classifier** — refuses unsafe prompts (jailbreaks, harmful intent) before they hit the model
- **Output classifier** — filters unsafe generations (toxicity, leaked secrets, prompt-injection-induced unsafe outputs)

Databricks-provided classifiers integrate with Model Serving; you can also bring your own.

## Layer 4 — AI Gateway

Per-endpoint policies that wrap any served LLM:

| Policy | What it does |
| :--- | :--- |
| **Rate limit** | Tokens/sec or requests/sec per user / app |
| **PII detection** | Block requests containing detected PII |
| **Content filtering** | Apply safety classifiers (input and output) |
| **Logging** | Force every request/response into Inference Tables |
| **Multi-provider routing** | Same endpoint, multiple backends (Llama / Claude / GPT) with weighted routing |

## Layer 5 — Inference Tables

Every Model Serving endpoint can be configured to capture request and response data into a Delta table in UC:

```sql
SELECT
  timestamp,
  request_payload :> 'prompt' AS prompt,
  response_payload :> 'choices[0].message.content' AS answer,
  latency_ms
FROM main.serving_logs.my_genai_app_inference
WHERE date >= current_date - INTERVAL 7 DAYS
ORDER BY timestamp DESC;
```

This is the audit-of-record. It feeds drift monitoring, retrospective evaluation, and compliance reporting.

## Use Cases

- **Compliance audit** — "show me every prompt this app received last quarter that mentioned competitor X"
- **PII exposure check** — query Inference Tables for any output containing unredacted PII patterns
- **Drift monitoring** — measure how the distribution of input topics has shifted vs the training distribution of your evaluation set
- **Cost attribution** — Inference Tables + system tables let you attribute LLM cost to users / apps / endpoints

## Common Issues & Errors

- **Embedding PII without redaction** — the vector index now contains reconstructible PII; redact at chunk time, not retrieval time
- **Forgetting to enable Inference Tables on a new endpoint** — no audit trail = no compliance story
- **Confusing AI Gateway content filtering with model-side safety** — gateway is the outer perimeter; the model may still generate unsafe content on its own. Use both
- **GRANT on the embedding table but not the vector index** — users can read raw embeddings but can't query the index, or vice versa

## Exam Tips

> [!tip]
>
> - **UC governs AI assets** the same way it governs tables — GRANT/REVOKE/row filters/column masks all apply.
> - **PII must be handled before embedding.** Once embedded, it lives in the index.
> - **AI Gateway = perimeter** policies (rate limit, content filter, routing). Model-side safety = the model's own refusal behaviour.
> - **Inference Tables are the audit-of-record** for served endpoints.

## Key Takeaways

- Governance has 5 layers: UC assets, PII handling, content safety, AI Gateway, Inference Tables
- All persistent AI artifacts are UC-securable
- PII redaction happens at chunk / embed time, not at retrieval
- Inference Tables capture every served request/response — enable on every prod endpoint
- AI Gateway wraps the endpoint with rate limit + content filtering + logging policies

## Related Topics

- [Mosaic AI and Foundation Models](../02-assembling-and-deploying-apps/01-mosaic-ai-and-foundation-models.md)
- [MLflow for GenAI](../02-assembling-and-deploying-apps/02-mlflow-for-genai.md)
- [Evaluation and Monitoring](../05-evaluation-and-monitoring/README.md)

## Official Documentation

- [Unity Catalog for ML and AI](https://docs.databricks.com/en/data-governance/unity-catalog/index.html)
- [Mosaic AI Gateway](https://docs.databricks.com/en/ai-gateway/index.html)
- [Inference Tables](https://docs.databricks.com/en/machine-learning/model-serving/inference-tables.html)
- [Model Serving guardrails](https://docs.databricks.com/en/ai-gateway/configure-guardrails.html)

---

**[↑ Back to Governance](./README.md)**

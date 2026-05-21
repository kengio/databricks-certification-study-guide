---
title: Final Review — GenAI Engineer Associate
type: final-review
tags:
  - genai-engineer-associate
  - final-review
  - exam-morning
status: published
---

# Final Review — GenAI Engineer Associate (20-minute exam-morning scan)

## 2-minute facts that show up *most often*

- **Compound AI app = one endpoint, not N microservices** — package retriever + re-ranker + LLM + tools inside a single `ResponsesAgent` subclass
- **MLflow `ResponsesAgent`** is the current Agent Framework path (replaces deprecated `ChatModel`); subclass + `predict()` + `databricks.agents.deploy()`
- **`databricks.agents.deploy()`** does three things at once: provisions Model Serving + enables Inference Tables + wires MLflow tracing
- **Mosaic AI Vector Search** index types: **Delta Sync Index** (auto-updates when source Delta table changes) vs **Direct Vector Access Index** (you push vectors via API)
- **Foundation Model APIs (FMAPI)** billing: **Pay-per-token** (no reservation) vs **Provisioned throughput** (reserved tokens/sec)
- **Embedding model** for new Vector Search indexes: `databricks-gte-large-en` (current default; `bge-large-en` still works)
- **Current chat client**: `databricks_openai.DatabricksOpenAI` (OpenAI-compatible API); the legacy `databricks_genai_inference` package is no longer the recommended path
- **Unity AI Gateway** policies (6): rate limits, traffic splitting, payload logging, usage tracking, guardrails, fallbacks
- **Traffic splitting is a Model Serving feature**, not a Gateway policy
- **PII must be redacted *before* embedding** — once in the vector index, it's reconstructible
- **Inference Tables** = audit-of-record; same Delta table powers monitoring (latency / cost / quality) and governance (audit / compliance)
- **Databricks Agent Evaluation**: `mlflow.evaluate(data=..., model_type="databricks-agent")` runs built-in RAG judges (groundedness, answer relevance, correctness, safety)

## 5-minute per-domain quick-fire (6 domains)

### 01 — Application Development (30 %)

- Prompt engineering: structured turns (system / user / assistant); few-shot examples
- Tool calling = LLM picks which function to invoke; foundation of agents
- Chain vs Agent: chain is a deterministic DAG; agent is an LLM-driven loop
- Hybrid search = vector + BM25; re-ranking = cheap recall pass → small cross-encoder reorders top-k

### 02 — Assembling and Deploying Apps (22 %)

- FMAPI hosted models (Llama 3.3-70B, Claude, GPT-class) — no infra to manage
- MLflow `mlflow.pyfunc.log_model(python_model=Agent(), registered_model_name=...)` then `databricks.agents.deploy(...)`
- Unity AI Gateway sits in front of Model Serving — configure rate limits / traffic splitting / payload logging via SDK
- Compound app = retriever + reranker + LLM + tools, served as **one endpoint**

### 03 — Design Applications (14 %)

- RAG = open-book exam; fine-tuning = studying. RAG wins for current/changing facts; fine-tuning wins for style/format/persona
- Naive RAG: single pass retrieve → augment → generate. Advanced RAG: query rewriting, multi-step retrieval, re-ranking, self-reflection
- Context window budget: system + retrieved chunks + history + answer share one budget
- Single-step vs agent-loop: single-step deterministic + cheap; agents flexible + harder to cost/latency-budget

### 04 — Data Preparation (14 %)

- Chunk size + overlap: small chunks → better recall, more chunks to manage; overlap preserves context across boundaries
- Semantic chunking splits on paragraphs/headings (better than fixed token counts)
- Embedding dim: match the model's recommended dimensionality; higher dim = better separation, more storage
- Delta Sync Index vs Direct Vector Access Index: sync = auto on source change; direct = push via API

### 05 — Evaluation and Monitoring (12 %)

- Offline: `mlflow.evaluate(data=..., model_type="databricks-agent")` with built-in RAG judges (groundedness, answer relevance, correctness, safety)
- Online: Inference Tables + system tables → DBSQL dashboards
- Monitor 6 categories: latency / cost / reliability / quality (LLM-as-judge) / input drift / output drift
- LLM-as-judge backtests on captured production samples — schedule daily

### 06 — Governance (8 %)

- **Five layers**: UC AI assets, PII handling, content safety, Unity AI Gateway, Inference Tables
- All persistent AI artifacts (embeddings, vector indexes, registered models, agents, prompt templates) are UC-securable
- PII redaction at chunk time, NOT at retrieval
- Mosaic AI Vector Search respects UC table permissions on the source

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Compound app = 3 chained endpoints" | Wrong — one endpoint |
| "ChatModel is the current path" | Wrong — deprecated; use `ResponsesAgent` |
| "Traffic splitting is a Gateway policy" | Wrong — it's Model Serving (`traffic_config`) |
| "Redact PII at retrieval" | Wrong — redact at embedding time |
| "`evaluators=['llm_as_judge']` is the API" | Wrong — `model_type="databricks-agent"` |
| "Faithfulness" | Databricks uses "groundedness" |
| "Vector Search query as the analytics surface" | Wrong — vector search is similarity over unstructured content, not structured analytics |

## Today's exam — 90-minute time budget

- **45 questions ÷ 90 minutes = 2 min/question**
- Long RAG-scenario stems: identify the **failure mode** the question describes (stale data → RAG vs fine-tune; missing audit trail → Inference Tables; PII leak → redact before embed) — that's the answer
- "Most-managed Databricks" wins: `agents.deploy()` over custom serving; Inference Tables over custom logging; Lakehouse Monitoring over custom drift

## Eat. Hydrate. Breathe.

You're ready. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to GenAI Engineer Associate](../README.md)**

---
title: Mock Exam 1 Debrief — Generative AI Engineer Associate
type: mock-exam-debrief
tags:
  - genai-engineer-associate
  - mock-exam
  - debrief
---

# Mock Exam 1 Debrief — Databricks Generative AI Engineer Associate

## Domain → study-resource mapping

| Domain (weight) | Topic folder | Cheat sheet / shared resource |
| :--- | :--- | :--- |
| Application Development (30 %) | [`01-application-development/`](../../01-application-development/README.md) | [`rag-vector-search-basics`](../../../../shared/fundamentals/rag-vector-search-basics.md) |
| Assembling and Deploying Apps (22 %) | [`02-assembling-and-deploying-apps/`](../../02-assembling-and-deploying-apps/README.md) | [`mlflow-quick-ref`](../../../../shared/cheat-sheets/mlflow-quick-ref.md) |
| Design Applications (14 %) | [`03-design-applications/`](../../03-design-applications/README.md) | [`rag-vector-search-basics`](../../../../shared/fundamentals/rag-vector-search-basics.md) |
| Data Preparation (14 %) | [`04-data-preparation/`](../../04-data-preparation/README.md) | [`rag-vector-search-basics`](../../../../shared/fundamentals/rag-vector-search-basics.md) |
| Evaluation and Monitoring (12 %) | [`05-evaluation-and-monitoring/`](../../05-evaluation-and-monitoring/README.md) | [`mlflow-quick-ref`](../../../../shared/cheat-sheets/mlflow-quick-ref.md) |
| Governance (8 %) | [`06-governance/`](../../06-governance/README.md) | [`unity-catalog-quick-ref`](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md) |

## Per-section question map

The GenAI mock-exam questions.md is a flat block (one question per scenario). Map missed questions to the 6-domain blueprint by the scenario subject.

| Topic in the scenario | Maps to official domain (weight) |
| :--- | :--- |
| Prompt engineering / chains / agents / retrieval at runtime | Application Development (30 %) |
| Mosaic AI FMAPI / MLflow for GenAI / Model Serving / Unity AI Gateway | Assembling and Deploying Apps (22 %) |
| RAG architecture / naive vs advanced RAG / model-selection trade-offs | Design Applications (14 %) |
| Chunking / embeddings / Vector Search index creation | Data Preparation (14 %) |
| MLflow evaluation / LLM-as-judge / Inference Tables / drift | Evaluation and Monitoring (12 %) |
| UC for AI assets / PII handling / content safety / AI Gateway policies | Governance (8 %) |
| Refresh: GOV-1, GOV-2 | Governance (8 %) |
| Refresh: AGENT-1 | Assembling and Deploying Apps (22 %) |
| Refresh: GW-1 | Assembling and Deploying Apps (22 %) — Model Serving traffic config |
| Refresh: EVAL-1 | Evaluation and Monitoring (12 %) |

## Study plan by miss count (45-question mock)

| Missed | Status | Action |
| :---: | :--- | :--- |
| **0–5** (≥ 88 %) | Excellent | Schedule the exam |
| **6–9** (80–87 %) | Likely passing | Spot-fill weakest 2 domains |
| **10–13** (72–78 %) | On the bubble | 1-2 weeks focused study |
| **14–18** (60–70 %) | Not ready | 3-4 weeks comprehensive review |
| **19+** (< 60 %) | Significant gap | Restart from RAG / Vector Search basics |

## Highest-leverage traps

- **Application Development (30 %)** is the largest block — chains, agents, retrieval-augmentation patterns, vector search at runtime
- **Compound AI app = one endpoint, not N microservices** — packaging matters
- **`ResponsesAgent` (subclass) + `agents.deploy()`** is the current MLflow + Agent Framework path; `ChatModel` is deprecated
- **Unity AI Gateway has 6 policy categories** — rate limits, traffic splitting, payload logging, usage tracking, guardrails, fallbacks
- **PII must be redacted before embedding**, not at retrieval (Governance trap)
- **Inference Tables = audit-of-record** for any served endpoint

---

**[← Back to Mock Exam](./README.md)** | **[↑ Back to Resources](../README.md)** | **[← Back to GenAI Engineer Associate](../../README.md)**

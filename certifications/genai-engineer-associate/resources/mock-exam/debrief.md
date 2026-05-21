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

**[← Back to Mock Exam](./README.md)** | **[← Back to Resources](../README.md)** | **[← Back to GenAI Engineer Associate](../../README.md)**

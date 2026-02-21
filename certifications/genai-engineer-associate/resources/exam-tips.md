---
title: GenAI Engineer Associate Exam Tips
type: exam-tips
tags: [genai-engineer-associate, exam-tips, certification]
status: published
---

# GenAI Engineer Associate Exam Tips and Strategies

Practical strategies for passing the Databricks Certified Generative AI Engineer Associate exam on your first attempt.

## Exam Format

| Detail | Value |
|---|---|
| Number of Questions | 45 |
| Duration | 90 minutes |
| Passing Score | 70% (32+ correct) |
| Language | Python only |
| Question Format | Multiple choice (single answer) |
| Delivery | Online proctored or test center |

## Domain Weights and Study Time

| Domain | Weight | Questions | Recommended Study Time |
|---|---|---|---|
| Design RAG Solutions | 30% | ~14 | 8–10 hours |
| Build RAG Solutions (Vector Search & LLM Dev) | 55% | ~25 | 12–15 hours |
| Evaluate & Govern | 15% | ~7 | 4–5 hours |

RAG Architecture and LLM Application Development together account for 55% — make these your top priority.

## Time Management

| Phase | Time | Target |
|---|---|---|
| First pass (answer all) | 60 min | ~80 sec per question |
| Review flagged questions | 20 min | Revisit uncertain answers |
| Final review | 10 min | Sanity-check skipped items |

Flag any question you are unsure about and keep moving. Do not spend more than 2 minutes on any single question during the first pass.

## Key Topics to Master

### Must Know (High Frequency)

- [ ] **RAG pipeline stages** — document loading → chunking → embedding → indexing → retrieval → augmentation → generation
- [ ] **Databricks Vector Search index types** — `Delta Sync` (auto-syncs from Delta table) vs `Direct Access` (manual upsert)
- [ ] **Embedding model selection** — text-embedding models for semantic search; same model must be used at index time and query time
- [ ] **Similarity metrics** — cosine similarity for normalized embeddings (most common), dot product for unnormalized, L2 for geometric distance
- [ ] **Foundation Model APIs** — `Pay-per-token` endpoints (served by Databricks) vs `Provisioned Throughput` (dedicated capacity, for production)
- [ ] **`mlflow.langchain.autolog()`** — automatically logs LangChain chain inputs/outputs and model metadata
- [ ] **`mlflow.evaluate()`** — evaluates LLM/RAG pipelines with built-in GenAI metrics (faithfulness, answer relevance, groundedness)
- [ ] **Chunking strategies** — fixed-size (fast, simple), recursive character (respects structure), semantic (meaning-based); chunk size vs overlap trade-off
- [ ] **Context window management** — retrieved chunks must fit within the LLM's context window; top-k controls how many chunks are passed

### Should Know (Medium Frequency)

- [ ] **Hybrid search** — combines dense (embedding) + sparse (BM25/keyword) retrieval; improves recall for exact terms
- [ ] **Reranking** — second-stage model (cross-encoder) re-scores retrieved chunks for higher precision
- [ ] **LangChain `RetrievalQA` chain** — connects a retriever + LLM into a question-answering pipeline
- [ ] **MLflow AI Gateway** — unified API layer that proxies requests to multiple LLM providers; supports rate limiting and credential management
- [ ] **Guardrails / content filtering** — Lakehouse AI safety features; input/output content filtering for production LLM apps
- [ ] **`FeatureLookup` vs vector similarity** — Feature Store for structured features; Vector Search for unstructured semantic retrieval
- [ ] **Prompt engineering patterns** — zero-shot (no examples), few-shot (examples in prompt), chain-of-thought (reasoning steps)

### Good to Know (Lower Frequency)

- [ ] **Parent-child chunking** — index small child chunks for retrieval precision, then fetch larger parent chunk for context
- [ ] **HyDE (Hypothetical Document Embeddings)** — generate a hypothetical answer, embed it, retrieve similar real docs
- [ ] **Multi-query retrieval** — LLM generates multiple query variants; union of results improves recall
- [ ] **Conversation memory types** — `ConversationBufferMemory` (full history), `ConversationSummaryMemory` (summarized), `ConversationWindowMemory` (last k turns)
- [ ] **`mlflow.pyfunc` for LLM chains** — wrap a LangChain chain as a `PythonModel` for deployment via Model Serving

## Common Exam Traps

| Trap | What the Exam Tests | Correct Understanding |
|---|---|---|
| Embedding model consistency | Can you use different models for indexing vs querying? | **No** — the same embedding model must be used at index creation time and query time. Mismatched models produce incompatible vector spaces. |
| Delta Sync vs Direct Access | Which index type auto-syncs? | `Delta Sync` automatically syncs from a Delta table. `Direct Access` requires manual upsert calls via the API. |
| Pay-per-token vs Provisioned Throughput | Which is best for production SLAs? | `Provisioned Throughput` provides dedicated capacity with guaranteed throughput; Pay-per-token is shared and has variable latency. |
| `mlflow.evaluate()` GenAI metrics | Are faithfulness and relevance built-in? | Yes — `mlflow.evaluate()` includes `faithfulness`, `answer_relevance`, `groundedness`, and `toxicity` as built-in GenAI metrics. |
| Chunking overlap | Does overlap cause duplicate content? | Overlap is intentional — it ensures context is not lost at chunk boundaries. Some duplication is acceptable. |
| RAG vs fine-tuning | When to use each? | RAG for **dynamic/private knowledge** that changes frequently. Fine-tuning for **style/format adaptation** or adding domain-specific reasoning patterns. |
| Top-k in retrieval | Does larger k always improve answers? | No — more chunks consume more context window tokens and can introduce noise, degrading answer quality. |
| LLM evaluation | Is perplexity the right metric for RAG? | No — perplexity measures fluency, not factual correctness. Use `groundedness` and `answer_relevance` for RAG evaluation. |

## Quick Reference Numbers

| Item | Value |
|---|---|
| Exam passing score | 70% (32 of 45 questions) |
| Default Vector Search similarity | Cosine |
| Foundation Model API types | Pay-per-token, Provisioned Throughput, External (BYOM) |
| MLflow GenAI built-in metrics | faithfulness, answer_relevance, groundedness, toxicity, relevance |
| AutoML GenAI support | Not applicable — AutoML is for tabular ML, not GenAI |
| RAG evaluation dimensions | Retrieval quality (precision/recall) + Generation quality (faithfulness/relevance) |

## Day Before the Exam

- [ ] Review the domain weight table — allocate extra time to RAG and LLM Application Development
- [ ] Review Databricks Vector Search index types (Delta Sync vs Direct Access) and their APIs
- [ ] Review Foundation Model API endpoint types and when to use each
- [ ] Review MLflow LLM tracking APIs: `mlflow.langchain.autolog()`, `mlflow.evaluate()`
- [ ] Review chunking strategies and the chunk-size / overlap trade-off
- [ ] Confirm your Databricks account access and proctor software is installed
- [ ] Get 8 hours of sleep

## During the Exam

- [ ] Read each question fully before looking at choices — identify the key constraint (e.g., "production SLA" → Provisioned Throughput)
- [ ] Eliminate clearly wrong answers first to narrow choices
- [ ] For API questions, recall the exact parameter names and shapes
- [ ] Flag uncertain questions and move on — do not get stuck
- [ ] Watch for "best practice" wording — the exam often has two plausible answers; choose the recommended Databricks approach
- [ ] For retrieval questions, check whether it asks about offline batch or real-time serving
- [ ] For evaluation questions, distinguish retrieval metrics (precision@k, recall@k) from generation metrics (faithfulness, relevance)

---

[← Back to Resources](./README.md)

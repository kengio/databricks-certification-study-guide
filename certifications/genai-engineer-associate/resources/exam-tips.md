---
title: GenAI Engineer Associate Exam Tips
type: exam-tips
tags: [genai-engineer-associate, exam-tips, certification]
status: published
---

# GenAI Engineer Associate Exam Tips and Strategies

Practical strategies for passing the Databricks Certified Generative AI Engineer Associate exam on your first attempt. Aligned to the exam guide published March 18, 2026 ([PDF, August 2026 edition](https://www.databricks.com/sites/default/files/2026-10/databricks-certified-gen-ai-associate-exam-guide-august-2026.pdf)).

## Exam Format

| Detail | Value |
|---|---|
| Scored questions | 45 |
| Unscored items | Up to 10 (not identified; time already included) |
| Duration | 90 minutes |
| Passing score | Pass / fail — no numeric threshold published |
| Code in stems | Python (SQL for non-ML data manipulation) |
| Question format | **Multiple-choice and multiple-selection** ("Which TWO…") |
| Delivery | Online proctored (exam guide); the certification page also lists test centers |
| Test aids | None |

## Domain Weights and Study Time

| Exam guide section | Weight | ≈ Questions | Recommended study time |
|---|---|---|---|
| 3. Application Development | 30 % | ~13–14 | 10–12 hours |
| 4. Assembling and Deploying Applications | 22 % | ~10 | 8–10 hours |
| 1. Design Applications | 14 % | ~6 | 4–5 hours |
| 2. Data Preparation | 14 % | ~6 | 4–5 hours |
| 6. Evaluation and Monitoring | 12 % | ~5–6 | 4–5 hours |
| 5. Governance | 8 % | ~3–4 | 2–3 hours |

Application Development plus Assembling and Deploying Applications are over half the exam — make them your top priority, but do not skip the 2026 additions (Agent Bricks, MCP, judges and scorers), which are concentrated in the smaller sections.

## Time Management

| Phase | Time | Target |
|---|---|---|
| First pass (answer all) | 60 min | ~80 sec per question (the unscored items share this time) |
| Review flagged questions | 20 min | Revisit uncertain answers |
| Final review | 10 min | Check every multiple-selection question has the required number of answers |

Flag any question you are unsure about and keep moving. Do not spend more than 2 minutes on any single question during the first pass.

## Multiple-Selection Questions

- The stem states how many answers to pick ("Which TWO actions…") — pick exactly that many
- Evaluate each option **independently** as true or false for the scenario, then select the true ones
- Official example: to reduce 150 million embeddings below a 100 million limit, choose **increase chunk size** *and* **decrease overlap**
- Official example: for a managed internet source plus a third-party API with a key, choose **configure the managed MCP server** *and* **register the external MCP server with its key in a secret store**

## Key Topics to Master

### Must Know (High Frequency)

- [ ] **RAG pipeline stages** — load → parse/clean → chunk → embed → write to Delta → index → retrieve → (re-rank) → augment → generate
- [ ] **Vector Search index types** — Delta Sync (auto-syncs from a CDF-enabled Delta table) vs Direct Vector Access (you upsert vectors)
- [ ] **Endpoint types** — standard (lowest latency, ~320M vectors at 768 dims) vs storage-optimized (1B+ vectors, faster indexing, ~250 ms extra latency)
- [ ] **Embedding consistency** — same model at index time and query time; window ≥ chunk size
- [ ] **Foundation Model APIs** — pay-per-token (no setup, variable latency) vs provisioned throughput (reserved capacity)
- [ ] **`ResponsesAgent` + MLflow Tracing** — the recommended agent interface; `ChatAgent` / `ChatModel` are legacy
- [ ] **`log_model(..., resources=[...])`** — declared resources enable automatic credentials at deployment
- [ ] **`mlflow.genai.evaluate()`** — dataset + `predict_fn` + scorers; know which judges need ground truth
- [ ] **Chunking trade-offs** — size, overlap, structure-aware, semantic, parent-child

### Should Know (Medium Frequency)

- [ ] **Agent Bricks** — Knowledge Assistant (document Q&A with citations), Multi-Agent Supervisor (coordinate Genie, KA, tools), Information Extraction (documents → schema-shaped rows)
- [ ] **Genie in multi-agent systems** — Genie Agent (formerly Genie Space) for structured data via Conversation API, `GenieAgent`, or MCP
- [ ] **MCP servers** — managed first, external second, custom (Databricks Apps) last
- [ ] **Access control** — automatic passthrough vs on-behalf-of-user vs secrets (`{{secrets/scope/key}}`)
- [ ] **`ai_query()`** — batch inference over tables; `failOnError`, `responseFormat`, `modelParameters`
- [ ] **Prompt Registry** — immutable versions, mutable aliases (`@production`) for promotion and rollback
- [ ] **AI Gateway** — inference tables (payloads), usage tables (tokens, requesters), rate limits (QPM/TPM, HTTP 429)
- [ ] **Hybrid search and re-ranking** — keyword + vector recall; cross-encoder re-ranking for precision at a latency cost
- [ ] **Guardrails** — safety filtering, PII `MASK` vs `BLOCK`, prompt-injection-resistant prompts, least-privilege tools

### Good to Know (Lower Frequency)

- [ ] **HyDE, multi-query retrieval, contextual compression**
- [ ] **Custom scorers** — `@scorer` (deterministic) vs `make_judge()` (custom LLM judge); judge alignment with SME feedback
- [ ] **Agent Monitoring** — `scorer.register(...).start(sampling_config=ScorerSamplingConfig(sample_rate=...))`
- [ ] **Persistent memory** — session state and long-term memory in Lakebase-backed stores, not process memory
- [ ] **Agent UIs** — Databricks Apps; Genie app for Microsoft Teams; bot backends for Slack
- [ ] **Licensing** — data licences, terms of service, model licences, provenance metadata

## Common Exam Traps

| Trap | What the Exam Tests | Correct Understanding |
|---|---|---|
| Embedding model consistency | Can you index and query with different models? | **No** — vectors from different models are incompatible. |
| Similarity metric | What does Vector Search use? | ANN (HNSW) with **L2 distance**; normalise embeddings if you want cosine ordering ([AI Search](https://docs.databricks.com/aws/en/ai-search/ai-search)). |
| Biggest model wins | Is the largest LLM always best? | No — when cost or latency is the stated priority, choose the smallest model that passes evaluation. |
| Scanned documents | Which package extracts text from `.png` scans? | **OCR — `pytesseract`**; BeautifulSoup, scrapy, and pyquery are HTML tools. |
| Per-entity facts | Delivery dates per order — vector store? | No — a **table keyed by ID** (feature store / lookup), not documents. |
| Ground-truth judges | Can `Correctness` score live traffic? | No — it needs expectations. Use `RelevanceToQuery`, `RetrievalGroundedness`, `Safety`, `Guidelines` online. |
| SME disagreement | Average the ratings? | No — define **rubrics**, **calibrate** SMEs, then use aligned judgments in `mlflow.genai.evaluate()`. |
| Prompt promotion | Merge branches or overwrite files? | **MLflow prompt versions + aliases**. |
| Tokens in the browser | Can a Databricks App call an agent from JavaScript with a PAT? | No — the **app backend** calls the endpoint; credentials never reach the browser. |
| Custom MCP wrapper | Wrap managed and third-party tools in one custom server? | No — use the **managed** server and register the **external** one. |
| Latency-critical search | Turn on hybrid search and re-ranking? | Not when latency is the most critical metric — both add latency. |
| AI Gateway domain | Is gateway tracking a Governance topic? | The exam guide lists inference tables, usage tables, and rate limiting under **Evaluation and Monitoring**. |

## Quick Reference Numbers

| Item | Value |
|---|---|
| Scored questions / time | 45 / 90 minutes (+ up to 10 unscored items) |
| `databricks-bge-large-en` | 512-token window, 1024 dims |
| `databricks-gte-large-en` | 8192-token window, 1024 dims |
| Standard vs storage-optimized endpoint | ~320M vs 1B+ vectors at 768 dims |
| Supervisor sub-agents and tools | Up to 50 |
| Genie Agent tables | Up to 50 tables, views, or metric views |
| Production monitoring scorers | Up to 20 per experiment |
| Rate limits per endpoint | Up to 20 (5 group-specific); only `minute` renewal period |
| Inference table latency | Rows within about an hour; payloads over 1 MiB not logged |

## Day Before the Exam

- [ ] Review the domain weight table — extra time on Application Development and Assembling and Deploying Applications
- [ ] Re-read the [Exam Guide Coverage tables](../README.md#study-topics) in each folder README and skim any bullet you cannot explain
- [ ] Review which MLflow judges need ground truth and the `@scorer` / `make_judge()` split
- [ ] Review Agent Bricks: which brick for which problem
- [ ] Review managed vs external vs custom MCP servers
- [ ] Confirm your exam account access and proctoring software are installed
- [ ] Get 8 hours of sleep

## During the Exam

- [ ] Identify the stated priority (latency, cost, quality, maintenance, governance) before reading the options
- [ ] For multiple-selection questions, count the required answers and judge each option independently
- [ ] Eliminate options that hard-code secrets, expose endpoints publicly, or overwrite history
- [ ] Prefer the managed Databricks feature over custom code when both meet the requirement
- [ ] Distinguish retrieval metrics (precision@k, recall@k, MRR) from generation metrics (groundedness, relevance, correctness)
- [ ] Flag uncertain questions and move on

---

[← Back to Resources](./README.md)

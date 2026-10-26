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

> [!important]
> Exam guide: published March 18, 2026 (PDF re-issued as "August 2026"). 45 scored **multiple-choice and multiple-selection** questions + up to 10 unscored, 90 minutes. Answer with the product surface the guide tests (Agent Bricks, Agent Framework, Model Serving, Vector Search, Genie Spaces), even where the product has since been renamed or moved to legacy.

## 2-minute facts that show up *most often*

- **Compound AI app = one endpoint, not N microservices** — retriever + re-ranker + LLM + tools inside one `ResponsesAgent`
- **`ResponsesAgent`** is the recommended agent interface; `ChatAgent` and `ChatModel` are *legacy*
- **`log_model(..., resources=[...])`** → `agents.deploy()` provisions the serving endpoint, short-lived credentials, inference tables, real-time tracing, and the Review App
- **Vector Search** index types: **Delta Sync** (auto-updates from a CDF-enabled Delta table) vs **Direct Vector Access** (push vectors via API); standard endpoint = lowest latency, storage-optimized = 1B+ vectors
- **FMAPI billing**: pay-per-token (no reservation) vs provisioned throughput (reserved capacity)
- **Embedding window ≥ chunk size**: `bge-large-en` 512 tokens, `gte-large-en` 8192 tokens (both 1024 dims)
- **Judges that need ground truth**: `Correctness`, `RetrievalSufficiency`, `ToolCallCorrectness`
- **Agent Bricks**: document Q&A → Knowledge Assistant; many cooperating agents → Multi-Agent Supervisor; documents → structured rows → Information Extraction
- **MCP**: managed first, external second (credentials in a governed store), custom (Databricks Apps) last
- **AI Gateway** (tested under Evaluation and Monitoring): inference tables = payloads; usage tables = tokens and requesters; rate limits = QPM/TPM, HTTP 429
- **PII is masked *before* embedding** — once indexed, it can be retrieved into any prompt

## 5-minute per-domain quick-fire (6 domains)

### Section 3 — Application Development (30 %)

- Tool calling = LLM picks the function; chain = fixed path, agent = LLM-driven loop with `max_iterations`
- Multi-agent + **Genie** for structured data: Conversation API (`start-conversation` → poll → query result), `GenieAgent`, or Genie MCP
- Evaluation phase (curated dataset, ground truth) vs monitoring phase (sampled live traces, no ground truth)
- Choose the **smallest model that passes evaluation** when cost or latency is the priority; read model cards for task, context length, licence

### Section 4 — Assembling and Deploying Applications (22 %)

- Access control: **automatic passthrough** (declared resources), **OBO** (user's permissions, declared scopes), **secrets** (`{{secrets/scope/key}}`)
- Batch → `ai_query()` (or task-specific AI Functions); `failOnError => false` keeps one bad row from failing the job
- **Prompt Registry**: immutable versions, mutable aliases (`@production`) for promotion and rollback
- Memory lives in an external durable store (Lakebase-backed sessions / memory), never in process memory
- UIs: Databricks Apps (backend holds credentials), Genie app for Teams, Slack bot backend

### Section 1 — Design Applications (14 %)

- Write the I/O spec first; pick the **narrowest task** (paragraph → gist = Summarization)
- Per-entity facts → keyed table/tool; explanatory knowledge → retriever
- Tool order: identify → retrieve → compute → act (irreversible actions last, gated)
- RAG for changing facts; fine-tuning for style/format/persona

### Section 2 — Data Preparation (14 %)

- Scanned images → OCR (`pytesseract`); HTML → BeautifulSoup; PDFs → `pypdf` / PyMuPDF; SQL → `ai_parse_document`
- Fewer embeddings → **larger chunks** and **less overlap**
- Retrieval metrics: recall@k (found it?), precision@k (clean?), MRR (best one first?)
- Re-ranking = precision at the top, at a latency cost

### Section 6 — Evaluation and Monitoring (12 %)

- `mlflow.genai.evaluate(data, predict_fn, scorers)`; `@scorer` for deterministic checks, `make_judge()` for custom LLM judges
- SME disagreement → rubrics + calibration, then aligned judgments in `mlflow.genai.evaluate()`
- Agent Monitoring: `scorer.register(...).start(sampling_config=ScorerSamplingConfig(sample_rate=...))`
- Cost levers: rate limits, budgets, pricing mode, scale-to-zero, smaller models, batch inference

### Section 5 — Governance (8 %)

- Masking: at ingestion (fastest, safest), column masks / row filters at retrieval, gateway PII `MASK` (keeps requests answerable) vs `BLOCK`
- Malicious input: safety filter, injection-resistant prompts, least-privilege tools, rate limits, human approval
- Licensing: data licence, terms of service, privacy basis, model licence — before ingestion; record provenance
- Problematic text: fix the source (exclude, replace, redact) before relying on output filters

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Compound app = 3 chained endpoints" | Wrong — one endpoint |
| "Subclass `ChatModel` for a new agent" | Legacy — use `ResponsesAgent` |
| "Use `Correctness` to monitor live traffic" | Needs ground truth — use judges without expectations |
| "Average SME scores to fix disagreement" | Rubrics + calibration |
| "Store prompts in Git / JSON and overwrite on deploy" | MLflow prompt versions + aliases |
| "PAT in the app's JavaScript" | App backend calls the endpoint |
| "Build a custom MCP wrapper for everything" | Managed + external servers |
| "Redact PII at retrieval" | Mask at ingestion (before embedding) |
| "Hybrid search + re-ranking for a latency-critical search bar" | Leave both off when latency is the top metric |
| "beautifulsoup for scanned PNGs" | `pytesseract` (OCR) |

## Today's exam — 90-minute time budget

- **45 scored questions in 90 minutes ≈ 2 min each**, minus time for any unscored items
- **Multiple-selection**: count the required answers; judge each option on its own
- Long scenario stems: find the **stated priority** (latency, cost, quality, maintenance, governance) — it decides between two plausible options
- "Most-managed Databricks feature" usually wins: Agent Bricks or managed MCP over custom code; inference tables over custom logging; Prompt Registry over hand-rolled versioning

## Eat. Hydrate. Breathe.

You're ready. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to GenAI Engineer Associate](../README.md)**

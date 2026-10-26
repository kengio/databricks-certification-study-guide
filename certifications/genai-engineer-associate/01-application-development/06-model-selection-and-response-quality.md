---
title: Model Selection and Response Quality
type: study-material
tags:
  - genai-engineer-associate
  - application-development
  - model-selection
  - model-cards
  - embeddings
  - response-quality
status: published
---

# Model Selection and Response Quality

## Overview

Six Application Development bullets are about *choosing*: the best LLM for an application, an embedding model's context length, a model from a hub or marketplace using its model card, the best model from experiment metrics, and a chunking strategy from evaluation results — plus qualitatively spotting quality and safety problems in responses. They share one method: **state the constraint that matters most, read the evidence (model card, metrics, sample outputs), and pick the smallest option that satisfies it.**

> [!abstract]
>
> - **LLM selection** — weigh task fit, quality, latency, cost, context window, licence, and deployment option (pay-per-token, provisioned throughput, external model)
> - **Embedding context length** — match the model's maximum input to your chunk size; a longer window than your chunks adds cost and latency without benefit
> - **Model cards** — the metadata that tells you task, languages, context length, licence, training data, evaluation results, and limitations
> - **Experiment metrics** — compare candidates on the same evaluation set and scorers in MLflow; choose by the metric tied to the requirement, then break ties on cost and latency
> - **Qualitative review** — read real outputs to find hallucination, irrelevance, format errors, unsafe content, and leaked data before you automate scoring

> [!tip] What the Exam Tests
>
> - Picking a model when the stem states a priority (*"cost and latency matter more than quality"*, *"must run on-prem-style with an open licence"*, *"needs 100k-token context"*)
> - The official sample question: chunks capped at 512 tokens + cost/latency priority → the **512-token, smallest, lowest-dimension** embedding model
> - Reading a model card to confirm task, licence, and limits before adoption
> - Naming the failure mode visible in a sample response (hallucination, off-topic, unsafe, format violation)

---

## Selecting the best LLM for the application

Exam guide bullet: *"Select the best LLM based on the attributes of the application to be developed."*

| Attribute of the application | What it implies for the model |
| :--- | :--- |
| **Task type** (summarise, classify, extract, chat, code) | Choose a model trained / instruction-tuned for that task; small models often suffice for classification and extraction |
| **Quality bar** | Higher-capability (usually larger) models for complex reasoning; verify with evaluation, not size alone |
| **Latency SLA** | Smaller models, shorter prompts, streaming; provisioned throughput for predictable latency |
| **Throughput and cost** | Smaller models; batch with `ai_query()`; pay-per-token for spiky low volume, provisioned throughput for steady high volume |
| **Context needed** (long documents, many retrieved chunks) | A model whose context window fits system prompt + retrieved context + history + answer |
| **Structured output / tool use** | A model that supports function calling and structured outputs |
| **Data residency, licence, control** | Open-licence models served on Databricks, or external models routed through the gateway when policy allows |
| **Languages** | Check the model card for supported languages |

> [!warning] Common Mistake
> "Use the biggest model" is rarely the exam answer. When the stem states that cost or latency is the priority, choose the **smallest model that meets the quality bar** and prove the bar with an evaluation run.

### Size and architecture trade-offs

The Evaluation and Monitoring domain repeats this skill as *"Select an LLM choice (size and architecture) based on a set of quantitative evaluation metrics."*

| Choice | Typical effect |
| :--- | :--- |
| **Larger dense model** | Better reasoning and instruction following; higher cost per token and latency |
| **Smaller dense model** | Cheaper and faster; may be enough for narrow tasks — verify with metrics |
| **Mixture-of-experts (MoE)** | Activates a subset of parameters per token, so inference cost is lower than a dense model of the same total size |
| **Instruction-tuned vs base** | Instruction-tuned for chat and RAG; base models need fine-tuning or heavy prompting |
| **Fine-tuned small model** | Can match a larger model on one narrow task at lower serving cost; needs training data and maintenance |

Decide with a table of **quality metric × latency × cost** from the same evaluation dataset, and pick the cheapest model that clears the quality threshold.

## Selecting an embedding model's context length

Exam guide bullet: *"Select an embedding model context length based on source documents, expected queries, and optimization strategy."*

The embedding model must accept the **longest chunk** you will embed (and the queries). Anything beyond that window is truncated, so the information is lost from the vector. A window far larger than your chunks costs more memory, latency, and usually a larger embedding dimension, with no retrieval benefit.

| Databricks-hosted model | Embedding window | Dimension | Notes |
| :--- | :---: | :---: | :--- |
| `databricks-bge-large-en` | 512 tokens | 1024 | Returns normalised embeddings |
| `databricks-gte-large-en` | 8192 tokens | 1024 | Does not return normalised embeddings |
| `databricks-qwen3-embedding-0-6b` *(Public Preview)* | ~32K tokens | up to 1024 (configurable) | 100+ languages, instruction-aware |

Values from [Supported foundation models](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models).

### Decision rules

| Situation | Choose |
| :--- | :--- |
| Chunks ≤ 512 tokens, cost and latency prioritised | The **512-token** model with the smallest size / dimension (this is the official sample question's answer) |
| Long sections must stay intact (legal clauses, long FAQs) | A long-window model, *or* re-chunk with parent-child retrieval |
| Multilingual corpus | A multilingual model, confirmed on its model card |
| Queries much shorter than chunks | Consider HyDE or query expansion rather than a bigger window |

> [!important]
> Use the **same embedding model** for indexing and for queries. Switching models requires re-embedding the whole corpus (see [Embedding Models](../04-data-preparation/02-embeddings-models.md)).

## Selecting a model from a hub or marketplace using model cards

Exam guide bullet: *"Select a model from a model hub or marketplace for a task based on model metadata/model cards."*

Where models come from on Databricks:

- **Databricks-hosted foundation models** — available as model services in the `system.ai` schema and callable through Foundation Model APIs ([Unity Gateway model services](https://docs.databricks.com/aws/en/ai-gateway/))
- **Databricks Marketplace** — install model listings from external providers into Unity Catalog, then serve them ([pre-trained models](https://docs.databricks.com/aws/en/generative-ai/pretrained-models))
- **Hugging Face Hub and other hubs** — log with MLflow (for example the `transformers` flavour), register to Unity Catalog, serve on Model Serving
- **External providers** — route OpenAI, Anthropic, and other providers through the gateway with governance

What to read on a model card before you choose:

| Model card field | Why it matters |
| :--- | :--- |
| **Intended use / task** | Confirms the model was built for your task (for example *summarization* vs *text-generation*) |
| **Context length** | Must fit your chunks (embedding) or prompt + context + answer (LLM) |
| **Languages** | Must cover your users and documents |
| **Licence and use restrictions** | Commercial use, attribution, redistribution, use of outputs — a legal risk if ignored (see [Governance](../06-governance/01-governance-overview.md)) |
| **Training data** | Domain fit and potential data-provenance concerns |
| **Evaluation results / benchmarks** | A starting point; confirm on *your* evaluation set |
| **Size and hardware needs** | Drives serving cost and latency |
| **Limitations and bias** | Known failure modes to test for and guard against |

## Selecting the best model from experiment metrics

Exam guide bullet: *"Select the best model for a given task based on common metrics generated in experiments."*

Run every candidate on the **same evaluation dataset with the same scorers**, log each run to the same MLflow experiment, and compare.

```python
import mlflow
from mlflow.genai.scorers import Correctness, RelevanceToQuery, Safety

candidates = {
    "small": "databricks-meta-llama-3-1-8b-instruct",
    "large": "databricks-claude-sonnet-4-5",
}

for label, endpoint in candidates.items():
    with mlflow.start_run(run_name=f"candidate-{label}"):
        mlflow.log_param("endpoint", endpoint)
        mlflow.genai.evaluate(
            data=eval_dataset,                      # same rows for every candidate
            predict_fn=make_predict_fn(endpoint),  # your app, parameterised by model
            scorers=[Correctness(), RelevanceToQuery(), Safety()],
        )
```

How to read the results:

| Metric type | Examples | Use it to… |
| :--- | :--- | :--- |
| **Quality (LLM judges)** | Correctness, groundedness, relevance, guideline pass rate | Decide whether a candidate meets the bar |
| **Classic NLP metrics** | Exact match, F1, ROUGE (summarisation), BLEU (translation), accuracy (classification) | Tasks with a reference answer and a well-defined metric |
| **Safety** | Safety judge pass rate, toxicity | Hard gate — a failing candidate is out regardless of quality |
| **Operational** | Latency (P50/P95), tokens per request, cost per request | Break ties between candidates that pass the quality bar |

Rule: **filter by the requirement's primary metric, then minimise cost and latency.**

## Selecting a chunking strategy from evaluation results

Exam guide bullet: *"Select chunking strategy based on model & retrieval evaluation."* Treat chunking as a hyperparameter and let retrieval and answer metrics decide.

| Evaluation signal | Likely chunking change |
| :--- | :--- |
| Low context **recall** / retrieval sufficiency — needed facts are not retrieved | Smaller chunks, more overlap, or structure-aware splitting by headings |
| Low context **precision** / relevance — retrieved chunks are noisy | Smaller, more focused chunks; metadata filters; add a re-ranker |
| Answers lack surrounding context even when the right chunk is found | Parent-child chunking (retrieve small, return the parent section) |
| Chunks exceed the embedding window (truncation) | Reduce chunk size below the model's window, or switch to a longer-window model |
| Too many embeddings for the index or budget | Larger chunks and less overlap (the official sample question on reducing 150 M embeddings) |

The mechanics of each strategy are in [Document Processing & Chunking](../04-data-preparation/01-document-processing-chunking.md); retrieval metrics are in [Source Documents, Extraction, and Retrieval Evaluation](../04-data-preparation/04-source-documents-extraction-and-retrieval-eval.md).

## Qualitatively assessing responses

Exam guide bullet: *"Qualitatively assess responses to identify common issues such as quality and safety."* Before automating evaluation, **read a sample of real outputs** and label what goes wrong — the labels become your guidelines and custom judges later.

| Issue | What it looks like | Typical cause | Typical fix |
| :--- | :--- | :--- | :--- |
| **Hallucination** | Confident facts not in the retrieved context | Weak grounding instruction, missing context | "Answer only from context", groundedness judge, better retrieval |
| **Irrelevance** | Answers a different question | Poor retrieval or ambiguous query | Query rewriting, relevance judge |
| **Incompleteness** | Misses part of a multi-part question | Context truncated, chunk too small | Decomposition, larger `k`, parent-child chunks |
| **Format violation** | Broken JSON, wrong length, missing citation | Soft format instructions | Structured output, parser + retry, few-shot |
| **Unsafe content** | Toxic, harmful, or policy-violating output | Jailbreak, unsafe prompt | Input/output guardrails, safety judge |
| **Data leakage** | PII or secrets in the answer | Unredacted source data | Redact before embedding, PII guardrails, masking |
| **Tone / persona drift** | Off-brand or inconsistent voice | Weak system prompt | Stronger system prompt, guidelines judge |

## Use Cases

- **Cost-driven model swap** — evaluation shows an 8B model matches a 70B model on a classification task within one point of accuracy; the team serves the smaller model and cuts cost
- **Embedding choice for short chunks** — 512-token chunks and a latency SLA lead to a 512-window, low-dimension model instead of a 32K-window model
- **Licence screening** — a model card's licence forbids commercial use, so the team selects a different model before building on it
- **Chunk-size sweep** — three chunk sizes are evaluated; the middle size wins on retrieval sufficiency without inflating the index

## Common Issues & Errors

### Silent Truncation in Embeddings

**Scenario:** Recall is poor for long chunks even though the right documents are indexed.
**Fix:** Chunks exceed the embedding model's window, so the tail of each chunk is never embedded. Re-chunk below the window or choose a longer-window model.

### Benchmark Winner Loses on Your Data

**Scenario:** The model with the best public benchmark scores worse on the team's evaluation set.
**Fix:** Model-card benchmarks are a starting point. Always compare candidates on your own dataset and scorers in MLflow.

### Comparing Runs With Different Data

**Scenario:** Model B looks better, but it was evaluated on an easier dataset.
**Fix:** Pin the same evaluation dataset (ideally a versioned MLflow evaluation dataset) and the same scorers for every candidate.

## Exam Tips

> [!tip] Exam Tips
>
> - Stated priority wins: **cost/latency → smallest adequate model**; **quality → most capable model that passes evaluation**.
> - Embedding window ≥ chunk size, but not much larger when cost matters. **512-token chunks → 512-token model.**
> - Model card checklist: **task, context length, languages, licence, training data, evaluation, limitations**.
> - Compare models on the **same evaluation dataset and scorers**; break ties on latency and cost.
> - Low retrieval recall → change **chunking**; low groundedness with good recall → fix the **prompt or model**.

## Key Takeaways

- Choose LLMs by task fit, quality bar, latency, cost, context window, licence, and deployment option — not by size alone
- Match the embedding window to your chunk size; `bge-large-en` = 512 tokens, `gte-large-en` = 8192 tokens, both 1024-dimensional
- Model cards carry the facts you need before adoption, including licence and limitations
- Experiment metrics decide model and chunking choices when every candidate uses the same data and scorers
- Qualitative review of real outputs identifies the failure modes that automated scorers should then measure

## Related Topics

- [Prompt Engineering](./01-prompt-engineering.md)
- [Embedding Models](../04-data-preparation/02-embeddings-models.md)
- [Mosaic AI & Foundation Models](../02-assembling-and-deploying-apps/01-mosaic-ai-and-foundation-models.md)
- [MLflow Scorers, Judges, and SME Feedback](../05-evaluation-and-monitoring/03-mlflow-scorers-judges-and-feedback.md)

## Official Documentation

- [Supported foundation models](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models)
- [Pre-trained models in Unity Catalog and Marketplace](https://docs.databricks.com/aws/en/generative-ai/pretrained-models)
- [Built-in LLM judges](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/judges/)
- [Tutorial: Evaluate and improve an agent](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/evaluate-app)
- [AI governance with Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/)

---

**[← Previous: Agentic Systems with MLflow, Agent Framework, and Genie](./05-agentic-systems-mlflow-and-genie.md) | [↑ Back to Application Development](./README.md)**

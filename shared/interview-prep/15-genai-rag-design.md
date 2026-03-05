---
tags: [interview-prep, genai, rag]
---

# Interview Questions — GenAI & RAG System Design

---

## Question 1: RAG Architecture for Enterprise Knowledge Base

**Level**: Both
**Type**: System Design

**Scenario / Question**:
Your company wants to build an internal chatbot that answers employee questions using 50,000 internal documents (policies, wikis, Confluence pages). Walk me through how you would design a RAG system on Databricks.

> [!success]- Answer Framework
>
> **Short Answer**: Ingest documents via batch pipeline, chunk text (500-1000 tokens with overlap), generate embeddings using a Foundation Model endpoint, store in Databricks Vector Search (Delta Sync index), and at query time retrieve top-k chunks, inject into a prompt with context, and call a Foundation Model for generation.
>
> ### Key Points to Cover
>
> - Document ingestion and preprocessing pipeline
> - Chunking strategy (size, overlap, document-aware splitting)
> - Embedding model choice (BGE, GTE, or Databricks Foundation Model)
> - Vector Search index type (Delta Sync vs Direct Vector Access)
> - Retrieval parameters (top-k, similarity threshold, filters)
> - Prompt construction with retrieved context
> - Guardrails and answer grounding
>
> ### Example Answer
>
> I'd design this in three phases: **indexing**, **retrieval**, and **generation**.
>
> For **indexing**, I'd build a Databricks Workflow that ingests documents from Confluence/SharePoint, extracts text (using `unstructured` or `pypdf`), and chunks using recursive character splitting at ~800 tokens with 100-token overlap. Each chunk keeps metadata: `source_url`, `document_title`, `department`, `last_updated`.
>
> ```python
> from langchain.text_splitter import RecursiveCharacterTextSplitter
>
> splitter = RecursiveCharacterTextSplitter(
>     chunk_size=800,
>     chunk_overlap=100,
>     separators=["\n\n", "\n", ". ", " "]
> )
> chunks = splitter.split_documents(documents)
> ```
>
> I'd generate embeddings using a Databricks Foundation Model endpoint (e.g., BGE-large) and store them in a Delta table. Then I'd create a **Delta Sync Vector Search index** — it automatically stays in sync as the source Delta table updates.
>
> For **retrieval**, I query the Vector Search index with the user's question embedding, retrieving the top 5-8 chunks. I'd add metadata filters (e.g., department-specific documents) when relevant.
>
> For **generation**, I construct a prompt that includes the retrieved chunks as context, a system instruction to only answer from provided context, and the user's question. I'd call a Foundation Model (DBRX, Llama, or an external model via AI Gateway).
>
> Guardrails: I'd instruct the model to say "I don't have enough information" rather than hallucinate, and include source citations in the response.
>
> ### Follow-up Questions
>
> - How would you handle documents that change frequently?
> - What chunking strategy would you use for tables and structured data?
> - How would you evaluate retrieval quality vs generation quality separately?

---

## Question 2: Chunking Strategy Trade-offs

**Level**: Both
**Type**: Technical Deep Dive

**Scenario / Question**:
You're building a RAG system and need to decide on a chunking strategy. The documents include long-form policies (20+ pages), short FAQs (1-2 paragraphs), and technical specs with tables and code. How would you approach chunking?

> [!success]- Answer Framework
>
> **Short Answer**: Use document-type-aware chunking rather than one-size-fits-all. Long documents get recursive splitting at section boundaries. FAQs keep each Q&A pair as a single chunk. Technical specs need special handling for tables and code blocks. Use metadata-enriched chunks to aid retrieval.
>
> ### Key Points to Cover
>
> - Fixed-size chunking vs semantic chunking vs document-structure-aware chunking
> - Chunk size trade-offs (smaller = more precise retrieval, larger = more context)
> - Overlap to avoid cutting information at boundaries
> - Parent-child retrieval pattern (retrieve small, inject large)
> - Metadata enrichment (section headers, document type, page number)
>
> ### Example Answer
>
> One-size-fits-all chunking fails here because the document types have very different structures. I'd implement **document-type-aware chunking**:
>
> **Long-form policies**: Split at section headers (H2/H3 boundaries) first, then apply recursive character splitting within each section at ~800 tokens. Prepend the section header chain ("Policy Name > Section > Subsection") to each chunk for context.
>
> **Short FAQs**: Keep each question-answer pair as a single chunk, regardless of length. Splitting a Q&A pair would destroy the semantic unit. If a Q&A exceeds 1000 tokens (rare), split only the answer portion.
>
> **Technical specs with tables**: Tables are a problem for naive text splitting. I'd serialize tables as markdown, and ensure a table never gets split across chunks. Code blocks similarly stay intact. If a table exceeds the chunk size, it becomes its own chunk with the preceding paragraph as context.
>
> For all types, I'd use the **parent-child retrieval** pattern: embed small chunks (200-400 tokens) for precise retrieval, but at generation time, inject the parent chunk (800-1200 tokens) for richer context. This gives the best of both worlds.
>
> I'd also enrich every chunk with metadata: `document_type`, `section_path`, `source_url`, `date_modified`. This enables filtered retrieval (e.g., only search technical specs when the question is about API parameters).
>
> ### Follow-up Questions
>
> - How would you measure whether your chunking is effective?
> - What's the downside of very small chunks?
> - How does chunk overlap interact with embedding quality?

---

## Question 3: Evaluating RAG System Quality

**Level**: Professional
**Type**: Operations

**Scenario / Question**:
Your RAG chatbot is live but users are complaining about irrelevant or incorrect answers. How would you systematically evaluate and improve the system?

> [!success]- Answer Framework
>
> **Short Answer**: Decompose evaluation into retrieval quality (are we finding the right chunks?) and generation quality (is the LLM producing a good answer from those chunks?). Use MLflow evaluate with LLM-as-judge for scalable assessment, build a golden evaluation dataset, and monitor retrieval metrics (precision@k, recall) separately from generation metrics (faithfulness, relevance, harmfulness).
>
> ### Key Points to Cover
>
> - Separate retrieval evaluation from generation evaluation
> - MLflow `evaluate()` with LLM-as-judge metrics
> - Retrieval metrics: precision@k, recall@k, MRR (Mean Reciprocal Rank)
> - Generation metrics: faithfulness (no hallucination), relevance, answer correctness
> - Golden evaluation dataset with human-annotated Q&A pairs
> - Logging inference tables for offline analysis
>
> ### Example Answer
>
> The first step is **diagnosis** — is the problem retrieval (wrong chunks) or generation (bad answer from good chunks)?
>
> I'd log every request to an inference table: `question`, `retrieved_chunks`, `generated_answer`, `latency`, `user_feedback`. Then I manually review 50 complaints to classify them:
>
> - **Retrieval failure** (~60% of issues typically): The correct chunk wasn't in the top-k results. Fix: improve chunking, tune embedding model, add metadata filters, increase k.
> - **Generation failure** (~30%): Correct chunks were retrieved but the model hallucinated or misinterpreted. Fix: improve prompt template, add explicit grounding instructions, use a stronger model.
> - **Knowledge gap** (~10%): The answer isn't in any document. Fix: expand the document corpus.
>
> For **scalable evaluation**, I'd use MLflow evaluate with LLM-as-judge:
>
> ```python
> import mlflow
>
> results = mlflow.evaluate(
>     model=rag_chain,
>     data=eval_dataset,  # golden Q&A pairs
>     model_type="question-answering",
>     extra_metrics=[
>         mlflow.metrics.faithfulness(),
>         mlflow.metrics.relevance(),
>         mlflow.metrics.answer_correctness(),
>     ]
> )
> ```
>
> I'd build a golden evaluation dataset of 100+ Q&A pairs with human-verified correct answers and expected source documents. This becomes the regression test — every change to chunking, embedding model, or prompt must not degrade these metrics.
>
> For retrieval specifically, I'd compute precision@5 and recall@5 against the expected source documents.
>
> ### Follow-up Questions
>
> - How would you handle evaluation when there's no single "correct" answer?
> - What's the trade-off between using GPT-4 as judge vs human evaluation?
> - How would you build the golden dataset efficiently?

---

## Question 4: Vector Search Index Design

**Level**: Both
**Type**: Architecture

**Scenario / Question**:
You need to set up Databricks Vector Search for a RAG system that will index 10 million document chunks. The index needs to stay fresh as new documents are added daily. Walk me through your design choices.

> [!success]- Answer Framework
>
> **Short Answer**: Use a Delta Sync Vector Search index backed by a Delta table containing text, embeddings, and metadata. Delta Sync automatically picks up new/updated/deleted rows from the source table. Choose the right embedding dimension and similarity metric. Use managed embeddings to avoid computing embeddings separately.
>
> ### Key Points to Cover
>
> - Delta Sync Index vs Direct Vector Access Index
> - Managed embeddings (compute-at-index-time) vs self-managed embeddings
> - Embedding dimension trade-offs (384 vs 768 vs 1024)
> - Similarity metrics: cosine vs dot product vs L2
> - Metadata columns for filtered search
> - Index refresh latency and scaling
>
> ### Example Answer
>
> For 10M chunks with daily updates, I'd use a **Delta Sync Index** — it's the right choice because:
>
> 1. **Automatic sync**: When rows are added/updated/deleted in the source Delta table, the index updates automatically. No manual rebuild needed.
> 2. **Unified pipeline**: My ingestion pipeline just writes to a Delta table. Vector Search handles the rest.
>
> I'd use **managed embeddings** where the index computes embeddings at sync time using a Databricks Foundation Model endpoint. This simplifies the pipeline — I only need to manage text, not embedding vectors.
>
> ```python
> from databricks.vector_search.client import VectorSearchClient
>
> client = VectorSearchClient()
>
> index = client.create_delta_sync_index(
>     endpoint_name="vs-endpoint",
>     source_table_name="catalog.schema.document_chunks",
>     index_name="catalog.schema.chunk_index",
>     pipeline_type="TRIGGERED",  # or CONTINUOUS
>     primary_key="chunk_id",
>     embedding_source_column="text",
>     embedding_model_endpoint_name="databricks-bge-large-en",
>     columns_to_sync=["text", "source_url", "department", "date_modified"]
> )
> ```
>
> For similarity metric, I'd use **cosine similarity** — it's the standard for text embeddings and is invariant to vector magnitude. I'd choose BGE-large (1024 dimensions) for a good balance of quality and performance.
>
> The `columns_to_sync` includes metadata columns that I'll use as **filters** at query time. For example, filtering by `department = 'engineering'` narrows the search space before vector similarity is computed, which is much more efficient than post-filtering.
>
> For pipeline type, I'd use `TRIGGERED` if daily freshness is sufficient (cheaper), or `CONTINUOUS` if near-real-time updates are required.
>
> ### Follow-up Questions
>
> - When would you choose Direct Vector Access over Delta Sync?
> - How does index size affect query latency?
> - What's the trade-off between higher embedding dimensions and search performance?

---

## Question 5: Prompt Engineering and Guardrails

**Level**: Both
**Type**: Technical Deep Dive

**Scenario / Question**:
Your RAG chatbot sometimes generates answers that aren't grounded in the retrieved documents — it "sounds right" but includes fabricated details. How would you design the prompt and guardrails to minimize hallucination?

> [!success]- Answer Framework
>
> **Short Answer**: Use structured prompts with explicit grounding instructions, require citation of sources, implement output validation checks, and use chain-of-thought to make reasoning inspectable. Add a secondary LLM call to verify faithfulness when stakes are high.
>
> ### Key Points to Cover
>
> - System prompt design with grounding instructions
> - Citation requirements (force the model to reference specific chunks)
> - "I don't know" handling for questions outside the knowledge base
> - Temperature setting (lower = more deterministic)
> - Output validation: faithfulness checking
> - Chain-of-thought for reasoning transparency
>
> ### Example Answer
>
> Hallucination in RAG usually happens when the model fills in gaps between retrieved chunks with its parametric knowledge. My approach has multiple layers:
>
> **Layer 1: Prompt engineering**
>
> ```text
> System: You are an assistant that answers questions ONLY using the
> provided context documents. Follow these rules strictly:
> 1. Only use information explicitly stated in the context below.
> 2. If the context does not contain enough information, say
>    "I don't have sufficient information to answer this question."
> 3. Cite your sources using [Source: document_title] format.
> 4. Never infer, extrapolate, or use outside knowledge.
>
> Context:
> {retrieved_chunks}
>
> Question: {user_question}
> ```
>
> **Layer 2: Temperature and model choice** — Set temperature to 0.0-0.1 for factual Q&A. Use a model that follows instructions well (DBRX Instruct, Llama 3.1 Instruct). Instruction-tuned models are much better at staying grounded than base models.
>
> **Layer 3: Citation enforcement** — Require the model to cite which document each claim comes from. If a claim has no citation, flag it for review. This also helps users verify answers.
>
> **Layer 4: Faithfulness checking** — For high-stakes use cases, add a second LLM call that takes the retrieved context and the generated answer, then checks: "Is every claim in the answer supported by the context?" This is the LLM-as-judge pattern. MLflow's `faithfulness()` metric automates this.
>
> **Layer 5: Output validation** — Post-process the answer: if it contains phrases like "based on my training data" or "generally speaking" (indicators of parametric knowledge), flag or filter the response.
>
> ### Follow-up Questions
>
> - What's the trade-off between strict grounding and answer helpfulness?
> - How would you handle multi-hop questions that require combining information from multiple chunks?
> - When is hallucination actually acceptable vs dangerous?

---

**[← Previous: ML System Design](./14-ml-system-design.md) | [↑ Back to Interview Prep](./README.md)**

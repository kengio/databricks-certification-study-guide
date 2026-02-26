---
title: Mock Exam 2 Questions — GenAI Engineer Associate
type: mock-exam-questions
tags: [genai-engineer-associate, mock-exam]
status: published
---

# Mock Exam 2 — Questions

Set a 90-minute timer and answer all 45 questions before checking answers.

[← Back to Mock Exam 2 Instructions](./README.md)

---

## Design RAG Solutions (Questions 1–14)

---

## Question 1 *(Medium)*

**Question**: A pharmaceutical company has 10 million pages of clinical trial data. Researchers ask ad hoc questions daily, and new trial data is added weekly. The company must comply with strict data residency requirements — no data can leave their Databricks environment. Which architecture is MOST appropriate?

A) Use the OpenAI API directly with a fine-tuned GPT-4 model trained on the trial data  
B) Build a RAG pipeline using Databricks Vector Search and a Provisioned Throughput Foundation Model endpoint, keeping all data and inference within Databricks  
C) Export the data to a third-party vector database for lower latency retrieval  
D) Store all 10 million pages in the LLM system prompt using a 1M-token context model  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Vector Search and Foundation Model APIs keep all data and inference within the Databricks environment, satisfying data residency requirements. The OpenAI API, third-party vector databases, and 1M-token context approaches all either violate residency constraints or are computationally infeasible at 10 million pages.

---

## Question 2 *(Medium)*

**Question**: A team processes scientific papers in PDF format for a RAG pipeline. The papers contain long structured sections (Abstract, Methods, Results, Discussion) with consistent headers. Which chunking strategy MOST preserves the semantic integrity of each section?

A) Fixed-size chunks of 256 tokens with 32-token overlap  
B) Recursive character text splitting with aggressive overlap  
C) Semantic chunking at section boundaries (using headers as delimiters)  
D) Sentence-level chunking and re-grouping every 5 sentences  

> [!success]- Answer
> **Correct Answer: C**
>
> When documents have consistent, meaningful structure (section headers), chunking at those structural boundaries preserves the semantic integrity of each section. Each chunk (Abstract, Methods, Results) is a coherent unit that answers different types of questions. Fixed-size chunking and recursive splitting ignore document structure, often splitting important sections mid-thought.

---

## Question 3 *(Hard)*

**Question**: A developer tests their RAG pipeline and finds that retrieval precision@5 = 0.40 (only 2 of 5 retrieved chunks are relevant). The LLM produces mostly correct answers despite poor retrieval. What is the BIGGEST risk of this situation in production?

A) The pipeline is more expensive than necessary because extra chunks are retrieved  
B) The LLM may occasionally answer correctly by chance from irrelevant context, but will be unreliable and may hallucinate more often  
C) The vector index will require more storage than necessary  
D) The embedding model is mismatched to the query domain  

> [!success]- Answer
> **Correct Answer: B**
>
> When 60% of retrieved chunks are irrelevant, the LLM works with noisy context and may occasionally produce correct answers from the noise in testing — but production reliability suffers significantly. Non-relevant context increases hallucination risk. Low precision is primarily a correctness problem, not a cost or storage issue.

---

## Question 4 *(Hard)*

**Question**: A developer measures their RAG pipeline and finds faithfulness=0.92 but answer_relevance=0.55. What does this combination indicate?

A) The LLM is grounding its answers in the retrieved context but the retrieved context often does not contain the information users are actually asking for  
B) The retrieval step is excellent, but the LLM is hallucinating 45% of the time  
C) The pipeline is performing well on both dimensions  
D) The embedding model is producing high-quality vectors but the LLM is too verbose  

> [!success]- Answer
> **Correct Answer: A**
>
> High faithfulness (0.92) means the LLM is accurately grounding its answers in the retrieved context — it is not hallucinating. Low answer_relevance (0.55) means the retrieved context (and therefore the answers) often does not address the user's actual question. This is a retrieval recall problem: the right documents are not being retrieved. The fix is improving the retrieval step (better embedding model, more context, different chunking).

---

## Question 5 *(Medium)*

**Question**: A team builds a RAG pipeline for customer support. They want to ensure that answers cite the specific support article used. Which approach enables citation generation?

A) Set the LLM temperature to 0 for deterministic citation formatting  
B) Store source document metadata (article ID, title, URL) alongside embeddings; include metadata in the prompt context and instruct the LLM to cite sources  
C) Use an LLM with more parameters — larger models automatically cite sources  
D) Fine-tune the LLM to always include citations by training on examples with citations  

> [!success]- Answer
> **Correct Answer: B**
>
> Citation generation requires: (1) storing source metadata with embeddings, (2) returning it with results, (3) including it in the LLM prompt, and (4) instructing the LLM to cite sources. Larger models do not auto-cite; fine-tuning helps format but not sourcing; temperature affects randomness, not citations.

---

## Question 6 *(Medium)*

**Question**: A developer is building a code assistant that answers questions about a large private codebase. The codebase uses non-standard variable names and internal library APIs. Which approach provides the MOST accurate retrieval of relevant code snippets?

A) Use a general-purpose text embedding model like `databricks-bge-large-en`  
B) Use a code-specific embedding model (e.g., `code-search-ada-002` or similar) tuned on code retrieval tasks  
C) Use keyword search (BM25) only — code is too structured for semantic embeddings  
D) Index only function docstrings, not code bodies  

> [!success]- Answer
> **Correct Answer: B**
>
> Code-specific embedding models are trained on code corpora and understand programming language semantics, variable naming patterns, and API relationships better than general text models. BM25-only retrieval misses semantic code relationships (e.g., synonymous implementations). Indexing only docstrings discards the actual code logic that may be most relevant for implementation questions.

---

## Question 7 *(Hard)*

**Question**: A developer implements multi-query retrieval for their RAG pipeline. The LLM generates 5 query variants, each retrieving top-5 results. After deduplication, 18 unique chunks remain. How many chunks should be passed to the final LLM generation step?

A) All 18 chunks — more context is always better  
B) A reranked subset of 3–5 chunks — apply a reranker to the 18 candidates and select the most relevant ones  
C) The original 5 top-ranked chunks from the first query variant only  
D) 1 chunk — select the single highest-scoring chunk across all 5 queries  

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-query retrieval's goal is to improve recall (not to pass all retrieved chunks to the LLM). After deduplication, a reranker should score all 18 candidates and select the top 3–5 most relevant for the final generation step. Passing all 18 chunks consumes excessive context window tokens and introduces noise. Using only the first query's results defeats the purpose of multi-query retrieval.

---

## Question 8 *(Medium)*

**Question**: A financial services RAG pipeline retrieves SEC filings. The team observes that questions about a specific company's 2023 filing sometimes retrieve documents from 2021 or 2022. How can the retrieval be constrained to specific fiscal years?

A) Ask the LLM to only reference the most recent documents in the retrieved context  
B) Add `year` and `company` metadata to indexed documents and use metadata pre-filtering in the similarity search query  
C) Create a separate vector index for each fiscal year and route queries based on year keyword detection  
D) Use a larger embedding model to better distinguish documents from different years  

> [!success]- Answer
> **Correct Answer: B**
>
> Metadata pre-filtering is correct: store `year` and `company` fields alongside embeddings, then filter in the similarity search call. LLM-side filtering is unreliable, separate per-year indexes add operational overhead, and embedding model size does not help temporal discrimination.

---

## Question 9 *(Hard)*

**Question**: A developer builds a RAG pipeline where each query retrieves 5 chunks. The evaluation shows that the correct answer is almost always fully contained within the retrieved chunks, yet the LLM still produces incorrect answers. What is the MOST likely root cause?

A) The embedding model is poorly calibrated  
B) The LLM is not extracting the correct information from the context — the problem is in the generation step, not retrieval  
C) The chunk overlap is too large, causing duplicate content confusion  
D) The vector index needs to be rebuilt with a smaller dimensionality  

> [!success]- Answer
> **Correct Answer: B**
>
> When retrieval is confirmed good (answer is in retrieved chunks) but generation is wrong, the problem is in the generation step. Common causes: noisy context burying the answer, or poor prompt instructions. The fix is prompt engineering or context compression — not retrieval-side changes.

---

## Question 10 *(Hard)*

**Question**: A developer implements a RAG pipeline where answers must be attributed to specific sentences (not just document chunks). Which architecture modification enables sentence-level attribution?

A) Reduce chunk size to 1 sentence  
B) Index full document chunks but store sentence-level offsets in metadata; after retrieval, highlight which sentence(s) the LLM referenced using answer span extraction  
C) Use a cross-encoder reranker to identify the most relevant sentence  
D) Post-process the LLM output with an NLP library to identify quoted sentences  

> [!success]- Answer
> **Correct Answer: B**
>
> Sentence-level attribution requires storing positional metadata (sentence offsets) for each chunk. After retrieval and generation, a span extraction step identifies which specific sentences in the retrieved chunks support the answer. Chunking at the sentence level (option A) fragments context and reduces retrieval quality. Cross-encoder reranking improves precision but does not automatically produce sentence-level attribution.

---

## Question 11 *(Medium)*

**Question**: A team discovers that their RAG pipeline's answers degrade significantly on questions that require reasoning across information from multiple documents (e.g., "Compare the safety profiles of Drug A and Drug B"). Which approach BEST addresses multi-document reasoning?

A) Increase the embedding model dimensionality  
B) Use a larger top-k (e.g., k=20) to ensure both documents are retrieved, and instruct the LLM to synthesize information across retrieved chunks  
C) Reduce chunk size to 64 tokens to retrieve more granular information  
D) Switch from RAG to a fine-tuned model  

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-document reasoning requires that the relevant documents for all compared entities (Drug A and Drug B) are retrieved. Increasing k improves the likelihood that both are retrieved. Explicit prompting instructs the LLM to synthesize across retrieved chunks rather than answering from a single source. Smaller chunk sizes increase granularity but may hurt cross-document reasoning by fragmenting context. Fine-tuning does not help with dynamic comparisons of specific documents.

---

## Question 12 *(Medium)*

**Question**: A RAG pipeline uses `answer_relevance` as its primary optimization metric. The team achieves `answer_relevance=0.95` but the legal team raises concerns that the chatbot is confidently providing answers that contradict source documents. Which metric should be added to catch this failure mode?

A) `toxicity` — detects harmful language in answers  
B) `faithfulness` — measures whether answers are grounded in retrieved context  
C) `precision@k` — ensures retrieved documents are relevant  
D) `perplexity` — measures linguistic fluency  

> [!success]- Answer
> **Correct Answer: B**
>
> `faithfulness` (groundedness) directly measures whether the LLM's answers are supported by the retrieved documents. High `answer_relevance` means the questions are addressed, but without `faithfulness`, the LLM may generate plausible-sounding answers that contradict or add to the source material. For legal and compliance use cases, `faithfulness` is the most critical metric. `toxicity` detects harmful language, not factual errors. `precision@k` is a retrieval metric.

---

## Question 13 *(Medium)*

**Question**: A developer's RAG pipeline works well for exact-match questions (e.g., "What is our return policy?") but struggles with paraphrased versions (e.g., "Can I get my money back?"). Which technique MOST improves retrieval for paraphrased queries?

A) Add exact-phrase matching using BM25 alongside dense retrieval (hybrid search)  
B) Use multi-query retrieval — generate paraphrases of the user query before embedding  
C) Reduce the chunk size to improve retrieval granularity  
D) Switch the similarity metric from cosine to dot product  

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-query retrieval generates multiple paraphrases of the original query, improving the chance that at least one variant closely matches the embedding of the relevant document. This is particularly effective for the paraphrase coverage problem. Hybrid search adds sparse retrieval which excels at exact terms — it helps the opposite case (exact terms that are semantically distant). Chunk size and similarity metric do not address the paraphrase coverage gap.

---

## Question 14 *(Hard)*

**Question**: A production RAG pipeline has `faithfulness=0.88` and `answer_relevance=0.82` on evaluation. The team wants to improve both metrics. Which is the CORRECT priority order to investigate?

A) Improve faithfulness first (generation quality), then answer_relevance (retrieval quality)  
B) Improve answer_relevance first (retrieval quality), then faithfulness (generation quality) — retrieval quality is the foundation  
C) Optimize both simultaneously by retraining the embedding model  
D) These metrics cannot be optimized independently — only full system retraining helps  

> [!success]- Answer
> **Correct Answer: B**
>
> Retrieval quality is the foundation of RAG. If the wrong documents are retrieved (low answer_relevance foundation), improving generation quality (faithfulness) provides limited gains because the LLM is working with suboptimal context. Fix retrieval first (embedding model, chunking, metadata filtering), then optimize generation (prompting, context ordering, chain type). They can be improved independently through different components of the pipeline.

---

## Vector Search & Embeddings (Questions 15–25)

---

## Question 15 *(Medium)*

**Question**: A developer creates a Vector Search index named `product_search_idx` on the endpoint `my_vs_endpoint`. They want to query it with the text "wireless noise-canceling headphones". Which SDK call is CORRECT?

A)

```python
index = vsc.get_index("my_vs_endpoint", "product_search_idx")
results = index.similarity_search(
    query_text="wireless noise-canceling headphones",
    columns=["product_id", "title", "description"],
    num_results=10
)
```

B)

```python
results = vsc.search(
    endpoint="my_vs_endpoint",
    index="product_search_idx",
    query="wireless noise-canceling headphones",
    top_k=10
)
```

C)

```python
index = vsc.get_index("product_search_idx")
results = index.query(query_text="wireless noise-canceling headphones", limit=10)
```

D)

```python
results = vsc.similarity_search("product_search_idx", "wireless noise-canceling headphones", k=10)
```

> [!success]- Answer
> **Correct Answer: A**
>
> The correct SDK pattern is: (1) `vsc.get_index(endpoint_name, index_name)`, (2) `index.similarity_search(query_text=..., columns=[...], num_results=...)`. Option B (`vsc.search()`), C (missing endpoint param, `.query()`), and D (`vsc.similarity_search()`) use non-existent SDK methods.

---

## Question 16 *(Easy)*

**Question**: A developer has a Direct Access Index and wants to update embedding for product ID `"prod-123"` with a new description. Which approach is CORRECT?

A) Delete `"prod-123"` from the index and insert it again as a new record  
B) Call `index.upsert()` with the new embedding data for `"prod-123"` — upsert handles both inserts and updates  
C) Rebuild the entire index from scratch with the updated embedding  
D) Call `index.update(id="prod-123", embedding=new_vector)` to update in place  

> [!success]- Answer
> **Correct Answer: B**
>
> `index.upsert()` handles both inserts (new IDs) and updates (existing IDs) in a single operation. If `"prod-123"` already exists, its embedding is replaced. Deleting and re-inserting is functionally correct but unnecessarily complex. Rebuilding the entire index is extremely inefficient. `index.update()` is not a valid Databricks Vector Search SDK method.

---

## Question 17 *(Medium)*

**Question**: A team indexes 2 million documents for a RAG pipeline on Databricks. They notice that new documents added to the source Delta table take over 30 minutes to appear in the index. How can they reduce the synchronization lag?

A) Rebuild the index from scratch with a higher replication factor  
B) Switch from `pipeline_type="TRIGGERED"` to `pipeline_type="CONTINUOUS"` to enable automatic incremental syncing  
C) Reduce the vector dimensionality to speed up indexing  
D) Increase the number of Vector Search endpoints  

> [!success]- Answer
> **Correct Answer: B**
>
> `pipeline_type="TRIGGERED"` requires manual sync initiation, which causes delays. Switching to `pipeline_type="CONTINUOUS"` enables automatic, low-latency incremental syncing whenever the Delta table changes. The 30-minute lag is consistent with manual-batch sync behavior. Vector dimensionality and endpoint count do not affect sync latency. Increasing replication improves query throughput, not sync speed.

---

## Question 18 *(Hard)*

**Question**: A team stores customer reviews as embeddings in a Vector Search index with metadata columns: `rating` (integer 1–5), `product_category` (string), and `verified_purchase` (boolean). A developer wants to find reviews most similar to "excellent battery life" where rating >= 4 AND verified_purchase = true. Which filter dictionary is CORRECT?

A) `filters={"rating": ">=4", "verified_purchase": "true"}`  
B) `filters={"rating": {"$gte": 4}, "verified_purchase": True}`  
C) `filters="rating >= 4 AND verified_purchase = true"`  
D) `filters=[("rating", ">=", 4), ("verified_purchase", "=", True)]`  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Vector Search uses MongoDB-style filter operators: `{"field": {"$gte": value}}` for numeric comparisons. Boolean values use Python `True`/`False`. Multiple conditions are separate keys in the filter dictionary. SQL strings and list-of-tuples formats are not valid SDK filter formats.

---

## Question 19 *(Medium)*

**Question**: A developer wants to use Databricks-hosted embeddings with their Delta Sync Index instead of self-managed embeddings. What must be specified during index creation to enable this?

A) `embedding_source_column` — the name of the text column to embed  
B) `embedding_vector_column` — the column containing pre-computed vectors  
C) `embedding_model` — the specific embedding model URI  
D) Both `embedding_source_column` AND the hosted embedding model endpoint name  

> [!success]- Answer
> **Correct Answer: D**
>
> To use Databricks-hosted embeddings with a Delta Sync Index, you specify: (1) `embedding_source_column` — the text column that should be embedded automatically, and (2) the embedding model endpoint (e.g., `embedding_model_endpoint_name="databricks-bge-large-en"`). This tells Databricks to automatically compute embeddings from the source text column at sync time. If using self-managed embeddings, you specify `embedding_vector_column` instead.

---

## Question 20 *(Medium)*

**Question**: A developer wants to store both the primary article text and a separate summary field in their Vector Search index, enabling queries to match either field. What is the CORRECT approach?

A) Create two separate Vector Search indexes — one for full text, one for summaries  
B) Create one index that embeds the summary; store the full text as a metadata column returned with results  
C) Concatenate summary and full text into a single field before embedding  
D) Use two separate query calls and merge results in Python  

> [!success]- Answer
> **Correct Answer: B**
>
> The most common approach is to embed the summary (which is more query-representative) and store the full article text as a metadata column. Retrieval is based on summary similarity, but the LLM receives the full text for generation. Two separate indexes require two queries and result merging. Concatenating long text + summary before embedding dilutes the embedding quality and may exceed the model's token limit.

---

## Question 21 *(Hard)*

**Question**: A team's Vector Search index was created 3 months ago. The source Delta table is unchanged but retrieval quality has degraded over time as the query distribution evolved. What is the MOST appropriate action?

A) Rebuild the index using a newer or more domain-adapted embedding model  
B) Switch from COSINE to L2 similarity metric  
C) Increase the `num_results` parameter to retrieve more candidates  
D) Add more worker nodes to the Vector Search endpoint  

> [!success]- Answer
> **Correct Answer: A**
>
> If query patterns have evolved and the embedding model is no longer well-aligned with how users ask questions, rebuilding with a newer or domain-adapted embedding model is the correct solution. Similarity metric changes and parameter tuning offer marginal improvements. Adding endpoint workers improves throughput and latency, not retrieval quality. The fundamental issue is model-query-document alignment.

---

## Question 22 *(Medium)*

**Question**: A developer has a Vector Search index with 500,000 documents. They need to delete all documents where `status = "archived"` (approximately 50,000 documents). Which is the MOST efficient approach?

A) Query for all archived document IDs, then call `index.delete(ids=[...])` in batches  
B) Drop and recreate the entire index from the source Delta table with archived records already removed  
C) Mark documents as `status = "inactive"` and filter them out at query time using metadata filters  
D) Use `index.upsert()` to overwrite archived documents with empty embedding vectors  

> [!success]- Answer
> **Correct Answer: A**
>
> For a Direct Access Index, deleting by ID in batches is the correct approach. For a Delta Sync Index, deleting from the source Delta table and letting sync propagate the deletions is equivalent. Option C (query-time filtering) is a valid workaround but does not remove the documents from the index (wastes storage and compute). Option B is efficient only for a complete rebuild; for 10% deletions, batch delete is faster. Empty embeddings are not semantically meaningful.

---

## Question 23 *(Medium)*

**Question**: A developer notices that querying their Vector Search index with `num_results=100` takes 3x longer than with `num_results=10`. Which statement BEST explains this behavior?

A) Larger `num_results` requires reading more data from Delta Lake storage  
B) Larger `num_results` requires the ANN algorithm to explore more of the graph structure to find additional neighbors  
C) The Vector Search endpoint has insufficient CPU cores to handle large result sets  
D) The `num_results` parameter directly controls the number of similarity computations performed  

> [!success]- Answer
> **Correct Answer: B**
>
> ANN algorithms like HNSW search a graph structure. Returning more results requires exploring more nodes and edges, increasing computation proportionally. CPU core count affects throughput at fixed `num_results`, not this scaling relationship. ANN does not perform exhaustive computation over all documents regardless of k.

---

## Question 24 *(Medium)*

**Question**: A developer creates an embedding with `databricks-gte-large-en` and queries the index with a French-language question, even though all indexed documents are in English. What is the MOST likely result?

A) The query fails because `databricks-gte-large-en` only accepts English input  
B) The query returns relevant English documents if `databricks-gte-large-en` supports multilingual embeddings; otherwise results will be poor  
C) Databricks Vector Search automatically translates the French query to English before embedding  
D) The query returns documents with the highest token overlap with the French query terms  

> [!success]- Answer
> **Correct Answer: B**
>
> Whether cross-lingual retrieval works depends entirely on whether the embedding model was trained on multilingual data. Some embedding models (e.g., multilingual-e5) support cross-lingual retrieval; others (English-only models) do not. `databricks-gte-large-en` is primarily an English model; cross-lingual retrieval quality would be poor. Databricks Vector Search does not perform automatic translation. There is no token overlap matching — Vector Search is purely vector-based.

---

## Question 25 *(Medium)*

**Question**: A team uses a Delta Sync Index with `pipeline_type="CONTINUOUS"`. They truncate and reload the source Delta table with 500,000 new rows (replacing the original 500,000 rows). What happens to the Vector Search index?

A) The index retains the old embeddings and only adds the 500,000 new documents  
B) The continuous sync detects the deletions and insertions, updating the index to reflect the new table state  
C) The index becomes corrupted and must be manually rebuilt  
D) Continuous mode only processes incremental additions; truncation requires switching to Triggered mode  

> [!success]- Answer
> **Correct Answer: B**
>
> A `CONTINUOUS` Delta Sync Index uses Delta Lake's change data feed to track all operations (inserts, updates, deletes). A truncate-and-reload generates deletion records for old rows and insertion records for new rows. The sync processes both automatically, resulting in an index matching the new table state.

---

## LLM Application Development (Questions 26–38)

---

## Question 26 *(Hard)*

**Question**: A developer uses few-shot prompting with 10 examples in the system prompt. The LLM starts ignoring the format demonstrated in the examples for complex inputs. Which intervention is MOST likely to help?

A) Increase the number of few-shot examples to 50  
B) Move the few-shot examples closer to the end of the system prompt (nearer to the user input) to leverage recency bias  
C) Switch from few-shot to zero-shot prompting  
D) Reduce the system prompt to only the most critical instruction  

> [!success]- Answer
> **Correct Answer: B**
>
> LLMs exhibit recency bias — content near the end of the context has more influence on output format. Moving examples closer to the user's input increases formatting adherence. Adding more examples increases context but doesn't fix position-based influence. Zero-shot removes demonstrations entirely.

---

## Question 27 *(Hard)*

**Question**: A developer builds a LangChain agent for a travel booking system. The agent has three tools: `search_flights`, `search_hotels`, `book_trip`. A user asks "Find me flight options to Paris next week?" The agent incorrectly calls `book_trip` instead of `search_flights`. What is the MOST likely root cause?

A) The `book_trip` tool's description is too similar to `search_flights`, causing the LLM to conflate them  
B) The LLM's temperature is set too high, causing random tool selection  
C) The agent is missing a `max_iterations` limit  
D) The user's query is too short for the LLM to parse intent  

> [!success]- Answer
> **Correct Answer: A**
>
> LangChain Agents use tool names and descriptions to select the appropriate tool. If `book_trip` has an ambiguous description (e.g., "Handles all travel-related requests"), the LLM may select it for queries that should route to `search_flights`. The fix is to write clear, distinct, non-overlapping tool descriptions that explicitly state what each tool does and does NOT do. Temperature affects randomness but not systematic misrouting. `max_iterations` prevents infinite loops, not misrouting.

---

## Question 28 *(Easy)*

**Question**: A developer builds a chatbot that supports both English and Spanish. The system prompt is in English. A user writes in Spanish. The LLM responds in English. How can the developer reliably ensure the LLM responds in the user's language?

A) Train a language detection classifier to preprocess inputs and route to language-specific prompts  
B) Add an instruction to the system prompt: "Always respond in the same language as the user's message"  
C) Deploy separate endpoints for English and Spanish users  
D) Set `language="auto"` in the Foundation Model API call  

> [!success]- Answer
> **Correct Answer: B**
>
> Adding a language mirroring instruction to the system prompt ("always respond in the same language the user writes in") is the simplest and most effective solution for modern instruction-following LLMs. Separate language-specific prompts add operational complexity. A preprocessing classifier adds latency and another failure mode. There is no `language="auto"` parameter in Foundation Model APIs.

---

## Question 29 *(Medium)*

**Question**: A developer logs a RAG chain with `mlflow.langchain.log_model(chain, "rag-chain", input_example={"query": "What is RAG?"})`. What is the PRIMARY benefit of providing `input_example`?

A) It enables the model to be tested during the logging call  
B) It is used to infer and record the model's input/output schema (signature), enabling better validation at serving time  
C) It stores a sample query in the model artifact for documentation purposes only  
D) It pre-warms the model's cache for faster first-query response at serving time  

> [!success]- Answer
> **Correct Answer: B**
>
> `input_example` is used by MLflow to infer the model's signature (input and output schema). The inferred signature is stored with the model artifact and used by Model Serving to validate input formats at serving time, providing clearer error messages for malformed requests. It does not execute the model during logging. It is not purely for documentation — the signature has functional impact on serving validation.

---

## Question 30 *(Hard)*

**Question**: A developer is building a RAG pipeline and must choose between `chain_type="stuff"` and `chain_type="map_reduce"` in LangChain's `RetrievalQA`. Their typical query retrieves 10 chunks of 512 tokens each (5120 tokens total). The LLM has a 4096-token context window. Which chain type is REQUIRED?

A) `"stuff"` — concatenate all retrieved chunks into one LLM call  
B) `"map_reduce"` — process each chunk independently, then reduce  
C) `"refine"` — iteratively refine the answer  
D) Either `"stuff"` or `"map_reduce"` — both fit within the context window  

> [!success]- Answer
> **Correct Answer: B**
>
> With 10 chunks × 512 tokens = 5120 tokens of retrieved context, plus the system prompt and question, the total exceeds a 4096-token context window. `"stuff"` requires all content in a single prompt, which would fail. `"map_reduce"` processes each chunk in a separate LLM call (map phase), then combines the intermediate answers (reduce phase), fitting within the context window. `"refine"` is another option for long contexts but processes chunks sequentially.

---

## Question 31 *(Hard)*

**Question**: A developer wants to ensure that every LangChain chain call logs a custom metadata field `session_id` to MLflow for request tracing. Which approach is MOST appropriate?

A) Call `mlflow.set_tag("session_id", value)` before each chain invocation  
B) Use a custom `MLflowCallbackHandler` to log the session_id tag during chain execution  
C) Add `session_id` as an extra key to the chain's input dictionary  
D) Set `MLFLOW_RUN_ID` environment variable to the session_id value  

> [!success]- Answer
> **Correct Answer: B**
>
> A custom `BaseCallbackHandler` (or `MLflowCallbackHandler`) can be passed as a callback to chain invocations to log custom metadata during execution. Callbacks have access to the run context and can call `mlflow.set_tag()` at the appropriate lifecycle events. `mlflow.set_tag()` called before the chain runs works if inside an active run context, but a callback is the more robust pattern for per-invocation tracing. Adding `session_id` to the input dict changes the chain's input schema.

---

## Question 32 *(Hard)*

**Question**: A developer uses a LangChain `RetrievalQA` chain and after debugging finds that the quality of answers depends heavily on the ORDER in which retrieved chunks are placed in the prompt. Specifically, the most relevant chunk in the middle of the context produces worse answers than when placed first. What does this represent?

A) A vector index configuration problem  
B) The "lost in the middle" problem — LLMs attend less to content in the middle of long contexts  
C) An embedding model dimension mismatch  
D) A temperature calibration issue  

> [!success]- Answer
> **Correct Answer: B**
>
> The "lost in the middle" phenomenon is well-documented: LLMs tend to attend most strongly to content at the beginning and end of long contexts, and content in the middle is sometimes underweighted. The fix is to place the most relevant retrieved chunks at the beginning or end of the context, not in the middle. This is a context ordering strategy, not an indexing or model configuration issue.

---

## Question 33 *(Medium)*

**Question**: A developer calls an external weather API from within a LangChain agent tool. The API occasionally returns HTTP 429 (rate limit exceeded) errors. How should the tool handle this?

A) Let the exception propagate to the agent — the LLM will automatically retry  
B) Implement exponential backoff retry logic within the tool function; return an informative message to the LLM if retries are exhausted  
C) Set a very long timeout on the API call to avoid the error  
D) Cache all weather API responses forever to avoid repeated calls  

> [!success]- Answer
> **Correct Answer: B**
>
> Tool functions should implement robust error handling including retry logic with exponential backoff for transient errors like rate limits. If retries are exhausted, the tool should return a descriptive error message to the LLM so it can communicate the failure to the user gracefully. LangChain agents do not automatically retry failed tool calls. Long timeouts do not prevent rate limit errors. Caching weather data forever would return stale results.

---

## Question 34 *(Hard)*

**Question**: A developer evaluates their RAG pipeline using `mlflow.evaluate()`. The evaluation dataset has 200 rows but `mlflow.evaluate()` completes in 5 seconds — suspiciously fast for LLM-judge metrics. What is the MOST likely explanation?

A) The evaluation is running on GPU hardware  
B) The evaluation used cached results from a previous run  
C) The LLM-judge metrics were not correctly specified and fell back to non-LLM metrics only  
D) The model's predict function is returning cached responses  

> [!success]- Answer
> **Correct Answer: C**
>
> LLM-as-judge metrics require calling an LLM for each evaluation row, which takes several seconds per row — at least several minutes for 200 rows. If `mlflow.evaluate()` completes in 5 seconds, it likely ran only non-LLM metrics (e.g., exact match, string similarity), meaning the LLM-judge metrics were not correctly configured or the `extra_metrics` parameter was not properly specified. Check the logged metrics to confirm whether faithfulness, answer_relevance, etc. appear.

---

## Question 35 *(Medium)*

**Question**: An organization deploys a RAG chatbot for internal employees. They use `ConversationSummaryMemory` to maintain context across a long session. After 30 turns, a user asks about a topic mentioned in turn 3. Which problem is MOST likely to occur?

A) The chain raises an out-of-memory error  
B) Specific details from turn 3 may have been lost in summarization and the LLM cannot recall them accurately  
C) The LLM generates an error because the summary exceeds the context window  
D) The embedding model re-indexes the conversation history automatically  

> [!success]- Answer
> **Correct Answer: B**
>
> `ConversationSummaryMemory` compresses history into summaries. Specific details and precise wording from early turns (like turn 3) are often lost. The LLM may recall the general topic but not exact facts. For precise recall, `ConversationBufferMemory` or vector-based memory is more appropriate.

---

## Question 36 *(Medium)*

**Question**: A developer builds a multi-step LangChain pipeline where Step 1 generates search queries and Step 2 retrieves documents using those queries. The developer wants each step's outputs to be logged separately to MLflow for debugging. Which approach enables this?

A) Call `mlflow.log_param()` after each step with the step output  
B) Use `mlflow.langchain.autolog()` with `log_traces=True` to capture each chain step as a trace span  
C) Log two separate MLflow runs — one per step  
D) Use `mlflow.set_tag("step1_output", ...)` to store intermediate results  

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.langchain.autolog(log_traces=True)` enables MLflow Tracing, which captures each chain step as a separate trace span with its inputs and outputs. This provides full observability into multi-step pipelines without modifying chain code. Separate runs break the logical grouping of the pipeline. `log_param` is for configuration values, not structured trace data. Tags are string key-value pairs, not suitable for structured intermediate outputs.

---

## Question 37 *(Medium)*

**Question**: A developer wants to load a LangChain chain that was logged with `mlflow.langchain.log_model()` and make predictions programmatically. The model URI is `runs:/abc123/rag-chain`. Which code produces a callable `.predict()` interface?

A)

```python
chain = mlflow.langchain.load_model("runs:/abc123/rag-chain")
result = chain.invoke({"query": "What is RAG?"})
```

B)

```python
model = mlflow.pyfunc.load_model("runs:/abc123/rag-chain")
result = model.predict({"query": "What is RAG?"})
```

C)

```python
model = mlflow.models.load_model("runs:/abc123/rag-chain")
result = model({"query": "What is RAG?"})
```

D) Both A and B are valid  

> [!success]- Answer
> **Correct Answer: D**
>
> Both are valid approaches. `mlflow.langchain.load_model()` loads the native LangChain chain object (use `.invoke()` or `.run()` per LangChain API). `mlflow.pyfunc.load_model()` loads it as a pyfunc wrapper (use `.predict()` per MLflow pyfunc API). Both work with the same artifact URI. Option C uses `mlflow.models.load_model()` which is not a valid MLflow Python API method.

---

## Question 38 *(Medium)*

**Question**: A developer wants to compare two RAG prompting strategies across 50 test questions using MLflow. Strategy A uses a concise system prompt; Strategy B uses a detailed, multi-paragraph system prompt. What is the CORRECT MLflow pattern?

A) Log both strategies as tags on a single run, then compare within that run  
B) Create two separate MLflow runs (one per strategy) within the same experiment, evaluating with `mlflow.evaluate()` per run, then compare runs in the experiment UI  
C) Create two separate experiments, one per strategy  
D) Log the strategies as model versions in the Model Registry and compare their evaluation metrics  

> [!success]- Answer
> **Correct Answer: B**
>
> Each strategy should be a separate MLflow run within the same experiment, with `mlflow.evaluate()` logging standardized metrics (faithfulness, answer_relevance, etc.) for each. The experiment comparison UI then enables direct side-by-side metric comparison. Separate experiments cannot be directly compared in the MLflow UI. Logging both strategies as tags in one run conflates results. Model Registry is for versioning deployable models, not for A/B strategy comparison.

---

## Databricks GenAI Tools (Questions 39–45)

---

## Question 39 *(Medium)*

**Question**: A developer calls the `databricks-meta-llama-3-1-70b-instruct` endpoint using the OpenAI Python client pointed at the Databricks host. The call succeeds during development but fails in production with a 401 Unauthorized error. What is the MOST likely cause?

A) The model name is incorrect for the Databricks endpoint  
B) The production environment is using an expired or missing Databricks authentication token  
C) The endpoint does not support the OpenAI client library  
D) The model is not available in the production workspace region  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Foundation Model APIs require authentication via a Databricks PAT (personal access token) or service principal OAuth token. A 401 Unauthorized error indicates missing or expired credentials. In production, the OpenAI client `api_key` parameter must be set to a valid Databricks token. Databricks Foundation Model endpoints are OpenAI-compatible and support the OpenAI client. Endpoint name and regional availability issues produce different error codes.

---

## Question 40 *(Medium)*

**Question**: A team deploys a LangChain RAG chain to a Databricks Model Serving endpoint. Endpoint logs show frequent cold start latencies of 60–90 seconds for the first request after idle periods. What is the MOST appropriate solution for a customer-facing production app?

A) Switch to a Provisioned Throughput endpoint which does not scale to zero  
B) Increase the number of tokens in the LLM's context window  
C) Rebuild the vector index with a smaller embedding dimension  
D) Reduce the LangChain chain complexity by removing the reranker  

> [!success]- Answer
> **Correct Answer: A**
>
> Model Serving endpoints can scale to zero when idle, causing cold start latency when traffic resumes. Provisioned Throughput endpoints maintain minimum replicas (do not scale to zero), eliminating cold start delays. This is the standard solution for latency-sensitive production applications. Context window size, vector dimensionality, and chain complexity are not related to cold start latency.

---

## Question 41 *(Hard)*

**Question**: A team wants to monitor their deployed RAG chatbot for data drift — specifically detecting when user query topics shift significantly from the training distribution. What is the CORRECT Databricks approach?

A) Use Databricks Lakehouse Monitoring on the inference table with a `TimeSeries` monitor to detect query distribution drift over time  
B) Create an MLflow experiment alert that fires when `faithfulness` drops below 0.80  
C) Enable Vector Search index auto-refresh to detect new query patterns  
D) Use a Databricks Job to compute cosine similarity between new queries and training queries weekly  

> [!success]- Answer
> **Correct Answer: A**
>
> Inference tables log all requests and responses to a Delta table. Databricks Lakehouse Monitoring with a `TimeSeries` monitor can detect statistical drift in the query (input) distribution over time using metrics like population stability index (PSI). This is the purpose-built Databricks solution for serving-time data drift monitoring. MLflow alerts are not a real-time monitoring mechanism. Vector Search index refresh and manual similarity computation are not drift monitoring solutions.

---

## Question 42 *(Medium)*

**Question**: An engineer needs to enable multiple teams to call the same Foundation Model endpoint with different rate limits per team. Which Databricks component provides this capability?

A) Cluster policies — limit compute per team  
B) Unity Catalog permissions — restrict endpoint access per team  
C) MLflow AI Gateway — configure per-route rate limits for different teams or API keys  
D) Databricks Secrets — store per-team API keys with different expiration times  

> [!success]- Answer
> **Correct Answer: C**
>
> MLflow AI Gateway supports per-route configuration including rate limits (requests per minute, tokens per minute). Routes can be configured for different teams or use cases, each with their own rate limit policies. Cluster policies govern cluster configuration, not LLM API access. Unity Catalog governs data and model access but not per-team LLM rate limits. Secrets store credentials but do not implement rate limiting.

---

## Question 43 *(Medium)*

**Question**: A team logs their RAG chain and evaluation results to MLflow. They want to register the chain as a model version and add a description explaining the chunking strategy used. Which MLflow API accomplishes this?

A) `mlflow.log_param("chunking_strategy", "recursive-512-overlap-50")`  
B)

```python
client = MlflowClient()
client.update_model_version(
    name="rag-chain",
    version=1,
    description="Recursive chunking, 512 tokens, 50-token overlap"
)
```

C) `mlflow.set_tag("chunking_strategy", "recursive-512-overlap-50")`  
D) `mlflow.register_model(model_uri, "rag-chain", description="...")`  

> [!success]- Answer
> **Correct Answer: B**
>
> `MlflowClient.update_model_version()` updates the description of a specific model version in the Model Registry. This is the correct API for adding human-readable descriptions to registered models. `mlflow.log_param()` and `mlflow.set_tag()` log to runs, not to model registry versions. `mlflow.register_model()` does not accept a `description` parameter in the Python API (description is set separately after registration).

---

## Question 44 *(Hard)*

**Question**: A developer deployed a RAG chain to Model Serving and enabled inference tables. They query the inference table and see rows where `response` is `null` and `status_code` is `500`. What does this indicate and how should it be investigated?

A) The endpoint returned HTTP 200 but the response body was empty  
B) The endpoint encountered internal errors (server-side failures) for those requests — examine endpoint logs for stack traces  
C) The inference table schema is misconfigured  
D) The client sent malformed requests with null payloads  

> [!success]- Answer
> **Correct Answer: B**
>
> HTTP 500 status codes indicate server-side errors in the model serving endpoint. The inference table correctly records the status code alongside the null response for failed requests. To diagnose, examine the Model Serving endpoint logs (accessible via the endpoint events tab in the Databricks UI or via REST API) for exception messages and stack traces. This could indicate issues with the chain code, dependency failures (e.g., Vector Search connectivity), or resource exhaustion.

---

## Question 45 *(Hard)*

**Question**: A team is deciding between MLflow AI Gateway and direct Foundation Model API calls for their multi-team organization. Which scenario makes MLflow AI Gateway the CLEARLY better choice?

A) A single data scientist prototyping a RAG pipeline in a notebook  
B) An organization with 10 teams, multiple LLM providers, centralized credential management requirements, and per-team rate limit policies  
C) A batch inference job that runs once per day on a fixed dataset  
D) A developer who needs the absolute lowest latency for a single high-traffic endpoint  

> [!success]- Answer
> **Correct Answer: B**
>
> MLflow AI Gateway adds the most value in multi-team, multi-provider scenarios where centralized credential management, unified API abstraction, and per-team rate limiting are needed. A single data scientist in a notebook has no need for the gateway's organizational features. Batch jobs benefit from direct API calls (no gateway overhead). The gateway adds a network hop that increases latency — direct API calls are faster for single-endpoint, latency-critical applications.

---

**End of Mock Exam 2 — 45 Questions**

[← Back to Mock Exam 2 Instructions](./README.md) | [← Mock Exam 1](../mock-exam/questions.md)

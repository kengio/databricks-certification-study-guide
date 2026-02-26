---
title: Practice Questions — Vector Search & Embeddings
type: practice-questions
tags: [genai-engineer-associate, practice-questions, vector-search, embeddings]
status: published
---

# Practice Questions — Vector Search & Embeddings (Domain 2)

12 questions covering embedding models, Databricks Vector Search index types, similarity metrics, and querying APIs.

[← RAG Architecture](./01-rag-architecture.md) | [Next: LLM Application Development →](./03-llm-application-development.md)

---

## Question 1 *(Medium)*: Embedding Model Consistency

**Question**: A team creates a Databricks Vector Search index using `databricks-bge-large-en` embeddings. Six months later, they want to query the index using `databricks-gte-large-en`. What will happen?

A) The query will succeed because both models produce 1024-dimensional vectors  
B) The query will return meaningless results because the models produce vectors in different semantic spaces  
C) Databricks Vector Search automatically converts embeddings between models  
D) The query will fail with a dimension mismatch error  

> [!success]- Answer
> **Correct Answer: B**
>
> Embedding models must be consistent between indexing and querying. Even if two models produce vectors of the same dimensionality, they are trained differently and represent semantics in different vector spaces. Querying with a different model returns cosine similarities that are meaningless because the spaces are incompatible. Databricks Vector Search does not perform automatic embedding conversion.

---

## Question 2 *(Easy)*: Delta Sync vs Direct Access Index

**Question**: A data engineering team already has a managed Delta table of product descriptions that is updated nightly via a Delta Live Tables pipeline. They want to build a Vector Search index on this table with minimal operational overhead. Which index type should they use?

A) Direct Access Index — gives full programmatic control over upsert operations  
B) Delta Sync Index — automatically syncs from the source Delta table  
C) Managed Index — Databricks automatically selects the index type based on data volume  
D) Delta Merge Index — merges vector updates with Delta table changes in real time  

> [!success]- Answer
> **Correct Answer: B**
>
> A Delta Sync Index automatically detects changes in the source Delta table and syncs them to the vector index. This is ideal when data already lives in a managed Delta table, as it eliminates the need to write custom sync pipelines. A Direct Access Index requires the application to explicitly call upsert APIs to add or update vectors. "Managed Index" and "Delta Merge Index" are not valid Databricks Vector Search index types.

---

## Question 3 *(Easy)*: Direct Access Index Use Case

**Question**: A team builds a real-time customer support system where embeddings are computed in a custom preprocessing pipeline before being stored. Which Databricks Vector Search index type should they use?

A) Delta Sync Index with continuous sync enabled  
B) Direct Access Index — supports manual upsert via SDK  
C) Streaming Index — designed for real-time vector updates  
D) Delta Sync Index with triggered sync enabled  

> [!success]- Answer
> **Correct Answer: B**
>
> Direct Access Indexes allow applications to programmatically upsert vectors using the Python SDK or REST API. This is the right choice when embeddings are computed externally (outside of Databricks Vector Search) and pushed in. Delta Sync Indexes only work when the source is a Databricks-managed Delta table. "Streaming Index" is not a valid type.

---

## Question 4 *(Hard)*: Cosine Similarity vs L2 Distance

**Question**: A team has two options for their vector similarity metric: cosine similarity or L2 distance. Their embedding model outputs L2-normalized unit vectors. Which metric will produce EQUIVALENT results and why?

A) L2 distance — magnitude is irrelevant when vectors are normalized  
B) Cosine similarity — it always outperforms L2 for text embeddings  
C) Cosine similarity and L2 distance are equivalent for L2-normalized unit vectors  
D) Dot product — it is always preferred over both cosine and L2  

> [!success]- Answer
> **Correct Answer: C**
>
> For L2-normalized unit vectors (magnitude = 1), cosine similarity and L2 distance measure the same geometric relationship. Cosine similarity = 1 − (L2² / 2) for unit vectors, so rankings produced by both metrics are equivalent. Most modern embedding models output normalized vectors, making both metrics interchangeable in practice.

---

## Question 5 *(Easy)*: Querying a Vector Search Index

**Question**: A developer wants to retrieve the top 5 most similar product descriptions to a user query using the Databricks Vector Search Python SDK. Which method call is correct?

A) `index.search(query_text="user query", top_k=5)`  
B) `index.similarity_search(query_text="user query", columns=["id", "text"], num_results=5)`  
C) `index.query(text="user query", k=5, return_fields=["id"])`  
D) `index.find_similar(input="user query", limit=5)`  

> [!success]- Answer
> **Correct Answer: B**
>
> The Databricks Vector Search Python SDK uses `index.similarity_search(query_text=..., columns=[...], num_results=...)`. The `columns` parameter specifies which metadata columns to return alongside similarity scores. The other method signatures (`search`, `query`, `find_similar`) are not valid Vector Search SDK methods.

---

## Question 6 *(Medium)*: Embedding Dimensionality

**Question**: A team compares two embedding models: Model A produces 768-dimensional vectors and Model B produces 1536-dimensional vectors. Which statement is MOST accurate?

A) Model B always produces better retrieval quality because higher dimensions capture more information  
B) Higher dimensionality increases storage and compute costs; quality depends on the model's training, not just dimension count  
C) Model A is always faster at search regardless of hardware or index type  
D) Dimensionality must match the LLM's hidden size for compatibility  

> [!success]- Answer
> **Correct Answer: B**
>
> Higher dimensionality does not automatically imply better quality. Some well-trained 768-dimensional models outperform poorly-trained 1536-dimensional models. Higher dimensions do increase storage (index size) and query latency costs. Embedding dimensionality has no requirement to match the LLM's hidden size; they are independent components of a RAG architecture.

---

## Question 7 *(Medium)*: Metadata Filtering in Vector Search

**Question**: A developer queries a Vector Search index to find support articles similar to a user's question, but only from the `billing` category. Which SDK call correctly applies this filter?

A) `index.similarity_search(query_text="...", num_results=5, filters="category = 'billing'")`  
B) `index.similarity_search(query_text="...", num_results=5, filters={"category": "billing"})`  
C) `index.similarity_search(query_text="...", num_results=5, where="category = billing")`  
D) `index.similarity_search(query_text="...", num_results=5, metadata_filter=["category:billing"])`  

> [!success]- Answer
> **Correct Answer: B**
>
> The Databricks Vector Search SDK accepts metadata filters as a dictionary: `filters={"column_name": "value"}`. This pre-filters the index before computing similarity, which is more efficient than post-filtering. The other formats (`filters` as a SQL string, `where`, `metadata_filter` as a list) are not valid SDK parameters for Databricks Vector Search.

---

## Question 8 *(Medium)*: Sparse vs Dense Embeddings

**Question**: A developer is evaluating BM25 (sparse) vs. text embedding models (dense) for a technical documentation search system. For which query type does BM25 have a distinct advantage over dense embeddings?

A) Queries about conceptual relationships (e.g., "how does gradient descent work?")  
B) Queries containing rare technical identifiers (e.g., "error code ERR_SOCKET_TIMEOUT_4092")  
C) Queries requiring cross-language understanding  
D) Queries that require reasoning across multiple document sections  

> [!success]- Answer
> **Correct Answer: B**
>
> BM25 excels at exact term matching, making it ideal for rare tokens, product codes, error codes, and proper nouns that are unlikely to have been seen during embedding model training. Dense embeddings excel at semantic and conceptual queries. For queries requiring reasoning across sections or cross-language understanding, dense embeddings are generally preferred.

---

## Question 9 *(Easy)*: Vector Search Index Sync Modes

**Question**: A Delta Sync Index is configured with `pipeline_type="TRIGGERED"`. What does this mean for the index synchronization behavior?

A) The index is updated in real time as rows are inserted into the Delta table  
B) The index sync must be manually triggered via the API or UI; it does not update automatically  
C) The index is rebuilt from scratch every 24 hours on a fixed schedule  
D) The index updates only when Databricks detects a data quality issue in the source table  

> [!success]- Answer
> **Correct Answer: B**
>
> A `TRIGGERED` pipeline requires the user to explicitly start a sync (via the Databricks UI, REST API, or SDK) each time they want the index updated. In contrast, `CONTINUOUS` pipeline type keeps the index synchronized automatically whenever the Delta table changes. Triggered mode is appropriate when freshness requirements are relaxed and cost control is important.

---

## Question 10 *(Hard)*: Embedding-Based Retrieval Failure Mode

**Question**: A RAG pipeline returns irrelevant documents when users ask questions that use technical abbreviations unfamiliar to the embedding model (e.g., "What is the SLA for P1 incidents?"). What is the MOST effective mitigation?

A) Increase the top-k from 3 to 20 to improve recall  
B) Expand abbreviations in the query before embedding (query preprocessing / expansion)  
C) Switch from cosine similarity to dot product similarity  
D) Reduce chunk size to 64 tokens for more granular matching  

> [!success]- Answer
> **Correct Answer: B**
>
> Query expansion or preprocessing — replacing abbreviations with their full forms or adding synonyms — improves embedding quality for out-of-vocabulary terms. Embedding models struggle with rare abbreviations because they may not have seen them during training. Increasing k helps recall but not precision for semantically mismatched queries. Similarity metric and chunk size changes do not address OOV (out-of-vocabulary) problems.

---

## Question 11 *(Medium)*: Cross-Encoder vs Bi-Encoder

**Question**: A developer compares bi-encoder (dual encoder) models used in vector search with cross-encoder models used in reranking. Which statement is CORRECT?

A) Bi-encoders jointly process query and document pairs for higher accuracy; cross-encoders encode each separately for speed  
B) Cross-encoders jointly encode query and document pairs for higher accuracy; bi-encoders encode each separately for speed  
C) Both architectures produce the same quality results; the choice is only about storage cost  
D) Cross-encoders are used for indexing; bi-encoders are used for query-time reranking  

> [!success]- Answer
> **Correct Answer: B**
>
> Bi-encoders encode queries and documents independently, producing separate vectors that can be compared by dot product or cosine similarity. This enables fast retrieval over large indexes. Cross-encoders take query-document pairs as joint input, producing a relevance score with much higher accuracy — but at the cost of needing to score each candidate pair individually. This is why cross-encoders are used in reranking (applied to a small candidate set), not for initial large-scale retrieval.

---

## Question 12 *(Easy)*: Vector Search Endpoint

**Question**: Before creating a Databricks Vector Search index, what resource must exist?

A) An MLflow experiment to track index creation  
B) A Unity Catalog schema to store vector metadata  
C) A Vector Search endpoint to serve the index  
D) A Feature Store table to back the index  

> [!success]- Answer
> **Correct Answer: C**
>
> A Databricks Vector Search endpoint is a compute resource that hosts one or more Vector Search indexes. The endpoint must be created before any index can be created or queried. The endpoint handles the serving infrastructure. MLflow experiments and Feature Store tables are not prerequisites for Vector Search.

---

**[← Previous: Practice Questions — RAG Architecture](./01-rag-architecture.md) | [↑ Back to Practice Questions — GenAI Engineer Associate](./README.md) | [Next: Practice Questions — LLM Application Development](./03-llm-application-development.md) →**

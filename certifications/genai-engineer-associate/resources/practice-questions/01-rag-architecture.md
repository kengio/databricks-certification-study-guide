---
title: Practice Questions — RAG Architecture
type: practice-questions
tags: [genai-engineer-associate, practice-questions, rag-architecture]
status: published
---

# Practice Questions — RAG Architecture (Domain 1)

15 questions covering RAG design patterns, chunking strategies, retrieval methods, and RAG evaluation.

[← Back to Practice Questions](./README.md) | [Next: Vector Search & Embeddings →](./02-vector-search-embeddings.md)

---

## Question 1 *(Easy)*: RAG vs Fine-Tuning

**Question**: A company has a large proprietary document repository that is updated weekly with new reports. They want an LLM that can answer questions using the latest documents. Which approach is BEST?

A) Fine-tune an LLM monthly on the entire document corpus  
B) Implement a RAG pipeline that retrieves relevant documents at query time  
C) Embed all documents into the LLM's context window at inference time  
D) Train a custom embedding model on the proprietary corpus  

> [!success]- Answer
> **Correct Answer: B**
>
> RAG is the correct choice when knowledge changes frequently. Fine-tuning requires retraining whenever data changes, which is expensive and slow. Embedding all documents into the context window is not feasible because modern documents far exceed context window limits. Training a custom embedding model is optional hardening, not a replacement for a retrieval pipeline.

---

## Question 2 *(Medium)*: Chunking Strategy Selection

**Question**: A data engineer is chunking 100-page PDF financial reports for a RAG pipeline. The reports contain dense paragraphs with no consistent headers. Which chunking strategy is MOST appropriate?

A) Fixed-size chunking with no overlap  
B) Chunking by page (one chunk per PDF page)  
C) Recursive character text splitting with overlap  
D) Sentence-level chunking using punctuation delimiters only  

> [!success]- Answer
> **Correct Answer: C**
>
> Recursive character text splitting respects natural text boundaries (paragraphs, sentences, words in priority order) and uses overlap to avoid losing context at boundaries. Fixed-size chunking with no overlap risks splitting mid-sentence. Page-level chunking produces chunks too large for most embedding models and context windows. Sentence-level chunking alone may produce chunks too short to contain useful context.

---

## Question 3 *(Medium)*: Chunk Size Trade-Off

**Question**: A team is building a RAG pipeline and debates whether to use small chunks (128 tokens) or large chunks (1024 tokens). Which statement BEST describes the trade-off?

A) Smaller chunks always improve answer quality because they reduce noise  
B) Larger chunks always improve answer quality because they include more context  
C) Smaller chunks improve retrieval precision; larger chunks preserve more context but may include irrelevant content  
D) Chunk size only affects indexing speed and has no impact on retrieval quality  

> [!success]- Answer
> **Correct Answer: C**
>
> Smaller chunks are easier to match precisely to specific questions (higher retrieval precision), but they may not contain enough surrounding context for the LLM to generate a complete answer. Larger chunks preserve more context but risk including unrelated content that confuses the LLM. The optimal chunk size depends on document structure and question type.

---

## Question 4 *(Easy)*: Chunk Overlap Purpose

**Question**: A team configures their chunking pipeline with a chunk size of 512 tokens and an overlap of 50 tokens. What is the PRIMARY purpose of the 50-token overlap?

A) To improve indexing throughput by reducing the total number of chunks  
B) To ensure context at chunk boundaries is available in adjacent chunks  
C) To store metadata about the source document for filtering  
D) To increase embedding vector dimensionality for better retrieval  

> [!success]- Answer
> **Correct Answer: B**
>
> Overlap ensures that content near the boundary of one chunk also appears at the beginning of the next chunk. This prevents important information that spans a boundary from being lost or split across chunks without context. Overlap does not affect indexing speed, dimensionality, or metadata.

---

## Question 5 *(Medium)*: Dense vs Sparse Retrieval

**Question**: A RAG system for a medical knowledge base must retrieve documents that contain both a specific drug name (exact term match) and semantically related conditions. Which retrieval approach is BEST?

A) Dense retrieval only — embedding similarity captures all relationships  
B) Sparse retrieval only — BM25 keyword matching handles exact terms  
C) Hybrid retrieval combining dense and sparse methods  
D) Keyword filtering on the metadata field before dense retrieval  

> [!success]- Answer
> **Correct Answer: C**
>
> Hybrid retrieval combines dense (embedding-based) retrieval for semantic similarity with sparse (BM25/keyword) retrieval for exact term matching. This is ideal when exact terms (drug names, IDs) must be matched precisely alongside semantic understanding. Dense-only retrieval can miss exact term emphasis; sparse-only misses semantic relationships.

---

## Question 6 *(Medium)*: Retrieval Precision vs Recall

**Question**: A RAG pipeline uses top-k retrieval with k=3 and has low answer quality because the correct document is often not in the top 3. What adjustment should be made FIRST?

A) Decrease k to 2 to reduce noise in the context  
B) Increase k to retrieve more candidates, then apply reranking  
C) Switch from cosine similarity to L2 distance  
D) Reduce the chunk size to 64 tokens  

> [!success]- Answer
> **Correct Answer: B**
>
> When the correct document is not retrieved (low recall), increasing k retrieves more candidates. Adding a reranker then improves precision by re-scoring the larger candidate set. Decreasing k worsens recall further. Switching similarity metrics does not address recall if the correct document is not being retrieved at all. Smaller chunks would affect granularity, not fix the retrieval recall problem.

---

## Question 7 *(Easy)*: Reranking Purpose

**Question**: A RAG pipeline retrieves the top 20 documents using vector similarity, then applies a cross-encoder reranker before passing the top 5 to the LLM. What is the PRIMARY benefit of reranking?

A) Reranking converts vector embeddings into token sequences for the LLM  
B) Reranking improves retrieval precision by using a more accurate relevance model on the candidate set  
C) Reranking filters out documents with low embedding dimensionality  
D) Reranking reduces indexing time by pre-sorting the vector database  

> [!success]- Answer
> **Correct Answer: B**
>
> Cross-encoder rerankers are more accurate than bi-encoder similarity (used in vector search) because they jointly encode the query and each document. The two-stage approach (broad retrieval → precise reranking) balances recall and precision. Reranking has no effect on indexing, dimensionality, or token conversion.

---

## Question 8 *(Easy)*: RAG Faithfulness Metric

**Question**: After deploying a RAG pipeline, an evaluation reveals that the LLM frequently makes statements not supported by the retrieved documents. Which metric BEST captures this problem?

A) Answer relevance — measures whether the answer addresses the question  
B) Retrieval recall — measures whether the correct documents are retrieved  
C) Faithfulness — measures whether the answer is grounded in the retrieved context  
D) Perplexity — measures the fluency of generated text  

> [!success]- Answer
> **Correct Answer: C**
>
> Faithfulness (also called groundedness) measures whether every claim in the generated answer can be attributed to the retrieved context. When the LLM hallucinates facts not in the retrieved documents, faithfulness is low. Answer relevance measures question alignment, not factual grounding. Retrieval recall measures retrieval quality, not generation quality. Perplexity measures fluency, not factual accuracy.

---

## Question 9 *(Medium)*: RAG vs Fine-Tuning — Style Adaptation

**Question**: A company wants an LLM to respond exclusively in formal legal prose and adopt their firm's preferred citation format. The knowledge content itself is unchanged. Which approach is MOST appropriate?

A) Implement RAG with a collection of formal legal document examples  
B) Fine-tune the LLM on examples of responses in the desired style  
C) Increase the system prompt length with detailed style instructions  
D) Use a larger embedding model with higher dimensionality  

> [!success]- Answer
> **Correct Answer: B**
>
> Fine-tuning is best for changing the model's **style, tone, and format** when the underlying knowledge is already present in the model. RAG adds external knowledge but does not reliably change response format. System prompts can influence style but are less robust than fine-tuning for strict format requirements. Embedding model size is irrelevant to generation style.

---

## Question 10 *(Medium)*: Context Window Management

**Question**: A RAG pipeline retrieves top-20 chunks, each 512 tokens. The LLM has a 4096-token context window. Which scenario will cause the pipeline to FAIL?

A) Using the same embedding model for indexing and querying  
B) Passing all 20 chunks (10,240 tokens) plus the system prompt to the LLM  
C) Using cosine similarity for retrieval instead of L2 distance  
D) Storing chunk metadata in the vector index alongside embeddings  

> [!success]- Answer
> **Correct Answer: B**
>
> 20 chunks × 512 tokens = 10,240 tokens, which exceeds the 4096-token context window. This causes the LLM API call to fail or silently truncate input. The solution is to reduce k (e.g., top-5), use smaller chunks, or use an LLM with a larger context window. Embedding model consistency, similarity metric choice, and metadata storage do not cause context window failures.

---

## Question 11 *(Medium)*: HyDE Retrieval

**Question**: A RAG system uses Hypothetical Document Embeddings (HyDE). What does this technique involve?

A) Generating multiple hypothetical questions from each document chunk during indexing  
B) Using the LLM to generate a hypothetical answer, then embedding that answer to retrieve similar real documents  
C) Creating synthetic training data by hypothetically augmenting sparse documents  
D) Replacing missing metadata with hypothetical values inferred from document content  

> [!success]- Answer
> **Correct Answer: B**
>
> HyDE transforms the user's query by asking the LLM to generate a hypothetical answer document. That hypothetical answer is then embedded and used as the retrieval query. Because the hypothetical answer is in "answer space" rather than "question space," it may be closer to real answer documents in the vector space, improving retrieval quality for complex queries.

---

## Question 12 *(Easy)*: Multi-Query Retrieval

**Question**: A team implements multi-query retrieval in their RAG pipeline. What does this technique do?

A) Sends the same query to multiple vector databases and merges results  
B) Uses the LLM to generate multiple paraphrases of the original query, retrieves for each, and unions the results  
C) Splits the user query into multiple sub-queries using punctuation delimiters  
D) Indexes each document multiple times with different embedding models  

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-query retrieval uses the LLM to rewrite the original query from multiple perspectives (e.g., different phrasings or sub-questions). Each variant is used for retrieval separately, and the union of retrieved documents provides broader coverage. This improves recall for complex questions that may be expressed in different ways.

---

## Question 13 *(Medium)*: Parent-Child Chunking

**Question**: A team implements parent-child chunking. Small child chunks are used for retrieval; larger parent chunks are returned to the LLM. What is the PRIMARY advantage over standard-sized chunking?

A) It reduces the size of the vector index by storing smaller vectors  
B) It improves retrieval precision with small chunks while providing richer context with large parent chunks  
C) It eliminates the need for an embedding model by relying on exact keyword matching  
D) It allows multiple users to share the same parent chunk simultaneously  

> [!success]- Answer
> **Correct Answer: B**
>
> Small child chunks are easier to match precisely to specific questions (high precision retrieval). Once the relevant child chunk is found, its larger parent chunk is fetched and sent to the LLM, providing richer context than the small chunk alone. This combines the precision of small-chunk retrieval with the contextual richness of larger chunks.

---

## Question 14 *(Medium)*: RAG Evaluation Dimensions

**Question**: A team wants to evaluate their RAG pipeline comprehensively. Which combination of metrics covers BOTH retrieval quality AND generation quality?

A) BLEU score and ROUGE score  
B) Perplexity and token count  
C) Precision@k and faithfulness  
D) Embedding similarity and chunk count  

> [!success]- Answer
> **Correct Answer: C**
>
> Precision@k measures retrieval quality — what fraction of the top-k retrieved documents are actually relevant. Faithfulness measures generation quality — whether the answer is grounded in the retrieved context. Together they cover the two main failure modes of RAG: retrieving wrong documents and hallucinating content not in the retrieved documents. BLEU/ROUGE measure surface-form text similarity. Perplexity measures fluency, not factual accuracy.

---

## Question 15 *(Easy)*: Metadata Filtering in RAG

**Question**: A RAG pipeline indexes documents from multiple departments. A user query should only retrieve documents from the `legal` department. How is this best implemented?

A) Post-filter retrieved results using Python by checking document metadata after retrieval  
B) Train a separate embedding model for each department  
C) Use metadata filtering in the vector search query to restrict candidates by department before semantic search  
D) Create a separate vector index for each department and query all indexes simultaneously  

> [!success]- Answer
> **Correct Answer: C**
>
> Most vector databases (including Databricks Vector Search) support metadata pre-filtering, which restricts the candidate set by metadata attributes before performing semantic search. This is more efficient than post-filtering (which wastes computation on irrelevant documents) and simpler than maintaining separate indexes per department.

---

**[↑ Back to Practice Questions — GenAI Engineer Associate](./README.md) | [Next: Practice Questions — Vector Search & Embeddings](./02-vector-search-embeddings.md) →**

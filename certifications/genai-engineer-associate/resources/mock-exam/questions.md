---
title: Mock Exam 1 Questions — GenAI Engineer Associate
type: mock-exam-questions
tags: [genai-engineer-associate, mock-exam]
status: published
---

# Mock Exam 1 — Questions

Set a 90-minute timer and answer all 45 questions before checking answers.

[← Back to Mock Exam Instructions](./README.md)

---

## Design RAG Solutions (Questions 1–14)

---

## Question 1 *(Medium)*

**Question**: A retail company wants to allow customers to ask natural language questions about their product catalog (50,000 products, updated daily). The answers must reflect today's inventory. Which architecture is MOST appropriate?

A) Fine-tune an LLM on the product catalog monthly and deploy as a chatbot  
B) Build a RAG pipeline that retrieves relevant products from a daily-refreshed Vector Search index  
C) Store the entire catalog in the system prompt and send it with every request  
D) Build a classification model that maps questions to product categories  

> [!success]- Answer
> **Correct Answer: B**
>
> RAG with a daily-refreshed vector index is ideal for dynamic, frequently updated knowledge. Fine-tuning requires expensive retraining for every catalog change. Including 50,000 products in the system prompt is computationally infeasible — it would vastly exceed any LLM's context window. A classification model maps categories but cannot answer freeform product questions.

---

## Question 2 *(Medium)*

**Question**: A developer decides between recursive character text splitting and fixed-size chunking for a document corpus consisting of structured legal contracts with clearly defined numbered clauses. Which is MOST appropriate?

A) Recursive character text splitting — respects paragraph boundaries  
B) Fixed-size chunking — contracts have a known average clause length  
C) Semantic chunking based on clause boundaries — aligns naturally with the document structure  
D) Page-level chunking — legal documents are formatted consistently page by page  

> [!success]- Answer
> **Correct Answer: C**
>
> Legal contracts have clearly defined clause boundaries (e.g., "1.1", "2.3") that semantically delineate distinct legal obligations. Chunking at clause boundaries produces self-contained chunks that embed and retrieve better than arbitrary-size splits. Recursive character splitting and fixed-size chunking both ignore the semantic structure of contracts. Page-level chunking may split a single clause across multiple chunks.

---

## Question 3 *(Medium)*

**Question**: A developer configures their RAG pipeline with top-k=10 retrieval. The LLM produces verbose, unfocused answers that include information from many unrelated chunks. What is the MOST appropriate adjustment?

A) Increase k to 20 to give the LLM more context  
B) Decrease k to 3–5 and add a reranker to ensure the most relevant chunks are included  
C) Switch from cosine similarity to L2 distance  
D) Increase the chunk size to reduce the total number of retrieved chunks  

> [!success]- Answer
> **Correct Answer: B**
>
> When the LLM produces unfocused answers due to too many retrieved chunks, the fix is to reduce k so fewer (but more relevant) chunks are passed to the LLM, and add reranking to improve the quality of the retained chunks. Increasing k worsens the problem. The similarity metric does not affect how many chunks are noisy. Increasing chunk size does not reduce the number of chunks passed to the LLM — it just makes each chunk larger.

---

## Question 4 *(Hard)*

**Question**: A RAG pipeline consistently returns good retrieval results for concrete factual questions but fails for abstract questions like "What are the strategic risks discussed in the annual reports?" Which technique MOST improves results for abstract queries?

A) Reduce chunk size to 64 tokens  
B) Use HyDE — have the LLM generate a hypothetical answer, then embed and retrieve based on it  
C) Switch from dense to sparse (BM25) retrieval  
D) Add metadata filters for the `strategic_risk` category  

> [!success]- Answer
> **Correct Answer: B**
>
> Abstract queries are often poorly represented in "question space" as embeddings. HyDE bridges the gap by having the LLM generate a hypothetical answer, which is more similar to real answer documents in the embedding space. Smaller chunks worsen context coverage. BM25 performs worse on abstract/semantic queries than on keyword queries. Metadata filters require a pre-labeled category that may not exist.

---

## Question 5 *(Medium)*

**Question**: A developer uses `mlflow.evaluate()` to score their RAG pipeline and gets a faithfulness score of 0.4 (scale 0–1). What does this indicate?

A) 40% of retrieved documents are relevant to the question  
B) 40% of the time, the LLM produces a non-empty answer  
C) The LLM's answers are grounded in the retrieved context only 40% of the time, indicating frequent hallucination  
D) The retrieval step successfully finds the correct document 40% of the time  

> [!success]- Answer
> **Correct Answer: C**
>
> Faithfulness measures whether the generated answer is supported by the retrieved context. A score of 0.4 means that 60% of generated content cannot be attributed to the retrieved documents — the LLM is hallucinating at a high rate. This is a generation-quality metric, not a retrieval metric. Retrieval quality is measured by precision@k and recall@k.

---

## Question 6 *(Easy)*

**Question**: A team uses RAG to power an internal HR chatbot. HR policies are updated quarterly. Which approach CORRECTLY handles policy updates?

A) Retrain the LLM on the new policy documents each quarter  
B) Re-index the updated policy documents into the Vector Search index; no LLM changes are needed  
C) Update the system prompt with a full copy of the new policies  
D) Fine-tune the LLM's embedding layer on the new documents  

> [!success]- Answer
> **Correct Answer: B**
>
> RAG separates knowledge (the vector index) from reasoning (the LLM). When policies change, you only need to re-index updated documents into the vector store. The LLM itself does not need to be changed. Including full policy text in the system prompt is impractical at scale. Fine-tuning only for style changes, not routine knowledge updates.

---

## Question 7 *(Hard)*

**Question**: A developer evaluates two RAG pipelines. Pipeline A achieves precision@5 = 0.8 but faithfulness = 0.5. Pipeline B achieves precision@5 = 0.6 but faithfulness = 0.9. Which pipeline should be preferred for a production customer-facing application, and why?

A) Pipeline A — higher retrieval precision means better answers  
B) Pipeline B — higher faithfulness means answers are more reliably grounded in facts  
C) Both are equivalent — precision and faithfulness measure the same thing  
D) Neither is acceptable — both metrics must exceed 0.9 before production deployment  

> [!success]- Answer
> **Correct Answer: B**
>
> For a customer-facing application, faithfulness is the more critical metric because it measures whether answers are factually grounded rather than hallucinated. Pipeline B's answers are more trustworthy even though it retrieves fewer perfectly relevant documents. Low faithfulness in a customer-facing app risks spreading misinformation. Precision and faithfulness measure different things (retrieval vs generation quality).

---

## Question 8 *(Medium)*

**Question**: A company wants to build a multi-modal RAG system that can answer questions about both product text descriptions and product images. What must the embedding model support?

A) RGB color quantization for consistent image representation  
B) Multi-modal embeddings that can encode both text and images into the same vector space  
C) Separate embedding models for text and images, stored in different indexes  
D) OCR to convert all images to text before embedding  

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-modal RAG requires embedding text and images into the same vector space so they can be retrieved together by semantic similarity. Multi-modal models (e.g., CLIP) produce shared embedding spaces. Separate indexes require separate queries and result merging, which is less elegant and loses cross-modal retrieval. OCR loses visual information (charts, diagrams, styling).

---

## Question 9 *(Medium)*

**Question**: A developer's RAG pipeline answers questions about a company's internal API documentation. Users complain that answers are cut off mid-explanation. What is the MOST likely root cause?

A) The vector index requires rebuilding  
B) The retrieved chunks are too large, consuming the entire context window and leaving no room for generation  
C) The embedding model is not suited for technical documentation  
D) The LLM's temperature is set too low, causing early stopping  

> [!success]- Answer
> **Correct Answer: B**
>
> If retrieved chunks consume most of the context window, the LLM has insufficient tokens for generating a complete response and is forced to truncate. The fix is to use smaller chunks or reduce k so fewer tokens are consumed by retrieved context, leaving more room for the generated answer. Temperature affects creativity/randomness, not output length limits.

---

## Question 10 *(Medium)*

**Question**: A team implements a RAG pipeline for a legal QA system and wants to ensure that retrieved passages are from documents uploaded no more than 12 months ago. How is this constraint BEST implemented?

A) Post-filter results in Python by checking the `doc_date` field after retrieval  
B) Use metadata pre-filtering in the Vector Search query with a date range filter  
C) Create separate vector indexes per month and query only recent ones  
D) Fine-tune the LLM to ignore outdated legal citations  

> [!success]- Answer
> **Correct Answer: B**
>
> Metadata pre-filtering at query time restricts the candidate set before computing similarity, efficiently excluding old documents. Post-filtering wastes compute (retrieves and then discards results). Separate monthly indexes require querying multiple indexes and merging results. Fine-tuning the LLM does not prevent old documents from being retrieved.

---

## Question 11 *(Easy)*

**Question**: What is the PRIMARY reason RAG is preferred over fine-tuning for grounding LLM responses in proprietary company data?

A) RAG produces higher quality prose than fine-tuned models  
B) RAG can reference data that did not exist when the LLM was trained, without modifying model weights  
C) RAG is always cheaper than fine-tuning at inference time  
D) RAG eliminates the need for an embedding model  

> [!success]- Answer
> **Correct Answer: B**
>
> RAG's key advantage is that it can leverage private, up-to-date knowledge without modifying the LLM's weights. The LLM's knowledge cutoff is irrelevant because the relevant context is retrieved at inference time. Fine-tuning is expensive and cannot easily incorporate continuously updated information. RAG does require an embedding model — it is a core component. RAG inference cost depends on retrieval infrastructure; it is not always cheaper.

---

## Question 12 *(Easy)*

**Question**: A developer implements parent-child chunking. Child chunks are 128 tokens with 20-token overlap. Parent chunks are 512 tokens. During retrieval, which chunks are passed to the LLM?

A) The small child chunks that matched the query  
B) The large parent chunks that contain the matched child chunks  
C) Both child and parent chunks, concatenated  
D) The midpoint chunk (320 tokens) between child and parent size  

> [!success]- Answer
> **Correct Answer: B**
>
> In parent-child chunking, small child chunks are used for high-precision retrieval (finding the right location), but the larger parent chunks are what get passed to the LLM for generation. This provides richer context than the small match chunk alone while maintaining retrieval precision. Only parent chunks are sent to the LLM — passing both would duplicate content and waste context window tokens.

---

## Question 13 *(Hard)*

**Question**: A RAG pipeline's `answer_relevance` score is 0.9 but its `faithfulness` score is 0.4. What does this combination indicate?

A) The retrieval step is working well but the LLM is hallucinating content not in the retrieved documents  
B) The retrieved documents are relevant but the LLM generates verbose, off-topic answers  
C) Both retrieval and generation are functioning correctly  
D) The embedding model is producing high-quality vectors but retrieval recall is low  

> [!success]- Answer
> **Correct Answer: A**
>
> High `answer_relevance` (0.9) means the generated answers address the user's question well. Low `faithfulness` (0.4) means those answers contain claims not supported by the retrieved context — the LLM is hallucinating. This is a common failure mode where the LLM produces plausible-sounding but ungrounded answers. The fix is prompt engineering (instruct the LLM to only use provided context) or stricter output guardrails.

---

## Question 14 *(Medium)*

**Question**: A developer wants to implement re-ranking in their RAG pipeline to improve precision. Which architecture is CORRECT?

A) Replace the bi-encoder embedding model with a cross-encoder for initial retrieval  
B) Use a bi-encoder to retrieve top-50 candidates, then apply a cross-encoder to re-score and select top-5  
C) Use the LLM itself to generate relevance scores for all documents in the index  
D) Apply BM25 as a post-retrieval filter to remove semantically dissimilar documents  

> [!success]- Answer
> **Correct Answer: B**
>
> The standard two-stage retrieval architecture uses a fast bi-encoder to retrieve a large candidate set (top-50), then applies a slower but more accurate cross-encoder to re-score the candidates and select the top-k for the LLM. Using a cross-encoder for initial retrieval over a large corpus is computationally infeasible (it would require scoring every document pair). Using the LLM to score all documents is even more expensive.

---

## Vector Search & Embeddings (Questions 15–25)

---

## Question 15 *(Easy)*

**Question**: A team creates a Delta Sync Index with `pipeline_type="CONTINUOUS"` on a Delta table. When a new row is inserted into the source table, when is the index updated?

A) The index is updated the next time a user queries it  
B) The index is updated automatically soon after the Delta table change is detected  
C) The index must be manually synced via the Databricks UI  
D) The index is updated on a fixed 24-hour schedule  

> [!success]- Answer
> **Correct Answer: B**
>
> A `CONTINUOUS` pipeline type keeps the vector index automatically synchronized with the source Delta table. When rows are inserted, updated, or deleted, the changes propagate to the index without manual intervention. `TRIGGERED` mode requires manual sync. There is no automatic 24-hour schedule or query-triggered sync.

---

## Question 16 *(Easy)*

**Question**: A team wants to create a Databricks Vector Search index on a table that is NOT managed by Databricks (e.g., an external system writes embeddings computed abroad). Which index type is CORRECT?

A) Delta Sync Index with `pipeline_type="TRIGGERED"`  
B) Direct Access Index  
C) Delta Sync Index with `pipeline_type="CONTINUOUS"`  
D) Managed Sync Index  

> [!success]- Answer
> **Correct Answer: B**
>
> Direct Access Indexes allow external applications to push embeddings via the Databricks Vector Search SDK or REST API using upsert operations. This is the correct choice when embeddings are computed outside Databricks or when the source data is not a Databricks-managed Delta table. Delta Sync Indexes require a Databricks Delta table as the source. "Managed Sync Index" is not a valid type.

---

## Question 17 *(Easy)*

**Question**: A developer creates a Vector Search index using the `COSINE` similarity metric. At query time, a higher cosine similarity score between the query vector and a document vector indicates what?

A) The document vector has a larger magnitude than the query vector  
B) The query and document vectors point in more similar directions — the documents are more semantically related  
C) The document was indexed more recently than lower-scoring documents  
D) The document chunk is shorter and therefore more specific  

> [!success]- Answer
> **Correct Answer: B**
>
> Cosine similarity measures the angle between two vectors, regardless of their magnitudes. A higher cosine similarity (closer to 1.0) means the vectors point in the same direction, indicating the query and document are semantically similar. Cosine similarity is magnitude-independent, so vector length and recency are irrelevant.

---

## Question 18 *(Medium)*

**Question**: A developer is building a product search feature. Users search using image uploads (not text). The product catalog documents are stored as text. Which embedding approach enables cross-modal retrieval?

A) Two separate indexes: one for image queries, one for text documents  
B) A multi-modal embedding model that maps both images and text into a shared vector space  
C) Convert product images to text descriptions using OCR, then use a text embedding model  
D) Use a text-only embedding model and convert user images to a text description using a captioning model before embedding  

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-modal embedding models (e.g., CLIP) map images and text into a unified semantic space, enabling direct image-to-text retrieval. Option D (captioning → text embedding) is a valid workaround but loses visual information and requires an additional model step. Option C only works for text in images, not photographic product images. Two separate indexes cannot perform cross-modal retrieval directly.

---

## Question 19 *(Medium)*

**Question**: A developer queries a Databricks Vector Search index and receives results with low similarity scores despite the user's query being clearly relevant to indexed content. What is the MOST likely cause?

A) The index is using COSINE instead of L2 similarity  
B) A different embedding model was used for indexing vs querying  
C) The `num_results` parameter is set too high  
D) The Vector Search endpoint has not been started  

> [!success]- Answer
> **Correct Answer: B**
>
> When different embedding models are used for indexing and querying, the resulting vectors exist in different semantic spaces. Even clearly relevant documents will have low cosine similarity to the query vector because the spaces are not aligned. This is one of the most common and impactful mistakes in RAG implementation. If the endpoint had not been started, the query would fail entirely rather than returning low scores.

---

## Question 20 *(Easy)*

**Question**: A data engineer needs to add 10,000 new product embeddings to an existing Direct Access Index. Which SDK method is correct?

A) `index.insert(data=new_embeddings_df)`  
B) `index.upsert(dataframe=new_embeddings_df)`  
C) `index.sync(source_df=new_embeddings_df)`  
D) `index.merge(embeddings=new_embeddings_df)`  

> [!success]- Answer
> **Correct Answer: B**
>
> The Databricks Vector Search SDK uses `index.upsert(dataframe=...)` to add or update vectors in a Direct Access Index. `insert`, `sync`, and `merge` are not valid methods in the Databricks Vector Search Python SDK. Upsert handles both inserts (new IDs) and updates (existing IDs) in a single operation.

---

## Question 21 *(Medium)*

**Question**: For a customer support chatbot, a developer can choose between `databricks-bge-large-en` (MTEB score 63.6, 1024-dim) and `databricks-gte-large-en` (MTEB score 63.1, 1024-dim). Which factor MOST influences the decision?

A) Always choose the model with the higher MTEB score  
B) Choose based on the specific task type — BGE and GTE have different training data emphases  
C) Always use 1024-dim models over lower-dimensional models  
D) The models are equivalent; choose based on alphabetical order  

> [!success]- Answer
> **Correct Answer: B**
>
> Even when overall MTEB scores are similar, embedding models differ in performance across task categories (retrieval, classification, clustering, semantic similarity). The right choice depends on the specific use case — customer support retrieval may favor one model's training distribution over the other. Dimensionality alone (both are 1024-dim) does not determine quality for a specific task.

---

## Question 22 *(Hard)*

**Question**: A developer wants to filter Vector Search results to documents where the `status` field equals `"active"` AND the `priority` field is greater than 3. Which filter dictionary is CORRECT?

A) `filters={"status": "active", "priority >": 3}`  
B) `filters={"status": "active", "priority": {"$gt": 3}}`  
C) `filters={"status": "active AND priority > 3"}`  
D) `filters="status = 'active' AND priority > 3"`  

> [!success]- Answer
> **Correct Answer: B**
>
> The Databricks Vector Search SDK supports MongoDB-style filter operators for numeric comparisons. The `$gt` operator specifies "greater than." Multiple conditions are expressed as separate keys in the filter dictionary. String SQL expressions and combined string conditions (`"AND"` in a single string value) are not valid filter formats for the Vector Search SDK.

---

## Question 23 *(Hard)*

**Question**: A team indexes 1 million product embeddings and notices that query latency increases significantly as the index grows. Which index configuration change is MOST likely to improve query latency?

A) Switch from Direct Access Index to Delta Sync Index  
B) Rebuild the index with approximate nearest neighbor (ANN) search enabled  
C) Reduce the `num_results` parameter from 10 to 5  
D) Switch from COSINE to L2 similarity metric  

> [!success]- Answer
> **Correct Answer: B**
>
> VectorSearch indexes use approximate nearest neighbor (ANN) algorithms (e.g., HNSW) to trade a small amount of accuracy for dramatically faster query latency at scale. Ensuring ANN parameters are properly configured for the index size is the primary lever for latency optimization. Reducing `num_results` helps marginally but doesn't address algorithmic complexity. Index type (Direct vs Delta Sync) and similarity metric do not fundamentally change query performance characteristics.

---

## Question 24 *(Medium)*

**Question**: A team stores embeddings for 500,000 documents using `databricks-bge-large-en` (1024-dim, float32). Approximately how much storage do the raw vectors require?

A) ~500 MB  
B) ~2 GB  
C) ~20 GB  
D) ~200 GB  

> [!success]- Answer
> **Correct Answer: B**
>
> Each float32 value takes 4 bytes. 500,000 documents × 1024 dimensions × 4 bytes = 2,048,000,000 bytes ≈ 2 GB for the raw vectors. Vector indexes add overhead (metadata, graph structures for ANN), so the actual index size will be larger. Knowing approximate storage requirements helps in capacity planning and choosing between index configurations.

---

## Question 25 *(Easy)*

**Question**: A developer deletes a document from the source Delta table. With a Delta Sync Index in `CONTINUOUS` mode, what happens to the corresponding document's embedding in the vector index?

A) The embedding remains in the index until manually deleted  
B) The embedding is automatically removed from the vector index when the deletion is detected  
C) The embedding is marked as "archived" but remains searchable  
D) The entire index must be rebuilt to remove the deleted document's embedding  

> [!success]- Answer
> **Correct Answer: B**
>
> A Delta Sync Index in `CONTINUOUS` mode tracks insertions, updates, AND deletions from the source Delta table. When a row is deleted from the source, the corresponding embedding is automatically removed from the vector index. This keeps the index consistent with the source of truth without manual intervention.

---

## LLM Application Development (Questions 26–38)

---

## Question 26 *(Easy)*

**Question**: A developer wants all LangChain chain calls in their notebook to be traced and logged to MLflow automatically. Which single line of code accomplishes this?

A) `mlflow.langchain.log_model(chain, "chain")`  
B) `mlflow.langchain.autolog()`  
C) `mlflow.start_run(run_name="langchain-trace")`  
D) `mlflow.set_tracking_uri("databricks")`  

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.langchain.autolog()` enables automatic logging of LangChain chain inputs, outputs, and intermediate steps to MLflow. It must be called once before running chains. `log_model` saves a chain as a deployable model artifact (not for tracing). `start_run` opens a run context but does not enable LangChain-specific autolog. `set_tracking_uri` configures where logs are sent, not what is logged.

---

## Question 27 *(Hard)*

**Question**: A developer passes the system prompt: "You are a helpful assistant. Answer only from the provided context. If the answer is not in the context, say 'I don't know.'" — but the LLM still generates answers from its parametric knowledge. What is the MOST likely cause?

A) The system prompt is too short to be effective  
B) The LLM is ignoring the system prompt because it was not fine-tuned with instruction following  
C) The retrieved context is empty or insufficient, causing the LLM to fall back on parametric knowledge  
D) The temperature parameter is too high  

> [!success]- Answer
> **Correct Answer: C**
>
> When the retrieval step returns no relevant context (empty or low-quality retrieval), the LLM often "fills in" from its training knowledge despite "answer only from context" instructions. The fix is to improve retrieval quality or add an explicit empty-context check. Modern instruction-tuned LLMs generally honor system prompt instructions; the issue is typically an empty context, not prompt length or temperature.

---

## Question 28 *(Medium)*

**Question**: A developer builds a multi-turn chatbot using LangChain with `ConversationBufferMemory`. After 50 conversation turns, the LLM API returns a context length exceeded error. What is the BEST solution?

A) Increase the LLM's context window by switching to a larger model  
B) Switch to `ConversationBufferWindowMemory` with a fixed window of 10 turns, or to `ConversationSummaryMemory` to compress history  
C) Disable memory entirely — each turn should be independent  
D) Reduce the LLM's `max_tokens` parameter  

> [!success]- Answer
> **Correct Answer: B**
>
> `ConversationBufferMemory` accumulates all history indefinitely, eventually exceeding the context window. The correct fix is to use a memory type that bounds context growth: `ConversationBufferWindowMemory` keeps the last k turns, while `ConversationSummaryMemory` compresses older turns into a summary. Switching to a larger model defers the problem but doesn't solve it permanently. Disabling memory breaks conversational coherence. Reducing `max_tokens` limits output length, not input context size.

---

## Question 29 *(Medium)*

**Question**: A developer uses `mlflow.evaluate()` to score a RAG pipeline with `model_type="question-answering"`. The evaluation dataset contains `inputs`, `outputs` (model-generated answers), and `contexts` (retrieved chunks). Which column provides the retrieved context to the faithfulness metric?

A) `inputs`  
B) `outputs`  
C) `contexts`  
D) `targets`  

> [!success]- Answer
> **Correct Answer: C**
>
> The `contexts` column in the evaluation dataset contains the retrieved passages that were provided to the LLM. The `faithfulness` metric uses the `contexts` column to verify whether the `outputs` (generated answers) are grounded in the provided context. `inputs` contains the user questions. `targets` contains ground-truth reference answers (used for metrics like `exact_match`).

---

## Question 30 *(Easy)*

**Question**: A LangChain application uses a `ConversationChain` with `ConversationSummaryMemory`. What does `ConversationSummaryMemory` store between turns?

A) The full text of all previous conversation turns  
B) A running summary of the conversation, regenerated after each turn using the LLM  
C) A vector embedding of each previous turn for semantic lookup  
D) Only the last user message and the LLM's most recent response  

> [!success]- Answer
> **Correct Answer: B**
>
> `ConversationSummaryMemory` progressively summarizes the conversation after each turn using an LLM call, replacing the full history with a condensed summary. This bounds the context window usage while preserving key information. `ConversationBufferMemory` stores the full history. Vector embedding memory is a different type (`VectorStoreRetrieverMemory`). `ConversationBufferWindowMemory` keeps only the last k turns verbatim.

---

## Question 31 *(Easy)*

**Question**: A developer wants to create a LangChain agent that can use three tools: `search_database`, `call_weather_api`, and `lookup_inventory`. Which component decides which tool to call for a given user input?

A) The `SequentialChain` executes all tools in order and returns the final result  
B) The LLM reasoning engine within the agent, using tool names and descriptions to select the appropriate tool  
C) A rule-based router that pattern-matches user inputs to tool names  
D) The `RetrievalQA` chain automatically routes to the appropriate retriever  

> [!success]- Answer
> **Correct Answer: B**
>
> LangChain Agents use an LLM as a reasoning engine (following the ReAct or similar pattern) to decide which tool to call based on the user's input and each tool's name and description. The LLM generates a "thought" and "action" (tool selection + arguments) iteratively. There is no built-in rule-based router for arbitrary tools — the LLM provides the dynamic decision-making.

---

## Question 32 *(Medium)*

**Question**: A developer logs a LangChain `RetrievalQA` chain with `mlflow.langchain.log_model()` and wants to load it back for inference. Which code is correct?

A) `chain = mlflow.langchain.load_model(model_uri)`  
B) `chain = mlflow.pyfunc.load_model(model_uri)`  
C) `chain = mlflow.sklearn.load_model(model_uri)`  
D) `chain = pickle.load(open(model_uri, "rb"))`  

> [!success]- Answer
> **Correct Answer: B**
>
> Models logged with any MLflow flavor (including `mlflow.langchain`) can be loaded as a `pyfunc` model using `mlflow.pyfunc.load_model(model_uri)`. This returns an object with a `.predict()` method that wraps the chain. `mlflow.langchain.load_model()` also works but is flavor-specific. `mlflow.sklearn.load_model()` is for scikit-learn models. Using `pickle` directly is not recommended and does not work with the MLflow artifact store.

---

## Question 33 *(Easy)*

**Question**: A developer configures a LangChain `RetrievalQA` chain with `chain_type="stuff"`. What does this configuration do with retrieved documents?

A) Summarizes each retrieved document individually before passing to the LLM  
B) Selects the single most relevant document and ignores the rest  
C) Concatenates all retrieved documents into a single context block and passes them to the LLM in one call  
D) Splits retrieved documents into smaller chunks before passing to the LLM  

> [!success]- Answer
> **Correct Answer: C**
>
> The `"stuff"` chain type concatenates all retrieved documents together ("stuffs" them) into the LLM's prompt in a single call. This is the simplest approach and works well when k is small and retrieved chunks are short. Other chain types include `"map_reduce"` (summarizes each doc then combines), `"refine"` (iteratively refines the answer), and `"map_rerank"` (scores each doc's answer and picks the best).

---

## Question 34 *(Hard)*

**Question**: A developer needs to prevent their LangChain agent from calling the `delete_database` tool unless the user's message explicitly contains the word "delete". Which is the MOST appropriate implementation?

A) Remove the `delete_database` tool from the agent's tool list  
B) Add a validation check in the `delete_database` tool function that raises an error if "delete" is not in the original input  
C) Add a guardrail layer that intercepts the agent's action before execution and validates the action against the original user input  
D) Set the LLM's temperature to 0 to prevent unexpected tool calls  

> [!success]- Answer
> **Correct Answer: C**
>
> A guardrail interceptor layer sits between the agent's reasoning step and the tool execution step. It can validate, log, or block any proposed action before it is executed. This provides a deterministic safety check that supplements (but does not replace) the LLM's judgment. Adding the check inside the tool function (B) is a valid defense-in-depth measure but not the primary guardrail location. Temperature affects randomness, not tool selection logic.

---

## Question 35 *(Medium)*

**Question**: A team wants to A/B test two different system prompts for their RAG chatbot. MLflow evaluation will be run on the same 100-question test set for both prompts. Which MLflow feature enables systematic comparison?

A) Model Registry — register each prompt variant as a separate model version  
B) `mlflow.evaluate()` run results stored in an MLflow experiment — compare runs in the experiment UI  
C) MLflow Autolog — automatically generates A/B test results for each prompt  
D) Databricks Workflows — schedule two workflows, one per prompt  

> [!success]- Answer
> **Correct Answer: B**
>
> Running `mlflow.evaluate()` for each prompt variant logs metrics as separate MLflow runs within the same experiment. The experiment comparison UI then allows side-by-side metric comparison (faithfulness, answer relevance, etc.) across variants. Model Registry is for versioning deployable models, not for tracking evaluation configurations. Autolog captures training data, not evaluation A/B comparisons. Workflows orchestrate jobs but don't provide evaluation comparison.

---

## Question 36 *(Easy)*

**Question**: A developer sets `temperature=0.0` when calling a Foundation Model API endpoint. What is the effect?

A) The model always refuses to answer questions it is uncertain about  
B) The model produces deterministic, greedy outputs (the most likely token at each step)  
C) The model generates shorter responses to reduce cost  
D) The model skips the context window and uses only parametric knowledge  

> [!success]- Answer
> **Correct Answer: B**
>
> Temperature controls the randomness of token sampling. At `temperature=0`, the model uses greedy decoding — always selecting the highest-probability token. This produces deterministic (reproducible) outputs. It does not affect response length, refusal behavior, or knowledge source. Temperature close to 1.0 produces more varied/creative outputs; temperature close to 0 produces focused, deterministic outputs.

---

## Question 37 *(Medium)*

**Question**: A developer builds a LangChain pipeline where Step 1 extracts key entities from the user query, and Step 2 uses those entities to formulate a database query. Which LangChain construct is MOST appropriate?

A) A LangChain Agent with two tools: entity extraction and database query  
B) A `SequentialChain` where the output of Step 1 is automatically passed as input to Step 2  
C) A `RetrievalQA` chain with a custom retriever that performs entity extraction  
D) Two separate `LLMChain` objects called independently and joined with Python string formatting  

> [!success]- Answer
> **Correct Answer: B**
>
> A `SequentialChain` is designed for pipelines where the output of one chain step is passed as the input to the next step. This creates a directed workflow where each step builds on the previous one. Agents are appropriate for dynamic decision-making (which tool to call), not for fixed sequential pipelines. Joining chains manually with Python is possible but less maintainable than using `SequentialChain`.

---

## Question 38 *(Hard)*

**Question**: A developer uses `mlflow.evaluate()` with a custom judge model for evaluating response quality. The judge model is a Foundation Model API endpoint. Which parameter specifies the judge model?

A) `judge_model="databricks/dbrx-instruct"`  
B) `evaluator_config={"openai_model": "gpt-4"}`  
C) `extra_metrics=[answer_relevance(model="endpoints:/databricks-dbrx-instruct")]`  
D) `model_type="llm-judge"` with `judge_endpoint="databricks-dbrx-instruct"`  

> [!success]- Answer
> **Correct Answer: C**
>
> In MLflow, LLM-judge metrics accept a `model` parameter that specifies which model to use for judging. For Databricks Foundation Model endpoints, the format is `"endpoints:/endpoint-name"`. This is passed inside the metric function call within `extra_metrics`. There is no top-level `judge_model` parameter or `model_type="llm-judge"` option in `mlflow.evaluate()`.

---

## Databricks GenAI Tools (Questions 39–45)

---

## Question 39 *(Medium)*

**Question**: A team's production RAG chatbot handles 500 requests per minute with strict p99 latency requirements under 2 seconds. Which Foundation Model API endpoint type is MOST appropriate?

A) Pay-per-token endpoint — serverless and auto-scaling  
B) External Model endpoint — uses OpenAI's infrastructure  
C) Provisioned Throughput endpoint — dedicated capacity with guaranteed throughput  
D) Batch Inference endpoint — processes all 500 requests in parallel  

> [!success]- Answer
> **Correct Answer: C**
>
> Provisioned Throughput endpoints provide dedicated compute capacity with guaranteed throughput (tokens per second) and more consistent latency — essential for production SLAs. Pay-per-token endpoints share infrastructure with other users and have variable latency that can exceed 2 seconds under load. External Model endpoints introduce network hops to third-party providers, adding latency variance. Batch endpoints are for offline workloads, not real-time serving.

---

## Question 40 *(Medium)*

**Question**: A developer registers a LangChain chain as an MLflow model. Which `mlflow.evaluate()` input format correctly measures chain performance on a test dataset?

A) A list of user questions passed as `data=[q1, q2, q3]`  
B) A pandas DataFrame with `inputs` and `targets` columns (and optionally `contexts`)  
C) A Delta table name passed as `data="main.catalog.test_table"`  
D) A dictionary with `questions` and `expected_answers` keys  

> [!success]- Answer
> **Correct Answer: B**
>
> `mlflow.evaluate()` accepts a pandas DataFrame with standardized column names: `inputs` (user queries), `targets` (ground truth answers, optional), `contexts` (retrieved passages, optional). This is the standard evaluation data format. A list of strings, a Delta table name (directly), or a custom dictionary format are not natively supported by `mlflow.evaluate()`.

---

## Question 41 *(Easy)*

**Question**: A team deploys a Model Serving endpoint for their RAG chain and enables inference tables. Where are the logged request/response payloads stored?

A) In the MLflow experiment associated with the endpoint  
B) In a Delta table in Unity Catalog, as specified in the endpoint configuration  
C) In DBFS at `/dbfs/serving-endpoints/logs/`  
D) In the Databricks audit log accessible via `system.access.audit`  

> [!success]- Answer
> **Correct Answer: B**
>
> Inference tables write endpoint request and response data to a Delta table in Unity Catalog. The table location is specified when creating or configuring the endpoint. This enables downstream monitoring, evaluation, and fine-tuning workflows on real production traffic. MLflow experiments track training runs, not serving traffic. DBFS log paths and audit logs (`system.access.audit`) serve different purposes.

---

## Question 42 *(Medium)*

**Question**: A developer queries a `databricks-meta-llama-3-1-70b-instruct` Foundation Model endpoint and needs the response to be in JSON format with specific fields. Which approach is MOST reliable?

A) Set `temperature=0` to force structured output  
B) Use JSON mode if supported by the endpoint, or include explicit JSON format instructions with an example in the system prompt  
C) Post-process the response with `json.loads()` — all Foundation Model APIs return JSON automatically  
D) Set `max_tokens=100` to prevent the model from generating extra text  

> [!success]- Answer
> **Correct Answer: B**
>
> For structured JSON output, the most reliable approaches are: (1) use JSON mode (response format parameter) if the endpoint supports it, or (2) provide clear JSON format instructions with an example in the system prompt. Not all endpoints guarantee JSON output automatically — `json.loads()` will fail on free-form text responses. Temperature=0 ensures determinism but not JSON format. `max_tokens` limits length, not format.

---

## Question 43 *(Medium)*

**Question**: An organization wants to use Databricks Foundation Model APIs for internal use but prevent individual teams from storing API keys in their notebooks. Which Databricks feature enables centralized credential management for Foundation Model endpoints?

A) MLflow Model Registry access control lists  
B) Unity Catalog column masking policies  
C) Databricks Secrets with service principal authentication — or MLflow AI Gateway for external models  
D) Cluster-level environment variables set by workspace administrators  

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Secrets store credentials securely and can be scoped to groups, preventing individual users from accessing raw API keys. For external model endpoints (OpenAI, Anthropic), MLflow AI Gateway centralizes credential management so client applications use Databricks authentication instead of provider-specific API keys. Model Registry ACLs govern model version access, not API credentials. Column masking is a Unity Catalog data governance feature.

---

## Question 44 *(Medium)*

**Question**: A developer logs a LangChain chain to MLflow and wants to deploy it as a REST endpoint on Databricks Model Serving. What is the EXACT correct sequence of steps?

A) Log model → Create serving endpoint → Register to Model Registry  
B) Register to Model Registry → Log model → Create serving endpoint  
C) Log model → Register to Model Registry → Create serving endpoint  
D) Create serving endpoint → Log model → Register to Model Registry  

> [!success]- Answer
> **Correct Answer: C**
>
> The correct Databricks deployment workflow is: (1) **Log** the model to an MLflow run with `mlflow.langchain.log_model()`, (2) **Register** the logged model to the MLflow Model Registry with `mlflow.register_model()`, (3) **Create** a Model Serving endpoint pointing to the registered model version. The Model Registry is the source of truth for serving; a logged (but unregistered) model cannot be served by Databricks Model Serving.

---

## Question 45 *(Hard)*

**Question**: A team uses `mlflow.evaluate()` to score their RAG chain and gets these results: `faithfulness=0.85`, `answer_relevance=0.90`, `toxicity=0.02`. Which conclusion is MOST accurate?

A) The pipeline is underperforming — all three metrics should be above 0.95 for production use  
B) The pipeline generates answers that are mostly grounded in retrieved context, relevant to user questions, and rarely produces harmful content — a reasonable production baseline  
C) The toxicity score of 0.02 indicates that 2% of answers are toxic and must be fixed before deployment  
D) The faithfulness score of 0.85 indicates the retrieval step is failing 15% of the time  

> [!success]- Answer
> **Correct Answer: B**
>
> Faithfulness=0.85 is strong (85% of claims are grounded in context). Answer relevance=0.90 is excellent (answers address the user's question 90% of the time). Toxicity=0.02 is very low (2% frequency, which may refer to low scores, not that 2% are harmful). Together these indicate a well-performing pipeline. Production readiness thresholds are domain-specific — there are no universal 0.95 requirements. Faithfulness is a generation metric, not a retrieval metric.

---

**End of Mock Exam 1 — 45 Questions**

[← Back to Mock Exam Instructions](./README.md) | [Try Mock Exam 2 →](../mock-exam-2/README.md)

---
title: "Practice Questions — Design Applications & Data Preparation (2026 guide)"
type: practice-questions
tags: [genai-engineer-associate, practice-questions, design-applications, data-preparation, agent-bricks]
status: published
---

# Practice Questions — Design Applications & Data Preparation (2026 guide)

12 questions on exam-guide bullets added or newly emphasised in the March 18, 2026 guide: Agent Bricks, model task selection, I/O specification, tool ordering, extraction packages, source selection, filtering, retrieval metrics, and re-ranking. Study material: [Solution Design](../../03-design-applications/02-solution-design-and-tool-planning.md), [Agent Bricks](../../03-design-applications/03-agent-bricks.md), [Source Documents and Retrieval Evaluation](../../04-data-preparation/04-source-documents-extraction-and-retrieval-eval.md).

---

## Question 1 *(Easy)*: Knowledge Assistant Fit *(2026 guide)*

**Question**: An HR team wants a chatbot that answers employee questions about 300 policy PDFs stored in a Unity Catalog volume, with citations, built with minimal code and tuned by HR experts. Which Agent Bricks option fits best?

A) Information Extraction  
B) Knowledge Assistant  
C) Multi-Agent Supervisor with a single Genie Space  
D) A custom LangGraph agent deployed with `agents.deploy()`  

> [!success]- Answer
> **Correct Answer: B**
>
> Knowledge Assistant.
>
> Knowledge Assistant builds a document question-answering agent with citations from files in a volume, and SMEs improve it with natural-language guidelines. Information Extraction outputs structured rows, not chat. A Supervisor coordinates several agents and Genie answers structured-data questions, not PDF policy questions. A custom agent works but is not the minimal-code option.

---

## Question 2 *(Medium)*: Multi-Agent Supervisor Fit *(2026 guide)*

**Question**: A sales operations team needs one chat interface that answers pipeline metrics from Delta tables and contract-policy questions from documents. A Genie Space already exists for the tables and a Knowledge Assistant exists for the documents. What should the engineer build?

A) A Multi-Agent Supervisor that delegates to the Genie Space and the Knowledge Assistant  
B) A new Knowledge Assistant with the Delta tables exported to PDF  
C) An Information Extraction agent over the contracts  
D) A second Genie Space that includes the contract PDFs  

> [!success]- Answer
> **Correct Answer: A**
>
> A Multi-Agent Supervisor over both existing agents.
>
> The Supervisor coordinates specialised sub-agents — Genie for structured data and Knowledge Assistant for documents — and synthesises one answer, respecting each user's access to every sub-agent. Exporting tables to PDF loses structure, Information Extraction produces tables rather than conversation, and Genie Spaces work over tables, not PDFs.

---

## Question 3 *(Easy)*: Information Extraction Fit *(2026 guide)*

**Question**: A legal team must turn 40,000 contracts into a Delta table with the parties, effective date, and renewal term of each contract. Which Agent Bricks option matches the requirement?

A) Knowledge Assistant  
B) Multi-Agent Supervisor  
C) Information Extraction  
D) Genie Space  

> [!success]- Answer
> **Correct Answer: C**
>
> Information Extraction.
>
> The deliverable is a structured table with the same fields for every document, which is exactly what Information Extraction (built on `ai_extract` in the current version) produces. Knowledge Assistant and Supervisor return conversational answers; Genie queries tables that already exist.

---

## Question 4 *(Medium)*: Selecting the Task Category *(2026 guide)*

**Question**: A product team wants each customer review classified as one of five fixed categories (shipping, quality, price, support, other) so the result can be counted in a dashboard. Which task category should candidate models be evaluated under?

A) Summarization  
B) Text classification  
C) Text-to-text generation  
D) Translation  

> [!success]- Answer
> **Correct Answer: B**
>
> Text classification.
>
> A closed set of labels is a classification task; evaluate models (or `ai_classify`) against labelled examples. Summarization condenses text, and free-form text-to-text generation produces inconsistent labels that are hard to count.

---

## Question 5 *(Medium)*: Structured Facts vs Documents *(2026 guide)*

**Question**: An order-support assistant answers policy questions well but often gives wrong delivery dates. Delivery dates are stored per order in the order system. What design change addresses this?

A) Add the order system's export as PDFs to the vector index  
B) Fine-tune the LLM on last month's delivery dates  
C) Give the agent a lookup tool or table keyed by order ID that returns the delivery date  
D) Instruct the model to add seven days to the order date  

> [!success]- Answer
> **Correct Answer: C**
>
> A keyed lookup tool or table for per-order facts.
>
> Delivery dates are structured, per-entity, frequently changing facts. They belong in a table or tool queried by ID, not in embedded documents or model weights. A fixed rule in the prompt produces wrong answers whenever shipping varies.

---

## Question 6 *(Hard)*: Ordering Tools *(2026 guide)*

**Question**: An IT agent has three tools: `lookup_employee` (returns the laptop asset tag), `search_runbooks`, and `open_ticket` (requires an asset tag). Which ordering best supports reliable multi-stage reasoning?

A) `open_ticket` first so the user gets a ticket number quickly, then the other tools  
B) `search_runbooks`, then `open_ticket`, then `lookup_employee` to confirm the asset tag  
C) `lookup_employee`, then `search_runbooks`, then `open_ticket` only after the user confirms  
D) Call all three in parallel and let the model reconcile the results  

> [!success]- Answer
> **Correct Answer: C**
>
> Identify, retrieve, then act with confirmation.
>
> `open_ticket` depends on the asset tag from `lookup_employee`, and writes should come after all reads. Putting the irreversible action last and behind confirmation prevents acting on a wrong intermediate conclusion. Parallel calls cannot satisfy the data dependency.

---

## Question 7 *(Easy)*: OCR for Scanned Images *(2026 guide)*

**Question**: Source documents for a RAG application are scanned forms saved as `.png` files. Which Python package extracts their text with the least code?

A) beautifulsoup4  
B) scrapy  
C) pytesseract  
D) pyquery  

> [!success]- Answer
> **Correct Answer: C**
>
> pytesseract.
>
> Scanned images have no text layer, so OCR is required; pytesseract wraps the Tesseract OCR engine. BeautifulSoup, scrapy, and pyquery parse or crawl HTML and cannot read text from pixels.

---

## Question 8 *(Medium)*: Filtering Extraneous Content *(2026 guide)*

**Question**: Retrieval for an intranet assistant keeps returning chunks dominated by navigation menus and copyright footers. What is the most effective fix?

A) Increase `num_results` so that useful chunks are also returned  
B) Strip navigation, header, and footer elements before chunking and re-embed the corpus  
C) Switch to a larger embedding model  
D) Add a re-ranker after retrieval  

> [!success]- Answer
> **Correct Answer: B**
>
> Remove boilerplate before chunking and re-embed.
>
> Boilerplate inside chunks is embedded along with the content, so it pollutes similarity. Cleaning at parse time fixes the root cause. More results add noise, a bigger embedding model still embeds the noise, and a re-ranker can only reorder noisy candidates.

---

## Question 9 *(Hard)*: Writing Chunks for a Delta Sync Index *(2026 guide)*

**Question**: An engineer will build a Delta Sync index on a standard Vector Search endpoint from chunked text. Which sequence is correct?

A) Create the index, then create the Delta table, then enable Change Data Feed  
B) Parse and chunk, write chunks with a primary key to a Unity Catalog Delta table with Change Data Feed enabled, then create or sync the index  
C) Write chunks to a JSON file in a volume and point the index at the volume  
D) Embed the chunks, then write them only to the index with the Direct Vector Access API  

> [!success]- Answer
> **Correct Answer: B**
>
> Chunk, write to a CDF-enabled Delta table with a primary key, then create or sync the index.
>
> A Delta Sync index reads its source table's changes, so the Delta table with a primary key and Change Data Feed must exist first. Indexes are not created from files in a volume, and the Direct Vector Access API is a different index type that you populate yourself.

---

## Question 10 *(Medium)*: Retrieval Metric Choice *(2026 guide)*

**Question**: Evaluation shows the relevant chunk appears in the top 20 results for 95 % of questions but is usually ranked 8th or lower. Which metric captures this problem and which technique addresses it?

A) Recall@20; increase chunk overlap  
B) Mean reciprocal rank (MRR); add a re-ranking stage  
C) Faithfulness; strengthen the system prompt  
D) Precision@20; reduce the number of documents in the index  

> [!success]- Answer
> **Correct Answer: B**
>
> MRR, fixed with re-ranking.
>
> High recall@20 shows the chunk is found; low MRR shows it is ranked too low. A re-ranker scores the query and each candidate together and moves the best chunk to the top. Overlap and index size do not address ranking, and faithfulness measures the generator.

---

## Question 11 *(Medium)*: Ground Truth for Retrieval Judges *(2026 guide)*

**Question**: Which MLflow built-in judge requires expectations (ground truth) to evaluate retrieval?

A) RetrievalRelevance  
B) RetrievalGroundedness  
C) RetrievalSufficiency  
D) RelevanceToQuery  

> [!success]- Answer
> **Correct Answer: C**
>
> RetrievalSufficiency.
>
> RetrievalSufficiency checks whether the retrieved context contains all the expected facts, so it needs expectations. RetrievalRelevance, RetrievalGroundedness, and RelevanceToQuery judge the request, context, and response without ground truth.

---

## Question 12 *(Hard)*: Latency-Critical Vector Search *(2026 guide)*

**Question**: A retailer serves up to 80 searches per second over 100 million items; latency is the most critical metric and up-front development cost is acceptable. Which configuration best fits?

A) Storage-optimized endpoint with hybrid search and re-ranking on  
B) Standard endpoint with hybrid search and re-ranking on  
C) Fine-tuned custom embedding model on a standard endpoint, hybrid search and re-ranking off  
D) Fine-tuned custom embedding model on a storage-optimized endpoint, hybrid search and re-ranking off  

> [!success]- Answer
> **Correct Answer: C**
>
> Fine-tuned embeddings, standard endpoint, hybrid search and re-ranking off.
>
> Standard endpoints give the lowest query latency, while storage-optimized endpoints add roughly 250 ms. Hybrid search and re-ranking add latency, so they stay off. The team accepts up-front cost, so a fine-tuned embedding model improves accuracy without hurting latency (official sample question 6).

---

**[← Previous: Databricks GenAI Tools](./04-databricks-genai-tools.md) | [↑ Back to Practice Questions](./README.md) | [Next: Agents, MCP & Deployment](./06-agents-mcp-and-deployment.md) →**

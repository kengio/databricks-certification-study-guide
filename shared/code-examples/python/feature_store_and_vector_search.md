---
tags:
  - code-examples
  - python
  - feature-store
  - vector-search
  - ai-search
  - genai
  - ml
---

# Feature Store and Vector Search — Python

PySpark/Python examples for Feature Engineering in Unity Catalog (the Databricks Feature Store) and Mosaic AI Vector Search (now called **AI Search** in the docs).

> [!note] Platform update (Oct 2026)
>
> - **Feature tables:** in Unity Catalog workspaces use `FeatureEngineeringClient` from `databricks.feature_engineering`. The older `databricks.feature_store.FeatureStoreClient` belongs to the legacy Workspace Feature Store and still appears in older material.
> - **Vector Search → AI Search:** "Databricks AI Search (formerly Databricks Vector Search)". The new SDK is `databricks-ai-search` (`from databricks.ai_search.client import AISearchClient`); the `databricks-vectorsearch` package is deprecated but kept as a shim, and `VectorSearchClient` remains a backward-compatible alias — so the `VectorSearchClient` code below still runs and matches the exam-guide wording.

## Feature Store — Create and Write

```python
from databricks.feature_engineering import FeatureEngineeringClient
from pyspark.sql.functions import current_timestamp

fe = FeatureEngineeringClient()

# Compute features from raw data
transactions = spark.table("my_catalog.bronze.transactions")

user_features = (transactions
    .groupBy("user_id")
    .agg(
        {"amount": "sum", "*": "count"}
    )
    .withColumnRenamed("sum(amount)", "lifetime_value")
    .withColumnRenamed("count(1)", "total_transactions")
    .withColumn("computed_at", current_timestamp()))

# Create feature table (first time) — a UC Delta table with a primary key
fe.create_table(
    name="my_catalog.user_features.user_spending",
    primary_keys=["user_id"],
    df=user_features,
    description="User spending features from transactions"
)

# Upsert later batches — rows whose key isn't in the DataFrame stay unchanged
fe.write_table(
    name="my_catalog.user_features.user_spending",
    df=user_features,
    mode="merge"
)
```

## Feature Store — Read and Query

```python
# Read entire feature table as a DataFrame
features_df = fe.read_table(name="my_catalog.user_features.user_spending")

# Filter after reading
high_value_users = features_df.filter("lifetime_value > 1000")

# Time-travel read — feature tables are Delta tables, so Delta time travel works
historical_features = spark.sql("""
    SELECT * FROM my_catalog.user_features.user_spending TIMESTAMP AS OF '2024-01-01'
""")
```

## Feature Store — Training Set

```python
from databricks.feature_engineering import FeatureEngineeringClient, FeatureLookup

fe = FeatureEngineeringClient()

# Define which features to look up and how to join them
feature_lookups = [
    FeatureLookup(
        table_name="my_catalog.user_features.user_spending",
        lookup_key="user_id",
        feature_names=["lifetime_value", "total_transactions"]
    ),
    FeatureLookup(
        table_name="my_catalog.product_features.product_stats",
        lookup_key="product_id",
        feature_names=["avg_price", "purchase_count"]
    )
]

# Labels / join keys
labels_df = spark.table("my_catalog.training.churn_labels")

# Create the training dataset (joins features automatically)
training_set = fe.create_training_set(
    df=labels_df,
    feature_lookups=feature_lookups,
    label="churned",
    exclude_columns=["event_date"]
)

training_df = training_set.load_df().toPandas()
```

## Vector Search (AI Search) — Create Endpoint and Index

### Delta Sync Index (text → embedding auto-generated)

Source table must have CDF enabled (required on standard endpoints; tables with row tracking get it automatically). The index auto-syncs with the table.

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()

# Enable CDF on source table (required for Delta Sync index)
spark.sql("""
    ALTER TABLE my_catalog.docs.chunks
    SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
""")

# Create endpoint ("STANDARD" or "STORAGE_OPTIMIZED")
vsc.create_endpoint(name="rag_endpoint", endpoint_type="STANDARD")

# Create Delta Sync index — Databricks generates embeddings automatically
index = vsc.create_delta_sync_index(
    endpoint_name="rag_endpoint",
    index_name="my_catalog.docs.chunks_index",
    source_table_name="my_catalog.docs.chunks",
    pipeline_type="TRIGGERED",   # "TRIGGERED" or "CONTINUOUS"
    primary_key="chunk_id",
    embedding_source_column="content",           # text to embed
    embedding_model_endpoint_name="databricks-gte-large-en"
)

# Trigger initial sync (TRIGGERED mode only)
index.sync()
```

### Direct Vector Access Index (pre-computed embeddings)

```python
# Create index for pre-computed embeddings
index = vsc.create_direct_vector_access_index(
    endpoint_name="rag_endpoint",
    index_name="my_catalog.docs.custom_index",
    primary_key="chunk_id",
    embedding_dimension=1024,            # must match your embedding model output
    embedding_vector_column="embedding"
)

# Upsert pre-computed vectors
index.upsert([
    {
        "chunk_id": "doc1_chunk0",
        "embedding": [0.12, -0.34, 0.56, ...],  # 1024-dim vector
        "content": "Delta Lake is an open-source...",
        "source": "delta_docs"
    },
    {
        "chunk_id": "doc1_chunk1",
        "embedding": [...],
        "content": "OPTIMIZE command compacts...",
        "source": "delta_docs"
    }
])

# Delete vectors by primary key
index.delete(["doc_old_chunk0", "doc_old_chunk1"])
```

## Vector Search (AI Search) — Similarity Search

```python
index = vsc.get_index(
    endpoint_name="rag_endpoint",
    index_name="my_catalog.docs.chunks_index"
)

# Basic ANN (approximate nearest neighbor) search
results = index.similarity_search(
    query_text="How do I configure Auto Loader?",
    columns=["content", "source", "chunk_id"],
    num_results=5
)

# With metadata filter
results = index.similarity_search(
    query_text="Auto Loader schema evolution",
    columns=["content", "source"],
    num_results=5,
    filters={"source": "official_docs"}    # dict of column: value filters
)

# Hybrid search (keyword + vector)
results = index.similarity_search(
    query_text="checkpoint recovery streaming",
    columns=["content", "source"],
    num_results=5,
    query_type="HYBRID"   # combines BM25 keyword + vector similarity
)

# Using pre-computed query vector (Direct Vector Access index)
results = index.similarity_search(
    query_vector=[0.12, -0.34, 0.56, ...],
    columns=["content", "source"],
    num_results=5
)

# Parse results
for row in results.get("result", {}).get("data_array", []):
    content, source, chunk_id, score = row
    print(f"[{score:.4f}] {source}: {content[:80]}")
```

## Embedding Models

```python
import mlflow.deployments

# Query the Foundation Model API directly for embeddings
client = mlflow.deployments.get_deploy_client("databricks")

response = client.predict(
    endpoint="databricks-gte-large-en",
    inputs={"input": ["Delta Lake uses ACID transactions.",
                      "Auto Loader monitors cloud storage."]}
)

embeddings = [item["embedding"] for item in response["data"]]
print(f"Embedding dimension: {len(embeddings[0])}")  # e.g., 1024
```

```python
# LangChain integration
from langchain_community.embeddings import DatabricksEmbeddings

embeddings_model = DatabricksEmbeddings(
    endpoint="databricks-gte-large-en"
)

vectors = embeddings_model.embed_documents([
    "Delta Lake is an open-source storage layer.",
    "Structured Streaming processes data incrementally."
])
```

## End-to-End RAG Snippet

```python
from databricks.vector_search.client import VectorSearchClient
import mlflow.deployments

vsc = VectorSearchClient()
deploy_client = mlflow.deployments.get_deploy_client("databricks")

def rag_answer(question: str, num_chunks: int = 5) -> str:
    """Retrieve relevant chunks and generate an answer."""

    # 1. Retrieve top-k relevant chunks
    index = vsc.get_index(
        endpoint_name="rag_endpoint",
        index_name="my_catalog.docs.chunks_index"
    )
    results = index.similarity_search(
        query_text=question,
        columns=["content", "source"],
        num_results=num_chunks
    )
    chunks = [row[0] for row in results.get("result", {}).get("data_array", [])]

    # 2. Build context
    context = "\n\n".join(chunks)

    # 3. Generate answer with an LLM
    prompt = f"""Answer the question based on the context below.

Context:
{context}

Question: {question}
Answer:"""

    response = deploy_client.predict(
        endpoint="databricks-meta-llama-3-1-70b-instruct",
        inputs={"messages": [{"role": "user", "content": prompt}]}
    )
    return response["choices"][0]["message"]["content"]

# Usage
answer = rag_answer("How does Auto Loader handle schema evolution?")
print(answer)
```

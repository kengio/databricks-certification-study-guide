---
title: "Lab 05 — Vector Search (AI Search) + RAG Demo"
type: lab
tags:
  - labs
  - mosaic-ai
  - vector-search
  - ai-search
  - rag
  - genai
status: published
---

# Lab 05 — Vector Search (AI Search) + RAG Demo

End-to-end RAG demo: prepare a small documentation corpus, embed it into a Mosaic AI Vector Search index (the product is now called **Databricks AI Search** in the docs), build a `ResponsesAgent` compound app that retrieves + generates, register it in UC, and deploy via `databricks.agents.deploy()`.

> [!abstract]
>
> - **Chunk and embed** documents into a UC Delta table
> - **Vector Search Delta Sync Index** auto-maintains embeddings as the source changes
> - **`ResponsesAgent` subclass** orchestrates retrieve → augment → generate
> - **`databricks.agents.deploy()`** registers in UC, provisions a Model Serving endpoint, enables Inference Tables, wires MLflow tracing — all in one call
> - **Foundation Model APIs** provide the LLM (pay-per-token Llama / Claude / GPT-class) and the embedding model

> [!tip] What you'll exercise
>
> - Building a Vector Search endpoint and a sync index
> - Writing a compound app as one `ResponsesAgent` subclass
> - The full deploy → invoke → audit loop

> [!note] Platform update (Oct 2026)
>
> - **Vector Search → AI Search.** "Databricks AI Search (formerly Databricks Vector Search)". The new SDK is `pip install databricks-ai-search` with `from databricks.ai_search.client import AISearchClient`; the `databricks-vectorsearch` package is deprecated but kept as a shim, and `VectorSearchClient` remains a backward-compatible alias. This lab keeps the `VectorSearchClient` spelling because the GenAI exam guide still says *Vector Search*.
> - **Agents on Model Serving are now legacy.** On Oct 5, 2026 Databricks moved "agents deployed to Model Serving" (the `agents.deploy()` path used in Steps 6–7) and the MLflow `AgentServer` to a Legacy docs section. On Oct 12, 2026 it said: "For new agents written in code, Databricks recommends the Agent Bricks CLI" (Beta) — `pip install databricks-agentbricks`, then `agentbricks init --framework langgraph|openai <name>`, `agentbricks dev`, `agentbricks deploy <name>`, which deploys to **Agent Runtime** with `DurableAgentServer`.
> - **Why the lab keeps the legacy path:** the GenAI Engineer Associate exam (Mar 18, 2026 version) still tests Agent Framework + Model Serving deployment. Use this lab to learn the exam flow; use the Agent Bricks CLI for new production agents.

---

## Setup — UC catalog + schema for the RAG assets

```sql
USE CATALOG main;
CREATE SCHEMA IF NOT EXISTS rag_lab;
```

## Step 1 — Land a small documentation corpus

```python
from pyspark.sql import functions as F

docs = [
    ("D001", "Databricks Auto Loader incrementally ingests new files as they arrive in cloud storage. Use `cloudFiles` as the format. Schema evolution modes: addNewColumns (default), rescue, failOnNewColumns, none."),
    ("D002", "Delta Lake's MERGE INTO is the standard upsert. It supports inserts, updates, and deletes in a single atomic statement. Combine with WHEN MATCHED/NOT MATCHED clauses."),
    ("D003", "Unity Catalog uses a three-level namespace: catalog.schema.object. Catalogs hold schemas; schemas hold tables, views, volumes, models, and functions."),
    ("D004", "Liquid clustering replaces partition columns + Z-ORDER for new Delta tables. Use ALTER TABLE … CLUSTER BY to migrate; run OPTIMIZE table FULL once to back-fill clustering on existing data."),
    ("D005", "Mosaic AI Foundation Model APIs (FMAPI) provide hosted Llama, Claude, and GPT-class models. Two billing modes: pay-per-token (no reserved capacity) and provisioned throughput (reserved tokens/sec)."),
    ("D006", "Mosaic AI Vector Search supports two index types: Delta Sync Index (auto-updated when source Delta table changes) and Direct Vector Access Index (you push vectors via API)."),
    ("D007", "Inference Tables auto-capture every request and response from a Model Serving endpoint into a UC Delta table. Enable via the endpoint's auto_capture_config."),
]

spark.createDataFrame(docs, schema="doc_id STRING, content STRING") \
    .withColumn("ingest_ts", F.current_timestamp()) \
    .write.mode("overwrite") \
    .saveAsTable("main.rag_lab.documents")

# Enable Change Data Feed so Vector Search can sync incrementally
spark.sql("ALTER TABLE main.rag_lab.documents SET TBLPROPERTIES (delta.enableChangeDataFeed = true)")

display(spark.table("main.rag_lab.documents"))
```

## Step 2 — Create the Vector Search endpoint

> [!note]
> Vector Search endpoints take a few minutes to provision. Re-running this cell is idempotent.

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()

endpoint_name = "rag_lab_endpoint"
if not any(e["name"] == endpoint_name for e in vsc.list_endpoints().get("endpoints", [])):
    vsc.create_endpoint(
        name=endpoint_name,
        endpoint_type="STANDARD",  # or "STORAGE_OPTIMIZED" for very large indexes
    )
    print(f"Created endpoint {endpoint_name}; provisioning...")
else:
    print(f"Endpoint {endpoint_name} already exists")
```

## Step 3 — Create the Delta Sync Index

```python
index_name = "main.rag_lab.documents_index"

vsc.create_delta_sync_index(
    endpoint_name=endpoint_name,
    source_table_name="main.rag_lab.documents",
    index_name=index_name,
    pipeline_type="TRIGGERED",       # alternatives: CONTINUOUS
    primary_key="doc_id",
    embedding_source_column="content",
    embedding_model_endpoint_name="databricks-gte-large-en",  # FMAPI-hosted embedding model; any available embedding endpoint works
)

print(f"Created sync index {index_name}; wait for first sync...")
```

## Step 4 — Confirm the index has been populated

```python
import time

# Wait for the sync to finish (up to ~2 minutes for 7 rows)
for _ in range(24):
    status = vsc.get_index(endpoint_name=endpoint_name, index_name=index_name).describe()
    state = status.get("status", {}).get("ready", False)
    if state:
        break
    time.sleep(5)

# Smoke test: retrieve the top-3 documents for a query
results = vsc.get_index(endpoint_name=endpoint_name, index_name=index_name).similarity_search(
    query_text="How do I incrementally ingest new files from S3?",
    columns=["doc_id", "content"],
    num_results=3,
)
for r in results["result"]["data_array"]:
    print(r)
```

Expected: D001 (Auto Loader) ranks first.

## Step 5 — Build the compound RAG app as a `ResponsesAgent`

```python
import uuid

import mlflow
from mlflow.pyfunc import ResponsesAgent
from mlflow.types.responses import ResponsesAgentRequest, ResponsesAgentResponse
from databricks.vector_search.client import VectorSearchClient
from databricks_openai import DatabricksOpenAI  # current Databricks chat client

class RagAgent(ResponsesAgent):
    """Compound: retrieve top-k chunks → augment prompt → generate via FMAPI."""

    def predict(self, request: ResponsesAgentRequest) -> ResponsesAgentResponse:
        # ResponsesAgent puts chat turns in request.input (not .messages);
        # items are pydantic objects, so convert them to dicts first
        messages = [item.model_dump() for item in request.input]
        last_user = next(
            (msg for msg in reversed(messages) if msg.get("role") == "user"),
            messages[-1],
        )
        user_msg = last_user["content"]

        # Step 1: retrieve top-3 docs
        vsc = VectorSearchClient()
        retrieved = vsc.get_index(
            endpoint_name="rag_lab_endpoint",
            index_name="main.rag_lab.documents_index",
        ).similarity_search(
            query_text=user_msg,
            columns=["doc_id", "content"],
            num_results=3,
        )["result"]["data_array"]

        context = "\n\n".join(f"[{r[0]}] {r[1]}" for r in retrieved)

        # Step 2: augment + generate via the current Databricks chat client
        client = DatabricksOpenAI()
        system = (
            "Answer using only the provided context. Cite the doc_id in brackets. "
            "If the context doesn't contain the answer, say you don't know."
        )
        completion = client.chat.completions.create(
            model="databricks-meta-llama-3-3-70b-instruct",  # current pay-per-token Llama
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": f"Context:\n{context}\n\nQuestion: {user_msg}"},
            ],
            max_tokens=512,
            temperature=0.0,
        )

        # ResponsesAgentResponse expects Responses-API output items — use the helper
        return ResponsesAgentResponse(
            output=[
                self.create_text_output_item(
                    text=completion.choices[0].message.content,
                    id=str(uuid.uuid4()),
                )
            ],
            custom_outputs={"usage": completion.usage.model_dump()},
        )
```

## Step 6 — Log + register + deploy in one shot

> [!tip]
> For production, Databricks recommends *models-from-code* logging (`python_model="agent.py"` plus `mlflow.models.set_model(...)` in that file). Logging the in-notebook instance below keeps the lab to one notebook.

```python
mlflow.set_registry_uri("databricks-uc")

with mlflow.start_run(run_name="rag_lab_agent"):
    info = mlflow.pyfunc.log_model(
        python_model=RagAgent(),
        name="agent",  # MLflow 3 uses name= (artifact_path= is the older spelling)
        registered_model_name="main.rag_lab.docs_agent",
    )

from databricks import agents
deployment = agents.deploy(
    model_name="main.rag_lab.docs_agent",
    model_version=info.registered_model_version,
    scale_to_zero=True,
)
print(deployment.query_endpoint)  # REST URL used in Step 7
```

`agents.deploy()` creates a Model Serving endpoint, a Review App, AI Gateway inference tables, and real-time MLflow tracing to the active experiment. (This is the legacy Model Serving path — see the Platform update callout at the top.)

## Step 7 — Invoke and observe

```python
import requests
import json
import os

endpoint = deployment.query_endpoint  # from Step 6
headers = {
    "Authorization": f"Bearer {dbutils.notebook.entry_point.getDbutils().notebook().getContext().apiToken().get()}",
    "Content-Type": "application/json",
}
payload = {
    # ResponsesAgent endpoints take an `input` list (ChatCompletions-style agents took `messages`)
    "input": [
        {"role": "user", "content": "How does Liquid Clustering replace partitioning?"},
    ],
}

resp = requests.post(endpoint, headers=headers, data=json.dumps(payload))
print(json.dumps(resp.json(), indent=2))
```

Expected: an answer citing `[D004]`.

## Step 8 — Inspect the Inference Table

The inference table is created after the endpoint's first request. Copy its full name from the endpoint's page in the **Serving** UI (AI Gateway section), then:

```sql
-- Wait a few minutes after invocations; replace the placeholder with your table name
SELECT status_code, request, response
FROM main.rag_lab.<payload_table>
LIMIT 5;
```

## Step 9 — Score the agent with MLflow 3 evaluation

MLflow 3 replaces the older Agent Evaluation call (`mlflow.evaluate(model_type="databricks-agent")`) with `mlflow.genai.evaluate()` and **scorers**.

```python
import mlflow
from mlflow.genai.scorers import Guidelines, RelevanceToQuery, Safety

questions = [
    "How do I ingest new files incrementally?",
    "What's the modern alternative to Z-ORDER?",
    "Where are served model requests audited?",
    "What two billing modes does FMAPI offer?",
]
# Each row's `inputs` are passed to the endpoint unchanged, so use the ResponsesAgent `input` shape
eval_data = [{"inputs": {"input": [{"role": "user", "content": q}]}} for q in questions]

endpoint_name = "<endpoint name shown in the Serving UI>"
predict_fn = mlflow.genai.to_predict_fn(f"endpoints:/{endpoint_name}")

mlflow.genai.evaluate(
    data=eval_data,
    predict_fn=predict_fn,
    scorers=[
        RelevanceToQuery(),
        Safety(),
        Guidelines(name="cites_doc_id", guidelines="The response must cite a doc_id in square brackets, such as [D001]."),
    ],
)
```

Built-in LLM judges score each response; results appear in the active MLflow experiment's evaluation view.

## Cleanup

```python
from databricks.sdk import WorkspaceClient
w = WorkspaceClient()

# Delete the agent endpoint
agents.delete_deployment(model_name="main.rag_lab.docs_agent")
# Delete the Vector Search index + endpoint
vsc.delete_index(endpoint_name="rag_lab_endpoint", index_name="main.rag_lab.documents_index")
vsc.delete_endpoint(name="rag_lab_endpoint")
```

```sql
DROP TABLE IF EXISTS main.rag_lab.docs_agent_payload;
DROP TABLE IF EXISTS main.rag_lab.documents;
DROP SCHEMA IF EXISTS main.rag_lab CASCADE;
```

## Related Study Material

- [RAG / Vector Search (AI Search) basics (shared)](../shared/fundamentals/rag-vector-search-basics.md)
- [GenAI — Application Development](../certifications/genai-engineer-associate/01-application-development/README.md)
- [GenAI — Data Preparation](../certifications/genai-engineer-associate/04-data-preparation/README.md)
- [GenAI — Compound AI Apps](../certifications/genai-engineer-associate/02-assembling-and-deploying-apps/03-compound-ai-apps.md)
- [GenAI — Online Monitoring](../certifications/genai-engineer-associate/05-evaluation-and-monitoring/02-online-monitoring.md)

---

**[← Previous: MLflow tracking](./04-mlflow-tracking.md) | [↑ Back to Labs](./README.md)**

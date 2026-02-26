---
title: Practice Questions — Databricks GenAI Tools
type: practice-questions
tags: [genai-engineer-associate, practice-questions, foundation-model-apis, mlflow-genai]
status: published
---

# Practice Questions — Databricks GenAI Tools (Domain 4)

7 questions covering Foundation Model APIs, MLflow AI Gateway, and deploying GenAI applications on Databricks.

[← LLM Application Development](./03-llm-application-development.md) | [← Back to Practice Questions](./README.md)

---

## Question 1 *(Medium)*: Foundation Model API Endpoint Types

**Question**: A team deploys a RAG chatbot to production and needs guaranteed low latency with a predictable throughput cap of 100 requests per second. Which Foundation Model API endpoint type should they use?

A) Pay-per-token endpoint — serverless, scales automatically  
B) Provisioned Throughput endpoint — dedicated capacity with guaranteed throughput  
C) External Model endpoint — routes to a third-party provider like OpenAI  
D) Batch Inference endpoint — optimized for large offline workloads  

> [!success]- Answer
> **Correct Answer: B**
>
> Provisioned Throughput endpoints provide dedicated compute capacity with guaranteed throughput (tokens per second) and more predictable latency — appropriate for production SLAs. Pay-per-token endpoints are shared infrastructure with variable latency, suitable for development and low-volume use. External Model endpoints proxy to third-party providers. Batch Inference endpoints are for offline workloads, not real-time serving.

---

## Question 2 *(Easy)*: Pay-per-Token vs Provisioned Throughput

**Question**: A data scientist is prototyping a new GenAI feature and expects fewer than 10 queries per day during development. Which Foundation Model API endpoint type minimizes cost?

A) Provisioned Throughput — always lowest latency  
B) Pay-per-token — no upfront reservation cost; billed only for tokens consumed  
C) External Model — cheapest because it uses third-party infrastructure  
D) Batch Inference — cheapest because it processes multiple requests at once  

> [!success]- Answer
> **Correct Answer: B**
>
> Pay-per-token endpoints have no minimum reservation cost — you pay only for the tokens processed. This makes them ideal for prototyping and low-volume experimentation. Provisioned Throughput reserves dedicated capacity whether or not it is used, making it expensive for low-volume workloads. External Model costs depend on the provider's pricing. Batch Inference is designed for large offline workloads, not interactive development.

---

## Question 3 *(Easy)*: MLflow AI Gateway Purpose

**Question**: An organization uses three different LLM providers (OpenAI, Anthropic, and Databricks Foundation Models). They want a unified API that abstracts provider differences, enforces rate limits, and centralizes credential management. Which Databricks component addresses this?

A) MLflow Model Registry — stores and versions LLM model artifacts  
B) Databricks Vector Search — provides unified search across multiple knowledge bases  
C) MLflow AI Gateway (AI Playground proxy) — unified LLM API with rate limiting and credential management  
D) Unity Catalog — governs access to LLM endpoints via table ACLs  

> [!success]- Answer
> **Correct Answer: C**
>
> MLflow AI Gateway provides a unified REST API that abstracts differences between LLM providers, centralizes API key management (so client applications never need provider credentials directly), and supports rate limiting. This simplifies multi-provider LLM architectures. Model Registry versions models but does not proxy LLM calls. Vector Search handles retrieval, not LLM orchestration. Unity Catalog governs data assets, not LLM API routing.

---

## Question 4 *(Medium)*: Deploying a LangChain Chain as a Model Serving Endpoint

**Question**: A developer has logged a LangChain `RetrievalQA` chain with `mlflow.langchain.log_model(chain, "rag-chain")`. What is the NEXT step to deploy it as a REST endpoint on Databricks?

A) Call `mlflow.pyfunc.serve(model_uri)` on the cluster driver  
B) Register the logged model to the MLflow Model Registry, then create a Model Serving endpoint pointing to that registered model  
C) Export the chain as a `.pkl` file and upload it to DBFS  
D) Save the chain's source code to a Databricks Repo and trigger a CI/CD pipeline  

> [!success]- Answer
> **Correct Answer: B**
>
> The standard Databricks deployment workflow is: (1) log the model with `mlflow.langchain.log_model()`, (2) register it to the Model Registry with `mlflow.register_model()`, (3) create a Model Serving endpoint in the Databricks UI or REST API pointing to the registered model version. `mlflow.pyfunc.serve()` runs a local server, not a production Databricks endpoint. Exporting as `.pkl` or using Repos CI/CD are not the standard Databricks serving workflow.

---

## Question 5 *(Hard)*: MLflow Evaluate for GenAI

**Question**: A developer calls `mlflow.evaluate()` to assess their RAG pipeline on a test dataset. Which argument specifies that the evaluation should use LLM-judge metrics like faithfulness and answer relevance?

A) `model_type="regressor"`  
B) `model_type="question-answering"` with `evaluators="default"`  
C) `evaluator_config={"faithfulness": True}` with `model_type="classifier"`  
D) `extra_metrics=[faithfulness(), answer_relevance()]` with `model_type="question-answering"`  

> [!success]- Answer
> **Correct Answer: D**
>
> To use GenAI-specific LLM-judge metrics in `mlflow.evaluate()`, you pass `model_type="question-answering"` and add the desired metrics via `extra_metrics=[faithfulness(), answer_relevance()]`. These metrics use an LLM-as-judge approach to score responses. `model_type="regressor"` or `"classifier"` enables tabular ML metrics, not GenAI metrics. There is no `evaluator_config={"faithfulness": True}` parameter.

---

## Question 6 *(Easy)*: Inference Tables for LLM Monitoring

**Question**: A team wants to automatically log all requests and responses from a Databricks Model Serving endpoint to a Delta table for monitoring. Which feature enables this?

A) MLflow autolog — automatically captures model inputs and outputs to an experiment  
B) Unity Catalog audit logs — records all data access events system-wide  
C) Inference tables — automatically log endpoint request/response payloads to a Delta table  
D) Lakehouse Monitoring — creates statistical profiles of Delta tables on a schedule  

> [!success]- Answer
> **Correct Answer: C**
>
> Inference tables are a Model Serving feature that automatically writes all requests and responses to a specified Delta table. This enables LLM output monitoring, data drift detection, and downstream evaluation workflows. MLflow autolog captures training data, not serving traffic. Unity Catalog audit logs track data access metadata, not endpoint payload content. Lakehouse Monitoring profiles existing Delta tables but does not capture serving traffic.

---

## Question 7 *(Hard)*: Querying Foundation Model APIs

**Question**: A developer queries the Databricks Foundation Model API using the Python SDK. Which code correctly sends a chat completion request to `databricks-meta-llama-3-1-70b-instruct`?

A)

```python
import mlflow
response = mlflow.models.predict(
    model_name="databricks-meta-llama-3-1-70b-instruct",
    messages=[{"role": "user", "content": "Explain RAG in one sentence."}]
)
```

B)

```python
from databricks.sdk import WorkspaceClient
w = WorkspaceClient()
response = w.serving_endpoints.query(
    name="databricks-meta-llama-3-1-70b-instruct",
    messages=[{"role": "user", "content": "Explain RAG in one sentence."}]
)
```

C)

```python
from openai import OpenAI
client = OpenAI(
    api_key=dbutils.secrets.get("my-scope", "databricks-token"),
    base_url=f"{DATABRICKS_HOST}/serving-endpoints"
)
response = client.chat.completions.create(
    model="databricks-meta-llama-3-1-70b-instruct",
    messages=[{"role": "user", "content": "Explain RAG in one sentence."}]
)
```

D) Both B and C are correct  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks Foundation Model APIs are OpenAI-compatible, so both the Databricks SDK (`WorkspaceClient().serving_endpoints.query()`) and the OpenAI Python client (pointed at the Databricks host) are valid ways to query them. Option A uses `mlflow.models.predict()`, which is not the correct API for querying a serving endpoint directly. Option D correctly identifies that both B and C work.

---

**[← Previous: Practice Questions — LLM Application Development](./03-llm-application-development.md) | [↑ Back to Practice Questions — GenAI Engineer Associate](./README.md)**

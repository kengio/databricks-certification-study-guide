---
title: "Practice Questions — Agents, MCP & Deployment (2026 guide)"
type: practice-questions
tags: [genai-engineer-associate, practice-questions, application-development, assembling-and-deploying-applications, mcp]
status: published
---

# Practice Questions — Agents, MCP & Deployment (2026 guide)

13 questions on 2026 exam-guide bullets in Application Development and Assembling and Deploying Applications: MLflow + Agent Framework, Genie in multi-agent systems, model selection, MCP servers, access control from serving endpoints, `ai_query()`, persistent memory, CI/CD, prompt lifecycle, and user interfaces. Study material: [Agentic Systems](../../01-application-development/05-agentic-systems-mlflow-and-genie.md), [Model Selection](../../01-application-development/06-model-selection-and-response-quality.md), [MCP Servers](../../02-assembling-and-deploying-apps/04-mcp-servers.md), [Access Control and Batch Inference](../../02-assembling-and-deploying-apps/05-access-control-and-batch-inference.md), [Memory, CI/CD, Prompts, and UIs](../../02-assembling-and-deploying-apps/06-memory-cicd-prompts-and-interfaces.md).

---

## Question 1 *(Easy)*: Agent Authoring Interface *(2026 guide)*

**Question**: A team is writing a new tool-calling agent that will be logged with MLflow and deployed on Databricks. Which MLflow interface do Databricks and MLflow recommend for new agents?

A) `mlflow.pyfunc.ChatModel`  
B) `mlflow.pyfunc.ChatAgent`  
C) `mlflow.pyfunc.PythonModel` with a custom JSON schema  
D) `mlflow.pyfunc.ResponsesAgent`  

> [!success]- Answer
> **Correct Answer: D**
>
> `ResponsesAgent`.
>
> MLflow recommends `ResponsesAgent` over `ChatModel` since MLflow 3.0, and Databricks treats `ChatAgent` and `ChatModel` as legacy interfaces. `ResponsesAgent` gives an inferred signature, streaming, and tool-call output items that work with Databricks evaluation and monitoring.

---

## Question 2 *(Medium)*: Genie in a Multi-Agent System *(2026 guide)*

**Question**: A LangGraph supervisor must answer revenue questions from curated sales tables without the LLM writing raw SQL against unfamiliar tables. What should the engineer add?

A) A `GenieAgent` worker pointing at a Genie Space built on the sales tables, declared as a `DatabricksGenieSpace` resource  
B) A Vector Search index over the sales tables' rows  
C) A UC function that returns `SELECT *` from every sales table  
D) A larger LLM with the table schemas pasted into the system prompt  

> [!success]- Answer
> **Correct Answer: A**
>
> A Genie worker over a curated Genie Space.
>
> Genie turns natural-language questions into SQL over curated tables with instructions and example queries, and enforces Unity Catalog permissions. Declaring `DatabricksGenieSpace` lets deployment provision credentials. Embedding table rows or dumping whole tables is neither accurate nor efficient.

---

## Question 3 *(Medium)*: Genie Conversation API *(2026 guide)*

**Question**: A Slack bot backend uses the Genie Conversation API. Which practice does Databricks recommend?

A) Reuse one conversation for all users to share context  
B) Start a new conversation for each user session and poll the message status with backoff  
C) Call `start-conversation` for every follow-up question in the same session  
D) Retry failed requests immediately in a tight loop  

> [!success]- Answer
> **Correct Answer: B**
>
> New conversation per session; poll with backoff.
>
> Reusing threads across sessions reduces accuracy through unintended context reuse. Follow-ups in the same session go to the existing conversation's messages endpoint. The API does not retry for you, so use exponential backoff rather than tight loops.

---

## Question 4 *(Medium)*: Evaluation vs Monitoring *(2026 guide)*

**Question**: Which statement correctly contrasts the evaluation and monitoring phases of a GenAI application?

A) Evaluation uses live traffic; monitoring uses a curated dataset  
B) Evaluation and monitoring must use different scorers  
C) Evaluation runs on a curated dataset that can include ground truth before release; monitoring scores a sample of live traces after release, mostly without ground truth  
D) Monitoring replaces the need for evaluation once an app is deployed  

> [!success]- Answer
> **Correct Answer: C**
>
> Curated dataset before release vs sampled live traces after.
>
> The phases differ in data, coverage, and ground truth, but the same scorers can run in both, and problems found in monitoring feed new evaluation rows.

---

## Question 5 *(Medium)*: Embedding Context Length *(2026 guide)*

**Question**: Documents are chunked to at most 512 tokens, and cost and latency matter more than quality. Which embedding model choice fits best?

A) Context 32768, 14 GB model, 4096 dimensions  
B) Context 514, 0.44 GB model, 768 dimensions  
C) Context 2048, 11 GB model, 2560 dimensions  
D) Context 512, 0.13 GB model, 384 dimensions  

> [!success]- Answer
> **Correct Answer: D**
>
> The 512-token, smallest, lowest-dimension model.
>
> The window only needs to cover 512-token chunks. Larger windows, models, and dimensions add cost and latency with no benefit for these chunks (official sample question 4).

---

## Question 6 *(Easy)*: Choosing an MCP Server Type *(2026 guide)*

**Question**: An agent must run natural-language analytics over governed workspace data. Databricks already provides a managed MCP server for this. What should the engineer do?

A) Use the Databricks-provided (managed) Genie MCP server  
B) Build a custom MCP server on Databricks Apps that calls the SQL API  
C) Register the Databricks SQL REST API as an external MCP server  
D) Give the agent a personal access token and let it call REST endpoints directly  

> [!success]- Answer
> **Correct Answer: A**
>
> Use the managed MCP server.
>
> When Databricks already provides the capability, a managed MCP server is the lowest-maintenance option and keeps Unity Catalog permissions enforced. Custom or external wrappers add code and credentials to maintain.

---

## Question 7 *(Hard)*: External MCP Credentials *(2026 guide)*

**Question**: A third-party search service ships its own MCP server that requires an API key. Which integration minimises maintenance and protects the key?

A) Hard-code the key in the agent's Python file  
B) Register the server as an external MCP and keep the key in a governed secret store or Unity Catalog connection referenced by the configuration  
C) Put the key in the system prompt so the model can pass it to the tool  
D) Rebuild the vendor's tools inside a custom MCP server on Databricks Apps  

> [!success]- Answer
> **Correct Answer: B**
>
> Register it as an external MCP with the key in a governed store.
>
> Registering the existing server avoids rewriting it, and storing the credential in a governed store keeps it out of code and prompts. Callers are then granted `EXECUTE` on the MCP service rather than access to the key.

---

## Question 8 *(Medium)*: Per-User Data Access *(2026 guide)*

**Question**: A deployed agent queries tables protected by row filters, and each employee must see only their own region's rows. Which authentication method should the agent use for those queries?

A) Automatic authentication passthrough  
B) A service principal token stored as a secret  
C) On-behalf-of-user authentication with declared API scopes  
D) The workspace admin's personal access token  

> [!success]- Answer
> **Correct Answer: C**
>
> On-behalf-of-user authentication.
>
> OBO runs calls with the end user's identity, so row filters and column masks apply per user. Passthrough and service principals give every user the same access, and admin tokens violate least privilege.

---

## Question 9 *(Easy)*: Declaring Resources *(2026 guide)*

**Question**: An agent works in a notebook but returns permission errors on Vector Search after deployment with automatic authentication passthrough. What is the most likely cause?

A) MLflow autologging was enabled  
B) The endpoint uses pay-per-token pricing  
C) The model was registered in Unity Catalog  
D) The index was not declared in `resources` when the model was logged  

> [!success]- Answer
> **Correct Answer: D**
>
> The index was missing from `resources`.
>
> Automatic passthrough provisions short-lived credentials only for resources declared at logging time, after checking the endpoint creator can access them. Re-log with the index declared and redeploy.

---

## Question 10 *(Medium)*: Batch Inference *(2026 guide)*

**Question**: A team must summarise 2 million support tickets every night and write the results to a Delta table; nobody waits for individual answers. What is the most appropriate approach?

A) Run `ai_query()` (or `ai_summarize`) over the ticket table in a scheduled job  
B) Call a real-time agent endpoint once per ticket from a Python loop  
C) Deploy a new provisioned-throughput endpoint per ticket batch  
D) Use the Review App to process tickets  

> [!success]- Answer
> **Correct Answer: A**
>
> `ai_query()` or a task-specific AI Function in a scheduled job.
>
> This is a batch workload: high volume, scheduled, no user waiting. AI Functions apply the model over a table from SQL or a pipeline, and `failOnError => false` keeps a single bad row from failing the job.

---

## Question 11 *(Medium)*: Conversation Memory *(2026 guide)*

**Question**: An agent served by several replicas forgets earlier turns when requests land on different replicas. What fixes this?

A) Increase the endpoint's workload size  
B) Store session state in an external durable store keyed by session ID, such as a Lakebase-backed session store  
C) Raise the model's temperature  
D) Cache conversations in a Python global variable  

> [!success]- Answer
> **Correct Answer: B**
>
> Persist session state externally, keyed by session ID.
>
> Process memory is lost on restarts and is not shared across replicas. A durable store keyed by session or thread ID lets any replica reload the conversation.

---

## Question 12 *(Medium)*: Prompt Promotion *(2026 guide)*

**Question**: Prompts must be updated in development, validated in staging, promoted to production after approval, keep full history, and support rollback. Which approach fits?

A) Merge the staging branch into production after tests pass  
B) Overwrite a JSON file on the CI runner on each run  
C) Register prompts as MLflow prompt versions and promote them with aliases  
D) Overwrite a Delta table of prompts on every deployment  

> [!success]- Answer
> **Correct Answer: C**
>
> MLflow prompt versions plus aliases.
>
> The Prompt Registry keeps immutable versions and movable aliases such as `staging` and `production`; promotion and rollback are alias moves, and the application loads `prompts:/catalog.schema.name@production` (official sample question 7).

---

## Question 13 *(Hard)*: Agent User Interface *(2026 guide)*

**Question**: Support staff must ask questions grounded in internal PDFs through a web app that uses corporate sign-in, never exposes long-lived tokens in the browser, and respects each user's permissions. Which design meets all requirements?

A) Embed a personal access token in the app's JavaScript and call the agent from the browser  
B) Copy the PDFs to a public bucket so the agent can read them without identity checks  
C) Make the agent endpoint public and protect it with an API key in the front end  
D) Use a Databricks App whose backend calls the agent endpoint with the app's or the signed-in user's credentials  

> [!success]- Answer
> **Correct Answer: D**
>
> A Databricks App backend calls the agent.
>
> The App authenticates users with corporate identity and keeps credentials server-side; user authorization enforces per-user permissions. Every other option exposes secrets or data (official sample question 8).

---

**[← Previous: Design Applications & Data Preparation](./05-design-and-data-preparation.md) | [↑ Back to Practice Questions](./README.md) | [Next: Evaluation, Monitoring & Governance](./07-evaluation-monitoring-and-governance.md) →**

---
title: Official Resources — GenAI Engineer Associate
type: reference
tags: [genai-engineer-associate, official-links]
status: published
---

# Official Resources and Documentation Links

Curated list of official Databricks, MLflow, and related documentation relevant to the GenAI Engineer Associate exam. Links verified 2026-10-26. Several products were renamed or moved to *legacy* in 2026; the notes column says which name the exam uses.

## Certification

| Resource | URL |
|---|---|
| Databricks GenAI Engineer Associate Certification Page | <https://www.databricks.com/learn/certification/genai-engineer-associate> |
| Exam Guide (PDF, August 2026 edition — exam published March 18, 2026) | <https://www.databricks.com/sites/default/files/2026-10/databricks-certified-gen-ai-associate-exam-guide-august-2026.pdf> |
| Certification overview and FAQ | <https://www.databricks.com/learn/certification> |
| Release notes (October 2026) | <https://docs.databricks.com/aws/en/release-notes/product/2026/october> |

## Foundation Model APIs and Model Serving

| Resource | URL |
|---|---|
| Supported foundation models (endpoint names, context windows) | <https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models> |
| Pre-trained models in Unity Catalog and Marketplace | <https://docs.databricks.com/aws/en/generative-ai/pretrained-models> |
| Configure access to resources from model serving endpoints (secrets) | <https://docs.databricks.com/aws/en/machine-learning/model-serving/store-env-variable-model-serving> |
| AI Functions (`ai_query`, `ai_parse_document`, `ai_extract`, `ai_mask`, …) | <https://docs.databricks.com/aws/en/large-language-models/ai-functions> |
| `ai_query` function reference | <https://docs.databricks.com/aws/en/sql/language-manual/functions/ai_query> |

## Vector Search (now Databricks AI Search)

| Resource | URL |
|---|---|
| Databricks AI Search overview (formerly Vector Search) | <https://docs.databricks.com/aws/en/ai-search/ai-search> |
| Create AI Search endpoints and indexes | <https://docs.databricks.com/aws/en/ai-search/create-ai-search> |
| Query an AI Search index | <https://docs.databricks.com/aws/en/ai-search/query-ai-search> |

## Agents: Agent Framework, Agent Bricks, Genie, MCP

| Resource | URL | Note |
|---|---|---|
| Develop agents on Databricks (Agent Bricks) | <https://docs.databricks.com/aws/en/agents/> | Current landing page |
| Knowledge Assistant | <https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant> | Legacy since 2026-10-12; exam-tested |
| Supervisor Agent (Multi-Agent Supervisor) | <https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor> | Legacy since 2026-10-12; exam-tested |
| Information Extraction | <https://docs.databricks.com/aws/en/agents/agent-bricks/info-extraction> | Current version uses `ai_extract` |
| Legacy agent offerings (replacement map) | <https://docs.databricks.com/aws/en/agents/legacy/> | |
| Agent Bricks CLI (Beta) | <https://docs.databricks.com/aws/en/agents/custom-agents/agent-bricks-cli> | New code-first path |
| Deploy agents on Databricks (Agent Runtime) | <https://docs.databricks.com/aws/en/agents/deploy/> | |
| Deploy an agent on Model Serving (`agents.deploy()`) | <https://docs.databricks.com/aws/en/agents/custom-agents/model-serving/deploy-agent> | Legacy; exam-tested |
| Authentication for agents (Model Serving) | <https://docs.databricks.com/aws/en/agents/custom-agents/model-serving/agent-authentication-model-serving> | Passthrough, OBO, manual |
| Legacy agent schema (`ChatAgent`, `ChatModel`) | <https://learn.microsoft.com/en-us/azure/databricks/generative-ai/agent-framework/agent-legacy-schema> | Migrate to `ResponsesAgent` |
| Use Genie in multi-agent systems | <https://docs.databricks.com/aws/en/agents/custom-agents/model-serving/multi-agent-genie> | |
| Genie Agents API (Conversation API) | <https://docs.databricks.com/aws/en/genie-agents/conversation-api> | Genie Spaces renamed Genie Agents 2026-07-08 |
| MCPs on Databricks | <https://docs.databricks.com/aws/en/agents/mcp-tools/> | |
| Databricks-provided MCPs | <https://docs.databricks.com/aws/en/agents/mcp-tools/built-in-mcp-services> | `system.ai.*` via Unity Gateway |
| Genie One MCP server | <https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp> | `/api/2.0/mcp/genie` sunsets 2026-10-31 |
| External MCP servers | <https://docs.databricks.com/aws/en/ai-gateway/register-mcp-service> | |
| Custom MCP servers (Databricks Apps) | <https://docs.databricks.com/aws/en/agents/mcp-tools/custom-mcp> | |
| Agent memory and sessions | <https://docs.databricks.com/aws/en/agents/custom-agents/stateful-agents> | Lakebase-backed |
| Databricks Genie app in Microsoft Teams | <https://docs.databricks.com/aws/en/integrations/msft-teams> | Public Preview |

## MLflow for GenAI

| Resource | URL |
|---|---|
| ResponsesAgent introduction | <https://mlflow.org/docs/latest/genai/flavors/responses-agent-intro/> |
| Scorers and LLM judges | <https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/scorers> |
| Built-in LLM judges (which need ground truth) | <https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/judges/> |
| Code-based (custom) scorers | <https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/custom-scorers> |
| Align judges with human feedback | <https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/align-judges> |
| Collect feedback and build datasets | <https://docs.databricks.com/aws/en/mlflow3/genai/human-feedback/> |
| Set up production monitoring (Agent Monitoring) | <https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/production-monitoring> |
| Prompt Registry | <https://docs.databricks.com/aws/en/mlflow3/genai/prompt-version-mgmt/prompt-registry/> |
| Tutorial: Evaluate and improve an agent | <https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/evaluate-app> |

## AI Gateway, Unity Gateway, and Guardrails

| Resource | URL |
|---|---|
| Governance for model serving endpoints (AI Gateway, legacy) | <https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints> |
| Configure AI Gateway on serving endpoints (usage tracking, payload logging, rate limits, guardrails) | <https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints> |
| Inference tables for serving endpoints | <https://docs.databricks.com/aws/en/ai-gateway/inference-tables-serving-endpoints> |
| AI governance with Unity Gateway | <https://docs.databricks.com/aws/en/ai-gateway/> |
| Unity Gateway usage tracking (`system.ai_gateway.usage`) | <https://docs.databricks.com/aws/en/ai-gateway/usage-tracking> |
| Unity Gateway rate limits | <https://docs.databricks.com/aws/en/ai-gateway/rate-limits> |
| Manage budgets for Unity Gateway | <https://docs.databricks.com/aws/en/ai-gateway/budgets> |
| Govern an MCP | <https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service> |

## Practice Resources

| Resource | URL |
|---|---|
| Databricks Academy and training catalog | <https://www.databricks.com/learn/training> |
| Databricks Free Edition (replaces the retired Community Edition) | <https://docs.databricks.com/aws/en/getting-started/free-edition> |
| Free Edition limitations (no Knowledge Assistant; one AI Search endpoint) | <https://docs.databricks.com/aws/en/getting-started/free-edition-limitations> |
| Multi-agent Genie + LangGraph example notebook | <https://docs.databricks.com/aws/en/notebooks/source/generative-ai/langgraph-multiagent-genie.html> |

> [!note]
> Databricks Community Edition was retired on January 1, 2026 ([Databricks community announcement](https://community.databricks.com/t5/announcements/psa-community-edition-retires-on-january-1-2026-move-to-the-free/m-p/141888)). Use **Free Edition** for hands-on practice; the exam guide's hands-on checklist is sized for it.

---

[← Back to Resources](./README.md)

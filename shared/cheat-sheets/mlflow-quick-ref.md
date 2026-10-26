---
tags: [cheat-sheet, mlflow, machine-learning, ml-associate, ml-professional, genai]
---

# MLflow Quick Reference

Quick reference for MLflow tracking, Unity Catalog model registry, evaluation, tracing, and agent APIs on Databricks. Code targets **MLflow 3** (current Databricks practice as of Oct 2026); the [MLflow 2 → 3 mapping](#mlflow-2--3-mapping) at the end lists what changed.

## Experiment Tracking

```python
import mlflow

# Set experiment (creates if not exists)
mlflow.set_experiment("/Users/team/my-experiment")

# Start a run
with mlflow.start_run(run_name="my-run"):
    mlflow.log_param("lr", 0.01)            # Single param
    mlflow.log_params({"n_trees": 100, "depth": 5})  # Multiple params

    mlflow.log_metric("accuracy", 0.92)      # Single metric
    mlflow.log_metric("loss", 0.08, step=10) # Metric with step

    mlflow.log_artifact("plot.png")          # Single file
    mlflow.log_artifacts("outputs/")         # Directory

    mlflow.set_tag("team", "ml-platform")
```

## Autologging

```python
mlflow.autolog()                          # All supported ML frameworks
mlflow.sklearn.autolog()                  # sklearn only
mlflow.xgboost.autolog()
mlflow.pytorch.autolog()
mlflow.tensorflow.autolog()
mlflow.spark.autolog()

# GenAI libraries: autolog captures traces (see Tracing below)
mlflow.openai.autolog()
mlflow.langchain.autolog()                # also covers LangGraph
```

## Logging Models

In MLflow 3 a logged model is a first-class **LoggedModel** with its own ID. Pass `name=` (not `artifact_path=`), and load or register through the URI that `log_model` returns. An active run is no longer required.

```python
from mlflow.models import infer_signature

signature = infer_signature(X_train, model.predict(X_train))

with mlflow.start_run():
    model_info = mlflow.sklearn.log_model(model, name="model", signature=signature)

print(model_info.model_uri)   # models:/<model_id>
print(model_info.model_id)

# PyTorch
mlflow.pytorch.log_model(torch_model, name="model")

# Custom Python function
mlflow.pyfunc.log_model(name="model", python_model=MyModel(), artifacts={"weights": "w.bin"})
```

## Unity Catalog Model Registry

MLflow 3 defaults the registry URI to `databricks-uc`. Setting it explicitly is harmless and keeps the code working on MLflow 2.x clients. Registered model names are three-level: `<catalog>.<schema>.<model>`.

```python
import mlflow
from mlflow import MlflowClient

mlflow.set_registry_uri("databricks-uc")   # default in MLflow 3; required on MLflow 2.x
model_name = "prod_catalog.ml_models.churn_model"

# Pick one option; each registration creates a new model version
# Option 1: register while logging
mlflow.sklearn.log_model(model, name="model", registered_model_name=model_name)

# Option 2: register an already-logged model
mv = mlflow.register_model(model_info.model_uri, model_name)

client = MlflowClient()
client.set_registered_model_alias(model_name, "champion", mv.version)   # set or reassign
champion = client.get_model_version_by_alias(model_name, "champion")    # look up
client.delete_registered_model_alias(model_name, "challenger")          # remove

model = mlflow.pyfunc.load_model(f"models:/{model_name}@champion")
```

## Legacy Workspace Registry — Stages

> [!warning]
> Stages are **not supported** for models in Unity Catalog. Use aliases (`@champion`) and environment-specific catalogs instead. Stages only exist in the legacy workspace registry (`mlflow.set_registry_uri("databricks")`).

| Stage | Description |
| :--- | :--- |
| `None` | Newly registered |
| `Staging` | Testing / validation |
| `Production` | Serving live traffic |
| `Archived` | Retired |

```python
# Legacy workspace registry only (two-level name, no catalog)
client.transition_model_version_stage("my_model", version=3, stage="Production")
model = mlflow.pyfunc.load_model("models:/my_model/Production")
```

## Loading Models

```python
# Generic (any framework)
model = mlflow.pyfunc.load_model("models:/prod_catalog.ml_models.churn_model@champion")
predictions = model.predict(df)

# Framework-specific: by registered version, or by the logged-model URI
model = mlflow.sklearn.load_model("models:/prod_catalog.ml_models.churn_model/3")
model = mlflow.pytorch.load_model(model_info.model_uri)

# Spark UDF for batch inference
udf = mlflow.pyfunc.spark_udf(
    spark, "models:/prod_catalog.ml_models.churn_model@champion", result_type="double"
)
df = df.withColumn("prediction", udf(*feature_cols))
```

## Searching Runs

```python
runs = mlflow.search_runs(
    experiment_names=["/Users/team/my-experiment"],
    filter_string="metrics.f1_score > 0.85 AND params.model_type = 'rf'",
    order_by=["metrics.f1_score DESC"],
    max_results=10
)
# Returns pandas DataFrame
```

## Classic ML Evaluation

`mlflow.evaluate()` is deprecated as of MLflow 3.0. For classic (non-LLM) models use `mlflow.models.evaluate()`, which keeps the same arguments minus the LLM-specific features.

```python
with mlflow.start_run():
    results = mlflow.models.evaluate(
        model="models:/prod_catalog.ml_models.churn_model@champion",
        data=eval_df,
        targets="label",
        model_type="classifier",   # or "regressor"
        evaluators="default",
    )
print(results.metrics["accuracy_score"])
```

## Tracing (GenAI)

```python
import mlflow
from mlflow.entities import SpanType

mlflow.openai.autolog()   # automatic spans for every OpenAI client call

@mlflow.trace(span_type=SpanType.RETRIEVER)   # retriever span: needed by RetrievalGroundedness
def retrieve(question: str) -> list[str]:
    ...

@mlflow.trace                                # root span for the app
def answer(question: str) -> str:
    docs = retrieve(question)
    with mlflow.start_span(name="build_prompt") as span:
        span.set_inputs({"n_docs": len(docs)})
        prompt = "\n".join(docs) + "\n\nQuestion: " + question
        span.set_outputs(prompt)
    ...
```

## GenAI Evaluation — `mlflow.genai.evaluate`

Records carry `inputs` (passed to `predict_fn` as keyword arguments) and optional `expectations` (ground truth for scorers such as `Correctness`).

```python
import mlflow
from mlflow.genai.scorers import (
    Correctness, Guidelines, RelevanceToQuery, RetrievalGroundedness, Safety, scorer,
)

eval_data = [
    {
        "inputs": {"question": "What is Delta Lake?"},
        "expectations": {"expected_response": "An open storage layer that adds ACID transactions to data lakes."},
    },
    {
        "inputs": {"question": "How does Auto Loader work?"},
        "expectations": {"expected_facts": ["cloudFiles source", "incremental file discovery"]},
    },
]

@scorer
def is_concise(outputs) -> bool:              # custom code-based scorer
    return len(str(outputs).split()) < 150

results = mlflow.genai.evaluate(
    data=eval_data,
    predict_fn=answer,                       # called as answer(question=...)
    scorers=[
        Correctness(),                       # needs expectations
        RelevanceToQuery(),
        Safety(),
        RetrievalGroundedness(),             # needs a RETRIEVER span in the trace
        Guidelines(name="cites_sources", guidelines="The answer must cite a source document."),
        is_concise,
    ],
)
print(results.run_id, results.metrics)
```

```python
# Evaluate an app already deployed to Model Serving
predict_fn = mlflow.genai.to_predict_fn("endpoints:/my-chatbot-endpoint")
chat_data = [{"inputs": {"messages": [{"role": "user", "content": "What is Delta Lake?"}]}}]
results = mlflow.genai.evaluate(data=chat_data, predict_fn=predict_fn, scorers=[RelevanceToQuery()])
```

## Agents — `ResponsesAgent`

`ChatAgent` and `ChatModel` are legacy schemas; author new agents with `ResponsesAgent`.

```python
# agent.py
from mlflow.models import set_model
from mlflow.pyfunc import ResponsesAgent
from mlflow.types.responses import ResponsesAgentRequest, ResponsesAgentResponse

class MyAgent(ResponsesAgent):
    def predict(self, request: ResponsesAgentRequest) -> ResponsesAgentResponse:
        item = self.create_text_output_item(text="Hello!", id="msg_1")
        return ResponsesAgentResponse(output=[item])

set_model(MyAgent())
```

```python
# notebook: log the agent from its code file
with mlflow.start_run():
    logged_agent_info = mlflow.pyfunc.log_model(name="agent", python_model="agent.py")
```

> [!note] Platform update (Oct 2026)
> On Oct 5, 2026 Databricks moved agents deployed to Model Serving (`databricks.agents.deploy()`) and the MLflow `AgentServer` to a Legacy docs section. For new code agents it recommends the **Agent Bricks CLI** (Beta), which deploys to **Agent Runtime** with `DurableAgentServer`. Exams written before Oct 2026 still test the `agents.deploy()` path.

```bash
pip install databricks-agentbricks
agentbricks login --profile <profile>
agentbricks init --framework langgraph my-agent   # or --framework openai
agentbricks dev                                   # local server on port 8000
agentbricks deploy my-agent                       # deploys to Agent Runtime
```

## Model Serving — `served_entities`

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import EndpointCoreConfigInput, ServedEntityInput

w = WorkspaceClient()
w.serving_endpoints.create(
    name="churn-model",
    config=EndpointCoreConfigInput(
        served_entities=[
            ServedEntityInput(
                entity_name="prod_catalog.ml_models.churn_model",   # UC three-level name
                entity_version="3",
                workload_size="Small",
                scale_to_zero_enabled=True,
            )
        ]
    ),
)
```

## MLflow 2 → 3 Mapping

| MLflow 2.x pattern | MLflow 3 / current Databricks practice |
| :--- | :--- |
| `log_model(model, "model")` / `artifact_path="model"` | `log_model(model, name="model")` (`artifact_path` deprecated) |
| Load with `runs:/<run_id>/model` | Load or register with `model_info.model_uri` (`models:/<model_id>`); `runs:/` still loads but is deprecated |
| Must log inside `mlflow.start_run()` | Models can be logged without an active run (LoggedModel) |
| `mlflow.set_registry_uri("databricks-uc")` required | `databricks-uc` is the default registry URI |
| Stages (`Staging` / `Production`) | Aliases (`@champion`) via `MlflowClient` alias APIs; stages unsupported in UC |
| `mlflow.evaluate()` for classic ML | `mlflow.models.evaluate()` (`mlflow.evaluate` deprecated) |
| `mlflow.evaluate(model_type="question-answering")`, `mlflow.metrics.genai.*`, `make_genai_metric` | `mlflow.genai.evaluate(data=..., predict_fn=..., scorers=[...])` with `mlflow.genai.scorers` (`Correctness`, `Guidelines`, `@scorer`, ...) |
| `mlflow.evaluate(model="endpoints:/...")` | `predict_fn=mlflow.genai.to_predict_fn("endpoints:/...")` |
| `mlflow.evaluate(model_type="databricks-agent")` (Agent Evaluation) | `mlflow.genai.evaluate()` + scorers |
| `ChatModel` / `ChatAgent` | `ResponsesAgent` |
| `databricks.agents.deploy()` to Model Serving | Agent Bricks CLI → Agent Runtime (Model Serving agents legacy since Oct 5, 2026) |
| `served_models` / `ServedModelInput` | `served_entities` / `ServedEntityInput` |

## Key Numbers

| Setting | Value |
| :--- | :--- |
| Default artifact storage (Databricks) | DBFS or UC volumes |
| Default registry URI (MLflow 3) | `databricks-uc` |
| Model URI formats | `models:/<model_id>`, `models:/<name>/<version>`, `models:/<name>@<alias>`, `runs:/<run_id>/<path>` (deprecated) |
| Autolog frameworks | sklearn, XGBoost, LightGBM, PyTorch, TF, Keras, Spark ML, HuggingFace; GenAI tracing for OpenAI, LangChain / LangGraph and others |

## Common Errors

| Error | Fix |
| :--- | :--- |
| `MlflowException: Run not active` | Use `with mlflow.start_run():` or call `mlflow.end_run()` |
| `Model not found in registry` | Check spelling and that the model was registered, not just logged |
| Registration fails with a two-level model name | MLflow 3 defaults to UC: use `catalog.schema.model`, or `set_registry_uri("databricks")` for the legacy workspace registry |
| Alias not found | Use `client.get_model_version_by_alias()` to verify the alias exists |
| `RetrievalGroundedness` fails or is skipped | The trace has no `RETRIEVER` span; decorate the retriever with `@mlflow.trace(span_type=SpanType.RETRIEVER)` |

## Related Topics

- [MLflow Basics (Fundamentals)](../fundamentals/mlflow-basics.md)
- [MLflow Patterns — Python](../code-examples/python/mlflow_patterns.md)
- [ML Inference Examples](../code-examples/python/ml_inference_examples.md)
- [ML Associate Certification](../../certifications/ml-associate/README.md)
- [Interview Prep — GenAI & RAG Design](../interview-prep/15-genai-rag-design.md)

## Official Documentation

- [Get started with MLflow 3 — Databricks](https://docs.databricks.com/aws/en/mlflow/mlflow-3-install)
- [MLflow 3 migration (`name=`, LoggedModel, `models:/<model_id>`) — mlflow.org](https://www.mlflow.org/docs/latest/ml/mlflow-3/)
- [Manage model lifecycle in Unity Catalog (aliases, default registry)](https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/)
- [Legacy LLM evaluation (`mlflow.evaluate` deprecation, `mlflow.models.evaluate`) — mlflow.org](https://mlflow.org/docs/latest/genai/eval-monitor/legacy-llm-evaluation/)
- [Evaluate and improve a GenAI app — Databricks](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/evaluate-app)
- [MLflow evaluation examples for GenAI (`to_predict_fn`, expectations)](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/eval-examples)
- [Built-in LLM judges](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/concepts/judges/)
- [Manual and custom tracing (`@mlflow.trace`, `start_span`)](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/manual-tracing)
- [ResponsesAgent — mlflow.org](https://mlflow.org/docs/latest/genai/serving/responses-agent/)
- [Legacy agent schemas (`ChatAgent` / `ChatModel`)](https://docs.databricks.com/aws/en/generative-ai/agent-framework/agent-legacy-schema)
- [Agent Bricks CLI](https://docs.databricks.com/aws/en/agents/custom-agents/agent-bricks-cli)
- [Databricks release notes — October 2026](https://docs.databricks.com/aws/en/release-notes/product/2026/october)
- [Create and manage serving endpoints (`served_entities`)](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints)

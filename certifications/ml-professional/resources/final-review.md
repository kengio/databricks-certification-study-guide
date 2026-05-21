---
title: Final Review — ML Professional
type: final-review
tags:
  - ml-professional
  - final-review
  - exam-morning
status: published
---

# Final Review — ML Professional (20-minute exam-morning scan)

## 2-minute facts that show up *most often*

- **Feature Engineering in UC** (replaces workspace Feature Store); supports **point-in-time lookup** + **online stores**
- **Hyperopt** `fmin(fn, space, algo=tpe.suggest, ...)` with **`SparkTrials`** to parallelise; pair with `mlflow.autolog()`
- **Search space**: `hp.choice`, `hp.uniform`, `hp.loguniform`, `hp.quniform`
- **Distributed training**: SparkML pipelines for batch; HorovodRunner / TorchDistributor for deep learning
- **Model Registry in UC**: `databricks-uc` registry URI; aliases (`Production` / `Challenger`) replace stages
- **`databricks.agents.deploy()`** provisions a Model Serving endpoint + Inference Tables in one call (for compound apps)
- **Lakehouse Monitoring** profiles: snapshot (static), time-series (drift over time), inference (model quality)
- **Traffic splitting** is a Mosaic AI Model Serving feature (`traffic_config = {"routes": [...]}`) — not a Unity AI Gateway policy
- **Inference Tables** = audit-of-record for every served request/response

## 5-minute per-domain quick-fire (3 domains — 44/44/12)

### 01 — Model Development (44 %)

- **Feature tables** in UC: declare schema, primary key (+ optional timestamp_key for time-series joins)
- **Point-in-time lookup**: training join uses feature values *as of* the event timestamp; prevents leakage
- **Online store**: low-latency feature serving (DynamoDB / Cosmos DB / Aurora) — config via `publish_table`
- **Hyperopt + SparkTrials**: trials run in parallel across workers; `SparkTrials(parallelism=N)`
- **TPE (Tree-structured Parzen Estimator)**: `algo=tpe.suggest` — Bayesian-ish, samples next trial from prior results
- **Avoid `parallelism=N` with Bayesian methods** going beyond ~8 — degrades sequential learning

### 02 — ML Ops (44 %)

- **Alias promotion** is atomic — `set_registered_model_alias(name, alias, version)` flips Challenger → Production
- **Lifecycle orchestration**: Asset Bundles + Lakeflow Jobs schedule retrain / eval / deploy DAGs
- **Lakehouse Monitoring** auto-computes drift metrics; baseline + comparison windows
- **Drift detection**: KS test for continuous features; chi-square for categorical; thresholds tuned per use case
- **`system.access.audit`** for governance audits; `system.serving.endpoint_usage` for cost / throughput
- **Inference Tables**: Model Serving uses legacy schema (`request`, `response`, `timestamp_ms`, `databricks_request_id`); AI Gateway-unified schema uses `request_time`

### 03 — Model Deployment (12 %)

- **`served_entities`**: list of UC-registered models served on one endpoint
- **`traffic_config`**: weighted `routes` summing to 100 % across `served_model_name`s
- **Canary**: 5–10 % to new version → measure Inference Tables → ramp to 100 %
- **Provisioned throughput** = reserved tokens/sec; **Pay-per-token** = no reservation, per-call billing

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| "Traffic splitting is a Unity AI Gateway policy" | False — it's a Mosaic AI Model Serving feature (gateway observes but doesn't define) |
| "Hyperopt fully parallel" | Bayesian search degrades past ~8-way parallelism; use grid/random if you need more |
| "Where do Feature Tables live now?" | Unity Catalog (Feature Engineering in UC) |
| "Stages: Production / Staging" | Deprecated — aliases |
| "Best baseline drift test for continuous features" | KS test; chi-square for categorical |
| "Audit trail of every served request" | Inference Tables |

## Today's exam — 120-minute time budget

- **59 questions ÷ 120 minutes ≈ 2 min/question** — manage time on multi-paragraph scenarios
- Multi-step scenarios: identify the **final state** first, then work backwards to the choice that gets there with the fewest moving parts
- "Most-managed Databricks" still wins: Lakehouse Monitoring > custom drift code; Feature Engineering in UC > hand-rolled feature tables; UC Registry > workspace
- Watch for **API names that look right but are wrong** (e.g., `evaluators=["llm_as_judge"]` is fictional — the real path is `model_type="databricks-agent"`)

## Eat. Hydrate. Breathe.

You've put in the hours. Trust the prep. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to ML Professional](../README.md)**

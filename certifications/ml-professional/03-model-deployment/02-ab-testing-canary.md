---
title: A/B Testing and Canary Deployments
type: study-material
tags:
  - ab-testing
  - canary-deployment
  - traffic-splitting
  - champion-challenger
  - inference-tables
status: published
---

# A/B Testing and Canary Deployments

## Overview

A/B testing and canary deployments are the standard methods for safely comparing model versions in
production without committing to a full rollout. The goal is to expose a new challenger model to a
subset of real traffic and measure whether it outperforms the existing champion model on business
and technical metrics.

The **champion-challenger framework** names the current production model the "champion" and any
candidate replacement the "challenger." The challenger must earn its promotion by demonstrating
measurable improvement during a controlled experiment. Three deployment strategies exist along a
risk spectrum:

- **Shadow deployment**: zero user impact, challenger runs in parallel with no predictions served
- **Canary deployment**: small percentage of traffic routed to challenger, real users affected
- **Full A/B test**: 50/50 traffic split after initial canary validation, statistical comparison

> [!abstract]
>
> - **Shadow, canary, A/B, and blue-green** trade user exposure against speed and rollback ease
> - On Model Serving, a rollout = a second served entity + `traffic_config` percentages, ramped while monitoring
> - **Route optimization** (set at creation) raises QPS and lowers overhead latency for high-traffic endpoints

> [!tip] What the Exam Tests
>
> - Comparing blue-green and canary for high-traffic, business-critical applications
> - Implementing a rollout strategy with served entities and traffic splits, including rollback
> - Promoting the winner in Unity Catalog with aliases

---

## Deployment Strategy Comparison

```mermaid
sequenceDiagram
    participant U as User Request
    participant R as Traffic Router
    participant C as Champion (100%)
    participant CH as Challenger

    Note over U,CH: Shadow Deployment
    U->>R: Request
    R->>C: 100% traffic
    R-->>CH: Mirror (no response to user)
    C-->>U: Prediction served

    Note over U,CH: Canary Deployment
    U->>R: Request
    R->>C: 90% traffic
    R->>CH: 10% traffic
    C-->>U: Prediction (90% of users)
    CH-->>U: Prediction (10% of users)

    Note over U,CH: Full A/B Test
    U->>R: Request
    R->>C: 50% traffic
    R->>CH: 50% traffic
    C-->>U: Prediction (half users)
    CH-->>U: Prediction (half users)
```

| Strategy | Traffic to Challenger | User Impact | Risk | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Shadow | 0% | None | Lowest | Pre-production validation |
| Canary | 5–25% | Minimal | Low | Gradual rollout |
| A/B Test | 50% | Half users | Medium | Statistical comparison |

## Shadow Deployment

In shadow mode the challenger model receives identical input features as the champion but its
predictions are never returned to users. Instead, challenger outputs are silently logged to a Delta
table for offline analysis. This is the safest way to verify that a new model produces reasonable
predictions before any user is exposed to it.

Shadow deployment is ideal when a model change is architecturally significant (e.g., switching from
a gradient boosted tree to a neural network) and you want to confirm output distributions look sane
before any canary traffic.

```python
import mlflow
import pandas as pd

champion = mlflow.pyfunc.load_model("models:/ml_catalog.models.classifier@champion")
challenger = mlflow.pyfunc.load_model("models:/ml_catalog.models.classifier@challenger")


def predict_with_shadow(features_df, spark):
    champion_preds = champion.predict(features_df)

    # Log challenger predictions silently to Delta for comparison
    shadow_df = features_df.copy()
    shadow_df["challenger_prediction"] = challenger.predict(features_df)
    shadow_df["champion_prediction"] = champion_preds
    shadow_df["timestamp"] = pd.Timestamp.now()

    (spark.createDataFrame(shadow_df)
         .write
         .format("delta")
         .mode("append")
         .saveAsTable("ml.shadow_comparison"))

    # Only the champion prediction is returned to the caller
    return champion_preds
```

The shadow table accumulates challenger predictions over time. You can then run offline metrics
(AUC, RMSE, precision/recall) against the logged outputs before ever touching user-facing traffic.

## Canary Deployment Configuration

Once shadow validation passes, configure traffic splitting directly at the Databricks Model Serving
endpoint. The endpoint routes a small initial fraction of production traffic to the challenger while
the champion continues serving the majority.

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import Route, ServedEntityInput, TrafficConfig

client = WorkspaceClient()

served_entities = [
    ServedEntityInput(
        name="champion",
        entity_name="ml_catalog.fraud_models.fraud_classifier",
        entity_version="3",
        workload_size="Medium",            # sized for production concurrency
        scale_to_zero_enabled=False,       # keep warm for fair latency comparison
    ),
    ServedEntityInput(
        name="challenger",
        entity_name="ml_catalog.fraud_models.fraud_classifier",
        entity_version="4",
        workload_size="Medium",
        scale_to_zero_enabled=False,
    ),
]

# Phase 1: start with 10% canary traffic

client.serving_endpoints.update_config(
    name="fraud-classifier-endpoint",
    served_entities=served_entities,
    traffic_config=TrafficConfig(routes=[
        Route(served_model_name="champion", traffic_percentage=90),
        Route(served_model_name="challenger", traffic_percentage=10),
    ]),
)
```

As confidence grows, increase challenger traffic progressively: 10% → 25% → 50% → 100%.
Each increment should wait until the previous stage has accumulated sufficient samples (typically
thousands of requests per variant) and metrics remain stable.

```python
# Phase 2: increase to 25% after initial validation

client.serving_endpoints.update_config(
    name="fraud-classifier-endpoint",
    served_entities=served_entities,  # same served entities as above
    traffic_config=TrafficConfig(routes=[
        Route(served_model_name="champion", traffic_percentage=75),
        Route(served_model_name="challenger", traffic_percentage=25),
    ]),
)
```

## Inference Tables for Prediction Logging

Inference tables automatically capture every request and response to a Delta table — essential for
offline A/B analysis. You must enable this **before** the test starts; you cannot backfill
historical data.

```python
from databricks.sdk.service.serving import AutoCaptureConfigInput

client.serving_endpoints.update_config(
    name="fraud-classifier-endpoint",
    served_entities=served_entities,
    auto_capture_config=AutoCaptureConfigInput(
        catalog_name="ml_catalog",
        schema_name="inference_logs",
        table_name_prefix="fraud_classifier",
        enabled=True,
    ),
)
```

The legacy inference table schema includes these columns. AI Gateway-enabled inference tables use a different schema; see the platform note in [Model Monitoring](../02-ml-ops/03-model-monitoring-observability.md#inference-tables).

| Column | Description |
| :--- | :--- |
| `databricks_request_id` | Unique request identifier |
| `timestamp_ms` | Epoch milliseconds |
| `request` | Full JSON request body |
| `response` | Full JSON response body |
| `status_code` | HTTP status (200, 4xx, 5xx) |
| `execution_time_ms` | Model inference latency |
| `sampling_fraction` | Fraction of requests captured |
| `client_request_id` | Optional caller-provided ID |
| `request_metadata` | Map with the endpoint name, model name, and model version that served the request |

Use the inference table to compare champion vs. challenger performance directly in SQL:

```sql
SELECT
    request_metadata['model_version']                    AS model_version,
    COUNT(*)                                             AS request_count,
    AVG(execution_time_ms)                               AS avg_latency_ms,
    SUM(CASE WHEN status_code != 200 THEN 1 ELSE 0 END) AS error_count
FROM ml_catalog.inference_logs.fraud_classifier_payload
WHERE date(from_unixtime(timestamp_ms / 1000)) >= current_date() - 7
GROUP BY request_metadata['model_version']
```

## Comparing Deployment Strategies for High-Traffic Applications

| Strategy | How it works on Databricks | Rollback | Cost / risk profile | Fits high traffic when… |
| :--- | :--- | :--- | :--- | :--- |
| **Blue-green** | Two complete environments: "blue" (current) and "green" (new). Traffic switches **all at once**, for example a second endpoint behind the client, or a second served entity flipped 0 % → 100 % | Instant: switch back to blue | Needs full capacity for both versions during cutover. **All users hit the new model at the switch**, so a bad model affects 100 % of traffic until you switch back | The new version is already validated (shadow / staging) and you need a clean, atomic switch |
| **Canary** | Second served entity on the **same endpoint**; `traffic_config` sends 1–10 % to it, then ramps | Set the canary's traffic back to 0 % | Limits the blast radius to the canary share; needs live monitoring during each step | **Default for business-critical, high-traffic endpoints**: real traffic, small exposure, gradual confidence |
| **Shadow** | Champion answers every request; the challenger scores a copy offline or asynchronously | Nothing to roll back; users never see the challenger | Extra compute; no business-outcome measurement | Validating a risky change before any user exposure |
| **A/B test** | Fixed split (for example 50/50) held long enough for statistics | Re-route traffic | Half the users get the challenger | Measuring a business-metric difference, not just safety |

For a **high-traffic, business-critical** model where a failure costs money, the safe combination is:

1. **Scale out** the endpoint for the traffic: choose a workload size (concurrency) that covers peak QPS × model latency.
2. **Enable route optimization** on the endpoint for higher QPS and lower, more stable overhead latency.
3. **Roll out with a canary**: add the new version as a second served entity and **increase its traffic in steps** while monitoring. Don't jump straight to 100 %.

## Implementing a Rollout Strategy with Model Serving

```mermaid
flowchart LR
    A["v3 = 100 %"] --> B["Add v4 as 2nd served entity<br/>v3 95 % / v4 5 %"]
    B --> C{"Healthy?<br/>errors, latency,<br/>prediction drift"}
    C -- yes --> D["v3 75 % / v4 25 %"] --> E["v3 50 % / v4 50 %"] --> F["v4 100 %<br/>remove v3 entity<br/>move @champion alias"]
    C -- no --> R["Rollback: v3 100 % / v4 0 %"]
```

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import Route, TrafficConfig

client = WorkspaceClient()

def set_split(champion_pct: int) -> None:
    """Re-apply the same served entities with a new traffic split."""
    client.serving_endpoints.update_config_and_wait(
        name="fraud-classifier-endpoint",
        served_entities=served_entities,                 # champion (v3) + challenger (v4)
        traffic_config=TrafficConfig(routes=[
            Route(served_model_name="champion", traffic_percentage=champion_pct),
            Route(served_model_name="challenger", traffic_percentage=100 - champion_pct),
        ]),
    )

for champion_pct in (95, 75, 50, 0):
    set_split(champion_pct)
    if not canary_is_healthy("challenger"):              # your check: inference table + endpoint metrics
        set_split(100)                                    # rollback: all traffic back to v3
        break
```

How endpoint updates behave, from the Databricks docs:

- **The old configuration keeps serving until the new one is ready.** A config update doesn't drop traffic, and a **failed update leaves the active config in place** ("Ready (Update failed)") ([Create custom model serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints), [Manage serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/manage-serving-endpoints)).
- **One update at a time.** An in-progress update can be cancelled from the Serving UI. Updates can take several minutes, so ramp in deliberate steps rather than seconds apart.
- **Traffic routes reference served entities by name** (`served_model_name`), and each step's percentages must cover all traffic (100 % total).
- **Promote in the registry too.** After the challenger reaches 100 %, move the `@champion` alias to v4 and keep `previous_champion` on v3 (see below).

## Route Optimization for High-Traffic Endpoints

Route optimization improves the network path between the client and the model. It unlocks **higher QPS** than non-optimized endpoints and gives **lower, more stable overhead latency** ([Route optimization](https://docs.databricks.com/aws/en/machine-learning/model-serving/route-optimization)).

```python
from databricks.sdk.service.serving import EndpointCoreConfigInput, ServedEntityInput

client.serving_endpoints.create(
    name="fraud-classifier-ro",
    route_optimized=True,                 # set at creation time only
    config=EndpointCoreConfigInput(served_entities=served_entities),
)
```

| Fact | Exam implication |
| :--- | :--- |
| Set `route_optimized=True` **when the endpoint is created**. Existing endpoints can't be updated to become route optimized | Plan it up front. For an existing endpoint, create a new route-optimized endpoint and cut clients over |
| Available for **custom model** and **feature serving** endpoints; not for Foundation Model APIs or external models | It applies to classic ML serving, which is what this exam covers |
| Queries use a **dedicated URL** and require **OAuth** tokens (no personal access tokens) | Client code and secrets change when you switch |
| Recommended for endpoints with high QPS and throughput requirements | Pairs with horizontal scale-out for high-traffic rollouts |

## Statistical Significance

Never declare a winner based on gut feeling or a small sample. Two-sample statistical tests
quantify whether observed metric differences are likely real or due to chance.

```python
from scipy import stats
import numpy as np


def test_significance(champion_outcomes, challenger_outcomes, alpha=0.05):
    """Two-sample t-test for continuous metrics (e.g., revenue per session)."""
    t_stat, p_value = stats.ttest_ind(champion_outcomes, challenger_outcomes)

    print(f"Champion mean:  {np.mean(champion_outcomes):.4f}")
    print(f"Challenger mean: {np.mean(challenger_outcomes):.4f}")
    print(f"p-value: {p_value:.4f}")
    print(f"Significant at alpha={alpha}: {p_value < alpha}")

    return p_value < alpha


def minimum_sample_size(effect_size, alpha=0.05, power=0.8):
    """Estimate required samples per variant before running the test."""
    from statsmodels.stats.power import TTestIndPower

    analysis = TTestIndPower()
    n = analysis.solve_power(effect_size=effect_size, alpha=alpha, power=power)
    return int(n)
```

Key warning: **statistical significance does not equal business significance.** A 0.001 AUC
improvement with p < 0.05 may not justify the operational overhead of a model rollout. Always
pair statistical tests with a minimum effect size threshold agreed upon with stakeholders before
the experiment begins (not after seeing the results).

## Champion Replacement Decision Framework

Use explicit, pre-agreed criteria to decide the outcome of every experiment:

| Decision | Criteria |
| :--- | :--- |
| Promote challenger | Metric improvement > threshold AND latency within SLA AND error rate unchanged AND statistical significance confirmed |
| Keep champion | Improvement below threshold OR sample size insufficient |
| Roll back challenger | Challenger error rate spikes OR latency SLA breached |

```python
from mlflow import MlflowClient


def promote_challenger_to_champion(
    model_name: str,
    challenger_version: str,
    champion_version: str,
    challenger_auc: float,
    champion_auc: float,
    min_improvement: float = 0.01,
) -> bool:
    client = MlflowClient(registry_uri="databricks-uc")

    if challenger_auc > champion_auc + min_improvement:
        # Preserve a rollback alias before promoting
        client.set_registered_model_alias(
            name=model_name,
            alias="previous_champion",
            version=champion_version,
        )
        # Move the champion alias to the winning challenger
        client.set_registered_model_alias(
            name=model_name,
            alias="champion",
            version=challenger_version,
        )
        print(f"Promoted version {challenger_version} to champion")
        return True

    print(f"Challenger did not meet threshold. Keeping champion v{champion_version}")
    return False
```

After promotion, update the serving endpoint traffic config to route 100% of traffic to the new
champion version and remove the old served model from the endpoint configuration.

## Common Pitfalls

- **Enabling inference tables after the test starts** — you lose historical requests and cannot
  reconstruct the comparison dataset
- **Allowing scale-to-zero on canary endpoints** — cold-start latency inflates challenger latency
  measurements and biases the comparison
- **Declaring a winner from 100 samples** — need hundreds to thousands of samples per variant
  before statistical tests are meaningful
- **Ignoring seasonality** — weekend traffic patterns differ from weekday; run tests across
  representative time windows
- **Not archiving the old champion alias** — without the `previous_champion` alias you have no
  clean rollback path if issues emerge post-promotion

## Practice Questions

> [!success]- Question 1: Shadow vs Canary
>
> **When should you choose shadow deployment over canary deployment?**
>
> A) When you want the fastest path to production
> B) When you need zero user impact during validation and can accept offline-only comparison
> C) When statistical significance must be calculated from live traffic
> D) When the challenger model has already passed staging integration tests
>
> **Correct Answer: B**
>
> Shadow deployment routes 0% of traffic to the challenger for user-visible predictions. It is the
> right choice when you want to verify that a new model produces sensible output distributions and
> runs without errors before any real user is exposed to it. The trade-off is that you can only
> compare predictions offline — you cannot measure business outcomes like click-through or revenue
> impact because users never see the challenger's predictions.

---

> [!success]- Question 2: Valid A/B Comparison
>
> **What two conditions must be met before you can validly declare an A/B test winner?**
>
> A) Both models must use the same hyperparameters
> B) Sufficient sample size per variant AND statistical significance test confirms the difference is not due to chance
> C) The test must run for exactly 14 days
> D) The champion and challenger must be the same model architecture
>
> **Correct Answer: B**
>
> A minimum sample size (calculated from expected effect size, alpha, and statistical power before
> the test) ensures the experiment is adequately powered. Once that sample size is reached, a
> statistical significance test (e.g., two-sample t-test, chi-squared) quantifies whether the
> observed metric difference is likely real. Neither condition alone is sufficient: large samples
> without a significance test may yield obviously noisy conclusions, and a p-value from 50 samples
> is unreliable.

---

> [!success]- Question 3: Model Registry After Promotion
>
> **After the Databricks serving endpoint is updated to send 100% traffic to the new champion
> model version, what additional step must be taken in the Unity Catalog Model Registry?**
>
> A) Delete the old model version to save storage
> B) Move the `champion` alias from the old version to the new version
> C) Create a new registered model with the challenger's name
> D) Change the model's tags from `challenger` to `champion`
>
> **Correct Answer: B**
>
> The `champion` alias in Unity Catalog is the authoritative pointer that downstream jobs, batch
> scoring pipelines, and monitoring tools use to load the production model. Moving traffic at the
> serving endpoint level alone does not update the registry alias. You must call
> `client.set_registered_model_alias(name=model_name, alias="champion", version=new_version)` to
> keep the registry and the endpoint in sync. It is also good practice to set a
> `previous_champion` alias on the old version as a rollback handle before overwriting `champion`.

## Use Cases

- **Safe Model Rollout for Credit Scoring**: Using canary deployment to route 5% of traffic to a retrained credit-scoring model, monitoring approval-rate and default-rate metrics for 48 hours before scaling to 100%.
- **Multi-Variant Recommendation Testing**: Running a three-way A/B test (collaborative filtering vs content-based vs hybrid) on a recommendation endpoint, using inference tables and a two-sample t-test to select the variant that maximises click-through rate.

## Common Issues & Errors

### Inference Table Not Capturing Requests

**Scenario:** After enabling an A/B test, the inference table is empty or missing requests, making it impossible to compare variants.
**Fix:** Enable the inference table on the endpoint BEFORE starting the test -- historical requests cannot be backfilled retroactively. Verify the table exists in the expected catalog/schema with `spark.table("catalog.schema.endpoint_name_payload")`.

### A/B Test Shows No Statistical Significance

**Scenario:** After running a 50/50 A/B test for several days, the p-value remains above 0.05 despite a visible difference in mean metrics.
**Fix:** Verify sample size is sufficient (hundreds to thousands per variant). Short tests or low-traffic endpoints need longer run times. If the true effect size is small (e.g., 0.002 AUC improvement), you may need tens of thousands of samples. Consider whether the improvement justifies the operational cost of the rollout even if statistically significant.

## Exam Tips

> [!tip]
>
> - "High-traffic, business-critical, roll out safely" means **scale out + route optimization + canary** (second served entity, traffic increased incrementally while monitoring). Jumping to 100 % at once is the unsafe distractor.
> - Blue-green is an **all-at-once switch with fast rollback**. Canary is **gradual exposure**. Shadow is **zero exposure**.
> - Route optimization can only be enabled **at endpoint creation**, and it needs OAuth tokens and the dedicated URL.
> - During an endpoint config update, the **previous configuration keeps serving** until the new one is ready.

## Key Takeaways

- **Strategies**: Shadow (0% traffic, offline comparison only), Canary (5–25%, gradual live rollout), A/B test (50/50 split, statistical comparison), Blue-green (all-at-once switch, instant rollback)
- **Rollout on Model Serving**: second served entity + `traffic_config` steps; old config keeps serving during updates; rollback = route 100 % back
- **Route optimization**: higher QPS / lower overhead latency; creation-time only; OAuth + dedicated URL
- **Inference tables**: Must enable BEFORE the test starts — historical requests cannot be backfilled after the fact
- **`scale_to_zero=False` during tests**: Cold-start latency unfairly inflates challenger latency measurements and biases comparisons
- **Statistical significance**: Two-sample t-test; need hundreds-to-thousands of samples per variant — never declare a winner from fewer than ~100 samples
- **Promoting the winner**: Update the `champion` alias in the Model Registry AND update the endpoint traffic config to 100%
- **Rollback safety**: Set `previous_champion` alias on the old version BEFORE overwriting `champion`
- **Statistical vs business significance**: A p < 0.05 result with a 0.001 AUC improvement may not justify the rollout cost

## Related Topics

- [Model Serving & Deployment](./01-model-serving-deployment.md)
- [Model Lifecycle Orchestration](../02-ml-ops/02-model-lifecycle-orchestration.md)
- [Model Monitoring & Observability](../02-ml-ops/03-model-monitoring-observability.md)

## Official Documentation

- [Serve multiple models to a model serving endpoint](https://docs.databricks.com/aws/en/machine-learning/model-serving/serve-multiple-models-to-serving-endpoint)
- [Create custom model serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints)
- [Route optimization on serving endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/route-optimization)
- [Monitor model quality and endpoint health](https://docs.databricks.com/aws/en/machine-learning/model-serving/monitor-diagnose-endpoints)

---

**[← Previous: Model Serving and Deployment](./01-model-serving-deployment.md) | [↑ Back to Model Deployment](./README.md)**

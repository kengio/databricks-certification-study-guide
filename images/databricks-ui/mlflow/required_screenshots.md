# Screenshots: MLflow & Mosaic AI Model Serving

Screenshots for MLflow tracking (experiments, runs), the Unity Catalog Model Registry, and Mosaic AI Model Serving endpoints.

## Inventory

| File | Purpose | Referenced from |
| :--- | :--- | :--- |
| `mlflow_experiment_runs.png` | MLflow Experiment UI — list of runs with metrics columns | `certifications/ml-associate/03-ml-workflows/02-experiments-runs.md` |
| `mlflow_run_details.png` | Single MLflow run — params, metrics, tags, artifacts | `certifications/ml-associate/03-ml-workflows/02-experiments-runs.md` |
| `model_registry_versions.png` | UC Model Registry — multiple versions with aliases (Champion/Challenger/Production) | `certifications/ml-associate/04-model-deployment/01-model-registry.md` |
| `model_serving_endpoint.png` | Mosaic AI Model Serving endpoint config + status | `certifications/ml-associate/04-model-deployment/02-model-deployment-serving.md` |

> [!note]
> The legacy MLflow stage system (Staging / Production / Archived) is deprecated. Current Databricks uses **aliases** (e.g., `Champion`, `Challenger`, `Production`) on the UC Model Registry. New screenshots should reflect the alias-based UI.

## Contributing new screenshots

When adding new screenshots:

- Keep them ≤ 800 px wide (CLAUDE.md convention)
- Use `snake_case.png` matching this folder's existing convention
- Reference them from the appropriate topic file with `![Alt text](../../../images/databricks-ui/mlflow/<file>.png)` and an italic caption
- Update the inventory table above

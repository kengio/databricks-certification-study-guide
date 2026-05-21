# Screenshots: Lakeflow Declarative Pipelines

Screenshots for the Databricks product formerly known as Delta Live Tables (now **Lakeflow Declarative Pipelines**). The folder name `dlt/` is preserved for back-compat with the `dlt` Python module.

## Inventory

| File | Purpose | Referenced from |
| :--- | :--- | :--- |
| `dlt_pipeline_graph.png` | Pipeline DAG view showing Bronze → Silver → Gold flow | `certifications/data-engineer-professional/01-developing-code-for-data-processing/06-declarative-pipelines.md` |
| `dlt_pipeline_settings.png` | Pipeline configuration UI — target schema, dev mode, continuous/triggered | `certifications/data-engineer-professional/01-developing-code-for-data-processing/06-declarative-pipelines.md` |
| `dlt_cluster_autoscale.png` | Enhanced autoscaling configuration for a pipeline cluster | `certifications/data-engineer-professional/01-developing-code-for-data-processing/06-declarative-pipelines.md` |
| `dlt_data_quality_metrics.png` | Expectation pass/fail/drop metrics on a table in the DAG view | `certifications/data-engineer-professional/03-data-transformation-cleansing-quality/03-expectations-data-quality.md` |

## Contributing new screenshots

When adding new screenshots:

- Keep them ≤ 800 px wide (CLAUDE.md convention)
- Use `snake_case.png` matching this folder's existing convention
- Reference them from the appropriate topic file with `![Alt text](../../../images/databricks-ui/dlt/<file>.png)` and an italic caption
- Update the inventory table above

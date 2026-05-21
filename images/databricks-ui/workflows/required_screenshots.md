# Screenshots: Lakeflow Jobs (formerly Databricks Workflows)

Screenshots for the Databricks Jobs scheduling product (now **Lakeflow Jobs**, formerly Databricks Workflows). The folder name `workflows/` and the `workflow_*.png` file prefixes are preserved for back-compat with existing references.

## Inventory

| File | Purpose | Referenced from |
| :--- | :--- | :--- |
| `workflow_dag_view.png` | Job DAG visualizer showing task dependencies | `certifications/data-engineer-professional/01-developing-code-for-data-processing/07-lakeflow-jobs-part1.md` |
| `workflow_task_types.png` | Job task creation sidebar — Notebook, Python, dbt, SQL, Pipeline task types | `certifications/data-engineer-professional/01-developing-code-for-data-processing/07-lakeflow-jobs-part1.md` |
| `workflow_trigger_schedule.png` | Job scheduling UI — Cron, continuous, file-arrival triggers | `certifications/data-engineer-professional/01-developing-code-for-data-processing/07-lakeflow-jobs-part2.md` |
| `workflow_run_matrix.png` | Job Runs matrix view tracking historical success/failure | `certifications/data-engineer-professional/01-developing-code-for-data-processing/07-lakeflow-jobs-part2.md` |

## Contributing new screenshots

When adding new screenshots:

- Keep them ≤ 800 px wide (CLAUDE.md convention)
- Use `snake_case.png` matching this folder's existing convention
- Reference them from the appropriate topic file with `![Alt text](../../../images/databricks-ui/workflows/<file>.png)` and an italic caption
- Update the inventory table above

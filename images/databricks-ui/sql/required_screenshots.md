# Screenshots: Databricks SQL

Screenshots for Databricks SQL — SQL Warehouses (serverless + classic), SQL Editor, Dashboards, and SQL Alerts.

## Inventory

| File | Purpose | Referenced from |
| :--- | :--- | :--- |
| `sql_warehouse_creation.png` | SQL Warehouse creation UI highlighting the Serverless toggle | `certifications/data-engineer-professional/02-cost-and-performance-optimization/09-databricks-compute.md` |
| `sql_editor_query_profile.png` | SQL Editor with the Query Profile pane open on an executed query | `certifications/data-engineer-professional/04-monitoring-and-alerting/03-query-profiler.md` |
| `sql_dashboard_parameters.png` | Dashboard showing interactive parameter widgets | `certifications/data-engineer-professional/01-developing-code-for-data-processing/08-workspace-and-notebooks.md` |
| `sql_alerts_configuration.png` | SQL Alert configuration — threshold + notification | `certifications/data-engineer-professional/04-monitoring-and-alerting/02-lakeflow-event-logs.md` |

## Contributing new screenshots

When adding new screenshots:

- Keep them ≤ 800 px wide (CLAUDE.md convention)
- Use `snake_case.png` matching this folder's existing convention
- Reference them from the appropriate topic file with `![Alt text](../../../images/databricks-ui/sql/<file>.png)` and an italic caption
- Update the inventory table above

# Screenshots: Unity Catalog Explorer

Screenshots for Unity Catalog — namespace hierarchy (catalog / schema / table) and column-level lineage.

## Inventory

| File | Purpose | Referenced from |
| :--- | :--- | :--- |
| `namespace-hierarchy.png` | Catalog Explorer showing the three-level UC namespace (catalog → schema → table) | `shared/fundamentals/unity-catalog-basics.md` |
| `lineage-graph.png` | UC lineage visualization (table-level + column-level) | `shared/fundamentals/unity-catalog-basics.md` |

## Contributing new screenshots

When adding new screenshots:

- Keep them ≤ 800 px wide (CLAUDE.md convention)
- Use `kebab-case.png` matching this folder's existing convention
- Reference them from the appropriate topic file with `![Alt text](../../images/databricks-ui/catalog-explorer/<file>.png)` and an italic caption
- Update the inventory table above

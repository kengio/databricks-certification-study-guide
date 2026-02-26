---
tags: [cheat-sheet, unity-catalog, data-engineer-professional]
---

# Unity Catalog — DE Professional Supplement

> For the full Unity Catalog reference (object creation, permissions, external locations, Delta Sharing), see
> [shared/cheat-sheets/unity-catalog-quick-ref.md](../../../../shared/cheat-sheets/unity-catalog-quick-ref.md).

This file covers DE Professional-specific patterns not in the shared reference.

---

## Permission Inheritance

```text
CATALOG (USE CATALOG)
    │
    └── SCHEMA (USE SCHEMA)  ← Requires USE CATALOG on parent
            │
            └── TABLE (SELECT)  ← Requires USE SCHEMA on parent
```

**Rule**: Accessing a table always requires `USE CATALOG` + `USE SCHEMA` + `SELECT`.

### Bulk Grant on Schema

```sql
-- Grant SELECT on all tables in a schema at once
GRANT SELECT ON ALL TABLES IN SCHEMA my_catalog.my_schema TO `analysts`;

-- Grant to groups (best practice — not individuals)
GRANT SELECT ON TABLE my_table TO `data_analysts_group`;
```

---

## System Tables for Audit & Governance

```sql
-- Audit log: who accessed what and when
SELECT * FROM system.access.audit
WHERE action_name = 'getTable'
  AND request_params.full_name_arg = 'my_catalog.my_schema.my_table';

-- Catalog metadata
SELECT * FROM system.information_schema.catalogs;

-- Table metadata
SELECT * FROM system.information_schema.tables
WHERE table_catalog = 'my_catalog';

-- Column metadata
SELECT * FROM system.information_schema.columns
WHERE table_catalog = 'my_catalog'
  AND table_schema = 'my_schema';
```

| System Table | Description |
|--------------|-------------|
| `system.access.audit` | Audit logs for all UC actions |
| `system.information_schema.catalogs` | Catalog metadata |
| `system.information_schema.tables` | Table metadata |
| `system.information_schema.columns` | Column metadata |

---

## Volume Access Path

```python
# Volumes are accessed via /Volumes/<catalog>/<schema>/<volume>/<path>

df = spark.read.csv("/Volumes/my_catalog/my_schema/my_volume/data.csv")
dbutils.fs.ls("/Volumes/my_catalog/my_schema/my_volume/")
```

---

## Security Functions

| Function | Description |
|----------|-------------|
| `current_user()` | Current user's email |
| `is_account_group_member('group')` | Check account-level group membership |
| `is_member('group')` | Check workspace-level group membership |
| `current_user_attribute('attr')` | Get a custom user attribute value |

---

## DE Professional Exam Tips

1. Three-level namespace: `catalog.schema.table`
2. `USE CATALOG` + `USE SCHEMA` both required before `SELECT` resolves
3. Metastore is **account-level**, not workspace-level
4. Grant to groups, not individuals — best practice for exam questions
5. Dynamic views enable row/column security without data duplication
6. `current_user()` and `is_account_group_member()` are the key security filter functions
7. Volume path format: `/Volumes/catalog/schema/volume/path`
8. Owners can grant any privilege on their objects (no explicit grant needed for owner)
9. External locations require a storage credential to exist first
10. `system.access.audit` is the primary table for UC audit logging questions
